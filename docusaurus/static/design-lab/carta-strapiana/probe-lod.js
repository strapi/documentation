/* LOD over the crowded continent: at mid zoom the window must letter MORE of
   the places it shows than the far sheet could, and never collide. */
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const OUT = path.join(__dirname, 'iterlog', 'r8zoom');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true', null, { timeout: 15000 });
  await page.waitForTimeout(300);

  /* the continent's heart: the densest ground on the sheet (sheet coords) */
  const heart = await page.evaluate(`(() => {
    /* mean position of the fifty highest-scored places */
    const top = chart.geo.places.slice().sort((a, b) => b.mark.score - a.mark.score).slice(0, 50);
    const x = top.reduce((s, i) => s + i.cx, 0) / top.length;
    const y = top.reduce((s, i) => s + i.cy, 0) / top.length;
    return { x, y };
  })()`);

  const at = async (z) => {
    await page.evaluate(`(() => {
      chart.zt = ${z};
      chart.txt = 700 - ${heart.x} * ${z};
      chart.tyt = 405 - ${heart.y} * ${z};
      chartClampTargets();
      kickChartAnim();
    })()`);
    await page.waitForFunction('!chart.anim', null, { timeout: 6000 });
    await page.waitForTimeout(450);
    return page.evaluate(`(() => {
      const win = m => { const el = m; return true; };
      /* places whose marks sit inside the window, and how many are lettered */
      const seen = chart.geo.places.filter(I => {
        const x = I.cx * chart.z + chart.tx, y = I.cy * chart.z + chart.ty;
        return x > 0 && x < 1400 && y > 0 && y < 810;
      }).length;
      const els = [...document.querySelectorAll('#clgeo div')];
      const rs = els.map(e => e.getBoundingClientRect()).filter(r => r.width > 0 &&
        r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight);
      let pairs = 0;
      for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) {
        const a = rs[i], b = rs[j];
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ox > 2 && oy > 2) pairs++;
      }
      return { z: +chart.z.toFixed(2), inWindow: seen,
        lettered: document.querySelectorAll('#clgeo .cl-place').length,
        lands: document.querySelectorAll('#clgeo .cl-land').length,
        arch: document.querySelectorAll('#clgeo .cl-arch').length,
        labels: rs.length, collide: pairs };
    })()`);
  };

  const far = await at(1);
  const mid = await at(2.6);
  await page.screenshot({ path: path.join(OUT, 'lod-mid.png') });
  const near = await at(5);
  await page.screenshot({ path: path.join(OUT, 'lod-near.png') });

  console.log('far  ', JSON.stringify(far));
  console.log('mid  ', JSON.stringify(mid));
  console.log('near ', JSON.stringify(near));
  console.log('errors', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
