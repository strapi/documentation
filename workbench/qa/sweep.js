/* Headless smoke sweep: render every page of a design and report failures.
   usage: node sweep.js <designDir> <port> [maxPages] */
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require('/Users/piwi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');

const dir = process.argv[2];
const port = Number(process.argv[3] || 8950);
const max = Number(process.argv[4] || 0);
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };

function serve() {
  return new Promise((res) => {
    const s = http.createServer((req, rep) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      const f = path.join(dir, p === '/' ? '/index.html' : p);
      fs.readFile(f, (e, d) => {
        if (e) { rep.writeHead(404); rep.end('nf'); return; }
        rep.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
        rep.end(d);
      });
    });
    s.listen(port, () => res(s));
  });
}


/* Pull distinctive text out of a page's blocks. If the renderer drops a block kind,
   its probe string will be absent from the DOM and the sweep reports it. Design
   agnostic: it asserts nothing about markup, only that the words made it. */
function probeStrings(page) {
  const out = [];
  const ents = (h) => String(h).replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
  const strip = (h) => ents(String(h).replace(/<[^>]+>/g, ''));
  const take = (s) => {
    const t = strip(s).replace(/\s+/g, ' ').trim();
    if (t.length >= 25) out.push(t.slice(0, 70));
  };
  /* code is raw text, never html: stripping angle brackets would mangle
     generics like Record<string, string> and the probe could never match */
  const takeCode = (s) => {
    const t = String(s).replace(/\s+/g, ' ').trim();
    if (t.length >= 25) out.push(t.slice(0, 70));
  };
  (function walk(bl) {
    for (const b of bl || []) {
      if (!b || typeof b !== 'object') continue;
      if (b.t === 'p') take(b.html);
      else if (b.t === 'tldr') take(b.html);
      else if (/^h[2-6]$/.test(b.t)) take(b.text);
      else if (b.t === 'ul' || b.t === 'ol') {
        for (const i of b.items || []) {
          if (typeof i === 'string') take(i);
          else { take(i.html || ''); walk(i.blocks); }   // structured list items
        }
      } else if (b.t === 'table') {
        for (const r of b.rows || []) for (const c of r) take(c);
      } else if (b.t === 'code') { if (b.code) takeCode(b.code.split('\n')[0]); }
      else if (b.t === 'img') take(b.caption || '');   // alt is an attribute, checked separately
      else if (b.t === 'details') { take(b.summary); walk(b.blocks); }
      else if (b.t === 'admonition') { walk(b.blocks); }
      /* only the first tab: every design renders one tab at a time, so probing
         hidden tabs would report a click as a content loss */
      else if (b.t === 'tabs') { if (b.tabs && b.tabs[0]) walk(b.tabs[0].blocks); }
      else if (b.t === 'columns') { for (const c of b.cols || []) walk(c); }
      else if (b.t === 'cards') { for (const c of b.items || []) take(c.desc || c.title || ''); }
      else if (b.t === 'endpoint') {
        take(b.description || b.title || '');
        for (const p of b.params || []) take(p.desc || '');
        if (b.codeTabs && b.codeTabs[0] && b.codeTabs[0].code) takeCode(b.codeTabs[0].code.split('\n')[0]);
        for (const r of b.responses || []) if (r.body) takeCode(String(r.body).split('\n')[1] || '');
      }
    }
  })(page.blocks);
  /* sample evenly so the check stays fast but covers the whole page */
  const N = 14;
  if (out.length <= N) return out;
  const step = out.length / N, picked = [];
  for (let i = 0; i < N; i++) picked.push(out[Math.floor(i * step)]);
  return picked;
}

