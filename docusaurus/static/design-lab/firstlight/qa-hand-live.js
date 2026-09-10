/* QA: HIS OWN TAPS, THROUGH THE WHOLE WORLD.

   qa-hand-calibration.js proves the recogniser reads five clicks out of his
   five deliberate taps. He still could not open a page with them. That gap is
   the point of this probe: between the recogniser and a page opening there is
   hands.js (the comfort box, the mirror, the filter, the latch) and
   firstlight.js (the reticle, the snap, the click listener), and nothing was
   testing that path with a real hand.

   So the tap take of the calibration clip is replayed through a fake source
   into the real world, translated so that his palm lands on a real body's
   current screen position. What must happen is what he expects to happen: the
   page opens.

   Usage: node qa-hand-live.js */

'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const clip = JSON.parse(fs.readFileSync(path.join(__dirname, 'qa-fixtures', 'hand-calibration-2026-09-09.json'), 'utf8'));

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise((res, rej) => {
    srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); });
    setTimeout(() => rej(new Error('server timeout')), 5000);
  });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__diag && window.__diag.state !== 'boot', { timeout: 15000 });
  await page.waitForFunction(() => !!window.__handProbe && !!window.__hands, { timeout: 15000 });

  const take = clip.steps.find(s => s.id === 'tap');
  const frames = clip.frames.filter(f => f.s === take.i && f.hands.length)
    .map(f => ({ t: f.t, p: f.hands[0].p, h: f.hands[0].h }));

  const r = await page.evaluate(async (frames) => {
    const { startHands, COMFORT } = await import('./hand/hands.js');
    const { makeFakeSource } = await import('./hand/source.js');
    const out = { events: [] };
    for (const type of ['grab', 'release', 'click', 'noclick', 'absent', 'present', 'dismiss', 'zoom']) {
      window.addEventListener('hand:' + type, () => out.events.push(type));
    }
    /* the hash right after the FIRST click: the other four taps land on
       whatever the chart has become by then, which is the world working, not
       a fault */
    window.addEventListener('hand:click', () => {
      if (out.firstHash === undefined) setTimeout(() => { out.firstHash = location.hash; }, 30);
    });

    /* let the camera settle where the cases before have left it, then aim at a
       real body: the same inversion of the comfort box and the mirror that
       qa-hand-map.js uses, applied as one constant offset so his own motion
       inside the take survives */
    const still = async () => {
      for (let i = 0; i < 80; i++) {
        const c = window.__handProbe.cam();
        if (Math.abs(c.s - c.ts) < 1e-3 && Math.abs(c.x - c.tx) < 0.5) return true;
        await new Promise(r2 => setTimeout(r2, 50));
      }
      return false;
    };
    out.cameraStill = await still();
    const qs = window.__handProbe.qs();
    const screen = window.__handProbe.starScreen(qs);
    out.slug = window.__handProbe.slug(qs);
    const rawXTarget = screen[0] / window.innerWidth, rawYTarget = screen[1] / window.innerHeight;
    const targetCx = (1 - rawXTarget) * COMFORT.w + (0.5 - COMFORT.w / 2);
    const targetCy = rawYTarget * COMFORT.h + (0.5 - COMFORT.h / 2);
    const first = frames[0].p;
    const palm0 = { x: (first[0][0] + first[5][0] + first[9][0] + first[17][0]) / 4,
                    y: (first[0][1] + first[5][1] + first[9][1] + first[17][1]) / 4 };
    const dx = targetCx - palm0.x, dy = targetCy - palm0.y;

    /* HOW BIG THE TARGET ACTUALLY IS ON SCREEN, measured before anything is
       opened, because five taps in a row open five bodies and move the camera.
       Nobody had measured this and it was 28 pixels: at the cold open the
       chart holds ONE body, so a hand pointing anywhere on screen snapped to
       nothing on 576 of 576 sampled points, and no pinch could ever have
       opened a page however well it was read. */
    const fire = (x, y) => window.dispatchEvent(new CustomEvent('hand:move', { detail: { x, y } }));
    let reach = 0;
    for (let d = 4; d <= 400; d += 4) {
      fire(screen[0] + d, screen[1]);
      if (window.__handProbe.snapped() < 0) { reach = d; break; }
    }
    out.snapReachPx = reach;

    const src = makeFakeSource();
    const api = startHands({ source: src });
    window.__hands = api;
    await api.arm();
    for (let i = 0; i < 6 && !document.getElementById('guide').hidden; i++) document.getElementById('gd-next').click();

    const before = location.hash;
    out.tsBefore = window.__handProbe.cam().ts;
    /* replayed at the clip's own timing, which is the whole point: the
       thresholds that broke were the ones with a time in them */
    let last = frames[0].t;
    for (const f of frames) {
      await new Promise(r2 => setTimeout(r2, Math.max(0, Math.round((f.t - last) * 1000))));
      last = f.t;
      src.push({ hands: [{ handedness: f.h, landmarks: f.p.map(([x, y]) => ({ x: x + dx, y: y + dy })) }] });
      if (window.__handProbe.snapped() >= 0) out.snappedAtLeastOnce = true;
    }
    await new Promise(r2 => setTimeout(r2, 200));
    out.snapped = window.__handProbe.snapped();
    out.tsAfter = window.__handProbe.cam().ts;
    out.hash = location.hash;
    out.opened = location.hash !== before;
    out.readerOpen = !document.getElementById('reader').hidden;
    out.panel = (document.querySelector('#hand-panel .hand-status') || {}).textContent;
    api.destroy();
    return out;
  }, frames);

  await browser.close(); srv.kill();

  const count = (t) => r.events.filter(x => x === t).length;
  const fails = [];
  if (!r.cameraStill) fails.push('the camera never settled, so no screen position was stable to aim at');
  if (!count('grab')) fails.push('his taps produced no grab at all through hands.js');
  if (count('click') !== 5) fails.push(`his five taps produced ${count('click')} clicks through the world, wanted 5`);
  if (!r.snappedAtLeastOnce) fails.push('the reticle never snapped to a body while his hand was over it');
  if (!(r.snapReachPx >= 100)) fails.push(`a body's snap zone reaches only ${r.snapReachPx}px on screen; a hand in the air cannot aim at that`);
  if (!r.opened) fails.push(`no page opened: hash stayed ${JSON.stringify(r.hash)}, panel said ${JSON.stringify(r.panel)}`);
  if (r.opened && r.firstHash !== '#' + r.slug) fails.push(`the first tap opened ${r.firstHash} against the #${r.slug} it was aimed at`);
  if (!r.readerOpen) fails.push('the hash changed but the reader never opened');
  /* WHAT TAPPING DOES TO THE SCALE, which is the question rather than how many
     events it fired. Zoom is how open the hand is, so a hand that opens
     between two taps legitimately moves it a little; what must not happen is
     the half-turn it made before the gesture was armed against a measured
     excursion. His five taps are allowed 10 percent, and they take 3. */
  const drift = Math.abs(Math.log(r.tsAfter / r.tsBefore));
  if (drift > Math.log(1.10)) fails.push(`tapping five times moved the scale by ${(100 * (Math.exp(drift) - 1)).toFixed(0)} percent, wanted under 10`);
  /* one absence is the probe's own scheduler losing to the world's render
     loop, not the switch misfiring: the clip's own worst gap inside this take
     is 51ms and the switch waits 300. More than one means the switch is
     firing on ordinary frames again, which is what broke every gesture once. */
  if (count('absent') > 1) fails.push(`the hand was lost ${count('absent')} times mid-take, which is the dead man's switch firing on ordinary frames`);
  if (errors.length) fails.push('page errors: ' + errors.slice(0, 2).join(' | '));

  console.log(`  replayed ${frames.length} frames of his tap take, aimed at ${r.slug}`);
  console.log(`  events: ${['grab', 'release', 'click', 'noclick', 'zoom', 'absent'].map(t => `${t} ${count(t)}`).join('  ')}`);
  console.log(`  tapping moved the scale by ${(100 * Math.abs(r.tsAfter / r.tsBefore - 1)).toFixed(1)} percent over ${count('zoom')} step(s)`);
  console.log(`  the target reaches ${r.snapReachPx}px on screen   first tap opened ${JSON.stringify(r.firstHash)}`);
  console.log(`  snapped ${r.snapped}   hash ${JSON.stringify(r.hash)}   reader open ${r.readerOpen}   panel ${JSON.stringify(r.panel)}`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
