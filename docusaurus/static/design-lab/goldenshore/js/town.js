// The town. Every station is a real page, every sign carries real strings,
// every footpath is a citation edge, every lantern burns provenance truth.
// This pass owes the light its debt: no flat single-color face survives
// near the camera. Stone is coursed, plaster is mottled, wood has grain,
// roofs are instanced terracotta rows, paths carry wheel ruts.

import * as THREE from 'three';
import { terrainHeight, groundAt, TERRACES, PIER, BRIDGE, bridgeDeckAt, hash01, fbm } from './terrain.js';
import { sharedMaps, addWind, WORLD } from './world.js';
import { daysSince } from './data.js';

const VIOLET = 0x4945FF;

// world texels per meter for box-projected UVs
const STONE_UV = 0.37;   // one 512 px stone tile every 2.7 m, courses about 30 cm
const PLASTER_UV = 0.30;

// ---------- curated station picks for the audition (the full 290 can follow) ----------
const PICKS = {
  'cms|Getting Started': ['/cms/quick-start', '/cms/project-structure', '/cms/installation', '/cms/features/admin-panel', '/cms/features/content-manager', '/cms/features/content-type-builder', '/cms/deployment', '/cms/installation/docker'],
  'cms|Features': ['/cms/features/media-library', '/cms/features/draft-and-publish', '/cms/features/internationalization', '/cms/features/users-permissions', '/cms/features/api-tokens', '/cms/features/releases'],
  'cms|AI': ['/cms/ai/for-content-managers', '/cms/ai/for-developers', '/cms/ai/docs-mcp-server'],
  'cms|Content APIs': ['/cms/api/document-service', '/cms/api/rest', '/cms/api/graphql', '/cms/api/document-service/populate', '/cms/api/rest/guides/understanding-populate', '/cms/api/query-engine', '/cms/api/client'],
  'cms|Configurations': ['/cms/configurations/database', '/cms/configurations/server', '/cms/configurations/admin-panel', '/cms/configurations/middlewares', '/cms/configurations/environment'],
  'cms|Development': ['/cms/backend-customization', '/cms/backend-customization/models', '/cms/backend-customization/controllers', '/cms/backend-customization/webhooks', '/cms/error-handling'],
  'cms|TypeScript': ['/cms/typescript', '/cms/typescript/development'],
  'cms|Command Line Interface': ['/cms/cli'],
  'cms|Plugins development': ['/cms/plugins-development/create-a-plugin', '/cms/plugins-development/server-api', '/cms/plugins-development/admin-panel-api', '/cms/plugins-development/plugin-structure'],
  'cms|Upgrades': ['/cms/migration/v4-to-v5/introduction-and-faq', '/cms/migration/v4-to-v5/step-by-step', '/cms/upgrade-tool', '/cms/migration/v4-to-v5/breaking-changes', '/release-notes'],
  'cloud|Getting Started': ['/cloud/intro', '/cloud/getting-started/deployment', '/cloud/getting-started/usage-billing', '/cloud/getting-started/caching'],
  'cloud|Projects management': ['/cloud/projects/overview', '/cloud/projects/settings'],
  'cloud|Deployments': ['/cloud/projects/deploys'],
  'cloud|Account management': ['/cloud/account/account-billing'],
  'cloud|Command Line Interface': ['/cloud/cli/cloud-cli'],
  'cloud|Advanced configuration': ['/cloud/advanced/database'],
};
const CROFTS = ['/cms/database-transactions', '/cms/testing', '/cms/admin-panel-customization/theme-extension'];

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
  '/cms/quick-start': { x: 10, z: 0, yaw: Math.PI / 2 },           // violet door faces the pier
  '/cms/api/document-service': { x: 84, z: -34 },                   // the wellhouse
  '/cms/migration/v4-to-v5/breaking-changes': { x: 210, z: -28 },   // across the Crossing
  '/release-notes': { x: 234, z: -66 },                             // door of the Golden Shore
  '/cloud/projects/settings': { x: 8, z: 68 },                      // the harbormaster's desk
  '/cms/cli': { x: 66, z: -4 },                                     // the signal mast
  '/cms/migration/v4-to-v5/introduction-and-faq': { x: 168, z: 6 },
  '/cms/migration/v4-to-v5/step-by-step': { x: 177, z: -5 },
  '/cms/upgrade-tool': { x: 184, z: -14 },
};
const CROFT_POS = [{ x: 66, z: 96 }, { x: 150, z: 66 }, { x: 108, z: -92 }];

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
const ATLAS = 2048, CW = 256, CH = 128, COLS = ATLAS / CW;
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
function signQuad(bucket, i, x, y, z, ry, w = 1.9, h = 0.95) {
  const geo = new THREE.PlaneGeometry(w, h);
  const { u0, v0, u1, v1 } = signUV(i);
  const uv = geo.attributes.uv;
  for (let k = 0; k < uv.count; k++) {
    uv.setXY(k, u0 + uv.getX(k) * (u1 - u0), v0 + uv.getY(k) * (v1 - v0));
  }
  bucket.add(geo, mat4(x, y, z, ry), 0xffffff);
  geo.dispose();
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
  const tileRows = []; // {x,y,z,quat,len,tone} per instanced terracotta row

  const PLASTERS = [0xEDE0CC, 0xE8D2AC, 0xDCC49A, 0xF0E6D4, 0xD9BE93];
  const TERRA = 0x9D5A3C;
  const QUOIN = 0xD9CDB4, DARKWOOD = 0x4a3524;

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
    };
    stations.push(st); bySlug.set(slug, st);
    return st;
  }

  // A whole small Mediterranean house: mottled plaster body over a stone
  // base, quoined corners, recessed door and windows under stone lintels,
  // shutters, a gabled roof of instanced terracotta rows with real eaves,
  // a chimney with a pot. The door faces local +Z, at d/2.
  function house(st, opts = {}) {
    const w = opts.w || 5.2 + hash01(st.slug) * 1.8;
    const d = opts.d || 4.2 + hash01(st.slug + 'd') * 1.6;
    const h = opts.h || 3.1 + hash01(st.slug + 'h') * 0.9;
    const { x, z, yaw } = st;
    const g = st.y;
    const plaster = opts.plaster !== undefined ? opts.plaster : PLASTERS[Math.floor(hash01(st.slug + 'p') * PLASTERS.length)];
    const M = (lx, ly, lz, ry = 0, sx = 1, sy = 1, sz = 1) => {
      const [wx, wz] = l2w(x, z, yaw, lx, lz);
      return mat4(wx, g + ly, wz, yaw + ry, sx, sy, sz);
    };
    const df = d / 2;

    // body and stone base band
    walls.add(new THREE.BoxGeometry(w, h + 1.2, d), M(0, h / 2 - 0.6, 0), plaster, 0.12, PLASTER_UV);
    stone.add(new THREE.BoxGeometry(w + 0.16, 0.6, d + 0.16), M(0, 0.3, 0), 0xAF9C79, 0.12, STONE_UV);

    // quoins: barely proud of the plaster, alternating long and short
    const qn = Math.max(4, Math.round(h / 0.42));
    for (const sx_ of [1, -1]) for (const sz_ of [1, -1]) {
      for (let k = 0; k < qn; k++) {
        const alt = k % 2;
        stone.add(new THREE.BoxGeometry(alt ? 0.48 : 0.30, 0.3, alt ? 0.30 : 0.48),
          M(sx_ * (w / 2 - 0.09), 0.76 + k * 0.42, sz_ * (d / 2 - 0.09)), 0xE0D5BC, 0.05, STONE_UV);
      }
    }

    // gable roof with eaves, dark base panels, fascia shadow lines
    const gv = 0.42, ovZ = 0.55;
    const rh = d * 0.36;
    const pitch = Math.atan2(rh, d / 2 + ovZ);
    const slopeLen = Math.hypot(rh, d / 2 + ovZ) + 0.12;
    for (const s of [1, -1]) {
      const panel = new THREE.BoxGeometry(w + 2 * gv, 0.09, slopeLen);
      panel.translate(0, -0.1, s * slopeLen / 2);
      panel.rotateX(s * pitch);
      panel.translate(0, h + rh, 0);
      walls.add(panel, M(0, 0, 0), 0x6B3D27, 0.12, PLASTER_UV);
      wood.add(new THREE.BoxGeometry(w + 2 * gv, 0.17, 0.1), M(0, h - 0.02, s * (d / 2 + ovZ)), DARKWOOD, 0.15);
    }
    { // gable triangles closing the ends
      const w2 = w / 2, d2 = d / 2;
      const tri = new THREE.BufferGeometry();
      tri.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        w2, h, d2, w2, h, -d2, w2, h + rh, 0,
        -w2, h, -d2, -w2, h, d2, -w2, h + rh, 0,
      ]), 3));
      tri.computeVertexNormals();
      walls.add(tri, M(0, 0, 0), plaster, 0.12, PLASTER_UV);
    }
    const rows = Math.max(4, Math.round(slopeLen / 0.24));
    for (const s of [1, -1]) {
      for (let k = 0; k < rows; k++) {
        const dist = (k + 0.45) * (slopeLen / rows);
        const ly = h + rh - dist * Math.sin(pitch) + 0.06;
        const [wx, wz] = l2w(x, z, yaw, 0, s * dist * Math.cos(pitch));
        tileRows.push({
          x: wx, y: g + ly, z: wz,
          quat: yawPitchQuat(yaw, s * pitch),
          len: w + 2 * gv,
          tone: hash01(st.slug + 'r' + s + k) - 0.5,
        });
      }
    }
    tileRows.push({
      x, y: g + h + rh + 0.10, z,
      quat: yawPitchQuat(yaw, 0), len: w + 2 * gv + 0.1, tone: -0.2, ridge: true,
    });

    // chimney with a pot
    if (!opts.noChimney) {
      const cx = -w * 0.30, cz = -d * 0.14;
      walls.add(new THREE.BoxGeometry(0.55, 1.4, 0.55), M(cx, h + rh * 0.6 + 0.5, cz), plaster, 0.1, PLASTER_UV);
      stone.add(new THREE.BoxGeometry(0.72, 0.12, 0.72), M(cx, h + rh * 0.6 + 1.22, cz), QUOIN, 0.1, STONE_UV);
      walls.add(new THREE.CylinderGeometry(0.10, 0.14, 0.4, 6), M(cx, h + rh * 0.6 + 1.46, cz), TERRA, 0.2, PLASTER_UV);
    }

    // the door: dark reveal, painted leaf, stone jambs, lintel, threshold
    const doorC = opts.door || 0x4a3320;
    doors.add(new THREE.PlaneGeometry(1.44, 2.42), M(0, 1.2, df + 0.02), 0x201610);
    doors.add(new THREE.PlaneGeometry(1.1, 2.24), M(0, 1.12, df + 0.055), doorC);
    stone.add(new THREE.BoxGeometry(1.66, 0.24, 0.22), M(0, 2.42, df + 0.02), QUOIN, 0.08, STONE_UV);
    stone.add(new THREE.BoxGeometry(0.16, 2.3, 0.2), M(-0.74, 1.15, df + 0.02), QUOIN, 0.08, STONE_UV);
    stone.add(new THREE.BoxGeometry(0.16, 2.3, 0.2), M(0.74, 1.15, df + 0.02), QUOIN, 0.08, STONE_UV);
    stone.add(new THREE.BoxGeometry(1.9, 0.16, 0.7), M(0, 0.08, df + 0.2), 0xAF9C79, 0.1, STONE_UV);

    // windows: recess, warm pane, sill, lintel strip, shutters
    const nwin = 1 + (hash01(st.slug + 'w') > 0.45 ? 1 : 0);
    const shutterC = opts.shutter !== undefined ? opts.shutter
      : (st.tax.section === 'TypeScript' ? 0x4C7191 : (hash01(st.slug + 'sh') > 0.55 ? 0x5A6648 : DARKWOOD));
    for (let k = 0; k < nwin; k++) {
      const off = (k === 0 ? -1 : 1) * 0.30 * w;
      const wy = h * 0.58;
      const warm = 0.7 + hash01(st.slug + k) * 0.3;
      doors.add(new THREE.PlaneGeometry(0.9, 1.14), M(off, wy, df + 0.02), 0x241a12);
      windows.add(new THREE.PlaneGeometry(0.62, 0.9), M(off, wy, df + 0.05), new THREE.Color(warm, 0.62 * warm, 0.22 * warm));
      stone.add(new THREE.BoxGeometry(0.98, 0.1, 0.3), M(off, wy - 0.63, df + 0.05), QUOIN, 0.08, STONE_UV);
      stone.add(new THREE.BoxGeometry(0.9, 0.14, 0.2), M(off, wy + 0.64, df + 0.02), QUOIN, 0.08, STONE_UV);
      wood.add(new THREE.BoxGeometry(0.30, 1.0, 0.05), M(off - 0.52, wy, df + 0.045), shutterC, 0.12);
      wood.add(new THREE.BoxGeometry(0.30, 1.0, 0.05), M(off + 0.52, wy, df + 0.045), shutterC, 0.12);
    }
    // a small side window on the gable for the bigger houses
    if (w > 5.7 && !opts.noSide) {
      const warm = 0.65 + hash01(st.slug + 'sw') * 0.3;
      doors.add(new THREE.PlaneGeometry(0.8, 1.0), M(w / 2 + 0.02, h * 0.5, 0.4, Math.PI / 2), 0x241a12);
      windows.add(new THREE.PlaneGeometry(0.54, 0.76), M(w / 2 + 0.05, h * 0.5, 0.4, Math.PI / 2), new THREE.Color(warm, 0.6 * warm, 0.2 * warm));
    }

    colliders.push({ x, z, r: Math.max(w, d) * 0.62 + 0.12 });
    return { w, d, h };
  }

  function stationBuild(st, opts = {}) {
    const dims = house(st, opts);
    const { x, z, yaw } = st; const g = st.y;
    const dx = Math.sin(yaw), dz = Math.cos(yaw);
    const df = dims.d / 2;
    const prov = st.prov;
    const sub = prov ? `since ${prov.first} · ${prov.commits} ${prov.commits === 1 ? 'commit' : 'commits'}` : '';
    if (!opts.noSign) {
      const idx = drawSign(atlas, 'wood', st.page.sidebarLabel || st.page.title, sub);
      signQuad(signs, idx, x + dx * (df + 0.17), g + 2.82, z + dz * (df + 0.17), Math.atan2(dx, dz), 1.8, 0.9);
    }
    // lantern hangs beside the door, on a short bracket
    const [lwx, lwz] = l2w(x, z, yaw, 1.5, df + 0.34);
    st.lx = lwx; st.lz = lwz;
    st.ly = g + 2.05;
    return dims;
  }

  // ----- lay out districts -----
  for (const [key, slugs] of Object.entries(PICKS)) {
    const tr = TER[DISTRICT_OF[key]];
    let ring = 0;
    for (const slug of slugs) {
      if (SPECIAL_POS[slug]) {
        const sp = SPECIAL_POS[slug];
        const yaw = sp.yaw !== undefined ? sp.yaw : Math.atan2(tr.x - sp.x, tr.z - sp.z) + Math.PI;
        const st = stationAt(slug, sp.x, sp.z, sp.yaw !== undefined ? sp.yaw : yaw + Math.PI);
        if (st) st.districtKey = key;
        continue;
      }
      const k = ring++;
      const aDeg = (((k + 1) >> 1) * 44) * (k % 2 ? -1 : 1);
      const a = THREE.MathUtils.degToRad(aDeg);
      const rr = tr.r * 0.58 + (k % 3) * 1.5 + hash01(slug) * 2;
      const x = tr.x + Math.cos(a) * rr, z = tr.z + Math.sin(a) * rr * 0.9;
      const yaw = Math.atan2(tr.x - x, tr.z - z); // face the district center
      const st = stationAt(slug, x, z, yaw);
      if (st) st.districtKey = key;
    }
  }
  // crofts: unmarked, off trail, zero inbound in the real graph
  CROFTS.forEach((slug, i) => {
    const p = CROFT_POS[i];
    const st = stationAt(slug, p.x, p.z, Math.atan2(-p.x, -p.z), { special: 'croft' });
    if (st) st.districtKey = 'croft';
  });

  // ----- build architecture -----
  for (const st of stations) {
    if (st.slug === '/cms/quick-start') {
      st.yaw = Math.PI * 1.5; // door faces due west, toward the pier and the gate
      const prov = st.prov;
      const dims = stationBuild(st, { w: 6.4, d: 5.2, h: 3.6, door: VIOLET, plaster: 0xF0E6D4, noSign: true });
      const hands = prov.authors.length;
      const idx = drawSign(atlas, 'wood', st.page.sidebarLabel || st.page.title, `${prov.commits} renovations by ${hands} hands since ${prov.first}`);
      const dx = Math.sin(st.yaw), dz = Math.cos(st.yaw);
      const df = dims.d / 2;
      signQuad(signs, idx, st.x + dx * (df + 0.18), st.y + 2.95, st.z + dz * (df + 0.18), Math.atan2(dx, dz), 2.3, 1.15);
      // a small tiled porch over the violet door, held by two posts
      const yaw = st.yaw, g = st.y;
      const P = (lx, ly, lz, ry = 0) => { const [wx, wz] = l2w(st.x, st.z, yaw, lx, lz); return mat4(wx, g + ly, wz, yaw + ry); };
      wood.add(new THREE.CylinderGeometry(0.07, 0.09, 2.15, 6), P(-1.05, 1.07, df + 1.15), 0x6b4a2e, 0.1);
      wood.add(new THREE.CylinderGeometry(0.07, 0.09, 2.15, 6), P(1.05, 1.07, df + 1.15), 0x6b4a2e, 0.1);
      wood.add(new THREE.BoxGeometry(2.5, 0.1, 0.1), P(0, 2.18, df + 1.15), DARKWOOD, 0.1);
      const porchPitch = 0.42;
      for (let k = 0; k < 5; k++) {
        const dpp = 0.16 + k * 0.26;
        const [wx, wz] = l2w(st.x, st.z, yaw, 0, df + 1.3 - dpp * Math.cos(porchPitch));
        tileRows.push({
          x: wx, y: g + 2.28 + dpp * Math.sin(porchPitch), z: wz,
          quat: yawPitchQuat(yaw, porchPitch), len: 2.6, tone: hash01('porch' + k) - 0.5,
        });
      }
    } else if (st.slug === '/cms/api/document-service') {
      // the wellhouse: paths of the API terrace radiate from this well
      const g = st.y;
      stone.add(new THREE.CylinderGeometry(3.1, 3.4, 2.6, 12), mat4(st.x, g + 1.3, st.z), 0x9E8E74, 0.1, STONE_UV);
      stone.add(new THREE.TorusGeometry(3.15, 0.12, 5, 14).rotateX(Math.PI / 2), mat4(st.x, g + 2.62, st.z), 0x8B7C63, 0.08, STONE_UV);
      const cone = new THREE.ConeGeometry(4.0, 2.0, 12);
      walls.add(cone, mat4(st.x, g + 3.7, st.z), TERRA, 0.3, PLASTER_UV);
      // rings of tiles climbing the cone
      for (let k = 0; k < 4; k++) {
        const t = (k + 0.5) / 4;
        const r = 4.0 * (1 - t);
        const segs = Math.max(5, Math.round(r * 4.4));
        for (let s = 0; s < segs; s++) {
          const a = (s / segs) * Math.PI * 2;
          const q = yawPitchQuat(-a - Math.PI / 2, -Math.atan2(2.0, 4.0));
          tileRows.push({
            x: st.x + Math.cos(a) * r * 0.95, y: g + 2.78 + t * 2.0, z: st.z + Math.sin(a) * r * 0.95,
            quat: q, len: (2 * Math.PI * r) / segs * 1.05, tone: hash01('well' + k + s) - 0.5,
          });
        }
      }
      const idx = drawSign(atlas, 'stone', st.page.sidebarLabel || st.page.title, `${st.inbound} paths meet at this well`);
      signQuad(signs, idx, st.x, g + 1.9, st.z - 3.55, Math.PI);
      signQuad(signs, idx, st.x, g + 1.9, st.z + 3.55, 0);
      st.lx = st.x + 2.2; st.lz = st.z + 2.2; st.ly = g + 2.4;
      colliders.push({ x: st.x, z: st.z, r: 3.8 });
    } else if (st.slug === '/release-notes') {
      // station is the lighthouse door; tower built separately below
      const idx = drawSign(atlas, 'stone', st.page.sidebarLabel || st.page.title, `relit ${st.prov.commits} times · last ${st.prov.last}`);
      signQuad(signs, idx, st.x - 0.2, st.y + 2.1, st.z + 0.1, Math.atan2(-1, -1), 2.1, 1.05);
      st.lx = st.x - 1.4; st.lz = st.z - 1.4; st.ly = st.y + 2.6;
    } else if (st.slug === '/cms/cli') {
      // the single CLI signal mast
      const g = st.y;
      wood.add(new THREE.CylinderGeometry(0.16, 0.24, 12, 7), mat4(st.x, g + 6, st.z), 0x6b4a2e);
      wood.add(new THREE.BoxGeometry(3.2, 0.14, 0.14), mat4(st.x, g + 9.6, st.z, 0.4), 0x6b4a2e);
      const flag = new THREE.PlaneGeometry(1.5, 0.5, 3, 1);
      flag.translate(0.75, 0, 0);
      wood.add(flag, mat4(st.x + 0.2, g + 10.4, st.z, 0.4), 0xEFE2C4, 0.1);
      const flag2 = new THREE.PlaneGeometry(1.1, 0.38, 3, 1);
      flag2.translate(0.55, 0, 0);
      wood.add(flag2, mat4(st.x + 0.2, g + 9.0, st.z, 0.7), 0xD8C7A2, 0.1);
      const idx = drawSign(atlas, 'wood', st.page.sidebarLabel || st.page.title, `since ${st.prov.first} · ${st.prov.commits} commits`);
      signQuad(signs, idx, st.x, g + 1.8, st.z - 0.6, Math.PI);
      st.lx = st.x + 0.7; st.lz = st.z + 0.7; st.ly = g + 2.6;
      colliders.push({ x: st.x, z: st.z, r: 0.6 });
    } else if (st.special === 'croft') {
      stationBuild(st, { w: 3.6, d: 3.0, h: 2.3, noSign: true, plaster: 0xC9B896, noSide: true });
    } else if (st.slug === '/cloud/projects/settings') {
      stationBuild(st, { w: 7.2, d: 5.6, h: 4.0, plaster: 0xE8D2AC });
    } else {
      const fresh = st.tax.section === 'AI';
      stationBuild(st, fresh ? { plaster: 0xF7F1E4 } : {});
    }
  }

  // ----- harbor gate: coursed stone, plinths, cornices, a tiled cap -----
  {
    const gx = -34, gz = 0, g = terrainHeight(gx, gz);
    for (const s of [-1, 1]) {
      stone.add(new THREE.BoxGeometry(2.4, 1.0, 2.4), mat4(gx, g + 0.5, gz + s * 4.2), 0x93876D, 0.06, STONE_UV);
      stone.add(new THREE.BoxGeometry(1.8, 6.4, 1.8), mat4(gx, g + 3.2, gz + s * 4.2), 0x9E8E74, 0.08, STONE_UV);
      stone.add(new THREE.BoxGeometry(2.3, 0.34, 2.3), mat4(gx, g + 5.72, gz + s * 4.2), 0x93876D, 0.06, STONE_UV);
    }
    stone.add(new THREE.BoxGeometry(1.6, 1.5, 10.6), mat4(gx, g + 6.6, gz), 0x9E8E74, 0.08, STONE_UV);
    stone.add(new THREE.BoxGeometry(2.0, 0.3, 11.3), mat4(gx, g + 7.5, gz), 0x93876D, 0.06, STONE_UV);
    // tiled saddle cap
    const capPitch = 0.5;
    for (const s of [-1, 1]) {
      for (let k = 0; k < 4; k++) {
        const dpp = 0.12 + k * 0.24;
        tileRows.push({
          x: gx + s * dpp * Math.cos(capPitch), y: g + 8.28 - dpp * Math.sin(capPitch), z: gz,
          quat: yawPitchQuat(Math.PI / 2, s * capPitch), len: 11.5, tone: hash01('gate' + s + k) - 0.5,
        });
      }
    }
    tileRows.push({ x: gx, y: g + 8.34, z: gz, quat: yawPitchQuat(Math.PI / 2, 0), len: 11.6, tone: -0.2, ridge: true });
    const gs = sectionByKey.get('cms|Getting Started');
    const idx = drawSign(atlas, 'stone', gs.name, `${gs.count} pages · the harbor gate`);
    signQuad(signs, idx, gx - 0.95, g + 5.2, gz, -Math.PI / 2, 2.6, 1.3);
    colliders.push({ x: gx, z: gz - 4.2, r: 1.7 }, { x: gx, z: gz + 4.2, r: 1.7 });
  }

  // ----- boundary stones for every district (official taxonomy only) -----
  for (const [key, terrId] of Object.entries(DISTRICT_OF)) {
    if (key === 'cms|Getting Started') continue; // the gate carries it
    const s = sectionByKey.get(key);
    const tr = TER[terrId];
    if (!s || !tr) continue;
    const toward = Math.atan2(-tr.x, -tr.z); // rough bearing back toward the harbor
    const bx = tr.x + Math.sin(toward) * tr.r * 0.86, bz = tr.z + Math.cos(toward) * tr.r * 0.86;
    const g = terrainHeight(bx, bz);
    stone.add(new THREE.BoxGeometry(2.5, 0.4, 0.8), mat4(bx, g + 0.12, bz, toward + Math.PI), 0x8B8068, 0.1, STONE_UV);
    stone.add(new THREE.BoxGeometry(2.3, 1.7, 0.5), mat4(bx, g + 0.85, bz, toward + Math.PI), 0x94886F, 0.1, STONE_UV);
    const idx = drawSign(atlas, 'stone', s.name, `${s.count} ${s.count === 1 ? 'page' : 'pages'}`);
    signQuad(signs, idx, bx + Math.sin(toward + Math.PI) * 0.28, g + 1.05, bz + Math.cos(toward + Math.PI) * 0.28, toward + Math.PI, 2.1, 1.05);
  }

  // ----- the pier: narrow planks laid across, worn edges, posts and caps -----
  {
    const y = PIER.deck;
    for (let px = PIER.x0; px < PIER.x1; px += 0.62) {
      const j = hash01('pk' + px.toFixed(2));
      wood.add(new THREE.BoxGeometry(0.55, 0.11, 6.4),
        mat4(px + 0.28, y - 0.01 + (j - 0.5) * 0.02, 0, (j - 0.5) * 0.014),
        0xC2A87F, 0.3);
    }
    // rim joists under the deck edges
    wood.add(new THREE.BoxGeometry(PIER.x1 - PIER.x0, 0.2, 0.24), mat4((PIER.x0 + PIER.x1) / 2, y - 0.14, -3.15), 0x5d4028, 0.1);
    wood.add(new THREE.BoxGeometry(PIER.x1 - PIER.x0, 0.2, 0.24), mat4((PIER.x0 + PIER.x1) / 2, y - 0.14, 3.15), 0x5d4028, 0.1);
    for (let px = PIER.x0 + 2; px < PIER.x1; px += 8) {
      wood.add(new THREE.CylinderGeometry(0.17, 0.2, 4.4, 6), mat4(px, y - 1.6, -3.1), 0x5d4028, 0.15);
      wood.add(new THREE.CylinderGeometry(0.17, 0.2, 4.4, 6), mat4(px, y - 1.6, 3.1), 0x5d4028, 0.15);
      wood.add(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 6), mat4(px, y + 0.62, -3.1), 0x4c3320, 0.1);
      wood.add(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 6), mat4(px, y + 0.62, 3.1), 0x4c3320, 0.1);
    }
  }

  // ----- the Crossing: one stone bridge over the ravine -----
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
      // coping stones along both parapets
      const cop = new THREE.BoxGeometry((x1 - x0) * 0.86, 0.14, 0.55); cop.rotateZ(ang);
      stone.add(cop, mat4(xm, ym + 1.0, BRIDGE.z0 + 0.2), 0xA79A80, 0.1, STONE_UV);
      const cop2 = new THREE.BoxGeometry((x1 - x0) * 0.86, 0.14, 0.55); cop2.rotateZ(ang);
      stone.add(cop2, mat4(xm, ym + 1.0, BRIDGE.z1 - 0.2), 0xA79A80, 0.1, STONE_UV);
    }
    // arch piers with cutwaters
    stone.add(new THREE.BoxGeometry(2.2, 9, 7.2), mat4(191, BRIDGE.deck - 4.6, -28), 0x8E8270, 0.05, STONE_UV);
    stone.add(new THREE.BoxGeometry(2.2, 9, 7.2), mat4(201, BRIDGE.deck - 4.6, -28), 0x8E8270, 0.05, STONE_UV);
    stone.add(new THREE.BoxGeometry(1.7, 8.2, 1.7), mat4(191, BRIDGE.deck - 5.1, -32.1, Math.PI / 4), 0x877B67, 0.05, STONE_UV);
    stone.add(new THREE.BoxGeometry(1.7, 8.2, 1.7), mat4(201, BRIDGE.deck - 5.1, -23.9, Math.PI / 4), 0x877B67, 0.05, STONE_UV);
    const bc = '/cms/migration/v4-to-v5/breaking-changes';
    const arrive = inbound[bc] || 0, leave = data.outbound[bc] || 0;
    const idx = drawSign(atlas, 'stone', 'The Crossing', `${arrive} roads arrive · ${leave} leave · re-mortared ${provenance[bc].last}`);
    signQuad(signs, idx, BRIDGE.x0 - 0.8, bridgeDeckAt(BRIDGE.x0) + 1.55, BRIDGE.z1 - 0.2, -Math.PI / 2, 2.2, 1.1);
  }

  // ----- the harbor stairs to the Cloud quarters -----
  {
    const steps = 10, x0 = -11, z0 = 30, z1 = 46, h0 = terrainHeight(x0, z0), h1 = terrainHeight(-12, z1);
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const z = z0 + t * (z1 - z0), h = h0 + t * (h1 - h0);
      stone.add(new THREE.BoxGeometry(4.6, 0.5, (z1 - z0) / steps + 0.3), mat4(x0, h + 0.1, z), 0x9E8E74, 0.08, STONE_UV);
    }
    // low flanking walls
    stone.add(new THREE.BoxGeometry(0.5, 0.9, z1 - z0 + 1), mat4(x0 - 2.5, (h0 + h1) / 2 + 0.4, (z0 + z1) / 2), 0x93876D, 0.07, STONE_UV);
    stone.add(new THREE.BoxGeometry(0.5, 0.9, z1 - z0 + 1), mat4(x0 + 2.5, (h0 + h1) / 2 + 0.4, (z0 + z1) / 2), 0x93876D, 0.07, STONE_UV);
    const idx = drawSign(atlas, 'stone', 'The Cloud quarters', `${stats.crossEdges} crossings between town and Cloud`);
    signQuad(signs, idx, x0 + 2.6, h0 + 1.5, z0 + 1, Math.PI / 2, 2.0, 1.0);
  }

  // ----- the Golden Shore -----
  const beam = buildLighthouse(stone, walls, wood, scene);

  // ----- colonnade of the Content APIs -----
  {
    const tr = TER.apis;
    const colGeo = new THREE.CylinderGeometry(0.42, 0.5, 4.6, 9);
    const capGeo = new THREE.BoxGeometry(1.15, 0.22, 1.15);
    const baseGeo = new THREE.BoxGeometry(1.2, 0.3, 1.2);
    const lintel = new THREE.BoxGeometry(7.6, 0.55, 1.0);
    const soffit = new THREE.BoxGeometry(7.6, 0.1, 0.7);
    for (let i = 0; i < 6; i++) {
      const cx = tr.x - 21 + i * 7.2, cz = tr.z - 12;
      for (const zz of [cz, cz + 20]) {
        const g0 = terrainHeight(cx, zz);
        stone.add(baseGeo.clone(), mat4(cx, g0 + 0.15, zz), 0x9C8B6D, 0.06, STONE_UV);
        stone.add(colGeo.clone(), mat4(cx, g0 + 2.3, zz), 0xA89675, 0.06, STONE_UV);
        stone.add(capGeo.clone(), mat4(cx, g0 + 4.62, zz), 0x9C8B6D, 0.06, STONE_UV);
      }
      if (i > 0) {
        const px = cx - 3.6;
        for (const zz of [cz, cz + 20]) {
          const gy = terrainHeight(px, zz);
          stone.add(lintel.clone(), mat4(px, gy + 4.95, zz), 0xA89675, 0.06, STONE_UV);
          stone.add(soffit.clone(), mat4(px, gy + 4.64, zz), 0x776A55, 0.05, STONE_UV);
        }
      }
      colliders.push({ x: cx, z: cz, r: 0.7 }, { x: cx, z: cz + 20, r: 0.7 });
    }
  }

  // ----- banners: still poles, live cloth -----
  buildBanners(scene, wood);

  // ----- footpaths: the citation graph underfoot -----
  buildPaths(scene, data, bySlug, maps);

  // ----- materials and meshes: nothing near the paths stays flat -----
  const wallsMesh = walls.build(new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 1.0,
    map: cloneTex(maps.plasterMap), roughnessMap: cloneTex(maps.plasterRough),
    normalMap: cloneTex(maps.plasterNormal), normalScale: new THREE.Vector2(0.8, 0.8),
  }));
  const stoneMesh = stone.build(new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 1.0,
    map: cloneTex(maps.stoneMap), roughnessMap: cloneTex(maps.stoneRough2),
    normalMap: cloneTex(maps.stoneNormal), normalScale: new THREE.Vector2(1.0, 1.0),
  }));
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
  const signMesh = signs.build(new THREE.MeshStandardMaterial({ map: atlasTex, roughness: 0.85, side: THREE.DoubleSide }), false);
  scene.add(wallsMesh, stoneMesh, woodMesh, doorMesh, winMesh, signMesh);

  // ----- the instanced terracotta rows -----
  buildTileMesh(scene, tileRows, maps);

  // ----- lanterns -----
  const lanterns = buildLanterns(scene, stations, tendedSet, stats.lastDate);

  return { stations, bySlug, colliders, lanterns, beam };
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
  const c = new THREE.Color(), base = new THREE.Color(0xB4674A);
  tileRows.forEach((r, i) => {
    p.set(r.x, r.y, r.z);
    s.set(r.len, r.ridge ? 1.35 : 1, r.ridge ? 1.35 : 1);
    m.compose(p, r.quat, s);
    mesh.setMatrixAt(i, m);
    c.copy(base).offsetHSL(r.tone * 0.045, r.tone * 0.10, r.tone * 0.10);
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

function buildPaths(scene, data, bySlug, maps) {
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
    ribbon(arrays[cls], pts, PATH_STYLE[cls]);
  }
  // the coast road, in sidebar order: cobbles from the pier to the Golden Shore
  const RD = { ...PATH_STYLE.cobble, w: 2.5 };
  ribbon(arrays.cobble, [[-86, 0], [-48, 0], [-34, 0], [-8, 0], [6, 0]], RD);
  ribbon(arrays.cobble, [[-8, 2], [14, 8], [32, 20], [52, 34]], RD);
  ribbon(arrays.cobble, [[52, 34], [74, 32], [100, 26], [114, 10], [126, -6], [148, 0], [168, 6], [177, -5], [184, -14], [BRIDGE.x0 - 2, -28]], RD);
  ribbon(arrays.cobble, [[BRIDGE.x1 + 2, -28], [213, -36], [224, -54], [234, -66]], RD);
  const DT = PATH_STYLE.dirt;
  ribbon(arrays.dirt, [[-4, -6], [14, -16], [34, -26], [56, -32], [84, -34]], DT);
  ribbon(arrays.dirt, [[84, -34], [120, -40], [156, -44]], DT);
  ribbon(arrays.dirt, [[84, -34], [70, -20], [66, -4]], DT);
  ribbon(arrays.dirt, [[-11, 32], [-11, 46], [-16, 52], [-30, 64]], DT);
  ribbon(arrays.dirt, [[-16, 52], [4, 64], [18, 76]], DT);
  ribbon(arrays.dirt, [[4, 64], [-6, 82]], DT);
  ribbon(arrays.dirt, [[4, 64], [30, 58]], DT);

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
  // cages
  const cage = new THREE.BoxGeometry(0.22, 0.32, 0.22);
  {
    const arm = new THREE.BoxGeometry(0.05, 0.05, 0.5);
    arm.translate(0, 0.2, -0.28);
    const merged = new THREE.BufferGeometry();
    const a = cage.toNonIndexed(), b = arm.toNonIndexed();
    const pn = new Float32Array((a.attributes.position.count + b.attributes.position.count) * 3);
    pn.set(a.attributes.position.array, 0); pn.set(b.attributes.position.array, a.attributes.position.count * 3);
    merged.setAttribute('position', new THREE.BufferAttribute(pn, 3));
    const nn = new Float32Array(pn.length);
    nn.set(a.attributes.normal.array, 0); nn.set(b.attributes.normal.array, a.attributes.normal.count * 3);
    merged.setAttribute('normal', new THREE.BufferAttribute(nn, 3));
    cage.dispose();
    var cageGeo = merged;
  }
  const cageMat = new THREE.MeshStandardMaterial({ color: 0x2e2a24, roughness: 0.6, metalness: 0.4 });
  const cages = new THREE.InstancedMesh(cageGeo, cageMat, n);
  const m = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    const st = stations[i]; st.lanternIndex = i;
    m.setPosition(st.lx, st.ly, st.lz);
    cages.setMatrixAt(i, m);
  }
  scene.add(cages);
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
  function refresh(i) {
    const st = stations[i];
    const tended = tendedSet.has(st.slug);
    const b = lanternBrightness(st, refDate, tended);
    const base = tended ? tendedC : (st.night > 0 ? smoked : warm);
    posArr[i * 3] = st.lx; posArr[i * 3 + 1] = st.ly; posArr[i * 3 + 2] = st.lz;
    colArr[i * 3] = base.r * b; colArr[i * 3 + 1] = base.g * b; colArr[i * 3 + 2] = base.b * b;
    sizeArr[i] = (st.night > 0 ? 2.2 : 2.7) * (0.7 + b * 0.55) * (tended ? 1.18 : 1);
    st.brightness = b;
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
