/* the rain layer and the thunder obey the mix laws */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  /* wake the context with a real gesture */
  await page.keyboard.press('f');
  await page.waitForTimeout(1200);
  const built = await page.evaluate(() => !!sound.ctx && !!sound.bed);
  await page.evaluate(() => window.__helm.wxForce(8));
  await page.waitForTimeout(9000);
  const rain = await page.evaluate(() => ({
    node: !!sound.wxRain,
    gain: sound.wxRain ? +sound.wxRain.gn.gain.value.toFixed(4) : null,
    wanted: +(0.026 * wx.rain + 0.012 * wx.squall).toFixed(4)
  }));
  /* thunder: counted, gain envelope under the voices */
  const th = await page.evaluate(() => { sound.thunder(); return diag.thunderPlayed || 0; });
  await page.waitForTimeout(600);
  /* the duck: reading eases the whole mix - rain rides beneath it */
  const duck = await page.evaluate(() => sound.duckG ? sound.duckG.gain.value : null);
  console.log(JSON.stringify({ built, rain, thunderPlayed: th, duck, errs }, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
