/* THE NINETY-SECOND DEVELOPER TEST, from a cold load.
   A developer who has never seen this page needs one page now. They must be
   able to find it without knowing anything about the fiction, using only what
   the screen tells them. Everything below is driven through the real UI:
   real keystrokes, real typing, real clicks. Nothing calls a hook. */
'use strict';
const path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';

(async () => {
  const br = await chromium.launch({ headless: true });
  for (const target of [
    { q: 'document service middleware', want: '/cms/api/document-service/middlewares' },
    { q: 'rbac', want: '/cms/features/rbac' },
    { q: 'docker', want: '/cms/installation/docker' }
  ]) {
    const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    const t0 = Date.now();
    await page.goto(BASE + '?scale=1');
    await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 60000 });
    const tReady = Date.now() - t0;

    /* what does the screen tell a stranger in the first seconds? */
    const hint = await page.evaluate(() => document.getElementById('hints').textContent.replace(/\s+/g, ' ').trim());

    await page.keyboard.press('c');                       // as the hint says
    await page.waitForSelector('#below:not([hidden])', { timeout: 5000 });
    await page.waitForTimeout(120);
    await page.type('#search', target.q, { delay: 45 });
    await page.waitForTimeout(200);
    const top = await page.evaluate(() => {
      const b = document.querySelector('#searchdrop .sr');
      return b ? b.dataset.slug : null;
    });
    await page.keyboard.press('Enter');
    await page.waitForSelector('#anchorage:not([hidden])', { timeout: 5000 });
    await page.waitForFunction(() => document.getElementById('pagepaper').textContent.length > 400, null, { timeout: 5000 });
    const tOpen = Date.now() - t0;
    const got = await page.evaluate(() => ({
      title: document.querySelector('.ah-title').textContent,
      chars: document.getElementById('pagepaper').textContent.length
    }));
    console.log(`"${target.q}" -> ready ${tReady} ms | page on screen ${tOpen} ms | top hit ${top} | opened "${got.title}" (${got.chars} chars) | correct: ${top === target.want} | errors: ${errs.length ? errs : 'none'}`);
    if (target.q === 'rbac') {
      await page.screenshot({ path: path.join(__dirname, 'iterlog', 'r7-O-ninety-second-test.png') });
      console.log('   hint on deck: ' + hint);
    }
    await page.close();
  }
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
