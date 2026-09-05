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
let snapWaiting = false;         // a postcard requested mid-turn, taken once it lands
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
  bakeSprite('aboard', 7, 9, (g) => {       // sandwich board out on the pavement -
    // redrawn as a shop's chalkboard (owner order: no white card, no banded
    // header, nothing that could pass for an interface panel at night): a
    // wooden A-frame around a dark slate face with two broken chalk scribbles
    px(g, 1, 1, 5, 6, PAL.WD2); px(g, 1, 1, 5, 1, PAL.WD3);
    px(g, 2, 2, 3, 4, '#2c3833');
    px(g, 2, 3, 2, 1, '#c9d2c0'); px(g, 3, 5, 1, 1, '#c9d2c0');
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
    } else if (pr.kind === 'landmark') {
      // a 2x2 civic block: anchor its footprint like a building
      const cv2 = SPR[pr.name];
      const r = viewRectOf(pr.tx, pr.ty, pr.w, pr.d);
      const gTopX = OX + (r.x - r.y) * HW, gTopY = OY + (r.x + r.y) * HH;
      const st = {
        cv: cv2, name: pr.name,
        wx: Math.round(gTopX - HW * 2), wy: Math.round(gTopY - cv2.anchorY),
        depth: (r.x + r.w - 1) + (r.y + r.h - 1) + 0.6
      };
      statics.push(st); pr.st = st;
    } else if (pr.kind === 'newsstand') {
      const cv2 = SPR.newsstand;
      const st = {
        cv: cv2, name: 'newsstand',
        wx: Math.round(isoX(pr.tx + 0.5, pr.ty + 0.5)) - (cv2.width >> 1),
        wy: Math.round(isoY(pr.tx + 0.5, pr.ty + 0.5)) - cv2.height + 2,
        depth: depthTile(pr.tx, pr.ty, 0.3)
      };
      statics.push(st); pr.st = st;
    } else if (pr.kind === 'plaque') {
      const nm2 = plaqueEarned ? 'plaque_lit' : 'plaque_dark';
      const cv2 = SPR[nm2];
      const st = {
        cv: cv2, name: nm2,
        wx: Math.round(isoX(pr.tx + 0.5, pr.ty + 0.5)) - (cv2.width >> 1),
        wy: Math.round(isoY(pr.tx + 0.5, pr.ty + 0.5)) - cv2.height + 2,
        depth: depthTile(pr.tx, pr.ty, 0.3)
      };
      statics.push(st); pr.st = st;
    } else if (pr.kind === 'vacant') {
      const cv2 = SPR.vacantlot;
      const st = {
        cv: cv2, name: 'vacantlot',
        wx: Math.round(isoX(pr.tx + 0.5, pr.ty + 0.5)) - (cv2.width >> 1) + (pr.dx || 0),
        wy: Math.round(isoY(pr.tx + 0.5, pr.ty + 0.5)) - cv2.height + 3,
        depth: depthTile(pr.tx, pr.ty, 0.35)
      };
      statics.push(st); pr.st = st;
    } else if (pr.kind === 'vessel') {
      // a moored vessel rides on its sea tile, hull settled into the water
      const cv2 = SPR[pr.name];
      const st = {
        cv: cv2, name: pr.name,
        wx: Math.round(isoX(pr.tx + 0.5, pr.ty + 0.5)) - (cv2.width >> 1),
        wy: Math.round(isoY(pr.tx + 0.5, pr.ty + 0.5)) - cv2.height + 6,
        depth: depthTile(pr.tx, pr.ty, 0.4)
      };
      statics.push(st); pr.st = st;
    } else if (pr.kind === 'observatory' || pr.kind === 'trailgate' || pr.kind === 'botanist') {
      const nm2 = { observatory: 'observatory', trailgate: 'fingerpost', botanist: 'botaniststall' }[pr.kind];
      const cv2 = SPR[nm2];
      const st = {
        cv: cv2, name: nm2,
        wx: Math.round(isoX(pr.tx + 0.5, pr.ty + 0.5)) - (cv2.width >> 1),
        wy: Math.round(isoY(pr.tx + 0.5, pr.ty + 0.5)) - cv2.height + 3,
        depth: depthTile(pr.tx, pr.ty, 0.3)
      };
      statics.push(st); pr.st = st;
    } else if (pr.kind === 'board') {
      // a small noticeboard standing on the ground beside the door, always to
      // the screen-right of it so it reads the same at every orientation
      const d2 = doorBySlug[pr.slug];
      if (d2) {
        const off = viewDirToWorld(0.52, -0.12);
        const bx2 = d2.px + off[0], by2 = d2.py + off[1];
        const nm2 = notesPinned.has(pr.slug) ? 'doorboard_pin' : 'doorboard';
        const cv2 = SPR[nm2];
        const st = {
          cv: cv2, name: nm2,
          wx: Math.round(isoX(bx2, by2)) - (cv2.width >> 1),
          wy: Math.round(isoY(bx2, by2)) - cv2.height + 3,
          depth: depthOf(bx2, by2) - 0.45
        };
        statics.push(st); pr.st = st;
      } else pr.st = null;
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
  projectTown();
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
  // the anonymous extras are NOT built here any more: the 77 named hands are the
  // population, and rebuildExtras() tops the leftover ground up behind them
  // (called from refreshFolk, which has already run by the time we get here).
  rebuildExtras();
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
  const extraTile = (nx, ny) => nx >= 0 && ny >= 0 && nx < Wt && ny < Ht &&
    walkableP(tileAt(nx, ny)) && (!extraOK || extraOK[ny * Wt + nx] === 1);
  for (const p of peds) {
    stepEntityGrid(p, extraTile, 2.2, pedDt, null);
  }
  stepFolk(dt);   // the named hands pace their own block
  // cars: lane rules + yields
  const carYield = (c) => {
    // next tile is a crossing with a ped on/near it?
    const key = c.nx + ',' + c.ny;
    if (crossTiles.has(key)) {
      for (const p of peds) {
        if (Math.abs(p.x - (c.nx + 0.5)) < 1.1 && Math.abs(p.y - (c.ny + 0.5)) < 1.1) return true;
      }
      for (const f of folkVisible) {   // a named hand is a person too
        if (Math.abs(f.x - (c.nx + 0.5)) < 1.1 && Math.abs(f.y - (c.ny + 0.5)) < 1.1) return true;
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
      if (!danger) for (const f of folkVisible) if (Math.abs(f.x - pg.tx) < 1.4 && Math.abs(f.y - pg.ty) < 1.4) { danger = true; break; }
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
let spawnTile = [0, 0];          // the plaza tile the visitor lands on
let plazaCore = null;            // {cx, cy, r} - the civic square carved at boot

/* THE MAIN PLAZA. The visitor used to land on a stray patch of plaza paving
   wedged between two shopfronts, and the first step in any direction met a
   wall. A town square is not a texture: it is room. So before the ground is
   baked we look for the widest block of ground that is ALREADY walkable and
   whose four streets run clear, repave it as one square, and land the courier
   in the middle of it. No lot is moved, no collision is loosened and no door
   is displaced - the square is simply where the town already left room. */
function carvePlaza() {
  const at = (tx, ty) => (tx < 0 || ty < 0 || tx >= Wt || ty >= Ht) ? T.SEA : grid[ty * Wt + tx];
  const runFrom = (tx, ty, dx, dy) => { let n = 0; while (playerWalkable(at(tx + dx * (n + 1), ty + dy * (n + 1)))) n++; return n; };
  const cxT = Wt / 2, cyT = Ht / 2;
  let best = null;
  for (const R of [5, 4, 3]) {
    for (let ty = R + 1; ty < Ht - R - 1; ty++) for (let tx = R + 1; tx < Wt - R - 1; tx++) {
      let ok = true;
      for (let dy = -R; dy <= R && ok; dy++) for (let dx = -R; dx <= R && ok; dx++) {
        if (!playerWalkable(at(tx + dx, ty + dy))) ok = false;
      }
      if (!ok) continue;
      const runs = [runFrom(tx, ty, 1, 0), runFrom(tx, ty, -1, 0), runFrom(tx, ty, 0, 1), runFrom(tx, ty, 0, -1)];
      const mn = Math.min(runs[0], runs[1], runs[2], runs[3]);
      if (mn < 9) continue;                                  // every street must run clear
      const score = mn * 2 - Math.hypot(tx - cxT, ty - cyT) * 3;  // the middle of the island first, then wide streets
      if (!best || score > best.score) best = { cx: tx, cy: ty, r: R, mn, runs, score };
    }
    if (best) break;                                          // the widest square wins
  }
  if (!best) return;
  plazaCore = { cx: best.cx, cy: best.cy, r: best.r };
  const R = best.r;
  let paved = 0;
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    if (Math.abs(dx) + Math.abs(dy) > Math.round(R * 1.5)) continue;   // chamfered corners: a square, not a box
    const tx = best.cx + dx, ty = best.cy + dy;
    const t2 = grid[ty * Wt + tx];
    if (t2 === T.BRIDGE || t2 === T.BANK) continue;           // the crossings keep their own stone
    grid[ty * Wt + tx] = T.PLAZA;
    paved++;
  }
  plazaCore.tiles = paved;
  diag.plaza = { cx: best.cx, cy: best.cy, r: R, tiles: paved, runs: best.runs };
}

/* Props are scattered after the ground is baked, so the square is swept once
   they are down: nothing stands inside it, and the four streets leaving it
   keep a clear lane for the first strides out of town. */
const PLAZA_ARM = 8;             // tiles of clear street beyond the square
function inPlazaSweep(tx, ty) {
  if (!plazaCore) return false;
  const { cx, cy, r } = plazaCore;
  const dx = Math.abs(tx - cx), dy = Math.abs(ty - cy);
  if (dx <= r && dy <= r) return true;                       // the square itself
  return (dy === 0 && dx <= r + PLAZA_ARM) || (dx === 0 && dy <= r + PLAZA_ARM);  // the four street arms
}
function clearPlazaProps() {
  if (!plazaCore) return 0;
  const { cx, cy, r } = plazaCore;
  let n = 0;
  for (let i = propList.length - 1; i >= 0; i--) {
    const pr = propList[i];
    if (pr.tx === undefined) continue;
    if (!inPlazaSweep(pr.tx, pr.ty)) continue;
    propList.splice(i, 1); n++;
  }
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) propSolid.delete((cx + dx) + ',' + (cy + dy));
  for (let k = 1; k <= r + PLAZA_ARM; k++) {
    propSolid.delete((cx + k) + ',' + cy); propSolid.delete((cx - k) + ',' + cy);
    propSolid.delete(cx + ',' + (cy + k)); propSolid.delete(cx + ',' + (cy - k));
  }
  return n;
}

/* QUICK START FIRST (owner law). The first page a stranger is led to meet is
   the Quick Start Guide - never forced, invited: the courier lands on the
   plaza's edge nearest that building, facing it, its door gently lit, and the
   first floating prompt reads ENTER · READ THE QUICK START GUIDE in the same
   door grammar every door uses. The invitation yields to normal play the
   moment the courier walks elsewhere. */
const QS_SLUG = '/cms/quick-start';
let qsInvite = false;            // the opening gesture is still standing
let qsDoorRef = null;            // the Quick Start Guide's door (world px kept fresh per orientation)
function retireQsInvite() { qsInvite = false; }

/* the spawn plaza room law, measured with the exact predicate the regression
   battery uses: the tile is open, at least 6 walkable tiles run down all four
   streets, and at least 55% of the 10-tile disc is open ground. Every candidate
   landing spot - and every later solid claim, via trialSolid - answers to it. */
function spawnRoomOK(tx, ty, minShare) {
  const walk = (x, y) => {
    if (x < 0 || y < 0 || x >= Wt || y >= Ht) return false;
    const t2 = grid[y * Wt + x];
    const w = (t2 === T.PAVE || t2 === T.PLAZA || t2 === T.BANK || t2 === T.CROSS ||
               t2 === T.BRIDGE || t2 === T.GRASS || t2 === T.FLOWER || t2 === T.ROAD);
    return w && !propSolid.has(x + ',' + y);
  };
  if (!walk(tx, ty)) return false;
  const run = (dx, dy) => { let n = 0; while (n < 60 && walk(tx + dx * (n + 1), ty + dy * (n + 1))) n++; return n; };
  if (run(1, 0) < 6 || run(-1, 0) < 6 || run(0, 1) < 6 || run(0, -1) < 6) return false;
  let inR = 0, openR = 0;
  for (let dy = -10; dy <= 10; dy++) for (let dx = -10; dx <= 10; dx++) {
    if (Math.hypot(dx, dy) > 10) continue;
    inR++;
    if (walk(tx + dx, ty + dy)) openR++;
  }
  return openR / inR >= (minShare === undefined ? 0.55 : minShare);
}

function initPlayerSpawn() {
  const qs = doors.find((d) => d.slug === QS_SLUG) || null;
  qsDoorRef = qs;
  if (plazaCore) {
    /* the plaza edge nearest the Quick Start Guide, ring by ring: only paved
       plaza tiles that keep the room law with headroom (58% first, so the
       civic stone placed later never squeezes the disc under the 55% gate),
       then the bare law, then inward, then the middle as the last word. */
    let pick = null;
    if (qs) {
      const { cx, cy, r } = plazaCore;
      const cham = Math.round(r * 1.5);
      outer:
      for (const share of [0.58, 0.55]) {
        for (let ring = r; ring >= 1; ring--) {
          let best = null, bd = Infinity;
          for (let dy = -ring; dy <= ring; dy++) for (let dx = -ring; dx <= ring; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
            if (Math.abs(dx) + Math.abs(dy) > cham) continue;       // stay on the paved square
            const tx = cx + dx, ty = cy + dy;
            if (grid[ty * Wt + tx] !== T.PLAZA) continue;
            if (!spawnRoomOK(tx, ty, share)) continue;
            const d2 = Math.hypot(tx + 0.5 - qs.px, ty + 0.5 - qs.py);
            if (d2 < bd) { bd = d2; best = [tx, ty]; }
          }
          if (best) { pick = best; break outer; }
        }
      }
    }
    if (!pick) pick = [plazaCore.cx, plazaCore.cy];
    spawnTile = pick.slice();
    player.x = pick[0] + 0.5;
    player.y = pick[1] + 0.5;
    if (qs) player.face = faceFromWorldDir(qs.px - player.x, qs.py - player.y);   // facing the Guide
    return;
  }
  // fallback: the plaza tile nearest the centre of the island whose
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
  spawnTile = best.slice();
  player.x = best[0] + 0.5;
  player.y = best[1] + 0.5;
  if (qs) player.face = faceFromWorldDir(qs.px - player.x, qs.py - player.y);   // still facing the Guide
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
  updatePromptRows();
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
  // and none below street zoom, where it would float over the fit view).
  // While the Quick Start invitation is standing it holds the floor alone:
  // no door or spot arms under it, and it yields the moment the courier
  // walks off the landing tile.
  if (qsInvite && (Math.floor(player.x) !== spawnTile[0] || Math.floor(player.y) !== spawnTile[1])) retireQsInvite();
  let best = null, bd2 = 0.9;
  if (panel.hidden && cam.z >= 3 && !qsInvite) {
    for (const d of doors) {
      const dd = Math.hypot(player.x - d.px, player.y - d.py);
      if (dd < bd2) { bd2 = dd; best = d; }
    }
  }
  setActiveDoor(best);
  updateSpotProximity();
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
  if (rotFx.t >= rotFx.dur) {
    rotFx = null;
    if (photoMode) photoSay('now facing ' + FACING[orient], 1.8);
    // a postcard asked for mid-turn waits for the shutter to lift: take it on
    // the frame after this one, so the card holds the clean, turned town
    if (snapWaiting) { snapWaiting = false; requestAnimationFrame(() => snapPostcard()); }
  }
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
  if (qsInvite) {
    // QUICK START FIRST: with the invitation still standing, the YOU ARE HERE
    // echo steps aside quickly (at once under reduced motion, where a held
    // marker would keep the floor forever) so the opening gesture is the
    // first floating prompt the stranger meets
    yahHold = false;
    yahT = REDUCED ? 0 : 1.2;
  }
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
    else if (p.type === 'fw') { p.wx += p.vx * dt; p.wy += p.vy * dt; p.vy += 15 * dt; }
    else if (p.type === 'fly') { p.wx += (p.vx + Math.sin(p.t * 2.4 + p.ph) * 3) * dt; p.wy += p.vy * dt; }
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
  wind_winter: 1, van_putter: 1
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
      .then(buf => { sndBufs[k] = k === 'rain_loop' ? sndSeamLoop(buf, 2.5, 21.5, 2.0) : buf; })
      .catch(() => { })
  )).then(() => { sndReady = true; sndStartLoops(); });
}
/* THE RAIN LASTS AS LONG AS THE RAIN (owner order, 2026-09-05, r15). The
   shipped rain_loop.ogg has ~2 s fades at both edges, so looping it raw sank
   the bed to near-silence every 24 s. This cuts the faded edges ([a,b] in
   seconds) and blends the tail into the head with an equal-power crossfade
   (xf seconds), returning a buffer whose wrap is continuous rain - a loop
   with no seam, sustained for as long as the shower holds. */
function sndSeamLoop(buf, a, b, xf) {
  try {
    const sr = buf.sampleRate;
    const s0 = Math.floor(a * sr), s1 = Math.min(buf.length, Math.floor(b * sr));
    const N = s1 - s0, XF = Math.min(Math.floor(xf * sr), N >> 1);
    const M = N - XF;
    if (M < sr) return buf;                    // nothing sensible to cut: keep the original
    const out = AC.createBuffer(buf.numberOfChannels, M, sr);
    for (let ch = 0; ch < buf.numberOfChannels; ch++) {
      const src2 = buf.getChannelData(ch), dst = out.getChannelData(ch);
      for (let i = 0; i < M; i++) dst[i] = src2[s0 + i];
      // the first XF samples morph from the region's tail into its head, so
      // dst[M-1] -> dst[0] plays R[M-1] -> R[M]: original, contiguous rain
      for (let i = 0; i < XF; i++) {
        const t = i / XF, wIn = Math.sin(t * Math.PI / 2), wOut = Math.cos(t * Math.PI / 2);
        dst[i] = src2[s0 + i] * wIn + src2[s0 + M + i] * wOut;
      }
    }
    return out;
  } catch (err) { return buf; }
}
window.addEventListener('pointerdown', sndUnlock);
window.addEventListener('keydown', sndUnlock);
/* the continuous beds: town room tone, birds by day, crickets by night,
   rain and winter wind, the nearest van's putter. The street lamps glow
   after dark but make no sound at all (owner order, 2026-09-05: the hum
   was annoying - the night keeps its light and loses the noise). */
const SND_LOOPDEFS = { room: 'room_tone', birds: 'birds_day', crickets: 'crickets_night', rain: 'rain_loop', wind: 'wind_winter', van: 'van_putter' };
function sndStartLoops() {
  for (const k of Object.keys(SND_LOOPDEFS)) {
    const buf = sndBufs[SND_LOOPDEFS[k]];
    if (!buf) continue;
    const src = AC.createBufferSource();
    src.buffer = buf; src.loop = true;
    const g = AC.createGain(); g.gain.value = 0;
    src.connect(g);
    let tail = g, p = null;
    if (k === 'van' && AC.createStereoPanner) { p = AC.createStereoPanner(); g.connect(p); tail = p; }
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
  sndLog.push({ n: name, t: Math.round(now), g: Math.round(clamp(vol, 0, 0.6) * 1000) / 1000 });   // g: the level it actually played at, so the mix is measurable
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
  // HALVED AGAIN (owner, 2026-09-05, r15: 0.085/0.06 -> 0.0425/0.03; before
  // that 0.17/0.12): the courier walks the town, she does not stomp it. The
  // ground still picks the sample, the stride still sets the cadence and the
  // small pitch jitter stays - only the level moved.
  sndPlay(base + n, stride ? 0.0425 : 0.03, 0, 0.9 + Math.random() * 0.2);
}
/* THE ONE POSITIONAL LOOP - the van putter, and only when a real van is close.
   The street lamps are silent by owner order (2026-09-05): no proximity sound
   from a lamp at all, day or night - their glow is the whole of their presence.
   The putter keeps its Schmitt trigger - in at IN, out only past OUT, so
   drifting across the line cannot make it flicker - it follows REAL vans only,
   and it rests after each pass so two vans in a row cannot merge into a drone. */
const POSLOOP = {
  van: { in: 4.5, out: 6.2, gain: 0.037 }     // was: audible from 9 tiles at 0.11, any car
};
const POS_VAN_REST = 6;                       // seconds of guaranteed silence after a pass
const posOn = { van: false };
let posHolder = null, posVanRest = 0, posVanHeld = 0;
/* eased loop gains, refreshed every tick */
function sndUpdate(dt) {
  if (!AC || !sndReady) return;
  const set = (k, v, pan, tc) => {
    const L2 = sndLoops[k];
    if (!L2) return;
    const target = clamp(v, 0, 0.6);
    // a loop asked for silence gets real silence: setTargetAtTime only ever
    // approaches zero, so once it is inaudible the value is pinned flat
    if (target === 0 && L2.g.gain.value < 0.0015) {
      L2.g.gain.cancelScheduledValues(AC.currentTime);
      L2.g.gain.setValueAtTime(0, AC.currentTime);
    } else {
      L2.g.gain.setTargetAtTime(target, AC.currentTime, tc || 0.5);
    }
    if (pan !== undefined && L2.p) L2.p.pan.setTargetAtTime(clamp(pan, -1, 1), AC.currentTime, 0.25);
  };

  const day = 1 - nf;
  set('room', 0.055 + 0.025 * day);
  set('birds', season === 3 ? 0.015 : 0.13 * day * (1 - rainI * 0.6));
  set('crickets', 0.11 * nf * (season === 3 ? 0.25 : 1) * (1 - rainI * 0.5));
  set('rain', 0.0945 * rainI);                // 45% of the old 0.21 (owner order, r15): rain heard, never suffered
  set('wind', season === 3 ? 0.15 : 0);

  /* --- how far is the nearest moving van (the lamps make no sound) --- */
  let vd = 99, vpan = 0;
  for (const c of cars) {
    if (c.stopped || !c.van) continue;         // the sample is a van putter, so only vans carry it
    const d = Math.hypot(c.x - player.x, c.y - player.y);
    if (d < vd) { vd = d; vpan = panOf(c.x, c.y); }
  }

  /* --- the trigger: in when close, out only when properly gone --- */
  const step = dt || 0;
  if (posVanRest > 0) posVanRest = Math.max(0, posVanRest - step);
  if (posOn.van) {
    posVanHeld += step;
    if (vd > POSLOOP.van.out) {
      posOn.van = false;
      posVanRest = posVanHeld > 1.5 ? POS_VAN_REST : 0;   // a real pass earns the rest
      posVanHeld = 0;
    }
  } else if (vd < POSLOOP.van.in && posVanRest <= 0) { posOn.van = true; posVanHeld = 0; }

  /* --- the one positional voice: the van holds the street only while it is
     genuinely near, and it still fades up gently and releases fast --- */
  posHolder = posOn.van ? 'van' : null;
  const vanG = posHolder === 'van' ? POSLOOP.van.gain * (1 - vd / POSLOOP.van.out) : 0;
  set('van', vanG, vpan, vanG > 0 ? 0.4 : 0.12);
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
/* THE TELEPORT ANNOUNCES ITSELF (owner order): any travel that is not walking
   - a building click, a search jump, a newsstand headline, a page named in a
   talk panel - says where it is going while it happens. One small pixel banner
   in the town's own type, raised as the teleport begins and gone shortly after
   arrival; it never stacks (one element, each trip replaces the last) and it
   counts as the one floating label while it shows. The title is always the
   destination page's true title. Reduced motion: same words, static, same
   stay. */
const tpBannerEl = document.getElementById('tpbanner');
let tpBannerTimer = 0;
function tpBannerUp() { return tpBannerEl && !tpBannerEl.hidden; }
function showTpBanner(slug) {
  if (!tpBannerEl) return;
  const pg = pagesBySlug[slug];
  const ttl = (pg && pg.title) || slug;
  tpBannerEl.innerHTML = 'TELEPORTING YOU TO <span class="tp-dest">' + esc(ttl) + '</span>';
  tpBannerEl.hidden = false;
  clearTimeout(tpBannerTimer);
  tpBannerTimer = setTimeout(() => {
    tpBannerEl.hidden = true;
    if (REDUCED) draw(); else startLoop();   // let whichever label waited come back
  }, 1500);                                  // out ~0.34s + in ~0.4s: gone ~0.75s after arrival
}
function teleportTo(slug) {
  const d = doors.find(dd => dd.slug === slug);
  if (!d) return;
  if (Math.hypot(player.x - d.px, player.y - d.py) < 1.2) return;   // already standing at the door
  showTpBanner(slug);
  camFly = null; player.tgt = null; keysDown.clear();
  if (REDUCED) {                       // instant reposition with a single held sparkle frame
    player.x = d.px; player.y = d.py; player.vx = player.vy = 0;
    player.face = faceFromWorldDir(0, -1);
    tpHeld = 1;
    camMode = 'follow';
    sndEvent('teleport_in', player.x, player.y, 0.167);      // a third of 0.50: a shimmer, not a whoosh
    requestDraw();
    return;
  }
  tp = { phase: 'out', t: 0, door: d };
  sndEvent('teleport_out', player.x, player.y, 0.183);       // a third of 0.55
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
    sndEvent('teleport_in', player.x, player.y, 0.183);      // a third of 0.55
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

  townDynInto(dyn);   // the townsfolk: the real hands, out near the pages they tend

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

  drawTownOver(vx0, vy0, vx1, vy1);   // night lanterns + founding-day pennants

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
  // QUICK START FIRST: while the invitation stands, the Guide's own door is
  // gently lit - a softer breath than the walk-up glow, calm under reduced motion
  if (qsInvite && qsDoorRef && qsDoorRef !== activeDoor) {
    const pulq = REDUCED ? 0.45 : 0.36 + 0.14 * Math.sin(animT * 2.2);
    ctx.globalAlpha = pulq;
    ctx.drawImage(SPR.doorglow, Math.round(qsDoorRef.wx - 9), Math.round(qsDoorRef.wy - 9));
    ctx.globalAlpha = pulq * 0.5;
    ctx.drawImage(SPR.doorglow, Math.round(qsDoorRef.wx - 13), Math.round(qsDoorRef.wy - 12), 27, 21);
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
      else if (p.type === 'fw') { c = p.col || PAL.YL; a = Math.min(1, p.life / 0.5); if (p.ph % 3 === 0) { w2 = 2; h2 = 2; } }
      else if (p.type === 'fly') { c = '#b8f4c8'; a = Math.max(0, Math.min(0.9, p.life / 3)) * (0.5 + 0.5 * Math.sin(p.t * 5 + p.ph)); }
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
    // at the whole-town distance a gentle dim is a subtle shimmer, which the
    // owner ruled out: pulled back to fit zoom the veil deepens so the lit
    // quarter carries in a single glance (and in a screenshot)
    const dimA = (cam.z <= 2 ? 0.55 : 0.38) * spotA;
    ctx.fillStyle = `rgba(30,32,46,${dimA.toFixed(3)})`;
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
    // and the quarter wears a bright rim: a bold cream outline that reads at
    // every zoom, doubled with the district's own colour just inside it
    ctx.beginPath();
    ctx.moveTo(Lp[0], Lp[1]);
    ctx.lineTo(Bp[0], Bp[1]);
    ctx.lineTo(Rp[0], Rp[1]);
    ctx.lineTo(Rp[0], Rp[1] - hgt);
    ctx.lineTo(Tp[0], Tp[1] - hgt);
    ctx.lineTo(Lp[0], Lp[1] - hgt);
    ctx.closePath();
    ctx.strokeStyle = `rgba(253,248,234,${(0.95 * spotA).toFixed(3)})`;
    ctx.lineWidth = Math.max(1.5, 5 / cam.z);
    ctx.stroke();
    ctx.strokeStyle = q.theme || '#8582ff';
    ctx.globalAlpha = 0.85 * spotA;
    ctx.lineWidth = Math.max(0.75, 2.5 / cam.z);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // a hovered PAGE row in the Districts panel lights its one building: a
  // violet-washed footprint with a cream rim and a pulsing beacon column,
  // deliberately loud enough to carry at the whole-town zoom
  if (hlB) {
    const b3 = hlB;
    const cs5 = [[b3.tx, b3.ty], [b3.tx + b3.fw, b3.ty], [b3.tx + b3.fw, b3.ty + b3.fd], [b3.tx, b3.ty + b3.fd]]
      .map(c5 => [isoX(c5[0], c5[1]), isoY(c5[0], c5[1])]);
    ctx.beginPath();
    ctx.moveTo(cs5[0][0], cs5[0][1]);
    for (let i5 = 1; i5 < 4; i5++) ctx.lineTo(cs5[i5][0], cs5[i5][1]);
    ctx.closePath();
    ctx.fillStyle = 'rgba(73,69,255,0.45)';
    ctx.fill();
    ctx.strokeStyle = '#fdf8ea';
    ctx.lineWidth = Math.max(1.5, 4 / cam.z);
    ctx.stroke();
    const bcx = isoX(b3.tx + b3.fw / 2, b3.ty + b3.fd / 2), bcy = isoY(b3.tx + b3.fw / 2, b3.ty + b3.fd / 2);
    const pulse5 = REDUCED ? 0.85 : 0.6 + 0.4 * Math.sin(animT * 5);
    const beamH = 120, beamW = Math.max(3, 8 / cam.z);
    ctx.globalAlpha = 0.8 * pulse5;
    ctx.fillStyle = '#8582ff';
    ctx.fillRect(Math.round(bcx - beamW / 2), Math.round(bcy - beamH), Math.round(beamW), beamH);
    ctx.globalAlpha = pulse5;
    ctx.fillStyle = '#fdf8ea';
    ctx.fillRect(Math.round(bcx - beamW / 6), Math.round(bcy - beamH), Math.max(1, Math.round(beamW / 3)), beamH);
    ctx.globalAlpha = 1;
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
  if (photoMode && !bubble.hidden) bubble.hidden = true;
  const bubbleUp = !bubble.hidden && panel.hidden;
  if (!panel.hidden && !bubble.hidden) bubble.hidden = true;

  // pin the door prompt above the glowing door; never let it cover the courier
  // (it also yields to the YOU ARE HERE banner - one floating label at a time)
  // one floating label at a time: between the door prompt and a townsfolk name
  // card, whichever the courier is actually standing nearer to speaks up
  // the Quick Start invitation holds the floor while it stands: the townsfolk
  // name card waits under it, so the FIRST floating prompt a stranger meets is
  // the one pointing at the Guide (still one label at a time)
  // the teleport banner counts as THE one label while it shows
  const tpBnUp = tpBannerUp();
  const folkUp = drawTownLabels(z, bubbleUp || qsInvite || tpBnUp);
  folkPromptUp = folkUp;
  const invUp = qsInvite && panel.hidden && !bubbleUp && !tpBnUp && !(yahT > 0 || yahHold) &&
    !photoMode && !townOverlayOpen() && !folkUp && !folkCardOpen();
  const promptUp = invUp || ((!!activeDoor || !!activeSpot) && panel.hidden && !bubbleUp && !tpBnUp && !(yahT > 0 || yahHold) &&
    !photoMode && !townOverlayOpen() && !folkUp && !folkCardOpen());
  doorPromptEl.hidden = !promptUp;
  if (promptUp) {
    const rdpr = window.devicePixelRatio || 1;
    if (invUp) {
      const invT = '· READ THE QUICK START GUIDE';
      if (dpTitleEl.textContent !== invT) { dpTitleEl.textContent = invT; if (dpRowsEl) dpRowsEl.innerHTML = ''; }
    }
    const aw = invUp ? (qsDoorRef ? qsDoorRef.wx : isoX(player.x, player.y))
      : (activeDoor ? activeDoor.wx : activeSpot.wx);
    const ah = invUp ? (qsDoorRef ? qsDoorRef.wy : isoY(player.x, player.y))
      : (activeDoor ? activeDoor.wy : activeSpot.wy);
    let bx = (aw - cam.x) * z / rdpr;
    let by = (ah - 14 - cam.y) * z / rdpr;
    const pwx = isoX(player.x, player.y), pwy = isoY(player.x, player.y);
    const psL = (pwx - 7 - cam.x) * z / rdpr, psR = (pwx + 8 - cam.x) * z / rdpr;
    const psT = (pwy - 16 - cam.y) * z / rdpr, psB = (pwy + 2 - cam.y) * z / rdpr;
    const bw = doorPromptEl.offsetWidth || 140, bh = doorPromptEl.offsetHeight || 28;
    if (bx + bw / 2 > psL && bx - bw / 2 < psR && by > psT && by - bh < psB) by = psT;
    const vw = cvs.clientWidth, vh = cvs.clientHeight;
    if (bx < 8 || bx > vw - 8 || by < 8 || by > vh - 8) {
      if (invUp) {
        // the Guide's door is out of frame: the invitation stands over the
        // courier instead, and never leaves the screen while it is the gesture
        bx = clamp((pwx - cam.x) * z / rdpr, 8 + bw / 2, vw - 8 - bw / 2);
        by = clamp((pwy - 18 - cam.y) * z / rdpr, 8 + bh, vh - 8);
      } else doorPromptEl.hidden = true;   // anchor off screen
    }
    doorPromptEl.style.left = bx + 'px';
    doorPromptEl.style.top = by + 'px';
  }

  // spotlight name banner, pinned over the lit district (yields to card + prompt)
  const spotBanner = document.getElementById('spotbanner');
  if (spotA > 0.05 && spotQ && panel.hidden && !bubbleUp && !promptUp && !folkUp && !tpBnUp) {
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

  // YOU ARE HERE label above the courier (hidden while reading,
  // and it waits its turn while the teleport banner is the one label)
  if ((yahT > 0 || yahHold) && panel.hidden && !tpBnUp) {
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
  hud.textContent = `${hh2}:${mm2} · day ${dayNum + 1} · ${SEASONS[season]}${rainI > 0.05 ? ' · rain' : ''} · view ${['N', 'E', 'S', 'W'][orient]} · zoom x${cam.z} · ${frameMs.toFixed(1)} ms/frame${REDUCED ? ' · motion reduced' : ''}`;
  const hud2 = document.getElementById('hud2');
  if (hud2) {
    const line = townNoteT > 0 ? townNote
      : (foundingActive || landfallActive) ? [foundingActive ? foundingLine() : '', landfallActive ? landfallLine() : ''].filter(Boolean).join(' · ')
      : parcels.length ? `${parcels.length} parcel${parcels.length > 1 ? 's' : ''} in the satchel · B opens the delivery book`
      : '';
    if (line) { hud2.textContent = line; hud2.hidden = false; } else hud2.hidden = true;
  }
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
         (!yahHold && yahT > 0) || spotA !== (spotOn ? 1 : 0) || !!hlB ||
         !!tp || !!rotFx || waveT > 0 || fadeCount > 0;
}
/* truly idle (non-reduced): time paused, camera at rest, no particles on
   screen, panel closed, nothing animating - park the rAF loop entirely */
function canPark() {
  // photo mode is a still - except while a quarter turn plays out (and while
  // the turn's re-bake is still catching up), which must be drawn frame by frame
  if (photoMode) return !rotFx && bakeQueue.length === 0;
  return timeSpeed === 0 && panel.hidden && keysDown.size === 0 && !player.tgt &&
         Math.hypot(player.vx, player.vy) < 0.03 && camSettle < 0.5 && !camFly &&
         parts.length === 0 && bakeQueue.length === 0 && !dragging &&
         yahT <= 0 && !yahHold && spotA === (spotOn ? 1 : 0) &&
         !tp && !rotFx && waveT <= 0 && fadeCount === 0 &&
         seasonBlend >= 1 && rainI === rainTarget;
}
function tick(dt) {
  if (photoMode) {
    // photo mode freezes the world, but the framing controls still move: a
    // quarter turn must advance here or Q/E would queue up and fire on exit
    if (rotFx) { stepRotFx(dt); photoClampCam(); }
    processBakeQueue(2.5);
    lightFactors(dayT);
    updateHudDials();
    return;
  }
  if (!REDUCED) {
    dayT += timeSpeed * dt / DAY_LEN;
    if (dayT >= 1) { dayT -= 1; dayNum++; setSeason(season + 1); refreshFolk(); }   // the year turns: one season per day
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
  sndUpdate(dt);
  sndAmbient(dt);
  townTick(dt);
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
let rowPending = null;       // the door-prompt row action this gesture started on

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
  try { cvs.setPointerCapture(e.pointerId); } catch (err) { }   // synthetic ids may refuse capture
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
    photoClampCam();
    bubble.hidden = true;
    if (REDUCED) draw();
    return;
  }
  if (photoMode) return;            // framing only: no hover card, no spotlight
  const [wx, wy] = screenToWorld(e.clientX, e.clientY);
  const st = pickBuilding(wx, wy);
  const b = st ? st.b : null;
  const tcHover = pickTownClick(wx, wy);
  const townHit = !!tcHover && (!st || tcHover.st.depth >= st.depth);
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
  if (!b) cvs.classList.toggle('pointing', townHit);   // town furniture takes the hand too
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
  // a press that began on a door-prompt row: the canvas took the pointer capture,
  // so the row will never see its own click - finish the press here instead.
  if (rowPending) { const act = rowPending; rowPending = null; if (!moved && !photoMode) act(); return; }
  if (moved || photoMode) return;   // photo mode: a click frames, it never acts
  const [wx, wy] = screenToWorld(e.clientX, e.clientY);
  const st = pickBuilding(wx, wy);
  const tc = pickTownClick(wx, wy);
  // whichever the eye sees in front wins: statics are depth-sorted
  if (tc && (!st || tc.st.depth >= st.depth)) { tc.act(); return; }
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
    retireQsInvite();               // a click-walk is walking elsewhere too
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
  retireQsInvite();         // any page opened means the gesture has done its work
  closeFolkCard();          // a page opened over a conversation ends it
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
  if (portalSignUp()) { portalSignNo(); return; }   // Escape puts the town sign away: no crossing
  if (townOverlayOpen()) { closeTownOverlay(); return; }
  if (folkCardOpen()) { closeFolkCard(); return; }
  if (photoMode) { exitPhoto(); return; }
  const drawer = document.getElementById('drawer'), kp = document.getElementById('keypanel');
  if (!drawer.hidden) { closeDrawerView(false); return; }   // Escape hands the saved view back too
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
  // any form control the visitor is actually in keeps its own keys (the note's text
  // area, the post office search box, and its page picker - arrows walk the list)
  if (e.target && e.target.closest && e.target.closest('input, textarea, select')) return;
  if (portalSignUp()) {
    // THE TOWN SIGN HAS THE FLOOR. Y speaks YES from anywhere, N or Escape
    // speaks NO, Tab moves between the two words, Enter (or Space) speaks the
    // word that holds focus. Every other key waits - the courier does not
    // walk, the season does not turn, no door opens behind the plank.
    const yes = document.getElementById('ps-yes'), no = document.getElementById('ps-no');
    if (e.key === 'y' || e.key === 'Y') { portalSignYes(); e.preventDefault(); return; }
    if (e.key === 'n' || e.key === 'N' || e.key === 'Escape') { portalSignNo(); e.preventDefault(); return; }
    if (e.key === 'Tab') { (document.activeElement === yes ? no : yes).focus(); e.preventDefault(); return; }
    if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') {
      if (e.target === yes || e.target === no) return;          // the focused word answers natively
      if (document.activeElement === yes) { portalSignYes(); e.preventDefault(); return; }
      if (document.activeElement === no) { portalSignNo(); e.preventDefault(); return; }
    }
    e.preventDefault();
    return;
  }
  if (townOverlayOpen()) {
    // A CIVIC CARD IS A READING SURFACE, AND THE TOWN HOLDS STILL BEHIND IT.
    // The post desk, the noticeboard, the paper, the ledgers, the book and the plaque
    // sit above everything (z 70), so they answer the keyboard first, in the reading
    // panel's own grammar: the arrows and Space scroll the card, X and Escape close it.
    // Nothing else acts - the courier does not walk off the door the card belongs to
    // and no season turns behind the paper.
    const onCtl = e.target && e.target.closest && e.target.closest('button, a');
    if (onCtl && (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space')) return;
    if (e.code === 'ArrowDown') { townOlCard.scrollBy(0, 90); e.preventDefault(); }
    else if (e.code === 'ArrowUp') { townOlCard.scrollBy(0, -90); e.preventDefault(); }
    else if (e.code === 'Space') { townOlCard.scrollBy(0, Math.round(townOlCard.clientHeight * 0.85)); e.preventDefault(); }
    else if (e.key === 'x' || e.key === 'X' || e.key === 'b' || e.key === 'B') { closeTownOverlay(); e.preventDefault(); }
    else if (KEYMAP[e.code]) e.preventDefault();
    return;
  }
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
  if (photoMode) {
    // PHOTO MODE IS A STILL, AND THE KEYBOARD KEEPS THAT PROMISE.
    // Only the mode's own controls answer here - the four the bar prints plus P to
    // leave. Everything else is inert: the walk keys never queue a step that would
    // fire the moment the courier is handed back, and the door keys, the parcel, the
    // note, the book, the clock and the season never open or change anything behind
    // the frozen frame, so Escape hands back the town and nothing else.
    if (e.key === 'p' || e.key === 'P' || e.code === 'KeyP') { exitPhoto(); return; }
    if (e.code === 'KeyF') { photoFindMe(); return; }
    if (e.key === 'q' || e.key === 'Q' || e.code === 'KeyQ') { setOrient(orient + 3); return; }
    if (e.key === 'e' || e.key === 'E' || e.code === 'KeyE') { setOrient(orient + 1); return; }
    if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') { zoomStep(1); e.preventDefault(); return; }
    if (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract') { zoomStep(-1); e.preventDefault(); return; }
    if (KEYMAP[e.code] || e.code === 'Space') e.preventDefault();
    return;
  }
  if (KEYMAP[e.code]) {
    keysDown.add(KEYMAP[e.code]);
    camMode = 'follow';             // any move key hands the camera back to the courier
    camFly = null;                  // and cancels any camera flight
    player.tgt = null;
    setSpot(null);                  // walking clears the hover spotlight
    retireQsInvite();               // walking elsewhere: the invitation yields at once
    if (!introEl.hidden) endIntro(false);   // movement dismisses the intro prompt
    dismissYah(true);
    e.preventDefault();
    startLoop();
    return;
  }
  // the standing invitation speaks first: while its prompt is the one on
  // screen, ENTER does exactly what it says - opens the Quick Start Guide
  if ((e.code === 'Enter' || e.code === 'Space') && qsInvite && panel.hidden) {
    location.hash = '#' + QS_SLUG;
    e.preventDefault();
    return;
  }
  // the prompt over a hand is the one on screen when the courier is nearer to
  // the person than to any door, so ENTER means exactly what that prompt says
  if ((e.code === 'Enter' || e.code === 'Space') && folkPromptUp) {
    talkToFolk();
    e.preventDefault();
    return;
  }
  if ((e.code === 'Enter' || e.code === 'Space') && activeDoor) {
    location.hash = '#' + activeDoor.slug;
    e.preventDefault();
    return;
  }
  if ((e.code === 'Enter' || e.code === 'Space') && activeSpot) { activateSpot(activeSpot); e.preventDefault(); return; }
  if (e.key === 'g' || e.key === 'G' || e.code === 'KeyG') { if (activeDoor) parcelAction(activeDoor); return; }
  if (e.key === 'n' || e.key === 'N' || e.code === 'KeyN') { if (activeDoor) openNoteForm(activeDoor.slug); return; }
  if (e.key === 'b' || e.key === 'B' || e.code === 'KeyB') { openBook(); return; }   // B closes it again from inside the card
  if (e.key === 'p' || e.key === 'P' || e.code === 'KeyP') { if (photoMode) exitPhoto(); else enterPhoto(); return; }
  if (e.code === 'Space') { e.preventDefault(); return; }
  if (e.code === 'KeyT') { cycleTimeSpeed(); return; }
  if (e.code === 'KeyY') { setSeason(season + 1); startLoop(); return; }
  if (e.code === 'KeyF') { if (photoMode) photoFindMe(); else findMe(); return; }   // back to the courier, any time
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
  document.getElementById('btn-nav').onclick = () => { if (drawer.hidden) openDrawerView(); else closeDrawerView(false); };
  document.getElementById('drawer-close').onclick = () => closeDrawerView(false);
  body.addEventListener('click', (e) => { if (e.target.closest('a')) closeDrawerView(true); });
  body.querySelectorAll('.d-district').forEach(el2 => {
    const q = quarters.find(q2 => q2.id === +el2.dataset.q);
    if (!q) return;
    el2.addEventListener('mouseenter', () => setSpot(q));
    el2.addEventListener('mouseleave', () => setSpot(null));
    el2.addEventListener('click', () => {
      closeDrawerView(true);
      setSpot(q);
      startFly(isoX(q.qx + q.qw / 2, q.qy + q.qh / 2), isoY(q.qx + q.qw / 2, q.qy + q.qh / 2), 3, null);
    });
  });
  // hovering a PAGE row lights that page's building on the map, at whatever
  // distance the camera stands (delegated, so every row in the long list works)
  body.addEventListener('mouseover', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !body.contains(a)) return;
    const sl = decodeURIComponent(a.getAttribute('href').slice(1));
    const b3 = buildings.find(bb => bb.slug === sl);
    if (b3) { setHl(b3); setSpot(b3.quarter || null); }
  });
  body.addEventListener('mouseout', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a && body.contains(a)) { setHl(null); setSpot(null); }
  });
}

/* DISTRICTS OPENS ON THE WHOLE TOWN (owner order): opening the panel saves the
   visitor's exact view and eases the camera out until the entire map fits;
   closing without choosing eases back to precisely the saved view - position,
   zoom and rotation all untouched by the trip. Choosing a district or a page
   travels exactly as it always did, and the saved view is let go. Reduced
   motion snaps both ways (startFly already arrives instantly there). */
let drawerView = null;
/* the whole-TOWN fit: the tightest integer zoom that holds every quarter
   (roofs included), centred on the town itself rather than on the ocean's
   bounding box - the crispness law (whole-pixel zoom only) holds here too */
function fitTown() {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const q of quarters) {
    for (const c4 of [[q.qx, q.qy], [q.qx + q.qw, q.qy], [q.qx + q.qw, q.qy + q.qh], [q.qx, q.qy + q.qh]]) {
      const wx = isoX(c4[0], c4[1]), wy = isoY(c4[0], c4[1]);
      if (wx < x0) x0 = wx;
      if (wx > x1) x1 = wx;
      if (wy - (q.topH || 40) < y0) y0 = wy - (q.topH || 40);
      if (wy > y1) y1 = wy;
    }
  }
  x0 -= 12; x1 += 12; y0 -= 10; y1 += 14;
  let zf = 1;
  for (const zz of ZLEVELS) if ((x1 - x0) * zz <= cvs.width && (y1 - y0) * zz <= cvs.height) zf = Math.max(zf, zz);
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, z: zf, w: x1 - x0, h: y1 - y0 };
}
function openDrawerView() {
  const drawer = document.getElementById('drawer');
  drawer.hidden = false;
  drawerView = { x: cam.x, y: cam.y, z: cam.z, mode: camMode };
  const f = fitTown();
  startFly(f.x, f.y, f.z, null);
}
function closeDrawerView(travelled) {
  const drawer = document.getElementById('drawer');
  drawer.hidden = true;
  setSpot(null); setHl(null);
  if (travelled) { drawerView = null; return; }
  if (!drawerView) return;
  const v = drawerView;
  drawerView = null;
  startFly(v.x + cvs.width / (2 * v.z), v.y + cvs.height / (2 * v.z), v.z, () => {
    cam.x = v.x; cam.y = v.y; cam.z = v.z; camMode = v.mode;   // exact restore, to the pixel
    if (REDUCED) draw(); else requestDraw();
  });
}
/* the one highlighted building (a hovered page row in the Districts panel) */
let hlB = null;
function setHl(b3) {
  if (hlB === b3) return;
  hlB = b3;
  if (REDUCED) draw(); else startLoop();
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
    <h3>TOWN LIFE</h3>
    <ul>
      ${plazaCore ? `<li><strong>The main square</strong> is where you land: ${plazaCore.tiles} paved tiles kept clear where four streets meet, with the post office, the newsstand and the plaque set back on its rim so the middle stays yours to walk.</li>` : ''}
      <li><strong>The post office</strong> on the plaza writes real letters: pick a page and SEND opens that page's own GitHub editor (<span class="mono">edit/main/docusaurus/&lt;file&gt;</span>), or open an issue prefilled with its title and slug.</li>
      <li><strong>A noticeboard stands by every door</strong> (${doors.length} of them). Press N to pin a note: it posts to the same docs-feedback letterbox as the real widget. Away from the docs domain the browser blocks the call, so the board keeps your words and says so.</li>
      <li><strong>Delivery rounds:</strong> press G at any door to take a parcel addressed to a page that page really cites, and G again at the destination to stamp the delivery book (B). Three parcels at most; the book remembers the route you took.</li>
      <li><strong>The night shift:</strong> ${TOWN.lanternTotal} mint lanterns burn after dark for commits made after midnight, on ${lanternDoors.length} real pages. Walk up to one at night to log it; find them all and the plaza plaque lights: <em>for those who wrote after midnight</em>.</li>
      <li><strong>The Daily Docs</strong> kiosk prints the six most recently tended pages, with their real dates. Tap a headline and the courier makes the trip.</li>
      <li><strong>The Records Hall</strong> keeps one ledger per month from ${humanDate(TOWN.first)} to ${humanDate(TOWN.last)}, honestly labelled as the pages remember it; the ${TOWN.widest.founded.length}-page ledger of ${['January','February','March','April','May','June','July','August','September','October','November','December'][Number(TOWN.widest.key.slice(5, 7)) - 1]} ${TOWN.widest.key.slice(0, 4)} is chained to the desk.</li>
      <li><strong>The townsfolk are the town.</strong> All ${townsfolk.length} real hands behind these pages are out in the streets at once - they are the population, not decoration - each keeping a beat beside one of the pages provenance ties them to, and the day of the cycle picks which of their pages that is, so the same hand is somewhere else tomorrow. Stop beside one and the prompt reads <em>TALK</em>: press Enter or click it and their record opens - the span they signed, the pages they tended, and every one of those pages with its own count, each clickable. Walk away and the conversation ends.</li>
      <li><strong>The anonymous are the exception</strong>: never more than one of them for every six named hands (${peds.length} of them today). They keep to the ground no hand is tied to - the quays and the wide streets more than ${FOLK_CLEAR} tiles from anyone - and they are plainly incidental: no hat, no name, no label, no talk prompt. Wherever the pages are, everyone you pass can be named.</li>
      <li><strong>${TOWN.vacant.length} fenced lots</strong> mark the pages no other page links to yet. The sign says NOBODY LINKS HERE YET; walking up offers to be the first, through the post office.</li>
      <li><strong>Photo mode</strong> (P): the scene freezes, you frame it, and the camera button saves a pixel-crisp postcard with the district, season and in-town date stamped on the border.</li>
      <li><strong>The town keeps two birthdays, because the repository is older than any page still standing in it.</strong></li>
      <li><strong>Founding Day</strong> falls on ${TOWN.foundingHuman.replace(/ \d{4}$/, '')}, the anniversary of the repository's own first commit (${TOWN.foundingHuman}, the oldest entry in the log this whole town is drawn from). Every file that commit made has since been deleted or moved, so the day is celebrated honestly: <em>nothing standing here today is that old</em>. Bunting is strung from poles around the plaza with ${TOWN.pennants} pennants, one in each community's colour, lights along the cords after dark and fireworks over the square. Add <span class="mono">?founding=1</span> to see it any day.</li>
      <li><strong>First Landfall</strong> falls on ${TOWN.landfallHuman.replace(/ \d{4}$/, '')}, the anniversary of the oldest pages that are still here: ${TOWN.landfallPages.length} Cloud pages laid down together on ${TOWN.landfallHuman} - ${TOWN.landfallPages.map(sl => `<span class="mono">${esc(sl)}</span>`).join(', ')}. It is the quieter day and shares nothing with the other: a beacon burns over each of those ${TOWN.landfallPages.length} doors, and ${TOWN.landfallCommits} paper lanterns - one for every commit those five pages have carried since - drift down the canals. Add <span class="mono">?landfall=1</span> to see it any day.</li>
    </ul>
    <h3>STREET FURNITURE</h3>
    <ul>
      <li><strong>Some of the town is simply furniture:</strong> benches, planters, hydrants, crates and barrels, the chalkboard sandwich boards the shops stand out on the pavement, and the stone fountain playing in the park. They dress the streets and answer to nothing - if it does not raise a floating prompt when you walk up, it is scenery to enjoy on the way past.</li>
    </ul>
    <h3>GETTING AROUND</h3>
    <ul>
      <li>Drag to pan, scroll or +/− to zoom: one whole-pixel step per gesture, laptop-trackpad friendly.</li>
      <li><strong>Turn the town:</strong> Q and E (or the \u21BA \u21BB buttons) rotate the map a quarter turn to see behind any row. Buildings hiding the courier turn see-through on their own.</li>
      <li>Hover any building to read its plaque: every hand that wrote the page, keeper first.</li>
      <li>Click a building to read the full page - and the courier beams to its door in a sparkle of pixels, under a small banner naming the trip: TELEPORTING YOU TO the page in question. The same banner rides every beamed trip, from the search box, the newsstand or a talk panel. Close the page with \u2715, Escape or X.</li>
      <li><strong>Or walk it:</strong> every arrow key / WASD follows one street as drawn on screen (\u2192 walks the down-right avenue, \u2191 the up-right one); hold two neighbouring keys to cut between them. Hold Shift to stride. Click any open ground to send the courier there (shift-click strides). Walk up to a door and press Enter to step in and read - every door is walkable from the spawn plaza, proven at boot. The courier lands at the plaza edge nearest the QUICK START GUIDE, facing its softly lit door: press Enter right there to read it first, or simply walk away and the invitation steps aside.</li>
      <li><strong>Never lost:</strong> press F or the \u25CE Find me button to fly back to the courier with a YOU ARE HERE marker - they wave back; at the widest zoom a violet ring marks them at all times. Hover any district (or its entry in the Districts drawer) to spotlight it; district names label the map at wider zooms.</li>
      <li><strong>The town keeps time:</strong> a full day lasts about 4 minutes and each day turns the season. Click the clock (or press T) for 1x / 8x / paused; click the season glyph (or press Y) to skip ahead. At night the windows come on street by street; spring and autumn bring passing showers with puddle glints on the streets.</li>
      <li><strong>And it sounds real:</strong> footsteps by ground, doors, pigeons, the cat, birds by day, crickets by night, rain on the rooftops - genuine CC0 / public-domain recordings, bundled locally (sources in sfx/CREDITS.txt). The ♪ button mutes everything and remembers your choice.</li>
    </ul>
    <p class="mono">Rendered at ${Wt}×${Ht} tiles · ${atlasStats.sprites} baked sprites · frame ${frameMs ? frameMs.toFixed(1) : '…'} ms</p>`;
  document.getElementById('btn-key').onclick = () => { kp.hidden = !kp.hidden; if (!kp.hidden) initKey(); };
  document.getElementById('key-close').onclick = () => { kp.hidden = true; };
}

/* ==========================================================================
   WAVE 4 - TOWN LIFE. Ten civic features, every fact derived from
   content/graph/provenance at boot: the Post Office (real GitHub edit
   letters), noticeboards (real docs-feedback webhook), delivery rounds
   (real citation edges), the night shift (real after-midnight commits),
   the Daily Docs (real freshest pages), the Records Hall (real month
   ledgers), the townsfolk (the 77 real hands), vacant lots (real
   zero-inbound pages), photo mode, and Founding Day (the anniversary of
   the first recording the data remembers).
   ========================================================================== */
let spots = [];                  // interactive town spots {kind, slug?, title, row, ix, iy, wx, wy}
let activeSpot = null;
let dayNum = 0;                  // in-game days elapsed since boot
let TOWN = null;                 // boot-derived town facts
let parcels = [];                // active delivery rounds, cap 3
let bookStamps = [];             // stamped deliveries (persist for the visit)
let notesPinned = new Set();     // slugs with a paper pinned this visit
let lanternDoors = [];           // {slug, n} - the night-shift lanterns
let fireflySeen = new Set();     // night-shift lanterns already logged
let plaqueEarned = false;
let townsfolk = [];              // all real hands {name, slug, line, hash}
let folkVisible = [];            // seeded rotation for the current day (~20)
let folkNear = null;
let folkPromptUp = false;   // is the TALK prompt the label currently on screen?
let photoMode = false, photoPrevSpeed = 1;
let foundingActive = false, fwTimer = 1.2;
/* The repository's first commit, read off gitlog-docs.txt - the same log every
   other date in this town comes from. Its oldest entry is
   631c1f6287c3c548bd46b4c612a70bf17f4b4e13, Pierre Wizla, 2022-11-02, which
   created docusaurus/docs/dev-docs and docusaurus/docs/user-docs. Not one of
   those files is still in the repository, so no page in provenance.json can
   carry this date: the town is older than anything standing in it. */
const REPO_FIRST = '2022-11-02';
let landfallActive = false;
let beacons = [];                // FIRST LANDFALL: a light at each surviving oldest door
let waterLights = [];            // FIRST LANDFALL: lanterns adrift on the canals
let townNote = '', townNoteT = 0;
let edgesFrom = {};              // slug -> [slugs it really cites]
let doorBySlug = {};
let pennantStrings = [];         // founding-day strings, re-projected per orientation
let townClickables = [];         // world-px hit rects for the mouse-only path
const FOLK_CACHE = {};

/* ---- THE PORTAL NETWORK (owner ruling 3) ---------------------------------
   Five stations, six berths - the crossings to the lab's sister highlights,
   woven into the town fabric. Each one is DISCOVERED, never a menu: the
   affordance lives in the town's own grammar (a bookshop, two moored vessels,
   a telescope, a fingerpost, a market stall), the hint is one in-register
   line in the same door prompt every door uses, and ENTER plays a short
   in-fiction beat before the walk over to the sibling at ../KEY/. Reduced
   motion crosses instantly. (2026-09-05, r15, owner order: THE KIT IS
   ARCHIVED - the hobby shop's crossing is gone entirely; its shopfront
   stays in the streets as silent scenery, blind drawn, offering nothing.) */
const PORTALS = [
  { key: 'secreta', kind: 'funnies', href: '../secreta/',
    title: 'FOUR-COLOR FUNNIES', hint: 'A SPINNER RACK OF COMICS TURNS IN THE WINDOW',
    beat: 'THE RACK SPINS · FOUR COLORS BLUR INTO ONE', snd: 'pop' },
  { key: 'cartastrapiana', kind: 'sloop', href: '../cartastrapiana/',
    title: 'THE ENGRAVED SLOOP', hint: 'She sails by an older hand. Board her?',
    beat: 'SHE CASTS OFF · THE ENGRAVING TAKES THE WIND', snd: 'whoosh' },
  { key: 'bythedeep', kind: 'steamer', href: '../bythedeep/',
    title: 'THE HARBOUR STEAMER', hint: 'THE STEAMER WINKS AS YOU COME NEAR',
    beat: 'THE STEAMER WINKS ONCE MORE · ALL ABOARD', snd: 'whoosh' },
  { key: 'firstlight', kind: 'observatory', href: '../firstlight/',
    title: 'THE OBSERVATORY', hint: 'THE DOME SLEEPS TILL DARK',
    hintNight: 'That star is answering', beat: 'THE SLIT OPENS · THE STAR ANSWERS IN KIND', snd: 'chime' },
  { key: 'longway', kind: 'trailgate', href: '../longway/',
    title: 'THE TRAIL GATE', hint: 'THE LONG WAY OUT OF TOWN · 319,153 WORDS',
    beat: 'ONE FOOT AFTER THE OTHER · 319,153 WORDS TO GO', snd: 'whoosh' },
  { key: 'herbarium', kind: 'botanist', href: '../herbarium/',
    title: 'THE BOTANIST STALL', hint: 'PRESSED FLOWERS IN THE WINDOW · EVERY LEAF KEPT',
    beat: 'A PRESSED FLOWER MARKS YOUR PAGE', snd: 'chime' }
];
const PORTAL_BY_KIND = {};
for (const P of PORTALS) PORTAL_BY_KIND[P.kind] = P;
let portalLeaving = false;       // one crossing at a time
let steamerProp = null;          // the vessel that winks as you approach

/* THE PORTAL CONFIRM (owner law). Every activation - keyboard or mouse, all
   five stations, all six berths - first raises a wooden town sign in the
   door grammar: THIS WAY LEAVES TOWN - ANOTHER WORLD ENTIRELY. GO? The two
   words on the plank are real buttons (clickable, Tab-focusable); Y speaks
   YES from anywhere, N or Escape speaks NO, Enter speaks the focused word.
   NO puts the sign away and hands back the exact moment before it rose.
   Reduced motion raises the same sign with no animation. */
let portalAsk = null;            // the crossing waiting on the visitor's word
let portalAskFocus = null;       // where focus stood before the sign rose
function portalSignUp() { return !!portalAsk; }
function portalGo(key) {
  const P = PORTALS.find((p) => p.key === key);
  if (!P || portalLeaving || portalAsk) return;
  portalAsk = P;
  keysDown.clear();               // a held walk key never carries into the sign
  player.tgt = null;
  const el = document.getElementById('portalsign');
  const dest = document.getElementById('ps-dest');
  if (!el || !dest) { portalAsk = null; portalCross(key); return; }   // no sign in the DOM: never strand the crossing
  dest.textContent = 'BOUND FOR ' + P.title;
  el.hidden = false;
  if (REDUCED) el.classList.add('on');
  else requestAnimationFrame(() => el.classList.add('on'));
  portalAskFocus = document.activeElement;
  const yes = document.getElementById('ps-yes');
  if (yes) yes.focus();
  sndSynth('pop');
  if (REDUCED) draw();
}
function portalSignClose() {
  const el = document.getElementById('portalsign');
  if (el) { el.classList.remove('on'); el.hidden = true; }
  portalAsk = null;
  const ae = document.activeElement;
  if (ae && el && el.contains(ae) && ae.blur) ae.blur();
  if (portalAskFocus && portalAskFocus !== document.body && portalAskFocus.focus) {
    try { portalAskFocus.focus(); } catch (err) { }
  }
  portalAskFocus = null;
}
function portalSignYes() {
  if (!portalAsk) return;
  const key = portalAsk.key;
  portalSignClose();
  portalCross(key);
}
function portalSignNo() {
  if (!portalAsk) return;
  portalSignClose();               // clean return to the moment before the sign
  if (REDUCED) draw(); else startLoop();
}
function portalCross(key) {
  const P = PORTALS.find((p) => p.key === key);
  if (!P || portalLeaving) return;
  portalLeaving = true;
  const go = () => { location.href = P.href; };
  if (REDUCED) { go(); return; }               // reduced motion: no beat, just the crossing
  const ol = document.getElementById('portalbeat');
  const line = document.getElementById('portalbeat-line');
  if (!ol || !line) { go(); return; }
  line.textContent = P.beat;
  ol.hidden = false;
  requestAnimationFrame(() => ol.classList.add('on'));
  sndSynth(P.snd);
  setTimeout(go, 980);
}
/* the sign's two words answer the mouse; a click on the dusk behind the
   plank is the visitor stepping back - the same clean NO */
(() => {
  const el = document.getElementById('portalsign');
  const yes = document.getElementById('ps-yes'), no = document.getElementById('ps-no');
  if (yes) yes.addEventListener('click', portalSignYes);
  if (no) no.addEventListener('click', portalSignNo);
  if (el) el.addEventListener('pointerdown', (e) => { if (e.target === el) portalSignNo(); });
})();
/* the telescope only answers once the stars are out; under reduced motion the
   clock is parked at the frozen golden hour, so the star answers regardless */
function portalTelescope() {
  if (nf > 0.05 || REDUCED) portalGo('firstlight');
  else setTownNote('the dome sleeps till dark · hurry the clock (T) and come back under the stars', 6);
}

function townHash(s) {
  let hh = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { hh ^= s.charCodeAt(i); hh = Math.imul(hh, 16777619) >>> 0; }
  return hh >>> 0;
}
function setTownNote(msg, secs) { townNote = msg; townNoteT = secs || 4; if (!REDUCED) startLoop(); else draw(); }
/* the two anniversaries, each in its own words. The difference is the whole
   point of having both, so each line says which of the two ages it is about. */
function foundingLine() {
  return `FOUNDING DAY · the repository's first commit, ${TOWN.foundingHuman} · no page standing today is that old`;
}
function landfallLine() {
  // named by their titles, not their slugs: the HUD sets everything in capitals
  // and a shouted path is a lie about what the path actually reads
  const names = TOWN.landfallPages.map(sl => (pagesBySlug[sl] && pagesBySlug[sl].title) || sl);
  return `FIRST LANDFALL · the ${names.length} oldest pages still standing were laid down ${TOWN.landfallHuman}: ` +
    names.join(' · ');
}
function humanDate(iso) {
  const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${M[m - 1]} ${y}`;
}
function daysAgo(iso) {
  const then = new Date(iso + 'T12:00:00Z').getTime();
  const n = Math.max(0, Math.round((Date.now() - then) / 86400000));
  return n === 0 ? 'tended today' : n === 1 ? 'tended yesterday' : `tended ${n} days ago`;
}
function editUrlFor(slug) {
  const pg = pagesBySlug[slug];
  return pg && pg.file ? 'https://github.com/strapi/documentation/edit/main/docusaurus/' + pg.file : null;
}
function issueUrlFor(slug) {
  const pg = pagesBySlug[slug];
  if (!pg) return null;
  const title = encodeURIComponent('[docs] ' + (pg.title || slug));
  const body = encodeURIComponent('Page: ' + slug + '\nFile: docusaurus/' + (pg.file || '?') + '\n\n<!-- written at the Pixel Docs City post office -->\n');
  return `https://github.com/strapi/documentation/issues/new?title=${title}&body=${body}`;
}

/* ---- boot-time derivation: every town fact measured from the data ------- */
function townData() {
  FONT3[':'] = [0, 2, 0, 2, 0]; FONT3['.'] = [0, 0, 0, 0, 2];
  // restore visit state before boards and the plaque project their sprites
  try {
    (JSON.parse(localStorage.getItem('pdc_notes_v1') || '[]') || []).forEach(s => notesPinned.add(s));
    bookStamps = JSON.parse(localStorage.getItem('pdc_book_v1') || '[]') || [];
    if (!Array.isArray(bookStamps)) bookStamps = [];
    (JSON.parse(localStorage.getItem('pdc_lanterns_v1') || '[]') || []).forEach(s => fireflySeen.add(s));
  } catch (err) { notesPinned = new Set(); bookStamps = []; fireflySeen = new Set(); }
  // citation adjacency (real edges only)
  edgesFrom = {};
  for (const [a, b] of GRAPH.edges) {
    if (!pagesBySlug[a] || !pagesBySlug[b] || a === b) continue;
    (edgesFrom[a] = edgesFrom[a] || []).push(b);
  }
  // provenance-wide dates
  let first = null, last = null;
  for (const v of Object.values(PROV)) {
    if (!first || v.first < first) first = v.first;
    if (!last || v.last > last) last = v.last;
  }
  // month ledgers, first recorded month to now (as remembered by first/last)
  const months = [];
  {
    let [y, m] = first.slice(0, 7).split('-').map(Number);
    const [ly, lm] = last.slice(0, 7).split('-').map(Number);
    while (y < ly || (y === ly && m <= lm)) {
      const key = `${y}-${String(m).padStart(2, '0')}`;
      const founded = [], tended = [];
      for (const [slug, v] of Object.entries(PROV)) {
        if (!pagesBySlug[slug]) continue;
        if (v.first.slice(0, 7) === key) founded.push(slug);
        else if (v.last.slice(0, 7) === key) tended.push(slug);
      }
      founded.sort(); tended.sort();
      months.push({ key, founded, tended });
      m++; if (m > 12) { m = 1; y++; }
    }
  }
  let widest = months[0];
  for (const mo of months) if (mo.founded.length > widest.founded.length) widest = mo;
  // the freshest six, straight from provenance.last
  const news = Object.entries(PROV)
    .filter(([s]) => pagesBySlug[s])
    .sort((a, b) => b[1].last.localeCompare(a[1].last) || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([slug, v]) => ({ slug, title: (pagesBySlug[slug].title || slug), last: v.last }));
  // night-shift lanterns: real after-midnight commits
  lanternDoors = Object.entries(PROV)
    .filter(([s, v]) => v.night > 0 && pagesBySlug[s])
    .map(([slug, v]) => ({ slug, n: v.night }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
  const lanternTotal = lanternDoors.reduce((t, l) => t + l.n, 0);
  // the real hands: home = the page they keep (topAuthor), else their busiest page
  const byAuthor = {};
  for (const [slug, v] of Object.entries(PROV)) {
    if (!pagesBySlug[slug]) continue;
    for (const a of v.authors || []) {
      const e = (byAuthor[a] = byAuthor[a] || { kept: [], touched: [] });
      (v.topAuthor === a ? e.kept : e.touched).push({ slug, commits: v.commits, nAuth: (v.authors || []).length });
    }
  }
  townsfolk = Object.entries(byAuthor).map(([name, e]) => {
    const home = (e.kept.length ? e.kept : e.touched).sort((a, b) => b.commits - a.commits || a.slug.localeCompare(b.slug))[0];
    let line;
    if (e.kept.some(k => k.slug === home.slug)) {
      if (home.nAuth === 1) line = home.commits === 1 ? 'came once, fixed one thing' : `keeps this page - all ${home.commits} commits are theirs`;
      else line = `keeps this page - first hand of ${home.nAuth}, over ${home.commits} commits`;
    } else line = home.nAuth === 1 ? 'lent a hand here' : `one of ${home.nAuth} hands on this page`;
    /* THE RECORD IS THE CONVERSATION: everything a hand can say about themselves,
       derived here once, straight from provenance and nothing else. */
    const all = e.kept.concat(e.touched).sort((a, b) =>
      b.commits - a.commits || a.slug.localeCompare(b.slug));
    const keptSet = new Set(e.kept.map(k => k.slug));
    let firstD = '9999-99-99', lastD = '0000-00-00', sumCommits = 0, nightPages = 0, nightCommits = 0;
    for (const pg of all) {
      const v = PROV[pg.slug];
      if (v.first < firstD) firstD = v.first;
      if (v.last > lastD) lastD = v.last;
      sumCommits += v.commits;
      if (v.night > 0) { nightPages++; nightCommits += v.night; }
    }
    // the one honest line of character, in the order the town tells them apart:
    // a keeper says they keep it, the 44 one-page hands say they came once, a
    // night hand names the hour, and the rest are simply one of the seventy-seven
    let card;
    if (e.kept.length) {
      const t0 = pagesBySlug[e.kept[0].slug] ? (pagesBySlug[e.kept[0].slug].title || e.kept[0].slug) : e.kept[0].slug;
      card = e.kept.length === 1
        ? `the chief surveyor of ${t0} - they keep it`
        : `they keep ${e.kept.length} pages of the town, ${t0} among them`;
    } else if (all.length === 1) {
      card = 'came once, and the log keeps no other mark of them';
    } else if (nightPages) {
      card = nightPages === 1
        ? 'a night hand: one of their pages carries commits made after midnight'
        : `a night hand: ${nightPages} of their pages carry commits made after midnight`;
    } else {
      card = `one of the seventy-seven, across ${all.length} pages`;
    }
    return {
      name, slug: home.slug, line, hash: townHash(name),
      first: firstD, last: lastD, nPages: all.length, commits: sumCommits,
      kept: e.kept.length, nightPages, nightCommits, card,
      pages: all.map(pg => ({ slug: pg.slug, commits: pg.commits, nAuth: pg.nAuth, kept: keptSet.has(pg.slug) }))
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
  // zero-inbound pages: nobody links here yet
  const vacant = ORDER.filter(s => !GRAPH.inbound[s]);
  /* TWO ANNIVERSARIES, BECAUSE THE TOWN HAS TWO BIRTHDAYS AND THEY ARE NOT THE
     SAME DAY. The repository is older than any page still standing in it.

     FOUNDING DAY is the repository's own first commit. provenance.json cannot
     hold that date - it only remembers pages that still exist - so it is read
     off the git log the whole town was built from (gitlog-docs.txt, oldest
     entry: 631c1f6, Pierre Wizla, 2022-11-02, the commit that laid down
     docusaurus/docs). Every file that commit created has since been deleted or
     moved, which is exactly what the day is honest about.

     FIRST LANDFALL is the anniversary of the oldest page still standing:
     the earliest `first` in provenance, and the pages that carry it. */
  const now = new Date();
  const landfallPages = ORDER.filter(sl => PROV[sl] && PROV[sl].first === first && pagesBySlug[sl]);
  const landfallCommits = landfallPages.reduce((t, sl) => t + PROV[sl].commits, 0);
  const onDay = (iso) => now.getMonth() + 1 === Number(iso.slice(5, 7)) && now.getDate() === Number(iso.slice(8, 10));
  foundingActive = /[?&]founding=1\b/.test(location.search) || onDay(REPO_FIRST);
  landfallActive = /[?&]landfall=1\b/.test(location.search) || onDay(first);
  TOWN = {
    first, last, months, widest, news, vacant,
    lanternTotal,
    founding: REPO_FIRST, foundingHuman: humanDate(REPO_FIRST),
    landfall: first, landfallHuman: humanDate(first),
    landfallPages, landfallCommits,
    pennants: COMMS.length
  };
}

/* ---- sprites ------------------------------------------------------------ */
function bakeLandmark(name, hgt, deco) {
  // 2x2-tile civic block. Roof diamond at the top, two wall faces below;
  // cv.anchorY marks the footprint's top ground corner for projection.
  const pad = 6;
  bakeSprite(name, 32, hgt + 18 + pad, (g, cv) => {
    const colL = (x, dy, h, col) => { g.fillStyle = col; g.fillRect(x, Math.round(pad + 8 + x / 2) + dy, 1, h); };
    const colR = (x, dy, h, col) => { g.fillStyle = col; g.fillRect(16 + x, Math.round(pad + 16 - x / 2) + dy, 1, h); };
    for (let x = 0; x < 16; x++) { colL(x, 0, hgt, PAL.C2); colR(x, 0, hgt, PAL.C1); }
    for (let r = 0; r < 8; r++) { const w2 = DROWS[r] * 2; g.fillStyle = r < 2 ? PAL.S3 : PAL.S2; g.fillRect(16 - w2 / 2, pad + r * 2, w2, 2); }
    deco({ g, colL, colR, pad });
    cv.anchorY = pad + hgt;
  });
}
function bakeTownSprites() {
  bakeLandmark('postoffice', 26, (d) => {
    const { g, colL, colR, pad } = d;
    for (let x = 0; x < 16; x++) colL(x, 0, 26, x % 4 === 3 ? PAL.B2 : PAL.B3);  // warm brick front
    for (let x = 0; x < 16; x++) colL(x, 0, 2, PAL.C3);                          // cornice
    for (let x = 0; x < 16; x++) colR(x, 0, 2, PAL.C2);
    for (let x = 1; x <= 2; x++) colL(x, 5, 4, PAL.GL1);                         // front windows
    for (let x = 13; x <= 14; x++) colL(x, 5, 4, PAL.GL1);
    px(g, 0, pad + 18, 17, 7, PAL.RS1);                                          // hanging sign board
    drawText3x5(g, 1, pad + 19, 'POST', PAL.YL);
    for (let x = 5; x <= 10; x++) colL(x, 16, 1, PAL.C3);                        // lintel
    for (let x = 5; x <= 10; x++) colL(x, 17, 9, PAL.WD1);                       // double door
    for (let x = 6; x <= 9; x++) colL(x, 18, 7, x === 7 || x === 8 ? PAL.WD1 : PAL.WD2);
    for (let x = 3; x <= 4; x++) colR(x, 6, 18, PAL.YL);                         // brass pneumatic tube
    for (let x = 3; x <= 4; x++) colR(x, 5, 1, PAL.L2);
    for (let x = 8; x <= 11; x++) colR(x, 9, 4, PAL.GL1);                        // side window
    px(g, 15, pad - 5, 1, 6, PAL.OUT);                                           // rooftop postal flag
    px(g, 12, pad - 5, 4, 3, PAL.V1); px(g, 12, pad - 5, 4, 1, PAL.V2);
  });
  bakeLandmark('recordshall', 22, (d) => {
    const { g, colL, colR, pad } = d;
    for (let x = 0; x < 16; x++) colL(x, 0, 22, PAL.S2);                         // slate archive front
    for (const xx of [1, 2, 13, 14]) colL(xx, 3, 19, PAL.S3);                    // pilasters
    for (let x = 0; x < 16; x++) colL(x, 0, 2, PAL.C3);                          // frieze
    px(g, 5, pad + 14, 6, 3, PAL.CU1); px(g, 6, pad + 15, 4, 1, PAL.CU2);        // copper scroll emblem
    for (let x = 6; x <= 9; x++) colL(x, 12, 10, PAL.WD1);                       // tall archive door
    for (let x = 7; x <= 8; x++) colL(x, 13, 8, PAL.WD2);
    for (let x = 3; x <= 4; x++) colL(x, 6, 4, PAL.GL3);
    for (let x = 11; x <= 12; x++) colL(x, 6, 4, PAL.GL3);
    for (let x = 3; x <= 6; x++) colR(x, 8, 4, PAL.GL3);
    for (let x = 9; x <= 12; x++) colR(x, 8, 4, PAL.GL3);
  });
  bakeSprite('newsstand', 20, 18, (g) => {
    px(g, 2, 7, 16, 9, PAL.WD2);                            // kiosk body
    px(g, 3, 9, 6, 5, PAL.C3); px(g, 11, 9, 6, 5, PAL.C3);  // paper racks
    px(g, 4, 10, 4, 1, PAL.OUT); px(g, 4, 12, 4, 1, PAL.OUT);
    px(g, 12, 10, 4, 1, PAL.OUT); px(g, 12, 12, 4, 1, PAL.OUT);
    for (let i = 0; i < 10; i++) px(g, i * 2, 4, 2, 2, i % 2 ? PAL.WH : PAL.RD); // awning
    px(g, 0, 6, 20, 1, PAL.OUT);
    px(g, 0, 0, 20, 4, PAL.RS1);                            // masthead
    drawText3x5(g, 1, 0, 'DAILY', PAL.WH);
    px(g, 2, 16, 2, 2, PAL.WD1); px(g, 16, 16, 2, 2, PAL.WD1);
  });
  bakeSprite('plaque_dark', 11, 12, (g) => {
    px(g, 2, 9, 7, 3, PAL.P1);                               // plinth
    px(g, 3, 2, 5, 7, PAL.S2); px(g, 4, 3, 3, 5, PAL.S1);    // blank slate face
  });
  bakeSprite('plaque_lit', 11, 12, (g) => {
    px(g, 2, 9, 7, 3, PAL.P1);
    px(g, 3, 2, 5, 7, PAL.S2); px(g, 4, 3, 3, 5, PAL.RS1);
    px(g, 4, 3, 3, 1, PAL.TG); px(g, 4, 5, 3, 1, PAL.TG); px(g, 4, 7, 2, 1, PAL.TG);
  });
  // one small board by each door - deliberately quiet street furniture
  bakeSprite('doorboard', 6, 9, (g) => {
    px(g, 1, 6, 1, 3, PAL.WD1); px(g, 4, 6, 1, 3, PAL.WD1);   // legs
    px(g, 0, 1, 6, 6, PAL.WD1); px(g, 1, 2, 4, 4, PAL.P2);    // dark frame, grey cork
    px(g, 2, 3, 2, 1, PAL.P1);
  });
  bakeSprite('doorboard_pin', 6, 9, (g) => {
    px(g, 1, 6, 1, 3, PAL.WD1); px(g, 4, 6, 1, 3, PAL.WD1);
    px(g, 0, 1, 6, 6, PAL.WD1); px(g, 1, 2, 4, 4, PAL.P2);
    px(g, 2, 2, 2, 3, PAL.WH); px(g, 2, 2, 1, 1, PAL.RD);     // a fresh paper, pinned
  });
  // a fenced patch with a plain sign: nobody links here yet
  bakeSprite('vacantlot', 17, 15, (g) => {
    for (let i = 0; i < 5; i++) px(g, 1 + i * 3, 8, 1, 6, PAL.WD1);  // fence posts
    px(g, 1, 9, 13, 1, PAL.WD3); px(g, 1, 11, 13, 1, PAL.WD2);       // rails
    px(g, 3, 13, 2, 1, PAL.G2); px(g, 8, 13, 3, 1, PAL.G2);          // weeds through the gravel
    px(g, 6, 12, 1, 1, PAL.G3);
    px(g, 8, 0, 9, 8, PAL.WD1);                                      // the signboard
    px(g, 9, 1, 7, 6, PAL.C3);
    drawText3x5(g, 11, 1, '0', PAL.RS1);       // zero pages link here
    px(g, 9, 5, 7, 1, PAL.RD);
    px(g, 11, 8, 1, 6, PAL.WD1);                                     // its post
  });
  // the night-shift lantern: a hanging lamp on a wire, mint glass round a warm
  // wick, so it never reads as one more lit window
  bakeSprite('nlantern', 7, 13, (g) => {
    px(g, 3, 0, 1, 4, PAL.S1);                                // wire
    px(g, 2, 3, 3, 1, PAL.S3);                                // ring
    px(g, 1, 4, 5, 1, PAL.S1);                                // cap
    px(g, 1, 5, 5, 5, PAL.TG2);                               // glass frame
    px(g, 2, 5, 3, 5, PAL.TG);                                // glass
    px(g, 3, 6, 1, 3, PAL.L1);                                // the wick, burning warm
    px(g, 2, 7, 1, 1, '#d8ffe8'); px(g, 4, 6, 1, 1, '#d8ffe8');
    px(g, 1, 10, 5, 1, PAL.S1);                               // base
    px(g, 3, 11, 1, 2, PAL.S3);                               // finial
  });
  bakeSprite('nlanternglow', 22, 18, (g) => {
    for (let y = 0; y < 18; y++) for (let x = 0; x < 22; x++) {
      const dd = ((x - 11) / 10.5) ** 2 + ((y - 9) / 8.5) ** 2;
      if (dd <= 1) { g.fillStyle = `rgba(132,240,180,${(0.34 * (1 - dd) ** 1.3).toFixed(3)})`; g.fillRect(x, y, 1, 1); }
    }
  }, true);
  // FIRST LANDFALL: the warm halo a beacon throws, and the smaller one a paper
  // lantern throws on the water. Baked, so the celebration costs no per-pixel work.
  bakeSprite('beaconglow', 30, 26, (g) => {
    for (let y = 0; y < 26; y++) for (let x = 0; x < 30; x++) {
      const dd = ((x - 15) / 14.5) ** 2 + ((y - 13) / 12.5) ** 2;
      if (dd <= 1) { g.fillStyle = `rgba(255,207,94,${(0.30 * (1 - dd) ** 1.4).toFixed(3)})`; g.fillRect(x, y, 1, 1); }
    }
  }, true);
  bakeSprite('driftlamp', 5, 8, (g) => {
    px(g, 0, 0, 5, 5, PAL.OUT);          // paper lantern: dark frame, warm body
    px(g, 1, 1, 3, 3, PAL.L1);
    px(g, 1, 3, 3, 1, PAL.L2);
    px(g, 1, 1, 1, 1, PAL.WH);
    px(g, 1, 6, 3, 1, PAL.L2);           // the light the water gives back
  }, true);
  bakeSprite('driftglow', 14, 12, (g) => {
    for (let y = 0; y < 12; y++) for (let x = 0; x < 14; x++) {
      const dd = ((x - 7) / 6.5) ** 2 + ((y - 6) / 5.5) ** 2;
      if (dd <= 1) { g.fillStyle = `rgba(255,207,94,${(0.30 * (1 - dd) ** 1.4).toFixed(3)})`; g.fillRect(x, y, 1, 1); }
    }
  }, true);
  /* ---- the portal network's six stations (owner ruling 3) ---- */
  // FOUR-COLOR FUNNIES: a sunny corner bookshop, a spinner rack of comics in
  // the big display window - three tiers of little covers in printer's colours
  bakeLandmark('funnies', 24, (d) => {
    const { g, colL, colR, pad } = d;
    for (let x = 0; x < 16; x++) colL(x, 0, 24, x % 5 === 4 ? PAL.B3 : PAL.B4);   // warm brick
    for (let x = 0; x < 16; x++) colL(x, 0, 2, PAL.RD);                           // painted fascia
    for (let x = 0; x < 16; x++) colR(x, 0, 24, PAL.B3);
    for (let x = 0; x < 16; x++) colR(x, 0, 2, PAL.B2);
    for (let x = 1; x <= 9; x++) colL(x, 11, 10, PAL.GL2);                        // display window
    colL(5, 12, 9, PAL.A1);                                                        // the rack's pole
    const CMYK = ['#3bc3e8', '#e0559e', PAL.YL, PAL.OUT];                          // four-colour press
    for (let t = 0; t < 3; t++) for (let x = 2; x <= 8; x += 2) colL(x, 13 + t * 3, 2, CMYK[(t + (x >> 1)) & 3]);
    for (let x = 12; x <= 14; x++) colL(x, 15, 9, x === 13 ? PAL.WD2 : PAL.WD1);  // shop door
    for (let x = 4; x <= 7; x++) colR(x, 8, 4, PAL.GL1);                          // side window
    px(g, 1, pad + 17, 30, 7, PAL.RS1);                                            // the marquee
    drawText3x5(g, 2, pad + 18, 'FUNNIES', PAL.YL);
  });
  // THE HOBBY SHOP: a quiet slate front, the blind drawn all the way down.
  // (2026-09-05, r15, owner order: THE KIT IS ARCHIVED - silent scenery now;
  // nothing glimpsed, nothing offered.)
  bakeLandmark('hobbyshop', 22, (d) => {
    const { g, colL, colR, pad } = d;
    for (let x = 0; x < 16; x++) colL(x, 0, 22, PAL.S2);
    for (let x = 0; x < 16; x++) colL(x, 0, 2, PAL.S3);
    for (let x = 0; x < 16; x++) colR(x, 0, 22, PAL.S1);
    for (let x = 2; x <= 9; x++) colL(x, 10, 9, PAL.DW);       // dark glass
    for (let x = 2; x <= 9; x++) colL(x, 10, 9, PAL.C2);       // the blind, drawn
    for (let x = 12; x <= 14; x++) colL(x, 13, 9, PAL.WD2);    // door
    px(g, 1, pad + 16, 23, 7, PAL.RS1);
    drawText3x5(g, 2, pad + 17, 'HOBBY', PAL.WH);
  });
  // THE BOTANIST STALL: leaf-green awning, pressed flowers under glass on the
  // counter, dried bundles hanging from the bar
  bakeSprite('botaniststall', 16, 16, (g) => {
    px(g, 1, 9, 1, 6, PAL.WD1); px(g, 14, 9, 1, 6, PAL.WD1);   // legs
    px(g, 1, 9, 14, 3, PAL.WD3);                                // counter
    for (let i = 0; i < 4; i++) {                               // pressed-flower cards
      px(g, 2 + i * 3, 10, 2, 2, PAL.WH);
      px(g, 2 + i * 3, 10, 1, 1, [PAL.RD, PAL.YL, '#e088c8', PAL.V2][i]);
    }
    for (let x = 0; x < 16; x += 2) px(g, x, 4 + ((x >> 1) & 1), 2, 3, ((x >> 2) & 1) ? PAL.G3 : PAL.WH);
    px(g, 0, 7, 16, 1, PAL.OUT);
    px(g, 3, 8, 1, 2, PAL.G1); px(g, 8, 8, 1, 3, PAL.CU1); px(g, 12, 8, 1, 2, PAL.G2);
  });
  // THE TRAIL GATE: a wooden fingerpost at the town edge; the boards point
  // off the map and the words live in the prompt when you walk up
  bakeSprite('fingerpost', 18, 20, (g) => {
    px(g, 8, 3, 2, 16, PAL.WD1);                                // the post
    px(g, 7, 18, 4, 1, PAL.WD2);                                // its foot
    px(g, 2, 4, 13, 4, PAL.WD3); px(g, 1, 5, 1, 2, PAL.WD3);    // top board, tipped west
    px(g, 3, 5, 10, 1, PAL.RS1);                                // carved lettering line
    px(g, 3, 9, 12, 3, PAL.WD3); px(g, 15, 10, 1, 1, PAL.WD3);  // lower board, tipped east
    px(g, 4, 10, 9, 1, PAL.RS1);
  });
  // THE OBSERVATORY: a stone tower on its own grass mound, copper dome with a
  // dark slit, the telescope barrel poking at the sky
  bakeSprite('observatory', 26, 30, (g) => {
    for (let i = 0; i < 5; i++) px(g, 3 + i, 29 - i, 20 - 2 * i, 1, i > 2 ? PAL.G3 : PAL.G2); // the hill
    px(g, 8, 14, 10, 12, PAL.C2); px(g, 15, 14, 3, 12, PAL.C1); // tower + shaded face
    px(g, 9, 17, 2, 2, PAL.GL3); px(g, 13, 19, 2, 2, PAL.GL3);  // slit windows
    px(g, 12, 21, 3, 5, PAL.WD1);                               // door
    for (let yy = 0; yy < 8; yy++) {                            // copper dome
      const w = Math.round(Math.sqrt(Math.max(0, 1 - ((7 - yy) / 7.2) ** 2)) * 7);
      px(g, 13 - w, 6 + yy, w * 2, 1, PAL.CU1);
      px(g, 13 - w, 6 + yy, Math.max(1, w), 1, PAL.CU2);
    }
    px(g, 12, 6, 2, 8, PAL.TD);                                 // the open slit
    px(g, 12, 3, 2, 4, PAL.A2); px(g, 13, 1, 2, 3, PAL.A1);     // the telescope barrel
  });
  // THE ENGRAVED SLOOP: she sails by an older hand - pen-and-ink on cream,
  // hatched like a copperplate, no pixel outline pass at all
  bakeSprite('sloop', 30, 30, (g) => {
    const INK = '#2e2418', CRM = '#efe3c4', CRM2 = '#e2d2a8';
    px(g, 3, 22, 24, 1, INK);                                   // sheer line
    px(g, 4, 23, 22, 1, CRM); px(g, 5, 24, 20, 1, CRM2);        // planking
    px(g, 6, 25, 18, 1, CRM);
    px(g, 5, 26, 20, 1, INK);                                   // keel
    for (let x = 6; x < 24; x += 2) px(g, x, 24, 1, 1, INK);    // engraver's ticks
    px(g, 14, 4, 1, 18, INK);                                   // mast
    px(g, 8, 21, 14, 1, INK);                                   // boom
    for (let y = 5; y <= 19; y++) {                             // mainsail, hatched
      const w = Math.max(1, Math.round((y - 4) * 0.85));
      px(g, 15, y, w, 1, (y & 1) ? CRM : CRM2);
      px(g, 15 + w, y, 1, 1, INK);                              // leech line
    }
    for (let y = 8; y <= 19; y++) {                             // jib, hatched the other way
      const w = Math.max(1, Math.round((y - 7) * 0.55));
      px(g, 13 - w, y, w, 1, (y & 1) ? CRM2 : CRM);
    }
    px(g, 14, 3, 1, 1, INK); px(g, 12, 3, 2, 1, INK);           // truck + ink pennant
    for (let x = 1; x < 29; x++) px(g, x, 27 + ((x >> 1) & 1), 1, 1, x % 5 ? INK : CRM2); // engraved sea
    px(g, 2, 29, 26, 1, INK);
  }, true);
  // THE HARBOUR STEAMER: rubber-hose cartoon - round black hull, white trim,
  // pie-cut eyes on the bow. The second bake is the wink.
  const steamerFace = (g, wink) => {
    px(g, 2, 11, 22, 7, PAL.OUT);                               // hull
    px(g, 3, 10, 20, 1, PAL.OUT); px(g, 4, 18, 18, 1, PAL.OUT); // rounded ends
    px(g, 3, 11, 20, 1, PAL.WH);                                // gunwale stripe
    px(g, 16, 3, 4, 8, PAL.OUT); px(g, 15, 2, 4, 2, PAL.OUT);   // funnel with a droop
    px(g, 16, 5, 4, 1, PAL.WH);
    px(g, 7, 6, 8, 5, PAL.OUT); px(g, 8, 7, 6, 3, PAL.WH);      // wheelhouse
    // the eyes, on the bow where a face belongs
    px(g, 5, 12, 4, 4, PAL.WH); px(g, 11, 12, 4, 4, PAL.WH);
    if (wink) {
      px(g, 5, 14, 4, 1, PAL.OUT);                              // right eye squeezed shut
      px(g, 11, 14, 2, 2, PAL.OUT);                             // pie-cut pupil
    } else {
      px(g, 5, 14, 2, 2, PAL.OUT); px(g, 11, 14, 2, 2, PAL.OUT); // pie-cut pupils
    }
    px(g, 6, 17, 1, 1, PAL.WH); px(g, 7, 18, 3, 1, PAL.WH); px(g, 10, 17, 1, 1, PAL.WH); // the grin
    px(g, 1, 19, 5, 1, PAL.W4); px(g, 19, 19, 6, 1, PAL.W4);    // foam at the waterline
  };
  bakeSprite('steamer', 26, 20, (g) => steamerFace(g, false));
  bakeSprite('steamer_wink', 26, 20, (g) => steamerFace(g, true));
  for (const nm of ['postoffice', 'recordshall', 'newsstand', 'doorboard', 'doorboard_pin', 'vacantlot',
                    'funnies', 'hobbyshop', 'botaniststall', 'fingerpost', 'observatory']) {
    SPR[nm + '_wi'] = snowify(SPR[nm]);
    if (SPR[nm].anchorY !== undefined) SPR[nm + '_wi'].anchorY = SPR[nm].anchorY;
  }
}

/* ---- placement: BFS-safe plaza landmarks + per-door props ---------------- */
function trialSolid(tiles) {
  // temporarily claim tiles; keep them only if every door stays reachable AND
  // the spawn keeps its room law (6 clear tiles down all four streets, 55%
  // open within 10) - the courier now lands at the plaza edge, so late stone
  // could otherwise squeeze the landing without stranding a single door
  for (const k of tiles) propSolid.add(k);
  const r = walkBFS();
  const sx = Math.floor(player.x), sy = Math.floor(player.y);
  const ok = r.stranded.length === 0 && !!r.seen[sy * Wt + sx] &&
    spawnRoomOK(spawnTile[0], spawnTile[1]);
  if (!ok) for (const k of tiles) propSolid.delete(k);
  return ok;
}
function placeTownLife() {
  const G2 = (x, y) => y * Wt + x;
  const freeTile = (tx, ty) => tx > 0 && ty > 0 && tx < Wt - 1 && ty < Ht - 1 &&
    playerWalkable(grid[G2(tx, ty)]) && !propSolid.has(tx + ',' + ty) && !doorTiles.has(tx + ',' + ty);
  const spx = player.x, spy = player.y;
  const dist = (tx, ty) => Math.hypot(tx + 0.5 - spx, ty + 0.5 - spy);
  doorBySlug = {};
  for (const d of doors) doorBySlug[d.slug] = d;
  const bBySlug = {};
  for (const b of buildings) bBySlug[b.slug] = b;
  for (const d of doors) d.bld = bBySlug[d.slug];

  // openness: how much of the 5x5 around a tile is NOT a building lot. A civic
  // landmark wants sky around it, or it reads as one more shopfront in the row.
  const openness = (tx, ty) => {
    let o = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      if (tileAt(tx + dx, ty + dy) !== T.LOT) o++;
    }
    return o;
  };
  const cands = [];
  for (let ty = 1; ty < Ht - 1; ty++) for (let tx = 1; tx < Wt - 1; tx++) {
    if (!freeTile(tx, ty)) continue;
    cands.push({ tx, ty, t2: grid[G2(tx, ty)], d: dist(tx, ty), op: openness(tx, ty) });
  }
  cands.sort((a, b) => a.d - b.d);
  // civic sites stand on paving, and keep their elbows to themselves
  const civic = [];
  const paved = (c) => c.t2 === T.PLAZA || c.t2 === T.PAVE || c.t2 === T.BANK;
  const clear = (c, sep) => civic.every(v => Math.hypot(v[0] - c.tx, v[1] - c.ty) >= sep);
  const spawnKey = Math.floor(spx) + ',' + Math.floor(spy);
  const takenTiles = new Set([spawnKey]);
  // the square keeps its middle and its four streets: civic stone stands on
  // the rim, never in the way of the first strides out of town
  const coreR = plazaCore ? plazaCore.r : 2;
  const sx0 = spawnTile[0], sy0 = spawnTile[1];
  const offAxis = (tx, ty, w, d) => {
    for (let dx = 0; dx < w; dx++) for (let dy = 0; dy < d; dy++) {
      const ax = tx + dx, ay = ty + dy;
      if ((ax === sx0 || ay === sy0) && Math.hypot(ax - sx0, ay - sy0) <= coreR + PLAZA_ARM) return false;
    }
    return true;
  };
  // stone belongs on the rim of the square or beyond it, never inside - held
  // against the SPAWN (so nothing crowds the landing) and against the square's
  // own middle (the spawn sits at the edge now, and Chebyshev distance from an
  // edge tile alone would let stone stand in the very centre of the plaza)
  const ccx = plazaCore ? plazaCore.cx : sx0, ccy = plazaCore ? plazaCore.cy : sy0;
  const rimOrOut = (tx, ty, w, d) => {
    for (let dx = 0; dx < w; dx++) for (let dy = 0; dy < d; dy++) {
      if (Math.max(Math.abs(tx + dx - sx0), Math.abs(ty + dy - sy0)) < coreR) return false;
      if (Math.max(Math.abs(tx + dx - ccx), Math.abs(ty + dy - ccy)) < coreR) return false;
    }
    return true;
  };

  const place2x2 = (name, wantPlaza, dMin, dMax, minOpen, sep) => {
    for (const c of cands) {
      if (c.d < dMin || c.d > dMax) continue;
      if (wantPlaza !== (c.t2 === T.PLAZA)) continue;
      if (!paved(c) || !clear(c, sep === undefined ? 7 : sep)) continue;
      if (c.op < (minOpen === undefined ? 23 : minOpen)) continue;
      if (openness(c.tx + 1, c.ty + 1) < (minOpen === undefined ? 23 : minOpen)) continue;
      if (!offAxis(c.tx, c.ty, 2, 2) || !rimOrOut(c.tx, c.ty, 2, 2)) continue;
      const tiles = [];
      let ok = true;
      for (let dy = 0; dy < 2 && ok; dy++) for (let dx = 0; dx < 2 && ok; dx++) {
        const k = (c.tx + dx) + ',' + (c.ty + dy);
        if (!freeTile(c.tx + dx, c.ty + dy) || takenTiles.has(k)) ok = false; else tiles.push(k);
      }
      if (!ok) continue;
      if (!freeTile(c.tx, c.ty + 2) && !freeTile(c.tx + 1, c.ty + 2)) continue;  // approachable front
      if (!trialSolid(tiles)) continue;
      tiles.forEach(k => takenTiles.add(k));
      civic.push([c.tx + 0.5, c.ty + 0.5]);
      propList.push({ kind: 'landmark', name, tx: c.tx, ty: c.ty, w: 2, d: 2 });
      return c;
    }
    return null;
  };
  const place1 = (kind, wantPlaza, dMin, dMax, minOpen, sep) => {
    for (const c of cands) {
      if (c.d < dMin || c.d > dMax) continue;
      if (wantPlaza && c.t2 !== T.PLAZA) continue;
      if (!paved(c) || !clear(c, sep === undefined ? 4 : sep)) continue;
      if (c.op < (minOpen === undefined ? 21 : minOpen)) continue;
      const k = c.tx + ',' + c.ty;
      if (!freeTile(c.tx, c.ty) || takenTiles.has(k)) continue;
      if (!offAxis(c.tx, c.ty, 1, 1) || !rimOrOut(c.tx, c.ty, 1, 1)) continue;
      if ((freeTile(c.tx - 1, c.ty) && freeTile(c.tx + 1, c.ty)) || (freeTile(c.tx, c.ty - 1) && freeTile(c.tx, c.ty + 1))) {
        if (!trialSolid([k])) continue;
        takenTiles.add(k);
        civic.push([c.tx, c.ty]);
        propList.push({ kind, tx: c.tx, ty: c.ty });
        return c;
      }
    }
    return null;
  };

  const RIM = coreR - 0.5;   // the rim rule above keeps them off the middle; this keeps them near
  const po = place2x2('postoffice', true, RIM, 16) || place2x2('postoffice', false, RIM, 22) ||
             place2x2('postoffice', true, RIM, 30, 18) || place2x2('postoffice', false, RIM, 34, 16);
  if (po) spots.push({ kind: 'post', title: 'POST OFFICE', row: 'WRITE A LETTER ABOUT A PAGE', ix: po.tx + 1, iy: po.ty + 2.35 });
  const ns = place1('newsstand', true, RIM, coreR + 4, 12, 3) || place1('newsstand', true, RIM, 12) ||
             place1('newsstand', false, RIM, 18) || place1('newsstand', false, RIM, 30, 16);
  if (ns) spots.push({ kind: 'news', title: 'THE DAILY DOCS', row: 'GRAB THE PAPER', ix: ns.tx + 0.5, iy: ns.ty + 1.35 });
  const pq = place1('plaque', true, RIM, coreR + 4, 12, 3) || place1('plaque', true, RIM, 12) ||
             place1('plaque', false, RIM, 18) || place1('plaque', false, RIM, 30, 16);
  if (pq) spots.push({ kind: 'plaque', title: 'PLAZA PLAQUE', row: 'TAKE A CLOSER LOOK', ix: pq.tx + 0.5, iy: pq.ty + 1.35 });
  const rh = place2x2('recordshall', false, 14, 30, 23, 13) || place2x2('recordshall', true, 14, 30, 23, 13) ||
             place2x2('recordshall', false, 10, 44, 18, 10) || place2x2('recordshall', false, 6, 60, 16, 6);
  if (rh) spots.push({ kind: 'hall', title: 'RECORDS HALL', row: 'BROWSE THE LEDGERS', ix: rh.tx + 1, iy: rh.ty + 2.35 });

  // one small noticeboard beside every door (non-solid: walkability untouched)
  for (const d of doors) propList.push({ kind: 'board', slug: d.slug });

  // vacant lots beside the zero-inbound pages (non-solid fenced patches)
  let placedVacant = 0;
  for (const slug of TOWN.vacant) {
    const b = bBySlug[slug];
    if (!b) continue;
    const per = [];
    for (let dx = -1; dx <= b.fw; dx++) { per.push([b.tx + dx, b.ty + b.fd]); per.push([b.tx + dx, b.ty - 1]); }
    for (let dy = 0; dy < b.fd; dy++) { per.push([b.tx - 1, b.ty + dy]); per.push([b.tx + b.fw, b.ty + dy]); }
    const st = townHash(slug) % per.length;
    let done = false;
    for (let i = 0; i < per.length && !done; i++) {
      const [tx, ty] = per[(st + i) % per.length];
      const k = tx + ',' + ty;
      if (!freeTile(tx, ty) || takenTiles.has(k)) continue;
      takenTiles.add(k);
      propList.push({ kind: 'vacant', tx, ty, slug });
      spots.push({ kind: 'vacant', slug, title: 'BE THE FIRST', row: 'NOBODY LINKS HERE YET', ix: tx + 0.5, iy: ty + 0.5 });
      placedVacant++; done = true;
    }
    if (!done) {  // marker beside the door itself, offset a few px
      const d = doorBySlug[slug];
      if (d) {
        const tx = Math.floor(d.px), ty = Math.floor(d.py);
        propList.push({ kind: 'vacant', tx, ty, slug, dx: 10 });
        spots.push({ kind: 'vacant', slug, title: 'BE THE FIRST', row: 'NOBODY LINKS HERE YET', ix: tx + 0.5, iy: ty + 0.5 });
        placedVacant++;
      }
    }
  }
  TOWN.vacantPlaced = placedVacant;

  /* ---- THE PORTAL NETWORK: five stations, six berths (r15) ---------------- */
  // Everything below stands in the same door grammar as the civic landmarks:
  // trial-fitted against the walk BFS where it claims ground, spot + prompt +
  // ENTER like every other threshold in town.
  const portalSpot = (kind, ix, iy) => {
    const P = PORTAL_BY_KIND[kind];
    if (!P) return false;   // a berth whose destination left the mains places nothing
    spots.push({ kind, title: P.title, row: P.hint, ix, iy });
    return true;
  };
  let portalsPlaced = 0;
  // (a) FOUR-COLOR FUNNIES - a bookshop in the streets, sky around it
  const fb = place2x2('funnies', false, 12, 26, 20, 9) || place2x2('funnies', true, 12, 30, 18, 8) ||
             place2x2('funnies', false, 8, 40, 16, 7) || place2x2('funnies', false, 6, 60, 14, 5);
  if (fb) { portalSpot('funnies', fb.tx + 1, fb.ty + 2.35); portalsPlaced++; }
  // (f) THE HOBBY SHOP - further out, on a quieter street. (2026-09-05, r15,
  // owner order: THE KIT IS ARCHIVED.) The shopfront stays as silent scenery,
  // blind drawn - no spot, no prompt, no crossing, and it does not count.
  place2x2('hobbyshop', false, 18, 34, 18, 9) || place2x2('hobbyshop', true, 14, 34, 16, 8) ||
    place2x2('hobbyshop', false, 8, 46, 15, 6) || place2x2('hobbyshop', false, 6, 60, 14, 5);
  // (e) THE BOTANIST STALL - at the market, with the other stalls on the square
  const bt = place1('botanist', true, RIM, coreR + 6, 12, 3) || place1('botanist', true, RIM, 14) ||
             place1('botanist', false, RIM, 22) || place1('botanist', false, RIM, 34, 16);
  if (bt) { portalSpot('botanist', bt.tx + 0.5, bt.ty + 1.35); portalsPlaced++; }
  // the custom sites check reachability against the same BFS the doors use
  const seen0 = walkBFS().seen;
  const reachable = (tx, ty) => !!seen0[ty * Wt + tx];
  const seaBeside = (tx, ty) => {
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      if (tileAt(tx + dx, ty + dy) === T.SEA) return [tx + dx, ty + dy];
    }
    return null;
  };
  // (b) THE HARBOUR - the longest clear run of reachable waterfront, and two
  // vessels moored off it: the engraved sloop and the rubber-hose steamer
  const front = [];
  for (const c of cands) {
    if (c.t2 !== T.BANK || !reachable(c.tx, c.ty)) continue;
    const sea = seaBeside(c.tx, c.ty);
    if (sea) front.push({ tx: c.tx, ty: c.ty, sea });
  }
  // group the waterfront into straight runs (same row or same column)
  front.sort((a, b) => a.ty - b.ty || a.tx - b.tx);
  const runKey = (f) => (f.sea[0] === f.tx ? 'h' + f.ty : 'v' + f.tx);   // sea above/below vs left/right
  const runs = {};
  for (const f of front) (runs[runKey(f)] = runs[runKey(f)] || []).push(f);
  let harbour = null;
  for (const k of Object.keys(runs).sort()) {
    const r = runs[k];
    r.sort((a, b) => (a.tx - b.tx) || (a.ty - b.ty));
    // longest consecutive stretch within the run
    let s0 = 0;
    for (let i = 1; i <= r.length; i++) {
      const cont = i < r.length && (r[i].tx - r[i - 1].tx) + (r[i].ty - r[i - 1].ty) === 1;
      if (!cont) {
        const len = i - s0;
        if (!harbour || len > harbour.len) harbour = { len, seg: r.slice(s0, i) };
        s0 = i;
      }
    }
  }
  let moor1 = null, moor2 = null;
  if (harbour && harbour.len >= 2) {
    const seg = harbour.seg, mid = seg.length >> 1;
    const gap = Math.min(2, Math.floor((seg.length - 1) / 2));
    moor1 = seg[Math.max(0, mid - gap)];
    moor2 = seg[Math.min(seg.length - 1, mid + gap)];
    if (moor1 === moor2) { moor1 = seg[0]; moor2 = seg[seg.length - 1]; }
  }
  if (moor1 && moor2 && moor1 !== moor2) {
    propList.push({ kind: 'vessel', name: 'sloop', tx: moor1.sea[0], ty: moor1.sea[1] });
    portalSpot('sloop', moor1.tx + 0.5, moor1.ty + 0.5); portalsPlaced++;
    const stm = { kind: 'vessel', name: 'steamer', tx: moor2.sea[0], ty: moor2.sea[1] };
    propList.push(stm); steamerProp = stm;
    portalSpot('steamer', moor2.tx + 0.5, moor2.ty + 0.5); portalsPlaced++;
  }
  const farFromMoor = (tx, ty) => (!moor1 || Math.hypot(tx - moor1.tx, ty - moor1.ty) > 8) &&
                                  (!moor2 || Math.hypot(tx - moor2.tx, ty - moor2.ty) > 8);
  // (d) THE TRAIL GATE - the farthest reachable ground where the land runs
  // out. (2026-09-05, r15, owner screenshot: the post stood mute at night in
  // the rain.) Made robust two ways: the spot registers FIRST and the post
  // only goes down once it has - a fingerpost that cannot speak is forbidden -
  // and if the strict site scan finds nothing the conditions relax in tiers
  // (drop the mooring clearance, then the sea edge) so the gate always lands
  // on reachable ground.
  let tgDone = false;
  const tgTry = (needSea, needFar) => {
    for (let i = cands.length - 1; i >= 0 && !tgDone; i--) {
      const c = cands[i];
      if (needSea && !seaBeside(c.tx, c.ty)) continue;
      if (needFar && !farFromMoor(c.tx, c.ty)) continue;
      if (!reachable(c.tx, c.ty)) continue;
      if (!freeTile(c.tx, c.ty) || takenTiles.has(c.tx + ',' + c.ty)) continue;
      // the spot speaks first; the post itself is street furniture: it never
      // claims the tile, so the rim path and the BFS stay exactly as proven
      if (!portalSpot('trailgate', c.tx + 0.5, c.ty + 0.5)) return;
      takenTiles.add(c.tx + ',' + c.ty);
      propList.push({ kind: 'trailgate', tx: c.tx, ty: c.ty });
      portalsPlaced++;
      tgDone = true;
    }
  };
  tgTry(true, true); tgTry(true, false); tgTry(false, false);
  // (c) THE OBSERVATORY - a far grass rise with sky around it, inland
  let obDone = false;
  const obTry = (needGrass, minOpen) => {
    for (let i = cands.length - 1; i >= 0 && !obDone; i--) {
      const c = cands[i];
      if (needGrass && c.t2 !== T.GRASS && c.t2 !== T.FLOWER) continue;
      if (!needGrass && !paved(c)) continue;
      if (c.op < minOpen || seaBeside(c.tx, c.ty) || !reachable(c.tx, c.ty)) continue;
      if (!freeTile(c.tx, c.ty) || takenTiles.has(c.tx + ',' + c.ty) || !clear(c, 5)) continue;
      // needs an approachable side, then claims its single tile BFS-safely
      if (!((freeTile(c.tx - 1, c.ty) && freeTile(c.tx + 1, c.ty)) || (freeTile(c.tx, c.ty - 1) && freeTile(c.tx, c.ty + 1)))) continue;
      if (!trialSolid([c.tx + ',' + c.ty])) continue;
      takenTiles.add(c.tx + ',' + c.ty);
      civic.push([c.tx, c.ty]);
      propList.push({ kind: 'observatory', tx: c.tx, ty: c.ty });
      portalSpot('observatory', c.tx + 0.5, c.ty + 1.35);
      portalsPlaced++; obDone = true;
    }
  };
  obTry(true, 18); obTry(true, 12); obTry(false, 16);
  TOWN.portalsPlaced = portalsPlaced;

  if (fireflyTally() >= TOWN.lanternTotal) plaqueEarned = true;   // remembered from this visit
  refreshFolk();
}

/* THE STREETS ARE THE CONTRIBUTORS.
   Every one of the 77 real hands is out in the town, all of them, all the time -
   they are the population, not a sample of it. What rotates is WHERE each one
   stands: a hand is tied to every page provenance says they touched, and the day
   of the cycle picks which of those pages they keep company today. So the whole
   77 are met the moment you walk out, and met again somewhere else tomorrow. */
function folkLineFor(name, slug) {
  // the same four shapes the record uses, told of the page they stand at today
  const v = PROV[slug];
  if (!v) return 'one of the seventy-seven';
  const n = (v.authors || []).length;
  if (v.topAuthor === name) {
    if (n === 1) return v.commits === 1 ? 'came once, fixed one thing' : `keeps this page - all ${v.commits} commits are theirs`;
    return `keeps this page - first hand of ${n}, over ${v.commits} commits`;
  }
  return n === 1 ? 'lent a hand here' : `one of ${n} hands on this page`;
}
/* CAN THE TOWN SEE THEM? A roof drawn in front of a person hides them, and in a
   2:1 dimetric town a five-storey block hides everything behind it for a dozen
   tiles - which is why the old twenty were so easy to miss. So a candidate tile
   is scored on the four camera directions the map can be turned to: a direction
   counts only if nothing in the cone in front of it is tall enough to cover a
   person's twelve pixels. Ground drops 4px per tile of depth, so a block d tiles
   ahead has to be taller than 4d to hide you. Open on 3 or 4 of the four is a
   place the town can see you from almost any view. */
let lotH = null;                   // per tile: how tall the building standing there is
function bakeLotHeights() {
  lotH = new Int16Array(Wt * Ht);
  for (const b of buildings) {
    const h = (b.fw + b.fd) * HH + (b.style === 'kiosk' ? 8 : b.s * SPX) + 10;
    for (let y = b.ty; y < b.ty + b.fd; y++) for (let x = b.tx; x < b.tx + b.fw; x++) {
      if (x >= 0 && y >= 0 && x < Wt && y < Ht) lotH[y * Wt + x] = h;
    }
  }
}
/* the four camera directions, in the order the map turns through them:
   depth is u+v, so the view's "towards you" is (+1,+1) at orient 0, (-1,+1) at
   1, (-1,-1) at 2 and (+1,-1) at 3. */
const VIEW_DIRS = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
const FOLK_VIS_CACHE = new Map();
function folkOpenViews(tx, ty) {
  const k = tx * 1000 + ty;
  let mask = FOLK_VIS_CACHE.get(k);
  if (mask === undefined) {
    if (!lotH) bakeLotHeights();
    mask = 0;
    for (let o = 0; o < 4; o++) {
      const [sx, sy] = VIEW_DIRS[o];
      let clear = true;
      for (let i = 0; i <= 9 && clear; i++) {
        for (let j = 0; j <= 9; j++) {
          const d = i + j;
          if (d < 1 || d > 12 || Math.abs(i - j) > 3) continue;
          const x = tx + sx * i, y = ty + sy * j;
          if (x < 0 || y < 0 || x >= Wt || y >= Ht) continue;
          if (lotH[y * Wt + x] > 4 * d - 2) { clear = false; break; }
        }
      }
      if (clear) mask |= 1 << o;
    }
    FOLK_VIS_CACHE.set(k, mask);
  }
  let n = 0;
  for (let o = 0; o < 4; o++) if (mask & (1 << o)) n++;
  // seen from as many of the four as possible, and - the tie-break - seen from
  // the one the town is being looked at from as they take up their post
  return n + ((mask & (1 << orient)) ? 1.4 : 0);
}

/* ROOM TO PASS: how far the pavement runs in each of the four street directions,
   capped at four apiece. A hand takes a spot people can walk up to and walk away
   from again, not a one-tile pocket where a conversation cannot be left. */
function folkRoom(tx, ty) {
  let n = 0, worst = 4;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    let k = 0, x = tx, y = ty;
    while (k < 4 && x + dx > 0 && y + dy > 0 && x + dx < Wt - 1 && y + dy < Ht - 1 &&
           playerWalkable(grid[(y + dy) * Wt + x + dx]) && !propSolid.has((x + dx) + ',' + (y + dy))) {
      x += dx; y += dy; k++;
    }
    n += k;
    if (k < worst) worst = k;
  }
  return [n, worst];   // pavement in total, and in the tightest of the four
}

/* WHERE A HAND STANDS. Not in the alley behind their page - out on the street in
   front of it, where the town can see them. Candidates are every free tile within
   two of their building's footprint; the pick is scored so the pavement beside a
   real street beats the gap between two blocks, because a gap is behind a roof
   from at least one of the four views and a street is open from all of them.
   Every doorstep keeps its 1.6 tiles of clearance, so walking to a door still
   raises the door's prompt and never a conversation. */
function folkPosts(b, hash, used) {
  const free = (tx, ty) => {
    const k = tx + ',' + ty;
    if (tx < 1 || ty < 1 || tx >= Wt - 1 || ty >= Ht - 1) return false;
    return playerWalkable(grid[ty * Wt + tx]) && !propSolid.has(k) && !doorTiles.has(k) && !used.has(k);
  };
  const nearAnyDoor = (tx, ty, r) => doors.some(d => Math.abs(d.px - tx - 0.5) < r && Math.abs(d.py - ty - 0.5) < r);
  const onStreet = (tx, ty) => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const t2 = tileAt(tx + dx, ty + dy);
      if (t2 === T.ROAD || t2 === T.CROSS || t2 === T.BRIDGE) return true;
    }
    return false;
  };
  const openViews = (tx, ty) => folkOpenViews(tx, ty);
  /* how far a hand may stand from the page they belong to: their own block, or
     - when the block is buried and every tile of it is behind a roof - the
     nearest street corner, still inside four tiles of their own door. */
  const dr = doorBySlug[b.slug];
  const cands = [];
  for (let ty = b.ty - 4; ty <= b.ty + b.fd + 3; ty++) {
    for (let tx = b.tx - 4; tx <= b.tx + b.fw + 3; tx++) {
      if (tx >= b.tx && tx < b.tx + b.fw && ty >= b.ty && ty < b.ty + b.fd) continue;   // the footprint
      const inLot = tx >= b.tx - 2 && tx <= b.tx + b.fw + 1 && ty >= b.ty - 2 && ty <= b.ty + b.fd + 1;
      const dDoor = dr ? Math.hypot(tx + 0.5 - dr.px, ty + 0.5 - dr.py) : 99;
      if (!inLot && dDoor > 3.4) continue;
      if (!free(tx, ty)) continue;
      const t2 = grid[ty * Wt + tx];
      if (t2 === T.ROAD) continue;                                     // nobody stands in the traffic
      let sc = openViews(tx, ty) * 9;                                  // seen from how many of the four views
      if (onStreet(tx, ty)) sc += 6;                                   // out on a street, not in a slot
      const [rmAll, rmMin] = folkRoom(tx, ty);
      sc += rmAll * 0.5 + rmMin * 1.6;                                 // room to pass, and room to leave in ANY direction
      if (t2 === T.PAVE || t2 === T.PLAZA) sc += 3;                    // pavement, not a back lawn
      if (tx >= b.tx + b.fw || ty >= b.ty + b.fd) sc += 1;             // the faces the default view shows
      sc -= (dr ? dDoor : Math.abs(tx - b.tx) + Math.abs(ty - b.ty)) * 0.7;
      cands.push({ tx, ty, sc, rmMin, jit: h32(tx, ty, hash & 0xffff) % 1000 });
    }
  }
  if (!cands.length) return null;
  cands.sort((a, c) => c.sc - a.sc || a.jit - c.jit);
  /* three sweeps, each giving up one thing: first a post clear of every doorstep
     with pavement running at least three tiles every way; then a doorstep-clear
     post with two; then whatever is free. */
  for (let pass = 0; pass < 3; pass++) {
    for (const c of cands) {
      if (pass === 0 && (nearAnyDoor(c.tx, c.ty, 1.6) || c.rmMin < 3)) continue;
      if (pass === 1 && (nearAnyDoor(c.tx, c.ty, 1.1) || c.rmMin < 2)) continue;
      // the second tile of their beat: one step along the street, still their block
      let pace = null;
      for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        const nx = c.tx + dx, ny = c.ty + dy;
        const nIn = nx >= b.tx - 2 && nx <= b.tx + b.fw + 1 && ny >= b.ty - 2 && ny <= b.ty + b.fd + 1;
        const nD = dr ? Math.hypot(nx + 0.5 - dr.px, ny + 0.5 - dr.py) : 99;
        if (!nIn && nD > 3.4) continue;          // the whole beat stays at their page
        if (!free(nx, ny) || nearAnyDoor(nx, ny, 1.6)) continue;
        if (grid[ny * Wt + nx] === T.ROAD) continue;
        pace = [nx, ny]; break;
      }
      return { post: [c.tx, c.ty], pace };
    }
  }
  return null;
}
function refreshFolk() {
  /* NOBODY VANISHES FROM UNDER YOUR NOSE. When the day turns and the hands move
     to another of their pages, the ones standing near the courier keep the post
     they are on - so a conversation in progress is a conversation you can finish,
     and the street you are looking at does not re-cast itself while you watch. */
  const stay = new Map();
  for (const f of folkVisible) {
    if (Math.hypot(player.x - f.px0, player.y - f.py0) < FOLK_HOLD) stay.set(f.name, f);
  }
  folkVisible = [];
  const used = new Set();
  for (const f of stay.values()) {
    folkVisible.push(f);
    used.add(Math.floor(f.px0) + ',' + Math.floor(f.py0));
    used.add(Math.floor(f.px1) + ',' + Math.floor(f.py1));
  }
  // the order hands claim their post rotates too, so a crowded block is not
  // always won by the same name
  const scored = townsfolk.map(f => ({ f, s: h32(f.hash & 0xffff, (f.hash >>> 16) + dayNum, 101) }));
  scored.sort((a, b) => a.s - b.s || a.f.name.localeCompare(b.f.name));
  for (const { f } of scored) {
    if (stay.has(f.name)) continue;
    // today's page: one of the pages provenance really ties this hand to
    const list = f.pages && f.pages.length ? f.pages : [{ slug: f.slug }];
    const pick = h32(f.hash & 0xffff, dayNum, 977) % list.length;
    let got = null, gotB = null, gotSlug = null;
    for (let i = 0; i < list.length && !got; i++) {
      const slug = list[(pick + i) % list.length].slug;
      const b = buildings.find(bb => bb.slug === slug);
      if (!b) continue;
      const p = folkPosts(b, f.hash, used);
      if (p) { got = p; gotB = b; gotSlug = slug; }
    }
    if (!got) continue;
    used.add(got.post[0] + ',' + got.post[1]);
    if (got.pace) used.add(got.pace[0] + ',' + got.pace[1]);
    const jx = 0.32 + ((f.hash >>> 3) % 40) / 100, jy = 0.32 + ((f.hash >>> 9) % 40) / 100;
    folkVisible.push({
      name: f.name, slug: gotSlug, line: folkLineFor(f.name, gotSlug), hash: f.hash, rec: f,
      px0: got.post[0] + jx, py0: got.post[1] + jy,
      px1: got.pace ? got.pace[0] + jx : got.post[0] + jx,
      py1: got.pace ? got.pace[1] + jy : got.post[1] + jy,
      x: got.post[0] + jx, y: got.post[1] + jy,
      leg: 0, legDir: 1, dwell: 1.5 + (f.hash % 90) / 10, moving: false, dir: null,
      theme: gotB.quarter.themeIdx, ph: (f.hash % 63) / 10
    });
  }
  rebuildExtras();
}
/* A HAND'S BEAT. They pace one step of their own block and back, and they hold
   still at their post whenever anyone is near enough to speak to them - so the
   person you walked up to is the person who is there when you arrive. Parked
   entirely under reduced motion. */
const FOLK_HOLD = 8;               // tiles: inside this, every hand stands at their post
function stepFolk(dt) {
  if (REDUCED || photoMode) return;
  for (const f of folkVisible) {
    const home = Math.hypot(player.x - f.px0, player.y - f.py0) < FOLK_HOLD;
    if (home) {
      if (f.leg > 0) { f.leg = Math.max(0, f.leg - dt * 0.55); f.moving = f.leg > 0; f.legDir = -1; }
      else { f.moving = false; f.legDir = 1; f.dwell = 1.5 + (f.hash % 90) / 10; }
    } else if (f.dwell > 0) { f.dwell -= dt; f.moving = false; }
    else {
      f.leg += dt * 0.55 * f.legDir;
      f.moving = true;
      if (f.leg >= 1) { f.leg = 1; f.legDir = -1; f.dwell = 2.5 + (f.hash % 70) / 10; }
      else if (f.leg <= 0) { f.leg = 0; f.legDir = 1; f.dwell = 2.5 + ((f.hash >>> 7) % 70) / 10; }
    }
    f.x = f.px0 + (f.px1 - f.px0) * f.leg;
    f.y = f.py0 + (f.py1 - f.py0) * f.leg;
    f.dir = f.moving ? [(f.px1 - f.px0) * f.legDir, (f.py1 - f.py0) * f.legDir] : null;
  }
}
function folkSpriteFor(f, frame) {
  const key = f.name + '|' + frame;
  if (FOLK_CACHE[key]) return FOLK_CACHE[key];
  const base = SPR[`ped${f.theme}_${frame}`];
  const [cv, g] = mkCv(base.width, base.height + 2);
  g.drawImage(base, 0, 2);
  const hats = [PAL.RD, PAL.YL, PAL.W3, PAL.V2, PAL.CU2, PAL.HB2, PAL.C3, PAL.TG];
  const hc = hats[f.hash % hats.length];
  if ((f.hash >>> 5) % 3 === 0) { px(g, 1, 1, 3, 1, hc); px(g, 2, 0, 1, 1, hc); }   // cap
  else if ((f.hash >>> 5) % 3 === 1) px(g, 1, 6, 3, 1, hc);                          // scarf
  else px(g, 3, 6, 1, 2, hc);                                                        // satchel strap
  FOLK_CACHE[key] = cv;
  return cv;
}

/* THE EXTRAS ARE NOT THE POPULATION ANY MORE. They are incidental - no name, no
   label, no talk prompt, no hat - and they exist only on the ground no hand is
   tied to: pavement more than FOLK_CLEAR tiles from every hand out today. They
   never walk into a hand's street, so wherever the pages are, everyone you pass
   can be named. The count is not a crowd size, it is one walker per EXTRA_PER
   tiles of that leftover ground, re-derived every time the hands move. */
const FOLK_CLEAR = 8;              // tiles of clear air a named hand keeps around them
const EXTRA_PER = 32;              // one extra per this many tiles of leftover ground
const EXTRA_PER_HAND = 6;          // and never more than one extra for six real hands
let extraOK = null;                // Uint8Array mask: ground an extra may use
let extraGround = 0;               // how many tiles of that leftover ground there are
function rebuildExtras() {
  if (!grid || !buildings.length) return;
  extraOK = new Uint8Array(Wt * Ht);
  for (let ty = 1; ty < Ht - 1; ty++) for (let tx = 1; tx < Wt - 1; tx++) {
    const t2 = grid[ty * Wt + tx];
    if ((t2 === T.PAVE || t2 === T.PLAZA || t2 === T.BANK) && !propSolid.has(tx + ',' + ty)) extraOK[ty * Wt + tx] = 1;
  }
  for (const f of folkVisible) {
    const cx = Math.floor(f.px0), cy = Math.floor(f.py0);
    for (let dy = -FOLK_CLEAR; dy <= FOLK_CLEAR; dy++) {
      const ty = cy + dy;
      if (ty < 0 || ty >= Ht) continue;
      for (let dx = -FOLK_CLEAR; dx <= FOLK_CLEAR; dx++) {
        const tx = cx + dx;
        if (tx < 0 || tx >= Wt) continue;
        if (dx * dx + dy * dy <= FOLK_CLEAR * FOLK_CLEAR) extraOK[ty * Wt + tx] = 0;
      }
    }
  }
  const free = [];
  for (let ty = 1; ty < Ht - 1; ty++) for (let tx = 1; tx < Wt - 1; tx++) if (extraOK[ty * Wt + tx]) free.push([tx, ty]);
  extraGround = free.length;
  // the hard ceiling: the anonymous can never be the population again. Whatever
  // the leftover ground measures, there is at most one extra for every six of
  // the 77 - so at least six walkers in seven have a name, by construction.
  const want = Math.min(Math.floor(free.length / EXTRA_PER),
                        Math.floor(folkVisible.length / EXTRA_PER_HAND));
  if (!peds.length && !free.length) return;
  // keep the extras already standing on good ground, top up or trim to `want`
  peds = peds.filter(p => extraOK[Math.floor(p.y) * Wt + Math.floor(p.x)]);
  while (peds.length > want) peds.pop();
  const roomToWalk = ([tx, ty]) => extraOK[ty * Wt + tx + 1] || extraOK[ty * Wt + tx - 1] ||
    extraOK[(ty + 1) * Wt + tx] || extraOK[(ty - 1) * Wt + tx];
  const open = free.filter(roomToWalk);
  while (peds.length < want && open.length) {
    const [tx, ty] = open[rint(open.length)];
    const qid = quarterOf[ty * Wt + tx];
    const themeIdx = qid >= 0 ? quarters.find(q => q.id === qid)?.themeIdx ?? rint(THEMES.length) : rint(THEMES.length);
    peds.push({
      x: tx + 0.5, y: ty + 0.5, fx: tx, fy: ty, nx: tx, ny: ty,
      prog: 1, speed: 0.55 + rng() * 0.35, theme: themeIdx, ph: rng() * 10, lastDir: null
    });
  }
}

/* ---- projection hooks (called from projectStatics) ----------------------- */
function projectTown() {
  townClickables = [];
  for (const pr of propList) {
    if (!pr.st) continue;
    if (pr.kind === 'landmark') {
      // (2026-09-05, r15) THE KIT IS ARCHIVED: the hobby shop is silent
      // scenery - no act, no crossing, not even a records-hall fallthrough.
      if (pr.name === 'hobbyshop') continue;
      const act = pr.name === 'postoffice' ? () => openPostOffice(null)
        : pr.name === 'funnies' ? () => portalGo('secreta')
        : () => openRecordsHall();
      townClickables.push({ st: pr.st, act });
    } else if (pr.kind === 'vessel') {
      townClickables.push({ st: pr.st, act: pr.name === 'sloop' ? () => portalGo('cartastrapiana') : () => portalGo('bythedeep') });
    } else if (pr.kind === 'observatory') {
      townClickables.push({ st: pr.st, act: () => portalTelescope() });
    } else if (pr.kind === 'trailgate') {
      townClickables.push({ st: pr.st, act: () => portalGo('longway') });
    } else if (pr.kind === 'botanist') {
      townClickables.push({ st: pr.st, act: () => portalGo('herbarium') });
    } else if (pr.kind === 'newsstand') {
      townClickables.push({ st: pr.st, act: () => openNewspaper() });
    } else if (pr.kind === 'plaque') {
      townClickables.push({ st: pr.st, act: () => openPlaque() });
    } else if (pr.kind === 'vacant') {
      townClickables.push({ st: pr.st, act: () => openPostOffice(pr.slug) });
    } else if (pr.kind === 'board') {
      townClickables.push({ st: pr.st, act: () => openNoteForm(pr.slug) });
    }
  }
  for (const s of spots) { s.wx = isoX(s.ix, s.iy); s.wy = isoY(s.ix, s.iy) - 6; }
  bakeFoundingStrings();
  bakeLandfall();
}

/* founding-day bunting: eight poles ringing the plaza, strung with the 27
   community pennants. Anchors live in TILE space so a quarter turn re-strings
   them exactly; the cord sags between poles and the flags hang beneath it. */
function bakeFoundingStrings() {
  pennantStrings = [];
  if (!foundingActive || !TOWN) return;
  const post = propList.find(p => p.kind === 'landmark' && p.name === 'postoffice');
  const cxT = (post ? post.tx + 1 : player.x), cyT = (post ? post.ty + 1 : player.y);
  const POLE_H = 34;                 // pole height in world px above the ground
  const RING = 7.5;                  // tiles from the plaza centre
  const poles = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    let bx = cxT + Math.cos(a) * RING, by = cyT + Math.sin(a) * RING;
    // slide inward until the pole stands on ground the town actually has
    for (let k = 0; k < 8; k++) {
      const tx = Math.floor(bx), ty = Math.floor(by);
      if (tx > 0 && ty > 0 && tx < Wt - 1 && ty < Ht - 1 && tileAt(tx, ty) !== T.SEA && tileAt(tx, ty) !== T.WATER) break;
      bx -= Math.cos(a) * 0.8; by -= Math.sin(a) * 0.8;
    }
    poles.push({ tx: bx, ty: by });
  }
  const perString = Math.ceil(TOWN.pennants / 8);
  let pi = 0;
  for (let i = 0; i < 8 && pi < TOWN.pennants; i++) {
    const A = poles[i], B = poles[(i + 1) % 8];
    const ax = isoX(A.tx, A.ty), ay = isoY(A.tx, A.ty) - POLE_H;
    const bx2 = isoX(B.tx, B.ty), by2 = isoY(B.tx, B.ty) - POLE_H;
    const sag = 9;
    const segs = [];
    const nSeg = Math.max(24, Math.ceil(Math.hypot(bx2 - ax, by2 - ay)));   // one sample per world pixel
    for (let k = 0; k <= nSeg; k++) {
      const t = k / nSeg;
      segs.push([ax + (bx2 - ax) * t, ay + (by2 - ay) * t + Math.sin(Math.PI * t) * sag]);
    }
    const flags2 = [];
    const n = Math.min(perString, TOWN.pennants - pi);
    for (let k = 1; k <= n; k++) {
      const t = k / (n + 1);
      const q = quarters[pi % quarters.length];
      flags2.push({
        x: ax + (bx2 - ax) * t,
        y: ay + (by2 - ay) * t + Math.sin(Math.PI * t) * sag,
        col: q ? q.theme : THEMES[pi % THEMES.length]
      });
      pi++;
    }
    const openPole = tileAt(Math.floor(A.tx), Math.floor(A.ty)) !== T.LOT;
    pennantStrings.push({ segs, flags: flags2, poleA: openPole ? [isoX(A.tx, A.ty), isoY(A.tx, A.ty)] : null, poleH: POLE_H });
  }
  TOWN.pennantsHung = pi;
}

/* FIRST LANDFALL: its own decorations, and nothing it shares with Founding Day.
   No bunting, no fireworks - this is the quieter of the two days. A beacon burns
   at each of the doors that were here first, and one paper lantern for every
   commit those pages have carried since drifts down the canals, which is the
   water the reading order follows. Anchors live in TILE space, so a quarter turn
   re-lays every light exactly. */
function bakeLandfall() {
  beacons = []; waterLights = [];
  if (!landfallActive || !TOWN) return;
  TOWN.landfallPages.forEach((slug, i) => {
    if (doorBySlug[slug]) beacons.push({ slug, ph: i * 1.7 });
  });
  // the canal runs: every horizontal stretch of open water, longest first
  const runs = [];
  for (let ty = 1; ty < Ht - 1; ty++) {
    let x0 = -1;
    for (let tx = 0; tx <= Wt; tx++) {
      const wet = tx < Wt && grid[ty * Wt + tx] === T.WATER;
      if (wet && x0 < 0) x0 = tx;
      else if (!wet && x0 >= 0) { if (tx - x0 >= 6) runs.push({ y: ty, x0, x1: tx - 1 }); x0 = -1; }
    }
  }
  if (!runs.length) return;
  runs.sort((a, b) => a.y - b.y || a.x0 - b.x0);
  const n = TOWN.landfallCommits;
  for (let i = 0; i < n; i++) {
    const r = runs[i % runs.length];
    const k = Math.floor(i / runs.length);
    const span = r.x1 - r.x0;
    const t = ((k + 0.5) / Math.ceil(n / runs.length)) + (h32(i, r.y, 311) % 100) / 100 * 0.02;
    waterLights.push({
      x: r.x0 + (t % 1) * span, y: r.y + 0.5, x0: r.x0, x1: r.x1,
      dir: (i % (runs.length * 2)) < runs.length ? 1 : -1,
      ph: (h32(i, r.y, 733) % 63) / 10
    });
  }
  TOWN.beaconsLit = beacons.length;
  TOWN.waterLightsAdrift = waterLights.length;
}
function stepLandfall(dt) {
  if (!landfallActive || REDUCED || photoMode) return;
  for (const L of waterLights) {
    L.x += L.dir * 0.28 * dt;
    if (L.x > L.x1) L.x = L.x0;
    if (L.x < L.x0) L.x = L.x1;
  }
}

/* ---- per-frame town work -------------------------------------------------- */
function townTick(dt) {
  if (townNoteT > 0) townNoteT = Math.max(0, townNoteT - dt);
  // parcels remember the districts they cross (the route on the stamp)
  if (parcels.length) {
    const q = districtOfPlayer();
    if (q) for (const p of parcels) {
      if (p.route[p.route.length - 1] !== q.label) p.route.push(q.label);
    }
  }
  // night shift: walking up to a lit lantern logs it
  if (nf > 0.35 && panel.hidden) {
    for (const L of lanternDoors) {
      if (fireflySeen.has(L.slug)) continue;
      const d = doorBySlug[L.slug];
      if (!d) continue;
      if (Math.hypot(player.x - d.px, player.y - d.py) < 1.7) {
        fireflySeen.add(L.slug);
        try { localStorage.setItem('pdc_lanterns_v1', JSON.stringify([...fireflySeen])); } catch (err) { }
        const got = fireflyTally();
        sndSynth('blip');
        setTownNote(`night lantern logged · ${got}/${TOWN.lanternTotal} fireflies in the tally`, 5);
        if (got >= TOWN.lanternTotal && !plaqueEarned) earnPlaque();
      }
    }
    // fireflies drift around lit lanterns near the courier
    if (!REDUCED && parts.length < MAXPART + 180 && Math.random() < dt * 3) {
      for (const L of lanternDoors) {
        const d = doorBySlug[L.slug];
        if (!d) continue;
        if (Math.hypot(player.x - d.px, player.y - d.py) < 9) {
          spawnPart('fly', d.wx + (Math.random() * 22 - 11), d.wy - 4 - Math.random() * 10,
            (Math.random() - 0.5) * 3, -(0.5 + Math.random()), 4 + Math.random() * 3);
          break;
        }
      }
    }
  }
  stepLandfall(dt);   // the landfall lanterns ride the canal
  // founding-day fireworks over the plaza once night falls
  if (foundingActive && !REDUCED && nf > 0.4 && panel.hidden && !photoMode) {
    fwTimer -= dt;
    if (fwTimer <= 0) {
      fwTimer = 1.9 + Math.random() * 1.6;
      const post = propList.find(p => p.kind === 'landmark' && p.name === 'postoffice');
      const cx = post ? isoX(post.tx + 1, post.ty + 1) : isoX(player.x, player.y);
      const cy = post ? isoY(post.tx + 1, post.ty + 1) : isoY(player.x, player.y);
      const bx = cx + (Math.random() * 120 - 60), by = cy - 72 - Math.random() * 28;
      const col = THEMES[(Math.random() * THEMES.length) | 0];
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * Math.PI * 2, sp2 = 16 + Math.random() * 14;
        spawnPart('fw', bx, by, Math.cos(a) * sp2, Math.sin(a) * sp2 * 0.6, 1.1 + Math.random() * 0.5, col);
      }
      sndSynth('pop');
    }
  }
}
function fireflyTally() {
  let t = 0;
  for (const L of lanternDoors) if (fireflySeen.has(L.slug)) t += L.n;
  return t;
}
function earnPlaque() {
  plaqueEarned = true;
  const pr = propList.find(p => p.kind === 'plaque');
  if (pr && pr.st) { pr.st.cv = SPR.plaque_lit; pr.st.name = 'plaque_lit'; }
  sndSynth('chime');
  setTownNote('the plaza plaque lights up · for those who wrote after midnight', 8);
  if (REDUCED) draw();
}

