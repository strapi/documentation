const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await page.goto('http://localhost:8763/', { waitUntil: 'load' });
  await page.waitForSelector('#zfit', { timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.click('#zfit'); await page.waitForTimeout(300);
  await page.click('#zin'); await page.waitForTimeout(200);
  await page.click('#zin'); await page.waitForTimeout(300);
  // now z3, same framing as s1-2; zebra crossing at (770,400)
  await page.mouse.move(770, 400);
  for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, -120); await page.waitForTimeout(220); }
  await page.mouse.move(400, 28);
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'iterlog/s1-3.jpg', quality: 92, type: 'jpeg' });
  await page.screenshot({ path: 'iterlog/anim-a.png' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'iterlog/anim-b.png' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'iterlog/anim-c.png' });
  await browser.close();
})();
