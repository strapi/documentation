const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('PAGEERROR', String(e).slice(0,300)));
  await p.goto('http://127.0.0.1:8971/', { waitUntil: 'load' });
  await p.waitForFunction(() => window.__city && window.__city.count() > 0);
  await p.click('#btnWide');
  await p.waitForTimeout(400);
  await p.evaluate(() => window.__city.home());
  await p.waitForTimeout(200);
  await p.screenshot({ path: 'qa/wide.png' });
  const mid = await p.evaluate(() => {
    const x = window.__city.at('/cms/api/document-service');
    window.__city.setCam({ tx: x.wx, ty: x.wy, dist: 900, az: 1.34, el: 0.30 });
    return window.__city.prof(15);
  });
  await p.screenshot({ path: 'qa/mid.png' });
  console.log('mid', JSON.stringify(mid));
  await b.close();
})();
