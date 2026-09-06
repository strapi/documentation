'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => { errs.push(String(e)); console.log('PAGEERROR', String(e).slice(0,400)); });
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&dist=2.4&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(1500);

  /* --- C4a: dead upwind still closes at a decent pace --- */
  const up = await page.evaluate(() => {
    const w = windAtShip();
    ship.orderedBearing = norm360(w.deg + 180);  /* bow dead into the wind */
    ship.bearing = ship.orderedBearing; ship.omega = 0; ship.orderHist = [[env.t, ship.orderedBearing]];
    setBound(world.island, false); ship.boundLock = false;
    /* park her FAR from everything so the closing floor cannot mask the polar */
    return { windDeg: w.deg, order: ship.orderedBearing };
  });
  await page.waitForTimeout(4000);
  const upRes = await page.evaluate(() => ({ kn: diag.knots, polar: diag.polarFactor, brg: diag.bearing, ord: diag.orderedBearing }));
  console.log('UPWIND', JSON.stringify({ up, upRes, floorOk: upRes.polar >= 0.549, paceOk: upRes.kn >= 8.6 * 0.55 * 0.75 - 0.4 }));

  /* --- C4b: within sight of the bound island the closing pace floors at half full sail --- */
  const nearRes = await page.evaluate(() => {
    const I = world.island;
    placeShipAtDistance(3.0, I);
    /* turn the approach dead upwind: approach dir is downwind, so reverse her onto the other side */
    const w = windAtUnits(I.pos.x, I.pos.y);
    const m = Math.hypot(w.x, w.y) || 1;
    const u = 3.0 / world.nmPerUnit;
    ship.x = I.pos.x + (w.x / m) * u;  /* downwind side: bow to island = dead upwind */
    ship.y = I.pos.y + (w.y / m) * u;
    const brg = norm360(Math.atan2(I.pos.x - ship.x, -(I.pos.y - ship.y)) * 180 / Math.PI);
    ship.bearing = brg; ship.orderedBearing = brg; ship.omega = 0; ship.orderHist = [[env.t, brg]];
    ship.sail = 'full';
    return brg;
  });
  await page.waitForTimeout(4500);
  const near = await page.evaluate(() => ({ kn: diag.knots, d: diag.distNm, bound: diag.bound }));
  console.log('NEARFLOOR', JSON.stringify({ nearRes, near, floorOk: near.kn >= 4.2 }));

  /* --- C3: A beyond ground = taking her in --- */
  await page.evaluate(() => { placeShipAtDistance(2.2, world.island); ship.sail = 'full'; });
  await page.waitForTimeout(300);
  await page.keyboard.press('a');
  await page.waitForTimeout(900);
  const ah1 = await page.evaluate(() => ({
    auto: diag.helmAuto, line: document.getElementById('takingin').textContent,
    hidden: document.getElementById('takingin').hidden, cap: document.getElementById('caption').textContent }));
  console.log('AUTOHELM-ON', JSON.stringify(ah1));
  await page.waitForTimeout(6000);
  const ah2 = await page.evaluate(() => ({ line: document.getElementById('takingin').textContent, d: diag.distNm }));
  console.log('AUTOHELM-COUNTING', JSON.stringify(ah2));
  /* grab the wheel back */
  await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(300); await page.keyboard.up('ArrowLeft');
  await page.waitForTimeout(300);
  const ah3 = await page.evaluate(() => ({ auto: diag.helmAuto, hidden: document.getElementById('takingin').hidden }));
  console.log('AUTOHELM-CANCEL', JSON.stringify(ah3));
  /* A again and ride it to the anchorage: the page must open on arrival */
  await page.keyboard.press('a');
  await page.waitForFunction(() => ui.mode === 'anchor', null, { timeout: 90000 });
  const ah4 = await page.evaluate(() => ({ mode: ui.mode, slug: ui.slug, anchored: diag.anchored, hidden: document.getElementById('takingin').hidden }));
  console.log('AUTOHELM-LANDED', JSON.stringify(ah4));

  /* --- C3: no anchorage in sight --- */
  await page.evaluate(() => { weighAnchor(); });
  await page.waitForTimeout(300);
  const far = await page.evaluate(() => {
    /* park her mid-ocean, far from every shore, no lock */
    let bx = 0, by = 0; for (const I of world.islands) { bx += I.pos.x; by += I.pos.y; }
    bx /= world.islands.length; by /= world.islands.length;
    /* walk outward until nothing is within 8 nm */
    let best = null;
    for (let r = 6; r < 60 && !best; r += 2) {
      for (let a = 0; a < 360 && !best; a += 20) {
        const x = bx + Math.sin(a * Math.PI / 180) * r / world.nmPerUnit;
        const y = by - Math.cos(a * Math.PI / 180) * r / world.nmPerUnit;
        let dmin = 1e9;
        for (const I of world.islands) dmin = Math.min(dmin, Math.hypot(I.pos.x - x, I.pos.y - y) * world.nmPerUnit);
        if (dmin > 7.5) best = { x, y, dmin };
      }
    }
    if (best) { ship.x = best.x; ship.y = best.y; ship.boundLock = false; }
    return best && best.dmin;
  });
  await page.waitForTimeout(600);
  await page.keyboard.press('a');
  await page.waitForTimeout(400);
  const honest = await page.evaluate(() => ({ cap: document.getElementById('caption').textContent, auto: diag.helmAuto }));
  console.log('HONEST', JSON.stringify({ farNearest: far, honest }));

  /* --- C3 reduced motion: A lands and opens immediately --- */
  const rmPage = await br.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  rmPage.on('pageerror', e => errs.push('RM ' + String(e)));
  await rmPage.goto('http://127.0.0.1:8123/index.html?scale=1&dist=2.6&sail=full');
  await rmPage.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await rmPage.waitForTimeout(800);
  await rmPage.keyboard.press('a');
  await rmPage.waitForTimeout(900);
  const rm = await rmPage.evaluate(() => ({ mode: ui.mode, slug: ui.slug, anchored: ship.anchored }));
  console.log('REDUCED-A', JSON.stringify(rm));

  console.log('ERRS', JSON.stringify(errs));
  await br.close();
})();
