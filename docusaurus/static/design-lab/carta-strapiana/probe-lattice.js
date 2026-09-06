/* Does the residual edge signature track the slice width? If it does, the slice
   lattice still prints and must be killed at the source-sampling level. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.__helm.setState({ distNm: 2.0, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.2 }));
  await page.waitForTimeout(2000);

  for (const sw of [0, 40, 60, 100, 150]) {
    await page.evaluate(n => window.__helm.sliceWidth(n), sw);
    await page.waitForTimeout(700);
    const r = await page.evaluate(() => {
      const cv = document.getElementById('sea');
      const g = cv.getContext('2d');
      const S = window.__helmDiag.scale;
      const w = Math.round(1440 * S), h = Math.round(144 * S), y0 = Math.round(378 * S);
      const d = g.getImageData(0, y0, w, h).data;
      const lum = (x, y) => { const i = (y * w + x) * 4; return d[i] * 0.6 + d[i+1] * 0.3 + d[i+2] * 0.1; };
      const edge = new Float64Array(w);
      for (let x = 1; x < w; x++) { let s = 0; for (let y = 0; y < h; y++) s += Math.abs(lum(x, y) - lum(x - 1, y)); edge[x] = s / h; }
      const periods = [];
      for (let p = 6; p <= 160; p++) {
        const acc = new Float64Array(p), cnt = new Float64Array(p);
        for (let x = 1; x < w; x++) { acc[x % p] += edge[x]; cnt[x % p]++; }
        let best = 0, ph = 0, mn = 0;
        for (let q = 0; q < p; q++) { const v = acc[q] / cnt[q]; mn += v / p; if (v > best) { best = v; ph = q; } }
        periods.push([p, +(best / mn).toFixed(3), ph]);
      }
      periods.sort((a, b) => b[1] - a[1]);
      return periods.slice(0, 5);
    });
    console.log('sliceW', String(sw).padStart(3), '-> top edge periods', JSON.stringify(r));
  }
  await page.evaluate(() => window.__helm.sliceWidth(0));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
