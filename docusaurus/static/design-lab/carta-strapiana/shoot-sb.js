'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.evaluate(() => window.__helm.open('/cms/quick-start'));
  await page.waitForTimeout(700);
  const r = await page.evaluate(() => {
    const p = document.getElementById('pagepaper');
    p.scrollTop = 900;
    const b = p.getBoundingClientRect();
    return { right: b.right, top: b.top, h: b.height, sb: p.offsetWidth - p.clientWidth };
  });
  console.log('rect', JSON.stringify(r));
  await page.waitForTimeout(300);
  await page.screenshot({ path: '../../../view/sbstrip.png', clip: { x: r.right - 120, y: r.top, width: 140, height: Math.min(700, r.h) } });
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
