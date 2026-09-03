const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const OUT = '/private/tmp/claude-501/-Users-piwi-code-documentation/0d8629c6-231f-4fec-94af-6fe3669d37b8/scratchpad/bold7/pixelcity';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0,150)); });
  await page.goto('http://localhost:8787/pixelcity/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000); // let life spread out
  const stats = await page.evaluate(() => ({ peds: peds.length, cars: cars.length, frameMs: window.__frameMs }));
  console.log('stats:', JSON.stringify(stats));
  // world shot
  await page.evaluate(() => fitZoom());
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + '/shot-world.jpg', type: 'jpeg', quality: 80 });

  // street: crossing with most peds actually in a z8 viewport, waiting for mid-stride
  await page.evaluate(() => {
    let best = null;
    for (const key of crossTiles) {
      const [x, y] = key.split(',').map(Number);
      let n = 0;
      for (const p of peds) if (Math.abs(p.x - x) < 4 && Math.abs(p.y - y) < 4) n++;
      let nc = 0;
      for (const c of cars) if (Math.abs(c.x - x) < 5 && Math.abs(c.y - y) < 5) nc++;
      const score = n + nc * 1.5;
      if (!best || score > best.score) best = { x, y, score };
    }
    cam.z = 8;
    const wx = OX + (best.x - best.y) * 8, wy = OY + (best.x + best.y) * 4;
    cam.x = Math.round(wx - cvs.width / 16); cam.y = Math.round(wy - cvs.height / 16);
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: OUT + '/shot-street.jpg', type: 'jpeg', quality: 80 });

  // reading panel
  await page.evaluate(() => { location.hash = '#/cms/api/document-service'; });
  await page.waitForTimeout(900);
  await page.screenshot({ path: OUT + '/shot-read.jpg', type: 'jpeg', quality: 80 });
  console.log('errors:', errs.length ? errs : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
