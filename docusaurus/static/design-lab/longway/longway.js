/* ============================================================
   THE LONG WAY THROUGH
   All 290 pages of the Strapi documentation stitched into one
   continuous dusk trail. Walking right is reading down.
   Vanilla JS + canvas + DOM. Five risograph inks, hard edges.
   Every visible number derives from a real data field.
   ============================================================ */
'use strict';

/* ---------------- inks (the five Dusk Works hexes) ---------------- */
const INKS = {
  aubergine: '#2E1A47',
  violet:    '#4945FF',
  rose:      '#FF4DA0',
  apricot:   '#FFA26B',
  cream:     '#FFF3E0'
};
const INK_DARK = '#1C0F2E'; /* aubergine double-strike */

/* ---------------- tuning ---------------- */
const WORD_PX     = 6;      /* one word of prose = 6px of trail = 1 metre */
const MIN_STRETCH = 520;    /* even a 79-word footbridge is walkable */
const WALK_V      = 340;    /* px/s */
const STRIDE_V    = 980;    /* px/s with Shift */
const GATE_RANGE  = 80;     /* px to stand "at" a gate */
const DOCK_FRAC   = 0.38;

const REDUCED = (typeof matchMedia === 'function') &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- tiny utils ---------------- */
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rngFor(s) { return mulberry32(hashStr(s)); }
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function lerp(a, b, t) { return a + (b - a) * t; }
function hex2rgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function mix(h1, h2, t) { /* flat overprint of two inks — still a hard colour */
  const a = hex2rgb(h1), b = hex2rgb(h2);
  return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;
}
function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
function stripTags(s) { return String(s).replace(/<[^>]*>/g, ' '); }
function countWords(s) {
  const m = stripTags(s).trim().split(/\s+/).filter(Boolean);
  return m.length;
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private window etc. */ } }

/* ---------------- model ---------------- */
const M = {
  pages: [],            /* trail order */
  bySlug: new Map(),
  totalPx: 0,
  totalWords: 0,
  communities: [],
  commOf: new Map(),    /* slug -> community index (or -1) */
  inboundSrc: new Map(),/* target slug -> [source slugs] */
  authorsTotal: 0,
  maxCommits: 1,
  maxCare: 1,
  staged: null,         /* the page where the most ways meet (derived) */
  nightPages: 0,
  lanternsTotal: 0
};

function blockWords(b) {
  if (b == null) return 0;
  if (typeof b === 'string') return countWords(b);
  let w = 0;
  if (b.html) w += countWords(b.html);
  if (b.text) w += countWords(b.text);
  if (b.code) w += b.code.split(/\s+/).filter(Boolean).length;
  if (b.desc) w += countWords(b.desc);
  if (b.description) w += countWords(b.description);
  if (b.summary) w += countWords(b.summary);
  if (b.title && typeof b.title === 'string') w += countWords(b.title);
  if (Array.isArray(b.head)) for (const c of b.head) w += countWords(c);
  if (Array.isArray(b.rows)) for (const r of b.rows) for (const c of r) w += countWords(c);
  if (Array.isArray(b.items)) for (const it of b.items) w += blockWords(it);
  if (Array.isArray(b.blocks)) for (const c of b.blocks) w += blockWords(c);
  if (Array.isArray(b.tabs)) for (const t of b.tabs) { for (const c of (t.blocks || [])) w += blockWords(c); }
  if (Array.isArray(b.cols)) for (const col of b.cols) for (const c of col) w += blockWords(c);
  if (Array.isArray(b.params)) for (const p of b.params) w += countWords(p.desc || '') + 2;
  return w;
}

function buildModel(content, graph, communities, provenance) {
  M.totalWords = Object.values(graph.words).reduce((a, b) => a + b, 0);

  M.communities = communities.map((c, i) => ({ ...c, idx: i }));
  communities.forEach((c, i) => c.members.forEach(m => M.commOf.set(m, i)));

  const authors = new Set();
  for (const v of Object.values(provenance)) {
    (v.authors || []).forEach(a => authors.add(a));
    if (v.commits > M.maxCommits) M.maxCommits = v.commits;
    if (v.careDays > M.maxCare) M.maxCare = v.careDays;
    if (v.night > 0) { M.nightPages++; M.lanternsTotal += v.night; }
  }
  M.authorsTotal = authors.size;

  for (const [src, tgt] of graph.edges) {
    if (!M.inboundSrc.has(tgt)) M.inboundSrc.set(tgt, []);
    M.inboundSrc.get(tgt).push(src);
  }

  let x = 0, cw = 0;
  for (const slug of content.order) {
    const pg = content.pages[slug];
    if (!pg) continue;
    const words = graph.words[slug] || Math.max(30, blockWords({ blocks: pg.blocks }));
    const len = Math.max(MIN_STRETCH, words * WORD_PX);
    const prov = provenance[slug] || { commits: 1, authors: [], topAuthor: '', first: '', last: '', night: 0, careDays: 0 };
    const comm = M.commOf.has(slug) ? M.commOf.get(slug) : -1;

    /* block boundaries: walking distance through a block matches its share of the prose */
    const weights = pg.blocks.map(b => Math.max(10, blockWords(b)));
    const sum = weights.reduce((a, b) => a + b, 0) || 1;
    const fracs = [0];
    let acc = 0;
    for (const w of weights) { acc += w; fracs.push(acc / sum); }

    const cleanTitle = String(pg.title || slug).replace(/\s*[-\u2013|]\s*Strapi\s+(Developer\s+)?Doc(s|umentation).*$/i, '');
    const page = {
      slug, title: cleanTitle, label: pg.sidebarLabel || cleanTitle,
      description: pg.description || '', section: pg.section || '', product: pg.product || '',
      blocks: pg.blocks, fracs,
      words, start: x, len, cumWords: cw,
      comm, prov,
      inCount: (graph.inbound[slug] | 0),
      outCount: (graph.outbound[slug] | 0),
      isHub: false, gates: null /* lazy */
    };
    M.pages.push(page);
    M.bySlug.set(slug, page);
    x += len; cw += words;
  }
  M.totalPx = x;

  for (const c of M.communities) {
    const hp = M.bySlug.get(c.hub);
    if (hp) hp.isHub = true;
  }

  /* the staged signature page = the page the most real paths lead to */
  let best = null;
  for (const p of M.pages) if (!best || p.inCount > best.inCount) best = p;
  M.staged = best;

  /* gates: one per real citation edge, standing at the block that cites it */
  for (const [src, tgt] of graph.edges) {
    const sp = M.bySlug.get(src);
    if (!sp || !M.bySlug.get(tgt)) continue;
    if (!sp.gates) sp.gates = [];
    sp.gates.push({ tgt, x: -1 });
  }
  for (const p of M.pages) {
    if (!p.gates) { p.gates = []; continue; }
    const blobs = p.blocks.map(b => JSON.stringify(b));
    for (const g of p.gates) {
      let bi = -1;
      const needle = '#' + g.tgt + '\\"';
      const needle2 = '#' + g.tgt + '"';
      for (let i = 0; i < blobs.length; i++) {
        if (blobs[i].indexOf(needle) >= 0 || blobs[i].indexOf(needle2) >= 0) { bi = i; break; }
      }
      let frac;
      if (bi >= 0) frac = (p.fracs[bi] + p.fracs[bi + 1]) / 2;
      else frac = 0.12 + 0.76 * (hashStr(p.slug + '>' + g.tgt) % 1000) / 1000;
      g.x = p.start + clamp(frac * p.len, 46, p.len - 46);
    }
    p.gates.sort((a, b) => a.x - b.x);
    for (let i = 1; i < p.gates.length; i++) {
      if (p.gates[i].x - p.gates[i - 1].x < 92) {
        p.gates[i].x = Math.min(p.gates[i - 1].x + 92, p.start + p.len - 40);
      }
    }
  }
}

function pageAt(x) {
  let lo = 0, hi = M.pages.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (M.pages[mid].start <= x) lo = mid; else hi = mid - 1;
  }
  return M.pages[lo];
}
function wordsAt(x) {
  const p = pageAt(clamp(x, 0, M.totalPx - 1));
  return p.cumWords + p.words * clamp((x - p.start) / p.len, 0, 1);
}
function blockIndexAt(page, x) {
  const f = clamp((x - page.start) / page.len, 0, 0.99999);
  const fr = page.fracs;
  let lo = 0, hi = fr.length - 2;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (fr[mid] <= f) lo = mid; else hi = mid - 1;
  }
  return lo;
}

/* ---------------- biome palettes ---------------- */
const NIGHT_PAL = {
  bands: [
    { c: '#0D0718', h: 0.52 },
    { c: mix('#0D0718', INKS.aubergine, 0.5), h: 0.30 },
    { c: mix(INKS.aubergine, INKS.violet, 0.16), h: 0.18 }
  ],
  sun: { fx: 0.71, fy: 0.30, rr: 21, c: INKS.cream, ring: INKS.violet },
  ridgeFar: mix('#0D0718', INKS.aubergine, 0.75),
  ridgeMid: mix('#0D0718', INKS.aubergine, 0.42),
  ridgeNear: '#0D0718',
  ground: mix('#0A0512', INKS.aubergine, 0.30),
  path: 'rgba(255,243,224,0.30)',
  ink: '#060310',
  accent: INKS.apricot,
  night: true
};

