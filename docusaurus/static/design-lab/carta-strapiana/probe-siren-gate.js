const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const R = [];
const ok = (c, l, x) => R.push((c ? '  PASS  ' : '  FAIL  ') + l + (x !== undefined ? '   [' + x + ']' : ''));
(async () => {
  const b = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--autoplay-policy=no-user-gesture-required'] });
  const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('http://127.0.0.1:7801/cartastrapiana/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 45000 }).catch(() => {});
  await page.mouse.click(700, 500);                 // a gesture, so audio may wake
  await page.waitForTimeout(2500);

  const s0 = await page.evaluate(() => {
    const S = window.__helmSound;
    return S ? { has: true, quietMs: S.sirenQuietMs, quietPages: S.sirenQuietPages,
      gate: S.sirenGate(), pages: S.sirenPages ? S.sirenPages.size : 0,
      amb: S.amb ? +S.amb.gain.value.toFixed(3) : null,
      lure: S.sirens && S.sirens.lureG ? +S.sirens.lureG.gain.value.toFixed(4) : null,
      home: S.sirens ? S.sirens.homePlaying : null } : { has: false };
  });
  ok(s0.has, 'the sound object is reachable');
  ok(s0.quietMs === 240000 && s0.quietPages === 4, 'the quiet opening is 4 minutes and 4 pages', s0.quietMs + 'ms / ' + s0.quietPages + 'p');
  ok(s0.gate === false, 'the gate is SHUT on arrival', 'pages ' + s0.pages);
  ok(s0.lure === null || s0.lure === 0, 'the lure is silent on arrival', 'gain ' + s0.lure);
  ok(s0.home === false || s0.home === null, 'no song on arrival', 'homePlaying ' + s0.home);
  ok(s0.amb === null || s0.amb === 1, 'the ambient bus rests at 1', s0.amb);

  /* time alone must not open it */
  const s1 = await page.evaluate(() => {
    const S = window.__helmSound; S.sirenQuietMs = 10;     // pretend four minutes have passed
    return { gate: S.sirenGate(), pages: S.sirenPages ? S.sirenPages.size : 0 };
  });
  ok(s1.gate === false, 'time alone does NOT open the gate (pages still short)', 'pages ' + s1.pages);

  /* three pages must not open it either */
  const s2 = await page.evaluate(() => {
    const S = window.__helmSound;
    ['a', 'b', 'c'].forEach(k => S.sirenPageRead({ slug: k }));
    return { gate: S.sirenGate(), pages: S.sirenPages.size };
  });
  ok(s2.gate === false && s2.pages === 3, 'three pages do NOT open the gate', 'pages ' + s2.pages);

  /* the fourth opens it */
  const s3 = await page.evaluate(() => {
    const S = window.__helmSound;
    S.sirenPageRead({ slug: 'd' });
    S.sirenPageRead({ slug: 'd' });     // the same page twice counts once
    return { gate: S.sirenGate(), pages: S.sirenPages.size };
  });
  ok(s3.gate === true && s3.pages === 4, 'the fourth page opens the gate, and a re-read counts once', 'pages ' + s3.pages);

  /* the ambient bus leans away while the song is sung */
  const s4 = await page.evaluate(async () => {
    const S = window.__helmSound;
    if (!S.sirens) return { skip: 'no siren audio loaded' };
    const st = S.ctx ? S.ctx.state : 'no ctx';
    if (S.ctx && S.ctx.state === 'suspended') { try { await S.ctx.resume(); } catch (e) {} }
    S.sirens.homePlaying = true;
    S.sirenTick(0.5); S.sirenTick(0.5);
    await new Promise(r => setTimeout(r, 1800));   /* the ramp is exponential: let it travel */
    const ducked = S.amb ? S.amb.gain.value : null;
    S.sirens.homePlaying = false;
    S.sirenKill();
    await new Promise(r => setTimeout(r, 1500));
    return { st, ctxNow: S.ctx ? S.ctx.state : null, ducked, restored: S.amb ? S.amb.gain.value : null };
  });
  if (s4.skip) R.push('  SKIP  ambient duck (' + s4.skip + ')');
  else {
    ok(s4.ducked !== null && s4.ducked < 0.6, 'the ambient bus steps back for the song',
       'ctx ' + s4.st + '->' + s4.ctxNow + ', gain ' + (s4.ducked === null ? 'n/a' : s4.ducked.toFixed(3)));
    ok(s4.restored !== null && s4.restored > 0.6, 'and comes back up after',
       'gain ' + (s4.restored === null ? 'n/a' : s4.restored.toFixed(3)));
  }
  ok(errs.length === 0, 'zero console or page errors', errs.slice(0, 2).join(' | ') || 'none');
  console.log(R.join('\n'));
  await b.close();
  process.exit(R.some(x => x.startsWith('  FAIL')) ? 1 : 0);
})();
