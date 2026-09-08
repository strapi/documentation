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
      // cx, cy name where the hand is HELD, i.e. the pinch point, not some
      // unnamed part of the palm. The tips above are placed relative to a
      // nominal centre first; then every landmark is shifted by the delta
      // needed to put the pinch point (the same midpoint of 4 and 8 that
      // gestures.js reads as pinchPoint) exactly at (cx, cy), so a caller's
      // coordinates mean what they say instead of hiding a curl-dependent
      // offset.
      const rawPinch = { x: (L[4].x + L[8].x) / 2, y: (L[4].y + L[8].y) / 2 };
      const dx = cx - rawPinch.x, dy = cy - rawPinch.y;
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
  console.log(`  moves ${r.moveCount}   last (${Math.round(r.lastX)}, ${Math.round(r.lastY)}) of ${r.W}x${r.H}   grabs ${r.grabs}   rearmPresent ${r.rearmPresent}   phantom ${r.phantomCount}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
