/* Round 6 evidence: the six judging frames, the slow pan, the reduced-motion plate,
   plus true-2x crops of the regions the judge cropped in round 1, and matched
   before/after crops taken from the round-1 PNGs with the identical boxes. */
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');

const BASE = 'http://127.0.0.1:8123/index.html';
const OUT = path.join(__dirname, 'iterlog');
const R1 = '/private/tmp/claude-501/-Users-piwi-code-documentation/0d8629c6-231f-4fec-94af-6fe3669d37b8/scratchpad/qa/gate0-deadreckoning-r1';
const TAG = 'r6';

/* logical boxes on the 1440x900 plate */
const BOX = {
  lowerleft:    { x: 0,   y: 560, w: 480, h: 300 },
  lowerright:   { x: 960, y: 560, w: 480, h: 300 },
  horizon:      { x: 480, y: 330, w: 480, h: 200 },
  lens:         { x: 560, y: 190, w: 420, h: 300 },
  bottom:       { x: 700, y: 700, w: 728, h: 200 },
  captionwheel: { x: 360, y: 470, w: 720, h: 430 },
  hints:        { x: 0,   y: 0,   w: 620, h: 240 }
};

const clipOf = b => ({ x: b.x, y: b.y, width: b.w, height: b.h });

const STATES = {
  1: { distNm: 2.7, sail: 'rest', hour: 'afternoon', spyglass: false, knots: 0 },
  2: { distNm: 2.0, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.2 },
  4: { distNm: 1.8, sail: 'full', hour: 'afternoon', spyglass: true,  knots: 8.2 },
  5: { distNm: 0.42, sail: 'half', hour: 'afternoon', spyglass: false, knots: 4.4 },
  6: { distNm: 1.6, sail: 'full', hour: 'dusk', spyglass: false, knots: 8.2 }
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];

  /* ---- pass 1: the 1x plates ---- */
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', m => { if (m.type() === 'error') errors.push('1x ' + m.text()); });
  page.on('pageerror', e => errors.push('1x ' + e.message));
  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
  await page.evaluate(s => { window.__S = s; }, STATES);
  await page.waitForTimeout(1200);

  async function shot(p, name, setup, settleMs) {
    await p.evaluate(setup);
    await p.waitForTimeout(settleMs == null ? 900 : settleMs);
    await p.screenshot({ path: path.join(OUT, `${TAG}-${name}.png`) });
    const d = await p.evaluate(() => {
      const q = window.__helmDiag;
      return { bearing: q.bearing, ordered: q.orderedBearing, sail: q.sailState, knots: q.knots,
               distNm: q.distNm, lod: q.lod, spyglass: q.spyglass, hour: q.hour, avgMs: q.avgFrameMs };
    });
    console.log(name, JSON.stringify(d));
  }

  await shot(page, '1-bow-at-rest', () => window.__helm.setState(window.__S[1]), 1500);
  await shot(page, '2-full-sail', () => window.__helm.setState(window.__S[2]), 2500);
  await page.evaluate(() => window.__helm.setState({ distNm: 1.9, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.2 }));
  await page.waitForTimeout(700);
  await page.evaluate(() => window.__helm.hardOver(1));
  await shot(page, '3-hard-turn-mid-lag', () => {}, 480);
  await shot(page, '4-spyglass-half-resolved', () => window.__helm.setState(window.__S[4]), 1300);
  await shot(page, '5-island-resolved', () => window.__helm.setState(window.__S[5]), 1400);
  await shot(page, '6-dusk-wash', () => window.__helm.setState(window.__S[6]), 1800);

  /* slow pan, four frames a second apart */
  await page.evaluate(() => window.__helm.setState({ distNm: 2.2, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.2 }));
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.__helm.order(30));
  for (let i = 0; i <= 3; i++) {
    await page.screenshot({ path: path.join(OUT, `${TAG}-pan-${i}s.png`) });
    if (i < 3) await page.waitForTimeout(1000);
  }

  /* caption clearance: a long caption held while the wheel is hard over */
  await page.evaluate(() => {
    window.__helm.setState({ distNm: 1.2, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.2, wheelDeg: 96 });
    window.__helm.say('"By the deep, seven thousand one hundred and eighty-four. Three headlands plain on the bow."');
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, `${TAG}-caption-over-wheel.png`) });

  /* hints legibility in every sail state */
  for (const [sail, label] of [['full', 'full'], ['half', 'half'], ['rest', 'furl']]) {
    await page.evaluate(s => {
      window.__helm.setState({ distNm: 2.0, sail: s, hour: 'afternoon', spyglass: false, knots: s === 'rest' ? 0 : 6 });
      document.getElementById('hints').classList.add('shown');
    }, sail);
    await page.waitForTimeout(1100);
    await page.screenshot({ path: path.join(OUT, `${TAG}-hints-${label}.png`), clip: clipOf(BOX.hints) });
  }
  await page.evaluate(() => document.getElementById('hints').classList.remove('shown'));

  /* wind streak legibility, afternoon and dusk, sky region */
  for (const hour of ['afternoon', 'dusk']) {
    await page.evaluate(h => window.__helm.setState({ distNm: 2.4, sail: 'full', hour: h, spyglass: false, knots: 8.2 }), hour);
    await page.waitForTimeout(1400);
    await page.screenshot({ path: path.join(OUT, `${TAG}-windstreaks-${hour}.png`), clip: { x: 120, y: 60, width: 1200, height: 330 } });
  }
  await page.close();

  /* ---- pass 2: true 2x crops of the judged regions ---- */
  // deviceScaleFactor 2: the page itself renders at 2x, so the crops are real device
  // pixels rather than an upscale, and the build picks SCALE 2 from devicePixelRatio
  const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  p2.on('console', m => { if (m.type() === 'error') errors.push('2x ' + m.text()); });
  p2.on('pageerror', e => errors.push('2x ' + e.message));
  await p2.goto(BASE);
  await p2.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
  await p2.waitForTimeout(1500);

  async function crop2x(name, state, box, settle) {
    await p2.evaluate(s => window.__helm.setState(s), state);
    await p2.waitForTimeout(settle || 1400);
    // the canvas is laid out at 1440x900 CSS px; the clip is in CSS px, the buffer is 2x
    await p2.screenshot({ path: path.join(OUT, `${TAG}-2x-${name}.png`), clip: clipOf(box), scale: 'device' });
  }
  await crop2x('pan-lowerleft', STATES[2], BOX.lowerleft);
  await crop2x('pan-lowerright', STATES[2], BOX.lowerright);
  await crop2x('pan-horizon', STATES[2], BOX.horizon);
  await crop2x('j5-lowerleft', STATES[5], BOX.lowerleft);
  await crop2x('j6-lowerleft', STATES[6], BOX.lowerleft);
  await crop2x('j6-bottom', STATES[6], BOX.bottom);
  await crop2x('j4-lens', STATES[4], BOX.lens);
  await crop2x('j2-lowerleft', STATES[2], BOX.lowerleft);
  await p2.close();

  /* ---- pass 3: matched before/after crops, identical boxes, 2x upscale of 1x plates ---- */
  const p3 = await browser.newPage({ viewport: { width: 400, height: 300 } });
  await p3.setContent('<canvas id="c"></canvas>');
  async function upcrop(srcFile, box, outFile) {
    if (!fs.existsSync(srcFile)) { console.log('missing', srcFile); return; }
    const b64 = fs.readFileSync(srcFile).toString('base64');
    const data = await p3.evaluate(async (a) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + a.b64;
      await img.decode();
      const c = document.getElementById('c');
      c.width = a.box.w * 2; c.height = a.box.h * 2;
      const g = c.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.drawImage(img, a.box.x, a.box.y, a.box.w, a.box.h, 0, 0, a.box.w * 2, a.box.h * 2);
      return c.toDataURL('image/png').split(',')[1];
    }, { b64, box });
    fs.writeFileSync(outFile, Buffer.from(data, 'base64'));
  }
  const pairs = [
    ['pan-3s.png', `${TAG}-pan-3s.png`, BOX.lowerleft, 'lowerleft-pan'],
    ['j6-dusk-wash.png', `${TAG}-6-dusk-wash.png`, BOX.lowerleft, 'lowerleft-dusk'],
    ['j2-full-sail.png', `${TAG}-2-full-sail.png`, BOX.lowerleft, 'lowerleft-fullsail'],
    ['j5-island-resolved.png', `${TAG}-5-island-resolved.png`, BOX.lowerleft, 'lowerleft-island'],
    ['j4-spyglass-half-resolved.png', `${TAG}-4-spyglass-half-resolved.png`, BOX.lens, 'lens'],
    ['j6-dusk-wash.png', `${TAG}-6-dusk-wash.png`, BOX.bottom, 'bottom'],
    ['j2-full-sail.png', `${TAG}-2-full-sail.png`, BOX.hints, 'hints'],
    ['pan-3s.png', `${TAG}-pan-3s.png`, BOX.horizon, 'horizon']
  ];
  for (const [r1f, r6f, box, label] of pairs) {
    await upcrop(path.join(R1, r1f), box, path.join(OUT, `cmp-${label}-before.png`));
    await upcrop(path.join(OUT, r6f), box, path.join(OUT, `cmp-${label}-after.png`));
  }
  await p3.close();

  /* ---- pass 4: the becalmed plate, real prefers-reduced-motion ---- */
  const ctxRM = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p4 = await ctxRM.newPage();
  p4.on('pageerror', e => errors.push('rm ' + e.message));
  await p4.goto(BASE);
  await p4.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
  await p4.waitForTimeout(1800);
  await p4.screenshot({ path: path.join(OUT, `${TAG}-7-becalmed-reduced-motion.png`) });
  const still = await p4.evaluate(async () => {
    const cv = document.getElementById('sea');
    const g = cv.getContext('2d');
    const a = g.getImageData(0, 300, cv.width, 300).data.slice();
    await new Promise(r => setTimeout(r, 1000));
    const b = g.getImageData(0, 300, cv.width, 300).data;
    let diff = 0;
    for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i]) diff++;
    return diff;
  });
  console.log('becalmed: sea pixels changed over 1 s =', still);
  await ctxRM.close();

  console.log('CONSOLE ERRORS:', errors.length ? JSON.stringify(errors) : 'none');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
