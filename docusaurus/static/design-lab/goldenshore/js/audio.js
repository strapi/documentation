// The coast's sound, synthesized at runtime from nothing but WebAudio.
// No files, no libraries. One AudioContext raised on the first gesture,
// one real toggle (M or the speaker glyph), gentle by default at half
// gain, remembered in localStorage behind try/catch. Nothing is gated by
// audio: every spoken line is a caption first, and the coast works mute.

import { COAST_X, PIER, TERRACES, provinceAt } from './terrain.js';
import { safeStore } from './data.js';

/* ─────────────────────── FOOTSTEPS, SECOND BUILD ───────────────────────
   (2026-09-08, owner: "ça ne ressemble absolument pas à des pas et ça ne
   change pas en fonction du terrain")

   The first build was nine recipes of filtered white noise that differed only
   in centre frequency and level. Both complaints follow from that one fact.

   It did not sound like a step because a step is an IMPACT and a filtered
   noise burst is a puff. The tell was the envelope: a six-millisecond attack
   has already rounded off the edge the ear uses to hear a hit. A real heel
   strike is under a millisecond to peak.

   The surfaces did not separate because the ear does not sort ground by filter
   frequency. It sorts ground by TEXTURE: how many separate little impacts
   arrive, how fast, and how bright. Sand and scree are not two colours of the
   same noise, they are two grain counts. So the recipes below differ first in
   structure and only then in tone:

     surface   strike        grains            body
     boards    hard          none              two ring modes, hollow
     cobbles   hard, bright  none              one very short high ring
     dirt      dull          4, dull           a dead thud
     grass     soft          3, plus a swish   a soft thud
     sand      almost none   2, muffled        a long soft collapse
     needles   dry crack     12, bright        none
     scree     hard          22, bright, slow  a small slide after the step
     shell     sharp, bright 26, very bright   none
     water     none          none              a swell and a break

   This lives at module scope, taking its context as an argument, so that the
   offline renderer that measures it and the coast that plays it are running
   the same code and not two drifting copies of it. That is the whole reason
   the first build was signed off wrongly: it was read, not heard. */

const _noiseCache = new WeakMap();
function stepNoise(ctx) {
  let b = _noiseCache.get(ctx);
  if (!b) {
    b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    _noiseCache.set(ctx, b);
  }
  return b;
}
function panner(ctx, pan) {
  const p = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
  if (p.pan) p.pan.value = pan;
  return p;
}
/* ONE IMPACT. The attack is 0.7 ms on purpose: that edge is the difference
   between a hit and a hiss, and it is the single change that made these read
   as footsteps at all. */
function hit(ctx, dest, t0, cfg, peak, dur, pan) {
  const src = ctx.createBufferSource(); src.buffer = stepNoise(ctx);
  src.loop = true;
  src.playbackRate.value = 0.85 + Math.random() * 0.3;
  const f = ctx.createBiquadFilter();
  f.type = cfg.type; f.frequency.value = cfg.f; f.Q.value = cfg.q || 1;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.0007);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.0007 + dur);
  src.connect(f).connect(g).connect(panner(ctx, pan)).connect(dest);
  src.start(t0); src.stop(t0 + dur + 0.05);
}
/* THE GRAIN. Loose ground is not noise, it is a scatter of tiny separate
   impacts, and the count is what tells sand from scree. They are placed with
   a squared random so they crowd at the strike and thin out after it, which
   is how a foot actually settles into loose material. */
function grains(ctx, dest, t0, n, span, cfg, peak, dur, pan) {
  for (let i = 0; i < n; i++) {
    const u = Math.random();
    const at = t0 + u * u * span;
    const bright = cfg.f * (0.6 + Math.random() * 0.9);
    hit(ctx, dest, at, { type: cfg.type, f: bright, q: cfg.q },
        peak * (0.35 + Math.random() * 0.85), dur * (0.5 + Math.random()),
        pan + (Math.random() - 0.5) * 0.22);
  }
}
/* THE BODY. A damped sine is the ground answering the weight: hollow and long
   on boards, short and dead on sand. */
function body(ctx, dest, t0, freq, peak, dur, pan, q) {
  const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(freq * 1.25, t0);
  o.frequency.exponentialRampToValueAtTime(freq, t0 + Math.min(0.05, dur));
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.0012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(panner(ctx, pan)).connect(dest);
  o.start(t0); o.stop(t0 + dur + 0.05);
}

