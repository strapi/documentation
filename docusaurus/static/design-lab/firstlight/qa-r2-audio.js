/* QA round 2 — the sound world.
   1. boots with SOUND ON and no AudioContext until the first gesture, zero errors
   2. every event sound renders offline as non-silent and pairwise distinct
   3. gesture unlocks: context + bed live; toggle silences; muted stays complete */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise(res => srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); }));
  const base = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  const out = { fail: [] };

  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__diag && window.__diag.state !== 'boot');
  await page.waitForTimeout(300);

  // ---- 1. boot state: ON label, pressed, no context yet
  out.boot = await page.evaluate(() => ({
    label: document.getElementById('audiobtn').textContent,
    pressed: document.getElementById('audiobtn').getAttribute('aria-pressed'),
    unlocked: window.__diag.audioUnlocked,
    bed: window.__diag.bedOn
  }));
  if (out.boot.label !== 'SOUND ON' || out.boot.pressed !== 'true') out.fail.push('boot label/pressed');
  if (out.boot.unlocked || out.boot.bed) out.fail.push('context created before gesture');

  // ---- 2. offline render of every event voice
  const names = ['bed', 'lock', 'ping', 'pingNight', 'transit', 'thud', 'contact',
                 'triang', 'chart', 'warp', 'almanac', 'hall', 'plate'];
  out.sounds = [];
  for (const n of names) {
    const sig = await page.evaluate(name => window.__probeSound(name), n);
    out.sounds.push(sig);
    if (sig.error) out.fail.push(n + ': ' + sig.error);
    else if (!(sig.rms > 1e-4)) out.fail.push(n + ' is silent (rms=' + sig.rms + ')');
  }
  // pairwise distinctness on [zcr, split, rms]
  const close = [];
  for (let i = 0; i < out.sounds.length; i++) {
    for (let j = i + 1; j < out.sounds.length; j++) {
      const a = out.sounds[i], b = out.sounds[j];
      if (a.error || b.error) continue;
      const dz = Math.abs(Math.log10((a.zcrHz + 1) / (b.zcrHz + 1)));
      const ds = Math.abs(a.split - b.split);
      const dr = Math.abs(Math.log10(a.rms / b.rms));
      if (dz < 0.05 && ds < 0.08 && dr < 0.2) close.push(a.name + '~' + b.name +
        ` dz=${dz.toFixed(3)} ds=${ds.toFixed(3)} dr=${dr.toFixed(3)}`);
    }
  }
  out.tooClose = close;
  if (close.length) out.fail.push(close.length + ' sound pairs not distinct');

  // ---- 3. unlock by keyboard gesture (an unbound key)
  await page.keyboard.press('x');
  await page.waitForTimeout(500);
  out.afterGesture = await page.evaluate(() => ({
    unlocked: window.__diag.audioUnlocked,
    bed: window.__diag.bedOn,
    acState: window.__diag ? true : false,
    soundLog: Array.from(document.querySelectorAll('#log .ll')).map(d => d.innerText).filter(t => /SOUND ON/.test(t)).length
  }));
  if (!out.afterGesture.unlocked || !out.afterGesture.bed) out.fail.push('gesture did not unlock/start bed');

  // ---- 4. toggle off silences for the visit; muted stays complete
  await page.click('#audiobtn');
  await page.waitForTimeout(300);
  out.muted = await page.evaluate(() => ({
    label: document.getElementById('audiobtn').textContent,
    bed: window.__diag.bedOn
  }));
  if (out.muted.label !== 'SOUND OFF' || out.muted.bed) out.fail.push('toggle off failed');
  await page.evaluate(() => { location.hash = '#/cms/api/rest'; });
  await page.waitForFunction(() => document.getElementById('page').innerText.length > 400);
  out.mutedNav = await page.evaluate(() => ({
    reader: !document.getElementById('reader').hidden,
    meter: document.getElementById('cm-n').textContent
  }));
  if (!out.mutedNav.reader) out.fail.push('muted navigation broken');

  // ---- 5. toggle back on restores the bed
  await page.click('#audiobtn');
  await page.waitForTimeout(300);
  out.reOn = await page.evaluate(() => window.__diag.bedOn);
  if (!out.reOn) out.fail.push('re-enable did not restart bed');

  out.errors = errors;
  if (errors.length) out.fail.push(errors.length + ' page errors');
  out.verdict = out.fail.length ? 'FAIL' : 'PASS';
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
  srv.kill();
  process.exit(out.fail.length ? 1 : 0);
})().catch(e => { console.error('QA FAILED', e); process.exit(1); });
