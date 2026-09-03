const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://127.0.0.1:8971/', { waitUntil: 'load' });
  await p.waitForFunction(() => window.__city && window.__city.count() > 0);
  await p.click('#btnWide'); await p.waitForTimeout(300);
  console.log(JSON.stringify(await p.evaluate(() => {
    const x = window.__city.at('/cms/api/document-service');
    window.__city.setCam({ tx: x.wx, ty: x.wy, dist: 900, az: 1.34, el: 0.30 });
    const pr = window.__city.prof(12);
    return { pr, c: window.__city.counts() };
  })));
  await b.close();
})();