export const STEP_SURFACES = ['boards', 'cobbles', 'dirt', 'grass', 'sand', 'needles', 'scree', 'shell', 'water'];

/* MEASURED TRIMS. A lowpass on white noise gives back a small fraction of the
   amplitude a highpass gives, so peaks chosen by eye in the source arrive at
   the speaker three to one apart and a walk across the coast jumps in volume
   at every province line. These are solved from the offline render, not
   guessed: qa/measure-steps.js prints the peaks and the spread it leaves. */
const STEP_TRIM = { boards: 0.56, cobbles: 0.59, dirt: 1.15, grass: 1.07, sand: 1.53, needles: 1.38, scree: 0.98, shell: 1.19, water: 2.01 };

export function stepVoice(ctx, dest, t0, surface, pan = 0, lvl = 1) {
  const j = (a, b) => a + Math.random() * (b - a);
  const L = lvl * j(0.82, 1.18) * (STEP_TRIM[surface] || 1);              /* nobody treads twice the same */
  const toe = j(0.036, 0.062);                /* heel, then the toe behind it */
  switch (surface) {
    case 'boards':
      hit(ctx, dest, t0, { type: 'lowpass', f: j(1100, 1500), q: 0.8 }, 0.185 * L, 0.035, pan);
      body(ctx, dest, t0, j(78, 94), 0.062 * L, 0.115, pan);     /* the plank, damped by the joist */
      body(ctx, dest, t0, j(196, 232), 0.034 * L, 0.075, pan);   /* and its second mode */
      hit(ctx, dest, t0 + toe, { type: 'bandpass', f: j(1600, 2100), q: 1.0 }, 0.05 * L, 0.03, pan);
      break;
    case 'cobbles':
      hit(ctx, dest, t0, { type: 'highpass', f: j(1300, 1900), q: 0.7 }, 0.105 * L, 0.022, pan);
      hit(ctx, dest, t0, { type: 'lowpass', f: j(420, 560), q: 0.9 }, 0.085 * L, 0.045, pan);
      body(ctx, dest, t0, j(280, 340), 0.022 * L, 0.045, pan);   /* stone barely rings */
      hit(ctx, dest, t0 + toe * 0.7, { type: 'highpass', f: j(2200, 3000), q: 0.6 }, 0.055 * L, 0.018, pan);
      break;
    case 'dirt':
      hit(ctx, dest, t0, { type: 'lowpass', f: j(380, 520), q: 0.7 }, 0.145 * L, 0.055, pan);
      body(ctx, dest, t0, j(64, 78), 0.055 * L, 0.075, pan);     /* dead, no ring */
      grains(ctx, dest, t0 + 0.004, 4, 0.05, { type: 'bandpass', f: 900, q: 1.2 }, 0.022 * L, 0.014, pan);
      break;
    case 'grass':
      hit(ctx, dest, t0, { type: 'lowpass', f: j(340, 460), q: 0.7 }, 0.135 * L, 0.05, pan);
      body(ctx, dest, t0, j(58, 70), 0.062 * L, 0.07, pan);
      /* the swish: grass is the one ground that brushes rather than crunches.
         It starts AFTER the strike and stays under it, or the step reads as a
         brush with no foot in it, which is what the first measure showed. */
      hit(ctx, dest, t0 + 0.026, { type: 'highpass', f: j(2600, 3400), q: 0.5 }, 0.022 * L, 0.13, pan);
      grains(ctx, dest, t0 + 0.03, 3, 0.09, { type: 'highpass', f: 4200, q: 0.5 }, 0.014 * L, 0.02, pan);
      break;
    case 'sand':
      /* no transient worth the name: sand takes the impact and gives nothing back */
      hit(ctx, dest, t0, { type: 'lowpass', f: j(300, 420), q: 0.5 }, 0.135 * L, 0.115, pan);
      body(ctx, dest, t0, j(52, 62), 0.045 * L, 0.085, pan);
      grains(ctx, dest, t0 + 0.01, 2, 0.07, { type: 'lowpass', f: 800, q: 0.6 }, 0.02 * L, 0.03, pan);
      break;
    case 'needles':
      hit(ctx, dest, t0, { type: 'bandpass', f: j(1500, 2100), q: 0.8 }, 0.125 * L, 0.03, pan);
      hit(ctx, dest, t0, { type: 'lowpass', f: j(240, 320), q: 0.7 }, 0.045 * L, 0.05, pan);
      grains(ctx, dest, t0 + 0.003, 12, 0.085, { type: 'bandpass', f: 3600, q: 1.4 }, 0.026 * L, 0.011, pan);
      break;
    case 'scree':
      hit(ctx, dest, t0, { type: 'bandpass', f: j(1200, 1700), q: 0.7 }, 0.145 * L, 0.035, pan);
      hit(ctx, dest, t0, { type: 'lowpass', f: j(280, 360), q: 0.8 }, 0.05 * L, 0.06, pan);
      /* the loose limestone keeps moving after the boot has stopped */
      grains(ctx, dest, t0 + 0.004, 22, 0.19, { type: 'bandpass', f: 2600, q: 1.1 }, 0.03 * L, 0.014, pan);
      break;
    case 'shell':
      hit(ctx, dest, t0, { type: 'highpass', f: j(2400, 3200), q: 0.6 }, 0.055 * L, 0.016, pan);
      hit(ctx, dest, t0, { type: 'lowpass', f: j(420, 560), q: 0.6 }, 0.05 * L, 0.05, pan);
      grains(ctx, dest, t0 + 0.002, 16, 0.095, { type: 'bandpass', f: 5200, q: 1.6 }, 0.046 * L, 0.010, pan);
      break;
    case 'water':
      /* a stroke, not a step: a swell pushed aside, then the hand entering */
      hit(ctx, dest, t0, { type: 'lowpass', f: j(300, 400), q: 0.6 }, 0.135 * L, 0.13, pan);
      body(ctx, dest, t0 + 0.02, j(150, 200), 0.03 * L, 0.10, pan);
      hit(ctx, dest, t0 + toe * 2.2, { type: 'bandpass', f: j(1300, 1800), q: 0.8 }, 0.055 * L, 0.12, pan);
      if (Math.random() < 0.6) hit(ctx, dest, t0 + toe * 3.4, { type: 'highpass', f: j(3200, 4200), q: 0.5 }, 0.03 * L, 0.08, pan);
      break;
    default:
      stepVoice(ctx, dest, t0, 'dirt', pan, lvl);
  }
}

