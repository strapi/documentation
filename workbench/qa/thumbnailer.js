/* THE GALLERY'S CARDS. Refresh a thumbnail for every world the gallery shows.

   Two rules, both learned on 2026-09-09, when most cards in the lab were
   showing a world that did not work.

   IT PHOTOGRAPHS WHAT THE GALLERY SERVES. Source resolution lives in
   qa/worldsource.js and nowhere else. This script used to keep its own list of
   directories under /private/tmp, which is how it came to photograph six
   worlds whose data bundles had been deleted underneath them.

   A CARD IS ONLY REPLACED BY A SHOT THAT PASSES. Nothing checked, before, that
   the page had loaded at all: FIRST LIGHT's card became its own "Instrument
   failure" dialog, Pixel Docs City's became "Could not load the city", and the
   Herbarium's became its loading splash, caught before the plates were
   mounted. Five gates now stand between a screenshot and a card, and a
   rejected shot leaves the old card exactly where it was:
     1. no request answered 400 or worse (a missing data file is a 404, which
        is the whole of what went wrong that morning);
     2. no page error, and no JSON answered with an empty body;
     3. no failure sentence in the rendered text;
     4. the world says it is ready, or at least its splash is gone;
     5. the PNG carries enough detail to be a world rather than a message. The
        failures that shipped weighed 9.6 to 19 KB; every working card weighed
        79 KB to 1.4 MB, so the floor sits at 60 KB, and a card cannot shrink
        to less than half of what it replaces.

   Usage: node thumbnailer.js [--once] [key ...] */

const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { IMG, THUMBS, PLACES, source, readWorld } = require('./worldsource.js');

const args = process.argv.slice(2);
const ONCE = args.includes('--once');
const ONLY = args.filter((a) => !a.startsWith('--'));

/* the worlds the gallery shows, in the order it shows them */
const KEYS = ['longway', 'pixelcity', 'herbarium', 'firstlight', 'cartastrapiana',
  'secreta', 'goldenshore', 'bythedeep', 'alpenglow', 'secretb', 'cityx', 'workingsea']
  .filter((k) => PLACES[k] && (!ONLY.length || ONLY.includes(k)));

const MIN_BYTES = 60000;
const SHRINK_FLOOR = 0.5;
const FAIL_TEXT = [
  'instrument failure', 'could not load', 'unexpected end of json',
  "failed to execute 'json'", 'this experience needs javascript',
  'failed to fetch', 'uncaught', 'not found',
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

const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.png':'image/png',
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.gif':'image/gif', '.svg':'image/svg+xml',
  '.webp':'image/webp', '.ico':'image/x-icon', '.txt':'text/plain; charset=utf-8',
  '.ogg':'audio/ogg', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.m4a':'audio/mp4' };

let currentKey = null;
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  if (u.startsWith('/img/')) {
    const f = path.join(IMG, u.slice(5));
    return fs.readFile(f, (e, d) => {
      if (e) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
      r.end(d);
    });
  }
  const rel = u === '/' ? 'index.html' : u.replace(/^\//, '');
  readWorld(currentKey, rel, (e, d) => {
    if (e) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'content-type': MIME[path.extname(rel)] || 'application/octet-stream' });
    r.end(d);
  });
});
const PORT = 9707;
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/* Worlds whose card must be shot in a named state rather than whatever the
   arrival dice give. The Golden Shore rolls a 40 percent chance of arriving
   in MIST, which is a real state of that world and a poor picture of it: the
   town goes white, the sky navy and the coast loses its hour. Its own
   preview switch settles it. */
const QUERY = {
  goldenshore: '?wx=clear',
};

/* Worlds that say for themselves when they are ready, in their own terms. */
const READY = {
  firstlight: () => !!(window.__diag && window.__diag.state !== 'boot'),
};

/* Some worlds need staging so the card shows the experience, not the intro. */
const STAGE = {
  /* (2026-09-07, owner) The card should show the town as it looks on arrival:
     the whole island at a glance, plain afternoon light, and nothing laid over
     it. Zoom 2 fits the island in the frame; 0.625 of a day is 15:00. */
  pixelcity: async (page) => {
    /* step off the quick-start doorstep, or its prompt sits in the picture */
    await page.keyboard.down('ArrowRight'); await page.waitForTimeout(1500); await page.keyboard.up('ArrowRight');
    await page.waitForTimeout(500);
    await page.evaluate(() => { const a = window.__pixelTest || {}; try { a.setClock && a.setClock(0.625); } catch (e) {} });
    /* the town's own Fit island control, which is exactly the framing wanted */
    await page.click('#zfit').catch(() => {});
    await page.waitForTimeout(2200);
    /* the welcome card arrives on its own schedule, after the staging above.
       It is hidden rather than clicked: its button is Take me there, which
       would walk the courier and undo the framing. */
    await page.evaluate(() => {
      ['hintcard', 'doorprompt', 'folklabel', 'introprompt'].forEach(function (id) {
        var el = document.getElementById(id); if (el) el.hidden = true;
      });
    });
    await page.waitForTimeout(500);
  },
  /* The card is the TRAIL: her, the relief, the sky and the HUD. The second
     Enter this recipe used to press has become a door: it opened a page and
     the reader then filled two thirds of the card with documentation text.
     One Enter for the title card, and an Escape after the walk in case the
     stroll ended on a threshold. */
  longway: async (page) => {
    await page.keyboard.press('Enter'); await page.waitForTimeout(900);
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    await page.keyboard.down('ArrowRight'); await page.waitForTimeout(2400); await page.keyboard.up('ArrowRight');
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  },
  /* The Herbarium opens its KEY TO THE PLATES panel on a first visit, which
     covers half the cabinet. Closed by its own toolbar control, #btnKey, so
     the world's own state stays consistent; nothing in the world itself is
     touched, which it must not be. */
  herbarium: async (page) => {
    await page.evaluate(() => {
      const b = document.getElementById('btnKey');
      if (b && b.getAttribute('aria-expanded') === 'true') b.click();
    });
    await page.waitForTimeout(900);
  },
  /* FIRST LIGHT opens on its cold open and, once per session, a quick guide.
     Both are dismissed the way a visitor dismisses them, by their own
     buttons, so the card shows the chart this world is actually about. */
  firstlight: async (page) => {
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    await page.evaluate(() => {
      const g = document.getElementById('gd-skip'); if (g && !document.getElementById('guide').hidden) g.click();
    });
    await page.waitForTimeout(1200);
  },
};

