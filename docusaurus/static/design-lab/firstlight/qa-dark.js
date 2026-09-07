/* QA: first contact with a dark body + transit intercept click + reduced motion. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise(res => srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); }));
  const base = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch();
  const out = {};
  const errors = [];

  // --- dark body first contact ---
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    await page.goto(base + '/#/cms/testing', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => {
      const h = document.querySelector('#page h1');
      return h && /Testing/i.test(h.textContent);
    });
    await page.waitForTimeout(700);
    out.darkBody = await page.evaluate(() => ({
      overlayShown: !document.getElementById('plaque').hidden,
      overlayText: document.getElementById('plaque').innerText.replace(/\s+/g, ' ').trim().slice(0, 400),
      inPage: (document.querySelector('.fc-plaque') || {}).innerText,
      contactLog: Array.from(document.querySelectorAll('#log .ll')).map(d => d.innerText).filter(t => /FIRST CONTACT/.test(t))
    }));
    await page.screenshot({ path: path.join(__dirname, 'iterlog', 'r1-firstcontact.png') });
    await page.close();
  }

  // --- transit intercept: wait for ellipse, click it ---
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', e => errors.push('pageerror2: ' + e.message));
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__diag && window.__diag.state !== 'boot');
    // transit is seeded ~6.5s after boot; wait for the log entry
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('#log .ll')).some(d => /TRANSIT EVENT/.test(d.innerText)), { timeout: 20000 });
    out.transitLog = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#log .ll')).map(d => d.innerText).filter(t => /TRANSIT/.test(t))[0]);
    // find the detected dark body's screen position and click it
    const pos = await page.evaluate(() => {
      // internals are closured; recover via canvas hit-test sweep is overkill —
      // instead use the tooltip path: hover across the viewport? Simpler: the
      // ellipse is near the beacon; click via keyboard is not available.
      return null;
    });
    out.transitClickTested = 'via hover sweep below';
    // hover sweep in a spiral around center to find the UNRESOLVED tooltip
    let found = null;
    for (let r = 40; r <= 620 && !found; r += 36) {
      for (let a = 0; a < 360 && !found; a += 22) {
        const x = 720 + r * Math.cos(a * Math.PI / 180);
        const y = 450 + r * Math.sin(a * Math.PI / 180) * 0.7;
        if (x < 10 || x > 1430 || y < 60 || y > 880) continue;
        await page.mouse.move(x, y);
        const tip = await page.evaluate(() => {
          const t = document.getElementById('tooltip');
          return t && !t.hidden ? t.innerText : '';
        });
        if (/UNRESOLVED BODY/.test(tip)) found = { x, y, tip: tip.replace(/\s+/g, ' ') };
      }
    }
    out.transitTooltip = found;
    if (found) {
      await page.mouse.click(found.x, found.y);
      await page.waitForTimeout(900);
      out.interceptResult = await page.evaluate(() => ({
        hash: location.hash,
        plaque: !document.getElementById('plaque').hidden,
        reader: !document.getElementById('reader').hidden
      }));
    }
    await page.close();
  }

  // --- reduced motion boot ---
  {
    const ctx2 = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await ctx2.newPage();
    page.on('pageerror', e => errors.push('pageerror3: ' + e.message));
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#prompt:not([hidden])', { timeout: 2000 });
    await page.waitForTimeout(2500);
    out.reduced = await page.evaluate(() => ({
      state: window.__diag.state,
      frameMs: window.__diag.frameMs,
      transitAlready: Array.from(document.querySelectorAll('#log .ll')).some(d => /TRANSIT/.test(d.innerText))
    }));
    await page.screenshot({ path: path.join(__dirname, 'iterlog', 'r1-reduced.png') });
    await ctx2.close();
  }

  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
  srv.kill();
})().catch(e => { console.error('QA FAILED', e); process.exit(1); });
