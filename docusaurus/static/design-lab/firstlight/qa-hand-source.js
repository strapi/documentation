/* QA: the camera source. The assertions are about RESTRAINT and TEARDOWN,
   which are the two things that lose a user's trust:
     - nothing at all is fetched before the arming click, so a visitor who
       never arms it pays nothing and is never asked for a camera;
     - disarming stops every track, so the camera indicator light goes out,
       even when disarm() lands in the middle of a still-loading arm();
     - disarm() also closes the current landmarker (not just a later arm()
       replacing it), so an armed-once-never-rearmed source does not hold
       WASM/GPU resources for the life of the page, and a landmarker that
       got built but never gets to run is closed, not leaked;
     - repeated arm/disarm cycles do not re-fetch the vision module.
   A denied permission must be a state, not an exception.

   Every wait below carries an explicit deadline. Without the abort fix,
   arm() never settles once disarm() has run mid-flight: it just sits
   forever awaiting a stub that nothing will ever resolve the "aborted" way
   it expects. A probe that waits on that with no deadline does not fail,
   it hangs, and a hang is indistinguishable from a slow machine in any
   automated run. Each cycle below fails within a few seconds instead,
   naming exactly which cycle never settled. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');

const DEADLINE_MS = 5000;

class Deadline extends Error {}

// Races a promise against a deadline. On timeout this throws instead of
// hanging, naming what did not settle; the underlying page-side promise is
// simply abandoned (still pending forever in the page, harmless: it holds
// no lock the rest of the script needs).
async function withDeadline(promise, label) {
  let timer;
  const timeout = new Promise((res) => {
    timer = setTimeout(() => res({ __timedOut: true }), DEADLINE_MS);
  });
  const result = await Promise.race([
    promise.then((v) => ({ __timedOut: false, v })),
    timeout,
  ]);
  clearTimeout(timer);
  if (result.__timedOut) {
    throw new Deadline(`${label}: did not settle within ${DEADLINE_MS}ms (a missing or broken abort check hangs here instead of failing)`);
  }
  return result.v;
}

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
  // disarm() closes the landmarker it currently holds, not only a future
  // arm() replacing it; a later arm() still works; the import is not
  // re-fetched) against a stand-in, not against real hardware.
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
    (arg) => window.__qa.counts[arg.key] >= arg.n, { key, n }, { timeout: DEADLINE_MS },
  );

  try {
    // cycle 1: abort while the landmarker is still being built. At the
    // moment disarm() runs, the landmarker this cycle is building does not
    // exist anywhere disarm() can reach: it is only inside the pending
    // promise. If arm() does not close it itself when it notices the
    // abort, it leaks silently and this assertion is the only thing that
    // would ever catch it.
    await page2.evaluate(() => { window.__armPromise = window.__src.arm(); });
    await waitForCount('files', 1);
    await page2.evaluate(() => window.__qa.pending.files.resolve({}));
    await waitForCount('landmarker', 1);
    const stateWhileBuildingLandmarker = await page2.evaluate(() => window.__src.state());
    await page2.evaluate(() => window.__src.disarm());
    const stateRightAfterDisarm1 = await page2.evaluate(() => window.__src.state());
    await page2.evaluate(() => {
      window.__l1 = { closeCalls: 0, close() { this.closeCalls++; }, detectForVideo: () => null };
      window.__qa.pending.landmarker.resolve(window.__l1);
    });
    await withDeadline(page2.evaluate(() => window.__armPromise), 'cycle 1 (abort during landmarker creation)');
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
    console.log(`  cycle1(landmarker-abort) closed=${afterCycle1.l1CloseCalls} gum=${afterCycle1.gumCalls} newRaf=${afterCycle1.newCallbackCount - ambientBaseline} -> ${afterCycle1.state}`);

    // cycle 2: abort while getUserMedia is pending, with STUB tracks. This
    // is the exact bug: the camera promise resolves AFTER disarm() has
    // already run and found no stream to stop. Also checks the Item 1 fix:
    // by the time getUserMedia is pending, this cycle's landmarker is
    // already committed, so disarm() must close IT, right there, not wait
    // for some future arm() that may never come.
    await page2.evaluate(() => { window.__armPromise = window.__src.arm(); });
    await waitForCount('files', 2);
    await page2.evaluate(() => window.__qa.pending.files.resolve({}));
    await waitForCount('landmarker', 2);
    await page2.evaluate(() => {
      window.__l2 = { closeCalls: 0, close() { this.closeCalls++; }, detectForVideo: () => null };
      window.__qa.pending.landmarker.resolve(window.__l2);
    });
    await waitForCount('gum', 1);
    const stateWhileGumPending = await page2.evaluate(() => window.__src.state());
    await page2.evaluate(() => window.__src.disarm());
    const stateRightAfterDisarm2 = await page2.evaluate(() => window.__src.state());
    const l2ClosedAtDisarm = await page2.evaluate(() => window.__l2.closeCalls);
    await page2.evaluate(() => {
      window.__t1 = { stopped: false, stop() { this.stopped = true; } };
      window.__t2 = { stopped: false, stop() { this.stopped = true; } };
      window.__fakeStream2 = { getTracks: () => [window.__t1, window.__t2] };
      window.__qa.pending.gum.resolve(window.__fakeStream2);
    });
    await withDeadline(page2.evaluate(() => window.__armPromise), 'cycle 2 (abort during getUserMedia, stub tracks)');
    const afterCycle2 = await page2.evaluate(() => ({
      state: window.__src.state(),
      t1Stopped: window.__t1.stopped,
      t2Stopped: window.__t2.stopped,
      l2CloseCallsFinal: window.__l2.closeCalls,
      newCallbackCount: window.__qa.newCallbackCount,
    }));

    if (stateWhileGumPending !== 'loading') fails.push(`cycle 2: state was "${stateWhileGumPending}" while getUserMedia was pending, wanted "loading"`);
    if (stateRightAfterDisarm2 !== 'off') fails.push(`cycle 2: state was "${stateRightAfterDisarm2}" immediately after disarm(), wanted "off"`);
    if (l2ClosedAtDisarm !== 1) fails.push(`cycle 2: disarm() closed the current landmarker ${l2ClosedAtDisarm} times, wanted 1 (Item 1: disarm() must close it itself, not wait for a future arm() to replace it)`);
    if (afterCycle2.l2CloseCallsFinal !== 1) fails.push(`cycle 2: the landmarker's close count became ${afterCycle2.l2CloseCallsFinal} once arm() settled, wanted 1 (no double-close)`);
    if (afterCycle2.state !== 'off') fails.push(`cycle 2: state settled to "${afterCycle2.state}" after getUserMedia resolved post-abort, wanted "off" (this is the exact bug: the camera turning on after a refusal)`);
    if (!afterCycle2.t1Stopped || !afterCycle2.t2Stopped) fails.push(`cycle 2: a stream that resolved after disarm() had stopped=[${afterCycle2.t1Stopped},${afterCycle2.t2Stopped}], wanted every track stopped`);
    if (afterCycle2.newCallbackCount !== ambientBaseline) fails.push(`cycle 2: a new requestAnimationFrame callback appeared (source's own loop scheduled) on a cycle aborted before the camera resolved, wanted none`);
    console.log(`  cycle2(camera-abort, stub tracks) closedAtDisarm=${l2ClosedAtDisarm} tracksStopped=${afterCycle2.t1Stopped}/${afterCycle2.t2Stopped} newRaf=${afterCycle2.newCallbackCount - ambientBaseline} -> ${afterCycle2.state}`);

    // cycle 3: abort while getUserMedia is pending, with a REAL MediaStream
    // from canvas.captureStream(). Cycle 2 above is cheap and pins the
    // contract's exact shape (which of several distinguishable tracks got
    // stop() called, a count of close() calls), but a stub's stopped=true
    // is only an assertion about our own test code. It cannot prove that a
    // genuine browser MediaStreamTrack really stops, which is the one
    // thing the camera indicator light actually reflects. This cycle
    // proves that: a real track's readyState must read 'ended' after the
    // abort path runs, not merely a flag our own stub set for us.
    await page2.evaluate(() => { window.__armPromise = window.__src.arm(); });
    await waitForCount('files', 3);
    await page2.evaluate(() => window.__qa.pending.files.resolve({}));
    await waitForCount('landmarker', 3);
    await page2.evaluate(() => {
      window.__l3 = { closeCalls: 0, close() { this.closeCalls++; }, detectForVideo: () => null };
      window.__qa.pending.landmarker.resolve(window.__l3);
    });
    await waitForCount('gum', 2);
    const stateWhileGumPending3 = await page2.evaluate(() => window.__src.state());
    await page2.evaluate(() => window.__src.disarm());
    const stateRightAfterDisarm3 = await page2.evaluate(() => window.__src.state());
    const l3ClosedAtDisarm = await page2.evaluate(() => window.__l3.closeCalls);
    const realTrackInfo = await page2.evaluate(() => {
      // an UNPAINTED canvas.captureStream() track never delivers a frame,
      // but readyState still starts 'live' the instant the track is
      // created, real content or not: painting is not needed to prove the
      // abort is what stops it, only to let a video actually play one
      // (see cycle 4, the only cycle that needs to reach 'on').
      const canvas = document.createElement('canvas');
      canvas.width = 640; canvas.height = 480;
      canvas.getContext('2d').fillRect(0, 0, 640, 480);
      const stream = canvas.captureStream(30);
      window.__realStream3 = stream;
      const readyBefore = stream.getTracks()[0].readyState;
      window.__qa.pending.gum.resolve(stream);
      return { readyBefore };
    });
    await withDeadline(page2.evaluate(() => window.__armPromise), 'cycle 3 (abort during getUserMedia, real MediaStream)');
    const afterCycle3 = await page2.evaluate(() => ({
      state: window.__src.state(),
      trackReadyAfter: window.__realStream3.getTracks()[0].readyState,
    }));

    if (stateWhileGumPending3 !== 'loading') fails.push(`cycle 3: state was "${stateWhileGumPending3}" while getUserMedia was pending, wanted "loading"`);
    if (stateRightAfterDisarm3 !== 'off') fails.push(`cycle 3: state was "${stateRightAfterDisarm3}" immediately after disarm(), wanted "off"`);
    if (l3ClosedAtDisarm !== 1) fails.push(`cycle 3: disarm() closed the current landmarker ${l3ClosedAtDisarm} times, wanted 1`);
    if (realTrackInfo.readyBefore !== 'live') fails.push(`cycle 3: the real capture track started as "${realTrackInfo.readyBefore}", wanted "live" (the abort path must be what stops it, not something already stopped)`);
    if (afterCycle3.state !== 'off') fails.push(`cycle 3: state settled to "${afterCycle3.state}" after a real stream resolved post-abort, wanted "off"`);
    if (afterCycle3.trackReadyAfter !== 'ended') fails.push(`cycle 3: a real MediaStreamTrack's readyState was "${afterCycle3.trackReadyAfter}" after the abort path ran, wanted "ended" (browser-level proof the camera actually stops, not a stub flag)`);
    console.log(`  cycle3(camera-abort, real track) readyBefore=${realTrackInfo.readyBefore} readyAfter=${afterCycle3.trackReadyAfter} -> ${afterCycle3.state}`);

    // cycle 4: recovery. A later arm() must still work normally: not
    // poisoned by the three aborts above. It must not re-fetch the vision
    // module (memoization fix), must not double-close cycle 3's landmarker
    // (already closed by disarm() above), and its own final disarm() must
    // close ITS landmarker too (Item 1's headline case: a user who arms
    // once and never rearms must not hold that landmarker's resources for
    // the life of the page).
    await page2.evaluate(() => { window.__armPromise = window.__src.arm(); });
    await waitForCount('files', 4);
    await page2.evaluate(() => window.__qa.pending.files.resolve({}));
    await waitForCount('landmarker', 4);
    await page2.evaluate(() => {
      window.__l4 = { closeCalls: 0, close() { this.closeCalls++; }, detectForVideo: () => null };
      window.__qa.pending.landmarker.resolve(window.__l4);
    });
    const l3ClosedWhileBuildingL4 = await page2.evaluate(() => window.__l3.closeCalls);
    await waitForCount('gum', 3);
    await page2.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 640; canvas.height = 480;
      canvas.getContext('2d').fillRect(0, 0, 640, 480); // painted: this cycle must reach 'on'
      window.__qa.pending.gum.resolve(canvas.captureStream(30));
    });
    await withDeadline(page2.evaluate(() => window.__armPromise), 'cycle 4 (recovery)');
    const afterCycle4 = await page2.evaluate(() => ({
      state: window.__src.state(),
      newCallbackCount: window.__qa.newCallbackCount,
      l3CloseCallsNow: window.__l3.closeCalls,
    }));
    await page2.evaluate(() => window.__src.disarm());
    const afterFinalDisarm = await page2.evaluate(() => ({
      state: window.__src.state(),
      l4CloseCalls: window.__l4.closeCalls,
    }));

    if (l3ClosedWhileBuildingL4 !== 1) fails.push(`cycle 4: cycle 3's landmarker close count was ${l3ClosedWhileBuildingL4} while building a new one, wanted 1 (no double-close)`);
    if (afterCycle4.l3CloseCallsNow !== 1) fails.push(`cycle 4: cycle 3's landmarker close count became ${afterCycle4.l3CloseCallsNow} once arm() settled, wanted 1 (no double-close)`);
    if (afterCycle4.state !== 'on') fails.push(`cycle 4: a later arm() settled to "${afterCycle4.state}", wanted "on" (an abort must not poison the source)`);
    if (afterCycle4.newCallbackCount !== ambientBaseline + 1) fails.push(`cycle 4: expected exactly one new requestAnimationFrame callback (the source's own loop starting), saw a delta of ${afterCycle4.newCallbackCount - ambientBaseline}`);
    if (fetchCount !== 1) fails.push(`the vision module was fetched ${fetchCount} times across 4 arm() cycles, wanted 1 (memoization fix)`);
    if (afterFinalDisarm.state !== 'off') fails.push(`final disarm(): state was "${afterFinalDisarm.state}", wanted "off"`);
    if (afterFinalDisarm.l4CloseCalls !== 1) fails.push(`final disarm(): the fully-armed landmarker was closed ${afterFinalDisarm.l4CloseCalls} times, wanted 1 (Item 1: without this, an armed-once-never-rearmed source holds its landmarker's WASM/GPU resources for the life of the page)`);
    console.log(`  cycle4(recovery) prevClosedNoDouble=${afterCycle4.l3CloseCallsNow} fetches=${fetchCount} newRaf=${afterCycle4.newCallbackCount - ambientBaseline} -> ${afterCycle4.state}   final disarm -> ${afterFinalDisarm.state} (landmarker closed=${afterFinalDisarm.l4CloseCalls})`);
  } catch (e) {
    fails.push(e instanceof Deadline ? e.message : `unexpected error during abort cycles: ${e && e.message ? e.message : e}`);
  }

  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
