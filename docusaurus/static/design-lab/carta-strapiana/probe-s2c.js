/* STAGE 2 tranche C probe: bottle post, packet runs, harbour master */
'use strict';
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));

  /* ---- the stubbed harbour: catch the POST, answer 200 ---- */
  let captured = null;
  await page.route('https://n8n.tools.strapi.team/**', async route => {
    const rq = route.request();
    captured = {
      url: rq.url(), method: rq.method(),
      source: rq.headers()['x-feedback-source'],
      ctype: rq.headers()['content-type'],
      body: rq.postData()
    };
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });

  await page.goto('http://127.0.0.1:8123/index.html?scale=1');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://127.0.0.1:8123/index.html?scale=1&sail=full');
  await page.waitForFunction(() => window.__helm && window.__helm.ready, null, { timeout: 40000 });
  await page.waitForTimeout(1200);

  /* --- THE BOTTLE, by the real hands: B, type, toss --- */
  const waters = await page.evaluate(() => ({ slug: (ship.bound || world.island).slug, title: (ship.bound || world.island).title }));
  await page.keyboard.press('b');
  await page.waitForTimeout(250);
  const plateOpen = await page.evaluate(() => !document.getElementById('bottleplate').hidden);
  const NOTE = 'The quick start reads true, though the deploy step could name the dashboard button.';
  await page.keyboard.type(NOTE, { delay: 2 });
  await page.screenshot({ path: 'iterlog/s2c/s2c-bottle-plate.png' });
  await page.click('#bp-toss');
  await page.waitForTimeout(700);
  const expectedBody = JSON.stringify({
    vote: 'up', kind: 'element', comment: NOTE,
    pagePath: waters.slug, pageTitle: waters.title,
    selectionHeading: 'Design Lab - Carta Strapiana', channel: 'design-lab'
  });
  const drift1 = await page.evaluate(() => bottlePost.drift.length);
  await page.screenshot({ path: 'iterlog/s2c/s2c-bottle-drift.png' });
  const sent = {
    plateOpen, captured,
    byteForByte: captured && captured.body === expectedBody,
    headerRight: captured && captured.source === 'docs-widget',
    drift: drift1,
    result: await page.evaluate(() => diag.bottleResult)
  };

  /* --- the held tide: the harbour refuses, the note is kept --- */
  await page.unroute('https://n8n.tools.strapi.team/**');
  await page.route('https://n8n.tools.strapi.team/**', route => route.abort('failed'));
  await page.keyboard.press('b');
  await page.waitForTimeout(200);
  await page.keyboard.type('A second note, for the closed harbour.', { delay: 1 });
  await page.click('#bp-toss');
  await page.waitForTimeout(900);
  const held = await page.evaluate(() => ({
    result: diag.bottleResult,
    kept: visit.bottles.length,
    drift: bottlePost.drift.length,
    caption: document.getElementById('caption').textContent
  }));

  /* --- THE HARBOUR MASTER at the anchorage --- */
  await page.evaluate(() => window.__helm.open('/cms/api/document-service'));
  await page.waitForTimeout(700);
  const ledger = await page.evaluate(() => {
    const I = world.bySlug.get('/cms/api/document-service');
    const lis = document.querySelectorAll('#shoreside .hm-list li').length;
    return { inbound: I.inbound, shown: lis,
      graph: window.__helm.harbourShips(I.slug).length,
      line: document.querySelector('#shoreside .hm-line').textContent };
  });
  await page.screenshot({ path: 'iterlog/s2c/s2c-harbour-master.png' });

  /* --- THE PACKET: take it, deliver it, the route is inked --- */
  const pk = await page.evaluate(() => window.__helm.packetInfo('/cms/api/document-service'));
  const hasBtn = await page.evaluate(() => !!document.querySelector('#shoreside button[data-act="packet"]'));
  await page.click('#shoreside button[data-act="packet"]');
  await page.waitForTimeout(300);
  const took = await page.evaluate(() => ({ held: visit.packet }));
  /* land at the destination by the packet (any honest arrival delivers) */
  await page.evaluate((to) => window.__helm.open(to), pk.to);
  await page.waitForTimeout(700);
  const delivered = await page.evaluate(() => ({
    routes: visit.routes, packet: visit.packet,
    block: (document.querySelector('#shoreside .pk-block') || {}).textContent || '',
    logTail: visit.log.slice(-2)
  }));
  await page.screenshot({ path: 'iterlog/s2c/s2c-packet-delivered.png' });

  /* the route inked on the chart */
  await page.evaluate(() => document.getElementById('weigh').click());
  await page.waitForTimeout(300);
  await page.keyboard.press('c');
  await page.waitForFunction('chart.ready === true', null, { timeout: 20000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'iterlog/s2c/s2c-route-inked.png' });
  const nm = await page.evaluate((a) => routeName(a.from, a.to), { from: '/cms/api/document-service', to: pk.to });

  /* hail a ship: boarding writes its own line */
  await page.evaluate(() => window.__helm.open('/cms/api/document-service'));
  await page.waitForTimeout(600);
  await page.click('#shoreside .hm-list li a');
  await page.waitForTimeout(700);
  const hailed = await page.evaluate(() => ({
    slug: ui.slug,
    logCourse: visit.log[visit.log.length - 1].courses
  }));

  console.log(JSON.stringify({ sent, held, ledger, pk, hasBtn, took, delivered, routeNm: nm, hailed, errs }, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
