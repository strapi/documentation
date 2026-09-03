/* Retrofit check: 25 slugs, console errors, short pages, overflow, French scan. */
const path = require('path');
const fs = require('fs');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');

const PORT = process.env.PORT || 8481;
const BASE = 'http://localhost:' + PORT + '/index.html';
const TITLE_BRAND = process.env.BRAND || 'SHOP·DOCS';

const FR_WORDS = ['MAINTENANT', 'SEULEMENT', 'VOIE', 'DÉPARTS', 'GARE', 'ACHAT', 'mots', 'pages restantes', 'conseillères'];

function scanText(text) {
  const accents = text.match(/[àâçéèêëîïôùûœ]/gi) || [];
  const words = {};
  for (const w of FR_WORDS) {
    const re = new RegExp('(?<![A-Za-zÀ-ÿ])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-zÀ-ÿ])', 'gi');
    words[w] = (text.match(re) || []).length;
  }
  const contexts = [];
  let m; const re = /[àâçéèêëîïôùûœ]/gi;
  while ((m = re.exec(text)) && contexts.length < 12) {
    contexts.push(text.slice(Math.max(0, m.index - 50), m.index + 50).replace(/\s+/g, ' '));
  }
  return { accents: accents.length, words, contexts };
}

(async () => {
  const content = JSON.parse(fs.readFileSync(path.join(__dirname, 'content.json')));
  const order = content.order;
  const slugs = [];
  for (let i = 0; i < 25; i++) slugs.push(order[Math.floor(i * order.length / 25)]);
  if (!slugs.includes('/cms/intro')) slugs[0] = '/cms/intro';

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 300)); });
  page.on('pageerror', e => errors.push('[pageerror] ' + String(e).slice(0, 300)));
  page.on('requestfailed', r => {
    if (!r.url().startsWith('data:')) errors.push('[reqfail] ' + r.url());
  });

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.showcase', { timeout: 10000 });

  const problems = [];
  let shortPages = 0, overflows = 0;
  for (const slug of slugs) {
    const before = errors.length;
    await page.evaluate(s => { location.hash = '#' + s; }, slug);
    await page.waitForFunction(() => document.querySelector('.doc-panel') || document.querySelector('.lost-call'), null, { timeout: 8000 });
    await page.waitForTimeout(120);
    const res = await page.evaluate(() => {
      const panel = document.querySelector('.doc-panel');
      return {
        textLen: panel ? panel.innerText.length : 0,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        title: document.title,
        lost: !!document.querySelector('.lost-call')
      };
    });
    if (res.lost) problems.push(slug + ': LOST PAGE');
    if (res.textLen < 200) { shortPages++; problems.push(slug + ': SHORT (' + res.textLen + ')'); }
    if (res.overflow > 1) { overflows++; problems.push(slug + ': OVERFLOW ' + res.overflow + 'px'); }
    if (!res.title.includes(TITLE_BRAND)) problems.push(slug + ': BAD TITLE ' + res.title);
    if (errors.length > before) problems.push(slug + ': ' + errors.slice(before).join(' | '));
  }
  console.log('slugs checked:', slugs.length, '| errors:', errors.length, '| short:', shortPages, '| overflow:', overflows);

  // French scan: home view (chrome only — exclude doc content) and full, plus one segment view
  await page.evaluate(() => { location.hash = '#/cms/intro'; });
  await page.waitForTimeout(300);
  const homeScan = scanText(await page.evaluate(() => document.body.innerText));
  const homeChromeScan = scanText(await page.evaluate(() => {
    const clone = document.body.cloneNode(true);
    const dp = clone.querySelector('.doc-panel'); if (dp) dp.remove();
    return clone.innerText;
  }));
  await page.evaluate(() => { location.hash = '#/cms/api/document-service'; });
  await page.waitForTimeout(400);
  const segScan = scanText(await page.evaluate(() => document.body.innerText));
  const segChromeScan = scanText(await page.evaluate(() => {
    const clone = document.body.cloneNode(true);
    const dp = clone.querySelector('.doc-panel'); if (dp) dp.remove();
    return clone.innerText;
  }));

  console.log('HOME full-page scan: accents=' + homeScan.accents, 'words=' + JSON.stringify(homeScan.words));
  console.log('HOME chrome-only scan (doc content excluded): accents=' + homeChromeScan.accents, 'words=' + JSON.stringify(homeChromeScan.words));
  if (homeChromeScan.accents) console.log('  contexts:', homeChromeScan.contexts);
  console.log('SEGMENT full-page scan: accents=' + segScan.accents, 'words=' + JSON.stringify(segScan.words));
  console.log('SEGMENT chrome-only scan: accents=' + segChromeScan.accents, 'words=' + JSON.stringify(segChromeScan.words));
  if (segChromeScan.accents) console.log('  contexts:', segChromeScan.contexts);
  if (homeScan.accents) console.log('  home full contexts:', homeScan.contexts.slice(0, 6));

  const frenchInChrome = homeChromeScan.accents + segChromeScan.accents +
    Object.values(homeChromeScan.words).reduce((a, b) => a + b, 0) +
    Object.values(segChromeScan.words).reduce((a, b) => a + b, 0);

  console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'ALL CLEAN');
  await browser.close();
  process.exit(problems.length || (frenchInChrome ? 1 : 0) ? (problems.length ? 1 : 0) : 0);
})().catch(e => { console.error('CHECK CRASH', e); process.exit(2); });
