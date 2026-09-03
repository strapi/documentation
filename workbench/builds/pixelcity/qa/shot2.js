const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto('http://localhost:8787/pixelcity/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  // zoom into a crossing: pick a crossing tile programmatically
  await page.evaluate(() => {
    // find a CROSS tile near map centre
    let best=null, cx=Math.floor(97/2), cy=Math.floor(104/2);
    for (const key of crossTiles) {
      const [x,y]=key.split(',').map(Number);
      const d=Math.abs(x-cx)+Math.abs(y-cy);
      if(!best||d<best.d) best={x,y,d};
    }
    cam.z=6;
    const wx = OX+(best.x-best.y)*8, wy = 110+(best.x+best.y)*4;
    cam.x=Math.round(wx-cvs.width/(2*6)); cam.y=Math.round(wy-cvs.height/(2*6));
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: __dirname + '/street.png' });
  // open a page
  await page.evaluate(() => { location.hash = '#/cms/api/rest'; });
  await page.waitForTimeout(1200);
  const t = await page.evaluate(() => ({ title: document.title, textLen: document.getElementById('panel-content').innerText.length }));
  console.log(JSON.stringify(t));
  await page.screenshot({ path: __dirname + '/panel.png' });
  console.log('ERRORS:', errors.length ? errors.slice(0,10) : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
