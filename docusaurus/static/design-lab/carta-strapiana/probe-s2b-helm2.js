'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  const boot = async (q) => {
    await page.goto('http://127.0.0.1:8123/index.html?scale=1');
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://127.0.0.1:8123/index.html?scale=1' + q);
    await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  };

  /* --- squall country: bound locked on Breaking Changes --- */
  await boot('&sail=full');
  await page.evaluate(() => {
    const I = world.bySlug.get('/cms/migration/v4-to-v5/breaking-changes');
    placeShipAtDistance(1.6, I);
    setBound(I, true);
    ship.sail = 'full';
  });
  await page.waitForTimeout(9000);
  const heavySt = await page.evaluate(() => ({ bound: diag.bound, helm: wx.helm, local: wx.local, knots: diag.knots }));
  const b0 = await page.evaluate(() => { window.__helm.hardOver(1); return diag.bearing; });
  await page.waitForTimeout(5000);
  const heavyTurn = await page.evaluate(() => diag.bearing) - b0;

  /* --- fair water: a low-cited water, same speed, same order --- */
  await boot('&sail=full');
  await page.evaluate(() => {
    const I = world.bySlug.get('/cms/community') || world.islands.find(i => (i.inbound || 0) === 0);
    placeShipAtDistance(1.6, I);
    setBound(I, true);
    ship.sail = 'full';
  });
  await page.waitForTimeout(9000);
  const fairSt = await page.evaluate(() => ({ bound: diag.bound, helm: wx.helm, local: wx.local, knots: diag.knots }));
  const c0 = await page.evaluate(() => { window.__helm.hardOver(1); return diag.bearing; });
  await page.waitForTimeout(5000);
  const fairTurn = await page.evaluate(() => diag.bearing) - c0;

  console.log(JSON.stringify({ heavySt, heavyTurn: +heavyTurn.toFixed(1),
    fairSt, fairTurn: +fairTurn.toFixed(1),
    ratio: +(heavyTurn / fairTurn).toFixed(3), errs }, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
