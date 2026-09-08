#!/usr/bin/env node
/**
 * Sync the Status of docs feedback items in Notion from the state of the
 * GitHub issues and pull requests that address them.
 *
 * The feedback widget (docusaurus/src/components/PageFeedback/ThankYou.jsx)
 * offers a "Create a GitHub issue" link that prefills an issue with the page,
 * the selected text, and the feedback comment. It does NOT carry the Notion
 * Feedback ID, so a row is matched to an issue by page path plus a text
 * discriminator plus a time window, and only when the match is unambiguous.
 * Once the widget starts emitting a "feedback-id:" marker, that marker becomes
 * the discriminator and the heuristics stop being needed.
 *
 * Status ladder: new -> triaged -> in progress -> addressed
 *   a linked PR is merged  -> addressed
 *   a linked PR is open    -> in progress
 *   only closed-unmerged PRs, or no PR -> status untouched
 *
 * The ladder only ever moves forward, and "nothing to do" and "wontfix" are
 * terminal: a human put them there and this script never overrules them.
 */

import { appendFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const REPO_OWNER = 'strapi';
const REPO_NAME = 'documentation';
const NOTION_VERSION = '2022-06-28';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_FEEDBACK_DB = process.env.NOTION_FEEDBACK_DB;
const GH_TOKEN = process.env.GH_TOKEN;
const DRY_RUN = process.env.DRY_RUN === 'true';

// Statuses this script is allowed to read and advance. Anything else is
// terminal and is left alone.
const LADDER = { 'new': 0, 'triaged': 1, 'in progress': 2, 'addressed': 3 };

// How long after a feedback submission an issue may still plausibly be about
// it. The lower bound is slightly negative because the widget writes the row
// and the user opens the issue within seconds of each other, in either order.
const WINDOW_BEFORE_MS = 10 * 60 * 1000;
const WINDOW_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

/** Strip a docs URL down to a comparable path: "cms/configurations/cron". */
export function normalizePath(value) {
  if (!value) return '';
  return String(value)
    .trim()
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/[?#].*$/, '')
    .toLowerCase()
    .replace(/\/+/g, '/')
    .replace(/^\/|\/$/g, '');
}

/**
 * Reduce text to lowercase alphanumerics and single spaces, so that markdown
 * the user added around the prefilled text (block quotes, code fences,
 * headings) does not defeat a substring comparison.
 */
export function normalizeText(value) {
  if (!value) return '';
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function notionPlainText(property) {
  if (!property) return '';
  if (property.type === 'title') return (property.title || []).map((t) => t.plain_text).join('');
  if (property.type === 'rich_text') return (property.rich_text || []).map((t) => t.plain_text).join('');
  if (property.type === 'select') return property.select ? property.select.name : '';
  if (property.type === 'url') return property.url || '';
  if (property.type === 'date') return property.date ? property.date.start : '';
  return '';
}

async function notionRequest(path, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body && body.message ? body.message : `HTTP ${response.status}`;
    throw new Error(`Notion ${options.method || 'GET'} ${path} failed: ${detail}`);
  }
  return body;
}

/** Every row whose status is still on the ladder, i.e. not terminal. */
async function fetchOpenFeedbackRows() {
  const rows = [];
  let cursor;
  do {
    const payload = {
      filter: {
        or: Object.keys(LADDER).map((name) => ({ property: 'Status', select: { equals: name } })),
      },
      page_size: 100,
    };
    if (cursor) payload.start_cursor = cursor;

    const page = await notionRequest(`/databases/${NOTION_FEEDBACK_DB}/query`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    for (const result of page.results) {
      const props = result.properties || {};
      rows.push({
        pageId: result.id,
        feedbackId: notionPlainText(props['Feedback ID']),
        status: notionPlainText(props['Status']),
        pagePath: normalizePath(notionPlainText(props['Page URL'])),
        comment: notionPlainText(props['Comment']),
        selectedContent: notionPlainText(props['Selected content']),
        submittedAt: notionPlainText(props['Submitted at']),
        githubIssue: notionPlainText(props['GitHub issue']),
        githubPr: notionPlainText(props['GitHub PR']),
      });
    }

    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);

  return rows;
}

async function githubGraphql(query, variables) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'strapi-docs-feedback-sync',
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`GitHub GraphQL failed: HTTP ${response.status}`);
  if (body.errors) throw new Error(`GitHub GraphQL failed: ${body.errors.map((e) => e.message).join('; ')}`);
  return body.data;
}

const SEARCH_QUERY = `
  query ($q: String!, $after: String) {
    search(type: ISSUE, query: $q, first: 50, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        ... on Issue {
          number
          url
          title
          body
          createdAt
          closedByPullRequestsReferences(first: 10, includeClosedPrs: true) {
            nodes { number url state }
          }
        }
      }
    }
  }
`;

/**
 * Issues opened through the feedback widget. The title prefix narrows the
 * search; the HTML marker the widget writes is what actually qualifies an
 * issue, since a human could type the prefix by hand.
 */
async function fetchWidgetIssues() {
  const issues = [];
  let after;
  do {
    const data = await githubGraphql(SEARCH_QUERY, {
      q: `repo:${REPO_OWNER}/${REPO_NAME} is:issue in:title "[Doc feedback]"`,
      after,
    });
    for (const node of data.search.nodes) {
      if (!node || !node.body) continue;
      if (!node.body.includes('This issue was opened from the docs feedback widget')) continue;
      issues.push({
        number: node.number,
        url: node.url,
        title: node.title,
        body: node.body,
        createdAt: node.createdAt,
        normalizedBody: normalizeText(node.body),
        docPath: extractDocPath(node.body),
        prs: node.closedByPullRequestsReferences.nodes || [],
      });
    }
    after = data.search.pageInfo.hasNextPage ? data.search.pageInfo.endCursor : undefined;
  } while (after);

  return issues;
}

/** First docs.strapi.io path mentioned in the issue body. */
export function extractDocPath(body) {
  const match = body.match(/docs\.strapi\.io(\/[^\s)\]]*)/i);
  return match ? normalizePath(match[1]) : '';
}

