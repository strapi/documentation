'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.evaluate(() => window.__helm.open('/cms/quick-start'));
  await page.waitForTimeout(700);
  const t = await page.evaluate(() => { const r = document.getElementById('paperthumb').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.move(t.x, t.y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) { await page.mouse.move(t.x, t.y + i * 22); await page.waitForTimeout(16); }
  await page.mouse.up();
  const st = await page.evaluate(() => document.getElementById('pagepaper').scrollTop);
  // click the rail well below the thumb: the page leaps
  const rail = await page.evaluate(() => { const r = document.getElementById('paperrail').getBoundingClientRect(); return { x: r.left + r.width / 2, yTop: r.top + 8 }; });
  await page.mouse.click(rail.x, rail.yTop);
  await page.waitForTimeout(150);
  const st2 = await page.evaluate(() => document.getElementById('pagepaper').scrollTop);
  console.log(JSON.stringify({ dragScrolled: st, dragWorks: st > 400, railClickTop: st2, leapt: st2 < st }));
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