/* A splash is a splash whatever a world calls it: nothing whose id or class
   speaks of booting, loading or a splash may still be on screen. */
async function waitReady(page, key) {
  if (READY[key]) {
    await page.waitForFunction(READY[key], { timeout: 12000 }).catch(() => {});
  }
  await page.waitForFunction(() => {
    const sel = '#boot, .boot, #splash, .splash, #loading, .loading, #loader, .loader';
    for (const el of document.querySelectorAll(sel)) {
      const cs = getComputedStyle(el);
      if (cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.01 && el.getClientRects().length) return false;
    }
    return true;
  }, { timeout: 12000 }).catch(() => {});
}

async function shoot(browser, key) {
  currentKey = key;
  const s = source(key);
  if (s.kind === 'none') return { key, ok: false, why: 'no source' };
  const page = await browser.newPage({ viewport: { width: 1200, height: 750 } });
  const bad = [], errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 120)));
  page.on('response', async (res) => {
    const u = res.url().replace(/^http:\/\/[^/]+/, '');
    if (res.status() >= 400) { if (!optional(key, u)) bad.push(res.status() + ' ' + u); }
    else if (/\.json(\?|$)/.test(res.url())) {
      try { const b = await res.body(); if (!b || !b.length) bad.push('empty ' + u); }
      catch (e) { /* body already gone: the status check above stands */ }
    }
  });
  try {
    await page.goto('http://localhost:' + PORT + '/index.html' + (QUERY[key] || ''), { waitUntil: 'load', timeout: 20000 });
    await waitReady(page, key);
    await page.waitForTimeout(2500);
    if (STAGE[key]) { try { await STAGE[key](page); } catch (e) { /* staging is best effort */ } }
    await page.waitForTimeout(600);

    if (bad.length) return { key, ok: false, why: 'requests failed: ' + bad.slice(0, 3).join(', '), page };
    if (errs.length) return { key, ok: false, why: 'page error: ' + errs[0], page };
    const text = (await page.evaluate(() => (document.body && document.body.innerText) || '')).toLowerCase();
    const hit = FAIL_TEXT.find((f) => text.includes(f));
    if (hit) return { key, ok: false, why: 'the page says "' + hit + '"', page };

    const buf = await page.screenshot({ timeout: 15000 });
    const dest = path.join(THUMBS, key + '.png');
    let prev = 0;
    try { prev = fs.statSync(dest).size; } catch (e) {}
    if (buf.length < MIN_BYTES) return { key, ok: false, why: 'only ' + Math.round(buf.length / 1024) + ' KB of detail, floor is ' + Math.round(MIN_BYTES / 1024), page };
    if (prev && buf.length < prev * SHRINK_FLOOR) return { key, ok: false, why: Math.round(buf.length / 1024) + ' KB against the ' + Math.round(prev / 1024) + ' KB card it would replace', page };

    fs.mkdirSync(THUMBS, { recursive: true });
    const tmp = path.join(THUMBS, 'tmp-' + key + '.png');
    fs.writeFileSync(tmp, buf);
    fs.renameSync(tmp, dest);
    return { key, ok: true, why: Math.round(buf.length / 1024) + ' KB, from the ' + s.kind, page };
  } catch (e) {
    return { key, ok: false, why: String(e.message).slice(0, 120), page };
  }
}

(async () => {
  await new Promise((res) => srv.listen(PORT, res));
  for (;;) {
    let browser = null;
    try {
      browser = await chromium.launch();
      for (const key of KEYS) {
        const r = await shoot(browser, key);
        console.log((r.ok ? '  new card   ' : '  kept old   ') + key.padEnd(16) + r.why);
        if (r.page) { try { await r.page.close(); } catch (e) {} }
      }
    } catch (e) { console.log('  browser failed: ' + e.message); }
    try { if (browser) await browser.close(); } catch (e) {}
    if (ONCE) break;
    await sleep(300000);
  }
  srv.close();
  if (ONCE) process.exit(0);
})();
