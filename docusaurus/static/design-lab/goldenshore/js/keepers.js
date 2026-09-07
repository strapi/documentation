// Twelve keepers, one for each station the provenance records as tended
// after midnight. They are roles, never portraits; every number a keeper
// speaks is computed from the shipped data at build time, so the caption
// can never drift from the record. They walk real citation footpaths at
// 1.2 m/s, tend lanterns with the player's own cupped-hands gesture, face
// you inside four meters, and say one quiet line each.

import * as THREE from 'three';
import { groundAt, terrainHeight, PIER, BRIDGE, bridgeDeckAt, hash01, provinceAt } from './terrain.js';
import { WORLD, addRim, noReflect } from './world.js';
import { daysSince } from './data.js';

const WALK = 1.2; // m/s, the pace of somebody almost home
const nf = (n) => n.toLocaleString('en-US');

// ---------- the figure kit: one instanced mesh per body part ----------
function buildFigureKit(scene, count) {
  const cloth = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92 });
  addRim(cloth, 0.6);
  const skin = new THREE.MeshStandardMaterial({ color: 0xC89A72, roughness: 0.85 });
  addRim(skin, 0.6);
  const straw = new THREE.MeshStandardMaterial({ color: 0xC2A46A, roughness: 0.95 });
  const glow = new THREE.MeshStandardMaterial({
    color: 0x684a20, roughness: 0.6,
    emissive: 0xFFB35C, emissiveIntensity: 1.6,
  });
  // The first pass hung raw boxes and a sphere on the rig, which at four
  // metres reads as a shop mannequin rather than a person who works here.
  // Same rig, same instancing, better parts: a torso that tapers at the
  // waist and squares at the shoulder, a coat that flares to the hem, round
  // limbs, boots, and a hat with an actual crown over its brim.
  const glue = (list) => {
    let n = 0;
    const gs = list.map(g => (g.index ? g.toNonIndexed() : g));
    for (const g of gs) n += g.attributes.position.count;
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
    let o = 0;
    for (const g of gs) {
      pos.set(g.attributes.position.array, o * 3);
      nor.set(g.attributes.normal.array, o * 3);
      o += g.attributes.position.count;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    return out;
  };
  const torsoGeo = glue([
    new THREE.CylinderGeometry(0.215, 0.165, 0.60, 8).scale(1, 1, 0.66),
    new THREE.BoxGeometry(0.47, 0.115, 0.215).translate(0, 0.265, 0),   // shoulder yoke
    new THREE.CylinderGeometry(0.075, 0.085, 0.10, 6).translate(0, 0.34, 0), // neck
  ]);
  const skirtGeo = new THREE.CylinderGeometry(0.185, 0.285, 0.36, 8).scale(1, 1, 0.78);
  const hatGeo = glue([
    new THREE.CylinderGeometry(0.245, 0.255, 0.022, 10).scale(1, 1, 0.94),  // brim
    new THREE.CylinderGeometry(0.118, 0.142, 0.105, 8).translate(0, 0.062, 0), // crown
  ]);
  const legGeo = glue([
    new THREE.CylinderGeometry(0.062, 0.048, 0.50, 6),
    new THREE.BoxGeometry(0.11, 0.055, 0.19).translate(0, -0.24, 0.03),  // boot
  ]);
  const armGeo = glue([
    new THREE.CylinderGeometry(0.052, 0.040, 0.44, 6),
    new THREE.SphereGeometry(0.043, 6, 5).translate(0, -0.23, 0),        // hand
  ]);
  // A keeper's lantern is a dark case with light inside it, not a pale lump:
  // the case is its own material, only the glass is allowed to glow.
  const caseMat = new THREE.MeshStandardMaterial({ color: 0x2A2019, roughness: 0.75, metalness: 0.25 });
  addRim(caseMat, 0.5);
  const lanternGeo = glue([
    new THREE.CylinderGeometry(0.052, 0.060, 0.100, 6),                        // glass
  ]);
  const lanternCaseGeo = glue([
    new THREE.CylinderGeometry(0.062, 0.062, 0.016, 6).translate(0, 0.056, 0),  // top plate
    new THREE.CylinderGeometry(0.066, 0.066, 0.016, 6).translate(0, -0.056, 0), // base plate
    new THREE.CylinderGeometry(0.028, 0.056, 0.040, 6).translate(0, 0.082, 0),  // cap
    new THREE.TorusGeometry(0.040, 0.006, 4, 8).rotateY(Math.PI / 2).translate(0, 0.114, 0),
  ]);
  const parts = {
    torso: [torsoGeo, cloth],
    skirt: [skirtGeo, cloth], // coat hem
    head: [new THREE.SphereGeometry(0.115, 9, 8).scale(0.92, 1.12, 0.90), skin],
    hat: [hatGeo, straw],
    legL: [legGeo, cloth],
    legR: [legGeo, cloth],
    armL: [armGeo, cloth],
    armR: [armGeo, cloth],
    lantern: [lanternGeo, glow],
    lanternCase: [lanternCaseGeo, caseMat],
  };
  const meshes = {};
  for (const [k, [geo, mat]] of Object.entries(parts)) {
    const m = new THREE.InstancedMesh(geo, mat, count);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.castShadow = true;
    m.frustumCulled = false;
    noReflect(m);
    scene.add(m);
    meshes[k] = m;
  }
  const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1);
  const _m = new THREE.Matrix4(), _pivot = new THREE.Matrix4(), _rot = new THREE.Matrix4(), _off = new THREE.Matrix4();
  const _e = new THREE.Euler();
  // a part that swings from a pivot: world = T(base+pivot) * R * T(-pivotLocal)
  function limb(mesh, i, x, y, z, yaw, px, py, pz, rx, halfLen) {
    _pivot.makeTranslation(px, py, pz);
    _e.set(rx, 0, 0); _rot.makeRotationFromEuler(_e);
    _off.makeTranslation(0, -halfLen, 0);
    _m.makeRotationY(yaw).setPosition(x, y, z);
    _m.multiply(_pivot).multiply(_rot).multiply(_off);
    mesh.setMatrixAt(i, _m);
  }
  function set(i, pose) {
    const { x, y, z, yaw, gait, tend, dark } = pose;
    const sw = Math.sin(gait) * 0.55;
    _q.setFromEuler(_e.set(0, yaw, 0));
    // torso, hem, head, hat ride the body
    _p.set(x, y + 1.06, z); _m.compose(_p, _q, _s); meshes.torso.setMatrixAt(i, _m);
    _p.set(x, y + 0.62, z); _m.compose(_p, _q, _s); meshes.skirt.setMatrixAt(i, _m);
    _p.set(x, y + 1.52, z); _m.compose(_p, _q, _s); meshes.head.setMatrixAt(i, _m);
    _p.set(x, y + 1.64, z); _m.compose(_p, _q, _s); meshes.hat.setMatrixAt(i, _m);
    // legs swing when walking
    limb(meshes.legL, i, x, y, z, yaw, -0.11, 0.52, 0, sw, 0.26);
    limb(meshes.legR, i, x, y, z, yaw, 0.11, 0.52, 0, -sw, 0.26);
    // arms: counter-swing, or the cupped-hands tend gesture
    const armSwing = tend > 0 ? -1.35 * Math.min(1, tend * 2) : -sw * 0.7;
    limb(meshes.armL, i, x, y, z, yaw, -0.225, 1.305, 0, armSwing, 0.23);
    limb(meshes.armR, i, x, y, z, yaw, 0.225, 1.305, 0, tend > 0 ? armSwing : sw * 0.7, 0.23);
    // the lantern hangs from the right hand, rises with the gesture
    const lift = tend > 0 ? 0.55 * Math.min(1, tend * 2) : 0;
    const hx = Math.sin(yaw) * (0.16 + lift * 0.2), hz = Math.cos(yaw) * (0.16 + lift * 0.2);
    _p.set(x + Math.cos(yaw) * 0.27 + hx, y + 0.78 + lift, z - Math.sin(yaw) * 0.27 + hz);
    _m.compose(_p, _q, _s); meshes.lantern.setMatrixAt(i, _m);
    meshes.lanternCase.setMatrixAt(i, _m);
    if (meshes.torso.instanceColor) void dark;
  }
  function commit() {
    for (const m of Object.values(meshes)) m.instanceMatrix.needsUpdate = true;
  }
  function tint(i, hex, legHex, hatHex) {
    const c = new THREE.Color(hex);
    meshes.torso.setColorAt(i, c);
    meshes.skirt.setColorAt(i, c.clone().offsetHSL(0, 0, -0.05));
    meshes.armL.setColorAt(i, c);
    meshes.armR.setColorAt(i, c);
    const l = new THREE.Color(legHex);
    meshes.legL.setColorAt(i, l);
    meshes.legR.setColorAt(i, l);
    // straw in the sun, felt under the pines, lime dust on the Wall, a wide
    // bleached brim on the islets: the hat says the province at fifty metres
    if (hatHex !== undefined) meshes.hat.setColorAt(i, new THREE.Color(hatHex));
  }
  return { meshes, set, commit, tint };
}