export function initAudio() {
  const S = {
    ctx: null, on: safeStore.get('longlight.audio', true), master: null,
    duck: null, ready: false, t: 0,
    surf: [], wind: null, rain: null, nodes: {},
    nextCicada: 0, nextGull: 0, nextBell: 0, nextTick: 0,
    stepAcc: 0, stepNext: 0.78, footL: false,
  };

  function noiseBuffer(ctx, seconds = 2, brown = false) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else d[i] = w;
    }
    return buf;
  }

  function build() {
    if (S.ready) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    S.ctx = ctx;
    S.master = ctx.createGain();
    S.master.gain.value = S.on ? 0.5 : 0.0; // gentle by default, half gain
    S.duck = ctx.createGain();
    S.duck.gain.value = 1;
    S.duck.connect(S.master).connect(ctx.destination);
    const white = noiseBuffer(ctx, 2);
    S.brownBuf = noiseBuffer(ctx, 3, true);
    S.whiteBuf = white;

    /* (2026-09-07, owner: "on ne distingue pas le bruit du vent du bruit des
       vagues") They were both bandpassed white noise in neighbouring bands, so
       of course they were one sound. The sea is now BROWN noise, low and heavy,
       under a lowpass an octave beneath where it sat; the wind keeps the white
       and moves up out of its way. What separates them in the end is not the
       filter but the motion: a swell breathes slowly and regularly, a gust does
       not. See the tick, where the surf's period is lengthened and deepened. */
    // ----- shore: two brown surf voices, swelling on their own tides -----
    for (const [pan, base] of [[-0.55, 240], [0.5, 330]]) {
      const src = ctx.createBufferSource();
      src.buffer = S.brownBuf; src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = base; lp.Q.value = 0.4;
      const g = ctx.createGain(); g.gain.value = 0;
      const p = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
      if (p.pan) p.pan.value = pan;
      src.connect(lp).connect(g).connect(p).connect(S.duck);
      src.start();
      S.surf.push({ g, lp, base, phase: Math.random() * 9 });
    }

    // ----- wind: bandpassed noise that shares the vegetation's gusts -----
    {
      const src = ctx.createBufferSource(); src.buffer = white; src.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 760; bp.Q.value = 0.5;
      const shelf = ctx.createBiquadFilter(); shelf.type = 'highshelf'; shelf.frequency.value = 1800; shelf.gain.value = 0;
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(bp).connect(shelf).connect(g).connect(S.duck);
      src.start();
      S.wind = { g, bp, shelf };
    }

    /* (2026-09-07, owner: "le bruit de la pluie est tres metallique") It was,
       and for a textbook reason: the rain was noise through a COMB FILTER, a
       fixed 11.5 ms delay fed back at 0.52. A comb with a fixed delay rings at
       1/delay and every harmonic of it, here 87 Hz and up, which is precisely
       how one synthesises a struck metal plate. Rain has no pitch at all.
       It is built from what rain is instead: a broad hiss up top, a soft roar
       underneath, and discrete drops that land one at a time. */
    // ----- rain: hiss, roar, and separate drops -----
    {
      const g = ctx.createGain(); g.gain.value = 0;
      g.connect(S.duck);
      /* the hiss: the sheet of it, wide open, no resonance anywhere */
      const hs = ctx.createBufferSource(); hs.buffer = white; hs.loop = true;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 520; hp.Q.value = 0.4;
      const hl = ctx.createBiquadFilter(); hl.type = 'lowpass'; hl.frequency.value = 7200; hl.Q.value = 0.3;
      const hg = ctx.createGain(); hg.gain.value = 0.62;
      hs.connect(hp).connect(hl).connect(hg).connect(g); hs.start();
      /* the roar: heavy water on ground, brown and dull, well under the hiss */
      const rs = ctx.createBufferSource(); rs.buffer = S.brownBuf; rs.loop = true;
      const rl = ctx.createBiquadFilter(); rl.type = 'lowpass'; rl.frequency.value = 900; rl.Q.value = 0.5;
      const rg = ctx.createGain(); rg.gain.value = 0.45;
      rs.connect(rl).connect(rg).connect(g); rs.start();
      S.rain = { g, hl, drop: 0 };
    }

    // ----- lantern hum: two barely detuned sines and a gain by nearness -----
    {
      const o1 = ctx.createOscillator(); o1.frequency.value = 106;
      const o2 = ctx.createOscillator(); o2.frequency.value = 108.7;
      const g = ctx.createGain(); g.gain.value = 0;
      o1.connect(g); o2.connect(g); g.connect(S.duck);
      o1.start(); o2.start();
      S.hum = { g };
    }
    S.ready = true;
  }

  // one-shot helpers -------------------------------------------------------
  function env(g, t0, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  }
  function burst(filterCfg, peak, dur, pan = 0, delay = 0) {
    if (!S.ready || !S.on) return;
    const ctx = S.ctx, t0 = ctx.currentTime + delay;
    const src = ctx.createBufferSource(); src.buffer = S.whiteBuf;
    src.playbackRate.value = 0.7 + Math.random() * 0.6;
    const f = ctx.createBiquadFilter();
    Object.assign(f, { type: filterCfg.type });
    f.frequency.value = filterCfg.f; f.Q.value = filterCfg.q || 1;
    const g = ctx.createGain();
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (p.pan) p.pan.value = pan;
    src.connect(f).connect(g).connect(p).connect(S.duck);
    env(g, t0, 0.006, peak, dur);
    src.start(t0); src.stop(t0 + dur + 0.1);
  }
  function tone(freq, type, peak, a, d, pan = 0, glideTo = 0) {
    if (!S.ready || !S.on) return;
    const ctx = S.ctx, t0 = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    if (glideTo) o.frequency.linearRampToValueAtTime(glideTo, t0 + a + d);
    const g = ctx.createGain();
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (p.pan) p.pan.value = pan;
    o.connect(g).connect(p).connect(S.duck);
    env(g, t0, a, peak, d);
    o.start(t0); o.stop(t0 + a + d + 0.1);
  }

  const api = {
    get on() { return S.on; },
    // an honest hook for the headless walk: nothing here is used by the coast
    state() {
      return {
        on: S.on, ready: !!S.ready,
        ctx: S.ctx ? S.ctx.state : 'none',
        master: S.master ? +S.master.gain.value.toFixed(3) : null,
        nodes: S.ready ? Object.keys(S).length : 0,
      };
    },
    arm() { build(); if (S.ctx && S.ctx.state === 'suspended') S.ctx.resume(); },
    toggle() {
      S.on = !S.on;
      safeStore.set('longlight.audio', S.on);
      if (S.master) S.master.gain.setTargetAtTime(S.on ? 0.5 : 0.0, S.ctx.currentTime, 0.15);
      return S.on;
    },
    // events ---------------------------------------------------------------
    tendChime() { tone(520, 'sine', 0.16, 0.05, 0.75, 0, 780); },
    knock() { burst({ type: 'lowpass', f: 420, q: 2 }, 0.22, 0.09); tone(170, 'sine', 0.12, 0.004, 0.12); },
    thunder() {
      if (!S.ready || !S.on) return;
      const ctx = S.ctx, t0 = ctx.currentTime;
      const src = ctx.createBufferSource(); src.buffer = S.brownBuf;
      src.playbackRate.value = 0.35 + Math.random() * 0.2;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 130;
      const g = ctx.createGain();
      src.connect(lp).connect(g).connect(S.duck);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.5, t0 + 0.6 + Math.random() * 0.8);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.6);
      src.start(t0); src.stop(t0 + 4);
    },
    gullCry(pan) {
      const f0 = 880 + Math.random() * 480;
      tone(f0, 'sawtooth', 0.028, 0.03, 0.42, pan, f0 * 0.62);
    },
    /* (2026-09-07, owner) THE FOOTSTEPS WERE A BICYCLE. "On dirait limite un
       vélo." Two faults, and they compounded. Every footfall was a single
       filtered click with a six-millisecond attack, and the gait fired on an
       exact interval, so the ear heard an even train of ticks: a freewheel.
       A real footfall is TWO sounds, a heel that lands and a toe that scuffs
       forty milliseconds behind it, and no two are alike. So: every step is a
       heel and a scuff, each surface says what the two are made of, gain and
       filter and offset are drawn fresh every time, and the feet alternate
       across the stereo field. The stride itself is jittered where it is
       counted. Nothing here is louder than it was; it is simply not a machine. */
    /* a window on the beds, so a probe can prove the sea fades inland and the
       wind does not, without anyone having to trust the arithmetic */
    levels() {
      return {
        surf: S.surf ? +S.surf.reduce((a, v) => a + v.g.gain.value, 0).toFixed(4) : null,
        surfHz: S.surf && S.surf[0] ? Math.round(S.surf[0].lp.frequency.value) : null,
        wind: S.wind ? +S.wind.g.gain.value.toFixed(4) : null,
        windHz: S.wind ? Math.round(S.wind.bp.frequency.value) : null,
      };
    },
    step(surface) {
      if (!S.ready || !S.on) return;
      S.footL = !S.footL;
      /* left foot, right foot: the only thing the caller still decides */
      stepVoice(S.ctx, S.duck, S.ctx.currentTime, surface, S.footL ? -0.13 : 0.13);
    },
    // the continuous bed ----------------------------------------------------
    tick(dt, ctx2) {
      if (!S.ready || !S.on) return;
      S.t += dt;
      const { x, z, readerOpen, gust, state, rain, moved, surface, lanternNear, gullExcite, goats, inUplands } = ctx2;
      const t = S.t;
      S.duck.gain.setTargetAtTime(readerOpen ? 0.1 : 1, S.ctx.currentTime, 0.4);

      // shore by true distance to the waterline
      /* (2026-09-07, owner: "on ne doit entendre les vagues que quand on est
         proche du bord, et de moins en moins fort quand on s'eloigne") The old
         fall-off was gentle enough to follow you inland: 60 metres out it was
         still at a third. At 26 it is a third at 26 metres, a tenth at 60, and
         gone by a hundred, which is where the pines start. */
      const shoreD = Math.max(0, x - COAST_X);
      const shoreG = 0.30 * Math.exp(-shoreD / 26);
      S.surf.forEach((s, i) => {
        /* slower and deeper than the wind's gusting, which is the real tell */
        const swell = 0.42 + 0.58 * Math.sin(t * (2 * Math.PI / (11 + i * 4)) + s.phase);
        s.g.gain.setTargetAtTime(shoreG * swell, S.ctx.currentTime, 0.35);
        s.lp.frequency.setTargetAtTime(s.base + swell * 190, S.ctx.currentTime, 0.4);
      });

      // wind shares the vegetation's gust: same clock, same weather amplitude
      const gustPhase = 0.55 + 0.45 * Math.sin(t * 0.83 + Math.sin(t * 0.31) * 1.7);
      const alt = Math.min(1, Math.max(0, (ctx2.y || 0) / 45));
      let windG = 0.05 + 0.16 * gust * gustPhase * (0.5 + 0.5 * alt);
      if (state === 'sirocco') {
        windG *= 1.5;
        S.wind.shelf.gain.setTargetAtTime(-9, S.ctx.currentTime, 0.8); // the high shelf mutes
      } else S.wind.shelf.gain.setTargetAtTime(0, S.ctx.currentTime, 0.8);
      // the wind's band is the province's: pine needles hiss high, bare
      // limestone whistles, the sea and the islets roar low and wide
      /* (2026-09-07) The harbour and the cloud archipelago had the wind sitting
         at 380 and 320, which is exactly where the sea lives, and those are the
         two provinces you hear the sea in. Both move up out of its way; the
         highland and the Wall were already clear of it. */
      const WBAND = { harbor: 680, terraces: 760, highland: 900, wall: 1300, cloud: 620 };
      const prov = provinceAt(x, z);
      const band = WBAND[prov] || 380;
      S.windBand = S.windBand === undefined ? band : S.windBand + (band - S.windBand) * 0.02;
      S.wind.g.gain.setTargetAtTime(Math.min(0.4, windG), S.ctx.currentTime, 0.4);
      S.wind.bp.frequency.setTargetAtTime(S.windBand + gustPhase * 400, S.ctx.currentTime, 0.35);

      // rain follows the curtain
      S.rain.g.gain.setTargetAtTime(0.34 * rain, S.ctx.currentTime, 0.5);
      /* heavier rain closes the top a little, the way a downpour goes from
         hiss to roar, and lands more drops */
      S.rain.hl.frequency.setTargetAtTime(7200 - 2600 * rain, S.ctx.currentTime, 0.8);
      if (rain > 0.12) {
        S.rain.drop -= dt;
        if (S.rain.drop <= 0) {
          S.rain.drop = (0.16 + Math.random() * 0.34) / (0.3 + rain);
          /* one drop: a short bandpassed tick, panned where it fell */
          const f = 2600 + Math.random() * 3400;
          burst({ type: 'bandpass', f, q: 3.5 }, 0.030 * rain * (0.6 + Math.random() * 0.8),
                0.020 + Math.random() * 0.02, (Math.random() - 0.5) * 1.4);
        }
      }

      // cicadas: colonnade and groves, silenced by the squall
      // cicadas are a hot dry-country insect: the terraces, and the harbour
      // slopes behind them. Never in the pine shade, never out at sea.
      const inCicadaCountry = (prov === 'terraces' || prov === 'harbor') && x > 20 && Math.abs(z) < 95;
      if (inCicadaCountry && state !== 'squall' && rain < 0.2 && t > S.nextCicada) {
        S.nextCicada = t + 0.25 + Math.random() * 1.4;
        const f = 4100 + Math.random() * 1100;
        for (let k = 0; k < 4; k++) {
          setTimeout(() => tone(f, 'square', 0.008, 0.004, 0.045, (Math.random() - 0.5)), k * 55);
        }
      }

      // gulls from the flock, excited when the boat ties up
      if (x < 30 && t > S.nextGull) {
        const excite = 1 + 3 * (gullExcite || 0);
        S.nextGull = t + (3 + Math.random() * 9) / excite;
        api.gullCry((Math.random() - 0.5) * 1.2);
      }

      // goat bells, uplands only, panned from the real agents
      if (inUplands && goats && goats.length && t > S.nextBell) {
        S.nextBell = t + 4 + Math.random() * 10;
        const g0 = goats[Math.floor(Math.random() * goats.length)];
        const rel = Math.max(-1, Math.min(1, (g0.x - x) / 40));
        tone(1560 + Math.random() * 700, 'triangle', 0.035, 0.002, 0.5, rel);
        tone(2140 + Math.random() * 500, 'triangle', 0.02, 0.002, 0.3, rel);
      }

      // lantern hum with glass ticks inside six meters
      S.hum.g.gain.setTargetAtTime(0.05 * (lanternNear || 0), S.ctx.currentTime, 0.3);
      if ((lanternNear || 0) > 0.4 && t > S.nextTick) {
        S.nextTick = t + 1.5 + Math.random() * 4;
        tone(3400 + Math.random() * 1800, 'sine', 0.02, 0.002, 0.08);
      }

      // footsteps, surface-true
      S.stepAcc += moved || 0;
      /* a stride is never metronomic; the next one is drawn as it is taken */
      if (S.stepAcc > (S.stepNext || 0.78)) {
        S.stepAcc = 0;
        /* an arm reaches further than a foot */
        S.stepNext = surface === 'water' ? 1.05 + Math.random() * 0.25 : 0.70 + Math.random() * 0.17;
        api.step(surface);
      }
    },
  };
  return api;
}
