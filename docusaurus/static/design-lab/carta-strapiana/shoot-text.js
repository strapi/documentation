/* Legibility pass: caption clearance over the wheel and hints in every sail state,
   afternoon and dusk. */
'use strict';
const path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';
const OUT = path.join(__dirname, 'iterlog');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
  await page.waitForTimeout(1200);

  for (const hour of ['afternoon', 'dusk']) {
    await page.evaluate(h => {
      window.__helm.setState({ distNm: 1.2, sail: 'full', hour: h, spyglass: false, knots: 8.2, wheelDeg: 96 });
      window.__helm.say('"By the deep, seven thousand one hundred and eighty-four. Three headlands plain on the bow."');
    }, hour);
    await page.waitForTimeout(1100);
    await page.screenshot({ path: path.join(OUT, `r6-caption-${hour}.png`), clip: { x: 300, y: 460, width: 840, height: 440 } });
  }

  for (const [sail, knots, label] of [['full', 6, 'full'], ['half', 4, 'half'], ['rest', 0, 'furl']]) {
    for (const hour of ['afternoon', 'dusk']) {
      await page.evaluate(a => {
        window.__helm.setState({ distNm: 2.0, sail: a.s, hour: a.h, spyglass: false, knots: a.k });
        document.getElementById('hints').classList.add('shown');
      }, { s: sail, k: knots, h: hour });
      await page.waitForTimeout(1100);
      await page.screenshot({ path: path.join(OUT, `r6-hints-${label}-${hour}.png`), clip: { x: 0, y: 0, width: 620, height: 220 } });
    }
  }
  console.log('errors:', errors.length ? JSON.stringify(errors) : 'none');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