const palCache = new Map();
function paletteFor(ci, isNight) {
  if (isNight) return NIGHT_PAL;
  const key = ci;
  if (palCache.has(key)) return palCache.get(key);
  const r = rngFor('biome:' + ci);
  const dom = ci < 0 ? 1 : (ci % 3); /* 0 violet-deep, 1 rose-hot, 2 apricot-late */
  const V = INKS.violet, R = INKS.rose, A = INKS.apricot, C = INKS.cream, B = INKS.aubergine;
  let bands;
  if (dom === 0) {
    bands = [
      { c: mix(B, V, 0.55 + r() * 0.2), h: 0.30 + r() * 0.08 },
      { c: V, h: 0.22 + r() * 0.08 },
      { c: mix(V, R, 0.55), h: 0.16 },
      { c: R, h: 0.14 },
      { c: mix(R, A, 0.6), h: 0.10 },
      { c: mix(A, C, 0.25), h: 0.08 }
    ];
  } else if (dom === 1) {
    bands = [
      { c: mix(V, B, 0.35 + r() * 0.15), h: 0.24 + r() * 0.06 },
      { c: mix(V, R, 0.45), h: 0.18 },
      { c: R, h: 0.22 + r() * 0.08 },
      { c: mix(R, A, 0.5), h: 0.16 },
      { c: A, h: 0.12 },
      { c: mix(A, C, 0.35), h: 0.08 }
    ];
  } else {
    bands = [
      { c: mix(V, B, 0.2), h: 0.20 },
      { c: mix(V, R, 0.35), h: 0.16 },
      { c: mix(R, A, 0.35), h: 0.18 },
      { c: A, h: 0.24 + r() * 0.06 },
      { c: mix(A, C, 0.4), h: 0.14 },
      { c: mix(C, A, 0.25), h: 0.08 }
    ];
  }
  const pal = {
    bands,
    sun: {
      fx: 0.18 + r() * 0.64,
      fy: 0.30 + r() * 0.42,
      rr: 26 + r() * 26,
      c: dom === 2 ? A : R,
      ring: dom === 2 ? R : A
    },
    ridgeFar: dom === 2 ? mix(B, A, 0.40) : mix(B, dom === 0 ? V : R, 0.52),
    ridgeMid: mix(B, dom === 0 ? V : R, 0.26),
    ridgeNear: mix(B, INK_DARK, 0.45),
    ground: dom === 1 ? mix(B, R, 0.34) : (dom === 2 ? mix(B, A, 0.32) : mix(B, V, 0.30)),
    path: 'rgba(255,243,224,0.55)',
    ink: INK_DARK,
    accent: [R, A, V][dom],
    night: false
  };
  palCache.set(key, pal);
  return pal;
}

/* ---------------- terrain (chunked per page, LRU) ---------------- */
const FLORA_TYPES = ['pine', 'cypress', 'bush', 'grass', 'reed', 'boulder', 'palm'];
const terrainCache = new Map();
function terrainFor(pi) {
  if (terrainCache.has(pi)) { const t = terrainCache.get(pi); terrainCache.delete(pi); terrainCache.set(pi, t); return t; }
  const p = M.pages[pi];
  const r = rngFor('terrain:' + p.slug);
  const comm = p.comm >= 0 ? M.communities[p.comm] : null;
  const density = comm ? clamp(2 + comm.size / 8, 2, 9) : 2.4;      /* flora density = community size */
  const purity = comm ? comm.purity : 0.5;                           /* purity = visual coherence */
  const primary = FLORA_TYPES[(p.comm < 0 ? 3 : p.comm) % FLORA_TYPES.length];
  const secondary = FLORA_TYPES[((p.comm < 0 ? 3 : p.comm) * 3 + 2) % FLORA_TYPES.length];

  const flora = [];
  const n = Math.round(p.len / 1000 * density);
  for (let i = 0; i < n; i++) {
    flora.push({
      x: p.start + r() * p.len,
      type: r() < purity ? primary : secondary,
      s: 0.6 + r() * 0.9,
      flip: r() < 0.5,
      off: r()
    });
  }

  /* upkeep quality from careDays (max derived from the corpus) */
  const q = clamp(p.prov.careDays / M.maxCare, 0, 1);
  const benches = [];
  const nb = Math.max(p.len > 900 ? 1 : 0, Math.floor(p.len / 2400));
  for (let i = 0; i < nb; i++) {
    benches.push({
      x: p.start + p.len * (i + 0.55) / (nb + 0.4) + (r() - 0.5) * 120,
      tilt: (1 - q) * (r() * 0.22 - 0.05),
      broken: q < 0.32 && r() < 0.6,
      q
    });
  }
  const signX = p === M.staged ? p.start + 210 : p.start + 26;
  const sign = { x: signX, tilt: (1 - q) * (r() * 0.16 - 0.04), cracked: q < 0.4, q };

  /* lanterns: one per night commit on this stretch */
  const lanterns = [];
  for (let i = 0; i < (p.prov.night || 0); i++) {
    lanterns.push({ x: p.start + p.len * (i + 1) / ((p.prov.night || 0) + 1) });
  }

  /* the walkers: this stretch's real authors, with the stretch's real dates */
  const walkers = [];
  const auths = p.prov.authors || [];
  for (let i = 0; i < auths.length; i++) {
    const name = auths[i];
    const wr = rngFor('walker:' + p.slug + ':' + name);
    walkers.push({
      name,
      isTop: name === p.prov.topAuthor,
      x0: p.start + p.len * (0.12 + 0.76 * (i + wr()) / Math.max(1, auths.length)),
      speed: 26 + wr() * 30,
      h: 0.86 + wr() * 0.22,
      phase: wr() * 1000,
      dates: (p.prov.first && p.prov.last) ? `${p.prov.first} → ${p.prov.last}` : ''
    });
  }

  /* foreshadowing: warn before night ground */
  const next = M.pages[pi + 1];
  const nightAhead = next && next.prov.night > 0 ? { x: p.start + p.len - 260 } : null;

  const t = { flora, benches, sign, lanterns, walkers, nightAhead, q };
  terrainCache.set(pi, t);
  if (terrainCache.size > 18) terrainCache.delete(terrainCache.keys().next().value);
  return t;
}

/* ---------------- ridgelines: continuous, faceted, seamless ---------------- */
const RIDGE_LAYERS = [
  { f: 0.10, base: 0.545, amp: 0.115, step: 224, ph: 0.7 },
  { f: 0.30, base: 0.645, amp: 0.075, step: 168, ph: 2.3 },
  { f: 0.58, base: 0.755, amp: 0.050, step: 128, ph: 4.1 }
];
function ridgeY(li, gx) {
  const L = RIDGE_LAYERS[li];
  const a = Math.sin(gx * 0.0052 + L.ph) * 0.52 +
    Math.sin(gx * 0.0147 + L.ph * 2.7) * 0.31 +
    Math.sin(gx * 0.0361 + L.ph * 5.1) * 0.17;
  return visH * L.base - (a * 0.5 + 0.5) * visH * L.amp;
}

/* ---------------- canvas & state ---------------- */
const cv = document.getElementById('world');
const cx = cv.getContext('2d');
let W = 0, H = 0, visH = 0, horizonY = 0, groundY = 0, AVX = 0, DPR = 1;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  visH = H * (1 - DOCK_FRAC);
  horizonY = visH * 0.565;
  groundY = visH * 0.855;
  AVX = W * 0.40;
  needsDraw = true;
}
window.addEventListener('resize', resize);

/* grain tile — printed stock, generated once */
let grainPat = null;
function makeGrain() {
  const t = document.createElement('canvas');
  t.width = 224; t.height = 224;
  const g = t.getContext('2d');
  const r = rngFor('grain');
  for (let i = 0; i < 2600; i++) {
    const a = r();
    g.fillStyle = a < 0.5 ? 'rgba(255,243,224,0.5)' : 'rgba(13,7,24,0.55)';
    g.fillRect(r() * 224, r() * 224, 1, 1);
  }
  for (let i = 0; i < 26; i++) {
    g.fillStyle = 'rgba(255,243,224,0.22)';
    g.fillRect(r() * 224, r() * 224, 1 + r() * 4, 1);
  }
  grainPat = cx.createPattern(t, 'repeat');
}

const S = {
  x: 12,               /* avatar world x */
  vx: 0,
  target: null,        /* click-to-walk-to */
  page: null,
  bi: -1,
  t: 0,
  keys: {},
  overlay: null,       /* 'index' | 'gatemap' | 'landing' */
  pal: null, palKey: '',
  front: 0,            /* weather-front wipe progress, 1 = done */
  nearGate: null,
  walkedWords: 0,
  lastWords: 0,
  gm: null             /* pending gate travel */
};
let needsDraw = true;

/* ---------------- diagnostics ---------------- */
window.__diag = { frameMs: 0, avgFrameMs: 0, state: 'boot' };
const frameHist = [];
function noteFrame(ms, state) {
  window.__diag.frameMs = ms;
  frameHist.push(ms);
  if (frameHist.length > 120) frameHist.shift();
  window.__diag.avgFrameMs = frameHist.reduce((a, b) => a + b, 0) / frameHist.length;
  window.__diag.state = state;
}

