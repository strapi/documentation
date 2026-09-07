/* Round 8 probe: regression sweep + appendix plate checks + iterlog shots. */
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8991/';
const LOG = __dirname + '/iterlog/';

(async () => {
  const out = { errors: [] };
  const browser = await chromium.launch();

  /* ---------------- A. regression sweep (appendix present) ---------------- */
  let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => { try { localStorage.setItem('herb.seenkey', '1'); } catch (e) {} });
  let page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });

  const t0 = Date.now();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__HERB_READY__ === true, { timeout: 25000 });
  out.firstContentMs = Date.now() - t0;
  out.bootMs = await page.evaluate(() => window.__HERB_BOOT_MS__);

  /* versos still read; appendix never appears outside the whole collection */
  const sample = ['/cms/api/rest', '/cms/api/document-service', '/cms/intro',
    '/cms/features/users-permissions', '/cms/migration/v4-to-v5/breaking-changes',
    '/cloud/getting-started/intro'];
  out.verso = [];
  for (const slug of sample) {
    await page.evaluate(s => { location.hash = '#' + s; }, slug);
    await page.waitForTimeout(300);
    out.verso.push(await page.evaluate(() => {
      const v = document.querySelector('#verso .notes');
      return {
        h: location.hash, chars: v ? v.innerText.trim().length : 0,
        prov: !!document.querySelector('.prov-story'),
        appdx: !!document.querySelector('#appdx'),
        ow: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth
      };
    }));
  }

  /* recto: lens, tools row, flip — untouched */
  await page.evaluate(() => { location.hash = '#~s/cms/api/rest'; });
  await page.waitForTimeout(900);
  const rb = await page.evaluate(() => { const r = document.querySelector('#recto').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await page.mouse.move(rb.x + rb.w * 0.45, rb.y + rb.h * 0.3);
  await page.mouse.move(rb.x + rb.w * 0.47, rb.y + rb.h * 0.32);
  await page.waitForTimeout(350);
  out.rectoLens = await page.evaluate(() => {
    const l = document.querySelector('#lens');
    return {
      lensShown: !l.hidden, inner: l.innerHTML.length,
      exportBtn: !!document.querySelector('[data-export]'),
      flipBtn: !!document.querySelector('[data-flipbtn]'),
      hint: (document.querySelector('.tools-hint') || {}).textContent || '',
      appdx: !!document.querySelector('#appdx')
    };
  });
  await page.mouse.move(10, 10);
  await page.click('[data-flipbtn]');
  await page.waitForTimeout(350);
  out.flip = await page.evaluate(() => ({ h: location.hash, verso: !!document.querySelector('#verso') }));

  /* specials + drawers: overflow, and appendix only on the whole collection */
  out.views = [];
  for (const h of ['#~all', '#~bloom', '#~winter', '#~night', '#~eldest', '#~tended',
    '#~q/rest', '#~d/' + encodeURIComponent('cms|Features'), '#/nope/nope', '#~appendix']) {
    await page.evaluate(x => { location.hash = x; }, h);
    await page.waitForTimeout(320);
    out.views.push(await page.evaluate(hh => {
      const sc = document.getElementById('scroll');
      return {
        h: hh, ow: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
        appdx: document.querySelectorAll('#appdx').length,
        appdxLast: sc && sc.lastElementChild ? sc.lastElementChild.id === 'appdx' : false
      };
    }, h));
  }

  /* history still walks */
  await page.evaluate(() => { location.hash = '#/cms/api/rest'; });
  await page.waitForTimeout(300);
  await page.goBack(); await page.waitForTimeout(300);
  out.back = await page.evaluate(() => location.hash);
  await page.goForward(); await page.waitForTimeout(300);
  out.fwd = await page.evaluate(() => location.hash);

  /* ---------------- B. the appendix plate itself ---------------- */
  await page.evaluate(() => { location.hash = '#~all'; });
  await page.waitForTimeout(500);
  out.plate = await page.evaluate(() => {
    const a = [...document.querySelectorAll('.appdx-sp')].map(x => ({
      w: x.dataset.w, href: x.getAttribute('href'),
      hint: (x.querySelector('.appdx-hint') || {}).textContent || '',
      name: (x.querySelector('.appdx-lbl em') || {}).textContent || ''
    }));
    return {
      count: a.length, list: a,
      head: (document.querySelector('.appdx-head h2') || {}).textContent || '',
      label: !!document.querySelector('.appdx-mainlabel'),
      stamp: !!document.querySelector('#appdxSheet .stamp svg')
    };
  });

  /* discovery shot: the bottom of the collection with the plate arriving */
  await page.evaluate(() => { document.getElementById('appdx').scrollIntoView({ block: 'start' }); window.scrollBy(0, -320); });
  await page.waitForTimeout(600);
  await page.screenshot({ path: LOG + 'r8-01-discovery.jpg', type: 'jpeg', quality: 78 });

  /* kelp lives when the plate is on the table */
  await page.evaluate(() => { document.getElementById('appdxSheet').scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(400);
  out.kelpLive = await page.evaluate(() => document.getElementById('appdxSheet').classList.contains('appdx-live'));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  out.kelpAsleep = await page.evaluate(() => !document.getElementById('appdxSheet').classList.contains('appdx-live'));

  /* full plate portrait — pointer parked off the sheet so no lens intrudes */
  const sheetEl = await page.$('#appdxSheet');
  await page.evaluate(() => { document.getElementById('appdxSheet').scrollIntoView({ block: 'center' }); });
  await page.mouse.move(4, 4);
  await page.waitForTimeout(700);
  await sheetEl.screenshot({ path: LOG + 'r8-02-plate.jpg', type: 'jpeg', quality: 82 });

  /* hint line for each of the seven, raised by keyboard focus (no lens) */
  const keys = ['pixelcity', 'cartastrapiana', 'bythedeep', 'longway', 'firstlight', 'secreta', 'secretb'];
  out.hints = [];
  for (let i = 0; i < keys.length; i++) {
    await page.evaluate(k => {
      const el = document.querySelector('.appdx-sp[data-w="' + k + '"]');
      el.scrollIntoView({ block: 'center' });
    }, keys[i]);
    await page.waitForTimeout(250);
    /* focus the element before it, then Tab in: keyboard focus => :focus-visible */
    if (i === 0) {
      await page.evaluate(() => {
        const cards = document.querySelectorAll('.tray .card');
        cards[cards.length - 1].focus();
      });
      let guard = 0;
      while (guard++ < 40) {
        await page.keyboard.press('Tab');
        const w = await page.evaluate(() => (document.activeElement.dataset || {}).w || '');
        if (w === 'pixelcity') break;
      }
    } else {
      await page.evaluate(k => document.querySelector('.appdx-sp[data-w="' + k + '"]').focus(), keys[i - 1]);
      await page.keyboard.press('Tab');
    }
    await page.waitForTimeout(350);
    const r = await page.evaluate(k => {
      const el = document.querySelector('.appdx-sp[data-w="' + k + '"]');
      const hint = el.querySelector('.appdx-hint');
      const b = el.getBoundingClientRect();
      return {
        focused: document.activeElement === el,
        hintOpacity: getComputedStyle(hint).opacity,
        box: { x: Math.max(0, b.x - 20), y: Math.max(0, b.y - 12), width: Math.min(1440, b.width + 40), height: b.height + 46 }
      };
    }, keys[i]);
    out.hints.push({ k: keys[i], focused: r.focused, opacity: r.hintOpacity });
    await page.screenshot({ path: LOG + 'r8-0' + (3 + i) + '-hint-' + keys[i] + '.jpg', type: 'jpeg', quality: 80, clip: r.box });
  }

  /* the glass over the new plate: halftone rosettes, then the labels */
  await page.evaluate(() => document.activeElement.blur());
  await page.evaluate(() => { document.getElementById('appdxSheet').scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(400);
  const ht = await page.evaluate(() => {
    const f = document.querySelector('.appdx-sp[data-w="secreta"] .appdx-fig').getBoundingClientRect();
    return { x: f.x + f.width / 2, y: f.y + f.height * 0.42 };
  });
  await page.mouse.move(ht.x - 30, ht.y - 30);
  await page.mouse.move(ht.x, ht.y);
  await page.waitForTimeout(450);
  out.lensOnPlate = await page.evaluate(() => {
    const l = document.querySelector('#lens');
    return { shown: !l.hidden, hasClone: l.innerHTML.indexOf('appdx-sheet') !== -1 };
  });
  await page.screenshot({ path: LOG + 'r8-10-lens-halftone.jpg', type: 'jpeg', quality: 82 });

  const lb = await page.evaluate(() => {
    const b = document.querySelector('.appdx-mainlabel').getBoundingClientRect();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  });
  await page.mouse.move(lb.x, lb.y);
  await page.waitForTimeout(400);
  out.lensOnLabel = await page.evaluate(() => {
    const l = document.querySelector('#lens');
    return { shown: !l.hidden, hasLabel: l.innerHTML.indexOf('Exchange collections') !== -1 };
  });
  await page.screenshot({ path: LOG + 'r8-11-lens-label.jpg', type: 'jpeg', quality: 82 });
  await page.mouse.move(8, 8);

  /* ---------------- C. one full crossing, with its beat ---------------- */
  await page.evaluate(() => {
    const el = document.querySelector('.appdx-sp[data-w="pixelcity"]');
    el.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(300);
  /* keyboard activation: the beat plays with no lens in the way */
  await page.evaluate(() => document.querySelector('.appdx-sp[data-w="pixelcity"]').focus());
  const beatBox = await page.evaluate(() => {
    const b = document.querySelector('.appdx-sp[data-w="pixelcity"]').getBoundingClientRect();
    return { x: Math.max(0, b.x - 30), y: Math.max(0, b.y - 30), width: b.width + 60, height: b.height + 70 };
  });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(220);
  out.beat = await page.evaluate(() => ({
    crossing: !!document.querySelector('.appdx-crossing'),
    sealOpacity: getComputedStyle(document.querySelector('.appdx-crossing .appdx-seal')).opacity,
    stillHere: location.pathname === '/'
  }));
  await page.screenshot({ path: LOG + 'r8-12-beat.jpg', type: 'jpeg', quality: 84, clip: beatBox });
  await page.waitForURL('**/pixelcity/**', { timeout: 4000 });
  await page.waitForTimeout(250);
  out.crossed = page.url();
  await page.screenshot({ path: LOG + 'r8-13-crossed.jpg', type: 'jpeg', quality: 78 });
  out.errors = errs;
  await ctx.close();

  /* ---------------- D. reduced motion crosses instantly ---------------- */
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  page = await ctx.newPage();
  const errs2 = [];
  page.on('pageerror', e => errs2.push(e.message));
  await page.goto(BASE + '#~all', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__HERB_READY__ === true, { timeout: 25000 });
  await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('.appdx-sp[data-w="bythedeep"]').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(300);
  const tClick = Date.now();
  await page.evaluate(() => document.querySelector('.appdx-sp[data-w="bythedeep"]').click());
  await page.waitForURL('**/bythedeep/**', { timeout: 3000 });
  out.reducedCrossMs = Date.now() - tClick;
  out.reducedErrs = errs2;
  await ctx.close();

  /* ---------------- E. cost: ~all render with and without the appendix ---------------- */
  async function trayTime(block) {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    if (block) await c.route('**/appendix.js', r => r.abort());
    const p = await c.newPage();
    await p.goto(BASE, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__HERB_READY__ === true, { timeout: 25000 });
    const times = [];
    for (let i = 0; i < 7; i++) {
      await p.evaluate(v => { location.hash = v ? '#~bloom' : '#/cms/intro'; }, i % 2);
      await p.waitForTimeout(120);
      const t = await p.evaluate(() => new Promise(res => {
        const a = performance.now();
        location.hash = '#~all';
        requestAnimationFrame(() => requestAnimationFrame(() => res(performance.now() - a)));
      }));
      times.push(Math.round(t));
      await p.waitForTimeout(120);
    }
    await c.close();
    return times.sort((x, y) => x - y);
  }
  out.trayMsWithAppendix = await trayTime(false);
  out.trayMsWithout = await trayTime(true);

  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch(e => { console.error('PROBE FAILED', e); process.exit(1); });
