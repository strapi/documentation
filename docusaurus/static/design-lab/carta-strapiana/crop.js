'use strict';
const path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const TAG = process.argv[2] || 'crop';
const OUT = path.join(__dirname, 'iterlog', TAG);
require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.evaluate(() => window.__helm.clearVisit());
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForTimeout(1400);
  const info = await page.evaluate(`(() => {
    const r = chart.cv.getBoundingClientRect();
    const big = chart.geo.beasts.slice().sort((a,b)=>b.L-a.L);
    const pick = k => big.filter(b=>b.kind===k).slice(0,2).map(b=>({n:b.isle.sidebarLabel,k:b.kind,x:Math.round(b.x),y:Math.round(b.y),L:Math.round(b.L),words:b.isle.words,commits:b.isle.commits,out:b.isle.outbound,code:b.isle.code,night:b.isle.night,h2:b.isle.nH2,auth:b.isle.authors.length}));
    return { off:{x:r.left,y:r.top}, beasts: [].concat(pick('cete'),pick('serpent'),pick('kraken'),pick('hornfish')),
      lands: chart.geo.regions.filter(r=>r.primary).sort((a,b)=>b.n-a.n).slice(0,4).map(r=>({n:r.name,x:Math.round(r.x),y:Math.round(r.y),a:r.n})) };
  })()`);
  console.log(JSON.stringify(info.beasts.map(b=>[b.n,b.k,b.L,b.x,b.y]), null, 0));
  console.log(JSON.stringify(info.lands));
  const off = info.off;
  for (const b of info.beasts) {
    const w = Math.max(220, b.L * 2.2), h = w * 0.72;
    await page.screenshot({ path: path.join(OUT, 'beast-' + b.k + '-' + b.n.replace(/[^a-z0-9]+/gi, '-').slice(0, 22) + '.png'),
      clip: { x: off.x + b.x - w / 2, y: off.y + b.y - h / 2 + 8, width: w, height: h } });
  }
  for (const l of info.lands) {
    const w = 470, h = 330;
    await page.screenshot({ path: path.join(OUT, 'land-' + l.n.replace(/[^a-z0-9]+/gi, '-').slice(0, 22) + '.png'),
      clip: { x: Math.max(0, off.x + l.x - w / 2), y: Math.max(0, off.y + l.y - h / 2), width: w, height: h } });
  }
  await page.screenshot({ path: path.join(OUT, 'cartouche.png'), clip: { x: off.x + 20, y: off.y + 545, width: 400, height: 250 } });
  await page.screenshot({ path: path.join(OUT, 'rose.png'), clip: { x: off.x + 1170, y: off.y + 40, width: 210, height: 215 } });
  await br.close();
  console.log('ERRORS', errs.length ? errs : 'none');
})().catch(e => { console.error(e); process.exit(1); });
