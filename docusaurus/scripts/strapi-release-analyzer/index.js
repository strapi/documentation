#!/usr/bin/env node

import { Octokit } from '@octokit/rest';
import Anthropic from '@anthropic-ai/sdk';
import { buildClaudePrompt } from './prompts/claude.js';
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import { DOCUMENTATION_SECTIONS } from './config/constants.js';
import { REASONS } from './config/reasons.js';
import { USAGE, USAGE_DEFAULTS, USAGE_EXAMPLE, USAGE_HINT, WARN_NO_GITHUB_TOKEN, ERR_NEED_ANTHROPIC, ERR_NEED_LIMIT_ZERO_HINT } from './config/messages.js';
import { isMicroUiChange, hasStrongDocsSignals, isRegressionRestore, isFeatureParityRestoration, isUploadRestriction } from './utils/detectors.js';
import { tokenize, collectHighSignalTokens } from './utils/tokens.js';
import { resolvePageForTarget, suggestCandidateDocs } from './utils/pages.js';
import { classifyImpact, categorizePRByDocumentation } from './utils/classify.js';

config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const STRAPI_REPO_OWNER = 'strapi';
const STRAPI_REPO_NAME = 'strapi';
const DOC_REPO_OWNER = 'strapi';
const DOC_REPO_NAME = 'documentation';
// Default Claude model; override with env CLAUDE_MODEL or --model flag
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929';

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

const PR_CATEGORIES = {
  feature: '🚀 New feature',
  bug: '🔥 Bug fix',
  enhancement: '💅 Enhancement',
  chore: '⚙️ Chore',
  docs: '📚 Docs',
  other: '📝 Other',
};

// Skip set: exclude chores, tests, CI, and docs-related PRs
const EXCLUDED_CATEGORIES = ['chore', 'test', 'ci', 'docs'];

// Cache ruleset version: bump to invalidate stale cached analyses after rubric changes
const RULESET_VERSION = 'v2';

// Runtime options (set in main from CLI flags)
let CURRENT_RELEASE_TAG = null;
const OPTIONS = {
  // Defaults favor fresh runs that recompute and overwrite cache
  noCache: true,
  refresh: true,
  cacheDir: path.join(process.cwd(), 'docusaurus', 'scripts', 'strapi-release-analyzer', '.cache'),
  limit: null,
  strict: 'conservative', // aggressive | balanced | conservative (default conservative)
  quiet: false,
};

