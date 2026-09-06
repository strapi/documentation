'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true');
  await page.keyboard.press('2');
  await page.waitForTimeout(300);
  const idx = await page.evaluate(() => {
    const heads = [...document.querySelectorAll('#tab-index h3, #tab-index .bgroup, #tab-index .bhead')].map(e => e.textContent.trim());
    const body = document.body.innerText;
    return { heads: heads.slice(0, 24), other: /Other pages/.test(body), more: /More pages/.test(body) };
  });
  console.log(JSON.stringify(idx, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
