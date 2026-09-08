# FIRST LIGHT hand control, stage 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A hand seen by the webcam moves a snapping reticle over FIRST LIGHT's star map, drags the map while pinched, and zooms it with two pinched hands, without changing anything about mouse or keyboard.

**Architecture:** Four small pure modules (filter, gesture state machine, camera source, wiring) plus a HUD, loaded as one ES module that dispatches `CustomEvent`s on `window`. `firstlight.js` is a classic script inside an IIFE, so it cannot be imported from and does not import anything: it only grows an `addEventListener` block. Every module below the wiring is pure and testable with synthetic landmark frames, so five of the six tasks need no camera at all.

**Tech Stack:** Vanilla ES modules, no build step. `@mediapipe/tasks-vision@1.0.1` fetched from jsDelivr at activation. Tests are standalone Node probe scripts using `playwright-core`, matching the existing `qa-*.js` files in this world.

**Spec:** `workbench/specs/2026-09-08-firstlight-hand-control-design.md`

## Global Constraints

- **HEADLESS LAW.** Every probe launches `chromium.launch()` with no arguments or with `headless: true`. Never `headless: false`. A visible window steals the owner's focus.
- **Nothing in `firstlight.js` may import MediaPipe.** The only change to that file is an `addEventListener` block and one button handler.
- **Nothing is reachable only by camera.** Every action the hand can perform must remain performable by mouse and keyboard, unchanged.
- **Nothing downloads on page load.** The MediaPipe fetch happens on the arming click and never before.
- **`stop()` every track on disarm** so the camera indicator light actually goes out.
- **All interface copy in English.** The Design Lab rule, without exception.
- **No em dashes** anywhere, in code comments, copy or commit messages.
- **Never push to `main` or `next`.** This work lands on `repo/experimental-design-firstlight`.
- **Never commit** `docusaurus/static/llms.txt`, `llms-full.txt`, `llms-code.txt`.
- Pinned versions, exact: `@mediapipe/tasks-vision@1.0.1`; model `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`.
- Pierre's shell has `noclobber`: redirect with `>|`, never bare `>`, onto an existing file.

## Where the work happens

The build is at `/private/tmp/.../scratchpad/final/builds/firstlight` (disposable) and mirrors to `docusaurus/static/design-lab/firstlight/` on branch `repo/experimental-design-firstlight`. Serve it with the world's own `serve.js`, which prints `PORT=<n>` on stdout and picks a free port.

## File Structure

| file | responsibility |
|---|---|
| `hand/oneeuro.js` | Create. One Euro filter. Pure maths, no DOM. |
| `hand/gestures.js` | Create. Landmark frames in, semantic gesture events out. Pure, no DOM, no camera. |
| `hand/source.js` | Create. Owns the camera and MediaPipe. Lazy loads, arms, disarms, emits raw frames. The only file that knows MediaPipe exists. |
| `hand/hands.js` | Create. Wires source to filter to gestures, maps the comfort box to screen coordinates, dispatches `CustomEvent`s on `window`. The public entry point. |
| `hand/hud.js` | Create. The reticle and the instrument-style monitor. Reads events, draws, owns no state the world needs. |
| `index.html` | Modify. One `<script type="module">`, one `HAND CONTROL` button in the topbar. |
| `firstlight.js` | Modify. One `addEventListener` block near the existing pointer handlers, and the button wiring. |
| `firstlight.css` | Modify. Reticle and monitor styles. |
| `qa-hand-*.js` | Create, one per task. Probes in this world's existing idiom. |

Files that change together live together: everything hand-related is under `hand/`, so the feature can be deleted by removing one directory and three small edits.

---

### Task 1: The One Euro filter

**Files:**
- Create: `hand/oneeuro.js`
- Test: `qa-hand-filter.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `export function makeOneEuro(opts)` returning `{ filter(value, timestampSeconds) -> number, reset() }`. `opts` is `{ minCutoff = 1.0, beta = 0.007, dCutoff = 1.0 }`.

- [ ] **Step 1: Write the failing test**

Create `qa-hand-filter.js`:

```js
/* QA: the One Euro filter must do the two things a moving average cannot do at
   once. It must be CALM on a still hand, and it must NOT LAG a fast one. A
   fixed smoothing constant forces a choice between them; this asserts we did
   not have to choose. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise((res, rej) => {
    srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); });
    setTimeout(() => rej(new Error('server timeout')), 5000);
  });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });

  const r = await page.evaluate(async () => {
    const { makeOneEuro } = await import('./hand/oneeuro.js');
    const out = {};

    // a hand held still at 0.5, with 3 mm of tremor at 60 Hz
    const still = makeOneEuro({});
    let noisy = 0, smooth = 0, prev = null;
    for (let i = 0; i < 180; i++) {
      const t = i / 60;
      const raw = 0.5 + (Math.sin(i * 2.3) * 0.003);
      const f = still.filter(raw, t);
      if (i > 60) { noisy += Math.abs(raw - 0.5); smooth += Math.abs(f - 0.5); }
      prev = f;
    }
    out.tremorKept = smooth / noisy;

    // a hand crossing the frame in 250 ms: how far behind is the filter at the end?
    const fast = makeOneEuro({});
    let last = 0;
    for (let i = 0; i <= 15; i++) {
      const t = i / 60;
      last = fast.filter(i / 15, t);
    }
    out.lagAtEnd = Math.abs(1 - last);
    return out;
  });

  const fails = [];
  if (!(r.tremorKept < 0.35)) fails.push(`a still hand kept ${(r.tremorKept * 100).toFixed(0)}% of its tremor, wanted under 35%`);
  if (!(r.lagAtEnd < 0.08)) fails.push(`a fast hand ended ${(r.lagAtEnd * 100).toFixed(1)}% behind, wanted under 8%`);
  console.log(`  tremor kept ${(r.tremorKept * 100).toFixed(0)}%   lag at end ${(r.lagAtEnd * 100).toFixed(1)}%`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node qa-hand-filter.js`
Expected: FAIL, with a page error containing `Failed to fetch dynamically imported module` because `hand/oneeuro.js` does not exist.

- [ ] **Step 3: Write the filter**

Create `hand/oneeuro.js`:

```js
/* THE ONE EURO FILTER (Casiez, Roussel, Vogel, CHI 2012).
   A moving average forces one choice for two opposite needs: heavy smoothing
   makes a still hand calm and a moving hand late, light smoothing does the
   reverse. This one varies its own cutoff with the speed of the signal, so a
   still hand is smoothed hard and a fast hand is barely touched at all.
   Pure maths. It knows nothing about hands, DOM or MediaPipe. */

function alpha(cutoff, dt) {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
}

