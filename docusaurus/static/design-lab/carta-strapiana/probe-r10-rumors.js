/* RUMORS OF OTHER WATERS - the verifier.
   1. The paragraph stands in the sailing directions, one line per crossing.
   2. Every printed bearing is re-derived here from the live egg positions
      and the home anchorage - measured, not asserted.
   3. The chart carries the three honest marks (eggisle, inkstain, flotsam)
      at the crossings' own water, unlabeled.
   4. Evidence: the plate and the three marks, cropped to iterlog/r10/. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.waitForTimeout(500);

  const R = await page.evaluate(`(() => {
    const el = document.querySelector('.cl-dirs');
    const txt = el ? el.innerText : '';
    const home = world.bySlug.get(world.island.slug);
    const brg = E => compassPoint(norm360(Math.atan2(E.x - home.pos.x, -(E.y - home.pos.y)) * 180 / Math.PI));
    const want = {
      bottle: brg(eggs.bottle), ink: brg(eggs.ink), city: brg(eggs.city),
      path: eggs.pathIsle.title
    };
    const lines = txt.split('\\n').filter(l => l.trim());
    const rumIx = lines.findIndex(l => /RUMORS OF OTHER WATERS/i.test(l));
    const rum = lines.slice(rumIx + 1);
    const has = s => rum.some(l => l.includes(s));
    /* the marks on the sheet, at the crossings' own water */
    const Ppt = (x, y) => [chart.ox + x * chart.k, chart.oy + y * chart.k];
    const d = k => (chart.geo.decor || []).find(e => e.kind === k) || null;
    const near = (D, E, tol) => {
      if (!D || !E) return false;
      const c = Ppt(E.x, E.y);
      return Math.hypot(D.x - c[0], D.y - c[1]) <= tol;
    };
    const isle = d('eggisle'), ink = d('inkstain'), flot = d('flotsam');
    const cityPx = Ppt(eggs.city.x, eggs.city.y);
    return {
      rumHeader: rumIx >= 0, rumLines: rum.length,
      bearingsPrinted: {
        bottle: has(want.bottle + ' of the home anchorage'),
        ink: has(want.ink + ' of the home water'),
        city: has('Far to the ' + want.city),
        path: has(want.path), star: has('does not keep station'), flower: has('pressed flower')
      },
      want,
      marks: {
        eggisle: !!isle, inkstain: !!ink, flotsam: !!flot,
        inkAtHerWater: near(ink, eggs.ink, 2),
        flotsamAtHerWater: near(flot, eggs.bottle, 2),
        isleClampedToEdge: isle ? (Math.abs(isle.x - Math.max(34, Math.min(1406, cityPx[0]))) < 1 &&
                                   Math.abs(isle.y - Math.max(34, Math.min(806, cityPx[1]))) < 1) : false
      },
      crops: {
        plate: el ? (r => ({ x: r.x, y: r.y, w: r.width, h: r.height }))(el.getBoundingClientRect()) : null,
        ink: ink ? { sx: ink.x, sy: ink.y } : null,
        isle: isle ? { sx: isle.x, sy: isle.y } : null,
        flot: flot ? { sx: flot.x, sy: flot.y } : null,
        view: (r => ({ x: r.x, y: r.y }))(chart.cv.getBoundingClientRect())
      }
    };
  })()`);
  console.log(JSON.stringify({ rumHeader: R.rumHeader, rumLines: R.rumLines,
    bearingsPrinted: R.bearingsPrinted, want: R.want, marks: R.marks }, null, 1));

  /* the plate */
  const C = R.crops;
  if (C.plate) await page.screenshot({ path: 'iterlog/r10/rumors-plate.png',
    clip: { x: C.plate.x - 14, y: C.plate.y - 14, width: C.plate.w + 28, height: C.plate.h + 28 } });

  /* each mark, close in: zoom the glass onto it and crop */
  for (const [k, pos] of [['ink', C.ink], ['isle', C.isle], ['flot', C.flot]]) {
    if (!pos) continue;
    await page.evaluate(`(() => {
      chart.zt = 4.6;
      chart.txt = 1400 / 2 - ${pos.sx} * 4.6;
      chart.tyt = 810 / 2 - ${pos.sy} * 4.6;
      chartClampTargets(); kickChartAnim();
    })()`);
    await page.waitForFunction('!chart.anim', null, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(450);
    await page.screenshot({ path: 'iterlog/r10/rumor-mark-' + k + '.png',
      clip: { x: C.view.x + 700 - 240, y: C.view.y + 405 - 170, width: 480, height: 340 } });
  }
  console.log('shot rumors-plate + 3 marks');
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
