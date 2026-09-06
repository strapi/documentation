/* Which lettered names run off the torn sheet edge, at which stops? */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const STOPS = [1, 1.6, 2.6, 4.2, 6.5, 9];
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.waitForTimeout(400);
  const regions = await page.evaluate(`(() => {
    const g = chart.geo;
    const cms = g.conts.find(c => c.key === 'cms'), cloud = g.conts.find(c => c.key === 'cloud');
    return { A:{x:cms.x,y:cms.y}, B:{x:cloud.x,y:cloud.y}, C:{x:g.beasts[0].x,y:g.beasts[0].y} };
  })()`);
  for (const key of ['A','B','C']) {
    const R = regions[key];
    for (const z of STOPS) {
      await page.evaluate(`(() => { chart.zt=${z};
        chart.txt=1400/2-${R.x}*${z}; chart.tyt=810/2-${R.y}*${z};
        chartClampTargets(); kickChartAnim(); })()`);
      await page.waitForFunction('!chart.anim', null, { timeout: 20000 }).catch(()=>{});
      await page.waitForTimeout(380);
      const off = await page.evaluate(`(() => {
        const L = chart.layoutView; if (!L) return [];
        const m = 6; /* honest margin inside the torn edge */
        const sx0 = (15+m)*L.z + L.tx, sx1 = (1400-15-m)*L.z + L.tx;
        const sy0 = (15+m)*L.z + L.ty, sy1 = (810-15-m)*L.z + L.ty;
        /* convert to CSS px like put() does */
        const cs = chart.cv.getBoundingClientRect();
        const X0 = L.dx + sx0*L.S + cs.left, X1 = L.dx + sx1*L.S + cs.left;
        const Y0 = L.dy + sy0*L.S + cs.top,  Y1 = L.dy + sy1*L.S + cs.top;
        const out = [];
        for (const e of document.querySelectorAll('#clgeo > div')) {
          const r = e.getBoundingClientRect(); if (!r.width) continue;
          const overE = r.right - X1, overW = X0 - r.left, overN = Y0 - r.top, overS = r.bottom - Y1;
          const worst = Math.max(overE, overW, overN, overS);
          if (worst > 2) out.push({ t: e.textContent.slice(0,34), cls: e.className,
            E:+overE.toFixed(1), W:+overW.toFixed(1), N:+overN.toFixed(1), S:+overS.toFixed(1) });
        }
        return out;
      })()`);
      if (off.length) console.log(key, 'z' + z, JSON.stringify(off));
    }
  }
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
