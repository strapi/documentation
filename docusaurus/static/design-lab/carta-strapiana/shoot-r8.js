/* Round-1 evidence for the treasure chart: the full sheet, an archipelago,
   two different monsters, and the cartouche - with a real visit inked on. */
'use strict';
const path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const TAG = process.argv[2] || 'r8';
const OUT = path.join(__dirname, 'iterlog', TAG);
require('fs').mkdirSync(OUT, { recursive: true });

(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.evaluate(() => window.__helm.clearVisit());
  await page.waitForTimeout(600);

  /* a real visit: four landfalls read, and a track between them */
  for (const slug of ['/cms/api/document-service', '/cms/features/draft-and-publish',
    '/cms/installation/docker', '/cms/features/rbac']) {
    await page.evaluate(s => window.__helm.sailTo(s, 1.1), slug);
    await page.waitForTimeout(1500);
    await page.evaluate(s => window.__helm.open(s), slug);
    await page.waitForTimeout(450);
    await page.evaluate(() => window.__helm.weigh());
    await page.waitForTimeout(700);
  }
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(OUT, '1-chart-full.png') });

  const info = await page.evaluate(`(() => {
    const r = chart.cv.getBoundingClientRect();
    const pick = k => chart.geo.beasts.filter(b=>b.kind===k).sort((a,b)=>b.L-a.L)[0];
    const b1 = pick('hornfish'), b2 = pick('cete'), b3 = pick('serpent'), b4 = pick('kraken');
    return {
      off: { x: r.left, y: r.top },
      chartMs: diag.chartMs, geoMs: +chart.geo.t.toFixed(1),
      beasts: [b1,b2,b3,b4].map(b=>({ n:b.isle.sidebarLabel, k:b.kind, x:Math.round(b.x), y:Math.round(b.y),
        L:Math.round(b.L), words:b.isle.words, commits:b.isle.commits, out:b.isle.outbound,
        code:b.isle.code, night:b.isle.night, h2:b.isle.nH2, hands:b.isle.authors.length })),
      arch: (() => { const g = chart.geo.regions.filter(x=>x.primary).sort((a,b)=>b.n-a.n)[0];
        return { n: g.name, x: Math.round(g.x), y: Math.round(g.y) }; })()
    };
  })()`);
  const off = info.off;
  const clip = (x, y, w, h) => ({ x: Math.max(0, off.x + x - w / 2), y: Math.max(0, off.y + y - h / 2), width: w, height: h });
  await page.screenshot({ path: path.join(OUT, '2-archipelago.png'), clip: clip(info.arch.x + 30, info.arch.y + 20, 560, 400) });
  const b = info.beasts;
  await page.screenshot({ path: path.join(OUT, '3-monster-' + b[0].k + '.png'), clip: clip(b[0].x, b[0].y + 6, 330, 250) });
  await page.screenshot({ path: path.join(OUT, '4-monster-' + b[1].k + '.png'), clip: clip(b[1].x, b[1].y + 6, 300, 230) });
  await page.screenshot({ path: path.join(OUT, '4b-monster-' + b[2].k + '.png'), clip: clip(b[2].x, b[2].y + 6, 300, 230) });
  await page.screenshot({ path: path.join(OUT, '4c-monster-' + b[3].k + '.png'), clip: clip(b[3].x, b[3].y + 6, 280, 210) });
  await page.screenshot({ path: path.join(OUT, '5-cartouche.png'), clip: { x: off.x + 18, y: off.y + 540, width: 410, height: 270 } });
  await page.screenshot({ path: path.join(OUT, '6-legend-dragons.png'), clip: { x: off.x + 985, y: off.y + 560, width: 400, height: 240 } });
  await page.screenshot({ path: path.join(OUT, '7-rose.png'), clip: { x: off.x + 1165, y: off.y + 20, width: 220, height: 230 } });
  console.log(JSON.stringify(info.beasts));
  console.log('chartMs', info.chartMs, 'geoMs', info.geoMs);
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
