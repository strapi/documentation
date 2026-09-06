'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true');
  await page.waitForTimeout(300);
  /* reproduce cms-heart z2.6 exactly as the ladder does */
  const out = await page.evaluate(async () => {
    const cms = chart.geo.conts.find(c => c.key === 'cms');
    chart.zt = 2.6; chart.txt = 1400/2 - cms.x*2.6; chart.tyt = 810/2 - cms.y*2.6;
    chartClampTargets(); kickChartAnim();
    await new Promise(res => { const t0 = performance.now(); (function w() {
      if (!chart.anim || performance.now() - t0 > 20000) return res(); requestAnimationFrame(w); })(); });
    await new Promise(r => setTimeout(r, 450));
    const els = [...document.querySelectorAll('#clgeo > div')];
    const rects = els.map(e => e.getBoundingClientRect());
    const bad = [];
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i], b = rects[j];
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 4 && oy > 3) bad.push({
        A: { t: els[i].textContent, cls: els[i].className, w: +a.width.toFixed(1), h: +a.height.toFixed(1) },
        B: { t: els[j].textContent, cls: els[j].className, w: +b.width.toFixed(1), h: +b.height.toFixed(1) },
        ox: +ox.toFixed(1), oy: +oy.toFixed(1)
      });
    }
    return { S: chart.layoutView.S, bad };
  });
  console.log(JSON.stringify(out, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
