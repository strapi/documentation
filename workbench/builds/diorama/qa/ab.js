const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://127.0.0.1:8971/', { waitUntil: 'load' });
  await p.waitForFunction(() => window.__city && window.__city.count() > 0);
  await p.click('#btnWide'); await p.waitForTimeout(300);
  for (const d of [0, 2, 3]) {
    const r = await p.evaluate((d) => {
      const x = window.__city.at('/cms/api/document-service');
      window.__city.setCam({ tx: x.wx, ty: x.wy, dist: 900, az: 1.34, el: 0.30 });
      window.__city.dbg(d);
      return { dbg: d, pr: window.__city.prof(12), c: window.__city.counts() };
    }, d);
    console.log(JSON.stringify(r));
  }
  await b.close();
})();
