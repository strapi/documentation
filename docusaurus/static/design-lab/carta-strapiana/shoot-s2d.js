'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=half&hour=dusk');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(8500);   /* past the title, dusk settled */

  /* night: lighthouses on the Document Service cape + the constellation */
  await page.evaluate(() => {
    const I = world.bySlug.get('/cms/api/document-service');
    placeShipAtDistance(1.7, I);
    setBound(I, true);
    ship.sail = 'half';
    nightSky.for = '';
  });
  await page.waitForTimeout(1600);
  const st = await page.evaluate(() => ({ stars: nightSky.stars.length, hits: nightSky.hits.length }));
  /* hover a star for her name and the laying line */
  const hover = await page.evaluate(() => {
    const s = nightSky.stars[0];
    const r = document.getElementById('sea').getBoundingClientRect();
    return s ? { x: r.left + s.x * r.width / 1440, y: r.top + s.y * r.height / 900 } : null;
  });
  if (hover) await page.mouse.move(hover.x, hover.y, { steps: 3 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'iterlog/s2d/s2d-night-deck.png' });

  /* the cat walks the rail (day, so she reads clearly) */
  await page.evaluate(() => { window.__helm.snapHour('afternoon'); window.__helm.catWalk(); cat.u = 0.35; });
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'iterlog/s2d/s2d-cat-walk-deck.png' });

  /* the stare toward monster waters, before they raise */
  await page.evaluate(() => {
    const B = world.bySlug.get('/cms/testing');
    placeShipAtDistance(7.6, B);
    setBound(B, true);
    catTick(0.1);
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'iterlog/s2d/s2d-cat-stare-deck.png' });

  /* the figurehead's banderole on open water */
  await page.evaluate(() => window.__helm.fhSay('/cms/quick-start'));
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'iterlog/s2d/s2d-figurehead-deck.png' });

  console.log(JSON.stringify({ st, errs }));
  await br.close();
})();
