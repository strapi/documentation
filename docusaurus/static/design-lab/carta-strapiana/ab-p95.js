/* Order-balanced p95, both builds, same machine, same minutes.
   Pass 1 measures BEFORE then AFTER, pass 2 AFTER then BEFORE, so rising or
   falling machine load cannot fall on one build only. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const SECS = parseInt(process.argv[2] || '45', 10);
async function run(br, port) {
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:' + port + '/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.__helm.setState({ distNm: 7.5, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.0 }));
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.__helm.resetSamples());
  const t0 = Date.now();
  const glass = [[8000, true], [14000, false], [26000, true], [32000, false]];
  const orders = [[5000, 18], [20000, -24], [38000, 12]];
  for (let i = 0; i < SECS; i++) {
    await page.waitForTimeout(1000);
    const el = Date.now() - t0;
    for (const [at, on] of glass) if (el >= at && el < at + 1000) await page.evaluate(o => window.__helm.raiseSpyglass(o), on);
    for (const [at, d] of orders) if (el >= at && el < at + 1000) await page.evaluate(d2 => window.__helm.order(d2), d);
  }
  const r = await page.evaluate(() => {
    const s = window.__helmDiag.samples.slice().sort((a, b) => a - b);
    const p = q => s[Math.floor(q * s.length)];
    const sum = s.reduce((a, b) => a + b, 0);
    return { n: s.length, fps: +(1000 / (sum / s.length)).toFixed(1), p50: +p(0.5).toFixed(2), p95: +p(0.95).toFixed(2), p99: +p(0.99).toFixed(2) };
  });
  await page.close();
  return r;
}
(async () => {
  const br = await chromium.launch({ headless: true });
  const A = [], B = [];
  const PASSES = parseInt(process.argv[3] || '2', 10);
  for (let pass = 0; pass < PASSES; pass++) {
    if (pass % 2 === 0) { B.push(await run(br, 8124)); A.push(await run(br, 8123)); }
    else { A.push(await run(br, 8123)); B.push(await run(br, 8124)); }
  }
  const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  console.log('BEFORE (GATE-0 finish build, 1 island) ', JSON.stringify(B), ' p95 median', med(B.map(x => x.p95)));
  console.log('AFTER  (this round, 18 islands in sight)', JSON.stringify(A), ' p95 median', med(A.map(x => x.p95)));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