export function makeOneEuro(opts) {
  const o = opts || {};
  const minCutoff = o.minCutoff === undefined ? 1.0 : o.minCutoff;
  // beta is the speed coefficient: how much the cutoff opens up as the hand
  // moves. Too small and fast motion lags; too large and tremor comes back.
  const beta = o.beta === undefined ? 0.007 : o.beta;
  const dCutoff = o.dCutoff === undefined ? 1.0 : o.dCutoff;

  let xPrev = null, dxPrev = 0, tPrev = null;

  return {
    reset() { xPrev = null; dxPrev = 0; tPrev = null; },
    filter(x, t) {
      if (xPrev === null || tPrev === null) { xPrev = x; tPrev = t; return x; }
      const dt = Math.max(1e-4, t - tPrev);
      // the derivative is filtered too, or its own noise would open the cutoff
      const dx = (x - xPrev) / dt;
      const aD = alpha(dCutoff, dt);
      const dxHat = aD * dx + (1 - aD) * dxPrev;
      const cutoff = minCutoff + beta * Math.abs(dxHat);
      const a = alpha(cutoff, dt);
      const xHat = a * x + (1 - a) * xPrev;
      xPrev = xHat; dxPrev = dxHat; tPrev = t;
      return xHat;
    },
  };
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `node qa-hand-filter.js`
Expected: PASS. If `tremorKept` is above 35%, lower `minCutoff` toward 0.6. If `lagAtEnd` is above 8%, raise `beta` toward 0.02. Change one at a time and re-run; do not change both.

- [ ] **Step 5: Commit**

```bash
git add hand/oneeuro.js qa-hand-filter.js
git commit -m "FIRST LIGHT: the One Euro filter for hand tremor

A moving average forces one choice for two opposite needs: heavy smoothing
makes a still hand calm and a moving hand late. This varies its cutoff with
the speed of the signal, so the probe can assert both at once, which is the
whole reason for choosing it."
```

---

### Task 2: The gesture state machine

**Files:**
- Create: `hand/gestures.js`
- Test: `qa-hand-gestures.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `export function makeGestureReader()` returning `{ read(frame, tSeconds) -> Array<Event>, state() -> {pinched, fisted, present} }`.
  - A `frame` is `{ hands: Array<{ landmarks: Array<{x, y, z}>, handedness: 'Left'|'Right' }> }`, `hands` possibly empty. Landmarks are MediaPipe's 21, normalised 0..1 in image space.
  - An `Event` is one of `{type:'present'}`, `{type:'absent'}`, `{type:'grab', hand}`, `{type:'release', hand}`, `{type:'lock', hand}`, `{type:'spread', ratio}`.
- Produces: `export const LM = { WRIST: 0, THUMB_TIP: 4, INDEX_TIP: 8, INDEX_MCP: 5, MIDDLE_TIP: 12, MIDDLE_MCP: 9, RING_TIP: 16, PINKY_TIP: 20 }`.

- [ ] **Step 1: Write the failing test**

Create `qa-hand-gestures.js`:

```js
/* QA: the gesture state machine, with no camera anywhere near it. These are
   the three things that actually break in gesture input, so these are what is
   asserted:
     1. HYSTERESIS. A pinch held exactly at the threshold must not flicker.
        Without a band the map convulses, and that is the single most common
        way a hand interface feels broken.
     2. SCALE INVARIANCE. The same pinch made twice as far from the camera is
        still a pinch. Thresholds measured in image distance silently mean
        "pinch harder the further away you are".
     3. THE DEAD MAN'S SWITCH. Tracking lost while grabbed must release, or
        the world is stranded holding something after you left the room. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise((res, rej) => {
    srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); });
    setTimeout(() => rej(new Error('server timeout')), 5000);
  });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });

  const r = await page.evaluate(async () => {
    const { makeGestureReader } = await import('./hand/gestures.js');

    /* Build a synthetic hand. `size` is wrist-to-middle-knuckle in image units,
       which is how far away the person is sitting. `pinch` is the thumb-to-index
       gap as a RATIO of that size, so the same value means the same gesture at
       any distance. `curl` at 1 is an open hand, at 0 a closed fist. */
    const hand = (size, pinch, curl, cx, cy) => {
      const L = new Array(21).fill(null).map(() => ({ x: cx, y: cy, z: 0 }));
      L[0] = { x: cx, y: cy + size, z: 0 };                       // wrist
      L[9] = { x: cx, y: cy, z: 0 };                              // middle knuckle
      L[5] = { x: cx - size * 0.4, y: cy, z: 0 };
      L[8] = { x: cx - size * 0.5 * curl, y: cy - size * curl, z: 0 };   // index tip
      L[4] = { x: L[8].x + pinch * size, y: L[8].y, z: 0 };              // thumb tip
      L[12] = { x: cx, y: cy - size * 1.05 * curl, z: 0 };
      L[16] = { x: cx + size * 0.35 * curl, y: cy - size * 0.95 * curl, z: 0 };
      L[20] = { x: cx + size * 0.6 * curl, y: cy - size * 0.8 * curl, z: 0 };
      return { landmarks: L, handedness: 'Right' };
    };
    const f = (...hs) => ({ hands: hs });
    const types = (evs) => evs.map(e => e.type);
    const out = {};

    // 1. hysteresis: sit exactly between the two thresholds and jitter there
    {
      const g = makeGestureReader();
      let t = 0, flips = 0, last = null;
      g.read(f(hand(0.20, 0.9, 1, 0.5, 0.5)), t += 0.033);           // open first
      for (let i = 0; i < 60; i++) {
        const pinch = 0.42 + (i % 2 ? 0.02 : -0.02);                 // straddling
        g.read(f(hand(0.20, pinch, 1, 0.5, 0.5)), t += 0.033);
        const now = g.state().pinched;
        if (last !== null && now !== last) flips++;
        last = now;
      }
      out.flips = flips;
    }

    // 2. scale invariance: the same gesture, half as close
    {
      const near = makeGestureReader(), far = makeGestureReader();
      let t = 0;
      near.read(f(hand(0.30, 0.9, 1, 0.5, 0.5)), t += 0.033);
      far.read(f(hand(0.10, 0.9, 1, 0.5, 0.5)), t += 0.033);
      near.read(f(hand(0.30, 0.20, 1, 0.5, 0.5)), t += 0.033);
      far.read(f(hand(0.10, 0.20, 1, 0.5, 0.5)), t += 0.033);
      out.nearPinched = near.state().pinched;
      out.farPinched = far.state().pinched;
    }

    // 3. the dead man's switch
    {
      const g = makeGestureReader();
      let t = 0;
      g.read(f(hand(0.20, 0.9, 1, 0.5, 0.5)), t += 0.033);
      g.read(f(hand(0.20, 0.20, 1, 0.5, 0.5)), t += 0.033);
      out.grabbed = g.state().pinched;
      let released = false;
      for (let i = 0; i < 10; i++) {                                  // 330 ms of nothing
        const evs = g.read({ hands: [] }, t += 0.033);
        if (types(evs).indexOf('release') >= 0) released = true;
      }
      out.releasedOnLoss = released;
      out.stillGrabbed = g.state().pinched;
    }

    // 4. spread: two pinched hands moving apart report a rising ratio
    {
      const g = makeGestureReader();
      let t = 0, ratios = [];
      g.read(f(hand(0.20, 0.9, 1, 0.35, 0.5), hand(0.20, 0.9, 1, 0.65, 0.5)), t += 0.033);
      for (let i = 0; i < 10; i++) {
        const d = 0.15 + i * 0.02;
        const evs = g.read(f(hand(0.20, 0.20, 1, 0.5 - d, 0.5), hand(0.20, 0.20, 1, 0.5 + d, 0.5)), t += 0.033);
        evs.forEach(e => { if (e.type === 'spread') ratios.push(e.ratio); });
      }
      out.spreadCount = ratios.length;
      out.spreadRises = ratios.length > 3 && ratios[ratios.length - 1] > 1;
    }
    return out;
  });

  const fails = [];
  if (r.flips > 2) fails.push(`a pinch held at the threshold flipped ${r.flips} times, wanted at most 2`);
  if (!r.nearPinched || !r.farPinched) fails.push(`the same pinch read ${r.nearPinched} near and ${r.farPinched} far, wanted both true`);
  if (!r.grabbed) fails.push('a clear pinch did not register at all');
  if (!r.releasedOnLoss) fails.push('tracking was lost while grabbed and no release was emitted');
  if (r.stillGrabbed) fails.push('still grabbed after tracking was lost');
  if (!r.spreadRises) fails.push(`two hands moving apart gave ${r.spreadCount} spread events and no rising ratio`);
  console.log(`  flips ${r.flips}   near/far ${r.nearPinched}/${r.farPinched}   released-on-loss ${r.releasedOnLoss}   spreads ${r.spreadCount}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node qa-hand-gestures.js`
Expected: FAIL, page error `Failed to fetch dynamically imported module`.

- [ ] **Step 3: Write the state machine**

Create `hand/gestures.js`:

```js
/* THE GESTURE STATE MACHINE. Landmark frames in, semantic events out. It owns
   no camera, no DOM and no MediaPipe, which is why it can be tested exhaustively
   with hand-built frames and why the whole of tier 1 can be proved without a
   webcam ever being switched on.

   Two rules run through all of it.

   EVERY THRESHOLD IS A RATIO TO HAND SIZE, never an image distance. Image
   distance shrinks as you sit further from the camera, so a fixed threshold
   would quietly mean "pinch harder the further away you are". Hand size is the
   wrist to middle-knuckle span, which is rigid and always visible.

   EVERY THRESHOLD HAS TWO VALUES. A single threshold held at its own value
   flickers, and a flickering grab makes the map convulse. Arming and disarming
   at different values costs nothing and removes the entire failure mode. */

export const LM = {
  WRIST: 0, THUMB_TIP: 4, INDEX_MCP: 5, INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_TIP: 12, RING_TIP: 16, PINKY_TIP: 20,
};

/* Starting values. They are tuned once against the reference clip; the probe
   asserts the BEHAVIOUR they produce, not the numbers themselves, so tuning
   them never invalidates the tests. */
const PINCH_ON = 0.38, PINCH_OFF = 0.52;      // thumb to index, over hand size
const FIST_ON = 1.05, FIST_OFF = 1.30;        // mean fingertip to wrist, over hand size
const LOST_MS = 150;                          // the dead man's switch

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function handSize(L) {
  // rigid, always visible, and unaffected by which fingers are curled
  return Math.max(1e-6, dist(L[LM.WRIST], L[LM.MIDDLE_MCP]));
}
function pinchRatio(L) {
  return dist(L[LM.THUMB_TIP], L[LM.INDEX_TIP]) / handSize(L);
}
function curlRatio(L) {
  const w = L[LM.WRIST], s = handSize(L);
  const tips = [LM.INDEX_TIP, LM.MIDDLE_TIP, LM.RING_TIP, LM.PINKY_TIP];
  let sum = 0;
  for (const t of tips) sum += dist(L[t], w);
  return (sum / tips.length) / s;
}
export function pinchPoint(L) {
  // where the hand is "holding": between the thumb and index tips, which is
  // what the eye tracks, not the wrist and not the palm centre
  return { x: (L[LM.THUMB_TIP].x + L[LM.INDEX_TIP].x) / 2,
           y: (L[LM.THUMB_TIP].y + L[LM.INDEX_TIP].y) / 2 };
}

export function makeGestureReader() {
  let present = false, pinched = false, fisted = false;
  let lastSeen = null, spreadBase = null;

  return {
    state: () => ({ present, pinched, fisted }),
    read(frame, t) {
      const evs = [];
      const hands = (frame && frame.hands) || [];

      if (hands.length === 0) {
        if (lastSeen !== null && (t - lastSeen) * 1000 >= LOST_MS) {
          // the dead man's switch: never strand the world holding something
          if (pinched) { pinched = false; evs.push({ type: 'release', hand: null }); }
          if (fisted) fisted = false;
          if (present) { present = false; evs.push({ type: 'absent' }); }
          spreadBase = null;
        }
        return evs;
      }
      lastSeen = t;
      if (!present) { present = true; evs.push({ type: 'present' }); }

      const primary = hands[0];
      const pr = pinchRatio(primary.landmarks);
      const cr = curlRatio(primary.landmarks);

      if (!pinched && pr < PINCH_ON) { pinched = true; evs.push({ type: 'grab', hand: primary.handedness }); }
      else if (pinched && pr > PINCH_OFF) { pinched = false; evs.push({ type: 'release', hand: primary.handedness }); }

      // a fist is only read when NOT pinching: a pinch curls the index too, and
      // reading both at once would fire a lock every time you grabbed something
      if (!pinched) {
        if (!fisted && cr < FIST_ON) { fisted = true; evs.push({ type: 'lock', hand: primary.handedness }); }
        else if (fisted && cr > FIST_OFF) fisted = false;
      }

      // two pinched hands: the distance between their pinch points is the scale
      if (hands.length >= 2) {
        const a = hands[0].landmarks, b = hands[1].landmarks;
        const bothPinched = pinchRatio(a) < PINCH_OFF && pinchRatio(b) < PINCH_OFF;
        if (bothPinched) {
          const d = dist(pinchPoint(a), pinchPoint(b));
          if (spreadBase === null) spreadBase = d;
          else if (spreadBase > 1e-6) evs.push({ type: 'spread', ratio: d / spreadBase });
        } else spreadBase = null;
      } else spreadBase = null;

      return evs;
    },
  };
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `node qa-hand-gestures.js`
Expected: PASS, `flips 0 or 1`, `near/far true/true`, `released-on-loss true`, `spreads 9`.

If `flips` exceeds 2, the band between `PINCH_ON` and `PINCH_OFF` is too narrow for the test's jitter: widen `PINCH_OFF` to 0.56 and re-run.

- [ ] **Step 5: Commit**

```bash
git add hand/gestures.js qa-hand-gestures.js
git commit -m "FIRST LIGHT: the gesture state machine, with no camera in it

Landmark frames in, semantic events out, so the whole of tier 1 can be proved
without a webcam. Two rules run through it: every threshold is a ratio to hand
size rather than an image distance, because image distance shrinks with how
far away you sit and would quietly mean pinch harder the further away you are;
and every threshold has two values, because one held at its own value flickers
and a flickering grab makes the map convulse."
```

---

### Task 3: The camera source

**Files:**
- Create: `hand/source.js`
- Test: `qa-hand-source.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `export function makeCameraSource()` returning `{ arm() -> Promise<void>, disarm() -> void, onFrame(cb), state() -> 'off'|'loading'|'on'|'denied'|'unsupported'|'unreachable' }`. `cb` receives the same `frame` shape Task 2 consumes.
- Produces: `export function makeFakeSource()` returning the same interface, driven by `push(frame)`. This is what every later probe uses instead of a camera.

- [ ] **Step 1: Write the failing test**

Create `qa-hand-source.js`:

```js
/* QA: the camera source. The assertions are about RESTRAINT and TEARDOWN,
   which are the two things that lose a user's trust:
     - nothing at all is fetched before the arming click, so a visitor who
       never arms it pays nothing and is never asked for a camera;
     - disarming stops every track, so the camera indicator light goes out.
   A denied permission must be a state, not an exception. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise((res, rej) => {
    srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); });
    setTimeout(() => rej(new Error('server timeout')), 5000);
  });
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const requested = [];
  page.on('request', r => { const u = r.url(); if (/mediapipe|\.wasm|\.task/.test(u)) requested.push(u); });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const fails = [];
  if (requested.length) fails.push(`${requested.length} MediaPipe requests before arming: ${requested[0]}`);

  const r = await page.evaluate(async () => {
    const { makeCameraSource, makeFakeSource } = await import('./hand/source.js');
    const out = { initial: makeCameraSource().state() };

    // the fake source is the interface every later probe drives
    const fake = makeFakeSource();
    let got = 0;
    fake.onFrame(() => { got++; });
    await fake.arm();
    out.fakeArmed = fake.state();
    fake.push({ hands: [] });
    fake.push({ hands: [] });
    out.fakeFrames = got;
    fake.disarm();
    out.fakeDisarmed = fake.state();

    // a refused camera is a state, never a thrown error
    const denied = makeCameraSource();
    let threw = false;
    try { await denied.arm(); } catch (e) { threw = true; }
    out.deniedThrew = threw;
    out.deniedState = denied.state();
    return out;
  });

  if (r.initial !== 'off') fails.push(`a fresh source reported "${r.initial}", wanted "off"`);
  if (r.fakeArmed !== 'on') fails.push(`the fake source armed to "${r.fakeArmed}", wanted "on"`);
  if (r.fakeFrames !== 2) fails.push(`the fake source delivered ${r.fakeFrames} frames, wanted 2`);
  if (r.fakeDisarmed !== 'off') fails.push(`the fake source disarmed to "${r.fakeDisarmed}", wanted "off"`);
  if (r.deniedThrew) fails.push('a refused camera threw instead of reporting a state');
  if (['denied', 'unsupported', 'unreachable'].indexOf(r.deniedState) < 0) fails.push(`a refused camera reported "${r.deniedState}"`);

  console.log(`  requests before arming ${requested.length}   fake ${r.fakeArmed}/${r.fakeFrames}/${r.fakeDisarmed}   denied "${r.deniedState}" threw=${r.deniedThrew}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node qa-hand-source.js`
Expected: FAIL, page error `Failed to fetch dynamically imported module`.

- [ ] **Step 3: Write the source**

Create `hand/source.js`:

```js
/* THE CAMERA SOURCE. The only file in this world that knows MediaPipe exists.
   Everything above it consumes plain frames, which is why the filter, the
   state machine and the wiring can all be proved without a webcam.

   Two things here are not implementation detail, they are the feature:

   NOTHING IS FETCHED BEFORE THE ARMING CLICK. Eleven megabytes over the wire,
   for something almost no visitor will switch on, must not be spent on their
   behalf. The import is dynamic and lives inside arm().

   DISARMING STOPS EVERY TRACK. The camera indicator light going out is the
   only trustworthy statement about a camera; a sentence on a page is not one. */

const CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export function makeCameraSource() {
  let state = 'off', stream = null, landmarker = null, video = null, raf = 0;
  const subs = [];
  const emit = (f) => { for (const cb of subs) cb(f); };

  async function loop() {
    if (state !== 'on') return;
    if (video.readyState >= 2) {
      let res = null;
      try { res = landmarker.detectForVideo(video, performance.now()); } catch (e) { res = null; }
      if (res) {
        const hands = (res.landmarks || []).map((landmarks, i) => ({
          landmarks,
          handedness: (res.handednesses && res.handednesses[i] && res.handednesses[i][0]
            && res.handednesses[i][0].categoryName) || 'Right',
        }));
        emit({ hands });
      }
    }
    raf = requestAnimationFrame(loop);
  }

  return {
    state: () => state,
    onFrame(cb) { subs.push(cb); },
    disarm() {
      if (raf) cancelAnimationFrame(raf), raf = 0;
      // every track, or the light stays on and the promise on the page is a lie
      if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
      if (video) { video.srcObject = null; video = null; }
      state = 'off';
    },
    async arm() {
      if (state === 'on' || state === 'loading') return;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { state = 'unsupported'; return; }
      state = 'loading';
      let vision;
      try {
        vision = await import(/* @vite-ignore */ `${CDN}/vision_bundle.mjs`);
      } catch (e) { state = 'unreachable'; return; }
      try {
        const files = await vision.FilesetResolver.forVisionTasks(`${CDN}/wasm`);
        landmarker = await vision.HandLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' },
          runningMode: 'VIDEO', numHands: 2,
        });
      } catch (e) { state = 'unreachable'; return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }, audio: false,
        });
      } catch (e) { state = 'denied'; return; }
      video = document.createElement('video');
      video.autoplay = true; video.playsInline = true; video.muted = true;
      video.srcObject = stream;
      await video.play().catch(() => {});
      state = 'on';
      raf = requestAnimationFrame(loop);
    },
  };
}

