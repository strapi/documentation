/* QA: the map answers the hand. The stage-1 promises:
     - a moving hand snaps the reticle to the nearest chartable body, and the
       HUD names it (and clears it when the hand leaves);
     - a pinched hand dragging moves the camera TARGET, never the camera
       itself, so the world's own damping absorbs the tremor;
     - an open hand's FAN (fingers spread or closed) drives a zoom RATE,
       anchored on the reticle so the body under it stays under it;
     - a brief pinch opens the body under the reticle, the same way a mouse
       click does.
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

    // ── THE FAN, synthetic: zoom anchored on the reticle ────────────────
    // park the reticle over a screen point, note the world point under it
    // (in target-space, since the hand only ever moves targets), feed a
    // sustained FAN rate, and check that point is still there. `rate` is a
    // deflection, not a distance: firstlight.js's own hand:fan listener
    // integrates it over the REAL wall-clock time between events (see its
    // own comment), so this dispatches several events with a real delay
    // between each rather than one single event carrying an extreme value
    // the way the old two-hand `ratio` field allowed.
    fire('move', { x: 900, y: 250 });
    await settle();
    const camAnchor = window.__handProbe.cam();
    const viewCXApprox = 600; // readerOpen() is false with nothing selected, viewport 1200 wide
    const worldAtReticle = (c) => [(900 - viewCXApprox) / c.ts + c.tx, (250 - 400) / c.ts + c.ty];
    const w0 = worldAtReticle(camAnchor);

    const s0 = window.__handProbe.cam().ts;
    for (let i = 0; i < 8; i++) {
      fire('fan', { rate: 0.2 });                 // fingers spread: zoom in
      await new Promise(r2 => setTimeout(r2, 40));
    }
    out.zoomedIn = window.__handProbe.cam().ts > s0;
    const camAfterIn = window.__handProbe.cam();
    const w1 = worldAtReticle(camAfterIn);
    out.anchorHeldOnZoomIn = Math.hypot(w1[0] - w0[0], w1[1] - w0[1]) < 2;

    const s1 = window.__handProbe.cam().ts;
    for (let i = 0; i < 8; i++) {
      fire('fan', { rate: -0.2 });                // fingers closed: zoom out
      await new Promise(r2 => setTimeout(r2, 40));
    }
    out.zoomedOut = window.__handProbe.cam().ts < s1;

    // ── THE FAN, full pipeline, seam included ───────────────────────────
    // Real frames, through a real makeFakeSource, through the real
    // startHands() forwarder, out as real window events, into
    // firstlight.js's real listener, read back from window.__handProbe.
    // This replaces the old two-hand pipeline case: that one proved the
    // `start` flag survived hands.js's generic forwarder (a flag this
    // redesign has no equivalent of -- a continuous rate has no gesture
    // "start" to anchor, which is one of the failure modes item 1 removes
    // entirely, not merely fixes). What this case proves instead is that a
    // real, sustained one-hand FAN -- open then closed -- reaches cam.ts
    // through every hop between a fake camera frame and the world's own
    // target, in both directions.
    {
      const { startHands } = await import('./hand/hands.js');
      const { makeFakeSource } = await import('./hand/source.js');
      // open hand, curl=1: fanRatio ~1.118, clearly past the dead zone's
      // high edge (FAN_NEUTRAL + FAN_DEADZONE = 1.04) -- "fingers spread".
      const openHand = (cx, cy) => {
        const size = 0.20, pinch = 0.9, curl = 1;
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
      // curl=0.5: fanRatio ~0.559, past the dead zone's low edge (0.74),
      // while fistCurl stays ~1.48 (nowhere near FIST_ON=0.95) -- "fingers
      // closed", not a fist.
      const closedHand = (cx, cy) => {
        const size = 0.20, pinch = 0.9, curl = 0.5;
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
      // arm() fires a GLOBAL hand:state 'on' (see hands.js's fire(), which
      // dispatches on window, not scoped to this instance), which is
      // exactly the seam the dedicated dismiss pipeline case below tests --
      // but it means the FIRST arm() call anywhere in this file also opens
      // the hand-control guide, once per session. This case does not care
      // about that dialog, so it is closed the same way a mouse would.
      if (!document.getElementById('guide').hidden) document.getElementById('gd-next').click();

      const p0 = window.__handProbe.cam().ts;
      for (let i = 0; i < 45; i++) {
        src.push({ hands: [openHand(0.5, 0.5)] });
        await new Promise(r2 => setTimeout(r2, 30));
      }
      const p1 = window.__handProbe.cam().ts;

      for (let i = 0; i < 45; i++) {
        src.push({ hands: [closedHand(0.5, 0.5)] });
        await new Promise(r2 => setTimeout(r2, 30));
      }
      const p2 = window.__handProbe.cam().ts;

      api.disarm();

      out.pipelineS0 = p0;
      out.pipelineS1 = p1;
      out.pipelineS2 = p2;
      out.pipelineClimbed = p1 > p0 * 1.05;
      out.pipelineFellBack = p2 < p1 * 0.95;
    }

    // ── A BRIEF PINCH IS A CLICK, full pipeline ──────────────────────────
    // Real frames, through a real makeFakeSource: settle an open hand
    // exactly on QS (this world's own always-pickable "first survey
    // target"), then grab and release quickly, without moving, and check
    // that this world opened exactly that body -- the same `location.hash`
    // a mouse click already sets. The raw landmark position is computed by
    // INVERTING the comfort box and the mirror around QS's CURRENT screen
    // position (via window.__handProbe.starScreen), not a fixed screen
    // point assumed to still be valid: cam.tx/ty/ts have all moved by now,
    // from the drag and fan cases above, so a fixed point would land
    // wherever the camera happens to have drifted to instead of on a body.
    {
      const { startHands, COMFORT } = await import('./hand/hands.js');
      const { makeFakeSource } = await import('./hand/source.js');
      const qsScreen = window.__handProbe.starScreen(window.__handProbe.qs());
      const rawXTarget = qsScreen[0] / window.innerWidth;
      const rawYTarget = qsScreen[1] / window.innerHeight;
      // invert hands.js's own `bx = (p.x - (0.5 - COMFORT.w/2)) / COMFORT.w;
      // rawX = 1 - clamp01(bx)` for x (mirrored) and the equivalent
      // unmirrored form for y.
      const targetCx = (1 - rawXTarget) * COMFORT.w + (0.5 - COMFORT.w / 2);
      const targetCy = rawYTarget * COMFORT.h + (0.5 - COMFORT.h / 2);
      // palmCentre (mean of 0, 5, 9, 17) is shifted to land exactly at
      // (cx, cy) regardless of pinch, the same technique qa-hand-wiring.js
      // uses, so the click's own "did the hand move" measure reads a real
      // zero here, not an artifact of the tips' own placement.
      const handAt = (pinch, cx, cy) => {
        const size = 0.20, curl = 1;
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
        const rawPalm = { x: (L[0].x + L[5].x + L[9].x + L[17].x) / 4,
                           y: (L[0].y + L[5].y + L[9].y + L[17].y) / 4 };
        const dx = cx - rawPalm.x, dy = cy - rawPalm.y;
        for (const p of L) { p.x += dx; p.y += dy; }
        return { landmarks: L, handedness: 'Right' };
      };
      const src = makeFakeSource();
      const api = startHands({ source: src });
      await api.arm();

      for (let i = 0; i < 15; i++) {
        src.push({ hands: [handAt(0.9, targetCx, targetCy)] });  // open, settling
        await new Promise(r2 => setTimeout(r2, 20));
      }
      const snapIdx = window.__handProbe.snapped();
      out.clickSetupSnapped = snapIdx >= 0;
      out.clickSetupSlug = window.__handProbe.slug(snapIdx);
      const beforeHash = location.hash;

      src.push({ hands: [handAt(0.2, targetCx, targetCy)] });  // grab, no movement
      await new Promise(r2 => setTimeout(r2, 60));
      src.push({ hands: [handAt(1.2, targetCx, targetCy)] });  // release, brief, still
      await new Promise(r2 => setTimeout(r2, 80));

      out.clickHashChanged = location.hash !== beforeHash;
      out.clickHashMatches = out.clickSetupSlug ? location.hash === ('#' + out.clickSetupSlug) : false;
      out.clickReaderOpened = !document.getElementById('reader').hidden;

      api.disarm();
    }

    // IMPORTANT (persisted): the hand's zoom bounds must match the world's
    // own (0.06 to 8, see ZLN0/ZLN1 and the wheel handler in firstlight.js),
    // not a separate pair the hand invented. Held via a SUSTAINED extreme
    // rate this time, not a single-event extreme ratio: there is no
    // single-shot input anymore, a rate is integrated over real elapsed
    // time (see firstlight.js's own hand:fan listener), so reaching the
    // clamp needs several events with real delays between them.
    for (let i = 0; i < 15; i++) { fire('fan', { rate: 50 }); await new Promise(r2 => setTimeout(r2, 40)); }
    out.zoomHighClamp = window.__handProbe.cam().ts;
    for (let i = 0; i < 15; i++) { fire('fan', { rate: -50 }); await new Promise(r2 => setTimeout(r2, 40)); }
    out.zoomLowClamp = window.__handProbe.cam().ts;

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
  if (!r.zoomedIn) fails.push('a sustained positive fan rate did not raise the scale target');
  if (!r.anchorHeldOnZoomIn) fails.push('zooming in did not keep the world point under the reticle fixed');
  if (!r.zoomedOut) fails.push('a sustained negative fan rate did not lower the scale target');
  if (!r.pipelineClimbed) fails.push(`full pipeline: a real open hand did not raise the scale (s0 ${r.pipelineS0} -> s1 ${r.pipelineS1})`);
  if (!r.pipelineFellBack) fails.push(`full pipeline: a real closed hand did not lower the scale (s1 ${r.pipelineS1} -> s2 ${r.pipelineS2})`);
  if (Math.abs(r.zoomHighClamp - 8) > 1e-6) fails.push(`a sustained extreme fan rate reached cam.ts=${r.zoomHighClamp}, wanted exactly 8`);
  if (Math.abs(r.zoomLowClamp - 0.06) > 1e-6) fails.push(`a sustained extreme negative fan rate reached cam.ts=${r.zoomLowClamp}, wanted exactly 0.06`);
  if (!r.clickSetupSnapped) fails.push('click test setup problem: the settled hand snapped to nothing');
  if (!r.clickHashChanged) fails.push('a brief pinch over a snapped body did not change location.hash at all');
  if (!r.clickHashMatches) fails.push(`a brief pinch opened ${JSON.stringify(r.clickSetupSlug)}'s slug incorrectly (want '#${r.clickSetupSlug}')`);
  if (!r.clickReaderOpened) fails.push('a brief pinch changed the hash but the reader never opened');
  if (errors.length) fails.push('console/page errors: ' + errors.slice(0, 2).join(' | '));
  console.log(`  no teleport on first-ever grab ${r.noTeleportOnFirstEverGrab}   on reentry after absent ${r.noTeleportOnReentryGrab}`);
  console.log(`  snapped ${r.snappedSomething} hud "${r.hudTag}"->"${r.hudTagAfterAbsent}"   drag ${r.txMoved}   zoom in ${r.zoomedIn} (anchor held ${r.anchorHeldOnZoomIn}) out ${r.zoomedOut}   errors ${errors.length}`);
  console.log(`  full pipeline (source->hands.js->window->world), one-hand fan: s0 ${r.pipelineS0.toFixed(3)}   s1 ${r.pipelineS1.toFixed(3)} (climbed ${r.pipelineClimbed})   s2 ${r.pipelineS2.toFixed(3)} (fell back ${r.pipelineFellBack})`);
  console.log(`  click pipeline: setup snapped ${r.clickSetupSnapped} slug ${JSON.stringify(r.clickSetupSlug)}   hash changed ${r.clickHashChanged}   hash matches ${r.clickHashMatches}   reader opened ${r.clickReaderOpened}`);
  console.log(`  zoom bounds match the world's: high clamp ${r.zoomHighClamp} (want 8)   low clamp ${r.zoomLowClamp} (want 0.06)`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
