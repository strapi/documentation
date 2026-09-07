/* QA final gate:
   1. hash-route 20 evenly-spaced slugs — body text > 400 chars, zero errors
   2. p95 of __diag.frameMs during a scripted pan/zoom/warp burst <= 16.5 ms
   3. sweep all 290 pages -> completion plate 290/290 after 77 hands
   4. reload -> personal chart restored from localStorage
*/
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise(res => srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); }));
  const base = `http://127.0.0.1:${port}`;
  const content = JSON.parse(fs.readFileSync(path.join(__dirname, 'content.json'), 'utf8'));
  const order = content.order.filter(s => content.pages[s]);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  const out = {};

  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__diag && window.__diag.state !== 'boot');

  // ---- 1. twenty evenly-spaced slugs
  const twenty = [];
  for (let k = 0; k < 20; k++) twenty.push(order[Math.floor(k * (order.length - 1) / 19)]);
  const shortPages = [];
  for (const slug of twenty) {
    await page.evaluate(s => { location.hash = '#' + s; }, slug);
    await page.waitForFunction(() => document.getElementById('page').innerText.length > 0);
    await page.waitForTimeout(140);
    const len = await page.evaluate(() => document.getElementById('page').innerText.length);
    if (len <= 400) shortPages.push({ slug, len });
  }
  out.twentyChecked = twenty.length;
  out.shortPages = shortPages;

  // ---- 2. performance burst: pan + zoom + warp, sample frameMs
  await page.evaluate(() => {
    window.__samples = [];
    const rec = () => {
      window.__samples.push(window.__diag.frameMs);
      if (window.__samples.length < 720) requestAnimationFrame(rec);
    };
    requestAnimationFrame(rec);
  });
  // full chart on = worst case draw load, then interact
  await page.click('#fullbtn');
  for (let i = 0; i < 6; i++) {
    await page.mouse.move(700, 450);
    await page.mouse.down();
    await page.mouse.move(300 + i * 60, 300 + (i % 2) * 250, { steps: 22 });
    await page.mouse.up();
    await page.mouse.wheel(0, i % 2 ? -420 : 420);
  }
  // a couple of warps (search-to-page is the main interaction too)
  await page.evaluate(() => { location.hash = '#/cms/api/rest'; });
  await page.waitForTimeout(500);
  await page.evaluate(() => { location.hash = '#/cms/features/users-permissions'; });
  await page.waitForTimeout(500);
  await page.waitForFunction(() => window.__samples.length >= 720, { timeout: 30000 });
  const samples = await page.evaluate(() => window.__samples);
  const sorted = samples.slice().sort((a, b) => a - b);
  out.perf = {
    n: sorted.length,
    p50: +sorted[Math.floor(sorted.length * 0.5)].toFixed(2),
    p95: +sorted[Math.floor(sorted.length * 0.95)].toFixed(2),
    p99: +sorted[Math.floor(sorted.length * 0.99)].toFixed(2),
    max: +sorted[sorted.length - 1].toFixed(2),
    avg: +(await page.evaluate(() => window.__diag.avgFrameMs)).toFixed(2)
  };
  await page.click('#fullbtn');

  // ---- 3. sweep all 290 -> completion
  for (const slug of order) {
    await page.evaluate(s => { location.hash = '#' + s; }, slug);
    await page.waitForTimeout(28);
  }
  await page.waitForTimeout(800);
  out.completion = await page.evaluate(() => ({
    meter: document.getElementById('cm-n').textContent + '/' + document.getElementById('cm-total').textContent,
    plateShown: !document.getElementById('plate').hidden,
    big: document.getElementById('cp-big').textContent,
    hands: document.getElementById('cp-hands').textContent,
    names: document.querySelectorAll('#cp-names span').length,
    sub: document.getElementById('cp-sub').innerText
  }));
  await page.screenshot({ path: path.join(__dirname, 'iterlog', 'r1-complete.png') });

  // ---- 4. persistence
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__diag && window.__diag.state !== 'boot');
  await page.waitForTimeout(400);
  out.afterReload = await page.evaluate(() => ({
    meter: document.getElementById('cm-n').textContent,
    restoredLog: Array.from(document.querySelectorAll('#log .ll')).map(d => d.innerText).filter(t => /RESTORED/.test(t))[0] || null
  }));

  out.errors = errors.slice(0, 20);
  out.errorCount = errors.length;
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
  srv.kill();
})().catch(e => { console.error('QA FAILED', e); process.exit(1); });
