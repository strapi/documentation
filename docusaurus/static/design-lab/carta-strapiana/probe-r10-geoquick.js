'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true');
  await page.waitForTimeout(400);
  console.log(JSON.stringify((await page.evaluate(() => ({
    beasts: chart.geo && chart.geo.beasts ? chart.geo.beasts.length : null,
    beastNames: chart.geo && chart.geo.beasts ? chart.geo.beasts.map(b => (b.isle && b.isle.slug) + ':' + b.kind) : null,
    decor: chart.geo && chart.geo.decor ? chart.geo.decor.map(e => e.kind) : null, continents2: chart.geo && chart.geo.mains ? chart.geo.mains.length : (chart.geo && chart.geo.lands ? chart.geo.lands.length : null),
    marks: chart.marks.length,
    continents: world.continents ? world.continents.length : null,
    provinces: world.provinces ? world.provinces.length : null,
    uncited: world.islands.filter(i => !i.inbound).length,
    legend: document.getElementById('chartkey') ? document.getElementById('chartkey').innerText.replace(/\n/g, ' | ').slice(0, 400) : null
  }))), null, 1));
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
