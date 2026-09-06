/* ============================================================
   CARTA STRAPIANA - GATE-0 prototype
   The helm and the sea: orders-with-lag + the rolling iron-gall
   hatched sea, one island (the Document Service API) resolving
   through the spyglass, wind derived from the real inter-community
   citation flow. No external libraries. Deterministic seed.
   ============================================================ */
'use strict';

/* ---------------- deterministic RNG ---------------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = 1898;
function rngFor(tag) {
  let h = SEED;
  for (let i = 0; i < tag.length; i++) h = (Math.imul(h, 31) + tag.charCodeAt(i)) | 0;
  return mulberry32(h >>> 0);
}

/* ---------------- constants ---------------- */
const W = 1440, H = 900;
const HORIZON = 396;
const FOV = 70, PXDEG = W / FOV;
const COMPRESSION = 50;            // world speed compression (2.5x: the owner wanted to feel the ship move)
const ORDER_LAG = 1.0;             // seconds the ship ignores the wheel
const PAPER = '#f1e7d0';
const params = new URLSearchParams(location.search);
const SCALE = params.get('scale') ? parseFloat(params.get('scale'))
  : Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
const REDUCED = params.get('rm') === '1' ||
  (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
function angDiff(a, b) {
  let d = (a - b) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}
function norm360(a) { a %= 360; return a < 0 ? a + 360 : a; }

/* number to words, for the leadsman (true word counts as fathoms) */
function numToWords(n) {
  const ones = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
    'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  function sub1000(x) {
    let s = '';
    if (x >= 100) { s += ones[Math.floor(x / 100)] + ' hundred'; x %= 100; if (x) s += ' '; }
    if (x >= 20) { s += tens[Math.floor(x / 10)]; x %= 10; if (x) s += '-' + ones[x]; }
    else if (x > 0 || s === '') s += ones[x];
    return s;
  }
  if (n < 1000) return sub1000(n);
  const th = Math.floor(n / 1000), rest = n % 1000;
  return sub1000(th) + ' thousand' + (rest ? ' ' + sub1000(rest) : '');
}

/* ---------------- diagnostics ---------------- */
const diag = {
  frameMs: 0, avgFrameMs: 0, fps: 0,
  bearing: 0, orderedBearing: 0, sailState: 'full', knots: 0,
  samples: [],
  windDeg: 0, windKn: 0, polarFactor: 1, distNm: 0, lod: 0,
  spyglass: false, hour: 'afternoon', anchored: false, becalmed: REDUCED,
  scale: SCALE,
  data: null
};
window.__helmDiag = diag;

/* ---------------- data load + derivations ---------------- */
const world = {
  ready: false,
  lanes: [],
  positions: [],
  interEdges: 0,
  tradeWinds: [],
  island: null,
  /* 11.0 opens the sea out for 290 islands: the 27 archipelago centres now lie
     7.5 to 19.6 nm apart instead of 2.0 to 5.1, which is the room a 56-island
     archipelago needs at a mile between neighbours - close enough that a
     neighbour passed close aboard is a whole coast, far enough that she is not a
     wall. The community layout itself, and therefore the wind field and the
     approach direction, are untouched: only the nautical scale changes. */
  nmPerUnit: 16.0,
  windCal: 1,
  approachDir: { x: 0, y: 1 },
  sigma: 1,
  /* the sea itself */
  islands: [],        // 290, one per page
  bySlug: new Map(),
  archipelagos: [],   // 27, one per community (the register keeps them; the chart letters none)
  content: null, graph: null, communities: null, prov: null, register: null,
  uncited: [], desert: [], lone: [], nightIsles: []
};

async function loadData() {
  const [graph, communities, content, prov, register, taxonomy] = await Promise.all([
    fetch('graph.json').then(r => r.json()),
    fetch('communities.json').then(r => r.json()),
    fetch('content.json').then(r => r.json()),
    fetch('provenance.json').then(r => r.json()),
    fetch('register.json').then(r => r.json()),
    fetch('taxonomy.json').then(r => r.json())
  ]);
  world.prov = prov;
  world.register = register;
  world.taxonomy = taxonomy;

  const of = {};
  communities.forEach((c, i) => c.members.forEach(m => { of[m] = i; }));

  /* re-derive inter-community flows from the raw edges */
  const laneMap = new Map();
  let inter = 0, intra = 0;
  for (const [a, b] of graph.edges) {
    const ca = of[a], cb = of[b];
    if (ca == null || cb == null) continue;
    if (ca === cb) { intra++; continue; }
    inter++;
    const i = Math.min(ca, cb), j = Math.max(ca, cb);
    const key = i + '-' + j;
    let L = laneMap.get(key);
    if (!L) { L = { i, j, total: 0, ij: 0, ji: 0 }; laneMap.set(key, L); }
    L.total++;
    if (ca === i) L.ij++; else L.ji++;
  }
  const lanes = [...laneMap.values()];
  lanes.sort((a, b) => b.total - a.total);
  const shortHub = s => s.split('/').pop();
  world.tradeWinds = lanes.slice(0, 5).map(L =>
    [shortHub(communities[L.i].hub), shortHub(communities[L.j].hub), L.total]);
  world.interEdges = inter;

  /* ============================================================
     THE TWO CONTINENTS (owner order), PROVINCED BY THE TAXONOMY (lab law)
     The corpus holds two products, and the sea says so plainly: every
     CMS page is ground on one great continent, every Cloud page on a
     smaller one across open water. A PROVINCE is an official section of
     the docs themselves - product + section straight out of taxonomy.json,
     the section map built from the repo's own sidebars.js (path-inherited
     for the pages the sidebar does not carry), so no page falls into a
     nameless bucket and no other name is ever lettered on the ground.
     Provinces are packed
     rim to rim, each set beside the province its pages cite hardest, so
     the interior borders still fall where the citation graph says they
     fall; the Louvain communities keep their work INSIDE each province,
     shaping the sub-clusters and the adjacency of the villages, but no
     community name is printed anywhere. Only the 11 uncommunitied pages
     stay offshore: the data isolates them, so the sea does. (All three
     pages of the AI section are among those 11, so the AI section holds
     no ground on the main - the sea is honest about that too.)
     ============================================================ */
  const n = communities.length;
  const SECTION_LAW = {
    cms: ['Getting Started', 'Features', 'Content APIs', 'Configurations', 'Development',
          'Plugins development', 'TypeScript', 'AI', 'Command Line Interface', 'Upgrades'],
    cloud: ['Getting Started', 'Projects management', 'Advanced configuration', 'Deployments',
            'Account management', 'Command Line Interface']
  };
  const provinces = [];
  const provKey = new Map();      // 'product|section' -> province
  for (const slug of Object.keys(content.pages).sort()) {
    if (of[slug] == null) continue;               // the uncommunitied stay offshore
    const pg = content.pages[slug];
    const tx = taxonomy[slug];
    const sec = tx && tx.section;     /* the taxonomy is total over the 290 */
    if (!sec) continue;               /* a slug the taxonomy cannot name earns no ground */
    const key = pg.product + '|' + sec;
    let P = provKey.get(key);
    if (!P) {
      P = { product: pg.product, section: sec, name: sec, members: [] };
      provKey.set(key, P); provinces.push(P);
    }
    P.members.push(slug);
  }
  for (const P of provinces) {
    P.size = P.members.length;
    /* her chief page: the most-cited member anchors the ground and its name-seat */
    P.hub = P.members.slice().sort((a, b) =>
      (graph.inbound[b] || 0) - (graph.inbound[a] || 0) || (a < b ? -1 : 1))[0];
    /* the dominant community inside her, and her purity: the share of one mind -
       a mixed section keeps a ragged coast, exactly as a mixed community did */
    const tal = new Map();
    for (const m of P.members) { const c = of[m]; tal.set(c, (tal.get(c) || 0) + 1); }
    let dc = -1, dn = -1;
    for (const [c, n2] of tal) if (n2 > dn) { dn = n2; dc = c; }
    P.comm = dc; P.purity = dn / P.size; P.nComms = tal.size;
    P.primary = (SECTION_LAW[P.product] || []).indexOf(P.section) >= 0;
  }
  /* stable order: official taxonomy order first, then whatever the data adds */
  const secRank = P => { const i = (SECTION_LAW[P.product] || []).indexOf(P.section); return i < 0 ? 999 : i; };
  provinces.sort((a, b) => a.product === b.product
    ? secRank(a) - secRank(b)
    : (a.product < b.product ? -1 : 1));
  /* the citation flow BETWEEN provinces, read straight off the raw edges:
     it packs the mains and later draws the sheet's own sailing lanes */
  const pIdx = new Map();
  provinces.forEach((P, i) => { P.i0 = i; for (const m of P.members) pIdx.set(m, i); });
  const provLaneMap = new Map();
  for (const [a, b] of graph.edges) {
    const pa = pIdx.get(a), pb = pIdx.get(b);
    if (pa == null || pb == null || pa === pb) continue;
    const i = Math.min(pa, pb), j = Math.max(pa, pb);
    const key = i + '-' + j;
    let L = provLaneMap.get(key);
    if (!L) { L = { i, j, total: 0, ij: 0, ji: 0 }; provLaneMap.set(key, L); }
    L.total++;
    if (pa === i) L.ij++; else L.ji++;
  }
  world.provLanes = [...provLaneMap.values()];
  /* the ground a province needs: the same disc its member layout will fill */
  const SPACING_NM0 = 1.05;
  const archScale0 = m => m <= 1 ? 0 : 0.58 * SPACING_NM0 * Math.sqrt(m) + 0.30;
  for (const P of provinces) P.r = (archScale0(P.size) + 0.62) / world.nmPerUnit;
  const affinity = (A, B) => {
    const L = provLaneMap.get(Math.min(A.i0, B.i0) + '-' + Math.max(A.i0, B.i0));
    /* the sections that cite each other share a border; a shared dominant
       community is a smaller nudge - adjacency, never a name */
    return (L ? L.total : 0) + (A.comm === B.comm && A.comm >= 0 ? 3 : 0);
  };
  function packContinent(list, tag) {
    const rnd = rngFor('pack:' + tag);
    const L = list.slice().sort((a, b) => b.size - a.size || a.comm - b.comm);
    const placed = [];
    for (const P of L) {
      if (!placed.length) { P.x = 0; P.y = 0; placed.push(P); continue; }
      /* she goes ashore beside the province her pages cite hardest */
      let anchor = placed[0], aw = -1;
      for (const Q of placed) { const w = affinity(P, Q); if (w > aw) { aw = w; anchor = Q; } }
      let best = null, bc = 1e18;
      for (let s = 0; s < 64; s++) {
        const th = s / 64 * TAU + rnd() * 0.001;
        for (const f of [1.0, 1.12, 1.28, 1.5]) {
          const d = (P.r + anchor.r) * f;
          const x = anchor.x + Math.cos(th) * d, y = anchor.y + Math.sin(th) * d;
          let ok = true;
          for (const Q of placed) { if (Math.hypot(Q.x - x, Q.y - y) < (Q.r + P.r) * 0.94) { ok = false; break; } }
          if (!ok) continue;
          const cost = Math.hypot(x, y) + Math.hypot(x - anchor.x, y - anchor.y) * 0.4;
          if (cost < bc) { bc = cost; best = [x, y]; }
          break;
        }
      }
      if (!best) { P.x = (rnd() - 0.5); P.y = (rnd() - 0.5); } else { P.x = best[0]; P.y = best[1]; }
      placed.push(P);
    }
    /* settle: pulled to the middle, rims kept honest */
    for (let it = 0; it < 160; it++) {
      for (const P of L) { const m = Math.hypot(P.x, P.y) || 1; const pull = Math.min(0.004, m * 0.02); P.x -= P.x / m * pull; P.y -= P.y / m * pull; }
      for (let a = 0; a < L.length; a++) for (let b = a + 1; b < L.length; b++) {
        const A = L[a], B = L[b];
        let dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
        const need = (A.r + B.r) * 0.94;
        if (d < need) {
          if (d < 1e-9) { dx = 1e-6; dy = 0; d = 1e-6; }
          const push = (need - d) / d * 0.5;
          A.x -= dx * push; A.y -= dy * push; B.x += dx * push; B.y += dy * push;
        }
      }
    }
    let r = 0;
    for (const P of L) r = Math.max(r, Math.hypot(P.x, P.y) + P.r);
    return r;
  }
  const cmsP = provinces.filter(p => p.product === 'cms');
  const cloudP = provinces.filter(p => p.product === 'cloud');
  const Rcms = packContinent(cmsP, 'cms');
  const Rcloud = packContinent(cloudP, 'cloud');
  /* the CMS Main west of the middle sea, the Cloud Main east-north-east of
     her, a passage of open water between the two shores */
  const GAP = 9.5 / world.nmPerUnit;
  const cloudDx = Rcms + GAP + Rcloud, cloudDy = -Rcms * 0.34;
  for (const P of cloudP) { P.x += cloudDx; P.y += cloudDy; }
  /* centre the whole survey on its own weight, so the sheet sits square */
  let wsum = 0, wx = 0, wy = 0;
  for (const P of provinces) { wsum += P.size; wx += P.x * P.size; wy += P.y * P.size; }
  wx /= wsum; wy /= wsum;
  for (const P of provinces) { P.x -= wx; P.y -= wy; }
  world.provinces = provinces;
  world.continents = {
    cms: { x: -wx, y: -wy, r: Rcms, n: cmsP.reduce((s, p) => s + p.size, 0), provinces: cmsP.length },
    cloud: { x: cloudDx - wx, y: cloudDy - wy, r: Rcloud, n: cloudP.reduce((s, p) => s + p.size, 0), provinces: cloudP.length }
  };
  /* the 27 community positions the wind is derived from: each community
     stands at the weighted middle of her own pages' ground - the provinces
     now belong to the taxonomy, so a community may straddle several */
  const pos = [];
  for (let k = 0; k < n; k++) pos.push({ x: 0, y: 0, wsum: 0 });
  for (const P of provinces) {
    const per = new Map();
    for (const m of P.members) { const c = of[m]; per.set(c, (per.get(c) || 0) + 1); }
    for (const [c, w] of per) { pos[c].x += P.x * w; pos[c].y += P.y * w; pos[c].wsum += w; }
  }
  for (const q of pos) { if (q.wsum) { q.x /= q.wsum; q.y /= q.wsum; } delete q.wsum; }
  world.positions = pos;
  world.lanes = lanes.map(L => {
    const A = pos[L.i], B = pos[L.j];
    const net = L.ij - L.ji;
    const dx = B.x - A.x, dy = B.y - A.y;
    const d = Math.sqrt(dx * dx + dy * dy) + 1e-6;
    return {
      ...L, net,
      mx: (A.x + B.x) / 2, my: (A.y + B.y) / 2,
      ux: dx / d * Math.sign(net || 1), uy: dy / d * Math.sign(net || 1),
      w: Math.abs(net) + 0.35 * L.total,
      len: d
    };
  });
  const meanLen = world.lanes.reduce((s, L) => s + L.len, 0) / world.lanes.length;
  world.sigma = meanLen * 0.9;

  /* the island: the Document Service API */
  const dsSlug = '/cms/api/document-service';
  const dsIdx = of[dsSlug];
  const page = content.pages[dsSlug];
  const h2 = page.headings.filter(h => h.level === 2);
  const h3 = page.headings.filter(h => h.level === 3);
  world.island = {
    slug: dsSlug,
    name: page.title,
    words: graph.words[dsSlug],
    inbound: graph.inbound[dsSlug],
    h2, h3,
    headings: page.headings.filter(h => h.level === 2 || h.level === 3),
    pos: { x: pos[dsIdx].x, y: pos[dsIdx].y }
  };

  /* the whole corpus becomes the sea: 290 islands, provinced by the taxonomy */
  world.content = content; world.graph = graph; world.communities = communities;
  world.commOf = of;
  buildIslands();

  /* prevailing wind at the island; the approach runs down this wind */
  const w0 = windAtUnits(world.island.pos.x, world.island.pos.y);
  const w0m = Math.hypot(w0.x, w0.y) || 1;
  world.windCal = 16 / w0m;
  world.approachDir = { x: w0.x / w0m, y: w0.y / w0m };

  diag.data = {
    pages: Object.keys(content.pages).length,
    communities: communities.length,
    edges: graph.edges.length,
    interCommunityEdges: inter,
    intraCommunityEdges: intra,
    tradeWinds: world.tradeWinds,
    islandSlug: dsSlug,
    islandWords: world.island.words,
    islandHeadlandsH2: h2.length,
    islandKnollsH3: h3.length,
    /* the sea built out */
    islands: world.islands.length,
    archipelagos: world.archipelagos.length,
    unarchipelagoed: world.islands.filter(i => i.comm < 0).length,
    uncitedIslands: world.uncited.length,
    desertIslets: world.desert.map(i => i.slug),
    loneKeeperIslands: world.lone.length,
    nightIslands: world.nightIsles.length,
    ridingLightsTotal: world.islands.reduce((s, i) => s + i.inbound, 0),
    lanternsTotal: world.islands.reduce((s, i) => s + i.night, 0),
    headlandsTotal: world.islands.reduce((s, i) => s + i.nH2, 0),
    knollsTotal: world.islands.reduce((s, i) => s + i.nH3, 0),
    codeBlocksTotal: world.islands.reduce((s, i) => s + i.code, 0),
    codeBlocksIndexed: world.islands.reduce((s, i) => s + i.codeIndexed, 0),
    minIslandSepNm: Math.round(world.minSep * 1000) / 1000,
    seaExtentNm: Math.round(world.extentNm * 10) / 10,
    drownedHands: register.drownedCount,
    handsEver: register.authorsEver,
    livingHands: register.livingHands,
    deadPaths: register.deadPaths
  };
  world.ready = true;
}

/* ============================================================
   THE 290 ISLANDS
   One island per page. Its form is derived, not drawn:
     size      <- graph.json words
     headlands <- the page's h2 sections (Waghenaer coastal profile)
     knolls    <- its h3 sections
     riding lights <- graph.json inbound citations
     lanterns  <- provenance.json night edits
   Placement is the citation graph: members of a community are laid out by
   their intra-community citations around the community's hub, so pages that
   cite each other lie within reach; the 27 hubs stay exactly where the
   community layout (and therefore the wind field) put them.
   ============================================================ */
/* Reef hatching: the code blocks in a roadstead. graph.json's `code` field only
   counts fenced blocks at the top level of a page, so it reads 0 for the whole
   Document Service API, whose code lives inside its endpoint components. The
   reef is therefore recounted here from the block tree itself, which is the
   real corpus; the indexed figure is kept beside it for the record. */
function countCode(blocks, acc) {
  acc = acc || { n: 0 };
  for (const b of blocks || []) {
    if (b.t === 'code') acc.n++;
    if (b.t === 'endpoint') acc.n += (b.codeTabs || []).length + (b.responses || []).length;
    if (b.blocks) countCode(b.blocks, acc);
    if (b.tabs) for (const t of b.tabs) countCode(t.blocks, acc);
    if (b.cols) for (const c of b.cols) countCode(c, acc);
  }
  return acc.n;
}

function hash32(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

function buildIslands() {
  const content = world.content, graph = world.graph,
    communities = world.communities, of = world.commOf, prov = world.prov,
    taxonomy = world.taxonomy;
  const slugs = Object.keys(content.pages);
  const pos = world.positions;

  /* adjacency for the local layouts */
  const nbrs = new Map();
  for (const [a, b] of graph.edges) {
    if (!nbrs.has(a)) nbrs.set(a, new Map());
    if (!nbrs.has(b)) nbrs.set(b, new Map());
    nbrs.get(a).set(b, (nbrs.get(a).get(b) || 0) + 1);
    nbrs.get(b).set(a, (nbrs.get(b).get(a) || 0) + 1);
  }

  /* --- one island per page: the derived form --- */
  const isles = [];
  for (const slug of slugs) {
    const page = content.pages[slug];
    const p = prov[slug] || { commits: 0, authors: [], night: 0, careDays: 0, first: '', last: '', topAuthor: '' };
    const words = graph.words[slug] || 0;
    const h2 = page.headings.filter(h => h.level === 2);
    const h3 = page.headings.filter(h => h.level === 3);
    const isle = {
      slug, title: page.title, sidebarLabel: page.sidebarLabel || page.title,
      description: page.description || '', section: (taxonomy[slug] || page).section, product: page.product,
      tags: page.tags || [], words,
      code: countCode(page.blocks), codeIndexed: graph.code[slug] || 0,
      inbound: graph.inbound[slug] || 0, outbound: graph.outbound[slug] || 0,
      name: page.title, h2, h3,
      nH2: h2.length, nH3: h3.length,
      headings: page.headings.filter(h => h.level === 2 || h.level === 3),
      night: p.night || 0, commits: p.commits || 0, authors: p.authors || [],
      topAuthor: p.topAuthor || '', first: p.first || '', last: p.last || '',
      careDays: p.careDays || 0,
      comm: of[slug] == null ? -1 : of[slug],
      prov: -1, nearProv: null,
      /* size from word count: the Document Service island, 3,447 words, is 1.00 */
      mag: clamp(Math.pow(words / 3447, 0.34), 0.44, 1.85),
      pos: { x: 0, y: 0 },
      charted: false, visited: 0
    };
    isles.push(isle);
    world.bySlug.set(slug, isle);
  }

  /* --- provinces: a local layout per province, its hub pinned at the centre --- */
  /* A group of n islands at a mile between neighbours needs a disc of radius
     0.525 * s * sqrt(n) if it is packed the way circles pack. That is the
     radius below, with a little slack, so a province is a filled ground
     rather than a ring with an empty middle. */
  const SPACING_NM = 1.05;
  const archScaleNm = n => n <= 1 ? 0 : 0.58 * SPACING_NM * Math.sqrt(n) + 0.30;
  const provOf = new Map();
  for (let pi = 0; pi < world.provinces.length; pi++) {
    const P = world.provinces[pi];
    const members = P.members.slice().sort();
    const hub = P.hub;
    const n = members.length;
    const R = archScaleNm(n) / world.nmPerUnit;
    const minS = 0.95 / world.nmPerUnit;    // a mile, near enough, between neighbours
    const rnd = rngFor('prov:' + P.product + ':' + (P.section || P.comm));
    /* the hub holds the centre; the communities shape the sub-clusters
       (lab law): each community inside the province takes a wedge of the
       ground sized to her pages, so pages of one mind settle as one
       district - the citation springs below then pull the fine adjacency.
       No community is named; she only shapes the land. */
    const rest = members.filter(m => m !== hub);
    const local = [{ x: 0, y: 0, pin: true, slug: hub }];
    const byMind = new Map();
    for (const m of rest) {
      const c = world.commOf[m] != null ? world.commOf[m] : -1;
      let l = byMind.get(c); if (!l) byMind.set(c, l = []); l.push(m);
    }
    const wedges = [...byMind.values()].sort((a, b) => b.length - a.length);
    let a0 = rnd() * TAU;
    for (const gmem of wedges) {
      const span = TAU * gmem.length / Math.max(1, rest.length);
      const ac = a0 + span / 2;
      gmem.forEach((m, k) => {
        const t = (k + 0.62) / gmem.length;
        const r = R * (0.18 + 0.82 * Math.sqrt(t));
        const a = ac + (rnd() - 0.5) * span * 0.85;
        local.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, pin: false, slug: m });
      });
      a0 += span;
    }
    const idx = new Map(local.map((L, i2) => [L.slug, i2]));
    const springRest = R * 0.42;
    for (let it = 0; it < 200; it++) {
      const fx = new Array(local.length).fill(0), fy = new Array(local.length).fill(0);
      /* citations pull: pages that cite each other end up within reach */
      for (const m of members) {
        const i2 = idx.get(m), nb = nbrs.get(m);
        if (!nb) continue;
        for (const [o, w] of nb) {
          const j2 = idx.get(o);
          if (j2 == null || j2 === i2) continue;
          const dx = local[j2].x - local[i2].x, dy = local[j2].y - local[i2].y;
          const d = Math.hypot(dx, dy) + 1e-9;
          const k2 = 0.045 * Math.log(1 + w) * (d - springRest);
          fx[i2] += dx / d * k2; fy[i2] += dy / d * k2;
        }
      }
      const cool = 1 - it / 260;
      for (let k = 0; k < local.length; k++) {
        if (local[k].pin) continue;
        local[k].x += clamp(fx[k], -minS * 0.35, minS * 0.35) * cool;
        local[k].y += clamp(fy[k], -minS * 0.35, minS * 0.35) * cool;
      }
      /* then the hard rule: nobody sits on anybody */
      for (let a = 0; a < local.length; a++) for (let b = a + 1; b < local.length; b++) {
        let dx = local[b].x - local[a].x, dy = local[b].y - local[a].y;
        let d = Math.hypot(dx, dy);
        if (d >= minS) continue;
        if (d < 1e-9) { dx = minS * 0.5; dy = 0; d = minS * 0.5; }
        const push = (minS - d) / d * 0.5;
        const wa = local[a].pin ? 0 : (local[b].pin ? 1 : 0.5);
        const wb = local[b].pin ? 0 : (local[a].pin ? 1 : 0.5);
        local[a].x -= dx * push * 2 * wa; local[a].y -= dy * push * 2 * wa;
        local[b].x += dx * push * 2 * wb; local[b].y += dy * push * 2 * wb;
      }
      /* and the group keeps its water */
      for (const L of local) {
        if (L.pin) continue;
        const r = Math.hypot(L.x, L.y);
        if (r > R * 1.06) { L.x *= R * 1.06 / r; L.y *= R * 1.06 / r; }
      }
    }
    let rmax = 0;
    for (const L of local) {
      const isle = world.bySlug.get(L.slug);
      isle.pos.x = P.x + L.x;
      isle.pos.y = P.y + L.y;
      isle.prov = pi;
      provOf.set(L.slug, pi);
      rmax = Math.max(rmax, Math.hypot(L.x, L.y));
    }
    P.rmax = rmax;
  }
  /* the 27 communities keep their entry in the register, each standing at
     the weighted middle of her own pages' ground - the provinces belong to
     the taxonomy now, so no single shore is hers by right */
  for (let ci = 0; ci < communities.length; ci++) {
    const C = communities[ci];
    let sx = 0, sy = 0, sn = 0;
    for (const m of C.members) {
      const I = world.bySlug.get(m);
      if (!I) continue;
      sx += I.pos.x; sy += I.pos.y; sn++;
    }
    const cx2 = sn ? sx / sn : 0, cy2 = sn ? sy / sn : 0;
    let rr = 0;
    for (const m of C.members) {
      const I = world.bySlug.get(m);
      if (I) rr = Math.max(rr, Math.hypot(I.pos.x - cx2, I.pos.y - cy2));
    }
    world.archipelagos.push({
      i: ci, hub: C.hub, size: C.members.length, purity: C.purity, dominant: C.dominant,
      name: (content.pages[C.hub] || {}).title || C.hub,
      x: cx2, y: cy2, r: rr, members: C.members
    });
  }
  /* --- the pages no community holds --- */
  const orphans = isles.filter(i => i.comm < 0);
  /* the pages off soundings ride an ellipse of outer water clear of BOTH
     continents, so a page the corpus never touches is a shore the mainland
     never sees */
  let bminx = 1e9, bmaxx = -1e9, bminy = 1e9, bmaxy = -1e9;
  for (const P of world.provinces) {
    const pr = P.rmax || P.r;
    bminx = Math.min(bminx, P.x - pr); bmaxx = Math.max(bmaxx, P.x + pr);
    bminy = Math.min(bminy, P.y - pr); bmaxy = Math.max(bmaxy, P.y + pr);
  }
  const rimCx = (bminx + bmaxx) / 2, rimCy = (bminy + bmaxy) / 2;
  const rimX = (bmaxx - bminx) / 2 + 3.6 / world.nmPerUnit;
  const rimY = (bmaxy - bminy) / 2 + 3.6 / world.nmPerUnit;
  let oi = 0;
  for (const isle of orphans) {
    const nb = nbrs.get(isle.slug);
    const tally = new Map();
    if (nb) for (const [o, w] of nb) {
      const c = provOf.get(o);
      if (c != null) tally.set(c, (tally.get(c) || 0) + w);
    }
    if (tally.size) {
      /* it keeps company with the province its citations point into: laid
         just off that shore, an island the mainland never took in */
      let best = -1, bw = -1;
      for (const [c, w] of tally) if (w > bw) { bw = w; best = c; }
      const A = world.provinces[best];
      const rnd = rngFor('orphan:' + isle.slug);
      /* off the SEAWARD side of that province: outward from her continent */
      const K = world.continents[A.product];
      let ox = A.x - K.x, oy = A.y - K.y;
      const om = Math.hypot(ox, oy);
      if (om < 1e-6) { ox = 0; oy = -1; } else { ox /= om; oy /= om; }
      const a = Math.atan2(oy, ox) + (rnd() - 0.5) * 1.4;
      const r = (A.rmax || A.r) + (1.6 + rnd() * 1.1) / world.nmPerUnit;
      isle.pos.x = A.x + Math.cos(a) * r;
      isle.pos.y = A.y + Math.sin(a) * r;
      isle.nearComm = A.comm;
      isle.nearProv = best;
    } else {
      /* nothing cites it and it cites nothing: it lies off soundings, and only
         a visitor can ever reach it */
      const a = (oi * 2.399963 + 0.6) % TAU;
      const k = 1 + (oi % 3) * 0.03;
      isle.pos.x = rimCx + Math.cos(a) * rimX * k;
      isle.pos.y = rimCy + Math.sin(a) * rimY * k;
      isle.offSoundings = true;
      oi++;
    }
  }

  /* --- no two islands on the same water: a separation pass, hubs pinned --- */
  const minSep = 0.95 / world.nmPerUnit;
  const pinned = new Set(world.provinces.map(p => p.hub));
  for (let it = 0; it < 90; it++) {
    /* coarse grid so this stays O(n) rather than O(n^2) x 90 */
    const cell = minSep * 1.05;
    const grid = new Map();
    for (const I of isles) {
      const gx = Math.floor(I.pos.x / cell), gy = Math.floor(I.pos.y / cell);
      const k = gx + ',' + gy;
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(I);
    }
    let moved = 0;
    for (const I of isles) {
      const gx = Math.floor(I.pos.x / cell), gy = Math.floor(I.pos.y / cell);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        const bucket = grid.get((gx + dx) + ',' + (gy + dy));
        if (!bucket) continue;
        for (const J of bucket) {
          if (J === I) continue;
          let ax = J.pos.x - I.pos.x, ay = J.pos.y - I.pos.y;
          let d = Math.hypot(ax, ay);
          if (d >= minSep) continue;
          if (d < 1e-9) { ax = 1e-6; ay = 0; d = 1e-6; }
          const push = (minSep - d) * 0.5;
          const ipin = pinned.has(I.slug), jpin = pinned.has(J.slug);
          const wI = ipin ? 0 : (jpin ? 1 : 0.5), wJ = jpin ? 0 : (ipin ? 1 : 0.5);
          I.pos.x -= ax / d * push * 2 * wI; I.pos.y -= ay / d * push * 2 * wI;
          J.pos.x += ax / d * push * 2 * wJ; J.pos.y += ay / d * push * 2 * wJ;
          moved++;
        }
      }
    }
    if (!moved) break;
  }

  /* --- measured, not asserted --- */
  let minD = Infinity, minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
  for (let a = 0; a < isles.length; a++) {
    const A = isles[a];
    minx = Math.min(minx, A.pos.x); maxx = Math.max(maxx, A.pos.x);
    miny = Math.min(miny, A.pos.y); maxy = Math.max(maxy, A.pos.y);
    for (let b = a + 1; b < isles.length; b++) {
      const d = Math.hypot(isles[b].pos.x - A.pos.x, isles[b].pos.y - A.pos.y);
      if (d < minD) minD = d;
    }
  }
  world.minSep = minD * world.nmPerUnit;
  world.extentNm = Math.max(maxx - minx, maxy - miny) * world.nmPerUnit;
  world.bounds = { minx, maxx, miny, maxy };

  world.islands = isles;
  world.visU2 = Math.pow(VIS_NM / world.nmPerUnit, 2);
  world.uncited = isles.filter(i => i.inbound === 0);
  world.desert = isles.filter(i => i.inbound === 0 && i.outbound === 0);
  world.lone = isles.filter(i => i.authors.length === 1);
  world.nightIsles = isles.filter(i => i.night > 0);

  /* the demonstration island keeps its identity: the hub sits at the exact
     community centre the wind was derived from, so its position is unchanged */
  const ds = world.bySlug.get(world.island.slug);
  ds.pos.x = world.island.pos.x;
  ds.pos.y = world.island.pos.y;
  world.island = ds;

  for (const I of isles) formOf(I);
}

function windAtUnits(x, y) {
  let wx = 0, wy = 0;
  const s2 = world.sigma * world.sigma;
  for (const L of world.lanes) {
    if (!L.net) continue;
    const dx = x - L.mx, dy = y - L.my;
    const g = Math.exp(-(dx * dx + dy * dy) / s2);
    wx += L.ux * L.w * g;
    wy += L.uy * L.w * g;
  }
  return { x: wx, y: wy };
}

/* ---------------- ship + sim state ---------------- */
const ship = {
  x: 0, y: 0,
  bearing: 0,
  omega: 0,
  orderedBearing: 0,
  orderHist: [],
  wheelAngle: 0,
  wheelHeld: false,
  sail: 'full',
  knots: 0,
  anchored: false,
  bound: null,
  boundLock: false,
  atAnchorOff: null,
  clearOf: null
};
const env = { hourMix: 0, hourTarget: 0, t: 0, boilIdx: 0 };
/* The spyglass follows the hand (owner order): ax/ay is where the hand aims,
   x/y is where the heavy brass tube actually points - it trails the aim with
   an eased lag. Arrow keys sweep the aim while SPACE is held, for keyboard
   visitors. Clamped so the glass never leaves the plate. */
const lens = { raised: false, t: 0, x: W / 2, y: 330, ax: W / 2, ay: 330 };
const LENS_AX0 = 110, LENS_AX1 = W - 110, LENS_AY0 = 100, LENS_AY1 = 648;
function aimLens(x, y) {
  lens.ax = clamp(x, LENS_AX0, LENS_AX1);
  lens.ay = clamp(y, LENS_AY0, LENS_AY1);
  if (REDUCED) { lens.x = lens.ax; lens.y = lens.ay; }
  if (lens.raised) dirty = true;
}
const story = { leadsman1: false, leadsman2: false, started: false, raised: false, lastDist: null, minDist: null,
  maiden: false, qs: null };

/* THE PASSAGE (owner order): clicking a place on the chart is a short sailed
   passage, not a warp - the chart folds away, sea and sky sweep past, and she
   arrives in those waters with the shore dead ahead. Skippable with any key;
   reduced motion lands at once with a one-line caption. */
const passage = { on: false, closing: false, t: 0, dur: 2, ax: 0, ay: 0, bx: 0, by: 0, isle: null, nm: 0 };

/* ---------------- the calm start (owner order) ----------------
   The ship begins STILL, hove to on a quiet sea, and the deck teaches before
   anything moves. The sailing-orders card stays up until the first meaningful
   input; that input sheets her in and she gathers way with the usual mass
   while the card eases off. Returning visitors (localStorage carta.taught)
   get one quiet line only. Reduced motion keeps her becalmed as today. */
const calm = { done: false, pristine: true };
function firstOrder(kind) {
  if (calm.done) return;
  calm.done = true;
  try { store.set('taught', true); } catch (e) {}
  const hints = document.getElementById('hints');
  if (hints) hints.classList.remove('shown');   // the card eases off, no wall
  if (calm.pristine && ship.sail === 'rest' && !ship.anchored &&
      (kind === 'steer' || kind === 'glass')) {
    setSail('full', true);
    captionNow('She sheets home and gathers way.', 3400);
  }
  dirty = true;
}

function sailBase(s) {
  /* topgallants: the long open-water legs between archipelagos, so a crossing
     that is not a neighbour's does not become the sailing tax the ruling
     forbade. Full sail stays exactly where GATE-0 tuned it. */
  return s === 'travel' ? 15.5 : s === 'full' ? 8.6 : s === 'half' ? 4.8 : 0;
}

function placeShipAtDistance(nm, isle) {
  const target = isle || world.island;
  const u = nm / world.nmPerUnit;
  const d = isle ? approachDirFor(isle) : world.approachDir;
  ship.x = target.pos.x - d.x * u;
  ship.y = target.pos.y - d.y * u;
  const brg = norm360(Math.atan2(target.pos.x - ship.x, -(target.pos.y - ship.y)) * 180 / Math.PI);
  ship.bearing = brg;
  ship.orderedBearing = brg;
  ship.omega = 0;
  ship.orderHist = [[env.t, brg]];
  ship.anchored = false;
  story.leadsman1 = story.leadsman2 = false;
  story.raised = false;
  story.lastDist = null; story.minDist = null;
  ship.bound = target;
  ship.boundLock = true;
  ship.lastFix = { x: ship.x, y: ship.y, t: env.t };
  ship.clearOf = null;
  clearCaptions();
  if (typeof sound !== 'undefined') sound.setHarbour(target);
}
/* every island is approached down its own prevailing wind, the way the
   Document Service shore is: the wind is the citation flow */
function approachDirFor(isle) {
  const w = windAtUnits(isle.pos.x, isle.pos.y);
  const m = Math.hypot(w.x, w.y) || 1;
  return { x: w.x / m, y: w.y / m };
}

function distToNm(isle) {
  const dx = isle.pos.x - ship.x, dy = isle.pos.y - ship.y;
  return Math.hypot(dx, dy) * world.nmPerUnit;
}
function bearingTo(isle) {
  /* the sheet's own north: -y, the same the rose and the rumors swear by */
  return norm360(Math.atan2(isle.pos.x - ship.x, -(isle.pos.y - ship.y)) * 180 / Math.PI);
}
function distToIslandNm() { return distToNm(ship.bound || world.island); }
function bearingToIsland() { return bearingTo(ship.bound || world.island); }

/* Which island is under the bow. A course shaped at the chart table, or the
   approach the probes set up, LOCKS the bound island until she is astern or the
   anchor goes down; otherwise the sea picks the nearest thing ahead. */
const VIS_NM = 6.4;
const SHOAL_NM = 0.42;      // no ship sails over land: the berth she must give
let ISLE_CAP = 18;
let closeAboard = null;
function pickVisible() {
  const vis = [];
  const hb = ship.bearing;
  /* Inside the roadstead of the island she is bound for, the ship is conned in
     rather than sheered off: a shoal berth taken from a neighbour half a mile
     out would shove her past the landfall she crossed for. */
  const inRoads = ship.bound && distToNm(ship.bound) < 0.8;
  const clear = (inRoads ? 0 : SHOAL_NM) / world.nmPerUnit;
  const clear2 = clear * clear;
  let near = null, nearD = Infinity;
  for (const I of world.islands) {
    let dx = I.pos.x - ship.x, dy = I.pos.y - ship.y;
    let d2 = dx * dx + dy * dy;
    /* the shoal: she is set outside the berth rather than sailing through a
       coast. Only the island she is bound for lets her come right in. */
    if (d2 < clear2 && I !== ship.bound && !REDUCED && !passage.on) {
      const d = Math.sqrt(d2) || 1e-9;
      const push = (clear - d) / d;
      ship.x -= dx * push;
      ship.y -= dy * push;
      dx = I.pos.x - ship.x; dy = I.pos.y - ship.y;
      d2 = dx * dx + dy * dy;
      if (d2 < nearD) { nearD = d2; near = I; }
    }
    if (d2 > world.visU2) continue;
    const dist = Math.sqrt(d2) * world.nmPerUnit;
    if (dist < 0.012) continue;
    const az = angDiff(norm360(Math.atan2(dx, -dy) * 180 / Math.PI), hb);
    if (Math.abs(az) > 58) continue;
    vis.push({ isle: I, dist, az, bound: false });
  }
  if (near && near !== closeAboard) {
    closeAboard = near;
    const az = angDiff(bearingTo(near), ship.bearing);
    caption(near.title + ' close aboard to ' + (az >= 0 ? 'starboard' : 'port') +
      '. She gives the shoal a berth.', 3400);
  } else if (!near) closeAboard = null;
  vis.sort((a, b) => b.dist - a.dist);
  if (vis.length > ISLE_CAP) vis.splice(0, vis.length - ISLE_CAP);
  return vis;
}
function pickBound(vis) {
  if (ship.boundLock && ship.bound) {
    const az = Math.abs(angDiff(bearingTo(ship.bound), ship.bearing));
    if (az < 120) return ship.bound;
    ship.boundLock = false;
  }
  let best = null, bestCost = Infinity;
  for (const V of vis) {
    const cost = V.dist * (1 + 2.6 * Math.abs(V.az) / 58);
    if (cost < bestCost) { bestCost = cost; best = V.isle; }
  }
  return best || ship.bound || world.island;
}
function setBound(isle, lock) {
  if (ship.bound !== isle) {
    ship.bound = isle;
    story.leadsman1 = story.leadsman2 = false;
    story.raised = false;
    story.lastDist = null; story.minDist = null;
    clearCaptions();
    /* the chant takes its cadence from the water she is crossing toward */
    if (typeof sound !== 'undefined') sound.setHarbour(isle);
  }
  ship.boundLock = !!lock;
}

function effectiveOrder(t) {
  const hist = ship.orderHist;
  const target = t - ORDER_LAG;
  if (!hist.length) return ship.orderedBearing;
  if (target <= hist[0][0]) return hist[0][1];
  for (let i = hist.length - 1; i >= 0; i--) {
    if (hist[i][0] <= target) return hist[i][1];
  }
  return hist[hist.length - 1][1];
}
function pushOrder(t) {
  const hist = ship.orderHist;
  hist.push([t, ship.orderedBearing]);
  while (hist.length > 2 && hist[0][0] < t - 3) hist.shift();
}

/* ---------------- baked art ---------------- */
const bake = {};
function mkCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * SCALE); c.height = Math.ceil(h * SCALE);
  const g = c.getContext('2d');
  g.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  return [c, g];
}

/* --- paper --- */
function bakePaper() {
  const [c, g] = mkCanvas(W, H);
  const rnd = rngFor('paper');
  g.fillStyle = PAPER;
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) {
    const x = rnd() * W, y = rnd() * H, r = 60 + rnd() * 260;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    const warm = rnd() > 0.5;
    grad.addColorStop(0, warm ? 'rgba(222,204,164,0.05)' : 'rgba(236,228,206,0.05)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const fleckCols = ['rgba(180,158,118,0.06)', 'rgba(160,138,100,0.05)', 'rgba(210,190,150,0.08)', 'rgba(120,100,70,0.045)'];
  for (let k = 0; k < 4; k++) {
    g.fillStyle = fleckCols[k];
    for (let i = 0; i < 5200; i++) g.fillRect(rnd() * W, rnd() * H, rnd() < 0.8 ? 1 : 2, 1);
  }
  g.strokeStyle = 'rgba(150,128,92,0.07)';
  g.lineWidth = 0.7;
  for (let i = 0; i < 650; i++) {
    const x = rnd() * W, y = rnd() * H, a = rnd() * TAU, l = 3 + rnd() * 11;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  const v = g.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.95);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(96,78,52,0.075)');
  g.fillStyle = v;
  g.fillRect(0, 0, W, H);
  bake.paper = c;
}

/* --- watercolor sky washes --- */
function bakeSky(kind) {
  const SKYH = HORIZON + 26;
  const [c, g] = mkCanvas(W, SKYH);
  const rnd = rngFor('sky-' + kind);
  const grad = g.createLinearGradient(0, 0, 0, SKYH);
  if (kind === 'afternoon') {
    grad.addColorStop(0, 'rgba(158,174,188,0.45)');
    grad.addColorStop(0.45, 'rgba(186,188,172,0.30)');
    grad.addColorStop(0.8, 'rgba(224,196,134,0.32)');
    grad.addColorStop(1, 'rgba(230,206,150,0.36)');
  } else {
    grad.addColorStop(0, 'rgba(58,56,108,0.58)');
    grad.addColorStop(0.42, 'rgba(104,80,112,0.44)');
    grad.addColorStop(0.75, 'rgba(196,120,96,0.38)');
    grad.addColorStop(0.94, 'rgba(232,176,104,0.44)');
    grad.addColorStop(1, 'rgba(232,182,116,0.40)');
  }
  g.fillStyle = grad;
  g.fillRect(0, 0, W, SKYH);
  for (let i = 0; i < 30; i++) {
    const x = rnd() * W, y = rnd() * SKYH * 0.9, rw = 90 + rnd() * 260, rh = 24 + rnd() * 70;
    g.save();
    g.translate(x, y);
    g.rotate((rnd() - 0.5) * 0.5);
    const bg = g.createRadialGradient(0, 0, 0, 0, 0, rw);
    const cool = rnd() > (kind === 'afternoon' ? 0.45 : 0.6);
    const col = kind === 'afternoon'
      ? (cool ? 'rgba(150,168,182,0.085)' : 'rgba(226,198,140,0.085)')
      : (cool ? 'rgba(70,66,120,0.10)' : 'rgba(212,140,100,0.10)');
    bg.addColorStop(0, col);
    bg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = bg;
    g.scale(1, rh / rw);
    g.beginPath(); g.arc(0, 0, rw, 0, TAU); g.fill();
    g.restore();
  }
  g.fillStyle = kind === 'afternoon' ? 'rgba(120,110,90,0.03)' : 'rgba(60,50,90,0.045)';
  for (let i = 0; i < 3600; i++) g.fillRect(rnd() * W, rnd() * SKYH, 1, 1);
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 90; i++) {
    const x = rnd() * W, y = SKYH - rnd() * 16, r = 6 + rnd() * 22;
    g.beginPath();
    g.ellipse(x, y + r * 0.7, r, r * 0.55, 0, 0, TAU);
    g.fill();
  }
  g.globalCompositeOperation = 'source-over';
  return c;
}

/* --- engraved sky lines: the burin's horizontal tone near the horizon --- */
function bakeSkyLines() {
  const SKYH = HORIZON + 4;
  const [c, g] = mkCanvas(W, SKYH);
  const rnd = rngFor('skylines');
  g.lineCap = 'round';
  g.strokeStyle = 'rgba(96,76,52,1)';
  // dense tone strip rising from the horizon, fading upward
  for (let y = SKYH - 4; y > SKYH - 118; y -= 4.2 + (SKYH - y) * 0.02) {
    const fade = (y - (SKYH - 118)) / 118;
    g.globalAlpha = 0.04 + fade * 0.14;
    g.lineWidth = 0.65;
    let x = -20 + rnd() * 30;
    while (x < W) {
      const len = 50 + rnd() * 170;
      const dy = (rnd() - 0.5) * 1.6;
      g.beginPath();
      g.moveTo(x, y + dy);
      g.quadraticCurveTo(x + len / 2, y + dy + (rnd() - 0.5) * 2, x + len, y + dy * 0.5);
      g.stroke();
      x += len + 14 + rnd() * 60;
    }
  }
  // a few loose upper strokes around cloud height
  g.globalAlpha = 0.06;
  for (let i = 0; i < 40; i++) {
    const y = 40 + rnd() * 200;
    const x = rnd() * W, len = 60 + rnd() * 130;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + len / 2, y - 2 + rnd() * 4, x + len, y);
    g.stroke();
  }
  g.globalAlpha = 1;
  bake.skyLines = c;
}

/* --- woodcut clouds: stacked billow arcs with a curled end, Carta Marina key --- */
function bakeClouds() {
  const sprites = [];
  for (let s = 0; s < 3; s++) {
    const wd = 520, ht = 190;
    const [c, g] = mkCanvas(wd, ht);
    const rnd = rngFor('cloud' + s);
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(94,74,50,1)';
    const cx = wd / 2, cy = 120;
    const spanW = 170 + rnd() * 60;
    // billow tops: overlapping dome arcs of different radii along the top
    const domes = [];
    let dx = cx - spanW;
    while (dx < cx + spanW) {
      const r = 20 + rnd() * 34;
      domes.push({ x: dx + r * 0.7, r, lift: rnd() * 18 });
      dx += r * 1.05;
    }
    // flat-ish base: a few broken, nearly straight strokes
    const baseY = cy + 8;
    g.lineWidth = 1.5;
    g.globalAlpha = 0.55;
    let px = cx - spanW - 10;
    while (px < cx + spanW) {
      const step = 60 + rnd() * 90;
      g.beginPath();
      g.moveTo(px, baseY + (rnd() - 0.5) * 2);
      g.quadraticCurveTo(px + step / 2, baseY + 1.5 + rnd() * 1.5, px + step, baseY + (rnd() - 0.5) * 2);
      g.stroke();
      px += step + 16 + rnd() * 26;
    }
    // dome outlines
    for (const d of domes) {
      const top = baseY - 14 - d.lift;
      g.lineWidth = 1.6;
      g.globalAlpha = 0.62;
      g.beginPath();
      g.arc(d.x, top, d.r, Math.PI * 1.05, Math.PI * 1.98);
      g.stroke();
      // interior shading: short arcs following the dome, lower right
      g.lineWidth = 1;
      g.globalAlpha = 0.32;
      for (let rr = d.r - 5; rr > d.r * 0.35; rr -= 4.5) {
        g.beginPath();
        g.arc(d.x + (d.r - rr) * 0.3, top + (d.r - rr) * 0.25, rr, Math.PI * 1.25, Math.PI * 1.8);
        g.stroke();
      }
    }
    // one curled end: the woodcut spiral, at the windward tip only
    const spx = cx + spanW + 6, spy = baseY - 18;
    g.lineWidth = 1.5;
    g.globalAlpha = 0.6;
    g.beginPath();
    for (let a = 0; a < TAU * 1.8; a += 0.14) {
      const r = 3 + a * 3.4;
      const x = spx - Math.cos(a + 1.2) * r, y = spy + Math.sin(a + 1.2) * r * 0.8;
      if (a === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
    // under-wisps trailing leeward
    g.globalAlpha = 0.4;
    g.lineWidth = 1.05;
    for (let t = 0; t < 4; t++) {
      const y = baseY + 7 + t * 6;
      const x0 = cx - spanW * (0.8 - t * 0.18);
      const x1 = cx + spanW * (0.55 - t * 0.1) + rnd() * 26;
      g.beginPath();
      g.moveTo(x0, y);
      g.quadraticCurveTo((x0 + x1) / 2, y - 4 - rnd() * 3, x1, y - 1);
      g.stroke();
    }
    g.globalAlpha = 1;
    sprites.push(c);
  }
  bake.clouds = sprites;
}

/* --- the rolling sea: coherent swell trains of engraved hatching --- */
const STRIPW = 2880, TAILPAD = 168;
const MAXSLICE = 150;              // logical px; must stay <= TAILPAD
const SAG_PX = 0.45;               // allowed sag of the piecewise-linear swell, screen px
const BANDS = [];
(function defineBands() {
  const heights  = [16, 22, 30, 42, 60, 86, 122, 172];
  const rowGaps  = [2.5, 2.9, 3.5, 4.5, 5.9, 7.7, 10.2, 13.4];
  const strokeWs = [0.65, 0.75, 0.9, 1.05, 1.3, 1.62, 2.05, 2.55];
  const alphas   = [0.5, 0.48, 0.46, 0.45, 0.47, 0.5, 0.54, 0.58];
  const bAmps    = [1.2, 1.7, 2.3, 3.2, 4.2, 5.6, 7.0, 8.6];
  const lambdas  = [520, 560, 620, 690, 760, 830, 900, 980];
  let y = HORIZON - 2;
  for (let i = 0; i < heights.length; i++) {
    const t = i / (heights.length - 1);
    BANDS.push({
      i, y, h: heights[i],
      rowGap: rowGaps[i], strokeW: strokeWs[i], alpha: alphas[i],
      ink: `rgb(${Math.round(lerp(92, 42, t))},${Math.round(lerp(72, 32, t))},${Math.round(lerp(50, 20, t))})`,
      bakedAmp: bAmps[i],
      amp: lerp(1.6, 13.0, t * t),
      lambda: lambdas[i],
      omega: lerp(0.55, 1.05, t),
      phase0: i * 1.7,
      drift: lerp(2, 26, t),
      scroll: 0,
      strips: []
    });
    y += heights[i] - 5;
  }
})();

/* horizon dashes: irregular by construction, so the broken line carries no period */
const HORIZON_DASH = (function () {
  const rnd = rngFor('horizon-dash');
  const out = [];
  let x = -6 - rnd() * 20;
  while (x < W) {
    const len = 9 + rnd() * 26;
    out.push({ x, len });
    x += len + 5 + rnd() * 22;
  }
  return out;
})();

function bakeBands() {
  for (const B of BANDS) {
    const layoutRnd = rngFor('band-layout' + B.i);
    const PADT = 5;
    // shared swell of the band: rows undulate together, crests lean forward
    const swellPhi = layoutRnd() * TAU;
    const lam = B.lambda * (2880 / 1440) / 2;   // swell wavelength in strip space
    const rows = [];
    for (let ry = PADT; ry < B.h - 1; ry += B.rowGap * (0.9 + layoutRnd() * 0.22)) {
      rows.push({
        ry,
        phase: swellPhi + (ry / B.h) * 0.9,     // progressive lean
        amp: B.bakedAmp * (0.8 + layoutRnd() * 0.4),
        wob: 1.5 + layoutRnd() * 2.5,           // small secondary ripple
        wobPh: layoutRnd() * TAU,
        seed: Math.floor(layoutRnd() * 1e9)
      });
    }
    for (let v = 0; v < 3; v++) {
      const [c, g] = mkCanvas(STRIPW + TAILPAD, B.h + 10);
      g.lineCap = 'round';
      g.strokeStyle = B.ink;
      const near = B.i >= 4;
      for (const row of rows) {
        const jr = mulberry32((row.seed + v * 7919) >>> 0);
        const yAt = (x) =>
          row.ry +
          row.amp * Math.sin(TAU * x / lam + row.phase) +
          Math.sin(TAU * x / (lam * 0.23) + row.wobPh) * row.wob * 0.35;
        let x = -20 - jr() * 40;
        while (x < STRIPW + 10) {
          const crest = Math.sin(TAU * x / lam + row.phase);
          // stroke run length: long steady lines, broken at crests
          const run = (150 + jr() * 260) * (crest > 0.6 ? 0.4 : 1);
          const gap = crest > 0.62 ? 12 + jr() * 28 : (jr() < 0.14 ? 5 + jr() * 12 : 0.5);
          const lw = B.strokeW * (0.78 + jr() * 0.5);
          // tonal swell: troughs sit darker, crests open toward the paper
          const toneMod = 1 + 0.34 * Math.max(0, -crest) - 0.22 * Math.max(0, crest);
          const al = B.alpha * (0.8 + jr() * 0.4) * toneMod;
          const jy = (jr() - 0.5) * (near ? 1.3 : 0.7);
          g.lineWidth = lw;
          g.globalAlpha = al;
          // draw the run as a smooth sampled polyline
          for (const off of [-STRIPW, 0, STRIPW]) {
            if (x + run + off < -30 || x + off > STRIPW + TAILPAD + 30) continue;
            g.beginPath();
            let first = true;
            for (let xx = x; xx <= x + run; xx += 16) {
              const yy = yAt(xx) + jy + (jr() - 0.5) * 0.5;
              if (first) { g.moveTo(xx + off, yy); first = false; }
              else g.lineTo(xx + off, yy);
            }
            g.stroke();
          }
          // crest accent: a darker short dash riding just above breaking crests
          if (crest > 0.55 && jr() < 0.8) {
            g.lineWidth = lw * 1.3;
            g.globalAlpha = Math.min(1, al * 1.5);
            const ax = x + run + 3, alen = 8 + jr() * 22;
            for (const off of [-STRIPW, 0, STRIPW]) {
              if (ax + off < -30 || ax + off > STRIPW + TAILPAD + 30) continue;
              g.beginPath();
              g.moveTo(ax + off, yAt(ax) - 1.6);
              g.quadraticCurveTo(ax + alen / 2 + off, yAt(ax + alen / 2) - 2.4, ax + alen + off, yAt(ax + alen) - 1.2);
              g.stroke();
            }
          }
          x += run + gap;
        }
        // diagonal flick ticks on wave faces of near bands
        if (near) {
          const jt = mulberry32((row.seed ^ 0x9e37) + v);
          g.lineWidth = B.strokeW * 0.7;
          for (let k = 0; k < 14; k++) {
            const tx = jt() * STRIPW;
            const crest = Math.sin(TAU * tx / lam + row.phase);
            if (crest < 0.05 || crest > 0.62) continue;
            const ty = row.ry + row.amp * crest + 1.5;
            const tl = 4 + jt() * 8;
            g.globalAlpha = B.alpha * 0.45;
            for (const off of [-STRIPW, 0, STRIPW]) {
              if (tx + off < 0 || tx + off > STRIPW + TAILPAD) continue;
              g.beginPath();
              g.moveTo(tx + off, ty);
              g.lineTo(tx + off - tl * 0.55, ty + tl);
              g.stroke();
            }
          }
        }
      }
      // baked foam stipple at the crest gaps (nearer bands)
      if (B.i >= 3) {
        const js = mulberry32((B.i * 131 + v * 17) >>> 0);
        g.fillStyle = B.ink;
        for (const row of rows) {
          for (let k = 0; k < 26; k++) {
            const fx = js() * STRIPW;
            const crest = Math.sin(TAU * fx / lam + row.phase);
            if (crest < 0.68) continue;
            const fy = row.ry + row.amp * crest - 2;
            for (let d = 0; d < 5; d++) {
              const px = fx + (js() - 0.5) * 16, py = fy + (js() - 0.5) * 4;
              g.globalAlpha = 0.35 + js() * 0.3;
              for (const off of [-STRIPW, 0, STRIPW]) {
                if (px + off < 0 || px + off > STRIPW + TAILPAD) continue;
                g.fillRect(px + off, py, 1.3, 1.3);
              }
            }
          }
        }
      }
      g.globalAlpha = 1;
      B.strips.push(c);
    }
  }
}

/* --- foreground: deck, rails, bowsprit, rigging --- */
const BOWX = 720, BOWY = 514;
const RAIL = { p0: 800, p0y: 884, c: 420, cy: 636, p1: 6, p1y: BOWY + 8 };
function railPoint(sign, t) {  // sign -1 left, +1 right ; t 0 at stern edge, 1 at bow
  const X = x => 720 + sign * x;
  const qx = (1 - t) * (1 - t) * X(RAIL.p0) + 2 * (1 - t) * t * X(RAIL.c) + t * t * X(RAIL.p1);
  const qy = (1 - t) * (1 - t) * RAIL.p0y + 2 * (1 - t) * t * RAIL.cy + t * t * RAIL.p1y;
  return [qx, qy];
}

function bakeDeck() {
  const [c, g] = mkCanvas(W, H);
  const rnd = rngFor('deck');
  g.lineCap = 'round';
  g.lineJoin = 'round';

  // deck region between the two rails
  function deckRegion() {
    g.beginPath();
    g.moveTo(720 - 800, 884 + 60);
    g.moveTo(-90, H + 50);
    g.quadraticCurveTo(720 - 420, 636, BOWX, BOWY + 8);
    g.quadraticCurveTo(720 + 420, 636, W + 90, H + 50);
    g.closePath();
  }

  // warm deck tone, clearly lighter than the water
  deckRegion();
  g.fillStyle = 'rgba(226,205,160,0.55)';
  g.fill();

  // plank seams to the vanishing point
  g.save();
  deckRegion();
  g.clip();
  const VPX = 720, VPY = 462;
  g.strokeStyle = 'rgba(58,42,24,0.72)';
  for (let k = -9; k <= 9; k++) {
    const bx = 720 + k * 118;
    g.lineWidth = 2.0 - Math.min(Math.abs(k) * 0.09, 0.9);
    g.beginPath();
    g.moveTo(VPX + (bx - VPX) * 0.12, VPY + (H + 60 - VPY) * 0.12);
    g.lineTo(bx, H + 60);
    g.stroke();
  }
  // butt joints
  g.strokeStyle = 'rgba(58,42,24,0.32)';
  g.lineWidth = 1.2;
  for (let k = -9; k < 9; k++) {
    const bx0 = 720 + k * 118, bx1 = 720 + (k + 1) * 118;
    let t = 0.24 + (((k % 4) + 4) % 4) * 0.13 + rnd() * 0.1;
    while (t < 0.95) {
      const xa = VPX + (bx0 - VPX) * t, ya = VPY + (H + 60 - VPY) * t;
      const xb = VPX + (bx1 - VPX) * t, yb = VPY + (H + 60 - VPY) * t;
      g.beginPath();
      g.moveTo(xa + (xb - xa) * 0.08, ya + (yb - ya) * 0.08);
      g.lineTo(xb - (xb - xa) * 0.08, yb - (yb - ya) * 0.08);
      g.stroke();
      t += 0.28 + rnd() * 0.1;
    }
  }
  // restrained grain: one or two long lines per plank, following the plank
  g.strokeStyle = 'rgba(90,68,40,0.22)';
  g.lineWidth = 0.9;
  for (let k = -9; k < 9; k++) {
    const bx = 720 + (k + 0.35 + rnd() * 0.3) * 118;
    for (let ggn = 0; ggn < 2; ggn++) {
      const t0 = 0.3 + rnd() * 0.4, t1 = t0 + 0.18 + rnd() * 0.25;
      const xa = VPX + (bx - VPX) * t0, ya = VPY + (H + 60 - VPY) * t0;
      const xb = VPX + (bx - VPX) * Math.min(t1, 1), yb = VPY + (H + 60 - VPY) * Math.min(t1, 1);
      g.beginPath();
      g.moveTo(xa, ya);
      g.quadraticCurveTo((xa + xb) / 2 + (rnd() - 0.5) * 6, (ya + yb) / 2, xb, yb);
      g.stroke();
    }
  }
  // a few knots in the wood
  g.strokeStyle = 'rgba(90,68,40,0.35)';
  for (let i = 0; i < 7; i++) {
    const t = 0.45 + rnd() * 0.5;
    const bx = 720 + (Math.floor(rnd() * 16) - 8 + 0.5) * 118;
    const x = VPX + (bx - VPX) * t, y = VPY + (H + 60 - VPY) * t;
    g.beginPath();
    g.ellipse(x, y, 3.5, 2, 0.4, 0, TAU);
    g.stroke();
  }
  g.restore();

  // hull wale: a dark band outboard of each rail separating deck from sea
  for (const sign of [-1, 1]) {
    g.strokeStyle = 'rgba(34,24,13,0.85)';
    g.lineWidth = 13;
    g.beginPath();
    const [sx, sy] = railPoint(sign, 0.02);
    g.moveTo(sx + sign * 8, sy + 12);
    for (let t = 0.06; t <= 1; t += 0.05) {
      const [qx, qy] = railPoint(sign, t);
      g.lineTo(qx + sign * 8 * (1 - t * 0.85), qy + 12 * (1 - t * 0.7));
    }
    g.stroke();
  }

  // bulwarks
  for (const sign of [-1, 1]) {
    // cap rail
    g.strokeStyle = 'rgba(30,21,12,0.92)';
    g.lineWidth = 4.4;
    g.beginPath();
    let first = true;
    for (let t = 0; t <= 1.001; t += 0.05) {
      const [qx, qy] = railPoint(sign, t);
      if (first) { g.moveTo(qx, qy); first = false; } else g.lineTo(qx, qy);
    }
    g.stroke();
    // inner rail line
    g.lineWidth = 1.7;
    g.beginPath();
    first = true;
    for (let t = 0; t <= 1.001; t += 0.05) {
      const [qx, qy] = railPoint(sign, t);
      g[first ? 'moveTo' : 'lineTo'](qx - sign * 6 * (1 - t * 0.7), qy - 11 * (1 - t * 0.7));
      first = false;
    }
    g.stroke();
    // stanchions between the two
    g.lineWidth = 1.8;
    g.strokeStyle = 'rgba(30,21,12,0.7)';
    for (let t = 0.05; t < 0.98; t += 0.065) {
      const [qx, qy] = railPoint(sign, t);
      g.beginPath();
      g.moveTo(qx, qy);
      g.lineTo(qx - sign * 6 * (1 - t * 0.7), qy - 11 * (1 - t * 0.7));
      g.stroke();
    }
    // cast shadow hatch inside the bulwark
    g.strokeStyle = 'rgba(40,28,16,0.28)';
    g.lineWidth = 1;
    for (let t = 0.03; t < 0.97; t += 0.02) {
      const [qx, qy] = railPoint(sign, t);
      g.beginPath();
      g.moveTo(qx - sign * 8 * (1 - t * 0.7), qy - 7 * (1 - t * 0.7));
      g.lineTo(qx - sign * (8 + 14) * (1 - t * 0.7), qy + 4 * (1 - t * 0.7));
      g.stroke();
    }
  }

  // stem + bowsprit
  g.strokeStyle = 'rgba(30,21,12,0.95)';
  g.lineWidth = 3.4;
  g.beginPath();
  g.moveTo(BOWX - 7, BOWY + 12);
  g.lineTo(BOWX, BOWY - 4);
  g.lineTo(BOWX + 7, BOWY + 12);
  g.stroke();
  g.lineWidth = 2.4;
  g.beginPath();
  g.moveTo(BOWX - 4.5, BOWY - 2);
  g.lineTo(BOWX - 1.6, 436);
  g.moveTo(BOWX + 4.5, BOWY - 2);
  g.lineTo(BOWX + 1.6, 436);
  g.stroke();
  g.lineWidth = 1.4;
  for (let y = BOWY - 12; y > 444; y -= 13) {
    const wHalf = 4.5 - (BOWY - 2 - y) / (BOWY - 2 - 436) * 2.9;
    g.beginPath();
    g.moveTo(BOWX - wHalf - 1, y);
    g.lineTo(BOWX + wHalf + 1, y - 2);
    g.stroke();
  }

  // forestays
  g.strokeStyle = 'rgba(30,21,12,0.85)';
  g.lineWidth = 2.1;
  g.beginPath(); g.moveTo(BOWX - 1, 438); g.quadraticCurveTo(660, 210, 598, -12); g.stroke();
  g.beginPath(); g.moveTo(BOWX + 1, 438); g.quadraticCurveTo(786, 210, 846, -12); g.stroke();

  // shrouds: three heavy lines per side, feet ON the rail, ratlines between
  for (const sign of [-1, 1]) {
    const feetT = [0.30, 0.40, 0.51];
    const topsX = [40, 118, 200];
    const F = [];
    g.strokeStyle = 'rgba(30,21,12,0.85)';
    for (let k = 0; k < 3; k++) {
      const [fx, fy] = railPoint(sign, feetT[k]);
      const topAbs = sign < 0 ? topsX[k] : W - topsX[k];
      const ctlX = topAbs - sign * 30;      // slight inboard sag
      g.lineWidth = 2.4 - k * 0.3;
      g.beginPath();
      g.moveTo(topAbs, -16);
      g.quadraticCurveTo(ctlX, 330, fx, fy - 4);
      g.stroke();
      F.push({ top: topAbs, ctlX, fx, fy });
      // chainplate
      g.fillStyle = 'rgba(30,21,12,0.9)';
      g.fillRect(fx - 3, fy - 6, 6, 10);
    }
    // ratlines: rungs connecting the three shrouds at equal parameter
    g.lineWidth = 0.95;
    g.strokeStyle = 'rgba(30,21,12,0.5)';
    for (let t = 0.34; t < 0.87; t += 0.058) {
      g.beginPath();
      let firstPt = true;
      for (const p of F) {
        const qx = (1 - t) * (1 - t) * p.top + 2 * (1 - t) * t * p.ctlX + t * t * p.fx;
        const qy = (1 - t) * (1 - t) * (-16) + 2 * (1 - t) * t * 330 + t * t * (p.fy - 4);
        if (firstPt) { g.moveTo(qx, qy + (rnd() - 0.5) * 2); firstPt = false; }
        else g.lineTo(qx, qy + (rnd() - 0.5) * 2);
      }
      g.stroke();
    }
  }

  // coiled ropes
  function coil(cx, cy, r0) {
    g.strokeStyle = 'rgba(38,27,15,0.78)';
    g.lineWidth = 2.6;
    g.beginPath();
    for (let a = 0; a < TAU * 3.4; a += 0.12) {
      const r = 4 + a / (TAU * 3.4) * r0;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.44;
      if (a === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  }
  coil(392, 806, 30);
  coil(1052, 818, 26);

  // helm pedestal
  g.fillStyle = 'rgba(222,199,152,0.7)';
  g.fillRect(682, 776, 76, 128);
  g.strokeStyle = 'rgba(30,21,12,0.9)';
  g.lineWidth = 2.6;
  g.strokeRect(682, 776, 76, 128);
  g.lineWidth = 1.1;
  g.strokeStyle = 'rgba(30,21,12,0.5)';
  for (let y = 786; y < 900; y += 9) {
    g.beginPath();
    g.moveTo(684, y);
    g.quadraticCurveTo(720, y + (rnd() - 0.5) * 4, 756, y);
    g.stroke();
  }
  g.lineWidth = 2.2;
  g.strokeStyle = 'rgba(30,21,12,0.85)';
  g.beginPath(); g.moveTo(676, 780); g.lineTo(764, 780); g.stroke();

  bake.deck = c;
}

/* --- the wheel --- */
function bakeWheel() {
  const SZ = 470, C = SZ / 2;
  const [c, g] = mkCanvas(SZ, SZ);
  g.lineCap = 'round';
  const ink = 'rgba(24,16,9,0.95)';
  g.strokeStyle = ink;
  // rim: heavy outer, hatched barrel between the two rings
  g.lineWidth = 11;
  g.beginPath(); g.arc(C, C, 167, 0, TAU); g.stroke();
  g.lineWidth = 4.4;
  g.beginPath(); g.arc(C, C, 146, 0, TAU); g.stroke();
  // rim hatching
  g.lineWidth = 1.5;
  g.globalAlpha = 0.65;
  for (let a = 0; a < TAU; a += TAU / 88) {
    g.beginPath();
    g.moveTo(C + Math.cos(a) * 150, C + Math.sin(a) * 150);
    g.lineTo(C + Math.cos(a + 0.02) * 163, C + Math.sin(a + 0.02) * 163);
    g.stroke();
  }
  g.globalAlpha = 1;
  // spokes + handles
  for (let k = 0; k < 8; k++) {
    const a = k * TAU / 8;
    const ca = Math.cos(a), sa = Math.sin(a);
    g.lineWidth = 9;
    g.beginPath();
    g.moveTo(C + ca * 36, C + sa * 36);
    g.lineTo(C + ca * 146, C + sa * 146);
    g.stroke();
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(C + ca * 42 + sa * 4.2, C + sa * 42 - ca * 4.2);
    g.lineTo(C + ca * 140 + sa * 2.6, C + sa * 140 - ca * 2.6);
    g.stroke();
    // handle
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(C + ca * 173, C + sa * 173);
    g.lineTo(C + ca * 209, C + sa * 209);
    g.stroke();
    g.lineWidth = 2.4;
    g.beginPath();
    g.ellipse(C + ca * 216, C + sa * 216, 8.5, 6.2, a, 0, TAU);
    g.stroke();
    g.lineWidth = 2.2;
    for (const rr of [181, 191]) {
      g.beginPath();
      g.moveTo(C + ca * rr + sa * 6, C + sa * rr - ca * 6);
      g.lineTo(C + ca * rr - sa * 6, C + sa * rr + ca * 6);
      g.stroke();
    }
  }
  // kingspoke: unmistakable. Solid dark handle, wide turk's heads, rim pointer
  {
    const a = 6 * TAU / 8; // pointing up when centered
    const ca = Math.cos(a), sa = Math.sin(a);
    g.lineWidth = 13;
    g.beginPath();
    g.moveTo(C + ca * 171, C + sa * 171);
    g.lineTo(C + ca * 211, C + sa * 211);
    g.stroke();
    g.fillStyle = ink;
    g.beginPath();
    g.ellipse(C + ca * 219, C + sa * 219, 10.5, 8, a, 0, TAU);
    g.fill();
    g.lineWidth = 3.4;
    for (const rr of [178, 188, 198]) {
      g.beginPath();
      g.moveTo(C + ca * rr + sa * 11, C + sa * rr - ca * 11);
      g.lineTo(C + ca * rr - sa * 11, C + sa * rr + ca * 11);
      g.stroke();
    }
    // solid diamond pointer just inside the rim
    const dx = C + ca * 128, dyy = C + sa * 128;
    g.beginPath();
    g.moveTo(dx + ca * 14, dyy + sa * 14);
    g.lineTo(dx + sa * 9, dyy - ca * 9);
    g.lineTo(dx - ca * 14, dyy - sa * 14);
    g.lineTo(dx - sa * 9, dyy + ca * 9);
    g.closePath();
    g.fill();
    // inlay line along the kingspoke
    g.lineWidth = 3.2;
    g.beginPath();
    g.moveTo(C + ca * 44, C + sa * 44);
    g.lineTo(C + ca * 143, C + sa * 143);
    g.stroke();
  }
  // hub
  g.lineWidth = 6;
  g.beginPath(); g.arc(C, C, 34, 0, TAU); g.stroke();
  g.lineWidth = 2.6;
  g.beginPath(); g.arc(C, C, 21, 0, TAU); g.stroke();
  g.fillStyle = ink;
  g.beginPath(); g.arc(C, C, 8.5, 0, TAU); g.fill();
  for (let k = 0; k < 6; k++) {
    const a = k * TAU / 6 + 0.3;
    g.beginPath();
    g.arc(C + Math.cos(a) * 28, C + Math.sin(a) * 28, 2.3, 0, TAU);
    g.fill();
  }
  bake.wheel = c;
}

/* --- island form: the derived coast, one page at a time ---------------------
   Every constant below is centred on the values the GATE-0 plate was judged at,
   and varied per island by a stream seeded from its own slug. The Document
   Service island keeps the centre of every range, so the judged frames stand.
   No two coasts repeat: the feature list is the page's own heading skyline and
   the knobs below are a function of the slug. */
const CLASSIC = '/cms/api/document-service';
function formOf(isle) {
  if (isle.form) return isle.form;
  const cls = isle.slug === CLASSIC;
  const k = rngFor('form:' + isle.slug);
  const v = (mid, spread) => cls ? mid : mid + (k() * 2 - 1) * spread;

  const knob = {
    ridge: v(11, 3.2),
    ridgeAmp: v(3, 1.6),
    ridgeFreq: v(0.020, 0.008),
    ridgePh: cls ? 1.7 : k() * TAU,
    taperL: v(60, 22),
    taperR: v(60, 22),
    flank: cls ? 1 : (k() < 0.68 ? 1 : -1),
    cragK: v(1, 0.42),
    bays: cls ? 0 : Math.floor(k() * 3.4),
    skew: v(0.31, 0.09),
    gapK: v(0.62, 0.10),
    sigmaK: v(0.30, 0.055),
    majorH: v(1, 0.28),
    minorH: v(1, 0.32),
    stip: v(1, 0.35),
    rowK: v(1, 0.18)
  };

  /* the heading skyline: one broad headland per h2, one knoll per h3 */
  let feats = isle.headings.map(h => {
    const hh = [...h.text].reduce((a, ch) => (a * 33 + ch.charCodeAt(0)) % 997, 7) / 997;
    return h.level === 2
      ? { major: true, w: 150 + hh * 55, hgt: (74 + hh * 30) * knob.majorH, hash: hh, text: h.text }
      : { major: false, w: 54 + hh * 24, hgt: (20 + hh * 18) * knob.minorH, hash: hh, text: h.text };
  });
  if (!feats.length) {
    /* a page with no sections is still land: one low dome, its height from words */
    const hh = (hash32(isle.slug) % 997) / 997;
    feats = [{ major: true, w: 150 + hh * 55, hgt: (34 + 26 * Math.min(1, isle.words / 1200)) * knob.majorH, hash: hh, text: isle.title, lone: true }];
  }

  const SPH = 230, BASE = SPH - 16;
  /* the sprite is as long as the coast has sections: a 78-section page is a long
     low shore, a two-section page a compact one. This is resolution and aspect,
     never screen size, which comes from the word count. */
  const SPW = clamp(Math.round(260 + (640 / 14) * feats.length), 300, 1300);
  const rawW = feats.reduce((s, f) => s + f.w * knob.gapK, 0) + 90;
  const sc = (SPW - 70) / rawW;
  let cx = 40;
  for (const f of feats) {
    f.cx = cx + f.w * knob.skew * sc;
    cx += f.w * knob.gapK * sc;
  }
  const x0 = 24, x1 = cx + 40;

  /* coves: a few real notches in the base line, so no two feet are alike */
  const bays = [];
  for (let i = 0; i < knob.bays; i++) {
    bays.push({ cx: x0 + (0.18 + 0.64 * k()) * (x1 - x0), w: 18 + k() * 40, d: 4 + k() * 7 });
  }

  function elev(x) {
    if (x < x0 || x > x1) return 0;
    const taper = Math.min(1, (x - x0) / knob.taperL) * Math.min(1, (x1 - x) / knob.taperR);
    let e = knob.ridge + Math.sin(x * knob.ridgeFreq + knob.ridgePh) * knob.ridgeAmp;
    for (const f of feats) {
      const s = f.w * sc * knob.sigmaK;
      const d = (x - f.cx) / s;
      e += f.hgt * Math.exp(-d * d);
    }
    for (const b of bays) {
      const d = (x - b.cx) / b.w;
      e -= b.d * Math.exp(-d * d);
    }
    return Math.max(0, e * taper);
  }

  isle.form = { knob, feats, sc, x0, x1, SPW, SPH, BASE, elev, bays, cls };
  return isle.form;
}

/* --- island LODs: a coastal mass from the real heading skyline ---
   Baked on demand and kept in a small cache: at any moment only a handful of
   the 290 are inside the horizon, and only the nearest few are above a smudge. */
const spriteCache = new Map();
const SPRITE_BUDGET_PX = 26e6;     // about 100 MB of RGBA, LRU
let spriteBytes = 0;
let bakeBudget = 0;

function spriteKey(slug, lod) { return lod + '|' + slug; }

function getSprite(isle, lod, force) {
  const key = spriteKey(isle.slug, lod);
  let s = spriteCache.get(key);
  if (s) { spriteCache.delete(key); spriteCache.set(key, s); return s; }
  if (!force && bakeBudget <= 0) return null;
  bakeBudget--;
  s = bakeIsleLod(isle, lod);
  spriteCache.set(key, s);
  spriteBytes += s.px;
  while (spriteBytes > SPRITE_BUDGET_PX && spriteCache.size > 8) {
    const it = spriteCache.keys().next();
    const old = spriteCache.get(it.value);
    spriteCache.delete(it.value);
    spriteBytes -= old.px;
  }
  diag.spriteCache = spriteCache.size;
  diag.spriteMB = Math.round(spriteBytes * 4 / 1e5) / 10;
  return s;
}

function bakeIsleLod(isle, lod) {
  const F = formOf(isle);
  const rnd = rngFor((F.cls ? 'island' : 'isle:' + isle.slug) + (F.cls && lod === 0 ? '' : ':' + lod));
  const { feats, sc, x0, x1, SPW, SPH, BASE, knob } = F;
  const elev = F.elev;
  const skyY = x => BASE - elev(x);
  /* the smudge needs no more than a fifth of the resolution */
  const RES = lod === 0 ? 0.28 : lod === 1 ? 0.55 : 1;
  const [c, g] = mkCanvas(SPW * RES, SPH * RES);
  g.scale(RES, RES);

  function skylinePath(gg) {
    gg.beginPath();
    gg.moveTo(x0, BASE);
    for (let x = x0; x <= x1; x += 5) gg.lineTo(x, skyY(x));
    gg.lineTo(x1, BASE);
  }

  if (lod === 0) {
    /* the smudge on the horizon */
    g.save();
    /* Round 1 had one island in the whole sea and its smudge could afford to be
       a whisper. With coasts out to the horizon in every direction a whisper
       reads as haze, so the far plate carries a little more ink: same blurred
       burin, one step firmer, and a tone band along the waterline so a distant
       island has a foot to stand on. */
    g.filter = 'blur(' + (5 * RES).toFixed(2) + 'px)';
    g.strokeStyle = 'rgba(88,68,44,1)';
    g.lineWidth = 9;
    for (let yy = BASE + 2; yy > 30; yy -= 9) {
      g.globalAlpha = 0.95 * Math.pow(clamp((yy - 30) / (BASE - 30), 0, 1), 1.25);
      g.beginPath();
      let started = false;
      for (let xx = x0; xx < x1; xx += 16) {
        if (skyY(xx) < yy) {
          if (!started) { g.moveTo(xx, yy + (rnd() - 0.5) * 3); started = true; }
          else g.lineTo(xx, yy + (rnd() - 0.5) * 2.5);
        } else if (started) { g.stroke(); g.beginPath(); started = false; }
      }
      if (started) g.stroke();
    }
    /* the foot: where the land meets the water it is darkest */
    g.globalAlpha = 0.5;
    g.lineWidth = 5;
    g.beginPath();
    let on2 = false;
    for (let xx = x0 + 4; xx < x1 - 4; xx += 12) {
      if (elev(xx) > 6) {
        if (!on2) { g.moveTo(xx, BASE); on2 = true; } else g.lineTo(xx, BASE);
      } else if (on2) { g.stroke(); g.beginPath(); on2 = false; }
    }
    if (on2) g.stroke();
    g.restore();
    return { c, SPW, SPH, BASE, px: c.width * c.height };
  }

  if (lod === 1) {
    /* emerging profile: broken outline + faint interior tone rows */
    g.strokeStyle = 'rgba(80,60,40,0.6)';
    g.lineWidth = 1.6;
    let pen = false;
    g.beginPath();
    for (let x = x0; x <= x1; x += 5) {
      if (rnd() < 0.88) {
        if (!pen) { g.moveTo(x, skyY(x)); pen = true; }
        else g.lineTo(x, skyY(x));
      } else { pen = false; }
    }
    g.stroke();
    g.lineWidth = 1;
    g.globalAlpha = 0.3;
    for (let yy = BASE - 2; yy > 40; yy -= 8) {
      g.beginPath();
      let started = false;
      for (let xx = x0; xx < x1; xx += 7) {
        if (skyY(xx) < yy - 3) {
          if (!started) { g.moveTo(xx, yy); started = true; }
          else g.lineTo(xx, yy + (rnd() - 0.5) * 1.4);
        } else if (started) { g.stroke(); g.beginPath(); started = false; }
      }
      if (started) g.stroke();
    }
    g.globalAlpha = 1;
    return { c, SPW, SPH, BASE, px: c.width * c.height };
  }

  /* lod 2 / 3: the engraved coastal profile */
  const dense = lod === 3;
  g.lineCap = 'round';
  const ink = dense ? 'rgba(40,29,17,0.9)' : 'rgba(52,39,24,0.8)';
  g.strokeStyle = ink;
  g.lineWidth = dense ? 2.2 : 1.9;
  skylinePath(g);
  g.stroke();

  /* interior horizontal tone: the land has body */
  g.lineWidth = 0.9;
  g.globalAlpha = dense ? 0.4 : 0.3;
  const rowStep = (dense ? 4.4 : 6.5) * knob.rowK;
  for (let yy = BASE - 2; yy > 30; yy -= rowStep) {
    g.beginPath();
    let started = false;
    for (let xx = x0; xx < x1; xx += 6) {
      if (skyY(xx) < yy - 2 && rnd() < 0.93) {
        if (!started) { g.moveTo(xx, yy); started = true; }
        else g.lineTo(xx, yy + (rnd() - 0.5) * 1.2);
      } else if (started) { g.stroke(); g.beginPath(); started = false; }
    }
    if (started) g.stroke();
  }

  /* slope hatch on the shadowed flank */
  const fl = knob.flank;
  g.globalAlpha = dense ? 0.6 : 0.45;
  g.lineWidth = dense ? 1.0 : 1.1;
  const step = dense ? 3.0 : 4.6;
  for (let xx = x0 + 4; xx < x1 - 4; xx += step) {
    const yy = skyY(xx);
    if (yy >= BASE - 3) continue;
    const slope = (skyY(xx + 5) - skyY(xx - 5)) * fl;
    if (slope > 1.4) {
      const l = Math.min((BASE - yy) * (0.45 + rnd() * 0.25), 42);
      g.beginPath();
      g.moveTo(xx, yy + 2);
      g.lineTo(xx - fl * l * 0.25, yy + 2 + l);
      g.stroke();
    }
  }
  if (dense) {
    g.globalAlpha = 0.38;
    for (let xx = x0 + 4; xx < x1 - 4; xx += 4.4) {
      const yy = skyY(xx);
      if (yy >= BASE - 8) continue;
      const slope = (skyY(xx + 5) - skyY(xx - 5)) * fl;
      if (slope > 3) {
        const l = Math.min((BASE - yy) * 0.35, 24);
        g.beginPath();
        g.moveTo(xx - fl * 3, yy + 7);
        g.lineTo(xx + fl * l * 0.5, yy + 7 + l * 0.6);
        g.stroke();
      }
    }
  }
  /* crag ticks along the ridges */
  g.globalAlpha = dense ? 0.85 : 0.6;
  g.lineWidth = dense ? 1.25 : 1.05;
  for (const f of feats) {
    if (!f.major && !dense) continue;
    const nticks = Math.max(1, Math.round((f.major ? (dense ? 8 : 5) : 2) * knob.cragK));
    for (let t = 0; t < nticks; t++) {
      const tx = f.cx + (rnd() - 0.5) * f.w * sc * 0.4;
      const ty = skyY(tx);
      if (ty >= BASE - 6) continue;
      g.beginPath();
      g.moveTo(tx, ty + 1);
      g.lineTo(tx + (rnd() - 0.5) * 7, ty + 5 + rnd() * 6);
      g.stroke();
    }
  }
  /* foreshore lines + beach stipple */
  g.globalAlpha = 0.6;
  g.lineWidth = 1.1;
  for (let kk = 0; kk < (dense ? 4 : 2); kk++) {
    const yy = BASE + 1.5 + kk * 2.6;
    g.beginPath();
    let on = false;
    for (let xx = x0; xx < x1; xx += 8) {
      if (rnd() < 0.7) {
        if (!on) { g.moveTo(xx, yy); on = true; } else g.lineTo(xx, yy);
      } else if (on) { g.stroke(); g.beginPath(); on = false; }
    }
    if (on) g.stroke();
  }
  if (dense) {
    g.fillStyle = ink;
    g.globalAlpha = 0.5;
    const nstip = Math.round(300 * knob.stip);
    for (let i = 0; i < nstip; i++) {
      const xx = x0 + rnd() * (x1 - x0);
      const yy = skyY(xx);
      if (yy > BASE - 3) continue;
      if (rnd() < 0.45) g.fillRect(xx, BASE - 1 - rnd() * 4, 1.3, 1.3);
      else if (yy < BASE - 24 && rnd() < 0.4)
        g.fillRect(xx, yy + 9 + rnd() * (BASE - yy - 12), 1.3, 1.3);
    }
    g.globalAlpha = 0.6;
    g.lineWidth = 0.9;
    for (let i = 0; i < Math.round(60 * knob.stip); i++) {
      const xx = x0 + rnd() * (x1 - x0);
      const yy = BASE - 3 - rnd() * 10;
      if (skyY(xx) > yy - 3) continue;
      g.beginPath();
      g.moveTo(xx, yy);
      g.lineTo(xx - 1.6, yy - 3.4);
      g.moveTo(xx + 1.6, yy);
      g.lineTo(xx + 2.7, yy - 3.2);
      g.stroke();
    }
    /* Waghenaer letters over the h2 headlands: you count the sections of a page
       off its skyline before you can read a word of it */
    g.globalAlpha = 0.9;
    g.fillStyle = 'rgba(40,29,17,0.95)';
    g.font = '600 22px Georgia, serif';
    g.textAlign = 'center';
    let li = 0;
    for (const f of feats) {
      if (!f.major || f.lone) continue;
      if (li >= 26) break;
      g.fillText(String.fromCharCode(65 + li), f.cx, skyY(f.cx) - 14);
      li++;
    }
  }
  g.globalAlpha = 1;
  return { c, SPW, SPH, BASE, px: c.width * c.height };
}

/* --- composited grounds: paper + wash + engraved sky in one blit --- */
function bakeBases() {
  for (const kind of ['afternoon', 'dusk']) {
    const [c, g] = mkCanvas(W, H);
    g.drawImage(bake.paper, 0, 0, W, H);
    g.drawImage(kind === 'afternoon' ? bake.skyAfternoon : bake.skyDusk, 0, -8, W, HORIZON + 26);
    g.globalAlpha = kind === 'afternoon' ? 1 : 0.65;
    g.drawImage(bake.skyLines, 0, -4, W, HORIZON + 4);
    g.globalAlpha = 1;
    bake[kind === 'afternoon' ? 'baseAfternoon' : 'baseDusk'] = c;
  }
}

/* --- spyglass ring --- */
function bakeLensRing() {
  const SZ = 520, C = SZ / 2, R = 232;
  const [c, g] = mkCanvas(SZ, SZ);
  const grad = g.createRadialGradient(C, C, R - 52, C, C, R);
  grad.addColorStop(0, 'rgba(20,14,8,0)');
  grad.addColorStop(1, 'rgba(20,14,8,0.6)');
  g.fillStyle = grad;
  g.beginPath(); g.arc(C, C, R, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(22,15,9,0.95)';
  g.lineWidth = 11;
  g.beginPath(); g.arc(C, C, R - 5, 0, TAU); g.stroke();
  g.lineWidth = 3;
  g.beginPath(); g.arc(C, C, R - 15, 0, TAU); g.stroke();
  g.lineWidth = 1.4;
  g.strokeStyle = 'rgba(22,15,9,0.6)';
  g.beginPath(); g.arc(C, C, R - 21, 0, TAU); g.stroke();
  bake.lensRing = c;
}

/* ---------------- dynamic layers ---------------- */
const FOAM_N = 250;
const FOAM_BUCKETS = 20;
const foamPaperB = [], foamInkB = [];
for (let i = 0; i < FOAM_BUCKETS; i++) { foamPaperB.push([]); foamInkB.push([]); }
const foam = [];
function initFoam() {
  const rnd = rngFor('foam');
  for (let i = 0; i < FOAM_N; i++) {
    foam.push({ x: 0, y: 0, vx: 0, vy: 0, life: -rnd() * 2, max: 1, sz: 1, hull: false });
  }
}
const foamRnd = rngFor('foam-run');
function respawnFoam(p, knotsFrac) {
  if (foamRnd() < 0.4 && knotsFrac > 0.25) {
    // hull spray: born at the bow shoulders, streams aft and outboard
    p.hull = true;
    const sign = foamRnd() < 0.5 ? -1 : 1;
    const t = 0.75 + foamRnd() * 0.22;
    const [rx, ry] = railPoint(sign, t);
    p.x = rx + sign * (6 + foamRnd() * 16);
    p.y = ry + 10 + foamRnd() * 14;
    p.vx = sign * (26 + foamRnd() * 60) * knotsFrac;
    p.vy = (46 + foamRnd() * 90) * knotsFrac;
    p.max = 0.7 + foamRnd() * 0.9;
    p.sz = foamRnd() < 0.5 ? 1.6 : 2.4;
  } else {
    p.hull = false;
    const bi = 3 + Math.floor(foamRnd() * 5);
    const B = BANDS[Math.min(bi, BANDS.length - 1)];
    p.x = foamRnd() * W;
    p.y = B.y + 3 + foamRnd() * (B.h * 0.5);
    const near = (B.i - 2) / 5;
    p.vx = (p.x < W / 2 ? -1 : 1) * (2 + foamRnd() * 10) * near * (0.4 + knotsFrac);
    p.vy = (7 + foamRnd() * 24) * near * (0.25 + knotsFrac * 1.4);
    p.max = 0.9 + foamRnd() * 1.7;
    p.sz = foamRnd() < 0.6 ? 1.4 : 2.2;
  }
  p.life = p.max;
}

const STREAK_N = 14;
const streaks = [];
function initStreaks() {
  const rnd = rngFor('streaks');
  const laneY = [[64, 168], [208, 330], [430, 570]];
  for (let i = 0; i < STREAK_N; i++) {
    const lane = laneY[i % 3];
    streaks.push({
      x: rnd() * W,
      y: lane[0] + rnd() * (lane[1] - lane[0]),
      len: 150 + rnd() * 170,
      ph: rnd() * TAU,
      spd: 0.7 + rnd() * 0.6
    });
  }
}

/* ---------------- captions ---------------- */
const capEl = () => document.getElementById('caption');
let capTimer = null, capQueue = [];
function caption(text, holdMs) {
  capQueue.push([text, holdMs || 3600]);
  if (!capTimer) nextCaption();
}
function nextCaption() {
  const el = capEl();
  if (!capQueue.length) { el.classList.remove('shown'); capTimer = null; return; }
  const [text, hold] = capQueue.shift();
  el.textContent = text;
  el.classList.add('shown');
  capTimer = setTimeout(() => {
    el.classList.remove('shown');
    capTimer = setTimeout(nextCaption, 500);
  }, hold);
}
/* a new landfall is not the old one's news: the queue is cleared when the bow
   comes round onto a different shore */
function clearCaptions() {
  capQueue = [];
  if (capTimer) { clearTimeout(capTimer); capTimer = null; }
  const el = capEl();
  if (el) el.classList.remove('shown');
}
function captionNow(text, holdMs) {
  capQueue = [];
  if (capTimer) { clearTimeout(capTimer); capTimer = null; }
  const el = capEl();
  el.textContent = text;
  el.classList.add('shown');
  capTimer = setTimeout(() => {
    el.classList.remove('shown');
    capTimer = setTimeout(nextCaption, 500);
  }, holdMs || 3600);
}

/* ---------------- simulation ---------------- */
let lastT = 0;
let dirty = true;

function windAtShip() {
  const w = windAtUnits(ship.x, ship.y);
  const kn = clamp(Math.hypot(w.x, w.y) * world.windCal, 6, 24);
  const deg = norm360(Math.atan2(w.x, -w.y) * 180 / Math.PI);
  return { kn, deg, x: w.x, y: w.y };
}

function update(dt) {
  env.t += dt;
  const t = env.t;

  env.hourMix += clamp(env.hourTarget - env.hourMix, -dt / 2.4, dt / 2.4);

  if (!ship.wheelHeld && !REDUCED) {
    const rc = clamp(-ship.wheelAngle, -6 * dt, 6 * dt);
    ship.wheelAngle += rc;
  }

  const wind = windAtShip();
  const hb = ship.bearing * Math.PI / 180;
  const hx = Math.sin(hb), hy = -Math.cos(hb);   /* north is -y, as the sheet draws it */
  const wm = Math.hypot(wind.x, wind.y) || 1;
  const cosA = (hx * wind.x + hy * wind.y) / wm;
  const polar = 0.42 + 0.58 * Math.pow((cosA + 1) / 2, 1.35);
  const windFactor = 0.75 + 0.25 * (wind.kn / 16);
  if (!passage.on) {
    let targetKn = ship.anchored ? 0 : sailBase(ship.sail) * polar * windFactor;
    ship.knots += clamp(targetKn - ship.knots, -dt * 2.2, dt * 1.4);
    if (ship.knots < 0.01 && targetKn === 0) ship.knots = 0;
  }

  const eff = effectiveOrder(t);
  if (passage.on) {
    /* the passage cons her herself: helm and canvas answer to it alone */
  } else if (REDUCED) {
    ship.bearing = ship.orderedBearing;
    ship.omega = 0;
  } else {
    const err = angDiff(eff, ship.bearing);
    const speedFrac = clamp(ship.knots / 8.6, 0.12, 1);
    /* storm waters (stage 2, idea 3): the helm goes heavy with the sea the
       citations raise - bounded at a quarter, she always answers */
    const heavy = 1 - 0.24 * wx.helm;
    let alpha = (clamp(err * 0.55, -6.5, 6.5) - ship.omega * 1.15) * heavy;
    ship.omega += alpha * dt;
    const om = (2.6 + 7.2 * speedFrac) * (1 - 0.14 * wx.helm);
    ship.omega = clamp(ship.omega, -om, om);
    ship.bearing = norm360(ship.bearing + ship.omega * dt);
  }

  if (passage.on) {
    passageTick(dt);
  } else if (!REDUCED && !ship.anchored) {
    const nmPerSec = ship.knots * COMPRESSION / 3600;
    const u = nmPerSec * dt / world.nmPerUnit;
    ship.x += hx * u;
    ship.y += hy * u;
  }

  /* the sea in sight, and the island under the bow */
  const vis = pickVisible();

  /* The arrival is settled on the island she is STILL bound for, before any
     nearer shore can take the bow. A ship does not run at a coast under a press
     of canvas: inside half a mile she rounds to under reduced sail, and the
     anchor goes down when she has run in as far as she is going to - either
     into the roadstead itself or at the moment the shore begins to open astern.
     Without this she sails clean past the landfall she crossed for. */
  /* an anchor just weighed is not an anchor to let go again: until she has
     drawn clear of the roadstead she just left, that shore cannot take her */
  if (ship.clearOf && distToNm(ship.clearOf) > 0.72) ship.clearOf = null;
  if (!passage.on && !ship.anchored && ship.bound && ship.bound !== ship.clearOf) {
    const d0 = distToNm(ship.bound);
    if (d0 < 0.55 && (ship.sail === 'full' || ship.sail === 'travel')) {
      setSail('half', true);
      captionNow('Hands aloft, the canvas comes in.', 2600);
    }
    /* "she has run in as far as she is going to" is measured against the whole
       approach, not against the last frame: near the point of closest approach
       the range changes by a few ten-thousandths of a mile per frame, which no
       frame-to-frame test can see. */
    if (story.minDist == null || d0 < story.minDist) story.minDist = d0;
    const opening = d0 > story.minDist + 0.012;
    /* and the plainest sign of all: the shore has come abeam and she is still
       not closing. That is the end of an approach, wherever the range stands. */
    const abeam = Math.abs(angDiff(bearingTo(ship.bound), ship.bearing)) > 95;
    diag.arrival = { d0: +d0.toFixed(4), min: story.minDist == null ? null : +story.minDist.toFixed(4),
      opening, abeam, locked: ship.boundLock, bound: ship.bound.slug };
    if (d0 <= 0.25 || (d0 < 0.62 && (opening || abeam))) dropAnchor(ship.bound);
    story.lastDist = d0;
  } else if (ship.anchored) {
    story.lastDist = null; story.minDist = null;
  }

  const bound = pickBound(vis);
  if (bound !== ship.bound) setBound(bound, ship.boundLock);
  for (const V of vis) if (V.isle === ship.bound) V.bound = true;
  const dist = distToIslandNm();
  const isle = ship.bound;

  /* warm the coast ahead: at most a couple of plates cut per frame, so a
     landfall never arrives on an unengraved shore */
  bakeBudget = diag.frameMs && diag.frameMs > 15 ? 1 : 3;
  if (isle) {
    const want = islandStage(dist);
    getSprite(isle, want, false);
    if (want < 3 && dist < 3.2) getSprite(isle, want + 1, false);
  }

  if (!story.started && t > 1) {
    story.started = true;
    if (story.maiden) {
      caption('Her maiden call: the Quick Start Guide first, as every new hand raises her first.', 4800);
      caption('The pennant flies on that shore. The wind stands fair, down the citation flow.', 4200);
    } else {
      caption('Out of Quick Start roads, bound for the Document Service shore.', 4200);
      caption('The wind stands fair, down the citation flow.', 3800);
    }
  }
  if (!story.leadsman1 && dist < 1.35) {
    story.leadsman1 = true;
    s2Sounding(isle.words);
    caption('The leadsman heaves the lead…', 2400);
    caption('"By the deep, ' + numToWords(isle.words) + '!"', 4600);
  }
  if (!story.leadsman2 && dist < 0.6) {
    story.leadsman2 = true;
    s2Sounding(isle.words);
    caption('"By the deep, ' + numToWords(isle.words) +
      (isle.nH2 ? '. ' + numToWords(isle.nH2) + (isle.nH2 === 1 ? ' headland' : ' headlands') + ' plain on the bow."'
                : '. No headland: she is all one shore."'), 4800);
    if (isle.inbound === 0) {
      caption('A dark shore. No citation leads here: hers is a first lamp to hang.', 5200);
    } else {
      caption(isle.inbound + (isle.inbound === 1 ? ' riding light' : ' riding lights') +
        ' come up along the shore, one for every page that cites her.', 5200);
    }
  }


  const knotsFrac = clamp(ship.knots / 8.6, 0, 1);
  for (const B of BANDS) {
    B.scroll = (B.scroll + (-ship.omega * PXDEG) * dt + B.drift * 0.18 * dt + STRIPW * 4) % STRIPW;
  }
  env.boilIdx = Math.floor(t / 0.16);

  if (!REDUCED) {
    for (const p of foam) {
      p.life -= dt;
      if (p.life <= 0) {
        if (foamRnd() < 0.05 + knotsFrac * 0.6 + 0.22 * wx.seaVis) respawnFoam(p, knotsFrac);
        else p.life = -foamRnd() * 0.5;
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  eggTick(dt);
  wxTick(dt);
  bottleTick(dt);
  fhTick();
  catTick(dt);

  diag.bearing = Math.round(ship.bearing * 10) / 10;
  diag.orderedBearing = Math.round(ship.orderedBearing * 10) / 10;
  diag.sailState = ship.sail;
  diag.knots = Math.round(ship.knots * 100) / 100;
  diag.windDeg = Math.round(wind.deg * 10) / 10;
  diag.windKn = Math.round(wind.kn * 10) / 10;
  diag.polarFactor = Math.round(polar * 1000) / 1000;
  diag.distNm = Math.round(dist * 1000) / 1000;
  diag.spyglass = lens.raised;
  diag.lensX = Math.round(lens.x * 10) / 10;
  diag.lensY = Math.round(lens.y * 10) / 10;
  diag.lensAimX = Math.round(lens.ax * 10) / 10;
  diag.lensAimY = Math.round(lens.ay * 10) / 10;
  diag.hour = env.hourMix > 0.5 ? 'dusk' : 'afternoon';
  diag.anchored = ship.anchored;
  diag.bound = isle ? isle.slug : null;
  diag.inSight = vis.length;

  return { wind, cosA, knotsFrac, dist, vis };
}

/* ---------------- render ---------------- */
const cv = document.getElementById('sea');
cv.width = Math.ceil(W * SCALE);
cv.height = Math.ceil(H * SCALE);
const ctx = cv.getContext('2d', { alpha: false });

function islandScreenW(dist, mag) {
  return clamp(340 * (mag == null ? 1 : mag) / Math.max(dist, 0.16), 8, 1400);
}
function islandStage(dist) {
  return dist > 2.2 ? 0 : dist > 1.4 ? 1 : dist > 0.55 ? 2 : 3;
}

/* The riding lights: one light on the shore for every page that cites this one.
   An island nothing cites shows a dark shore, and the log carries the standing
   order to hang the first lamp on it. Lanterns burn only where the raw log
   records a night edit: twelve islands in the whole sea, Docker with four. */
function shoreMarks(isle) {
  if (isle.marks) return isle.marks;
  const F = formOf(isle);
  const rnd = rngFor('lights:' + isle.slug);
  const lights = [];
  for (let i = 0; i < isle.inbound; i++) {
    const t = (i + 0.5) / isle.inbound;
    const jx = F.x0 + 10 + (t + (rnd() - 0.5) * 0.06) * (F.x1 - F.x0 - 20);
    lights.push({ x: clamp(jx, F.x0 + 6, F.x1 - 6), dy: 1 + rnd() * 5 });
  }
  const lanterns = [];
  const majors = F.feats.filter(f => f.major);
  for (let i = 0; i < isle.night; i++) {
    const f = majors.length ? majors[i % majors.length] : null;
    const lx = f ? f.cx + (rnd() - 0.5) * 30 : F.x0 + rnd() * (F.x1 - F.x0);
    lanterns.push({ x: lx, y: F.BASE - F.elev(lx) - 6 - rnd() * 8 });
  }
  isle.marks = { lights, lanterns };
  return isle.marks;
}

function drawShoreLights(isle, cxScreen, yBase, wpx, s, dist, stage) {
  if (stage < 2) return;
  const F = formOf(isle);
  const M = shoreMarks(isle);
  const mix = env.hourMix;
  const left = cxScreen - wpx / 2;
  const px = x => left + x * s;
  const a = clamp((1.9 - dist) / 0.7, 0, 1);
  if (M.lights.length) {
    const r = clamp(1.5 * s * 40, 1.1, 2.6);
    ctx.globalAlpha = a * (0.55 + 0.4 * mix);
    ctx.fillStyle = mix > 0.5 ? 'rgba(246,214,140,0.98)' : 'rgba(74,54,32,0.9)';
    ctx.beginPath();
    for (const L of M.lights) {
      const x = px(L.x), y = yBase - F.BASE * s + (F.BASE + L.dy) * s;
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, TAU);
    }
    ctx.fill();
    if (mix > 0.35) {
      ctx.globalAlpha = a * mix * 0.30;
      ctx.beginPath();
      for (const L of M.lights) {
        const x = px(L.x), y = yBase - F.BASE * s + (F.BASE + L.dy) * s;
        ctx.moveTo(x + r * 3.2, y);
        ctx.arc(x, y, r * 3.2, 0, TAU);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  if (M.lanterns.length && mix > 0.2) {
    const t = env.t;
    for (let i = 0; i < M.lanterns.length; i++) {
      const L = M.lanterns[i];
      const x = px(L.x), y = yBase - F.BASE * s + L.y * s;
      const flick = 0.78 + 0.22 * Math.sin(t * (5.1 + i) + i * 2.1);
      const r = clamp(2.4 * s * 40, 1.6, 4.2);
      ctx.globalAlpha = a * mix * flick;
      ctx.fillStyle = 'rgba(252,226,158,1)';
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      ctx.globalAlpha = a * mix * 0.22 * flick;
      ctx.beginPath(); ctx.arc(x, y, r * 4, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

/* draw the world beyond the ship (sky, clouds, island, horizon, bands).
   Used at scale 1 for the main view and magnified inside the lens. */
function drawWorld(sim, worldDY, opts) {
  /* the clickable marks are re-gathered each main pass (never the lens pass) */
  if (eggs.ready && !(opts && opts.map)) eggs.hits.length = 0;
  const t = env.t;
  const knotsFrac = sim.knotsFrac;
  const mix = env.hourMix;
  const stageBoost = opts && opts.stageBoost || 0;
  const maxBand = opts && opts.maxBand != null ? opts.maxBand : BANDS.length - 1;
  const fine = opts && opts.fine;

  /* ground: paper + wash + engraved sky tone, one blit per hour.
     Both grounds are opaque, so at a settled hour one blit is enough: crossfading
     costs a second full-frame blit only while the watch is actually changing. */
  if (mix < 0.999) ctx.drawImage(bake.baseAfternoon, 0, 0, W, H);
  if (mix > 0.001) {
    if (mix < 0.999) ctx.globalAlpha = mix;
    ctx.drawImage(bake.baseDusk, 0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  /* clouds */
  const cloudDrift = REDUCED ? 0 : t * 3.5;
  for (let i = 0; i < 3; i++) {
    const spr = bake.clouds[i];
    const cx = ((i * 520 + 120 + cloudDrift * (0.5 + i * 0.25)) % (W + 620)) - 480;
    const cy = 40 + i * 72 + Math.sin(t * 0.1 + i) * 3 * (REDUCED ? 0 : 1);
    ctx.globalAlpha = 0.8 - mix * 0.3;
    ctx.drawImage(spr, cx, cy + worldDY * 0.7, 480, 200);
  }
  ctx.globalAlpha = 1;

  /* the islands in sight, far to near */
  const yBase = HORIZON + worldDY + 6;
  const vis = sim.vis || [];
  for (let vi = 0; vi < vis.length; vi++) {
    const V = vis[vi];
    const isle = V.isle;
    const dist = V.dist;
    const x = W / 2 + V.az * PXDEG;
    const wpx = islandScreenW(dist, isle.mag);
    const stage = Math.min(3, islandStage(dist) + stageBoost);
    const spr = getSprite(isle, stage, V.bound);
    if (!spr) continue;
    const s = wpx / spr.SPW;
    const hpx = spr.SPH * s;
    const th = [2.2, 1.4, 0.55];
    let fade = 1;
    if (stage < 3 && stage - stageBoost >= 0 && stage - stageBoost < 3) {
      const d0 = th[stage - stageBoost];
      fade = clamp((d0 - dist) / 0.25, 0, 1);
    }
    /* haze. Inside 2.9 nm this is the round-1 curve unchanged, so the judged
       frames stand; beyond it the coast keeps fading rather than snapping to a
       floor, because there are now islands out to the horizon. */
    ctx.globalAlpha = dist <= 2.9
      ? clamp(0.5 + (2.9 - dist) * 0.5, 0.5, 1)
      : lerp(0.5, 0.34, clamp((dist - 2.9) / 3.5, 0, 1));
    ctx.drawImage(spr.c, x - wpx / 2, yBase - spr.BASE * s, wpx, hpx);
    if (fade < 1 && stage > 0) {
      const prev = getSprite(isle, stage - 1, false);
      if (prev) {
        ctx.globalAlpha *= (1 - fade) * 0.5;
        ctx.drawImage(prev.c, x - wpx / 2, yBase - spr.BASE * s, wpx, hpx);
      }
    }
    ctx.globalAlpha = 1;
    drawLighthouses(isle, x, yBase, wpx, s, dist, stage);
    if (dist < 1.9) drawShoreLights(isle, x, yBase, wpx, s, dist, stage);
  }

  /* crossing (a): the nameless city stands with the coasts, before the horizon line */
  if (eggs.ready) drawCityEgg(sim, worldDY, !!(opts && opts.map));

  /* horizon: broken breathing line, irregular gaps (no periodic dash) */
  ctx.strokeStyle = 'rgba(70,53,35,0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const d of HORIZON_DASH) {
    const y = HORIZON + worldDY + Math.sin(d.x * 0.012 + t * 0.4 * (REDUCED ? 0 : 1)) * 1.3;
    ctx.moveTo(d.x, y);
    ctx.lineTo(d.x + d.len, y);
  }
  ctx.stroke();

  /* the rolling hatched sea */
  drawBands(sim, worldDY, maxBand, fine, opts && opts.map);

  /* the marks afloat on it, and the dusk stars: crossings (b), (d), (f) */
  if (eggs.ready) drawEggs(sim, worldDY, opts && opts.map);
}

/* The sea bands.

   The swell is a travelling vertical displacement dy(x, t). Blitting it as a row of
   independently offset rectangles is what produced the slice-grid mottling: every
   slice edge was a step in dy, so the hatching broke on a fixed 32/64 px lattice and
   the same lattice bled through the semi-transparent deck.

   Here each slice is drawn under a pure vertical SHEAR whose slope is the local slope
   of dy, so a slice's left edge lands exactly where its neighbour's right edge lands:
   the reconstruction is C0-continuous and no lattice survives. A shear leaves vertical
   lines vertical, so slice edges stay axis-aligned on integer screen x and pick up no
   antialiasing hairline either - which is what kills the seams inside the spyglass,
   where the magnified edges used to fall on fractional pixels.

   Slice width is then free: it is chosen from a sag budget on the piecewise-linear
   swell rather than from a fixed lattice, which also cuts the draw count by two-thirds. */
let SLICE_DBG = 0;   // test hook: force a slice width, to prove no lattice survives
function drawBands(sim, worldDY, maxBand, fine, map) {
  const t = env.t;
  const knotsFrac = sim.knotsFrac;
  const k = map ? map.k : 1;
  const ox = map ? map.ox : 0;
  const oy = map ? map.oy : 0;
  const tempo = 0.55 + 0.95 * knotsFrac;

  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  for (let bi = 0; bi <= maxBand; bi++) {
    const B = BANDS[bi];
    const strip = B.strips[REDUCED ? 0 : (env.boilIdx + B.i) % 3];
    const phase = B.phase0 + (REDUCED ? 0 : t * B.omega * tempo);
    const hLog = B.h + 10;
    const kx = TAU / B.lambda;
    const nearF = B.i / (BANDS.length - 1);
    const bandY = B.y + worldDY * (0.55 + nearF * 0.85);
    const ampl = B.amp * (0.8 + knotsFrac * 0.45) * (REDUCED ? 0.6 : 1);
    const dyAt = x => bandY + ampl * Math.sin(kx * x + phase);

    /* inside the glass, a band wholly above or below the lens costs nothing */
    if (map && map.y0 != null) {
      const yTop = oy + k * (bandY - ampl - 2);
      const yBot = oy + k * (bandY + hLog + ampl + 2);
      if (yBot < map.y0 || yTop > map.y1) continue;
    }

    // slice width from the sag budget: ampl*(1-cos(pi*sw/lambda))*k <= SAG_PX
    const u = Math.acos(clamp(1 - SAG_PX / Math.max(ampl * k, 0.2), -1, 1));
    const swLog = SLICE_DBG || clamp(u * B.lambda / Math.PI, 36, MAXSLICE) * (fine ? 0.6 : 1);
    const sws = Math.max(8, Math.round(swLog * k));   // screen px, integer
    const dh = k * hLog;                              // screen px
    // only the span the caller can show: inside the spyglass that is the glass, not
    // the whole plate, which spares two thirds of the lens band blits
    const xStart = map && map.x0 != null ? Math.max(0, Math.floor(map.x0 / sws) * sws) : 0;
    const xEnd = map && map.x1 != null ? Math.min(W, Math.ceil(map.x1)) : W;

    for (let sxs = xStart; sxs < xEnd; sxs += sws) {
      const wS = Math.min(sws, xEnd - sxs);
      const xL = (sxs - ox) / k;
      const xR = (sxs + wS - ox) / k;
      const yL = dyAt(xL), yR = dyAt(xR);
      const slope = (yR - yL) / (xR - xL);
      // the source column is snapped to a whole device pixel. Every slice of a band
      // shares the same fractional part, so this shifts the band as a whole by at most
      // half a pixel and never opens a step between neighbours, while sparing the
      // sampler a horizontal interpolation nobody can see
      let srcX = (Math.round((xL + B.scroll) * SCALE) / SCALE) % STRIPW;
      if (srcX < 0) srcX += STRIPW;
      // pure vertical shear: x is untouched, y gains slope*(x - sxs)
      ctx.setTransform(SCALE, SCALE * slope, 0, SCALE, 0, -SCALE * slope * sxs);
      ctx.drawImage(strip,
        srcX * SCALE, 0, (xR - xL) * SCALE, hLog * SCALE,
        sxs, oy + k * yL, wS, dh);
    }
  }
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
}

function render(sim) {
  const t = env.t;
  const knotsFrac = sim.knotsFrac;
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);

  const swell = (REDUCED ? 0 : 1) * (1 + 0.35 * wx.seaVis);
  const roll = swell * (1.35 * Math.sin(t * 0.62) + 0.55 * Math.sin(t * 1.13 + 1.2)) +
    clamp(ship.omega * ship.knots * 0.045, -3.5, 3.5);
  const heave = swell * (5.5 * Math.sin(t * 0.83 + 0.7) + 2.2 * Math.sin(t * 1.31));
  const pitch = swell * (3.2 * Math.sin(t * 0.71 + 2.1)) * (0.6 + knotsFrac * 0.6);
  const worldDY = -pitch;

  /* the world (draws its own paper + wash ground) */
  drawWorld(sim, worldDY, null);
  diag.lod = islandStage(sim.dist);
  if (story.maiden && story.qs && ui.mode === 'deck') drawMaidenPennant(worldDY);
  if (passage.on && !REDUCED) drawPassageSweep();

  /* foam stipple: same blobs and specks, gathered into a few paths.
     Drawn one rect at a time this was a thousand draw calls a frame; bucketed by
     alpha it is twenty, and the only difference on the plate is that a blob's
     opacity is quantised to a twentieth. */
  if (!REDUCED) {
    for (let b = 0; b < FOAM_BUCKETS; b++) { foamPaperB[b].length = 0; foamInkB[b].length = 0; }
    for (const p of foam) {
      if (p.life <= 0) continue;
      const a = clamp(p.life / p.max, 0, 1) * 0.95;
      const sz = p.sz * (p.hull ? 1.5 : 1.25);
      const bi = clamp(Math.floor(a * FOAM_BUCKETS), 0, FOAM_BUCKETS - 1);
      const pb = foamPaperB[bi];
      pb.push(p.x - sz * 0.5, p.y, sz * 2, sz);
      const ib = foamInkB[bi];
      ib.push(p.x - sz * 0.5 - 1.4, p.y + sz * 0.6,
              p.x + sz * 1.6, p.y - 0.6,
              p.x + sz * 0.5, p.y + sz + 0.4);
    }
    ctx.fillStyle = PAPER;
    for (let b = 0; b < FOAM_BUCKETS; b++) {
      const r = foamPaperB[b];
      if (!r.length) continue;
      ctx.globalAlpha = (b + 0.5) / FOAM_BUCKETS;
      ctx.beginPath();
      for (let i = 0; i < r.length; i += 4) ctx.rect(r[i], r[i + 1], r[i + 2], r[i + 3]);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(58,44,28,1)';
    for (let b = 0; b < FOAM_BUCKETS; b++) {
      const r = foamInkB[b];
      if (!r.length) continue;
      ctx.globalAlpha = (b + 0.5) / FOAM_BUCKETS * 0.75;
      ctx.beginPath();
      for (let i = 0; i < r.length; i += 2) ctx.rect(r[i], r[i + 1], 1.2, 1.2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* wake streaks along the hull */
  if (knotsFrac > 0.1 && !REDUCED) {
    ctx.strokeStyle = 'rgba(241,231,208,0.8)';
    ctx.lineWidth = 2.4;
    for (const sign of [-1, 1]) {
      for (let k = 0; k < 5; k++) {
        const tt = ((t * (0.55 + knotsFrac) * 0.5 + k * 0.2) % 1);
        const rt = 1 - tt * 0.8;
        const [rx, ry] = railPoint(sign, rt);
        const x0 = rx + sign * (10 + tt * 40);
        const y0 = ry + 14 + tt * 26;
        const l = 14 + tt * 52 * knotsFrac;
        ctx.globalAlpha = (1 - tt) * 0.75 * knotsFrac;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(x0 + sign * l * 0.5, y0 + 4, x0 + sign * l, y0 + 9);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  drawBottles(sim, worldDY);

  /* dusk veil over the water */
  const mix = env.hourMix;
  if (mix > 0.001) {
    // stops baked once; the hour rides on globalAlpha instead of rebuilding the ramp
    if (!bake.duskVeil) {
      const g2 = ctx.createLinearGradient(0, HORIZON, 0, H);
      g2.addColorStop(0, 'rgba(232,178,110,0.15)');
      g2.addColorStop(0.25, 'rgba(84,74,120,0.15)');
      g2.addColorStop(1, 'rgba(52,54,96,0.24)');
      bake.duskVeil = g2;
    }
    ctx.globalAlpha = mix;
    ctx.fillStyle = bake.duskVeil;
    ctx.fillRect(0, HORIZON + worldDY, W, H - HORIZON + 20);
    ctx.globalAlpha = 1;
  }

  drawWeather(sim, worldDY);

  /* wind streaks */
  if (!REDUCED) {
    const wind = sim.wind;
    const hb = ship.bearing * Math.PI / 180;
    const rx = Math.cos(hb), ry = Math.sin(hb);   /* starboard, under the sheet's north */
    const wm = Math.hypot(wind.x, wind.y) || 1;
    const lat = (wind.x * rx + wind.y * ry) / wm;
    const along = sim.cosA;
    // the streaks carry the wind literacy: they have to read at a glance
    ctx.strokeStyle = mix > 0.5 ? 'rgba(226,210,186,0.95)' : 'rgba(96,74,50,0.95)';
    ctx.lineWidth = 1.45;
    for (const s of streaks) {
      const vx = lat * wind.kn * 7 + 6;
      const vy = 8 + Math.max(0, -along) * wind.kn * 1.0;
      s.x += vx * s.spd * 0.016;
      s.y += vy * s.spd * 0.004;
      if (s.x > W + 180) s.x = -180;
      if (s.x < -200) s.x = W + 170;
      if (s.y > 600) s.y = 60 + (s.y % 60);
      const wob = Math.sin(t * 1.1 + s.ph);
      const a = 0.30 + 0.20 * (0.5 + 0.5 * Math.sin(t * 0.8 + s.ph * 2));
      ctx.globalAlpha = a * (0.78 + 0.22 * knotsFrac) * (1 + 0.45 * wx.squall);
      const L = s.len * (0.5 + wind.kn / 24) * (Math.abs(lat) * 0.6 + 0.5);
      const dir = lat >= 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.bezierCurveTo(
        s.x + dir * L * 0.3, s.y - 5 - wob * 3,
        s.x + dir * L * 0.7, s.y + 3 + wob * 2,
        s.x + dir * L, s.y - 1 + wob * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s.x + dir * L, s.y + wob * 2 + 1.5, 2.4, -Math.PI * 0.6, Math.PI * 0.35);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /* frontispiece */
  ctx.save();
  ctx.translate(720, 700);
  ctx.rotate(roll * Math.PI / 180);
  ctx.translate(-720, -700 + heave);
  ctx.drawImage(bake.deck, 0, 0, W, H);
  drawSail(ctx, t, knotsFrac, sim.cosA);
  drawPennant(ctx, t, sim);
  drawDeckCat(ctx, t, sim);
  ctx.restore();

  /* wheel */
  ctx.save();
  ctx.translate(720, 700);
  ctx.rotate(roll * Math.PI / 180);
  ctx.translate(-720, -700 + heave);
  const jitter = REDUCED ? 0 : Math.sin(t * 7.3) * 0.35 * (0.3 + knotsFrac);
  ctx.translate(720, 838);
  ctx.rotate((ship.wheelAngle + jitter) * Math.PI / 180);
  ctx.drawImage(bake.wheel, -235, -235, 470, 470);
  ctx.restore();

  /* the passing front: wash, rain, the rare fork */
  drawRainFront(sim);

  /* spyglass */
  if (lens.t > 0.003) drawLens(sim, worldDY);

  /* full-frame dusk breath */
  if (mix > 0.001) {
    ctx.fillStyle = `rgba(44,42,80,${0.07 * mix})`;
    ctx.fillRect(0, 0, W, H);
  }
}

/* sail foot across the top */
function drawSail(g, t, knotsFrac, cosA) {
  const s = ship.sail;
  const luffing = s !== 'rest' && cosA < -0.45;
  g.strokeStyle = 'rgba(32,23,13,0.9)';
  g.lineCap = 'round';
  if (s === 'rest') {
    // yard with the furled roll ABOVE it
    g.lineWidth = 6;
    g.beginPath(); g.moveTo(110, 46); g.quadraticCurveTo(720, 30, 1330, 46); g.stroke();
    // rolled canvas: lumpy sausage on top of the yard
    g.fillStyle = 'rgba(238,229,206,0.92)';
    g.beginPath();
    g.moveTo(130, 40);
    for (let x = 130; x <= 1310; x += 40) {
      const yTop = 18 + Math.sin(x * 0.05) * 4 + Math.sin(x * 0.013) * 3;
      g.lineTo(x, yTop);
    }
    g.lineTo(1310, 42);
    for (let x = 1310; x >= 130; x -= 60) {
      g.lineTo(x, 42 + Math.sin(x * 0.03) * 2);
    }
    g.closePath();
    g.fill();
    g.lineWidth = 2;
    g.stroke();
    // bundle shading + gasket ties
    g.lineWidth = 1.2;
    g.globalAlpha = 0.5;
    for (let x = 150; x < 1300; x += 26) {
      g.beginPath();
      g.moveTo(x, 22 + Math.sin(x * 0.05) * 4);
      g.quadraticCurveTo(x + 8, 32, x + 4, 41);
      g.stroke();
    }
    g.globalAlpha = 1;
    g.lineWidth = 2;
    for (let x = 210; x < 1280; x += 130) {
      g.beginPath();
      g.moveTo(x, 14 + Math.sin(x * 0.05) * 4);
      g.lineTo(x - 5, 48);
      g.stroke();
    }
    return;
  }
  const full = s === 'full';
  const dipBase = full ? 138 : 70;
  const flap = REDUCED ? 0 : (luffing ? Math.sin(t * 11) * 10 + Math.sin(t * 23) * 4
    : Math.sin(t * 2.1) * 3.4 * (0.5 + knotsFrac));
  const dip = dipBase + flap;
  const footAt = x => {
    const u = (x - 96) / 1248;
    return (1 - u) * (1 - u) * -8 + 2 * (1 - u) * u * dip + u * u * -8;
  };
  // canvas body: pale filled sail between top of frame and the foot
  g.fillStyle = 'rgba(240,232,210,0.88)';
  g.beginPath();
  g.moveTo(96, -12);
  for (let x = 96; x <= 1344; x += 12) g.lineTo(x, footAt(x));
  g.lineTo(1344, -12);
  g.closePath();
  g.fill();
  // foot bolt-rope
  g.lineWidth = 4.6;
  g.beginPath();
  g.moveTo(96, -8);
  g.quadraticCurveTo(720, dip, 1344, -8);
  g.stroke();
  g.lineWidth = 1.7;
  g.beginPath();
  g.moveTo(100, -15);
  g.quadraticCurveTo(720, dip - 10, 1340, -15);
  g.stroke();
  // seams
  g.lineWidth = 1.5;
  g.globalAlpha = 0.6;
  for (let k = 1; k < 10; k++) {
    const x = 96 + k * (1248 / 10);
    const yF = footAt(x);
    g.beginPath();
    g.moveTo(x, -12);
    g.quadraticCurveTo(x + (full ? 8 : 3) * Math.sin(k + t * (luffing ? 9 : 1.3)), yF * 0.5, x, yF - 4);
    g.stroke();
  }
  // belly shading
  g.globalAlpha = 0.3;
  g.lineWidth = 1.1;
  const shadeN = full ? 5 : 3;
  for (let d = 1; d <= shadeN; d++) {
    g.beginPath();
    g.moveTo(240 + d * 60, -6);
    g.quadraticCurveTo(720, dip - d * 9, 1200 - d * 60, -6);
    g.stroke();
  }
  // brails at half sail
  if (!full) {
    g.globalAlpha = 0.85;
    g.lineWidth = 2;
    for (let k = 2; k <= 8; k += 3) {
      const x = 96 + k * (1248 / 10);
      g.beginPath();
      g.moveTo(x - 13, footAt(x - 13) - 2);
      g.quadraticCurveTo(x, footAt(x) + 20 + flap, x + 13, footAt(x + 13) - 2);
      g.stroke();
    }
  }
  g.globalAlpha = 1;
}

function drawPennant(g, t, sim) {
  const wind = sim.wind;
  const hb = ship.bearing * Math.PI / 180;
  const rx = Math.cos(hb), ry = Math.sin(hb);   /* starboard, under the sheet's north */
  const wm = Math.hypot(wind.x, wind.y) || 1;
  const lat = (wind.x * rx + wind.y * ry) / wm;
  const px = 782, py = 128;
  const dir = lat >= 0 ? 1 : -1;
  const len = 46 + Math.abs(lat) * 26 + wind.kn;
  const wob = REDUCED ? 0 : Math.sin(t * (4 + wind.kn * 0.3)) * 6;
  g.strokeStyle = 'rgba(32,23,13,0.9)';
  g.fillStyle = 'rgba(122,44,34,0.6)';
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(px, py);
  g.quadraticCurveTo(px + dir * len * 0.5, py - 4 + wob * 0.4, px + dir * len, py + 2 + wob);
  g.lineTo(px + dir * len * 0.55, py + 9 + wob * 0.5);
  g.quadraticCurveTo(px + dir * len * 0.3, py + 7, px, py + 10);
  g.closePath();
  g.fill();
  g.stroke();
  g.lineWidth = 1;
  g.beginPath(); g.moveTo(px, py - 6); g.lineTo(px, py + 14); g.stroke();
}

/* the spyglass: the world redrawn magnified, one LOD finer */
function drawLens(sim, worldDY) {
  const t = env.t;
  const k = lens.t;
  const R = 226 * Math.pow(k, 0.8);
  /* the tube sits where the hand holds it, with the old slight sway on top */
  const cx = lens.x + (REDUCED ? 0 : Math.sin(t * 1.7) * 4 + Math.sin(t * 3.1) * 2);
  const cy = lens.y + (REDUCED ? 0 : Math.cos(t * 1.3) * 3);

  /* the tube blocks the world */
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.arc(cx, cy, R, 0, TAU, true);
  ctx.fillStyle = `rgba(26,18,11,${0.8 * k})`;
  ctx.fill('evenodd');
  ctx.restore();

  if (k < 0.35) return;

  /* inside: same world, magnified around the aim point, one stage sharper.
     The clip lives in device space, so the band pass may reset the transform and
     place its slices on integer screen pixels: that is what keeps the lens interior
     free of the vertical seams the magnified slice lattice used to print. */
  /* magnify about the aim point itself: what is under the glass is what the
     glass enlarges, wherever the hand sweeps it - horizon, sky or water */
  const MAG = 2.6;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R - 7, 0, TAU);
  ctx.clip();
  ctx.translate(cx, cy);
  ctx.scale(MAG, MAG);
  ctx.translate(-cx, -cy);
  drawWorld(sim, worldDY, {
    stageBoost: 1, maxBand: BANDS.length - 1, fine: true,
    map: { k: MAG, ox: cx * (1 - MAG), oy: cy * (1 - MAG),
           x0: cx - R - 2, x1: cx + R + 2, y0: cy - R - 2, y1: cy + R + 2 }
  });
  ctx.restore();

  /* ring */
  ctx.globalAlpha = clamp(k * 1.4, 0, 1);
  const rs = R / 226;
  ctx.drawImage(bake.lensRing, cx - 260 * rs, cy - 260 * rs, 520 * rs, 520 * rs);
  ctx.globalAlpha = 1;
}

/* ---------------- input ---------------- */
function setSail(s, silent) {
  if (ship.anchored && s !== 'rest') {
    captionNow('She rides at anchor. Gate-0 ends here.');
    return;
  }
  if (ship.sail === s) return;
  ship.sail = s;
  if (!silent) {
    if (s === 'full') captionNow('Full sail. The bands quicken.');
    else if (s === 'travel') captionNow('Topgallants and studdingsails. She stretches her legs.');
    else if (s === 'half') captionNow('Half sail. Easy now.');
    else captionNow('Heave to. She settles into the swell.');
  }
  dirty = true;
}
function giveOrder(deltaDeg) {
  ship.orderedBearing = norm360(ship.orderedBearing + deltaDeg);
  pushOrder(env.t);
  dirty = true;
}

function initInput() {
  const el = cv;
  let dragging = false, lastAng = 0;
  const wheelCenter = () => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width * (720 / W), y: r.top + r.height * (838 / H), scale: r.width / W };
  };
  el.addEventListener('pointerdown', e => {
    /* a mark on the water takes the click before the wheel does */
    if (ui.mode === 'deck') {
      const rct = el.getBoundingClientRect();
      const mx = (e.clientX - rct.left) * W / rct.width;
      const my = (e.clientY - rct.top) * H / rct.height;
      for (const hh of eggs.hits) {
        if (Math.hypot(mx - hh.x, my - hh.y) < hh.r + 10) { eggActivate(hh.key); return; }
      }
      const sh = starPick(mx, my);
      if (sh) { steerByStar(sh); return; }
    }
    const c = wheelCenter();
    const dx = e.clientX - c.x, dy = e.clientY - c.y;
    const rr = Math.hypot(dx, dy) / c.scale;
    if (rr < 260) {
      dragging = true;
      ship.wheelHeld = true;
      lastAng = Math.atan2(dy, dx);
      el.classList.add('turning');
      el.setPointerCapture(e.pointerId);
      firstOrder('steer');
    }
  });
  el.addEventListener('pointermove', e => {
    /* the hand is always tracked: the spyglass sits where the mouse is */
    const rr2 = el.getBoundingClientRect();
    if (rr2.width > 0) {
      aimLens((e.clientX - rr2.left) * W / rr2.width, (e.clientY - rr2.top) * H / rr2.height);
      if (!dragging && ui.mode === 'deck') {
        const mx2 = (e.clientX - rr2.left) * W / rr2.width;
        const my2 = (e.clientY - rr2.top) * H / rr2.height;
        eggHover(mx2, my2, el);
        const sh2 = starPick(mx2, my2);
        const was = nightSky.hover;
        nightSky.hover = sh2 ? sh2.i : -1;
        if (sh2) el.style.cursor = 'pointer';
        else if (was >= 0 && !eggs.cursorOn) el.style.cursor = '';
      }
    }
    if (!dragging) return;
    const c = wheelCenter();
    const ang = Math.atan2(e.clientY - c.y, e.clientX - c.x);
    let d = (ang - lastAng) * 180 / Math.PI;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    lastAng = ang;
    ship.wheelAngle = clamp(ship.wheelAngle + d, -170, 170);
    giveOrder(d * 0.30);
  });
  const up = () => {
    if (dragging) {
      dragging = false;
      ship.wheelHeld = false;
      el.classList.remove('turning');
    }
  };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);

  const keys = {};
  const typing = e => {
    const t = e.target;
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  };
  window.addEventListener('keydown', e => {
    if (portalKeydown(e)) return;
    if (passage.on && !typing(e)) { endPassage(true); e.preventDefault(); return; }
    if (e.key === 'Escape' && typing(e)) {
      /* the first Escape gives the keyboard back to the ship */
      e.target.blur();
      const sd = document.getElementById('searchdrop');
      if (sd) sd.hidden = true;
      e.preventDefault();
      return;
    }
    if (typing(e)) return;                       // a hand writing in the log owns the keyboard
    if (e.key === 'Escape') {
      if (ui.mode === 'below') { closeBelow(); e.preventDefault(); return; }
      if (ui.mode === 'anchor') { weighAnchor(); e.preventDefault(); return; }
    }
    if (ui.mode === 'anchor') {
      /* reading at anchor: the page answers every key a reader reaches for
         (owner law: the page must scroll, always) */
      const p = $('pagepaper');
      if (p) {
        const step = e.key === 'ArrowDown' ? 72 : e.key === 'ArrowUp' ? -72
          : e.key === 'PageDown' ? Math.round(p.clientHeight * 0.88)
          : e.key === 'PageUp' ? -Math.round(p.clientHeight * 0.88) : undefined;
        if (step !== undefined) { p.scrollTop += step; e.preventDefault(); return; }
        if (e.key === 'Home') { p.scrollTop = 0; e.preventDefault(); return; }
        if (e.key === 'End') { p.scrollTop = p.scrollHeight; e.preventDefault(); return; }
      }
    }
    if (ui.mode === 'below' && e.key >= '1' && e.key <= '5') {
      showTab(['chart', 'index', 'log', 'register', 'colophon'][+e.key - 1]);
      e.preventDefault(); return;
    }
    if (ui.mode === 'below' && ui.tab === 'chart' &&
        (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '_' || e.key === '0')) {
      chartKeyZoom(e.key);
      e.preventDefault(); return;
    }
    if (e.key === 'c' || e.key === 'C') {
      if (ui.mode === 'below') closeBelow(); else openBelow('chart');
      e.preventDefault(); return;
    }
    if (e.key === 'l' || e.key === 'L') { openBelow('log'); e.preventDefault(); return; }
    if (e.key === 's' || e.key === 'S') { sound.toggle(); e.preventDefault(); return; }
    if (e.key === '/' && ui.mode === 'below') { const q = document.getElementById('search'); if (q) { q.focus(); q.select(); e.preventDefault(); } return; }
    if (ui.mode !== 'deck') return;              // below deck the helm is nobody's business
    if (e.key === 'a' || e.key === 'A') {
      if (eggs.ready && !eggs.crossing && eggNm('city') < 0.9) {
        crossTo('pixelcity',
          'The anchor goes down off the nameless city. LAND HO - a boat pulls for the glittering quay.', 1900);
        e.preventDefault(); return;
      }
      const b = ship.bound;
      if (b && distToNm(b) < 0.6) dropAnchor(b);
      else captionNow('Too far off to let go. Bring her inside half a mile of the shore.', 3200);
      e.preventDefault(); return;
    }
    if (e.repeat) { keys[e.key] = true; return; }
    keys[e.key] = true;
    if ((e.key === 'b' || e.key === 'B') && ui.mode === 'deck') { bottleOpen(); e.preventDefault(); return; }
    if (e.key === 't' || e.key === 'T') { firstOrder('sail'); setSail('travel'); }
    else if (e.key === 'f' || e.key === 'F') { firstOrder('sail'); setSail('full'); }
    else if (e.key === 'h' || e.key === 'H') { firstOrder('sail'); setSail('half'); }
    else if (e.key === 'r' || e.key === 'R') { firstOrder('sail'); setSail('rest'); }
    else if (e.key === 'd' || e.key === 'D') {
      env.hourTarget = env.hourTarget > 0.5 ? 0 : 1;
      captionNow(env.hourTarget > 0.5 ? 'The dog watch. Dusk falls on Document Service waters.'
        : 'The afternoon watch returns.');
      dirty = true;
    }
    else if (e.key === ' ') { firstOrder('glass'); lens.raised = true; e.preventDefault(); dirty = true; }
    else if (lens.raised && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) e.preventDefault();
  });
  window.addEventListener('keyup', e => {
    if (typing(e)) return;
    keys[e.key] = false;
    if (e.key === ' ') { lens.raised = false; dirty = true; }
  });

  setInterval(() => {
    if (ui.mode !== 'deck') return;
    if (lens.raised) {
      /* while SPACE is held the arrows sweep the glass, not the helm:
         a hand on the tube is not a hand on the wheel */
      let ax = lens.ax, ay = lens.ay, swept = false;
      if (keys.ArrowLeft) { ax -= 16; swept = true; }
      if (keys.ArrowRight) { ax += 16; swept = true; }
      if (keys.ArrowUp) { ay -= 13; swept = true; }
      if (keys.ArrowDown) { ay += 13; swept = true; }
      if (swept) aimLens(ax, ay);
      return;
    }
    if (keys.ArrowLeft) {
      firstOrder('steer');
      ship.wheelAngle = clamp(ship.wheelAngle - 3.4, -170, 170);
      giveOrder(-1.05);
    }
    if (keys.ArrowRight) {
      firstOrder('steer');
      ship.wheelAngle = clamp(ship.wheelAngle + 3.4, -170, 170);
      giveOrder(1.05);
    }
  }, 33);
}

/* ---------------- main loop ---------------- */
function frame(ts) {
  const tSec = ts / 1000;
  if (!lastT) lastT = tSec;
  let dt = tSec - lastT;
  const frameMs = dt * 1000;
  lastT = tSec;
  dt = clamp(dt, 0, 0.05);

  if (frameMs > 0 && frameMs < 250) {
    diag.frameMs = Math.round(frameMs * 100) / 100;
    diag.samples.push(frameMs);
    if (diag.samples.length > 6000) diag.samples.splice(0, diag.samples.length - 6000);
    const n = Math.min(diag.samples.length, 240);
    let sum = 0;
    for (let i = diag.samples.length - n; i < diag.samples.length; i++) sum += diag.samples[i];
    diag.avgFrameMs = Math.round(sum / n * 100) / 100;
    diag.fps = Math.round(1000 / (sum / n) * 10) / 10;
  }

  const lt = lens.raised ? 1 : 0;
  lens.t += clamp(lt - lens.t, -dt * 5, dt * 5);
  /* the tube trails the hand: a heavy brass spyglass, not a cursor */
  const lk = 1 - Math.exp(-dt * 6.5);
  lens.x += (lens.ax - lens.x) * lk;
  lens.y += (lens.ay - lens.y) * lk;

  if (ui.mode !== 'deck') {
    /* reading never competes with the sea: the plate stops, the sim holds */
    diag.samples.length && diag.samples.splice(0, diag.samples.length);
    /* mute-never-stop: behind the duck the programme keeps running while the
       pane is open; the chart table below is its own silence */
    sound.step(dt, ui.mode === 'anchor');
    requestAnimationFrame(frame);
    return;
  }

  const sim = update(dt);
  render(sim);
  updateLandfallPlate(sim);
  updateFirstBound();
  trackTick(dt, sim);
  sound.tune(sim.wind.kn, sim.knotsFrac);
  if (sound.wxTune) sound.wxTune(wx.rain, wx.squall);
  sound.step(dt, !ship.anchored && ship.knots > 0.4);
  requestAnimationFrame(frame);
}

/* the track the visitor has actually sailed, inked on the chart */
let trackAcc = 0;
function trackTick(dt, sim) {
  trackAcc += dt;
  if (trackAcc < 1.2) return;
  trackAcc = 0;
  fogSee(ship.x, ship.y, FOG_SEE_NM);
  fogPersist();
  const last = visit.track[visit.track.length - 1];
  if (last && Math.hypot(last.x - ship.x, last.y - ship.y) * world.nmPerUnit < 0.12) return;
  visit.track.push({ x: ship.x, y: ship.y });
  if (visit.track.length > 900) visit.track.shift();
}

function becalmFrame() {
  if (ui.mode !== 'deck') { setTimeout(becalmFrame, 160); return; }
  const sim = update(1 / 60);
  if (dirty) {
    lens.t = lens.raised ? 1 : 0;
    lens.x = lens.ax; lens.y = lens.ay;   // becalmed: the tube answers instantly
    render(sim);
    updateLandfallPlate(sim);
    updateFirstBound();
    dirty = false;
  }
  setTimeout(becalmFrame, 120);
}

/* ---------------- test hooks ---------------- */
window.__helm = {
  ready: false,
  order(deltaDeg) { giveOrder(deltaDeg); },
  hardOver(dir) {
    ship.wheelAngle = clamp(dir * 112, -170, 170);
    giveOrder(dir * 52);
  },
  raiseSpyglass(b) { lens.raised = !!b; if (REDUCED) { lens.t = b ? 1 : 0; } dirty = true; },
  aimGlass(x, y) { aimLens(x, y); return { ax: lens.ax, ay: lens.ay, x: lens.x, y: lens.y }; },
  eggs() { return eggState(); },
  sailToEgg(key, nm) { return eggSailTo(key, nm); },
  calm() { return { sail: ship.sail, knots: ship.knots, done: calm.done, taught: store.get('taught', false) }; },
  setHour(h) { env.hourTarget = h === 'dusk' ? 1 : 0; dirty = true; },
  snapHour(h) { env.hourTarget = h === 'dusk' ? 1 : 0; env.hourMix = env.hourTarget; dirty = true; },
  sail(s) { setSail(s, true); },
  setDist(nm) { placeShipAtDistance(nm); dirty = true; },
  setState(o) {
    if (o.distNm != null) placeShipAtDistance(o.distNm);
    if (o.sail) setSail(o.sail, true);
    if (o.hour) { env.hourTarget = o.hour === 'dusk' ? 1 : 0; env.hourMix = env.hourTarget; }
    if (o.spyglass != null) { lens.raised = !!o.spyglass; lens.t = o.spyglass ? 1 : 0; }
    if (o.wheelDeg != null) ship.wheelAngle = clamp(o.wheelDeg, -170, 170);
    if (o.orderOffset) giveOrder(o.orderOffset);
    if (o.knots != null) ship.knots = o.knots;
    dirty = true;
  },
  resetSamples() { diag.samples.length = 0; },
  sliceWidth(n) { SLICE_DBG = n || 0; dirty = true; return SLICE_DBG; },
  say(text, ms) { captionNow(text, ms || 30000); },
  /* the sea built out, for headless audit */
  islands() { return world.islands.map(i => ({ slug: i.slug, x: i.pos.x, y: i.pos.y, mag: i.mag,
    words: i.words, h2: i.nH2, h3: i.nH3, inbound: i.inbound, night: i.night, comm: i.comm })); },
  boundTo(slug) { const i = world.bySlug.get(slug); if (i) setBound(i, true); return !!i; },
  sailTo(slug, nm) { const i = world.bySlug.get(slug); if (!i) return false; placeShipAtDistance(nm == null ? 1.2 : nm, i); dirty = true; return true; },
  placeAt(slug, nm, brg) {
    const i = world.bySlug.get(slug); if (!i) return false;
    const a = brg * Math.PI / 180, u = nm / world.nmPerUnit;
    ship.x = i.pos.x - Math.sin(a) * u; ship.y = i.pos.y - Math.cos(a) * u;
    ship.bearing = ship.orderedBearing = norm360(brg);
    ship.omega = 0; ship.orderHist = [[env.t, ship.bearing]]; ship.anchored = false;
    ship.lastFix = { x: ship.x, y: ship.y, t: env.t };
    setBound(i, true); dirty = true; return true;
  },
  anchor() { if (ship.bound) dropAnchor(ship.bound); return diag.landfallMs; },
  open(slug) { warpTo(slug, 'packet'); return diag.landfallMs; },
  fogMode(m) { fogSetMode(m, false); return fogDiag(); },
  wx() { return diag.wx; },
  wxForce(ix) { wx.forceIx = ix; return wx.months[ix == null ? 0 : ix]; },
  wxBolt(frames) { wx.thunderDone = false; wxBolt('probe'); if (frames) wx.forkFrames = frames; return true; },
  bottle(text) { bottleOpen(); const ta = document.getElementById('bottletext'); if (ta) ta.value = text; bottleToss(); return diag.lastBottle; },
  journalPng() { return exportJournal(false); },
  firstSentence(slug) { const I = world.bySlug.get(slug); return I ? firstSentenceOf(I) : ''; },
  fhSay(slug) { const I = world.bySlug.get(slug); if (!I) return ''; const s = firstSentenceOf(I); const el = document.getElementById('figurehead'); el.querySelector('.fh-line').textContent = '“' + s + '”'; el.querySelector('.fh-who').textContent = 'the figurehead speaks · her page’s own first words'; el.classList.add('shown'); fh.upTil = env.t + 7.5; return s; },
  stars() { buildConstellation(); return nightSky.stars.map(s => ({ slug: s.isle.slug, title: s.isle.title, x: s.x, y: s.y })); },
  steerStar(i) { if (!nightSky.stars[i]) return false; steerByStar({ i }); return true; },
  cat() { return { deck: cat.deck, u: +cat.u.toFixed(3), side: cat.side, stare: cat.stareAt && cat.stareAt.slug, home: cat.home, beasts: catBeasts().map(b => b.slug) }; },
  catWalk() { cat.deck = 'walk'; cat.u = 0.06; cat.side = 1; return true; },
  packetInfo(slug) { const I = world.bySlug.get(slug); return I ? packetFor(I) : null; },
  harbourShips(slug) { const s = []; for (const [a, b] of world.graph.edges) if (b === slug) s.push(a); return s; },
  fogLift(m) { fogSetMode(m, true); return fogDiag(); },
  fog() { return fogDiag(); },
  see(slug, r) { const i = world.bySlug.get(slug); if (!i) return false; fogSee(i.pos.x, i.pos.y, r || 1.2); return fogDiag(); },
  weigh() { weighAnchor(); },
  below(tab) { openBelow(tab || 'chart'); },
  passage(slug) { const i = world.bySlug.get(slug); if (!i) return false; passageTo(i); return true; },
  passageState() { return { on: passage.on, closing: passage.closing, t: +passage.t.toFixed(2),
    dur: +passage.dur.toFixed(2), nm: +passage.nm.toFixed(2), isle: passage.isle ? passage.isle.slug : null }; },
  skipPassage() { endPassage(true); },
  portalState() { return { open: portal.open, key: portal.key, deny: Object.keys(portal.denyT) }; },
  answerPortal(y) { portalAnswer(!!y); },
  maiden() { return { maiden: story.maiden, qs: story.qs ? story.qs.slug : null,
    nm: story.qs ? +distToNm(story.qs).toFixed(2) : null }; },
  onDeck() { closeBelow(); if (ui.slug) weighAnchor(); },
  search(q) { const s = document.getElementById('search'); s.value = q;
    s.dispatchEvent(new Event('input')); return ui.searchHits.slice(0, 8).map(h => h.isle.slug); },
  mode() { return ui.mode; },
  sound(on) { if (on !== sound.on) sound.toggle(); return sound.on; },
  sets() { return { uncited: world.uncited.map(i => i.slug), desert: world.desert.map(i => i.slug),
    lone: world.lone.map(i => i.slug), night: world.nightIsles.map(i => i.slug) }; },
  inSight() { return pickVisible().map(v => ({ slug: v.isle.slug, dist: +v.dist.toFixed(2),
    az: +v.az.toFixed(1), mag: +v.isle.mag.toFixed(2), words: v.isle.words,
    wpx: Math.round(islandScreenW(v.dist, v.isle.mag)), lod: islandStage(v.dist) })); },
  maxIslands(n) { ISLE_CAP = n == null ? 18 : n; return ISLE_CAP; },
  bakeTimes() {
    const out = {};
    for (const lod of [0, 1, 2, 3]) {
      const t0 = performance.now();
      let n = 0;
      for (const I of world.islands.slice(0, 24)) { bakeIsleLod(I, lod); n++; }
      out['lod' + lod] = +((performance.now() - t0) / n).toFixed(3);
    }
    out.cache = spriteCache.size;
    return out;
  },
  visit() { return { log: visit.log.length, charted: visit.charted.size, raised: visit.raised.size,
    lamps: visit.lamps.size, islets: visit.islets.size, watches: visit.watches.size, hand: visit.hand }; },
  logRows() { return visit.log.slice(); },
  writeRemark(i, text) { const inp = document.querySelector('textarea.remark[data-i="' + i + '"]');
    if (!inp) return false; inp.value = text; inp.dispatchEvent(new Event('input')); return true; },
  clearVisit() { try { for (const k of ['log','charted','raised','hand','lamps','islets','watches','hours','taught','soundings','routes','packet','bottles','seen','fogmode','spoken'])
      window.localStorage.removeItem('carta.' + k); } catch (e) {} }
};

/* ============================================================
   LANDFALL, THE CHART TABLE, THE LOG, THE REGISTER
   Everything below this line is reading, and reading is DOM: crisp text on
   cream paper, never painted into the canvas, never themed. The sea stops
   rendering while a page is open, so the reading never competes with it.
   ============================================================ */

const $ = id => document.getElementById(id);
const ui = { mode: 'deck', tab: 'chart', slug: null, chartReady: false, searchSel: 0, searchHits: [] };

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

/* ---- localStorage, wrapped: every surface works with nothing stored ---- */
const store = {
  get(key, dflt) {
    try {
      const raw = window.localStorage.getItem('carta.' + key);
      return raw == null ? dflt : JSON.parse(raw);
    } catch (e) { return dflt; }
  },
  set(key, val) {
    try { window.localStorage.setItem('carta.' + key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }
};

const visit = {
  log: store.get('log', []),
  charted: new Set(store.get('charted', [])),
  raised: new Set(store.get('raised', [])),
  hand: store.get('hand', ''),
  lamps: new Set(store.get('lamps', [])),
  islets: new Set(store.get('islets', [])),
  watches: new Set(store.get('watches', [])),
  track: [],
  hours: store.get('hours', 0),
  soundings: store.get('soundings', []),
  routes: store.get('routes', []),
  packet: store.get('packet', null),
  bottles: store.get('bottles', []),
  save() {
    store.set('log', this.log.slice(-400));
    store.set('charted', [...this.charted]);
    store.set('raised', [...this.raised]);
    store.set('hand', this.hand);
    store.set('lamps', [...this.lamps]);
    store.set('islets', [...this.islets]);
    store.set('watches', [...this.watches]);
    store.set('hours', this.hours);
    store.set('soundings', this.soundings.slice(-240));
    store.set('routes', this.routes.slice(-160));
    store.set('packet', this.packet);
    store.set('bottles', this.bottles.slice(-40));
    fogPersist();
  }
};

/* ---- the compass, spoken the way a log is kept ---- */
const POINTS = ['N', 'N by E', 'NNE', 'NE by N', 'NE', 'NE by E', 'ENE', 'E by N',
  'E', 'E by S', 'ESE', 'SE by E', 'SE', 'SE by S', 'SSE', 'S by E',
  'S', 'S by W', 'SSW', 'SW by S', 'SW', 'SW by W', 'WSW', 'W by S',
  'W', 'W by N', 'WNW', 'NW by W', 'NW', 'NW by N', 'NNW', 'N by W'];
function compassPoint(deg) { return POINTS[Math.round(norm360(deg) / 11.25) % 32]; }
function pointClass(deg) {
  const i = Math.round(norm360(deg) / 11.25) % 32;
  return i % 4 === 0 ? 0 : (i % 4 === 2 ? 1 : 2);   // principal, half, quarter
}
function windForce(kn) {
  return kn < 8 ? 'light air' : kn < 12 ? 'light breeze' : kn < 16 ? 'gentle breeze'
    : kn < 20 ? 'moderate breeze' : 'fresh breeze';
}
function pointOfSailing(cosA) {
  return cosA > 0.85 ? 'running' : cosA > 0.4 ? 'on the quarter'
    : cosA > -0.15 ? 'on the beam' : 'close-hauled';
}

/* ============================================================
   THE PAGE, READ AT ANCHOR
   ============================================================ */
function fixHref(h) {
  if (!h) return '#';
  if (h.charAt(0) === '#' && h.charAt(1) === '/') return h;      // an internal citation
  return h;
}
function fixImg(src) {
  if (!src) return '';
  return src.charAt(0) === '/' ? src.slice(1) : src;             // /img/... -> img/...
}

/* a list item is either plain html or { html, blocks }: a step whose body
   carries tables, nested lists or code. Stringifying the second shape was the
   '[object Object]' blemish the sweep caught on 11 pages. */
function liHTML(i) {
  if (i == null) return '';
  if (typeof i === 'string') return i;
  return (i.html || '') + (i.blocks || []).map(renderBlockHTML).join('');
}
function renderBlockHTML(b) {
  switch (b.t) {
    case 'tldr': return '<div class="tldr"><span class="tag">In brief</span>' + b.html + '</div>';
    case 'p': return '<p>' + b.html + '</p>';
    case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      return '<' + b.t + (b.id ? ' id="s-' + esc(b.id) + '"' : '') + '>' + esc(b.text) + '</' + b.t + '>';
    case 'img': {
      const src = fixImg(b.light || b.dark || '');
      if (!src) return '';
      return '<figure><img loading="lazy" src="' + esc(src) + '" alt="' + esc(b.alt || '') + '">' +
        (b.caption ? '<figcaption>' + b.caption + '</figcaption>' : '') + '</figure>';
    }
    case 'ul': return '<ul>' + (b.items || []).map(i => '<li>' + liHTML(i) + '</li>').join('') + '</ul>';
    case 'ol': return '<ol' + (b.start && b.start !== 1 ? ' start="' + b.start + '"' : '') + '>' +
      (b.items || []).map(i => '<li>' + liHTML(i) + '</li>').join('') + '</ol>';
    case 'table': {
      const al = b.align || [];
      const head = '<tr>' + (b.head || []).map((h, i) =>
        '<th style="text-align:' + (al[i] || 'left') + '">' + h + '</th>').join('') + '</tr>';
      const rows = (b.rows || []).map(r => '<tr>' + r.map((c, i) =>
        '<td style="text-align:' + (al[i] || 'left') + '">' + c + '</td>').join('') + '</tr>').join('');
      return '<div class="twrap"><table><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>';
    }
    case 'admonition': {
      const kind = esc(b.kind || 'note');
      return '<div class="adm k-' + kind + '"><div class="admhead">' + kind +
        (b.title ? ' &mdash; ' + esc(b.title) : '') + '</div>' +
        (b.blocks || []).map(renderBlockHTML).join('') + '</div>';
    }
    case 'tabs': {
      const btns = (b.tabs || []).map((t, i) =>
        '<button type="button" class="tabbtn' + (i === 0 ? ' active' : '') + '" data-tab="' + i + '">' +
        esc(t.label) + '</button>').join('');
      const panes = (b.tabs || []).map((t, i) =>
        '<div class="tabpane' + (i === 0 ? ' active' : '') + '">' +
        (t.blocks || []).map(renderBlockHTML).join('') + '</div>').join('');
      return '<div class="tabs"><div class="tabbar">' + btns + '</div><div class="tabpanes">' + panes + '</div></div>';
    }
    case 'code':
      return '<div class="codeblk"><div class="codebar"><span class="ct">' +
        esc(b.title || '') + '</span><span>' + esc(b.lang || 'text') + '</span></div>' +
        '<pre><code>' + esc(b.code) + '</code></pre></div>';
    case 'cards':
      return '<div class="cardgrid">' + (b.items || []).map(i =>
        '<a class="card" href="' + esc(fixHref(i.link)) + '"><div class="ct">' +
        esc(i.icon || '') + ' ' + esc(i.title) + '</div><div class="cd">' + esc(i.desc) + '</div></a>').join('') + '</div>';
    case 'badge':
      return '<span class="badge" title="' + esc(b.tooltip || '') + '">' + esc(b.label) + '</span>';
    case 'details':
      return '<details class="dblk"' + (b.id ? ' id="s-' + esc(b.id) + '"' : '') + '><summary>' +
        esc(b.summary || 'Show more') + '</summary>' + (b.blocks || []).map(renderBlockHTML).join('') + '</details>';
    case 'endpoint': {
      const method = b.method ? esc(b.method) : esc(b.kind || 'API');
      let out = '<div class="endpoint"' + (b.id ? ' id="s-' + esc(b.id) + '"' : '') +
        '><div class="ephead"><span class="method">' + method + '</span><code>' + esc(b.path) + '</code></div><div class="epbody">';
      if (b.title) out += '<h4>' + esc(b.title) + '</h4>';
      if (b.description) out += '<p>' + b.description + '</p>';
      if (b.params && b.params.length) {
        out += '<div class="twrap"><table><thead><tr><th>' + esc(b.paramTitle || 'Parameters') +
          '</th><th>Type</th><th>Description</th></tr></thead><tbody>' +
          b.params.map(p => '<tr><td><code>' + esc(p.name) + '</code>' + (p.required ? ' <b>*</b>' : '') +
            '</td><td>' + esc(p.type) + '</td><td>' + (p.desc || '') + '</td></tr>').join('') +
          '</tbody></table></div>';
      }
      for (const t of (b.codeTabs || [])) {
        out += renderBlockHTML({ t: 'code', lang: t.lang, title: t.label, code: t.code });
      }
      for (const r of (b.responses || [])) {
        out += renderBlockHTML({
          t: 'code', lang: r.lang || 'json',
          title: 'Response ' + (r.status || '') + ' ' + (r.statusText || ''), code: r.body || ''
        });
      }
      return out + '</div></div>';
    }
    case 'columns':
      return '<div class="cols">' + (b.cols || []).map(col =>
        '<div>' + col.map(renderBlockHTML).join('') + '</div>').join('') + '</div>';
    case 'hr': return '<hr>';
    default: return '';
  }
}

function ageOfInk(isle) {
  const last = isle.last || '';
  if (!last) return 'ink of no known age';
  const d = (Date.parse('2026-09-05') - Date.parse(last)) / 86400000;
  if (d < 30) return 'the ink is still wet';
  if (d < 180) return 'the ink has barely browned';
  if (d < 540) return 'the ink has browned';
  return 'the ink is old and foxed';
}

function shoresideHTML(isle) {
  const reg = world.register;
  const hands = (reg.bySlug[isle.slug] || []).map(i => reg.hands[i]);
  const prov = isle.prov >= 0 ? world.provinces[isle.prov] : null;
  let out = '';

  out += '<div class="ss-block"><h4>The sounding</h4><dl>' +
    '<dt>Fathoms</dt><dd>' + commas(isle.words) + ' words</dd>' +
    '<dt>Headlands &amp; knolls</dt><dd>' + isle.nH2 + ' h2, ' + isle.nH3 + ' h3</dd>' +
    '<dt>Reef hatching</dt><dd>' + isle.code + (isle.code === 1 ? ' code block' : ' code blocks') + '</dd>' +
    '<dt>Riding lights</dt><dd>' + (isle.inbound
      ? isle.inbound + (isle.inbound === 1 ? ' page cites her' : ' pages cite her')
      : '<b>none: a dark shore</b>') + '</dd>' +
    '<dt>She cites</dt><dd>' + isle.outbound + (isle.outbound === 1 ? ' page' : ' pages') + '</dd>' +
    (prov ? '<dt>Province</dt><dd>' + esc(prov.name || prov.section) + ' &middot; ' + prov.size +
            (prov.size === 1 ? ' place' : ' places') + '</dd>'
          : '<dt>Province</dt><dd>none: she lies off soundings</dd>') +
    '</dl></div>';

  out += '<div class="ss-block"><h4>The hands that keep her</h4><dl>' +
    '<dt>Keepers</dt><dd>' + (isle.authors.length ? isle.authors.map(esc).join(', ') : 'no hand recorded') + '</dd>' +
    '<dt>Watch entries</dt><dd>' + isle.commits + (isle.commits === 1 ? ' commit' : ' commits') +
      (isle.night ? ', ' + isle.night + ' by lantern' : '') + '</dd>' +
    '<dt>First and last</dt><dd>' + esc(isle.first) + ' &rarr; ' + esc(isle.last) + '</dd>' +
    '<dt>Days of care</dt><dd>' + isle.careDays + ' &middot; ' + ageOfInk(isle) + '</dd>' +
    '</dl></div>';

  out += harbourMasterHTML(isle);
  out += packetHTML(isle);

  /* the standing orders, answered here rather than on a checklist screen */
  const orders = [];
  if (isle.inbound === 0 && isle.outbound === 0) {
    orders.push({
      key: 'islet', label: 'Land the desert islet',
      text: 'Nothing links here in either direction. No citation could ever have brought a ship: only a visitor can reach her.',
      done: visit.islets.has(isle.slug)
    });
  } else if (isle.inbound === 0) {
    orders.push({
      key: 'lamp', label: 'Hang the first lamp',
      text: 'No page in the corpus cites this one. Hers is a dark shore, one of ' +
        world.uncited.length + ' in the sea.',
      done: visit.lamps.has(isle.slug)
    });
  }
  if (isle.authors.length === 1) {
    orders.push({
      key: 'watch', label: 'Sign the watch',
      text: esc(isle.authors[0]) + ' has stood this watch alone. ' + world.lone.length +
        ' islands in the sea are kept by a single hand.',
      done: visit.watches.has(isle.slug)
    });
  }
  if (orders.length) {
    out += '<div class="ss-block"><h4>Standing orders</h4>';
    for (const o of orders) {
      out += '<div class="ss-order"><b>' + o.label + '</b><div>' + o.text + '</div>' +
        '<button class="act" type="button" data-act="' + o.key + '"' + (o.done ? ' disabled' : '') + '>' +
        (o.done ? 'entered in the log' : o.label) + '</button></div>';
    }
    out += '</div>';
  }

  if (hands.length) {
    out += '<div class="ss-block"><h4>Under this water</h4>' +
      '<div style="margin-bottom:8px">' + hands.length +
      (hands.length === 1 ? ' hand tended a page that stood where this one stands, and no page of theirs survives.'
                          : ' hands tended pages that stood where this one stands, and no page of theirs survives.') +
      '</div><ul class="plain">';
    for (const h of hands) {
      const up = visit.raised.has(h.name);
      out += '<li>' + (up ? '<b>' + esc(h.name) + '</b>' : esc(h.name)) + ' &middot; ' +
        h.commits + (h.commits === 1 ? ' commit' : ' commits') + ', ' + h.paths + ' lost pages</li>';
    }
    out += '</ul><button class="act" type="button" data-act="raise"' +
      (hands.every(h => visit.raised.has(h.name)) ? ' disabled' : '') + '>' +
      (hands.every(h => visit.raised.has(h.name)) ? 'raised into the register' : 'Raise ' +
        (hands.length === 1 ? 'this name' : 'these names')) + '</button></div>';
  }

  /* crossing (c): at the longest shore in the sea, a coastal path climbs
     from the beach - the long way round begins at this anchorage */
  if (eggs.ready && isle === eggs.pathIsle) {
    out += '<div class="ss-block egg-path"><h4>Ashore</h4>' + PATH_SVG +
      '<div class="ep-line">A coastal path climbs from this beach in long, unhurried zigzags; ' +
      'from the cliff a walker waves, and a small dog waves harder. This is the longest shore in the sea &mdash; ' +
      commas(isle.words) + ' fathoms of it &mdash; and the path goes on past the edge of the chart.</div>' +
      '<button class="act" type="button" data-act="path">Follow the path</button></div>';
  }

  /* the citations, as instant jumps */
  const cites = [];
  for (const [a, b] of world.graph.edges) if (a === isle.slug) cites.push(b);
  if (cites.length) {
    out += '<div class="ss-block"><h4>She cites</h4><ul class="plain">';
    for (const s of cites.slice(0, 14)) {
      const t = world.bySlug.get(s);
      out += '<li><a href="#' + esc(s) + '">' + esc(t ? t.title : s) + '</a></li>';
    }
    if (cites.length > 14) out += '<li><i>and ' + (cites.length - 14) + ' more</i></li>';
    out += '</ul></div>';
  }
  return out;
}

let landfallStart = 0;
/* keep the rail true to the paper: position, proportion, thumb */
function railSync() {
  const rail = $('paperrail'), th = $('paperthumb'), p = $('pagepaper');
  if (!rail || !p) return;
  if ($('anchorage').hidden) { rail.style.display = 'none'; return; }
  const need = p.scrollHeight > p.clientHeight + 4;
  rail.style.display = need ? 'block' : 'none';
  if (!need) return;
  const pr = p.getBoundingClientRect(), ar = $('anchorbody').getBoundingClientRect();
  rail.style.left = (pr.right - ar.left - 17) + 'px';
  rail.style.top = (pr.top - ar.top + 6) + 'px';
  rail.style.height = (pr.height - 12) + 'px';
  const trackH = pr.height - 12 - 4;
  const thH = Math.max(28, trackH * p.clientHeight / p.scrollHeight);
  const y = (trackH - thH) * (p.scrollTop / Math.max(1, p.scrollHeight - p.clientHeight));
  th.style.height = thH + 'px';
  th.style.top = (2 + y) + 'px';
}

function openPage(isle, how) {
  if (!isle) return;
  firstOrder('below');
  landfallStart = performance.now();
  ui.slug = isle.slug;
  packetDelivery(isle);
  ui.mode = 'anchor';
  const page = world.content.pages[isle.slug];
  const prov2 = isle.prov >= 0 ? world.provinces[isle.prov] : null;

  $('below').hidden = true;
  const a = $('anchorage');
  a.querySelector('.ah-kicker').textContent =
    (isle.product === 'cloud' ? 'The Cloud sea' : 'The CMS ocean') + ' · ' +
    (prov2 ? (prov2.name || prov2.section) + ' province' : (isle.section ? isle.section + ' · off soundings' : 'off soundings'));
  a.querySelector('.ah-title').textContent = isle.title;
  a.querySelector('.ah-sub').textContent = isle.description || '';
  a.querySelector('.ah-sound').textContent =
    'By the deep, ' + commas(isle.words) + ' · ' +
    (isle.inbound ? isle.inbound + (isle.inbound === 1 ? ' riding light' : ' riding lights') : 'a dark shore') +
    (isle.night ? ' · ' + isle.night + ' lantern' + (isle.night > 1 ? 's' : '') : '');

  const paper = $('pagepaper');
  paper.innerHTML = (page.blocks || []).map(renderBlockHTML).join('') +
    '<div class="endplate">' + commas(isle.words) + ' words, ' + (page.blocks || []).length +
    ' blocks, ' + isle.nH2 + ' sections. Kept by ' +
    (isle.authors.length === 1 ? esc(isle.authors[0]) + ' alone' : esc(isle.authors.length) + ' hands') +
    ' over ' + isle.commits + ' entries, ' + esc(isle.first) + ' to ' + esc(isle.last) + '. ' +
    'Press <b>Esc</b> to weigh anchor, or <b>C</b> for the chart table.</div>';
  $('shoreside').innerHTML = shoresideHTML(isle);

  a.hidden = false;
  paper.scrollTop = 0;
  $('shoreside').scrollTop = 0;
  requestAnimationFrame(railSync);
  requestAnimationFrame(() => {
    diag.landfallMs = Math.round((performance.now() - landfallStart) * 10) / 10;
  });

  if (!visit.charted.has(isle.slug)) {
    visit.charted.add(isle.slug);
    isle.charted = true;
    ui.chartReady = false;
  }
  isle.visited++;
  visit.save();
  sound.landfall(isle);
  sound.reading(true);
}

function dropAnchor(isle) {
  if (!isle) return;
  ship.anchored = true;
  ship.sail = 'rest';
  ship.knots = 0;
  ship.atAnchorOff = isle;
  fogSee(isle.pos.x, isle.pos.y, 1.1);
  logCrossing(isle);
  sound.anchorShot();
  captionNow('The anchor bites off ' + isle.title + '.', 3000);
  openPage(isle, 'sailed');
}

function weighAnchor() {
  sound.reading(false);
  $('anchorage').hidden = true;
  $('below').hidden = true;
  ui.mode = 'deck';
  ui.slug = null;
  if (ship.anchored) {
    ship.anchored = false;
    ship.clearOf = ship.atAnchorOff || ship.bound;
    ship.atAnchorOff = null;
    setSail('half', true);
    captionNow('Anchor aweigh. ' + (ship.bound ? ship.bound.title : 'The shore') +
      ' is charted, and inked on the chart.', 4200);
  }
  dirty = true;
}

/* ---- the instant path: no crossing, no ceremony ---- */
function warpTo(slug, why) {
  const isle = world.bySlug.get(slug);
  if (!isle) return;
  placeShipAtDistance(0.13, isle);
  ship.anchored = true;
  ship.sail = 'rest';
  ship.knots = 0;
  ship.atAnchorOff = isle;
  fogSee(isle.pos.x, isle.pos.y, 1.1);
  logPacket(isle, why || 'packet');
  openPage(isle, 'packet');
  dirty = true;
}

/* ============================================================
   THE CAPTAIN'S LOG
   ============================================================ */
function logRow(row) {
  visit.log.push(row);
  visit.save();
  if (ui.tab === 'log' && !$('below').hidden) renderLog();
}
function logCrossing(isle) {
  const wind = windAtShip();
  const run = ship.lastFix ? Math.hypot(ship.x - ship.lastFix.x, ship.y - ship.lastFix.y) * world.nmPerUnit : 0;
  const elapsedH = ship.lastFix ? Math.max(1e-4, (env.t - ship.lastFix.t) * COMPRESSION / 3600) : 0;
  const kn = clamp(elapsedH > 0 ? run / elapsedH : ship.knots, 0.1, 24);
  const hours = kn > 0 ? run / kn : 0;
  visit.hours += hours;
  const hb = ship.bearing * Math.PI / 180;
  const cosA = (Math.sin(hb) * wind.x - Math.cos(hb) * wind.y) / (Math.hypot(wind.x, wind.y) || 1);
  logRow({
    h: Math.max(1, Math.round(visit.hours)),
    k: Math.round(kn * 10) / 10,
    f: isle.words,
    courses: compassPoint(ship.bearing) + ', ' + (Math.round(run * 10) / 10) + ' nm run',
    winds: compassPoint(wind.deg) + ' ' + Math.round(wind.kn) + ' kn, ' +
      windForce(wind.kn) + ', ' + pointOfSailing(cosA),
    slug: isle.slug, title: isle.title, remark: '', mark: false
  });
  ship.lastFix = { x: ship.x, y: ship.y, t: env.t };
}
function logPacket(isle, why) {
  visit.hours += 0;
  logRow({
    h: Math.max(1, Math.round(visit.hours)),
    k: 0, f: isle.words,
    courses: why === 'citation' ? 'followed a citation' : why === 'passage' ? 'made the passage under sail' : why === 'hailed' ? 'hailed her in harbour and boarded' : 'carried by the packet',
    winds: 'no crossing sailed',
    slug: isle.slug, title: isle.title, remark: '', mark: false
  });
  ship.lastFix = { x: ship.x, y: ship.y, t: env.t };
}
function logMark(text) {
  logRow({ h: Math.max(1, Math.round(visit.hours)), mark: true, text, remark: '' });
}

function renderLog() {
  const p = $('pane-log');
  const nLamp = visit.lamps.size, nIslet = visit.islets.size, nWatch = visit.watches.size;
  let h = '<div class="bscroll">';
  /* crossing (e): once per visit a pressed specimen slips from between the
     pages; after that it lies where it fell, at the head of the log */
  if (!eggs.crossing || eggs.crossing === 'herbarium') {
    h += '<div id="specimen" class="' + (eggs.specimenSlipped ? 'lain' : 'slipping') +
      '" role="button" tabindex="0" aria-label="A pressed specimen">' + SPECIMEN_SVG +
      '<span class="sp-line">A pressed specimen slips from between the pages &mdash; ' +
      'no plant of this sea. Some other garden keeps its like.</span></div>';
  }
  h += '<p class="bnote">A ship\'s log, kept noon to noon in six ruled columns. ' +
    'H is the hour of the voyage, K the knots made good, F the fathoms sounded at the landfall &mdash; ' +
    'and in this sea a fathom is a word, so F is the true length of the page you reached. ' +
    'Courses and Winds are what actually carried you. The Remarks column is yours: ' +
    'nothing writes in it but your own hand, and nothing here is scored.</p>';

  h += '<div class="bsec">Standing orders</div><div class="orders">';
  h += '<div class="order"><h5>Hang a first lamp</h5><p>' + world.uncited.length +
    ' islands in this sea are cited by nothing at all. No wind blows toward them; they are reached ' +
    'by beating to windward and by nothing else. Make landfall on one and hang her first lamp.</p>' +
    '<div class="tally">' + nLamp + ' of ' + world.uncited.length + ' lit this visit</div></div>';
  h += '<div class="order"><h5>Land the desert islets</h5><p>Three pages are linked in neither direction: ' +
    world.desert.map(i => esc(i.title)).join(', ') + '. No citation can carry a ship there. ' +
    'They exist to be reached by a person.</p>' +
    '<div class="tally">' + nIslet + ' of ' + world.desert.length + ' landed this visit</div></div>';
  h += '<div class="order"><h5>Sign the watch</h5><p>' + world.lone.length +
    ' islands are kept by a single hand. Sign your own name below, then sign the watch bill beside ' +
    'a lone keeper at her anchorage. Your mark is always entered as a stranger\'s: no provenance is ever forged.</p>' +
    '<div class="tally">' + nWatch + (nWatch === 1 ? ' watch' : ' watches') + ' signed this visit</div></div>';
  h += '</div>';

  h += '<div class="signrow"><input id="handname" type="text" placeholder="Sign the watch bill" value="' +
    esc(visit.hand) + '"><button class="btn" id="signbtn" type="button">Sign</button>' +
    (visit.hand ? '<span style="font-style:italic;color:var(--ink-2)">Signed: ' + esc(visit.hand) + '</span>' : '') +
    '</div>';

  h += '<div class="bsec">The log</div>';
  if (visit.log.length) {
    h += '<div class="exportrow"><button class="btn" id="logexport" type="button">' +
      'Export the journal &mdash; a PNG in the engraved hand</button></div>';
  }
  if (!visit.log.length) {
    h += '<p class="bnote">Nothing entered yet. The first crossing writes the first line.</p>';
  } else {
    /* the first landfall on each water carries her engraved sketch */
    const firstIdx = new Set();
    {
      const seenS = new Set();
      visit.log.forEach((r, i) => {
        if (!r.mark && r.slug && !seenS.has(r.slug)) { seenS.add(r.slug); firstIdx.add(i); }
      });
    }
    h += '<table id="logtable"><thead><tr><th>H</th><th>K</th><th>F</th><th>Courses</th><th>Winds</th><th>Remarks</th></tr></thead><tbody>';
    visit.log.forEach((r, i) => {
      if (r.mark) {
        h += '<tr class="mark"><td class="num">' + r.h + '</td><td colspan="4">' + esc(r.text) + '</td>' +
          '<td class="rem"><textarea class="remark" rows="1" data-i="' + i +
          '" placeholder="in your own hand">' + esc(r.remark || '') + '</textarea></td></tr>';
      } else {
        h += '<tr><td class="num">' + r.h + '</td><td class="num">' + (r.k || '—') + '</td>' +
          '<td class="num">' + commas(r.f) + '</td>' +
          '<td>' + esc(r.courses) + '<br><span style="font-size:12px;color:var(--ink-3)">made ' +
          esc(r.title) + '</span>' +
          (firstIdx.has(i) ? '<br><canvas class="lg-sk" width="128" height="66" data-slug="' +
            esc(r.slug) + '" aria-label="the first-landfall sketch of ' + esc(r.title) + '"></canvas>' : '') +
          '</td>' +
          '<td>' + esc(r.winds) + '</td>' +
          '<td class="rem"><textarea class="remark" rows="1" data-i="' + i +
          '" placeholder="in your own hand">' + esc(r.remark || '') + '</textarea></td></tr>';
      }
    });
    h += '</tbody></table>';
  }
  h += '</div>';
  p.innerHTML = h;
  wireLogSketches(p);

  const spec = document.getElementById('specimen');
  if (spec) {
    eggs.specimenSlipped = true;
    const goHerb = () => crossTo('herbarium',
      'You lift it by the stem. It wants pressing back into its own book.', 1500);
    spec.addEventListener('click', goHerb);
    spec.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goHerb(); }
    });
  }

  const sb = $('signbtn');
  if (sb) sb.addEventListener('click', () => {
    const v = $('handname').value.trim().slice(0, 40);
    if (!v) return;
    visit.hand = v;
    visit.save();
    logMark('Signed the watch bill: ' + v + '.');
    renderLog();
  });
  const grow = el => { el.style.height = 'auto'; el.style.height = (el.scrollHeight + 2) + 'px'; };
  p.querySelectorAll('textarea.remark').forEach(inp => {
    grow(inp);
    inp.addEventListener('input', () => {
      const i = parseInt(inp.dataset.i, 10);
      if (visit.log[i]) { visit.log[i].remark = inp.value.slice(0, 240); visit.save(); }
      grow(inp);
    });
  });
}

/* ============================================================
   THE DROWNED REGISTER
   ============================================================ */
function raiseHandsFor(isle) {
  const reg = world.register;
  const idx = reg.bySlug[isle.slug] || [];
  const names = [];
  for (const i of idx) {
    const h = reg.hands[i];
    if (visit.raised.has(h.name)) continue;
    visit.raised.add(h.name);
    names.push(h.name);
  }
  if (!names.length) return 0;
  visit.save();
  logMark('Raised into the register from ' + isle.title + ': ' + names.join(', ') + '.');
  captionNow(names.length === 1 ? names[0] + ' is above water again.'
    : names.length + ' names are above water again.', 4200);
  return names.length;
}

function renderRegister() {
  const reg = world.register;
  const p = $('pane-register');
  let h = '<div class="bscroll">';
  h += '<p class="bnote">The raw commit log of this documentation names ' + reg.authorsEver +
    ' hands. ' + reg.livingHands + ' of them still keep a page that exists. The other ' + reg.drownedCount +
    ' kept ' + commas(reg.deadPaths) + ' pages that no longer exist anywhere in the corpus: ' +
    'their work was rewritten, merged away, or simply removed, and nothing above water carries their name. ' +
    reg.singleSignature + ' of them signed exactly once. They are not gone from the history; ' +
    'they are gone from the sea. Read a page that stands where their work stood and their name comes up.</p>';

  h += '<div class="bsec">Raised this visit &mdash; ' + visit.raised.size + ' of ' + reg.drownedCount + '</div>';
  const raisedNames = reg.hands.filter(x => visit.raised.has(x.name));
  if (raisedNames.length) h += '<div class="plategrid">';
  if (!raisedNames.length) {
    h += '<p class="bnote">None yet. Sixty-nine of the seventy can be raised from the shore that stands ' +
      'above their lost path; the last, ' + esc((reg.hands.find(x => !x.raisedBy.length) || {}).name || '') +
      ', touched no page that can be traced, and is listed here all the same.</p>';
  } else {
    for (const hnd of raisedNames) {
      h += '<div class="regplate"><div class="rp-name">' + esc(hnd.name) + '</div>' +
        '<div class="rp-line">First signed ' + esc(hnd.first) + ', last ' + esc(hnd.last) + '. ' +
        hnd.commits + (hnd.commits === 1 ? ' commit' : ' commits') + ' across ' + hnd.paths +
        (hnd.paths === 1 ? ' page' : ' pages') + ', none surviving' +
        (hnd.nights ? ', ' + hnd.nights + ' of them by lantern' : '') + '. ' +
        (hnd.deepest ? 'The deepest of their lost paths: <code>' + esc(hnd.deepest) + '</code>' +
          (hnd.deepestHands > 1 ? ', which ' + hnd.deepestHands + ' hands worked and ' +
            hnd.deepestLost + ' of them lie under it' : '') + '.' : '') +
        '</div></div>';
    }
    h += '</div>';
  }

  h += '<div class="bsec">The whole register &mdash; ' + reg.drownedCount + ' names under the water</div>';
  h += '<div class="regwrap">';
  for (const hnd of reg.hands) {
    const up = visit.raised.has(hnd.name);
    h += '<div class="regline' + (up ? ' raised' : '') + '"><span class="rn">' + esc(hnd.name) +
      '</span><span class="rm">' + hnd.commits + 'c &middot; ' + hnd.paths + 'p &middot; ' +
      esc(hnd.first.slice(0, 7)) + '</span></div>';
  }
  h += '</div>';

  h += '<div class="bsec">The great wrecks</div>';
  h += '<p class="bnote">Dead paths that carry the most lost names. ' +
    reg.wrecksBearingALostName + ' of the ' + commas(reg.deadPaths) +
    ' dead paths bear at least one.</p><ul class="plain" style="font-size:14.5px;line-height:1.8">';
  for (const w of reg.wrecks.slice(0, 8)) {
    h += '<li><code style="font-family:var(--mono);font-size:13px">' + esc(w.path) + '</code> &mdash; ' +
      w.hands + ' hands, ' + w.lost + ' of them lost</li>';
  }
  h += '</ul></div>';
  p.innerHTML = h;
}

/* ============================================================
   THE INDEX AND THE SEARCH: utility never waits on the game
   ============================================================ */
let searchIndex = null;
function buildSearchIndex() {
  searchIndex = world.islands.map(i => ({
    isle: i,
    hay: (i.title + ' ' + i.slug + ' ' + (i.tags || []).join(' ') + ' ' +
      (i.section || '') + ' ' + i.description).toLowerCase(),
    title: i.title.toLowerCase()
  }));
}
function searchPages(q) {
  if (!searchIndex) buildSearchIndex();
  q = q.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const out = [];
  for (const e of searchIndex) {
    let score = 0, ok = true;
    for (const t of terms) {
      const inT = e.title.indexOf(t), inH = e.hay.indexOf(t);
      if (inH < 0) { ok = false; break; }
      if (e.title === t) score += 200;
      else if (inT === 0) score += 90;
      else if (inT > 0) score += 50;
      else if (e.isle.slug.indexOf(t) >= 0) score += 25;
      else score += 8;
    }
    if (!ok) continue;
    score += Math.min(20, e.isle.inbound);
    out.push({ isle: e.isle, score });
  }
  out.sort((a, b) => b.score - a.score || a.isle.title.localeCompare(b.isle.title));
  return out.slice(0, 40);
}
function renderSearchDrop() {
  const d = $('searchdrop');
  const hits = ui.searchHits;
  if (!hits.length) { d.hidden = true; return; }
  d.innerHTML = hits.map((h, i) =>
    '<button class="sr' + (i === ui.searchSel ? ' sel' : '') + '" type="button" data-slug="' + esc(h.isle.slug) + '">' +
    '<div class="st">' + esc(h.isle.title) + '</div><div class="sm">' +
    esc(h.isle.section || 'off soundings') + ' &middot; ' + commas(h.isle.words) + ' words &middot; ' +
    (h.isle.inbound ? h.isle.inbound + ' cite her' : 'dark shore') + ' &middot; ' + esc(h.isle.slug) +
    '</div></button>').join('');
  d.hidden = false;
}

function renderIndex() {
  const p = $('pane-index');
  const groups = new Map();
  for (const s of world.content.order) {
    const i = world.bySlug.get(s);
    if (!i) continue;
    const key = (i.product === 'cloud' ? 'Cloud — ' : 'CMS — ') + (i.section || 'Other pages');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(i);
  }
  let h = '<div class="bscroll">';
  h += '<p class="bnote">All ' + world.islands.length + ' pages, in the order the documentation itself ' +
    'lists them &mdash; the periplus. Click any title to be carried straight there and read it: ' +
    'no crossing, no wind, no waiting. A filled mark means you have already charted her.</p>';
  for (const [key, list] of groups) {
    h += '<div class="bsec">' + esc(key) + ' &middot; ' + list.length + '</div><div class="idxgrid">';
    for (const i of list) {
      h += '<button class="idxrow' + (visit.charted.has(i.slug) ? ' charted' : '') +
        (i.inbound === 0 ? ' dark' : '') + '" type="button" data-slug="' + esc(i.slug) + '">' +
        '<span class="ir-t">' + esc(i.title) + '</span><span class="ir-m">' +
        commas(i.words) + 'w &middot; ' + (i.inbound ? i.inbound + '☉' : 'dark') + '</span></button>';
    }
    h += '</div>';
  }
  h += '</div>';
  p.innerHTML = h;
}

function renderColophon() {
  const reg = world.register;
  const p = $('pane-colophon');
  p.innerHTML = '<div class="bscroll"><div class="colophon">' +
    '<p>This sea is the Strapi documentation. Every island is one page of it: ' +
    world.islands.length + ' pages, laid up as two mains whose provinces are the docs\' own ' +
    'taxonomy - product and section, straight out of the corpus - while the communities of the ' +
    'citation graph shape the districts inside each province, so that pages ' +
    'which cite each other lie within reach of one another.</p>' +
    '<p>Nothing on the screen is decoration. An island\'s size is its word count; its headlands are ' +
    'its <code>h2</code> sections and its knolls its <code>h3</code>s, so you can count the structure of a page ' +
    'off its skyline before you can read a word of it. Its riding lights are the pages that cite it, ' +
    'one lamp each, counted honestly. Its lanterns are night edits recorded in the raw commit log: ' +
    world.nightIsles.length + ' islands in the whole sea have any, and Docker has four. ' +
    'The prevailing wind is the net citation flow between communities, computed from the ' +
    world.interEdges + ' inter-community edges, which is why sailing the way the documentation links ' +
    'is fast and why the ' + world.uncited.length + ' pages nothing cites lie upwind.</p>' +
    '<p>The crew are the people who wrote it: ' + reg.authorsEver + ' hands in the commit log, credited ' +
    'by the names they signed with. Their marks are never altered and your marks are never mixed with ' +
    'theirs &mdash; anything you write is entered as a stranger\'s hand, in your own log, kept in this ' +
    'browser and nowhere else. The one exception is the bottle post: a note you write, seal and toss ' +
    'yourself is carried to the documentation crew &mdash; your words, the waters\' true name, an ' +
    'up-vote, and nothing else.</p>' +
    '<p>The romance this design borrows is the age of sail\'s instruments: the chart, the lead line, ' +
    'the glass, the log book. It borrows none of that era\'s economy, because there is nothing here to ' +
    'take: the islands are pages, nobody lives on them, nobody is displaced, and reading one leaves it ' +
    'exactly as it was for the next ship. The real age of sail also contained slavery, plunder and ' +
    'conquest. This chart does not stage them, and does not pretend they were not there.</p>' +
    '<p>The second voyage taught the sea new truths, all of them the corpus\'s own. The weather is ' +
    'its calendar: the trailing twelvemonth of last edits replayed, a month a minute &mdash; rain where ' +
    'the ink fell thick, squalls where it fell thickest, grey mist on waters long untended, sparkle on ' +
    'fresh ink. The chart you open shows only what your keel has surveyed, the rest by report only ' +
    'until the fog is lifted. The sea state runs with the citations borne into the waters you sail, ' +
    'and the storm-glass reads them before you weigh. At dusk the heavily cited capes burn one ' +
    'lighthouse per twelve citations, and the current waters\' citations hang overhead as a ' +
    'constellation you can lay a course by. A cat lives aboard. She owes you nothing.</p>' +
    '<p class="cred">Data: <code>content.json</code>, <code>graph.json</code>, <code>communities.json</code>, ' +
    '<code>provenance.json</code> and <code>register.json</code>, the last derived by ' +
    '<code>derive-register.js</code> from the repository\'s raw commit log. ' +
    'Deterministic seed ' + SEED + '. No third-party libraries. ' +
    'Sound: see <code>audio/CREDITS.txt</code>.</p>' +
    '</div></div>';
}

/* ============================================================
   THE CHART: a treasure map of the surveyed sea.

   Not a plot. A hand-drawn sheet of vellum in the same iron-gall register as
   the sea on deck, on a bigger sheet:

     - the 27 communities are LANDS. Their coastlines are not drawn by hand and
       they are not circles: a scalar field is raised over the sheet, one soft
       blob per page at the page's own position and sized by its word count,
       and the coastline is the one-contour of that field, pulled out by
       marching squares. Pages that lie together make one shore; a page that
       lies apart makes its own rock. Capes reach out along the community's
       strongest citation lanes, bays are carved where the community's own
       members leave a gap in the ring, and the crag of the coast is the
       community's impurity: a group of one mind keeps a smooth shore, a group
       of several a ragged one.
     - the 234 cited pages are PLACES on those lands - an anchorage at each
       hub, forts where many cite, settlements where many hands worked, wells
       where the page is short, coves elsewhere - with hill hachures where the
       page is long and marsh ticks where it has gone untended.
     - the 50 pages nothing cites are SEA BEASTS in the open water, one apiece,
       each built from its own numbers, each with its name on a banderole.
     - the furniture of a real chart: cartouche, compass rose with fleur-de-lys
       and rhumb lines, a scale bar in words, sailing directions, the visit's
       own track in dotted red with an X at every place read, sea stipple and
       wave hatching, and a torn and scorched vellum edge.

   Every mark on the sheet comes from graph.json, content.json, communities.json
   or provenance.json. Nothing here is decoration invented for its own sake.
   ============================================================ */

const CHART_W = 1400, CHART_H = 810;
const chart = {
  cv: null, g: null, W: CHART_W, H: CHART_H, k: 1, ox: 0, oy: 0,
  hover: null, marks: [], geo: null, sheet: null, dpr: 1, ready: false, dbl: false,
  /* the reading glass over the sheet (owner order: the chart must be zoomable):
     sheet px -> canvas px is  v = p * z + t  */
  z: 1, tx: 0, ty: 0,
  zt: 1, txt: 0, tyt: 0,
  anim: 0, panned: false, gesturing: false,
  zoomCv: null, zoomKey: '', crispT: 0, layoutView: null
};
const CHART_ZMIN = 1, CHART_ZMAX = 9;

/* the sheet's own furniture, in sheet coordinates */
const CART = { x: 34, y: 560, w: 372, h: 218 };          // the cartouche
const KEYB = { x: 1002, y: 480, w: 366, h: 298 };        // the legend
const DIRS = { x: 30, y: 34, w: 300, h: 352 };           // sailing directions + the rumors
const ROSE = { x: 1272, y: 146, r: 62 };                 // the compass rose
const SCAL = { x: 500, y: 740, w: 336, h: 54 };
const STGL = { x: 500, y: 656, w: 336, h: 74 };          // the storm-glass (stage 2)
const KEY_ROW_Y = 96, KEY_ROW_H = 16;   // the legend's rows, pinned so ink and letter agree          // the scale bar
const FURN = [CART, KEYB, DIRS, SCAL, STGL,
  { x: ROSE.x - ROSE.r - 30, y: ROSE.y - ROSE.r - 62, w: (ROSE.r + 30) * 2, h: ROSE.r * 2 + 92 }];

const INK = 'rgba(38,28,17,';
const RED = 'rgba(141,47,34,';
const GRN = 'rgba(46,80,38,';

function chartProject(x, y) { return [chart.ox + x * chart.k, chart.oy + y * chart.k]; }
function angWrap(a) { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; }

function chartFit() {
  const B = world.bounds, pad = 74;
  const sx = (CHART_W - pad * 2) / (B.maxx - B.minx);
  const sy = (CHART_H - pad * 2) / (B.maxy - B.miny);
  chart.k = Math.min(sx, sy);
  chart.ox = CHART_W / 2 - (B.minx + B.maxx) / 2 * chart.k;
  chart.oy = CHART_H / 2 - (B.miny + B.maxy) / 2 * chart.k;
}

/* ---- the view, clamped so the sheet always fills the glass ---- */
function chartClampView() {
  chart.z = clamp(chart.z, CHART_ZMIN, CHART_ZMAX);
  chart.tx = clamp(chart.tx, CHART_W * (1 - chart.z), 0);
  chart.ty = clamp(chart.ty, CHART_H * (1 - chart.z), 0);
}
function chartClampTargets() {
  chart.zt = clamp(chart.zt, CHART_ZMIN, CHART_ZMAX);
  chart.txt = clamp(chart.txt, CHART_W * (1 - chart.zt), 0);
  chart.tyt = clamp(chart.tyt, CHART_H * (1 - chart.zt), 0);
}
/* zoom the TARGET view about a canvas-space point, so the ground under the
   hand stays under the hand */
function chartZoomAbout(cx, cy, zNew) {
  zNew = clamp(zNew, CHART_ZMIN, CHART_ZMAX);
  const sx = (cx - chart.txt) / chart.zt, sy = (cy - chart.tyt) / chart.zt;
  chart.zt = zNew;
  chart.txt = cx - sx * zNew;
  chart.tyt = cy - sy * zNew;
  chartClampTargets();
}
function chartViewIdent() {
  return chart.z < 1.0005 && Math.abs(chart.tx) < 0.05 && Math.abs(chart.ty) < 0.05;
}

/* ---------------- small draughtsman's tools ---------------- */

/* seeded value noise, bilinear with a smoothstep: the crag of a coast */
function makeNoise(tag, cell) {
  const rnd = rngFor(tag);
  const gw = Math.ceil(CHART_W / cell) + 3, gh = Math.ceil(CHART_H / cell) + 3;
  const v = new Float32Array(gw * gh);
  for (let i = 0; i < v.length; i++) v[i] = rnd() * 2 - 1;
  return function (x, y) {
    const fx = x / cell + 1, fy = y / cell + 1;
    let i0 = fx | 0, j0 = fy | 0;
    if (i0 < 0) i0 = 0; if (j0 < 0) j0 = 0;
    if (i0 > gw - 2) i0 = gw - 2; if (j0 > gh - 2) j0 = gh - 2;
    const tx = fx - i0, ty = fy - j0;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const r0 = j0 * gw + i0, r1 = r0 + gw;
    const a = v[r0] + (v[r0 + 1] - v[r0]) * sx;
    const b = v[r1] + (v[r1 + 1] - v[r1]) * sx;
    return a + (b - a) * sy;
  };
}

/* a path laid through points with quadratic midpoints: no polygon corners */
function pathThrough(g, pts, close) {
  const n = pts.length;
  if (n < 2) return;
  if (close) {
    const mx = (pts[n - 1][0] + pts[0][0]) / 2, my = (pts[n - 1][1] + pts[0][1]) / 2;
    g.moveTo(mx, my);
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      g.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
    g.closePath();
  } else {
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      g.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
    g.lineTo(pts[n - 1][0], pts[n - 1][1]);
  }
}

/* the woodcut register: fill a closed shape with parallel burin lines */
function hatchShape(g, pts, ang, gap, col, lw, jit) {
  g.save();
  g.beginPath(); pathThrough(g, pts, true); g.clip();
  let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
  for (const p of pts) {
    if (p[0] < minx) minx = p[0]; if (p[0] > maxx) maxx = p[0];
    if (p[1] < miny) miny = p[1]; if (p[1] > maxy) maxy = p[1];
  }
  const cx = (minx + maxx) / 2, cy = (miny + maxy) / 2;
  const R = Math.hypot(maxx - minx, maxy - miny) / 2 + 3;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  g.strokeStyle = col; g.lineWidth = lw || 0.55;
  g.beginPath();
  for (let d = -R; d <= R; d += gap) {
    const j = jit ? (Math.sin(d * 1.7) * 0.35) : 0;
    const ox = cx + (-sa) * (d + j), oy = cy + ca * (d + j);
    g.moveTo(ox - ca * R, oy - sa * R);
    g.lineTo(ox + ca * R, oy + sa * R);
  }
  g.stroke();
  g.restore();
}

/* an inked line with a hand in it: two passes, the second lighter and offset */
function inkStroke(g, pts, close, w, col, col2) {
  g.beginPath(); pathThrough(g, pts, close);
  g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round';
  g.stroke();
  if (col2) {
    g.save(); g.translate(0.55, 0.55);
    g.beginPath(); pathThrough(g, pts, close);
    g.strokeStyle = col2; g.lineWidth = w * 0.6;
    g.stroke();
    g.restore();
  }
}

function polyArea(p) {
  let a = 0;
  for (let i = 0, n = p.length; i < n; i++) {
    const q = p[(i + 1) % n];
    a += p[i][0] * q[1] - q[0] * p[i][1];
  }
  return a / 2;
}
function polyBBox(p) {
  let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
  for (const q of p) {
    if (q[0] < minx) minx = q[0]; if (q[0] > maxx) maxx = q[0];
    if (q[1] < miny) miny = q[1]; if (q[1] > maxy) maxy = q[1];
  }
  return { minx, maxx, miny, maxy };
}
function pointInPoly(x, y, p, bb) {
  if (bb && (x < bb.minx || x > bb.maxx || y < bb.miny || y > bb.maxy)) return false;
  let inside = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const xi = p[i][0], yi = p[i][1], xj = p[j][0], yj = p[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function decimate(pts, minD, close) {
  const out = [pts[0]];
  const m2 = minD * minD;
  for (let i = 1; i < pts.length; i++) {
    const l = out[out.length - 1];
    const dx = pts[i][0] - l[0], dy = pts[i][1] - l[1];
    if (dx * dx + dy * dy >= m2) out.push(pts[i]);
  }
  if (close && out.length > 2) {
    const a = out[0], b = out[out.length - 1];
    if ((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) < m2) out.pop();
  }
  return out.length >= 3 ? out : pts;
}
function chaikin(pts, iters) {
  let p = pts;
  for (let it = 0; it < iters; it++) {
    const q = [], n = p.length;
    for (let i = 0; i < n; i++) {
      const a = p[i], b = p[(i + 1) % n];
      q.push([a[0] * 0.74 + b[0] * 0.26, a[1] * 0.74 + b[1] * 0.26]);
      q.push([a[0] * 0.26 + b[0] * 0.74, a[1] * 0.26 + b[1] * 0.74]);
    }
    p = q;
  }
  return p;
}

/* ---------------- marching squares over the land field ---------------- */
function marchLand(F, gw, gh, T, CELL) {
  const V0 = gw * gh;
  const segA = [], segB = [];
  const px = new Map();
  function hx(i, j) {
    const k = j * gw + i;
    if (!px.has(k)) {
      const a = F[j * gw + i], b = F[j * gw + i + 1];
      const t = (T - a) / (b - a);
      px.set(k, [(i + t) * CELL, j * CELL]);
    }
    return k;
  }
  function vx(i, j) {
    const k = V0 + j * gw + i;
    if (!px.has(k)) {
      const a = F[j * gw + i], b = F[(j + 1) * gw + i];
      const t = (T - a) / (b - a);
      px.set(k, [i * CELL, (j + t) * CELL]);
    }
    return k;
  }
  for (let j = 0; j < gh - 1; j++) {
    for (let i = 0; i < gw - 1; i++) {
      const f00 = F[j * gw + i], f10 = F[j * gw + i + 1],
        f11 = F[(j + 1) * gw + i + 1], f01 = F[(j + 1) * gw + i];
      let c = 0;
      if (f00 >= T) c |= 1;
      if (f10 >= T) c |= 2;
      if (f11 >= T) c |= 4;
      if (f01 >= T) c |= 8;
      if (c === 0 || c === 15) continue;
      switch (c) {
        case 1: case 14: segA.push(vx(i, j)); segB.push(hx(i, j)); break;
        case 2: case 13: segA.push(hx(i, j)); segB.push(vx(i + 1, j)); break;
        case 3: case 12: segA.push(vx(i, j)); segB.push(vx(i + 1, j)); break;
        case 4: case 11: segA.push(vx(i + 1, j)); segB.push(hx(i, j + 1)); break;
        case 6: case 9: segA.push(hx(i, j)); segB.push(hx(i, j + 1)); break;
        case 7: case 8: segA.push(vx(i, j)); segB.push(hx(i, j + 1)); break;
        case 5: {
          if ((f00 + f10 + f11 + f01) / 4 >= T) {
            segA.push(vx(i, j)); segB.push(hx(i, j + 1));
            segA.push(hx(i, j)); segB.push(vx(i + 1, j));
          } else {
            segA.push(vx(i, j)); segB.push(hx(i, j));
            segA.push(vx(i + 1, j)); segB.push(hx(i, j + 1));
          }
          break;
        }
        case 10: {
          if ((f00 + f10 + f11 + f01) / 4 >= T) {
            segA.push(vx(i, j)); segB.push(hx(i, j));
            segA.push(vx(i + 1, j)); segB.push(hx(i, j + 1));
          } else {
            segA.push(vx(i, j)); segB.push(hx(i, j + 1));
            segA.push(hx(i, j)); segB.push(vx(i + 1, j));
          }
          break;
        }
      }
    }
  }
  const adj = new Map();
  for (let s = 0; s < segA.length; s++) {
    let l = adj.get(segA[s]); if (!l) adj.set(segA[s], l = []); l.push(s);
    l = adj.get(segB[s]); if (!l) adj.set(segB[s], l = []); l.push(s);
  }
  const used = new Uint8Array(segA.length);
  const rings = [];
  for (let s0 = 0; s0 < segA.length; s0++) {
    if (used[s0]) continue;
    used[s0] = 1;
    const ring = [px.get(segA[s0]), px.get(segB[s0])];
    const start = segA[s0];
    let cur = segB[s0];
    for (let guard = 0; guard < 60000; guard++) {
      const list = adj.get(cur);
      let nxt = -1;
      if (list) for (const s of list) if (!used[s]) { nxt = s; break; }
      if (nxt < 0) break;
      used[nxt] = 1;
      const other = segA[nxt] === cur ? segB[nxt] : segA[nxt];
      cur = other;
      if (cur === start) break;
      ring.push(px.get(other));
    }
    if (ring.length >= 9) rings.push(ring);
  }
  return rings;
}

/* ============================================================
   THE SURVEY: everything on the sheet, derived once
   ============================================================ */
function buildChartGeo() {
  if (chart.geo) return chart.geo;
  const t0 = performance.now();
  chartFit();
  const P = (x, y) => [chart.ox + x * chart.k, chart.oy + y * chart.k];
  const geo = { lands: [], rings: [], places: [], beasts: [], rocks: [], lanes: [],
    borders: null, conts: [], decor: [], t: 0 };

  /* --- the three fiercest of the fifty (owner order): the two of greatest
     bulk, and the one with the most arms. Everything else the deep once held
     is now told on the ground itself: dark shores and shoal crosses. --- */
  const un = world.uncited.slice();
  const byWords = un.slice().sort((a, b) => b.words - a.words);
  const byOut = un.slice().sort((a, b) => b.outbound - a.outbound);
  const fierce = [byWords[0]];
  if (byOut[0] && fierce.indexOf(byOut[0]) < 0) fierce.push(byOut[0]);
  for (const I of byWords) { if (fierce.length >= 3) break; if (fierce.indexOf(I) < 0) fierce.push(I); }
  fierce[0]._beastKind = 'cete';                       // her bulk earned the water
  if (fierce[1]) fierce[1]._beastKind = 'kraken';      // her arms did
  if (fierce[2]) fierce[2]._beastKind = 'serpent';     // the next-heaviest coils
  const beastSet = new Set(fierce.map(i => i.slug));
  const places = [], beastIsles = fierce;
  for (const I of world.islands) if (!beastSet.has(I.slug)) places.push(I);

  /* --- how untended is untended: the corpus's own last-touched dates --- */
  const days = s => { const d = Date.parse(s + 'T00:00:00Z'); return isNaN(d) ? 0 : d / 86400000; };
  let newest = 0;
  for (const I of world.islands) newest = Math.max(newest, days(I.last));
  const stale = world.islands.map(I => newest - days(I.last)).sort((a, b) => a - b);
  const STALE_CUT = stale[Math.floor(stale.length * 0.80)] || 400;
  const inb = world.islands.map(i => i.inbound).sort((a, b) => a - b);
  const INB_FORT = Math.max(6, inb[Math.floor(inb.length * 0.90)]);

  /* --- the character of each coast, from the province that keeps it --- */
  const minSepPx = 0.95 / world.nmPerUnit * chart.k;
  const contPx = {};
  for (const key of ['cms', 'cloud']) {
    const K = world.continents[key];
    const p = P(K.x, K.y);
    contPx[key] = { x: p[0], y: p[1], r: K.r * chart.k, n: K.n, provinces: K.provinces };
  }
  const PROV = world.provinces.map((Pv, pi) => {
    const p = P(Pv.x, Pv.y);
    const rnd = rngFor('coast:' + pi + ':' + Pv.hub);
    const K = contPx[Pv.product];
    let ox = p[0] - K.x, oy = p[1] - K.y;
    const om = Math.hypot(ox, oy);
    if (om < 1e-6) { ox = 0; oy = -1; } else { ox /= om; oy /= om; }
    return {
      i: pi, comm: Pv.comm, product: Pv.product, x: p[0], y: p[1],
      /* the name is the taxonomy's own, never a community's (lab law) */
      name: Pv.name || Pv.section,
      size: Pv.size, purity: Pv.purity, hub: Pv.hub, members: Pv.members,
      primary: Pv.primary,
      rpx: (Pv.rmax || Pv.r) * chart.k,
      centDist: om,
      outTh: Math.atan2(oy, ox),
      /* a section of one mind keeps a smooth shore; a mixed one a ragged */
      rug: 0.42 + 1.45 * (1 - Pv.purity),
      m1: 3 + (Pv.size % 5), ph1: rnd() * TAU,
      m2: 7 + (Pv.size % 6), ph2: rnd() * TAU,
      coastal: false, extW: 0, rnd
    };
  });
  /* who holds open coast: a province is coastal when no sister province of
     her own continent stands beyond her on her own bearing */
  for (const A of PROV) {
    let outer = true;
    for (const B of PROV) {
      if (B === A || B.product !== A.product) continue;
      const th = Math.atan2(B.y - contPx[A.product].y, B.x - contPx[A.product].x);
      if (Math.abs(angWrap(th - A.outTh)) < 0.62 && B.centDist > A.centDist + B.rpx * 0.5) { outer = false; break; }
    }
    A.coastal = outer;
  }
  /* the weight of the world that pulls at each province: her external lanes */
  for (const L of world.lanes) {
    if (!L.w) continue;
    for (const A of PROV) if (A.primary && (A.comm === L.i || A.comm === L.j)) A.extW += L.total;
  }

  /* ============ the land field ============ */
  const CELL = 2;
  const gw = Math.floor(CHART_W / CELL) + 1, gh = Math.floor(CHART_H / CELL) + 1;
  const Fld = new Float32Array(gw * gh);
  const OWN = new Int16Array(gw * gh); OWN.fill(-1);
  const BEST = new Float32Array(gw * gh);
  const BLOB = minSepPx * 2.46;
  const AMP = 1.95;

  function splat(px, py, rad, amp, prov) {
    const i0 = Math.max(0, Math.floor((px - rad) / CELL)), i1 = Math.min(gw - 1, Math.ceil((px + rad) / CELL));
    const j0 = Math.max(0, Math.floor((py - rad) / CELL)), j1 = Math.min(gh - 1, Math.ceil((py + rad) / CELL));
    const inv = 1 / (rad * rad);
    for (let j = j0; j <= j1; j++) {
      const dy = j * CELL - py, row = j * gw;
      for (let i = i0; i <= i1; i++) {
        const dx = i * CELL - px;
        const d2 = (dx * dx + dy * dy) * inv;
        if (d2 >= 1) continue;
        const u = 1 - d2, c = amp * u * u;
        const k = row + i;
        Fld[k] += c;
        if (prov >= 0 && c > BEST[k]) { BEST[k] = c; OWN[k] = prov; }
      }
    }
  }

  for (const I of places) {
    const p = P(I.pos.x, I.pos.y);
    I.cx = p[0]; I.cy = p[1];
    /* a page's ground is its word count: the Document Service island is 1.00.
       On a continent every province is full ground; only the pages the data
       isolates keep the lean footing of an offshore isle. */
    const rad = BLOB * (0.78 + 0.62 * (I.mag - 0.44) / 1.41) * (I.prov < 0 ? 0.52 : 0.98);
    I.landRad = rad;
    splat(p[0], p[1], rad, AMP, I.prov >= 0 ? I.prov : -1);
  }
  /* the three beasts keep their true anchorage in mind, for the hand and the tooltip */
  for (const I of beastIsles) { const p = P(I.pos.x, I.pos.y); I.cx = null; I.cy = null; I.truePx = p; }

  /* ============ the knit: one continent is ONE ground ============
     Provinces are stitched along the citation graph itself: a spanning tree
     of the strongest ties gets an isthmus of ground per edge, wide where the
     tie is heavy, a bare neck where the graph thins. */
  const bridges = [];
  for (const key of ['cms', 'cloud']) {
    const list = PROV.filter(A => A.product === key);
    if (list.length < 2) continue;
    const inTree = new Set([list[0].i]);
    const affOf = (A, B) => {
      const L2 = world.lanes.find(L => (L.i === A.comm && L.j === B.comm) || (L.i === B.comm && L.j === A.comm));
      return L2 ? L2.total : 0;
    };
    while (inTree.size < list.length) {
      let best = null, bc = 1e18;
      for (const A of list) {
        if (!inTree.has(A.i)) continue;
        for (const B of list) {
          if (inTree.has(B.i)) continue;
          const aff = affOf(A, B);
          const cost = Math.hypot(A.x - B.x, A.y - B.y) / (1 + Math.log(1 + aff) * 0.9);
          if (cost < bc) { bc = cost; best = [A, B, aff]; }
        }
      }
      if (!best) break;
      inTree.add(best[1].i);
      bridges.push(best);
    }
  }
  for (const [A, B, aff] of bridges) {
    /* the isthmus runs between the two nearest pages of the two provinces */
    let pa = null, pb = null, bd = 1e18;
    for (const ma of A.members) {
      const Ia = world.bySlug.get(ma);
      if (!Ia || Ia.cx == null) continue;
      for (const mb of B.members) {
        const Ib = world.bySlug.get(mb);
        if (!Ib || Ib.cx == null) continue;
        const d = (Ia.cx - Ib.cx) * (Ia.cx - Ib.cx) + (Ia.cy - Ib.cy) * (Ia.cy - Ib.cy);
        if (d < bd) { bd = d; pa = Ia; pb = Ib; }
      }
    }
    if (!pa || !pb) continue;
    const d = Math.sqrt(bd);
    const w = BLOB * (0.40 + 0.30 * Math.min(1, aff / 26));
    const nseg = Math.max(2, Math.ceil(d / (BLOB * 0.45)));
    for (let s = 1; s < nseg; s++) {
      const t = s / nseg;
      splat(pa.cx + (pb.cx - pa.cx) * t, pa.cy + (pb.cy - pa.cy) * t, w, AMP * 0.9,
        t < 0.5 ? A.i : B.i);
    }
  }

  /* capes and bays, on the open coast only, reaching for the sea */
  for (const A of PROV) {
    if (!A.coastal || A.size < 3) continue;
    const R = Math.max(A.rpx, minSepPx * 1.2);
    /* the cape: the province's reach into the world, on her seaward bearing */
    const reachW = Math.min(1, A.extW / 120);
    const nCapes = A.size >= 14 ? 2 : 1;
    for (let cpi = 0; cpi < nCapes; cpi++) {
      const th = A.outTh + (cpi === 0 ? (A.rnd() - 0.5) * 0.7 : (A.rnd() < 0.5 ? -1 : 1) * (0.8 + A.rnd() * 0.5));
      const spit = reachW > 0.45 && cpi === 0;
      const reach = spit ? R * 0.55 + 30 : R * 0.34 + 18;
      const nseg = spit ? 6 : 4;
      for (let s = 1; s <= nseg; s++) {
        const t = s / nseg;
        const d = R * 0.74 + reach * t;
        const w = (spit ? BLOB * 0.44 * (1.05 - t * 0.62) : BLOB * (0.80 - t * 0.44));
        splat(A.x + Math.cos(th) * d, A.y + Math.sin(th) * d, w, AMP * 0.94, A.i);
      }
    }
    /* the bay: where her own members leave the seaward ring thin, the sea gets in */
    const bins = new Array(18).fill(0);
    for (const m of A.members) {
      const I = world.bySlug.get(m);
      if (!I || I.cx == null) continue;
      const th = Math.atan2(I.cy - A.y, I.cx - A.x);
      const r = Math.hypot(I.cx - A.x, I.cy - A.y);
      bins[Math.floor((angWrap(th) + Math.PI) / TAU * 18) % 18] += r / (R + 1);
    }
    let bayBin = -1, bayV = 1e9;
    for (let b = 0; b < 18; b++) {
      const th = b / 18 * TAU - Math.PI + TAU / 36;
      if (Math.abs(angWrap(th - A.outTh)) > 1.35) continue;
      if (bins[b] < bayV) { bayV = bins[b]; bayBin = b; }
    }
    if (bayBin >= 0 && A.size >= 6) {
      const th = (bayBin + 0.5) / 18 * TAU - Math.PI;
      splat(A.x + Math.cos(th) * R * 0.94, A.y + Math.sin(th) * R * 0.94,
        BLOB * (1.0 + 0.45 * A.rnd()), -AMP * 0.62, -1);
    }
  }

  /* ============ the crag: a few pixels of hand on the coastal band ============ */
  const n1 = makeNoise('crag1', 34), n2 = makeNoise('crag2', 16), n3 = makeNoise('crag3', 7);
  for (let j = 0; j < gh; j++) {
    const row = j * gw, y = j * CELL;
    for (let i = 0; i < gw; i++) {
      const k = row + i, f = Fld[k];
      if (f < 0.22 || f > 2.3) continue;
      const w = Math.min(1, (f - 0.22) / 0.35) * Math.max(0, 1 - Math.max(0, f - 1.05) / 1.1);
      if (w <= 0.01) continue;
      const x = i * CELL;
      const c = OWN[k];
      const A = c >= 0 ? PROV[c] : null;
      let d = (n1(x, y) * 0.60 + n2(x, y) * 0.44 + n3(x, y) * 0.34) * (A ? A.rug : 0.7);
      if (A) {
        const th = Math.atan2(y - A.y, x - A.x);
        d += 0.21 * Math.sin(A.m1 * th + A.ph1) + 0.13 * Math.sin(A.m2 * th + A.ph2);
      }
      Fld[k] = f + d * w;
    }
  }

  /* ============ the coastlines ============ */
  const raw = marchLand(Fld, gw, gh, 1.0, CELL);
  const rings = [];
  for (let r of raw) {
    if (r.length < 10) continue;
    let p = decimate(r, 4.4, true);
    if (p.length < 5) continue;
    p = chaikin(p, 2);
    p = decimate(p, 2.4, true);
    const a = Math.abs(polyArea(p));
    if (a < 26) continue;
    /* the hand: a slow wobble along the coast, baked in so fill and ink agree */
    const rnd = rngFor('hand:' + Math.round(p[0][0]) + ':' + Math.round(p[0][1]));
    const ph = rnd() * TAU;
    for (let i = 0; i < p.length; i++) {
      const q = p[i], nx = p[(i + 1) % p.length], pv = p[(i - 1 + p.length) % p.length];
      let tx = nx[0] - pv[0], ty = nx[1] - pv[1];
      const m = Math.hypot(tx, ty) || 1;
      const o = 0.62 * Math.sin(i * 0.44 + ph) + 0.30 * Math.sin(i * 1.31 + ph * 2);
      p[i] = [q[0] + (-ty / m) * o, q[1] + (tx / m) * o];
    }
    rings.push({ pts: p, area: a, bb: polyBBox(p), places: [], dark: null });
  }
  /* ponds: a hole inside a land ring, holding no place and smaller than a
     roadstead, is the marching artifact of two provinces almost touching -
     the ground closes over it. True inland seas (large holes) remain. */
  for (let i = rings.length - 1; i >= 0; i--) {
    const R = rings[i];
    if (R.area >= 2600) continue;
    let inside = false;
    for (const Q of rings) {
      if (Q === R || Q.area <= R.area) continue;
      if (pointInPoly(R.pts[0][0], R.pts[0][1], Q.pts, Q.bb)) { inside = true; break; }
    }
    if (inside) rings.splice(i, 1);
  }
  geo.rings = rings;

  /* which land is which: the places a ring holds name it */
  for (const I of places) {
    let host = null;
    for (const R of rings) {
      if (!pointInPoly(I.cx, I.cy, R.pts, R.bb)) continue;
      if (!host || R.area < host.area) host = R;     // the smallest ring holding it
    }
    if (host) { host.places.push(I); I.ring = host; }
    else { geo.rocks.push(I); }
  }
  /* Naming. A land is not always one province and a province is not always
     one land: on a continent many provinces share the one coast, and a loose
     province may leave a crumb offshore. So the sheet letters GROUPS - a
     province's places on one ring. The largest group of a province carries
     her name - the official section of the docs taxonomy, and nothing else
     (lab law); her offshore crumbs are lettered from their own
     principal page, Isle or Cay or Rock by their size. */
  for (const R of rings) {
    if (!R.places.length) { R.kind = 'rock'; continue; }
    R.kind = 'land';
    const c = polyCentroid(R.pts);
    R.cx = c[0]; R.cy = c[1];
  }
  const groups = [];
  for (const R of rings) {
    if (!R.places.length) continue;
    const by = new Map();
    for (const I of R.places) {
      const c = I.prov >= 0 ? I.prov : (I.nearProv != null ? I.nearProv : -1);
      let l = by.get(c); if (!l) by.set(c, l = []); l.push(I);
    }
    for (const [c, list] of by) {
      if (c < 0) continue;
      let sx = 0, sy = 0;
      for (const I of list) { sx += I.cx; sy += I.cy; }
      groups.push({ prov: c, comm: PROV[c].comm, ring: R, places: list, n: list.length, x: sx / list.length, y: sy / list.length });
    }
  }
  const byProv2 = new Map();
  for (const G of groups) { let l = byProv2.get(G.prov); if (!l) byProv2.set(G.prov, l = []); l.push(G); }
  geo.regions = [];
  for (const [c, list] of byProv2) {
    list.sort((a2, b2) => b2.n - a2.n);
    if (list[0].n >= 2 || PROV[c].primary) {
      list[0].name = PROV[c].name;
      list[0].primary = !!PROV[c].primary;
    }
    for (let n = 1; n < list.length; n++) {
      const G = list[n];
      if (G.n < 2) continue;                       // one page alone keeps only its own name
      G.chief = G.places.slice().sort((p, q) =>
        (q.inbound * 4 + q.words / 300) - (p.inbound * 4 + p.words / 300))[0];
      G.name = G.chief.sidebarLabel;
      G.satellite = true;
      G.suffix = G.ring.area < 420 ? 'Rock' : (G.ring.area < 1800 ? 'Cay' : 'Isle');
    }
    for (const G of list) if (G.name) geo.regions.push(G);
  }
  /* the hub of a province's chief ground is the place her name is anchored to */
  for (const G of geo.regions) {
    G.hub = G.places.find(I => I.slug === PROV[G.prov].hub) || null;
    G.chief = G.chief || G.places.slice().sort((p, q) =>
      (q.inbound * 4 + q.words / 300) - (p.inbound * 4 + p.words / 300))[0];
    const bb = polyBBox(G.places.map(I => [I.cx, I.cy]));
    G.bb = bb;
    G.wide = Math.max(26, bb.maxx - bb.minx);
  }

  geo.PROV = PROV;
  geo.groups = groups;

  /* the two continents, lettered wide across their own ground */
  for (const key of ['cms', 'cloud']) {
    let sx = 0, sy = 0, sn = 0;
    for (const I of places) {
      if (I.product !== key || I.prov < 0) continue;
      sx += I.cx; sy += I.cy; sn++;
    }
    if (!sn) continue;
    geo.conts.push({
      key, name: key === 'cms' ? 'THE CMS MAIN' : 'THE CLOUD MAIN',
      sub: sn + ' charted places',
      x: sx / sn, y: sy / sn, n: sn
    });
  }

  /* ============ the borders: province against province, in hachure ============
     Where two provinces' ground meets, the sheet takes a period border: a
     dotted line with cross-ticks, extracted from the ownership field itself. */
  const bpts = [];
  for (let j = 1; j < gh - 1; j++) {
    const row = j * gw;
    for (let i = 1; i < gw - 1; i++) {
      const k = row + i;
      if (Fld[k] < 1.0) continue;
      const o = OWN[k];
      if (o < 0) continue;
      /* the point sits on a border when a land neighbour answers to another
         province; the tick runs toward that neighbour */
      let nx = 0, ny = 0, hit = 0;
      const kR = k + 1, kD = k + gw;
      if (Fld[kR] >= 1.0 && OWN[kR] >= 0 && OWN[kR] !== o) { nx += 1; hit = 1; }
      if (Fld[kD] >= 1.0 && OWN[kD] >= 0 && OWN[kD] !== o) { ny += 1; hit = 1; }
      if (!hit) continue;
      bpts.push(i * CELL, j * CELL, nx, ny);
    }
  }
  geo.borders = new Float32Array(bpts);

  /* ============ the dark shores: the coast the fifty keep ============ */
  const darkP = places.filter(I => I.inbound === 0 && I.ring);
  for (const R of rings) {
    const mine = darkP.filter(I => I.ring === R);
    if (!mine.length) continue;
    const dark = new Uint8Array(R.pts.length);
    let any = false;
    for (let i = 0; i < R.pts.length; i++) {
      const p = R.pts[i];
      for (const I of mine) {
        const rr = I.landRad * 1.18;
        const dx = p[0] - I.cx, dy = p[1] - I.cy;
        if (dx * dx + dy * dy < rr * rr) { dark[i] = 1; any = true; break; }
      }
    }
    if (any) R.dark = dark;
  }

  /* ============ the places: what each page is, on the ground ============ */
  for (const I of places) {
    const rnd = rngFor('place:' + I.slug);
    const A = I.prov >= 0 ? PROV[I.prov] : null;
    const isHub = A && A.hub === I.slug;
    const staleDays = newest - days(I.last);
    const sz = 3.1 + 4.4 * (I.mag - 0.44) / 1.41;
    let kind;
    if (I.inbound === 0) kind = 'shoal';
    else if (isHub) kind = 'anchorage';
    else if (I.inbound >= INB_FORT) kind = 'fort';
    else if (I.authors.length >= 4) kind = 'town';
    else if (I.code >= 14) kind = 'quarry';
    else if (I.words <= 260) kind = 'well';
    else kind = 'cove';
    geo.places.push(I);
    I.mark = {
      kind, sz,
      hill: I.words >= 1550 ? clamp(I.nH2 || 1, 1, 3) : 0,
      hillH: 5.0 + 7.6 * Math.min(1, (I.words - 1550) / 4200),
      marsh: staleDays >= STALE_CUT && I.words < 900 && kind !== 'shoal',
      houses: clamp(I.authors.length - 2, 2, 5),
      spin: rnd() * TAU,
      score: I.inbound * 4 + I.words / 320 + (isHub ? 60 : 0) + (kind === 'fort' ? 14 : 0)
    };
  }

  /* ============ the deep, and what lives in it ============ */
  layoutBeasts(geo, beastIsles, Fld, gw, gh, CELL);

  /* ============ the sailing routes: the citation flow between lands ============
     the lanes are the provinces' own citations now - counted straight off the
     raw edges when the provinces were laid (world.provLanes) */
  const pl = (world.provLanes || []).map(L => ({
    i: L.i, j: L.j, total: L.total, net: L.ij - L.ji,
    w: Math.abs(L.ij - L.ji) + 0.35 * L.total
  }));
  const sameSea = pl.filter(L =>
    PROV[L.i] && PROV[L.j] && PROV[L.i].product === PROV[L.j].product && L.w > 0)
    .sort((a, b) => b.w - a.w).slice(0, 14);
  for (const L of sameSea) {
    const A = PROV[L.i], B = PROV[L.j];
    geo.lanes.push({ ax: A.x, ay: A.y, bx: B.x, by: B.y, w: L.w, net: L.net });
  }
  /* the straits: the sections that cite across the open water keep a packet
     running between the mains - counted from the cross-product edges */
  let packet = null;
  const crossSea = pl.filter(L =>
    PROV[L.i] && PROV[L.j] && PROV[L.i].product !== PROV[L.j].product)
    .sort((a, b) => b.total - a.total).slice(0, 3);
  for (const L of crossSea) {
    const A = PROV[L.i], B = PROV[L.j];
    const lane = { ax: A.x, ay: A.y, bx: B.x, by: B.y, w: L.total * 2.2, net: 0, strait: true };
    geo.lanes.push(lane);
    if (!packet || L.total > packet.w) packet = { lane, w: L.total };
  }

  /* ============ three easter eggs, placed with restraint ============
     - a tiny packet ship on the strongest strait between the mains
     - a spout on the horizon, at the deepest surveyed water
     - one serpent tail between the waves, in the second-deepest water */
  const deep = geo._deepCands || [];
  const fieldAt2 = (x, y) => {
    const i = Math.min(gw - 1, Math.max(0, Math.round(x / CELL)));
    const j = Math.min(gh - 1, Math.max(0, Math.round(y / CELL)));
    return Fld[j * gw + i];
  };
  if (packet) {
    const L = packet.lane;
    let mx = (L.ax + L.bx) / 2, my = (L.ay + L.by) / 2;
    /* she rides the lane where the lane rides open water */
    for (let t = 0.5, s2 = 0; s2 < 9 && fieldAt2(mx, my) > 0.45; s2++) {
      t += (s2 % 2 ? 1 : -1) * 0.07 * (s2 + 1);
      mx = L.ax + (L.bx - L.ax) * t; my = L.ay + (L.by - L.ay) * t;
    }
    geo.decor.push({ kind: 'ship', x: mx, y: my - 4 });
  }
  /* ============ the rumors leave their marks (owner order) ============
     where a sailor would see them, unlabeled, just drawn: the strange isle
     at the chart edge, a stain of darker water where the sea turns to ink,
     a tiny flotsam mark where the bottle rides. Every position is the
     crossing's own; the isle alone is clamped to the sheet margin, for the
     city stands past the last surveyed water. */
  if (eggs.ready) {
    if (eggs.city) {
      const c2 = P(eggs.city.x, eggs.city.y);
      geo.decor.push({ kind: 'eggisle',
        x: clamp(c2[0], 34, CHART_W - 34), y: clamp(c2[1], 34, CHART_H - 34) });
    }
    if (eggs.ink) {
      const c2 = P(eggs.ink.x, eggs.ink.y);
      geo.decor.push({ kind: 'inkstain', x: c2[0], y: c2[1],
        r: clamp((eggs.ink.rNm || 1.2) / world.nmPerUnit * chart.k, 22, 54) });
    }
    if (eggs.bottle) {
      const c2 = P(eggs.bottle.x, eggs.bottle.y);
      geo.decor.push({ kind: 'flotsam', x: c2[0], y: c2[1] });
    }
  }
  const farFrom = (x, y, list, d) => list.every(q => Math.hypot(q.x - x, q.y - y) > d);
  const avoid = geo.beasts.map(B => ({ x: B.x, y: B.y })).concat(geo.decor);
  let spout = null, tail = null;
  for (const c2 of deep) {
    if (!spout && farFrom(c2.x, c2.y, avoid, 150)) { spout = c2; avoid.push(c2); continue; }
    if (spout && !tail && farFrom(c2.x, c2.y, avoid, 160)) { tail = c2; break; }
  }
  if (spout) geo.decor.push({ kind: 'spout', x: spout.x, y: spout.y });
  if (tail) geo.decor.push({ kind: 'tail', x: tail.x, y: tail.y });

  /* what the pointer can take hold of: every one of the 290 */
  chart.marks.length = 0;
  for (const I of geo.places) chart.marks.push({ isle: I, x: I.cx, y: I.cy, r: Math.max(6.5, I.mark.sz * 1.9) });
  for (const B of geo.beasts) chart.marks.push({ isle: B.isle, x: B.x, y: B.y, r: B.L * 0.36, beast: B });

  geo.field = Fld; geo.gw = gw; geo.gh = gh; geo.cell = CELL;
  geo.stats = { newest, STALE_CUT, INB_FORT, nPlace: places.length, nBeast: beastIsles.length,
    nBorderPts: geo.borders.length / 4, bridges: bridges.length,
    landRings: rings.filter(r => r.places.length).length, rocks: geo.rocks.length };
  geo.t = performance.now() - t0;
  chart.geo = geo;
  return geo;
}

function polyCentroid(p) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, n = p.length; i < n; i++) {
    const q = p[(i + 1) % n];
    const f = p[i][0] * q[1] - q[0] * p[i][1];
    a += f; cx += (p[i][0] + q[0]) * f; cy += (p[i][1] + q[1]) * f;
  }
  a *= 0.5;
  if (Math.abs(a) < 1e-6) return [p[0][0], p[0][1]];
  return [cx / (6 * a), cy / (6 * a)];
}

/* ============================================================
   HERE BE DRAGONS
   The 50 pages nothing cites are not dots on an edge: each is a beast in the
   open water, and the beast is the page. What it becomes is the thing it has
   the most of - bulk for words, arms for the pages it reaches out to, coils
   for its commits, horns and spines for its sections and its code - and every
   number it has goes into the drawing: coils from commits, eyes from night
   edits, bulk from word count, scales from code blocks, fins from the hands
   that kept it. No two are the same drawing.
   ============================================================ */
const BEAST_KINDS = ['cete', 'kraken', 'serpent', 'hornfish'];

function layoutBeasts(geo, isles, F, gw, gh, CELL) {
  if (!isles.length) return;
  const wmin = Math.min(...isles.map(I => I.words)), wmax = Math.max(...isles.map(I => I.words));
  const list = isles.map(I => {
    const rnd = rngFor('beast:' + I.slug);
    const t = (I.words - wmin) / Math.max(1, wmax - wmin);
    /* three, and only three: each takes grand water, cut large */
    const L = 96 + 58 * Math.pow(t, 0.70);
    return {
      isle: I, kind: I._beastKind || 'serpent', L, rnd,
      coils: clamp(Math.round(I.commits * 0.8) + 2, 3, 9),
      arms: clamp(I.outbound + 4, 5, 11),
      eyes: clamp(1 + I.night, 1, 4),
      night: I.night, spines: clamp(I.nH2, 1, 6),
      scales: clamp(Math.round(I.code / 2) + 2, 2, 9),
      fins: clamp(I.authors.length, 1, 4),
      hands: I.authors.length,
      name: shortName(I),
      asp: clamp(1.22 - 0.055 * (I.nH2 || 1) + (rnd() - 0.5) * 0.20, 0.78, 1.28),
      R: 0, x: 0, y: 0, flip: 1
    };
  }).sort((a, b) => b.L - a.L);
  const reach = { cete: 0.50, kraken: 0.52, serpent: 0.42, hornfish: 0.42 };
  for (const B of list) B.R = B.L * reach[B.kind] + 12;

  /* ---- the water: everything the land and the furniture do not hold ---- */
  const GC = 7;
  const cw = Math.ceil(CHART_W / GC), ch = Math.ceil(CHART_H / GC);
  const DT = new Float32Array(cw * ch);
  const BIG = 1e6;
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
    const x = i * GC + GC / 2, y = j * GC + GC / 2;
    const fi = Math.min(gw - 1, Math.round(x / CELL)), fj = Math.min(gh - 1, Math.round(y / CELL));
    let solid = F[fj * gw + fi] >= 0.80;
    if (!solid) for (const R of FURN) {
      if (x > R.x - 12 && x < R.x + R.w + 12 && y > R.y - 12 && y < R.y + R.h + 12) { solid = true; break; }
    }
    if (!solid && (x < 34 || x > CHART_W - 34 || y < 30 || y > CHART_H - 30)) solid = true;
    DT[j * cw + i] = solid ? 0 : BIG;
  }
  const d1 = GC, d2 = GC * 1.4142;
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
    const k = j * cw + i; let v = DT[k];
    if (j > 0) { v = Math.min(v, DT[k - cw] + d1); if (i > 0) v = Math.min(v, DT[k - cw - 1] + d2); if (i < cw - 1) v = Math.min(v, DT[k - cw + 1] + d2); }
    if (i > 0) v = Math.min(v, DT[k - 1] + d1);
    DT[k] = v;
  }
  for (let j = ch - 1; j >= 0; j--) for (let i = cw - 1; i >= 0; i--) {
    const k = j * cw + i; let v = DT[k];
    if (j < ch - 1) { v = Math.min(v, DT[k + cw] + d1); if (i > 0) v = Math.min(v, DT[k + cw - 1] + d2); if (i < cw - 1) v = Math.min(v, DT[k + cw + 1] + d2); }
    if (i < cw - 1) v = Math.min(v, DT[k + 1] + d1);
    DT[k] = v;
  }

  const cand = [];
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
    const d = DT[j * cw + i];
    if (d >= 21 && d < BIG) cand.push({ x: i * GC + GC / 2, y: j * GC + GC / 2, d });
  }
  /* the deepest water, kept for the sparse marks that live out there */
  geo._deepCands = cand.slice().sort((a, b) => b.d - a.d).slice(0, 260);

  const placed = [];
  const CX = CHART_W / 2, CY = CHART_H / 2;
  /* each beast wants the water off her own true anchorage: the reader who
     finds her looks toward the shore she haunts */
  for (const B of list) {
    const p = B.isle.truePx || chartProject(B.isle.pos.x, B.isle.pos.y);
    B.wantTh = Math.atan2(p[1] - CY, p[0] - CX);
  }
  for (const B of list) {
    const want = [CX + Math.cos(B.wantTh) * 640, CY + Math.sin(B.wantTh) * 380];
    let best = null, bc = 1e18;
    for (const c of cand) {
      if (c.d < Math.max(27, B.R * 0.92)) continue;
      let ok = true;
      for (const q of placed) {
        const need = (q.R + B.R) * 1.05;
        if ((q.x - c.x) * (q.x - c.x) + (q.y - c.y) * (q.y - c.y) < need * need) { ok = false; break; }
      }
      if (!ok) continue;
      const dx = c.x - want[0], dy = c.y - want[1];
      const cost = Math.hypot(dx, dy) - Math.min(c.d, B.R * 1.6) * 2.1;
      if (cost < bc) { bc = cost; best = c; }
    }
    if (!best) {
      B.L *= 0.78; B.R = B.L * reach[B.kind] + 9;
      for (const c of cand) {
        if (c.d < Math.max(22, B.R * 0.78)) continue;
        let ok = true;
        for (const q of placed) {
          const need = (q.R + B.R) * 0.80;
          if ((q.x - c.x) * (q.x - c.x) + (q.y - c.y) * (q.y - c.y) < need * need) { ok = false; break; }
        }
        if (!ok) continue;
        const cost = Math.hypot(c.x - want[0], c.y - want[1]);
        if (cost < bc) { bc = cost; best = c; }
      }
    }
    if (!best) { B.dropped = true; continue; }
    B.x = best.x; B.y = best.y;
    B.flip = (best.x < CX ? 1 : -1) * (B.rnd() < 0.26 ? -1 : 1);
    B.rot = (B.rnd() - 0.5) * 0.34;
    placed.push(B);
    geo.beasts.push(B);
  }
}

/* a beast's name, cut to a cartographer's hand */
function shortName(I) {
  let s = I.sidebarLabel || I.title;
  s = s.replace(/\s+provider setup for Users & Permissions$/i, ' provider')
    .replace(/\s+for Users & Permissions$/i, '')
    .replace(/\s+with the Document Service API$/i, '');
  return s;
}

/* ---- a tapering limb: a spine walked forward, with a half-width ---- */
function limb(x, y, ang, curl, len, w0, taper, N) {
  const spine = [], top = [], bot = [];
  let px = x, py = y, a = ang;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    spine.push([px, py]);
    const w = w0 * Math.pow(1 - t, taper);
    top.push([px + Math.cos(a - Math.PI / 2) * w, py + Math.sin(a - Math.PI / 2) * w]);
    bot.push([px + Math.cos(a + Math.PI / 2) * w, py + Math.sin(a + Math.PI / 2) * w]);
    const step = len / N;
    a += curl / N;
    px += Math.cos(a) * step; py += Math.sin(a) * step;
  }
  return { spine, poly: top.concat(bot.reverse()) };
}

let beastLW = 1.0;
function beastBody(g, poly, hatchAng, gap, rug) {
  g.fillStyle = 'rgba(240,231,208,0.62)';
  g.beginPath(); pathThrough(g, poly, true); g.fill();
  hatchShape(g, poly, hatchAng, gap, INK + '0.21)', 0.45, true);
  inkStroke(g, poly, true, beastLW, INK + '0.80)', rug ? INK + '0.16)' : null);
}

function beastEye(g, x, y, r, red) {
  g.fillStyle = 'rgba(244,236,217,0.95)';
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.strokeStyle = INK + '0.9)'; g.lineWidth = 0.85;
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
  g.fillStyle = red ? RED + '0.95)' : INK + '0.92)';
  g.beginPath(); g.arc(x + r * 0.16, y, r * 0.46, 0, TAU); g.fill();
}

/* the ruff of water a beast stands in */
function beastWater(g, x, y, w, rnd) {
  g.strokeStyle = INK + '0.34)'; g.lineWidth = 0.6;
  for (let i = 0; i < 7; i++) {
    const t = (i / 6 - 0.5) * w * 1.15;
    const yy = y + (rnd() - 0.5) * 3.5;
    const l = 4 + rnd() * 7;
    g.beginPath();
    g.moveTo(x + t - l, yy);
    g.quadraticCurveTo(x + t - l / 2, yy - 1.6, x + t, yy);
    g.quadraticCurveTo(x + t + l / 2, yy + 1.6, x + t + l, yy);
    g.stroke();
  }
}

/* ---------------- the four families, drawn from the numbers ---------------- */

function drawBeast(g, B) {
  /* reseed her drawing hand per call: the same beast is cut from the same
     block every time the sheet is re-engraved at a new zoom */
  B.rnd = rngFor('bod:' + B.isle.slug);
  const L = B.L, T = (u, v) => [B.x + B.flip * u * L, B.y + v * L];
  g.save();
  beastWater(g, B.x, B.y + L * 0.30, L * 0.9, rngFor('wat:' + B.isle.slug));
  g.translate(B.x, B.y); g.rotate(B.rot || 0); g.translate(-B.x, -B.y);
  beastLW = clamp(L * 0.0105, 0.62, 1.30);
  if (B.kind === 'serpent') drawSerpent(g, B, T, L);
  else if (B.kind === 'cete') drawCete(g, B, T, L);
  else if (B.kind === 'kraken') drawKraken(g, B, T, L);
  else drawHornfish(g, B, T, L);
  g.restore();
}

/* a horn, a tusk, a spine: a solid tapered thing, ringed the way horn is */
function hornShape(g, x, y, ang, len, w, curl, ringed) {
  const A = limb(x, y, ang, curl, len, w, 1.10, 10);
  g.fillStyle = 'rgba(240,231,208,0.90)';
  g.beginPath(); pathThrough(g, A.poly, true); g.fill();
  inkStroke(g, A.poly, true, 0.85, INK + '0.86)');
  if (ringed) {
    g.strokeStyle = INK + '0.38)'; g.lineWidth = 0.45;
    for (let i = 2; i < 9; i += 2) {
      const p = A.poly[i], q = A.poly[A.poly.length - 1 - i];
      g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke();
    }
  }
  return A;
}

/* a fin: a webbed fan on rays, the way a woodcut fin is cut */
function finFan(g, x, y, ang, len, spread, rays) {
  const pts = [];
  const N = 9;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = ang - spread / 2 + spread * t;
    const l = len * (0.66 + 0.34 * Math.sin(Math.PI * t));
    pts.push([x + Math.cos(a) * l, y + Math.sin(a) * l]);
  }
  pts.push([x, y]);
  g.fillStyle = 'rgba(240,231,208,0.68)';
  g.beginPath(); pathThrough(g, pts, true); g.fill();
  inkStroke(g, pts, true, 0.8, INK + '0.76)');
  g.strokeStyle = INK + '0.52)'; g.lineWidth = 0.55;
  for (let r = 1; r < rays; r++) {
    const t = r / rays;
    const a = ang - spread / 2 + spread * t;
    const l = len * (0.60 + 0.30 * Math.sin(Math.PI * t));
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
}

/* a spout: a plume that widens as it rises, with a bushy crown and its drops */
function spoutPlume(g, x, y, ang, len, w0, curl, rnd) {
  const N = 12, top = [], bot = [];
  let px = x, py = y, a = ang;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const w = w0 * (0.28 + 2.0 * Math.pow(t, 1.5));
    top.push([px + Math.cos(a - Math.PI / 2) * w, py + Math.sin(a - Math.PI / 2) * w]);
    bot.push([px + Math.cos(a + Math.PI / 2) * w, py + Math.sin(a + Math.PI / 2) * w]);
    a += curl / N;
    px += Math.cos(a) * len / N; py += Math.sin(a) * len / N;
  }
  const poly = top.concat(bot.slice().reverse());
  g.fillStyle = 'rgba(243,235,215,0.72)';
  g.beginPath(); pathThrough(g, poly, true); g.fill();
  inkStroke(g, poly, true, 0.7, INK + '0.58)');
  /* the crown, blown apart at the top */
  g.strokeStyle = INK + '0.52)'; g.lineWidth = 0.6;
  const wEnd = w0 * 2.28;
  for (let s = -3; s <= 3; s++) {
    const sa = a + s * 0.26;
    const l = wEnd * (1.5 - Math.abs(s) * 0.18);
    g.beginPath();
    g.moveTo(px - Math.cos(a) * len * 0.06, py - Math.sin(a) * len * 0.06);
    g.quadraticCurveTo(px + Math.cos(sa) * l * 0.55, py + Math.sin(sa) * l * 0.55,
      px + Math.cos(sa + s * 0.16) * l, py + Math.sin(sa + s * 0.16) * l);
    g.stroke();
  }
  g.fillStyle = INK + '0.36)';
  for (let d = 0; d < 6; d++) {
    const sa = a + (rnd() - 0.5) * 1.7, l = wEnd * (1.3 + rnd() * 1.1);
    g.beginPath();
    g.arc(px + Math.cos(sa) * l, py + Math.sin(sa) * l, 0.7 + rnd() * 0.7, 0, TAU);
    g.fill();
  }
}

/* --- the serpent: coils from commits, a reared head, a crest of sections --- */
function drawSerpent(g, B, T0, L) {
  const A = B.asp, T = (u, v) => T0(u, v * A), FL = B.flip;
  const coils = clamp(Math.round(B.coils * 0.62) + 1, 3, 6);
  const wmax = 0.068 + 0.005 * B.fins;
  const amp = 0.150 + 0.038 * (coils / 6);
  const N = 48;
  const sp = [], top = [], bot = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = -0.30 + t * 0.80;
    let y = amp * Math.sin((t - 0.05) * coils * Math.PI + 0.4) * (0.45 + 0.55 * Math.min(1, t * 3.2));
    y -= 0.250 * Math.exp(-Math.pow((t - 0.005) / 0.115, 2));   // the neck rears
    sp.push([x, y]);
  }
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = sp[Math.min(N, i + 1)], b = sp[Math.max(0, i - 1)];
    const tx = a[0] - b[0], ty = a[1] - b[1];
    const m = Math.hypot(tx, ty) || 1;
    const w = wmax * Math.pow(1 - t * 0.96, 0.52);
    top.push(T(sp[i][0] + (-ty / m) * w, sp[i][1] + (tx / m) * w));
    bot.push(T(sp[i][0] + (ty / m) * w, sp[i][1] + (-tx / m) * w));
  }
  const poly = top.concat(bot.slice().reverse());

  /* the tail fin goes on first, so the body laps over its root */
  const tl2 = sp[N], tp = sp[N - 3];
  const ta2 = Math.atan2((tl2[1] - tp[1]) * A, (tl2[0] - tp[0]) * B.flip);
  const tb = T(tl2[0], tl2[1]);
  finFan(g, tb[0], tb[1], ta2, L * 0.175, 2.1, 6);

  beastBody(g, poly, Math.PI / 3.2, 3.0, true);

  /* the crest: one spine per section of the page */
  const at = i => {
    const a = sp[Math.min(N, i + 1)], b = sp[Math.max(0, i - 1)];
    const tx = (a[0] - b[0]) * B.flip, ty = (a[1] - b[1]) * A;
    const m = Math.hypot(tx, ty) || 1;
    return { p: T(sp[i][0], sp[i][1]), tx: tx / m, ty: ty / m, nx: -ty / m, ny: tx / m,
      w: wmax * Math.pow(1 - i / N * 0.96, 0.52) * L * A };
  };
  g.strokeStyle = INK + '0.82)'; g.lineWidth = 0.85;
  g.fillStyle = 'rgba(232,220,190,0.72)';
  for (let s = 0; s < B.spines; s++) {
    const i = Math.round((0.08 + 0.56 * (s / Math.max(1, B.spines - 1))) * N);
    const q = at(i);
    const bx = q.p[0] + q.nx * q.w, by = q.p[1] + q.ny * q.w;
    const h = L * (0.075 + 0.020 * Math.sin(s * 1.7));
    g.beginPath();
    g.moveTo(bx - q.tx * L * 0.028, by - q.ty * L * 0.028);
    g.quadraticCurveTo(bx + q.nx * h - q.tx * L * 0.020, by + q.ny * h - q.ty * L * 0.020,
      bx + q.tx * L * 0.026, by + q.ty * L * 0.026);
    g.closePath(); g.fill(); g.stroke();
  }
  /* scale rows: the code the page carries */
  g.strokeStyle = INK + '0.32)'; g.lineWidth = 0.45;
  for (let s = 0; s < B.scales; s++) {
    const i = Math.round((0.16 + 0.70 * (s / Math.max(1, B.scales - 1))) * N);
    const q = at(i);
    g.beginPath();
    g.moveTo(q.p[0] + q.nx * q.w * 0.92, q.p[1] + q.ny * q.w * 0.92);
    g.quadraticCurveTo(q.p[0] + q.tx * L * 0.022, q.p[1] + q.ty * L * 0.022,
      q.p[0] - q.nx * q.w * 0.92, q.p[1] - q.ny * q.w * 0.92);
    g.stroke();
  }
  /* the pectoral fin of a page many hands kept */
  if (B.hands >= 2) {
    const q = at(6);
    finFan(g, q.p[0] - q.nx * q.w * 0.8, q.p[1] - q.ny * q.w * 0.8,
      Math.atan2(-q.ny, -q.nx) + 0.5 * FL, L * 0.135, 1.3, B.fins + 2);
  }

  /* the head, reared and gaping */
  const h0 = at(0);
  const fa = Math.atan2(-h0.ty, -h0.tx);
  const hb = T(sp[0][0], sp[0][1]);
  const hl = L * 0.245;
  const up = limb(hb[0], hb[1], fa - 0.14 * FL, -0.36 * FL, hl, wmax * L * A * 1.10, 0.80, 12);
  const lo = limb(hb[0], hb[1], fa + 0.50 * FL, 0.44 * FL, hl * 0.78, wmax * L * A * 0.62, 0.92, 10);
  beastBody(g, lo.poly, -Math.PI / 3, 2.4, false);
  beastBody(g, up.poly, -Math.PI / 3, 2.4, false);
  /* the skull behind the jaws, so the head is a head and not a spike */
  const sk = limb(hb[0] + Math.cos(fa) * hl * 0.06, hb[1] + Math.sin(fa) * hl * 0.06,
    fa - 0.14 * FL, -0.30 * FL, hl * 0.56, wmax * L * A * 1.75, 0.30, 9);
  beastBody(g, sk.poly, -Math.PI / 3, 2.6, false);
  /* the mane behind the skull */
  g.strokeStyle = INK + '0.72)'; g.lineWidth = 0.8;
  for (let s = 0; s < 4; s++) {
    const q = at(1 + s);
    const ln = L * (0.095 - s * 0.014);
    const a = fa + FL * (Math.PI * 0.55 + s * 0.16);
    g.beginPath();
    g.moveTo(q.p[0] + q.nx * q.w, q.p[1] + q.ny * q.w);
    g.quadraticCurveTo(q.p[0] + q.nx * q.w + Math.cos(a) * ln * 0.6, q.p[1] + q.ny * q.w + Math.sin(a) * ln * 0.6,
      q.p[0] + q.nx * q.w + Math.cos(a + 0.7 * FL) * ln, q.p[1] + q.ny * q.w + Math.sin(a + 0.7 * FL) * ln);
    g.stroke();
  }
  /* teeth along the two jaws */
  g.fillStyle = 'rgba(247,240,222,0.97)'; g.strokeStyle = INK + '0.8)'; g.lineWidth = 0.5;
  for (const [jaw, sgn, n] of [[up, 1, 4], [lo, -1, 3]]) {
    for (let s = 1; s <= n; s++) {
      const i = Math.round(s / (n + 1) * (jaw.spine.length - 2)) + 1;
      const q0 = jaw.spine[i], q1 = jaw.spine[i + 1];
      const dx = q1[0] - q0[0], dy = q1[1] - q0[1], m = Math.hypot(dx, dy) || 1;
      const px = dy / m * sgn * FL, py = -dx / m * sgn * FL;
      const tw = L * 0.034;
      g.beginPath();
      g.moveTo(q0[0], q0[1]);
      g.lineTo(q0[0] + px * tw, q0[1] + py * tw);
      g.lineTo(q0[0] + dx * 1.1, q0[1] + dy * 1.1);
      g.closePath(); g.fill(); g.stroke();
    }
  }
  /* horns, and the eyes the night put in her */
  for (let s = 0; s < Math.min(3, Math.max(1, B.spines - 1)); s++) {
    const root = up.spine[2];
    const ang = fa + FL * (Math.PI * 0.60 + (s - 1) * 0.30);
    hornShape(g, root[0], root[1], ang, L * (0.115 + 0.018 * s), L * 0.026, -0.7 * FL, true);
  }
  const er = Math.max(1.9, L * 0.040);
  for (let e = 0; e < B.eyes; e++) {
    const i = 2 + e * 2;
    const q0 = sk.spine[Math.min(7, i)], q1 = sk.spine[Math.min(8, i + 1)];
    const dx = q1[0] - q0[0], dy = q1[1] - q0[1], m = Math.hypot(dx, dy) || 1;
    beastEye(g, q0[0] + dy / m * er * 0.95 * FL, q0[1] - dx / m * er * 0.95 * FL, er * (e ? 0.68 : 1), B.night > 0);
  }
  /* the forked tongue of a page much worked */
  if (B.coils >= 6) {
    const q0 = lo.spine[5];
    g.strokeStyle = RED + '0.80)'; g.lineWidth = 0.85;
    const ta = fa + 0.30 * FL, tl = L * 0.13;
    g.beginPath(); g.moveTo(q0[0], q0[1]);
    g.quadraticCurveTo(q0[0] + Math.cos(ta) * tl * 0.6, q0[1] + Math.sin(ta) * tl * 0.6,
      q0[0] + Math.cos(ta - 0.5 * FL) * tl, q0[1] + Math.sin(ta - 0.5 * FL) * tl);
    g.moveTo(q0[0] + Math.cos(ta) * tl * 0.55, q0[1] + Math.sin(ta) * tl * 0.55);
    g.lineTo(q0[0] + Math.cos(ta + 0.42 * FL) * tl, q0[1] + Math.sin(ta + 0.42 * FL) * tl);
    g.stroke();
  }
}

/* --- the cete: bulk from words, a spout raised by the night, tusks --- */
function drawCete(g, B, T0, L) {
  const A = B.asp, T = (u, v) => T0(u, v * A), FL = B.flip;
  const FA = a => FL > 0 ? a : Math.PI - a, FC = c => FL > 0 ? c : -c;
  const rnd = B.rnd, j = () => (rnd() - 0.5) * 0.022;
  /* a great square-headed thing, blunt in the bow, the way the old cuts show
     the physeter: the head is a third of her and it is nearly a wall */
  const key = [
    [-0.500, -0.055], [-0.492, -0.175 + j()], [-0.445, -0.245 + j()],
    [-0.330, -0.272 + j()], [-0.150, -0.262 + j()], [0.040, -0.238 + j()],
    [0.195, -0.190 + j()], [0.295, -0.115 + j()], [0.330, -0.040],
    [0.330, 0.045], [0.280, 0.150 + j()], [0.130, 0.235 + j()],
    [-0.070, 0.268 + j()], [-0.265, 0.258 + j()], [-0.420, 0.215 + j()],
    [-0.492, 0.135 + j()], [-0.505, 0.040]
  ];
  const body = key.map(p => T(p[0], p[1]));

  /* the flukes, laid first so they read as behind her */
  const fl = 0.135 + 0.016 * B.fins;
  const flukes = [
    T(0.30, -0.045), T(0.40, -fl * 1.7), T(0.50, -fl * 1.45), T(0.435, -0.015),
    T(0.50, fl * 1.45), T(0.40, fl * 1.7), T(0.30, 0.045)
  ];
  beastBody(g, flukes, Math.PI / 2.3, 2.5, false);
  g.strokeStyle = INK + '0.34)'; g.lineWidth = 0.45;
  for (let s = 1; s <= 4; s++) {
    const a = T(0.33, -0.02 + s * 0.012), b = T(0.455, -fl * 1.5 + s * fl * 0.62);
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    const c = T(0.455, fl * 1.5 - s * fl * 0.62);
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0], c[1]); g.stroke();
  }

  /* the pectoral paddle */
  const pr = T(-0.215, 0.245);
  finFan(g, pr[0], pr[1], FA(1.20), L * 0.20, 0.9, B.fins + 2);

  beastBody(g, body, Math.PI / 3, 3.4, true);

  /* the belly pleats are the code she carries; the rings, her commits */
  g.save();
  g.beginPath(); pathThrough(g, body, true); g.clip();
  g.strokeStyle = INK + '0.30)'; g.lineWidth = 0.55;
  for (let s = 0; s < B.scales; s++) {
    const t = -0.34 + s * 0.052;
    const a = T(t, 0.11), b = T(t + 0.05, 0.31);
    g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(a[0], b[1], b[0], b[1]); g.stroke();
  }
  g.strokeStyle = INK + '0.20)'; g.lineWidth = 0.5;
  for (let s = 0; s < B.coils; s++) {
    const t = -0.06 + s * 0.046;
    const a = T(t, -0.30), m = T(t + 0.028, 0), b = T(t, 0.30);
    g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(m[0], m[1], b[0], b[1]); g.stroke();
  }
  /* the long grinning mouth, and the teeth in it */
  g.strokeStyle = INK + '0.80)'; g.lineWidth = 1.15;
  let a = T(-0.505, 0.035), b = T(-0.400, 0.150), c = T(-0.190, 0.140);
  g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1], c[0], c[1]); g.stroke();
  g.fillStyle = 'rgba(247,240,222,0.95)'; g.strokeStyle = INK + '0.72)'; g.lineWidth = 0.5;
  for (let s = 0; s < 5; s++) {
    const q = T(-0.435 + s * 0.048, 0.130 - s * 0.004);
    g.beginPath(); g.moveTo(q[0], q[1]);
    g.lineTo(q[0] + FL * L * 0.012, q[1] - L * 0.026);
    g.lineTo(q[0] + FL * L * 0.026, q[1] - L * 0.002);
    g.closePath(); g.fill(); g.stroke();
  }
  /* the crease of the head, where the case ends */
  g.strokeStyle = INK + '0.42)'; g.lineWidth = 0.8;
  a = T(-0.300, -0.268); b = T(-0.268, -0.10); c = T(-0.290, 0.070);
  g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1], c[0], c[1]); g.stroke();
  g.restore();

  /* the dorsal fin, hooked back */
  g.fillStyle = 'rgba(240,231,208,0.72)'; g.strokeStyle = INK + '0.82)'; g.lineWidth = 0.95;
  const df = T(-0.02, -0.286), dt = T(0.075, -0.286 - 0.075 - 0.014 * B.fins), db = T(0.135, -0.262);
  g.beginPath(); g.moveTo(df[0], df[1]);
  g.quadraticCurveTo(dt[0], dt[1], db[0], db[1]);
  g.quadraticCurveTo(T(0.06, -0.278)[0], T(0.06, -0.278)[1], df[0], df[1]);
  g.closePath(); g.fill(); g.stroke();

  /* tusks out of the lower jaw, as long as the page has sections */
  for (let s = 0; s < Math.min(2, B.spines); s++) {
    const r = T(-0.400 + s * 0.055, 0.150);
    hornShape(g, r[0], r[1], FA(-2.62 + s * 0.24), L * (0.105 + 0.016 * B.spines), L * 0.026, FC(1.5), true);
  }

  /* the spout: the higher the night work, the higher she blows */
  const bh = T(-0.375, -0.255);
  const jets = clamp(1 + Math.round(B.spines / 3), 1, 2);
  const hgt = L * (0.42 + 0.13 * B.night);
  for (let s = 0; s < jets; s++) {
    const lean = jets === 1 ? 0 : (s - 0.5) * 0.62;
    spoutPlume(g, bh[0] + s * FL * L * 0.03, bh[1],
      -Math.PI / 2 + FC(lean * 0.30), hgt, L * 0.038, FC(lean * 0.55 + 0.22), rnd);
  }
  /* the eyes the night put in her */
  const er = Math.max(2.0, L * 0.040);
  beastEye(g, ...T(-0.360, -0.070), er, B.night > 0);
  for (let e = 1; e < B.eyes; e++) beastEye(g, ...T(-0.17 + e * 0.115, -0.150), er * 0.60, true);
}

/* --- the many-armed horror: arms from the pages she reaches out to --- */
function drawKraken(g, B, T0, L) {
  const A = B.asp, T = (u, v) => T0(u, v * A), FL = B.flip;
  const rnd = B.rnd;
  /* the arms first, so the mantle sits over their roots */
  const n = B.arms;
  for (let s = 0; s < n; s++) {
    const t = n === 1 ? 0.5 : s / (n - 1);
    const x = -0.16 + 0.32 * t;
    const spread = (t - 0.5) * 2;
    const ang = Math.PI / 2 + spread * 1.42 * FL;
    const hunt = (s === 1 || s === n - 2);
    const ln = L * (0.52 + 0.16 * rnd()) * (hunt ? 1.5 : 1);
    const curl = (spread >= 0 ? 1 : -1) * FL * (1.7 + rnd() * 1.5) * (hunt ? 1.3 : 1);
    const root = T(x, 0.04);
    const Ar = limb(root[0], root[1], ang, curl, ln, L * (0.032 + 0.008 * (1 - Math.abs(spread))), 0.90, 18);
    beastBody(g, Ar.poly, Math.PI / 2.6, 2.3, false);
    if (hunt) {
      /* the club at the end of a hunting arm */
      const tip = Ar.spine[16], pre = Ar.spine[14];
      const aa = Math.atan2(tip[1] - pre[1], tip[0] - pre[0]);
      finFan(g, tip[0], tip[1], aa, L * 0.075, 1.5, 3);
    }
    /* the suckers of a page rich in code */
    g.fillStyle = INK + '0.44)';
    const step = B.scales >= 6 ? 2 : 3;
    for (let d = 3; d < 17; d += step) {
      const p0 = Ar.spine[d], p1 = Ar.spine[d + 1];
      if (!p1) break;
      const dx = p1[0] - p0[0], dy = p1[1] - p0[1], m = Math.hypot(dx, dy) || 1;
      const w = L * 0.032 * Math.pow(1 - d / 18, 0.9) * 0.7;
      g.beginPath();
      g.arc(p0[0] + (-dy / m) * w * FL, p0[1] + (dx / m) * w * FL, Math.max(0.45, L * 0.0075 * (1 - d / 20)), 0, TAU);
      g.fill();
    }
  }
  /* the mantle: a pointed sac with two fins at her crown */
  const mant = [
    T(0, -0.46), T(0.075, -0.40), T(0.135, -0.27), T(0.168, -0.13), T(0.163, 0.01),
    T(0.085, 0.055), T(0, 0.068), T(-0.085, 0.055), T(-0.163, 0.01), T(-0.168, -0.13),
    T(-0.135, -0.27), T(-0.075, -0.40)
  ];
  for (const sgn of [-1, 1]) {
    const fin = [
      T(sgn * 0.03, -0.44), T(sgn * 0.20, -0.40), T(sgn * 0.26, -0.31), T(sgn * 0.115, -0.30)
    ];
    beastBody(g, fin, Math.PI / 2.4, 2.4, false);
  }
  beastBody(g, mant, Math.PI / 2, 3.0, true);
  /* the warts of much handling */
  g.fillStyle = INK + '0.28)';
  const wr = rngFor('wart:' + B.isle.slug);
  for (let s = 0; s < Math.min(30, B.coils * 4); s++) {
    const a = wr() * TAU, r = Math.sqrt(wr());
    const p = T(Math.cos(a) * 0.115 * r, -0.20 + Math.sin(a) * 0.19 * r);
    g.beginPath(); g.arc(p[0], p[1], 0.7, 0, TAU); g.fill();
  }
  /* the beak */
  g.fillStyle = INK + '0.86)';
  const k0 = T(-0.034, 0.048), k1 = T(0.034, 0.048), k2 = T(0, 0.105);
  g.beginPath(); g.moveTo(k0[0], k0[1]); g.lineTo(k1[0], k1[1]); g.lineTo(k2[0], k2[1]); g.closePath(); g.fill();
  /* the eyes */
  const er = Math.max(2.0, L * 0.042);
  beastEye(g, ...T(-0.088, -0.115), er, B.night > 0);
  beastEye(g, ...T(0.088, -0.115), er, B.night > 0);
  for (let e = 2; e < B.eyes + 1; e++) beastEye(g, ...T(-0.05 + (e - 2) * 0.10, -0.30), er * 0.52, true);
}

/* --- the horned fish: horns from her sections, spines from her code --- */
function drawHornfish(g, B, T0, L) {
  const A = B.asp, T = (u, v) => T0(u, v * A), FL = B.flip;
  const FA = a => FL > 0 ? a : Math.PI - a, FC = c => FL > 0 ? c : -c;
  const rnd = B.rnd, j = () => (rnd() - 0.5) * 0.022;
  /* a boar-headed fish: a heavy head, an arched back, a deep belly */
  const key = [
    [-0.470, 0.030 + j()], [-0.455, -0.055 + j()], [-0.395, -0.130 + j()],
    [-0.290, -0.185 + j()], [-0.110, -0.215 + j()], [0.075, -0.180 + j()],
    [0.215, -0.115 + j()], [0.300, -0.045], [0.300, 0.040],
    [0.205, 0.135 + j()], [0.055, 0.205 + j()], [-0.125, 0.222 + j()],
    [-0.300, 0.180 + j()], [-0.425, 0.115 + j()]
  ];
  const body = key.map(p => T(p[0], p[1]));

  /* the tail: a crescent on rays, one ray per commit */
  const tr = T(0.29, 0);
  const tail = [
    T(0.27, -0.055), T(0.395, -0.215), T(0.475, -0.105), T(0.415, 0.000),
    T(0.475, 0.115), T(0.395, 0.230), T(0.27, 0.060)
  ];
  beastBody(g, tail, Math.PI / 2.2, 2.3, false);
  g.strokeStyle = INK + '0.40)'; g.lineWidth = 0.45;
  for (let s = 0; s < B.coils; s++) {
    const t = s / Math.max(1, B.coils - 1);
    const a = T(0.295, -0.035 + t * 0.075);
    const b = T(0.415 + 0.035 * Math.sin(t * Math.PI), -0.185 + t * 0.395);
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  }

  /* pectoral and pelvic fins, one ray per hand that kept her */
  const p1 = T(-0.230, 0.150);
  finFan(g, p1[0], p1[1], FA(0.80), L * 0.215, 1.15, B.fins + 2);
  const p2 = T(0.03, 0.200);
  finFan(g, p2[0], p2[1], FA(1.30), L * 0.150, 1.00, B.fins + 1);

  beastBody(g, body, Math.PI / 3.4, 3.0, true);

  /* rows of scales, one per two code blocks */
  g.save();
  g.beginPath(); pathThrough(g, body, true); g.clip();
  g.strokeStyle = INK + '0.26)'; g.lineWidth = 0.45;
  for (let r = 0; r < B.scales; r++) {
    const x = -0.175 + r * 0.052;
    for (let c = -3; c <= 3; c++) {
      const y = c * 0.052 + (r % 2) * 0.026;
      const a = T(x, y - 0.027), m = T(x + 0.029, y), b = T(x, y + 0.027);
      g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(m[0], m[1], b[0], b[1]); g.stroke();
    }
  }
  /* the gill plate, and the brow that makes a head of the front of her */
  g.strokeStyle = INK + '0.62)'; g.lineWidth = 0.9;
  let a = T(-0.268, -0.180), b = T(-0.222, 0), c = T(-0.268, 0.190);
  g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1], c[0], c[1]); g.stroke();
  g.strokeStyle = INK + '0.40)'; g.lineWidth = 0.7;
  a = T(-0.430, -0.075); b = T(-0.360, -0.135); c = T(-0.300, -0.180);
  g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1], c[0], c[1]); g.stroke();
  g.restore();

  /* the dorsal spines: her code, stood on end */
  g.fillStyle = 'rgba(238,228,203,0.8)'; g.strokeStyle = INK + '0.80)'; g.lineWidth = 0.75;
  for (let s = 0; s < B.scales; s++) {
    const t = s / Math.max(1, B.scales - 1);
    const x = -0.095 + t * 0.300;
    const y = -0.212 + 0.085 * Math.pow(Math.abs(t - 0.20) * 1.35, 1.6);
    const h = 0.070 + 0.038 * Math.sin(t * Math.PI);
    const q0 = T(x - 0.022, y), q1 = T(x + 0.010, y - h), q2 = T(x + 0.026, y);
    g.beginPath(); g.moveTo(q0[0], q0[1]); g.quadraticCurveTo(q1[0], q1[1], q2[0], q2[1]);
    g.closePath(); g.fill(); g.stroke();
  }

  /* the horns: one per heading, solid and swept back over the shoulders */
  const nh = clamp(B.spines, 1, 4);
  for (let s = 0; s < nh; s++) {
    const r = T(-0.395 + s * 0.040, -0.150 - s * 0.014);
    hornShape(g, r[0], r[1], FA(-1.62 + s * 0.17), L * (0.175 - 0.022 * s), L * 0.033, FC(1.10), true);
  }

  /* the mouth, open, with a boar's teeth */
  g.strokeStyle = INK + '0.68)'; g.lineWidth = 0.95;
  a = T(-0.472, 0.028); b = T(-0.415, 0.085); c = T(-0.320, 0.078);
  g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1], c[0], c[1]); g.stroke();
  g.fillStyle = 'rgba(247,240,222,0.97)'; g.lineWidth = 0.5; g.strokeStyle = INK + '0.8)';
  for (let s = 0; s < 3; s++) {
    const q = T(-0.430 + s * 0.036, 0.070);
    g.beginPath(); g.moveTo(q[0], q[1]);
    g.lineTo(q[0] + B.flip * 1.3, q[1] + L * 0.030);
    g.lineTo(q[0] + B.flip * 2.7, q[1]);
    g.closePath(); g.fill(); g.stroke();
  }
  /* a tusk curling up out of the jaw of a page rich in code */
  if (B.scales >= 5) {
    const r = T(-0.430, 0.085);
    hornShape(g, r[0], r[1], FA(-2.70), L * 0.090, L * 0.020, FC(1.5), true);
  }
  const er = Math.max(1.7, L * 0.032);
  beastEye(g, ...T(-0.352, -0.062), er, B.night > 0);
  for (let e = 1; e < B.eyes; e++) beastEye(g, ...T(-0.16 + e * 0.105, -0.085), er * 0.60, true);
}

/* the banderole a beast's name is lettered on */
function drawBanderole(g, cx, cy, w, h) {
  const half = w / 2, s = h / 2, N = 12;
  const top = [], bot = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, x = cx - half + w * t;
    const dy = -Math.sin(t * Math.PI) * 1.3;
    top.push([x, cy - s + dy]); bot.push([x, cy + s + dy]);
  }
  for (const sgn of [-1, 1]) {
    const x0 = sgn < 0 ? cx - half : cx + half;
    const tail = [
      [x0, cy - s], [x0 + sgn * h * 0.85, cy - s - h * 0.30],
      [x0 + sgn * h * 0.52, cy], [x0 + sgn * h * 0.85, cy + s + h * 0.30],
      [x0, cy + s]
    ];
    g.fillStyle = 'rgba(226,214,186,0.86)';
    g.beginPath(); pathThrough(g, tail, true); g.fill();
    inkStroke(g, tail, true, 0.65, INK + '0.50)');
  }
  const poly = top.concat(bot.slice().reverse());
  g.fillStyle = 'rgba(245,237,217,0.90)';
  g.beginPath(); pathThrough(g, poly, true); g.fill();
  inkStroke(g, poly, true, 0.75, INK + '0.58)');
}

/* ============================================================
   THE PLACES ON THE GROUND
   ============================================================ */
function drawHill(g, x, y, n, h, rnd) {
  g.strokeStyle = INK + '0.80)'; g.lineWidth = 0.75; g.fillStyle = 'rgba(224,208,168,0.30)';
  for (let s = 0; s < n; s++) {
    const off = (s - (n - 1) / 2) * (h * 0.92);
    const hh = h * (s === Math.floor(n / 2) ? 1 : 0.74 + 0.2 * ((s * 7 % 5) / 5));
    const bw = hh * 0.80;
    const cx = x + off, cy = y;
    g.beginPath();
    g.moveTo(cx - bw, cy);
    g.quadraticCurveTo(cx - bw * 0.42, cy - hh * 0.92, cx + bw * 0.16, cy - hh);
    g.quadraticCurveTo(cx + bw * 0.62, cy - hh * 0.68, cx + bw, cy);
    g.fill(); g.stroke();
    /* the hachures run down the shaded flank */
    g.lineWidth = 0.5; g.strokeStyle = INK + '0.52)';
    const nh = 2 + Math.round(hh / 2.4);
    for (let q = 1; q <= nh; q++) {
      const t = q / (nh + 1);
      const bx = cx - bw + 2 * bw * t;
      const ty = cy - hh * Math.sin(Math.PI * (0.22 + t * 0.62));
      g.beginPath(); g.moveTo(bx, cy - 0.2); g.lineTo(bx + hh * 0.10, ty + hh * 0.22); g.stroke();
    }
    g.lineWidth = 0.75; g.strokeStyle = INK + '0.80)';
  }
}
function drawMarsh(g, x, y, sz) {
  g.strokeStyle = INK + '0.52)'; g.lineWidth = 0.6;
  g.beginPath();
  for (let r = 0; r < 2; r++) {
    const yy = y - 1.4 + r * 3.2;
    for (let c = 0; c < 3; c++) {
      const xx = x + (c - 1) * sz * 1.05 + (r % 2) * sz * 0.5;
      g.moveTo(xx - sz * 0.42, yy); g.lineTo(xx + sz * 0.42, yy);
      g.moveTo(xx, yy); g.lineTo(xx, yy - 2.1);
    }
  }
  g.stroke();
}
/* three sparse marks in the open water: a packet on the strait, a spout on
   the horizon of the deepest water, one tail between the waves. Small, inked
   in the register of the sheet, never repeated. */
function drawChartDecor(g, D) {
  g.save();
  g.translate(D.x, D.y);
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (D.kind === 'ship') {
    g.strokeStyle = INK + '0.80)'; g.fillStyle = 'rgba(240,231,208,0.85)'; g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(-9, 2.5); g.quadraticCurveTo(0, 7.5, 9, 2.5);
    g.lineTo(7.2, 0.4); g.lineTo(-7.2, 0.4); g.closePath();
    g.fill(); g.stroke();
    g.beginPath();
    g.moveTo(-2.8, 0.4); g.lineTo(-2.8, -10.5);
    g.moveTo(3.4, 0.4); g.lineTo(3.4, -7.6);
    g.stroke();
    g.fillStyle = 'rgba(244,236,217,0.92)';
    g.beginPath(); g.moveTo(-2.2, -9.8); g.quadraticCurveTo(4.2, -7.0, 2.4, -1.6); g.lineTo(-2.2, -1.6); g.closePath();
    g.fill(); g.stroke();
    g.beginPath(); g.moveTo(3.9, -7.0); g.quadraticCurveTo(8.0, -4.6, 6.4, -0.8); g.lineTo(3.9, -0.8); g.closePath();
    g.fill(); g.stroke();
    g.strokeStyle = INK + '0.34)'; g.lineWidth = 0.55;
    g.beginPath();
    g.moveTo(-14, 5.2); g.quadraticCurveTo(-10, 4.0, -6, 5.2);
    g.moveTo(8, 5.6); g.quadraticCurveTo(12, 4.4, 15, 5.6);
    g.stroke();
  } else if (D.kind === 'spout') {
    g.strokeStyle = INK + '0.62)'; g.lineWidth = 0.9;
    g.beginPath(); g.moveTo(-7.5, 3.5); g.quadraticCurveTo(0, -1.5, 7.5, 3.5); g.stroke();
    g.lineWidth = 0.6; g.strokeStyle = INK + '0.55)';
    g.beginPath();
    g.moveTo(-1.5, 0.4); g.quadraticCurveTo(-3.4, -5.5, -6.0, -7.6);
    g.moveTo(-0.6, 0.0); g.quadraticCurveTo(-0.6, -6.5, -1.4, -9.4);
    g.moveTo(0.6, 0.2); g.quadraticCurveTo(2.4, -5.8, 5.2, -8.2);
    g.stroke();
    g.fillStyle = INK + '0.42)';
    for (const [px2, py2] of [[-6.8, -9.0], [-0.8, -11.0], [6.0, -9.8]]) {
      g.beginPath(); g.arc(px2, py2, 0.7, 0, TAU); g.fill();
    }
  } else if (D.kind === 'tail') {
    g.strokeStyle = INK + '0.72)'; g.fillStyle = 'rgba(240,231,208,0.7)'; g.lineWidth = 0.85;
    g.beginPath();
    g.moveTo(-6.5, 3.0);
    g.bezierCurveTo(-3.5, -4.5, 2.5, -7.5, 5.5, -3.5);
    g.bezierCurveTo(7.2, -1.2, 6.2, 0.8, 4.6, 1.6);
    g.bezierCurveTo(5.8, -1.4, 3.8, -4.4, 1.2, -3.0);
    g.bezierCurveTo(-1.8, -1.4, -3.2, 1.4, -3.8, 3.2);
    g.closePath(); g.fill(); g.stroke();
    /* the fluke, thrown clear */
    g.beginPath();
    g.moveTo(4.6, 1.6);
    g.quadraticCurveTo(8.6, 0.4, 10.4, -2.6);
    g.quadraticCurveTo(9.2, 0.8, 10.0, 3.4);
    g.quadraticCurveTo(7.2, 2.6, 4.6, 1.6);
    g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = INK + '0.34)'; g.lineWidth = 0.55;
    g.beginPath();
    g.moveTo(-11, 4.6); g.quadraticCurveTo(-8, 3.4, -5, 4.6);
    g.moveTo(6, 5.0); g.quadraticCurveTo(9, 3.8, 12, 5.0);
    g.stroke();
  } else if (D.kind === 'eggisle') {
    /* the strange isle at the chart edge: a ragged unlabeled islet, hatched
       the way a surveyor marks ground he has not walked */
    const r0 = rngFor('eggisle');
    g.strokeStyle = INK + '0.78)'; g.fillStyle = 'rgba(236,226,200,0.55)'; g.lineWidth = 0.95;
    g.beginPath();
    for (let i = 0; i <= 14; i++) {
      const a = i / 14 * TAU;
      const rr = 7.2 + Math.sin(a * 3 + 1.3) * 1.7 + (r0() - 0.5) * 1.6;
      const px2 = Math.cos(a) * rr * 1.25, py2 = Math.sin(a) * rr * 0.85;
      i ? g.lineTo(px2, py2) : g.moveTo(px2, py2);
    }
    g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = INK + '0.42)'; g.lineWidth = 0.55;
    g.beginPath();
    for (let i = -2; i <= 2; i++) { g.moveTo(i * 2.6 - 2.2, -3.2 + Math.abs(i)); g.lineTo(i * 2.6 + 1.4, 4.0); }
    g.stroke();
    /* one thin unexplained spire, the only thing a glass ever made out */
    g.strokeStyle = INK + '0.66)'; g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(0.5, -2.6); g.lineTo(0.5, -8.6); g.stroke();
  } else if (D.kind === 'inkstain') {
    /* a stain of darker water: three soft washes and a fleck of gall ink */
    const r0 = rngFor('inkstain');
    for (const [ox, oy, f] of [[0, 0, 1], [-D.r * 0.34, D.r * 0.22, 0.62], [D.r * 0.30, -D.r * 0.26, 0.55]]) {
      const rr = D.r * f;
      const gr = g.createRadialGradient(ox, oy, 0, ox, oy, rr);
      gr.addColorStop(0, INK + '0.16)');
      gr.addColorStop(0.72, INK + '0.09)');
      gr.addColorStop(1, INK + '0)');
      g.fillStyle = gr; g.fillRect(ox - rr, oy - rr, rr * 2, rr * 2);
    }
    g.fillStyle = INK + '0.30)';
    for (let i = 0; i < 12; i++) {
      const a = r0() * TAU, d = Math.sqrt(r0()) * D.r * 0.66;
      g.fillRect(Math.cos(a) * d, Math.sin(a) * d * 0.8, 0.7 + r0() * 0.9, 0.6 + r0() * 0.8);
    }
  } else if (D.kind === 'flotsam') {
    /* a tiny flotsam mark: a spar awash and the glint of a bottle */
    g.strokeStyle = INK + '0.70)'; g.lineWidth = 0.9;
    g.beginPath(); g.moveTo(-4.6, 1.4); g.lineTo(4.2, -1.0); g.stroke();
    g.fillStyle = INK + '0.62)';
    g.beginPath(); g.arc(2.6, -1.8, 1.15, 0, TAU); g.fill();
    g.strokeStyle = INK + '0.34)'; g.lineWidth = 0.55;
    g.beginPath();
    g.moveTo(-8.5, 3.4); g.quadraticCurveTo(-5.5, 2.4, -2.5, 3.4);
    g.moveTo(3.0, 3.0); g.quadraticCurveTo(6.0, 2.0, 9.0, 3.0);
    g.stroke();
  }
  g.restore();
}

function drawPlaceMark(g, I) {
  const M = I.mark, x = I.cx, y = I.cy, s = M.sz;
  if (M.hill) drawHill(g, x, y + s * 0.55, M.hill, M.hillH, null);
  if (M.marsh) drawMarsh(g, x, y + s * 0.3, s * 0.9);
  if (M.kind === 'none') return;
  g.lineWidth = 0.85; g.strokeStyle = INK + '0.88)'; g.fillStyle = INK + '0.86)';
  switch (M.kind) {
    case 'anchorage': {
      const h = s * 2.0, w = s * 0.85;
      g.lineWidth = 1.05;
      g.beginPath(); g.arc(x, y - h * 0.52, h * 0.14, 0, TAU); g.stroke();
      g.beginPath();
      g.moveTo(x, y - h * 0.38); g.lineTo(x, y + h * 0.34);
      g.moveTo(x - w, y - h * 0.20); g.lineTo(x + w, y - h * 0.20);
      g.stroke();
      g.beginPath();
      g.moveTo(x - w * 1.05, y + h * 0.10);
      g.quadraticCurveTo(x - w * 0.95, y + h * 0.46, x, y + h * 0.44);
      g.quadraticCurveTo(x + w * 0.95, y + h * 0.46, x + w * 1.05, y + h * 0.10);
      g.stroke();
      break;
    }
    case 'fort': {
      const w = s * 0.92, h = s * 1.15;
      g.fillStyle = 'rgba(233,220,190,0.9)';
      g.beginPath(); g.rect(x - w, y - h * 0.2, w * 2, h); g.fill(); g.stroke();
      g.beginPath();
      for (let m = 0; m < 3; m++) {
        const bx = x - w + (w * 2) * (m / 3) + w * 0.11;
        g.rect(bx, y - h * 0.2 - h * 0.34, w * 0.45, h * 0.34);
      }
      g.fillStyle = 'rgba(233,220,190,0.9)'; g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x + w * 0.72, y - h * 0.54); g.lineTo(x + w * 0.72, y - h * 1.35); g.stroke();
      g.fillStyle = RED + '0.82)';
      g.beginPath(); g.moveTo(x + w * 0.72, y - h * 1.35); g.lineTo(x + w * 2.0, y - h * 1.15);
      g.lineTo(x + w * 0.72, y - h * 0.92); g.closePath(); g.fill();
      break;
    }
    case 'town': {
      const n = M.houses;
      g.fillStyle = 'rgba(233,220,190,0.92)';
      for (let h = 0; h < n; h++) {
        const a = M.spin + h * 2.399963;
        const rr = s * 0.62 * Math.sqrt(h / Math.max(1, n - 1) + 0.18);
        const hx = x + Math.cos(a) * rr, hy = y + Math.sin(a) * rr * 0.72;
        const w = s * 0.46, hh = s * 0.40;
        g.beginPath(); g.rect(hx - w / 2, hy - hh * 0.1, w, hh); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(hx - w * 0.62, hy - hh * 0.1);
        g.lineTo(hx, hy - hh * 0.78); g.lineTo(hx + w * 0.62, hy - hh * 0.1);
        g.closePath(); g.fill(); g.stroke();
      }
      if (I.authors.length >= 7) {
        g.beginPath(); g.moveTo(x, y - s * 1.15); g.lineTo(x, y - s * 1.62);
        g.moveTo(x - s * 0.2, y - s * 1.45); g.lineTo(x + s * 0.2, y - s * 1.45);
        g.stroke();
      }
      break;
    }
    case 'quarry': {
      const w = s * 0.95;
      g.fillStyle = 'rgba(206,188,150,0.55)';
      g.beginPath();
      g.moveTo(x - w, y + w * 0.42);
      g.quadraticCurveTo(x, y - w * 0.85, x + w, y + w * 0.42);
      g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = INK + '0.5)'; g.lineWidth = 0.5;
      for (let q = -2; q <= 2; q++) {
        g.beginPath(); g.moveTo(x + q * w * 0.36, y + w * 0.42);
        g.lineTo(x + q * w * 0.22, y - w * 0.30); g.stroke();
      }
      break;
    }
    case 'well': {
      g.fillStyle = 'rgba(246,238,219,0.9)';
      g.beginPath(); g.arc(x, y, s * 0.52, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = INK + '0.8)';
      g.beginPath(); g.arc(x, y, s * 0.16, 0, TAU); g.fill();
      break;
    }
    case 'shoal': {
      /* the cross of an unsounded danger, at the page's own door */
      g.strokeStyle = INK + '0.90)'; g.lineWidth = 1.1;
      const r2 = s * 0.66;
      g.beginPath();
      g.moveTo(x - r2, y - r2); g.lineTo(x + r2, y + r2);
      g.moveTo(x + r2, y - r2); g.lineTo(x - r2, y + r2);
      g.stroke();
      g.strokeStyle = INK + '0.40)'; g.lineWidth = 0.5;
      g.beginPath(); g.arc(x, y, r2 + 2.2, 0.3, Math.PI - 0.3); g.stroke();
      break;
    }
    default: {
      g.fillStyle = INK + '0.82)';
      g.beginPath(); g.arc(x, y, s * 0.34, 0, TAU); g.fill();
      g.strokeStyle = INK + '0.42)'; g.lineWidth = 0.5;
      g.beginPath(); g.arc(x, y, s * 0.72, -0.9, 2.0); g.stroke();
    }
  }
}

/* ============================================================
   THE SHEET, BAKED ONCE
   ============================================================ */
function tornSheetPath(g) {
  const rnd = rngFor('vellum');
  const pts = [];
  const inset = 15, W = CHART_W, H = CHART_H;
  const push = (x, y) => pts.push([x, y]);
  const edge = (x0, y0, x1, y1, nx, ny) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(6, Math.round(len / 13));
    for (let i = 0; i < n; i++) {
      const t = i / n;
      let o = (rnd() - 0.5) * 3.4 + Math.sin(t * 11 + rnd()) * 1.1;
      if (rnd() < 0.055) o -= 4 + rnd() * 7;          // a tear
      push(x0 + (x1 - x0) * t + nx * o, y0 + (y1 - y0) * t + ny * o);
    }
  };
  edge(inset, inset, W - inset, inset, 0, -1);
  edge(W - inset, inset, W - inset, H - inset, 1, 0);
  edge(W - inset, H - inset, inset, H - inset, 0, 1);
  edge(inset, H - inset, inset, inset, -1, 0);
  return pts;
}

function bakeChartSheet(geo) {
  const dpr = chart.dpr;
  const c = document.createElement('canvas');
  c.width = Math.round(CHART_W * dpr); c.height = Math.round(CHART_H * dpr);
  const g = c.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.lineJoin = 'round'; g.lineCap = 'round';
  paintSheetGeo(g, geo, { x0: -80, y0: -80, x1: CHART_W + 80, y1: CHART_H + 80 }, true);
  chart.sheet = c;
}

/* everything that is ink on the vellum, in sheet coordinates. `vp` is the
   visible window in sheet coordinates and culls only the DRAWING: every seeded
   stream is consumed in full on every run, so the ink never swims between one
   zoom stop and the next. `base` marks the whole-sheet bake, where the sea is
   kept clear under the four table instruments. */
function paintSheetGeo(g, geo, vp, base) {
  const inVp = (x, y, m) => x > vp.x0 - m && x < vp.x1 + m && y > vp.y0 - m && y < vp.y1 + m;

  const vell = tornSheetPath(g);
  /* the sheet's own shadow on the table */
  g.save();
  g.translate(4, 6);
  g.fillStyle = 'rgba(72,56,34,0.20)';
  g.beginPath(); pathThrough(g, vell, true); g.fill();
  g.restore();

  g.save();
  g.beginPath(); pathThrough(g, vell, true); g.clip();

  /* --- the vellum --- */
  g.fillStyle = '#f2e9d3';
  g.fillRect(0, 0, CHART_W, CHART_H);
  if (bake.paper) { g.globalAlpha = 0.78; g.drawImage(bake.paper, 0, 0, CHART_W, CHART_H); g.globalAlpha = 1; }
  const vr = rngFor('age');
  for (let i = 0; i < 34; i++) {
    const x = vr() * CHART_W, y = vr() * CHART_H, r = 40 + vr() * 200;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(168,140,90,0.055)');
    gr.addColorStop(1, 'rgba(168,140,90,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }

  /* --- the rhumb network, radiating from the rose --- */
  const RH = 34;
  for (let i = 0; i < RH; i++) {
    const a = i * TAU / RH - Math.PI / 2;
    const cls = i % 4 === 0 ? 0 : (i % 4 === 2 ? 1 : 2);
    g.strokeStyle = cls === 0 ? INK + '0.13)' : cls === 1 ? GRN + '0.11)' : RED + '0.10)';
    g.lineWidth = cls === 0 ? 0.7 : 0.5;
    g.beginPath();
    g.moveTo(ROSE.x, ROSE.y);
    g.lineTo(ROSE.x + Math.cos(a) * 2100, ROSE.y + Math.sin(a) * 2100);
    g.stroke();
  }
  g.strokeStyle = INK + '0.10)'; g.lineWidth = 0.6;
  for (const r of [230, 470]) { g.beginPath(); g.arc(ROSE.x, ROSE.y, r, 0, TAU); g.stroke(); }

  /* --- the sea: stipple and wave hatching, thicker close inshore --- */
  const F = geo.field, gw = geo.gw, gh = geo.gh, CL = geo.cell;
  const fieldAt = (x, y) => {
    const i = Math.min(gw - 1, Math.max(0, Math.round(x / CL)));
    const j = Math.min(gh - 1, Math.max(0, Math.round(y / CL)));
    return F[j * gw + i];
  };
  const inFurn = (x, y) => {
    for (const R of FURN) if (x > R.x - 8 && x < R.x + R.w + 8 && y > R.y - 8 && y < R.y + R.h + 8) return true;
    return false;
  };
  const sr = rngFor('stipple');
  g.fillStyle = INK + '0.20)';
  for (let y = 20; y < CHART_H - 18; y += 7.5) {
    for (let x = 20; x < CHART_W - 18; x += 7.5) {
      const px = x + (sr() - 0.5) * 6, py = y + (sr() - 0.5) * 6;
      const gate = sr();
      const f = fieldAt(px, py);
      if (f > 0.55) continue;
      if (gate > 0.22 + 0.62 * Math.min(1, f / 0.55)) continue;
      if (base && inFurn(px, py)) continue;
      if (!inVp(px, py, 4)) continue;
      g.fillRect(px, py, 0.85, 0.85);
    }
  }
  /* the swell does not run one way over a whole sea: it turns slowly, and the
     burin follows it, three strokes to a set as a woodcut sea is cut */
  const swell = makeNoise('swell', 230);
  const wr = rngFor('waves');
  g.strokeStyle = INK + '0.26)'; g.lineWidth = 0.5;
  g.beginPath();
  for (let y = 24; y < CHART_H - 20; y += 19) {
    for (let x = 24; x < CHART_W - 20; x += 25) {
      const px = x + (wr() - 0.5) * 19, py = y + (wr() - 0.5) * 15;
      const gate = wr(), rowGate = wr();
      const l = 4.5 + wr() * 6.5;
      const h1 = 1.7 + wr() * 0.7, h2 = 1.7 + wr() * 0.7;
      const f = fieldAt(px, py);
      if (f > 0.30 || gate < 0.34) continue;
      if (base && inFurn(px, py)) continue;
      if (!inVp(px, py, 18)) continue;
      const a = swell(px, py) * 0.42;
      const ca = Math.cos(a), sa = Math.sin(a);
      const rows = f > 0.05 || rowGate < 0.42 ? 2 : 1;
      for (let r = 0; r < rows; r++) {
        const oy = (r - (rows - 1) / 2) * 3.4;
        const ox = -sa * oy, oyy = ca * oy;
        const bx = px + ox, by = py + oyy;
        const h = r === 0 ? h1 : h2;
        g.moveTo(bx - ca * l, by - sa * l);
        g.quadraticCurveTo(bx - ca * l * 0.5 + sa * h, by - sa * l * 0.5 - ca * h, bx, by);
        g.quadraticCurveTo(bx + ca * l * 0.5 - sa * h, by + sa * l * 0.5 + ca * h, bx + ca * l, by + sa * l);
      }
    }
  }
  g.stroke();

  /* --- the sailing routes: the citation flow between the lands --- */
  g.setLineDash([4, 4]);
  for (const L of geo.lanes) {
    const t = Math.min(1, L.w / 26);
    g.strokeStyle = INK + (0.16 + 0.16 * t).toFixed(3) + ')';
    g.lineWidth = 0.55 + 0.5 * t;
    const mx = (L.ax + L.bx) / 2, my = (L.ay + L.by) / 2;
    const dx = L.bx - L.ax, dy = L.by - L.ay;
    const bow = 0.10 * (L.net >= 0 ? 1 : -1);
    g.beginPath();
    g.moveTo(L.ax, L.ay);
    g.quadraticCurveTo(mx - dy * bow, my + dx * bow, L.bx, L.by);
    g.stroke();
  }
  g.setLineDash([]);

  /* --- the coasts --- */
  const rings = geo.rings;
  /* coastal hatching: three broken offsets, the period way of shading a shore */
  for (const R of rings) {
    if (R.area < 40) continue;
    if (!R.bb) R.bb = polyBBox(R.pts);
    if (R.bb.maxx < vp.x0 - 14 || R.bb.minx > vp.x1 + 14 ||
        R.bb.maxy < vp.y0 - 14 || R.bb.miny > vp.y1 + 14) continue;
    const p = R.pts, n = p.length;
    const norms = [];
    for (let i = 0; i < n; i++) {
      const a = p[(i + 1) % n], b = p[(i - 1 + n) % n];
      let tx = a[0] - b[0], ty = a[1] - b[1];
      const m = Math.hypot(tx, ty) || 1;
      norms.push([ty / m, -tx / m]);
    }
    const sign = polyArea(p) > 0 ? -1 : 1;
    let d = 0;
    for (const off of [2.6, 6.0, 10.2]) {
      d++;
      const q = p.map((pt, i) => [pt[0] + norms[i][0] * off * sign, pt[1] + norms[i][1] * off * sign]);
      g.strokeStyle = INK + (0.26 - d * 0.055).toFixed(3) + ')';
      g.lineWidth = d === 1 ? 0.62 : 0.5;
      g.setLineDash(d === 1 ? [] : [6, 4 + d]);
      g.beginPath(); pathThrough(g, q, true); g.stroke();
    }
    g.setLineDash([]);
  }
  /* the land itself */
  const landPath = new Path2D();
  for (const R of rings) {
    const p = R.pts;
    landPath.moveTo((p[p.length - 1][0] + p[0][0]) / 2, (p[p.length - 1][1] + p[0][1]) / 2);
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      landPath.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
    landPath.closePath();
  }
  g.fillStyle = 'rgba(224,203,148,0.95)';
  g.fill(landPath, 'evenodd');
  /* the ground is darker where it meets the water: a broad soft rim, clipped in */
  g.save();
  g.clip(landPath, 'evenodd');
  g.strokeStyle = 'rgba(166,136,82,0.60)'; g.lineWidth = 12;
  g.stroke(landPath);
  g.strokeStyle = 'rgba(142,116,72,0.34)'; g.lineWidth = 3.6;
  g.stroke(landPath);
  g.restore();
  g.strokeStyle = INK + '0.94)'; g.lineWidth = 1.6;
  g.stroke(landPath);
  g.save(); g.translate(0.6, 0.7);
  g.strokeStyle = INK + '0.22)'; g.lineWidth = 0.7;
  g.stroke(landPath);
  g.restore();
  /* the dark shores: where a page no route reaches keeps the coast, the
     burin presses harder and the shore hatch closes up */
  for (const R of rings) {
    if (!R.dark) continue;
    if (R.bb.maxx < vp.x0 - 14 || R.bb.minx > vp.x1 + 14 ||
        R.bb.maxy < vp.y0 - 14 || R.bb.miny > vp.y1 + 14) continue;
    const p = R.pts, n = p.length, D = R.dark;
    const sign = polyArea(p) > 0 ? -1 : 1;
    g.strokeStyle = INK + '0.88)'; g.lineWidth = 2.2;
    g.beginPath();
    for (let i = 0; i < n; i++) {
      const j2 = (i + 1) % n;
      if (!D[i] || !D[j2]) continue;
      g.moveTo(p[i][0], p[i][1]); g.lineTo(p[j2][0], p[j2][1]);
    }
    g.stroke();
    g.strokeStyle = INK + '0.46)'; g.lineWidth = 0.55;
    g.beginPath();
    for (let i = 0; i < n; i += 2) {
      if (!D[i]) continue;
      const a = p[(i + 1) % n], b = p[(i - 1 + n) % n];
      let tx = a[0] - b[0], ty = a[1] - b[1];
      const m = Math.hypot(tx, ty) || 1;
      const nx = ty / m * sign, ny = -tx / m * sign;
      g.moveTo(p[i][0] + nx * 1.2, p[i][1] + ny * 1.2);
      g.lineTo(p[i][0] + nx * 6.4, p[i][1] + ny * 6.4);
    }
    g.stroke();
  }

  /* --- the interior, clipped to the ground --- */
  g.save();
  g.clip(landPath, 'evenodd');
  const dr = rngFor('dunes');
  g.fillStyle = INK + '0.10)';
  for (let i = 0; i < 3400; i++) {
    const x = dr() * CHART_W, y = dr() * CHART_H;
    if (!inVp(x, y, 2)) continue;
    g.fillRect(x, y, 0.8, 0.8);
  }
  /* the province borders, in hachure: a dotted line with cross-ticks, read
     straight out of the ownership field - the graph's own frontier */
  const BP = geo.borders;
  if (BP && BP.length) {
    g.fillStyle = INK + '0.38)';
    for (let b2 = 0; b2 < BP.length; b2 += 4) {
      const x = BP[b2], y = BP[b2 + 1];
      if (!inVp(x, y, 3)) continue;
      if (((b2 >> 2) % 3) === 2) continue;      // a dotted border breathes
      g.fillRect(x - 0.5, y - 0.5, 1.0, 1.0);
    }
    g.strokeStyle = INK + '0.24)'; g.lineWidth = 0.5;
    g.beginPath();
    for (let b2 = 0; b2 < BP.length; b2 += 4) {
      if (((b2 >> 2) % 6) !== 0) continue;
      const x = BP[b2], y = BP[b2 + 1];
      if (!inVp(x, y, 6)) continue;
      let nx = BP[b2 + 2], ny = BP[b2 + 3];
      const m = Math.hypot(nx, ny) || 1; nx /= m; ny /= m;
      g.moveTo(x - nx * 2.8, y - ny * 2.8);
      g.lineTo(x + nx * 2.8, y + ny * 2.8);
    }
    g.stroke();
  }
  for (const I of geo.places) { if (inVp(I.cx, I.cy, 60)) drawPlaceMark(g, I); }
  g.restore();
  for (const I of geo.rocks) {
    if (!inVp(I.cx, I.cy, 12)) continue;
    if (I.inbound === 0) {
      /* shoal water: the period mark for a danger no lead has sounded */
      g.strokeStyle = INK + '0.82)'; g.lineWidth = 0.95;
      g.beginPath();
      for (const [ox, oy] of [[0, 0], [-4.6, 2.6], [4.4, 2.2]]) {
        const x = I.cx + ox, y = I.cy + oy;
        g.moveTo(x - 2.1, y - 2.1); g.lineTo(x + 2.1, y + 2.1);
        g.moveTo(x + 2.1, y - 2.1); g.lineTo(x - 2.1, y + 2.1);
      }
      g.stroke();
      g.strokeStyle = INK + '0.38)'; g.lineWidth = 0.55;
      g.beginPath();
      g.arc(I.cx, I.cy + 4.6, 6.4, 0.35, Math.PI - 0.35);
      g.stroke();
    } else {
      g.fillStyle = INK + '0.8)';
      g.beginPath(); g.arc(I.cx, I.cy, 1.6, 0, TAU); g.fill();
    }
  }

  /* --- the deep, and what lives in it --- */
  for (const B of geo.beasts) {
    if (!inVp(B.x, B.y, B.L * 1.5)) continue;
    drawBeast(g, B);
    if (B.band) {
      const h = B.band.lines.length > 1 ? B.band.fs * 2.5 : B.band.fs * 1.85;
      drawBanderole(g, B.x, B.band.y, B.band.w, h);
    }
  }
  for (const D of geo.decor || []) {
    if (!inVp(D.x, D.y, D.r ? D.r + 24 : 40)) continue;
    drawChartDecor(g, D);
  }

  /* --- the edge: where the sheet was singed, before the furniture goes on --- */
  const er = rngFor('scorch');
  for (const seat of [[1382, 470], [700, 20], [900, 796], [22, 300]]) {
    for (let i = 0; i < 20; i++) {
      const a = er() * TAU, r = er() * 88;
      const x = seat[0] + Math.cos(a) * r * 1.6, y = seat[1] + Math.sin(a) * r * 0.75;
      const rr = 9 + er() * 32;
      const gr = g.createRadialGradient(x, y, 0, x, y, rr);
      gr.addColorStop(0, 'rgba(96,60,24,' + (0.05 + er() * 0.11).toFixed(3) + ')');
      gr.addColorStop(1, 'rgba(96,60,24,0)');
      g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
      /* a burn is fibrous under the glass: charred grain inside the bloom,
         seeded, so the scorch keeps tooth at any magnification */
      for (let k = 0; k < 9; k++) {
        const ga = er() * TAU, gd = er() * rr * 0.8;
        const gx2 = x + Math.cos(ga) * gd, gy2 = y + Math.sin(ga) * gd * 0.8;
        g.fillStyle = 'rgba(70,42,16,' + (0.04 + er() * 0.09).toFixed(3) + ')';
        g.fillRect(gx2, gy2, 0.5 + er() * 1.1, 0.4 + er() * 0.9);
      }
    }
  }

  drawRose(g, ROSE.x, ROSE.y, ROSE.r);
  g.restore();

  /* the torn edge itself, inked and browned */
  g.save();
  g.beginPath(); pathThrough(g, vell, true);
  g.strokeStyle = 'rgba(112,80,40,0.42)'; g.lineWidth = 2.2; g.stroke();
  g.strokeStyle = 'rgba(70,48,22,0.30)'; g.lineWidth = 0.8; g.stroke();
  g.restore();
}

/* the four table instruments stay pinned to the glass while the sheet moves
   beneath them: the readout, the key, the directions and the scale are the
   utility path, and the utility path does not zoom away */
function paintFurniture(g) {
  const solid = !chartViewIdent();
  drawCartouche(g, CART);
  drawPanel(g, KEYB, solid);
  drawPanel(g, DIRS, solid);
  drawKeyGlyphs(g, KEYB);
  drawScaleBar(g, SCAL);
  drawStormGlass(g, STGL);
}

/* the crisp re-engraving of the visible window at the settled view: a gesture
   rides on a cheap blit of the baked sheet, and this replaces it */
function crispChartRender() {
  if (!chart.geo || chartViewIdent()) { chart.zoomKey = ''; return; }
  const dpr = chart.dpr;
  if (!chart.zoomCv) {
    chart.zoomCv = document.createElement('canvas');
    chart.zoomCv.width = Math.round(CHART_W * dpr);
    chart.zoomCv.height = Math.round(CHART_H * dpr);
  }
  const g = chart.zoomCv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, CHART_W, CHART_H);
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.save();
  g.translate(chart.tx, chart.ty);
  g.scale(chart.z, chart.z);
  const vp = {
    x0: -chart.tx / chart.z, y0: -chart.ty / chart.z,
    x1: (CHART_W - chart.tx) / chart.z, y1: (CHART_H - chart.ty) / chart.z
  };
  paintSheetGeo(g, chart.geo, vp, false);
  g.restore();
  chart.zoomKey = chart.z.toFixed(4) + ',' + chart.tx.toFixed(1) + ',' + chart.ty.toFixed(1);
}

/* --- the compass rose: fleur-de-lys at north, thirty-two points, rhumbs --- */
function drawRose(g, cx, cy, R) {
  g.save();
  g.translate(cx, cy);
  /* the water is cleared under her, the way an engraver clears his rose */
  g.fillStyle = 'rgba(243,234,212,0.88)';
  g.beginPath(); g.arc(0, 0, R * 1.22, 0, TAU); g.fill();
  g.strokeStyle = INK + '0.30)'; g.lineWidth = 0.6;
  g.beginPath(); g.arc(0, 0, R * 1.22, 0, TAU); g.stroke();

  /* the graduated rim */
  g.strokeStyle = INK + '0.70)'; g.lineWidth = 1.0;
  g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke();
  g.lineWidth = 0.6;
  g.beginPath(); g.arc(0, 0, R * 0.945, 0, TAU); g.stroke();
  g.lineWidth = 0.5;
  for (let i = 0; i < 128; i++) {
    const a = i * TAU / 128 - Math.PI / 2;
    const l = i % 4 === 0 ? R * 0.055 : R * 0.028;
    g.strokeStyle = INK + (i % 4 === 0 ? '0.62)' : '0.34)');
    g.beginPath();
    g.moveTo(Math.cos(a) * R, Math.sin(a) * R);
    g.lineTo(Math.cos(a) * (R - l), Math.sin(a) * (R - l));
    g.stroke();
  }

  /* thirty-two points, cut as lozenges: half in shadow, half in light */
  const draw = (i, len, wid, dark) => {
    const a = i * TAU / 32 - Math.PI / 2;
    const tip = [Math.cos(a) * len, Math.sin(a) * len];
    const l = [Math.cos(a - wid) * len * 0.34, Math.sin(a - wid) * len * 0.34];
    const r = [Math.cos(a + wid) * len * 0.34, Math.sin(a + wid) * len * 0.34];
    g.beginPath(); g.moveTo(0, 0); g.lineTo(l[0], l[1]); g.lineTo(tip[0], tip[1]); g.closePath();
    g.fillStyle = dark; g.fill();
    g.beginPath(); g.moveTo(0, 0); g.lineTo(r[0], r[1]); g.lineTo(tip[0], tip[1]); g.closePath();
    g.fillStyle = 'rgba(247,240,222,0.96)'; g.fill();
    g.strokeStyle = INK + '0.80)'; g.lineWidth = 0.6;
    g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(tip[0], tip[1]); g.lineTo(r[0], r[1]);
    g.lineTo(0, 0); g.lineTo(l[0], l[1]); g.stroke();
  };
  for (let i = 1; i < 32; i += 2) draw(i, R * 0.58, 0.115, INK + '0.40)');
  for (let i = 2; i < 32; i += 4) draw(i, R * 0.78, 0.175, GRN + '0.55)');
  for (let i = 0; i < 32; i += 4) if (i % 8 !== 0) draw(i, R * 0.86, 0.235, INK + '0.58)');
  for (let i = 0; i < 32; i += 8) draw(i, R * 0.935, 0.300, INK + '0.84)');

  /* the eight-point star at her heart */
  g.fillStyle = 'rgba(247,240,222,0.98)';
  g.beginPath(); g.arc(0, 0, R * 0.115, 0, TAU); g.fill();
  g.strokeStyle = INK + '0.75)'; g.lineWidth = 0.8;
  g.beginPath(); g.arc(0, 0, R * 0.115, 0, TAU); g.stroke();
  g.fillStyle = RED + '0.88)';
  g.beginPath(); g.arc(0, 0, R * 0.042, 0, TAU); g.fill();

  /* the fleur-de-lys, standing clear of the rim above north */
  g.save();
  g.translate(0, -R * 1.20);
  const u = R * 0.086;
  /* her own clear ground, so the rim does not cut through her */
  g.fillStyle = 'rgba(243,234,212,0.92)';
  g.beginPath(); g.ellipse(0, -u * 1.4, u * 3.5, u * 4.6, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(247,240,222,0.97)';
  g.strokeStyle = INK + '0.88)';
  g.lineWidth = 0.9;
  /* the centre petal: a lance with a flared foot */
  g.beginPath();
  g.moveTo(0, -u * 5.2);
  g.bezierCurveTo(u * 1.25, -u * 3.3, u * 1.30, -u * 1.4, u * 0.90, u * 0.20);
  g.lineTo(-u * 0.90, u * 0.20);
  g.bezierCurveTo(-u * 1.30, -u * 1.4, -u * 1.25, -u * 3.3, 0, -u * 5.2);
  g.closePath(); g.fill(); g.stroke();
  /* the two side lobes, curling outward the way a lily's do */
  for (const sg of [-1, 1]) {
    g.beginPath();
    g.moveTo(sg * u * 0.55, -u * 1.05);
    g.bezierCurveTo(sg * u * 2.1, -u * 2.55, sg * u * 3.3, -u * 1.0, sg * u * 2.35, u * 0.35);
    g.bezierCurveTo(sg * u * 1.95, u * 0.95, sg * u * 1.25, u * 0.75, sg * u * 1.05, u * 0.20);
    g.bezierCurveTo(sg * u * 1.55, u * 0.30, sg * u * 2.05, -u * 0.15, sg * u * 1.75, -u * 0.85);
    g.bezierCurveTo(sg * u * 1.45, -u * 1.45, sg * u * 0.95, -u * 1.35, sg * u * 0.62, -u * 0.95);
    g.closePath(); g.fill(); g.stroke();
  }
  /* the band, in gold, and the foot below it */
  g.fillStyle = 'rgba(178,133,44,0.95)';
  g.beginPath(); g.rect(-u * 1.75, u * 0.22, u * 3.5, u * 0.62); g.fill(); g.stroke();
  g.fillStyle = 'rgba(247,240,222,0.97)';
  g.beginPath();
  g.moveTo(-u * 0.52, u * 0.86);
  g.lineTo(u * 0.52, u * 0.86);
  g.bezierCurveTo(u * 0.80, u * 1.7, u * 1.35, u * 2.0, u * 1.65, u * 2.05);
  g.lineTo(-u * 1.65, u * 2.05);
  g.bezierCurveTo(-u * 1.35, u * 2.0, -u * 0.80, u * 1.7, -u * 0.52, u * 0.86);
  g.closePath(); g.fill(); g.stroke();
  /* the iron-gall shading that gives her a face */
  g.fillStyle = INK + '0.20)';
  g.beginPath();
  g.moveTo(0, -u * 5.2);
  g.bezierCurveTo(u * 1.25, -u * 3.3, u * 1.30, -u * 1.4, u * 0.90, u * 0.20);
  g.lineTo(u * 0.09, u * 0.20);
  g.lineTo(u * 0.09, -u * 4.8);
  g.closePath(); g.fill();
  g.restore();

  /* the small cross the old roses put on the eastern point, toward the Levant */
  g.save();
  g.translate(R * 1.05, 0);
  g.strokeStyle = INK + '0.80)'; g.lineWidth = 1.0;
  g.beginPath();
  g.moveTo(0, -R * 0.085); g.lineTo(0, R * 0.085);
  g.moveTo(-R * 0.052, -R * 0.030); g.lineTo(R * 0.052, -R * 0.030);
  g.stroke();
  g.restore();
  g.restore();
}

/* --- the cartouche, and the plainer panels --- */
function drawCartouche(g, B) {
  const x = B.x, y = B.y, w = B.w, h = B.h;
  const r = 13;
  const outer = [];
  const N = 22;
  const rnd = rngFor('cartouche');
  const edge = (x0, y0, x1, y1) => {
    for (let i = 0; i < N; i++) {
      const t = i / N;
      outer.push([x0 + (x1 - x0) * t + (rnd() - 0.5) * 0.9, y0 + (y1 - y0) * t + (rnd() - 0.5) * 0.9]);
    }
  };
  edge(x + r, y, x + w - r, y);
  outer.push([x + w, y + r * 0.3], [x + w + 5, y + r], [x + w, y + r * 1.9]);
  edge(x + w, y + r * 2, x + w, y + h - r * 2);
  outer.push([x + w, y + h - r * 1.9], [x + w + 5, y + h - r], [x + w, y + h - r * 0.3]);
  edge(x + w - r, y + h, x + r, y + h);
  outer.push([x, y + h - r * 0.3], [x - 5, y + h - r], [x, y + h - r * 1.9]);
  edge(x, y + h - r * 2, x, y + r * 2);
  outer.push([x, y + r * 1.9], [x - 5, y + r], [x, y + r * 0.3]);

  g.fillStyle = 'rgba(246,239,221,0.93)';
  g.beginPath(); pathThrough(g, outer, true); g.fill();
  inkStroke(g, outer, true, 1.5, INK + '0.82)', INK + '0.20)');
  g.strokeStyle = INK + '0.5)'; g.lineWidth = 0.7;
  g.strokeRect(x + 6, y + 6, w - 12, h - 12);
  g.strokeStyle = INK + '0.28)'; g.lineWidth = 0.5;
  g.strokeRect(x + 9.5, y + 9.5, w - 19, h - 19);
  /* corner curls */
  g.strokeStyle = INK + '0.62)'; g.lineWidth = 0.9;
  for (const [sx, sy, cx0, cy0] of [[1, 1, x, y], [-1, 1, x + w, y], [1, -1, x, y + h], [-1, -1, x + w, y + h]]) {
    g.beginPath();
    g.moveTo(cx0 + sx * 4, cy0 + sy * 17);
    g.quadraticCurveTo(cx0 + sx * 4, cy0 + sy * 4, cx0 + sx * 17, cy0 + sy * 4);
    g.stroke();
    g.beginPath();
    g.arc(cx0 + sx * 10, cy0 + sy * 10, 3.2, 0, TAU);
    g.stroke();
  }
  /* a scallop over the head of the cartouche */
  const scx = x + w / 2, scy = y - 1;
  g.fillStyle = 'rgba(240,231,208,0.96)'; g.strokeStyle = INK + '0.7)'; g.lineWidth = 0.85;
  g.beginPath(); g.arc(scx, scy, 15, Math.PI, TAU); g.closePath(); g.fill(); g.stroke();
  g.lineWidth = 0.6; g.strokeStyle = INK + '0.5)';
  for (let i = 1; i < 7; i++) {
    const a = Math.PI + i * Math.PI / 7;
    g.beginPath(); g.moveTo(scx, scy); g.lineTo(scx + Math.cos(a) * 14, scy + Math.sin(a) * 14); g.stroke();
  }
  /* the swag under its foot */
  g.strokeStyle = INK + '0.55)'; g.lineWidth = 0.9;
  g.beginPath();
  g.moveTo(x + w * 0.28, y + h + 1);
  g.quadraticCurveTo(x + w * 0.5, y + h + 13, x + w * 0.72, y + h + 1);
  g.stroke();
  g.beginPath(); g.arc(x + w * 0.5, y + h + 11.5, 2.4, 0, TAU); g.stroke();
}

function drawKeyGlyphs(g, B) {
  const x = B.x + 22;
  const y0 = B.y + KEY_ROW_Y;
  const rows = ['anchorage', 'fort', 'town', 'hill', 'shoal', 'dark', 'x'];
  rows.forEach((k, i) => {
    const y = y0 + i * KEY_ROW_H;
    if (k === 'x') {
      g.strokeStyle = RED + '0.88)'; g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x - 4, y - 4); g.lineTo(x + 4, y + 4);
      g.moveTo(x + 4, y - 4); g.lineTo(x - 4, y + 4);
      g.stroke();
      return;
    }
    if (k === 'shoal') {
      g.strokeStyle = INK + '0.90)'; g.lineWidth = 1.1;
      g.beginPath();
      g.moveTo(x - 3, y - 3); g.lineTo(x + 3, y + 3);
      g.moveTo(x + 3, y - 3); g.lineTo(x - 3, y + 3);
      g.stroke();
      g.strokeStyle = INK + '0.40)'; g.lineWidth = 0.5;
      g.beginPath(); g.arc(x, y, 5.4, 0.3, Math.PI - 0.3); g.stroke();
      return;
    }
    if (k === 'dark') {
      g.strokeStyle = INK + '0.88)'; g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(x - 6, y + 1); g.quadraticCurveTo(x, y - 2.5, x + 6, y + 1); g.stroke();
      g.strokeStyle = INK + '0.46)'; g.lineWidth = 0.55;
      g.beginPath();
      for (let q = -2; q <= 2; q++) {
        g.moveTo(x + q * 2.6, y + 0.4 - Math.abs(q) * 0.4);
        g.lineTo(x + q * 2.6 + 1.2, y + 4.6);
      }
      g.stroke();
      return;
    }
    const fake = {
      cx: x, cy: y, authors: ['a', 'b', 'c', 'd'],
      mark: {
        kind: (k === 'hill' || k === 'marsh') ? 'none' : k, sz: 4.0,
        hill: k === 'hill' ? 2 : 0, hillH: 6.2, marsh: k === 'marsh',
        houses: 3, spin: 0.8
      }
    };
    drawPlaceMark(g, fake);
  });
}

function drawPanel(g, B, solid) {
  g.fillStyle = solid ? 'rgba(245,238,220,0.97)' : 'rgba(245,238,220,0.86)';
  g.fillRect(B.x, B.y, B.w, B.h);
  g.strokeStyle = INK + '0.62)'; g.lineWidth = 1.05;
  g.strokeRect(B.x, B.y, B.w, B.h);
  g.strokeStyle = INK + '0.30)'; g.lineWidth = 0.55;
  g.strokeRect(B.x + 4, B.y + 4, B.w - 8, B.h - 8);
  g.strokeStyle = INK + '0.6)'; g.lineWidth = 0.9;
  for (const [sx, sy, cx0, cy0] of [[1, 1, B.x, B.y], [-1, 1, B.x + B.w, B.y], [1, -1, B.x, B.y + B.h], [-1, -1, B.x + B.w, B.y + B.h]]) {
    g.beginPath();
    g.moveTo(cx0 + sx * 0, cy0 + sy * 11);
    g.lineTo(cx0 + sx * 0, cy0 + sy * 0);
    g.lineTo(cx0 + sx * 11, cy0 + sy * 0);
    g.stroke();
  }
}

function drawScaleBar(g, B) {
  g.fillStyle = chartViewIdent() ? 'rgba(244,236,216,0.72)' : 'rgba(244,236,216,0.95)';
  g.fillRect(B.x + 4, B.y - 2, B.w - 8, B.h + 4);
  g.strokeStyle = INK + '0.30)'; g.lineWidth = 0.7;
  g.strokeRect(B.x + 4, B.y - 2, B.w - 8, B.h + 4);
  const nmPerPx = world.nmPerUnit / (chart.k * chart.z);
  /* the widest round span the box will hold: lean in and the scale re-letters */
  let span = 1;
  for (const s of [40, 20, 12, 8, 4, 2, 1]) { if (s / nmPerPx <= B.w - 40) { span = s; break; } }
  const len = span / nmPerPx;
  const x0 = B.x + (B.w - len) / 2, y0 = B.y + 20, h = 7;
  g.strokeStyle = INK + '0.85)'; g.lineWidth = 0.9;
  g.strokeRect(x0, y0, len, h);
  g.fillStyle = INK + '0.85)';
  for (let i = 0; i < 4; i++) if (i % 2 === 1) g.fillRect(x0 + len * i / 4, y0, len / 4, h);
  /* the first division subdivided, as a chart's scale is */
  g.lineWidth = 0.6;
  for (let i = 1; i < 5; i++) {
    const x = x0 + (len / 4) * (i / 5);
    g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + h); g.stroke();
  }
  g.lineWidth = 0.8;
  for (let i = 0; i <= 4; i++) {
    const x = x0 + len * i / 4;
    g.beginPath(); g.moveTo(x, y0 - 4); g.lineTo(x, y0 + h + 4); g.stroke();
  }
  chart.scaleGeom = { x0, y0, len, span };
}

/* ============================================================
   THE LETTERING: every word on the sheet is DOM, and stays crisp
   ============================================================ */
const CFONT = '"Iowan Old Style", "Palatino", "Palatino Linotype", Georgia, serif';
let _meas = null;
function textW(text, px, style, spacing) {
  if (!_meas) _meas = document.createElement('canvas').getContext('2d');
  _meas.font = (style || '') + ' ' + px + 'px ' + CFONT;
  return _meas.measureText(text).width + (spacing || 0) * Math.max(0, text.length - 1);
}

function measureBands(geo) {
  for (const B of geo.beasts) {
    const cap = Math.max(62, B.L * 1.30);
    let fs = clamp(B.L * 0.088, 6.2, 9.6);
    let lines = [B.name];
    let w = textW(B.name, fs, 'italic', 0);
    while (w > cap && fs > 6.0) { fs -= 0.3; w = textW(B.name, fs, 'italic', 0); }
    if (w > cap && B.name.indexOf(' ') > 0) {
      /* two lines, broken at the space nearest the middle */
      const parts = B.name.split(' ');
      let best = 1, bd = 1e9;
      for (let i = 1; i < parts.length; i++) {
        const a = parts.slice(0, i).join(' '), b = parts.slice(i).join(' ');
        const d = Math.abs(textW(a, fs, 'italic', 0) - textW(b, fs, 'italic', 0));
        if (d < bd) { bd = d; best = i; }
      }
      lines = [parts.slice(0, best).join(' '), parts.slice(best).join(' ')];
      w = Math.max(textW(lines[0], fs, 'italic', 0), textW(lines[1], fs, 'italic', 0));
    }
    B.band = { fs, lines, w: w + fs * 2.2, y: B.y + B.L * 0.44 + (lines.length > 1 ? 6 : 3) };
  }
}

function layoutChartDom() {
  const geo = chart.geo, lab = $('chartlabels'), cv = chart.cv;
  const rect = cv.getBoundingClientRect();
  const host = lab.parentElement.getBoundingClientRect();
  const S = rect.width / CHART_W || 1;
  const dx = rect.left - host.left, dy = rect.top - host.top;
  const Z = chart.z, TX = chart.tx, TY = chart.ty;
  const vx = x => x * Z + TX, vy = y => y * Z + TY;
  const inView = (x, y, m) => x > -m && x < CHART_W + m && y > -m && y < CHART_H + m;
  /* free names keep a reading size: they grow only a little as the hand leans
     in, while the ink beneath them grows with the sheet */
  const zf = Math.pow(Z, 0.24);
  const boxes = [];
  const geoHtml = [], pinHtml = [];
  const hit = b => boxes.some(q => b.x0 < q.x1 && b.x1 > q.x0 && b.y0 < q.y1 && b.y1 > q.y0);
  /* the torn-edge law: no free name letters off the sheet. The vellum's
     interior in view coordinates - inset 15 plus clear water off the tear */
  const shm = 21;
  const shX0 = vx(shm), shX1 = vx(CHART_W - shm), shY0 = vy(shm), shY1 = vy(CHART_H - shm);
  const onSheet = b => b.x0 >= shX0 && b.x1 <= shX1 && b.y0 >= shY0 && b.y1 <= shY1;
  const seatOnSheet = (x, y, w, h) => ({
    x: shX1 - shX0 > w ? clamp(x, shX0 + w / 2, shX1 - w / 2) : x,
    y: shY1 - shY0 > h ? clamp(y, shY0 + h / 2, shY1 - h / 2) : y });
  const put = (arr, cls, text, x, y, w, h, style, attrs) => {
    boxes.push({ x0: x - w / 2, x1: x + w / 2, y0: y - h / 2, y1: y + h / 2 });
    arr.push('<div class="' + cls + '" ' + (attrs || '') + 'style="left:' + (dx + x * S).toFixed(1) + 'px;top:' +
      (dy + y * S).toFixed(1) + 'px;' + (style || '') + '">' + text + '</div>');
  };
  for (const R of FURN) boxes.push({ x0: R.x - 4, x1: R.x + R.w + 4, y0: R.y - 4, y1: R.y + R.h + 4 });

  /* the rose and her letters ride the sheet: their ground is claimed FIRST,
     in view coordinates, so no free name ever letters across them */
  const roseLetters = [];
  {
    const rr = (ROSE.r + 10) * Z;
    boxes.push({ x0: vx(ROSE.x) - rr, x1: vx(ROSE.x) + rr, y0: vy(ROSE.y) - rr, y1: vy(ROSE.y) + rr });
    for (const [t, a] of [['E', 0], ['S', Math.PI / 2], ['W', Math.PI]]) {
      const r = ROSE.r + 24;
      const rx = vx(ROSE.x + Math.cos(a) * r), ry = vy(ROSE.y + Math.sin(a) * r);
      if (!inView(rx, ry, 60)) continue;
      const lw = 11 * Z * 1.1, lh = 11 * Z * 1.2;
      boxes.push({ x0: rx - lw / 2 - 3, x1: rx + lw / 2 + 3, y0: ry - lh / 2 - 3, y1: ry + lh / 2 + 3 });
      roseLetters.push([t, rx, ry]);
    }
  }

  /* --- the beasts' banderoles: lettering ON the ink, so it rides the zoom --- */
  for (const B of geo.beasts) {
    if (fogHides(B.isle)) continue;
    const bd = B.band;
    const bx = vx(B.x), by = vy(bd.y);
    if (!inView(bx, by, B.L * Z + 60)) continue;
    const fs = bd.fs * Z, lh = fs * 1.18;
    const inner = bd.lines.map(l => '<span>' + esc(l) + '</span>').join('');
    const bandBox = { x0: bx - bd.w * Z / 2 - 6, x1: bx + bd.w * Z / 2 + 6, y0: by - lh, y1: by + lh };
    /* her ribbon may swim under a pinned instrument, but her name never
       letters across one: suppressed only on true overlap with the furniture */
    const onFurn = FURN.some(R => {
      const ox = Math.min(bandBox.x1, R.x + R.w) - Math.max(bandBox.x0, R.x);
      const oy = Math.min(bandBox.y1, R.y + R.h) - Math.max(bandBox.y0, R.y);
      return ox > 6 && oy > 6;
    });
    boxes.push(bandBox);
    if (onFurn) continue;
    geoHtml.push('<div class="cl-beast" tabindex="0" role="link" data-slug="' + esc(B.isle.slug) +
      '" style="left:' + (dx + bx * S).toFixed(1) + 'px;top:' +
      (dy + by * S).toFixed(1) + 'px;font-size:' + (fs * S).toFixed(2) + 'px;line-height:' +
      (lh * S).toFixed(2) + 'px">' + inner + '</div>');
    boxes.push({ x0: vx(B.x - B.L * 0.52), x1: vx(B.x + B.L * 0.52), y0: vy(B.y - B.L * 0.42), y1: vy(B.y + B.L * 0.42) });
  }

  /* --- the two mains, lettered wide across their own ground --- */
  for (const K of geo.conts) {
    const contRumor = fog.mode === 'known' && !fog.anim &&
      !world.islands.some(ii => ii.product === K.key && isleSeen(ii));
    const kx = vx(K.x), ky = vy(K.y);
    if (!inView(kx, ky, 460)) continue;
    const fs = (K.key === 'cms' ? 20 : 14.5) * zf;
    const sp = (K.key === 'cms' ? 14 : 8.5) * zf;
    /* the browser spends letter-spacing after the last letter too: claim it,
       or a free name can letter flush against the ink and read as a graze */
    const w = textW(K.name, fs, '', sp) + sp + 18, h = fs + 8;
    let px2 = kx, py2 = ky - h * 0.4;
    for (const [ox2, oy2] of [[0, 0], [0, -h * 1.4], [0, h * 1.4], [-w * 0.22, h * 1.6], [-w * 0.34, h * 2.4], [-w * 0.34, -h * 1.8], [0, h * 3.2], [-w * 0.5, h * 3.0], [0, 0]]) {
      const st2 = seatOnSheet(kx + ox2, ky - h * 0.4 + oy2, w, h);
      const b2 = { x0: st2.x - w / 2, x1: st2.x + w / 2, y0: st2.y - h / 2, y1: st2.y + h / 2 };
      if (hit(b2)) continue;
      px2 = st2.x; py2 = st2.y;
      break;
    }
    ({ x: px2, y: py2 } = seatOnSheet(px2, py2, w, h));  /* the all-seats-taken fallback obeys the same law */
    put(geoHtml, 'cl-cont' + (contRumor ? ' rumor' : ''), esc(K.name), px2, py2, w, h,
      'font-size:' + (fs * S).toFixed(2) + 'px;letter-spacing:' + (sp * S).toFixed(2) + 'px');
    const fs2 = 8.6 * zf;
    /* the box claimed is the text lettered: the rumor suffix widens both */
    const subT = contRumor ? K.sub + ' · by report only' : K.sub;
    const w2 = textW(subT, fs2, 'italic', 1) + 8;
    if (!hit({ x0: px2 - w2 / 2, x1: px2 + w2 / 2, y0: py2 + h * 0.95 - (fs2 + 4) / 2, y1: py2 + h * 0.95 + (fs2 + 4) / 2 }))
      put(geoHtml, 'cl-contsub' + (contRumor ? ' rumor' : ''), esc(subT), px2, py2 + h * 0.95, w2, fs2 + 4,
        'font-size:' + (fs2 * S).toFixed(2) + 'px;letter-spacing:' + (1 * S).toFixed(2) + 'px');
  }

  /* --- the archipelago names, set across their whole water --- */
  for (const A of geo.lands) {
    if (!A.arch) continue;
    const archRumor = fogRumorAt(A.x, A.y);
    const ax = vx(A.x), ay = vy(A.y);
    if (!inView(ax, ay, 220)) continue;
    const sp = 4.2 * zf, fs = 13.5 * zf;
    const t = A.name.toUpperCase();
    const w = textW(t, fs, '', sp) + 12, h = fs + 8;
    const stA = seatOnSheet(ax, ay, w, h);
    put(geoHtml, 'cl-arch' + (archRumor ? ' rumor' : ''), esc(t), stA.x, stA.y, w, h,
      'font-size:' + (fs * S).toFixed(2) + 'px;letter-spacing:' + (sp * S).toFixed(2) + 'px');
  }

  /* --- the lands --- */
  const regions = geo.regions.slice().sort((a2, b2) => b2.n - a2.n);
  for (const G of regions) {
    const landRumor = fog.mode === 'known' && !fog.anim && G.places.every(ii => !isleSeen(ii));
    const prime = !!G.primary;
    const big = G.n >= 14 ? 12 : G.n >= 7 ? 10.6 : G.n >= 4 ? 9.4 : 8.6;
    let fs = (prime ? big : 8.4) * zf;
    let sp = (prime ? 2.5 : 1.6) * zf;
    let nm = G.name;
    /* a long name is condensed - smaller hand, tighter letters - never broken
       off with an ellipsis: no chart of the period letters "FOR ST..." */
    if (nm.length > 27) {
      const k = Math.max(0.68, Math.sqrt(27 / nm.length));
      fs *= k; sp *= k * 0.75;
      if (nm.length > 44) nm = nm.slice(0, 42).replace(/[\s,;:-]+$/, '') + '\u2026';
    }
    const t = (nm + (G.suffix ? ' ' + G.suffix : '')).toUpperCase();
    let w = textW(t, fs, '', sp) + 8, h = fs + 6;
    const gx = vx(G.x), gy = vy(G.y);
    if (!inView(gx, gy, 280)) continue;
    const topY = vy(G.bb.miny), botY = vy(G.bb.maxy);
    /* over her own ground if the name will sit there; otherwise directly under
       it, touching, so it can never read as a name adrift on open water */
    const tries = w < G.wide * Z * 1.45
      ? [[gx, gy], [gx, topY - h * 0.9], [gx, botY + h * 0.9]]
      : [[gx, botY + h * 0.85], [gx, topY - h * 0.85], [gx, gy]];
    let ok = false;
    /* two passes: the full hand first; if every lawful seat is taken - a
       province clamped off the tear loses her east-west freedom - she letters
       again in a condensed hand with a deeper north-south ladder, rather
       than vanish from the sheet */
    for (const pass of [0, 1]) {
      const pfs = pass ? fs * 0.85 : fs, psp = pass ? sp * 0.72 : sp;
      const pw = pass ? textW(t, pfs, '', psp) + 8 : w, ph = pass ? pfs + 6 : h;
      const dys = pass ? [0, -ph, ph, -ph * 2, ph * 2, -ph * 3, ph * 3, ph * 4]
                       : [0, -h, h, -h * 2, h * 2];
      for (const [px0b, py] of tries) {
        for (const dyy of dys) {
          for (const dxx of [0, -pw * 0.42, pw * 0.42]) {
            /* a seat past the torn edge steps back onto the vellum first */
            const st = seatOnSheet(px0b + dxx, py + dyy, pw, ph);
            const bx = { x0: st.x - pw / 2, x1: st.x + pw / 2, y0: st.y - ph / 2, y1: st.y + ph / 2 };
            if (hit(bx)) continue;
            put(geoHtml, 'cl-land' + (prime ? '' : ' sat') + (landRumor ? ' rumor' : ''), esc(t), st.x, st.y, pw, ph,
              'font-size:' + (pfs * S).toFixed(2) + 'px;letter-spacing:' + (psp * S).toFixed(2) + 'px');
            ok = true; break;
          }
          if (ok) break;
        }
        if (ok) break;
      }
      if (ok) break;
    }
    if (ok) {
      /* the land already carries this name: her chief page is not lettered twice */
      const owner = prime ? (G.hub || G.chief) : G.chief;
      if (owner) {
        const full = (G.name || '').toUpperCase();
        if (full === (owner.sidebarLabel || '').toUpperCase() ||
            full === (owner.title || '').toUpperCase()) owner._suppress = true;
      }
    }
  }

  /* --- the places: leaning in, every name the window will hold --- */
  const ranked = geo.places.slice().sort((a, b) => b.mark.score - a.mark.score);
  let lettered = 0;
  for (const I of ranked) {
    if (I._suppress) continue;
    if (fogHides(I)) continue;
    const px0 = vx(I.cx), py0 = vy(I.cy);
    if (!inView(px0, py0, 90)) continue;
    let t = I.sidebarLabel;
    let fs = (I.mark.kind === 'anchorage' ? 8.8 : 8.0) * zf;
    /* long village names condense the hand before any is broken off */
    if (t.length > 28) {
      fs *= Math.max(0.82, Math.sqrt(28 / t.length));
      if (t.length > 40) t = t.slice(0, 38).replace(/[\s,;:-]+$/, '') + '\u2026';
    }
    const chiefHand = I.mark.kind === 'anchorage';
    const w = (chiefHand ? textW(t.toUpperCase(), fs, '', 0.06 * fs) * 0.92
                         : textW(t, fs, '', 0.2)) + 5, h = fs + 3.4;
    const s = I.mark.sz * Z;
    const tries = [[0, s * 2.3 + 4], [0, -(s * 2.3 + 4)], [w / 2 + s + 3, 0], [-(w / 2 + s + 3), 0]];
    if (Z >= 2.2) tries.push([w / 2 + s + 3, -(h * 0.8)], [-(w / 2 + s + 3), h * 0.8],
      [0, s * 2.3 + 4 + h], [0, -(s * 2.3 + 4 + h)]);
    for (const [ox, oy] of tries) {
      const b = { x0: px0 + ox - w / 2, x1: px0 + ox + w / 2, y0: py0 + oy - h / 2, y1: py0 + oy + h / 2 };
      if (!onSheet(b)) continue;   /* never letters into the tear: the next seat takes her */
      if (hit(b)) continue;
      put(geoHtml, 'cl-place' + (I.mark.kind === 'anchorage' ? ' chief' : ''), esc(t), px0 + ox, py0 + oy, w, h,
        'font-size:' + (fs * S).toFixed(2) + 'px',
        'tabindex="0" role="link" data-slug="' + esc(I.slug) + '" ');
      lettered++;
      break;
    }
  }
  geo.lettered = lettered;

  /* --- the rose's letters ride the rose (ground claimed above, first) --- */
  /* no N: on this rose the fleur-de-lys is north, as she is on the old ones */
  for (const [t, rx, ry] of roseLetters) {
    geoHtml.push('<div class="cl-rose" style="left:' + (dx + rx * S).toFixed(1) +
      'px;top:' + (dy + ry * S).toFixed(1) + 'px;font-size:' + (11 * Z * S).toFixed(2) + 'px">' + t + '</div>');
  }

  /* --- the scale's numerals: pinned with its bar --- */
  const SG = chart.scaleGeom;
  if (SG) {
    for (let i = 0; i <= 4; i++) {
      pinHtml.push('<div class="cl-num" style="left:' + (dx + (SG.x0 + SG.len * i / 4) * S).toFixed(1) +
        'px;top:' + (dy + (SG.y0 - 11) * S).toFixed(1) + 'px;font-size:' + (9 * S).toFixed(2) + 'px">' +
        (+((i * SG.span / 4).toFixed(2))) + '</div>');
    }
    pinHtml.push('<div class="cl-scaption" style="left:' + (dx + (SCAL.x + SCAL.w / 2) * S).toFixed(1) +
      'px;top:' + (dy + (SG.y0 + 20) * S).toFixed(1) + 'px;font-size:' + (10 * S).toFixed(2) + 'px">' +
      'A scale of ' + numToWords(SG.span) + (SG.span === 1 ? ' nautical mile' : ' nautical miles') + ', by estimation</div>');
  }

  /* --- the cartouche --- */
  pinHtml.push('<div class="cl-cart" style="left:' + (dx + (CART.x + 15) * S).toFixed(1) + 'px;top:' +
    (dy + (CART.y + 15) * S).toFixed(1) + 'px;width:' + ((CART.w - 30) * S).toFixed(1) +
    'px;font-size:' + (11 * S).toFixed(2) + 'px">' + cartoucheHtml() + '</div>');

  /* --- the legend --- */
  pinHtml.push('<div class="cl-dirs" style="left:' + (dx + (DIRS.x + 14) * S).toFixed(1) + 'px;top:' +
    (dy + (DIRS.y + 13) * S).toFixed(1) + 'px;width:' + ((DIRS.w - 28) * S).toFixed(1) +
    'px;font-size:' + (11 * S).toFixed(2) + 'px">' + directionsHtml() + '</div>');

  lab.innerHTML = '<div id="clgeo">' + geoHtml.join('') + '</div><div id="clpin">' + pinHtml.join('') + '</div>';
  chart.layoutView = { z: Z, tx: TX, ty: TY, S, dx, dy };

  /* the two live panels keep their own nodes: the readout and the key */
  const ci = $('chartinfo');
  ci.style.left = (dx + (CART.x + 15) * S).toFixed(1) + 'px';
  ci.style.top = (dy + (CART.y + CART.h - 74) * S).toFixed(1) + 'px';
  ci.style.width = ((CART.w - 30) * S).toFixed(1) + 'px';
  ci.style.fontSize = (11.5 * S).toFixed(2) + 'px';
  const fsw = $('fogswitch');
  if (fsw) {
    fsw.style.left = (dx + (CHART_W / 2) * S).toFixed(1) + 'px';
    fsw.style.top = (dy + 25 * S).toFixed(1) + 'px';
    fsw.style.fontSize = (10.5 * S).toFixed(2) + 'px';
  }
  const sg = $('stormglass');
  if (sg) {
    sg.style.left = (dx + (STGL.x + 50) * S).toFixed(1) + 'px';
    sg.style.top = (dy + (STGL.y + 9) * S).toFixed(1) + 'px';
    sg.style.width = ((STGL.w - 62) * S).toFixed(1) + 'px';
    sg.style.fontSize = (10.5 * S).toFixed(2) + 'px';
    updateStormGlass();
  }
  placeChartCat();
  const ck = $('chartkey');
  ck.style.left = (dx + (KEYB.x + 14) * S).toFixed(1) + 'px';
  ck.style.top = (dy + (KEYB.y + 12) * S).toFixed(1) + 'px';
  ck.style.width = ((KEYB.w - 28) * S).toFixed(1) + 'px';
  ck.style.fontSize = (11 * S).toFixed(2) + 'px';
  ck.innerHTML = keyHtml(S);
}
function cartoucheHtml() {
  const g = world.graph, geo = chart.geo;
  return '<div class="cc-title">CARTA STRAPIANA</div>' +
    '<div class="cc-sub">A chart of the documentation of Strapi,<br>surveyed out of the corpus itself</div>' +
    '<div class="cc-rule"></div>' +
    '<div class="cc-tot"><b>2</b> continents &middot; <b>' + world.provinces.length +
    '</b> provinces &middot; <b>' + world.islands.length + '</b> places &middot; <b>' +
    commas(g.edges.length) + '</b> citations<br><b>' + Math.round(world.extentNm) +
    '</b> nautical miles from shore to shore &middot; <b>' + world.uncited.length +
    '</b> unreached</div>';
}

function directionsHtml() {
  const A = world.provinces.slice().sort((a, b) => b.size - a.size).slice(0, 3);
  const line = (a, b, an, bn) => {
    const brg = norm360(Math.atan2(b.x - a.x, -(b.y - a.y)) * 180 / Math.PI);
    const nm = Math.hypot(b.x - a.x, b.y - a.y) * world.nmPerUnit;
    return '<li>From ' + an + ', ' + bn + ' bears <b>' +
      compassPoint(brg) + '</b>, ' + numToWords(Math.max(1, Math.round(nm))) +
      (Math.max(1, Math.round(nm)) === 1 ? ' mile.</li>' : ' miles.</li>');
  };
  const K = world.continents;
  let h = '<div class="cd-h">SAILING DIRECTIONS</div><ul>';
  h += line(K.cms, K.cloud, 'the <i>CMS Main</i>', 'the <i>Cloud Main</i>') ;
  h += line(A[0], A[1], 'the <i>' + esc(A[0].name) + '</i> province', 'the <i>' + esc(A[1].name) + '</i> province');
  h += '<li>The wind is the citation itself: it blows out of the pages that cite, into the pages cited.</li>';
  h += '</ul>';
  /* RUMORS OF OTHER WATERS (owner order): one line per crossing, the WHERE
     named plainly - every bearing below is measured, not invented - and the
     WHAT left to the sailor. */
  const home = world.bySlug.get(world.island.slug);
  if (home && eggs.ready) {
    const brgFrom = (o, E) => compassPoint(norm360(Math.atan2(E.x - o.pos.x, -(E.y - o.pos.y)) * 180 / Math.PI));
    const nmFrom = (o, E) => Math.hypot(E.x - o.pos.x, E.y - o.pos.y) * world.nmPerUnit;
    const distWords = nm => nm < 0.38 ? 'a quarter-mile' : nm < 0.75 ? 'a half-mile' :
      nm < 1.5 ? 'a mile' : numToWords(Math.round(nm)) + ' miles';
    const R = [];
    if (eggs.bottle) R.push('Flotsam bobs ' + distWords(nmFrom(home, eggs.bottle)) + ' <b>' +
      brgFrom(home, eggs.bottle) + '</b> of the home anchorage - some say it carries a printed page.');
    if (eggs.ink) R.push('<b>' + brgFrom(home, eggs.ink) + '</b> of the home water, the sea is said to turn to ink.');
    if (eggs.city) R.push('Far to the <b>' + brgFrom(home, eggs.city) + '</b> lies an isle no chart of ours will name.');
    if (eggs.pathIsle) R.push('From the anchorage at the <i>' + esc(eggs.pathIsle.title) + '</i> a path climbs the cliff.');
    R.push('On clear nights one star does not keep station - watch it through the glass.');
    R.push('Keepers of the log report a pressed flower that was never theirs.');
    h += '<div class="cd-h cd-rum-h">RUMORS OF OTHER WATERS</div><ul class="cd-rum">';
    for (const r of R) h += '<li>' + r + '</li>';
    h += '</ul>';
  }
  return h;
}

function keyHtml(S) {
  const rows = [
    'the chief page of a province',
    'a fort: many pages cite her',
    'a settlement: many hands',
    'hachures: a long page',
    'shoal cross: no route reaches her',
    'dark shore: an unreached coast',
    'read on this visit (' + visit.charted.size + ')'
  ];
  let h = '<div class="ck-h">HERE BE DRAGONS</div>' +
    '<div class="ck-lede">Fifty places no route yet reaches: their coasts are inked dark and ' +
    'their waters carry the cross. The three fiercest swim the open sea as beasts, each drawn ' +
    'from her own numbers - bulk from words, arms from the pages she reaches for.</div>';
  /* the rows are pinned to the same rule the glyphs were inked on */
  rows.forEach((t, i) => {
    const top = (KEY_ROW_Y - 12 + i * KEY_ROW_H - KEY_ROW_H / 2) * S;
    h += '<div class="ck-row" style="top:' + top.toFixed(1) + 'px;height:' + (KEY_ROW_H * S).toFixed(1) +
      'px;line-height:' + (KEY_ROW_H * S).toFixed(1) + 'px;padding-left:' + (22 * S).toFixed(1) + 'px">' +
      t + '</div>';
  });
  /* the standing rules of the weather, printed small under the glyph rows */
  const rules = [
    'the weather is the corpus twelvemonth replayed, a month a minute: rain where the ink fell thick, squalls where it fell thickest',
    'the sea remembers the tending: grey mist rides waters long untended; fresh ink sparkles on the swell',
    'by night one lighthouse burns for every twelve citations on a cape; the stars overhead are the current waters&rsquo; citations &mdash; click one to lay a course'
  ];
  rules.forEach((t, j) => {
    const top = (KEY_ROW_Y - 12 + 7 * KEY_ROW_H + 4 + j * 26) * S;
    h += '<div class="ck-rule" style="top:' + top.toFixed(1) + 'px">' + t + '</div>';
  });
  return h;
}

/* ============================================================
   THE VISIT, INKED OVER THE SHEET
   ============================================================ */
function drawChartVisit(g) {
  const Z = chart.z, TXv = chart.tx, TYv = chart.ty;
  const VV = p => [p[0] * Z + TXv, p[1] * Z + TYv];
  drawSoundings(g);
  drawRoutes(g, VV);
  if (visit.track.length > 1) {
    g.strokeStyle = RED + '0.72)';
    g.lineWidth = 1.4;
    g.setLineDash([4, 3.5]);
    g.beginPath();
    let started = false;
    for (const t of visit.track) {
      const p = VV(chartProject(t.x, t.y));
      if (!started) { g.moveTo(p[0], p[1]); started = true; } else g.lineTo(p[0], p[1]);
    }
    g.stroke();
    g.setLineDash([]);
  }
  /* an X at every place already read */
  g.strokeStyle = RED + '0.88)'; g.lineWidth = 1.5;
  for (const slug of visit.charted) {
    const I = world.bySlug.get(slug);
    if (!I) continue;
    let x, y;
    if (I.cx != null) { x = I.cx; y = I.cy; }
    else {
      const B = (chart.geo.beasts || []).find(b => b.isle === I);
      if (B) { x = B.x; y = B.y; } else { const p = chartProject(I.pos.x, I.pos.y); x = p[0]; y = p[1]; }
    }
    x = x * Z + TXv; y = y * Z + TYv;
    const r = 4.2;
    g.beginPath();
    g.moveTo(x - r, y - r); g.lineTo(x + r, y + r);
    g.moveTo(x + r, y - r); g.lineTo(x - r, y + r);
    g.stroke();
  }
  /* the ship, where she swims */
  const sp = VV(chartProject(ship.x, ship.y));
  g.save();
  g.translate(sp[0], sp[1]);
  /* a clear berth under her, so she is never lost in the ground */
  g.fillStyle = 'rgba(243,234,212,0.80)';
  g.beginPath(); g.ellipse(0, 0, 13, 11, 0, 0, TAU); g.fill();
  /* the profile mark lies along her course: the bowsprit (drawn at -x)
     leads north when she steers north, east when east - sheet-true */
  g.rotate((ship.bearing + 90) * Math.PI / 180);
  g.strokeStyle = RED + '0.95)';
  g.fillStyle = 'rgba(248,241,224,0.95)';
  g.lineWidth = 1.15;
  /* the hull */
  g.beginPath();
  g.moveTo(-5.4, 3.2);
  g.quadraticCurveTo(0, 8.6, 5.4, 3.2);
  g.lineTo(4.2, 0.6); g.lineTo(-4.2, 0.6);
  g.closePath(); g.fill(); g.stroke();
  /* two masts and a bowsprit */
  g.beginPath();
  g.moveTo(-1.6, 0.6); g.lineTo(-1.6, -8.2);
  g.moveTo(2.2, 0.6); g.lineTo(2.2, -5.6);
  g.moveTo(-4.4, 2.0); g.lineTo(-9.2, -0.6);
  g.stroke();
  /* her canvas, drawing */
  g.fillStyle = RED + '0.42)';
  g.beginPath();
  g.moveTo(-1.2, -7.6); g.quadraticCurveTo(4.6, -5.2, 3.0, -1.2); g.lineTo(-1.2, -1.2);
  g.closePath(); g.fill(); g.stroke();
  g.beginPath();
  g.moveTo(2.6, -5.2); g.quadraticCurveTo(6.6, -3.4, 5.4, -0.4); g.lineTo(2.6, -0.4);
  g.closePath(); g.fill(); g.stroke();
  g.restore();
}

/* ============================================================
   DRAW
   ============================================================ */
function drawChart() {
  const cv = $('chart');
  if (!chart.cv) {
    chart.cv = cv;
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
    cv.width = Math.round(CHART_W * dpr);
    cv.height = Math.round(CHART_H * dpr);
    cv.style.width = CHART_W + 'px';
    cv.style.height = CHART_H + 'px';
    chart.g = cv.getContext('2d');
    chart.dpr = dpr;
  }
  const t0 = performance.now();
  const geo = buildChartGeo();
  if (!chart.sheet) { measureBands(geo); bakeChartSheet(geo); }
  drawChartCanvas();
  layoutChartDom();
  showChartInfo(chart.hover);
  chart.ready = true;
  diag.chartMs = +(performance.now() - t0).toFixed(1);
  diag.chartGeoStats = geo.stats;
}

/* the canvas alone: what a gesture frame is allowed to cost */
function drawChartCanvas() {
  if (!chart.g || !chart.sheet) return;
  const g = chart.g, dpr = chart.dpr;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, CHART_W, CHART_H);
  if (chartViewIdent()) {
    g.drawImage(chart.sheet, 0, 0, CHART_W, CHART_H);
  } else {
    const key = chart.z.toFixed(4) + ',' + chart.tx.toFixed(1) + ',' + chart.ty.toFixed(1);
    if (chart.zoomCv && chart.zoomKey === key) {
      g.drawImage(chart.zoomCv, 0, 0, CHART_W, CHART_H);
    } else {
      g.save();
      g.imageSmoothingEnabled = true;
      try { g.imageSmoothingQuality = 'high'; } catch (err) {}
      g.translate(chart.tx, chart.ty);
      g.scale(chart.z, chart.z);
      g.drawImage(chart.sheet, 0, 0, CHART_W, CHART_H);
      g.restore();
    }
  }
  g.lineJoin = 'round'; g.lineCap = 'round';
  drawFog(g);
  drawChartVisit(g);
  paintFurniture(g);
  diag.chartView = { z: +chart.z.toFixed(3), tx: Math.round(chart.tx), ty: Math.round(chart.ty) };
}

/* eased approach to the target view; reduced motion arrives at once */
function chartAnimTick() {
  chart.anim = 0;
  if (ui.mode !== 'below' || ui.tab !== 'chart') { chartSnapToTarget(); return; }
  const ease = REDUCED ? 1 : 0.30;
  chart.z = lerp(chart.z, chart.zt, ease);
  chart.tx = lerp(chart.tx, chart.txt, ease);
  chart.ty = lerp(chart.ty, chart.tyt, ease);
  const done = Math.abs(chart.z - chart.zt) < 0.0015 &&
    Math.abs(chart.tx - chart.txt) < 0.3 && Math.abs(chart.ty - chart.tyt) < 0.3;
  if (done) chartSnapToTarget();
  chartClampView();
  drawChartCanvas();
  syncLabelTransform();
  if (!done) chart.anim = requestAnimationFrame(chartAnimTick);
  else chartSettle();
}
function chartSnapToTarget() {
  chart.z = chart.zt; chart.tx = chart.txt; chart.ty = chart.tyt;
  chartClampView();
}
function kickChartAnim() {
  if (REDUCED) {
    chartSnapToTarget();
    drawChartCanvas();
    syncLabelTransform();
    chartSettle();
    return;
  }
  if (!chart.anim) chart.anim = requestAnimationFrame(chartAnimTick);
}
/* the settled view: re-engrave the window crisp and re-set the lettering */
function chartSettle() {
  clearTimeout(chart.crispT);
  chart.crispT = setTimeout(() => {
    if (ui.mode !== 'below' || ui.tab !== 'chart' || !chart.cv) return;
    crispChartRender();
    crispFogRender();
    drawChartCanvas();
    layoutChartDom();
    showChartInfo(chart.hover);
  }, REDUCED ? 0 : 110);
}
/* between full layouts, the lettering rides the gesture on one transform */
function syncLabelTransform() {
  const el = document.getElementById('clgeo'), L = chart.layoutView;
  if (!el || !L) return;
  const s = chart.z / L.z;
  const ttx = L.dx + chart.tx * L.S - s * (L.dx + L.tx * L.S);
  const tty = L.dy + chart.ty * L.S - s * (L.dy + L.ty * L.S);
  el.style.transform = 'translate(' + ttx.toFixed(2) + 'px,' + tty.toFixed(2) + 'px) scale(' + s.toFixed(4) + ')';
}
/* +/- steps, 0 home: the keys zoom about the centre of the glass */
function chartKeyZoom(k) {
  if (k === '0') { chart.zt = 1; chart.txt = 0; chart.tyt = 0; }
  else {
    const f = (k === '-' || k === '_') ? 1 / 1.7 : 1.7;
    chartZoomAbout(CHART_W / 2, CHART_H / 2, chart.zt * f);
  }
  kickChartAnim();
}

function chartPick(evx, evy) {
  if (!chart.cv || !chart.marks.length) return null;
  const r = chart.cv.getBoundingClientRect();
  const x = ((evx - r.left) * CHART_W / r.width - chart.tx) / chart.z;
  const y = ((evy - r.top) * CHART_H / r.height - chart.ty) / chart.z;
  let best = null, bd = 1e9;
  for (const m of chart.marks) {
    if (fogHides(m.isle)) continue;
    const dx = m.x - x, dy = m.y - y;
    const d = Math.hypot(dx, dy);
    if (d > m.r) continue;
    const score = d / m.r;
    if (score < bd) { bd = score; best = m; }
  }
  return best;
}

/* THE TOOLTIP AT THE HAND (owner order): the name in the cartographic hand,
   the bearing and distance from the ship in period terms, and one honest
   datum line. It follows the hover and never sits under the cursor. */
function fillChartTip(m) {
  const tip = $('charttip');
  if (!tip) return;
  updateStormGlass();
  const isle = m.isle;
  const brg = bearingTo(isle), nm = distToNm(isle);
  const coord = compassPoint(brg) + ' \u00b7 ' + (nm >= 9.95 ? String(Math.round(nm)) : nm.toFixed(1)) + ' nm';
  let kindLine;
  if (m.beast) kindLine = 'sea beast \u00b7 her true water lies with her page';
  else if (isle.mark && isle.mark.kind === 'shoal') kindLine = 'shoal water \u00b7 no route reaches her';
  else {
    const A = isle.prov >= 0 && chart.geo && chart.geo.PROV ? chart.geo.PROV[isle.prov] : null;
    kindLine = !A ? 'off soundings'
      : A.hub === isle.slug ? 'the chief page of her province'
      : 'of the ' + esc(A.name) + ' province';
  }
  tip.innerHTML =
    '<div class="ct-name">' + esc(isle.title) + '</div>' +
    '<div class="ct-kind">' + kindLine + '</div>' +
    '<div class="ct-coord"><b>' + coord + '</b> from the ship</div>' +
    '<div class="ct-datum">' + commas(isle.words) + ' words \u00b7 ' +
      (isle.inbound ? isle.inbound + (isle.inbound === 1 ? ' citation in' : ' citations in') : 'no citation in') +
      (visit.charted.has(isle.slug) ? ' \u00b7 read this visit' : '') + '</div>';
  tip.hidden = false;
}
function placeChartTip(cx, cy) {
  const tip = $('charttip');
  if (!tip || tip.hidden) return;
  const host = tip.parentElement.getBoundingClientRect();
  let x = cx - host.left + 16, y = cy - host.top + 18;
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  if (x + tw > host.width - 8) x = cx - host.left - tw - 16;
  if (y + th > host.height - 8) y = cy - host.top - th - 16;
  tip.style.left = x.toFixed(0) + 'px';
  tip.style.top = y.toFixed(0) + 'px';
}
function hideChartTip() {
  const tip = $('charttip');
  if (tip && !tip.hidden) tip.hidden = true;
  if (chart.cv) chart.cv.classList.remove('overmark');
}

function showChartInfo() {
  /* the cartouche keeps only the chart's identity (owner order): the naming
     of places moved onto the sheet itself, in the tooltip at the hand */
  const box = $('chartinfo');
  if (!box) return;
  box.querySelector('.ci-name').textContent = 'The surveyed sea';
  box.querySelector('.ci-line').textContent = fog.mode === 'known'
    ? 'THE KNOWN CHART: drawn by your own voyages — ' + fogSeenCount() + ' of ' +
      world.islands.length + ' waters surveyed; the rest lie under the fog, by report only.'
    : 'Two mains, ' + world.provinces.length + ' provinces, all ' + world.islands.length +
      ' pages on the one sheet. Hover any place for her name and bearing.';
  box.querySelector('.ci-act').textContent =
    'Click a place to make the passage \u00b7 Shift-click to shape a course.';
}

/* ============================================================
   BELOW DECK
   ============================================================ */
function openBelow(tab) {
  firstOrder('below');
  ui.mode = 'below';
  ui.tab = tab || ui.tab || 'chart';
  $('anchorage').hidden = true;
  sound.reading(false);
  $('below').hidden = false;
  showTab(ui.tab);
  const s = $('search');
  if (s) { s.focus(); s.select(); }
  dirty = true;
}
function closeBelow() {
  $('below').hidden = true;
  $('searchdrop').hidden = true;
  if (ui.slug) { ui.mode = 'anchor'; $('anchorage').hidden = false; sound.reading(true); }
  else { ui.mode = 'deck'; }
  dirty = true;
}
function showTab(tab) {
  ui.tab = tab;
  for (const b of $('belowtabs').children) b.classList.toggle('on', b.dataset.tab === tab);
  for (const name of ['chart', 'index', 'log', 'register', 'colophon']) {
    $('pane-' + name).hidden = name !== tab;
  }
  if (tab === 'chart') {
    if (chart.sheet) drawChart();
    else requestAnimationFrame(() => { if (ui.mode === 'below' && ui.tab === 'chart') drawChart(); });
  }
  else if (tab === 'index') renderIndex();
  else if (tab === 'log') renderLog();
  else if (tab === 'register') renderRegister();
  else if (tab === 'colophon') renderColophon();
}

function initUI() {
  /* --- the anchorage --- */
  $('weigh').addEventListener('click', weighAnchor);

  /* the engraved rail: the page's own scrollbar, always visible while reading */
  {
    const rail = $('paperrail'), th = $('paperthumb');
    const pp = () => $('pagepaper');
    pp().addEventListener('scroll', railSync, { passive: true });
    window.addEventListener('resize', railSync);
    let drag = null;
    th.addEventListener('pointerdown', e => {
      drag = { y0: e.clientY, s0: pp().scrollTop };
      th.classList.add('held');
      th.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    th.addEventListener('pointermove', e => {
      if (!drag) return;
      const p = pp();
      const trackH = rail.clientHeight - 4;
      const thH = Math.max(28, trackH * p.clientHeight / p.scrollHeight);
      const range = trackH - thH;
      if (range > 0)
        p.scrollTop = drag.s0 + (e.clientY - drag.y0) * (p.scrollHeight - p.clientHeight) / range;
    });
    const drop = () => { drag = null; th.classList.remove('held'); };
    th.addEventListener('pointerup', drop);
    th.addEventListener('pointercancel', drop);
    rail.addEventListener('pointerdown', e => {
      if (e.target === th) return;
      const p = pp();
      const r = rail.getBoundingClientRect();
      p.scrollTop = ((e.clientY - r.top) / r.height) * (p.scrollHeight - p.clientHeight + p.clientHeight * 0.88) - p.clientHeight * 0.44;
    });
  }
  $('ondeck').addEventListener('click', () => { closeBelow(); if (!ui.slug) weighAnchor(); });

  $('pagepaper').addEventListener('click', e => {
    const tb = e.target.closest('.tabbtn');
    if (tb) {
      const wrap = tb.closest('.tabs');
      const i = tb.dataset.tab;
      wrap.querySelectorAll('.tabbtn').forEach(b => b.classList.toggle('active', b === tb));
      wrap.querySelectorAll('.tabpane').forEach((p, k) => p.classList.toggle('active', String(k) === i));
      e.preventDefault();
      return;
    }
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.charAt(0) === '#' && href.charAt(1) === '/') {
      /* an in-page citation: the most frequent act in documentation.
         It is an instant jump, never a crossing. */
      e.preventDefault();
      const slug = href.slice(1).split('#')[0];
      if (world.bySlug.has(slug)) { warpTo(slug, 'citation'); return; }
    } else if (href.charAt(0) === '#') {
      e.preventDefault();
      const el = document.getElementById('s-' + href.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  $('shoreside').addEventListener('click', e => {
    const b = e.target.closest('button.act');
    if (b) {
      const isle = world.bySlug.get(ui.slug);
      if (!isle) return;
      const act = b.dataset.act;
      if (act === 'lamp') {
        visit.lamps.add(isle.slug);
        logMark('Hung the first lamp on ' + isle.title + ': nothing cites her.');
        captionNow('A first lamp burns on ' + isle.title + '.', 4000);
      } else if (act === 'islet') {
        visit.islets.add(isle.slug);
        logMark('Landed the desert islet ' + isle.title + ': nothing links her either way.');
      } else if (act === 'watch') {
        visit.watches.add(isle.slug);
        logMark('Signed the watch beside ' + isle.authors[0] + ' on ' + isle.title +
          (visit.hand ? ' — ' + visit.hand + ', a stranger\'s hand' : ' — an unsigned stranger\'s hand') + '.');
      } else if (act === 'raise') {
        raiseHandsFor(isle);
      } else if (act === 'packet') {
        const p = packetFor(isle);
        if (p) {
          visit.packet = { from: isle.slug, to: p.to, n: p.n };
          logMark('Took the packet at ' + isle.title + ', addressed to ' + p.toTitle + '.');
        }
      } else if (act === 'path') {
        crossTo('longway', 'You step ashore. The path takes the cliff in long, easy zigzags.', 1600);
        return;
      }
      visit.save();
      $('shoreside').innerHTML = shoresideHTML(isle);
      return;
    }
    const a = e.target.closest('a');
    if (a) {
      const href = a.getAttribute('href') || '';
      if (href.charAt(0) === '#' && href.charAt(1) === '/') {
        e.preventDefault();
        warpTo(href.slice(1), a.dataset.hail ? 'hailed' : 'citation');
      }
    }
  });

  /* --- below deck --- */
  $('belowtabs').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b) showTab(b.dataset.tab);
  });

  const s = $('search');
  s.addEventListener('input', () => {
    ui.searchHits = searchPages(s.value);
    ui.searchSel = 0;
    renderSearchDrop();
  });
  s.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { ui.searchSel = Math.min(ui.searchSel + 1, ui.searchHits.length - 1); renderSearchDrop(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { ui.searchSel = Math.max(ui.searchSel - 1, 0); renderSearchDrop(); e.preventDefault(); }
    else if (e.key === 'Enter') {
      const hit = ui.searchHits[ui.searchSel];
      if (hit) { $('searchdrop').hidden = true; s.blur(); warpTo(hit.isle.slug, 'packet'); }
      e.preventDefault();
    } else if (e.key === 'Escape') { $('searchdrop').hidden = true; s.blur(); e.preventDefault(); }
    else if (!s.value && ui.mode === 'below' && ui.tab === 'chart' &&
      (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '_')) {
      /* an empty search box passes the zoom keys through to the glass */
      chartKeyZoom(e.key); e.preventDefault();
    }
  });
  $('searchdrop').addEventListener('click', e => {
    const b = e.target.closest('.sr');
    if (b) { $('searchdrop').hidden = true; warpTo(b.dataset.slug, 'packet'); }
  });

  $('pane-index').addEventListener('click', e => {
    const b = e.target.closest('.idxrow');
    if (b) warpTo(b.dataset.slug, 'packet');
  });

  $('po-yes').addEventListener('click', () => portalAnswer(true));
  $('po-no').addEventListener('click', () => portalAnswer(false));

  const cv = $('chart');
  cv.addEventListener('mousemove', e => {
    if (chart.gesturing) { hideChartTip(); return; }
    const m = chartPick(e.clientX, e.clientY);
    if (m !== chart.hoverMark) {
      chart.hoverMark = m;
      chart.hover = m ? m.isle : null;
      if (m) fillChartTip(m); else hideChartTip();
      cv.classList.toggle('overmark', !!m);
    }
    if (m) placeChartTip(e.clientX, e.clientY);
  });
  cv.addEventListener('mouseleave', () => { chart.hover = null; chart.hoverMark = null; hideChartTip(); updateStormGlass(); });
  cv.addEventListener('click', e => {
    if (chart.panned) { chart.panned = false; return; }
    const m = chartPick(e.clientX, e.clientY);
    if (!m) return;
    if (e.shiftKey) { hideChartTip(); shapeCourse(m.isle); return; }
    hideChartTip();
    passageTo(m.isle);
  });
  cv.addEventListener('dblclick', e => { e.preventDefault(); });

  /* keyboard hands get the same tooltip on the lettered names */
  const labHost = $('chartlabels');
  labHost.addEventListener('focusin', e => {
    const el2 = e.target.closest('[data-slug]');
    if (!el2) return;
    const isle = world.bySlug.get(el2.dataset.slug);
    if (!isle) return;
    let m = null;
    for (const mm of chart.marks) if (mm.isle === isle) { m = mm; break; }
    chart.hover = isle; chart.hoverMark = m;
    fillChartTip(m || { isle });
    const tip = $('charttip');
    const r = el2.getBoundingClientRect(), host = tip.parentElement.getBoundingClientRect();
    tip.style.left = Math.max(4, Math.min(r.right - host.left + 8, host.width - tip.offsetWidth - 8)) + 'px';
    tip.style.top = Math.max(4, Math.min(r.top - host.top - 4, host.height - tip.offsetHeight - 8)) + 'px';
  });
  labHost.addEventListener('focusout', () => { chart.hoverMark = null; hideChartTip(); });
  labHost.addEventListener('keydown', e => {
    const el2 = e.target.closest('[data-slug]');
    if (!el2) return;
    if (e.key === 'Enter' || e.key === ' ') {
      const isle = world.bySlug.get(el2.dataset.slug);
      if (isle) { hideChartTip(); if (e.shiftKey) shapeCourse(isle); else passageTo(isle); }
      e.preventDefault();
    }
  });

  /* --- the reading glass: wheel and pinch zoom about the hand, drag to pan --- */
  cv.addEventListener('wheel', e => {
    if (ui.tab !== 'chart') return;
    e.preventDefault();
    hideChartTip();
    chart.hoverMark = null;
    const r = cv.getBoundingClientRect();
    const cx = (e.clientX - r.left) * CHART_W / r.width;
    const cy = (e.clientY - r.top) * CHART_H / r.height;
    let d = e.deltaY;
    if (e.deltaMode === 1) d *= 33; else if (e.deltaMode === 2) d *= 400;
    chartZoomAbout(cx, cy, chart.zt * Math.exp(-d * 0.0021));
    kickChartAnim();
  }, { passive: false });

  const cptrs = new Map();
  let cpan = null, cpinch = null;
  cv.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    cptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    if (cptrs.size === 1) { chart.panned = false; cpan = { x: e.clientX, y: e.clientY, moved: 0 }; cpinch = null; }
    else if (cptrs.size === 2) {
      const [a, b] = [...cptrs.values()];
      cpinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: chart.zt };
      cpan = null;
    }
  });
  cv.addEventListener('pointermove', e => {
    const p = cptrs.get(e.pointerId);
    if (!p) return;
    const r = cv.getBoundingClientRect();
    const kx = CHART_W / r.width, ky = CHART_H / r.height;
    if (cptrs.size === 1 && cpan) {
      const mdx = e.clientX - cpan.x, mdy = e.clientY - cpan.y;
      cpan.moved += Math.abs(mdx) + Math.abs(mdy);
      cpan.x = e.clientX; cpan.y = e.clientY;
      if (cpan.moved > 5) { chart.panned = true; chart.gesturing = true; cv.classList.add('panning'); hideChartTip(); chart.hoverMark = null; }
      if (chart.gesturing) {
        chart.txt += mdx * kx; chart.tyt += mdy * ky;
        chartClampTargets();
        chartSnapToTarget();
        drawChartCanvas();
        syncLabelTransform();
      }
    }
    p.x = e.clientX; p.y = e.clientY;
    if (cptrs.size === 2 && cpinch) {
      chart.gesturing = true;
      const [a, b] = [...cptrs.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const mx = ((a.x + b.x) / 2 - r.left) * kx, my = ((a.y + b.y) / 2 - r.top) * ky;
      chartZoomAbout(mx, my, cpinch.z * d / cpinch.d);
      chartSnapToTarget();
      drawChartCanvas();
      syncLabelTransform();
    }
  });
  const cptrEnd = e => {
    if (!cptrs.has(e.pointerId)) return;
    cptrs.delete(e.pointerId);
    if (cptrs.size === 0) {
      cpinch = null; cpan = null;
      cv.classList.remove('panning');
      if (chart.gesturing) { chart.gesturing = false; chartSettle(); }
    } else if (cptrs.size === 1) {
      cpinch = null;
      const [a] = [...cptrs.values()];
      cpan = { x: a.x, y: a.y, moved: 99 };
    }
  };
  cv.addEventListener('pointerup', cptrEnd);
  cv.addEventListener('pointercancel', cptrEnd);

  {
    const fsw2 = $('fogswitch');
    if (fsw2) {
      const flip = () => fogSetMode(fog.mode === 'known' ? 'full' : 'known', true);
      fsw2.addEventListener('click', flip);
      fsw2.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
      });
    }
  }
  $('soundbtn').addEventListener('click', () => sound.toggle());
  $('soundbtn').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') sound.toggle(); });
}

function shapeCourse(isle) {
  firstOrder('sail');
  closeBelow();
  if (ui.slug) { $('anchorage').hidden = true; ui.slug = null; sound.reading(false); }
  ui.mode = 'deck';
  if (ship.anchored) { ship.anchored = false; ship.atAnchorOff = null; }
  setBound(isle, true);
  const brg = bearingTo(isle);
  ship.orderedBearing = brg;
  pushOrder(env.t);
  setSail(distToNm(isle) > 3 ? 'travel' : 'full', true);
  captionNow('Course shaped for ' + isle.title + ', ' + compassPoint(brg) + ', ' +
    (Math.round(distToNm(isle) * 10) / 10) + ' nm. The helm answers in its own time.', 5200);
  dirty = true;
}

/* QUICK START FIRST (owner law): on a cold load the first landfall is the
   Quick Start Guide - her shore flies a pennant, and a counting-down distance
   line stands until the maiden landfall is made. */
function drawMaidenPennant(worldDY) {
  const qs = story.qs;
  const dist = distToNm(qs);
  if (dist > VIS_NM * 1.25) return;
  const az = angDiff(bearingTo(qs), ship.bearing);
  if (Math.abs(az) > FOV / 2 + 6) return;
  const g = ctx, t = env.t;
  const x = W / 2 + az * PXDEG;
  const yBase = HORIZON + worldDY + 2;
  const wpx = islandScreenW(dist, qs.mag);
  const h = clamp(wpx * 0.30 + 30, 46, 168);
  const top = yBase - h;
  const fl = clamp(wpx * 0.09 + 16, 20, 60);
  const wob = REDUCED ? 0 : Math.sin(t * 3.1) * fl * 0.09;
  g.save();
  g.globalAlpha = clamp((VIS_NM * 1.25 - dist) / 1.1, 0.35, 1);
  g.strokeStyle = 'rgba(32,23,13,0.92)';
  g.lineWidth = Math.max(1.1, wpx * 0.0035);
  g.beginPath(); g.moveTo(x, yBase); g.lineTo(x, top); g.stroke();
  g.fillStyle = 'rgba(141,47,34,0.88)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(x, top);
  g.quadraticCurveTo(x + fl * 0.55, top + 2 + wob * 0.4, x + fl, top + 4 + wob);
  g.lineTo(x + fl * 0.62, top + 8 + wob * 0.5);
  g.lineTo(x + fl, top + 13 + wob);
  g.quadraticCurveTo(x + fl * 0.5, top + 15 + wob * 0.4, x, top + 13);
  g.closePath(); g.fill(); g.stroke();
  g.restore();
}

function updateFirstBound() {
  const el = document.getElementById('firstbound');
  if (!el) return;
  if (story.maiden && story.qs && visit.charted.has(story.qs.slug)) {
    story.maiden = false;
    captionNow('Maiden landfall made. The sea is yours now: C opens the chart table.', 5200);
  }
  if (!story.maiden || !story.qs || ui.mode !== 'deck' || passage.on || passage.closing) {
    if (!el.hidden) el.hidden = true;
    return;
  }
  const d = distToNm(story.qs);
  const trend = story._fbLast == null ? 0 : d - story._fbLast;
  story._fbLast = d;
  const txt = 'MAIDEN LANDFALL \u00b7 THE QUICK START GUIDE \u00b7 ' +
    (d >= 9.95 ? String(Math.round(d)) : d.toFixed(2)) + ' nm' +
    (ship.knots <= 0.25 ? ' \u00b7 F makes sail' : trend < -0.00001 ? ', closing' : trend > 0.00001 ? ', opening' : '');
  if (el.textContent !== txt) el.textContent = txt;
  if (el.hidden) el.hidden = false;
}

/* ---- the passage itself ---- */
function passageTo(isle) {
  if (!isle || passage.on || passage.closing) return;
  firstOrder('sail');
  passage.isle = isle;
  passage.nm = distToNm(isle);
  if (ui.slug) { $('anchorage').hidden = true; ui.slug = null; sound.reading(false); }
  if (ship.anchored) { ship.anchored = false; ship.atAnchorOff = null; }
  if (REDUCED) {
    closeBelow();
    ui.mode = 'deck';
    landAfterPassage(true);
    return;
  }
  passage.closing = true;
  const below = $('below');
  below.classList.add('passing');
  setTimeout(() => {
    below.classList.remove('passing');
    passage.closing = false;
    closeBelow();
    ui.mode = 'deck';
    beginPassage();
  }, 430);
}
function beginPassage() {
  const isle = passage.isle;
  if (!isle) return;
  const d = approachDirFor(isle);
  const u = 0.55 / world.nmPerUnit;
  passage.ax = ship.x; passage.ay = ship.y;
  passage.bx = isle.pos.x - d.x * u;
  passage.by = isle.pos.y - d.y * u;
  passage.dur = clamp(1.4 + passage.nm * 0.022, 1.5, 2.4);
  passage.t = 0;
  passage.on = true;
  diag.passage = { to: isle.slug, nm: +passage.nm.toFixed(2), dur: +passage.dur.toFixed(2) };
  setBound(isle, true);
  ship.sail = 'travel';
  captionNow('Passage: ' + (Math.round(passage.nm * 10) / 10) + ' nm to ' + isle.title +
    '. Any key lands you there.', 2800);
  dirty = true;
}
function passageTick(dt) {
  passage.t += dt;
  const T = clamp(passage.t / passage.dur, 0, 1);
  const s = T * T * (3 - 2 * T);
  ship.x = lerp(passage.ax, passage.bx, s);
  ship.y = lerp(passage.ay, passage.by, s);
  const brg = norm360(Math.atan2(passage.bx - ship.x, -(passage.by - ship.y)) * 180 / Math.PI);
  if (T < 0.999) { ship.bearing = ship.orderedBearing = brg; }
  ship.omega = 0;
  /* the way she carries, for the spray and the chant: a bell of speed */
  ship.knots = 8 + 26 * (4 * s * (1 - s));
  if (T >= 1) endPassage(false);
}
function endPassage(skipped) {
  if (!passage.on) return;
  passage.on = false;
  landAfterPassage(false, skipped);
}
function landAfterPassage(reduced, skipped) {
  const isle = passage.isle;
  passage.isle = null;
  if (!isle) return;
  placeShipAtDistance(0.55, isle);
  ship.sail = 'half';
  ship.knots = 4.6;
  visit.track.push({ x: ship.x, y: ship.y });
  if (!reduced) fogSeePath(passage.ax, passage.ay, ship.x, ship.y, 0.8);
  fogSee(ship.x, ship.y, FOG_SEE_NM);
  logPacket(isle, 'passage');
  if (reduced) {
    captionNow('Passage made - ' + (Math.round(passage.nm * 10) / 10) + ' nm.', 5200);
  } else {
    captionNow('Passage made - ' + (Math.round(passage.nm * 10) / 10) + ' nm. ' +
      isle.title + ' lies dead ahead.', 5200);
  }
  diag.passage = { landed: isle.slug, nm: +passage.nm.toFixed(2), skipped: !!skipped };
  dirty = true;
}
function drawPassageSweep() {
  const T = clamp(passage.t / passage.dur, 0, 1);
  const v = Math.sin(T * Math.PI);
  if (v <= 0.03) return;
  const g = ctx;
  const rr = rngFor('sweep:' + Math.floor(env.t * 14));
  g.save();
  /* the sky streams past */
  g.globalAlpha = 0.34 * v;
  g.strokeStyle = 'rgba(64,50,32,0.85)';
  g.lineWidth = 1.4;
  g.beginPath();
  for (let i = 0; i < 13; i++) {
    const y = 36 + rr() * (HORIZON - 80);
    const x0 = rr() * (W + 200) - 100, len = (110 + rr() * 300) * v;
    g.moveTo(x0, y); g.lineTo(x0 - len, y + len * 0.04);
  }
  g.stroke();
  /* the water streams under her, drawn out into speed lines */
  g.globalAlpha = 0.30 * v;
  g.strokeStyle = 'rgba(70,54,34,0.8)';
  g.lineWidth = 1.1;
  g.beginPath();
  for (let i = 0; i < 16; i++) {
    const y = HORIZON + 26 + rr() * (H - HORIZON - 60);
    const sp = (y - HORIZON) / (H - HORIZON);
    const x0 = rr() * (W + 300) - 150, len = (60 + rr() * 200) * v * (0.5 + sp * 1.6);
    const off = (x0 - W / 2) * 0.10 * sp;
    g.moveTo(x0, y); g.lineTo(x0 - len + off, y + len * 0.10 * sp);
  }
  g.stroke();
  /* and the bow throws spray */
  g.globalAlpha = 0.5 * v;
  g.fillStyle = 'rgba(241,231,208,0.92)';
  for (let i = 0; i < 30; i++) {
    const x = W / 2 + (rr() - 0.5) * 820;
    const y = HORIZON + 110 + rr() * 330;
    g.fillRect(x, y, 2 + rr() * 2.5, 1 + rr() * 2);
  }
  g.restore();
}

/* ---- THE PORTAL CONFIRM (owner law): every crossing asks, in the fiction ---- */
const portal = { open: false, key: null, beat: '', ms: 0, denyT: {} };
const PORTAL_Q = {
  pixelcity: 'The boat stands ready under the glittering quay. Go ashore?',
  bythedeep: 'The water ahead is ink, and the hatching waits to close over her. Sail in?',
  longway: 'The path takes the cliff in long, easy zigzags. Follow it ashore?',
  firstlight: 'That is no star, and she is answering. Answer her back?',
  herbarium: 'The pressed sprig slipped from the log for a reason. Follow it?',
  secreta: 'The cork will give if you draw it. Draw the cork?'
};
function portalAsk(key, beat, ms) {
  if (portal.open) return;
  if (portal.denyT[key] != null && env.t - portal.denyT[key] < 45) return;
  portal.open = true; portal.key = key; portal.beat = beat; portal.ms = ms;
  diag.portal = { open: true, key };
  const el = $('portal');
  el.querySelector('.po-q').textContent = PORTAL_Q[key] || 'Cross over?';
  el.hidden = false;
  requestAnimationFrame(() => {
    el.classList.add('shown');
    const y = document.getElementById('po-yes');
    if (y) y.focus();
  });
}
function portalAnswer(yes) {
  if (!portal.open) return;
  const key = portal.key, beat = portal.beat, ms = portal.ms;
  portal.open = false;
  const el = $('portal');
  el.classList.remove('shown');
  el.hidden = true;
  diag.portal = { open: false, key: null, last: key, answered: yes ? 'yes' : 'no' };
  if (yes) {
    reallyCross(key, beat, ms);
  } else {
    portal.denyT[key] = env.t;
    eggs.crossing = null;
    diag.crossing = null;
    captionNow('She stands off. The sea keeps what it keeps.', 3400);
  }
}
function portalKeydown(e) {
  if (!portal.open) return false;
  const k = e.key;
  if (k === 'Enter') {
    const no = document.activeElement && document.activeElement.id === 'po-no';
    portalAnswer(!no);
    e.preventDefault(); return true;
  }
  if (k === 'y' || k === 'Y') { portalAnswer(true); e.preventDefault(); return true; }
  if (k === 'n' || k === 'N' || k === 'Escape') { portalAnswer(false); e.preventDefault(); return true; }
  if (k === 'Tab') {
    /* the plate holds the focus: Tab (either direction) trades the two
       answers and never walks out of the dialog */
    const yes = document.getElementById('po-yes'), no = document.getElementById('po-no');
    if (yes && no) (document.activeElement === yes ? no : yes).focus();
    e.preventDefault(); return true;
  }
  e.preventDefault();
  return true;                       // the plate holds the keyboard
}

/* the landfall plate on deck: crisp DOM, never painted into the canvas */
function updateLandfallPlate(sim) {
  const el = $('landfall');
  const isle = ship.bound;
  /* crossing (a): when the nameless city is the nearer landfall the plate
     reads LAND HO - no chart of ours gives it a name */
  if (eggs.ready && !eggs.crossing && ui.mode === 'deck' && !ship.anchored && lens.t < 0.15) {
    const cd = eggNm('city');
    if (cd < 3.0 && Math.abs(angDiff(eggBearing('city'), ship.bearing)) < 50 &&
        (!isle || cd < sim.dist)) {
      if (el.dataset.slug !== '__landho__' || el.hidden) {
        el.dataset.slug = '__landho__';
        el.querySelector('.lf-name').textContent = 'LAND HO!';
        el.querySelector('.lf-line').textContent =
          'A strange city of light glitters on the far horizon. No chart of ours gives it a name.';
        el.querySelector('.lf-order').textContent =
          cd < 0.9 ? 'A to let go and pull for the quay' : 'Hold this course: the light grows';
        el.hidden = false;
        requestAnimationFrame(() => el.classList.add('shown'));
      } else if (cd < 0.9 && el.querySelector('.lf-order').textContent.indexOf('quay') < 0) {
        el.querySelector('.lf-order').textContent = 'A to let go and pull for the quay';
      }
      return;
    }
    if (el.dataset.slug === '__landho__' && !el.hidden) {
      el.classList.remove('shown');
      el.hidden = true;
      el.dataset.slug = '';
    }
  }
  /* nothing prints over the glass: the tube blocks the world, and a plate
     floating on it would be a sticker on the lens */
  const show = isle && !ship.anchored && sim.dist < 2.6 && ui.mode === 'deck' && lens.t < 0.15;
  if (!show) { if (!el.hidden) { el.classList.remove('shown'); el.hidden = true; } return; }
  if (el.dataset.slug !== isle.slug || el.hidden) {
    el.dataset.slug = isle.slug;
    el.querySelector('.lf-name').textContent = isle.title;
    el.querySelector('.lf-line').textContent =
      commas(isle.words) + ' words · ' + isle.nH2 + (isle.nH2 === 1 ? ' headland' : ' headlands') +
      ' · ' + isle.nH3 + (isle.nH3 === 1 ? ' knoll' : ' knolls') + ' · ' +
      (isle.inbound ? isle.inbound + (isle.inbound === 1 ? ' riding light' : ' riding lights') : 'no riding light');
    el.querySelector('.lf-order').textContent =
      isle.inbound === 0 && isle.outbound === 0 ? 'Standing order: land the desert islet'
        : isle.inbound === 0 ? 'Standing order: hang the first lamp'
        : isle.authors.length === 1 ? 'Standing order: sign the watch beside ' + isle.authors[0]
        : sim.dist < 0.45 ? 'A to let go the anchor' : '';
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('shown'));
  }
}

/* ============================================================
   THE SHANTY
   An always-on bed of wind and water, synthesised, which must feel complete
   on its own; over it, recorded human voices that JOIN one at a time at the
   cadence of the real commit rhythm of the water being crossed. One voice per
   hand that keeps the island. If the recordings fail to load the piece is
   still whole: the bed carries it. One switch silences everything.
   ============================================================ */
const sound = {
  on: store.get('sound', true) !== false,
  ctx: null, master: null, mix: null, duckG: null, an: null, bed: null, woke: false,
  bank: [], files: null, credits: null, featured: [], featIx: 0,
  crew: 0, nextJoin: 0, joinEvery: 12, wantVoices: 0,
  slotNext: [], active: [],
  lastId: null, lastPlay: null, gram: null, trig: [], lastStart: -1e9,
  holdUntil: 0, nextFeatureAt: 0, readingOpen: false,

  init() {
    this.lastPlay = new Map();
    this.gram = new Map();
    this.paint();
    const wake = () => {
      if (this.woke) return;
      this.woke = true;
      this.build();
      window.removeEventListener('pointerdown', wake);
      window.removeEventListener('keydown', wake);
    };
    window.addEventListener('pointerdown', wake);
    window.addEventListener('keydown', wake);
    this.load();
  },

  async load() {
    try {
      const man = await fetch('audio/voices.json').then(r => r.ok ? r.json() : null);
      if (!man || !man.files) return;
      this.credits = man;
      this.files = man.files;
      /* the manifest may land after the first gesture built the context */
      if (this.ctx) this.decodeAll();
    } catch (e) { /* the bed alone is the piece */ }
  },

  async decodeAll() {
    if (!this.ctx || !this.files || this.decoding || this.bank.length) return;
    this.decoding = true;
    for (const f of this.files) {
      try {
        const ab = await fetch('audio/' + f.file).then(r => r.arrayBuffer());
        const buf = await this.ctx.decodeAudioData(ab);
        this.bank.push({ name: f.file, role: f.role || 'response', buf, gain: f.gain || 1 });
      } catch (e) { /* skip a voice that will not decode */ }
    }
    this.decoding = false;
    diag.voicesLoaded = this.bank.length;
    this.loadSuno();
  },

  /* THE SUNO SLOT: drop mp3 files in audio/suno/ with a manifest.json beside
     them ({ "verses": [{ "file", "title", "by", "gain" }] } - format documented
     in CREDITS.txt) and they are detected here and woven into the programme as
     featured verses, each with its credit line spoken on the plate. */
  async loadSuno() {
    if (!this.ctx) return;
    try {
      const man = await fetch('audio/suno/manifest.json').then(r => r.ok ? r.json() : null);
      if (!man || !man.verses) return;
      for (const v of man.verses) {
        try {
          const ab = await fetch('audio/suno/' + v.file).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); });
          const buf = await this.ctx.decodeAudioData(ab);
          this.featured.push({ name: 'suno:' + v.file, title: v.title || v.file,
            by: v.by || 'an unnamed hand', gain: clamp(+v.gain || 0.55, 0.05, 1), buf });
        } catch (e) { /* a verse that will not decode stays ashore */ }
      }
      diag.sunoVerses = this.featured.length;
      if (this.featured.length && this.ctx) this.nextFeatureAt = this.ctx.currentTime + 45 + Math.random() * 45;
    } catch (e) { /* no folder, no verses: the bank carries the watch */ }
  },

  build() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const c = this.ctx;
    this.master = c.createGain();
    this.master.gain.value = this.on ? 0.85 : 0;
    this.master.connect(c.destination);
    /* everything - bed, voices, sfx - passes the duck before the master:
       while the reading pane is open the whole mix eases to one quarter */
    this.duckG = c.createGain();
    this.duckG.gain.value = this.readingOpen ? 0.25 : 1;
    this.mix = c.createGain();
    this.mix.connect(this.duckG);
    this.duckG.connect(this.master);
    /* the ear the verifier listens with: post-master, so the toggle shows too */
    this.an = c.createAnalyser();
    this.an.fftSize = 2048;
    this.master.connect(this.an);

    /* --- the bed: wind through rigging, and water along the hull --- */
    const len = Math.floor(c.sampleRate * 4);
    const nb = c.createBuffer(1, len, c.sampleRate);
    const d = nb.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = 0.02 * w + 0.98 * last;        // brown-ish
      d[i] = last * 3.2 + w * 0.15;
    }
    const src = c.createBufferSource();
    src.buffer = nb; src.loop = true;

    const windBP = c.createBiquadFilter();
    windBP.type = 'bandpass'; windBP.frequency.value = 520; windBP.Q.value = 0.7;
    /* OWNER MIX LAW (revised three times): the wind is a continuous sound -
       so the whole wind layer sits at THIRTY PERCENT of its original gain -
       first halved, then cut another 40 percent. 0.16 * 0.30 = 0.048. */
    const windG = c.createGain(); windG.gain.value = 0.0336;   // 21% of original: 30% then a further -30% by owner order

    const seaLP = c.createBiquadFilter();
    seaLP.type = 'lowpass'; seaLP.frequency.value = 320;
    const seaG = c.createGain(); seaG.gain.value = 0.5;

    src.connect(windBP); windBP.connect(windG); windG.connect(this.mix);
    src.connect(seaLP); seaLP.connect(seaG); seaG.connect(this.mix);
    src.start();

    /* the swell breathes the water gain: the same period as the plate's roll */
    const lfo = c.createOscillator(); lfo.frequency.value = 0.19;
    const lfoG = c.createGain(); lfoG.gain.value = 0.26;
    lfo.connect(lfoG); lfoG.connect(seaG.gain); lfo.start();
    const lfo2 = c.createOscillator(); lfo2.frequency.value = 0.073;
    const lfo2G = c.createGain(); lfo2G.gain.value = 180;
    lfo2.connect(lfo2G); lfo2G.connect(windBP.frequency); lfo2.start();

    this.bed = { windG, seaG, windBP };
    this.decodeAll();
  },

  /* the rain layer (stage 2): a soft high wash through the same mix, so the
     duck and the master rule it like everything else */
  wxTune(rain, squall) {
    if (!this.ctx || !this.bed) return;
    const c = this.ctx, t = c.currentTime;
    if (!this.wxRain) {
      const len = Math.floor(c.sampleRate * 2);
      const nb = c.createBuffer(1, len, c.sampleRate);
      const d = nb.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src2 = c.createBufferSource();
      src2.buffer = nb; src2.loop = true;
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2900; bp.Q.value = 0.55;
      const gn = c.createGain(); gn.gain.value = 0;
      src2.connect(bp); bp.connect(gn); gn.connect(this.mix);
      src2.start();
      this.wxRain = { gn, bp, noise: nb };
    }
    this.wxRain.gn.gain.setTargetAtTime(0.026 * rain + 0.012 * squall, t, 1.4);
  },
  /* one rolled thunder, softer than any voice, decaying long */
  thunder() {
    if (!this.ctx || !this.on || !this.wxRain) return;
    const c = this.ctx, t = c.currentTime;
    const src2 = c.createBufferSource();
    src2.buffer = this.wxRain.noise; src2.loop = true; src2.playbackRate.value = 0.22;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 130; lp.Q.value = 0.4;
    const gn = c.createGain();
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(0.20, t + 0.18);
    gn.gain.exponentialRampToValueAtTime(0.10, t + 1.1);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
    src2.connect(lp); lp.connect(gn); gn.connect(this.mix);
    src2.start(t); src2.stop(t + 3.4);
    diag.thunderPlayed = (diag.thunderPlayed || 0) + 1;
  },

  /* the wind bed follows the real wind and the sail actually set */
  tune(windKn, knotsFrac) {
    if (!this.ctx || !this.bed) return;
    const t = this.ctx.currentTime;
    /* the tune keeps its shape but the whole wind layer carries the owner's
       30% trim - the chants are what one should hear, the wind stays low */
    this.bed.windG.gain.setTargetAtTime(0.21 * (0.09 + 0.14 * clamp(windKn / 24, 0, 1) + 0.05 * knotsFrac), t, 0.6);
    this.bed.seaG.gain.setTargetAtTime(0.30 + 0.34 * knotsFrac, t, 0.6);
  },

  /* Voices join at the cadence of the harbour's own commits. An island worked
     often takes up the chant quickly; a page touched twice in four years is
     slow to answer. The chorus never exceeds the number of hands that keep her. */
  setHarbour(isle) {
    if (!isle) return;
    const perMonth = isle.careDays > 0 ? isle.commits / (isle.careDays / 30.4) : 0;
    this.joinEvery = clamp(26 / (1 + perMonth * 2.2), 3.2, 26);
    this.wantVoices = clamp(isle.authors.length, 1, 7);
    diag.joinEvery = Math.round(this.joinEvery * 10) / 10;
  },

  /* ---- THE PROGRAMME ----
     One-shot phrases in call-and-response, never looped. The lead hand calls
     (call or verse); the watch answers after the call, each answer off the
     beat. Laws, every one provable from the trigger log (__helmSound.trig):
     never the same phrase twice in a row; no phrase-to-phrase sequence heard
     again within ten minutes; a new small pitch and level for every play;
     silence between phrases - the bed alone carries those bars. */
  step(dt, sailing) {
    if (!this.ctx || !this.on) return;
    if (!sailing) { if (this.crew || this.active.length) this.hush(2.0); return; }
    if (!this.bank.length) return;
    const now = this.ctx.currentTime;
    if (this.crew < this.wantVoices) {
      this.nextJoin -= dt;
      if (this.nextJoin <= 0) {
        this.slotNext[this.crew] = now + 0.3 + Math.random() * 1.4;
        this.crew++;
        this.nextJoin = this.joinEvery;
        diag.voicesSinging = this.crew;
      }
    }
    if (now < this.holdUntil) return;
    /* a featured verse (the suno slot) takes the deck alone, now and then */
    if (this.featured.length && this.nextFeatureAt && now >= this.nextFeatureAt && this.crew > 0) {
      this.playFeatured(now);
      return;
    }
    for (let s = 0; s < this.crew; s++)
      if (now >= (this.slotNext[s] || 0)) this.sing(s, now);
  },

  sing(s, now) {
    /* one start per bar, ship-wide: with seventeen phrases the ten-minute
       law affords at most ~272 pairs in the window; a floor of 1.9 s between
       any two starts keeps the walk well inside that budget and no two
       phrases can ever begin an audible-double apart */
    if (now - this.lastStart < 1.9) {
      this.slotNext[s] = this.lastStart + 1.9 + Math.random() * 0.7;
      return;
    }
    const lead = s === 0;
    let pool;
    if (lead) pool = ['call', 'verse'];
    else if (this.crew >= 4 && Math.random() < 0.10) pool = ['watch'];
    else if (this.crew >= 3 && Math.random() < 0.07) pool = ['accent'];
    else pool = ['response'];
    const pick = this.pickPhrase(pool);
    if (!pick) { this.slotNext[s] = now + 2; return; }
    const dur = this.playPhrase(pick, s, now);
    /* the silence law: every phrase is followed by a breath, longer where
       the harbour's own rhythm is slow */
    this.slotNext[s] = now + dur + 1.6 + Math.random() * 2.8 + this.joinEvery * 0.12;
    if (lead) {
      /* call and response: the watch holds until the call is mostly out */
      for (let o = 1; o < this.crew; o++)
        this.slotNext[o] = Math.max(this.slotNext[o] || 0,
          now + dur * (0.55 + Math.random() * 0.5) + (o - 1) * (0.35 + Math.random() * 0.55));
    }
  },

  pickPhrase(pools) {
    const now = this.ctx.currentTime;
    /* the three picking laws, applied to any candidate list:
       one - never the same phrase twice in a row, anywhere in the programme;
       one-and-a-half - no phrase STARTS again within 20 s of its own last
       start, on any slot (the audible-double law: two slots may never take
       up the same phrase moments apart);
       two - no phrase-to-phrase sequence heard again within ten minutes. */
    const lawful = list => list.filter(b =>
      b.name !== this.lastId &&
      now - (this.lastPlay.get(b.name) || -1e9) > 20 &&
      (!this.lastId || (t => t === undefined || now - t > 600)(this.gram.get(this.lastId + '>' + b.name))));
    let ok = lawful(this.bank.filter(b => pools.indexOf(b.role) >= 0));
    /* when a role's pool has no lawful successor the WHOLE bank is asked
       before anyone opens their mouth - and when the whole bank is unlawful
       the bar stays SILENT and the bed carries it. The law never relaxes. */
    if (!ok.length) ok = lawful(this.bank);
    if (!ok.length) { diag.lawSilences = (diag.lawSilences || 0) + 1; return null; }
    /* among the lawful, lean to the least recently heard */
    ok.sort((a, b) => (this.lastPlay.get(a.name) || 0) - (this.lastPlay.get(b.name) || 0));
    const w = ok.slice(0, Math.max(1, Math.min(3, ok.length)));
    return w[Math.floor(Math.random() * w.length)];
  },

  playPhrase(pick, s, now) {
    const c = this.ctx;
    const src = c.createBufferSource();
    src.buffer = pick.buf;
    /* law three: a new small pitch and level for every play */
    const rate = 1 + (Math.random() - 0.5) * 0.036;
    src.playbackRate.value = rate;
    /* owner order: sung voices +20% over the old levels (0.34 lead, 0.22
       watch), capped well below clipping by the master at 0.85 */
    const level = pick.gain * (s === 0 ? 0.408 : 0.264) * (0.90 + Math.random() * 0.20);
    const dur = pick.buf.duration / rate;
    const g = c.createGain();
    g.gain.value = 0;
    g.gain.setTargetAtTime(level, now, 0.30);
    g.gain.setTargetAtTime(0, now + Math.max(0.2, dur - 0.40), 0.28);
    const pan = c.createStereoPanner ? c.createStereoPanner() : null;
    if (pan) {
      pan.pan.value = s === 0 ? 0 : ((s % 2 ? 1 : -1) * (0.18 + 0.11 * s)) * (0.8 + Math.random() * 0.4);
      src.connect(g); g.connect(pan); pan.connect(this.mix);
    } else { src.connect(g); g.connect(this.mix); }
    src.start(now + 0.02);
    src.stop(now + dur + 1.0);
    const rec = { g, src };
    this.active.push(rec);
    src.onended = () => { const i = this.active.indexOf(rec); if (i >= 0) this.active.splice(i, 1); };
    /* the log that proves the laws */
    if (this.lastId) this.gram.set(this.lastId + '>' + pick.name, now);
    this.lastId = pick.name;
    this.lastPlay.set(pick.name, now);
    this.lastStart = now;
    this.trig.push({ t: Math.round(now * 100) / 100, id: pick.name, slot: s,
      rate: Math.round(rate * 1000) / 1000, level: Math.round(level * 1000) / 1000 });
    if (this.trig.length > 800) this.trig.splice(0, this.trig.length - 800);
    diag.shantyTrigs = this.trig.length;
    if (this.gram.size > 900) {
      for (const [k, t] of this.gram) if (now - t > 900) this.gram.delete(k);
    }
    return dur;
  },

  playFeatured(now) {
    const v = this.featured[this.featIx % this.featured.length];
    this.featIx++;
    const c = this.ctx;
    const src = c.createBufferSource();
    src.buffer = v.buf;
    const g = c.createGain();
    g.gain.value = 0;
    g.gain.setTargetAtTime(v.gain, now, 0.6);
    const dur = v.buf.duration;
    g.gain.setTargetAtTime(0, now + Math.max(0.5, dur - 0.9), 0.5);
    src.connect(g); g.connect(this.mix);
    src.start(now + 0.05);
    src.stop(now + dur + 1.5);
    const rec = { g, src };
    this.active.push(rec);
    src.onended = () => { const i = this.active.indexOf(rec); if (i >= 0) this.active.splice(i, 1); };
    this.holdUntil = now + dur + 2.5;      /* the crew stands silent for the verse */
    this.lastStart = now;
    this.nextFeatureAt = now + dur + 90 + Math.random() * 60;
    this.trig.push({ t: Math.round(now * 100) / 100, id: v.name, slot: 'featured', rate: 1, level: v.gain });
    caption('The crew takes up "' + v.title + '" - ' + v.by + '.', 5600);
  },

  /* the cable runs out and the hook takes the ground: the one arrival
     one-shot, synthesised like the bed, and it speaks BEFORE the duck settles */
  anchorShot() {
    if (!this.ctx || !this.on) return;
    const c = this.ctx, t = c.currentTime;
    const len = Math.floor(c.sampleRate * 0.9);
    const nb = c.createBuffer(1, len, c.sampleRate);
    const d = nb.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const x = i / c.sampleRate;
      const pulse = Math.max(0, Math.sin(x * 2 * Math.PI * (11 - x * 6)));
      d[i] = (Math.random() * 2 - 1) * pulse * Math.exp(-x * 2.2);
    }
    const src = c.createBufferSource(); src.buffer = nb;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 820; bp.Q.value = 1.1;
    const g = c.createGain(); g.gain.value = 0.42;
    src.connect(bp); bp.connect(g); g.connect(this.mix);
    src.start(t);
    const o = c.createOscillator();
    o.frequency.setValueAtTime(120, t + 0.55);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.85);
    const og = c.createGain();
    og.gain.setValueAtTime(0.0001, t + 0.55);
    og.gain.exponentialRampToValueAtTime(0.4, t + 0.62);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 1.05);
    o.connect(og); og.connect(this.mix);
    o.start(t + 0.55); o.stop(t + 1.1);
  },

  /* THE DUCK (owner order): while the reading pane is open the entire mix
     eases to one quarter - about minus twelve decibels - and eases back when
     it closes. No clicks: exponential targets both ways. The programme keeps
     running behind the duck; nothing stops. */
  reading(open) {
    open = !!open;
    if (this.readingOpen === open) return;
    this.readingOpen = open;
    diag.ducked = open;
    if (!this.ctx || !this.duckG) return;
    const t = this.ctx.currentTime;
    this.duckG.gain.cancelScheduledValues(t);
    this.duckG.gain.setTargetAtTime(open ? 0.25 : 1, t + (open ? 0.35 : 0.02), open ? 0.40 : 0.30);
  },

  /* the verifier's ear: mean RMS off the analyser over roughly `sec` seconds */
  rms(sec) {
    const an = this.an;
    if (!an) return Promise.resolve(0);
    const buf = new Float32Array(an.fftSize);
    let acc = 0, n = 0;
    return new Promise(res => {
      const t0 = performance.now();
      const tick = () => {
        an.getFloatTimeDomainData(buf);
        let s = 0;
        for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
        acc += Math.sqrt(s / buf.length); n++;
        if (performance.now() - t0 < (sec || 2) * 1000) setTimeout(tick, 50);
        else res(acc / Math.max(1, n));
      };
      tick();
    });
  },

  hush(sec) {
    const c = this.ctx;
    if (c) for (const v of this.active) {
      try {
        v.g.gain.cancelScheduledValues(c.currentTime);
        v.g.gain.setTargetAtTime(0, c.currentTime, (sec || 1.5) / 3);
        v.src.stop(c.currentTime + (sec || 1.5));
      } catch (e) { /* already stopped */ }
    }
    this.active = [];
    this.crew = 0;
    this.slotNext = [];
    this.nextJoin = 0;
    diag.voicesSinging = 0;
  },

  landfall(isle) {
    this.setHarbour(isle);
  },

  toggle() {
    this.on = !this.on;
    store.set('sound', this.on);
    if (this.ctx) {
      if (this.on && this.ctx.state === 'suspended') this.ctx.resume();
      this.master.gain.setTargetAtTime(this.on ? 0.85 : 0, this.ctx.currentTime, 0.12);
      if (!this.on) {
        this.hush(0.3);
        /* and then the context itself stops: silent means silent, and costs nothing */
        clearTimeout(this.offTimer);
        this.offTimer = setTimeout(() => { if (!this.on && this.ctx) this.ctx.suspend(); }, 700);
      } else clearTimeout(this.offTimer);
    }
    this.paint();
  },

  paint() {
    window.__helmSound = sound;
    const b = $('soundbtn');
    if (!b) return;
    b.classList.toggle('off', !this.on);
    b.querySelector('.sb-text').textContent = this.on ? 'sound' : 'silent';
    b.setAttribute('aria-label', this.on ? 'Silence everything (S)' : 'Let the sea be heard (S)');
    diag.sound = this.on;
  }
};

window.__helmSoundIsle = slug => world.bySlug.get(slug);

/* ---------------- boot ---------------- */
/* ============================================================
   THE SIX CROSSINGS (portal law, owner approved; the crate left the sea)
   Six passages woven into the sea, each one DISCOVERED, never a menu.
   Every affordance lives in the fiction; approaching or hovering gives one
   in-register hint line; activating plays a short in-fiction beat and then
   crosses to the sibling at ../KEY/. Zero cost while an egg is off-screen:
   every draw and every tick below opens with a cheap range check.
   Every mark derives from real data:
   (a) the nameless city  - 27 towers, one per community, heights from member
       counts; 290 lit windows, one per page, night-tended pages burn warmer.
       She stands in the emptiest sixteenth of the sea, past the last island.
   (b) the ink water      - the deepest point of the surveyed sea: the open
       water farthest from every island, where no route passes.
   (c) the coastal path   - at the anchorage of the longest page in the sea:
       the longest shore is the one a walker would take.
   (d) the moving star    - her blink counts the desert islets (the places no
       route reaches); she rides over the newest page's water.
   (e) the pressed specimen - slips from the captain's log, once per visit.
   (f) the bottle         - went over the side off the home island and
       drifted down the citation wind until it found open water.
   ============================================================ */
const eggs = {
  ready: false, crossing: null,
  city: null, ink: null, bottle: null, star: null,
  pathIsle: null,
  fixedStars: [],
  hits: [], hoverT: {}, cursorOn: false,
  hinted: {}, starHold: 0, starHinted: false,
  specimenSlipped: false,
  cityVisU2: 0
};

const EGG_HINTS = {
  city: 'No chart of ours gives it a name. Click, and she makes for the light.',
  ink: 'The water runs to flat ink past that line. Click, or sail in.',
  bottle: 'A message in a bottle. Click to fish it out.'
};

function initEggs() {
  const isles = world.islands;
  const B = world.bounds;
  const cx0 = (B.minx + B.maxx) / 2, cy0 = (B.miny + B.maxy) / 2;

  /* (a) the city stands in the emptiest sixteenth of the horizon: sixteen
     sectors around the sea's centre are weighed by the words they hold, and
     the lightest one gets the light. */
  const mass = new Array(16).fill(0);
  let maxR = 0;
  for (const I of isles) {
    const dx = I.pos.x - cx0, dy = I.pos.y - cy0;
    const s = ((Math.floor(Math.atan2(dy, dx) / TAU * 16) % 16) + 16) % 16;
    mass[s] += I.words;
    maxR = Math.max(maxR, Math.hypot(dx, dy));
  }
  let sMin = 0;
  for (let s = 1; s < 16; s++) if (mass[s] < mass[sMin]) sMin = s;
  const ca = (sMin + 0.5) / 16 * TAU;
  const cr = maxR * 1.30 + 2.6 / world.nmPerUnit;
  eggs.city = { x: cx0 + Math.cos(ca) * cr, y: cy0 + Math.sin(ca) * cr };
  eggs.cityVisU2 = Math.pow(10.5 / world.nmPerUnit, 2);

  /* (b) the deepest water: the grid point farthest from every island */
  let bestP = null, bestD = -1;
  for (let gy = 0; gy <= 34; gy++) for (let gx = 0; gx <= 44; gx++) {
    const x = B.minx + (B.maxx - B.minx) * gx / 44;
    const y = B.miny + (B.maxy - B.miny) * gy / 34;
    let dmin = Infinity;
    for (const I of isles) {
      const d2 = (I.pos.x - x) * (I.pos.x - x) + (I.pos.y - y) * (I.pos.y - y);
      if (d2 < dmin) dmin = d2;
    }
    if (dmin > bestD) { bestD = dmin; bestP = { x, y }; }
  }
  const inkR = clamp(Math.sqrt(bestD) * world.nmPerUnit * 0.34, 0.30, 0.85);
  /* the patch edge, cut once: sixteen weights around a circle */
  const er = rngFor('inkedge');
  const edge = [];
  for (let i = 0; i < 16; i++) edge.push(1 + (er() - 0.5) * 0.22);
  eggs.ink = { x: bestP.x, y: bestP.y, rNm: inkR, edge };

  /* (f) the bottle drifts down the citation wind from the home island until
     it finds open water */
  let bx = world.island.pos.x, by = world.island.pos.y, run = 0;
  for (let i = 0; i < 300; i++) {
    const w2 = windAtUnits(bx, by);
    const m = Math.hypot(w2.x, w2.y) || 1;
    bx += w2.x / m * 0.012; by += w2.y / m * 0.012;
    run += 0.012 * world.nmPerUnit;
    if (run > 1.5) {
      let dmin = Infinity;
      for (const I of isles) {
        const d = Math.hypot(I.pos.x - bx, I.pos.y - by);
        if (d < dmin) dmin = d;
      }
      if (dmin * world.nmPerUnit > 0.55) break;
    }
  }
  eggs.bottle = { x: bx, y: by };

  /* (c) the longest shore */
  eggs.pathIsle = isles.reduce((a, b) =>
    (b.words > a.words || (b.words === a.words && b.slug < a.slug)) ? b : a);

  /* (d) the star: her blink counts the desert islets, and she rides over the
     newest page's water. The fixed stars behind her are the lantern shores:
     one for every island the raw log shows tended by night. */
  const newest = isles.reduce((a, b) => (b.last > a.last ? b : a));
  eggs.star = {
    K: Math.max(2, world.desert.length),
    seed: hash32(newest.slug),
    y0: 84 + (hash32(newest.slug) % 110)
  };
  eggs.fixedStars = world.nightIsles.map(I => ({
    x: 50 + (hash32(I.slug) % (W - 100)),
    y: 26 + (hash32(I.slug + '#y') % (HORIZON - 170)),
    tw: (hash32(I.slug + '#p') % 628) / 100,
    b: clamp(0.4 + I.night * 0.12, 0.4, 1)
  }));

  eggs.ready = true;
  diag.eggs = {
    city: { x: +eggs.city.x.toFixed(4), y: +eggs.city.y.toFixed(4) },
    ink: { x: +eggs.ink.x.toFixed(4), y: +eggs.ink.y.toFixed(4), rNm: +inkR.toFixed(3) },
    bottle: { x: +bx.toFixed(4), y: +by.toFixed(4) },
    path: eggs.pathIsle.slug,
    starK: eggs.star.K, fixedStars: eggs.fixedStars.length
  };
}

function eggNm(key) {
  const E = key === 'city' ? eggs.city : key === 'ink' ? eggs.ink :
            key === 'bottle' ? eggs.bottle : null;
  if (!E) return Infinity;
  return Math.hypot(E.x - ship.x, E.y - ship.y) * world.nmPerUnit;
}
function eggBearing(key) {
  const E = key === 'city' ? eggs.city : key === 'ink' ? eggs.ink :
            key === 'bottle' ? eggs.bottle : null;
  if (!E) return 0;
  return norm360(Math.atan2(E.x - ship.x, -(E.y - ship.y)) * 180 / Math.PI);
}

/* the portal law: every crossing asks first, in the fiction - YES or NO,
   mouse or Tab or Y/N or Enter/Escape. The beat plays only on YES. */
function crossTo(key, beat, ms) {
  if (eggs.crossing || portal.open) return;
  portalAsk(key, beat, ms);
}
function reallyCross(key, beat, ms) {
  if (eggs.crossing) return;
  eggs.crossing = key;
  diag.crossing = key;
  try { visit.save(); } catch (e) {}
  captionNow(beat, 30000);
  const go = () => { window.location.href = '../' + key + '/'; };
  if (REDUCED) { go(); return; }
  setTimeout(go, ms == null ? 1600 : ms);
}

function eggActivate(key) {
  if (!eggs.ready || eggs.crossing) return;
  if (key === 'bottle' && eggNm('bottle') < 1.4) {
    crossTo('secreta', 'The cork gives: a page inked in four colours, rolled tight against the salt.', 1700);
  } else if (key === 'ink' && eggNm('ink') < 1.8) {
    crossTo('bythedeep', 'She noses in. The hatching closes over the hull like wet ink over a pen line.', 1700);
  } else if (key === 'city') {
    /* clicking the light shapes a course; the crossing is made by anchoring */
    firstOrder('steer');
    ship.orderedBearing = eggBearing('city');
    pushOrder(env.t);
    if (ship.sail === 'rest' && !ship.anchored) setSail('full', true);
    captionNow('The helm goes over: she makes for the light.', 3600);
    dirty = true;
  }
}

function eggHover(mx, my, el) {
  if (!eggs.ready || eggs.crossing) return;
  let over = null;
  for (const hh of eggs.hits) {
    if (Math.hypot(mx - hh.x, my - hh.y) < hh.r + 10) { over = hh; break; }
  }
  if (over) {
    if (!eggs.cursorOn) { el.style.cursor = 'pointer'; eggs.cursorOn = true; }
    if (env.t - (eggs.hoverT[over.key] || -99) > 9) {
      eggs.hoverT[over.key] = env.t;
      captionNow(EGG_HINTS[over.key], 3600);
    }
  } else if (eggs.cursorOn) { el.style.cursor = ''; eggs.cursorOn = false; }
}

/* approach hints, the standing crossings, and the star watch */
function eggTick(dt) {
  if (!eggs.ready || eggs.crossing) return;
  const t = env.t;

  const cd = eggNm('city');
  if (cd < 7.4 && !eggs.hinted.city &&
      Math.abs(angDiff(eggBearing('city'), ship.bearing)) < 60) {
    eggs.hinted.city = true;
    caption('Light on the horizon, where the chart shows only water. The lookout has no name for it.', 5600);
  }
  if (cd < 0.20) {
    crossTo('pixelcity', 'LAND HO! The way comes off her; a boat pulls for the glittering quay.', 1900);
    return;
  }

  const nd = eggNm('ink');
  if (nd < 1.2 && t - (eggs.hinted.ink || -99) > 26) {
    eggs.hinted.ink = t;
    captionNow('The sea turns to ink here. Sail in?', 4200);
  }
  if (nd < eggs.ink.rNm * 0.55) {
    crossTo('bythedeep', 'She noses in. The hatching closes over the hull like wet ink over a pen line.', 1700);
    return;
  }

  const bd = eggNm('bottle');
  if (bd < 1.0 && t - (eggs.hinted.bottle || -99) > 26) {
    eggs.hinted.bottle = t;
    captionNow('A corked bottle bobs on the swell, a page rolled tight inside.', 4200);
  }
  if (bd < 0.10) {
    crossTo('secreta', 'The bow lifts her from the water. The cork gives: a page inked in four colours.', 1700);
    return;
  }

  /* (d) holding the glass on the one that moves */
  if (env.hourMix > 0.55 && lens.raised && lens.t > 0.5) {
    const sp = starScreen(t);
    if (Math.hypot(lens.x - sp.x, lens.y - sp.y) < 54) {
      eggs.starHold += dt;
      if (eggs.starHold > 1.0 && !eggs.starHinted) {
        eggs.starHinted = true;
        captionNow('One light bears against the fixed stars - and it moves, and it blinks in ' +
          (eggs.star.K === 2 ? 'pairs' : eggs.star.K === 3 ? 'threes' : 'counts of ' + numToWords(eggs.star.K)) + '.', 3800);
      }
      if (eggs.starHold > 2.8) {
        crossTo('firstlight', 'That is no star. She is answering.', 1700);
        return;
      }
    } else {
      eggs.starHold = Math.max(0, eggs.starHold - dt * 1.6);
    }
  } else if (eggs.starHold > 0) {
    eggs.starHold = Math.max(0, eggs.starHold - dt * 1.6);
  }
  diag.starHold = Math.round(eggs.starHold * 100) / 100;
}

/* ---- the star (d): position and signal ---- */
function starScreen(t) {
  const S = eggs.star;
  const span = W - 260;
  let u;
  if (REDUCED) {
    u = (S.seed % 1000) / 1000;
  } else {
    const p = ((S.seed % 977) / 977 + t * 2.6 / span) % 2;
    u = p < 1 ? p : 2 - p;
  }
  return { x: 130 + u * span, y: S.y0 + (REDUCED ? 0 : Math.sin(t * 0.23) * 12) };
}
function starBlink(t) {
  const K = eggs.star.K, FL = 0.30, GAP = 0.26, PAUSE = 1.7;
  const cyc = K * (FL + GAP) + PAUSE;
  const u = (t + (eggs.star.seed % 7)) % cyc;
  const i = Math.floor(u / (FL + GAP));
  return i < K && (u - i * (FL + GAP)) < FL;
}

function drawStars(map) {
  const mix = env.hourMix;
  if (mix < 0.55 || !eggs.ready) return;
  const a0 = (mix - 0.55) / 0.45;
  const k = map ? map.k : 1, ox = map ? map.ox : 0, oy = map ? map.oy : 0;
  const t = env.t;
  ctx.fillStyle = 'rgba(246,238,218,1)';
  for (const s of eggs.fixedStars) {
    const x = s.x * k + ox, y = s.y * k + oy;
    if (map && (x < map.x0 || x > map.x1 || y < map.y0 || y > map.y1)) continue;
    ctx.globalAlpha = a0 * s.b * (REDUCED ? 0.7 : (0.55 + 0.45 * Math.sin(t * 1.7 + s.tw)));
    ctx.fillRect(x - 0.8 * k, y - 0.8 * k, 1.6 * k, 1.6 * k);
  }
  const sp = starScreen(t);
  const on = starBlink(t);
  const x = sp.x * k + ox, y = sp.y * k + oy;
  if (!map || (x > map.x0 - 10 && x < map.x1 + 10 && y > map.y0 - 10 && y < map.y1 + 10)) {
    ctx.globalAlpha = a0 * (on ? 0.95 : 0.15);
    ctx.fillRect(x - 1.1 * k, y - 1.1 * k, 2.2 * k, 2.2 * k);
    if (on) {
      ctx.strokeStyle = 'rgba(246,238,218,0.85)';
      ctx.lineWidth = 0.7 * k;
      ctx.globalAlpha = a0 * 0.7;
      ctx.beginPath();
      ctx.moveTo(x - 4.6 * k, y); ctx.lineTo(x + 4.6 * k, y);
      ctx.moveTo(x, y - 4.6 * k); ctx.lineTo(x, y + 4.6 * k);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

/* ---- shared projection for marks floating on the water ---- */
function eggScreen(wx, wy, worldDY, map) {
  const dx = wx - ship.x, dy = wy - ship.y;
  const dist = Math.hypot(dx, dy) * world.nmPerUnit;
  const az = angDiff(norm360(Math.atan2(dx, -dy) * 180 / Math.PI), ship.bearing);
  const f = Math.pow(clamp(1 - dist / 3.4, 0, 1), 1.55);
  let x = W / 2 + az * PXDEG;
  let y = HORIZON + 8 + f * 168 + worldDY * (0.6 + f * 0.8);
  let s = clamp(0.34 / Math.max(dist, 0.12), 0.08, 3.4);
  if (map) { x = x * map.k + map.ox; y = y * map.k + map.oy; s *= map.k; }
  return { x, y, s, dist, az, f };
}

function drawEggs(sim, worldDY, map) {
  if (!eggs.ready) return;
  drawStars(map);
  drawConstellation(map);
  drawInkEgg(sim, worldDY, map);
  drawBottleEgg(sim, worldDY, map);
}

/* (b) the ink water: flat cel fills and clean outlines, deliberately another
   hand - past this line it is a different world. A white-gloved buoy waves. */
function drawInkEgg(sim, worldDY, map) {
  const E = eggs.ink;
  const dxu = E.x - ship.x, dyu = E.y - ship.y;
  if (dxu * dxu + dyu * dyu > Math.pow(5.2 / world.nmPerUnit, 2)) return;
  const P = eggScreen(E.x, E.y, worldDY, map);
  if (P.dist > 5.2 || Math.abs(P.az) > 70) return;
  const rx = clamp(430 * E.rNm / Math.max(P.dist, 0.15), 6, 780) * (map ? map.k : 1);
  if (rx < 7) return;
  const ry = rx * 0.24;
  const t = env.t, g = ctx;
  g.save();
  g.translate(P.x, P.y);
  /* the patch itself */
  const pts = [];
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * TAU;
    pts.push([Math.cos(a) * rx * E.edge[i], Math.sin(a) * ry * E.edge[i]]);
  }
  g.beginPath();
  pathThrough(g, pts, true);
  g.fillStyle = 'rgba(88,140,178,0.92)';
  g.fill();
  g.lineWidth = Math.max(1.3, rx * 0.018);
  g.strokeStyle = 'rgba(22,34,44,0.92)';
  g.stroke();
  if (rx > 26) {
    /* cel waves: fat white curls with flat ends, nothing hatched */
    g.strokeStyle = 'rgba(244,240,230,0.95)';
    g.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const wx2 = (i - 1) * rx * 0.42 + (REDUCED ? 0 : Math.sin(t * 1.1 + i * 2.4) * rx * 0.03);
      const wy2 = ry * (i === 1 ? 0.28 : -0.14);
      const ww = rx * 0.22;
      g.lineWidth = Math.max(1.6, rx * 0.028);
      g.beginPath();
      g.moveTo(wx2 - ww, wy2);
      g.quadraticCurveTo(wx2, wy2 - ww * 0.5, wx2 + ww * 0.55, wy2 - ww * 0.14);
      g.quadraticCurveTo(wx2 + ww * 0.30, wy2 - ww * 0.36, wx2 + ww * 0.16, wy2 - ww * 0.24);
      g.stroke();
    }
  }
  if (rx > 46) {
    /* the buoy, waving its white glove */
    const bx2 = rx * 0.24, by2 = ry * 0.1 + (REDUCED ? 0 : Math.sin(t * 2.1) * ry * 0.08);
    const bh = rx * 0.17;
    g.translate(bx2, by2);
    g.rotate(REDUCED ? 0 : Math.sin(t * 1.4) * 0.06);
    g.lineWidth = Math.max(1.4, bh * 0.09);
    g.strokeStyle = 'rgba(22,34,44,0.95)';
    /* body: a cel bell, red over paper bands */
    g.beginPath();
    g.moveTo(-bh * 0.42, 0);
    g.quadraticCurveTo(-bh * 0.34, -bh, 0, -bh * 1.06);
    g.quadraticCurveTo(bh * 0.34, -bh, bh * 0.42, 0);
    g.closePath();
    g.fillStyle = '#c8563a';
    g.fill();
    g.stroke();
    g.save();
    g.clip();
    g.fillStyle = 'rgba(244,240,230,0.96)';
    g.fillRect(-bh * 0.5, -bh * 0.66, bh, bh * 0.22);
    g.restore();
    /* the arm and the white glove, waving */
    const wave = REDUCED ? 0.5 : Math.sin(t * 3.6) * 0.6 + 0.35;
    g.save();
    g.translate(0, -bh * 1.02);
    g.rotate(-0.9 + wave * 0.55);
    g.beginPath();
    g.moveTo(0, 0);
    g.quadraticCurveTo(bh * 0.30, -bh * 0.34, bh * 0.52, -bh * 0.52);
    g.lineWidth = Math.max(1.6, bh * 0.13);
    g.stroke();
    g.translate(bh * 0.56, -bh * 0.58);
    g.fillStyle = '#f6f2e8';
    g.beginPath();
    g.arc(0, 0, bh * 0.22, 0, TAU);
    g.fill();
    for (const fa of [-0.7, -0.1, 0.5]) {
      g.beginPath();
      g.arc(Math.cos(fa - 0.9) * bh * 0.24, Math.sin(fa - 0.9) * bh * 0.24 - bh * 0.04, bh * 0.09, 0, TAU);
      g.fill();
    }
    g.lineWidth = Math.max(1.1, bh * 0.07);
    g.beginPath();
    g.arc(0, 0, bh * 0.22, 0, TAU);
    g.stroke();
    g.restore();
  }
  g.restore();
  g.lineCap = 'butt';
  if (!map) eggs.hits.push({ key: 'ink', x: P.x, y: P.y, r: Math.max(16, rx * 0.5), d: P.dist });
}

/* (f) the bottle: engraved glass, a cork, and the rolled four-colour page */
function drawBottleEgg(sim, worldDY, map) {
  const E = eggs.bottle;
  const dxu = E.x - ship.x, dyu = E.y - ship.y;
  if (dxu * dxu + dyu * dyu > Math.pow(3.0 / world.nmPerUnit, 2)) return;
  const P = eggScreen(E.x, E.y, worldDY, map);
  if (P.dist > 3.0 || Math.abs(P.az) > 70) return;
  const s = P.s * 1.5;
  if (s < 0.24) return;
  const t = env.t, g = ctx;
  const bob = REDUCED ? 0 : Math.sin(t * 1.3 + 1) * 3 * Math.min(s, 1.4);
  g.save();
  g.translate(P.x, P.y + bob);
  /* ripple rings */
  g.strokeStyle = 'rgba(58,44,28,0.4)';
  g.lineWidth = Math.max(0.7, s);
  for (const rr of [1, 1.7]) {
    g.globalAlpha = 0.35 / rr;
    g.beginPath();
    g.ellipse(0, 6 * s, 26 * s * rr, 6.5 * s * rr, 0, 0, TAU);
    g.stroke();
  }
  g.globalAlpha = 1;
  g.rotate(0.42 + (REDUCED ? 0 : Math.sin(t * 0.9) * 0.12));
  /* glass body, lying in the water */
  const bw = 15 * s, bl = 34 * s;
  g.fillStyle = 'rgba(70,88,64,0.42)';
  g.strokeStyle = 'rgba(38,30,18,0.9)';
  g.lineWidth = Math.max(0.8, 1.3 * s);
  g.beginPath();
  g.moveTo(-bl * 0.5, -bw * 0.5);
  g.quadraticCurveTo(-bl * 0.62, 0, -bl * 0.5, bw * 0.5);
  g.lineTo(bl * 0.16, bw * 0.5);
  g.quadraticCurveTo(bl * 0.34, bw * 0.4, bl * 0.42, bw * 0.16);
  g.lineTo(bl * 0.62, bw * 0.16);
  g.lineTo(bl * 0.62, -bw * 0.16);
  g.lineTo(bl * 0.42, -bw * 0.16);
  g.quadraticCurveTo(bl * 0.34, -bw * 0.4, bl * 0.16, -bw * 0.5);
  g.closePath();
  g.fill();
  g.stroke();
  /* the rolled page inside, four colour bands showing through the glass */
  if (s > 0.3) {
    g.save();
    g.rotate(-0.06);
    g.fillStyle = 'rgba(241,231,208,0.95)';
    g.fillRect(-bl * 0.36, -bw * 0.26, bl * 0.5, bw * 0.5);
    const cols = ['#3f6f8e', '#a34a36', '#b8952c', '#2c2114'];
    for (let i = 0; i < 4; i++) {
      g.fillStyle = cols[i];
      g.fillRect(-bl * 0.36 + 2 * s + i * bl * 0.115, -bw * 0.20, bl * 0.055, bw * 0.4);
    }
    g.strokeStyle = 'rgba(58,44,28,0.7)';
    g.lineWidth = Math.max(0.6, 0.9 * s);
    g.strokeRect(-bl * 0.36, -bw * 0.26, bl * 0.5, bw * 0.5);
    g.restore();
  }
  /* cork and glint */
  g.fillStyle = 'rgba(150,116,72,0.95)';
  g.fillRect(bl * 0.60, -bw * 0.14, bl * 0.13, bw * 0.28);
  g.strokeRect(bl * 0.60, -bw * 0.14, bl * 0.13, bw * 0.28);
  g.strokeStyle = 'rgba(244,238,220,0.85)';
  g.lineWidth = Math.max(0.7, 1.1 * s);
  g.beginPath();
  g.moveTo(-bl * 0.34, -bw * 0.34);
  g.quadraticCurveTo(0, -bw * 0.48, bl * 0.22, -bw * 0.34);
  g.stroke();
  g.restore();
  if (!map) eggs.hits.push({ key: 'bottle', x: P.x, y: P.y, r: Math.max(14, 30 * s), d: P.dist });
}

/* (a) the nameless city: 27 towers (one per community, heights from member
   counts), 290 windows (one per page), lit against the far sky */
function bakeCity() {
  const CW = 480, CH = 190, GY = 172;
  const [c, g] = mkCanvas(CW, CH);
  const rnd = rngFor('city');
  const sizes = world.communities.map((cm, i) => ({ i, n: cm.members.length }))
    .sort((a, b) => b.n - a.n || a.i - b.i);
  const order = [];
  sizes.forEach((sz, k) => { if (k % 2) order.unshift(sz); else order.push(sz); });
  const wsum = order.reduce((a, s) => a + (8 + Math.sqrt(s.n) * 3.4), 0);
  let x = (CW - wsum) / 2;
  const towers = [];
  for (const sz of order) {
    const tw = 8 + Math.sqrt(sz.n) * 3.4;
    const th = Math.min(150, 26 + sz.n * 2.05 + rnd() * 8);
    towers.push({ comm: sz.i, x, w: tw, h: th });
    x += tw;
  }
  g.strokeStyle = 'rgba(44,33,20,0.9)';
  g.lineWidth = 0.9;
  for (const T of towers) {
    g.fillStyle = 'rgba(58,44,28,0.32)';
    g.fillRect(T.x, GY - T.h, T.w, T.h);
    g.strokeRect(T.x + 0.5, GY - T.h + 0.5, T.w - 1, T.h - 1);
    /* stepped crowns: the blocky profile of a city built of squares */
    const steps = 1 + Math.floor(rnd() * 3);
    let sy = GY - T.h, sw = T.w;
    for (let s2 = 0; s2 < steps; s2++) {
      sw *= 0.55;
      sy -= 3 + rnd() * 5;
      const sx = T.x + (T.w - sw) * (0.2 + rnd() * 0.6);
      g.fillStyle = 'rgba(58,44,28,0.34)';
      g.fillRect(sx, sy, sw, GY - T.h - sy + 1);
      g.strokeRect(sx + 0.5, sy + 0.5, sw - 1, GY - T.h - sy);
    }
    /* light vertical hatch on the faces */
    g.globalAlpha = 0.22;
    g.beginPath();
    for (let hx2 = T.x + 2; hx2 < T.x + T.w - 1; hx2 += 2.6) {
      g.moveTo(hx2, GY - T.h + 2);
      g.lineTo(hx2, GY - 1);
    }
    g.stroke();
    g.globalAlpha = 1;
  }
  g.beginPath();
  g.moveTo(towers[0].x - 14, GY);
  g.lineTo(x + 14, GY);
  g.stroke();
  bake.city = c;
  bake.cityW = CW; bake.cityH = CH; bake.cityGY = GY;
  const byComm = new Map(towers.map(T => [T.comm, T]));
  const wins = [];
  let ri = 0;
  for (const I of world.islands) {
    let T = byComm.get(I.comm);
    if (!T) T = towers[(ri++) % towers.length];
    const hsh = hash32(I.slug);
    wins.push({
      x: T.x + 1.8 + (hsh % 997) / 997 * (T.w - 4),
      y: GY - 4 - ((hsh >>> 10) % 997) / 997 * (T.h - 9),
      ph: ((hsh >>> 20) % 997) / 997,
      night: I.night > 0
    });
  }
  bake.cityWins = wins;
}

function drawCityEgg(sim, worldDY, isLens) {
  const C = eggs.city;
  const dxu = C.x - ship.x, dyu = C.y - ship.y;
  const d2 = dxu * dxu + dyu * dyu;
  if (d2 > eggs.cityVisU2) return;
  const dist = Math.sqrt(d2) * world.nmPerUnit;
  const az = angDiff(norm360(Math.atan2(dxu, -dyu) * 180 / Math.PI), ship.bearing);
  if (Math.abs(az) > 66) return;
  if (!bake.city) bakeCity();
  const t = env.t, mix = env.hourMix, g = ctx;
  const x = W / 2 + az * PXDEG;
  const yBase = HORIZON + worldDY + 5;
  const wpx = clamp(340 * 2.3 / Math.max(dist, 0.18), 26, 1500);
  const s = wpx / bake.cityW;
  const hpx = bake.cityH * s;
  const top = yBase - bake.cityGY * s;
  /* light over a city, before the city */
  const glowR = Math.max(30, wpx * 0.62);
  const gr = g.createRadialGradient(x, yBase - hpx * 0.32, 0, x, yBase - hpx * 0.32, glowR);
  const ga = 0.10 + 0.16 * mix;
  gr.addColorStop(0, 'rgba(255,222,150,' + ga + ')');
  gr.addColorStop(1, 'rgba(255,222,150,0)');
  g.fillStyle = gr;
  g.fillRect(x - glowR, yBase - hpx * 0.32 - glowR, glowR * 2, glowR * 2);
  /* the silhouette, hazed by range like any coast */
  g.globalAlpha = dist <= 2.9
    ? clamp(0.5 + (2.9 - dist) * 0.5, 0.5, 1)
    : lerp(0.5, 0.30, clamp((dist - 2.9) / 6.5, 0, 1));
  g.drawImage(bake.city, x - wpx / 2, top, wpx, hpx);
  g.globalAlpha = 1;
  /* the glitter: one window per page */
  if (wpx > 60) {
    const wa = 0.30 + 0.62 * Math.max(mix, 0.25);
    const ws2 = Math.max(0.8, 1.9 * s);
    for (const wn of bake.cityWins) {
      const tw2 = REDUCED ? 0.75
        : 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(t * (wn.night ? 2.6 : 1.7) + wn.ph * TAU));
      g.globalAlpha = wa * tw2;
      g.fillStyle = wn.night ? 'rgba(255,206,120,1)' : 'rgba(250,232,180,1)';
      g.fillRect(x - wpx / 2 + wn.x * s, top + wn.y * s, ws2, ws2);
    }
  } else {
    g.globalAlpha = (0.45 + 0.4 * (REDUCED ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2.3))) * (0.5 + 0.5 * mix);
    g.fillStyle = 'rgba(252,228,160,0.95)';
    g.fillRect(x - wpx * 0.32, yBase - 2.5, wpx * 0.64, 1.7);
  }
  /* her light lies on the water */
  if (wpx > 40) {
    g.globalAlpha = 0.10 + 0.16 * mix;
    g.strokeStyle = 'rgba(255,214,130,0.9)';
    g.lineWidth = 1.2;
    g.beginPath();
    for (let i = 0; i < 9; i++) {
      const rx2 = x + (i - 4) * wpx * 0.05 + (REDUCED ? 0 : Math.sin(t * 1.3 + i * 2.1) * 3);
      g.moveTo(rx2 - wpx * 0.03, yBase + 3 + i * 1.6);
      g.lineTo(rx2 + wpx * 0.03, yBase + 3 + i * 1.6);
    }
    g.stroke();
  }
  g.globalAlpha = 1;
  if (!isLens) eggs.hits.push({ key: 'city', x, y: yBase - hpx * 0.3, r: Math.max(26, wpx * 0.35), d: dist });
}

/* ---- helm hooks for the crossings ---- */
function eggState() {
  if (!eggs.ready) return null;
  return {
    city: { x: eggs.city.x, y: eggs.city.y, nm: +eggNm('city').toFixed(2) },
    ink: { x: eggs.ink.x, y: eggs.ink.y, rNm: eggs.ink.rNm, nm: +eggNm('ink').toFixed(2) },
    bottle: { x: eggs.bottle.x, y: eggs.bottle.y, nm: +eggNm('bottle').toFixed(2) },
    path: { slug: eggs.pathIsle.slug },
    star: { K: eggs.star.K, screen: starScreen(env.t), on: starBlink(env.t), hold: +eggs.starHold.toFixed(2) },
    specimen: { slipped: eggs.specimenSlipped },
    crossing: eggs.crossing,
    hits: eggs.hits.map(h => ({ key: h.key, x: Math.round(h.x), y: Math.round(h.y), r: Math.round(h.r) }))
  };
}
function eggSailTo(key, nm) {
  if (!eggs.ready) return false;
  if (key === 'path') { placeShipAtDistance(nm == null ? 1.0 : nm, eggs.pathIsle); dirty = true; return true; }
  const E = key === 'city' ? eggs.city : key === 'ink' ? eggs.ink :
            key === 'bottle' ? eggs.bottle : null;
  if (!E) return false;
  const B = world.bounds;
  const cx0 = (B.minx + B.maxx) / 2, cy0 = (B.miny + B.maxy) / 2;
  let ax2 = E.x - cx0, ay2 = E.y - cy0;
  const m = Math.hypot(ax2, ay2);
  if (m < 1e-6) { ax2 = 0; ay2 = 1; } else { ax2 /= m; ay2 /= m; }
  const d = (nm == null ? 0.8 : nm) / world.nmPerUnit;
  ship.x = E.x - ax2 * d;
  ship.y = E.y - ay2 * d;
  /* the bottle rides a point or so off the bow, clear of the bow post */
  const brg = norm360(Math.atan2(E.x - ship.x, -(E.y - ship.y)) * 180 / Math.PI -
                      (key === 'bottle' ? 12 : 0));
  ship.bearing = ship.orderedBearing = brg;
  ship.omega = 0;
  ship.orderHist = [[env.t, brg]];
  ship.anchored = false;
  ship.boundLock = false;
  ship.clearOf = null;
  ship.lastFix = { x: ship.x, y: ship.y, t: env.t };
  calm.done = true;
  dirty = true;
  return true;
}

/* (e) the pressed specimen and (c) the coastal path live in the reading DOM
   and are wired where the log and the shoreside are rendered. */
const SPECIMEN_SVG =
  '<svg viewBox="0 0 132 84" width="132" height="84" aria-hidden="true">' +
  '<g fill="none" stroke="#3b2c1a" stroke-width="1.3" stroke-linecap="round">' +
  '<path d="M 14 74 C 34 62 52 44 66 30 C 74 22 82 16 92 12"/>' +
  '<path d="M 40 55 C 36 46 38 38 44 32" stroke-width="1"/>' +
  '<path d="M 40 55 C 47 52 53 46 55 39" stroke-width="1"/>' +
  '<path d="M 58 38 C 52 30 52 22 57 15" stroke-width="1"/>' +
  '<path d="M 58 38 C 66 36 72 30 74 22" stroke-width="1"/>' +
  '<path d="M 26 66 C 24 60 25 54 29 49" stroke-width="1"/>' +
  '<path d="M 26 66 C 32 64 37 60 39 54" stroke-width="1"/>' +
  '</g>' +
  '<g fill="#6a5a3a" fill-opacity="0.30" stroke="#3b2c1a" stroke-width="0.9">' +
  '<path d="M 44 32 C 40 24 42 16 48 11 C 52 17 52 26 48 32 Z"/>' +
  '<path d="M 57 15 C 56 9 59 4 65 2 C 67 8 64 14 60 17 Z"/>' +
  '<path d="M 29 49 C 25 43 25 36 30 31 C 34 37 34 44 32 49 Z"/>' +
  '</g>' +
  '<g fill="#8d2f22" fill-opacity="0.55" stroke="#3b2c1a" stroke-width="0.9">' +
  '<circle cx="94" cy="10" r="4.2"/>' +
  '<circle cx="99" cy="15" r="3.1"/>' +
  '<circle cx="89" cy="15" r="3.1"/>' +
  '</g></svg>';

const PATH_SVG =
  '<svg viewBox="0 0 220 120" width="100%" aria-hidden="true" style="max-width:220px;display:block;margin:0 auto 6px">' +
  '<g fill="none" stroke="#3b2c1a" stroke-width="1.2" stroke-linecap="round">' +
  '<path d="M 4 112 C 40 108 60 110 82 112" stroke-width="1"/>' +
  '<path d="M 82 112 C 110 104 128 86 138 66 C 146 50 152 34 158 22 L 216 22 L 216 112 Z" fill="#6a5a3a" fill-opacity="0.14"/>' +
  '<path d="M 138 66 C 150 62 162 62 172 64" stroke-width="0.8" stroke-opacity="0.5"/>' +
  '<path d="M 146 50 C 156 46 168 46 178 48" stroke-width="0.8" stroke-opacity="0.5"/>' +
  '<path d="M 90 108 L 118 96 L 102 88 L 130 76 L 116 68 L 142 56 L 132 48 L 156 36" stroke-dasharray="4 3" stroke-width="1.5"/>' +
  '<path d="M 6 116 q 10 -4 20 0 t 20 0 t 20 0" stroke-opacity="0.55" stroke-width="0.9"/>' +
  '</g>' +
  '<g stroke="#3b2c1a" stroke-width="1.4" fill="none" stroke-linecap="round">' +
  '<circle cx="164" cy="12" r="3.4" fill="#6a5a3a" fill-opacity="0.25"/>' +
  '<path d="M 164 15 L 164 26 M 164 18 L 157 24 M 164 18 L 172 10 M 164 26 L 159 34 M 164 26 L 169 34"/>' +
  '<path d="M 180 28 q 4 -5 9 -1 q 4 3 1 6 l -8 0 z" fill="#6a5a3a" fill-opacity="0.25"/>' +
  '<path d="M 182 33 L 181 37 M 187 33 L 188 37 M 190 29 q 4 -3 3 -7"/>' +
  '</g></svg>';

/* ============================================================
   STAGE 2, IDEA 1 - YOUR CHART IS DRAWN BY YOUR VOYAGES
   The chart opens as THE KNOWN CHART: only the waters this visit has
   actually sailed are firmly inked; everything else lies under banks of
   engraved cloud, pale rumor beneath ("by report only"). The soundings the
   leadsman actually took are numbered along the track. A switch on the
   sheet lifts the fog - THE FULL CHART - the banks rolling off downwind,
   eased and directional; switching back rolls them home. Reduced motion
   swaps at once. Everything persists for the visit through the same store
   the log uses. Every hole in the fog is a place the keel truly went.
   ============================================================ */
const FOG_SEE_NM = 1.35;         /* the horizon a deck credibly surveys */
function fogCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; }         /* the horizon a deck credibly surveys */
const fog = {
  mode: store.get('fogmode', 'known') === 'full' ? 'full' : 'known',
  cellNm: 0.55,
  seen: new Set(store.get('seen', [])),
  cols: 0, rows: 0, gx0: 0, gy0: 0, cu: 0,
  ready: false, dirty: true, seenDirty: false,
  washCv: null, puffCv: null, puffs: [], stamps: null,
  zoomCv: null, zoomKey: '', specs: null, holeCv: null,
  anim: false, animT0: 0, animDur: 1600, animDir: 1, animRaf: 0,
  vell: null
};

function fogInitGrid() {
  if (fog.ready || !world.bounds) return;
  const B = world.bounds, mgn = 2.4 / world.nmPerUnit;
  fog.cu = fog.cellNm / world.nmPerUnit;
  fog.gx0 = B.minx - mgn; fog.gy0 = B.miny - mgn;
  fog.cols = Math.max(8, Math.ceil((B.maxx - B.minx + mgn * 2) / fog.cu));
  fog.rows = Math.max(8, Math.ceil((B.maxy - B.miny + mgn * 2) / fog.cu));
  fog.ready = true;
  diag.fogGrid = { cols: fog.cols, rows: fog.rows, cellNm: fog.cellNm };
}
function fogIdx(gx, gy) { return gy * fog.cols + gx; }
function fogSeenAt(x, y) {
  if (!fog.ready) return true;
  const gx = Math.floor((x - fog.gx0) / fog.cu), gy = Math.floor((y - fog.gy0) / fog.cu);
  if (gx < 0 || gy < 0 || gx >= fog.cols || gy >= fog.rows) return false;
  return fog.seen.has(fogIdx(gx, gy));
}
/* the keel surveys a disk of water around herself */
function fogSee(x, y, rNm) {
  if (!fog.ready) return;
  const r = (rNm || FOG_SEE_NM) / world.nmPerUnit;
  const g0x = Math.max(0, Math.floor((x - r - fog.gx0) / fog.cu));
  const g1x = Math.min(fog.cols - 1, Math.floor((x + r - fog.gx0) / fog.cu));
  const g0y = Math.max(0, Math.floor((y - r - fog.gy0) / fog.cu));
  const g1y = Math.min(fog.rows - 1, Math.floor((y + r - fog.gy0) / fog.cu));
  let grew = false;
  for (let gy = g0y; gy <= g1y; gy++) for (let gx = g0x; gx <= g1x; gx++) {
    const cx = fog.gx0 + (gx + 0.5) * fog.cu, cy = fog.gy0 + (gy + 0.5) * fog.cu;
    if ((cx - x) * (cx - x) + (cy - y) * (cy - y) > r * r) continue;
    const k = fogIdx(gx, gy);
    if (!fog.seen.has(k)) { fog.seen.add(k); grew = true; }
  }
  if (grew) { fog.dirty = true; fog.seenDirty = true; diag.fogSeen = fog.seen.size; }
}
/* a passage is sailed water: the corridor of the crossing is surveyed too */
function fogSeePath(ax, ay, bx, by, rNm) {
  const d = Math.hypot(bx - ax, by - ay);
  const step = (rNm || 0.8) / world.nmPerUnit * 0.9;
  const n = Math.max(1, Math.ceil(d / step));
  for (let i = 0; i <= n; i++) fogSee(lerp(ax, bx, i / n), lerp(ay, by, i / n), rNm || 0.8);
}
function fogPersist() {
  if (!fog.seenDirty) return;
  fog.seenDirty = false;
  store.set('seen', [...fog.seen]);
  store.set('fogmode', fog.mode);
}
function isleSeen(I) { return visit.charted.has(I.slug) || fogSeenAt(I.pos.x, I.pos.y); }
function fogHides(I) {
  /* the waters you are BOUND FOR are pricked on the chart by your own
     sailing orders: the maiden Quick Start above all - QUICK START FIRST
     must hold on every path, fog or no fog */
  if (I === ship.bound || (story.maiden && story.qs && I === story.qs)) return false;
  return fog.mode === 'known' && !fog.anim && !isleSeen(I);
}
function fogRumorAt(sx, sy) {
  if (fog.mode !== 'known') return false;
  return !fogSeenAt((sx - chart.ox) / chart.k, (sy - chart.oy) / chart.k);
}
function fogSeenCount() {
  let n = 0;
  for (const I of world.islands) if (isleSeen(I)) n++;
  return n;
}

/* ---- the engraved cloud banks: one geometry, two hands.
   The billows are laid down once as numbers; the bitmap stamps blit cheap
   through gestures and the lift, and the settled zoom redraws the very
   same banks as vectors so a magnified fog stays engraving, not pixels. ---- */
function mkPuffSpecs() {
  if (fog.specs) return;
  fog.specs = [];
  for (let v = 0; v < 3; v++) {
    const rnd = rngFor('fogpuff:' + v);
    const sp = { lobes: [], curlR: 0, fracs: [] };
    const n = 3 + Math.floor(rnd() * 2);
    for (let i = 0; i < n; i++) sp.lobes.push([14 + rnd() * 12, 9 + rnd() * 9]);
    sp.curlR = 4 + rnd() * 2;
    for (let i = 0; i < 4; i++) sp.fracs.push(0.7 + rnd() * 0.3);
    fog.specs.push(sp);
  }
}
function paintPuffShape(g, sp) {
  const cx = 42, cy = 34;
  /* the bank: a row of stacked billow arcs with a curled end, the same
     key the sky's woodcut clouds are cut to */
  g.fillStyle = 'rgba(240,231,210,0.96)';
  g.strokeStyle = INK + '0.52)';
  g.lineWidth = 1.05;
  g.beginPath();
  g.moveTo(cx - 34, cy + 10);
  let x = cx - 34;
  for (const wh of sp.lobes) {
    g.arc(x + wh[0] / 2, cy + 10 - wh[1] * 0.24, wh[0] / 2, Math.PI, 0, false);
    x += wh[0];
  }
  g.lineTo(x, cy + 10);
  g.closePath();
  g.fill(); g.stroke();
  /* the curled end and the base lines */
  g.beginPath();
  g.arc(x - 3, cy + 6, sp.curlR, -0.6, Math.PI * 1.1);
  g.stroke();
  g.strokeStyle = INK + '0.30)';
  g.lineWidth = 0.6;
  for (let i = 0; i < 4; i++) {
    const yy = cy + 10 - 2 - i * 2.6, span = 26 - i * 5;
    g.beginPath(); g.moveTo(cx - span, yy); g.lineTo(cx + span * sp.fracs[i], yy);
    g.stroke();
  }
}
function bakeFogStamps() {
  if (fog.stamps) return;
  mkPuffSpecs();
  fog.stamps = [];
  for (let v = 0; v < 3; v++) {
    const c = fogCanvas(84, 56), g = c.getContext('2d');
    g.lineJoin = 'round'; g.lineCap = 'round';
    paintPuffShape(g, fog.specs[v]);
    fog.stamps.push(c);
  }
}
function drawPuffVec(g, P, a) {
  g.save();
  g.translate(P.x, P.y);
  g.scale(P.s * 0.5, P.s * 0.5);
  g.translate(-42, -28);
  g.globalAlpha = a * (0.72 + 0.22 * P.ph);
  paintPuffShape(g, fog.specs[P.v]);
  g.restore();
}
function fogHole() {
  if (!fog.holeCv) {
    fog.holeCv = fogCanvas(64, 64);
    const hg = fog.holeCv.getContext('2d');
    const rg = hg.createRadialGradient(32, 32, 4, 32, 32, 32);
    rg.addColorStop(0, 'rgba(0,0,0,1)');
    rg.addColorStop(0.62, 'rgba(0,0,0,0.9)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    hg.fillStyle = rg; hg.fillRect(0, 0, 64, 64);
  }
  return fog.holeCv;
}

function fogVellumPts() {
  if (!fog.vell) fog.vell = tornSheetPath(null);
  return fog.vell;
}

/* ---- the fog layers, rebuilt only when the seen water grows ---- */
function rebuildFog() {
  if (!fog.ready || !chart.geo) return;
  fog.dirty = false;
  bakeFogStamps();
  const dpr = Math.min(chart.dpr || 1, 2);
  /* THE WASH: pale rumor over everything unsurveyed, holes where the keel went */
  if (!fog.washCv) fog.washCv = fogCanvas(CHART_W * dpr, CHART_H * dpr);
  {
    const g = fog.washCv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, CHART_W, CHART_H);
    g.save();
    g.beginPath(); pathThrough(g, fogVellumPts(), true); g.clip();
    g.fillStyle = 'rgba(238,229,207,0.86)';
    g.fillRect(0, 0, CHART_W, CHART_H);
    /* a light unknown-water hatch, the draughtsman's "no survey here" */
    g.strokeStyle = INK + '0.045)';
    g.lineWidth = 0.7;
    g.beginPath();
    for (let x = -CHART_H; x < CHART_W; x += 11) {
      g.moveTo(x, 0); g.lineTo(x + CHART_H, CHART_H);
    }
    g.stroke();
    /* the holes: every surveyed cell is cut out with a soft edge */
    const hole = fogHole();
    g.globalCompositeOperation = 'destination-out';
    const cellPx = fog.cu * chart.k;
    const hr = Math.max(7, cellPx * 1.65);
    for (const k of fog.seen) {
      const gy = Math.floor(k / fog.cols), gx = k - gy * fog.cols;
      const wx = fog.gx0 + (gx + 0.5) * fog.cu, wy = fog.gy0 + (gy + 0.5) * fog.cu;
      const p = chartProject(wx, wy);
      if (p[0] < -40 || p[0] > CHART_W + 40 || p[1] < -40 || p[1] > CHART_H + 40) continue;
      g.drawImage(hole, p[0] - hr, p[1] - hr, hr * 2, hr * 2);
    }
    g.globalCompositeOperation = 'source-over';
    /* the honest words on the unsurveyed mains */
    g.font = 'italic 15px "Iowan Old Style", Palatino, Georgia, serif';
    g.fillStyle = INK + '0.42)';
    g.textAlign = 'center';
    for (const key of ['cms', 'cloud']) {
      const K = world.continents[key];
      let anySeen = false;
      for (const I of world.islands) {
        if (I.product === key && isleSeen(I)) { anySeen = true; break; }
      }
      if (anySeen) continue;
      const p = chartProject(K.x, K.y);
      g.fillText('by report only', p[0], p[1] + 34);
    }
    g.restore();
  }
  /* THE BANKS: engraved cloud over the unknown, each with its own wind */
  fog.puffs = [];
  const step = 27;
  const rnd = rngFor('fogfield');
  for (let sy = 24; sy < CHART_H - 18; sy += step) {
    for (let sx = 24; sx < CHART_W - 18; sx += step) {
      const jx = sx + (rnd() - 0.5) * 14, jy = sy + (rnd() - 0.5) * 12;
      /* the four table instruments stay clear: they sit ON the sheet */
      let onFurn = false;
      for (const R of FURN) {
        if (jx > R.x - 8 && jx < R.x + R.w + 8 && jy > R.y - 8 && jy < R.y + R.h + 8) { onFurn = true; break; }
      }
      if (onFurn) continue;
      const wx = (jx - chart.ox) / chart.k, wy = (jy - chart.oy) / chart.k;
      if (fogSeenAt(wx, wy)) continue;
      const w = windAtUnits(wx, wy);
      const wm = Math.hypot(w.x, w.y) || 1;
      fog.puffs.push({
        x: jx, y: jy,
        s: 0.55 + rnd() * 0.75,
        v: Math.floor(rnd() * 3),
        wx: w.x / wm, wy: w.y / wm,
        ph: rnd()
      });
    }
  }
  /* the directional stagger: banks nearest the wind's own exit go first */
  let dmin = 1e9, dmax = -1e9;
  for (const P of fog.puffs) {
    P.dd = P.x * P.wx + P.y * P.wy;
    if (P.dd < dmin) dmin = P.dd;
    if (P.dd > dmax) dmax = P.dd;
  }
  const span = Math.max(1, dmax - dmin);
  for (const P of fog.puffs) P.dd = 1 - (P.dd - dmin) / span;
  /* the static bank plate, so a gesture frame blits two canvases and no more */
  if (!fog.puffCv) fog.puffCv = fogCanvas(CHART_W * dpr, CHART_H * dpr);
  {
    const g = fog.puffCv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, CHART_W, CHART_H);
    g.save();
    g.beginPath(); pathThrough(g, fogVellumPts(), true); g.clip();
    for (const P of fog.puffs) fogStampPuff(g, P, 1);
    g.restore();
  }
  diag.fogPuffs = fog.puffs.length;
}
function fogStampPuff(g, P, a) {
  const st = fog.stamps[P.v];
  const w = st.width / 2 * P.s, h = st.height / 2 * P.s;
  g.globalAlpha = a * (0.72 + 0.22 * P.ph);
  g.drawImage(st, P.x - w / 2, P.y - h / 2, w, h);
  g.globalAlpha = 1;
}

/* ---- the fog on the glass: cheap at rest, alive under the switch ---- */
function fogVisibleNow() { return fog.mode === 'known' || fog.anim; }
function easeFog(t) { return t * t * (3 - 2 * t); }
function fogZoomKeyNow() {
  return chart.z.toFixed(4) + ',' + chart.tx.toFixed(1) + ',' + chart.ty.toFixed(1) +
    ',' + fog.seen.size + ',' + fog.mode;
}
/* the settled zoom redraws the fog as vectors, the way the sheet itself is
   redrawn crisp: a magnified bank stays an engraving */
function crispFogRender() {
  if (!fog.ready || !chart.geo || fog.anim) return;
  if (fog.mode !== 'known' || chartViewIdent()) { fog.zoomKey = ''; return; }
  if (fog.dirty) rebuildFog();
  const key = fogZoomKeyNow();
  if (fog.zoomKey === key && fog.zoomCv) return;
  const dpr = Math.min(chart.dpr || 1, 2);
  if (!fog.zoomCv) fog.zoomCv = fogCanvas(CHART_W * dpr, CHART_H * dpr);
  const g = fog.zoomCv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, CHART_W, CHART_H);
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.save();
  g.translate(chart.tx, chart.ty);
  g.scale(chart.z, chart.z);
  g.beginPath(); pathThrough(g, fogVellumPts(), true); g.clip();
  /* the wash, magnified as an engraving magnifies */
  g.fillStyle = 'rgba(238,229,207,0.86)';
  g.fillRect(0, 0, CHART_W, CHART_H);
  g.strokeStyle = INK + '0.045)';
  g.lineWidth = 0.7;
  g.beginPath();
  for (let x = -CHART_H; x < CHART_W; x += 11) {
    g.moveTo(x, 0); g.lineTo(x + CHART_H, CHART_H);
  }
  g.stroke();
  const hole = fogHole();
  g.globalCompositeOperation = 'destination-out';
  const cellPx = fog.cu * chart.k;
  const hr = Math.max(7, cellPx * 1.65);
  for (const k of fog.seen) {
    const gy = Math.floor(k / fog.cols), gx = k - gy * fog.cols;
    const wx = fog.gx0 + (gx + 0.5) * fog.cu, wy = fog.gy0 + (gy + 0.5) * fog.cu;
    const p = chartProject(wx, wy);
    g.drawImage(hole, p[0] - hr, p[1] - hr, hr * 2, hr * 2);
  }
  g.globalCompositeOperation = 'source-over';
  g.font = 'italic 15px "Iowan Old Style", Palatino, Georgia, serif';
  g.fillStyle = INK + '0.42)';
  g.textAlign = 'center';
  for (const key2 of ['cms', 'cloud']) {
    const K = world.continents[key2];
    let anySeen = false;
    for (const I of world.islands) {
      if (I.product === key2 && isleSeen(I)) { anySeen = true; break; }
    }
    if (anySeen) continue;
    const p = chartProject(K.x, K.y);
    g.fillText('by report only', p[0], p[1] + 34);
  }
  /* the banks themselves, cut fresh as vectors at this magnification */
  for (const P of fog.puffs) drawPuffVec(g, P, 1);
  g.restore();
  fog.zoomKey = key;
}
function drawFog(g) {
  if (!world.ready || !chart.geo || !fogVisibleNow()) return;
  if (!fog.ready) fogInitGrid();
  if (fog.dirty) rebuildFog();
  if (!fog.washCv) return;
  /* at rest on a magnified view, the settled crisp plate stands in whole */
  if (!fog.anim && !chartViewIdent() && fog.zoomCv && fog.zoomKey === fogZoomKeyNow()) {
    g.drawImage(fog.zoomCv, 0, 0, CHART_W, CHART_H);
    return;
  }
  g.save();
  g.translate(chart.tx, chart.ty);
  g.scale(chart.z, chart.z);
  let p;   /* 0 = the fog at home, 1 = lifted clean off */
  if (fog.anim) {
    const t = clamp((performance.now() - fog.animT0) / fog.animDur, 0, 1);
    p = fog.animDir > 0 ? easeFog(t) : 1 - easeFog(t);
  } else p = fog.mode === 'known' ? 0 : 1;
  if (p < 0.999) {
    g.globalAlpha = 1 - p;
    g.drawImage(fog.washCv, 0, 0, CHART_W, CHART_H);
    g.globalAlpha = 1;
  }
  if (!fog.anim) {
    if (p < 0.5) g.drawImage(fog.puffCv, 0, 0, CHART_W, CHART_H);
  } else {
    /* the reveal itself: every bank rolls off downwind, staggered so the
       lift crosses the sheet the way a clearing crosses a real sea */
    g.beginPath(); pathThrough(g, fogVellumPts(), true); g.clip();
    for (const P of fog.puffs) {
      const pp = clamp(p * 1.45 - P.dd * 0.45, 0, 1);
      if (pp >= 0.999) continue;
      const e = easeFog(pp);
      const run = e * (120 + 130 * P.ph);
      const sx = P.x, sy = P.y;
      P.x = sx + P.wx * run; P.y = sy + P.wy * run + e * e * 8;
      fogStampPuff(g, P, 1 - e);
      P.x = sx; P.y = sy;
    }
  }
  g.restore();
}

function fogSetMode(mode, animate) {
  mode = mode === 'full' ? 'full' : 'known';
  if (mode === fog.mode && !fog.anim) { fogSyncSwitch(); return; }
  if (fog.dirty) rebuildFog();
  fog.mode = mode;
  store.set('fogmode', fog.mode);
  diag.fogMode = fog.mode;
  fogSyncSwitch();
  const instant = REDUCED || animate === false;
  cancelAnimationFrame(fog.animRaf);
  if (instant) {
    fog.anim = false;
    drawChartCanvas();
    layoutChartDom();
    showChartInfo(chart.hover);
    return;
  }
  fog.anim = true;
  fog.animT0 = performance.now();
  fog.animDir = mode === 'full' ? 1 : -1;
  const tick = () => {
    if (!fog.anim) return;
    const done = performance.now() - fog.animT0 >= fog.animDur;
    drawChartCanvas();
    if (done) {
      fog.anim = false;
      drawChartCanvas();
      layoutChartDom();
      showChartInfo(chart.hover);
      return;
    }
    fog.animRaf = requestAnimationFrame(tick);
  };
  fog.animRaf = requestAnimationFrame(tick);
}
function fogSyncSwitch() {
  const el = $('fogswitch');
  if (!el) return;
  el.classList.toggle('full', fog.mode === 'full');
  el.setAttribute('aria-checked', fog.mode === 'full' ? 'true' : 'false');
}
function fogDiag() {
  return { mode: fog.mode, anim: fog.anim, seenCells: fog.seen.size,
    seenIsles: fogSeenCount(), puffs: fog.puffs.length,
    soundings: visit.soundings.length };
}

/* ---- the soundings the leadsman actually took, numbered on the sheet ---- */
function s2Sounding(f) {
  const S = visit.soundings;
  const last = S[S.length - 1];
  if (last && Math.hypot(last.x - ship.x, last.y - ship.y) * world.nmPerUnit < 0.15) return;
  S.push({ x: ship.x, y: ship.y, f });
  if (S.length > 240) S.splice(0, S.length - 240);
  visit.save();
}
function drawSoundings(g) {
  if (fog.mode !== 'known' || !visit.soundings.length) return;
  const Z = chart.z, TXv = chart.tx, TYv = chart.ty;
  g.save();
  g.font = 'italic ' + (8.5 * Math.pow(Z, 0.3)).toFixed(1) + 'px "Iowan Old Style", Palatino, Georgia, serif';
  g.fillStyle = INK + '0.74)';
  g.textAlign = 'left';
  const seen = new Set();
  for (const s of visit.soundings) {
    const p = chartProject(s.x, s.y);
    const x = p[0] * Z + TXv, y = p[1] * Z + TYv;
    if (x < 8 || x > CHART_W - 8 || y < 8 || y > CHART_H - 8) continue;
    const key = Math.round(x / 14) + ',' + Math.round(y / 12);
    if (seen.has(key)) continue;   /* two casts in the same water print once */
    seen.add(key);
    g.save();
    /* the numeral sits beside the cast, as a leadsman's figure does,
       never under the ship's own mark */
    g.translate(x + 10, y - 9);
    g.rotate(-0.10 + ((s.f % 7) - 3) * 0.02);
    g.fillText(String(s.f), 0, 3);
    g.restore();
  }
  g.restore();
}

/* ============================================================
   STAGE 2, IDEAS 2 + 3 + 4 - WEATHER AT SEA
   PASSING WEATHER (idea 2): fronts cross the sea on the corpus's own
   calendar - the trailing twelvemonth of real last-edit dates replayed,
   a month a minute. Months where the ink fell thick bring hatched rain;
   the thickest bring squall and, rarely, one engraved fork of lightning
   with a rolled soft thunder. Months with no ink are clearings.
   STORM WATERS (idea 3): the sea state runs with the citations borne
   into the waters she sails - Breaking Changes (57 in) is squall
   country: taller swell, spray, a heavier helm, all bounded so she
   always answers. A STORM-GLASS on the chart table reads the bound-for
   waters before you sail.
   THE TENDING (idea 4): freshly tended waters sparkle; long-untended
   waters carry grey and banks of mist. Freshness is provenance, nothing
   else. Everything eases in and out, never during the title, never over
   the reading, and reduced motion swaps state without any fork.
   ============================================================ */
const WX_MONTH_S = 60;                 /* one corpus month crosses in a minute */
const WX_SNAP = '2026-09-05';          /* the corpus snapshot day (same as ageOfInk) */
const wx = {
  months: [], built: false, mIx: -1, forceIx: null,
  rain: 0, squall: 0, sparkle: 0, mist: 0, grey: 0,
  helm: 0, seaVis: 0, local: 0, lat: 1,
  thunderDone: false, fork: null, forkFrames: 0,
  drops: null, glints: null, glass: null, glassKey: ''
};

function wxInit() {
  if (wx.built) return;
  wx.built = true;
  /* the calendar is the corpus's own: how many pages took their last ink
     in each of the trailing twelve months before the snapshot */
  const counts = new Map();
  for (const I of world.islands) {
    const m = (I.last || '').slice(0, 7);
    if (m) counts.set(m, (counts.get(m) || 0) + 1);
  }
  const list = [];
  let y = 2025, mo = 10;               /* 2025-10 .. 2026-09 */
  for (let i = 0; i < 12; i++) {
    const key = y + '-' + String(mo).padStart(2, '0');
    list.push({ key, n: counts.get(key) || 0 });
    mo++; if (mo > 12) { mo = 1; y++; }
  }
  /* the tending scale is the corpus's own: grey ramps from the oldest
     quartile of the ink to the oldest ink there is */
  const stales = world.islands
    .filter(I => I.last)
    .map(I => (Date.parse(WX_SNAP) - Date.parse(I.last)) / 86400000)
    .sort((a, b) => a - b);
  wx.staleP75 = stales[Math.floor(stales.length * 0.75)] || 90;
  wx.staleMax = Math.max(stales[stales.length - 1] || 365, wx.staleP75 + 30);
  diag.wxStale = { p75: Math.round(wx.staleP75), max: Math.round(wx.staleMax) };
  const ns = list.map(m => m.n).slice().sort((a, b) => a - b);
  const q3 = Math.max(1, ns[Math.floor(ns.length * 0.72)]);
  const q9 = Math.max(2, ns[Math.floor(ns.length * 0.90)]);
  for (const m of list) {
    m.rain = m.n <= 0 ? 0 : clamp(m.n / q3, 0, 1);
    m.squall = m.n >= q9 ? 1 : 0;
  }
  wx.months = list;
  diag.wxCalendar = list.map(m => m.key.slice(2) + ':' + m.n).join(' ');
}

/* idea 3: what the citations raise in a given water */
function wxGlassReading(I) {
  const n = I ? (I.inbound || 0) : 0;
  const s = clamp(n / 57, 0, 1);
  const words =
    n >= 45 ? 'the liquor is troubled and flaked - squall country' :
    n >= 25 ? 'the liquor clouds - a heavy swell runs' :
    n >= 8 ? 'a feather of crystal - a working sea' :
    'the liquor stands clear - fair water';
  return { n, s, words, name: I ? I.title : 'the open sea' };
}

function wxTick(dt) {
  if (!wx.built) wxInit();
  const live = env.t > 7.5;            /* never during the six-second title */
  const n = wx.months.length;
  const ix = wx.forceIx != null ? wx.forceIx : Math.floor(env.t / WX_MONTH_S) % n;
  if (ix !== wx.mIx) { wx.mIx = ix; wx.thunderDone = false; }
  const M = wx.months[ix];
  const b = ship.bound || world.island;
  wx.local = b ? clamp((b.inbound || 0) / 57, 0, 1) : 0;
  const gate = clamp((wx.local - 0.8) / 0.2, 0, 1);   /* true squall country only */
  const rainT = live ? M.rain : 0;
  const squallT = live ? M.squall : 0;
  let spT = 0, gT = 0;
  if (live && b && b.last) {
    const stale = (Date.parse(WX_SNAP) - Date.parse(b.last)) / 86400000;
    if (stale < 60) spT = 1 - stale / 60;
    gT = clamp((stale - wx.staleP75) / (wx.staleMax - wx.staleP75), 0, 1);
  }
  const k = REDUCED ? 1 : 1 - Math.exp(-dt / 4.2);
  wx.rain += (rainT - wx.rain) * k;
  wx.squall += (squallT - wx.squall) * k;
  wx.sparkle += (spT - wx.sparkle) * k;
  wx.mist += (gT - wx.mist) * k;
  wx.grey = wx.mist;
  /* the helm goes heavy only where the sea truly rises - and stays bounded */
  const helmT = clamp(gate * (0.62 + 0.38 * wx.squall) + 0.30 * wx.squall, 0, 1);
  wx.helm += (helmT - wx.helm) * k;
  const visT = clamp(gate * 0.7 + wx.squall * 0.5 + wx.rain * 0.22, 0, 1);
  wx.seaVis += (visT - wx.seaVis) * k;
  /* the wind's lateral hand slants the rain, the same hand the streaks read */
  const wind = windAtShip();
  const hb2 = ship.bearing * Math.PI / 180;
  const wmm = Math.hypot(wind.x, wind.y) || 1;
  wx.lat = (wind.x * Math.cos(hb2) + wind.y * Math.sin(hb2)) / wmm;
  /* THUNDER: rare, one fork, never in the first minute, never reduced */
  if (M.squall && live && !wx.thunderDone && !REDUCED && env.t > 60 && wx.squall > 0.5) {
    const off = 8 + (M.n * 7) % 40;
    if ((env.t % WX_MONTH_S) >= off) wxBolt(M.key);
  }
  diag.wx = {
    month: M.key, ink: M.n,
    rain: +wx.rain.toFixed(3), squall: +wx.squall.toFixed(3),
    sparkle: +wx.sparkle.toFixed(3), mist: +wx.mist.toFixed(3),
    helm: +wx.helm.toFixed(3), seaVis: +wx.seaVis.toFixed(3),
    local: +wx.local.toFixed(3)
  };
}

function wxBolt(seed) {
  wx.thunderDone = true;
  wx.fork = mkFork(seed || 'now');
  wx.forkFrames = 2;
  setTimeout(() => { try { sound.thunder(); } catch (e) { /* the sky alone */ } }, 800);
  diag.thunderAtT = Math.round(env.t);
}

function mkFork(seed) {
  const rnd = rngFor('fork:' + seed);
  let x = 250 + rnd() * (W - 500), y = 36 + rnd() * 44;
  const pts = [[x, y]], branches = [];
  while (y < HORIZON - 26) {
    x += (rnd() - 0.5) * 88;
    y += 28 + rnd() * 40;
    pts.push([x, y]);
    if (rnd() < 0.34 && branches.length < 2) {
      let bx = x, by = y;
      const b = [[bx, by]];
      const m2 = 2 + Math.floor(rnd() * 2);
      for (let j = 0; j < m2; j++) {
        bx += (rnd() - 0.5) * 110; by += 22 + rnd() * 30;
        b.push([bx, by]);
      }
      branches.push(b);
    }
  }
  return { pts, branches };
}

function wxDrops() {
  if (wx.drops) return wx.drops;
  const rnd = rngFor('wxrain');
  wx.drops = [];
  for (let i = 0; i < 110; i++) wx.drops.push({
    x: rnd() * (W + 300) - 150, y: rnd() * (H + 60),
    l: 11 + rnd() * 15, sp: 300 + rnd() * 260, far: i % 3 === 0
  });
  return wx.drops;
}
function wxGlints() {
  if (wx.glints) return wx.glints;
  const rnd = rngFor('wxglint');
  wx.glints = [];
  for (let i = 0; i < 16; i++) wx.glints.push({
    x: 90 + rnd() * (W - 180), y: HORIZON + 34 + rnd() * 190,
    f: rnd() * 0.9, ph: rnd()
  });
  return wx.glints;
}

/* over the sea, under the frontispiece: the tending made visible */
function drawWeather(sim, worldDY) {
  const m = wx.mist;
  if (m > 0.015) {
    /* banks of mist on long-untended water, the fog's own billow hand laid flat */
    ctx.save();
    ctx.fillStyle = '#efe6cd';
    for (let i = 0; i < 3; i++) {
      const dy2 = REDUCED ? 0 : Math.sin(env.t * 0.11 + i * 2.1) * 6;
      const dx2 = REDUCED ? 0 : Math.sin(env.t * 0.05 + i) * 60;
      ctx.globalAlpha = 0.15 * m * (1 - i * 0.18);
      ctx.beginPath();
      ctx.ellipse(W * (0.24 + 0.26 * i) + dx2, HORIZON + worldDY + 26 + i * 46 + dy2,
        330 + i * 90, 15 + i * 7, 0, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 0.20 * m;
    ctx.strokeStyle = 'rgba(96,80,58,0.8)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 2; i++) {
      const y = HORIZON + worldDY + 30 + i * 46;
      ctx.beginPath();
      for (let x2 = 120 * i; x2 < W; x2 += 96) ctx.arc(x2 + 46, y, 26, Math.PI * 1.06, Math.PI * 1.94);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  const sp = wx.sparkle;
  if (sp > 0.02) {
    /* fresh ink sparkles: paper-bright glints riding the swell */
    ctx.save();
    ctx.fillStyle = '#faf3df';
    for (const d of wxGlints()) {
      const tw = REDUCED ? 0.6 : 0.5 + 0.5 * Math.sin(env.t * (1.3 + d.f) + d.ph * 6.3);
      ctx.globalAlpha = sp * 0.55 * tw;
      ctx.fillRect(d.x - 1.2, d.y + worldDY, 2.6, 1.1);
      ctx.globalAlpha = sp * 0.28 * tw;
      ctx.fillRect(d.x - 3.6, d.y + worldDY + 0.2, 7.4, 0.5);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

/* in front of the deck, behind the spyglass: the front itself */
function drawRainFront(sim) {
  const r = wx.rain, sq = wx.squall;
  /* the wash: rain darkens the plate a stop, the squall two more */
  const dark = 0.055 * r + 0.115 * sq;
  if (dark > 0.004) {
    ctx.fillStyle = 'rgba(36,38,50,' + dark.toFixed(3) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  if (wx.forkFrames > 0 && !REDUCED) { drawFork(); wx.forkFrames--; }
  if (r < 0.02) return;
  /* hatched rain, angling with the wind's lateral hand */
  const dir = wx.lat >= 0 ? 1 : -1;
  const slant = dir * (7 + 8 * sq);
  ctx.save();
  ctx.strokeStyle = 'rgba(38,30,20,1)';
  ctx.lineCap = 'round';
  for (const d of wxDrops()) {
    const fall = REDUCED ? 0 : env.t * d.sp;
    const y = ((d.y + fall) % (H + 60)) - 30;
    const x = ((d.x + (REDUCED ? 0 : fall * 0.14 * dir) % (W + 300)) + W + 300) % (W + 300) - 150;
    ctx.globalAlpha = r * (d.far ? 0.10 : 0.17);
    ctx.lineWidth = d.far ? 0.7 : 1.0;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + slant * (d.l / 16), y + d.l * (d.far ? 0.8 : 1.25));
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawFork() {
  const F = wx.fork;
  if (!F) return;
  ctx.save();
  /* the flash: the sky whitens one breath */
  ctx.fillStyle = 'rgba(248,242,226,0.20)';
  ctx.fillRect(0, 0, W, HORIZON + 12);
  const run = (w2, c2) => {
    ctx.strokeStyle = c2; ctx.lineWidth = w2;
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(F.pts[0][0], F.pts[0][1]);
    for (const p of F.pts) ctx.lineTo(p[0], p[1]);
    for (const b of F.branches) {
      ctx.moveTo(b[0][0], b[0][1]);
      for (const p of b) ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();
  };
  run(3.2, 'rgba(250,245,230,0.92)');
  run(1.15, 'rgba(46,36,24,0.85)');
  ctx.restore();
}

/* ---- THE STORM-GLASS on the chart table (idea 3) ---- */
function updateStormGlass() {
  const el = $('stormglass');
  if (!el) return;
  const I = chart.hover || ship.bound || world.island;
  const r = wxGlassReading(I);
  wx.glass = r;
  const key = r.name + '|' + r.n;
  if (key === wx.glassKey) return;
  wx.glassKey = key;
  el.innerHTML =
    '<div class="sg-h">THE STORM-GLASS</div>' +
    '<div class="sg-line">' + (chart.hover ? 'over ' : 'bound for ') + '<b>' + esc(r.name) + '</b>: ' + r.words + '</div>' +
    '<div class="sg-sub">' + (r.n ? r.n + (r.n === 1 ? ' citation borne in' : ' citations borne in') + ' - the sea off her runs with them'
      : 'no citation reaches her - a still water') + '</div>';
  chartSettle();   /* the liquor itself is engraved on the next settled plate */
}
function drawStormGlass(g, B) {
  drawPanel(g, B, !chartViewIdent());
  const r = wx.glass || wxGlassReading(ship.bound || world.island);
  const x = B.x + 27, cy = B.y + B.h / 2;
  g.save();
  g.lineJoin = 'round'; g.lineCap = 'round';
  /* the sealed vial */
  const vw = 13, vh = 48, vx = x - vw / 2, vy = cy - vh / 2;
  g.strokeStyle = INK + '0.85)'; g.lineWidth = 1.15;
  g.strokeRect(vx, vy, vw, vh);
  g.beginPath(); g.moveTo(vx - 3, vy); g.lineTo(vx + vw + 3, vy); g.stroke();
  g.beginPath(); g.moveTo(vx + 2, vy - 3.5); g.lineTo(vx + vw - 2, vy - 3.5); g.stroke();
  /* the liquor stands with the trouble of the bound-for water */
  const lvl = 0.34 + 0.46 * r.s;
  const ly = vy + vh * (1 - lvl);
  g.fillStyle = 'rgba(118,130,118,0.28)';
  g.fillRect(vx + 1, ly, vw - 2, vh - (ly - vy) - 1);
  g.strokeStyle = INK + '0.62)'; g.lineWidth = 0.8;
  if (r.s > 0.72) {
    /* troubled and flaked */
    g.beginPath();
    for (let i = 0; i <= 6; i++) g.lineTo(vx + 1 + (vw - 2) * i / 6, ly + ((i % 2) ? -1.9 : 1.9));
    g.stroke();
    g.fillStyle = INK + '0.5)';
    const rr = rngFor('sgflake');
    for (let i = 0; i < 7; i++) g.fillRect(vx + 2 + rr() * (vw - 5.5), ly + 3 + rr() * (vh * lvl - 8), 1.7, 0.9);
  } else {
    g.beginPath(); g.moveTo(vx + 1, ly); g.lineTo(vx + vw - 1, ly); g.stroke();
    if (r.s > 0.42) {
      /* the liquor clouds */
      g.strokeStyle = INK + '0.34)'; g.lineWidth = 0.6;
      g.beginPath();
      g.arc(vx + vw / 2, ly + 9, 3.4, 0, TAU);
      g.arc(vx + vw / 2 - 2.6, ly + 13, 2.5, 0, TAU);
      g.stroke();
    } else if (r.s > 0.14) {
      /* a feather of crystal on the wall */
      g.strokeStyle = INK + '0.55)'; g.lineWidth = 0.7;
      g.beginPath();
      g.moveTo(vx + 2.5, ly + 6); g.lineTo(vx + 5.5, ly + 12);
      g.moveTo(vx + 4, ly + 8); g.lineTo(vx + 2.8, ly + 12.5);
      g.stroke();
    }
  }
  g.restore();
}

/* ============================================================
   STAGE 2, IDEAS 5 + 6 + 7 - THE HARBOUR VERBS
   THE BOTTLE POST (idea 5): write a short note at sea, seal it, toss it
   over the rail - the bottle drifts away on the current and the note goes
   to the docs harbour (the real feedback webhook, the exact seven-key
   contract). When the harbour will not open (CORS ashore), the note is
   kept, the bottle still drifts, and a quiet line says the tide will
   carry it later.
   PACKET RUNS (idea 6): at a harbour you may take a packet addressed
   along a real citation edge toward the destination that cites this
   water most - counted in her own text, not guessed. Deliver it (land
   there by any honest means) and the trade route is inked on your chart
   for good; the strongest corpus lanes carry period route names.
   THE HARBOUR MASTER (idea 7): a dockside slip lists the ships in
   harbour - the real pages citing this one, every one a moored vessel
   with her name and rig; hail one and you board her.
   ============================================================ */

/* ---- the harbour data, raised once from the same graph the sea is ---- */
const hb = { ready: false, commOf: new Map(), laneNames: new Map(), packetCache: new Map() };
function harbourInit() {
  if (hb.ready || !world.communities || !world.graph) return;
  hb.ready = true;
  world.communities.forEach((c, i) => c.members.forEach(m => hb.commOf.set(m, i)));
  const lm = new Map();
  for (const [a, b2] of world.graph.edges) {
    const ca = hb.commOf.get(a), cb2 = hb.commOf.get(b2);
    if (ca == null || cb2 == null || ca === cb2) continue;
    const i = Math.min(ca, cb2), j = Math.max(ca, cb2);
    lm.set(i + '-' + j, (lm.get(i + '-' + j) || 0) + 1);
  }
  const top = [...lm.entries()].sort((x, y2) => y2[1] - x[1]).slice(0, 5);
  const pretty = s => {
    const short = s.split('/').pop();
    return short.length <= 4 ? short.toUpperCase()
      : short.split('-').map(w2 => w2 ? w2[0].toUpperCase() + w2.slice(1) : w2).join(' ');
  };
  for (const [k, total] of top) {
    const ij = k.split('-').map(Number);
    hb.laneNames.set(k, 'the ' + pretty(world.communities[ij[0]].hub) + ' & ' +
      pretty(world.communities[ij[1]].hub) + ' Run');
    void total;
  }
  diag.laneNames = [...hb.laneNames.values()];
}
function routeName(aSlug, bSlug) {
  harbourInit();
  const ca = hb.commOf.get(aSlug), cb2 = hb.commOf.get(bSlug);
  if (ca == null || cb2 == null || ca === cb2) return '';
  return hb.laneNames.get(Math.min(ca, cb2) + '-' + Math.max(ca, cb2)) || '';
}

/* the packet's true address: among the pages citing this water, the one
   whose own text mentions her most - counted, not guessed */
function packetFor(isle) {
  if (!isle || !world.graph || !world.content) return null;
  if (hb.packetCache.has(isle.slug)) return hb.packetCache.get(isle.slug);
  const citers = [];
  for (const [a, b2] of world.graph.edges) if (b2 === isle.slug) citers.push(a);
  let out = null;
  if (citers.length) {
    const re = new RegExp(isle.slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])', 'g');
    let best = null, bestN = -1, bestIn = -1;
    for (const q of citers) {
      const pg = world.content.pages[q];
      const hay = pg ? JSON.stringify(pg.blocks || []) : '';
      const m2 = hay.match(re);
      const cN = m2 ? m2.length : 1;
      const qI = world.bySlug.get(q);
      const qIn = qI ? (qI.inbound || 0) : 0;
      if (cN > bestN || (cN === bestN && qIn > bestIn)) { best = q; bestN = cN; bestIn = qIn; }
    }
    const I2 = world.bySlug.get(best);
    if (I2) out = { to: best, toTitle: I2.title, n: bestN };
  }
  hb.packetCache.set(isle.slug, out);
  return out;
}

function packetHTML(isle) {
  if (!world.graph) return '';
  if (ui.justDelivered && ui.justDelivered.to === isle.slug) {
    const jd = ui.justDelivered;
    return '<div class="ss-block pk-block"><h4>The packet run</h4><div class="pk-line">' +
      'Delivered: the packet from <b>' + esc(jd.fromTitle) + '</b> is in her hands. ' +
      'The route is inked on your chart for good' +
      (jd.name ? ' &mdash; she joins <i>' + esc(jd.name) + '</i>.' : '.') + '</div></div>';
  }
  if (visit.packet) {
    const T = world.bySlug.get(visit.packet.to);
    return '<div class="ss-block pk-block"><h4>The packet run</h4><div class="pk-line">' +
      'The packet for <b>' + esc(T ? T.title : visit.packet.to) + '</b> waits in the hold. ' +
      'Land there &mdash; by sail, by chart, by any citation &mdash; and she is delivered.</div></div>';
  }
  const p = packetFor(isle);
  if (!p) return '';
  return '<div class="ss-block pk-block"><h4>The packet run</h4><div class="pk-line">' +
    'A packet lies here addressed to <b>' + esc(p.toTitle) + '</b> &mdash; of every page that cites ' +
    'this water, the one that names her most (' + p.n + (p.n === 1 ? ' mention' : ' mentions') +
    ' in her own text).</div>' +
    '<button class="act" type="button" data-act="packet">Take the packet aboard</button></div>';
}

function packetDelivery(isle) {
  ui.justDelivered = null;
  const held = visit.packet;
  if (!held || held.to !== isle.slug) return;
  const from = world.bySlug.get(held.from);
  const name = routeName(held.from, held.to);
  visit.routes.push({ a: held.from, b: held.to, t: Date.now() });
  visit.packet = null;
  ui.justDelivered = { from: held.from, to: held.to,
    fromTitle: from ? from.title : held.from, name };
  logMark('Delivered the packet ' + (from ? from.title : held.from) + ' → ' + isle.title +
    (name ? ' — ' + name + ' is inked on the chart.' : ' — the route is inked on the chart.'));
  diag.routesRun = visit.routes.length;
  visit.save();
}

/* the routes YOU have run, inked for good over the sheet */
function drawRoutes(g, VV) {
  if (!visit.routes.length) return;
  g.save();
  const seen2 = new Set();
  for (const R of visit.routes) {
    const key = R.a + '>' + R.b;
    if (seen2.has(key)) continue;
    seen2.add(key);
    const A = world.bySlug.get(R.a), B2 = world.bySlug.get(R.b);
    if (!A || !B2) continue;
    const pa = VV(chartProject(A.pos.x, A.pos.y)), pb = VV(chartProject(B2.pos.x, B2.pos.y));
    const mx = (pa[0] + pb[0]) / 2, my = (pa[1] + pb[1]) / 2;
    const dx2 = pb[0] - pa[0], dy2 = pb[1] - pa[1];
    const dd = Math.hypot(dx2, dy2) || 1;
    const nx = -dy2 / dd, ny = dx2 / dd;
    const bow = Math.min(34, dd * 0.14);
    const cx2 = mx + nx * bow, cy2 = my + ny * bow;
    g.strokeStyle = GRN + '0.72)';
    g.lineWidth = 1.25;
    g.setLineDash([7, 3.2]);
    g.beginPath();
    g.moveTo(pa[0], pa[1]);
    g.quadraticCurveTo(cx2, cy2, pb[0], pb[1]);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = GRN + '0.85)';
    g.beginPath(); g.arc(pa[0], pa[1], 2.1, 0, TAU); g.fill();
    const ang = Math.atan2(pb[1] - cy2, pb[0] - cx2);
    g.beginPath();
    g.moveTo(pb[0], pb[1]);
    g.lineTo(pb[0] - Math.cos(ang - 0.42) * 7.5, pb[1] - Math.sin(ang - 0.42) * 7.5);
    g.lineTo(pb[0] - Math.cos(ang + 0.42) * 7.5, pb[1] - Math.sin(ang + 0.42) * 7.5);
    g.closePath(); g.fill();
    const nm = routeName(R.a, R.b);
    if (nm && (chart.z >= 1.6 || dd > 300)) {
      g.save();
      g.translate((mx + cx2) / 2, (my + cy2) / 2);
      let rot = Math.atan2(dy2, dx2);
      if (rot > Math.PI / 2) rot -= Math.PI;
      if (rot < -Math.PI / 2) rot += Math.PI;
      g.rotate(rot);
      g.font = 'italic 10.5px "Iowan Old Style", Palatino, Georgia, serif';
      g.fillStyle = GRN + '0.92)';
      g.textAlign = 'center';
      g.fillText(nm, 0, -4);
      g.restore();
    }
  }
  g.restore();
}

/* ---- THE HARBOUR MASTER'S SLIP ---- */
function rigOf(I) {
  return I.words >= 3600 ? 'a ship of the line, ' + commas(I.words) + ' words'
    : I.words >= 2000 ? 'a barque of ' + commas(I.words) + ' words'
    : I.words >= 900 ? 'a brig of ' + commas(I.words) + ' words'
    : 'a sloop of ' + commas(I.words) + ' words';
}
function harbourMasterHTML(isle) {
  if (!world.graph) return '';
  const ships = [];
  for (const [a, b2] of world.graph.edges) if (b2 === isle.slug) ships.push(a);
  let out = '<div class="ss-block hm-block"><h4>The harbour master&rsquo;s slip</h4>';
  if (!ships.length) {
    return out + '<div class="hm-none">No ship rides in this harbour: no page cites her.</div></div>';
  }
  ships.sort((a, b2) => {
    const A = world.bySlug.get(a), B3 = world.bySlug.get(b2);
    return ((B3 && B3.words) || 0) - ((A && A.words) || 0);
  });
  out += '<div class="hm-line">' + ships.length + (ships.length === 1 ? ' ship rides' : ' ships ride') +
    ' in harbour &mdash; every page that cites this one. Hail her and you board her.</div>' +
    '<ul class="plain hm-list">';
  for (const s of ships) {
    const T = world.bySlug.get(s);
    out += '<li><a href="#' + esc(s) + '" data-hail="1">' + esc(T ? T.title : s) + '</a>' +
      (T ? ' <span class="hm-rig">' + rigOf(T) + '</span>' : '') + '</li>';
  }
  return out + '</ul></div>';
}

/* ============================================================
   THE BOTTLE POST
   ============================================================ */
const bottlePost = { drift: [], hinted: false, posting: false };
const BOTTLE_URL = 'https://n8n.tools.strapi.team/webhook/docs-feedback';

function bottleWaters() {
  return ship.atAnchorOff || ship.bound || world.island;
}
function bottleOpen() {
  if (ui.mode !== 'deck' || portal.open) return;
  const el = $('bottleplate');
  if (!el || !el.hidden) return;
  const I = bottleWaters();
  el.querySelector('.bp-line').textContent =
    'These waters: ' + I.title + '. The note sails with their name on it.';
  el.hidden = false;
  const ta = $('bottletext');
  ta.value = '';
  setTimeout(() => ta.focus(), 30);
}
function bottleClose() {
  const el = $('bottleplate');
  if (!el || el.hidden) return;
  el.hidden = true;
  const ta = $('bottletext');
  if (ta) ta.blur();
}
function bottlePayload(comment, I) {
  /* THE SEVEN-KEY CONTRACT, byte for byte, in this order */
  return {
    vote: 'up',
    kind: 'element',
    comment: comment,
    pagePath: I.slug,
    pageTitle: I.title,
    selectionHeading: 'Design Lab - Carta Strapiana',
    channel: 'design-lab'
  };
}
function bottleToss() {
  const ta = $('bottletext');
  const comment = (ta.value || '').trim();
  if (!comment) { ta.focus(); return; }
  const I = bottleWaters();
  const payload = bottlePayload(comment, I);
  bottleClose();
  /* the bottle goes over the rail whatever the harbour says */
  if (!REDUCED) {
    bottlePost.drift.push({
      t: 0, life: 8.5,
      x: 640 + Math.random() * 120, y: 560,
      dir: (wx.lat >= 0 ? 1 : -1), ph: Math.random() * TAU
    });
  }
  diag.lastBottle = { url: BOTTLE_URL, header: 'docs-widget', payload };
  const body = JSON.stringify(payload);
  fetch(BOTTLE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-feedback-source': 'docs-widget' },
    body
  }).then(r => {
    if (!r.ok) throw new Error('harbour closed: ' + r.status);
    diag.bottleResult = 'sent';
    caption('The bottle rides the current, her note aboard, bound for the harbour.', 4600);
    logMark('A bottle away on the current for ' + I.title + ' — the note is in the harbour’s hands.');
    visit.save();
  }).catch(() => {
    diag.bottleResult = 'held';
    visit.bottles.push({ t: Date.now(), payload });
    caption('The tide holds her note; it will carry when the harbour opens.', 4600);
    logMark('Sealed a bottle for ' + I.title + ' — the tide holds the note until the harbour opens.');
    visit.save();
  });
}
function bottleInit() {
  const toss = $('bp-toss'), keep = $('bp-keep'), plate = $('bottleplate');
  if (!plate) return;
  toss.addEventListener('click', bottleToss);
  keep.addEventListener('click', bottleClose);
  plate.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); bottleClose(); }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); bottleToss(); }
  });
}
function bottleTick(dt) {
  for (let i = bottlePost.drift.length - 1; i >= 0; i--) {
    const b = bottlePost.drift[i];
    b.t += dt;
    if (b.t >= b.life) bottlePost.drift.splice(i, 1);
  }
  /* one quiet telling, once under way, never during the title */
  if (!bottlePost.hinted && env.t > 42 && ship.knots > 2 && ui.mode === 'deck' && !REDUCED) {
    bottlePost.hinted = true;
    caption('A bottle and a blank note stand by the rail. B writes to the harbour.', 5200);
  }
}
function drawBottles(sim, worldDY) {
  if (!bottlePost.drift.length) return;
  for (const b of bottlePost.drift) {
    const p = clamp(b.t / b.life, 0, 1);
    const e = 1 - Math.pow(1 - p, 2);
    const x = b.x + b.dir * e * 260 + Math.sin(env.t * 1.1 + b.ph) * 4 * (1 - e);
    const y = 560 - e * 128 + worldDY + Math.sin(env.t * 1.7 + b.ph) * 2.2 * (1 - e * 0.7);
    const s = 1 - e * 0.72;
    const a = p > 0.82 ? (1 - p) / 0.18 : 1;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(x, y);
    ctx.rotate(Math.sin(env.t * 1.3 + b.ph) * 0.18 * (1 - e) + b.dir * 0.12);
    ctx.scale(s, s);
    ctx.strokeStyle = 'rgba(46,36,24,0.85)';
    ctx.fillStyle = 'rgba(240,231,210,0.92)';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(-9, -3.2);
    ctx.lineTo(4, -3.2);
    ctx.quadraticCurveTo(8.5, -3.2, 8.5, 0);
    ctx.quadraticCurveTo(8.5, 3.2, 4, 3.2);
    ctx.lineTo(-9, 3.2);
    ctx.quadraticCurveTo(-12.5, 3.2, -12.5, 0);
    ctx.quadraticCurveTo(-12.5, -3.2, -9, -3.2);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8.5, -1.5); ctx.lineTo(12.5, -1.5); ctx.lineTo(12.5, 1.5); ctx.lineTo(8.5, 1.5);
    ctx.stroke();
    ctx.strokeRect(12.5, -1.9, 2.4, 3.8);
    /* the note within */
    ctx.strokeStyle = 'rgba(141,47,34,0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-7.5, 0.4); ctx.lineTo(1.5, 0.4); ctx.stroke();
    /* her small wake */
    ctx.strokeStyle = 'rgba(241,231,208,0.8)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-16, 4.6); ctx.quadraticCurveTo(-10, 6.4, -2, 5.2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

/* ============================================================
   STAGE 2, IDEAS 8 + 9 + 10 + 11 - THE LOG ILLUSTRATED, THE FIGUREHEAD,
   THE NIGHT PASSAGE, AND THE SHIP CAT
   THE ILLUSTRATED LOG (8): each first landfall engraves a small sketch
   of that island - drawn from her true baked geometry, the same plates
   the horizon shows - beside the entry; the whole log exports as a
   high-resolution PNG journal in the engraved hand.
   THE FIGUREHEAD SPEAKS (9): rarely, crossing new waters, she offers the
   true first sentence of that page on a banderole; never during reading,
   never twice for the same waters in a visit.
   NIGHT PASSAGE (10): at dusk the heavily cited capes burn lighthouses
   (one per twelve citations, the rule in the key), the citation
   constellation of the current waters hangs overhead, and a star can be
   steered by: click one and the course is laid.
   THE SHIP CAT (11): she naps on the chart table near the waters you
   visit most, walks the rail now and then, and stares toward monster
   waters before they raise. She never blocks a hand; reduced motion
   keeps her asleep.
   ============================================================ */

/* ---------------- IDEA 8: the illustrated log ---------------- */
function drawLogSketch(cv2) {
  const I = world.bySlug.get(cv2.dataset.slug);
  if (!I) return;
  const sp = getSprite(I, 1, true);
  if (!sp) return;
  const g = cv2.getContext('2d');
  const w2 = cv2.width, h2 = cv2.height;
  g.clearRect(0, 0, w2, h2);
  /* the vignette: her true plate, small, over a stroke of sea */
  const asp = sp.c.width / sp.c.height;
  let dw = w2 - 14, dh = dw / asp;
  if (dh > h2 - 18) { dh = h2 - 18; dw = dh * asp; }
  const dx2 = (w2 - dw) / 2, dy2 = h2 - 12 - dh;
  g.imageSmoothingEnabled = true;
  try { g.imageSmoothingQuality = 'high'; } catch (e) { /* older glass */ }
  g.drawImage(sp.c, dx2, dy2, dw, dh);
  /* the waterline and a few sea dashes, in the sketching hand */
  g.strokeStyle = 'rgba(58,44,28,0.75)';
  g.lineWidth = 0.9;
  g.beginPath();
  g.moveTo(6, h2 - 11); g.lineTo(w2 - 6, h2 - 11);
  g.stroke();
  g.lineWidth = 0.6;
  g.strokeStyle = 'rgba(58,44,28,0.45)';
  g.beginPath();
  const rnd = rngFor('sketchsea:' + I.slug);
  for (let i = 0; i < 5; i++) {
    const x = 8 + rnd() * (w2 - 30), y = h2 - 8 + rnd() * 4;
    g.moveTo(x, y); g.lineTo(x + 7 + rnd() * 9, y);
  }
  g.stroke();
}
function wireLogSketches(p) {
  p.querySelectorAll('canvas.lg-sk').forEach(drawLogSketch);
  const ex = p.querySelector('#logexport');
  if (ex) ex.addEventListener('click', () => exportJournal(true));
}
/* the journal, engraved at high resolution and handed to the visitor */
function exportJournal(download) {
  const X = 2.5, JW = 1080;
  const rows = visit.log;
  const firstIdx = new Set();
  {
    const seen2 = new Set();
    rows.forEach((r, i) => {
      if (!r.mark && r.slug && !seen2.has(r.slug)) { seen2.add(r.slug); firstIdx.add(i); }
    });
  }
  let JH = 236;
  rows.forEach((r, i) => { JH += r.mark ? 46 : (firstIdx.has(i) ? 108 : 64); });
  JH += 90;
  const c = document.createElement('canvas');
  c.width = Math.round(JW * X); c.height = Math.round(JH * X);
  const g = c.getContext('2d');
  g.scale(X, X);
  /* the paper */
  g.fillStyle = PAPER;
  g.fillRect(0, 0, JW, JH);
  const rndP = rngFor('journalpaper');
  g.fillStyle = 'rgba(120,96,58,0.05)';
  for (let i = 0; i < 260; i++) {
    g.fillRect(rndP() * JW, rndP() * JH, 1.5 + rndP() * 3, 0.8 + rndP() * 1.6);
  }
  g.strokeStyle = INK + '0.6)'; g.lineWidth = 1.4;
  g.strokeRect(18, 18, JW - 36, JH - 36);
  g.strokeStyle = INK + '0.3)'; g.lineWidth = 0.7;
  g.strokeRect(24, 24, JW - 48, JH - 48);
  const SER = '"Iowan Old Style", Palatino, Georgia, serif';
  g.fillStyle = INK + '0.92)';
  g.textAlign = 'center';
  g.font = '600 30px ' + SER;
  g.fillText('T H E   C A P T A I N ’ S   L O G', JW / 2, 76);
  g.font = 'italic 15px ' + SER;
  g.fillStyle = INK + '0.7)';
  g.fillText('Carta Strapiana · a chart of the Strapi documentation, sailed', JW / 2, 102);
  g.fillText(new Date().toDateString() + ' · ' + rows.length +
    (rows.length === 1 ? ' entry' : ' entries') + ', kept noon to noon' +
    (visit.hand ? ' · the watch signed: ' + visit.hand : ''), JW / 2, 124);
  g.strokeStyle = RED + '0.6)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(JW / 2 - 120, 140); g.lineTo(JW / 2 + 120, 140); g.stroke();
  /* the entries */
  let y = 176;
  g.textAlign = 'left';
  const wrap = (txt, x, yy, wmax, lh, font, col) => {
    g.font = font; g.fillStyle = col;
    const words = String(txt).split(/\s+/);
    let line = '', n2 = 0;
    for (const w3 of words) {
      const t2 = line ? line + ' ' + w3 : w3;
      if (g.measureText(t2).width > wmax && line) {
        g.fillText(line, x, yy + n2 * lh); n2++; line = w3;
      } else line = t2;
    }
    if (line) { g.fillText(line, x, yy + n2 * lh); n2++; }
    return n2 * lh;
  };
  rows.forEach((r, i) => {
    g.fillStyle = INK + '0.85)';
    g.font = '600 13px ' + SER;
    g.fillText('H ' + r.h, 44, y);
    if (r.mark) {
      wrap(r.text, 92, y, JW - 160, 17, 'italic 14px ' + SER, INK + '0.85)');
      if (r.remark) wrap('“' + r.remark + '”', 112, y + 20, JW - 200, 16, 'italic 13px ' + SER, RED + '0.8)');
      y += 46;
    } else {
      const isFirst = firstIdx.has(i);
      wrap('Made ' + r.title + ' · ' + commas(r.f) + ' fathoms · ' + r.courses + ' · ' + r.winds,
        92, y, JW - (isFirst ? 300 : 160), 17, '14px ' + SER, INK + '0.88)');
      if (r.remark) wrap('“' + r.remark + '”', 112, y + 36, JW - 300, 16, 'italic 13px ' + SER, RED + '0.8)');
      if (isFirst) {
        /* the first landfall carries her engraved sketch */
        const I2 = world.bySlug.get(r.slug);
        const sp = I2 ? getSprite(I2, 1, true) : null;
        if (sp) {
          const bw = 168, bh = 86, bx = JW - 92 - bw, by = y - 14;
          g.strokeStyle = INK + '0.4)'; g.lineWidth = 0.8;
          g.strokeRect(bx, by, bw, bh);
          const asp = sp.c.width / sp.c.height;
          let dw = bw - 16, dh = dw / asp;
          if (dh > bh - 20) { dh = bh - 20; dw = dh * asp; }
          g.drawImage(sp.c, bx + (bw - dw) / 2, by + bh - 12 - dh, dw, dh);
          g.strokeStyle = 'rgba(58,44,28,0.7)'; g.lineWidth = 0.8;
          g.beginPath(); g.moveTo(bx + 8, by + bh - 10); g.lineTo(bx + bw - 8, by + bh - 10); g.stroke();
          g.font = 'italic 10px ' + SER;
          g.fillStyle = INK + '0.6)';
          g.textAlign = 'center';
          g.fillText('first landfall', bx + bw / 2, by + bh + 12);
          g.textAlign = 'left';
        }
        y += 108;
      } else y += 64;
    }
  });
  g.font = 'italic 12px ' + SER;
  g.fillStyle = INK + '0.55)';
  g.textAlign = 'center';
  g.fillText('every figure in this journal is the corpus’s own · nothing is scored', JW / 2, JH - 40);
  diag.journal = { w: c.width, h: c.height, entries: rows.length, sketches: firstIdx.size };
  const url = c.toDataURL('image/png');
  if (download) {
    const a = document.createElement('a');
    a.download = 'carta-strapiana-log.png';
    a.href = url;
    a.click();
  }
  return url;
}

/* ---------------- IDEA 9: the figurehead speaks ---------------- */
const fh = { spoken: new Set(store.get('spoken', [])), lastAt: -1e9, upTil: 0 };
function firstSentenceOf(I) {
  const pg = world.content.pages[I.slug];
  if (!pg || !pg.blocks) return '';
  let fall = '';
  for (const b of pg.blocks) {
    if (b.t !== 'p' && b.t !== 'tldr') continue;
    const txt = String(b.html || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ').replace(/&#39;/g, '’').replace(/&quot;/g, '"')
      .replace(/\*/g, '')
      .replace(/\s+/g, ' ').trim();
    if (txt.length < 12) continue;
    if (b.t === 'tldr') { if (!fall) fall = txt; continue; }
    const m2 = txt.match(/^.{12,220}?[.!?](?=\s|$)/);
    return (m2 ? m2[0] : txt.slice(0, 200)).trim();
  }
  const m3 = fall.match(/^.{12,220}?[.!?](?=\s|$)/);
  return fall ? (m3 ? m3[0] : fall.slice(0, 200)).trim() : '';
}
function fhTick() {
  const el = $('figurehead');
  if (!el) return;
  if (fh.upTil && env.t > fh.upTil) { el.classList.remove('shown'); fh.upTil = 0; }
  if (ui.mode !== 'deck' || passage.on || lens.t > 0.15 || portal.open) return;
  if (env.t < 14 || env.t - fh.lastAt < 75) return;
  const I = ship.bound;
  if (!I || ship.anchored) return;
  const d = distToNm(I);
  if (d > 2.3) return;
  if (visit.charted.has(I.slug) || fh.spoken.has(I.slug)) return;
  const line = firstSentenceOf(I);
  if (!line) { fh.spoken.add(I.slug); return; }
  fh.spoken.add(I.slug);
  store.set('spoken', [...fh.spoken].slice(-80));
  fh.lastAt = env.t;
  fh.upTil = env.t + 7.5;
  el.querySelector('.fh-line').textContent = '“' + line + '”';
  el.querySelector('.fh-who').textContent = 'the figurehead speaks · her page’s own first words';
  el.classList.add('shown');
  diag.fhSpoke = I.slug;
}

/* ---------------- IDEA 10: the night passage ---------------- */
/* lighthouses: one per twelve citations, burning from any distance at dusk */
function drawLighthouses(isle, cxScreen, yBase, wpx, s, dist, stage) {
  const mix = env.hourMix;
  if (mix < 0.5 || (isle.inbound || 0) < 12) return;
  const nL = Math.min(4, Math.floor(isle.inbound / 12));
  const F = formOf(isle);
  const rnd = rngFor('lighthouse:' + isle.slug);
  const left = cxScreen - wpx / 2;
  const a = clamp((6.4 - dist) / 3.4, 0, 1) * clamp((mix - 0.5) / 0.5, 0, 1);
  if (a <= 0.02) return;
  for (let i = 0; i < nL; i++) {
    const fx = F.x0 + (0.14 + 0.72 * (i + 0.5) / nL + (rnd() - 0.5) * 0.08) * (F.x1 - F.x0);
    const ex = left + (fx - F.x0) / (F.x1 - F.x0) * wpx;
    const ey = yBase - (F.BASE - F.elev(fx)) * s - 2;
    const th = clamp(26 * s * 46, 5, 15);           /* tower height on screen */
    ctx.save();
    ctx.globalAlpha = a;
    /* the tower, a dark daymark */
    ctx.fillStyle = 'rgba(40,30,18,0.85)';
    ctx.beginPath();
    ctx.moveTo(ex - th * 0.16, ey);
    ctx.lineTo(ex - th * 0.10, ey - th);
    ctx.lineTo(ex + th * 0.10, ey - th);
    ctx.lineTo(ex + th * 0.16, ey);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(ex - th * 0.16, ey - th - th * 0.14, th * 0.32, th * 0.14);
    /* the lamp and her slow beam */
    const ly = ey - th - th * 0.07;
    ctx.fillStyle = 'rgba(246,214,140,0.95)';
    ctx.beginPath(); ctx.arc(ex, ly, Math.max(1.2, th * 0.10), 0, TAU); ctx.fill();
    const sweep = REDUCED ? (i * 1.1) : env.t * 0.5 + i * 2.1;
    const bl = th * 3.2;
    for (const dir of [-1, 1]) {
      const angB = Math.PI + Math.sin(sweep) * 0.5 + (dir > 0 ? 0 : Math.PI);
      ctx.globalAlpha = a * 0.16;
      ctx.fillStyle = 'rgba(246,222,160,0.9)';
      ctx.beginPath();
      ctx.moveTo(ex, ly);
      ctx.lineTo(ex + Math.cos(angB - 0.05) * bl, ly + Math.sin(angB - 0.05) * bl * 0.22);
      ctx.lineTo(ex + Math.cos(angB + 0.05) * bl, ly + Math.sin(angB + 0.05) * bl * 0.22);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
/* the constellation of the current waters, hung overhead and steerable */
const nightSky = { for: '', stars: [], hits: [], hover: -1 };
function buildConstellation() {
  const I = ship.bound || world.island;
  if (!I || nightSky.for === I.slug) return;
  nightSky.for = I.slug;
  nightSky.stars = [];
  const rel = new Map();
  for (const [a, b2] of world.graph.edges) {
    if (b2 === I.slug) rel.set(a, (rel.get(a) || 0) + 1);
    if (a === I.slug) rel.set(b2, (rel.get(b2) || 0) + 1);
  }
  const list = [...rel.keys()].map(s2 => world.bySlug.get(s2)).filter(Boolean)
    .sort((x, y3) => (y3.inbound || 0) - (x.inbound || 0)).slice(0, 12);
  if (!list.length) return;
  let mx = 0.001;
  for (const T of list) {
    mx = Math.max(mx, Math.abs(T.pos.x - I.pos.x), Math.abs(T.pos.y - I.pos.y));
  }
  const rnd = rngFor('sky:' + I.slug);
  const kx = 480 / mx, ky = 132 / mx;
  for (const T of list) {
    nightSky.stars.push({
      isle: T,
      x: clamp(720 + (T.pos.x - I.pos.x) * kx + (rnd() - 0.5) * 26, 96, W - 96),
      y: clamp(128 + (T.pos.y - I.pos.y) * ky + (rnd() - 0.5) * 20, 44, HORIZON - 128),
      r: 2.1 + Math.min(2.4, (T.inbound || 0) * 0.05),
      ph: rnd() * TAU
    });
  }
  diag.constellation = { of: I.slug, stars: nightSky.stars.length };
}
function drawConstellation(map) {
  const mix = env.hourMix;
  nightSky.hits = [];
  if (mix < 0.55 || ui.mode !== 'deck') return;
  buildConstellation();
  if (!nightSky.stars.length) return;
  const a0 = (mix - 0.55) / 0.45;
  const k = map ? map.k : 1, ox = map ? map.ox : 0, oy = map ? map.oy : 0;
  const zx = 720 * k + ox, zy = 74 * k + oy;
  ctx.save();
  /* the figure: faint rhumbs from the zenith - the current waters - to her kin */
  ctx.strokeStyle = 'rgba(246,238,218,0.8)';
  ctx.lineWidth = 0.55 * k;
  ctx.globalAlpha = a0 * 0.16;
  ctx.beginPath();
  for (const s2 of nightSky.stars) {
    ctx.moveTo(zx, zy);
    ctx.lineTo(s2.x * k + ox, s2.y * k + oy);
  }
  ctx.stroke();
  /* the zenith star: the waters herself */
  ctx.globalAlpha = a0 * 0.95;
  ctx.fillStyle = 'rgba(246,238,218,1)';
  const drawStar4 = (x, y, r) => {
    ctx.beginPath();
    ctx.moveTo(x, y - r * 2.1);
    ctx.quadraticCurveTo(x + r * 0.35, y - r * 0.35, x + r * 2.1, y);
    ctx.quadraticCurveTo(x + r * 0.35, y + r * 0.35, x, y + r * 2.1);
    ctx.quadraticCurveTo(x - r * 0.35, y + r * 0.35, x - r * 2.1, y);
    ctx.quadraticCurveTo(x - r * 0.35, y - r * 0.35, x, y - r * 2.1);
    ctx.closePath();
    ctx.fill();
  };
  drawStar4(zx, zy, 2.6 * k);
  for (let i2 = 0; i2 < nightSky.stars.length; i2++) {
    const s2 = nightSky.stars[i2];
    const tw = REDUCED ? 0.8 : 0.62 + 0.38 * Math.sin(env.t * 1.4 + s2.ph);
    const x = s2.x * k + ox, y = s2.y * k + oy;
    ctx.globalAlpha = a0 * tw;
    drawStar4(x, y, s2.r * k * (nightSky.hover === i2 ? 1.5 : 1));
    nightSky.hits.push({ i: i2, x: s2.x, y: s2.y, r: 14 });
    if (nightSky.hover === i2) {
      ctx.globalAlpha = a0;
      ctx.font = 'italic ' + (12.5 * k).toFixed(1) + 'px "Iowan Old Style", Palatino, Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(s2.isle.title, x, y + 22 * k);
      ctx.font = 'italic ' + (10.5 * k).toFixed(1) + 'px "Iowan Old Style", Palatino, Georgia, serif';
      ctx.globalAlpha = a0 * 0.75;
      ctx.fillText('click to lay a course · ' + compassPoint(bearingTo(s2.isle)) + ' · ' +
        (Math.round(distToNm(s2.isle) * 10) / 10) + ' nm', x, y + (22 + 15) * k);
      ctx.textAlign = 'left';
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}
function starPick(mx, my) {
  if (env.hourMix < 0.55 || !nightSky.hits.length) return null;
  for (const hh of nightSky.hits) {
    if (Math.hypot(mx - hh.x, my - hh.y) < hh.r) return hh;
  }
  return null;
}
function steerByStar(hit) {
  const s2 = nightSky.stars[hit.i];
  if (!s2) return;
  const I = s2.isle;
  setBound(I, true);
  const delta = angDiff(bearingTo(I), effectiveOrder(env.t));
  giveOrder(delta);
  captionNow('A course laid by her star: ' + I.title + ', ' + compassPoint(bearingTo(I)) + ', ' +
    (Math.round(distToNm(I) * 10) / 10) + ' nm.', 5200);
  diag.steeredByStar = I.slug;
}

/* ---------------- IDEA 11: the ship cat ---------------- */
const cat = {
  deck: 'below',        /* below | walk | stare */
  u: 0, side: 1, nextWalk: 70 + (SEED % 40), frame: 0, ft: 0,
  stareAt: null, beasts: null, chartEl: null, chartFrame: 0, chartTimer: 0,
  home: null
};
function catBeasts() {
  if (cat.beasts) return cat.beasts;
  /* the same three fiercest the chart raises, derived the same way */
  const un = world.uncited.slice();
  const byWords = un.slice().sort((a, b2) => b2.words - a.words);
  const byOut = un.slice().sort((a, b2) => b2.outbound - a.outbound);
  const f = [byWords[0]];
  if (byOut[0] && f.indexOf(byOut[0]) < 0) f.push(byOut[0]);
  for (const I of byWords) { if (f.length >= 3) break; if (f.indexOf(I) < 0) f.push(I); }
  cat.beasts = f.filter(Boolean);
  return cat.beasts;
}
function catTick(dt) {
  if (REDUCED) return;                 /* reduced motion keeps her asleep below */
  cat.ft += dt;
  if (cat.ft > 0.42) { cat.ft = 0; cat.frame = (cat.frame + 1) % 3; }
  /* monster waters near but not yet raised: she comes up to stare */
  let nearBeast = null;
  for (const B of catBeasts()) {
    const d = distToNm(B);
    if (d < 8.8 && d > VIS_NM - 0.5) { nearBeast = B; break; }
  }
  if (nearBeast) {
    cat.deck = 'stare';
    cat.stareAt = nearBeast;
    const brg = angDiff(bearingTo(nearBeast), ship.bearing);
    cat.side = brg >= 0 ? 1 : -1;
    cat.u = 0.62;
    return;
  }
  if (cat.deck === 'stare') { cat.deck = 'below'; cat.stareAt = null; cat.nextWalk = env.t + 24; }
  if (cat.deck === 'below' && env.t > cat.nextWalk && ui.mode === 'deck' && !passage.on) {
    cat.deck = 'walk';
    cat.u = 0.04;
    cat.side = (Math.floor(env.t) % 2) ? 1 : -1;
  }
  if (cat.deck === 'walk') {
    cat.u += dt / 26;                  /* a rail walked in an unhurried half minute */
    if (cat.u >= 0.9) { cat.deck = 'below'; cat.nextWalk = env.t + 150 + (SEED % 60); }
  }
}
/* the engraved cat: authored poses, three frames per behaviour */
function drawCatPose(g, pose, frame) {
  g.lineJoin = 'round'; g.lineCap = 'round';
  const ink = 'rgba(40,30,18,0.94)';
  g.fillStyle = ink;
  if (pose === 'curl') {
    /* asleep in a curl: body ring, tucked head; f1 lifts the tail tip,
       f2 raises the head a breath */
    g.beginPath();
    g.ellipse(0, 0, 13.5, 9.6, 0, 0, TAU);
    g.fill();
    g.fillStyle = PAPER;
    g.beginPath();
    g.ellipse(1.5, 1.6, 6.4, 4.2, 0, 0, TAU);
    g.fill();
    g.fillStyle = ink;
    /* the head, tucked or lifted */
    if (frame === 2) {
      g.beginPath();
      g.ellipse(8.6, -8.4, 4.6, 4.0, -0.3, 0, TAU); g.fill();
      g.beginPath();
      g.moveTo(6.2, -11.6); g.lineTo(5.4, -15.2); g.lineTo(8.4, -13.2);
      g.moveTo(10.4, -12.2); g.lineTo(11.8, -15.4); g.lineTo(12.8, -11.6);
      g.fill();
    } else {
      g.beginPath();
      g.ellipse(7.8, -3.4, 5.0, 4.2, -0.5, 0, TAU); g.fill();
      g.beginPath();
      g.moveTo(5.2, -6.8); g.lineTo(4.2, -10.2); g.lineTo(7.4, -8.4);
      g.moveTo(9.6, -8.0); g.lineTo(11.4, -10.8); g.lineTo(12.0, -7.2);
      g.fill();
    }
    /* the tail wrap; the flick frame lifts her tip */
    g.strokeStyle = ink; g.lineWidth = 3.1;
    g.beginPath();
    g.moveTo(-12.5, 3.5);
    if (frame === 1) g.quadraticCurveTo(-17, 6, -16.5, -3.5);
    else g.quadraticCurveTo(-18, 7, -10, 8.6);
    g.stroke();
  } else if (pose === 'walk') {
    const step = frame % 2 ? 1 : -1;
    /* the body and head, one clear silhouette */
    g.beginPath();
    g.moveTo(-11.5, -6.2);
    g.bezierCurveTo(-9, -10.8, 3, -11.4, 8.5, -8.2);
    g.lineTo(10.2, -11);
    g.bezierCurveTo(10.8, -13.6, 12, -14.8, 13.6, -14.8);
    g.lineTo(14.0, -18.4); g.lineTo(16.0, -15.2);
    g.lineTo(17.8, -17.6); g.lineTo(18.4, -14.4);
    g.bezierCurveTo(19.6, -12.9, 19.3, -10.6, 17.6, -9.6);
    g.bezierCurveTo(16, -8.6, 14, -8.4, 12.8, -8.8);
    g.bezierCurveTo(12.4, -6.6, 12, -5.4, 11.6, -4.6);
    g.lineTo(-10.4, -4.6);
    g.closePath();
    g.fill();
    /* four legs: two strides and a gathered glide - three authored frames */
    g.strokeStyle = ink; g.lineWidth = 2.0; g.lineCap = 'round';
    g.beginPath();
    if (frame === 2) {
      g.moveTo(9.4, -5); g.lineTo(9.8, 0.2);
      g.moveTo(6.4, -5); g.lineTo(6.0, 0.2);
      g.moveTo(-4.4, -5); g.lineTo(-4.0, 0.2);
      g.moveTo(-8.0, -5); g.lineTo(-8.4, 0.2);
    } else {
      g.moveTo(9.6, -5); g.lineTo(10.6 + step * 2.2, 0.2);
      g.moveTo(6.2, -5); g.lineTo(5.2 - step * 2.2, 0.2);
      g.moveTo(-4.2, -5); g.lineTo(-3.2 + step * 2.0, 0.2);
      g.moveTo(-8.2, -5); g.lineTo(-9.2 - step * 2.0, 0.2);
    }
    g.stroke();
    /* the tail rides high, swaying with the step */
    g.lineWidth = 2.6;
    g.beginPath();
    g.moveTo(-11.4, -7);
    g.quadraticCurveTo(-16.5 - step * 1.4, -13, -14.5 + step * 1.6, -19.5);
    g.stroke();
  } else {
    /* sit-and-stare, out over the rail; f1 tilts the head, f2 sways the tail */
    const tilt = frame === 1 ? 0.12 : 0;
    g.save();
    g.beginPath();
    g.moveTo(-8.5, 0);
    g.bezierCurveTo(-10.5, -8.5, -5.5, -13.5, -1.5, -13.8);
    g.bezierCurveTo(0.5, -14, 1.6, -13, 2.6, -11);
    g.lineTo(3.4, -15);
    g.rotate(tilt);
    g.bezierCurveTo(3.6, -17.4, 4.8, -18.6, 6.4, -18.6);
    g.lineTo(6.9, -21.4); g.lineTo(8.6, -19);
    g.lineTo(10.3, -20.8); g.lineTo(10.8, -18.2);
    g.bezierCurveTo(11.9, -17, 11.9, -15, 10.6, -14.1);
    g.rotate(-tilt);
    g.bezierCurveTo(9.4, -13.2, 7.6, -13.2, 6.6, -13.7);
    g.bezierCurveTo(7.4, -8.6, 7.8, -4.2, 7.4, 0);
    g.closePath();
    g.fill();
    g.strokeStyle = ink; g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(7.2, -0.5);
    if (frame === 2) g.quadraticCurveTo(13.5, -2.5, 13.8, -8);
    else g.quadraticCurveTo(13, -1, 13.6, -4.6);
    g.stroke();
    g.restore();
  }
}
function drawDeckCat(g, t, sim) {
  if (REDUCED || cat.deck === 'below' || ui.mode !== 'deck') return;
  const [rx, ry] = railPoint(cat.side, cat.u);
  g.save();
  g.translate(rx, ry - 2);
  const away = 0.62 + 0.38 * cat.u;     /* smaller toward the bow */
  const s = 2.05 * away;
  if (cat.deck === 'walk') {
    g.scale(cat.side > 0 ? -s : s, s);  /* she walks toward the bow */
    drawCatPose(g, 'walk', cat.frame);
  } else {
    g.scale(cat.side > 0 ? -s : s, s);  /* she faces the sea she watches */
    drawCatPose(g, 'stare', cat.frame);
  }
  g.restore();
}
/* the chart-table cat: she settles near the waters you visit most */
function catHomeIsle() {
  const counts = new Map();
  for (const r of visit.log) if (r.slug) counts.set(r.slug, (counts.get(r.slug) || 0) + 1);
  let best = null, bn = 0;
  for (const [s2, n2] of counts) if (n2 > bn) { bn = n2; best = s2; }
  return best ? world.bySlug.get(best) : (ship.bound || world.island);
}
function drawChartCat() {
  const el = $('chartcat');
  if (!el) return;
  const g = el.getContext('2d');
  g.setTransform(2, 0, 0, 2, 0, 0);
  g.clearRect(0, 0, 60, 46);
  g.save();
  g.translate(30, 27);
  /* her small shadow on the vellum */
  g.fillStyle = 'rgba(38,28,17,0.14)';
  g.beginPath(); g.ellipse(0.5, 7.5, 15, 4.4, 0, 0, TAU); g.fill();
  drawCatPose(g, 'curl', REDUCED ? 0 : cat.chartFrame);
  g.restore();
}
function placeChartCat() {
  const el = $('chartcat');
  if (!el || !chart.layoutView) return;
  const I = catHomeIsle();
  cat.home = I ? I.slug : null;
  if (!I) { el.style.display = 'none'; return; }
  const L = chart.layoutView;
  const p = chartProject(I.pos.x, I.pos.y);
  const x = clamp((p[0] * L.z + L.tx) * L.S + L.dx + 26 * L.S, 60, 1400 * L.S + L.dx - 60);
  const y = clamp((p[1] * L.z + L.ty) * L.S + L.dy - 20 * L.S, 46, 810 * L.S + L.dy - 40);
  el.style.display = 'block';
  el.style.left = x.toFixed(1) + 'px';
  el.style.top = y.toFixed(1) + 'px';
  drawChartCat();
  diag.chartCat = { near: cat.home, x: Math.round(x), y: Math.round(y) };
}
function chartCatBeat() {
  /* her tail flicks now and then; a rare frame lifts her head */
  if (REDUCED) return;
  cat.chartFrame = cat.chartFrame === 0 ? (Math.random() < 0.25 ? 2 : 1) : 0;
  if (ui.mode === 'below' && ui.tab === 'chart') drawChartCat();
}

(async function boot() {
  try {
    await loadData();
  } catch (err) {
    document.getElementById('loading').textContent = 'The charts would not open: ' + err.message;
    throw err;
  }
  bakePaper();
  bake.skyAfternoon = bakeSky('afternoon');
  bake.skyDusk = bakeSky('dusk');
  bakeSkyLines();
  bakeBases();
  bakeClouds();
  bakeBands();
  bakeDeck();
  bakeWheel();
  bakeLensRing();
  initFoam();
  initStreaks();
  initInput();
  initUI();
  buildSearchIndex();
  for (const I of world.islands) if (visit.charted.has(I.slug)) I.charted = true;
  sound.init();

  initEggs();
  wxInit();
  harbourInit();
  bottleInit();
  setInterval(chartCatBeat, 1700);

  /* QUICK START FIRST (owner law): a cold load bears for the Quick Start
     Guide; a stated ?dist / ?open / ?below order, or a visit that has already
     charted her, stands as before. */
  const qsIsle = world.bySlug.get('/cms/quick-start');
  story.qs = qsIsle || null;
  story.maiden = !!qsIsle && !params.get('dist') && !params.get('open') && !params.get('below') &&
    !visit.charted.has(qsIsle.slug);
  placeShipAtDistance(parseFloat(params.get('dist')) || 2.7, story.maiden ? qsIsle : undefined);
  ship.lastFix = { x: ship.x, y: ship.y, t: 0 };
  visit.track.push({ x: ship.x, y: ship.y });
  /* STAGE 2: the known chart - the survey grid raised, this visit seeded */
  fogInitGrid();
  for (const sg of visit.charted) { const Ic = world.bySlug.get(sg); if (Ic) fogSee(Ic.pos.x, Ic.pos.y, 1.1); }
  fogSee(ship.x, ship.y, FOG_SEE_NM);
  fogSyncSwitch();
  diag.fogMode = fog.mode; diag.fogSeen = fog.seen.size;
  sound.setHarbour(world.island);
  /* the calm start (owner order): she begins hove to, no way on. A ?sail=
     parameter is a stated order and stands, and it also ends the teaching. */
  ship.sail = params.get('sail') || 'rest';
  ship.knots = 0;
  calm.pristine = !params.get('sail') && !params.get('open') && !params.get('below');
  if (!calm.pristine) calm.done = true;
  if (params.get('hour') === 'dusk') { env.hourTarget = 1; env.hourMix = 1; }

  document.getElementById('loading').classList.add('hidden');
  const pt = document.getElementById('plate-title');
  const hints = document.getElementById('hints');
  pt.classList.add('shown');
  setTimeout(() => pt.classList.remove('shown'), 7000);
  /* the teaching: full sailing orders the first time, one quiet line after.
     The full card stays until the first meaningful input eases it off. */
  const taught = store.get('taught', false);
  if (taught) {
    hints.innerHTML = 'Hove to. <b>F</b> makes sail &middot; drag the wheel &middot; ' +
      'hold <b>SPACE</b> for the glass &middot; <b>C</b> the chart table.';
    hints.classList.add('shown', 'quiet');
    setTimeout(() => hints.classList.remove('shown'), 11000);
  } else if (!calm.done) {
    hints.classList.add('shown');
  }
  if (params.get('open')) { const o = world.bySlug.get(params.get('open')); if (o) warpTo(o.slug, 'packet'); }
  if (params.get('below')) openBelow(params.get('below'));

  if (REDUCED) {
    document.documentElement.classList.add('becalmed');
    caption('Becalmed: reduced motion honored. The sea holds its pose; the helm answers instantly.', 6000);
    becalmFrame();
  } else {
    requestAnimationFrame(frame);
  }
  window.__helm.ready = true;

})();
