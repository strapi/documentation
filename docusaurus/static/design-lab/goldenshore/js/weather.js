// Weather as passing events on a ten-minute coast clock. Four states:
// Clear Gold, Sirocco Haze, Squall Passage (a curtain marches in over 90
// seconds, rain, then a held double rainbow), and Mist Burn-off on some
// arrivals. Transitions ease over 20 to 40 seconds; reduced motion gets the
// same states as one-second crossfades with nothing marching. A telegraph
// pennant on the pier hoists the next state's color half a minute early.

import * as THREE from 'three';
import { WORLD, SKY_GAIN, setRimGlobal, addWind, noReflect } from './world.js';
import { provinceWeights, PROVINCE_KEYS } from './terrain.js';

// ---------- how each state lands in each province ----------
// The event is one event: the same squall crosses the whole coast on the same
// clock, and you watch it come in off the sea whichever province you stand in.
// What changes is what it DOES when it gets to you, because weather is
// climate, not a filter. A squall over open water is rain; the same squall
// over the red terraces is mostly dust and gust; in the pines it holds and
// drips; on the bare Wall you are half above it and it is mostly wind.
const PROV_WX = {
  clear: {
    harbor:   { dens: 1.00, rain: 1, gust: 1.00, sun: 1.00 },
    terraces: { dens: 1.05, rain: 1, gust: 0.95, sun: 1.00 },
    highland: { dens: 1.25, rain: 1, gust: 0.80, sun: 0.94, fog: 0xC9BFA0 },
    wall:     { dens: 0.72, rain: 1, gust: 1.35, sun: 1.06 },
    cloud:    { dens: 0.90, rain: 1, gust: 1.15, sun: 1.03 },
  },
  sirocco: {
    // the hot wind comes off the land: the red terraces give it its dust
    harbor:   { dens: 0.95, rain: 1, gust: 1.05, sun: 1.00 },
    terraces: { dens: 1.35, rain: 1, gust: 1.30, sun: 0.94, fog: 0xD79458 },
    highland: { dens: 1.05, rain: 1, gust: 0.85, sun: 0.98 },
    wall:     { dens: 1.20, rain: 1, gust: 1.55, sun: 0.96, fog: 0xE0B27A },
    cloud:    { dens: 0.62, rain: 1, gust: 1.10, sun: 1.08 }, // the sea washes it out
  },
  squall: {
    harbor:   { dens: 1.00, rain: 1.00, gust: 1.00, sun: 1.00 },
    terraces: { dens: 1.10, rain: 0.55, gust: 1.25, sun: 1.10, fog: 0x9C8878 },
    highland: { dens: 1.30, rain: 0.85, gust: 0.70, sun: 0.86, fog: 0x7E8688 },
    wall:     { dens: 0.55, rain: 0.35, gust: 1.60, sun: 1.30 }, // half above it
    cloud:    { dens: 1.05, rain: 1.15, gust: 1.30, sun: 0.94 },
  },
  mist: {
    // the burn-off pools where the ground is cold: under the pines and at sea
    harbor:   { dens: 1.00, rain: 1, gust: 1.00, sun: 1.00 },
    terraces: { dens: 0.80, rain: 1, gust: 1.00, sun: 1.10 },
    highland: { dens: 1.55, rain: 1, gust: 0.65, sun: 0.80, fog: 0xC6C2B4 },
    wall:     { dens: 0.35, rain: 1, gust: 1.20, sun: 1.35 }, // above it by now
    cloud:    { dens: 1.40, rain: 1, gust: 0.95, sun: 0.86, fog: 0xEFE0C4 },
  },
};
const _pwFog = new THREE.Color();

