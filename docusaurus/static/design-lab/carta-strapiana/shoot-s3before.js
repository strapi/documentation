'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(1200);
  /* the chart, furniture as it stands */
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.evaluate(() => window.__helm.fogMode('full'));
  await page.waitForTimeout(1600);
  await page.screenshot({ path: 'iterlog/s3/before-chart-furniture.png' });
  /* zoomed one stop: furniture pinned over the geography */
  await page.evaluate(() => { chartZoomAbout(700, 405, 2.89); kickChartAnim(); });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'iterlog/s3/before-chart-zoomed.png' });
  await page.evaluate(() => { chart.zt = 1; chart.txt = 0; chart.tyt = 0; kickChartAnim(); });
  await page.waitForTimeout(900);
  /* the cat as she stands: force her onto the rail and shoot */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.evaluate(() => { window.__helm.catWalk(); });
  await page.waitForTimeout(2600);
  const c = await page.evaluate(() => window.__helm.cat());
  await page.screenshot({ path: 'iterlog/s3/before-cat-on-rail.png' });
  console.log(JSON.stringify({ errs, cat: c }));
  await br.close();
})();
