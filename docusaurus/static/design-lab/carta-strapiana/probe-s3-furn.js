'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 300)));
  page.on('console', m => { if (m.type() === 'error') errs.push('C ' + m.text().slice(0, 200)); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.evaluate(() => window.__helm.fogMode('full'));
  await page.waitForTimeout(1500);

  /* THE VERIFIER: overlay every collapsed furniture rect on the land pixels */
  const audit = await page.evaluate(() => {
    const geo = chart.geo;
    const mg = furnMask(geo);   /* rebuilt fresh from the same geography */
    const hits = {};
    for (const r of window.__helmDiag.furn.collapsed.concat([Object.assign({ id: 'scale' }, window.__helmDiag.furn.scale)])) {
      const d = mg.getImageData(Math.floor(r.x), Math.floor(r.y), Math.ceil(r.w), Math.ceil(r.h)).data;
      let n = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 8) n++;
      hits[r.id] = n;
    }
    return { hits, docks: window.__helmDiag.furn.docks, faded: window.__helmDiag.furn.faded, open: window.__helmDiag.furn.open };
  });
  console.log('LANDMASK', JSON.stringify(audit));

  /* hover the DIRS tab: the box unfolds; hover KEY: dirs folds, key opens */
  const tabBox = async id => await page.evaluate(i => {
    const el = document.getElementById('fu-' + i);
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, vis: r.width > 0 };
  }, id);
  const td = await tabBox('dirs');
  await page.mouse.move(td.x, td.y);
  await page.waitForTimeout(350);
  const o1 = await page.evaluate(() => ({ open: furn.open, boxHidden: document.getElementById('fu-box').hidden,
    dirsShown: !document.getElementById('chartdirs').hidden }));
  const tk = await tabBox('key');
  await page.mouse.move(tk.x, tk.y);
  await page.waitForTimeout(400);
  const o2 = await page.evaluate(() => ({ open: furn.open, keyShown: !document.getElementById('chartkey').hidden,
    rows: document.querySelectorAll('#chartkey .ck-row').length }));
  /* leave: it folds back */
  await page.mouse.move(700, 400);
  await page.waitForTimeout(600);
  const o3 = await page.evaluate(() => ({ open: furn.open, boxHidden: document.getElementById('fu-box').hidden }));
  console.log('HOVER', JSON.stringify({ o1, o2, o3 }));

  /* click pins the box; Escape folds it and STAYS at the table */
  const tg = await tabBox('glass');
  await page.mouse.click(tg.x, tg.y);
  await page.waitForTimeout(250);
  const o4 = await page.evaluate(() => ({ open: furn.open, sg: document.getElementById('stormglass').textContent.slice(0, 30) }));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  const o5 = await page.evaluate(() => ({ open: furn.open, mode: ui.mode }));
  console.log('CLICK-ESC', JSON.stringify({ o4, o5, stillBelow: o5.mode === 'below' }));

  /* cartouche strip expands into the full identity + live readout */
  const tc = await tabBox('cart');
  await page.mouse.move(tc.x, tc.y);
  await page.waitForTimeout(300);
  const o6 = await page.evaluate(() => ({ open: furn.open,
    title: document.querySelector('#chartcart .cc-title') && document.querySelector('#chartcart .cc-title').textContent,
    info: !document.getElementById('chartinfo').hidden }));
  await page.mouse.move(700, 300);
  await page.waitForTimeout(500);
  console.log('CART', JSON.stringify(o6));

  /* zoom past the first stop: everything fades to tabs; overview returns it */
  await page.evaluate(() => { chartZoomAbout(700, 405, 2.89); kickChartAnim(); });
  await page.waitForTimeout(1200);
  const z1 = await page.evaluate(() => ({ z: +chart.z.toFixed(2), faded: furn.faded,
    cls: document.getElementById('furniture').className, open: furn.open,
    tabOp: getComputedStyle(document.getElementById('fu-dirs')).opacity,
    tabPe: getComputedStyle(document.getElementById('fu-dirs')).pointerEvents }));
  await page.evaluate(() => { chart.zt = 1; chart.txt = 0; chart.tyt = 0; kickChartAnim(); });
  await page.waitForTimeout(1200);
  const z2 = await page.evaluate(() => ({ z: +chart.z.toFixed(2), faded: furn.faded,
    tabOp: getComputedStyle(document.getElementById('fu-dirs')).opacity }));
  console.log('ZOOMFADE', JSON.stringify({ z1, z2 }));

  /* tooltip and voyage still live on the freed sea */
  const m = await page.evaluate(() => {
    const mk = chart.marks.find(q => q.isle.slug === '/cms/quick-start');
    const r = chart.cv.getBoundingClientRect();
    return { x: r.left + (mk.x * chart.z + chart.tx) * r.width / 1400, y: r.top + (mk.y * chart.z + chart.ty) * r.height / 810 };
  });
  await page.mouse.move(m.x, m.y);
  await page.waitForTimeout(300);
  const tip = await page.evaluate(() => ({ hidden: document.getElementById('charttip').hidden,
    name: (document.querySelector('#charttip .ct-name') || {}).textContent }));
  console.log('TOOLTIP', JSON.stringify(tip));

  console.log('ERRS', JSON.stringify(errs));
  await br.close();
})();
