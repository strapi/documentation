'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  const out = await page.evaluate(() => {
    const w = window.__helmDiag.data;
    const world = { extent: w.seaExtentNm, minSep: w.minIslandSepNm, islands: w.islands,
      arch: w.archipelagos, unarch: w.unarchipelagoed, uncited: w.uncitedIslands };
    return world;
  });
  const conts = await page.evaluate(() => {
    // reach into internals via a helm hook: islands() gives slugs+pos
    const isles = window.__helm.islands();
    let stats = { cms: {minx:1e9,maxx:-1e9,miny:1e9,maxy:-1e9,n:0}, cloud: {minx:1e9,maxx:-1e9,miny:1e9,maxy:-1e9,n:0} };
    for (const i of isles) {
      const p = i.slug.startsWith('/cloud') ? 'cloud' : 'cms';
      const s = stats[p];
      s.n++; s.minx=Math.min(s.minx,i.x); s.maxx=Math.max(s.maxx,i.x);
      s.miny=Math.min(s.miny,i.y); s.maxy=Math.max(s.maxy,i.y);
    }
    return stats;
  });
  console.log('WORLD', JSON.stringify(out));
  const NM = 16;
  for (const k of ['cms','cloud']) {
    const s = conts[k];
    console.log(k, 'n=' + s.n, 'span nm', ((s.maxx-s.minx)*NM).toFixed(1), 'x', ((s.maxy-s.miny)*NM).toFixed(1),
      'centre', ((s.minx+s.maxx)/2*NM).toFixed(1) + ',' + ((s.miny+s.maxy)/2*NM).toFixed(1));
  }
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
