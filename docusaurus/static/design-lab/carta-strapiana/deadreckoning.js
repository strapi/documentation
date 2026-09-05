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
const COMPRESSION = 20;            // world speed compression
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
  archipelagos: [],   // 27, one per community
  content: null, graph: null, communities: null, prov: null, register: null,
  uncited: [], desert: [], lone: [], nightIsles: []
};

async function loadData() {
  const [graph, communities, content, prov, register] = await Promise.all([
    fetch('graph.json').then(r => r.json()),
    fetch('communities.json').then(r => r.json()),
    fetch('content.json').then(r => r.json()),
    fetch('provenance.json').then(r => r.json()),
    fetch('register.json').then(r => r.json())
  ]);
  world.prov = prov;
  world.register = register;

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

  /* deterministic force layout of the 27 communities */
  const n = communities.length;
  const rnd = rngFor('layout');
  const pos = [];
  for (let k = 0; k < n; k++) {
    const ang = k * 2.399963 + rnd() * 0.35;
    const rad = 0.35 + 0.65 * Math.sqrt((k + 1) / n);
    pos.push({ x: Math.cos(ang) * rad, y: Math.sin(ang) * rad });
  }
  const REST = 0.55;
  for (let it = 0; it < 260; it++) {
    const fx = new Array(n).fill(0), fy = new Array(n).fill(0);
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      let dx = pos[b].x - pos[a].x, dy = pos[b].y - pos[a].y;
      let d2 = dx * dx + dy * dy + 1e-4, d = Math.sqrt(d2);
      const rep = 0.012 / d2;
      fx[a] -= dx / d * rep; fy[a] -= dy / d * rep;
      fx[b] += dx / d * rep; fy[b] += dy / d * rep;
    }
    for (const L of lanes) {
      const a = L.i, b = L.j;
      let dx = pos[b].x - pos[a].x, dy = pos[b].y - pos[a].y;
      const d = Math.sqrt(dx * dx + dy * dy) + 1e-6;
      const k = 0.012 * Math.log(1 + L.total) * (d - REST);
      fx[a] += dx / d * k; fy[a] += dy / d * k;
      fx[b] -= dx / d * k; fy[b] -= dy / d * k;
    }
    const cool = 1 - it / 300;
    for (let k = 0; k < n; k++) {
      pos[k].x += clamp(fx[k], -0.05, 0.05) * cool;
      pos[k].y += clamp(fy[k], -0.05, 0.05) * cool;
    }
  }
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

  /* the whole corpus becomes the sea: 290 islands in 27 archipelagos */
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
    communities = world.communities, of = world.commOf, prov = world.prov;
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
      description: page.description || '', section: page.section, product: page.product,
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
      /* size from word count: the Document Service island, 3,447 words, is 1.00 */
      mag: clamp(Math.pow(words / 3447, 0.34), 0.44, 1.85),
      pos: { x: 0, y: 0 },
      charted: false, visited: 0
    };
    isles.push(isle);
    world.bySlug.set(slug, isle);
  }

  /* --- archipelagos: a local layout per community, hub pinned at the centre --- */
  /* A group of n islands at a mile between neighbours needs a disc of radius
     0.525 * s * sqrt(n) if it is packed the way circles pack. That is the
     radius below, with a little slack, so an archipelago is a filled water
     rather than a ring with an empty middle. */
  const SPACING_NM = 1.05;
  const archScaleNm = n => n <= 1 ? 0 : 0.58 * SPACING_NM * Math.sqrt(n) + 0.30;
  for (let ci = 0; ci < communities.length; ci++) {
    const C = communities[ci];
    const members = C.members.slice().sort();
    const hub = C.hub;
    const n = members.length;
    const R = archScaleNm(n) / world.nmPerUnit;
    const minS = 0.95 / world.nmPerUnit;    // a mile, near enough, between neighbours
    const rnd = rngFor('arch:' + ci);
    /* a sunflower spiral fills a disc evenly; the hub holds the centre */
    const rest = members.filter(m => m !== hub);
    const local = [{ x: 0, y: 0, pin: true, slug: hub }];
    rest.forEach((m, k) => {
      const t = (k + 0.62) / rest.length;
      const r = R * Math.sqrt(t);
      const a = k * 2.399963 + rnd() * 0.30;
      local.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, pin: false, slug: m });
    });
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
      isle.pos.x = pos[ci].x + L.x;
      isle.pos.y = pos[ci].y + L.y;
      rmax = Math.max(rmax, Math.hypot(L.x, L.y));
    }
    world.archipelagos.push({
      i: ci, hub, size: n, purity: C.purity, dominant: C.dominant,
      name: (content.pages[hub] || {}).title || hub,
      x: pos[ci].x, y: pos[ci].y, r: rmax, members
    });
  }

  /* --- the pages no community holds --- */
  const orphans = isles.filter(i => i.comm < 0);
  /* the sheet is wider than it is tall, so the islands off soundings ride an
     ellipse just outside the archipelagos rather than a circle that would
     stretch the chart into empty water */
  const rimX = Math.max(...world.positions.map(p => Math.abs(p.x))) * 1.08;
  const rimY = Math.max(...world.positions.map(p => Math.abs(p.y))) * 1.10;
  let oi = 0;
  for (const isle of orphans) {
    const nb = nbrs.get(isle.slug);
    const tally = new Map();
    if (nb) for (const [o, w] of nb) {
      const c = of[o];
      if (c != null) tally.set(c, (tally.get(c) || 0) + w);
    }
    if (tally.size) {
      /* it keeps company with the archipelago its citations point into: laid
         just outside that group's rim, on the bearing of its strongest tie */
      let best = -1, bw = -1;
      for (const [c, w] of tally) if (w > bw) { bw = w; best = c; }
      const A = world.archipelagos[best];
      const rnd = rngFor('orphan:' + isle.slug);
      const a = rnd() * TAU;
      const r = A.r + (0.9 + rnd() * 0.5) / world.nmPerUnit;
      isle.pos.x = A.x + Math.cos(a) * r;
      isle.pos.y = A.y + Math.sin(a) * r;
      isle.nearComm = best;
    } else {
      /* nothing cites it and it cites nothing: it lies off soundings, and only
         a visitor can ever reach it */
      const a = (oi * 2.399963 + 0.6) % TAU;
      const k = 1 + (oi % 3) * 0.03;
      isle.pos.x = Math.cos(a) * rimX * k;
      isle.pos.y = Math.sin(a) * rimY * k;
      isle.offSoundings = true;
      oi++;
    }
  }

  /* --- no two islands on the same water: a separation pass, hubs pinned --- */
  const minSep = 0.95 / world.nmPerUnit;
  const pinned = new Set(world.archipelagos.map(a => a.hub));
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
const lens = { raised: false, t: 0 };
const story = { leadsman1: false, leadsman2: false, started: false, raised: false, lastDist: null, minDist: null };

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
  const brg = norm360(Math.atan2(target.pos.x - ship.x, target.pos.y - ship.y) * 180 / Math.PI);
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
  return norm360(Math.atan2(isle.pos.x - ship.x, isle.pos.y - ship.y) * 180 / Math.PI);
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
    if (d2 < clear2 && I !== ship.bound && !REDUCED) {
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
    const az = angDiff(norm360(Math.atan2(dx, dy) * 180 / Math.PI), hb);
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
  const deg = norm360(Math.atan2(w.x, w.y) * 180 / Math.PI);
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
  const hx = Math.sin(hb), hy = Math.cos(hb);
  const wm = Math.hypot(wind.x, wind.y) || 1;
  const cosA = (hx * wind.x + hy * wind.y) / wm;
  const polar = 0.42 + 0.58 * Math.pow((cosA + 1) / 2, 1.35);
  const windFactor = 0.75 + 0.25 * (wind.kn / 16);
  let targetKn = ship.anchored ? 0 : sailBase(ship.sail) * polar * windFactor;
  ship.knots += clamp(targetKn - ship.knots, -dt * 2.2, dt * 1.4);
  if (ship.knots < 0.01 && targetKn === 0) ship.knots = 0;

  const eff = effectiveOrder(t);
  if (REDUCED) {
    ship.bearing = ship.orderedBearing;
    ship.omega = 0;
  } else {
    const err = angDiff(eff, ship.bearing);
    const speedFrac = clamp(ship.knots / 8.6, 0.12, 1);
    let alpha = clamp(err * 0.55, -6.5, 6.5) - ship.omega * 1.15;
    ship.omega += alpha * dt;
    const om = (2.6 + 7.2 * speedFrac);
    ship.omega = clamp(ship.omega, -om, om);
    ship.bearing = norm360(ship.bearing + ship.omega * dt);
  }

  if (!REDUCED && !ship.anchored) {
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
  if (!ship.anchored && ship.bound && ship.bound !== ship.clearOf) {
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
    caption('Out of Quick Start roads, bound for the Document Service shore.', 4200);
    caption('The wind stands fair, down the citation flow.', 3800);
  }
  if (!story.leadsman1 && dist < 1.35) {
    story.leadsman1 = true;
    caption('The leadsman heaves the lead…', 2400);
    caption('"By the deep, ' + numToWords(isle.words) + '!"', 4600);
  }
  if (!story.leadsman2 && dist < 0.6) {
    story.leadsman2 = true;
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
        if (foamRnd() < 0.05 + knotsFrac * 0.6) respawnFoam(p, knotsFrac);
        else p.life = -foamRnd() * 0.5;
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  diag.bearing = Math.round(ship.bearing * 10) / 10;
  diag.orderedBearing = Math.round(ship.orderedBearing * 10) / 10;
  diag.sailState = ship.sail;
  diag.knots = Math.round(ship.knots * 100) / 100;
  diag.windDeg = Math.round(wind.deg * 10) / 10;
  diag.windKn = Math.round(wind.kn * 10) / 10;
  diag.polarFactor = Math.round(polar * 1000) / 1000;
  diag.distNm = Math.round(dist * 1000) / 1000;
  diag.spyglass = lens.raised;
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
    if (dist < 1.9) drawShoreLights(isle, x, yBase, wpx, s, dist, stage);
  }

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

  const swell = REDUCED ? 0 : 1;
  const roll = swell * (1.35 * Math.sin(t * 0.62) + 0.55 * Math.sin(t * 1.13 + 1.2)) +
    clamp(ship.omega * ship.knots * 0.045, -3.5, 3.5);
  const heave = swell * (5.5 * Math.sin(t * 0.83 + 0.7) + 2.2 * Math.sin(t * 1.31));
  const pitch = swell * (3.2 * Math.sin(t * 0.71 + 2.1)) * (0.6 + knotsFrac * 0.6);
  const worldDY = -pitch;

  /* the world (draws its own paper + wash ground) */
  drawWorld(sim, worldDY, null);
  diag.lod = islandStage(sim.dist);

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

  /* wind streaks */
  if (!REDUCED) {
    const wind = sim.wind;
    const hb = ship.bearing * Math.PI / 180;
    const rx = Math.cos(hb), ry = -Math.sin(hb);
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
      ctx.globalAlpha = a * (0.78 + 0.22 * knotsFrac);
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
  const rx = Math.cos(hb), ry = -Math.sin(hb);
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
  const cx = W / 2 + (REDUCED ? 0 : Math.sin(t * 1.7) * 4 + Math.sin(t * 3.1) * 2);
  const cy = 330 + (REDUCED ? 0 : Math.cos(t * 1.3) * 3);

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
  const MAG = 2.6;
  const oy0 = HORIZON + worldDY + 8;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R - 7, 0, TAU);
  ctx.clip();
  ctx.translate(cx, cy);
  ctx.scale(MAG, MAG);
  ctx.translate(-cx, -oy0);
  drawWorld(sim, worldDY, {
    stageBoost: 1, maxBand: 3, fine: true,
    map: { k: MAG, ox: cx * (1 - MAG), oy: cy - MAG * oy0, x0: cx - R - 2, x1: cx + R + 2 }
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
    const c = wheelCenter();
    const dx = e.clientX - c.x, dy = e.clientY - c.y;
    const rr = Math.hypot(dx, dy) / c.scale;
    if (rr < 260) {
      dragging = true;
      ship.wheelHeld = true;
      lastAng = Math.atan2(dy, dx);
      el.classList.add('turning');
      el.setPointerCapture(e.pointerId);
    }
  });
  el.addEventListener('pointermove', e => {
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
    if (ui.mode === 'below' && e.key >= '1' && e.key <= '5') {
      showTab(['chart', 'index', 'log', 'register', 'colophon'][+e.key - 1]);
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
      const b = ship.bound;
      if (b && distToNm(b) < 0.6) dropAnchor(b);
      else captionNow('Too far off to let go. Bring her inside half a mile of the shore.', 3200);
      e.preventDefault(); return;
    }
    if (e.repeat) { keys[e.key] = true; return; }
    keys[e.key] = true;
    if (e.key === 't' || e.key === 'T') setSail('travel');
    else if (e.key === 'f' || e.key === 'F') setSail('full');
    else if (e.key === 'h' || e.key === 'H') setSail('half');
    else if (e.key === 'r' || e.key === 'R') setSail('rest');
    else if (e.key === 'd' || e.key === 'D') {
      env.hourTarget = env.hourTarget > 0.5 ? 0 : 1;
      captionNow(env.hourTarget > 0.5 ? 'The dog watch. Dusk falls on Document Service waters.'
        : 'The afternoon watch returns.');
      dirty = true;
    }
    else if (e.key === ' ') { lens.raised = true; e.preventDefault(); dirty = true; }
  });
  window.addEventListener('keyup', e => {
    if (typing(e)) return;
    keys[e.key] = false;
    if (e.key === ' ') { lens.raised = false; dirty = true; }
  });

  setInterval(() => {
    if (ui.mode !== 'deck') return;
    if (keys.ArrowLeft) {
      ship.wheelAngle = clamp(ship.wheelAngle - 3.4, -170, 170);
      giveOrder(-1.05);
    }
    if (keys.ArrowRight) {
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

  if (ui.mode !== 'deck') {
    /* reading never competes with the sea: the plate stops, the sim holds */
    diag.samples.length && diag.samples.splice(0, diag.samples.length);
    sound.step(dt, false);
    requestAnimationFrame(frame);
    return;
  }

  const sim = update(dt);
  render(sim);
  updateLandfallPlate(sim);
  trackTick(dt, sim);
  sound.tune(sim.wind.kn, sim.knotsFrac);
  sound.step(dt, !ship.anchored && ship.knots > 0.4);
  requestAnimationFrame(frame);
}

/* the track the visitor has actually sailed, inked on the chart */
let trackAcc = 0;
function trackTick(dt, sim) {
  trackAcc += dt;
  if (trackAcc < 1.2) return;
  trackAcc = 0;
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
    render(sim);
    updateLandfallPlate(sim);
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
  weigh() { weighAnchor(); },
  below(tab) { openBelow(tab || 'chart'); },
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
  clearVisit() { try { for (const k of ['log','charted','raised','hand','lamps','islets','watches','hours'])
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
  save() {
    store.set('log', this.log.slice(-400));
    store.set('charted', [...this.charted]);
    store.set('raised', [...this.raised]);
    store.set('hand', this.hand);
    store.set('lamps', [...this.lamps]);
    store.set('islets', [...this.islets]);
    store.set('watches', [...this.watches]);
    store.set('hours', this.hours);
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
    case 'ul': return '<ul>' + (b.items || []).map(i => '<li>' + i + '</li>').join('') + '</ul>';
    case 'ol': return '<ol' + (b.start && b.start !== 1 ? ' start="' + b.start + '"' : '') + '>' +
      (b.items || []).map(i => '<li>' + i + '</li>').join('') + '</ol>';
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
  const arch = isle.comm >= 0 ? world.archipelagos[isle.comm] : null;
  let out = '';

  out += '<div class="ss-block"><h4>The sounding</h4><dl>' +
    '<dt>Fathoms</dt><dd>' + commas(isle.words) + ' words</dd>' +
    '<dt>Headlands &amp; knolls</dt><dd>' + isle.nH2 + ' h2, ' + isle.nH3 + ' h3</dd>' +
    '<dt>Reef hatching</dt><dd>' + isle.code + (isle.code === 1 ? ' code block' : ' code blocks') + '</dd>' +
    '<dt>Riding lights</dt><dd>' + (isle.inbound
      ? isle.inbound + (isle.inbound === 1 ? ' page cites her' : ' pages cite her')
      : '<b>none: a dark shore</b>') + '</dd>' +
    '<dt>She cites</dt><dd>' + isle.outbound + (isle.outbound === 1 ? ' page' : ' pages') + '</dd>' +
    (arch ? '<dt>Archipelago</dt><dd>' + esc(arch.name) + ' &middot; ' + arch.size + ' islands</dd>'
          : '<dt>Archipelago</dt><dd>none: she lies off soundings</dd>') +
    '</dl></div>';

  out += '<div class="ss-block"><h4>The hands that keep her</h4><dl>' +
    '<dt>Keepers</dt><dd>' + (isle.authors.length ? isle.authors.map(esc).join(', ') : 'no hand recorded') + '</dd>' +
    '<dt>Watch entries</dt><dd>' + isle.commits + (isle.commits === 1 ? ' commit' : ' commits') +
      (isle.night ? ', ' + isle.night + ' by lantern' : '') + '</dd>' +
    '<dt>First and last</dt><dd>' + esc(isle.first) + ' &rarr; ' + esc(isle.last) + '</dd>' +
    '<dt>Days of care</dt><dd>' + isle.careDays + ' &middot; ' + ageOfInk(isle) + '</dd>' +
    '</dl></div>';

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
function openPage(isle, how) {
  if (!isle) return;
  landfallStart = performance.now();
  ui.slug = isle.slug;
  ui.mode = 'anchor';
  const page = world.content.pages[isle.slug];
  const arch = isle.comm >= 0 ? world.archipelagos[isle.comm] : null;

  $('below').hidden = true;
  const a = $('anchorage');
  a.querySelector('.ah-kicker').textContent =
    (isle.product === 'cloud' ? 'The Cloud sea' : 'The CMS ocean') + ' · ' +
    (isle.section || 'off soundings') + (arch ? ' · ' + arch.name + ' archipelago' : '');
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
}

function dropAnchor(isle) {
  if (!isle) return;
  ship.anchored = true;
  ship.sail = 'rest';
  ship.knots = 0;
  ship.atAnchorOff = isle;
  logCrossing(isle);
  captionNow('The anchor bites off ' + isle.title + '.', 3000);
  openPage(isle, 'sailed');
}

function weighAnchor() {
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
  const cosA = (Math.sin(hb) * wind.x + Math.cos(hb) * wind.y) / (Math.hypot(wind.x, wind.y) || 1);
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
    courses: why === 'citation' ? 'followed a citation' : 'carried by the packet',
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
  if (!visit.log.length) {
    h += '<p class="bnote">Nothing entered yet. The first crossing writes the first line.</p>';
  } else {
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
          esc(r.title) + '</span></td>' +
          '<td>' + esc(r.winds) + '</td>' +
          '<td class="rem"><textarea class="remark" rows="1" data-i="' + i +
          '" placeholder="in your own hand">' + esc(r.remark || '') + '</textarea></td></tr>';
      }
    });
    h += '</tbody></table>';
  }
  h += '</div>';
  p.innerHTML = h;

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
    world.islands.length + ' pages, grouped into ' + world.archipelagos.length +
    ' archipelagos by the communities its own citation graph falls into, and placed so that pages ' +
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
    'browser and nowhere else.</p>' +
    '<p>The romance this design borrows is the age of sail\'s instruments: the chart, the lead line, ' +
    'the glass, the log book. It borrows none of that era\'s economy, because there is nothing here to ' +
    'take: the islands are pages, nobody lives on them, nobody is displaced, and reading one leaves it ' +
    'exactly as it was for the next ship. The real age of sail also contained slavery, plunder and ' +
    'conquest. This chart does not stage them, and does not pretend they were not there.</p>' +
    '<p class="cred">Data: <code>content.json</code>, <code>graph.json</code>, <code>communities.json</code>, ' +
    '<code>provenance.json</code> and <code>register.json</code>, the last derived by ' +
    '<code>derive-register.js</code> from the repository\'s raw commit log. ' +
    'Deterministic seed ' + SEED + '. No third-party libraries. ' +
    'Sound: see <code>audio/CREDITS.txt</code>.</p>' +
    '</div></div>';
}

/* ============================================================
   THE CHART: the same sea, seen from above, complete from minute one
   ============================================================ */
const chart = { cv: null, g: null, W: 1180, H: 740, k: 1, ox: 0, oy: 0, hover: null, marks: [] };

function chartProject(x, y) { return [chart.ox + x * chart.k, chart.oy + y * chart.k]; }

function drawChart() {
  const cv = $('chart');
  if (!chart.cv) {
    chart.cv = cv;
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
    cv.width = Math.round(chart.W * dpr);
    cv.height = Math.round(chart.H * dpr);
    cv.style.width = chart.W + 'px';
    cv.style.height = chart.H + 'px';
    chart.g = cv.getContext('2d');
    chart.dpr = dpr;
  }
  const g = chart.g, dpr = chart.dpr;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);

  const B = world.bounds, pad = 46;
  const sx = (chart.W - pad * 2) / (B.maxx - B.minx);
  const sy = (chart.H - pad * 2) / (B.maxy - B.miny);
  chart.k = Math.min(sx, sy);
  chart.ox = pad + (chart.W - pad * 2 - (B.maxx - B.minx) * chart.k) / 2 - B.minx * chart.k;
  chart.oy = pad + (chart.H - pad * 2 - (B.maxy - B.miny) * chart.k) / 2 - B.miny * chart.k;

  g.fillStyle = PAPER;
  g.fillRect(0, 0, chart.W, chart.H);
  if (bake.paper) { g.globalAlpha = 0.9; g.drawImage(bake.paper, 0, 0, chart.W, chart.H); g.globalAlpha = 1; }

  /* the rhumb network: every citation, in the portolan wind colours.
     Black for the eight principal winds, green for the half-winds, red for the
     quarter-winds, taken from each line's own true bearing. */
  const cols = ['rgba(38,28,17,0.42)', 'rgba(46,80,38,0.42)', 'rgba(141,47,34,0.36)'];
  const paths = [[], [], []];
  for (const [a, b] of world.graph.edges) {
    const A = world.bySlug.get(a), Bo = world.bySlug.get(b);
    if (!A || !Bo) continue;
    const deg = Math.atan2(Bo.pos.x - A.pos.x, Bo.pos.y - A.pos.y) * 180 / Math.PI;
    paths[pointClass(deg)].push([A, Bo]);
  }
  g.lineWidth = 0.65;
  for (let c = 0; c < 3; c++) {
    g.strokeStyle = cols[c];
    g.beginPath();
    for (const [A, Bo] of paths[c]) {
      const p = chartProject(A.pos.x, A.pos.y), q = chartProject(Bo.pos.x, Bo.pos.y);
      g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]);
    }
    g.stroke();
  }

  /* the track this visit has actually sailed */
  if (visit.track.length > 1) {
    g.strokeStyle = 'rgba(141,47,34,0.75)';
    g.lineWidth = 1.5;
    g.setLineDash([5, 3]);
    g.beginPath();
    let started = false;
    for (const t of visit.track) {
      const p = chartProject(t.x, t.y);
      if (!started) { g.moveTo(p[0], p[1]); started = true; } else g.lineTo(p[0], p[1]);
    }
    g.stroke();
    g.setLineDash([]);
  }

  /* the islands: a small derived coast apiece, inked where they are charted */
  chart.marks.length = 0;
  for (const I of world.islands) {
    const p = chartProject(I.pos.x, I.pos.y);
    const r = 2.9 + 4.6 * (I.mag - 0.44) / 1.41;
    chart.marks.push({ isle: I, x: p[0], y: p[1], r });
    const charted = visit.charted.has(I.slug);
    const F = formOf(I);
    /* a miniature of her own coast, not a dot: the same elevation field, ten steps */
    g.beginPath();
    const n = 12;
    for (let s = 0; s <= n; s++) {
      const t = s / n;
      const x = F.x0 + t * (F.x1 - F.x0);
      const e = F.elev(x) / 120;
      const ang = -Math.PI + t * TAU;
      const rr = r * (0.62 + 0.9 * e);
      const px = p[0] + Math.cos(ang) * rr * 1.25, py = p[1] + Math.sin(ang) * rr * 0.8;
      if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath();
    if (charted) { g.fillStyle = 'rgba(40,29,17,0.86)'; g.fill(); }
    else {
      g.fillStyle = I.inbound === 0 ? 'rgba(241,231,208,0.85)' : 'rgba(233,221,194,0.75)';
      g.fill();
      g.strokeStyle = I.inbound === 0 ? 'rgba(141,47,34,0.85)' : 'rgba(52,39,24,0.78)';
      g.lineWidth = 1.05;
      g.stroke();
    }
  }

  /* archipelago rings */
  g.strokeStyle = 'rgba(70,53,35,0.32)';
  g.lineWidth = 0.9;
  g.setLineDash([2.5, 5]);
  for (const A of world.archipelagos) {
    const p = chartProject(A.x, A.y);
    g.beginPath();
    g.arc(p[0], p[1], Math.max(6, A.r * chart.k * 1.16), 0, TAU);
    g.stroke();
  }
  g.setLineDash([]);

  /* one compass rose, red and gold, at the centre of the sheet */
  drawRose(g, chart.W - 92, 92, 46);

  /* the ship */
  const sp = chartProject(ship.x, ship.y);
  g.save();
  g.translate(sp[0], sp[1]);
  g.rotate(ship.bearing * Math.PI / 180);
  g.fillStyle = 'rgba(141,47,34,0.95)';
  g.beginPath();
  g.moveTo(0, -9); g.lineTo(5, 7); g.lineTo(0, 4); g.lineTo(-5, 7);
  g.closePath(); g.fill();
  g.restore();
  chart.ready = true;

  /* the archipelago names, set as DOM so they stay crisp */
  const lab = $('chartlabels');
  const rect = cv.getBoundingClientRect();
  const host = lab.parentElement.getBoundingClientRect();
  const dx = rect.left - host.left, dy = rect.top - host.top;
  /* the biggest archipelago gets its name first, and a name that would print
     across one already set is left off rather than overprinted */
  const placed = [];
  const html = [];
  for (const A of world.archipelagos.slice().sort((a, b) => b.size - a.size)) {
    const p = chartProject(A.x, A.y);
    const y = p[1] - Math.max(10, A.r * chart.k * 1.16) - 10;
    const w = A.name.length * 7.6 + 10, h = 15;
    const box = { x0: p[0] - w / 2, x1: p[0] + w / 2, y0: y - h / 2, y1: y + h / 2 };
    if (placed.some(q => box.x0 < q.x1 && box.x1 > q.x0 && box.y0 < q.y1 && box.y1 > q.y0)) continue;
    placed.push(box);
    html.push('<div class="al" style="left:' + (dx + p[0]) + 'px;top:' + (dy + y) + 'px">' +
      esc(A.name) + '</div>');
  }
  lab.innerHTML = html.join('');
  showChartInfo(chart.hover);

  $('chartkey').innerHTML =
    '<b>' + world.islands.length + ' islands</b> &middot; ' + world.archipelagos.length + ' archipelagos<br>' +
    '<b>' + commas(world.graph.edges.length) + ' rhumb lines</b>, one per citation<br>' +
    'black principal winds &middot; <span style="color:#38562f">green half</span> &middot; ' +
    '<span style="color:#8d2f22">red quarter</span><br>' +
    'filled = charted this visit (' + visit.charted.size + ')<br>' +
    '<span style="color:#8d2f22">outlined red</span> = dark shore, nothing cites her (' + world.uncited.length + ')';
}

function drawRose(g, cx, cy, R) {
  g.save();
  g.translate(cx, cy);
  g.strokeStyle = 'rgba(70,53,35,0.55)';
  g.lineWidth = 0.7;
  g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke();
  g.beginPath(); g.arc(0, 0, R * 0.72, 0, TAU); g.stroke();
  for (let i = 0; i < 32; i++) {
    const a = i * TAU / 32 - Math.PI / 2;
    const cls = i % 4 === 0 ? 0 : (i % 4 === 2 ? 1 : 2);
    const len = cls === 0 ? R : cls === 1 ? R * 0.86 : R * 0.78;
    g.strokeStyle = cls === 0 ? 'rgba(38,28,17,0.8)' : cls === 1 ? 'rgba(56,86,47,0.7)' : 'rgba(141,47,34,0.6)';
    g.lineWidth = cls === 0 ? 1.1 : 0.7;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(Math.cos(a) * len, Math.sin(a) * len);
    g.stroke();
  }
  /* the fleur at north, in the period manner: two gold petals over a red point */
  g.fillStyle = 'rgba(176,132,44,0.9)';
  g.beginPath(); g.moveTo(0, -R * 1.16); g.lineTo(4.5, -R * 0.7); g.lineTo(-4.5, -R * 0.7); g.closePath(); g.fill();
  g.fillStyle = 'rgba(141,47,34,0.9)';
  g.beginPath(); g.arc(0, 0, 2.6, 0, TAU); g.fill();
  g.restore();
}

function chartPick(evx, evy) {
  const r = chart.cv.getBoundingClientRect();
  const x = (evx - r.left) * chart.W / r.width, y = (evy - r.top) * chart.H / r.height;
  let best = null, bd = 15 * 15;
  for (const m of chart.marks) {
    const d = (m.x - x) * (m.x - x) + (m.y - y) * (m.y - y);
    if (d < bd) { bd = d; best = m; }
  }
  return best;
}
function showChartInfo(isle) {
  const box = $('chartinfo');
  if (!isle) {
    box.querySelector('.ci-name').textContent = 'The surveyed sea';
    box.querySelector('.ci-line').textContent =
      world.islands.length + ' pages, ' + commas(world.graph.edges.length) + ' citations, ' +
      Math.round(world.extentNm) + ' nautical miles across. Nothing here is hidden.';
    box.querySelector('.ci-act').textContent = 'Hover an island. Click to shape a course, double-click to be carried there.';
    return;
  }
  const arch = isle.comm >= 0 ? world.archipelagos[isle.comm] : null;
  box.querySelector('.ci-name').textContent = isle.title;
  box.querySelector('.ci-line').textContent =
    commas(isle.words) + ' words · ' + isle.nH2 + ' headlands · ' +
    (isle.inbound ? isle.inbound + (isle.inbound === 1 ? ' riding light' : ' riding lights') : 'a dark shore') + ' · ' +
    (arch ? arch.name + ' archipelago' : 'off soundings') + ' · ' +
    (isle.authors.length === 1 ? 'kept alone by ' + isle.authors[0] : isle.authors.length + ' hands');
  box.querySelector('.ci-act').textContent =
    (visit.charted.has(isle.slug) ? 'Charted. ' : '') + 'Click to shape a course · double-click to be carried there.';
}

/* ============================================================
   BELOW DECK
   ============================================================ */
function openBelow(tab) {
  ui.mode = 'below';
  ui.tab = tab || ui.tab || 'chart';
  $('anchorage').hidden = true;
  $('below').hidden = false;
  showTab(ui.tab);
  const s = $('search');
  if (s) { s.focus(); s.select(); }
  dirty = true;
}
function closeBelow() {
  $('below').hidden = true;
  $('searchdrop').hidden = true;
  if (ui.slug) { ui.mode = 'anchor'; $('anchorage').hidden = false; }
  else { ui.mode = 'deck'; }
  dirty = true;
}
function showTab(tab) {
  ui.tab = tab;
  for (const b of $('belowtabs').children) b.classList.toggle('on', b.dataset.tab === tab);
  for (const name of ['chart', 'index', 'log', 'register', 'colophon']) {
    $('pane-' + name).hidden = name !== tab;
  }
  if (tab === 'chart') drawChart();
  else if (tab === 'index') renderIndex();
  else if (tab === 'log') renderLog();
  else if (tab === 'register') renderRegister();
  else if (tab === 'colophon') renderColophon();
}

function initUI() {
  /* --- the anchorage --- */
  $('weigh').addEventListener('click', weighAnchor);
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
        warpTo(href.slice(1), 'citation');
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
  });
  $('searchdrop').addEventListener('click', e => {
    const b = e.target.closest('.sr');
    if (b) { $('searchdrop').hidden = true; warpTo(b.dataset.slug, 'packet'); }
  });

  $('pane-index').addEventListener('click', e => {
    const b = e.target.closest('.idxrow');
    if (b) warpTo(b.dataset.slug, 'packet');
  });

  const cv = $('chart');
  cv.addEventListener('mousemove', e => {
    const m = chartPick(e.clientX, e.clientY);
    const isle = m ? m.isle : null;
    if (isle !== chart.hover) { chart.hover = isle; showChartInfo(isle); }
  });
  cv.addEventListener('mouseleave', () => { chart.hover = null; showChartInfo(null); });
  cv.addEventListener('click', e => {
    const m = chartPick(e.clientX, e.clientY);
    if (!m) return;
    if (e.detail > 1) return;   // the dblclick handler takes it
    setTimeout(() => {
      if (chart.dbl) { chart.dbl = false; return; }
      shapeCourse(m.isle);
    }, 210);
  });
  cv.addEventListener('dblclick', e => {
    const m = chartPick(e.clientX, e.clientY);
    chart.dbl = true;
    if (m) warpTo(m.isle.slug, 'packet');
  });

  $('soundbtn').addEventListener('click', () => sound.toggle());
  $('soundbtn').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') sound.toggle(); });
}

function shapeCourse(isle) {
  closeBelow();
  if (ui.slug) { $('anchorage').hidden = true; ui.slug = null; }
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

/* the landfall plate on deck: crisp DOM, never painted into the canvas */
function updateLandfallPlate(sim) {
  const el = $('landfall');
  const isle = ship.bound;
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
  ctx: null, master: null, bed: null, woke: false,
  voices: [], buffers: [], credits: null,
  singing: [], nextJoin: 0, joinEvery: 12, wantVoices: 0,

  init() {
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
    if (!this.ctx || !this.files || this.decoding || this.buffers.length) return;
    this.decoding = true;
    for (const f of this.files) {
      try {
        const ab = await fetch('audio/' + f.file).then(r => r.arrayBuffer());
        const buf = await this.ctx.decodeAudioData(ab);
        this.buffers.push({ buf, rate: f.rate || 1, gain: f.gain || 1 });
      } catch (e) { /* skip a voice that will not decode */ }
    }
    this.decoding = false;
    diag.voicesLoaded = this.buffers.length;
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
    const windG = c.createGain(); windG.gain.value = 0.16;

    const seaLP = c.createBiquadFilter();
    seaLP.type = 'lowpass'; seaLP.frequency.value = 320;
    const seaG = c.createGain(); seaG.gain.value = 0.5;

    src.connect(windBP); windBP.connect(windG); windG.connect(this.master);
    src.connect(seaLP); seaLP.connect(seaG); seaG.connect(this.master);
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

  /* the wind bed follows the real wind and the sail actually set */
  tune(windKn, knotsFrac) {
    if (!this.ctx || !this.bed) return;
    const t = this.ctx.currentTime;
    this.bed.windG.gain.setTargetAtTime(0.09 + 0.14 * clamp(windKn / 24, 0, 1) + 0.05 * knotsFrac, t, 0.6);
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

  step(dt, sailing) {
    if (!this.ctx || !this.on) return;
    if (!this.buffers.length) return;
    if (!sailing) {
      if (this.singing.length) this.hush(2.2);
      return;
    }
    this.nextJoin -= dt;
    if (this.nextJoin <= 0 && this.singing.length < this.wantVoices) {
      this.nextJoin = this.joinEvery;
      this.joinVoice(this.singing.length);
    }
  },

  joinVoice(n) {
    const c = this.ctx;
    const pick = this.buffers[n % this.buffers.length];
    const src = c.createBufferSource();
    src.buffer = pick.buf;
    src.loop = true;
    /* each voice its own hand: a little off the last one, never in tune with it */
    src.playbackRate.value = pick.rate * (1 + (n === 0 ? 0 : (n % 2 ? 1 : -1) * (0.014 + 0.011 * n)));
    const g = c.createGain();
    g.gain.value = 0;
    g.gain.setTargetAtTime(pick.gain * (n === 0 ? 0.34 : 0.22), c.currentTime, 1.4);
    const pan = c.createStereoPanner ? c.createStereoPanner() : null;
    if (pan) { pan.pan.value = n === 0 ? 0 : ((n % 2 ? 1 : -1) * (0.2 + 0.12 * n)); src.connect(g); g.connect(pan); pan.connect(this.master); }
    else { src.connect(g); g.connect(this.master); }
    /* call and response: every voice after the first comes in off the beat */
    src.start(c.currentTime + (n === 0 ? 0 : 0.4 + 0.22 * n));
    this.singing.push({ src, g });
    diag.voicesSinging = this.singing.length;
  },

  hush(sec) {
    const c = this.ctx;
    for (const v of this.singing) {
      try {
        v.g.gain.setTargetAtTime(0, c.currentTime, (sec || 1.5) / 3);
        v.src.stop(c.currentTime + (sec || 1.5));
      } catch (e) { /* already stopped */ }
    }
    this.singing = [];
    this.nextJoin = 0;
    diag.voicesSinging = 0;
  },

  landfall(isle) {
    this.setHarbour(isle);
    if (!this.ctx || !this.on) return;
    this.hush(3.4);
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

  placeShipAtDistance(parseFloat(params.get('dist')) || 2.7);
  ship.lastFix = { x: ship.x, y: ship.y, t: 0 };
  visit.track.push({ x: ship.x, y: ship.y });
  sound.setHarbour(world.island);
  ship.sail = params.get('sail') || 'full';
  if (params.get('hour') === 'dusk') { env.hourTarget = 1; env.hourMix = 1; }

  document.getElementById('loading').classList.add('hidden');
  const pt = document.getElementById('plate-title');
  const hints = document.getElementById('hints');
  pt.classList.add('shown');
  hints.classList.add('shown');
  setTimeout(() => pt.classList.remove('shown'), 7000);
  setTimeout(() => hints.classList.remove('shown'), 16000);
  if (params.get('open')) { const o = world.bySlug.get(params.get('open')); if (o) warpTo(o.slug, 'packet'); }
  if (params.get('below')) openBelow(params.get('below'));

  if (REDUCED) {
    caption('Becalmed: reduced motion honored. The sea holds its pose; the helm answers instantly.', 6000);
    becalmFrame();
  } else {
    requestAnimationFrame(frame);
  }
  window.__helm.ready = true;
})();
