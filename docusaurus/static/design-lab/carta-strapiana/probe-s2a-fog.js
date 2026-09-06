/* STAGE 2 tranche A probe: the fog of voyages */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push(String(e)));

  /* cold visit */
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.waitForTimeout(900);

  const cold = await page.evaluate(() => {
    const d = window.__helm.fog();
    const sw = document.getElementById('fogswitch');
    const r = sw.getBoundingClientRect();
    const rumors = document.querySelectorAll('#clgeo .rumor').length;
    const landsShown = document.querySelectorAll('#clgeo .cl-land').length;
    const placesShown = document.querySelectorAll('#clgeo .cl-place').length;
    return {
      fog: d, grid: diag.fogGrid, mode: fog.mode,
      seenIsles: d.seenIsles, totalIsles: world.islands.length,
      rumors, landsShown, placesShown,
      swVisible: r.width > 4 && r.height > 4, swChecked: sw.getAttribute('aria-checked'),
      ciLine: document.querySelector('#chartinfo .ci-line').textContent
    };
  });

  /* hover an unseen isle's mark: the pick gate must refuse her */
  const gate = await page.evaluate(() => {
    let unseenMark = null, seenMark = null;
    for (const m of chart.marks) {
      if (fogHides(m.isle)) { if (!unseenMark) unseenMark = m; }
      else if (!seenMark) seenMark = m;
    }
    const pick = (m) => {
      if (!m) return null;
      const scr = chart.layoutView;
      const x = m.x * scr.z + chart.tx, y = m.y * scr.z + chart.ty;
      return chartPick(x, y) === m ? 'picked' : 'refused';
    };
    return {
      unseenExists: !!unseenMark,
      unseenPick: unseenMark ? (chartPick(unseenMark.x * chart.z + chart.tx, unseenMark.y * chart.z + chart.ty) === unseenMark ? 'picked' : 'refused') : 'n/a',
      seenPick: seenMark ? (chartPick(seenMark.x * chart.z + chart.tx, seenMark.y * chart.z + chart.ty) === seenMark ? 'picked' : 'refused') : 'n/a'
    };
  });

  /* the switch lifts the fog with the animation, then home again */
  await page.evaluate(() => document.getElementById('fogswitch').click());
  const midAnim = await page.evaluate(() => ({ anim: fog.anim, mode: fog.mode }));
  await page.waitForTimeout(2100);
  const lifted = await page.evaluate(() => {
    const sw = document.getElementById('fogswitch');
    return { mode: fog.mode, anim: fog.anim, swChecked: sw.getAttribute('aria-checked'),
      swClassFull: sw.classList.contains('full'),
      rumors: document.querySelectorAll('#clgeo .rumor').length,
      places: document.querySelectorAll('#clgeo .cl-place').length,
      ciLine: document.querySelector('#chartinfo .ci-line').textContent.slice(0, 40) };
  });
  await page.evaluate(() => document.getElementById('fogswitch').click());
  await page.waitForTimeout(2100);
  const home = await page.evaluate(() => ({ mode: fog.mode, anim: fog.anim,
    rumors: document.querySelectorAll('#clgeo .rumor').length }));

  /* persistence: mode + seen survive a reload */
  await page.evaluate(() => { window.__helm.fogMode('full'); visit.save(); });
  await page.reload();
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.waitForTimeout(500);
  const persisted = await page.evaluate(() => ({
    mode: fog.mode, seen: fog.seen.size > 0 }));

  /* keyboard: Tab reaches the switch, Enter flips it */
  await page.evaluate(() => { document.getElementById('fogswitch').focus(); });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1900);
  const keyed = await page.evaluate(() => fog.mode);

  await br.close();

  /* reduced motion: the swap is instant */
  const br2 = await chromium.launch({ headless: true });
  const p2 = await br2.newPage({ viewport: { width: 1440, height: 900 } });
  await p2.goto('http://127.0.0.1:8123/index.html?scale=1&rm=1');
  await p2.evaluate(() => localStorage.clear());
  await p2.goto('http://127.0.0.1:8123/index.html?scale=1&rm=1');
  await p2.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await p2.keyboard.press('c');
  await p2.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await p2.waitForTimeout(400);
  const rmFlip = await p2.evaluate(() => {
    document.getElementById('fogswitch').click();
    return { anim: fog.anim, mode: fog.mode };
  });
  await br2.close();

  console.log(JSON.stringify({ cold, gate, midAnim, lifted, home, persisted, keyed, rmFlip, errs }, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
