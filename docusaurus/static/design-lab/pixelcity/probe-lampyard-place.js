const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch({ headless: true, args: ['--use-angle=metal'] });
  const rows = [];
  for (const day of ['', '?day=2', '?day=40', '?day=120', '?day=300']) {
    const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto('http://127.0.0.1:7801/pixelcity/' + day, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4200);
    const r = await page.evaluate(() => {
      const d = window.__pdcDebug;
      if (!d || !d.spots) return { err: 'no debug hook' };
      const by = {};
      d.spots.forEach(s => { by[s.kind] = { ix: s.ix, iy: s.iy }; });
      const l = by.lampyard, s = by.sloop;
      return { spots: d.spots.length, kinds: d.spots.map(x => x.kind).join(','),
        lampyard: l, sloop: s,
        dist: (l && s) ? +Math.hypot(l.ix - s.ix, l.iy - s.iy).toFixed(1) : null };
    });
    rows.push({ day: day || '(default)', ...r, errs: errs.length });
    await page.context().close();
  }
  rows.forEach(r => {
    if (r.err) return console.log('  ' + r.day.padEnd(11) + r.err);
    const okd = r.dist !== null && r.dist <= 12;
    console.log('  ' + (okd ? 'PASS ' : 'FAIL ') + r.day.padEnd(11) +
      'yard-to-sloop ' + String(r.dist).padStart(5) + ' tiles   ' + r.spots + ' portals   errs ' + r.errs);
  });
  const bad = rows.filter(r => r.err || r.dist === null || r.dist > 12 || r.errs);
  console.log(bad.length ? '  => ' + bad.length + ' town(s) failed' : '  => every town places the yard within sight of the sloop');
  await b.close();
  process.exit(bad.length ? 1 : 0);
})();
