const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { issueKey, runLegacyStyleRules } = require('./legacy-style-rules');

const DOCUSAURUS_DIR = path.join(__dirname, '../../..');
const VALE_RUN_SH = path.join(DOCUSAURUS_DIR, 'scripts/vale/run.sh');

const CHECK_TO_RULE_ID = {
  'Strapi.EasyDifficultWords': 'easy_difficult_words',
  'Strapi.CasualTone': 'jokes_and_casual_tone',
  'Strapi.SimpleEnglish': 'simple_english_vocabulary',
  'Strapi.MinimizePronouns': 'minimize_pronouns',
  'Strapi.InlineEnumerations': 'use_bullet_lists',
};

/** Rules validated with legacy line cleaning (same as rule-parser.js). */
const LEGACY_PARITY_RULES = new Set([
  'easy_difficult_words',
  'jokes_and_casual_tone',
  'simple_english_vocabulary',
  'minimize_pronouns',
]);

const SIMPLE_ENGLISH_REPLACEMENTS = {
  utilize: 'use',
  facilitate: 'help',
  demonstrate: 'show',
  aforementioned: 'previous',
  subsequent: 'next',
  therefore: 'so',
  furthermore: 'also',
  moreover: 'also',
  consequently: 'so',
};

const SUGGESTIONS = {
  easy_difficult_words:
    'Remove subjective difficulty assessment and provide clear instructions instead',
  jokes_and_casual_tone: 'Use professional, neutral language in technical documentation',
  minimize_pronouns:
    'Focus on actions and explanations rather than addressing the reader directly',
  use_bullet_lists: 'Convert to bullet list format:\n- Item 1\n- Item 2\n- Item 3',
};

/** Count comma-separated items in a Vale enumeration match (e.g. "A, B, and C" → 3). */
function countEnumerationItems(matchText) {
  if (!matchText || typeof matchText !== 'string') {
    return 0;
  }
  return matchText.split(',').map((part) => part.trim()).filter(Boolean).length;
}

function formatBulletListMessage(alert) {
  const itemCount = countEnumerationItems(alert.Match);
  if (itemCount > 0) {
    return `Long enumeration detected (${itemCount} items) - use bullet list instead (Rule 8)`;
  }
  return alert.Message;
}

function suggestionForIssue(ruleId, alert) {
  if (ruleId === 'simple_english_vocabulary' && alert.Match) {
    const replacement = SIMPLE_ENGLISH_REPLACEMENTS[alert.Match.toLowerCase()];
    return replacement
      ? `Use "${replacement}" instead of "${alert.Match}"`
      : `Use simpler language instead of "${alert.Match}"`;
  }
  return SUGGESTIONS[ruleId];
}

function checkToRuleId(check) {
  if (CHECK_TO_RULE_ID[check]) {
    return CHECK_TO_RULE_ID[check];
  }
  const short = check.replace(/^Strapi\./, '');
  return short.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

function resolveFilePath(file, cwd = DOCUSAURUS_DIR) {
  if (path.isAbsolute(file)) {
    return file;
  }
  if (file.startsWith('docusaurus/')) {
    return path.resolve(file);
  }
  return path.resolve(cwd, file);
}

function resolveTargets(files, cwd = DOCUSAURUS_DIR) {
  if (files && files.length > 0) {
    const valid = [];
    for (const file of files) {
      const filePath = resolveFilePath(file, cwd);
      if (fs.existsSync(filePath) && /\.(md|mdx)$/i.test(filePath)) {
        valid.push(path.relative(cwd, filePath));
      }
    }
    return valid;
  }

  return ['docs/'];
}

function walkMarkdownFiles(targets, cwd) {
  const files = new Set();

  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (/\.(md|mdx)$/i.test(ent.name)) {
        files.add(full);
      }
    }
  }

  for (const target of targets) {
    const full = path.resolve(cwd, target);
    if (!fs.existsSync(full)) {
      continue;
    }
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (/\.(md|mdx)$/i.test(full)) {
      files.add(full);
    }
  }

  return [...files];
}

function pushIssue(buckets, issue) {
  switch (issue.severity) {
    case 'error':
      buckets.errors.push(issue);
      break;
    case 'suggestion':
      buckets.suggestions.push(issue);
      break;
    default:
      buckets.warnings.push(issue);
  }
}

