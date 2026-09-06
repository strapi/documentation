'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.evaluate(() => window.__helm.clearVisit());
  await page.waitForTimeout(800);

  // 1. sail in and anchor on the demonstration island
  await page.evaluate(() => window.__helm.sailTo('/cms/api/document-service', 0.4));
  await page.waitForTimeout(500);
  const ms = await page.evaluate(() => window.__helm.anchor());
  await page.waitForTimeout(300);
  const land = await page.evaluate(() => ({
    mode: window.__helm.mode(),
    landfallMs: window.__helmDiag.landfallMs,
    title: document.querySelector('#anchorhead .ah-title').textContent,
    blocks: document.querySelectorAll('#pagepaper > *').length,
    code: document.querySelectorAll('#pagepaper .codeblk').length,
    tables: document.querySelectorAll('#pagepaper table').length,
    tabs: document.querySelectorAll('#pagepaper .tabs').length,
    adm: document.querySelectorAll('#pagepaper .adm').length,
    endpoints: document.querySelectorAll('#pagepaper .endpoint').length,
    imgs: document.querySelectorAll('#pagepaper img').length,
    chars: document.getElementById('pagepaper').textContent.length,
    shore: document.getElementById('shoreside').textContent.slice(0, 160)
  }));
  console.log('LANDFALL', JSON.stringify(land, null, 1));

  // 2. the log
  const log = await page.evaluate(() => window.__helm.logRows());
  console.log('LOG', JSON.stringify(log));

  // 3. below deck: chart, index, log, register, colophon
  for (const tab of ['chart', 'index', 'log', 'register', 'colophon']) {
    await page.evaluate(t => window.__helm.below(t), tab);
    await page.waitForTimeout(280);
    const info = await page.evaluate(t => {
      const p = document.getElementById('pane-' + t);
      return { visible: !p.hidden, chars: p.textContent.length,
        rows: p.querySelectorAll('.idxrow,.regline,#logtable tbody tr').length,
        labels: document.querySelectorAll('#chartlabels .al').length };
    }, tab);
    console.log('TAB', tab, JSON.stringify(info));
  }

  // 4. search
  const hits = await page.evaluate(() => window.__helm.search('document service middleware'));
  console.log('SEARCH', JSON.stringify(hits.slice(0, 4)));

  // 5. warp to a dark shore and answer the standing order
  const t0 = Date.now();
  await page.evaluate(() => window.__helm.open('/cms/testing'));
  await page.waitForTimeout(200);
  const warp = await page.evaluate(() => ({
    ms: window.__helmDiag.landfallMs,
    title: document.querySelector('#anchorhead .ah-title').textContent,
    orders: [...document.querySelectorAll('#shoreside button.act')].map(b => b.dataset.act)
  }));
  console.log('WARP', Date.now() - t0, JSON.stringify(warp));
  await page.evaluate(() => { const b = document.querySelector('#shoreside button.act[data-act="lamp"]'); if (b) b.click(); });
  await page.waitForTimeout(150);

  // 6. a page that raises a drowned hand
  await page.evaluate(() => window.__helm.open('/cms/installation/docker'));
  await page.waitForTimeout(250);
  const raise = await page.evaluate(() => {
    const b = document.querySelector('#shoreside button.act[data-act="raise"]');
    if (b) b.click();
    return { had: !!b, visit: window.__helm.visit() };
  });
  console.log('RAISE', JSON.stringify(raise));

  const v = await page.evaluate(() => window.__helm.visit());
  console.log('VISIT', JSON.stringify(v));
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