/**
 * Does this issue demonstrably describe this feedback row? Requires the same
 * page, a plausible time window, and one positive text discriminator.
 */
export function isMatch(row, issue) {
  if (!row.pagePath || !issue.docPath || row.pagePath !== issue.docPath) return false;

  if (row.submittedAt) {
    const submitted = Date.parse(row.submittedAt);
    const opened = Date.parse(issue.createdAt);
    if (Number.isFinite(submitted) && Number.isFinite(opened)) {
      if (opened < submitted - WINDOW_BEFORE_MS) return false;
      if (opened > submitted + WINDOW_AFTER_MS) return false;
    }
  }

  // Exact marker, once the widget emits it. Definitive on its own.
  if (row.feedbackId && issue.body.toLowerCase().includes(`feedback-id: ${row.feedbackId.toLowerCase()}`)) {
    return true;
  }

  // The selected text is copied verbatim by the widget and is rarely edited.
  const selected = normalizeText(row.selectedContent);
  if (selected.length >= 15 && issue.normalizedBody.includes(selected)) return true;

  // The comment is prefilled but users do edit it, so only its opening is
  // compared, and only when there is enough of it to be distinctive.
  const comment = normalizeText(row.comment);
  if (comment.length >= 20 && issue.normalizedBody.includes(comment.slice(0, 60))) return true;

  return false;
}

/** Prefer a merged PR, then an open one, then the most recent closed one. */
export function pickPr(prs) {
  if (!prs.length) return null;
  return (
    prs.find((pr) => pr.state === 'MERGED') ||
    prs.find((pr) => pr.state === 'OPEN') ||
    [...prs].sort((a, b) => b.number - a.number)[0]
  );
}

