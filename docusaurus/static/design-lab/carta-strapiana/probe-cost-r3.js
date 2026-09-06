'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(1200);
  console.log('BAKE ms/sprite', JSON.stringify(await page.evaluate(() => window.__helm.bakeTimes())));
  async function run(cap, label) {
    await page.evaluate(c => { window.__helm.maxIslands(c); window.__helm.setState({ distNm: 7.5, sail: 'full', knots: 8 }); }, cap);
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.__helm.resetSamples());
    await page.waitForTimeout(12000);
    const r = await page.evaluate(() => {
      const s = window.__helmDiag.samples.slice().sort((a, b) => a - b);
      const p = q => s[Math.floor(q * s.length)];
      return { n: s.length, p50: +p(0.5).toFixed(2), p95: +p(0.95).toFixed(2), worst: +s[s.length - 1].toFixed(2),
        inSight: window.__helmDiag.inSight };
    });
    console.log(label.padEnd(18), JSON.stringify(r));
  }
  await run(18, 'cap 18 (current)');
  await run(1, 'cap 1');
  await run(6, 'cap 6');
  await run(18, 'cap 18 again');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
