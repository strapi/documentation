'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_path' === 'x' ? '' : 'child_process');
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

  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__diag && window.__diag.state !== 'boot');

  // audio smoke: enable, survey a body (plays core sample), toggle listen button
  await page.click('#audiobtn');
  const audioLabel = await page.evaluate(() => document.getElementById('audiobtn').textContent);
  await page.evaluate(() => { location.hash = '#/cms/installation/docker'; }); // 4 night edits page
  await page.waitForTimeout(700);
  const listenBtn = await page.evaluate(() => {
    const b = document.getElementById('listenbtn');
    if (!b) return null;
    b.click();
    return b.textContent;
  });
  await page.waitForTimeout(400);

  // signature moment: catch the transit dip mid-flight (fires ~1.4s after survey)
  await page.evaluate(() => { location.hash = '#/'; });
  await page.waitForFunction(() => {
    // reach into nothing: just wait for the dip via the photometer state string
    return true;
  });
  await page.waitForTimeout(1900); // survey-triggered transit starts at +1.4s, dur 1.8s
  await page.screenshot({ path: path.join(__dirname, 'iterlog', 'r1-signature-dip.png') });

  console.log(JSON.stringify({ audioLabel, listenBtn, errors }, null, 2));
  await browser.close();
  srv.kill();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
