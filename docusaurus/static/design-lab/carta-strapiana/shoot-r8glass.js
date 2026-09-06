/* Through the glass: beasts and an archipelago at near zoom, crisp. */
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const OUT = path.join(__dirname, 'iterlog', 'r8-round1');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true', null, { timeout: 15000 });
  await page.waitForTimeout(400);

  const goto = async (x, y, z) => {
    await page.evaluate(`(() => {
      chart.zt = ${z};
      chart.txt = 700 - ${x} * ${z};
      chart.tyt = 405 - ${y} * ${z};
      chartClampTargets();
      kickChartAnim();
    })()`);
    await page.waitForFunction('!chart.anim', null, { timeout: 6000 });
    await page.waitForTimeout(420);
  };
  const spots = await page.evaluate(`(() => {
    const pick = k => chart.geo.beasts.filter(b => b.kind === k).sort((a, b) => b.L - a.L)[0];
    const out = {};
    for (const k of ['hornfish', 'cete', 'serpent', 'kraken']) {
      const b = pick(k); out[k] = { x: b.x, y: b.y, name: b.isle.sidebarLabel };
    }
    const g = chart.geo.regions.filter(x => x.primary).sort((a, b) => b.n - a.n)[0];
    out.arch = { x: g.x, y: g.y, name: g.name };
    return out;
  })()`);

  for (const k of ['hornfish', 'serpent', 'kraken']) {
    await goto(spots[k].x, spots[k].y + 8, 4.2);
    await page.screenshot({ path: path.join(OUT, '9-glass-' + k + '.png'),
      clip: { x: 380, y: 150, width: 660, height: 520 } });
  }
  await goto(spots.arch.x, spots.arch.y, 2.6);
  await page.screenshot({ path: path.join(OUT, '10-glass-archipelago.png') });
  console.log(JSON.stringify(spots));
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
