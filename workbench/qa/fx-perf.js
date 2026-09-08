/* What the chain costs, measured on one page by switching it in and out
   mid-walk so the two figures share a machine, a thermal state and a route. */
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const ROUTE = [[-30,0],[-10,4],[16,2],[40,-10],[64,-4],[92,-14],[130,-22],[176,-28]];
(async () => {
  const b = await chromium.launch({ headless: true, args: ['--use-angle=metal'] });
  for (const dpr of [1, 2]) {
    const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
    const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto('http://127.0.0.1:7801/goldenshore/?dpr=' + dpr + '&fx=1', { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__ready === true, { timeout: 90000 }).catch(()=>{});
    await p.waitForTimeout(3500);
    const run = async (label, bypass, fx) => {
      await p.evaluate((b2) => window.__world.fxBypass(b2), bypass);
      if (fx) await p.evaluate((o) => window.__world.setFx(o), fx);
      await p.evaluate(() => window.__world.walkAgain());
      await p.evaluate(() => window.__perfReset && window.__perfReset());
      await p.evaluate(async (r) => window.__world.walk(r, 11000), ROUTE);
      await p.waitForTimeout(11600);
      const m = await p.evaluate(() => window.__perf());
      console.log('  dpr ' + dpr + '  ' + label.padEnd(12) + 'p50 ' + m.p50.toFixed(1) + ' ms   p95 ' + m.p95.toFixed(1) + ' ms   (' + m.samples + ' frames)');
      return m;
    };
    const off  = await run('chain off',  true);
    const bare = await run('output only', false, { gtao: false, bloom: false });
    const bl   = await run('+ bloom',     false, { gtao: false, bloom: true  });
    const ao   = await run('+ gtao',      false, { gtao: true,  bloom: false });
    const both = await run('+ both',      false, { gtao: true,  bloom: true  });
    const c = (m) => (m.p95 - off.p95).toFixed(1);
    console.log('  dpr ' + dpr + '  costs at p95: round trip ' + c(bare) + ' ms, bloom ' + (bl.p95-bare.p95).toFixed(1)
      + ' ms, gtao ' + (ao.p95-bare.p95).toFixed(1) + ' ms, all of it ' + c(both) + ' ms   budget 16.7');
    console.log('  errors: ' + (errs.length ? errs[0] : 'none') + '\n');
    await p.close();
  }
  await b.close();
})();
