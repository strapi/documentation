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
  SK: '#e0a878', SK2: '#8c5a3c',
  /* district-language additions (round 4): tech screens, curtain glass,
     harbor blues, records copper, warehouse shadow-brick */
  TG: '#54d8a8', TG2: '#1f8a68', TD: '#2b3140',
  GL3: '#31536e',
  HB1: '#2f6b8a', HB2: '#8fc3d4',
  CU1: '#4d8a74', CU2: '#77b096',
  RS1: '#401d15'
};
const THEMES = [PAL.RD, PAL.YL, PAL.GL1, PAL.G3, PAL.B4, PAL.W3, PAL.C1, PAL.S3];

/* ------------------------------------------------ constants -------------- */
const HW = 8, HH = 4;             // tile half-width / half-height in world px
const SPX = 7;                    // pixels per storey
const T = { SEA: 0, WATER: 1, BANK: 2, ROAD: 3, CROSS: 4, BRIDGE: 5, PAVE: 6, PLAZA: 7, GRASS: 8, FLOWER: 9, LOT: 10 };
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DEVFLAG = /[?&]dev\b/.test(location.search);

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
      const u0 = (t - a[0]) / ((b2[0] - a[0]) || 1);
      const u = u0 * u0 * (3 - 2 * u0);   // smoothstep between keyframes: no linear ticks
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
const player = { x: 0, y: 0, vx: 0, vy: 0, face: 6, walkT: 0, idleT: 99, dustT: 0, breathT: 2, tgt: null, tgtStall: 0 };
let camSettle = 0;
let camFly = null;          // animated pan+stepped-integer-zoom flight
let yahT = 0, yahHold = false;   // YOU ARE HERE marker: timed pulse / held until dismissed
let spotQ = null, spotA = 0, spotOn = false;   // district spotlight state
let orient = 0;                  // map orientation 0..3 (quarter turns, Q/E)
let Wv = 0, Hv = 0;              // view-space map dims in tiles (swap when orient is odd)
let rotFx = null;                // shutter transition while the world re-bakes
let propList = [];               // every placed prop, in tile space, for re-projection
let groundStamp = [-1, -1, -1, -1]; // orientation each season's ground set was baked at
let seasonPrev = -1, seasonBlend = 1; // eased ground crossfade between seasons
let rainI = 0, rainTarget = 0, rainTimer = 40, rainOn = false; // shower state (eased)
let rainFrom = 0, rainU = 1, rainAcc = 0; // smoothstep ramp + drop spawn accumulator
let puddlePts = [];              // seeded puddle glint points (tile coords)
let tp = null;                   // teleport animation {phase, t, door}
let tpHeld = 0;                  // reduced-motion: one held sparkle frame after reposition
let waveT = 0;                   // courier wave-at-the-camera timer
let stride = false;              // Shift held: the courier strides
let fadeCount = 0;               // occlusion fades still animating (keeps the loop awake)
let lastDt = 0.016;

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
   BUILDING SPRITES - assembled from authored components.
   Round 4: every quarter speaks its own architectural language, classified
   from what its pages document. The language drives materials, facade
   archetypes, window shapes, ground floors, roofs and signage; inside a
   district, three seeded archetypes plus corner pieces and hub landmarks
   keep neighbours from ever rendering identical.
   ========================================================================== */
const WALL = (lt, dk, dd, course) => ({ lt, dk, dd, course });
const LANGS = {
  tech: {      // development, CLI, TypeScript: steel panels, ducts, terminals
    walls: [WALL(PAL.S3, PAL.S2, PAL.TD, PAL.TD), WALL(PAL.A3, PAL.A2, PAL.A1, PAL.TD), WALL(PAL.S2, PAL.S1, PAL.TD, '#232a36')],
    accent: PAL.TG, roof: [PAL.A2, PAL.A1], gf: 'terminal', win: 'panel',
    awns: [PAL.TG2, PAL.A2, PAL.S2], props: ['serverbox', 'duct'], stall: false
  },
  glass: {     // content APIs: curtain-wall towers over stone lobbies
    walls: [WALL(PAL.C2, PAL.C1, '#6f6244', PAL.C1), WALL(PAL.S3, PAL.S2, PAL.S1, PAL.S1), WALL(PAL.P3, PAL.P2, PAL.P1, PAL.P1)],
    accent: PAL.GL2, roof: [PAL.S2, PAL.S1], gf: 'lobby', win: 'grid',
    awns: [PAL.GL1, PAL.S2, PAL.C1], props: ['planter', 'duct'], stall: false
  },
  retail: {    // features: showcase windows, awnings, hanging signs
    walls: [WALL(PAL.B3, PAL.B2, PAL.B1, PAL.B1), WALL(PAL.B4, PAL.B3, PAL.B2, PAL.B2), WALL(PAL.C3, PAL.C2, PAL.C1, PAL.C1)],
    accent: PAL.RD, roof: [PAL.B3, PAL.B2], gf: 'showcase', win: 'shutter',
    awns: [PAL.RD, PAL.YL, PAL.G3], props: ['planter', 'aboard'], stall: true
  },
  warehouse: { // migration: heavy brick, loading docks, hoists
    walls: [WALL(PAL.B2, PAL.B1, PAL.RS1, PAL.RS1), WALL(PAL.B3, PAL.B2, PAL.RS1, PAL.B1), WALL(PAL.A3, PAL.A2, PAL.A1, PAL.RS1)],
    accent: PAL.YL, roof: [PAL.B1, PAL.RS1], gf: 'loading', win: 'slit',
    awns: [PAL.YL, PAL.RD, PAL.A2], props: ['crate', 'crates'], stall: false
  },
  civic: {     // getting started: glass-and-stone civic halls
    walls: [WALL(PAL.C3, PAL.C2, PAL.C1, PAL.C1), WALL(PAL.WH, PAL.C3, PAL.C2, PAL.C2), WALL(PAL.C3, PAL.C2, PAL.C1, PAL.C2)],
    accent: PAL.YL, roof: [PAL.C2, PAL.C1], gf: 'arcade', win: 'arch',
    awns: [PAL.YL, PAL.W3, PAL.RD], props: ['planter', 'noticeboard'], stall: true
  },
  records: {   // configurations: archive halls under copper roofs
    walls: [WALL(PAL.C2, PAL.C1, '#6f6244', '#6f6244'), WALL(PAL.P3, PAL.P2, PAL.P1, PAL.P1), WALL(PAL.C3, PAL.C2, PAL.C1, PAL.C1)],
    accent: PAL.CU1, roof: [PAL.CU2, PAL.CU1], gf: 'vault', win: 'tall',
    awns: [PAL.CU1, PAL.YL, PAL.S2], props: ['noticeboard', 'planter'], stall: false
  },
  foundry: {   // plugins development: sawtooth workshops, timber and cream render
    walls: [WALL(PAL.WD3, PAL.WD2, PAL.WD1, PAL.WD1), WALL(PAL.C2, PAL.C1, '#6f6244', PAL.WD1), WALL(PAL.B4, PAL.B3, PAL.B2, PAL.WD1)],
    accent: PAL.YL, roof: [PAL.G1, '#1f4a26'], gf: 'workshop', win: 'square',
    awns: [PAL.YL, PAL.RD, PAL.W3], props: ['barrel', 'crate'], stall: false
  },
  harbor: {    // Strapi Cloud: white plaster, blue trim, pennants over the water
    walls: [WALL(PAL.WH, PAL.C3, PAL.C2, PAL.HB1), WALL(PAL.HB2, PAL.GL1, PAL.HB1, PAL.HB1), WALL(PAL.C3, PAL.C2, PAL.C1, PAL.HB1)],
    accent: PAL.HB1, roof: [PAL.HB2, PAL.HB1], gf: 'boathouse', win: 'cottage',
    awns: [PAL.HB1, PAL.RD, PAL.W3], props: ['lifebuoy', 'crate'], stall: false
  },
  lane: {      // the back lane of unfiled pages: patched, muted, lived-in
    walls: [WALL(PAL.A3, PAL.A2, PAL.A1, PAL.A1), WALL(PAL.P2, PAL.P1, '#6f6244', '#6f6244'), WALL(PAL.WD3, PAL.WD2, PAL.WD1, PAL.WD1)],
    accent: PAL.P3, roof: [PAL.WD2, PAL.WD1], gf: 'plain', win: 'plain',
    awns: [PAL.A2, PAL.RD, PAL.YL], props: ['crate', 'aboard'], stall: true
  }
};
/* classify a community into a language from what its pages document */
function classifyLang(c) {
  if (c.backlane) return 'lane';
  const n = { tech: 0, glass: 0, retail: 0, warehouse: 0, civic: 0, records: 0, foundry: 0, harbor: 0 };
  for (const m of c.members) {
    const s = m.toLowerCase();
    if (s.startsWith('/cloud')) n.harbor++;
    else if (s.includes('/migration/') || s.includes('/upgrade')) n.warehouse++;
    else if (s.includes('/plugins-development') || s.includes('/plugins/')) n.foundry++;
    else if (s.includes('/api/') || s.endsWith('/api')) n.glass++;
    else if (s.includes('/configurations')) n.records++;
    else if (s.includes('/features/')) n.retail++;
    else if (s.includes('quick-start') || s.includes('/installation') || s.includes('/intro') ||
             s.includes('project-structure') || s.includes('getting-started') || s.includes('setup')) n.civic++;
    else n.tech++;
  }
  let best = 'tech', bn = -1;
  for (const k in n) if (n[k] > bn) { bn = n[k]; best = k; }
  return best;
}
const LANG_BLURB = {
  tech: 'steel panels, ducts and terminal screens (development tooling)',
  glass: 'curtain-wall glass towers (API reference)',
  retail: 'brick shopfronts with showcase windows (features)',
  warehouse: 'heavy warehouse brick, loading docks and hoists (migration)',
  civic: 'glass-and-stone civic halls (getting started)',
  records: 'archive halls under copper roofs (configuration)',
  foundry: 'sawtooth workshops in timber and brick (plugin building)',
  harbor: 'white plaster, blue trim and pennants (Strapi Cloud)',
  lane: 'the patched back lane (unfiled pages)'
};

