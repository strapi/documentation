/* GATE-0 judging frames: capture the six frames to iterlog/. */
'use strict';
const path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');

const BASE = 'http://127.0.0.1:8123/index.html';
const OUT = path.join(__dirname, 'iterlog');
const TAG = process.argv[2] || 'r1';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', m => { if (m.type() === 'error') console.log('console.error:', m.text()); });
  page.on('pageerror', e => console.log('pageerror:', e.message));

  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
  await page.waitForTimeout(1200);

  async function shot(name, setup, settleMs) {
    await page.evaluate(setup);
    await page.waitForTimeout(settleMs == null ? 900 : settleMs);
    const f = path.join(OUT, `${TAG}-${name}.png`);
    await page.screenshot({ path: f });
    const d = await page.evaluate(() => {
      const { frameMs, avgFrameMs, bearing, orderedBearing, sailState, knots, distNm, lod, spyglass, hour } = window.__helmDiag;
      return { frameMs, avgFrameMs, bearing, orderedBearing, sailState, knots, distNm, lod, spyglass, hour };
    });
    console.log(name, JSON.stringify(d));
  }

  // 1: bow at rest
  await shot('1-bow-at-rest', () => {
    window.__helm.setState({ distNm: 2.7, sail: 'rest', hour: 'afternoon', spyglass: false, knots: 0 });
  }, 1400);

  // 2: full sail, mid crossing
  await shot('2-full-sail', () => {
    window.__helm.setState({ distNm: 2.0, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.2 });
  }, 2500);

  // 3: hard turn mid-lag: wheel hard over 0.5 s ago, bow not yet answering
  await page.evaluate(() => {
    window.__helm.setState({ distNm: 1.9, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.2 });
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => window.__helm.hardOver(1));
  await shot('3-hard-turn-mid-lag', () => {}, 480);

  // 4: spyglass raised, half-resolved
  await shot('4-spyglass-half-resolved', () => {
    window.__helm.setState({ distNm: 1.8, sail: 'full', hour: 'afternoon', spyglass: true, knots: 8.2 });
  }, 1200);

  // 5: the island resolved, naked eye, close in
  await shot('5-island-resolved', () => {
    window.__helm.setState({ distNm: 0.42, sail: 'half', hour: 'afternoon', spyglass: false, knots: 4.4 });
  }, 1300);

  // 6: dusk wash, full sail
  await shot('6-dusk-wash', () => {
    window.__helm.setState({ distNm: 1.6, sail: 'full', hour: 'dusk', spyglass: false, knots: 8.2 });
  }, 1600);

  const data = await page.evaluate(() => window.__helmDiag.data);
  console.log('DATA', JSON.stringify(data));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