export function targetStatus(prs) {
  if (prs.some((pr) => pr.state === 'MERGED')) return 'addressed';
  if (prs.some((pr) => pr.state === 'OPEN')) return 'in progress';
  return null;
}

/**
 * Decide what to write, without touching anything. Pairs rows with issues,
 * discards every pairing that is ambiguous in either direction, and builds the
 * Notion property patch for the rest.
 */
export function planChanges(rows, issues) {
  const pairs = [];
  for (const row of rows) {
    for (const issue of issues) {
      if (isMatch(row, issue)) pairs.push({ row, issue });
    }
  }

  // A row matching two issues, or an issue matching two rows, is reported and
  // skipped rather than guessed at.
  const rowCount = new Map();
  const issueCount = new Map();
  for (const { row, issue } of pairs) {
    rowCount.set(row.pageId, (rowCount.get(row.pageId) || 0) + 1);
    issueCount.set(issue.number, (issueCount.get(issue.number) || 0) + 1);
  }

  const changes = [];
  const ambiguous = [];
  for (const { row, issue } of pairs) {
    if (rowCount.get(row.pageId) > 1 || issueCount.get(issue.number) > 1) {
      ambiguous.push({ row, issue });
      continue;
    }

    const properties = {};
    if (row.githubIssue !== issue.url) {
      properties['GitHub issue'] = { url: issue.url };
    }

    const pr = pickPr(issue.prs);
    if (pr && row.githubPr !== pr.url) {
      properties['GitHub PR'] = { url: pr.url };
    }

    const target = targetStatus(issue.prs);
    let statusChange = null;
    if (target && LADDER[target] > LADDER[row.status]) {
      properties['Status'] = { select: { name: target } };
      statusChange = `${row.status} -> ${target}`;
    }

    if (!Object.keys(properties).length) continue;
    changes.push({ row, issue, pr, statusChange, properties });
  }

  return { changes, ambiguous };
}

async function main() {
  if (!NOTION_API_KEY) fail('NOTION_API_KEY is not set.');
  if (!NOTION_FEEDBACK_DB) fail('NOTION_FEEDBACK_DB is not set.');
  if (!GH_TOKEN) fail('GH_TOKEN is not set.');

  const [rows, issues] = await Promise.all([fetchOpenFeedbackRows(), fetchWidgetIssues()]);
  console.log(`${rows.length} non-terminal feedback rows, ${issues.length} widget issues.`);

  const { changes, ambiguous } = planChanges(rows, issues);

  for (const change of changes) {
    const label = `${change.row.feedbackId} (issue #${change.issue.number}${change.pr ? `, PR #${change.pr.number} ${change.pr.state}` : ', no PR'})`;
    if (DRY_RUN) {
      console.log(`[dry run] ${label}: ${change.statusChange || 'links only'}`);
      continue;
    }
    await notionRequest(`/pages/${change.row.pageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties: change.properties }),
    });
    console.log(`Updated ${label}: ${change.statusChange || 'links only'}`);
  }

  for (const { row, issue } of ambiguous) {
    console.log(`Ambiguous, skipped: ${row.feedbackId} <-> issue #${issue.number}`);
  }

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    const lines = [
      `## Feedback status sync${DRY_RUN ? ' (dry run)' : ''}`,
      '',
      `- Non-terminal feedback rows: ${rows.length}`,
      `- Widget issues found: ${issues.length}`,
      `- Rows updated: ${changes.length}`,
      `- Ambiguous pairings skipped: ${ambiguous.length}`,
    ];
    if (changes.length) {
      lines.push('', '| Feedback ID | Issue | PR | Status |', '| --- | --- | --- | --- |');
      for (const c of changes) {
        lines.push(`| ${c.row.feedbackId} | #${c.issue.number} | ${c.pr ? `#${c.pr.number} ${c.pr.state}` : '-'} | ${c.statusChange || 'unchanged'} |`);
      }
    }
    await appendFile(summaryPath, `${lines.join('\n')}\n`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => fail(error.message));
}
