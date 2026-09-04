/* ============================================================================
   PIXEL DOCS CITY
   The Strapi documentation as a drawn, explorable, isometric pixel-art town.
   - Fixed 2:1 dimetric projection, 16x8 tiles, integer zoom, no smoothing.
   - Every object is an authored sprite baked pixel-by-pixel at boot.
   - Bounded palette (~34 colours), dithered shading, 1px dark outlines.
   ============================================================================ */
'use strict';

/* ------------------------------------------------ seeded RNG ------------- */
const SEED = 'hhPlEp82zWk3KP3bP69udZ5fUDv57fbk5ssBGwXFPYktwjFnPZtZDjo13lRLG6iYvpYsIL1ubtrukZtUUG07r8T66NcH4mNY';
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
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
const seedFn = xmur3(SEED);
const rng = mulberry32(seedFn());
const rint = (n) => Math.floor(rng() * n);
const pick = (arr) => arr[rint(arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ------------------------------------------------ palette ---------------- */
const PAL = {
  OUT: '#221c2a',
  B1: '#5f2b26', B2: '#8c3b2e', B3: '#b85c3f', B4: '#d98a5e',      // brick
  C1: '#8f7f58', C2: '#cdbb8f', C3: '#e9dcb6',                     // cream stone
  S1: '#3f4757', S2: '#5b6577', S3: '#7d8798',                     // slate
  A1: '#3f3e48', A2: '#55535e', A3: '#6b6974',                     // asphalt
  P1: '#8d8474', P2: '#aca189', P3: '#c9bda1',                     // pavement
  G1: '#2c6132', G2: '#47823c', G3: '#6ba348',                     // grass
  W1: '#175e6b', W2: '#24818c', W3: '#46a8ab', W4: '#9fd8d2',      // water
  GL1: '#6d9fb8', GL2: '#a5cfdd',                                  // glass
  WD1: '#4f3520', WD2: '#7a5836', WD3: '#a37e4e',                  // wood
  V1: '#4945ff', V2: '#8582ff',                                    // Strapi violet (interactive only)
  L1: '#ffcf5e', L2: '#f2a33c',                                    // lit windows
  DW: '#2b3247',                                                   // dark window
  WH: '#f4eee0', RD: '#c94b3c', YL: '#e8b23c',
  SK: '#e0a878', SK2: '#8c5a3c'
};
const THEMES = [PAL.RD, PAL.YL, PAL.GL1, PAL.G3, PAL.B4, PAL.W3, PAL.C1, PAL.S3];

/* ------------------------------------------------ constants -------------- */
const HW = 8, HH = 4;             // tile half-width / half-height in world px
const SPX = 7;                    // pixels per storey
const T = { SEA: 0, WATER: 1, BANK: 2, ROAD: 3, CROSS: 4, BRIDGE: 5, PAVE: 6, PLAZA: 7, GRASS: 8, FLOWER: 9, LOT: 10 };
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------ time + seasons --------- */
const DAY_LEN = 240;               // seconds for one full day/night cycle
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
const SEASON_TREE = ['tree_sp', 'tree', 'tree_au', 'tree_wi'];
let dayT = REDUCED ? 0.68 : 0.40;  // 0..1 fraction of the day (REDUCED: frozen golden hour)
let timeSpeed = REDUCED ? 0 : 1;   // 1, 8, 0 (paused)
let season = 1;                    // start in summer; one season per day cycle
let nf = 0, gf = 0;                // night / golden-hour light factors, set per frame
/* light keyframes: [dayT, nightFactor, goldenFactor], lerped between */
const PHASE = [
  [0.00, 1, 0], [0.16, 1, 0], [0.235, 0.55, 0.75], [0.30, 0.12, 0.55],
  [0.38, 0, 0.10], [0.46, 0, 0], [0.62, 0, 0], [0.68, 0, 0.55],
  [0.735, 0.30, 0.95], [0.80, 0.85, 0.25], [0.86, 1, 0], [1.00, 1, 0]
];
function lightFactors(t) {
  for (let i = 0; i < PHASE.length - 1; i++) {
    const a = PHASE[i], b2 = PHASE[i + 1];
    if (t >= a[0] && t <= b2[0]) {
      const u = (t - a[0]) / ((b2[0] - a[0]) || 1);
      nf = a[1] + (b2[1] - a[1]) * u;
      gf = a[2] + (b2[2] - a[2]) * u;
      return;
    }
  }
  nf = 1; gf = 0;
}
function hexRGB(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function mixRGB(A, B, u) { return [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, A[2] + (B[2] - A[2]) * u]; }
function rgbStr(A) { return `rgb(${Math.round(A[0])},${Math.round(A[1])},${Math.round(A[2])})`; }
const SKY_DAY = hexRGB('#124a57'), SKY_GOLD = hexRGB('#1d3b4a'), SKY_NIGHT = hexRGB('#04070f'); // open ocean beyond the map: daylit teal, dusk slate, near-black night

/* ------------------------------------------------ tiny 3x5 font ---------- */
const FONT3 = {
  A: [2, 5, 7, 5, 5], B: [6, 5, 6, 5, 6], C: [3, 4, 4, 4, 3], D: [6, 5, 5, 5, 6],
  E: [7, 4, 6, 4, 7], F: [7, 4, 6, 4, 4], G: [3, 4, 5, 5, 3], H: [5, 5, 7, 5, 5],
  I: [7, 2, 2, 2, 7], J: [1, 1, 1, 5, 2], K: [5, 5, 6, 5, 5], L: [4, 4, 4, 4, 7],
  M: [5, 7, 7, 5, 5], N: [5, 7, 7, 7, 5], O: [2, 5, 5, 5, 2], P: [6, 5, 6, 4, 4],
  Q: [2, 5, 5, 6, 3], R: [6, 5, 6, 5, 5], S: [3, 4, 2, 1, 6], T: [7, 2, 2, 2, 2],
  U: [5, 5, 5, 5, 7], V: [5, 5, 5, 5, 2], W: [5, 5, 7, 7, 5], X: [5, 5, 2, 5, 5],
  Y: [5, 5, 2, 2, 2], Z: [7, 1, 2, 4, 7],
  '0': [7, 5, 5, 5, 7], '1': [2, 6, 2, 2, 7], '2': [7, 1, 7, 4, 7], '3': [7, 1, 3, 1, 7],
  '4': [5, 5, 7, 1, 1], '5': [7, 4, 7, 1, 7], '6': [7, 4, 7, 5, 7], '7': [7, 1, 2, 2, 2],
  '8': [7, 5, 7, 5, 7], '9': [7, 5, 7, 1, 7], '-': [0, 0, 7, 0, 0], ' ': [0, 0, 0, 0, 0]
};
function drawText3x5(g, x, y, str, color) {
  g.fillStyle = color;
  for (const ch of str.toUpperCase()) {
    const gl = FONT3[ch] || FONT3[' '];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++)
      if (gl[r] & (4 >> c)) g.fillRect(x + c, y + r, 1, 1);
    x += 4;
  }
}
const textW = (s) => s.length * 4 - 1;

/* ------------------------------------------------ globals ---------------- */
let DATA = null, GRAPH = null, COMMS = null, PROV = null;
let pagesBySlug = {}, ORDER = [], NAV = [];
let quarters = [];          // {id, name, hub, members, qw, qh, qx, qy, theme, lots:[], migration}
let buildings = [];         // {slug, tx, ty, fw, fd, s, style, lit, spr, wx, wy, depth, quarter, litPx:[], twk:[]}
let Wt = 0, Ht = 0;         // map size in tiles
let grid = null, hdir = null, vdir = null, quarterOf = null;
let worldW = 0, worldH = 0, OX = 0, OY = 0;
let groundCv, waterCvs = [];
let statics = [];           // sorted sprite instances {cv,wx,wy,depth,b?}
let peds = [], cars = [], cyclists = [], pigeons = [], cats = [], smokes = [], flags = [], boat = null;
let dogs = [], queuers = [], buoys = [];
let crossTiles = new Set(); // 'x,y'
let canalWaterYs = [];      // center y of each canal
let SPR = {};               // sprite atlas
let atlasStats = { sprites: 0, pixels: 0 };
let hubs = [], uncitedSet = new Set(), edgeCount = 0;

/* game-layer state */
let groundSets = [];        // [season] -> {day, gold, night} pre-baked tinted ground keyframes
let shadowCv = null;        // pre-baked golden-hour long shadows
let starPts = [], lampPts = [], lampRefl = [];
let doors = [], doorTiles = new Set(), propSolid = new Set();
let parts = [], weatherAcc = 0;    // one capped particle pool (weather + dust + breath)
const MAXPART = 120;
let bakeQueue = [];         // pending building night/winter variant bakes
let camMode = 'free';       // 'follow' once the player uses movement keys
let activeDoor = null;
const player = { x: 0, y: 0, vx: 0, vy: 0, face: 6, walkT: 0, idleT: 99, dustT: 0, breathT: 2 };
let camSettle = 0;

const cvs = document.getElementById('city');
const ctx = cvs.getContext('2d');
let dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
let cam = { x: 0, y: 0, z: 2 };  // z = integer device-pixel zoom
let hoverB = null;
let frameMs = 0, frameSamples = [];
let animT = 0, lastTick = 0;

/* ==========================================================================
   SPRITE HELPERS
   ========================================================================== */
function mkCv(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  return [c, g];
}
function px(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(x | 0, y | 0, w, h); }

/* diamond tile: 16x8, top corner at (cx, cy) */
const DROWS = [4, 8, 12, 16, 16, 12, 8, 4];
function diamond(g, cx, cy, col) {
  g.fillStyle = col;
  for (let r = 0; r < 8; r++) g.fillRect(cx - DROWS[r] / 2, cy + r, DROWS[r], 1);
}
/* 1px silhouette outline around every opaque region of a sprite canvas */
function outline(cv, col) {
  const g = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const im = g.getImageData(0, 0, w, h), d = im.data;
  const solid = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) solid[i] = d[i * 4 + 3] > 10 ? 1 : 0;
  const oc = col || PAL.OUT;
  const m = /^#(..)(..)(..)$/.exec(oc);
  const R = parseInt(m[1], 16), G = parseInt(m[2], 16), B = parseInt(m[3], 16);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (solid[i]) continue;
    if ((x > 0 && solid[i - 1]) || (x < w - 1 && solid[i + 1]) ||
        (y > 0 && solid[i - w]) || (y < h - 1 && solid[i + w])) {
      d[i * 4] = R; d[i * 4 + 1] = G; d[i * 4 + 2] = B; d[i * 4 + 3] = 255;
    }
  }
  g.putImageData(im, 0, 0);
  atlasStats.pixels += w * h;
}

/* ==========================================================================
   BUILDING SPRITES - assembled from authored components
   ========================================================================== */
const WALLSETS = [
  { lt: PAL.B3, dk: PAL.B2, dd: PAL.B1, course: PAL.B1 },   // brick
  { lt: PAL.C3, dk: PAL.C2, dd: PAL.C1, course: PAL.C1 },   // cream
  { lt: PAL.B4, dk: PAL.B3, dd: PAL.B2, course: PAL.B2 },   // warm brick
  { lt: PAL.S3, dk: PAL.S2, dd: PAL.S1, course: PAL.S1 }    // slate
];

