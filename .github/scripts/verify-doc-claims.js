#!/usr/bin/env node
//
// Checks the "this is already documented in X" claims an AI answer makes before
// that answer is posted on an issue.
//
// The failure this exists for: on issue #3427 the generated answer said the
// watch-admin change was "already documented in the breaking changes page". It
// was not — the string did not appear anywhere under docs/cms/migration/. A
// human caught it. Nothing in the pipeline did, and the answer had already been
// turned into a PR by then.
//
// What it does NOT do: judge whether the answer is correct, or whether a page
// covers a topic well. It answers one narrow, decidable question — the answer
// points at a page and implies the topic lives there, so does the page contain
// the topic's terms at all? A page that exists but never mentions the subject is
// the exact shape of the #3427 mistake.
//
// Usage:
//   node verify-doc-claims.js <answer-file> <issue-title> [issue-body-file]
//
// Prints a JSON report on stdout:
//   { "checked": n, "unverified": [ { "url", "path", "terms" } ] }

const fs = require('fs');
const path = require('path');

const DOCS_ROOT = path.join(__dirname, '..', '..', 'docusaurus', 'docs');

// Words that carry no topic meaning, so finding them on a page proves nothing.
// Deliberately short: over-filtering makes the check silently pass.
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'can', 'do',
  'does', 'for', 'from', 'has', 'have', 'how', 'in', 'is', 'it', 'its', 'not',
  'of', 'on', 'or', 'strapi', 'that', 'the', 'their', 'them', 'then', 'there',
  'this', 'to', 'was', 'were', 'what', 'when', 'where', 'which', 'why', 'with',
  'you', 'your', 'doc', 'docs', 'documentation', 'page', 'issue', 'feedback',
]);

// Phrases that turn a link into a claim about where something is documented.
// A link alone is just a reference ("see also"); these are what make the answer
// assert that the topic is covered there.
const CLAIM_MARKERS = [
  'already documented',
  'already mentioned',
  'already covered',
  'already described',
  'already explained',
  'is documented',
  'is mentioned',
  'is covered',
  'is described',
  'is explained',
  'documented in',
  'mentioned in',
  'covered in',
  'described in',
  'explained in',
  'as noted in',
  'as documented',
  'see the',
  'refer to',
];

/**
 * Maps a docs.strapi.io URL to the file backing it, or null when no file
 * matches. Anchors and query strings are dropped: the claim is about the page.
 */
