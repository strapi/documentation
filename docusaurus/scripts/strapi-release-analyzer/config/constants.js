// Centralized tunable constants and regex/pattern lists
//
// What this file is for
// - Keep all tweakable keywords, regexes and section mappings in one place so
//   we can tune heuristics without touching logic.
// - These values are consumed by utils/* helpers and the entrypoint to classify
//   PRs, pick candidate docs pages, and improve LLM grounding.
//
// Where each export is used
// - DOCUMENTATION_SECTIONS: referenced by categorizePRByDocumentation() to label
//   the area a PR touches (for report grouping, future routing, or analytics).
// - SPECIFIC_AREA_PATTERNS: used inside categorizePRByDocumentation() to map
//   common keywords/paths to a more precise section label.
// - YES_PATH_PATTERNS: used by classifyImpact() to quickly flag user‑facing
//   paths as docs‑relevant even when titles are vague.
// - FEATURE_HINTS: used by collectHighSignalTokens() to boost tokens when the
//   PR title mentions key Strapi features (helps candidate page selection and
//   coverage checks).
// - GENERIC_DROP_TOKENS: used by collectHighSignalTokens() to ignore generic
//   path fragments that don’t add semantic value (e.g., src, lib, build).
//
// How to extend safely
// - Prefer narrow, specific patterns to avoid false positives.
// - For SPECIFIC_AREA_PATTERNS keys, we store regex source strings (not RegExp
//   objects) because classify helpers compile them with the right flags.
// - When adding a YES_PATH_PATTERNS entry, think “does touching this path almost
//   always imply docs impact?” Keep it conservative to reduce noise.

export const DOCUMENTATION_SECTIONS = {
  cms: {
    label: '🏗️ CMS Documentation',
    sections: {
      'Getting Started': ['quick-start', 'installation', 'admin-panel', 'deployment'],
      'Features': ['api-tokens', 'audit-logs', 'content-history', 'custom-fields', 'data-management',
                   'draft-and-publish', 'email', 'internationalization', 'i18n', 'media-library',
                   'preview', 'rbac', 'releases', 'review-workflows', 'sso', 'users-permissions',
                   'content-manager', 'content-type-builder'],
      'APIs': ['rest', 'graphql', 'document', 'content-api', 'query-engine'],
      'Configurations': ['database', 'server', 'admin-panel-config', 'middlewares', 'api-config',
                         'environment', 'typescript', 'features-config'],
      'Development': ['backend', 'customization', 'lifecycle', 'services', 'controllers', 'routes',
                      'policies', 'middlewares-dev', 'webhooks'],
      'TypeScript': ['typescript'],
      'CLI': ['cli', 'command'],
      'Plugins': ['plugins', 'plugin-development', 'marketplace'],
      'Upgrades': ['migration', 'upgrade', 'v4-to-v5'],
    }
  },
  cloud: {
    label: '☁️ Cloud Documentation',
    sections: {
      'Getting Started': ['deployment', 'cloud-fundamentals', 'usage-billing', 'caching'],
      'Projects Management': ['projects', 'settings', 'collaboration', 'runtime-logs', 'notifications'],
      'Deployments': ['deploys', 'deployment-history'],
      'Account Management': ['account', 'profile', 'billing'],
    }
  }
};

export const SPECIFIC_AREA_PATTERNS = {
  'media|upload|asset': { section: 'Features', area: 'Media Library' },
  'i18n|internationalization|locale|translation': { section: 'Features', area: 'Internationalization' },
  'content-manager|content manager': { section: 'Features', area: 'Content Manager' },
  'content-type-builder|content type builder': { section: 'Features', area: 'Content-Type Builder' },
  'rbac|role|permission': { section: 'Features', area: 'RBAC' },
  'review|workflow': { section: 'Features', area: 'Review Workflows' },
  'draft|publish': { section: 'Features', area: 'Draft & Publish' },
  'sso|single sign': { section: 'Features', area: 'SSO' },
  'audit log': { section: 'Features', area: 'Audit Logs' },
  'api token': { section: 'Features', area: 'API Tokens' },
  'rest|/api/rest': { section: 'APIs', area: 'REST API' },
  'graphql': { section: 'APIs', area: 'GraphQL' },
  'document service': { section: 'APIs', area: 'Document Service' },
  'database|\bdb\b': { section: 'Configurations', area: 'Database' },
  'server|middleware': { section: 'Configurations', area: 'Server' },
  'typescript|\.ts': { section: 'TypeScript', area: '' },
  'cli|command': { section: 'CLI', area: '' },
  'plugin': { section: 'Plugins', area: 'Plugin Development' },
  'migration|upgrade': { section: 'Upgrades', area: 'Migration' },
};

export const YES_PATH_PATTERNS = [
  /\b(core|server|strapi)\b/,
  /\b(plugin|plugins)\b/,
  /\badmin\b/,
  /\bcontent(-|_)manager\b/,
  /\bcontent(-|_)type(-|_)builder\b/,
  /\bi18n\b/,
  /\bupload|media\b/,
  /\bgraphql\b/,
  /\busers(-|_)permissions\b/,
  /\bapi\b/,
  /\broutes?\b/,
  /\bcontrollers?\b/,
  /\bservices?\b/,
  /(^|\/)config(\/|$)/,
];

export const FEATURE_HINTS = [
  'content-manager', 'content', 'content-type-builder', 'media-library', 'internationalization', 'i18n',
  'users-permissions', 'review-workflows', 'releases', 'upload', 'email', 'graphql', 'rest', 'admin', 'rbac', 'sso'
];

export const GENERIC_DROP_TOKENS = new Set(['src','lib','dist','build','public','docs','packages','plugin','plugins','api','server','test','tests','ci','config']);