function bakeBuilding(b) {
  const { fw, fd, s, style } = b;
  const wallH = style === 'kiosk' ? 8 : s * SPX;
  const roofD = (fw + fd) * HH;
  const signH = b.sign ? 14 : (style === 'civic' && b.dome ? Math.min(fw, fd) * HH + 6 : (style === 'workshop' ? 4 : (style === 'office' ? 6 : (style === 'scaffold' ? 6 : 2))));
  const M = 2;
  const signW = b.sign ? textW(b.sign) + 8 : 0;
  const MX = Math.max(M, Math.ceil(Math.max(0, signW - (fw + fd) * HW) / 2) + M);
  const W = (fw + fd) * HW + 2 * MX;
  const H = signH + roofD + wallH + 2 * M;
  const [cv, g] = mkCv(W, H);

  // key local points (top corner of roof)
  const Tx = MX + fd * HW, Ty = M + signH;
  const Ex = Tx + fw * HW, Ey = Ty + fw * HH;
  const Wx = Tx - fd * HW, Wy = Ty + fd * HH;
  const Sx = Tx + (fw - fd) * HW, Sy = Ty + (fw + fd) * HH;

  const ws = b.wallset;
  const isCiv = style === 'civic';
  const ltCol = isCiv ? PAL.C3 : ws.lt, dkCol = isCiv ? PAL.C2 : ws.dk;

  // ---- walls (left face light, right face shaded + dithered) ----
  for (let x = Wx; x < Sx; x++) {
    const topY = Wy + ((x - Wx + 1) >> 1);
    px(g, x, topY, 1, wallH, ltCol);
    if (((x + topY) & 1) === 0) { // sparse texture on light face
      for (let y = topY + 3; y < topY + wallH; y += 5) px(g, x, y, 1, 1, dkCol);
    }
  }
  for (let x = Sx; x < Ex; x++) {
    const topY = Sy - ((x - Sx + 1) >> 1) - 0;
    px(g, x, topY, 1, wallH, dkCol);
    // dither the shade with the deeper ramp step
    for (let y = topY; y < topY + wallH; y++)
      if (((x + y) & 1) === 0 && y > topY + 2) px(g, x, y, 1, 1, ws.dd);
  }
  // storey course lines
  for (let k = 1; k < s; k++) {
    for (let x = Wx; x < Sx; x++) px(g, x, Wy + ((x - Wx + 1) >> 1) + k * SPX, 1, 1, ws.course);
    for (let x = Sx; x < Ex; x++) px(g, x, Sy - ((x - Sx + 1) >> 1) + k * SPX, 1, 1, PAL.OUT);
  }

  // ---- windows ----
  const winPos = [];   // window slots on both faces
  if (style !== 'kiosk') {
    const winH = style === 'records' ? SPX - 2 : 3;
    for (let k = 0; k < s; k++) {
      for (let j = 0; j < fw; j++) { // left face, per footprint tile
        const wx0 = Wx + j * HW + 3;
        if (k === s - 1 && j === 0 && style !== 'records') continue; // ground floor tile 0 = door
        winPos.push({ x: wx0, y: Wy + ((wx0 - Wx + 1) >> 1) + k * SPX + 2, f: 0, h: winH });
        if (style === 'records') winPos.push({ x: wx0 + 3, y: Wy + ((wx0 + 3 - Wx + 1) >> 1) + k * SPX + 2, f: 0, h: winH, slit: 1 });
      }
      for (let j = 0; j < fd; j++) { // right face
        const wx0 = Sx + j * HW + 3;
        winPos.push({ x: wx0, y: Sy - ((wx0 - Sx + 1) >> 1) + k * SPX + 2, f: 1, h: winH });
      }
    }
  }
  // choose lit windows deterministically
  const lit = Math.min(b.lit, winPos.length);
  const idx = winPos.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = rint(i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const litSet = new Set(idx.slice(0, lit));
  b.litPx = [];
  b.win = [];   // unlit window slots, lit progressively by the night variants
  winPos.forEach((wp, i) => {
    const isLit = litSet.has(i);
    const glass = b.style === 'office' && !isLit ? PAL.GL1 : PAL.DW;
    const col = isLit ? PAL.L1 : glass;
    const wpx = wp.slit ? 1 : 2;
    if (style === 'boarded') { // boarded planks with X
      px(g, wp.x - 1, wp.y - 1, 4, wp.h + 2, PAL.WD2);
      px(g, wp.x - 1, wp.y, 4, 1, PAL.WD1);
      px(g, wp.x, wp.y + wp.h, 2, 1, PAL.WD1);
      return;
    }
    px(g, wp.x - 1, wp.y - 1, wpx + 2, wp.h + 2, PAL.OUT);
    px(g, wp.x, wp.y, wpx, wp.h, col);
    if (b.motif === 2 && style !== 'kiosk') px(g, wp.x - 1, wp.y - 2, wpx + 2, 1, isCiv ? PAL.C1 : ws.course); // stone lintels
    if (isLit) { px(g, wp.x, wp.y, 1, 1, PAL.L2); b.litPx.push({ lx: wp.x, ly: wp.y, w: wpx, h: wp.h }); }
    else b.win.push({ x: wp.x, y: wp.y, w: wpx, h: wp.h });
  });

  // ---- door + street-level dressing on left face ----
  if (style !== 'records' || true) {
    const dx = Wx + 2, dBottom = Wy + ((dx + 1 - Wx + 1) >> 1) + wallH;
    px(g, dx - 1, dBottom - 6, 5, 6, PAL.OUT);
    px(g, dx, dBottom - 5, 3, 5, style === 'boarded' ? PAL.WD1 : PAL.WD2);
    if (b.lit > 0 && style !== 'boarded') px(g, dx + 1, dBottom - 5, 1, 1, PAL.L1);
    b.doorPx = { x: dx - 1, y: dBottom - 6, w: 5, h: 6 };  // local sprite coords of the door
  }
  if (style === 'shop' || style === 'kiosk') { // awning
    const aw = b.awn;
    for (let x = Wx + 1; x < Sx - 1; x++) {
      const ty2 = Wy + ((x - Wx + 1) >> 1) + wallH - SPX + 1;
      px(g, x, ty2, 1, 2, (((x - Wx) >> 1) & 1) ? aw : PAL.WH);
    }
  }
  if (style === 'civic') { // columns on both faces + entablature
    for (let x = Wx + 2; x < Sx - 1; x += 4) {
      const ty2 = Wy + ((x - Wx + 1) >> 1);
      px(g, x, ty2 + 1, 2, wallH - 1, PAL.C3);
      px(g, x + 1, ty2 + 1, 1, wallH - 1, PAL.C1);
    }
    for (let x = Wx; x < Sx; x++) px(g, x, Wy + ((x - Wx + 1) >> 1) + 1, 1, 1, PAL.C1);
  }
  if (style === 'boarded') { // FOR-LEASE board
    const bx = Wx + Math.max(2, fw * HW - 8), byy = Wy + ((bx - Wx + 1) >> 1) + wallH - SPX;
    px(g, bx - 1, byy - 1, 8, 6, PAL.OUT);
    px(g, bx, byy, 6, 4, PAL.WH);
    px(g, bx + 1, byy + 1, 4, 1, PAL.RD);
    px(g, bx + 1, byy + 3, 3, 1, PAL.A2);
  }

  // ---- roof ----
  function roofSpan(yRel) { // [xl, xr] of roof diamond at Ty+yRel
    const xr = yRel < fw * HH ? Tx + 2 * (yRel + 1) : Ex + fw * HW - 2 * yRel + (fd * HW - (fw + fd) * HW) + 2 * (yRel - fw * HH) * 0; // recompute below
    return null;
  }
  // scanline roof fill
  function fillRoof(colorFn) {
    for (let yRel = 0; yRel < (fw + fd) * HH; yRel++) {
      const y = Ty + yRel;
      const xr = yRel < fw * HH ? Tx + 2 * (yRel + 1) : (Tx + fw * HW) - 2 * (yRel - fw * HH);
      const xl = yRel < fd * HH ? Tx - 2 * (yRel + 1) : (Tx - fd * HW) + 2 * (yRel - fd * HH);
      const w = xr - xl;
      if (w <= 0) continue;
      g.fillStyle = colorFn(yRel);
      g.fillRect(xl, y, w, 1);
    }
  }
  if (style === 'office') {
    fillRoof(() => PAL.A2);
    fillRoof((yr) => (yr < 2 || yr >= (fw + fd) * HH - 2) ? PAL.A1 : 'rgba(0,0,0,0)');
    // parapet edge highlight
    for (let yRel = 0; yRel < 2; yRel++) { }
    // AC units
    const nAC = 1 + (fw + fd > 3 ? 1 : 0);
    for (let a = 0; a < nAC; a++) {
      const ax = Sx - 4 + (a ? -6 : 2), ay = Ty + roofD / 2 - 4 + a * 3;
      px(g, ax, ay - 2, 5, 4, PAL.S3); px(g, ax, ay + 1, 5, 1, PAL.S1);
      px(g, ax + 1, ay - 1, 3, 1, PAL.S1);
    }
    // water tank on the tallest offices
    if (s >= 7) {
      const cxx = Tx - 2, cy2 = Ty + 2;
      px(g, cxx, cy2 - 4, 4, 5, PAL.WD2); px(g, cxx, cy2 - 5, 4, 1, PAL.WD1);
      px(g, cxx + 1, cy2 + 1, 1, 2, PAL.WD1);
    }
  } else if (style === 'workshop') {
    fillRoof((yr) => ((yr >> 1) & 1) ? PAL.S2 : PAL.GL2);
    // sawtooth teeth along the T-E edge
    for (let t2 = 0; t2 < fw * 2; t2++) {
      const bx = Tx + t2 * 4 + 1, byy = Ty + t2 * 2 - 2;
      px(g, bx, byy, 3, 2, PAL.S1); px(g, bx, byy - 1, 2, 1, PAL.S2);
    }
    // chimney
    px(g, Tx - 3, Ty + 1, 2, 5, PAL.B2); px(g, Tx - 3, Ty, 2, 1, PAL.B1);
    b.chimney = { lx: Tx - 2, ly: Ty - 1 };
  } else if (style === 'civic') {
    fillRoof((yr) => (yr & 3) < 2 ? PAL.C2 : PAL.C1);
    if (b.dome) {
      const cx2 = Tx + (fw - fd) * HW / 2, cy2 = Ty + roofD / 2;
      const r = Math.min(fw, fd) * HH + 3;
      for (let dy = -r; dy <= 0; dy++) {
        const half = Math.floor(Math.sqrt(r * r - dy * dy));
        px(g, cx2 - half, cy2 + dy, half + 1, 1, PAL.C3);
        px(g, cx2, cy2 + dy, half, 1, PAL.C2);
        if (((dy + cy2) & 1) === 0) px(g, cx2 + (half >> 1), cy2 + dy, Math.max(1, half >> 1), 1, PAL.C1);
      }
      px(g, cx2, cy2 - r - 2, 1, 2, PAL.YL);
      b.flagPt = null;
    } else {
      b.flagPt = { lx: Tx, ly: Ty - 1 };
    }
  } else if (style === 'boarded') {
    fillRoof((yr) => ((yr >> 1) & 1) ? PAL.WD2 : PAL.WD1);
  } else if (style === 'kiosk') {
    fillRoof((yr) => ((yr >> 1) & 1) ? b.awn : PAL.WH);
  } else { // shop, records, scaffold: terracotta / tile courses
    const rc = b.roofset;
    fillRoof((yr) => (yr & 3) < 2 ? rc[0] : rc[1]);
    for (let yRel = 0; yRel < 2; yRel++) { }
  }

  // ---- motif crowns: extra rooftop furniture so district skylines vary ----
  if (b.motif === 1 && !b.sign && !b.dome && style !== 'kiosk' && style !== 'boarded' && style !== 'workshop' && style !== 'civic') {
    if (style === 'office') {
      if (s < 7) { // tall offices already carry the water tank
        px(g, Tx - 1, Ty - 3, 3, 1, PAL.S2);           // radio mast on the parapet corner
        px(g, Tx, Ty - 5, 1, 6, PAL.S1);
        px(g, Tx, Ty - 6, 1, 1, PAL.RD);               // beacon
      }
    } else if (fw + fd >= 3) {
      px(g, Tx - 3, Ty - 3, 7, 6, PAL.OUT);            // stair bulkhead breaking the roof line
      px(g, Tx - 2, Ty - 2, 5, 4, ws.lt);
      px(g, Tx - 2, Ty - 2, 5, 1, ws.dk);
      px(g, Tx, Ty, 1, 2, PAL.DW);
    }
  }
  if (b.motif === 1 && style === 'workshop') {         // second vent stack beside the sawtooth
    const vx2 = Tx + (fw - fd) * HW / 2 + 5, vy2 = Ty + roofD / 2 - 1;
    px(g, vx2, vy2 - 3, 2, 4, PAL.S1);
    px(g, vx2 - 1, vy2 - 4, 4, 1, PAL.S3);
  }
  if (b.motif === 2 && style === 'office') {           // roof terrace: a planter strip
    const gy = Ty + fd * HH + 1, gx = Tx - fd * HW + 3;
    px(g, gx, gy + 1, 6, 2, PAL.WD2);
    px(g, gx, gy, 6, 1, PAL.G2);
    px(g, gx + 1, gy - 1, 2, 1, PAL.G3); px(g, gx + 4, gy - 1, 1, 1, PAL.G3);
  }

  // ---- scaffolding overlay (migration pages) ----
  if (style === 'scaffold') {
    for (let x = Sx; x < Ex; x += 4) {
      const topY = Sy - ((x - Sx + 1) >> 1);
      px(g, x, topY - 2, 1, wallH + 3, PAL.WD3);
    }
    for (let k = 0; k <= s; k++) {
      for (let x = Sx; x < Ex; x++) {
        const topY = Sy - ((x - Sx + 1) >> 1);
        if ((x & 1) === 0) px(g, x, topY + k * SPX - 1, 1, 1, PAL.WD2);
      }
    }
    // top platform
    for (let x = Sx; x < Ex; x++) px(g, x, Sy - ((x - Sx + 1) >> 1) - 2, 1, 1, PAL.WD3);
  }

  // ---- rooftop billboard for the four hubs ----
  if (b.sign) {
    const tw = textW(b.sign);
    const bw = tw + 4, bh = 9;
    const bx = Tx + (fw - fd) * HW / 2 - (bw >> 1), byy = Ty - bh - 3;
    px(g, bx + 2, byy + bh, 1, 4, PAL.A1);
    px(g, bx + bw - 3, byy + bh, 1, 4, PAL.A1);
    px(g, bx - 1, byy - 1, bw + 2, bh + 2, PAL.OUT);
    px(g, bx, byy, bw, bh, PAL.WH);
    px(g, bx, byy, bw, 1, PAL.RD);
    drawText3x5(g, bx + 2, byy + 3, b.sign, PAL.RD);
  }

  outline(cv);
  atlasStats.sprites++;
  // picking data
  b.pick = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  return { cv, ox: MX + fd * HW, oy: H - M - 0 }; // anchor: north ground corner at (ox, oy - wallH - roofD ... ) - we return offsets separately
}

/* ==========================================================================
   PROP + LIFE SPRITES (atlas)
   ========================================================================== */
function bakeSprite(name, w, h, fn, noOutline) {
  const [cv, g] = mkCv(w, h);
  fn(g, cv);
  if (!noOutline) outline(cv);
  atlasStats.sprites++;
  SPR[name] = cv;
  return cv;
}

function bakeAtlas() {
  // --- street furniture ---
  bakeSprite('lamp', 7, 14, (g) => {
    px(g, 3, 3, 1, 10, PAL.A1); px(g, 2, 13, 3, 1, PAL.A1);
    px(g, 2, 1, 3, 2, PAL.OUT); px(g, 3, 1, 1, 2, PAL.L1); px(g, 2, 0, 3, 1, PAL.A1);
  });
  bakeSprite('tree', 11, 16, (g) => {
    px(g, 5, 11, 2, 4, PAL.WD1);
    // round canopy, radius 5, centred at (5.5, 6)
    for (let yy = 1; yy <= 11; yy++) for (let xx = 0; xx < 11; xx++) {
      const dx = xx - 5, dy = (yy - 6) * 1.15;
      if (dx * dx + dy * dy <= 27) {
        let c = PAL.G2;
        if (dx - dy < -3) c = PAL.G3;            // lit upper-left
        else if (dx - dy > 4) c = PAL.G1;        // shaded lower-right
        if (((xx + yy) & 1) === 0 && dx * dx + dy * dy > 15) c = (dx - dy < 0) ? PAL.G2 : PAL.G1;
        px(g, xx, yy, 1, 1, c);
      }
    }
    px(g, 4, 3, 2, 1, PAL.G3); px(g, 3, 4, 1, 1, PAL.G3);
  });
  bakeSprite('bench', 8, 6, (g) => {
    px(g, 1, 1, 6, 2, PAL.WD3); px(g, 1, 3, 1, 2, PAL.WD1); px(g, 6, 3, 1, 2, PAL.WD1);
  });
  bakeSprite('hydrant', 5, 7, (g) => {
    px(g, 1, 2, 3, 4, PAL.RD); px(g, 2, 1, 1, 1, PAL.RD); px(g, 0, 3, 5, 1, PAL.RD);
  });
  bakeSprite('stall', 14, 13, (g) => {
    px(g, 1, 8, 1, 4, PAL.WD1); px(g, 12, 8, 1, 4, PAL.WD1);
    px(g, 2, 8, 10, 3, PAL.WD3);
    px(g, 2, 9, 3, 1, PAL.RD); px(g, 6, 9, 2, 1, PAL.YL); px(g, 9, 9, 2, 1, PAL.G3);
    for (let x = 0; x < 14; x += 2) px(g, x, 4 + ((x >> 1) & 1), 2, 3, ((x >> 2) & 1) ? PAL.RD : PAL.WH);
    px(g, 0, 3, 14, 1, PAL.RD);
  });
  bakeSprite('kioskstand', 10, 12, (g) => {
    px(g, 2, 4, 6, 7, PAL.G1); px(g, 3, 6, 4, 3, PAL.WH);
    for (let x = 1; x < 9; x += 2) px(g, x, 2, 2, 2, (x >> 1) & 1 ? PAL.YL : PAL.WH);
    px(g, 0, 1, 10, 1, PAL.YL);
  });
  bakeSprite('crane', 30, 34, (g) => {
    px(g, 6, 6, 2, 28, PAL.YL);
    for (let y = 8; y < 33; y += 4) px(g, 5, y, 4, 1, PAL.L2);
    px(g, 2, 4, 26, 2, PAL.YL);
    for (let x = 4; x < 27; x += 4) px(g, x, 6, 1, 1, PAL.L2);
    px(g, 0, 6, 5, 3, PAL.A1);                       // counterweight
    px(g, 25, 6, 1, 9, PAL.A1);                      // cable
    px(g, 24, 15, 3, 2, PAL.RD);                     // hook load
    px(g, 5, 2, 4, 3, PAL.WH); px(g, 6, 3, 2, 1, PAL.GL1); // cab
  });
  bakeSprite('laundry0', 16, 10, (g) => {
    px(g, 0, 2, 1, 8, PAL.WD1); px(g, 15, 2, 1, 8, PAL.WD1);
    px(g, 0, 3, 16, 1, PAL.A1);
    px(g, 2, 4, 3, 3, PAL.WH); px(g, 7, 4, 2, 4, PAL.GL2); px(g, 11, 4, 3, 2, PAL.YL);
  });
  bakeSprite('laundry1', 16, 10, (g) => {
    px(g, 0, 2, 1, 8, PAL.WD1); px(g, 15, 2, 1, 8, PAL.WD1);
    px(g, 0, 3, 16, 1, PAL.A1);
    px(g, 3, 4, 3, 3, PAL.WH); px(g, 8, 4, 2, 4, PAL.GL2); px(g, 12, 4, 3, 2, PAL.YL);
  });
  bakeSprite('flag0', 8, 10, (g) => {
    px(g, 1, 0, 1, 10, PAL.A1); px(g, 2, 1, 5, 3, PAL.RD); px(g, 2, 1, 5, 1, PAL.B4);
  });
  bakeSprite('flag1', 8, 10, (g) => {
    px(g, 1, 0, 1, 10, PAL.A1); px(g, 2, 1, 4, 3, PAL.RD); px(g, 5, 2, 2, 2, PAL.B2);
  });
  bakeSprite('bridgeH', 40, 22, (g) => { // deck for 2x4-tile bridge over a canal (built dynamically too)
  }, true);

  // --- people: 3 walk frames x theme colours are tinted at draw time via variants ---
  THEMES.forEach((shirt, ti) => {
    for (let f = 0; f < 3; f++) {
      bakeSprite(`ped${ti}_${f}`, 5, 9, (g) => {
        const hair = [PAL.OUT, PAL.WD1, PAL.YL, PAL.A2][(ti + f) % 4];
        px(g, 1, 0, 3, 1, hair);
        px(g, 1, 1, 3, 2, PAL.SK);
        px(g, 1, 3, 3, 3, shirt);
        if (f === 0) { px(g, 1, 6, 1, 2, PAL.A1); px(g, 3, 6, 1, 2, PAL.A1); }
        if (f === 1) { px(g, 0, 6, 1, 2, PAL.A1); px(g, 3, 6, 1, 1, PAL.A1); px(g, 3, 7, 1, 1, PAL.A1); }
        if (f === 2) { px(g, 1, 6, 1, 1, PAL.A1); px(g, 1, 7, 1, 1, PAL.A1); px(g, 4, 6, 1, 2, PAL.A1); }
      });
    }
  });
  // --- cars: orientation X (moving along +x screen SE) and Y; colours ---
  const CARCOLS = [PAL.RD, PAL.YL, PAL.GL1, PAL.WH, PAL.A3, PAL.G3];
  CARCOLS.forEach((col, ci) => {
    bakeSprite(`carX${ci}`, 13, 9, (g) => {
      px(g, 1, 3, 11, 3, col);
      px(g, 3, 1, 6, 2, col); px(g, 4, 1, 4, 2, PAL.GL2);
      px(g, 1, 5, 11, 1, ci === 3 ? PAL.P2 : col);
      px(g, 2, 6, 2, 2, PAL.OUT); px(g, 9, 6, 2, 2, PAL.OUT);
      px(g, 11, 4, 1, 1, PAL.L1);
    });
    bakeSprite(`carY${ci}`, 13, 9, (g) => {
      px(g, 1, 3, 11, 3, col);
      px(g, 4, 1, 6, 2, col); px(g, 5, 1, 4, 2, PAL.GL2);
      px(g, 2, 6, 2, 2, PAL.OUT); px(g, 9, 6, 2, 2, PAL.OUT);
      px(g, 1, 4, 1, 1, PAL.L1);
    });
  });
  bakeSprite('vanX', 15, 11, (g) => {
    px(g, 1, 2, 13, 6, PAL.WH);
    px(g, 10, 3, 4, 3, PAL.GL2);
    px(g, 2, 4, 6, 2, PAL.V2); // tiny delivery livery (violet is UI-only; vans are the one deliberate wink) -> keep neutral instead
    px(g, 2, 4, 6, 2, PAL.GL1);
    px(g, 2, 8, 2, 2, PAL.OUT); px(g, 11, 8, 2, 2, PAL.OUT);
  });
  bakeSprite('cycl0', 7, 9, (g) => {
    px(g, 1, 6, 2, 2, PAL.OUT); px(g, 4, 6, 2, 2, PAL.OUT);
    px(g, 2, 3, 3, 3, PAL.GL1); px(g, 3, 1, 2, 2, PAL.SK); px(g, 3, 0, 2, 1, PAL.RD);
  });
  bakeSprite('cycl1', 7, 9, (g) => {
    px(g, 1, 6, 2, 2, PAL.OUT); px(g, 4, 6, 2, 2, PAL.OUT);
    px(g, 2, 3, 3, 3, PAL.GL1); px(g, 3, 1, 2, 2, PAL.SK); px(g, 3, 0, 2, 1, PAL.RD);
    px(g, 2, 4, 1, 1, PAL.SK);
  });
  // pigeons
  bakeSprite('pig0', 4, 4, (g) => { px(g, 0, 1, 3, 2, PAL.S3); px(g, 3, 0, 1, 2, PAL.S2); });
  bakeSprite('pig1', 4, 4, (g) => { px(g, 0, 1, 3, 2, PAL.S3); px(g, 3, 2, 1, 1, PAL.S2); });
  bakeSprite('pigf0', 6, 4, (g) => { px(g, 1, 1, 3, 1, PAL.S3); px(g, 0, 0, 2, 1, PAL.S2); px(g, 4, 0, 2, 1, PAL.S2); });
  bakeSprite('pigf1', 6, 4, (g) => { px(g, 1, 1, 3, 1, PAL.S3); px(g, 0, 2, 2, 1, PAL.S2); px(g, 4, 2, 2, 1, PAL.S2); });
  // cats
  bakeSprite('cat0', 6, 5, (g) => {
    px(g, 1, 2, 3, 2, PAL.B4); px(g, 3, 1, 2, 2, PAL.B4); px(g, 3, 0, 1, 1, PAL.B4);
    px(g, 0, 1, 1, 2, PAL.B3);
  });
  bakeSprite('cat1', 6, 5, (g) => {
    px(g, 1, 2, 3, 2, PAL.B4); px(g, 3, 1, 2, 2, PAL.B4); px(g, 3, 0, 1, 1, PAL.B4);
    px(g, 0, 3, 1, 1, PAL.B3);
  });
  // canal boat, two orientations
  bakeSprite('boatX', 20, 11, (g) => {
    px(g, 1, 5, 18, 4, PAL.WD2); px(g, 1, 8, 18, 1, PAL.WD1);
    px(g, 3, 3, 6, 3, PAL.WH); px(g, 4, 4, 2, 1, PAL.GL1);
    px(g, 11, 4, 3, 2, PAL.RD); px(g, 15, 4, 3, 2, PAL.YL);
  });
  bakeSprite('boatY', 12, 15, (g) => {
    px(g, 3, 2, 5, 11, PAL.WD2); px(g, 3, 12, 5, 1, PAL.WD1);
    px(g, 4, 3, 3, 3, PAL.WH); px(g, 4, 8, 3, 2, PAL.RD);
  });
  bakeSprite('smoke', 3, 3, (g) => { px(g, 0, 0, 3, 3, 'rgba(210,206,220,0.8)'); px(g, 0, 2, 1, 1, 'rgba(160,158,175,0.8)'); }, true);
  // estate agent's placard: FOR LEASE on a post, planted by boarded shopfronts
  bakeSprite('lease', 25, 20, (g) => {
    px(g, 1, 1, 23, 14, PAL.WH);
    px(g, 1, 1, 23, 1, PAL.RD); px(g, 1, 14, 23, 1, PAL.RD);
    drawText3x5(g, 7, 3, 'FOR', PAL.RD);
    drawText3x5(g, 3, 9, 'LEASE', PAL.RD);
    px(g, 11, 15, 2, 5, PAL.WD1);
  });
  // sitting dog, tail at rest / tail up (wag)
  bakeSprite('dog0', 7, 6, (g) => {
    px(g, 1, 2, 3, 3, PAL.WD3); px(g, 3, 1, 2, 2, PAL.WD3); px(g, 4, 0, 1, 1, PAL.WD1);
    px(g, 0, 4, 1, 1, PAL.WD1); px(g, 3, 2, 1, 1, PAL.OUT);
  });
  bakeSprite('dog1', 7, 6, (g) => {
    px(g, 1, 2, 3, 3, PAL.WD3); px(g, 3, 1, 2, 2, PAL.WD3); px(g, 4, 0, 1, 1, PAL.WD1);
    px(g, 0, 2, 1, 2, PAL.WD1); px(g, 3, 2, 1, 1, PAL.OUT);
  });
  // harbour buoy, lamp on / off
  bakeSprite('buoy0', 5, 8, (g) => {
    px(g, 1, 4, 3, 3, PAL.RD); px(g, 1, 5, 3, 1, PAL.WH); px(g, 2, 2, 1, 2, PAL.A1); px(g, 2, 1, 1, 1, PAL.L1);
  });
  bakeSprite('buoy1', 5, 8, (g) => {
    px(g, 1, 4, 3, 3, PAL.RD); px(g, 1, 5, 3, 1, PAL.WH); px(g, 2, 2, 1, 2, PAL.A1); px(g, 2, 1, 1, 1, PAL.L2);
  });
  // park fountain: stone basin, column, three spray frames
  for (let f = 0; f < 3; f++) {
    bakeSprite('fount' + f, 14, 14, (g) => {
      px(g, 1, 9, 12, 4, PAL.P3); px(g, 1, 12, 12, 1, PAL.P1);
      px(g, 2, 10, 10, 2, PAL.W3); px(g, 3 + ((f * 3) % 5), 10, 2, 1, PAL.W4);
      px(g, 6, 5, 2, 5, PAL.C2); px(g, 5, 4, 4, 1, PAL.C1);
      const sp = [[6, 2, 1, 2], [7, 1, 1, 3], [5, 1, 1, 2]][f];
      px(g, sp[0], sp[1], sp[2], sp[3], PAL.W4);
      px(g, 4, 6 + f % 2, 1, 2, PAL.W3); px(g, 9, 7 - f % 2, 1, 2, PAL.W3);
    });
  }

  // --- seasonal tree variants (same canopy, different palette + decorations) ---
  // spring trees flower fully: a blossom canopy, not a green one with confetti
  bakeTreeVariant('tree_sp', '#e9a6c4', '#f7d6e6', '#c97fa6', (g) => {
    for (let k = 0; k < 9; k++) {
      const h2 = h32(k, 3, 41);
      const xx = 1 + h2 % 9, yy = 2 + (h2 >> 4) % 8;
      const dx = xx - 5, dy = (yy - 6) * 1.15;
      if (dx * dx + dy * dy <= 24) px(g, xx, yy, 1, 1, k % 3 ? '#fdf3f8' : '#b05f8c');
    }
  });
  bakeTreeVariant('tree_au', '#b0722c', '#d18f43', '#8a5426', (g) => {
    for (let k = 0; k < 4; k++) {
      const h2 = h32(k, 5, 43);
      const xx = 1 + h2 % 9, yy = 2 + (h2 >> 4) % 8;
      const dx = xx - 5, dy = (yy - 6) * 1.15;
      if (dx * dx + dy * dy <= 24) px(g, xx, yy, 1, 1, PAL.RD);
    }
  });
  bakeSprite('tree_wi', 11, 16, (g) => {   // bare winter tree with snow on the branches
    px(g, 5, 8, 2, 7, PAL.WD1);
    px(g, 3, 6, 2, 1, PAL.WD1); px(g, 2, 5, 1, 1, PAL.WD1);
    px(g, 7, 5, 2, 1, PAL.WD1); px(g, 9, 4, 1, 1, PAL.WD1);
    px(g, 5, 4, 1, 4, PAL.WD1); px(g, 4, 3, 1, 1, PAL.WD1); px(g, 6, 2, 1, 2, PAL.WD1);
    // snow resting on the branch tops
    px(g, 2, 4, 1, 1, '#eef2f8'); px(g, 3, 5, 2, 1, '#eef2f8');
    px(g, 7, 4, 2, 1, '#eef2f8'); px(g, 9, 3, 1, 1, '#eef2f8');
    px(g, 4, 2, 1, 1, '#eef2f8'); px(g, 6, 1, 1, 1, '#eef2f8'); px(g, 5, 3, 1, 1, '#dde5f0');
  });

  // --- winter (snow-capped) prop variants via the generic snow pass ---
  for (const nm of ['lamp', 'bench', 'hydrant', 'stall', 'kioskstand', 'lease', 'crane']) {
    SPR[nm + '_wi'] = snowify(SPR[nm]);
  }

  // --- glow + marker sprites (no outline: soft light) ---
  bakeSprite('lampglow', 30, 16, (g) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 30; x++) {
      const d = ((x - 15) / 14) ** 2 + ((y - 8) / 7) ** 2;
      if (d <= 1) {
        const a = d < 0.14 ? 0.42 : d < 0.4 ? 0.24 : d < 0.72 ? 0.12 : 0.05;
        g.fillStyle = `rgba(255,207,94,${a})`;
        g.fillRect(x, y, 1, 1);
      }
    }
  }, true);
  bakeSprite('doorglow', 18, 14, (g) => {
    for (let y = 0; y < 14; y++) for (let x = 0; x < 18; x++) {
      const d = ((x - 9) / 8.6) ** 2 + ((y - 7) / 6.6) ** 2;
      if (d <= 1) {
        const a = d < 0.16 ? 0.5 : d < 0.45 ? 0.3 : d < 0.75 ? 0.16 : 0.07;
        g.fillStyle = `rgba(255,214,120,${a})`;
        g.fillRect(x, y, 1, 1);
      }
    }
  }, true);
  bakeSprite('plrhalo', 9, 9, (g) => {
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      const d = (x - 4) * (x - 4) + (y - 4) * (y - 4);
      if (d <= 16) {
        g.fillStyle = `rgba(133,130,255,${d <= 3 ? 0.42 : d <= 8 ? 0.24 : 0.10})`;
        g.fillRect(x, y, 1, 1);
      }
    }
  }, true);
  bakeSprite('plrdot', 3, 3, (g) => { px(g, 0, 0, 3, 3, PAL.V1); px(g, 1, 1, 1, 1, '#dcdaff'); }, true);
  for (let f = 0; f < 2; f++) {
    bakeSprite('ring' + f, 22, 11, (g) => {
      const rx = 9.5 - f, ry = 4.6 - f * 0.6;
      for (let a = 0; a < 72; a++) {
        const th = a / 72 * Math.PI * 2;
        const x = Math.round(10.5 + Math.cos(th) * rx), y = Math.round(5 + Math.sin(th) * ry);
        g.fillStyle = 'rgba(133,130,255,0.85)';
        g.fillRect(x, y, 1, 1);
      }
    }, true);
  }
  bakeSprite('moon', 12, 12, (g) => {
    for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) {
      const d = (x - 5.5) * (x - 5.5) + (y - 5.5) * (y - 5.5);
      if (d <= 27) px(g, x, y, 1, 1, '#e9e6d2');
    }
    px(g, 3, 4, 2, 2, '#cbc7ae'); px(g, 7, 7, 2, 1, '#cbc7ae'); px(g, 6, 3, 1, 1, '#cbc7ae');
    px(g, 4, 8, 1, 1, '#cbc7ae'); px(g, 8, 4, 1, 2, '#d8d4bc');
  }, true);

  bakePlayerSprites();
}

