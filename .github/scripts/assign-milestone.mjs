#!/usr/bin/env node
/**
 * Assign a milestone to a strapi/documentation pull request.
 *
 * Rules:
 *   - A PR that already has a milestone is left alone.
 *   - By default, the PR gets the next docs milestone: the open milestone with
 *     the earliest date.
 *   - If the PR body references a strapi/strapi PR whose milestone is not
 *     released yet and ships on another date than the next docs milestone,
 *     the PR gets the open docs milestone on that date. If none exists, one is
 *     created: the next milestone's version with the patch number bumped
 *     (7.5.1 -> 7.5.2), due on the strapi/strapi milestone's date.
 *
 * Dates: docs and strapi/strapi milestones always ship on a Wednesday. A
 * milestone without a due date is assumed to ship on the first Wednesday after
 * the latest published release of its repository (same major for strapi/strapi,
 * where v4 and v5 releases interleave).
 *
 * Usage: PR_NUMBER=3573 GH_TOKEN=... [DRY_RUN=true] node assign-milestone.mjs
 */

import { pathToFileURL } from 'node:url';

const DOCS_REPO = 'strapi/documentation';
const STRAPI_REPO = 'strapi/strapi';

const GH_TOKEN = process.env.GH_TOKEN;
const PR_NUMBER = process.env.PR_NUMBER;
const DRY_RUN = process.env.DRY_RUN === 'true';

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

async function main() {
  if (!GH_TOKEN || !PR_NUMBER) throw new Error('GH_TOKEN and PR_NUMBER are required');

  const pr = await gh(`repos/${DOCS_REPO}/issues/${PR_NUMBER}`);
  if (pr.milestone) {
    console.log(`PR #${PR_NUMBER} already has milestone ${pr.milestone.title}, nothing to do`);
    return;
  }

  const docsReleaseDate = await latestReleaseDate(DOCS_REPO);
  const docsMilestones = (await gh(`repos/${DOCS_REPO}/milestones?state=all&per_page=100`))
    .map((m) => ({ ...m, date: milestoneDate(m, docsReleaseDate) }));

  const decision = decideMilestone(docsMilestones, await strapiShipDate(pr.body));

  let milestone;
  if (decision.action === 'none') {
    console.log(`::warning::No milestone assigned to PR #${PR_NUMBER}: ${decision.reason}`);
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
  } else {
    milestone = decision.milestone;
  }

  console.log(`${DRY_RUN ? '[dry run] Would assign' : 'Assigning'} milestone ${milestone.title} to PR #${PR_NUMBER}`);
  if (!DRY_RUN) {
    await gh(`repos/${DOCS_REPO}/issues/${PR_NUMBER}`, {
      method: 'PATCH',
      body: JSON.stringify({ milestone: milestone.number }),
    });
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
