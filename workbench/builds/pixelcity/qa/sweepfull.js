const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message.slice(0, 160)));
  await page.goto('http://localhost:8787/pixelcity/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const slugs = await page.evaluate(() => Object.keys(pagesBySlug));
  const short = [], ovf = [];
  for (const slug of slugs) {
    await page.evaluate(s => { location.hash = '#' + s; }, slug);
    await page.waitForTimeout(35);
    const r = await page.evaluate(() => ({
      len: document.getElementById('panel-content').innerText.length,
      ovf: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      hidden: document.getElementById('panel').hidden
    }));
    if (r.hidden || r.len < 40) short.push(slug + ' len=' + r.len);
    if (r.ovf) ovf.push(slug);
  }
  console.log('TOTAL:', slugs.length, 'SHORT:', short.length ? short : 'none', 'OVERFLOW:', ovf.length ? ovf : 'none');

  // block-kind spot checks on known pages
  const checks = await page.evaluate(() => {
    const out = {};
    function open(s){ location.hash = '#' + s; }
    return (async () => {
      const q = (sel) => document.querySelectorAll(sel).length;
      open('/cms/api/document-service'); await new Promise(r=>setTimeout(r,120));
      out.epJS = q('.endpoint');
      open('/cms/api/rest'); await new Promise(r=>setTimeout(r,120));
      out.epHTTP = q('.ep-method'); out.tabs = q('.tabset'); out.resp = q('.ep-resp-line');
      open('/cms/api/graphql'); await new Promise(r=>setTimeout(r,120));
      out.epCall = q('.endpoint'); out.colwrap = q('.colwrap');
      open('/cloud/getting-started/intro'); await new Promise(r=>setTimeout(r,120));
      out.cards = q('.cardlink');
      open('/cms/features/media-library'); await new Promise(r=>setTimeout(r,120));
      out.imgs = q('#panel-content img'); out.badges = q('.badge'); out.details = q('details.dtl');
      open('/cms/intro'); await new Promise(r=>setTimeout(r,120));
      out.tldr = q('.tldr');
      // admonition census across all pages via renderer sample: check a caution + danger page
      open('/cms/migration/v4-to-v5/breaking-changes'); await new Promise(r=>setTimeout(r,120));
      out.adm = q('.adm');
      return out;
    })();
  });
  console.log('BLOCK CHECKS:', JSON.stringify(checks));
  // img actually loads?
  const imgok = await page.evaluate(async () => {
    location.hash = '#/cms/features/media-library';
    await new Promise(r => setTimeout(r, 300));
    const im = document.querySelector('#panel-content img');
    if (!im) return 'no-img';
    const r2 = await fetch(im.getAttribute('src'));
    return im.getAttribute('src') + ' -> ' + r2.status;
  });
  console.log('IMG:', imgok);
  console.log('ERRORS:', errors.length ? errors.slice(0, 10) : 'none', '(total ' + errors.length + ')');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
