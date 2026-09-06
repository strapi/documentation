/* Round-3 evidence frames. */
'use strict';
const path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';
const OUT = path.join(__dirname, 'iterlog');
const shot = (p, f, opt) => p.screenshot(Object.assign({ path: path.join(OUT, f) }, opt || {}));

(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.evaluate(() => window.__helm.clearVisit());
  await page.waitForTimeout(1500);

  /* --- the six GATE-0 judging frames, for regression --- */
  await page.evaluate(() => window.__helm.setState({ distNm: 2.7, sail: 'rest', hour: 'afternoon', spyglass: false, knots: 0, wheelDeg: 0 }));
  await page.waitForTimeout(1600); await shot(page, 'r7-1-bow-at-rest.png');
  await page.evaluate(() => window.__helm.setState({ distNm: 2.4, sail: 'full', knots: 8.2 }));
  await page.waitForTimeout(2600); await shot(page, 'r7-2-full-sail.png');
  await page.evaluate(() => { window.__helm.setState({ distNm: 2.4, sail: 'full', knots: 8.2 }); });
  await page.waitForTimeout(1400);
  await page.evaluate(() => window.__helm.hardOver(1));
  await page.waitForTimeout(420); await shot(page, 'r7-3-hard-turn-mid-lag.png');
  await page.evaluate(() => window.__helm.setState({ distNm: 1.9, sail: 'full', knots: 8.2, wheelDeg: 0 }));
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.__helm.raiseSpyglass(true));
  await page.waitForTimeout(330); await shot(page, 'r7-4-spyglass-half-resolved.png');
  await page.waitForTimeout(1400); await shot(page, 'r7-4b-spyglass-resolved.png');
  await page.evaluate(() => window.__helm.raiseSpyglass(false));
  await page.evaluate(() => window.__helm.setState({ distNm: 0.42, sail: 'half', knots: 3.6 }));
  await page.waitForTimeout(1800); await shot(page, 'r7-5-island-resolved.png');
  await page.evaluate(() => window.__helm.snapHour('dusk'));
  await page.waitForTimeout(1600); await shot(page, 'r7-6-dusk-wash.png');

  /* --- the approach with riding lights: Document Service, 48 of them --- */
  await page.evaluate(() => { window.__helm.snapHour('dusk'); window.__helm.sailTo('/cms/api/document-service', 0.7); window.__helm.sail('half'); });
  await page.waitForTimeout(2600); await shot(page, 'r7-A-approach-riding-lights-dusk.png');
  await page.evaluate(() => { window.__helm.snapHour('afternoon'); window.__helm.sailTo('/cms/api/document-service', 0.62); window.__helm.sail('half'); });
  await page.waitForTimeout(2400); await shot(page, 'r7-A2-approach-riding-lights.png');
  /* Docker: four lanterns, the most nocturnal page in the corpus */
  await page.evaluate(() => { window.__helm.snapHour('dusk'); window.__helm.sailTo('/cms/installation/docker', 0.5); window.__helm.sail('half'); });
  await page.waitForTimeout(2600); await shot(page, 'r7-B-docker-four-lanterns.png');
  /* a dark shore: /cms/testing, 4064 words, nothing cites it */
  await page.evaluate(() => { window.__helm.snapHour('afternoon'); window.__helm.sailTo('/cms/testing', 0.6); window.__helm.sail('half'); });
  await page.waitForTimeout(2600); await shot(page, 'r7-C-dark-shore-testing.png');
  /* an archipelago from the deck: many islands at once */
  await page.evaluate(() => { window.__helm.placeAt('/cms/features/content-manager', 1.6, 30); window.__helm.sail('full'); });
  await page.waitForTimeout(3400); await shot(page, 'r7-D-archipelago-from-the-deck.png');
  await page.evaluate(() => { window.__helm.snapHour('dusk'); window.__helm.placeAt('/cms/backend-customization/webhooks', 1.7, 0); window.__helm.sail('half'); });
  await page.waitForTimeout(3000); await shot(page, 'r7-D2-archipelago-dusk.png');
  await page.evaluate(() => window.__helm.snapHour('afternoon'));

  /* --- a page open at anchor --- */
  await page.evaluate(() => window.__helm.open('/cms/api/document-service'));
  await page.waitForTimeout(700); await shot(page, 'r7-E-page-at-anchor.png');
  await page.evaluate(() => document.getElementById('pagepaper').scrollTop = 2600);
  await page.waitForTimeout(500); await shot(page, 'r7-E2-page-at-anchor-code-and-endpoint.png');
  await page.evaluate(() => window.__helm.open('/cms/admin-panel-customization/homepage'));
  await page.waitForTimeout(900);
  await page.evaluate(() => document.getElementById('pagepaper').scrollTop = 900);
  await page.waitForTimeout(700); await shot(page, 'r7-E3-page-at-anchor-tabs-and-image.png');

  /* --- the chart table --- */
  await page.evaluate(() => { window.__helm.weigh(); window.__helm.sailTo('/cms/api/document-service', 2.2); });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForTimeout(900); await shot(page, 'r7-F-chart-table-archipelago.png');
  await page.evaluate(() => window.__helm.below('index'));
  await page.waitForTimeout(600); await shot(page, 'r7-G-index-290-pages.png');
  await page.evaluate(() => window.__helm.below('index'));
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__helm.search('middleware'));
  await page.waitForTimeout(500); await shot(page, 'r7-H-search-warp.png');
  await page.evaluate(() => window.__helm.onDeck());
  await page.waitForTimeout(400);

  /* reduced motion: the sea becalmed, the whole design still readable */
  await page.goto(BASE + '?scale=1&rm=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(1800); await shot(page, 'r7-P-becalmed-reduced-motion.png');
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForTimeout(800); await shot(page, 'r7-P2-becalmed-chart-table.png');

  await br.close();
  console.log('ERRORS', errs.length ? errs : 'none');
})().catch(e => { console.error(e); process.exit(1); });
