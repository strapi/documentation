const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--autoplay-policy=no-user-gesture-required'] });
  const p = await (await b.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:7801/longway/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(5200);
  await p.mouse.click(700, 500); await p.waitForTimeout(1200);
  const measure = await p.evaluate(async (which) => {
    const an = AUD.sfx.an, c = AUD.ctx;
    const bins = new Uint8Array(an.frequencyBinCount);
    const hzPerBin = c.sampleRate / 2 / an.frequencyBinCount;
    const sample = async (fire, ms) => {
      let peakHz = 0, peakVal = 0, energy = 0;
      fire();
      const t0 = performance.now();
      while (performance.now() - t0 < ms) {
        an.getByteFrequencyData(bins);
        let bi = 0, bv = 0, e = 0;
        for (let i = 2; i < bins.length; i++) { e += bins[i]; if (bins[i] > bv) { bv = bins[i]; bi = i; } }
        if (bv > peakVal) { peakVal = bv; peakHz = Math.round(bi * hzPerBin); }
        energy = Math.max(energy, e / bins.length);
        await new Promise(r => requestAnimationFrame(r));
      }
      return { peakHz, peakVal, energy: Math.round(energy * 10) / 10 };
    };
    const whistle = await sample(() => audEv('whistle', S.x), 800);
    await new Promise(r => setTimeout(r, 700));
    const bark = await sample(() => audEv('dogbark', S.x), 600);
    await new Promise(r => setTimeout(r, 500));
    const thunder2 = await sample(() => audEv('thunder', S.x, 3), 1500);
    await new Promise(r => setTimeout(r, 400));
    const thunder1 = await sample(() => audEv('thunder', S.x, 1), 1500);
    return { whistle, bark, thunder1, thunder2 };
  });
  const m = measure;
  console.log('  whistle   peak ' + String(m.whistle.peakHz).padStart(5) + ' Hz   level ' + m.whistle.peakVal + '   (a finger whistle lives 1500-2700)');
  console.log('  bark      peak ' + String(m.bark.peakHz).padStart(5) + ' Hz   level ' + m.bark.peakVal + '   (a bark lives 300-2000)');
  console.log('  thunder   x1 level ' + m.thunder1.peakVal + ' energy ' + m.thunder1.energy + '   |   x3 level ' + m.thunder2.peakVal + ' energy ' + m.thunder2.energy);
  console.log('  errors: ' + (errs.length ? errs[0] : 'none'));
  await b.close();
})();
