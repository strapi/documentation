/* THE SHANTY PROGRAMME, r10: bank of 17, call-and-response, the three
   variation laws proved from the trigger log, the suno slot, and the duck. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';
(async () => {
  const br = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.mouse.click(20, 500);
  await page.waitForTimeout(3000);
  console.log('A ctx', JSON.stringify(await page.evaluate(() => ({
    built: !!window.__helmSound.ctx, state: window.__helmSound.ctx && window.__helmSound.ctx.state,
    bank: window.__helmSound.bank.length, files: window.__helmSound.files && window.__helmSound.files.length,
    suno: window.__helmDiag.sunoVerses || 0
  }))));

  /* B. cadence law unchanged */
  const cad = await page.evaluate(() => {
    const out = [];
    for (const s of ['/cms/api/document-service', '/cms/testing']) {
      window.__helmSound.setHarbour(window.__helmSoundIsle(s));
      out.push({ slug: s, joinEvery: window.__helmDiag.joinEvery, want: window.__helmSound.wantVoices });
    }
    return out;
  });
  console.log('B cadence', JSON.stringify(cad));

  /* C. sail and let the programme run; collect the trigger log */
  await page.evaluate(() => { window.__helm.sailTo('/cms/api/document-service', 5.5); window.__helm.sail('full'); });
  const crewSeen = [];
  for (let i = 0; i < 50; i++) {           // 150 s of sailing
    await page.waitForTimeout(3000);
    crewSeen.push(await page.evaluate(() => window.__helmDiag.voicesSinging || 0));
  }
  const trig = await page.evaluate(() => window.__helmSound.trig);
  console.log('C crew over 150s:', crewSeen.join(' '));
  console.log('C triggers:', trig.length);
  let sameTwice = 0, bigramRepeat = 0;
  const seenGram = new Map();
  for (let i = 1; i < trig.length; i++) {
    if (trig[i].id === trig[i - 1].id) sameTwice++;
    const key = trig[i - 1].id + '>' + trig[i].id;
    if (seenGram.has(key) && trig[i].t - seenGram.get(key) < 600) bigramRepeat++;
    seenGram.set(key, trig[i].t);
  }
  const rates = new Set(trig.map(x => x.rate)), levels = new Set(trig.map(x => x.level));
  const ids = new Set(trig.map(x => x.id));
  console.log('C LAWS: same-twice-in-a-row', sameTwice, '| bigram repeats <10min', bigramRepeat,
    '| distinct phrases heard', ids.size, '| distinct rates', rates.size, '| distinct levels', levels.size);
  console.log('C first 12:', trig.slice(0, 12).map(x => x.id.replace('.mp3', '') + '@' + x.t).join(' '));

  /* D. the suno slot: force the featured verse */
  await page.evaluate(() => { window.__helmSound.nextFeatureAt = window.__helmSound.ctx.currentTime + 0.5; });
  await page.waitForTimeout(6500);
  const feat = await page.evaluate(() => ({
    featTrig: window.__helmSound.trig.filter(x => x.slot === 'featured').length,
    cap: document.getElementById('caption').textContent
  }));
  console.log('D featured', JSON.stringify(feat));

  /* E. THE DUCK: RMS sailing vs reading = 4:1, eased, programme alive */
  const sailRms = await page.evaluate(() => window.__helmSound.rms(4));
  await page.evaluate(() => window.__helm.open('/cms/backend-customization'));
  await page.waitForTimeout(2600);         // let the duck settle
  const st = await page.evaluate(() => ({ ducked: window.__helmDiag.ducked, duckG: window.__helmSound.duckG.gain.value }));
  const readRms = await page.evaluate(() => window.__helmSound.rms(4));
  const crewWhileReading = await page.evaluate(() => window.__helmDiag.voicesSinging || 0);
  await page.keyboard.press('Escape');     // weigh anchor
  await page.waitForTimeout(2200);
  const backRms = await page.evaluate(() => window.__helmSound.rms(4));
  console.log('E duck', JSON.stringify({
    sailRms: +sailRms.toFixed(4), readRms: +readRms.toFixed(4), backRms: +backRms.toFixed(4),
    ratio: +(readRms / sailRms).toFixed(3), back: +(backRms / sailRms).toFixed(3),
    state: st, crewWhileReading
  }));

  /* F. the anchor one-shot fires without error */
  await page.evaluate(() => window.__helmSound.anchorShot());
  await page.waitForTimeout(1300);

  /* G. one switch still silences everything */
  await page.evaluate(() => window.__helm.sound(false));
  await page.waitForTimeout(1500);
  const offRms = await page.evaluate(() => window.__helmSound.rms(2));
  console.log('G silenced', JSON.stringify(await page.evaluate(() => ({
    on: window.__helmSound.on, master: window.__helmSound.master.gain.value,
    label: document.querySelector('#soundbtn .sb-text').textContent
  }))), 'rms', +offRms.toFixed(5));
  await page.evaluate(() => window.__helm.sound(true));
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
