/* THE DROWNED REGISTER, derived.
   Reads the raw git log of the documentation repository and matches every
   file it ever touched against the 290 slugs that are still above water.
   A hand with no surviving page anywhere is a drowned hand. Nothing here is
   typed by hand: run `node derive-register.js` and every number is recomputed.
   Output: register.json  */
'use strict';
const fs = require('fs');
const path = require('path');
const RAWLOG = '/private/tmp/claude-501/-Users-piwi-code-documentation/0d8629c6-231f-4fec-94af-6fe3669d37b8/scratchpad/gitlog-docs.txt';
const content = JSON.parse(fs.readFileSync(path.join(__dirname, 'content.json'), 'utf8'));

const slugs = Object.keys(content.pages);
const livingFile = new Map();
for (const slug of slugs) livingFile.set('docusaurus/' + content.pages[slug].file, slug);

/* ---- parse ---- */
const commits = [];
let cur = null;
for (const raw of fs.readFileSync(RAWLOG, 'utf8').split('\n')) {
  const line = raw.trim();
  if (!line) continue;
  if (line.startsWith('C|')) {
    const [, sha, author, date, hour] = line.split('|');
    cur = { sha, author, date, hour: parseInt(hour, 10), files: [] };
    commits.push(cur);
  } else if (cur) cur.files.push(line);
}

const authorsAll = new Set();
const authorLiving = new Map();
const authorDead = new Map();
const stats = new Map();
const deadHands = new Map();
let touches = 0;

for (const c of commits) {
  authorsAll.add(c.author);
  let st = stats.get(c.author);
  if (!st) { st = { commits: 0, files: 0, first: c.date, last: c.date, nights: 0 }; stats.set(c.author, st); }
  st.commits++;
  if (c.date < st.first) st.first = c.date;
  if (c.date > st.last) st.last = c.date;
  if (c.hour >= 22 || c.hour <= 5) st.nights++;
  for (const f of c.files) {
    if (!/\.mdx?$/.test(f)) continue;
    touches++; st.files++;
    const slug = livingFile.get(f);
    if (slug) {
      if (!authorLiving.has(c.author)) authorLiving.set(c.author, new Set());
      authorLiving.get(c.author).add(slug);
    } else {
      if (!authorDead.has(c.author)) authorDead.set(c.author, new Map());
      const m = authorDead.get(c.author);
      m.set(f, (m.get(f) || 0) + 1);
      if (!deadHands.has(f)) deadHands.set(f, new Set());
      deadHands.get(f).add(c.author);
    }
  }
}

const drowned = [...authorsAll].filter(a => !authorLiving.has(a));
const drownedSet = new Set(drowned);

const baseIndex = new Map();
for (const [f, slug] of livingFile) {
  const b = f.replace(/^.*\//, '').replace(/\.mdx?$/, '');
  if (!baseIndex.has(b)) baseIndex.set(b, []);
  baseIndex.get(b).push(slug);
}
const slugSet = new Set(slugs);
function successors(deadPath) {
  const base = deadPath.replace(/^.*\//, '').replace(/\.mdx?$/, '');
  const byName = baseIndex.get(base);
  if (byName && byName.length) return { list: byName, how: 'a living page of the same name' };
  const m = deadPath.match(/docusaurus\/docs\/(?:dev-docs|user-docs|developer-docs\/latest)\/(.+)\.mdx?$/);
  if (m) {
    const tail = m[1];
    const hits = [];
    for (const s of slugs) if (s.endsWith('/' + tail)) hits.push(s);
    if (hits.length) return { list: hits, how: 'the same path, remapped' };
    const parts = tail.split('/');
    while (parts.length) {
      parts.pop();
      if (!parts.length) break;
      const cand = '/cms/' + parts.join('/');
      if (slugSet.has(cand)) return { list: [cand], how: 'the nearest living shore above her path' };
      const anc = slugs.filter(s => s.startsWith('/cms/' + parts.join('/') + '/'));
      if (anc.length) return { list: anc.slice(0, 4), how: 'the nearest living shore above her path' };
    }
    if (slugSet.has('/cms/intro')) return { list: ['/cms/intro'], how: 'the landfall nearest her lost path' };
  }
  return { list: [], how: '' };
}

const hands = drowned.map(a => {
  const st = stats.get(a);
  const paths = [...(authorDead.get(a) || new Map()).entries()].sort((x, y) => y[1] - x[1]);
  const succ = new Map();
  let how = '';
  for (const [p] of paths) {
    const s = successors(p);
    if (s.list.length && !how) how = s.how;
    for (const t of s.list) succ.set(t, (succ.get(t) || 0) + 1);
  }
  const deepest = paths.length ? paths[0][0] : '';
  return {
    name: a,
    commits: st.commits,
    touches: st.files,
    paths: paths.length,
    first: st.first,
    last: st.last,
    nights: st.nights,
    deepest: deepest.replace(/^docusaurus\/docs\//, ''),
    deepestHands: deepest ? deadHands.get(deepest).size : 0,
    deepestLost: deepest ? [...deadHands.get(deepest)].filter(x => drownedSet.has(x)).length : 0,
    raisedBy: [...succ.entries()].sort((x, y) => y[1] - x[1]).map(e => e[0]).slice(0, 8),
    how
  };
});
hands.sort((a, b) => b.commits - a.commits || b.paths - a.paths || a.name.localeCompare(b.name));

const bySlug = {};
hands.forEach((h, i) => { for (const s of h.raisedBy) (bySlug[s] = bySlug[s] || []).push(i); });

const wrecks = [...deadHands.entries()]
  .map(([p, s]) => ({ path: p.replace(/^docusaurus\/docs\//, ''), hands: s.size, lost: [...s].filter(x => drownedSet.has(x)).length }))
  .filter(w => w.lost > 0)
  .sort((a, b) => b.lost - a.lost || b.hands - a.hands)
  .slice(0, 12);

const out = {
  derivedFrom: 'the raw commit log of strapi/documentation, matched against the 290 living slugs of content.json',
  commits: commits.length,
  touches,
  authorsEver: authorsAll.size,
  livingHands: authorsAll.size - drowned.length,
  drownedCount: drowned.length,
  deadPaths: deadHands.size,
  wrecksBearingALostName: [...deadHands.values()].filter(s => [...s].some(x => drownedSet.has(x))).length,
  singleSignature: drowned.filter(a => stats.get(a).commits === 1).length,
  reachable: hands.filter(h => h.raisedBy.length).length,
  wrecks,
  hands,
  bySlug
};
fs.writeFileSync(path.join(__dirname, 'register.json'), JSON.stringify(out));
for (const k of ['commits', 'touches', 'authorsEver', 'livingHands', 'drownedCount', 'deadPaths',
  'wrecksBearingALostName', 'singleSignature', 'reachable']) console.log(k.padEnd(24), out[k]);
console.log('pages that raise at least one hand:', Object.keys(bySlug).length);
console.log('greatest wreck:', JSON.stringify(wrecks[0]));
console.log('first plate:', JSON.stringify(hands[0]));