/* ---- proximity: spots, folk, prompt rows ---------------------------------- */
function updateSpotProximity() {
  // the standing invitation yields the moment the courier is off the landing
  // tile (a walk, a click-walk or a teleport all count as walking elsewhere)
  if (qsInvite && (Math.floor(player.x) !== spawnTile[0] || Math.floor(player.y) !== spawnTile[1])) retireQsInvite();
  let bestS = null, bd = 1.05;
  if (panel.hidden && cam.z >= 3 && !activeDoor && !photoMode && !qsInvite) {
    for (const s of spots) {
      const dd = Math.hypot(player.x - s.ix, player.y - s.iy);
      if (dd < bd) { bd = dd; bestS = s; }
    }
  }
  // the telescope's hint follows the sky: by day the dome sleeps, and once the
  // stars are out (always, under the parked reduced-motion clock) it answers
  if (bestS && bestS.kind === 'observatory') {
    const P = PORTAL_BY_KIND.observatory;
    const want = (nf > 0.05 || REDUCED) ? P.hintNight : P.hint;
    if (bestS.row !== want) { bestS.row = want; if (bestS === activeSpot) updatePromptRows(); }
  }
  if (bestS !== activeSpot) {
    activeSpot = bestS;
    if (bestS) dpTitleEl.textContent = '· ' + bestS.title;
    updatePromptRows();
  }
  // the steamer winks as the courier comes near - a rubber-hose beat, skipped
  // for reduced motion and costing one distance check when nobody is close
  if (steamerProp && steamerProp.st && !REDUCED) {
    const nd = Math.hypot(player.x - steamerProp.tx, player.y - steamerProp.ty);
    const want = (nd < 5 && (animT % 2.4) < 0.4) ? 'steamer_wink' : 'steamer';
    if (steamerProp.st.name !== want) steamerProp.st.name = want;
  }
  // a step further than the door prompt's 0.9: the hands keep a beat of their own
  // now, so speaking distance has to hold whether they are at the post or a pace
  // off it. Nearest still wins, so the one-label rule is untouched.
  let bf = null, bfd = 1.85;
  if (panel.hidden && cam.z >= 3 && !photoMode) {
    for (const f of folkVisible) {
      const dd = Math.hypot(player.x - f.x, player.y - f.y);
      if (dd < bfd) { bfd = dd; bf = f; }
    }
  }
  folkNear = bf;
  // WALKING AWAY CLOSES IT. The card is a conversation, not a document: it ends
  // when the courier leaves, when a page is opened over it, or when the day turns
  // and that hand has moved to another of their pages.
  if (folkTalking) {
    const dd = Math.hypot(player.x - folkTalking.x, player.y - folkTalking.y);
    if (dd > 3.2 || !panel.hidden || photoMode || folkVisible.indexOf(folkTalking) < 0) closeFolkCard();
  }
}
function parcelStateAt(slug) {
  const deliver = parcels.find(p => p.to === slug);
  if (deliver) return { mode: 'deliver', parcel: deliver };
  if (parcels.some(p => p.from === slug)) return { mode: 'none' };
  const outs = (edgesFrom[slug] || []).filter(t => doorBySlug[t] && !parcels.some(p => p.to === t));
  if (!outs.length) return { mode: 'none' };
  if (parcels.length >= 3) return { mode: 'full' };
  const dest = outs[h32(townHash(slug) & 0xffff, dayNum, 7) % outs.length];
  return { mode: 'take', dest };
}
const dpRowsEl = document.getElementById('dp-rows');
function updatePromptRows() {
  if (!dpRowsEl) return;
  dpRowsEl.innerHTML = '';
  const addRow = (key, label, act) => {
    const r = document.createElement('div');
    r.className = 'dp-row' + (act ? '' : ' dp-plain');
    r.innerHTML = (key ? `<span class="dp-k2">${key}</span>` : '') + esc(label);
    if (act) {
      // a proper button: a click fires it, a drag from it still pans the town
      // (the pointerdown is handed to the canvas, which captures the pointer)
      r.addEventListener('pointerdown', (ev) => {
        rowPending = act;
        cvs.dispatchEvent(new PointerEvent('pointerdown', {
          bubbles: false, clientX: ev.clientX, clientY: ev.clientY,
          pointerId: ev.pointerId, pointerType: ev.pointerType, isPrimary: true
        }));
      });
      // if the capture was refused (synthetic pointer ids), the row keeps the
      // pointerup: finish the press here so a plain click still fires.
      r.addEventListener('pointerup', () => {
        if (!rowPending) return;
        const a = rowPending; rowPending = null;
        dragging = false; cvs.classList.remove('dragging');
        if (!moved) a();
      });
      r.addEventListener('click', (ev) => { ev.stopPropagation(); ev.preventDefault(); });
    }
    dpRowsEl.appendChild(r);
  };
  if (activeDoor) {
    const slug = activeDoor.slug;
    const ps = parcelStateAt(slug);
    if (ps.mode === 'deliver') addRow('G', 'DELIVER PARCEL', () => parcelAction(activeDoor));
    else if (ps.mode === 'take') {
      const t = (pagesBySlug[ps.dest] && (pagesBySlug[ps.dest].sidebarLabel || pagesBySlug[ps.dest].title)) || ps.dest;
      addRow('G', 'TAKE PARCEL FOR ' + t.toUpperCase().slice(0, 24), () => parcelAction(activeDoor));
    } else if (ps.mode === 'full') addRow('G', 'SATCHEL FULL · 3 OF 3', () => parcelAction(activeDoor));
    addRow('N', 'PIN A NOTE', () => openNoteForm(slug));
  } else if (activeSpot && activeSpot.row) {
    addRow(null, activeSpot.row, null);
  }
}
function activateSpot(s) {
  if (!s) return;
  if (s.kind === 'post') openPostOffice(null);
  else if (s.kind === 'news') openNewspaper();
  else if (s.kind === 'hall') openRecordsHall();
  else if (s.kind === 'plaque') openPlaque();
  else if (s.kind === 'vacant') openPostOffice(s.slug);
  else if (s.kind === 'observatory') portalTelescope();
  else if (PORTAL_BY_KIND[s.kind]) portalGo(PORTAL_BY_KIND[s.kind].key);
}

