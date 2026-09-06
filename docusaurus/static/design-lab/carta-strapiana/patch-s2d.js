/* STAGE 2, tranche D: log sketches + journal, figurehead, night, the cat. */
'use strict';
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, 'deadreckoning.js');
let src = fs.readFileSync(F, 'utf8');
let n = 0;
function rep(oldS, newS, tag) {
  const i = src.indexOf(oldS);
  if (i < 0) throw new Error('NOT FOUND [' + tag + ']');
  if (src.indexOf(oldS, i + 1) >= 0) throw new Error('NOT UNIQUE [' + tag + ']');
  src = src.slice(0, i) + newS + src.slice(i + oldS.length);
  n++;
}

/* 1. the module */
const mod = fs.readFileSync(path.join(__dirname, 's2src', 'nightcat.inc.js'), 'utf8');
rep('(async function boot() {', mod + '\n(async function boot() {', 'module-insert');

/* 2. the log: export row, first-landfall sketches, wiring */
rep(`  h += '<div class="bsec">The log</div>';
  if (!visit.log.length) {`,
`  h += '<div class="bsec">The log</div>';
  if (visit.log.length) {
    h += '<div class="exportrow"><button class="btn" id="logexport" type="button">' +
      'Export the journal &mdash; a PNG in the engraved hand</button></div>';
  }
  if (!visit.log.length) {`, 'export-btn');
rep(`    h += '<table id="logtable"><thead><tr><th>H</th><th>K</th><th>F</th><th>Courses</th><th>Winds</th><th>Remarks</th></tr></thead><tbody>';
    visit.log.forEach((r, i) => {`,
`    /* the first landfall on each water carries her engraved sketch */
    const firstIdx = new Set();
    {
      const seenS = new Set();
      visit.log.forEach((r, i) => {
        if (!r.mark && r.slug && !seenS.has(r.slug)) { seenS.add(r.slug); firstIdx.add(i); }
      });
    }
    h += '<table id="logtable"><thead><tr><th>H</th><th>K</th><th>F</th><th>Courses</th><th>Winds</th><th>Remarks</th></tr></thead><tbody>';
    visit.log.forEach((r, i) => {`, 'first-idx');
rep(`          '<td>' + esc(r.courses) + '<br><span style="font-size:12px;color:var(--ink-3)">made ' +
          esc(r.title) + '</span></td>' +`,
`          '<td>' + esc(r.courses) + '<br><span style="font-size:12px;color:var(--ink-3)">made ' +
          esc(r.title) + '</span>' +
          (firstIdx.has(i) ? '<br><canvas class="lg-sk" width="128" height="66" data-slug="' +
            esc(r.slug) + '" aria-label="the first-landfall sketch of ' + esc(r.title) + '"></canvas>' : '') +
          '</td>' +`, 'row-sketch');
rep(`  h += '</div>';
  p.innerHTML = h;

  const spec = document.getElementById('specimen');`,
`  h += '</div>';
  p.innerHTML = h;
  wireLogSketches(p);

  const spec = document.getElementById('specimen');`, 'wire');

/* 3. the figurehead and the cat tick with the sim */
rep(`  eggTick(dt);
  wxTick(dt);
  bottleTick(dt);`,
`  eggTick(dt);
  wxTick(dt);
  bottleTick(dt);
  fhTick();
  catTick(dt);`, 'ticks');

/* 4. lighthouses burn from any offing at dusk; shore lights stay close-in */
rep(`    if (dist < 1.9) drawShoreLights(isle, x, yBase, wpx, s, dist, stage);`,
`    drawLighthouses(isle, x, yBase, wpx, s, dist, stage);
    if (dist < 1.9) drawShoreLights(isle, x, yBase, wpx, s, dist, stage);`, 'lighthouse');

/* 5. the constellation hangs beside the fixed stars */
rep(`  drawStars(map);`,
`  drawStars(map);
  drawConstellation(map);`, 'constellation');

/* 6. a star answers the hand before the wheel does */
rep(`    if (ui.mode === 'deck' && eggs.hits.length) {
      const rct = el.getBoundingClientRect();
      const mx = (e.clientX - rct.left) * W / rct.width;
      const my = (e.clientY - rct.top) * H / rct.height;
      for (const hh of eggs.hits) {
        if (Math.hypot(mx - hh.x, my - hh.y) < hh.r + 10) { eggActivate(hh.key); return; }
      }
    }`,
`    if (ui.mode === 'deck') {
      const rct = el.getBoundingClientRect();
      const mx = (e.clientX - rct.left) * W / rct.width;
      const my = (e.clientY - rct.top) * H / rct.height;
      for (const hh of eggs.hits) {
        if (Math.hypot(mx - hh.x, my - hh.y) < hh.r + 10) { eggActivate(hh.key); return; }
      }
      const sh = starPick(mx, my);
      if (sh) { steerByStar(sh); return; }
    }`, 'star-click');
