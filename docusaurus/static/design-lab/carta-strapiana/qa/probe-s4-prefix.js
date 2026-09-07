/* S4 condition 5: the app boots clean under a path prefix, gallery-style.
   Loads /cartastrapiana/ from the parent-dir server, counts every non-2xx
   response and every failed request, opens a page whose paper carries
   images, and proves the audio manifest arrived. Zero 404s, boot clean. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const PORT = process.argv[2] || '8787';
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const bad = [], failed = [], errs = [];
  page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
  page.on('requestfailed', r => failed.push(r.url() + ' ' + (r.failure() ? r.failure().errorText : '')));
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') errs.push('C ' + m.text().slice(0, 160)); });

  await page.goto('http://127.0.0.1:' + PORT + '/cartastrapiana/?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 60000 });
  await page.keyboard.press('x');                    /* wake the audio graph */
  await page.waitForFunction(() => (window.__helmDiag.voicesLoaded || 0) > 0, null, { timeout: 40000 });

  /* a paper with real images, read under the prefix */
  const withImg = await page.evaluate(() => {
    for (const I of world.islands) {
      const pg = world.content.pages[I.slug];
      if (pg && pg.blocks && JSON.stringify(pg.blocks).indexOf('"img"') >= 0) return I.slug;
    }
    return null;
  });
  if (withImg) {
    await page.evaluate(sl => window.__helm.open(sl), withImg);
    await page.waitForTimeout(2500);
  }
  const state = await page.evaluate(() => ({
    ready: window.__helm.ready, islands: world.islands.length,
    voices: window.__helmDiag.voicesLoaded || 0, mode: ui.mode, slug: ui.slug,
    imgs: Array.from(document.querySelectorAll('#pagepaper img')).map(i => ({ ok: i.complete && i.naturalWidth > 0, src: i.src.slice(-40) }))
  }));
  const imgFail = state.imgs.filter(i => !i.ok).length;
  /* 288, not 290: the two release-notes pages are struck from the sea at source
     (NOT_CHARTED in loadData), because a release note is not a place you sail to.
     This probe kept asking for 290 long after that ruling and failed on it. */
  const CHARTED = 288;
  const pass = bad.length === 0 && failed.length === 0 && errs.length === 0 &&
    state.ready && state.islands === CHARTED && state.voices > 0 && imgFail === 0;
  console.log(JSON.stringify({ pageWithImages: withImg, state, non2xx: bad, failed, errs }, null, 1));
  console.log('PREFIX BOOT:', pass ? 'PASS' : 'FAIL');
  await br.close();
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
