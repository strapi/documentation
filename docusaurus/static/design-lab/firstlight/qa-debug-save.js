'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise(res => srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); }));
  const base = `http://127.0.0.1:${port}`;
  const content = JSON.parse(fs.readFileSync(path.join(__dirname, 'content.json'), 'utf8'));
  const order = content.order.filter(s => content.pages[s]);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__diag && window.__diag.state !== 'boot');
  for (const slug of order) {
    await page.evaluate(s => { location.hash = '#' + s; }, slug);
    await page.waitForTimeout(24);
  }
  await page.waitForTimeout(1000);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('firstlight.survey.v1')));
  const missingC = order.filter(s => !saved.c.includes(s));
  console.log(JSON.stringify({ cLen: saved.c.length, dLen: saved.d.length, vLen: saved.v.length,
    missingC, inD: missingC.filter(s => saved.d.includes(s)), inV: missingC.filter(s => saved.v.includes(s)) }, null, 2));
  await browser.close();
  srv.kill();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
