/* ALPENGLOW, world.js, the rubber-hose cut.
   One Canvas 2D world in the 1930s cartoon register:
   PAINT PASS   gouache-washed backgrounds baked offscreen (soft brush dabs),
   INK PASS     characters and living props in bold boiling outlines,
   FILM PASS    grain, scratches and the iris on a second canvas,
   CAST PASS    a dozing peak, a blinking sun, puffing clouds, ambient gags.
   Every silhouette and label still derives from the real corpus data. */

'use strict';

const World = (() => {

  /* ---------- constants ---------- */
  const INK = '#221a10';
  const ROPE = '#C4452C';
  const GREEN = '#3E7D5B';
  const CREAM = '#F7EBCE';
  const SKIN = '#F3D9AC';
  const LAMP = '#F5D9A0';

  /* Biome moods, assigned by OFFICIAL taxonomy section only (the law).
     Internal keys are never shown; visible names stay product + section. */
  const BIOMES = {
    meadow: { skyHi: '#8FD0E8', skyLo: '#F3EFC9', rockA: '#D9A15E', rockB: '#B07840', rockSh: '#7E5426',
      snow: '#FFF9EA', hillA: '#9AD08E', hillB: '#63AC6B', tree: '#3C7D50', flora: 'daisy', sil: 'rolling' },
    forest: { skyHi: '#6FB8CE', skyLo: '#DCEFC9', rockA: '#C08A50', rockB: '#8F6132', rockSh: '#5E4222',
      snow: '#F6F2E2', hillA: '#4E9367', hillB: '#2C6B49', tree: '#1E5A3D', flora: 'pine', sil: 'pines' },
    crag: { skyHi: '#9FA8CC', skyLo: '#F2D8B8', rockA: '#A395AE', rockB: '#786488', rockSh: '#524263',
      snow: '#F2EEE6', hillA: '#7B87A6', hillB: '#525F80', tree: '#3A5B62', flora: 'stone', sil: 'spires' },
    glacier: { skyHi: '#A8C8E8', skyLo: '#EAF5F8', rockA: '#9FC4D8', rockB: '#6E9AC0', rockSh: '#48688C',
      snow: '#FFFFFF', hillA: '#C2DCEC', hillB: '#8FB4D0', tree: '#3E7288', flora: 'ice', sil: 'saw' },
    skyway: { skyHi: '#F0B0C4', skyLo: '#FBEED2', rockA: '#E0B878', rockB: '#B98F52', rockSh: '#8A6432',
      snow: '#FFF6E8', hillA: '#FFF0DC', hillB: '#F3D4BC', tree: '#E8B8A0', flora: 'puff', sil: 'clouds' },
  };

  function biomeOf(massif) {
    if (!massif) return 'crag';
    if (massif.product === 'cloud') return 'skyway';
    const s = massif.section.toLowerCase();
    if (s === 'getting started') return 'meadow';
    if (s === 'features' || s === 'ai') return 'forest';
    if (s === 'upgrades') return 'glacier';
    return 'crag';
  }

  /* Day cycle phases (seconds). Tints are painted over the biome palette. */
  const PHASES = [
    { k: 'dawn', dur: 24, tint: '#F5B890', amt: 0.4, sky: '#F8C09A', skyAmt: 0.56 },
    { k: 'day', dur: 92, tint: '#FFFFFF', amt: 0.0, sky: '#FFFFFF', skyAmt: 0 },
    { k: 'golden', dur: 32, tint: '#F2A64E', amt: 0.42, sky: '#F6BE74', skyAmt: 0.58 },
    { k: 'dusk', dur: 34, tint: '#7A5E9E', amt: 0.48, sky: '#584878', skyAmt: 0.62 },
    { k: 'night', dur: 78, tint: '#22335C', amt: 0.7, sky: '#101D3C', skyAmt: 0.84 },
  ];

  let canvas, ctx, film, fx, W = 0, H = 0, dpr = 1;
  let scene = null;
  let camY = 0;
  let reduced = false;
  let onEvent = null;                 // main.js hook for gag / cast sounds
  let lastDrawT = null;

  /* ---------- color helpers ---------- */
  function parseC(c) {
    if (c[0] === '#') return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    const m = c.match(/([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)/);
    return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
  }
  function mixC(a, b, t) {
    const A = parseC(a), B = parseC(b);
    return 'rgb(' + Math.round(A[0] + (B[0] - A[0]) * t) + ',' + Math.round(A[1] + (B[1] - A[1]) * t) + ',' + Math.round(A[2] + (B[2] - A[2]) * t) + ')';
  }

  const PALCACHE = {};
  function phasePalette(biomeKey, phaseIdx) {
    const key = biomeKey + ':' + phaseIdx;
    if (PALCACHE[key]) return PALCACHE[key];
    const B = BIOMES[biomeKey], PH = PHASES[phaseIdx];
    const p = {};
    for (const f of ['rockA', 'rockB', 'rockSh', 'snow', 'hillA', 'hillB', 'tree']) p[f] = PH.amt ? mixC(B[f], PH.tint, PH.amt) : B[f];
    p.skyHi = PH.skyAmt ? mixC(B.skyHi, PH.sky, PH.skyAmt) : B.skyHi;
    p.skyLo = PH.skyAmt ? mixC(B.skyLo, PH.sky, PH.skyAmt * 0.8) : B.skyLo;
    PALCACHE[key] = p;
    return p;
  }

  /* ---------- the sky clock (day cycle) + weather director ---------- */
  const SKY = { idx: 1, t: 8, lock: false, fade: 1, prevIdx: 1 };
  const WX = { cur: 'clear', prev: 'clear', blend: 1, timer: 26, lock: false };
  const WXKINDS = ['clear', 'breeze', 'snow', 'fog'];

  function advanceSky(dt) {
    if (SKY.lock) return;
    SKY.t += dt;
    SKY.fade = Math.min(1, SKY.fade + dt / 2.8);
    if (SKY.t >= PHASES[SKY.idx].dur) {
      SKY.prevIdx = SKY.idx;
      SKY.idx = (SKY.idx + 1) % PHASES.length;
      SKY.t = 0; SKY.fade = 0;
      if (scene) { bakeLayers(scene, true, 'sky'); scene._bakeBack = true; }
      try { document.body.classList.toggle('night', SKY.idx >= 3); } catch (e) {}
    }
  }
  function wxIntensity(kind) {
    return (WX.cur === kind ? WX.blend : 0) + (WX.prev === kind ? 1 - WX.blend : 0);
  }
  function advanceWeather(dt, rng) {
    if (WX.lock) return;
    WX.blend = Math.min(1, WX.blend + dt / 3);
    WX.timer -= dt;
    if (WX.timer <= 0) {
      WX.prev = WX.cur;
      const bias = scene && scene.biome === 'glacier' ? ['snow', 'breeze', 'fog', 'clear'] : WXKINDS;
      let next = WX.cur;
      while (next === WX.cur) next = bias[Math.floor(Math.random() * bias.length)];
      WX.cur = next; WX.blend = 0;
      WX.timer = 36 + Math.random() * 26;
    }
  }
  function forceWeather(kind) { WX.cur = kind; WX.prev = kind; WX.blend = 1; WX.timer = 1e9; WX.lock = true; }

  /* ---------- boiling ink: 3 jitter tables cycling at ~11 fps ---------- */
  const BOIL = [[], [], []];
  {
    const r = rngFor('boil');
    for (let v = 0; v < 3; v++) for (let i = 0; i < 128; i++) BOIL[v].push((r() - 0.5) * 2);
  }
  let bv = 0, bk = 0;
  function bo(mag) { return BOIL[bv][(bk++) & 127] * (mag || 1); }
  function inkLine(w) { ctx.strokeStyle = INK; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; }

  /* ---------- brush kit for the paint pass ---------- */
  let brushBase = null;
  function makeBrush() {
    brushBase = document.createElement('canvas');
    brushBase.width = brushBase.height = 48;
    const b = brushBase.getContext('2d');
    const g = b.createRadialGradient(24, 24, 3, 24, 24, 23);
    g.addColorStop(0, 'rgba(255,255,255,.85)');
    g.addColorStop(0.65, 'rgba(255,255,255,.38)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    b.fillStyle = g;
    b.beginPath(); b.ellipse(24, 24, 22, 16, 0.4, 0, 7); b.fill();
  }
  function tintedBrush(color, cache) {
    if (cache[color]) return cache[color];
    const c = document.createElement('canvas');
    c.width = c.height = 48;
    const t = c.getContext('2d');
    t.drawImage(brushBase, 0, 0);
    t.globalCompositeOperation = 'source-in';
    t.fillStyle = color; t.fillRect(0, 0, 48, 48);
    cache[color] = c;
    return c;
  }
  /* dab a stroke of gouache inside the current clip */
  function dabs(g, brushes, color, n, x0, y0, x1, y1, size, alpha, rng) {
    const br = tintedBrush(color, brushes);
    g.globalAlpha = alpha;
    for (let i = 0; i < n; i++) {
      const x = x0 + rng() * (x1 - x0), y = y0 + rng() * (y1 - y0);
      const s = size * (0.6 + rng() * 0.9);
      g.save(); g.translate(x, y); g.rotate(rng() * 6.28);
      g.drawImage(br, -s / 2, -s / 2, s, s * (0.5 + rng() * 0.4));
      g.restore();
    }
    g.globalAlpha = 1;
  }

  /* wall texture tile (neutral gouache noise, multiplied over the rock) */
  let wallTile = null, wallPattern = null;
  function makeWallTile() {
    wallTile = document.createElement('canvas');
    wallTile.width = wallTile.height = 192;
    const g = wallTile.getContext('2d');
    const rng = rngFor('walltile');
    const cache = {};
    const put = (color, size, alpha) => {
      const br = tintedBrush(color, cache);
      const x = rng() * 192, y = rng() * 192, rot = rng() * 6.28, sy = size * (0.5 + rng() * 0.4);
      g.globalAlpha = alpha;
      for (let ox = -192; ox <= 192; ox += 192) for (let oy = -192; oy <= 192; oy += 192) {
        g.save(); g.translate(x + ox, y + oy); g.rotate(rot);
        g.drawImage(br, -size / 2, -sy / 2, size, sy);
        g.restore();
      }
      g.globalAlpha = 1;
    };
    for (let i = 0; i < 40; i++) put('#3a2c1a', 44 + rng() * 52, 0.085);
    for (let i = 0; i < 26; i++) put('#fff6e0', 40 + rng() * 52, 0.085);
    wallPattern = null;
  }

  function init(cv, filmCv) {
    canvas = cv; ctx = canvas.getContext('2d');
    film = filmCv; fx = film ? film.getContext('2d') : null;
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    makeBrush(); makeWallTile(); makeGrain();
    resize();
    window.addEventListener('resize', () => { resize(); if (scene) bakeLayers(scene); });
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (film) {
      film.width = Math.ceil(W * 0.5); film.height = Math.ceil(H * 0.5);   // film pass at half res: chunkier grain, cheaper raster
      film.style.width = W + 'px'; film.style.height = H + 'px';
      fx.setTransform(0.5, 0, 0, 0.5, 0, 0);
      filmKey = '';
    }
  }

  /* =================================================================
     SCENE BUILD, deterministic per slug (same page, same wobble)
     ================================================================= */
  function buildScene(slug) {
    const rng = rngFor(slug);
    const massif = Model.massifOf[slug];
    const pitchesMeta = pitchesOf(slug);
    const words = heightOf(slug);
    const isCol = slug === '/cms/migration/v4-to-v5/breaking-changes';

    const holds = [];
    const ledges = [];
    let y = 96;
    const cx0 = W * 0.60;
    for (let pi = 0; pi < pitchesMeta.length; pi++) {
      const pm = pitchesMeta[pi];
      const n = pm.boulder ? 6 : Math.max(4, Math.min(9, 4 + Math.round(words / pitchesMeta.length / 260)));
      const cx = cx0 + (rng() - 0.5) * 170;
      let side = rng() < 0.5 ? -1 : 1;
      for (let i = 0; i < n; i++) {
        holds.push({ x: cx + side * (30 + rng() * 46) + (rng() - 0.5) * 18, y: y, pitch: pi });
        y += 44 + rng() * 16;
        side = -side;
      }
      const last = holds[holds.length - 1];
      y += 30;
      ledges.push({ y, x: last.x, w: 120 + rng() * 50, pitch: pi, name: pm.name, id: pm.id, crux: pm.crux, clipT: -1e9 });
      y += 58;
    }
    const summitY = y + 46;

    const step = 48;
    const eN = Math.ceil((summitY + 260) / step) + 2;
    const leftE = [], rightE = [], midE = [];
    for (let i = 0; i < eN; i++) {
      const wy = i * step - 120;
      const t = Math.max(0, Math.min(1, wy / summitY));
      const halfW = (330 - 210 * t) + (rng() - 0.5) * 46;
      const c = cx0 + Math.sin(wy * 0.004 + rng()) * 26;
      leftE.push(c - halfW * (1 + 0.22 * Math.sin(wy * 0.006)));
      rightE.push(c + halfW * 0.9);
      midE.push(c + halfW * (0.34 + 0.14 * Math.sin(wy * 0.003 + 2)));
    }

    // ink squiggle cracks (seeded, sparse) + a few painted patches
    const cracks = [], patches = [];
    for (let k = 0; k < Math.min(22, 6 + holds.length); k++) {
      const wy = rng() * summitY;
      const i = Math.min(eN - 1, Math.floor((wy + 120) / step));
      const x0 = leftE[i] + 30 + rng() * (rightE[i] - leftE[i] - 60);
      const seg = [[x0, wy]];
      let xx = x0, yy = wy;
      for (let s = 0; s < 3; s++) { xx += (rng() - 0.5) * 30; yy += 18 + rng() * 26; seg.push([xx, yy]); }
      cracks.push(seg);
    }
    for (let wy = 120; wy < summitY; wy += 260 + rng() * 300) {
      const i = Math.min(eN - 1, Math.floor((wy + 120) / step));
      patches.push({ x: leftE[i] + 40 + rng() * (rightE[i] - leftE[i] - 90), y: wy, r: 26 + rng() * 44, a: rng() * 6.28 });
    }

    // far-ridge peaks: the massif's other summits, in ridge order
    const farPeaks = [];
    const others = massif.slugs.filter(s => s !== slug);
    const span = W * 1.25;
    others.forEach((s, i) => {
      const wds = heightOf(s);
      farPeaks.push({
        slug: s,
        x: (i + 0.5) / Math.max(1, others.length) * span - W * 0.12 + (rng() - 0.5) * 40,
        h: 46 + Math.min(wds, 6500) / 6500 * 140,
        fresh: freshState(s) === 'alpenglow',
        frost: freshState(s) === 'frost',
      });
    });

    // the distant most-recently-signed summit on the light line (data-picked)
    const distSlug = mostRecentlySigned();
    const distant = { slug: distSlug, title: titleOf(distSlug), x: W * 0.30, h: 150 };
    for (let i = farPeaks.length - 1; i >= 0; i--) {
      if (Math.abs(farPeaks[i].x - distant.x) < 120) farPeaks.splice(i, 1);
    }

    // the dozing mountain: the tallest far peak CLEAR OF THE WALL joins the cast
    let sleeper = null;
    for (const p of farPeaks) {
      const clear = (p.x > W * 0.04 && p.x < W * 0.26) || (p.x > W * 0.9 && p.x < W * 0.97);
      if (clear && (!sleeper || p.h > sleeper.h)) sleeper = p;
    }
    if (!sleeper) for (const p of farPeaks) if (p.x > W * 0.04 && p.x < W * 0.3 && (!sleeper || p.h > sleeper.h)) sleeper = p;

    let colFan = null;
    if (isCol) {
      const inbound = (Model.inb[slug] || []).slice();
      const outbound = (Model.out[slug] || []).slice();
      const shortIn = inbound.map(s => titleOf(s)).sort((a, b) => a.length - b.length).slice(0, 3);
      colFan = { inbound, outbound, plates: shortIn };
    }

    scene = {
      slug, massif, rng, pitches: pitchesMeta, holds, ledges, summitY,
      leftE, rightE, midE, step, cracks, patches, farPeaks, distant, sleeper,
      words, grade: gradeOf(slug), isCol, colFan,
      inCount: Model.graph.inbound[slug] || 0,
      outCount: (Model.out[slug] || []).length,
      biome: biomeOf(massif),
      skyL: null, backL: null, prevSkyL: null, prevBackL: null,
      cloud: { x: W * (0.18 + rng() * 0.5), y: 0, drift: 4 + rng() * 5, puffT: -1e9 },
      boxWiggleT: -1e9,
    };
    bakeLayers(scene);
    return scene;
  }

  /* planche compatibility: lock the sky to a phase by name */
  function setTheme(t) {
    const NAMES = { dawn: 0, day: 1, golden: 2, dusk: 3, night: 4 };
    const idx = NAMES[t] != null ? NAMES[t] : 1;
    SKY.idx = idx; SKY.prevIdx = idx; SKY.t = 4; SKY.fade = 1; SKY.lock = true;
    try { document.body.classList.toggle('night', idx >= 3); } catch (e) {}
    if (scene) bakeLayers(scene);
  }

  /* =================================================================
     PAINT PASS: baked gouache layers (half resolution, scaled up)
     ================================================================= */
  function bakeLayers(sc, keepPrev, part) {
    part = part || 'both';
    if (keepPrev) {
      if (part !== 'back') sc.prevSkyL = sc.skyL;
      if (part !== 'sky') sc.prevBackL = sc.backL;
    }
    const P = phasePalette(sc.biome, SKY.idx);
    const s = 1;
    const bw = W, bh = H;
    const horizon = H * 0.62;
    sc.horizon = horizon;
    const brushes = {};
    const rng = rngFor(sc.slug + ':bake');

    /* --- sky wash --- */
    if (part !== 'back') {
    const sky = document.createElement('canvas');
    sky.width = bw; sky.height = bh;
    const sx = sky.getContext('2d');
    const bands = 9;
    for (let i = 0; i < bands; i++) {
      sx.fillStyle = mixC(P.skyHi, P.skyLo, i / (bands - 1));
      sx.fillRect(0, horizon * (i / bands) - 1, W, horizon / bands + 2);
    }
    // soft dabs to melt the bands into a wash
    for (let i = 0; i < 13; i++) {
      const t = i / 12;
      dabs(sx, brushes, mixC(P.skyHi, P.skyLo, t), 40, -20, horizon * t - 70, W + 20, horizon * t + 70, 250, 0.22, rng);
    }
    for (let i = 0; i < 48; i++) {
      const t = rng();
      dabs(sx, brushes, mixC(P.skyHi, P.skyLo, t), 1, -20, horizon * t - 46, W + 20, horizon * t + 46, 280, 0.12, rng);
    }
    // painted background clouds (soft, no ink: backgrounds are paint)
    const cloudC = mixC(P.snow, P.skyLo, 0.25);
    for (let i = 0; i < 3; i++) {
      const cx = rng() * W, cy = 60 + rng() * (horizon * 0.5), cw = 90 + rng() * 130;
      dabs(sx, brushes, cloudC, 16, cx - cw / 2, cy - 16, cx + cw / 2, cy + 16, 84, 0.32, rng);
    }
    // valley floor below the horizon
    sx.fillStyle = mixC(P.hillA, P.skyLo, 0.25);
    sx.fillRect(0, horizon, W, H - horizon);
    dabs(sx, brushes, P.hillA, 34, 0, horizon, W, H, 200, 0.26, rng);
    dabs(sx, brushes, mixC(P.hillA, P.snow, 0.4), 20, 0, horizon, W, H, 170, 0.16, rng);
    sc.skyL = sky;
    }
    if (part === 'sky') return;

    /* --- backdrop: far peaks, mid hills, treeline, flora strip --- */
    const back = document.createElement('canvas');
    back.width = bw; back.height = bh;
    const rx = back.getContext('2d');
    const hz = horizon;

    const farC = mixC(P.skyHi, P.snow, 0.42);
    for (const p of sc.farPeaks) drawFarPeak(rx, p, hz, sc.biome, farC, P, brushes, rng);

    // the distant most-recently-signed summit, wearing real alpenglow
    const d = sc.distant;
    rx.fillStyle = mixC(P.skyHi, P.snow, 0.28);
    rx.beginPath();
    rx.moveTo(d.x - d.h * 1.05, hz + 2);
    rx.quadraticCurveTo(d.x - d.h * 0.3, hz - d.h * 0.72, d.x, hz - d.h);
    rx.quadraticCurveTo(d.x + d.h * 0.28, hz - d.h * 0.7, d.x + d.h * 0.95, hz + 2);
    rx.closePath(); rx.fill();
    rx.fillStyle = '#E8A6A0';
    rx.beginPath();
    rx.moveTo(d.x, hz - d.h);
    rx.quadraticCurveTo(d.x - d.h * 0.22, hz - d.h * 0.66, d.x - d.h * 0.30, hz - d.h * 0.52);
    rx.lineTo(d.x + d.h * 0.26, hz - d.h * 0.52);
    rx.closePath(); rx.fill();
    rx.fillStyle = INK;
    rx.font = "700 11px 'Baloo 2', sans-serif";
    rx.textAlign = 'center';
    rx.save(); rx.globalAlpha = 0.7;
    rx.fillText(d.title.toUpperCase(), d.x, hz - d.h - 10);
    rx.restore();

    // mid hills band
    const mrng = rngFor(sc.slug + ':mid');
    rx.fillStyle = P.hillB;
    rx.beginPath(); rx.moveTo(-40, hz + 30);
    let mx = -40;
    while (mx < W + 60) {
      const pw = 150 + mrng() * 210, ph = 24 + mrng() * 64;
      if (sc.biome === 'skyway') {
        rx.quadraticCurveTo(mx + pw * 0.25, hz + 30 - ph, mx + pw * 0.5, hz + 30 - ph);
        rx.quadraticCurveTo(mx + pw * 0.75, hz + 30 - ph, mx + pw, hz + 30);
      } else if (sc.biome === 'meadow') {
        rx.quadraticCurveTo(mx + pw * 0.5, hz + 30 - ph * 1.4, mx + pw, hz + 30);
      } else {
        rx.lineTo(mx + pw * 0.5, hz + 30 - ph);
        rx.lineTo(mx + pw, hz + 30);
      }
      mx += pw;
    }
    rx.lineTo(W + 60, hz + 62); rx.lineTo(-40, hz + 62); rx.closePath(); rx.fill();
    rx.save();
    rx.beginPath(); rx.rect(0, hz - 120, W, 152); rx.clip();
    dabs(rx, brushes, mixC(P.hillB, P.snow, 0.25), 26, 0, hz - 70, W, hz + 26, 90, 0.16, mrng);
    rx.restore();

    // treeline / flora strip on the valley floor
    drawTreeline(rx, sc, hz, P, brushes, mrng);
    sc.backL = back;
  }

  function peakPath(rx, p, hz, biome) {
    rx.beginPath();
    if (biome === 'skyway') {
      // cloud towers: stacked puffs
      rx.moveTo(p.x - p.h * 0.9, hz + 2);
      rx.quadraticCurveTo(p.x - p.h * 0.9, hz - p.h * 0.5, p.x - p.h * 0.45, hz - p.h * 0.55);
      rx.quadraticCurveTo(p.x - p.h * 0.5, hz - p.h * 1.05, p.x, hz - p.h);
      rx.quadraticCurveTo(p.x + p.h * 0.5, hz - p.h * 1.02, p.x + p.h * 0.4, hz - p.h * 0.5);
      rx.quadraticCurveTo(p.x + p.h * 0.8, hz - p.h * 0.45, p.x + p.h * 0.8, hz + 2);
    } else if (biome === 'meadow') {
      rx.moveTo(p.x - p.h * 0.95, hz + 2);
      rx.quadraticCurveTo(p.x - p.h * 0.2, hz - p.h * 1.06, p.x + p.h * 0.15, hz - p.h * 0.72);
      rx.quadraticCurveTo(p.x + p.h * 0.55, hz - p.h * 0.4, p.x + p.h * 0.85, hz + 2);
    } else if (biome === 'glacier') {
      rx.moveTo(p.x - p.h * 0.9, hz + 2);
      rx.lineTo(p.x - p.h * 0.45, hz - p.h * 0.6);
      rx.lineTo(p.x - p.h * 0.2, hz - p.h * 0.42);
      rx.lineTo(p.x, hz - p.h);
      rx.lineTo(p.x + p.h * 0.22, hz - p.h * 0.5);
      rx.lineTo(p.x + p.h * 0.5, hz - p.h * 0.68);
      rx.lineTo(p.x + p.h * 0.8, hz + 2);
    } else if (biome === 'crag') {
      rx.moveTo(p.x - p.h * 0.7, hz + 2);
      rx.lineTo(p.x - p.h * 0.18, hz - p.h * 0.92);
      rx.lineTo(p.x, hz - p.h);
      rx.lineTo(p.x + p.h * 0.12, hz - p.h * 0.78);
      rx.lineTo(p.x + p.h * 0.55, hz + 2);
    } else {
      rx.moveTo(p.x - p.h * 0.9, hz + 2);
      rx.lineTo(p.x, hz - p.h);
      rx.lineTo(p.x + p.h * 0.8, hz + 2);
    }
    rx.closePath();
  }

  function drawFarPeak(rx, p, hz, biome, farC, P, brushes, rng) {
    peakPath(rx, p, hz, biome);
    rx.fillStyle = farC;
    rx.fill();
    // gouache pass inside the silhouette
    rx.save();
    peakPath(rx, p, hz, biome);
    rx.clip();
    dabs(rx, brushes, mixC(farC, P.snow, 0.4), 7, p.x - p.h * 0.7, hz - p.h, p.x + p.h * 0.1, hz, p.h * 0.55, 0.3, rng);
    dabs(rx, brushes, mixC(farC, P.skyHi, 0.45), 6, p.x - p.h * 0.1, hz - p.h * 0.8, p.x + p.h * 0.8, hz, p.h * 0.5, 0.3, rng);
    rx.restore();
    // alpenglow / frost caps stay honest to provenance
    if (p.fresh) {
      rx.fillStyle = '#E8A6A0';
      rx.beginPath();
      rx.moveTo(p.x, hz - p.h);
      rx.lineTo(p.x - p.h * 0.16, hz - p.h * 0.74);
      rx.lineTo(p.x + p.h * 0.14, hz - p.h * 0.74);
      rx.closePath(); rx.fill();
    } else if (p.frost) {
      rx.fillStyle = 'rgba(250,250,245,.85)';
      rx.beginPath();
      rx.moveTo(p.x, hz - p.h);
      rx.lineTo(p.x - p.h * 0.10, hz - p.h * 0.82);
      rx.lineTo(p.x + p.h * 0.09, hz - p.h * 0.82);
      rx.closePath(); rx.fill();
    }
  }

  function drawTreeline(rx, sc, hz, P, brushes, mrng) {
    const biome = sc.biome;
    if (biome === 'skyway') {
      // a shelf of little cloud puffs instead of trees
      rx.fillStyle = mixC(P.snow, P.hillA, 0.3);
      for (let x = -20; x < W + 40; x += 46) {
        const r = 16 + mrng() * 14;
        rx.beginPath(); rx.arc(x, hz + 66, r, 3.14, 0); rx.fill();
      }
      rx.fillStyle = P.hillA;
      rx.fillRect(-40, hz + 66, W + 100, 90);
      return;
    }
    rx.fillStyle = P.tree;
    rx.beginPath(); rx.moveTo(-40, hz + 60);
    let mx = -40;
    if (biome === 'meadow') {
      while (mx < W + 60) {
        const r = 10 + mrng() * 10;
        rx.quadraticCurveTo(mx + r, hz + 40 - mrng() * 14, mx + r * 2, hz + 60);
        mx += r * 2;
      }
    } else {
      while (mx < W + 60) { rx.lineTo(mx + 9, hz + 44 - mrng() * 16); rx.lineTo(mx + 18, hz + 60); mx += 18; }
    }
    rx.lineTo(W + 60, hz + 106); rx.lineTo(-40, hz + 106); rx.closePath(); rx.fill();
    // meadow strip + flora dots
    rx.fillStyle = mixC(P.hillA, P.snow, biome === 'glacier' ? 0.5 : 0.15);
    rx.fillRect(-40, hz + 104, W + 100, 40);
    for (let i = 0; i < 40; i++) {
      const fxp = mrng() * W, fy = hz + 108 + mrng() * 30;
      if (sc.biome === 'meadow') {
        rx.fillStyle = i % 3 ? '#FFF9EA' : '#E8A6A0';
        rx.beginPath(); rx.arc(fxp, fy, 2.2, 0, 7); rx.fill();
      } else if (sc.biome === 'glacier') {
        rx.fillStyle = 'rgba(255,255,255,.8)';
        rx.beginPath(); rx.arc(fxp, fy, 1.8, 0, 7); rx.fill();
      } else {
        rx.fillStyle = mixC(P.tree, P.hillA, 0.5);
        rx.beginPath(); rx.arc(fxp, fy, 1.8, 0, 7); rx.fill();
      }
    }
  }

  /* =================================================================
     PER-FRAME DRAW
     ================================================================= */
  function s2y(wy) { return H - 70 - (wy - camY); }

  /* current dynamic palette (crossfaded during phase changes) */
  let PALF = null, palfKey = '';
  function livePalette(biome) {
    const key = biome + ':' + SKY.idx + ':' + (SKY.fade < 1 ? SKY.fade.toFixed(2) : '1');
    if (key === palfKey && PALF) return PALF;
    const cur = phasePalette(biome, SKY.idx);
    if (SKY.fade >= 1) { PALF = cur; palfKey = key; return PALF; }
    const prev = phasePalette(biome, SKY.prevIdx);
    const e = SKY.fade * SKY.fade * (3 - 2 * SKY.fade);
    const p = {};
    for (const k in cur) p[k] = mixC(prev[k], cur[k], e);
    PALF = p; palfKey = key;
    return PALF;
  }

  function draw(G, t) {
    const sc = G.scene; if (!sc) return;
    scene = sc;
    const dt = lastDrawT == null ? 0 : Math.min(0.05, Math.max(0, (t - lastDrawT) / 1000));
    lastDrawT = t;
    bv = reduced ? 0 : Math.floor(t / 90) % 3;
    bk = 0;

    if (sc._bakeBack) { sc._bakeBack = false; bakeLayers(sc, true, 'back'); }
    advanceSky(dt);
    if (!reduced) advanceWeather(dt);
    tickGags(dt, G, t);

    const P = livePalette(sc.biome);
    const night = SKY.idx >= 3;

    // camera follows the climber (or rappel position)
    const focusY = G.mode === 'rappel' ? G.rappel.wy : (G.mode === 'summit' ? sc.summitY : climberPos(G).y);
    let target = Math.max(0, focusY - H * 0.44);
    const maxCam = Math.max(0, sc.summitY + 260 - H);
    target = Math.min(target, maxCam);
    camY = G.snapCamera ? target : camY + (target - camY) * 0.08;
    if (Math.abs(target - camY) < 0.5) camY = target;

    // PAINT PASS: baked washes (crossfade during phase changes)
    if (SKY.fade < 1 && sc.prevSkyL) {
      ctx.drawImage(sc.prevSkyL, 0, 0);
      ctx.globalAlpha = SKY.fade;
      ctx.drawImage(sc.skyL, 0, 0);
      ctx.globalAlpha = 1;
    } else ctx.drawImage(sc.skyL, 0, 0);

    drawSunMoon(sc, t, P);

    ctx.save();
    ctx.translate(0, Math.min(120, camY * 0.10));
    if (SKY.fade < 1 && sc.prevBackL) {
      ctx.drawImage(sc.prevBackL, 0, 0);
      ctx.globalAlpha = SKY.fade;
      ctx.drawImage(sc.backL, 0, 0);
      ctx.globalAlpha = 1;
    } else ctx.drawImage(sc.backL, 0, 0);
    if (sc.sleeper) drawSleeper(sc, t);
    ctx.restore();

    if (sc.isCol) drawColBackdrop(sc, night, P);
    if (night) drawHeadlamps(sc);

    // when the book is open the world slides left, standing beside the reading
    const bookOpen = !document.getElementById('book').hidden;
    const shiftTarget = bookOpen ? -W * 0.27 : 0;
    if (G.snapCamera || G.reduced) G.shiftX = shiftTarget;
    else G.shiftX = (G.shiftX || 0) + (shiftTarget - (G.shiftX || 0)) * 0.09;

    ctx.save();
    ctx.translate(G.shiftX || 0, 0);
    drawWall(sc, P);
    drawRoute(sc, G, night, t);
    if (sc.isCol) drawColFan(sc, G, night);
    if (G.mode === 'summit') drawSummitStation(sc, G, night, t);
    if (G.mode === 'rappel') drawRappel(sc, G, night, t);
    else drawClimber(sc, G, t, night);
    drawParticles(G, night);
    drawGags(sc, G, t);
    ctx.restore();

    drawCharacterCloud(sc, t, dt, P);   // the cloud sails in front of the wall, as clouds do in cartoons
    drawWeather(sc, dt, t, P);
    drawNotes(dt);
    if (G.showLogStrip) drawLogStrip(G, night);

    if (G.dimWorld) {
      ctx.fillStyle = night ? 'rgba(8,8,18,.45)' : 'rgba(40,28,12,.30)';
      ctx.fillRect(0, 0, W, H);
    }

    drawFilm(t, dt);
  }

  /* ---------- cast: sun and moon with faces ---------- */
  function drawSunMoon(sc, t, P) {
    const hz = sc.horizon;
    const ph = PHASES[SKY.idx].k;
    if (ph === 'night') {
      drawMoon(W * 0.82, hz - 300, t);
      return;
    }
    if (ph === 'dusk') { drawMoon(W * 0.9, hz - 330, t); return; }
    const sy = ph === 'dawn' ? hz - 170 : ph === 'golden' ? hz - 190 : hz - 300;
    const sxp = ph === 'golden' ? W * 0.86 : W * 0.13;
    const R = 34;
    // rays (boiling)
    ctx.save();
    ctx.translate(sxp, sy);
    ctx.fillStyle = ph === 'day' ? '#F7D96E' : '#F5B25C';
    inkLine(2.4);
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * 6.283 + (reduced ? 0 : Math.sin(t * 0.0012) * 0.05);
      const r1 = R + 6 + bo(1.6), r2 = R + 17 + bo(2.4);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a + 0.16) * r2, Math.sin(a + 0.16) * r2);
      ctx.lineTo(Math.cos(a + 0.32) * r1, Math.sin(a + 0.32) * r1);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    // face disc
    ctx.beginPath(); ctx.arc(bo(1), bo(1), R, 0, 7);
    ctx.fillStyle = '#FBE38A'; ctx.fill(); ctx.stroke();
    // the sun blinks (a fixture of the cast)
    const blink = reduced ? 0 : Math.max(0, Math.sin(t * 0.0006 % 6.283) > 0.997 ? 1 : (t % 4300 < 130 ? 1 : 0));
    pieEye(-11, -6, 6.5, blink); pieEye(11, -6, 6.5, blink);
    cheeks(-15, 4, 15, 4, 4);
    ctx.beginPath(); ctx.arc(0, 6, 9, 0.35, 2.79); inkLine(2.2); ctx.stroke();
    ctx.restore();
  }

  function drawMoon(x, y, t) {
    ctx.save();
    ctx.translate(x, y);
    inkLine(2.4);
    ctx.fillStyle = '#F2E6BC';
    ctx.beginPath(); ctx.arc(bo(1), bo(1), 30, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(210,196,150,.5)';
    ctx.beginPath(); ctx.arc(-9, 6, 5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -10, 3.4, 0, 7); ctx.fill();
    // nightcap
    ctx.fillStyle = '#5A6EA8';
    ctx.beginPath();
    ctx.moveTo(-22, -18); ctx.quadraticCurveTo(0, -44 + bo(2), 24, -20);
    ctx.quadraticCurveTo(34, -34, 44, -26);
    ctx.quadraticCurveTo(36, -22, 30, -12);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = CREAM; ctx.beginPath(); ctx.arc(44, -26, 4.5, 0, 7); ctx.fill(); ctx.stroke();
    // sleeping face
    inkLine(2);
    ctx.beginPath(); ctx.arc(-9, -2, 4.5, 0.3, 2.8); ctx.stroke();
    ctx.beginPath(); ctx.arc(9, -2, 4.5, 0.3, 2.8); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 12, 4, 3.4, 6.0); ctx.stroke();
    ctx.restore();
  }

  /* pie-cut eye: the register's signature */
  function pieEye(x, y, r, blink, lookA) {
    inkLine(1.8);
    ctx.fillStyle = '#FFFdf2';
    ctx.beginPath(); ctx.ellipse(x + bo(0.6), y + bo(0.6), r, r * 1.15, 0, 0, 7); ctx.fill(); ctx.stroke();
    if (blink > 0.5) {
      inkLine(2.2);
      ctx.beginPath(); ctx.moveTo(x - r * 0.8, y); ctx.quadraticCurveTo(x, y + r * 0.5, x + r * 0.8, y); ctx.stroke();
      return;
    }
    const la = lookA == null ? 1.9 : lookA;
    const px = x + Math.cos(la) * r * 0.28, py = y + Math.sin(la) * r * 0.28;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, r * 0.55, la + 0.5, la + 5.78);   // the pie cut
    ctx.closePath(); ctx.fill();
  }
  function cheeks(x1, y1, x2, y2, r) {
    ctx.fillStyle = 'rgba(232,140,120,.5)';
    ctx.beginPath(); ctx.arc(x1, y1, r, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(x2, y2, r, 0, 7); ctx.fill();
  }
  /* a white three-finger glove at (x, y), pointing along angle a */
  function glove(x, y, r, a) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(a || 0);
    inkLine(1.8);
    ctx.fillStyle = '#FFFDF4';
    ctx.beginPath(); ctx.arc(bo(0.7), bo(0.7), r, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(r * 0.75, -r * 0.5, r * 0.52, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(r * 0.9, r * 0.25, r * 0.52, 0, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  /* ---------- cast: the dozing mountain face ---------- */
  function drawSleeper(sc, t) {
    const p = sc.sleeper;
    const hz = sc.horizon;
    const s = Math.max(0.7, Math.min(1.25, p.h / 130));
    const fy = hz - p.h * 0.62;
    ctx.save();
    ctx.translate(p.x, fy);
    ctx.scale(s, s);
    const breathe = reduced ? 0 : Math.sin(t * 0.0011) * 1.6;
    ctx.translate(0, breathe);
    inkLine(2.2);
    // heavy closed eyes with lashes
    ctx.beginPath(); ctx.moveTo(-24, -4); ctx.quadraticCurveTo(-15, 5 + bo(1), -6, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7, -2); ctx.quadraticCurveTo(16, 5 + bo(1), 25, -4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-18, 3); ctx.lineTo(-18, 7); ctx.moveTo(-11, 3); ctx.lineTo(-11, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12, 3); ctx.lineTo(12, 7); ctx.moveTo(19, 3); ctx.lineTo(19, 7); ctx.stroke();
    // bulb nose
    ctx.fillStyle = 'rgba(232,166,160,.65)';
    ctx.beginPath(); ctx.arc(0 + bo(0.8), 11, 8, 0, 7); ctx.fill(); ctx.stroke();
    // snoring mouth, tucked just under the nose
    const snore = reduced ? 0.4 : (Math.sin(t * 0.0011) + 1) / 2;
    ctx.beginPath(); ctx.ellipse(0, 23, 4 + snore * 2.5, 3 + snore * 3.5, 0, 0, 7); ctx.stroke();
    ctx.restore();
    // Zzz rise on the breath
    if (!reduced) {
      const zt = (t % 3400) / 3400;
      ctx.fillStyle = 'rgba(34,26,16,' + (0.75 * (1 - zt)) + ')';
      ctx.font = "700 " + (13 + zt * 10) + "px 'Baloo 2', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText('z', p.x + 26 * s + zt * 26, fy - 14 - zt * 46);
      if (zt > 0.4) ctx.fillText('Z', p.x + 38 * s + zt * 30, fy - 26 - zt * 60);
    } else {
      ctx.fillStyle = 'rgba(34,26,16,.6)';
      ctx.font = "700 15px 'Baloo 2', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText('z Z', p.x + 30 * s, fy - 30);
    }
  }

  /* ---------- cast: the character cloud with puffing cheeks ---------- */
  function drawCharacterCloud(sc, t, dt, P) {
    const c = sc.cloud;
    if (!reduced) { c.x += c.drift * dt; if (c.x > W + 120) c.x = -110; }
    const cy = sc.horizon - 340 + Math.min(60, camY * 0.03);
    const breeze = wxIntensity('breeze');
    const puffing = !reduced && (breeze > 0.4) && ((t % 5200) < 1500);
    ctx.save();
    ctx.translate(c.x, cy);
    inkLine(2.6);
    ctx.fillStyle = mixC(P.snow, '#FFFFFF', 0.5);
    ctx.beginPath();
    ctx.arc(-34 + bo(1.2), 8 + bo(1.2), 20, 3.0, 5.8);
    ctx.arc(-6 + bo(1.2), -8 + bo(1.2), 24, 3.4, 6.1);
    ctx.arc(26 + bo(1.2), 2 + bo(1.2), 19, 3.8, 0.6);
    ctx.arc(10 + bo(1.2), 20 + bo(1.2), 16, 0.2, 2.4);
    ctx.arc(-22 + bo(1.2), 22 + bo(1.2), 14, 0.8, 3.0);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // face
    const look = 2.2;
    pieEye(-14, 0, 5, 0, look); pieEye(6, 0, 5, 0, look);
    if (puffing) {
      // cheeks puffed, blowing wind curls
      ctx.fillStyle = '#FFFDF4'; inkLine(2);
      ctx.beginPath(); ctx.arc(-4, 14 + bo(0.8), 9, 0, 7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(10, 13, 4, 2.6, 0.2, 0, 7); ctx.fillStyle = INK; ctx.fill();
      windCurl(c.x + 46, cy + 12, t, 1);
      windCurl(c.x + 78, cy + 26, t + 400, 0.7);
    } else {
      cheeks(-20, 8, 12, 8, 3.4);
      inkLine(2);
      ctx.beginPath(); ctx.arc(-4, 12, 6, 0.4, 2.7); ctx.stroke();
    }
    ctx.restore();
  }

  function windCurl(x, y, t, s) {
    const ph = reduced ? 0 : (t % 1400) / 1400;
    ctx.save();
    ctx.translate(x + ph * 50 * s, y);
    ctx.scale(s, s);
    ctx.strokeStyle = 'rgba(34,26,16,.5)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(18, -6 + bo(1.5), 34, 0);
    ctx.quadraticCurveTo(46, 5, 44, -5);
    ctx.quadraticCurveTo(42, -11, 36, -7);
    ctx.stroke();
    ctx.restore();
  }

  /* dusk / night: the 12 headlamp glimmers, one per night-ascent page */
  function drawHeadlamps(sc) {
    const hz = sc.horizon + Math.min(120, camY * 0.10);
    const lrng = rngFor('headlamps');
    Model.nightPages.forEach((np, i) => {
      const lx = W * (0.05 + 0.90 * (i + lrng() * 0.6) / Model.nightPages.length);
      const ly = hz - 26 - lrng() * 130;
      const nLamps = np.night >= 4 ? np.night : 1;
      for (let k = 0; k < nLamps; k++) {
        const jx = lx + (k % 2) * 8 - 4 + lrng() * 3, jy = ly - Math.floor(k / 2) * 7;
        ctx.fillStyle = 'rgba(245,217,160,.3)';
        ctx.beginPath(); ctx.arc(jx, jy, 6, 0, 7); ctx.fill();
        ctx.fillStyle = LAMP;
        ctx.beginPath(); ctx.arc(jx, jy, 1.8, 0, 7); ctx.fill();
      }
    });
  }

  /* ---------- the wall: painted planes + gouache tile ---------- */
  function edgeAt(arr, sc, wy) {
    const f = (wy + 120) / sc.step;
    const i = Math.max(0, Math.min(arr.length - 2, Math.floor(f)));
    const t = Math.max(0, Math.min(1, f - i));
    return arr[i] + (arr[i + 1] - arr[i]) * t;
  }

  function wallPath(sc, y0, y1) {
    ctx.beginPath();
    ctx.moveTo(edgeAt(sc.leftE, sc, y0), s2y(y0));
    for (let wy = y0; wy <= y1; wy += sc.step) ctx.lineTo(edgeAt(sc.leftE, sc, wy), s2y(wy));
    for (let wy = y1; wy >= y0; wy -= sc.step) ctx.lineTo(edgeAt(sc.rightE, sc, wy), s2y(wy));
    ctx.closePath();
  }

  function drawWall(sc, P) {
    const y0 = camY - 140, y1 = camY + H + 60;
    const step = sc.step;

    // main painted face
    ctx.fillStyle = P.rockA;
    wallPath(sc, y0, y1);
    ctx.fill();
    // soft painted edge along the sunlit rim only
    ctx.strokeStyle = 'rgba(34,26,16,.15)';
    ctx.lineWidth = 5; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(edgeAt(sc.leftE, sc, y0), s2y(y0));
    for (let wy = y0; wy <= y1; wy += step) ctx.lineTo(edgeAt(sc.leftE, sc, wy), s2y(wy));
    ctx.stroke();

    // shadowed plane
    ctx.fillStyle = P.rockB;
    ctx.beginPath();
    ctx.moveTo(edgeAt(sc.midE, sc, y0), s2y(y0));
    for (let wy = y0; wy <= y1; wy += step) ctx.lineTo(edgeAt(sc.midE, sc, wy), s2y(wy));
    for (let wy = y1; wy >= y0; wy -= step) ctx.lineTo(edgeAt(sc.rightE, sc, wy), s2y(wy));
    ctx.closePath(); ctx.fill();

    // gouache tile multiplied over the face (the visible brush texture)
    if (!wallPattern) wallPattern = ctx.createPattern(wallTile, 'repeat');
    let bbL = 1e9, bbR = -1e9;
    for (let wy = y0; wy <= y1; wy += step) {
      const l = edgeAt(sc.leftE, sc, wy), r2 = edgeAt(sc.rightE, sc, wy);
      if (l < bbL) bbL = l;
      if (r2 > bbR) bbR = r2;
    }
    ctx.save();
    wallPath(sc, y0, y1);
    ctx.clip();
    ctx.save();
    ctx.translate(0, s2y(0) % 192);
    ctx.fillStyle = wallPattern;
    ctx.fillRect(bbL - 8, -200, (bbR - bbL) + 16, H + 400);
    ctx.restore();
    // painted lighter patches
    ctx.fillStyle = 'rgba(255,250,235,.14)';
    for (const pt of sc.patches) {
      if (pt.y < y0 || pt.y > y1) continue;
      ctx.beginPath(); ctx.ellipse(pt.x, s2y(pt.y), pt.r, pt.r * 0.6, pt.a, 0, 7); ctx.fill();
    }
    ctx.restore();

    // snow cap above the last ledge
    const capY = sc.summitY - 120;
    if (capY < y1) {
      ctx.fillStyle = P.snow;
      ctx.beginPath();
      ctx.moveTo(edgeAt(sc.leftE, sc, capY), s2y(capY));
      for (let wy = capY; wy <= Math.min(y1, sc.summitY + 260); wy += step) ctx.lineTo(edgeAt(sc.leftE, sc, wy), s2y(wy));
      for (let wy = Math.min(y1, sc.summitY + 260); wy >= capY; wy -= step) ctx.lineTo(edgeAt(sc.rightE, sc, wy), s2y(wy));
      const srng = rngFor(sc.slug + ':snowline');
      let sx = edgeAt(sc.rightE, sc, capY);
      const lx = edgeAt(sc.leftE, sc, capY);
      while (sx > lx) {
        ctx.quadraticCurveTo(sx - 20, s2y(capY) + (srng() - 0.5) * 30, sx - 40 - srng() * 30, s2y(capY) + (srng() - 0.5) * 10);
        sx -= 40 + srng() * 30;
      }
      ctx.closePath(); ctx.fill();
    }

    // ink squiggle cracks, sparse
    ctx.strokeStyle = 'rgba(34,26,16,.28)';
    ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    for (const cr of sc.cracks) {
      if (cr[0][1] < y0 || cr[0][1] > y1) continue;
      ctx.beginPath();
      ctx.moveTo(cr[0][0] + bo(1), s2y(cr[0][1]));
      for (let i = 1; i < cr.length; i++) ctx.lineTo(cr[i][0] + bo(1.4), s2y(cr[i][1]));
      ctx.stroke();
    }
  }

  /* ---------- ink pass: route, holds, ledges, pitons ---------- */
  function drawRoute(sc, G, night, t) {
    const y0 = camY - 100, y1 = camY + H + 60;

    // route topo as dashed ink
    ctx.strokeStyle = 'rgba(34,26,16,.55)'; ctx.lineWidth = 1.6;
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    let started = false;
    for (const h of sc.holds) {
      if (h.y < y0 - 60 || h.y > y1 + 60) { started = false; continue; }
      const wob = Math.sin(h.y * 0.21 + h.x) * 2.5;
      if (!started) { ctx.moveTo(h.x + wob, s2y(h.y)); started = true; }
      else ctx.lineTo(h.x + wob, s2y(h.y));
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // the climbed stretch in rope red, boiling gently
    ctx.strokeStyle = ROPE; ctx.lineWidth = 2.6;
    ctx.beginPath(); started = false;
    for (let i = 0; i <= G.holdIdx && i < sc.holds.length; i++) {
      const h = sc.holds[i];
      if (h.y < y0 - 60 || h.y > y1 + 60) { started = false; continue; }
      const wob = Math.sin(h.y * 0.21 + h.x) * 2.5 + bo(0.8);
      if (!started) { ctx.moveTo(h.x + wob, s2y(h.y)); started = true; }
      else ctx.lineTo(h.x + wob, s2y(h.y));
    }
    ctx.stroke();

    // holds as inked knobs
    for (let i = 0; i < sc.holds.length; i++) {
      const h = sc.holds[i];
      if (h.y < y0 || h.y > y1) continue;
      const sy = s2y(h.y);
      ctx.save();
      ctx.translate(h.x, sy);
      ctx.rotate(Math.sin(h.x * 3.1) * 0.3);
      inkLine(2);
      ctx.fillStyle = i <= G.holdIdx ? '#FFFDF4' : 'rgba(34,26,16,.75)';
      ctx.beginPath();
      ctx.ellipse(bo(0.7), bo(0.7), 6.5, 4.2, 0, 0, 7);
      ctx.fill(); ctx.stroke();
      ctx.restore();
      if (i === G.holdIdx + 1 && G.mode === 'climb') {
        const pulse = reduced ? 0 : Math.sin(t * 0.006) * 1.6;
        ctx.strokeStyle = ROPE; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.arc(h.x, sy, 11 + pulse, 0, 7); ctx.stroke();
      }
    }

    // belay ledges: snow shelf + wriggling piton + pitch plate
    for (const L of sc.ledges) {
      if (L.y < y0 || L.y > y1) continue;
      const sy = s2y(L.y);
      ctx.fillStyle = '#FFFDF4';
      inkLine(2.2);
      ctx.beginPath();
      ctx.moveTo(L.x - L.w / 2 + bo(1), sy);
      ctx.quadraticCurveTo(L.x, sy - 4 + bo(1), L.x + L.w / 2 + bo(1), sy);
      ctx.lineTo(L.x + L.w / 2 - 9, sy + 9);
      ctx.quadraticCurveTo(L.x, sy + 13, L.x - L.w / 2 + 7, sy + 9);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      // the piton: an eye-bolt that wriggles when clipped
      const bx = L.x + L.w / 2 + 15;
      const since = t - (L.clipT || -1e9);
      const wig = (!reduced && since < 900) ? Math.sin(since * 0.045) * (1 - since / 900) * 0.55 : 0;
      ctx.save();
      ctx.translate(bx, sy - 5);
      ctx.rotate(wig);
      const clipped = G.pitchIdx > L.pitch;
      ctx.strokeStyle = clipped ? ROPE : 'rgba(34,26,16,.8)';
      ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.arc(0, -3 + bo(0.6), 6.5, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 3.5); ctx.lineTo(0, 10); ctx.stroke();
      if (clipped) { ctx.fillStyle = ROPE; ctx.beginPath(); ctx.arc(0, -3, 2.6, 0, 7); ctx.fill(); }
      ctx.restore();
      ctx.fillStyle = 'rgba(34,26,16,.85)';
      ctx.font = "800 11px 'Baloo 2', sans-serif";
      ctx.textAlign = 'left';
      ctx.fillText('P' + (L.pitch + 1), bx + 12, sy - 1);
    }

    // summit cairn + the box
    const sy = s2y(sc.summitY);
    if (sy > -60 && sy < H + 60) {
      const sx = (edgeAt(sc.leftE, sc, sc.summitY) + edgeAt(sc.rightE, sc, sc.summitY)) / 2;
      sc.summitX = sx;
      drawCairn(sx - 34, sy, G.signedHere, night);
      // the summit box, a little character in itself
      const wob = G.mode === 'summit' && !reduced ? Math.sin(t * 0.004) * 0.06 : 0;
      ctx.save();
      ctx.translate(sx + 25, sy - 7);
      ctx.rotate(wob);
      inkLine(2.2);
      ctx.fillStyle = '#5a6a7c';
      ctx.beginPath(); ctx.rect(-11 + bo(0.6), -6, 22, 13); ctx.fill(); ctx.stroke();
      if (G.mode === 'summit') {
        ctx.save(); ctx.translate(-11, -6); ctx.rotate(-1.0 + (reduced ? 0 : Math.sin(t * 0.004) * 0.05));
        ctx.fillStyle = '#48586a';
        ctx.beginPath(); ctx.rect(0, -5, 22, 5); ctx.fill(); ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = '#48586a';
        ctx.beginPath(); ctx.rect(-11, -11, 22, 5); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawCairn(x, sy, signed, night) {
    const stones = [[0, 0, 9], [11, -1, 8], [5, -8, 7], [14, -8, 6], [9, -15, 5]];
    inkLine(2);
    ctx.fillStyle = night ? '#8a90a0' : '#b8ab90';
    for (const [dx, dy, r] of stones) {
      ctx.beginPath(); ctx.ellipse(x + dx + bo(0.5), sy + dy - 4 + bo(0.5), r, r * 0.62, 0, 0, 7); ctx.fill(); ctx.stroke();
    }
    if (signed) {
      ctx.fillStyle = ROPE;
      ctx.beginPath(); ctx.ellipse(x + 9, sy - 24, 4.5, 3, 0, 0, 7); ctx.fill(); ctx.stroke();
    }
  }

  /* ---------- INK PASS: the rubber-hose climber ---------- */
  function climberPos(G) {
    const h = G.scene.holds[Math.max(0, Math.min(G.holdIdx, G.scene.holds.length - 1))];
    if (G.mode === 'summit') return { x: (G.scene.summitX || W * 0.6) - 8, y: G.scene.summitY + 2 };
    if (G.mode === 'ledge') {
      const L = G.scene.ledges[G.pitchIdx - 1] || G.scene.ledges[0];
      return { x: L.x - 10, y: L.y + 2 };
    }
    return { x: h.x, y: h.y };
  }

  /* one rubber arm: shoulder to hand as a boneless curve, glove at the end */
  function rubberArm(x0, y0, x1, y1, sag) {
    inkLine(4.6);
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo((x0 + x1) / 2 + bo(1.4), (y0 + y1) / 2 + sag + bo(1.4), x1, y1);
    ctx.stroke();
    glove(x1, y1, 4.4, Math.atan2(y1 - y0, x1 - x0));
  }
  function rubberLeg(x0, y0, x1, y1, sag) {
    inkLine(4.6);
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo((x0 + x1) / 2 + sag + bo(1.2), (y0 + y1) / 2 + bo(1.2), x1, y1);
    ctx.stroke();
    // big rounded boot
    inkLine(1.8);
    ctx.fillStyle = '#31241a';
    ctx.beginPath(); ctx.ellipse(x1 + 2, y1 + 1, 5.4, 3.6, 0.15, 0, 7); ctx.fill(); ctx.stroke();
  }

  function climberFace(mouth, lookA, blink) {
    // head + cap
    inkLine(2.2);
    ctx.fillStyle = SKIN;
    ctx.beginPath(); ctx.arc(bo(0.8), bo(0.8), 9, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = ROPE;
    ctx.beginPath(); ctx.arc(bo(0.8), -2.5 + bo(0.8), 9, Math.PI + 0.25, -0.25); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, -11.5, 3, 2, 0, 0, 7); ctx.fillStyle = ROPE; ctx.fill(); ctx.stroke();
    pieEye(-3.6, -1, 3, blink || 0, lookA);
    pieEye(3.6, -1, 3, blink || 0, lookA);
    inkLine(1.8);
    if (mouth === 'o') { ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(0.5, 4.5, 2.2, 3, 0, 0, 7); ctx.fill(); }
    else if (mouth === 'yodel') { ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(0.5, 4.5, 3.2, 4.4, 0, 0, 7); ctx.fill(); }
    else if (mouth === 'grit') { ctx.beginPath(); ctx.moveTo(-3, 5); ctx.lineTo(3.5, 4.4); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(0.5, 3.2, 3.4, 0.4, 2.7); ctx.stroke(); }
  }

  function drawClimber(sc, G, t, night) {
    const p = climberPos(G);
    const x = p.x, sy = s2y(p.y);
    if (sy < -80 || sy > H + 80) return;
    const next = sc.holds[Math.min(G.holdIdx + 1, sc.holds.length - 1)];
    const dirX = next ? Math.sign(next.x - x) || 1 : 1;
    const reach = G.holding ? Math.min(1, G.reach) : 0;
    const emote = G.emote && t < G.emote.until ? G.emote.kind : null;

    // rope to the last piton (red, sagging, boiling)
    const piton = sc.ledges[G.pitchIdx - 1];
    if (piton && G.mode === 'climb') {
      const px = piton.x + piton.w / 2 + 15, py = s2y(piton.y - 4);
      ctx.strokeStyle = 'rgba(196,69,44,.85)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px, py);
      ctx.quadraticCurveTo((px + x) / 2 + 12 + bo(2), Math.max(py, sy) + 30 + bo(2), x + 2, sy + 10);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(x, sy);

    if (G.mode === 'summit') {
      // seated by the cairn; first beat is the yodel
      const yodeling = emote === 'yodel';
      // legs dangling / folded
      rubberLeg(2, -8, -6, 6, -2);
      rubberLeg(4, -8, 12, 6, 2);
      // sweater body
      inkLine(2.2);
      ctx.fillStyle = ROPE;
      ctx.beginPath();
      ctx.moveTo(-7 + bo(0.8), -6);
      ctx.quadraticCurveTo(-9, -20, -5 + bo(0.8), -24);
      ctx.lineTo(5 + bo(0.8), -24);
      ctx.quadraticCurveTo(9, -20, 7 + bo(0.8), -6);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FFFDF4';
      ctx.beginPath(); ctx.arc(0, -17, 1.6, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -11, 1.6, 0, 7); ctx.fill();
      if (yodeling) {
        rubberArm(-4, -20, -16, -34, -3);
        rubberArm(4, -20, 16, -34, -3);
        ctx.save(); ctx.translate(0, -31); ctx.rotate(-0.12); climberFace('yodel', 4.7, 0); ctx.restore();
      } else {
        rubberArm(-4, -20, -12, -4, 3);
        rubberArm(4, -20, 13, -5, 3);
        ctx.save(); ctx.translate(0, -31); climberFace('smile', 1.6, reduced ? 0 : (t % 4200 < 140 ? 1 : 0)); ctx.restore();
      }
      ctx.restore();
      return;
    }

    if (G.mode === 'ledge') {
      // belay rest: seated on the shelf, legs kicking happily
      const kick = reduced ? 0 : Math.sin(t * 0.006);
      rubberLeg(0, -8, -7, 8 + kick * 3, -3);
      rubberLeg(3, -8, 10, 8 - kick * 3, 3);
      inkLine(2.2);
      ctx.fillStyle = ROPE;
      ctx.beginPath();
      ctx.moveTo(-7 + bo(0.8), -6); ctx.quadraticCurveTo(-9, -20, -5, -25);
      ctx.lineTo(5, -25); ctx.quadraticCurveTo(9, -20, 7 + bo(0.8), -6);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FFFDF4';
      ctx.beginPath(); ctx.arc(0, -17, 1.6, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -12, 1.6, 0, 7); ctx.fill();
      rubberArm(-4, -20, -13, -8, 3);
      rubberArm(4, -20, 12, -9, 3);
      ctx.save(); ctx.translate(0, -32);
      climberFace(emote === 'whistle' ? 'o' : 'smile', 1.6, reduced ? 0 : (t % 3800 < 140 ? 1 : 0));
      ctx.restore();
      ctx.restore();
      return;
    }

    // climbing pose
    const sway = reduced ? 0 : Math.sin(t * 0.0011) * 0.03;
    ctx.rotate(sway);
    // legs splayed on the wall
    rubberLeg(0, -10, -9 + bo(1), 10, -4);
    rubberLeg(2, -10, 9 + bo(1), 12, 4);
    // the sweater torso, a bendy bean
    inkLine(2.4);
    ctx.fillStyle = ROPE;
    ctx.beginPath();
    ctx.moveTo(-6.5 + bo(0.8), -10);
    ctx.quadraticCurveTo(-8.5, -22, -5 + bo(0.8), -28);
    ctx.lineTo(5 + bo(0.8), -28);
    ctx.quadraticCurveTo(8.5, -22, 6.5 + bo(0.8), -10);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFFDF4';
    ctx.beginPath(); ctx.arc(0, -21, 1.6, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -15, 1.6, 0, 7); ctx.fill();
    // chalk bag
    inkLine(1.8);
    ctx.fillStyle = '#E4D2A8';
    ctx.beginPath(); ctx.ellipse(-8 * dirX, -10, 4, 5, 0, 0, 7); ctx.fill(); ctx.stroke();

    // anchored arm to the current hold
    rubberArm(-dirX * 4, -25, -dirX * 7, -4, 2);

    // reaching arm: rubber stretches toward the next hold
    if (next) {
      const tx = (next.x - x) * (0.22 + 0.78 * reach);
      const ty = (s2y(next.y) - sy) * (0.22 + 0.78 * reach);
      rubberArm(dirX * 4, -26, dirX * 4 + tx * 0.94, -26 + ty * 0.94, -6 * reach);
    }

    // face looks toward the next hold
    const lookA = next ? Math.atan2(s2y(next.y) - (sy - 34), next.x - x) : 1.6;
    ctx.save(); ctx.translate(0, -34);
    const mouth = emote === 'whistle' ? 'o' : emote === 'ouch' ? 'grit' : (G.holding ? 'grit' : 'smile');
    climberFace(mouth, lookA, reduced ? 0 : (t % 4600 < 140 ? 1 : 0));
    ctx.restore();
    ctx.restore();

    // pendulum arc while holding: the verb, exactly as the audition built it
    if (G.holding && G.mode === 'climb' && next && !G.reduced) {
      const shX = x, shY = sy - 28;
      const ang0 = Math.atan2(s2y(next.y) - shY, next.x - shX);
      const R = 62;
      const span = 60 * Math.PI / 180;
      const win = (G.window / 2) * Math.PI / 180;
      ctx.strokeStyle = 'rgba(34,26,16,.55)';
      ctx.lineWidth = 1.6; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.arc(shX, shY, R, ang0 - span, ang0 + span); ctx.stroke();
      ctx.setLineDash([]);
      // the green window, candy-striped
      ctx.strokeStyle = GREEN; ctx.lineWidth = 8; ctx.globalAlpha = 0.92;
      ctx.beginPath(); ctx.arc(shX, shY, R, ang0 - win, ang0 + win); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#FFFDF4'; ctx.lineWidth = 2; ctx.setLineDash([4, 7]);
      ctx.beginPath(); ctx.arc(shX, shY, R, ang0 - win, ang0 + win); ctx.stroke();
      ctx.setLineDash([]);
      // swing marker: a little pointing glove
      const mAng = ang0 + (G.sweep * Math.PI / 180);
      ctx.strokeStyle = 'rgba(34,26,16,.8)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(shX, shY);
      ctx.lineTo(shX + Math.cos(mAng) * (R - 9), shY + Math.sin(mAng) * (R - 9));
      ctx.stroke();
      glove(shX + Math.cos(mAng) * R, shY + Math.sin(mAng) * R, 5, mAng);
    }
    if (G.holding && G.mode === 'climb' && next && G.reduced) {
      ctx.strokeStyle = GREEN; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(next.x, s2y(next.y), 12, 0, 7); ctx.stroke();
    }
  }

  /* ---------- summit station ---------- */
  function drawSummitStation(sc, G, night, t) {
    const sy = s2y(sc.summitY);
    const sx = sc.summitX || W * 0.6;
    const nIn = sc.inCount;
    if (nIn > 0) {
      const rrng = rngFor(sc.slug + ':threads');
      ctx.strokeStyle = 'rgba(196,69,44,.5)'; ctx.lineWidth = 1.2;
      for (let i = 0; i < nIn; i++) {
        const ex = -30 - rrng() * 60;
        const eyy = sy + 120 + rrng() * (H - sy - 60);
        ctx.beginPath();
        ctx.moveTo(sx - 40 + (i % 12) * 2.2, sy + 3);
        ctx.quadraticCurveTo((ex + sx) / 2, Math.max(eyy, sy + 170) + 40, ex, eyy);
        ctx.stroke();
      }
      const bw = Math.min(nIn, 30);
      for (let i = 0; i < nIn; i++) {
        const bx = sx - 40 + (i % bw) * 6 - Math.floor(i / bw) * 3;
        const by = sy + 6 + Math.floor(i / bw) * 5;
        ctx.fillStyle = night ? LAMP : '#efe6cf';
        ctx.beginPath(); ctx.arc(bx, by, 1.9, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(34,26,16,.55)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(bx, by, 2.8, 0, 7); ctx.stroke();
      }
    }
    if (G.tautRope) {
      const ty = sy + 220, tx2 = W * 0.30;
      ctx.strokeStyle = ROPE; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(sx + 24, sy - 2);
      ctx.quadraticCurveTo((sx + tx2) / 2 + bo(2), sy + 130 + bo(2), tx2, ty);
      ctx.stroke();
      drawPlate(tx2 + 8, ty - 14, G.tautRope, night);
    }
  }

  function drawPlate(x, y, text, night, anchor) {
    ctx.font = "700 11px 'Baloo 2', sans-serif";
    const label = text.toUpperCase();
    const w = ctx.measureText(label).width + 18;
    const ax = anchor === 'center' ? x - w / 2 : x;
    ctx.save();
    ctx.translate(ax + w / 2, y);
    ctx.rotate(((label.charCodeAt(0) % 5) - 2) * 0.008);
    inkLine(2.2);
    ctx.fillStyle = night ? '#2a2418' : CREAM;
    const hw = w / 2;
    ctx.beginPath();
    ctx.moveTo(-hw + 4, -10 + bo(0.6));
    ctx.lineTo(hw - 4, -10 + bo(0.6));
    ctx.quadraticCurveTo(hw + 2, -10, hw + 2, -3);
    ctx.lineTo(hw + 2, 3);
    ctx.quadraticCurveTo(hw + 2, 10, hw - 4, 10);
    ctx.lineTo(-hw + 4, 10 + bo(0.6));
    ctx.quadraticCurveTo(-hw - 2, 10, -hw - 2, 3);
    ctx.lineTo(-hw - 2, -3);
    ctx.quadraticCurveTo(-hw - 2, -10, -hw + 4, -10);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = night ? '#EAD9AE' : INK;
    ctx.textAlign = 'center';
    ctx.fillText(label, 0, 4);
    ctx.restore();
    ctx.textAlign = 'left';
  }

  /* ---------- the col of fifty-seven ropes ---------- */
  function drawColBackdrop(sc, night, P) {
    const hz = sc.horizon + Math.min(120, camY * 0.10);
    ctx.fillStyle = mixC(P.hillB, P.skyHi, 0.35);
    ctx.beginPath();
    ctx.moveTo(-40, hz + 20);
    ctx.lineTo(W * 0.18, hz - 210);
    ctx.lineTo(W * 0.34, hz - 90);
    ctx.lineTo(W * 0.52, hz - 320);
    ctx.lineTo(W * 0.70, hz - 130);
    ctx.lineTo(W * 0.88, hz - 380);
    ctx.lineTo(W * 1.02, hz - 60);
    ctx.lineTo(W + 40, hz + 20);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = night ? 'rgba(232,166,160,.55)' : '#E8A6A0';
    ctx.beginPath(); ctx.moveTo(W * 0.52, hz - 320); ctx.lineTo(W * 0.49, hz - 262); ctx.lineTo(W * 0.545, hz - 262); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W * 0.88, hz - 380); ctx.lineTo(W * 0.85, hz - 314); ctx.lineTo(W * 0.905, hz - 314); ctx.closePath(); ctx.fill();
    drawPlate(W * 0.72, hz - 22, sc.massif.label + ', ' + sc.massif.count + ' summits', night);
  }

  function drawColFan(sc, G, night) {
    if (!sc.colFan) return;
    const sy = s2y(sc.summitY);
    const sx = sc.summitX || (edgeAt(sc.leftE, sc, sc.summitY) + edgeAt(sc.rightE, sc, sc.summitY)) / 2;
    const rrng = rngFor(sc.slug + ':fan');
    const nIn = sc.colFan.inbound.length, nOut = sc.colFan.outbound.length;
    const inRopes = [];
    ctx.lineWidth = 1.3;
    for (let i = 0; i < nIn; i++) {
      const t = i / (nIn - 1);
      let ex, ey;
      if (t < 0.5) { ex = -70 - rrng() * 60; ey = sy + 120 + (t / 0.5) * (H - sy - 140) + rrng() * 24; }
      else { ex = -40 + ((t - 0.5) / 0.5) * (sx - 330); ey = H + 40 + rrng() * 30; }
      const x0 = sx - 26 + (i % 14) * 1.8, y0 = sy + 2 + (i % 4) * 1.5;
      const cxq = (ex + x0) / 2 - 20;
      const cyq = (ey + y0) / 2 + 60 + rrng() * 55;
      ctx.strokeStyle = 'rgba(196,69,44,' + (0.38 + 0.34 * rrng()).toFixed(2) + ')';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cxq + bo(1.5), cyq + bo(1.5), ex, ey); ctx.stroke();
      inRopes.push([x0, y0, cxq, cyq, ex, ey]);
    }
    for (let i = 0; i < nOut; i++) {
      const t = i / (nOut - 1);
      let ex, ey;
      if (t < 0.5) { ex = W + 60 + rrng() * 60; ey = sy + 150 + (t / 0.5) * (H - sy - 170) + rrng() * 24; }
      else { ex = W + 20 - ((t - 0.5) / 0.5) * (W - sx - 330); ey = H + 40 + rrng() * 30; }
      const x0 = sx + 26 - (i % 12) * 1.6, y0 = sy + 2 + (i % 4) * 1.5;
      const cxq = (ex + x0) / 2 + 20;
      const cyq = (ey + y0) / 2 + 55 + rrng() * 50;
      ctx.strokeStyle = 'rgba(196,69,44,' + (0.34 + 0.3 * rrng()).toFixed(2) + ')';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cxq + bo(1.5), cyq + bo(1.5), ex, ey); ctx.stroke();
    }
    const pick = [4, 14, 24];
    sc.colFan.plates.forEach((p, k) => {
      const r = inRopes[pick[k]];
      if (!r) return;
      const s = 0.42 + k * 0.05;
      const it = 1 - s;
      const px = it * it * r[0] + 2 * it * s * r[2] + s * s * r[4];
      const py = it * it * r[1] + 2 * it * s * r[3] + s * s * r[5];
      ctx.strokeStyle = 'rgba(196,69,44,.9)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + 16); ctx.stroke();
      drawPlate(px, py + 26, p, night, 'center');
    });
    for (let i = 0; i < Math.min(nIn + nOut, 40); i++) {
      const bx = sx - 30 + (i % 20) * 3.1, by = sy + 8 + Math.floor(i / 20) * 5;
      ctx.fillStyle = night ? LAMP : '#efe6cf';
      ctx.beginPath(); ctx.arc(bx, by, 1.7, 0, 7); ctx.fill();
    }
  }

  /* ---------- rappel ---------- */
  function rappelCurve(sc, G) {
    const sy0 = sc.summitY;
    const sx = sc.summitX || W * 0.6;
    const y1 = sy0 - H * 0.5;
    return { x0: sx + 20, y0: sy0, cx: sx + W * 0.17, cy: (sy0 + y1) / 2 - 120, x1: sx + W * 0.34, y1 };
  }

  function drawRappel(sc, G, night, t) {
    const c = G.rappel.curve;
    const s = G.rappel.s;
    ctx.strokeStyle = ROPE; ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(c.x0, s2y(c.y0));
    ctx.quadraticCurveTo(c.cx + bo(2), s2y(c.cy) + bo(2), c.x1, s2y(c.y1));
    ctx.stroke();
    drawPlate(c.x1 - 30, s2y(c.y1) - 18, G.rappel.label, night, 'center');
    const it = 1 - s;
    const px = it * it * c.x0 + 2 * it * s * c.cx + s * s * c.x1;
    const wy = it * it * c.y0 + 2 * it * s * c.cy + s * s * c.y1;
    const py = s2y(wy);
    G.rappel.wy = wy;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(0.45);
    // tucked rubber-hose body
    rubberLeg(0, 8, -3, 17, -4);
    rubberLeg(2, 8, 6, 17, 4);
    inkLine(2.2);
    ctx.fillStyle = ROPE;
    ctx.beginPath();
    ctx.moveTo(-6 + bo(0.8), 9); ctx.quadraticCurveTo(-8, -3, -5, -7);
    ctx.lineTo(5, -7); ctx.quadraticCurveTo(8, -3, 6 + bo(0.8), 9);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    rubberArm(0, -4, 9, -16, -2);   // arm on the rope
    ctx.save(); ctx.translate(-1, -14); ctx.rotate(-0.2); climberFace('o', 2.4, 0); ctx.restore();
    // a little speed scarf
    ctx.strokeStyle = '#FFFDF4'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-4, -8);
    ctx.quadraticCurveTo(-14 + bo(2), -4 + bo(2), -20, -10 + bo(3));
    ctx.stroke();
    ctx.restore();
  }

  /* ---------- particles (chalk + snow), pooled ---------- */
  function drawParticles(G, night) {
    if (!G.particles) return;
    for (const p of G.particles) {
      if (p.life <= 0) continue;
      ctx.globalAlpha = Math.min(0.8, p.life);
      ctx.fillStyle = '#FFFDF4';
      ctx.beginPath(); ctx.arc(p.x, s2y(p.y), p.r, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /* =================================================================
     CAST PASS: the ambient gag repertory (rotation, never twins)
     ================================================================= */
  const GAGKINDS = [
    { k: 'bird', sky: true, dur: 6.5 },
    { k: 'marmot', sky: false, dur: 4.5, biomes: ['meadow', 'forest', 'crag'] },
    { k: 'pine', sky: false, dur: 4, ground: true, biomes: ['meadow', 'forest', 'glacier', 'crag'] },
    { k: 'flower', sky: false, dur: 5, biomes: ['meadow', 'forest'] },
    { k: 'rockeye', sky: false, dur: 4.5 },
    { k: 'icicle', sky: false, dur: 4.5, biomes: ['glacier', 'crag'] },
    { k: 'butterfly', sky: true, dur: 6, biomes: ['meadow', 'forest', 'skyway'] },
    { k: 'cloudpuff', sky: true, dur: 5 },
    { k: 'balloon', sky: true, dur: 8, biomes: ['skyway', 'meadow', 'glacier'] },
  ];
  const gags = { active: [], nextIn: 3.5 };

  function tickGags(dt, G, t) {
    for (let i = gags.active.length - 1; i >= 0; i--) {
      gags.active[i].t += dt;
      if (gags.active[i].t > gags.active[i].dur) gags.active.splice(i, 1);
    }
    if (reduced || !scene) return;
    gags.nextIn -= dt;
    if (gags.nextIn <= 0 && gags.active.length < 2) {
      gags.nextIn = 5 + Math.random() * 5;
      spawnGag(null, G);
    }
  }

  function spawnGag(kindName, G) {
    const activeKinds = gags.active.map(g => g.k);
    let pool = GAGKINDS.filter(k =>
      activeKinds.indexOf(k.k) === -1 &&
      (!k.biomes || k.biomes.indexOf(scene.biome) !== -1));
    if (kindName) pool = pool.filter(k => k.k === kindName);
    if (!pool.length) return null;
    const kind = pool[Math.floor(Math.random() * pool.length)];
    const inst = { k: kind.k, dur: kind.dur, t: 0, seed: Math.random() * 100 };
    // placement
    const hz = scene.horizon;
    if (kind.k === 'bird') { inst.y = 90 + Math.random() * (hz * 0.45); inst.dir = Math.random() < 0.5 ? 1 : -1; }
    else if (kind.k === 'butterfly') { inst.x = W * (0.15 + Math.random() * 0.25); inst.y = H * (0.3 + Math.random() * 0.35); }
    else if (kind.k === 'cloudpuff') { inst.x = W * (0.1 + Math.random() * 0.5); inst.y = 80 + Math.random() * (hz * 0.35); }
    else if (kind.k === 'balloon') { inst.x = W * (0.1 + Math.random() * 0.3); inst.y = hz * 0.75; }
    else if (kind.k === 'pine') { inst.x = W * (0.05 + Math.random() * 0.35); inst.gy = hz + 58; }
    else if (kind.k === 'rockeye') {
      const wy = camY + H * (0.3 + Math.random() * 0.3);
      inst.wy = wy; inst.wx = edgeAt(scene.midE, scene, wy) - 40 - Math.random() * 60;
    } else if (kind.k === 'marmot' || kind.k === 'flower' || kind.k === 'icicle') {
      const wy = camY + H * (0.35 + Math.random() * 0.3);
      inst.wy = wy;
      inst.wx = Math.random() < 0.5 ? edgeAt(scene.leftE, scene, wy) + 14 : edgeAt(scene.rightE, scene, wy) - 14;
    }
    gags.active.push(inst);
    if (onEvent) onEvent('gag:' + kind.k);
    return inst;
  }
  function forceGag(kindName, G) { return spawnGag(kindName, G); }
  function clearGags() { gags.active.length = 0; }

  function drawGags(sc, G, t) {
    for (const g of gags.active) {
      const f = g.t / g.dur;                       // 0..1 lifecycle
      const pop = Math.min(1, g.t * 3);            // ease-in
      const out = Math.min(1, (g.dur - g.t) * 3);  // ease-out
      const vis = Math.min(pop, out);
      switch (g.k) {
        case 'bird': drawGagBird(g, f, t); break;
        case 'marmot': drawGagMarmot(g, f, vis, t); break;
        case 'pine': drawGagPine(g, f, vis, t, sc); break;
        case 'flower': drawGagFlower(g, f, vis, t); break;
        case 'rockeye': drawGagRockeye(g, f, vis, t, G); break;
        case 'icicle': drawGagIcicle(g, f, vis, t); break;
        case 'butterfly': drawGagButterfly(g, f, vis, t); break;
        case 'cloudpuff': drawGagCloudpuff(g, f, vis, t); break;
        case 'balloon': drawGagBalloon(g, f, vis, t); break;
      }
    }
  }

  function drawGagBird(g, f, t) {
    const x = g.dir > 0 ? -40 + f * (W + 80) : W + 40 - f * (W + 80);
    const y = g.y + Math.sin(f * 12 + g.seed) * 14;
    const flap = Math.sin(t * 0.02 + g.seed) * 0.9;
    const tip = f > 0.42 && f < 0.6;   // tips its hat mid-flight
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(g.dir, 1);
    inkLine(2);
    // body
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.ellipse(bo(0.8), bo(0.8), 9, 6, 0.1, 0, 7); ctx.fill();
    // head + beak
    ctx.beginPath(); ctx.arc(9, -4, 5, 0, 7); ctx.fill();
    ctx.fillStyle = '#F2B25C';
    ctx.beginPath(); ctx.moveTo(13, -5); ctx.lineTo(20, -3.4); ctx.lineTo(13, -1.6); ctx.closePath(); ctx.fill();
    // white eye
    pieEye(9, -5.5, 2.4, 0, 0.2);
    // wings flap
    ctx.strokeStyle = INK; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(-2, -2);
    ctx.quadraticCurveTo(-8, -10 - flap * 8, -16, -6 - flap * 10);
    ctx.stroke();
    // bowler hat, tipped by a tiny glove
    const lift = tip ? -6 : 0;
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.ellipse(9, -10.5 + lift, 5, 2, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.rect(6, -15.5 + lift, 6, 5); ctx.fill();
    if (tip) glove(15, -13, 3, -0.6);
    ctx.restore();
  }

  function drawGagMarmot(g, f, vis, t) {
    const x = g.wx, sy = s2y(g.wy);
    const up = Math.sin(Math.min(1, f * 2.2) * Math.PI / 2) * 24 * vis;
    ctx.save();
    ctx.translate(x, sy);
    // burrow
    inkLine(2);
    ctx.fillStyle = 'rgba(34,26,16,.6)';
    ctx.beginPath(); ctx.ellipse(0, 4, 13, 5, 0, 0, 7); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.rect(-16, -44, 32, 46); ctx.clip();
    ctx.translate(0, 6 - up);
    // round marmot
    ctx.fillStyle = '#C89A5E';
    ctx.beginPath(); ctx.ellipse(bo(0.8), 0 + bo(0.8), 9, 11, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#E8D0A0';
    ctx.beginPath(); ctx.ellipse(0, 3, 5, 7, 0, 0, 7); ctx.fill();
    // face
    pieEye(-3.4, -6, 2.4, 0, 1.2); pieEye(3.4, -6, 2.4, 0, 1.2);
    inkLine(1.6);
    const whistling = f > 0.35 && f < 0.75;
    if (whistling) { ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(0, -1.5, 1.6, 2.2, 0, 0, 7); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(0, -2.5, 2.4, 0.4, 2.7); ctx.stroke(); }
    // little ears
    ctx.fillStyle = '#C89A5E';
    ctx.beginPath(); ctx.arc(-6, -10.5, 2.4, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(6, -10.5, 2.4, 0, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.restore();
    if (f > 0.36 && f < 0.42 && !g.sang) { g.sang = true; emitNotes(x, sy - 34, 2); }
  }

  function drawGagPine(g, f, vis, t, sc) {
    const sy = sc.horizon + Math.min(120, camY * 0.10) + 52;
    const sh = Math.sin(t * 0.014 + g.seed) * 0.12 * vis;
    ctx.save();
    ctx.translate(g.x, sy);
    ctx.rotate(sh);
    inkLine(2);
    ctx.fillStyle = '#1E5A3D';
    for (let i = 0; i < 3; i++) {
      const w = 22 - i * 6, yy = -i * 13;
      ctx.beginPath();
      ctx.moveTo(-w + bo(1), yy);
      ctx.lineTo(0, yy - 17);
      ctx.lineTo(w + bo(1), yy);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = '#6b4a26';
    ctx.beginPath(); ctx.rect(-3, 0, 6, 8); ctx.fill(); ctx.stroke();
    // shimmy arms out
    rubberArm(-14, -18, -26 - sh * 30, -26 + bo(1), 2);
    rubberArm(14, -18, 26 + sh * 30, -26 + bo(1), 2);
    ctx.restore();
  }

  function drawGagFlower(g, f, vis, t) {
    const x = g.wx, sy = s2y(g.wy);
    const grow = Math.min(1, f * 2.6);
    const swy = Math.sin(t * 0.008 + g.seed) * 0.12;
    ctx.save();
    ctx.translate(x, sy);
    ctx.rotate(swy * vis);
    inkLine(2);
    ctx.strokeStyle = '#3C7D50'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(bo(2), -12 * grow, 0, -24 * grow); ctx.stroke();
    if (grow > 0.6) {
      const bloom = Math.min(1, (grow - 0.6) / 0.4);
      ctx.translate(0, -24 * grow);
      ctx.scale(bloom, bloom);
      inkLine(1.8);
      ctx.fillStyle = '#FFFDF4';
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * 6.283 + swy;
        ctx.beginPath(); ctx.ellipse(Math.cos(a) * 8, Math.sin(a) * 8, 5.5, 3.4, a, 0, 7); ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = '#F2B25C';
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, 7); ctx.fill(); ctx.stroke();
      // tiny face, winks
      pieEye(-1.8, -1, 1.3, f > 0.7 && f < 0.78 ? 1 : 0);
      pieEye(1.8, -1, 1.3, 0);
      inkLine(1.2);
      ctx.beginPath(); ctx.arc(0, 1.4, 1.8, 0.4, 2.7); ctx.stroke();
    }
    ctx.restore();
  }

  function drawGagRockeye(g, f, vis, t, G) {
    const x = g.wx, sy = s2y(g.wy);
    const open = Math.min(1, Math.max(0, (f - 0.15) * 4)) * Math.min(1, Math.max(0, (0.85 - f) * 4));
    ctx.save();
    ctx.translate(x, sy);
    inkLine(2);
    // the boulder blinks awake
    ctx.fillStyle = 'rgba(34,26,16,.18)';
    ctx.beginPath(); ctx.ellipse(0, 6, 20, 12, 0.1, 0, 7); ctx.fill();
    if (open > 0.05) {
      ctx.save();
      ctx.scale(1, open);
      const cp = climberPos(G);
      const la = Math.atan2(s2y(cp.y) - sy, cp.x - x);
      pieEye(0, 0, 7, 0, la);
      ctx.restore();
      inkLine(2);
      ctx.beginPath(); ctx.moveTo(-8, -9 * open); ctx.quadraticCurveTo(0, -13 * open, 8, -9 * open); ctx.stroke();
    } else {
      inkLine(2.2);
      ctx.beginPath(); ctx.moveTo(-7, 0); ctx.quadraticCurveTo(0, 3, 7, 0); ctx.stroke();
    }
    ctx.restore();
  }

  function drawGagIcicle(g, f, vis, t) {
    const x = g.wx, sy = s2y(g.wy);
    ctx.save();
    ctx.translate(x, sy);
    inkLine(1.8);
    // small overhang
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.rect(-26, -6, 52, 7); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const ring = f > 0.2 + i * 0.15 && f < 0.34 + i * 0.15;
      const xx = -18 + i * 12;
      ctx.save();
      ctx.translate(xx, 0);
      if (ring) ctx.rotate(Math.sin(t * 0.05) * 0.14);
      ctx.fillStyle = ring ? '#DFF2FF' : '#C8E4F4';
      ctx.beginPath();
      ctx.moveTo(-4, 1); ctx.lineTo(4, 1); ctx.lineTo(0 + bo(0.8), 14 + i * 4);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      if (ring && !g['rang' + i]) { g['rang' + i] = true; emitNotes(x + xx, sy - 14, 1); if (onEvent) onEvent('gagnote:' + i); }
    }
    ctx.restore();
  }

  function drawGagButterfly(g, f, vis, t) {
    const lx = g.x + Math.sin(f * 9 + g.seed) * 60;
    const ly = g.y + Math.sin(f * 14 + g.seed * 2) * 30 - f * 40;
    const flap = Math.sin(t * 0.03) * 0.8;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.globalAlpha = vis;
    inkLine(1.8);
    ctx.fillStyle = '#E8A6A0';
    ctx.save(); ctx.scale(Math.max(0.2, Math.abs(flap)), 1);
    ctx.beginPath(); ctx.ellipse(-6, -2, 6, 8, -0.3, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(6, -2, 6, 8, 0.3, 0, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.ellipse(0, 0, 2, 6, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, -5); ctx.quadraticCurveTo(-3, -10, -5, -9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -5); ctx.quadraticCurveTo(3, -10, 5, -9); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawGagCloudpuff(g, f, vis, t) {
    ctx.save();
    ctx.translate(g.x + f * 40, g.y);
    ctx.globalAlpha = vis;
    inkLine(2.2);
    ctx.fillStyle = '#FFFDF6';
    ctx.beginPath();
    ctx.arc(-18 + bo(1), 2 + bo(1), 13, 2.8, 5.9);
    ctx.arc(2 + bo(1), -6 + bo(1), 15, 3.3, 6.2);
    ctx.arc(18 + bo(1), 4 + bo(1), 11, 4.0, 1.2);
    ctx.arc(-2 + bo(1), 10 + bo(1), 10, 0.4, 2.8);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    const puff = f > 0.3 && f < 0.75;
    pieEye(-8, -2, 3.4, 0, 2.4); pieEye(4, -2, 3.4, 0, 2.4);
    if (puff) {
      ctx.fillStyle = '#FFFDF4'; inkLine(1.8);
      ctx.beginPath(); ctx.arc(0, 7 + bo(0.6), 6, 0, 7); ctx.fill(); ctx.stroke();
      windCurl(g.x + f * 40 + 30, g.y + 8, t, 0.8);
    } else {
      inkLine(1.8);
      ctx.beginPath(); ctx.arc(-2, 6, 4, 0.4, 2.7); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawGagBalloon(g, f, vis, t) {
    const x = g.x + f * 90, y = g.y - f * H * 0.4;
    const swy = Math.sin(t * 0.004 + g.seed) * 0.1;
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = vis;
    ctx.rotate(swy);
    inkLine(2.2);
    // envelope with stripes
    ctx.fillStyle = '#E8A6A0';
    ctx.beginPath(); ctx.arc(0 + bo(1), 0 + bo(1), 22, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = CREAM;
    ctx.beginPath(); ctx.ellipse(0, 0, 8, 22, 0, 0, 7); ctx.fill(); ctx.stroke();
    // basket
    ctx.strokeStyle = 'rgba(34,26,16,.75)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-9, 19); ctx.lineTo(-6, 34); ctx.moveTo(9, 19); ctx.lineTo(6, 34); ctx.stroke();
    inkLine(2);
    ctx.fillStyle = '#B07840';
    ctx.beginPath(); ctx.rect(-9, 33, 18, 11); ctx.fill(); ctx.stroke();
    // a glove waves from the basket
    const wave = Math.sin(t * 0.012) * 0.5;
    glove(12, 30 + wave * 3, 3.6, -1 + wave);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /* ---------- musical notes (yodel, whistles, gag chimes) ---------- */
  const notes = [];
  function emitNotes(x, y, n, big) {
    if (reduced) return;
    for (let i = 0; i < (n || 1); i++) {
      if (notes.length > 14) notes.shift();
      notes.push({
        x: x + (Math.random() - 0.5) * 12, y: y - Math.random() * 8,
        vx: 14 + Math.random() * 22, vy: -26 - Math.random() * 18,
        t: 0, dur: 1.4 + Math.random() * 0.7,
        g: Math.random() < 0.5 ? '♪' : '♫',
        s: big ? 19 : 14,
      });
    }
  }
  function drawNotes(dt) {
    for (let i = notes.length - 1; i >= 0; i--) {
      const n = notes[i];
      n.t += dt;
      if (n.t > n.dur) { notes.splice(i, 1); continue; }
      const f = n.t / n.dur;
      n.x += n.vx * dt; n.y += n.vy * dt;
      ctx.save();
      ctx.globalAlpha = 1 - f;
      ctx.fillStyle = INK;
      ctx.font = "700 " + n.s + "px 'Baloo 2', sans-serif";
      ctx.translate(n.x, n.y);
      ctx.rotate(Math.sin(f * 8) * 0.2);
      ctx.fillText(n.g, 0, 0);
      ctx.restore();
    }
  }

  /* ---------- weather: breeze curls, snow, fog (eased) ---------- */
  const flakes = [];
  let fogSprite = null;
  function ensureFog() {
    if (fogSprite) return;
    fogSprite = document.createElement('canvas');
    fogSprite.width = 360; fogSprite.height = 140;
    const g = fogSprite.getContext('2d');
    const gr = g.createRadialGradient(180, 70, 8, 180, 70, 150);
    gr.addColorStop(0, 'rgba(248,242,228,.9)');
    gr.addColorStop(1, 'rgba(248,242,228,0)');
    g.fillStyle = gr;
    g.beginPath(); g.ellipse(180, 70, 175, 64, 0, 0, 7); g.fill();
  }
  function drawWeather(sc, dt, t, P) {
    const snow = wxIntensity('snow');
    const breeze = wxIntensity('breeze');
    const fog = wxIntensity('fog');
    if (snow > 0.02 && !reduced) {
      const want = Math.floor(52 * snow);
      const scatter = flakes.length < 6 && snow > 0.8;
      while (flakes.length < want) {
        flakes.push({
          x: Math.random() * W,
          y: scatter ? Math.random() * H : -10 - Math.random() * H * 0.3,
          v: 26 + Math.random() * 30, ph: Math.random() * 6.28, big: Math.random() < 0.2,
        });
      }
      for (let i = flakes.length - 1; i >= 0; i--) {
        const f = flakes[i];
        f.y += f.v * dt; f.ph += dt * 2;
        f.x += Math.sin(f.ph) * 26 * dt + breeze * 30 * dt;
        if (f.y > H + 12) { if (flakes.length > want) { flakes.splice(i, 1); continue; } f.y = -10; f.x = Math.random() * W; }
        ctx.globalAlpha = 0.92 * Math.min(1, snow * 1.6);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(f.x, f.y, f.big ? 3.6 : 2.5, 0, 7); ctx.fill();
        if (f.big) {
          ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.3;
          for (let a = 0; a < 3; a++) {
            const th = f.ph + a * Math.PI / 3;
            ctx.beginPath();
            ctx.moveTo(f.x - Math.cos(th) * 6.5, f.y - Math.sin(th) * 6.5);
            ctx.lineTo(f.x + Math.cos(th) * 6.5, f.y + Math.sin(th) * 6.5);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    } else if (flakes.length) flakes.length = 0;

    if (breeze > 0.05 && !reduced) {
      const n = Math.ceil(3 * breeze);
      for (let i = 0; i < n; i++) {
        const yy = H * (0.2 + 0.22 * i) + Math.sin(t * 0.0005 + i * 2) * 30;
        const xx = ((t * (0.06 + i * 0.018)) % (W + 300)) - 150;
        ctx.globalAlpha = 0.5 * breeze;
        windCurl(xx, yy, t + i * 700, 0.9 + i * 0.2);
        ctx.globalAlpha = 1;
      }
    }

    if (fog > 0.03) {
      ensureFog();
      ctx.globalAlpha = 0.3 * fog;
      const drift = reduced ? 0 : t * 0.012;
      for (let i = 0; i < 3; i++) {
        const xx = ((drift * (1 + i * 0.3) + i * 500) % (W + 500)) - 380;
        ctx.drawImage(fogSprite, xx, H * (0.3 + i * 0.22), 500, 190);
      }
      ctx.globalAlpha = 0.08 * fog;
      ctx.fillStyle = '#F3E9D2';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- the Ascent Log ridgeline (bottom strip) ---------- */
  function drawLogStrip(G, night) {
    const h = 74, y0 = H - h;
    ctx.fillStyle = night ? 'rgba(26,20,10,.92)' : 'rgba(247,235,206,.94)';
    ctx.fillRect(0, y0, W, h);
    ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke();
    const pad = 26, gap = 8;
    const mw = (W - pad * 2 - gap * 15) / 16;
    Model.massifs.forEach((m, i) => {
      const x = pad + i * (mw + gap);
      const signed = m.slugs.filter(s => G.signedSet.has(s)).length;
      const frac = signed / m.count;
      const base = y0 + h - 16;
      ctx.beginPath();
      ctx.moveTo(x, base);
      m.slugs.forEach((s, j) => {
        const px = x + (j + 0.5) / m.count * mw;
        const ph = 6 + Math.min(heightOf(s), 6000) / 6000 * 34;
        ctx.lineTo(px, base - ph);
      });
      ctx.lineTo(x + mw, base);
      ctx.closePath();
      ctx.fillStyle = night ? 'rgba(234,217,174,.22)' : 'rgba(34,26,16,.16)';
      ctx.fill();
      if (frac > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(x, base - 44, mw * frac, 46); ctx.clip();
        ctx.beginPath(); ctx.moveTo(x, base);
        m.slugs.forEach((s, j) => {
          const px = x + (j + 0.5) / m.count * mw;
          const ph = 6 + Math.min(heightOf(s), 6000) / 6000 * 34;
          ctx.lineTo(px, base - ph);
        });
        ctx.lineTo(x + mw, base); ctx.closePath();
        ctx.fillStyle = 'rgba(196,69,44,.8)'; ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = night ? '#EAD9AE' : INK;
      ctx.font = "800 7.5px 'Baloo 2', sans-serif";
      ctx.textAlign = 'center';
      const short = m.section.replace('Command Line Interface', 'CLI').replace(' management', ' mgmt').replace(' configuration', ' config');
      ctx.fillText((m.product === 'cms' ? '' : '☁ ') + short.toUpperCase(), x + mw / 2, y0 + h - 4);
    });
    ctx.textAlign = 'left';
  }

  /* =================================================================
     FILM PASS: grain + scratches + iris on the overlay canvas
     ================================================================= */
  let grainTiles = [], grainPatterns = [];
  function makeGrain() {
    grainTiles = []; grainPatterns = [];
    for (let v = 0; v < 3; v++) {
      const c = document.createElement('canvas');
      c.width = c.height = 224;
      const g = c.getContext('2d');
      const rng = rngFor('grain' + v);
      for (let i = 0; i < 240; i++) {
        const a = 0.16 + rng() * 0.4;
        g.fillStyle = rng() < 0.5 ? 'rgba(20,14,6,' + a * 0.55 + ')' : 'rgba(255,250,238,' + a * 0.5 + ')';
        const r = rng() < 0.85 ? 0.7 + rng() : 1.6 + rng() * 1.6;
        g.beginPath(); g.arc(rng() * 224, rng() * 224, r, 0, 7); g.fill();
      }
      // a couple of tiny hairs
      for (let i = 0; i < 2; i++) {
        g.strokeStyle = 'rgba(20,14,6,.18)'; g.lineWidth = 0.8;
        const x = rng() * 224, y = rng() * 224;
        g.beginPath(); g.moveTo(x, y);
        g.quadraticCurveTo(x + 6 - rng() * 12, y + 10, x + 4 - rng() * 8, y + 22);
        g.stroke();
      }
      grainTiles.push(c);
    }
  }

  const iris = { phase: 'none', t: 0, cb: null, black: false };
  let filmKey = '';
  function irisCut(cb, opt) {
    opt = opt || {};
    if (reduced) { if (cb) cb(); return; }
    iris.phase = 'closing'; iris.t = 0; iris.cb = cb || null; iris.hold = opt.hold || 0.06;
  }
  function irisOpenFromBlack() {
    if (reduced) { iris.phase = 'none'; iris.black = false; return; }
    iris.black = false; iris.phase = 'opening'; iris.t = 0;
  }
  function irisBlack() { iris.black = true; iris.phase = 'none'; }

  function drawFilm(t, dt) {
    if (!fx) return;
    const v = reduced ? 0 : Math.floor(t / 90) % 3;
    const cyc = reduced ? -1 : Math.floor(t / 640);
    const irisLive = iris.black || iris.phase !== 'none';
    const key = v + ':' + cyc + (irisLive ? ':iris' : '');
    if (key === filmKey && !irisLive) return;   // the film only reprints when a frame of grain changes
    filmKey = key;
    fx.clearRect(0, 0, W, H);
    if (!grainPatterns[v]) grainPatterns[v] = fx.createPattern(grainTiles[v], 'repeat');
    fx.globalAlpha = 0.16;
    fx.fillStyle = grainPatterns[v];
    fx.fillRect(0, 0, W, H);
    fx.globalAlpha = 1;
    // an occasional vertical scratch
    if (!reduced && (cyc % 6) === 0) {
      const rx = ((cyc * 2654435761) >>> 8) % W;
      fx.strokeStyle = 'rgba(30,22,10,.12)';
      fx.lineWidth = 1;
      fx.beginPath(); fx.moveTo(rx, 0); fx.lineTo(rx + 3, H); fx.stroke();
    }
    // iris
    if (iris.black) {
      fx.fillStyle = '#17120a';
      fx.fillRect(0, 0, W, H);
      return;
    }
    if (iris.phase === 'none') return;
    iris.t += dt;
    const Rmax = Math.hypot(W, H) * 0.55;
    let r;
    if (iris.phase === 'closing') {
      const f = Math.min(1, iris.t / 0.5);
      const e = f * f * (3 - 2 * f);
      r = Rmax * (1 - e);
      if (f >= 1) {
        iris.phase = 'holding'; iris.t = 0;
        if (iris.cb) { const cb = iris.cb; iris.cb = null; cb(); }
      }
    } else if (iris.phase === 'holding') {
      r = 0;
      if (iris.t >= (iris.hold || 0.06)) { iris.phase = 'opening'; iris.t = 0; }
    } else {
      const f = Math.min(1, iris.t / 0.62);
      const e = f * f * (3 - 2 * f);
      r = Rmax * e;
      if (f >= 1) iris.phase = 'none';
    }
    fx.fillStyle = '#17120a';
    fx.beginPath();
    fx.rect(0, 0, W, H);
    fx.arc(W / 2, H / 2, Math.max(0.01, r), 0, 6.284, true);
    fx.fill();
  }

  return {
    init, resize, buildScene, setTheme, draw, rappelCurve,
    irisCut, irisBlack, irisOpenFromBlack,
    forceWeather, forceGag, clearGags, emitNotes,
    get camY() { return camY; }, set camY(v) { camY = v; },
    get W() { return W; }, get H() { return H; },
    get phaseName() { return PHASES[SKY.idx].k; },
    get weatherName() { return WX.cur; },
    set onEvent(cb) { onEvent = cb; },
    get gagCount() { return gags.active.length; },
    get gagKinds() { return GAGKINDS.map(g => g.k); },
    s2y,
  };
})();
