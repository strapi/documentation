/* QA: the map answers the hand. The three stage-1 promises:
     - a moving hand snaps the reticle to the nearest chartable body, and the
       HUD names it (and clears it when the hand leaves);
     - a pinched hand dragging moves the camera TARGET, never the camera
       itself, so the world's own damping absorbs the tremor;
     - two pinched hands moving apart raise the scale target, and together
       lower it, anchored on the reticle so the body under it stays under it.
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
    const tag = () => { const e = document.getElementById('hand-reticle'); return e ? e.querySelector('.hr-tag').textContent : null; };
    const snappedClass = () => { const e = document.getElementById('hand-reticle'); return !!e && e.classList.contains('snapped'); };

    // C3, part 1: a hand that enters the frame ALREADY pinched, before this
    // world has ever seen a hand:move, must not compute a drag delta from
    // the (0, 0) placeholder handX/handY carry before any real position is
    // observed. present, grab and move all arrive in the same batch here,
    // exactly as they do in one real inference frame.
    const beforeAnyMove = window.__handProbe.cam();
    fire('present');
    fire('grab');
    fire('move', { x: 900, y: 250 });
    await settle();
    const afterFirstEverGrab = window.__handProbe.cam();
    out.noTeleportOnFirstEverGrab = Math.abs(afterFirstEverGrab.tx - beforeAnyMove.tx) < 1
      && Math.abs(afterFirstEverGrab.ty - beforeAnyMove.ty) < 1;
    fire('release'); fire('absent');

    fire('present');
    fire('move', { x: 600, y: 400 });
    await settle();
    out.snappedSomething = window.__handProbe.snapped() >= 0;
    // the HUD is the only consumer of setSnapped besides this world, and
    // nothing else exercises it: read the DOM it writes to.
    out.hudTag = tag();
    out.hudTagNonEmpty = !!out.hudTag;
    out.hudSnappedClass = snappedClass();

    fire('absent');
    await settle();
    out.hudTagAfterAbsent = tag();
    out.hudClearedOnAbsent = out.hudTagAfterAbsent === '' && !snappedClass();

    // C3, part 2: the same defect recurs after every hand:absent, not just
    // on the very first frame this world ever sees -- a hand that left and
    // comes back already pinched must not teleport either.
    const beforeReentryGrab = window.__handProbe.cam();
    fire('present');
    fire('grab');
    fire('move', { x: 150, y: 700 });
    await settle();
    const afterReentryGrab = window.__handProbe.cam();
    out.noTeleportOnReentryGrab = Math.abs(afterReentryGrab.tx - beforeReentryGrab.tx) < 1
      && Math.abs(afterReentryGrab.ty - beforeReentryGrab.ty) < 1;
    fire('release'); fire('absent');

    fire('present');
    fire('move', { x: 600, y: 400 });
    await settle();

    const before = window.__handProbe.cam();
    fire('grab');
    fire('move', { x: 400, y: 400 });
    fire('move', { x: 300, y: 400 });
    await settle();
    const during = window.__handProbe.cam();
    out.txMoved = Math.abs(during.tx - before.tx) > 1;
    // the target moved; the actual position must still be catching up to it
    // (the 0.13-per-frame easing cannot close a 300+ unit gap in 120ms), not
    // have jumped there directly the way the mouse-drag handler does. A
    // gap-based threshold, not an inequality that a same-frame instant
    // assignment could also satisfy trivially.
    out.gapAfterDrag = Math.abs(during.tx - during.x);
    out.drivesTargetNotPosition = out.gapAfterDrag > 10;
    fire('release');

    // zoom anchored on the reticle: park the reticle over a screen point,
    // note the world point under it (in target-space, since the hand only
    // ever moves targets), spread, and check that point is still there.
    fire('move', { x: 900, y: 250 });
    await settle();
    const camAnchor = window.__handProbe.cam();
    const viewCXApprox = 600; // readerOpen() is false with nothing selected, viewport 1200 wide
    const worldAtReticle = (c) => [(900 - viewCXApprox) / c.ts + c.tx, (250 - 400) / c.ts + c.ty];
    const w0 = worldAtReticle(camAnchor);

    const s0 = window.__handProbe.cam().ts;
    for (let i = 1; i <= 8; i++) fire('spread', { ratio: 1 + i * 0.06 });
    await settle();
    out.zoomedIn = window.__handProbe.cam().ts > s0;
    const camAfterIn = window.__handProbe.cam();
    const w1 = worldAtReticle(camAfterIn);
    out.anchorHeldOnZoomIn = Math.hypot(w1[0] - w0[0], w1[1] - w0[1]) < 2;

    const s1 = window.__handProbe.cam().ts;
    for (let i = 1; i <= 8; i++) fire('spread', { ratio: 1 - i * 0.05 });
    await settle();
    out.zoomedOut = window.__handProbe.cam().ts < s1;

    // IMPORTANT 1, consumption side: this world must honor the `start` flag
    // hand/gestures.js now sends, not re-anchor on some timer of its own (the
    // old bug) or on every event regardless of the flag. ratio:1 with
    // start:false must return to exactly the scale from BEFORE this block,
    // since it continues relative to the anchor the preceding start:true
    // event captured -- not to a leftover anchor from long before, which is
    // what it would read if `start` were ignored entirely.
    const sBeforeAnchorTest = window.__handProbe.cam().ts;
    fire('spread', { ratio: 2, start: true });
    await settle();
    fire('spread', { ratio: 1, start: false });
    await settle();
    const sAfterAnchorTest = window.__handProbe.cam().ts;
    out.startFlagRespected = Math.abs(sAfterAnchorTest - sBeforeAnchorTest) < 1e-6;

    // FIX ROUND: the full pipeline, seam included. Every spread-related test
    // above either drives hand/gestures.js directly (qa-hand-gestures.js) or
    // dispatches synthetic hand:spread events straight onto window (every
    // case in this file so far), which is why hand/hands.js's forwarder
    // dropping `start` went uncaught: none of them cross hands.js's own
    // re-dispatch. This one does: real frames, through a real makeFakeSource,
    // through the real startHands() forwarder, out as real window events,
    // into firstlight.js's real listeners, read back from window.__handProbe.
    // A real 400ms pause is used, not a synthetic `t`, since SPREAD_GAP_MS is
    // measured in gestures.js against the reader's own clock.
    {
      const { startHands } = await import('./hand/hands.js');
      const { makeFakeSource } = await import('./hand/source.js');
      const pinchedHand = (cx, cy) => {
        const size = 0.20, pinch = 0.20, curl = 1;
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
        return { landmarks: L, handedness: 'Right' };
      };
      const src = makeFakeSource();
      const api = startHands({ source: src });
      await api.arm();

      const p0 = window.__handProbe.cam().ts;

      // gesture 1: two pinched hands drifting apart over several real frames
      for (let i = 0; i <= 6; i++) {
        const d = 0.15 + i * 0.03;
        src.push({ hands: [pinchedHand(0.5 - d, 0.5), pinchedHand(0.5 + d, 0.5)] });
        await new Promise(r2 => setTimeout(r2, 30));
      }
      const p1 = window.__handProbe.cam().ts;

      // a real pause, well past SPREAD_GAP_MS (220ms): nothing pushed at all
      await new Promise(r2 => setTimeout(r2, 400));

      // gesture 2: a fresh two-hand pinch at a distinct starting distance.
      // Its first frame carries start:true from gestures.js; the assertion
      // is that this survives the forwarder all the way to firstlight.js.
      src.push({ hands: [pinchedHand(0.5 - 0.12, 0.5), pinchedHand(0.5 + 0.12, 0.5)] });
      await new Promise(r2 => setTimeout(r2, 60));
      const p2 = window.__handProbe.cam().ts;

      api.disarm();

      out.pipelineS0 = p0;
      out.pipelineS1 = p1;
      out.pipelineS2 = p2;
      out.pipelineClimbed = p1 > p0 + 0.01;
      out.pipelineNoSnapBack = Math.abs(p2 - p1) < 0.05;
    }

    return out;
  });

  const fails = [];
  if (!r.noTeleportOnFirstEverGrab) fails.push('a hand entering already pinched, before any move was ever seen, teleported the camera');
  if (!r.noTeleportOnReentryGrab) fails.push('a hand re-entering already pinched after hand:absent teleported the camera');
  if (!r.snappedSomething) fails.push('a hand over the chart snapped to nothing');
  if (!r.hudTagNonEmpty) fails.push('the HUD did not report a label for the snapped body');
  if (!r.hudSnappedClass) fails.push('the HUD reticle did not carry the snapped class');
  if (!r.hudClearedOnAbsent) fails.push('the HUD kept its label after the hand left, got ' + JSON.stringify(r.hudTagAfterAbsent));
  if (!r.txMoved) fails.push('a pinched drag did not move the camera target');
  if (!r.drivesTargetNotPosition) fails.push('the hand set the camera position directly instead of its target');
  if (!r.zoomedIn) fails.push('two hands moving apart did not raise the scale target');
  if (!r.anchorHeldOnZoomIn) fails.push('zooming in did not keep the world point under the reticle fixed');
  if (!r.zoomedOut) fails.push('two hands moving together did not lower the scale target');
  if (!r.startFlagRespected) fails.push('a spread event without start:true re-anchored the zoom base instead of continuing from it');
  if (!r.pipelineClimbed) fails.push(`full pipeline: gesture 1 did not raise the scale (s0 ${r.pipelineS0} -> s1 ${r.pipelineS1})`);
  if (!r.pipelineNoSnapBack) fails.push(`full pipeline: gesture 2's first frame snapped the scale back (s1 ${r.pipelineS1} -> s2 ${r.pipelineS2}, s0 was ${r.pipelineS0})`);
  if (errors.length) fails.push('console/page errors: ' + errors.slice(0, 2).join(' | '));
  console.log(`  no teleport on first-ever grab ${r.noTeleportOnFirstEverGrab}   on reentry after absent ${r.noTeleportOnReentryGrab}`);
  console.log(`  snapped ${r.snappedSomething} hud "${r.hudTag}"->"${r.hudTagAfterAbsent}"   drag ${r.txMoved}   zoom in ${r.zoomedIn} (anchor held ${r.anchorHeldOnZoomIn}) out ${r.zoomedOut}   start flag respected ${r.startFlagRespected}   errors ${errors.length}`);
  console.log(`  full pipeline (source->hands.js->window->world): s0 ${r.pipelineS0.toFixed(3)}   s1 ${r.pipelineS1.toFixed(3)} (climbed ${r.pipelineClimbed})   s2 after 400ms pause ${r.pipelineS2.toFixed(3)} (no snap-back ${r.pipelineNoSnapBack})`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
