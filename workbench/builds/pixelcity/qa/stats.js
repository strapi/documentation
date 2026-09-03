const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const logs = [];
  page.on('console', m => logs.push(m.text()));
  await page.goto('http://localhost:8787/pixelcity/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const s = await page.evaluate(() => ({
    sprites: atlasStats.sprites, statics: statics.length, buildings: buildings.length,
    tiles: Wt + 'x' + Ht, quarters: quarters.length,
    ready: logs => null
  }));
  console.log(JSON.stringify(s));
  console.log(logs.filter(l => l.includes('ready')).join('\n'));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