function urlToFile(url) {
  let route;
  try {
    route = new URL(url).pathname;
  } catch {
    return null;
  }

  route = route.replace(/\/+$/, '');
  if (!route) return null;

  // Only CMS and Cloud docs live in this repo. Anything else (blog, market,
  // strapi.io proper) is out of scope and must not be reported as missing.
  if (!/^\/(cms|cloud)(\/|$)/.test(route)) return null;

  const rel = route.replace(/^\//, '');
  const candidates = [
    `${rel}.md`,
    `${rel}.mdx`,
    path.join(rel, 'index.md'),
    path.join(rel, 'index.mdx'),
  ];

  for (const candidate of candidates) {
    const full = path.join(DOCS_ROOT, candidate);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

/**
 * The topic terms a page must mention for the claim to hold. Drawn from the
 * issue title and body rather than the answer, so the answer cannot satisfy the
 * check by quoting itself.
 *
 * Hyphenated identifiers (watch-admin, publicationState) are what actually
 * discriminate, so they are kept whole and preferred over bare words.
 */
function topicTerms(issueTitle, issueBody) {
  const source = `${issueTitle}\n${issueBody || ''}`;

  // Strip fenced code and URLs: a term appearing only in the reporter's stack
  // trace or link is not the subject of the issue.
  const prose = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, (m) => ` ${m.slice(1, -1)} `)
    .replace(/https?:\/\/\S+/g, ' ');

  const identifiers = new Set();
  const words = new Set();

  for (const raw of prose.split(/[^A-Za-z0-9_-]+/)) {
    const token = raw.replace(/^[-_]+|[-_]+$/g, '');
    if (token.length < 3) continue;
    const lower = token.toLowerCase();
    if (STOP_WORDS.has(lower)) continue;

    // A hyphen or an internal capital means the author typed a name, not prose.
    if (token.includes('-') || /[a-z][A-Z]/.test(token)) {
      identifiers.add(lower);
    } else {
      words.add(lower);
    }
  }

  // Identifiers alone when there are any: they are precise, and mixing in
  // generic words would let an unrelated page pass on a single common noun.
  return identifiers.size > 0 ? [...identifiers] : [...words].slice(0, 8);
}

/**
 * True when the sentence containing the link claims the topic is documented
 * there, rather than merely linking to it.
 */
function isClaim(answer, url) {
  const index = answer.indexOf(url);
  if (index === -1) return false;

  // The sentence around the link, bounded generously — Kapa writes long ones,
  // and the marker often sits before the link rather than beside it.
  const start = Math.max(0, index - 300);
  const context = answer.slice(start, index + url.length + 100).toLowerCase();

  return CLAIM_MARKERS.some((marker) => context.includes(marker));
}

/** Every .md/.mdx page under docs/, so a topic can be looked for repo-wide. */
function allDocFiles(dir = DOCS_ROOT, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) allDocFiles(full, acc);
    else if (/\.mdx?$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

/**
 * True when the answer asserts the topic is already covered somewhere, without
 * necessarily linking to it.
 *
 * This is the #3427 shape, and it is the one that does real damage: the answer
 * said "the breaking changes list does reference the removal of the
 * `strapi watch-admin` command" while the only link in that sentence pointed at
 * the CLI page. Checking linked pages alone cannot catch it, because the page
 * being lied about was never linked.
 */
function assertsExistingCoverage(answer) {
  const markers = [
    'already documented',
    'already mentioned',
    'already covered',
    'already described',
    'already explained',
    'does reference',
    'does mention',
    'does document',
    'does cover',
    'is documented in',
    'is mentioned in',
    'is covered in',
    'is already',
    'this is documented',
    'as documented in',
    'as mentioned in',
  ];
  const lower = answer.toLowerCase();
  return markers.filter((m) => lower.includes(m));
}

function main() {
  const [answerFile, issueTitle, issueBodyFile] = process.argv.slice(2);

  if (!answerFile || !issueTitle) {
    console.error('usage: verify-doc-claims.js <answer-file> <issue-title> [issue-body-file]');
    process.exit(2);
  }

  const answer = fs.readFileSync(answerFile, 'utf8');
  const issueBody = issueBodyFile && fs.existsSync(issueBodyFile)
    ? fs.readFileSync(issueBodyFile, 'utf8')
    : '';

  const terms = topicTerms(issueTitle, issueBody);

  // No usable terms means nothing can be verified. Report it as such rather
  // than as a clean pass.
  if (terms.length === 0) {
    console.log(JSON.stringify({
      checked: 0, unverified: [], coverage: null, reason: 'no topic terms',
    }));
    return;
  }

  const urls = [...new Set(answer.match(/https?:\/\/docs\.strapi\.io\/[^\s)\]"'>]+/g) || [])];

  const unverified = [];
  let checked = 0;

  for (const url of urls) {
    if (!isClaim(answer, url)) continue;

    const file = urlToFile(url);
    if (!file) continue; // Unmappable or out of scope: not evidence of an error.

    checked += 1;
    const content = fs.readFileSync(file, 'utf8').toLowerCase();

    if (!terms.some((term) => content.includes(term))) {
      unverified.push({
        url: url.replace(/[.,;:]$/, ''),
        path: path.relative(path.join(__dirname, '..', '..'), file),
        terms,
      });
    }
  }

  // Second, independent question: the answer claims the topic is already
  // covered — is it anywhere in the docs at all?
  let coverage = null;
  const markers = assertsExistingCoverage(answer);

  if (markers.length > 0) {
    const repoRoot = path.join(__dirname, '..', '..');
    const hits = [];

    for (const file of allDocFiles()) {
      const content = fs.readFileSync(file, 'utf8').toLowerCase();
      if (terms.some((term) => content.includes(term))) {
        hits.push(path.relative(repoRoot, file));
        if (hits.length >= 5) break;
      }
    }

    coverage = { asserted: markers, terms, found: hits.length > 0, pages: hits };
  }

  console.log(JSON.stringify({ checked, unverified, coverage }));
}

main();