/* seasonal tree canopy with palette + decoration hook */
function bakeTreeVariant(name, main, lit, dark, decoFn) {
  bakeSprite(name, 11, 16, (g) => {
    px(g, 5, 11, 2, 4, PAL.WD1);
    for (let yy = 1; yy <= 11; yy++) for (let xx = 0; xx < 11; xx++) {
      const dx = xx - 5, dy = (yy - 6) * 1.15;
      if (dx * dx + dy * dy <= 27) {
        let c = main;
        if (dx - dy < -3) c = lit;
        else if (dx - dy > 4) c = dark;
        if (((xx + yy) & 1) === 0 && dx * dx + dy * dy > 15) c = (dx - dy < 0) ? main : dark;
        px(g, xx, yy, 1, 1, c);
      }
    }
    if (decoFn) decoFn(g);
  });
}

/* generic snow pass: white caps on every upward-facing silhouette edge */
function snowify(src) {
  const [c, g] = mkCv(src.width, src.height);
  g.drawImage(src, 0, 0);
  const W = c.width, H = c.height;
  const im = g.getImageData(0, 0, W, H), d = im.data;
  const solid = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) solid[i] = d[i * 4 + 3] > 10 ? 1 : 0;
  const set = (i, r, g2, b2) => { d[i * 4] = r; d[i * 4 + 1] = g2; d[i * 4 + 2] = b2; d[i * 4 + 3] = 255; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (!solid[i]) continue;
    if (y === 0 || !solid[i - W]) {
      set(i, 238, 243, 250);
      if (y + 1 < H && solid[i + W] && ((x + y) & 1)) set(i + W, 205, 216, 232);
    }
  }
  g.putImageData(im, 0, 0);
  atlasStats.sprites++;
  return c;
}

/* ==========================================================================
   THE COURIER - original explorer sprite (indigo cap, glowing doc satchel)
   5 authored facings x 4 walk frames; W/SW/NW come from horizontal flips.
   ========================================================================== */
function bakePlayerSprites() {
  const COAT = '#f0e7cf', COATD = '#cfc3a4', IND = PAL.V1, SKN = PAL.SK,
        EYE = '#2a2438', LEG = '#3a3648', BAG = PAL.WD2, BAGD = PAL.WD1,
        GLOW = '#c7c5ff', HAIR = '#4a4036';
  for (const dn of ['s', 'se', 'e', 'ne', 'n']) {
    for (let f = 0; f < 4; f++) {
      bakeSprite(`plr_${dn}_${f}`, 11, 15, (g) => {
        const stride = (f === 1 || f === 3);
        const yb = stride ? -1 : 0;              // body bob on passing frames
        /* legs, feet baseline y=13 */
        if (dn === 'e') {
          if (stride) {
            px(g, 3, 10, 1, 3, LEG); px(g, 7, 10, 1, 3, LEG);
            px(g, 2, 12, 2, 1, LEG); px(g, 7, 12, 2, 1, LEG);
          } else {
            px(g, 4, 10, 1, 4, LEG); px(g, 6, 10, 1, 4, LEG);
          }
        } else {
          const ll = f === 1 ? 4 : f === 3 ? 2 : 3;
          const rl = f === 3 ? 4 : f === 1 ? 2 : 3;
          px(g, 4, 10, 1, ll, LEG);
          px(g, 6, 10, 1, rl, LEG);
          if (f === 0 || f === 2) { px(g, 4, 13, 1, 1, LEG); px(g, 6, 13, 1, 1, LEG); }
        }
        /* torso */
        px(g, 3, 6 + yb, 5, 4, COAT);
        px(g, 7, 6 + yb, 1, 4, COATD);
        /* arms swing opposite the legs */
        const armL = f === 1 ? 1 : f === 3 ? -1 : 0;
        px(g, 2, 6 + yb + armL, 1, 3, COATD);
        px(g, 8, 6 + yb - armL, 1, 3, COATD);
        /* head + indigo cap */
        if (dn === 'n' || dn === 'ne') {
          px(g, 4, 1 + yb, 3, 1, IND);
          px(g, 3, 2 + yb, 5, 2, IND);
          px(g, 3, 4 + yb, 5, 1, HAIR);
          px(g, 3, 5 + yb, 5, 1, IND);        // scarf back
          /* strap X across the back */
          px(g, 4, 6 + yb, 1, 1, IND); px(g, 5, 7 + yb, 1, 1, IND); px(g, 6, 8 + yb, 1, 1, IND);
          px(g, 6, 6 + yb, 1, 1, IND); px(g, 4, 8 + yb, 1, 1, IND);
          if (dn === 'ne') px(g, 7, 3 + yb, 1, 1, SKN);  // cheek peeking out
        } else {
          px(g, 4, 1 + yb, 3, 1, IND);
          px(g, 3, 2 + yb, 5, 1, IND);
          px(g, 4, 3 + yb, 3, 2, SKN);
          if (dn === 's') { px(g, 4, 4 + yb, 1, 1, EYE); px(g, 6, 4 + yb, 1, 1, EYE); }
          if (dn === 'se') { px(g, 5, 4 + yb, 1, 1, EYE); px(g, 6, 4 + yb, 1, 1, EYE); px(g, 7, 2 + yb, 1, 1, IND); }
          if (dn === 'e') { px(g, 6, 4 + yb, 1, 1, EYE); px(g, 7, 2 + yb, 1, 1, IND); }
          px(g, 3, 5 + yb, 5, 1, IND);        // scarf
          /* glowing document satchel worn at the front-left */
          const bx = dn === 'e' ? 2 : 3;
          px(g, bx, 7 + yb, 3, 3, BAG);
          px(g, bx, 7 + yb, 3, 1, BAGD);
          px(g, bx + 1, 8 + yb, 1, 1, GLOW);
          px(g, bx + 3, 6 + yb, 1, 1, IND);   // strap
          px(g, bx + 4, 5 + yb, 1, 1, IND);
        }
      });
    }
  }
}

/* ==========================================================================
   CITY MODEL
   ========================================================================== */
function log2q(words) {
  return clamp((Math.log(words) - Math.log(79)) / (Math.log(10828) - Math.log(79)), 0, 1);
}

function buildingSpecFor(slug, page) {
  const words = GRAPH.words[slug] || 200;
  const code = GRAPH.code[slug] || 0;
  const inb = GRAPH.inbound[slug] || 0;
  const q = log2q(words);
  let s = 1 + Math.round(q * 8);
  let fw = q < 0.35 ? 1 : q < 0.78 ? 2 : 3;
  let fd = fw;
  if (fw > 1 && rng() < 0.45) fd = fw - 1;
  if (rng() < 0.5 && fw < 3 && fd === fw) { /* keep square sometimes */ }

  const sl = slug.toLowerCase(), title = (page.title || '').toLowerCase();
  const nTables = page.blocks ? countKind(page.blocks, 'table') : 0;
  let style;
  if (!GRAPH.inbound[slug]) style = 'boarded';
  else if (sl.includes('/migration/') && words >= 160) style = 'scaffold';
  else if (words < 160) style = 'kiosk';
  else if (sl.startsWith('/cms/api') || code >= 10) style = 'office';
  else if (sl.includes('quick-start') || sl.includes('/guides') || sl.includes('tutorial') || title.startsWith('how to')) style = 'workshop';
  else if (nTables >= 6 || sl.includes('/configurations/')) style = 'records';
  else if (inb >= 10) style = 'civic';
  else style = 'shop';

  if (sl.includes('/migration/') && words < 160) style = 'kiosk';
  if (!GRAPH.inbound[slug]) { fw = Math.min(fw, 2); fd = Math.min(fd, 2); s = clamp(s, 1, 3); }
  if (style === 'kiosk') { fw = 1; fd = 1; s = 1; }
  if (style === 'workshop') { s = clamp(s, 1, 3); fw = Math.max(fw, 2); }
  if (style === 'records') { fw = Math.max(fw, 2); fd = Math.max(1, fw - 1); s = clamp(s, 1, 3); }
  if (style === 'civic') { fw = Math.max(fw, 2); fd = Math.max(fd, 2); s = clamp(s, 2, 5); }
  if (style === 'office') s = Math.max(s, 3);

  let mh = 2166136261 >>> 0;                       // FNV-1a over the slug: stable facade/roof motif
  for (let i = 0; i < slug.length; i++) { mh ^= slug.charCodeAt(i); mh = Math.imul(mh, 16777619) >>> 0; }

  return {
    slug, fw, fd, s, style,
    motif: mh % 3,
    words, code, inb,
    lit: code,
    dome: style === 'civic' && inb >= 20,
    wallset: style === 'office' ? WALLSETS[rint(2) ? 0 : 3] : (style === 'civic' || style === 'records') ? WALLSETS[1] : WALLSETS[rint(3)],
    roofset: pick([[PAL.B3, PAL.B2], [PAL.B2, PAL.B1], [PAL.S2, PAL.S1]]),
    awn: pick([PAL.RD, PAL.YL, PAL.G3]),
    sign: null
  };
}
function countKind(bs, kind) {
  let n = 0;
  for (const b of bs || []) {
    if (b.t === kind) n++;
    if (b.blocks) n += countKind(b.blocks, kind);
    if (b.tabs) for (const t2 of b.tabs) n += countKind(t2.blocks || [], kind);
    if (b.cols) for (const c2 of b.cols) n += countKind(c2, kind);
  }
  return n;
}

function buildModel() {
  pagesBySlug = DATA.pages;
  ORDER = DATA.order;
  NAV = DATA.nav;
  edgeCount = GRAPH.edges.length;

  // hubs = 4 most-cited pages
  hubs = Object.entries(GRAPH.inbound).sort((a, b2) => b2[1] - a[1]).slice(0, 4).map(e => e[0]);
  const HUBNAMES = {
    '/cms/api/rest': 'REST', '/cms/api/document-service': 'DOC API',
    '/cms/features/users-permissions': 'USERS', '/cms/migration/v4-to-v5/breaking-changes': 'V4 TO V5'
  };
  for (const s of Object.keys(pagesBySlug)) if (!GRAPH.inbound[s]) uncitedSet.add(s);

  // communities + back lane of unfiled pages
  const inComm = new Set();
  COMMS.forEach(c => c.members.forEach(m => inComm.add(m)));
  const unfiled = Object.keys(pagesBySlug).filter(s => !inComm.has(s)).sort();
  const commList = COMMS.map((c, i) => ({ id: i, name: c.dominant, hub: c.hub, members: c.members.slice() }));
  commList.push({ id: commList.length, name: 'Back lane', hub: unfiled[0], members: unfiled, backlane: true });

  // building specs
  const specBySlug = {};
  const orderIdx = {};
  ORDER.forEach((s, i) => orderIdx[s] = i);
  for (const s of Object.keys(pagesBySlug)) {
    const spec = buildingSpecFor(s, pagesBySlug[s]);
    if (HUBNAMES[s] && hubs.includes(s)) spec.sign = HUBNAMES[s];
    else if (hubs.includes(s)) spec.sign = s.split('/').pop().slice(0, 7).toUpperCase().replace(/[^A-Z0-9 -]/g, '');
    specBySlug[s] = spec;
  }

  // community adjacency weights (for placement chaining)
  const commOf = {};
  commList.forEach(c => c.members.forEach(m => commOf[m] = c.id));
  const wMat = {};
  for (const [a, b2] of GRAPH.edges) {
    const ca = commOf[a], cb = commOf[b2];
    if (ca === undefined || cb === undefined || ca === cb) continue;
    const k = ca < cb ? ca + ':' + cb : cb + ':' + ca;
    wMat[k] = (wMat[k] || 0) + 1;
  }
  // per-community external degree (drives traffic density)
  const extDeg = new Array(commList.length).fill(0);
  for (const k in wMat) { const [a, b2] = k.split(':').map(Number); extDeg[a] += wMat[k]; extDeg[b2] += wMat[k]; }

  // median reading order per community
  const medOrder = commList.map(c => {
    const os = c.members.map(m => orderIdx[m] ?? 999).sort((x, y) => x - y);
    return os[os.length >> 1];
  });

  // greedy chain: start at the community of order[0], then strongest link to last placed
  const startC = commOf[ORDER[0]];
  const placedSeq = [startC];
  const left = new Set(commList.map(c => c.id)); left.delete(startC);
  const blId = commList.length - 1; left.delete(blId); // back lane forced last
  while (left.size) {
    const last = placedSeq[placedSeq.length - 1];
    let best = null, bestW = -Infinity;
    for (const c of left) {
      const k = last < c ? last + ':' + c : c + ':' + last;
      const w2 = (wMat[k] || 0) * 1000 - Math.abs(medOrder[c] - medOrder[last]);
      if (w2 > bestW) { bestW = w2; best = c; }
    }
    placedSeq.push(best); left.delete(best);
  }
  placedSeq.push(blId);

  // ---- pack each community into a quarter rect ----
  quarters = placedSeq.map((cid, qi) => {
    const c = commList[cid];
    const specs = c.members.map(m => specBySlug[m]).sort((a, b2) => (b2.fw * b2.fd) - (a.fw * a.fd));
    let area = 0; specs.forEach(sp => area += (sp.fw + 1) * (sp.fd + 1));
    let qw = clamp(Math.ceil(Math.sqrt(area * 1.6)) + 2, 7, 26);
    // shelf pack
    let placed;
    for (; ; qw++) {
      placed = []; let x = 1, y = 1, shelfH = 0;
      for (const sp of specs) {
        if (x + sp.fw > qw - 1) { y += shelfH + 1; x = 1; shelfH = 0; }
        placed.push({ sp, x, y }); shelfH = Math.max(shelfH, sp.fd); x += sp.fw + 1;
      }
      const qh = y + shelfH + 2;
      if (qh <= qw * 1.9 || qw >= 26) {
        return {
          id: cid, name: c.name, hub: c.hub, members: c.members, backlane: !!c.backlane,
          qw, qh, lots: placed, theme: THEMES[qi % THEMES.length], themeIdx: qi % THEMES.length,
          migration: c.members.some(m => m.includes('/migration/')),
          extDeg: extDeg[cid] || 0
        };
      }
    }
  });

  // ---- rows (boustrophedon by placement sequence) ----
  const totalArea = quarters.reduce((a, q) => a + q.qw * q.qh, 0);
  const targetW = Math.ceil(Math.sqrt(totalArea) * 1.5);
  const rows = [];
  let row = [], rw = 0;
  for (const q of quarters) {
    if (rw + q.qw + 2 > targetW && row.length) { rows.push(row); row = []; rw = 0; }
    row.push(q); rw += q.qw + 2;
  }
  if (row.length) rows.push(row);

  const coreW = Math.max(...rows.map(r => r.reduce((a, q) => a + q.qw + 2, 2)));
  const SEAM = 3, BK = 1;
  const coreX = SEAM + BK;      // core starts with ring roadV (2 wide)
  let y = SEAM + BK;
  const rowsMeta = [];
  for (let r = 0; r < rows.length; r++) {
    const qhMax = Math.max(...rows[r].map(q => q.qh));
    rowsMeta.push({ y, qhMax, list: rows[r] });
    y += 2 + qhMax + 2;               // roadH + quarters + roadH
    if (r < rows.length - 1) y += 4;  // canal band
  }
  Wt = coreX + coreW + BK + SEAM;
  Ht = y + BK + SEAM;

  grid = new Uint8Array(Wt * Ht);
  hdir = new Int8Array(Wt * Ht);
  vdir = new Int8Array(Wt * Ht);
  quarterOf = new Int16Array(Wt * Ht).fill(-1);
  const G = (x, yy) => yy * Wt + x;

  // sea everywhere, bank ring
  grid.fill(T.SEA);
  for (let xx = SEAM; xx < Wt - SEAM; xx++) { grid[G(xx, SEAM)] = T.BANK; grid[G(xx, Ht - SEAM - 1)] = T.BANK; }
  for (let yy = SEAM; yy < Ht - SEAM; yy++) { grid[G(SEAM, yy)] = T.BANK; grid[G(Wt - SEAM - 1, yy)] = T.BANK; }

  const roadVxs = [];  // x positions of all vertical road pairs, per row: {x, y0, y1}
  const paint = (x, yy, t2) => { if (x >= 0 && yy >= 0 && x < Wt && yy < Ht) grid[G(x, yy)] = t2; };

  rowsMeta.forEach((rm, r) => {
    const { y: ry, qhMax, list } = rm;
    // roadH bands above and below the quarter row (full core width)
    for (let band = 0; band < 2; band++) {
      const by = band === 0 ? ry : ry + 2 + qhMax;
      for (let dy = 0; dy < 2; dy++) for (let xx = coreX; xx < coreX + coreW; xx++) {
        paint(xx, by + dy, T.ROAD); hdir[G(xx, by + dy)] = dy === 0 ? -1 : 1;
      }
    }
    // quarters + roadV gaps
    const dir = (r % 2 === 0) ? 1 : -1; // boustrophedon reading direction (visual: parks pool at alternating ends)
    let xc = coreX;
    const seq = dir === 1 ? list : list.slice().reverse();
    // leading ring roadV
    const stamps = [];
    for (const q of seq) {
      // roadV before quarter
      roadVxs.push({ x: xc, y0: ry, y1: ry + 4 + qhMax });
      for (let dx = 0; dx < 2; dx++) for (let yy = ry; yy < ry + 4 + qhMax; yy++) {
        paint(xc + dx, yy, T.ROAD); vdir[G(xc + dx, yy)] = dx === 0 ? -1 : 1;
      }
      stamps.push({ q, x: xc + 2 });
      xc += 2 + q.qw;
    }
    // trailing roadV
    roadVxs.push({ x: xc, y0: ry, y1: ry + 4 + qhMax });
    for (let dx = 0; dx < 2; dx++) for (let yy = ry; yy < ry + 4 + qhMax; yy++) {
      paint(xc + dx, yy, T.ROAD); vdir[G(xc + dx, yy)] = dx === 0 ? -1 : 1;
    }
    // park fill to core edge
    for (let xx = xc + 2; xx < coreX + coreW; xx++) for (let yy = ry + 2; yy < ry + 2 + qhMax; yy++) {
      paint(xx, yy, rng() < 0.14 ? T.FLOWER : T.GRASS);
    }
    // far ring roadV at core right edge
    if (xc + 2 < coreX + coreW) {
      const fx = coreX + coreW - 2;
      roadVxs.push({ x: fx, y0: ry, y1: ry + 4 + qhMax });
      for (let dx = 0; dx < 2; dx++) for (let yy = ry; yy < ry + 4 + qhMax; yy++) {
        paint(fx + dx, yy, T.ROAD); vdir[G(fx + dx, yy)] = dx === 0 ? -1 : 1;
      }
    }
    // stamp quarters
    for (const st of stamps) {
      const q = st.q; q.qx = st.x; q.qy = ry + 2;
      stampQuarter(q);
      // vertical park pad below short quarters
      for (let yy = q.qy + q.qh; yy < ry + 2 + qhMax; yy++)
        for (let xx = q.qx; xx < q.qx + q.qw; xx++)
          paint(xx, yy, rng() < 0.12 ? T.FLOWER : T.GRASS);
    }
    // canal band below (if any)
    if (r < rowsMeta.length - 1) {
      const cy = ry + 4 + qhMax;
      for (let xx = 0; xx < Wt; xx++) {
        if (grid[G(xx, cy)] !== T.SEA) paint(xx, cy, T.BANK);
        paint(xx, cy + 1, T.WATER); paint(xx, cy + 2, T.WATER);
        if (grid[G(xx, cy + 3)] !== T.SEA) paint(xx, cy + 3, T.BANK);
      }
      canalWaterYs.push(cy + 1);
      // bridges: left ring, right ring, centre
      const bx = [coreX, coreX + coreW - 2, coreX + (coreW >> 1) & ~1];
      for (const bxx of bx) for (let dx = 0; dx < 2; dx++) for (let dy2 = 0; dy2 < 4; dy2++) {
        paint(bxx + dx, cy + dy2, T.BRIDGE); vdir[G(bxx + dx, cy + dy2)] = dx === 0 ? -1 : 1;
      }
    }
  });

  // crossings at roadV/roadH junctions
  for (const rv of roadVxs) {
    for (const yy of [rv.y0 + 1, rv.y1 - 2]) {  // mid of each roadH band
      for (const cx2 of [rv.x - 1, rv.x + 2]) {
        for (let dy = -1; dy <= 0; dy++) {
          const yy2 = yy + dy;
          if (cx2 >= 0 && cx2 < Wt && grid[G(cx2, yy2)] === T.ROAD && hdir[G(cx2, yy2)]) {
            grid[G(cx2, yy2)] = T.CROSS; crossTiles.add(cx2 + ',' + yy2);
          }
        }
      }
      for (const cy2 of [yy - 2, yy + 1]) {
        if (cy2 >= 0 && cy2 < Ht && grid[G(rv.x, cy2)] === T.ROAD && vdir[G(rv.x, cy2)]) {
          grid[G(rv.x, cy2)] = T.CROSS; grid[G(rv.x + 1, cy2)] = T.CROSS;
          crossTiles.add(rv.x + ',' + cy2); crossTiles.add((rv.x + 1) + ',' + cy2);
        }
      }
    }
  }

  // world pixel dims
  worldW = (Wt + Ht) * HW + 4;
  worldH = (Wt + Ht) * HH + 130;
  OX = Ht * HW + 2;
  OY = 110;
}

