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
      L[17] = { x: cx + size * 0.4, y: cy, z: 0 };
      L[8] = { x: cx - size * 0.5 * curl, y: cy - size * curl, z: 0 };
      L[4] = { x: L[8].x + pinch * size, y: L[8].y, z: 0 };
      L[12] = { x: cx, y: cy - size * 1.05 * curl, z: 0 };
      L[16] = { x: cx + size * 0.35 * curl, y: cy - size * 0.95 * curl, z: 0 };
      L[20] = { x: cx + size * 0.6 * curl, y: cy - size * 0.8 * curl, z: 0 };
      // cx, cy name where the hand is HELD, i.e. palmCentre (the mean of 0,
      // 5, 9 and 17, what the reticle now follows), not the pinch point and
      // not some other unnamed part of the palm. The tips above are placed
      // relative to a nominal centre first; then every landmark is shifted
      // by the delta needed to put palmCentre exactly at (cx, cy), so a
      // caller's coordinates mean what they say. 0, 5, 9 and 17 never depend
      // on `curl` or `pinch` above, so this shift -- and palmCentre itself --
      // is exactly the same regardless of how open or closed the hand is,
      // which is the whole point being anchored to it.
      const rawPalm = { x: (L[0].x + L[5].x + L[9].x + L[17].x) / 4,
                         y: (L[0].y + L[5].y + L[9].y + L[17].y) / 4 };
      const dx = cx - rawPalm.x, dy = cy - rawPalm.y;
      for (const p of L) { p.x += dx; p.y += dy; }
      return { landmarks: L, handedness: 'Right' };
    };

    // A second synthetic builder, needed only where a case below must reach
    // a genuinely FISTED hand: hand()'s own `curl` parameter never brings
    // the middle/ring/pinky tips closer to the wrist than 1.0x hand size, so
    // it can never cross FIST_ON=0.95 (see qa-hand-gestures.js's fistHand
    // for the same limitation). `curl3` here is exactly the ratio
    // gestures.js's fistCurl computes, so a caller names the real fisted
    // state directly. Thumb and index are held well apart (ratio 0.9, safe
    // above PINCH_ON) so this hand never also reads as a pinch, whatever
    // curl3 is. Aligned on palmCentre exactly like hand() above.
    const fistHandAt = (curl3, cx, cy) => {
      const size = 0.20;
      const L = new Array(21).fill(null).map(() => ({ x: cx, y: cy, z: 0 }));
      L[0] = { x: cx, y: cy + size, z: 0 };
      L[9] = { x: cx, y: cy, z: 0 };
      L[5] = { x: cx - size * 0.4, y: cy, z: 0 };
      L[17] = { x: cx + size * 0.4, y: cy, z: 0 };
      L[8] = { x: cx - size * 0.3, y: cy - size * 0.1, z: 0 };
      L[4] = { x: L[8].x + 0.9 * size, y: L[8].y, z: 0 };
      const tipY = cy + size - curl3 * size;
      // three SEPARATE objects, not one shared reference: the shift loop
      // below mutates every landmark in place, and L[12], L[16] and L[20]
      // pointing at the same object would have it shifted three times over.
      L[12] = { x: cx, y: tipY, z: 0 };
      L[16] = { x: cx, y: tipY, z: 0 };
      L[20] = { x: cx, y: tipY, z: 0 };
      const rawPalm = { x: (L[0].x + L[5].x + L[9].x + L[17].x) / 4,
                         y: (L[0].y + L[5].y + L[9].y + L[17].y) / 4 };
      const dx = cx - rawPalm.x, dy = cy - rawPalm.y;
      for (const p of L) { p.x += dx; p.y += dy; }
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

    // disarm must not leave the gesture reader's internal state (present,
    // pinched, fisted, lastSeen) behind for the next session to inherit.
    const markA = seen.length;
    api.disarm();
    await api.arm();

    // sub-case A: the rearmed session must announce itself again. A stale
    // present === true, carried over from the session above (which ended
    // mid grab, present and pinched both true), would silently swallow this.
    for (let i = 0; i < 5; i++) src.push({ hands: [hand(0.20, 1, 0.5, 0.5)] });
    await new Promise(r2 => setTimeout(r2, 30));
    const rearmPresent = seen.slice(markA).some(s => s.n === 'present');

    // sub-case B: disarm again right away, so present and pinched are true
    // and lastSeen is small (from sub-case A, moments ago), then rearm and
    // lose tracking with NO present frame in between. A correctly reset
    // reader has lastSeen === null and fires nothing for a hand it never
    // saw this session. A reader that survived the disarm keeps that small
    // stale lastSeen, which the new session's own t (also starting near
    // zero) will overtake within a couple hundred milliseconds: the dead
    // man's switch does not just fire late, it fires a PHANTOM release and
    // absent for a hand this new session never held.
    api.disarm();
    await api.arm();
    const markB = seen.length;
    // pushed repeatedly, like a real camera source that keeps emitting a
    // frame every tick whether or not a hand is in it: the switch is only
    // ever re-evaluated when a frame arrives, so one push and a long wait
    // would prove nothing.
    for (let i = 0; i < 20; i++) {
      src.push({ hands: [] });
      await new Promise(r2 => setTimeout(r2, 20));
    }
    const phantom = seen.slice(markB).filter(s => s.n === 'release' || s.n === 'absent');

    // Case: a REAL fist closure, replayed from the reference fixture through
    // the full wiring (comfort box, mirror, one-euro filter, latch) -- not
    // synthetic geometry. Hand-built landmarks can be made to prove whatever
    // shape the author had in mind; the whole point of anchoring the reticle
    // to palmCentre and latching it on grab/lock is fidelity to how an
    // actual hand closes, so the regression proof has to replay an actual
    // hand closing.
    //
    // A second, independent session: this must not share the reader, filter
    // or latch state of the session already exercised above.
    const fixResp = await fetch('./qa-fixtures/hand-reference-landmarks.json');
    const fixture = await fixResp.json();
    const toFixtureFrame = (f) => ({ hands: f.hands.map(h => ({
      landmarks: h.p.map(xy => ({ x: xy[0], y: xy[1], z: 0 })),
      handedness: h.h,
    })) });

    const src2 = makeFakeSource();
    const moves2 = [];
    let lockAt = null;
    window.addEventListener('hand:move', (e) => moves2.push({ x: e.detail.x, y: e.detail.y }));
    window.addEventListener('hand:lock', () => { if (lockAt === null) lockAt = moves2.length; });
    const api2 = startHands({ source: src2 });
    await api2.arm();

    // Frames 650-760 of the fixture cover a real, deliberate closing motion:
    // the hand sits open through the low 600s, pinches around frame 694,
    // and curls the rest of the way into a full fist by frame 715 (where a
    // real 'lock' fires), held afterward. Replayed at the fixture's own
    // frame-to-frame timing, not pushed back to back, because the one-euro
    // filter's cutoff depends on dt: compressing 3.6 seconds of motion into
    // a few milliseconds of wall-clock time would understate the smoothing
    // (and therefore the drift) a live camera actually produces.
    const slice = fixture.frames.slice(650, 760);
    for (let i = 0; i < slice.length; i++) {
      src2.push(toFixtureFrame(slice[i]));
      if (i < slice.length - 1) {
        const dtMs = Math.max(4, Math.min(100, (slice[i + 1].t - slice[i].t) * 1000));
        await new Promise(r2 => setTimeout(r2, dtMs));
      }
    }
    await new Promise(r2 => setTimeout(r2, 60));

    // Stability across the closure: the reticle's average reported position
    // while the hand still sat open (the first 15 moves, long enough for
    // the one-euro filter to settle) against every position reported from
    // the moment of the lock onward, through the held fist that follows.
    const settle = moves2.slice(0, 15);
    const baseX = settle.reduce((s, m) => s + m.x, 0) / settle.length;
    const baseY = settle.reduce((s, m) => s + m.y, 0) / settle.length;
    const held = lockAt !== null ? moves2.slice(lockAt) : [];
    let fistDrift = 0;
    for (const m of held) fistDrift = Math.max(fistDrift, Math.hypot(m.x - baseX, m.y - baseY));
    // captured now, not read at the very end: moves2's listener is never
    // removed, so it would otherwise go on collecting move events fired by
    // the two sessions below too, and report a count that has nothing to do
    // with this replay.
    const fixtureMoveCount = moves2.length;

    // Case: a lock must not go dead. The fixture case above proves the
    // reticle does not JUMP at the instant a fist closes; it does not prove
    // the reticle is still ALIVE afterward. A `lock` that latched
    // permanently -- reasonable-sounding as "freeze the point, it's a
    // trigger" -- would report the exact same near-zero drift on that case,
    // because the real fixture's fisted hand barely moves once held: a
    // frozen reticle and a correctly-tracking one both look "stable" against
    // a hand that isn't going anywhere. So this case moves the hand a LARGE,
    // deliberate distance while still fisted, which the fixture does not
    // contain (checked: palmCentre's x/y range across the two genuine held
    // fists is 52.6/44.3px and 50.0/58.5px, see round 2 of
    // palm-anchor-report.md) -- synthetic frames stand in for fidelity here
    // on purpose, because the point under test is "does tracking resume at
    // all", not "what does a real hand do".
    //
    // The lock itself also fires at a position offset from where the hand
    // settled just before closing (cx 0.5 -> 0.35), a deliberate exaggeration
    // no real palmCentre reading would produce (round 1 measured under
    // 20px for a real closure): it exists purely so that a latch-and-DRAG
    // implementation of lock (as opposed to freeze-and-resume) would show a
    // visibly different number too, not just a frozen one.
    const src3 = makeFakeSource();
    const moves3 = [];
    let lockAt3 = null;
    window.addEventListener('hand:move', (e) => moves3.push(e.detail.x));
    window.addEventListener('hand:lock', () => { if (lockAt3 === null) lockAt3 = moves3.length; });
    const api3 = startHands({ source: src3 });
    await api3.arm();

    for (let i = 0; i < 20; i++) {
      src3.push({ hands: [fistHandAt(1.9, 0.5, 0.5)] }); // open, centred
      await new Promise(r2 => setTimeout(r2, 20));
    }
    src3.push({ hands: [fistHandAt(0.7, 0.35, 0.5)] });  // closes into a fist, one frame
    await new Promise(r2 => setTimeout(r2, 20));
    const leftEdge3 = 0.5 - COMFORT.w / 2;
    // 400 holds (8s of wall time), not a handful: the one-euro filter's
    // minCutoff (0.02Hz, a ~8s time constant) means a step held constant
    // converges slowly on purpose, for tremor suppression -- a first draft
    // of this case used 30 holds and even fully correct tracking only
    // reached 698px of 1000px, nowhere near tight enough to trust. 400
    // holds gets correct tracking within about 50px of the target; it also
    // widens the gap to the buggy shapes instead of closing it, since a
    // persistent offset settles toward ITS OWN wrong asymptote at the same
    // rate, only proportionally further away from the real target.
    for (let i = 0; i < 400; i++) {
      src3.push({ hands: [fistHandAt(0.7, leftEdge3, 0.5)] }); // still fisted, moved far
      await new Promise(r2 => setTimeout(r2, 20));
    }
    const lockThenMoveX = moves3[moves3.length - 1];

    // Case: the dead man's switch must unlatch a grab, not just release it.
    // gestures.js already fires 'release' when tracking is lost mid-pinch;
    // hands.js's own unlatch check runs unconditionally on that event
    // (before the `if (!hands.length) return`), specifically so it still
    // fires on the frame that has no hand at all. If that ordering were
    // ever wrong -- the unlatch moved to after the early return, say -- the
    // stale latch would survive the loss and silently offset every position
    // the NEXT hand produces, in a DIFFERENT room, forever. The grab here
    // also engages away from where the hand had settled (0.5 -> 0.32), and
    // the hand reappears at a third, unrelated position (0.74): a stale
    // latch computes a position built from all three, a correctly cleared
    // one only from the third, and the two land nowhere near each other.
    const src4 = makeFakeSource();
    const moves4 = [];
    window.addEventListener('hand:move', (e) => moves4.push(e.detail.x));
    const api4 = startHands({ source: src4 });
    await api4.arm();

    for (let i = 0; i < 20; i++) {
      src4.push({ hands: [hand(0.9, 1, 0.5, 0.5)] });      // open, centred
      await new Promise(r2 => setTimeout(r2, 20));
    }
    src4.push({ hands: [hand(0.20, 1, 0.32, 0.5)] });      // grabs, one frame, jumped
    await new Promise(r2 => setTimeout(r2, 20));
    for (let i = 0; i < 10; i++) {
      src4.push({ hands: [] });                            // tracking lost, still grabbed
      await new Promise(r2 => setTimeout(r2, 20));
    }
    // 400 holds again, for the same reason as the case above: the filter
    // needs real wall time to converge on the reappeared hand's position
    // rather than sitting wherever it last settled.
    for (let i = 0; i < 400; i++) {
      src4.push({ hands: [hand(0.9, 1, 0.74, 0.5)] });     // a hand reappears, open, elsewhere
      await new Promise(r2 => setTimeout(r2, 20));
    }
    const afterLossX = moves4[moves4.length - 1];

    return {
      sawPresent: seen.some(s => s.n === 'present'),
      moveCount: moves.length,
      lastX: last ? last.d.x : null,
      lastY: last ? last.d.y : null,
      // scoped to the first session only: the disarm/rearm section below
      // deliberately grabs again, in a fresh session, and that second grab
      // is correct, not a defect this count should catch.
      grabs: seen.slice(0, markA).filter(s => s.n === 'grab').length,
      rearmPresent,
      phantomCount: phantom.length,
      W: window.innerWidth, H: window.innerHeight,
      fixtureLockFired: lockAt !== null,
      fixtureMoveCount,
      fixtureFistDrift: fistDrift,
      lockFiredCase3: lockAt3 !== null,
      lockThenMoveX,
      afterLossX,
    };
  });

  const fails = [];
  if (!r.sawPresent) fails.push('no hand:present was dispatched');
  if (!r.moveCount) fails.push('no hand:move was dispatched');
  // The stimulus is pinned exactly at leftEdge, i.e. at bx=0 in the comfort
  // box (leftEdge is DEFINED as the box's left edge), so after the box and
  // the mirror the target fraction is exactly 1.0 and the exact expected
  // pixel is the full viewport width, not "close to" it. The only thing that
  // can move this away from exact is the One Euro filter: it passes its
  // very first sample through unfiltered, and every one of the other 39
  // pushes carries the identical unchanging landmark, so a*x+(1-a)*x stays x
  // for any weight a. Measured deviation is 0 (bit exact); the 2px tolerance
  // below is headroom for floating point noise across engines, not for
  // settling time, since there is nothing here to settle.
  const TOL_X = 2;
  if (r.lastX === null || Math.abs(r.lastX - r.W) > TOL_X) fails.push(`the left edge of the comfort box landed at x=${r.lastX}, wanted ${r.W} (+/-${TOL_X})`);
  if (r.lastY === null || Math.abs(r.lastY - r.H / 2) > r.H * 0.12) fails.push(`a centred hand landed at y=${r.lastY}, wanted about ${r.H / 2}`);
  if (r.grabs !== 1) fails.push(`${r.grabs} grab events for one pinch, wanted exactly 1`);
  if (!r.rearmPresent) fails.push('rearming did not re-announce hand:present (stale present flag survived disarm)');
  if (r.phantomCount) fails.push(`rearming with no hand ever seen this session still fired ${r.phantomCount} release/absent event(s) (stale lastSeen survived disarm)`);
  if (!r.fixtureLockFired) fails.push('the fixture replay (frames 650-760) never fired a lock; the closing motion this case depends on is missing');
  // Measured on this exact replay (palmCentre anchor, latched on grab/lock):
  // fistDrift 9.4px. Swapping hands.js back to the OLD anchor (pinchPoint,
  // with the latch left in place) and rerunning gives 115.2px on the same
  // replay -- proof this budget is tight enough to catch the regression it
  // exists for, not just a number picked to be comfortably large. 30px
  // leaves headroom above the measured 9.4px for setTimeout jitter in the
  // fixture replay's real-time pacing, while staying well under the 115px
  // the old anchor produces.
  const FIST_DRIFT_BUDGET = 30;
  if (r.fixtureFistDrift > FIST_DRIFT_BUDGET) fails.push(`the reticle drifted ${r.fixtureFistDrift.toFixed(1)}px across a real fist closure, wanted under ${FIST_DRIFT_BUDGET}px`);
  if (!r.lockFiredCase3) fails.push('the synthetic lock-then-move case never fired a lock; the state this case depends on is missing');
  // The hand moves all the way to the comfort box's left edge, which (like
  // the very first assertion in this file) maps to the exact far edge of
  // the screen once mirrored: r.W. Measured: correct tracking reads 973.7px
  // (400 holds is not quite full convergence, see the comment above). Proven
  // by temporarily forcing the bug (revert then reapply this fix to redo
  // it): a lock that freezes forever and never resumes reads exactly 500.0px
  // (untouched by the move, since the move never reaches a live reading);
  // a lock that latches-and-drags instead of freeze-then-resume reads
  // 726.9px (converging toward its own offset asymptote at the same rate).
  // Both are hundreds of pixels short of the correct 973.7px, so 50px of
  // tolerance leaves both failure shapes nowhere near passing.
  const LOCK_MOVE_TOL = 50;
  if (Math.abs(r.lockThenMoveX - r.W) > LOCK_MOVE_TOL) fails.push(`after locking then moving the hand across the whole comfort box, the reticle read ${r.lockThenMoveX.toFixed(1)}px, wanted within ${LOCK_MOVE_TOL}px of ${r.W}px (a lock that never resumes tracking would stall well short of this)`);
  // Correct: the reappeared hand is read directly, landing at 0.1 of the
  // comfort box, i.e. ~100px on this 1000px viewport (measured 125.3px,
  // same partial-convergence headroom as above). A latch that survives the
  // loss instead settles toward 0.5 + (0.1 - 0.8) = -0.2, i.e. -200px;
  // measured (by temporarily moving the unlatch check to after the hand
  // presence check, reproducing the exact ordering this line's comment
  // warns against) -172.8px. A 298px gap from the correct answer, far
  // outside the 50px tolerance below.
  const AFTER_LOSS_TARGET = r.W * 0.1;
  const AFTER_LOSS_TOL = 50;
  if (Math.abs(r.afterLossX - AFTER_LOSS_TARGET) > AFTER_LOSS_TOL) fails.push(`after losing tracking mid-grab and a new hand appearing elsewhere, the reticle read ${r.afterLossX.toFixed(1)}px, wanted within ${AFTER_LOSS_TOL}px of ${AFTER_LOSS_TARGET.toFixed(1)}px (a latch that survives the loss would offset this instead)`);
  console.log(`  fixture replay: moves ${r.fixtureMoveCount}   lockFired ${r.fixtureLockFired}   fistDrift ${r.fixtureFistDrift.toFixed(1)}px (budget ${FIST_DRIFT_BUDGET}px)`);
  console.log(`  lock then move: ${r.lockThenMoveX.toFixed(1)}px (wanted ~${r.W}px)   after tracking loss mid-grab: ${r.afterLossX.toFixed(1)}px (wanted ~${AFTER_LOSS_TARGET.toFixed(1)}px)`);
  console.log(`  moves ${r.moveCount}   last (${Math.round(r.lastX)}, ${Math.round(r.lastY)}) of ${r.W}x${r.H}   grabs ${r.grabs}   rearmPresent ${r.rearmPresent}   phantom ${r.phantomCount}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