const STATES = {
  clear: {
    fog: new THREE.Color(0xf5ad76).multiplyScalar(1.42), density: 0.0023,
    gain: 0.40, turb: 8.0, disc: 1.0, halo: 1.0, rim: 1.0, gust: 1.0,
    sun: 8.6, hemi: 1.18, env: 0.62, ray: 1.0, water: new THREE.Color(0x0a2e3a),
    glitter: 1.0, pennant: 0xE8B54A, label: 'Clear Gold',
  },
  sirocco: {
    fog: new THREE.Color(0xE2A868).multiplyScalar(2.05), density: 0.0044,
    gain: 0.33, turb: 14.0, disc: 0.72, halo: 1.0, rim: 0.75, gust: 1.55,
    sun: 6.2, hemi: 1.30, env: 0.55, ray: 0.5, water: new THREE.Color(0x173038),
    glitter: 0.7, pennant: 0xC7793A, label: 'Sirocco Haze',
  },
  squall: {
    fog: new THREE.Color(0x8E8E96).multiplyScalar(1.15), density: 0.0062,
    gain: 0.20, turb: 17.0, disc: 0.0, halo: 0.12, rim: 0.22, gust: 2.6,
    sun: 2.4, hemi: 0.92, env: 0.34, ray: 0.0, water: new THREE.Color(0x2A363C),
    glitter: 0.12, pennant: 0x49566A, label: 'Squall Passage',
  },
  mist: {
    fog: new THREE.Color(0xEACFAE).multiplyScalar(1.55), density: 0.0090,
    gain: 0.29, turb: 10.5, disc: 0.34, halo: 0.55, rim: 0.5, gust: 0.6,
    sun: 4.4, hemi: 1.24, env: 0.5, ray: 0.35, water: new THREE.Color(0x1C333A),
    glitter: 0.4, pennant: 0xD8CDBD, label: 'Mist Burn-off',
  },
};

// The ten-minute round: when each state holds the coast.
function stateAt(clock, mistArrival) {
  if (mistArrival && clock < 28) return 'mist';
  if (clock < 300) return 'clear';
  if (clock < 396) return 'sirocco';
  if (clock < 424) return 'clear';
  if (clock < 540) return 'squall';
  return 'clear';
}

export const WEATHER = {
  clock: 0, state: 'clear', cur: null, rain: 0, curtainX: -1500,
  rainbow: 0, thunderCb: null, tickCb: null, frozen: false,
};

let rainPts = null, rainGeo = null, rainMat = null, rainVel = null;
let curtain = null, bow = null, pennant = null, pennantMat = null;
let nextThunder = 0;

function makeCurtain(scene) {
  const g = new THREE.Group();
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, 'rgba(58,62,74,0.98)');
  grad.addColorStop(0.55, 'rgba(66,70,82,0.85)');
  grad.addColorStop(1, 'rgba(84,88,98,0.15)');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 64, 256);
  // streaks of falling rain under the cloud base
  ctx.strokeStyle = 'rgba(150,158,170,0.25)'; ctx.lineWidth = 2;
  for (let k = 0; k < 22; k++) {
    const x = Math.random() * 64;
    ctx.beginPath(); ctx.moveTo(x, 100 + Math.random() * 40);
    ctx.lineTo(x - 6, 256); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  for (let i = 0; i < 3; i++) {
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity: 0, depthWrite: false, fog: false,
      side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2600 - i * 500, 430 - i * 80), mat);
    m.rotation.y = Math.PI / 2;
    m.position.set(-60 * i, 200 - i * 25, (i - 1) * 300);
    m.renderOrder = 4;
    g.add(m);
  }
  g.position.x = -1500;
  noReflect(g);
  scene.add(g);
  return g;
}

function makeRain(scene) {
  const N = 2200;
  rainGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  rainVel = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 70;
    pos[i * 3 + 1] = Math.random() * 34;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 70;
    rainVel[i] = 17 + Math.random() * 9;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const c = document.createElement('canvas'); c.width = 8; c.height = 32;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 32);
  g.addColorStop(0, 'rgba(200,214,228,0)');
  g.addColorStop(0.5, 'rgba(200,214,228,0.85)');
  g.addColorStop(1, 'rgba(200,214,228,0)');
  ctx.fillStyle = g; ctx.fillRect(2, 0, 4, 32);
  rainMat = new THREE.PointsMaterial({
    map: new THREE.CanvasTexture(c), size: 0.55, transparent: true,
    opacity: 0, depthWrite: false, color: 0xC9D5E2, sizeAttenuation: true,
  });
  rainPts = new THREE.Points(rainGeo, rainMat);
  rainPts.frustumCulled = false;
  rainPts.visible = false;
  noReflect(rainPts);
  scene.add(rainPts);
}

