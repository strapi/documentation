// The six ways home from the Golden Shore.
//
// The lab's portal network was fixed when there were seven highlights, and
// this coast was founded after it. Six of the seven now hold a crossing that
// points here; this file is the other half of the bargain, and it is built in
// this world's own idiom, which is a walked coast. There is no list, no menu
// and no floating panel of destinations. There are six THINGS, standing on
// ground you reach on foot, each of them the sort of thing a working coast
// actually puts down where a way leaves:
//
//   the fingerpost at the head of the coast path   -> The Long Way Through
//   the milestone on the road out of town          -> Pixel Docs City
//   the loan crate roped shut on the quay          -> The Herbarium
//   the lit window of the night-sighting hut       -> FIRST LIGHT
//   the chart-boat lying at her mooring            -> Carta Strapiana
//   the newsstand on the promenade                 -> The Four-Color
//
// Every one of them is lettered, and you read the lettering from where you
// stand, before anything asks you anything. Coming close raises the same label
// the lanterns raise, in the same place, in the same words. E does not take
// you anywhere: E asks, and the asking is the network's own law, kept here in
// this coast's voice - YES and NO as real controls, reachable by mouse and by
// Tab, Y to go, N or Escape to stay, Enter for whichever control has the
// focus, and nothing at all on a stray press.
//
// Cost: the draw-call ceiling this build already lives under is a law and not
// a preference, so the six ways are built to be paid for only when they are
// looked at. Everything - the timber, the masonry, the paint, the rope and all
// eight lettered faces - shares ONE atlas and ONE material, and each waymark
// is merged into a mesh of its own, so the frustum culls the five you are not
// standing in front of. Nothing here casts a shadow and nothing here is drawn
// into the water.

import * as THREE from 'three';
import { groundAt, PIER } from './terrain.js';
import { sharedMaps, noReflect, addRim } from './world.js';

// ---------- a merge bucket, the town's own, kept local ----------
class Bucket {
  constructor() { this.pos = []; this.nor = []; this.uv = []; this.col = []; }
  // cell is an index into the shared atlas: the geometry's own 0..1 UVs are
  // squeezed into that cell, which is how one material can carry oak, cut
  // limestone, kiosk paint, hemp and eight painted boards at the same time.
  add(geo, matrix, color, cell) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (matrix) g.applyMatrix4(matrix);
    const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
    const c = new THREE.Color(color);
    const R = cellUV(cell == null ? 0 : cell);
    for (let i = 0; i < p.count; i++) {
      this.pos.push(p.getX(i), p.getY(i), p.getZ(i));
      this.nor.push(n.getX(i), n.getY(i), n.getZ(i));
      const uu = u ? u.getX(i) : 0.5, vv = u ? u.getY(i) : 0.5;
      this.uv.push(R.u0 + Math.min(Math.max(uu, 0), 1) * (R.u1 - R.u0),
                   R.v0 + Math.min(Math.max(vv, 0), 1) * (R.v1 - R.v0));
      this.col.push(c.r, c.g, c.b);
    }
    if (g !== geo) g.dispose();
  }
  get empty() { return this.pos.length === 0; }
  build(material) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = false; mesh.receiveShadow = true;
    return mesh;
  }
}

function mat4(x, y, z, ry = 0, rx = 0, rz = 0) {
  const m = new THREE.Matrix4();
  m.compose(new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')),
    new THREE.Vector3(1, 1, 1));
  return m;
}
// local frame -> world, the same convention the town's houses use
function l2w(x, z, yaw, lx, lz) {
  return [x + lx * Math.cos(yaw) + lz * Math.sin(yaw), z - lx * Math.sin(yaw) + lz * Math.cos(yaw)];
}

