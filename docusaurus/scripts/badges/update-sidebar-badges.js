#!/usr/bin/env node
/**
 * Refresh the "New" and "Updated" sidebar badges for a documentation release.
 *
 * Strapi Docs ships by milestone, so a milestone is the unit of work here:
 *
 *   1. every existing badge is removed, so none can outlive its release;
 *   2. the badges this milestone earns are applied.
 *
 * Both steps run in one pass and produce a single commit, which is what makes
 * the result reviewable: the diff shows exactly which pages the release calls
 * new, which it calls updated, and which stopped being either.
 *
 * Usage:
 *   node scripts/badges/update-sidebar-badges.js --milestone 7.5.0
 *   node scripts/badges/update-sidebar-badges.js --milestone 7.5.0 --dry-run
 *   node scripts/badges/update-sidebar-badges.js --reset
 */

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const { setBadge, resetBadges } = require('./sidebar-editor.js');

const SIDEBARS = path.join(__dirname, '..', '..', 'sidebars.js');
const DOCS_DIR = 'docusaurus/docs/';
const DOC_PATH = /^docusaurus\/docs\/(cms|cloud)\/.+\.mdx?$/;

/**
 * A page needs more than this many changed lines to be called updated.
 *
 * The number is not new: `auto-label-prs-for-source-and-content.yml` already
 * uses 30 changed lines to tell `pr: updated content` from `pr: chore`. The
 * same number is applied here per page rather than per pull request, so that a
 * release does not badge a page that only lost a typo.
 */
const UPDATED_LINE_THRESHOLD = 30;

/**
 * A pull request touching more than this many documentation pages is a sweep,
 * and a sweep badges nothing.
 *
 * Measured on #3546, "Type env parameter in TypeScript configuration
 * examples": 22 pages, a mechanical change on each, and one page that happened
 * to also gain a real note. Per-page thresholds cannot tell that apart, and
 * the release would have shipped 11 badges for one maintenance pass.
 */
const SWEEP_PAGE_LIMIT = 5;

/** Pull requests carrying this label never produce a badge. */
const CHORE_LABEL = 'pr: chore';

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 1e9 });
}

function parseArgs(argv) {
  const args = { dryRun: false, reset: false, repo: 'strapi/documentation' };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--milestone': args.milestone = argv[++i]; break;
      case '--repo': args.repo = argv[++i]; break;
      case '--dry-run': args.dryRun = true; break;
      case '--reset': args.reset = true; break;
      case '--help': case '-h': args.help = true; break;
      default: throw new Error(`unknown argument: ${argv[i]}`);
    }
  }
  return args;
}

/** Merged pull requests of a milestone, minus the chores. */
function milestonePullRequests(repo, milestone) {
  const raw = gh([
    'pr', 'list', '--repo', repo,
    '--search', `milestone:"${milestone}"`,
    '--state', 'merged', '--limit', '200',
    '--json', 'number,title,labels',
  ]);
  return JSON.parse(raw).map((pr) => ({
    number: pr.number,
    title: pr.title,
    labels: pr.labels.map((l) => l.name),
  }));
}

/** Documentation pages a pull request touched, with their status and size. */
function pullRequestPages(repo, number) {
  const raw = gh([
    'api', `repos/${repo}/pulls/${number}/files`, '--paginate',
    '--jq', '[.[] | {filename, status, additions, deletions}]',
  ]);
  // --paginate concatenates one JSON array per page of results.
  const pages = raw.trim().split('\n').filter(Boolean).flatMap((line) => JSON.parse(line));
  return pages
    .filter((f) => DOC_PATH.test(f.filename))
    .map((f) => ({
      docId: f.filename.slice(DOCS_DIR.length).replace(/\.mdx?$/, ''),
      status: f.status,
      changed: f.additions + f.deletions,
    }));
}

/**
 * Decide the badge each page earns across the whole milestone.
 *
 * A page added by one pull request and edited by another is new, not updated:
 * for a reader arriving at the release, the page did not exist before.
 */
function badgesForMilestone(repo, milestone) {
  const badges = new Map();
  const skipped = [];
  const prs = milestonePullRequests(repo, milestone);

  for (const pr of prs) {
    if (pr.labels.includes(CHORE_LABEL)) {
      skipped.push({ ...pr, reason: CHORE_LABEL });
      continue;
    }

    const pages = pullRequestPages(repo, pr.number);
    if (pages.length === 0) {
      skipped.push({ ...pr, reason: 'no documentation page' });
      continue;
    }
    if (pages.length > SWEEP_PAGE_LIMIT) {
      skipped.push({ ...pr, reason: `sweep: ${pages.length} pages` });
      continue;
    }

    for (const page of pages) {
      if (page.status === 'removed') continue;
      const type = page.status === 'added' ? 'new' : 'updated';
      if (type === 'updated' && page.changed <= UPDATED_LINE_THRESHOLD) continue;

      const current = badges.get(page.docId);
      if (!current || (current.type === 'updated' && type === 'new')) {
        badges.set(page.docId, { type, pr: pr.number, changed: page.changed });
      }
    }
  }

  return { badges, skipped, pullRequests: prs };
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || (!args.milestone && !args.reset)) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^\/\*\*?|^ ?\* ?/gm, ''));
    process.exit(args.help ? 0 : 1);
  }

  const original = fs.readFileSync(SIDEBARS, 'utf8');
  const { source: cleared, removed } = resetBadges(original);
  console.log(`Reset: ${removed} badge${removed === 1 ? '' : 's'} removed`);

  let source = cleared;
  const applied = [];
  const unplaceable = [];

  if (args.milestone) {
    const { badges, skipped } = badgesForMilestone(args.repo, args.milestone);

    for (const [docId, badge] of [...badges].sort(([a], [b]) => a.localeCompare(b))) {
      const result = setBadge(source, docId, badge.type);
      if (result.status === 'not-found') {
        unplaceable.push({ docId, ...badge });
        continue;
      }
      source = result.source;
      applied.push({ docId, ...badge, occurrences: result.occurrences });
    }

    console.log(`\nMilestone ${args.milestone}`);
    for (const pr of skipped) console.log(`  skipped  #${pr.number}  ${pr.reason}`);
    console.log('');
    for (const b of applied) {
      const extra = b.occurrences > 1 ? `  (${b.occurrences} sidebar entries)` : '';
      console.log(`  ${b.type.padEnd(7)}  ${b.docId}  (#${b.pr}, ${b.changed} lines)${extra}`);
    }
    if (unplaceable.length > 0) {
      console.log('\n  Not in the sidebar, so they cannot carry a badge:');
      for (const b of unplaceable) console.log(`    ${b.docId}  (#${b.pr})`);
    }
  }

  if (source === original) {
    console.log('\nsidebars.js is already up to date.');
    return;
  }

  if (args.dryRun) {
    console.log('\n--dry-run: sidebars.js left untouched.');
    return;
  }

  fs.writeFileSync(SIDEBARS, source);
  console.log(`\nWrote ${path.relative(process.cwd(), SIDEBARS)}.`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { badgesForMilestone, UPDATED_LINE_THRESHOLD, SWEEP_PAGE_LIMIT };
