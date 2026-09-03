const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8971/';

(async () => {
  const browser = await chromium.launch();

  // ---- the world shot: the establishing view of the whole diorama
  const p1 = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  p1.on('pageerror', e => console.log('PAGEERROR', String(e).slice(0, 300)));
  await p1.goto(BASE, { waitUntil: 'load' });
  await p1.waitForFunction(() => window.__city && window.__city.count() > 0);
  await p1.click('#btnWide');
  await p1.waitForTimeout(400);
  await p1.evaluate(() => { const c = window.__city; c.home(); c.setCam({ dist: c.cam().dist * 0.86 }); });
  await p1.waitForTimeout(200);
  await p1.evaluate(() => window.__city.paint());
  await p1.screenshot({ path: 'shot-world.jpg', type: 'jpeg', quality: 75 });
  const fWorld = await p1.evaluate(() => window.__city.prof(30));
  await p1.close();

  // ---- the reading shot: a rich page, city beside it
  const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  p2.on('pageerror', e => console.log('PAGEERROR', String(e).slice(0, 300)));
  await p2.goto(BASE + '#/cms/api/rest', { waitUntil: 'load' });
  await p2.waitForFunction(() => window.__city && window.__city.count() > 0);
  await p2.waitForTimeout(1600);
  await p2.evaluate(() => { document.querySelector('#rbody').scrollTop = 1500; });
  await p2.waitForTimeout(400);
  await p2.screenshot({ path: 'shot-read.jpg', type: 'jpeg', quality: 75 });
  const fRead = await p2.evaluate(() => window.__city.prof(30));
  await p2.close();

  // ---- reduced motion: still, and still navigable
  const p3 = await browser.newPage({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce'
  });
  const rmErr = [];
  p3.on('pageerror', e => rmErr.push(String(e).slice(0, 200)));
  await p3.goto(BASE + '#/cms/intro', { waitUntil: 'load' });
  await p3.waitForFunction(() => window.__city && window.__city.count() > 0);
  await p3.waitForTimeout(700);
  const a = await p3.screenshot();
  await p3.waitForTimeout(1400);
  const b = await p3.screenshot();
  const still = Buffer.compare(a, b) === 0;
  await p3.evaluate(() => { location.hash = '#/cms/api/rest'; });
  await p3.waitForTimeout(500);
  const rmNav = await p3.evaluate(() => ({
    chars: document.querySelector('#doc').innerText.length,
    title: document.title
  }));
  await p3.screenshot({ path: 'qa/reduced.png' });
  await p3.close();

  // ---- narrow viewport: no horizontal overflow anywhere
  const p4 = await browser.newPage({ viewport: { width: 760, height: 720 }, deviceScaleFactor: 1 });
  await p4.goto(BASE + '#/cms/api/rest', { waitUntil: 'load' });
  await p4.waitForFunction(() => window.__city && window.__city.count() > 0);
  await p4.waitForTimeout(400);
  const narrow = await p4.evaluate(() => ({
    ow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    bw: document.body.scrollWidth - document.body.clientWidth
  }));
  await p4.screenshot({ path: 'qa/narrow.png' });
  await p4.close();

  console.log(JSON.stringify({
    frameWorldMs: fWorld, frameReadMs: fRead,
    reducedMotionStill: still, reducedMotionErrors: rmErr, reducedMotionNav: rmNav,
    narrowOverflow: narrow
  }, null, 1));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
