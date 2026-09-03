const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8971/';
const slug = process.argv[2] || '/cms/api/rest';
const dist = +(process.argv[3] || 190);
const el = +(process.argv[4] || 0.22);
const out = process.argv[5] || 'qa/close.png';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 400)));
  await page.goto(BASE + '#' + slug, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__city && window.__city.count() > 0);
  await page.click('#btnWide');
  await page.waitForTimeout(300);
  const azo = +(process.argv[6] || 0.72);
  const info = await page.evaluate(({ slug, dist, el, azo }) => {
    const c = window.__city;
    const b = c.at ? c.at(slug) : null;
    if (b) {
      const az = 0.62 + azo;
      c.setCam({ tx: b.wx, ty: b.wy, dist: dist, az: az, el: el });
      return b;
    }
    return null;
  }, { slug, dist, el, azo });
  console.log('at', JSON.stringify(info));
  await page.waitForTimeout(250);
  await page.evaluate(() => window.__city.paint());
  await page.screenshot({ path: out });
  console.log('frame ms', await page.evaluate(() => window.__city.frame()));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
