// Terrain of the headland and its five provinces. One analytic height
// function shared by mesh, placement, paths and the player, so nothing
// ever floats. Provinces are the official taxonomy sections grouped by
// product and section, never a community and never an invented name.

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
  { id: 'clicms',     x: 22,   z: -54,  r: 9,  h: 8.6 },   // CLI signal mast, on the harbour point
  { id: 'plugins',    x: 156,  z: -44,  r: 20, h: 25.0 },  // Plugins development
  { id: 'upgrades',   x: 168,  z: 6,    r: 20, h: 27.0 },  // Upgrades, foot of the cliff road
  { id: 'upmid',      x: 184,  z: -12,  r: 14, h: 29.0 },
  { id: 'bankw',      x: 189,  z: -28,  r: 10, h: 30.2 },
  { id: 'banke',      x: 203,  z: -28,  r: 10, h: 30.2 },
  { id: 'uphigh',     x: 213,  z: -36,  r: 15, h: 33.0 },
  { id: 'approach',   x: 224,  z: -54,  r: 14, h: 39.0 },
  { id: 'crag',       x: 238,  z: -72,  r: 24, h: 47.0 },  // the Golden Shore
  // The Cloud Archipelago: six salt-white islets across the shallows, tied
  // to the shore and to each other by the stone causeway.
  { id: 'cl-gs',      x: -78,  z: 74,   r: 17, h: 3.0 },   // Cloud Getting Started, the largest islet
  { id: 'cl-proj',    x: -106, z: 56,   r: 12, h: 3.3 },   // Projects management
  { id: 'cl-adv',     x: -114, z: 92,   r: 11, h: 3.5 },   // Advanced configuration
  { id: 'cl-dep',     x: -86,  z: 106,  r: 9,  h: 2.6 },   // Deployments
  { id: 'cl-acct',    x: -58,  z: 98,   r: 9,  h: 2.8 },   // Account management
  { id: 'cl-cli',     x: -134, z: 72,   r: 7,  h: 3.1 },   // Cloud CLI, a mast on its own rock
];
export const TER = Object.fromEntries(TERRACES.map(t => [t.id, t]));

// ---------- the five provinces ----------
// Membership is the official taxonomy and nothing else: a page's province is
// read from its product and section. Sixteen official sections, five coasts.
export const PROVINCES = {
  harbor: {
    name: 'The Harbour Town', short: 'Harbour',
    sections: ['cms|Getting Started', 'cms|AI', 'cms|Command Line Interface'],
    anchors: ['plaza', 'ai', 'clicms'],
  },
  terraces: {
    name: 'The Olive Terraces', short: 'Terraces',
    sections: ['cms|Features', 'cms|Configurations', 'cms|Content APIs'],
    anchors: ['features', 'config', 'apis'],
  },
  highland: {
    name: 'The Pine Highland', short: 'Highland',
    sections: ['cms|Development', 'cms|TypeScript', 'cms|Plugins development'],
    anchors: ['dev', 'ts', 'plugins'],
  },
  wall: {
    name: 'The Upgrades Wall', short: 'Wall',
    sections: ['cms|Upgrades'],
    anchors: ['upgrades', 'upmid', 'bankw', 'banke', 'uphigh', 'approach', 'crag'],
  },
  cloud: {
    name: 'The Cloud Archipelago', short: 'Archipelago',
    sections: ['cloud|Getting Started', 'cloud|Projects management', 'cloud|Deployments',
      'cloud|Account management', 'cloud|Command Line Interface', 'cloud|Advanced configuration'],
    anchors: ['cl-gs', 'cl-proj', 'cl-adv', 'cl-dep', 'cl-acct', 'cl-cli'],
  },
};
export const PROVINCE_KEYS = Object.keys(PROVINCES);
export const PROVINCE_OF_SECTION = (() => {
  const out = {};
  for (const k of PROVINCE_KEYS) for (const sec of PROVINCES[k].sections) out[sec] = k;
  return out;
})();