function stampQuarter(q) {
  const G = (x, yy) => yy * Wt + x;
  for (let yy = 0; yy < q.qh; yy++) for (let xx = 0; xx < q.qw; xx++) {
    const gx = q.qx + xx, gy = q.qy + yy;
    grid[G(gx, gy)] = T.PAVE;
    quarterOf[G(gx, gy)] = q.id;
  }
  // lots
  for (const lot of q.lots) {
    for (let yy = 0; yy < lot.sp.fd; yy++) for (let xx = 0; xx < lot.sp.fw; xx++) {
      grid[G(q.qx + lot.x + xx, q.qy + lot.y + yy)] = T.LOT;
    }
    lot.gx = q.qx + lot.x; lot.gy = q.qy + lot.y;
  }
  // greenery + plazas in leftover paving
  for (let yy = 1; yy < q.qh - 1; yy++) for (let xx = 1; xx < q.qw - 1; xx++) {
    const gx = q.qx + xx, gy = q.qy + yy;
    if (grid[G(gx, gy)] !== T.PAVE) continue;
    const r = rng();
    if (r < 0.10) grid[G(gx, gy)] = T.GRASS;
    else if (r < 0.14) grid[G(gx, gy)] = T.FLOWER;
    else if (r < 0.30) grid[G(gx, gy)] = T.PLAZA;
  }
  // planted square in front of every zero-code page (flowerbed on the tile south of the lot)
  for (const lot of q.lots) {
    if (lot.sp.code === 0 && lot.sp.style !== 'boarded') {
      const fy = lot.gy + lot.sp.fd, fx = lot.gx;
      if (fy < q.qy + q.qh && grid[G(fx, fy)] === T.PAVE || grid[G(fx, fy)] === T.PLAZA) grid[G(fx, fy)] = T.FLOWER;
    }
  }
}

/* ==========================================================================
   LAYER BAKE (ground + 3 animated water frames)
   ========================================================================== */
const isoX = (tx, ty) => OX + (tx - ty) * HW;
const isoY = (tx, ty) => OY + (tx + ty) * HH;

/* per-season ground palette: grass ramp, flowerbed base, flower colours, specks */
const SEASON_GROUND = [
  { g1: '#4f9447', g2: '#82c25a', g3: '#aadd7c', fbed: '#4f9447', fcols: ['#e88db8', '#f6d7e4', PAL.YL], speck: 'spring' },
  { g1: PAL.G1, g2: PAL.G2, g3: PAL.G3, fbed: PAL.G1, fcols: [PAL.RD, PAL.YL, PAL.WH], speck: null },
  { g1: '#7c5a22', g2: '#a4762e', g3: '#c2933f', fbed: '#7c5a22', fcols: [PAL.YL, '#c96b2e', PAL.RD], speck: 'autumn' },
  { g1: '#8fa0a4', g2: '#c2cfd2', g3: '#e6edf0', fbed: '#9fb0b4', fcols: ['#e6edf0', '#eef2f8', '#c2cfd2'], speck: 'winter' }
];

function bakeWater() {
  waterCvs = [0, 1, 2].map(() => mkCv(worldW, worldH));
  const G = (x, yy) => yy * Wt + x;
  for (let ty = 0; ty < Ht; ty++) for (let tx = 0; tx < Wt; tx++) {
    const t2 = grid[G(tx, ty)];
    if (t2 !== T.SEA && t2 !== T.WATER) continue;
    const cx = isoX(tx, ty), cy = isoY(tx, ty);
    const edgeD = Math.min(tx, ty, Wt - 1 - tx, Ht - 1 - ty);
    for (let f = 0; f < 3; f++) {
      const wg = waterCvs[f][1];
      diamond(wg, cx, cy, t2 === T.SEA ? PAL.W1 : PAL.W2);
      // dithered wave dashes, phase-shifted per frame
      const ph = (tx * 3 + ty * 5 + f * 2) % 6;
      if (ph < 2) { wg.fillStyle = PAL.W3; wg.fillRect(cx - 4 + ph * 2, cy + 3 + ph, 4, 1); }
      if ((tx + ty + f) % 7 === 0) { wg.fillStyle = PAL.W4; wg.fillRect(cx - 1, cy + 5, 2, 1); }
      // deep-water falloff: stipple the outermost sea tiles into the page
      // ground so the diorama edge fades instead of ending on a hard band
      if (t2 === T.SEA && edgeD <= 1) {
        wg.fillStyle = '#124a57'; // matches SKY_DAY so the edge dither blends in daylight
        const step = edgeD === 0 ? 2 : 4;
        for (let yy = 0; yy < 8; yy++) {
          const w2 = DROWS[yy];
          for (let xx = -(w2 >> 1); xx < (w2 >> 1); xx++) {
            if (h32(tx * 16 + xx + 8, ty * 8 + yy, 11) % step === 0) wg.fillRect(cx + xx, cy + yy, 1, 1);
          }
        }
      }
    }
  }
}

/* multiply-tinted copy of a layer, alpha preserved (for golden/night keyframes) */
function tintLayer(src, hex) {
  const [c, g] = mkCv(src.width, src.height);
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = hex;
  g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-over';
  return c;
}

function bakeGrounds() {
  for (let s = 0; s < 4; s++) {
    const day = bakeGroundFor(s);
    groundSets[s] = { day, gold: tintLayer(day, '#ffbe7e'), night: tintLayer(day, '#6d76a8') };
  }
  groundCv = groundSets[season].day;
}

function bakeGroundFor(seasonIdx) {
  const [gc, gg] = mkCv(worldW, worldH);
  const sg = SEASON_GROUND[seasonIdx];
  const G = (x, yy) => yy * Wt + x;

  for (let ty = 0; ty < Ht; ty++) for (let tx = 0; tx < Wt; tx++) {
    const t2 = grid[G(tx, ty)];
    const cx = isoX(tx, ty), cy = isoY(tx, ty);
    if (t2 === T.SEA || t2 === T.WATER) continue;
    const gq = gg;
    switch (t2) {
      case T.BANK: {
        diamond(gq, cx, cy, PAL.P2);
        gq.fillStyle = PAL.P1; gq.fillRect(cx - 6, cy + 6, 12, 1);
        gq.fillStyle = PAL.P3; gq.fillRect(cx - 2, cy + 2, 1, 1);
        break;
      }
      case T.ROAD: case T.CROSS: case T.BRIDGE: {
        if (t2 === T.BRIDGE) {
          diamond(gq, cx, cy, PAL.WD2);
          gq.fillStyle = PAL.WD1; gq.fillRect(cx - 6, cy + 2, 12, 1); gq.fillRect(cx - 6, cy + 5, 12, 1);
          gq.fillStyle = PAL.WD3; gq.fillRect(cx - 4, cy + 3, 8, 1);
          break;
        }
        diamond(gq, cx, cy, PAL.A2);
        if (((tx * 7 + ty * 13) % 11) === 0) { gq.fillStyle = PAL.A1; gq.fillRect(cx - 3, cy + 4, 2, 1); }
        if (t2 === T.CROSS) {
          gq.fillStyle = PAL.WH;
          if (hdir[G(tx, ty)]) {
            // bars perpendicular to a horizontal road: each bar steps down-left
            for (let k = 0; k < 3; k++) for (let s2 = 0; s2 < 3; s2++)
              gq.fillRect(cx + k * 4 - s2 * 2 - 2, cy + 1 + k * 2 + s2, 2, 1);
          } else {
            for (let k = 0; k < 3; k++) for (let s2 = 0; s2 < 3; s2++)
              gq.fillRect(cx - k * 4 + s2 * 2, cy + 1 + k * 2 + s2, 2, 1);
          }
        } else {
          // lane dashes
          if (hdir[G(tx, ty)] && !vdir[G(tx, ty)] && hdir[G(tx, ty)] === 1 && (tx % 2 === 0)) {
            gq.fillStyle = PAL.YL; gq.fillRect(cx - 2, cy + 1, 3, 1);
          }
          if (vdir[G(tx, ty)] && !hdir[G(tx, ty)] && vdir[G(tx, ty)] === 1 && (ty % 2 === 0)) {
            gq.fillStyle = PAL.YL; gq.fillRect(cx - 2, cy + 6, 3, 1);
          }
          if (((tx * 31 + ty * 17) % 23) === 0) { // manhole
            gq.fillStyle = PAL.A3; gq.fillRect(cx - 1, cy + 3, 3, 2); gq.fillStyle = PAL.A1; gq.fillRect(cx, cy + 4, 1, 1);
          }
        }
        break;
      }
      case T.PAVE: {
        diamond(gq, cx, cy, PAL.P2);
        gq.fillStyle = PAL.P1;
        if ((tx + ty) % 2 === 0) gq.fillRect(cx - 4, cy + 4, 1, 1);
        gq.fillRect(cx - DROWS[7] / 2 - 2, cy + 7, DROWS[7] + 4, 1);
        // kerb hint on tiles adjacent to road
        const gi = G(tx, ty + 1);
        if (ty + 1 < Ht && (grid[gi] === T.ROAD || grid[gi] === T.CROSS)) { gq.fillStyle = PAL.P3; gq.fillRect(cx - 4, cy + 6, 8, 1); }
        break;
      }
      case T.PLAZA: {
        diamond(gq, cx, cy, (tx + ty) % 2 ? PAL.P3 : PAL.C2);
        gq.fillStyle = PAL.P1; gq.fillRect(cx - 2, cy + 4, 1, 1); gq.fillRect(cx + 2, cy + 2, 1, 1);
        break;
      }
      case T.GRASS: {
        diamond(gq, cx, cy, sg.g2);
        gq.fillStyle = sg.g3; gq.fillRect(cx - 3, cy + 2, 1, 1); gq.fillRect(cx + 2, cy + 5, 1, 1);
        gq.fillStyle = sg.g1; gq.fillRect(cx - 1, cy + 4, 1, 1);
        break;
      }
      case T.FLOWER: {
        diamond(gq, cx, cy, sg.fbed);
        gq.fillStyle = PAL.WD1;
        gq.fillRect(cx - 5, cy + 3, 1, 2); gq.fillRect(cx + 4, cy + 3, 1, 2);
        const cols = sg.fcols;
        for (let i2 = 0; i2 < 3; i2++) { gq.fillStyle = cols[(tx + ty + i2) % 3]; gq.fillRect(cx - 3 + i2 * 3, cy + 3 + (i2 % 2), 1, 1); }
        break;
      }
      case T.LOT: {
        diamond(gq, cx, cy, PAL.P1);
        // derelict ground: cracks, weeds and the odd bit of rubble
        for (let k = 0; k < 3; k++) {
          const hh = h32(tx, ty, 20 + k);
          const yy = hh % 6 + 1, xx = (hh >> 4) % DROWS[yy] - (DROWS[yy] >> 1);
          const kind = hh % 5;
          gq.fillStyle = kind < 2 ? sg.g1 : kind === 2 ? sg.g2 : kind === 3 ? PAL.A1 : PAL.S2;
          gq.fillRect(cx + xx, cy + yy, kind < 3 ? 1 : 2, 1);
        }
        break;
      }
    }
    // seasonal ground specks: frost patches, fallen leaves, drifted petals
    if (sg.speck && t2 !== T.LOT) {
      for (let k = 0; k < 3; k++) {
        const hh = h32(tx, ty, 60 + k + seasonIdx * 7);
        const yy = hh % 6 + 1, xx = (hh >> 5) % DROWS[yy] - (DROWS[yy] >> 1);
        if (sg.speck === 'winter') {
          if (hh % 3 === 0) { gq.fillStyle = (hh >> 3) % 2 ? '#eef2f8' : '#dbe4ee'; gq.fillRect(cx + xx, cy + yy, (hh >> 9) % 2 ? 2 : 1, 1); }
        } else if (sg.speck === 'autumn') {
          if (hh % 7 === 0 && k < 2 && (t2 === T.PAVE || t2 === T.PLAZA || t2 === T.GRASS || t2 === T.BANK)) {
            gq.fillStyle = [ '#c96b2e', PAL.YL, PAL.B4 ][(hh >> 4) % 3]; gq.fillRect(cx + xx, cy + yy, 1, 1);
          }
        } else if (sg.speck === 'spring') {
          // drifted petals on the paving, daisies and fresh shoots in the lawns
          if (hh % 4 === 0 && (t2 === T.PAVE || t2 === T.PLAZA || t2 === T.BANK)) {
            gq.fillStyle = (hh >> 4) % 2 ? '#eba8c8' : '#f6d7e4'; gq.fillRect(cx + xx, cy + yy, 1, 1);
          } else if (hh % 3 === 0 && t2 === T.GRASS) {
            const m = (hh >> 4) % 3;
            gq.fillStyle = m === 0 ? '#f6f2e2' : m === 1 ? '#eba8c8' : '#c4e587';
            gq.fillRect(cx + xx, cy + yy, 1, 1);
          }
        }
      }
    }
  }
  return gc;
}

/* ==========================================================================
   PLACE STATICS (buildings + props)
   ========================================================================== */
function h32(x, y, salt) {
  let h = (x * 374761393 + y * 668265263 + (salt || 0) * 9746347) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0);
}
function placeStatics() {
  statics = [];
  buildings = [];
  const G = (x, yy) => yy * Wt + x;
  let catBudgetSlugs = [];

  for (const q of quarters) {
    for (const lot of q.lots) {
      const sp = lot.sp;
      const baked = bakeBuilding(sp);
      const gTopX = isoX(lot.gx, lot.gy), gTopY = isoY(lot.gx, lot.gy);
      const wallH2 = sp.style === 'kiosk' ? 8 : sp.s * SPX;
      const wx = gTopX - baked.ox;
      const wy = gTopY - (baked.cv.height - 2) + 0; // sprite bottom margin M=2 aligns: south corner ground = top of diamond + (fw+fd)*HH ... simpler: align so roof-top T sits at gTop - wallH
      // Recompute precisely: local T = (ox, M+signH). We want world T = (gTopX, gTopY - wallH2).
      const localTy = baked.cv.height - 2 - wallH2 - (sp.fw + sp.fd) * HH; // = M + signH
      const wy2 = (gTopY - wallH2) - localTy;
      const b = {
        ...sp, quarter: q, cv: baked.cv,
        wx: wx, wy: wy2,
        tx: lot.gx, ty: lot.gy,
        depth: (lot.gx + sp.fw - 1) + (lot.gy + sp.fd - 1) + 0.6,
        pick: sp.pick, litPx: sp.litPx
      };
      // world coords of lit windows for twinkle
      b.twk = (sp.litPx || []).slice(0, 2).map((p, i) => ({ x: wx + p.lx, y: wy2 + p.ly, w: p.w, h: p.h, ph: rint(9) }));
      if (sp.chimney) smokes.push({ x: wx + sp.chimney.lx, y: wy2 + sp.chimney.ly, parts: [], next: rng() * 2 });
      if (sp.flagPt) flags.push({ x: wx + sp.flagPt.lx, y: wy2 + sp.flagPt.ly - 9, ph: rng() * 7 });
      // game layer: night/winter variant bookkeeping + a door the player can enter
      b.varCache = {}; b.queued = 0;
      const sr = h32(lot.gx, lot.gy, 91) / 4294967296, sr2 = h32(lot.gx, lot.gy, 92) / 4294967296;
      b.on1 = 0.12 + 0.5 * sr;                       // seeded dusk thresholds: windows come on
      b.on2 = Math.min(0.97, b.on1 + 0.22 + 0.25 * sr2); // building by building, never all at once
      b.winOrder = (sp.win || []).map((_, i2) => i2);
      for (let i2 = b.winOrder.length - 1; i2 > 0; i2--) {
        const j2 = h32(lot.gx * 7 + i2, lot.gy, 93) % (i2 + 1);
        [b.winOrder[i2], b.winOrder[j2]] = [b.winOrder[j2], b.winOrder[i2]];
      }
      if (sp.doorPx) {
        doors.push({
          slug: sp.slug, b,
          px: lot.gx + 0.3, py: lot.gy + sp.fd + 0.45,          // approach point in tile space
          wx: wx + sp.doorPx.x + 2, wy: wy2 + sp.doorPx.y + 3   // door centre in world px
        });
        doorTiles.add(lot.gx + ',' + (lot.gy + sp.fd));
      }
      buildings.push(b);
      statics.push({ cv: baked.cv, wx, wy: wy2, depth: b.depth, b });
      if (sp.style === 'boarded') {
        catBudgetSlugs.push(b);
        // estate agent's placard out front -- only every few shopfronts, or a
        // dying block turns into a wall of boards
        if (catBudgetSlugs.length % 4 === 1) {
          const lx = lot.gx + sp.fw - 0.3, ly = lot.gy + sp.fd + 0.35;
          const ptx = Math.floor(lx), pty = Math.floor(ly);
          if (!doorTiles.has(ptx + ',' + pty)) {
            statics.push({ cv: SPR.lease, name: 'lease', wx: Math.round(isoX(lx, ly)) - 12, wy: Math.round(isoY(lx, ly)) + HH - 20, depth: lx + ly + 0.3 });
            propSolid.add(ptx + ',' + pty);
          }
        }
      }
    }
  }

  // cats in front of some boarded shopfronts (at least one)
  catBudgetSlugs.forEach((b, i) => {
    if (i % 7 === 0) cats.push({ tx: b.tx + 0.5, ty: b.ty + b.fd + 0.2, ph: rng() * 4 });
  });

  // props on quarter rings, banks, plazas, parks
  const SOLID_PROPS = new Set(['lamp', 'tree', 'bench', 'hydrant', 'stall', 'kioskstand', 'crane', 'lease']);
  const addProp = (name, tx, ty, dz = 0.3, dx = 0, dy = 0) => {
    if (doorTiles.has(tx + ',' + ty)) return;   // keep every door approachable
    const cv2 = SPR[name];
    statics.push({
      cv: cv2, name,
      wx: isoX(tx, ty) - (cv2.width >> 1) + dx,
      wy: isoY(tx, ty) + HH - cv2.height + 2 + dy,
      depth: tx + ty + dz
    });
    if (SOLID_PROPS.has(name)) propSolid.add(tx + ',' + ty);
    if (name === 'lamp') lampPts.push({ wx: isoX(tx, ty), wy: isoY(tx, ty) + 2, tx, ty });
  };
  // a dog sits by some benches; a park fountain plays three spray frames
  const maybeDog = (tx, ty) => {
    if (dogs.length < 14 && h32(tx, ty, 6) % 4 === 0) dogs.push({ tx: tx + 0.85, ty: ty + 0.75, ph: rng() * 5 });
  };
  const addFount = (tx, ty) => {
    if (doorTiles.has(tx + ',' + ty)) return;
    statics.push({
      anim3: [SPR.fount0, SPR.fount1, SPR.fount2], cv: SPR.fount0,
      wx: isoX(tx, ty) - 7, wy: isoY(tx, ty) + HH - 12, depth: tx + ty + 0.3
    });
    propSolid.add(tx + ',' + ty);
  };

  for (const q of quarters) {
    // ring perimeter walk
    const per = [];
    for (let x = 0; x < q.qw; x++) per.push([q.qx + x, q.qy]);
    for (let y = 1; y < q.qh; y++) per.push([q.qx + q.qw - 1, q.qy + y]);
    for (let x = q.qw - 2; x >= 0; x--) per.push([q.qx + x, q.qy + q.qh - 1]);
    for (let y = q.qh - 2; y >= 1; y--) per.push([q.qx, q.qy + y]);
    per.forEach(([tx, ty], i) => {
      if (grid[G(tx, ty)] !== T.PAVE) return;
      if (i % 6 === 1) addProp('lamp', tx, ty);
      else if (i % 7 === 3) addProp('tree', tx, ty);
      else if (i % 13 === 5) addProp('hydrant', tx, ty);
      else if (i % 11 === 7) { addProp('bench', tx, ty); maybeDog(tx, ty); }
    });
    // interior plazas: stalls & benches & pigeon spawns
    let stallCount = 0;
    for (let yy = 1; yy < q.qh - 1; yy++) for (let xx = 1; xx < q.qw - 1; xx++) {
      const tx = q.qx + xx, ty = q.qy + yy;
      const t2 = grid[G(tx, ty)];
      if (t2 === T.PLAZA) {
        const h2 = h32(tx, ty, 1) % 17;
        if (h2 === 0 && stallCount < 3) {
          addProp('stall', tx, ty); stallCount++;
          // a short queue forms at the stall counter
          const nQ = 2 + h32(tx, ty, 8) % 2;
          for (let k = 0; k < nQ; k++) {
            queuers.push({ x: tx + 0.35, y: ty + 1.05 + k * 0.55, theme: (q.themeIdx + k) % THEMES.length, ph: rng() * 10 });
          }
        }
        else if (h2 === 4) { addProp('bench', tx, ty); maybeDog(tx, ty); }
        else if (h2 === 8) addProp('kioskstand', tx, ty);
        else if (h2 === 2 && !q.fountainDone) { q.fountainDone = true; addFount(tx, ty); }
        else if (h2 === 12 && pigeons.length < 40) {
          for (let p2 = 0; p2 < 3; p2++) pigeons.push({ tx: tx + rng() * 0.8, ty: ty + rng() * 0.8, home: [tx, ty], st: 'peck', t: rng() * 3, vx: 0, vy: 0 });
        }
      } else if (t2 === T.GRASS && h32(tx, ty, 2) % 9 === 0) addProp('tree', tx, ty);
    }
    // crane for migration quarters
    if (q.migration) {
      const openish = (t2) => t2 === T.PAVE || t2 === T.PLAZA || t2 === T.GRASS;
      outer:
      for (let yy = 1; yy < q.qh - 1; yy++) for (let xx = 1; xx < q.qw - 1; xx++) {
        const tx = q.qx + xx, ty = q.qy + yy;
        // the mast needs an open yard to its south-east or it hides behind a
        // building and the jib reads as floating
        if ((grid[G(tx, ty)] === T.PAVE || grid[G(tx, ty)] === T.PLAZA) &&
            openish(grid[G(tx + 1, ty)]) && openish(grid[G(tx, ty + 1)]) && openish(grid[G(tx + 1, ty + 1)])) {
          addProp('crane', tx, ty, 0.7); break outer;
        }
      }
    }
    // laundry lines in the back lane
    if (q.backlane) {
      let n = 0;
      for (let yy = 1; yy < q.qh - 1 && n < 3; yy++) for (let xx = 1; xx < q.qw - 1 && n < 3; xx++) {
        const tx = q.qx + xx, ty = q.qy + yy;
        if (grid[G(tx, ty)] === T.PAVE && (tx + ty) % 3 === 0) {
          statics.push({ cv: SPR.laundry0, cv2: SPR.laundry1, wx: isoX(tx, ty) - 8, wy: isoY(tx, ty) - 6, depth: tx + ty + 0.3, sway: true });
          n++;
        }
      }
    }
  }
  // banks promenade + public parks (green tiles outside any quarter)
  for (let ty = 0; ty < Ht; ty++) for (let tx = 0; tx < Wt; tx++) {
    const t2 = grid[G(tx, ty)];
    if (t2 === T.BANK) {
      const h2 = h32(tx, ty, 3) % 31;
      if (h2 === 0) addProp('lamp', tx, ty);
      else if (h2 === 9) addProp('tree', tx, ty);
      else if (h2 === 17) addProp('bench', tx, ty);
    } else if (t2 === T.GRASS && quarterOf[G(tx, ty)] < 0) {
      const h2 = h32(tx, ty, 4) % 19;
      if (h2 === 0 || h2 === 7) addProp('tree', tx, ty);
      else if (h2 === 3) { addProp('bench', tx, ty); maybeDog(tx, ty); }
      else if (h2 === 11) addProp('kioskstand', tx, ty);
      else if (h2 === 14 && pigeons.length < 52) {
        for (let p2 = 0; p2 < 3; p2++) pigeons.push({ tx: tx + rng() * 0.8, ty: ty + rng() * 0.8, home: [tx, ty], st: 'peck', t: rng() * 3, vx: 0, vy: 0 });
      }
      else if (h2 === 5 && h32(tx, ty, 9) % 3 === 0) addFount(tx, ty);
    } else if (t2 === T.SEA && buoys.length < 7) {
      const d = Math.min(tx, ty, Wt - 1 - tx, Ht - 1 - ty);
      if (d >= 2 && d <= 3 && h32(tx, ty, 5) % 37 === 0) buoys.push({ tx: tx + 0.5, ty: ty + 0.5, ph: rng() * 6 });
    }
  }

  // lamps standing beside water throw a shimmering reflection at night
  for (const lp of lampPts) {
    for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1]]) {
      const nx = lp.tx + dx, ny = lp.ty + dy;
      if (nx < 0 || ny < 0 || nx >= Wt || ny >= Ht) continue;
      const t3 = grid[G(nx, ny)];
      if (t3 === T.WATER || t3 === T.SEA) {
        lampRefl.push({ wx: isoX(nx, ny), wy: isoY(nx, ny) + 3, ph: (lp.tx * 3 + lp.ty) % 7 });
        break;
      }
    }
  }

  statics.sort((a, b2) => a.depth - b2.depth);
}

