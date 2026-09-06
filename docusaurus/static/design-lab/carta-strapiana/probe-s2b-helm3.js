'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  const run = async (slug) => {
    await page.goto('http://127.0.0.1:8123/index.html?scale=1');
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
    await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
    await page.evaluate((s) => {
      const I = world.bySlug.get(s);
      placeShipAtDistance(2.4, I);
      setBound(I, true);
      ship.sail = 'full';
    }, slug);
    await page.waitForTimeout(9000);
    const st = await page.evaluate(() => ({ helm: +wx.helm.toFixed(3), local: wx.local, kn: diag.knots }));
    const b0 = await page.evaluate(() => { window.__helm.hardOver(1); return diag.bearing; });
    await page.waitForTimeout(2500);
    const d = await page.evaluate(() => diag.bearing) - b0;
    return { st, cameAt2_5s: +(((d % 360) + 360) % 360).toFixed(1) };
  };
  const heavy = await run('/cms/migration/v4-to-v5/breaking-changes');
  const fair = await run('/cms/community');
  console.log(JSON.stringify({ heavy, fair,
    rateRatio: +(heavy.cameAt2_5s / fair.cameAt2_5s).toFixed(3), errs }, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
