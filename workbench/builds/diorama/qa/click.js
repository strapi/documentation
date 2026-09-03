const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', e => console.log('PAGEERROR', String(e).slice(0,200)));
  await p.goto('http://127.0.0.1:8971/', { waitUntil: 'load' });
  await p.waitForFunction(() => window.__city && window.__city.count() > 0);
  await p.click('#btnWide'); await p.waitForTimeout(1500); await p.evaluate(() => { window.__city.home(); window.__city.still(); });
  // sweep the canvas for hits
  const hits = await p.evaluate(() => {
    window.__city.paint();
    const out = new Set();
    for (let y = 120; y < 760; y += 24) for (let x = 60; x < 1380; x += 24) {
      const s = window.__city.pickAt(x, y);
      if (s) out.add(s);
    }
    return [...out];
  });
  console.log('distinct buildings hit by a 24px grid sweep:', hits.length);
  // click one for real
  const before = await p.evaluate(() => location.hash);
  const target = await p.evaluate(() => {
    for (let y = 200; y < 700; y += 7) for (let x = 200; x < 1200; x += 7) {
      const s = window.__city.pickAt(x, y);
      if (s && s !== location.hash.slice(1)) return { x, y, s };
    }
    return null;
  });
  const off = await p.evaluate(() => { const r = document.querySelector('#city').getBoundingClientRect(); return { x: r.left, y: r.top }; });
  if (target) {
    await p.mouse.click(target.x + off.x, target.y + off.y);
    await p.waitForTimeout(400);
    const after = await p.evaluate(() => ({ hash: location.hash, title: document.title, chars: document.querySelector('#doc').innerText.length }));
    console.log('clicked', target.s, '->', JSON.stringify(after), 'changed:', after.hash !== before);
  } else console.log('no pick target found');
  // tooltip on hover
  await p.mouse.move(target.x + off.x, target.y + off.y + 2);
  await p.waitForTimeout(200);
  console.log('tooltip:', await p.evaluate(() => document.querySelector('#tip').classList.contains('on') ? document.querySelector('#tip').innerText.replace(/\n/g,' | ') : 'none'));
  await b.close();
})();
