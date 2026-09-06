/* STAGE 2, tranche C: the harbour verbs (ideas 5+6+7). Exact-string surgery. */
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

/* 1. the module, before the boot IIFE */
const mod = fs.readFileSync(path.join(__dirname, 's2src', 'harbour.inc.js'), 'utf8');
rep('(async function boot() {', mod + '\n(async function boot() {', 'module-insert');

/* 2. the bottle drifts with the sim */
rep(`  eggTick(dt);
  wxTick(dt);`,
`  eggTick(dt);
  wxTick(dt);
  bottleTick(dt);`, 'tick');

/* 3. the bottle on the water, tinted by the same dusk as everything */
rep(`  /* dusk veil over the water */`,
`  drawBottles(sim, worldDY);

  /* dusk veil over the water */`, 'draw');

/* 4. B writes to the harbour (deck only; a typing hand keeps the keyboard) */
rep(`    if (e.key === 't' || e.key === 'T') { firstOrder('sail'); setSail('travel'); }`,
`    if ((e.key === 'b' || e.key === 'B') && ui.mode === 'deck') { bottleOpen(); e.preventDefault(); return; }
    if (e.key === 't' || e.key === 'T') { firstOrder('sail'); setSail('travel'); }`, 'key');

/* 5. the plate wired at boot */
rep(`  initEggs();
  wxInit();`,
`  initEggs();
  wxInit();
  harbourInit();
  bottleInit();`, 'boot');

/* 6. arrival is delivery, however she landed */
rep(`  firstOrder('below');
  landfallStart = performance.now();
  ui.slug = isle.slug;`,
`  firstOrder('below');
  landfallStart = performance.now();
  ui.slug = isle.slug;
  packetDelivery(isle);`, 'delivery');

/* 7. the slip and the packet on the shoreside */
rep(`    '<dt>Days of care</dt><dd>' + isle.careDays + ' &middot; ' + ageOfInk(isle) + '</dd>' +
    '</dl></div>';`,
`    '<dt>Days of care</dt><dd>' + isle.careDays + ' &middot; ' + ageOfInk(isle) + '</dd>' +
    '</dl></div>';

  out += harbourMasterHTML(isle);
  out += packetHTML(isle);`, 'shoreside');

/* 8. taking the packet aboard */
rep(`      } else if (act === 'path') {`,
`      } else if (act === 'packet') {
        const p = packetFor(isle);
        if (p) {
          visit.packet = { from: isle.slug, to: p.to, n: p.n };
          logMark('Took the packet at ' + isle.title + ', addressed to ' + p.toTitle + '.');
        }
      } else if (act === 'path') {`, 'take');

/* 9. hailing a ship is its own line in the log */
rep(`        warpTo(href.slice(1), 'citation');`,
`        warpTo(href.slice(1), a.dataset.hail ? 'hailed' : 'citation');`, 'hail');
rep(`    courses: why === 'citation' ? 'followed a citation' : why === 'passage' ? 'made the passage under sail' : 'carried by the packet',`,
`    courses: why === 'citation' ? 'followed a citation' : why === 'passage' ? 'made the passage under sail' : why === 'hailed' ? 'hailed her in harbour and boarded' : 'carried by the packet',`, 'hail-log');

/* 10. the routes you have run, inked with the visit */
rep(`  drawSoundings(g);
  if (visit.track.length > 1) {`,
`  drawSoundings(g);
  drawRoutes(g, VV);
  if (visit.track.length > 1) {`, 'routes-ink');

/* 11. the verifier's hooks */
rep(`  wxBolt(frames) { wx.thunderDone = false; wxBolt('probe'); if (frames) wx.forkFrames = frames; return true; },`,
`  wxBolt(frames) { wx.thunderDone = false; wxBolt('probe'); if (frames) wx.forkFrames = frames; return true; },
  bottle(text) { bottleOpen(); const ta = document.getElementById('bottletext'); if (ta) ta.value = text; bottleToss(); return diag.lastBottle; },
  packetInfo(slug) { const I = world.bySlug.get(slug); return I ? packetFor(I) : null; },
  harbourShips(slug) { const s = []; for (const [a, b] of world.graph.edges) if (b === slug) s.push(a); return s; },`, 'hooks');

fs.writeFileSync(F, src);
console.log('patched', n, 'sites; new size', src.length);