// Minimal loader for llms-full.txt (with graceful fallback to llms.txt)
async function readLlmsFullIndex() {
  const repoRoot = process.cwd();
  const candidatesFull = [
    path.join(repoRoot, 'static', 'llms-full.txt'),
    path.join(repoRoot, 'docusaurus', 'static', 'llms-full.txt'),
    path.join(repoRoot, 'llms-full.txt'),
  ];
  const candidatesLite = [
    path.join(repoRoot, 'static', 'llms.txt'),
    path.join(repoRoot, 'docusaurus', 'static', 'llms.txt'),
    path.join(repoRoot, 'llms.txt'),
  ];

  async function readFirstExisting(paths) {
    for (const p of paths) {
      try {
        const text = await fs.readFile(p, 'utf8');
        const rel = path.relative(repoRoot, p) || p;
        return { text, source: rel };
      } catch {}
    }
    return null;
  }

  let loaded = await readFirstExisting(candidatesFull);
  if (!loaded) loaded = await readFirstExisting(candidatesLite);
  if (!loaded) {
    console.warn('  ⚠️  No llms-full.txt or llms.txt found (checked static/ and docusaurus/static); proceeding without docs index');
    return { source: null, pages: [], byTitle: new Map(), byUrl: new Map() };
  }
  const { text, source } = loaded;

  const pages = [];
  const byTitle = new Map();
  const byUrl = new Map();
  const bySlug = new Map();

  // Heuristic parser:
  // - Treat lines starting with "# " or "## " as page/section titles
  // - Capture the first URL following a title line (http/https)
  // - Collect anchors from subsequent headings (###, ####) within the same page
  const lines = text.split(/\r?\n/);
  let current = null;
  const urlRegex = /(https?:\/\/[^\s)]+)/;

  function slugify(s) {
    return s
      .toLowerCase()
      .replace(/\{#([^}]+)\}/g, '$1')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^#\s+/.test(line)) {
      // Page title
      const title = line.replace(/^#\s+/, '').trim();
      current = { title, url: null, anchors: new Set(), text: '' };
      pages.push(current);
      byTitle.set(title.toLowerCase(), current);
      continue;
    }
    if (/^##\s+/.test(line)) {
      // Treat as page title too if no outer # title exists yet
      const title = line.replace(/^##\s+/, '').trim();
      if (!current) {
        current = { title, url: null, anchors: new Set(), text: '' };
        pages.push(current);
        byTitle.set(title.toLowerCase(), current);
      } else {
        // Otherwise record as an anchor for the current page
        current.anchors.add(slugify(title));
      }
      continue;
    }
    if (/^###\s+/.test(line) && current) {
      const h = line.replace(/^###\s+/, '').trim();
      current.anchors.add(slugify(h));
      continue;
    }
    if (!current) continue;
    const m = line.match(urlRegex);
    if (m && !current.url) {
      current.url = m[1];
      byUrl.set(current.url, current);
      try {
        const u = new URL(current.url);
        // take last non-empty segment as slug
        const segs = u.pathname.split('/').filter(Boolean);
        const last = segs[segs.length - 1] || '';
        if (last) bySlug.set(last.toLowerCase(), current);
      } catch {}
    }
    // Accumulate raw text for coverage checks
    if (current) {
      current.text += line + "\n";
    }
  }

  // Normalize anchors to arrays
  const normalized = pages.map(p => ({
    title: p.title,
    url: p.url || null,
    anchors: Array.from(p.anchors),
    text: p.text || ''
  }));

  // Re-link bySlug to normalized objects
  const bySlugNormalized = new Map();
  for (const [k, v] of bySlug.entries()) {
    const norm = normalized.find(p => p.title === v.title && p.url === v.url);
    if (norm) bySlugNormalized.set(k, norm);
  }

  return { source, pages: normalized, byTitle, byUrl, bySlug: bySlugNormalized };
}

function parseArgs(argv) {
  const args = { releaseUrl: null };
  for (const arg of argv) {
    if (!arg.startsWith('--') && !args.releaseUrl) {
      args.releaseUrl = arg;
      continue;
    }
    if (arg === '--no-cache') OPTIONS.noCache = true; // keeps default
    if (arg === '--refresh') OPTIONS.refresh = true;   // keeps default
    if (arg === '--use-cache') { OPTIONS.noCache = false; OPTIONS.refresh = false; }
    if (arg.startsWith('--cache-dir=')) OPTIONS.cacheDir = arg.split('=')[1] || OPTIONS.cacheDir;
    if (arg.startsWith('--limit=')) {
      const n = parseInt(arg.split('=')[1], 10);
      if (!Number.isNaN(n) && n > 0) OPTIONS.limit = n;
    }
    if (arg === '--no-llm-call') { OPTIONS.limit = 0; }
    if (arg === '--quiet') { OPTIONS.quiet = true; }
    if (arg.startsWith('--strict=')) {
      const v = arg.split('=')[1];
      if (['aggressive', 'balanced', 'conservative'].includes(v)) OPTIONS.strict = v;
    }
    if (arg.startsWith('--model=')) {
      // Allow overriding model via CLI as well
      process.env.CLAUDE_MODEL = arg.split('=')[1];
    }
  }
  return args;
}

function isDocsLikePR(title, labels = []) {
  const t = (title || '').toLowerCase();
  const ls = labels.map(l => l.toLowerCase());
  if (t.startsWith('docs:') || t.includes('[docs]') || t.includes('documentation')) return true;
  if (ls.includes('docs') || ls.includes('documentation')) return true;
  return false;
}

function cachePathForPR(tag, prNumber) {
  return path.join(OPTIONS.cacheDir, RULESET_VERSION, tag, `pr-${prNumber}.json`);
}

async function readCachedPR(tag, prNumber) {
  if (OPTIONS.noCache) return null;
  try {
    const p = cachePathForPR(tag, prNumber);
    const buf = await fs.readFile(p, 'utf8');
    return JSON.parse(buf);
  } catch {
    return null;
  }
}

async function writeCachedPR(tag, prNumber, data) {
  try {
    const dir = path.join(OPTIONS.cacheDir, RULESET_VERSION, tag);
    await fs.mkdir(dir, { recursive: true });
    const p = cachePathForPR(tag, prNumber);
    await fs.writeFile(p, JSON.stringify(data, null, 2));
  } catch (e) {
    console.warn(`  ⚠️  Could not write cache for PR #${prNumber}: ${e.message}`);
  }
}

async function parseReleaseNotes(releaseUrl) {
  const match = releaseUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/releases\/tag\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub release URL format');
  }

  const [, owner, repo, tag] = match;
  
  if (!OPTIONS.quiet) console.log(`📦 Fetching release: ${tag}`);
  
  const { data: release } = await octokit.repos.getReleaseByTag({
    owner,
    repo,
    tag,
  });

  const prNumbers = extractPRNumbers(release.body);
  
  if (!OPTIONS.quiet) console.log(`✅ Found ${prNumbers.length} PRs in release notes`);
  
  return {
    tag,
    name: release.name,
    body: release.body,
    prNumbers,
  };
}

function extractPRNumbers(body) {
  const prRegex = /#(\d+)/g;
  const matches = body.matchAll(prRegex);
  const prNumbers = [...new Set([...matches].map(m => parseInt(m[1])))];
  return prNumbers;
}

function categorizePR(title, body, labels) {
  const lowerTitle = title.toLowerCase();
  const lowerBody = (body || '').toLowerCase();
  const labelNames = labels.map(l => l.toLowerCase());
  
  // Docs-related PRs
  if (isDocsLikePR(title, labelNames) || lowerBody.includes('### 📚 docs')) {
    return 'docs';
  }
  
  if (lowerTitle.includes('chore') || lowerTitle.startsWith('chore:') || 
      lowerTitle.startsWith('chore(') || labelNames.includes('chore')) {
    return 'chore';
  }
  
  if (lowerTitle.includes('test') || lowerTitle.startsWith('test:') || 
      lowerTitle.startsWith('test(') || lowerTitle.includes('spec.') ||
      labelNames.includes('test')) {
    return 'test';
  }
  
  if (lowerTitle.includes('ci:') || lowerTitle.startsWith('ci(') || 
      lowerTitle.includes('github actions') || lowerTitle.includes('workflow') ||
      labelNames.includes('ci')) {
    return 'ci';
  }
  
  if (lowerBody.includes('### 🚀 new feature') || lowerTitle.includes('feat:') || 
      lowerTitle.includes('feat(') || lowerTitle.includes('feature')) {
    return 'feature';
  }
  
  if (lowerBody.includes('### 🔥 bug fix') || lowerTitle.includes('fix:') || 
      lowerTitle.includes('fix(') || lowerTitle.includes('bug')) {
    return 'bug';
  }
  
  if (lowerBody.includes('### 💅 enhancement') || lowerTitle.includes('enhancement') ||
      lowerTitle.includes('improve')) {
    return 'enhancement';
  }
  
  return 'other';
}

async function analyzePR(prNumber) {
  if (!OPTIONS.quiet) console.log(`  🔍 Analyzing PR #${prNumber}...`);
  
  try {
    // Try cache first
    const cached = await readCachedPR(CURRENT_RELEASE_TAG || 'unknown', prNumber);
    if (cached && !OPTIONS.refresh) {
      console.log(`  💾 Using cached data for PR #${prNumber}`);
      // Respect skip rules on cached item too
      if (EXCLUDED_CATEGORIES.includes(cached.category)) {
        if (!OPTIONS.quiet) {
          console.log(`  ⏭️  Skipping PR #${prNumber} (${cached.category})`);
          console.log('');
        }
        return null;
      }
      return cached;
    }

    const { data: pr } = await octokit.pulls.get({
      owner: STRAPI_REPO_OWNER,
      repo: STRAPI_REPO_NAME,
      pull_number: prNumber,
    });

    const category = categorizePR(pr.title, pr.body, pr.labels.map(l => l.name));
    
    if (EXCLUDED_CATEGORIES.includes(category)) {
      if (!OPTIONS.quiet) {
        console.log(`  ⏭️  Skipping PR #${prNumber} (${category})`);
        console.log('');
      }
      return null;
    }

    const { data: files } = await octokit.pulls.listFiles({
      owner: STRAPI_REPO_OWNER,
      repo: STRAPI_REPO_NAME,
      pull_number: prNumber,
    });

    const analysis = {
      number: prNumber,
      title: pr.title,
      url: pr.html_url,
      body: pr.body || '',
      category,
      files: files.map(f => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch || '',
      })),
      labels: pr.labels.map(l => l.name),
    };

    await writeCachedPR(CURRENT_RELEASE_TAG || 'unknown', prNumber, analysis);
    return analysis;
  } catch (error) {
    console.error(`  ❌ Error analyzing PR #${prNumber}: ${error.message}`);
    return null;
  }
}

