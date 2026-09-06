/* GATE-0 kill-criteria run: 60 s of full-sail crossing at 1440x900,
   spyglass raised twice; report avg fps and frame p95. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');

const BASE = 'http://127.0.0.1:8123/index.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', e => console.log('pageerror:', e.message));

  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
  await page.waitForTimeout(1500);

  // a long full-sail crossing: start far out so the whole minute is under way
  await page.evaluate(() => {
    window.__helm.setState({ distNm: 7.5, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.0 });
    window.__helm.resetSamples();
  });

  const t0 = Date.now();
  // helm work during the run: two gentle course changes
  const script = [
    [8000, () => window.__helm.order(18)],
    [16000, () => window.__helm.order(-24)],
    [20000, () => window.__helm.raiseSpyglass(true)],
    [26000, () => window.__helm.raiseSpyglass(false)],
    [34000, () => window.__helm.order(12)],
    [42000, () => window.__helm.raiseSpyglass(true)],
    [48000, () => window.__helm.raiseSpyglass(false)],
    [52000, () => window.__helm.order(-10)]
  ];
  for (const [at, fn] of script) {
    const wait = at - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
    await page.evaluate(fn);
  }
  const remaining = 60000 - (Date.now() - t0);
  if (remaining > 0) await page.waitForTimeout(remaining);

  const res = await page.evaluate(() => {
    const s = window.__helmDiag.samples.slice();
    s.sort((a, b) => a - b);
    const p = q => s[Math.min(s.length - 1, Math.floor(q * s.length))];
    const sum = s.reduce((a, b) => a + b, 0);
    return {
      frames: s.length,
      avgFrameMs: +(sum / s.length).toFixed(2),
      avgFps: +(1000 / (sum / s.length)).toFixed(1),
      p50: +p(0.50).toFixed(2),
      p95: +p(0.95).toFixed(2),
      p99: +p(0.99).toFixed(2),
      worst: +s[s.length - 1].toFixed(2),
      diag: {
        bearing: window.__helmDiag.bearing,
        orderedBearing: window.__helmDiag.orderedBearing,
        sailState: window.__helmDiag.sailState,
        knots: window.__helmDiag.knots,
        windDeg: window.__helmDiag.windDeg,
        windKn: window.__helmDiag.windKn,
        polarFactor: window.__helmDiag.polarFactor,
        distNm: window.__helmDiag.distNm
      },
      data: window.__helmDiag.data
    };
  });
  console.log(JSON.stringify(res, null, 2));
  const pass = res.avgFps >= 55 && res.p95 <= 18;
  console.log(pass ? 'KILL-CRITERIA: PASS' : 'KILL-CRITERIA: FAIL');

  // points-of-sailing proof: measure knots downwind vs upwind
  await page.evaluate(() => {
    window.__helm.setState({ distNm: 7.5, sail: 'full', knots: 0 });
  });
  await page.waitForTimeout(9000);
  const down = await page.evaluate(() => ({ knots: window.__helmDiag.knots, polar: window.__helmDiag.polarFactor }));
  await page.evaluate(() => window.__helm.order(180));
  await page.waitForTimeout(26000);
  const up = await page.evaluate(() => ({
    knots: window.__helmDiag.knots, polar: window.__helmDiag.polarFactor,
    bearing: window.__helmDiag.bearing, ordered: window.__helmDiag.orderedBearing
  }));
  console.log('POINTS-OF-SAILING downwind:', JSON.stringify(down), 'upwind:', JSON.stringify(up));

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