// Soft province field. Softmax over the signed distance to each province's
// nearest district edge, with a wide tau so a border is an ecotone tens of
// metres deep and never a line: the ground, the growth and the air all read
// the same weights, so they hand over together.
const ECOTONE = 11.0;
const _pw = new Float32Array(PROVINCE_KEYS.length);
export function provinceWeights(x, z) {
  let sum = 0, best = 1e9;
  for (let i = 0; i < PROVINCE_KEYS.length; i++) {
    const prov = PROVINCES[PROVINCE_KEYS[i]];
    let d = 1e9;
    for (const id of prov.anchors) {
      const t = TER[id];
      const dx = x - t.x, dz = z - t.z;
      const dd = Math.sqrt(dx * dx + dz * dz) - t.r;
      if (dd < d) d = dd;
    }
    _pw[i] = d;
    if (d < best) best = d;
  }
  for (let i = 0; i < PROVINCE_KEYS.length; i++) {
    const w = Math.exp(-(Math.max(_pw[i], 0) - Math.max(best, 0)) / ECOTONE);
    _pw[i] = w; sum += w;
  }
  for (let i = 0; i < PROVINCE_KEYS.length; i++) _pw[i] /= sum;
  return _pw; // reused buffer: copy it if you keep it
}
export function provinceAt(x, z) {
  const w = provinceWeights(x, z);
  let bi = 0;
  for (let i = 1; i < w.length; i++) if (w[i] > w[bi]) bi = i;
  return PROVINCE_KEYS[bi];
}
// How undecided the ground is here: 0 deep inside one province, 1 on a border.
export function borderness(x, z) {
  const w = provinceWeights(x, z);
  let a = 0, b = 0;
  for (let i = 0; i < w.length; i++) { if (w[i] > a) { b = a; a = w[i]; } else if (w[i] > b) b = w[i]; }
  return Math.min(1, (b / (a || 1)) * 1.15);
}

