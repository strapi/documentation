/* QA: the HUD. It exists so that when the hand does not respond you can SEE
   why, which is the difference between an interface and a haunted screen.
   Asserted: the reticle only appears once a hand is present, it follows
   hand:move, it shows a grabbed state, and it disappears when the hand does. */
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
  await page.waitForTimeout(1500);

  const r = await page.evaluate(async () => {
    const { mountHud } = await import('./hand/hud.js');
    mountHud();
    const el = () => document.getElementById('hand-reticle');
    const vis = () => { const e = el(); return !!e && getComputedStyle(e).opacity !== '0'; };
    // Polls a predicate instead of counting animation frames: how many frames
    // a CSS transition needs before it shows measurable progress is a
    // property of the browser build and machine load, not of this code, so
    // counting frames measures the wrong thing. A 1s deadline is many times
    // any plausible transition here.
    const waitUntil = async (predicate, deadlineMs, stepMs = 20) => {
      const start = Date.now();
      for (;;) {
        if (predicate()) return true;
        if (Date.now() - start >= deadlineMs) return false;
        await new Promise(res => setTimeout(res, stepMs));
      }
    };
    const out = { beforePresent: vis() };
    window.dispatchEvent(new CustomEvent('hand:present', { detail: {} }));
    window.dispatchEvent(new CustomEvent('hand:move', { detail: { x: 300, y: 240 } }));
    out.afterPresent = await waitUntil(vis, 1000);
    await new Promise(r2 => requestAnimationFrame(() => requestAnimationFrame(r2)));
    const b1 = el().getBoundingClientRect();
    out.x1 = Math.round(b1.left + b1.width / 2);
    out.y1 = Math.round(b1.top + b1.height / 2);
    window.dispatchEvent(new CustomEvent('hand:move', { detail: { x: 700, y: 600 } }));
    await new Promise(r2 => requestAnimationFrame(() => requestAnimationFrame(r2)));
    const b2 = el().getBoundingClientRect();
    out.x2 = Math.round(b2.left + b2.width / 2);
    out.y2 = Math.round(b2.top + b2.height / 2);
    window.dispatchEvent(new CustomEvent('hand:grab', { detail: {} }));
    out.grabbedClass = el().classList.contains('grabbing');
    window.dispatchEvent(new CustomEvent('hand:release', { detail: {} }));
    out.releasedClass = el().classList.contains('grabbing');
    window.dispatchEvent(new CustomEvent('hand:absent', { detail: {} }));
    out.afterAbsent = !(await waitUntil(() => !vis(), 1000));
    return out;
  });

  const fails = [];
  if (r.beforePresent) fails.push('the reticle was visible before any hand appeared');
  if (!r.afterPresent) fails.push('the reticle did not appear on hand:present');
  if (Math.abs(r.x1 - 300) > 4 || Math.abs(r.y1 - 240) > 4) fails.push(`the reticle sat at (${r.x1}, ${r.y1}), wanted (300, 240)`);
  if (Math.abs(r.x2 - 700) > 4 || Math.abs(r.y2 - 600) > 4) fails.push(`the reticle did not follow, sat at (${r.x2}, ${r.y2}), wanted (700, 600)`);
  if (!r.grabbedClass) fails.push('the reticle did not show a grabbed state');
  if (r.releasedClass) fails.push('the reticle stayed grabbed after release');
  if (r.afterAbsent) fails.push('the reticle stayed visible after the hand left');
  console.log(`  (${r.x1}, ${r.y1}) then (${r.x2}, ${r.y2})   grab ${r.grabbedClass} release ${!r.releasedClass}   hidden after absent ${!r.afterAbsent}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