// ---------- the lettering ----------
// One atlas, six faces plus two small plates. Painted the way the coast's own
// signs are painted: limewashed board, a hand-cut serif, a shadowed cut.
const AW = 1024, AH = 512, CW = 256, CH = 128, COLS = AW / CW;
const FONT = '"Gill Sans", "Avenir Next", "Segoe UI", system-ui, sans-serif';
// half a texel in, so no face ever bleeds its neighbour's paint at a mip
function cellUV(i) {
  const x = (i % COLS) * CW, y = Math.floor(i / COLS) * CH;
  return { u0: (x + 0.5) / AW, v0: 1 - (y + CH - 0.5) / AH, u1: (x + CW - 0.5) / AW, v1: 1 - (y + 0.5) / AH };
}
// the material swatches, painted into the same atlas as the lettering
const SW = {};
function paintSwatches(atlas) {
  const ctx = atlas.ctx;
  const cell = (name) => {
    const i = atlas.next++;
    SW[name] = i;
    return { i, x: (i % COLS) * CW, y: Math.floor(i / COLS) * CH };
  };
  const grain = (o, base, dark, rows) => {
    ctx.save(); ctx.translate(o.x, o.y);
    ctx.fillStyle = base; ctx.fillRect(0, 0, CW, CH);
    for (let k = 0; k < rows; k++) {
      ctx.globalAlpha = 0.18 + Math.random() * 0.2;
      ctx.fillStyle = dark;
      ctx.fillRect(0, k * (CH / rows) + Math.sin(k * 2.1) * 2, CW, 1.2 + Math.random() * 2.2);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  };
  const speck = (o, base, a, b, n) => {
    ctx.save(); ctx.translate(o.x, o.y);
    ctx.fillStyle = base; ctx.fillRect(0, 0, CW, CH);
    ctx.globalAlpha = 0.2;
    for (let k = 0; k < n; k++) { ctx.fillStyle = Math.random() > 0.5 ? a : b; ctx.fillRect(Math.random() * CW, Math.random() * CH, 3, 3); }
    ctx.globalAlpha = 1;
    ctx.restore();
  };
  grain(cell('oak'), '#c9c1b4', '#9a9184', 26);        // sawn oak, gone silver
  grain(cell('deal'), '#dcd4c4', '#b6ae9d', 20);       // pale crate boards
  speck(cell('stone'), '#cfc7b4', '#b4ab97', '#e2dac7', 200); // cut limestone
  speck(cell('paint'), '#d8d4cc', '#c2beb6', '#eae6de', 90);  // painted board
  grain(cell('hemp'), '#e2dac6', '#c6bda6', 14);       // rope, canvas, sailcloth
  grain(cell('tar'), '#b8afa2', '#8e8578', 32);        // tarred boat timber
  speck(cell('iron'), '#b3b0aa', '#9b9892', '#c6c3bc', 60);   // iron and slate
  /* the spinner rack's faces: four little covers, off register the way the
     printing house they came from prints everything */
  {
    const o = cell('comics');
    ctx.save(); ctx.translate(o.x, o.y);
    ctx.fillStyle = '#2a2620'; ctx.fillRect(0, 0, CW, CH);
    const inks = [['#d94a3c', '#f2c400'], ['#0f9bd7', '#e0347c'], ['#f2c400', '#0f9bd7'], ['#e0347c', '#3f8f4a']];
    for (let k = 0; k < 4; k++) {
      const cxx = 8 + (k % 2) * 124, cyy = 6 + Math.floor(k / 2) * 60;
      ctx.fillStyle = '#efe7d2'; ctx.fillRect(cxx, cyy, 114, 54);
      ctx.fillStyle = inks[k][0]; ctx.fillRect(cxx + 3, cyy + 3, 108, 22);
      ctx.fillStyle = inks[k][1]; ctx.globalAlpha = 0.75;
      ctx.fillRect(cxx + 6, cyy + 6, 102, 22);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#2a2620';
      for (let r = 0; r < 4; r++) ctx.fillRect(cxx + 8, cyy + 30 + r * 5, 60 + ((k * 17 + r * 29) % 40), 2.4);
      ctx.strokeStyle = '#2a2620'; ctx.lineWidth = 2; ctx.strokeRect(cxx, cyy, 114, 54);
    }
    ctx.restore();
  }
}

function wrapText(ctx, text, maxW) {
  const words = String(text).split(' '); const lines = []; let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function makeSignAtlas() {
  const c = document.createElement('canvas'); c.width = AW; c.height = AH;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#6b4a2e'; ctx.fillRect(0, 0, AW, AH);
  const atlas = { canvas: c, ctx, next: 0 };
  paintSwatches(atlas);
  return atlas;
}

// kind: 'oak' (dark board, pale letters), 'lime' (limewashed board, dark
// letters), 'stone' (cut into the face), 'stencil' (crate side), 'card'
// (a written card behind glass)
function paintSign(atlas, kind, title, sub) {
  const i = atlas.next++;
  const x = (i % COLS) * CW, y = Math.floor(i / COLS) * CH;
  const ctx = atlas.ctx;
  ctx.save(); ctx.translate(x, y);
  let ink = '#3a2f22', hi = 'rgba(240,232,212,0.75)';
  if (kind === 'oak') {
    ctx.fillStyle = '#4a331f'; ctx.fillRect(0, 0, CW, CH);
    ctx.globalAlpha = 0.3;
    for (let k = 0; k < 26; k++) { ctx.fillStyle = k % 2 ? '#3c2917' : '#57402a'; ctx.fillRect(0, k * 5 + Math.sin(k * 1.7) * 2, CW, 2.6); }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(28,18,9,0.8)'; ctx.lineWidth = 6; ctx.strokeRect(3, 3, CW - 6, CH - 6);
    ink = '#f0dcb6'; hi = 'rgba(26,16,7,0.7)';
  } else if (kind === 'stone') {
    ctx.fillStyle = '#a89a7c'; ctx.fillRect(0, 0, CW, CH);
    ctx.globalAlpha = 0.18;
    for (let k = 0; k < 190; k++) { ctx.fillStyle = Math.random() > 0.5 ? '#8f8266' : '#bcae90'; ctx.fillRect(Math.random() * CW, Math.random() * CH, 3, 3); }
    ctx.globalAlpha = 1;
    ink = '#4a3f2c'; hi = 'rgba(240,232,212,0.85)';
  } else if (kind === 'stencil') {
    ctx.fillStyle = '#9d7f52'; ctx.fillRect(0, 0, CW, CH);
    ctx.globalAlpha = 0.26;
    for (let k = 0; k < 5; k++) { ctx.fillStyle = k % 2 ? '#8a6d43' : '#ab8d5f'; ctx.fillRect(0, k * 26, CW, 22); }
    ctx.globalAlpha = 1;
    ink = '#33291a'; hi = 'rgba(0,0,0,0)';
  } else if (kind === 'card') {
    ctx.fillStyle = '#efe4c8'; ctx.fillRect(0, 0, CW, CH);
    ctx.strokeStyle = 'rgba(70,58,40,0.5)'; ctx.lineWidth = 3; ctx.strokeRect(6, 6, CW - 12, CH - 12);
    ink = '#3d332a'; hi = 'rgba(255,255,255,0.6)';
  } else { // lime
    ctx.fillStyle = '#e6dcc0'; ctx.fillRect(0, 0, CW, CH);
    ctx.globalAlpha = 0.12;
    for (let k = 0; k < 150; k++) { ctx.fillStyle = Math.random() > 0.5 ? '#d5c9a6' : '#f2ead3'; ctx.fillRect(Math.random() * CW, Math.random() * CH, 3, 3); }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(90,72,44,0.55)'; ctx.lineWidth = 4; ctx.strokeRect(5, 5, CW - 10, CH - 10);
    ink = '#3c3123'; hi = 'rgba(255,252,240,0.7)';
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `600 ${kind === 'stencil' ? 27 : 29}px ${FONT}`;
  let lines = wrapText(ctx, title, CW - 24);
  if (lines.length > 2) { ctx.font = `600 22px ${FONT}`; lines = wrapText(ctx, title, CW - 20); }
  lines = lines.slice(0, 2);
  const lh = 32;
  const y0 = (sub ? 48 : 62) - (lines.length * lh) / 2 + lh / 2;
  lines.forEach((ln, k) => {
    ctx.fillStyle = hi; ctx.fillText(ln, CW / 2 + 1.4, y0 + k * lh + 1.4);
    ctx.fillStyle = ink; ctx.fillText(ln, CW / 2, y0 + k * lh);
  });
  if (sub) {
    ctx.font = `500 14px ${FONT}`;
    const sl = wrapText(ctx, sub, CW - 26).slice(0, 3);
    sl.forEach((ln, k) => {
      ctx.fillStyle = hi; ctx.fillText(ln, CW / 2 + 1, 90 + k * 17 + 1);
      ctx.fillStyle = ink; ctx.fillText(ln, CW / 2, 90 + k * 17);
    });
  }
  ctx.restore();
  return i;
}

function signQuad(bucket, i, x, y, z, ry, w, h, rx = 0) {
  const geo = new THREE.PlaneGeometry(w, h);
  bucket.add(geo, mat4(x, y, z, ry, rx), 0xffffff, i);
  geo.dispose();
}

// ---------- the build ----------
export function buildCrossings(scene, data) {
  const maps = sharedMaps();
  void maps;
  const colliders = [];
  const waymarks = [];
  const meshes = [];
  const atlas = makeSignAtlas();

  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const pages = data.stats.pageCount;
  const edges = fmt(data.stats.edgeCount);

  // one material for the lot: the atlas carries the paint and the lettering,
  // the vertex colour carries the hue, and every waymark is its own mesh so
  // the frustum can throw away the ones you are not looking at
  const atlasTex = new THREE.CanvasTexture(atlas.canvas);
  atlasTex.colorSpace = THREE.SRGBColorSpace;
  atlasTex.anisotropy = 4;
  const MAT = new THREE.MeshStandardMaterial({
    map: atlasTex, vertexColors: true, roughness: 0.9, side: THREE.FrontSide,
  });
  addRim(MAT, 0.34);
  /* the one lamp on this coast that is not a lantern. It is unlit geometry
     and it is taken out of the tone mapping, because at golden hour a wall in
     full sun is bright, and a window has to be brighter than the wall or it
     is just a pale panel. */
  const LITMAT = new THREE.MeshBasicMaterial({
    vertexColors: true, side: THREE.DoubleSide, fog: true, toneMapped: false,
  });

  let B = null;
  const box = (w, h, d, x, y, z, ry, col, cell) =>
    B.add(new THREE.BoxGeometry(w, h, d), mat4(x, y, z, ry), col, cell);
  const cyl = (r0, r1, h, x, y, z, ry, col, cell, rx = 0, seg = 7) =>
    B.add(new THREE.CylinderGeometry(r0, r1, h, seg), mat4(x, y, z, ry, rx), col, cell);
  const finish = (wm) => {
    const mesh = B.build(MAT);
    noReflect(mesh);
    scene.add(mesh);
    meshes.push(mesh);
    waymarks.push(wm);
    B = null;
  };

  // ============================================================ 1. FINGERPOST
  // At the head of the coast path, on the cape where the cliff road tops out
  // and the made ground stops. Two arms: the near one names the cape you are
  // standing on, the far one names where the path goes if you keep walking.
  {
    B = new Bucket();
    const x = 236, z = -61, yaw = -0.55;
    const g = groundAt(x, z);
    cyl(0.085, 0.10, 3.0, x, g + 1.5, z, 0, 0x8a6a42, SW.oak);
    box(0.30, 0.10, 0.30, x, g + 3.0, z, 0.6, 0x7a5c39, SW.oak);   // the cap, set askew
    /* the arms stand clear of the post, or the post eats the first letter */
    const [ax, az] = l2w(x, z, yaw, 0.95, 0);
    const [bx, bz] = l2w(x, z, yaw, -0.78, 0);
    const i1 = paintSign(atlas, 'oak', 'THE INLAND WAY',
      `${pages} pages walked end to end · dusk the whole way`);
    const i2 = paintSign(atlas, 'oak', 'THE LAMP ROOM', 'this cape · four hundred paces');
    box(1.56, 0.80, 0.05, ax - Math.sin(yaw) * 0.045, g + 2.62, az - Math.cos(yaw) * 0.045, yaw, 0x5c4128, SW.oak);
    box(1.16, 0.60, 0.05, bx + Math.sin(yaw) * 0.045, g + 2.10, bz + Math.cos(yaw) * 0.045, yaw, 0x5c4128, SW.oak);
    signQuad(B, i1, ax, g + 2.62, az, yaw, 1.5, 0.75);
    signQuad(B, i2, bx, g + 2.10, bz, yaw + Math.PI, 1.1, 0.55);
    // the little cairn a walker adds a stone to: a heap, laid on the ground it
    // stands on and not a column hung in the air
    {
      const cx0 = x + 1.5, cz0 = z + 0.9;
      const cg = groundAt(cx0, cz0);
      const ring = (n, rad, yy, sz) => {
        for (let k = 0; k < n; k++) {
          const a = k * (Math.PI * 2 / n) + rad;
          B.add(new THREE.DodecahedronGeometry(sz),
            mat4(cx0 + Math.cos(a) * rad, cg + yy, cz0 + Math.sin(a) * rad, a), 0xa79a80, SW.stone);
        }
      };
      ring(5, 0.30, 0.13, 0.15);
      ring(3, 0.17, 0.32, 0.12);
      B.add(new THREE.DodecahedronGeometry(0.10), mat4(cx0, cg + 0.46, cz0, 0.7), 0xb3a68b, SW.stone);
    }
    colliders.push({ x, z, r: 0.55 });
    finish({
      key: 'longway', dir: '../longway/', x, z, yaw,
      title: 'The coast path fingerpost',
      inscription: `THE LONG WAY THROUGH · ${pages} pages walked end to end, dusk the whole way`,
      read: 'The far arm is lettered for a trail, not a village: the same pages this coast lights, laid out as one walk in the failing light. Somebody keeps the paint fresh.',
      ask: 'The coast path leaves this cape for a whole other world, walked at dusk from end to end. Take it?',
    });
  }

  // ============================================================= 2. MILESTONE
  // On the road out of town, past the last house, where the coast road turns
  // north. A cut stone with the distance on it, the way a road stone is cut.
  {
    B = new Bucket();
    /* in the gateway at the head of the shore road, where the town's made
       ground stops and nothing grows, facing the walker coming up out of it */
    const x = -26, z = 42, yaw = Math.PI;
    const g = groundAt(x, z);
    box(0.30, 0.34, 0.72, x, g + 0.10, z, yaw, 0x9c8f76, SW.stone);   // the kerb it is set into
    box(0.66, 1.42, 0.36, x, g + 0.71, z, yaw, 0xb8ab90, SW.stone);
    box(0.76, 0.18, 0.46, x, g + 1.45, z, yaw, 0xa89b80, SW.stone);   // the weathered cap
    const [fx, fz] = l2w(x, z, yaw, 0, 0.19);
    const i = paintSign(atlas, 'stone', 'UP THE COAST',
      `one day's walk up the coast · ${pages} lit windows, one for every page`);
    signQuad(B, i, fx, g + 0.82, fz, yaw, 0.60, 0.92);
    colliders.push({ x, z, r: 0.55 });
    finish({
      key: 'pixelcity', dir: '../pixelcity/', x, z, yaw,
      title: 'The milestone on the coast road',
      inscription: `PIXEL DOCS CITY · one day's walk up the coast · ${pages} lit windows, one for every page`,
      read: 'Set into the kerb where the town\'s made ground stops. The stone is honest about the distance and honest about the city: the same pages this coast keeps in lanterns are kept up there in windows instead, and the road under your boots goes all the way.',
      ask: 'The coast road runs a day up the shore to a whole other world, a town made of these same pages. Walk it?',
    });
  }

  // ============================================================ 3. LOAN CRATE
  // On the quay boards, roped shut, stencilled, waiting for the packet. The
  // coast lends its own pressed plants out the way it borrows them.
  {
    B = new Bucket();
    /* (2026-09-07, owner) OFF THE ARRIVAL JETTY. It stood on the pier boards at
       x=-60, eighteen metres from where a visitor lands and squarely in the
       first thing he sees: "celui-ci est litteralement sur le ponton d'arrivee".
       A crossing that meets you is not an easter egg. It goes behind the north
       edge of the town instead, where a crate waiting on carriage would actually
       stand, sixty-nine metres from the landing and off every through line.
       Measured clear: 4.3 m to the nearest collider, ground at 3.07. */
    const x = -14, z = 26, yaw = 1.35;
    const g = groundAt(x, z);
    box(1.05, 0.72, 0.74, x, g + 0.36, z, yaw, 0xa98a5e, SW.deal);
    box(1.10, 0.06, 0.79, x, g + 0.74, z, yaw, 0x94764c, SW.deal);   // the lid batten
    for (const off of [-0.26, 0.26]) {
      const [rx1, rz1] = l2w(x, z, yaw, off, 0);
      box(0.055, 0.76, 0.055, rx1, g + 0.38, rz1, yaw, 0xd9c79c, SW.hemp);
      box(0.055, 0.055, 0.80, rx1, g + 0.74, rz1, yaw, 0xd9c79c, SW.hemp);
    }
    const [sx, sz] = l2w(x, z, yaw, 0, 0.375);
    const i = paintSign(atlas, 'stencil', 'ON EXCHANGE',
      'pressed on this coast · carriage paid · dry side up');
    signQuad(B, i, sx, g + 0.40, sz, yaw, 0.92, 0.46);
    colliders.push({ x, z, r: 0.72 });
    finish({
      key: 'herbarium', dir: '../herbarium/', x, z, yaw,
      /* the quay is six metres wide: a long look at the crate is taken from
         up the boards, not from out on the water */
      farStand: [-24, 26, Math.PI / 2],
      title: 'The loan crate on the quay',
      inscription: 'ON EXCHANGE · pressed on this coast · carriage paid · dry side up',
      read: 'Sheets cut on the cliff road at the last hour, dry on the stem before they were ever picked, going out on exchange to a cabinet that keeps the whole documentation as pressed plants. It is roped, and the packet is due.',
      ask: 'This crate goes back to a whole other world, a cabinet that keeps these same pages as pressed plants. Go with it?',
    });
  }

  // ====================================================== 4. THE LIT WINDOW
  // A night-sighting hut on the pine ridge, its shutter hooked back, its lamp
  // lit before dark. Whoever works in here reads the same pages as a sky.
  {
    B = new Bucket();
    const x = 135, z = 19, yaw = -1.9;
    const g = groundAt(x, z);
    box(2.5, 0.28, 2.1, x, g + 0.14, z, yaw, 0xa1947a, SW.stone);     // the levelling plinth
    box(2.2, 2.05, 1.8, x, g + 1.30, z, yaw, 0xb0a386, SW.stone);     // the hut
    box(2.62, 0.20, 2.24, x, g + 2.38, z, yaw, 0x7a5c39, SW.oak);     // the flat roof and its eave
    const [dx2, dz2] = l2w(x, z, yaw, -1.11, 0);
    box(0.06, 1.72, 0.78, dx2, g + 1.14, dz2, yaw, 0x6d5230, SW.oak);  // the plank door, in the gable end
    box(0.09, 0.09, 0.09, dx2, g + 1.10, dz2 + 0.30, yaw, 0x8c8a80, SW.iron);
    const [wx, wz] = l2w(x, z, yaw, 0, 0.91);
    box(0.86, 0.74, 0.06, wx, g + 1.52, wz, yaw, 0x968a70, SW.stone); // the reveal
    const [hx, hz] = l2w(x, z, yaw, 0.62, 0.94);
    box(0.06, 0.74, 0.44, hx, g + 1.52, hz, yaw - 0.75, 0x6d5230, SW.oak); // the shutter, hooked back
    const [cx2, cz2] = l2w(x, z, yaw, -0.66, 0.93);
    const i = paintSign(atlas, 'card', 'NIGHT SIGHTING',
      `${pages} bodies on one plate · sighting begins at dark`);
    signQuad(B, i, cx2, g + 1.44, cz2, yaw, 0.52, 0.30);
    // the lamp inside, which is the whole reason you can read the card
    const litB = new Bucket();
    const wq = new THREE.PlaneGeometry(0.72, 0.60);
    litB.add(wq, mat4(wx + Math.sin(yaw) * 0.05, g + 1.52, wz + Math.cos(yaw) * 0.05, yaw), 0xfff0cf, 0);
    wq.dispose();
    const litMesh = litB.build(LITMAT);
    noReflect(litMesh);
    scene.add(litMesh);
    meshes.push(litMesh);
    colliders.push({ x, z, r: 1.5 });
    finish({
      key: 'firstlight', dir: '../firstlight/', x, z, yaw,
      title: 'The night-sighting hut',
      inscription: `NIGHT SIGHTING · ${pages} bodies on one plate · sighting begins at dark`,
      read: 'The shutter is hooked back and the lamp is already burning, because the work in here starts when this coast stops. The card in the window says what they point at: these same pages, read off a plate as a night sky.',
      ask: 'The night shift in here works for a whole other world, these same pages read as a sky. Sit in on it?',
    });
  }

  // ======================================================= 5. THE CHART-BOAT
  // Lying alongside the pier on the south side, her transom lettered, a slate
  // hung on her bollard. She works this same coast, drawn as a sea.
  {
    B = new Bucket();
    const bolX = -78, bolZ = -2.55;
    /* freeboard: her rail stands a good half-metre out of the water, or she
       reads as a mast with nothing under it from the pier */
    const hz = -7.6, hy = 0.62;
    cyl(0.13, 0.15, 0.62, bolX, PIER.deck + 0.31, bolZ, 0, 0x7a5c39, SW.oak, 0, 9);
    box(0.34, 0.09, 0.34, bolX, PIER.deck + 0.63, bolZ, 0.3, 0x6d5230, SW.oak);
    /* the slate faces up the pier, at the walker: she lies beyond it, so you
       read where she is bound with her hull in the same view */
    const i = paintSign(atlas, 'lime', 'THE CHART-BOAT',
      `sails on the tide · ${edges} roads run as sea-lanes`);
    box(0.90, 0.48, 0.04, bolX, PIER.deck + 1.00, bolZ + 0.125, 0, 0x5c4128, SW.oak);
    signQuad(B, i, bolX, PIER.deck + 1.00, bolZ + 0.17, 0, 0.86, 0.44);
    // her hull, lying off the boards in the water
    const hull = new THREE.SphereGeometry(1, 16, 9, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const hp = hull.attributes.position;
    for (let k = 0; k < hp.count; k++) {
      hp.setX(k, hp.getX(k) * 1.15);
      hp.setZ(k, hp.getZ(k) * 3.35);
      hp.setY(k, hp.getY(k) * 1.30);
    }
    hull.computeVertexNormals();
    B.add(hull, mat4(bolX, hy, hz, 0.06), 0x7a6042, SW.tar);
    hull.dispose();
    box(2.36, 0.13, 6.9, bolX, hy + 0.02, hz, 0.06, 0x8d6f4a, SW.oak);       // the gunwale
    box(1.5, 0.10, 2.0, bolX, hy + 0.06, hz + 0.4, 0.06, 0x33261a, SW.tar);  // the dark cockpit
    box(0.9, 0.30, 1.5, bolX, hy + 0.22, hz - 1.9, 0.06, 0x7a6042, SW.oak);  // the fore hatch house
    cyl(0.055, 0.075, 6.6, bolX, hy + 3.3, hz - 0.5, 0, 0x9c7c52, SW.oak);   // the mast
    cyl(0.045, 0.05, 3.1, bolX + 0.02, hy + 0.72, hz + 1.15, 0, 0x9c7c52, SW.oak, Math.PI / 2 - 0.10);
    cyl(0.17, 0.20, 2.9, bolX + 0.02, hy + 0.88, hz + 1.15, 0, 0xe4d6b6, SW.hemp, Math.PI / 2 - 0.10, 9); // the sail, furled
    const i2 = paintSign(atlas, 'lime', 'THE CHART-BOAT', 'of this port');
    signQuad(B, i2, bolX, hy + 0.42, hz + 3.42, 0.06, 1.5, 0.42);
    cyl(0.028, 0.028, 5.4, bolX + 0.30, 0.86, (bolZ + hz + 3.3) / 2, 0, 0xd9c79c, SW.hemp, Math.PI / 2 - 0.26);
    colliders.push({ x: bolX, z: bolZ, r: 0.45 });
    finish({
      key: 'cartastrapiana', dir: '../cartastrapiana/', x: bolX, z: bolZ, yaw: 0,
      farStand: [-66, -2.55, Math.PI / 2],
      title: 'The chart-boat at her mooring',
      inscription: `CARTA STRAPIANA · sails on the tide · ${edges} roads run as sea-lanes`,
      read: 'A working boat with an engraver aboard. The slate on her bollard says where she is bound and what she does out there: the roads that cross this coast on foot are the lanes she runs under sail, and every page on it is an island.',
      ask: 'She sails on the tide for a whole other world, this same coast drawn as a sea. Go aboard?',
    });
  }

  // ========================================================= 6. THE NEWSSTAND
  // On the promenade, inside the harbour gate. Painted boards, a spinner rack
  // still out, the shutter half down because it is nearly the end of the day.
  {
    B = new Bucket();
    /* (2026-09-08, owner: "le stand qui mene vers four-color est trop visible")
       It stood at x=-34, z=11, eleven metres off the harbour gate and squarely
       in the arrival's field of view. A newsagent wants footfall, not a stage,
       so it keeps to the town but moves to the quiet side street south of the
       square: seventy-six metres from the landing, out of the gate corridor,
       measured clear for nearly twelve metres around. */
    const x = -8, z = -30, yaw = 0.5;
    const g = groundAt(x, z);
    box(1.9, 2.05, 1.25, x, g + 1.02, z, yaw, 0x6f9c72, SW.paint);        // the kiosk
    box(2.25, 0.12, 1.55, x, g + 2.11, z, yaw, 0x4a6f52, SW.paint);       // the roof
    box(2.05, 0.09, 0.34, l2w(x, z, yaw, 0, 0.74)[0], g + 1.36, l2w(x, z, yaw, 0, 0.74)[1], yaw, 0xa9b58f, SW.paint); // the counter shelf
    const [fx, fz] = l2w(x, z, yaw, 0, 0.635);
    box(1.72, 0.55, 0.06, fx, g + 1.74, fz, yaw, 0x9fb287, SW.paint);     // the shutter, half down
    box(1.74, 0.22, 0.10, fx, g + 1.46, fz, yaw, 0x3d5745, SW.iron);      // its bottom rail
    const [rx, rz] = l2w(x, z, yaw, 1.28, 0.30);
    const rg = groundAt(rx, rz);
    cyl(0.055, 0.06, 1.35, rx, rg + 0.67, rz, 0, 0x8c8a80, SW.iron, 0, 9);
    for (let k = 0; k < 4; k++) {
      const a = yaw + k * Math.PI / 2 + 0.4;
      /* two tiers of four covers on each face, off register as they came */
      signQuad(B, SW.comics, rx + Math.sin(a) * 0.215, rg + 1.10, rz + Math.cos(a) * 0.215, a, 0.46, 0.62);
      signQuad(B, SW.comics, rx + Math.sin(a) * 0.215, rg + 0.46, rz + Math.cos(a) * 0.215, a, 0.46, 0.62);
      box(0.40, 0.66, 0.03, rx + Math.sin(a) * 0.19, rg + 1.10, rz + Math.cos(a) * 0.19, a, 0x8c8a80, SW.iron);
      box(0.40, 0.66, 0.03, rx + Math.sin(a) * 0.19, rg + 0.46, rz + Math.cos(a) * 0.19, a, 0x8c8a80, SW.iron);
    }
    const i = paintSign(atlas, 'lime', 'THIS WEEK\'S ISSUE',
      `this week's issue in · ${pages} pages, printed in four colours`);
    signQuad(B, i, fx, g + 1.06, fz, yaw, 1.55, 0.62);
    colliders.push({ x, z, r: 1.15 }, { x: rx, z: rz, r: 0.4 });
    finish({
      key: 'secreta', dir: '../secreta/', x, z, yaw,
      title: 'The newsstand on the promenade',
      inscription: `THIS WEEK'S ISSUE IN · ${pages} pages, printed in four colours`,
      read: 'The shutter is half down and the rack is still turning. The board says what came in on the packet: the whole documentation as a four-colour comic, off register and unashamed, and the newsagent will hand you one.',
      ask: "The newsagent has this week's issue under the counter — a whole other world, these same pages in four colours. Buy it?",
    });
  }

  atlasTex.needsUpdate = true;
  return { colliders, waymarks, meshes };
}

// ============================================================ the confirm
// The network's law, in this coast's voice. Nothing crosses without a YES.
export function initCrossings(waymarks, hooks) {
  const card = document.getElementById('crosscard');
  const elTitle = document.getElementById('xc-title');
  const elQ = document.getElementById('xc-q');
  const yes = document.getElementById('xc-yes');
  const no = document.getElementById('xc-no');
  const state = { open: null, prev: null, nav: (u) => { location.href = u; } };

  function ask(wm) {
    if (!wm || state.open) return false;
    state.open = wm;
    state.prev = document.activeElement;
    elTitle.textContent = wm.title;
    elQ.textContent = wm.ask;
    card.hidden = false;
    if (hooks && hooks.onOpen) hooks.onOpen();
    // YES carries the focus so a keyboard walker can answer at once; NO is
    // still the safe default, because doing nothing, pressing Escape, or
    // clicking the ground all leave you exactly where you stood.
    requestAnimationFrame(() => { try { yes.focus(); } catch (e) { } });
    return true;
  }
  function close(answered) {
    if (!state.open) return;
    const wm = state.open;
    state.open = null;
    card.hidden = true;
    if (hooks && hooks.onClose) hooks.onClose(answered);
    if (!answered) { try { if (state.prev && state.prev.focus) state.prev.focus(); } catch (e) { } }
    return wm;
  }
  function go() {
    const wm = state.open;
    if (!wm) return;
    close(true);
    state.nav(wm.dir);
  }
  yes.addEventListener('click', go);
  no.addEventListener('click', () => close(false));
  card.addEventListener('mousedown', (e) => { if (e.target === card) close(false); });

  // capture phase: while the card is up the coast hears nothing else
  window.addEventListener('keydown', (e) => {
    if (!state.open) return;
    const k = e.key;
    if (k === 'y' || k === 'Y') { e.preventDefault(); e.stopPropagation(); go(); return; }
    if (k === 'n' || k === 'N' || k === 'Escape') { e.preventDefault(); e.stopPropagation(); close(false); return; }
    if (k === 'Enter') {
      e.preventDefault(); e.stopPropagation();
      if (document.activeElement === no) close(false); else go();
      return;
    }
    /* Space is the likeliest stray press there is on a coast you walk, and a
       focused button takes it as a click by default. It is swallowed here, so
       the only ways through are Y, Enter on the focused YES, and the mouse. */
    if (k === 'Tab') {
      e.preventDefault(); e.stopPropagation();
      (document.activeElement === yes ? no : yes).focus();
      return;
    }
    // every other key is swallowed: nothing on this coast moves behind the card
    e.preventDefault(); e.stopPropagation();
  }, true);

  return {
    ask,
    close: () => close(false),
    isOpen: () => !!state.open,
    current: () => state.open,
    setNav: (fn) => { state.nav = fn; },
    waymarks,
  };
}
