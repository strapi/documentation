/* pick gate re-test with true client coords + hover tooltip in both modes */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.waitForTimeout(700);

  const pts = await page.evaluate(() => {
    const r = chart.cv.getBoundingClientRect();
    const cli = m => ({
      x: r.left + (m.x * chart.z + chart.tx) * r.width / CHART_W,
      y: r.top + (m.y * chart.z + chart.ty) * r.height / CHART_H
    });
    let seen = null, unseen = null;
    for (const m of chart.marks) {
      if (fogHides(m.isle)) { if (!unseen) unseen = m; }
      else if (!seen) seen = m;
      if (seen && unseen) break;
    }
    return { seen: seen && { ...cli(seen), name: seen.isle.name },
             unseen: unseen && { ...cli(unseen), name: unseen.isle.name } };
  });

  /* hover the seen isle: the tooltip must name her */
  await page.mouse.move(pts.seen.x, pts.seen.y);
  await page.waitForTimeout(350);
  const tipSeen = await page.evaluate(() => {
    const t = document.getElementById('charttip');
    return { hidden: t.hidden, text: t.hidden ? '' : t.textContent.slice(0, 90) };
  });

  /* hover the fogged isle: no name may rise from under the fog */
  await page.mouse.move(pts.unseen.x, pts.unseen.y);
  await page.waitForTimeout(350);
  const tipUnseen = await page.evaluate(() => {
    const t = document.getElementById('charttip');
    return { hidden: t.hidden, text: t.hidden ? '' : t.textContent.slice(0, 60) };
  });

  /* lift the fog: the same water now answers the hand */
  await page.evaluate(() => window.__helm.fogMode('full'));
  await page.waitForTimeout(250);
  await page.mouse.move(pts.unseen.x, pts.unseen.y + 2);
  await page.mouse.move(pts.unseen.x, pts.unseen.y);
  await page.waitForTimeout(350);
  const tipFull = await page.evaluate(() => {
    const t = document.getElementById('charttip');
    return { hidden: t.hidden, text: t.hidden ? '' : t.textContent.slice(0, 90) };
  });

  console.log(JSON.stringify({ pts, tipSeen, tipUnseen, tipFull, errs }, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
