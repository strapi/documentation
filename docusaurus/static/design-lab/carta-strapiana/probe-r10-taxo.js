'use strict';
/* Taxonomy law verifier: every taxonomy province letters somewhere on the
   ladder; "More pages" renders nowhere (chart DOM, all five tabs, tooltips). */
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const WANT = {
  cms: ['Getting Started','Features','Content APIs','Configurations','Development',
        'Plugins development','TypeScript','Command Line Interface','Upgrades'],
  cloud: ['Getting Started','Projects management','Advanced configuration','Deployments',
          'Account management','Command Line Interface']
};
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true');
  await page.waitForTimeout(300);

  /* 1) world.provinces carry exactly the taxonomy sections, nothing else */
  const provs = await page.evaluate(() => world.provinces.map(P => P.product + '|' + P.section + '|' + P.size));
  console.log('provinces (' + provs.length + '):'); provs.forEach(p => console.log('  ' + p));
  const bad = provs.filter(p => {
    const [prod, sec] = p.split('|');
    return !(WANT[prod] || []).includes(sec);
  });
  console.log('non-taxonomy province names:', bad.length ? bad : 'NONE');

  /* 2) sweep a zoom ladder over each continent and harvest every lettered land name */
  const seen = new Set();
  const conts = await page.evaluate(() => chart.geo.conts.map(c => ({ key: c.key, x: c.x, y: c.y })));
  const provPts = await page.evaluate(() => world.provinces.map(P => {
    const p = chartProject ? null : null; return null; }).filter(Boolean)).catch(() => []);
  async function harvest() {
    const t = await page.evaluate(() =>
      [...document.querySelectorAll('.cl-land')].map(e => e.textContent.trim()));
    t.forEach(x => seen.add(x.toUpperCase()));
  }
  for (const c of conts) {
    for (const z of [1.0, 1.6, 2.4, 3.4]) {
      await page.evaluate(([cx, cy, zz]) => {
        chart.zt = zz;
        chart.txt = 1400 / 2 - cx * zz;
        chart.tyt = 810 / 2 - cy * zz;
        chartClampTargets(); kickChartAnim();
      }, [c.x, c.y, z]);
      await page.waitForFunction('!chart.anim', null, { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(250);
      await harvest();
      /* pan the four quarters at this stop so wide continents are fully read */
      for (const [dx, dy] of [[-380, -240], [760, 0], [0, 480], [-760, 0]]) {
        await page.evaluate(([mx, my]) => {
          chart.txt += mx; chart.tyt += my; chartClampTargets(); kickChartAnim();
        }, [dx, dy]);
        await page.waitForFunction('!chart.anim', null, { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(160);
        await harvest();
      }
    }
  }
  const missing = [];
  for (const prod of Object.keys(WANT)) for (const sec of WANT[prod]) {
    /* AI holds no ground (all three pages offshore); CLI provinces are one page each */
    const hasProv = provs.some(p => p.startsWith(prod + '|' + sec + '|'));
    if (!hasProv) continue;
    if (!seen.has(sec.toUpperCase())) missing.push(prod + '|' + sec);
  }
  console.log('lettered land names harvested:', seen.size);
  console.log('province names never lettered on the sweep:', missing.length ? missing : 'NONE');

  /* 3) the banned phrase renders nowhere: chart + all tabs + register scroll */
  let banned = 0;
  for (const key of ['1', '2', '3', '4', '5']) {
    await page.keyboard.press(key);
    await page.waitForTimeout(250);
    const txt = await page.evaluate(() => document.body.innerText);
    if (/More pages/i.test(txt)) { banned++; console.log('BANNED PHRASE in tab', key); }
  }
  console.log('banned phrase "More pages" in any tab:', banned === 0 ? 'NONE' : banned);

  /* 4) tooltip datum sweep: hover 10 marks by real mouse, read the whole tip */
  await page.keyboard.press('1');
  await page.waitForTimeout(300);
  const pts = await page.evaluate(`(() => {
    const r = chart.cv.getBoundingClientRect();
    const S = r.width / 1400;
    const out = [];
    for (let i = 0; i < chart.marks.length && out.length < 10; i += 29) {
      const m = chart.marks[i];
      const x = (m.x * chart.z + chart.tx), y = (m.y * chart.z + chart.ty);
      if (x < 60 || x > 1340 || y < 60 || y > 750) continue;
      out.push({ x: r.left + x * S, y: r.top + y * S, slug: m.isle.slug });
    }
    return out;
  })()`);
  const tipTexts = [];
  for (const pt of pts) {
    await page.mouse.move(pt.x, pt.y);
    await page.waitForTimeout(140);
    const t = await page.evaluate(() => {
      const el = document.getElementById('charttip');
      return el && !el.hidden ? el.innerText.replace(/\n/g, ' | ') : null;
    });
    if (t) tipTexts.push(t);
  }
  console.log('tooltip samples:', tipTexts.length + '/' + pts.length);
  tipTexts.slice(0, 4).forEach(t => console.log('  ' + t.slice(0, 120)));
  console.log('banned in tooltips:', tipTexts.some(t => /More pages/i.test(t)) ? 'YES - FAIL' : 'NONE');

  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
