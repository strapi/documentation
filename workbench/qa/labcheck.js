/* DOES THE LAB WORK. One command that answers the question nobody could
   answer on 2026-09-09, when most cards in the gallery were showing worlds
   that could not load and nothing was watching.

   It goes through the RUNNING GALLERY on localhost:8787, the way a visitor
   does, rather than through a server of its own: the gallery injects a reload
   script and a way home into every page it serves, so a world can be whole on
   its branch and still broken through the gallery. For each world it asserts

     - the page loads, and nothing it asks for is answered 400 or worse
       (a missing data file is a 404, which is the whole of that morning);
     - no JSON arrives with an empty body (a 200 with nothing in it throws
       "Unexpected end of JSON input", which is what the cards were showing);
     - no page error;
     - no failure sentence in the rendered text;
     - it has a gallery card, and the card is a world rather than a message.

   Usage: node labcheck.js [key ...]      (needs livepreview.js running) */

'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { THUMBS, PLACES, source } = require('./worldsource.js');

const BASE = 'http://localhost:8787';
const MIN_BYTES = 60000;
const FAIL_TEXT = [
  'instrument failure', 'could not load', 'unexpected end of json',
  "failed to execute 'json'", 'this experience needs javascript',
  'failed to fetch', 'the agent has not written index.html yet',
];
/* SOME 404s ARE A WORLD ASKING A QUESTION, not a world breaking. The
   Four-Color forges its plates in code and, in its own words, "an optional
   images/plates/manifest.json credits the" real plates when someone has drawn
   them; neither that file nor its index has ever existed, so both answer 404
   on every visit and always have. Anything NOT listed here still fails the
   gate, which is the whole point: the morning's breakage was a 404 on
   content.json. */
const OPTIONAL_404 = {
  secreta: ['/images/plates/index.json', '/images/plates/manifest.json'],
};
const optional = (key, url) => (OPTIONAL_404[key] || []).some((p) => url.endsWith(p));
const ONLY = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const KEYS = ['longway', 'pixelcity', 'herbarium', 'firstlight', 'cartastrapiana',
  'secreta', 'goldenshore', 'bythedeep', 'alpenglow', 'secretb', 'cityx', 'workingsea']
  .filter((k) => PLACES[k] && (!ONLY.length || ONLY.includes(k)));

(async () => {
  const res = await fetch(BASE + '/').catch(() => null);
  if (!res || !res.ok) {
    console.log('  the gallery is not answering on ' + BASE + ' - start livepreview.js first');
    process.exit(2);
  }
  const browser = await chromium.launch();
  const rows = [];
  for (const key of KEYS) {
    const faults = [];
    const s = source(key);
    const page = await browser.newPage({ viewport: { width: 1200, height: 750 } });
    page.on('pageerror', (e) => faults.push('page error: ' + String(e.message).slice(0, 90)));
    page.on('response', async (r) => {
      const u = r.url().replace(BASE, '');
      if (r.status() >= 400) { if (!optional(key, u)) faults.push(r.status() + ' ' + u); }
      else if (/\.json(\?|$)/.test(u)) {
        try { const b = await r.body(); if (!b || !b.length) faults.push('empty ' + u); } catch (e) {}
      }
    });
    try {
      await page.goto(BASE + '/' + key + '/', { waitUntil: 'load', timeout: 25000 });
      await page.waitForTimeout(6000);
      const text = (await page.evaluate(() => (document.body && document.body.innerText) || '')).toLowerCase();
      const hit = FAIL_TEXT.find((f) => text.includes(f));
      if (hit) faults.push('the page says "' + hit + '"');
    } catch (e) {
      faults.push(String(e.message).slice(0, 90));
    }
    await page.close();

    let card = 0;
    try { card = fs.statSync(path.join(THUMBS, key + '.png')).size; } catch (e) {}
    if (!card) faults.push('no gallery card');
    else if (card < MIN_BYTES) faults.push('card is only ' + Math.round(card / 1024) + ' KB');

    rows.push({ key, src: s.kind, card, faults });
    console.log((faults.length ? '  FAIL  ' : '  ok    ') + key.padEnd(16)
      + s.kind.padEnd(11) + String(Math.round(card / 1024) + ' KB').padStart(8)
      + (faults.length ? '   ' + faults.slice(0, 2).join(' | ') : ''));
  }
  await browser.close();
  const bad = rows.filter((r) => r.faults.length);
  console.log(bad.length ? `  ${bad.length} of ${rows.length} worlds are broken in the gallery`
    : `  all ${rows.length} worlds load and carry a card`);
  process.exit(bad.length ? 1 : 0);
})();