/* ---------------- drawing helpers ---------------- */
function w2s(x, f) { return (x - S.x) * (f === undefined ? 1 : f) + AVX; }

function drawPoly(pts, color, regOff) {
  if (regOff) { /* registration misprint: accent pass, nudged */
    cx.fillStyle = regOff;
    cx.globalAlpha = 0.4;
    cx.beginPath();
    cx.moveTo(pts[0][0] + 2.5, pts[0][1] + 1.5);
    for (let i = 1; i < pts.length; i++) cx.lineTo(pts[i][0] + 2.5, pts[i][1] + 1.5);
    cx.closePath(); cx.fill();
    cx.globalAlpha = 1;
  }
  cx.fillStyle = color;
  cx.beginPath();
  cx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) cx.lineTo(pts[i][0], pts[i][1]);
  cx.closePath(); cx.fill();
}

function drawFlora(fl, pal) {
  const sx = w2s(fl.x);
  if (sx < -140 || sx > W + 140) return;
  const s = fl.s, gy = groundY + 2, ink = pal.ink, acc = pal.accent;
  switch (fl.type) {
    case 'pine': {
      const h = 92 * s, w = 34 * s;
      drawPoly([[sx, gy - h], [sx - w / 2, gy - h * 0.45], [sx - w * 0.3, gy - h * 0.45], [sx - w * 0.62, gy], [sx + w * 0.62, gy], [sx + w * 0.3, gy - h * 0.45], [sx + w / 2, gy - h * 0.45]], ink, acc);
      break;
    }
    case 'cypress': {
      const h = 110 * s, w = 15 * s;
      drawPoly([[sx, gy - h], [sx - w, gy - h * 0.3], [sx - w * 0.5, gy], [sx + w * 0.5, gy], [sx + w, gy - h * 0.3]], ink, acc);
      break;
    }
    case 'bush': {
      const h = 30 * s, w = 42 * s;
      drawPoly([[sx - w / 2, gy], [sx - w * 0.42, gy - h * 0.7], [sx - w * 0.12, gy - h], [sx + w * 0.22, gy - h * 0.85], [sx + w / 2, gy - h * 0.4], [sx + w * 0.4, gy]], ink, acc);
      break;
    }
    case 'grass': {
      cx.strokeStyle = ink; cx.lineWidth = 1.6;
      for (let i = -1; i <= 1; i++) {
        cx.beginPath();
        cx.moveTo(sx + i * 4 * s, gy);
        cx.lineTo(sx + i * 7 * s, gy - (16 + 8 * Math.abs(i)) * s);
        cx.stroke();
      }
      break;
    }
    case 'reed': {
      cx.strokeStyle = ink; cx.lineWidth = 1.8;
      cx.beginPath(); cx.moveTo(sx, gy); cx.lineTo(sx, gy - 44 * s); cx.stroke();
      cx.fillStyle = ink;
      cx.fillRect(sx - 2.5, gy - 58 * s, 5, 15 * s);
      break;
    }
    case 'boulder': {
      const h = 22 * s, w = 36 * s;
      drawPoly([[sx - w / 2, gy], [sx - w * 0.36, gy - h * 0.8], [sx + w * 0.05, gy - h], [sx + w * 0.44, gy - h * 0.55], [sx + w / 2, gy]], ink, acc);
      break;
    }
    case 'palm': {
      const h = 84 * s;
      cx.strokeStyle = ink; cx.lineWidth = 3.4;
      cx.beginPath(); cx.moveTo(sx, gy); cx.lineTo(sx + 8 * s, gy - h); cx.stroke();
      cx.lineWidth = 2.4;
      for (let i = 0; i < 5; i++) {
        const a = -0.45 - i * 0.5;
        cx.beginPath();
        cx.moveTo(sx + 8 * s, gy - h);
        cx.lineTo(sx + 8 * s + Math.cos(a) * 30 * s, gy - h + Math.sin(a) * 30 * s + 12 * s);
        cx.stroke();
      }
      break;
    }
  }
}

function drawFigure(sx, sy, h, phase, ink, accent, moving) {
  /* flat ink silhouette, hard edges; gait from phase */
  const leg = moving ? Math.sin(phase) * 0.62 : 0.14;
  const arm = moving ? Math.sin(phase + Math.PI) * 0.5 : 0.1;
  const lean = moving ? 1.6 * h : 0;
  if (accent) {
    cx.save(); cx.translate(2.5, 1.5); cx.globalAlpha = 0.45;
    drawFigure(sx, sy, h, phase, accent, null, moving);
    cx.restore(); cx.globalAlpha = 1;
  }
  const hipY = sy - 26 * h;
  const shY = sy - 46 * h;
  cx.fillStyle = ink;
  cx.strokeStyle = ink;
  cx.lineCap = 'round';
  /* legs — the stride */
  cx.lineWidth = 4.6 * h;
  cx.beginPath(); cx.moveTo(sx, hipY); cx.lineTo(sx + Math.sin(leg) * 13 * h, sy); cx.stroke();
  cx.beginPath(); cx.moveTo(sx, hipY); cx.lineTo(sx - Math.sin(leg) * 13 * h, sy); cx.stroke();
  /* torso: shoulders over hips, leaning into the walk */
  drawPoly([
    [sx - 7 * h + lean, shY], [sx + 7 * h + lean, shY],
    [sx + 4.6 * h, hipY + 2 * h], [sx - 4.6 * h, hipY + 2 * h]
  ], ink);
  /* arms */
  cx.lineWidth = 3.2 * h;
  cx.beginPath(); cx.moveTo(sx + lean, shY + 3 * h); cx.lineTo(sx + lean + Math.sin(arm) * 10 * h, hipY + 3 * h); cx.stroke();
  cx.beginPath(); cx.moveTo(sx + lean, shY + 3 * h); cx.lineTo(sx + lean - Math.sin(arm) * 10 * h, hipY + 3 * h); cx.stroke();
  /* neck + head */
  cx.fillRect(sx - 1.9 * h + lean, shY - 5.5 * h, 3.8 * h, 6 * h);
  cx.beginPath(); cx.arc(sx + lean * 1.4, shY - 10.5 * h, 5.8 * h, 0, 7); cx.fill();
  cx.lineCap = 'butt';
}

function label(txt, sx, sy, size, color, align, ls) {
  cx.font = (size || 10) + 'px Georgia, serif';
  cx.textAlign = align || 'center';
  try { cx.letterSpacing = (ls === undefined ? 1.5 : ls) + 'px'; } catch (e) { }
  cx.fillStyle = color || INKS.cream;
  cx.fillText(txt, sx, sy);
  try { cx.letterSpacing = '0px'; } catch (e) { }
}

/* ---------------- scene ---------------- */
function draw(dt) {
  const page = S.page;
  const pal = S.pal;

  /* sky — hard bands, no gradients */
  let y = 0;
  const hsum = pal.bands.reduce((a, b) => a + b.h, 0);
  for (const b of pal.bands) {
    const bh = horizonY * (b.h / hsum);
    cx.fillStyle = b.c;
    cx.fillRect(0, Math.floor(y), W, Math.ceil(bh) + 1);
    y += bh;
  }
  /* sun: flat cream disc, rose ring misregistered — riso sun */
  if (pal.sun) {
    const sxx = W * pal.sun.fx, syy = horizonY * pal.sun.fy;
    cx.fillStyle = pal.sun.ring;
    cx.beginPath(); cx.arc(sxx + 5, syy + 3.5, pal.sun.rr, 0, 7); cx.fill();
    cx.fillStyle = INKS.cream;
    cx.beginPath(); cx.arc(sxx, syy, pal.sun.rr, 0, 7); cx.fill();
    /* hard stepped halo — flat rings, riso overprint */
    cx.fillStyle = INKS.cream;
    cx.globalAlpha = 0.12;
    cx.beginPath(); cx.arc(sxx, syy, pal.sun.rr * 1.55, 0, 7); cx.fill();
    cx.globalAlpha = 0.06;
    cx.beginPath(); cx.arc(sxx, syy, pal.sun.rr * 2.3, 0, 7); cx.fill();
    cx.globalAlpha = 1;
  }
  /* night: seeded stars, printed like grain */
  if (pal.night) {
    cx.fillStyle = INKS.cream;
    const sr = rngFor('stars');
    for (let i = 0; i < 130; i++) {
      const stx = sr() * 2400, sty = sr() * horizonY * 0.92, tw = sr();
      const px = ((stx - S.x * 0.04) % 2400 + 2400) % 2400 * (W / 2400);
      cx.globalAlpha = 0.25 + tw * 0.5;
      cx.fillRect(px, sty, tw > 0.85 ? 2 : 1, tw > 0.85 ? 2 : 1);
    }
    cx.globalAlpha = 1;
  }

  /* ridges, far to near — faceted polylines in layer space, seamless */
  const ridgeCols = [pal.ridgeFar, pal.ridgeMid, pal.ridgeNear];
  for (let li = 0; li < 3; li++) {
    const L = RIDGE_LAYERS[li];
    const g0 = Math.floor((S.x * L.f - AVX - L.step) / L.step) * L.step;
    const g1 = S.x * L.f + (W - AVX) + L.step * 2;
    cx.fillStyle = ridgeCols[li];
    cx.beginPath();
    let started = false;
    for (let gx = g0; gx <= g1; gx += L.step) {
      const sx = gx - S.x * L.f + AVX;
      const sy = ridgeY(li, gx);
      if (!started) { cx.moveTo(sx, sy); started = true; } else cx.lineTo(sx, sy);
    }
    cx.lineTo(W + 60, visH + 40); cx.lineTo(-60, visH + 40);
    cx.closePath(); cx.fill();

    /* horizon landmarks live on the far ridge */
    if (li === 0) drawLandmarks(L, pal);
  }

  /* converging inbound paths (drawn in the air, braiding to the gate) */
  drawConverge(pal);

  /* ground */
  cx.fillStyle = pal.ground;
  cx.fillRect(0, groundY - 6, W, H - groundY + 6);

  /* path wear per visible stretch — commits wore this ground */
  const pi0 = M.pages.indexOf(pageAt(clamp(S.x - AVX - 60, 0, M.totalPx - 1)));
  const pi1 = M.pages.indexOf(pageAt(clamp(S.x + (W - AVX) + 60, 0, M.totalPx - 1)));
  for (let pi = pi0; pi <= pi1; pi++) drawStretch(pi, pal, dt);

  /* avatar — cream backlight rim so the ink reads on dark ground */
  const moving = Math.abs(S.vx) > 1;
  drawFigure(AVX - 2.6, groundY - 1.8, 1, S.x / 26, 'rgba(255,243,224,0.9)', null, moving && !REDUCED);
  drawFigure(AVX, groundY, 1, S.x / 26, pal.ink, pal.accent, moving && !REDUCED);

  /* weather front wipe on biome change */
  if (S.front < 1) {
    const fx = W * S.front;
    cx.fillStyle = INKS.aubergine;
    cx.fillRect(fx, 0, Math.max(60, W * 0.12) * (1 - S.front), visH + 4);
  }

  /* grain overlay — the whole scene is printed on stock */
  if (grainPat) {
    cx.globalAlpha = 0.5;
    cx.fillStyle = grainPat;
    cx.fillRect(0, 0, W, visH + 6);
    cx.globalAlpha = 1;
  }
}

