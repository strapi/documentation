/* QA: the camera source. The assertions are about RESTRAINT and TEARDOWN,
   which are the two things that lose a user's trust:
     - nothing at all is fetched before the arming click, so a visitor who
       never arms it pays nothing and is never asked for a camera;
     - disarming stops every track, so the camera indicator light goes out,
       even when disarm() lands in the middle of a still-loading arm();
     - a landmarker that got built but never gets to run is closed, not
       leaked, and repeated arm/disarm cycles do not re-fetch or pile up
       landmarker instances.
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
  const fails = [];

  // --- page 1: the original, untouched probes. Real network, real (absent)
  // camera. No mocking, so this is the only page that proves the dynamic
  // import truly waits for the arming click on a stock browser.
  const page = await ctx.newPage();
  const requested = [];
  page.on('request', r => { const u = r.url(); if (/mediapipe|\.wasm|\.task/.test(u)) requested.push(u); });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

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

  // --- page 2: the abort contract. Headless Chromium has no camera to
  // refuse or grant on demand, and the real CDN cannot be paused mid-flight,
  // so this page replaces both the dynamic import and getUserMedia with
  // stand-ins the driver controls step by step. This proves the CONTRACT
  // (a pending arm() aborted by disarm() never reaches 'on'; a stream or
  // landmarker already acquired at the moment of the abort is torn down;
  // a later arm() still works; the import and a replaced landmarker are
  // not re-fetched/re-leaked) against a stand-in, not against real hardware.
  // See the report for exactly what this does and does not prove.
  let fetchCount = 0;
  const page2 = await ctx.newPage();
  await page2.route((u) => u.href.endsWith('/vision_bundle.mjs'), (route) => {
    fetchCount++;
    route.fulfill({
      status: 200,
      contentType: 'text/javascript',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: `
        export const FilesetResolver = { forVisionTasks: (b) => window.__qa.filesetResolver(b) };
        export const HandLandmarker = { createFromOptions: (f, o) => window.__qa.createLandmarker(f, o) };
      `,
    });
  });
  await page2.addInitScript(() => {
    function deferred() {
      let resolve, reject;
      const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
      return { promise, resolve, reject };
    }
    window.__qa = { counts: { files: 0, landmarker: 0, gum: 0 }, pending: {} };
    window.__qa.filesetResolver = () => {
      window.__qa.counts.files++;
      window.__qa.pending.files = deferred();
      return window.__qa.pending.files.promise;
    };
    window.__qa.createLandmarker = () => {
      window.__qa.counts.landmarker++;
      window.__qa.pending.landmarker = deferred();
      return window.__qa.pending.landmarker.promise;
    };
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = () => {
        window.__qa.counts.gum++;
        window.__qa.pending.gum = deferred();
        return window.__qa.pending.gum.promise;
      };
    }
    // proof that an aborted cycle never leaves a detection loop running: the
    // page's own ambient animation (the starfield, the HUD reticle) already
    // calls requestAnimationFrame continuously, so a raw call COUNT is
    // useless here, it never reads zero. Track DISTINCT callback identities
    // instead: source.js's internal loop() is a fresh closure created once
    // per makeCameraSource(), so it is a brand-new identity the first (and
    // only the first) time this source ever schedules it, unlike the
    // ambient loops, which keep re-registering the same reference.
    const rawRaf = window.requestAnimationFrame.bind(window);
    window.__qa.seen = new Set();
    window.__qa.newCallbackCount = 0;
    window.requestAnimationFrame = (cb) => {
      if (!window.__qa.seen.has(cb)) { window.__qa.seen.add(cb); window.__qa.newCallbackCount++; }
      return rawRaf(cb);
    };
  });
  await page2.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
  await page2.evaluate(async () => {
    const { makeCameraSource } = await import('./hand/source.js');
    window.__src = makeCameraSource();
  });
  // let the page's own ambient animation register its steady-state callbacks
  // before measuring, so the baseline below is not still climbing on its own
  await page2.waitForTimeout(300);
  const ambientBaseline = await page2.evaluate(() => window.__qa.newCallbackCount);

  const waitForCount = (key, n) => page2.waitForFunction(
    (arg) => window.__qa.counts[arg.key] >= arg.n, { key, n },
  );

  // cycle 1: abort while the landmarker is still being built. At the moment
  // disarm() runs, the landmarker this cycle is building does not exist
  // anywhere disarm() can reach: it is only inside the pending promise. If
  // arm() does not close it itself when it notices the abort, it leaks
  // silently and this assertion is the only thing that would ever catch it.
  await page2.evaluate(() => { window.__armPromise = window.__src.arm(); });
  await waitForCount('files', 1);
  await page2.evaluate(() => window.__qa.pending.files.resolve({}));
  await waitForCount('landmarker', 1);
  const stateWhileBuildingLandmarker = await page2.evaluate(() => window.__src.state());
  await page2.evaluate(() => window.__src.disarm());
  const stateRightAfterDisarm1 = await page2.evaluate(() => window.__src.state());
  await page2.evaluate(() => {
    window.__l1 = { closeCalls: 0 };
    window.__l1.close = () => { window.__l1.closeCalls++; };
    window.__l1.detectForVideo = () => null;
    window.__qa.pending.landmarker.resolve(window.__l1);
  });
  await page2.evaluate(() => window.__armPromise);
  const afterCycle1 = await page2.evaluate(() => ({
    state: window.__src.state(),
    l1CloseCalls: window.__l1.closeCalls,
    gumCalls: window.__qa.counts.gum,
    newCallbackCount: window.__qa.newCallbackCount,
  }));

  if (stateWhileBuildingLandmarker !== 'loading') fails.push(`cycle 1: state was "${stateWhileBuildingLandmarker}" while the landmarker was building, wanted "loading"`);
  if (stateRightAfterDisarm1 !== 'off') fails.push(`cycle 1: state was "${stateRightAfterDisarm1}" immediately after disarm(), wanted "off"`);
  if (afterCycle1.state !== 'off') fails.push(`cycle 1: state settled to "${afterCycle1.state}" after the aborted arm() resolved, wanted "off"`);
  if (afterCycle1.l1CloseCalls !== 1) fails.push(`cycle 1: the abandoned landmarker was closed ${afterCycle1.l1CloseCalls} times, wanted 1`);
  if (afterCycle1.gumCalls !== 0) fails.push(`cycle 1: getUserMedia was called ${afterCycle1.gumCalls} times after an abort during landmarker creation, wanted 0`);
  if (afterCycle1.newCallbackCount !== ambientBaseline) fails.push(`cycle 1: a new requestAnimationFrame callback appeared (source's own loop scheduled) on an aborted cycle, wanted none`);

  // cycle 2: abort while getUserMedia is pending. This is the exact bug:
  // the camera promise resolves AFTER disarm() has already run and found
  // no stream to stop. The resolved stream must still get every track
  // stopped, and the source must still end up 'off', not 'on'.
  await page2.evaluate(() => { window.__armPromise = window.__src.arm(); });
  await waitForCount('files', 2);
  await page2.evaluate(() => window.__qa.pending.files.resolve({}));
  await waitForCount('landmarker', 2);
  await page2.evaluate(() => {
    window.__l2 = { closeCalls: 0 };
    window.__l2.close = () => { window.__l2.closeCalls++; };
    window.__l2.detectForVideo = () => null;
    window.__qa.pending.landmarker.resolve(window.__l2);
  });
  await waitForCount('gum', 1);
  const stateWhileGumPending = await page2.evaluate(() => window.__src.state());
  await page2.evaluate(() => window.__src.disarm());
  const stateRightAfterDisarm2 = await page2.evaluate(() => window.__src.state());
  await page2.evaluate(() => {
    window.__t1 = { stopped: false };
    window.__t1.stop = () => { window.__t1.stopped = true; };
    window.__t2 = { stopped: false };
    window.__t2.stop = () => { window.__t2.stopped = true; };
    window.__fakeStream2 = { getTracks: () => [window.__t1, window.__t2] };
    window.__qa.pending.gum.resolve(window.__fakeStream2);
  });
  await page2.evaluate(() => window.__armPromise);
  const afterCycle2 = await page2.evaluate(() => ({
    state: window.__src.state(),
    t1Stopped: window.__t1.stopped,
    t2Stopped: window.__t2.stopped,
    newCallbackCount: window.__qa.newCallbackCount,
  }));

  if (stateWhileGumPending !== 'loading') fails.push(`cycle 2: state was "${stateWhileGumPending}" while getUserMedia was pending, wanted "loading"`);
  if (stateRightAfterDisarm2 !== 'off') fails.push(`cycle 2: state was "${stateRightAfterDisarm2}" immediately after disarm(), wanted "off"`);
  if (afterCycle2.state !== 'off') fails.push(`cycle 2: state settled to "${afterCycle2.state}" after getUserMedia resolved post-abort, wanted "off" (this is the exact bug: the camera turning on after a refusal)`);
  if (!afterCycle2.t1Stopped || !afterCycle2.t2Stopped) fails.push(`cycle 2: a stream that resolved after disarm() had stopped=[${afterCycle2.t1Stopped},${afterCycle2.t2Stopped}], wanted every track stopped`);
  if (afterCycle2.newCallbackCount !== ambientBaseline) fails.push(`cycle 2: a new requestAnimationFrame callback appeared (source's own loop scheduled) on a cycle aborted before the camera resolved, wanted none`);

  // cycle 3: recovery. A later arm() must still work normally: not poisoned
  // by the two aborts above. It must also close cycle 2's landmarker (l2,
  // left referenced but idle after cycle 2 aborted downstream of it) before
  // building its own, proving the leak fix, and it must not re-fetch the
  // vision module, proving the memoization fix.
  await page2.evaluate(() => { window.__armPromise = window.__src.arm(); });
  await waitForCount('files', 3);
  await page2.evaluate(() => window.__qa.pending.files.resolve({}));
  await waitForCount('landmarker', 3);
  await page2.evaluate(() => {
    window.__l3 = { closeCalls: 0 };
    window.__l3.close = () => { window.__l3.closeCalls++; };
    window.__l3.detectForVideo = () => null;
    window.__qa.pending.landmarker.resolve(window.__l3);
  });
  // l2 is closed synchronously, inline with building l3, no await to wait out
  const l2ClosedOnReplace = await page2.evaluate(() => window.__l2.closeCalls);
  await waitForCount('gum', 2);
  // a real, if blank, video track: an UNPAINTED canvas.captureStream() never
  // delivers a frame and video.play() hangs forever, so the canvas is
  // painted once first. This is the only cycle that needs a real track,
  // since it is the only one meant to reach 'on'.
  await page2.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 480;
    canvas.getContext('2d').fillRect(0, 0, 640, 480);
    window.__qa.pending.gum.resolve(canvas.captureStream(30));
  });
  await page2.evaluate(() => window.__armPromise);
  const afterCycle3 = await page2.evaluate(() => ({
    state: window.__src.state(),
    newCallbackCount: window.__qa.newCallbackCount,
  }));
  await page2.evaluate(() => window.__src.disarm());
  const afterFinalDisarm = await page2.evaluate(() => window.__src.state());

  if (l2ClosedOnReplace !== 1) fails.push(`cycle 3: the previous cycle's landmarker was closed ${l2ClosedOnReplace} times when replaced, wanted 1 (leak fix)`);
  if (afterCycle3.state !== 'on') fails.push(`cycle 3: a later arm() settled to "${afterCycle3.state}", wanted "on" (an abort must not poison the source)`);
  if (afterCycle3.newCallbackCount !== ambientBaseline + 1) fails.push(`cycle 3: expected exactly one new requestAnimationFrame callback (the source's own loop starting), saw a delta of ${afterCycle3.newCallbackCount - ambientBaseline}`);
  if (fetchCount !== 1) fails.push(`the vision module was fetched ${fetchCount} times across 3 arm() cycles, wanted 1 (memoization fix)`);
  if (afterFinalDisarm !== 'off') fails.push(`final disarm(): state was "${afterFinalDisarm}", wanted "off"`);

  console.log(`  cycle1(landmarker-abort) closed=${afterCycle1.l1CloseCalls} gum=${afterCycle1.gumCalls} newRaf=${afterCycle1.newCallbackCount - ambientBaseline} -> ${afterCycle1.state}`);
  console.log(`  cycle2(camera-abort) tracksStopped=${afterCycle2.t1Stopped}/${afterCycle2.t2Stopped} newRaf=${afterCycle2.newCallbackCount - ambientBaseline} -> ${afterCycle2.state}`);
  console.log(`  cycle3(recovery) prevClosed=${l2ClosedOnReplace} fetches=${fetchCount} newRaf=${afterCycle3.newCallbackCount - ambientBaseline} -> ${afterCycle3.state}   final disarm -> ${afterFinalDisarm}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