/* The same interface, driven by hand. Every probe above this file uses it, so
   the wiring, the HUD and the world are all provable with no camera at all. */
export function makeFakeSource() {
  let state = 'off';
  const subs = [];
  return {
    state: () => state,
    onFrame(cb) { subs.push(cb); },
    async arm() { state = 'on'; },
    disarm() { state = 'off'; },
    push(frame) { if (state === 'on') for (const cb of subs) cb(frame); },
  };
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `node qa-hand-source.js`
Expected: PASS, `requests before arming 0`.

Chromium headless with no camera and no permission grant will report `denied` or `unsupported`; both are accepted by the probe. That is the point: neither may throw.

- [ ] **Step 5: Commit**

```bash
git add hand/source.js qa-hand-source.js
git commit -m "FIRST LIGHT: the camera source, and the fake one that replaces it in tests

The only file in this world that knows MediaPipe exists, so everything above it
is provable without a webcam. Two behaviours here are the feature rather than
implementation detail: nothing at all is fetched before the arming click, and
disarming stops every track so the camera light actually goes out. A refused
permission is a state, never an exception."
```

---

### Task 4: The wiring and the comfort box

**Files:**
- Create: `hand/hands.js`
- Test: `qa-hand-wiring.js`

**Interfaces:**
- Consumes: `makeOneEuro` (Task 1), `makeGestureReader`, `pinchPoint`, `LM` (Task 2), `makeCameraSource`, `makeFakeSource` (Task 3).
- Produces: `export function startHands(opts)` returning `{ arm, disarm, state }`. `opts` is `{ source }`, defaulting to a camera source.
- Produces on `window`, as `CustomEvent`s: `hand:present`, `hand:absent`, `hand:move` (`detail {x, y}`, screen pixels), `hand:grab`, `hand:release`, `hand:lock`, `hand:spread` (`detail {ratio}`), `hand:state` (`detail {state}`).
- Produces: `export const COMFORT = { w: 0.6, h: 0.6 }`.

- [ ] **Step 1: Write the failing test**

Create `qa-hand-wiring.js`:

```js
/* QA: the wiring. Two things are asserted, and the second one is the one that
   decides whether this feels good or exhausting.
     - a frame pushed in at the source comes out as a window event carrying
       SCREEN pixels, not normalised image coordinates;
     - the COMFORT BOX maps a small central region of the camera frame to the
       whole screen. Without it, reaching a corner of the screen means reaching
       the edge of the camera's view with your arm fully extended, which is
       exactly where gorilla arm comes from.
   The image is mirrored on the way out, because a camera sees you facing it
   and an unmirrored hand moves the wrong way. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise((res, rej) => {
    srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); });
    setTimeout(() => rej(new Error('server timeout')), 5000);
  });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });

  const r = await page.evaluate(async () => {
    const { startHands, COMFORT } = await import('./hand/hands.js');
    const { makeFakeSource } = await import('./hand/source.js');
    const src = makeFakeSource();
    const seen = [];
    for (const n of ['present', 'absent', 'move', 'grab', 'release', 'lock', 'spread']) {
      window.addEventListener('hand:' + n, (e) => seen.push({ n, d: e.detail }));
    }
    const api = startHands({ source: src });
    await api.arm();

    const hand = (pinch, curl, cx, cy) => {
      const size = 0.20;
      const L = new Array(21).fill(null).map(() => ({ x: cx, y: cy, z: 0 }));
      L[0] = { x: cx, y: cy + size, z: 0 };
      L[9] = { x: cx, y: cy, z: 0 };
      L[5] = { x: cx - size * 0.4, y: cy, z: 0 };
      L[8] = { x: cx - size * 0.5 * curl, y: cy - size * curl, z: 0 };
      L[4] = { x: L[8].x + pinch * size, y: L[8].y, z: 0 };
      L[12] = { x: cx, y: cy - size * 1.05 * curl, z: 0 };
      L[16] = { x: cx + size * 0.35 * curl, y: cy - size * 0.95 * curl, z: 0 };
      L[20] = { x: cx + size * 0.6 * curl, y: cy - size * 0.8 * curl, z: 0 };
      return { landmarks: L, handedness: 'Right' };
    };

    // the LEFT edge of the comfort box, which must land at the RIGHT of the
    // screen once mirrored
    const leftEdge = 0.5 - COMFORT.w / 2;
    for (let i = 0; i < 40; i++) src.push({ hands: [hand(0.9, 1, leftEdge, 0.5)] });
    await new Promise(r2 => setTimeout(r2, 60));
    const moves = seen.filter(s => s.n === 'move');
    const last = moves[moves.length - 1];

    // and a grab
    for (let i = 0; i < 10; i++) src.push({ hands: [hand(0.20, 1, 0.5, 0.5)] });
    await new Promise(r2 => setTimeout(r2, 60));

    return {
      sawPresent: seen.some(s => s.n === 'present'),
      moveCount: moves.length,
      lastX: last ? last.d.x : null,
      lastY: last ? last.d.y : null,
      grabs: seen.filter(s => s.n === 'grab').length,
      W: window.innerWidth, H: window.innerHeight,
    };
  });

  const fails = [];
  if (!r.sawPresent) fails.push('no hand:present was dispatched');
  if (!r.moveCount) fails.push('no hand:move was dispatched');
  if (r.lastX === null || r.lastX < r.W * 0.85) fails.push(`the left edge of the comfort box landed at x=${r.lastX} of ${r.W}, wanted the right edge (mirrored)`);
  if (r.lastY === null || Math.abs(r.lastY - r.H / 2) > r.H * 0.12) fails.push(`a centred hand landed at y=${r.lastY}, wanted about ${r.H / 2}`);
  if (r.grabs !== 1) fails.push(`${r.grabs} grab events for one pinch, wanted exactly 1`);
  console.log(`  moves ${r.moveCount}   last (${Math.round(r.lastX)}, ${Math.round(r.lastY)}) of ${r.W}x${r.H}   grabs ${r.grabs}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node qa-hand-wiring.js`
Expected: FAIL, page error `Failed to fetch dynamically imported module`.

- [ ] **Step 3: Write the wiring**

Create `hand/hands.js`:

```js
/* THE WIRING. Source to filter to state machine to window events. This is the
   only public entry point, and the only thing the world ever talks to.

   THE COMFORT BOX is the decision in here that matters most. The camera frame
   is NOT mapped to the screen one to one: a box at the centre, 60% of the
   frame on each axis, covers the whole screen. Map the full frame and reaching
   a screen corner means reaching the edge of the camera's view with your arm
   fully extended, held there, which is where gorilla arm comes from. Sixty
   percent means the whole screen is reachable from a forearm resting near your
   body.

   The image is also mirrored, because a camera sees you facing it: move your
   hand right and an unmirrored point goes left. */

import { makeOneEuro } from './oneeuro.js';
import { makeGestureReader, pinchPoint } from './gestures.js';
import { makeCameraSource } from './source.js';

export const COMFORT = { w: 0.6, h: 0.6 };

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function startHands(opts) {
  const source = (opts && opts.source) || makeCameraSource();
  const reader = makeGestureReader();
  const fx = makeOneEuro({}), fy = makeOneEuro({});
  let t0 = null;

  const fire = (name, detail) => window.dispatchEvent(new CustomEvent('hand:' + name, { detail }));

  source.onFrame((frame) => {
    const now = performance.now() / 1000;
    if (t0 === null) t0 = now;
    const t = now - t0;

    for (const ev of reader.read(frame, t)) {
      if (ev.type === 'spread') fire('spread', { ratio: ev.ratio });
      else fire(ev.type, { hand: ev.hand });
    }

    const hands = (frame && frame.hands) || [];
    if (!hands.length) return;
    const p = pinchPoint(hands[0].landmarks);

    // comfort box, then mirror, then smooth, then screen pixels
    const bx = (p.x - (0.5 - COMFORT.w / 2)) / COMFORT.w;
    const by = (p.y - (0.5 - COMFORT.h / 2)) / COMFORT.h;
    const mx = 1 - clamp01(bx);
    const my = clamp01(by);
    fire('move', {
      x: fx.filter(mx, t) * window.innerWidth,
      y: fy.filter(my, t) * window.innerHeight,
    });
  });

  return {
    state: () => source.state(),
    disarm() { source.disarm(); fx.reset(); fy.reset(); t0 = null; fire('state', { state: source.state() }); },
    async arm() {
      await source.arm();
      fire('state', { state: source.state() });
    },
  };
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `node qa-hand-wiring.js`
Expected: PASS, with `last` close to `(1000, 400)` in a 1000x800 viewport.

If `lastX` comes out near 0 rather than near 1000, the mirror is inverted: the `1 -` in `mx` is missing or doubled.

- [ ] **Step 5: Commit**

```bash
git add hand/hands.js qa-hand-wiring.js
git commit -m "FIRST LIGHT: wire the hand to window events, through a comfort box

The comfort box is the decision that matters here. The camera frame is not
mapped to the screen one to one: a central 60% covers the whole screen, because
mapping the full frame means reaching a screen corner with your arm fully
extended and held there, which is where gorilla arm comes from. The image is
mirrored too, since a camera sees you facing it and an unmirrored hand moves
the wrong way."
```

---

### Task 5: The reticle and the monitor

**Files:**
- Create: `hand/hud.js`
- Modify: `firstlight.css` (append)
- Modify: `index.html` (add the module script and the button)
- Test: `qa-hand-hud.js`

**Interfaces:**
- Consumes: the `hand:*` window events from Task 4.
- Produces: `export function mountHud()` returning `{ setSnapped(label) }`. Creates `#hand-reticle` and `#hand-monitor` in the DOM.

- [ ] **Step 1: Write the failing test**

Create `qa-hand-hud.js`:

```js
/* QA: the HUD. It exists so that when the hand does not respond you can SEE
   why, which is the difference between an interface and a haunted screen.
   Asserted: the reticle only appears once a hand is present, it follows
   hand:move, it shows a grabbed state, and it disappears when the hand does. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise((res, rej) => {
    srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); });
    setTimeout(() => rej(new Error('server timeout')), 5000);
  });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const r = await page.evaluate(async () => {
    const { mountHud } = await import('./hand/hud.js');
    mountHud();
    const el = () => document.getElementById('hand-reticle');
    const vis = () => { const e = el(); return !!e && getComputedStyle(e).opacity !== '0'; };
    const out = { beforePresent: vis() };
    window.dispatchEvent(new CustomEvent('hand:present', { detail: {} }));
    window.dispatchEvent(new CustomEvent('hand:move', { detail: { x: 300, y: 240 } }));
    await new Promise(r2 => requestAnimationFrame(() => requestAnimationFrame(r2)));
    out.afterPresent = vis();
    const b1 = el().getBoundingClientRect();
    out.x1 = Math.round(b1.left + b1.width / 2);
    out.y1 = Math.round(b1.top + b1.height / 2);
    window.dispatchEvent(new CustomEvent('hand:move', { detail: { x: 700, y: 600 } }));
    await new Promise(r2 => requestAnimationFrame(() => requestAnimationFrame(r2)));
    const b2 = el().getBoundingClientRect();
    out.x2 = Math.round(b2.left + b2.width / 2);
    out.y2 = Math.round(b2.top + b2.height / 2);
    window.dispatchEvent(new CustomEvent('hand:grab', { detail: {} }));
    out.grabbedClass = el().classList.contains('grabbing');
    window.dispatchEvent(new CustomEvent('hand:release', { detail: {} }));
    out.releasedClass = el().classList.contains('grabbing');
    window.dispatchEvent(new CustomEvent('hand:absent', { detail: {} }));
    await new Promise(r2 => requestAnimationFrame(() => requestAnimationFrame(r2)));
    out.afterAbsent = vis();
    return out;
  });

  const fails = [];
  if (r.beforePresent) fails.push('the reticle was visible before any hand appeared');
  if (!r.afterPresent) fails.push('the reticle did not appear on hand:present');
  if (Math.abs(r.x1 - 300) > 4 || Math.abs(r.y1 - 240) > 4) fails.push(`the reticle sat at (${r.x1}, ${r.y1}), wanted (300, 240)`);
  if (Math.abs(r.x2 - 700) > 4 || Math.abs(r.y2 - 600) > 4) fails.push(`the reticle did not follow, sat at (${r.x2}, ${r.y2}), wanted (700, 600)`);
  if (!r.grabbedClass) fails.push('the reticle did not show a grabbed state');
  if (r.releasedClass) fails.push('the reticle stayed grabbed after release');
  if (r.afterAbsent) fails.push('the reticle stayed visible after the hand left');
  console.log(`  (${r.x1}, ${r.y1}) then (${r.x2}, ${r.y2})   grab ${r.grabbedClass} release ${!r.releasedClass}   hidden after absent ${!r.afterAbsent}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node qa-hand-hud.js`
Expected: FAIL, page error `Failed to fetch dynamically imported module`.

- [ ] **Step 3: Write the HUD**

Create `hand/hud.js`:

```js
/* THE HUD. Its whole reason to exist: when the hand does not respond, you must
   be able to SEE why. Without feedback a gesture interface is a haunted screen.

   The reticle is a ring, not an arrow: there is no cursor in this language and
   an arrowhead would promise pixel precision the hand does not have. The
   monitor is an instrument of the ship, amber on near-black like everything
   else in FIRST LIGHT, and never a video-call window. */

export function mountHud() {
  let reticle = document.getElementById('hand-reticle');
  if (!reticle) {
    reticle = document.createElement('div');
    reticle.id = 'hand-reticle';
    reticle.setAttribute('aria-hidden', 'true');
    reticle.innerHTML = '<i class="hr-ring"></i><i class="hr-dot"></i><span class="hr-tag"></span>';
    document.body.appendChild(reticle);
  }
  const tag = reticle.querySelector('.hr-tag');
  let x = 0, y = 0, pending = false;

  const paint = () => {
    pending = false;
    reticle.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(paint); } };

  window.addEventListener('hand:present', () => reticle.classList.add('on'));
  window.addEventListener('hand:absent', () => reticle.classList.remove('on', 'grabbing'));
  window.addEventListener('hand:move', (e) => { x = e.detail.x; y = e.detail.y; schedule(); });
  window.addEventListener('hand:grab', () => reticle.classList.add('grabbing'));
  window.addEventListener('hand:release', () => reticle.classList.remove('grabbing'));

  return {
    setSnapped(label) {
      tag.textContent = label || '';
      reticle.classList.toggle('snapped', !!label);
    },
  };
}
```

Append to `firstlight.css`:

```css
/* ── hand control ────────────────────────────────────────────────────────
   The reticle is a ring and never an arrow: this language has no cursor, and
   an arrowhead would promise a precision the hand does not have. It is hidden
   until a hand is actually seen, so an unarmed page is untouched. */
#hand-reticle {
  position: fixed; left: 0; top: 0; width: 0; height: 0;
  pointer-events: none; z-index: 60; opacity: 0;
  transition: opacity .18s ease;
}
#hand-reticle.on { opacity: 1; }
#hand-reticle .hr-ring {
  position: absolute; left: -21px; top: -21px; width: 42px; height: 42px;
  border: 2px solid var(--amber, #FFB000); border-radius: 50%;
  opacity: .82; transition: width .12s ease, height .12s ease, left .12s ease, top .12s ease, opacity .12s ease;
}
#hand-reticle .hr-dot {
  position: absolute; left: -2px; top: -2px; width: 4px; height: 4px;
  background: var(--amber-hi, #FFD27A); border-radius: 50%;
}
#hand-reticle.grabbing .hr-ring {
  left: -13px; top: -13px; width: 26px; height: 26px; opacity: 1;
  border-color: var(--mint, #5AFFC8);
}
#hand-reticle.snapped .hr-ring { border-style: dashed; }
#hand-reticle .hr-tag {
  position: absolute; left: 28px; top: -8px; white-space: nowrap;
  font: 400 10.5px/1 ui-monospace, SFMono-Regular, monospace;
  letter-spacing: .14em; text-transform: uppercase;
  color: var(--amber-hi, #FFD27A); opacity: .9;
}
@media (prefers-reduced-motion: reduce) {
  #hand-reticle, #hand-reticle .hr-ring { transition: none; }
}
```

In `index.html`, add the button after the `ixbtn` button on line 33:

```html
  <button id="handctlbtn" class="btn" aria-pressed="false" data-name="HAND CONTROL" data-explain="Uses your webcam to steer the chart with your hand. Nothing is recorded and no image leaves this machine: the tracking runs here, in your browser. Off until you switch it on.">HAND CONTROL <kbd>OFF</kbd></button>
