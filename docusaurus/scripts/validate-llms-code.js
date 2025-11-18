#!/usr/bin/env node

/**
 * llms-code validator
 *
 * Validates the generated static/llms-code.txt structure and metadata:
 * - Section structure and required fields
 * - Balanced code fences and language tags
 * - Recognized languages
 * - File path presence and existence (when --check-files)
 * - Source URL format and optional anchor syntax
 * - Optional anchor verification against source MD/MDX (when --verify-anchors)
 *
 * Exit code:
 * - 0 when clean (no errors; warnings ignored unless --strict)
 * - 1 when errors found (or warnings found with --strict)
 */

let fs = null;
try {
  fs = require('fs-extra');
} catch {
  fs = require('fs');
  fs.ensureDir = async (dir) => fs.promises.mkdir(dir, { recursive: true });
  fs.pathExistsSync = (p) => fs.existsSync(p);
  fs.writeFile = fs.promises.writeFile.bind(fs.promises);
  fs.readFile = fs.promises.readFile.bind(fs.promises);
}
const path = require('path');
const { URL } = require('url');

const DEFAULT_INPUT = path.join('static', 'llms-code.txt');
const DEFAULT_PROJECT_ROOT = path.resolve('..');
const BASE_HOSTS = new Set([
  'docs.strapi.io',
  'localhost',
  '127.0.0.1',
]);

const RECOGNIZED_LANGS = new Set([
  'javascript', 'typescript', 'js', 'ts', 'tsx', 'jsx',
  'json', 'yaml', 'yml',
  'bash', 'zsh', 'fish', 'sh',
  'powershell', 'ps1',
  'sql', 'dockerfile',
  'toml', 'ini', 'env', 'dotenv', 'diff', 'text', 'html', 'graphql',
]);

const DISPLAY_LANG_MAP = new Map([
  ['js', 'javascript'],
  ['ts', 'typescript'],
  ['javascript', 'javascript'],
  ['typescript', 'typescript'],
  ['tsx', 'tsx'],
  ['jsx', 'jsx'],
  ['json', 'json'],
  ['yaml', 'yaml'],
  ['yml', 'yml'],
  ['bash', 'bash'],
  ['shell', 'bash'],
  ['sh', 'bash'],
  ['dotenv', 'env'],
  ['text', 'text'],
  ['plain', 'text'],
  ['txt', 'text'],
  ['html', 'html'],
  ['graphql', 'graphql'],
  ['gql', 'graphql'],
  ['zsh', 'zsh'],
  ['fish', 'fish'],
  ['powershell', 'powershell'],
  ['ps1', 'ps1'],
  ['sql', 'sql'],
  ['dockerfile', 'dockerfile'],
  ['toml', 'toml'],
  ['ini', 'ini'],
  ['env', 'env'],
  ['diff', 'diff'],
]);

