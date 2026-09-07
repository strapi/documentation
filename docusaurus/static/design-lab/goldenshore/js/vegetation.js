// Instanced life, province by province: cypress and three families of olives
// on the terraces, maritime pine in the highland, thorn and scree on the Wall,
// salt cushion on the islets, wind-phased grass everywhere it can hold, and
// the honest god-ray fakery between the trees.
//
// Every species reads the same soft province field the ground reads, so growth
// thins out and hands over across the same tens of metres the earth does. That
// is the whole of what makes a border a walk rather than a line.

import * as THREE from 'three';
import {
  terrainHeight, terrainSlope, COAST_X, TERRACES, fbm,
  provinceWeights, PROVINCE_KEYS, GATES,
} from './terrain.js';

// Nothing grows in a gateway. The town publishes its thresholds; a trunk that
// would stand in one is simply never planted.
function inGate(x, z, pad = 0) {
  for (const g of GATES) {
    const dx = x - g.x, dz = z - g.z;
    if (dx * dx + dz * dz < (g.r + pad) * (g.r + pad)) return true;
  }
  return false;
}

// province weights as a plain object, copied out of the shared buffer
function pw(x, z) {
  const w = provinceWeights(x, z);
  return { harbor: w[0], terraces: w[1], highland: w[2], wall: w[3], cloud: w[4] };
}
// blend a set of per-province colours by the field at this point
const _pc = new THREE.Color(), _pt = new THREE.Color();
function provColor(x, z, table) {
  const w = provinceWeights(x, z);
  _pc.setRGB(0, 0, 0);
  for (let i = 0; i < PROVINCE_KEYS.length; i++) {
    _pt.set(table[PROVINCE_KEYS[i]]);
    _pc.r += _pt.r * w[i]; _pc.g += _pt.g * w[i]; _pc.b += _pt.b * w[i];
  }
  return _pc.clone();
}

