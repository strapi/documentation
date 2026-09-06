/* THE DUCK, clean: RMS while reading = one quarter of RMS under sail,
   eased both ways, the programme running behind it. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.mouse.click(20, 500);
  await page.waitForTimeout(2500);
  /* under way, far from any shore so she cannot arrive mid-measure */
  await page.evaluate(() => { window.__helm.sailTo('/cms/api/document-service', 24); window.__helm.sail('full'); });
  await page.waitForTimeout(30000);   // the crew joins
  const crew0 = await page.evaluate(() => window.__helmDiag.voicesSinging || 0);
  const sailRms = await page.evaluate(() => window.__helmSound.rms(6));
  /* mid-ease sample: is it easing, not stepping? */
  await page.evaluate(() => window.__helm.open('/cms/backend-customization'));
  const easeRms = await page.evaluate(() => window.__helmSound.rms(0.5));
  await page.waitForTimeout(2800);
  const st = await page.evaluate(() => ({ ducked: window.__helmDiag.ducked, duckG: +window.__helmSound.duckG.gain.value.toFixed(3) }));
  const readRms = await page.evaluate(() => window.__helmSound.rms(6));
  const crewRead = await page.evaluate(() => window.__helmDiag.voicesSinging || 0);
  const trigBefore = await page.evaluate(() => window.__helmSound.trig.length);
  await page.waitForTimeout(12000);
  const trigAfter = await page.evaluate(() => window.__helmSound.trig.length);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(3000);
  const backDuck = await page.evaluate(() => +window.__helmSound.duckG.gain.value.toFixed(3));
  console.log(JSON.stringify({
    crew0, sailRms: +sailRms.toFixed(4), easeRms: +easeRms.toFixed(4),
    readRms: +readRms.toFixed(4), ratio: +(readRms / sailRms).toFixed(3),
    duckState: st, crewRead, programmeAliveWhileReading: trigAfter > trigBefore,
    trigDelta: trigAfter - trigBefore, backDuck
  }, null, 1));
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
