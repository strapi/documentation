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
  // z3, s1-2 framing. Stall cluster near (640,260)
  await page.mouse.move(640, 260);
  await page.mouse.wheel(0, -120); await page.waitForTimeout(250);
  await page.mouse.wheel(0, -120); await page.waitForTimeout(250);
  await page.mouse.move(400, 28);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'iterlog/s1-4.jpg', quality: 92, type: 'jpeg' });
  await browser.close();
})();
