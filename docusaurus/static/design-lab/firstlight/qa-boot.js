/* QA: boot headlessly, capture console errors, check the two-second
   transmitting condition, screenshot the boot moment. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise((res, rej) => {
    srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); });
    srv.stderr.on('data', d => process.stderr.write(d));
    setTimeout(() => rej(new Error('server timeout')), 5000);
  });
  const base = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));

  const t0 = Date.now();
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });

  // condition 1: within 2s of load, URS-001 is visibly transmitting + prompt line
  let promptVisible = false, state = null;
  try {
    await page.waitForSelector('#prompt:not([hidden])', { timeout: 2000 });
    promptVisible = true;
  } catch (e) {}
  const bootMs = Date.now() - t0;
  state = await page.evaluate(() => window.__diag && window.__diag.state);
  const promptText = await page.evaluate(() => {
    const p = document.getElementById('prompt');
    return p && !p.hidden ? p.innerText.replace(/\s+/g, ' ').trim() : '(hidden)';
  });
  const meter = await page.evaluate(() => document.getElementById('cm-n').textContent + '/' + document.getElementById('cm-total').textContent);
  const logTail = await page.evaluate(() => Array.from(document.querySelectorAll('#log .ll')).map(d => d.innerText).join(' | '));

  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(__dirname, 'iterlog', 'r1-boot.png') });

  console.log(JSON.stringify({ bootMs, promptVisible, promptText, state, meter, logTail, errors }, null, 2));
  await browser.close();
  srv.kill();
})().catch(e => { console.error('QA FAILED', e); process.exit(1); });