/* ---- delivery rounds ------------------------------------------------------- */
function parcelAction(door) {
  const slug = door.slug;
  const ps = parcelStateAt(slug);
  if (ps.mode === 'deliver') {
    parcels = parcels.filter(p => p !== ps.parcel);
    const mins = Math.floor(dayT * 1440);
    bookStamps.push({
      from: ps.parcel.from, to: ps.parcel.to, route: ps.parcel.route.slice(),
      day: dayNum + 1, time: `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
    });
    try { localStorage.setItem('pdc_book_v1', JSON.stringify(bookStamps)); } catch (err) { }
    sndSynth('chime');
    setTownNote(`delivered · stamp ${bookStamps.length} in the book`, 5);
  } else if (ps.mode === 'take') {
    const q = districtOfPlayer();
    parcels.push({ from: slug, to: ps.dest, route: [q ? q.label : ''] });
    sndSynth('blip');
    const t = (pagesBySlug[ps.dest] && pagesBySlug[ps.dest].title) || ps.dest;
    setTownNote(`parcel taken · this page really cites ${t} · ${parcels.length}/3 in the satchel`, 6);
  } else if (ps.mode === 'full') {
    setTownNote('the satchel holds three parcels at most · deliver one first', 4);
  }
  updatePromptRows();
}

/* ---- overlays (post office, notes, paper, records, book, plaque) ---------- */
const townOl = document.getElementById('townol');
const townOlCard = document.getElementById('townol-card');
function townOverlayOpen() { return !!townOl && !townOl.hidden; }
function openTownOverlay(cls, html) {
  closeFolkCard();
  townOlCard.className = cls;
  townOlCard.innerHTML = html;
  townOl.hidden = false;
  keysDown.clear();
  const c = townOlCard.querySelector('[data-close]');
  if (c) c.onclick = closeTownOverlay;
}
function closeTownOverlay() {
  if (!townOl) return;
  townOl.hidden = true;
  townOlCard.innerHTML = '';
  if (!REDUCED) startLoop();
}
function defaultLetterSlug() {
  if (activeDoor) return activeDoor.slug;
  if (!panel.hidden && location.hash.length > 2) {
    const h = location.hash.slice(1).split('#')[0].replace(/\/$/, '');
    if (pagesBySlug[h]) return h;
  }
  let best = null, bd = Infinity;
  for (const d of doors) {
    const dd = Math.hypot(player.x - d.px, player.y - d.py);
    if (dd < bd) { bd = dd; best = d.slug; }
  }
  return best || ORDER[0];
}
function openPostOffice(slug) {
  const first = (slug && pagesBySlug[slug]) ? slug : defaultLetterSlug();
  openTownOverlay('to-card to-post', `
    <div class="to-head"><strong>POST OFFICE · WRITE A LETTER ABOUT A PAGE</strong><button class="chip" data-close>✕</button></div>
    <p class="to-sub">Every page in town accepts letters. This desk is a real counter: sending opens
    the GitHub editor for the page's actual file, in a new tab, ready for your fix.</p>
    <label class="to-label" for="po-filter">FIND A PAGE</label>
    <input id="po-filter" class="to-input" type="text" placeholder="type to search the 290 pages…" autocomplete="off" spellcheck="false">
    <select id="po-page" class="to-select" size="1"></select>
    <div class="to-letter">
      <div class="to-letter-head">TO: THE KEEPERS OF <span id="po-title"></span></div>
      <div class="to-letter-slug mono" id="po-slug"></div>
      <div class="to-letter-body">Dear keepers - the desk lends you its pen. Propose the fix in the
      editor that opens; the town scribes will read it as a pull request.</div>
    </div>
    <div class="to-actions">
      <a id="po-send" class="chip to-send" target="_blank" rel="noopener">SEND VIA CITY TUBE ↗</a>
      <a id="po-issue" class="chip" target="_blank" rel="noopener">OPEN AN ISSUE INSTEAD ↗</a>
    </div>
    <div id="po-tube" class="to-tube" aria-hidden="true"><span class="to-envelope">✉</span></div>
    <p class="to-fine mono" id="po-fine"></p>`);
  const sel = townOlCard.querySelector('#po-page');
  const filter = townOlCard.querySelector('#po-filter');
  const fill = (q) => {
    const qq = (q || '').toLowerCase();
    const list = ORDER.filter(s => !qq ||
      (pagesBySlug[s].title || '').toLowerCase().includes(qq) || s.toLowerCase().includes(qq));
    sel.innerHTML = (list.length ? list : [first]).map(s =>
      `<option value="${esc(s)}"${s === first ? ' selected' : ''}>${esc(pagesBySlug[s].title || s)}</option>`).join('');
    if (![...sel.options].some(o => o.selected)) sel.selectedIndex = 0;
    refresh();
  };
  const refresh = () => {
    const s = sel.value, pg = pagesBySlug[s];
    if (!pg) return;
    townOlCard.querySelector('#po-title').textContent = (pg.title || s).toUpperCase();
    townOlCard.querySelector('#po-slug').textContent = 'RE: ' + s;
    townOlCard.querySelector('#po-send').href = editUrlFor(s);
    townOlCard.querySelector('#po-issue').href = issueUrlFor(s);
    townOlCard.querySelector('#po-fine').textContent =
      'tube destination: github.com/strapi/documentation · edit/main/docusaurus/' + (pg.file || '?');
  };
  sel.onchange = refresh;
  filter.addEventListener('input', () => fill(filter.value));
  fill('');
  const fire = () => {
    sndSynth('whoosh');
    const tube = townOlCard.querySelector('#po-tube');
    if (tube) { tube.classList.remove('go'); void tube.offsetWidth; tube.classList.add('go'); }
  };
  townOlCard.querySelector('#po-send').addEventListener('click', fire);
  townOlCard.querySelector('#po-issue').addEventListener('click', fire);
}

const FEEDBACK_URL = 'https://n8n.tools.strapi.team/webhook/docs-feedback';
function pinBoardFor(slug) {
  notesPinned.add(slug);
  try { localStorage.setItem('pdc_notes_v1', JSON.stringify([...notesPinned])); } catch (err) { }
  const pr = propList.find(p => p.kind === 'board' && p.slug === slug);
  if (pr && pr.st) { pr.st.cv = SPR.doorboard_pin; pr.st.name = 'doorboard_pin'; }
  if (REDUCED) draw();
}
function openNoteForm(slug) {
  const pg = pagesBySlug[slug];
  if (!pg) return;
  openTownOverlay('to-card to-note', `
    <div class="to-head"><strong>NOTICEBOARD · ${esc((pg.title || slug).toUpperCase())}</strong><button class="chip" data-close>✕</button></div>
    <p class="to-sub">Pin a note for the keepers of this page. No name, no address - just the note.
    It travels to the same letterbox as the real docs feedback widget.</p>
    <textarea id="nb-text" class="to-text" maxlength="2000" rows="5" placeholder="what should the keepers know about this page?"></textarea>
    <div class="to-actions">
      <button id="nb-send" class="chip to-send">PIN IT</button>
      <span id="nb-count" class="mono to-count">0 / 2000</span>
    </div>
    <p id="nb-msg" class="to-fine" hidden></p>`);
  const ta = townOlCard.querySelector('#nb-text');
  const count = townOlCard.querySelector('#nb-count');
  const msg = townOlCard.querySelector('#nb-msg');
  ta.addEventListener('input', () => { count.textContent = `${ta.value.length} / 2000`; });
  setTimeout(() => ta.focus(), 30);
  townOlCard.querySelector('#nb-send').onclick = () => {
    const note = ta.value.trim();
    if (note.length < 1) { msg.hidden = false; msg.textContent = 'the board wants at least a word.'; return; }
    msg.hidden = false;
    msg.textContent = 'the pneumatic post is taking it…';
    const body = {
      vote: 'up', kind: 'element', comment: note.slice(0, 2000),
      pagePath: slug, pageTitle: pg.title || slug,
      selectionHeading: 'Design Lab - Pixel Docs City', channel: 'design-lab'
    };
    sndSynth('blip');
    fetch(FEEDBACK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-feedback-source': 'docs-widget' },
      body: JSON.stringify(body)
    }).then(r => {
      if (r.ok) msg.textContent = 'pinned - and delivered to the keepers of the real letterbox.';
      else msg.textContent = 'the wind took this one - it will reach the keepers from the real portal. your note stays pinned here.';
      pinBoardFor(slug);
    }).catch(() => {
      msg.textContent = 'the wind took this one - it will reach the keepers from the real portal. your note stays pinned here.';
      pinBoardFor(slug);
    });
  };
}

function openNewspaper() {
  const rows = TOWN.news.map(n => `
    <a class="np-head" href="#np" data-slug="${esc(n.slug)}">
      <span class="np-title">${esc(n.title)}</span>
      <span class="np-when">${esc(daysAgo(n.last))} · ${esc(humanDate(n.last))}</span>
    </a>`).join('');
  openTownOverlay('to-card to-paper', `
    <div class="to-head np-mast"><strong>THE DAILY DOCS</strong><button class="chip" data-close>✕</button></div>
    <div class="np-strap mono">the six most recently tended pages in town · recomputed from the ledgers at every dawn</div>
    <div class="np-cols">${rows}</div>
    <div class="np-foot mono">tap a headline and the courier makes the trip · ${esc(String(ORDER.length))} pages in circulation</div>`);
  townOlCard.querySelectorAll('.np-head').forEach(a => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const s = a.getAttribute('data-slug');
      closeTownOverlay();
      teleportTo(s);
      camMode = 'follow';
      if (REDUCED) draw(); else startLoop();
    });
  });
}

/* ---- TALKING TO A HAND ------------------------------------------------------
   The people in the streets are the 77 real hands from the log, and the record
   IS the conversation: no dialogue, no biography, nothing invented. The card is
   deliberately NOT modal - the town keeps running behind it and the courier can
   simply walk away, which closes it, exactly as leaving a conversation should. */
const folkCardEl = document.getElementById('folkcard');
const fcNameEl = document.getElementById('fc-name');
const fcBodyEl = document.getElementById('fc-body');
let folkTalking = null;
function folkCardOpen() { return !!folkTalking; }
function closeFolkCard() {
  if (!folkTalking) return;
  folkTalking = null;
  if (folkCardEl) folkCardEl.hidden = true;
  if (fcBodyEl) fcBodyEl.innerHTML = '';
  if (REDUCED) draw(); else startLoop();
}
function openFolkCard(who) {
  if (!who || !folkCardEl) return;
  folkTalking = who;
  const f = who.rec || who;      // a street walker carries its record; the record IS one
  closeTownOverlay();
  fcNameEl.textContent = f.name;
  fcNameEl.title = f.name;
  const span = f.first === f.last
    ? `signed the log once, on ${humanDate(f.first)}`
    : `signed the log from ${humanDate(f.first)} to ${humanDate(f.last)}`;
  const stats = [
    `<div class="fc-stat"><b>${f.nPages}</b><span>${f.nPages === 1 ? 'PAGE TENDED' : 'PAGES TENDED'}</span></div>`,
    `<div class="fc-stat"><b>${f.commits}</b><span>COMMITS ON THEM</span></div>`
  ];
  if (f.kept) stats.push(`<div class="fc-stat"><b>${f.kept}</b><span>${f.kept === 1 ? 'PAGE KEPT' : 'PAGES KEPT'}</span></div>`);
  else if (f.nightPages) stats.push(`<div class="fc-stat"><b>${f.nightPages}</b><span>${f.nightPages === 1 ? 'NIGHT PAGE' : 'NIGHT PAGES'}</span></div>`);
  const rows = f.pages.map(pg => {
    const t = (pagesBySlug[pg.slug] && (pagesBySlug[pg.slug].title || pg.slug)) || pg.slug;
    const hands = pg.nAuth === 1 ? 'the only hand'
      : (pg.kept ? `first hand of ${pg.nAuth}` : `one of ${pg.nAuth} hands`);
    return `<button class="fc-page${pg.kept ? ' fc-kept' : ''}" data-slug="${esc(pg.slug)}">
      <b>${esc(t)}</b><span>${esc(hands)} · ${pg.commits} commits on the page</span></button>`;
  }).join('');
  fcBodyEl.innerHTML = `
    <p class="fc-span">${esc(span)}</p>
    <div class="fc-stats">${stats.join('')}</div>
    <p class="fc-line">${esc(f.card)}</p>
    <div class="fc-h">THE PAGES THEMSELVES (${f.pages.length})</div>
    <p class="fc-strap">As remembered by the pages themselves: the log keeps which hands touched a
    page and how many commits the page carries - not each hand's share of them, so every count
    below is the page's own. Click one and the courier makes the trip.</p>
    ${rows}
    <p class="fc-foot">Walk away, or press Escape, and the conversation ends.</p>`;
  fcBodyEl.scrollTop = 0;
  folkCardEl.hidden = false;
  fcBodyEl.querySelectorAll('.fc-page').forEach(b => {
    b.addEventListener('click', () => {
      const sl = b.getAttribute('data-slug');
      closeFolkCard();
      teleportTo(sl);
      camMode = 'follow';
      if (REDUCED) draw(); else startLoop();
    });
  });
  if (REDUCED) draw(); else startLoop();
}
function talkToFolk() { if (folkNear) openFolkCard(folkNear); }
if (document.getElementById('fc-close')) document.getElementById('fc-close').onclick = closeFolkCard;

function openRecordsHall() {
  const byYear = {};
  for (const mo of TOWN.months) (byYear[mo.key.slice(0, 4)] = byYear[mo.key.slice(0, 4)] || []).push(mo);
  const MN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const html = Object.keys(byYear).sort().map(y => `
    <h3>${esc(y)}</h3>
    <div class="rh-year">${byYear[y].map(mo => {
      const chained = mo.key === TOWN.widest.key;
      const n = mo.founded.length + mo.tended.length;
      return `<button class="rh-ledger${chained ? ' rh-chained' : ''}${n ? '' : ' rh-empty'}" data-m="${esc(mo.key)}">
        <span class="rh-m">${MN[Number(mo.key.slice(5, 7)) - 1]}</span>
        <span class="rh-n mono">${n ? (mo.founded.length ? mo.founded.length + ' founded' : '') + (mo.founded.length && mo.tended.length ? ' · ' : '') + (mo.tended.length ? mo.tended.length + ' tended' : '') : 'quiet'}</span>
        ${chained ? '<span class="rh-chain">CHAINED TO THE DESK</span>' : ''}
      </button>`;
    }).join('')}</div>`).join('');
  openTownOverlay('to-card to-hall', `
    <div class="to-head"><strong>RECORDS HALL · THE MONTH LEDGERS</strong><button class="chip" data-close>✕</button></div>
    <p class="to-sub">One ledger per month, ${esc(humanDate(TOWN.first))} to ${esc(humanDate(TOWN.last))} -
    as remembered by the pages themselves. Each page keeps only its first and its latest tending,
    so the months in between read quieter than they were. The flyleaf says so honestly.</p>
    ${html}`);
  townOlCard.querySelectorAll('.rh-ledger').forEach(b => {
    b.addEventListener('click', () => openLedger(b.getAttribute('data-m')));
  });
}
function openLedger(key) {
  const mo = TOWN.months.find(m => m.key === key);
  if (!mo) return;
  const MN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const label = `${MN[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`;
  const chained = key === TOWN.widest.key;
  const link = (s) => `<a class="rh-page" href="#${esc(s)}">${esc(pagesBySlug[s] ? (pagesBySlug[s].title || s) : s)}</a>`;
  openTownOverlay('to-card to-hall', `
    <div class="to-head"><strong>LEDGER · ${esc(label.toUpperCase())}</strong><button class="chip" data-close>✕</button></div>
    ${chained ? `<p class="rh-plaque">This ledger is chained to the desk. ${esc(String(mo.founded.length))} pages
      remember this month as their beginning - the widest change the town remembers.</p>` : ''}
    <button class="chip" id="rh-back">← ALL LEDGERS</button>
    ${mo.founded.length ? `<h3>FOUNDED THIS MONTH (${mo.founded.length})</h3><div class="rh-pages">${mo.founded.map(link).join('')}</div>` : ''}
    ${mo.tended.length ? `<h3>LAST TENDED THIS MONTH (${mo.tended.length})</h3><div class="rh-pages">${mo.tended.map(link).join('')}</div>` : ''}
    ${mo.founded.length + mo.tended.length === 0 ? '<p class="to-sub">A quiet month, as far as the pages recall.</p>' : ''}`);
  townOlCard.querySelector('#rh-back').onclick = () => openRecordsHall();
  townOlCard.querySelectorAll('.rh-page').forEach(a => {
    a.addEventListener('click', () => { closeTownOverlay(); });
  });
}

function openBook() {
  const tf = (x) => pagesBySlug[x] ? (pagesBySlug[x].title || x) : x;
  const stamps = bookStamps.map((s, i) => `
    <div class="bk-stamp">
      <span class="bk-no mono">STAMP ${i + 1} · day ${esc(String(s.day))} · ${esc(s.time)}</span>
      <span class="bk-line"><b>${esc(tf(s.from))}</b> → <b>${esc(tf(s.to))}</b></span>
      <span class="bk-line mono">${esc(s.from)} → ${esc(s.to)}</span>
      <span class="bk-line">route: ${esc(s.route.filter(Boolean).join(' → ') || 'straight there')}</span>
    </div>`).join('');
  const carrying = parcels.map(p => `
    <div class="bk-line">▤ for <b>${esc(tf(p.to))}</b> <span class="mono">(${esc(p.to)})</span> · handed over at ${esc(tf(p.from))}, which really cites it</div>`).join('')
    || '<div class="bk-line">the satchel is empty · any door offers a parcel for a page it really cites (key G)</div>';
  const seenList = lanternDoors.map(L => `
    <div class="bk-line">${fireflySeen.has(L.slug) ? '✦' : '·'} ${esc(tf(L.slug))} <span class="mono">${esc(L.slug)} · ${L.n} night edit${L.n > 1 ? 's' : ''}</span></div>`).join('');
  openTownOverlay('to-card to-book', `
    <div class="to-head"><strong>THE DELIVERY BOOK</strong><button class="chip" data-close>✕</button></div>
    <h3>IN THE SATCHEL (${parcels.length}/3)</h3>${carrying}
    <h3>STAMPS (${bookStamps.length})</h3>
    ${stamps || '<div class="bk-line">no stamps yet · take a parcel at any door and walk it to the page it cites</div>'}
    <h3>NIGHT SHIFT · ${fireflyTally()}/${TOWN.lanternTotal} FIREFLIES</h3>
    <p class="to-sub">Fifteen lanterns burn for commits made after midnight, on twelve real pages.
    Walk up to one at night to log it. Find them all and the plaza plaque lights.</p>
    ${seenList}`);
}

function openPlaque() {
  if (!plaqueEarned) {
    openTownOverlay('to-card to-plaque', `
      <div class="to-head"><strong>PLAZA PLAQUE</strong><button class="chip" data-close>✕</button></div>
      <p class="to-sub">A blank brass plate on a stone plinth. Something is waiting to be written here.</p>
      <p class="to-fine mono">rumour in town: it lights for whoever finds every lantern that burns after dark · ${fireflyTally()}/${TOWN.lanternTotal} so far</p>`);
    return;
  }
  const rows = lanternDoors.map(L => {
    const t = pagesBySlug[L.slug] ? (pagesBySlug[L.slug].title || L.slug) : L.slug;
    return `<div class="bk-line">✦ ${esc(t)} <span class="mono">${esc(L.slug)} · ${L.n} after-midnight commit${L.n > 1 ? 's' : ''}</span></div>`;
  }).join('');
  openTownOverlay('to-card to-plaque', `
    <div class="to-head"><strong>PLAZA PLAQUE</strong><button class="chip" data-close>✕</button></div>
    <p class="to-plaquetext">FOR THOSE WHO WROTE AFTER MIDNIGHT<br>
    <span class="mono">${TOWN.lanternTotal} lanterns · ${lanternDoors.length} pages · found by a courier</span></p>
    ${rows}`);
}

/* ---- photo mode ------------------------------------------------------------ */
const photoBar = document.getElementById('photobar');
const pbNote = document.getElementById('pb-note');
let pbTimer = null;
/* the HUD note lines are hidden in photo mode, so a paper strip above the bar
   carries the word instead - the bar's own legend of controls never changes */
function photoSay(msg, secs) {
  if (!pbNote) return;
  pbNote.textContent = msg;
  pbNote.hidden = false;
  clearTimeout(pbTimer);
  pbTimer = setTimeout(() => { if (pbNote) pbNote.hidden = true; }, (secs || 2) * 1000);
}
function photoBarReset() {
  clearTimeout(pbTimer);
  if (pbNote) { pbNote.hidden = true; pbNote.textContent = ''; }
}
const FACING = ['north', 'east', 'south', 'west'];
function enterPhoto() {
  if (photoMode) return;
  photoMode = true;
  photoPrevSpeed = timeSpeed;
  timeSpeed = 0;
  camMode = 'free';
  keysDown.clear();
  if (townOverlayOpen()) closeTownOverlay();
  closeFolkCard();
  document.body.classList.add('photomode');
  photoBarReset();
  if (photoBar) photoBar.hidden = false;
  bubble.hidden = true;
  hoverB = null;
  if (REDUCED) draw();
}
/* photo mode has no Find me chip and its camera flights are frozen, so F (and
   the bar's own button) snap straight to the courier instead */
function photoFindMe() {
  const wx = isoX(player.x, player.y), wy = isoY(player.x, player.y);
  cam.x = Math.round(wx - cvs.width / (2 * cam.z));
  cam.y = Math.round(wy - cvs.height / (2 * cam.z));
  if (REDUCED) draw(); else startLoop();
}
/* and a pan in photo mode always keeps a good part of the island in frame */
function photoClampCam() {
  if (!photoMode) return;
  const vw = cvs.width / cam.z, vh = cvs.height / cam.z;
  const mx = Math.min(vw, worldW) * 0.55, my = Math.min(vh, worldH) * 0.55;
  cam.x = clamp(cam.x, -mx, worldW - vw + mx);
  cam.y = clamp(cam.y, -my, worldH - vh + my);
}
function exitPhoto() {
  if (!photoMode) return;
  photoMode = false;
  snapWaiting = false;              // a postcard queued behind a turn is dropped on the way out
  timeSpeed = photoPrevSpeed;
  document.body.classList.remove('photomode');
  photoBarReset();
  if (photoBar) photoBar.hidden = true;
  if (!REDUCED) startLoop(); else draw();
}
function buildPostcard() {
  const K = cvs.width * 3 <= 5400 ? 3 : 2;
  const TS = K * 2;                       // caption scale: legible on a big card
  const pad = 8 * K, strip = 13 * TS;
  const pw = cvs.width * K + pad * 2, ph = cvs.height * K + pad * 2 + strip;
  const [pc, pg] = mkCv(pw, ph);
  pg.imageSmoothingEnabled = false;
  pg.fillStyle = '#fdf8ea'; pg.fillRect(0, 0, pw, ph);
  pg.drawImage(cvs, 0, 0, cvs.width, cvs.height, pad, pad, cvs.width * K, cvs.height * K);
  pg.fillStyle = '#241f2e';
  pg.fillRect(pad - K, pad - K, cvs.width * K + 2 * K, K);
  pg.fillRect(pad - K, pad + cvs.height * K, cvs.width * K + 2 * K, K);
  pg.fillRect(pad - K, pad - K, K, cvs.height * K + 2 * K);
  pg.fillRect(pad + cvs.width * K, pad - K, K, cvs.height * K + 2 * K);
  const q = districtOfPlayer();
  const mins = Math.floor(dayT * 1440);
  const right = `${(q ? q.label : 'OPEN WATER')} - ${SEASONS[season]} - DAY ${dayNum + 1} - ${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
    .toUpperCase().replace(/[^A-Z0-9 :.\-]/g, '');
  const [t1, g1] = mkCv(textW('PIXEL DOCS CITY') + 2, 7);
  drawText3x5(g1, 1, 1, 'PIXEL DOCS CITY', '#241f2e');
  const [t2, g2] = mkCv(textW(right) + 2, 7);
  drawText3x5(g2, 1, 1, right, '#6b5f45');
  const ty2 = pad + cvs.height * K + K + Math.round((pad + strip - 7 * TS) / 2);
  pg.drawImage(t1, 0, 0, t1.width, 7, pad, ty2, t1.width * TS, 7 * TS);
  pg.drawImage(t2, 0, 0, t2.width, 7, pw - pad - t2.width * TS, ty2, t2.width * TS, 7 * TS);
  // a violet postage stamp, the courier's own mark, perforated edge and all
  const sx2 = pad + t1.width * TS + 4 * TS;
  pg.fillStyle = PAL.V1; pg.fillRect(sx2, ty2 - TS, 7 * TS, 8 * TS);
  pg.fillStyle = '#fdf8ea';
  for (let i = 0; i < 8; i++) { pg.fillRect(sx2 - TS / 2, ty2 - TS + i * TS, TS / 2, TS / 2); pg.fillRect(sx2 + 7 * TS, ty2 - TS + i * TS, TS / 2, TS / 2); }
  pg.fillRect(sx2 + TS, ty2, 5 * TS, 6 * TS);
  pg.fillStyle = PAL.V2; pg.fillRect(sx2 + 2 * TS, ty2 + TS, 3 * TS, 4 * TS);
  pg.fillStyle = '#fdf8ea'; pg.fillRect(sx2 + 3 * TS, ty2 + 2 * TS, TS, 2 * TS);
  return pc;
}
function snapPostcard() {
  if (rotFx) {                      // never bake the turn's shutter into a card
    if (!snapWaiting) photoSay('hold still · the town is turning', 2);
    snapWaiting = true;
    return;
  }
  snapWaiting = false;
  const pc = buildPostcard();
  sndSynth('shutter');
  pc.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pixel-docs-city-postcard.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
  photoSay('postcard saved · pixel-docs-city-postcard.png', 5);
  setTownNote('postcard saved · pixel-docs-city-postcard.png', 5);
}

/* ---- synthesized one-shots (original, in-engine; the mute toggle rules them) */
let synthNoise = null;
function sndSynth(kind) {
  if (!sndOn || !AC || !sndMaster) return;
  try {
    const t0 = AC.currentTime;
    if (kind === 'whoosh' || kind === 'pop') {
      if (!synthNoise) {
        synthNoise = AC.createBuffer(1, Math.floor(AC.sampleRate * 0.6), AC.sampleRate);
        const ch = synthNoise.getChannelData(0);
        for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
      }
      const src = AC.createBufferSource(); src.buffer = synthNoise;
      const bp = AC.createBiquadFilter();
      const g = AC.createGain();
      src.connect(bp); bp.connect(g); g.connect(sndMaster);
      if (kind === 'whoosh') {
        bp.type = 'bandpass'; bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(320, t0);
        bp.frequency.exponentialRampToValueAtTime(2400, t0 + 0.38);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.1);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);
        src.start(t0); src.stop(t0 + 0.6);
      } else {
        bp.type = 'lowpass'; bp.frequency.value = 900;
        g.gain.setValueAtTime(0.14, t0);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
        src.start(t0); src.stop(t0 + 0.18);
      }
    } else if (kind === 'chime') {
      for (const [f, d, v] of [[880, 0, 0.10], [1318.5, 0.12, 0.08]]) {
        const o = AC.createOscillator(), g = AC.createGain();
        o.type = 'sine'; o.frequency.value = f;
        o.connect(g); g.connect(sndMaster);
        g.gain.setValueAtTime(0.0001, t0 + d);
        g.gain.exponentialRampToValueAtTime(v, t0 + d + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.7);
        o.start(t0 + d); o.stop(t0 + d + 0.75);
      }
    } else if (kind === 'blip') {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = 'triangle'; o.frequency.setValueAtTime(980, t0);
      o.frequency.exponentialRampToValueAtTime(1400, t0 + 0.09);
      o.connect(g); g.connect(sndMaster);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.07, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
      o.start(t0); o.stop(t0 + 0.18);
    } else if (kind === 'shutter') {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = 'square'; o.frequency.value = 2200;
      o.connect(g); g.connect(sndMaster);
      g.gain.setValueAtTime(0.05, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
      o.start(t0); o.stop(t0 + 0.06);
    }
    if (sndLog.length < 400) sndLog.push('synth:' + kind);
  } catch (err) { }
}

/* ---- render hooks ----------------------------------------------------------- */
function townDynInto(dyn) {
  // THE POPULATION: all 77 real hands, at every zoom - the crowd on any street
  // is the crowd that wrote it. Walk frames and facing exactly as an extra's, so
  // a hand reads as a walker and not as a statue; the hat is the only tell.
  /* FIRST LANDFALL: the lanterns adrift on the canals go into the same depth sort
     as everything else that moves, so a roof in front of the water hides them
     exactly as it hides a boat. */
  if (landfallActive) {
    for (const L of waterLights) {
      const wx = isoX(L.x, L.y), wy = isoY(L.x, L.y);
      const bob = REDUCED ? 0 : (Math.floor(animT * 1.5 + L.ph) % 2);
      const x = Math.round(wx) - 2, y = Math.round(wy) - 4 + bob;
      const d = depthOf(L.x, L.y) - 0.5;
      if (nf > 0.1) dyn.push({ cv: SPR.driftglow, wx: x - 4, wy: y - 4, depth: d, alpha: Math.min(1, (nf - 0.1) * 1.8) });
      dyn.push({ cv: SPR.driftlamp, wx: x, wy: y, depth: d });
    }
  }
  for (const f of folkVisible) {
    const wx = isoX(f.x, f.y), wy = isoY(f.x, f.y);
    const bob = !REDUCED && !f.moving && Math.floor(animT * 1.3 + f.ph) % 5 === 0 ? 1 : 0;
    const fr = REDUCED || !f.moving ? 0 : (Math.floor(animT * 7 + f.ph) % 2) + 1;
    const fvd = f.dir ? worldDirToView(f.dir[0], f.dir[1]) : null;
    dyn.push({
      cv: folkSpriteFor(f, fr), wx: Math.round(wx - 2), wy: Math.round(wy - 10 + bob),
      depth: depthOf(f.x, f.y) - 0.98, flip: !!(fvd && fvd[0] < 0)
    });
  }
}
function drawTownOver(vx0, vy0, vx1, vy1) {
  // night-shift lanterns: mint lights for the after-midnight commits
  if (nf > 0.12) {
    const la = Math.min(1, (nf - 0.12) / 0.5);
    for (const L of lanternDoors) {
      const d = doorBySlug[L.slug];
      if (!d || d.wx < vx0 - 24 || d.wx > vx1 + 24 || d.wy < vy0 - 24 || d.wy > vy1 + 24) continue;
      for (let i = 0; i < L.n; i++) {
        const bob = REDUCED ? 0 : Math.sin(animT * 1.6 + i * 1.7) * 1.1;
        const lx = Math.round(d.wx + (i - (L.n - 1) / 2) * 10 - 3);
        const ly = Math.round(d.wy - 20 + (i % 2) * 2 + bob);
        ctx.globalAlpha = la * 0.85;
        ctx.drawImage(SPR.nlanternglow, lx - 8, ly - 1);
        ctx.globalAlpha = la;
        ctx.drawImage(SPR.nlantern, lx, ly);
      }
    }
    ctx.globalAlpha = 1;
  }
  /* FIRST LANDFALL: the lights on the water, then a beacon at each of the doors
     that were here first. Nothing of Founding Day is reused - a different day
     gets a different look. */
  if (landfallActive && beacons.length) {
    for (const B of beacons) {
      const d = doorBySlug[B.slug];
      if (!d) continue;
      /* a harbour signal mast: three lights, one at the head and one at each yard
         end, lit day and night. No bunting, no colour of any community - this is
         the other day, and it does not borrow anything from Founding Day. */
      const bx = Math.round(d.wx) + 9, by = Math.round(d.wy) + 1, H = 30;
      if (bx < vx0 - 20 || bx > vx1 + 20 || by < vy0 - 48 || by > vy1 + 16) continue;
      const la = 0.5 + 0.5 * Math.min(1, nf * 2);                             // brighter after dark
      ctx.fillStyle = PAL.OUT; ctx.fillRect(bx - 5, by - 2, 11, 3);           // the stone step it rises from
      ctx.fillStyle = PAL.C2; ctx.fillRect(bx - 5, by - 3, 11, 1);
      ctx.fillStyle = PAL.C1; ctx.fillRect(bx - 4, by - 2, 9, 1);
      ctx.fillStyle = PAL.WD1; ctx.fillRect(bx - 1, by - H, 2, H - 2);        // the mast
      ctx.fillStyle = PAL.WD3; ctx.fillRect(bx - 1, by - H, 1, H - 2);
      ctx.fillStyle = PAL.OUT; ctx.fillRect(bx - 8, by - H + 7, 17, 1);       // the yard
      ctx.fillStyle = PAL.WD2; ctx.fillRect(bx - 8, by - H + 6, 17, 1);
      const lamp = (lx, ly, big) => {
        ctx.globalAlpha = la;
        ctx.drawImage(big ? SPR.beaconglow : SPR.driftglow,
          lx - (big ? 15 : 7) + 1, ly - (big ? 13 : 6) + 2);
        ctx.globalAlpha = 1;
        const w2 = big ? 5 : 3, h2 = big ? 6 : 4;
        ctx.fillStyle = PAL.OUT; ctx.fillRect(lx - (w2 >> 1) - 1, ly - 1, w2 + 2, h2 + 2);
        ctx.fillStyle = PAL.L2; ctx.fillRect(lx - (w2 >> 1), ly, w2, h2);
        ctx.fillStyle = PAL.L1; ctx.fillRect(lx - (w2 >> 1), ly, w2, h2 - 1);
        ctx.fillStyle = PAL.WH; ctx.fillRect(lx - (w2 >> 1) + 1, ly + 1, 1, 1);
      };
      lamp(bx, by - H - 5, true);                                             // the head light
      lamp(bx - 7, by - H + 8, false);                                        // the yard lights
      lamp(bx + 7, by - H + 8, false);
    }
  }
  // founding day: bunting over the plaza, one pennant per community, lit at night
  if (foundingActive && pennantStrings.length) {
    for (const S of pennantStrings) {
      // the pole (only where it can stand on open ground)
      const [pxx, pyy] = S.poleA || [-1e9, 0];
      if (S.poleA && pxx > vx0 - 8 && pxx < vx1 + 8) {
        ctx.fillStyle = PAL.WD1;
        ctx.fillRect(Math.round(pxx) - 1, Math.round(pyy) - S.poleH, 2, S.poleH);
        ctx.fillStyle = PAL.WD3;
        ctx.fillRect(Math.round(pxx) - 1, Math.round(pyy) - S.poleH, 1, S.poleH);
      }
      // the cord: two pixels deep so it reads against roofs and sky alike
      for (const seg of S.segs) {
        if (seg[0] < vx0 - 4 || seg[0] > vx1 + 4) continue;
        ctx.fillStyle = PAL.OUT;
        ctx.fillRect(Math.round(seg[0]), Math.round(seg[1]), 1, 2);
        ctx.fillStyle = '#6b6478';
        ctx.fillRect(Math.round(seg[0]), Math.round(seg[1]), 1, 1);
      }
      // triangular pennants hanging beneath it, one per community
      for (let i = 0; i < S.flags.length; i++) {
        const f = S.flags[i];
        if (f.x < vx0 - 8 || f.x > vx1 + 8) continue;
        const sway = REDUCED ? 0 : Math.round(Math.sin(animT * 1.7 + i * 1.3));
        const fx = Math.round(f.x) - 2, fy = Math.round(f.y) + 2;
        ctx.fillStyle = PAL.OUT;
        ctx.fillRect(fx - 1 + sway, fy - 1, 7, 1);
        for (let r = 0; r < 5; r++) {
          const w4 = 5 - r;
          if (w4 <= 0) break;
          const off = Math.round(sway * (r / 5));
          ctx.fillStyle = PAL.OUT;
          ctx.fillRect(fx - 1 + off + sway, fy + r, w4 + 2, 1);
          ctx.fillStyle = r === 0 ? f.col : (r < 3 ? f.col : PAL.OUT);
          ctx.fillRect(fx + off + sway, fy + r, w4, 1);
        }
      }
      // strung lights between the pennants once it is dark
      if (nf > 0.2) {
        const ga = Math.min(1, (nf - 0.2) * 1.8);
        const lightStep = Math.max(5, Math.round(S.segs.length / 9));
        for (let i = lightStep; i < S.segs.length - 2; i += lightStep) {
          const seg = S.segs[i];
          if (seg[0] < vx0 - 4 || seg[0] > vx1 + 4) continue;
          ctx.globalAlpha = ga * 0.30;
          ctx.fillStyle = PAL.L2;
          ctx.fillRect(Math.round(seg[0]) - 2, Math.round(seg[1]), 5, 5);
          ctx.globalAlpha = ga;
          ctx.fillStyle = PAL.L1;
          ctx.fillRect(Math.round(seg[0]), Math.round(seg[1]) + 2, 1, 2);
        }
        ctx.globalAlpha = 1;
      }
    }
  }
}
const folkEl = document.getElementById('folklabel');
let folkLabelFor = null;
if (folkEl) {
  // a click talks; a drag that starts on the card still pans the town, exactly
  // as a door-prompt row does (the canvas takes the pointer over)
  folkEl.addEventListener('pointerdown', (ev) => {
    rowPending = talkToFolk;
    cvs.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: false, clientX: ev.clientX, clientY: ev.clientY,
      pointerId: ev.pointerId, pointerType: ev.pointerType, isPrimary: true
    }));
  });
  folkEl.addEventListener('pointerup', () => {
    if (!rowPending) return;
    const a = rowPending; rowPending = null;
    dragging = false; cvs.classList.remove('dragging');
    if (!moved) a();
  });
  folkEl.addEventListener('click', (ev) => { ev.stopPropagation(); ev.preventDefault(); });
}
function drawTownLabels(z, bubbleShown) {
  // the townsfolk name card. It never shares the screen with another label: it
  // speaks only when the courier is nearer to the person than to any door.
  let folkUp = !!folkNear && panel.hidden && bubble.hidden && !bubbleShown &&
    !(yahT > 0 || yahHold) && !photoMode && !townOverlayOpen() && !folkCardOpen();
  if (folkUp && (activeDoor || activeSpot)) {
    const fd2 = Math.hypot(player.x - folkNear.x, player.y - folkNear.y);
    const od = activeDoor
      ? Math.hypot(player.x - activeDoor.px, player.y - activeDoor.py)
      : Math.hypot(player.x - activeSpot.ix, player.y - activeSpot.iy);
    if (fd2 + 0.2 >= od) folkUp = false;
  }
  if (folkUp && folkEl) {
    const rdpr = window.devicePixelRatio || 1;
    const wx = isoX(folkNear.x, folkNear.y), wy = isoY(folkNear.x, folkNear.y);
    // the door grammar, for a person: a key chip, what it does, and who with
    if (folkLabelFor !== folkNear) {
      folkLabelFor = folkNear;
      // the door grammar, kept to the same DOM contract the name card always had:
      // <b> is the name and the only <span> is the true line, so anything that
      // read this card before still reads it now
      folkEl.innerHTML = `<i class="dp-key">ENTER</i><em class="fl-do">TALK ·</em>` +
        `<b>${esc(folkNear.name)}</b><span class="fl-line">${esc(folkNear.line)}</span>`;
    }
    folkEl.style.left = ((wx - cam.x) * z / rdpr) + 'px';
    folkEl.style.top = ((wy - 13 - cam.y) * z / rdpr) + 'px';
    folkEl.hidden = false;
  } else if (folkEl) { folkEl.hidden = true; folkLabelFor = null; }
  return folkUp;
}

/* ---- clicks: the mouse-only path to every town service ----------------------
   Per-pixel, exactly like the building picker: a click only counts where the
   prop actually has paint, so the ground behind a fence post stays clickable. */
const pickMasks = new WeakMap();
function spriteOpaqueAt(cv, lx, ly) {
  if (lx < 0 || ly < 0 || lx >= cv.width || ly >= cv.height) return false;
  let m = pickMasks.get(cv);
  if (!m) {
    m = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    pickMasks.set(cv, m);
  }
  return m[(ly * cv.width + lx) * 4 + 3] > 10;
}
function pickTownClick(wx, wy) {
  for (let i = townClickables.length - 1; i >= 0; i--) {
    const st = townClickables[i].st;
    if (!st) continue;
    const cv = st.cv;
    if (wx < st.wx || wy < st.wy || wx >= st.wx + cv.width || wy >= st.wy + cv.height) continue;
    if (!spriteOpaqueAt(cv, Math.floor(wx - st.wx), Math.floor(wy - st.wy))) continue;
    return townClickables[i];
  }
  return null;
}

/* ---- UI wiring ---------------------------------------------------------------- */
function initTownUI() {
  const bb = document.getElementById('btn-book');
  if (bb) bb.onclick = () => { if (townOverlayOpen()) closeTownOverlay(); else openBook(); };
  const bp = document.getElementById('btn-photo');
  if (bp) bp.onclick = () => { if (photoMode) exitPhoto(); else enterPhoto(); };
  const snap = document.getElementById('photo-snap');
  if (snap) snap.onclick = () => snapPostcard();
  const leave = document.getElementById('photo-leave');
  if (leave) leave.onclick = () => exitPhoto();
  const here = document.getElementById('photo-here');
  if (here) here.onclick = () => photoFindMe();
  if (townOl) townOl.addEventListener('pointerdown', (e) => { if (e.target === townOl) closeTownOverlay(); });
  const notes = [];
  if (foundingActive) notes.push(`${foundingLine()} · ${TOWN.pennantsHung || TOWN.pennants} community pennants over the plaza`);
  if (landfallActive) notes.push(`${landfallLine()} · a beacon at each of their ${TOWN.beaconsLit || beacons.length} doors and ${TOWN.waterLightsAdrift || waterLights.length} lanterns adrift, one for every commit those pages have carried since`);
  if (notes.length) setTownNote(notes.join('  //  '), 12);
}

/* ---- test surface --------------------------------------------------------------- */
function townTestApi() {
  return {
    town: () => ({
      founding: TOWN.founding, foundingActive, pennants: TOWN.pennants,
      pennantsHung: TOWN.pennantsHung || 0, strings: pennantStrings.length,
      landfall: TOWN.landfall, landfallActive, landfallPages: TOWN.landfallPages.slice(),
      landfallCommits: TOWN.landfallCommits, beacons: beacons.length, waterLights: waterLights.length,
      firstRecording: TOWN.first,
      vacantDerived: TOWN.vacant.length, vacantPlaced: TOWN.vacantPlaced,
      boards: propList.filter(p => p.kind === 'board').length,
      lanternBuildings: lanternDoors.length, lanternTotal: TOWN.lanternTotal,
      months: TOWN.months.length, widestMonth: TOWN.widest.key, widestFounded: TOWN.widest.founded.length,
      folk: townsfolk.length, folkVisible: folkVisible.length,
      extras: peds.length, extraGround, extraPer: EXTRA_PER, folkClear: FOLK_CLEAR,
      extraCap: Math.floor(folkVisible.length / EXTRA_PER_HAND), extraPerHand: EXTRA_PER_HAND,
      spots: spots.map(s => s.kind), dayNum
    }),
    editUrl: (s) => editUrlFor(s),
    issueUrl: (s) => issueUrlFor(s),
    newsData: () => TOWN.news.map(n => ({ slug: n.slug, last: n.last, title: n.title })),
    openPost: (s) => openPostOffice(s || null),
    openPaper: () => openNewspaper(),
    openHall: () => openRecordsHall(),
    openLedgerFor: (m) => openLedger(m),
    openBookNow: () => openBook(),
    openPlaqueNow: () => openPlaque(),
    openNote: (s) => openNoteForm(s),
    overlayOpen: () => townOverlayOpen(),
    overlayHtml: () => (townOlCard ? townOlCard.innerHTML : ''),
    closeOverlay: () => closeTownOverlay(),
    parcelState: (s) => parcelStateAt(s),
    parcelDo: (s) => { const d = doorBySlug[s]; if (d) parcelAction(d); },
    parcelList: () => parcels.map(p => ({ from: p.from, to: p.to, route: p.route.slice() })),
    stamps: () => bookStamps.slice(),
    fireflies: () => ({ seen: [...fireflySeen], tally: fireflyTally(), total: TOWN.lanternTotal, plaque: plaqueEarned }),
    lanternList: () => lanternDoors.map(L => ({ slug: L.slug, n: L.n })),
    visitLantern: (s) => {
      if (lanternDoors.some(L => L.slug === s)) fireflySeen.add(s);
      const got = fireflyTally();
      if (got >= TOWN.lanternTotal && !plaqueEarned) earnPlaque();
      return got;
    },
    /* x,y is the POST - the tile a hand keeps, and the tile they are standing on
       whenever anyone is near enough to speak to them, because a hand walks back
       to their post as soon as the courier is within FOLK_HOLD tiles. `live` is
       the instantaneous position, which differs only while nobody is looking. */
    folkList: () => folkVisible.map(f => ({ name: f.name, slug: f.slug, line: f.line,
      x: f.px0, y: f.py0, live: [f.x, f.y], pace: [f.px1, f.py1], moving: !!f.moving })),
    folkHold: () => FOLK_HOLD,
    extraList: () => peds.map(p => ({ x: p.x, y: p.y })),
    onScreenWalkers: () => {
      const z = cam.z;
      const vx0 = cam.x - 40, vy0 = cam.y - 60, vx1 = cam.x + cvs.width / z + 40, vy1 = cam.y + cvs.height / z + 40;
      const inV = (x, y) => { const wx = isoX(x, y), wy = isoY(x, y); return wx >= vx0 && wx <= vx1 && wy >= vy0 && wy <= vy1; };
      return { named: folkVisible.filter(f => inV(f.x, f.y)).length,
               anon: peds.filter(p => inV(p.x, p.y)).length,
               queue: queuers.filter(p => inV(p.x, p.y)).length };
    },
    folkAll: () => townsfolk.map(f => ({
      name: f.name, slug: f.slug, line: f.line, card: f.card, first: f.first, last: f.last,
      nPages: f.nPages, commits: f.commits, kept: f.kept, nightPages: f.nightPages,
      pages: f.pages.map(pg => ({ slug: pg.slug, commits: pg.commits, nAuth: pg.nAuth, kept: pg.kept }))
    })),
    folkPromptUp: () => folkPromptUp,
    folkPromptText: () => (folkEl && !folkEl.hidden ? folkEl.textContent : ''),
    folkTalk: (name) => { const f = folkVisible.find(x => x.name === name); if (f) openFolkCard(f); return !!f; },
    folkTalkOpen: () => folkCardOpen(),
    folkTalkName: () => (folkTalking ? folkTalking.name : null),
    folkTalkHtml: () => (folkCardEl && !folkCardEl.hidden ? folkCardEl.textContent : ''),
    folkTalkRows: () => (fcBodyEl ? Array.from(fcBodyEl.querySelectorAll('.fc-page')).map(b => ({
      slug: b.getAttribute('data-slug'), text: b.textContent
    })) : []),
    folkTalkClose: () => closeFolkCard(),
    activeSpotKind: () => activeSpot && activeSpot.kind,
    promptRowsText: () => (dpRowsEl ? dpRowsEl.textContent : ''),
    notes: () => [...notesPinned],
    boardSprite: (s) => { const pr = propList.find(p => p.kind === 'board' && p.slug === s); return pr && pr.st ? pr.st.name : null; },
    photoOn: () => photoMode,
    photoEnter: () => enterPhoto(),
    photoExit: () => exitPhoto(),
    postcard: () => { const pc = buildPostcard(); return { w: pc.width, h: pc.height, data: pc.toDataURL('image/png').length }; },
    setDayNum: (n) => { dayNum = n; refreshFolk(); },
    setFounding: (v) => { foundingActive = !!v; bakeFoundingStrings(); if (REDUCED) draw(); },
    setLandfall: (v) => { landfallActive = !!v; bakeLandfall(); if (REDUCED) draw(); },
    landfallLights: () => waterLights.map(L => ({ x: L.x, y: L.y })),
    beaconList: () => beacons.map(b => b.slug),
    hudLine: () => { const e = document.getElementById('hud2'); return e.hidden ? '' : e.textContent; },
    townNoteNow: () => townNote,
    setTownNote: (m, t) => setTownNote(m, t),
    townSpots: () => spots.map(s => ({ kind: s.kind, ix: s.ix, iy: s.iy, slug: s.slug || null })),
    portalSpots: () => spots.filter(s => PORTAL_BY_KIND[s.kind])
      .map(s => ({ kind: s.kind, key: PORTAL_BY_KIND[s.kind].key, href: PORTAL_BY_KIND[s.kind].href, ix: s.ix, iy: s.iy, title: s.title, row: s.row })),
    nightNow: () => nf,
    clickableCount: () => townClickables.length
  };
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
  carvePlaza();        // ROOM TO MOVE: the civic square, carved before the ground bakes
  Wv = Wt; Hv = Ht;
  bakeAtlas();
  bakeTownSprites();
  bakeWater();
  bakeGrounds();
  placeStatics();
  clearPlazaProps();   // the square stays swept: no bench in the middle of it
  initPlayerSpawn();
  townData();          // wave 4: every town fact derived from the data
  // BREATHING ROOM + EVERY DOOR ON FOOT: prove all doors walkable from spawn,
  // repairing placement if any prop walled a lane off; assert at boot.
  fixReachability();
  // wave 4: the town's own landmarks, boards and lots go down on the repaired
  // map, and every solid claim is trial-fitted against the same BFS first
  placeTownLife();
  const reach = walkBFS();
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
  initTownUI();
  lightFactors(dayT);

  document.getElementById('loading').remove();
  console.log(`pixel docs city ready in ${(performance.now() - t0).toFixed(0)}ms - ${Wt}x${Ht} tiles, ${buildings.length} buildings, ${statics.length} statics, ${atlasStats.sprites} sprites, ${doors.length} doors`);

  route();
  // QUICK START FIRST: the opening gesture stands for every fresh landing -
  // a deep link straight to a page is a visitor who already knows the way
  if (!(location.hash && location.hash.length > 2)) qsInvite = !!qsDoorRef;
  window.__pixelTest = {
    qsInvite: () => ({ armed: qsInvite, slug: QS_SLUG, door: qsDoorRef ? { px: qsDoorRef.px, py: qsDoorRef.py } : null, face: player.face }),
    portalSign: () => ({ up: portalSignUp(), key: portalAsk ? portalAsk.key : null, leaving: portalLeaving }),
    spawnRoomLaw: () => spawnRoomOK(spawnTile[0], spawnTile[1]),
    // under reduced motion the loop is parked, so a test that teleports the courier
    // has to refresh proximity and repaint by hand; the moving profile is untouched
    setPlayer(x, y) { player.x = x; player.y = y; player.vx = player.vy = 0; camMode = 'follow'; if (REDUCED) { updateSpotProximity(); draw(); } else startLoop(); },
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
    fitInfo: () => ({ fit: fitCenter(), town: fitTown(), world: { w: worldW, h: worldH }, view: { w: cvs.width, h: cvs.height } }),
    drawerSaved: () => (drawerView ? { x: drawerView.x, y: drawerView.y, z: drawerView.z } : null),
    hlState: () => (hlB ? hlB.slug : null),
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
    sndPosState: () => ({ holder: posHolder, on: { van: posOn.van },
      rest: posVanRest, cfg: POSLOOP,
      lampD: (() => { let d3 = 99; for (const lp of lampPts) { const d4 = Math.abs(lp.tx + 0.5 - player.x) + Math.abs(lp.ty + 0.5 - player.y); if (d4 < d3) d3 = d4; } return d3; })(),
      vanD: (() => { let d3 = 99; for (const c of cars) { if (c.stopped || !c.van) continue; const d4 = Math.hypot(c.x - player.x, c.y - player.y); if (d4 < d3) d3 = d4; } return d3; })() }),
    sndVans: () => cars.filter(c => c.van).map(c => ({ x: c.x, y: c.y, stopped: c.stopped })),
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
  Object.assign(window.__pixelTest, townTestApi());
  window.__pdcDebug = { propList, statics, doors, buildings, spots, spawn: spawnTile.slice(),
    get orient() { return orient; }, get extraOK() { return extraOK; }, get folkOut() { return folkVisible; } };
  window.__pdcSPR = SPR;
  window.__pdcCard = () => buildPostcard();
  window.__pdcCam = (wx, wy) => { camMode = 'free'; camFly = null; cam.x = Math.round(wx - cvs.width / (2 * cam.z)); cam.y = Math.round(wy - cvs.height / (2 * cam.z)); if (REDUCED) draw(); else startLoop(); };
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
