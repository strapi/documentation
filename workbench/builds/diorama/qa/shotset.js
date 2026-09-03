/* Multi-camera screenshot set for the diorama improvement loop.
   usage: node qa/shotset.js <outdir> [--reduced]
   Serves nothing: expects http://127.0.0.1:8971/ already up. */
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs = require('fs');
const out = process.argv[2] || '.';
const REDUCED = process.argv.includes('--reduced');
const BASE = 'http://127.0.0.1:8971/';

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
    reducedMotion: REDUCED ? 'reduce' : 'no-preference'
  });
  const page = await ctx.newPage();
  const errs = [];
  await page.addInitScript(() => {
    window.__errs = [];
    window.addEventListener('error', e => window.__errs.push('error: ' + (e.message || e.error)));
    window.addEventListener('unhandledrejection', e =>
      window.__errs.push('rejection: ' + ((e.reason && e.reason.message) || e.reason)));
  });
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 300)));

  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__city && window.__city.count() > 0, { timeout: 30000 });
  await page.waitForTimeout(600);

  // widen: full-canvas world view for all shots
  await page.click('#btnWide');
  await page.waitForTimeout(500);

  const info = await page.evaluate(() => {
    const home = window.__city.home();
    const b = window.__city.bounds();
    const s = window.__city.samples2();
    return { home, b, s };
  });
  console.log('samples', JSON.stringify(info.s));

  async function still() {
    await page.evaluate(() => window.__city.still());
  }
  await still();

  async function shot(name, cam, profN) {
    if (cam) await page.evaluate((c) => { window.__city.setCam(c); }, cam);
    await page.evaluate(() => window.__city.paint());
    await page.waitForTimeout(60);
    await page.screenshot({ path: out + '/' + name + '.png' });
    let prof = null;
    if (profN) prof = await page.evaluate((n) => window.__city.prof(n), profN);
    console.log(name, prof ? JSON.stringify(prof) : '');
  }

  const H = info.home;
  await shot('01-home', null, 12);

  // street level at a heavily cited page
  const ds = await page.evaluate(() => window.__city.at('/cms/api/document-service'));
  if (ds) {
    await shot('02-street', { tx: ds.wx, ty: ds.wy, dist: 300, az: 1.30, el: 0.115 }, 12);
    await shot('03-street-low', { tx: ds.wx, ty: ds.wy, dist: 190, az: 2.4, el: 0.055 });
  }
  // overhead oblique
  await shot('04-high', { tx: H.tx, ty: H.ty, dist: H.dist * 0.62, az: H.az + 0.8, el: 0.58 });
  // backlit: sun behind the camera vs in front
  await shot('05-backlit', { tx: ds ? ds.wx : H.tx, ty: ds ? ds.wy : H.ty, dist: 420, az: 0.62 + Math.PI, el: 0.20 });
  await shot('06-sunface', { tx: ds ? ds.wx : H.tx, ty: ds ? ds.wy : H.ty, dist: 420, az: 0.62, el: 0.16 });

  // archetype close-ups from samples2
  const S = info.s;
  async function at(slugKey, name, dist, az, el) {
    if (!S[slugKey]) return;
    const a = await page.evaluate((s) => window.__city.at(s), S[slugKey].slug);
    if (!a) return;
    await shot(name, { tx: a.wx, ty: a.wy, dist, az, el });
  }
  await at('campanile', '07-campanile', 260, 5.6, 0.22);
  await at('scaffold', '08-scaffold', 240, 1.1, 0.18);
  await at('civic', '09-civic', 240, 0.9, 0.25);
  await at('derelict', '10-derelict', 160, 2.0, 0.14);
  await at('garden', '11-garden', 170, 4.0, 0.20);
  await at('workshop', '12-workshop', 200, 0.3, 0.16);

  // paper corner / deckle: aim at the paper corner from low
  await shot('13-paperedge', { tx: H.tx - info.b.r * 1.1, ty: H.ty + info.b.r * 0.9, dist: 600, az: H.az + 0.5, el: 0.10 });
  // extreme pull-back
  await shot('14-far', { tx: H.tx, ty: H.ty, dist: H.dist * 1.9, az: H.az - 0.35, el: 0.34 });
  // mid establishing from the opposite side
  await shot('15-opposite', { tx: H.tx, ty: H.ty, dist: H.dist * 0.85, az: H.az + Math.PI, el: 0.30 });

  const werrs = await page.evaluate(() => window.__errs);
  console.log('console errors:', JSON.stringify(errs));
  console.log('window errors:', JSON.stringify(werrs));
  await browser.close();
})().catch(e => { console.error('SHOTSET FAILED', e); process.exit(1); });
