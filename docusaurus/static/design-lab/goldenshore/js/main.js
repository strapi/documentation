// The Golden Shore. A golden-hour headland where all the real pages of the
// Strapi documentation stand as lantern-lit waystations, and walking is reading.

import * as THREE from 'three';
import { loadData, safeStore } from './data.js';
import { createRenderer, initWorld, updateWorld, enterKeeperHour, tickKeeperHour, WORLD, setRimGlobal, SKY_GAIN, setSun } from './world.js';
import { buildTown } from './town.js';
import { buildVegetation } from './vegetation.js';
import { buildProps } from './props.js';
import { initPlayer } from './player.js';
import {
  initOverlay, openReader, closeReader, isReaderOpen, tend, getTended,
  toggleLogbook, keeperHourEarned, showToast, updateLabel, drawCompass,
} from './overlay.js';
import { TERRACES, groundAt, surfaceAt, provinceAt, GATES } from './terrain.js';
import { initWeather, tickWeather, WEATHER } from './weather.js';
import { buildKeepers } from './keepers.js';
import { initAudio } from './audio.js';

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
  const cap = window.__perfCap || 900;
  if (frameTimes.length > cap) frameTimes.shift();
}
window.__perf = () => {
  const arr = frameTimes.slice().sort((a, b) => a - b);
  if (!arr.length) return { p50: 0, p95: 0, samples: 0 };
  return { // reported without rounding, as the law demands
    p50: arr[Math.floor(arr.length * 0.5)],
    p95: arr[Math.floor(arr.length * 0.95)],
    samples: arr.length,
  };
};
window.__perfReset = () => { frameTimes.length = 0; window.__maxDraws = 0; };

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

  // ----- the living coast: weather, keepers, sound -----
  setStatus('Reading the sky...');
  initWeather(WORLD.scene, reducedMotion);
  const npcs = buildKeepers(WORLD.scene, data, town, reducedMotion);
  const audio = initAudio();
  window.__audio = audio;
  const audioBtn = document.getElementById('audiobtn');
  const setGlyph = () => {
    if (!audioBtn) return;
    audioBtn.classList.toggle('off', !audio.on);
    audioBtn.textContent = audio.on ? '♫' : '×';
  };
  setGlyph();
  const armOnce = () => audio.arm();
  window.addEventListener('pointerdown', armOnce, { once: true });
  window.addEventListener('keydown', armOnce, { once: true });
  if (audioBtn) audioBtn.addEventListener('click', () => {
    audio.arm();
    audio.toggle();
    setGlyph();
    showToast(audio.on ? 'Sound on, gentle by default. M turns it off.' : 'Sound off. The coast keeps working in silence.');
  });
  WEATHER.thunderCb = () => audio.thunder();
  WEATHER.tickCb = (name, label) => { if (name === 'squall') showToast('Weather off the sea. ' + label + '.', 5000); };
  npcs.onSpeak = () => audio.knock();

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
    if (e.code === 'KeyM' && !e.repeat) {
      audio.arm();
      audio.toggle();
      setGlyph();
      showToast(audio.on ? 'Sound on, gentle by default.' : 'Sound off. Nothing on this coast needs it.');
    }
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
  window.__W = WORLD;
  window.__gy = (x, z) => groundAt(x, z);
  window.__prov = (x, z) => provinceAt(x, z);
  window.__slugs = () => town.stations.map(s => s.slug);
  window.__stationsFull = () => town.stations.map(s => ({ slug: s.slug, x: s.x, z: s.z, yaw: s.yaw, province: s.province, inbound: s.inbound, type: s.type }));
  window.__gates = () => GATES.map(g => ({ x: g.x, z: g.z, r: g.r, ang: g.ang, from: g.from, to: g.to, name: g.name }));
  window.__clear = (x, z) => { let m = 1e9; for (const c of colliders) m = Math.min(m, Math.hypot(x - c.x, z - c.z) - c.r); return m; };
  window.__world = {
    teleport: (x, z, yaw) => player.teleport(x, z, yaw),
    look: (yaw, pitch) => { WORLD.camera.rotation.y = yaw; WORLD.camera.rotation.x = pitch || 0; },
    pos: () => ({ x: WORLD.camera.position.x, y: WORLD.camera.position.y, z: WORLD.camera.position.z }),
    stations: town.stations.map(s => ({ slug: s.slug, x: s.x, z: s.z })),
    openPage: (slug) => openReader(slug),
    keeperHour: () => WORLD.keeperHour,
    rim: (v) => setRimGlobal(v),
    fly: (x, y, z, yaw, pitch) => {
      window.__flying = true;
      WORLD.camera.position.set(x, y, z);
      WORLD.camera.rotation.y = yaw || 0;
      WORLD.camera.rotation.x = pitch || 0;
    },
    walkAgain: () => { window.__flying = false; },
    sky: (v) => { SKY_GAIN.value = v; },
    sun: (el) => setSun(el),
    expo: (v) => { WORLD.renderer.toneMappingExposure = v; },
    draws: () => WORLD.renderer.info.render.calls,
    walk: (pts, dur) => {
      const segs = []; let L = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const dx = pts[i + 1][0] - pts[i][0], dz = pts[i + 1][1] - pts[i][1];
        const l = Math.hypot(dx, dz);
        segs.push({ a: pts[i], b: pts[i + 1], l0: L, l }); L += l;
      }
      window.__walkState = { segs, L, dur, t: 0 };
      window.__walkDone = false;
      window.__flying = true;
    },
    census: () => {
      const out = {};
      WORLD.scene.traverse(o => {
        if (o.isMesh || o.isPoints || o.isSprite) {
          const k = o.isInstancedMesh ? 'instanced' : o.isPoints ? 'points' : o.isSprite ? 'sprite' : 'mesh';
          out[k] = (out[k] || 0) + 1;
        }
      });
      return out;
    },
  };

  // ----- the loop -----
  const clock = new THREE.Clock();
  let grainTick = 0;
  const lastCamPos = WORLD.camera.position.clone();
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.1);
    const t = clock.elapsedTime;
    notePerf(dt);

    if (!isReaderOpen() && !window.__flying) {
      player.enabled = true;
      player.update(dt);
    } else {
      player.enabled = false;
    }

    const ws = window.__walkState;
    if (ws) {
      ws.t += dt;
      const d = Math.min(1, ws.t / ws.dur) * ws.L;
      let seg = ws.segs[ws.segs.length - 1];
      for (const s of ws.segs) if (d <= s.l0 + s.l) { seg = s; break; }
      const tt2 = seg.l ? (d - seg.l0) / seg.l : 0;
      const wx = seg.a[0] + (seg.b[0] - seg.a[0]) * tt2, wz = seg.a[1] + (seg.b[1] - seg.a[1]) * tt2;
      WORLD.camera.position.set(wx, groundAt(wx, wz) + 1.65, wz);
      WORLD.camera.rotation.y = Math.atan2(-(seg.b[0] - seg.a[0]), -(seg.b[1] - seg.a[1]));
      WORLD.camera.rotation.x = -0.03;
      if (ws.t >= ws.dur) { window.__walkState = null; window.__flying = false; window.__walkDone = true; }
    }
    findTarget();
    if (tendActive && target && targetDist <= 9 && !tended.has(target.slug)) {
      tendHold += dt;
      if (tendHold >= 2) {
        tendActive = false; tendHold = 0;
        if (tend(target.slug)) {
          town.lanterns.setTended(target.slug);
          audio.tendChime();
          showToast('You cup the flame. It steadies, and it will know you when you return.');
        }
      }
    } else if (!tendActive) tendHold = 0;
    updateLabel(isReaderOpen() ? null : target, targetDist, tendHold / 2);

    tickWeather(dt, t);
    updateWorld(dt, t);
    const done = tickKeeperHour(dt);
    if (done) showToast('One stop warmer. The coast holds its breath at this hour.', 4500);

    // the living coast walks its rounds
    const cam = WORLD.camera;
    npcs.tick(t, dt, { x: cam.position.x, z: cam.position.z });
    const movedNow = cam.position.distanceTo(lastCamPos);
    lastCamPos.copy(cam.position);
    audio.tick(dt, {
      x: cam.position.x, y: cam.position.y, z: cam.position.z,
      readerOpen: isReaderOpen(),
      gust: WORLD.gustAmp, state: WEATHER.state, rain: WEATHER.rain,
      moved: movedNow < 1 ? movedNow : 0,
      surface: surfaceAt(cam.position.x, cam.position.z),
      lanternNear: target && targetDist < 6 ? 1 - targetDist / 6 : 0,
      gullExcite: WORLD.gullExcite || 0,
      goats: npcs.goats,
      inUplands: provinceAt(cam.position.x, cam.position.z) === 'highland',
    });

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
    if (town.tickLife) town.tickLife(t, dt, WORLD.reducedMotion);

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

    if (!WORLD.contextLost) {
      WORLD.renderer.render(WORLD.scene, WORLD.camera);
      // the honest draw-call figure is the peak over a walk, not the last frame
      const dc = WORLD.renderer.info.render.calls;
      if (dc > (window.__maxDraws || 0)) window.__maxDraws = dc;
    }
  }
  frame();
  window.__ready = true;
}

boot().catch(err => {
  console.error(err);
  setStatus('The light failed to rise: ' + err.message);
});