function drawLandmarks(L, pal) {
  const range = (AVX / L.f) + 400;
  for (const c of M.communities) {
    const hp = M.bySlug.get(c.hub);
    if (!hp) continue;
    const wx = hp.start + hp.len / 2;
    if (Math.abs(wx - S.x) > range) continue;
    const sx = (wx - S.x) * L.f + AVX;
    if (sx < -160 || sx > W + 160) continue;
    const baseY = ridgeY(0, wx * L.f) + 3;
    const hgt = Math.min(112, 30 + c.size * 1.35);    /* landmark height = community size */
    const v = c.idx % 5;
    const ink = mix(pal.ridgeFar, INK_DARK, 0.32);
    if (v === 0) { /* watchtower */
      drawPoly([[sx - 7, baseY], [sx - 5, baseY - hgt], [sx + 5, baseY - hgt], [sx + 7, baseY]], ink);
      drawPoly([[sx - 11, baseY - hgt], [sx + 11, baseY - hgt], [sx + 8, baseY - hgt - 12], [sx - 8, baseY - hgt - 12]], ink);
    } else if (v === 1) { /* arch */
      drawPoly([[sx - 14, baseY], [sx - 14, baseY - hgt], [sx - 6, baseY - hgt], [sx - 6, baseY]], ink);
      drawPoly([[sx + 6, baseY], [sx + 6, baseY - hgt], [sx + 14, baseY - hgt], [sx + 14, baseY]], ink);
      drawPoly([[sx - 17, baseY - hgt], [sx + 17, baseY - hgt], [sx + 17, baseY - hgt - 8], [sx - 17, baseY - hgt - 8]], ink);
    } else if (v === 2) { /* spire */
      drawPoly([[sx, baseY - hgt - 16], [sx - 8, baseY], [sx + 8, baseY]], ink);
    } else if (v === 3) { /* twin chimneys */
      drawPoly([[sx - 10, baseY], [sx - 10, baseY - hgt * 0.85], [sx - 3, baseY - hgt * 0.85], [sx - 3, baseY]], ink);
      drawPoly([[sx + 3, baseY], [sx + 3, baseY - hgt], [sx + 10, baseY - hgt], [sx + 10, baseY]], ink);
    } else { /* water tower */
      cx.strokeStyle = ink; cx.lineWidth = 2;
      cx.beginPath(); cx.moveTo(sx - 8, baseY); cx.lineTo(sx - 4, baseY - hgt * 0.7); cx.stroke();
      cx.beginPath(); cx.moveTo(sx + 8, baseY); cx.lineTo(sx + 4, baseY - hgt * 0.7); cx.stroke();
      drawPoly([[sx - 11, baseY - hgt * 0.7], [sx + 11, baseY - hgt * 0.7], [sx + 8, baseY - hgt], [sx - 8, baseY - hgt]], ink);
    }
    if (Math.abs(wx - S.x) < 5200) {
      label(hp.label.toUpperCase().slice(0, 30), sx, baseY - hgt - 22, 9, 'rgba(255,243,224,0.75)');
      label('HUB · ' + c.size + ' PAGES', sx, baseY - hgt - 11, 7.5, 'rgba(255,243,224,0.65)');
    }
  }
}

/* converging citation paths + the staged Migration Pass */
function drawConverge(pal) {
  const idx = M.pages.indexOf(S.page);
  for (let k = 0; k <= 1; k++) {
    const p = M.pages[idx + k];
    if (!p || p.inCount === 0) continue;
    const staged = p === M.staged;
    const approach = staged ? 6400 : 1500;
    const gx = p.start;
    const d = gx - S.x;
    if (d > approach || (!staged && d < -p.len)) continue;
    const sources = M.inboundSrc.get(p.slug) || [];
    const n = staged ? sources.length : Math.min(6, sources.length);
    const prog = clamp(1 - d / approach, 0, 1);
    const vis = staged ? Math.ceil(prog * n) : n;
    const gsx = w2s(gx), gsy = groundY - 4;
    cx.save();
    cx.setLineDash([3, 7]);
    cx.lineWidth = staged ? 1.4 : 1.1;
    for (let i = 0; i < vis; i++) {
      const r = rngFor('cvg:' + p.slug + ':' + i);
      const ax = gx - approach * (0.22 + 0.74 * (i / Math.max(1, n - 1)) * (0.4 + 0.6 * r()));
      const ay = lerp(horizonY * 0.78, groundY - 26, r());
      const sx0 = w2s(ax);
      if (sx0 > W + 200 && gsx > W + 200) continue;
      cx.strokeStyle = staged ? 'rgba(255,243,224,' + (0.30 + 0.25 * r()) + ')' : 'rgba(255,243,224,0.20)';
      cx.beginPath();
      const cxx = w2s(gx - (gx - ax) * 0.32), cyy = lerp(ay, gsy, 0.55);
      cx.moveTo(sx0, ay);
      /* sampled curve so the last stretch can braid */
      const SAMP = 22;
      for (let s = 1; s <= SAMP; s++) {
        const t = s / SAMP;
        const bx = (1 - t) * (1 - t) * sx0 + 2 * (1 - t) * t * cxx + t * t * gsx;
        let by = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * cyy + t * t * gsy;
        if (staged && t > 0.72) by += Math.sin(t * 34 + i * 1.9) * 7 * (1 - t) / 0.28;
        cx.lineTo(bx, by);
      }
      cx.stroke();
      /* the newest paths to slide in carry their source slug */
      if (staged && i >= vis - 3 && prog < 1 && sx0 > -100 && sx0 < W + 100) {
        label(sources[i], sx0, ay - 8, 9, 'rgba(255,243,224,0.85)', 'center', 0.8);
      }
    }
    cx.restore();
    /* the carved gate itself */
    if (staged && Math.abs(gsx) < W + 300) drawCarvedGate(gsx, p, pal, sources.length);
  }
}

function drawCarvedGate(gsx, p, pal, ways) {
  const gy = groundY;
  const hgt = 150, span = 120;
  drawPoly([[gsx - span / 2 - 12, gy], [gsx - span / 2 - 12, gy - hgt], [gsx - span / 2 + 10, gy - hgt], [gsx - span / 2 + 10, gy]], pal.ink, pal.accent);
  drawPoly([[gsx + span / 2 - 10, gy], [gsx + span / 2 - 10, gy - hgt], [gsx + span / 2 + 12, gy - hgt], [gsx + span / 2 + 12, gy]], pal.ink, pal.accent);
  drawPoly([[gsx - span / 2 - 22, gy - hgt], [gsx + span / 2 + 22, gy - hgt], [gsx + span / 2 + 16, gy - hgt - 34], [gsx - span / 2 - 16, gy - hgt - 34]], pal.ink, pal.accent);
  label(ways + ' WAYS MEET HERE', gsx, gy - hgt - 13, 12.5, INKS.cream, 'center', 2.5);
  label(p.label.toUpperCase(), gsx, gy - hgt + 16, 8.5, 'rgba(255,243,224,0.8)', 'center', 1.5);
}

