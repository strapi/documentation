/* STAGE 2 tranche A deliverable shots */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));

  /* a voyage first, so the known chart has something honest to show:
     start cold, sail in on the QSG until the leadsman casts, then chart */
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&dist=1.45&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForFunction(() => visit.soundings.length >= 1, null, { timeout: 30000 });
  const s1 = await page.evaluate(() => ({ soundings: visit.soundings.length, seen: fog.seen.size }));

  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'iterlog/s2a/s2a-known-chart.png' });

  /* the lift, caught mid-roll */
  await page.evaluate(() => document.getElementById('fogswitch').click());
  await page.waitForTimeout(650);
  await page.screenshot({ path: 'iterlog/s2a/s2a-fog-lifting.png' });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'iterlog/s2a/s2a-full-chart.png' });

  /* home again, then zoom in on the ship's own water: the numbered soundings */
  await page.evaluate(() => document.getElementById('fogswitch').click());
  await page.waitForTimeout(1900);
  await page.evaluate(() => {
    const p = chartProject(ship.x, ship.y);
    chartZoomAbout(p[0], p[1], 5.2);
    chartSnapToTarget();
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'iterlog/s2a/s2a-soundings-z5.png' });
  const st = await page.evaluate(() => window.__helm.fog());
  console.log(JSON.stringify({ s1, st, errs }, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
