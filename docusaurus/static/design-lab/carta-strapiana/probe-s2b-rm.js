/* reduced motion: weather swaps state without fork, becalmed stays becalmed */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&rm=1');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&rm=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(2500);
  /* force the squall month: values swap at once (k=1), no fork possible */
  const st = await page.evaluate(() => {
    window.__helm.wxForce(8);
    return true;
  });
  await page.waitForTimeout(2500);
  const wx1 = await page.evaluate(() => ({ wx: diag.wx, forkFrames: wx.forkFrames, fork: !!wx.fork }));
  /* try to bolt: reduced motion must refuse the fork by law (organic path);
     the wxTick guard has !REDUCED - the hook is a probe tool, not the law */
  const organic = await page.evaluate(() => {
    /* run many synthetic ticks: the organic thunder path must never arm */
    for (let i = 0; i < 200; i++) wxTick(0.05);
    return { forkFrames: wx.forkFrames, thunderDone: wx.thunderDone, squall: +wx.squall.toFixed(2) };
  });
  console.log(JSON.stringify({ wx1, organic, errs }, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
