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
        the world is stranded holding something after you left the room.
   Also covered below: two-hand spread, fist-vs-pinch mutual exclusion (a fist
   must not also read as a grab), and a full replay of the real reference clip
   asserting on real event counts. */
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

    // 4. spread: two pinched hands moving apart report a rising ratio. The
    // base below is seeded with a GENUINELY pinched pair (ratio 0.20), not
    // the open pair (ratio 0.9) this case used to start from: seeding with
    // open hands exercised exactly the bug case 4b below exists to catch,
    // since the old two-hand gate misread ratio 0.9 as pinched.
    {
      const g = makeGestureReader();
      let t = 0, ratios = [];
      g.read(f(hand(0.20, 0.20, 1, 0.35, 0.5), hand(0.20, 0.20, 1, 0.65, 0.5)), t += 0.033);
      for (let i = 0; i < 10; i++) {
        const d = 0.15 + i * 0.02;
        const evs = g.read(f(hand(0.20, 0.20, 1, 0.5 - d, 0.5), hand(0.20, 0.20, 1, 0.5 + d, 0.5)), t += 0.033);
        evs.forEach(e => { if (e.type === 'spread') ratios.push(e.ratio); });
      }
      out.spreadCount = ratios.length;
      out.spreadRises = ratios.length > 3 && ratios[ratios.length - 1] > 1;
    }

    // 4b. two OPEN hands (thumb-to-index ratio 0.9: comfortably above
    // PINCH_ON=0.55, comfortably below the old gate's PINCH_OFF=1.00)
    // moving apart. Neither hand is pinched, so this must never spread and
    // must never grab -- the exact measured case from the finding: "two
    // hands at a thumb-index ratio of 0.9 emit spread while never counting
    // as pinched and producing zero grabs".
    {
      const g = makeGestureReader();
      let t = 0, spreads = 0, grabs = 0;
      for (let i = 0; i < 10; i++) {
        const d = 0.15 + i * 0.02;
        const evs = g.read(f(hand(0.20, 0.9, 1, 0.5 - d, 0.5), hand(0.20, 0.9, 1, 0.5 + d, 0.5)), t += 0.033);
        evs.forEach(e => { if (e.type === 'spread') spreads++; if (e.type === 'grab') grabs++; });
      }
      out.openHandsSpread = spreads;
      out.openHandsGrabbed = grabs;
    }

    // 4c. two closed FISTS moving apart. Built the same way test 5's
    // fistHand is (curl3 0.7, under FIST_ON=0.95; pinch 0.2, which by
    // thumb-to-index distance ALONE would misread as a pinch -- exactly why
    // the fist must be decided first, on its own measure, before either hand
    // counts toward a spread). This is the finding's other measured case:
    // "two FISTS emit spread and a lock together".
    {
      const fistHandAt = (cx, cy) => {
        const size = 0.20;
        const L = new Array(21).fill(null).map(() => ({ x: cx, y: cy, z: 0 }));
        L[0] = { x: cx, y: cy + size, z: 0 };
        L[9] = { x: cx, y: cy, z: 0 };
        L[8] = { x: cx - size * 0.3, y: cy - size * 0.1, z: 0 };
        L[4] = { x: L[8].x + 0.2 * size, y: L[8].y, z: 0 };
        const tip = { x: cx, y: cy + size - 0.7 * size, z: 0 };
        L[12] = { x: tip.x, y: tip.y, z: 0 };
        L[16] = { x: tip.x, y: tip.y, z: 0 };
        L[20] = { x: tip.x, y: tip.y, z: 0 };
        return { landmarks: L, handedness: 'Right' };
      };
      const g = makeGestureReader();
      let t = 0, spreads = 0;
      for (let i = 0; i < 10; i++) {
        const d = 0.15 + i * 0.02;
        const evs = g.read(f(fistHandAt(0.5 - d, 0.5), fistHandAt(0.5 + d, 0.5)), t += 0.033);
        evs.forEach(e => { if (e.type === 'spread') spreads++; });
      }
      out.fistsSpread = spreads;
    }

    // 5. fist vs pinch: closing the whole hand must not also read as a grab,
    // and a genuine pinch (thumb+index together, other three fingers still
    // out) right afterwards must still register once the fist releases.
    {
      // Built directly rather than via `hand()` above: that helper's `curl`
      // parameter never brings the middle/ring/pinky tips closer to the wrist
      // than 1.0x hand size (curl=0 stops there), so it cannot represent a
      // fist under the new, tighter thresholds. `curl3` here is exactly the
      // ratio gestures.js computes for those three tips to the wrist.
      const fistHand = (size, pinch, curl3, cx, cy) => {
        const L = new Array(21).fill(null).map(() => ({ x: cx, y: cy, z: 0 }));
        L[0] = { x: cx, y: cy + size, z: 0 };                     // wrist
        L[9] = { x: cx, y: cy, z: 0 };                            // middle knuckle
        L[8] = { x: cx - size * 0.3, y: cy - size * 0.1, z: 0 };  // index tip
        L[4] = { x: L[8].x + pinch * size, y: L[8].y, z: 0 };     // thumb tip
        const tip = { x: cx, y: cy + size - curl3 * size, z: 0 };
        L[12] = tip; L[16] = tip; L[20] = tip;                    // middle, ring, pinky
        return { landmarks: L, handedness: 'Right' };
      };

      const g = makeGestureReader();
      let t = 0;
      g.read(f(fistHand(0.20, 0.9, 1.9, 0.5, 0.5)), t += 0.033);              // open hand
      const closing = g.read(f(fistHand(0.20, 0.2, 0.7, 0.5, 0.5)), t += 0.033); // thumb+index together AND the rest curled in: a fist
      out.fistFired = types(closing).indexOf('lock') >= 0;
      out.fistAlsoGrabbed = types(closing).indexOf('grab') >= 0;

      const opening = g.read(f(fistHand(0.20, 0.2, 1.9, 0.5, 0.5)), t += 0.033); // rest of the fingers open again, thumb+index still together: now a genuine pinch
      out.pinchAfterFist = types(opening).indexOf('grab') >= 0;
    }

    // 6. fixture replay: load the real reference clip and replay through the state
    // machine. Assert that real data produces expected event counts.
    // Assertions: grab events in [2, 4] (intentional pinches, with entry/exit noise);
    // spread events > 50 (two-hand interactions); no grab left open at end (deadlock).
    {
      // Fixture must be loaded from the server; fetch it dynamically
      const fixtureUrl = './qa-fixtures/hand-reference-landmarks.json';
      const response = await fetch(fixtureUrl);
      if (!response.ok) throw new Error(`Could not load fixture: ${response.status}`);
      const fixture = await response.json();

      const g = makeGestureReader();
      let events = { grab: 0, release: 0, lock: 0, spread: 0, present: 0, absent: 0 };

      for (const f of fixture.frames) {
        // Transform fixture format [x,y] to gesture reader format {x, y}
        const frame = { hands: f.hands.map(h => ({
          landmarks: h.p.map(xy => ({ x: xy[0], y: xy[1], z: 0 })),
          handedness: h.h,
        })) };
        const evs = g.read(frame, f.t);
        for (const e of evs) {
          if (e.type in events) events[e.type]++;
        }
      }

      out.fixtureGrabs = events.grab;
      out.fixtureReleases = events.release;
      out.fixtureLocks = events.lock;
      out.fixtureSpreads = events.spread;
      out.fixturePresent = events.present;
      out.fixtureAbsent = events.absent;
      // At end, check no grab is left open (deadlock) and no fist left closed
      out.fixtureStillPinched = g.state().pinched;
      out.fixtureStillFisted = g.state().fisted;
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
  if (r.openHandsSpread) fails.push(`two OPEN hands (ratio 0.9, never pinched) produced ${r.openHandsSpread} spread event(s)`);
  if (r.openHandsGrabbed) fails.push(`two OPEN hands (ratio 0.9, never pinched) produced ${r.openHandsGrabbed} grab event(s)`);
  if (r.fistsSpread) fails.push(`two closed FISTS produced ${r.fistsSpread} spread event(s)`);
  if (!r.fistFired) fails.push('closing the whole hand into a fist did not fire a lock');
  if (r.fistAlsoGrabbed) fails.push('closing into a fist also fired a grab');
  if (!r.pinchAfterFist) fails.push('a genuine pinch right after a fist did not fire a grab');
  // Fixture replay assertions: grabs in [2,4] (real pinches plus entry/exit noise);
  // spreads 50+ (two-hand interactions); locks in [2,4] (two real fist holds
  // in the clip, plus tolerance for the same entry/exit noise as grabs); no
  // grab or fist left open at end (deadlock check)
  if (r.fixtureGrabs < 2 || r.fixtureGrabs > 4) fails.push(`fixture grabs ${r.fixtureGrabs}, wanted 2-4`);
  if (r.fixtureSpreads < 50) fails.push(`fixture spreads ${r.fixtureSpreads}, wanted 50+`);
  if (r.fixtureLocks < 2 || r.fixtureLocks > 4) fails.push(`fixture locks ${r.fixtureLocks}, wanted 2-4`);
  if (r.fixtureStillPinched) fails.push('fixture ended with grab still open (deadlock)');
  if (r.fixtureStillFisted) fails.push('fixture ended with fist still closed (deadlock)');
  console.log(`  synthetic: flips ${r.flips}   near/far ${r.nearPinched}/${r.farPinched}   spreads ${r.spreadCount}   fist-locked ${r.fistFired}   fist-also-grabbed ${r.fistAlsoGrabbed}   pinch-after-fist ${r.pinchAfterFist}`);
  console.log(`  two-hand gate: open-hands spread/grab ${r.openHandsSpread}/${r.openHandsGrabbed} (want 0/0)   two-fists spread ${r.fistsSpread} (want 0)`);
  console.log(`  fixture: grabs ${r.fixtureGrabs}   locks ${r.fixtureLocks}   spreads ${r.fixtureSpreads}   ended-pinched ${r.fixtureStillPinched} ended-fisted ${r.fixtureStillFisted}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
