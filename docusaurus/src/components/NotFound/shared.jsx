import React, { useEffect, useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAllDocsData } from '@docusaurus/plugin-content-docs/client';
import styles from './notFound.module.scss';

// URL segments that carry no meaning for a search
const NOISE = new Set(['cms', 'cloud', 'docs', 'dev', 'html', 'md', 'index', 'en', 'v4', 'v5', '404']);

// Turns /cms/features/content-type-bilder into "features content type bilder"
export function queryFromPath(pathname) {
  return pathname
    .split(/[/\-_.#?]+/)
    .map((word) => word.toLowerCase())
    .filter((word) => word && !NOISE.has(word))
    .join(' ');
}

function levenshtein(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

const similarity = (a, b) => 1 - levenshtein(a, b) / Math.max(a.length, b.length, 1);
const segments = (path) => path.toLowerCase().split('/').filter(Boolean);
const sectionOf = (path) => (path.startsWith('/cloud') ? 'Cloud' : path.startsWith('/cms') ? 'CMS' : 'Docs');
const humanize = (slug) => slug.replace(/[-_]+/g, ' ').replace(/^./, (c) => c.toUpperCase());

/**
 * Ranks the site's real doc routes against the broken URL. The last segment
 * weighs most, so a typo (content-type-bilder) or a page that moved to another
 * folder (/cms/content-type-builder) still finds its page.
 */
export function closestPaths(pathname, paths, limit) {
  const broken = segments(pathname);
  const last = broken[broken.length - 1];
  if (!last) return [];
  return paths
    .map((path) => {
      const parts = segments(path);
      const lastSim = similarity(last, parts[parts.length - 1] || '');
      const shared = broken.filter((part) => parts.includes(part)).length / broken.length;
      return { path, lastSim, score: 2 * lastSim + shared };
    })
    .filter(({ lastSim }) => lastSim >= 0.6)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ path }) => path);
}

function listDocPaths(allDocs) {
  return [...new Set(
    Object.values(allDocs).flatMap((plugin) =>
      plugin.versions.flatMap((version) =>
        version.docs.filter((doc) => !doc.unlisted).map((doc) => doc.path)))
  )];
}

/**
 * Finds the page the reader most likely meant when the URL has a typo
 * (content-type-bilder) or points to a page that moved folders. Runs on the
 * site's own routes, so it needs no request.
 */
export function useDidYouMean() {
  const { pathname } = useLocation();
  const allDocs = useAllDocsData();
  return useMemo(() => {
    const broken = segments(pathname);
    const last = broken[broken.length - 1];
    if (!last) return null;
    const [best] = closestPaths(pathname, listDocPaths(allDocs), 1);
    if (!best || best === pathname.replace(/\/$/, '')) return null;
    // Close enough to be a typo, not just a page about something similar
    return similarity(last, segments(best).pop()) >= 0.75 ? best : null;
  }, [pathname, allDocs]);
}

