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
   Also covered below: fist-vs-pinch mutual exclusion (a fist must not also
   read as a grab); the FAN zoom rate (spread fingers zoom in, closed fingers
   zoom out, a dead zone so a resting hand does not drift it, suppressed while
   pinched or fisted); a brief pinch reading as a click, and NOT as a click
   when it is really a drag or a fist taking over; the swipe/dismiss
   recognizer (general recognition, no opinion about what it means -- see
   firstlight.js for that -- and outward-only, keyed to handedness: rightward
   for a right hand, leftward for a left one, either direction if handedness
   is unknown); and a full replay of the real reference clip asserting on
   real event counts. */
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
    const {
      makeGestureReader, PINCH_ON, FAN_NEUTRAL, FAN_DEADZONE,
      CLICK_MAX_MS, CLICK_MAX_DIST, SWIPE_SPEED, SWIPE_FRAMES,
    } = await import('./hand/gestures.js');

    /* Build a synthetic hand. `size` is wrist-to-middle-knuckle in image units,
       which is how far away the person is sitting. `pinch` is the thumb-to-index
       gap as a RATIO of that size, so the same value means the same gesture at
       any distance. `curl` at 1 is an open hand, at 0 a closed fist (though see
       the note on qa-hand-gestures's own fistHand below: this parameter never
       actually reaches a genuine fist under the tighter thresholds; it is only
       ever used here to vary the FAN, i.e. how far index and pinky sit apart). */
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

    // 1. hysteresis: jitter astride the ARMING threshold (PINCH_ON), imported
    // rather than copied, so this cannot silently drift out of date again the
    // way it did before. The old band (0.40-0.44) sat entirely below
    // PINCH_ON=0.55 and never came near either threshold, so it read flips=0
    // whether hysteresis existed or not: a naive single-threshold reader
    // (arm and release at the same value) would ALSO never flip on values
    // that never cross that value. Jittering across PINCH_ON is exactly the
    // input a naive reader would flip on every frame, since 0.02 above
    // PINCH_ON is a release under a naive reader but never gets near
    // PINCH_OFF=1.00 under the real hysteretic one, so a real flip count of 0
    // here is actual evidence of the hysteresis band, not an artifact of a
    // band that never tests anything.
    {
      const g = makeGestureReader();
      let t = 0, flips = 0, last = null;
      g.read(f(hand(0.20, 0.9, 1, 0.5, 0.5)), t += 0.033);           // open first
      for (let i = 0; i < 60; i++) {
        const pinch = PINCH_ON + (i % 2 ? 0.02 : -0.02);             // straddling PINCH_ON
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

    // 4. fist vs pinch: closing the whole hand must not also read as a grab,
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

    // 5. THE FAN. hand()'s curl=1 places index and pinky at fanRatio ~1.118
    // (index tip to pinky tip, over hand size): comfortably past the dead
    // zone's high edge (FAN_NEUTRAL + FAN_DEADZONE = 1.04), so this is the
    // gesture's "fingers spread" reading throughout the rest of this file --
    // which is also exactly why the pinch and fist cases above never leak a
    // `fan` event despite sitting on the same geometry: the state gate, not
    // the geometry, is what suppresses them (checked explicitly in 5c/5d).
    {
      const g = makeGestureReader();
      let t = 0;
      g.read(f(hand(0.20, 0.9, 1, 0.5, 0.5)), t += 0.033);                 // present, establish open
      const spread = g.read(f(hand(0.20, 0.9, 1, 0.5, 0.5)), t += 0.033);   // curl=1 -> fanRatio ~1.118
      out.fanSpreadRate = (spread.find(e => e.type === 'fan') || {}).rate;
    }
    // 5b. closed but NOT fisted: curl=0.5 gives fanRatio ~0.559 (under the
    // dead zone's low edge, 0.74) while fistCurl stays ~1.48, nowhere near
    // FIST_ON=0.95 -- a hand making a loose fist shape, not a fist.
    {
      const g = makeGestureReader();
      let t = 0;
      g.read(f(hand(0.20, 0.9, 1, 0.5, 0.5)), t += 0.033);
      const closed = g.read(f(hand(0.20, 0.9, 0.5, 0.5, 0.5)), t += 0.033);
      out.fanClosedRate = (closed.find(e => e.type === 'fan') || {}).rate;
    }
    // 5c. neutral: curl=0.8 gives fanRatio ~0.894, inside [0.74, 1.04].
    // A hand held open and merely resting must produce no rate at all, or a
    // resting hand drifts the zoom on its own -- the exact complaint against
    // the old, oversensitive gesture.
    {
      const g = makeGestureReader();
      let t = 0;
      g.read(f(hand(0.20, 0.9, 1, 0.5, 0.5)), t += 0.033);
      const neutral = g.read(f(hand(0.20, 0.9, 0.8, 0.5, 0.5)), t += 0.033);
      out.fanNeutralEvents = types(neutral).filter(x => x === 'fan').length;
    }
    // 5d. PINCHED: the exact same curl=1 geometry that reads as a clear
    // "spread" in 5 above, but with the thumb and index together (pinch=0.2).
    // The fan must be suppressed entirely while pinched, not merely damped:
    // a fan overlapping the pinch band that leaked through would spin the
    // zoom the instant you grabbed the map to drag it.
    {
      const g = makeGestureReader();
      let t = 0;
      g.read(f(hand(0.20, 0.9, 1, 0.5, 0.5)), t += 0.033);            // open first
      const pinchedEvs = g.read(f(hand(0.20, 0.2, 1, 0.5, 0.5)), t += 0.033); // now pinched, same fan geometry
      out.fanWhilePinched = types(pinchedEvs).filter(x => x === 'fan').length;
    }
    // 5e. FISTED: a genuine fist (via fistHand, curl3=0.7) must never emit a
    // fan either, whatever its incidental fanRatio happens to be.
    {
      const fistHand2 = (size, curl3, cx, cy) => {
        const L = new Array(21).fill(null).map(() => ({ x: cx, y: cy, z: 0 }));
        L[0] = { x: cx, y: cy + size, z: 0 };
        L[9] = { x: cx, y: cy, z: 0 };
        L[8] = { x: cx - size * 0.3, y: cy - size * 0.1, z: 0 };
        L[4] = { x: L[8].x + 0.9 * size, y: L[8].y, z: 0 };
        const tip = { x: cx, y: cy + size - curl3 * size, z: 0 };
        L[12] = tip; L[16] = tip; L[20] = tip;
        return { landmarks: L, handedness: 'Right' };
      };
      const g = makeGestureReader();
      let t = 0;
      g.read(f(fistHand2(0.20, 1.9, 0.5, 0.5)), t += 0.033);          // open first
      const fisted = g.read(f(fistHand2(0.20, 0.7, 0.5, 0.5)), t += 0.033); // now a fist
      out.fanWhileFisted = types(fisted).filter(x => x === 'fan').length;
    }

    // 6. A BRIEF PINCH IS A CLICK. CLICK_MAX_MS and CLICK_MAX_DIST are
    // imported, not copied, for the same reason PINCH_ON is above.
    {
      const g = makeGestureReader();
      let t = 0;
      g.read(f(hand(0.20, 0.9, 1, 0.5, 0.5)), t += 0.033);           // open, establish palm at cx=0.5
      const grabEvs = g.read(f(hand(0.20, 0.2, 1, 0.5, 0.5)), t += 0.033); // grab, no movement
      out.clickGrabFired = types(grabEvs).indexOf('grab') >= 0;
      // 1.2, not 0.9: releasing needs pr to cross PINCH_OFF=1.00, the
      // RELEASE threshold, and 0.9 sits inside the hysteresis band (never
      // releases at all) -- the same distinction test 1's hysteresis check
      // above exists to prove matters.
      const releaseEvs = g.read(f(hand(0.20, 1.2, 1, 0.5, 0.5)), t += (CLICK_MAX_MS / 1000) * 0.4); // brief, still, released
      out.briefClickFired = types(releaseEvs).indexOf('click') >= 0;
      out.briefReleaseFired = types(releaseEvs).indexOf('release') >= 0;
    }
    // 6b. held too long, still no movement: must NOT click. Time alone must
    // disqualify it, or a click stops feeling like a click and starts
    // feeling like every held gesture just times out into one.
    {
      const g = makeGestureReader();
      let t = 0;
      g.read(f(hand(0.20, 0.9, 1, 0.5, 0.5)), t += 0.033);
      g.read(f(hand(0.20, 0.2, 1, 0.5, 0.5)), t += 0.033);           // grab
      t += (CLICK_MAX_MS / 1000) * 2.5;                              // held well past CLICK_MAX_MS
      const releaseEvs = g.read(f(hand(0.20, 1.2, 1, 0.5, 0.5)), t);
      out.longHoldReleaseFired = types(releaseEvs).indexOf('release') >= 0;
      out.longHoldClickFired = types(releaseEvs).indexOf('click') >= 0;
    }
    // 6c. released quickly, but dragged first: must NOT click. Time alone is
    // not enough either, or a fast flick-drag would misread as a tap.
    {
      const g = makeGestureReader();
      let t = 0;
      g.read(f(hand(0.20, 0.9, 1, 0.5, 0.5)), t += 0.033);
      g.read(f(hand(0.20, 0.2, 1, 0.5, 0.5)), t += 0.033);           // grab at cx=0.5
      t += (CLICK_MAX_MS / 1000) * 0.4;                              // quick, but...
      const releaseEvs = g.read(f(hand(0.20, 1.2, 1, 0.60, 0.5)), t); // ...moved 0.10 (0.5 of hand size) before releasing
      out.draggedReleaseFired = types(releaseEvs).indexOf('release') >= 0;
      out.draggedClickFired = types(releaseEvs).indexOf('click') >= 0;
    }
    // 6d. a fist overtaking a pinch is the hand changing its mind, not a
    // released click, even though it happens fast and without moving: the
    // RELEASE this fires comes from the fisted branch, not the natural one,
    // and must never carry a click.
    {
      const fistHand3 = (size, pinch, curl3, cx, cy) => {
        const L = new Array(21).fill(null).map(() => ({ x: cx, y: cy, z: 0 }));
        L[0] = { x: cx, y: cy + size, z: 0 };
        L[9] = { x: cx, y: cy, z: 0 };
        L[8] = { x: cx - size * 0.3, y: cy - size * 0.1, z: 0 };
        L[4] = { x: L[8].x + pinch * size, y: L[8].y, z: 0 };
        const tip = { x: cx, y: cy + size - curl3 * size, z: 0 };
        L[12] = tip; L[16] = tip; L[20] = tip;
        return { landmarks: L, handedness: 'Right' };
      };
      const g = makeGestureReader();
      let t = 0;
      g.read(f(fistHand3(0.20, 0.9, 1.9, 0.5, 0.5)), t += 0.033);     // open
      g.read(f(fistHand3(0.20, 0.2, 1.9, 0.5, 0.5)), t += 0.033);     // grab (fingers still out)
      t += 0.05;                                                     // fast, no movement
      const closing = g.read(f(fistHand3(0.20, 0.2, 0.7, 0.5, 0.5)), t); // ...but curls into a fist
      out.fistOverrideReleaseFired = types(closing).indexOf('release') >= 0;
      out.fistOverrideClickFired = types(closing).indexOf('click') >= 0;
    }

    // 7. THE SWIPE (dismiss), RIGHT hand, genuinely OUTWARD. hands.js
    // mirrors x for display (rawX = 1 - bx), so a right hand moving to its
    // own right -- outward, the dismiss direction -- is screen x
    // INCREASING but raw landmark x DECREASING. With size=0.20 and
    // dt=0.033, a step of -0.02 gives a screen speed of (0.02/0.20)/0.033
    // ~= 3.0 units/s, comfortably past SWIPE_SPEED=1.0.
    {
      const g = makeGestureReader();
      let t = 0, cx = 0.70, dismissCount = 0;
      g.read(f(hand(0.20, 0.9, 1, cx, 0.5)), t += 0.033);            // seed: no speed measurable yet
      for (let i = 0; i < 6; i++) {
        cx -= 0.02;
        const evs = g.read(f(hand(0.20, 0.9, 1, cx, 0.5)), t += 0.033);
        dismissCount += types(evs).filter(x => x === 'dismiss').length;
      }
      out.swipeRightOutwardCount = dismissCount;                     // exactly 1: edge-triggered, not one per qualifying frame
    }
    // 7b. RIGHT hand, the WRONG direction: raw x increasing is screen x
    // decreasing, i.e. toward the body's own midline for a right hand, not
    // away from it. This must never read as a dismiss, whatever its speed:
    // dismiss is outward only, not "fast enough in either direction".
    {
      const g = makeGestureReader();
      let t = 0, cx = 0.30;
      g.read(f(hand(0.20, 0.9, 1, cx, 0.5)), t += 0.033);
      let fired = false;
      for (let i = 0; i < 6; i++) {
        cx += 0.02;
        const evs = g.read(f(hand(0.20, 0.9, 1, cx, 0.5)), t += 0.033);
        if (types(evs).indexOf('dismiss') >= 0) fired = true;
      }
      out.swipeRightInwardFired = fired;
    }
    // 7c. only 3 qualifying (outward) frames (SWIPE_FRAMES is 4): must not
    // fire.
    {
      const g = makeGestureReader();
      let t = 0, cx = 0.70;
      g.read(f(hand(0.20, 0.9, 1, cx, 0.5)), t += 0.033);
      let fired = false;
      for (let i = 0; i < 3; i++) {
        cx -= 0.02;
        const evs = g.read(f(hand(0.20, 0.9, 1, cx, 0.5)), t += 0.033);
        if (types(evs).indexOf('dismiss') >= 0) fired = true;
      }
      out.swipeShortStreakFired = fired;
    }
    // 7d. the same qualifying (outward) motion, but PINCHED: open-hand-only
    // means exactly that. A drag across the screen must never also read as
    // a dismiss.
    {
      const g = makeGestureReader();
      let t = 0, cx = 0.70;
      g.read(f(hand(0.20, 0.2, 1, cx, 0.5)), t += 0.033);            // pinched from the start
      let fired = false;
      for (let i = 0; i < 6; i++) {
        cx -= 0.02;
        const evs = g.read(f(hand(0.20, 0.2, 1, cx, 0.5)), t += 0.033);
        if (types(evs).indexOf('dismiss') >= 0) fired = true;
      }
      out.swipeWhilePinchedFired = fired;
    }
    // 7e. LEFT hand: outward is the OPPOSITE raw direction (screen x
    // decreasing, raw x increasing) -- the mirror image of 7 above, proving
    // the gate is keyed to handedness and not a hardcoded "swipe right".
    {
      const handLeft = (size, pinch, curl, cx, cy) => {
        const built = hand(size, pinch, curl, cx, cy);
        return { landmarks: built.landmarks, handedness: 'Left' };
      };
      const g = makeGestureReader();
      let t = 0, cx = 0.30, dismissCount = 0;
      g.read(f(handLeft(0.20, 0.9, 1, cx, 0.5)), t += 0.033);
      for (let i = 0; i < 6; i++) {
        cx += 0.02;
        const evs = g.read(f(handLeft(0.20, 0.9, 1, cx, 0.5)), t += 0.033);
        dismissCount += types(evs).filter(x => x === 'dismiss').length;
      }
      out.swipeLeftOutwardCount = dismissCount;                      // exactly 1
    }
    // 7f. UNKNOWN handedness, direction reversal: with no handedness to
    // pick a required direction, either direction individually qualifies,
    // but a reversal mid-streak must still reset it -- 2 one way, 2 the
    // other, 2 back, never 4 consecutive frames agreeing.
    {
      const handUnknown = (size, pinch, curl, cx, cy) => {
        const built = hand(size, pinch, curl, cx, cy);
        return { landmarks: built.landmarks, handedness: undefined };
      };
      const g = makeGestureReader();
      let t = 0, cx = 0.40;
      g.read(f(handUnknown(0.20, 0.9, 1, cx, 0.5)), t += 0.033);
      const steps = [-0.02, -0.02, 0.02, 0.02, -0.02, -0.02];
      let fired = false;
      for (const d of steps) {
        cx += d;
        const evs = g.read(f(handUnknown(0.20, 0.9, 1, cx, 0.5)), t += 0.033);
        if (types(evs).indexOf('dismiss') >= 0) fired = true;
      }
      out.swipeUnknownReversalFired = fired;                         // want false
    }
    // 7g. UNKNOWN handedness, sustained one direction: must still fire. The
    // direction only exists to make the gesture comfortable, not to gate it
    // shut when handedness is simply unavailable.
    {
      const handUnknown = (size, pinch, curl, cx, cy) => {
        const built = hand(size, pinch, curl, cx, cy);
        return { landmarks: built.landmarks, handedness: undefined };
      };
      const g = makeGestureReader();
      let t = 0, cx = 0.70, dismissCount = 0;
      g.read(f(handUnknown(0.20, 0.9, 1, cx, 0.5)), t += 0.033);
      for (let i = 0; i < 6; i++) {
        cx -= 0.02;
        const evs = g.read(f(handUnknown(0.20, 0.9, 1, cx, 0.5)), t += 0.033);
        dismissCount += types(evs).filter(x => x === 'dismiss').length;
      }
      out.swipeUnknownSustainedCount = dismissCount;                 // exactly 1
    }

    // 8. fixture replay: load the real reference clip and replay through the
    // state machine. Assert real data produces the real event counts.
    {
      // Fixture must be loaded from the server; fetch it dynamically
      const fixtureUrl = './qa-fixtures/hand-reference-landmarks.json';
      const response = await fetch(fixtureUrl);
      if (!response.ok) throw new Error(`Could not load fixture: ${response.status}`);
      const fixture = await response.json();

      const g = makeGestureReader();
      let events = { grab: 0, release: 0, lock: 0, click: 0, fan: 0, dismiss: 0, present: 0, absent: 0 };

      for (const fr of fixture.frames) {
        // Transform fixture format [x,y] to gesture reader format {x, y}
        const frame = { hands: fr.hands.map(h => ({
          landmarks: h.p.map(xy => ({ x: xy[0], y: xy[1], z: 0 })),
          handedness: h.h,
        })) };
        const evs = g.read(frame, fr.t);
        for (const e of evs) {
          if (e.type in events) events[e.type]++;
        }
      }

      out.fixtureGrabs = events.grab;
      out.fixtureReleases = events.release;
      out.fixtureLocks = events.lock;
      out.fixtureClicks = events.click;
      out.fixtureFans = events.fan;
      out.fixtureDismiss = events.dismiss;
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
  if (!r.fistFired) fails.push('closing the whole hand into a fist did not fire a lock');
  if (r.fistAlsoGrabbed) fails.push('closing into a fist also fired a grab');
  if (!r.pinchAfterFist) fails.push('a genuine pinch right after a fist did not fire a grab');
  if (!(r.fanSpreadRate > 0)) fails.push(`a clearly spread hand gave fan rate ${r.fanSpreadRate}, wanted a positive number`);
  if (!(r.fanClosedRate < 0)) fails.push(`a clearly closed (not fisted) hand gave fan rate ${r.fanClosedRate}, wanted a negative number`);
  if (r.fanNeutralEvents !== 0) fails.push(`a hand resting inside the dead zone produced ${r.fanNeutralEvents} fan event(s), wanted 0`);
  if (r.fanWhilePinched) fails.push(`a pinched hand, on fan-triggering geometry, produced ${r.fanWhilePinched} fan event(s), wanted 0`);
  if (r.fanWhileFisted) fails.push(`a fisted hand produced ${r.fanWhileFisted} fan event(s), wanted 0`);
  if (!r.clickGrabFired) fails.push('a click test setup problem: the grab never fired');
  if (!r.briefReleaseFired) fails.push('a click test setup problem: the release never fired');
  if (!r.briefClickFired) fails.push('a brief, still pinch did not fire a click');
  if (!r.longHoldReleaseFired) fails.push('a click test setup problem: the long-hold release never fired');
  if (r.longHoldClickFired) fails.push('a pinch held well past CLICK_MAX_MS, released without moving, still fired a click');
  if (!r.draggedReleaseFired) fails.push('a click test setup problem: the dragged release never fired');
  if (r.draggedClickFired) fails.push('a pinch released quickly but after a real drag still fired a click');
  if (!r.fistOverrideReleaseFired) fails.push('a fist overtaking a pinch did not fire a release');
  if (r.fistOverrideClickFired) fails.push('a fist overtaking a pinch (fast, no movement) fired a click; it should never look at this release');
  if (r.fixtureGrabs < 2 || r.fixtureGrabs > 4) fails.push(`fixture grabs ${r.fixtureGrabs}, wanted 2-4`);
  if (r.fixtureLocks < 2 || r.fixtureLocks > 4) fails.push(`fixture locks ${r.fixtureLocks}, wanted 2-4`);
  if (r.fixtureStillPinched) fails.push('fixture ended with grab still open (deadlock)');
  if (r.fixtureStillFisted) fails.push('fixture ended with fist still closed (deadlock)');
  // Both real pinches in the fixture (8.1s and 12.1s) were built to test
  // drag hysteresis, not a tap, and both hugely exceed CLICK_MAX_MS the
  // instant they start dragging; the one short, incidental pinch (667ms)
  // still exceeds CLICK_MAX_MS on its own. 0 is the honest, measured count,
  // not an assumption.
  if (r.fixtureClicks !== 0) fails.push(`fixture clicks ${r.fixtureClicks}, wanted exactly 0 (see the report: no genuine tap exists in this clip)`);
  if (r.fixtureFans < 50) fails.push(`fixture fan events ${r.fixtureFans}, wanted 50+ (real open-hand motion crossing the dead zone)`);
  if (r.swipeRightOutwardCount !== 1) fails.push(`a right hand swiping outward fired dismiss ${r.swipeRightOutwardCount} times, wanted exactly 1`);
  if (r.swipeRightInwardFired) fails.push('a right hand swiping inward (toward its own midline) fired a dismiss; dismiss is outward only');
  if (r.swipeShortStreakFired) fails.push('a 3-frame streak (short of SWIPE_FRAMES=4) fired a dismiss');
  if (r.swipeWhilePinchedFired) fails.push('a pinched hand moving fast and consistently fired a dismiss; swipe must be open-hand only');
  if (r.swipeLeftOutwardCount !== 1) fails.push(`a left hand swiping outward (the mirror-image direction) fired dismiss ${r.swipeLeftOutwardCount} times, wanted exactly 1`);
  if (r.swipeUnknownReversalFired) fails.push('unknown handedness, direction reversal mid-streak, still fired a dismiss');
  if (r.swipeUnknownSustainedCount !== 1) fails.push(`unknown handedness, sustained one direction, fired dismiss ${r.swipeUnknownSustainedCount} times, wanted exactly 1`);
  // IMPORTANT, read the report: this is NOT 0. Real, sustained,
  // single-direction lateral hand motion exists in this clip, in the
  // outward direction for this hand (measured directly, twice), that
  // crosses SWIPE_SPEED for well more than SWIPE_FRAMES. The brief the
  // swipe/dismiss thresholds were handed down with claimed zero such bursts
  // in this exact fixture; that claim did not hold up under direct
  // measurement (a third burst existed too, in the inward direction, which
  // the handedness gate now correctly excludes). 2 is what real replay
  // produces, not what was expected, and this assertion says so plainly
  // rather than picking a number that would let a silent regression back
  // in.
  if (r.fixtureDismiss !== 2) fails.push(`fixture dismiss events ${r.fixtureDismiss}, wanted exactly 2 (measured; see the report on the swipe threshold)`);
  console.log(`  hysteresis flips ${r.flips}   near/far pinched ${r.nearPinched}/${r.farPinched}   dead man's switch released ${r.releasedOnLoss} still-grabbed ${r.stillGrabbed}`);
  console.log(`  fist-vs-pinch: fist-locked ${r.fistFired}   fist-also-grabbed ${r.fistAlsoGrabbed}   pinch-after-fist ${r.pinchAfterFist}`);
  console.log(`  fan: spread rate ${r.fanSpreadRate}   closed rate ${r.fanClosedRate}   neutral events ${r.fanNeutralEvents} (want 0)   while pinched ${r.fanWhilePinched} (want 0)   while fisted ${r.fanWhileFisted} (want 0)`);
  console.log(`  click: brief ${r.briefClickFired}   long-hold ${r.longHoldClickFired} (want false)   dragged ${r.draggedClickFired} (want false)   fist-override release ${r.fistOverrideReleaseFired} click ${r.fistOverrideClickFired} (want false)`);
  console.log(`  swipe: right-outward count ${r.swipeRightOutwardCount} (want 1)   right-inward fired ${r.swipeRightInwardFired} (want false)   short streak fired ${r.swipeShortStreakFired} (want false)   while pinched ${r.swipeWhilePinchedFired} (want false)   left-outward count ${r.swipeLeftOutwardCount} (want 1)   unknown-handedness reversal fired ${r.swipeUnknownReversalFired} (want false)   unknown-handedness sustained count ${r.swipeUnknownSustainedCount} (want 1)`);
  console.log(`  fixture: grabs ${r.fixtureGrabs}   locks ${r.fixtureLocks}   clicks ${r.fixtureClicks} (want 0)   fans ${r.fixtureFans}   dismiss ${r.fixtureDismiss} (want 2, see report)   ended-pinched ${r.fixtureStillPinched} ended-fisted ${r.fixtureStillFisted}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
