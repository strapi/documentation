'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&dist=1.45&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForFunction(() => visit.soundings.length >= 1, null, { timeout: 30000 });
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.waitForTimeout(600);
  const info = await page.evaluate(() => {
    const s = visit.soundings[0];
    const p = chartProject(s.x, s.y);
    chart.zt = 7.5;
    chart.txt = CHART_W / 2 - p[0] * 7.5;
    chart.tyt = CHART_H / 2 - p[1] * 7.5;
    chartClampTargets();
    kickChartAnim();
    return { s, p, shipAt: chartProject(ship.x, ship.y) };
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'iterlog/s2a/s2a-sounding-close.png',
    clip: { x: 500, y: 250, width: 640, height: 420 } });
  console.log(JSON.stringify({ info, errs }, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
