#!/usr/bin/env node

import { Octokit } from '@octokit/rest';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';

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
  
  console.log(`📦 Fetching release: ${tag}`);
  
  const { data: release } = await octokit.repos.getReleaseByTag({
    owner,
    repo,
    tag,
  });

  const prNumbers = extractPRNumbers(release.body);
  
  console.log(`✅ Found ${prNumbers.length} PRs in release notes`);
  
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
  // Blank line before each PR analysis for readability
  console.log('');
  console.log(`  🔍 Analyzing PR #${prNumber}...`);
  
  try {
    // Try cache first
    const cached = await readCachedPR(CURRENT_RELEASE_TAG || 'unknown', prNumber);
    if (cached && !OPTIONS.refresh) {
      console.log(`  💾 Using cached data for PR #${prNumber}`);
      // Respect skip rules on cached item too
      if (EXCLUDED_CATEGORIES.includes(cached.category)) {
        console.log(`  ⏭️  Skipping PR #${prNumber} (${cached.category})`);
        console.log('');
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
      console.log(`  ⏭️  Skipping PR #${prNumber} (${category})`);
      console.log('');
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
  console.log(`  🤖 Generating documentation suggestions with Claude for PR #${prAnalysis.number}...`);
  
  const diffSummary = prAnalysis.files
    .filter(f => f.patch)
    .map(f => `### File: ${f.filename}\n\`\`\`diff\n${f.patch}\n\`\`\``)
    .join('\n\n');
  
    const diffSize = Buffer.byteLength(diffSummary, 'utf8');
    if (diffSize > 100000) {
    console.log(`  ⚠️  Diff too large (${Math.round(diffSize / 1024)}KB), truncating...`);
  }
  
    const truncatedDiff = diffSize > 100000
      ? diffSummary.slice(0, 100000) + '\n\n... (diff truncated due to size)'
      : diffSummary;

  // Build candidate grounding block from llms-full index
  const candidates = Array.isArray(prAnalysis._docsCandidates) ? prAnalysis._docsCandidates : [];
  const candidatesBlock = candidates.length
    ? `## Candidate Documentation Pages (from llms-full index)\n\n` +
      candidates.map((p, i) => {
        const anchors = Array.isArray(p.anchors) && p.anchors.length ? p.anchors.slice(0, 8).join(', ') : '—';
        return `- [${i + 1}] Title: ${p.title}\n  URL: ${p.url || '(missing)'}\n  Anchors: ${anchors}`;
      }).join('\n') + '\n\n'
    : '';

  const signalsBlock = `## Signals\n\n- Heuristic summary: ${prAnalysis._summary || 'N/A'}\n- Heuristic impact: ${(prAnalysis._impact && prAnalysis._impact.verdict) || 'unknown'} — ${(prAnalysis._impact && prAnalysis._impact.reason) || ''}\n\n`;

  const prompt = `You are a technical documentation analyst for Strapi CMS. Your expertise is in identifying documentation gaps and suggesting precise updates.

Analyze this pull request and provide specific, actionable documentation update suggestions.

## PR Information
- **Title**: ${prAnalysis.title}
- **Category**: ${prAnalysis.category}
- **Description**: ${prAnalysis.body.substring(0, 1000)}
- **URL**: ${prAnalysis.url}

## Code Changes (Diff)

${truncatedDiff}

${signalsBlock}
${candidatesBlock}

## Your Task

**Important**: Strapi documentation structure:
- The old /user-docs and /dev-docs folders have been replaced
- Current structure: /cms for CMS documentation, /cloud for Cloud documentation
- Features are now in /cms/features/ (e.g., content-manager, media-library, internationalization)
- API docs are in /cms/api/
- Configurations are in /cms/configurations/

Analyze the changes and determine:
1. Does this PR affect user-facing functionality, APIs, or configuration?
2. What parts of the Strapi documentation need updates?
3. What specific content should be added, updated, or clarified?

Respond with a JSON object in this minimal shape (JSON only, no markdown):

{
  "summary": "≤200 chars plain text what/why",
  "needsDocs": "yes" | "no" | "maybe",
  "docsWorthy": true | false,
  "newPage": true | false,
  "rationale": "1–2 sentence justification",
  "targets": [
    { "path": "docs/cms/...md", "anchor": "optional-section-anchor" }
  ]
}

## Guidelines

1. **Priority Determination**: 
   - **HIGH**: New features, breaking changes, API modifications, new configuration options, significant behavior changes
   - **MEDIUM**: Important bug fixes affecting user workflows, UI/UX changes, plugin modifications, i18n changes
   - **LOW**: Minor fixes, cosmetic changes, internal refactoring with minimal user impact

2. **Affected Areas**: Be specific. Examples:
   - "Admin Panel - Content Manager"
   - "API Reference - Upload Plugin"
   - "User Guide - Internationalization"
   - "Configuration - Media Library Settings"
   - "Developer Guide - Plugin Development"

3. **File Paths**: Use the current Strapi documentation structure:
   - CMS docs: "docs/cms/[topic]/[page].md" (e.g., "docs/cms/features/content-manager.md")
   - Cloud docs: "docs/cloud/[topic]/[page].md" (e.g., "docs/cloud/getting-started/deployment.md")
   - API reference: "docs/cms/api/[type]/[endpoint].md"
   - Configuration: "docs/cms/configurations/[topic].md"
   - Features: "docs/cms/features/[feature].md"

4. **Suggested Content**: 
   - Write complete, ready-to-use markdown content
   - Include code examples where appropriate
   - Use proper markdown formatting (headers, code blocks, lists)
   - Be concise but comprehensive
   - Match Strapi's documentation tone (clear, friendly, technical)

5. **When NOT to suggest changes**:
   - Internal code refactoring with no external impact
   - Test file changes only
   - CI/CD pipeline changes
   - Minor typo fixes in code comments
   - Changes to development tooling

6. **Docs‑worthiness rubric**:
   - Answer needsDocs: "yes" only if at least one applies:
     - Breaking change or deprecation
     - New capability, setting, endpoint, or configuration key
     - Persistent workflow or UX change (not cosmetic)
     - New concept that requires explanation
   - Otherwise, answer needsDocs: "no" for:
     - Cosmetic/UI-only fixes (spacing, margins, padding, alignment, borders, icons, tooltips, translations)
     - Restoring expected behavior or regression fixes
     - Internal refactors without external impact

7. **Grounding and targeting**:
   - Prefer targets among the "Candidate Documentation Pages" when applicable.
   - Include an anchor from the page's anchors list when relevant.
   - Keep the response JSON-only (no markdown outside JSON).
   - If you answer "yes", you must include at least one concrete target path under docs/.../*.md. If no existing page fits, set \`newPage: true\`.
   - If you cannot provide targets and it is not a genuinely new page, answer needsDocs: "no".

Respond ONLY with valid JSON, no markdown formatting, no additional text.`;

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
      console.log(`  ⚠️  Could not parse Claude response as JSON`);
      return null;
    }

    let obj;
    try {
      obj = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.log(`  ⚠️  JSON parse error: ${e.message}`);
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
    console.log(`  ✅ LLM verdict: ${finalNeeds.toUpperCase()} | worthy=${docsWorthy ? 'Y' : 'N'}${newPage ? ' | newPage=Y' : ''} — ${cappedTargets.length} target(s)`);
    return normalized;
  } catch (error) {
    console.error(`  ❌ Error calling Claude API: ${error.message}`);
    return null;
  }
}

const DOCUMENTATION_SECTIONS = {
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

const SPECIFIC_AREA_PATTERNS = {
  // Features
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
  
  // APIs
  'rest|/api/rest': { section: 'APIs', area: 'REST API' },
  'graphql': { section: 'APIs', area: 'GraphQL' },
  'document service': { section: 'APIs', area: 'Document Service' },
  
  // Configurations
  'database|\\bdb\\b': { section: 'Configurations', area: 'Database' },
  'server|middleware': { section: 'Configurations', area: 'Server' },
  
  // Other sections
  'typescript|\\.ts': { section: 'TypeScript', area: '' },
  'cli|command': { section: 'CLI', area: '' },
  'plugin': { section: 'Plugins', area: 'Plugin Development' },
  'migration|upgrade': { section: 'Upgrades', area: 'Migration' },
};

function categorizePRByDocumentation(analysis) {
  const { claudeSuggestions, files, title } = analysis;
  
  if (!claudeSuggestions || !claudeSuggestions.affectedAreas) {
    return { mainCategory: 'cms', section: 'Other', specificArea: '' };
  }

  if (claudeSuggestions.documentationSection) {
    const mainCategory = claudeSuggestions.documentationSection.toLowerCase().includes('cloud') ? 'cloud' : 'cms';
    return { 
      mainCategory, 
      section: claudeSuggestions.documentationSection,
      specificArea: claudeSuggestions.documentationSection.split(' - ')[1] || ''
    };
  }

  const affectedAreas = claudeSuggestions.affectedAreas.join(' ').toLowerCase();
  const filePaths = files.map(f => f.filename.toLowerCase()).join(' ');
  const titleLower = title.toLowerCase();
  const allText = `${affectedAreas} ${filePaths} ${titleLower}`.toLowerCase();

  let mainCategory = 'cms';
  if (allText.includes('cloud') || allText.includes('/cloud/')) {
    mainCategory = 'cloud';
    
    if (allText.includes('deployment')) {
      return { mainCategory, section: 'Deployments', specificArea: '' };
    }
    if (allText.includes('project')) {
      return { mainCategory, section: 'Projects Management', specificArea: '' };
    }
  }

  for (const [pattern, { section, area }] of Object.entries(SPECIFIC_AREA_PATTERNS)) {
    if (new RegExp(pattern, 'i').test(allText)) {
      const sectionLabel = area ? `${section} - ${area}` : section;
      return { mainCategory, section: sectionLabel, specificArea: area };
    }
  }

  const firstAffectedArea = claudeSuggestions.affectedAreas[0] || 'Other';
  return { mainCategory, section: firstAffectedArea, specificArea: '' };
}

function generateMarkdownReport(releaseInfo, analyses) {
  const timestamp = new Date().toISOString().split('T')[0];

  const verdictOf = (a) => (a.claudeSuggestions && a.claudeSuggestions.needsDocs) || (a.impact && a.impact.verdict) || 'maybe';
  const yesList = analyses.filter(a => verdictOf(a) === 'yes');
  const noList = analyses.filter(a => verdictOf(a) === 'no');
  const maybeList = analyses.filter(a => verdictOf(a) === 'maybe');

  let markdown = `# Documentation Impact Report — ${releaseInfo.tag}\n\n`;
  markdown += `Generated on: ${timestamp}\n\n`;
  markdown += `Release: [${releaseInfo.name || releaseInfo.tag}](https://github.com/${STRAPI_REPO_OWNER}/${STRAPI_REPO_NAME}/releases/tag/${releaseInfo.tag})\n\n`;

  markdown += `Total PRs: ${analyses.length} | Yes: ${yesList.length} | No: ${noList.length}`;
  if (maybeList.length > 0) markdown += ` | Maybe: ${maybeList.length}`;
  markdown += `\n\n---\n\n`;

  // Yes section
  if (yesList.length > 0) {
    markdown += `## Requires Docs Updates (Yes)\n\n`;
    yesList.forEach(a => {
      const s = a.claudeSuggestions || {};
      const summary = (s.summary || a.summary || '').trim();
      markdown += `- PR #${a.number} — [${a.title}](${a.url})\n`;
      if (summary) markdown += `  \n  Summary: ${summary}\n`;
      if (s.rationale) markdown += `  \n  Rationale: ${s.rationale}\n`;
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
      markdown += `  \n  Decision: ${a.provenance === 'llm' ? 'LLM assisted' : 'Heuristic only'}\n`;
      markdown += `  \n  Final verdict: No\n`;
      if (a.llmInitial && a.llmInitial.verdict) {
        const firstSentence = String(a.llmInitial.rationale || '').split(/\.(\s|$)/)[0];
        markdown += `  \n  LLM initial: ${a.llmInitial.verdict.toUpperCase()}${firstSentence ? ` — ${firstSentence}.` : ''}\n`;
      }
      if (summary) markdown += `  \n  Summary: ${summary}\n`;
      // Render reason codes into human-friendly rationale
      if (a.noReasonCode) {
        const reasonMap = {
          heuristic_pre_no_micro_ui: 'cosmetic UI-only change detected by heuristics',
          heuristic_pre_no_regression_restore: 'regression/restore-to-expected behavior detected by heuristics',
          heuristic_pre_no_bug_weak_signals: 'bug fix without clear feature/config/API impact (heuristics)',
          llm_downgrade_micro_ui: 'LLM suggested changes but micro UI-only; conservative downgrade',
          llm_downgrade_regression_restore: 'LLM suggested changes but restore-to-expected; conservative downgrade',
          llm_downgrade_coverage_match: 'End behavior appears already documented; conservative downgrade',
          llm_downgrade_invalid_targets: 'LLM targets invalid or unresolvable; conservative downgrade',
          conservative_guard_no_strong_signals: 'Bug fix without strong docs signals; conservative guard'
        };
        const why = reasonMap[a.noReasonCode] || 'Not docs-worthy under conservative policy';
        markdown += `  \n  Rationale: ${why}.\n`;
      } else if (s.rationale) {
        markdown += `  \n  Rationale: ${s.rationale}\n`;
      }
      if (a.downgradeNote) markdown += `  \n  Note: ${a.downgradeNote}\n`;
      markdown += `\n`;
    });
    markdown += `\n`;
  }

  // Maybe section (only if remains after LLM)
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

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\/_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

// Collect high-signal tokens from file paths and diffs to aid coverage checks
function collectHighSignalTokens(prAnalysis, cap = 20) {
  const out = new Set();
  const files = prAnalysis.files || [];
  const featureHints = [
    // Keep platform features but avoid generic UI tokens later in hasStrongDocsSignals
    'content-manager', 'content', 'content-type-builder', 'media-library', 'internationalization', 'i18n',
    'users-permissions', 'review-workflows', 'releases', 'upload', 'email', 'graphql', 'rest', 'admin', 'rbac', 'sso'
  ];
  const genericDrop = new Set(['src','lib','dist','build','public','docs','packages','plugin','plugins','api','server','test','tests','ci','config']);

  for (const f of files) {
    const parts = String(f.filename || '').toLowerCase().split(/[\/]/).filter(Boolean);
    for (const p of parts) {
      if (genericDrop.has(p)) continue;
      // split further on - _ .
      const sub = p.split(/[._-]/).filter(s => s.length >= 3);
      for (const s of sub) out.add(s);
    }
    const base = path.basename(f.filename || '').toLowerCase().replace(/\.(mdx?|js|ts|tsx|jsx|json|yml|yaml|css|scss|less)$/,'');
    if (base && base.length >= 3) out.add(base);
  }
  for (const hint of featureHints) if ((prAnalysis.title||'').toLowerCase().includes(hint)) out.add(hint);

  // Extract option-like keys and env vars from added lines
  for (const f of files) {
    const patch = String(f.patch || '');
    const lines = patch.split(/\r?\n/);
    for (const line of lines) {
      if (!line.startsWith('+')) continue;
      const l = line.slice(1);
      const envMatch = l.match(/process\.env\.([A-Z0-9_]+)/);
      if (envMatch) out.add(envMatch[1].toLowerCase());
      const keyMatches = l.match(/[A-Za-z][A-Za-z0-9_-]{3,}/g);
      if (keyMatches) {
        for (const k of keyMatches) {
          const kk = k.toLowerCase();
          if (kk.length >= 4 && !genericDrop.has(kk)) out.add(kk);
        }
      }
    }
  }

  return Array.from(out).slice(0, cap);
}

// Resolve the best matching docs page for a target path using the full llms-full index
function resolvePageForTarget(llmsIndex, candidates, targetPath) {
  if (!llmsIndex || !Array.isArray(llmsIndex.pages) || llmsIndex.pages.length === 0) return null;
  const wanted = String(targetPath || '').toLowerCase();
  const slug = path.basename(wanted).replace(/\.mdx?$/i, '').toLowerCase();

  // 1) Exact slug match via bySlug
  if (slug && llmsIndex.bySlug && llmsIndex.bySlug.has(slug)) {
    return llmsIndex.bySlug.get(slug);
  }

  // 2) Any candidate URL that contains the slug
  if (Array.isArray(candidates) && candidates.length > 0 && slug) {
    const hit = candidates.find(p => p.url && p.url.toLowerCase().includes(slug));
    if (hit) return hit;
  }

  // 3) Score all pages in the index by slug/title/url similarity
  const slugTokens = tokenize(slug);
  let best = null;
  let bestScore = 0;
  for (const p of llmsIndex.pages) {
    const title = (p.title || '').toLowerCase();
    const url = (p.url || '').toLowerCase();
    let score = 0;
    if (slug && title.includes(slug)) score += 5;
    if (slug && url.includes(slug)) score += 4;
    // token overlap gives smaller weight
    const titleTokens = tokenize(title);
    const urlTokens = tokenize(url);
    for (const t of slugTokens) {
      if (titleTokens.includes(t)) score += 2;
      if (urlTokens.includes(t)) score += 1;
    }
    if (score > bestScore) { bestScore = score; best = p; }
  }
  return best || (Array.isArray(candidates) && candidates[0]) || null;
}

function suggestCandidateDocs(llmsIndex, prAnalysis, limit = 5) {
  if (!llmsIndex || !llmsIndex.pages || llmsIndex.pages.length === 0) return [];
  const hay = [];
  hay.push(...tokenize(prAnalysis.title));
  for (const f of prAnalysis.files || []) hay.push(...tokenize(f.filename));
  const bag = new Map();
  for (const t of hay) bag.set(t, (bag.get(t) || 0) + 1);

  const scored = llmsIndex.pages.map(p => {
    const titleTokens = tokenize(p.title);
    const urlTokens = tokenize(p.url || '');
    let score = 0;
    for (const t of titleTokens) score += (bag.get(t) || 0) * 3; // favor title hits
    for (const t of urlTokens) score += (bag.get(t) || 0);
    return { page: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter(s => s.score > 0).slice(0, limit).map(s => s.page);
}

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

function classifyImpact(prAnalysis) {
  const files = prAnalysis.files || [];
  const title = (prAnalysis.title || '').toLowerCase();

  if (files.length === 0) {
    return { verdict: 'maybe', reason: 'No files listed; uncertain impact.' };
  }

  const allUnder = (prefix) => files.every(f => f.filename.startsWith(prefix));
  const onlyExtensions = (exts) => files.every(f => exts.some(ext => f.filename.endsWith(ext)));

  // Clear "No" buckets: tests, CI, metadata only, or dev-only noise
  const isTestsOnly = allUnder('tests/') || files.every(f => /(^|\/)__(tests|mocks)__(\/|$)|\.test\./.test(f.filename));
  const isCIOnly = files.every(f => f.filename.startsWith('.github/') || f.filename.includes('/.github/'));
  const isLocksOnly = onlyExtensions(['yarn.lock', 'pnpm-lock.yaml', 'package-lock.json']);
  const isMetaOnly = files.every(f => /(^|\/)package\.json$|^tsconfig.*\.json$|^jest\.config|^\.eslintrc/.test(f.filename));
  if (isTestsOnly || isCIOnly || isLocksOnly || isMetaOnly) {
    return { verdict: 'no', reason: 'Non-user facing changes (tests/CI/locks/metadata).' };
  }

  // Strong Yes signals
  if (/breaking|deprecat|remove|feat|feature|introduc|add\b/.test(title)) {
    return { verdict: 'yes', reason: 'PR title indicates user-facing changes.' };
  }

  const yesPathPatterns = [
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
  const hitYes = files.some(f => yesPathPatterns.some(re => re.test(f.filename)));
  if (hitYes) {
    return { verdict: 'yes', reason: 'Touches user-facing code paths (API/config/features).' };
  }

  // Maybe by default when code changes but signals are weak
  return { verdict: 'maybe', reason: 'Code changes detected; possible docs impact.' };
}

// Detect micro UI-only changes likely not worth docs
function isMicroUiChange(prAnalysis) {
  const title = (prAnalysis.title || '').toLowerCase();
  const body = (prAnalysis.body || '').toLowerCase();
  const files = prAnalysis.files || [];

  const cosmeticKeywords = [
    'tooltip', 'tooltips', 'spacing', 'margin', 'padding', 'align', 'alignment',
    'border', 'borders', 'icon', 'icons', 'label', 'labels', 'translation', 'translations',
    'typo', 'color', 'colors', 'popover', 'menu', 'dropdown', 'ui', 'layout', 'scroll', 'overflow'
  ];
  const frontendOnly = files.length > 0 && files.every(f => {
    const name = f.filename.toLowerCase();
    const isStyle = /\.(css|scss|less|sass)$/i.test(name) || name.includes('/styles') || name.includes('/style');
    const isAdmin = name.includes('/admin') || name.includes('packages/strapi-admin') || name.includes('packages/core/admin');
    const isDocsArea = /(api|server|config|routes|controllers|services)/.test(name);
    return (isStyle || isAdmin) && !isDocsArea;
  });

  const text = `${title} ${body}`;
  const hasCosmetic = cosmeticKeywords.some(k => text.includes(k));
  return hasCosmetic && frontendOnly;
}

// Strong docs signals: conservative, config/API/CLI/schema/migration only
function hasStrongDocsSignals(prAnalysis) {
  const title = (prAnalysis.title || '').toLowerCase();
  const body = (prAnalysis.body || '').toLowerCase();
  const files = prAnalysis.files || [];

  // Hard exclusions — do NOT count as strong signals
  const uiUxTerms = /\b(ui|tooltip|tooltips|spacing|margin|padding|align|alignment|border|borders|icon|icons|label|labels|translation|translations|typo|color|colors|popover|menu|dropdown|scroll|overflow|column|list|table|badge|chip|toast|modal|dialog)\b/;
  const localeTerms = /\b(locale|locales|language|languages|i18n locale|add\s+locale|add\s+language)\b/;
  if (uiUxTerms.test(title) || uiUxTerms.test(body) || localeTerms.test(title) || localeTerms.test(body)) {
    return false;
  }

  // Config / server settings
  const configFile = (f) => /(^|\/)config(\/|$)|config\.(js|ts|mjs|cjs)$/i.test(f.filename);
  const addedLines = [];
  for (const f of files) {
    const patch = String(f.patch || '');
    const lines = patch.split(/\r?\n/);
    for (const line of lines) if (line.startsWith('+')) addedLines.push(line.slice(1));
  }
  const hasEnv = addedLines.some(l => /process\.env\.[A-Z0-9_]+/.test(l));
  const hasExportConfig = files.some(f => configFile(f) && /module\.exports|export\s+default|defineConfig/.test(String(f.patch || '')));

  // API / endpoints / routes
  const routeFile = (f) => /routes?\.(js|ts|json)$/i.test(f.filename);
  const controllerFile = (f) => /controllers?\.(js|ts)$/i.test(f.filename);
  const hasHttpVerbs = addedLines.some(l => /\b(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\b/i.test(l));
  const hasRouteDefs = files.some(f => (routeFile(f) || controllerFile(f)) && /routes?:|router\.|ctx\./i.test(String(f.patch || '')));

  // GraphQL / REST schema
  const hasGraphQL = files.some(f => /graphql/i.test(f.filename) || /type\s+\w+\s*\{|schema\{|SDL|gql`/i.test(String(f.patch || '')));
  const hasRestSchema = files.some(f => /openapi|swagger|paths\s*:/i.test(String(f.patch || '')));

  // CLI flags
  const hasCli = addedLines.some(l => /(^|\s)--[a-z0-9][a-z0-9-]*/.test(l) || /yargs|commander\(|program\.option\(/i.test(l));

  // Schema / content types
  const schemaFile = (f) => /(^|\/)content-types?(\/|$)|schema\.(json|js|ts)$/i.test(f.filename);
  const hasSchema = files.some(f => schemaFile(f) && /(attributes|type\s*:|enum\s*:|relation\s*:)/i.test(String(f.patch || '')));

  // Migration / breaking language in title/body
  const hasMigrationSignals = /\b(breaking|deprecat|migration|rename\s+(setting|option|property)|v4\s*->?\s*v5|v4\s*to\s*v5|parity\s+with\s+v4)\b/i.test(title + ' ' + body);

  return (
    hasEnv || hasExportConfig || hasHttpVerbs || hasRouteDefs || hasGraphQL || hasRestSchema || hasCli || hasSchema || hasMigrationSignals
  );
}

// Detect regression/restore-to-expected behavior changes
function isRegressionRestore(prAnalysis) {
  const t = (prAnalysis.title || '').toLowerCase();
  const b = (prAnalysis.body || '').toLowerCase();
  const text = `${t} ${b}`;
  return /regression|restore|restored|revert|reverted|align with|parity with|back to expected/.test(text);
}

// Detect strong docs‑worthy signals suggesting new capability/config/API/workflow changes
function hasStrongDocsSignals(prAnalysis) {
  const title = (prAnalysis.title || '').toLowerCase();
  const body = (prAnalysis.body || '').toLowerCase();
  const files = prAnalysis.files || [];

  // Hard exclusions — do NOT count as strong signals
  const uiUxTerms = /\b(ui|tooltip|tooltips|spacing|margin|padding|align|alignment|border|borders|icon|icons|label|labels|translation|translations|typo|color|colors|popover|menu|dropdown|scroll|overflow|column|list|table|badge|chip|toast|modal|dialog)\b/;
  const localeTerms = /\b(locale|locales|language|languages|i18n locale|add\s+locale|add\s+language)\b/;
  if (uiUxTerms.test(title) || uiUxTerms.test(body) || localeTerms.test(title) || localeTerms.test(body)) {
    return false;
  }

  // Config / server settings
  const configFile = (f) => /(^|\/)config(\/|$)|config\.(js|ts|mjs|cjs)$/i.test(f.filename);
  const addedLines = [];
  for (const f of files) {
    const patch = String(f.patch || '');
    const lines = patch.split(/\r?\n/);
    for (const line of lines) if (line.startsWith('+')) addedLines.push(line.slice(1));
  }
  const hasEnv = addedLines.some(l => /process\.env\.[A-Z0-9_]+/.test(l));
  const hasExportConfig = files.some(f => configFile(f) && /module\.exports|export\s+default|defineConfig/.test(String(f.patch || '')));

  // API / endpoints / routes
  const routeFile = (f) => /routes?\.(js|ts|json)$/i.test(f.filename);
  const controllerFile = (f) => /controllers?\.(js|ts)$/i.test(f.filename);
  const hasHttpVerbs = addedLines.some(l => /\b(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\b/i.test(l));
  const hasRouteDefs = files.some(f => (routeFile(f) || controllerFile(f)) && /routes?:|router\.|ctx\./i.test(String(f.patch || '')));

  // GraphQL / REST schema
  const hasGraphQL = files.some(f => /graphql/i.test(f.filename) || /type\s+\w+\s*\{|schema\{|SDL|gql`/i.test(String(f.patch || '')));
  const hasRestSchema = files.some(f => /openapi|swagger|paths\s*:/i.test(String(f.patch || '')));

  // CLI flags
  const hasCli = addedLines.some(l => /(^|\s)--[a-z0-9][a-z0-9-]*/.test(l) || /yargs|commander\(|program\.option\(/i.test(l));

  // Schema / content types
  const schemaFile = (f) => /(^|\/)content-types?(\/|$)|schema\.(json|js|ts)$/i.test(f.filename);
  const hasSchema = files.some(f => schemaFile(f) && /(attributes|type\s*:|enum\s*:|relation\s*:)/i.test(String(f.patch || '')));

  // Migration / breaking language in title/body
  const hasMigrationSignals = /\b(breaking|deprecat|migration|rename\s+(setting|option|property)|v4\s*->?\s*v5|v4\s*to\s*v5|parity\s+with\s+v4)\b/i.test(title + ' ' + body);

  return (
    hasEnv || hasExportConfig || hasHttpVerbs || hasRouteDefs || hasGraphQL || hasRestSchema || hasCli || hasSchema || hasMigrationSignals
  );
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const { releaseUrl } = parseArgs(rawArgs);

  if (!releaseUrl) {
    console.error('❌ Usage: node index.js <github-release-url> [--use-cache] [--cache-dir=PATH] [--limit=N-for-LLM] [--strict=aggressive|balanced|conservative] [--model=NAME]');
    console.error('Defaults: fresh run (no cache reads) and refresh writes. Use --use-cache to enable reading existing cache and skip refresh.');
    console.error('Example: node index.js https://github.com/strapi/strapi/releases/tag/v5.29.0 --strict=aggressive');
    console.error('Note: All PRs are screened heuristically; --limit caps only LLM calls. Use --limit=0 for heuristics only (no ANTHROPIC_API_KEY required).');
    process.exit(1);
  }

  if (!GITHUB_TOKEN) {
    console.warn('⚠️  GITHUB_TOKEN not set — proceeding unauthenticated (lower rate limits)');
  }

  const llmCapProvided = OPTIONS.limit !== undefined && OPTIONS.limit !== null;
  const willUseLLM = !(llmCapProvided && Number(OPTIONS.limit) === 0);
  if (willUseLLM && !ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is required when LLM calls are enabled');
    console.error('Set --limit=0 to run heuristics only without an Anthropic key.');
    process.exit(1);
  }

  console.log('🚀 Starting Strapi Release Documentation Analysis\n');
  console.log(`🤖 Using Claude ${CLAUDE_MODEL} for intelligent analysis\n`);
  
  try {
    const releaseInfo = await parseReleaseNotes(releaseUrl);
    CURRENT_RELEASE_TAG = releaseInfo.tag;
    
    const llmsIndex = await readLlmsFullIndex();
    if (llmsIndex.source) {
      console.log(`📚 Loaded docs index from ${llmsIndex.source} (${llmsIndex.pages.length} pages)`);
    }
    
    const totalPRs = releaseInfo.prNumbers.length;
    if (OPTIONS.limit && OPTIONS.limit > 0) {
      console.log(`\n📝 Analyzing ${totalPRs} PRs (LLM on up to ${OPTIONS.limit} of ${totalPRs})...\n`);
    } else {
      console.log(`\n📝 Analyzing ${totalPRs} PRs...\n`);
    }
    
    const analyses = [];
    let skipped = 0;
    
    const prList = Array.isArray(releaseInfo.prNumbers) ? releaseInfo.prNumbers : [];
    for (const prNumber of prList) {
      const prAnalysis = await analyzePR(prNumber);

      if (!prAnalysis) {
        skipped++;
        continue;
      }

      // Pretty header per PR for readability
      try {
        const headerTitle = (prAnalysis.title || '').trim();
        console.log(`\n— PR #${prNumber} — ${headerTitle}`);
      } catch {}

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
        const strong = hasStrongDocsSignals(prAnalysis) || impact.verdict === 'yes';
        // Bug-like defaults to NO unless strong signals indicate config/API/schema/migration
        const isBugLike = prAnalysis.category === 'bug' || /\bfix|bug\b/i.test(prAnalysis.title || '') || /\bfix|bug\b/i.test(prAnalysis.body || '');
        allowByStrict = isFeatureEnhancement || (strong && !isMicroUiChange(prAnalysis));
        if (isBugLike && !strong) allowByStrict = false;
        if (!allowByStrict && canUseLLM && !preNoReason) {
          console.log('  ⏭️  Skipping LLM call under conservative routing (no strong docs signals)');
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
        console.log(`  ⛳ Pre-LLM gate → NO (${preNoReason})`);
        downgradeNote = `Downgraded to No under conservative policy: ${preNoReason}.`;
        noReasonCode = preNoCode || null;
      }

      // Apply strictness downgrade in conservative mode for micro UI or regression restores
      if (OPTIONS.strict === 'conservative' && claudeSuggestions && claudeSuggestions.needsDocs === 'yes') {
        if (isMicroUiChange(prAnalysis)) {
          claudeSuggestions = { ...claudeSuggestions, needsDocs: 'no' };
          downgradeNote = 'Conservative downgrade: micro UI-only change.';
          noReasonCode = 'llm_downgrade_micro_ui';
          console.log('  🔻 Downgrade → NO (micro UI-only change)');
        } else if (isRegressionRestore(prAnalysis)) {
          claudeSuggestions = { ...claudeSuggestions, needsDocs: 'no' };
          downgradeNote = 'Conservative downgrade: regression/restore to expected behavior.';
          noReasonCode = 'llm_downgrade_regression_restore';
          console.log('  🔻 Downgrade → NO (restore to expected behavior)');
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
            console.log('  🔻 Downgrade → NO (docs coverage likely matches end behavior)');
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
      if (validated.length === 0 && !claudeSuggestions.newPage) {
        // No resolvable targets and not a new page request → No
        claudeSuggestions = { ...claudeSuggestions, needsDocs: 'no' };
        downgradeNote = 'Targets did not resolve to known docs pages and newPage not requested.';
        noReasonCode = 'llm_downgrade_invalid_targets';
        console.log('  🔻 Downgrade → NO (targets invalid and not a new page)');
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
          console.log('  🔻 Downgrade → NO (section-heavy page requires anchor)');
        }
      }
    }

      // Hard conservative guard post‑LLM: bug fixes without strong signals default to No
      if (OPTIONS.strict === 'conservative' && claudeSuggestions && claudeSuggestions.needsDocs === 'yes') {
        const isBugLike = prAnalysis.category === 'bug' || /\bfix|bug\b/i.test(prAnalysis.title || '') || /\bfix|bug\b/i.test(prAnalysis.body || '');
        if (isBugLike && !hasStrongDocsSignals(prAnalysis) && !claudeSuggestions.newPage) {
          claudeSuggestions = { ...claudeSuggestions, needsDocs: 'no' };
          downgradeNote = 'Conservative guard: bug fix without strong docs signals.';
          noReasonCode = 'conservative_guard_no_strong_signals';
          console.log('  🔻 Downgrade → NO (conservative guard: bug without strong signals)');
        }
      }

      // Final per-PR log line for decision provenance
      // Final per-PR log line for decision provenance
      const provenance = runLLM ? 'llm' : 'heuristic';
      if (runLLM) {
        console.log('  🤝 Decision provenance: LLM assisted');
        if (llmInitial && llmInitial.verdict) {
          console.log(`  🧪 LLM initial: ${String(llmInitial.verdict).toUpperCase()}`);
        }
      } else {
        console.log('  🧭 Decision provenance: Heuristic only');
      }

      if (downgradeNote) {
        console.log(`  📝 Downgrade note: ${downgradeNote}`);
      }

      const finalVerdict = (claudeSuggestions && claudeSuggestions.needsDocs) || (impact && impact.verdict) || 'maybe';
      console.log(`  ✅ Final verdict: ${String(finalVerdict).toUpperCase()}`);
      // Visual spacer between PRs
      console.log('');

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
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n✅ Analysis complete!`);
    console.log(`   📊 Analyzed: ${analyses.length} PRs`);
    console.log(`   ⏭️  Skipped: ${skipped} PRs (chores, tests, CI)\n`);
    
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
