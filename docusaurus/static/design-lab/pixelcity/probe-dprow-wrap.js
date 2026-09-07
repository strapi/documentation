const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const HINTS = [
  'THE CART IS LOADED FOR THE COAST ROAD WEST · A LAMP FOR EVERY PAGE',
  'The lamplighter is leaving now, while the light lasts',
  'PRESSED FLOWERS IN THE WINDOW · EVERY LEAF KEPT',
  'THE DOME SLEEPS TILL DARK'
];
(async () => {
  const b = await chromium.launch({ headless: true, args: ['--use-angle=metal'] });
  const page = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })).newPage();
  await page.goto('http://127.0.0.1:7801/pixelcity/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const r = await page.evaluate((hints) => {
    const dp = document.getElementById('doorprompt');
    const rows = document.getElementById('dp-rows');
    const title = document.getElementById('dp-title');
    if (!dp || !rows) return { err: 'prompt not found' };
    dp.hidden = false;
    dp.style.left = '50%'; dp.style.top = '60%';
    title.textContent = "· THE LAMPLIGHTER'S YARD";
    rows.innerHTML = hints.map(h => '<div class="dp-row dp-plain">' + h + '</div>').join('');
    const out = [];
    [...rows.children].forEach((el, i) => {
      out.push({ i, text: hints[i].slice(0, 26),
        clippedX: el.scrollWidth > el.clientWidth + 1,
        clippedY: el.scrollHeight > el.clientHeight + 1,
        h: Math.round(el.getBoundingClientRect().height) });
    });
    const box = dp.getBoundingClientRect();
    return { rows: out, boxW: Math.round(box.width), boxH: Math.round(box.height),
      boxClipped: dp.scrollWidth > dp.clientWidth + 1 || dp.scrollHeight > dp.clientHeight + 1 };
  }, HINTS);
  if (r.err) { console.log('  ' + r.err); await b.close(); process.exit(1); }
  let bad = 0;
  r.rows.forEach(x => {
    const okk = !x.clippedX && !x.clippedY; if (!okk) bad++;
    console.log('  ' + (okk ? 'PASS ' : 'FAIL ') + '"' + x.text + '..."  height ' + x.h + 'px');
  });
  console.log('  ' + (r.boxClipped ? 'FAIL ' : 'PASS ') + 'the box itself clips nothing   [' + r.boxW + 'x' + r.boxH + ']');
  await page.locator('#doorprompt').screenshot({ path: '/private/tmp/claude-501/-Users-piwi-code-documentation/0d8629c6-231f-4fec-94af-6fe3669d37b8/scratchpad/qa/dprow-after.png' });
  await b.close();
  process.exit(bad || r.boxClipped ? 1 : 0);
})();
