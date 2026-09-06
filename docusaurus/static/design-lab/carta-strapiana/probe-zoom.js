/* The reading glass over the chart: wheel about the hand, drag to pan, keys,
   LOD lettering, collision-free labels, pick-through-the-glass, reduced motion. */
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const OUT = path.join(__dirname, 'iterlog', 'r8zoom');
fs.mkdirSync(OUT, { recursive: true });

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
  await page.waitForFunction('chart.ready === true', null, { timeout: 15000 });
  await page.waitForTimeout(300);

  const view0 = await page.evaluate('({ z: chart.z, tx: chart.tx, ty: chart.ty })');

  /* --- 1. wheel zoom centred on the hand --- */
  /* a point over the central continent, in client coords */
  const anchor = await page.evaluate(`(() => {
    const r = chart.cv.getBoundingClientRect();
    const S = r.width / 1400;
    /* the sheet point under the client point, before zoom */
    const cx = r.left + 700 * S, cy = r.top + 470 * S;
    const sx = ((cx - r.left) / S - chart.tx) / chart.z;
    const sy = ((cy - r.top) / S - chart.ty) / chart.z;
    return { cx, cy, sx, sy, S };
  })()`);
  await page.mouse.move(anchor.cx, anchor.cy);
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, -240); await page.waitForTimeout(70); }
  await page.waitForFunction('!chart.anim', null, { timeout: 5000 });
  await page.waitForTimeout(400); /* settle: crisp render + relayout */
  const afterWheel = await page.evaluate(`(() => {
    const r = chart.cv.getBoundingClientRect();
    const S = r.width / 1400;
    const vx = ${anchor.sx} * chart.z + chart.tx;
    const vy = ${anchor.sy} * chart.z + chart.ty;
    return { z: chart.z, crisp: chart.zoomKey !== '' &&
      chart.zoomKey === chart.z.toFixed(4) + ',' + chart.tx.toFixed(1) + ',' + chart.ty.toFixed(1),
      handX: r.left + vx * S, handY: r.top + vy * S };
  })()`);
  const anchorDrift = Math.hypot(afterWheel.handX - anchor.cx, afterWheel.handY - anchor.cy);

  /* --- 2. LOD: more places lettered leaning in --- */
  const labelsFar = await page.evaluate(`(() => ({
    places: document.querySelectorAll('#clgeo .cl-place').length,
    lands: document.querySelectorAll('#clgeo .cl-land').length }))()`);
  /* re-open at identity for the far count */
  await page.evaluate('(() => { chart.zt = 1; chart.txt = 0; chart.tyt = 0; })()');
  await page.evaluate('kickChartAnim()');
  await page.waitForFunction('!chart.anim && chart.z < 1.001', null, { timeout: 5000 });
  await page.waitForTimeout(350);
  const labelsNear = labelsFar; /* counted while zoomed above */
  const labelsBase = await page.evaluate(`(() => ({
    places: document.querySelectorAll('#clgeo .cl-place').length,
    lands: document.querySelectorAll('#clgeo .cl-land').length }))()`);

  /* --- 3. label collisions at the near stop --- */
  await page.mouse.move(anchor.cx, anchor.cy);
  for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, -240); await page.waitForTimeout(60); }
  await page.waitForFunction('!chart.anim', null, { timeout: 5000 });
  await page.waitForTimeout(420);
  const collide = await page.evaluate(`(() => {
    const els = [...document.querySelectorAll('#clgeo div')];
    const rs = els.map(e => e.getBoundingClientRect()).filter(r => r.width > 0 &&
      r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight);
    let worst = 0, pairs = 0;
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) {
      const a = rs[i], b = rs[j];
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 2 && oy > 2) { pairs++; worst = Math.max(worst, Math.min(ox, oy)); }
    }
    return { labels: rs.length, pairs, worst: +worst.toFixed(1), z: +chart.z.toFixed(2) };
  })()`);

  /* --- 4. pick through the glass: hover names her, dblclick carries ---
     The pick gate lawfully refuses a fogged water, so the deep window is
     centred on the nearest SEEN mark first (on a cold visit only the
     ship's own surveyed waters are pickable - that is the fog law). */
  await page.evaluate(`(() => {
    const cx0 = (700 - chart.tx) / chart.z, cy0 = (405 - chart.ty) / chart.z;
    let best = null, bd = 1e9;
    for (const m of chart.marks) {
      if (fogHides(m.isle)) continue;
      const d = Math.hypot(m.x - cx0, m.y - cy0);
      if (d < bd) { bd = d; best = m; }
    }
    chart.zt = chart.z;
    chart.txt = 700 - best.x * chart.z;
    chart.tyt = 405 - best.y * chart.z;
    kickChartAnim();
  })()`);
  await page.waitForFunction('!chart.anim', null, { timeout: 5000 });
  await page.waitForTimeout(420);
  const pickTarget = await page.evaluate(`(() => {
    const r = chart.cv.getBoundingClientRect();
    const S = r.width / 1400;
    const cx0 = (700 - chart.tx) / chart.z, cy0 = (405 - chart.ty) / chart.z;
    let best = null, bd = 1e9;
    for (const m of chart.marks) {
      if (fogHides(m.isle)) continue;
      const d = Math.hypot(m.x - cx0, m.y - cy0);
      if (d < bd) { bd = d; best = m; }
    }
    const vx = best.x * chart.z + chart.tx, vy = best.y * chart.z + chart.ty;
    return { x: r.left + vx * S, y: r.top + vy * S, title: best.isle.title, slug: best.isle.slug };
  })()`);
  await page.mouse.move(pickTarget.x, pickTarget.y);
  await page.waitForTimeout(150);
  const hoverName = await page.evaluate(() => { const t = document.getElementById('charttip'); return t.hidden ? '' : t.querySelector('.tt-name') ? t.querySelector('.tt-name').textContent : t.textContent.trim().split('\n')[0]; });
  await page.screenshot({ path: path.join(OUT, 'near-stop.png') });
  /* owner's r10 contract: the click IS the voyage - the passage lands her there */
  await page.mouse.click(pickTarget.x, pickTarget.y);
  await page.waitForFunction(() => window.__helmDiag.passage && window.__helmDiag.passage.landed, null, { timeout: 8000 });
  const openedTitle = await page.evaluate(() => window.__helmDiag.passage.landed);
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForFunction('chart.ready === true');
  await page.waitForTimeout(400);

  /* --- 5. drag pan: the view moves, no course is shaped --- */
  const beforePan = await page.evaluate('({ tx: chart.tx, ty: chart.ty, mode: window.__helm.mode() })');
  const r0 = await page.evaluate(`(() => { const r = chart.cv.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  await page.mouse.move(r0.x, r0.y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) { await page.mouse.move(r0.x - i * 20, r0.y - i * 9); await page.waitForTimeout(16); }
  await page.mouse.up();
  await page.waitForTimeout(450);
  const afterPan = await page.evaluate('({ tx: chart.tx, ty: chart.ty, mode: window.__helm.mode(), z: chart.z })');

  /* --- 6. keys: + on the empty search box, - after escape, 0 homes --- */
  await page.evaluate(() => { const s = document.getElementById('search'); s.focus(); s.value = ''; });
  const zBeforePlus = await page.evaluate('chart.zt');
  await page.keyboard.press('+');
  await page.waitForTimeout(80);
  const zAfterPlus = await page.evaluate('chart.zt');
  await page.keyboard.press('Escape');   /* gives the keyboard back */
  await page.waitForTimeout(120);
  await page.keyboard.press('-');
  await page.waitForTimeout(80);
  const zAfterMinus = await page.evaluate('chart.zt');
  await page.keyboard.press('0');
  await page.waitForFunction('!chart.anim && chart.z < 1.001', null, { timeout: 5000 });
  await page.waitForTimeout(350);
  const home = await page.evaluate('({ z: chart.z, tx: chart.tx, ty: chart.ty })');
  await page.screenshot({ path: path.join(OUT, 'home-after-keys.png') });

  /* --- 7. the search box still searches first --- */
  await page.evaluate(() => { const s = document.getElementById('search'); s.focus(); });
  await page.keyboard.type('webhooks');
  await page.waitForTimeout(250);
  const searchDrop = await page.evaluate(() => !document.getElementById('searchdrop').hidden &&
    document.querySelectorAll('#searchdrop .sr').length > 0);
  await page.keyboard.press('Escape');

  /* --- 8. reduced motion: the step arrives at once --- */
  const p2 = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  p2.on('pageerror', e => errs.push('RM PAGEERROR ' + e.message));
  await p2.goto('http://127.0.0.1:8123/index.html?scale=1&rm=1');
  await p2.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await p2.keyboard.press('c');
  await p2.waitForFunction('chart.ready === true', null, { timeout: 15000 });
  await p2.waitForTimeout(250);
  await p2.evaluate(() => document.getElementById('search').blur());
  await p2.keyboard.press('+');
  await p2.waitForTimeout(40);   /* no ease: she is already there */
  const rmView = await p2.evaluate('({ z: chart.z, zt: chart.zt, anim: chart.anim })');

  console.log('base view          ', JSON.stringify(view0));
  console.log('wheel: z, crisp    ', afterWheel.z.toFixed(2), afterWheel.crisp);
  console.log('anchor drift px    ', anchorDrift.toFixed(1));
  console.log('labels base/near   ', JSON.stringify(labelsBase), JSON.stringify(labelsNear));
  console.log('collisions         ', JSON.stringify(collide));
  console.log('hover names her    ', JSON.stringify({ want: pickTarget.title, got: hoverName }));
  console.log('dblclick opens     ', JSON.stringify({ want: pickTarget.title, got: openedTitle }));
  console.log('pan moved, no sail ', JSON.stringify({ before: beforePan, after: afterPan }));
  console.log('keys +/-/0         ', JSON.stringify({ zBeforePlus, zAfterPlus, zAfterMinus, home }));
  console.log('search still first ', searchDrop);
  console.log('reduced motion     ', JSON.stringify(rmView));
  console.log('errors             ', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
