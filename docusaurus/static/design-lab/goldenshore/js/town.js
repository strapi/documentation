// The town. Every station is a real page, every sign carries real strings,
// every footpath is a citation edge, every lantern burns provenance truth.
// This pass owes the light its debt: no flat single-color face survives
// near the camera. Stone is coursed, plaster is mottled, wood has grain,
// roofs are instanced terracotta rows, paths carry wheel ruts.

import * as THREE from 'three';
import {
  terrainHeight, groundAt, TERRACES, PIER, BRIDGE, bridgeDeckAt, hash01, fbm,
  CAUSEWAYS, causewayDeckAt, PROVINCES, PROVINCE_KEYS, PROVINCE_OF_SECTION,
  provinceAt, provinceWeights, GATES,
} from './terrain.js';
import { sharedMaps, addWind, addRim, noReflect, WORLD } from './world.js';
import { daysSince } from './data.js';

const VIOLET = 0x4945FF;

// world texels per meter for box-projected UVs
const STONE_UV = 0.37;   // one 512 px stone tile every 2.7 m, courses about 30 cm
const PLASTER_UV = 0.30;

// ---------- full-coast layout: all 290 pages stand ----------
// Provinces are the official taxonomy regrouped only by adjacency, never
// renamed. Placement is deterministic: phyllotaxis seeded by section, a
// switchback ladder for the cliff road, stoa rows for the colonnade, and
// off-trail croft fields for the fifty pages nothing links to.

const DISTRICT_OF = {
  'cms|Getting Started': 'plaza', 'cms|Features': 'features', 'cms|AI': 'ai',
  'cms|Content APIs': 'apis', 'cms|Configurations': 'config', 'cms|Development': 'dev',
  'cms|TypeScript': 'ts', 'cms|Command Line Interface': 'clicms',
  'cms|Plugins development': 'plugins', 'cms|Upgrades': 'upgrades',
  'cloud|Getting Started': 'cl-gs', 'cloud|Projects management': 'cl-proj',
  'cloud|Deployments': 'cl-dep', 'cloud|Account management': 'cl-acct',
  'cloud|Command Line Interface': 'cl-cli', 'cloud|Advanced configuration': 'cl-adv',
};
const TER = Object.fromEntries(TERRACES.map(t => [t.id, t]));

const SPECIAL_POS = {
  /* (2026-09-07, owner) THE QUICK START IS THE FIRST DOOR OFF THE JETTY. It
     stood at x=10, which is fifty-four metres from the pier head and behind a
     dozen other houses: "le quick start guide devrait etre le premier batiment
     juste apres le ponton, comme avant... la on a des batiments qui bloquent le
     portail." It takes the nearest plot instead, sixteen metres out, and the
     house that held it goes back to where the Quick Start was. A straight swap,
     so nothing overlaps and no other door moves. */
  '/cms/quick-start': { x: -28, z: 1, yaw: Math.PI * 1.5 },         // violet door faces the pier
  '/cms/installation/docker': { x: 10, z: 0 },                      // and Docker takes the old plot
  '/cms/api/document-service': { x: 84, z: -34 },                   // the wellhouse
  '/cms/migration/v4-to-v5/breaking-changes': { x: 210, z: -28 },   // across the Crossing
  '/release-notes': { x: 239, z: -76 },                             // door of the Golden Shore, on the light's cape
  '/cloud/projects/settings': { x: -104, z: 58 },                   // the harbormaster's desk, out on Projects
  '/cms/cli': { x: 22, z: -54 },                                    // the CMS signal mast on the harbour point
  '/cloud/cli/cloud-cli': { x: -134, z: 72 },                       // the Cloud signal mast, its own rock
  '/cms/migration/v4-to-v5/introduction-and-faq': { x: 168, z: 6 },
  '/cms/migration/v4-to-v5/step-by-step': { x: 176, z: -2 },
  '/cms/upgrade-tool': { x: 170, z: -12 },
  '/cms/api/rest/guides/understanding-populate': { x: 84, z: -14 }, // the long gallery
};

// The cliff road: switchback legs the Upgrades stations climb, west of the
// Crossing then east of it to the approach. Also drawn as the road itself.
// The ladder used to swing west to x=146 and south to z=-56, which put two
// thirds of its turns inside the Pine Highland's plugins ground: relimed
// limestone way-stations standing on needle floor under maritime pine. It now
// climbs between its own rails, x=168 to x=193, from the foot of the cliff to
// the head of the Crossing, and the three turns of it carry Wall way-posts so
// the road is Wall country the whole way up.
export const CLIFF_PTS = [
  [168, 6], [193, 3], [170, -3], [193, -9], [170, -15], [192, -21],
  [171, -26], [183, -27],
];
export const CLIFF_PTS_EAST = [
  [207, -27], [219, -35], [206, -46], [220, -57], [228, -50], [224, -54],
];

// Croft fields: where the fifty unmarked one-room houses hide, off-trail.
// A croft hides in the back country of its OWN province, so an unlinked
// Upgrades page is a hut on the scree and an unlinked Cloud page is a hut on
// a bare rock, not a stranger dropped in someone else's earth.
const CROFT_FIELDS = {
  harbor:   [{ x: 4, z: -74, r: 18 }, { x: -22, z: -58, r: 14 }],
  terraces: [{ x: 96, z: 84, r: 26 }, { x: 70, z: -74, r: 20 }, { x: 120, z: 66, r: 22 }, { x: 44, z: 74, r: 18 }],
  highland: [{ x: 148, z: 70, r: 24 }, { x: 132, z: -84, r: 20 }, { x: 168, z: -84, r: 18 }],
  wall:     [{ x: 208, z: 34, r: 18 }, { x: 250, z: -22, r: 16 }],
  // the archipelago has no back country, so its crofts take the seaward
  // shoulder of an islet, above the tide line and off every stepping path
  cloud:    [{ x: -78, z: 74, r: 14 }, { x: -106, z: 56, r: 10 }, { x: -114, z: 92, r: 9 }, { x: -58, z: 98, r: 7 }],
};

// ---------- merge bucket ----------
class Bucket {
  constructor() { this.pos = []; this.nor = []; this.uv = []; this.col = []; }
  // uvWorld > 0 box-projects UVs from world position at that texel scale,
  // so coursed stone and mottled plaster keep one density everywhere and
  // stay continuous across adjacent blocks.
  add(geo, matrix, color, jitter = 0, uvWorld = 0) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (matrix) g.applyMatrix4(matrix);
    const p = g.attributes.position, n = g.attributes.normal;
    let u = g.attributes.uv;
    if (uvWorld) {
      if (!u) {
        u = new THREE.BufferAttribute(new Float32Array(p.count * 2), 2);
        g.setAttribute('uv', u);
      }
      for (let i = 0; i < p.count; i += 3) {
        const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
        for (let k = i; k < i + 3; k++) {
          const X = p.getX(k), Y = p.getY(k), Z = p.getZ(k);
          if (ay >= ax && ay >= az) u.setXY(k, X * uvWorld, Z * uvWorld);
          else if (ax >= az) u.setXY(k, Z * uvWorld, Y * uvWorld);
          else u.setXY(k, X * uvWorld, Y * uvWorld);
        }
      }
    }
    const c = new THREE.Color(color);
    if (jitter) {
      const h = (Math.random() - 0.5) * jitter;
      c.offsetHSL(h * 0.15, h * 0.3, h * 0.5);
    }
    for (let i = 0; i < p.count; i++) {
      this.pos.push(p.getX(i), p.getY(i), p.getZ(i));
      this.nor.push(n.getX(i), n.getY(i), n.getZ(i));
      this.uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0);
      this.col.push(c.r, c.g, c.b);
    }
    if (g !== geo) g.dispose();
  }
  build(material, shadows = true) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = shadows; mesh.receiveShadow = true;
    return mesh;
  }
}

function mat4(x, y, z, ry = 0, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Matrix4();
  m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new THREE.Vector3(sx, sy, sz));
  return m;
}
// Local house frame to world: Ry(yaw) maps local +X to (cos,0,-sin), +Z to (sin,0,cos).
function l2w(x, z, yaw, lx, lz) {
  return [x + lx * Math.cos(yaw) + lz * Math.sin(yaw), z - lx * Math.sin(yaw) + lz * Math.cos(yaw)];
}
const _qy = new THREE.Quaternion(), _qp = new THREE.Quaternion(), _AXX = new THREE.Vector3(1, 0, 0), _AXY = new THREE.Vector3(0, 1, 0);
function yawPitchQuat(yaw, pitchX) {
  _qy.setFromAxisAngle(_AXY, yaw);
  _qp.setFromAxisAngle(_AXX, pitchX);
  return _qy.clone().multiply(_qp);
}

// ---------- sign atlas ----------
const ATLAS = 4096, CW = 256, CH = 128, COLS = ATLAS / CW;
function makeAtlas() {
  const c = document.createElement('canvas'); c.width = c.height = ATLAS;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#6b4a2e'; ctx.fillRect(0, 0, ATLAS, ATLAS);
  return { canvas: c, ctx, next: 0 };
}
function cellRect(i) { return { x: (i % COLS) * CW, y: Math.floor(i / COLS) * CH }; }
function wrapText(ctx, text, maxW) {
  const words = String(text).split(' '); const lines = []; let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}
const FONT = '"Gill Sans", "Avenir Next", "Segoe UI", system-ui, sans-serif';

