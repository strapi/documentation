const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await page.goto('http://localhost:8763/', { waitUntil: 'load' });
  await page.waitForSelector('#zfit', { timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.click('#zfit');
  await page.waitForTimeout(500);
  // wheel-zoom onto a crossing seen at fit view (~640,430 center crossing)
  await page.mouse.move(640, 430);
  for (let i = 0; i < 5; i++) { await page.mouse.wheel(0, -120); await page.waitForTimeout(250); }
  console.log('HUD:', await page.textContent('#hud'));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'iterlog/s1-3.jpg', quality: 92, type: 'jpeg' });
  // two close frames for walk-cycle comparison
  await page.screenshot({ path: 'iterlog/anim-a.png' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'iterlog/anim-b.png' });
  // mid-zoom lossless for palette / pixel-grid check
  await page.click('#zfit'); await page.waitForTimeout(300);
  await page.mouse.move(640, 400);
  await page.mouse.wheel(0, -120); await page.waitForTimeout(250);
  await page.mouse.wheel(0, -120); await page.waitForTimeout(400);
  await page.screenshot({ path: 'iterlog/mid.png' });
  await browser.close();
})();