function makeBow(scene) {
  // the held double rainbow, drawn honestly: primary bright, secondary
  // fainter with its colors reversed, violet shared with nothing else
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const ctx = c.getContext('2d');
  const cx = 256, cy = 256;
  const bands = [
    ['rgba(255,90,80,', 1.0], ['rgba(255,170,60,', 0.9], ['rgba(250,230,90,', 0.8],
    ['rgba(120,210,110,', 0.75], ['rgba(90,160,240,', 0.8], ['rgba(120,90,220,', 0.7],
  ];
  const draw = (r0, w, alpha, reversed) => {
    const bs = reversed ? bands.slice().reverse() : bands;
    bs.forEach((b, i) => {
      ctx.strokeStyle = b[0] + (alpha * b[1]).toFixed(3) + ')';
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.arc(cx, cy, r0 + i * w, Math.PI, 2 * Math.PI);
      ctx.stroke();
    });
  };
  draw(148, 5, 0.85, false);   // primary
  draw(196, 4, 0.33, true);    // secondary, reversed, fainter
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: true, opacity: 0, depthWrite: false, fog: false,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1700, 850), mat);
  // anti-solar: the sun stands west, the bow stands over the town to the east
  m.position.set(720, 260, -40);
  m.rotation.y = -Math.PI / 2;
  m.renderOrder = 5;
  noReflect(m);
  scene.add(m);
  return m;
}

function makePennant(scene) {
  // the telegraph pennant on the pier: tomorrow's weather, hoisted early
  const g = new THREE.Group();
  const mastM = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.08, 4.4, 6),
    new THREE.MeshStandardMaterial({ color: 0x5a4630, roughness: 1 }));
  mastM.position.y = 2.2;
  mastM.castShadow = true;
  g.add(mastM);
  const cloth = new THREE.PlaneGeometry(1.15, 0.62, 4, 2);
  cloth.translate(0.58, 0, 0);
  pennantMat = new THREE.MeshStandardMaterial({
    color: 0xE8B54A, roughness: 0.85, side: THREE.DoubleSide,
  });
  addWind(pennantMat, 0.08, 'all');
  const flag = new THREE.Mesh(cloth, pennantMat);
  flag.position.y = 4.1;
  g.add(flag);
  g.position.set(-88.5, 1.35, 3.0);
  scene.add(g);
  return g;
}

export function initWeather(scene, reducedMotion) {
  WEATHER.reduced = reducedMotion;
  // mist burn-off on some arrivals: an honest coin, not a pretense of data
  WEATHER.mistArrival = Math.random() < 0.4;
  WEATHER.clock = 30; // arrive in the clear unless the mist coin says otherwise
  if (WEATHER.mistArrival) WEATHER.clock = 0;
  const q = new URLSearchParams(location.search);
  if (q.has('wx')) { // probe control: fixed state, frozen clock
    WEATHER.frozen = true;
    WEATHER.forced = q.get('wx');
  }
  makeRain(scene);
  curtain = makeCurtain(scene);
  bow = makeBow(scene);
  pennant = makePennant(scene);
  // start settled in the opening state
  const st = STATES[WEATHER.forced || stateAt(WEATHER.clock, WEATHER.mistArrival)] || STATES.clear;
  WEATHER.cur = {};
  for (const k of ['density', 'gain', 'turb', 'disc', 'halo', 'rim', 'gust', 'sun', 'hemi', 'env', 'ray', 'glitter']) WEATHER.cur[k] = st[k];
  WEATHER.cur.fog = st.fog.clone();
  WEATHER.cur.water = st.water.clone();
  window.__weather = {
    set(name) { WEATHER.forced = STATES[name] ? name : null; WEATHER.frozen = !!STATES[name]; },
    run() { WEATHER.forced = null; WEATHER.frozen = false; },
    clockTo(s) { WEATHER.clock = s; WEATHER.frozen = false; WEATHER.forced = null; },
    state: () => WEATHER.state, clock: () => WEATHER.clock, rain: () => WEATHER.rain,
    bow(v) { WEATHER.forceBow = !!v; },
  };
  return WEATHER;
}