function bakeBuilding(b) {
  /* orientation-aware: odd quarter-turns swap the footprint axes on screen,
     and the door migrates to whichever face stays visible (o=0 the world
     south face draws left; o=1 it becomes the right face; o=2/3 it faces
     away and the sprite shows a plain back). */
  const swapWD = orient % 2 === 1;
  const fw = swapWD ? b.fd : b.fw, fd = swapWD ? b.fw : b.fd;
  const doorFace = orient === 0 ? 'left' : orient === 1 ? 'right' : 'none';
  const { s, style } = b;
  const L = LANGS[b.lang] || LANGS.lane;
  const arch = b.arch || 0;
  const ws = L.walls[(b.wallIdx || 0) % L.walls.length];
  const AC = L.accent;
  const aw = L.awns[(b.awnIdx || 0) % 3];
  const wallH = style === 'kiosk' ? 8 : s * SPX;
  const roofD = (fw + fd) * HH;
  const curtain = b.lang === 'glass' && style !== 'boarded' && style !== 'kiosk' && s >= 2;

  /* ---- roof shape, decided by language + archetype (+ page kind) ---- */
  let roofKind;
  if (style === 'boarded') roofKind = 'board';
  else if (style === 'kiosk') roofKind = 'kioskR';
  else if (b.dome) roofKind = 'dome';
  else if (style === 'workshop') roofKind = 'saw';
  else roofKind = ({
    tech: ['ducts', 'dish', 'mastR'],
    glass: ['parapet', 'tank', 'terraceR'],
    retail: ['tile', 'ridge', 'tile2'],
    warehouse: ['skylight', 'vents', 'hoist'],
    civic: ['stone', 'stoneBanner', 'stone'],
    records: ['copper', 'copperEdge', 'copper'],
    foundry: ['saw', 'gableChim', 'vents'],
    harbor: ['bluetile', 'pennant', 'blueridge'],
    lane: ['board', 'tile', 'board']
  }[b.lang] || ['tile', 'board', 'tile'])[arch % 3];

  /* headroom above the roof's top corner */
  let topH = 3;
  if (roofKind === 'saw') topH = Math.max(topH, 5);
  if (roofKind === 'ridge' || roofKind === 'blueridge' || roofKind === 'gableChim' || roofKind === 'skylight') topH = Math.max(topH, 7);
  if (roofKind === 'ducts' || roofKind === 'dish' || roofKind === 'mastR' || roofKind === 'tank' ||
      roofKind === 'vents' || roofKind === 'pennant' || roofKind === 'copperEdge') topH = Math.max(topH, 9);
  if (style === 'scaffold' || style === 'office') topH = Math.max(topH, 6);
  if (b.landmark && !b.sign) topH = Math.max(topH, 12);
  if (b.dome) topH = Math.max(topH, Math.min(fw, fd) * HH + 6);
  if (b.sign) topH = Math.max(topH, 14);
  const signH = topH;

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
  const lTop = (x) => Wy + ((x - Wx + 1) >> 1);
  const rTop = (x) => Sy - ((x - Sx + 1) >> 1);

  const ltCol = ws.lt, dkCol = ws.dk;
  const plaster = b.lang === 'harbor';

  // ---- walls (left face light, right face shaded + dithered) ----
  for (let x = Wx; x < Sx; x++) {
    const topY = lTop(x);
    px(g, x, topY, 1, wallH, ltCol);
    if (!plaster && ((x + topY) & 1) === 0) {
      for (let y = topY + 3; y < topY + wallH; y += 5) px(g, x, y, 1, 1, dkCol);
    }
  }
  for (let x = Sx; x < Ex; x++) {
    const topY = rTop(x);
    if (curtain) {
      px(g, x, topY, 1, wallH, PAL.GL3);
      if (((x - Sx) & 3) === 0) px(g, x, topY, 1, wallH, PAL.S1);     // vertical mullions
    } else {
      px(g, x, topY, 1, wallH, dkCol);
      if (!plaster) for (let y = topY; y < topY + wallH; y++)
        if (((x + y) & 1) === 0 && y > topY + 2) px(g, x, y, 1, 1, ws.dd);
    }
  }
  // ---- per-language facade texture ----
  if (b.lang === 'tech' && style !== 'boarded') {
    for (let x = Wx + 2; x < Sx; x += 4) px(g, x, lTop(x) + 1, 1, Math.max(1, wallH - 2), dkCol);  // panel seams
  } else if (b.lang === 'warehouse' && style !== 'kiosk') {
    for (let j = 1; j < fw; j++) { const x = Wx + j * HW; if (x < Sx) px(g, x, lTop(x), 2, wallH, dkCol); }  // pilasters
  } else if (b.lang === 'foundry') {
    for (let x = Wx + 3; x < Sx; x += 5) px(g, x, lTop(x) + 1, 1, Math.max(1, wallH - 1), PAL.WD1); // timber studs
  } else if (b.lang === 'harbor') {
    for (let x = Wx; x < Sx; x++) px(g, x, lTop(x) + wallH - 2, 1, 2, PAL.HB1);                    // blue skirt
    if (!curtain) for (let x = Sx; x < Ex; x++) px(g, x, rTop(x) + wallH - 2, 1, 2, PAL.HB1);
  } else if ((b.lang === 'records' || b.lang === 'glass') && style !== 'kiosk') {
    for (let j = 1; j < fw; j++) { const x = Wx + j * HW; if (x < Sx) px(g, x, lTop(x), 1, wallH, ws.dk); } // pier strips
  }
  // storey course lines
  for (let k = 1; k < s; k++) {
    for (let x = Wx; x < Sx; x++) px(g, x, lTop(x) + k * SPX, 1, 1, ws.course);
    for (let x = Sx; x < Ex; x++) px(g, x, rTop(x) + k * SPX, 1, 1, PAL.OUT);
  }

  // ---- windows: shape set by the district language, rhythm by archetype ----
  const gfCovers = ['terminal', 'lobby', 'showcase', 'loading', 'boathouse'].includes(L.gf) &&
                   style !== 'kiosk' && style !== 'boarded' && fw >= 2;
  const winPos = [];   // window slots on both faces
  if (style !== 'kiosk') {
    const kind = curtain ? 'grid' : L.win;
    for (let k = 0; k < s; k++) {
      const ground = (k === s - 1);
      for (let j = 0; j < fw; j++) {           // left face, per footprint tile
        if (ground && j === 0) continue;       // ground floor tile 0 = door
        if (ground && gfCovers) continue;      // ground band belongs to the shopfront treatment
        const wx0 = Wx + j * HW + 3;
        const wy0 = lTop(wx0) + k * SPX + 2;
        pushWin(winPos, kind, arch, wx0, wy0, 0);
      }
      for (let j = 0; j < fd; j++) {           // right face
        if (curtain) {                          // curtain wall: glass cells fill the face
          for (const off of [1, 5]) {
            const cx0 = Sx + j * HW + off;
            winPos.push({ x: cx0, y: rTop(cx0) + k * SPX + 1, f: 1, w: 2, h: SPX - 3, cell: 1 });
          }
        } else {
          const wx0 = Sx + j * HW + 3;
          const wy0 = rTop(wx0) + k * SPX + 2;
          pushWin(winPos, kind, arch, wx0, wy0, 1);
        }
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
    const wpx = wp.w;
    if (style === 'boarded') { // boarded planks with X
      px(g, wp.x - 1, wp.y - 1, wpx + 2, wp.h + 2, PAL.WD2);
      px(g, wp.x - 1, wp.y + (arch % 2), wpx + 2, 1, PAL.WD1);
      px(g, wp.x, wp.y + wp.h, 2, 1, PAL.WD1);
      return;
    }
    if (wp.cell) {  // curtain-wall cell: no frame, mullions already drawn
      if (isLit) {
        px(g, wp.x, wp.y, wpx, wp.h, PAL.L1); px(g, wp.x, wp.y, 1, 1, PAL.L2);
        b.litPx.push({ lx: wp.x, ly: wp.y, w: wpx, h: wp.h });
      } else {
        if (((wp.x + wp.y) & 3) === 0) px(g, wp.x, wp.y + 1, 1, 2, PAL.GL1);  // sky glint
        b.win.push({ x: wp.x, y: wp.y, w: wpx, h: wp.h });
      }
      return;
    }
    const glass = (b.lang === 'glass' && !isLit) ? PAL.GL1 : PAL.DW;
    const col = isLit ? PAL.L1 : glass;
    px(g, wp.x - 1, wp.y - 1, wpx + 2, wp.h + 2, wp.fr || PAL.OUT);
    px(g, wp.x, wp.y, wpx, wp.h, col);
    if (wp.cap) px(g, wp.x, wp.y - 2, wpx, 1, ws.course);                       // arched cap
    if (wp.shut) { px(g, wp.x - 2, wp.y, 1, wp.h, aw); px(g, wp.x + wpx + 1, wp.y, 1, wp.h, aw); }
    if (wp.box) { px(g, wp.x - 1, wp.y + wp.h + 1, wpx + 2, 1, PAL.G3); px(g, wp.x, wp.y + wp.h + 1, 1, 1, PAL.RD); }
    if (b.motif === 2) px(g, wp.x - 1, wp.y - 2, wpx + 2, 1, ws.course);        // stone lintels
    if (isLit) { px(g, wp.x, wp.y, 1, 1, PAL.L2); b.litPx.push({ lx: wp.x, ly: wp.y, w: wpx, h: wp.h }); }
    else b.win.push({ x: wp.x, y: wp.y, w: wpx, h: wp.h });
  });

  // ---- door + street-level dressing (face depends on orientation) ----
  {
    b.doorPx = null;
    if (doorFace === 'left') {
      const dx = Wx + 2, dBottom = lTop(dx + 1) + wallH;
      px(g, dx - 1, dBottom - 6, 5, 6, PAL.OUT);
      px(g, dx, dBottom - 5, 3, 5, style === 'boarded' ? PAL.WD1 : PAL.WD2);
      if (b.lit > 0 && style !== 'boarded') px(g, dx + 1, dBottom - 5, 1, 1, PAL.L1);
      if ((b.landmark || style === 'civic') && style !== 'boarded') px(g, dx - 1, dBottom - 7, 5, 1, AC); // grand lintel
      b.doorPx = { x: dx - 1, y: dBottom - 6, w: 5, h: 6 };  // local sprite coords of the door
    } else if (doorFace === 'right') {
      const dx = Sx + 2, dBottom = rTop(dx + 1) + wallH;
      px(g, dx - 1, dBottom - 6, 5, 6, PAL.OUT);
      px(g, dx, dBottom - 5, 3, 5, style === 'boarded' ? PAL.WD1 : PAL.WD2);
      if (b.lit > 0 && style !== 'boarded') px(g, dx + 1, dBottom - 5, 1, 1, PAL.L1);
      if ((b.landmark || style === 'civic') && style !== 'boarded') px(g, dx - 1, dBottom - 7, 5, 1, AC);
      b.doorPx = { x: dx - 1, y: dBottom - 6, w: 5, h: 6 };
    }
  }
  // seeded weathering patch: a repaired brick near the door. Always drawn for
  // vtweak > 0, on every style, so adjacent near-twins can always be told apart.
  if (b.vtweak) {
    const wxp = Wx + 1 + b.vtweak * 2;
    const wyp = lTop(wxp) + wallH - 3 - (b.vtweak & 1);
    px(g, wxp, wyp, 1, 2, ws.dd);
    px(g, wxp, wyp, 1, 1, ws.dk);
  }

  // ---- ground floor treatment (the district's street presence) ----
  if (gfCovers) {
    const x0 = Wx + HW, x1 = Sx - 1;
    switch (L.gf) {
      case 'terminal': {  // dark service band with glowing terminal screens
        for (let x = x0; x < x1; x++) { const bot = lTop(x) + wallH; px(g, x, bot - 5, 1, 5, PAL.TD); }
        for (let x = x0 + 1; x + 3 < x1; x += 6) {
          const bot = lTop(x) + wallH;
          px(g, x, bot - 4, 3, 2, PAL.TG); px(g, x, bot - 2, 3, 1, PAL.TG2);
        }
        break;
      }
      case 'lobby': {     // glass lobby band under a slab canopy
        for (let x = x0; x < x1; x++) {
          const bot = lTop(x) + wallH;
          px(g, x, bot - 5, 1, 5, ((x - x0) & 3) === 3 ? PAL.S2 : PAL.GL2);
          px(g, x, bot - 6, 1, 1, PAL.A1);
        }
        break;
      }
      case 'showcase': {  // wide display window + striped awning
        for (let x = x0; x < x1; x++) {
          const bot = lTop(x) + wallH;
          px(g, x, bot - 6, 1, 1, PAL.WH);
          px(g, x, bot - 5, 1, 4, ((x - x0) & 5) === 5 ? PAL.GL1 : PAL.GL2);
          px(g, x, bot - 1, 1, 1, PAL.WH);
        }
        for (let x = Wx + 1; x < Sx - 1; x++) {
          const ty2 = lTop(x) + wallH - SPX + 1;
          px(g, x, ty2, 1, 2, (((x - Wx) >> 1) & 1) ? aw : PAL.WH);
        }
        // hanging shop sign on the right face corner
        px(g, Sx + 1, rTop(Sx + 1) + wallH - SPX - 1, 4, 4, PAL.OUT);
        px(g, Sx + 2, rTop(Sx + 1) + wallH - SPX, 2, 2, aw);
        break;
      }
      case 'loading': {   // roller doors and hazard nicks
        for (let j = 1; j < fw; j++) {
          const dx0 = Wx + j * HW + 1;
          const bot = lTop(dx0 + 3) + wallH;
          px(g, dx0 - 1, bot - 6, 8, 6, PAL.OUT);
          for (let r = 0; r < 5; r++) px(g, dx0, bot - 5 + r, 6, 1, (r & 1) ? PAL.WD1 : PAL.WD2);
          px(g, dx0, bot - 6, 1, 1, PAL.YL); px(g, dx0 + 5, bot - 6, 1, 1, PAL.YL);
        }
        break;
      }
      case 'boathouse': { // blue arch door with a lifering on the wall
        if (fw >= 2) {
          const dx0 = Wx + HW + 1;
          const bot = lTop(dx0 + 3) + wallH;
          px(g, dx0 - 1, bot - 6, 8, 6, PAL.OUT);
          px(g, dx0, bot - 5, 6, 5, PAL.HB1);
          px(g, dx0 + 1, bot - 6, 4, 1, PAL.WH);
          px(g, dx0 + 2, bot - 4, 2, 3, PAL.HB2);
        }
        if (fw >= 3) {
          const lx2 = Wx + 2 * HW + 4, ly2 = lTop(lx2) + wallH - SPX + 2;
          px(g, lx2, ly2, 3, 3, PAL.WH); px(g, lx2 + 1, ly2 + 1, 1, 1, PAL.RD);
        }
        break;
      }
    }
  } else if (L.gf === 'arcade' && style !== 'kiosk' && style !== 'boarded') {
    // stone columns on both faces + entablature
    for (let x = Wx + 2; x < Sx - 1; x += 4) {
      const ty2 = lTop(x);
      px(g, x, ty2 + 1, 2, wallH - 1, PAL.C3);
      px(g, x + 1, ty2 + 1, 1, wallH - 1, PAL.C1);
    }
    for (let x = Wx; x < Sx; x++) px(g, x, lTop(x) + 1, 1, 1, PAL.C1);
  } else if (L.gf === 'vault' && style !== 'kiosk' && style !== 'boarded' && fw >= 2) {
    // brass plaque + tall archive doors beside the entrance
    const bxx = Wx + HW + 2, byy = lTop(bxx) + wallH;
    px(g, bxx - 1, byy - 6, 5, 6, PAL.OUT);
    px(g, bxx, byy - 5, 3, 5, PAL.WD1);
    px(g, bxx + 1, byy - 5, 1, 5, PAL.WD2);
    px(g, bxx + 4, byy - 4, 1, 1, PAL.YL);
  } else if (L.gf === 'workshop' && style !== 'kiosk' && style !== 'boarded' && fw >= 2) {
    // wide workshop door + a gear sign
    const dx0 = Wx + HW + 1, bot = lTop(dx0 + 2) + wallH;
    px(g, dx0 - 1, bot - 6, 7, 6, PAL.OUT);
    for (let r = 0; r < 5; r++) px(g, dx0, bot - 5 + r, 5, 1, (r & 1) ? PAL.WD1 : PAL.WD3);
    px(g, dx0 + 1, bot - 9, 3, 3, PAL.S3); px(g, dx0 + 2, bot - 8, 1, 1, PAL.OUT);
  }
  if (style === 'kiosk') { // kiosk awning
    for (let x = Wx + 1; x < Sx - 1; x++) {
      const ty2 = lTop(x) + wallH - SPX + 1;
      px(g, x, ty2, 1, 2, ((((x - Wx) >> 1) + arch) & 1) ? aw : PAL.WH);
    }
  }
  if (style === 'boarded') { // FOR-LEASE board
    const bx = Wx + Math.max(2, fw * HW - 8), byy = lTop(bx) + wallH - SPX;
    px(g, bx - 1, byy - 1, 8, 6, PAL.OUT);
    px(g, bx, byy, 6, 4, PAL.WH);
    px(g, bx + 1, byy + 1, 4, 1, PAL.RD);
    px(g, bx + 1, byy + 3, 3, 1, PAL.A2);
  }

  // ---- roof ----
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
  const NONE = 'rgba(0,0,0,0)';
  const edge = (yr) => (yr < 2 || yr >= roofD - 2);
  const rc = L.roof;
  const rcx = Tx + (fw - fd) * HW / 2, rcy = Ty + roofD / 2;   // roof centre
  switch (roofKind) {
    case 'parapet': case 'ducts': case 'dish': case 'mastR': case 'tank': case 'terraceR': case 'hoist': {
      fillRoof((yr) => edge(yr) ? rc[1] : rc[0]);
      break;
    }
    case 'vents': fillRoof((yr) => edge(yr) ? ws.dd : rc[0]); break;
    case 'tile': fillRoof((yr) => (yr & 3) < 2 ? rc[0] : rc[1]); break;
    case 'tile2': {
      fillRoof((yr) => (yr & 3) < 2 ? rc[0] : rc[1]);
      fillRoof((yr) => yr >= roofD - 2 ? PAL.B4 : NONE);     // sunlit eave
      break;
    }
    case 'ridge': case 'blueridge': {
      const lo = roofKind === 'ridge' ? rc : [PAL.HB2, PAL.HB1];
      const crest = roofKind === 'ridge' ? PAL.B4 : PAL.WH;
      fillRoof((yr) => (yr & 3) < 2 ? lo[0] : lo[1]);
      fillRoof((yr) => Math.abs(yr - fw * HH) <= 1 ? crest : NONE);
      px(g, Tx - 2, Ty - 2, 5, 3, lo[0]);                    // crest cap breaking the skyline
      px(g, Tx - 2, Ty - 2, 5, 1, crest);
      break;
    }
    case 'skylight': {
      fillRoof((yr) => (yr & 3) < 2 ? rc[0] : rc[1]);
      fillRoof((yr) => Math.abs(yr - roofD / 2) < 2 ? PAL.GL2 : NONE);
      fillRoof((yr) => Math.abs(yr - roofD / 2) < 2 && (yr & 1) ? PAL.GL1 : NONE);
      px(g, Tx - 1, Ty - 2, 3, 2, rc[0]);                    // ridge vent stub
      break;
    }
    case 'stone': case 'stoneBanner': {
      fillRoof((yr) => (yr & 3) < 2 ? PAL.C2 : PAL.C1);
      if (roofKind === 'stoneBanner') {
        for (let x = Wx + 1; x < Sx - 1; x++) px(g, x, lTop(x) + 2, 1, 2, AC);   // civic banner course
        for (let x = Wx + 3; x < Sx - 2; x += 5) px(g, x, lTop(x) + 4, 1, 1, AC);
      }
      break;
    }
    case 'copper': case 'copperEdge': {
      fillRoof((yr) => (yr & 3) < 2 ? rc[0] : rc[1]);
      fillRoof((yr) => edge(yr) ? PAL.W1 : NONE);            // patinated cornice
      if (roofKind === 'copperEdge') {
        px(g, rcx, rcy - 6, 1, 4, PAL.CU1);                  // finial
        px(g, rcx - 1, rcy - 7, 3, 1, PAL.YL);
      }
      break;
    }
    case 'saw': {
      const sawDark = b.lang === 'glass' || b.lang === 'tech' ? PAL.S2 : rc[1];
      const sawLite = b.lang === 'glass' || b.lang === 'tech' ? PAL.S1 : rc[0];
      fillRoof((yr) => ((yr >> 1) & 1) ? sawDark : PAL.GL2);
      for (let t2 = 0; t2 < fw * 2; t2++) {                  // sawtooth teeth along the T-E edge
        const bx = Tx + t2 * 4 + 1, byy = Ty + t2 * 2 - 2;
        px(g, bx, byy, 3, 2, sawDark); px(g, bx, byy - 1, 2, 1, sawLite);
      }
      px(g, Tx - 3, Ty + 1, 2, 5, PAL.B2); px(g, Tx - 3, Ty, 2, 1, PAL.B1);
      b.chimney = { lx: Tx - 2, ly: Ty - 1 };
      break;
    }
    case 'gableChim': {
      fillRoof((yr) => (yr & 3) < 2 ? rc[0] : rc[1]);
      fillRoof((yr) => Math.abs(yr - fw * HH) <= 1 ? PAL.WD3 : NONE);
      px(g, Tx - 2, Ty - 2, 4, 2, rc[0]);
      px(g, Ex - 4, Ey - 2, 2, 4, PAL.B2); px(g, Ex - 4, Ey - 3, 2, 1, PAL.B1);
      b.chimney = { lx: Ex - 3, ly: Ey - 4 };
      break;
    }
    case 'bluetile': case 'pennant': {
      fillRoof((yr) => (yr & 3) < 2 ? rc[0] : rc[1]);
      fillRoof((yr) => yr >= roofD - 2 ? PAL.WH : NONE);     // whitewashed eave
      if (roofKind === 'pennant') {
        px(g, Tx, Ty - 8, 1, 9, PAL.WD1);
        px(g, Tx + 1, Ty - 8, 3, 2, PAL.RD);
        px(g, Tx + 1, Ty - 6, 2, 1, PAL.WH);
      }
      break;
    }
    case 'board': fillRoof((yr) => (((yr >> 1) + arch) & 1) ? PAL.WD2 : PAL.WD1); break;
    case 'kioskR': fillRoof((yr) => ((((yr >> 1) + arch) & 1)) ? aw : PAL.WH); break;
    case 'dome': {
      fillRoof((yr) => (yr & 3) < 2 ? PAL.C2 : PAL.C1);
      const cx2 = rcx, cy2 = rcy;
      const r = Math.min(fw, fd) * HH + 3;
      for (let dy = -r; dy <= 0; dy++) {
        const half = Math.floor(Math.sqrt(r * r - dy * dy));
        px(g, cx2 - half, cy2 + dy, half + 1, 1, PAL.C3);
        px(g, cx2, cy2 + dy, half, 1, PAL.C2);
        if (((dy + cy2) & 1) === 0) px(g, cx2 + (half >> 1), cy2 + dy, Math.max(1, half >> 1), 1, PAL.C1);
      }
      px(g, cx2, cy2 - r - 2, 1, 2, PAL.YL);
      break;
    }
  }
  // roof furniture riding on the flat kinds
  if (roofKind === 'parapet' || roofKind === 'tank' || roofKind === 'terraceR') {   // AC units
    const nAC = 1 + (fw + fd > 3 ? 1 : 0);
    for (let a = 0; a < nAC; a++) {
      const ax = Sx - 4 + (a ? -6 : 2), ay = Ty + roofD / 2 - 4 + a * 3;
      px(g, ax, ay - 2, 5, 4, PAL.S3); px(g, ax, ay + 1, 5, 1, PAL.S1);
      px(g, ax + 1, ay - 1, 3, 1, PAL.S1);
    }
  }
  if (roofKind === 'ducts') {   // stepped duct runs following the roof slope
    for (let t2 = 0; t2 < fw * 2 - 1; t2++) {
      const bx = Tx + t2 * 4 - 2, byy = Ty + t2 * 2 + 3;
      if (byy - Ty < roofD - 3) { px(g, bx, byy, 5, 2, PAL.S3); px(g, bx, byy, 5, 1, PAL.S2); }
    }
    px(g, Tx - 5, Ty + 2, 3, 3, PAL.S1);
    px(g, Tx - 5, Ty + 1, 3, 1, PAL.S3);
  }
  if (roofKind === 'dish') {
    px(g, rcx - 1, rcy - 2, 2, 4, PAL.S1);
    px(g, rcx - 3, rcy - 6, 6, 3, PAL.C3);
    px(g, rcx - 3, rcy - 4, 6, 1, PAL.C1);
    px(g, rcx + 2, rcy - 7, 1, 1, PAL.TG);
  }
  if (roofKind === 'mastR') {
    px(g, Tx - 1, Ty - 3, 3, 1, PAL.S2);
    px(g, Tx, Ty - 6, 1, 7, PAL.S1);
    px(g, Tx, Ty - 7, 1, 1, PAL.RD);
    px(g, Ex - 5, Ey - 3, 1, 4, PAL.S1);
    px(g, Ex - 5, Ey - 4, 1, 1, PAL.TG);
  }
  if (roofKind === 'tank') {
    const cxx = Tx - 2, cy2 = Ty + 2;
    px(g, cxx, cy2 - 4, 4, 5, PAL.WD2); px(g, cxx, cy2 - 5, 4, 1, PAL.WD1);
    px(g, cxx + 1, cy2 + 1, 1, 2, PAL.WD1);
  }
  if (roofKind === 'terraceR') {
    const gy = Ty + fd * HH + 1, gx = Tx - fd * HW + 3;
    px(g, gx, gy + 1, 6, 2, PAL.WD2);
    px(g, gx, gy, 6, 1, PAL.G2);
    px(g, gx + 1, gy - 1, 2, 1, PAL.G3); px(g, gx + 4, gy - 1, 1, 1, PAL.G3);
  }
  if (roofKind === 'hoist') {
    px(g, Ex - 10, Ey - 2, 10, 2, PAL.A1);
    px(g, Ex - 2, Ey, 1, 5, PAL.A1);
    px(g, Ex - 3, Ey + 5, 3, 2, PAL.RD);
  }
  // civic flag point (heavily cited pages fly a flag when there is no dome/spire)
  b.flagPt = (style === 'civic' && !b.dome && !b.landmark && roofKind !== 'saw') ? { lx: Tx, ly: Ty - 1 } : null;

  // ---- corner pieces: quoin chain down the street corner seam ----
  if (b.corner && style !== 'kiosk' && style !== 'boarded') {
    let step = 0;
    for (let yy = Sy + 1; yy < Sy + wallH - 1; yy += 3) {
      px(g, Sx - 1, yy, 2, 2, (step++ & 1) ? ws.dd : ws.lt);
    }
    px(g, Sx - 1, Sy, 2, 1, AC);
  }
  // ---- hub landmark: accent cornice ribbon + rooftop spire ----
  if (b.landmark && style !== 'boarded') {
    for (let x = Wx; x < Sx; x++) px(g, x, lTop(x), 1, 1, AC);
    if (!b.sign && !b.dome) {
      px(g, Tx, Ty - 10, 1, 10, PAL.A1);
      px(g, Tx + 1, Ty - 10, 4, 3, AC);
      px(g, Tx + 1, Ty - 7, 2, 1, PAL.WH);
    }
  }

  // ---- motif crowns: extra rooftop furniture so skylines vary inside a district ----
  if (b.motif === 1 && !b.sign && !b.dome && !b.landmark && fw + fd >= 3 &&
      ['tile', 'tile2', 'stone', 'copper', 'bluetile', 'board'].includes(roofKind)) {
    px(g, Tx - 3, Ty - 3, 7, 6, PAL.OUT);            // stair bulkhead breaking the roof line
    px(g, Tx - 2, Ty - 2, 5, 4, ws.lt);
    px(g, Tx - 2, Ty - 2, 5, 1, ws.dk);
    px(g, Tx, Ty, 1, 2, PAL.DW);
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

/* window slot shapes per language kind + archetype rhythm */
function pushWin(winPos, kind, arch, x, y, f) {
  switch (kind) {
    case 'panel':
      if (arch === 1) winPos.push({ x: x - 1, y, f, w: 5, h: 2 });                  // window band
      else if (arch === 2) winPos.push({ x, y: y - 1, f, w: 2, h: 4 });             // tall panel
      else winPos.push({ x, y, f, w: 3, h: 3 });                                    // server-room square
      break;
    case 'shutter':
      if (arch === 2) { winPos.push({ x: x - 1, y, f, w: 2, h: 3 }); winPos.push({ x: x + 3, y: y + 2, f, w: 2, h: 3 }); }
      else winPos.push({ x, y, f, w: 2, h: 3, shut: arch === 0 ? 1 : 0 });
      break;
    case 'slit':
      winPos.push({ x, y: y - 1, f, w: 1, h: 2 });
      winPos.push({ x: x + 3, y: y + 1 - 1, f, w: 1, h: 2 });
      break;
    case 'arch':
      winPos.push({ x, y, f, w: 2, h: 4, cap: 1 });
      break;
    case 'tall':
      winPos.push({ x, y, f, w: 1, h: SPX - 2 });
      winPos.push({ x: x + 3, y: y + 2, f, w: 1, h: SPX - 2 });
      break;
    case 'square':
      winPos.push({ x, y: y + (arch === 1 ? 1 : 0), f, w: 3, h: 2 });
      break;
    case 'cottage':
      winPos.push({ x, y, f, w: 2, h: 2, fr: PAL.HB1, box: arch === 0 ? 1 : 0 });
      break;
    case 'grid':
      winPos.push({ x, y, f, w: 2, h: 4 });
      break;
    default:
      winPos.push({ x, y, f, w: 2, h: 3 });
  }
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
  // --- district-themed street furniture (round 4) ---
  bakeSprite('serverbox', 8, 11, (g) => {   // sidewalk server cabinet, LEDs blinking frozen mid-thought
    px(g, 1, 1, 6, 9, PAL.TD); px(g, 1, 1, 6, 1, PAL.S2); px(g, 1, 1, 1, 9, PAL.S2);
    px(g, 5, 3, 1, 1, PAL.TG); px(g, 5, 5, 1, 1, PAL.TG2); px(g, 5, 7, 1, 1, PAL.TG);
    px(g, 2, 3, 2, 1, PAL.S1); px(g, 2, 5, 2, 1, PAL.S1); px(g, 2, 7, 2, 1, PAL.S1);
  });
  bakeSprite('duct', 10, 8, (g) => {        // ground duct box with an elbow pipe
    px(g, 1, 3, 6, 4, PAL.A2); px(g, 1, 3, 6, 1, PAL.A3);
    px(g, 2, 5, 1, 1, PAL.A1); px(g, 4, 5, 1, 1, PAL.A1);
    px(g, 7, 2, 2, 5, PAL.S3); px(g, 7, 1, 3, 2, PAL.S2);
  });
  bakeSprite('planter', 9, 8, (g) => {      // stone planter with a clipped shrub
    px(g, 1, 5, 7, 2, PAL.P2); px(g, 1, 7, 7, 1, PAL.P1);
    px(g, 2, 2, 5, 3, PAL.G2); px(g, 3, 1, 3, 1, PAL.G3);
    px(g, 3, 3, 1, 1, PAL.RD); px(g, 5, 2, 1, 1, PAL.YL);
  });
  bakeSprite('aboard', 7, 9, (g) => {       // sandwich board out on the pavement
    px(g, 1, 1, 5, 6, PAL.WH); px(g, 1, 1, 5, 1, PAL.RD);
    px(g, 2, 3, 3, 1, PAL.A2); px(g, 2, 5, 2, 1, PAL.A2);
    px(g, 0, 7, 2, 1, PAL.WD1); px(g, 5, 7, 2, 1, PAL.WD1);
  });
  bakeSprite('crate', 8, 7, (g) => {        // wooden shipping crate
    px(g, 1, 1, 6, 5, PAL.WD2); px(g, 1, 1, 6, 1, PAL.WD3);
    px(g, 1, 3, 6, 1, PAL.WD1); px(g, 3, 1, 1, 5, PAL.WD1);
  });
  bakeSprite('crates', 12, 12, (g) => {     // a stack waiting on the dock
    px(g, 1, 6, 6, 5, PAL.WD2); px(g, 1, 6, 6, 1, PAL.WD3); px(g, 3, 6, 1, 5, PAL.WD1);
    px(g, 6, 7, 5, 4, PAL.WD3); px(g, 6, 7, 5, 1, PAL.WD2); px(g, 8, 7, 1, 4, PAL.WD1);
    px(g, 3, 1, 6, 5, PAL.WD2); px(g, 3, 1, 6, 1, PAL.WD3); px(g, 5, 1, 1, 5, PAL.WD1);
  });
  bakeSprite('barrel', 6, 8, (g) => {       // workshop barrel
    px(g, 1, 1, 4, 6, PAL.WD2); px(g, 1, 2, 4, 1, PAL.A1); px(g, 1, 5, 4, 1, PAL.A1);
    px(g, 2, 1, 1, 6, PAL.WD3);
  });
  bakeSprite('noticeboard', 10, 11, (g) => { // public notice board
    px(g, 1, 1, 8, 6, PAL.WD2); px(g, 2, 2, 6, 4, PAL.C3);
    px(g, 3, 3, 2, 2, PAL.WH); px(g, 6, 3, 1, 2, PAL.YL);
    px(g, 2, 7, 1, 3, PAL.WD1); px(g, 7, 7, 1, 3, PAL.WD1);
  });
  bakeSprite('lifebuoy', 6, 10, (g) => {    // lifering on a harbour post
    px(g, 2, 3, 1, 6, PAL.WD1);
    px(g, 1, 1, 4, 4, PAL.WH); px(g, 2, 2, 2, 2, PAL.HB1);
    px(g, 1, 1, 1, 1, PAL.RD); px(g, 4, 4, 1, 1, PAL.RD); px(g, 4, 1, 1, 1, PAL.RD); px(g, 1, 4, 1, 1, PAL.RD);
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
  for (const nm of ['lamp', 'bench', 'hydrant', 'stall', 'kioskstand', 'lease', 'crane',
                    'serverbox', 'duct', 'planter', 'aboard', 'crate', 'crates', 'barrel',
                    'noticeboard', 'lifebuoy']) {
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
  /* the courier waves at the camera: 3 warm south-facing frames */
  for (let wf = 0; wf < 3; wf++) {
    bakeSprite(`plr_wave_${wf}`, 13, 15, (g) => {
      px(g, 4, 10, 1, 4, LEG); px(g, 6, 10, 1, 4, LEG);
      px(g, 4, 13, 1, 1, LEG); px(g, 6, 13, 1, 1, LEG);
      px(g, 3, 6, 5, 4, COAT);
      px(g, 7, 6, 1, 4, COATD);
      px(g, 2, 6, 1, 3, COATD);                 // left arm relaxed
      // right arm raised, hand swinging through three positions
      px(g, 8, 4, 1, 3, COATD);                 // upper arm up
      const hx = wf === 0 ? 9 : wf === 1 ? 10 : 11;
      const hy = wf === 1 ? 1 : 2;
      px(g, Math.min(hx, 11), hy + 1, 1, 1, COATD);
      px(g, Math.min(hx, 11), hy, 1, 1, SKN);   // the waving hand
      px(g, 4, 1, 3, 1, IND);
      px(g, 3, 2, 5, 1, IND);
      px(g, 4, 3, 3, 2, SKN);
      px(g, 4, 4, 1, 1, EYE); px(g, 6, 4, 1, 1, EYE);
      px(g, 3, 5, 5, 1, IND);                   // scarf
      px(g, 3, 7, 3, 3, BAG);
      px(g, 3, 7, 3, 1, BAGD);
      px(g, 4, 8, 1, 1, GLOW);
    });
  }
  /* teleport sparkle columns (two twinkle frames, violet + white) */
  for (let f2 = 0; f2 < 2; f2++) {
    bakeSprite('tpspark' + f2, 13, 18, (g) => {
      for (let i = 0; i < 26; i++) {
        const hx = h32(i, f2, 61) % 13, hy = h32(i, f2, 62) % 18;
        if ((hx + hy + f2) % 3 === 0) continue;
        px(g, hx, hy, 1, 1, (h32(i, f2, 63) % 3) ? PAL.V2 : PAL.WH);
      }
    }, true);
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
  let mh = 2166136261 >>> 0;                       // FNV-1a over the slug: stable per-page choices
  for (let i = 0; i < slug.length; i++) { mh ^= slug.charCodeAt(i); mh = Math.imul(mh, 16777619) >>> 0; }
  let s = 1 + Math.round(q * 8);
  let fw = q < 0.35 ? 1 : q < 0.78 ? 2 : 3;
  let fd = fw;
  if (fw > 1 && ((mh >>> 12) % 100) < 45) fd = fw - 1;

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

  return {
    slug, fw, fd, s, style,
    motif: mh % 3,
    wallIdx: (mh >>> 4) % 3,
    awnIdx: (mh >>> 8) % 3,
    arch: (mh >>> 16) % 3,        // reseeded from the lot position once placed
    vtweak: 0,                    // facade weathering patch: the tiebreaker of last resort
    lang: 'lane',                 // overwritten with the quarter's language
    corner: false, landmark: false,
    words, code, inb,
    lit: code,
    dome: style === 'civic' && inb >= 20,
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

  // architectural language + a unique display label per community
  const usedLabels = new Set();
  commList.forEach(c => {
    c.lang = classifyLang(c);
    const hp = pagesBySlug[c.hub];
    const clean = (t) => {
      let l = String(t || '').replace(/\s*[-|]\s*Strapi.*$/i, '').trim();
      if (l.length > 26) l = l.slice(0, 26).replace(/\s+\S*$/, '');
      return l;
    };
    const cands = c.backlane ? ['Back lane'] : [
      c.name !== 'More pages' ? c.name : null,
      hp && hp.sidebarLabel, hp && hp.title,
      c.hub.split('/').pop().replace(/-/g, ' ')
    ].filter(Boolean).map(clean).filter(l => l.length > 1);
    let final = cands.find(l => !usedLabels.has(l.toLowerCase())) || cands[0] || 'District';
    const base = final, suffixes = [' II', ' III', ' IV', ' V', ' VI', ' VII', ' VIII'];
    for (let k = 0; usedLabels.has(final.toLowerCase()) && k < suffixes.length; k++) final = base + suffixes[k];
    usedLabels.add(final.toLowerCase());
    c.label = final;
  });

  // building specs
  const specBySlug = {};
  const orderIdx = {};
  ORDER.forEach((s, i) => orderIdx[s] = i);
  const commOf = {};
  commList.forEach(c => c.members.forEach(m => commOf[m] = c.id));
  for (const s of Object.keys(pagesBySlug)) {
    const spec = buildingSpecFor(s, pagesBySlug[s]);
    if (HUBNAMES[s] && hubs.includes(s)) spec.sign = HUBNAMES[s];
    else if (hubs.includes(s)) spec.sign = s.split('/').pop().slice(0, 7).toUpperCase().replace(/[^A-Z0-9 -]/g, '');
    spec.lang = commList[commOf[s]] ? commList[commOf[s]].lang : 'lane';
    specBySlug[s] = spec;
  }

  // community adjacency weights (for placement chaining)
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
          id: cid, name: c.name, label: c.label, lang: c.lang, hub: c.hub, members: c.members, backlane: !!c.backlane,
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

  // ---- archetypes, corner pieces, hub landmarks + the no-identical-neighbours rule ----
  for (const q of quarters) {
    if (!q.lots.length) continue;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const lot of q.lots) {
      minX = Math.min(minX, lot.gx); maxX = Math.max(maxX, lot.gx + lot.sp.fw);
      minY = Math.min(minY, lot.gy); maxY = Math.max(maxY, lot.gy + lot.sp.fd);
    }
    for (const lot of q.lots) {
      const sp = lot.sp;
      sp.lang = q.lang;
      sp.arch = h32(lot.gx, lot.gy, 7) % 3;                     // seeded facade archetype per lot
      sp.corner = (lot.gx === minX || lot.gx + sp.fw === maxX) &&
                  (lot.gy === minY || lot.gy + sp.fd === maxY); // block corners get quoin chains
      sp.landmark = sp.slug === q.hub;                          // the district hub is a landmark
    }
    // no two adjacent buildings may render identical. The loose signature drives
    // variety bumps; the strict one contains only fields that ALWAYS reach pixels
    // (walls, size, weathering patch), so strict-distinct guarantees pixel-distinct.
    const sigStrict = (sp) => [sp.lang, sp.style, sp.fw, sp.fd, sp.s, sp.wallIdx, sp.vtweak,
                               sp.sign || '', sp.dome ? 1 : 0].join('|');
    const sig = (sp) => sigStrict(sp) + '|' + [sp.arch, sp.motif, sp.awnIdx,
                        sp.corner ? 1 : 0, sp.landmark ? 1 : 0, sp.lit].join('|');
    const adj = (a, b2) => !(a.gx + a.sp.fw + 1 < b2.gx || b2.gx + b2.sp.fw + 1 < a.gx ||
                             a.gy + a.sp.fd + 1 < b2.gy || b2.gy + b2.sp.fd + 1 < a.gy);
    for (let pass = 0; pass < 4; pass++) {
      let changed = false;
      for (let i = 0; i < q.lots.length; i++) {
        for (let j = 0; j < i; j++) {
          if (!adj(q.lots[i], q.lots[j])) continue;
          const sp = q.lots[i].sp, so = q.lots[j].sp;
          let guard = 0;
          while (sig(sp) === sig(so) && guard < 8) {
            guard++; changed = true;
            sp.arch = (sp.arch + 1) % 3;
            if (guard === 3) sp.awnIdx = (sp.awnIdx + 1) % 3;
            if (guard === 5) sp.wallIdx = (sp.wallIdx + 1) % 3;
            if (guard === 7) sp.motif = (sp.motif + 1) % 3;
          }
          let g2 = 0;
          while (sigStrict(sp) === sigStrict(so) && g2 < 4) {   // pixel-guaranteed tiebreak
            g2++; changed = true;
            sp.vtweak = (sp.vtweak + 1) % 4;
          }
        }
      }
      if (!changed) break;
    }
  }

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
/* ---- orientation-aware projection -------------------------------------
   The world model never rotates; the VIEW does. World coords (x, y) map to
   view coords (u, v) by a quarter-turn permutation, then project 2:1. */
const vU = (x, y) => orient === 0 ? x : orient === 1 ? y : orient === 2 ? Wt - x : Ht - y;
const vV = (x, y) => orient === 0 ? y : orient === 1 ? Wt - x : orient === 2 ? Ht - y : x;
const isoX = (x, y) => OX + (vU(x, y) - vV(x, y)) * HW;
const isoY = (x, y) => OY + (vU(x, y) + vV(x, y)) * HH;
const depthOf = (x, y) => vU(x, y) + vV(x, y);
const depthTile = (tx, ty, dz) => depthOf(tx + 0.5, ty + 0.5) - 1 + dz;
/* integer tile index -> its view diamond's TOP corner in world px */
function tIso(tx, ty) {
  const u = orient === 0 ? tx : orient === 1 ? ty : orient === 2 ? Wt - 1 - tx : Ht - 1 - ty;
  const v = orient === 0 ? ty : orient === 1 ? Wt - 1 - tx : orient === 2 ? Ht - 1 - ty : tx;
  return [OX + HW * (u - v), OY + HH * (u + v)];
}
/* view world-px -> world coords (inverse of isoX/isoY) */
function pxToWorld(wx, wy) {
  const u = ((wx - OX) / HW + (wy - OY) / HH) / 2;
  const v = ((wy - OY) / HH - (wx - OX) / HW) / 2;
  switch (orient) { case 0: return [u, v]; case 1: return [Wt - v, u]; case 2: return [Wt - u, Ht - v]; default: return [v, Ht - u]; }
}
/* a screen-relative direction (view axes) -> world axes, and back */
function viewDirToWorld(sx, sy) {
  switch (orient) { case 0: return [sx, sy]; case 1: return [-sy, sx]; case 2: return [-sx, -sy]; default: return [sy, -sx]; }
}
function worldDirToView(dx, dy) {
  switch (orient) { case 0: return [dx, dy]; case 1: return [dy, -dx]; case 2: return [-dx, -dy]; default: return [-dy, dx]; }
}
/* a world-tile rect -> its view-space rect {x, y, w, h} */
function viewRectOf(tx, ty, fw, fd) {
  switch (orient) {
    case 0: return { x: tx, y: ty, w: fw, h: fd };
    case 1: return { x: ty, y: Wt - tx - fw, w: fd, h: fw };
    case 2: return { x: Wt - tx - fw, y: Ht - ty - fd, w: fw, h: fd };
    default: return { x: Ht - ty - fd, y: tx, w: fd, h: fw };
  }
}

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
    const [cx, cy] = tIso(tx, ty);
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
  for (let s = 0; s < 4; s++) ensureGround(s);
  groundCv = groundSets[season].day;
}
/* (re)bake one season's ground keyframes if they are stale for this orientation */
function ensureGround(s) {
  if (groundStamp[s] === orient && groundSets[s]) return;
  const day = bakeGroundFor(s);
  groundSets[s] = { day, gold: tintLayer(day, '#ffbe7e'), night: tintLayer(day, '#6d76a8') };
  groundStamp[s] = orient;
}

function bakeGroundFor(seasonIdx) {
  const [gc, gg] = mkCv(worldW, worldH);
  const sg = SEASON_GROUND[seasonIdx];
  const G = (x, yy) => yy * Wt + x;

  for (let ty = 0; ty < Ht; ty++) for (let tx = 0; tx < Wt; tx++) {
    const t2 = grid[G(tx, ty)];
    const [cx, cy] = tIso(tx, ty);
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
          if (orient % 2 === 0 ? hdir[G(tx, ty)] : !hdir[G(tx, ty)]) {
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
  /* boot-time PLACEMENT: decides what exists on which tile. Projection into
     view space (world px + depth) happens in projectStatics(), so the whole
     town can re-project when the map rotates. */
  statics = [];
  buildings = [];
  propList = [];
  const G = (x, yy) => yy * Wt + x;
  let catBudget = [];

  for (const q of quarters) {
    for (const lot of q.lots) {
      const sp = lot.sp;
      const b = { ...sp, quarter: q, tx: lot.gx, ty: lot.gy, cv: null, pick: null };
      b.varCache = {}; b.queued = 0; b.fadeA = 1;
      const sr = h32(lot.gx, lot.gy, 91) / 4294967296, sr2 = h32(lot.gx, lot.gy, 92) / 4294967296;
      b.on1 = 0.12 + 0.5 * sr;                       // seeded dusk thresholds: windows come on
      b.on2 = Math.min(0.97, b.on1 + 0.22 + 0.25 * sr2); // building by building, never all at once
      b.twkPh = [rint(9), rint(9)];
      const door = {
        slug: sp.slug, b,
        px: lot.gx + 0.3, py: lot.gy + sp.fd + 0.45,   // approach point in tile space
        wx: 0, wy: 0                                    // world px filled per orientation
      };
      b.doorRef = door;
      doors.push(door);
      doorTiles.add(lot.gx + ',' + (lot.gy + sp.fd));
      buildings.push(b);
      if (sp.style === 'boarded') {
        catBudget.push(b);
        // estate agent's placard out front -- only every few shopfronts, or a
        // dying block turns into a wall of boards
        if (catBudget.length % 4 === 1) {
          const lx = lot.gx + sp.fw - 0.3, ly = lot.gy + sp.fd + 0.35;
          const ptx = Math.floor(lx), pty = Math.floor(ly);
          if (!doorTiles.has(ptx + ',' + pty)) {
            propList.push({ kind: 'lease', lx, ly, tx: ptx, ty: pty });
            propSolid.add(ptx + ',' + pty);
          }
        }
      }
    }
  }

  // cats in front of some boarded shopfronts (at least one)
  catBudget.forEach((b, i) => {
    if (i % 7 === 0) cats.push({ tx: b.tx + 0.5, ty: b.ty + b.fd + 0.2, ph: rng() * 4 });
  });

  // props on quarter rings, banks, plazas, parks
  const SOLID_PROPS = new Set(['lamp', 'tree', 'bench', 'hydrant', 'stall', 'kioskstand', 'crane', 'lease',
                               'serverbox', 'duct', 'planter', 'aboard', 'crate', 'crates', 'barrel',
                               'noticeboard', 'lifebuoy']);
  const lotAt = (x, yy) => tileAt(x, yy) === T.LOT;
  const addProp = (name, tx, ty, dz = 0.3, dx = 0, dy = 0) => {
    if (doorTiles.has(tx + ',' + ty)) return;   // keep every door approachable
    // breathing room: a solid prop may never plug a one-tile lane between lots
    if (SOLID_PROPS.has(name) &&
        ((lotAt(tx - 1, ty) && lotAt(tx + 1, ty)) || (lotAt(tx, ty - 1) && lotAt(tx, ty + 1)))) return;
    propList.push({ kind: 'prop', name, tx, ty, dz, dx, dy });
    if (SOLID_PROPS.has(name)) propSolid.add(tx + ',' + ty);
  };
  // a dog sits by some benches; a park fountain plays three spray frames
  const maybeDog = (tx, ty) => {
    if (dogs.length < 14 && h32(tx, ty, 6) % 4 === 0) dogs.push({ tx: tx + 0.85, ty: ty + 0.75, ph: rng() * 5 });
  };
  const addFount = (tx, ty) => {
    if (doorTiles.has(tx + ',' + ty)) return;
    if ((lotAt(tx - 1, ty) && lotAt(tx + 1, ty)) || (lotAt(tx, ty - 1) && lotAt(tx, ty + 1))) return;
    propList.push({ kind: 'fount', tx, ty });
    propSolid.add(tx + ',' + ty);
  };

  for (const q of quarters) {
    const themed = (LANGS[q.lang] || LANGS.lane).props;
    const hasStalls = (LANGS[q.lang] || LANGS.lane).stall;
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
      else if (i % 13 === 5) addProp(themed[0], tx, ty);        // the district's own street kit
      else if (i % 11 === 7) { addProp('bench', tx, ty); maybeDog(tx, ty); }
      else if (i % 17 === 9) addProp(themed[1], tx, ty);
    });
    // interior plazas: stalls & benches & pigeon spawns
    let stallCount = 0;
    for (let yy = 1; yy < q.qh - 1; yy++) for (let xx = 1; xx < q.qw - 1; xx++) {
      const tx = q.qx + xx, ty = q.qy + yy;
      const t2 = grid[G(tx, ty)];
      if (t2 === T.PLAZA) {
        const h2 = h32(tx, ty, 1) % 17;
        if (h2 === 0 && stallCount < 3) {
          if (hasStalls) {
            addProp('stall', tx, ty); stallCount++;
            // a short queue forms at the stall counter
            const nQ = 2 + h32(tx, ty, 8) % 2;
            for (let k = 0; k < nQ; k++) {
              queuers.push({ x: tx + 0.35, y: ty + 1.05 + k * 0.55, theme: (q.themeIdx + k) % THEMES.length, ph: rng() * 10 });
            }
          } else { addProp(themed[1], tx, ty); stallCount++; }
        }
        else if (h2 === 4) { addProp('bench', tx, ty); maybeDog(tx, ty); }
        else if (h2 === 8) addProp(themed[0], tx, ty);
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
          propList.push({ kind: 'laundry', tx, ty });
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
  // seeded puddle points for rain showers (streets and paving only)
  puddlePts = [];
  for (let ty = 0; ty < Ht; ty++) for (let tx = 0; tx < Wt; tx++) {
    const t2 = grid[G(tx, ty)];
    if ((t2 === T.ROAD || t2 === T.PAVE || t2 === T.PLAZA || t2 === T.BANK) && h32(tx, ty, 23) % 17 === 0) {
      puddlePts.push({ tx: tx + 0.2 + (h32(tx, ty, 24) % 6) / 10, ty: ty + 0.2 + (h32(tx, ty, 25) % 6) / 10, ph: h32(tx, ty, 26) % 7 });
    }
  }
}

/* bake (or re-bake) one building for the current orientation and refresh its
   world-px anchors. bakeBuilding() reads orient itself: odd turns swap the
   footprint and the door moves to the face that stays visible. */
function bakeOriented(b) {
  const baked = bakeBuilding(b);
  b.cv = baked.cv;
  const r = viewRectOf(b.tx, b.ty, b.fw, b.fd);
  b.vx = r.x; b.vy = r.y; b.vfw = r.w; b.vfd = r.h;
  const gTopX = OX + (r.x - r.y) * HW, gTopY = OY + (r.x + r.y) * HH;
  const wallH2 = b.style === 'kiosk' ? 8 : b.s * SPX;
  const localTy = b.cv.height - 2 - wallH2 - (r.w + r.h) * HH;
  b.wx = gTopX - baked.ox;
  b.wy = (gTopY - wallH2) - localTy;
  b.depth = (r.x + r.w - 1) + (r.y + r.h - 1) + 0.6;
  b.varCache = {}; b.queued = 0;
  // window light-up order, reshuffled deterministically per lot
  b.winOrder = (b.win || []).map((_, i2) => i2);
  for (let i2 = b.winOrder.length - 1; i2 > 0; i2--) {
    const j2 = h32(b.tx * 7 + i2, b.ty, 93) % (i2 + 1);
    [b.winOrder[i2], b.winOrder[j2]] = [b.winOrder[j2], b.winOrder[i2]];
  }
  b.twk = (b.litPx || []).slice(0, 2).map((p, i2) => ({ x: b.wx + p.lx, y: b.wy + p.ly, w: p.w, h: p.h, ph: b.twkPh[i2] }));
  const d = b.doorRef;
  if (d) {
    if (b.doorPx) { d.wx = b.wx + b.doorPx.x + 2; d.wy = b.wy + b.doorPx.y + 3; }
    else { d.wx = Math.round(isoX(d.px, d.py)); d.wy = Math.round(isoY(d.px, d.py)) - 4; } // door faces away: glow at its ground spot
  }
  return gTopY;
}

/* PROJECTION: build the statics array (buildings + props) for the current
   orientation. Runs at boot and again after every quarter-turn. */
function projectStatics() {
  statics = [];
  hlCache.clear();
  for (const q of quarters) q.topH = 0;
  for (const b of buildings) {
    const gTopY = bakeOriented(b);
    statics.push({ cv: b.cv, wx: b.wx, wy: b.wy, depth: b.depth, b });
    b.quarter.topH = Math.max(b.quarter.topH || 0, gTopY - b.wy + 6);
    // chimney smoke + civic flags follow their building across orientations
    if (b.chimney) {
      if (!b.smoke) { b.smoke = { x: 0, y: 0, parts: [], next: rng() * 2 }; smokes.push(b.smoke); }
      b.smoke.x = b.wx + b.chimney.lx; b.smoke.y = b.wy + b.chimney.ly;
    }
    if (b.flagPt) {
      if (!b.flagEnt) { b.flagEnt = { x: 0, y: 0, ph: rng() * 7 }; flags.push(b.flagEnt); }
      b.flagEnt.x = b.wx + b.flagPt.lx; b.flagEnt.y = b.wy + b.flagPt.ly - 9;
    }
  }
  lampPts = []; lampRefl = [];
  for (const pr of propList) {
    if (pr.kind === 'prop') {
      const cv2 = SPR[pr.name];
      const cx = isoX(pr.tx + 0.5, pr.ty + 0.5), cy = isoY(pr.tx + 0.5, pr.ty + 0.5);
      statics.push({
        cv: cv2, name: pr.name,
        wx: cx - (cv2.width >> 1) + pr.dx,
        wy: cy - cv2.height + 2 + pr.dy,
        depth: depthTile(pr.tx, pr.ty, pr.dz)
      });
      if (pr.name === 'lamp') lampPts.push({ wx: cx, wy: cy - HH + 2, tx: pr.tx, ty: pr.ty });
    } else if (pr.kind === 'fount') {
      statics.push({
        anim3: [SPR.fount0, SPR.fount1, SPR.fount2], cv: SPR.fount0,
        wx: isoX(pr.tx + 0.5, pr.ty + 0.5) - 7, wy: isoY(pr.tx + 0.5, pr.ty + 0.5) - 12,
        depth: depthTile(pr.tx, pr.ty, 0.3)
      });
    } else if (pr.kind === 'laundry') {
      statics.push({
        cv: SPR.laundry0, cv2: SPR.laundry1, sway: true,
        wx: isoX(pr.tx + 0.5, pr.ty + 0.5) - 8, wy: isoY(pr.tx + 0.5, pr.ty + 0.5) - HH - 6,
        depth: depthTile(pr.tx, pr.ty, 0.3)
      });
    } else if (pr.kind === 'lease') {
      statics.push({
        cv: SPR.lease, name: 'lease',
        wx: Math.round(isoX(pr.lx, pr.ly)) - 12, wy: Math.round(isoY(pr.lx, pr.ly)) + HH - 20,
        depth: depthOf(pr.lx, pr.ly) + 0.3
      });
    }
  }
  // lamps standing beside water throw a shimmering reflection at night
  const G = (x, yy) => yy * Wt + x;
  for (const lp of lampPts) {
    for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1]]) {
      const nx = lp.tx + dx, ny = lp.ty + dy;
      if (nx < 0 || ny < 0 || nx >= Wt || ny >= Ht) continue;
      const t3 = grid[G(nx, ny)];
      if (t3 === T.WATER || t3 === T.SEA) {
        lampRefl.push({ wx: isoX(nx + 0.5, ny + 0.5), wy: isoY(nx + 0.5, ny + 0.5) - HH + 3, ph: (lp.tx * 3 + lp.ty) % 7 });
        break;
      }
    }
  }
  statics.sort((a, b2) => a.depth - b2.depth);
}

/* ==========================================================================
   EVERY DOOR ON FOOT - walkability BFS from the spawn plaza
   ========================================================================== */
function walkBFS() {
  const seen = new Uint8Array(Wt * Ht);
  const okTile = (tx, ty) => playerWalkable(grid[ty * Wt + tx]) && !propSolid.has(tx + ',' + ty);
  const sx = Math.floor(player.x), sy = Math.floor(player.y);
  if (sx < 0 || sy < 0 || sx >= Wt || sy >= Ht || !okTile(sx, sy)) return { total: doors.length, reachable: 0, stranded: doors.map(d => d.slug), seen };
  const qx = new Int32Array(Wt * Ht), qy = new Int32Array(Wt * Ht);
  let head = 0, tail = 0;
  qx[tail] = sx; qy[tail] = sy; tail++; seen[sy * Wt + sx] = 1;
  while (head < tail) {
    const cx = qx[head], cy = qy[head]; head++;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= Wt || ny >= Ht) continue;
      const gi = ny * Wt + nx;
      if (seen[gi] || !okTile(nx, ny)) continue;
      seen[gi] = 1; qx[tail] = nx; qy[tail] = ny; tail++;
    }
  }
  const stranded = [];
  for (const d of doors) {
    const tx = Math.floor(d.px), ty = Math.floor(d.py);
    if (!seen[ty * Wt + tx]) stranded.push(d.slug);
  }
  return { total: doors.length, reachable: doors.length - stranded.length, stranded, seen };
}
/* boot-time repair: any prop walling a region off gets removed (placement is
   adjusted; the courier never teleports out of a stuck spot) */
function fixReachability() {
  let r = walkBFS();
  for (let pass = 0; pass < 10 && r.stranded.length; pass++) {
    let removed = 0;
    for (let i = propList.length - 1; i >= 0; i--) {
      const pr = propList[i];
      const key = pr.tx + ',' + pr.ty;
      if (!propSolid.has(key)) continue;
      if (!playerWalkable(grid[pr.ty * Wt + pr.tx])) continue;
      let nearReach = false, nearDark = false;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = pr.tx + dx, ny = pr.ty + dy;
        if (nx < 0 || ny < 0 || nx >= Wt || ny >= Ht) continue;
        if (!playerWalkable(grid[ny * Wt + nx]) || propSolid.has(nx + ',' + ny)) continue;
        if (r.seen[ny * Wt + nx]) nearReach = true; else nearDark = true;
      }
      if (nearReach && nearDark) { propSolid.delete(key); propList.splice(i, 1); removed++; }
    }
    if (!removed) {
      // fallback: clear every solid prop inside the still-dark region
      for (let i = propList.length - 1; i >= 0; i--) {
        const pr = propList[i];
        const key = pr.tx + ',' + pr.ty;
        if (propSolid.has(key) && playerWalkable(grid[pr.ty * Wt + pr.tx]) && !r.seen[pr.ty * Wt + pr.tx]) {
          propSolid.delete(key); propList.splice(i, 1); removed++;
        }
      }
      if (!removed) break;
    }
    r = walkBFS();
  }
  return r;
}

/* golden-hour long shadows, baked per orientation into a world-sized overlay */
function bakeShadows() {
  const [c, g] = mkCv(worldW, worldH);
  g.fillStyle = 'rgba(24,18,44,0.32)';
  const vx2 = (u, v) => OX + (u - v) * HW, vy2 = (u, v) => OY + (u + v) * HH;
  for (const b of buildings) {
    const hgt = (b.style === 'kiosk' ? 8 : b.s * SPX);
    const L = clamp(Math.round(hgt * 1.5), 10, 70);
    const sx = vx2(b.vx + b.vfw, b.vy + b.vfd), sy = vy2(b.vx + b.vfw, b.vy + b.vfd);
    const ex = vx2(b.vx + b.vfw, b.vy), ey = vy2(b.vx + b.vfw, b.vy);
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
      const [cx, cy] = tIso(tx, ty);
      starPts.push({ wx: cx + (hh >> 5) % 9 - 4, wy: cy + 2 + (hh >> 9) % 4, ph: hh % 11 });
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
  // peds (they hurry a little when a shower passes through)
  const pedDt = dt * (1 + 0.55 * rainI);
  for (const p of peds) {
    stepEntityGrid(p, (nx, ny) => walkableP(tileAt(nx, ny)), 2.2, pedDt, null);
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
        sndEvent('wing_flap', pg.tx, pg.ty, 0.3);
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
      boat.dx = B2[0] - A2[0]; boat.dy = B2[1] - A2[1];
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
  /* street-following controls: each key IS one dimetric street axis as drawn
     on screen. ArrowRight walks the down-right avenue (grid +x), ArrowUp the
     up-right one (grid -y), ArrowLeft up-left (grid -x), ArrowDown down-left
     (grid +y). One held key follows a road without ever fighting the grid;
     two adjacent keys blend between the axes. */
  const sx = (keysDown.has('r') ? 1 : 0) - (keysDown.has('l') ? 1 : 0);
  const sy = (keysDown.has('d') ? 1 : 0) - (keysDown.has('u') ? 1 : 0);
  let tdx = 0, tdy = 0;
  let striding = false;
  if (sx || sy) {
    const wd = viewDirToWorld(sx, sy);   // keys stay SCREEN-relative in every orientation
    tdx = wd[0]; tdy = wd[1];
    striding = stride;                   // Shift held: the courier strides
    player.tgt = null;                   // keys override click-to-walk
  } else if (player.tgt) {
    const dx = player.tgt.x - player.x, dy = player.tgt.y - player.y;
    const d = Math.hypot(dx, dy);
    if (d < 0.22) { player.tgt = null; player.tgtStall = 0; }
    else { tdx = dx / d; tdy = dy / d; striding = !!player.tgt.stride; }
  }
  if (tp) { tdx = 0; tdy = 0; }          // no walking mid-teleport
  const spd = PSPEED * (striding ? 1.7 : 1);
  if (tdx || tdy) {
    const tl = Math.hypot(tdx, tdy) || 1;
    player.vx += (tdx / tl * spd - player.vx) * Math.min(1, PACC * dt);
    player.vy += (tdy / tl * spd - player.vy) * Math.min(1, PACC * dt);
    player.idleT = 0;
    if (player.tgt) {                              // give up on unreachable click targets
      if (Math.hypot(player.vx, player.vy) < 0.3) {
        player.tgtStall = (player.tgtStall || 0) + dt;
        if (player.tgtStall > 0.8) { player.tgt = null; player.tgtStall = 0; }
      } else player.tgtStall = 0;
    }
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
  const vvd = worldDirToView(player.vx, player.vy);
  const svx = vvd[0] - vvd[1], svy = (vvd[0] + vvd[1]) * 0.5;
  if (sp > 0.4) {
    const deg = Math.atan2(svy, svx) * 180 / Math.PI;
    player.face = ((Math.round(deg / 45) % 8) + 8) % 8;
    player.walkT += dt * (1.4 + sp * 1.5);
  }
  // footsteps keep the walk cycle's beat (sound engine decides ground + gain)
  if (sp > 1.2) {
    player.stepAcc = (player.stepAcc || 0) + dt * (1.4 + sp * 1.5) * 1.6;
    if (player.stepAcc >= 1) { player.stepAcc -= 1; sndFootstep(); }
  } else player.stepAcc = 0.6;
  // soft footstep dust (a stride kicks up more)
  player.dustT -= dt;
  if (!REDUCED && sp > 1.4 && player.dustT <= 0) {
    const wx = isoX(player.x, player.y), wy = isoY(player.x, player.y);
    spawnPart('dust', wx - 1 + (Math.random() * 4 - 2), wy - 1, (Math.random() - 0.5) * 4, -2 - Math.random() * 2, striding ? 0.65 : 0.5);
    if (striding) spawnPart('dust', wx - 2 + (Math.random() * 6 - 3), wy - 1, (Math.random() - 0.5) * 6, -2 - Math.random() * 2, 0.5);
    player.dustT = striding ? 0.09 : 0.15;
  }
  // tiny breath puffs in winter
  if (!REDUCED && season === 3) {
    player.breathT -= dt;
    if (player.breathT <= 0) {
      const wx = isoX(player.x, player.y), wy = isoY(player.x, player.y);
      spawnPart('breath', wx + 2, wy - 11, 0, 0, 0.9);
      player.breathT = sp > 0.5 ? 1.6 + Math.random() : 2.6 + Math.random() * 1.4;
    }
  }
  // nearest door within reach (no prompt while the reading panel is open,
  // and none below street zoom, where it would float over the fit view)
  let best = null, bd2 = 0.9;
  if (panel.hidden && cam.z >= 3) {
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
    const pwx = isoX(player.x, player.y) + svx / sl * look;
    const pwy = isoY(player.x, player.y) + svy / sl * look - 8;
    const txc = pwx - cvs.width / (2 * z), tyc = pwy - cvs.height / (2 * z);
    const k = 1 - Math.exp(-4.5 * dt);
    cam.x += (txc - cam.x) * k;
    cam.y += (tyc - cam.y) * k;
    camSettle = Math.abs(txc - cam.x) + Math.abs(tyc - cam.y);
  } else camSettle = 0;
}

function drawPlayerInto(dyn) {
  const wx = isoX(player.x, player.y), wy = isoY(player.x, player.y);
  const onBridge = tileAt(Math.floor(player.x), Math.floor(player.y)) === T.BRIDGE ? 2.5 : 0;
  let depth = depthOf(player.x, player.y) - 0.98 + onBridge;
  // standing right in front of a wide building's face (a door, usually): the
  // single-depth-per-sprite sort would wrongly hide the courier, so bump them
  const pu = vU(player.x, player.y), pv = vV(player.x, player.y);
  for (const b of buildings) {
    if (pv >= b.vy + b.vfd && pv <= b.vy + b.vfd + 0.95 &&
        pu >= b.vx - 0.3 && pu <= b.vx + b.vfw + 0.3) {
      depth = Math.max(depth, b.depth + 0.05);           // near face strip
    } else if (pu >= b.vx + b.vfw && pu <= b.vx + b.vfw + 0.95 &&
        pv >= b.vy - 0.3 && pv <= b.vy + b.vfd + 0.3) {
      depth = Math.max(depth, b.depth + 0.05);           // right face strip
    }
  }
  // teleport: dissolve out at the old spot, sparkle in at the door
  let tpAlpha = 1, sparkle = 0;
  if (tp) {
    if (tp.phase === 'out') { tpAlpha = Math.max(0, 1 - tp.t / 0.32); sparkle = 1; }
    else { tpAlpha = Math.min(1, tp.t / 0.34); sparkle = 1; }
  } else if (tpHeld > 0) sparkle = 1;
  const ringCv = SPR['ring' + (REDUCED ? 0 : Math.floor(animT * 2.5) % 2)];
  if (cam.z <= 1) {
    // widest zoom: a dot with a soft marker ring so you never lose yourself
    dyn.push({ cv: ringCv, wx: Math.round(wx - 11), wy: Math.round(wy - 5), depth: depth - 0.02, alpha: 0.85 });
    dyn.push({ cv: SPR.plrdot, wx: Math.round(wx - 1), wy: Math.round(wy - 2), depth, alpha: tpAlpha });
    return;
  }
  if (cam.z === 2) dyn.push({ cv: ringCv, wx: Math.round(wx - 11), wy: Math.round(wy - 5), depth: depth - 0.02, alpha: 0.4 });
  const sp = Math.hypot(player.vx, player.vy);
  const moving = sp > 0.35;
  const fc = FACE_SPR[player.face], dn = fc[0], fl = fc[1];
  const f = moving ? Math.floor(player.walkT * 3.2) % 4 : 0;
  const bob = !moving && player.idleT > 4 && Math.floor(animT * 1.4) % 2 ? 1 : 0;
  if (waveT > 0 && !moving) {
    // the courier waves at the camera: 3 authored frames, cycled warmly
    const wf3 = REDUCED ? 1 : [0, 1, 2, 1][Math.floor((1.6 - Math.max(0, waveT)) * 6) % 4];
    dyn.push({ cv: SPR['plr_wave_' + wf3], wx: Math.round(wx - 5), wy: Math.round(wy - 14), depth, alpha: tpAlpha });
  } else if (tpAlpha > 0.03) {
    dyn.push({ cv: SPR[`plr_${dn}_${f}`], wx: Math.round(wx - 5), wy: Math.round(wy - 14 + bob), depth, flip: !!fl, alpha: tpAlpha < 1 ? tpAlpha : undefined });
  }
  if (sparkle && SPR.tpspark0) {
    const scv = SPR['tpspark' + (REDUCED ? 0 : Math.floor(animT * 6) % 2)];
    dyn.push({ cv: scv, wx: Math.round(wx - scv.width / 2), wy: Math.round(wy - 16), depth: depth + 0.02, alpha: REDUCED ? 0.8 : 0.55 + 0.35 * Math.sin(animT * 9) });
  }
  // the satchel of documents glows softly (brighter while idling)
  const pulse = 0.22 + 0.16 * (REDUCED ? 0.5 : Math.sin(animT * 3)) + (player.idleT > 4 ? 0.16 : 0);
  if (dn !== 'n' && dn !== 'ne' && tpAlpha >= 1 && waveT <= 0) {
    dyn.push({ cv: SPR.plrhalo, wx: Math.round(wx + (fl ? -3 : -5)), wy: Math.round(wy - 10 + bob), depth: depth + 0.01, alpha: Math.max(0.12, pulse) });
  }
}

/* ==========================================================================
   MAP ROTATION - four dimetric orientations (Q/E + HUD buttons)
   ========================================================================== */
function rebuildView() {
  Wv = orient % 2 ? Ht : Wt;
  Hv = orient % 2 ? Wt : Ht;
  OX = Hv * HW + 2;                    // worldW/H are symmetric in Wt+Ht: unchanged
  bakeWater();
  ensureGround(season);
  if (seasonBlend < 1 && seasonPrev >= 0) ensureGround(seasonPrev);
  projectStatics();
  bakeQuarterLabels();
  bakeShadows();
  initStars();
}
function setOrient(no) {
  no = ((no % 4) + 4) % 4;
  if (no === orient || rotFx) return;
  // keep the world point at screen centre fixed through the turn
  const c = pxToWorld(cam.x + cvs.width / (2 * cam.z), cam.y + cvs.height / (2 * cam.z));
  const swap = () => {
    orient = no;
    rebuildView();
    cam.x = Math.round(isoX(c[0], c[1]) - cvs.width / (2 * cam.z));
    cam.y = Math.round(isoY(c[0], c[1]) - cvs.height / (2 * cam.z));
    diag.orient = orient;
  };
  if (REDUCED) { swap(); requestDraw(); return; }   // reduced motion: instant cut
  rotFx = { t: 0, dur: 0.55, swap, swapped: false };
  startLoop();
}
function stepRotFx(dt) {
  if (!rotFx) return;
  rotFx.t += dt;
  if (!rotFx.swapped && rotFx.t >= rotFx.dur * 0.45) { rotFx.swap(); rotFx.swapped = true; }
  if (rotFx.t >= rotFx.dur) rotFx = null;
}

/* ==========================================================================
   CAMERA FLIGHT + YOU ARE HERE + DISTRICT SPOTLIGHT
   ========================================================================== */
/* smooth pan with stepped INTEGER zoom (crispness rule holds every frame) */
function startFly(cx1, cy1, z1, onDone) {
  const z0 = cam.z;
  if (REDUCED) {                       // reduced motion: no flight, just arrive
    cam.z = z1;
    cam.x = Math.round(cx1 - cvs.width / (2 * z1));
    cam.y = Math.round(cy1 - cvs.height / (2 * z1));
    camFly = null;
    if (onDone) onDone();
    requestDraw();
    return;
  }
  const cx0 = cam.x + cvs.width / (2 * z0), cy0 = cam.y + cvs.height / (2 * z0);
  let i0 = ZLEVELS.indexOf(z0), i1 = ZLEVELS.indexOf(z1);
  if (i0 < 0) i0 = 0;
  if (i1 < 0) i1 = 0;
  const zs = [];
  if (i0 <= i1) for (let i = i0; i <= i1; i++) zs.push(ZLEVELS[i]);
  else for (let i = i0; i >= i1; i--) zs.push(ZLEVELS[i]);
  camFly = { t: 0, dur: Math.max(0.9, 0.32 * zs.length + 0.55), x0: cx0, y0: cy0, x1: cx1, y1: cy1, zs, done: onDone };
  camMode = 'free';
  startLoop();
}
function stepFly(dt) {
  if (!camFly) return;
  camFly.t += dt;
  const u = clamp(camFly.t / camFly.dur, 0, 1);
  const e = u * u * (3 - 2 * u);                       // smoothstep ease
  const cx = camFly.x0 + (camFly.x1 - camFly.x0) * e;
  const cy = camFly.y0 + (camFly.y1 - camFly.y0) * e;
  const zi = Math.min(camFly.zs.length - 1, Math.floor(e * camFly.zs.length));
  cam.z = camFly.zs[zi];
  cam.x = Math.round(cx - cvs.width / (2 * cam.z));
  cam.y = Math.round(cy - cvs.height / (2 * cam.z));
  if (u >= 1) { const d = camFly.done; camFly = null; if (d) d(); }
}
function districtOfPlayer() {
  const tx = Math.floor(player.x), ty = Math.floor(player.y);
  if (tx >= 0 && ty >= 0 && tx < Wt && ty < Ht) {
    const qi = quarterOf[ty * Wt + tx];
    if (qi >= 0) { const q = quarters.find(q2 => q2.id === qi); if (q) return q; }
  }
  let bq = null, bd = Infinity;
  for (const q of quarters) {
    const d = (q.qx + q.qw / 2 - player.x) ** 2 + (q.qy + q.qh / 2 - player.y) ** 2;
    if (d < bd) { bd = d; bq = q; }
  }
  return bq;
}
const yahEl = document.getElementById('yah');
function setYah(q, secs, hold) {
  yahT = secs;
  yahHold = !!hold || REDUCED;         // reduced motion holds a calm, static marker
  yahEl.textContent = 'YOU ARE HERE' + (q ? ' · ' + q.label.toUpperCase() : '');
}
function dismissYah(soft) {
  yahHold = false;
  yahT = soft ? Math.min(yahT, 1.2) : 0;
}
function findMe() {
  const wxp = isoX(player.x, player.y), wyp = isoY(player.x, player.y);
  setYah(districtOfPlayer(), 5);
  startFly(wxp, wyp - 8, cam.z > 4 ? cam.z : 4, () => { camMode = 'follow'; startWave(); });
}
function fitCenter() {
  const zf = Math.max(1, Math.min(Math.floor(cvs.width / worldW), Math.floor(cvs.height / worldH)));
  return { x: worldW / 2, y: worldH / 2, z: zf };
}
/* fresh-visit flow: dismissing the welcome card flies the camera down to the
   courier, marks them, then offers "Look around" / "Start walking". */
const introEl = document.getElementById('introprompt');
function startIntro() {
  const q = districtOfPlayer();
  const wxp = isoX(player.x, player.y), wyp = isoY(player.x, player.y);
  setYah(q, 999, true);
  document.getElementById('ip-name').textContent = q ? q.label : '';
  startFly(wxp, wyp - 8, 4, () => {
    camMode = 'follow';
    introEl.hidden = false;
    startWave();               // the courier waves at the camera on arrival
  });
}
function endIntro(lookAround) {
  introEl.hidden = true;
  yahHold = REDUCED;
  yahT = lookAround ? 6 : 2.5;
  if (lookAround) {
    const f = fitCenter();
    startFly(f.x, f.y, f.z, null);
  } else camMode = 'follow';
  if (REDUCED) draw();
}
/* district spotlight: hover keeps the district in full colour and lets the
   rest of the town fall back. One even-odd path fill per frame - free. */
function setSpot(q) {
  if (q === (spotOn ? spotQ : null)) return;
  if (q) { spotQ = q; spotOn = true; } else spotOn = false;
  const banner = document.getElementById('spotbanner');
  if (spotQ) banner.textContent = spotQ.label + ' · ' + spotQ.members.length + (spotQ.members.length > 1 ? ' pages' : ' page');
  if (REDUCED) { spotA = spotOn ? 1 : 0; draw(); return; }
  startLoop();
}
function bakeQuarterLabels() {
  for (const q of quarters) {
    let txt = q.label.toUpperCase().replace(/[^A-Z0-9 -]/g, ' ').replace(/\s+/g, ' ').trim();
    if (txt.length > 18) txt = txt.slice(0, 18).replace(/\s+\S*$/, '');
    const w = textW(txt) + 8, h = 11;
    const [c, g] = mkCv(w, h);
    g.fillStyle = 'rgba(18,15,28,0.72)';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(244,238,224,0.30)';
    g.fillRect(0, 0, w, 1); g.fillRect(0, h - 1, w, 1); g.fillRect(0, 0, 1, h); g.fillRect(w - 1, 0, 1, h);
    drawText3x5(g, 4, 3, txt, PAL.WH);
    q.labelCv = c;
    q.labelWx = isoX(q.qx + q.qw / 2, q.qy + q.qh / 2);
    q.labelWy = isoY(q.qx + q.qw / 2, q.qy + q.qh / 2);
  }
}

/* ==========================================================================
   PARTICLES - one capped pool: weather, footstep dust, winter breath
   ========================================================================== */
function spawnPart(type, wx, wy, vx, vy, life, col) {
  if (parts.length >= MAXPART + 260) return;
  parts.push({ type, wx, wy, vx, vy, life, t: 0, ph: (Math.abs(wx * 7 + wy * 3) | 0) % 10, col });
}
function updateParts(dt, vx0, vy0, vx1, vy1) {
  if (!REDUCED) {
    const ramp = seasonBlend >= 1 ? 1 : seasonBlend * seasonBlend * (3 - 2 * seasonBlend); // densities ramp with the season blend
    let base = (season === 3 ? 26 : season === 2 ? 9 : season === 0 ? 14 : 0) * ramp;
    if (rainI > 0.05) base *= (1 - 0.7 * rainI);           // showers thin the petals and leaves
    const zf = cam.z >= 4 ? 1 : cam.z === 3 ? 0.7 : cam.z === 2 ? 0.4 : 0.18;
    weatherAcc += base * zf * dt;
    let alive = 0, rainAlive = 0;
    for (const p of parts) {
      if (p.type === 'rain') rainAlive++;
      else if (p.type !== 'dust' && p.type !== 'breath' && p.type !== 'spark') alive++;
    }
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
    // rain streaks, spawned from just above the viewport, density eased by rainI
    if (rainI > 0.02) {
      const cap = cam.z >= 4 ? 190 : cam.z === 3 ? 170 : cam.z === 2 ? 130 : 90;
      rainAcc += (cap * 0.85) * rainI * dt;
      while (rainAcc >= 1) {
        rainAcc -= 1;
        if (rainAlive >= cap) continue;
        const rx = vx0 + Math.random() * (vx1 - vx0);
        spawnPart('rain', rx, vy0 - 6 - Math.random() * 24, 7 + Math.random() * 4, 85 + Math.random() * 45, 6);
        rainAlive++;
      }
    } else rainAcc = 0;
  }
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.t += dt;
    p.life -= dt;
    if (p.type === 'snow') { p.wx += (p.vx + Math.sin(p.t * 1.7 + p.ph) * 4) * dt; p.wy += p.vy * dt; }
    else if (p.type === 'leaf') { p.wx += (p.vx + Math.sin(p.t * 2.2 + p.ph) * 7) * dt; p.wy += (p.vy + Math.cos(p.t * 1.8 + p.ph) * 2) * dt; }
    else if (p.type === 'petal') { p.wx += (p.vx + Math.sin(p.t * 1.5 + p.ph) * 5) * dt; p.wy += p.vy * dt; }
    else if (p.type === 'dust') { p.wx += p.vx * dt; p.wy += p.vy * dt; p.vy -= 3 * dt; }
    else if (p.type === 'rain') { p.wx += p.vx * dt; p.wy += p.vy * dt; }
    else if (p.type === 'spark') { p.wx += p.vx * dt; p.wy += p.vy * dt; p.vy -= 2 * dt; }
    else { p.wx += 2.5 * dt; p.wy -= 4 * dt; }   // breath
    if (p.life <= 0 || p.wy > vy1 + 16 || p.wx < vx0 - 24 || p.wx > vx1 + 24) parts.splice(i, 1);
  }
}

/* ==========================================================================
   SOUND - real recordings from open, royalty-free banks, bundled in sfx/
   (every file CC0 or public domain; sources in sfx/CREDITS.txt).
   ON by default; the AudioContext wakes on the first gesture; the toggle
   silences everything and is remembered for the visit.
   ========================================================================== */
const SND_FILES = {
  step_pave_0: 1, step_pave_1: 1, step_grass_0: 1, step_grass_1: 1,
  step_snow_0: 1, step_snow_1: 1, step_wood_0: 1,
  door_open: 1, teleport_out: 1, teleport_in: 1, wave_chirp: 1,
  pigeon_coo: 1, wing_flap: 1, cat_meow: 1, seagull: 1,
  leaf_rustle_0: 1, leaf_rustle_1: 1,
  room_tone: 1, birds_day: 1, crickets_night: 1, rain_loop: 1,
  wind_winter: 1, lamp_hum: 1, van_putter: 1
};
const sndLog = window.__sndLog = [];
let sndOn = true;
try { sndOn = localStorage.getItem('pdc_sound') !== '0'; } catch (err) { }
let AC = null, sndMaster = null, sndBufs = {}, sndReady = false, sndLoops = {};
function sndUnlock() {
  if (AC) {
    if (AC.state === 'suspended') AC.resume().catch(() => { });
    return;
  }
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return;
  try { AC = new Ctor(); } catch (err) { return; }
  if (AC.state === 'suspended') AC.resume().catch(() => { });
  sndMaster = AC.createGain();
  sndMaster.gain.value = sndOn ? 1 : 0;
  sndMaster.connect(AC.destination);
  Promise.all(Object.keys(SND_FILES).map(k =>
    fetch('sfx/' + k + '.ogg')
      .then(r => r.arrayBuffer())
      .then(ab => new Promise((res, rej) => AC.decodeAudioData(ab, res, rej)))
      .then(buf => { sndBufs[k] = buf; })
      .catch(() => { })
  )).then(() => { sndReady = true; sndStartLoops(); });
}
window.addEventListener('pointerdown', sndUnlock);
window.addEventListener('keydown', sndUnlock);
/* the continuous beds: town room tone, birds by day, crickets by night,
   rain and winter wind, a lamp hum after dark, the nearest van's putter */
const SND_LOOPDEFS = { room: 'room_tone', birds: 'birds_day', crickets: 'crickets_night', rain: 'rain_loop', wind: 'wind_winter', lamp: 'lamp_hum', van: 'van_putter' };
function sndStartLoops() {
  for (const k of Object.keys(SND_LOOPDEFS)) {
    const buf = sndBufs[SND_LOOPDEFS[k]];
    if (!buf) continue;
    const src = AC.createBufferSource();
    src.buffer = buf; src.loop = true;
    const g = AC.createGain(); g.gain.value = 0;
    src.connect(g);
    let tail = g, p = null;
    if ((k === 'lamp' || k === 'van') && AC.createStereoPanner) { p = AC.createStereoPanner(); g.connect(p); tail = p; }
    tail.connect(sndMaster);
    src.start();
    sndLoops[k] = { g, p };
  }
}
function panOf(x, y) {
  const sxp = (isoX(x, y) - cam.x) * cam.z / Math.max(1, cvs.width);
  return clamp((sxp - 0.5) * 1.6, -0.8, 0.8);
}
const sndCool = {};   // per-name cooldowns keep busy events (wing flaps) gentle
const SND_COOLDOWN = { wing_flap: 2.4, pigeon_coo: 3, cat_meow: 4, seagull: 5, door_open: 0.5, step: 0.06 };
function sndPlay(name, vol, pan, rate) {
  const now = performance.now();
  const coolKey = name.startsWith('step_') ? 'step' : name;
  const cd = (SND_COOLDOWN[coolKey] || 0.12) * 1000;
  if (sndCool[coolKey] && now - sndCool[coolKey] < cd) return;
  sndCool[coolKey] = now;
  sndLog.push({ n: name, t: Math.round(now) });
  if (sndLog.length > 300) sndLog.shift();
  if (!AC || !sndReady || !sndOn) return;
  const buf = sndBufs[name];
  if (!buf) return;
  const src = AC.createBufferSource();
  src.buffer = buf;
  if (rate) src.playbackRate.value = rate;
  const g = AC.createGain();
  g.gain.value = clamp(vol, 0, 0.6);
  src.connect(g);
  let tail = g;
  if (AC.createStereoPanner) {
    const p = AC.createStereoPanner();
    p.pan.value = clamp(pan || 0, -1, 1);
    g.connect(p); tail = p;
  }
  tail.connect(sndMaster);
  src.start();
}
/* a world-anchored one-shot: distance-attenuated, stereo-panned by screen x */
function sndEvent(name, x, y, vol) {
  const d = Math.hypot(x - player.x, y - player.y);
  const g = vol / (1 + d * 0.30);
  if (g < 0.02) return;
  sndPlay(name, g, panOf(x, y), 0.94 + Math.random() * 0.12);
}
function sndFootstep() {
  const t2 = tileAt(Math.floor(player.x), Math.floor(player.y));
  let base = 'step_pave_';
  if (season === 3) base = 'step_snow_';
  else if (t2 === T.GRASS || t2 === T.FLOWER) base = 'step_grass_';
  else if (t2 === T.BRIDGE) base = 'step_wood_';
  const n = base === 'step_wood_' ? 0 : (Math.random() * 2) | 0;
  sndPlay(base + n, stride ? 0.17 : 0.12, 0, 0.9 + Math.random() * 0.2);
}
/* eased loop gains, refreshed every tick */
function sndUpdate() {
  if (!AC || !sndReady) return;
  const set = (k, v, pan) => {
    const L2 = sndLoops[k];
    if (!L2) return;
    L2.g.gain.setTargetAtTime(clamp(v, 0, 0.6), AC.currentTime, 0.5);
    if (pan !== undefined && L2.p) L2.p.pan.setTargetAtTime(clamp(pan, -1, 1), AC.currentTime, 0.25);
  };
  const day = 1 - nf;
  set('room', 0.055 + 0.025 * day);
  set('birds', season === 3 ? 0.015 : 0.13 * day * (1 - rainI * 0.6));
  set('crickets', 0.11 * nf * (season === 3 ? 0.25 : 1) * (1 - rainI * 0.5));
  set('rain', 0.42 * rainI);
  set('wind', season === 3 ? 0.15 : 0);
  let ld = 99;
  for (const lp of lampPts) {
    const d = Math.abs(lp.tx + 0.5 - player.x) + Math.abs(lp.ty + 0.5 - player.y);
    if (d < ld) ld = d;
  }
  set('lamp', nf > 0.4 && ld < 4 ? 0.09 * (1 - ld / 4) * nf : 0);
  let vd = 99, vpan = 0;
  for (const c of cars) {
    if (c.stopped) continue;
    const d = Math.hypot(c.x - player.x, c.y - player.y) * (c.van ? 1 : 1.7); // vans putter loudest
    if (d < vd) { vd = d; vpan = panOf(c.x, c.y); }
  }
  set('van', vd < 9 ? 0.11 * (1 - vd / 9) : 0, vpan);
}
/* rare, placed one-shots: pigeon coos, the cat, autumn rustle, a seagull */
const sndAmbTimers = { pigeon: 6, cat: 24, leaf: 10, gull: 16 };
function sndAmbient(dt) {
  if (!AC || !sndReady) return;
  sndAmbTimers.pigeon -= dt;
  if (sndAmbTimers.pigeon <= 0) {
    sndAmbTimers.pigeon = 7 + Math.random() * 9;
    for (const pg of pigeons) {
      if (pg.st === 'peck' && Math.hypot(pg.tx - player.x, pg.ty - player.y) < 8) {
        sndEvent('pigeon_coo', pg.tx, pg.ty, 0.34);
        break;
      }
    }
  }
  sndAmbTimers.cat -= dt;
  if (sndAmbTimers.cat <= 0) {
    sndAmbTimers.cat = 26 + Math.random() * 22;
    for (const ct of cats) {
      if (Math.hypot(ct.tx - player.x, ct.ty - player.y) < 5) {
        sndEvent('cat_meow', ct.tx, ct.ty, 0.3);
        break;
      }
    }
  }
  if (season === 2) {
    sndAmbTimers.leaf -= dt;
    if (sndAmbTimers.leaf <= 0) {
      sndAmbTimers.leaf = 8 + Math.random() * 11;
      sndPlay('leaf_rustle_' + ((Math.random() * 2) | 0), 0.12, Math.random() * 1.2 - 0.6);
    }
  }
  sndAmbTimers.gull -= dt;
  if (sndAmbTimers.gull <= 0) {
    sndAmbTimers.gull = 18 + Math.random() * 20;
    const edgeD = Math.min(player.x, player.y, Wt - player.x, Ht - player.y);
    if (edgeD < 10) sndPlay('seagull', 0.10 * (1 - edgeD / 10) + 0.03, Math.random() - 0.5);
  }
}
function setSnd(on) {
  sndOn = on;
  try { localStorage.setItem('pdc_sound', on ? '1' : '0'); } catch (err) { }
  if (AC && sndMaster) sndMaster.gain.setTargetAtTime(on ? 1 : 0, AC.currentTime, 0.08);
  const btn = document.getElementById('btn-snd');
  if (btn) {
    btn.classList.toggle('snd-off', !on);
    btn.textContent = on ? '♪ on' : '♪ off';
    btn.title = on ? 'Sound on · click to mute' : 'Sound off · click to unmute';
  }
}

/* ==========================================================================
   RAIN - occasional showers in spring and autumn, eased in and out
   ========================================================================== */
function stepRain(dt) {
  if (REDUCED) { rainI = 0; rainTarget = 0; return; }
  const canRain = season === 0 || season === 2;
  if (canRain) {
    rainTimer -= dt;
    if (rainTimer <= 0) {
      rainOn = !rainOn;
      const nt = rainOn ? 0.55 + Math.random() * 0.45 : 0;
      if (nt !== rainTarget) { rainFrom = rainI; rainU = 0; rainTarget = nt; }
      rainTimer = rainOn ? 65 + Math.random() * 60 : 100 + Math.random() * 140;
    }
  } else if (rainTarget !== 0) { rainOn = false; rainFrom = rainI; rainU = 0; rainTarget = 0; }
  if (rainU < 1) {
    rainU = Math.min(1, rainU + dt / 8);            // ~8 s smoothstep ramp, both ways
    const e = rainU * rainU * (3 - 2 * rainU);
    rainI = rainFrom + (rainTarget - rainFrom) * e;
  } else rainI = rainTarget;
}

/* ==========================================================================
   TELEPORT - click a building and the courier beams to its door
   ========================================================================== */
function faceFromWorldDir(dx, dy) {
  const vv2 = worldDirToView(dx, dy);
  const fx = vv2[0] - vv2[1], fy = (vv2[0] + vv2[1]) * 0.5;
  const deg = Math.atan2(fy, fx) * 180 / Math.PI;
  return ((Math.round(deg / 45) % 8) + 8) % 8;
}
function burstSpark(x, y) {
  if (REDUCED) return;
  const wx = isoX(x, y), wy = isoY(x, y);
  for (let i = 0; i < 11; i++) {
    spawnPart('spark', wx + (Math.random() * 12 - 6), wy - 1 - Math.random() * 12,
      (Math.random() - 0.5) * 7, -5 - Math.random() * 9, 0.55 + Math.random() * 0.2,
      Math.random() < 0.5 ? PAL.V2 : PAL.WH);
  }
}
function teleportTo(slug) {
  const d = doors.find(dd => dd.slug === slug);
  if (!d) return;
  if (Math.hypot(player.x - d.px, player.y - d.py) < 1.2) return;   // already standing at the door
  camFly = null; player.tgt = null; keysDown.clear();
  if (REDUCED) {                       // instant reposition with a single held sparkle frame
    player.x = d.px; player.y = d.py; player.vx = player.vy = 0;
    player.face = faceFromWorldDir(0, -1);
    tpHeld = 1;
    camMode = 'follow';
    sndEvent('teleport_in', player.x, player.y, 0.5);
    requestDraw();
    return;
  }
  tp = { phase: 'out', t: 0, door: d };
  sndEvent('teleport_out', player.x, player.y, 0.55);
  burstSpark(player.x, player.y);
  startLoop();
}
function stepTeleport(dt) {
  if (tpHeld > 0 && (keysDown.size || player.tgt)) tpHeld = 0;
  if (!tp) return;
  tp.t += dt;
  if (tp.phase === 'out' && tp.t >= 0.34) {
    const d = tp.door;
    player.x = d.px; player.y = d.py; player.vx = player.vy = 0;
    player.face = faceFromWorldDir(0, -1);          // the courier ends facing the door
    tp.phase = 'in'; tp.t = 0;
    camMode = 'follow';
    burstSpark(player.x, player.y);
    const wx = isoX(d.px, d.py), wy = isoY(d.px, d.py);
    for (let i = 0; i < 6; i++) spawnPart('dust', wx - 3 + Math.random() * 6, wy - 1, (Math.random() - 0.5) * 8, -1 - Math.random() * 3, 0.5);
    sndEvent('teleport_in', player.x, player.y, 0.55);
  } else if (tp.phase === 'in' && tp.t >= 0.4) tp = null;
}
/* the courier waves at the camera on intro and Find-me arrivals */
function startWave() {
  waveT = 1.6;
  sndEvent('wave_chirp', player.x, player.y, 0.3);
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
  const old = season;
  season = ((i % 4) + 4) % 4;
  if (old !== season) {
    seasonPrev = old;
    seasonBlend = REDUCED ? 1 : 0;          // eased ground crossfade, never a hard cut
    ensureGround(season);
    if (!REDUCED) ensureGround(seasonPrev);
  }
  // the sky turns with the calendar: weather left from the old season fades out
  const keep = SEASON_WEATHER[season];
  for (let k = parts.length - 1; k >= 0; k--) {
    const p = parts[k]; const t2 = p.type;
    if (t2 === 'dust' || t2 === 'breath' || t2 === 'rain' || t2 === 'spark' || t2 === keep) continue;
    if (REDUCED) parts.splice(k, 1);
    else p.life = Math.min(p.life, 0.8 + (k % 5) * 0.18);
  }
  weatherAcc = 0;
  if (season === 3 || season === 1) { rainOn = false; if (rainTarget !== 0) { rainTarget = 0; rainFrom = rainI; rainU = 0; } } // rain never falls in winter (nor in high summer)
  drawSeasonDial();
  if (!REDUCED) startLoop();
  requestDraw();
}
function cycleTimeSpeed() {
  if (REDUCED) return;
  timeSpeed = timeSpeed === 1 ? 8 : timeSpeed === 8 ? 0 : 1;
  document.getElementById('speedlabel').textContent = timeSpeed === 0 ? 'II' : timeSpeed + 'x';
  startLoop();
}
function updateHudDials() {
  const step = Math.floor(dayT * 96);
  if (step !== lastDialStep) { lastDialStep = step; drawClockDial(); }
}
function initHud() {
  document.getElementById('btn-clock').onclick = () => cycleTimeSpeed();
  document.getElementById('btn-season').onclick = () => setSeason(season + 1);
  document.getElementById('btn-find').onclick = () => findMe();
  document.getElementById('rotl').onclick = () => setOrient(orient + 3);
  document.getElementById('rotr').onclick = () => setOrient(orient + 1);
  document.getElementById('btn-snd').onclick = () => setSnd(!sndOn);
  setSnd(sndOn);                       // paints the toggle; boots ON unless remembered off
  if (REDUCED) document.getElementById('speedlabel').textContent = 'II';
  drawClockDial();
  drawSeasonDial();
}
function initHint() {
  let seen = false;
  try { seen = localStorage.getItem('pdc_hint_v2') === '1'; } catch (err) { }
  const card = document.getElementById('hintcard');
  const deepLinked = location.hash && location.hash.length > 2;
  if (!seen && !deepLinked) card.hidden = false;
  document.getElementById('hint-close').onclick = () => {
    card.hidden = true;
    try { localStorage.setItem('pdc_hint_v2', '1'); } catch (err) { }
    startIntro();               // fly down to the courier and mark them
  };
  document.getElementById('ip-look').onclick = () => endIntro(true);
  document.getElementById('ip-walk').onclick = () => endIntro(false);
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
  let skyMix = mixRGB(mixRGB(SKY_DAY, SKY_GOLD, Math.min(1, gf)), SKY_NIGHT, nf);
  if (rainI > 0.02) skyMix = mixRGB(skyMix, hexRGB('#2b3644'), rainI * 0.45 * (1 - nf)); // showers grey the sky, eased
  ctx.fillStyle = rgbStr(skyMix);
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
  // pre-baked ground keyframes for this season, crossfaded through the day;
  // when the season just turned, the old ground eases into the new (smoothstep)
  const gset = groundSets[season];
  const gPrev = seasonBlend < 1 && seasonPrev >= 0 && groundStamp[seasonPrev] === orient ? groundSets[seasonPrev] : null;
  if (gPrev) {
    ctx.drawImage(gPrev.day, 0, 0);
    if (gf > 0.02) { ctx.globalAlpha = Math.min(1, gf); ctx.drawImage(gPrev.gold, 0, 0); }
    if (nf > 0.02) { ctx.globalAlpha = Math.min(1, nf); ctx.drawImage(gPrev.night, 0, 0); }
    const sb = seasonBlend * seasonBlend * (3 - 2 * seasonBlend);
    ctx.globalAlpha = sb;
    ctx.drawImage(gset.day, 0, 0);
    if (gf > 0.02) { ctx.globalAlpha = sb * Math.min(1, gf); ctx.drawImage(gset.gold, 0, 0); }
    if (nf > 0.02) { ctx.globalAlpha = sb * Math.min(1, nf); ctx.drawImage(gset.night, 0, 0); }
    ctx.globalAlpha = 1;
  } else {
    ctx.drawImage(gset.day, 0, 0);
    if (gf > 0.02) { ctx.globalAlpha = Math.min(1, gf); ctx.drawImage(gset.gold, 0, 0); }
    if (nf > 0.02) { ctx.globalAlpha = Math.min(1, nf); ctx.drawImage(gset.night, 0, 0); }
    ctx.globalAlpha = 1;
  }
  // puddle glints while a shower passes (streets keep their legibility)
  if (rainI > 0.03) {
    const tw3 = Math.floor(animT * 3);
    for (const pp of puddlePts) {
      const pxw = isoX(pp.tx, pp.ty), pyw = isoY(pp.tx, pp.ty);
      if (pxw < vx0 || pxw > vx1 || pyw < vy0 || pyw > vy1) continue;
      const glint = REDUCED ? 0 : (tw3 + pp.ph) % 5 === 0 ? 0.3 : 0;
      ctx.globalAlpha = rainI * (0.38 + glint);
      ctx.fillStyle = PAL.GL2;
      ctx.fillRect(pxw, pyw, 2, 1);
      ctx.globalAlpha = rainI * 0.2;
      ctx.fillStyle = PAL.W4;
      ctx.fillRect(pxw - 1, pyw + 1, 1, 1);
    }
    ctx.globalAlpha = 1;
  }
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
    const wx = isoX(p.x, p.y), wy = isoY(p.x, p.y);
    if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue;
    const f = p.stopped || p.prog >= 1 ? 0 : (Math.floor(animT * 7 + p.ph) % 2) + 1;
    const cv2 = SPR[`ped${p.theme}_${REDUCED ? 1 : f}`];
    const pvd = p.dir ? worldDirToView(p.dir[0], p.dir[1]) : null;
    dyn.push({ cv: cv2, wx: Math.round(wx - 2), wy: Math.round(wy - 8), depth: depthOf(p.x, p.y) - 0.98 + (tileAt(Math.floor(p.x), Math.floor(p.y)) === T.BRIDGE ? 2.5 : 0), flip: pvd && pvd[0] < 0 });
  }
  for (const c of cars.concat(cyclists)) {
    const wx = isoX(c.x, c.y), wy = isoY(c.x, c.y);
    if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue;
    const isCyc = c.speed > 2.4 && !c.van && c.col === undefined;
    const cvd = c.dir ? worldDirToView(c.dir[0], c.dir[1]) : null;
    let cv2;
    if (isCyc) cv2 = SPR[wf2 % 2 ? 'cycl0' : 'cycl1'];
    else if (c.van) cv2 = SPR.vanX;
    else cv2 = SPR[(cvd && cvd[1] !== 0 ? 'carY' : 'carX') + (c.col ?? 0)];
    const onBridge = tileAt(Math.floor(c.x), Math.floor(c.y)) === T.BRIDGE ? 2.5 : 0;
    dyn.push({
      cv: cv2, wx: Math.round(wx - cv2.width / 2), wy: Math.round(wy - cv2.height + 3),
      depth: depthOf(c.x, c.y) - 0.9 + onBridge,
      flip: cvd ? (cvd[0] < 0 || cvd[1] < 0) : false
    });
  }
  for (const pg of pigeons) {
    const wx = isoX(pg.tx, pg.ty), wy = isoY(pg.tx, pg.ty) - (pg.alt || 0);
    if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue;
    const fly = pg.st !== 'peck';
    const cv2 = fly ? SPR[wf2 % 2 ? 'pigf0' : 'pigf1'] : SPR[(Math.floor(animT * 2 + pg.tx) % 4) === 0 ? 'pig1' : 'pig0'];
    dyn.push({ cv: cv2, wx: Math.round(wx - 2), wy: Math.round(wy - 3), depth: depthOf(pg.tx, pg.ty) + (fly ? 5 : -0.5) });
  }
  for (const ct of cats) {
    const wx = isoX(ct.tx, ct.ty), wy = isoY(ct.tx, ct.ty);
    if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue;
    dyn.push({ cv: SPR[Math.floor(animT * 1.5 + ct.ph) % 2 ? 'cat1' : 'cat0'], wx: Math.round(wx - 3), wy: Math.round(wy - 4), depth: depthOf(ct.tx, ct.ty) - 0.4 });
  }
  for (const dg of dogs) {
    const wx = isoX(dg.tx, dg.ty), wy = isoY(dg.tx, dg.ty);
    if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue;
    const wag = !REDUCED && Math.floor(animT * 2 + dg.ph) % 3 === 0;
    dyn.push({ cv: SPR[wag ? 'dog1' : 'dog0'], wx: Math.round(wx - 3), wy: Math.round(wy - 5), depth: depthOf(dg.tx, dg.ty) - 0.4 });
  }
  for (const qp of queuers) {
    const wx = isoX(qp.x, qp.y), wy = isoY(qp.x, qp.y);
    if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue;
    // patient shuffle: an occasional 1px weight shift, frozen under reduced motion
    const nudge = !REDUCED && Math.floor(animT * 0.9 + qp.ph) % 6 === 0 ? 1 : 0;
    dyn.push({ cv: SPR[`ped${qp.theme}_0`], wx: Math.round(wx - 2 + nudge), wy: Math.round(wy - 8), depth: depthOf(qp.x, qp.y) - 0.98 });
  }
  for (const bu of buoys) {
    const wx = isoX(bu.tx, bu.ty), wy = isoY(bu.tx, bu.ty);
    if (wx < vx0 || wx > vx1 || wy < vy0 || wy > vy1) continue;
    const bob = REDUCED ? 0 : Math.floor(animT * 1.4 + bu.ph) % 2;
    dyn.push({ cv: SPR[Math.floor(animT * 1.1 + bu.ph) % 2 && !REDUCED ? 'buoy1' : 'buoy0'], wx: Math.round(wx - 2), wy: Math.round(wy - 4 + bob), depth: depthOf(bu.tx, bu.ty) - 0.5 });
  }
  if (boat) {
    const wx = isoX(boat.x, boat.y), wy = isoY(boat.x, boat.y);
    const bvd = worldDirToView(boat.dx === undefined ? 1 : boat.dx, boat.dy || 0);
    const cv2 = Math.abs(bvd[0]) >= Math.abs(bvd[1]) ? SPR.boatX : SPR.boatY;
    dyn.push({ cv: cv2, wx: Math.round(wx - cv2.width / 2), wy: Math.round(wy - cv2.height + 6), depth: depthOf(boat.x, boat.y) - 0.5, flip: false });
  }
  for (const fl of flags) {
    if (fl.x < vx0 || fl.x > vx1) continue;
    dyn.push({ cv: SPR[Math.floor(animT * 3 + fl.ph) % 2 ? 'flag1' : 'flag0'], wx: fl.x, wy: fl.y, depth: 1e9 - 1 });
  }

  // merge statics (pre-sorted) with dynamics; structures hiding the courier
  // (or the active door) fade see-through - only what actually occludes
  fadeCount = 0;
  const plWx = isoX(player.x, player.y), plWy = isoY(player.x, player.y);
  const plDepth = depthOf(player.x, player.y) - 0.98 + (tileAt(Math.floor(player.x), Math.floor(player.y)) === T.BRIDGE ? 2.5 : 0);
  const doorD = activeDoor ? depthOf(activeDoor.px, activeDoor.py) - 0.98 : 0;
  dyn.sort((a, b2) => a.depth - b2.depth);
  let di = 0;
  for (const st of statics) {
    while (di < dyn.length && dyn[di].depth <= st.depth) { blit(dyn[di]); di++; }
    const wxs = st.wx, wys = st.wy;
    const w3 = st.cv.width, h3 = st.cv.height;
    if (wxs + w3 < vx0 || wxs > vx1 || wys + h3 < vy0 || wys > vy1) continue;
    let target = 1;
    if (cam.z >= 2 && st.depth > plDepth + 0.03 &&
        plWx + 7 > wxs && plWx - 7 < wxs + w3 && plWy + 2 > wys && plWy - 16 < wys + h3) {
      if (st.b) {
        let hit = 0;
        const pk = st.b.pick;
        for (const q2 of [[plWx, plWy - 3], [plWx, plWy - 9], [plWx - 3, plWy - 6], [plWx + 3, plWy - 6], [plWx, plWy - 14]]) {
          const lx = (q2[0] - wxs) | 0, ly = (q2[1] - wys) | 0;
          if (lx >= 0 && ly >= 0 && lx < w3 && ly < h3 && pk[(ly * w3 + lx) * 4 + 3] > 10) hit++;
        }
        if (hit >= 2) target = 0.35;
      } else if (st.name === 'tree' || st.name === 'crane') {
        if (plWx > wxs + 1 && plWx < wxs + w3 - 1 && plWy - 6 > wys && plWy - 6 < wys + h3) target = 0.4;
      }
    }
    // the glowing door and its prompt get the same courtesy under a hovering roofline
    if (target === 1 && cam.z >= 2 && activeDoor && st.b && st.b !== activeDoor.b && st.depth > doorD) {
      const lx = (activeDoor.wx - wxs) | 0, ly = (activeDoor.wy - wys) | 0;
      if (lx >= 0 && ly >= 0 && lx < w3 && ly < h3 && st.b.pick[(ly * w3 + lx) * 4 + 3] > 10) target = 0.4;
    }
    let fadeA = st.fadeA === undefined ? 1 : st.fadeA;
    if (Math.abs(fadeA - target) > 0.02) {
      fadeA += (target - fadeA) * Math.min(1, (REDUCED ? 99 : 10) * lastDt);
      fadeCount++;
    } else fadeA = target;
    st.fadeA = fadeA;
    if (st.b && st.b === hoverB) drawHighlight(st);
    let useCv = st.cv;
    if (st.b) useCv = buildingCv(st.b);                       // night / winter variants
    else if (st.name) useCv = seasonalCv(st.name);            // seasonal trees + snowy props
    if (st.anim3) useCv = REDUCED ? st.anim3[1] : st.anim3[Math.floor(animT * 3) % 3];
    else if (st.sway && !REDUCED && (Math.floor(animT * 2) % 2)) useCv = st.cv2;
    if (fadeA < 0.995) ctx.globalAlpha = fadeA;
    ctx.drawImage(useCv, wxs, wys);
    // window twinkle
    if (st.b && st.b.twk && !REDUCED) {
      for (const tw of st.b.twk) {
        if ((Math.floor(animT * 1.5) + tw.ph) % 11 === 0) { ctx.fillStyle = PAL.DW; ctx.fillRect(tw.x, tw.y, tw.w, tw.h); }
      }
    }
    if (fadeA < 0.995) ctx.globalAlpha = 1;
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
  // a passing shower wets the town: rooftops and streets darken slightly
  if (rainI > 0.02) {
    ctx.fillStyle = `rgba(16,22,38,${(0.16 * rainI).toFixed(3)})`;
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
      else if (p.type === 'petal') { c = p.col; a = Math.min(1, p.life); if (p.ph % 3 === 0) w2 = 2; }
      else if (p.type === 'rain') { c = '#a9cde2'; h2 = 3; a = 0.62 * Math.min(1, rainI * 1.6); }
      else if (p.type === 'spark') { c = p.col || PAL.V2; a = Math.min(1, p.life / 0.4); if (p.ph % 2) { w2 = 2; } }
      else if (p.type === 'dust') { c = '#b9ad93'; a = Math.max(0, p.life / 0.5) * 0.7; if (p.life > 0.25) { w2 = 2; h2 = 2; } }
      else { c = '#e8ecf2'; a = Math.max(0, p.life / 0.9) * 0.55; if (p.life > 0.45) { w2 = 2; h2 = 2; } }
      ctx.globalAlpha = a;
      ctx.fillStyle = c;
      ctx.fillRect(Math.round(p.wx), Math.round(p.wy), w2, h2);
    }
    ctx.globalAlpha = 1;
  }

  // district spotlight: one even-odd path fill dims everything outside the
  // hovered district (gentle, never black); the district keeps full colour
  if (spotA > 0.02 && spotQ) {
    const q = spotQ;
    const m = 6, hgt = (q.topH || 40);
    // the quarter's four projected corners, sorted into screen roles so the
    // hexagon stays correct in every orientation
    const cs4 = [[q.qx, q.qy], [q.qx + q.qw, q.qy], [q.qx + q.qw, q.qy + q.qh], [q.qx, q.qy + q.qh]]
      .map(c4 => [isoX(c4[0], c4[1]), isoY(c4[0], c4[1])]);
    let Tp = cs4[0], Rp = cs4[0], Bp = cs4[0], Lp = cs4[0];
    for (const c4 of cs4) {
      if (c4[1] < Tp[1]) Tp = c4;
      if (c4[0] > Rp[0]) Rp = c4;
      if (c4[1] > Bp[1]) Bp = c4;
      if (c4[0] < Lp[0]) Lp = c4;
    }
    Tp = [Tp[0], Tp[1] - m / 2];
    Rp = [Rp[0] + m, Rp[1]];
    Bp = [Bp[0], Bp[1] + m];
    Lp = [Lp[0] - m, Lp[1]];
    ctx.fillStyle = `rgba(30,32,46,${(0.38 * spotA).toFixed(3)})`;
    ctx.beginPath();
    ctx.rect(vx0, vy0, vx1 - vx0, vy1 - vy0);
    ctx.moveTo(Lp[0], Lp[1]);
    ctx.lineTo(Lp[0], Lp[1] - hgt);
    ctx.lineTo(Tp[0], Tp[1] - hgt);
    ctx.lineTo(Rp[0], Rp[1] - hgt);
    ctx.lineTo(Rp[0], Rp[1]);
    ctx.lineTo(Bp[0], Bp[1]);
    ctx.closePath();
    ctx.fill('evenodd');
  }

  // YOU ARE HERE: pulsing rings around the courier (integer-scaled sprites)
  if (yahT > 0 || yahHold) {
    const wxp = isoX(player.x, player.y), wyp = isoY(player.x, player.y);
    const rcv = SPR['ring' + (REDUCED ? 0 : Math.floor(animT * 2.5) % 2)];
    const pulse = REDUCED ? 0.9 : 0.7 + 0.3 * Math.sin(animT * 4);
    const base = Math.min(1, yahHold ? 0.95 : yahT);
    ctx.globalAlpha = base * pulse;
    ctx.drawImage(rcv, Math.round(wxp - 22), Math.round(wyp - 10), 44, 22);
    ctx.globalAlpha = base * pulse * 0.5;
    ctx.drawImage(rcv, Math.round(wxp - 33), Math.round(wyp - 15), 66, 33);
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

  // quiet district labels at fit/mid zoom (hidden at street level)
  if (cam.z <= 2) {
    for (const q of quarters) {
      if (!q.labelCv) continue;
      const k = cam.z, lw = q.labelCv.width * k, lh = q.labelCv.height * k;
      const sx2 = Math.round((q.labelWx - cam.x) * z - lw / 2);
      const sy2 = Math.round((q.labelWy - cam.y) * z - lh / 2);
      if (sx2 > cvs.width || sy2 > cvs.height || sx2 + lw < 0 || sy2 + lh < 0) continue;
      ctx.globalAlpha = (spotA > 0.3 && spotQ) ? (q === spotQ ? 0 : 0.25) : 0.85;
      ctx.drawImage(q.labelCv, sx2, sy2, lw, lh);
    }
    ctx.globalAlpha = 1;
  }

  /* ---- floating labels: strictly one at a time --------------------------
     hover card > door prompt > spotlight banner; the reading panel hides all */
  const bubbleUp = !bubble.hidden && panel.hidden;
  if (!panel.hidden && !bubble.hidden) bubble.hidden = true;

  // pin the door prompt above the glowing door; never let it cover the courier
  // (it also yields to the YOU ARE HERE banner - one floating label at a time)
  const promptUp = !!activeDoor && panel.hidden && !bubbleUp && !(yahT > 0 || yahHold);
  doorPromptEl.hidden = !promptUp;
  if (promptUp) {
    const rdpr = window.devicePixelRatio || 1;
    const bx = (activeDoor.wx - cam.x) * z / rdpr;
    let by = (activeDoor.wy - 14 - cam.y) * z / rdpr;
    const pwx = isoX(player.x, player.y), pwy = isoY(player.x, player.y);
    const psL = (pwx - 7 - cam.x) * z / rdpr, psR = (pwx + 8 - cam.x) * z / rdpr;
    const psT = (pwy - 16 - cam.y) * z / rdpr, psB = (pwy + 2 - cam.y) * z / rdpr;
    const bw = doorPromptEl.offsetWidth || 140, bh = doorPromptEl.offsetHeight || 28;
    if (bx + bw / 2 > psL && bx - bw / 2 < psR && by > psT && by - bh < psB) by = psT;
    doorPromptEl.style.left = bx + 'px';
    doorPromptEl.style.top = by + 'px';
  }

  // spotlight name banner, pinned over the lit district (yields to card + prompt)
  const spotBanner = document.getElementById('spotbanner');
  if (spotA > 0.05 && spotQ && panel.hidden && !bubbleUp && !promptUp) {
    const rdpr2 = window.devicePixelRatio || 1;
    const bx = (isoX(spotQ.qx + spotQ.qw / 2, spotQ.qy + spotQ.qh / 2) - cam.x) * z / rdpr2;
    const qc4 = [[spotQ.qx, spotQ.qy], [spotQ.qx + spotQ.qw, spotQ.qy], [spotQ.qx + spotQ.qw, spotQ.qy + spotQ.qh], [spotQ.qx, spotQ.qy + spotQ.qh]];
    let topY = Infinity;
    for (const c4 of qc4) topY = Math.min(topY, isoY(c4[0], c4[1]));
    const byW = topY - (spotQ.topH || 40);
    let by = (byW - cam.y) * z / rdpr2;
    by = Math.max(54, by);
    spotBanner.style.left = Math.round(bx) + 'px';
    spotBanner.style.top = Math.round(by) + 'px';
    spotBanner.style.opacity = String(Math.min(1, spotA));
    spotBanner.hidden = false;
  } else spotBanner.hidden = true;

  // YOU ARE HERE label above the courier (hidden while reading)
  if ((yahT > 0 || yahHold) && panel.hidden) {
    const rdpr3 = window.devicePixelRatio || 1;
    const wxp = isoX(player.x, player.y), wyp = isoY(player.x, player.y);
    yahEl.style.left = ((wxp - cam.x) * z / rdpr3) + 'px';
    yahEl.style.top = ((wyp - (cam.z >= 3 ? 20 : 12) - cam.y) * z / rdpr3) + 'px';
    yahEl.style.opacity = String(Math.min(1, yahHold ? 1 : yahT));
    yahEl.hidden = false;
  } else yahEl.hidden = true;

  // rotation shutter: a brief dark blink while the town re-bakes its facing
  if (rotFx) {
    const rp = rotFx.t / rotFx.dur;
    let a2 = rp < 0.45 ? rp / 0.45 : 1 - (rp - 0.45) / 0.55;
    a2 = clamp(a2, 0, 1);
    a2 = a2 * a2 * (3 - 2 * a2);
    ctx.globalAlpha = a2 * 0.88;
    ctx.fillStyle = '#07070f';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    ctx.globalAlpha = 1;
  }

  const mins = Math.floor(dayT * 1440);
  const hh2 = String(Math.floor(mins / 60)).padStart(2, '0'), mm2 = String(mins % 60).padStart(2, '0');
  hud.textContent = `${hh2}:${mm2} · ${SEASONS[season]}${rainI > 0.05 ? ' · rain' : ''} · view ${['N', 'E', 'S', 'W'][orient]} · ${Wt}x${Ht} tiles · zoom x${cam.z} · ${frameMs.toFixed(1)} ms/frame${REDUCED ? ' · motion reduced' : ''}`;
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
  px: 0, py: 0, mode: camMode, samples: [],
  orient: 0, rain: 0, doorsReachable: 0, doorsTotal: 0,
  soundOn: true, soundUnlocked: false, soundBuffers: 0
};

function motionActive() {
  return keysDown.size > 0 || Math.hypot(player.vx, player.vy) > 0.03 ||
         camSettle > 0.8 || bakeQueue.length > 0 || !!camFly || !!player.tgt ||
         (!yahHold && yahT > 0) || spotA !== (spotOn ? 1 : 0) ||
         !!tp || !!rotFx || waveT > 0 || fadeCount > 0;
}
/* truly idle (non-reduced): time paused, camera at rest, no particles on
   screen, panel closed, nothing animating - park the rAF loop entirely */
function canPark() {
  return timeSpeed === 0 && panel.hidden && keysDown.size === 0 && !player.tgt &&
         Math.hypot(player.vx, player.vy) < 0.03 && camSettle < 0.5 && !camFly &&
         parts.length === 0 && bakeQueue.length === 0 && !dragging &&
         yahT <= 0 && !yahHold && spotA === (spotOn ? 1 : 0) &&
         !tp && !rotFx && waveT <= 0 && fadeCount === 0 &&
         seasonBlend >= 1 && rainI === rainTarget;
}
function tick(dt) {
  if (!REDUCED) {
    dayT += timeSpeed * dt / DAY_LEN;
    if (dayT >= 1) { dayT -= 1; setSeason(season + 1); }   // the year turns: one season per day
    updateLife(dt);
    updateParts(dt, cam.x, cam.y, cam.x + cvs.width / cam.z, cam.y + cvs.height / cam.z);
  }
  lightFactors(dayT);
  stepRain(dt);
  stepRotFx(dt);
  stepTeleport(dt);
  if (waveT > 0) waveT = Math.max(0, waveT - dt);
  if (seasonBlend < 1) seasonBlend = Math.min(1, seasonBlend + dt / 2.5);
  stepFly(dt);
  updatePlayer(dt);
  sndUpdate();
  sndAmbient(dt);
  if (!yahHold && yahT > 0) yahT = Math.max(0, yahT - dt);
  const sT = spotOn ? 1 : 0;
  if (spotA !== sT) {
    spotA += (sT - spotA) * Math.min(1, 11 * dt);
    if (Math.abs(sT - spotA) < 0.02) spotA = sT;
  }
  processBakeQueue(2.5);
  updateHudDials();
}
function frame(ts) {
  const dt = Math.min(0.05, Math.max(0, (ts - lastTick) / 1000) || 0.016);
  lastTick = ts;
  lastDt = dt;
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
  diag.orient = orient;
  diag.rain = rainI;
  diag.soundOn = sndOn;
  diag.soundUnlocked = !!AC;
  diag.soundBuffers = Object.keys(sndBufs).length;
  if (REDUCED ? motionActive() : !canPark()) requestAnimationFrame(frame);
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
  if (!REDUCED) startLoop();
  camMode = 'free';                 // mouse pan suspends camera follow; a move key resumes it
  dragStart = { mx: e.clientX, my: e.clientY, cx: cam.x, cy: cam.y };
  cvs.classList.add('dragging');
  cvs.setPointerCapture(e.pointerId);
});
cvs.addEventListener('pointermove', (e) => {
  if (!REDUCED && !running) startLoop();
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
  // district spotlight: the hovered building's quarter, or the quarter under the pointer
  let hq = b ? b.quarter : null;
  if (!hq) {
    const [twx0, twy0] = pxToWorld(wx, wy);
    const tx = Math.floor(twx0), ty = Math.floor(twy0);
    if (tx >= 0 && ty >= 0 && tx < Wt && ty < Ht) {
      const qi = quarterOf[ty * Wt + tx];
      if (qi >= 0) hq = quarters.find(q2 => q2.id === qi) || null;
    }
  }
  setSpot(hq);
  if (b !== hoverB) {
    hoverB = b;
    cvs.classList.toggle('pointing', !!b);
    if (b) {
      const p = pagesBySlug[b.slug];
      const hands = handsLine(PROV[b.slug]);
      bubble.innerHTML = `<span class="b-title"></span><span class="b-sub"></span>${hands ? '<span class="b-keeper"></span>' : ''}`;
      bubble.querySelector('.b-title').textContent = p.title || b.slug;
      bubble.querySelector('.b-sub').textContent = `${b.quarter.label} · ${b.words} words${b.code ? ' · ' + b.code + ' code blocks' : ''}`;
      if (hands) bubble.querySelector('.b-keeper').textContent = hands;
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
  const [tx, ty] = pxToWorld(wx, wy);
  for (const pg of pigeons) {
    if (Math.abs(pg.tx - tx) < 2 && Math.abs(pg.ty - ty) < 2 && pg.st === 'peck') {
      pg.st = 'fly'; pg.t = 2 + rng() * 2;
      const a = Math.atan2(pg.ty - ty, pg.tx - tx) + (rng() - 0.5);
      pg.vx = Math.cos(a) * 3.4; pg.vy = Math.sin(a) * 3.4; pg.alt = 0;
      sndEvent('wing_flap', pg.tx, pg.ty, 0.3);
    }
  }
  // click-to-walk: clicking open ground sends the courier there (shift-click = stride there)
  if (panel.hidden && playerWalkable(tileAt(Math.floor(tx), Math.floor(ty)))) {
    player.tgt = { x: tx, y: ty, stride: e.shiftKey };
    player.tgtStall = 0;
    camFly = null;
    camMode = 'follow';
    if (!introEl.hidden) endIntro(false);
    dismissYah(true);
    startLoop();
  }
});
/* GENTLE ZOOM: one integer level per gesture. Wheel deltas accumulate to a
   threshold, fire once, then wait for the gesture to end (a quiet spell) so a
   trackpad flick never rockets through levels. Pinch (ctrlKey) fires sooner. */
let wheelAcc = 0, wheelFired = false, wheelTimer = null;
cvs.addEventListener('wheel', (e) => {
  e.preventDefault();
  const th = e.ctrlKey ? 22 : 70;
  wheelAcc += e.deltaY;
  if (!wheelFired && Math.abs(wheelAcc) >= th) {
    zoomStep(wheelAcc < 0 ? 1 : -1, e.clientX, e.clientY);
    wheelFired = true;
  }
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => { wheelAcc = 0; wheelFired = false; }, 230);
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
  if (REDUCED) draw(); else startLoop();
}
document.getElementById('zin').onclick = () => zoomStep(1);
document.getElementById('zout').onclick = () => zoomStep(-1);
document.getElementById('zfit').onclick = () => { fitZoom(); if (REDUCED) draw(); else startLoop(); };
window.addEventListener('resize', () => { resize(); if (REDUCED) draw(); });

/* ==========================================================================
   ROUTER + READING PANEL
   ========================================================================== */
const panel = document.getElementById('panel');
const panelContent = document.getElementById('panel-content');

function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* the plaque names every hand: keeper first, then the other real authors
   from provenance (capped on the hover plaque; the reading panel lists all) */
function handsLine(prov, full) {
  if (!prov || !prov.topAuthor) return '';
  const keeper = prov.topAuthor;
  const others = (prov.authors || []).filter(a => a && a !== keeper);
  if (!others.length) return 'kept by ' + keeper;
  if (full) return 'kept by ' + keeper + ' · with ' + others.join(', ');
  const shown = others.slice(0, 2);
  const more = others.length - shown.length;
  return 'kept by ' + keeper + ' · with ' + shown.join(', ') + (more > 0 ? ' + ' + more + ' more' : '');
}

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
    `${(page.product || '').toUpperCase()} / ${page.section || (b ? b.quarter.label : '')}`;
  const hands = handsLine(PROV[slug], true);
  const meta = [];
  if (b) meta.push(`${b.words.toLocaleString('en-US')} words`);
  if (b && b.code) meta.push(`${b.code} code block${b.code > 1 ? 's' : ''}`);
  if (b && b.inb) meta.push(`cited by ${b.inb} page${b.inb > 1 ? 's' : ''}`);
  if (hands) meta.push(`<span class="keeper">${esc(hands)}</span>`);
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
  if (!REDUCED) startLoop();
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
  sndPlay('door_open', 0.32, 0);
  // centre camera on the building, unless the courier walked here themselves;
  // clicking from afar also TELEPORTS the courier to this building's door
  if (b) {
    const walkedHere = Math.hypot(player.x - (b.tx + 0.3), player.y - (b.ty + b.fd + 0.5)) < 4;
    if (!walkedHere) {
      camMode = 'free';
      const wx = isoX(b.tx + b.fw / 2, b.ty + b.fd / 2), wy = isoY(b.tx + b.fw / 2, b.ty + b.fd / 2);
      cam.x = Math.round(wx - (cvs.width * 0.35) / cam.z);
      cam.y = Math.round(wy - cvs.height / (2 * cam.z));
    }
    teleportTo(slug);     // beams the courier to this door (no-op if already there)
    if (REDUCED) draw();
  }
}
function closePanel() {
  panel.hidden = true;
  document.title = 'Pixel Docs City';
  if (!REDUCED) startLoop();
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
  stride = e.shiftKey;              // Shift stride, tracked on every key event
  if (e.target && e.target.closest && e.target.closest('input, textarea')) return;
  if (!panel.hidden) {
    // the reading panel needs the vertical keys: hand them to it
    if (e.code === 'ArrowDown') { panel.scrollBy(0, 90); e.preventDefault(); }
    else if (e.code === 'ArrowUp') { panel.scrollBy(0, -90); e.preventDefault(); }
    else if (e.code === 'Space') { panel.scrollBy(0, Math.round(panel.clientHeight * 0.85)); e.preventDefault(); }
    else if (e.key === 'x' || e.key === 'X') {
      // X closes the reading panel (owner order); layout-independent via e.key
      if (location.hash && location.hash !== '#/') location.hash = '#/';
      else closePanel();
      e.preventDefault();
    }
    return;
  }
  if (KEYMAP[e.code]) {
    keysDown.add(KEYMAP[e.code]);
    camMode = 'follow';             // any move key hands the camera back to the courier
    camFly = null;                  // and cancels any camera flight
    player.tgt = null;
    setSpot(null);                  // walking clears the hover spotlight
    if (!introEl.hidden) endIntro(false);   // movement dismisses the intro prompt
    dismissYah(true);
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
  if (e.code === 'KeyF') { findMe(); return; }   // fly back to the courier, any time
  // rotate the map a quarter turn (Q/E by letter, or their physical spots)
  if (e.key === 'q' || e.key === 'Q' || e.code === 'KeyQ') { setOrient(orient + 3); return; }
  if (e.key === 'e' || e.key === 'E' || e.code === 'KeyE') { setOrient(orient + 1); return; }
  // one integer zoom level per press, layout-independent (AZERTY-safe via e.key)
  if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') { zoomStep(1); e.preventDefault(); return; }
  if (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract') { zoomStep(-1); e.preventDefault(); return; }
});
document.addEventListener('keyup', (e) => {
  stride = e.shiftKey;
  if (KEYMAP[e.code]) keysDown.delete(KEYMAP[e.code]);
});
window.addEventListener('blur', () => { keysDown.clear(); stride = false; });

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
  // districts first: hovering an entry spotlights it on the map, clicking flies there
  html += '<h3>Districts</h3>';
  for (const q of quarters) {
    html += `<button type="button" class="d-district" data-q="${q.id}">` +
            `<span class="dd-dot" style="background:${q.theme}"></span>${esc(q.label)}` +
            `<span class="dd-n">${q.members.length}</span></button>`;
  }
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
  document.getElementById('drawer-close').onclick = () => { drawer.hidden = true; setSpot(null); };
  body.addEventListener('click', (e) => { if (e.target.closest('a')) drawer.hidden = true; });
  body.querySelectorAll('.d-district').forEach(el2 => {
    const q = quarters.find(q2 => q2.id === +el2.dataset.q);
    if (!q) return;
    el2.addEventListener('mouseenter', () => setSpot(q));
    el2.addEventListener('mouseleave', () => setSpot(null));
    el2.addEventListener('click', () => {
      drawer.hidden = true;
      setSpot(q);
      startFly(isoX(q.qx + q.qw / 2, q.qy + q.qh / 2), isoY(q.qx + q.qw / 2, q.qy + q.qh / 2), 3, null);
    });
  });
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
      <li><strong>Each district builds in its own language</strong>, taken from what its pages document (see DISTRICTS below). Inside a district, a page's kind still shows: sawtooth roofs are tutorials, scaffolding marks migration pages under renovation, tiny kiosks are stubs, a rooftop flag or a dome crowns heavily-cited pages, and billboards name the four most-cited of all.</li>
      <li><strong>No two neighbouring buildings are ever identical:</strong> every lot draws a seeded facade archetype, block corners get quoin chains, and each district hub wears an accent cornice and a spire.</li>
      <li><strong>Boarded-up shopfronts</strong> with a for-lease board are the ${uncitedSet.size} pages no other page links to. The cats like them.</li>
      <li><strong>Rooftop billboards</strong> mark the four most-cited pages: ${hubTitles.map(esc).join(', ')}.</li>
    </ul>
    <h3>DISTRICTS</h3>
    <ul>
      ${Object.keys(LANG_BLURB).filter(k => quarters.some(q => q.lang === k)).map(k =>
        `<li><strong>${quarters.filter(q => q.lang === k).map(q => esc(q.label)).join(', ')}</strong>: ${LANG_BLURB[k]}.</li>`).join('')}
    </ul>
    <h3>THE MAP</h3>
    <ul>
      <li>The ${quarters.length - 1} city quarters are citation communities: pages that cite each other share a block, and quarters that cite each other were placed as neighbours. The small back lane holds the ${quarters[quarters.length - 1].members.length} pages outside the main navigation.</li>
      <li><span class="swatch" style="background:${PAL.W2}"></span><strong>The canals</strong> trace the suggested reading order: follow the water from the north-west and you pass the quarters in the order the docs recommend reading them. A boat makes the trip.</li>
      <li><strong>Street traffic</strong> is scaled from the ${edgeCount.toLocaleString('en-US')} cross-references between pages; streets around heavily-cited quarters carry more cars.</li>
    </ul>
    <h3>GETTING AROUND</h3>
    <ul>
      <li>Drag to pan, scroll or +/− to zoom: one whole-pixel step per gesture, laptop-trackpad friendly.</li>
      <li><strong>Turn the town:</strong> Q and E (or the \u21BA \u21BB buttons) rotate the map a quarter turn to see behind any row. Buildings hiding the courier turn see-through on their own.</li>
      <li>Hover any building to read its plaque: every hand that wrote the page, keeper first.</li>
      <li>Click a building to read the full page - and the courier beams to its door in a sparkle of pixels. Close the page with \u2715, Escape or X.</li>
      <li><strong>Or walk it:</strong> every arrow key / WASD follows one street as drawn on screen (\u2192 walks the down-right avenue, \u2191 the up-right one); hold two neighbouring keys to cut between them. Hold Shift to stride. Click any open ground to send the courier there (shift-click strides). Walk up to a door and press Enter to step in and read - every door is walkable from the spawn plaza, proven at boot.</li>
      <li><strong>Never lost:</strong> press F or the \u25CE Find me button to fly back to the courier with a YOU ARE HERE marker - they wave back; at the widest zoom a violet ring marks them at all times. Hover any district (or its entry in the Districts drawer) to spotlight it; district names label the map at wider zooms.</li>
      <li><strong>The town keeps time:</strong> a full day lasts about 4 minutes and each day turns the season. Click the clock (or press T) for 1x / 8x / paused; click the season glyph (or press Y) to skip ahead. At night the windows come on street by street; spring and autumn bring passing showers with puddle glints on the streets.</li>
      <li><strong>And it sounds real:</strong> footsteps by ground, doors, pigeons, the cat, birds by day, crickets by night, rain on the rooftops - genuine CC0 / public-domain recordings, bundled locally (sources in sfx/CREDITS.txt). The ♪ button mutes everything and remembers your choice.</li>
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

  // strip source suffixes like " - Strapi Developer Docs" from every title
  const SUFFIX_RE = /\s*[|\u2013\u2014-]\s*Strapi\s+(5\s+)?(Developer\s+|Cloud\s+)?Doc(s|umentation)\b.*$/i;
  for (const pg2 of Object.values(DATA.pages)) {
    if (pg2.title) pg2.title = pg2.title.replace(SUFFIX_RE, '').trim();
    if (pg2.sidebarLabel) pg2.sidebarLabel = pg2.sidebarLabel.replace(SUFFIX_RE, '').trim();
  }

  resize();
  buildModel();
  Wv = Wt; Hv = Ht;
  bakeAtlas();
  bakeWater();
  bakeGrounds();
  placeStatics();
  initPlayerSpawn();
  // BREATHING ROOM + EVERY DOOR ON FOOT: prove all doors walkable from spawn,
  // repairing placement if any prop walled a lane off; assert at boot.
  const reach = fixReachability();
  diag.doorsReachable = reach.reachable;
  diag.doorsTotal = reach.total;
  if (reach.stranded.length) {
    console.error('PDC walkability: ' + reach.stranded.length + ' doors unreachable after repair', reach.stranded.slice(0, 10));
    if (DEVFLAG) throw new Error('walkability assertion failed: ' + reach.stranded.length + ' stranded doors');
  }
  projectStatics();
  bakeQuarterLabels();
  bakeShadows();
  initStars();
  initLife();
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
    setPlayer(x, y) { player.x = x; player.y = y; player.vx = player.vy = 0; camMode = 'follow'; if (!REDUCED) startLoop(); },
    setClock(t2) { dayT = t2; lightFactors(dayT); lastDialStep = -1; },
    setSeason(i2) { setSeason(i2); },
    setZoom(z2) { cam.z = z2; },
    setSpeed(s2) { if (!REDUCED) { timeSpeed = s2; startLoop(); } },
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
      const wx = isoX(player.x, player.y), wy = isoY(player.x, player.y);
      return {
        l: (wx - 7 - cam.x) * cam.z / rdpr, r: (wx + 8 - cam.x) * cam.z / rdpr,
        t: (wy - 16 - cam.y) * cam.z / rdpr, b: (wy + 2 - cam.y) * cam.z / rdpr
      };
    },
    state: () => ({ water: waterCvs.length, grounds: groundSets.length, animT, seasonIdx: season, red: REDUCED }),
    flyActive: () => !!camFly,
    camState: () => ({ x: cam.x, y: cam.y, z: cam.z, mode: camMode }),
    yah: () => ({ t: yahT, hold: yahHold, hidden: yahEl.hidden }),
    spot: () => ({ on: spotOn, a: spotA, q: spotQ ? spotQ.label : null }),
    parked: () => !running,
    timeSpeed: () => timeSpeed,
    clickTarget: () => player.tgt ? { x: player.tgt.x, y: player.tgt.y } : null,
    quartersInfo: () => quarters.map(q => ({ label: q.label, lang: q.lang, qx: q.qx, qy: q.qy, qw: q.qw, qh: q.qh, n: q.members.length, topH: q.topH })),
    startIntroFlow: () => startIntro(),
    adjacentIdentical: () => {   // the no-identical-neighbours gate, measured on baked pixels
      let pairs = 0, same = [];
      for (const q of quarters) {
        const bs = buildings.filter(bb => bb.quarter === q);
        for (let i = 0; i < bs.length; i++) for (let j = 0; j < i; j++) {
          const a = bs[i], c = bs[j];
          if (a.tx + a.fw + 1 < c.tx || c.tx + c.fw + 1 < a.tx || a.ty + a.fd + 1 < c.ty || c.ty + c.fd + 1 < a.ty) continue;
          pairs++;
          if (a.cv.width === c.cv.width && a.cv.height === c.cv.height && a.cv.toDataURL() === c.cv.toDataURL()) same.push([a.slug, c.slug]);
        }
      }
      return { pairs, same };
    },
    slugs: () => ORDER.slice(),
    /* wave 3 test surface */
    walkBFS: () => { const r = walkBFS(); return { total: r.total, reachable: r.reachable, stranded: r.stranded }; },
    setOrient: (o2) => setOrient(o2),
    getOrient: () => orient,
    rotBusy: () => !!rotFx,
    setRain: (v) => { rainOn = v > 0; rainTarget = v; rainFrom = v; rainU = 1; rainI = v; rainTimer = 9999; startLoop(); },
    rain: () => rainI,
    teleport: (slug2) => teleportTo(slug2),
    tpState: () => (tp ? { phase: tp.phase, t: tp.t } : (tpHeld ? { phase: 'held' } : null)),
    waveState: () => waveT,
    strideState: () => stride,
    sndState: () => ({ on: sndOn, unlocked: !!AC, ready: sndReady, buffers: Object.keys(sndBufs).length, loops: Object.keys(sndLoops).length }),
    sndLoopGains: () => { const o2 = {}; for (const k in sndLoops) o2[k] = sndLoops[k].g.gain.value; return o2; },
    sndLog: () => sndLog.slice(),
    sndForce: (n2) => sndPlay(n2, 0.2, 0),
    fades: () => statics.filter(s2 => s2.fadeA !== undefined && s2.fadeA < 0.95).map(s2 => (s2.b ? s2.b.slug : s2.name)),
    fadeCount: () => fadeCount,
    doorWorld: (slug2) => { const d2 = doors.find(dd => dd.slug === slug2); return d2 ? { wx: d2.wx, wy: d2.wy, px: d2.px, py: d2.py } : null; },
    seasonBlendState: () => ({ blend: seasonBlend, prev: seasonPrev }),
    lightAt: (t3) => { const keep = [nf, gf]; lightFactors(t3); const r2 = { nf, gf }; nf = keep[0]; gf = keep[1]; return r2; },
    setStride: (v2) => { stride = !!v2; },
    puddles: () => puddlePts.length,
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
