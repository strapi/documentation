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
