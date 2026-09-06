// One verb: walk. Pointer lock first person, with a click-to-walk fallback
// when the lock is refused. Shift is stride. The ground is the law.

import * as THREE from 'three';
import { groundAt } from './terrain.js';

const EYE = 1.7;

export function initPlayer(camera, domElement, colliders, reducedMotion) {
  const P = {
    camera, colliders, reducedMotion,
    keys: {}, velocity: new THREE.Vector3(),
    bobPhase: 0, bobAmp: 0,
    fallback: false, locked: false,
    walkTarget: null,
    dragging: false, dragMoved: 0, lastX: 0, lastY: 0,
    onAction: null, onTendStart: null, onTendCancel: null,
    enabled: true,
  };

  camera.position.set(-78, groundAt(-78, 0) + EYE, 0);
  camera.rotation.set(0, -Math.PI / 2, 0); // facing east, up the pier, into the town

  // Pointer lock handled directly: a silent refusal becomes click-to-walk
  // with drag look, and no error ever reaches the console.
  const refused = () => {
    if (!P.everLocked) {
      P.fallback = true;
      const note = document.getElementById('fallbacknote');
      if (note) note.hidden = false;
    }
  };
  P.tryLock = () => {
    if (P.fallback || P.locked) return;
    try {
      const pr = domElement.requestPointerLock();
      if (pr && typeof pr.catch === 'function') pr.catch(refused);
    } catch (err) { refused(); }
  };
  document.addEventListener('pointerlockchange', () => {
    P.locked = document.pointerLockElement === domElement;
    if (P.locked) P.everLocked = true;
  });
  document.addEventListener('pointerlockerror', refused);

  domElement.addEventListener('mousedown', (e) => {
    if (!P.enabled) return;
    if (!P.fallback && !P.locked) { P.tryLock(); return; }
    if (P.fallback || !P.locked) {
      P.dragging = true; P.dragMoved = 0; P.lastX = e.clientX; P.lastY = e.clientY;
    }
  });
  window.addEventListener('mousemove', (e) => {
    if (P.locked) {
      const mx = e.movementX || 0, my = e.movementY || 0;
      camera.rotation.y -= mx * 0.0024;
      camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - my * 0.0024, -1.35, 1.35);
      return;
    }
    if (!P.dragging) return;
    const dx = e.clientX - P.lastX, dy = e.clientY - P.lastY;
    P.dragMoved += Math.abs(dx) + Math.abs(dy);
    P.lastX = e.clientX; P.lastY = e.clientY;
    camera.rotation.y -= dx * 0.0042;
    camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - dy * 0.0042, -1.35, 1.35);
  });
  window.addEventListener('mouseup', (e) => {
    if (!P.dragging) return;
    P.dragging = false;
    if (P.dragMoved < 5 && P.enabled) {
      // a click, not a look: walk there
      const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(ndc, camera);
      // march the ray to the terrain
      const o = ray.ray.origin, d = ray.ray.direction;
      for (let t = 2; t < 220; t += 2) {
        const x = o.x + d.x * t, y = o.y + d.y * t, z = o.z + d.z * t;
        if (y <= groundAt(x, z) + 0.4) { P.walkTarget = new THREE.Vector3(x, 0, z); break; }
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Tab') e.preventDefault();
    P.keys[e.code] = true;
    if (P.onKey) P.onKey(e);
  });
  window.addEventListener('keyup', (e) => { P.keys[e.code] = false; if (P.onKeyUp) P.onKeyUp(e); });

  P.update = (dt) => {
    if (!P.enabled) return;
    const k = P.keys;
    const stride = k.ShiftLeft || k.ShiftRight;
    const speed = stride ? 9.2 : 5.0;
    const fwd = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
    const strafe = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0);
    const move = new THREE.Vector3();
    if (fwd || strafe) {
      P.walkTarget = null;
      const yaw = camera.rotation.y;
      const f = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
      const r = new THREE.Vector3(-f.z, 0, f.x);
      move.addScaledVector(f, fwd).addScaledVector(r, strafe).normalize().multiplyScalar(speed);
    } else if (P.walkTarget) {
      const to = new THREE.Vector3(P.walkTarget.x - camera.position.x, 0, P.walkTarget.z - camera.position.z);
      const dist = to.length();
      if (dist < 0.8) P.walkTarget = null;
      else move.copy(to.normalize()).multiplyScalar(Math.min(speed, dist * 2));
    }
    P.velocity.lerp(move, 1 - Math.exp(-dt * 9));
    const v = P.velocity;
    let nx = camera.position.x + v.x * dt;
    let nz = camera.position.z + v.z * dt;
    // circle colliders
    for (const c of P.colliders) {
      const dx = nx - c.x, dz = nz - c.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < c.r * c.r && d2 > 0.0001) {
        const d = Math.sqrt(d2);
        nx = c.x + (dx / d) * c.r;
        nz = c.z + (dz / d) * c.r;
      }
    }
    // world bounds
    nx = THREE.MathUtils.clamp(nx, -92, 300);
    nz = THREE.MathUtils.clamp(nz, -240, 240);
    // no swimming: the sea keeps you to the pier and the shore
    const g = groundAt(nx, nz);
    if (g < -0.6) { nx = camera.position.x; nz = camera.position.z; }
    camera.position.x = nx;
    camera.position.z = nz;
    const g2 = groundAt(nx, nz);
    const speedNow = Math.hypot(v.x, v.z);
    if (!P.reducedMotion && speedNow > 0.4) {
      P.bobPhase += dt * (4.4 + speedNow * 0.55);
      P.bobAmp = THREE.MathUtils.lerp(P.bobAmp, 0.038, dt * 4);
    } else {
      P.bobAmp = THREE.MathUtils.lerp(P.bobAmp, 0, dt * 6);
    }
    const targetY = g2 + EYE + Math.sin(P.bobPhase) * P.bobAmp;
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 1 - Math.exp(-dt * 12));
  };

  P.unlock = () => {
    try { if (document.pointerLockElement === domElement) document.exitPointerLock(); } catch (err) { /* stay */ }
  };

  P.teleport = (x, z, yaw) => {
    camera.position.set(x, groundAt(x, z) + EYE, z);
    if (yaw !== undefined) { camera.rotation.y = yaw; camera.rotation.x = 0; }
    P.velocity.set(0, 0, 0);
    P.walkTarget = null;
  };

  return P;
}
