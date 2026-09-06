'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 250)));
  page.on('console', m => { if (m.type() === 'error') errs.push('C ' + m.text().slice(0, 200)); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.mouse.click(400, 200);   /* first gesture: the audio wakes */
  await page.waitForTimeout(600);

  /* she walks the rail; put her mid-rail and read her */
  await page.evaluate(() => window.__helm.catSit(0.55));
  await page.waitForTimeout(700);
  const c0 = await page.evaluate(() => window.__helm.cat());
  /* pet her with a click on her own ground */
  const hit = await page.evaluate(() => cat.hit);
  await page.mouse.click(hit.x, hit.y);
  await page.waitForTimeout(400);
  const c1 = await page.evaluate(() => ({ cat: window.__helm.cat(), purrs: diag.purrs,
    cap: document.getElementById('caption').textContent }));
  console.log('PET-1', JSON.stringify({ c0, c1, arched: c1.cat.arch, purred: c1.purrs >= 1 }));

  /* pet to adoption: three strokes and she is yours */
  await page.waitForTimeout(2300);
  await page.keyboard.press('p');
  await page.waitForTimeout(2500);
  await page.keyboard.press('p');
  await page.waitForTimeout(500);
  const c2 = await page.evaluate(() => ({ cat: window.__helm.cat(), purrs: diag.purrs,
    cap: document.getElementById('caption').textContent }));
  console.log('FOLLOWS', JSON.stringify({ pets: c2.cat.pets, follows: c2.cat.follows, purrs: c2.purrs, cap: c2.cap.slice(0, 60) }));

  /* the log: she sits by it while you write */
  await page.evaluate(() => window.__helm.below('log'));
  await page.waitForTimeout(2100);
  const s1 = await page.evaluate(() => ({ seat: cat.seat, shown: document.getElementById('deskcat').style.display }));
  /* another station: she follows you there too, now */
  await page.evaluate(() => showTab('register'));
  await page.waitForTimeout(2100);
  const s2 = await page.evaluate(() => ({ seat: cat.seat, shown: document.getElementById('deskcat').style.display }));
  console.log('SEATS', JSON.stringify({ log: s1, register: s2 }));

  /* the chart: she settles over the waters you visit most; a click pets her */
  await page.evaluate(() => showTab('chart'));
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.waitForTimeout(800);
  const cc = await page.evaluate(() => ({ shown: document.getElementById('chartcat').style.display,
    home: diag.chartCat && diag.chartCat.near }));
  const purrsBefore = await page.evaluate(() => diag.purrs);
  await page.evaluate(() => petCat('probe'));   /* the click path is wired; the act is the same */
  await page.waitForTimeout(300);
  const cc2 = await page.evaluate(() => ({ purrs: diag.purrs, arch: window.__helm.cat().arch }));
  console.log('CHARTCAT', JSON.stringify({ cc, purrsBefore, cc2 }));

  /* the Key carries her line */
  const keyLine = await page.evaluate(() => {
    furnOpen('key');
    const rows = [...document.querySelectorAll('#chartkey .ck-row')];
    return { n: rows.length, last: rows[rows.length - 1].textContent };
  });
  console.log('KEYLINE', JSON.stringify(keyLine));

  /* the bottle: she sits by while you write */
  await page.evaluate(() => { furnClose(); closeBelow(); bottleOpen(); });
  await page.waitForTimeout(2100);
  const s3 = await page.evaluate(() => ({ seat: cat.seat, z: document.getElementById('deskcat').style.zIndex }));
  await page.evaluate(() => bottleClose());
  console.log('BOTTLE', JSON.stringify(s3));

  /* reduced motion: held poses, instant, purr intact */
  const rm = await br.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  rm.on('pageerror', e => errs.push('RM ' + String(e).slice(0, 200)));
  await rm.goto('http://127.0.0.1:8123/index.html?scale=1');
  await rm.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await rm.mouse.click(400, 200);
  await rm.waitForTimeout(800);
  const r0 = await rm.evaluate(() => window.__helm.cat());
  const rhit = await rm.evaluate(() => cat.hit);
  let r1 = null;
  if (rhit) {
    await rm.mouse.click(rhit.x, rhit.y);
    await rm.waitForTimeout(300);
    r1 = await rm.evaluate(() => ({ cat: window.__helm.cat(), purrs: diag.purrs }));
  }
  console.log('REDUCED', JSON.stringify({ r0, r1 }));

  console.log('ERRS', JSON.stringify(errs));
  await br.close();
})();
