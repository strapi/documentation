const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await page.goto('http://localhost:8763/', { waitUntil: 'load' });
  await page.waitForSelector('#loading', { state: 'hidden', timeout: 30000 }).catch(()=>{});
  await page.waitForTimeout(2500);
  const hud = () => page.textContent('#hud');
  // s1-1: fit island
  await page.click('#zfit');
  await page.waitForTimeout(800);
  console.log('fit HUD:', await hud());
  await page.screenshot({ path: 'iterlog/s1-1.jpg', quality: 90, type: 'jpeg' });
  // s1-2: mid zoom (target z=3)
  await page.click('#zin'); await page.waitForTimeout(300);
  console.log('after 1 zin:', await hud());
  await page.click('#zin'); await page.waitForTimeout(600);
  console.log('after 2 zin:', await hud());
  await page.screenshot({ path: 'iterlog/s1-2.jpg', quality: 90, type: 'jpeg' });
  await browser.close();
})();