const _v = new THREE.Vector3();
export function tickWeather(dt, t) {
  if (!WEATHER.frozen) WEATHER.clock = (WEATHER.clock + dt) % 600;
  const name = WEATHER.forced || stateAt(WEATHER.clock, WEATHER.mistArrival && WEATHER.clock < 590);
  const changed = name !== WEATHER.state;
  WEATHER.state = name;
  const st = STATES[name];
  const cur = WEATHER.cur;

  // eased transitions: 20 to 40 s in full motion, one second reduced
  const tau = WEATHER.reduced ? 1.0 : (name === 'squall' ? 40 : 24);
  const k = 1 - Math.exp(-dt * (3 / tau));
  for (const key of ['density', 'gain', 'turb', 'disc', 'halo', 'rim', 'gust', 'sun', 'hemi', 'env', 'ray', 'glitter']) {
    cur[key] += (st[key] - cur[key]) * k;
  }
  cur.fog.lerp(st.fog, k);
  cur.water.lerp(st.water, k);

  // ----- the province the walker is standing in weights the event -----
  // Eased with the same soft field the ground uses, so crossing a border
  // changes the weather over you as gradually as it changes the earth.
  const W = WORLD;
  const cam = W.camera.position;
  const pwv = provinceWeights(cam.x, cam.z);
  const tab = PROV_WX[name] || PROV_WX.clear;
  let mDens = 0, mRain = 0, mGust = 0, mSun = 0, fogW = 0;
  _pwFog.setRGB(0, 0, 0);
  for (let i = 0; i < PROVINCE_KEYS.length; i++) {
    const e = tab[PROVINCE_KEYS[i]] || tab.harbor;
    const w = pwv[i];
    mDens += e.dens * w; mRain += e.rain * w; mGust += e.gust * w; mSun += e.sun * w;
    if (e.fog) { _pwFog.r += ((e.fog >> 16) & 255) / 255 * w; _pwFog.g += ((e.fog >> 8) & 255) / 255 * w; _pwFog.b += (e.fog & 255) / 255 * w; fogW += w; }
  }
  // the local mix follows the walker at walking pace, never snapping
  const kk = 1 - Math.exp(-dt * 0.9);
  WEATHER.local = WEATHER.local || { dens: 1, rain: 1, gust: 1, sun: 1, fogW: 0, fog: new THREE.Color(1, 1, 1) };
  const L = WEATHER.local;
  L.dens += (mDens - L.dens) * kk; L.rain += (mRain - L.rain) * kk;
  L.gust += (mGust - L.gust) * kk; L.sun += (mSun - L.sun) * kk;
  L.fogW += (fogW - L.fogW) * kk;
  if (fogW > 0.001) L.fog.lerp(_pwFog.clone().multiplyScalar(1 / fogW), kk);

  // hand the eased weather to the world
  W.scene.fog.color.copy(cur.fog);
  if (L.fogW > 0.01) W.scene.fog.color.lerp(L.fog, Math.min(0.85, L.fogW) * 0.55);
  W.scene.fog.density = cur.density * L.dens;
  SKY_GAIN.value = cur.gain;
  W.sky.material.uniforms.turbidity.value = cur.turb;
  W.sun.intensity = cur.sun * L.sun;
  W.hemi.intensity = cur.hemi;
  W.scene.environmentIntensity = cur.env;
  W.gustAmp = cur.gust * L.gust;
  W.godRayGain = cur.ray;
  setRimGlobal(cur.rim);
  if (W.sunDisc) {
    W.sunDisc.material.opacity = cur.disc;
    W.sunHalo.material.opacity = 0.85 * cur.halo;
  }
  if (W.water) {
    W.water.material.uniforms.waterColor.value.copy(cur.water);
    W.water.material.uniforms.sunColor.value.setRGB(8.5 * cur.glitter, 2.9 * cur.glitter, 0.5 * cur.glitter);
  }

  // ----- the squall curtain marches in from the west over 90 seconds -----
  const sq = WEATHER.clock >= 396 && WEATHER.clock < 560 && !WEATHER.forced;
  const forcedSq = WEATHER.forced === 'squall';
  let curtainT = 0; // 0 far at sea, 1 overhead
  if (forcedSq) curtainT = 0.9;
  else if (sq) {
    if (WEATHER.clock < 424) curtainT = 0;
    else if (WEATHER.clock < 514) curtainT = (WEATHER.clock - 424) / 90;
    else curtainT = Math.max(0, 1 - (WEATHER.clock - 514) / 30);
  }
  if (WEATHER.reduced) {
    // nothing marches: the curtain stands at mid-sea and only fades
    curtain.position.x = -700;
    curtain.children.forEach(m => { m.material.opacity = 0.5 * curtainT; });
  } else {
    curtain.position.x = -1500 + curtainT * 1360;
    curtain.position.z = WORLD.camera.position.z * 0.6;
    curtain.children.forEach((m, i) => {
      m.material.opacity = Math.min(0.86, curtainT * 1.3) * (1 - i * 0.18);
    });
  }

  // rain rides the last third of the march and the first held minute
  const rainTarget = (forcedSq || (sq && WEATHER.clock >= 480 && WEATHER.clock < 528)) ? Math.min(1.2, L.rain) : 0;
  WEATHER.rain += (rainTarget - WEATHER.rain) * (1 - Math.exp(-dt * (WEATHER.reduced ? 3 : 0.35)));
  if (rainPts) {
    const r = WEATHER.rain;
    rainPts.visible = r > 0.02 && !WEATHER.reduced;
    rainMat.opacity = 0.75 * r;
    if (rainPts.visible) {
      const pos = rainGeo.attributes.position.array;
      const cx = WORLD.camera.position.x, cy = WORLD.camera.position.y, cz = WORLD.camera.position.z;
      rainPts.position.set(cx, cy, cz);
      for (let i = 0; i < rainVel.length; i++) {
        pos[i * 3 + 1] -= rainVel[i] * dt;
        pos[i * 3] += dt * 6; // the squall's own drift, west wind
        if (pos[i * 3 + 1] < -4) {
          pos[i * 3 + 1] = 26 + Math.random() * 8;
          pos[i * 3] = (Math.random() - 0.5) * 70;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 70;
        }
      }
      rainGeo.attributes.position.needsUpdate = true;
    }
  }

  // thunder: soft rumbles while the rain stands, never cracks
  if (WEATHER.rain > 0.4 && WEATHER.thunderCb && !WEATHER.reduced) {
    if (t > nextThunder) {
      nextThunder = t + 14 + Math.random() * 18;
      WEATHER.thunderCb();
    }
  }

  // the held double rainbow, after the rain, sun back out
  let bowTarget = 0;
  if (!WEATHER.forced && WEATHER.clock >= 526 && WEATHER.clock < 578) bowTarget = 1;
  if (WEATHER.forceBow) bowTarget = 1; // plates may ask for it
  WEATHER.rainbow += (bowTarget - WEATHER.rainbow) * (1 - Math.exp(-dt * (WEATHER.reduced ? 3 : 0.25)));
  if (bow) {
    bow.material.opacity = 0.5 * WEATHER.rainbow * Math.min(1, cur.disc + 0.35);
    bow.visible = WEATHER.rainbow > 0.02;
  }

  // pennant hoists the color of what the clock brings next, 30 s early
  if (pennantMat) {
    const ahead = WEATHER.frozen ? name : stateAt((WEATHER.clock + 30) % 600, WEATHER.mistArrival);
    pennantMat.color.lerp(new THREE.Color(STATES[ahead].pennant), 1 - Math.exp(-dt * 1.2));
  }
  if (changed && WEATHER.tickCb) WEATHER.tickCb(name, STATES[name].label);
  return WEATHER;
}
