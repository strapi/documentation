const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('PAGEERROR', e.message.slice(0,300)));
  page.on('console', m => { if (m.type()==='error') console.log('CERR', m.text().slice(0,200)); });
  await page.goto('http://localhost:8931/', { waitUntil: 'load' });
  await page.waitForTimeout(6000);
  const st = await page.evaluate(() => {
    const ids = ['loading','zfit','zin','hud','city'];
    const out = {};
    for (const id of ids) {
      const el = document.getElementById(id);
      out[id] = el ? { display: getComputedStyle(el).display, rect: JSON.stringify(el.getBoundingClientRect()), hidden: el.hidden } : 'MISSING';
    }
    const h = document.getElementById('hud');
    out.hudText = h ? h.textContent : '';
    out.bodyChildren = [...document.body.children].map(c => c.id || c.tagName);
    return out;
  });
  console.log(JSON.stringify(st, null, 1));
  await page.screenshot({ path: 'iterlog/diag.jpg', type: 'jpeg', quality: 85 });
  await browser.close();
})();
