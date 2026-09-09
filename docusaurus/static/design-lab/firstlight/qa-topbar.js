/* QA: THE TOP BAR FITS. Every control in it is reachable at every width this
   world is likely to be opened at.

   Written because the bar quietly stopped fitting the day HAND CONTROL was
   added to it: at 1280 it wanted 1357 pixels, so 77 pixels of it stood off
   the right edge of the screen, and the controls that fell off were the ones
   at that end. Nothing measured the bar, so nothing said a word. The way home
   to the Design Lab has to go in this same bar, which is why this exists
   before that does.

   It asserts three things at each width:
     - the bar does not overflow: scrollWidth never exceeds clientWidth;
     - every control is fully inside the viewport, right edge included;
     - the search box keeps a usable width, since a flex row under pressure
       pays for itself by crushing the one item that can shrink.
   Driven with no camera and no gestures: this is layout only. */

'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');

/* The widths that matter: a 13 inch laptop at its default scale, the two
   common 1366 and 1440 panels, a 1512 (14 inch) and a 1728 (16 inch), and
   1920. 1280 is the one that was broken. */
const WIDTHS = [1280, 1366, 1440, 1512, 1600, 1728, 1920];
const MIN_SEARCH = 90;

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise((res, rej) => {
    srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); });
    setTimeout(() => rej(new Error('server timeout')), 5000);
  });
  const browser = await chromium.launch();
  const fails = [];
  const rows = [];

  for (const w of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__diag && window.__diag.state !== 'boot', { timeout: 15000 });
    await page.waitForTimeout(600);

    const m = await page.evaluate(() => {
      const bar = document.getElementById('topbar');
      const out = { want: bar.scrollWidth, have: bar.clientWidth, over: [], search: 0 };
      const vw = document.documentElement.clientWidth;
      for (const el of bar.children) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;      /* display:none by design */
        if (r.right > vw + 0.5 || r.left < -0.5) {
          out.over.push((el.id || el.className || el.tagName) + ' to ' + Math.round(r.right));
        }
      }
      const q = document.getElementById('q');
      out.search = q ? Math.round(q.getBoundingClientRect().width) : 0;
      return out;
    });
    await page.close();

    rows.push({ w, ...m });
    if (m.want > m.have) fails.push(`at ${w}: the bar wants ${m.want}px in ${m.have}px, ${m.want - m.have}px off the edge`);
    if (m.over.length) fails.push(`at ${w}: outside the viewport: ${m.over.join(', ')}`);
    if (m.search < MIN_SEARCH) fails.push(`at ${w}: the search box is crushed to ${m.search}px, floor is ${MIN_SEARCH}px`);
  }

  await browser.close(); srv.kill();
  for (const r of rows) {
    console.log(`  ${String(r.w).padStart(5)}  wants ${String(r.want).padStart(5)} in ${String(r.have).padStart(5)}`
      + `   search ${String(r.search).padStart(4)}px` + (r.over.length ? '   OFF: ' + r.over.join(', ') : ''));
  }
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