function parseArgs() {
  const args = process.argv.slice(2);
  let inputPath = DEFAULT_INPUT;
  let strict = false;
  let report = 'text';
  let checkFiles = false;
  let verifyAnchors = false;
  let projectRoot = DEFAULT_PROJECT_ROOT;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '--path') {
      inputPath = next || inputPath;
      i += 1;
    } else if (arg === '--strict') {
      strict = true;
    } else if (arg === '--report') {
      report = (next || report).toLowerCase();
      i += 1;
    } else if (arg === '--check-files') {
      checkFiles = true;
    } else if (arg === '--verify-anchors') {
      verifyAnchors = true;
    } else if (arg === '--project-root') {
      projectRoot = next ? path.resolve(next) : projectRoot;
      i += 1;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage:\n  node scripts/validate-llms-code.js [--path static/llms-code.txt] [--strict]\n                                     [--check-files] [--verify-anchors]\n                                     [--project-root ..] [--report json|text]`);
      process.exit(0);
    }
  }

  return { inputPath, strict, report, checkFiles, verifyAnchors, projectRoot };
}

function slugifyHeading(text) {
  if (!text) return '';
  const cleaned = String(text)
    .replace(/\{#([A-Za-z0-9\-_]+)\}\s*$/, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[.,\/#!$%^&*;:{}=_`~()"'?<>\[\]|+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  return cleaned
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function extractHeadingId(line) {
  const m = line.match(/^\s*#{1,6}\s+(.+?)\s*(\{#([A-Za-z0-9\-_]+)\})?\s*$/);
  if (!m) return null;
  const [, title, , custom] = m;
  if (custom) return custom;
  return slugifyHeading(title);
}

function collectAnchorsFromDoc(content) {
  const lines = content.split(/\r?\n/);
  const anchors = new Set();
  for (const ln of lines) {
    const id = extractHeadingId(ln);
    if (id) anchors.add(id);
  }
  return anchors;
}

function findDocFileForUrl(sourceUrl, projectRoot) {
  let url;
  try {
    url = new URL(sourceUrl);
  } catch {
    return null;
  }
  const pathname = url.pathname.replace(/\/+$/, '');
  if (!pathname || pathname === '/') return null;

  const candidatesRoots = [
    path.join(projectRoot, 'docusaurus', 'docs'),
    path.join(projectRoot, 'docs'),
    path.join(projectRoot, 'website', 'docs'),
    path.join(projectRoot, 'content', 'docs'),
  ];

  const suffixes = ['', '.mdx', '.md', '/index.mdx', '/index.md'];

  for (const root of candidatesRoots) {
    for (const suf of suffixes) {
      const attempt = path.join(root, pathname + suf);
      if (fs.existsSync(attempt)) return attempt;
    }
  }
  return null;
}

function isAbsoluteHttpUrl(u) {
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeDisplayLang(name) {
  if (!name) return null;
  const key = String(name).trim().toLowerCase();
  return DISPLAY_LANG_MAP.get(key) || null;
}

function fileExistsMaybe(projectRoot, filePath) {
  if (!filePath || filePath === 'N/A') return false;
  const cleaned = filePath.replace(/\s+\(file not found\)\s*$/, '');
  const resolved = path.isAbsolute(cleaned)
    ? cleaned
    : path.resolve(projectRoot, cleaned);
  return fs.existsSync(resolved);
}

function splitSectionsByHeading(inputText) {
  const lines = inputText.split(/\r?\n/);
  const sections = [];
  let current = null;

  const flush = () => {
    if (current) {
      current.endLine = current.startLine + current.lines.length - 1;
      sections.push(current);
      current = null;
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      flush();
      current = {
        titleLine: line,
        title: line.slice(3).trim(),
        startLine: i + 1,
        lines: [line],
      };
    } else if (current) {
      current.lines.push(line);
    }
  }
  flush();
  return sections;
}

function validateSection(section, opts) {
  const { checkFiles, verifyAnchors, projectRoot } = opts;

  const diagnostics = [];
  const lines = section.lines;
  const title = section.title;

  const push = (severity, message, relLineIdx = 0) => {
    diagnostics.push({
      severity,
      message,
      section: title,
      line: section.startLine + relLineIdx,
    });
  };

  if (!lines[0] || !lines[0].startsWith('## ')) {
    push('error', 'Section does not start with "## " heading', 0);
    return diagnostics;
  }

  let idx = 1;
  const findLineIndex = (re, start) => {
    for (let i = start; i < lines.length; i += 1) {
      if (re.test(lines[i])) return i;
    }
    return -1;
  };

  while (idx < lines.length && lines[idx].trim() === '') idx += 1;

  const descIdx = lines[idx] && /^Description:\s*/i.test(lines[idx]) ? idx : -1;
  if (descIdx === -1) {
    push('error', 'Missing "Description:" line', idx);
    return diagnostics;
  }
  const desc = lines[descIdx].replace(/^Description:\s*/i, '').trim();
  if (!desc) {
    push('error', '"Description:" is empty', descIdx);
  } else if (/^(tbd|todo|n\/a|1|none)$/i.test(desc)) {
    push('warning', 'Description appears placeholder-like', descIdx);
  }
  idx = descIdx + 1;

  while (idx < lines.length && lines[idx].trim() === '') idx += 1;

  if (!lines[idx] || !/^\(Source:\s*.+\)$/.test(lines[idx])) {
    push('error', 'Missing or malformed "(Source: ...)" line', idx);
    return diagnostics;
  }
  const sourceLine = lines[idx];
  const sourceUrl = sourceLine.replace(/^\(Source:\s*/i, '').replace(/\)\s*$/, '').trim();
  if (!isAbsoluteHttpUrl(sourceUrl)) {
    push('error', 'Source is not an absolute URL', idx);
  } else {
    try {
      const u = new URL(sourceUrl);
      if (!BASE_HOSTS.has(u.hostname)) {
        push('warning', `Source host not in known set: ${u.hostname}`, idx);
      }
    } catch {
      push('error', 'Source URL failed to parse', idx);
    }
  }

  let sourceAnchor = null;
  try {
    const u = new URL(sourceUrl);
    sourceAnchor = u.hash ? u.hash.replace(/^#/, '') : null;
  } catch {}
  idx += 1;

  let sawAnyVariant = false;
  while (idx < lines.length) {
    if (lines[idx].startsWith('## ')) break;
    while (idx < lines.length && lines[idx].trim() === '') idx += 1;
    if (idx >= lines.length || lines[idx].startsWith('## ')) break;

    if (lines[idx].trim() === '---') {
      idx += 1;
      while (idx < lines.length && lines[idx].trim() === '') idx += 1;
    }

    if (!lines[idx] || !/^Language:\s*/i.test(lines[idx])) {
      if (!sawAnyVariant) push('error', 'Missing "Language:" before code block', idx);
      break;
    }
    const displayLangRaw = lines[idx].replace(/^Language:\s*/i, '').trim();
    const canonicalLang = normalizeDisplayLang(displayLangRaw);
    if (!canonicalLang) {
      push('error', `Unrecognized language: ${displayLangRaw}`, idx);
    } else if (!RECOGNIZED_LANGS.has(canonicalLang)) {
      push('warning', `Language recognized but not in allowlist: ${canonicalLang}`, idx);
    }
    idx += 1;

    if (!lines[idx] || !/^File path:\s*/i.test(lines[idx])) {
      push('error', 'Missing "File path:" line', idx);
      break;
    }
    const filePathValue = lines[idx].replace(/^File path:\s*/i, '').trim();
    if (!filePathValue) {
      push('error', '"File path:" is empty', idx);
    } else if (checkFiles) {
      const exists = fileExistsMaybe(projectRoot, filePathValue);
      if (!exists) {
        push('error', `Referenced file does not exist: ${filePathValue}`, idx);
      }
    }
    idx += 1;

    while (idx < lines.length && lines[idx].trim() === '') idx += 1;

    const fenceStart = lines[idx] || '';
    const fenceStartMatch = fenceStart.match(/^```([a-z0-9]+)\s*$/i);
    if (!fenceStartMatch) {
      push('error', 'Missing opening code fence ```<lang>', idx);
      break;
    }
    const fenceLang = fenceStartMatch[1].toLowerCase();
    const fenceCanonical = normalizeDisplayLang(fenceLang) || fenceLang;
    if (canonicalLang && fenceCanonical !== canonicalLang) {
      push('error', `Fence language "${fenceLang}" does not match declared Language "${displayLangRaw}"`, idx);
    }
    idx += 1;

    let closed = false;
    while (idx < lines.length) {
      if (/^```/.test(lines[idx])) {
        closed = true;
        idx += 1;
        break;
      }
      idx += 1;
    }
    if (!closed) {
      push('error', 'Unclosed code fence', idx);
      break;
    }

    sawAnyVariant = true;
  }

  if (!sawAnyVariant) {
    push('error', 'No code example variants found in section', 0);
  }

  if (verifyAnchors && sourceAnchor) {
    const docFile = findDocFileForUrl(sourceUrl, projectRoot);
    if (!docFile) {
      push('warning', `Could not locate local doc file for source to verify anchor: ${sourceUrl}`, 0);
    } else {
      try {
        const raw = fs.readFileSync(docFile, 'utf8');
        const anchors = collectAnchorsFromDoc(raw);
        if (!anchors.has(sourceAnchor)) {
          push('error', `Anchor "#${sourceAnchor}" not found in ${path.relative(projectRoot, docFile)}`, 0);
        }
      } catch (e) {
        push('warning', `Failed reading doc for anchor verification: ${e.message}`, 0);
      }
    }
  }

  return diagnostics;
}

(async function main() {
  const args = parseArgs();
  const { inputPath, strict, report, checkFiles, verifyAnchors, projectRoot } = args;

  if (!fs.existsSync(inputPath)) {
    console.error(`ERROR: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const raw = await fs.readFile(inputPath, 'utf8');
  const sections = splitSectionsByHeading(raw);

  const diagnostics = [];
  for (const sec of sections) {
    const diags = validateSection(sec, { checkFiles, verifyAnchors, projectRoot });
    diagnostics.push(...diags);
  }

  const errors = diagnostics.filter(d => d.severity === 'error');
  const warnings = diagnostics.filter(d => d.severity === 'warning');

  if (report === 'json') {
    console.log(JSON.stringify({ errors, warnings, count: diagnostics.length }, null, 2));
  } else {
    for (const d of diagnostics) {
      const tag = d.severity.toUpperCase();
      const loc = d.line ? `:${d.line}` : '';
      console.log(`[${tag}] ${d.section}${loc} - ${d.message}`);
    }
    if (diagnostics.length === 0) {
      console.log('llms-code validation passed: no issues found.');
    } else {
      console.log(`\nSummary: ${errors.length} error(s), ${warnings.length} warning(s)`);
    }
  }

  const exitWithError = errors.length > 0 || (strict && warnings.length > 0);
  process.exit(exitWithError ? 1 : 0);
})().catch((e) => {
  console.error('Validator crashed:', e);
  process.exit(1);
});
