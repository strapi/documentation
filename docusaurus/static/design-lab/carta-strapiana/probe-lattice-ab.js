/* The discriminating lattice test, run on both builds.

   The judge's raw column autocorrelation at one lag cannot separate "periodic patch
   lattice" from "smooth coherent content": a wide bright lens disc on a dark tube, or
   18 rows of sky wash above the horizon, both autocorrelate near 1 at short lags with
   no lattice present at all. So three numbers are reported per region:

     ac24      the judge's raw statistic, unchanged, for continuity
     hp24      the same statistic after removing the low frequencies (a 96 px moving
               average is subtracted): a real lattice survives this, smooth content does not
     latt      peak-over-mean of vertical edge energy folded at the best period in
               6..120 px, with that period and its phase - the direct lattice detector

   Averaged over several frames, because a single frame of a moving sea is noisy. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');

const MEASURE = function (r) {
  const cv = document.getElementById('sea');
  const g = cv.getContext('2d');
  const S = window.__helmDiag.scale;
  const x0 = Math.round(r.x * S), y0 = Math.round(r.y * S);
  const w = Math.round(r.w * S), h = Math.round(r.h * S);
  const d = g.getImageData(x0, y0, w, h).data;
  const lum = (x, y) => { const i = (y * w + x) * 4; return d[i] * 0.6 + d[i + 1] * 0.3 + d[i + 2] * 0.1; };
  const col = new Float64Array(w);
  for (let x = 0; x < w; x++) { let s = 0; for (let y = 0; y < h; y += 2) s += lum(x, y); col[x] = s; }

  function acAt(sig, lag) {
    let mean = 0; for (let i = 0; i < sig.length; i++) mean += sig[i] / sig.length;
    let vs = 0; for (let i = 0; i < sig.length; i++) vs += (sig[i] - mean) ** 2;
    let c = 0; const n = sig.length - lag;
    for (let i = 0; i < n; i++) c += (sig[i] - mean) * (sig[i + lag] - mean);
    return c / (vs * (n / sig.length));
  }
  // high pass: remove a 96 px moving average
  const win = Math.round(96 * S), hp = new Float64Array(w);
  let run = 0;
  for (let x = 0; x < w; x++) {
    run += col[x];
    if (x >= win) run -= col[x - win];
    const m = run / Math.min(x + 1, win);
    hp[x] = col[x] - m;
  }
  // lattice detector on vertical edge energy
  const edge = new Float64Array(w);
  for (let x = 1; x < w; x++) { let s = 0; for (let y = 0; y < h; y++) s += Math.abs(lum(x, y) - lum(x - 1, y)); edge[x] = s / h; }
  let best = { p: 0, ratio: 0, phase: 0 };
  for (let p = 6; p <= 120; p++) {
    const acc = new Float64Array(p), cnt = new Float64Array(p);
    for (let x = 1; x < w; x++) { acc[x % p] += edge[x]; cnt[x % p]++; }
    let mx = 0, ph = 0, mn = 0;
    for (let q = 0; q < p; q++) { const v = acc[q] / cnt[q]; mn += v / p; if (v > mx) { mx = v; ph = q; } }
    const ratio = mx / mn;
    if (ratio > best.ratio) best = { p, ratio: +ratio.toFixed(3), phase: ph };
  }
  const lag = Math.round(24 * S);
  return { ac24: +acAt(col, lag).toFixed(3), hp24: +acAt(hp, lag).toFixed(3), latt: best };
};

const REGIONS = {
  judgeWindow: { x: 0, y: 378, w: 1440, h: 144 },   // exactly the judge's tiling window
  seaOnly:     { x: 0, y: 402, w: 1440, h: 130 },   // below the horizon, no sky wash
  seaNear:     { x: 0, y: 560, w: 1440, h: 120 },
  deck:        { x: 60, y: 720, w: 900, h: 140 },
  lensInside:  { x: 585, y: 215, w: 270, h: 220 }   // inside the lens only, no tube
};

const STATES = {
  far:      { distNm: 7.0, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.2 },
  mid:      { distNm: 2.0, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.2 },
  close:    { distNm: 0.55, sail: 'half', hour: 'afternoon', spyglass: false, knots: 4.0 },
  dusk:     { distNm: 1.6, sail: 'full', hour: 'dusk', spyglass: false, knots: 8.2 },
  spyglass: { distNm: 1.8, sail: 'full', hour: 'afternoon', spyglass: true, knots: 8.2 }
};

async function measureBuild(browser, url, label, scale) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url + '?scale=' + scale);
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  const rows = [];
  for (const [sname, st] of Object.entries(STATES)) {
    await page.evaluate(s => window.__helm.setState(s), st);
    await page.waitForTimeout(1400);
    const regs = sname === 'spyglass'
      ? { judgeWindow: REGIONS.judgeWindow, lensInside: REGIONS.lensInside }
      : { judgeWindow: REGIONS.judgeWindow, seaOnly: REGIONS.seaOnly, seaNear: REGIONS.seaNear, deck: REGIONS.deck };
    for (const [rname, reg] of Object.entries(regs)) {
      const acc = [];
      for (let k = 0; k < 5; k++) {
        acc.push(await page.evaluate(MEASURE, reg));
        await page.waitForTimeout(180);
      }
      const avg = k => +(acc.reduce((s, a) => s + a[k], 0) / acc.length).toFixed(3);
      const lattAvg = +(acc.reduce((s, a) => s + a.latt.ratio, 0) / acc.length).toFixed(2);
      const lattP = acc.map(a => a.latt.p);
      rows.push({ state: sname, region: rname, ac24: avg('ac24'), hp24: avg('hp24'),
                  latt: lattAvg, lattPeriods: lattP.join('/') });
    }
  }
  await page.close();
  console.log('=== ' + label + '  (scale ' + scale + ')');
  console.log('    state     region        ac24    hp24    latt   periods');
  for (const r of rows) {
    console.log('   ', r.state.padEnd(9), r.region.padEnd(13),
      String(r.ac24).padEnd(7), String(r.hp24).padEnd(7), String(r.latt).padEnd(6), r.lattPeriods);
  }
  return rows;
}

(async () => {
  const scale = parseFloat(process.argv[2] || '1');
  const browser = await chromium.launch({ headless: true });
  await measureBuild(browser, 'http://127.0.0.1:8124/index.html', 'BEFORE (round-1 build)', scale);
  await measureBuild(browser, 'http://127.0.0.1:8123/index.html', 'AFTER  (this round)', scale);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
