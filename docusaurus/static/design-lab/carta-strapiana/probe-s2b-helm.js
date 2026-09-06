/* squall country: heavier helm at Breaking Changes, bounded; the glass reads her */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });

  /* bind for Breaking Changes: warp to her roadstead, weigh, sail her waters */
  await page.evaluate(() => { window.__helm.open('/cms/migration/v4-to-v5/breaking-changes'); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { document.getElementById('weigh').click(); });
  await page.waitForTimeout(400);
  await page.keyboard.press('f');
  await page.waitForTimeout(9000);
  const st = await page.evaluate(() => ({
    bound: diag.bound, wx: diag.wx, anchored: diag.anchored }));

  /* she still answers: hard over, the bow must come round */
  const b0 = await page.evaluate(() => diag.bearing);
  await page.evaluate(() => window.__helm.hardOver(1));
  await page.waitForTimeout(5000);
  const b1 = await page.evaluate(() => diag.bearing);

  /* the storm-glass reads the squall country before you sail */
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.waitForTimeout(800);
  const glass = await page.evaluate(() => ({
    txt: document.getElementById('stormglass').textContent,
    rules: [...document.querySelectorAll('#chartkey .ck-rule')].map(e => e.textContent) }));
  await page.screenshot({ path: 'iterlog/s2b/s2b-stormglass-chart.png' });

  console.log(JSON.stringify({ st, turn: { b0, b1, came: Math.abs(b1 - b0) }, glass, errs }, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
