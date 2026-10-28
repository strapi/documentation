#!/usr/bin/env node
/**
 * Assign a milestone to a strapi/documentation pull request.
 *
 * Rules:
 *   - A PR that already has a milestone keeps it.
 *   - By default, the PR gets the next docs milestone: the open milestone with
 *     the earliest date.
 *   - If the PR body references a strapi/strapi PR whose milestone is not
 *     released yet and ships on another date than the next docs milestone,
 *     the PR gets the open docs milestone on that date. If none exists, one is
 *     created: the next milestone's version with the patch number bumped
 *     (7.5.1 -> 7.5.2), due on the strapi/strapi milestone's date.
 *   - If the PR has the "pr: new content" label, its milestone becomes a minor
 *     version: a patch milestone is renamed (7.5.1 -> 7.6.0), so every PR in
 *     that release follows. This also runs when the label is added later.
 *
 * Labels: the "pr:" type label is set by another workflow that starts at the
 * same time. With WAIT_FOR_LABEL=true, the script checks for it once a minute
 * for 5 minutes, then once more 30 minutes later, then goes on without it.
 *
 * Dates: docs and strapi/strapi milestones always ship on a Wednesday. A
 * milestone without a due date is assumed to ship on the first Wednesday after
 * the latest published release of its repository (same major for strapi/strapi,
 * where v4 and v5 releases interleave).
 *
 * Usage: PR_NUMBER=3573 GH_TOKEN=... [DRY_RUN=true] [WAIT_FOR_LABEL=true] node assign-milestone.mjs
 *        ALL_WITHOUT_MILESTONE=true GH_TOKEN=... [DRY_RUN=true] node assign-milestone.mjs
 *        (every open PR without a milestone; PR_NUMBER is then ignored)
 */

import { pathToFileURL } from 'node:url';

const DOCS_REPO = 'strapi/documentation';
const STRAPI_REPO = 'strapi/strapi';

const GH_TOKEN = process.env.GH_TOKEN;
const PR_NUMBER = process.env.PR_NUMBER;
const DRY_RUN = process.env.DRY_RUN === 'true';
const WAIT_FOR_LABEL = process.env.WAIT_FOR_LABEL === 'true';
const ALL_WITHOUT_MILESTONE = process.env.ALL_WITHOUT_MILESTONE === 'true';
// Minutes to wait before each new check for the "pr:" label.
const LABEL_CHECK_DELAYS = [1, 1, 1, 1, 1, 30];

const NEW_CONTENT_LABEL = 'pr: new content';

const STRAPI_PR_REF = /(?:github\.com\/strapi\/strapi\/pull\/|strapi\/strapi#)(\d+)/g;

// ---------------------------------------------------------------------------
// Pure helpers (exported for tests)
// ---------------------------------------------------------------------------

export function parseVersion(title) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec((title || '').trim());
  return match ? match.slice(1).map(Number) : null;
}

