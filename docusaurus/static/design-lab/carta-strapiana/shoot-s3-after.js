'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(1200);
  /* 1. the chart, furniture collapsed to tabs - the sea open */
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.evaluate(() => window.__helm.fogMode('full'));
  await page.waitForTimeout(1600);
  await page.screenshot({ path: 'iterlog/s3/after-chart-furniture.png' });
  /* 2. one box expanded, floating above, re-docking */
  const td = await page.evaluate(() => { const r = document.getElementById('fu-dirs').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.mouse.move(td.x, td.y);
  await page.waitForTimeout(450);
  await page.screenshot({ path: 'iterlog/s3/after-box-expanded.png' });
  await page.mouse.move(700, 400);
  await page.waitForTimeout(600);
  /* 3. the zoom fade: past the first stop the chart belongs to the geography */
  await page.evaluate(() => { chartZoomAbout(700, 405, 2.89); kickChartAnim(); });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'iterlog/s3/after-zoom-faded.png' });
  await page.evaluate(() => { chart.zt = 1; chart.txt = 0; chart.tyt = 0; kickChartAnim(); });
  await page.waitForTimeout(900);
  /* 4. the cat being petted: the arch, mid-purr */
  await page.evaluate(() => window.__helm.onDeck());
  await page.waitForTimeout(400);
  await page.evaluate(() => window.__helm.catSit(0.55));
  await page.waitForTimeout(900);
  const h = await page.evaluate(() => cat.hit);
  await page.mouse.click(h.x, h.y);
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'iterlog/s3/after-cat-petted.png' });
  await page.screenshot({ path: 'iterlog/s3/after-cat-petted-close.png',
    clip: { x: Math.max(0, h.x - 230), y: Math.max(0, h.y - 190), width: 460, height: 340 } });
  console.log(JSON.stringify({ errs, done: 5 }));
  await br.close();
})();