// ---------- the twelve rounds, resolved against real data ----------
function findSlug(content, frag) {
  return Object.keys(content.pages).find(s => s.includes(frag)) || null;
}

export function buildKeepers(scene, data, town, reducedMotion) {
  const { content, provenance, inbound, outbound, stats, taxonomy } = data;
  const bySlug = town.bySlug;
  const at = (slug) => bySlug.get(slug);
  const checks = [];
  const ck = (label, got, expect) => {
    checks.push({ label, got, expect, ok: got === expect });
    if (got !== expect) console.warn(`[keepers] ${label}: data says ${got}, brief said ${expect}; the data wins.`);
    return got;
  };

  const corners = Object.keys(provenance).filter(k => provenance[k].first === '2023-03-01' && at(k));
  ck('cornerstones', corners.length, 5);
  const pset = provenance['/cloud/projects/settings'] || { commits: 0, first: '', last: '' };
  const careDays = daysSince(pset.first, pset.last);
  const rn = provenance['/release-notes'] || { commits: 0, first: '', authors: [], night: 0 };
  const bc = '/cms/migration/v4-to-v5/breaking-changes';
  const dockerSlug = findSlug(content, 'docker');
  const dprov = dockerSlug ? provenance[dockerSlug] : null;
  const ds = '/cms/api/document-service';
  const rooms = Object.keys(content.pages).filter(s => s.startsWith(ds + '/')).length;
  const qs = provenance['/cms/quick-start'] || { commits: 0, first: '', authors: [] };
  const confN = (taxonomy && Object.keys(taxonomy).filter(s => taxonomy[s].section === 'Configurations').length) || 0;
  const devN = (taxonomy && Object.keys(taxonomy).filter(s => taxonomy[s].section === 'Development').length) || 0;
  ck('crossEdges', stats.crossEdges, 29);
  ck('touched30', stats.touched30, 42);
  ck('zeroInbound', stats.zeroInbound, 50);

  const upSlugs = Object.keys(taxonomy)
    .filter(s => taxonomy[s].section === 'Upgrades' && at(s))
    .sort((a, b) => at(a).x - at(b).x).filter((s, i) => i % 5 === 0).slice(0, 5);

  const crofts = town.stations.filter(s => s.type === 'croft').slice(0, 3).map(s => s.slug);

  // route: slugs become door-front waypoints; extra raw points may be mixed in
  const R = (slugs, extra) => {
    const pts = [];
    for (const s of slugs) {
      const st = typeof s === 'string' ? at(s) : null;
      if (st) pts.push({ x: st.x - Math.sin(st.yaw) * 3.2, z: st.z - Math.cos(st.yaw) * 3.2, slug: st.slug });
      else if (Array.isArray(s)) pts.push({ x: s[0], z: s[1] });
    }
    if (extra) pts.push(...extra.map(p => ({ x: p[0], z: p[1] })));
    return pts.filter(Boolean);
  };

  // ----- what a keeper of each province wears -----
  // Working cloth, not costume: what you can dye and mend where you live.
  // The wool is the province's, the role is the keeper's own.
  const CLOTH = {
    harbor:   { coat: 0x4B5E6E, legs: 0x2C3742, hat: 0xC2A46A }, // sea-faded indigo, straw
    terraces: { coat: 0x7A4B33, legs: 0x452B1E, hat: 0xC8A868 }, // madder over the red earth
    highland: { coat: 0x3E4A35, legs: 0x27301F, hat: 0x584C3A }, // loden wool, dark felt
    wall:     { coat: 0x8C8271, legs: 0x4E4941, hat: 0xE2DCCB }, // undyed, lime dust on everything
    cloud:    { coat: 0xC9CBC4, legs: 0x6E7472, hat: 0xEFE8D2 }, // salt-bleached linen
  };
  const dress = (prov, k) => {
    const base = CLOTH[prov] || CLOTH.harbor;
    const j = hash01(k) - 0.5;
    return {
      tint: new THREE.Color(base.coat).offsetHSL(j * 0.05, j * 0.14, j * 0.13).getHex(),
      legs: new THREE.Color(base.legs).offsetHSL(0, 0, j * 0.09).getHex(),
      hat: new THREE.Color(base.hat).offsetHSL(0, j * 0.1, j * 0.08).getHex(),
    };
  };

  const SPECS = [
    { id: 'harbormaster', prov: 'cloud',
      route: R(corners.length
        ? ['/cloud/intro', '/cloud/getting-started/deployment', '/cloud/getting-started/usage-billing',
          [-84, 70], [-92, 64], [-99, 60],
          '/cloud/projects/overview', '/cloud/projects/settings',
          [-99, 60], [-92, 64], [-84, 70]].filter(v => Array.isArray(v) || at(v))
        : ['/cloud/projects/settings']),
      line: `Five stones laid in one day, 2023-03-01. ${nf(pset.commits)} rounds of care across ${nf(careDays)} days at this desk.` },
    { id: 'lamplighter', prov: 'wall',
      route: R(upSlugs.concat(['/release-notes'])),
      line: `Relit ${nf(ck('relightings', rn.commits, 126))} times since ${rn.first}. ${(rn.authors || []).length} hands, ${rn.night === 1 ? 'once' : rn.night + ' times'} after midnight.` },
    { id: 'bridgetender', prov: 'wall',
      route: R([bc], [[BRIDGE.x0 - 3, -28], [BRIDGE.x1 + 3, -28]]),
      line: `${nf(ck('bc-in', inbound[bc] || 0, 57))} roads arrive and ${nf(ck('bc-out', outbound[bc] || 0, 52))} leave over this crossing. Re-mortared ${(provenance[bc] || {}).last || ''}.` },
    { id: 'nighthand', prov: 'harbor',
      route: dockerSlug ? R([dockerSlug]) : R(['/cms/quick-start']),
      line: dprov ? `${nf(dprov.commits)} visits by ${(dprov.authors || []).length} hands to this house. ${dprov.night || 0} after midnight, lamp lit each time.` : '',
      still: true },
    { id: 'netmender', prov: 'harbor',
      route: R([[-20, 30], [-24, 38], [-30, 42], [-38, 47], [-46, 52], [-38, 47], [-30, 42], [-22, 34]]),
      line: `${nf(stats.crossEdges)} stairs touch both salt and town, one for every road between Cloud and CMS. I mend the nets on all of them.` },
    { id: 'wellkeeper', prov: 'terraces',
      route: R([ds], [[84, -28], [90, -34], [84, -40], [78, -34]]),
      line: `${nf(ck('well-in', inbound[ds] || 0, 48))} roads drink at this well. ${rooms} rooms off the wellhouse, last filled ${(provenance[ds] || {}).last || ''}.` },
    { id: 'gardener', prov: 'terraces',
      route: R(['/cms/api/rest/guides/understanding-populate'], [[84, -10], [84, -20]]),
      line: `${nf(ck('populate-words', stats.populateWords, 1916))} words walk this gallery end to end. I keep the way between the columns clear.` },
    { id: 'guide', prov: 'harbor',
      route: R(['/cms/quick-start'], [[-40, 0], [-20, 2], [2, -2]]),
      line: `The violet door: ${nf(qs.commits)} renovations by ${(qs.authors || []).length} hands since ${qs.first}. Painted so a newcomer cannot miss it.` },
    { id: 'crofter', prov: 'terraces',
      route: crofts.length ? R(crofts) : R([], [[100, 84], [92, 78]]),
      line: `${nf(stats.zeroInbound)} crofts stand off every path, nothing linking to them. Someone still sweeps each floor.` },
    { id: 'goatherd', prov: 'highland',
      route: R([[112, 16], [126, 2], [140, -12], [152, -28], [138, -18], [120, 4]]),
      line: `${confN} workshops in the quarter, ${devN} yards in the uplands. The goats know every drystone wall between them.` },
    { id: 'fisher', prov: 'harbor',
      route: R([], [[-44, 6], [-52, 2], [-60, -2], [-48, -4]]),
      line: `${nf(stats.touched30)} crates on the quay, one for each page touched this month. A fair catch.` },
    { id: 'archivist', prov: 'harbor',
      route: R(['/cms/intro', '/cms/quick-start'].filter(s => at(s)), [[6, 8]]),
      line: `${nf(stats.totalCommits)} acts of care by ${stats.keeperCount} keepers, and I have written every one of them down.` },
  ];
  for (const s of SPECS) if (!s.route.length) s.route = R([], [[0, 0], [8, 4]]);

  const kit = buildFigureKit(scene, SPECS.length);
  const keepers = SPECS.map((spec, i) => {
    // the province a keeper belongs to is declared, and checked against where
    // the round actually starts, so the dress can never drift from the ground
    const start0 = spec.route[0] || { x: 0, z: 0 };
    const prov = spec.prov || provinceAt(start0.x, start0.z);
    const d = dress(prov, spec.id);
    spec.prov = prov; spec.tint = d.tint; spec.legs = d.legs;
    kit.tint(i, d.tint, d.legs, d.hat);
    const start = spec.route[0];
    return {
      ...spec, i, wp: 0, x: start.x, z: start.z, yaw: hash01(spec.id) * 6.28,
      gait: 0, pause: hash01(spec.id + 'p') * 4, tendT: 0, said: 0, facing: false,
    };
  });
  for (const m of Object.values(kit.meshes)) {
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }

  // ---------- goats: uplands only, claiming nothing ----------
  const goatGeo = (() => {
    const parts = [];
    const body = new THREE.BoxGeometry(0.62, 0.34, 0.26); body.translate(0, 0.52, 0);
    parts.push(body);
    const head = new THREE.BoxGeometry(0.2, 0.22, 0.16); head.translate(0.38, 0.62, 0);
    parts.push(head);
    for (const [lx, lz] of [[-0.22, -0.09], [-0.22, 0.09], [0.22, -0.09], [0.22, 0.09]]) {
      const leg = new THREE.BoxGeometry(0.07, 0.36, 0.07); leg.translate(lx, 0.18, lz);
      parts.push(leg);
    }
    let total = 0;
    const nn = parts.map(g => g.toNonIndexed());
    for (const g of nn) total += g.attributes.position.count;
    const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3);
    let off = 0;
    for (const g of nn) {
      pos.set(g.attributes.position.array, off * 3);
      nor.set(g.attributes.normal.array, off * 3);
      off += g.attributes.position.count;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    return out;
  })();
  const goatMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
  addRim(goatMat, 0.6);
  const NGOATS = 8;
  const goatMesh = new THREE.InstancedMesh(goatGeo, goatMat, NGOATS);
  goatMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  goatMesh.castShadow = true;
  noReflect(goatMesh);
  scene.add(goatMesh);
  const goats = [...Array(NGOATS)].map((_, i) => ({
    x: 112 + hash01('gx' + i) * 44, z: -30 + hash01('gz' + i) * 60,
    yaw: hash01('gy' + i) * 6.28, next: hash01('gn' + i) * 6,
    graze: 0, c: new THREE.Color().setHSL(0.08, 0.18, 0.28 + hash01('gc' + i) * 0.5),
  }));
  goats.forEach((g, i) => goatMesh.setColorAt(i, g.c));
  if (goatMesh.instanceColor) goatMesh.instanceColor.needsUpdate = true;

  // ---------- the boat: the month's catch of commits comes in ----------
  const boat = new THREE.Group();
  {
    const hullM = new THREE.MeshStandardMaterial({ color: 0x6A4B30, roughness: 0.85 });
    // hull, bow, mast and boom merge into one wooden body: one draw call
    const woodParts = [];
    const addPart = (geo, rx, ry, rz, x, y, z) => {
      const g = geo.toNonIndexed();
      if (rz) g.rotateZ(rz);
      if (ry) g.rotateY(ry);
      if (rx) g.rotateX(rx);
      g.translate(x, y, z);
      woodParts.push(g);
    };
    addPart(new THREE.BoxGeometry(4.6, 0.8, 1.7), 0, 0, 0, 0, 0.5, 0);
    addPart(new THREE.CylinderGeometry(0.01, 0.85, 1.4, 4), 0, Math.PI / 4, -Math.PI / 2, 2.9, 0.5, 0);
    addPart(new THREE.CylinderGeometry(0.06, 0.09, 4.6, 6), 0, 0, 0, 0.5, 2.8, 0);
    addPart(new THREE.CylinderGeometry(0.04, 0.05, 3.4, 5), 0, 0, Math.PI / 2 - 0.24, -1.1, 3.6, 0);
    {
      let total = 0;
      for (const g of woodParts) total += g.attributes.position.count;
      const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3);
      let off = 0;
      for (const g of woodParts) {
        pos.set(g.attributes.position.array, off * 3);
        nor.set(g.attributes.normal.array, off * 3);
        off += g.attributes.position.count;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      boat.add(new THREE.Mesh(geo, hullM));
    }
    // the painted stern rail: violet, the mark of human care
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 1.72),
      new THREE.MeshStandardMaterial({ color: 0x4945FF, roughness: 0.7 }));
    rail.position.set(-2.24, 0.98, 0); boat.add(rail);
    const sailM = new THREE.MeshStandardMaterial({ color: 0xEFE2C8, roughness: 0.9, side: THREE.DoubleSide });
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.5, 3, 3), sailM);
    sail.position.set(-0.8, 2.4, 0);
    sail.rotation.x = 0.03;
    boat.add(sail);
    boat.userData.sail = sail;
    boat.traverse(o => { o.castShadow = true; });
  }
  noReflect(boat);
  scene.add(boat);
  const BERTH = { x: -74, z: 5.6, yaw: 0.35 };
  if (reducedMotion) {
    boat.position.set(BERTH.x, 0.1, BERTH.z);
    boat.rotation.y = BERTH.yaw;
    if (boat.userData.sail) boat.userData.sail.visible = false;
  }

  // ---------- caption plumbing ----------
  const lineEl = document.getElementById('npcline');
  let lineTimer = 0, lineOwner = null;
  function say(k) {
    if (!lineEl || !k.line) return;
    lineEl.textContent = k.line;
    lineEl.hidden = false;
    /* (2026-09-07) A keeper never speaks across a label you are reading. The
       line sits at 17% and a waymark's label climbs from 13%, so the two used
       to collide at the bottom centre, two text layers over each other. When a
       label is up, the line stands just above it instead; with none, the empty
       string hands the placement back to the stylesheet. */
    const lab = document.getElementById('label');
    let bottom = '';
    if (lab) {
      const lb = lab.getBoundingClientRect();
      if (lb.height > 4 && parseFloat(getComputedStyle(lab).opacity) > 0.05) {
        bottom = (Math.round(((window.innerHeight - lb.top) / window.innerHeight) * 1000) / 10 + 2.5) + '%';
      }
    }
    lineEl.style.bottom = bottom;
    lineEl.classList.add('on');
    lineTimer = 7.5; lineOwner = k.id;
    if (api.onSpeak) api.onSpeak(k);
  }

  const api = {
    keepers, goats, boat, checks, onSpeak: null, onBoatTie: null,
    tick(t, dt, player) {
      // ----- keepers -----
      for (const k of keepers) {
        const wp = k.route[k.wp % k.route.length];
        const dx = wp.x - k.x, dz = wp.z - k.z;
        const dist = Math.hypot(dx, dz);
        const pdx = player.x - k.x, pdz = player.z - k.z;
        const pdist = Math.hypot(pdx, pdz);
        const near = pdist < 4;
        if (near) {
          // face the traveler, and offer the one line
          k.yaw = Math.atan2(pdx, pdz);
          if (k.said <= 0) { say(k); k.said = 30; }
        }
        k.said -= dt;
        if (reducedMotion) {
          // keepers stand at their stations; nothing drifts, everyone still answers
          k.gait = 0;
          kit.set(k.i, { x: k.x, y: groundAt(k.x, k.z), z: k.z, yaw: k.yaw, gait: 0, tend: 0 });
          continue;
        }
        if (k.pause > 0) {
          k.pause -= dt;
          k.tendT = Math.max(0, Math.min(1, (2.5 - k.pause) / 1.2));
          if (k.pause <= 0) { k.wp++; k.tendT = 0; }
          k.gait = 0;
        } else if (!near || pdist > 2.2) {
          if (dist < 0.6) {
            k.pause = wp.slug ? 4.5 : 1.2; // tend the lantern at real stations only
            if (!wp.slug) k.wp++;
          } else {
            const step = Math.min(WALK * dt, dist);
            k.x += (dx / dist) * step;
            k.z += (dz / dist) * step;
            if (!near) k.yaw = Math.atan2(dx, dz);
            k.gait = (k.gait + dt * 6.2) % (Math.PI * 2);
          }
        } else k.gait = 0;
        let gy = groundAt(k.x, k.z);
        if (k.id === 'bridgetender' && k.x > BRIDGE.x0 && k.x < BRIDGE.x1 && Math.abs(k.z + 28) < 4) gy = bridgeDeckAt(k.x);
        kit.set(k.i, {
          x: k.x, y: gy, z: k.z, yaw: k.yaw,
          gait: k.gait, tend: k.pause > 0 && k.pause < 2.5 && (k.route[k.wp % k.route.length] || {}).slug ? k.tendT : 0,
        });
      }
      kit.commit();

      // ----- goats -----
      const gm = new THREE.Matrix4(), gq = new THREE.Quaternion(), ge = new THREE.Euler();
      goats.forEach((g, i) => {
        if (!reducedMotion) {
          g.next -= dt;
          if (g.next <= 0) {
            g.next = 4 + hash01('gr' + i + (t | 0)) * 7;
            g.tyaw = g.yaw + (hash01('gt' + i + (t | 0)) - 0.5) * 2.4;
            g.graze = hash01('gg' + i + (t | 0)) > 0.55 ? 2.5 : 0;
          }
          if (g.graze > 0) g.graze -= dt;
          else {
            g.yaw += ((g.tyaw || g.yaw) - g.yaw) * dt * 2;
            const sp = 0.5 * dt;
            const nx = g.x + Math.sin(g.yaw) * sp, nz = g.z + Math.cos(g.yaw) * sp;
            const h = terrainHeight(nx, nz);
            if (h > 8 && h < 34) { g.x = nx; g.z = nz; } else g.tyaw = g.yaw + Math.PI;
          }
        }
        ge.set(g.graze > 0 ? 0.35 : 0, g.yaw - Math.PI / 2, 0);
        gq.setFromEuler(ge);
        gm.compose(new THREE.Vector3(g.x, terrainHeight(g.x, g.z), g.z), gq, new THREE.Vector3(1, 1, 1));
        goatMesh.setMatrixAt(i, gm);
      });
      goatMesh.instanceMatrix.needsUpdate = true;

      // ----- the boat comes in on the coast clock -----
      if (!reducedMotion) {
        const leg = (t % 600); // one arrival per coast round
        if (leg < 70) {
          const tt = leg / 70;
          const ease = tt * tt * (3 - 2 * tt);
          boat.position.set(-460 + ease * (BERTH.x + 460), 0.1, 60 - ease * (60 - BERTH.z));
          boat.rotation.y = 0.15 + ease * 0.2;
          boat.rotation.z = Math.sin(t * 0.9) * 0.03;
          if (boat.userData.sail) boat.userData.sail.scale.y = Math.max(0.06, 1 - Math.max(0, tt - 0.82) * 5.5);
          if (tt > 0.99 && !boat.userData.tied) {
            boat.userData.tied = true;
            WORLD.gullExcite = 1;
            if (api.onBoatTie) api.onBoatTie();
          }
        } else {
          boat.position.set(BERTH.x, 0.1 + Math.sin(t * 0.7) * 0.04, BERTH.z);
          boat.rotation.y = BERTH.yaw;
          boat.rotation.z = Math.sin(t * 0.8) * 0.02;
          if (boat.userData.sail) boat.userData.sail.scale.y = 0.06;
          if (leg > 130) { boat.userData.tied = false; WORLD.gullExcite = Math.max(0, (WORLD.gullExcite || 0) - dt / 60); }
        }
      }

      // caption fade
      if (lineTimer > 0) {
        lineTimer -= dt;
        if (lineTimer <= 0 && lineEl) { lineEl.classList.remove('on'); lineEl.hidden = true; lineOwner = null; }
      }
      void lineOwner;
    },
  };
  window.__npc = {
    checks, list: () => keepers.map(k => ({ id: k.id, x: +k.x.toFixed(2), y: +groundAt(k.x, k.z).toFixed(2), z: +k.z.toFixed(2) })),
    line: (id) => (keepers.find(k => k.id === id) || {}).line,
  };
  return api;
}