function drawStretch(pi, basePal, dt) {
  const p = M.pages[pi];
  const pal = paletteFor(p.comm, p.prov.night > 0);
  const T = terrainFor(pi);
  const x0 = Math.max(p.start, S.x - AVX - 40);
  const x1 = Math.min(p.start + p.len, S.x + (W - AVX) + 40);
  if (x1 <= x0) return;
  const s0 = w2s(x0), s1 = w2s(x1);

  /* night hollow: the sky above this stretch truly darkens */
  if (pal.night && !basePal.night) {
    cx.fillStyle = 'rgba(10,5,18,0.84)';
    cx.fillRect(s0, 0, s1 - s0, H);
  }

  /* path wear from commits (log scale against the most-worn page) */
  const wear = Math.log(1 + p.prov.commits) / Math.log(1 + M.maxCommits);
  const py = groundY + 9;
  cx.save();
  cx.strokeStyle = basePal.night || pal.night ? 'rgba(255,243,224,0.30)' : 'rgba(255,243,224,0.52)';
  if (wear > 0.82) {
    /* stone slabs — trodden to pavement */
    cx.fillStyle = 'rgba(255,243,224,0.30)';
    for (let x = Math.ceil(x0 / 46) * 46; x < x1; x += 46) {
      cx.fillRect(w2s(x), py - 2, 34, 5);
    }
  } else if (wear > 0.62) {
    cx.lineWidth = 2.4;
    cx.beginPath(); cx.moveTo(s0, py - 2); cx.lineTo(s1, py - 2); cx.stroke();
    cx.beginPath(); cx.moveTo(s0, py + 3); cx.lineTo(s1, py + 3); cx.stroke();
  } else if (wear > 0.42) {
    cx.lineWidth = 2.2;
    cx.beginPath(); cx.moveTo(s0, py); cx.lineTo(s1, py); cx.stroke();
  } else if (wear > 0.22) {
    cx.setLineDash([14, 10]); cx.lineWidth = 1.8;
    cx.beginPath(); cx.moveTo(s0, py); cx.lineTo(s1, py); cx.stroke();
  } else {
    cx.setLineDash([3, 13]); cx.lineWidth = 1.6;
    cx.beginPath(); cx.moveTo(s0, py); cx.lineTo(s1, py); cx.stroke();
  }
  cx.restore();

  /* lantern pools first (under everything standing) */
  for (const ln of T.lanterns) {
    const sx = w2s(ln.x);
    if (sx < -180 || sx > W + 180) continue;
    cx.fillStyle = INKS.apricot;
    cx.globalAlpha = 0.10; cx.beginPath(); cx.arc(sx, groundY, 120, 0, 7); cx.fill();
    cx.globalAlpha = 0.16; cx.beginPath(); cx.arc(sx, groundY, 74, 0, 7); cx.fill();
    cx.globalAlpha = 0.26; cx.beginPath(); cx.arc(sx, groundY, 36, 0, 7); cx.fill();
    cx.globalAlpha = 1;
  }

  for (const fl of T.flora) drawFlora(fl, pal);

  /* page signpost, kept in repair by careDays */
  drawSign(T.sign, p, pal);

  for (const b of T.benches) drawBench(b, pal);

  if (T.nightAhead) drawWarnSign(T.nightAhead.x, 'NIGHT GROUND AHEAD', pal);

  /* lantern posts + flames */
  for (const ln of T.lanterns) {
    const sx = w2s(ln.x);
    if (sx < -60 || sx > W + 60) continue;
    cx.strokeStyle = pal.ink; cx.lineWidth = 3;
    cx.beginPath(); cx.moveTo(sx, groundY); cx.lineTo(sx, groundY - 74); cx.stroke();
    cx.beginPath(); cx.moveTo(sx, groundY - 74); cx.lineTo(sx + 14, groundY - 70); cx.stroke();
    cx.fillStyle = pal.ink;
    cx.fillRect(sx + 9, groundY - 70, 10, 14);
    cx.fillStyle = INKS.apricot;
    cx.fillRect(sx + 11.5, groundY - 67, 5, 8);
  }

  /* gates: this stretch's real outbound citations */
  for (const g of p.gates) {
    const sx = w2s(g.x);
    if (sx < -140 || sx > W + 140) continue;
    drawGate(sx, g, pal);
  }

  /* the walkers — the real hands that kept this stretch */
  const t = S.t;
  for (const wk of T.walkers) {
    let wx;
    if (REDUCED) wx = wk.x0;
    else {
      const span = p.len;
      wx = p.start + ((((wk.x0 - p.start) - (t * wk.speed + wk.phase)) % span) + span) % span;
    }
    const sx = w2s(wx);
    if (sx < -80 || sx > W + 80) continue;
    drawFigure(sx - 2, groundY - 1.4, wk.h * 0.94, wx / 24, 'rgba(255,243,224,0.5)', null, !REDUCED);
    drawFigure(sx, groundY, wk.h * 0.94, wx / 24, mix(pal.ink, INKS.violet, wk.isTop ? 0.3 : 0.12), null, !REDUCED);
    label(wk.name, sx, groundY - 74 * wk.h, wk.isTop ? 9.5 : 8.5, 'rgba(255,243,224,0.88)', 'center', 1);
    if (wk.dates) label('WALKED HERE ' + wk.dates, sx, groundY - 74 * wk.h + 11, 7, 'rgba(255,162,107,0.8)', 'center', 0.6);
  }
}

function drawSign(sg, p, pal) {
  const sx = w2s(sg.x);
  if (sx < -160 || sx > W + 160) return;
  cx.save();
  cx.translate(sx, groundY);
  cx.rotate(sg.tilt);
  cx.strokeStyle = pal.ink; cx.lineWidth = 4;
  cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(0, -86); cx.stroke();
  const wdt = 158, hgt = 40;
  cx.fillStyle = pal.accent; cx.globalAlpha = 0.5;
  cx.fillRect(-wdt / 2 + 3, -86 - hgt + 2, wdt, hgt);
  cx.globalAlpha = 1;
  cx.fillStyle = INKS.cream;
  cx.fillRect(-wdt / 2, -86 - hgt, wdt, hgt);
  cx.strokeStyle = pal.ink; cx.lineWidth = 2;
  cx.strokeRect(-wdt / 2, -86 - hgt, wdt, hgt);
  if (sg.cracked) {
    cx.lineWidth = 1;
    cx.beginPath(); cx.moveTo(-wdt / 2 + 18, -86 - hgt); cx.lineTo(-wdt / 2 + 30, -86 - hgt + hgt * 0.6); cx.stroke();
  }
  let name = p.label.toUpperCase();
  if (name.length > 24) name = name.slice(0, 23) + '…';
  label(name, 0, -86 - hgt + 15, 9, INK_DARK, 'center', 1);
  label(fmt(p.words) + ' WORDS · KEPT ' + fmt(p.prov.careDays) + ' DAYS', 0, -86 - hgt + 29, 7.5, '#7a4a20', 'center', 0.6);
  cx.restore();
}

function drawWarnSign(x, txt, pal) {
  const sx = w2s(x);
  if (sx < -140 || sx > W + 140) return;
  cx.save();
  cx.translate(sx, groundY);
  cx.rotate(-0.06);
  cx.strokeStyle = pal.ink; cx.lineWidth = 3.4;
  cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(0, -64); cx.stroke();
  cx.fillStyle = INK_DARK;
  cx.fillRect(-72, -64 - 24, 144, 24);
  cx.strokeStyle = INKS.apricot; cx.lineWidth = 1.5;
  cx.strokeRect(-72, -64 - 24, 144, 24);
  label(txt, 0, -64 - 8, 8.5, INKS.apricot, 'center', 1.4);
  cx.restore();
}

function drawBench(b, pal) {
  const sx = w2s(b.x);
  if (sx < -80 || sx > W + 80) return;
  cx.save();
  cx.translate(sx, groundY);
  cx.rotate(b.tilt);
  cx.fillStyle = pal.ink;
  if (b.broken) {
    cx.fillRect(-26, -20, 24, 4.5);   /* half the seat is gone */
    cx.fillRect(2, -18, 22, 4.5);
  } else {
    cx.fillRect(-26, -20, 52, 4.5);
  }
  cx.fillRect(-22, -15, 5, 15);
  cx.fillRect(17, -15, 5, 15);
  if (!b.broken && b.q > 0.6) { /* well-kept benches keep their backrest */
    cx.fillRect(-26, -34, 4, 15);
    cx.fillRect(-26, -36, 52, 4);
  }
  cx.restore();
}

