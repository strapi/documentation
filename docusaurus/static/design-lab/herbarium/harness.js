const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs = require('fs');
const BASE = 'http://127.0.0.1:8977/';
const DIR = '/private/tmp/claude-501/-Users-piwi-code-documentation/0d8629c6-231f-4fec-94af-6fe3669d37b8/scratchpad/bold5/s7/';
const ALL = process.argv.includes('--all');

(async () => {
  const content = JSON.parse(fs.readFileSync(DIR + 'content.json', 'utf8'));
  const order = content.order;
  const pages = content.pages;

  // pick a spread across every section+product
  const bySec = {};
  order.forEach(s => { const k = pages[s].product + '|' + pages[s].section; (bySec[k] = bySec[k] || []).push(s); });
  let sample;
  if (ALL) sample = order.slice();
  else {
    sample = [];
    const keys = Object.keys(bySec);
    keys.forEach(k => { const l = bySec[k]; for (let i = 0; i < Math.min(l.length, 5); i++) sample.push(l[Math.floor(i * l.length / Math.min(l.length, 5))]); });
    // hubs + winter twigs + night pages
    ['/cms/api/rest', '/cms/api/document-service', '/cms/migration/v4-to-v5/breaking-changes', '/cms/features/users-permissions', '/cms/intro'].forEach(s => sample.push(s));
    sample = Array.from(new Set(sample));
    while (sample.length < 66) { const s = order[Math.floor(Math.random() * order.length)]; if (!sample.includes(s)) sample.push(s); }
  }

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => {
    window.__ERR__ = [];
    window.addEventListener('error', e => window.__ERR__.push('error: ' + (e.message || '') + ' @' + (e.filename || '') + ':' + (e.lineno || '')));
    window.addEventListener('unhandledrejection', e => window.__ERR__.push('rejection: ' + (e.reason && (e.reason.stack || e.reason.message) || e.reason)));
  });
  const page = await ctx.newPage();
  const consoleErr = [];
  page.on('console', m => { if (m.type() === 'error') consoleErr.push(m.text().slice(0, 240)); });
  page.on('pageerror', e => consoleErr.push('pageerror: ' + e.message));

  const t0 = Date.now();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__HERB_READY__ === true, { timeout: 25000 });
  const firstContent = Date.now() - t0;
  const bootMs = await page.evaluate(() => window.__HERB_BOOT_MS__);

  const short = [], overflow = [], missing = [];
  let checked = 0;
  for (const slug of sample) {
    await page.evaluate(s => { location.hash = '#' + s; }, slug);
    await page.waitForFunction(s => {
      const v = document.querySelector('#verso .notes');
      return v && document.querySelector('#verso') && location.hash === '#' + s;
    }, slug, { timeout: 8000 }).catch(() => { missing.push(slug); });
    const r = await page.evaluate(() => {
      const v = document.querySelector('#verso .notes');
      const de = document.documentElement;
      return {
        chars: v ? v.innerText.trim().length : 0,
        ow: de.scrollWidth, cw: de.clientWidth,
        title: document.title,
        prov: !!document.querySelector('.prov-story')
      };
    });
    checked++;
    if (r.chars < 400) short.push([slug, r.chars]);
    if (r.ow > r.cw + 1) overflow.push([slug, r.ow, r.cw]);
    if (!r.prov) missing.push(slug + ' (no provenance)');
  }

  // routing behaviours
  await page.evaluate(() => { location.hash = ''; });
  await page.waitForTimeout(350);
  const emptyHash = await page.evaluate(() => ({ t: document.title, has: !!document.querySelector('#verso') }));
  await page.evaluate(() => { location.hash = '#/cms/api/rest'; });
  await page.waitForTimeout(350);
  const t1 = await page.evaluate(() => document.title);
  await page.goBack(); await page.waitForTimeout(350);
  const back = await page.evaluate(() => ({ h: location.hash, t: document.title }));
  await page.goForward(); await page.waitForTimeout(350);
  const fwd = await page.evaluate(() => ({ h: location.hash, t: document.title }));

  // cabinet views
  for (const h of ['#~all', '#~bloom', '#~winter', '#~night', '#~eldest', '#~tended', '#~q/rest', '#~d/' + encodeURIComponent('cms|Features'), '#~s/cms/api/rest', '#/nope/nope']) {
    await page.evaluate(x => { location.hash = x; }, h);
    await page.waitForTimeout(280);
    const r = await page.evaluate(() => ({ ow: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    if (r.ow > r.cw + 1) overflow.push([h, r.ow, r.cw]);
  }

  // frame time with everything on screen
  await page.evaluate(() => { location.hash = '#~all'; });
  await page.waitForTimeout(900);
  const fps = await page.evaluate(() => new Promise(res => {
    const sc = document.scrollingElement;
    let frames = 0, t0 = performance.now(), maxGap = 0, last = t0;
    function tick(t) {
      const gap = t - last; last = t;
      if (frames > 2) maxGap = Math.max(maxGap, gap);
      frames++;
      window.scrollBy(0, 34);
      if (t - t0 < 1600) requestAnimationFrame(tick);
      else res({ frames, ms: t - t0, avg: (t - t0) / frames, maxGap });
    }
    requestAnimationFrame(tick);
  }));

  const inPageErr = await page.evaluate(() => window.__ERR__);

  console.log(JSON.stringify({
    sampled: checked, firstContentMs: firstContent, bootMs,
    short, overflow, missing,
    consoleErrors: consoleErr.slice(0, 12), inPageErrors: inPageErr.slice(0, 12),
    emptyHash, t1, back, fwd, fps
  }, null, 1));

  await browser.close();
})();
