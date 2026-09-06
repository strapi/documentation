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
  const info = await page.evaluate(() => {
    const pi = world.provinces.findIndex(P => P.section === 'Projects management');
    const G = chart.geo.regions.filter(g => g.prov === pi).map(g => ({
      name: g.name || null, primary: !!g.primary, satellite: !!g.satellite, n: g.n,
      x: Math.round(g.x), y: Math.round(g.y)
    }));
    const allNamed = chart.geo.regions.filter(g => g.name).map(g => g.name);
    return { pi, groups: G, allNamed };
  });
  console.log(JSON.stringify(info, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
