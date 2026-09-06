// The Golden Shore. A golden-hour headland where all the real pages of the
// Strapi documentation stand as lantern-lit waystations, and walking is reading.

import * as THREE from 'three';
import { loadData, safeStore } from './data.js';
import { createRenderer, initWorld, updateWorld, enterKeeperHour, tickKeeperHour, WORLD } from './world.js';
import { buildTown } from './town.js';
import { buildVegetation } from './vegetation.js';
import { buildProps } from './props.js';
import { initPlayer } from './player.js';
import {
  initOverlay, openReader, closeReader, isReaderOpen, tend, getTended,
  toggleLogbook, keeperHourEarned, showToast, updateLabel, drawCompass,
} from './overlay.js';
import { TERRACES } from './terrain.js';

const setStatus = (t) => { const el = document.getElementById('load-status'); if (el) el.textContent = t; };

// film grain, painted once, jittered by CSS-less JS
function makeGrain() {
  const c = document.createElement('canvas'); c.width = c.height = 160;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 96 + Math.random() * 64;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const el = document.getElementById('grain');
  el.style.backgroundImage = `url(${c.toDataURL()})`;
  return el;
}

const frameTimes = [];
function notePerf(dt) {
  frameTimes.push(dt * 1000);
  if (frameTimes.length > 900) frameTimes.shift();
}
window.__perf = () => {
  const arr = frameTimes.slice().sort((a, b) => a - b);
  if (!arr.length) return { p50: 0, p95: 0, samples: 0 };
  return {
    p50: +arr[Math.floor(arr.length * 0.5)].toFixed(2),
    p95: +arr[Math.floor(arr.length * 0.95)].toFixed(2),
    samples: arr.length,
  };
};
window.__perfReset = () => { frameTimes.length = 0; };

