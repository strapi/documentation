/* Chart-table evidence frames: full sheet, an archipelago crop, two monsters, the cartouche. */
'use strict';
const path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';
const TAG = process.argv[2] || 'r8';
const OUT = path.join(__dirname, 'iterlog', TAG);
require('fs').mkdirSync(OUT, { recursive: true });
const shot = (p, f, opt) => p.screenshot(Object.assign({ path: path.join(OUT, f) }, opt || {}));

(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.evaluate(() => window.__helm.clearVisit());
  await page.waitForTimeout(900);
  /* a little track inked, and a couple of islands charted, so the visit shows */
  await page.evaluate(async () => {
    window.__helm.sailTo('/cms/api/document-service', 1.4);
  });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForTimeout(1400);
  await shot(page, 'chart-full.png');
  const box = await page.evaluate(() => {
    const c = document.getElementById('chart').getBoundingClientRect();
    return { x: c.left, y: c.top, w: c.width, h: c.height };
  });
  console.log('CHART BOX', JSON.stringify(box));
  await br.close();
  console.log('ERRORS', errs.length ? errs : 'none');
})().catch(e => { console.error(e); process.exit(1); });