rep(`      if (!dragging && ui.mode === 'deck') eggHover((e.clientX - rr2.left) * W / rr2.width,
                                                    (e.clientY - rr2.top) * H / rr2.height, el);`,
`      if (!dragging && ui.mode === 'deck') {
        const mx2 = (e.clientX - rr2.left) * W / rr2.width;
        const my2 = (e.clientY - rr2.top) * H / rr2.height;
        eggHover(mx2, my2, el);
        const sh2 = starPick(mx2, my2);
        const was = nightSky.hover;
        nightSky.hover = sh2 ? sh2.i : -1;
        if (sh2) el.style.cursor = 'pointer';
        else if (was >= 0 && !eggs.cursorOn) el.style.cursor = '';
      }`, 'star-hover');

/* 7. the cat on deck rides the same roll as the deck she walks */
rep(`  ctx.drawImage(bake.deck, 0, 0, W, H);
  drawSail(ctx, t, knotsFrac, sim.cosA);
  drawPennant(ctx, t, sim);
  ctx.restore();`,
`  ctx.drawImage(bake.deck, 0, 0, W, H);
  drawSail(ctx, t, knotsFrac, sim.cosA);
  drawPennant(ctx, t, sim);
  drawDeckCat(ctx, t, sim);
  ctx.restore();`, 'deck-cat');

/* 8. the key carries the night rule; the panel makes the room */
rep(`const KEYB = { x: 1002, y: 496, w: 366, h: 282 };        // the legend`,
`const KEYB = { x: 1002, y: 480, w: 366, h: 298 };        // the legend`, 'keyb');
rep(`  const rules = [
    'the weather is the corpus twelvemonth replayed, a month a minute: rain where the ink fell thick, squalls where it fell thickest',
    'the sea remembers the tending: grey mist rides waters long untended; fresh ink sparkles on the swell'
  ];
  rules.forEach((t, j) => {
    const top = (KEY_ROW_Y - 12 + 7 * KEY_ROW_H + 6 + j * 30) * S;`,
`  const rules = [
    'the weather is the corpus twelvemonth replayed, a month a minute: rain where the ink fell thick, squalls where it fell thickest',
    'the sea remembers the tending: grey mist rides waters long untended; fresh ink sparkles on the swell',
    'by night one lighthouse burns for every twelve citations on a cape; the stars overhead are the current waters&rsquo; citations &mdash; click one to lay a course'
  ];
  rules.forEach((t, j) => {
    const top = (KEY_ROW_Y - 12 + 7 * KEY_ROW_H + 4 + j * 26) * S;`, 'key-rules');

/* 9. the visit forgets what the figurehead said when it is cleared */
rep(`'seen','fogmode'`, `'seen','fogmode','spoken'`, 'clear-spoken');

/* 10. the chart cat settles when the sheet is laid out */
rep(`    updateStormGlass();
  }
  const ck = $('chartkey');`,
`    updateStormGlass();
  }
  placeChartCat();
  const ck = $('chartkey');`, 'cat-pin');

/* 11. her tail keeps its own slow watch */
rep(`  harbourInit();
  bottleInit();`,
`  harbourInit();
  bottleInit();
  setInterval(chartCatBeat, 1700);`, 'cat-beat');

/* 12. the verifier's hooks */
rep(`  bottle(text) { bottleOpen(); const ta = document.getElementById('bottletext'); if (ta) ta.value = text; bottleToss(); return diag.lastBottle; },`,
`  bottle(text) { bottleOpen(); const ta = document.getElementById('bottletext'); if (ta) ta.value = text; bottleToss(); return diag.lastBottle; },
  journalPng() { return exportJournal(false); },
  firstSentence(slug) { const I = world.bySlug.get(slug); return I ? firstSentenceOf(I) : ''; },
  fhSay(slug) { const I = world.bySlug.get(slug); if (!I) return ''; const s = firstSentenceOf(I); const el = document.getElementById('figurehead'); el.querySelector('.fh-line').textContent = '“' + s + '”'; el.querySelector('.fh-who').textContent = 'the figurehead speaks · her page’s own first words'; el.classList.add('shown'); fh.upTil = env.t + 7.5; return s; },
  stars() { buildConstellation(); return nightSky.stars.map(s => ({ slug: s.isle.slug, title: s.isle.title, x: s.x, y: s.y })); },
  steerStar(i) { if (!nightSky.stars[i]) return false; steerByStar({ i }); return true; },
  cat() { return { deck: cat.deck, u: +cat.u.toFixed(3), side: cat.side, stare: cat.stareAt && cat.stareAt.slug, home: cat.home, beasts: catBeasts().map(b => b.slug) }; },
  catWalk() { cat.deck = 'walk'; cat.u = 0.06; cat.side = 1; return true; },`, 'hooks');

fs.writeFileSync(F, src);
console.log('patched', n, 'sites; new size', src.length);
