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
  nmPerUnit: 4.2,
  windCal: 1,
  approachDir: { x: 0, y: 1 },
  sigma: 1
};

async function loadData() {
  const [graph, communities, content] = await Promise.all([
    fetch('graph.json').then(r => r.json()),
    fetch('communities.json').then(r => r.json()),
    fetch('content.json').then(r => r.json())
  ]);

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
    islandKnollsH3: h3.length
  };
  world.ready = true;
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
  anchored: false
};
const env = { hourMix: 0, hourTarget: 0, t: 0, boilIdx: 0 };
const lens = { raised: false, t: 0 };
const story = { leadsman1: false, leadsman2: false, started: false };

function sailBase(s) { return s === 'full' ? 8.6 : s === 'half' ? 4.8 : 0; }

function placeShipAtDistance(nm) {
  const u = nm / world.nmPerUnit;
  const d = world.approachDir;
  ship.x = world.island.pos.x - d.x * u;
  ship.y = world.island.pos.y - d.y * u;
  const brg = norm360(Math.atan2(world.island.pos.x - ship.x, world.island.pos.y - ship.y) * 180 / Math.PI);
  ship.bearing = brg;
  ship.orderedBearing = brg;
  ship.omega = 0;
  ship.orderHist = [[env.t, brg]];
  ship.anchored = false;
  story.leadsman1 = story.leadsman2 = false;
}

