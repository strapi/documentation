const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0,150)); });
  await page.goto('http://localhost:8787/pixelcity/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  // find crossing with most peds within 4 tiles
  await page.evaluate(() => {
    let best = null;
    for (const key of crossTiles) {
      const [x, y] = key.split(',').map(Number);
      let n = 0;
      for (const p of peds) if (Math.abs(p.x - x) < 5 && Math.abs(p.y - y) < 5) n++;
      for (const c of cars) if (Math.abs(c.x - x) < 5 && Math.abs(c.y - y) < 5) n += 2;
      if (!best || n > best.n) best = { x, y, n };
    }
    cam.z = 6;
    const wx = OX + (best.x - best.y) * 8, wy = OY + (best.x + best.y) * 4;
    cam.x = Math.round(wx - cvs.width / 12); cam.y = Math.round(wy - cvs.height / 12);
    window.__cross = best;
  });
  await page.waitForTimeout(1500);
  console.log('busiest crossing:', await page.evaluate(() => JSON.stringify(window.__cross)));
  await page.screenshot({ path: __dirname + '/street2.png' });
  // boat view
  await page.evaluate(() => {
    cam.z = 4;
    const wx = OX + (boat.x - boat.y) * 8, wy = OY + (boat.x + boat.y) * 4;
    cam.x = Math.round(wx - cvs.width / 8); cam.y = Math.round(wy - cvs.height / 8);
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: __dirname + '/boat.png' });
  console.log('errors:', errs.length ? errs : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