async function boot() {
  const mmRM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = !!(mmRM && mmRM.matches) || safeStore.get('longlight.reduced', false)
    || new URLSearchParams(location.search).has('rm');

  const data = await loadData(setStatus);
  setStatus('Raising the sun...');

  // The light never dies silent. Renderer creation walks a retry ladder;
  // total refusal raises a card that helps, with a RETRY that needs no reload.
  let renderer = await createRenderer();
  if (!renderer) {
    document.getElementById('loading').classList.add('off');
    const card = document.getElementById('glcard');
    const note = document.getElementById('glnote');
    const btn = document.getElementById('glretry');
    card.hidden = false;
    renderer = await new Promise((resolve) => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        note.textContent = 'Asking the browser again...';
        const r = await createRenderer();
        btn.disabled = false;
        if (r) {
          card.hidden = true;
          resolve(r);
        } else {
          note.textContent = 'Still refused. The browser gave no WebGL context. Quit the browser fully, reopen it, and try once more.';
        }
      });
    });
  }
  const canvas = renderer.domElement;
  document.getElementById('scene').replaceWith(canvas);
  initWorld(renderer, reducedMotion);
  setStatus('Laying the stones...');

  const overlay = initOverlay(data, {
    onRead(slug, isNew) {
      if (isNew && !WORLD.keeperHour && keeperHourEarned()) {
        enterKeeperHour();
        setTimeout(() => showToast('The keeper\'s hour. The sun settles lower, and the Golden Shore begins to turn.', 6000), 800);
      }
    },
    onClose() {
      if (!player.fallback && !isReaderOpen()) player.tryLock();
    },
    isReduced: () => WORLD.reducedMotion,
    keeperHour: () => WORLD.keeperHour,
    onTeleport(districtKey) {
      const st = town.stations.find(s => s.districtKey === districtKey);
      if (st) player.teleport(st.x - Math.sin(st.yaw) * 8, st.z - Math.cos(st.yaw) * 8, st.yaw + Math.PI);
      else {
        const t = TERRACES.find(tt => tt.id === 'plaza');
        if (t) player.teleport(t.x, t.z, Math.PI / 2);
      }
    },
  });

  const tended = getTended();
  const town = buildTown(WORLD.scene, data, tended);
  setStatus('Planting the wind...');
  buildVegetation(WORLD.scene);
  const props = buildProps(WORLD.scene);
  const colliders = town.colliders.concat(props.colliders);

  const player = initPlayer(WORLD.camera, canvas, colliders, reducedMotion);

  if (WORLD.keeperHour === false && keeperHourEarned()) {
    // a returning keeper who earned the hour in an earlier walk
    enterKeeperHour();
  }

  makeGrain();
  const grainEl = document.getElementById('grain');

  // ----- interaction target -----
  let target = null, targetDist = 999;
  function findTarget() {
    const cam = WORLD.camera;
    const view = new THREE.Vector3();
    cam.getWorldDirection(view);
    let best = null, bestD = 999, bestScore = -1;
    for (const st of town.stations) {
      const dx = st.x - cam.position.x, dz = st.z - cam.position.z;
      const d = Math.hypot(dx, dz);
      if (d > 24) continue;
      const dot = (dx / d) * view.x + (dz / d) * view.z;
      if (d > 6 && dot < 0.45) continue;
      const score = dot * 2 - d * 0.06;
      if (score > bestScore) { bestScore = score; best = st; bestD = d; }
    }
    target = best; targetDist = bestD;
  }

  // ----- tending -----
  let tendHold = 0, tendActive = false;
  player.onKey = (e) => {
    if (e.code === 'KeyE' && !e.repeat) {
      if (isReaderOpen()) return;
      if (target && targetDist <= 9) {
        if (openReader(target.slug)) player.unlock();
      }
    }
    if (e.code === 'Escape') {
      if (isReaderOpen()) { closeReader(); toggleLogbook(false); }
    }
    if (e.code === 'Tab') {
      toggleLogbook();
    }
    if (e.code === 'KeyF' && target && targetDist <= 9 && !tended.has(target.slug)) tendActive = true;
  };
  player.onKeyUp = (e) => {
    if (e.code === 'KeyF') { tendActive = false; tendHold = 0; }
  };

  // ----- boot line: the one quiet iris of controls -----
  document.getElementById('loading').classList.add('off');
  const bootline = document.getElementById('bootline');
  setTimeout(() => bootline.classList.add('on'), 1400);
  setTimeout(() => bootline.classList.remove('on'), 14000);

  // ----- debug hooks for the honest probe -----
  window.__world = {
    teleport: (x, z, yaw) => player.teleport(x, z, yaw),
    look: (yaw, pitch) => { WORLD.camera.rotation.y = yaw; WORLD.camera.rotation.x = pitch || 0; },
    pos: () => ({ x: WORLD.camera.position.x, y: WORLD.camera.position.y, z: WORLD.camera.position.z }),
    stations: town.stations.map(s => ({ slug: s.slug, x: s.x, z: s.z })),
    openPage: (slug) => openReader(slug),
    keeperHour: () => WORLD.keeperHour,
  };

  // ----- the loop -----
  const clock = new THREE.Clock();
  let grainTick = 0;
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.1);
    const t = clock.elapsedTime;
    notePerf(dt);

    if (!isReaderOpen()) {
      player.enabled = true;
      player.update(dt);
    } else {
      player.enabled = false;
    }

    findTarget();
    if (tendActive && target && targetDist <= 9 && !tended.has(target.slug)) {
      tendHold += dt;
      if (tendHold >= 2) {
        tendActive = false; tendHold = 0;
        if (tend(target.slug)) {
          town.lanterns.setTended(target.slug);
          showToast('You cup the flame. It steadies, and it will know you when you return.');
        }
      }
    } else if (!tendActive) tendHold = 0;
    updateLabel(isReaderOpen() ? null : target, targetDist, tendHold / 2);

    updateWorld(dt, t);
    const done = tickKeeperHour(dt);
    if (done) showToast('One stop warmer. The coast holds its breath at this hour.', 4500);

    // the Golden Shore turns only in the keeper's hour
    if (town.beam) {
      const on = WORLD.keeperHour;
      town.beam.children.forEach(b => {
        b.material.opacity = THREE.MathUtils.lerp(b.material.opacity, on ? 0.13 : 0, dt * 1.5);
        if (b.children[0]) b.children[0].material.opacity = b.material.opacity * 0.6;
      });
      if (on && !WORLD.reducedMotion) town.beam.rotation.y += dt * 0.35;
    }

    town.lanterns.tick(WORLD.camera.position, t);

    const tendedStations = town.stations.filter(s => tended.has(s.slug));
    const qs = overlay.readPages.has('/cms/quick-start') ? null : town.bySlug.get('/cms/quick-start');
    drawCompass(WORLD.camera.rotation.y, tendedStations, qs, WORLD.camera.position);

    if (!WORLD.reducedMotion) {
      grainTick += dt;
      if (grainTick > 0.09) {
        grainTick = 0;
        grainEl.style.backgroundPosition = `${(Math.random() * 160) | 0}px ${(Math.random() * 160) | 0}px`;
      }
    }

    if (!WORLD.contextLost) WORLD.renderer.render(WORLD.scene, WORLD.camera);
  }
  frame();
  window.__ready = true;
}

boot().catch(err => {
  console.error(err);
  setStatus('The light failed to rise: ' + err.message);
});