// deterministic per-index noise, so a tuft is the same tuft on every boot
function h1(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
import { addWind, addRim, addDistanceCull, noReflect, WORLD } from './world.js';

function scatter(count, accept) {
  const out = [];
  let guard = count * 40;
  while (out.length < count && guard-- > 0) {
    const x = -150 + Math.random() * 430;
    const z = -200 + Math.random() * 420;
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
  cypressPts.push(...scatter(62, (x, z) => {
    const h = terrainHeight(x, z);
    if (h < 2.5 || h > 44 || terrainSlope(x, z) > 0.5) return null;
    if (nearTerrace(x, z, -3) || inGate(x, z, -3)) return null;
    // cypress belongs to the harbour and the terraces: it thins to nothing
    // as the pine country takes over, which is half the Forest Gate handover
    const w = pw(x, z);
    if (Math.random() > Math.pow(w.harbor + w.terraces, 1.4)) return null;
    return { x, y: h, z, s: 0.7 + Math.random() * 0.7, ry: Math.random() * 6.28 };
  }));
  {
    // two silhouettes: the road flame, and a slimmer wind-licked spire
    const makeCypress = (radius, height, seed, rag) => {
      // A cone with a sharp apex reads as folded paper. Real cypress is a
      // column: nearly parallel-sided for most of its height, blunt and
      // broken at the crown, and ragged all the way down. More rings, a
      // fatter waist, a leaning axis, and a tip that is never a point.
      const geo = new THREE.CylinderGeometry(radius * 0.30, radius, height, 14, 13, false);
      geo.translate(0, height / 2, 0);
      const pos = geo.attributes.position;
      const lean = (fbm(seed * 3.3, 11, 2) - 0.5) * 0.5;
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i);
        const t = py / height;
        if (t > 0.005) {
          const a = Math.atan2(pz, px);
          // the column swells at a third of its height and closes at the crown
          const waist = 0.62 + 0.72 * Math.sin(Math.min(1, t * 1.06) * Math.PI * 0.86);
          const k = waist * (1 + (fbm(Math.cos(a) * 3.1 + py * 1.5 + seed, Math.sin(a) * 3.1 + 7 + seed, 3) - 0.5) * rag);
          const bx = lean * t * t * height * 0.09;
          pos.setX(i, px * k + bx); pos.setZ(i, pz * k);
          pos.setY(i, py + (fbm(px * 6 + seed, pz * 6 + 2, 2) - 0.5) * 0.85 * (t > 0.9 ? 2.4 : 1));
        }
      }
      geo.computeVertexNormals();
      return geo;
    };
    const geos = [makeCypress(1.05, 7.2, 0, 0.85), makeCypress(0.72, 8.6, 9.3, 1.05)];
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true });
    addWind(mat, 0.05, 'top');
    addRim(mat, 0.9);
    const base = new THREE.Color(0x46543a);
    const split = [[], []];
    cypressPts.forEach((p, i) => split[i % 2].push({
      ...p,
      c: new THREE.Color().copy(base).offsetHSL((fbm(i * 0.7, 3, 2) - 0.5) * 0.05, (fbm(i, 9, 2) - 0.5) * 0.2, (fbm(i, 17, 2) - 0.5) * 0.12),
    }));
    geos.forEach((g, gi) => {
      if (!split[gi].length) return;
      const mesh = new THREE.InstancedMesh(g, mat, split[gi].length);
      mesh.castShadow = true; mesh.receiveShadow = true;
      fill(mesh, split[gi]);
      noReflect(mesh);
      scene.add(mesh);
    });
  }

  // ----- olives: three silhouettes scattered through the open terraces -----
  const olives = scatter(170, (x, z) => {
    const h = terrainHeight(x, z);
    if (h < 2 || h > 40 || terrainSlope(x, z) > 0.45) return null;
    const t = nearTerrace(x, z, 4);
    if (t && Math.hypot(x - t.x, z - t.z) < t.r * 0.8) return null;
    if (inGate(x, z, -2)) return null;
    // the olive is the terraces' own tree. It reaches a little into the
    // harbour and stops at the treeline; nothing on the Wall, nothing at sea.
    const w = pw(x, z);
    const p = w.terraces + w.harbor * 0.45;
    if (Math.random() > Math.pow(p, 1.3)) return null;
    const c = new THREE.Color(0x6f7a4a);
    c.offsetHSL((Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.14);
    const sc = 0.78 + Math.random() * 0.72;
    return { x, y: h + 1.55 + sc * 0.42, z, s: sc, sy: sc * (0.82 + Math.random() * 0.30), ry: Math.random() * 6.28, c };
  });
  {
    // Three crowns, all of them volumes. The first pass squashed these to
    // 0.62 and 0.66 of their height and then multiplied that by a separate
    // vertical instance scale, which is how an olive tree became a saucer.
    // Subdivision goes to two so the silhouette is leafy rather than origami.
    // silhouette A: the classic dusty round
    const round = new THREE.IcosahedronGeometry(1.5, 2);
    deform(round, 2, 9, 0.52, 0.92);
    deform(round, 6.5, 27, 0.26, 1.0);   // second octave: leaf clumps, not crystal facets
    // silhouette B: a taller crown of two lobes
    const lobes = mergeGeos([
      deform(deform(new THREE.IcosahedronGeometry(1.20, 2), 2.6, 4, 0.55, 1.02), 7.1, 33, 0.24, 1.0),
      deform(deform(new THREE.IcosahedronGeometry(0.86, 2), 3.1, 13, 0.6, 0.95), 8.2, 41, 0.24, 1.0).translate(0.66, 0.80, 0.18),
    ]);
    // silhouette C: wide, wind-carved, low, but still a crown
    const carved = new THREE.IcosahedronGeometry(1.5, 2);
    deform(carved, 1.7, 21, 0.68, 0.82);
    deform(carved, 6.0, 47, 0.28, 1.0);
    carved.scale(1.16, 1.0, 1.06);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true });
    addWind(mat, 0.035, 'top');
    addRim(mat, 0.85, { trans: 0.42 });
    const groups = [[], [], []];
    olives.forEach((o, i) => groups[i % 3].push(o));
    [round, lobes, carved].forEach((g, gi) => {
      if (!groups[gi].length) return;
      const mesh = new THREE.InstancedMesh(g, mat, groups[gi].length);
      mesh.castShadow = true;
      fill(mesh, groups[gi]);
      noReflect(mesh);
      scene.add(mesh);
    });
    // trunks, leaning a little out of the wind
    // the trunk must reach the crown, or the crown reads as a hovering disc
    const tg = mergeGeos([
      new THREE.CylinderGeometry(0.15, 0.30, 2.15, 6).translate(0, 1.07, 0),
      new THREE.CylinderGeometry(0.07, 0.12, 0.9, 4).rotateZ(0.55).translate(0.22, 2.05, 0.05),
      new THREE.CylinderGeometry(0.06, 0.11, 0.8, 4).rotateX(-0.62).translate(-0.06, 2.0, -0.24),
    ]);
    const tm = new THREE.InstancedMesh(tg, new THREE.MeshStandardMaterial({ color: 0x5c4630, roughness: 1 }), olives.length);
    fill(tm, olives.map((o, i) => ({
      ...o, y: terrainHeight(o.x, o.z), s: 0.78 + o.s * 0.3, sy: 0.72 + o.s * 0.44, c: undefined,
      tx: (fbm(i, 31, 2) - 0.5) * 0.24, tz: (fbm(i, 43, 2) - 0.5) * 0.24,
    })));
    noReflect(tm);
    scene.add(tm);
  }

  // ----- grass: real blades, wind traveling across the hillside -----
  // The first pass hung alpha-tested cards. At walking distance a card is a
  // ribbon of cardboard with a hard cut edge, and no amount of texture work
  // fixes that, so the blades are geometry now: tapered strips that bend
  // over, six to a tuft, dark at the root and bleached at the tip, lit and
  // rim-lit like everything else on the coast. One instanced draw, no shadow
  // pass, no alpha test.
  // Grass mixes are a province signal, not a decoration. Sea bent by the
  // harbour, oat gold under the olives, needle-shadow green in the pine
  // country, thin grey bents on the limestone, salt marram on the islets.
  // Density is weighted too: the Wall is nearly bare, which is what makes it
  // read as bare rock from a kilometre away.
  const GRASS_TINT = {
    harbor: 0xB79E5C, terraces: 0xC49B4E, highland: 0x8E9450,
    wall: 0xA9A487, cloud: 0xC9BE86,
  };
  const GRASS_DENSITY = { harbor: 1.0, terraces: 1.0, highland: 0.78, wall: 0.22, cloud: 0.42 };
  const grass = scatter(34000, (x, z) => {
    const h = terrainHeight(x, z);
    if (h < 1.2 || h > 42 || terrainSlope(x, z) > 0.6) return null;
    const t = nearTerrace(x, z, 0);
    // oat grass may lap the colonnade's own floor; every other terrace keeps
    // a swept yard, so no tuft grows through a doorstep again
    const keep = t && t.id === 'apis' ? 0.55 : 0.92;
    if (t && Math.hypot(x - t.x, z - t.z) < t.r * keep) return null;
    const w = pw(x, z);
    let dens = 0;
    for (const k of PROVINCE_KEYS) dens += w[k] * GRASS_DENSITY[k];
    if (Math.random() > dens) return null;
    const c = provColor(x, z, GRASS_TINT);
    c.offsetHSL((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.18, (Math.random() - 0.5) * 0.20);
    return { x, y: h - 0.02, z, s: 0.82 + Math.random() * 0.9, ry: Math.random() * 6.28, c };
  });
  {
    const SEG = 3, BLADES = 9;
    const pos = [], nor = [], col = [], idx = [];
    let v = 0;
    const root = new THREE.Color(0x544E24), tip = new THREE.Color(0xDCC084);
    for (let b = 0; b < BLADES; b++) {
      const a = (b / BLADES) * Math.PI * 2 + h1(b * 7.7) * 0.9;
      const ca = Math.cos(a), sa = Math.sin(a);
      const h = 0.30 + h1(b * 3.1 + 1) * 0.34;
      const bend = 0.16 + h1(b * 5.3 + 2) * 0.30;
      const w0 = 0.0145 + h1(b * 11.1) * 0.009;
      const off = h1(b * 2.9 + 5) * 0.082;
      const ox = ca * off, oz = sa * off;
      for (let i = 0; i <= SEG; i++) {
        const t = i / SEG;
        const w = w0 * (1 - t) * (1 - t * 0.55);       // taper to a point
        const y = h * t;
        const lean = bend * t * t;                      // the blade folds over
        const cx = ox + ca * lean, cz = oz + sa * lean;
        // the strip runs across the blade, perpendicular to its own lean
        for (const sgn of [-1, 1]) {
          pos.push(cx - sa * w * sgn, y, cz + ca * w * sgn);
          nor.push(ca * 0.35, 0.94, sa * 0.35);
          const cc = root.clone().lerp(tip, t * t * 0.72 + t * 0.28);
          col.push(cc.r, cc.g, cc.b);
        }
        if (i < SEG) {
          const o = v + i * 2;
          idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
        }
      }
      v += (SEG + 1) * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setIndex(idx);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 1, side: THREE.DoubleSide, vertexColors: true,
    });
    addWind(mat, 0.13, 'top');
    addRim(mat, 0.70, { trans: 0.26 });
    addDistanceCull(mat, 40, 52);
    const mesh = new THREE.InstancedMesh(geo, mat, grass.length);
    mesh.receiveShadow = true;
    fill(mesh, grass);
    noReflect(mesh);
    scene.add(mesh);
  }

  // ----- rocks: a small family of deformed icosahedra, dressed by the fog -----
  // Rock is a province tell too: warm grey in the harbour, red-brown where
  // the terra rossa breaks, pale limestone on the Wall, granite in the pines,
  // salt-bleached at the archipelago's waterline.
  const ROCK_TINT = {
    harbor: 0x6E6355, terraces: 0x7A5C46, highland: 0x6A6660,
    wall: 0xA79E88, cloud: 0xB0A78E,
  };
  const rocks = scatter(430, (x, z) => {
    const h = terrainHeight(x, z);
    const w = pw(x, z);
    const nearSea = x < COAST_X + 26 && h < 4;
    const nearRavine = Math.abs(x - 196) < 22 && z > -75 && z < 18;
    const high = h > 34;
    // the Wall sheds scree: broken stone is its ground cover, not grass
    const scree = w.wall > 0.5 && Math.random() < 0.55;
    // and every islet is ringed by the rock the sea has not finished
    const islet = w.cloud > 0.45 && h > 0.4 && h < 3.4 && Math.random() < 0.7;
    if (!scree && !islet && !nearSea && !nearRavine && !high && Math.random() > 0.2) return null;
    if (nearTerrace(x, z, -2) && !islet) return null;
    if (islet && nearTerrace(x, z, -1.5)) return null;
    const c = provColor(x, z, ROCK_TINT);
    c.offsetHSL(0, 0, (Math.random() - 0.5) * 0.12);
    const small = scree || islet;
    return {
      x, y: h + 0.1, z,
      s: small ? 0.22 + Math.random() * 0.55 : 0.5 + Math.random() * 2.2,
      sy: small ? 0.2 + Math.random() * 0.4 : 0.4 + Math.random() * 1.2,
      ry: Math.random() * 6.28, tx: (Math.random() - 0.5) * 0.4, tz: (Math.random() - 0.5) * 0.4, c,
    };
  });
  {
    // a family of five silhouettes: boulder, slab, shard, split pair, low dome
    const fam = [
      deform(new THREE.IcosahedronGeometry(1, 1), 3, 4, 0.65, 1),
      (() => { const g = deform(new THREE.IcosahedronGeometry(1, 1), 2.2, 11, 0.5, 0.9); g.scale(1.6, 0.45, 1.1); return g; })(),
      (() => { const g = deform(new THREE.IcosahedronGeometry(1, 1), 3.4, 23, 0.8, 1); g.scale(0.6, 1.7, 0.7); return g; })(),
      mergeGeos([
        deform(new THREE.IcosahedronGeometry(0.8, 1), 3, 31, 0.6, 1),
        deform(new THREE.IcosahedronGeometry(0.6, 1), 3, 37, 0.6, 1).translate(1.0, -0.1, 0.3),
      ]),
      (() => { const g = deform(new THREE.IcosahedronGeometry(1, 1), 1.8, 41, 0.4, 0.9); g.scale(1.3, 0.55, 1.3); return g; })(),
    ];
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.98, flatShading: true });
    addRim(mat, 0.35);
    const byFam = [[], [], [], [], []];
    rocks.forEach((r, i) => byFam[i % 5].push(r));
    fam.forEach((g, gi) => {
      if (!byFam[gi].length) return;
      const mesh = new THREE.InstancedMesh(g, mat, byFam[gi].length);
      mesh.castShadow = true; mesh.receiveShadow = true;
      fill(mesh, byFam[gi]);
      noReflect(mesh);
      scene.add(mesh);
    });
  }

  // ----- maquis: the ground cover that tells one province from the next -----
  // A hillside with trees standing on bare earth reads as pins in a map. The
  // scrub is what fills the gap, and its colour is the fastest province signal
  // there is: rockrose grey-green under the olives, myrtle dark under the
  // pines, thorn bleached on the Wall, salt cushion on the islets.
  {
    const MAQ_TINT = {
      harbor: 0x6C7A55, terraces: 0x7C8352, highland: 0x3F5636,
      wall: 0x8A8A64, cloud: 0x9AA47C,
    };
    const MAQ_DENSITY = { harbor: 0.35, terraces: 0.9, highland: 1.0, wall: 0.7, cloud: 0.55 };
    const maquis = scatter(1500, (x, z) => {
      const h = terrainHeight(x, z);
      if (h < 1.4 || terrainSlope(x, z) > 0.8) return null;
      if (nearTerrace(x, z, -1) || inGate(x, z, -5)) return null;
      const w = pw(x, z);
      let dens = 0;
      for (const k of PROVINCE_KEYS) dens += w[k] * MAQ_DENSITY[k];
      // scrub grows in clumps with bare ground between, which is what makes a
      // bush read as a bush and not as noise
      const clump = fbm(x * 0.09, z * 0.09, 3);
      if (Math.random() > dens * (0.25 + clump * 1.5)) return null;
      const c = provColor(x, z, MAQ_TINT);
      // two in five went over to last year's growth and never came back
      if (Math.random() < 0.38) c.lerp(new THREE.Color(0x8C7A4E), 0.45 + Math.random() * 0.3);
      c.offsetHSL((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.18, (Math.random() - 0.5) * 0.16);
      const sprawl = Math.random() < 0.42;
      const sc = 0.34 + Math.random() * 0.58;
      return {
        x, y: h + 0.06, z,
        s: sprawl ? sc * 1.24 : sc,
        sy: sprawl ? sc * 0.58 : sc * (0.72 + Math.random() * 0.5),
        ry: Math.random() * 6.28, c,
      };
    });
    if (maquis.length) {
      // One silhouette, one draw, two habits. A second geometry would have
      // read better and cost a draw call in both the main and the shadow
      // pass, which is exactly the pair that puts the pier frame over the
      // ceiling. Instead the sprawl is made in the instance: a deformed
      // cushion, squashed and widened per bush, so half of them lie along
      // the wind and half sit up.
      const g = deform(new THREE.IcosahedronGeometry(1, 1), 2.9, 53, 0.78, 0.75);
      const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.97, flatShading: true });
      addWind(mat, 0.02, 'top');
      addRim(mat, 0.85, { trans: 0.2 });
      addDistanceCull(mat, 150, 190);
      const mesh = new THREE.InstancedMesh(g, mat, maquis.length);
      mesh.castShadow = true;
      fill(mesh, maquis);
      noReflect(mesh);
      scene.add(mesh);
    }

    // agave: the Wall's own rosette, on the bare switchbacks and nowhere else
    const leaf = new THREE.ConeGeometry(0.10, 1.15, 4);
    leaf.translate(0, 0.5, 0);
    const parts = [];
    for (let k = 0; k < 9; k++) {
      const l = leaf.clone();
      l.rotateX(0.9 + (k % 3) * 0.16);
      l.rotateY((k / 9) * Math.PI * 2);
      parts.push(l);
    }
    parts.push(new THREE.ConeGeometry(0.09, 1.7, 4).translate(0, 0.85, 0)); // the flowering spike
    const agaveGeo = mergeGeos(parts);
    const agaves = scatter(64, (x, z) => {
      const h = terrainHeight(x, z);
      if (h < 16 || terrainSlope(x, z) > 0.7) return null;
      if (nearTerrace(x, z, -2) || inGate(x, z, -4)) return null;
      const w = pw(x, z);
      if (Math.random() > Math.pow(w.wall, 1.2)) return null;
      const c = new THREE.Color(0x7C8F6E);
      c.offsetHSL((Math.random() - 0.5) * 0.03, (Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.12);
      return { x, y: h, z, s: 0.7 + Math.random() * 0.9, ry: Math.random() * 6.28, c };
    });
    if (agaves.length) {
      const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true });
      addRim(mat, 0.9);
      const mesh = new THREE.InstancedMesh(agaveGeo, mat, agaves.length);
      mesh.castShadow = true;
      fill(mesh, agaves);
      noReflect(mesh);
      scene.add(mesh);
    }
  }

  // ----- maritime pine: the highland, and the reason the Forest Gate is a gate -----
  // A pine is not a cone. It is a bare leaning pole for two thirds of its
  // height and then four or five cushions on one plane, so the silhouette has
  // bites taken out of it against a low sun.
  {
    const pines = scatter(300, (x, z) => {
      const h = terrainHeight(x, z);
      if (h < 6 || h > 44 || terrainSlope(x, z) > 0.55) return null;
      if (nearTerrace(x, z, -5) || inGate(x, z, -1)) return null;
      const w = pw(x, z);
      // the treeline: dense in the highland, a scattered advance guard in the
      // top of the terraces, none at all past the Wall foot
      const p = w.highland - w.wall * 0.6;
      if (p <= 0 || Math.random() > Math.pow(p, 1.15)) return null;
      const c = new THREE.Color(0x4B5D3C);
      c.offsetHSL((Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.16, (Math.random() - 0.5) * 0.14);
      // one in nine is an old tree: a wide flat parasol over a long bare pole
      const old = Math.random() < 0.11;
      const sc = old ? 1.34 + Math.random() * 0.34 : 0.72 + Math.random() * 0.56;
      return { x, y: h, z, s: sc, sy: old ? sc * 1.12 : sc, ry: Math.random() * 6.28, c };
    });
    if (pines.length) {
      // the pole: leaning, tapering, with two broken branch stubs
      const trunkParts = [];
      {
        const t = new THREE.CylinderGeometry(0.16, 0.36, 8.2, 7);
        t.translate(0, 4.1, 0);
        const pos = t.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const ty = pos.getY(i) / 8.2;
          pos.setX(i, pos.getX(i) + Math.sin(ty * 2.1) * 0.42 * ty);
          pos.setZ(i, pos.getZ(i) + Math.cos(ty * 1.4) * 0.26 * ty);
        }
        t.computeVertexNormals();
        trunkParts.push(t);
        for (const [hy, ang, len] of [[5.4, 0.6, 1.5], [6.5, 3.5, 1.2]]) {
          const br = new THREE.CylinderGeometry(0.05, 0.10, len, 5);
          br.rotateZ(Math.PI / 2 - 0.5);
          br.rotateY(ang);
          br.translate(Math.cos(ang) * len * 0.34, hy, Math.sin(ang) * len * 0.34);
          trunkParts.push(br);
        }
      }
      const trunkGeo = mergeGeos(trunkParts);
      // the crown: cushions at one height, not a ball
      const cushions = [];
      const CU = [[0, 0, 1.00], [1.55, 0.35, 0.82], [-1.35, -0.25, 0.90], [0.45, -1.5, 0.74], [-0.8, 1.45, 0.70]];
      CU.forEach(([cx, cz, r], i) => {
        const g = deform(new THREE.IcosahedronGeometry(r * 1.55, 1), 2.2, 71 + i * 7, 0.55, 0.9);
        g.scale(1.22, 0.52, 1.22);
        g.translate(cx, 8.0 + (i % 2) * 0.42, cz);
        cushions.push(g);
      });
      const crownGeo = mergeGeos(cushions);
      const tm = new THREE.MeshStandardMaterial({ color: 0x6A4E33, roughness: 1, flatShading: true });
      addRim(tm, 0.45);
      addDistanceCull(tm, 240, 300);
      const cm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true });
      addWind(cm, 0.035, 'top');
      addRim(cm, 0.85, { trans: 0.28 });
      addDistanceCull(cm, 240, 300);
      const tMesh = new THREE.InstancedMesh(trunkGeo, tm, pines.length);
      // a pine's shadow is its crown, not its pole: the crown casts, the
      // trunk only receives, and the shadow pass is one draw shorter
      tMesh.castShadow = false; tMesh.receiveShadow = true;
      fill(tMesh, pines.map(p => ({ ...p, c: null })));
      noReflect(tMesh);
      scene.add(tMesh);
      const cMesh = new THREE.InstancedMesh(crownGeo, cm, pines.length);
      cMesh.castShadow = true;
      fill(cMesh, pines);
      noReflect(cMesh);
      scene.add(cMesh);
    }
  }

  // The headland's parasol pines are not gone: they were three separate
  // merged meshes standing on the Upgrades crag, which is the one province
  // that has to read as bare rock. They are now old, wide-crowned instances
  // of the same maritime pine population above, in the pine country, and
  // they cost no draw call of their own.

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
    // all shaft cards share one base opacity, so the whole set merges into
    // a single mesh and one draw call; the view-angle fade drives them all
    const cards = [];
    const _e2 = new THREE.Euler(), _q2 = new THREE.Quaternion(), _m2 = new THREE.Matrix4();
    for (const [x, z, hgt, wid, crossed] of spots) {
      const angles = crossed ? [0.35, 1.15] : [0.35];
      for (const da of angles) {
        const g = new THREE.PlaneGeometry(wid, hgt);
        const y = terrainHeight(x, z);
        _e2.set(0, Math.PI / 2 + da, 0.26, 'YXZ');
        _q2.setFromEuler(_e2);
        _m2.compose(new THREE.Vector3(x, y + hgt / 2 - 1, z), _q2, new THREE.Vector3(1, 1, 1));
        g.applyMatrix4(_m2);
        cards.push(g);
      }
    }
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity: 0.16, fog: false,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const merged = mergeGeos(cards);
    // A shaft is a twenty metre card. Stand next to one and it stops being a
    // shaft and becomes a gold wedge across the whole frame, which is what
    // the walk turned up. Each card carries its own centre so the shader can
    // fade it out as you approach and again as it recedes past reading range.
    {
      const mp = merged.attributes.position;
      const ctr = new Float32Array(mp.count * 3);
      for (let i = 0; i < mp.count; i += 6) {
        let cx = 0, cy = 0, cz = 0;
        for (let k = 0; k < 6; k++) { cx += mp.getX(i + k); cy += mp.getY(i + k); cz += mp.getZ(i + k); }
        cx /= 6; cy /= 6; cz /= 6;
        for (let k = 0; k < 6; k++) { ctr[(i + k) * 3] = cx; ctr[(i + k) * 3 + 1] = cy; ctr[(i + k) * 3 + 2] = cz; }
      }
      merged.setAttribute('aCtr', new THREE.BufferAttribute(ctr, 3));
      mat.onBeforeCompile = (shader) => {
        shader.vertexShader = 'attribute vec3 aCtr;\nvarying float vShaftK;\n' + shader.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          {
            float sd = distance( cameraPosition, aCtr );
            vShaftK = smoothstep( 7.0, 19.0, sd ) * ( 1.0 - smoothstep( 78.0, 130.0, sd ) );
          }`
        );
        shader.fragmentShader = 'varying float vShaftK;\n' + shader.fragmentShader.replace(
          '#include <map_fragment>',
          '#include <map_fragment>\n\tdiffuseColor.a *= vShaftK;'
        );
      };
    }
    const m = new THREE.Mesh(merged, mat);
    m.renderOrder = 5;
    m.frustumCulled = false;
    m.userData.base = 0.16;
    noReflect(m);
    scene.add(m);
    WORLD.godRays.push(m);
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
  const hasUV = parts.every(g => g.attributes.uv);
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3);
  const uv = hasUV ? new Float32Array(total * 2) : null;
  let off = 0;
  for (const g of parts) {
    pos.set(g.attributes.position.array, off * 3);
    nor.set(g.attributes.normal.array, off * 3);
    if (uv) uv.set(g.attributes.uv.array, off * 2);
    off += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  if (uv) out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return out;
}
