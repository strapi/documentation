'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.mouse.click(400, 160);
  await page.evaluate(() => window.__helm.catSit(0.55));
  await page.waitForTimeout(900);
  const h = await page.evaluate(() => cat.hit);
  const clip = { x: Math.max(0, h.x - 200), y: Math.max(0, h.y - 160), width: 400, height: 300 };
  await page.screenshot({ path: 'iterlog/s3/q-cat-sit.png', clip });
  /* the pet: mid-arch */
  await page.mouse.click(h.x, h.y);
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'iterlog/s3/q-cat-arch.png', clip });
  /* the walk */
  await page.waitForTimeout(2200);
  await page.evaluate(() => window.__helm.catWalk());
  await page.waitForTimeout(2500);
  const h2 = await page.evaluate(() => cat.hit);
  await page.screenshot({ path: 'iterlog/s3/q-cat-walk.png',
    clip: { x: Math.max(0, h2.x - 200), y: Math.max(0, h2.y - 160), width: 400, height: 300 } });
  /* the chart cat, bigger now */
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.waitForTimeout(900);
  const cc = await page.evaluate(() => { const r = document.getElementById('chartcat').getBoundingClientRect(); return { x: r.x, y: r.y }; });
  await page.screenshot({ path: 'iterlog/s3/q-cat-chart.png',
    clip: { x: Math.max(0, cc.x - 120), y: Math.max(0, cc.y - 90), width: 320, height: 240 } });
  await br.close();
})();