function drawGate(sx, g, pal) {
  const tp = M.bySlug.get(g.tgt);
  const gy = groundY;
  /* door frame by the path */
  drawPoly([[sx - 17, gy], [sx - 17, gy - 62], [sx - 11, gy - 62], [sx - 11, gy]], pal.ink, pal.accent);
  drawPoly([[sx + 11, gy], [sx + 11, gy - 62], [sx + 17, gy - 62], [sx + 17, gy]], pal.ink, pal.accent);
  drawPoly([[sx - 21, gy - 62], [sx + 21, gy - 62], [sx + 21, gy - 70], [sx - 21, gy - 70]], pal.ink, pal.accent);
  /* the door leaf, cream — a page you could step into */
  cx.fillStyle = 'rgba(255,243,224,0.5)';
  cx.fillRect(sx - 11, gy - 62, 22, 62);
  cx.fillStyle = pal.accent;
  cx.globalAlpha = 0.85;
  cx.fillRect(sx - 8, gy - 59, 16, 6);   /* transom light */
  cx.globalAlpha = 1;
  const near = S.nearGate && S.nearGate.g === g;
  if (near || Math.abs(sx - AVX) < 190) {
    let name = (tp ? tp.label : g.tgt).toUpperCase();
    if (name.length > 26) name = name.slice(0, 25) + '…';
    const dW = wordsAt(tp ? tp.start : 0) - wordsAt(g.x);
    const row = (Math.round(g.x / 92) % 2) * 22;   /* stagger clustered door labels */
    label(name, sx, gy - 96 + row, 8.5, near ? INKS.cream : 'rgba(255,243,224,0.8)', 'center', 1);
    label((dW >= 0 ? fmt(dW) + 'M EAST' : fmt(-dW) + 'M WEST'), sx, gy - 86 + row, 7.5, 'rgba(255,162,107,0.85)', 'center', 0.8);
  }
}

/* ---------------- dock (the reading strip) ---------------- */
const dockContent = document.getElementById('dockContent');
const dockScroll = document.getElementById('dockScroll');
const dockTitle = document.getElementById('dockTitle');
const blockchip = document.getElementById('blockchip');
let dockPage = null;
let userScrollT = 0;

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function renderInto(parent, blocks) {
  for (const b of blocks || []) renderBlock(parent, b);
}
function renderBlock(parent, b) {
  if (b == null) return;
  if (typeof b === 'string') { parent.appendChild(el('p', null, b)); return; }
  switch (b.t) {
    case 'tldr': parent.appendChild(el('div', 'tldr', b.html || '')); break;
    case 'p': parent.appendChild(el('p', null, b.html || '')); break;
    case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
      const h = el(b.t, null, esc(b.text || ''));
      if (b.id) h.id = 'a-' + b.id;
      parent.appendChild(h);
      break;
    }
    case 'admonition': {
      const kind = b.kind || 'note';
      const box = el('div', 'adm adm-' + kind);
      box.appendChild(el('div', 'admk', esc(b.title || kind)));
      renderInto(box, b.blocks);
      parent.appendChild(box);
      break;
    }
    case 'code': {
      if (b.title || b.lang) {
        parent.appendChild(el('div', 'codehead', '<span>' + esc(b.title || '') + '</span><span>' + esc((b.lang || '').toUpperCase()) + '</span>'));
      }
      const pre = el('pre', 'codeblk');
      const code = el('code');
      code.textContent = (b.code || '').replace(/^\n/, '');
      pre.appendChild(code);
      parent.appendChild(pre);
      break;
    }
    case 'table': {
      const wrap = el('div', 'tblwrap');
      const tb = el('table');
      if (b.head && b.head.length) {
        const tr = el('tr');
        for (const c of b.head) tr.appendChild(el('th', null, c));
        tb.appendChild(el('thead')).appendChild(tr);
      }
      const body = el('tbody');
      for (const row of b.rows || []) {
        const tr = el('tr');
        for (const c of row) tr.appendChild(el('td', null, c));
        body.appendChild(tr);
      }
      tb.appendChild(body);
      wrap.appendChild(tb);
      parent.appendChild(wrap);
      break;
    }
    case 'tabs': {
      const grp = el('div', 'tabgrp');
      const btns = el('div', 'tabbtns');
      grp.appendChild(btns);
      (b.tabs || []).forEach((t, i) => {
        const btn = el('button', i === 0 ? 'on' : '', esc(t.label || ('Tab ' + (i + 1))));
        btn.type = 'button';
        btn.dataset.ti = i;
        btns.appendChild(btn);
        const pane = el('div', 'tabpane');
        pane.dataset.ti = i;
        if (i !== 0) pane.hidden = true;
        renderInto(pane, t.blocks);
        grp.appendChild(pane);
      });
      parent.appendChild(grp);
      break;
    }
    case 'ul': case 'ol': {
      const list = el(b.t);
      if (b.t === 'ol' && b.start) list.setAttribute('start', b.start);
      for (const it of b.items || []) {
        const li = el('li');
        if (typeof it === 'string') li.innerHTML = it;
        else { if (it.html) li.innerHTML = it.html; renderInto(li, it.blocks); }
        list.appendChild(li);
      }
      parent.appendChild(list);
      break;
    }
    case 'details': {
      const d = el('details');
      d.open = true;
      d.appendChild(el('summary', null, esc(b.summary || 'Details')));
      renderInto(d, b.blocks);
      parent.appendChild(d);
      break;
    }
    case 'cards': {
      const grid = el('div', 'cards');
      for (const c of b.items || []) {
        const a = el('a', 'card', '<b>' + esc(c.title || '') + '</b><span>' + esc(c.desc || '') + '</span>');
        a.href = c.link || '#';
        grid.appendChild(a);
      }
      parent.appendChild(grid);
      break;
    }
    case 'img': {
      const img = el('img');
      img.src = b.light || b.dark || '';
      img.alt = b.alt || '';
      img.loading = 'lazy';
      parent.appendChild(img);
      if (b.caption) parent.appendChild(el('div', 'imgcap', esc(b.caption)));
      break;
    }
    case 'endpoint': {
      const box = el('div', 'endp');
      const head = el('div', 'endphead');
      head.appendChild(el('span', 'method m-' + String(b.method || '').toLowerCase(), esc(b.method || '')));
      head.appendChild(el('code', null, esc(b.path || '')));
      box.appendChild(head);
      const body = el('div', 'endpbody');
      if (b.title) body.appendChild(el('p', null, '<b>' + esc(b.title) + '</b>'));
      if (b.description) body.appendChild(el('p', null, b.description));
      if (b.params && b.params.length) {
        const wrap = el('div', 'tblwrap');
        const tb = el('table');
        const tr = el('tr');
        [(b.paramTitle || 'Parameter'), 'Type', 'Required', 'Description'].forEach(hh => tr.appendChild(el('th', null, esc(hh))));
        tb.appendChild(el('thead')).appendChild(tr);
        const tbody = el('tbody');
        for (const pm of b.params) {
          const r2 = el('tr');
          r2.appendChild(el('td', null, '<code>' + esc(pm.name || '') + '</code>'));
          r2.appendChild(el('td', null, esc(pm.type || '')));
          r2.appendChild(el('td', null, pm.required ? 'yes' : 'no'));
          r2.appendChild(el('td', null, pm.desc || ''));
          tbody.appendChild(r2);
        }
        tb.appendChild(tbody);
        wrap.appendChild(tb);
        body.appendChild(wrap);
      }
      box.appendChild(body);
      parent.appendChild(box);
      break;
    }
    case 'columns': {
      const cols = el('div', 'cols');
      for (const col of b.cols || []) {
        const c = el('div');
        renderInto(c, col);
        cols.appendChild(c);
      }
      parent.appendChild(cols);
      break;
    }
    case 'badge': parent.appendChild(el('span', 'badge', esc(b.label || b.kind || ''))); break;
    case 'hr': parent.appendChild(el('hr')); break;
    default:
      if (b.html) parent.appendChild(el('p', null, b.html));
      break;
  }
}

function renderDock(page) {
  if (dockPage === page) return;
  dockPage = page;
  const frag = document.createDocumentFragment();
  const head = el('div');
  head.appendChild(el('h1', 'pgtitle', esc(page.title)));
  if (page.description) head.appendChild(el('div', 'pgdesc', esc(page.description)));
  frag.appendChild(head);
  page.blocks.forEach((b, i) => {
    const wrap = el('div', 'blk');
    wrap.dataset.bi = i;
    renderBlock(wrap, b);
    frag.appendChild(wrap);
  });
  dockContent.innerHTML = '';
  dockContent.appendChild(frag);
  dockTitle.textContent = (page.product ? page.product.toUpperCase() + ' · ' : '') +
    (page.section ? page.section + ' · ' : '') + page.title;
  S.bi = -1;
  dockScroll.scrollTop = 0;
}

function updateBlock(page, bi) {
  if (bi === S.bi) return;
  S.bi = bi;
  blockchip.textContent = 'BLOCK ' + (bi + 1) + ' / ' + page.blocks.length;
  const prev = dockContent.querySelector('.blk.here');
  if (prev) prev.classList.remove('here');
  const cur = dockContent.querySelector('.blk[data-bi="' + bi + '"]');
  if (cur) {
    cur.classList.add('here');
    if (performance.now() - userScrollT > 2600) {
      const top = cur.offsetTop - dockScroll.clientHeight * 0.28;
      dockScroll.scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' });
    }
  }
}

dockScroll.addEventListener('wheel', () => { userScrollT = performance.now(); }, { passive: true });
dockScroll.addEventListener('touchmove', () => { userScrollT = performance.now(); }, { passive: true });

