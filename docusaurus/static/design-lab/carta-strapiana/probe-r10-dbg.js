'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForTimeout(1500);
  const pt = await page.evaluate(() => {
    const c = document.getElementById('chart').getBoundingClientRect();
    const isle = window.__helmSoundIsle('/cms/api/document-service');
    return { rect: { l: c.left, t: c.top, w: c.width, h: c.height },
      ix: isle.cx, iy: isle.cy, hasMarks: true };
  });
  console.log('PT', JSON.stringify(pt));
  const mx = pt.rect.l + pt.ix * (pt.rect.w / 1400), my = pt.rect.t + pt.iy * (pt.rect.h / 810);
  console.log('mouse to', mx, my);
  await page.mouse.move(mx, my, { steps: 3 });
  await page.waitForTimeout(300);
  const dbg = await page.evaluate(() => {
    const t = document.getElementById('charttip');
    return { tipHidden: t.hidden, txt: t.innerText.slice(0, 120) };
  });
  console.log('DBG', JSON.stringify(dbg));
  // direct pick test at that client point
  const pick = await page.evaluate(([x, y]) => {
    const el = document.elementFromPoint(x, y);
    return { el: el ? (el.id || el.className) : null };
  }, [mx, my]);
  console.log('ELEMENT AT POINT', JSON.stringify(pick));
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
