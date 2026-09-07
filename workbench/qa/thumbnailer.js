/* Refresh a gallery thumbnail for every build that has an index.html, forever. */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const SP = '/private/tmp/claude-501/-Users-piwi-code-documentation/0d8629c6-231f-4fec-94af-6fe3669d37b8/scratchpad';
const FINAL = SP + '/final/builds';
const IMG = '/Users/piwi/code/documentation/docusaurus/static/img';
const THUMBS = SP + '/qa/gallery-thumbs';
const KEYS = [
  ['cityx', FINAL + '/diorama'], ['pixelcity', FINAL + '/pixelcity'], ['herbarium', SP + '/bold5/s7'],
  ['firstlight', FINAL + '/firstlight'], ['longway', FINAL + '/longway'], ['lampfall', FINAL + '/lampfall'],
  ['deadwax', FINAL + '/deadwax'], ['projectionist', FINAL + '/projectionist'],
  ['cartastrapiana', FINAL + '/deadreckoning'], ['bythedeep', FINAL + '/bythedeep'],
  ['deepwater', FINAL + '/deepwater'],
  ['secreta', FINAL + '/secret-a'], ['secretb', FINAL + '/secret-b'],
  ['arcade2', SP + '/bold3/arcade'], ['galaxy', SP + '/bold2/galaxy'],
];
const MIME = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.json':'application/json',
  '.png':'image/png', '.jpg':'image/jpeg', '.gif':'image/gif', '.svg':'image/svg+xml', '.webp':'image/webp' };

let currentDir = null;
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  const f = u.startsWith('/img/') ? path.join(IMG, u.slice(5))
    : path.join(currentDir, u === '/' ? '/index.html' : u);
  fs.readFile(f, (e, d) => {
    if (e) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
    r.end(d);
  });
});
const PORT = 9707;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/* some builds need staging so the thumbnail shows the experience, not the intro */
const STAGE = {
  /* (2026-09-07, owner) The card should show the town as it looks on arrival:
     the whole island at a glance, plain afternoon light, and nothing laid over
     it. Zoom 2 fits the island in the frame; 0.625 of a day is 15:00. */
  pixelcity: async (page) => {
    /* step off the quick-start doorstep, or its prompt sits in the picture */
    await page.keyboard.down('ArrowRight'); await page.waitForTimeout(1500); await page.keyboard.up('ArrowRight');
    await page.waitForTimeout(500);
    await page.evaluate(() => { const a = window.__pixelTest || {}; try { a.setClock && a.setClock(0.625); } catch (e) {} });
    /* the town's own Fit island control, which is exactly the framing wanted */
    await page.click('#zfit').catch(() => {});
    await page.waitForTimeout(2200);
    /* the welcome card arrives on its own schedule, after the staging above.
       It is hidden rather than clicked: its button is Take me there, which
       would walk the courier and undo the framing. */
    await page.evaluate(() => {
      ['hintcard', 'doorprompt', 'folklabel', 'introprompt'].forEach(function (id) {
        var el = document.getElementById(id); if (el) el.hidden = true;
      });
    });
    await page.waitForTimeout(500);
  },
  longway: async (page) => {
    /* past the title card, then past the walker selector if it stands */
    await page.keyboard.press('Enter'); await page.waitForTimeout(900);
    await page.keyboard.press('Enter'); await page.waitForTimeout(700);
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    await page.keyboard.down('ArrowRight'); await page.waitForTimeout(3800); await page.keyboard.up('ArrowRight');
    await page.waitForTimeout(600);
  },
};

(async () => {
  await new Promise((res) => srv.listen(PORT, res));
  for (;;) {
    let browser = null;
    try {
      browser = await chromium.launch();
      for (const [key, dir] of KEYS) {
        try {
          if (!fs.existsSync(path.join(dir, 'index.html'))) continue;
          currentDir = dir;
          const page = await browser.newPage({ viewport: { width: 1200, height: 750 } });
          await page.goto('http://localhost:' + PORT + '/index.html', { waitUntil: 'load', timeout: 20000 });
          await page.waitForTimeout(4500);
          if (STAGE[key]) { try { await STAGE[key](page); } catch (e) {} }
          const tmp = path.join(THUMBS, 'tmp-' + key + '.png');
          await page.screenshot({ path: tmp, timeout: 15000 });
          fs.renameSync(tmp, path.join(THUMBS, key + '.png'));
          await page.close();
        } catch (e) {
          try { for (const pg of browser.pages ? await browser.pages() : []) await pg.close(); } catch (e2) {}
        }
      }
    } catch (e) { /* browser failed to launch; retry next pass */ }
    try { if (browser) await browser.close(); } catch (e) {}
    await sleep(300000);
  }
})();