dockContent.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (a) {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#/')) { e.preventDefault(); routeTo(href.slice(1)); return; }
    if (href.startsWith('#')) {
      e.preventDefault();
      const t = dockContent.querySelector('#a-' + CSS.escape(href.slice(1)));
      if (t) { userScrollT = performance.now(); t.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' }); }
      return;
    }
    return; /* external links keep their targets */
  }
  const btn = e.target.closest('.tabbtns button');
  if (btn) {
    const grp = btn.closest('.tabgrp');
    grp.querySelectorAll('.tabbtns button').forEach(bb => bb.classList.toggle('on', bb === btn));
    grp.querySelectorAll(':scope > .tabpane').forEach(pn => { pn.hidden = pn.dataset.ti !== btn.dataset.ti; });
    return;
  }
  const blk = e.target.closest('.blk');
  if (blk && dockPage) {
    const bi = +blk.dataset.bi;
    const x = dockPage.start + dockPage.fracs[bi] * dockPage.len + 4;
    if (REDUCED) { S.x = x; needsDraw = true; } else S.target = x;
  }
});

/* ---------------- HUD ---------------- */
const hudTitle = document.getElementById('hudTitle');
const hudBiome = document.getElementById('hudBiome');
const odoEl = document.getElementById('odometer');
const doorEl = document.getElementById('nextdoor');
const walkedEl = document.getElementById('walked');
const gatePrompt = document.getElementById('gatePrompt');
const hudCache = {};
function setText(elm, key, txt) {
  if (hudCache[key] === txt) return;
  hudCache[key] = txt;
  elm.textContent = txt;
}

function nextDoorAhead() {
  const idx = M.pages.indexOf(S.page);
  for (let k = 0; k < 24 && idx + k < M.pages.length; k++) {
    const p = M.pages[idx + k];
    for (const g of p.gates) if (g.x > S.x + 8) return g;
  }
  return null;
}

function updateHUD() {
  const p = S.page;
  setText(hudTitle, 't', p.title);
  if (p.comm >= 0) {
    const c = M.communities[p.comm];
    const hp = M.bySlug.get(c.hub);
    setText(hudBiome, 'b', 'BIOME ' + (p.comm + 1) + ' OF ' + M.communities.length + ' · ' + c.size + ' PAGES · HUB: ' + (hp ? hp.label.toUpperCase() : c.hub));
  } else {
    setText(hudBiome, 'b', 'OPEN COUNTRY · OUTSIDE THE ' + M.communities.length + ' BIOMES');
  }
  const wNow = wordsAt(S.x);
  setText(odoEl, 'o', 'WORD ' + fmt(wNow) + ' OF ' + fmt(M.totalWords));
  const g = nextDoorAhead();
  if (g) {
    const d = wordsAt(g.x) - wNow;
    setText(doorEl, 'd', 'NEXT DOOR ' + fmt(Math.max(1, d)) + 'M');
  } else setText(doorEl, 'd', 'NO DOOR BETWEEN HERE AND TRAIL END');
  setText(walkedEl, 'w', 'WALKED ' + fmt(S.walkedWords) + 'M THIS SESSION');

  /* nearest gate in reach */
  let near = null;
  for (const g2 of p.gates) {
    const d = Math.abs(g2.x - S.x);
    if (d < GATE_RANGE && (!near || d < near.d)) near = { g: g2, d };
  }
  S.nearGate = near;
  if (near) {
    const tp = M.bySlug.get(near.g.tgt);
    const dw = wordsAt(tp.start) - wNow;
    const dir = dw >= 0 ? 'EAST' : 'WEST';
    const txt = 'ENTER — GATE TO ' + tp.label.toUpperCase() + ' · CARRIES YOU ' + fmt(Math.abs(dw)) + 'M ' + dir;
    if (gatePrompt.hidden || hudCache.gp !== txt) { gatePrompt.hidden = false; gatePrompt.textContent = txt; hudCache.gp = txt; }
  } else if (!gatePrompt.hidden) gatePrompt.hidden = true;
}

/* ---------------- trailhead index (the dissent's law) ---------------- */
const trailhead = document.getElementById('trailhead');
const thSearch = document.getElementById('thSearch');
const thList = document.getElementById('thList');
let thSel = 0, thRows = [];

function openTrailhead() {
  S.overlay = 'index';
  trailhead.hidden = false;
  thSearch.value = '';
  buildThList('');
  thSearch.focus();
}
function closeOverlays() {
  S.overlay = null;
  trailhead.hidden = true;
  document.getElementById('gatemap').hidden = true;
  S.gm = null;
  needsDraw = true;
}
function buildThList(q) {
  const needle = q.trim().toLowerCase();
  thRows = M.pages.filter(p => !needle ||
    p.title.toLowerCase().includes(needle) ||
    p.label.toLowerCase().includes(needle) ||
    p.slug.toLowerCase().includes(needle));
  thSel = 0;
  const frag = document.createDocumentFragment();
  thRows.forEach((p, i) => {
    const li = el('li', i === 0 ? 'sel' : '');
    li.appendChild(el('span', null, esc(p.title)));
    li.appendChild(el('span', 'thmeta', esc((p.product || '').toUpperCase() + ' · AT WORD ' + fmt(p.cumWords))));
    li.dataset.slug = p.slug;
    frag.appendChild(li);
  });
  thList.innerHTML = '';
  thList.appendChild(frag);
}
thSearch.addEventListener('input', () => buildThList(thSearch.value));
thList.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (li) { closeOverlays(); routeTo(li.dataset.slug); }
});
function thMove(d) {
  if (!thRows.length) return;
  const lis = thList.children;
  if (lis[thSel]) lis[thSel].classList.remove('sel');
  thSel = clamp(thSel + d, 0, thRows.length - 1);
  lis[thSel].classList.add('sel');
  lis[thSel].scrollIntoView({ block: 'nearest' });
}
document.getElementById('btnTrailhead').addEventListener('click', () => {
  if (S.overlay === 'index') closeOverlays(); else openTrailhead();
});

/* ---------------- gate map (fast travel with a drawn footpath) ---------------- */
const gatemap = document.getElementById('gatemap');
const gmCanvas = document.getElementById('gmCanvas');
function openGate(g) {
  const tp = M.bySlug.get(g.tgt);
  if (!tp) return;
  S.overlay = 'gatemap';
  S.gm = { from: S.page, to: tp, gx: g.x };
  gatemap.hidden = false;
  const g2 = gmCanvas.getContext('2d');
  const w = gmCanvas.width, h = gmCanvas.height;
  g2.clearRect(0, 0, w, h);
  g2.fillStyle = INK_DARK; g2.fillRect(0, 0, w, h);
  /* the whole trail as a strip, each page tinted by its biome */
  const mL = 34, mR = 34, ty = h - 52;
  const inkArr = [INKS.violet, INKS.rose, INKS.apricot, INKS.cream];
  for (const p of M.pages) {
    const x0 = mL + (w - mL - mR) * p.start / M.totalPx;
    const ww = Math.max(0.6, (w - mL - mR) * p.len / M.totalPx);
    if (p.comm >= 0) {
      g2.globalAlpha = 0.42 + (p.comm % 3) * 0.18;
      g2.fillStyle = inkArr[p.comm % inkArr.length];
    } else {
      g2.globalAlpha = 0.2;
      g2.fillStyle = INKS.cream;
    }
    g2.fillRect(x0, ty, ww, 9);
  }
  g2.globalAlpha = 1;
  /* footpath arc */
  const x1 = mL + (w - mL - mR) * g.x / M.totalPx;
  const x2 = mL + (w - mL - mR) * tp.start / M.totalPx;
  const peak = ty - 26 - Math.min(86, Math.abs(x2 - x1) * 0.42);
  g2.strokeStyle = INKS.cream;
  g2.setLineDash([3, 6]);
  g2.lineWidth = 1.6;
  g2.beginPath();
  g2.moveTo(x1, ty - 2);
  g2.quadraticCurveTo((x1 + x2) / 2, peak, x2, ty - 2);
  g2.stroke();
  g2.setLineDash([]);
  g2.fillStyle = INKS.rose; g2.beginPath(); g2.arc(x1, ty + 4, 4, 0, 7); g2.fill();
  g2.fillStyle = INKS.apricot; g2.beginPath(); g2.arc(x2, ty + 4, 4, 0, 7); g2.fill();
  g2.font = '10px Georgia, serif'; g2.textAlign = 'center'; g2.fillStyle = INKS.cream;
  if (Math.abs(x2 - x1) < 56) {
    g2.fillText('HERE', x1, ty + 22);
    g2.fillText('THERE', x2, ty + 34);
  } else {
    g2.fillText('HERE', x1, ty + 22);
    g2.fillText('THERE', x2, ty + 22);
  }

  const dw = wordsAt(tp.start) - wordsAt(S.x);
  document.getElementById('gmFrom').innerHTML = 'FROM <b>' + esc(S.page.title) + '</b>';
  document.getElementById('gmTo').innerHTML = 'THROUGH THE DOOR TO <b>' + esc(tp.title) + '</b>';
  document.getElementById('gmDist').textContent =
    'CARRIES YOU ' + fmt(Math.abs(dw)) + 'M ' + (dw >= 0 ? 'EAST' : 'WEST') +
    ' · CITED BY ' + fmt(tp.inCount) + ' PAGES';
}
function confirmGate() {
  const gm = S.gm;
  closeOverlays();
  if (gm) travelTo(gm.to.slug);
}

