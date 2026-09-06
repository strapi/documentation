/* The act of care: a visit that sails, lands, lights a lamp, signs a watch and
   raises names, then the log and the register as they stand afterwards. */
'use strict';
const path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const BASE = 'http://127.0.0.1:8123/index.html';
const OUT = path.join(__dirname, 'iterlog');

(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto(BASE + '?scale=1');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.evaluate(() => window.__helm.clearVisit());
  await page.reload();
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(1200);

  /* 1. a real sailed crossing to the Document Service shore, ending at anchor */
  const tSail = Date.now();
  await page.evaluate(() => { window.__helm.sailTo('/cms/api/document-service', 1.9); window.__helm.sail('full'); });
  let anchored = false;
  for (let i = 0; i < 45 && !anchored; i++) {
    await page.waitForTimeout(2000);
    anchored = await page.evaluate(() => window.__helmDiag.anchored);
  }
  console.log('crossing of 1.9 nm took', ((Date.now() - tSail) / 1000).toFixed(1), 's');
  console.log('sailed landfall anchored:', anchored, 'landfallMs', await page.evaluate(() => window.__helmDiag.landfallMs));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.__helm.weigh());

  /* 2. a dark shore: hang the first lamp */
  await page.evaluate(() => window.__helm.open('/cms/testing'));
  await page.waitForTimeout(500);
  await page.evaluate(() => { const b = document.querySelector('#shoreside button.act[data-act="lamp"]'); if (b) b.click(); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, 'r7-I-dark-shore-first-lamp.png') });

  /* 3. a desert islet nothing links either way */
  await page.evaluate(() => window.__helm.open('/cms/community'));
  await page.waitForTimeout(500);
  await page.evaluate(() => { const b = document.querySelector('#shoreside button.act[data-act="islet"]'); if (b) b.click(); });
  await page.waitForTimeout(300);

  /* 4. sign the watch bill, then a lone keeper's watch */
  await page.evaluate(() => window.__helm.below('log'));
  await page.waitForTimeout(400);
  await page.fill('#handname', 'A visitor, 5 September');
  await page.click('#signbtn');
  await page.waitForTimeout(400);
  await page.evaluate(() => window.__helm.onDeck());
  const loneSlug = await page.evaluate(() => window.__helm.sets().lone[0]);
  await page.evaluate(s => window.__helm.open(s), loneSlug);
  await page.waitForTimeout(500);
  const hasWatch = await page.evaluate(() => !!document.querySelector('#shoreside button.act[data-act="watch"]'));
  if (hasWatch) {
    await page.evaluate(() => document.querySelector('#shoreside button.act[data-act="watch"]').click());
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(OUT, 'r7-I2-sign-the-watch.png') });
  }
  console.log('lone-keeper watch on', loneSlug, ':', hasWatch);

  /* 5. raise drowned hands from three shores that stand over lost paths */
  for (const slug of ['/cms/installation/docker', '/cms/deployment', '/cms/plugins/graphql']) {
    await page.evaluate(s => window.__helm.open(s), slug);
    await page.waitForTimeout(400);
    await page.evaluate(() => { const b = document.querySelector('#shoreside button.act[data-act="raise"]'); if (b) b.click(); });
    await page.waitForTimeout(250);
  }
  await page.screenshot({ path: path.join(OUT, 'r7-J-raising-a-drowned-hand.png') });

  /* 6. the visitor writes in the Remarks column, in their own hand */
  await page.evaluate(() => window.__helm.below('log'));
  await page.waitForTimeout(500);
  const rows = await page.evaluate(() => document.querySelectorAll('input.remark').length);
  await page.evaluate(() => window.__helm.writeRemark(0,
    'Beat up to her against the trade wind. 48 lights on the shore and every one of them a page that needed her.'));
  await page.evaluate(() => window.__helm.writeRemark(2,
    'Nothing cites Testing. Four thousand words and a dark shore: lamp hung.'));
  await page.evaluate(() => window.__helm.writeRemark(4,
    'Landed the islet. No link leads here in either direction — only a person can.'));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'r7-K-log-with-a-written-remark.png') });
  await page.evaluate(() => { const s = document.querySelector('#pane-log .bscroll'); s.scrollTop = s.scrollHeight; });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'r7-K2-log-scrolled.png') });
  console.log('log rows on screen:', rows);

  /* 7. the register */
  await page.evaluate(() => window.__helm.below('register'));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'r7-L-drowned-register.png') });
  await page.evaluate(() => { const s = document.querySelector('#pane-register .bscroll'); s.scrollTop = 900; });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'r7-L2-register-names.png') });

  /* 8. the colophon, and the chart with the visitor's own track inked */
  await page.evaluate(() => window.__helm.below('colophon'));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'r7-M-colophon.png') });
  await page.evaluate(() => window.__helm.below('chart'));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, 'r7-N-chart-with-track.png') });

  console.log('VISIT', JSON.stringify(await page.evaluate(() => window.__helm.visit())));
  console.log('ERRORS', errs.length ? errs : 'none');
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
