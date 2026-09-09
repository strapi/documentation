/* QA: THE GUIDED RECORDER writes a clip that can be calibrated against.

   The instrument exists because the thresholds were derived from a clip
   without the gestures in it (see hand/record.html). If IT is wrong, the next
   round of calibration is wrong too and nobody finds out for another two
   evenings, so the file it produces is checked here rather than trusted.

   Driven on the fake source (?src=fake) at a tenth of the durations
   (?fast=1), so all eight takes and the file they produce are proved in
   seconds, with no camera and no hand. Both ways of starting a take are
   exercised, the button and the Enter key, because the owner starts them with
   his other hand and a recorder he cannot start records nothing.

   What this cannot prove is what a real hand looks like. That is his clip, and
   it is the one thing no probe stands in for. */

'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise((res, rej) => {
    srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); });
    setTimeout(() => rej(new Error('server timeout')), 5000);
  });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`http://127.0.0.1:${port}/hand/record.html?fast=1&src=fake`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__rec, { timeout: 10000 });

  const script = await page.evaluate(() => window.__rec.script());

  /* a hand that keeps changing shape, so the readout has something to say and
     the frames are not all identical */
  await page.evaluate(() => {
    window.__hand = (curl, cx) => {
      const size = 0.20, pinch = 0.9;
      const L = new Array(21).fill(null).map(() => ({ x: cx, y: 0.5, z: 0 }));
      L[0] = { x: cx, y: 0.5 + size, z: 0 };
      L[9] = { x: cx, y: 0.5, z: 0 };
      L[5] = { x: cx - size * 0.4, y: 0.5, z: 0 };
      L[17] = { x: cx + size * 0.4, y: 0.5, z: 0 };
      L[8] = { x: cx - size * 0.5 * curl, y: 0.5 - size * curl, z: 0 };
      L[4] = { x: L[8].x + pinch * size, y: L[8].y, z: 0 };
      L[12] = { x: cx, y: 0.5 - size * 1.05 * curl, z: 0 };
      L[16] = { x: cx + size * 0.35 * curl, y: 0.5 - size * 0.95 * curl, z: 0 };
      L[20] = { x: cx + size * 0.6 * curl, y: 0.5 - size * 0.8 * curl, z: 0 };
      return { hands: [{ landmarks: L, handedness: 'Right' }] };
    };
  });

  await page.click('#start');

  /* the camera feed, running the whole time the way a real one does: it does
     not stop between takes, and nothing outside a take may be recorded */
  const feed = page.evaluate(async () => {
    for (let i = 0; i < 2000 && window.__rec.mode() !== 'done'; i++) {
      window.__rec.push(window.__hand(0.6 + 0.4 * Math.abs(Math.sin(i / 9)), 0.5 + 0.05 * Math.sin(i / 5)));
      await new Promise(r => setTimeout(r, 33));
    }
  });

  /* start each take the way he will: the button, and once with the key */
  const startedBy = [];
  for (let n = 0; n < script.length + 2; n++) {
    const mode = await page.evaluate(() => window.__rec.mode());
    if (mode === 'done') break;
    if (mode === 'waiting') {
      const i = await page.evaluate(() => window.__rec.index());
      if (i === 3) { await page.keyboard.press('Enter'); startedBy.push('key'); }
      else { await page.click('#take'); startedBy.push('button'); }
      /* a second press while it records must not restart or nest a take */
      await page.keyboard.press('Enter');
    }
    await page.waitForFunction(
      (want) => window.__rec.mode() === 'waiting' || window.__rec.mode() === 'done',
      await page.evaluate(() => window.__rec.index()),
      { timeout: 20000 },
    ).catch(() => {});
  }
  await feed;

  const finished = await page.evaluate(() => window.__rec.mode() === 'done');
  const framesBetween = await page.evaluate(() => window.__rec.frames());
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }).catch(() => null),
    page.click('#save'),
  ]);

  let clip = null, name = null;
  if (download) {
    name = download.suggestedFilename();
    const to = path.join(os.tmpdir(), 'qa-record-clip.json');
    await download.saveAs(to);
    clip = JSON.parse(fs.readFileSync(to, 'utf8'));
    fs.unlinkSync(to);
  }

  await browser.close(); srv.kill();

  const fails = [];
  if (!finished) fails.push('the eight takes never completed');
  if (startedBy.filter(x => x === 'key').length < 1) fails.push('the Enter key never started a take');
  if (startedBy.filter(x => x === 'button').length < 6) fails.push('the button did not start the other takes');
  if (!clip) fails.push('SAVE THE CLIP produced no download');
  else {
    if (clip.source !== 'firstlight-hand-calibration') fails.push(`the clip names itself "${clip.source}"`);
    if (clip.fast !== true) fails.push('a clip recorded at a tenth of the durations must say so in its own file');
    if (!/^firstlight-hand-calibration-\d{4}-\d{2}-\d{2}\.json$/.test(name || '')) fails.push(`the file is named ${JSON.stringify(name)}`);
    if (!Array.isArray(clip.steps) || clip.steps.length !== script.length) {
      fails.push(`the clip holds ${clip.steps ? clip.steps.length : 0} takes, wanted all ${script.length}`);
    } else {
      if (clip.steps.map(s => s.id).join(',') !== script.join(',')) fails.push('the takes in the file are not the takes of the script, in order');
      for (const s of clip.steps) {
        if (!(s.to > s.from)) { fails.push(`take ${s.i} (${s.id}) spans ${s.from} to ${s.to}`); break; }
        if (!(s.frames > 0)) { fails.push(`take ${s.i} (${s.id}) recorded ${s.frames} frames`); break; }
      }
      /* every take has to be findable IN the frames, not merely listed in the
         header: a label nobody can locate calibrates nothing */
      const seen = new Set(clip.frames.map(f => f.s));
      const missing = clip.steps.map(s => s.i).filter(i => !seen.has(i));
      if (missing.length) fails.push(`no frame carries take ${missing.join(', ')}, so those gestures cannot be found in the data`);
      /* and nothing outside a take may be in the file: the camera runs
         between takes, and what happens while he reads the next instruction
         is not a gesture */
      if (seen.has(-1)) fails.push('frames recorded outside a take reached the file');
      const counted = clip.steps.reduce((n, s) => n + s.frames, 0);
      if (counted !== clip.frames.length) fails.push(`the takes account for ${counted} frames and the file holds ${clip.frames.length}`);
    }
    if (!Array.isArray(clip.frames) || clip.frames.length < 100) fails.push(`the clip holds ${clip.frames ? clip.frames.length : 0} frames`);
    else {
      const bad = clip.frames.find(f => typeof f.t !== 'number' || typeof f.s !== 'number' || !Array.isArray(f.hands));
      if (bad) fails.push('a frame is missing its timestamp, its take or its hands');
      const withHand = clip.frames.filter(f => f.hands.length);
      if (withHand.length < clip.frames.length * 0.9) fails.push(`only ${withHand.length} of ${clip.frames.length} frames carry a hand`);
      const pts = withHand[0] && withHand[0].hands[0].p;
      if (!pts || pts.length !== 21 || pts[0].length !== 2) fails.push('a hand does not carry 21 landmarks of two coordinates');
      /* raw only: a derived number in the file would calibrate the next
         formula against this one's output */
      const leaked = Object.keys(withHand[0].hands[0]).filter(k => k !== 'h' && k !== 'p');
      if (leaked.length) fails.push(`the file carries derived fields on a hand: ${leaked.join(', ')}`);
      if (!(clip.fps > 10)) fails.push(`the clip reports ${clip.fps} fps`);
      if (!(clip.seconds > 0)) fails.push(`the clip reports ${clip.seconds} seconds`);
    }
  }
  if (errors.length) fails.push('console/page errors: ' + errors.slice(0, 2).join(' | '));

  if (clip) {
    console.log(`  ${clip.frames.length} frames over ${clip.seconds}s at ${clip.fps} fps`);
    console.log(`  takes: ${clip.steps.map(s => `${s.id}(${s.frames})`).join(' ')}`);
    console.log(`  started by: ${startedBy.join(', ')}   frames held in the page: ${framesBetween}`);
  }
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
