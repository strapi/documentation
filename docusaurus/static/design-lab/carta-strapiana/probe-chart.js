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
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForTimeout(1200);
  const d = await page.evaluate(`(() => {
    const geo = chart.geo;
    const named = geo.rings.filter(r=>r.name);
    return {
      chartMs: diag.chartMs, geoMs: +geo.t.toFixed(1),
      rings: geo.rings.length, named: named.length,
      withPlaces: geo.rings.filter(r=>r.places.length).length,
      rocksOff: geo.rocks.length,
      arch: geo.lands.filter(l=>l.arch).map(l=>l.name),
      commRings: [...geo.commRings].map(([c,l])=>[geo.A27[c].name, l.length, l.map(r=>Math.round(r.area))]),
      areas: geo.rings.map(r=>Math.round(r.area)).sort((a,b)=>b-a).slice(0,20),
      places: geo.places.length, lettered: geo.lettered,
      beasts: geo.beasts.length, dropped: geo.beasts.filter(b=>b.dropped).length,
      kinds: geo.beasts.reduce((a,b)=>{a[b.kind]=(a[b.kind]||0)+1;return a;},{}),
      beastPos: geo.beasts.map(b=>[Math.round(b.x),Math.round(b.y),Math.round(b.L),b.kind]),
      marks: chart.marks.length,
      minSepPx: +(0.95/world.nmPerUnit*chart.k).toFixed(2), k: +chart.k.toFixed(1),
      placeKinds: geo.places.reduce((a,p)=>{a[p.mark.kind]=(a[p.mark.kind]||0)+1;return a;},{}),
      hills: geo.places.filter(p=>p.mark.hill).length,
      marsh: geo.places.filter(p=>p.mark.marsh).length,
      labelDivs: document.querySelectorAll('#chartlabels > div').length
    };
  })()`);
  console.log(JSON.stringify(d, null, 1));
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