/* golden-hour long shadows, baked once into a world-sized overlay */
function bakeShadows() {
  const [c, g] = mkCv(worldW, worldH);
  g.fillStyle = 'rgba(24,18,44,0.32)';
  for (const b of buildings) {
    const hgt = (b.style === 'kiosk' ? 8 : b.s * SPX);
    const L = clamp(Math.round(hgt * 1.5), 10, 70);
    const sx = isoX(b.tx + b.fw, b.ty + b.fd), sy = isoY(b.tx + b.fw, b.ty + b.fd);
    const ex = isoX(b.tx + b.fw, b.ty), ey = isoY(b.tx + b.fw, b.ty);
    g.beginPath();
    g.moveTo(sx, sy); g.lineTo(ex, ey);
    g.lineTo(ex + L, ey + L * 0.22); g.lineTo(sx + L, sy + L * 0.22);
    g.closePath(); g.fill();
  }
  for (const st of statics) {
    if (st.name !== 'tree' && st.name !== 'lamp') continue;
    const bx = st.wx + st.cv.width / 2, by = st.wy + st.cv.height - 2;
    const L = st.name === 'tree' ? 14 : 9;
    g.beginPath();
    g.moveTo(bx - 2, by); g.lineTo(bx + 2, by);
    g.lineTo(bx + 2 + L, by + L * 0.2); g.lineTo(bx - 2 + L, by + L * 0.2);
    g.closePath(); g.fill();
  }
  shadowCv = c;
}

/* stars twinkle over open water once night falls */
function initStars() {
  starPts = [];
  for (let ty = 0; ty < Ht && starPts.length < 170; ty++) for (let tx = 0; tx < Wt; tx++) {
    const t2 = grid[ty * Wt + tx];
    if (t2 !== T.SEA && t2 !== T.WATER) continue;
    const hh = h32(tx, ty, 31);
    if (hh % 19 === 0) {
      starPts.push({ wx: isoX(tx, ty) + (hh >> 5) % 9 - 4, wy: isoY(tx, ty) + 2 + (hh >> 9) % 4, ph: hh % 11 });
      if (starPts.length >= 170) break;
    }
  }
}

/* ==========================================================================
   LIFE
   ========================================================================== */
function tileAt(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= Wt || ty >= Ht) return T.SEA;
  return grid[ty * Wt + tx];
}
const walkableP = (t2) => t2 === T.PAVE || t2 === T.PLAZA || t2 === T.BANK || t2 === T.CROSS || t2 === T.BRIDGE || t2 === T.GRASS;
const drivable = (t2) => t2 === T.ROAD || t2 === T.CROSS || t2 === T.BRIDGE;

function initLife() {
  const G = (x, yy) => yy * Wt + x;
  // pedestrians
  const paveTiles = [];
  for (let ty = 0; ty < Ht; ty++) for (let tx = 0; tx < Wt; tx++) {
    const t2 = grid[G(tx, ty)];
    if (t2 === T.PAVE || t2 === T.PLAZA || t2 === T.BANK) paveTiles.push([tx, ty]);
  }
  const nPed = Math.min(520, Math.floor(paveTiles.length / 4));
  for (let i = 0; i < nPed; i++) {
    const [tx, ty] = paveTiles[rint(paveTiles.length)];
    const qid = quarterOf[G(tx, ty)];
    const themeIdx = qid >= 0 ? quarters.find(q => q.id === qid)?.themeIdx ?? rint(THEMES.length) : rint(THEMES.length);
    peds.push({
      x: tx + 0.5, y: ty + 0.5, fx: tx, fy: ty, nx: tx, ny: ty,
      prog: 1, speed: 0.55 + rng() * 0.35, theme: themeIdx, ph: rng() * 10, lastDir: null
    });
  }
  // cars, weighted to high-traffic quarters
  const roadTiles = [];
  for (let ty = 0; ty < Ht; ty++) for (let tx = 0; tx < Wt; tx++) {
    if (grid[G(tx, ty)] !== T.ROAD) continue;
    let w2 = 1;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-2, 0], [2, 0]]) {
      const qi = quarterOf[(ty + dy) * Wt + (tx + dx)] ?? -1;
      if (qi >= 0) { const q = quarters.find(qq => qq.id === qi); if (q) w2 += q.extDeg / 60; }
    }
    roadTiles.push({ tx, ty, w: w2 });
  }
  const totW = roadTiles.reduce((a, r) => a + r.w, 0);
  const nCars = clamp(Math.round(edgeCount / 44), 20, 34);
  for (let i = 0; i < nCars; i++) {
    let pickW = rng() * totW, rt = roadTiles[0];
    for (const r of roadTiles) { pickW -= r.w; if (pickW <= 0) { rt = r; break; } }
    const isVan = i % 5 === 4;
    cars.push({
      x: rt.tx + 0.5, y: rt.ty + 0.5, fx: rt.tx, fy: rt.ty, nx: rt.tx, ny: rt.ty, prog: 1,
      speed: 1.7 + rng() * 0.8, dir: null, col: rint(6), van: isVan, stopped: 0
    });
  }
  for (let i = 0; i < 14; i++) {
    const rt = roadTiles[rint(roadTiles.length)];
    cyclists.push({ x: rt.tx + 0.5, y: rt.ty + 0.5, fx: rt.tx, fy: rt.ty, nx: rt.tx, ny: rt.ty, prog: 1, speed: 2.6, dir: null });
  }
  // boat path: serpentine through canals and around the sea edge
  if (canalWaterYs.length) {
    const path = [];
    const xw = 1, xe = Wt - 2;
    canalWaterYs.forEach((cy, i) => {
      if (i % 2 === 0) { path.push([xw, cy]); path.push([xe, cy]); }
      else { path.push([xe, cy]); path.push([xw, cy]); }
      const nextY = canalWaterYs[i + 1];
      if (nextY !== undefined) {
        const sideX = i % 2 === 0 ? xe : xw;
        path.push([sideX, nextY]);
      }
    });
    boat = { path, seg: 0, prog: 0, fwd: true, speed: 1.4, x: path[0][0], y: path[0][1] };
  }
}

function stepEntityGrid(e, allow, preferStraight, dt, yieldFn) {
  // continuous movement across tile centres
  if (e.prog >= 1) {
    e.fx = e.nx; e.fy = e.ny;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const opts = [];
    for (const d of dirs) {
      const nx = e.fx + d[0], ny = e.fy + d[1];
      if (!allow(nx, ny, d, e)) continue;
      const isRev = e.dir && d[0] === -e.dir[0] && d[1] === -e.dir[1];
      const isStr = e.dir && d[0] === e.dir[0] && d[1] === e.dir[1];
      opts.push({ d, nx, ny, w: isRev ? 0.05 : isStr ? preferStraight : 1 });
    }
    if (!opts.length) { e.dir = e.dir ? [-e.dir[0], -e.dir[1]] : [1, 0]; return; }
    let tw = 0; for (const o of opts) tw += o.w;
    let r = rng() * tw, chosen = opts[0];
    for (const o of opts) { r -= o.w; if (r <= 0) { chosen = o; break; } }
    e.dir = chosen.d; e.nx = chosen.nx; e.ny = chosen.ny; e.prog = 0;
  }
  if (yieldFn && yieldFn(e)) { e.stopped = 1; return; }
  e.stopped = 0;
  e.prog += e.speed * dt;
  const p = Math.min(1, e.prog);
  e.x = e.fx + (e.nx - e.fx) * p + 0.5;
  e.y = e.fy + (e.ny - e.fy) * p + 0.5;
}

function updateLife(dt) {
  animT += dt;
  // peds
  for (const p of peds) {
    stepEntityGrid(p, (nx, ny) => walkableP(tileAt(nx, ny)), 2.2, dt, null);
  }
  // cars: lane rules + yields
  const carYield = (c) => {
    // next tile is a crossing with a ped on/near it?
    const key = c.nx + ',' + c.ny;
    if (crossTiles.has(key)) {
      for (const p of peds) {
        if (Math.abs(p.x - (c.nx + 0.5)) < 1.1 && Math.abs(p.y - (c.ny + 0.5)) < 1.1) return true;
      }
    }
    // car ahead
    for (const o of cars) {
      if (o === c) continue;
      const dx = o.x - c.x, dy = o.y - c.y;
      if (c.dir && dx * c.dir[0] + dy * c.dir[1] > 0.1 && Math.abs(dx) + Math.abs(dy) < 1.05) return true;
    }
    return false;
  };
  const laneOK = (nx, ny, d) => {
    const t2 = tileAt(nx, ny);
    if (!drivable(t2)) return false;
    const gi = ny * Wt + nx;
    const hd = hdir[gi], vd = vdir[gi];
    if (d[0] !== 0) return hd === d[0] || (hd === 0 && vd !== 0) || (hd !== 0 && vd !== 0);
    return vd === d[1] || (vd === 0 && hd !== 0) || (hd !== 0 && vd !== 0);
  };
  for (const c of cars) stepEntityGrid(c, laneOK, 5, dt, carYield);
  for (const c of cyclists) stepEntityGrid(c, laneOK, 4, dt, carYield);

  // pigeons: peck, scatter, return
  for (const pg of pigeons) {
    pg.t -= dt;
    if (pg.st === 'peck') {
      let danger = false;
      for (const p of peds) if (Math.abs(p.x - pg.tx) < 1.4 && Math.abs(p.y - pg.ty) < 1.4) { danger = true; break; }
      if (!danger) for (const c of cars) if (Math.abs(c.x - pg.tx) < 1.6 && Math.abs(c.y - pg.ty) < 1.6) { danger = true; break; }
      if (!danger && Math.abs(player.x - pg.tx) < 1.5 && Math.abs(player.y - pg.ty) < 1.5) danger = true;
      if (danger) {
        pg.st = 'fly'; pg.t = 2.2 + rng() * 2;
        const a = rng() * 6.28; pg.vx = Math.cos(a) * 3; pg.vy = Math.sin(a) * 3; pg.alt = 0;
      }
    } else if (pg.st === 'fly') {
      pg.tx += pg.vx * dt; pg.ty += pg.vy * dt;
      pg.alt = Math.min(14, (pg.alt || 0) + 26 * dt);
      if (pg.t <= 0) { pg.st = 'return'; }
    } else { // return home
      const dx = pg.home[0] + 0.4 - pg.tx, dy = pg.home[1] + 0.4 - pg.ty;
      const d2 = Math.hypot(dx, dy);
      if (d2 < 0.2 && (pg.alt || 0) < 1) { pg.st = 'peck'; pg.t = rng() * 3; pg.alt = 0; }
      else { pg.tx += dx / (d2 + 0.01) * 2.4 * dt; pg.ty += dy / (d2 + 0.01) * 2.4 * dt; pg.alt = Math.max(0, (pg.alt || 0) - 12 * dt); }
    }
  }
  // smoke
  for (const s of smokes) {
    s.next -= dt;
    if (s.next <= 0) { s.parts.push({ dx: 0, dy: 0, a: 1 }); s.next = 0.8 + rng() * 0.6; }
    for (const p of s.parts) { p.dy -= 7 * dt; p.dx += Math.sin(animT * 2 + p.dy) * 2.4 * dt; p.a -= dt / 3; }
    s.parts = s.parts.filter(p => p.a > 0);
  }
  // boat
  if (boat) {
    const path = boat.path;
    const a = path[boat.seg], b2 = path[boat.seg + 1];
    if (b2) {
      const len = Math.abs(b2[0] - a[0]) + Math.abs(b2[1] - a[1]);
      boat.prog += boat.speed * dt / Math.max(1, len);
      if (boat.prog >= 1) { boat.prog = 0; boat.seg += boat.fwd ? 1 : -1; }
      if (boat.seg >= path.length - 1) { boat.fwd = false; boat.seg = path.length - 2; }
      if (boat.seg < 0) { boat.fwd = true; boat.seg = 0; }
      const A = path[clamp(boat.seg, 0, path.length - 1)], B = path[clamp(boat.seg + (boat.fwd ? 1 : -1), 0, path.length - 1)];
      const t2 = boat.fwd ? boat.prog : boat.prog;
      const A2 = boat.fwd ? A : A, B2 = boat.fwd ? B : B;
      boat.x = A2[0] + (B2[0] - A2[0]) * t2;
      boat.y = A2[1] + (B2[1] - A2[1]) * t2;
      boat.horiz = Math.abs(B2[0] - A2[0]) >= Math.abs(B2[1] - A2[1]);
    }
  }
}

/* ==========================================================================
   BUILDING NIGHT + WINTER VARIANTS
   Lit-window stages and snow caps are extra baked sprites (never per-window
   draws at runtime); baked lazily on a small per-frame budget.
   key bits: 1|2 = lit stage, 4 = winter snow.
   ========================================================================== */
function bakeBuildingVariant(b, key) {
  const stage = key & 3, winter = key & 4;
  let [c, g] = mkCv(b.cv.width, b.cv.height);
  g.drawImage(b.cv, 0, 0);
  if (stage > 0 && b.win && b.win.length) {
    const n = Math.round(b.winOrder.length * (stage === 1 ? 0.5 : 0.92));
    for (let i = 0; i < n; i++) {
      const w = b.win[b.winOrder[i]];
      g.fillStyle = PAL.L1; g.fillRect(w.x, w.y, w.w, w.h);
      g.fillStyle = PAL.L2; g.fillRect(w.x, w.y + w.h - 1, w.w, 1);
    }
  }
  if (stage > 0 && b.doorPx) { g.fillStyle = PAL.L1; g.fillRect(b.doorPx.x + 2, b.doorPx.y + 2, 1, 1); }
  if (winter) c = snowify(c);
  b.varCache[key] = c;
}
function buildingCv(b) {
  const stage = b.style === 'boarded' ? 0 : (nf > b.on2 ? 2 : nf > b.on1 ? 1 : 0);
  const key = stage | (season === 3 ? 4 : 0);
  if (key === 0) return b.cv;
  const hit = b.varCache[key];
  if (hit) return hit;
  if (!(b.queued & (1 << key))) { bakeQueue.push([b, key]); b.queued |= (1 << key); }
  // best already-baked stand-in while this one waits its turn in the queue
  return b.varCache[(key & 4) | (stage > 0 ? stage - 1 : 0)] || b.varCache[stage] || b.cv;
}
function processBakeQueue(budgetMs) {
  if (!bakeQueue.length) return;
  const t0 = performance.now();
  while (bakeQueue.length && performance.now() - t0 < budgetMs) {
    const [b, key] = bakeQueue.shift();
    if (!b.varCache[key]) bakeBuildingVariant(b, key);
    b.queued &= ~(1 << key);
  }
}
/* season-aware sprite lookup for named props */
function seasonalCv(name) {
  if (name === 'tree') return SPR[SEASON_TREE[season]];
  if (season === 3) { const w = SPR[name + '_wi']; if (w) return w; }
  return SPR[name];
}

/* ==========================================================================
   PLAYER - the courier you steer. Additive: mouse users lose nothing.
   ========================================================================== */
