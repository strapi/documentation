const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0,150)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0,150)); });
  await page.goto('http://localhost:8787/pixelcity/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  // hover the DOC API hub building
  const pt = await page.evaluate(() => {
    const b = buildings.find(x => x.slug === '/cms/api/document-service');
    const st = statics.find(s => s.b === b);
    cam.z = 4; cam.x = Math.round(st.wx - 100); cam.y = Math.round(st.wy - 60);
    const r = cvs.getBoundingClientRect();
    return { x: (st.wx + st.cv.width / 2 - cam.x) * 4 * (r.width / cvs.width), y: (st.wy + st.cv.height * 0.7 - cam.y) * 4 * (r.height / cvs.height) };
  });
  await page.mouse.move(pt.x, pt.y);
  await page.waitForTimeout(400);
  const bub = await page.evaluate(() => ({ hidden: document.getElementById('bubble').hidden, text: document.getElementById('bubble').innerText.replace(/\n/g, ' | ') }));
  console.log('BUBBLE:', JSON.stringify(bub));
  // click opens
  await page.mouse.click(pt.x, pt.y);
  await page.waitForTimeout(400);
  console.log('CLICK OPENED:', await page.evaluate(() => location.hash + ' hidden=' + document.getElementById('panel').hidden));
  // search
  await page.evaluate(() => { location.hash = '#/'; });
  await page.fill('#search', 'draft publish');
  await page.waitForTimeout(300);
  const sr = await page.evaluate(() => [...document.querySelectorAll('#search-results a')].slice(0, 3).map(a => a.getAttribute('href')));
  console.log('SEARCH:', JSON.stringify(sr));
  // drawer
  await page.click('#btn-nav');
  const nLinks = await page.evaluate(() => document.querySelectorAll('#drawer-body a').length);
  console.log('DRAWER LINKS:', nLinks);
  await page.click('#drawer-body a');
  await page.waitForTimeout(300);
  console.log('DRAWER NAV:', await page.evaluate(() => location.hash));
  // key panel
  await page.click('#btn-key');
  const keyLen = await page.evaluate(() => document.getElementById('key-body').innerText.length);
  console.log('KEY TEXT LEN:', keyLen);
  console.log('ERRORS:', errs.length ? errs : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
