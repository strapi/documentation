import React, { useEffect, useId, useRef } from 'react';
import styles from './agentBot.module.scss';

/**
 * Animated Strapi mascot, ported from the Strapi Compare Agent bot
 * (https://strapi-compare-agent.vercel.app/bot).
 *
 * The SVG is rendered once by React; a requestAnimationFrame loop then drives
 * every transform directly on the DOM nodes (springs for gaze, squash, tilt…),
 * so state changes never re-render the SVG.
 *
 * States: idle, think, read, work, angry, done, wave.
 * Styles that matter are inline so the bot also renders inside a shadow DOM
 * (the Kapa modal), where the CSS module does not reach.
 * Props (bubbles, page, blocks) only render from 64px up unless forced.
 */

// Eye x positions, in viewBox units
const EYE_X = [380, 470];
const EYE_Y = 312.6;
const REST_LIGHT = { x: -0.35, y: -0.45 };
const CALM_COLORS = {
  tile: ['#6461FF', '#4945FF', '#3B37E6'],
  fold: ['#A5A3FF', '#9593FF', '#8885F7'],
  eye: '#4945FF',
};
const ANGRY_COLORS = {
  tile: ['#FF6B5E', '#EE3B2E', '#C42418'],
  fold: ['#FFB0A8', '#FF8F84', '#F47468'],
  eye: '#B3261E',
};

export const DEFAULT_TUNE = { speed: 1, look: 1, depth: 1, anger: 1, sleepAfter: 8, blink: 1 };

const STATE_LABELS = {
  angry: ', is angry',
  think: ', is thinking',
  read: ', is reading',
  work: ', is working',
  done: ', is done',
  wave: ', is waving',
};

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const isCalm = () => window.matchMedia(REDUCED_MOTION).matches;

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mixColor = (from, to, t) => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
};
const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};
// Overshooting ease used to pop the props in
const popIn = (x) => {
  const t = Math.min(1, Math.max(0, x));
  return t === 0 ? 0 : 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;
};

// One shared pointer tracker for every bot on the page
const pointer = { x: 0, y: 0, active: false, last: 0 };
let pointerListeners = 0;
const onPointerMove = (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.active = true;
  pointer.last = performance.now();
};
const onPointerLeave = () => {
  pointer.active = false;
};
function subscribePointer() {
  if (pointerListeners++ === 0) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
  }
  return () => {
    if (--pointerListeners === 0) {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
    }
  };
}

const TILE_PATH =
  'M39 282c0-118 0-176.9 36.6-213.5C112.2 32 171.1 32 288.9 32h221.2c117.8 0 176.7 0 213.3 36.6C760 105.2 760 164.1 760 281.9v221.2c0 117.8 0 176.7-36.6 213.3C686.8 753 627.9 753 510.1 753H288.9c-117.8 0-176.7 0-213.3-36.6C39 679.8 39 620.9 39 503.1V281.9Z';
const PUFF_PATH =
  'M-38 14a24 24 0 0 1 6-40 28 28 0 0 1 50-6 22 22 0 0 1 24 30 18 18 0 0 1-12 30h-52a20 20 0 0 1-16-14z';
const BUBBLES = [[748, 34, 24], [826, -50, 38], [930, -170, 60]];
const LINE_WIDTHS = [140, 116, 132, 96, 140, 120, 132, 104, 128];
const BLOCKS = [[830, 702], [904, 702], [978, 702], [867, 628], [941, 628], [904, 554]];
// Waving hand pivot, hidden behind the right side of the tile so the hand
// looks like it comes from behind the body
const HAND = { x: 690, y: 470 };

