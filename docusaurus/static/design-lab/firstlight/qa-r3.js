/* QA round 3 — the verifier's findings.
   1. every event voice's audible envelope (>-48 dBFS) ends well under 0.7 s
      (bed and hall pad exempt); hall pad is genuinely quiet
   2. no noise timbre and no sweep timbre on frequent events (transit, lock
      are short plucks/taps now — checked by duration and by zcr signature)
   3. mission log: 30+ entries keep full row height, >= 11 px font, no
      overlap, scrollable history, older lines dim, autoscroll to newest
   4. reader head fully below the topbar and clickable; Escape closes reader
   5. hall opens below the topbar; the pressed HANDS button un-presses by mouse
   6. p95 frame time <= 16.5 ms during a pan/zoom/warp burst */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise(res => srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); }));
  const base = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  const out = { fail: [] };

  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__diag && window.__diag.state !== 'boot');
  await page.waitForTimeout(300);

  // ---- 1+2. offline render: audible duration of every event voice
  const names = ['lock', 'ping', 'pingNight', 'transit', 'thud', 'contact',
                 'triang', 'chart', 'warp', 'almanac', 'plate'];
  out.sounds = [];
  for (const n of names) {
    const sig = await page.evaluate(name => window.__probeSound(name), n);
    out.sounds.push({ name: sig.name, audDur: +(+sig.audDur).toFixed(3), rms: +(+sig.rms).toFixed(4), peak: +(+sig.peak).toFixed(3), zcrHz: Math.round(sig.zcrHz) });
    if (sig.error) { out.fail.push(n + ': ' + sig.error); continue; }
    if (!(sig.rms > 1e-4)) out.fail.push(n + ' is silent');
    if (sig.audDur >= 0.7) out.fail.push(n + ' audible ' + sig.audDur.toFixed(2) + 's >= 0.7s');
  }
  // frequent voices must be extra short
  for (const n of ['lock', 'transit', 'ping', 'pingNight', 'thud', 'triang']) {
    const s = out.sounds.find(x => x.name === n);
    if (s && s.audDur > 0.55) out.fail.push('frequent voice ' + n + ' audible ' + s.audDur + 's > 0.55s');
  }
  const hall = await page.evaluate(() => window.__probeSound('hall'));
  out.hallPad = { rms: +hall.rms.toFixed(4), peak: +hall.peak.toFixed(3) };
  if (hall.rms > 0.03 || hall.peak > 0.1) out.fail.push('hall pad not quiet: rms=' + hall.rms.toFixed(3) + ' peak=' + hall.peak.toFixed(3));
  const bed = await page.evaluate(() => window.__probeSound('bed'));
  out.bed = { rms: +bed.rms.toFixed(4), peak: +bed.peak.toFixed(3) };
  if (!(bed.rms > 1e-4)) out.fail.push('bed silent');

  // pairwise distinctness of the event voices
  const close = [];
  for (let i = 0; i < out.sounds.length; i++) for (let j = i + 1; j < out.sounds.length; j++) {
    const a = out.sounds[i], b = out.sounds[j];
    const dz = Math.abs(Math.log10((a.zcrHz + 1) / (b.zcrHz + 1)));
    const dd = Math.abs(a.audDur - b.audDur);
    const dr = Math.abs(Math.log10((a.rms + 1e-6) / (b.rms + 1e-6)));
    if (dz < 0.05 && dd < 0.06 && dr < 0.2) close.push(a.name + '~' + b.name);
  }
  out.tooClose = close;
  if (close.length) out.fail.push('sound pairs not distinct: ' + close.join(', '));

  // ---- 3. mission log under load: survey pages to generate real entries
  await page.keyboard.press('x'); // unlock gesture
  const slugs = ['/cms/intro', '/cms/api/rest', '/cms/backend-customization', '/cms/features/media-library',
                 '/cms/plugins-development/developing-plugins', '/cloud/getting-started/intro', '/cloud/projects/settings', '/cms/cli'];
  for (const s of slugs) {
    await page.evaluate(sl => { location.hash = '#' + sl; }, s);
    await page.waitForTimeout(350);
  }
  const log = await page.evaluate(() => {
    const el = document.getElementById('log');
    const cs = getComputedStyle(el);
    const rows = Array.from(el.querySelectorAll('.ll'));
    const boxes = rows.map(r => r.getBoundingClientRect());
    let minH = 1e9, overlaps = 0;
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].height < minH) minH = boxes[i].height;
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (a.bottom - 1 > b.top && b.bottom - 1 > a.top) overlaps++;
      }
    }
    const lh = parseFloat(cs.lineHeight);
    el.scrollTop = 0; const scrolledUp = el.scrollTop; // 0 expected
    const canScroll = el.scrollHeight > el.clientHeight + 4;
    el.scrollTop = el.scrollHeight;
    return {
      rows: rows.length,
      fontPx: parseFloat(cs.fontSize),
      overflowY: cs.overflowY,
      lineHeightPx: lh,
      minRowH: +minH.toFixed(1),
      overlaps,
      canScroll,
      scrolledUp,
      dimmedOld: el.querySelectorAll('.ll.old').length,
      atBottom: Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 4
    };
  });
  out.log = log;
  if (log.rows < 15) out.fail.push('log did not accumulate rows (' + log.rows + ')');
  if (log.fontPx < 11) out.fail.push('log font ' + log.fontPx + 'px < 11px');
  if (log.overflowY !== 'auto') out.fail.push('log overflow-y=' + log.overflowY);
  if (log.minRowH < log.lineHeightPx - 1) out.fail.push('log rows squeezed: min ' + log.minRowH + 'px vs line ' + log.lineHeightPx + 'px');
  if (log.overlaps > 0) out.fail.push(log.overlaps + ' overlapping log rows');
  if (!log.canScroll) out.fail.push('log history not scrollable');
  if (!log.dimmedOld) out.fail.push('older log lines not dimmed');

  // autoscroll check: newest entry visible after one more survey
  await page.evaluate(() => { location.hash = '#/cms/admin-panel-customization'; });
  await page.waitForTimeout(400);
  out.logFollows = await page.evaluate(() => {
    const el = document.getElementById('log');
    return Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 6;
  });
  if (!out.logFollows) out.fail.push('log does not follow the newest line');

  // ---- 4. reader head below the topbar, close clickable, Escape closes
  const rd = await page.evaluate(() => {
    const bar = document.getElementById('topbar').getBoundingClientRect();
    const btn = document.getElementById('rd-close').getBoundingClientRect();
    return { barBottom: bar.bottom, btnTop: btn.top, btnBottom: btn.bottom, x: btn.left + btn.width / 2, y: btn.top + btn.height / 2 };
  });
  out.reader = rd;
  if (rd.btnTop < rd.barBottom) out.fail.push('rd-close still under the topbar (top ' + rd.btnTop + ' < bar ' + rd.barBottom + ')');
  await page.mouse.click(rd.x, rd.y);
  await page.waitForTimeout(350);
  out.readerClosedByClick = await page.evaluate(() => document.getElementById('reader').hidden);
  if (!out.readerClosedByClick) out.fail.push('clicking rd-close did not close the reader');
  await page.evaluate(() => { location.hash = '#/cms/api/graphql'; });
  await page.waitForTimeout(400);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(350);
  out.readerClosedByEsc = await page.evaluate(() => document.getElementById('reader').hidden && location.hash.replace(/^#/, '') === '/');
  if (!out.readerClosedByEsc) out.fail.push('Escape did not close the reader');

  // ---- 5. hall below the bar; HANDS button un-presses it by mouse
  await page.keyboard.press('h');
  await page.waitForTimeout(300);
  const hh = await page.evaluate(() => {
    const bar = document.getElementById('topbar').getBoundingClientRect();
    const wall = document.getElementById('hands').getBoundingClientRect();
    return { open: !document.getElementById('hands').hidden, wallTop: wall.top, barBottom: bar.bottom };
  });
  out.hall = hh;
  if (!hh.open) out.fail.push('H did not open the hall');
  if (hh.wallTop < hh.barBottom - 1) out.fail.push('hall overlay covers the topbar');
  await page.click('#handsbtn');
  await page.waitForTimeout(250);
  out.hallToggledOff = await page.evaluate(() => document.getElementById('hands').hidden);
  if (!out.hallToggledOff) out.fail.push('HANDS button did not un-press the open hall');

  // ---- 6. p95 during a pan/zoom/warp burst
  await page.evaluate(() => { window.__samples = []; });
  const sampler = setInterval(() => {
    page.evaluate(() => { window.__samples.push(window.__diag.frameMs); }).catch(() => {});
  }, 40);
  await page.mouse.move(700, 500);
  await page.mouse.down();
  for (let i = 0; i < 24; i++) { await page.mouse.move(700 + Math.sin(i / 3) * 260, 500 + Math.cos(i / 4) * 170); await page.waitForTimeout(28); }
  await page.mouse.up();
  for (let i = 0; i < 10; i++) { await page.mouse.wheel(0, i % 2 ? -240 : 240); await page.waitForTimeout(60); }
  await page.evaluate(() => { location.hash = '#/cms/features/internationalization'; });
  await page.waitForTimeout(900);
  await page.evaluate(() => { location.hash = '#/'; });
  await page.waitForTimeout(600);
  clearInterval(sampler);
  const samples = (await page.evaluate(() => window.__samples)).filter(v => typeof v === 'number').sort((a, b) => a - b);
  out.p95 = samples.length ? +samples[Math.floor(samples.length * 0.95)].toFixed(2) : null;
  if (out.p95 == null || out.p95 > 16.5) out.fail.push('p95 ' + out.p95 + 'ms');

  out.errors = errors;
  if (errors.length) out.fail.push(errors.length + ' page errors: ' + errors.slice(0, 3).join(' | '));
  out.verdict = out.fail.length ? 'FAIL' : 'PASS';
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
  srv.kill();
  process.exit(out.fail.length ? 1 : 0);
})().catch(e => { console.error('QA FAILED', e); process.exit(1); });
