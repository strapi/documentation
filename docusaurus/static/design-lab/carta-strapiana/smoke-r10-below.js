/* The r10 heir of smoke-r8: every below-deck surface under the OWNER'S NEW
   CONTRACTS - hover raises the tooltip at the cursor, click makes the passage,
   shift-click shapes a course, the cartouche keeps only the chart identity. */
'use strict';
const path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const OUT = path.join(__dirname, 'iterlog', 'r10');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.evaluate(() => window.__helm.clearVisit());

  await page.keyboard.press('c');
  await page.waitForSelector('#below:not([hidden])');
  await page.evaluate(() => window.__helm.below('index'));
  await page.waitForTimeout(300);
  const idx = await page.evaluate(() => document.querySelectorAll('#pane-index .idxrow').length);

  const tabs = {};
  for (const t of ['chart', 'index', 'log', 'register', 'colophon']) {
    await page.evaluate(x => window.__helm.below(x), t);
    await page.waitForTimeout(450);
    tabs[t] = await page.evaluate(x => {
      const p = document.getElementById('pane-' + x);
      return { hidden: p.hidden, chars: p.textContent.replace(/\s+/g, ' ').trim().length };
    }, t);
  }

  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForFunction('chart.ready === true');
  await page.waitForTimeout(700);
  const hov = await page.evaluate(`(() => {
    const r = chart.cv.getBoundingClientRect();
    const S = r.width / 1400;
    const place = chart.marks.find(m => !m.beast);
    const beast = chart.marks.find(m => m.beast);
    const at = m => ({ x: r.left + (m.x * chart.z + chart.tx) * S, y: r.top + (m.y * chart.z + chart.ty) * S, slug: m.isle.slug, title: m.isle.title });
    return { place: at(place), beast: at(beast), marks: chart.marks.length,
      beasts: chart.marks.filter(m => m.beast).length };
  })()`);
  /* hover a place: the tooltip rises at the cursor; the cartouche stays identity */
  await page.mouse.move(hov.place.x, hov.place.y);
  await page.waitForTimeout(160);
  const tipP = await page.evaluate(() => ({ hidden: document.getElementById('charttip').hidden,
    head: (document.getElementById('charttip').textContent || '').trim().slice(0, 40),
    cart: document.querySelector('#chartinfo .ci-name').textContent }));
  await page.mouse.move(hov.beast.x, hov.beast.y);
  await page.waitForTimeout(160);
  const tipB = await page.evaluate(() => ({ hidden: document.getElementById('charttip').hidden,
    head: (document.getElementById('charttip').textContent || '').trim().slice(0, 40) }));
  /* click makes the passage: the table folds, she sails, she lands */
  await page.mouse.click(hov.place.x, hov.place.y);
  await page.waitForTimeout(3100);
  const clicked = await page.evaluate(() => ({ mode: window.__helm.mode(), landed: window.__helmDiag.passage && window.__helmDiag.passage.landed }));
  /* shift-click shapes a course to sail yourself: on deck, bound set, no passage */
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForFunction('chart.ready === true');
  await page.waitForTimeout(500);
  const h2 = await page.evaluate(`(() => {
    const r = chart.cv.getBoundingClientRect();
    const S = r.width / 1400;
    const m = chart.marks.find(m2 => !m2.beast && m2.isle.slug !== '/cloud/account/account-billing'
      && (m2.x * chart.z + chart.tx) > 60 && (m2.x * chart.z + chart.tx) < 1340
      && (m2.y * chart.z + chart.ty) > 60 && (m2.y * chart.z + chart.ty) < 750);
    return { x: r.left + (m.x * chart.z + chart.tx) * S, y: r.top + (m.y * chart.z + chart.ty) * S, slug: m.isle.slug };
  })()`);
  await page.keyboard.down('Shift');
  await page.mouse.click(h2.x, h2.y);
  await page.keyboard.up('Shift');
  await page.waitForTimeout(500);
  const shift = await page.evaluate(() => ({ mode: window.__helm.mode(), passage: passage.on || passage.closing,
    bound: ship.bound && ship.bound.slug }));

  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForTimeout(600);
  const lab = await page.evaluate(() => ({
    total: document.querySelectorAll('#clgeo > div').length,
    lands: document.querySelectorAll('#clgeo .cl-land').length,
    places: document.querySelectorAll('#clgeo .cl-place').length,
    beasts: document.querySelectorAll('#clgeo .cl-beast').length,
    keyRows: document.querySelectorAll('#chartkey .ck-row').length
  }));

  console.log('index rows        ', idx);
  console.log('tabs              ', JSON.stringify(tabs));
  console.log('marks / beasts    ', hov.marks, '/', hov.beasts);
  console.log('tooltip place     ', JSON.stringify(tipP), 'names it:', tipP.head.indexOf(hov.place.title.slice(0, 12)) >= 0);
  console.log('tooltip beast     ', JSON.stringify(tipB), 'names it:', tipB.head.indexOf(hov.beast.title.slice(0, 12)) >= 0);
  console.log('click = passage   ', JSON.stringify(clicked), 'to', hov.place.slug);
  console.log('shift-click       ', JSON.stringify(shift), 'meant', h2.slug);
  console.log('labels            ', JSON.stringify(lab));

  const p2 = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  p2.on('pageerror', e => errs.push('RM PAGEERROR ' + e.message));
  await p2.goto('http://127.0.0.1:8123/index.html?scale=1&rm=1');
  await p2.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await p2.evaluate(() => window.__helm.below('chart'));
  await p2.waitForTimeout(900);
  const a = await p2.screenshot();
  await p2.waitForTimeout(1400);
  const b = await p2.screenshot();
  console.log('becalmed chart still', a.equals(b));
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
