/* Back-to-back A/B: the pre-round build against this one, same machine, same minute,
   alternating so drift cannot favour either. Judge's kill criteria: avg fps >= 55,
   frame p95 <= 18 ms over the 60 s scripted crossing. */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const SECS = parseInt(process.argv[2] || '60', 10);
const PASSES = parseInt(process.argv[3] || '2', 10);

const SCRIPT = [
  [7000, () => window.__helm.order(20)],
  [15000, () => window.__helm.order(-30)],
  [20000, () => window.__helm.raiseSpyglass(true)],
  [27000, () => window.__helm.raiseSpyglass(false)],
  [33000, () => window.__helm.order(15)],
  [41000, () => window.__helm.raiseSpyglass(true)],
  [48000, () => window.__helm.raiseSpyglass(false)],
  [53000, () => window.__helm.order(-12)]
];

async function run(browser, url, label) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(url + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  // an independent sampler, not the build's own accounting
  await page.evaluate(() => {
    window.__qa = { s: [], last: 0, on: true };
    const loop = t => { if (window.__qa.last) window.__qa.s.push(t - window.__qa.last); window.__qa.last = t; if (window.__qa.on) requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  });
  await page.evaluate(() => {
    window.__helm.setState({ distNm: 7.5, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.0 });
    window.__helm.resetSamples();
    window.__qa.s.length = 0; window.__qa.last = 0;
  });
  const t0 = Date.now();
  for (const [at, fn] of SCRIPT) {
    if (at > SECS * 1000) break;
    const wait = at - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
    await page.evaluate(fn);
  }
  const rest = SECS * 1000 - (Date.now() - t0);
  if (rest > 0) await page.waitForTimeout(rest);
  const r = await page.evaluate(() => {
    window.__qa.on = false;
    const st = a => {
      const s = a.slice().sort((x, y) => x - y);
      const p = q => s[Math.min(s.length - 1, Math.floor(q * s.length))];
      const sum = s.reduce((x, y) => x + y, 0);
      return { n: s.length, avgMs: +(sum / s.length).toFixed(2), fps: +(1000 / (sum / s.length)).toFixed(1),
               p50: +p(0.5).toFixed(2), p95: +p(0.95).toFixed(2), p99: +p(0.99).toFixed(2), worst: +s[s.length - 1].toFixed(2) };
    };
    return { indep: st(window.__qa.s), build: st(window.__helmDiag.samples) };
  });
  await page.close();
  console.log(label.padEnd(8), 'independent sampler', JSON.stringify(r.indep));
  console.log(label.padEnd(8), 'build sampler      ', JSON.stringify(r.build), errs.length ? 'ERRORS ' + JSON.stringify(errs) : '');
  return r;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const A = 'http://127.0.0.1:8124/index.html';   // before
  const B = 'http://127.0.0.1:8123/index.html';   // after
  const out = { before: [], after: [] };
  for (let pass = 1; pass <= PASSES; pass++) {
    console.log('--- pass ' + pass + (pass % 2 ? ' (before first)' : ' (after first)'));
    if (pass % 2) {
      out.before.push(await run(browser, A, 'BEFORE'));
      out.after.push(await run(browser, B, 'AFTER'));
    } else {
      out.after.push(await run(browser, B, 'AFTER'));
      out.before.push(await run(browser, A, 'BEFORE'));
    }
  }
  const pick = (arr, k) => arr.map(r => r.indep[k]);
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  console.log('SUMMARY p95  before', JSON.stringify(pick(out.before, 'p95')), ' after', JSON.stringify(pick(out.after, 'p95')));
  console.log('SUMMARY avg  before', JSON.stringify(pick(out.before, 'avgMs')), ' after', JSON.stringify(pick(out.after, 'avgMs')));
  console.log('SUMMARY fps  before', JSON.stringify(pick(out.before, 'fps')), ' after', JSON.stringify(pick(out.after, 'fps')));
  console.log('MEDIAN  p95  before', med(pick(out.before, 'p95')), ' after', med(pick(out.after, 'p95')));
  console.log('MEDIAN  p50  before', med(pick(out.before, 'p50')), ' after', med(pick(out.after, 'p50')));
  console.log('BEST    p95  before', Math.min(...pick(out.before, 'p95')), ' after', Math.min(...pick(out.after, 'p95')));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
