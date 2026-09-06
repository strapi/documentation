'use strict';
const path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const OUT = path.join(__dirname, 'iterlog', 'r10');
require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });

  /* --- 1. cold load: QUICK START FIRST --- */
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.evaluate(() => window.__helm.clearVisit());
  await page.reload();
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(1500);
  const maiden = await page.evaluate(() => window.__helm.maiden());
  const fb = await page.evaluate(() => {
    const el = document.getElementById('firstbound');
    return { hidden: el.hidden, text: el.textContent };
  });
  console.log('MAIDEN', JSON.stringify(maiden), JSON.stringify(fb));
  // make sail toward QS
  await page.keyboard.press('f');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT, 'maiden-approach.png') });
  const closing = await page.evaluate(() => window.__helm.maiden());
  console.log('CLOSING', JSON.stringify(closing));

  /* --- 2. chart tooltip --- */
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForTimeout(1300);
  // find a mark to hover: use the chart marks via a helm-side computation
  const pt = await page.evaluate(() => {
    const c = document.getElementById('chart').getBoundingClientRect();
    // hover the Document Service anchorage
    const isle = window.__helmSoundIsle('/cms/api/document-service');
    const geo = window.__helmDiag;
    return { cx: c.left, cy: c.top, w: c.width, h: c.height, ix: isle.cx, iy: isle.cy };
  });
  const mx = pt.cx + pt.ix * (pt.w / 1400), my = pt.cy + pt.iy * (pt.h / 810);
  await page.mouse.move(mx, my, { steps: 4 });
  await page.waitForTimeout(400);
  const tip = await page.evaluate(() => {
    const t = document.getElementById('charttip');
    return { hidden: t.hidden, html: t.innerText.replace(/\n/g, ' | '), left: t.style.left, top: t.style.top };
  });
  console.log('TIP', JSON.stringify(tip));
  await page.screenshot({ path: path.join(OUT, 'tooltip.png') });

  /* --- 3. click = passage --- */
  await page.mouse.click(mx, my);
  await page.waitForTimeout(700);   // fold-away + start
  const ps1 = await page.evaluate(() => window.__helm.passageState());
  await page.screenshot({ path: path.join(OUT, 'passage-1.png') });
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, 'passage-2.png') });
  const ps2 = await page.evaluate(() => window.__helm.passageState());
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(OUT, 'passage-3-landed.png') });
  const landed = await page.evaluate(() => ({ p: window.__helmDiag.passage, mode: window.__helm.mode(),
    arrival: window.__helmDiag.arrival || null }));
  console.log('PASSAGE', JSON.stringify(ps1), JSON.stringify(ps2), JSON.stringify(landed));

  /* --- 4. portal confirm on three crossings --- */
  // (a) bottle: click it -> ask -> YES via mouse
  await page.evaluate(() => window.__helm.sailToEgg('bottle', 0.8));
  await page.waitForTimeout(300);
  const route = r => r.abort();
  await page.route('**/secreta/**', route);
  await page.route('**/bythedeep/**', route);
  await page.route('**/secretb/**', route);
  const eggs1 = await page.evaluate(() => { const E = window.__helm.eggs(); return E.hits.map(h => h.key); });
  console.log('EGG HITS', JSON.stringify(eggs1));
  // find bottle hit and click
  const bh = await page.evaluate(() => {
    const E = window.__helm.eggs();
    const h = E.hits.find(h2 => h2.key === 'bottle');
    return h ? { x: h.x, y: h.y } : null;
  });
  if (bh) {
    await page.mouse.click(bh.x * (1440 / 1440), bh.y);
    await page.waitForTimeout(400);
    let po = await page.evaluate(() => window.__helm.portalState());
    console.log('PORTAL bottle open?', JSON.stringify(po));
    await page.screenshot({ path: path.join(OUT, 'portal-ask.png') });
    // NO first (mouse)
    await page.click('#po-no');
    await page.waitForTimeout(300);
    po = await page.evaluate(() => ({ p: window.__helm.portalState(), crossing: window.__helmDiag.crossing }));
    console.log('PORTAL after NO', JSON.stringify(po));
  } else console.log('PORTAL bottle: no hit visible');
  // (b) ink: sail in -> ask -> Y key
  await page.evaluate(() => window.__helm.sailToEgg('ink', 0.4));
  await page.keyboard.press('f');
  await page.waitForTimeout(1200);
  let po2 = await page.evaluate(() => window.__helm.portalState());
  console.log('PORTAL ink open?', JSON.stringify(po2));
  if (po2.open) {
    await page.keyboard.press('y');
    await page.waitForTimeout(500);
    const nav = await page.evaluate(() => ({ crossing: window.__helmDiag.crossing }));
    console.log('PORTAL ink after Y', JSON.stringify(nav));
  }
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
