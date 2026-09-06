'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';
const KEYS = ['pixelcity', 'bythedeep', 'longway', 'firstlight', 'herbarium', 'secreta', 'secretb'];

async function fresh(br, extra) {
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.errs = [];
  page.on('pageerror', e => page.errs.push(e.message));
  let landed = null;
  for (const k of KEYS) {
    await page.route('**/' + k + '/', route => {
      landed = k;
      route.fulfill({ status: 200, contentType: 'text/html', body: '<title>' + k + '</title>ok' });
    });
  }
  page.landed = () => landed;
  await page.goto(BASE + '?scale=1' + (extra || ''));
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
  return page;
}
const cap = p => p.evaluate(() => document.getElementById('caption').textContent.trim());

(async () => {
  const br = await chromium.launch({ headless: true });
  const out = {};

  /* (a) the city: approach hint, LAND HO plate, A crosses */
  let p = await fresh(br);
  await p.evaluate(() => window.__helm.sailToEgg('city', 2.2));
  await p.evaluate(() => window.__helm.sail('full'));
  await p.waitForTimeout(900);
  const hint = await cap(p);
  const plate = await p.evaluate(() => {
    const el = document.getElementById('landfall');
    return { hidden: el.hidden, name: el.querySelector('.lf-name').textContent,
             line: el.querySelector('.lf-line').textContent, order: el.querySelector('.lf-order').textContent };
  });
  await p.screenshot({ path: 'iterlog/r9-egg-city-approach.png' });
  await p.evaluate(() => window.__helm.sailToEgg('city', 0.6));
  await p.waitForTimeout(300);
  await p.keyboard.press('a');
  await p.waitForTimeout(2600);
  out.city = { hint, plate, landed: p.landed(), errs: p.errs };
  await p.close();

  /* (b) the ink water: hint on approach, sailing in crosses */
  p = await fresh(br);
  await p.evaluate(() => window.__helm.sailToEgg('ink', 1.05));
  await p.evaluate(() => window.__helm.sail('full'));
  await p.waitForTimeout(700);
  const inkHint = await cap(p);
  await p.screenshot({ path: 'iterlog/r9-egg-ink-approach.png' });
  await p.waitForFunction(() => window.__helmDiag.crossing === 'bythedeep', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(2200);
  out.ink = { hint: inkHint, landed: p.landed(), errs: p.errs };
  await p.close();

  /* (f) the bottle: visible, hinted, click fishes it out */
  p = await fresh(br);
  await p.evaluate(() => window.__helm.sailToEgg('bottle', 0.55));
  await p.waitForTimeout(700);
  const botHint = await cap(p);
  const hits = await p.evaluate(() => window.__helm.eggs().hits);
  await p.screenshot({ path: 'iterlog/r9-egg-bottle.png' });
  const bh = hits.find(h => h.key === 'bottle');
  if (bh) await p.mouse.click(bh.x, bh.y);
  await p.waitForTimeout(2200);
  out.bottle = { hint: botHint, hit: bh, landed: p.landed(), errs: p.errs };
  await p.close();

  /* (g) the crate on the strand: click breaks it open */
  p = await fresh(br);
  await p.evaluate(() => window.__helm.sailToEgg('crate', 0.55));
  await p.waitForTimeout(700);
  const crHint = await cap(p);
  const hits2 = await p.evaluate(() => window.__helm.eggs().hits);
  await p.screenshot({ path: 'iterlog/r9-egg-crate.png' });
  const ch = hits2.find(h => h.key === 'crate');
  if (ch) await p.mouse.click(ch.x, ch.y);
  await p.waitForTimeout(2200);
  out.crate = { hint: crHint, hit: ch, landed: p.landed(), errs: p.errs };
  await p.close();

  /* (d) the star: dusk, glass held on the mover */
  p = await fresh(br, '&hour=dusk');
  await p.keyboard.down(' ');
  const t0 = Date.now();
  let starHint = '';
  while (Date.now() - t0 < 9000) {
    const st = await p.evaluate(() => {
      const e = window.__helm.eggs();
      window.__helm.aimGlass(e.star.screen.x, e.star.screen.y);
      return { hold: e.star.hold, crossing: e.crossing };
    });
    if (st.hold > 1.2 && !starHint) starHint = await cap(p);
    if (st.crossing) break;
    await p.waitForTimeout(120);
  }
  await p.screenshot({ path: 'iterlog/r9-egg-star.png' });
  await p.keyboard.up(' ');
  await p.waitForTimeout(2200);
  out.star = { hint: starHint, landed: p.landed(), errs: p.errs };
  await p.close();

  /* (e) the specimen slips from the log */
  p = await fresh(br);
  await p.keyboard.press('l');
  await p.waitForTimeout(600);
  const spec = await p.evaluate(() => {
    const el = document.getElementById('specimen');
    return el ? { text: el.textContent.trim().slice(0, 60), cls: el.className } : null;
  });
  await p.screenshot({ path: 'iterlog/r9-egg-specimen.png' });
  await p.click('#specimen');
  await p.waitForTimeout(2100);
  out.specimen = { spec, landed: p.landed(), errs: p.errs };
  await p.close();

  /* (c) the coastal path at the longest shore */
  p = await fresh(br);
  const pathSlug = await p.evaluate(() => window.__helm.eggs().path.slug);
  await p.evaluate(s => window.__helm.open(s), pathSlug);
  await p.waitForTimeout(500);
  const pathBlock = await p.evaluate(() => {
    const el = document.querySelector('.egg-path');
    return el ? el.textContent.replace(/\s+/g, ' ').trim().slice(0, 90) : null;
  });
  await p.screenshot({ path: 'iterlog/r9-egg-path.png' });
  await p.click('.egg-path button.act');
  await p.waitForTimeout(2100);
  out.path = { slug: pathSlug, block: pathBlock, landed: p.landed(), errs: p.errs };
  await p.close();

  await br.close();
  console.log(JSON.stringify(out, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