export default function AgentBot({
  state = 'idle',
  size = 96,
  className = '',
  label = 'Strapi AI assistant',
  shadow = true,
  decorative = false,
  tune = null,
  props = null,
}) {
  const rootRef = useRef(null);
  const id = `bot${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const stateRef = useRef(state);
  stateRef.current = state;
  const tuneRef = useRef(DEFAULT_TUNE);
  tuneRef.current = { ...DEFAULT_TUNE, ...tune };
  const wakeRef = useRef(null);

  // A state change restarts the loop if it was paused for reduced motion
  useEffect(() => {
    wakeRef.current?.();
  }, [state]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const q = (sel) => root.querySelector(sel);
    const qa = (sel) => [...root.querySelectorAll(sel)];
    const el = {
      tilt: q('[data-tilt]'),
      body: q('[data-body]'),
      face: q('[data-face]'),
      tile: q('[data-tile]'),
      shadow: q('[data-shadow]'),
      fold1: q('[data-fold1]'),
      fold2: q('[data-fold2]'),
      pThink: q('[data-p-think]'),
      pRead: q('[data-p-read]'),
      pWork: q('[data-p-work]'),
      hand: q('[data-hand]'),
      bubbles: qa('[data-bubble]'),
      lines: q('[data-lines]'),
      marks: qa('[data-mark]'),
      blocks: qa('[data-block]'),
      puffs: qa('[data-puff]'),
      lights: qa('[data-light]'),
      tileStops: qa('[data-tile-stop]'),
      foldStops: qa('[data-fold-stop]'),
      brows: qa('[data-brow]'),
      eyeFills: qa('[data-eye-fill]'),
      eyes: qa('[data-eye]').map((g, i) => ({
        g,
        x: EYE_X[i],
        open: g.querySelector('[data-open]'),
        happy: g.querySelector('[data-happy]'),
      })),
    };

    const s = {
      lx: 0, ly: 0, vlx: 0, vly: 0,
      gx: REST_LIGHT.x, gy: REST_LIGHT.y, vgx: 0, vgy: 0,
      sq: 0, vsq: 0, y: 0, vy: 0, air: false, anticip: 0, power: 1,
      tiltA: 0, vTiltA: 0, sqz: 0, vSqz: 0, sleep: 0, hover: false,
      happyUntil: 0, lastHop: 0, anger: 0, shown: 0, lastPoke: 0,
      tantrumAt: -1e9, huffAt: -1e9, sulkK: 0, vSulkK: 0, shake: 0, sulkUntil: 0,
      tint: -1, clock: 0, fThink: 0, fRead: 0, fWork: 0, fWave: 0, lastBlock: -1,
      nextBlink: performance.now() + 1500 + 3000 * Math.random(),
      blinkT: -1, double: false, seed: 100 * Math.random(),
    };
    if (!pointer.last) pointer.last = performance.now();

    const hop = (power = 1) => {
      if (isCalm() || s.air || s.anticip) return;
      s.anticip = performance.now();
      s.power = power;
    };

    // Clicking: wakes it up, makes it hop, and annoys it if repeated
    const onPoke = () => {
      if (isCalm()) return;
      const now = performance.now();
      if (s.sleep > 0.4) {
        s.sleep = 0;
        s.vsq += 5;
        s.happyUntil = now + 500;
        s.lastPoke = now;
        return;
      }
      if (now < s.sulkUntil) {
        s.shake = 0.6;
        s.vsq += 3;
        return;
      }
      const rapid = now - s.lastPoke < 900;
      s.lastPoke = now;
      s.anger = Math.min(1.25, s.anger + (rapid ? 0.16 : 0.07) * tuneRef.current.anger);
      if (s.anger < 0.35) {
        hop();
        s.happyUntil = now + 900;
        return;
      }
      s.happyUntil = 0;
      s.shake = Math.min(1, 0.45 + 0.5 * s.anger);
      s.vsq -= 6 * s.anger;
      if (s.anger >= 1.2) {
        hop(1.35);
        s.shake = 1;
        s.sulkUntil = now + 6000;
        s.tantrumAt = now;
        s.anger = 0.95;
      }
    };
    const onEnter = () => {
      s.hover = true;
      s.vsq += 2.2;
    };
    const onLeave = () => {
      s.hover = false;
    };
    const onWake = () => wakeRef.current?.();
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerdown', onPoke);
    root.addEventListener('pointerdown', onWake);
    const unsubscribePointer = subscribePointer();

    let raf = 0;
    let last = performance.now();
    let calm = false;

    // Damped spring step; snaps to target under reduced motion
    const spring = (x, v, target, k, damping, dt) => {
      if (calm) return [target, 0];
      const nv = v + ((target - x) * k - v * damping) * dt;
      return [x + nv * dt, nv];
    };

    wakeRef.current = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    function frame(now) {
      calm = isCalm();
      // Under reduced motion, draw one still frame and stop
      raf = calm ? 0 : requestAnimationFrame(frame);
      const t = tuneRef.current;
      const dt = Math.min(0.04, Math.min(0.033, (now - last) / 1000) * t.speed);
      last = now;
      const rect = root.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;

      s.clock += dt;
      const clock = s.clock;
      const st = stateRef.current;
      const thinking = st === 'think';
      const reading = st === 'read';
      const working = st === 'work';
      const done = st === 'done';
      const waving = st === 'wave';
      const line = Math.floor(clock / 2.5);
      const word = Math.min(4, Math.floor(((clock % 2.5) / 2.5) * 5));
      const idleFor = now - pointer.last;

      // Falls asleep when idle and nobody moves the pointer for a while
      const sleepy = +(st === 'idle' && !calm && t.sleepAfter > 0 && idleFor > 1000 * t.sleepAfter);
      if (!sleepy && s.sleep > 0.5) s.vsq += 4;
      s.sleep += (sleepy - s.sleep) * Math.min(1, dt * (sleepy ? 0.9 : 8));

      if (st === 'angry') {
        s.anger = Math.max(s.anger, 0.9);
        if (!calm && now - s.tantrumAt > 9500 && now > s.sulkUntil) {
          s.tantrumAt = now;
          s.sulkUntil = now + 6000;
          s.shake = 1;
          s.vsq -= 6;
          hop(1.2);
        }
      }
      if (st !== 'angry' && now - s.lastPoke > 1300) {
        s.anger = Math.max(0, s.anger - dt * (now < s.sulkUntil ? 0.08 : 0.22));
      }
      s.shown = calm ? s.anger : s.shown + (s.anger - s.shown) * Math.min(1, 9 * dt);
      const frown = smoothstep(0.3, 0.75, s.shown);
      const redness = smoothstep(0.5, 1.05, s.shown);
      const sulking = now < s.sulkUntil;
      if (sulking) {
        s.anger = Math.max(s.anger, 0.85);
        if (!calm && now - s.huffAt > 1600 && now - s.tantrumAt > 900) {
          s.huffAt = now;
          s.vsq -= 2.5;
        }
      }
      [s.sulkK, s.vSulkK] = spring(s.sulkK, s.vSulkK, +sulking, 60, 11, dt);
      const sulkPhase = (now - s.sulkUntil + 6000) % 2200;
      const glance = sulking && !calm && sulkPhase > 1700 && sulkPhase < 2050;
      s.shake = Math.max(0, s.shake - 2.2 * dt);

      // Blend the palette from blue to red with anger
      if (Math.abs(redness - s.tint) > 0.01) {
        s.tint = redness;
        el.tileStops.forEach((n, i) => n.setAttribute('stop-color', mixColor(CALM_COLORS.tile[i], ANGRY_COLORS.tile[i], redness)));
        el.foldStops.forEach((n, i) => n.setAttribute('stop-color', mixColor(CALM_COLORS.fold[i], ANGRY_COLORS.fold[i], redness)));
        const eye = mixColor(CALM_COLORS.eye, ANGRY_COLORS.eye, redness);
        el.eyeFills.forEach((n) => n.setAttribute(n.tagName === 'path' ? 'stroke' : 'fill', eye));
      }

      // Specular light follows the pointer
      let lightX = REST_LIGHT.x;
      let lightY = REST_LIGHT.y;
      if (!calm && pointer.active && idleFor < 4000 && s.sleep < 0.3) {
        const dx = pointer.x - (rect.left + rect.width / 2);
        const dy = pointer.y - (rect.top + rect.height / 2);
        lightX = dx / (Math.abs(dx) + 0.5 * rect.width);
        lightY = dy / (Math.abs(dy) + 0.5 * rect.height);
      }
      [s.gx, s.vgx] = spring(s.gx, s.vgx, lightX, 70, 13, dt);
      [s.gy, s.vgy] = spring(s.gy, s.vgy, lightY, 70, 13, dt);
      const cx = (399.5 + 340 * s.gx).toFixed(1);
      const cy = (392.5 + 340 * s.gy).toFixed(1);
      for (const n of el.lights) {
        n.setAttribute('cx', cx);
        n.setAttribute('cy', cy);
        n.setAttribute('fx', cx);
        n.setAttribute('fy', cy);
      }

      // Where the eyes look
      let lookX;
      let lookY;
      if (thinking) {
        lookX = (Math.floor(clock / 3.2) % 2 ? 1 : -1) * 0.55;
        lookY = -0.9;
      } else if (reading) {
        lookX = word === 4 ? 0.15 : 0.2 + 0.22 * word;
        lookY = word === 4 ? 0.05 : -0.08;
      } else if (working) {
        lookX = 0.45 + 0.12 * Math.sin(1.3 * clock);
        lookY = 0.75;
      } else if (calm) {
        lookX = 0;
        lookY = 0;
      } else if (pointer.active && idleFor < 4000) {
        const dx = pointer.x - (rect.left + rect.width / 2);
        const dy = pointer.y - (rect.top + 0.45 * rect.height);
        lookX = dx / (Math.abs(dx) + 180);
        lookY = dy / (Math.abs(dy) + 180);
      } else {
        const tick = Math.floor((clock + s.seed) / 1.7);
        lookX = 0.6 * Math.sin(12.9898 * tick + s.seed);
        lookY = 0.35 * Math.sin(78.233 * tick);
      }
      if (s.sleep > 0.3) {
        lookX *= 0.2;
        lookY = 0.4;
      }
      // While sulking, it turns away from the pointer, with a quick glance back
      const away = pointer.x > rect.left + rect.width / 2 ? -1 : 1;
      if (sulking) {
        lookX = glance ? -(0.35 * away) : 0.95 * away;
        lookY = glance ? 0.05 : -0.6;
      }
      [s.lx, s.vlx] = spring(s.lx, s.vlx, lookX * t.look, 140, 16, dt);
      [s.ly, s.vly] = spring(s.ly, s.vly, lookY * t.look, 140, 16, dt);

      // Squash target: breathing, hover, trembling with anger, typing
      let squash = 0.05 * !!s.hover + 0.012 * Math.sin(2.2 * clock + s.seed) * (1 - s.sleep);
      if (frown > 0.2 && !calm) squash -= 0.05 * Math.max(0, Math.sin(clock * (6 + 6 * frown))) * frown;
      if (working && !calm) squash -= 0.018 * Math.max(0, Math.sin(9 * clock));
      if (s.anticip) {
        squash = -0.2;
        if (now - s.anticip > 110) {
          s.anticip = 0;
          s.air = true;
          s.vy = -1100 * s.power;
          s.vsq += 4.5;
        }
      }
      if (s.air) {
        s.vy += 3600 * dt;
        s.y += s.vy * dt;
        squash = s.vy < 0 ? 0.14 : 0.06;
        if (s.y >= 0) {
          s.y = 0;
          s.air = false;
          s.vsq -= 7 * Math.min(1.4, s.power);
        }
      }
      // Happy hops when done
      if (done && !s.air && !s.anticip && now - s.lastHop > 1400) {
        s.lastHop = now;
        hop(0.7);
        s.happyUntil = now + 1300;
      }
      [s.sq, s.vsq] = spring(s.sq, s.vsq, calm ? 0 : squash, 420, 11, dt);
      let tiltTarget = 0;
      if (thinking && !calm) tiltTarget = 9 * s.lx;
      else if (waving && !calm) tiltTarget = -6 + 4 * Math.sin(8 * clock);
      [s.tiltA, s.vTiltA] = spring(s.tiltA, s.vTiltA, tiltTarget, 90, 9, dt);

      const scaleY = 1 + s.sq;
      const scaleX = 1 - 0.55 * s.sq;
      const shakeX = calm ? 0 : (26 * s.shake + (redness > 0.6 ? (redness - 0.6) * 14 : 0)) * Math.sin(70 * clock);
      el.body.setAttribute(
        'transform',
        `translate(${shakeX.toFixed(1)} ${s.y.toFixed(1)}) rotate(${s.tiltA.toFixed(2)} 399.5 600) translate(399.5 753) scale(${scaleX.toFixed(4)} ${scaleY.toFixed(4)}) translate(-399.5 -753)`
      );
      if (el.shadow) {
        const lift = Math.min(1, -s.y / 260);
        el.shadow.style.transform = `translateX(-50%) scale(${(1 - 0.45 * lift) * scaleX}, ${1 - 0.3 * lift})`;
        el.shadow.style.opacity = String(1 - 0.5 * lift);
      }

      // 3D tilt and parallax between tile, face and folds
      const motion = +!calm;
      const turn = s.sulkK * away * 26 * motion;
      el.tilt.style.transform = `perspective(700px) rotateY(${(16 * s.lx * motion + turn).toFixed(2)}deg) rotateX(${(-(13 * s.ly) * motion).toFixed(2)}deg) rotate(${(-s.sulkK * away * 5 * motion).toFixed(2)}deg)`;
      const depth = t.depth;
      el.tile.setAttribute('transform', `translate(${(-(12 * s.lx) * depth).toFixed(2)} ${(-(10 * s.ly) * depth).toFixed(2)})`);
      el.face.setAttribute('transform', `translate(${(24 * s.lx * depth).toFixed(2)} ${(18 * s.ly * depth).toFixed(2)})`);
      const flap = 60 * s.sq + 2 * Math.sin(2.2 * clock + s.seed);
      const tap1 = calm ? 0 : s.fWork * Math.max(0, Math.sin(13 * clock)) * 16;
      const tap2 = calm ? 0 : s.fWork * Math.max(0, Math.sin(13 * clock + Math.PI)) * 16;
      el.fold1.setAttribute('transform', `translate(${(-(5 * s.lx) * depth).toFixed(2)} ${(0.4 * flap - 4 * s.ly * depth + tap1).toFixed(2)})`);
      el.fold2.setAttribute('transform', `translate(${(-(0.4 * flap) - 4 * s.lx * depth - tap2).toFixed(2)} ${(-(5 * s.ly) * depth).toFixed(2)})`);

      // Fade the props in and out
      const fade = (v, on) => (calm ? +!!on : v + (!!on - v) * Math.min(1, dt * (on ? 6 : 9)));
      s.fThink = fade(s.fThink, thinking);
      s.fRead = fade(s.fRead, reading);
      s.fWork = fade(s.fWork, working);
      s.fWave = fade(s.fWave, waving);

      if (el.hand) {
        const k = calm ? +waving : popIn(s.fWave * 1.2);
        const angle = calm ? 40 : 40 + 18 * Math.sin(16 * clock);
        el.hand.setAttribute('transform', `translate(${HAND.x} ${HAND.y}) rotate(${angle.toFixed(2)}) scale(${k.toFixed(3)})`);
      }

      if (el.pThink) {
        el.pThink.setAttribute('opacity', s.fThink.toFixed(3));
        const p = (clock % 2.8) / 2.8;
        el.bubbles.forEach((n, i) => {
          const k = calm ? 1 : popIn((p - 0.14 * i) / 0.16) * (p > 0.86 ? 1 - (p - 0.86) / 0.14 : 1);
          const bob = calm ? 0 : 6 * Math.sin(2 * clock + i);
          n.setAttribute('transform', `translate(${n.dataset.x} ${(+n.dataset.y + bob).toFixed(1)}) scale(${(k * s.fThink).toFixed(3)})`);
        });
      }
      if (el.pRead) {
        el.pRead.setAttribute('opacity', s.fRead.toFixed(3));
        el.pRead.setAttribute('transform', `translate(0 ${((1 - s.fRead) * 30).toFixed(1)})`);
        const scroll = calm ? 0 : (line % 4) * 48 + 48 * smoothstep(0.8, 1, (clock % 2.5) / 2.5);
        el.lines.setAttribute('transform', `translate(0 ${(-scroll).toFixed(1)})`);
        el.marks.forEach((n, i) => {
          const w = +n.dataset.w;
          let k;
          if (calm) k = 0.6 * (i === 1);
          else if (i === (line % 4) + 1) k = Math.min(1, (word + 1) / 4);
          else k = +(i <= line % 4);
          n.setAttribute('width', (w * k).toFixed(1));
        });
      }
      if (el.puffs.length) {
        const tantrum = calm ? 0 : Math.max(0, 1 - (now - s.tantrumAt) / 1600);
        const sulkFade = calm || now > s.sulkUntil ? 0 : 0.7 * Math.min(1, (s.sulkUntil - now) / 2000);
        const amount = Math.max(smoothstep(1.05, 1.2, s.shown), tantrum, sulkFade);
        const rate = 0.9 + 0.9 * frown + 1.5 * tantrum;
        el.puffs.forEach((n, i) => {
          const side = +n.dataset.side;
          const p = calm ? 0.45 : (clock * rate + (i % 3) / 3 + 0.17 * (side > 0)) % 1;
          const k = (1 + 0.8 * tantrum) * n.dataset.k;
          const x = +n.dataset.x + side * p * 70 * k;
          const y = n.dataset.y - 130 * p * k;
          n.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(((26 + 40 * p) * k) / 40).toFixed(3)})`);
          n.setAttribute('opacity', (Math.sin(Math.PI * p) * amount).toFixed(3));
        });
      }
      if (el.pWork) {
        el.pWork.setAttribute('opacity', s.fWork.toFixed(3));
        const p = calm ? 0.6 : (clock % 4.4) / 4.4;
        const placed = Math.floor(8 * p);
        if (!calm && working && placed !== s.lastBlock && placed < 6) {
          s.lastBlock = placed;
          s.vsq -= 1.2;
        }
        if (placed >= 6) s.lastBlock = -1;
        const out = p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1;
        el.blocks.forEach((n, i) => {
          const k = calm ? +(i < 4) : popIn((8 * p - i) / 0.7) * out;
          n.setAttribute('transform', `translate(${n.dataset.x} ${n.dataset.y}) scale(${k.toFixed(3)})`);
        });
      }

      // Blinks, sometimes double
      if (!calm && t.blink > 0 && now > s.nextBlink && s.blinkT < 0) {
        s.blinkT = now;
        s.double = Math.random() < 0.25;
      }
      let lid = 1;
      if (s.blinkT >= 0) {
        const since = now - s.blinkT;
        const b = since % 230;
        if (b < 150) lid = Math.abs(Math.cos((Math.PI * b) / 150)) ** 0.6;
        if (since > (s.double ? 380 : 150)) {
          s.blinkT = -1;
          s.nextBlink = now + (1800 + 3600 * Math.random()) / Math.max(0.1, t.blink);
        }
      }

      // Squint while thinking, narrowed while reading or working
      const tp = (clock % 3.2) / 3.2;
      const squintPulse = tp > 0.35 && tp < 0.65 ? Math.max(0, Math.sin(((tp - 0.35) / 0.3) * Math.PI)) : 0;
      [s.sqz, s.vSqz] = spring(s.sqz, s.vSqz, +!!thinking, 160, 16, dt);
      const focus = 1 - 0.18 * s.fRead - 0.22 * s.fWork;
      const squint = (1 + (0.44 - 0.2 * squintPulse - 1) * s.sqz) * focus;
      const happy = (now < s.happyUntil || done || waving) && frown < 0.2;
      const faceX = 26 * s.lx;
      const faceY = 20 * s.ly;
      el.brows.forEach((n, i) => {
        n.setAttribute('opacity', frown.toFixed(3));
        n.setAttribute(
          'transform',
          `translate(${(EYE_X[i] + 0.9 * faceX).toFixed(2)} ${(EYE_Y - 62 + 0.9 * faceY - (1 - frown) * 14).toFixed(2)}) rotate(${((i === 0 ? 1 : -1) * (8 + 18 * frown)).toFixed(2)})`
        );
      });
      el.eyes.forEach((eye, i) => {
        let open = happy
          ? 1
          : lid * (s.hover ? 1.14 : 1) * (1 - 0.85 * s.sleep) * squint * (1 - 0.42 * frown) * (1 - s.sulkK * (glance ? 0.1 : 0.38));
        if (s.sqz > 0.01 && !happy) open *= 1 - 0.35 * s.sqz * Math.max(0, (i === 0 ? -1 : 1) * s.lx);
        const rot = happy ? 0 : (8 * s.sqz + 22 * frown) * (i === 0 ? 1 : -1);
        const widen = (1 / Math.max(0.6, open) ** 0.15) * (1 + (happy ? 0 : s.sqz) * 0.3);
        eye.g.setAttribute(
          'transform',
          `translate(${(eye.x + faceX).toFixed(2)} ${(EYE_Y + faceY).toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${widen.toFixed(3)} ${Math.max(0.06, open).toFixed(3)})`
        );
        eye.open.setAttribute('opacity', happy ? '0' : '1');
        eye.happy.setAttribute('opacity', happy ? '1' : '0');
      });
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onPoke);
      root.removeEventListener('pointerdown', onWake);
      unsubscribePointer();
    };
  }, []);

  const showProps = props ?? size >= 64;
  const tileFill = `url(#${id}-tile)`;
  const foldFill = `url(#${id}-fold)`;

  return (
    <span
      ref={rootRef}
      className={`${styles.agentBot} ${className}`}
      data-state={state}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : `${label}${STATE_LABELS[state] || ''}`}
      aria-hidden={decorative ? 'true' : undefined}
      style={{ position: 'relative', display: 'inline-block', flex: 'none', width: size }}
    >
      <span data-tilt className={styles.tilt} style={{ display: 'block' }}>
        <svg
          viewBox="39 32 721 721"
          aria-hidden="true"
          focusable="false"
          style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}
        >
          <defs>
            <radialGradient data-light id={`${id}-tile`} gradientUnits="userSpaceOnUse" cx={280.5} cy={239.5} r="640">
              <stop data-tile-stop offset="0" stopColor="#6461FF" />
              <stop data-tile-stop offset="0.5" stopColor="#4945FF" />
              <stop data-tile-stop offset="1" stopColor="#3B37E6" />
            </radialGradient>
            <radialGradient data-light id={`${id}-fold`} gradientUnits="userSpaceOnUse" cx={280.5} cy={239.5} r="640">
              <stop data-fold-stop offset="0" stopColor="#A5A3FF" />
              <stop data-fold-stop offset="0.45" stopColor="#9593FF" />
              <stop data-fold-stop offset="1" stopColor="#8885F7" />
            </radialGradient>
          </defs>
          <g data-body>
            {props !== false && (
              <g data-hand transform={`translate(${HAND.x} ${HAND.y}) scale(0)`}>
                <rect x={-62} y={-300} width={124} height={300} rx={62} fill={foldFill} />
              </g>
            )}
            <path data-tile d={TILE_PATH} fill={tileFill} />
            <g data-face>
              <path d="M536.4 250.7H293.7v123.8h123.8v123.7h123.8V255.5c0-2.6-2.2-4.8-4.9-4.8Z" fill="#fff" />
              <path fill="#fff" d="M412.7 374.5h4.8v4.8h-4.8z" />
              <path d="M293.8 374.5h119c2.6 0 4.8 2.1 4.8 4.8v119h-119a4.8 4.8 0 0 1-4.8-4.9v-119Z" fill={foldFill} />
              <path data-fold1 d="M417.5 498.2h123.8L421.6 618a2.4 2.4 0 0 1-4-1.7v-118Z" fill={foldFill} />
              <path data-fold2 d="M293.8 374.5h-118a2.4 2.4 0 0 1-1.7-4.1l119.7-119.7v123.8Z" fill={foldFill} />
              {EYE_X.map((x) => (
                <g key={x} data-eye transform={`translate(${x} ${EYE_Y})`}>
                  <rect data-open data-eye-fill x={-15} y={-34} width={30} height={68} rx={15} fill="#4945FF" />
                  <path
                    data-happy
                    data-eye-fill
                    d="M-22.5 8.16 Q0 -28.56 22.5 8.16"
                    fill="none"
                    stroke="#4945FF"
                    strokeWidth={16.5}
                    strokeLinecap="round"
                    opacity="0"
                  />
                </g>
              ))}
              {EYE_X.map((x) => (
                <path
                  key={`brow${x}`}
                  data-brow
                  data-eye-fill
                  d="M-30 0H30"
                  stroke="#4945FF"
                  strokeWidth={16}
                  strokeLinecap="round"
                  opacity="0"
                  transform={`translate(${x} ${EYE_Y - 76})`}
                />
              ))}
            </g>
            {props !== false &&
              [-1, 1].flatMap((side) =>
                [0, 1, 2].map((i) => (
                  <g
                    key={`${side}${i}`}
                    data-puff
                    data-side={side}
                    data-x={side < 0 ? 120 : 680}
                    data-y={70}
                    data-k={Math.min(1.8, Math.max(1, 100 / size)).toFixed(2)}
                    opacity="0"
                  >
                    <path
                      d={PUFF_PATH}
                      fill="#fff"
                      stroke="#F0897F"
                      strokeWidth="1.6"
                      vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round"
                    />
                  </g>
                ))
              )}
          </g>
          {showProps && (
            <g data-props>
              <g data-p-think opacity="0">
                {BUBBLES.map(([x, y, r]) => (
                  <g key={x} data-bubble data-x={x} data-y={y} transform={`translate(${x} ${y}) scale(0)`}>
                    <circle r={r} fill={foldFill} />
                    <circle cx={-(0.32 * r)} cy={-(0.32 * r)} r={0.28 * r} fill="#fff" opacity="0.55" />
                  </g>
                ))}
              </g>
              <g data-p-read opacity="0">
                <defs>
                  <clipPath id={`${id}-page`}>
                    <rect x="806" y="262" width="196" height="220" rx="26" />
                  </clipPath>
                </defs>
                <rect x="806" y="262" width="196" height="220" rx="26" fill="#fff" stroke="#DCDBFF" strokeWidth="6" />
                <g clipPath={`url(#${id}-page)`}>
                  <g data-lines>
                    {LINE_WIDTHS.map((w, i) => {
                      const y = 300 + 48 * i - 48;
                      return (
                        <g key={i}>
                          <rect x="834" y={y} width={w} height="18" rx="9" fill="#E4E3FF" />
                          <rect data-mark data-w={w} x="834" y={y} width="0" height="18" rx="9" fill="#4945FF" />
                        </g>
                      );
                    })}
                  </g>
                </g>
              </g>
              <g data-p-work opacity="0">
                {BLOCKS.map(([x, y], i) => (
                  <rect
                    key={i}
                    data-block
                    data-x={x}
                    data-y={y}
                    x="-32"
                    y="-32"
                    width="64"
                    height="64"
                    rx="14"
                    transform={`translate(${x} ${y}) scale(0)`}
                    fill={i % 2 ? foldFill : tileFill}
                  />
                ))}
              </g>
            </g>
          )}
        </svg>
      </span>
      {shadow && <span data-shadow className={styles.shadow} aria-hidden="true" />}
    </span>
  );
}
