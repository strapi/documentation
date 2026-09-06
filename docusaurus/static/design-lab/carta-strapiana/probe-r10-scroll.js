/* THE PAGE MUST SCROLL, ALWAYS (owner bug): wheel, arrows, PageDown, visible
   scrollbar, to the bottom of a long page, in every arrival path. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html?scale=1';
async function battery(page, label) {
  const pre = await page.evaluate(() => {
    const p = document.getElementById('pagepaper');
    p.scrollTop = 0;
    const rail = document.getElementById('paperrail'), th = document.getElementById('paperthumb');
    const rr = rail.getBoundingClientRect(), tr = th.getBoundingClientRect();
    return { sh: p.scrollHeight, ch: p.clientHeight,
      sbWidth: (rail.style.display !== 'none' && rr.width >= 8 && tr.height >= 20) ? Math.round(rr.width) : 0,
      helm: { wheel: ship.wheelAngle, brg: ship.orderedBearing } };
  });
  const pb = await page.evaluate(() => { const b = document.getElementById('pagepaper').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
  await page.mouse.move(pb.x, pb.y);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(150);
  const wheel = await page.evaluate(() => document.getElementById('pagepaper').scrollTop);
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(120);
  const arrows = await page.evaluate(() => document.getElementById('pagepaper').scrollTop);
  await page.keyboard.press('PageDown'); await page.waitForTimeout(120);
  const pgdn = await page.evaluate(() => document.getElementById('pagepaper').scrollTop);
  const maxed = await page.evaluate(() => { const p = document.getElementById('pagepaper'); return p.scrollTop + p.clientHeight >= p.scrollHeight - 2; });
  const thumb0 = await page.evaluate(() => document.getElementById('paperthumb').getBoundingClientRect().top);
  await page.keyboard.press('End'); await page.waitForTimeout(150);
  const thumb1 = await page.evaluate(() => document.getElementById('paperthumb').getBoundingClientRect().top);
  const bottom = await page.evaluate(() => { const p = document.getElementById('pagepaper'); return p.scrollTop + p.clientHeight >= p.scrollHeight - 2; }) && thumb1 > thumb0;
  const helmAfter = await page.evaluate(() => ({ wheel: ship.wheelAngle, brg: ship.orderedBearing }));
  const helmStill = Math.abs(helmAfter.wheel - pre.helm.wheel) < 0.01 && Math.abs(helmAfter.brg - pre.helm.brg) < 0.01;
  console.log(label, JSON.stringify({ long: pre.sh > pre.ch * 3, scrollbarPx: pre.sbWidth,
    wheel: wheel > 0, arrows: arrows > wheel, pgdn: pgdn > arrows || maxed, bottom, helmStill }));
  return bottom && wheel > 0 && arrows > wheel && (pgdn > arrows || maxed) && pre.sbWidth >= 8 && helmStill;
}
(async () => {
  const br = await chromium.launch({ headless: true });
  const errs = [];
  const mk = async (rm) => {
    const p = await br.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: rm ? 'reduce' : 'no-preference' });
    p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
    await p.goto(BASE);
    await p.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
    return p;
  };
  let allOk = true;

  /* 1. OWNER EXACT PATH: open the chart, click the Quick Start Guide */
  let page = await mk(false);
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true');
  await page.waitForTimeout(400);
  const qs = await page.evaluate(() => { const m = chart.marks.find(m => m.isle && m.isle.slug === '/cms/quick-start'); return { x: m.x * chart.z + chart.tx, y: m.y * chart.z + chart.ty }; });
  const box = await page.evaluate(() => { const r = chart.cv.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width }; });
  const S = box.w / 1400;
  await page.mouse.click(box.l + qs.x * S, box.t + qs.y * S);
  await page.waitForTimeout(2900);          // the passage runs its course
  await page.keyboard.press('a');           // drop the hook and read
  await page.waitForTimeout(600);
  const open1 = await page.evaluate(() => !document.getElementById('anchorage').hidden);
  if (!open1) { console.log('1 OWNER: reading did not open'); allOk = false; }
  else allOk = (await battery(page, '1 OWNER chart-click->passage->A')) && allOk;
  await page.close();

  /* 2. SAILED LANDFALL on the longest page in the sea */
  page = await mk(false);
  await page.evaluate(() => { window.__helm.sailTo('/release-notes-archives', 0.5); window.__helm.sail('full'); });
  await page.waitForFunction(() => window.__helmDiag.arrival && window.__helmDiag.arrival.d0 < 0.55, null, { timeout: 30000 }).catch(() => {});
  await page.evaluate(() => window.__helm.sail('rest'));
  await page.waitForTimeout(400);
  await page.keyboard.press('a');
  await page.waitForTimeout(600);
  const open2 = await page.evaluate(() => !document.getElementById('anchorage').hidden);
  if (!open2) { console.log('2 SAILED: reading did not open'); allOk = false; }
  else allOk = (await battery(page, '2 SAILED landfall /release-notes-archives')) && allOk;
  await page.close();

  /* 3. SEARCH JUMP: type, Enter, the page opens */
  page = await mk(false);
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true');
  await page.click('#search');
  await page.keyboard.type('document service api');
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  const open3 = await page.evaluate(() => ({ open: !document.getElementById('anchorage').hidden, slug: ui.slug }));
  if (!open3.open) { console.log('3 SEARCH: reading did not open', JSON.stringify(open3)); allOk = false; }
  else allOk = (await battery(page, '3 SEARCH jump ' + open3.slug)) && allOk;
  await page.close();

  /* 4. COLD DEEP-LINK ARRIVAL (?open=), the crossing-shaped entry */
  page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto(BASE + '&open=/cms/api/document-service');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(600);
  const open4 = await page.evaluate(() => !document.getElementById('anchorage').hidden);
  if (!open4) { console.log('4 DEEPLINK: reading did not open'); allOk = false; }
  else allOk = (await battery(page, '4 DEEPLINK ?open=document-service')) && allOk;
  await page.close();

  /* 5. REDUCED MOTION through the owner path: instant passage, then read */
  page = await mk(true);
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true');
  await page.waitForTimeout(300);
  await page.evaluate(() => passageTo(world.bySlug.get('/cms/quick-start')));
  await page.waitForTimeout(400);
  await page.keyboard.press('a');
  await page.waitForTimeout(500);
  const open5 = await page.evaluate(() => !document.getElementById('anchorage').hidden);
  if (!open5) { console.log('5 REDUCED: reading did not open'); allOk = false; }
  else allOk = (await battery(page, '5 REDUCED owner path')) && allOk;
  await page.close();

  console.log('ALL PATHS SCROLL:', allOk);
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
