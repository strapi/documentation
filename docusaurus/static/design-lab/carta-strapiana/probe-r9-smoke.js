'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
  await page.waitForTimeout(3200);
  const st = await page.evaluate(() => ({
    sail: window.__helmDiag.sailState,
    knots: window.__helmDiag.knots,
    calm: window.__helm.calm(),
    eggs: window.__helmDiag.eggs,
    hints: (() => { const h = document.getElementById('hints');
      return { shown: h.classList.contains('shown'), quiet: h.classList.contains('quiet'),
               lines: h.innerHTML.split('<br>').length, op: getComputedStyle(h).opacity }; })(),
    lens: { x: window.__helmDiag.lensX, y: window.__helmDiag.lensY }
  }));
  console.log(JSON.stringify(st, null, 1));
  // first meaningful input: F
  await page.keyboard.press('f');
  await page.waitForTimeout(1300);
  const st2 = await page.evaluate(() => ({
    sail: window.__helmDiag.sailState, knots: window.__helmDiag.knots,
    hintsOp: getComputedStyle(document.getElementById('hints')).opacity,
    shown: document.getElementById('hints').classList.contains('shown'),
    taught: (() => { try { return localStorage.getItem('carta.taught'); } catch (e) { return null; } })()
  }));
  console.log('after F:', JSON.stringify(st2));
  // reload: returning visitor
  await page.reload();
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
  await page.waitForTimeout(400);
  const st3 = await page.evaluate(() => {
    const h = document.getElementById('hints');
    return { sail: window.__helmDiag.sailState, quiet: h.classList.contains('quiet'),
             shown: h.classList.contains('shown'), text: h.textContent.replace(/\s+/g, ' ').trim() };
  });
  console.log('return visit:', JSON.stringify(st3));
  console.log('errors:', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
