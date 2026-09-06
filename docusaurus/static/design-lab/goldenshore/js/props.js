// Harbor dressing: barrels, coiled rope, drying nets, a moored skiff.
// Scenery with no signage, so it invents no facts. The skiff bobs unless
// reduced motion holds the water still.

import * as THREE from 'three';
import { groundAt, PIER, hash01 } from './terrain.js';
import { sharedMaps, WORLD } from './world.js';

export function buildProps(scene) {
  const maps = sharedMaps();
  const colliders = [];

  // ----- barrels: instanced staved casks with iron bands -----
  {
    const pts = [];
    const cluster = (cx, cz, n, seed) => {
      for (let i = 0; i < n; i++) {
        const a = hash01(seed + 'a' + i) * Math.PI * 2, r = 0.45 + hash01(seed + 'r' + i) * 0.8;
        pts.push({
          x: cx + Math.cos(a) * r, z: cz + Math.sin(a) * r,
          s: 0.85 + hash01(seed + 's' + i) * 0.3, ry: hash01(seed + 'y' + i) * 6.28,
        });
      }
      colliders.push({ x: cx, z: cz, r: 1.15 });
    };
    cluster(-42.5, 4.6, 3, 'quayN');
    cluster(-47, -4.4, 4, 'quayS');
    cluster(-84.5, 2.2, 2, 'pierEnd');
    const profile = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      profile.push(new THREE.Vector2(0.26 + Math.sin(t * Math.PI) * 0.055, t * 0.82));
    }
    const geo = new THREE.LatheGeometry(profile, 10);
    const mat = new THREE.MeshStandardMaterial({ map: maps.barrelMap, roughness: 0.85 });
    const mesh = new THREE.InstancedMesh(geo, mat, pts.length);
    const m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
    pts.forEach((b, i) => {
      const y = (b.x > PIER.x0 && b.x < PIER.x1 && Math.abs(b.z) < 3.4) ? PIER.deck + 0.045 : groundAt(b.x, b.z);
      p.set(b.x, y, b.z);
      q.setFromEuler(new THREE.Euler(0, b.ry, 0));
      s.set(b.s, b.s, b.s);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true; mesh.receiveShadow = true;
    scene.add(mesh);
  }

  // ----- coiled rope on the pier boards -----
  {
    const rope = new THREE.MeshStandardMaterial({ color: 0xB39A6C, roughness: 0.95 });
    for (const [cx, cz, sc] of [[-58, 2.4, 1], [-76, -2.2, 0.8], [-45.5, 1.9, 0.7]]) {
      const g = new THREE.Group();
      for (let k = 0; k < 3; k++) {
        const t = new THREE.Mesh(new THREE.TorusGeometry(0.26 - k * 0.015, 0.055, 5, 16), rope);
        t.rotation.x = Math.PI / 2;
        t.position.y = 0.05 + k * 0.075;
        t.castShadow = true;
        g.add(t);
      }
      g.position.set(cx, PIER.deck + 0.045, cz);
      g.scale.setScalar(sc);
      scene.add(g);
    }
  }

  // ----- drying nets hung on the pier rail posts -----
  {
    const c = document.createElement('canvas'); c.width = 128; c.height = 96;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 128, 96);
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.4;
    for (let i = -8; i < 20; i++) {
      ctx.beginPath(); ctx.moveTo(i * 12, 0); ctx.lineTo(i * 12 + 52, 96); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i * 12, 96); ctx.lineTo(i * 12 + 52, 0); ctx.stroke();
    }
    const netTex = new THREE.CanvasTexture(c);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xC0A87E, roughness: 1, map: netTex, alphaMap: netTex,
      alphaTest: 0.28, side: THREE.DoubleSide,
    });
    for (const [cx, cz, ry] of [[-62, 3.12, 0], [-70, -3.12, 0.06]]) {
      const geo = new THREE.PlaneGeometry(4.6, 1.35, 8, 3);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i) / 4.6 + 0.5;
        pos.setY(i, pos.getY(i) - Math.sin(u * Math.PI) * 0.22 * (0.5 - pos.getY(i) / 1.35));
        pos.setZ(i, Math.sin(u * Math.PI * 3) * 0.05);
      }
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(cx, PIER.deck + 1.05, cz);
      mesh.rotation.y = ry;
      mesh.castShadow = true;
      scene.add(mesh);
    }
  }

  // ----- the moored skiff, riding the swell south of the pier -----
  {
    const skiff = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({
      map: (() => { const t = maps.woodMap.clone(); t.needsUpdate = true; return t; })(),
      color: 0x8a6a48, roughness: 0.8,
    });
    // hull: a deformed half sphere, stern cut flat by scale
    const hullGeo = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const hp = hullGeo.attributes.position;
    for (let i = 0; i < hp.count; i++) {
      hp.setX(i, hp.getX(i) * 2.35);
      hp.setZ(i, hp.getZ(i) * 0.95);
      hp.setY(i, hp.getY(i) * 0.78);
    }
    hullGeo.computeVertexNormals();
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.castShadow = true;
    skiff.add(hull);
    // gunwale
    const gun = new THREE.Mesh(new THREE.TorusGeometry(1, 0.07, 5, 20), hullMat);
    gun.rotation.x = Math.PI / 2;
    gun.scale.set(2.35, 0.95, 1);
    gun.position.y = 0.02;
    skiff.add(gun);
    // dark interior
    const floor = new THREE.Mesh(new THREE.CircleGeometry(0.97, 16).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 1 }));
    floor.scale.set(2.3, 1, 0.9);
    floor.position.y = -0.06;
    skiff.add(floor);
    // bench and stem post
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 1.5), hullMat);
    bench.position.set(0.3, 0.05, 0);
    skiff.add(bench);
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), hullMat);
    stem.position.set(2.28, 0.16, 0);
    stem.rotation.z = -0.4;
    skiff.add(stem);
    skiff.position.set(-66, 0.16, 7.4);
    skiff.rotation.y = 0.35;
    scene.add(skiff);
    WORLD.bobbers.push({ obj: skiff, baseY: 0.16, baseRZ: 0, phase: 1.7 });
    // mooring line back to the pier rim
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 4.6, 4),
      new THREE.MeshStandardMaterial({ color: 0x9a815a, roughness: 1 }));
    line.position.set(-65, 0.9, 5.2);
    line.rotation.x = Math.PI / 2 - 0.32;
    line.rotation.z = 0.25;
    scene.add(line);
  }

  return { colliders };
}
