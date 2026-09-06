/* Where does the frame go? Time the band pass against everything else, and check
   how the cost moves with slice width. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
  await page.waitForTimeout(1500);

  async function measure(label, state, sw) {
    await page.evaluate(a => { window.__helm.setState(a.s); window.__helm.sliceWidth(a.sw); }, { s: state, sw });
    await page.waitForTimeout(1200);
    await page.evaluate(() => { window.__helm.resetSamples(); });
    await page.waitForTimeout(6000);
    const r = await page.evaluate(() => {
      const s = window.__helmDiag.samples.slice().sort((a, b) => a - b);
      const p = q => s[Math.min(s.length - 1, Math.floor(q * s.length))];
      const sum = s.reduce((a, b) => a + b, 0);
      return { n: s.length, avg: +(sum / s.length).toFixed(2), p50: +p(0.5).toFixed(2), p95: +p(0.95).toFixed(2) };
    });
    console.log(label.padEnd(34), 'sliceW', String(sw).padStart(3), JSON.stringify(r));
  }
  const sailing = { distNm: 2.0, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.2 };
  const glass = { distNm: 1.8, sail: 'full', hour: 'afternoon', spyglass: true, knots: 8.2 };
  const dusk = { distNm: 1.6, sail: 'full', hour: 'dusk', spyglass: false, knots: 8.2 };
  for (const sw of [0, 60, 300]) await measure('sailing, no glass', sailing, sw);
  for (const sw of [0, 300]) await measure('spyglass raised', glass, sw);
  for (const sw of [0, 300]) await measure('dusk', dusk, sw);
  await page.evaluate(() => window.__helm.sliceWidth(0));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
