/* GATE-0 behavior checks: reduced-motion becalmed mode, order lag timing,
   wheel drag, and console cleanliness. */
'use strict';
const path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  /* 1: order lag: give an order, bearing must NOT move for ~1 s, then move */
  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready);
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.__helm.setState({ distNm: 5, sail: 'full', knots: 8 }));
  await page.waitForTimeout(500);
  const b0 = await page.evaluate(() => window.__helmDiag.bearing);
  await page.evaluate(() => window.__helm.order(40));
  await page.waitForTimeout(600);   // inside the dead second
  const b1 = await page.evaluate(() => window.__helmDiag.bearing);
  await page.waitForTimeout(2400);  // well after it
  const b2 = await page.evaluate(() => window.__helmDiag.bearing);
  await page.waitForTimeout(6000);  // settled
  const b3 = await page.evaluate(() => ({ b: window.__helmDiag.bearing, o: window.__helmDiag.orderedBearing }));
  const still = Math.abs(b1 - b0) < 1.5;
  const turning = Math.abs(b2 - b1) > 4;
  const settled = Math.abs(((b3.b - b3.o + 540) % 360) - 180) < 3;
  console.log('LAG bearing t0:', b0, 't+0.6s:', b1, 't+3s:', b2, 'settled:', JSON.stringify(b3));
  console.log('LAG verdict: still-during-dead-second:', still, '| turning-after:', turning, '| settles-on-order:', settled);

  /* 2: keyboard sail states + spyglass */
  await page.keyboard.press('h');
  await page.waitForTimeout(300);
  const sailH = await page.evaluate(() => window.__helmDiag.sailState);
  await page.keyboard.press('f');
  await page.waitForTimeout(300);
  const sailF = await page.evaluate(() => window.__helmDiag.sailState);
  await page.keyboard.down(' ');
  await page.waitForTimeout(400);
  const glassOn = await page.evaluate(() => window.__helmDiag.spyglass);
  await page.keyboard.up(' ');
  await page.waitForTimeout(200);
  const glassOff = await page.evaluate(() => window.__helmDiag.spyglass);
  console.log('KEYS sail h/f:', sailH, sailF, '| spyglass down/up:', glassOn, glassOff);

  /* 3: wheel drag: press on wheel rim, drag an arc, order must change */
  const before = await page.evaluate(() => window.__helmDiag.orderedBearing);
  await page.mouse.move(720, 700);
  await page.mouse.down();
  await page.mouse.move(850, 760, { steps: 12 });
  await page.mouse.move(860, 850, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => window.__helmDiag.orderedBearing);
  console.log('WHEEL drag order before/after:', before, after, '| changed:', Math.abs(after - before) > 3);

  /* 4: reduced motion: becalmed, instant helm */
  await page.goto(BASE + '?scale=1&rm=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready);
  await page.waitForTimeout(1200);
  const rm0 = await page.evaluate(() => window.__helmDiag.becalmed);
  await page.evaluate(() => window.__helm.order(35));
  await page.waitForTimeout(400);
  const rm1 = await page.evaluate(() => ({ b: window.__helmDiag.bearing, o: window.__helmDiag.orderedBearing }));
  const instant = Math.abs(((rm1.b - rm1.o + 540) % 360) - 180) < 0.5;
  console.log('REDUCED becalmed:', rm0, '| instant helm:', instant, JSON.stringify(rm1));
  await page.screenshot({ path: path.join(__dirname, 'iterlog', 'r5-7-becalmed-reduced-motion.png') });

  console.log('CONSOLE ERRORS:', errors.length ? JSON.stringify(errors) : 'none');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
