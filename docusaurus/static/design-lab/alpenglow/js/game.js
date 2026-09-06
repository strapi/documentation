/* ALPENGLOW, game.js
   The one verb: CLIMB. Hold to reach, release to latch,
   exactly as the audition built it. No death, no fail screen, ever.
   New in the rubber-hose cut: the climber has personality
   (idle whistles, belay rest, a yodel with an echo on topping out). */

'use strict';

const Game = (() => {

  const G = {
    scene: null, mode: 'climb',        // climb | ledge | summit | rappel
    pitchIdx: 0, holdIdx: 0,
    holding: false, holdT: 0, sweep: 0, reach: 0,
    window: 28, period: 1.2,
    grip: 100,
    particles: [],
    signedSet: new Set(),
    signedHere: false,
    reduced: false,
    frozen: false, frozenT: 0,
    dimWorld: false, showLogStrip: false,
    tautRope: null, snapCamera: false,
    rappel: null,
    hiking: false,
    emote: null,                       // {kind, until} for poses: whistle | ouch | yodel
    idleT: 0,
  };

  let hooks = {};
  let lastT = 0;
  let hikeTimer = 0;

  for (let i = 0; i < 60; i++) G.particles.push({ x: 0, y: 0, vx: 0, vy: 0, r: 2, life: 0, kind: 'chalk' });

  function init(h) {
    hooks = h || {};
    G.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    bindInput();
    requestAnimationFrame(loop);
  }

  /* ---------- route lifecycle ---------- */
  function startRoute(slug, opts) {
    opts = opts || {};
    G.scene = World.buildScene(slug);
    G.mode = 'climb';
    G.pitchIdx = 0;
    G.holdIdx = 0;
    G.holding = false; G.holdT = 0; G.sweep = 0; G.reach = 0;
    G.grip = opts.grip != null ? opts.grip : 100;
    G.signedHere = G.signedSet.has(slug);
    G.dimWorld = false; G.tautRope = null; G.rappel = null;
    G.hiking = false;
    G.emote = null; G.idleT = 0;
    World.camY = 0;
    G.snapCamera = !!opts.snap;
    applyPitchDifficulty();
    if (hooks.onRoute) hooks.onRoute(slug);
    return G.scene;
  }

  function applyPitchDifficulty() {
    const p = G.scene.pitches[G.pitchIdx];
    // crux pitches (h2 spans containing code): 16 degrees at 0.9 s; base 28 at 1.2 s
    G.window = p && p.crux ? 16 : 28;
    G.period = p && p.crux ? 0.9 : 1.2;
  }

  function pitchStartIdx(pi) {
    for (let i = 0; i < G.scene.holds.length; i++) if (G.scene.holds[i].pitch === pi) return i;
    return 0;
  }
  function pitchEndIdx(pi) {
    let last = 0;
    for (let i = 0; i < G.scene.holds.length; i++) if (G.scene.holds[i].pitch === pi) last = i;
    return last;
  }

  /* ---------- input: hold to reach, release to latch ---------- */
  function press() {
    if (G.frozen || G.mode === 'rappel' || G.mode === 'summit' || G.hiking) return;
    if (G.mode === 'ledge') { G.mode = 'climb'; if (hooks.onHud) hooks.onHud(); }
    if (G.mode !== 'climb' || G.holding) return;
    if (G.grip <= 0) return;
    G.holding = true; G.holdT = 0;
    G.idleT = 0;
  }

  function release() {
    if (G.frozen || !G.holding || G.mode !== 'climb') { G.holding = false; return; }
    G.holding = false;
    G.idleT = 0;
    const ok = G.reduced ? true : Math.abs(G.sweep) <= G.window / 2;
    if (ok) latch(); else slip();
  }

  function latch() {
    spawnChalk();
    if (hooks.onSound) hooks.onSound('latch', G.holdIdx);
    const endIdx = pitchEndIdx(G.pitchIdx);
    if (G.holdIdx >= endIdx) {
      // topping out the pitch: belay ledge, or the summit itself
      if (G.pitchIdx >= G.scene.pitches.length - 1) return summit();
      const L = G.scene.ledges[G.pitchIdx];
      if (L) L.clipT = performance.now();          // the piton wriggles when clipped
      G.pitchIdx++;
      G.mode = 'ledge';
      G.grip = 100;
      applyPitchDifficulty();
      if (hooks.onLedge) hooks.onLedge(G.scene.ledges[G.pitchIdx - 1]);
    } else {
      G.holdIdx++;
      G.grip = Math.min(100, G.grip + 3);
    }
    if (hooks.onHud) hooks.onHud();
  }

  function slip() {
    // sag back one hold, never past the last piton
    const floor = pitchStartIdx(G.pitchIdx);
    G.holdIdx = Math.max(floor, G.holdIdx - 1);
    G.emote = { kind: 'ouch', until: performance.now() + 900 };
    spawnChalk();
    if (hooks.onSound) hooks.onSound('slip');
    if (hooks.onHud) hooks.onHud();
  }

  function summit() {
    G.mode = 'summit';
    G.grip = 100;
    // the yodel, with a real echo, before settling by the cairn
    G.emote = { kind: 'yodel', until: performance.now() + 2300 };
    if (hooks.onSound) hooks.onSound('yodel');
    if (hooks.onYodel) hooks.onYodel();
    if (hooks.onSummit) hooks.onSummit(G.scene.slug, { hiked: G.hiking });
    if (hooks.onHud) hooks.onHud();
  }

  /* ---------- hike: auto walk-up at 4x, no badges ---------- */
  function hike() {
    if (G.mode === 'summit' || G.hiking) return;
    G.hiking = true; G.holding = false;
    if (G.reduced) { // reduced motion: arrive instantly, visibly
      G.pitchIdx = G.scene.pitches.length - 1;
      G.holdIdx = pitchEndIdx(G.pitchIdx);
      summit();
      G.hiking = true;
      return;
    }
    hikeTimer = 0.001;
  }

  function stepHike() {
    if (G.mode === 'ledge') { G.mode = 'climb'; }
    if (G.mode !== 'climb') { hikeTimer = 0; return; }
    const endIdx = pitchEndIdx(G.pitchIdx);
    if (G.holdIdx >= endIdx) {
      if (G.pitchIdx >= G.scene.pitches.length - 1) { summit(); hikeTimer = 0; return; }
      const L = G.scene.ledges[G.pitchIdx];
      if (L) L.clipT = performance.now();
      G.pitchIdx++; G.mode = 'ledge'; G.grip = 100;
      applyPitchDifficulty();
      if (hooks.onLedge) hooks.onLedge(G.scene.ledges[G.pitchIdx - 1], true);
    } else {
      G.holdIdx++;
      if (G.holdIdx % 2 === 0 && hooks.onSound) hooks.onSound('step');
    }
    if (hooks.onHud) hooks.onHud();
  }

  /* ---------- rappel: ride a real citation edge ---------- */
  function rappelTo(target) {
    if (G.mode !== 'summit') return;
    const label = titleOf(target);
    if (G.reduced) { // captioned cut, full parity
      if (hooks.onRappelCut) hooks.onRappelCut(target, label);
      startRoute(target, { snap: true });
      return;
    }
    G.mode = 'rappel';
    G.dimWorld = false;
    const c = World.rappelCurve(G.scene, G);
    G.rappel = { curve: c, s: 0, label, target, wy: G.scene.summitY, dur: 1.9 };
    if (hooks.onRappelStart) hooks.onRappelStart(target, label);
    if (hooks.onSound) hooks.onSound('rappel');
  }

  /* ---------- particles ---------- */
  function spawnChalk() {
    if (G.reduced) return;
    const p = climberXY();
    let n = 6;
    for (const q of G.particles) {
      if (q.life > 0) continue;
      q.x = p.x + (Math.random() - 0.5) * 14;
      q.y = p.y + 20 + Math.random() * 10;
      q.vx = (Math.random() - 0.5) * 26;
      q.vy = -14 - Math.random() * 22;
      q.r = 1.4 + Math.random() * 2.2;
      q.life = 0.7 + Math.random() * 0.4;
      q.kind = 'chalk';
      if (--n <= 0) break;
    }
  }

  function climberXY() {
    const h = G.scene.holds[Math.max(0, Math.min(G.holdIdx, G.scene.holds.length - 1))];
    return { x: h.x, y: h.y };
  }

  /* ---------- the loop ---------- */
  function loop(t) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;
    if (!G.scene) return;

    if (!G.frozen) {
      update(dt);
      World.draw(G, t);
    } else {
      World.draw(G, G.frozenT);
    }
  }

  function update(dt) {
    // pendulum + reach
    if (G.holding && G.mode === 'climb') {
      G.holdT += dt;
      G.reach = Math.min(1, G.holdT / 0.3);
      G.sweep = 60 * Math.sin((G.holdT / G.period) * Math.PI * 2);
      G.grip = Math.max(0, G.grip - 6 * dt);
      if (G.grip <= 0) { // breather at the piton
        G.holding = false;
        G.holdIdx = pitchStartIdx(G.pitchIdx);
        G.grip = 40;
        if (hooks.onBreather) hooks.onBreather();
      }
    } else if (G.mode === 'climb') {
      G.grip = Math.max(0, G.grip - 2 * dt);
      if (G.grip <= 0) {
        G.holdIdx = pitchStartIdx(G.pitchIdx);
        G.grip = 40;
        if (hooks.onBreather) hooks.onBreather();
      }
      G.reach *= 0.8;
      // idle personality: after a quiet while, the climber whistles
      if (!G.hiking && !G.reduced) {
        G.idleT += dt;
        if (G.idleT > 7) {
          G.idleT = -3;   // whistle, then wait ten more seconds
          G.emote = { kind: 'whistle', until: performance.now() + 1900 };
          if (hooks.onIdle) hooks.onIdle();
        }
      }
    } else if (G.mode === 'ledge' || G.mode === 'summit') {
      G.grip = Math.min(100, G.grip + 30 * dt);
    }

    // hike autopilot
    if (G.hiking && hikeTimer > 0) {
      hikeTimer += dt;
      if (hikeTimer > 0.14) { hikeTimer = 0.001; stepHike(); }
    }

    // rappel travel
    if (G.mode === 'rappel' && G.rappel) {
      G.rappel.s += dt / G.rappel.dur;
      if (G.rappel.s >= 1) {
        const tgt = G.rappel.target;
        if (hooks.onRappelEnd) hooks.onRappelEnd(tgt);
        startRoute(tgt, { snap: false });
      }
    }

    // particles
    for (const p of G.particles) {
      if (p.life <= 0) continue;
      p.life -= dt * 1.3;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy -= 40 * dt;
    }

    if (hooks.onTick) hooks.onTick(dt);
  }

  /* ---------- raw input binding ---------- */
  function bindInput() {
    const down = e => {
      if (e.target !== document.body && e.target.id !== 'world') return;
      press(); e.preventDefault();
    };
    const up = () => release();
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchstart', down, { passive: false });
    window.addEventListener('touchend', up);
    window.addEventListener('keydown', e => {
      if (e.code === 'Space' && !e.repeat) {
        const inField = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
        const bookOpen = !document.getElementById('book').hidden;
        const cardsOpen = !document.getElementById('titlecards').hidden;
        if (!inField && !bookOpen && !cardsOpen) { press(); e.preventDefault(); }
      }
    });
    window.addEventListener('keyup', e => { if (e.code === 'Space') release(); });
  }

  function freeze(t) { G.frozen = true; G.frozenT = t || 0; }
  function unfreeze() { G.frozen = false; }

  return { G, init, startRoute, rappelTo, hike, press, release, freeze, unfreeze, pitchEndIdx, pitchStartIdx, climberXY };
})();
