/* Analyze r1 evidence PNGs for periodic vertical seam structure. */
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');

const files = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 200, height: 200 } });
  await page.setContent('<canvas id="c"></canvas>');
  for (const f of files) {
    const b64 = fs.readFileSync(f).toString('base64');
    const res = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.getElementById('c');
      c.width = img.width; c.height = img.height;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0);
      const W = img.width, H = img.height;
      const d = g.getImageData(0, 0, W, H).data;
      const lum = (x, y) => { const i = (y * W + x) * 4; return d[i] * 0.6 + d[i + 1] * 0.3 + d[i + 2] * 0.1; };

      function bandStats(y0, y1, label) {
        const h = y1 - y0;
        // vertical edge energy per column boundary
        const edge = new Float64Array(W);
        for (let x = 1; x < W; x++) {
          let s = 0;
          for (let y = y0; y < y1; y++) s += Math.abs(lum(x, y) - lum(x - 1, y));
          edge[x] = s / h;
        }
        // periodicity of the edge signal: score each period p by mean of best phase
        const periods = [];
        for (let p = 6; p <= 96; p++) {
          const acc = new Float64Array(p);
          for (let x = 1; x < W; x++) acc[x % p] += edge[x];
          const cnt = new Float64Array(p);
          for (let x = 1; x < W; x++) cnt[x % p]++;
          let best = 0, bestPh = 0, mean = 0;
          for (let k = 0; k < p; k++) { const v = acc[k] / cnt[k]; mean += v / p; if (v > best) { best = v; bestPh = k; } }
          periods.push([p, +(best / mean).toFixed(3), bestPh]);
        }
        periods.sort((a, b) => b[1] - a[1]);
        // column-luminance autocorrelation like the judge's probe
        const col = new Float64Array(W);
        for (let x = 0; x < W; x++) { let s = 0; for (let y = y0; y < y1; y += 2) s += lum(x, y); col[x] = s; }
        const mean = col.reduce((a, b) => a + b, 0) / W;
        let varsum = 0; for (let x = 0; x < W; x++) varsum += (col[x] - mean) ** 2;
        const ac = (lag) => { let c = 0; const n = W - lag; for (let x = 0; x < n; x++) c += (col[x] - mean) * (col[x + lag] - mean); return +(c / (varsum * (n / W))).toFixed(3); };
        return { label, y0, y1, topPeriods: periods.slice(0, 6), ac24: ac(24), ac32: ac(32), ac64: ac(64), ac12: ac(12) };
      }
      const out = [];
      out.push(bandStats(Math.round(H * 0.46), Math.round(H * 0.60), 'sea-mid'));
      out.push(bandStats(Math.round(H * 0.62), Math.round(H * 0.74), 'sea-near'));
      out.push(bandStats(Math.round(H * 0.80), Math.round(H * 0.95), 'deck-low'));
      return { W, H, out };
    }, b64);
    console.log('===', path.basename(f), res.W + 'x' + res.H);
    for (const o of res.out) {
      console.log('  ', o.label, 'y', o.y0 + '-' + o.y1,
        '| ac12', o.ac12, 'ac24', o.ac24, 'ac32', o.ac32, 'ac64', o.ac64,
        '| top edge periods', JSON.stringify(o.topPeriods));
    }
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
