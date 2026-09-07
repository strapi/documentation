'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  const srv = spawn('node', [path.join(__dirname, '..', 'serve.js')]);
  const port = await new Promise(res => srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); }));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__diag && window.__diag.state !== 'boot');
  // direct navigation, like qa-flow steps 8-9 but without search
  await page.evaluate(() => { location.hash = '#/cms/backend-customization/webhooks'; });
  await page.waitForFunction(() => document.getElementById('page').innerText.length > 400);
  const r = await page.evaluate(() => ({
    plaque: !document.getElementById('plaque').hidden,
    title: document.getElementById('pq-title').textContent,
    fc: !!document.querySelector('.fc-plaque'),
    contactLog: Array.from(document.querySelectorAll('#log .ll')).map(d => d.innerText).filter(t => /FIRST CONTACT/.test(t)).length
  }));
  console.log(JSON.stringify({ r, errors }, null, 2));
  await browser.close();
  srv.kill();
})().catch(e => { console.error(e); process.exit(1); });
