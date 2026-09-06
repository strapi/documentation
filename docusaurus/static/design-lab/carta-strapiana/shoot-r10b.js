'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'iterlog/r10/geo-far.png' });
  const K = await page.evaluate(`(() => {
    const kr = chart.geo.beasts.find(b => b.kind === 'kraken');
    const cms = chart.geo.conts.find(c => c.key === 'cms');
    const cloud = chart.geo.conts.find(c => c.key === 'cloud');
    return { kx: kr.x, ky: kr.y, mx: (cms.x + cloud.x) / 2, my: (cms.y + cloud.y) / 2 };
  })()`);
  /* mid: both mains in one frame, provinces lettered */
  await page.evaluate(`(() => {
    chart.zt = 1.9;
    chart.txt = 1400 / 2 - ${K.mx} * 1.9;
    chart.tyt = 810 / 2 - ${K.my} * 1.9;
    chartClampTargets();
    kickChartAnim();
  })()`);
  await page.waitForFunction('!chart.anim', null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'iterlog/r10/geo-mid.png' });
  /* the kraken, close */
  await page.evaluate(`(() => {
    chart.zt = 3.4;
    chart.txt = 1400 / 2 - ${K.kx} * 3.4;
    chart.tyt = 810 / 2 - ${K.ky} * 3.4;
    chartClampTargets();
    kickChartAnim();
  })()`);
  await page.waitForFunction('!chart.anim', null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'iterlog/r10/kraken.png' });
  console.log('shot geo-far geo-mid kraken; ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
