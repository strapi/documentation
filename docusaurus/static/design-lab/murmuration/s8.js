/* ============================================================================
   THE MURMURATION
   290 pages of the Strapi documentation as a flock of starlings
   over a winter marsh at dusk.

   seed: QjVD99ofA45UiKQnz7Vkoft8Z8BeztGKy7tj0DKMnGLj04qOpLD3F2n972eGixmWxNhR
         HTQWqYCk6mLbk80pI6Ob1bdc5XqB
   digit-sum 110 -> the most kinetic of the three worlds
   vowels 11     -> the emptiest: sky, water, reeds, flock. nothing else.
   ============================================================================ */
(function () {
'use strict';

/* ---------------------------------------------------------------- seed ---- */
const SEED = 'QjVD99ofA45UiKQnz7Vkoft8Z8BeztGKy7tj0DKMnGLj04qOpLD3F2n972eGixmWxNhRHTQWqYCk6mLbk80pI6Ob1bdc5XqB';

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const seedSrc = xmur3(SEED);
const R0 = mulberry32(seedSrc());   /* world geometry */
const R1 = mulberry32(seedSrc());   /* per-bird grain */
const R2 = mulberry32(seedSrc());   /* reeds, ripples, glitter */

/* digit sum and vowel count, read off the seed itself */
let DIGITS = 0, VOWELS = 0;
for (const ch of SEED) {
  if (ch >= '0' && ch <= '9') DIGITS += +ch;
  if ('aeiouAEIOU'.indexOf(ch) >= 0) VOWELS++;
}

/* every constant below is drawn from the seed stream, in order */
const D = {
  horizon:    0.612 + R0() * 0.05,        /* where sky becomes water        */
  sunX:       0.185 + R0() * 0.17,        /* the low sun, left of centre    */
  sunLift:    0.012 + R0() * 0.022,       /* how far it clears the reeds    */
  posts:      5 + Math.floor(R0() * 3),   /* fence posts across the marsh   */
  wireY:      0.728 + R0() * 0.022,
  sag:        0.016 + R0() * 0.012,
  reedFar:    190 + Math.floor(R0() * 70),
  reedNear:   150 + Math.floor(R0() * 70),
  waveEvery:  6.8 + R0() * 2.4,           /* seconds between agitation waves*/
  waveJitter: 4.0 + R0() * 3.0,
  waveMul:    3.0 + R0() * 0.9,           /* wave outruns the flock ~3x     */
  kinBias:    0.062 + R0() * 0.026,     /* how hard citation pulls        */
  perchKin:   4 + Math.floor(R0() * 3),   /* neighbours that land beside it */
  swirlPer:   19 + R0() * 9,
  roostPer:   31 + R0() * 13,
  kinetic:    DIGITS / 110,               /* 1.0 here, by construction      */
  sparse:     VOWELS / 11
};

/* dusk ramp: 11 hues (one per vowel), shuffled by the seed, handed to sections */
const DUSK_HUES = [268, 288, 306, 322, 246, 222, 200, 176, 152, 132, 112];
(function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(R0() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
})(DUSK_HUES);

/* ------------------------------------------------------------- helpers ---- */
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const TAU = Math.PI * 2;

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function prettyDate(iso) {
  if (!iso) return '';
  const p = iso.split('-');
  if (p.length !== 3) return iso;
  return `${+p[2]} ${MONTHS[+p[1] - 1]} ${p[0]}`;
}
const NUMWORD = ['no','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
function numWord(n) { return n <= 12 ? NUMWORD[n] : String(n); }
function commas(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

/* ---------------------------------------------------------------- data ---- */
const S = {
  ready: false, pages: [], bySlug: new Map(), nav: null,
  graph: null, prov: null, comms: null,
  inb: new Map(), outb: new Map(), words: new Map(), codes: new Map(),
  cites: new Map(), citedBy: new Map(), commOf: new Map(),
  sections: [], secOf: new Map(),
  totals: {}
};

Promise.all(['content.json', 'graph.json', 'provenance.json', 'communities.json']
  .map((u) => fetch(u).then((r) => {
    if (!r.ok) throw new Error(u + ' ' + r.status);
    return r.json();
  })))
  .then(([content, graph, prov, comms]) => { build(content, graph, prov, comms); })
  .catch((e) => {
    const v = $('#veil');
    if (v) v.querySelector('.veil-line').textContent = 'the marsh is quiet: ' + e.message;
    /* eslint-disable-next-line no-console */
    console.warn(e);
  });

function build(content, graph, prov, comms) {
  S.nav = content.nav; S.graph = graph; S.prov = prov; S.comms = comms;

  const asMap = (o) => (Array.isArray(o) ? new Map(o) : new Map(Object.entries(o || {})));
  S.inb = asMap(graph.inbound); S.outb = asMap(graph.outbound);
  S.words = asMap(graph.words); S.codes = asMap(graph.code);
  for (const [a, b] of graph.edges) {
    if (!S.cites.has(a)) S.cites.set(a, []);
    if (!S.citedBy.has(b)) S.citedBy.set(b, []);
    S.cites.get(a).push(b);
    S.citedBy.get(b).push(a);
  }
  comms.forEach((c, i) => { for (const m of c.members) S.commOf.set(m, i); });

  /* nav sections, in nav order: this is the plumage key */
  const walkNav = (items, out) => {
    for (const it of items) {
      if (it.slug) out.push(it.slug);
      if (it.items) walkNav(it.items, out);
    }
  };
  const labelCount = {};
  S.nav.forEach((g) => { labelCount[g.label] = (labelCount[g.label] || 0) + 1; });
  S.nav.forEach((g, gi) => {
    const slugs = [];
    walkNav(g.items, slugs);
    const hue = DUSK_HUES[gi % DUSK_HUES.length];
    const sec = { i: gi, label: labelCount[g.label] > 1 ? g.label + ' \u00b7 ' + g.product : g.label, product: g.product, slugs, hue };
    S.sections.push(sec);
    for (const s of slugs) if (!S.secOf.has(s)) S.secOf.set(s, gi);
  });

  /* the birds, in corpus order */
  content.order.forEach((slug, i) => {
    const p = content.pages[slug];
    const rec = {
      i, slug, p,
      title: p.sidebarLabel || p.title || slug,
      sec: S.secOf.has(slug) ? S.secOf.get(slug) : 0,
      prov: prov[slug] || null,
      comm: S.commOf.has(slug) ? S.commOf.get(slug) : -1
    };
    S.pages.push(rec);
    S.bySlug.set(slug, rec);
  });

  /* kin: the pages a bird actually cites, then the pages that cite it.
     these bias who it flies with. */
  for (const rec of S.pages) {
    const seen = new Set([rec.slug]);
    const kin = [];
    const push = (s, w) => {
      if (seen.has(s) || !S.bySlug.has(s)) return;
      seen.add(s); kin.push({ i: S.bySlug.get(s).i, w });
    };
    (S.cites.get(rec.slug) || []).forEach((s) => push(s, 1.0));
    (S.citedBy.get(rec.slug) || []).forEach((s) => push(s, 0.62));
    rec.kin = kin.slice(0, 12);
  }

  /* honest totals, computed here, never typed by hand */
  let commits = 0, night = 0, careMax = 0, careMaxSlug = '', nightPages = 0;
  const hands = new Set(); const care = [];
  let born = '9999', last = '0000';
  for (const rec of S.pages) {
    const v = rec.prov; if (!v) continue;
    commits += v.commits; night += v.night;
    if (v.night > 0) nightPages++;
    v.authors.forEach((a) => hands.add(a));
    care.push(v.careDays);
    if (v.careDays > careMax) { careMax = v.careDays; careMaxSlug = rec.slug; }
    if (v.first < born) born = v.first;
    if (v.last > last) last = v.last;
  }
  care.sort((a, b) => a - b);
  S.totals = {
    pages: S.pages.length, commits, night, nightPages,
    hands: hands.size, careMax, careMaxSlug,
    careMed: care[Math.floor(care.length / 2)],
    born, last, edges: graph.edges.length,
    comms: comms.length,
    orphans: S.pages.filter((r) => !(S.inb.get(r.slug) > 0)).length
  };

  S.ready = true;
  boot();
}

/* ============================================================================
   THE MARSH
   ========================================================================== */
const cv = $('#marsh');
const ctx = cv.getContext('2d', { alpha: false });
const bg = document.createElement('canvas');
const bgx = bg.getContext('2d');
const tr = document.createElement('canvas');
const trx = tr.getContext('2d');

const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
let still = RM.matches;

const G = {
  W: 0, H: 0, dpr: 1, s: 1,
  horizonY: 0, sunX: 0, sunY: 0, sunR: 0,
  wireY: 0, posts: [], spans: [], reeds: [], ripples: [], glitter: []
};

function marshRng() { return mulberry32(xmur3(SEED + '::marsh')()); }

function layout() {
  const W = window.innerWidth, H = window.innerHeight;
  G.W = W; G.H = H;
  G.dpr = Math.min(window.devicePixelRatio || 1, 2);
  G.s = Math.min(W, H) / 900;
  G.horizonY = Math.round(H * D.horizon);
  G.sunX = W * D.sunX;
  G.sunR = Math.max(26, Math.min(W, H) * 0.036);
  G.sunY = G.horizonY - H * D.sunLift - G.sunR * 0.25;
  G.wireY = Math.round(H * D.wireY);

  const r = marshRng();

  /* fence: posts leaning slightly, wires sagging between them */
  G.posts = [];
  const n = D.posts;
  const pad = W * 0.045;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = pad + (W - pad * 2) * t + (r() - 0.5) * W * 0.018;
    const top = G.wireY - H * (0.008 + r() * 0.012);
    G.posts.push({ x, top, lean: (r() - 0.5) * 0.055, w: Math.max(2, 3.1 * G.s + r() * 1.6) });
  }
  G.spans = [];
  for (let i = 0; i < G.posts.length - 1; i++) {
    G.spans.push({ a: G.posts[i], b: G.posts[i + 1], sag: H * D.sag * (0.7 + r() * 0.6) });
  }

  /* reeds: two beds, far then near */
  G.reeds = [];
  const bedFar = H * 0.845, bedNear = H * 0.965;
  for (let i = 0; i < D.reedFar; i++) {
    const x = r() * W * 1.04 - W * 0.02;
    const h = H * (0.035 + r() * 0.075);
    G.reeds.push({ x, y: bedFar + (r() - 0.5) * H * 0.028, h, bend: (r() - 0.5) * 0.5, w: 1.0 + r() * 0.9, far: 1, head: r() > 0.52 });
  }
  for (let i = 0; i < D.reedNear; i++) {
    const x = r() * W * 1.06 - W * 0.03;
    const h = H * (0.075 + r() * 0.16);
    G.reeds.push({ x, y: bedNear + (r() - 0.5) * H * 0.05, h, bend: (r() - 0.5) * 0.62, w: 1.6 + r() * 1.9, far: 0, head: r() > 0.4 });
  }

  /* water: still ripple lines and the sun's glitter path */
  G.ripples = [];
  for (let i = 0; i < 130; i++) {
    const t = Math.pow(r(), 0.62);
    const y = G.horizonY + (H - G.horizonY) * t;
    G.ripples.push({ y, x: r() * W, len: W * (0.02 + r() * 0.13) * (0.35 + t), a: 0.02 + r() * 0.075 * (0.3 + t) });
  }
  G.glitter = [];
  for (let i = 0; i < 90; i++) {
    const t = Math.pow(r(), 0.55);
    const y = G.horizonY + (H - G.horizonY) * t * 0.82;
    const spread = G.sunR * (0.5 + t * 7.5);
    G.glitter.push({ x: G.sunX + (r() - 0.5) * spread, y, len: 2 + r() * (5 + t * 26), a: (0.5 - t * 0.36) * (0.4 + r() * 0.6) });
  }

  const pw = Math.round(W * G.dpr), ph = Math.round(H * G.dpr);
  cv.width = pw; cv.height = ph; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  bg.width = pw; bg.height = ph;
  tr.width = Math.max(1, Math.round(pw * 0.5)); tr.height = Math.max(1, Math.round(ph * 0.5));
  trx.setTransform(G.dpr * 0.5, 0, 0, G.dpr * 0.5, 0, 0);
  trx.clearRect(0, 0, W, H);
  drawBg();
}

/* ------------------------------------------------------ the static dusk --- */
function drawBg() {
  const { W, H, dpr, horizonY } = G;
  bgx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const r = marshRng();
  for (let i = 0; i < 40; i++) r();   /* advance past the fence draws */

  /* --- sky: seven bands of a winter dusk --- */
  const sky = bgx.createLinearGradient(0, 0, 0, horizonY);
  sky.addColorStop(0.00, '#141b2f');
  sky.addColorStop(0.20, '#1b2340');
  sky.addColorStop(0.42, '#2c2f4d');
  sky.addColorStop(0.62, '#4a3d55');
  sky.addColorStop(0.78, '#77505a');
  sky.addColorStop(0.90, '#b4715a');
  sky.addColorStop(1.00, '#e2a069');
  bgx.fillStyle = sky;
  bgx.fillRect(0, 0, W, horizonY + 1);

  /* the sun's own glow, wide and low */
  const glow = bgx.createRadialGradient(G.sunX, G.sunY, 0, G.sunX, G.sunY, Math.max(W, H) * 0.52);
  glow.addColorStop(0, 'rgba(255,208,148,0.42)');
  glow.addColorStop(0.14, 'rgba(248,177,116,0.20)');
  glow.addColorStop(0.38, 'rgba(190,116,96,0.09)');
  glow.addColorStop(1, 'rgba(120,80,90,0)');
  bgx.fillStyle = glow;
  bgx.fillRect(0, 0, W, horizonY + 1);

  /* three long cloud bars, sparse (the seed says: keep it empty) */
  for (let i = 0; i < 3; i++) {
    const y = horizonY * (0.34 + i * 0.20) + (r() - 0.5) * H * 0.03;
    const h = H * (0.004 + r() * 0.008);
    const x0 = -W * 0.1 + r() * W * 0.3;
    const x1 = x0 + W * (0.5 + r() * 0.8);
    const g2 = bgx.createLinearGradient(x0, 0, x1, 0);
    const a = 0.022 + r() * 0.026;
    g2.addColorStop(0, 'rgba(226,168,146,0)');
    g2.addColorStop(0.35, `rgba(236,182,150,${a})`);
    g2.addColorStop(0.62, `rgba(214,150,140,${a * 0.8})`);
    g2.addColorStop(1, 'rgba(180,130,140,0)');
    bgx.fillStyle = g2;
    bgx.beginPath();
    bgx.ellipse((x0 + x1) / 2, y, (x1 - x0) / 2, h, 0, 0, TAU);
    bgx.fill();
  }

  /* the sun itself */
  bgx.beginPath();
  bgx.arc(G.sunX, G.sunY, G.sunR, 0, TAU);
  const disc = bgx.createRadialGradient(G.sunX, G.sunY - G.sunR * 0.2, 0, G.sunX, G.sunY, G.sunR);
  disc.addColorStop(0, 'rgba(255,238,208,0.96)');
  disc.addColorStop(0.6, 'rgba(255,206,146,0.88)');
  disc.addColorStop(1, 'rgba(246,168,112,0.62)');
  bgx.fillStyle = disc;
  bgx.fill();

  /* far treeline, one side only */
  bgx.fillStyle = 'rgba(30,27,44,0.5)';
  bgx.beginPath();
  bgx.moveTo(W * 0.52, horizonY + 1);
  let tx = W * 0.52;
  while (tx < W * 1.02) {
    const th = H * (0.0018 + Math.pow(r(), 2.4) * 0.0085);
    const tw = W * (0.003 + r() * 0.011);
    bgx.lineTo(tx, horizonY - th);
    bgx.lineTo(tx + tw * 0.5, horizonY - th * (0.5 + r() * 0.8));
    tx += tw;
  }
  bgx.lineTo(W * 1.02, horizonY + 1);
  bgx.closePath();
  bgx.fill();

  /* --- water --- */
  const wat = bgx.createLinearGradient(0, horizonY, 0, H);
  wat.addColorStop(0.00, '#9a6a55');
  wat.addColorStop(0.06, '#5a4753');
  wat.addColorStop(0.22, '#2c3048');
  wat.addColorStop(0.55, '#1a1e30');
  wat.addColorStop(1.00, '#0d1018');
  bgx.fillStyle = wat;
  bgx.fillRect(0, horizonY, W, H - horizonY);

  /* the sun's column, poured down the water */
  const col = bgx.createLinearGradient(0, horizonY, 0, H * 0.93);
  col.addColorStop(0, 'rgba(250,190,128,0.34)');
  col.addColorStop(0.35, 'rgba(226,150,104,0.12)');
  col.addColorStop(1, 'rgba(200,130,100,0)');
  const rows = 46;
  for (let i = 0; i < rows; i++) {
    const u = i / (rows - 1);
    const y = horizonY + (H - horizonY) * u;
    const half = G.sunR * (0.85 + u * u * 6.4);
    const a = (0.30 - u * 0.29) * (0.75 + 0.25 * Math.sin(u * 26 + 1.3));
    if (a <= 0) continue;
    const hg = bgx.createLinearGradient(G.sunX - half, 0, G.sunX + half, 0);
    hg.addColorStop(0, 'rgba(250,186,124,0)');
    hg.addColorStop(0.5, `rgba(250,190,130,${a})`);
    hg.addColorStop(1, 'rgba(250,186,124,0)');
    bgx.fillStyle = hg;
    bgx.fillRect(G.sunX - half, y, half * 2, (H - horizonY) / rows + 1.4);
  }

  /* mist on the water, so the horizon has no seam */
  const mist = bgx.createLinearGradient(0, horizonY - H * 0.028, 0, horizonY + H * 0.05);
  mist.addColorStop(0, 'rgba(238,196,158,0)');
  mist.addColorStop(0.42, 'rgba(240,200,164,0.20)');
  mist.addColorStop(1, 'rgba(216,170,150,0)');
  bgx.fillStyle = mist;
  bgx.fillRect(0, horizonY - H * 0.028, W, H * 0.078);

  /* ripple lines */
  bgx.lineCap = 'round';
  for (const rp of G.ripples) {
    bgx.strokeStyle = `rgba(196,188,196,${rp.a})`;
    bgx.lineWidth = Math.max(0.6, G.s * 0.9);
    bgx.beginPath();
    bgx.moveTo(rp.x, rp.y);
    bgx.lineTo(rp.x + rp.len, rp.y);
    bgx.stroke();
  }
  for (const gl of G.glitter) {
    bgx.strokeStyle = `rgba(255,214,164,${Math.max(0, gl.a) * 0.6})`;
    bgx.lineWidth = Math.max(0.7, G.s * 1.1);
    bgx.beginPath();
    bgx.moveTo(gl.x - gl.len / 2, gl.y);
    bgx.lineTo(gl.x + gl.len / 2, gl.y);
    bgx.stroke();
  }

  /* --- the fence, standing in the shallows --- */
  bgx.lineCap = 'round';
  for (const sp of G.spans) {
    for (let k = 0; k < 2; k++) {
      const off = k * Math.max(6, H * 0.016);
      bgx.strokeStyle = k === 0 ? 'rgba(18,20,30,0.86)' : 'rgba(18,20,30,0.6)';
      bgx.lineWidth = Math.max(0.9, G.s * (k === 0 ? 1.25 : 1.0));
      bgx.beginPath();
      bgx.moveTo(sp.a.x, sp.a.top + off);
      bgx.quadraticCurveTo((sp.a.x + sp.b.x) / 2, (sp.a.top + sp.b.top) / 2 + off + sp.sag * 2,
        sp.b.x, sp.b.top + off);
      bgx.stroke();
    }
  }
  for (const p of G.posts) {
    const bot = G.H * 0.93;
    bgx.strokeStyle = 'rgba(14,16,25,0.94)';
    bgx.lineWidth = p.w;
    bgx.beginPath();
    bgx.moveTo(p.x, p.top - G.H * 0.006);
    bgx.lineTo(p.x + p.lean * G.H * 0.09, bot);
    bgx.stroke();
    /* the last light catches one edge */
    bgx.strokeStyle = 'rgba(198,144,104,0.16)';
    bgx.lineWidth = Math.max(0.7, p.w * 0.28);
    bgx.beginPath();
    bgx.moveTo(p.x - p.w * 0.34, p.top - G.H * 0.006);
    bgx.lineTo(p.x - p.w * 0.34 + p.lean * G.H * 0.09, bot);
    bgx.stroke();
  }

  /* --- reeds --- */
  for (const rd of G.reeds) {
    const tipx = rd.x + rd.bend * rd.h * 0.75;
    const tipy = rd.y - rd.h;
    bgx.strokeStyle = rd.far ? 'rgba(15,17,26,0.8)' : 'rgba(7,9,15,0.97)';
    bgx.lineWidth = rd.w * (rd.far ? 0.75 : 1);
    bgx.beginPath();
    bgx.moveTo(rd.x, rd.y);
    bgx.quadraticCurveTo(rd.x + rd.bend * rd.h * 0.18, rd.y - rd.h * 0.55, tipx, tipy);
    bgx.stroke();
    if (rd.head) {
      bgx.fillStyle = rd.far ? 'rgba(30,28,38,0.75)' : 'rgba(12,13,20,0.95)';
      bgx.beginPath();
      bgx.ellipse(tipx, tipy + rd.h * 0.04, rd.w * 0.95, rd.h * 0.05, rd.bend * 0.5, 0, TAU);
      bgx.fill();
    }
  }
  /* the bed itself: the marsh goes to black at your feet */
  const base = bgx.createLinearGradient(0, G.H * 0.90, 0, G.H);
  base.addColorStop(0, 'rgba(6,8,13,0)');
  base.addColorStop(0.55, 'rgba(6,8,13,0.72)');
  base.addColorStop(1, 'rgba(4,6,10,0.98)');
  bgx.fillStyle = base;
  bgx.fillRect(0, G.H * 0.90, W, G.H * 0.10);

  /* a whisper of rim light along the top of the near bed */
  const rim = bgx.createLinearGradient(0, G.H * 0.78, 0, G.H * 0.88);
  rim.addColorStop(0, 'rgba(214,150,110,0.05)');
  rim.addColorStop(1, 'rgba(214,150,110,0)');
  bgx.fillStyle = rim;
  bgx.fillRect(0, G.H * 0.78, W, G.H * 0.10);

  /* tooth: a breath of grain so no gradient ever bands */
  if (NOISE) {
    bgx.globalAlpha = 0.4;
    bgx.fillStyle = bgx.createPattern(NOISE, 'repeat');
    bgx.fillRect(0, 0, W, H);
    bgx.globalAlpha = 1;
  }
}

let NOISE = null;
function makeNoise() {
  const n = document.createElement('canvas');
  n.width = n.height = 96;
  const g = n.getContext('2d');
  const im = g.createImageData(96, 96);
  const r = mulberry32(xmur3(SEED + '::tooth')());
  for (let i = 0; i < im.data.length; i += 4) {
    const v = r() < 0.5 ? 0 : 255;
    im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
    im.data[i + 3] = 4 + Math.floor(r() * 6);
  }
  g.putImageData(im, 0, 0);
  NOISE = n;
}

/* ============================================================================
   THE FLOCK
   real boids. the twist: a bird's neighbours are biased toward the pages it
   actually cites, so the internal structure of the murmuration IS the
   citation structure of the corpus.
   ========================================================================== */
const MODE = { FLY: 0, LAND: 1, PERCH: 2, LIFT: 3 };

const F = {
  b: [], head: null, next: null, cols: 0, rows: 0, cell: 0,
  roost: { x: 0, y: 0 }, target: { x: 0, y: 0 },
  from: { x: 0, y: 0 }, jump: 0, jumpDur: 1,
  hold: 0, t: 0, waves: [], nextWave: 3.4, swirl: 1,
  landing: [], chosen: -1, quality: 1
};

/* wing shapes, cached: 14 buckets of wing extension */
const WINGS = [];
(function () {
  for (let k = 0; k < 14; k++) {
    const ext = k / 13;
    const sp = 0.34 + 0.86 * ext;
    const p = new Path2D();
    /* a starling, swept: blunt head, long swept wings, a tail that barely
       clears them. drawn once per wingbeat bucket and reused. */
    p.moveTo(0.44, 0);
    p.quadraticCurveTo(0.30, -0.085, 0.10, -0.22 * sp);
    p.quadraticCurveTo(-0.16, -0.62 * sp, -0.44, -sp);
    p.quadraticCurveTo(-0.47, -0.94 * sp, -0.52, -0.90 * sp);
    p.quadraticCurveTo(-0.44, -0.44 * sp, -0.42, -0.12);
    p.lineTo(-0.58, -0.045);
    p.lineTo(-0.58, 0.045);
    p.lineTo(-0.42, 0.12);
    p.quadraticCurveTo(-0.44, 0.44 * sp, -0.52, 0.90 * sp);
    p.quadraticCurveTo(-0.47, 0.94 * sp, -0.44, sp);
    p.quadraticCurveTo(-0.16, 0.62 * sp, 0.10, 0.22 * sp);
    p.quadraticCurveTo(0.30, 0.085, 0.44, 0);
    p.closePath();
    p.ellipse(0.02, 0, 0.36, 0.112, 0, 0, TAU);
    WINGS.push(p);
  }
})();

const PERCH = (function () {
  const p = new Path2D();
  p.ellipse(-0.02, 0, 0.44, 0.33, -0.18, 0, TAU);        /* the body      */
  p.ellipse(0.36, -0.30, 0.215, 0.205, 0, 0, TAU);       /* the head      */
  p.moveTo(0.50, -0.36); p.lineTo(0.76, -0.27); p.lineTo(0.50, -0.20); p.closePath();
  p.moveTo(-0.24, 0.10); p.lineTo(-1.02, 0.52); p.lineTo(-0.94, 0.13); p.closePath();
  return p;
})();

function hsl2rgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = (t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [Math.round(f(h + 1 / 3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1 / 3) * 255)];
}

const LUMS = 16;
function makeFlock() {
  F.b = [];
  const maxIn = 57;
  for (const rec of S.pages) {
    const inb = S.inb.get(rec.slug) || 0;
    const hue = S.sections[rec.sec].hue + (rec.comm >= 0 ? ((rec.comm % 7) - 3) * 2.4 : 0);
    const dark = hsl2rgb(hue, 0.22, 0.04);
    const lite = hsl2rgb(hue, 0.095, 0.315);
    const pal = [];
    for (let k = 0; k < LUMS; k++) {
      const t = k / (LUMS - 1);
      pal.push(`rgb(${Math.round(lerp(dark[0], lite[0], t))},${Math.round(lerp(dark[1], lite[1], t))},${Math.round(lerp(dark[2], lite[2], t))})`);
    }
    const pc = hsl2rgb(hue, 0.075, 0.455);
    const perchCol = `rgb(${pc[0]},${pc[1]},${pc[2]})`;
    const a = R1() * TAU;
    F.b.push({
      rec, i: rec.i, kin: rec.kin, pal, perchCol,
      x: 0, y: 0, vx: Math.cos(a), vy: Math.sin(a),
      roll: 0.95 + R1() * 0.42, rollT: 1.02 + R1() * 0.34,
      wing: R1() * TAU, wspd: 8.4 + R1() * 3.4,
      sz: 0.93 + 0.20 * Math.sqrt(Math.min(1, inb / maxIn)),
      grain: R1(), lift: 0,
      spf: 0.82 + R1() * 0.38, rsf: 0.62 + R1() * 0.78, wph: R1() * TAU, wfr: 0.2 + R1() * 0.62,
      wamp: 0.5 + R1() * 1.3, wang: R1() * TAU,
      mode: MODE.FLY, t: 0, dur: 1,
      p0x: 0, p0y: 0, m0x: 0, m0y: 0, p1x: 0, p1y: 0, m1x: 0, m1y: 0,
      face: R1() < 0.5 ? -1 : 1, bob: R1() * TAU, band: 0,
      night: rec.prov ? rec.prov.night : 0,
      px: 0, py: 0, lx: 0, ly: 0, label: null
    });
  }
}

function seedPositions() {
  const cx = G.W * 0.5, cy = G.horizonY * 0.52;
  F.roost.x = cx; F.roost.y = cy; F.target.x = cx; F.target.y = cy;
  F.from.x = cx; F.from.y = cy; F.jump = 1;
  const R = 300 * G.s;
  /* the flock starts already sorted by its measured link-communities, the
     way a real roost arrives in family parties: the boids keep it that way */
  const nc = S.comms.length;
  const secto = [];
  for (let i = 0; i < nc; i++) secto.push(i);
  for (let i = secto.length - 1; i > 0; i--) { const j = (R1() * (i + 1)) | 0; const t = secto[i]; secto[i] = secto[j]; secto[j] = t; }
  for (const b of F.b) {
    const c = b.rec.comm;
    const base = c >= 0 ? (secto[c] / nc) * TAU : R1() * TAU;
    const a = base + (R1() - 0.5) * (TAU / nc) * 2.2;
    const rr = (0.28 + Math.sqrt(R1()) * 0.72) * R;
    b.x = cx + Math.cos(a) * rr * 1.35;
    b.y = cy + Math.sin(a) * rr * 0.66;
    const h = R1() * TAU;
    b.vx = Math.cos(h) * 90; b.vy = Math.sin(h) * 70;
    b.lx = b.x; b.ly = b.y;
  }
}

function wireYAt(x) {
  const sp = G.spans;
  for (const s of sp) {
    if (x >= s.a.x && x <= s.b.x) {
      const u = (x - s.a.x) / Math.max(1, s.b.x - s.a.x);
      const mid = (s.a.top + s.b.top) / 2 + s.sag * 2;
      const one = 1 - u;
      return one * one * s.a.top + 2 * one * u * mid + u * u * s.b.top;
    }
  }
  return G.wireY;
}

/* --------------------------------------------------------------- waves ---- */
/* Waves of agitation in real starling flocks travel as a dark band, faster
   than the flock itself (~13.4 m/s), copied bird to bird from the nearest
   handful of neighbours, and they damp as they cross. */
window.__wave = (f) => spawnWave(f || 1);
function spawnWave(force) {
  const a = R2() * TAU;
  const ax = Math.cos(a), ay = Math.sin(a) * 0.55;
  const n = Math.hypot(ax, ay);
  const w = {
    ax: ax / n, ay: ay / n,
    front: 0, speed: 0, width: 60 * G.s + R2() * 46 * G.s,
    amp: (force || 1) * (0.72 + R2() * 0.5), life: 0,
    side: R2() < 0.5 ? -1 : 1
  };
  let lo = 1e9, hi = -1e9, sp = 0;
  for (const b of F.b) {
    const pr = b.x * w.ax + b.y * w.ay;
    if (pr < lo) lo = pr;
    if (pr > hi) hi = pr;
    sp += Math.hypot(b.vx, b.vy);
  }
  sp /= Math.max(1, F.b.length);
  w.front = lo - w.width;
  w.hi = hi;
  w.span = hi - lo;
  w.speed = Math.max(120 * G.s, sp * D.waveMul);
  F.waves.push(w);
}

/* -------------------------------------------------------------- landing --- */
function perchSlots(count) {
  const panelOpen = !$('#panel').hidden;
  const wide = G.W > 980;
  let x0 = G.W * 0.055;
  let x1 = panelOpen && wide ? Math.min(G.W * 0.44, G.W - Math.min(G.W * 0.58, 780) - 46 * G.s) : G.W * 0.9;
  if (x1 - x0 < G.W * 0.18) { x0 = G.W * 0.05; x1 = G.W * 0.36; }
  const slots = [];
  const step = (x1 - x0) / (count + 1);
  const r = mulberry32(xmur3(SEED + '::perch' + count)());
  for (let i = 0; i < count; i++) {
    const x = x0 + step * (i + 1) + (r() - 0.5) * step * 0.24;
    slots.push({ x, y: wireYAt(x) });
  }
  return slots;
}

function landOn(slug) {
  const rec = S.bySlug.get(slug);
  if (!rec) return;
  /* who comes with it: the pages it cites first, then the pages citing it */
  const kinSlugs = [];
  const seen = new Set([slug]);
  for (const s of (S.cites.get(slug) || [])) { if (!seen.has(s) && S.bySlug.has(s)) { seen.add(s); kinSlugs.push([s, 'cites']); } }
  for (const s of (S.citedBy.get(slug) || [])) { if (!seen.has(s) && S.bySlug.has(s)) { seen.add(s); kinSlugs.push([s, 'cited by']); } }
  const take = kinSlugs.slice(0, D.perchKin);

  const party = [{ slug, rel: 'the page' }].concat(take.map(([s, rel]) => ({ slug: s, rel })));
  /* order them along the wire so the chosen one sits near the middle */
  const order = [];
  const mid = Math.floor(party.length / 2);
  order[mid] = party[0];
  let l = mid - 1, r = mid + 1;
  for (let i = 1; i < party.length; i++) {
    if (i % 2 === 1) { if (l >= 0) order[l--] = party[i]; else order[r++] = party[i]; }
    else { if (r < party.length) order[r++] = party[i]; else order[l--] = party[i]; }
  }
  const slots = perchSlots(order.length);

  releasePerched(order.map((o) => o.slug));

  F.chosen = S.bySlug.get(slug).i;
  const perches = $('#perches');
  order.forEach((o, i) => {
    const b = F.b[S.bySlug.get(o.slug).i];
    const s = slots[i];
    startLanding(b, s.x, s.y - b.sz * 7.6 * G.s * 1.30 * 0.95);
    b.rel = o.rel;
    b.chosen = (o.slug === slug);
    if (!b.label) {
      const el = document.createElement('div');
      el.className = 'perch';
      perches.appendChild(el);
      b.label = el;
    }
    const rc = b.rec;
    const who = rc.prov && rc.prov.topAuthor ? rc.prov.topAuthor : '';
    b.label.className = 'perch' + (b.chosen ? ' chosen' : '');
    b.row = i;
    const short = rc.title.length > 24 ? rc.title.slice(0, 23).replace(/[\s,.:;-]+$/, '') + '\u2026' : rc.title;
    b.label.innerHTML = `<div class="p-t">${esc(short)}</div><div class="p-r">${esc(b.chosen ? (who ? 'kept by ' + who : 'the page') : o.rel)}</div>`;
    b.label.classList.remove('on');
  });

  /* the whole flock banks and sweeps down toward the fence */
  const tx = slots.length ? (slots[0].x + slots[slots.length - 1].x) / 2 : G.W * 0.3;
  roostTo(clamp(tx + G.W * 0.06, G.W * 0.14, G.W * 0.8), G.horizonY * 0.66, 1.5);
  F.hold = 3.6;
  for (const b of F.b) if (b.mode === MODE.FLY) b.rollT = 0.16 + R1() * 0.2;
  spawnWave(1.25);
}

function startLanding(b, tx, ty) {
  b.mode = MODE.LAND;
  b.t = 0;
  const d = Math.hypot(tx - b.x, ty - b.y);
  b.dur = clamp(0.95 + d / (620 * G.s), 1.0, 2.5);
  b.p0x = b.x; b.p0y = b.y;
  b.p1x = tx; b.p1y = ty;
  const sp = Math.max(0.6, Math.hypot(b.vx, b.vy));
  b.m0x = (b.vx / sp) * d * 0.86;
  b.m0y = (b.vy / sp) * d * 0.86;
  /* arrive shallow, into the wind, dropping the last few inches */
  const dir = tx < b.x ? -1 : 1;
  b.m1x = dir * d * 0.42;
  b.m1y = -d * 0.10;
  b.face = -dir;
}

function releasePerched(keep) {
  const k = keep ? new Set(keep) : null;
  for (const b of F.b) {
    if (b.mode === MODE.FLY) continue;
    if (k && k.has(b.rec.slug)) continue;
    liftOff(b);
  }
}
function liftOff(b) {
  if (b.mode === MODE.FLY) return;
  b.mode = MODE.LIFT;
  b.lift = 0.62;
  const dir = b.face < 0 ? 1 : -1;
  b.vx = lerp(b.vx, dir * 1.5, 0.7);
  b.vy = lerp(b.vy, -1.5, 0.7);
  b.rollT = 0.2;
  if (b.label) { b.label.classList.remove('on'); }
}
function clearPerchLabels() {
  for (const b of F.b) {
    if (b.label && b.mode === MODE.FLY) {
      b.label.remove(); b.label = null;
    }
  }
}

function roostTo(x, y, dur) {
  F.from.x = F.roost.x; F.from.y = F.roost.y;
  F.target.x = x; F.target.y = y;
  F.jump = 0; F.jumpDur = dur || 2.2;
}

/* ----------------------------------------------------------------- step --- */
function visibleW() {
  const p = document.getElementById('panel');
  if (p && !p.hidden && G.W > 980) return Math.max(G.W * 0.34, G.W - Math.min(G.W * 0.58, 780));
  return G.W;
}

function buildGrid() {
  const cell = F.cell = 106 * G.s;
  const cols = F.cols = Math.max(1, Math.ceil(G.W / cell) + 2);
  const rows = F.rows = Math.max(1, Math.ceil(G.H / cell) + 2);
  if (!F.head || F.head.length !== cols * rows) F.head = new Int32Array(cols * rows);
  if (!F.next || F.next.length !== F.b.length) F.next = new Int32Array(F.b.length);
  F.head.fill(-1);
  for (let i = 0; i < F.b.length; i++) {
    const b = F.b[i];
    const cx = clamp(((b.x / cell) | 0) + 1, 0, cols - 1);
    const cy = clamp(((b.y / cell) | 0) + 1, 0, rows - 1);
    const c = cy * cols + cx;
    F.next[i] = F.head[c];
    F.head[c] = i;
  }
}

function step(dt) {
  F.t += dt;
  const s = G.s;

  /* the roost drifts on a slow figure, so the flock wheels over the marsh */
  if (F.hold > 0) F.hold -= dt;
  else {
    const t = F.t;
    const vw = visibleW();
    const cx = vw * (0.48 + 0.115 * Math.sin(t / D.roostPer * TAU) + 0.045 * Math.sin(t / (D.roostPer * 0.43) * TAU));
    const cy = G.horizonY * (0.58 + 0.15 * Math.sin(t / (D.roostPer * 0.61) * TAU + 1.1));
    F.target.x = lerp(F.target.x, cx, 1 - Math.pow(0.001, dt));
    F.target.y = lerp(F.target.y, cy, 1 - Math.pow(0.001, dt));
  }
  if (F.jump < 1) {
    F.jump = Math.min(1, F.jump + dt / F.jumpDur);
    const e = easeInOut(F.jump);
    F.roost.x = lerp(F.from.x, F.target.x, e);
    F.roost.y = lerp(F.from.y, F.target.y, e);
  } else {
    F.roost.x = lerp(F.roost.x, F.target.x, 1 - Math.pow(0.15, dt));
    F.roost.y = lerp(F.roost.y, F.target.y, 1 - Math.pow(0.15, dt));
  }
  F.swirl = Math.sin(F.t / D.swirlPer * TAU) * 0.9 + 0.25;

  /* agitation waves */
  F.nextWave -= dt;
  if (F.nextWave <= 0) {
    spawnWave(1);
    if (F.hold <= 0) {
      const vw = visibleW();
      roostTo(clamp(F.target.x + (R2() - 0.5) * vw * 0.42, vw * 0.2, vw * 0.86),
        clamp(F.target.y + (R2() - 0.5) * G.horizonY * 0.34, G.horizonY * 0.20, G.horizonY * 0.86), 2.6);
      F.hold = 2.6;
    }
    if (R2() < 0.34) setTimeout(() => { if (F.b.length) spawnWave(0.62); }, 260 + R2() * 260);
    F.nextWave = D.waveEvery + R2() * D.waveJitter;
  }
  for (let i = F.waves.length - 1; i >= 0; i--) {
    const w = F.waves[i];
    w.life += dt;
    w.front += w.speed * dt;
    w.amp *= Math.pow(0.55, dt);        /* damping, as measured in real flocks */
    if (w.front > w.hi + w.width || w.amp < 0.02) F.waves.splice(i, 1);
  }

  buildGrid();

  const RS = 53 * s, RS2 = RS * RS;
  const RN = 104 * s, RN2 = RN * RN;
  const maxSp = 2.85 * s * 60, minSp = 1.3 * s * 60;
  const maxF = 12 * s * 60;
  const cell = F.cell, cols = F.cols, rows = F.rows;
  const groundY = G.wireY - 30 * s;

  for (let i = 0; i < F.b.length; i++) {
    const b = F.b[i];

    if (b.mode === MODE.LAND) {
      b.t += dt / b.dur;
      const t = Math.min(1, b.t);
      const e = easeOut(t);
      const h00 = 2 * e * e * e - 3 * e * e + 1, h10 = e * e * e - 2 * e * e + e;
      const h01 = -2 * e * e * e + 3 * e * e, h11 = e * e * e - e * e;
      const nx = h00 * b.p0x + h10 * b.m0x + h01 * b.p1x + h11 * b.m1x;
      const ny = h00 * b.p0y + h10 * b.m0y + h01 * b.p1y + h11 * b.m1y;
      b.vx = (nx - b.x) / Math.max(dt, 1e-4); b.vy = (ny - b.y) / Math.max(dt, 1e-4);
      b.x = nx; b.y = ny;
      /* flare: wings open wide in the last third of the approach */
      b.rollT = t > 0.64 ? lerp(0.9, 0.06, (t - 0.64) / 0.36) : 0.7;
      b.wing += dt * b.wspd * (1 - t * 0.55);
      if (t >= 1) {
        b.mode = MODE.PERCH; b.x = b.p1x; b.y = b.p1y; b.vx = 0; b.vy = 0;
        if (b.label) b.label.classList.add('on');
      }
      b.roll += (b.rollT - b.roll) * Math.min(1, dt * 7);
      continue;
    }
    if (b.mode === MODE.PERCH) {
      b.bob += dt * 1.35;
      b.x = b.p1x + Math.sin(b.bob * 0.7) * 0.35 * s;
      b.y = b.p1y + Math.sin(b.bob) * 0.5 * s;
      b.roll += (0.98 - b.roll) * Math.min(1, dt * 4);
      b.wing = 0;
      continue;
    }

    let ax = 0, ay = 0;
    let sx = 0, sy = 0, alx = 0, aly = 0, cx = 0, cy = 0, cn = 0, sn = 0;
    const RSb = RS * b.rsf, RSb2 = RSb * RSb;

    const gx = clamp(((b.x / cell) | 0) + 1, 0, cols - 1);
    const gy = clamp(((b.y / cell) | 0) + 1, 0, rows - 1);
    for (let oy = -1; oy <= 1; oy++) {
      const yy = gy + oy; if (yy < 0 || yy >= rows) continue;
      for (let ox = -1; ox <= 1; ox++) {
        const xx = gx + ox; if (xx < 0 || xx >= cols) continue;
        let j = F.head[yy * cols + xx];
        while (j !== -1) {
          if (j !== i) {
            const o = F.b[j];
            if (o.mode === MODE.FLY || o.mode === MODE.LIFT) {
              const dx = o.x - b.x, dy = o.y - b.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < RN2 && d2 > 0.0001) {
                alx += o.vx; aly += o.vy; cx += o.x; cy += o.y; cn++;
                if (d2 < RSb2) {
                  const d = Math.sqrt(d2);
                  const push = Math.min(7, RSb / d - 1) / d;
                  sx -= dx * push; sy -= dy * push;
                  sn++;
                }
              }
            }
          }
          j = F.next[j];
        }
      }
    }
    if (sn) { ax += sx * 170 * s; ay += sy * 170 * s; }
    /* a private wander: no two starlings hold the same line */
    const wv = Math.sin(F.t * b.wfr + b.wph) * 58 * s * b.wamp;
    ax += Math.cos(b.wang) * wv;
    ay += Math.sin(b.wang) * wv * 0.7;
    if (cn) {
      alx /= cn; aly /= cn; cx /= cn; cy /= cn;
      ax += (alx - b.vx) * 0.78; ay += (aly - b.vy) * 0.78;
      ax += (cx - b.x) * 0.42; ay += (cy - b.y) * 0.42;
    }

    /* ---- the citation bias: fly with the pages you cite ---- */
    const kin = b.kin;
    if (kin.length) {
      let kx = 0, ky = 0, kvx = 0, kvy = 0, kw = 0;
      for (let q = 0; q < kin.length; q++) {
        const o = F.b[kin[q].i];
        const w = kin[q].w;
        kx += o.x * w; ky += o.y * w; kvx += o.vx * w; kvy += o.vy * w; kw += w;
      }
      kx /= kw; ky /= kw; kvx /= kw; kvy /= kw;
      const dx = kx - b.x, dy = ky - b.y;
      const d = Math.hypot(dx, dy) || 1;
      const pull = D.kinBias * 60 * 60 * s * Math.min(1, d / (55 * s));
      ax += (dx / d) * pull; ay += (dy / d) * pull;
      ax += (kvx - b.vx) * 0.42; ay += (kvy - b.vy) * 0.42;
    }

    /* ---- the roost: a soft bowl the flock never quite leaves ---- */
    const rx = b.x - F.roost.x, ry = (b.y - F.roost.y) * 2.15;
    const rd = Math.hypot(rx, ry) || 1;
    const Rr = 385 * s;
    ax -= (rx / rd) * Math.min(1.8, rd / Rr) * 330 * s;
    ay -= (ry / rd) * Math.min(1.8, rd / Rr) * 230 * s;
    /* damp only the radial swing, so the flock settles on its roost
       while the wheel keeps turning */
    const vr = (b.vx * rx + b.vy * ry) / rd;
    ax -= (rx / rd) * vr * 1.6;
    ay -= (ry / rd) * vr * 1.6;
    if (rd > Rr) {
      const over = (rd - Rr) / Rr;
      const k = Math.min(11, 1.1 + over * 11) * 62 * s;
      ax -= (rx / rd) * k; ay -= (ry / rd) * k * 0.72;
    }
    /* wheel */
    const rr = Math.min(1.3, rd / Rr);
    ax += (-ry / rd) * rr * F.swirl * 62 * s;
    ay += (rx / rd) * rr * F.swirl * 30 * s;

    /* ---- waves of agitation ----
       a band of birds banks together, showing the whole of the wing.
       the band travels faster than the flock and damps as it crosses. */
    let band = 0;
    for (let q = 0; q < F.waves.length; q++) {
      const w = F.waves[q];
      const pr = b.x * w.ax + b.y * w.ay;
      const dd = pr - w.front;
      if (dd > -w.width && dd < w.width) {
        let k = Math.cos((dd / w.width) * 1.5708);
        k = Math.min(1, k * k * w.amp);
        if (k > band) band = k;
        b.rollT = Math.min(b.rollT, lerp(0.95, 0.02, k));
        ax += -w.ay * w.side * k * 300 * s;
        ay += w.ax * w.side * k * 175 * s;
        ax += w.ax * k * 52 * s; ay += w.ay * k * 52 * s;
      }
    }
    b.band += (band - b.band) * Math.min(1, dt * 11);

    /* ---- the marsh below ---- */
    if (b.y > groundY) {
      const over = (b.y - groundY) / (90 * s);
      ay -= Math.min(6, over * over * 5) * 62 * s;
    }
    if (b.y < 40 * s) ay += ((40 * s - b.y) / (40 * s)) * 150 * s;
    if (b.x < -60 * s) ax += 120 * s;
    if (b.x > G.W + 60 * s) ax -= 120 * s;

    if (b.mode === MODE.LIFT) {
      b.lift -= dt;
      ay -= 300 * s;
      ax += (b.face < 0 ? 1 : -1) * 60 * s;
      if (b.lift <= 0) { b.mode = MODE.FLY; if (b.label) { b.label.remove(); b.label = null; } }
    }

    /* clamp the steering so nothing ever snaps */
    const af = Math.hypot(ax, ay);
    if (af > maxF) { ax = ax / af * maxF; ay = ay / af * maxF; }

    b.vx += ax * dt; b.vy += ay * dt;
    const sp = Math.hypot(b.vx, b.vy);
    const mx = maxSp * b.spf, mn = minSp * b.spf;
    if (sp > mx) { b.vx = b.vx / sp * mx; b.vy = b.vy / sp * mx; }
    else if (sp < mn && sp > 0.001) { b.vx = b.vx / sp * mn; b.vy = b.vy / sp * mn; }
    b.lx = b.x; b.ly = b.y;
    b.x += b.vx * dt; b.y += b.vy * dt;

    /* roll relaxes back to a lazy, mostly edge-on attitude */
    b.rollT += (1.02 + b.grain * 0.34 - b.rollT) * Math.min(1, dt * 1.5);
    b.roll += (b.rollT - b.roll) * Math.min(1, dt * 9);
    b.wing += dt * b.wspd * (0.7 + 0.5 * (1 - Math.abs(Math.cos(b.roll))));
  }
}

/* ============================================================================
   DRAWING THE FLOCK
   ========================================================================== */
let hoverI = -1, hoverAmt = 0, hoverKin = null;

function bgLum(y) {
  const h = G.horizonY, H = G.H;
  if (y <= h) {
    const t = clamp(y / h, 0, 1);
    return 0.10 + Math.pow(t, 2.5) * 0.82;
  }
  const t = clamp((y - h) / Math.max(1, H - h), 0, 1);
  return 0.52 * Math.pow(1 - t, 1.9) + 0.03;
}

let kinStatT = 0;
function kinStat() {
  const bs = F.b;
  const n = bs.length;
  let kd = 0, kn = 0;
  for (const [a, c] of S.graph.edges) {
    const ra = S.bySlug.get(a), rc = S.bySlug.get(c);
    if (!ra || !rc) continue;
    const p = bs[ra.i], q = bs[rc.i];
    kd += Math.hypot(p.x - q.x, p.y - q.y); kn++;
  }
  let rd = 0, rn = 0;
  const rr = mulberry32(xmur3(SEED + '::stat')());
  for (let k = 0; k < 900; k++) {
    const i = (rr() * n) | 0, j = (rr() * n) | 0;
    if (i === j) continue;
    rd += Math.hypot(bs[i].x - bs[j].x, bs[i].y - bs[j].y); rn++;
  }
  if (!kn || !rn) return null;
  return (rd / rn) / (kd / kn);
}

function draw() {
  const { W, H, dpr, s } = G;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(bg, 0, 0);

  const size0 = 7.6 * s;

  /* ---- the flock's own smear, half-resolution, gently fading ---- */
  if (!still && F.quality > 0) {
    trx.setTransform(1, 0, 0, 1, 0, 0);
    trx.globalCompositeOperation = 'destination-out';
    trx.fillStyle = 'rgba(0,0,0,0.17)';
    trx.fillRect(0, 0, tr.width, tr.height);
    trx.globalCompositeOperation = 'source-over';
    trx.setTransform(dpr * 0.5, 0, 0, dpr * 0.5, 0, 0);
    trx.strokeStyle = 'rgba(19,21,33,0.22)';
    trx.lineWidth = 1.9 * s;
    trx.lineCap = 'round';
    trx.beginPath();
    for (let i = 0; i < F.b.length; i++) {
      const b = F.b[i];
      if (b.mode === MODE.PERCH) continue;
      trx.moveTo(b.lx, b.ly);
      trx.lineTo(b.x, b.y);
    }
    trx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 0.42;
    ctx.drawImage(tr, 0, 0, cv.width, cv.height);
    ctx.globalAlpha = 1;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  /* ---- the water keeps an imperfect copy ---- */
  const hz = G.horizonY;
  const wob = Math.sin(F.t * 1.6);
  ctx.beginPath();
  let any = false;
  for (let i = 0; i < F.b.length; i++) {
    if ((i % 3) === 1) continue;                     /* the chop loses some  */
    const b = F.b[i];
    if (b.y >= hz - 4) continue;
    const ry = hz + (hz - b.y) * 0.30;
    const fade = 1 - (ry - hz) / (H - hz) / 0.78;
    if (fade <= 0.02) continue;
    const rx = b.x + Math.sin(ry * 0.045 + F.t * 1.9 + b.grain * 6) * 2.6 * s + wob * 1.2 * s;
    const w = size0 * b.sz * (0.46 + 0.58 * Math.abs(Math.cos(b.roll))) * 1.3;
    ctx.moveTo(rx - w, ry);
    ctx.lineTo(rx + w, ry + 0.7 * s);
    ctx.lineTo(rx - w * 0.4, ry + 1.7 * s);
    any = true;
  }
  if (any) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'rgb(12,11,18)';
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /* ---- threads to the pages this one cites ---- */
  if (hoverI >= 0 && hoverAmt > 0.02 && hoverKin) {
    const hb = F.b[hoverI];
    ctx.strokeStyle = `rgba(232,178,115,${0.16 * hoverAmt})`;
    ctx.lineWidth = Math.max(0.6, 0.75 * s);
    ctx.beginPath();
    for (const k of hb.kin) {
      const o = F.b[k.i];
      ctx.moveTo(hb.x, hb.y);
      const mx = (hb.x + o.x) / 2, my = (hb.y + o.y) / 2 - Math.hypot(o.x - hb.x, o.y - hb.y) * 0.10;
      ctx.quadraticCurveTo(mx, my, o.x, o.y);
    }
    ctx.stroke();
  }

  /* ---- the birds ---- */
  for (let i = 0; i < F.b.length; i++) {
    const b = F.b[i];
    const perched = b.mode === MODE.PERCH;
    const cr = Math.abs(Math.cos(b.roll));
    const af = 0.34 + 0.66 * cr;
    const ext = perched ? 0.06 : 0.34 + 0.66 * Math.abs(Math.sin(b.wing));
    const wi = clamp((ext * 13) | 0, 0, 13);

    const bl = bgLum(b.y);
    let L;
    if (bl > 0.38) L = clamp(0.17 - (bl - 0.38) * 0.30, 0, 1) * (1 - 0.48 * af);
    else L = clamp(0.20 + (0.38 - bl) * 0.78 + 0.12 * af, 0, 1);
    if (b.band > 0.01) L = clamp(L + (bl > 0.38 ? -0.52 : 0.30) * b.band, 0, 1);

    if (hoverKin && hoverKin.has(i)) L = clamp(L + 0.20, 0, 1);
    if (i === hoverI) L = clamp(L + 0.26, 0, 1);
    const pi = clamp(Math.round(L * (LUMS - 1)), 0, LUMS - 1);

    let ang, sq;
    if (perched) { ang = b.face < 0 ? Math.PI : 0; sq = 0.94; }
    else { ang = Math.atan2(b.vy, b.vx); sq = 0.30 + 0.70 * af; }

    let sz = size0 * b.sz * (1 + 0.26 * b.band);
    if (i === hoverI) sz *= 1 + 0.5 * hoverAmt;
    if (perched) sz *= 1.30;
    if (b.chosen && perched) sz *= 1.16;

    const c = Math.cos(ang), sn = Math.sin(ang);
    if (perched) {
      /* a bird on a wire at dusk: dark ground behind it, last light on top */
      const f = b.face < 0 ? -1 : 1;
      const S1 = sz * 1.16;
      ctx.setTransform(dpr * f * S1, 0, 0, dpr * S1, dpr * b.x, dpr * (b.y + 0.8));
      ctx.fillStyle = 'rgba(4,6,11,0.94)';
      ctx.fill(PERCH);
      ctx.setTransform(dpr * f * sz, 0, 0, dpr * sz, dpr * b.x, dpr * b.y);
      ctx.fillStyle = b.chosen ? '#efbe80' : b.perchCol;
      ctx.fill(PERCH);
      /* two thin legs down to the wire */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.strokeStyle = 'rgba(9,11,17,0.9)';
      ctx.lineWidth = Math.max(0.7, sz * 0.11);
      ctx.beginPath();
      ctx.moveTo(b.x + f * sz * 0.10, b.y + sz * 0.22); ctx.lineTo(b.x + f * sz * 0.06, b.y + sz * 0.95);
      ctx.moveTo(b.x - f * sz * 0.10, b.y + sz * 0.22); ctx.lineTo(b.x - f * sz * 0.13, b.y + sz * 0.95);
      ctx.stroke();
    } else {
      ctx.setTransform(dpr * c * sz, dpr * sn * sz, dpr * -sn * sz * sq, dpr * c * sz * sq, dpr * b.x, dpr * b.y);
      ctx.fillStyle = b.pal[pi];
      ctx.fill(WINGS[wi]);
    }
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  /* ---- the fifteen night edits carry a small lamp ---- */
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < F.b.length; i++) {
    const b = F.b[i];
    if (!b.night) continue;
    const pulse = 0.42 + 0.30 * Math.sin(F.t * 1.25 + b.grain * 6.2);
    const r = (0.62 + 0.20 * b.night) * s;
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r * 2.6);
    g.addColorStop(0, `rgba(255,206,140,${0.62 * pulse})`);
    g.addColorStop(1, 'rgba(255,190,120,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, r * 2.6, 0, TAU);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';

  /* ---- perch labels ride with their birds ---- */
  for (let i = 0; i < F.b.length; i++) {
    const b = F.b[i];
    if (!b.label) continue;
    const dy = (b.row % 2 === 0) ? -32 : -64;
    b.label.style.transform = `translate3d(${Math.round(b.x)}px,${Math.round(b.y + dy)}px,0) translate(-50%,0)`;
  }
}

/* ---------------------------------------------------------------- loop ---- */
let lastT = 0, acc = 0, frames = 0, fsum = 0, gap = 0, lastT2 = 0;
window.__mm = { fps: 0, ms: 0, frame: 0, birds: 0 };

function frame(now) {
  const t0 = performance.now();
  let dt = (now - lastT) / 1000;
  lastT = now;
  if (!(dt > 0)) dt = 1 / 60;
  if (dt > 0.25) dt = 0.25;
  acc += dt;
  let guard = 0;
  while (acc >= 1 / 60 && guard < 4) { step(1 / 60); acc -= 1 / 60; guard++; }
  if (guard === 4) acc = 0;

  if (now - kinStatT > 2200) {
    kinStatT = now;
    const r = kinStat();
    const el = document.getElementById('kinstat');
    if (el && r) el.innerHTML = `Right now, pages that cite each other are flying <b>${r.toFixed(1)}\u00d7</b> closer together than pages that do not.`;
  }
  if (hoverI >= 0) hoverAmt = Math.min(1, hoverAmt + dt * 5);
  else hoverAmt = Math.max(0, hoverAmt - dt * 5);

  draw();

  const t1 = performance.now();
  fsum += t1 - t0; frames++;
  gap += (lastT2 ? now - lastT2 : 16.7); lastT2 = now;
  if (frames >= 30) {
    window.__mm.ms = +(fsum / frames).toFixed(2);
    window.__mm.frame = +(gap / frames).toFixed(2);
    window.__mm.fps = +(1000 / Math.max(0.01, gap / frames)).toFixed(1);
    window.__mm.birds = F.b.length;
    if (window.__mm.ms > 26 && F.quality > 0) F.quality = 0;
    frames = 0; fsum = 0; gap = 0;
  }
  requestAnimationFrame(frame);
}

/* --------------------------------------------------- a resting flock ------ */
function restArrangement() {
  const rows = 7;
  const top = G.H * 0.375, bot = G.H * 0.785;
  const x0 = G.W * 0.055, x1 = G.W * 0.945;
  const groups = [];
  for (const sec of S.sections) {
    const list = sec.slugs.filter((sl) => S.bySlug.has(sl));
    if (list.length) groups.push({ sec, list });
  }
  const total = S.pages.length + groups.length * 2;
  const perRow = Math.ceil(total / rows);
  let row = 0, col = 0;
  const placed = new Set();
  const labels = [];
  const rowY = (r) => top + (bot - top) * (r / (rows - 1));
  const sagAt = (r, u) => rowY(r) + Math.sin(u * Math.PI) * G.H * 0.012;

  const lastLabelX = new Array(rows).fill(-1e9);
  for (const g of groups) {
    if (col + 6 > perRow) { row = Math.min(rows - 1, row + 1); col = 0; }
    const lx = x0 + (x1 - x0) * (col / perRow);
    if (lx - lastLabelX[row] > 168) { labels.push({ row, col, sec: g.sec, n: g.list.length }); lastLabelX[row] = lx; }
    col += 3;
    for (const sl of g.list) {
      const rec = S.bySlug.get(sl);
      if (!rec || placed.has(sl)) continue;
      placed.add(sl);
      if (col >= perRow) { row = Math.min(rows - 1, row + 1); col = 0; }
      const u = col / perRow;
      const b = F.b[rec.i];
      b.mode = MODE.PERCH;
      b.p1x = x0 + (x1 - x0) * u + (b.grain - 0.5) * 3;
      b.p1y = sagAt(row, u) - 4.2 * G.s;
      b.x = b.p1x; b.y = b.p1y; b.lx = b.x; b.ly = b.y;
      b.vx = 0; b.vy = 0; b.roll = 0.98; b.face = b.grain < 0.5 ? -1 : 1;
      col++;
    }
    col += 2;
  }
  /* the wires they rest on, and the section names */
  bgx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
  bgx.lineCap = 'round';
  for (let r = 0; r < rows; r++) {
    bgx.strokeStyle = 'rgba(16,18,28,0.5)';
    bgx.lineWidth = Math.max(0.8, G.s);
    bgx.beginPath();
    bgx.moveTo(x0 - G.W * 0.05, rowY(r));
    for (let k = 0; k <= 24; k++) {
      const u = k / 24;
      bgx.lineTo(x0 + (x1 - x0) * u, sagAt(r, u));
    }
    bgx.lineTo(x1 + G.W * 0.05, rowY(r));
    bgx.stroke();
  }
  const host = $('#perches');
  host.innerHTML = '';
  for (const L of labels) {
    const el = document.createElement('div');
    el.className = 'perch on restlabel';
    el.innerHTML = `<div class="p-r">${esc(L.sec.label)} · ${L.n}</div>`;
    const u = L.col / perRow;
    el.style.transform = `translate3d(${Math.round(x0 + (x1 - x0) * u)}px,${Math.round(sagAt(L.row, u) - 26)}px,0)`;
    el.style.textAlign = 'left';
    host.appendChild(el);
  }
}

/* ============================================================================
   READING
   every block kind the corpus contains, rendered for pleasure.
   html fields arrive already escaped: they go in as they are.
   ========================================================================== */
let UID = 0;

const KW_JS = new Set(('await async const let var function return if else for while new class extends implements import export from default try catch finally throw typeof instanceof null undefined true false this super switch case break continue delete in of do yield static interface type enum namespace declare readonly public private protected as satisfies keyof').split(' '));
const KW_GQL = new Set('query mutation subscription fragment on type input enum interface schema scalar union extend implements true false null'.split(' '));
const KW_SH = new Set('if then else fi for do done while case esac function export source cd echo exit return sudo npx npm yarn pnpm docker git curl set unset local'.split(' '));

function hl(code, lang) {
  const l = String(lang || '').toLowerCase();
  const fam = /^(js|jsx|ts|tsx|javascript|typescript|mjs|cjs)$/.test(l) ? 'js'
    : l === 'json' ? 'json'
    : /^(graphql|gql)$/.test(l) ? 'gql'
    : /^(bash|sh|shell|zsh|console|env|dockerfile|yml|yaml|http|diff|ini|toml)$/.test(l) ? 'sh'
    : 'plain';
  if (fam === 'plain') return esc(code);
  let re, out = '', last = 0;
  if (fam === 'js' || fam === 'gql') {
    re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)|(`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")|(\b\d[\w.]*)|([A-Za-z_$][\w$]*)(\s*\()|([A-Za-z_$][\w$]*)/g;
  } else if (fam === 'json') {
    re = /(\/\/[^\n]*)|("(?:\\.|[^"\\])*")(\s*:)?|(\b-?\d[\w.eE+-]*)|\b(true|false|null)\b/g;
  } else {
    re = /(#[^\n]*)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")|(\s--?[A-Za-z][\w-]*)|(\b\d+(?:\.\d+)*\b)|([A-Za-z_][\w-]*)/g;
  }
  let m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    last = re.lastIndex;
    if (fam === 'json') {
      if (m[1]) out += `<span class="tk-c">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="${m[3] ? 'tk-a' : 'tk-s'}">${esc(m[2])}</span>` + (m[3] ? `<span class="tk-p">${esc(m[3])}</span>` : '');
      else if (m[4]) out += `<span class="tk-n">${esc(m[4])}</span>`;
      else if (m[5]) out += `<span class="tk-k">${esc(m[5])}</span>`;
      else out += esc(m[0]);
    } else if (fam === 'sh') {
      if (m[1]) out += `<span class="tk-c">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="tk-s">${esc(m[2])}</span>`;
      else if (m[3]) out += `<span class="tk-a">${esc(m[3])}</span>`;
      else if (m[4]) out += `<span class="tk-n">${esc(m[4])}</span>`;
      else if (m[5]) out += KW_SH.has(m[5]) ? `<span class="tk-k">${esc(m[5])}</span>` : esc(m[5]);
      else out += esc(m[0]);
    } else {
      const KW = fam === 'gql' ? KW_GQL : KW_JS;
      if (m[1]) out += `<span class="tk-c">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="tk-s">${esc(m[2])}</span>`;
      else if (m[3]) out += `<span class="tk-n">${esc(m[3])}</span>`;
      else if (m[4]) out += (KW.has(m[4]) ? `<span class="tk-k">${esc(m[4])}</span>` : `<span class="tk-f">${esc(m[4])}</span>`) + esc(m[5]);
      else if (m[6]) out += KW.has(m[6]) ? `<span class="tk-k">${esc(m[6])}</span>` : esc(m[6]);
      else out += esc(m[0]);
    }
  }
  out += esc(code.slice(last));
  return out;
}

const ADM_ICON = {
  note: '<path d="M4 3h10l6 6v12H4z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M14 3v6h6" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  info: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M12 11v6M12 7.6v.9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  tip: '<path d="M12 3a6 6 0 0 0-3.2 11.1V17h6.4v-2.9A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M9.6 20h4.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  caution: '<path d="M12 3.6 21.2 20H2.8z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 9.5v5M12 17.1v.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  warning: '<path d="M12 3.6 21.2 20H2.8z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 9.5v5M12 17.1v.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  danger: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8.6 8.6l6.8 6.8M15.4 8.6l-6.8 6.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  prerequisites: '<path d="M4.5 6.5h15M4.5 12h15M4.5 17.5h15" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="6.5" r="2.2" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="15" cy="17.5" r="2.2" fill="none" stroke="currentColor" stroke-width="1.3"/>',
  strapi: '<path d="M4 4h16v16H4z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M4 9.5h10.5V20M9.5 4v10.5H20" fill="none" stroke="currentColor" stroke-width="1.3"/>',
  callout: '<path d="M3.5 5.5h17v11h-9l-5 4v-4h-3z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>'
};
function admIcon(kind) {
  const d = ADM_ICON[kind] || ADM_ICON.note;
  return `<svg class="adm-i" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
}

function listItem(it) {
  if (typeof it === 'string') return `<li>${it}</li>`;
  if (it && typeof it === 'object') {
    return `<li>${it.html || ''}${it.blocks ? renderBlocks(it.blocks) : ''}</li>`;
  }
  return '<li></li>';
}

function renderBlocks(blocks) {
  if (!blocks || !blocks.length) return '';
  let out = '';
  for (const b of blocks) out += renderBlock(b);
  return out;
}

function renderBlock(b) {
  switch (b.t) {
    case 'p': return `<p>${b.html}</p>`;
    case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      return `<${b.t} id="${esc(b.id || '')}">${esc(b.text)}</${b.t}>`;
    case 'tldr': return `<div class="tldr">${b.html}</div>`;
    case 'hr': return '<hr>';
    case 'ul': return `<ul${b.loose ? ' class="loose"' : ''}>${b.items.map(listItem).join('')}</ul>`;
    case 'ol': return `<ol${b.start && b.start !== 1 ? ` start="${+b.start}"` : ''}>${b.items.map(listItem).join('')}</ol>`;
    case 'code': {
      const cap = b.title ? `<span class="cap">${esc(b.title)}</span>` : '';
      const lang = b.lang ? `<span class="lang">${esc(b.lang)}</span>` : '<span class="lang"></span>';
      return `<figure class="codefig${b.title ? '' : ''}">
        <figcaption>${lang}${cap}<button class="copy" type="button" data-copy>copy</button></figcaption>
        <pre><code class="lang-${esc(b.lang || 'text')}">${hl(b.code, b.lang)}</code></pre></figure>`;
    }
    case 'admonition': {
      const k = b.kind || 'note';
      const title = b.title || k;
      return `<div class="adm adm-${esc(k)}">${admIcon(k)}<b class="adm-t">${esc(title)}</b>${renderBlocks(b.blocks)}</div>`;
    }
    case 'table': {
      const al = b.align || [];
      const head = (b.head || []).map((h, i) => `<th${al[i] ? ` style="text-align:${esc(al[i])}"` : ''}>${h}</th>`).join('');
      const rows = (b.rows || []).map((r) => `<tr>${r.map((c, i) => `<td${al[i] ? ` style="text-align:${esc(al[i])}"` : ''}>${c}</td>`).join('')}</tr>`).join('');
      return `<div class="tblwrap"><table>${head ? `<thead><tr>${head}</tr></thead>` : ''}<tbody>${rows}</tbody></table></div>`;
    }
    case 'tabs': {
      const id = 'tb' + (++UID);
      const btns = b.tabs.map((t, i) => `<button class="tab" type="button" role="tab" aria-selected="${i === 0}" data-tab="${id}-${i}">${esc(t.label)}</button>`).join('');
      const panes = b.tabs.map((t, i) => `<div class="tabpanel" role="tabpanel" id="${id}-${i}"${i === 0 ? '' : ' hidden'}>${renderBlocks(t.blocks)}</div>`).join('');
      return `<div class="tabs" data-group="${esc(b.groupId || '')}"><div class="tablist" role="tablist">${btns}</div>${panes}</div>`;
    }
    case 'details':
      return `<details${b.id ? ` id="${esc(b.id)}"` : ''}><summary>${esc(b.summary || 'More')}</summary><div class="detbody">${renderBlocks(b.blocks)}</div></details>`;
    case 'img': {
      const src = b.dark || b.light || '';
      return `<figure class="fig" data-alt="${esc(b.alt || 'illustration')}">
        <img src="${esc(src)}" alt="${esc(b.alt || '')}" loading="lazy" decoding="async">
        ${b.caption ? `<figcaption>${b.caption}</figcaption>` : ''}</figure>`;
    }
    case 'cards':
      return `<div class="cards">${(b.items || []).map((c) => `<a class="card" href="${esc(c.link || '#')}"><b>${esc(c.title || '')}</b><span>${esc(c.desc || '')}</span><span class="go">go →</span></a>`).join('')}</div>`;
    case 'badge':
      return `<span class="bdg bdg-${esc(b.kind || '')}"${b.tooltip ? ` title="${esc(b.tooltip)}"` : ''}>${esc(b.label || b.kind || '')}</span>`;
    case 'columns':
      return `<div class="cols">${(b.cols || []).map((c) => `<div>${renderBlocks(c)}</div>`).join('')}</div>`;
    case 'endpoint': {
      const m = (b.method || '').toUpperCase();
      const head = `<div class="ep-head"><div class="ep-line">${m ? `<span class="ep-m ${esc(m)}">${esc(m)}</span>` : ''}${b.path ? `<span class="ep-p">${esc(b.path)}</span>` : ''}</div>${b.title ? `<p class="ep-t">${esc(b.title)}</p>` : ''}${b.description ? `<p class="ep-d">${b.description}</p>` : ''}</div>`;
      let body = '';
      if (b.params && b.params.length) {
        body += `<div class="ep-sec"><h5>${esc(b.paramTitle || 'Parameters')}</h5><dl class="params">${b.params.map((p) => `<div class="param"><dt>${esc(p.name)}${p.required ? '<span class="req">*</span>' : ''}<span class="ty">${esc(p.type || '')}</span></dt><dd>${p.desc || ''}</dd></div>`).join('')}</dl></div>`;
      }
      if (b.codeTabs && b.codeTabs.length) {
        body += `<div class="ep-sec">${renderBlock({ t: 'tabs', groupId: 'ep', tabs: b.codeTabs.map((c) => ({ label: c.label, blocks: [{ t: 'code', lang: c.lang, title: '', code: c.code }] })) })}</div>`;
      }
      if (b.responses && b.responses.length) {
        body += `<div class="ep-sec"><h5>Response</h5>${b.responses.map((r) => `<div class="ep-res-head"><span class="ep-st">${esc(String(r.status || ''))}</span><span class="ep-stt">${esc(r.statusText || '')}</span></div>${renderBlock({ t: 'code', lang: r.lang || 'json', title: '', code: r.body || '' })}`).join('')}</div>`;
      }
      return `<div class="ep">${head}${body}</div>`;
    }
    default:
      return b.html ? `<div>${b.html}</div>` : '';
  }
}

/* ------------------------------------------------- the page, assembled ---- */
function linkList(slugs, cap) {
  if (!slugs || !slugs.length) return '<p class="none">nothing yet</p>';
  const shown = slugs.slice(0, cap);
  const more = slugs.length - shown.length;
  return `<ul>${shown.map((s) => {
    const r = S.bySlug.get(s);
    return `<li><a href="#${esc(s)}">${esc(r ? r.title : s)}</a></li>`;
  }).join('')}</ul>${more > 0 ? `<p class="none">and ${more} more</p>` : ''}`;
}

function colophon(rec) {
  const v = rec.prov;
  const slug = rec.slug;
  const inb = S.inb.get(slug) || 0, outb = S.outb.get(slug) || 0;
  let s = '';
  if (v) {
    const hands = v.authors.length;
    s += `<p>Born <b>${prettyDate(v.first)}</b>. Last touched <b>${prettyDate(v.last)}</b>. `;
    s += `Tended for <b>${commas(v.careDays)} days</b> by ${numWord(hands)} hand${hands === 1 ? '' : 's'}`;
    if (v.topAuthor) s += `, <em>${esc(v.topAuthor)}</em> most of all`;
    s += `, across ${numWord(v.commits)} commit${v.commits === 1 ? '' : 's'}.</p>`;
    if (v.careDays > S.totals.careMed) {
      s += `<p>That is longer than the median page of this corpus, which has been tended ${commas(S.totals.careMed)} days.</p>`;
    } else if (v.careDays < S.totals.careMed) {
      s += `<p>The median page of this corpus has been tended ${commas(S.totals.careMed)} days; this one, fewer.</p>`;
    }
    if (v.night > 0) {
      s += `<p class="colo-night">${numWord(v.night).replace(/^./, (c) => c.toUpperCase())} of those edit${v.night === 1 ? ' was' : 's were'} made between 22h and 6h.</p>`;
    }
  }
  const w = S.words.get(slug), cd = S.codes.get(slug);
  s += `<p>${commas(w || 0)} words${cd ? `, ${numWord(cd)} code block${cd === 1 ? '' : 's'}` : ', no code'}. `;
  s += outb ? `It cites ${numWord(outb)} page${outb === 1 ? '' : 's'}. ` : 'It cites nothing. ';
  s += inb ? `${numWord(inb).replace(/^./, (c) => c.toUpperCase())} page${inb === 1 ? '' : 's'} cite${inb === 1 ? 's' : ''} it.` : 'Nothing cites it yet, so it flies on the edge of the flock.';
  s += '</p>';
  if (rec.comm >= 0) {
    const c = S.comms[rec.comm];
    const hub = S.bySlug.get(c.hub);
    s += `<p>It belongs to a measured link-community of ${commas(c.size)} pages gathered around <a href="#${esc(c.hub)}">${esc(hub ? hub.title : c.hub)}</a>; ${Math.round(c.purity * 100)}% of that cluster is filed under <em>${esc(c.dominant)}</em>.</p>`;
  }
  const handChips = v ? `<div class="hands">${v.authors.map((a, i) => `<span class="hand${i === 0 ? ' top' : ''}">${esc(a)}</span>`).join('')}</div>` : '';
  const idx = rec.i;
  const prev = idx > 0 ? S.pages[idx - 1] : null;
  const next = idx < S.pages.length - 1 ? S.pages[idx + 1] : null;
  return `<footer class="colophon">
    <p class="colo-h">what the history says</p>
    <div class="colo-body">${s}</div>
    ${handChips}
    <div class="neigh">
      <div><h4>It cites</h4>${linkList(S.cites.get(slug), 12)}</div>
      <div><h4>Cited by</h4>${linkList(S.citedBy.get(slug), 12)}</div>
    </div>
    <div class="flowline">
      ${prev ? `<a href="#${esc(prev.slug)}"><small>upwind</small><b>${esc(prev.title)}</b></a>` : '<span></span>'}
      ${next ? `<a class="r" href="#${esc(next.slug)}"><small>downwind</small><b>${esc(next.title)}</b></a>` : '<span></span>'}
    </div>
  </footer>`;
}

function renderPage(rec) {
  const p = rec.p;
  const sec = S.sections[rec.sec];
  const inb = S.inb.get(rec.slug) || 0, outb = S.outb.get(rec.slug) || 0;
  const v = rec.prov;
  const head = `<div class="eyebrow"><span>${esc(sec.label)}</span><span class="sep"></span><span class="prod">${esc(p.product)}</span></div>
    <h1 class="ptitle">${esc(p.sidebarLabel || p.title)}</h1>
    ${p.description ? `<p class="pdesc">${esc(p.description)}</p>` : ''}
    <div class="pmeta">
      <span><b>${commas(S.words.get(rec.slug) || 0)}</b> words</span>
      <span><b>${S.codes.get(rec.slug) || 0}</b> code blocks</span>
      <span><b>${outb}</b> cited</span>
      <span><b>${inb}</b> citing back</span>
      ${v ? `<span><b>${commas(v.careDays)}</b> days of care</span>` : ''}
    </div>`;
  return `<div class="pfade">${head}<div class="prose">${renderBlocks(p.blocks)}</div>${colophon(rec)}</div>`;
}

/* ---------------------------------------------------------------- route --- */
const panel = $('#panel');
let current = null;

function parseHash() {
  let h = decodeURIComponent(location.hash || '');
  if (h.startsWith('#')) h = h.slice(1);
  if (!h) return { slug: '', anchor: '' };
  const i = h.indexOf('#');
  if (i >= 0) return { slug: h.slice(0, i), anchor: h.slice(i + 1) };
  return { slug: h, anchor: '' };
}

function openPage(slug, anchor) {
  const rec = S.bySlug.get(slug);
  if (!rec) return false;
  current = rec;
  const art = $('#article');
  art.innerHTML = renderPage(rec);
  $('#panel-slug').textContent = rec.slug;
  document.title = rec.title + ' · The Murmuration';
  panel.hidden = false;
  requestAnimationFrame(() => panel.classList.add('on'));
  const sc = $('#panel-scroll');
  sc.scrollTop = 0;
  art.querySelectorAll('img').forEach((im) => {
    im.addEventListener('error', () => { const f = im.closest('.fig'); if (f) f.classList.add('missing'); }, { once: true });
  });
  if (anchor) {
    const el = art.querySelector('#' + (window.CSS && CSS.escape ? CSS.escape(anchor) : anchor.replace(/[^\w-]/g, '')));
    if (el) requestAnimationFrame(() => { sc.scrollTop = el.offsetTop - 18; });
  }
  if (still) { restSelect(rec); } else { landOn(slug); }
  closeIndex();
  return true;
}

function closePanel(push) {
  panel.classList.remove('on');
  setTimeout(() => { if (!panel.classList.contains('on')) { panel.hidden = true; $('#article').innerHTML = ''; } }, 620);
  current = null;
  document.title = 'The Murmuration · Strapi Documentation';
  if (!still) {
    releasePerched(null);
    F.hold = 0;
    roostTo(G.W * 0.5, G.horizonY * 0.42, 2.4);
  } else {
    for (const b of F.b) b.chosen = false;
    hoverI = -1; hoverKin = null; hoverAmt = 0;
    draw();
  }
  if (push && location.hash) history.pushState('', '', location.pathname + location.search);
}

function route() {
  if (!S.ready) return;
  const { slug, anchor } = parseHash();
  if (!slug) {
    if (!openPage('/cms/intro', '')) { /* nothing to open */ }
    return;
  }
  if (!openPage(slug, anchor)) openPage('/cms/intro', '');
}

/* -------------------------------------------------------- still helper ---- */
function restSelect(rec) {
  for (const b of F.b) b.chosen = false;
  const kin = new Set([rec.slug]);
  (S.cites.get(rec.slug) || []).forEach((s) => kin.add(s));
  (S.citedBy.get(rec.slug) || []).forEach((s) => kin.add(s));
  hoverKin = new Set();
  for (const s of kin) if (S.bySlug.has(s)) hoverKin.add(S.bySlug.get(s).i);
  hoverI = rec.i; hoverAmt = 1;
  F.b[rec.i].chosen = true;
  draw();
}

/* ============================================================================
   HANDS ON THE WORLD
   ========================================================================== */
function hit(mx, my) {
  let best = -1, bd = (22 * G.s) * (22 * G.s);
  for (let i = 0; i < F.b.length; i++) {
    const b = F.b[i];
    const dx = b.x - mx, dy = b.y - my;
    const d = dx * dx + dy * dy;
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}

const tip = $('#tip');
function showTip(i, mx, my) {
  const b = F.b[i], rec = b.rec, v = rec.prov;
  const inb = S.inb.get(rec.slug) || 0, outb = S.outb.get(rec.slug) || 0;
  let pv = '';
  if (v) {
    pv = `tended ${commas(v.careDays)} days · ${v.commits} commit${v.commits === 1 ? '' : 's'} · ${esc(v.topAuthor || 'unattributed')}`;
    if (v.night) pv += ` · ${v.night} at night`;
  }
  tip.innerHTML = `<div class="t-name">${esc(rec.title)}</div>
    <div class="t-sec">${esc(S.sections[rec.sec].label)} · cites ${outb} · cited by ${inb}</div>
    ${pv ? `<div class="t-prov">${pv}</div>` : ''}`;
  const w = 260, pad = 16;
  const lim = (!$('#panel').hidden && G.W > 980) ? visibleW() + 24 : G.W;
  let x = mx + 20, y = my - 12;
  if (x + w > lim - pad) x = mx - w - 20;
  if (y < pad) y = pad;
  if (y > G.H - 110) y = G.H - 110;
  tip.style.transform = `translate3d(${Math.round(x)}px,${Math.round(y)}px,0)`;
  tip.classList.add('on');
}

let pointerIn = false;
cv.addEventListener('pointermove', (e) => {
  pointerIn = true;
  const i = hit(e.clientX, e.clientY);
  if (i !== hoverI) {
    hoverI = i;
    if (i >= 0) {
      hoverKin = new Set(F.b[i].kin.map((k) => k.i));
      showTip(i, e.clientX, e.clientY);
      cv.style.cursor = 'pointer';
    } else {
      hoverKin = null; tip.classList.remove('on'); cv.style.cursor = 'default';
    }
    if (still) draw();
  } else if (i >= 0) {
    showTip(i, e.clientX, e.clientY);
  }
});
cv.addEventListener('pointerleave', () => {
  pointerIn = false; hoverI = -1; hoverKin = null; tip.classList.remove('on');
  if (still) draw();
});
cv.addEventListener('click', (e) => {
  const i = hit(e.clientX, e.clientY);
  if (i >= 0) { location.hash = F.b[i].rec.slug; return; }
  if (!panel.hidden && G.W > 980) closePanel(true);
});

/* ---------------------------------------------------------------- tabs ---- */
document.addEventListener('click', (e) => {
  const t = e.target.closest('.tab');
  if (t) {
    const box = t.closest('.tabs');
    box.querySelectorAll(':scope > .tablist > .tab').forEach((x) => x.setAttribute('aria-selected', String(x === t)));
    box.querySelectorAll(':scope > .tabpanel').forEach((p) => { p.hidden = p.id !== t.dataset.tab; });
    return;
  }
  const c = e.target.closest('[data-copy]');
  if (c) {
    const code = c.closest('.codefig').querySelector('code');
    const txt = code ? code.textContent : '';
    const done = () => { c.textContent = 'copied'; c.classList.add('done'); setTimeout(() => { c.textContent = 'copy'; c.classList.remove('done'); }, 1400); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, () => {});
    } catch (err) { /* the marsh is offline; never mind */ }
  }
});

/* -------------------------------------------------------------- search ---- */
const sIn = $('#search'), sRes = $('#results');
let sSel = 0, sHits = [];
function runSearch() {
  const q = sIn.value.trim().toLowerCase();
  if (!q) { sRes.classList.remove('open'); sRes.innerHTML = ''; sHits = []; return; }
  const hits = [];
  for (const rec of S.pages) {
    const t = rec.title.toLowerCase();
    let sc = -1;
    if (t === q) sc = 0;
    else if (t.startsWith(q)) sc = 1;
    else if (t.includes(q)) sc = 2;
    else if (rec.slug.includes(q)) sc = 3;
    else if ((rec.p.description || '').toLowerCase().includes(q)) sc = 4;
    if (sc >= 0) hits.push({ rec, sc, inb: S.inb.get(rec.slug) || 0 });
  }
  hits.sort((a, b) => a.sc - b.sc || b.inb - a.inb);
  sHits = hits.slice(0, 9);
  sSel = 0;
  sRes.innerHTML = sHits.map((h, i) => `<button class="res${i === 0 ? ' sel' : ''}" type="button" data-slug="${esc(h.rec.slug)}">
    <b>${esc(h.rec.title)}</b><span>${esc(S.sections[h.rec.sec].label)} <em>·</em> ${h.inb} citing back</span></button>`).join('');
  sRes.classList.add('open');
}
sIn.addEventListener('input', runSearch);
sIn.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { sIn.value = ''; runSearch(); sIn.blur(); }
  if (!sHits.length) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    sSel = (sSel + (e.key === 'ArrowDown' ? 1 : sHits.length - 1)) % sHits.length;
    sRes.querySelectorAll('.res').forEach((n, i) => n.classList.toggle('sel', i === sSel));
  }
  if (e.key === 'Enter') { e.preventDefault(); location.hash = sHits[sSel].rec.slug; sRes.classList.remove('open'); sIn.blur(); }
});
sRes.addEventListener('click', (e) => {
  const b = e.target.closest('.res');
  if (b) { location.hash = b.dataset.slug; sRes.classList.remove('open'); }
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.searchwrap')) sRes.classList.remove('open');
});

/* --------------------------------------------------------------- index ---- */
const ixEl = $('#index');
function buildIndex() {
  const t = S.totals;
  $('#index-sub').textContent = `${t.pages} pages · ${commas(t.edges)} citations · ${S.sections.length} sections · ${t.comms} measured clusters · ${t.orphans} pages nothing links to`;
  $('#index-body').innerHTML = S.sections.map((sec) => {
    const items = sec.slugs.filter((s) => S.bySlug.has(s));
    return `<div class="ixgroup"><h3>${esc(sec.label)}<i>${items.length}</i></h3>${items.map((s) => {
      const r = S.bySlug.get(s);
      return `<a href="#${esc(s)}"><span class="dot" style="background:hsl(${sec.hue} 30% 58%)"></span>${esc(r.title)}</a>`;
    }).join('')}</div>`;
  }).join('');
}
function openIndex() { ixEl.hidden = false; requestAnimationFrame(() => ixEl.classList.add('on')); $('#indexbtn').setAttribute('aria-expanded', 'true'); }
function closeIndex() { ixEl.classList.remove('on'); $('#indexbtn').setAttribute('aria-expanded', 'false'); setTimeout(() => { if (!ixEl.classList.contains('on')) ixEl.hidden = true; }, 500); }
$('#indexbtn').addEventListener('click', () => (ixEl.hidden ? openIndex() : closeIndex()));
$('#indexclose').addEventListener('click', closeIndex);
ixEl.addEventListener('click', (e) => { if (e.target === ixEl || e.target.classList.contains('index-inner')) closeIndex(); });

/* ------------------------------------------------------------- controls --- */
$('#panelclose').addEventListener('click', () => closePanel(true));
$('#prevpage').addEventListener('click', () => { if (current && current.i > 0) location.hash = S.pages[current.i - 1].slug; });
$('#nextpage').addEventListener('click', () => { if (current && current.i < S.pages.length - 1) location.hash = S.pages[current.i + 1].slug; });
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== sIn) { e.preventDefault(); sIn.focus(); sIn.select(); }
  if (e.key === 'Escape') {
    if (!ixEl.hidden) { closeIndex(); return; }
    if (!panel.hidden) closePanel(true);
  }
});
window.addEventListener('hashchange', route);
window.addEventListener('popstate', route);

