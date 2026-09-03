const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto('http://localhost:8787/pixelcity/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  const info = await page.evaluate(() => ({
    frameMs: window.__frameMs,
    loading: !!document.getElementById('loading'),
    hud: document.getElementById('hud').textContent,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }));
  console.log(JSON.stringify(info, null, 2));
  console.log('ERRORS:', errors.length ? errors.slice(0, 10) : 'none');
  await page.screenshot({ path: __dirname + '/first.png' });
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