(async () => {
  const bundle = JSON.parse(fs.readFileSync(path.join(dir, 'content.json'), 'utf8'));
  let slugs = bundle.order && bundle.order.length ? bundle.order : Object.keys(bundle.pages);
  if (max) slugs = slugs.slice(0, max);
  const server = await serve();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

  const fails = [];
  let errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e.message).slice(0, 200)));

  /* Load the shell once. The designs are single page apps, so after the first
     load every page is a hash change: no refetch of the 3.3MB bundle. */
  await page.goto(`http://localhost:${port}/index.html#${slugs[0]}`, { waitUntil: 'load' });
  try {
    /* textContent, not innerText: innerText needs layout and returns empty
       while the app is still settling, which is not the same as unrendered */
    await page.waitForFunction(() => (document.body.textContent || '').trim().length > 400,
      { timeout: 25000 });
  } catch (e) {
    console.log(JSON.stringify({ design: path.basename(dir), fatal: 'shell never rendered content within 25s' }));
    await browser.close(); server.close(); process.exit(1);
  }

  let checked = 0;
  for (const slug of slugs) {
    errs = [];
    await page.evaluate((s) => { location.hash = s; }, slug);
    /* wait for the router to actually swap the page, not just a fixed delay */
    try {
      await page.waitForFunction((s) => {
        const h = decodeURIComponent(location.hash.slice(1));
        return h === s && (document.body.innerText || '').trim().length > 0;
      }, slug, { timeout: 8000 });
    } catch (e) { errs.push('ROUTER did not settle on ' + slug); }
    await page.waitForTimeout(35);
    const probes = probeStrings(bundle.pages[slug]);
    const info = await page.evaluate((probes) => {
      /* textContent, not innerText: it sees inactive tabs and closed details,
         so a hidden-but-present block never counts as a loss, and it does not
         go empty while the app is still settling the way innerText does.
         The clone drops <noscript>, whose markup is inert text with JS on. */
      const clone = document.body.cloneNode(true);
      clone.querySelectorAll('noscript, script, style').forEach((n) => n.remove());
      const all = clone.textContent || '';
      const t = all.trim();
      const norm = (s) => s.replace(/\s+/g, ' ').trim();
      const hay = norm(all);
      const missed = probes.filter((p) => hay.indexOf(norm(p)) === -1);
      const lis = Array.from(document.querySelectorAll('li'));
      return {
        words: t ? t.split(/\s+/).length : 0,
        title: document.title,
        unknown: document.querySelectorAll('[data-unknown]').length,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
        objObj: (all.match(/\[object Object\]/g) || []).length,
        emptyLi: lis.filter((l) => !(l.textContent || '').trim()).length,
        /* any html attribute visible as text means a highlighter or an inline
           renderer emitted a tag it then broke */
        markupLeak: (all.match(/class="[a-z0-9-]+"|<span |<\/span>|&lt;span/g) || []).length,
        imgs: document.querySelectorAll('img').length,
        imgsNoAlt: Array.from(document.querySelectorAll('img')).filter((i) => !i.getAttribute('alt')).length,
        missed: missed.slice(0, 3),
        missedCount: missed.length,
        probeCount: probes.length,
      };
    }, probes);
    checked++;
    const bad = [];
    const nonFavicon = errs.filter((e) => !/favicon/i.test(e));
    if (nonFavicon.length) bad.push('js:' + nonFavicon.slice(0, 2).join(' | '));
    if (info.words < 40) bad.push('thin:' + info.words + 'w');
    if (info.unknown) bad.push('unknown:' + info.unknown);
    if (info.overflow) bad.push('x-overflow');
    if (info.objObj) bad.push('objectObject:' + info.objObj);
    if (info.markupLeak) bad.push('markupLeak:' + info.markupLeak);
    if (info.emptyLi > 1) bad.push('emptyLi:' + info.emptyLi);
    if (info.imgsNoAlt) bad.push('imgNoAlt:' + info.imgsNoAlt + '/' + info.imgs);
    if (info.missedCount) bad.push('contentMissing:' + info.missedCount + '/' + info.probeCount +
      ' e.g. "' + (info.missed[0] || '').slice(0, 58) + '"');
    if (bad.length) fails.push({ slug, bad, title: info.title });
  }

  await browser.close();
  server.close();
  const tally = {};
  for (const f of fails) for (const b of f.bad) {
    const k = b.split(':')[0];
    tally[k] = (tally[k] || 0) + 1;
  }
  console.log(JSON.stringify({
    design: path.basename(dir), checked, failed: fails.length, tally,
    fails: fails.slice(0, 25),
  }, null, 2));
})().catch((e) => { console.error('SWEEP FAILED', e); process.exit(1); });
