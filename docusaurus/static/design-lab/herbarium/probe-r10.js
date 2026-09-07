/* Round 10 probe: THE FULL SUITE + THE KIT ARCHIVED.
   A. pixel regression, five states, appendix blocked vs enabled
   B. the loan slip (portal confirm): mouse, keyboard, Tab/Enter/Y/N/Esc/scrim,
      cancel cleanliness, beat only after YES, key shielding
   C. reduced motion: same slip, no animation, instant cross after YES
   D. quick start first: front-door gesture, one-shot, deep links untouched
   E. host battery: tools, old/new lens, export, flip, history, narrow,
      placement, hints, kelp, versos, zero console errors
   F. THE KIT IS ARCHIVED: six specimens, zero reachable secretb references,
      the sheet relaid 3+2 with the label centred at the foot, and the
      late accession filed behind it on a sheet of its own */
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs = require('fs');
const BASE = 'http://127.0.0.1:8991/';
const LOG = __dirname + '/iterlog/';
const QA = __dirname + '/qa/';
const out = { errors: {}, A: {}, B: {}, C: {}, D: {}, E: {}, F: {} };
const FAIL = [];
function ok(cond, label) { if (!cond) FAIL.push(label); return !!cond; }

const STATES = [
  ['verso-rest', '#/cms/api/rest'],
  ['recto-rest', '#~s/cms/api/rest'],
  ['all-top', '#~all'],
  ['drawer-features', '#~d/' + encodeURIComponent('cms|Features')],
  ['special-night', '#~night']
];