/* ============================================================================
   BOOT
   ========================================================================== */
function makeGrain() {
  const n = document.createElement('canvas');
  n.width = n.height = 128;
  const g = n.getContext('2d');
  const im = g.createImageData(128, 128);
  const r = mulberry32(xmur3(SEED + '::grain')());
  for (let i = 0; i < im.data.length; i += 4) {
    const v = 120 + Math.floor(r() * 70);
    im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
    im.data[i + 3] = 16;
  }
  g.putImageData(im, 0, 0);
  try {
    document.documentElement.style.setProperty('--grain', `url(${n.toDataURL('image/png')})`);
  } catch (e) { /* never mind */ }
}

function writeInscription() {
  const t = S.totals;
  const oldest = S.bySlug.get(t.careMaxSlug);
  const on = oldest ? `<a href="#${esc(t.careMaxSlug)}">${esc(oldest.title)}</a>` : 'One page';
  $('#inscription').innerHTML =
    `<p><span class="fig">${t.hands}</span> hands. <span class="fig">${commas(t.commits)}</span> commits. ${prettyDate(t.born)} to ${prettyDate(t.last)}.</p>
     <p>${on} has been tended <span class="fig">${commas(t.careMax)}</span> days; the median page, <span class="fig">${commas(t.careMed)}</span>.</p>
     <p class="whisper">${numWord(t.night)} of those edits were made between 22h and 6h. ${numWord(t.nightPages).replace(/^./, (c) => c.toUpperCase())} birds carry a lamp for them.</p>`;
  $('#brand-count').textContent = t.pages;
}

let resizeTimer = 0;
function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    layout();
    if (still) { restArrangement(); if (current) restSelect(current); draw(); }
    else if (current) { landOn(current.slug); }
  }, 140);
}

function boot() {
  makeGrain();
  makeNoise();
  layout();
  makeFlock();
  seedPositions();
  buildIndex();
  writeInscription();

  if (still) {
    restArrangement();
    draw();
  } else {
    /* let the flock settle into a body before the first frame is seen */
    for (let i = 0; i < 150; i++) step(1 / 60);
    F.t = 0;
    lastT = performance.now();
    requestAnimationFrame(frame);
  }

  route();
  setTimeout(() => { const v = $('#veil'); if (v) v.classList.add('gone'); }, 90);
  setTimeout(() => { const v = $('#veil'); if (v) v.style.display = 'none'; }, 1500);

  window.addEventListener('resize', onResize);
  if (RM.addEventListener) {
    RM.addEventListener('change', () => {
      const was = still;
      still = RM.matches;
      if (still !== was) location.reload();
    });
  }
  window.__mm.ready = true;
  window.__F = F; window.__G = G; window.__S = S;
}
})();
