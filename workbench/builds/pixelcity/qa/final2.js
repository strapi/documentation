const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const OUT = '/private/tmp/claude-501/-Users-piwi-code-documentation/0d8629c6-231f-4fec-94af-6fe3669d37b8/scratchpad/bold7/pixelcity';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0,150)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0,150)); });
  await page.goto('http://localhost:8787/pixelcity/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  // quick sweep of 30 spread slugs
  const slugs = await page.evaluate(() => ORDER.filter((_, i) => i % 10 === 3));
  let bad = 0;
  for (const s of slugs) {
    await page.evaluate(x => { location.hash = '#' + x; }, s);
    await page.waitForTimeout(40);
    const len = await page.evaluate(() => document.getElementById('panel-content').innerText.length);
    if (len < 40) { bad++; console.log('SHORT', s, len); }
  }
  console.log('quick sweep', slugs.length, 'slugs, short:', bad);
  // reading shot
  await page.evaluate(() => { location.hash = '#/cms/api/document-service'; });
  await page.waitForTimeout(900);
  await page.screenshot({ path: OUT + '/shot-read.jpg', type: 'jpeg', quality: 80 });
  // frame timings
  await page.evaluate(() => { location.hash = '#/'; fitZoom(); });
  await page.waitForTimeout(2500);
  const fm = await page.evaluate(() => window.__frameMs);
  console.log('final establishing frameMs:', fm.toFixed(2));
  console.log('ERRORS:', errs.length ? errs : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
