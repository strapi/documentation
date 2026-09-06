/* Seam probe: the judge's 24 px autocorrelation, plus an edge-period hunt that
   names the lattice if one survives. Runs the sea, the deck (sea shows through it)
   and the spyglass interior, at scale 1 and scale 2. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';
const SCALE = parseFloat(process.argv[2] || '1');

const MEASURE = function (regions) {
  const cv = document.getElementById('sea');
  const g = cv.getContext('2d');
  const S = window.__helmDiag.scale;
  const out = [];
  for (const r of regions) {
    const x0 = Math.round(r.x * S), y0 = Math.round(r.y * S);
    const w = Math.round(r.w * S), h = Math.round(r.h * S);
    const d = g.getImageData(x0, y0, w, h).data;
    const lum = (x, y) => { const i = (y * w + x) * 4; return d[i] * 0.6 + d[i + 1] * 0.3 + d[i + 2] * 0.1; };
    // judge-style column autocorrelation
    const col = new Float64Array(w);
    for (let x = 0; x < w; x++) { let s = 0; for (let y = 0; y < h; y += 2) s += lum(x, y); col[x] = s; }
    let mean = 0; for (let x = 0; x < w; x++) mean += col[x] / w;
    let varsum = 0; for (let x = 0; x < w; x++) varsum += (col[x] - mean) ** 2;
    const ac = (lag) => { let c = 0; const n = w - lag; for (let x = 0; x < n; x++) c += (col[x] - mean) * (col[x + lag] - mean); return c / (varsum * (n / w)); };
    const peaks = [];
    for (let lag = 24; lag <= 480; lag += 4) peaks.push([lag, +ac(lag).toFixed(3)]);
    peaks.sort((a, b) => b[1] - a[1]);
    // edge-period hunt: is there a lattice of vertical discontinuities?
    const edge = new Float64Array(w);
    for (let x = 1; x < w; x++) { let s = 0; for (let y = 0; y < h; y++) s += Math.abs(lum(x, y) - lum(x - 1, y)); edge[x] = s / h; }
    const periods = [];
    for (let p = 6; p <= 120; p++) {
      const acc = new Float64Array(p), cnt = new Float64Array(p);
      for (let x = 1; x < w; x++) { acc[x % p] += edge[x]; cnt[x % p]++; }
      let best = 0, mn = 0;
      for (let q = 0; q < p; q++) { const v = acc[q] / cnt[q]; mn += v / p; if (v > best) best = v; }
      periods.push([p, +(best / mn).toFixed(3)]);
    }
    periods.sort((a, b) => b[1] - a[1]);
    out.push({ name: r.name, ac24: +ac(24).toFixed(3), acTop: peaks.slice(0, 3), edgeTop: periods.slice(0, 4) });
  }
  return out;
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE + '?scale=' + SCALE);
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
  await page.waitForTimeout(1500);

  const SEA_MID  = { name: 'sea-mid(judge region)', x: 0, y: 378, w: 1440, h: 144 };
  const SEA_NEAR = { name: 'sea-near',              x: 0, y: 560, w: 1440, h: 110 };
  const DECK     = { name: 'deck-lower-left',       x: 60, y: 720, w: 900, h: 140 };
  const LENS     = { name: 'lens-interior',         x: 570, y: 210, w: 300, h: 240 };

  async function run(label, setup, regions, settle) {
    await page.evaluate(setup);
    await page.waitForTimeout(settle || 1200);
    const res = await page.evaluate(MEASURE, regions);
    console.log('--- ' + label + ' (scale ' + SCALE + ')');
    for (const r of res) {
      console.log('   ', r.name.padEnd(24), 'ac@24 =', String(r.ac24).padEnd(7),
        '| top ac lags', JSON.stringify(r.acTop), '| top edge periods', JSON.stringify(r.edgeTop));
    }
    return res;
  }

  await run('afternoon, full sail, 2.0 nm',
    () => window.__helm.setState({ distNm: 2.0, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.2 }),
    [SEA_MID, SEA_NEAR, DECK], 2200);
  await run('dusk wash, full sail, 1.6 nm',
    () => window.__helm.setState({ distNm: 1.6, sail: 'full', hour: 'dusk', spyglass: false, knots: 8.2 }),
    [SEA_MID, SEA_NEAR, DECK], 1800);
  await run('close in, half sail, 0.55 nm',
    () => window.__helm.setState({ distNm: 0.55, sail: 'half', hour: 'afternoon', spyglass: false, knots: 4.0 }),
    [SEA_MID, SEA_NEAR, DECK], 1400);
  await run('spyglass raised, 1.8 nm',
    () => window.__helm.setState({ distNm: 1.8, sail: 'full', hour: 'afternoon', spyglass: true, knots: 8.2 }),
    [LENS], 1500);
  await run('spyglass at dusk, 1.6 nm',
    () => window.__helm.setState({ distNm: 1.6, sail: 'full', hour: 'dusk', spyglass: true, knots: 8.2 }),
    [LENS], 1500);
  console.log('CONSOLE ERRORS:', errors.length ? JSON.stringify(errors) : 'none');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
