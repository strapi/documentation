/* the stage-2 tour: one lived-in visit, shot end to end */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.route('https://n8n.tools.strapi.team/**', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));

  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(9000);   /* sail the maiden leg a while */

  /* a voyage: land QSG waters area, then a packet run */
  await page.evaluate(() => window.__helm.open('/cms/api/document-service'));
  await page.waitForTimeout(400);
  await page.evaluate(() => { const b = document.querySelector('#shoreside button[data-act="packet"]'); if (b) b.click(); });
  await page.waitForTimeout(200);
  await page.evaluate(() => window.__helm.open('/cms/backend-customization/services'));
  await page.waitForTimeout(400);
  await page.evaluate(() => document.getElementById('weigh').click());
  await page.waitForTimeout(500);

  /* a bottle away */
  await page.keyboard.press('b');
  await page.waitForTimeout(250);
  await page.keyboard.type('The services page could use one more worked example of a custom controller.', { delay: 1 });
  await page.click('#bp-toss');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'iterlog/s2final/tour-1-bottle-drifts.png' });

  /* the known chart, lived in: holes, track, soundings, route, the cat */
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'iterlog/s2final/tour-2-known-chart.png' });

  /* the lift, mid-roll */
  await page.evaluate(() => document.getElementById('fogswitch').click());
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'iterlog/s2final/tour-3-fog-lifting.png' });
  await page.waitForTimeout(1300);
  await page.screenshot({ path: 'iterlog/s2final/tour-4-full-chart.png' });
  await page.evaluate(() => document.getElementById('fogswitch').click());
  await page.waitForTimeout(1900);

  /* the squall month at sea, with the fork held for the plate */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.evaluate(() => window.__helm.wxForce(8));
  await page.waitForTimeout(11000);
  await page.evaluate(() => window.__helm.wxBolt(50));
  await page.waitForTimeout(130);
  await page.screenshot({ path: 'iterlog/s2final/tour-5-squall-fork.png' });

  /* the night passage: lighthouses, the constellation, a star named */
  await page.evaluate(() => { window.__helm.wxForce(0); window.__helm.snapHour('dusk'); });
  await page.evaluate(() => {
    const I = world.bySlug.get('/cms/api/document-service');
    placeShipAtDistance(1.7, I);
    setBound(I, true);
    ship.sail = 'half';
    nightSky.for = '';
  });
  await page.waitForTimeout(6000);
  const hover = await page.evaluate(() => {
    const s = nightSky.stars[1] || nightSky.stars[0];
    const r = document.getElementById('sea').getBoundingClientRect();
    return s ? { x: r.left + s.x * r.width / 1440, y: r.top + s.y * r.height / 900 } : null;
  });
  if (hover) await page.mouse.move(hover.x, hover.y, { steps: 3 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'iterlog/s2final/tour-6-night-passage.png' });

  console.log(JSON.stringify({ errs }));
  await br.close();
})();
