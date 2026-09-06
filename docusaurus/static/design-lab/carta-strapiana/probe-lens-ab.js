/* The spyglass interior, both builds, at 1x and 2x.
   Sampled strictly inside the glass and below the magnified horizon, so the tube and
   the coastal profile cannot mask the answer. Scans the periods a magnified slice
   lattice would live at (the round-1 lens sliced 12 logical px at 2.6x = 31 screen px). */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');

const MEASURE = function (r) {
  const cv = document.getElementById('sea');
  const g = cv.getContext('2d');
  const S = window.__helmDiag.scale;
  const w = Math.round(r.w * S), h = Math.round(r.h * S);
  const d = g.getImageData(Math.round(r.x * S), Math.round(r.y * S), w, h).data;
  const lum = (x, y) => { const i = (y * w + x) * 4; return d[i] * 0.6 + d[i + 1] * 0.3 + d[i + 2] * 0.1; };
  const edge = new Float64Array(w);
  for (let x = 1; x < w; x++) { let s = 0; for (let y = 0; y < h; y++) s += Math.abs(lum(x, y) - lum(x - 1, y)); edge[x] = s / h; }
  let mean = 0; for (let x = 1; x < w; x++) mean += edge[x] / (w - 1);
  const scan = [];
  for (let p = 10; p <= 80; p++) {
    const acc = new Float64Array(p), cnt = new Float64Array(p);
    for (let x = 1; x < w; x++) { acc[x % p] += edge[x]; cnt[x % p]++; }
    let mx = 0, ph = 0, mn = 0;
    for (let q = 0; q < p; q++) { const v = acc[q] / cnt[q]; mn += v / p; if (v > mx) { mx = v; ph = q; } }
    scan.push({ p, ratio: +(mx / mn).toFixed(3), phase: ph });
  }
  scan.sort((a, b) => b.ratio - a.ratio);
  // maximum single-column edge spike relative to the local median: a seam is a spike
  const sorted = Array.from(edge.slice(1)).sort((a, b) => a - b);
  const med = sorted[Math.floor(sorted.length / 2)];
  let spike = 0;
  for (let x = 1; x < w; x++) spike = Math.max(spike, edge[x] / (med || 1));
  return { top: scan.slice(0, 3), spikeOverMedian: +spike.toFixed(2), meanEdge: +mean.toFixed(2) };
};

const BOX = { x: 600, y: 330, w: 240, h: 130 };   // inside the glass, below its horizon

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const scale of [1, 2]) {
    for (const [url, label] of [['http://127.0.0.1:8124/index.html', 'BEFORE'], ['http://127.0.0.1:8123/index.html', 'AFTER ']]) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(url + '?scale=' + scale);
      await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.__helm.setState({ distNm: 1.8, sail: 'full', hour: 'afternoon', spyglass: true, knots: 8.2 }));
      await page.waitForTimeout(1600);
      const acc = [];
      for (let k = 0; k < 5; k++) { acc.push(await page.evaluate(MEASURE, BOX)); await page.waitForTimeout(200); }
      const avgRatio = +(acc.reduce((s, a) => s + a.top[0].ratio, 0) / acc.length).toFixed(3);
      const avgSpike = +(acc.reduce((s, a) => s + a.spikeOverMedian, 0) / acc.length).toFixed(2);
      console.log(label, 'scale', scale,
        '| best lattice ratio (avg of 5)', avgRatio,
        '| periods', acc.map(a => a.top[0].p).join('/'),
        '| phases', acc.map(a => a.top[0].phase).join('/'),
        '| worst column spike x median', avgSpike);
      await page.close();
    }
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