export function compareVersions(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

/** First Wednesday strictly after an ISO date, as YYYY-MM-DD (UTC). */
export function nextWednesdayAfter(isoDate) {
  const date = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  const daysToAdd = ((3 - date.getUTCDay() + 7) % 7) || 7;
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  return date.toISOString().slice(0, 10);
}

/** A milestone's ship date: its due date, or the Wednesday after the latest release. */
export function milestoneDate(milestone, latestReleaseDate) {
  if (milestone.due_on) return milestone.due_on.slice(0, 10);
  return latestReleaseDate ? nextWednesdayAfter(latestReleaseDate) : null;
}

/** The minor version a patch milestone becomes (7.5.1 -> 7.6.0), or null if already a minor. */
export function minorTitle(title) {
  const [major, minor, patch] = parseVersion(title);
  return patch === 0 ? null : `${major}.${minor + 1}.0`;
}

export function extractStrapiPrNumbers(body) {
  return [...new Set([...(body || '').matchAll(STRAPI_PR_REF)].map((m) => Number(m[1])))];
}

/**
 * Decide which docs milestone a PR gets.
 *
 * @param docsMilestones  all docs milestones (open and closed), with `date` resolved
 * @param strapiDate      ship date of the linked unreleased strapi/strapi milestone, or null
 * @returns {{action: 'assign', milestone} | {action: 'create', title, date} | {action: 'none', reason}}
 */
export function decideMilestone(docsMilestones, strapiDate) {
  const open = docsMilestones
    .filter((m) => m.state === 'open' && parseVersion(m.title) && m.date)
    .sort((a, b) => a.date.localeCompare(b.date)
      || compareVersions(parseVersion(a.title), parseVersion(b.title)));

  if (open.length === 0) {
    return { action: 'none', reason: 'no open docs milestone with a version title' };
  }

  const next = open[0];
  if (!strapiDate || strapiDate === next.date) {
    return { action: 'assign', milestone: next };
  }

  const sameDate = open.find((m) => m.date === strapiDate);
  if (sameDate) return { action: 'assign', milestone: sameDate };

  const taken = new Set(docsMilestones.map((m) => m.title.trim()));
  const [major, minor, patch] = parseVersion(next.title);
  let bump = patch + 1;
  while (taken.has(`${major}.${minor}.${bump}`)) bump++;
  return { action: 'create', title: `${major}.${minor}.${bump}`, date: strapiDate };
}

// ---------------------------------------------------------------------------
// GitHub API
// ---------------------------------------------------------------------------

async function gh(path, options = {}) {
  const response = await fetch(`https://api.github.com/${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${GH_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`GitHub ${options.method || 'GET'} ${path}: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

/**
 * Every item of a paginated endpoint. GitHub caps a page at 100 items and
 * returns milestones oldest first, so a single page only ever shows the
 * closed ones once the repository has more than 100 milestones.
 */
async function ghAll(path) {
  const items = [];
  for (let page = 1; ; page++) {
    const batch = await gh(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    if (!batch?.length) return items;
    items.push(...batch);
    if (batch.length < 100) return items;
  }
}

/** Publish date of the latest non-draft, non-prerelease release, optionally restricted to a major. */
async function latestReleaseDate(repo, major) {
  const releases = await gh(`repos/${repo}/releases?per_page=50`);
  const dates = releases
    .filter((r) => !r.draft && !r.prerelease)
    .filter((r) => major === undefined || parseVersion(r.tag_name)?.[0] === major)
    .map((r) => r.published_at)
    .sort();
  return dates.at(-1) ?? null;
}

/** Ship date of the first referenced strapi/strapi PR with an unreleased milestone, or null. */
async function strapiShipDate(body) {
  for (const number of extractStrapiPrNumbers(body)) {
    const issue = await gh(`repos/${STRAPI_REPO}/issues/${number}`);
    const milestone = issue?.milestone;
    if (!milestone) continue;
    console.log(`Linked ${STRAPI_REPO}#${number} is in milestone ${milestone.title} (${milestone.state})`);
    if (milestone.state !== 'open') {
      console.log('That milestone is already released: no date constraint');
      return null;
    }
    const major = parseVersion(milestone.title)?.[0];
    const date = milestoneDate(milestone, await latestReleaseDate(STRAPI_REPO, major));
    console.log(`Its ship date is ${date}${milestone.due_on ? '' : ' (no due date, assumed next Wednesday)'}`);
    return date;
  }
  return null;
}

/** Re-read the PR on the LABEL_CHECK_DELAYS schedule until it has a "pr:" type label. */
async function waitForTypeLabel(pr, prNumber) {
  const hasTypeLabel = (p) => p.labels.some((l) => l.name.startsWith('pr:'));
  for (const delay of LABEL_CHECK_DELAYS) {
    if (hasTypeLabel(pr)) return pr;
    console.log(`No "pr:" label yet, checking again in ${delay} minute${delay > 1 ? 's' : ''}`);
    await new Promise((resolve) => setTimeout(resolve, delay * 60_000));
    pr = await gh(`repos/${DOCS_REPO}/issues/${prNumber}`);
  }
  if (!hasTypeLabel(pr)) {
    const total = LABEL_CHECK_DELAYS.reduce((a, b) => a + b, 0);
    console.log(`::warning::PR #${prNumber} still has no "pr:" label after ${total} minutes`);
  }
  return pr;
}

/** Rename a patch milestone to the next minor version, unless that title is taken. */
async function promoteToMinor(milestone, docsMilestones) {
  const title = minorTitle(milestone.title);
  if (!title || milestone.state === 'closed') {
    console.log(`Milestone ${milestone.title} is ${title ? 'closed' : 'already a minor version'}, not renamed`);
    return milestone;
  }
  if (docsMilestones.some((m) => m.title.trim() === title)) {
    console.log(`::warning::Cannot rename milestone ${milestone.title} to ${title}: that milestone already exists`);
    return milestone;
  }
  console.log(`${DRY_RUN ? '[dry run] Would rename' : 'Renaming'} milestone ${milestone.title} to ${title} (new content)`);
  if (DRY_RUN) return { ...milestone, title };
  return gh(`repos/${DOCS_REPO}/milestones/${milestone.number}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

async function assignMilestone(prNumber) {
  let pr = await gh(`repos/${DOCS_REPO}/issues/${prNumber}`);
  if (WAIT_FOR_LABEL && !pr.milestone) pr = await waitForTypeLabel(pr, prNumber);
  const isNewContent = pr.labels.some((l) => l.name === NEW_CONTENT_LABEL);

  if (pr.milestone && !isNewContent) {
    console.log(`PR #${prNumber} already has milestone ${pr.milestone.title}, nothing to do`);
    return;
  }

  const docsReleaseDate = await latestReleaseDate(DOCS_REPO);
  const docsMilestones = (await ghAll(`repos/${DOCS_REPO}/milestones?state=all`))
    .map((m) => ({ ...m, date: milestoneDate(m, docsReleaseDate) }));

  if (pr.milestone) {
    await promoteToMinor(pr.milestone, docsMilestones);
    return;
  }

  const decision = decideMilestone(docsMilestones, await strapiShipDate(pr.body));

  let milestone;
  if (decision.action === 'none') {
    console.log(`::warning::No milestone assigned to PR #${prNumber}: ${decision.reason}`);
    return;
  }
  if (decision.action === 'create') {
    console.log(`Creating docs milestone ${decision.title} due ${decision.date}`);
    milestone = DRY_RUN
      ? { number: '(new)', title: decision.title }
      : await gh(`repos/${DOCS_REPO}/milestones`, {
        method: 'POST',
        body: JSON.stringify({ title: decision.title, due_on: `${decision.date}T00:00:00Z` }),
      });
    docsMilestones.push(milestone);
  } else {
    milestone = decision.milestone;
  }

  if (isNewContent) milestone = await promoteToMinor(milestone, docsMilestones);

  console.log(`${DRY_RUN ? '[dry run] Would assign' : 'Assigning'} milestone ${milestone.title} to PR #${prNumber}`);
  if (!DRY_RUN) {
    await gh(`repos/${DOCS_REPO}/issues/${prNumber}`, {
      method: 'PATCH',
      body: JSON.stringify({ milestone: milestone.number }),
    });
  }
}

/** Numbers of the open PRs that have no milestone. */
async function openPrsWithoutMilestone() {
  const query = encodeURIComponent(`repo:${DOCS_REPO} is:pr is:open no:milestone`);
  const { items } = await gh(`search/issues?q=${query}&per_page=100`);
  return items.map((item) => item.number);
}

async function main() {
  if (!GH_TOKEN) throw new Error('GH_TOKEN is required');
  if (!ALL_WITHOUT_MILESTONE) {
    if (!PR_NUMBER) throw new Error('PR_NUMBER is required unless ALL_WITHOUT_MILESTONE=true');
    await assignMilestone(PR_NUMBER);
    return;
  }

  const numbers = await openPrsWithoutMilestone();
  console.log(`${numbers.length} open PRs without a milestone: ${numbers.map((n) => `#${n}`).join(', ')}`);
  let failures = 0;
  for (const number of numbers) {
    console.log(`\n--- PR #${number}`);
    try {
      await assignMilestone(number);
    } catch (error) {
      failures++;
      console.log(`::error::PR #${number}: ${error.message}`);
    }
  }
  if (failures) throw new Error(`${failures} PRs failed`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