function drawSign(atlas, kind, title, sub) {
  const i = atlas.next++;
  const { x, y } = cellRect(i);
  const ctx = atlas.ctx;
  ctx.save(); ctx.translate(x, y);
  if (kind === 'plaque') {
    // an endpoint plaque: carved limestone, method engraved as a seal
    ctx.fillStyle = '#a89878'; ctx.fillRect(0, 0, CW, CH);
    ctx.globalAlpha = 0.16;
    for (let k = 0; k < 120; k++) { ctx.fillStyle = Math.random() > 0.5 ? '#8d7d63' : '#b9ab8d'; ctx.fillRect(Math.random() * CW, Math.random() * CH, 3, 3); }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(70,58,40,0.55)'; ctx.lineWidth = 4; ctx.strokeRect(4, 4, CW - 8, CH - 8);
    const mcol = { GET: '#3d6b46', POST: '#6b5a2c', PUT: '#5a4a6b', DELETE: '#6b3a34' }[title] || '#54483a';
    ctx.fillStyle = mcol;
    ctx.font = `700 30px ${FONT}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(title || '', CW / 2, 38);
    ctx.fillStyle = '#453a29';
    let fs = 20;
    ctx.font = `600 ${fs}px ${FONT}`;
    while (fs > 9 && ctx.measureText(sub || '').width > CW - 20) { fs -= 1; ctx.font = `600 ${fs}px ${FONT}`; }
    ctx.fillText(sub || '', CW / 2, 84);
    ctx.restore();
    return i;
  }
  if (kind === 'board') {
    // a painted route board for the trailhouses
    ctx.fillStyle = '#e7ddc4'; ctx.fillRect(0, 0, CW, CH);
    ctx.strokeStyle = '#4945FF'; ctx.lineWidth = 5; ctx.strokeRect(4, 4, CW - 8, CH - 8);
    ctx.fillStyle = '#3a3630';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `600 22px ${FONT}`;
    const bl = wrapText(ctx, title, CW - 30).slice(0, 2);
    bl.forEach((ln, k) => ctx.fillText(ln, CW / 2, 42 + k * 26));
    if (sub) { ctx.font = `500 15px ${FONT}`; ctx.fillStyle = '#4945FF'; ctx.fillText(sub, CW / 2, 100); }
    ctx.restore();
    return i;
  }
  if (kind === 'wood') {
    ctx.fillStyle = '#5d4028'; ctx.fillRect(0, 0, CW, CH);
    ctx.globalAlpha = 0.25;
    for (let k = 0; k < 22; k++) { ctx.fillStyle = k % 2 ? '#4c3320' : '#6b4a2e'; ctx.fillRect(0, k * 6 + Math.sin(k) * 2, CW, 3); }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(38,24,12,0.85)'; ctx.lineWidth = 6; ctx.strokeRect(3, 3, CW - 6, CH - 6);
  } else {
    ctx.fillStyle = '#a29276'; ctx.fillRect(0, 0, CW, CH);
    ctx.globalAlpha = 0.18;
    for (let k = 0; k < 160; k++) { ctx.fillStyle = Math.random() > 0.5 ? '#8d7d63' : '#b5a689'; ctx.fillRect(Math.random() * CW, Math.random() * CH, 3, 3); }
    ctx.globalAlpha = 1;
  }
  const ink = kind === 'wood' ? '#f2debb' : '#453a29';
  const hi = kind === 'wood' ? 'rgba(30,18,8,0.7)' : 'rgba(236,226,204,0.8)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `600 26px ${FONT}`;
  let lines = wrapText(ctx, title, CW - 26);
  if (lines.length > 2) { ctx.font = `600 21px ${FONT}`; lines = wrapText(ctx, title, CW - 22); }
  lines = lines.slice(0, 3);
  const lh = lines.length > 2 ? 24 : 30;
  const totalH = lines.length * lh;
  const y0 = (sub ? 52 : 62) - totalH / 2 + lh / 2;
  lines.forEach((ln, k) => {
    ctx.fillStyle = hi; ctx.fillText(ln, CW / 2 + 1, y0 + k * lh + (kind === 'wood' ? 1.5 : 1.5));
    ctx.fillStyle = ink; ctx.fillText(ln, CW / 2, y0 + k * lh);
  });
  if (sub) {
    ctx.font = `500 13.5px ${FONT}`;
    const subLines = wrapText(ctx, sub, CW - 24).slice(0, 2);
    subLines.forEach((ln, k) => {
      ctx.fillStyle = hi; ctx.fillText(ln, CW / 2 + 1, 96 + k * 17 + 1);
      ctx.fillStyle = kind === 'wood' ? '#d9be92' : '#584c37'; ctx.fillText(ln, CW / 2, 96 + k * 17);
    });
  }
  ctx.restore();
  return i;
}
function signUV(i) {
  const { x, y } = cellRect(i);
  return { u0: x / ATLAS, v0: 1 - (y + CH) / ATLAS, u1: (x + CW) / ATLAS, v1: 1 - y / ATLAS };
}
function signQuad(bucket, i, x, y, z, ry, w = 1.9, h = 0.95, backBucket = null, backColor = 0x4c3320) {
  const geo = new THREE.PlaneGeometry(w, h);
  const { u0, v0, u1, v1 } = signUV(i);
  const uv = geo.attributes.uv;
  for (let k = 0; k < uv.count; k++) {
    uv.setXY(k, u0 + uv.getX(k) * (u1 - u0), v0 + uv.getY(k) * (v1 - v0));
  }
  bucket.add(geo, mat4(x, y, z, ry), 0xffffff);
  geo.dispose();
  // a real back board, so the words never read mirror-flipped from behind
  if (backBucket) {
    const bx = x - Math.sin(ry) * 0.035, bz = z - Math.cos(ry) * 0.035;
    backBucket.add(new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.05), mat4(bx, y, bz, ry), backColor, 0.1);
  }
}

// ---------- the build ----------
export function buildTown(scene, data, tendedSet) {
  const maps = sharedMaps();
  const { content, taxonomy, provenance, inbound, graph, stats, sectionByKey } = data;

  const atlas = makeAtlas();
  const winTexCanvas = (() => {
    const c = document.createElement('canvas'); c.width = 48; c.height = 64;
    const cx = c.getContext('2d');
    cx.fillStyle = '#3a2c1c'; cx.fillRect(0, 0, 48, 64);
    const g = cx.createRadialGradient(24, 34, 3, 24, 34, 30);
    g.addColorStop(0, '#ffdf9d'); g.addColorStop(0.55, '#d8913f'); g.addColorStop(1, '#7c4a1e');
    cx.fillStyle = g; cx.fillRect(4, 4, 40, 56);
    cx.strokeStyle = '#3a2c1c'; cx.lineWidth = 3;
    cx.beginPath(); cx.moveTo(24, 4); cx.lineTo(24, 60); cx.moveTo(4, 32); cx.lineTo(44, 32); cx.stroke();
    return c;
  })();
  const walls = new Bucket(), stone = new Bucket(), wood = new Bucket(),
    doors = new Bucket(), windows = new Bucket(), signs = new Bucket();
  const colliders = [];
  const stations = [];
  const bySlug = new Map();
  const tileRows = [];
  const chimneys = [];   // { x, y, z, smoking } - smoke only on real recent care
  const laundry = [];    // cloth piece placements
  const awningSpots = []; // { x, y, z, ry, w, d, c }
  const figSpots = [];
  const amphoraSpots = [];
  const crateSpots = [];
  const potSpots = [];
  const cliffRoad = [];  // filled for buildPaths

  const PLASTERS = [0xEDE0CC, 0xE8D2AC, 0xDCC49A, 0xF0E6D4, 0xD9BE93];
  const TERRA = 0x9D5A3C;
  // ----- what a house is made of, province by province -----
  // Five vernaculars. The rule that picks one is the page's own official
  // section, so a wall you can see from the path tells you which part of the
  // documentation you are standing in before any sign does.
  const VERN = {
    harbor: {
      // limewashed plaster over harbour stone, terracotta, working shutters
      plasters: [0xEDE0CC, 0xE8D2AC, 0xF0E6D4, 0xE4CBA5, 0xDCC49A],
      base: 0xAF9C79, quoin: 0xE0D5BC, roofTint: 0x6B3D27, tileTone: 0, tile: 0x96604B, ashlar: 0xB3A484,
      shutters: [0x5A6648, 0x4a3524, 0x8A4B2E], eave: 0.55, wet: true,
    },
    terraces: {
      // the same lime, but mixed with the red earth it stands on, and roofs
      // burnt deeper by the same clay
      plasters: [0xE0BE96, 0xD6AC7A, 0xE7CDA2, 0xCE9E6C, 0xDBB98C],
      base: 0xA9744B, quoin: 0xD8C39F, roofTint: 0x8C3E27, tileTone: 0.16, tile: 0xA35434, ashlar: 0xB09069,
      shutters: [0x5A6648, 0x6B3D27], eave: 0.62, pergola: true,
    },
    highland: {
      // render goes grey under the pines and the upper floor is timbered,
      // because up here you build with what the forest gives you
      plasters: [0x9AA093, 0x8E9488, 0xA6AA9C, 0x939A90],
      base: 0x877F72, quoin: 0xC6BCA8, roofTint: 0x4A3C33, tileTone: -0.30,
      shutters: [0x39482F, 0x2F3E28], eave: 0.78, timber: true, deepEave: true,
    },
    wall: {
      // relimed every spring so the switchbacks can be seen from the sea,
      // roofed in stone slab because nothing survives the wind up there
      plasters: [0xEDE8DA, 0xE6E1D2, 0xF2EEE2],
      base: 0xC9BFA8, quoin: 0xF0EADC, roofTint: 0x8F8168, tileTone: 0.0, tile: 0xB2A88E, ashlar: 0xD6CFBA,
      shutters: [0x6B6255, 0x7A7060], eave: 0.34, stoneRoof: true,
    },
    cloud: {
      // whitewash is not a colour, it is a chore. These islets are relimed
      // each season, so they take no weathering and read salt white even
      // under a sun this orange. Flat roofs, blue joinery, no chimney.
      plasters: [0xFFFFFF, 0xFCFCFA, 0xF7F9FA],
      base: 0xEDE8DA, quoin: 0xFFFFFF, roofTint: 0xF4F2EA, tileTone: 0.0,
      // a stronger blue than the real pigment, because an orange sun this low
      // eats saturation out of the cool end and a true Cycladic blue would
      // render as a dark olive smear
      shutters: [0x3C8FD6, 0x4E9FE0, 0x3480C4], eave: 0.22, flat: true, fresh: true,
    },
  };
  const vernOf = (st) => VERN[st.province] || VERN.harbor;
  const QUOIN = 0xD9CDB4, DARKWOOD = 0x4a3524;
  const refDate = stats.lastDate;
  const touched30 = (slug) => provenance[slug] ? daysSince(provenance[slug].last, refDate) <= 30 : false;

  // ----- what a station IS, from the shipped data alone -----
  const LANDMARKS = new Set([
    '/cms/api/document-service', '/cms/migration/v4-to-v5/breaking-changes',
    '/release-notes', '/cms/cli', '/cloud/cli/cloud-cli',
  ]);
  const CORNERS = new Set(Object.keys(provenance).filter(k => provenance[k].first === '2023-03-01'));
  function typeOf(st) {
    if (LANDMARKS.has(st.slug)) return 'landmark';
    if (st.inbound >= 15) return 'hub';
    if (st.inbound === 0) return 'croft'; // the fifty stay fifty; data wins over the resolution order
    if (st.slug.includes('/guides/') || st.tax.section === 'Getting Started') return 'guide';
    if (st.tax.section === 'Configurations' || st.tax.section === 'Advanced configuration') return 'workshop';
    if (st.tax.section === 'Content APIs') return 'stoa';
    return 'house';
  }
  function countSteps(blocks) {
    let n = 0;
    for (const b of blocks || []) {
      if (b.t === 'ol') n++;
      if (b.blocks) n += countSteps(b.blocks);
      if (b.tabs) for (const t of b.tabs) n += countSteps(t.blocks);
      if (b.items) for (const it of b.items) if (it && typeof it !== 'string') n += countSteps(it.blocks);
      if (b.cols) for (const c of b.cols) n += countSteps(c);
    }
    return n;
  }
  function collectEndpoints(blocks, out) {
    for (const b of blocks || []) {
      if (b.t === 'endpoint') out.push({ method: b.method || '', path: b.path || b.title || '' });
      if (b.blocks) collectEndpoints(b.blocks, out);
      if (b.tabs) for (const t of b.tabs) collectEndpoints(t.blocks, out);
      if (b.items) for (const it of b.items) if (it && typeof it !== 'string') collectEndpoints(it.blocks, out);
      if (b.cols) for (const c of b.cols) collectEndpoints(c, out);
    }
    return out;
  }

  function stationAt(slug, x, z, yaw, opts = {}) {
    const page = content.pages[slug];
    if (!page) return null;
    const tax = taxonomy[slug] || { product: '?', section: '?' };
    const prov = provenance[slug];
    const g = groundAt(x, z);
    const st = {
      slug, page, tax, prov, x, z, y: g, yaw,
      inbound: inbound[slug] || 0,
      special: opts.special || null,
      night: prov ? (prov.night || 0) : 0,
      lanternIndex: -1,
      lx: x, ly: g + 2.6, lz: z,
      // the province is the page's own official product and section, never
      // where it happens to have landed
      province: PROVINCE_OF_SECTION[tax.product + '|' + tax.section] || provinceAt(x, z),
    };
    st.type = typeOf(st);
    stations.push(st); bySlug.set(slug, st);
    return st;
  }

  // ----- the house kit: reveals, shutters with slats, quoin courses, -----
  // ----- plinth foundations, tiled roofs, chimneys that know the data -----
  function house(st, opts = {}) {
    const stories = opts.stories || 1;
    const w = opts.w || 5.2 + hash01(st.slug) * 1.8;
    const d = opts.d || 4.2 + hash01(st.slug + 'd') * 1.6;
    const h = opts.h || (3.1 + hash01(st.slug + 'h') * 0.9) * (stories === 2 ? 1.82 : 1);
    const { x, z, yaw } = st;
    const g = st.y;
    const vern = vernOf(st);
    const rawPlaster = opts.plaster !== undefined ? opts.plaster
      : vern.plasters[Math.floor(hash01(st.slug + 'p') * vern.plasters.length)];
    // plaster ages toward the grey of its own province: how long this page has
    // stood, damped to nothing where the vernacular is relimed every season
    let age = st.prov ? Math.min(1, daysSince(st.prov.first, refDate) / 1300) : 0.4;
    if (vern.fresh) age *= 0.10;
    const plaster = new THREE.Color(rawPlaster).lerp(new THREE.Color(0xC7BCA8), age * 0.22).getHex();
    const M = (lx, ly, lz, ry = 0, sx = 1, sy = 1, sz = 1) => {
      const [wx, wz] = l2w(x, z, yaw, lx, lz);
      return mat4(wx, g + ly, wz, yaw + ry, sx, sy, sz);
    };
    const df = d / 2;
    const bodyBucket = opts.stoneBody ? stone : walls;
    const bodyUV = opts.stoneBody ? STONE_UV : PLASTER_UV;
    const bodyColor = opts.stoneBody ? vern.ashlar : plaster;
    const QC = vern.quoin;
    const stoneRoof = opts.stoneRoof || (vern.stoneRoof && !opts.tileRoof);
    const flatRoof = !!vern.flat && !opts.gableRoof;

    // plinth foundation, sunk two meters into the slope so nothing floats
    stone.add(new THREE.BoxGeometry(w + 0.24, 2.2, d + 0.24), M(0, -1.02, 0), 0x9A8B6C, 0.08, STONE_UV);
    // body and stone base band
    bodyBucket.add(new THREE.BoxGeometry(w, h + 1.2, d), M(0, h / 2 - 0.6, 0), bodyColor, 0.12, bodyUV);
    stone.add(new THREE.BoxGeometry(w + 0.16, 0.6, d + 0.16), M(0, 0.3, 0), vern.base, 0.12, STONE_UV);
    // string course between stories
    if (stories === 2) stone.add(new THREE.BoxGeometry(w + 0.14, 0.14, d + 0.14), M(0, h * 0.52, 0), QC, 0.06, STONE_UV);
    // the highland timbers its upper floor: one band and two corner posts
    if (vern.timber && h > 2.4) {
      wood.add(new THREE.BoxGeometry(w + 0.10, 0.17, d + 0.10), M(0, h * 0.56, 0), 0x4E3B28, 0.15);
      for (const sx_ of [-1, 1]) {
        wood.add(new THREE.BoxGeometry(0.14, h * 0.40, 0.14), M(sx_ * (w / 2 - 0.16), h * 0.78, d / 2 + 0.03), DARKWOOD, 0.12);
      }
    }

    // quoins: alternating courses turning the corner
    const qn = Math.max(4, Math.round(h / 0.42));
    if (!opts.stoneBody) {
      for (const sx_ of [1, -1]) for (const sz_ of [1, -1]) {
        for (let k = 0; k < qn; k++) {
          const alt = k % 2;
          stone.add(new THREE.BoxGeometry(alt ? 0.48 : 0.30, 0.3, alt ? 0.30 : 0.48),
            M(sx_ * (w / 2 - 0.09), 0.76 + k * 0.42, sz_ * (d / 2 - 0.09)), QC, 0.05, STONE_UV);
        }
      }
    }

    // ----- the Cloud cube: no pitch at all, a parapet and a stair -----
    if (flatRoof) {
      const par = 0.42;
      bodyBucket.add(new THREE.BoxGeometry(w + 0.22, par, d + 0.22), M(0, h + 0.6 + par / 2, 0), plaster, 0.05, bodyUV);
      stone.add(new THREE.BoxGeometry(w + 0.30, 0.09, d + 0.30), M(0, h + 0.6 + par + 0.045, 0), vern.quoin, 0.03, STONE_UV);
      walls.add(new THREE.BoxGeometry(w + 0.02, 0.14, d + 0.02), M(0, h + 0.62, 0), vern.roofTint, 0.04, bodyUV);
      // The outside stair every island house has, up the blind flank. It is a
      // built mass with treads cut into it, not a ladder of floating slabs:
      // the first pass had the treads hanging in the air with nothing under
      // them, which is exactly what a close plate exposes.
      {
        const steps = 7, rise = (h + 0.4) / steps, tread = 0.40;
        const lx = -w / 2 - 0.52;
        for (let k = 0; k < steps; k++) {
          const ly = rise * (k + 0.5) / 2;             // the wedge under this tread
          const lz = -d / 2 + 0.34 + k * tread;
          stone.add(new THREE.BoxGeometry(1.02, rise * (k + 1), tread + 0.02),
            M(lx, ly, lz), plaster, 0.03, STONE_UV);
          stone.add(new THREE.BoxGeometry(1.08, 0.07, tread + 0.06),
            M(lx, rise * (k + 1) + 0.03, lz), vern.quoin, 0.03, STONE_UV);
        }
        // the low parapet that keeps you on it
        stone.add(new THREE.BoxGeometry(0.14, 0.46, steps * tread + 0.2),
          M(lx - 0.48, (h + 0.4) / 2 + 0.2, -d / 2 + 0.34 + (steps - 1) * tread / 2), plaster, 0.03, STONE_UV);
      }
      // a chimney would be a lie on a flat island roof: this is a water butt
      const [bwx, bwz] = l2w(x, z, yaw, w * 0.30, -d * 0.16);
      stone.add(new THREE.CylinderGeometry(0.30, 0.32, 0.9, 10), mat4(bwx, g + h + 1.05, bwz), 0xF2F0E8, 0.04, STONE_UV);
      // the doorway arch this vernacular always squares off in blue
      doors.add(new THREE.PlaneGeometry(1.5, 2.5), M(0, 1.24, df + 0.02), 0x1E2A33);
      doors.add(new THREE.PlaneGeometry(1.14, 2.28), M(0, 1.14, df + 0.055),
        opts.door || vern.shutters[Math.floor(hash01(st.slug + 'dc') * vern.shutters.length)]);
      stone.add(new THREE.BoxGeometry(1.74, 0.22, 0.2), M(0, 2.46, df + 0.02), vern.quoin, 0.04, STONE_UV);
      stone.add(new THREE.BoxGeometry(2.0, 0.16, 0.8), M(0, 0.08, df + 0.24), 0xF0EDE2, 0.05, STONE_UV);
      const nwinF = 1 + (hash01(st.slug + 'w') > 0.4 ? 1 : 0);
      const shutC = vern.shutters[Math.floor(hash01(st.slug + 'sh') * vern.shutters.length)];
      for (let k = 0; k < nwinF; k++) {
        const off = nwinF === 1 ? -0.30 * w : (k - (nwinF - 1) / 2) * (0.62 * w / nwinF);
        if (Math.abs(off) < 1.15) continue;
        const warm = 0.7 + hash01(st.slug + k) * 0.3;
        doors.add(new THREE.PlaneGeometry(0.9, 1.14), M(off, h * 0.58, df + 0.02), 0x241a12);
        windows.add(new THREE.PlaneGeometry(0.62, 0.9), M(off, h * 0.58, df + 0.05), new THREE.Color(warm, 0.62 * warm, 0.22 * warm));
        stone.add(new THREE.BoxGeometry(0.98, 0.1, 0.3), M(off, h * 0.58 - 0.63, df + 0.05), vern.quoin, 0.05, STONE_UV);
        for (const sside of [-1, 1]) {
          wood.add(new THREE.BoxGeometry(0.30, 1.0, 0.05), M(off + sside * 0.52, h * 0.58, df + 0.045), shutC, 0.08);
          for (let sl = 0; sl < 4; sl++) {
            wood.add(new THREE.BoxGeometry(0.26, 0.045, 0.055),
              M(off + sside * 0.52, h * 0.58 - 0.38 + sl * 0.25, df + 0.048),
              new THREE.Color(shutC).offsetHSL(0, 0, -0.06).getHex(), 0.04);
          }
        }
      }
      colliders.push({ x, z, r: Math.max(w, d) * 0.62 + 0.12 });
      return { w, d, h, plaster };
    }

    // gable roof with eaves, fascia, instanced terracotta rows
    const gv = 0.42, ovZ = 0.55;
    const rh = d * 0.36 * (vern.deepEave ? 1.16 : 1);
    const ovZv = ovZ * (vern.deepEave ? 1.9 : 1);
    const pitch = Math.atan2(rh, d / 2 + ovZv);
    const slopeLen = Math.hypot(rh, d / 2 + ovZv) + 0.12;
    for (const sg of [1, -1]) {
      const panel = new THREE.BoxGeometry(w + 2 * gv, 0.09, slopeLen);
      panel.translate(0, -0.1, sg * slopeLen / 2);
      panel.rotateX(sg * pitch);
      panel.translate(0, h + rh, 0);
      walls.add(panel, M(0, 0, 0), vern.roofTint, 0.12, PLASTER_UV);
      wood.add(new THREE.BoxGeometry(w + 2 * gv, 0.17, 0.1), M(0, h - 0.02, sg * (d / 2 + ovZv)), DARKWOOD, 0.15);
    }
    { // gable triangles
      const w2 = w / 2, d2 = d / 2;
      const tri = new THREE.BufferGeometry();
      tri.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        w2, h, d2, w2, h, -d2, w2, h + rh, 0,
        -w2, h, -d2, -w2, h, d2, -w2, h + rh, 0,
      ]), 3));
      tri.computeVertexNormals();
      walls.add(tri, M(0, 0, 0), bodyColor, 0.12, bodyUV);
    }
    const rows = stoneRoof ? 0 : Math.max(4, Math.round(slopeLen / 0.24));
    if (stoneRoof) {
      for (const sg of [1, -1]) {
        const slab = new THREE.BoxGeometry(w + 2 * gv, 0.14, slopeLen);
        slab.translate(0, 0.05, sg * slopeLen / 2);
        slab.rotateX(sg * pitch);
        slab.translate(0, h + rh, 0);
        stone.add(slab, M(0, 0, 0), vern.roofTint, 0.14, STONE_UV);
      }
      stone.add(new THREE.BoxGeometry(w + 2 * gv + 0.1, 0.16, 0.35), M(0, h + rh + 0.06, 0), 0x7E7159, 0.1, STONE_UV);
    }
    for (const sg of [1, -1]) {
      for (let k = 0; k < rows; k++) {
        const dist = (k + 0.45) * (slopeLen / rows);
        const ly = h + rh - dist * Math.sin(pitch) + 0.06;
        const [wx, wz] = l2w(x, z, yaw, 0, sg * dist * Math.cos(pitch));
        tileRows.push({
          x: wx, y: g + ly, z: wz,
          quat: yawPitchQuat(yaw, sg * pitch),
          len: w + 2 * gv,
          tone: hash01(st.slug + 'r' + sg + k) - 0.5 + vern.tileTone, hue: vern.tile,
        });
      }
    }
    if (!stoneRoof) tileRows.push({
      x, y: g + h + rh + 0.10, z,
      quat: yawPitchQuat(yaw, 0), len: w + 2 * gv + 0.1, tone: -0.2 + vern.tileTone, hue: vern.tile, ridge: true,
    });

    // chimney with a pot; it smokes only on real recent care
    if (!opts.noChimney) {
      const cx = -w * 0.30, cz = -d * 0.14;
      walls.add(new THREE.BoxGeometry(0.55, 1.4, 0.55), M(cx, h + rh * 0.6 + 0.5, cz), plaster, 0.1, PLASTER_UV);
      stone.add(new THREE.BoxGeometry(0.72, 0.12, 0.72), M(cx, h + rh * 0.6 + 1.22, cz), QC, 0.1, STONE_UV);
      walls.add(new THREE.CylinderGeometry(0.10, 0.14, 0.4, 6), M(cx, h + rh * 0.6 + 1.46, cz), TERRA, 0.2, PLASTER_UV);
      const [chx, chz] = l2w(x, z, yaw, cx, cz);
      chimneys.push({ x: chx, y: g + h + rh * 0.6 + 1.66, z: chz, smoking: touched30(st.slug) });
    }

    // the door: reveal, leaf, jambs, lintel, threshold
    const doorC = opts.door || 0x4a3320;
    doors.add(new THREE.PlaneGeometry(1.44, 2.42), M(0, 1.2, df + 0.02), 0x201610);
    doors.add(new THREE.PlaneGeometry(1.1, 2.24), M(0, 1.12, df + 0.055), doorC);
    stone.add(new THREE.BoxGeometry(1.66, 0.24, 0.22), M(0, 2.42, df + 0.02), QC, 0.08, STONE_UV);
    stone.add(new THREE.BoxGeometry(0.16, 2.3, 0.2), M(-0.74, 1.15, df + 0.02), QC, 0.08, STONE_UV);
    stone.add(new THREE.BoxGeometry(0.16, 2.3, 0.2), M(0.74, 1.15, df + 0.02), QC, 0.08, STONE_UV);
    stone.add(new THREE.BoxGeometry(1.9, 0.16, 0.7), M(0, 0.08, df + 0.2), vern.base, 0.1, STONE_UV);
    // windows with reveals, sills, lintels, slatted shutters
    const winRows = stories === 2 ? [h * 0.32, h * 0.74] : [h * 0.58];
    const nwin = 1 + (hash01(st.slug + 'w') > 0.45 ? 1 : 0);
    const shutterC = opts.shutter !== undefined ? opts.shutter
      : (st.tax.section === 'TypeScript' ? 0x4C7191
        : vern.shutters[Math.floor(hash01(st.slug + 'sh') * vern.shutters.length)]);
    winRows.forEach((wy, ri) => {
      const count = ri === 1 ? nwin + 1 : nwin;
      for (let k = 0; k < count; k++) {
        const off = count === 1 ? -0.30 * w : (k - (count - 1) / 2) * (0.62 * w / count);
        if (ri === 0 && Math.abs(off) < 1.15) continue; // never through the door
        if (ri === 1 && stories === 2 && Math.abs(off) < 1.0) continue; // the balcony door lives there
        const warm = 0.7 + hash01(st.slug + k + ri) * 0.3;
        doors.add(new THREE.PlaneGeometry(0.9, 1.14), M(off, wy, df + 0.02), 0x241a12);
        windows.add(new THREE.PlaneGeometry(0.62, 0.9), M(off, wy, df + 0.05), new THREE.Color(warm, 0.62 * warm, 0.22 * warm));
        stone.add(new THREE.BoxGeometry(0.98, 0.1, 0.3), M(off, wy - 0.63, df + 0.05), QC, 0.08, STONE_UV);
        stone.add(new THREE.BoxGeometry(0.9, 0.14, 0.2), M(off, wy + 0.64, df + 0.02), QC, 0.08, STONE_UV);
        for (const sside of [-1, 1]) {
          wood.add(new THREE.BoxGeometry(0.30, 1.0, 0.05), M(off + sside * 0.52, wy, df + 0.045), shutterC, 0.12);
          for (let sl = 0; sl < 4; sl++) {
            wood.add(new THREE.BoxGeometry(0.26, 0.045, 0.055),
              M(off + sside * 0.52, wy - 0.38 + sl * 0.25, df + 0.048), new THREE.Color(shutterC).offsetHSL(0, 0, -0.06).getHex(), 0.05);
          }
        }
      }
    });
    // side window for the bigger houses
    if (w > 5.7 && !opts.noSide) {
      const warm = 0.65 + hash01(st.slug + 'sw') * 0.3;
      doors.add(new THREE.PlaneGeometry(0.8, 1.0), M(w / 2 + 0.02, h * 0.5, 0.4, Math.PI / 2), 0x241a12);
      windows.add(new THREE.PlaneGeometry(0.54, 0.76), M(w / 2 + 0.05, h * 0.5, 0.4, Math.PI / 2), new THREE.Color(warm, 0.6 * warm, 0.2 * warm));
    }
    // balcony over the door for two-story houses
    if (stories === 2) {
      stone.add(new THREE.BoxGeometry(2.1, 0.12, 0.85), M(0, h * 0.56, df + 0.42), QC, 0.06, STONE_UV);
      for (let bk = 0; bk < 6; bk++) {
        wood.add(new THREE.CylinderGeometry(0.035, 0.045, 0.62, 5), M(-0.88 + bk * 0.35, h * 0.56 + 0.36, df + 0.72), 0x3c342c, 0.1);
      }
      wood.add(new THREE.BoxGeometry(2.1, 0.06, 0.06), M(0, h * 0.56 + 0.68, df + 0.72), 0x3c342c, 0.1);
      // balcony door
      doors.add(new THREE.PlaneGeometry(0.95, 1.9), M(0, h * 0.56 + 0.95, df + 0.02), 0x241a12);
      doors.add(new THREE.PlaneGeometry(0.8, 1.8), M(0, h * 0.56 + 0.92, df + 0.045), doorC);
    }

    colliders.push({ x, z, r: Math.max(w, d) * 0.62 + 0.12 });
    return { w, d, h, plaster };
  }

  // ----- shared small builders -----
  function porch(st, dims, wide = 2.6) {
    const { x, z, yaw } = st, g = st.y, df = dims.d / 2;
    const P = (lx, ly, lz, ry = 0) => { const [wx, wz] = l2w(x, z, yaw, lx, lz); return mat4(wx, g + ly, wz, yaw + ry); };
    wood.add(new THREE.CylinderGeometry(0.07, 0.09, 2.15, 6), P(-wide / 2, 1.07, df + 1.15), 0x6b4a2e, 0.1);
    wood.add(new THREE.CylinderGeometry(0.07, 0.09, 2.15, 6), P(wide / 2, 1.07, df + 1.15), 0x6b4a2e, 0.1);
    wood.add(new THREE.BoxGeometry(wide + 0.4, 0.1, 0.1), P(0, 2.18, df + 1.15), DARKWOOD, 0.1);
    const porchPitch = 0.42;
    for (let k = 0; k < 5; k++) {
      const dpp = 0.16 + k * 0.26;
      const [wx, wz] = l2w(x, z, yaw, 0, df + 1.3 - dpp * Math.cos(porchPitch));
      tileRows.push({
        x: wx, y: g + 2.28 + dpp * Math.sin(porchPitch), z: wz,
        quat: yawPitchQuat(yaw, porchPitch), len: wide + 0.5, tone: hash01(st.slug + 'porch' + k) - 0.5, hue: vernOf(st).tile,
      });
    }
  }
  function bench(st, lx, lz) {
    const { x, z, yaw } = st, g = st.y;
    const P = (ax, ay, az) => { const [wx, wz] = l2w(x, z, yaw, ax, az); return mat4(wx, g + ay, wz, yaw); };
    wood.add(new THREE.BoxGeometry(1.5, 0.07, 0.4), P(lx, 0.46, lz), 0x7a5c3c, 0.2);
    wood.add(new THREE.BoxGeometry(0.12, 0.44, 0.34), P(lx - 0.6, 0.22, lz), 0x5d4028, 0.1);
    wood.add(new THREE.BoxGeometry(0.12, 0.44, 0.34), P(lx + 0.6, 0.22, lz), 0x5d4028, 0.1);
  }

  function stationSign(st, dims, opts = {}) {
    const prov = st.prov;
    const sub = opts.sub !== undefined ? opts.sub
      : (prov ? `since ${prov.first} · ${prov.commits} ${prov.commits === 1 ? 'commit' : 'commits'}` : '');
    const idx = drawSign(atlas, opts.kind || 'wood', st.page.sidebarLabel || st.page.title, sub);
    const dx = Math.sin(st.yaw), dz = Math.cos(st.yaw);
    const df = dims.d / 2;
    signQuad(signs, idx, st.x + dx * (df + 0.17), st.y + (opts.sy || 2.82), st.z + dz * (df + 0.17), Math.atan2(dx, dz), opts.w || 1.8, opts.h || 0.9);
    const [lwx, lwz] = l2w(st.x, st.z, st.yaw, 1.5, df + 0.34);
    st.lx = lwx; st.lz = lwz; st.ly = st.y + 2.05;
  }

  // endpoint plaques carved with true method and path, wherever the page stands
  function plaqueGrid(st, eps, originLx, originLy, wallDist, perRow = 3) {
    const { x, z, yaw } = st, g = st.y;
    const cols = Math.ceil(eps.length / perRow);
    eps.forEach((ep, i) => {
      const row = i % perRow, col = Math.floor(i / perRow);
      const lx = originLx + (col - (cols - 1) / 2) * 1.06;
      const ly = originLy + (perRow - 1 - row) * 0.55;
      const idx = drawSign(atlas, 'plaque', ep.method, ep.path);
      const [wx, wz] = l2w(x, z, yaw, lx, wallDist);
      const dx = Math.sin(yaw), dz = Math.cos(yaw);
      signQuad(signs, idx, wx, g + ly, wz, Math.atan2(dx, dz), 0.95, 0.48);
    });
    return cols;
  }

  // ----- the seven kinds of standing -----
  function buildHub(st) {
    const dims = house(st, { w: 6.6 + hash01(st.slug) * 0.8, d: 5.2, stories: 2 });
    // arcaded porch across the front
    const { x, z, yaw } = st, g = st.y, df = dims.d / 2;
    const P = (lx, ly, lz, ry = 0) => { const [wx, wz] = l2w(x, z, yaw, lx, lz); return mat4(wx, g + ly, wz, yaw + ry); };
    for (let k = -1; k <= 1; k++) {
      stone.add(new THREE.CylinderGeometry(0.17, 0.21, 2.5, 8), P(k * 2.0, 1.25, df + 1.5), 0xC9BA9B, 0.06, STONE_UV);
      stone.add(new THREE.BoxGeometry(0.5, 0.16, 0.5), P(k * 2.0, 2.56, df + 1.5), QUOIN, 0.05, STONE_UV);
    }
    stone.add(new THREE.BoxGeometry(5.4, 0.3, 0.6), P(0, 2.8, df + 1.5), 0xC9BA9B, 0.06, STONE_UV);
    const porchPitch = 0.38;
    for (let k = 0; k < 6; k++) {
      const dpp = 0.14 + k * 0.28;
      const [wx, wz] = l2w(x, z, yaw, 0, df + 1.68 - dpp * Math.cos(porchPitch));
      tileRows.push({
        x: wx, y: g + 2.95 + dpp * Math.sin(porchPitch), z: wz,
        quat: yawPitchQuat(yaw, porchPitch), len: 5.6, tone: hash01(st.slug + 'hp' + k) - 0.5, hue: vernOf(st).tile,
      });
    }
    // courtyard walls and benches: a place people gather, because in the data they do
    for (const sside of [-1, 1]) {
      const wl = new THREE.BoxGeometry(0.3, 0.7, 3.4);
      stone.add(wl, P(sside * (dims.w / 2 + 0.6), 0.35, df + 2.6), 0x9E8E74, 0.08, STONE_UV);
    }
    bench(st, -dims.w / 2 + 0.9, df + 2.4);
    bench(st, dims.w / 2 - 0.9, df + 2.4);
    stationSign(st, dims, { sub: `${st.inbound} roads meet here · since ${st.prov ? st.prov.first : '?'}` });
    const eps = collectEndpoints(st.page.blocks, []);
    if (eps.length) {
      // a freestanding plaque wall along the courtyard for reference hubs
      const cols = Math.ceil(eps.length / 3);
      const wallW = cols * 1.06 + 0.5;
      const [wx, wz] = l2w(x, z, yaw, 0, df + 4.6);
      stone.add(new THREE.BoxGeometry(wallW, 2.0, 0.3), mat4(wx, g + 0.9, wz, yaw), 0xA89878, 0.06, STONE_UV);
      plaqueGrid(st, eps, 0, 0.62, df + 4.6 - 0.18, 3);
      colliders.push({ x: wx, z: wz, r: wallW * 0.42 });
    }
    return dims;
  }

  function buildWorkshop(st) {
    const dims = house(st, { w: 5.8 + hash01(st.slug) * 0.8, d: 4.4 });
    const { x, z, yaw } = st, g = st.y, df = dims.d / 2;
    const P = (lx, ly, lz, ry = 0) => { const [wx, wz] = l2w(x, z, yaw, lx, lz); return mat4(wx, g + ly, wz, yaw + ry); };
    // awning posts; the cloth itself is instanced and breathes
    wood.add(new THREE.CylinderGeometry(0.06, 0.08, 2.3, 5), P(-dims.w / 2 + 0.5, 1.15, df + 1.7), 0x6b4a2e, 0.15);
    wood.add(new THREE.CylinderGeometry(0.06, 0.08, 2.3, 5), P(dims.w / 2 - 0.5, 1.15, df + 1.7), 0x6b4a2e, 0.15);
    {
      const [ax, az] = l2w(x, z, yaw, 0, df + 0.95);
      awningSpots.push({
        x: ax, y: g + 2.55, z: az, ry: yaw, w: dims.w - 0.6, d: 1.9,
        c: [0xC8B08A, 0xB68B60, 0x9C6B4C, 0xAD9B72][Math.floor(hash01(st.slug + 'aw') * 4)],
      });
    }
    // workbench under the awning
    wood.add(new THREE.BoxGeometry(2.0, 0.09, 0.7), P(-dims.w / 4, 0.85, df + 1.0), 0x7a5c3c, 0.2);
    wood.add(new THREE.BoxGeometry(0.12, 0.82, 0.6), P(-dims.w / 4 - 0.85, 0.41, df + 1.0), 0x5d4028, 0.1);
    wood.add(new THREE.BoxGeometry(0.12, 0.82, 0.6), P(-dims.w / 4 + 0.85, 0.41, df + 1.0), 0x5d4028, 0.1);
    // tool wall: racks and hung shapes beside the door
    wood.add(new THREE.BoxGeometry(1.5, 0.08, 0.1), P(dims.w / 4 + 0.3, 1.9, df + 0.06), DARKWOOD, 0.1);
    for (let k = 0; k < 4; k++) {
      const tl = 0.5 + hash01(st.slug + 'tool' + k) * 0.5;
      wood.add(new THREE.BoxGeometry(0.07, tl, 0.05), P(dims.w / 4 - 0.25 + k * 0.36, 1.9 - tl / 2 - 0.06, df + 0.08), 0x3c342c, 0.2);
    }
    // stone trough
    stone.add(new THREE.BoxGeometry(1.4, 0.5, 0.7), P(dims.w / 2 + 1.1, 0.25, df - 0.4), 0x93876D, 0.08, STONE_UV);
    doors.add(new THREE.PlaneGeometry(1.2, 0.5).rotateX(-Math.PI / 2), P(dims.w / 2 + 1.1, 0.52, df - 0.4), 0x2c3a38);
    stationSign(st, dims);
    return dims;
  }

  function buildGuide(st) {
    const dims = house(st, {});
    porch(st, dims);
    bench(st, -dims.w / 2 - 0.9, dims.d / 2 + 0.6);
    // painted route board, held by two legs
    const { x, z, yaw } = st, g = st.y, df = dims.d / 2;
    const steps = countSteps(st.page.blocks);
    const bIdx = drawSign(atlas, 'board', st.page.sidebarLabel || st.page.title,
      steps > 0 ? `${steps} numbered ${steps === 1 ? 'trail' : 'trails'}` : 'a guided walk');
    const [bx, bz] = l2w(x, z, yaw, dims.w / 2 + 1.3, df + 1.2);
    const bdx = Math.sin(yaw), bdz = Math.cos(yaw);
    signQuad(signs, bIdx, bx, g + 1.35, bz, Math.atan2(bdx, bdz), 1.5, 0.75, wood, 0x5d4028);
    wood.add(new THREE.BoxGeometry(0.08, 1.05, 0.08), mat4(bx - 0.55, g + 0.5, bz, yaw), 0x5d4028, 0.1);
    wood.add(new THREE.BoxGeometry(0.08, 1.05, 0.08), mat4(bx + 0.55, g + 0.5, bz, yaw), 0x5d4028, 0.1);
    // one waymark post per real numbered step list, marching out the door
    const nWay = Math.min(steps, 12);
    for (let k = 0; k < nWay; k++) {
      const [wx2, wz2] = l2w(x, z, yaw, (k % 2 ? 1.1 : -1.1), df + 2.2 + k * 1.15);
      const gy = groundAt(wx2, wz2);
      wood.add(new THREE.BoxGeometry(0.13, 0.95, 0.13), mat4(wx2, gy + 0.45, wz2, yaw + (hash01(st.slug + 'wm' + k) - 0.5) * 0.3), 0x6b4a2e, 0.15);
      wood.add(new THREE.BoxGeometry(0.15, 0.12, 0.15), mat4(wx2, gy + 0.98, wz2, yaw), VIOLET, 0.05);
    }
    stationSign(st, dims);
    return dims;
  }

  function buildStoaBay(st) {
    const { x, z, yaw } = st, g = st.y;
    const eps = collectEndpoints(st.page.blocks, []);
    const cols = Math.max(1, Math.ceil(eps.length / 3));
    const wallW = Math.max(3.6, cols * 1.06 + 0.6);
    const P = (lx, ly, lz, ry = 0, sx2 = 1, sy2 = 1, sz2 = 1) => { const [wx, wz] = l2w(x, z, yaw, lx, lz); return mat4(wx, g + ly, wz, yaw + ry, sx2, sy2, sz2); };
    // platform
    stone.add(new THREE.BoxGeometry(wallW + 0.8, 0.35, 3.4), P(0, 0.12, 0.4), 0x9C8B6D, 0.06, STONE_UV);
    // back wall carrying the plaques
    walls.add(new THREE.BoxGeometry(wallW, 2.75, 0.26), P(0, 1.55, -1.0), vernOf(st).plasters[Math.floor(hash01(st.slug + 'sw') * vernOf(st).plasters.length)], 0.1, PLASTER_UV);
    // columns at the open front
    for (const sside of [-1, 1]) {
      stone.add(new THREE.BoxGeometry(1.0, 0.26, 1.0), P(sside * (wallW / 2 - 0.35), 0.42, 1.55), 0x9C8B6D, 0.06, STONE_UV);
      stone.add(new THREE.CylinderGeometry(0.30, 0.36, 2.5, 9), P(sside * (wallW / 2 - 0.35), 1.75, 1.55), 0xA89675, 0.06, STONE_UV);
      stone.add(new THREE.BoxGeometry(0.85, 0.2, 0.85), P(sside * (wallW / 2 - 0.35), 3.1, 1.55), 0x9C8B6D, 0.06, STONE_UV);
    }
    stone.add(new THREE.BoxGeometry(wallW + 0.6, 0.42, 1.1), P(0, 3.42, 1.55), 0xA89675, 0.06, STONE_UV);
    // pent roof back to front in instanced tiles
    const bayPitch = 0.24;
    for (let k = 0; k < 8; k++) {
      const dpp = 0.2 + k * 0.42;
      const [wx, wz] = l2w(x, z, yaw, 0, -1.2 + dpp * Math.cos(bayPitch));
      tileRows.push({
        x: wx, y: g + 3.9 - dpp * Math.sin(bayPitch), z: wz,
        quat: yawPitchQuat(yaw, -bayPitch), len: wallW + 0.7, tone: hash01(st.slug + 'bay' + k) - 0.5, hue: vernOf(st).tile,
      });
    }
    // the true endpoints, carved
    plaqueGrid(st, eps, 0, 0.75, -0.85, 3);
    const idx = drawSign(atlas, 'stone', st.page.sidebarLabel || st.page.title,
      eps.length ? `${eps.length} carved ${eps.length === 1 ? 'endpoint' : 'endpoints'}` : (st.prov ? `since ${st.prov.first}` : ''));
    const dx = Math.sin(yaw), dz = Math.cos(yaw);
    const [sx3, sz3] = l2w(x, z, yaw, 0, 1.62);
    signQuad(signs, idx, sx3, g + 3.05, sz3, Math.atan2(dx, dz), 1.9, 0.95);
    const [lwx, lwz] = l2w(x, z, yaw, wallW / 2 - 0.35, 1.32);
    st.lx = lwx; st.lz = lwz; st.ly = g + 2.55;
    colliders.push({ x, z, r: wallW * 0.4 });
    if (hash01(st.slug + 'amph') > 0.5) {
      const [ax2, az2] = l2w(x, z, yaw, -wallW / 2 + 0.4, 1.9);
      amphoraSpots.push({ x: ax2, z: az2, s: 0.8 + hash01(st.slug) * 0.4 });
    }
    return { w: wallW, d: 2.8, h: 3.4 };
  }

  function buildCroft(st) {
    const dims = house(st, { w: 3.6, d: 3.0, h: 2.2, noSide: true, stoneBody: true, stoneRoof: true, noChimney: hash01(st.slug + 'ch') > 0.4 });
    const [fx, fz] = l2w(st.x, st.z, st.yaw, 2.6 + hash01(st.slug + 'fig') * 1.5, 1.2);
    figSpots.push({ x: fx, z: fz, s: 0.8 + hash01(st.slug + 'figs') * 0.5 });
    const [lwx, lwz] = l2w(st.x, st.z, st.yaw, 1.1, dims.d / 2 + 0.3);
    st.lx = lwx; st.lz = lwz; st.ly = st.y + 1.9;
    return dims;
  }

  // Upgrade stations: wayside lantern shrines laddering the switchbacks.
  // Small on purpose: sixty of them stand within a few hundred meters.
  function buildWayStation(st) {
    const { x, z, yaw } = st, g = st.y;
    const P = (lx, ly, lz, ry = 0) => { const [wx, wz] = l2w(x, z, yaw, lx, lz); return mat4(wx, g + ly, wz, yaw + ry); };
    const vw = VERN.wall;
    stone.add(new THREE.BoxGeometry(1.9, 1.6, 1.5), P(0, -0.6, 0), 0xB4A98F, 0.1, STONE_UV);
    stone.add(new THREE.BoxGeometry(1.7, 0.24, 1.3), P(0, 0.3, 0), vw.base, 0.08, STONE_UV);
    // the shrine itself is relimed every spring, which is why the whole
    // switchback ladder can be counted from the harbour mouth
    walls.add(new THREE.BoxGeometry(1.4, 1.9, 1.05), P(0, 1.35, 0), vw.plasters[Math.floor(hash01(st.slug + 'wp') * vw.plasters.length)], 0.05, PLASTER_UV);
    // the niche, dark, where the flame lives
    doors.add(new THREE.PlaneGeometry(0.72, 1.0), P(0, 1.45, 0.545), 0x1c140e);
    stone.add(new THREE.BoxGeometry(0.94, 0.14, 0.2), P(0, 2.05, 0.5), vw.quoin, 0.06, STONE_UV);
    // pitched stone cap
    for (const sg of [1, -1]) {
      const cap = new THREE.BoxGeometry(1.6, 0.1, 0.75);
      cap.translate(0, 0, sg * 0.34);
      cap.rotateX(sg * 0.5);
      cap.translate(0, 2.62, 0);
      stone.add(cap, P(0, 0, 0), 0x8F8168, 0.1, STONE_UV);
    }
    const idx = drawSign(atlas, 'stone', st.page.sidebarLabel || st.page.title,
      st.prov ? `${st.prov.commits} ${st.prov.commits === 1 ? 'commit' : 'commits'} · last ${st.prov.last}` : '');
    const dx = Math.sin(yaw), dz = Math.cos(yaw);
    const [sx4, sz4] = l2w(x, z, yaw, 0, 0.56);
    signQuad(signs, idx, sx4, g + 0.78, sz4, Math.atan2(dx, dz), 1.25, 0.62);
    const [lwx, lwz] = l2w(x, z, yaw, 0, 0.42);
    st.lx = lwx; st.lz = lwz; st.ly = g + 1.45;
    colliders.push({ x, z, r: 1.1 });
    return { w: 1.6, d: 1.2, h: 2.6 };
  }

  function buildPlainHouse(st) {
    const fresh = st.tax.section === 'AI';
    const dims = house(st, fresh ? { plaster: 0xF7F1E4 } : (CORNERS.has(st.slug) ? { stoneBody: true } : {}));
    stationSign(st, dims, CORNERS.has(st.slug) ? { kind: 'stone', sub: `first stones ${st.prov.first} · ${st.prov.commits} commits` } : {});
    const eps = collectEndpoints(st.page.blocks, []);
    if (eps.length) {
      // a plaque wall out front, method and path carved true
      const cols = Math.ceil(eps.length / 3);
      const wallW = cols * 1.06 + 0.5;
      const { x, z, yaw } = st, g = st.y, df = dims.d / 2;
      const [wx, wz] = l2w(x, z, yaw, 0, df + 3.4);
      stone.add(new THREE.BoxGeometry(wallW, 2.0, 0.3), mat4(wx, g + 0.9, wz, yaw), 0xA89878, 0.06, STONE_UV);
      plaqueGrid(st, eps, 0, 0.62, df + 3.4 - 0.18, 3);
      colliders.push({ x: wx, z: wz, r: wallW * 0.42 });
    }
    if (fresh) {
      // fresh mortar, scaffolding still up, honestly: first commits 2026
      const { x, z, yaw } = st, g = st.y;
      const P = (lx, ly, lz) => { const [wx, wz] = l2w(x, z, yaw, lx, lz); return mat4(wx, g + ly, wz, yaw); };
      for (const [lx, lz] of [[-dims.w / 2 - 0.5, -1], [-dims.w / 2 - 0.5, 1.4]]) {
        wood.add(new THREE.CylinderGeometry(0.05, 0.05, 3.6, 5), P(lx, 1.8, lz), 0xB59B72, 0.1);
      }
      wood.add(new THREE.BoxGeometry(0.06, 0.06, 2.6), P(-dims.w / 2 - 0.5, 2.2, 0.2), 0xB59B72, 0.1);
      wood.add(new THREE.BoxGeometry(0.5, 0.06, 2.4), P(-dims.w / 2 - 0.45, 1.55, 0.2), 0xC0A87E, 0.15);
    }
    return dims;
  }

  // ----- lay out every district from the taxonomy itself -----
  // A station stands on its own country or it does not stand there. This is
  // tested exactly the way the waterline is tested a few lines down: if the
  // earth under a seat belongs to another province, the seat is passed over
  // and the page takes the next one round the ring. The house is never
  // re-dressed to match the floor it happens to land on; it moves until the
  // floor is its own. Returns the page's own province weight there, or -1
  // when another province holds the ground.
  const ownGround = (prov, x, z) => {
    const w = provinceWeights(x, z);
    const i = PROVINCE_KEYS.indexOf(prov);
    if (i < 0) return 1;
    let bi = 0;
    for (let k2 = 1; k2 < w.length; k2++) if (w[k2] > w[bi]) bi = k2;
    return bi === i ? w[i] : -1;
  };
  // deep enough inside its own country that a walker reads the handover as a
  // handover and not as a house sitting on the fence
  const OWN_MIN = 0.55;
  const zeroIn = (slug) => (inbound[slug] || 0) === 0;
  const crofts = [];
  for (const s of data.sections) {
    const terrId = DISTRICT_OF[s.key];
    const tr = TER[terrId];
    if (!tr) continue;
    const placed = [];
    for (const slug of s.slugs) {
      if (SPECIAL_POS[slug]) {
        const sp = SPECIAL_POS[slug];
        const yaw = sp.yaw !== undefined ? sp.yaw : Math.atan2(tr.x - sp.x, tr.z - sp.z) + Math.PI;
        const st = stationAt(slug, sp.x, sp.z, sp.yaw !== undefined ? sp.yaw : yaw + Math.PI);
        if (st) st.districtKey = s.key;
        continue;
      }
      if (zeroIn(slug) && !LANDMARKS.has(slug)) { crofts.push({ slug, key: s.key }); continue; }
      placed.push(slug);
    }
    if (s.key === 'cms|Upgrades') {
      // switchbacks: stations ladder the cliff road, alternating sides
      const pts = CLIFF_PTS.concat(CLIFF_PTS_EAST);
      const legs = [];
      let L = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        if (i === CLIFF_PTS.length - 1) { legs.push(null); continue; } // the ravine gap: the bridge carries it
        const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
        legs.push(d); L += d;
      }
      placed.forEach((slug, k) => {
        let sdist = (k + 0.5) * (L / placed.length);
        let px = pts[0][0], pz = pts[0][1], dirx = 1, dirz = 0;
        for (let i = 0; i < legs.length; i++) {
          if (legs[i] === null) continue;
          if (sdist <= legs[i]) {
            const t = sdist / legs[i];
            px = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t;
            pz = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
            dirx = (pts[i + 1][0] - pts[i][0]) / legs[i];
            dirz = (pts[i + 1][1] - pts[i][1]) / legs[i];
            break;
          }
          sdist -= legs[i];
        }
        const side = k % 2 ? 1 : -1;
        const ox = -dirz * side * 4.6, oz = dirx * side * 4.6;
        const x = px + ox, z = pz + oz;
        const yaw = Math.atan2(px - x, pz - z); // face the road
        const st = stationAt(slug, x, z, yaw);
        if (st) st.districtKey = s.key;
      });
      cliffRoad.push(...CLIFF_PTS);
    } else if (s.key === 'cms|Content APIs') {
      // stoa rows flanking two lanes, the wellhouse between their backs.
      // Bays are as wide as their carved endpoints demand, so rows are laid
      // out cumulatively and never overlap.
      const rowsZ = [tr.z - 15, tr.z - 5, tr.z + 5, tr.z + 15];
      const facing = [0, Math.PI, 0, Math.PI];
      const widthOf = (slug) => {
        const eps = collectEndpoints(content.pages[slug].blocks, []);
        return Math.max(3.6, Math.ceil(eps.length / 3) * 1.06 + 0.6);
      };
      const quota = 54;
      let row = 0, cursor = 0;
      placed.forEach((slug) => {
        const w2 = widthOf(slug);
        if (cursor + w2 > quota && row < 3) { row++; cursor = 0; }
        const x = tr.x - 26 + cursor + w2 / 2;
        cursor += w2 + 1.1;
        const z = rowsZ[row];
        const st = stationAt(slug, x, z, facing[row]);
        if (st) st.districtKey = s.key;
      });
    } else if (s.key === 'cms|TypeScript') {
      // the blue-shuttered TypeScript row: one straight street of six
      placed.forEach((slug, k) => {
        const x = tr.x - 2, z = tr.z - 12 + k * 5.2;
        const st = stationAt(slug, x, z, Math.PI / 2 + 0.06); // doors face west, down the hill
        if (st) st.districtKey = s.key;
      });
    } else if (terrId.startsWith('cl-')) {
      // an islet is not a hillside: the lanes wrap the rock, tight rings
      // scaled to the island, and nothing is allowed to step into the sea
      const n = placed.length;
      let k = 0;
      const rings = [tr.r * 0.34, tr.r * 0.60, tr.r * 0.78];
      for (let arc = 0; arc < rings.length && k < n; arc++) {
        const r = rings[arc];
        const seats = Math.max(3, Math.floor((2 * Math.PI * r) / 5.6));
        const a0 = hash01(s.key + arc) * 6.28;
        for (let seat = 0; seat < seats && k < n; seat++) {
          const a = a0 + (seat / seats) * Math.PI * 2;
          const x = tr.x + Math.cos(a) * r, z = tr.z + Math.sin(a) * r;
          if (terrainHeight(x, z) < 1.9) continue;
          const yaw = Math.atan2(tr.x - x, tr.z - z) + Math.PI; // doors face the water
          const st = stationAt(placed[k], x, z, yaw);
          if (st) st.districtKey = s.key;
          k++;
        }
      }
      while (k < n) {
        const a = hash01(s.key + k + 'ov') * 6.28;
        const st = stationAt(placed[k], tr.x + Math.cos(a) * tr.r * 0.2, tr.z + Math.sin(a) * tr.r * 0.2, a);
        if (st) st.districtKey = s.key;
        k++;
      }
    } else {
      // concentric street rows: wall to wall like a real hill town,
      // doors opening onto the ring streets, same page same house forever
      const n = placed.length;
      const sprov = PROVINCE_OF_SECTION[s.key];
      const avoid = Object.values(SPECIAL_POS);
      let k = 0;
      const r0 = n > 12 ? 8.5 : 6.0;
      for (let arc = 0; arc < 6 && k < n; arc++) {
        const r = r0 + arc * 11;
        const circ = 2 * Math.PI * r;
        const seatW = 7.4;
        const seats = Math.max(3, Math.floor(circ / seatW));
        const a0 = hash01(s.key + arc) * 6.28;
        for (let seat = 0; seat < seats && k < n; seat++) {
          const a = a0 + (seat / seats) * Math.PI * 2;
          const rr = r + (hash01(s.key + k + 'j') - 0.5) * 1.4;
          const x = tr.x + Math.cos(a) * rr;
          const z = tr.z + Math.sin(a) * rr * 0.94;
          if (avoid.some(sp => Math.hypot(x - sp.x, z - sp.z) < 9)) continue;
          const hgt = terrainHeight(x, z);
          if (hgt < 1.2) continue; // never in the water
          if (ownGround(sprov, x, z) < OWN_MIN) continue; // never in another province
          const yaw = Math.atan2(tr.x - x, tr.z - z) + (hash01(s.key + k + 'y') - 0.5) * 0.10;
          const st = stationAt(placed[k], x, z, yaw);
          if (st) st.districtKey = s.key;
          k++;
        }
      }
      // Anything the rings could not seat walks out of the district in the
      // direction that keeps it deepest in its own country, rather than
      // dropping on a hashed bearing that might land it abroad.
      while (k < n) {
        let best = null;
        const salt = hash01(s.key + k + 'ov') * 6.28;
        for (let rr = r0; rr <= r0 + 70; rr += 2.2) {
          for (let i = 0; i < 56; i++) {
            const a = salt + (i / 56) * Math.PI * 2;
            const x = tr.x + Math.cos(a) * rr, z = tr.z + Math.sin(a) * rr * 0.94;
            if (terrainHeight(x, z) < 1.2) continue;
            if (avoid.some(sp => Math.hypot(x - sp.x, z - sp.z) < 9)) continue;
            if (stations.some(st2 => Math.hypot(x - st2.x, z - st2.z) < 6.4)) continue;
            if (TERRACES.some(t2 => t2 !== tr && Math.hypot(x - t2.x, z - t2.z) < t2.r * 0.75)) continue;
            const w = ownGround(sprov, x, z);
            if (w < 0) continue;
            // nearer home wins ties: the score falls away with the walk out
            const score = w - rr * 0.0022;
            if (!best || score > best.score) best = { x, z, score };
          }
          if (best && best.score > 0.90) break;
        }
        const bx = best ? best.x : tr.x + Math.cos(salt) * (r0 + 55);
        const bz = best ? best.z : tr.z + Math.sin(salt) * (r0 + 55) * 0.94;
        const st = stationAt(placed[k], bx, bz, Math.atan2(tr.x - bx, tr.z - bz));
        if (st) st.districtKey = s.key;
        k++;
      }
    }
  }
  // the fifty crofts, hidden off-trail in the uplands and high maquis
  const croftSeen = {};
  crofts.forEach((c) => {
    const prov = PROVINCE_OF_SECTION[c.key] || 'terraces';
    const fields = CROFT_FIELDS[prov] || CROFT_FIELDS.terraces;
    const n = (croftSeen[prov] = (croftSeen[prov] || 0) + 1) - 1;
    const field = fields[n % fields.length];
    let x = field.x, z = field.z;
    const minH = prov === 'cloud' ? 1.8 : 1.5;
    for (let attempt = 0; attempt < 14; attempt++) {
      const a = hash01(c.slug + 'a' + attempt) * Math.PI * 2;
      const r = (prov === 'cloud' ? 1.5 : 4) + hash01(c.slug + 'r' + attempt) * field.r;
      const tx = field.x + Math.cos(a) * r, tz = field.z + Math.sin(a) * r;
      const h = terrainHeight(tx, tz);
      const clear = prov === 'cloud'
        ? !stations.some(st2 => Math.hypot(tx - st2.x, tz - st2.z) < 6.5)
        : !TERRACES.some(t => Math.hypot(tx - t.x, tz - t.z) < t.r + 4);
      // a croft hides in the back country of its OWN province, and the field
      // is what decides where that is, not the field's name
      if (h > minH && h < 46 && clear && ownGround(prov, tx, tz) >= OWN_MIN) { x = tx; z = tz; break; }
    }
    const st = stationAt(c.slug, x, z, hash01(c.slug + 'yaw') * Math.PI * 2, { special: 'croft' });
    if (st) st.districtKey = c.key;
  });

  // ----- build every station by what it is -----
  for (const st of stations) {
    if (st.slug === '/cms/quick-start') {
      st.yaw = Math.PI * 1.5;
      const prov = st.prov;
      const dims = house(st, { w: 6.4, d: 5.2, h: 3.6, door: VIOLET, plaster: 0xF0E6D4 });
      const hands = prov.authors.length;
      const idx = drawSign(atlas, 'wood', st.page.sidebarLabel || st.page.title, `${prov.commits} renovations by ${hands} hands since ${prov.first}`);
      const dx = Math.sin(st.yaw), dz = Math.cos(st.yaw);
      const df = dims.d / 2;
      signQuad(signs, idx, st.x + dx * (df + 0.18), st.y + 2.95, st.z + dz * (df + 0.18), Math.atan2(dx, dz), 2.3, 1.15);
      porch(st, dims, 2.1);
      const [lwx, lwz] = l2w(st.x, st.z, st.yaw, 1.5, df + 0.34);
      st.lx = lwx; st.lz = lwz; st.ly = st.y + 2.05;
    } else if (st.slug === '/cms/api/document-service') {
      // the wellhouse: eight rooms radiate off the well in the real tree
      const g = st.y;
      stone.add(new THREE.CylinderGeometry(3.1, 3.4, 2.6, 12), mat4(st.x, g + 1.3, st.z), 0x9E8E74, 0.1, STONE_UV);
      stone.add(new THREE.TorusGeometry(3.15, 0.12, 5, 14).rotateX(Math.PI / 2), mat4(st.x, g + 2.62, st.z), 0x8B7C63, 0.08, STONE_UV);
      const cone = new THREE.ConeGeometry(4.0, 2.0, 12);
      walls.add(cone, mat4(st.x, g + 3.7, st.z), TERRA, 0.3, PLASTER_UV);
      for (let k = 0; k < 4; k++) {
        const t = (k + 0.5) / 4;
        const r = 4.0 * (1 - t);
        const segs = Math.max(5, Math.round(r * 4.4));
        for (let s2 = 0; s2 < segs; s2++) {
          const a = (s2 / segs) * Math.PI * 2;
          const q = yawPitchQuat(-a - Math.PI / 2, -Math.atan2(2.0, 4.0));
          tileRows.push({
            x: st.x + Math.cos(a) * r * 0.95, y: g + 2.78 + t * 2.0, z: st.z + Math.sin(a) * r * 0.95,
            quat: q, len: (2 * Math.PI * r) / segs * 1.05, tone: hash01('well' + k + s2) - 0.5,
          });
        }
      }
      const idx = drawSign(atlas, 'stone', st.page.sidebarLabel || st.page.title, `${st.inbound} paths meet at this well · filled ${st.prov.last}`);
      signQuad(signs, idx, st.x, g + 1.9, st.z - 3.55, Math.PI);
      signQuad(signs, idx, st.x, g + 1.9, st.z + 3.55, 0);
      // its own eleven endpoints ring the well
      const eps = collectEndpoints(st.page.blocks, []);
      eps.forEach((ep, i) => {
        const a = (i / eps.length) * Math.PI * 2 + 0.3;
        const px2 = st.x + Math.cos(a) * 3.28, pz2 = st.z + Math.sin(a) * 3.28;
        const pidx = drawSign(atlas, 'plaque', ep.method, ep.path);
        signQuad(signs, pidx, px2, g + 1.35, pz2, Math.atan2(px2 - st.x, pz2 - st.z), 0.85, 0.42);
      });
      st.lx = st.x + 2.2; st.lz = st.z + 2.2; st.ly = g + 2.4;
      colliders.push({ x: st.x, z: st.z, r: 3.8 });
      amphoraSpots.push({ x: st.x + 3.9, z: st.z - 1.2, s: 1.0 }, { x: st.x - 3.6, z: st.z + 2.0, s: 0.85 });
    } else if (st.slug === '/release-notes') {
      const idx = drawSign(atlas, 'stone', st.page.sidebarLabel || st.page.title, `relit ${st.prov.commits} times · last ${st.prov.last}`);
      signQuad(signs, idx, st.x - 0.2, st.y + 2.1, st.z + 0.1, Math.atan2(-1, -1), 2.1, 1.05);
      st.lx = st.x - 1.4; st.lz = st.z - 1.4; st.ly = st.y + 2.6;
    } else if (st.slug === '/cms/cli' || st.slug === '/cloud/cli/cloud-cli') {
      // the two signal masts answer each other across the coast
      const g = st.y;
      const mastH = st.slug === '/cms/cli' ? 12 : 9;
      wood.add(new THREE.CylinderGeometry(0.16, 0.24, mastH, 7), mat4(st.x, g + mastH / 2, st.z), 0x6b4a2e);
      wood.add(new THREE.BoxGeometry(3.2, 0.14, 0.14), mat4(st.x, g + mastH * 0.8, st.z, 0.4), 0x6b4a2e);
      const flag = new THREE.PlaneGeometry(1.5, 0.5, 3, 1);
      flag.translate(0.75, 0, 0);
      wood.add(flag, mat4(st.x + 0.2, g + mastH * 0.86, st.z, 0.4), 0xEFE2C4, 0.1);
      const flag2 = new THREE.PlaneGeometry(1.1, 0.38, 3, 1);
      flag2.translate(0.55, 0, 0);
      wood.add(flag2, mat4(st.x + 0.2, g + mastH * 0.74, st.z, 0.7), 0xD8C7A2, 0.1);
      const idx = drawSign(atlas, 'wood', st.page.sidebarLabel || st.page.title, `since ${st.prov.first} · ${st.prov.commits} commits`);
      signQuad(signs, idx, st.x, g + 1.8, st.z - 0.6, Math.PI, 1.9, 0.95, wood);
      st.lx = st.x + 0.7; st.lz = st.z + 0.7; st.ly = g + 2.6;
      colliders.push({ x: st.x, z: st.z, r: 0.6 });
    } else if (st.slug === '/cms/api/rest/guides/understanding-populate') {
      // the long gallery: one continuous walk under one roofline
      const g = st.y, galW = 36, cols2 = 9;
      for (let k = 0; k < cols2; k++) {
        const cx = st.x - galW / 2 + (k / (cols2 - 1)) * galW;
        const gy = terrainHeight(cx, st.z);
        stone.add(new THREE.BoxGeometry(1.0, 0.26, 1.0), mat4(cx, gy + 0.2, st.z), 0x9C8B6D, 0.06, STONE_UV);
        stone.add(new THREE.CylinderGeometry(0.3, 0.36, 3.2, 9), mat4(cx, gy + 1.9, st.z), 0xA89675, 0.06, STONE_UV);
        stone.add(new THREE.BoxGeometry(0.85, 0.2, 0.85), mat4(cx, gy + 3.6, st.z), 0x9C8B6D, 0.06, STONE_UV);
        if (k > 0) {
          const px2 = cx - galW / (cols2 - 1) / 2;
          const gy2 = terrainHeight(px2, st.z);
          stone.add(new THREE.BoxGeometry(galW / (cols2 - 1) + 0.4, 0.42, 0.9), mat4(px2, gy2 + 3.9, st.z), 0xA89675, 0.06, STONE_UV);
          for (let rr2 = 0; rr2 < 3; rr2++) {
            tileRows.push({
              x: px2, y: gy2 + 4.18 + rr2 * 0.1, z: st.z - 0.5 + rr2 * 0.5,
              quat: yawPitchQuat(Math.PI / 2, 0.18 - rr2 * 0.18), len: galW / (cols2 - 1) + 0.5, tone: hash01('gal' + k + rr2) - 0.5,
            });
          }
        }
        colliders.push({ x: cx, z: st.z, r: 0.55 });
      }
      const words = data.stats.populateWords;
      const idx = drawSign(atlas, 'stone', st.page.sidebarLabel || st.page.title,
        `${words.toLocaleString('en-US')} words under one roofline`);
      signQuad(signs, idx, st.x, g + 2.9, st.z + 0.62, 0, 2.2, 1.1);
      signQuad(signs, idx, st.x, g + 2.9, st.z - 0.62, Math.PI, 2.2, 1.1);
      const eps = collectEndpoints(st.page.blocks, []);
      eps.forEach((ep, i) => {
        const cx = st.x - galW / 2 + ((i + 0.5) / eps.length) * galW;
        const gy = terrainHeight(cx, st.z);
        const pidx = drawSign(atlas, 'plaque', ep.method, ep.path);
        signQuad(signs, pidx, cx, gy + 1.35, st.z + 0.52, 0, 0.85, 0.42);
      });
      st.lx = st.x - galW / 2 + 0.6; st.lz = st.z + 0.7; st.ly = g + 2.4;
    } else if (st.slug === '/cloud/projects/settings') {
      const dims = house(st, { w: 7.2, d: 5.6, h: 4.2, stories: 2, stoneBody: true });
      stationSign(st, dims, { kind: 'stone', sub: `${st.prov.commits} rounds of care across ${st.prov.careDays.toLocaleString('en-US')} days` });
      bench(st, -2.4, dims.d / 2 + 1.0);
    } else if (st.special === 'croft') {
      buildCroft(st);
    } else if (st.type === 'hub') {
      buildHub(st);
    } else if (st.type === 'workshop') {
      buildWorkshop(st);
    } else if (st.type === 'guide') {
      buildGuide(st);
    } else if (st.type === 'stoa') {
      buildStoaBay(st);
    } else if (st.districtKey === 'cms|Upgrades') {
      buildWayStation(st);
    } else {
      buildPlainHouse(st);
    }
  }

  // ----- harbor gate -----
  {
    const gx = -34, gz = 0, g = terrainHeight(gx, gz);
    GATES.push({ x: gx, z: gz, r: 9, name: 'The harbour gate' });
    for (const s2 of [-1, 1]) {
      stone.add(new THREE.BoxGeometry(2.4, 1.0, 2.4), mat4(gx, g + 0.5, gz + s2 * 4.2), 0x93876D, 0.06, STONE_UV);
      stone.add(new THREE.BoxGeometry(1.8, 6.4, 1.8), mat4(gx, g + 3.2, gz + s2 * 4.2), 0x9E8E74, 0.08, STONE_UV);
      stone.add(new THREE.BoxGeometry(2.3, 0.34, 2.3), mat4(gx, g + 5.72, gz + s2 * 4.2), 0x93876D, 0.06, STONE_UV);
    }
    stone.add(new THREE.BoxGeometry(1.6, 1.5, 10.6), mat4(gx, g + 6.6, gz), 0x9E8E74, 0.08, STONE_UV);
    stone.add(new THREE.BoxGeometry(2.0, 0.3, 11.3), mat4(gx, g + 7.5, gz), 0x93876D, 0.06, STONE_UV);
    const capPitch = 0.5;
    for (const s2 of [-1, 1]) {
      for (let k = 0; k < 4; k++) {
        const dpp = 0.12 + k * 0.24;
        tileRows.push({
          x: gx + s2 * dpp * Math.cos(capPitch), y: g + 8.28 - dpp * Math.sin(capPitch), z: gz,
          quat: yawPitchQuat(Math.PI / 2, s2 * capPitch), len: 11.5, tone: hash01('gate' + s2 + k) - 0.5,
        });
      }
    }
    tileRows.push({ x: gx, y: g + 8.34, z: gz, quat: yawPitchQuat(Math.PI / 2, 0), len: 11.6, tone: -0.2, ridge: true });
    const gs = sectionByKey.get('cms|Getting Started');
    const idx = drawSign(atlas, 'stone', gs.name, `${gs.count} pages · the harbor gate`);
    signQuad(signs, idx, gx - 0.95, g + 5.2, gz, -Math.PI / 2, 2.6, 1.3);
    colliders.push({ x: gx, z: gz - 4.2, r: 1.7 }, { x: gx, z: gz + 4.2, r: 1.7 });
  }

  // ----- the province borders, built so a walker feels the handover -----
  // Each border marker stands at a real crossing point of the province field:
  // a spot where a step one way is one province and a step the other way is
  // the next, with room for a gate and a path to it. The gate is made of the
  // two vernaculars it joins, so the handover is already underway in the
  // stone before the ground and the growth finish it.
  const provStats = (() => {
    const out = {};
    for (const k of PROVINCE_KEYS) {
      const secs = PROVINCES[k].sections.map(key => sectionByKey.get(key)).filter(Boolean);
      out[k] = { secs, pages: secs.reduce((a2, b2) => a2 + b2.count, 0) };
    }
    return out;
  })();
  const provLegend = (k) => provStats[k].secs.map(sc => `${sc.name} ${sc.count}`).join(' · ');

  const clearance = (x, z) => {
    let m = 1e9;
    for (const c of colliders) { const d = Math.hypot(x - c.x, z - c.z) - c.r; if (d < m) m = d; }
    return m;
  };

  // find the nearest point to (x0,z0) that is a true border between the two
  // provinces and has room to build on
  function borderSpot(x0, z0, fromKey, toKey) {
    const probes = [[8, 0], [-8, 0], [0, 8], [0, -8], [6, 6], [-6, -6], [6, -6], [-6, 6]];
    for (let r = 0; r <= 44; r += 1.5) {
      const n = r < 0.1 ? 1 : Math.max(10, Math.round(r * 2.4));
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2 + r * 0.41;
        const x = r < 0.1 ? x0 : x0 + Math.cos(ang) * r;
        const z = r < 0.1 ? z0 : z0 + Math.sin(ang) * r;
        if (terrainHeight(x, z) < 2.5) continue;
        if (clearance(x, z) < 6.4) continue;
        let hasA = false, hasB = false, other = false;
        for (const [dx, dz] of probes) {
          const pr = provinceAt(x + dx, z + dz);
          if (pr === fromKey) hasA = true; else if (pr === toKey) hasB = true; else other = true;
        }
        if (!hasA || !hasB || other) continue;
        return { x, z };
      }
    }
    return { x: x0, z: z0 };
  }

  // the direction you actually cross in: up the gradient of the province field
  function crossingAngle(x, z, fromKey, toKey) {
    const fi = PROVINCE_KEYS.indexOf(fromKey), ti = PROVINCE_KEYS.indexOf(toKey);
    const f = (px, pz) => { const w = provinceWeights(px, pz); return w[ti] - w[fi]; };
    const e = 6;
    const gx = f(x + e, z) - f(x - e, z), gz = f(x, z + e) - f(x, z - e);
    return Math.atan2(gx, gz); // yaw whose forward is (sin, cos)
  }

  // the walked approach: a dirt path from the nearest open ground on the road
  // side up to the gate and out the other side, so a border is reachable
  const gatePaths = [];

  // a run of drystone along a border, following the ground, laid in courses
  function drystoneRun(x0, z0, x1, z1, tone) {
    const L = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.max(2, Math.round(L / 0.85));
    const yaw = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const cx = x0 + (x1 - x0) * t, cz = z0 + (z1 - z0) * t;
      if (terrainHeight(cx, cz) < 1.4) continue;
      const g = terrainHeight(cx, cz);
      for (let c = 0; c < 3; c++) {
        const jw = 0.62 + hash01('ds' + i + c + x0) * 0.30;
        const jy = 0.20 + hash01('dy' + i + c + z0) * 0.10;
        stone.add(new THREE.BoxGeometry(0.44 - c * 0.05, jy, jw),
          mat4(cx + (hash01('dj' + i + c) - 0.5) * 0.10, g + 0.11 + c * 0.26, cz, yaw + (hash01('dr' + i + c) - 0.5) * 0.35),
          tone, 0.16, STONE_UV);
      }
      // the coping stone, set on edge the way a waller finishes a run
      stone.add(new THREE.BoxGeometry(0.30, 0.30, 0.52),
        mat4(cx, g + 0.92, cz, yaw + (hash01('dc' + i) - 0.5) * 0.5), tone, 0.14, STONE_UV);
    }
  }

  function provinceStone(x, z, facing, fromKey, toKey, title) {
    const g = terrainHeight(x, z);
    stone.add(new THREE.BoxGeometry(2.4, 0.4, 0.8), mat4(x, g + 0.12, z, facing), 0x8B8068, 0.1, STONE_UV);
    stone.add(new THREE.BoxGeometry(2.2, 1.8, 0.5), mat4(x, g + 0.9, z, facing), 0x94886F, 0.1, STONE_UV);
    const front = drawSign(atlas, 'stone', title, `${PROVINCES[toKey].name} · ${provStats[toKey].pages} pages · ${provLegend(toKey)}`);
    signQuad(signs, front, x + Math.sin(facing) * 0.28, g + 1.05, z + Math.cos(facing) * 0.28, facing, 2.1, 1.05);
    const back = drawSign(atlas, 'stone', 'Back the way you came', `${PROVINCES[fromKey].name} · ${provStats[fromKey].pages} pages · ${provLegend(fromKey)}`);
    signQuad(signs, back, x - Math.sin(facing) * 0.28, g + 1.05, z - Math.cos(facing) * 0.28, facing + Math.PI, 2.1, 1.05);
    colliders.push({ x, z, r: 1.1 });
  }

  // 1. The Terrace Gate. Harbour lime on the seaward face, terrace red on
  //    the inland one, and the first drystone of the olive country.
  {
    const sp = borderSpot(26.8, 16.5, 'harbor', 'terraces');
    const gx = sp.x, gz = sp.z, g = terrainHeight(gx, gz);
    const ang = crossingAngle(gx, gz, 'harbor', 'terraces'); // through the gate
    const perp = ang + Math.PI / 2;                          // across it
    GATES.push({ x: gx, z: gz, r: 13, ang, from: 'harbor', to: 'terraces', name: 'The Terrace Gate' });
    gatePaths.push([[gx - Math.sin(ang) * 20, gz - Math.cos(ang) * 20], [gx, gz], [gx + Math.sin(ang) * 20, gz + Math.cos(ang) * 20]]);
    for (const sd of [-1, 1]) {
      const px = gx + Math.sin(perp) * sd * 4.0, pz = gz + Math.cos(perp) * sd * 4.0;
      const pg = terrainHeight(px, pz);
      stone.add(new THREE.BoxGeometry(1.7, 0.9, 1.7), mat4(px, pg + 0.45, pz, ang), 0x9E8E74, 0.08, STONE_UV);
      // seaward face limed like the harbour, inland face washed with the red
      walls.add(new THREE.BoxGeometry(1.25, 4.3, 1.25), mat4(px, pg + 3.05, pz, ang), 0xEDE0CC, 0.08, PLASTER_UV);
      walls.add(new THREE.BoxGeometry(1.32, 4.3, 0.10), mat4(px + Math.sin(ang) * 0.64, pg + 3.05, pz + Math.cos(ang) * 0.64, ang), 0xD6AC7A, 0.08, PLASTER_UV);
      stone.add(new THREE.BoxGeometry(1.6, 0.26, 1.6), mat4(px, pg + 5.3, pz, ang), 0xD8C39F, 0.06, STONE_UV);
      colliders.push({ x: px, z: pz, r: 1.2 });
    }
    walls.add(new THREE.BoxGeometry(1.1, 0.85, 8.6), mat4(gx, g + 5.85, gz, perp), 0xE0BE96, 0.07, PLASTER_UV);
    for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) {
      const dpp = 0.16 + k * 0.26;
      tileRows.push({
        x: gx + Math.sin(ang) * sd * dpp, y: g + 6.44 - dpp * 0.48, z: gz + Math.cos(ang) * sd * dpp,
        quat: yawPitchQuat(perp, sd * 0.5), len: 9.0, tone: hash01('tg' + sd + k) - 0.5 + 0.16,
      });
    }
    // drystone off both shoulders: the field boundary the gate is set into
    drystoneRun(gx + Math.sin(perp) * 5.0, gz + Math.cos(perp) * 5.0, gx + Math.sin(perp) * 22, gz + Math.cos(perp) * 22, 0xB2A183);
    drystoneRun(gx - Math.sin(perp) * 5.0, gz - Math.cos(perp) * 5.0, gx - Math.sin(perp) * 20, gz - Math.cos(perp) * 20, 0xB2A183);
    provinceStone(gx + Math.sin(perp) * 6.4 + Math.sin(ang) * 2.2, gz + Math.cos(perp) * 6.4 + Math.cos(ang) * 2.2, ang + Math.PI, 'harbor', 'terraces', 'The Terrace Gate');
  }

  // 2. The Forest Gate. Two pine trunks and a beam, no plaster at all: up
  //    here you build with what the forest gives you.
  {
    const sp = borderSpot(116.0, 7.3, 'terraces', 'highland');
    const gx = sp.x, gz = sp.z, g = terrainHeight(gx, gz);
    const ang = crossingAngle(gx, gz, 'terraces', 'highland');
    const perp = ang + Math.PI / 2;
    GATES.push({ x: gx, z: gz, r: 12, ang, from: 'terraces', to: 'highland', name: 'The Forest Gate' });
    gatePaths.push([[gx - Math.sin(ang) * 22, gz - Math.cos(ang) * 22], [gx, gz], [gx + Math.sin(ang) * 22, gz + Math.cos(ang) * 22]]);
    for (const sd of [-1, 1]) {
      const px = gx + Math.sin(perp) * sd * 3.6, pz = gz + Math.cos(perp) * sd * 3.6;
      const pg = terrainHeight(px, pz);
      stone.add(new THREE.BoxGeometry(1.2, 0.7, 1.2), mat4(px, pg + 0.35, pz, ang), 0x877F72, 0.1, STONE_UV);
      wood.add(new THREE.CylinderGeometry(0.26, 0.34, 5.0, 8), mat4(px, pg + 3.1, pz), 0x53412C, 0.14);
      wood.add(new THREE.BoxGeometry(0.9, 0.2, 0.9), mat4(px, pg + 5.7, pz, 0.3), 0x4A3A28, 0.1);
      colliders.push({ x: px, z: pz, r: 0.9 });
    }
    wood.add(new THREE.BoxGeometry(0.34, 0.44, 8.0), mat4(gx, g + 5.5, gz, perp), 0x53412C, 0.12);
    wood.add(new THREE.BoxGeometry(0.22, 0.22, 8.4), mat4(gx, g + 5.95, gz, perp), 0x3F3120, 0.12);
    // a rail fence off each shoulder instead of drystone: the highland fences
    for (const sd of [-1, 1]) {
      let prev = null;
      for (let k = 1; k <= 7; k++) {
        const px = gx + Math.sin(perp) * sd * (3.6 + k * 2.4), pz = gz + Math.cos(perp) * sd * (3.6 + k * 2.4);
        const pg = terrainHeight(px, pz);
        if (pg < 1.6) break;
        wood.add(new THREE.CylinderGeometry(0.09, 0.12, 1.5, 5), mat4(px, pg + 0.75, pz), 0x4A3A28, 0.16);
        /* (2026-09-07, owner: "je ne dois pas pouvoir passer a travers... une
           cloture") These fences were drawn and never registered, so a walker
           went straight through the highland gates' shoulders. A post is one
           circle and each span another at its middle: centres 1.2 apart with a
           radius of 0.7, which overlaps, so there is no gap to slip through.
           The gate itself is untouched - the run starts 3.6 clear of it. */
        colliders.push({ x: px, z: pz, r: 0.7, h: 1.05 });   /* vaultable: the top rail */
        if (prev) {
          const mx = (px + prev[0]) / 2, mz = (pz + prev[1]) / 2, mg = (pg + prev[2]) / 2;
          colliders.push({ x: mx, z: mz, r: 0.7, h: 1.05 });
          for (const hy of [0.55, 1.05]) {
            wood.add(new THREE.BoxGeometry(0.08, 0.10, 2.45), mat4(mx, mg + hy, mz, perp), 0x5A472F, 0.14);
          }
        }
        prev = [px, pz, pg];
      }
    }
    provinceStone(gx + Math.sin(perp) * 5.9 + Math.sin(ang) * 2.0, gz + Math.cos(perp) * 5.9 + Math.cos(ang) * 2.0, ang + Math.PI, 'terraces', 'highland', 'The Forest Gate');
  }

  // 3. The Wall foot. No gate: the pines stop dead and the road is cut into
  //    bare limestone, with the first relimed pillar of the sixty-four.
  {
    const sp = borderSpot(148.8, 0.3, 'highland', 'wall');
    const gx = sp.x, gz = sp.z, g = terrainHeight(gx, gz);
    const ang = crossingAngle(gx, gz, 'highland', 'wall');
    const perp = ang + Math.PI / 2;
    GATES.push({ x: gx, z: gz, r: 12, ang, from: 'highland', to: 'wall', name: 'The Wall foot' });
    gatePaths.push([[gx - Math.sin(ang) * 22, gz - Math.cos(ang) * 22], [gx, gz], [gx + Math.sin(ang) * 22, gz + Math.cos(ang) * 22]]);
    for (const sd of [-1, 1]) {
      // the cut face: coursed limestone standing where the soil ends
      for (let k = 0; k < 5; k++) {
        const px = gx + Math.sin(perp) * sd * (3.4 + k * 1.5), pz = gz + Math.cos(perp) * sd * (3.4 + k * 1.5);
        const pg = terrainHeight(px, pz);
        if (pg < 1.6) break;
        const hgt = 1.5 + k * 0.45;
        stone.add(new THREE.BoxGeometry(1.35, hgt, 1.6), mat4(px, pg + hgt / 2 - 0.4, pz, ang + (hash01('wf' + sd + k) - 0.5) * 0.3), 0xC8BEA2, 0.13, STONE_UV);
      }
    }
    const mx = gx + Math.sin(perp) * 3.0, mz = gz + Math.cos(perp) * 3.0, mg = terrainHeight(mx, mz);
    stone.add(new THREE.BoxGeometry(1.1, 0.5, 1.1), mat4(mx, mg + 0.25, mz, ang), 0xB4A98F, 0.08, STONE_UV);
    walls.add(new THREE.BoxGeometry(0.85, 2.6, 0.85), mat4(mx, mg + 1.75, mz, ang), 0xF2EEE2, 0.05, PLASTER_UV);
    stone.add(new THREE.BoxGeometry(1.1, 0.22, 1.1), mat4(mx, mg + 3.15, mz, ang), 0xF0EADC, 0.05, STONE_UV);
    provinceStone(gx - Math.sin(perp) * 4.4 + Math.sin(ang) * 2.0, gz - Math.cos(perp) * 4.4 + Math.cos(ang) * 2.0, ang + Math.PI, 'highland', 'wall', 'The Wall foot');
  }

  // 4. The Light's Cape. Where the Wall's last way-station gives out and the
  //    cape the harbour's light stands on begins. The Golden Shore is the
  //    harbour's light, kept by the harbour, so the ground it turns over is
  //    the Harbour Town's and the release notes read at its door stand on
  //    their own earth. No gate here either: a cape has no doorway. It is
  //    marked the way a coast marks a headland, with limewashed pillars a
  //    boat can pick out, and the stone that says which country you are in.
  {
    const sp = borderSpot(226.0, -62.0, 'wall', 'harbor');
    const gx = sp.x, gz = sp.z;
    const ang = crossingAngle(gx, gz, 'wall', 'harbor');
    const perp = ang + Math.PI / 2;
    GATES.push({ x: gx, z: gz, r: 10, ang, from: 'wall', to: 'harbor', name: "The Light's Cape" });
    gatePaths.push([[gx - Math.sin(ang) * 20, gz - Math.cos(ang) * 20], [gx, gz], [gx + Math.sin(ang) * 20, gz + Math.cos(ang) * 20]]);
    for (const sd of [-1, 1]) {
      const px = gx + Math.sin(perp) * sd * 3.2, pz = gz + Math.cos(perp) * sd * 3.2;
      const pg = terrainHeight(px, pz);
      stone.add(new THREE.BoxGeometry(1.15, 0.44, 1.15), mat4(px, pg + 0.22, pz, ang), 0xB4A98F, 0.10, STONE_UV);
      walls.add(new THREE.CylinderGeometry(0.40, 0.50, 2.1, 10), mat4(px, pg + 1.42, pz, ang), 0xF2EEE2, 0.05, PLASTER_UV);
      stone.add(new THREE.SphereGeometry(0.42, 10, 8), mat4(px, pg + 2.56, pz, ang), 0xE8DCC4, 0.06, STONE_UV);
      colliders.push({ x: px, z: pz, r: 0.7 });
    }
    provinceStone(gx - Math.sin(perp) * 4.6 + Math.sin(ang) * 2.0, gz - Math.cos(perp) * 4.6 + Math.cos(ang) * 2.0, ang + Math.PI, 'wall', 'harbor', "The Light's Cape");
  }

  // ----- boundary stones for every district -----
  for (const [key, terrId] of Object.entries(DISTRICT_OF)) {
    if (key === 'cms|Getting Started') continue;
    const s2 = sectionByKey.get(key);
    const tr = TER[terrId];
    if (!s2 || !tr) continue;
    const toward = Math.atan2(-tr.x, -tr.z);
    const bx = tr.x + Math.sin(toward) * tr.r * 0.86, bz = tr.z + Math.cos(toward) * tr.r * 0.86;
    const g = terrainHeight(bx, bz);
    stone.add(new THREE.BoxGeometry(2.5, 0.4, 0.8), mat4(bx, g + 0.12, bz, toward + Math.PI), 0x8B8068, 0.1, STONE_UV);
    stone.add(new THREE.BoxGeometry(2.3, 1.7, 0.5), mat4(bx, g + 0.85, bz, toward + Math.PI), 0x94886F, 0.1, STONE_UV);
    const idx = drawSign(atlas, 'stone', s2.name, `${s2.count} ${s2.count === 1 ? 'page' : 'pages'}`);
    signQuad(signs, idx, bx + Math.sin(toward + Math.PI) * 0.28, g + 1.05, bz + Math.cos(toward + Math.PI) * 0.28, toward + Math.PI, 2.1, 1.05);
  }

  // ----- drystone field walls: the terraces are a walled country -----
  // Every olive terrace on a real coast is held up and divided by dry wall.
  // These runs follow the contour, keep out of doorways and roads, and stop
  // dead at the province edge, so from the Forest Gate you can see where the
  // walled country ends and the forest begins.
  {
    const seeds = [
      [40, 46], [64, 48], [88, 42], [70, 12], [92, 8], [58, -12], [74, -54],
      [98, -56], [110, 40], [122, 30], [46, 18], [104, -12],
    ];
    for (let i = 0; i < seeds.length; i++) {
      const [sx, sz] = seeds[i];
      if (provinceAt(sx, sz) !== 'terraces') continue;
      const a0 = hash01('dsw' + i) * Math.PI * 2;
      let x = sx, z = sz;
      for (let seg = 0; seg < 4; seg++) {
        const a = a0 + (hash01('dsa' + i + seg) - 0.5) * 1.1;
        const L = 9 + hash01('dsl' + i + seg) * 9;
        const nx = x + Math.sin(a) * L, nz = z + Math.cos(a) * L;
        const mx = (x + nx) / 2, mz = (z + nz) / 2;
        const ok = terrainHeight(mx, mz) > 2
          && provinceAt(mx, mz) === 'terraces'
          && !colliders.some(c => Math.hypot(mx - c.x, mz - c.z) < c.r + 3.5)
          && !GATES.some(g2 => Math.hypot(mx - g2.x, mz - g2.z) < g2.r);
        if (ok) drystoneRun(x, z, nx, nz, 0xB2A183);
        x = nx; z = nz;
      }
    }
  }

  // ----- the pier: planks, warp, nail heads, posts and caps -----
  {
    const y = PIER.deck;
    for (let px = PIER.x0; px < PIER.x1; px += 0.62) {
      const j = hash01('pk' + px.toFixed(2));
      wood.add(new THREE.BoxGeometry(0.55, 0.11, 6.4),
        mat4(px + 0.28, y - 0.01 + (j - 0.5) * 0.02, 0, (j - 0.5) * 0.014),
        0xC2A87F, 0.3);
    }
    // nail heads: two per plank each side, instanced dark iron
    {
      const nailGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.02, 5);
      const nails = [];
      for (let px = PIER.x0; px < PIER.x1; px += 0.62) {
        const j = hash01('pk' + px.toFixed(2));
        for (const nz of [-2.88, 2.88]) nails.push([px + 0.28, y + 0.045 + (j - 0.5) * 0.02, nz]);
      }
      const nailMesh = new THREE.InstancedMesh(nailGeo, new THREE.MeshStandardMaterial({ color: 0x2e2a24, roughness: 0.5, metalness: 0.5 }), nails.length);
      const nm = new THREE.Matrix4();
      nails.forEach(([nx, ny, nz], i) => { nm.setPosition(nx, ny, nz); nailMesh.setMatrixAt(i, nm); });
      scene.add(nailMesh);
    }
    wood.add(new THREE.BoxGeometry(PIER.x1 - PIER.x0, 0.2, 0.24), mat4((PIER.x0 + PIER.x1) / 2, y - 0.14, -3.15), 0x5d4028, 0.1);
    wood.add(new THREE.BoxGeometry(PIER.x1 - PIER.x0, 0.2, 0.24), mat4((PIER.x0 + PIER.x1) / 2, y - 0.14, 3.15), 0x5d4028, 0.1);
    for (let px = PIER.x0 + 2; px < PIER.x1; px += 8) {
      wood.add(new THREE.CylinderGeometry(0.17, 0.2, 4.4, 6), mat4(px, y - 1.6, -3.1), 0x5d4028, 0.15);
      wood.add(new THREE.CylinderGeometry(0.17, 0.2, 4.4, 6), mat4(px, y - 1.6, 3.1), 0x5d4028, 0.15);
      wood.add(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 6), mat4(px, y + 0.62, -3.1), 0x4c3320, 0.1);
      wood.add(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 6), mat4(px, y + 0.62, 3.1), 0x4c3320, 0.1);
    }
  }

  // ----- the Crossing -----
  {
    const segs = 12;
    for (let i = 0; i < segs; i++) {
      const t0 = i / segs, t1 = (i + 1) / segs;
      const x0 = BRIDGE.x0 + t0 * (BRIDGE.x1 - BRIDGE.x0), x1 = BRIDGE.x0 + t1 * (BRIDGE.x1 - BRIDGE.x0);
      const xm = (x0 + x1) / 2, ym = (bridgeDeckAt(x0) + bridgeDeckAt(x1)) / 2;
      const ang = Math.atan2(bridgeDeckAt(x1) - bridgeDeckAt(x0), x1 - x0);
      const seg = new THREE.BoxGeometry(x1 - x0 + 0.12, 0.5, 6.4);
      seg.rotateZ(ang);
      stone.add(seg, mat4(xm, ym - 0.26, (BRIDGE.z0 + BRIDGE.z1) / 2), 0x968A76, 0.06, STONE_UV);
      const par0 = new THREE.BoxGeometry(x1 - x0 + 0.12, 1.0, 0.42); par0.rotateZ(ang);
      stone.add(par0, mat4(xm, ym + 0.45, BRIDGE.z0 + 0.2), 0x8E8270, 0.06, STONE_UV);
      const par1 = new THREE.BoxGeometry(x1 - x0 + 0.12, 1.0, 0.42); par1.rotateZ(ang);
      stone.add(par1, mat4(xm, ym + 0.45, BRIDGE.z1 - 0.2), 0x8E8270, 0.06, STONE_UV);
      const cop = new THREE.BoxGeometry((x1 - x0) * 0.86, 0.14, 0.55); cop.rotateZ(ang);
      stone.add(cop, mat4(xm, ym + 1.0, BRIDGE.z0 + 0.2), 0xA79A80, 0.1, STONE_UV);
      const cop2 = new THREE.BoxGeometry((x1 - x0) * 0.86, 0.14, 0.55); cop2.rotateZ(ang);
      stone.add(cop2, mat4(xm, ym + 1.0, BRIDGE.z1 - 0.2), 0xA79A80, 0.1, STONE_UV);
    }
    stone.add(new THREE.BoxGeometry(2.2, 9, 7.2), mat4(191, BRIDGE.deck - 4.6, -28), 0x8E8270, 0.05, STONE_UV);
    stone.add(new THREE.BoxGeometry(2.2, 9, 7.2), mat4(201, BRIDGE.deck - 4.6, -28), 0x8E8270, 0.05, STONE_UV);
    stone.add(new THREE.BoxGeometry(1.7, 8.2, 1.7), mat4(191, BRIDGE.deck - 5.1, -32.1, Math.PI / 4), 0x877B67, 0.05, STONE_UV);
    stone.add(new THREE.BoxGeometry(1.7, 8.2, 1.7), mat4(201, BRIDGE.deck - 5.1, -23.9, Math.PI / 4), 0x877B67, 0.05, STONE_UV);
    const bc = '/cms/migration/v4-to-v5/breaking-changes';
    const arrive = inbound[bc] || 0, leave = data.outbound[bc] || 0;
    const idx = drawSign(atlas, 'stone', 'The Crossing', `${arrive} roads arrive · ${leave} leave · re-mortared ${provenance[bc].last}`);
    signQuad(signs, idx, BRIDGE.x0 - 0.8, bridgeDeckAt(BRIDGE.x0) + 1.55, BRIDGE.z1 - 0.2, -Math.PI / 2, 2.2, 1.1, wood);
  }

  // ----- the causeway stairs: twenty-nine, because twenty-nine roads cross -----
  // They no longer climb to a quarter of the town. They go down to the water,
  // and the causeway carries on from their foot.
  {
    const steps = stats.crossEdges; // 29 in the shipped graph, asserted by the walk
    const x0 = -20, z0 = 30, z1 = 42, h0 = terrainHeight(x0, z0), h1 = terrainHeight(-24, z1);
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const z = z0 + t * (z1 - z0), h = h0 + t * (h1 - h0);
      stone.add(new THREE.BoxGeometry(4.6, 0.24, (z1 - z0) / steps + 0.22), mat4(x0, h + 0.06, z), 0x9E8E74, 0.08, STONE_UV);
    }
    stone.add(new THREE.BoxGeometry(0.5, 0.9, z1 - z0 + 1), mat4(x0 - 2.5, (h0 + h1) / 2 + 0.4, (z0 + z1) / 2), 0x93876D, 0.07, STONE_UV);
    stone.add(new THREE.BoxGeometry(0.5, 0.9, z1 - z0 + 1), mat4(x0 + 2.5, (h0 + h1) / 2 + 0.4, (z0 + z1) / 2), 0x93876D, 0.07, STONE_UV);
    const idx = drawSign(atlas, 'stone', 'To the Cloud Archipelago', `${stats.crossEdges} stairs · one for each crossing road`);
    signQuad(signs, idx, x0 + 2.6, h0 + 1.5, z0 + 1, Math.PI / 2, 2.0, 1.0, wood);
  }

  // ----- the causeway: the border you cross on foot -----
  // Laid stone over the shelf, a kerb on each side, and the sea a hand's
  // width below it. The harbour hands you to the archipelago at walking pace.
  {
    for (const cw of CAUSEWAYS) {
      for (let i = 0; i < cw.pts.length - 1; i++) {
        const [ax, az] = cw.pts[i], [bx2, bz2] = cw.pts[i + 1];
        const L = Math.hypot(bx2 - ax, bz2 - az);
        const yaw = Math.atan2(bx2 - ax, bz2 - az);
        const n = Math.max(2, Math.round(L / 2.2));
        for (let k = 0; k < n; k++) {
          const t = (k + 0.5) / n;
          const cxp = ax + (bx2 - ax) * t, czp = az + (bz2 - az) * t;
          const wob = (hash01('cw' + i + k + cw.w) - 0.5) * 0.10;
          stone.add(new THREE.BoxGeometry(cw.w, 0.9, L / n + 0.12),
            mat4(cxp, cw.deck - 0.45 + wob, czp, yaw), 0x9A8E72, 0.10, STONE_UV);
          // the kerb, laid a little proud, the piece a wave actually hits
          for (const sd of [-1, 1]) {
            stone.add(new THREE.BoxGeometry(0.30, 0.26, L / n + 0.10),
              mat4(cxp + Math.cos(yaw) * sd * (cw.w / 2 - 0.13), cw.deck + 0.12 + wob, czp - Math.sin(yaw) * sd * (cw.w / 2 - 0.13), yaw),
              0xB0A688, 0.12, STONE_UV);
          }
        }
      }
    }
    // the marker at the head, carrying the true count of crossing roads
    const hx = -30, hz = 42, hg = groundAt(hx, hz);
    GATES.push({ x: hx, z: hz, r: 9, name: 'The causeway head' });
    // the crossing itself is out on the stones, where the harbour ends
    GATES.push({ x: -41.5, z: 49.7, r: 5, ang: Math.atan2(-78 - (-30), 72 - 42), from: 'harbor', to: 'cloud', name: 'The Causeway' });
    for (const sd of [-1, 1]) {
      stone.add(new THREE.BoxGeometry(0.9, 2.4, 0.9), mat4(hx, hg + 1.2, hz + sd * 2.6, 0.5), 0xA79878, 0.08, STONE_UV);
      stone.add(new THREE.BoxGeometry(1.15, 0.2, 1.15), mat4(hx, hg + 2.42, hz + sd * 2.6, 0.5), 0xC0B69A, 0.06, STONE_UV);
    }
    const cSec = data.sections.filter(sc => sc.product === 'cloud');
    const cCount = cSec.reduce((a, b) => a + b.count, 0);
    const ci = drawSign(atlas, 'stone', PROVINCES.cloud.name,
      `${cCount} pages · ${cSec.length} official sections · ${stats.crossEdges} roads cross the water`);
    signQuad(signs, ci, hx - 0.6, hg + 1.9, hz, -Math.PI / 2, 2.4, 1.2);
    colliders.push({ x: hx, z: hz - 2.6, r: 0.8 }, { x: hx, z: hz + 2.6, r: 0.8 });
  }

  // ----- the Golden Shore -----
  const beam = buildLighthouse(stone, walls, wood, scene);

  // ----- laundry lines: violet thread, breathing cloth -----
  {
    const dressDistricts = ['cms|Getting Started', 'cms|Features'];
    const cands = stations.filter(st => dressDistricts.includes(st.districtKey) && !st.special && st.type !== 'landmark');
    let lines = 0;
    for (let i = 0; i < cands.length && lines < 9; i++) {
      for (let j = i + 1; j < cands.length && lines < 9; j++) {
        const A = cands[i], B = cands[j];
        const d = Math.hypot(A.x - B.x, A.z - B.z);
        if (d < 8 || d > 15) continue;
        if (hash01(A.slug + B.slug) < 0.5) continue;
        lines++;
        const y0 = Math.max(A.y, B.y) + 2.9;
        const segs2 = 6;
        for (let k2 = 0; k2 < segs2; k2++) {
          const t0 = k2 / segs2, t1 = (k2 + 1) / segs2;
          const sag = (t) => Math.sin(t * Math.PI) * -0.5;
          const ax = A.x + (B.x - A.x) * t0, az = A.z + (B.z - A.z) * t0, ay = y0 + sag(t0);
          const bx2 = A.x + (B.x - A.x) * t1, bz2 = A.z + (B.z - A.z) * t1, by2 = y0 + sag(t1);
          const mx = (ax + bx2) / 2, mz = (az + bz2) / 2, my = (ay + by2) / 2;
          const len = Math.hypot(bx2 - ax, by2 - ay, bz2 - az);
          const yawL = Math.atan2(bx2 - ax, bz2 - az);
          const pitchL = Math.atan2(by2 - ay, Math.hypot(bx2 - ax, bz2 - az));
          const geo = new THREE.BoxGeometry(0.025, 0.025, len + 0.05);
          const m = new THREE.Matrix4().compose(
            new THREE.Vector3(mx, my, mz),
            yawPitchQuat(yawL, -pitchL),
            new THREE.Vector3(1, 1, 1));
          // hemp rope; the violet lives only in the tie-off thread at each post
          wood.add(geo, m, (k2 === 0 || k2 === segs2 - 1) ? VIOLET : 0xB8A182, 0.05);
        }
        const pieces = 3 + Math.floor(hash01(A.slug + 'lp') * 3);
        for (let k2 = 0; k2 < pieces; k2++) {
          const t = (k2 + 0.7) / (pieces + 0.7);
          laundry.push({
            x: A.x + (B.x - A.x) * t, y: y0 + Math.sin(t * Math.PI) * -0.5, z: A.z + (B.z - A.z) * t,
            ry: Math.atan2(B.x - A.x, B.z - A.z) + Math.PI / 2,
            s: 0.8 + hash01(A.slug + 'ls' + k2) * 0.5,
            c: [0xF2EAD8, 0xE8DCC4, 0xD9CBB2, 0xC7D2D8, 0xEFE4E0][Math.floor(hash01(A.slug + 'lc' + k2) * 5)],
          });
        }
      }
    }
  }

  // ----- cafe tables on the market terrace -----
  {
    const tr = TER.features;
    const spots = [[-4, -7], [-1, -9.5], [3, -8], [6, -5.5], [1, -5], [-6, -4]];
    for (const [ox, oz] of spots) {
      const cx = tr.x + ox, cz = tr.z + oz;
      if (colliders.some(c => Math.hypot(cx - c.x, cz - c.z) < c.r + 0.8)) continue;
      const g = terrainHeight(cx, cz);
      wood.add(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 10), mat4(cx, g + 0.78, cz), 0x8a6a48, 0.15);
      wood.add(new THREE.CylinderGeometry(0.05, 0.07, 0.78, 6), mat4(cx, g + 0.39, cz), 0x4c3320, 0.1);
      for (const a of [0.7, 2.8]) {
        wood.add(new THREE.CylinderGeometry(0.22, 0.24, 0.06, 8), mat4(cx + Math.cos(a) * 0.85, g + 0.48, cz + Math.sin(a) * 0.85), 0x7a5c3c, 0.2);
        wood.add(new THREE.CylinderGeometry(0.04, 0.05, 0.48, 5), mat4(cx + Math.cos(a) * 0.85, g + 0.24, cz + Math.sin(a) * 0.85), 0x4c3320, 0.1);
      }
    }
  }

  // ----- beehives in new wood beside the fresh-mortared AI pavilions -----
  {
    const tr = TER.ai;
    for (let k = 0; k < 3; k++) {
      const hx = tr.x - 8 + k * 2.1, hz = tr.z + 7 + (k % 2) * 1.4;
      const g = terrainHeight(hx, hz);
      wood.add(new THREE.BoxGeometry(0.62, 0.55, 0.62), mat4(hx, g + 0.38, hz, k * 0.4), 0xD8C09A, 0.06);
      wood.add(new THREE.BoxGeometry(0.72, 0.09, 0.72), mat4(hx, g + 0.70, hz, k * 0.4), 0xC0A87E, 0.06);
      stone.add(new THREE.BoxGeometry(0.5, 0.22, 0.5), mat4(hx, g + 0.05, hz, k * 0.4), 0x9A8B6C, 0.05, STONE_UV);
    }
  }

  // ----- working gear, province by province -----
  // The props of a place are what its people do all day. A harbour keeps
  // barrels and nets; the terraces press oil; the highland cuts and stacks
  // timber; the Wall builds cairns out of what falls on the road; the islets
  // rake salt and turn their boats over.
  {
    const near = (x, z, r) => colliders.some(c => Math.hypot(x - c.x, z - c.z) < c.r + r);

    // highland: cut pine stacked to season, and the horse it was sawn on
    const logSites = stations.filter(st => st.province === 'highland' && !st.special)
      .filter((_, i) => i % 7 === 0).slice(0, 9);
    for (const st of logSites) {
      const [lx, lz] = l2w(st.x, st.z, st.yaw, 3.6, 1.4);
      if (near(lx, lz, 1.4)) continue;
      const g = terrainHeight(lx, lz);
      const ry = st.yaw + 0.4;
      for (let row = 0; row < 3; row++) {
        for (let k = 0; k < 4 - row; k++) {
          wood.add(new THREE.CylinderGeometry(0.14, 0.15, 1.9, 7).rotateZ(Math.PI / 2),
            mat4(lx + Math.sin(ry + Math.PI / 2) * (k * 0.30 + row * 0.15 - 0.45), g + 0.17 + row * 0.27,
              lz + Math.cos(ry + Math.PI / 2) * (k * 0.30 + row * 0.15 - 0.45), ry), 0x8A6A46, 0.18);
        }
      }
      for (const sd of [-1, 1]) {
        wood.add(new THREE.CylinderGeometry(0.05, 0.06, 1.2, 5),
          mat4(lx + Math.sin(ry) * sd * 0.95, g + 0.6, lz + Math.cos(ry) * sd * 0.95, ry, 1, 1, 1), 0x5A4630, 0.12);
      }
      colliders.push({ x: lx, z: lz, r: 1.1 });
    }

    // the Wall: cairns of the stone that falls on the road, built by whoever
    // was passing, because that is what you do on a road like that
    const cairnSites = stations.filter(st => st.province === 'wall')
      .filter((_, i) => i % 9 === 0).slice(0, 8);
    for (const st of cairnSites) {
      const [cx, cz] = l2w(st.x, st.z, st.yaw, -3.2, 1.8);
      if (near(cx, cz, 1.2)) continue;
      const g = terrainHeight(cx, cz);
      let r0 = 0.34;
      for (let k = 0; k < 7; k++) {
        stone.add(new THREE.BoxGeometry(r0 * 2, 0.16, r0 * 1.7),
          mat4(cx + (hash01(st.slug + 'ca' + k) - 0.5) * 0.10, g + 0.09 + k * 0.16,
            cz + (hash01(st.slug + 'cb' + k) - 0.5) * 0.10, hash01(st.slug + 'cr' + k) * 3.14),
          0xC0B69C, 0.16, STONE_UV);
        r0 *= 0.87;
      }
      colliders.push({ x: cx, z: cz, r: 0.5 });
    }

    // the archipelago: mooring bollards painted the same blue as the doors,
    // a boat turned over on trestles, and the shallow frames of a salt pan
    for (const tr of TERRACES) {
      if (!tr.id.startsWith('cl-')) continue;
      for (let k = 0; k < 4; k++) {
        const a = hash01(tr.id + 'b' + k) * Math.PI * 2;
        const bx = tr.x + Math.cos(a) * tr.r * 0.86, bz = tr.z + Math.sin(a) * tr.r * 0.86;
        const g = terrainHeight(bx, bz);
        if (g < 1.4 || near(bx, bz, 1.0)) continue;
        stone.add(new THREE.CylinderGeometry(0.14, 0.19, 0.62, 8), mat4(bx, g + 0.31, bz), 0xF2F0E8, 0.03, STONE_UV);
        wood.add(new THREE.CylinderGeometry(0.16, 0.16, 0.10, 8), mat4(bx, g + 0.66, bz), 0x2E6FA3, 0.06);
      }
      if (tr.r < 10) continue;
      // the salt pan: four low kerbs of lime-white stone holding a bright floor
      const px = tr.x - tr.r * 0.5, pz = tr.z + tr.r * 0.42, pg = terrainHeight(px, pz);
      if (pg > 1.6 && !near(px, pz, 3.4)) {
        for (const [ox, oz, w2, d2] of [[0, 2.0, 4.4, 0.22], [0, -2.0, 4.4, 0.22], [2.1, 0, 0.22, 4.2], [-2.1, 0, 0.22, 4.2]]) {
          stone.add(new THREE.BoxGeometry(w2, 0.26, d2), mat4(px + ox, pg + 0.13, pz + oz), 0xF4F1E6, 0.04, STONE_UV);
        }
        stone.add(new THREE.BoxGeometry(4.2, 0.06, 4.0), mat4(px, pg + 0.10, pz), 0xFBF7EC, 0.02, STONE_UV);
      }
      // a boat keel-up on trestles, being caulked
      const kx = tr.x + tr.r * 0.55, kz = tr.z - tr.r * 0.5, kg = terrainHeight(kx, kz);
      if (kg > 1.5 && !near(kx, kz, 2.6)) {
        const ry = hash01(tr.id + 'k') * 3.14;
        for (const sd of [-1, 1]) {
          wood.add(new THREE.BoxGeometry(0.12, 0.55, 1.0), mat4(kx + Math.sin(ry) * sd * 1.1, kg + 0.28, kz + Math.cos(ry) * sd * 1.1, ry), 0x5A4630, 0.12);
        }
        const hull = new THREE.SphereGeometry(1.55, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2);
        hull.scale(0.40, 0.30, 1.05);
        wood.add(hull, mat4(kx, kg + 0.58, kz, ry), 0x9E8560, 0.10);
        // the keel, uppermost, which is the whole reason she is on her back
        wood.add(new THREE.BoxGeometry(0.09, 0.13, 2.9), mat4(kx, kg + 0.70, kz, ry), 0x6B4A2E, 0.10);
        colliders.push({ x: kx, z: kz, r: 1.3 });
      }
    }

    // the terraces press oil: one worn millstone on its bed per quarter
    for (const [mx, mz] of [[52, 22], [96, 16], [74, -46]]) {
      if (provinceAt(mx, mz) !== 'terraces' || near(mx, mz, 3.0)) continue;
      const g = terrainHeight(mx, mz);
      stone.add(new THREE.CylinderGeometry(1.5, 1.55, 0.30, 16), mat4(mx, g + 0.15, mz), 0xA89675, 0.08, STONE_UV);
      stone.add(new THREE.TorusGeometry(1.35, 0.12, 5, 18).rotateX(Math.PI / 2), mat4(mx, g + 0.32, mz), 0x94886F, 0.06, STONE_UV);
      const wheel = new THREE.CylinderGeometry(0.72, 0.72, 0.24, 14).rotateZ(Math.PI / 2);
      stone.add(wheel, mat4(mx + 0.5, g + 0.75, mz, 0.6), 0x8F8168, 0.08, STONE_UV);
      wood.add(new THREE.CylinderGeometry(0.09, 0.09, 1.9, 6).rotateZ(Math.PI / 2), mat4(mx - 0.3, g + 0.78, mz, 0.6), 0x6B4A2E, 0.12);
      colliders.push({ x: mx, z: mz, r: 1.7 });
    }
  }

  // ----- banners: still poles, live cloth -----
  buildBanners(scene, wood);

  // ----- footpaths: the citation graph underfoot; crofts stay off-trail -----
  buildPaths(scene, data, bySlug, maps, cliffRoad, gatePaths);

  // ----- materials and meshes -----
  const wallsMat = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 1.0,
    map: cloneTex(maps.plasterMap), roughnessMap: cloneTex(maps.plasterRough),
    normalMap: cloneTex(maps.plasterNormal), normalScale: new THREE.Vector2(0.8, 0.8),
  });
  addRim(wallsMat, 0.62);
  const wallsMesh = walls.build(wallsMat);
  const stoneMat = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 1.0,
    map: cloneTex(maps.stoneMap), roughnessMap: cloneTex(maps.stoneRough2),
    normalMap: cloneTex(maps.stoneNormal), normalScale: new THREE.Vector2(1.0, 1.0),
  });
  addRim(stoneMat, 0.30);
  const stoneMesh = stone.build(stoneMat);
  const woodMesh = wood.build(new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.86,
    map: cloneTex(maps.woodMap),
    normalMap: cloneTex(maps.grainNormal), normalScale: new THREE.Vector2(0.6, 0.6),
  }));
  const doorMesh = doors.build(new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.6, side: THREE.DoubleSide,
    map: cloneTex(maps.woodMap),
    normalMap: cloneTex(maps.grainNormal), normalScale: new THREE.Vector2(0.5, 0.5),
  }));
  const winTex = new THREE.CanvasTexture(winTexCanvas);
  winTex.colorSpace = THREE.SRGBColorSpace;
  const winMesh = windows.build(new THREE.MeshBasicMaterial({ vertexColors: true, map: winTex, side: THREE.DoubleSide, fog: true }), false);
  const atlasTex = new THREE.CanvasTexture(atlas.canvas);
  atlasTex.colorSpace = THREE.SRGBColorSpace;
  atlasTex.anisotropy = 4;
  // Signs are single sided. A double-sided sign shows its own words in
  // mirror from behind, which the walk kept catching all through the
  // colonnade; a sign you cannot read from the back is the honest object.
  const signMesh = signs.build(new THREE.MeshStandardMaterial({ map: atlasTex, roughness: 0.85, side: THREE.FrontSide }), false);
  scene.add(wallsMesh, stoneMesh, woodMesh, doorMesh, winMesh, signMesh);

  // ----- instanced dressing -----
  buildTileMesh(scene, tileRows, maps);
  buildLaundry(scene, laundry);
  buildAwnings(scene, awningSpots);
  buildFigs(scene, figSpots);
  buildAmphorae(scene, amphoraSpots, maps);
  const quay = buildQuay(scene, maps, stats, colliders);
  const smoke = buildSmoke(scene, chimneys);

  // ----- lanterns -----
  const lanterns = buildLanterns(scene, stations, tendedSet, stats.lastDate);

  // The draw-call law is 120 and the mirror pass was doubling the town for a
  // reflection the harbour water never shows legibly: at this sun angle the
  // sea mirrors sky, not roofs. Everything the town built is moved to the
  // eye-and-shadow layer, which the reflection camera does not render. The
  // pier, the boats and the props were already off it.
  for (const o of scene.children) {
    if (o.isLight || o === WORLD.water || o === WORLD.sky) continue;
    if (o.userData && o.userData.keepReflect) continue;
    if (o.isMesh || o.isPoints || o.isSprite || o.isGroup) {
      if (!o.userData.__terrain) noReflect(o);
    }
  }

  return {
    stations, bySlug, colliders, lanterns, beam, chimneys, smoke, quay,
    tickLife(t, dt, reduced) { smoke.tick(t, dt, reduced); },
  };
}

// One cloth material, instanced: laundry breathing on the violet thread.
function buildLaundry(scene, pieces) {
  if (!pieces.length) return;
  const geo = new THREE.PlaneGeometry(0.62, 0.8, 3, 3);
  geo.translate(0, -0.4, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, side: THREE.DoubleSide });
  addWind(mat, 0.06, 'hang');
  addRim(mat, 0.6);
  const mesh = new THREE.InstancedMesh(geo, mat, pieces.length);
  const m = new THREE.Matrix4(), c = new THREE.Color();
  pieces.forEach((p, i) => {
    m.compose(new THREE.Vector3(p.x, p.y, p.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, p.ry, 0)), new THREE.Vector3(p.s, p.s, p.s));
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, c.setHex(p.c));
  });
  mesh.castShadow = true;
  scene.add(mesh);
}

// Striped canvas awnings over workshop fronts and market houses.
function buildAwnings(scene, spots) {
  if (!spots.length) return;
  const c = document.createElement('canvas'); c.width = 64; c.height = 32;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#efe6d2'; ctx.fillRect(0, 0, 64, 32);
  ctx.fillStyle = 'rgba(140,90,60,0.55)';
  for (let k = 0; k < 8; k += 2) ctx.fillRect(k * 8, 0, 8, 32);
  const tex = new THREE.CanvasTexture(c);
  const geo = new THREE.PlaneGeometry(1, 1, 4, 2);
  geo.rotateX(-Math.PI / 2 + 0.42); // pitched down toward the street
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92, side: THREE.DoubleSide, color: 0xffffff });
  addWind(mat, 0.012, 'all');
  addRim(mat, 0.6);
  const mesh = new THREE.InstancedMesh(geo, mat, spots.length);
  const m = new THREE.Matrix4(), c2 = new THREE.Color();
  spots.forEach((p, i) => {
    m.compose(new THREE.Vector3(p.x, p.y, p.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, p.ry, 0)), new THREE.Vector3(p.w, 1, p.d * 1.15));
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, c2.setHex(p.c));
  });
  mesh.castShadow = true;
  scene.add(mesh);
}

// One fig for every croft: the explorer's reward keeps its shade.
function buildFigs(scene, spots) {
  if (!spots.length) return;
  const geo = new THREE.IcosahedronGeometry(1.35, 1);
  {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const k = 1 + (fbm(pos.getX(i) * 2.2 + 5, pos.getZ(i) * 2.2 + 11, 2) - 0.5) * 0.7;
      pos.setXYZ(i, pos.getX(i) * k * 1.25, pos.getY(i) * k * 0.75, pos.getZ(i) * k * 1.25);
    }
    geo.computeVertexNormals();
  }
  const mat = new THREE.MeshStandardMaterial({ color: 0x53663c, roughness: 0.95, flatShading: true });
  addWind(mat, 0.03, 'top');
  addRim(mat, 0.9, { trans: 0.25 });
  const mesh = new THREE.InstancedMesh(geo, mat, spots.length);
  const trunk = new THREE.CylinderGeometry(0.12, 0.2, 1.2, 5);
  trunk.translate(0, 0.6, 0);
  const tmesh = new THREE.InstancedMesh(trunk, new THREE.MeshStandardMaterial({ color: 0x6a5138, roughness: 1 }), spots.length);
  const m = new THREE.Matrix4();
  spots.forEach((p, i) => {
    const g = terrainHeight(p.x, p.z);
    m.compose(new THREE.Vector3(p.x, g + 1.55, p.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, p.s * 9, 0)), new THREE.Vector3(p.s, p.s * 0.85, p.s));
    mesh.setMatrixAt(i, m);
    m.compose(new THREE.Vector3(p.x, g, p.z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    tmesh.setMatrixAt(i, m);
  });
  mesh.castShadow = true; tmesh.castShadow = true;
  scene.add(mesh); scene.add(tmesh);
}

// Amphorae by the colonnade and the well.
function buildAmphorae(scene, spots, maps) {
  if (!spots.length) return;
  const profile = [];
  const shape = [[0.02, 0], [0.16, 0.04], [0.24, 0.28], [0.26, 0.5], [0.2, 0.72], [0.12, 0.82], [0.13, 0.94], [0.18, 1.0]];
  for (const [r, y] of shape) profile.push(new THREE.Vector2(r, y * 0.9));
  const geo = new THREE.LatheGeometry(profile, 9);
  const mat = new THREE.MeshStandardMaterial({ color: 0xA5714E, roughness: 0.92, map: cloneTex(maps.plasterRough) });
  addRim(mat, 0.62);
  const mesh = new THREE.InstancedMesh(geo, mat, spots.length);
  const m = new THREE.Matrix4(), c = new THREE.Color();
  spots.forEach((p, i) => {
    const g = terrainHeight(p.x, p.z);
    m.compose(new THREE.Vector3(p.x, g + 0.02, p.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, i * 1.7, (hash01('am' + i) - 0.5) * 0.12)), new THREE.Vector3(p.s, p.s, p.s));
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, c.setHex(0xA5714E).offsetHSL(0, 0, (hash01('amc' + i) - 0.5) * 0.14));
  });
  mesh.castShadow = true;
  scene.add(mesh);
}

// The quay: exactly as many crates as pages touched in the final month,
// the month's catch of commits, stacked by the Fisher's hand. Plus pots.
function buildQuay(scene, maps, stats, colliders) {
  const crateCount = stats.touched30; // 42 in the shipped record, asserted by the walk
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#a3805a'; ctx.fillRect(0, 0, 64, 64);
  ctx.strokeStyle = 'rgba(60,40,22,0.7)'; ctx.lineWidth = 2;
  for (let k = 0; k < 4; k++) { ctx.strokeRect(2, 2 + k * 15, 60, 13); }
  ctx.strokeStyle = 'rgba(255,230,190,0.25)';
  ctx.beginPath(); ctx.moveTo(2, 2); ctx.lineTo(62, 62); ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  const geo = new THREE.BoxGeometry(0.56, 0.56, 0.56);
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 });
  addRim(mat, 0.62);
  const mesh = new THREE.InstancedMesh(geo, mat, crateCount);
  const m = new THREE.Matrix4(), c2 = new THREE.Color();
  const bx = -43.5, bz = 6.5;
  let placedCount = 0;
  for (let layer = 0; layer < 4 && placedCount < crateCount; layer++) {
    const cols = 7 - layer, rows = 3 - Math.floor(layer / 2);
    for (let i = 0; i < cols && placedCount < crateCount; i++) {
      for (let j = 0; j < rows && placedCount < crateCount; j++) {
        const x = bx + i * 0.62 + layer * 0.3 + (hash01('cx' + placedCount) - 0.5) * 0.06;
        const z = bz + j * 0.62 + (layer % 2) * 0.3 + (hash01('cz' + placedCount) - 0.5) * 0.06;
        const g = groundAt(x, z);
        m.compose(
          new THREE.Vector3(x, g + 0.28 + layer * 0.57, z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (hash01('cr' + placedCount) - 0.5) * 0.2, 0)),
          new THREE.Vector3(1, 1, 1));
        mesh.setMatrixAt(placedCount, m);
        mesh.setColorAt(placedCount, c2.setHex(0xA3805A).offsetHSL(0, 0, (hash01('cc' + placedCount) - 0.5) * 0.16));
        placedCount++;
      }
    }
  }
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);
  colliders.push({ x: bx + 1.6, z: bz + 0.8, r: 2.6 });

  // lobster pots along the pier rail
  const potGeo = new THREE.BoxGeometry(0.55, 0.4, 0.38);
  const pc = document.createElement('canvas'); pc.width = pc.height = 32;
  const pctx = pc.getContext('2d');
  pctx.fillStyle = '#6b5436'; pctx.fillRect(0, 0, 32, 32);
  pctx.strokeStyle = 'rgba(30,20,10,0.8)'; pctx.lineWidth = 1.5;
  for (let k = 0; k <= 32; k += 6) {
    pctx.beginPath(); pctx.moveTo(k, 0); pctx.lineTo(k, 32); pctx.stroke();
    pctx.beginPath(); pctx.moveTo(0, k); pctx.lineTo(32, k); pctx.stroke();
  }
  const potTex = new THREE.CanvasTexture(pc);
  const potMat = new THREE.MeshStandardMaterial({ map: potTex, roughness: 1 });
  const potMesh = new THREE.InstancedMesh(potGeo, potMat, 8);
  const potPl = [[-80, 2.6], [-79.4, 2.7], [-72, -2.6], [-52, 2.7], [-51.4, 2.8], [-45, -5.2], [-44.2, -5.4], [-41, 5.6]];
  potPl.forEach(([x, z], i) => {
    const onPier = x > PIER.x0 && x < PIER.x1 && Math.abs(z) < 3.4;
    const y = onPier ? PIER.deck + 0.2 + (i % 2) * 0.42 : groundAt(x, z) + 0.2;
    m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, i * 0.9, 0)), new THREE.Vector3(1, 1, 1));
    potMesh.setMatrixAt(i, m);
  });
  potMesh.castShadow = true;
  scene.add(potMesh);
  return { x: bx, z: bz, crateCount };
}

// Chimney smoke: soft points rising only over real recent care.
function buildSmoke(scene, chimneys) {
  const smoking = chimneys.filter(ch => ch.smoking);
  const PUFFS = 5;
  const n = smoking.length * PUFFS;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(Math.max(1, n) * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(16, 16, 2, 16, 16, 16);
  g.addColorStop(0, 'rgba(235,225,212,0.5)');
  g.addColorStop(1, 'rgba(235,225,212,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 32);
  const mat = new THREE.PointsMaterial({
    map: new THREE.CanvasTexture(c), size: 1.15, sizeAttenuation: true,
    transparent: true, depthWrite: false, opacity: 0.55, color: 0xEDE4D6,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  if (n) scene.add(points);
  return {
    count: smoking.length,
    tick(t, dt, reduced) {
      if (!n) return;
      for (let i = 0; i < smoking.length; i++) {
        const ch = smoking[i];
        for (let k = 0; k < PUFFS; k++) {
          const idx = (i * PUFFS + k) * 3;
          const phase = reduced ? (k / PUFFS) : (((t * 0.14 + k / PUFFS + i * 0.37) % 1));
          pos[idx] = ch.x + Math.sin(phase * 5 + i) * 0.3 * phase + phase * 1.1; // drifts gently east
          pos[idx + 1] = ch.y + phase * 3.2;
          pos[idx + 2] = ch.z + Math.cos(phase * 4 + i * 2) * 0.25 * phase;
        }
      }
      geo.attributes.position.needsUpdate = true;
      mat.opacity = 0.5;
    },
  };
}

function cloneTex(t) {
  const c = t.clone();
  c.needsUpdate = true;
  return c;
}

// One draw call for every terracotta row on the coast, hue-jittered per row.
function buildTileMesh(scene, tileRows, maps) {
  if (!tileRows.length) return;
  const geo = new THREE.CylinderGeometry(0.15, 0.15, 1, 7, 1, true, 0.35, Math.PI - 0.7);
  geo.rotateZ(Math.PI / 2); // axis along X, arc bulging up
  const tex = cloneTex(maps.tileRowMap);
  tex.repeat.set(1, 22); // tile joints about every 30 cm on a house row
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.88 });
  const mesh = new THREE.InstancedMesh(geo, mat, tileRows.length);
  const m = new THREE.Matrix4(), p = new THREE.Vector3(), s = new THREE.Vector3();
  const c = new THREE.Color(), base = new THREE.Color(0x96604B), _rh = new THREE.Color();
  tileRows.forEach((r, i) => {
    p.set(r.x, r.y, r.z);
    s.set(r.len, r.ridge ? 1.35 : 1, r.ridge ? 1.35 : 1);
    m.compose(p, r.quat, s);
    mesh.setMatrixAt(i, m);
    // a roof is a province tell: burnt terracotta on the terraces, dark
    // shingle-grey under the pines, bare slab on the Wall, lime on the islets
    c.copy(r.hue !== undefined ? _rh.set(r.hue) : base).offsetHSL(r.tone * 0.045, r.tone * 0.10, r.tone * 0.10);
    mesh.setColorAt(i, c);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);
}

function buildLighthouse(stone, walls, wood, scene) {
  const tr = TER.crag;
  const x = tr.x, z = tr.z, g = terrainHeight(x, z);
  stone.add(new THREE.CylinderGeometry(3.6, 4.1, 1.4, 14), mat4(x, g + 0.7, z), 0x9E8E74, 0.05, STONE_UV);
  stone.add(new THREE.CylinderGeometry(2.6, 3.3, 20, 14), mat4(x, g + 10, z), 0xF0EAE0, 0.03, STONE_UV);
  stone.add(new THREE.TorusGeometry(2.75, 0.16, 6, 14).rotateX(Math.PI / 2), mat4(x, g + 6.5, z), 0x8a6a30);
  stone.add(new THREE.TorusGeometry(2.62, 0.16, 6, 14).rotateX(Math.PI / 2), mat4(x, g + 13.5, z), 0x8a6a30);
  stone.add(new THREE.CylinderGeometry(3.3, 3.3, 0.5, 14), mat4(x, g + 20.3, z), 0x6f6353, 0.04, STONE_UV);
  // gallery railing
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    wood.add(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 5), mat4(x + Math.cos(a) * 3.05, g + 21.05, z + Math.sin(a) * 3.05), 0x3c342c);
  }
  stone.add(new THREE.TorusGeometry(3.05, 0.06, 5, 18).rotateX(Math.PI / 2), mat4(x, g + 21.55, z), 0x3c342c);
  // door of the keepers at the base, facing the approach
  const da = Math.atan2(-1, -1);
  doorsAt(stone, walls, x + Math.sin(da) * 3.25, g, z + Math.cos(da) * 3.25, da);
  // lamp room
  const lampGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(2.0, 2.0, 2.6, 12, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffe6b0, transparent: true, opacity: 0.5, side: THREE.DoubleSide, fog: true })
  );
  lampGlass.position.set(x, g + 21.9, z);
  scene.add(lampGlass);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0xfff2cf, fog: true }));
  lamp.position.set(x, g + 21.9, z);
  scene.add(lamp);
  stone.add(new THREE.ConeGeometry(2.6, 1.8, 12), mat4(x, g + 24.1, z), 0x4a4038, 0.04);
  // the turning beam, held until the keeper's hour, fading with distance
  const beamGeo = new THREE.PlaneGeometry(150, 3.2);
  beamGeo.translate(75, 0, 0);
  const bc = document.createElement('canvas'); bc.width = 128; bc.height = 8;
  const bctx = bc.getContext('2d');
  const bg = bctx.createLinearGradient(0, 0, 128, 0);
  bg.addColorStop(0, 'rgba(255,236,180,0.9)');
  bg.addColorStop(0.25, 'rgba(255,220,150,0.5)');
  bg.addColorStop(1, 'rgba(255,200,120,0)');
  bctx.fillStyle = bg; bctx.fillRect(0, 0, 128, 8);
  const beamTex = new THREE.CanvasTexture(bc);
  const beamMat = new THREE.MeshBasicMaterial({
    map: beamTex, color: 0xffdf9e, transparent: true, opacity: 0.0, fog: false,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });
  const beam = new THREE.Group();
  const b1 = new THREE.Mesh(beamGeo, beamMat);
  const b2 = new THREE.Mesh(beamGeo, beamMat.clone()); b2.rotation.y = Math.PI;
  const b1v = new THREE.Mesh(beamGeo, beamMat.clone()); b1v.rotation.x = Math.PI / 2;
  b1.add(b1v);
  beam.add(b1, b2);
  beam.position.set(x, g + 21.9, z);
  scene.add(beam);
  return beam;
}

// A recessed keeper's door against a curved wall: reveal, leaf, lintel.
function doorsAt(stone, walls, x, g, z, yaw) {
  const dxn = Math.sin(yaw), dzn = Math.cos(yaw);
  walls.add(new THREE.PlaneGeometry(1.3, 2.3), mat4(x + dxn * 0.02, g + 1.15, z + dzn * 0.02, yaw), 0x241a12);
  walls.add(new THREE.PlaneGeometry(1.0, 2.14), mat4(x + dxn * 0.05, g + 1.07, z + dzn * 0.05, yaw), 0x4a3524, 0.1);
  stone.add(new THREE.BoxGeometry(1.5, 0.24, 0.24), mat4(x, g + 2.36, z, yaw), 0xD9CDB4, 0.06, STONE_UV);
}

function pennantGeometry() {
  // a swallowtail pennant, hanging from its top edge, with segments to bend
  const pts = [];
  const rows = 4;
  for (let r = 0; r < rows; r++) {
    const y0 = -(r / rows) * 0.86, y1 = -((r + 1) / rows) * 0.86;
    const w0 = 0.19 - (r / rows) * 0.04, w1 = 0.19 - ((r + 1) / rows) * 0.04;
    if (r < rows - 1) {
      pts.push(-w0, y0, 0, w0, y0, 0, w1, y1, 0);
      pts.push(-w0, y0, 0, w1, y1, 0, -w1, y1, 0);
    } else {
      pts.push(-w0, y0, 0, w0, y0, 0, 0, y1 - 0.1, 0);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
  geo.computeVertexNormals();
  return geo;
}

function buildBanners(scene, wood) {
  // violet only where dye would be: the banner line leading to the painted door
  const pts = [];
  for (let px = -74; px < 6; px += 11) pts.push([px, (px % 22 < 11 ? -4.6 : 4.6)]);
  const pole = new THREE.CylinderGeometry(0.06, 0.09, 3.6, 5);
  const arm = new THREE.BoxGeometry(0.7, 0.06, 0.06);
  const placements = [];
  for (const [x, zSide] of pts) {
    const z = Math.abs(x) < 46 ? zSide : (zSide > 0 ? 3.2 : -3.2);
    const g = groundAt(x, z);
    wood.add(pole.clone(), mat4(x, g + 1.8, z), 0x6b5236, 0.3);
    wood.add(arm.clone(), mat4(x, g + 3.5, z, 0), 0x6b5236, 0.3);
    placements.push({ x: x + 0.26, y: g + 3.46, z });
  }
  // the cloth itself is instanced, so the wind can find it hanging
  const geo = pennantGeometry();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: false, color: 0xffffff, roughness: 0.82, side: THREE.DoubleSide });
  addWind(mat, 0.05, 'hang');
  addRim(mat, 0.6);
  const mesh = new THREE.InstancedMesh(geo, mat, placements.length);
  const m = new THREE.Matrix4(), c = new THREE.Color(), base = new THREE.Color(VIOLET);
  placements.forEach((p, i) => {
    m.makeTranslation(p.x, p.y, p.z);
    mesh.setMatrixAt(i, m);
    c.copy(base).offsetHSL(0, 0, (hash01('pn' + i) - 0.5) * 0.10);
    mesh.setColorAt(i, c);
  });
  mesh.castShadow = true;
  scene.add(mesh);
}

function pathClass(inb) {
  if (inb >= 18) return 'cobble';
  if (inb >= 8) return 'dirt';
  return 'goat';
}
const PATH_STYLE = {
  cobble: { w: 2.1, c: new THREE.Color(0xCFC9C0), y: 0.20, vScale: 0.5 },
  dirt: { w: 1.5, c: new THREE.Color(0xC7B294), y: 0.17, vScale: 0.25 },
  goat: { w: 0.8, c: new THREE.Color(0xCBB794), y: 0.15, vScale: 0.45 },
};

function ribbon(arrays, pts, style) {
  const { pos, nor, col, uv } = arrays;
  const width = style.w;
  // resample the polyline
  const samples = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
    const d = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.max(1, Math.round(d / 4));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      samples.push([x0 + (x1 - x0) * t, z0 + (z1 - z0) * t]);
    }
  }
  samples.push(pts[pts.length - 1]);
  if (samples.length < 2) return;
  const yOff = style.y, c = style.c;
  const L = [], R = [], V = [];
  let arc = 0;
  for (let i = 0; i < samples.length; i++) {
    const [x, z] = samples[i];
    const [xn, zn] = samples[Math.min(i + 1, samples.length - 1)];
    const [xp, zp] = samples[Math.max(i - 1, 0)];
    let dx = xn - xp, dz = zn - zp;
    const dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl;
    if (i > 0) arc += Math.hypot(x - samples[i - 1][0], z - samples[i - 1][1]);
    const wob = (fbm(x * 0.06 + 3, z * 0.06, 2) - 0.5) * 2.0;
    const px = x - dz * wob, pz = z + dx * wob;
    const hw = width / 2 * (0.85 + fbm(x * 0.2, z * 0.2, 2) * 0.4);
    L.push([px - dz * hw, groundAt(px - dz * hw, pz + dx * hw) + yOff, pz + dx * hw]);
    R.push([px + dz * hw, groundAt(px + dz * hw, pz - dx * hw) + yOff, pz - dx * hw]);
    V.push(arc * style.vScale);
  }
  for (let i = 0; i < samples.length - 1; i++) {
    const quad = [
      [L[i], 0, V[i]], [R[i], 1, V[i]], [R[i + 1], 1, V[i + 1]],
      [L[i], 0, V[i]], [R[i + 1], 1, V[i + 1]], [L[i + 1], 0, V[i + 1]],
    ];
    for (const [[x, y, z], u_, v_] of quad) {
      pos.push(x, y, z); nor.push(0, 1, 0); uv.push(u_, v_);
      const v = 0.9 + fbm(x * 0.5, z * 0.5, 2) * 0.25;
      col.push(c.r * v, c.g * v, c.b * v);
    }
  }
}

function buildPaths(scene, data, bySlug, maps, cliffRoad, gatePaths) {
  const arrays = {
    cobble: { pos: [], nor: [], col: [], uv: [] },
    dirt: { pos: [], nor: [], col: [], uv: [] },
    goat: { pos: [], nor: [], col: [], uv: [] },
  };
  const { graph, inbound } = data;
  const BC = '/cms/migration/v4-to-v5/breaking-changes';
  for (const [a, b] of graph.edges) {
    const A = bySlug.get(a), B = bySlug.get(b);
    if (!A || !B) continue;
    const crossProduct = (a.startsWith('/cms') !== b.startsWith('/cms'));
    if (crossProduct) continue; // the harbor stairs carry the 29 crossings
    if ((inbound[a] || 0) === 0) continue; // crofts stay off every trail
    const cls = pathClass(inbound[b] || 0);
    const dist = Math.hypot(A.x - B.x, A.z - B.z);
    let pts;
    if ((b === BC && A.x < BRIDGE.x0) || (a === BC && B.x < BRIDGE.x0)) {
      const W = [BRIDGE.x0 - 2, -28], E = [BRIDGE.x1 + 2, -28];
      pts = (b === BC) ? [[A.x, A.z], W, E, [B.x, B.z]] : [[A.x, A.z], E, W, [B.x, B.z]];
    } else if (dist > 110) {
      continue;
    } else {
      pts = [[A.x, A.z], [B.x, B.z]];
    }
    // no path is worn across open water: between two islets the causeway is
    // the only road, and the graph does not get to draw over the sea
    let overSea = false;
    for (let k = 1; k < 6; k++) {
      const t = k / 6;
      const mx = A.x + (B.x - A.x) * t, mz = A.z + (B.z - A.z) * t;
      if (terrainHeight(mx, mz) < 0.9 && causewayDeckAt(mx, mz) === -Infinity) { overSea = true; break; }
    }
    if (overSea) continue;
    ribbon(arrays[cls], pts, PATH_STYLE[cls]);
  }
  // the coast road: cobbles from the pier through the town, then the
  // switchback ladder of the cliff road, over the Crossing, to the Light
  const RD = { ...PATH_STYLE.cobble, w: 2.5 };
  ribbon(arrays.cobble, [[-86, 0], [-48, 0], [-34, 0], [-8, 0], [6, 0]], RD);
  ribbon(arrays.cobble, [[-8, 2], [14, 8], [32, 20], [52, 34]], RD);
  ribbon(arrays.cobble, [[52, 34], [74, 32], [100, 26], [114, 10], [126, -6], [148, 0], [168, 6]], RD);
  const west = (cliffRoad && cliffRoad.length ? cliffRoad : [[168, 6], [186, -30]]).concat([[BRIDGE.x0 - 2, -28]]);
  ribbon(arrays.cobble, west, RD);
  ribbon(arrays.cobble, [[BRIDGE.x1 + 2, -28], [207, -27], [215, -38], [206, -48], [219, -58], [228, -52], [224, -54], [234, -66]], RD);
  const DT = PATH_STYLE.dirt;
  // the approaches to the province gates: worn in, because everyone crossing
  // between two provinces walks over the same few metres
  for (const gp of (gatePaths || [])) ribbon(arrays.dirt, gp, { ...DT, w: 1.9 });
  ribbon(arrays.dirt, [[-4, -6], [14, -16], [34, -26], [56, -32], [62, -34]], DT);
  ribbon(arrays.dirt, [[84, -49], [120, -46], [156, -44]], DT);
  ribbon(arrays.dirt, [[-4, -6], [8, -26], [16, -42], [22, -54]], DT);
  // the two stoa lanes and the well court
  ribbon(arrays.dirt, [[58, -10], [58, -44], [110, -44], [110, -10], [58, -10]], DT);
  ribbon(arrays.dirt, [[62, -34], [106, -34]], DT);
  // down to the water and out along the causeway: the harbour's own approach
  ribbon(arrays.dirt, [[-11, 24], [-16, 30], [-20, 38], [-26, 42], [-30, 42]], DT);

  const mats = {
    cobble: new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.9, map: cloneTex(maps.cobbleMap),
      normalMap: cloneTex(maps.cobbleNormal), normalScale: new THREE.Vector2(0.8, 0.8),
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    }),
    dirt: new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.98, map: cloneTex(maps.rutMap),
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    }),
    goat: new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.98, map: cloneTex(maps.goatMap),
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    }),
  };
  for (const key of ['cobble', 'dirt', 'goat']) {
    const a = arrays[key];
    if (!a.pos.length) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(a.pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(a.nor, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(a.col, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(a.uv, 2));
    const mesh = new THREE.Mesh(geo, mats[key]);
    mesh.receiveShadow = true;
    scene.add(mesh);
  }
}

// ---------- lanterns ----------
function makeGlowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,220,150,0.55)');
  g.addColorStop(1, 'rgba(255,190,110,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  return t;
}

function lanternBrightness(st, refDate, tended) {
  if (!st.prov) return 0.5;
  const days = daysSince(st.prov.last, refDate);
  let b = 0.45 + 0.55 * Math.max(0, 1 - days / 730);
  if (tended) b = Math.min(1.35, b + 0.32);
  return b;
}

function buildLanterns(scene, stations, tendedSet, refDate) {
  const n = stations.length;
  // Cages. The first pass made the lantern a solid box: the additive glow
  // point sits at the box centre, so the near face occluded it and every
  // waystation on the coast read as a black crate with a halo behind it.
  // Two hundred and ninety pages are supposed to be lanterns, so the cage
  // is now a frame you can see through, with a lit pane inside it.
  const glue = (list) => {
    let total = 0;
    const gs = list.map(g => (g.index ? g.toNonIndexed() : g));
    for (const g of gs) total += g.attributes.position.count;
    const pn = new Float32Array(total * 3), nn = new Float32Array(total * 3);
    let o = 0;
    for (const g of gs) {
      pn.set(g.attributes.position.array, o * 3);
      nn.set(g.attributes.normal.array, o * 3);
      o += g.attributes.position.count;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pn, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nn, 3));
    return out;
  };
  const P = 0.093, BAR = 0.022;
  const cageGeo = glue([
    new THREE.BoxGeometry(0.23, 0.028, 0.23).translate(0, 0.152, 0),   // roof plate
    new THREE.BoxGeometry(0.20, 0.026, 0.20).translate(0, -0.152, 0),  // floor plate
    new THREE.ConeGeometry(0.10, 0.07, 4).rotateY(Math.PI / 4).translate(0, 0.196, 0), // cap
    new THREE.BoxGeometry(BAR, 0.30, BAR).translate(P, 0, P),
    new THREE.BoxGeometry(BAR, 0.30, BAR).translate(-P, 0, P),
    new THREE.BoxGeometry(BAR, 0.30, BAR).translate(P, 0, -P),
    new THREE.BoxGeometry(BAR, 0.30, BAR).translate(-P, 0, -P),
    new THREE.BoxGeometry(0.05, 0.05, 0.5).translate(0, 0.2, -0.28),   // the bracket arm
  ]);
  const cageMat = new THREE.MeshStandardMaterial({ color: 0x2e2a24, roughness: 0.6, metalness: 0.4 });
  addRim(cageMat, 0.4);
  const cages = new THREE.InstancedMesh(cageGeo, cageMat, n);
  const m = new THREE.Matrix4();
  // the lit pane: unlit basic, tinted per station by the lantern's own
  // brightness, so a page left long untended burns visibly lower
  const glassGeo = new THREE.BoxGeometry(0.148, 0.255, 0.148);
  const glassMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: true, toneMapped: true });
  const glass = new THREE.InstancedMesh(glassGeo, glassMat, n);
  for (let i = 0; i < n; i++) {
    const st = stations[i]; st.lanternIndex = i;
    m.setPosition(st.lx, st.ly, st.lz);
    cages.setMatrixAt(i, m);
    glass.setMatrixAt(i, m);
  }
  cages.castShadow = true;
  scene.add(cages);
  scene.add(glass);
  // glows
  const geo = new THREE.BufferGeometry();
  const posArr = new Float32Array(n * 3), colArr = new Float32Array(n * 3), sizeArr = new Float32Array(n);
  geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  geo.setAttribute('gcolor', new THREE.BufferAttribute(colArr, 3));
  geo.setAttribute('gsize', new THREE.BufferAttribute(sizeArr, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: makeGlowTexture() } },
    vertexShader: `
      attribute vec3 gcolor; attribute float gsize;
      varying vec3 vColor;
      void main() {
        vColor = gcolor;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = gsize * (240.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform sampler2D map; varying vec3 vColor;
      void main() {
        vec4 t = texture2D(map, gl_PointCoord);
        gl_FragColor = vec4(vColor * t.rgb, t.a);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  const warm = new THREE.Color(0xffc46a), tendedC = new THREE.Color(0xffab4d), smoked = new THREE.Color(0xd9a05e);
  const _gc = new THREE.Color();
  function refresh(i) {
    const st = stations[i];
    const tended = tendedSet.has(st.slug);
    const b = lanternBrightness(st, refDate, tended);
    const base = tended ? tendedC : (st.night > 0 ? smoked : warm);
    posArr[i * 3] = st.lx; posArr[i * 3 + 1] = st.ly; posArr[i * 3 + 2] = st.lz;
    colArr[i * 3] = base.r * b; colArr[i * 3 + 1] = base.g * b; colArr[i * 3 + 2] = base.b * b;
    sizeArr[i] = (st.night > 0 ? 2.2 : 2.7) * (0.7 + b * 0.55) * (tended ? 1.18 : 1);
    st.brightness = b;
    _gc.copy(base).multiplyScalar(0.55 + b * 2.35);
    glass.setColorAt(i, _gc);
    if (glass.instanceColor) glass.instanceColor.needsUpdate = true;
  }
  for (let i = 0; i < n; i++) refresh(i);
  geo.attributes.position.needsUpdate = true;
  geo.attributes.gcolor.needsUpdate = true;
  geo.attributes.gsize.needsUpdate = true;

  // a small pool of true lights, granted to the nearest flames
  const POOL = 5;
  const lights = [];
  for (let i = 0; i < POOL; i++) {
    const L = new THREE.PointLight(0xffb765, 0, 20, 2);
    scene.add(L); lights.push(L);
  }

  return {
    setTended(slug) {
      const st = stations.find(s => s.slug === slug);
      if (st) { refresh(st.lanternIndex); geo.attributes.gcolor.needsUpdate = true; geo.attributes.gsize.needsUpdate = true; }
    },
    tick(camPos, t) {
      const sorted = stations.slice().sort((a, b) =>
        (Math.hypot(a.lx - camPos.x, a.lz - camPos.z)) - (Math.hypot(b.lx - camPos.x, b.lz - camPos.z)));
      for (let i = 0; i < POOL; i++) {
        const st = sorted[i], L = lights[i];
        if (!st || Math.hypot(st.lx - camPos.x, st.lz - camPos.z) > 42) { L.intensity = 0; continue; }
        L.position.set(st.lx, st.ly, st.lz);
        const flick = WORLD.reducedMotion ? 1 : (1 + Math.sin(t * 9 + st.lx) * 0.06 + Math.sin(t * 23 + st.lz) * 0.03);
        L.intensity = 8.5 * st.brightness * flick;
      }
    },
  };
}
