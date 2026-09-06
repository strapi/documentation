// Terrain of the headland. One analytic height function shared by mesh,
// placement, paths and the player, so nothing ever floats.

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20230301); // the day the first five stones were laid
const PERM = new Uint8Array(512);
{
  const p = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(rng() * (i + 1));[p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
}
function lattice(ix, iz) { return PERM[(PERM[ix & 255] + iz) & 255] / 255; }
function fade(t) { return t * t * (3 - 2 * t); }

export function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const a = lattice(ix, iz), b = lattice(ix + 1, iz);
  const c = lattice(ix, iz + 1), d = lattice(ix + 1, iz + 1);
  const u = fade(fx), v = fade(fz);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, z, oct = 4) {
  let s = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += amp * vnoise(x * f, z * f); amp *= 0.5; f *= 2.02; }
  return s;
}
export function hash01(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 100000) / 100000;
}

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function sstep(a, b, v) { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
function lerp(a, b, t) { return a + (b - a) * t; }

// Flattened terraces: the districts of the sixteen official sections,
// plus working ground (banks, approaches). Heights in meters.
export const TERRACES = [
  { id: 'plaza',      x: -8,   z: 0,    r: 32, h: 2.2 },   // Getting Started, harbor plaza
  { id: 'features',   x: 52,   z: 34,   r: 26, h: 7.0 },   // Features, market terrace
  { id: 'ai',         x: 34,   z: -26,  r: 15, h: 6.5 },   // AI pavilions
  { id: 'apis',       x: 84,   z: -34,  r: 27, h: 12.0 },  // Content APIs colonnade
  { id: 'config',     x: 100,  z: 26,   r: 24, h: 15.0 },  // Configurations
  { id: 'dev',        x: 126,  z: -6,   r: 22, h: 19.0 },  // Development
  { id: 'ts',         x: 146,  z: 34,   r: 15, h: 22.0 },  // TypeScript
  { id: 'clicms',     x: 66,   z: -4,   r: 9,  h: 10.0 },  // CLI signal mast
  { id: 'plugins',    x: 156,  z: -44,  r: 20, h: 25.0 },  // Plugins development
  { id: 'upgrades',   x: 168,  z: 6,    r: 20, h: 27.0 },  // Upgrades, foot of the cliff road
  { id: 'upmid',      x: 184,  z: -12,  r: 14, h: 29.0 },
  { id: 'bankw',      x: 189,  z: -28,  r: 10, h: 30.2 },
  { id: 'banke',      x: 203,  z: -28,  r: 10, h: 30.2 },
  { id: 'uphigh',     x: 213,  z: -36,  r: 15, h: 33.0 },
  { id: 'approach',   x: 224,  z: -54,  r: 14, h: 39.0 },
  { id: 'crag',       x: 238,  z: -72,  r: 24, h: 47.0 },  // the Golden Shore
  { id: 'cl-gs',      x: -16,  z: 52,   r: 14, h: 2.0 },   // Cloud Getting Started
  { id: 'cl-proj',    x: 4,    z: 64,   r: 12, h: 2.6 },   // Projects management
  { id: 'cl-dep',     x: -30,  z: 64,   r: 10, h: 1.7 },   // Deployments
  { id: 'cl-acct',    x: 18,   z: 76,   r: 10, h: 3.2 },   // Account management
  { id: 'cl-cli',     x: -6,   z: 82,   r: 8,  h: 2.2 },   // Cloud CLI
  { id: 'cl-adv',     x: 30,   z: 58,   r: 10, h: 3.4 },   // Advanced configuration
];

export const COAST_X = -46;    // west of this line, the sea
export const SEA_LEVEL = 0;

export function terrainHeight(x, z) {
  // Base rise from the waterline to the crag.
  const t = clamp((x - COAST_X) / 300, 0, 1);
  let h = 50 * Math.pow(t, 1.25);
  // Cupping hills north and south.
  h += 12 * sstep(120, 270, Math.abs(z));
  // Rolling detail, flat near the shore.
  h += (fbm(x * 0.013, z * 0.013, 4) - 0.5) * 11 * clamp((x - COAST_X) / 70, 0.12, 1);
  h += (fbm(x * 0.06 + 7, z * 0.06 - 3, 3) - 0.5) * 1.6;
  // Sea floor.
  if (x < COAST_X) {
    const d = sstep(0, 34, COAST_X - x);
    h = lerp(Math.min(h, 1), -5.5, d);
  }
  // Terraces flatten their districts.
  for (const tr of TERRACES) {
    const dx = x - tr.x, dz = z - tr.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < tr.r) {
      const w = 1 - sstep(tr.r * 0.55, tr.r, dist);
      h = lerp(h, tr.h, w * 0.94);
    }
  }
  // The ravine: a trench the cliff road must cross. Cut after terraces.
  {
    const rx = 196 + Math.sin(z * 0.05) * 2.5;
    const dx = x - rx;
    const along = sstep(-78, -58, z) * (1 - sstep(0, 22, z));
    const depth = 10.5 * Math.exp(-(dx * dx) / (2 * 5.2 * 5.2)) * along;
    h -= depth;
  }
  return h;
}

// Decks that override the ground: the pier and the stone bridge.
export const PIER = { x0: -90, x1: -44, z0: -3.4, z1: 3.4, deck: 1.35 };
export const BRIDGE = { x0: 187, x1: 205, z0: -31.5, z1: -24.5, deck: 30.4, rise: 1.15 };

export function bridgeDeckAt(x) {
  const t = clamp((x - BRIDGE.x0) / (BRIDGE.x1 - BRIDGE.x0), 0, 1);
  return BRIDGE.deck + Math.sin(t * Math.PI) * BRIDGE.rise;
}

export function groundAt(x, z) {
  let g = terrainHeight(x, z);
  if (x >= PIER.x0 && x <= PIER.x1 && z >= PIER.z0 && z <= PIER.z1) g = Math.max(g, PIER.deck);
  if (x >= BRIDGE.x0 && x <= BRIDGE.x1 && z >= BRIDGE.z0 && z <= BRIDGE.z1) g = Math.max(g, bridgeDeckAt(x));
  return g;
}

export function terrainSlope(x, z) {
  const e = 1.2;
  const hx = terrainHeight(x + e, z) - terrainHeight(x - e, z);
  const hz = terrainHeight(x, z + e) - terrainHeight(x, z - e);
  return Math.sqrt(hx * hx + hz * hz) / (2 * e);
}
