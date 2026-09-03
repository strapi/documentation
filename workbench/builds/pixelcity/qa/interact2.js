const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0,150)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0,150)); });
  await page.goto('http://localhost:8787/pixelcity/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { location.hash = '#/cms/quick-start'; });
  await page.waitForTimeout(400);
  // key button clickable while panel open?
  await page.click('#btn-key', { timeout: 5000 });
  const keyLen = await page.evaluate(() => document.getElementById('key-body').innerText.length);
  console.log('KEY OK, len:', keyLen);
  await page.keyboard.press('Escape'); // close key
  await page.keyboard.press('Escape'); // close panel
  await page.waitForTimeout(300);
  console.log('ESC:', await page.evaluate(() => location.hash + ' panelHidden=' + document.getElementById('panel').hidden));
  // search while panel open
  await page.evaluate(() => { location.hash = '#/cms/quick-start'; });
  await page.waitForTimeout(300);
  await page.fill('#search', 'graphql');
  await page.waitForTimeout(250);
  console.log('SEARCH RESULTS VISIBLE:', await page.evaluate(() => !document.getElementById('search-results').hidden));
  await page.screenshot({ path: __dirname + '/panel2.png' });
  console.log('ERRORS:', errs.length ? errs : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
