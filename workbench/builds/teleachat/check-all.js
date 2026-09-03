/* Self-check: 70 slugs, console errors, short pages, horizontal overflow, routing. */
const path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs = require('fs');

const BASE = 'http://localhost:8471/index.html';

(async () => {
  const content = JSON.parse(fs.readFileSync(path.join(__dirname, 'content.json')));
  const order = content.order;
  // 70 slugs: spread evenly + known complex pages
  const targets = new Set();
  order.forEach(s=>targets.add(s));
  ['/cms/api/document-service', '/cms/api/rest', '/cms/api/graphql', '/cms/quick-start',
   '/cms/intro', '/cloud/projects/settings', '/cms/api/rest/guides/understanding-populate',
   '/cms/migration/v4-to-v5/breaking-changes'].forEach(s => targets.add(s));
  const slugs = [...targets];
  console.log('checking', slugs.length, 'slugs');

  let browser = await chromium.launch();
  let ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  let page = await ctx.newPage();

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 300)); });
  page.on('pageerror', e => errors.push('[pageerror] ' + String(e).slice(0, 300)));
  page.on('requestfailed', r => {
    const u = r.url();
    if (!u.startsWith('data:')) errors.push('[reqfail] ' + u + ' ' + (r.failure() || {}).errorText);
  });

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.showcase', { timeout: 10000 });

  const problems = [];
  for (const slug of slugs) {
    const before = errors.length;
    await page.evaluate(s => { location.hash = '#' + s; }, slug);
    await page.waitForFunction(() => document.querySelector('.doc-panel') || document.querySelector('.lost-call'), null, { timeout: 8000 });
    await page.waitForTimeout(120);
    const res = await page.evaluate(() => {
      const panel = document.querySelector('.doc-panel');
      const textLen = panel ? panel.innerText.length : 0;
      const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      // find widest offender if overflow
      let offender = '';
      if (overflow > 1) {
        const w = document.documentElement.clientWidth;
        for (const eln of document.querySelectorAll('body *')) {
          const r = eln.getBoundingClientRect();
          if (r.right > w + 1 || r.left < -1) { offender = eln.className ? String(eln.className).slice(0, 80) : eln.tagName; break; }
        }
      }
      return { textLen, overflow, offender, title: document.title, lost: !!document.querySelector('.lost-call') };
    });
    if (res.lost) problems.push(slug + ': LOST PAGE');
    if (res.textLen < 200) problems.push(slug + ': SHORT (' + res.textLen + ' chars)');
    if (res.overflow > 1) problems.push(slug + ': OVERFLOW ' + res.overflow + 'px (' + res.offender + ')');
    if (!res.title.includes('TÉLÉ·ACHAT')) problems.push(slug + ': BAD TITLE ' + res.title);
    if (errors.length > before) problems.push(slug + ': ' + errors.slice(before).join(' | '));
  }

  // routing checks: empty hash, back/forward, anchor
  await page.goto('http://localhost:8471/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.title.includes('TÉLÉ·ACHAT') && document.querySelector('.doc-panel'), null, { timeout: 8000 });
  const introTitle = await page.evaluate(() => ({ hashless: document.title, h1: document.querySelector('.product-name').textContent }));
  console.log('empty hash renders:', JSON.stringify(introTitle));

  await page.evaluate(() => { location.hash = '#/cms/api/rest'; });
  await page.waitForTimeout(300);
  const t1 = await page.title();
  await page.goBack();
  await page.waitForTimeout(300);
  const t2 = await page.title();
  await page.goForward();
  await page.waitForTimeout(300);
  const t3 = await page.title();
  console.log('nav titles:', t1, '||', t2, '||', t3);
  if (t1 === t2 || t1 !== t3) problems.push('back/forward broken: ' + [t1, t2, t3].join(' / '));

  // search check
  await page.fill('#search', 'populate');
  await page.waitForTimeout(250);
  const nres = await page.evaluate(() => document.querySelectorAll('.sr-item').length);
  console.log('search "populate" results:', nres);
  if (nres < 1) problems.push('search returned nothing');

  console.log('total console/page errors:', errors.length);
  console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'ALL CLEAN');
  await browser.close();
  process.exit(problems.length ? 1 : 0);
})().catch(e => { console.error('CHECK CRASH', e); process.exit(2); });