function mergeLegacySupplement(buckets, filePaths, { lineFilter, existingKeys }) {
  for (const filePath of filePaths) {
    const content = fs.readFileSync(filePath, 'utf8');
    const legacyIssues = runLegacyStyleRules(content, filePath);

    for (const issue of legacyIssues) {
      if (!LEGACY_PARITY_RULES.has(issue.ruleId)) {
        continue;
      }
      if (lineFilter && !lineFilter(filePath, issue.line)) {
        continue;
      }

      const key = issueKey(issue);
      if (existingKeys.has(key)) {
        continue;
      }

      existingKeys.add(key);
      pushIssue(buckets, issue);
    }
  }
}

function runValeJson(targets, { cwd = DOCUSAURUS_DIR, verbose = false } = {}) {
  if (!fs.existsSync(VALE_RUN_SH)) {
    throw new Error(`Vale runner not found: ${VALE_RUN_SH}`);
  }

  const args = [...targets, '--output=JSON'];
  if (verbose) {
    console.log(`[vale] ${VALE_RUN_SH} ${args.join(' ')}`);
  }

  let stdout = '';
  try {
    stdout = execFileSync('bash', [VALE_RUN_SH, ...args], {
      cwd,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    stdout = error.stdout?.toString() || '';
    if (!stdout.trim()) {
      throw error;
    }
  }

  const trimmed = stdout.trim();
  if (!trimmed) {
    return {};
  }

  try {
    return JSON.parse(trimmed);
  } catch (parseError) {
    throw new Error(`Failed to parse Vale JSON output: ${parseError.message}`);
  }
}

function mapAlertsToIssues(
  valeJson,
  { cwd = DOCUSAURUS_DIR, lineFilter = null, filePaths = [] } = {}
) {
  const buckets = { errors: [], warnings: [], suggestions: [] };
  const filesSeen = new Set();
  const existingKeys = new Set();

  for (const [relativeFile, alerts] of Object.entries(valeJson)) {
    if (!Array.isArray(alerts) || alerts.length === 0) {
      continue;
    }

    const filePath = path.resolve(cwd, relativeFile);
    filesSeen.add(filePath);

    for (const alert of alerts) {
      const line = alert.Line || 1;

      if (lineFilter && !lineFilter(filePath, line)) {
        continue;
      }

      const ruleId = checkToRuleId(alert.Check || '');

      // Legacy rule-parser owns these four rules for exact parity; Vale only runs enumerations.
      if (LEGACY_PARITY_RULES.has(ruleId)) {
        continue;
      }

      const message =
        ruleId === 'use_bullet_lists' ? formatBulletListMessage(alert) : alert.Message;
      const itemCount =
        ruleId === 'use_bullet_lists' ? countEnumerationItems(alert.Match) : 0;

      const issue = {
        file: filePath,
        line,
        message,
        severity: alert.Severity || 'warning',
        rule: ruleId,
        ruleId,
        ruleDescription: message,
        suggestion: suggestionForIssue(ruleId, alert),
        match:
          ruleId === 'use_bullet_lists' && itemCount > 0 ? String(itemCount) : alert.Match,
        link: alert.Link,
      };

      const key = issueKey(issue);
      if (existingKeys.has(key)) {
        continue;
      }
      existingKeys.add(key);

      pushIssue(buckets, issue);
    }
  }

  const pathsToSupplement =
    filePaths.length > 0 ? filePaths : [...filesSeen];

  mergeLegacySupplement(buckets, pathsToSupplement, { lineFilter, existingKeys });

  const totalIssues =
    buckets.errors.length + buckets.warnings.length + buckets.suggestions.length;

  return {
    errors: buckets.errors,
    warnings: buckets.warnings,
    suggestions: buckets.suggestions,
    summary: {
      filesProcessed: new Set([...filesSeen, ...pathsToSupplement]).size,
      totalIssues,
      criticalIssues: buckets.errors.length,
    },
  };
}

function validateFiles(files, options = {}) {
  const cwd = options.cwd || DOCUSAURUS_DIR;
  const targets = resolveTargets(files, cwd);
  const filePaths = walkMarkdownFiles(targets, cwd);
  const valeJson = runValeJson(targets, { cwd, verbose: options.verbose });
  return mapAlertsToIssues(valeJson, { cwd, lineFilter: options.lineFilter, filePaths });
}

module.exports = {
  DOCUSAURUS_DIR,
  validateFiles,
  runValeJson,
  mapAlertsToIssues,
  resolveTargets,
  checkToRuleId,
  walkMarkdownFiles,
};
