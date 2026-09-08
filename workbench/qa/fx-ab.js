/* The airtight A/B: ONE page, one sun, one frame state, the composer switched
   in and out between two shots. Two page loads cannot settle this world,
   because its sun moves and two loads are never at the same hour, which is
   exactly the confound that produced the "flat and grey" verdict earlier. */
const fs = require('fs');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const OUT = '/private/tmp/claude-501/-Users-piwi-code-documentation/0d8629c6-231f-4fec-94af-6fe3669d37b8/scratchpad/qa/fx/';
const VANTAGES = [[-8, 7.5, 52, 0.03, -0.09], [40, 3.0, -18, 1.6, -0.04], [180, 34, -28, 2.9, -0.06]];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ headless: true, args: ['--use-angle=metal'] });
  const reader = await (await b.newContext()).newPage();
  await reader.goto('data:text/html,<canvas id=c>');
  const stats = async (file) => reader.evaluate(async (b64) => {
    const img = new Image();
    await new Promise((r) => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });
    const c = document.getElementById('c'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, img.width, img.height).data;
    let R=0,G=0,B=0,sat=0,n=0;
    for (let i=0;i<d.length;i+=4){ const r=d[i],g2=d[i+1],b2=d[i+2];
      R+=r;G+=g2;B+=b2; const mx=Math.max(r,g2,b2),mn=Math.min(r,g2,b2); sat+=mx?(mx-mn)/mx:0; n++; }
    return { L:+(((R+G+B)/3)/n).toFixed(1), sat:+(sat/n).toFixed(3), warm:+(((R-B)/n)).toFixed(1) };
  }, fs.readFileSync(file).toString('base64'));

  const p = await (await b.newContext({ viewport: { width: 1000, height: 600 } })).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:7801/goldenshore/?dpr=1&fx=1', { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__ready === true, { timeout: 90000 }).catch(()=>{});
  await p.waitForTimeout(3200);
  /* freeze the sun so even the seconds between the two shots cannot move it */
  await p.evaluate(() => window.__world.sun(window.__world.sunNow()));
  console.log('  vantage            chain        L      sat    warmth');
  for (let i = 0; i < VANTAGES.length; i++) {
    await p.evaluate((v) => window.__world.fly(v[0], v[1], v[2], v[3], v[4]), VANTAGES[i]);
    await p.waitForTimeout(1500);
    /* four states on the SAME frame, so each pass is isolated honestly */
    const take = async (tag, prep) => {
      if (prep) await p.evaluate(prep); await p.waitForTimeout(650);
      const f = OUT + 'v' + i + '-' + tag + '.png';
      await p.screenshot({ path: f }); return stats(f);
    };
    const off  = await take('off',  () => window.__world.fxBypass(true));
    await p.evaluate(() => window.__world.fxBypass(false));
    const both = await take('both', () => window.__world.setFx({ gtao: true,  bloom: true  }));
    const noAo = await take('bloom',() => window.__world.setFx({ gtao: false, bloom: true  }));
    const noBl = await take('gtao', () => window.__world.setFx({ gtao: true,  bloom: false }));
    await p.evaluate(() => window.__world.setFx({ gtao: true, bloom: true }));
    const row = (t, s) => '  ' + ('v'+i+' '+t).padEnd(18) + String(s.L).padStart(6) + String(s.sat).padStart(9) + String(s.warm).padStart(9)
      + (t === 'off' ? '' : '    ' + (s.L>=off.L?'+':'') + (((s.L/off.L)-1)*100).toFixed(1) + '% light, '
      + (s.sat>=off.sat?'+':'') + (((s.sat/off.sat)-1)*100).toFixed(1) + '% sat');
    console.log(row('off', off)); console.log(row('bloom only', noAo));
    console.log(row('gtao only', noBl)); console.log(row('both', both));
  }
  console.log('  errors: ' + (errs.length ? errs[0] : 'none'));
  await b.close();
})();
