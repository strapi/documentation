/* Final sweep: walk the whole design once from a cold load, through the real
   UI, and report every console error, every missing surface, and the name. */
'use strict';
const path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errs = [], reqfail = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  page.on('requestfailed', r => reqfail.push(r.url() + ' ' + (r.failure() || {}).errorText));
  page.on('response', r => { if (r.status() >= 400) reqfail.push(r.status() + ' ' + r.url()); });

  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.mouse.click(30, 500);
  await page.waitForTimeout(2000);

  const steps = [];
  const step = async (name, fn) => { try { await fn(); steps.push('ok  ' + name); } catch (e) { steps.push('FAIL ' + name + ': ' + String(e).slice(0, 120)); } };

  await step('sail and anchor', async () => {
    await page.evaluate(() => window.__helm.sailTo('/cms/api/document-service', 0.45));
    await page.waitForTimeout(600);
    await page.keyboard.press('a');
    await page.waitForSelector('#anchorage:not([hidden])', { timeout: 4000 });
  });
  await step('follow an in-page citation', async () => {
    await page.evaluate(() => { const a = [...document.querySelectorAll('#pagepaper a')].find(x => (x.getAttribute('href') || '').startsWith('#/')); a.click(); });
    await page.waitForTimeout(500);
    const t = await page.evaluate(() => document.querySelector('.ah-title').textContent);
    if (!t) throw new Error('no page');
  });
  await step('key c opens the chart table', async () => {
    await page.keyboard.press('c'); await page.waitForSelector('#pane-chart:not([hidden])', { timeout: 4000 });
  });
  await step('Escape hands the keyboard back from the search box', async () => {
    await page.keyboard.press('Escape');
    const act = await page.evaluate(() => document.activeElement.id);
    if (act === 'search') throw new Error('still in the search box');
  });
  await step('number keys walk the drawers', async () => {
    await page.keyboard.press('3'); await page.waitForSelector('#pane-log:not([hidden])', { timeout: 4000 });
    await page.keyboard.press('4'); await page.waitForSelector('#pane-register:not([hidden])', { timeout: 4000 });
    await page.keyboard.press('1'); await page.waitForSelector('#pane-chart:not([hidden])', { timeout: 4000 });
  });
  for (const tab of ['chart', 'index', 'log', 'register', 'colophon']) {
    await step('drawer ' + tab, async () => {
      await page.click(`#belowtabs button[data-tab="${tab}"]`);
      await page.waitForSelector('#pane-' + tab + ':not([hidden])', { timeout: 4000 });
      const n = await page.evaluate(t => document.getElementById('pane-' + t).textContent.length, tab);
      if (n < 200 && tab !== 'chart') throw new Error('thin: ' + n);
    });
  }
  await step('search and warp', async () => {
    await page.click('#search'); await page.fill('#search', ''); await page.type('#search', 'webhooks', { delay: 30 });
    await page.waitForTimeout(250);
    await page.keyboard.press('Enter');
    await page.waitForSelector('#anchorage:not([hidden])', { timeout: 4000 });
  });
  await step('weigh anchor with Esc', async () => {
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.getElementById('anchorage').hidden && window.__helm.mode() === 'deck', null, { timeout: 4000 });
  });
  await step('sound toggle', async () => {
    await page.keyboard.press('s'); await page.waitForTimeout(500);
    const off = await page.evaluate(() => document.getElementById('soundbtn').classList.contains('off'));
    await page.keyboard.press('s'); await page.waitForTimeout(300);
    if (!off) throw new Error('did not silence');
  });
  await step('sail states F H R T', async () => {
    for (const k of ['t', 'f', 'h', 'r']) { await page.keyboard.press(k); await page.waitForTimeout(250); }
  });
  await step('typing in the log does not steer', async () => {
    await page.keyboard.press('l'); await page.waitForTimeout(400);
    const before = await page.evaluate(() => window.__helmDiag.orderedBearing);
    await page.click('#handname'); await page.type('#handname', 'fhrt', { delay: 30 });
    await page.waitForTimeout(300);
    const sail = await page.evaluate(() => window.__helmDiag.sailState);
    const after = await page.evaluate(() => window.__helmDiag.orderedBearing);
    if (sail !== 'rest' || after !== before) throw new Error('keys leaked: ' + sail);
    await page.keyboard.press('Escape');
  });
  await step('zero stored state', async () => {
    await page.evaluate(() => window.__helm.clearVisit());
    await page.reload();
    await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
    await page.waitForTimeout(800);
    await page.evaluate(() => window.__helm.below('log'));
    await page.waitForTimeout(400);
    const t = await page.evaluate(() => document.getElementById('pane-log').textContent);
    if (!t.includes('Nothing entered yet')) throw new Error('empty log not handled');
  });

  const name = await page.evaluate(() => {
    const hit = /dead[\s-]?reckoning/i;
    return { title: document.title, inText: hit.test(document.body.innerText),
      inDOM: hit.test(document.documentElement.outerHTML.replace(/deadreckoning\.(js|css)/g, '')) };
  });
  console.log(steps.join('\n'));
  console.log('NAME', JSON.stringify(name));
  console.log('FAILED REQUESTS', reqfail.length ? reqfail : 'none');
  console.log('CONSOLE/PAGE ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
