// Detectors for routing and downgrades. Pure functions, import constants if needed.

export function isRegressionRestore(prAnalysis) {
  const t = (prAnalysis.title || '').toLowerCase();
  const b = (prAnalysis.body || '').toLowerCase();
  const text = `${t} ${b}`;
  return /regression|restore|restored|revert|reverted|align with|parity with|back to expected/.test(text);
}

export function isFeatureParityRestoration(prAnalysis) {
  const t = (prAnalysis.title || '').toLowerCase();
  const b = (prAnalysis.body || '').toLowerCase();
  const text = `${t} ${b}`;
  const parityHit = /parity\s+with\s+v4|v4\s*->?\s*v5|v4\s*to\s*v5|restored?\s+(field|option|setting)|missing\s+(field|option|setting)\s+restored/.test(text);
  if (!parityHit) return false;
  const files = prAnalysis.files || [];
  const configArea = files.some(f => /(content[-_]?manager|content[-_]?type[-_]?builder|admin|server|config)/i.test(f.filename));
  return configArea;
}

export function isUploadRestriction(prAnalysis) {
  const title = (prAnalysis.title || '').toLowerCase();
  const body = (prAnalysis.body || '').toLowerCase();
  const text = `${title} ${body}`;
  const mentionsUpload = /(upload|media)\b/.test(text);
  const mentionsTypes = /(allowedtypes|deniedtypes|mime|mimetype|content[- ]?type|file\s*type)/i.test(text);
  if (mentionsUpload && mentionsTypes) return true;
  const files = prAnalysis.files || [];
  const inUploadArea = files.some(f => /upload/i.test(f.filename));
  if (!inUploadArea) return false;
  const additions = [];
  for (const f of files) {
    const patch = String(f.patch || '');
    const lines = patch.split(/\r?\n/);
    for (const line of lines) if (line.startsWith('+')) additions.push(line.slice(1));
  }
  return additions.some(l => /(allowedTypes|deniedTypes|mime|mimetype|content[- ]?type)/i.test(l));
}

export function isMicroUiChange(prAnalysis) {
  const files = prAnalysis.files || [];
  const title = (prAnalysis.title || '').toLowerCase();
  const body = (prAnalysis.body || '').toLowerCase();
  const text = `${title} ${body}`;
  const cosmeticKeywords = /(spacing|padding|margin|border|radius|shadow|color|alignment|align|tooltip|hover|placeholder|icon|font|typo|typo\b|spelling|typo fix|translation|locale|i18n)/i;
  const onlyStyleFiles = files.length > 0 && files.every(f => /\.(css|scss|less|svg)$/.test(f.filename));
  const mostlyStyleDirs = files.length > 0 && files.every(f => /(^|\/)admin(\/)?.*\.(css|scss|less)$/.test(f.filename) || /theme|styles|style|css/i.test(f.filename));
  return cosmeticKeywords.test(text) || onlyStyleFiles || mostlyStyleDirs;
}

export function hasStrongDocsSignals(prAnalysis) {
  const files = prAnalysis.files || [];
  const title = (prAnalysis.title || '').toLowerCase();
  const body = (prAnalysis.body || '').toLowerCase();

  const configFile = (f) => /(^|\/)config(\/|$)|config\.(js|ts|mjs|cjs)$/i.test(f.filename);
  const addedLines = [];
  for (const f of files) {
    const patch = String(f.patch || '');
    const lines = patch.split(/\r?\n/);
    for (const line of lines) if (line.startsWith('+')) addedLines.push(line.slice(1));
  }

  const routeFile = (f) => /routes?\.(js|ts|json)$/i.test(f.filename);
  const controllerFile = (f) => /controllers?\.(js|ts)$/i.test(f.filename);

  const hasEnv = addedLines.some(l => /process\.env\.[A-Z0-9_]+/.test(l));
  const hasExportConfig = files.some(f => configFile(f) && /module\.exports|export\s+default|defineConfig/.test(String(f.patch || '')));
  const hasHttpVerbs = addedLines.some(l => /\b(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\b/i.test(l));
  const hasRouteDefs = files.some(f => (routeFile(f) || controllerFile(f)) && /routes?:|router\.|ctx\./i.test(String(f.patch || '')));
  const hasGraphQL = files.some(f => /graphql/i.test(f.filename) || /type\s+\w+\s*\{|schema\{|SDL|gql`/i.test(String(f.patch || '')));
  const hasRestSchema = files.some(f => /openapi|swagger|paths\s*:/i.test(String(f.patch || '')));
  const hasCli = addedLines.some(l => /(^|\s)--[a-z0-9][a-z0-9-]*/.test(l) || /yargs|commander\(|program\.option\(/i.test(l));
  const schemaFile = (f) => /(^|\/)content-types?(\/|$)|schema\.(json|js|ts)$/i.test(f.filename);
  const hasSchema = files.some(f => schemaFile(f) && /(attributes|type\s*:|enum\s*:|relation\s*:)/i.test(String(f.patch || '')));
  const hasMigrationSignals = /\b(breaking|deprecat|migration|rename\s+(setting|option|property)|v4\s*->?\s*v5|v4\s*to\s*v5|parity\s+with\s+v4)\b/i.test(title + ' ' + body);
  const proxyAuthTokensBody = /ctx\.request\.secure|trust\s+proxy|reverse\s+proxy|x-forwarded-proto|cookie\s+secure|secure\s+cookie|same\s*site|samesite|csrf|cors|jwt|bearer|token|authentication|authorize|session/i;
  const proxyAuthTokensAdd = /ctx\.request\.secure|trust\s*proxy|x-forwarded-proto|set-cookie|sameSite|samesite|secure\s*[:=]\s*true|jwt|bearer|token|auth|session/i;
  const hasProxyAuthBody = proxyAuthTokensBody.test(title + ' ' + body);
  const hasProxyAuthAdd = addedLines.some(l => proxyAuthTokensAdd.test(l));
  const uploadTokensBody = /(upload|media)\b.*(mime|content[- ]?type|file\s*type|allowed\s*types|denied\s*types)/i;
  const uploadTokensAdd = /(allowedTypes|deniedTypes|mime|mimetype|content[- ]?type)/i;
  const uploadPathHit = files.some(f => /upload/i.test(f.filename));
  const hasUploadBody = uploadTokensBody.test(title + ' ' + body);
  const hasUploadAdd = addedLines.some(l => uploadTokensAdd.test(l));

  return (
    hasEnv || hasExportConfig || hasHttpVerbs || hasRouteDefs || hasGraphQL || hasRestSchema || hasCli || hasSchema || hasMigrationSignals || hasProxyAuthBody || hasProxyAuthAdd || ((uploadPathHit || hasUploadBody) && hasUploadAdd)
  );
}

