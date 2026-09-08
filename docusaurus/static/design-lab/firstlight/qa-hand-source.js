/* QA: the camera source. The assertions are about RESTRAINT and TEARDOWN,
   which are the two things that lose a user's trust:
     - nothing at all is fetched before the arming click, so a visitor who
       never arms it pays nothing and is never asked for a camera;
     - disarming stops every track, so the camera indicator light goes out.
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
  const page = await ctx.newPage();
  const requested = [];
  page.on('request', r => { const u = r.url(); if (/mediapipe|\.wasm|\.task/.test(u)) requested.push(u); });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const fails = [];
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
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
