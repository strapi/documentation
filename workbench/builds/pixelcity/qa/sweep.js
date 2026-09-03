const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console@' + page.url().slice(-40) + ': ' + m.text().slice(0, 200)); });
  page.on('pageerror', e => errors.push('pageerror@' + page.url().slice(-40) + ': ' + e.message.slice(0, 200)));
  page.on('requestfailed', r => { if (!r.url().includes('favicon')) errors.push('reqfail: ' + r.url().slice(-80)); });
  await page.goto('http://localhost:8787/pixelcity/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // sample slugs: every 4th in reading order = ~73 across all sections
  const slugs = await page.evaluate(() => ORDER.filter((_, i) => i % 4 === 0));
  console.log('sweeping', slugs.length, 'slugs');
  const short = [], titleBad = [], overflowPages = [];
  for (const slug of slugs) {
    await page.evaluate(s => { location.hash = '#' + s; }, slug);
    await page.waitForTimeout(60);
    const r = await page.evaluate(() => ({
      len: document.getElementById('panel-content').innerText.length,
      title: document.title,
      ovf: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      hidden: document.getElementById('panel').hidden
    }));
    if (r.hidden || r.len < 40) short.push(slug + ' len=' + r.len + (r.hidden ? ' HIDDEN' : ''));
    if (!r.title.includes('Strapi Pixel City') || r.title.startsWith(' ·')) titleBad.push(slug + ' -> ' + r.title);
    if (r.ovf) overflowPages.push(slug);
  }
  console.log('SHORT PAGES:', short.length ? short : 'none');
  console.log('TITLE ISSUES:', titleBad.length ? titleBad.slice(0,5) : 'none');
  console.log('OVERFLOW:', overflowPages.length ? overflowPages : 'none');

  // back/forward
  await page.evaluate(() => { location.hash = '#/cms/api/rest'; });
  await page.waitForTimeout(150);
  await page.evaluate(() => { location.hash = '#/cms/quick-start'; });
  await page.waitForTimeout(150);
  await page.goBack(); await page.waitForTimeout(200);
  const backT = await page.evaluate(() => document.title);
  await page.goForward(); await page.waitForTimeout(200);
  const fwdT = await page.evaluate(() => document.title);
  console.log('BACK:', backT, '| FWD:', fwdT);

  // frame time at establishing view (whole island) and at street zoom
  await page.evaluate(() => { location.hash = '#/'; fitZoom(); });
  await page.waitForTimeout(2200);
  const fm1 = await page.evaluate(() => window.__frameMs);
  await page.evaluate(() => { cam.z = 6; cam.x = Math.round(worldW/2 - cvs.width/12); cam.y = Math.round(worldH/2 - cvs.height/12); });
  await page.waitForTimeout(2200);
  const fm2 = await page.evaluate(() => window.__frameMs);
  console.log('frameMs fit:', fm1.toFixed(2), 'street:', fm2.toFixed(2));

  // life counts + boat sanity
  const life = await page.evaluate(() => ({
    peds: peds.length, cars: cars.length, cyc: cyclists.length, pig: pigeons.length,
    cats: cats.length, smokes: smokes.length, flags: flags.length,
    boat: boat ? { x: +boat.x.toFixed(1), y: +boat.y.toFixed(1), horiz: boat.horiz, tile: tileAt(Math.floor(boat.x), Math.floor(boat.y)) } : null,
    movingCars: cars.filter(c => !c.stopped).length
  }));
  console.log('LIFE:', JSON.stringify(life));
  // check a car actually changes position
  const p1 = await page.evaluate(() => cars.map(c => c.x + ',' + c.y).join('|'));
  await page.waitForTimeout(1200);
  const p2 = await page.evaluate(() => cars.map(c => c.x + ',' + c.y).join('|'));
  console.log('CARS MOVE:', p1 !== p2);
  const pd1 = await page.evaluate(() => peds.slice(0,20).map(c => c.x.toFixed(2)).join('|'));
  await page.waitForTimeout(800);
  const pd2 = await page.evaluate(() => peds.slice(0,20).map(c => c.x.toFixed(2)).join('|'));
  console.log('PEDS MOVE:', pd1 !== pd2);
  console.log('ERRORS:', errors.length ? errors.slice(0, 15) : 'none', '(total ' + errors.length + ')');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
