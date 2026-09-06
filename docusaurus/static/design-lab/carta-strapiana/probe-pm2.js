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
  for (const z of [1.0, 1.4, 1.9, 2.6, 3.4, 4.6]) {
    const r = await page.evaluate(async (zz) => {
      const pi = world.provinces.findIndex(P => P.section === 'Projects management');
      const G = chart.geo.regions.find(g => g.prov === pi && g.primary);
      /* geo coords are chart-sheet space at build zoom; re-center on the region */
      chart.zt = zz;
      chart.txt = 1400 / 2 - G.x * zz;
      chart.tyt = 810 / 2 - G.y * zz;
      chartClampTargets(); kickChartAnim();
      await new Promise(res => { const t0 = performance.now(); (function w() {
        if (!chart.anim || performance.now() - t0 > 8000) return res(); requestAnimationFrame(w); })(); });
      await new Promise(res => setTimeout(res, 250));
      const lands = [...document.querySelectorAll('.cl-land')].map(e => e.textContent.trim());
      return { z: zz, has: lands.some(t => /PROJECTS MANAGEMENT/i.test(t)), lands: lands.filter(t=>/CLOUD|PROJECT|ACCOUNT|DEPLOY|ADVANCED|GETTING|COMMAND/i.test(t)) };
    }, z);
    console.log(JSON.stringify(r));
  }
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
