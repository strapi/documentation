/* QA round 2 — the self-explaining interface + the Hall of Hands.
   annotate overlay (?), 3-step guide, hover explainers, hall wall (77 hands,
   oldest lowest, footer line), the /cloud/projects/settings invitation,
   crew-register door, announce-once dedup, Escape closes everything. */
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
  const shot = n => page.screenshot({ path: path.join(__dirname, 'iterlog', n) });
  const out = { fail: [] };

  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__diag && window.__diag.state !== 'boot');
  await page.waitForTimeout(600);

  // ---- 1. WHAT AM I LOOKING AT via ? key
  await page.keyboard.press('?');
  await page.waitForTimeout(500);
  out.annotate = await page.evaluate(() => ({
    open: !document.getElementById('annotate').hidden,
    callouts: document.querySelectorAll('#an-items .an-c').length,
    names: Array.from(document.querySelectorAll('#an-items .an-c b')).map(b => b.textContent),
    lines: document.querySelectorAll('#an-lines line').length
  }));
  if (!out.annotate.open) out.fail.push('? did not open annotate');
  if (out.annotate.callouts < 9) out.fail.push('annotate has only ' + out.annotate.callouts + ' callouts');
  await shot('r2-annotate.png');
  await page.keyboard.press('Escape');
  out.annotateClosed = await page.evaluate(() => document.getElementById('annotate').hidden);
  if (!out.annotateClosed) out.fail.push('Escape did not close annotate');

  // helpbtn opens it too
  await page.click('#helpbtn');
  await page.waitForTimeout(200);
  const viaBtn = await page.evaluate(() => !document.getElementById('annotate').hidden);
  if (!viaBtn) out.fail.push('helpbtn did not open annotate');
  // mission briefing reachable from inside
  await page.click('#an-brief');
  await page.waitForTimeout(200);
  out.briefing = await page.evaluate(() => ({
    annotate: document.getElementById('annotate').hidden,
    howto: !document.getElementById('howto').hidden
  }));
  if (!out.briefing.howto) out.fail.push('briefing not reachable from annotate');
  await page.keyboard.press('Escape');

  // ---- 2. hover explainer on a HUD control
  await page.hover('#fullbtn');
  await page.waitForTimeout(250);
  out.explain = await page.evaluate(() => {
    const el = document.getElementById('explain');
    return { visible: el && !el.hidden, text: el ? el.innerText.replace(/\s+/g, ' ').slice(0, 120) : null };
  });
  if (!out.explain.visible) out.fail.push('hover explainer missing');

  // ---- 3. first lock-on triggers the 3-step guide
  await page.evaluate(() => { location.hash = '#/cms/intro'; });
  await page.waitForFunction(() => document.getElementById('page').innerText.length > 400);
  await page.waitForTimeout(700);
  out.guide1 = await page.evaluate(() => ({
    open: !document.getElementById('guide').hidden,
    step: document.getElementById('gd-step').textContent,
    body: document.getElementById('gd-body').innerText.slice(0, 60)
  }));
  if (!out.guide1.open) out.fail.push('guide did not appear after first lock-on');
  await shot('r2-guide.png');
  await page.click('#gd-next');
  await page.waitForTimeout(150);
  out.guide2 = await page.evaluate(() => document.getElementById('gd-step').textContent);
  await shot('r2-guide-step2.png');
  await page.click('#gd-next');
  await page.waitForTimeout(150);
  out.guide3btn = await page.evaluate(() => document.getElementById('gd-next').textContent);
  await page.click('#gd-next'); // GOT IT
  await page.waitForTimeout(150);
  out.guideClosed = await page.evaluate(() => document.getElementById('guide').hidden);
  if (!out.guideClosed) out.fail.push('guide did not close on GOT IT');
  // remembered for the visit
  await page.evaluate(() => { location.hash = '#/cms/features/api-tokens'; });
  await page.waitForTimeout(700);
  const guideAgain = await page.evaluate(() => !document.getElementById('guide').hidden);
  if (guideAgain) out.fail.push('guide reappeared in same visit');

  // ---- 4. the Hall of Hands via key H
  await page.keyboard.press('h');
  await page.waitForTimeout(900);
  out.hall = await page.evaluate(() => {
    const wall = document.getElementById('hh-wall');
    const tiles = Array.from(document.querySelectorAll('.hh-tile'));
    const dates = tiles.map(t => t.querySelector('.hh-dates').textContent.slice(0, 7));
    let sortedNewestFirst = true;
    for (let i = 1; i < dates.length; i++) if (dates[i] > dates[i - 1]) { sortedNewestFirst = false; break; }
    return {
      open: !document.getElementById('hands').hidden,
      tiles: tiles.length,
      sortedNewestFirst,
      firstTile: tiles[0] ? tiles[0].innerText.replace(/\s+/g, ' ') : null,
      lastTile: tiles.length ? tiles[tiles.length - 1].innerText.replace(/\s+/g, ' ') : null,
      scrolledToBottom: Math.abs(wall.scrollTop + wall.clientHeight - wall.scrollHeight) < 40,
      foot: document.querySelector('.hh-foot').textContent,
      sub: document.getElementById('hh-sub').textContent,
      padOn: !!window.__diag // pad state not exposed; presence check only
    };
  });
  if (!out.hall.open) out.fail.push('H did not open the hall');
  if (out.hall.tiles !== 77) out.fail.push('hall has ' + out.hall.tiles + ' hands, expected 77');
  if (!out.hall.sortedNewestFirst) out.fail.push('hands not ordered oldest-lowest');
  if (out.hall.foot !== 'The stone remembers all of them.') out.fail.push('footer line wrong');
  if (!out.hall.scrolledToBottom) out.fail.push('wall did not open on the oldest stratum');
  await shot('r2-hall.png');
  await page.evaluate(() => { document.getElementById('hh-wall').scrollTop = 0; });
  await page.waitForTimeout(250);
  await shot('r2-hall-top.png');
  await page.keyboard.press('Escape');
  out.hallClosed = await page.evaluate(() => document.getElementById('hands').hidden);
  if (!out.hallClosed) out.fail.push('Escape did not close the hall');

  // ---- 5. surveying /cloud/projects/settings logs the invitation
  await page.evaluate(() => { location.hash = '#/cloud/projects/settings'; });
  await page.waitForFunction(() => document.getElementById('page').innerText.length > 400);
  await page.waitForTimeout(500);
  out.invitation = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#log .ll')).map(d => d.innerText).filter(t => /INVITATION/.test(t))[0] || null);
  if (!out.invitation) out.fail.push('no invitation logged on /cloud/projects/settings');

  // ---- 6. crew register links to the wall
  out.crewDoor = await page.evaluate(() => {
    const b = document.getElementById('crewhall');
    return b ? b.textContent : null;
  });
  if (!out.crewDoor) out.fail.push('crew register has no door to the wall');
  await page.click('#crewhall');
  await page.waitForTimeout(400);
  out.crewDoorOpens = await page.evaluate(() => !document.getElementById('hands').hidden);
  if (!out.crewDoorOpens) out.fail.push('crew door does not open the hall');
  await shot('r2-hall-from-crew.png');
  await page.keyboard.press('Escape');

  // ---- 7. announce-once dedup (almanac twice -> one announcement)
  await page.click('#almbtn'); await page.waitForTimeout(250);
  await page.click('#almbtn'); await page.waitForTimeout(250);
  await page.click('#almbtn'); await page.waitForTimeout(250);
  out.almAnnounce = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#log .ll')).map(d => d.innerText).filter(t => /NEW OVERLAY/.test(t)).length);
  if (out.almAnnounce !== 1) out.fail.push('almanac announced ' + out.almAnnounce + ' times');
  await page.click('#almbtn');

  out.errors = errors;
  if (errors.length) out.fail.push(errors.length + ' page errors');
  out.verdict = out.fail.length ? 'FAIL' : 'PASS';
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
  srv.kill();
  process.exit(out.fail.length ? 1 : 0);
})().catch(e => { console.error('QA FAILED', e); process.exit(1); });
