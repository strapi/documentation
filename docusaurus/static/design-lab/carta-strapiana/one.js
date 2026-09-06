'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const port = process.argv[2], secs = parseInt(process.argv[3] || '12', 10);
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:' + port + '/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.__helm.setState({ distNm: 7.5, sail: 'full', knots: 8 }));
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.__helm.resetSamples());
  await page.waitForTimeout(secs * 1000);
  const r = await page.evaluate(() => {
    const s = window.__helmDiag.samples.slice().sort((a, b) => a - b);
    const p = q => s[Math.floor(q * s.length)];
    const sum = s.reduce((a, b) => a + b, 0);
    return { n: s.length, avg: +(sum / s.length).toFixed(2), fps: +(1000 / (sum / s.length)).toFixed(1),
      p50: +p(0.5).toFixed(2), p95: +p(0.95).toFixed(2), p99: +p(0.99).toFixed(2) };
  });
  console.log(port, JSON.stringify(r));
  await br.close();
})().catch(e => { console.error(String(e).slice(0, 200)); process.exit(1); });
