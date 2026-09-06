'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';
(async () => {
  const br = await chromium.launch({ headless: true });

  /* 1. the calm start: hove to, teaching card up, nothing moving */
  let p = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await p.goto(BASE + '?scale=1');
  await p.waitForFunction(() => window.__helm && window.__helm.ready);
  await p.waitForTimeout(2500);
  await p.screenshot({ path: 'iterlog/r9-1-calm-start.png' });
  await p.close();

  /* 2. the glass swept off-centre onto a coast */
  p = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await p.goto(BASE + '?scale=1&sail=half&dist=1.1');
  await p.waitForFunction(() => window.__helm && window.__helm.ready);
  await p.waitForTimeout(1200);
  await p.mouse.move(1000, 360);
  await p.keyboard.down(' ');
  await p.waitForTimeout(1400);
  await p.screenshot({ path: 'iterlog/r9-2-lens-on-coast.png' });
  await p.keyboard.up(' ');
  await p.close();

  /* 3. the nameless city at dusk, 1.1 nm off */
  p = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await p.goto(BASE + '?scale=1&hour=dusk');
  await p.waitForFunction(() => window.__helm && window.__helm.ready);
  await p.evaluate(() => window.__helm.sailToEgg('city', 1.1));
  await p.waitForTimeout(1400);
  await p.screenshot({ path: 'iterlog/r9-3-city-dusk.png' });
  await p.close();

  await br.close();
  console.log('shot');
})().catch(e => { console.error(e); process.exit(1); });
