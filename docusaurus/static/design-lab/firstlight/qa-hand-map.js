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
  if (errors.length) fails.push('console/page errors: ' + errors.slice(0, 2).join(' | '));
  console.log(`  no teleport on first-ever grab ${r.noTeleportOnFirstEverGrab}   on reentry after absent ${r.noTeleportOnReentryGrab}`);
  console.log(`  snapped ${r.snappedSomething} hud "${r.hudTag}"->"${r.hudTagAfterAbsent}"   drag ${r.txMoved}   zoom in ${r.zoomedIn} (anchor held ${r.anchorHeldOnZoomIn}) out ${r.zoomedOut}   errors ${errors.length}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