async function generateDocSuggestionsWithClaude(prAnalysis) {
  if (!OPTIONS.quiet) console.log(`  🤖 Generating documentation suggestions with Claude for PR #${prAnalysis.number}...`);
  
  const diffSummary = prAnalysis.files
    .filter(f => f.patch)
    .map(f => `### File: ${f.filename}\n\`\`\`diff\n${f.patch}\n\`\`\``)
    .join('\n\n');
  
    const diffSize = Buffer.byteLength(diffSummary, 'utf8');
    if (diffSize > 100000) {
    if (!OPTIONS.quiet) console.log(`  ⚠️  Diff too large (${Math.round(diffSize / 1024)}KB), truncating...`);
  }
  
    const truncatedDiff = diffSize > 100000
      ? diffSummary.slice(0, 100000) + '\n\n... (diff truncated due to size)'
      : diffSummary;

  const candidates = Array.isArray(prAnalysis._docsCandidates) ? prAnalysis._docsCandidates : [];
  const prompt = buildClaudePrompt({
    prAnalysis,
    truncatedDiff,
    candidates,
    summary: prAnalysis._summary,
    impact: prAnalysis._impact,
  });

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content?.[0]?.text || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      if (!OPTIONS.quiet) console.log(`  ⚠️  Could not parse Claude response as JSON`);
      return null;
    }

    let obj;
    try {
      obj = JSON.parse(jsonMatch[0]);
    } catch (e) {
      if (!OPTIONS.quiet) console.log(`  ⚠️  JSON parse error: ${e.message}`);
      return null;
    }

    // Lightweight normalization
    const needs = (obj.needsDocs || '').toLowerCase();
    const needsDocs = ['yes','no','maybe'].includes(needs) ? needs : 'maybe';
    const docsWorthy = Boolean(obj.docsWorthy);
    const newPage = Boolean(obj.newPage);
    const summary = String(obj.summary || prAnalysis._summary || '').trim().slice(0, 200);
    const rationale = String(obj.rationale || '').trim().slice(0, 300);
    const targets = Array.isArray(obj.targets) ? obj.targets : [];
    const normTargets = targets
      .map(t => ({ path: String(t.path || '').trim(), anchor: t.anchor ? String(t.anchor).trim() : undefined }))
      .filter(t => t.path);
    const cappedTargets = normTargets.slice(0, 5);

    // Post-processing gate: enforce docs-worthiness and targets presence
    let finalNeeds = needsDocs;
    if (needsDocs === 'yes') {
      const hasTargets = cappedTargets.length > 0;
      if (!docsWorthy) finalNeeds = 'no';
      else if (!hasTargets && !newPage) finalNeeds = 'no';
    }

    const normalized = { summary, needsDocs: finalNeeds, docsWorthy, newPage, rationale, targets: cappedTargets };
    if (!OPTIONS.quiet) console.log(`  ✅ LLM verdict: ${finalNeeds.toUpperCase()} | worthy=${docsWorthy ? 'Y' : 'N'}${newPage ? ' | newPage=Y' : ''} — ${cappedTargets.length} target(s)`);
    return normalized;
  } catch (error) {
    console.error(`  ❌ Error calling Claude API: ${error.message}`);
    return null;
  }
}