// Splits `target` into kept and changed runs against `source`, via a longest common subsequence
export function diffChars(source, target) {
  const dp = Array.from({ length: source.length + 1 }, () => new Array(target.length + 1).fill(0));
  for (let i = source.length - 1; i >= 0; i -= 1) {
    for (let j = target.length - 1; j >= 0; j -= 1) {
      dp[i][j] = source[i] === target[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const runs = [];
  const push = (text, changed) => {
    const prev = runs[runs.length - 1];
    if (prev && prev.changed === changed) prev.text += text;
    else runs.push({ text, changed });
  };
  let i = 0;
  let j = 0;
  while (j < target.length) {
    if (i < source.length && source[i] === target[j]) {
      push(target[j], false);
      i += 1;
      j += 1;
    } else if (i < source.length && dp[i + 1][j] >= dp[i][j + 1]) {
      i += 1;
    } else {
      push(target[j], true);
      j += 1;
    }
  }
  return runs;
}

// The corrected path, with what changed highlighted: a whole segment when a
// folder was added or renamed, single characters when the slug has a typo
export function CorrectedPath({ path }) {
  const { pathname } = useLocation();
  const source = segments(pathname);
  const target = segments(path);
  const lastSource = source[source.length - 1] || '';
  return target.map((part, i) => {
    const isLast = i === target.length - 1;
    let runs;
    if (source.includes(part)) runs = [{ text: part, changed: false }];
    else if (isLast) runs = diffChars(lastSource, part);
    else runs = [{ text: part, changed: true }];
    return (
      <React.Fragment key={i}>
        /
        {runs.map((run, j) => (
          run.changed ? <mark key={j} className={styles.fix}>{run.text}</mark> : <span key={j}>{run.text}</span>
        ))}
      </React.Fragment>
    );
  });
}

export function DidYouMean({ onHover }) {
  const path = useDidYouMean();
  if (!path) return null;
  return (
    <p className={styles.didYouMean}>
      Did you mean{' '}
      <Link to={path} onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>
        <CorrectedPath path={path} />
      </Link>
      ?
    </p>
  );
}

// Shown when nothing in the docs looks like the broken URL
const POPULAR = [
  { path: '/cms/installation', title: 'Installation' },
  { path: '/cms/api/rest', title: 'REST API reference' },
  { path: '/cms/features/content-type-builder', title: 'Content-type Builder' },
  { path: '/cloud/getting-started/deployment', title: 'Dashboard deployment' },
].map((item) => ({ ...item, section: sectionOf(item.path) }));

/**
 * Suggests pages for the broken URL: closest real routes first, then
 * MeiliSearch hits on the words of the URL. Meili also gives the page titles.
 * Falls back to popular pages, flagged with `popular`, when nothing matches.
 */
export function useSuggestions(limit = 4) {
  const { pathname } = useLocation();
  const { siteConfig } = useDocusaurusContext();
  const allDocs = useAllDocsData();
  const [state, setState] = useState({ loading: true, items: [], popular: false });

  useEffect(() => {
    const docPaths = listDocPaths(allDocs);
    const close = closestPaths(pathname, docPaths, limit);
    const { host, apiKey, indexUid } = siteConfig.customFields.meilisearch;
    const controller = new AbortController();

    const search = (q) => fetch(`${host}/indexes/${indexUid}/search`, {
      method: 'POST',
      signal: controller.signal,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, limit: 30, attributesToRetrieve: ['url', 'hierarchy_lvl1'] }),
    })
      .then((res) => res.json())
      .then(({ hits = [] }) => hits
        .filter((hit) => hit.hierarchy_lvl1)
        .map((hit) => ({ path: new URL(hit.url).pathname, title: hit.hierarchy_lvl1 })));

    const titleFor = (path) => search(queryFromPath(segments(path).pop()))
      .then((hits) => hits.find((hit) => hit.path === path)?.title)
      .catch(() => undefined)
      .then((title) => ({ path, title: title || humanize(segments(path).pop()) }));

    const q = queryFromPath(pathname);
    Promise.all([
      Promise.all(close.map(titleFor)),
      q ? search(q).catch(() => []) : Promise.resolve([]),
    ])
      .then(([closeItems, hits]) => {
        const seen = new Set();
        const items = [];
        [...closeItems, ...hits].forEach((item) => {
          if (seen.has(item.path) || items.length >= limit) return;
          seen.add(item.path);
          items.push({ ...item, section: sectionOf(item.path) });
        });
        if (items.length) setState({ loading: false, items, popular: false });
        else setState({ loading: false, items: POPULAR, popular: true });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ loading: false, items: POPULAR, popular: true });
      });
    return () => controller.abort();
  }, [pathname, siteConfig, allDocs, limit]);

  return state;
}

// Opens the Kapa Ask AI modal, prefilled with a question about the lost page
export function askAi(pathname, question) {
  const query = question || `I was looking for the docs page at ${pathname} but it does not exist. Where can I find this content?`;
  window.Kapa?.open?.({ mode: 'ai', query, submit: true });
}

export function Suggestions({ title = 'Maybe you were looking for', onHover }) {
  const didYouMean = useDidYouMean();
  const { loading, items: all, popular } = useSuggestions(5);
  const items = all.filter((item) => item.path !== didYouMean).slice(0, 4);
  if (!loading && items.length === 0) return null;
  return (
    <section className={styles.suggestions} aria-busy={loading}>
      <h2 className={styles.kicker}>{popular ? 'Nothing close, but these are good places to start' : title}</h2>
      <ul>
        {loading
          ? [0, 1, 2].map((i) => <li key={i} className={styles.skeleton} />)
          : items.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onMouseEnter={() => onHover?.(true)}
                  onMouseLeave={() => onHover?.(false)}
                >
                  <span className={styles.badge}>{item.section}</span>
                  <span className={styles.suggestionTitle}>{item.title}</span>
                  <span className={styles.suggestionPath}>{item.path}</span>
                </Link>
              </li>
            ))}
      </ul>
    </section>
  );
}

export function AskAiButton({ label = 'Ask AI where it went', onHover }) {
  const { pathname } = useLocation();
  return (
    <button
      type="button"
      className={styles.askAi}
      onClick={() => askAi(pathname)}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      <span aria-hidden="true">✦</span> {label}
    </button>
  );
}

export function QuickLinks() {
  return (
    <nav className={styles.quickLinks} aria-label="Popular destinations">
      <Link to="/">Docs home</Link>
      <Link to="/cms/intro">CMS docs</Link>
      <Link to="/cloud/intro">Cloud docs</Link>
      <Link to="/cms/quick-start">Quick Start</Link>
    </nav>
  );
}
