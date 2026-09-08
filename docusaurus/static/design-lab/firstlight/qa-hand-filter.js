/* QA: the One Euro filter must do the two things a moving average cannot do at
   once. It must be CALM on a still hand, and it must NOT LAG a fast one. A
   fixed smoothing constant forces a choice between them; this asserts we did
   not have to choose. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const srv = spawn('node', [path.join(__dirname, 'serve.js')]);
  const port = await new Promise((res, rej) => {
    srv.stdout.on('data', d => { const m = String(d).match(/PORT=(\d+)/); if (m) res(+m[1]); });
    setTimeout(() => rej(new Error('server timeout')), 5000);
  });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });

  const r = await page.evaluate(async () => {
    const { makeOneEuro } = await import('./hand/oneeuro.js');
    const out = {};

    // a hand held still at 0.5, with 3 mm of tremor at 60 Hz
    const still = makeOneEuro({});
    let noisy = 0, smooth = 0, prev = null;
    for (let i = 0; i < 180; i++) {
      const t = i / 60;
      const raw = 0.5 + (Math.sin(i * 2.3) * 0.003);
      const f = still.filter(raw, t);
      if (i > 60) { noisy += Math.abs(raw - 0.5); smooth += Math.abs(f - 0.5); }
      prev = f;
    }
    out.tremorKept = smooth / noisy;

    // a hand crossing the frame in 250 ms: how far behind is the filter at the end?
    const fast = makeOneEuro({});
    let last = 0;
    for (let i = 0; i <= 15; i++) {
      const t = i / 60;
      last = fast.filter(i / 15, t);
    }
    out.lagAtEnd = Math.abs(1 - last);
    return out;
  });

  const fails = [];
  if (!(r.tremorKept < 0.35)) fails.push(`a still hand kept ${(r.tremorKept * 100).toFixed(0)}% of its tremor, wanted under 35%`);
  if (!(r.lagAtEnd < 0.08)) fails.push(`a fast hand ended ${(r.lagAtEnd * 100).toFixed(1)}% behind, wanted under 8%`);
  console.log(`  tremor kept ${(r.tremorKept * 100).toFixed(0)}%   lag at end ${(r.lagAtEnd * 100).toFixed(1)}%`);
  console.log(fails.length ? '  FAIL\n    ' + fails.join('\n    ') : '  PASS');
  await browser.close(); srv.kill();
  process.exit(fails.length ? 1 : 0);
})();
