/* QA: the full mission flow, one state per screenshot. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise(res => srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); }));
  const base = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  const shot = n => page.screenshot({ path: path.join(__dirname, 'iterlog', n) });
  const out = {};

  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#prompt:not([hidden])');

  // 1. survey the beacon
  await page.goto(base + '/#/cms/migration/v4-to-v5/breaking-changes');
  await page.waitForTimeout(1600);
  out.afterBeacon = await page.evaluate(() => ({
    meter: document.getElementById('cm-n').textContent,
    readerVisible: !document.getElementById('reader').hidden,
    bodyChars: document.getElementById('page').innerText.length,
    instVisible: !document.getElementById('inst').hidden,
    instText: document.getElementById('inst-inner').innerText.slice(0, 400),
    state: window.__diag.state
  }));
  await shot('r1-survey.png');

  // 2. survey a second hub to grow the chart
  await page.goto(base + '/#/cms/api/document-service');
  await page.waitForTimeout(1400);
  out.afterSecond = await page.evaluate(() => document.getElementById('cm-n').textContent);

  // 3. wait for a transit (fires ~1.4s after survey + every 9.5s)
  await page.waitForTimeout(4200);
  out.logAfterTransit = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#log .ll')).map(d => d.innerText).filter(t => /TRANSIT/.test(t)));
  await page.evaluate(() => { location.hash = '#/'; });
  await page.waitForTimeout(900);
  await shot('r1-transit.png');

  // 4. full chart
  await page.click('#fullbtn');
  await page.waitForTimeout(900);
  out.fullChartState = await page.evaluate(() => window.__diag.state);
  await shot('r1-fullchart.png');
  await page.click('#fullbtn');

  // 5. almanac
  await page.click('#almbtn');
  await page.waitForTimeout(700);
  await shot('r1-almanac.png');
  out.almanacLog = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#log .ll')).map(d => d.innerText).filter(t => /ALMANAC/.test(t)));
  await page.click('#almbtn');

  // 6. dark adapt
  await page.click('#darkbtn');
  await page.waitForTimeout(700);
  await shot('r1-darkadapt.png');
  await page.click('#darkbtn');

  // 7. index via Tab
  await page.keyboard.press('Tab');
  await page.waitForTimeout(400);
  out.indexOpen = await page.evaluate(() => ({
    open: !document.getElementById('ixpanel').hidden,
    rows: document.querySelectorAll('#ix-inner a.ix-a').length
  }));
  await shot('r1-index.png');
  await page.keyboard.press('Tab');

  // 8. search: content must render immediately on Enter
  await page.click('#q');
  await page.type('#q', 'webhooks');
  await page.waitForTimeout(400);
  out.searchGhost = await page.evaluate(() => !!document.querySelector('#results .res'));
  await shot('r1-search.png');
  const tSearch = Date.now();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => !document.getElementById('reader').hidden && /Webhooks/i.test((document.querySelector('#page h1') || {}).textContent || ''));
  out.searchToContentMs = Date.now() - tSearch;
  out.searchLanded = await page.evaluate(() => location.hash);

  // 9. first-contact: open a dark body directly (webhooks IS dark; check plaque)
  out.plaque = await page.evaluate(() => {
    const pq = document.getElementById('plaque');
    const fc = document.querySelector('.fc-plaque');
    return {
      overlayShown: !pq.hidden,
      overlayText: pq.innerText.replace(/\s+/g, ' ').slice(0, 300),
      inPage: fc ? fc.innerText.replace(/\s+/g, ' ').slice(0, 220) : null
    };
  });
  await shot('r1-firstcontact.png');

  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
  srv.kill();
})().catch(e => { console.error('QA FAILED', e); process.exit(1); });
