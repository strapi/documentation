/* Round-1 smoke: every below-deck surface, reduced motion, and the chart's
   own contracts, in one pass. */
'use strict';
const path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const OUT = path.join(__dirname, 'iterlog', 'r8-round1');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.evaluate(() => window.__helm.clearVisit());

  /* the plain index is one keystroke away and still lists all 290 */
  await page.keyboard.press('c');
  await page.waitForSelector('#below:not([hidden])');
  const openMs = await page.evaluate(() => performance.now());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await page.keyboard.press('c');
  await page.waitForTimeout(200);
  await page.evaluate(() => window.__helm.below('index'));
  await page.waitForTimeout(300);
  const idx = await page.evaluate(() => document.querySelectorAll('#pane-index .idxrow').length);

  const tabs = {};
  for (const t of ['chart', 'index', 'log', 'register', 'colophon']) {
    await page.evaluate(x => window.__helm.below(x), t);
    await page.waitForTimeout(450);
    tabs[t] = await page.evaluate(x => {
      const p = document.getElementById('pane-' + x);
      return { hidden: p.hidden, chars: p.textContent.replace(/\s+/g, ' ').trim().length,
        nodes: p.querySelectorAll('*').length };
    }, t);
  }

  /* the chart's own contracts: hover names a place, hover names a beast,
     a click shapes a course, a double-click carries you there */
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForTimeout(700);
  const hov = await page.evaluate(`(() => {
    const r = chart.cv.getBoundingClientRect();
    const S = r.width / 1400;
    const place = chart.marks.find(m => m.isle.mark);
    const beast = chart.marks.find(m => !m.isle.mark);
    const at = m => ({ x: r.left + m.x * S, y: r.top + m.y * S, slug: m.isle.slug, title: m.isle.title });
    return { place: at(place), beast: at(beast), marks: chart.marks.length,
      beastsPickable: chart.marks.filter(m => !m.isle.mark).length };
  })()`);
  await page.mouse.move(hov.place.x, hov.place.y);
  await page.waitForTimeout(120);
  const nP = await page.evaluate(() => document.querySelector('#chartinfo .ci-name').textContent);
  await page.mouse.move(hov.beast.x, hov.beast.y);
  await page.waitForTimeout(120);
  const nB = await page.evaluate(() => document.querySelector('#chartinfo .ci-name').textContent);
  await page.mouse.dblclick(hov.beast.x, hov.beast.y);
  await page.waitForSelector('#anchorage:not([hidden])', { timeout: 5000 });
  const opened = await page.evaluate(() => document.querySelector('.ah-title').textContent);
  await page.evaluate(() => window.__helm.weigh());
  await page.waitForTimeout(300);
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForTimeout(400);
  await page.mouse.click(hov.place.x, hov.place.y);
  await page.waitForTimeout(500);
  const afterClick = await page.evaluate(() => ({ mode: window.__helm.mode(), bound: window.__helmDiag.boundSlug || null }));

  /* labels laid, and none of them adrift on the furniture */
  const lab = await page.evaluate(() => ({
    total: document.querySelectorAll('#chartlabels div[class]').length,
    lands: document.querySelectorAll('#chartlabels .cl-land').length,
    places: document.querySelectorAll('#chartlabels .cl-place').length,
    beasts: document.querySelectorAll('#chartlabels .cl-beast').length,
    keyRows: document.querySelectorAll('#chartkey .ck-row').length
  }));

  console.log('index rows        ', idx);
  console.log('tabs              ', JSON.stringify(tabs));
  console.log('marks / beasts    ', hov.marks, '/', hov.beastsPickable);
  console.log('hover place       ', JSON.stringify(nP), '==', JSON.stringify(hov.place.title), nP === hov.place.title);
  console.log('hover beast       ', JSON.stringify(nB), '==', JSON.stringify(hov.beast.title), nB === hov.beast.title);
  console.log('dblclick opened   ', JSON.stringify(opened));
  console.log('click -> on deck  ', JSON.stringify(afterClick));
  console.log('labels            ', JSON.stringify(lab));

  /* reduced motion: the chart is a still sheet and must be identical */
  const p2 = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  p2.on('pageerror', e => errs.push('RM PAGEERROR ' + e.message));
  await p2.goto('http://127.0.0.1:8123/index.html?scale=1&rm=1');
  await p2.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await p2.evaluate(() => window.__helm.below('chart'));
  await p2.waitForTimeout(900);
  await p2.screenshot({ path: path.join(OUT, '8-becalmed-chart.png') });
  const a = await p2.screenshot();
  await p2.waitForTimeout(1400);
  const b = await p2.screenshot();
  console.log('becalmed chart still', a.equals(b));
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
