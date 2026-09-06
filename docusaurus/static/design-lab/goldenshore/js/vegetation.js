// Instanced life: cypress rows, three families of olives, wind-phased grass,
// fog-dressed rocks, and the honest god-ray fakery between the trees.

import * as THREE from 'three';
import { terrainHeight, terrainSlope, COAST_X, TERRACES, fbm } from './terrain.js';
import { addWind, WORLD } from './world.js';

function scatter(count, accept) {
  const out = [];
  let guard = count * 40;
  while (out.length < count && guard-- > 0) {
    const x = -60 + Math.random() * 340;
    const z = -200 + Math.random() * 400;
    const p = accept(x, z);
    if (p) out.push(p);
  }
  return out;
}

function nearTerrace(x, z, pad = 0) {
  for (const t of TERRACES) {
    const dx = x - t.x, dz = z - t.z;
    if (dx * dx + dz * dz < (t.r + pad) * (t.r + pad)) return t;
  }
  return null;
}

const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
function fill(mesh, placements) {
  placements.forEach((pl, i) => {
    _p.set(pl.x, pl.y, pl.z);
    _q.setFromEuler(new THREE.Euler(pl.tx || 0, pl.ry || 0, pl.tz || 0));
    _s.set(pl.s, pl.sy || pl.s, pl.s);
    _m.compose(_p, _q, _s);
    mesh.setMatrixAt(i, _m);
    if (pl.c && mesh.instanceColor !== undefined) mesh.setColorAt(i, pl.c);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

export function buildVegetation(scene) {
  // ----- cypress: dark flames flanking the roads, ragged at the edges -----
  const cypressPts = [];
  const rows = [
    [[-30, 6], [4, 6]], [[-30, -6], [4, -6]],
    [[14, 12], [46, 30]], [[58, -34], [110, -46]],
    [[210, -32], [228, -52]],
  ];
  for (const [[x0, z0], [x1, z1]] of rows) {
    const d = Math.hypot(x1 - x0, z1 - z0), n = Math.round(d / 7);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = x0 + (x1 - x0) * t + (Math.random() - 0.5) * 1.4;
      const z = z0 + (z1 - z0) * t + (Math.random() - 0.5) * 1.4;
      cypressPts.push({ x, y: terrainHeight(x, z), z, s: 0.8 + Math.random() * 0.5, ry: Math.random() * 6.28 });
    }
  }
  cypressPts.push(...scatter(60, (x, z) => {
    const h = terrainHeight(x, z);
    if (h < 2.5 || h > 44 || terrainSlope(x, z) > 0.5) return null;
    if (nearTerrace(x, z, -3)) return null;
    return { x, y: h, z, s: 0.7 + Math.random() * 0.7, ry: Math.random() * 6.28 };
  }));
  {
    const geo = new THREE.ConeGeometry(1.05, 7.2, 11, 9);
    geo.translate(0, 3.6, 0);
    {
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i);
        if (py < 7.0 && py > 0.1) {
          const a = Math.atan2(pz, px);
          const k = 1 + (fbm(Math.cos(a) * 2.4 + py * 0.9, Math.sin(a) * 2.4 + 7, 3) - 0.5) * 0.85;
          pos.setX(i, px * k); pos.setZ(i, pz * k);
          pos.setY(i, py + (fbm(px * 5, pz * 5 + 2, 2) - 0.5) * 0.7);
        }
      }
      geo.computeVertexNormals();
    }
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true });
    addWind(mat, 0.05, 'top');
    const mesh = new THREE.InstancedMesh(geo, mat, cypressPts.length);
    mesh.castShadow = true; mesh.receiveShadow = true;
    const base = new THREE.Color(0x46543a);
    fill(mesh, cypressPts.map((p, i) => ({
      ...p,
      c: new THREE.Color().copy(base).offsetHSL((fbm(i * 0.7, 3, 2) - 0.5) * 0.05, (fbm(i, 9, 2) - 0.5) * 0.2, (fbm(i, 17, 2) - 0.5) * 0.12),
    })));
    scene.add(mesh);
  }

  // ----- olives: three silhouettes scattered through the open terraces -----
  const olives = scatter(130, (x, z) => {
    const h = terrainHeight(x, z);
    if (h < 2 || h > 40 || terrainSlope(x, z) > 0.45) return null;
    const t = nearTerrace(x, z, 4);
    if (t && Math.hypot(x - t.x, z - t.z) < t.r * 0.8) return null;
    const c = new THREE.Color(0x6f7a4a);
    c.offsetHSL((Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.14);
    return { x, y: h + 1.5, z, s: 1 + Math.random() * 1.1, sy: 0.72 + Math.random() * 0.5, ry: Math.random() * 6.28, c };
  });
  {
    // silhouette A: the classic dusty round
    const round = new THREE.IcosahedronGeometry(1.5, 1);
    deform(round, 2, 9, 0.5, 0.8);
    // silhouette B: a taller crown of two lobes
    const lobes = mergeGeos([
      deform(new THREE.IcosahedronGeometry(1.15, 1), 2.6, 4, 0.55, 0.9),
      deform(new THREE.IcosahedronGeometry(0.85, 1), 3.1, 13, 0.6, 0.85).translate(0.7, 0.75, 0.2),
    ]);
    // silhouette C: wide, wind-carved, low
    const carved = new THREE.IcosahedronGeometry(1.5, 1);
    deform(carved, 1.7, 21, 0.75, 0.62);
    carved.scale(1.35, 0.66, 1.15);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true });
    addWind(mat, 0.035, 'top');
    const groups = [[], [], []];
    olives.forEach((o, i) => groups[i % 3].push(o));
    [round, lobes, carved].forEach((g, gi) => {
      if (!groups[gi].length) return;
      const mesh = new THREE.InstancedMesh(g, mat, groups[gi].length);
      mesh.castShadow = true;
      fill(mesh, groups[gi]);
      scene.add(mesh);
    });
    // trunks, leaning a little out of the wind
    const tg = new THREE.CylinderGeometry(0.14, 0.24, 1.7, 5);
    tg.translate(0, 0.85, 0);
    const tm = new THREE.InstancedMesh(tg, new THREE.MeshStandardMaterial({ color: 0x5c4630, roughness: 1 }), olives.length);
    fill(tm, olives.map((o, i) => ({
      ...o, y: terrainHeight(o.x, o.z), s: 1, sy: 1, c: undefined,
      tx: (fbm(i, 31, 2) - 0.5) * 0.24, tz: (fbm(i, 43, 2) - 0.5) * 0.24,
    })));
    scene.add(tm);
  }

  // ----- grass: golden cards, wind traveling across the hillside -----
  const grass = scatter(6800, (x, z) => {
    const h = terrainHeight(x, z);
    if (h < 1.2 || h > 42 || terrainSlope(x, z) > 0.6) return null;
    const t = nearTerrace(x, z, 0);
    if (t && Math.hypot(x - t.x, z - t.z) < t.r * 0.55) return null;
    const c = new THREE.Color(0xD8B36A);
    c.offsetHSL((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.14, (Math.random() - 0.5) * 0.18);
    return { x, y: h - 0.04, z, s: 1.1 + Math.random() * 1.1, ry: Math.random() * 6.28, c };
  });
  {
    const card = new THREE.PlaneGeometry(0.85, 0.75, 1, 2);
    card.translate(0, 0.37, 0);
    const cross = new THREE.PlaneGeometry(0.85, 0.75, 1, 2);
    cross.translate(0, 0.37, 0);
    cross.rotateY(Math.PI / 2);
    const geo = new THREE.BufferGeometry();
    const a = card.toNonIndexed(), b = cross.toNonIndexed();
    const posArr = new Float32Array((a.attributes.position.count + b.attributes.position.count) * 3);
    posArr.set(a.attributes.position.array, 0);
    posArr.set(b.attributes.position.array, a.attributes.position.count * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const uvArr = new Float32Array((a.attributes.uv.count + b.attributes.uv.count) * 2);
    uvArr.set(a.attributes.uv.array, 0);
    uvArr.set(b.attributes.uv.array, a.attributes.uv.count * 2);
    geo.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));
    const norArr = new Float32Array(posArr.length).fill(0);
    for (let i = 0; i < norArr.length; i += 3) norArr[i + 1] = 1;
    geo.setAttribute('normal', new THREE.BufferAttribute(norArr, 3));
    const tuftC = document.createElement('canvas'); tuftC.width = 64; tuftC.height = 64;
    const tctx = tuftC.getContext('2d');
    tctx.clearRect(0, 0, 64, 64);
    tctx.strokeStyle = '#ffffff'; tctx.lineCap = 'round';
    for (let i = 0; i < 15; i++) {
      const bx = 6 + Math.random() * 52;
      const lean = (Math.random() - 0.5) * 14;
      tctx.lineWidth = 1.5 + Math.random() * 1.5;
      tctx.globalAlpha = 0.85 + Math.random() * 0.15;
      tctx.beginPath();
      tctx.moveTo(bx, 64);
      tctx.quadraticCurveTo(bx + lean * 0.4, 34, bx + lean, 4 + Math.random() * 16);
      tctx.stroke();
    }
    const tuftTex = new THREE.CanvasTexture(tuftC);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 1, side: THREE.DoubleSide,
      map: tuftTex, alphaMap: tuftTex, alphaTest: 0.3, transparent: false,
    });
    addWind(mat, 0.18, 'top');
    const mesh = new THREE.InstancedMesh(geo, mat, grass.length);
    fill(mesh, grass);
    scene.add(mesh);
  }

  // ----- rocks: a small family of deformed icosahedra, dressed by the fog -----
  const rocks = scatter(150, (x, z) => {
    const h = terrainHeight(x, z);
    const nearSea = x < COAST_X + 26 && h < 4;
    const nearRavine = Math.abs(x - 196) < 22 && z > -75 && z < 18;
    const high = h > 34;
    if (!nearSea && !nearRavine && !high && Math.random() > 0.2) return null;
    if (nearTerrace(x, z, -2)) return null;
    const c = new THREE.Color(0x6E6355);
    c.offsetHSL(0, 0, (Math.random() - 0.5) * 0.12);
    return { x, y: h + 0.1, z, s: 0.5 + Math.random() * 2.2, sy: 0.4 + Math.random() * 1.2, ry: Math.random() * 6.28, tx: (Math.random() - 0.5) * 0.4, tz: (Math.random() - 0.5) * 0.4, c };
  });
  {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    deform(geo, 3, 4, 0.65, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.98, flatShading: true });
    const mesh = new THREE.InstancedMesh(geo, mat, rocks.length);
    mesh.castShadow = true; mesh.receiveShadow = true;
    fill(mesh, rocks);
    scene.add(mesh);
  }

  // ----- god rays: additive shafts between the cypress rows and through
  // the harbor gate, slanted with the low western sun, faded by view angle -----
  {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 128, 0);
    g.addColorStop(0, 'rgba(255,214,150,0.0)');
    g.addColorStop(0.45, 'rgba(255,214,150,0.55)');
    g.addColorStop(0.55, 'rgba(255,214,150,0.55)');
    g.addColorStop(1, 'rgba(255,214,150,0.0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    // [x, z, height, width, crossed]
    const spots = [
      [-24, 6, 6.5, 22, true],   // the pier-side cypress row, north
      [-16, -6, 6.0, 20, false],
      [-30, 0, 7.5, 12, true],   // through the harbor gate
      [-6, 5.4, 5.5, 18, false],
      [22, 12, 12, 26, true],
      [30, 21, 9, 20, false],
      [86, -40, 15, 26, true],
      [218, -40, 13, 22, true],  // the crossing cypress
    ];
    for (const [x, z, hgt, wid, crossed] of spots) {
      const angles = crossed ? [0.35, 1.15] : [0.35];
      for (const da of angles) {
        const mat = new THREE.MeshBasicMaterial({
          map: tex, transparent: true, opacity: 0.16, fog: false,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
        });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(wid, hgt), mat);
        const y = terrainHeight(x, z);
        m.position.set(x, y + hgt / 2 - 1, z);
        m.rotation.y = Math.PI / 2 + da;
        m.rotation.z = 0.26;
        m.renderOrder = 5;
        m.userData.base = 0.16;
        scene.add(m);
        WORLD.godRays.push(m);
      }
    }
  }
}

// Shared fbm displacement for canopies and rocks.
function deform(geo, freq, seed, amp, ySquash) {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const k = 1 + (fbm(pos.getX(i) * freq + seed, pos.getZ(i) * freq + seed * 0.7, 2) - 0.5) * amp;
    pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k * ySquash, pos.getZ(i) * k);
  }
  geo.computeVertexNormals();
  return geo;
}

function mergeGeos(geos) {
  let total = 0;
  const parts = geos.map(g => g.index ? g.toNonIndexed() : g);
  for (const g of parts) total += g.attributes.position.count;
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3);
  let off = 0;
  for (const g of parts) {
    pos.set(g.attributes.position.array, off * 3);
    nor.set(g.attributes.normal.array, off * 3);
    off += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  return out;
}
