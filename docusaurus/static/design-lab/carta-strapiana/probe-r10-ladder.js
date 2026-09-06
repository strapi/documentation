/* The publishable zoom ladder: three regions x six stops, crisp at every stop,
   labels counted and collision-checked at each. */
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const OUT = path.join(__dirname, 'iterlog', 'r10', 'ladder');
fs.mkdirSync(OUT, { recursive: true });
const STOPS = [1, 1.6, 2.6, 4.2, 6.5, 9];
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.keyboard.press('c');
  await page.waitForSelector('#below:not([hidden])');
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.waitForTimeout(400);
  const regions = await page.evaluate(`(() => {
    const g = chart.geo;
    const cms = g.conts.find(c => c.key === 'cms'), cloud = g.conts.find(c => c.key === 'cloud');
    const beast = g.beasts[0];
    return { A: { x: cms.x, y: cms.y, name: 'cms-heart' },
             B: { x: cloud.x, y: cloud.y, name: 'cloud-main' },
             C: { x: beast.x, y: beast.y, name: 'beast-water' } };
  })()`);
  const box = await page.evaluate(`(() => { const r = chart.cv.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height }; })()`);
  const report = [];
  for (const key of ['A', 'B', 'C']) {
    const R = regions[key];
    for (const z of STOPS) {
      await page.evaluate(`(() => {
        chart.zt = ${z};
        chart.txt = 1400 / 2 - ${R.x} * ${z};
        chart.tyt = 810 / 2 - ${R.y} * ${z};
        chartClampTargets();
        kickChartAnim();
      })()`);
      await page.waitForFunction('!chart.anim', null, { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(420);   /* settle: crisp + letters */
      const st = await page.evaluate(`(() => {
        const crisp = chart.z < 1.0005 ? true :
          (chart.zoomKey === chart.z.toFixed(4) + ',' + chart.tx.toFixed(1) + ',' + chart.ty.toFixed(1));
        /* label collisions in the visible window */
        const els = [...document.querySelectorAll('#clgeo > div')];
        const rects = els.map(e => e.getBoundingClientRect()).filter(r => r.width > 0);
        let hits = 0; const pairs = [];
        for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
          const a = rects[i], b = rects[j];
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (ox > 4 && oy > 3) { hits++; if (pairs.length < 4) pairs.push(els[i].textContent.slice(0,18) + '/' + els[j].textContent.slice(0,18)); }
        }
        return { z: +chart.z.toFixed(2), labels: rects.length, collisions: hits, pairs, crisp,
          ms: window.__helmDiag.chartMs };
      })()`);
      report.push({ region: R.name, ...st });
      await page.screenshot({ path: path.join(OUT, R.name + '-z' + z + '.png'), clip: box });
    }
  }
  for (const r of report) console.log(JSON.stringify(r));
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
