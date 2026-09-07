'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  const srv = spawn('node', [path.join(__dirname, '..', 'serve.js')]);
  const port = await new Promise(res => srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); }));
  const base = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#prompt:not([hidden])');
  await page.goto(base + '/#/cms/migration/v4-to-v5/breaking-changes');
  await page.waitForTimeout(1600);
  await page.goto(base + '/#/cms/api/document-service');
  await page.waitForTimeout(1400);
  await page.waitForTimeout(4200);
  await page.evaluate(() => { location.hash = '#/'; });
  await page.waitForTimeout(900);
  await page.click('#fullbtn'); await page.waitForTimeout(900); await page.click('#fullbtn');
  await page.click('#almbtn'); await page.waitForTimeout(700); await page.click('#almbtn');
  await page.click('#darkbtn'); await page.waitForTimeout(700); await page.click('#darkbtn');
  await page.keyboard.press('Tab'); await page.waitForTimeout(400); await page.keyboard.press('Tab');
  await page.click('#q');
  await page.type('#q', 'webhooks');
  await page.waitForTimeout(400);
  const preEnter = await page.evaluate(() => ({
    firstRes: (document.querySelector('#results .res') || {}).getAttribute && document.querySelector('#results .res').getAttribute('href')
  }));
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.getElementById('page').innerText.length > 400);
  const r = await page.evaluate(() => ({
    hash: location.hash,
    plaque: !document.getElementById('plaque').hidden,
    title: document.getElementById('pq-title').textContent,
    fc: !!document.querySelector('.fc-plaque'),
    h1: (document.querySelector('#page h1') || {}).textContent,
    contactLog: Array.from(document.querySelectorAll('#log .ll')).map(d => d.innerText).filter(t => /FIRST CONTACT/.test(t))
  }));
  await page.waitForTimeout(1200);
  const r2 = await page.evaluate(() => ({
    hash: location.hash,
    h1: (document.querySelector('#page h1') || {}).textContent,
    plaque: !document.getElementById('plaque').hidden,
    readerHidden: document.getElementById('reader').hidden,
    logTail: Array.from(document.querySelectorAll('#log .ll')).slice(-6).map(d => d.innerText)
  }));
  console.log(JSON.stringify({ preEnter, r, r2, errors }, null, 2));
  await browser.close();
  srv.kill();
})().catch(e => { console.error(e); process.exit(1); });