// Gateways, filled in by the town as it builds them. Nothing grows in a
// gateway: the town publishes where its thresholds stand and the vegetation
// keeps out of them, the same way it keeps out of a road.
export const GATES = [];

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
    // The archipelago stands on a shelf: the sea shallows out under the six
    // islets, which is why the water there goes turquoise and the causeway
    // can be built on stone rather than piles.
    const sx = -96, sz = 82;
    const shelf = 1 - sstep(34, 86, Math.hypot(x - sx, (z - sz) * 1.15));
    if (shelf > 0) h = lerp(h, -1.5, shelf * 0.92);
  }
  // Terraces flatten their districts. Offshore they do the opposite and
  // raise an islet, and an islet is a plateau with a shoulder, not a dome:
  // the flat top is what makes a Cycladic village possible on it.
  for (const tr of TERRACES) {
    const dx = x - tr.x, dz = z - tr.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < tr.r) {
      const islet = tr.id.charCodeAt(0) === 99 && tr.id.charCodeAt(2) === 45; // 'cl-'
      const w = 1 - sstep(tr.r * (islet ? 0.80 : 0.55), tr.r, dist);
      h = lerp(h, tr.h, w * (islet ? 0.985 : 0.94));
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

// Decks that override the ground: the pier, the stone bridge, the causeway.
export const PIER = { x0: -90, x1: -44, z0: -3.4, z1: 3.4, deck: 1.35 };
export const BRIDGE = { x0: 187, x1: 205, z0: -31.5, z1: -24.5, deck: 30.4, rise: 1.15 };

export function bridgeDeckAt(x) {
  const t = clamp((x - BRIDGE.x0) / (BRIDGE.x1 - BRIDGE.x0), 0, 1);
  return BRIDGE.deck + Math.sin(t * Math.PI) * BRIDGE.rise;
}

// The causeway: the walked border between the Harbour Town and the Cloud
// Archipelago. Laid stone over the shelf, low enough that the sea washes the
// kerb, so crossing it is a handover you feel underfoot and not a teleport.
export const CAUSEWAYS = [
  { pts: [[-30, 42], [-42, 50], [-54, 58], [-66, 66], [-78, 72]], w: 3.0, deck: 1.05 },
  { pts: [[-78, 74], [-92, 64], [-106, 56]], w: 1.9, deck: 0.92 },
  { pts: [[-78, 76], [-68, 88], [-58, 98]], w: 1.9, deck: 0.92 },
  { pts: [[-58, 98], [-72, 104], [-86, 106]], w: 1.9, deck: 0.92 },
  { pts: [[-106, 58], [-112, 74], [-114, 92]], w: 1.9, deck: 0.92 },
  { pts: [[-106, 56], [-120, 64], [-134, 72]], w: 1.9, deck: 0.92 },
];

function distToSeg(x, z, x0, z0, x1, z1) {
  const dx = x1 - x0, dz = z1 - z0;
  const L2 = dx * dx + dz * dz;
  let t = L2 ? ((x - x0) * dx + (z - z0) * dz) / L2 : 0;
  t = clamp(t, 0, 1);
  return Math.hypot(x - (x0 + dx * t), z - (z0 + dz * t));
}
export function causewayDeckAt(x, z) {
  if (x > -20 || x < -145 || z < 30 || z > 118) return -Infinity;
  for (const cw of CAUSEWAYS) {
    for (let i = 0; i < cw.pts.length - 1; i++) {
      const [x0, z0] = cw.pts[i], [x1, z1] = cw.pts[i + 1];
      if (distToSeg(x, z, x0, z0, x1, z1) < cw.w * 0.5 + 0.4) return cw.deck;
    }
  }
  return -Infinity;
}

export function groundAt(x, z) {
  let g = terrainHeight(x, z);
  if (x >= PIER.x0 && x <= PIER.x1 && z >= PIER.z0 && z <= PIER.z1) g = Math.max(g, PIER.deck);
  if (x >= BRIDGE.x0 && x <= BRIDGE.x1 && z >= BRIDGE.z0 && z <= BRIDGE.z1) g = Math.max(g, bridgeDeckAt(x));
  const cd = causewayDeckAt(x, z);
  if (cd > -Infinity) g = Math.max(g, cd);
  return g;
}

// What a boot lands on, province by province. The footstep recipe changes
// the instant the earth does, which is half of what a border sounds like.
export function surfaceAt(x, z) {
  if (x >= PIER.x0 && x <= PIER.x1 && Math.abs(z) <= 3.4) return 'boards';
  if (x >= BRIDGE.x0 && x <= BRIDGE.x1 && z >= BRIDGE.z0 && z <= BRIDGE.z1) return 'boards';
  if (causewayDeckAt(x, z) > -Infinity) return 'cobbles';
  for (const tr of TERRACES) {
    const dx = x - tr.x, dz = z - tr.z;
    if (dx * dx + dz * dz < tr.r * tr.r * 0.55) {
      return tr.id.startsWith('cl-') ? 'shell' : (tr.id === 'dev' || tr.id === 'ts' || tr.id === 'plugins' ? 'needles' : 'cobbles');
    }
  }
  const h = terrainHeight(x, z);
  if (h < 1.4) return 'sand';
  const p = provinceAt(x, z);
  if (p === 'highland') return 'needles';
  if (p === 'wall') return 'scree';
  if (p === 'cloud') return 'shell';
  if (p === 'terraces') return h < 42 ? 'grass' : 'dirt';
  return h < 42 ? 'grass' : 'dirt';
}

export function terrainSlope(x, z) {
  const e = 1.2;
  const hx = terrainHeight(x + e, z) - terrainHeight(x - e, z);
  const hz = terrainHeight(x, z + e) - terrainHeight(x, z - e);
  return Math.sqrt(hx * hx + hz * hz) / (2 * e);
}
