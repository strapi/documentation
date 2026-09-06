/* crisp fog at zoom: settle plate exists, key matches, and a shot */
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
  await page.waitForTimeout(700);

  /* zoom about the ship's own water by wheel-like target setting */
  const z = await page.evaluate(() => {
    const p = chartProject(ship.x, ship.y);
    /* aim: put the ship's water at glass center at z 4.6 */
    chart.zt = 4.6;
    chart.txt = CHART_W / 2 - p[0] * 4.6;
    chart.tyt = CHART_H / 2 - p[1] * 4.6;
    chartClampTargets();
    kickChartAnim();
    return true;
  });
  await page.waitForTimeout(1400);
  const st = await page.evaluate(() => ({
    z: chart.z, key: fog.zoomKey, keyNow: fogZoomKeyNow(),
    crisp: !!fog.zoomCv && fog.zoomKey === fogZoomKeyNow(),
    soundings: visit.soundings.length
  }));
  await page.screenshot({ path: 'iterlog/s2a/s2a-fog-zoom-crisp.png' });
  console.log(JSON.stringify({ z, st, errs }, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
