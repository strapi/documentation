// Every visible fact on the coast derives from these four files.

export async function loadData(setStatus) {
  setStatus('Reading the coast...');
  const [content, taxonomy, graph, provenance] = await Promise.all([
    fetch('./content.json').then(r => r.json()),
    fetch('./taxonomy.json').then(r => r.json()),
    fetch('./graph.json').then(r => r.json()),
    fetch('./provenance.json').then(r => r.json()),
  ]);
  setStatus('Counting the footpaths...');

  const inbound = {}, outbound = {};
  for (const [a, b] of graph.edges) {
    inbound[b] = (inbound[b] || 0) + 1;
    outbound[a] = (outbound[a] || 0) + 1;
  }

  // The sixteen official sections, with true counts. Official taxonomy only.
  const sections = [];
  const sectionByKey = new Map();
  for (const slug of Object.keys(taxonomy)) {
    const t = taxonomy[slug];
    const key = t.product + '|' + t.section;
    let s = sectionByKey.get(key);
    if (!s) { s = { key, product: t.product, name: t.section, count: 0, slugs: [] }; sectionByKey.set(key, s); sections.push(s); }
    s.count++; s.slugs.push(slug);
  }

  let totalCommits = 0, nightActs = 0, firstDate = '9999-99-99', lastDate = '0000';
  const keepers = new Set();
  for (const v of Object.values(provenance)) {
    totalCommits += v.commits; nightActs += v.night || 0;
    (v.authors || []).forEach(a => keepers.add(a));
    if (v.first < firstDate) firstDate = v.first;
    if (v.last > lastDate) lastDate = v.last;
  }

  const crossEdges = graph.edges.filter(([a, b]) =>
    (a.startsWith('/cms') && b.startsWith('/cloud')) || (a.startsWith('/cloud') && b.startsWith('/cms'))).length;

  return {
    content, taxonomy, graph, provenance, inbound, outbound,
    sections, sectionByKey,
    stats: {
      pageCount: Object.keys(content.pages).length,
      edgeCount: graph.edges.length,
      totalCommits, keeperCount: keepers.size, nightActs,
      firstDate, lastDate, crossEdges,
      zeroInbound: Object.keys(taxonomy).filter(s => !inbound[s]).length,
    },
  };
}

export function provLine(prov) {
  if (!prov) return '';
  const hands = (prov.authors || []).length;
  return `${prov.commits} ${prov.commits === 1 ? 'commit' : 'commits'} by ${hands} ${hands === 1 ? 'hand' : 'hands'} · first ${prov.first} · last ${prov.last} · top keeper ${prov.topAuthor}`;
}

// Days since last commit, against the newest date in the record itself.
export function daysSince(dateStr, refStr) {
  const d = new Date(dateStr + 'T12:00:00Z').getTime();
  const ref = new Date(refStr + 'T12:00:00Z').getTime();
  return Math.max(0, Math.round((ref - d) / 86400000));
}

export const safeStore = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* a coast with no memory is still a coast */ }
  },
};
