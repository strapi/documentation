/* Round-3 proof shots: readable log under load, reader head below the bar,
   hall open with the topbar still exposed. */
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
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__diag && window.__diag.state !== 'boot');
  await page.keyboard.press('x');
  const slugs = ['/cms/intro', '/cms/api/rest', '/cms/backend-customization', '/cms/features/media-library',
                 '/cms/plugins-development/developing-plugins', '/cloud/getting-started/intro', '/cloud/projects/settings', '/cms/cli'];
  for (const s of slugs) { await page.evaluate(sl => { location.hash = '#' + sl; }, s); await page.waitForTimeout(300); }
  await page.screenshot({ path: path.join(__dirname, 'iterlog', 'verify-r3-log-reader.png') });
  await page.evaluate(() => { location.hash = '#/'; });
  await page.waitForTimeout(400);
  await page.keyboard.press('h');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(__dirname, 'iterlog', 'verify-r3-hall.png') });
  await browser.close(); srv.kill();
  console.log('shots saved');
})().catch(e => { console.error(e); process.exit(1); });
