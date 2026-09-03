const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch();
  // reduced motion context
  const page2 = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const errs2 = [];
  page2.on('pageerror', e => errs2.push(e.message));
  page2.on('console', m => { if (m.type() === 'error') errs2.push(m.text().slice(0,150)); });
  await page2.goto('http://localhost:8787/pixelcity/', { waitUntil: 'networkidle' });
  await page2.waitForTimeout(3000);
  const rm = await page2.evaluate(() => ({ reduced: REDUCED, frameMs: window.__frameMs }));
  console.log('REDUCED:', JSON.stringify(rm), 'errors:', errs2.length ? errs2 : 'none');
  await page2.screenshot({ path: __dirname + '/reduced.png' });
  await page2.close();

  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:8787/pixelcity/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: __dirname + '/world2.png' });
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
