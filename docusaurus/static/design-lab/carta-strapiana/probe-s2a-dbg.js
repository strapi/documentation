'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', m => console.log('[' + m.type() + ']', m.text().slice(0, 300)));
  page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 600)));
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 }).catch(() => console.log('helm never ready'));
  await page.keyboard.press('c');
  await page.waitForTimeout(4000);
  const st = await page.evaluate(() => ({ ready: typeof chart !== 'undefined' && chart.ready, below: !document.getElementById('below').hidden }));
  console.log(JSON.stringify(st));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
