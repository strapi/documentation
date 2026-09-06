'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const SECS = parseInt(process.argv[2] || '14', 10);
const PASSES = parseInt(process.argv[3] || '4', 10);
async function measure(page, port) {
  await page.goto('http://127.0.0.1:' + port + '/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.__helm.setState({ distNm: 7.5, sail: 'full', knots: 8 }));
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.__helm.resetSamples());
  await page.waitForTimeout(SECS * 1000);
  return page.evaluate(() => {
    const s = window.__helmDiag.samples.slice().sort((a, b) => a - b);
    const p = q => s[Math.floor(q * s.length)];
    const sum = s.reduce((a, b) => a + b, 0);
    return { n: s.length, avg: +(sum / s.length).toFixed(2), p50: +p(0.5).toFixed(2), p95: +p(0.95).toFixed(2) };
  });
}
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const A = [], B = [];
  for (let i = 0; i < PASSES; i++) {
    if (i % 2 === 0) { B.push(await measure(page, 8124)); A.push(await measure(page, 8123)); }
    else { A.push(await measure(page, 8123)); B.push(await measure(page, 8124)); }
  }
  const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  console.log('BEFORE (round-2 build) p95s', B.map(x => x.p95).join(' '), '| median', med(B.map(x => x.p95)), '| p50 median', med(B.map(x => x.p50)));
  console.log('AFTER  (this build)    p95s', A.map(x => x.p95).join(' '), '| median', med(A.map(x => x.p95)), '| p50 median', med(A.map(x => x.p50)));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
