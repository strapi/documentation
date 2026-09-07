'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise(res => srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); }));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#prompt:not([hidden])');
  // transit seeds at ~6.5s, dur 1.8s -> shoot in the middle of the dip
  await page.waitForTimeout(7400);
  await page.screenshot({ path: path.join(__dirname, 'iterlog', 'r1-signature-dip.png') });
  await browser.close();
  srv.kill();
  console.log('ok');
})().catch(e => { console.error('FAILED', e); process.exit(1); });
