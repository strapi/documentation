const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8971/';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.addInitScript(() => {
    window.__errs = [];
    window.addEventListener('error', e => window.__errs.push('error: ' + (e.message || e.error)));
    window.addEventListener('unhandledrejection', e => window.__errs.push('rejection: ' + (e.reason && e.reason.message || e.reason)));
  });
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text().slice(0, 300)); });
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 500)));

  const t0 = Date.now();
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__city && window.__city.count && window.__city.count() > 0, { timeout: 30000 });
  console.log('boot ms', Date.now() - t0);
  console.log('buildings', await page.evaluate(() => window.__city.count()));
  const errs = await page.evaluate(() => window.__errs);
  console.log('errs after boot', JSON.stringify(errs.slice(0, 5)));

  await page.evaluate(() => window.__city.home());
  await page.waitForTimeout(500);
  const prof = await page.evaluate(() => window.__city.prof(15));
  console.log('profile', JSON.stringify(prof));
  await page.screenshot({ path: 'qa/world.png' });

  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
