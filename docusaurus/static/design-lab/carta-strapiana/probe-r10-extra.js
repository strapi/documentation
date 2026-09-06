'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });

  /* ---- A. portal N / Escape / Tab+Enter, three crossings ---- */
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  for (const k of ['secreta', 'bythedeep', 'longway', 'firstlight', 'herbarium', 'pixelcity'])
    await page.route('**/' + k + '/**', r => r.abort());
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  // crossing 1: bottle -> N key
  await page.evaluate(() => window.__helm.sailToEgg('bottle', 0.8));
  await page.waitForTimeout(300);
  let h = await page.evaluate(() => { const E = window.__helm.eggs(); const b = E.hits.find(x => x.key === 'bottle'); return b ? { x: b.x, y: b.y } : null; });
  await page.mouse.click(h.x, h.y);
  await page.waitForTimeout(300);
  let po = await page.evaluate(() => window.__helm.portalState());
  console.log('A1 open', JSON.stringify(po));
  await page.keyboard.press('n');
  await page.waitForTimeout(200);
  console.log('A1 after N', JSON.stringify(await page.evaluate(() => ({ p: window.__helm.portalState(), c: window.__helmDiag.crossing }))));
  // crossing 2: ink -> Escape
  await page.evaluate(() => window.__helm.sailToEgg('ink', 0.4));
  await page.keyboard.press('f');
  await page.waitForTimeout(1300);
  po = await page.evaluate(() => window.__helm.portalState());
  console.log('A2 open', JSON.stringify(po));
  if (po.open) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
  console.log('A2 after Escape', JSON.stringify(await page.evaluate(() => ({ p: window.__helm.portalState(), c: window.__helmDiag.crossing }))));
  // crossing 3: bottle again (deny timer cleared) -> Tab focus walk, Enter on YES
  await page.evaluate(() => { portal.denyT = {}; window.__helm.sailToEgg('bottle', 0.8); });
  await page.waitForTimeout(400);
  h = await page.evaluate(() => { const E = window.__helm.eggs(); const b = E.hits.find(x => x.key === 'bottle'); return b ? { x: b.x, y: b.y } : null; });
  if (h) {
    await page.mouse.click(h.x, h.y);
    await page.waitForTimeout(300);
    po = await page.evaluate(() => window.__helm.portalState());
    console.log('A3 open', JSON.stringify(po));
    if (po.open) {
      const f0 = await page.evaluate(() => document.activeElement && document.activeElement.id);
      await page.keyboard.press('Tab');
      const f1 = await page.evaluate(() => document.activeElement && document.activeElement.id);
      await page.keyboard.press('Tab');
      const f2 = await page.evaluate(() => document.activeElement && document.activeElement.id);
      // land focus on YES then Enter
      await page.evaluate(() => document.getElementById('po-yes').focus());
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);
      console.log('A3 focus walk', JSON.stringify([f0, f1, f2]), 'after Enter',
        JSON.stringify(await page.evaluate(() => ({ c: window.__helmDiag.crossing }))));
    }
  } else console.log('A3 bottle: no hit');
  await page.close();

  /* ---- B. passage: skip with a key; C. reduced motion instant ---- */
  const p2 = await br.newPage({ viewport: { width: 1440, height: 900 } });
  p2.on('pageerror', e => errs.push('B PAGEERROR ' + e.message));
  p2.on('console', m => { if (m.type() === 'error') errs.push('B CONSOLE ' + m.text()); });
  await p2.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await p2.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await p2.evaluate(() => window.__helm.below('chart'));
  await p2.waitForFunction('chart.ready === true');
  await p2.waitForTimeout(300);
  await p2.evaluate(() => passageTo(world.bySlug.get('/cms/api/document-service')));
  await p2.waitForTimeout(500);
  let ps = await p2.evaluate(() => window.__helm.passageState());
  await p2.keyboard.press('q');   // any key lands you there
  await p2.waitForTimeout(250);
  const after = await p2.evaluate(() => ({ p: window.__helmDiag.passage, mode: window.__helm.mode(), cap: document.getElementById('caption').textContent }));
  console.log('B skip', JSON.stringify(ps), JSON.stringify(after));
  await p2.close();

  const p3 = await br.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  p3.on('pageerror', e => errs.push('C PAGEERROR ' + e.message));
  await p3.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await p3.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await p3.evaluate(() => window.__helm.below('chart'));
  await p3.waitForFunction('chart.ready === true');
  await p3.waitForTimeout(300);
  const t0 = Date.now();
  await p3.evaluate(() => passageTo(world.bySlug.get('/cms/backend-customization')));
  await p3.waitForTimeout(200);
  const rm = await p3.evaluate(() => ({ p: window.__helmDiag.passage, mode: window.__helm.mode(), cap: document.getElementById('caption').textContent }));
  console.log('C reduced', JSON.stringify(rm), 'ms', Date.now() - t0);
  await p3.close();

  /* ---- D. focus tooltip + tooltip follows without flicker ---- */
  const p4 = await br.newPage({ viewport: { width: 1440, height: 900 } });
  p4.on('pageerror', e => errs.push('D PAGEERROR ' + e.message));
  await p4.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await p4.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await p4.evaluate(() => window.__helm.below('chart'));
  await p4.waitForFunction('chart.ready === true');
  await p4.waitForTimeout(500);
  const ft = await p4.evaluate(() => {
    const el = document.querySelector('#clgeo [data-slug]');
    el.focus();
    const t = document.getElementById('charttip');
    return { slug: el.dataset.slug, hidden: t.hidden, text: t.innerText.replace(/\n/g, ' | ') };
  });
  console.log('D focus tip', JSON.stringify(ft));
  // flicker: sweep the mouse across a mark-dense area, sample hidden state
  const box = await p4.evaluate(() => { const r = chart.cv.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; });
  const mk = await p4.evaluate(() => chart.marks.map(m => ({ x: m.x * chart.z + chart.tx, y: m.y * chart.z + chart.ty }))
    .filter(m => isFinite(m.x) && isFinite(m.y) && m.x > 30 && m.x < 1370 && m.y > 30 && m.y < 780).slice(0, 12));
  console.log('D sweep marks', mk.length);
  // hover mark 0 then move 10px away and to mark 1: tip should show, hide or move, never rapid-cycle
  let flick = 0, shown = 0;
  const S = box.w / 1400;
  for (const m of mk.slice(0, 12)) {
    await p4.mouse.move(box.l + m.x * S, box.t + m.y * S, { steps: 3 });
    await p4.waitForTimeout(90);
    const vis = await p4.evaluate(() => !document.getElementById('charttip').hidden);
    if (vis) shown++;
  }
  console.log('D sweep: tip shown on', shown, 'of 12 mark hovers');
  await p4.close();
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
