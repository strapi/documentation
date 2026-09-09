/* QA: the map answers the hand. The stage-1 promises:
     - a moving hand snaps the reticle to the nearest chartable body, and the
       HUD names it (and clears it when the hand leaves);
     - a pinched hand dragging moves the camera TARGET, never the camera
       itself, so the world's own damping absorbs the tremor;
     - an open hand's FAN (fingers spread or closed) drives a zoom RATE,
       anchored on the reticle so the body under it stays under it;
     - a brief pinch opens the body under the reticle, the same way a mouse
       click does;
     - a swipe of the open hand, while the hand-control arming dialog is
       open, declines it and turns the camera off through the real disarm
       path.
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
  await page.waitForFunction(() => !!window.__hands, { timeout: 15000 });
  await page.waitForTimeout(2000);

  const r = await page.evaluate(async () => {
    const out = {};
    const fire = (n, d) => window.dispatchEvent(new CustomEvent('hand:' + n, { detail: d || {} }));
    const settle = () => new Promise(r2 => setTimeout(r2, 120));
    /* THE HAND-CONTROL GUIDE is shown once per session, and only on a state
       change to 'on'. A case that wants to see it again has to close whatever
       dialog is standing (both guides answer their own NEXT button) and then
       forget every version of the guide's session key. The key carries a
       version and has been bumped once already, when the copy was rewritten
       for the two modes: the cases below cleared the OLD name, silently
       stopped seeing the dialog, and six assertions in this file went on
       passing or failing about the QUICK guide instead. Hence also
       handGuideUp(), which asks WHICH dialog is standing rather than whether
       any is. */
    const closeGuide = () => {
      for (let i = 0; i < 6 && !document.getElementById('guide').hidden; i++) {
        document.getElementById('gd-next').click();
      }
    };
    const clearGuides = () => {
      closeGuide();
      for (const k of Object.keys(sessionStorage)) {
        if (k.indexOf('firstlight.handguide') === 0) sessionStorage.removeItem(k);
      }
    };
    const handGuideUp = () => !document.getElementById('guide').hidden
      && document.getElementById('gd-title').textContent === 'HAND CONTROL';

    /* THE CAMERA EASES toward its target, and every case above moves that
       target. Any case that aims at a body's SCREEN position therefore has to
       wait for the easing to arrive, not for a fixed delay: the zoom case
       before this one takes the target to 4.5 and back, and reading a screen
       position while cam.s is still travelling aims the hand at where the
       body used to be. That is exactly how this case failed once, with the
       pointer settling on the pixel the probe asked for and the world snapping
       to nothing. */
    const cameraStill = async () => {
      for (let i = 0; i < 80; i++) {
        const c = window.__handProbe.cam();
        if (Math.abs(c.s - c.ts) < 1e-3 && Math.abs(c.x - c.tx) < 0.5 && Math.abs(c.y - c.ty) < 0.5) return true;
        await new Promise(r2 => setTimeout(r2, 50));
      }
      return false;
    };
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

    // ── ZOOM, synthetic: anchored on the reticle ────────────────────────
    // park the reticle over a screen point, note the world point under it
    // (in target-space, since the hand only ever moves targets), feed a run
    // of zoom steps, and check that point is still there. `delta` is the
    // CHANGE in the hand's aperture since the last frame, so the world takes
    // one step per event and integrates nothing: unlike the deflection this
    // replaced, no wall-clock delay between events is needed, or meaningful.
    fire('move', { x: 900, y: 250 });
    await settle();
    const camAnchor = window.__handProbe.cam();
    const viewCXApprox = 600; // readerOpen() is false with nothing selected, viewport 1200 wide
    const worldAtReticle = (c) => [(900 - viewCXApprox) / c.ts + c.tx, (250 - 400) / c.ts + c.ty];
    const w0 = worldAtReticle(camAnchor);

    const s0 = window.__handProbe.cam().ts;
    for (let i = 0; i < 8; i++) fire('zoom', { delta: 0.06, x: 900, y: 250 });   // opening: zoom in
    await settle();
    out.zoomedIn = window.__handProbe.cam().ts > s0;
    const camAfterIn = window.__handProbe.cam();
    const w1 = worldAtReticle(camAfterIn);
    out.anchorHeldOnZoomIn = Math.hypot(w1[0] - w0[0], w1[1] - w0[1]) < 2;

    const s1 = window.__handProbe.cam().ts;
    for (let i = 0; i < 8; i++) fire('zoom', { delta: -0.06, x: 900, y: 250 });  // closing: zoom out
    await settle();
    out.zoomedOut = window.__handProbe.cam().ts < s1;

    // ── ZOOM, full pipeline, seam included ──────────────────────────────
    // Real frames, through a real makeFakeSource, through the real
    // startHands() forwarder, out as real window events, into firstlight.js's
    // real listener, read back from window.__handProbe. What it proves is the
    // shape the gesture took on 2026-09-09: a hand that OPENS zooms in and a
    // hand that CLOSES zooms out, from the aperture's frame-to-frame change,
    // in zoom mode, through every hop between a fake camera frame and the
    // world's own target. The absolute version this replaced read backwards
    // to the owner, because opening a closed hand spends the first half of
    // the movement below the neutral aperture.
    {
      const { startHands } = await import('./hand/hands.js');
      const { makeFakeSource } = await import('./hand/source.js');
      // one hand, at a given aperture: `curl` scales the finger tips, so
      // fanRatio (index tip to pinky tip over hand size) follows it almost
      // linearly. curl 0.55 is fingers together, 1.15 is spread; fistCurl
      // stays around 1.5 throughout, nowhere near FIST_ON=0.95, so this is
      // never read as a fist, and pinch=0.9 keeps it unpinched.
      const handAt = (curl, cx, cy) => {
        const size = 0.20, pinch = 0.9;
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
      // dispatches on window, not scoped to this instance), which is exactly
      // the seam the dedicated dismiss pipeline case below tests -- but it
      // means the FIRST arm() call anywhere in this file also opens the
      // hand-control guide, once per session. This case does not care about
      // that dialog, so it is answered the way a mouse would answer it.
      closeGuide();
      await settle();

      const sweep = async (from, to, steps) => {
        for (let i = 0; i <= steps; i++) {
          src.push({ hands: [handAt(from + (to - from) * (i / steps), 0.5, 0.5)] });
          await new Promise(r2 => setTimeout(r2, 30));
        }
      };
      await sweep(0.55, 0.55, 2);                 // settle: the first aperture only arms the delta
      const p0 = window.__handProbe.cam().ts;
      await sweep(0.55, 1.15, 14);                // the hand opens
      const p1 = window.__handProbe.cam().ts;
      await sweep(1.15, 0.55, 14);                // and closes again
      const p2 = window.__handProbe.cam().ts;

      api.destroy();

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
      out.clickCameraStill = await cameraStill();
      const qsScreen = window.__handProbe.starScreen(window.__handProbe.qs());
      // kept in the output because the last two investigations of this case
      // both began by asking where the body actually was on screen
      out.clickSetupQsScreen = qsScreen;
      out.clickSetupCam = window.__handProbe.cam();
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
      closeGuide();   // this case is not about the dialog, and a dialog owns the hand

      let lastMove = null;
      const watchMove = (e) => { lastMove = e.detail; };
      window.addEventListener('hand:move', watchMove);
      for (let i = 0; i < 15; i++) {
        src.push({ hands: [handAt(0.9, targetCx, targetCy)] });  // open, settling
        await new Promise(r2 => setTimeout(r2, 20));
      }
      window.removeEventListener('hand:move', watchMove);
      // where the pointer actually settled, kept for the same reason as the
      // body's position above
      out.clickSettledAt = lastMove ? [Math.round(lastMove.x), Math.round(lastMove.y)] : null;
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
    // the pipeline case above ended in destroy(), which fires hand:absent,
    // and the world forgets the hand's position on absent -- zoom refuses to
    // act on a position nobody has observed, so re-establish one first
    fire('present');
    fire('move', { x: 600, y: 400 });
    await settle();
    for (let i = 0; i < 30; i++) fire('zoom', { delta: 0.5, x: 600, y: 400 });
    await settle();
    out.zoomHighClamp = window.__handProbe.cam().ts;
    for (let i = 0; i < 60; i++) fire('zoom', { delta: -0.5, x: 600, y: 400 });
    await settle();
    out.zoomLowClamp = window.__handProbe.cam().ts;

    // ── THE SWIPE DECLINES THE HAND-CONTROL GUIDE, full pipeline ─────────
    // The seam this crosses is the deepest one this project has: the
    // recogniser (gestures.js) -> the forwarder (hands.js) -> a real
    // window event -> firstlight.js's own listener, which reads it as
    // decline ONLY while its dialog has focus -> the button's own disarm()
    // path (window.__hands.disarm()) -> the source reporting 'off'. Its own
    // storage key is cleared first so the dialog is guaranteed to show
    // regardless of what earlier cases in this file already armed.
    {
      clearGuides();
      const { startHands } = await import('./hand/hands.js');
      const { makeFakeSource } = await import('./hand/source.js');
      const src = makeFakeSource();
      const api = startHands({ source: src });
      // window.__hands is exactly what declineHandGuide() in firstlight.js
      // calls disarm() on: pointing it at this fake-source instance tests
      // the real wiring (gestures.js -> hands.js -> firstlight.js's guide
      // logic -> disarm()) without fighting a real camera in headless
      // Chromium. The real camera teardown itself (every track stopped, a
      // genuine MediaStreamTrack reaching 'ended') is already proven
      // end-to-end in qa-hand-source.js; re-proving it here would not add
      // confidence in the part this case actually exists to check.
      window.__hands = api;
      await api.arm();                                          // fires hand:state 'on' -> maybeHandGuide()
      await new Promise(r2 => setTimeout(r2, 60));
      out.guideShownOnArm = handGuideUp();

      // a real hand, open, moving steadily OUTWARD for a Right hand: raw x
      // DECREASING (hands.js mirrors x for display), well past SWIPE_SPEED
      // for well more than SWIPE_FRAMES.
      const openHandAt = (cx, cy) => {
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
      // A DELIBERATE swipe, at the amplitude the owner described: with
      // size=0.20, six steps of -0.07 cover 2.1 hand widths, several times
      // SWIPE_DIST inside one SWIPE_WINDOW. The earlier version of this case
      // moved 0.03 a frame, 0.9 of a hand width in total, which is close
      // enough to the threshold that the real wall-clock intervals here
      // decided whether it fired: it passed under the old per-frame rule and
      // failed under the new displacement one, for no reason to do with
      // either. A test of a gesture has to model the gesture, not the bar.
      let cx = 0.70;
      src.push({ hands: [openHandAt(cx, 0.5)] });
      await new Promise(r2 => setTimeout(r2, 30));
      for (let i = 0; i < 6; i++) {
        cx -= 0.07;
        src.push({ hands: [openHandAt(cx, 0.5)] });
        await new Promise(r2 => setTimeout(r2, 30));
      }
      await new Promise(r2 => setTimeout(r2, 60));

      out.guideHiddenAfterSwipe = document.getElementById('guide').hidden;
      out.cameraOffAfterSwipe = api.state() === 'off';
    }

    // ── THE DIALOG OWNS THE HAND ─────────────────────────────
    // The arming dialog is a surface with focus, and a surface with focus
    // owns the hand: while it waits for its answer, its own two gestures are
    // the only live ones and the chart behind it is frozen. Its first
    // version was driving the map while still asking whether the visitor
    // wanted a hand at all ("c'est un gros probleme"), because the capture
    // rule was written on exactly one of the world's six hand listeners,
    // hand:click, and the other five never heard about it. This case tests
    // the rule where it actually has to hold: on the camera targets.
    {
      clearGuides();
      const { startHands } = await import('./hand/hands.js');
      const { makeFakeSource } = await import('./hand/source.js');
      const api = startHands({ source: makeFakeSource() });
      window.__hands = api;
      await api.arm();
      await new Promise(r2 => setTimeout(r2, 60));
      out.captureGuideShown = handGuideUp();

      // the click case above left a body open, and opening one eases the
      // camera: let that finish before measuring what is meant to be a
      // camera at rest, or the drift would be read as a broken freeze.
      location.hash = '';
      await new Promise(r2 => setTimeout(r2, 1500));

      const before = window.__handProbe.cam();
      fire('present');
      fire('move', { x: 600, y: 400 });
      await settle();
      fire('grab');
      fire('move', { x: 980, y: 220 });          // a drag, if anything were listening
      await settle();
      for (let i = 0; i < 6; i++) { fire('fan', { rate: 0.35 }); await new Promise(r2 => setTimeout(r2, 40)); }
      fire('release');
      await settle();
      const during = window.__handProbe.cam();
      out.captureFrozenPan = Math.abs(during.tx - before.tx) < 1e-6 && Math.abs(during.ty - before.ty) < 1e-6;
      out.captureFrozenZoom = Math.abs(during.ts - before.ts) < 1e-6;
      out.captureStillOpen = handGuideUp();

      // and the capture LIFTS on the answer: the same events, once the
      // dialog has been confirmed by its own gesture, do reach the chart.
      fire('click');                              // a brief pinch = CONFIRM
      await settle();
      out.captureLiftedOnConfirm = document.getElementById('guide').hidden;
      fire('move', { x: 600, y: 400 });
      await settle();
      fire('grab');
      fire('move', { x: 980, y: 220 });
      await settle();
      const after = window.__handProbe.cam();
      out.captureThawedPan = Math.abs(after.tx - during.tx) > 1;
      fire('release'); fire('absent');
      api.disarm();
    }

    // ── BOTH ANSWERS, BY MOUSE ────────────────────────────────────────
    // Nothing in this project may be reachable only by gesture: the same
    // two answers the swipe and the pinch give must also be one click each,
    // on the two real buttons the dialog already has (#gd-next = CONFIRM,
    // #gd-skip = TURN OFF CAMERA). Two fresh, independent sessions, so
    // mouse-confirm and mouse-decline are proven apart from each other, not
    // just as two assertions on the same run.
    {
      clearGuides();
      const { startHands } = await import('./hand/hands.js');
      const { makeFakeSource } = await import('./hand/source.js');
      const src = makeFakeSource();
      const api = startHands({ source: src });
      window.__hands = api;
      await api.arm();
      await new Promise(r2 => setTimeout(r2, 60));
      out.mouseConfirmGuideShown = handGuideUp();
      document.getElementById('gd-next').click();                 // CONFIRM, by mouse
      out.mouseConfirmGuideHidden = document.getElementById('guide').hidden;
      out.mouseConfirmCameraStillOn = api.state() === 'on';        // confirming must NOT disarm
      api.disarm();
    }
    {
      // no sessionStorage.removeItem here: maybeHandGuide() itself must
      // show the dialog freshly for THIS session regardless (a brand new
      // startHands/makeFakeSource pair, exactly as a real second visit
      // would be), which is also why this case waits for the click to have
      // an effect rather than assuming session state from the case above.
      clearGuides();
      const { startHands } = await import('./hand/hands.js');
      const { makeFakeSource } = await import('./hand/source.js');
      const src = makeFakeSource();
      const api = startHands({ source: src });
      window.__hands = api;
      await api.arm();
      await new Promise(r2 => setTimeout(r2, 60));
      out.mouseDeclineGuideShown = handGuideUp();
      document.getElementById('gd-skip').click();                 // TURN OFF CAMERA, by mouse
      await new Promise(r2 => setTimeout(r2, 30));
      out.mouseDeclineGuideHidden = document.getElementById('guide').hidden;
      out.mouseDeclineCameraOff = api.state() === 'off';           // declining MUST disarm
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
  if (!r.zoomedIn) fails.push('a run of opening steps did not raise the scale target');
  if (!r.anchorHeldOnZoomIn) fails.push('zooming in did not keep the world point under the reticle fixed');
  if (!r.zoomedOut) fails.push('a run of closing steps did not lower the scale target');
  if (!r.pipelineClimbed) fails.push(`full pipeline: a real open hand did not raise the scale (s0 ${r.pipelineS0} -> s1 ${r.pipelineS1})`);
  if (!r.pipelineFellBack) fails.push(`full pipeline: a real closed hand did not lower the scale (s1 ${r.pipelineS1} -> s2 ${r.pipelineS2})`);
  if (Math.abs(r.zoomHighClamp - 8) > 1e-6) fails.push(`a sustained run of opening steps reached cam.ts=${r.zoomHighClamp}, wanted exactly 8`);
  if (Math.abs(r.zoomLowClamp - 0.06) > 1e-6) fails.push(`a sustained run of closing steps reached cam.ts=${r.zoomLowClamp}, wanted exactly 0.06`);
  if (!r.clickCameraStill) fails.push('click test setup problem: the camera never stopped easing, so no screen position was stable to aim at');
  if (!r.clickSetupSnapped) fails.push('click test setup problem: the settled hand snapped to nothing');
  if (!r.clickHashChanged) fails.push('a brief pinch over a snapped body did not change location.hash at all');
  if (!r.clickHashMatches) fails.push(`a brief pinch opened ${JSON.stringify(r.clickSetupSlug)}'s slug incorrectly (want '#${r.clickSetupSlug}')`);
  if (!r.clickReaderOpened) fails.push('a brief pinch changed the hash but the reader never opened');
  if (!r.guideShownOnArm) fails.push('the hand-control guide did not appear when the camera armed');
  if (!r.guideHiddenAfterSwipe) fails.push('a qualifying swipe did not close the hand-control guide');
  if (!r.cameraOffAfterSwipe) fails.push('declining the hand-control guide by swipe did not disarm the camera (the trust bug)');
  if (!r.captureGuideShown) fails.push('capture test setup problem: the guide did not appear on arm');
  if (!r.captureFrozenPan) fails.push('the map panned while the arming dialog was still waiting for its answer');
  if (!r.captureFrozenZoom) fails.push('the map zoomed while the arming dialog was still waiting for its answer');
  if (!r.captureStillOpen) fails.push('the arming dialog closed on a gesture that is not one of its two answers');
  if (!r.captureLiftedOnConfirm) fails.push('a brief pinch did not confirm the arming dialog');
  if (!r.captureThawedPan) fails.push('the hand still could not drag the map after the dialog was answered');
  if (!r.mouseConfirmGuideShown) fails.push('mouse-confirm test setup problem: the guide did not appear on arm');
  if (!r.mouseConfirmGuideHidden) fails.push('clicking CONFIRM (#gd-next) did not close the hand-control guide');
  if (!r.mouseConfirmCameraStillOn) fails.push('clicking CONFIRM disarmed the camera; confirming must leave it on');
  if (!r.mouseDeclineGuideShown) fails.push('mouse-decline test setup problem: the guide did not appear on arm');
  if (!r.mouseDeclineGuideHidden) fails.push('clicking TURN OFF CAMERA (#gd-skip) did not close the hand-control guide');
  if (!r.mouseDeclineCameraOff) fails.push('clicking TURN OFF CAMERA did not disarm the camera (the trust bug, by mouse this time)');
  if (errors.length) fails.push('console/page errors: ' + errors.slice(0, 2).join(' | '));
  console.log(`  no teleport on first-ever grab ${r.noTeleportOnFirstEverGrab}   on reentry after absent ${r.noTeleportOnReentryGrab}`);
  console.log(`  snapped ${r.snappedSomething} hud "${r.hudTag}"->"${r.hudTagAfterAbsent}"   drag ${r.txMoved}   zoom in ${r.zoomedIn} (anchor held ${r.anchorHeldOnZoomIn}) out ${r.zoomedOut}   errors ${errors.length}`);
  console.log(`  full pipeline (source->hands.js->window->world), aperture sweep: s0 ${r.pipelineS0.toFixed(3)}   s1 ${r.pipelineS1.toFixed(3)} (climbed ${r.pipelineClimbed})   s2 ${r.pipelineS2.toFixed(3)} (fell back ${r.pipelineFellBack})`);
  console.log(`  click pipeline: QS at ${r.clickSetupQsScreen.map(Math.round).join(',')} pointer at ${JSON.stringify(r.clickSettledAt)} cam ts ${r.clickSetupCam.ts.toFixed(2)} tx ${Math.round(r.clickSetupCam.tx)} ty ${Math.round(r.clickSetupCam.ty)}`);
  console.log(`  click pipeline: setup snapped ${r.clickSetupSnapped} slug ${JSON.stringify(r.clickSetupSlug)}   hash changed ${r.clickHashChanged}   hash matches ${r.clickHashMatches}   reader opened ${r.clickReaderOpened}`);
  console.log(`  zoom bounds match the world's: high clamp ${r.zoomHighClamp} (want 8)   low clamp ${r.zoomLowClamp} (want 0.06)`);
  console.log(`  dismiss pipeline: guide shown on arm ${r.guideShownOnArm}   guide hidden after swipe ${r.guideHiddenAfterSwipe}   camera off after swipe ${r.cameraOffAfterSwipe}`);
  console.log(`  the dialog owns the hand: frozen pan ${r.captureFrozenPan}   frozen zoom ${r.captureFrozenZoom}   stayed open ${r.captureStillOpen}   thawed on confirm ${r.captureThawedPan}`);
  console.log(`  both answers by mouse: confirm hides guide ${r.mouseConfirmGuideHidden} camera stays on ${r.mouseConfirmCameraStillOn}   decline hides guide ${r.mouseDeclineGuideHidden} camera off ${r.mouseDeclineCameraOff}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
