/* STAGE 2, tranche A: the fog of voyages (idea 1). Exact-string surgery. */
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

/* 1. the module, seated before the boot IIFE */
const mod = fs.readFileSync(path.join(__dirname, 's2src', 'fog.inc.js'), 'utf8');
rep('(async function boot() {', mod + '\n(async function boot() {', 'module-insert');

/* 2. the visit carries the new persisted truths */
rep(`  track: [],
  hours: store.get('hours', 0),
  save() {`,
`  track: [],
  hours: store.get('hours', 0),
  soundings: store.get('soundings', []),
  routes: store.get('routes', []),
  packet: store.get('packet', null),
  bottles: store.get('bottles', []),
  save() {`, 'visit-fields');
rep(`    store.set('hours', this.hours);
  }
};`,
`    store.set('hours', this.hours);
    store.set('soundings', this.soundings.slice(-240));
    store.set('routes', this.routes.slice(-160));
    store.set('packet', this.packet);
    store.set('bottles', this.bottles.slice(-40));
    fogPersist();
  }
};`, 'visit-save');

/* 3. the keel surveys as she goes */
rep(`  trackAcc = 0;
  const last = visit.track[visit.track.length - 1];`,
`  trackAcc = 0;
  fogSee(ship.x, ship.y, FOG_SEE_NM);
  const last = visit.track[visit.track.length - 1];`, 'tracktick-see');

/* 4. a passage is sailed water */
rep(`  ship.knots = 4.6;
  visit.track.push({ x: ship.x, y: ship.y });`,
`  ship.knots = 4.6;
  visit.track.push({ x: ship.x, y: ship.y });
  if (!reduced) fogSeePath(passage.ax, passage.ay, ship.x, ship.y, 0.8);
  fogSee(ship.x, ship.y, FOG_SEE_NM);`, 'passage-see');

/* 5. an anchorage reached is water surveyed - by sail or by the packet */
rep(`  ship.atAnchorOff = isle;
  logCrossing(isle);`,
`  ship.atAnchorOff = isle;
  fogSee(isle.pos.x, isle.pos.y, 1.1);
  logCrossing(isle);`, 'anchor-see');
rep(`  ship.atAnchorOff = isle;
  logPacket(isle, why || 'packet');`,
`  ship.atAnchorOff = isle;
  fogSee(isle.pos.x, isle.pos.y, 1.1);
  logPacket(isle, why || 'packet');`, 'warp-see');

/* 6. every cast of the lead is a numbered sounding on the known chart */
rep(`    story.leadsman1 = true;
    caption('The leadsman heaves the lead…', 2400);`,
`    story.leadsman1 = true;
    s2Sounding(isle.words);
    caption('The leadsman heaves the lead…', 2400);`, 'sounding-1');
rep(`  if (!story.leadsman2 && dist < 0.6) {
    story.leadsman2 = true;`,
`  if (!story.leadsman2 && dist < 0.6) {
    story.leadsman2 = true;
    s2Sounding(isle.words);`, 'sounding-2');

/* 7. the fog on the glass, under the visit ink and the furniture */
rep(`  g.lineJoin = 'round'; g.lineCap = 'round';
  drawChartVisit(g);
  paintFurniture(g);`,
`  g.lineJoin = 'round'; g.lineCap = 'round';
  drawFog(g);
  drawChartVisit(g);
  paintFurniture(g);`, 'drawfog');

/* 8. soundings ride with the visit ink */
rep(`  const VV = p => [p[0] * Z + TXv, p[1] * Z + TYv];
  if (visit.track.length > 1) {`,
`  const VV = p => [p[0] * Z + TXv, p[1] * Z + TYv];
  drawSoundings(g);
  if (visit.track.length > 1) {`, 'soundings-ink');

/* 9. the hand cannot take hold of a water still under the fog */
rep(`  for (const m of chart.marks) {
    const dx = m.x - x, dy = m.y - y;`,
`  for (const m of chart.marks) {
    if (fogHides(m.isle)) continue;
    const dx = m.x - x, dy = m.y - y;`, 'pick-gate');

/* 10. the lettering obeys the fog */
rep(`  for (const B of geo.beasts) {
    const bd = B.band;`,
`  for (const B of geo.beasts) {
    if (fogHides(B.isle)) continue;
    const bd = B.band;`, 'label-beasts');
rep(`  for (const K of geo.conts) {
    const kx = vx(K.x), ky = vy(K.y);`,
`  for (const K of geo.conts) {
    const contRumor = fog.mode === 'known' && !fog.anim &&
      !world.islands.some(ii => ii.product === K.key && isleSeen(ii));
    const kx = vx(K.x), ky = vy(K.y);`, 'label-conts-rumor');