// moved categorizePRByDocumentation to utils/classify.js

function generateMarkdownReport(releaseInfo, analyses) {
  const timestamp = new Date().toISOString().split('T')[0];

  const verdictOf = (a) => (a.claudeSuggestions && a.claudeSuggestions.needsDocs) || (a.impact && a.impact.verdict) || 'maybe';
  // Under conservative mode, collapse any residual "maybe" into "no"
  const collapseMaybe = OPTIONS.strict === 'conservative';
  const normalizedVerdict = (a) => {
    const v = verdictOf(a);
    return collapseMaybe && v === 'maybe' ? 'no' : v;
  };
  const yesList = analyses.filter(a => normalizedVerdict(a) === 'yes');
  const noList = analyses.filter(a => normalizedVerdict(a) === 'no');
  const maybeList = collapseMaybe ? [] : analyses.filter(a => normalizedVerdict(a) === 'maybe');

  let markdown = `# Documentation Impact Report — ${releaseInfo.tag}\n\n`;
  markdown += `Generated on: ${timestamp}\n\n`;
  markdown += `Release: [${releaseInfo.name || releaseInfo.tag}](https://github.com/${STRAPI_REPO_OWNER}/${STRAPI_REPO_NAME}/releases/tag/${releaseInfo.tag})\n\n`;

  markdown += `Total PRs: ${analyses.length} | Yes: ${yesList.length} | No: ${noList.length}`;
  if (maybeList.length > 0) markdown += ` | Maybe: ${maybeList.length}`;
  markdown += `\n`;
  // Quick summary line for docs‑worthy count at top
  markdown += `PRs that might require docs updates: ${yesList.length}\n\n---\n\n`;

  // Yes section
  if (yesList.length > 0) {
    markdown += `## Requires Docs Updates (Yes)\n\n`;
    yesList.forEach(a => {
      const s = a.claudeSuggestions || {};
      const summary = (s.summary || a.summary || '').trim();
      markdown += `- PR #${a.number} — [${a.title}](${a.url})\n`;
      if (summary) markdown += `  \n  📝 Summary: ${summary}\n`;
      if (s.rationale) markdown += `  \n  🧠 Decision rationale: ${s.rationale}\n`;
      if (a.downgradeNote) markdown += `  \n  Note: ${a.downgradeNote}\n`;
      const targets = Array.isArray(s.targets) ? s.targets : [];
      if (targets.length > 0) {
        markdown += `  \n  Targets:\n`;
        targets.forEach(t => {
          const anchor = t.anchor ? `#${t.anchor}` : '';
          markdown += `  - ${t.path}${anchor}\n`;
        });
      }
      markdown += `\n`;
    });
    markdown += `\n`;
  }

  // No section
  if (noList.length > 0) {
    markdown += `## No Docs Updates (No)\n\n`;
    noList.forEach(a => {
      const s = a.claudeSuggestions || {};
      const summary = (s.summary || a.summary || '').trim();
      markdown += `- PR #${a.number} — [${a.title}](${a.url})\n`;
      if (summary) markdown += `  \n  📝 Summary: ${summary}\n`;
      const decisionType = a.provenance === 'llm' ? 'LLM assisted' : 'Heuristic (metadata-based, no LLM call)';
      markdown += `  \n  🧭 Decision type: ${decisionType}\n`;
      if (a.llmInitial && a.llmInitial.verdict) {
        const firstSentence = String(a.llmInitial.rationale || '').split(/\.(\s|$)/)[0];
        markdown += `  \n  🧪 Initial LLM verdict: ${a.llmInitial.verdict.toUpperCase()}${firstSentence ? ` — ${firstSentence}.` : ''}\n`;
      }
      markdown += `  \n  ❌ Final verdict: No\n`;
      // Build a single Reason line (merge rationale + note)
      let reasonText = '';
      if (a.noReasonCode) {
        reasonText = REASONS[a.noReasonCode] || '';
      } else if (s.rationale) {
        reasonText = s.rationale;
      }
      if (a.downgradeNote) {
        reasonText = reasonText ? `${reasonText} — ${a.downgradeNote}` : a.downgradeNote;
      }
      if (reasonText) markdown += `  \n  🧠 Reason: ${reasonText}\n`;
      markdown += `\n`;
    });
    markdown += `\n`;
  }

  // Maybe section (suppressed in conservative mode)
  if (maybeList.length > 0) {
    markdown += `## Uncertain (Maybe)\n\n`;
    maybeList.forEach(a => {
      const s = a.claudeSuggestions || {};
      const summary = (s.summary || a.summary || '').trim();
      markdown += `- PR #${a.number} — [${a.title}](${a.url})\n`;
      if (summary) markdown += `  \n  Summary: ${summary}\n`;
      if (s.rationale) markdown += `  \n  Rationale: ${s.rationale}\n`;
      const targets = Array.isArray(s.targets) ? s.targets : [];
      if (targets.length > 0) {
        markdown += `  \n  Targets:\n`;
        targets.forEach(t => {
          const anchor = t.anchor ? `#${t.anchor}` : '';
          markdown += `  - ${t.path}${anchor}\n`;
        });
      }
      markdown += `\n`;
    });
    markdown += `\n`;
  }

  return markdown;
}

