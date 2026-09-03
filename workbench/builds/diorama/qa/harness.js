const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs = require('fs');
const BASE = 'http://127.0.0.1:8971/';
const ALL = process.argv.includes('--all');

(async () => {
  const content = JSON.parse(fs.readFileSync('content.json', 'utf8'));
  const order = content.order;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.addInitScript(() => {
    window.__errs = [];
    window.addEventListener('error', e => window.__errs.push('error: ' + (e.message || e.error)));
    window.addEventListener('unhandledrejection', e =>
      window.__errs.push('rejection: ' + ((e.reason && e.reason.message) || e.reason)));
  });
  const consoleErrs = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => consoleErrs.push('PAGEERROR ' + String(e).slice(0, 300)));

  const t0 = Date.now();
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('#doc') && document.querySelector('#doc').textContent.length > 300, { timeout: 20000 });
  const firstContent = Date.now() - t0;
  await page.waitForFunction(() => window.__city && window.__city.count() > 0, { timeout: 30000 });
  const ready = Date.now() - t0;

  // choose the slugs: every section represented, plus a fixed stride
  const bySec = {};
  order.forEach(s => { const p = content.pages[s]; (bySec[p.product + '/' + p.section] ||= []).push(s); });
  let slugs;
  if (ALL) slugs = order.slice();
  else {
    const set = new Set();
    Object.values(bySec).forEach(arr => { set.add(arr[0]); set.add(arr[arr.length - 1]); if (arr.length > 4) set.add(arr[arr.length >> 1]); });
    for (let i = 0; i < order.length; i += 4) set.add(order[i]);
    slugs = [...set];
  }

  const bad = { err: [], thin: [], overflow: [], title: [] };
  let minChars = 1e9;
  for (const s of slugs) {
    const r = await page.evaluate(async (slug) => {
      location.hash = '#' + slug;
      await new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));
      const doc = document.querySelector('#doc');
      return {
        chars: doc ? doc.innerText.replace(/\s+/g, ' ').trim().length : 0,
        title: document.title,
        ow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        bw: document.body.scrollWidth - document.body.clientWidth,
        errs: window.__errs.slice()
      };
    }, s);
    if (r.errs.length) bad.err.push([s, r.errs[0]]);
    if (r.chars < 400) bad.thin.push([s, r.chars]);
    if (r.ow > 0 || r.bw > 0) bad.overflow.push([s, r.ow, r.bw]);
    if (!r.title || !/Strapi Documentation/.test(r.title)) bad.title.push([s, r.title]);
    if (r.chars < minChars) minChars = r.chars;
  }

  // history: back / forward
  await page.goBack(); await page.waitForTimeout(150);
  const afterBack = await page.evaluate(() => location.hash);
  await page.goForward(); await page.waitForTimeout(150);
  const afterFwd = await page.evaluate(() => location.hash);

  // empty hash goes to the introduction
  await page.evaluate(() => { location.hash = ''; });
  await page.waitForTimeout(200);
  const emptyHash = await page.evaluate(() => location.hash + ' | ' + document.title);

  // block-kind coverage over the rendered DOM of every page
  const kinds = await page.evaluate(async (all) => {
    const need = ['p', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'code', 'table', 'tabs', 'details',
      'img', 'endpoint', 'cards', 'badge', 'tldr', 'columns', 'hr',
      'adm-note', 'adm-tip', 'adm-info', 'adm-caution', 'adm-warning', 'adm-danger',
      'adm-prerequisites', 'adm-strapi', 'adm-callout'];
    const found = {};
    const sel = {
      p: '.doc > p, .doc p', h2: '.doc h2', h3: '.doc h3', h4: '.doc h4', h5: '.doc h5', h6: '.doc h6',
      ul: '.doc ul', ol: '.doc ol', code: '.doc .cw pre code', table: '.doc table', tabs: '.doc .tabs',
      details: '.doc details.det', img: '.doc figure.fig img', endpoint: '.doc .ep', cards: '.doc .cards',
      badge: '.doc .badge', tldr: '.doc .tldr', columns: '.doc .cols', hr: '.doc hr'
    };
    for (const k of need) if (k.startsWith('adm-')) sel[k] = '.doc .' + k;
    for (const s of all) {
      location.hash = '#' + s;
      await new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));
      for (const k of need) if (!found[k] && document.querySelector(sel[k])) found[k] = s;
      if (need.every(k => found[k])) break;
    }
    return { found, missing: need.filter(k => !found[k]) };
  }, order);

  // frame timing at 1440x900 with everything on screen
  await page.evaluate(() => { document.body.classList.add('wide'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(250);
  const home = await page.evaluate(() => { window.__city.home(); return window.__city.prof(20); });
  const inCity = await page.evaluate(() => {
    const b = window.__city.at('/cms/api/rest');
    window.__city.setCam({ tx: b.wx, ty: b.wy, dist: 420, az: 1.34, el: 0.26 });
    return window.__city.prof(20);
  });
  const visible = await page.evaluate(() => window.__city.visible());

  console.log(JSON.stringify({
    firstContentMs: firstContent, readyMs: ready,
    slugsTested: slugs.length, minChars,
    pagesWithErrors: bad.err.length, errSample: bad.err.slice(0, 3),
    pagesUnder400: bad.thin.length, thinSample: bad.thin.slice(0, 5),
    pagesWithOverflow: bad.overflow.length, overflowSample: bad.overflow.slice(0, 3),
    badTitles: bad.title.length,
    consoleErrors: consoleErrs.length, consoleSample: consoleErrs.slice(0, 3),
    afterBack, afterFwd, emptyHash,
    blockKindsMissing: kinds.missing,
    frameHomeMs: home, frameInCityMs: inCity, visibleBuildings: visible
  }, null, 1));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
