/* STAGE 2 tranche B probe: weather at sea */
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
  await page.waitForTimeout(1500);

  /* the calendar is real and the visit opens in its early clear months */
  const cal = await page.evaluate(() => ({ cal: diag.wxCalendar, wx: diag.wx }));

  /* title guard: at t < 7.5 everything stays becalmed */
  const early = await page.evaluate(() => ({ t: env.t, rain: wx.rain, squall: wx.squall }));

  /* a rain month, forced, eases in */
  await page.evaluate(() => window.__helm.wxForce(5));   /* 2026-03: 13 pages */
  await page.waitForTimeout(9000);
  const rainSt = await page.evaluate(() => diag.wx);
  await page.screenshot({ path: 'iterlog/s2b/s2b-rain.png' });

  /* the squall month */
  await page.evaluate(() => window.__helm.wxForce(8));   /* 2026-06: 160 pages */
  await page.waitForTimeout(11000);
  const squallSt = await page.evaluate(() => diag.wx);
  await page.screenshot({ path: 'iterlog/s2b/s2b-squall.png' });

  /* the bolt: two engraved frames, thunder counted */
  await page.evaluate(() => window.__helm.wxBolt());
  await page.waitForTimeout(60);
  await page.screenshot({ path: 'iterlog/s2b/s2b-fork.png' });
  await page.waitForTimeout(2500);
  const bolt = await page.evaluate(() => ({ frames: wx.forkFrames, fork: !!wx.fork, thunderAtT: diag.thunderAtT }));

  /* clearing */
  await page.evaluate(() => window.__helm.wxForce(0));   /* 2025-10: 0 pages */
  await page.waitForTimeout(11000);
  const clearSt = await page.evaluate(() => diag.wx);
  await page.screenshot({ path: 'iterlog/s2b/s2b-clearing.png' });

  console.log(JSON.stringify({ cal, early, rainSt, squallSt, bolt, clearSt, errs }, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