rep(`    put(geoHtml, 'cl-cont', esc(K.name), px2, py2, w, h,`,
`    put(geoHtml, 'cl-cont' + (contRumor ? ' rumor' : ''), esc(K.name), px2, py2, w, h,`, 'label-cont-class');
rep(`      put(geoHtml, 'cl-contsub', esc(K.sub), px2, py2 + h * 0.95, w2, fs2 + 4,`,
`      put(geoHtml, 'cl-contsub' + (contRumor ? ' rumor' : ''), esc(contRumor ? K.sub + ' · by report only' : K.sub), px2, py2 + h * 0.95, w2, fs2 + 4,`, 'label-contsub');
rep(`    if (!A.arch) continue;
    const ax = vx(A.x), ay = vy(A.y);`,
`    if (!A.arch) continue;
    const archRumor = fogRumorAt(A.x, A.y);
    const ax = vx(A.x), ay = vy(A.y);`, 'label-arch-rumor');
rep(`    put(geoHtml, 'cl-arch', esc(t), stA.x, stA.y, w, h,`,
`    put(geoHtml, 'cl-arch' + (archRumor ? ' rumor' : ''), esc(t), stA.x, stA.y, w, h,`, 'label-arch-class');
rep(`  for (const G of regions) {
    const prime = !!G.primary;`,
`  for (const G of regions) {
    const landRumor = fog.mode === 'known' && !fog.anim && G.places.every(ii => !isleSeen(ii));
    const prime = !!G.primary;`, 'label-lands-rumor');
rep(`            put(geoHtml, 'cl-land' + (prime ? '' : ' sat'), esc(t), st.x, st.y, pw, ph,`,
`            put(geoHtml, 'cl-land' + (prime ? '' : ' sat') + (landRumor ? ' rumor' : ''), esc(t), st.x, st.y, pw, ph,`, 'label-land-class');
rep(`  for (const I of ranked) {
    if (I._suppress) continue;`,
`  for (const I of ranked) {
    if (I._suppress) continue;
    if (fogHides(I)) continue;`, 'label-places-gate');

/* 11. the switch is pinned to the sheet like the other instruments */
rep(`  const ck = $('chartkey');`,
`  const fsw = $('fogswitch');
  if (fsw) {
    fsw.style.left = (dx + (CHART_W / 2) * S).toFixed(1) + 'px';
    fsw.style.top = (dy + 25 * S).toFixed(1) + 'px';
    fsw.style.fontSize = (10.5 * S).toFixed(2) + 'px';
  }
  const ck = $('chartkey');`, 'pin-switch');

/* 12. the cartouche readout tells the truth of the mode */
rep(`  box.querySelector('.ci-line').textContent =
    'Two mains, ' + world.provinces.length + ' provinces, all ' + world.islands.length +
    ' pages on the one sheet. Hover any place for her name and bearing.';`,
`  box.querySelector('.ci-line').textContent = fog.mode === 'known'
    ? 'THE KNOWN CHART: drawn by your own voyages — ' + fogSeenCount() + ' of ' +
      world.islands.length + ' waters surveyed; the rest lie under the fog, by report only.'
    : 'Two mains, ' + world.provinces.length + ' provinces, all ' + world.islands.length +
      ' pages on the one sheet. Hover any place for her name and bearing.';`, 'ci-line');

/* 13. hooks for the verifier's hand */
rep(`  open(slug) { warpTo(slug, 'packet'); return diag.landfallMs; },`,
`  open(slug) { warpTo(slug, 'packet'); return diag.landfallMs; },
  fogMode(m) { fogSetMode(m, false); return fogDiag(); },
  fogLift(m) { fogSetMode(m, true); return fogDiag(); },
  fog() { return fogDiag(); },
  see(slug, r) { const i = world.bySlug.get(slug); if (!i) return false; fogSee(i.pos.x, i.pos.y, r || 1.2); return fogDiag(); },`, 'hooks');
rep(`  clearVisit() { try { for (const k of ['log','charted','raised','hand','lamps','islets','watches','hours','taught'])`,
`  clearVisit() { try { for (const k of ['log','charted','raised','hand','lamps','islets','watches','hours','taught','soundings','routes','packet','bottles','seen','fogmode'])`, 'clearvisit');

/* 14. the switch answers the hand */
rep(`  $('soundbtn').addEventListener('click', () => sound.toggle());`,
`  {
    const fsw2 = $('fogswitch');
    if (fsw2) {
      const flip = () => fogSetMode(fog.mode === 'known' ? 'full' : 'known', true);
      fsw2.addEventListener('click', flip);
      fsw2.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
      });
    }
  }
  $('soundbtn').addEventListener('click', () => sound.toggle());`, 'switch-wire');

/* 15. boot: the grid raised and this visit's waters seeded */
rep(`  ship.lastFix = { x: ship.x, y: ship.y, t: 0 };
  visit.track.push({ x: ship.x, y: ship.y });`,
`  ship.lastFix = { x: ship.x, y: ship.y, t: 0 };
  visit.track.push({ x: ship.x, y: ship.y });
  /* STAGE 2: the known chart - the survey grid raised, this visit seeded */
  fogInitGrid();
  for (const sg of visit.charted) { const Ic = world.bySlug.get(sg); if (Ic) fogSee(Ic.pos.x, Ic.pos.y, 1.1); }
  fogSee(ship.x, ship.y, FOG_SEE_NM);
  fogSyncSwitch();
  diag.fogMode = fog.mode; diag.fogSeen = fog.seen.size;`, 'boot-seed');

fs.writeFileSync(F, src);
console.log('patched', n, 'sites; new size', src.length);