function distToIslandNm() {
  const dx = world.island.pos.x - ship.x, dy = world.island.pos.y - ship.y;
  return Math.hypot(dx, dy) * world.nmPerUnit;
}
function bearingToIsland() {
  return norm360(Math.atan2(world.island.pos.x - ship.x, world.island.pos.y - ship.y) * 180 / Math.PI);
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

/* --- island LODs: a coastal mass from the real heading skyline --- */
function bakeIsland() {
  const isl = world.island;
  const rnd = rngFor('island');
  const SPW = 900, SPH = 230, BASE = SPH - 16;

  // features in document order: h2 = broad headland massif, h3 = knoll
  const feats = isl.headings.map(h => {
    const hash = [...h.text].reduce((a, ch) => (a * 33 + ch.charCodeAt(0)) % 997, 7) / 997;
    return h.level === 2
      ? { major: true, w: 150 + hash * 55, hgt: 74 + hash * 30, hash }
      : { major: false, w: 54 + hash * 24, hgt: 20 + hash * 18, hash };
  });
  const rawW = feats.reduce((s, f) => s + f.w * 0.62, 0) + 90;
  const sc = 830 / rawW;
  let cx = 40;
  for (const f of feats) {
    f.cx = cx + f.w * 0.31 * sc;
    cx += f.w * 0.62 * sc;
  }
  const x0 = 24, x1 = cx + 40;

  // elevation field: base ridge + gaussian bumps, tapered at both ends
  function elev(x) {
    if (x < x0 || x > x1) return 0;
    const taper = Math.min(1, (x - x0) / 60) * Math.min(1, (x1 - x) / 60);
    let e = 11 + Math.sin(x * 0.02 + 1.7) * 3;
    for (const f of feats) {
      const s = f.w * sc * 0.30;
      const d = (x - f.cx) / s;
      e += f.hgt * Math.exp(-d * d);
    }
    return e * taper;
  }
  const skyY = x => BASE - elev(x);

  function skylinePath(g) {
    g.beginPath();
    g.moveTo(x0, BASE);
    for (let x = x0; x <= x1; x += 5) g.lineTo(x, skyY(x));
    g.lineTo(x1, BASE);
  }

  const lods = [];

  // L0: the smudge
  {
    const [c, g] = mkCanvas(SPW, SPH);
    g.save();
    g.filter = 'blur(5px)';
    g.strokeStyle = 'rgba(96,74,50,0.8)';
    g.lineWidth = 4.2;
    for (let yy = BASE + 2; yy > 30; yy -= 4) {
      g.globalAlpha = 0.8 * Math.pow((yy - 30) / (BASE - 30), 1.3);
      g.beginPath();
      let started = false;
      for (let xx = x0; xx < x1; xx += 8) {
        if (skyY(xx) < yy) {
          if (!started) { g.moveTo(xx, yy + (rnd() - 0.5) * 3); started = true; }
          else g.lineTo(xx, yy + (rnd() - 0.5) * 2.5);
        } else if (started) { g.stroke(); g.beginPath(); started = false; }
      }
      if (started) g.stroke();
    }
    g.restore();
    lods.push(c);
  }

  // L1: emerging profile: broken outline + faint interior tone rows
  {
    const [c, g] = mkCanvas(SPW, SPH);
    g.strokeStyle = 'rgba(80,60,40,0.6)';
    g.lineWidth = 1.6;
    // broken outline: hand lifts the burin
    let pen = false;
    g.beginPath();
    for (let x = x0; x <= x1; x += 5) {
      if (rnd() < 0.88) {
        if (!pen) { g.moveTo(x, skyY(x)); pen = true; }
        else g.lineTo(x, skyY(x));
      } else { pen = false; }
    }
    g.stroke();
    // interior tone rows
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
    lods.push(c);
  }

  // L2 / L3: the engraved coastal profile
  for (const dense of [false, true]) {
    const [c, g] = mkCanvas(SPW, SPH);
    g.lineCap = 'round';
    const ink = dense ? 'rgba(40,29,17,0.9)' : 'rgba(52,39,24,0.8)';
    g.strokeStyle = ink;
    g.lineWidth = dense ? 2.2 : 1.9;
    skylinePath(g);
    g.stroke();

    // interior horizontal tone: the land has body
    g.lineWidth = 0.9;
    g.globalAlpha = dense ? 0.4 : 0.3;
    const rowStep = dense ? 4.4 : 6.5;
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

    // slope hatch on shadowed (right) flanks
    g.globalAlpha = dense ? 0.6 : 0.45;
    g.lineWidth = dense ? 1.0 : 1.1;
    const step = dense ? 3.0 : 4.6;
    for (let xx = x0 + 4; xx < x1 - 4; xx += step) {
      const yy = skyY(xx);
      if (yy >= BASE - 3) continue;
      const slope = skyY(xx + 5) - skyY(xx - 5);
      if (slope > 1.4) {
        const l = Math.min((BASE - yy) * (0.45 + rnd() * 0.25), 42);
        g.beginPath();
        g.moveTo(xx, yy + 2);
        g.lineTo(xx - l * 0.25, yy + 2 + l);
        g.stroke();
      }
    }
    if (dense) {
      g.globalAlpha = 0.38;
      for (let xx = x0 + 4; xx < x1 - 4; xx += 4.4) {
        const yy = skyY(xx);
        if (yy >= BASE - 8) continue;
        const slope = skyY(xx + 5) - skyY(xx - 5);
        if (slope > 3) {
          const l = Math.min((BASE - yy) * 0.35, 24);
          g.beginPath();
          g.moveTo(xx - 3, yy + 7);
          g.lineTo(xx + l * 0.5, yy + 7 + l * 0.6);
          g.stroke();
        }
      }
    }
    // crag ticks along ridges
    g.globalAlpha = dense ? 0.85 : 0.6;
    g.lineWidth = dense ? 1.25 : 1.05;
    for (const f of feats) {
      if (!f.major && !dense) continue;
      const nticks = f.major ? (dense ? 8 : 5) : 2;
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
    // foreshore lines + beach stipple + a whisper of surf
    g.globalAlpha = 0.6;
    g.lineWidth = 1.1;
    for (let k = 0; k < (dense ? 4 : 2); k++) {
      const yy = BASE + 1.5 + k * 2.6;
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
      for (let i = 0; i < 300; i++) {
        const xx = x0 + rnd() * (x1 - x0);
        const yy = skyY(xx);
        if (yy > BASE - 3) continue;
        if (rnd() < 0.45) g.fillRect(xx, BASE - 1 - rnd() * 4, 1.3, 1.3);
        else if (yy < BASE - 24 && rnd() < 0.4)
          g.fillRect(xx, yy + 9 + rnd() * (BASE - yy - 12), 1.3, 1.3);
      }
      // scrub ticks near the feet
      g.globalAlpha = 0.6;
      g.lineWidth = 0.9;
      for (let i = 0; i < 60; i++) {
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
      // Waghenaer letters over the h2 headlands
      g.globalAlpha = 0.9;
      g.fillStyle = 'rgba(40,29,17,0.95)';
      g.font = '600 22px Georgia, serif';
      g.textAlign = 'center';
      let li = 0;
      for (const f of feats) {
        if (!f.major) continue;
        g.fillText(String.fromCharCode(65 + li), f.cx, skyY(f.cx) - 14);
        li++;
      }
    }
    g.globalAlpha = 1;
    lods.push(c);
  }

  bake.island = { lods, SPW, SPH, BASE };
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

  const dist = distToIslandNm();
  if (!story.started && t > 1) {
    story.started = true;
    caption('Out of Quick Start roads, bound for the Document Service shore.', 4200);
    caption('The wind stands fair, down the citation flow.', 3800);
  }
  if (!story.leadsman1 && dist < 1.35) {
    story.leadsman1 = true;
    caption('The leadsman heaves the lead…', 2400);
    caption('"By the deep, ' + numToWords(world.island.words) + '!"', 4600);
  }
  if (!story.leadsman2 && dist < 0.6) {
    story.leadsman2 = true;
    caption('"By the deep, ' + numToWords(world.island.words) +
      '. ' + numToWords(world.island.h2.length) + ' headlands plain on the bow."', 4800);
  }
  if (!ship.anchored && dist <= 0.15) {
    ship.anchored = true;
    ship.sail = 'rest';
    captionNow('Hands aloft, the canvas comes in. Let go the anchor.', 4200);
    caption('The anchor bites. Gate-0 ends at the anchorage.', 6000);
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

  return { wind, cosA, knotsFrac, dist };
}

/* ---------------- render ---------------- */
const cv = document.getElementById('sea');
cv.width = Math.ceil(W * SCALE);
cv.height = Math.ceil(H * SCALE);
const ctx = cv.getContext('2d', { alpha: false });

function islandScreenW(dist) {
  return clamp(340 / Math.max(dist, 0.16), 10, 1100);
}
function islandStage(dist) {
  return dist > 2.2 ? 0 : dist > 1.4 ? 1 : dist > 0.55 ? 2 : 3;
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

  /* island */
  const dist = sim.dist;
  const az = angDiff(bearingToIsland(), ship.bearing);
  if (Math.abs(az) < 55 && dist > 0.02) {
    const x = W / 2 + az * PXDEG;
    const wpx = islandScreenW(dist);
    const spr = bake.island;
    const s = wpx / spr.SPW;
    const hpx = spr.SPH * s;
    const stage = Math.min(3, islandStage(dist) + stageBoost);
    const th = [2.2, 1.4, 0.55];
    let fade = 1;
    if (stage < 3 && stage - stageBoost >= 0 && stage - stageBoost < 3) {
      const d0 = th[stage - stageBoost];
      fade = clamp((d0 - dist) / 0.25, 0, 1);
    }
    const yBase = HORIZON + worldDY + 6;
    ctx.globalAlpha = clamp(0.5 + (2.9 - dist) * 0.5, 0.5, 1);
    ctx.drawImage(spr.lods[stage], x - wpx / 2, yBase - spr.BASE * s, wpx, hpx);
    if (fade < 1 && stage > 0) {
      ctx.globalAlpha *= (1 - fade) * 0.5;
      ctx.drawImage(spr.lods[stage - 1], x - wpx / 2, yBase - spr.BASE * s, wpx, hpx);
    }
    ctx.globalAlpha = 1;
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
  window.addEventListener('keydown', e => {
    if (e.repeat) { keys[e.key] = true; return; }
    keys[e.key] = true;
    if (e.key === 'f' || e.key === 'F') setSail('full');
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
    keys[e.key] = false;
    if (e.key === ' ') { lens.raised = false; dirty = true; }
  });

  setInterval(() => {
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

  const sim = update(dt);
  render(sim);
  requestAnimationFrame(frame);
}

function becalmFrame() {
  const sim = update(1 / 60);
  if (dirty) {
    lens.t = lens.raised ? 1 : 0;
    render(sim);
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
  say(text, ms) { captionNow(text, ms || 30000); }
};

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
  bakeIsland();
  bakeLensRing();
  initFoam();
  initStreaks();
  initInput();

  placeShipAtDistance(parseFloat(params.get('dist')) || 2.7);
  ship.sail = params.get('sail') || 'full';
  if (params.get('hour') === 'dusk') { env.hourTarget = 1; env.hourMix = 1; }

  document.getElementById('loading').classList.add('hidden');
  const pt = document.getElementById('plate-title');
  const hints = document.getElementById('hints');
  pt.classList.add('shown');
  hints.classList.add('shown');
  setTimeout(() => pt.classList.remove('shown'), 7000);
  setTimeout(() => hints.classList.remove('shown'), 12000);

  if (REDUCED) {
    caption('Becalmed: reduced motion honored. The sea holds its pose; the helm answers instantly.', 6000);
    becalmFrame();
  } else {
    requestAnimationFrame(frame);
  }
  window.__helm.ready = true;
})();