// Removed legacy PDF generation (md-to-pdf) to simplify runtime and deps

// token helpers moved to ./utils/tokens.js

// Resolve the best matching docs page for a target path using the full llms-full index
// page helpers moved to ./utils/pages.js

function topDirs(filenames, max = 3) {
  const counts = new Map();
  for (const name of filenames) {
    const parts = name.split('/');
    const dir = parts.slice(0, 2).join('/');
    counts.set(dir, (counts.get(dir) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([d]) => d);
}

function deriveSummary(prAnalysis) {
  const title = (prAnalysis.title || '').trim();
  const files = prAnalysis.files || [];
  const filenames = files.map(f => f.filename);
  const dirs = topDirs(filenames);
  const dirList = dirs.length ? ` in ${dirs.join(', ')}` : '';
  if (title) return `${title}${dirList}`.slice(0, 200);
  return `Changes${dirList}`.slice(0, 200);
}

// moved classifyImpact to utils/classify.js

// Exclude pure locale additions under conservative policy
function isLocaleAddition(prAnalysis) {
  const t = (prAnalysis.title || '').toLowerCase();
  const b = (prAnalysis.body || '').toLowerCase();
  const text = `${t} ${b}`;
  if (!/(add|new)\s+(locale|language)/.test(text)) return false;
  const files = prAnalysis.files || [];
  // Heuristic: touches i18n locale lists / JSON locale maps
  const onlyLocaleLists = files.length > 0 && files.every(f => /i18n|locales|locale/.test(f.filename));
  return onlyLocaleLists;
}

// detectors moved to ./utils/detectors.js

// Detect regression/restore-to-expected behavior changes
// detectors moved to ./utils/detectors.js

// (duplicate hasStrongDocsSignals removed; stricter version defined earlier)

async function main() {
  const rawArgs = process.argv.slice(2);
  const { releaseUrl } = parseArgs(rawArgs);
  let effectiveReleaseUrl = releaseUrl;
  if (!effectiveReleaseUrl) {
    try {
      console.log('🔎 No release URL provided — fetching latest release from strapi/strapi');
      const { data: latest } = await octokit.repos.getLatestRelease({ owner: STRAPI_REPO_OWNER, repo: STRAPI_REPO_NAME });
      const latestTag = latest.tag_name;
      effectiveReleaseUrl = `https://github.com/${STRAPI_REPO_OWNER}/${STRAPI_REPO_NAME}/releases/tag/${latestTag}`;
      console.log(`📌 Using latest release: ${latestTag}`);
    } catch (e) {
      console.error(USAGE);
      console.error(USAGE_DEFAULTS);
      console.error(USAGE_EXAMPLE);
      console.error(USAGE_HINT);
      console.error(`Failed to auto-detect latest release: ${e.message}`);
      process.exit(1);
    }
  }

  if (!GITHUB_TOKEN) {
    console.warn(WARN_NO_GITHUB_TOKEN);
  }

  const llmCapProvided = OPTIONS.limit !== undefined && OPTIONS.limit !== null;
  const willUseLLM = !(llmCapProvided && Number(OPTIONS.limit) === 0);
  if (willUseLLM && !ANTHROPIC_API_KEY) {
    console.error(ERR_NEED_ANTHROPIC);
    console.error(ERR_NEED_LIMIT_ZERO_HINT);
    process.exit(1);
  }

  if (!OPTIONS.quiet) {
    console.log('🚀 Starting Strapi Release Documentation Analysis\n');
    console.log(`🤖 Using Claude ${CLAUDE_MODEL} for intelligent analysis\n`);
  }
  
  try {
    const releaseInfo = await parseReleaseNotes(effectiveReleaseUrl);
    CURRENT_RELEASE_TAG = releaseInfo.tag;
    
    const llmsIndex = await readLlmsFullIndex();
    if (llmsIndex.source && !OPTIONS.quiet) {
      console.log(`📚 Loaded docs index from ${llmsIndex.source} (${llmsIndex.pages.length} pages)`);
    }
    
    const totalPRs = releaseInfo.prNumbers.length;
    if (!OPTIONS.quiet) {
      if (OPTIONS.limit && OPTIONS.limit > 0) {
        console.log(`\n📝 Analyzing ${totalPRs} PRs (LLM on up to ${OPTIONS.limit} of ${totalPRs})...\n`);
      } else {
        console.log(`\n📝 Analyzing ${totalPRs} PRs...\n`);
      }
    } else {
      // quiet header
      process.stdout.write(`Analyzing ${totalPRs} PRs: 0/${totalPRs}`);
    }
    
    const analyses = [];
    let skipped = 0;
    
    const prList = Array.isArray(releaseInfo.prNumbers) ? releaseInfo.prNumbers : [];
    let processed = 0;
    let yesSoFar = 0;
    let quietRendered = false;
    for (const prNumber of prList) {
      const prAnalysis = await analyzePR(prNumber);

      if (!prAnalysis) {
        skipped++;
        // still advance quiet progress for a skipped item
        if (OPTIONS.quiet) {
          processed++;
          const total = totalPRs;
          const pct = Math.floor((processed / total) * 100);
          const barWidth = 20;
          const filled = Math.floor((processed / total) * barWidth);
          const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
          // If we already rendered two lines previously, move cursor up two lines before overwriting
          if (quietRendered) {
            process.stdout.write('\x1b[2A\r');
          }
          process.stdout.write(`[${bar}] ${processed}/${total} ${pct}%\n`);
          process.stdout.write(`Found ${yesSoFar} PRs that might require docs updates so far\n`);
          quietRendered = true;
        }
        continue;
      }

      // Pretty header per PR for readability (single blank line before header)
      if (!OPTIONS.quiet) {
        try {
          const headerTitle = (prAnalysis.title || '').trim();
          console.log(`\n— PR #${prNumber} — ${headerTitle}`);
        } catch {}
      }

      // Heuristic triage and summary
      const summary = deriveSummary(prAnalysis);
      const impact = classifyImpact(prAnalysis);

      const candidates = suggestCandidateDocs(llmsIndex, prAnalysis, 5);
      // Pre‑LLM gate for obvious "No" cases under conservative policy
      let preNoReason = null;
      let preNoCode = null;
      if (OPTIONS.strict === 'conservative') {
        if (isMicroUiChange(prAnalysis)) { preNoReason = 'cosmetic UI-only change'; preNoCode = 'heuristic_pre_no_micro_ui'; }
        else if (isRegressionRestore(prAnalysis)) { preNoReason = 'regression/restore to expected behavior'; preNoCode = 'heuristic_pre_no_regression_restore'; }
        else if ((prAnalysis.category === 'bug' || /\bfix\b|\bbug\b/i.test(prAnalysis.title || '')) && impact.verdict !== 'yes') {
          preNoReason = 'bug fix without clear feature/config/API impact'; preNoCode = 'heuristic_pre_no_bug_weak_signals';
        }
      }

      // Optional cap: apply limit only to LLM calls
      const canUseLLM = impact.verdict !== 'no' && (!OPTIONS.limit || analyses.filter(a => a.claudeSuggestions).length < OPTIONS.limit);
      // Conservative routing: only call LLM for features/enhancements or strong-signal bugs
      let allowByStrict = true;
      if (OPTIONS.strict === 'conservative') {
        const isFeatureEnhancement = prAnalysis.category === 'feature' || prAnalysis.category === 'enhancement' || /\bfeat|feature\b/i.test(prAnalysis.title || '');
        const strong = hasStrongDocsSignals(prAnalysis) || impact.verdict === 'yes' || isFeatureParityRestoration(prAnalysis) || isUploadRestriction(prAnalysis);
        // Bug-like defaults to NO unless strong signals indicate config/API/schema/migration
        const isBugLike = prAnalysis.category === 'bug' || /\bfix|bug\b/i.test(prAnalysis.title || '') || /\bfix|bug\b/i.test(prAnalysis.body || '');
        // Exclude locale additions under conservative policy
        const localeAdd = isLocaleAddition(prAnalysis);
        allowByStrict = (isFeatureEnhancement || strong) && !isMicroUiChange(prAnalysis) && !localeAdd;
        if (isBugLike && !strong) allowByStrict = false;
        if (!OPTIONS.quiet) {
          if (!allowByStrict && canUseLLM && !preNoReason) {
            console.log('  ⏭️  Skipping LLM call under conservative routing (no strong docs signals)');
          }
        }
      }
      const runLLM = !preNoReason && canUseLLM && allowByStrict;
      let claudeSuggestions = null;
      let downgradeNote = null;
      // Track LLM initial verdict before any downgrades
      let llmInitial = null;
      // Reason code for final NO (used in logs/report)
      let noReasonCode = null;
      if (runLLM) {
        claudeSuggestions = await generateDocSuggestionsWithClaude({
          ...prAnalysis,
          _summary: summary,
          _impact: impact,
          _docsCandidates: candidates,
        });
        if (claudeSuggestions) {
          llmInitial = { verdict: claudeSuggestions.needsDocs, rationale: claudeSuggestions.rationale || '' };
        }
      } else if (preNoReason) {
        // Synthesize a conservative No without spending tokens
        claudeSuggestions = {
          summary,
          needsDocs: 'no',
          docsWorthy: false,
          newPage: false,
          rationale: `Conservative pre-LLM gate: ${preNoReason}`,
          targets: [],
        };
        if (!OPTIONS.quiet) {
          console.log(`  ⛳ Pre-LLM gate → NO (${preNoReason})`);
        }
        downgradeNote = `Downgraded to No under conservative policy: ${preNoReason}.`;
        noReasonCode = preNoCode || null;
      }

      // Apply strictness downgrade in conservative mode for micro UI or regression restores
      if (OPTIONS.strict === 'conservative' && claudeSuggestions && claudeSuggestions.needsDocs === 'yes') {
        if (isMicroUiChange(prAnalysis)) {
          claudeSuggestions = { ...claudeSuggestions, needsDocs: 'no' };
          downgradeNote = 'Conservative downgrade: micro UI-only change.';
          noReasonCode = 'llm_downgrade_micro_ui';
          if (!OPTIONS.quiet) console.log('  🔻 Downgrade → NO (micro UI-only change)');
        } else if (isRegressionRestore(prAnalysis)) {
          claudeSuggestions = { ...claudeSuggestions, needsDocs: 'no' };
          downgradeNote = 'Conservative downgrade: regression/restore to expected behavior.';
          noReasonCode = 'llm_downgrade_regression_restore';
          if (!OPTIONS.quiet) console.log('  🔻 Downgrade → NO (restore to expected behavior)');
        }
      }

      // llms-full cross-check: if targets are present and the page text likely already
      // describes the expected behavior (and PR looks like a fix), downgrade to NO.
      if (claudeSuggestions && claudeSuggestions.needsDocs === 'yes' && Array.isArray(claudeSuggestions.targets) && claudeSuggestions.targets.length > 0) {
        const looksLikeFix = /fix|bug|regression|restore|correct|misleading|missing/i.test(prAnalysis.title || '') || /fix|bug|regression|restore|correct|misleading|missing/i.test(prAnalysis.body || '');
        if (looksLikeFix) {
          const coverageHit = claudeSuggestions.targets.some(t => {
            const page = resolvePageForTarget(llmsIndex, candidates, t.path);
            if (!page || !page.text) return false;
            const words = (summary || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3).slice(0, 8);
            const highSignals = collectHighSignalTokens(prAnalysis, 12);
            const terms = Array.from(new Set([...words, ...highSignals])).slice(0, 16);
            const body = page.text.toLowerCase();
            const hits = terms.filter(w => w && body.includes(w));
            const baseThresh = Math.max(3, Math.floor(terms.length / 2));
            const threshold = OPTIONS.strict === 'conservative' ? Math.max(4, baseThresh) : baseThresh;
            return hits.length >= threshold;
          });
          if (coverageHit) {
            claudeSuggestions = { ...claudeSuggestions, needsDocs: 'no' };
            downgradeNote = 'Coverage cross-check: likely already documented end behavior; treating as bug fix.';
            noReasonCode = 'llm_downgrade_coverage_match';
            if (!OPTIONS.quiet) console.log('  🔻 Downgrade → NO (docs coverage likely matches end behavior)');
          }
        }
      }

      // Target validation tightening: ensure targets map to known docs pages
      if (claudeSuggestions && claudeSuggestions.needsDocs === 'yes') {
        const originalTargets = Array.isArray(claudeSuggestions.targets) ? claudeSuggestions.targets : [];
        const validated = originalTargets.filter(t => !!resolvePageForTarget(llmsIndex, candidates, t.path));
        if (validated.length !== originalTargets.length) {
          // Drop invalid targets
          claudeSuggestions = { ...claudeSuggestions, targets: validated };
        }
      // If bug-like, still require strong signals even after LLM says yes — but whitelist upload MIME rules
      // Do not treat as bug-like based on body text alone to avoid false positives on "feat" PRs
      const isBugLikePost = prAnalysis.category === 'bug' || /\bfix|bug\b/i.test(prAnalysis.title || '');
      if (isBugLikePost && !hasStrongDocsSignals(prAnalysis) && !isUploadRestriction(prAnalysis)) {
        claudeSuggestions = { ...claudeSuggestions, needsDocs: 'no' };
        downgradeNote = 'Conservative guard: bug fix lacks strong config/API/schema/migration signals.';
        noReasonCode = 'llm_downgrade_bug_without_strong_signals';
        if (!OPTIONS.quiet) console.log('  🔻 Downgrade → NO (bug fix without strong signals)');
      } else if (validated.length === 0 && !claudeSuggestions.newPage) {
        // No resolvable targets and not a new page request → No
        claudeSuggestions = { ...claudeSuggestions, needsDocs: 'no' };
        downgradeNote = 'Targets did not resolve to known docs pages and newPage not requested.';
        noReasonCode = 'llm_downgrade_invalid_targets';
        if (!OPTIONS.quiet) console.log('  🔻 Downgrade → NO (targets invalid and not a new page)');
      }

      // Conservative anchor requirement for section‑heavy pages
      if (OPTIONS.strict === 'conservative' && claudeSuggestions.needsDocs === 'yes' && validated.length > 0) {
        const requiresAnchor = validated.some(t => {
          if (t.anchor) return false; // already has anchor
          const page = resolvePageForTarget(llmsIndex, candidates, t.path);
          if (!page || !Array.isArray(page.anchors)) return false;
          // Consider section-heavy when many anchors exist
          const isSectionHeavy = page.anchors.length >= 5;
          if (!isSectionHeavy) return false;
          // If summary or high-signal tokens correlate with known anchors, anchor is expected
          const anchorsSet = new Set(page.anchors.map(a => String(a).toLowerCase()));
          const terms = Array.from(new Set([
            ...(String(summary || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3).slice(0, 10)),
            ...collectHighSignalTokens(prAnalysis, 10)
          ]));
          return terms.some(term => anchorsSet.has(term));
        });
        if (requiresAnchor) {
          claudeSuggestions = { ...claudeSuggestions, needsDocs: 'no' };
          downgradeNote = 'Section-heavy target without anchor in conservative mode.';
          noReasonCode = 'llm_downgrade_missing_anchor_section_heavy';
          if (!OPTIONS.quiet) console.log('  🔻 Downgrade → NO (section-heavy page requires anchor)');
        }
      }
    }

      // Hard conservative guard post‑LLM: bug fixes without strong signals default to No
      if (OPTIONS.strict === 'conservative' && claudeSuggestions && claudeSuggestions.needsDocs === 'yes') {
        // Do not treat as bug-like based on body text alone to avoid false positives on "feat" PRs
        const isBugLike = prAnalysis.category === 'bug' || /\bfix|bug\b/i.test(prAnalysis.title || '');
        if (isBugLike && !hasStrongDocsSignals(prAnalysis) && !claudeSuggestions.newPage) {
          claudeSuggestions = { ...claudeSuggestions, needsDocs: 'no' };
          downgradeNote = 'Conservative guard: bug fix without strong docs signals.';
          noReasonCode = 'conservative_guard_no_strong_signals';
          if (!OPTIONS.quiet) console.log('  🔻 Downgrade → NO (conservative guard: bug without strong signals)');
        }
      }

      // Final per-PR log line for decision provenance
      // Final per-PR log line for decision provenance
      const provenance = runLLM ? 'llm' : 'heuristic';
      if (!OPTIONS.quiet) {
        if (runLLM) {
          console.log('  🤝 Decision provenance: LLM assisted');
          if (llmInitial && llmInitial.verdict) {
            console.log(`  🧪 LLM initial: ${String(llmInitial.verdict).toUpperCase()}`);
          }
        } else {
          console.log('  🧭 Decision provenance: Heuristic only');
        }
      }

      if (downgradeNote && !OPTIONS.quiet) {
        console.log(`  📝 Downgrade note: ${downgradeNote}`);
      }

      let finalVerdict = (claudeSuggestions && claudeSuggestions.needsDocs) || (impact && impact.verdict) || 'maybe';
      if (OPTIONS.strict === 'conservative' && finalVerdict === 'maybe') finalVerdict = 'no';
      const verdictUpper = String(finalVerdict).toUpperCase();
      const verdictIcon = finalVerdict === 'yes' ? '✅' : finalVerdict === 'no' ? '❌' : '⚠️';
      if (!OPTIONS.quiet) {
        console.log(`  ${verdictIcon} Final verdict: ${verdictUpper}`);
      }

      analyses.push({
        ...prAnalysis,
        summary,
        impact,
        claudeSuggestions,
        downgradeNote,
        provenance,
        noReasonCode,
        llmInitial,
      });
      if (finalVerdict === 'yes') yesSoFar++;
      
      // Render quiet progress
      processed++;
      if (OPTIONS.quiet) {
        const total = totalPRs;
        const pct = Math.floor((processed / total) * 100);
        const barWidth = 20;
        const filled = Math.floor((processed / total) * barWidth);
        const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
        // Overwrite two-line quiet display
        if (quietRendered) {
          process.stdout.write('\x1b[2A\r');
        }
        process.stdout.write(`[${bar}] ${processed}/${total} ${pct}%\n`);
        process.stdout.write(`Found ${yesSoFar} PRs that might require docs updates so far\n`);
        quietRendered = true;
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    if (OPTIONS.quiet) process.stdout.write('\n');
    console.log(`\n✅ Analysis complete!`);
    const verdictOf = (a) => (a.claudeSuggestions && a.claudeSuggestions.needsDocs) || (a.impact && a.impact.verdict) || 'maybe';
    const yesCount = analyses.filter(a => verdictOf(a) === 'yes').length;
    console.log(`   📊 Analyzed: ${analyses.length} PRs`);
    console.log(`   ⏭️  Skipped: ${skipped} PRs (chores, tests, CI)`);
    console.log(`   📌 ${yesCount} PRs might require docs updates\n`);
    
    const report = generateMarkdownReport(releaseInfo, analyses);
    
    const outputDir = path.join(process.cwd(), 'release-analysis');
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputFile = path.join(outputDir, `${releaseInfo.tag}-doc-analysis.md`);
    await fs.writeFile(outputFile, report);
    
    console.log(`📄 Report generated: ${outputFile}\n`);
    
    // PDF generation removed
    
    console.log('🎉 Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
