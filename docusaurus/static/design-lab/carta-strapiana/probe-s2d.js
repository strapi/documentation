/* STAGE 2 tranche D probe: log sketches + journal, figurehead, night, cat */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });

  /* some honest crossings first, so the log has entries */
  await page.evaluate(() => window.__helm.open('/cms/api/document-service'));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.__helm.open('/cms/backend-customization/services'));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.__helm.open('/cms/api/document-service'));
  await page.waitForTimeout(400);
  await page.evaluate(() => document.getElementById('weigh').click());
  await page.waitForTimeout(300);

  /* --- IDEA 8: the illustrated log --- */
  await page.evaluate(() => window.__helm.below('log'));
  await page.waitForTimeout(900);
  const log8 = await page.evaluate(() => {
    const sks = [...document.querySelectorAll('canvas.lg-sk')];
    const drawn = sks.map(cv => {
      const g = cv.getContext('2d');
      const d = g.getImageData(0, 0, cv.width, cv.height).data;
      let inked = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 30) inked++;
      return { slug: cv.dataset.slug, inked };
    });
    return { sketches: drawn, exportBtn: !!document.getElementById('logexport') };
  });
  await page.screenshot({ path: 'iterlog/s2d/s2d-log-sketches.png' });
  const journal = await page.evaluate(() => {
    const url = window.__helm.journalPng();
    return { bytes: url.length, meta: diag.journal, isPng: url.startsWith('data:image/png') };
  });

  /* --- IDEA 9: the figurehead --- */
  const fs9 = await page.evaluate(() => window.__helm.firstSentence('/cms/quick-start'));
  await page.evaluate(() => { window.__helm.below(); }).catch(() => {});
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.evaluate(() => window.__helm.fhSay('/cms/quick-start'));
  await page.waitForTimeout(1300);
  const fhShown = await page.evaluate(() => ({
    shown: document.getElementById('figurehead').classList.contains('shown'),
    text: document.querySelector('#figurehead .fh-line').textContent
  }));
  await page.screenshot({ path: 'iterlog/s2d/s2d-figurehead.png' });

  /* the organic law: never twice for the same waters, never within 75 s */
  const fhLaw = await page.evaluate(() => {
    fh.spoken.clear(); fh.lastAt = -1e9; fh.upTil = 0;
    document.getElementById('figurehead').classList.remove('shown');
    /* stand 2 nm off an uncharted water and let the tick speak */
    const I = world.islands.find(i => !visit.charted.has(i.slug) && i.slug !== '/cms/quick-start' && i.words > 300);
    placeShipAtDistance(1.8, I);
    setBound(I, true);
    env.t = 100;
    fhTick();
    const once = document.getElementById('figurehead').classList.contains('shown');
    const spokeFor = diag.fhSpoke;
    document.getElementById('figurehead').classList.remove('shown');
    fhTick();  /* the same waters again: silence */
    const twice = document.getElementById('figurehead').classList.contains('shown');
    return { once, spokeFor, twice, target: I.slug };
  });

  /* --- IDEA 10: night passage --- */
  await page.evaluate(() => { window.__helm.snapHour('dusk'); });
  await page.waitForTimeout(800);
  const night = await page.evaluate(() => {
    const st = window.__helm.stars();
    return { stars: st.length, of: diag.constellation, sample: st.slice(0, 3) };
  });
  await page.screenshot({ path: 'iterlog/s2d/s2d-night-constellation.png' });
  /* steer by a star */
  const steer = await page.evaluate(() => {
    const b0 = diag.bound;
    window.__helm.steerStar(0);
    return { was: b0, now: diag.bound, ordered: diag.orderedBearing, steered: diag.steeredByStar };
  });
  /* lighthouses: sail near a heavily cited cape at dusk and shoot */
  await page.evaluate(() => {
    const I = world.bySlug.get('/cms/api/document-service');
    placeShipAtDistance(1.6, I);
    setBound(I, true);
    ship.sail = 'half';
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'iterlog/s2d/s2d-lighthouses.png' });

  /* --- IDEA 11: the cat --- */
  const catSt = await page.evaluate(() => window.__helm.cat());
  await page.evaluate(() => window.__helm.catWalk());
  await page.waitForTimeout(1200);
  const catWalk = await page.evaluate(() => window.__helm.cat());
  await page.screenshot({ path: 'iterlog/s2d/s2d-cat-walk.png' });
  /* the stare: put her 7.5 nm off a beast water */
  const catStare = await page.evaluate(() => {
    const B = world.bySlug.get(window.__helm.cat().beasts[0]);
    placeShipAtDistance(7.5, B);
    setBound(B, true);
    catTick(0.1);
    return window.__helm.cat();
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'iterlog/s2d/s2d-cat-stare.png' });
  /* the chart cat sleeps near the most-visited water */
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.waitForTimeout(900);
  const chartCat = await page.evaluate(() => ({
    visible: document.getElementById('chartcat').style.display !== 'none',
    diag: diag.chartCat
  }));
  await page.screenshot({ path: 'iterlog/s2d/s2d-cat-chart.png' });

  console.log(JSON.stringify({ log8, journal, fs9: fs9.slice(0, 120), fhShown, fhLaw,
    night, steer, catSt, catWalk, catStare, chartCat, errs }, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
