'use strict';
const fs = require('fs');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';
(async () => {
  const br = await chromium.launch({ headless: true });

  /* reduced motion: the lens must sit under the hand, instantly */
  let page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE + '?scale=1&rm=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
  await page.keyboard.down(' ');
  await page.mouse.move(260, 640);
  await page.waitForTimeout(450);
  const a = await page.screenshot();
  const dA = await page.evaluate(() => ({ x: window.__helmDiag.lensX, y: window.__helmDiag.lensY, sp: window.__helmDiag.spyglass }));
  await page.mouse.move(1180, 300);
  await page.waitForTimeout(450);
  const b = await page.screenshot();
  const dB = await page.evaluate(() => ({ x: window.__helmDiag.lensX, y: window.__helmDiag.lensY }));
  fs.writeFileSync('iterlog/r9-lens-rm-low-left.png', a);
  fs.writeFileSync('iterlog/r9-lens-rm-high-right.png', b);
  console.log('rm lens A', JSON.stringify(dA), 'B', JSON.stringify(dB),
    'screens differ:', !a.equals(b));
  await page.keyboard.up(' ');
  await page.close();

  /* full motion: eased lag toward the aim; arrows sweep while SPACE held */
  page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
  await page.mouse.move(720, 330);
  await page.keyboard.down(' ');
  await page.waitForTimeout(500);
  await page.mouse.move(1100, 200);
  const lag1 = await page.evaluate(() => ({ x: window.__helmDiag.lensX, ax: window.__helmDiag.lensAimX }));
  await page.waitForTimeout(120);
  const lag2 = await page.evaluate(() => ({ x: window.__helmDiag.lensX, ax: window.__helmDiag.lensAimX }));
  await page.waitForTimeout(1400);
  const lag3 = await page.evaluate(() => ({ x: window.__helmDiag.lensX, ax: window.__helmDiag.lensAimX }));
  console.log('lag: right after move', JSON.stringify(lag1), '+120ms', JSON.stringify(lag2), 'settled', JSON.stringify(lag3));
  const ord0 = await page.evaluate(() => window.__helmDiag.orderedBearing);
  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(600);
  await page.keyboard.up('ArrowLeft');
  const after = await page.evaluate(() => ({ ord: window.__helmDiag.orderedBearing,
    ax: window.__helmDiag.lensAimX, x: window.__helmDiag.lensX }));
  console.log('arrows under glass: ord', ord0, '->', after.ord, '| aim swept to', after.ax, 'lens at', after.x);
  await page.screenshot({ path: 'iterlog/r9-lens-swept-sky.png' });
  await page.keyboard.up(' ');
  /* and with the glass down, arrows steer as always */
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowRight');
  const ord2 = await page.evaluate(() => window.__helmDiag.orderedBearing);
  console.log('arrows without glass steer:', after.ord, '->', ord2, '| errors:', errs.length ? errs : 'none');
  await page.close();
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
