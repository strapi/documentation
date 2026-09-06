/* The shanty: does the bed exist, do the CC0 voices decode, do they JOIN at the
   commit cadence of the water being crossed, and does one switch silence all? */
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
  await page.mouse.click(20, 500);          // the first gesture wakes the sound
  await page.waitForTimeout(2500);
  console.log('ctx', JSON.stringify(await page.evaluate(() => ({
    built: !!window.__helmSound.ctx, state: window.__helmSound.ctx && window.__helmSound.ctx.state,
    on: window.__helmSound.on, loaded: window.__helmDiag.voicesLoaded,
    files: window.__helmSound.files && window.__helmSound.files.length
  }))));

  /* the cadence is derived from the harbour's own commits */
  const cad = await page.evaluate(() => {
    const out = [];
    for (const s of ['/cms/api/document-service', '/cms/features/media-library', '/cms/testing', '/cloud/getting-started/caching']) {
      window.__helm.boundTo(s);
      window.__helmSound.setHarbour(window.__helmSoundIsle(s));
      out.push({ slug: s, joinEvery: window.__helmDiag.joinEvery, want: window.__helmSound.wantVoices });
    }
    return out;
  }).catch(() => null);
  console.log('cadence', JSON.stringify(cad));

  /* sailing: voices must join one at a time */
  await page.evaluate(() => { window.__helm.sailTo('/cms/api/document-service', 5.5); window.__helm.sail('full'); });
  console.log('harbour now', JSON.stringify(await page.evaluate(() => ({ joinEvery: window.__helmDiag.joinEvery, want: window.__helmSound.wantVoices }))));
  const seen = [];
  for (let i = 0; i < 14; i++) {
    await page.waitForTimeout(3000);
    seen.push(await page.evaluate(() => window.__helmDiag.voicesSinging || 0));
  }
  console.log('voices singing over 42 s:', seen.join(' '));

  /* one switch silences everything */
  await page.evaluate(() => window.__helm.sound(false));
  await page.waitForTimeout(800);
  await page.waitForTimeout(1200);
  console.log('silenced:', JSON.stringify(await page.evaluate(() => ({
    on: window.__helmSound.on, ctx: window.__helmSound.ctx.state, master: window.__helmSound.master.gain.value,
    singing: window.__helmDiag.voicesSinging, label: document.querySelector('#soundbtn .sb-text').textContent
  }))));
  await page.evaluate(() => window.__helm.sound(true));
  await page.waitForTimeout(600);
  console.log('back on:', JSON.stringify(await page.evaluate(() => ({ on: window.__helmSound.on }))));
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