const FACE_SPR = [['e', 0], ['se', 0], ['s', 0], ['se', 1], ['e', 1], ['ne', 1], ['n', 0], ['ne', 0]];
const PSPEED = 3.1, PACC = 12, PDEC = 16, PRAD = 0.26;
const keysDown = new Set();
const KEYMAP = { ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r' };

function playerWalkable(t2) {
  return t2 === T.PAVE || t2 === T.PLAZA || t2 === T.BANK || t2 === T.CROSS ||
         t2 === T.BRIDGE || t2 === T.GRASS || t2 === T.FLOWER || t2 === T.ROAD;
}
function playerBlocked(nx, ny) {
  for (const [ox, oy] of [[-PRAD, -PRAD], [PRAD, -PRAD], [-PRAD, PRAD], [PRAD, PRAD]]) {
    const fx = nx + ox, fy = ny + oy;
    const tx = Math.floor(fx), ty = Math.floor(fy);
    if (!playerWalkable(tileAt(tx, ty))) return true;
    if (propSolid.has(tx + ',' + ty)) {
      const cx2 = fx - tx, cy2 = fy - ty;
      if (cx2 > 0.16 && cx2 < 0.84 && cy2 > 0.16 && cy2 < 0.84) return true;
    }
  }
  return false;
}
function initPlayerSpawn() {
  // the main plaza: the plaza tile nearest the centre of the island whose
  // south-east quadrant is open, so the courier is not hidden behind a tower
  let best = null, bd = Infinity;
  const cxT = Wt / 2, cyT = Ht / 2;
  for (let ty = 0; ty < Ht; ty++) for (let tx = 0; tx < Wt; tx++) {
    if (grid[ty * Wt + tx] !== T.PLAZA) continue;
    if (propSolid.has(tx + ',' + ty)) continue;
    let open = true;
    for (let dy = 0; dy <= 2 && open; dy++) for (let dx = 0; dx <= 2 && open; dx++) {
      if (tileAt(tx + dx, ty + dy) === T.LOT) open = false;
    }
    if (!open) continue;
    const d = (tx - cxT) * (tx - cxT) + (ty - cyT) * (ty - cyT);
    if (d < bd) { bd = d; best = [tx, ty]; }
  }
  if (!best) best = [Math.floor(Wt / 2), Math.floor(Ht / 2)];
  player.x = best[0] + 0.5;
  player.y = best[1] + 0.5;
}

const doorPromptEl = document.getElementById('doorprompt');
const dpTitleEl = document.getElementById('dp-title');
function setActiveDoor(d) {
  if (d === activeDoor) return;
  activeDoor = d;
  if (d) {
    const pg2 = pagesBySlug[d.slug];
    dpTitleEl.textContent = '· ' + ((pg2 && pg2.title) || d.slug);
    doorPromptEl.hidden = false;
  } else doorPromptEl.hidden = true;
}

function updatePlayer(dt) {
  const sx = (keysDown.has('r') ? 1 : 0) - (keysDown.has('l') ? 1 : 0);
  const sy = (keysDown.has('d') ? 1 : 0) - (keysDown.has('u') ? 1 : 0);
  if (sx || sy) {
    const tdx = sx + sy, tdy = sy - sx;            // screen arrows -> dimetric grid axes
    const tl = Math.hypot(tdx, tdy) || 1;
    player.vx += (tdx / tl * PSPEED - player.vx) * Math.min(1, PACC * dt);
    player.vy += (tdy / tl * PSPEED - player.vy) * Math.min(1, PACC * dt);
    player.idleT = 0;
  } else {
    const f = Math.max(0, 1 - PDEC * dt);
    player.vx *= f; player.vy *= f;
    if (Math.abs(player.vx) < 0.02) player.vx = 0;
    if (Math.abs(player.vy) < 0.02) player.vy = 0;
    player.idleT += dt;
  }
  const nx = player.x + player.vx * dt;
  if (!playerBlocked(nx, player.y)) player.x = nx; else player.vx = 0;
  const ny = player.y + player.vy * dt;
  if (!playerBlocked(player.x, ny)) player.y = ny; else player.vy = 0;

  const sp = Math.hypot(player.vx, player.vy);
  const svx = player.vx - player.vy, svy = (player.vx + player.vy) * 0.5;
  if (sp > 0.4) {
    const deg = Math.atan2(svy, svx) * 180 / Math.PI;
    player.face = ((Math.round(deg / 45) % 8) + 8) % 8;
    player.walkT += dt * (1.4 + sp * 1.5);
  }
  // soft footstep dust
  player.dustT -= dt;
  if (!REDUCED && sp > 1.4 && player.dustT <= 0) {
    const wx = OX + (player.x - player.y) * HW, wy = OY + (player.x + player.y) * HH;
    spawnPart('dust', wx - 1 + (Math.random() * 4 - 2), wy - 1, (Math.random() - 0.5) * 4, -2 - Math.random() * 2, 0.5);
    player.dustT = 0.15;
  }
  // tiny breath puffs in winter
  if (!REDUCED && season === 3) {
    player.breathT -= dt;
    if (player.breathT <= 0) {
      const wx = OX + (player.x - player.y) * HW, wy = OY + (player.x + player.y) * HH;
      spawnPart('breath', wx + 2, wy - 11, 0, 0, 0.9);
      player.breathT = sp > 0.5 ? 1.6 + Math.random() : 2.6 + Math.random() * 1.4;
    }
  }
  // nearest door within reach (no prompt while the reading panel is open)
  let best = null, bd2 = 0.9;
  if (panel.hidden) {
    for (const d of doors) {
      const dd = Math.hypot(player.x - d.px, player.y - d.py);
      if (dd < bd2) { bd2 = dd; best = d; }
    }
  }
  setActiveDoor(best);
  // gentle camera follow with velocity lookahead
  if (camMode === 'follow') {
    const z = cam.z;
    const sl = Math.hypot(svx, svy) || 1;
    const look = sp > 0.25 ? Math.min(1, sp / PSPEED) * 96 / z : 0;   // ~constant screen lead
    const pwx = OX + (player.x - player.y) * HW + svx / sl * look;
    const pwy = OY + (player.x + player.y) * HH + svy / sl * look - 8;
    const txc = pwx - cvs.width / (2 * z), tyc = pwy - cvs.height / (2 * z);
    const k = 1 - Math.exp(-4.5 * dt);
    cam.x += (txc - cam.x) * k;
    cam.y += (tyc - cam.y) * k;
    camSettle = Math.abs(txc - cam.x) + Math.abs(tyc - cam.y);
  } else camSettle = 0;
}

function drawPlayerInto(dyn) {
  const wx = OX + (player.x - player.y) * HW, wy = OY + (player.x + player.y) * HH;
  const onBridge = tileAt(Math.floor(player.x), Math.floor(player.y)) === T.BRIDGE ? 2.5 : 0;
  let depth = player.x + player.y - 0.98 + onBridge;
  // standing right in front of a wide building's face (a door, usually): the
  // single-depth-per-sprite sort would wrongly hide the courier, so bump them
  for (const b of buildings) {
    if (player.y >= b.ty + b.fd && player.y <= b.ty + b.fd + 0.95 &&
        player.x >= b.tx - 0.3 && player.x <= b.tx + b.fw + 0.3) {
      depth = Math.max(depth, b.depth + 0.05);           // south face strip
    } else if (player.x >= b.tx + b.fw && player.x <= b.tx + b.fw + 0.95 &&
        player.y >= b.ty - 0.3 && player.y <= b.ty + b.fd + 0.3) {
      depth = Math.max(depth, b.depth + 0.05);           // east face strip
    }
  }
  const ringCv = SPR['ring' + (REDUCED ? 0 : Math.floor(animT * 2.5) % 2)];
  if (cam.z <= 1) {
    // widest zoom: a dot with a soft marker ring so you never lose yourself
    dyn.push({ cv: ringCv, wx: Math.round(wx - 11), wy: Math.round(wy - 5), depth: depth - 0.02, alpha: 0.85 });
    dyn.push({ cv: SPR.plrdot, wx: Math.round(wx - 1), wy: Math.round(wy - 2), depth });
    return;
  }
  if (cam.z === 2) dyn.push({ cv: ringCv, wx: Math.round(wx - 11), wy: Math.round(wy - 5), depth: depth - 0.02, alpha: 0.4 });
  const sp = Math.hypot(player.vx, player.vy);
  const moving = sp > 0.35;
  const fc = FACE_SPR[player.face], dn = fc[0], fl = fc[1];
  const f = moving ? Math.floor(player.walkT * 3.2) % 4 : 0;
  const bob = !moving && player.idleT > 4 && Math.floor(animT * 1.4) % 2 ? 1 : 0;
  dyn.push({ cv: SPR[`plr_${dn}_${f}`], wx: Math.round(wx - 5), wy: Math.round(wy - 14 + bob), depth, flip: !!fl });
  // the satchel of documents glows softly (brighter while idling)
  const pulse = 0.22 + 0.16 * (REDUCED ? 0.5 : Math.sin(animT * 3)) + (player.idleT > 4 ? 0.16 : 0);
  if (dn !== 'n' && dn !== 'ne') {
    dyn.push({ cv: SPR.plrhalo, wx: Math.round(wx + (fl ? -3 : -5)), wy: Math.round(wy - 10 + bob), depth: depth + 0.01, alpha: Math.max(0.12, pulse) });
  }
}

/* ==========================================================================
   PARTICLES - one capped pool: weather, footstep dust, winter breath
   ========================================================================== */
function spawnPart(type, wx, wy, vx, vy, life, col) {
  if (parts.length >= MAXPART + 30) return;
  parts.push({ type, wx, wy, vx, vy, life, t: 0, ph: (Math.abs(wx * 7 + wy * 3) | 0) % 10, col });
}
function updateParts(dt, vx0, vy0, vx1, vy1) {
  if (!REDUCED) {
    const base = season === 3 ? 26 : season === 2 ? 9 : season === 0 ? 4.5 : 0;
    const zf = cam.z >= 4 ? 1 : cam.z === 3 ? 0.7 : cam.z === 2 ? 0.4 : 0.18;
    weatherAcc += base * zf * dt;
    let alive = 0;
    for (const p of parts) if (p.type !== 'dust' && p.type !== 'breath') alive++;
    while (weatherAcc >= 1) {
      weatherAcc -= 1;
      if (alive >= MAXPART) continue;
      const rx = vx0 + Math.random() * (vx1 - vx0);
      const ry = vy0 - 10 - Math.random() * 30;
      if (season === 3) spawnPart('snow', rx, ry, (Math.random() - 0.5) * 3, 13 + Math.random() * 9, 14);
      else if (season === 2) spawnPart('leaf', rx, ry, 4 + Math.random() * 5, 9 + Math.random() * 5, 14, ['#c96b2e', '#e8b23c', '#b85c3f'][(Math.random() * 3) | 0]);
      else spawnPart('petal', rx, ry, 1.5 + Math.random() * 2.5, 6 + Math.random() * 3, 16, Math.random() < 0.5 ? '#eba8c8' : '#f6d7e4');
      alive++;
    }
  }
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.t += dt;
    p.life -= dt;
    if (p.type === 'snow') { p.wx += (p.vx + Math.sin(p.t * 1.7 + p.ph) * 4) * dt; p.wy += p.vy * dt; }
    else if (p.type === 'leaf') { p.wx += (p.vx + Math.sin(p.t * 2.2 + p.ph) * 7) * dt; p.wy += (p.vy + Math.cos(p.t * 1.8 + p.ph) * 2) * dt; }
    else if (p.type === 'petal') { p.wx += (p.vx + Math.sin(p.t * 1.5 + p.ph) * 5) * dt; p.wy += p.vy * dt; }
    else if (p.type === 'dust') { p.wx += p.vx * dt; p.wy += p.vy * dt; p.vy -= 3 * dt; }
    else { p.wx += 2.5 * dt; p.wy -= 4 * dt; }   // breath
    if (p.life <= 0 || p.wy > vy1 + 16 || p.wx < vx0 - 24 || p.wx > vx1 + 24) parts.splice(i, 1);
  }
}

/* ==========================================================================
   HUD - clock dial, season glyph, hint card
   ========================================================================== */
const clockDialCv = document.getElementById('clockdial');
const seasonDialCv = document.getElementById('seasondial');
let lastDialStep = -1;
function drawClockDial() {
  const g = clockDialCv.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, 22, 22);
  const sky = rgbStr(mixRGB(mixRGB(hexRGB('#7fb8d8'), hexRGB('#e8a35c'), Math.min(1, gf)), hexRGB('#131b36'), nf));
  for (let y = 0; y < 22; y++) for (let x = 0; x < 22; x++) {
    const d = (x - 10.5) * (x - 10.5) + (y - 10.5) * (y - 10.5);
    if (d <= 100) { g.fillStyle = d > 76 ? '#241f2e' : sky; g.fillRect(x, y, 1, 1); }
  }
  const th = (dayT - 0.5) * Math.PI * 2 - Math.PI / 2;   // noon at the top
  const mx = Math.round(10.5 + Math.cos(th) * 6), my = Math.round(10.5 + Math.sin(th) * 6);
  g.fillStyle = nf > 0.5 ? '#e9e6d2' : '#ffcf5e';
  g.fillRect(mx - 1, my - 1, 3, 3);
}
function drawSeasonDial() {
  const g = seasonDialCv.getContext('2d');
  g.clearRect(0, 0, 22, 22);
  const P = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  if (season === 0) {           // blossom
    P(9, 9, 4, 4, '#e8b23c'); P(9, 4, 4, 4, '#eba8c8'); P(9, 14, 4, 4, '#eba8c8');
    P(4, 9, 4, 4, '#eba8c8'); P(14, 9, 4, 4, '#eba8c8');
  } else if (season === 1) {    // sun
    P(8, 8, 6, 6, '#ffcf5e');
    P(10, 3, 2, 3, '#e8b23c'); P(10, 16, 2, 3, '#e8b23c');
    P(3, 10, 3, 2, '#e8b23c'); P(16, 10, 3, 2, '#e8b23c');
    P(5, 5, 2, 2, '#e8b23c'); P(15, 5, 2, 2, '#e8b23c'); P(5, 15, 2, 2, '#e8b23c'); P(15, 15, 2, 2, '#e8b23c');
  } else if (season === 2) {    // leaf
    P(8, 4, 6, 3, '#c96b2e'); P(6, 6, 10, 5, '#c96b2e'); P(8, 11, 6, 3, '#b85c3f');
    P(10, 14, 2, 4, '#7a5836'); P(10, 6, 2, 6, '#e8b23c');
  } else {                      // snowflake
    P(10, 3, 2, 16, '#dbe4ee'); P(3, 10, 16, 2, '#dbe4ee');
    P(5, 5, 2, 2, '#eef2f8'); P(15, 5, 2, 2, '#eef2f8'); P(5, 15, 2, 2, '#eef2f8'); P(15, 15, 2, 2, '#eef2f8');
  }
  document.getElementById('seasonlabel').textContent = SEASONS[season].slice(0, 3).toUpperCase();
}
const SEASON_WEATHER = ['petal', null, 'leaf', 'snow'];
function setSeason(i) {
  season = ((i % 4) + 4) % 4;
  // the sky turns with the calendar: cull weather left over from the old season
  const keep = SEASON_WEATHER[season];
  for (let k = parts.length - 1; k >= 0; k--) {
    const t2 = parts[k].type;
    if (t2 !== 'dust' && t2 !== 'breath' && t2 !== keep) parts.splice(k, 1);
  }
  weatherAcc = 0;
  drawSeasonDial();
  requestDraw();
}
function cycleTimeSpeed() {
  if (REDUCED) return;
  timeSpeed = timeSpeed === 1 ? 8 : timeSpeed === 8 ? 0 : 1;
  document.getElementById('speedlabel').textContent = timeSpeed === 0 ? 'II' : timeSpeed + 'x';
}
function updateHudDials() {
  const step = Math.floor(dayT * 96);
  if (step !== lastDialStep) { lastDialStep = step; drawClockDial(); }
}
function initHud() {
  document.getElementById('btn-clock').onclick = () => cycleTimeSpeed();
  document.getElementById('btn-season').onclick = () => setSeason(season + 1);
  if (REDUCED) document.getElementById('speedlabel').textContent = 'II';
  drawClockDial();
  drawSeasonDial();
}
function initHint() {
  let seen = false;
  try { seen = localStorage.getItem('pdc_hint_v1') === '1'; } catch (err) { }
  const card = document.getElementById('hintcard');
  if (!seen) card.hidden = false;
  document.getElementById('hint-close').onclick = () => {
    card.hidden = true;
    try { localStorage.setItem('pdc_hint_v1', '1'); } catch (err) { }
  };
}
function requestDraw() {
  if (!REDUCED) return;
  lightFactors(dayT);
  draw();                     // may enqueue missing seasonal variants...
  if (bakeQueue.length) {     // ...so bake them now and paint once more
    processBakeQueue(60);
    draw();
  }
}

/* ==========================================================================
   RENDER
   ========================================================================== */
function resize() {
  dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
  cvs.width = Math.round(cvs.clientWidth * (window.devicePixelRatio || 1));
  cvs.height = Math.round(cvs.clientHeight * (window.devicePixelRatio || 1));
  ctx.imageSmoothingEnabled = false;
  dirty = true;
}
let dirty = true;

function fitZoom() {
  const z = Math.max(1, Math.min(Math.floor(cvs.width / worldW), Math.floor(cvs.height / worldH)));
  cam.z = z;
  cam.x = Math.round(worldW / 2 - cvs.width / (2 * z));
  cam.y = Math.round(worldH / 2 - cvs.height / (2 * z));
}