/* ---------------- routing & travel ---------------- */
const wipeEl = document.getElementById('wipe');
let suppressHash = false;
function teleport(x) {
  S.x = clamp(x, 10, M.totalPx - 10);
  S.target = null; S.vx = 0;
  needsDraw = true;
  syncPage(true);
}
function travelTo(slug) {
  const p = M.bySlug.get(slug);
  if (!p) return;
  const go = () => {
    teleport(p.start + 6);
    suppressHash = true;
    location.hash = '#' + slug;
  };
  if (REDUCED) { go(); return; }
  wipeEl.hidden = false;
  wipeEl.style.transformOrigin = 'left center';
  const a1 = wipeEl.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 170, easing: 'steps(6)', fill: 'forwards' });
  a1.onfinish = () => {
    go();
    wipeEl.style.transformOrigin = 'right center';
    const a2 = wipeEl.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 200, easing: 'steps(6)', fill: 'forwards' });
    a2.onfinish = () => { wipeEl.hidden = true; };
  };
}
function routeTo(slug) { travelTo(slug); }
window.addEventListener('hashchange', () => {
  if (suppressHash) { suppressHash = false; return; }
  const slug = location.hash.slice(1);
  if (M.bySlug.has(slug)) {
    const p = M.bySlug.get(slug);
    teleport(p.start + 6);
  }
});

function syncPage(force) {
  const p = pageAt(S.x);
  if (p !== S.page || force) {
    S.page = p;
    renderDock(p);
    const key = p.comm + ':' + (p.prov.night > 0 ? 'n' : 'd');
    if (key !== S.palKey) {
      S.palKey = key;
      S.pal = paletteFor(p.comm, p.prov.night > 0);
      S.front = REDUCED ? 1 : 0;   /* weather front sweeps on biome change */
    }
    if (!suppressHash) {
      try { history.replaceState(null, '', '#' + p.slug); } catch (e) { }
    }
  }
  updateBlock(S.page, blockIndexAt(S.page, S.x));
}

/* ---------------- input ---------------- */
window.addEventListener('keydown', (e) => {
  if (S.overlay === 'landing') { dismissLanding(); e.preventDefault(); return; }
  if (e.key === 'Tab') {
    e.preventDefault();
    if (S.overlay === 'index') closeOverlays(); else openTrailhead();
    return;
  }
  if (S.overlay === 'index') {
    if (e.key === 'Escape') { closeOverlays(); e.preventDefault(); }
    else if (e.key === 'ArrowDown') { thMove(1); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { thMove(-1); e.preventDefault(); }
    else if (e.key === 'Enter') {
      const p = thRows[thSel];
      if (p) { closeOverlays(); routeTo(p.slug); }
      e.preventDefault();
    }
    return;
  }
  if (S.overlay === 'gatemap') {
    if (e.key === 'Escape') closeOverlays();
    else if (e.key === 'Enter') confirmGate();
    e.preventDefault();
    return;
  }
  const k = e.key.toLowerCase();
  if (k === 'enter') {
    if (S.nearGate) openGate(S.nearGate.g);
    return;
  }
  if (REDUCED) {
    /* calm variant: discrete step-through, block by block */
    if (k === 'arrowright' || k === 'd') { stepBlock(1); e.preventDefault(); }
    else if (k === 'arrowleft' || k === 'a') { stepBlock(-1); e.preventDefault(); }
    return;
  }
  if (['arrowleft', 'arrowright', 'a', 'd', 'w', 's', 'arrowup', 'arrowdown', 'shift'].includes(k)) {
    S.keys[k] = true;
    if (k !== 'shift') S.target = null;
    e.preventDefault();
  }
});
window.addEventListener('keyup', (e) => {
  S.keys[e.key.toLowerCase()] = false;
});
window.addEventListener('blur', () => { S.keys = {}; });

function stepBlock(dir) {
  const p = S.page;
  const bi = blockIndexAt(p, S.x);
  let ni = bi + dir;
  if (ni < 0) {
    const idx = M.pages.indexOf(p);
    if (idx > 0) {
      const pp = M.pages[idx - 1];
      S.x = pp.start + pp.fracs[pp.blocks.length - 1] * pp.len + 4;
    }
  } else if (ni >= p.blocks.length) {
    const idx = M.pages.indexOf(p);
    if (idx < M.pages.length - 1) S.x = M.pages[idx + 1].start + 4;
  } else {
    S.x = p.start + p.fracs[ni] * p.len + 4;
  }
  S.x = clamp(S.x, 10, M.totalPx - 10);
  needsDraw = true;
  renderStep();
}

cv.addEventListener('click', (e) => {
  if (S.overlay) return;
  const wx = S.x + (e.clientX - AVX);
  const clamped = clamp(wx, 10, M.totalPx - 10);
  if (REDUCED) { S.x = clamped; needsDraw = true; renderStep(); }
  else S.target = clamped;
});

/* ---------------- landing ---------------- */
const landingEl = document.getElementById('landing');
function fillLanding() {
  document.getElementById('ldStats').innerHTML =
    '<span><b>' + fmt(M.pages.length) + '</b> PAGES</span>' +
    '<span><b>' + fmt(M.totalWords) + '</b> WORDS OF TRAIL</span>' +
    '<span><b>' + fmt(M.communities.length) + '</b> BIOMES</span>' +
    '<span><b>' + fmt(M.authorsTotal) + '</b> FELLOW WALKERS</span>' +
    '<span><b>' + fmt(M.lanternsTotal) + '</b> LANTERNS IN ' + fmt(M.nightPages) + ' NIGHT HOLLOWS</span>';
}
function dismissLanding() {
  if (S.overlay !== 'landing') return;
  landingEl.classList.add('gone');
  S.overlay = null;
  lsSet('longway.seen', '1');
  needsDraw = true;
}
landingEl.addEventListener('click', dismissLanding);

/* ---------------- main loop ---------------- */
let lastT = 0;
function frame(now) {
  const t0 = performance.now();
  const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016);
  lastT = now;
  S.t += dt;

  if (!S.overlay || S.overlay === 'index' || S.overlay === 'gatemap') {
    /* movement */
    let dir = 0;
    if (!S.overlay) {
      if (S.keys['arrowleft'] || S.keys['a']) dir -= 1;
      if (S.keys['arrowright'] || S.keys['d']) dir += 1;
    }
    const spd = S.keys['shift'] ? STRIDE_V : WALK_V;
    if (dir !== 0) {
      S.vx = dir * spd;
    } else if (S.target != null) {
      const d = S.target - S.x;
      if (Math.abs(d) < 6) { S.target = null; S.vx = 0; }
      else S.vx = clamp(d * 3, -spd, spd);
    } else {
      S.vx = 0;
    }
    if (S.vx !== 0) {
      const before = wordsAt(S.x);
      S.x = clamp(S.x + S.vx * dt, 10, M.totalPx - 10);
      S.walkedWords += Math.abs(wordsAt(S.x) - before);
      syncPage();
    }
    if (S.front < 1) S.front = Math.min(1, S.front + dt * 2.1);

    draw(dt);
    updateHUD();
  }

  const ms = performance.now() - t0;
  noteFrame(ms, S.overlay || (Math.abs(S.vx) > 1 ? 'walking' : 'idle'));
  requestAnimationFrame(frame);
}

/* reduced-motion: render on demand only */
function renderStep() {
  const t0 = performance.now();
  syncPage();
  draw(0);
  updateHUD();
  noteFrame(performance.now() - t0, 'reduced-step');
}

/* ---------------- boot ---------------- */
async function boot() {
  const [content, graph, communities, provenance] = await Promise.all([
    fetch('content.json').then(r => r.json()),
    fetch('graph.json').then(r => r.json()),
    fetch('communities.json').then(r => r.json()),
    fetch('provenance.json').then(r => r.json())
  ]);
  buildModel(content, graph, communities, provenance);
  resize();
  makeGrain();
  fillLanding();

  const slug = location.hash.slice(1);
  if (slug && M.bySlug.has(slug)) {
    landingEl.classList.add('gone');
    teleport(M.bySlug.get(slug).start + 6);
  } else {
    S.overlay = 'landing';
    teleport(12);
  }

  window.__lw = {
    M,
    setX(x) { teleport(x); if (REDUCED) renderStep(); },
    goto(s) { const p = M.bySlug.get(s); if (p) { teleport(p.start + 6); if (REDUCED) renderStep(); } }
  };

  if (REDUCED) {
    renderStep();
    window.__diag.state = 'reduced-ready';
  } else {
    requestAnimationFrame((t) => { lastT = t; requestAnimationFrame(frame); });
  }
}

boot().catch(err => {
  console.error(err);
  document.body.insertAdjacentHTML('beforeend',
    '<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#1C0F2E;color:#FFF3E0;font-family:Georgia,serif;z-index:99">The trail data could not be loaded. Serve this folder over HTTP and try again.</div>');
});
