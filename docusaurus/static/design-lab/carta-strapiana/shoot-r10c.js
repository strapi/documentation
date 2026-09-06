'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.evaluate(() => window.__helm.open('/cms/quick-start'));
  await page.waitForTimeout(700);
  await page.evaluate(() => { document.getElementById('pagepaper').scrollTop = 900; });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'iterlog/r10/reading-scrolls.png' });
  console.log('shot reading-scrolls');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