function draw() {
  const z = cam.z;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = rgbStr(mixRGB(mixRGB(SKY_DAY, SKY_GOLD, Math.min(1, gf)), SKY_NIGHT, nf));
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  ctx.setTransform(z, 0, 0, z, -Math.round(cam.x * z), -Math.round(cam.y * z));
  ctx.imageSmoothingEnabled = false;

  // viewport in world px
  const vx0 = cam.x - 40, vy0 = cam.y - 60, vx1 = cam.x + cvs.width / z + 40, vy1 = cam.y + cvs.height / z + 40;

  const wf = REDUCED ? 0 : Math.floor(animT * 2) % 3;
  ctx.drawImage(waterCvs[wf][0], 0, 0);
  // the water darkens with the night
  if (nf > 0.02) {
    ctx.fillStyle = `rgba(4,8,26,${(nf * 0.45).toFixed(3)})`;
    ctx.fillRect(vx0, vy0, vx1 - vx0, vy1 - vy0);
  }
  // stars come out over the open water
  if (nf > 0.3) {
    ctx.fillStyle = `rgba(244,238,224,${Math.min(0.9, (nf - 0.3) * 1.3).toFixed(3)})`;
    const tw2 = Math.floor(animT * 2);
    for (const s of starPts) {
      if (s.wx < vx0 || s.wx > vx1 || s.wy < vy0 || s.wy > vy1) continue;
      if ((tw2 + s.ph) % 9 === 0) continue;   // twinkle
      ctx.fillRect(s.wx, s.wy, 1, 1);
    }
  }
  // pre-baked ground keyframes for this season, crossfaded through the day
  const gset = groundSets[season];
  ctx.drawImage(gset.day, 0, 0);
  if (gf > 0.02) { ctx.globalAlpha = Math.min(1, gf); ctx.drawImage(gset.gold, 0, 0); }
  if (nf > 0.02) { ctx.globalAlpha = Math.min(1, nf); ctx.drawImage(gset.night, 0, 0); }
  ctx.globalAlpha = 1;
  // long soft shadows at the golden hours
  if (gf > 0.05 && nf < 0.7 && shadowCv) {
    ctx.globalAlpha = Math.min(1, gf) * (1 - nf);
    ctx.drawImage(shadowCv, 0, 0);
    ctx.globalAlpha = 1;
  }

  // dynamic sprites of this frame
  const dyn = [];
  drawPlayerInto(dyn);
  const wf2 = Math.floor(animT * 6);
  for (const p of peds) {
    const wx = OX + (p.x - p.y) * HW, wy = OY + (p.x + p.y) * HH;
    if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue;
    const f = p.stopped || p.prog >= 1 ? 0 : (Math.floor(animT * 7 + p.ph) % 2) + 1;
    const cv2 = SPR[`ped${p.theme}_${REDUCED ? 1 : f}`];
    dyn.push({ cv: cv2, wx: Math.round(wx - 2), wy: Math.round(wy - 8), depth: p.x + p.y - 0.98 + (tileAt(Math.floor(p.x), Math.floor(p.y)) === T.BRIDGE ? 2.5 : 0), flip: p.dir && p.dir[0] < 0 });
  }
  for (const c of cars.concat(cyclists)) {
    const wx = OX + (c.x - c.y) * HW, wy = OY + (c.x + c.y) * HH;
    if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue;
    const isCyc = c.speed > 2.4 && !c.van && c.col === undefined;
    let cv2;
    if (isCyc) cv2 = SPR[wf2 % 2 ? 'cycl0' : 'cycl1'];
    else if (c.van) cv2 = SPR.vanX;
    else cv2 = SPR[(c.dir && c.dir[1] !== 0 ? 'carY' : 'carX') + (c.col ?? 0)];
    const onBridge = tileAt(Math.floor(c.x), Math.floor(c.y)) === T.BRIDGE ? 2.5 : 0;
    dyn.push({
      cv: cv2, wx: Math.round(wx - cv2.width / 2), wy: Math.round(wy - cv2.height + 3),
      depth: c.x + c.y - 0.9 + onBridge,
      flip: c.dir ? (c.dir[0] < 0 || c.dir[1] < 0) : false
    });
  }
  for (const pg of pigeons) {
    const wx = OX + (pg.tx - pg.ty) * HW, wy = OY + (pg.tx + pg.ty) * HH - (pg.alt || 0);
    if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue;
    const fly = pg.st !== 'peck';
    const cv2 = fly ? SPR[wf2 % 2 ? 'pigf0' : 'pigf1'] : SPR[(Math.floor(animT * 2 + pg.tx) % 4) === 0 ? 'pig1' : 'pig0'];
    dyn.push({ cv: cv2, wx: Math.round(wx - 2), wy: Math.round(wy - 3), depth: pg.tx + pg.ty + (fly ? 5 : -0.5) });
  }
  for (const ct of cats) {
    const wx = OX + (ct.tx - ct.ty) * HW, wy = OY + (ct.tx + ct.ty) * HH;
    if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue;
    dyn.push({ cv: SPR[Math.floor(animT * 1.5 + ct.ph) % 2 ? 'cat1' : 'cat0'], wx: Math.round(wx - 3), wy: Math.round(wy - 4), depth: ct.tx + ct.ty - 0.4 });
  }
  for (const dg of dogs) {
    const wx = OX + (dg.tx - dg.ty) * HW, wy = OY + (dg.tx + dg.ty) * HH;
    if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue;
    const wag = !REDUCED && Math.floor(animT * 2 + dg.ph) % 3 === 0;
    dyn.push({ cv: SPR[wag ? 'dog1' : 'dog0'], wx: Math.round(wx - 3), wy: Math.round(wy - 5), depth: dg.tx + dg.ty - 0.4 });
  }
  for (const qp of queuers) {
    const wx = OX + (qp.x - qp.y) * HW, wy = OY + (qp.x + qp.y) * HH;
    if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue;
    // patient shuffle: an occasional 1px weight shift, frozen under reduced motion
    const nudge = !REDUCED && Math.floor(animT * 0.9 + qp.ph) % 6 === 0 ? 1 : 0;
    dyn.push({ cv: SPR[`ped${qp.theme}_0`], wx: Math.round(wx - 2 + nudge), wy: Math.round(wy - 8), depth: qp.x + qp.y - 0.98 });
  }
  for (const bu of buoys) {
    const wx = OX + (bu.tx - bu.ty) * HW, wy = OY + (bu.tx + bu.ty) * HH;
    if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue;
    const bob = REDUCED ? 0 : Math.floor(animT * 1.4 + bu.ph) % 2;
    dyn.push({ cv: SPR[Math.floor(animT * 1.1 + bu.ph) % 2 && !REDUCED ? 'buoy1' : 'buoy0'], wx: Math.round(wx - 2), wy: Math.round(wy - 4 + bob), depth: bu.tx + bu.ty - 0.5 });
  }
  if (boat) {
    const wx = OX + (boat.x - boat.y) * HW, wy = OY + (boat.x + boat.y) * HH;
    const cv2 = boat.horiz === false ? SPR.boatY : SPR.boatX;
    dyn.push({ cv: cv2, wx: Math.round(wx - cv2.width / 2), wy: Math.round(wy - cv2.height + 6), depth: boat.x + boat.y - 0.5, flip: false });
  }
  for (const fl of flags) {
    if (fl.x < vx0 || fl.x > vx1) continue;
    dyn.push({ cv: SPR[Math.floor(animT * 3 + fl.ph) % 2 ? 'flag1' : 'flag0'], wx: fl.x, wy: fl.y, depth: 1e9 - 1 });
  }

  // merge statics (pre-sorted) with dynamics
  dyn.sort((a, b2) => a.depth - b2.depth);
  let di = 0;
  for (const st of statics) {
    while (di < dyn.length && dyn[di].depth <= st.depth) { blit(dyn[di]); di++; }
    const wxs = st.wx, wys = st.wy;
    if (wxs + st.cv.width < vx0 || wxs > vx1 || wys + st.cv.height < vy0 || wys > vy1) continue;
    if (st.b && st.b === hoverB) drawHighlight(st);
    let useCv = st.cv;
    if (st.b) useCv = buildingCv(st.b);                       // night / winter variants
    else if (st.name) useCv = seasonalCv(st.name);            // seasonal trees + snowy props
    if (st.anim3) useCv = REDUCED ? st.anim3[1] : st.anim3[Math.floor(animT * 3) % 3];
    else if (st.sway && !REDUCED && (Math.floor(animT * 2) % 2)) useCv = st.cv2;
    ctx.drawImage(useCv, wxs, wys);
    // window twinkle
    if (st.b && st.b.twk && !REDUCED) {
      for (const tw of st.b.twk) {
        if ((Math.floor(animT * 1.5) + tw.ph) % 11 === 0) { ctx.fillStyle = PAL.DW; ctx.fillRect(tw.x, tw.y, tw.w, tw.h); }
      }
    }
  }
  while (di < dyn.length) { blit(dyn[di]); di++; }

  // smoke on top
  if (!REDUCED) {
    for (const s of smokes) {
      if (s.x < vx0 || s.x > vx1) continue;
      for (const p of s.parts) {
        ctx.globalAlpha = Math.max(0, p.a) * 0.9;
        ctx.drawImage(SPR.smoke, Math.round(s.x + p.dx), Math.round(s.y + p.dy - 2));
      }
      ctx.globalAlpha = 1;
    }
  }

  // one ambient wash grades everything with the hour (a rect, never per-sprite)
  if (gf > 0.02) {
    ctx.fillStyle = `rgba(255,164,58,${(0.14 * Math.min(1, gf)).toFixed(3)})`;
    ctx.fillRect(vx0, vy0, vx1 - vx0, vy1 - vy0);
  }
  if (nf > 0.02) {
    ctx.fillStyle = `rgba(14,18,52,${(0.30 * nf).toFixed(3)})`;
    ctx.fillRect(vx0, vy0, vx1 - vx0, vy1 - vy0);
  }

  // street lamps cast pre-baked pools of light after dark
  if (nf > 0.18) {
    const la = Math.min(1, (nf - 0.18) / 0.6);
    ctx.globalAlpha = la * 0.9;
    for (const lp of lampPts) {
      if (lp.wx < vx0 || lp.wx > vx1 || lp.wy < vy0 || lp.wy > vy1) continue;
      ctx.drawImage(SPR.lampglow, lp.wx - 15, lp.wy - 9);
    }
    // and shimmer in the canals and the harbour
    ctx.fillStyle = PAL.L1;
    for (const lr of lampRefl) {
      if (lr.wx < vx0 || lr.wx > vx1) continue;
      const jit = REDUCED ? 0 : Math.floor(animT * 3 + lr.ph) % 2;
      ctx.globalAlpha = la * 0.55;
      ctx.fillRect(lr.wx + jit - 1, lr.wy, 1, 3);
      ctx.globalAlpha = la * 0.3;
      ctx.fillRect(lr.wx + 1 - jit, lr.wy + 1, 1, 2);
    }
    ctx.globalAlpha = 1;
  }

  // the door nearest the courier glows, inviting them in
  if (activeDoor) {
    const pul = REDUCED ? 0.7 : 0.6 + 0.3 * Math.sin(animT * 5);
    ctx.globalAlpha = Math.max(0.3, pul);
    ctx.drawImage(SPR.doorglow, Math.round(activeDoor.wx - 9), Math.round(activeDoor.wy - 9));
    ctx.globalAlpha = Math.max(0.2, pul * 0.5);
    ctx.drawImage(SPR.doorglow, Math.round(activeDoor.wx - 13), Math.round(activeDoor.wy - 12), 27, 21);
    ctx.globalAlpha = 1;
  }

  // weather + dust + breath particles (drawn last so snow stays bright)
  if (parts.length) {
    for (const p of parts) {
      if (p.wx < vx0 || p.wx > vx1 || p.wy < vy0 || p.wy > vy1) continue;
      let a = 1, c = '#fff', w2 = 1, h2 = 1;
      if (p.type === 'snow') { c = '#eef2f8'; if (p.ph % 3 === 0) { w2 = 2; h2 = 2; } a = Math.min(1, p.life); }
      else if (p.type === 'leaf') { c = p.col; w2 = 2; a = Math.min(1, p.life); }
      else if (p.type === 'petal') { c = p.col; a = Math.min(1, p.life); }
      else if (p.type === 'dust') { c = '#b9ad93'; a = Math.max(0, p.life / 0.5) * 0.7; if (p.life > 0.25) { w2 = 2; h2 = 2; } }
      else { c = '#e8ecf2'; a = Math.max(0, p.life / 0.9) * 0.55; if (p.life > 0.45) { w2 = 2; h2 = 2; } }
      ctx.globalAlpha = a;
      ctx.fillStyle = c;
      ctx.fillRect(Math.round(p.wx), Math.round(p.wy), w2, h2);
    }
    ctx.globalAlpha = 1;
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // a pixel moon rides high once night falls (screen space, integer scale)
  if (nf > 0.2) {
    ctx.globalAlpha = Math.min(1, (nf - 0.2) * 1.6);
    const ms = SPR.moon, sc = Math.max(2, Math.min(3, Math.round(cvs.width / 700)));
    ctx.drawImage(ms, Math.round(cvs.width * 0.86), Math.round(cvs.height * 0.10), ms.width * sc, ms.height * sc);
    ctx.globalAlpha = 1;
  }

  // pin the door prompt above the glowing door; never let it cover the courier
  if (activeDoor && !doorPromptEl.hidden) {
    const rdpr = window.devicePixelRatio || 1;
    const bx = (activeDoor.wx - cam.x) * z / rdpr;
    let by = (activeDoor.wy - 14 - cam.y) * z / rdpr;
    const pwx = OX + (player.x - player.y) * HW, pwy = OY + (player.x + player.y) * HH;
    const psL = (pwx - 7 - cam.x) * z / rdpr, psR = (pwx + 8 - cam.x) * z / rdpr;
    const psT = (pwy - 16 - cam.y) * z / rdpr, psB = (pwy + 2 - cam.y) * z / rdpr;
    const bw = doorPromptEl.offsetWidth || 140, bh = doorPromptEl.offsetHeight || 28;
    if (bx + bw / 2 > psL && bx - bw / 2 < psR && by > psT && by - bh < psB) by = psT;
    doorPromptEl.style.left = bx + 'px';
    doorPromptEl.style.top = by + 'px';
  }

  const mins = Math.floor(dayT * 1440);
  const hh2 = String(Math.floor(mins / 60)).padStart(2, '0'), mm2 = String(mins % 60).padStart(2, '0');
  hud.textContent = `${hh2}:${mm2} · ${SEASONS[season]} · ${Wt}x${Ht} tiles · zoom x${cam.z} · ${frameMs.toFixed(1)} ms/frame${REDUCED ? ' · motion reduced' : ''}`;
}
function blit(d) {
  if (d.alpha !== undefined) ctx.globalAlpha = d.alpha;
  if (d.flip) {
    ctx.save();
    ctx.translate(d.wx + d.cv.width, d.wy);
    ctx.scale(-1, 1);
    ctx.drawImage(d.cv, 0, 0);
    ctx.restore();
  } else ctx.drawImage(d.cv, d.wx, d.wy);
  if (d.alpha !== undefined) ctx.globalAlpha = 1;
}
const hlCache = new Map();
function drawHighlight(st) {
  let hl = hlCache.get(st.b.slug);
  if (!hl) {
    const [c2, g2] = mkCv(st.cv.width + 2, st.cv.height + 2);
    g2.drawImage(st.cv, 1, 1);
    g2.globalCompositeOperation = 'source-in';
    g2.fillStyle = PAL.V1; g2.fillRect(0, 0, c2.width, c2.height);
    hl = c2; hlCache.set(st.b.slug, hl);
  }
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) ctx.drawImage(hl, st.wx + dx - 1, st.wy + dy - 1);
}

/* ==========================================================================
   MAIN LOOP
   ========================================================================== */
const hud = document.getElementById('hud');
let running = false;
const diag = window.__pixelDiag = {
  avgFrameMs: 0, frameMs: 0, clock: dayT, season: SEASONS[season],
  px: 0, py: 0, mode: camMode, samples: []
};

function motionActive() {
  return keysDown.size > 0 || Math.hypot(player.vx, player.vy) > 0.03 ||
         camSettle > 0.8 || bakeQueue.length > 0;
}
function tick(dt) {
  if (!REDUCED) {
    dayT += timeSpeed * dt / DAY_LEN;
    if (dayT >= 1) { dayT -= 1; setSeason(season + 1); }   // the year turns: one season per day
    updateLife(dt);
    updateParts(dt, cam.x, cam.y, cam.x + cvs.width / cam.z, cam.y + cvs.height / cam.z);
  }
  lightFactors(dayT);
  updatePlayer(dt);
  processBakeQueue(2.5);
  updateHudDials();
}
function frame(ts) {
  const dt = Math.min(0.05, Math.max(0, (ts - lastTick) / 1000) || 0.016);
  lastTick = ts;
  const t0 = performance.now();
  tick(dt);
  draw();
  const el = performance.now() - t0;
  frameSamples.push(el);
  if (frameSamples.length > 600) frameSamples.shift();
  frameMs = frameSamples.reduce((a, b2) => a + b2, 0) / frameSamples.length;
  window.__frameMs = frameMs;
  diag.avgFrameMs = frameMs;
  diag.frameMs = el;
  diag.clock = dayT;
  diag.season = SEASONS[season];
  diag.px = player.x;
  diag.py = player.y;
  diag.mode = camMode;
  diag.samples = frameSamples;
  if (!REDUCED || motionActive()) requestAnimationFrame(frame);
  else running = false;
}
function startLoop() {
  if (running) return;
  running = true;
  requestAnimationFrame((ts) => { lastTick = ts; requestAnimationFrame(frame); });
}

/* ==========================================================================
   INTERACTION: pan/zoom/hover/click
   ========================================================================== */
const bubble = document.getElementById('bubble');
let dragging = false, dragStart = null, moved = false;

function screenToWorld(mx, my) {
  const r = cvs.getBoundingClientRect();
  const sx = (mx - r.left) * (cvs.width / r.width);
  const sy = (my - r.top) * (cvs.height / r.height);
  return [sx / cam.z + cam.x, sy / cam.z + cam.y];
}
function pickBuilding(wx, wy) {
  for (let i = statics.length - 1; i >= 0; i--) {
    const st = statics[i];
    if (!st.b) continue;
    const lx = Math.floor(wx - st.wx), ly = Math.floor(wy - st.wy);
    if (lx < 0 || ly < 0 || lx >= st.cv.width || ly >= st.cv.height) continue;
    if (st.b.pick[(ly * st.cv.width + lx) * 4 + 3] > 10) return st;
  }
  return null;
}

cvs.addEventListener('pointerdown', (e) => {
  dragging = true; moved = false;
  camMode = 'free';                 // mouse pan suspends camera follow; a move key resumes it
  dragStart = { mx: e.clientX, my: e.clientY, cx: cam.x, cy: cam.y };
  cvs.classList.add('dragging');
  cvs.setPointerCapture(e.pointerId);
});
cvs.addEventListener('pointermove', (e) => {
  if (dragging && dragStart) {
    const scale = cvs.width / cvs.getBoundingClientRect().width;
    const dx = (e.clientX - dragStart.mx) * scale / cam.z;
    const dy = (e.clientY - dragStart.my) * scale / cam.z;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
    cam.x = Math.round(dragStart.cx - dx);
    cam.y = Math.round(dragStart.cy - dy);
    bubble.hidden = true;
    if (REDUCED) draw();
    return;
  }
  const [wx, wy] = screenToWorld(e.clientX, e.clientY);
  const st = pickBuilding(wx, wy);
  const b = st ? st.b : null;
  if (b !== hoverB) {
    hoverB = b;
    cvs.classList.toggle('pointing', !!b);
    if (b) {
      const p = pagesBySlug[b.slug];
      const keeper = PROV[b.slug]?.topAuthor;
      bubble.innerHTML = `<span class="b-title"></span><span class="b-sub"></span>${keeper ? '<span class="b-keeper"></span>' : ''}`;
      bubble.querySelector('.b-title').textContent = p.title || b.slug;
      bubble.querySelector('.b-sub').textContent = `${b.quarter.name} · ${b.words} words${b.code ? ' · ' + b.code + ' code blocks' : ''}`;
      if (keeper) bubble.querySelector('.b-keeper').textContent = 'keeper: ' + keeper;
      bubble.hidden = false;
    } else bubble.hidden = true;
    if (REDUCED) draw();
  }
  if (b && st) {
    const r = cvs.getBoundingClientRect();
    const topX = (st.wx + st.cv.width / 2 - cam.x) * cam.z * (r.width / cvs.width);
    const topY = (st.wy - cam.y) * cam.z * (r.height / cvs.height);
    bubble.style.left = clamp(topX, 80, r.width - 80) + 'px';
    bubble.style.top = clamp(topY - 6, 40, r.height - 40) + 'px';
  }
});
cvs.addEventListener('pointerup', (e) => {
  dragging = false;
  cvs.classList.remove('dragging');
  if (moved) return;
  const [wx, wy] = screenToWorld(e.clientX, e.clientY);
  const st = pickBuilding(wx, wy);
  if (st) { location.hash = '#' + st.b.slug; return; }
  // clicking near pigeons scatters them
  const tx = ((wx - OX) / HW + (wy - OY) / HH) / 2, ty = ((wy - OY) / HH - (wx - OX) / HW) / 2;
  for (const pg of pigeons) {
    if (Math.abs(pg.tx - tx) < 2 && Math.abs(pg.ty - ty) < 2 && pg.st === 'peck') {
      pg.st = 'fly'; pg.t = 2 + rng() * 2;
      const a = Math.atan2(pg.ty - ty, pg.tx - tx) + (rng() - 0.5);
      pg.vx = Math.cos(a) * 3.4; pg.vy = Math.sin(a) * 3.4; pg.alt = 0;
    }
  }
});
cvs.addEventListener('wheel', (e) => {
  e.preventDefault();
  zoomStep(e.deltaY < 0 ? 1 : -1, e.clientX, e.clientY);
}, { passive: false });

const ZLEVELS = [1, 2, 3, 4, 6, 8];
function zoomStep(dir, mx, my) {
  const zi = ZLEVELS.indexOf(cam.z);
  const nz = ZLEVELS[clamp(zi + dir, 0, ZLEVELS.length - 1)];
  if (nz === cam.z) return;
  const cx = mx !== undefined ? mx : window.innerWidth / 2;
  const cy = my !== undefined ? my : window.innerHeight / 2;
  const [wx, wy] = screenToWorld(cx, cy);
  cam.z = nz;
  const r = cvs.getBoundingClientRect();
  const sx = (cx - r.left) * (cvs.width / r.width);
  const sy = (cy - r.top) * (cvs.height / r.height);
  cam.x = Math.round(wx - sx / cam.z);
  cam.y = Math.round(wy - sy / cam.z);
  if (REDUCED) draw();
}
document.getElementById('zin').onclick = () => zoomStep(1);
document.getElementById('zout').onclick = () => zoomStep(-1);
document.getElementById('zfit').onclick = () => { fitZoom(); if (REDUCED) draw(); };
window.addEventListener('resize', () => { resize(); if (REDUCED) draw(); });

/* ==========================================================================
   ROUTER + READING PANEL
   ========================================================================== */
const panel = document.getElementById('panel');
const panelContent = document.getElementById('panel-content');