async function settle(page, ms) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(ms);
}
function collectErrs(page, bucket) {
  out.errors[bucket] = out.errors[bucket] || [];
  page.on('pageerror', e => out.errors[bucket].push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') out.errors[bucket].push('console: ' + m.text().slice(0, 200)); });
}
async function openAppendix(page) {
  /* (2026-09-07) The plate arrives sealed now, so anything that measures it has
     to open the envelope first. Tolerant on purpose: a build without one is not
     an error here, it is an older build. */
  try {
    await page.waitForSelector('#appdxEnv', { timeout: 4000 });
    await page.evaluate(() => {
      const e = document.getElementById('appdxEnv');
      if (e && !e.classList.contains('open')) e.click();
    });
    /* the plate unfolds over 0.9s; hovering into it before it settles measures
       the wrong geometry, which is what ten E failures turned out to be */
    await page.waitForTimeout(1400);
  } catch (e) { /* no envelope on this build */ }
}
async function ready(page, keepSealed) {
  await page.waitForFunction(() => window.__HERB_READY__ === true, { timeout: 25000 });
  if (!keepSealed) await openAppendix(page);
}

(async () => {
  const browser = await chromium.launch();
  async function newCtx(opts, seedSession) {
    const ctx = await browser.newContext(Object.assign({
      viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, acceptDownloads: true
    }, opts || {}));
    await ctx.addInitScript(() => { try { localStorage.setItem('herb.seenkey', '1'); } catch (e) {} });
    if (seedSession) await ctx.addInitScript(() => { try { sessionStorage.setItem('herb.qsWelcomed', '1'); } catch (e) {} });
    return ctx;
  }

  /* ================= A. pixel regression ================= */
  async function shootStates(page, prefix) {
    for (const [name, hash] of STATES) {
      await page.evaluate(h => { location.hash = h; window.scrollTo(0, 0); }, hash);
      await settle(page, 1300);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.mouse.move(0, 0);
      await page.waitForTimeout(250);
      await page.screenshot({ path: QA + prefix + name + '.png' });
    }
  }
  let ctx = await newCtx(null, true);
  let page = await ctx.newPage();
  collectErrs(page, 'A-base');
  await page.route('**/appendix.js', r => r.abort());
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await ready(page);
  await shootStates(page, 'r10base-');
  await page.setViewportSize({ width: 380, height: 800 });
  await page.evaluate(() => { location.hash = '#~all'; });
  await settle(page, 900);
  out.A.narrowBase = await page.evaluate(() => ({ ow: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  await ctx.close();

  ctx = await newCtx(null, true);
  page = await ctx.newPage();
  collectErrs(page, 'A-wave');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await ready(page);
  await shootStates(page, 'r10wave-');
  const diffPage = await ctx.newPage();
  await diffPage.goto('about:blank');
  out.A.pixelDiff = {};
  for (const [name] of STATES) {
    const a = fs.readFileSync(QA + 'r10base-' + name + '.png').toString('base64');
    const b = fs.readFileSync(QA + 'r10wave-' + name + '.png').toString('base64');
    out.A.pixelDiff[name] = await diffPage.evaluate(async ([da, db]) => {
      function load(d) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'data:image/png;base64,' + d; }); }
      const [ia, ib] = await Promise.all([load(da), load(db)]);
      if (ia.width !== ib.width || ia.height !== ib.height) return { sizeMismatch: true };
      const c = document.createElement('canvas'); c.width = ia.width; c.height = ib.height;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(ia, 0, 0); const A = g.getImageData(0, 0, c.width, c.height).data;
      g.clearRect(0, 0, c.width, c.height);
      g.drawImage(ib, 0, 0); const B = g.getImageData(0, 0, c.width, c.height).data;
      let n = 0, maxd = 0, minx = 1e9, miny = 1e9, maxx = -1, maxy = -1;
      for (let i = 0; i < A.length; i += 4) {
        const d = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]);
        if (d > 6) {
          n++; if (d > maxd) maxd = d;
          const p = i / 4, x = p % c.width, y = (p / c.width) | 0;
          if (x < minx) minx = x; if (x > maxx) maxx = x;
          if (y < miny) miny = y; if (y > maxy) maxy = y;
        }
      }
      return { total: c.width * c.height, diff: n, maxd, box: n ? [minx, miny, maxx, maxy] : null };
    }, [a, b]);
    /* (2026-09-07, owner authorised) The law this guards is real and stays: the
       appendix must be strictly additive, changing nothing in the cabinet. Four
       of the five views are identical to the pixel. The night view differs by
       five pixels out of 1,296,000 inside a decorative moon ring, at a colour
       delta of 24 out of 765, and only in about half of runs: an earlier
       verifier measured it four times as 0, 5, 5, 0, always the same 20x2 patch.
       That is sub-perceptual anti-aliasing, not a leak. A tight, named tolerance
       lets the battery be trusted; a net that is permanently red gets ignored,
       which costs more than five invisible pixels. Anything larger still fails. */
    const AA_PIXELS = 8, AA_DELTA = 32;
    const pd = out.A.pixelDiff[name];
    ok(pd.diff === 0 || (pd.diff <= AA_PIXELS && pd.maxd <= AA_DELTA),
      'A pixel ' + name + ' diff=' + pd.diff + (pd.diff ? ' maxd=' + pd.maxd + ' (within the anti-aliasing tolerance)' : ''));
  }
  await diffPage.close();
  await ctx.close();

  /* ============ A2. the envelope keeps the plate shut ============ */
  {
    const ctxE = await newCtx(null, true);
    const pE = await ctxE.newPage();
    collectErrs(pE, 'A2-envelope');
    await pE.goto(BASE + '#~all', { waitUntil: 'domcontentloaded' });
    await ready(pE, true);                      /* deliberately NOT opened */
    await settle(pE, 700);
    const sealed = await pE.evaluate(() => {
      const e = document.getElementById('appdxEnv'), b = document.getElementById('appdxBody');
      return { isButton: !!e && e.tagName === 'BUTTON', expanded: e && e.getAttribute('aria-expanded'),
        bodyHidden: b ? b.hidden : null,
        shown: [...document.querySelectorAll('.appdx-sp')].filter(x => x.getBoundingClientRect().height > 0).length };
    });
    out.A2 = { sealed };
    ok(sealed.isButton, 'A2 the envelope is a real button');
    ok(sealed.bodyHidden === true && sealed.shown === 0, 'A2 no specimen shows before it is opened (' + sealed.shown + ' visible)');
    ok(sealed.expanded === 'false', 'A2 it says so to a screen reader');
    await pE.evaluate(() => document.getElementById('appdxEnv').focus());
    await pE.keyboard.press('Enter');
    await pE.waitForTimeout(900);
    const opened = await pE.evaluate(() => {
      const e = document.getElementById('appdxEnv'), b = document.getElementById('appdxBody');
      return { expanded: e.getAttribute('aria-expanded'), hidden: b.hidden,
        shown: [...document.querySelectorAll('.appdx-sp')].filter(x => x.getBoundingClientRect().height > 0).length };
    });
    out.A2.opened = opened;
    ok(opened.expanded === 'true' && !opened.hidden && opened.shown === 6,
      'A2 Enter opens it and all six come out (' + opened.shown + ')');
    await ctxE.close();
  }

  /* ================= B. the loan slip ================= */
  ctx = await newCtx();
  page = await ctx.newPage();
  collectErrs(page, 'B-slip');
  await page.goto(BASE + '#~all', { waitUntil: 'domcontentloaded' });
  await ready(page);
  await settle(page, 700);

  async function clickSpecimen(k) {
    const p = await page.evaluate(kk => {
      const el = document.querySelector('.appdx-sp[data-w="' + kk + '"]');
      el.scrollIntoView({ block: 'center' });
      const f = el.querySelector('.appdx-fig').getBoundingClientRect();
      return { x: f.x + f.width / 2, y: f.y + f.height / 2 };
    }, k);
    await page.waitForTimeout(220);
    await page.mouse.click(p.x, p.y);
    await page.waitForTimeout(350);
  }
  async function slipState() {
    return page.evaluate(() => {
      const v = document.getElementById('appdxVeil');
      const lens = document.querySelector('#lens');
      return {
        open: !!v,
        head: v ? v.querySelector('.appdx-slip-head').textContent : '',
        name: v ? v.querySelector('.appdx-slip-name').textContent : '',
        q: v ? v.querySelector('.appdx-slip-q').textContent : '',
        yes: v ? !!v.querySelector('[data-slip="yes"]') : false,
        no: v ? !!v.querySelector('[data-slip="no"]') : false,
        focus: v ? (document.activeElement.dataset || {}).slip || document.activeElement.tagName : null,
        role: v ? v.querySelector('.appdx-slip').getAttribute('role') : null,
        modal: v ? v.querySelector('.appdx-slip').getAttribute('aria-modal') : null,
        crossing: !!document.querySelector('.appdx-crossing'),
        lensHidden: lens ? lens.hidden : true,
        here: location.pathname
      };
    });
  }
  async function cleanState() {
    return page.evaluate(() => ({
      veil: !!document.getElementById('appdxVeil'),
      crossing: !!document.querySelector('.appdx-crossing'),
      lending: !!document.querySelector('.appdx-lending'),
      ds: document.getElementById('appdxSheet').dataset.crossing || null,
      focusW: (document.activeElement.dataset || {}).w || null,
      here: location.pathname, hash: location.hash
    }));
  }

  /* B1: mouse opens the slip; nothing crosses yet */
  await clickSpecimen('pixelcity');
  let s = await slipState();
  out.B.open = s;
  ok(s.open && s.yes && s.no, 'B1 slip open with YES/NO');
  ok(s.q.indexOf('another world entirely') !== -1 && s.q.indexOf('Follow it?') !== -1, 'B1 slip carries the meaning');
  ok(s.name === 'Folium octobitum', 'B1 slip names the specimen');
  ok(s.focus === 'yes', 'B1 focus starts on YES');
  ok(s.role === 'dialog' && s.modal === 'true', 'B1 dialog semantics');
  ok(!s.crossing && s.here === '/', 'B1 no crossing before consent');
  ok(s.lensHidden, 'B1 lens put away');
  await page.screenshot({ path: LOG + 'r10-01-slip.jpg', type: 'jpeg', quality: 82 });
  const slipBox = await page.evaluate(() => {
    const b = document.querySelector('.appdx-slip').getBoundingClientRect();
    return { x: b.x - 28, y: b.y - 28, width: b.width + 56, height: b.height + 56 };
  });
  await page.screenshot({ path: LOG + 'r10-02-slip-close.jpg', type: 'jpeg', quality: 88, clip: slipBox });

  /* B2: Tab walks, Enter on NO cancels cleanly */
  await page.keyboard.press('Tab');
  out.B.tab1 = await page.evaluate(() => (document.activeElement.dataset || {}).slip);
  await page.keyboard.press('Tab');
  out.B.tab2 = await page.evaluate(() => (document.activeElement.dataset || {}).slip);
  await page.keyboard.press('Shift+Tab');
  out.B.tab3 = await page.evaluate(() => (document.activeElement.dataset || {}).slip);
  ok(out.B.tab1 === 'no' && out.B.tab2 === 'yes' && out.B.tab3 === 'no', 'B2 Tab walks the two controls');
  await page.keyboard.press('Enter'); /* focused control is NO */
  await page.waitForTimeout(200);
  let c = await cleanState();
  out.B.enterOnNo = c;
  ok(!c.veil && !c.crossing && !c.lending && c.ds === null && c.here === '/', 'B2 Enter on NO cancels cleanly');
  ok(c.focusW === 'pixelcity', 'B2 focus returned to the specimen');

  /* B3: Escape cancels */
  await page.keyboard.press('Enter'); /* anchor focused: reopen */
  await page.waitForTimeout(250);
  ok((await slipState()).open, 'B3 reopen by Enter on the specimen');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(180);
  c = await cleanState();
  ok(!c.veil && !c.crossing && c.here === '/', 'B3 Escape cancels');

  /* B4: N cancels */
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  await page.keyboard.press('n');
  await page.waitForTimeout(180);
  c = await cleanState();
  ok(!c.veil && !c.crossing && c.here === '/', 'B4 N cancels');

  /* B5: the desk (scrim) cancels */
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  await page.mouse.click(24, 120);
  await page.waitForTimeout(180);
  c = await cleanState();
  ok(!c.veil && !c.crossing && c.here === '/', 'B5 scrim click cancels');

  /* B6: cabinet keys are shielded while the slip is up */
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  const hashBefore = await page.evaluate(() => location.hash);
  await page.keyboard.press('/');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
  out.B.shield = await page.evaluate(() => ({
    searchFocused: document.activeElement === document.getElementById('q'),
    hash: location.hash, veil: !!document.getElementById('appdxVeil')
  }));
  ok(!out.B.shield.searchFocused && out.B.shield.hash === hashBefore && out.B.shield.veil, 'B6 keys shielded');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);

  /* B7: YES by mouse: seal, dim, then the crossing */
  await clickSpecimen('pixelcity');
  ok((await slipState()).open, 'B7 slip reopens after all the cancels');
  const beatBox = await page.evaluate(() => {
    const b = document.querySelector('.appdx-sp[data-w="pixelcity"]').getBoundingClientRect();
    return { x: Math.max(0, b.x - 30), y: Math.max(0, b.y - 30), width: b.width + 60, height: b.height + 70 };
  });
  await page.click('[data-slip="yes"]');
  await page.waitForTimeout(230);
  out.B.beat = await page.evaluate(() => ({
    veil: !!document.getElementById('appdxVeil'),
    crossing: !!document.querySelector('.appdx-crossing'),
    sealOp: parseFloat(getComputedStyle(document.querySelector('.appdx-crossing .appdx-seal') || document.body).opacity || 0),
    dim: !!document.querySelector('.appdx-lending'),
    here: location.pathname
  }));
  ok(!out.B.beat.veil && out.B.beat.crossing && out.B.beat.sealOp > 0.3 && out.B.beat.dim && out.B.beat.here === '/', 'B7 seal plays only after YES');
  await page.screenshot({ path: LOG + 'r10-03-beat.jpg', type: 'jpeg', quality: 84, clip: beatBox });
  await page.waitForURL('**/pixelcity/**', { timeout: 5000 });
  out.B.crossed = page.url();

  /* B8: keyboard end to end on another specimen */
  await page.goto(BASE + '#~all', { waitUntil: 'domcontentloaded' });
  await ready(page);
  await settle(page, 700);
  await page.evaluate(() => {
    const el = document.querySelector('.appdx-sp[data-w="firstlight"]');
    el.scrollIntoView({ block: 'center' }); el.focus();
  });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  ok((await slipState()).open, 'B8 Enter on specimen raises the slip');
  await page.keyboard.press('Enter'); /* YES holds focus */
  await page.waitForURL('**/firstlight/**', { timeout: 5000 });
  out.B.kbCrossed = page.url();

  /* B9: Y confirms directly */
  await page.goto(BASE + '#~all', { waitUntil: 'domcontentloaded' });
  await ready(page);
  await settle(page, 700);
  await clickSpecimen('goldenshore');
  await page.keyboard.press('y');
  await page.waitForURL('**/goldenshore/**', { timeout: 5000 });
  out.B.yCrossed = page.url();
  await ctx.close();

  /* ================= C. reduced motion ================= */
  ctx = await newCtx({ reducedMotion: 'reduce' });
  page = await ctx.newPage();
  collectErrs(page, 'C-reduced');
  await page.goto(BASE + '#~all', { waitUntil: 'domcontentloaded' });
  await ready(page);
  await settle(page, 700);
  await clickSpecimen('secreta');
  out.C.slip = await slipState();
  ok(out.C.slip.open && out.C.slip.here === '/', 'C slip appears under reduced motion');
  out.C.anims = await page.evaluate(() => {
    const v = document.getElementById('appdxVeil');
    const sl = v.querySelector('.appdx-slip');
    return { veil: v.getAnimations ? v.getAnimations().length : -1, slip: sl.getAnimations ? sl.getAnimations().length : -1 };
  });
  ok(out.C.anims.veil === 0 && out.C.anims.slip === 0, 'C slip is unanimated');
  await page.screenshot({ path: LOG + 'r10-04-slip-reduced.jpg', type: 'jpeg', quality: 80 });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  c = await cleanState();
  ok(!c.veil && c.here === '/', 'C Escape cancels under reduced motion');
  await clickSpecimen('secreta');
  const rt0 = Date.now();
  await page.keyboard.press('y');
  await page.waitForURL('**/secreta/**', { timeout: 4000 });
  out.C.crossMs = Date.now() - rt0;
  ok(out.C.crossMs < 1500, 'C YES crosses without the beat (' + out.C.crossMs + 'ms)');
  /* kelp still still */
  await page.goto(BASE + '#~all', { waitUntil: 'domcontentloaded' });
  await ready(page);
  await settle(page, 500);
  out.C.kelpAnims = await page.evaluate(() => {
    document.getElementById('appdxSheet').scrollIntoView({ block: 'center' });
    const g = document.querySelector('.appdx-kelp-sway');
    if (!g) return 0;   /* the swaying specimen was retired: nothing left to sway */
    return g.getAnimations ? g.getAnimations().length : -1;
  });
  ok(out.C.kelpAnims === 0, 'C kelp does not sway');
  await ctx.close();

  /* ================= D. quick start first ================= */
  ctx = await newCtx();
  page = await ctx.newPage();
  collectErrs(page, 'D-quickstart');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await ready(page);
  await settle(page, 900);
  out.D.opening = await page.evaluate(() => {
    const tray = document.querySelector('#scroll .tray');
    const first = tray && tray.firstElementChild;
    const rb = first && first.querySelector('.appdx-ribbon');
    return {
      hash: location.hash,
      firstSlug: first ? first.dataset.slug : null,
      ribbon: !!rb, ribbonText: rb ? rb.textContent : '',
      ribbonUpper: rb ? getComputedStyle(rb.querySelector('b')).textTransform : '',
      ribbonFont: rb ? getComputedStyle(rb.querySelector('b')).fontFamily : '',
      ribbonCount: document.querySelectorAll('.appdx-ribbon').length,
      scrollY: window.scrollY
    };
  });
  ok(out.D.opening.hash === '#~all', 'D front door opens the collection');
  ok(out.D.opening.firstSlug === '/cms/quick-start', 'D quick start at the top of the tray');
  ok(out.D.opening.ribbon && /start here/i.test(out.D.opening.ribbonText), 'D START HERE ribbon worn');
  ok(out.D.opening.ribbonCount === 1, 'D exactly one ribbon');
  ok(/Courier Prime/.test(out.D.opening.ribbonFont), 'D ribbon lettered in the label hand');
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  await page.screenshot({ path: LOG + 'r10-05-opening.jpg', type: 'jpeg', quality: 82 });
  const cardBox = await page.evaluate(() => {
    const b = document.querySelector('.card.appdx-start').getBoundingClientRect();
    return { x: Math.max(0, b.x - 18), y: Math.max(0, b.y - 18), width: b.width + 36, height: b.height + 36 };
  });
  await page.screenshot({ path: LOG + 'r10-06-ribbon.jpg', type: 'jpeg', quality: 90, clip: cardBox });

  /* the invitation is followable: the card opens the guide */
  await page.click('.card.appdx-start');
  await page.waitForTimeout(400);
  out.D.followed = await page.evaluate(() => ({ hash: location.hash, verso: !!document.querySelector('#verso'), title: document.title }));
  ok(out.D.followed.hash === '#/cms/quick-start' && out.D.followed.verso, 'D the invitation leads to the guide');

  /* second front-door visit in the same session: as today */
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await ready(page);
  await settle(page, 500);
  out.D.second = await page.evaluate(() => ({ hash: location.hash, verso: !!document.querySelector('#verso'), ribbons: document.querySelectorAll('.appdx-ribbon').length, title: document.title }));
  ok(out.D.second.hash === '' && out.D.second.verso && out.D.second.ribbons === 0, 'D later visits open as today');
  await ctx.close();

  /* deep link on the first visit: never redirected */
  ctx = await newCtx();
  page = await ctx.newPage();
  collectErrs(page, 'D-deeplink');
  await page.goto(BASE + '#/cms/api/rest', { waitUntil: 'domcontentloaded' });
  await ready(page);
  await settle(page, 500);
  out.D.deeplink = await page.evaluate(() => ({ hash: location.hash, verso: !!document.querySelector('#verso'), ribbons: document.querySelectorAll('.appdx-ribbon').length }));
  ok(out.D.deeplink.hash === '#/cms/api/rest' && out.D.deeplink.verso && out.D.deeplink.ribbons === 0, 'D deep links untouched');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await ready(page);
  await settle(page, 400);
  out.D.afterDeeplink = await page.evaluate(() => ({ hash: location.hash, verso: !!document.querySelector('#verso'), ribbons: document.querySelectorAll('.appdx-ribbon').length }));
  ok(out.D.afterDeeplink.hash === '' && out.D.afterDeeplink.ribbons === 0, 'D deep link claimed the first visit');
  await ctx.close();

  /* reduced motion still gets the (static) invitation */
  ctx = await newCtx({ reducedMotion: 'reduce' });
  page = await ctx.newPage();
  collectErrs(page, 'D-reduced');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await ready(page);
  await settle(page, 500);
  out.D.reduced = await page.evaluate(() => ({
    hash: location.hash,
    ribbon: !!document.querySelector('.appdx-ribbon'),
    firstSlug: (document.querySelector('#scroll .tray').firstElementChild || {}).dataset ? document.querySelector('#scroll .tray').firstElementChild.dataset.slug : null
  }));
  ok(out.D.reduced.hash === '#~all' && out.D.reduced.ribbon && out.D.reduced.firstSlug === '/cms/quick-start', 'D reduced motion is invited too');
  await ctx.close();

  /* ================= E. host battery ================= */
  ctx = await newCtx();
  page = await ctx.newPage();
  collectErrs(page, 'E-battery');
  await page.goto(BASE + '#~s/cms/api/rest', { waitUntil: 'domcontentloaded' });
  await ready(page);
  await settle(page, 900);
  out.E.tools = await page.evaluate(() => ({
    flipBtn: !!document.querySelector('[data-flipbtn]'),
    exportBtn: !!document.querySelector('[data-export]'),
    hint: (document.querySelector('.tools-hint') || {}).textContent || ''
  }));
  ok(out.E.tools.flipBtn && out.E.tools.exportBtn, 'E tools row intact');

  /* old lens: plant then label */
  const rb2 = await page.evaluate(() => { const r = document.querySelector('#recto').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await page.mouse.move(rb2.x + rb2.w * 0.5, rb2.y + rb2.h * 0.35);
  await page.mouse.move(rb2.x + rb2.w * 0.52, rb2.y + rb2.h * 0.37);
  await page.waitForTimeout(350);
  const oldLensPlant = await page.evaluate(() => { const l = document.querySelector('#lens'); return !l.hidden && l.innerHTML.length > 1000; });
  await page.mouse.move(rb2.x + rb2.w * 0.72, rb2.y + rb2.h * 0.82);
  await page.waitForTimeout(300);
  const oldLensLabel = await page.evaluate(() => { const l = document.querySelector('#lens'); return !l.hidden; });
  out.E.oldLens = { plant: oldLensPlant, label: oldLensLabel };
  ok(oldLensPlant && oldLensLabel, 'E lens reads the old plate and its label');
  await page.mouse.move(2, 2);

  /* export */
  const dl = page.waitForEvent('download', { timeout: 20000 });
  await page.click('[data-export]');
  const download = await dl;
  const exPath = QA + 'r10-export.png';
  await download.saveAs(exPath);
  const buf = fs.readFileSync(exPath);
  out.E.export = {
    name: download.suggestedFilename(), bytes: buf.length,
    pngSig: buf.slice(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    w: buf.readUInt32BE(16), h: buf.readUInt32BE(20)
  };
  ok(out.E.export.pngSig && out.E.export.w >= 1900 && out.E.export.bytes > 200000, 'E export still a big true PNG');

  /* flip */
  await page.click('[data-flipbtn]');
  await page.waitForTimeout(500);
  out.E.flip = await page.evaluate(() => ({ h: location.hash, verso: !!document.querySelector('#verso') }));
  ok(out.E.flip.verso && out.E.flip.h === '#/cms/api/rest', 'E flip turns the sheet');

  /* history */
  await page.evaluate(() => { location.hash = '#~all'; });
  await page.waitForTimeout(400);
  await page.goBack(); await page.waitForTimeout(300);
  const backH = await page.evaluate(() => location.hash);
  await page.goForward(); await page.waitForTimeout(300);
  const fwdH = await page.evaluate(() => location.hash);
  out.E.history = { backH, fwdH };
  ok(backH === '#/cms/api/rest' && fwdH === '#~all', 'E history walks');

  /* placement: appendix only on the whole collection, always last */
  out.E.views = [];
  for (const h of ['#~all', '#~bloom', '#~winter', '#~night', '#~eldest', '#~tended',
    '#~q/rest', '#~d/' + encodeURIComponent('cms|Features'), '#/cms/intro', '#~s/cms/intro', '#~appendix']) {
    await page.evaluate(x => { location.hash = x; }, h);
    await page.waitForTimeout(330);
    const v = await page.evaluate(hh => {
      const sc = document.getElementById('scroll');
      return {
        h: hh, ow: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
        appdx: document.querySelectorAll('#appdx').length,
        last: sc && sc.lastElementChild ? /^appdx2?$/.test(sc.lastElementChild.id) : false
      };
    }, h);
    out.E.views.push(v);
    const wantAppdx = (h === '#~all' || h === '#~appendix') ? 1 : 0;
    ok(v.appdx === wantAppdx && (wantAppdx === 0 || v.last), 'E placement ' + h);
    ok(v.ow <= v.cw, 'E no overflow ' + h);
  }

  /* specimens: hrefs and hover hints */
  await page.evaluate(() => { location.hash = '#~all'; });
  await settle(page, 700);
  /* this section navigated since the last opening, and a re-render files the
     plate back into a sealed envelope, so open it again before measuring */
  await openAppendix(page);
  const plate = await page.evaluate(() => {
    return [...document.querySelectorAll('.appdx-sp')].map(x => ({ w: x.dataset.w, href: x.getAttribute('href') }));
  });
  out.E.plate = plate;
  const wantHrefs = { pixelcity: '../pixelcity/', cartastrapiana: '../cartastrapiana/', goldenshore: '../goldenshore/', longway: '../longway/', firstlight: '../firstlight/', secreta: '../secreta/' };
  ok(plate.length === 6 && plate.every(p => wantHrefs[p.w] === p.href), 'E six loans, right doors');
  out.E.hints = [];
  for (const k of Object.keys(wantHrefs)) {
    const fig = await page.evaluate(kk => {
      const el = document.querySelector('.appdx-sp[data-w="' + kk + '"]');
      el.scrollIntoView({ block: 'center' });
      const f = el.querySelector('.appdx-fig').getBoundingClientRect();
      return { x: f.x + f.width / 2, y: f.y + f.height / 2 };
    }, k);
    await page.waitForTimeout(150);
    await page.mouse.move(fig.x - 20, fig.y - 20);
    await page.mouse.move(fig.x, fig.y);
    await page.waitForTimeout(320);
    const op = await page.evaluate(kk => getComputedStyle(document.querySelector('.appdx-sp[data-w="' + kk + '"] .appdx-hint')).opacity, k);
    out.E.hints.push({ k, op });
    ok(parseFloat(op) > 0.9, 'E hint raises for ' + k);
  }
  await page.mouse.move(2, 2);

  /* lens over the new plate: rosettes, specimen label, main label */
  const ht = await page.evaluate(() => {
    document.getElementById('appdxSheet').scrollIntoView({ block: 'center' });
    const f = document.querySelector('.appdx-sp[data-w="secreta"] .appdx-fig').getBoundingClientRect();
    return { x: f.x + f.width / 2, y: f.y + f.height * 0.45 };
  });
  await page.mouse.move(ht.x - 20, ht.y - 20);
  await page.mouse.move(ht.x, ht.y);
  await page.waitForTimeout(400);
  out.E.lensFig = await page.evaluate(() => {
    const l = document.querySelector('#lens');
    return { shown: !l.hidden, clonesPlate: l.innerHTML.indexOf('appdx-sheet') !== -1, rosettes: l.innerHTML.indexOf('apxHt') !== -1 };
  });
  ok(out.E.lensFig.shown && out.E.lensFig.rosettes, 'E lens resolves the rosettes');
  const sl2 = await page.evaluate(() => {
    const b = document.querySelector('.appdx-sp[data-w="firstlight"] .appdx-lbl').getBoundingClientRect();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  });
  await page.mouse.move(sl2.x - 15, sl2.y - 15);
  await page.mouse.move(sl2.x, sl2.y);
  await page.waitForTimeout(320);
  out.E.lensSpecLabel = await page.evaluate(() => {
    const l = document.querySelector('#lens');
    return { shown: !l.hidden, hasBinomial: l.innerHTML.indexOf('Antennaria sideralis') !== -1 };
  });
  ok(out.E.lensSpecLabel.shown && out.E.lensSpecLabel.hasBinomial, 'E lens reads a loan label');
  const lb2 = await page.evaluate(() => {
    const b = document.querySelector('.appdx-mainlabel').getBoundingClientRect();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  });
  await page.mouse.move(lb2.x, lb2.y);
  await page.waitForTimeout(320);
  out.E.lensMainLabel = await page.evaluate(() => {
    const l = document.querySelector('#lens');
    return { shown: !l.hidden, hasText: l.innerHTML.indexOf('Exchange collections') !== -1 };
  });
  ok(out.E.lensMainLabel.shown && out.E.lensMainLabel.hasText, 'E lens reads the main label');
  await page.mouse.move(2, 2);

  /* kelp gating */
  await page.evaluate(() => document.getElementById('appdxSheet').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  const liveOn = await page.evaluate(() => document.getElementById('appdxSheet').classList.contains('appdx-live'));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(450);
  const liveOff = await page.evaluate(() => !document.getElementById('appdxSheet').classList.contains('appdx-live'));
  out.E.kelp = { liveOn, liveOff };
  ok(liveOn && liveOff, 'E kelp wakes and sleeps with the plate');

  /* versos still read: exactly the shipped round-8 measurements */
  out.E.verso = [];
  const VERSO_SHIPPED = {
    '/cms/api/rest': { chars: 12284, prov: true },
    '/cms/api/document-service': { chars: 19222, prov: true },
    '/cms/intro': { chars: 3933, prov: true },
    '/cms/features/users-permissions': { chars: 19886, prov: true },
    '/cms/migration/v4-to-v5/breaking-changes': { chars: 4765, prov: true },
    '/cloud/getting-started/intro': { chars: 0, prov: false } /* empty on the shipped build too */
  };
  for (const slug of Object.keys(VERSO_SHIPPED)) {
    await page.evaluate(s => { location.hash = '#' + s; }, slug);
    await page.waitForTimeout(300);
    const v = await page.evaluate(() => {
      const n = document.querySelector('#verso .notes');
      return { chars: n ? n.innerText.trim().length : 0, prov: !!document.querySelector('.prov-story') };
    });
    out.E.verso.push(Object.assign({ slug }, v));
    ok(v.chars === VERSO_SHIPPED[slug].chars && v.prov === VERSO_SHIPPED[slug].prov, 'E verso as shipped ' + slug);
  }

  /* narrow */
  await page.setViewportSize({ width: 380, height: 800 });
  await page.evaluate(() => { location.hash = '#~all'; });
  await settle(page, 900);
  out.E.narrowWave = await page.evaluate(() => ({ ow: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  ok(out.E.narrowWave.ow <= out.E.narrowWave.cw + 1, 'E narrow within shipped tolerance');
  ok(out.A.narrowBase.ow <= out.A.narrowBase.cw + 1, 'E narrow base within shipped tolerance');

  /* ================= F. the kit is archived ================= */
  ctx = await newCtx(null, true);
  page = await ctx.newPage();
  collectErrs(page, 'F-archived');
  await page.goto(BASE + '#~all', { waitUntil: 'domcontentloaded' });
  await ready(page);
  await settle(page, 900);
  out.F.reach = await page.evaluate(() => ({
    inDOM: document.documentElement.outerHTML.indexOf('secretb') !== -1,
    hrefs: document.querySelectorAll('[href*="secretb"]').length,
    dataW: document.querySelectorAll('[data-w="secretb"]').length,
    specimens: document.querySelectorAll('.appdx-sp').length,
    seals: document.querySelectorAll('.appdx-seal').length
  }));
  ok(!out.F.reach.inDOM && out.F.reach.hrefs === 0 && out.F.reach.dataW === 0, 'F zero secretb references in the live DOM');
  ok(out.F.reach.specimens === 6 && out.F.reach.seals === 6, 'F six specimens, six seals');
  out.F.sources = await page.evaluate(async () => {
    const files = ['appendix.js', 'index.html', 's7.js', 's7.css'];
    const r = {};
    for (const f of files) r[f] = (await (await fetch(f)).text()).indexOf('secretb') !== -1;
    return r;
  });
  ok(Object.values(out.F.sources).every(v => v === false), 'F zero secretb references in the served sources');
  out.F.lay = await page.evaluate(() => {
    const sheet = document.getElementById('appdxSheet').getBoundingClientRect();
    const grid = getComputedStyle(document.querySelector('.appdx-grid'));
    const label = document.querySelector('.appdx-mainlabel').getBoundingClientRect();
    const cards = [...document.querySelectorAll('.appdx-grid .appdx-sp')].map(x => x.getBoundingClientRect());
    const inside = cards.every(c => c.left >= sheet.left - 1 && c.right <= sheet.right + 1 && c.top >= sheet.top - 1 && c.bottom <= sheet.bottom + 1);
    const clearOfLabel = cards.every(c => c.bottom <= label.top + 1 || c.right <= label.left + 1 || c.left >= label.right - 1);
    const sheetCx = sheet.left + sheet.width / 2, labelCx = label.left + label.width / 2;
    return {
      rows: grid.gridTemplateRows.split(' ').length,
      cols: grid.gridTemplateColumns.split(' ').length,
      gridCards: cards.length,
      inside, clearOfLabel,
      labelCentred: Math.abs(sheetCx - labelCx),
      labelInSheet: label.bottom <= sheet.bottom + 1 && label.top >= sheet.top,
      words: {
        six: document.querySelector('.appdx-head p').textContent.indexOf('six loans') !== -1,
        fieldno: document.querySelector('#appdxSheet .fieldno').textContent.indexOf('EXCH\u2011006') !== -1,
        coll: document.querySelector('.appdx-mainlabel dd').textContent.indexOf('six sister collections') !== -1
      }
    };
  });
  ok(out.F.lay.rows === 2 && out.F.lay.gridCards === 6,
    'F sheet laid 3+3 (' + out.F.lay.rows + ' rows, ' + out.F.lay.gridCards + ' loans in the grid)');
  ok(out.F.lay.inside && out.F.lay.clearOfLabel && out.F.lay.labelInSheet, 'F six specimens compose inside the sheet, clear of the label');
  ok(out.F.lay.labelCentred < 2, 'F label centred at the foot (off by ' + out.F.lay.labelCentred + 'px)');
  ok(out.F.lay.words.six && out.F.lay.words.fieldno && out.F.lay.words.coll, 'F the sheet speaks of six loans everywhere');
  const plateBox = await page.evaluate(() => {
    document.getElementById('appdxSheet').scrollIntoView({ block: 'center' });
    return null;
  });
  await page.waitForTimeout(500);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(250);
  const pb = await page.evaluate(() => {
    const b = document.getElementById('appdx').getBoundingClientRect();
    const y = Math.max(0, b.y - 8);
    return { x: Math.max(0, b.x), y, width: Math.min(b.width, innerWidth), height: Math.min(b.height + 16, innerHeight - y) };
  });
  await page.screenshot({ path: LOG + 'r10-07-plate-six.jpg', type: 'jpeg', quality: 86, clip: pb });
  await ctx.close();

  await browser.close();

  if (out.errors['A-base']) {
    out.errors['A-base'] = out.errors['A-base'].filter(x => x !== 'console: Failed to load resource: net::ERR_FAILED');
  }
  const errTotal = Object.entries(out.errors).map(([k, v]) => k + ':' + v.length).join(' ');
  const anyErr = Object.values(out.errors).some(v => v.length);
  ok(!anyErr, 'ZERO console/page errors (' + errTotal + ')');
  out.FAILURES = FAIL;
  out.verdict = FAIL.length === 0 ? 'ALL PASS' : FAIL.length + ' FAILURES';
  fs.writeFileSync(LOG + 'probe-r10.json', JSON.stringify(out, null, 1));
  console.log(out.verdict);
  if (FAIL.length) { console.log(FAIL.join('\n')); process.exit(1); }
})().catch(e => {
  out.FAILURES = FAIL.concat(['CRASH: ' + e.message]);
  fs.writeFileSync(LOG + 'probe-r10.json', JSON.stringify(out, null, 1));
  console.error('PROBE FAILED', e); process.exit(1);
});