```

and replace the closing script line with:

```html
<script src="firstlight.js"></script>
<script type="module" src="hand/boot.js"></script>
```

Create `hand/boot.js`:

```js
/* The only thing the page loads eagerly, and it loads nothing else. It mounts
   the reticle, wires the button, and imports nothing from MediaPipe until the
   button is pressed. */
import { mountHud } from './hud.js';
import { startHands } from './hands.js';

const hud = mountHud();
window.__handHud = hud;                 /* the world uses this to name what is snapped */
const btn = document.getElementById('handctlbtn');
if (btn) {
  const api = startHands({});
  window.__hands = api;                 /* probes and the world read the state here */
  const label = (s) => {
    const kbd = btn.querySelector('kbd');
    if (kbd) kbd.textContent = s === 'on' ? 'ON' : s === 'loading' ? '…' : 'OFF';
    btn.setAttribute('aria-pressed', String(s === 'on'));
    btn.classList.toggle('warn', s === 'denied' || s === 'unsupported' || s === 'unreachable');
    btn.title = s === 'denied' ? 'Camera permission was refused. Click to ask again.'
      : s === 'unsupported' ? 'This browser cannot open a camera here.'
      : s === 'unreachable' ? 'The tracking model could not be downloaded.'
      : '';
  };
  window.addEventListener('hand:state', (e) => label(e.detail.state));
  btn.addEventListener('click', async () => {
    if (api.state() === 'on') api.disarm(); else await api.arm();
  });
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `node qa-hand-hud.js`
Expected: PASS.

Then run the existing boot probe to prove the world is untouched:
Run: `node qa-boot.js`
Expected: unchanged from before this task. If it now reports console errors, the module script is throwing on a page where the button is absent; guard it.

- [ ] **Step 5: Commit**

```bash
git add hand/hud.js hand/boot.js firstlight.css index.html qa-hand-hud.js
git commit -m "FIRST LIGHT: the reticle, the monitor and the arming button

The HUD exists so that when the hand does not respond you can see why; without
feedback a gesture interface is a haunted screen. The reticle is a ring and
never an arrow, because this language has no cursor and an arrowhead would
promise a precision the hand does not have.

The button says plainly that nothing is recorded and no image leaves the
machine, which is true because the tracking runs locally, and it stays OFF
until pressed so an unarmed page downloads nothing."
```

---

### Task 6: The star map answers the hand

**Files:**
- Modify: `firstlight.js`, near the existing canvas pointer handlers around line 2485
- Test: `qa-hand-map.js`

**Interfaces:**
- Consumes: the `hand:*` window events from Task 4, and `window.__handHud.setSnapped` from Task 5.
- Produces: `window.__handProbe = { cam: () => ({x, y, s, tx, ty, ts}), snapped: () => number }` for the probe. This is a debug surface and is the only global the world adds.

- [ ] **Step 1: Write the failing test**

Create `qa-hand-map.js`:

```js
/* QA: the map answers the hand. The three stage-1 promises:
     - a moving hand snaps the reticle to the nearest chartable body;
     - a pinched hand dragging moves the camera TARGET, never the camera
       itself, so the world's own damping absorbs the tremor;
     - two pinched hands moving apart raise the scale target, and together
       lower it.
   Driven entirely by synthetic frames through the fake source. No camera. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise((res, rej) => {
    srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); });
    setTimeout(() => rej(new Error('server timeout')), 5000);
  });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__handProbe, { timeout: 15000 });
  await page.waitForTimeout(2000);

  const r = await page.evaluate(async () => {
    const out = {};
    const fire = (n, d) => window.dispatchEvent(new CustomEvent('hand:' + n, { detail: d || {} }));
    const settle = () => new Promise(r2 => setTimeout(r2, 120));

    fire('present');
    fire('move', { x: 600, y: 400 });
    await settle();
    out.snappedSomething = window.__handProbe.snapped() >= 0;

    const before = window.__handProbe.cam();
    fire('grab');
    fire('move', { x: 400, y: 400 });
    fire('move', { x: 300, y: 400 });
    await settle();
    const during = window.__handProbe.cam();
    out.txMoved = Math.abs(during.tx - before.tx) > 1;
    // the target moved; the position must be following it, not being set
    out.drivesTargetNotPosition = during.tx !== during.x || Math.abs(during.tx - before.tx) > Math.abs(during.x - before.x) - 1e-9;
    fire('release');

    const s0 = window.__handProbe.cam().ts;
    for (let i = 1; i <= 8; i++) fire('spread', { ratio: 1 + i * 0.06 });
    await settle();
    out.zoomedIn = window.__handProbe.cam().ts > s0;
    const s1 = window.__handProbe.cam().ts;
    for (let i = 1; i <= 8; i++) fire('spread', { ratio: 1 - i * 0.05 });
    await settle();
    out.zoomedOut = window.__handProbe.cam().ts < s1;
    return out;
  });

  const fails = [];
  if (!r.snappedSomething) fails.push('a hand over the chart snapped to nothing');
  if (!r.txMoved) fails.push('a pinched drag did not move the camera target');
  if (!r.drivesTargetNotPosition) fails.push('the hand set the camera position directly instead of its target');
  if (!r.zoomedIn) fails.push('two hands moving apart did not raise the scale target');
  if (!r.zoomedOut) fails.push('two hands moving together did not lower the scale target');
  if (errors.length) fails.push('console/page errors: ' + errors.slice(0, 2).join(' | '));
  console.log(`  snapped ${r.snappedSomething}   drag ${r.txMoved}   zoom in ${r.zoomedIn} out ${r.zoomedOut}   errors ${errors.length}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node qa-hand-map.js`
Expected: FAIL at `page.waitForFunction(() => !!window.__handProbe)`, because nothing defines it yet.

- [ ] **Step 3: Wire the world**

In `firstlight.js`, immediately after the `canvas.addEventListener('pointerleave', ...)` line (around line 2532, the end of the pointer handler block), insert:

```js
    /* ── the hand ──────────────────────────────────────────────────────────
       This is the whole of FIRST LIGHT's dependency on hand control: a block
       of listeners. Nothing here imports MediaPipe, and with the camera off no
       event ever arrives, so the world is exactly what it was.

       The hand drives cam.tx/ty/ts, the TARGETS, and never cam.x/y/s. The
       damping loop that already eases the camera toward its target then does
       the tremor smoothing for free, with machinery that has been running
       since the first version of this world. */
    var handX = 0, handY = 0, handGrab = false, handLastX = 0, handLastY = 0, handSnap = -1;
    var handZoomBase = null;

    function handSnapAt(sx, sy) {
      var wp = s2w(sx, sy);
      // the same radius picker mouse hover uses, opened up because a hand is
      // not a mouse: 15 px of tolerance is a mouse's, 46 is a hand's
      return pick(wp[0], wp[1], 46 / cam.s);
    }

    window.addEventListener('hand:present', function () { handGrab = false; });
    window.addEventListener('hand:absent', function () {
      handGrab = false; handSnap = -1;
      if (window.__handHud) window.__handHud.setSnapped('');
    });
    window.addEventListener('hand:move', function (e) {
      handLastX = handX; handLastY = handY;
      handX = e.detail.x; handY = e.detail.y;
      if (handGrab) {
        var dx = handX - handLastX, dy = handY - handLastY;
        cam.tx -= dx / cam.s; cam.ty -= dy / cam.s;
        dirty = true;
        return;
      }
      var hit = handSnapAt(handX, handY);
      if (hit !== handSnap) {
        handSnap = hit;
        if (window.__handHud) window.__handHud.setSnapped(hit >= 0 ? stars[hit].title : '');
        dirty = true;
      }
    });
    window.addEventListener('hand:grab', function () {
      handGrab = true; handLastX = handX; handLastY = handY;
    });
    window.addEventListener('hand:release', function () { handGrab = false; });
    window.addEventListener('hand:spread', function (e) {
      if (handZoomBase === null) handZoomBase = cam.ts;
      var next = handZoomBase * e.detail.ratio;
      cam.ts = Math.max(0.15, Math.min(9, next));
      dirty = true;
      clearTimeout(window.__handZoomT);
      // a gesture ends when the events stop; re-base so the next one starts fresh
      window.__handZoomT = setTimeout(function () { handZoomBase = null; }, 220);
    });

    window.__handProbe = {
      cam: function () { return { x: cam.x, y: cam.y, s: cam.s, tx: cam.tx, ty: cam.ty, ts: cam.ts }; },
      snapped: function () { return handSnap; },
    };
```

- [ ] **Step 4: Run it and watch it pass**

Run: `node qa-hand-map.js`
Expected: PASS.

Then prove nothing regressed. Run each and compare to its output before this task:
`node qa-boot.js`, `node qa-flow.js`, `node qa-final.js`
Expected: all unchanged.

- [ ] **Step 5: Commit**

```bash
git add firstlight.js qa-hand-map.js
git commit -m "FIRST LIGHT: the star map answers the hand

The whole of this world's dependency on hand control is a block of listeners.
Nothing here imports MediaPipe, and with the camera off no event ever arrives,
so the world is exactly what it was.

The hand drives cam.tx/ty/ts, the targets, and never cam.x/y/s. The damping
loop that already eases the camera toward its target then does the tremor
smoothing for free, with machinery that has been running since the first
version of this world. Snapping reuses the same radius picker mouse hover uses,
opened from 15 px to 46, because a hand is not a mouse."
```

---

### Task 7: Mirror to the branch and record it

**Files:**
- Modify: `docusaurus/static/design-lab/firstlight/` on `repo/experimental-design-firstlight`
- Modify: `docusaurus/static/design-lab/firstlight/CHANGELOG.md`
- Modify: `workbench/ideas.md` on `repo/design-lab-workbench`

- [ ] **Step 1: Copy the build onto the branch**

```bash
SP=/private/tmp/claude-501/-Users-piwi-code-documentation/0d8629c6-231f-4fec-94af-6fe3669d37b8/scratchpad/final/builds/firstlight
W=/Users/piwi/code/documentation/.claude/worktrees/fav
cd "$W" && git checkout -q repo/experimental-design-firstlight
T="$W/docusaurus/static/design-lab/firstlight"
mkdir -p "$T/hand"
for f in hand/oneeuro.js hand/gestures.js hand/source.js hand/hands.js hand/hud.js hand/boot.js index.html firstlight.js firstlight.css; do
  cat "$SP/$f" >| "$T/$f"
done
for f in qa-hand-filter.js qa-hand-gestures.js qa-hand-source.js qa-hand-wiring.js qa-hand-hud.js qa-hand-map.js; do
  cat "$SP/$f" >| "$T/$f"
done
```

- [ ] **Step 2: Write the changelog entry**

Prepend a `## 2026-xx-xx · HAND CONTROL, STAGE 1` section to `CHANGELOG.md` covering: what ships (present, snap, drag, zoom), the two-tier architecture and why the core stays five gestures, the measured weight (19 MB on disk, 11 MB over the wire) and the resulting decision to fetch rather than vendor, the scale-invariant thresholds and why an image distance would have been wrong, the comfort box and gorilla arm, and the fact that the hand drives the camera target so the existing damping does the smoothing.

- [ ] **Step 3: Run every probe once more on the branch copy, then commit and push**

```bash
cd "$T"
for p in qa-hand-filter qa-hand-gestures qa-hand-source qa-hand-wiring qa-hand-hud qa-hand-map qa-boot qa-flow qa-final; do
  echo "== $p"; node "$p.js" || echo "  ^ FAILED"
done
cd "$W"
git add docusaurus/static/design-lab/firstlight
git commit -m "FIRST LIGHT: hand control, stage 1"
git push origin repo/experimental-design-firstlight
```

- [ ] **Step 4: Tick the line in ideas.md**

On `repo/design-lab-workbench`, move the hand-control line into Archives with the commit reference and the one thing a future reader needs: that stage 2 (lock, tier-2 instrument verbs, hands-free reading) is specified and unbuilt, and that the end-to-end fake-camera probe still needs a 15-second `.y4m` of a real hand.

---

## Self-Review

**Spec coverage.** Two-tier grammar: Tasks 2 and 4 build tier 1; tier 2 is explicitly stage 3 and out of this plan. `hands.js`, `hud.js`, the CustomEvent seam, the invariant that FIRST LIGHT imports no MediaPipe: Tasks 4, 5, 6. Reuse of `pick` and `cam.tx/ty`: Task 6. Hysteresis, One Euro, comfort box, dead man's switch: Tasks 1, 2, 4. Permission, teardown, degradation ladder: Tasks 3 and 5. Level-1 testing: every task. Level-2 fake-camera testing: **not covered, by design** — it needs the 15-second clip that does not exist yet, and is recorded as an open item in Task 7 Step 4.

**Placeholders.** None. Every code step carries the actual code; every test step carries the actual test; every run step carries the exact command and the expected result, including what to change when a threshold assertion fails.

**Type consistency.** `frame` is `{hands: [{landmarks, handedness}]}` in Tasks 2, 3, 4 and in both probes that build one. `makeGestureReader().read(frame, t)` returns events consumed unchanged in Task 4. `pinchPoint` is exported by Task 2 and imported by Task 4. `makeFakeSource` is defined in Task 3 and used in Task 4. `mountHud()` returns `{setSnapped}` in Task 5 and is called as `window.__handHud.setSnapped` in Task 6. `window.__handProbe` is defined in Task 6 and read only by that task's probe.

**One gap accepted knowingly:** the `lock` event exists in the state machine from Task 2 but nothing consumes it until stage 2. It is emitted and ignored, which is correct: the grammar is defined once and surfaces subscribe as they are built.