function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function fixLinksIn(el) {
  el.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#/')) { /* already hash route */ }
    else if (href.startsWith('/img/')) { a.setAttribute('href', href.slice(1)); a.target = '_blank'; }
    else if (href.startsWith('/')) {
      const clean = href.split('#')[0].replace(/\/$/, '');
      const anchor = href.includes('#') ? href.slice(href.indexOf('#')) : '';
      a.setAttribute('href', '#' + clean + anchor); // keep the sub-anchor: route() lands on the heading
    } else if (/^https?:/i.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
    else if (href.startsWith('#') && !href.startsWith('#/')) {
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        const t2 = panelContent.querySelector('#' + CSS.escape(href.slice(1)) + ', [id="' + href.slice(1) + '"]');
        if (t2) t2.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  });
  el.querySelectorAll('img').forEach(im => {
    const s = im.getAttribute('src') || '';
    if (s.startsWith('/img/')) im.setAttribute('src', s.slice(1));
    im.loading = 'lazy';
  });
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

let tabGroupChoice = {};
function renderBlocks(blocks, host) {
  for (const b of blocks || []) {
    try { renderBlock(b, host); } catch (err) { console.warn('block render issue', b.t, err); }
  }
}
function renderBlock(b, host) {
  switch (b.t) {
    case 'tldr': {
      const d = el('div', 'tldr', `<span class="tldr-tag">In a nutshell</span>${b.html}`);
      host.appendChild(d); break;
    }
    case 'p': host.appendChild(el('p', null, b.html)); break;
    case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
      const h = el(b.t, null, esc(b.text));
      if (b.id) h.id = b.id;
      host.appendChild(h); break;
    }
    case 'hr': host.appendChild(el('hr')); break;
    case 'img': {
      const f = el('figure');
      const im = document.createElement('img');
      im.src = (b.light || b.dark || '').replace(/^\//, '');
      im.alt = b.alt || '';
      f.appendChild(im);
      if (b.caption) f.appendChild(el('figcaption', null, b.caption));
      host.appendChild(f); break;
    }
    case 'ul': case 'ol': {
      const l = document.createElement(b.t);
      if (b.t === 'ol' && b.start && b.start !== 1) l.start = b.start;
      for (const it of b.items || []) {
        const li = document.createElement('li');
        if (typeof it === 'string') li.innerHTML = it;
        else { if (it.html) li.innerHTML = it.html; if (it.blocks) renderBlocks(it.blocks, li); }
        l.appendChild(li);
      }
      host.appendChild(l); break;
    }
    case 'table': {
      const wrap = el('div', 'tblwrap');
      const tb = document.createElement('table');
      if (b.head && b.head.length) {
        const tr = document.createElement('tr');
        b.head.forEach(h => { const th = document.createElement('th'); th.innerHTML = h; tr.appendChild(th); });
        tb.appendChild(tr);
      }
      (b.rows || []).forEach(r => {
        const tr = document.createElement('tr');
        r.forEach(c => { const td = document.createElement('td'); td.innerHTML = c; tr.appendChild(td); });
        tb.appendChild(tr);
      });
      wrap.appendChild(tb);
      host.appendChild(wrap); break;
    }
    case 'admonition': {
      const kind = b.kind || 'note';
      const names = { tip: 'Tip', note: 'Note', info: 'Info', caution: 'Caution', warning: 'Warning', danger: 'Danger', strapi: 'Strapi', prerequisites: 'Prerequisites', callout: 'Callout' };
      const d = el('div', 'adm adm-' + kind, `<span class="adm-tag">${names[kind] || esc(kind)}${b.title ? ': ' + esc(b.title) : ''}</span>`);
      renderBlocks(b.blocks, d);
      host.appendChild(d); break;
    }
    case 'code': host.appendChild(codeEl(b)); break;
    case 'tabs': {
      const set = el('div', 'tabset');
      const bar = el('div', 'tabbar'); bar.setAttribute('role', 'tablist');
      const panes = [];
      (b.tabs || []).forEach((t2, i) => {
        const btn = document.createElement('button');
        btn.textContent = t2.label || t2.value || ('Tab ' + (i + 1));
        btn.setAttribute('role', 'tab');
        const pane = el('div', 'tabpane');
        renderBlocks(t2.blocks, pane);
        panes.push([btn, pane, t2.value]);
        bar.appendChild(btn);
      });
      set.appendChild(bar);
      panes.forEach(p => set.appendChild(p[1]));
      const select = (i, remember) => {
        panes.forEach((p, j) => { p[0].setAttribute('aria-selected', String(i === j)); p[1].hidden = i !== j; });
        if (remember && b.groupId) {
          tabGroupChoice[b.groupId] = panes[i][2];
          document.querySelectorAll('.tabset').forEach(s => { if (s._sync) s._sync(); });
        }
      };
      panes.forEach((p, i) => p[0].addEventListener('click', () => select(i, true)));
      set._sync = () => {
        if (!b.groupId || !(b.groupId in tabGroupChoice)) return;
        const want = tabGroupChoice[b.groupId];
        const i = panes.findIndex(p => p[2] === want);
        if (i >= 0 && panes[i][1].hidden) select(i, false);
      };
      let init = 0;
      if (b.groupId && tabGroupChoice[b.groupId]) {
        const i = panes.findIndex(p => p[2] === tabGroupChoice[b.groupId]);
        if (i >= 0) init = i;
      }
      select(init, false);
      host.appendChild(set); break;
    }
    case 'cards': {
      const gcd = el('div', 'cardsgrid');
      (b.items || []).forEach(it => {
        const a = el('a', 'cardlink');
        a.href = it.link && it.link.startsWith('#') ? it.link : ('#' + (it.link || ''));
        a.innerHTML = `<span class="c-ico">${esc(it.icon || '📄')}</span><div class="c-title">${esc(it.title || '')}</div><div class="c-desc">${it.desc || ''}</div>`;
        gcd.appendChild(a);
      });
      host.appendChild(gcd); break;
    }
    case 'badge': {
      const cls2 = /cloud/.test(b.kind || '') ? 'b-cloud' : /growth|enterprise/.test(b.kind || '') ? 'b-growth' : '';
      const sp = el('span', 'badge ' + cls2, esc(b.label || b.kind || 'Badge'));
      if (b.tooltip) sp.title = b.tooltip;
      host.appendChild(sp); break;
    }
    case 'details': {
      const d = el('details', 'dtl');
      if (b.id) d.id = b.id;
      const su = el('summary', null, b.summary || 'Details');
      d.appendChild(su);
      const body = el('div', 'dtl-body');
      renderBlocks(b.blocks, body);
      d.appendChild(body);
      host.appendChild(d); break;
    }
    case 'endpoint': host.appendChild(endpointEl(b)); break;
    case 'columns': {
      const w = el('div', 'colwrap');
      (b.cols || []).forEach(col => { const c2 = el('div'); renderBlocks(col, c2); w.appendChild(c2); });
      host.appendChild(w); break;
    }
    default: {
      if (b.html) host.appendChild(el('div', null, b.html));
      break;
    }
  }
}
function codeEl(b) {
  const d = el('div', 'codeblock');
  if (b.title || b.lang) d.appendChild(el('div', 'code-title', `<span>${esc(b.title || '')}</span><span>${esc(b.lang || '')}</span>`));
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.textContent = (b.code || '').replace(/^\n/, '');
  pre.appendChild(code);
  d.appendChild(pre);
  return d;
}
function endpointEl(b) {
  const d = el('div', 'endpoint');
  if (b.id) d.id = b.id;
  if (b.kind === 'http') {
    const head = el('div', 'ep-head');
    head.appendChild(el('span', 'ep-method m-' + (b.method || 'get').toLowerCase(), esc(b.method || '')));
    head.appendChild(el('span', 'ep-path', esc(b.path || '')));
    d.appendChild(head);
  } else if (b.path || b.title) {
    const head = el('div', 'ep-head');
    head.appendChild(el('span', 'ep-path', esc(b.path || b.title)));
    d.appendChild(head);
  }
  if (b.title && b.kind === 'http') d.appendChild(el('div', 'ep-title', esc(b.title)));
  if (b.description) d.appendChild(el('div', 'ep-desc', b.description));
  if (b.params && b.params.length) {
    d.appendChild(el('div', 'ep-section-tag', esc(b.paramTitle || 'Parameters')));
    const pw = el('div', 'ep-params');
    const wrap = el('div', 'tblwrap');
    const tb = document.createElement('table');
    b.params.forEach(p => {
      const tr = document.createElement('tr');
      const td1 = document.createElement('td');
      td1.innerHTML = `<span class="p-name">${esc(p.name)}</span>${p.required ? '<span class="p-req">required</span>' : ''}<span class="p-type">${esc(p.type || '')}</span>`;
      const td2 = document.createElement('td');
      td2.innerHTML = p.desc || '';
      tr.appendChild(td1); tr.appendChild(td2);
      tb.appendChild(tr);
    });
    wrap.appendChild(tb); pw.appendChild(wrap); d.appendChild(pw);
  }
  (b.codeTabs || []).forEach(ct => {
    if (ct.label) d.appendChild(el('div', 'ep-section-tag', esc(ct.label)));
    d.appendChild(codeEl({ code: ct.code, lang: ct.lang, title: ct.title || '' }));
  });
  (b.responses || []).forEach(r => {
    d.appendChild(el('div', 'ep-resp-line', `Response ${esc(String(r.status || ''))} ${esc(r.statusText || '')}`));
    d.appendChild(codeEl({ code: r.body, lang: r.lang || 'json' }));
  });
  return d;
}

function openPage(slug, anchor) {
  const page = pagesBySlug[slug];
  if (!page) { closePanel(); return; }
  const b = buildings.find(x => x.slug === slug);
  document.getElementById('panel-crumb').textContent =
    `${(page.product || '').toUpperCase()} / ${page.section || (b ? b.quarter.name : '')}`;
  const keeper = PROV[slug]?.topAuthor;
  const meta = [];
  if (b) meta.push(`${b.words.toLocaleString('en-US')} words`);
  if (b && b.code) meta.push(`${b.code} code block${b.code > 1 ? 's' : ''}`);
  if (b && b.inb) meta.push(`cited by ${b.inb} page${b.inb > 1 ? 's' : ''}`);
  if (keeper) meta.push(`<span class="keeper">keeper: ${esc(keeper)}</span>`);
  document.getElementById('panel-meta').innerHTML = meta.join(' · ');
  document.getElementById('panel-title').textContent = page.title || slug;
  panelContent.innerHTML = '';
  renderBlocks(page.blocks, panelContent);
  fixLinksIn(panelContent);
  // prev / next
  const oi = ORDER.indexOf(slug);
  const prev = oi > 0 ? ORDER[oi - 1] : null;
  const next = oi >= 0 && oi < ORDER.length - 1 ? ORDER[oi + 1] : null;
  const pl = document.getElementById('prev-link'), nl = document.getElementById('next-link');
  if (prev) { pl.hidden = false; pl.href = '#' + prev; pl.innerHTML = `<span>← Previous</span>${esc(pagesBySlug[prev].title)}`; } else pl.hidden = true;
  if (next) { nl.hidden = false; nl.href = '#' + next; nl.innerHTML = `<span>Next →</span>${esc(pagesBySlug[next].title)}`; } else nl.hidden = true;
  panel.hidden = false;
  panel.scrollTop = 0;
  if (anchor) {
    // carry the sub-anchor through so cross-page references land on their heading
    const target = panelContent.querySelector('#' + CSS.escape(anchor));
    if (target) {
      target.scrollIntoView({ block: 'start' });
      // lazy images above the heading reflow the panel as they land: re-anchor
      // briefly after opening so the reader stays on the heading they asked for
      const openedAt = performance.now();
      panelContent.querySelectorAll('img').forEach(im => {
        if (im.complete) return;
        im.addEventListener('load', () => {
          if (!panel.hidden && target.isConnected && performance.now() - openedAt < 1500)
            target.scrollIntoView({ block: 'start' });
        }, { once: true });
      });
    }
  }
  document.title = (page.title || slug) + ' · Pixel Docs City';
  keysDown.clear();                 // the walk stops at the door
  bubble.hidden = true;             // the hover bubble yields to the reading room
  hoverB = null;
  cvs.classList.remove('pointing');
  // centre camera on the building, unless the courier walked here themselves
  if (b) {
    const walkedHere = Math.hypot(player.x - (b.tx + 0.3), player.y - (b.ty + b.fd + 0.5)) < 4;
    if (!walkedHere) {
      camMode = 'free';
      const wx = isoX(b.tx, b.ty), wy = isoY(b.tx, b.ty);
      cam.x = Math.round(wx - (cvs.width * 0.35) / cam.z);
      cam.y = Math.round(wy - cvs.height / (2 * cam.z));
    }
    if (REDUCED) draw();
  }
}
function closePanel() {
  panel.hidden = true;
  document.title = 'Pixel Docs City';
}
function route() {
  const h = location.hash.slice(1);
  if (h && h.startsWith('/')) {
    // "/slug#anchor" routes: open the base page, then land on the exact heading
    const cut = h.indexOf('#');
    const base = cut >= 0 ? h.slice(0, cut) : h;
    const anchor = cut >= 0 ? h.slice(cut + 1) : '';
    openPage(base.replace(/\/$/, '') || base, anchor);
  } else closePanel();
}
window.addEventListener('hashchange', route);
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const drawer = document.getElementById('drawer'), kp = document.getElementById('keypanel');
  if (!drawer.hidden) { drawer.hidden = true; return; }
  if (!kp.hidden) { kp.hidden = true; return; }
  if (!panel.hidden) {
    if (location.hash && location.hash !== '#/') location.hash = '#/';
    else closePanel();
  }
});
document.getElementById('panel-close').onclick = () => {
  if (location.hash && location.hash !== '#/') location.hash = '#/';
  else closePanel();
};

/* game keys: walking, doors, time and season (never captured while typing) */
document.addEventListener('keydown', (e) => {
  if (e.target && e.target.closest && e.target.closest('input, textarea')) return;
  if (!panel.hidden) {
    // the reading panel needs the vertical keys: hand them to it
    if (e.code === 'ArrowDown') { panel.scrollBy(0, 90); e.preventDefault(); }
    else if (e.code === 'ArrowUp') { panel.scrollBy(0, -90); e.preventDefault(); }
    else if (e.code === 'Space') { panel.scrollBy(0, Math.round(panel.clientHeight * 0.85)); e.preventDefault(); }
    return;
  }
  if (KEYMAP[e.code]) {
    keysDown.add(KEYMAP[e.code]);
    camMode = 'follow';             // any move key hands the camera back to the courier
    e.preventDefault();
    startLoop();
    return;
  }
  if ((e.code === 'Enter' || e.code === 'Space') && activeDoor) {
    location.hash = '#' + activeDoor.slug;
    e.preventDefault();
    return;
  }
  if (e.code === 'Space') { e.preventDefault(); return; }
  if (e.code === 'KeyT') { cycleTimeSpeed(); return; }
  if (e.code === 'KeyY') { setSeason(season + 1); startLoop(); return; }
});
document.addEventListener('keyup', (e) => { if (KEYMAP[e.code]) keysDown.delete(KEYMAP[e.code]); });
window.addEventListener('blur', () => keysDown.clear());

/* ==========================================================================
   SEARCH + DRAWER + KEY
   ========================================================================== */
function initSearch() {
  const inp = document.getElementById('search');
  const res = document.getElementById('search-results');
  const index = Object.values(pagesBySlug).map(p => ({
    slug: p.slug, title: p.title || p.slug, label: p.sidebarLabel || '',
    hay: [(p.title || ''), (p.sidebarLabel || ''), (p.description || ''), (p.tags || []).join(' '), p.slug].join(' ').toLowerCase()
  }));
  let sel = -1, items = [];
  function run() {
    const q = inp.value.trim().toLowerCase();
    if (q.length < 2) { res.hidden = true; return; }
    const terms = q.split(/\s+/);
    const scored = [];
    for (const it of index) {
      let s = 0;
      for (const t2 of terms) {
        if (!it.hay.includes(t2)) { s = -1; break; }
        if (it.title.toLowerCase().includes(t2)) s += 3;
        if (it.title.toLowerCase().startsWith(t2)) s += 3;
        s += 1;
      }
      if (s > 0) scored.push([s, it]);
    }
    scored.sort((a, b2) => b2[0] - a[0]);
    items = scored.slice(0, 12).map(x => x[1]);
    sel = -1;
    res.innerHTML = items.map(it =>
      `<a href="#${it.slug}"><div>${esc(it.title)}</div><div class="sr-path">${esc(it.slug)}</div></a>`).join('');
    res.hidden = !items.length;
  }
  inp.addEventListener('input', run);
  inp.addEventListener('keydown', (e) => {
    const as = [...res.querySelectorAll('a')];
    if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, as.length - 1); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); e.preventDefault(); }
    else if (e.key === 'Enter') { if (as[Math.max(0, sel)]) { location.hash = as[Math.max(0, sel)].hash; res.hidden = true; inp.blur(); } return; }
    else if (e.key === 'Escape') { res.hidden = true; return; }
    else return;
    as.forEach((a, i) => a.classList.toggle('sel', i === sel));
  });
  res.addEventListener('click', () => { res.hidden = true; });
  document.addEventListener('click', (e) => { if (!e.target.closest('#searchbox')) res.hidden = true; });
}

function initDrawer() {
  const drawer = document.getElementById('drawer');
  const body = document.getElementById('drawer-body');
  const seen = new Set();
  let html = '';
  // nav nodes are either pages (slug) or categories (child items).
  // Categories render as headings, never as links; each page is listed once,
  // at its first home in the nav.
  const emit = (items, depth) => {
    let out = '';
    for (const it of items || []) {
      if (it.slug) {
        if (seen.has(it.slug) || !pagesBySlug[it.slug]) continue;
        seen.add(it.slug);
        out += `<a href="#${it.slug}"${depth ? ' class="d-sub"' : ''}>${esc(it.label)}</a>`;
      } else if (it.items && it.items.length) {
        const kids = emit(it.items, depth + 1);
        if (kids) out += `<h4>${esc(it.label)}</h4>` + kids;
      }
    }
    return out;
  };
  for (const sec of NAV) {
    const rows = emit(sec.items, 0);
    if (rows) html += `<h3>${esc(sec.label)} <span style="opacity:.6">(${esc(sec.product || '')})</span></h3>` + rows;
  }
  // group everything else by section
  const rest = Object.values(pagesBySlug).filter(p => !seen.has(p.slug));
  const bySec = {};
  rest.forEach(p => { const k = (p.product || 'other') + ' · ' + (p.section || 'Other'); (bySec[k] = bySec[k] || []).push(p); });
  for (const k of Object.keys(bySec).sort()) {
    html += `<h3>${esc(k)}</h3>`;
    bySec[k].sort((a, b2) => (a.title || '').localeCompare(b2.title || '')).forEach(p => {
      html += `<a href="#${p.slug}">${esc(p.sidebarLabel || p.title)}</a>`;
    });
  }
  body.innerHTML = html;
  document.getElementById('btn-nav').onclick = () => { drawer.hidden = !drawer.hidden; };
  document.getElementById('drawer-close').onclick = () => { drawer.hidden = true; };
  body.addEventListener('click', (e) => { if (e.target.closest('a')) drawer.hidden = true; });
}

function initKey() {
  const kp = document.getElementById('keypanel');
  const kb = document.getElementById('key-body');
  const wmin = Math.min(...Object.values(GRAPH.words));
  const wmax = Math.max(...Object.values(GRAPH.words));
  const cmax = Math.max(...Object.values(GRAPH.code));
  const nPages = Object.keys(pagesBySlug).length;
  const hubTitles = hubs.map(h => pagesBySlug[h]?.title || h);
  kb.innerHTML = `
    <p>Every building is one real documentation page: ${nPages} of them. Nothing here is decorative data: every visual fact below is measured from the docs.</p>
    <h3>BUILDINGS</h3>
    <ul>
      <li><strong>Size and height</strong> come from the page's word count (from ${wmin.toLocaleString('en-US')} to ${wmax.toLocaleString('en-US')} words). Bigger page, bigger building.</li>
      <li><strong>Lit windows</strong> = the page's code blocks (up to ${cmax} on one page). Pages with no code at all get a planted flowerbed out front instead.</li>
      <li><strong>Style</strong> says what the page is: glass-and-brick offices are API reference, sawtooth-roof workshops are tutorials and guides, long records halls are configuration and tables, columned civic buildings (a dome for the most-cited) are core concepts, scaffolding marks migration pages, tiny kiosks are stubs.</li>
      <li><strong>Boarded-up shopfronts</strong> with a for-lease board are the ${uncitedSet.size} pages no other page links to. The cats like them.</li>
      <li><strong>Rooftop billboards</strong> mark the four most-cited pages: ${hubTitles.map(esc).join(', ')}.</li>
    </ul>
    <h3>THE MAP</h3>
    <ul>
      <li>The ${quarters.length - 1} city quarters are citation communities: pages that cite each other share a block, and quarters that cite each other were placed as neighbours. The small back lane holds the ${quarters[quarters.length - 1].members.length} pages outside the main navigation.</li>
      <li><span class="swatch" style="background:${PAL.W2}"></span><strong>The canals</strong> trace the suggested reading order: follow the water from the north-west and you pass the quarters in the order the docs recommend reading them. A boat makes the trip.</li>
      <li><strong>Street traffic</strong> is scaled from the ${edgeCount.toLocaleString('en-US')} cross-references between pages; streets around heavily-cited quarters carry more cars.</li>
    </ul>
    <h3>GETTING AROUND</h3>
    <ul>
      <li>Drag to pan, scroll or +/− to zoom (always in whole-pixel steps).</li>
      <li>Hover any building to name it and meet its keeper, the person who has committed to that page most.</li>
      <li>Click a building to read the full page in the reading room. Search or the district drawer will teleport you.</li>
      <li><strong>Or walk it:</strong> arrow keys / WASD steer the little courier with the glowing satchel. Walk up to any door and press Enter to step in and read. At the widest zoom a violet ring marks where you are.</li>
      <li><strong>The town keeps time:</strong> a full day lasts about 4 minutes and each day turns the season. Click the clock (or press T) for 1x / 8x / paused; click the season glyph (or press Y) to skip ahead. At night the windows come on street by street.</li>
    </ul>
    <p class="mono">Rendered at ${Wt}×${Ht} tiles · ${atlasStats.sprites} baked sprites · frame ${frameMs ? frameMs.toFixed(1) : '…'} ms</p>`;
  document.getElementById('btn-key').onclick = () => { kp.hidden = !kp.hidden; if (!kp.hidden) initKey(); };
  document.getElementById('key-close').onclick = () => { kp.hidden = true; };
}

/* ==========================================================================
   BOOT
   ========================================================================== */
async function boot() {
  const t0 = performance.now();
  const [content, graph, comms, prov] = await Promise.all([
    fetch('content.json').then(r => r.json()),
    fetch('graph.json').then(r => r.json()),
    fetch('communities.json').then(r => r.json()),
    fetch('provenance.json').then(r => r.json())
  ]);
  DATA = content; GRAPH = graph; COMMS = comms; PROV = prov;

  resize();
  buildModel();
  bakeAtlas();
  bakeWater();
  bakeGrounds();
  placeStatics();
  bakeShadows();
  initStars();
  initLife();
  initPlayerSpawn();
  fitZoom();
  initSearch();
  initDrawer();
  initKey();
  initHud();
  initHint();
  lightFactors(dayT);

  document.getElementById('loading').remove();
  console.log(`pixel docs city ready in ${(performance.now() - t0).toFixed(0)}ms - ${Wt}x${Ht} tiles, ${buildings.length} buildings, ${statics.length} statics, ${atlasStats.sprites} sprites, ${doors.length} doors`);

  route();
  window.__pixelTest = {
    setPlayer(x, y) { player.x = x; player.y = y; player.vx = player.vy = 0; camMode = 'follow'; },
    setClock(t2) { dayT = t2; lightFactors(dayT); lastDialStep = -1; },
    setSeason(i2) { setSeason(i2); },
    setZoom(z2) { cam.z = z2; },
    setSpeed(s2) { if (!REDUCED) timeSpeed = s2; },
    playerPos: () => [player.x, player.y],
    doorFor(slug) { const d = doors.find(dd => dd.slug === slug); return d ? { px: d.px, py: d.py } : null; },
    doorCount: () => doors.length,
    activeDoor: () => activeDoor && activeDoor.slug,
    tileAt: (tx2, ty2) => tileAt(tx2, ty2),
    pending: () => bakeQueue.length,
    partsCount: () => parts.length,
    partsByType: () => parts.reduce((m, p) => { m[p.type] = (m[p.type] || 0) + 1; return m; }, {}),
    playerScreen: () => {
      const rdpr = window.devicePixelRatio || 1;
      const wx = OX + (player.x - player.y) * HW, wy = OY + (player.x + player.y) * HH;
      return {
        l: (wx - 7 - cam.x) * cam.z / rdpr, r: (wx + 8 - cam.x) * cam.z / rdpr,
        t: (wy - 16 - cam.y) * cam.z / rdpr, b: (wy + 2 - cam.y) * cam.z / rdpr
      };
    },
    state: () => ({ water: waterCvs.length, grounds: groundSets.length, animT, seasonIdx: season, red: REDUCED }),
    slugs: () => ORDER.slice(),
    ready: true
  };
  if (REDUCED) {
    // posed tableau: advance the world a little so nothing looks parked, then freeze
    for (let i = 0; i < 40; i++) updateLife(0.05);
    draw();
  } else {
    startLoop();
  }
}
boot().catch(err => {
  console.error(err);
  const l = document.getElementById('loading');
  if (l) l.innerHTML = `<p style="color:#ff8">Could not load the city: ${esc(err.message)}</p>`;
});
