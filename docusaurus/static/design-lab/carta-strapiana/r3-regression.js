/* ROUND 3 regression: everything GATE-0 and the finish round measured,
   re-measured against this build, plus the new round's own contracts.
   Usage: node r3-regression.js <port> <label> */
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const PORT = process.argv[2] || '8123', LABEL = process.argv[3] || 'r3';
const BASE = `http://127.0.0.1:${PORT}/index.html`;
const out = { label: LABEL, port: PORT };

(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(1500);

  out.data = await page.evaluate(() => window.__helmDiag.data);
  console.log('DATA', JSON.stringify(out.data));

  /* helm mass: a 90 degree order */
  await page.evaluate(() => window.__helm.setState({ distNm: 6.0, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.2 }));
  await page.waitForTimeout(2500);
  out.helm = await page.evaluate(async () => {
    const b0 = window.__helmDiag.bearing;
    const t0 = performance.now();
    window.__helm.order(90);
    const s = [];
    await new Promise(res => {
      const loop = () => {
        const t = (performance.now() - t0) / 1000;
        s.push([+t.toFixed(3), window.__helmDiag.bearing, window.__helmDiag.orderedBearing]);
        if (t < 15) requestAnimationFrame(loop); else res();
      };
      requestAnimationFrame(loop);
    });
    const rel = s.map(([t, b, o]) => [t, b - b0, o - b0]);
    let dead = null;
    for (const [t, d] of rel) if (Math.abs(d) > 1.5) { dead = t; break; }
    let peak = 0;
    for (let i = 6; i < rel.length; i++) { const dt = rel[i][0] - rel[i - 6][0]; if (dt > 0) { const r = Math.abs(rel[i][1] - rel[i - 6][1]) / dt; if (r > peak) peak = r; } }
    const at = tt => { let best = rel[0]; for (const r of rel) if (Math.abs(r[0] - tt) < Math.abs(best[0] - tt)) best = r; return +best[1].toFixed(2); };
    return { deadTimeTo1_5deg: +dead.toFixed(3), peakTurnRateDegPerS: +peak.toFixed(2), at0_6s: at(0.6), at1_0s: at(1.0), at3s: at(3), at14s: at(14) };
  });
  console.log('HELM', JSON.stringify(out.helm));

  /* rolling sea percentages (the judge's own motion diff, same window) */
  async function motion(sail, knots) {
    await page.evaluate(o => window.__helm.setState({ distNm: 2.0, sail: o.sail, hour: 'afternoon', spyglass: false, knots: o.knots }), { sail, knots });
    await page.waitForTimeout(1400);
    return page.evaluate(async () => {
      const cv = document.getElementById('sea'), g = cv.getContext('2d');
      const y0 = Math.floor(cv.height * 0.40), h = Math.floor(cv.height * 0.22);
      const a = g.getImageData(0, y0, cv.width, h).data.slice();
      await new Promise(r => setTimeout(r, 300));
      const b = g.getImageData(0, y0, cv.width, h).data;
      let diff = 0; const n = a.length / 4;
      for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) > 8 || Math.abs(a[i + 1] - b[i + 1]) > 8) diff++;
      return +(100 * diff / n).toFixed(2);
    });
  }
  out.motionFullSail = await motion('full', 8.2);
  out.motionAtRest = await motion('rest', 0);
  console.log('MOTION full/rest', out.motionFullSail, out.motionAtRest);

  /* points of sailing */
  /* Points of sailing. The published probe gave the helm 9 s to come 180 deg
     round, which a hull with mass cannot do: whatever it measured, it measured
     mid-turn, which is why the published ratio wandered. Both settles are
     reported: 9 s for continuity with the earlier record, 30 s for the real
     polar, and the same script run against the previous build gives the same
     pair of numbers. */
  out.polar = await page.evaluate(async () => {
    const settle = async (deg, wait) => {
      window.__helm.setState({ distNm: 5.0, sail: 'full', hour: 'afternoon', spyglass: false });
      window.__helm.order(deg - window.__helmDiag.bearing);
      await new Promise(r => setTimeout(r, wait));
      return { bearing: +window.__helmDiag.bearing.toFixed(1), knots: +window.__helmDiag.knots.toFixed(2), polarFactor: +window.__helmDiag.polarFactor.toFixed(3) };
    };
    const w = window.__helmDiag.windDeg;
    const d9 = await settle(w, 9000), u9 = await settle(w + 180, 9000);
    const d30 = await settle(w, 30000), u30 = await settle(w + 180, 30000);
    return { settle9: { down: d9, up: u9, ratio: +(d9.knots / u9.knots).toFixed(2) },
             settle30: { down: d30, up: u30, ratio: +(d30.knots / u30.knots).toFixed(2) } };
  });
  console.log('POLAR', JSON.stringify(out.polar));

  /* spyglass resolve */
  out.spyglass = await page.evaluate(async () => {
    window.__helm.setState({ distNm: 1.8, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.2 });
    await new Promise(r => setTimeout(r, 1200));
    const bare = { lod: window.__helmDiag.lod };
    window.__helm.raiseSpyglass(true);
    await new Promise(r => setTimeout(r, 1400));
    const raised = { lod: window.__helmDiag.lod, spyglass: window.__helmDiag.spyglass };
    window.__helm.raiseSpyglass(false);
    await new Promise(r => setTimeout(r, 700));
    return { bare, raised };
  });
  console.log('SPYGLASS', JSON.stringify(out.spyglass));

  /* leadsman */
  await page.evaluate(() => window.__helm.setState({ distNm: 1.45, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.2 }));
  let leadText = null, leadDist = null;
  for (let i = 0; i < 50; i++) {
    await page.waitForTimeout(400);
    const t = await page.evaluate(() => document.getElementById('caption').textContent);
    if (t && t.includes('By the deep')) { leadText = t; leadDist = await page.evaluate(() => window.__helmDiag.distNm); break; }
  }
  out.leadsman = { text: leadText, distNm: leadDist != null ? +leadDist.toFixed(3) : null };
  console.log('LEADSMAN', JSON.stringify(out.leadsman));

  /* the name on screen: no codename survivor anywhere in the served DOM */
  out.name = await page.evaluate(() => {
    const txt = document.body.innerText;
    const html = document.documentElement.outerHTML;
    const hit = /dead[\s-]?reckoning/i;
    return { title: document.title, cardShown: !!document.querySelector('#plate-title .pt-main'),
      cardText: (document.querySelector('#plate-title .pt-main') || {}).textContent,
      codenameInText: hit.test(txt), codenameInHTML: hit.test(html.replace(/deadreckoning\.(js|css)/g, '')) };
  });
  console.log('NAME', JSON.stringify(out.name));

  /* the new round's own contracts */
  out.landfall = await page.evaluate(async () => {
    if (!window.__helm.open) return { notInThisBuild: true };
    const t0 = performance.now();
    window.__helm.open('/cms/api/document-service');
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    return { wallMs: +(performance.now() - t0).toFixed(1), reportedMs: window.__helmDiag.landfallMs,
      chars: document.getElementById('pagepaper').textContent.length,
      blocks: document.querySelectorAll('#pagepaper > *').length };
  });
  console.log('LANDFALL', JSON.stringify(out.landfall));
  await page.evaluate(() => { if (window.__helm.onDeck) window.__helm.onDeck(); });
  await page.waitForTimeout(2500);

  /* frame p95 over a 60 s scripted crossing */
  await page.evaluate(() => { window.__helm.setState({ distNm: 7.5, sail: 'full', hour: 'afternoon', spyglass: false, knots: 8.0 }); window.__helm.resetSamples(); });
  const t0 = Date.now();
  const script = [[8000, 18], [16000, -24], [34000, 12], [52000, -10]];
  const glass = [[20000, true], [26000, false], [42000, true], [48000, false]];
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(1000);
    const el = Date.now() - t0;
    for (const [at, deg] of script) if (el >= at && el < at + 1000) await page.evaluate(d => window.__helm.order(d), deg);
    for (const [at, on] of glass) if (el >= at && el < at + 1000) await page.evaluate(o => window.__helm.raiseSpyglass(o), on);
  }
  out.perf = await page.evaluate(() => {
    const s = window.__helmDiag.samples.slice().sort((a, b) => a - b);
    const p = q => s[Math.floor(q * s.length)];
    const sum = s.reduce((a, b) => a + b, 0);
    return { n: s.length, avgFps: +(1000 / (sum / s.length)).toFixed(1), p50: +p(0.5).toFixed(2), p95: +p(0.95).toFixed(2), p99: +p(0.99).toFixed(2),
      spriteCache: window.__helmDiag.spriteCache || null, spriteMB: window.__helmDiag.spriteMB || null,
      inSight: window.__helmDiag.inSight == null ? 1 : window.__helmDiag.inSight };
  });
  console.log('PERF', JSON.stringify(out.perf));

  /* reduced motion: becalmed, instant helm, zero sea pixels moving */
  await page.goto(BASE + '?scale=1&rm=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(1400);
  out.reduced = await page.evaluate(async () => {
    const cv = document.getElementById('sea'), g = cv.getContext('2d');
    const y0 = Math.floor(cv.height * 0.45), h = Math.floor(cv.height * 0.30);
    const a = g.getImageData(0, y0, cv.width, h).data.slice();
    await new Promise(r => setTimeout(r, 1200));
    const b = g.getImageData(0, y0, cv.width, h).data;
    let diff = 0;
    for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1]) diff++;
    window.__helm.order(35);
    await new Promise(r => setTimeout(r, 400));
    const d = window.__helmDiag;
    return { becalmed: d.becalmed, pixelsChanged: diff, ofPixels: a.length / 4,
      instantHelm: Math.abs(((d.bearing - d.orderedBearing + 540) % 360) - 180) < 0.5 };
  });
  console.log('REDUCED', JSON.stringify(out.reduced));

  out.consoleErrors = errs;
  console.log('ERRORS', errs.length ? JSON.stringify(errs) : 'none');
  fs.writeFileSync(path.join(__dirname, 'iterlog', `regression-${LABEL}.json`), JSON.stringify(out, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
