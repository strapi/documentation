const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://127.0.0.1:8971/', { waitUntil: 'load' });
  await p.waitForFunction(() => window.__city && window.__city.count() > 0);
  console.log(JSON.stringify(await p.evaluate(() => window.__city.probe()), null, 1));
  await b.close();
})();
