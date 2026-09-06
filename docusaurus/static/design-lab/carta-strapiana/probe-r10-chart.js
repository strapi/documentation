'use strict';
const path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const OUT = path.join(__dirname, 'iterlog', 'r10');
require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForTimeout(1600);
  const st = await page.evaluate(() => {
    const g = window.__helmDiag;
    const geo = (window.__chartGeo = null, null);
    return { chartMs: g.chartMs, chartView: g.chartView };
  });
  const stats = await page.evaluate(() => {
    // read the geo via a fresh hook: attach if missing
    const c = document.getElementById('chart');
    return window.__helmDiag.chartGeoStats || null;
  });
  console.log('STATS', JSON.stringify(st), JSON.stringify(stats));
  await page.screenshot({ path: path.join(OUT, 'geo-far.png') });
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
