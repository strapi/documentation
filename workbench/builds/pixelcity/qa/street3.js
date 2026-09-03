const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const OUT = '/private/tmp/claude-501/-Users-piwi-code-documentation/0d8629c6-231f-4fec-94af-6fe3669d37b8/scratchpad/bold7/pixelcity';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://localhost:8787/pixelcity/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  const best = await page.evaluate(() => {
    let best = null;
    for (const key of crossTiles) {
      const [x, y] = key.split(',').map(Number);
      let n = 0, nc = 0, boarded = 0;
      for (const p of peds) if (Math.abs(p.x - x) < 4 && Math.abs(p.y - y) < 4) n++;
      for (const c of cars) if (Math.abs(c.x - x) < 4 && Math.abs(c.y - y) < 4) nc++;
      for (const b of buildings) if (b.style === 'boarded' && Math.abs(b.tx - x) < 6 && Math.abs(b.ty - y) < 6) boarded++;
      if (nc === 0) continue;
      const score = n + nc * 2 - boarded;
      if (!best || score > best.score) best = { x, y, score, n, nc };
    }
    cam.z = 6;
    const wx = OX + (best.x - best.y) * 8, wy = OY + (best.x + best.y) * 4;
    cam.x = Math.round(wx - cvs.width / 12); cam.y = Math.round(wy - cvs.height / 12) + 10;
    return best;
  });
  console.log('crossing:', JSON.stringify(best));
  // wait for a moment when several peds are mid-stride near it
  for (let tries = 0; tries < 30; tries++) {
    const good = await page.evaluate(b => {
      let mid = 0;
      for (const p of peds) if (Math.abs(p.x - b.x) < 4 && Math.abs(p.y - b.y) < 4 && p.prog > 0.15 && p.prog < 0.85) mid++;
      return mid;
    }, best);
    if (good >= 3) break;
    await page.waitForTimeout(220);
  }
  await page.screenshot({ path: OUT + '/shot-street.jpg', type: 'jpeg', quality: 80 });
  console.log('errors:', errs.length ? errs : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
