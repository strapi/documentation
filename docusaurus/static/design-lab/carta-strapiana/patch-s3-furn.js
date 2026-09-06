'use strict';
/* S3 TRANCHE 1 - THE FURNITURE NEVER COVERS THE SEA (owner law).
   The four pinned boxes collapse to cartouche tabs docked at the sheet
   edges, proven against the real land mask; hover or click expands one
   box at a time; past the first zoom stop everything fades to tabs. */
const fs = require('fs');
const F = 'deadreckoning.js';
let src = fs.readFileSync(F, 'utf8');
let n = 0;
function rep(a, b) {
  if (!src.includes(a)) { console.error('MISS #' + (n + 1) + ': ' + a.slice(0, 90)); process.exit(1); }
  src = src.replace(a, b);
  n++;
}

/* ---- 1. the constants: docks replace pinned seats ---- */
rep(`/* the sheet's own furniture, in sheet coordinates */
const CART = { x: 34, y: 560, w: 372, h: 218 };          // the cartouche
const KEYB = { x: 1002, y: 480, w: 366, h: 298 };        // the legend
const DIRS = { x: 30, y: 34, w: 300, h: 352 };           // sailing directions + the rumors
const ROSE = { x: 1272, y: 146, r: 62 };                 // the compass rose
const SCAL = { x: 500, y: 740, w: 336, h: 54 };
const STGL = { x: 500, y: 656, w: 336, h: 74 };          // the storm-glass (stage 2)
const KEY_ROW_Y = 96, KEY_ROW_H = 16;   // the legend's rows, pinned so ink and letter agree          // the scale bar
const FURN = [CART, KEYB, DIRS, SCAL, STGL,
  { x: ROSE.x - ROSE.r - 30, y: ROSE.y - ROSE.r - 62, w: (ROSE.r + 30) * 2, h: ROSE.r * 2 + 92 }];`,
`/* THE FURNITURE LAW (owner order): the furniture never covers the sea.
   The boxes that once sat pinned over the water - the directions, the key,
   the storm-glass, the title cartouche - are collapsed cartouche TABS by
   default, docked at the sheet edges over open water or the torn margin.
   Each expands on hover or click into its full box and folds back on leave;
   at most one box is open at a time; past the first zoom stop everything
   fades to tabs (the close chart belongs to the geography) and returns at
   the overview. Every collapsed seat is proven against the real land mask
   before it is taken: land, places, beasts and the rumor marks are all
   ground no tab may sit on. */
const CART = { w: 372, h: 232 };                 // the cartouche, expanded
const KEYB = { w: 366, h: 330 };                 // the legend, expanded
const DIRS = { w: 300, h: 352 };                 // sailing directions + rumors
const ROSE = { x: 1272, y: 146, r: 62 };         // the compass rose (sheet ink)
const SCAL = { x: 560, y: 752, w: 240, h: 40 };  // the scale bar: small and low
const STGL = { w: 336, h: 74 };                  // the storm-glass, expanded
const KEY_ROW_Y = 96, KEY_ROW_H = 16;   // the legend's rows, pinned so ink and letter agree
const ROSE_RECT = { x: ROSE.x - ROSE.r - 30, y: ROSE.y - ROSE.r - 62, w: (ROSE.r + 30) * 2, h: ROSE.r * 2 + 92 };
/* the ground the sheet must honor while collapsed: rose + tabs + scale,
   filled by furnComputeDocks() once the geography is known */
const FURN = [ROSE_RECT];
const furn = { open: null, faded: false, docks: null, view: null, closeT: 0, wired: false };
const FURNSPEC = {
  dirs:  { title: 'SAILING DIRECTIONS', box: DIRS, edge: 'w', at: 84 },
  key:   { title: 'HERE BE DRAGONS',    box: KEYB, edge: 'e', at: 430 },
  glass: { title: 'THE STORM-GLASS',    box: STGL, edge: 's', at: 950 },
  cart:  { title: 'CARTA STRAPIANA',    box: CART, edge: 'sw', at: 0 }
};`);

/* ---- 2. the engine, inserted before paintFurniture; paintFurniture keeps
        only the scale bar ---- */
rep(`/* the four table instruments stay pinned to the glass while the sheet moves
   beneath them: the readout, the key, the directions and the scale are the
   utility path, and the utility path does not zoom away */
function paintFurniture(g) {
  const solid = !chartViewIdent();
  drawCartouche(g, CART);
  drawPanel(g, KEYB, solid);
  drawPanel(g, DIRS, solid);
  drawKeyGlyphs(g, KEYB);
  drawScaleBar(g, SCAL);
  drawStormGlass(g, STGL);
}`,
`/* ============================================================
   THE CHART FURNITURE, COLLAPSED TO TABS (owner law)
   ============================================================ */
/* the real land mask: every coast ring, place mark, beast, rock, rumor
   mark and the rose, rasterized once in sheet coordinates */
function furnMask(geo) {
  const mc = document.createElement('canvas');
  mc.width = CHART_W; mc.height = CHART_H;
  const g = mc.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#000';
  for (const R of geo.rings) {
    if (!R.pts || R.pts.length < 3) continue;
    g.beginPath(); pathThrough(g, R.pts, true); g.fill();
  }
  for (const m of chart.marks) {
    g.beginPath(); g.arc(m.x, m.y, (m.r || 7) + 4, 0, TAU); g.fill();
  }
  for (const B of geo.beasts) {
    g.beginPath(); g.ellipse(B.x, B.y, B.L * 0.60, B.L * 0.52, 0, 0, TAU); g.fill();
    if (B.band) g.fillRect(B.x - B.band.w / 2 - 4, B.band.y - 14, B.band.w + 8, 30);
  }
  for (const D of geo.decor || []) {
    const r = D.kind === 'inkstain' ? (D.r || 30) + 6 : 18;
    g.beginPath(); g.arc(D.x, D.y, r, 0, TAU); g.fill();
  }
  g.fillRect(ROSE_RECT.x, ROSE_RECT.y, ROSE_RECT.w, ROSE_RECT.h);
  return g;
}
function furnRectClear(mg, r) {
  const x0 = Math.max(0, Math.floor(r.x)), y0 = Math.max(0, Math.floor(r.y));
  const w = Math.min(CHART_W - x0, Math.ceil(r.w)), h = Math.min(CHART_H - y0, Math.ceil(r.h));
  if (w <= 0 || h <= 0) return false;
  const d = mg.getImageData(x0, y0, w, h).data;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 8) return false;
  return true;
}
function furnTabSize(id) {
  const sp = FURNSPEC[id];
  const w = Math.ceil(textW(sp.title, 10.5, '600 ', 1.7)) + 32;
  return { w, h: id === 'cart' ? 34 : 21 };
}
function furnComputeDocks() {
  const geo = chart.geo;
  if (!geo) return;
  const mg = furnMask(geo);
  const taken = [ROSE_RECT, { x: CHART_W / 2 - 120, y: 6, w: 240, h: 38 }];
  const hitTaken = r => taken.some(q =>
    r.x < q.x + q.w + 8 && r.x + r.w + 8 > q.x && r.y < q.y + q.h + 8 && r.y + r.h + 8 > q.y);
  /* the scale bar first: small and low, proven over water like the rest */
  {
    let placed = false;
    for (let step = 0; step < 40 && !placed; step++) {
      const off = (step % 2 ? -1 : 1) * Math.ceil(step / 2) * 22;
      const r = { x: clamp(560 + off, 30, CHART_W - SCAL.w - 30), y: SCAL.y - 14, w: SCAL.w, h: SCAL.h + 16 };
      if (!hitTaken(r) && furnRectClear(mg, r)) { SCAL.x = r.x; taken.push(r); placed = true; }
    }
    if (!placed) taken.push({ x: SCAL.x, y: SCAL.y - 14, w: SCAL.w, h: SCAL.h + 16 });
  }
  const docks = {};
  for (const id of Object.keys(FURNSPEC)) {
    const sp = FURNSPEC[id], tz = furnTabSize(id);
    let seat = null;
    for (let step = 0; step < 56 && !seat; step++) {
      const off = (step % 2 ? -1 : 1) * Math.ceil(step / 2) * 16;
      let r;
      if (sp.edge === 'w') r = { x: 5, y: sp.at + off, w: tz.w, h: tz.h };
      else if (sp.edge === 'e') r = { x: CHART_W - tz.w - 5, y: sp.at + off, w: tz.w, h: tz.h };
      else if (sp.edge === 's') r = { x: sp.at + off - tz.w / 2, y: CHART_H - tz.h - 5, w: tz.w, h: tz.h };
      else r = { x: 10 + Math.max(0, off), y: CHART_H - tz.h - 6, w: tz.w, h: tz.h };
      r.x = clamp(r.x, 4, CHART_W - tz.w - 4);
      r.y = clamp(r.y, 4, CHART_H - tz.h - 4);
      if (hitTaken(r)) continue;
      if (furnRectClear(mg, r)) seat = r;
    }
    if (!seat) seat = sp.edge === 'e'
      ? { x: CHART_W - tz.w - 5, y: sp.at, w: tz.w, h: tz.h }
      : { x: 5, y: sp.edge === 'w' ? sp.at : CHART_H - tz.h - 5, w: tz.w, h: tz.h };
    seat.clear = furnRectClear(mg, seat);
    docks[id] = seat;
    taken.push(seat);
  }
  furn.docks = docks;
  FURN.length = 0;
  for (const r of taken) FURN.push(r);
  diag.furn = {
    docks, faded: furn.faded, open: furn.open,
    scale: { x: SCAL.x, y: SCAL.y, w: SCAL.w, h: SCAL.h },
    collapsed: Object.keys(docks).map(id => Object.assign({ id }, docks[id]))
  };
}
function furnTabEls() {
  return ['dirs', 'key', 'glass', 'cart'].map(id => [id, $('fu-' + id)]).filter(p => p[1]);
}
/* place tabs (and the open box) on the glass: sheet px scaled by S */
function furnLayout(S, dx, dy) {
  furn.view = { S, dx, dy };
  if (!furn.docks) return;
  for (const [id, el] of furnTabEls()) {
    const d = furn.docks[id];
    if (!d) { el.style.display = 'none'; continue; }
    el.style.display = 'block';
    el.style.left = (dx + d.x * S).toFixed(1) + 'px';
    el.style.top = (dy + d.y * S).toFixed(1) + 'px';
    el.style.width = d.w + 'px';
    el.style.transform = 'scale(' + S.toFixed(4) + ')';
  }
  furnPlaceBox();
}
function furnPlaceBox() {
  const id = furn.open, v = furn.view;
  if (!id || !v || !furn.docks) return;
  const sp = FURNSPEC[id], B = sp.box, d = furn.docks[id];
  let x, y;
  if (sp.edge === 'w') { x = 8; y = clamp(d.y - 8, 20, CHART_H - B.h - 20); }
  else if (sp.edge === 'e') { x = CHART_W - B.w - 8; y = clamp(d.y - 8, 20, CHART_H - B.h - 20); }
  else if (sp.edge === 's') { x = clamp(d.x + d.w / 2 - B.w / 2, 20, CHART_W - B.w - 20); y = CHART_H - B.h - 26; }
  else { x = 10; y = CHART_H - B.h - 12; }
  const box = $('fu-box');
  box.style.left = (v.dx + x * v.S).toFixed(1) + 'px';
  box.style.top = (v.dy + y * v.S).toFixed(1) + 'px';
  box.style.width = B.w + 'px';
  box.style.height = B.h + 'px';
  box.style.transform = 'scale(' + v.S.toFixed(4) + ')';
}
/* the engraved ink of the one open box, at 2x for the letterpress */
function furnInkBox(id) {
  const sp = FURNSPEC[id], B = sp.box;
  const ink = $('fu-ink');
  if (!ink) return;
  if (ink.width !== B.w * 2 || ink.height !== B.h * 2) { ink.width = B.w * 2; ink.height = B.h * 2; }
  ink.style.width = B.w + 'px'; ink.style.height = B.h + 'px';
  const g = ink.getContext('2d');
  g.setTransform(2, 0, 0, 2, 0, 0);
  g.clearRect(0, 0, B.w, B.h);
  g.lineJoin = 'round'; g.lineCap = 'round';
  const R0 = { x: 0, y: 0, w: B.w, h: B.h };
  if (id === 'cart') drawCartouche(g, R0);
  else if (id === 'glass') drawStormGlass(g, R0);
  else { drawPanel(g, R0, true); if (id === 'key') drawKeyGlyphs(g, R0); }
}
function furnOpen(id) {
  clearTimeout(furn.closeT);
  if (furn.faded || !furn.docks || !FURNSPEC[id]) return;
  if (furn.open === id) return;
  furn.open = id;
  furnInkBox(id);
  for (const el of document.querySelectorAll('#fu-body > *')) el.hidden = true;
  if (id === 'dirs') { const dd = $('chartdirs'); dd.innerHTML = directionsHtml(); dd.hidden = false; }
  else if (id === 'key') { const ck = $('chartkey'); ck.innerHTML = keyHtml(1); ck.hidden = false; }
  else if (id === 'glass') { const sg = $('stormglass'); wx.glassKey = ''; sg.hidden = false; updateStormGlass(); }
  else {
    const cc = $('chartcart'); cc.innerHTML = cartoucheHtml(); cc.hidden = false;
    const ci = $('chartinfo'); ci.hidden = false; showChartInfo(chart.hover);
  }
  const box = $('fu-box');
  box.dataset.f = id;
  box.hidden = false;
  furnPlaceBox();
  for (const [tid, el] of furnTabEls()) el.setAttribute('aria-expanded', String(tid === id));
  if (diag.furn) diag.furn.open = id;
}
function furnClose() {
  clearTimeout(furn.closeT);
  if (!furn.open) return;
  furn.open = null;
  const box = $('fu-box');
  if (box) box.hidden = true;
  for (const [, el] of furnTabEls()) el.setAttribute('aria-expanded', 'false');
  if (diag.furn) diag.furn.open = null;
}
function furnLeave() {
  clearTimeout(furn.closeT);
  furn.closeT = setTimeout(furnClose, REDUCED ? 0 : 260);
}
function furnWire() {
  if (furn.wired) return;
  furn.wired = true;
  const box = $('fu-box');
  if (!box) return;
  for (const [id, el] of furnTabEls()) {
    el.addEventListener('pointerenter', () => furnOpen(id));
    el.addEventListener('pointerleave', furnLeave);
    el.addEventListener('click', e => {
      e.stopPropagation();
      if (furn.open === id) furnClose(); else furnOpen(id);
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); e.stopPropagation();
        if (furn.open === id) furnClose(); else furnOpen(id);
      }
    });
  }
  box.addEventListener('pointerenter', () => clearTimeout(furn.closeT));
  box.addEventListener('pointerleave', furnLeave);
}
/* past the first zoom stop the chart belongs to the geography */
function furnSync() {
  const faded = chart.z > 1.71;
  if (faded === furn.faded) return;
  furn.faded = faded;
  const layer = $('furniture');
  if (layer) layer.classList.toggle('faded', faded);
  if (faded) furnClose();
  if (diag.furn) diag.furn.faded = faded;
}

/* the scale bar alone stays pinned on the canvas: small and low */
function paintFurniture(g) {
  drawScaleBar(g, SCAL);
}`);

/* ---- 3. compute docks between geometry and bake ---- */
rep(`  if (!chart.sheet) { measureBands(geo); bakeChartSheet(geo); }`,
`  if (!chart.sheet) { measureBands(geo); furnComputeDocks(); bakeChartSheet(geo); furnWire(); }`);

/* ---- 4. furnSync rides every canvas draw ---- */
rep(`  drawFog(g);
  drawChartVisit(g);
  paintFurniture(g);`,
`  drawFog(g);
  drawChartVisit(g);
  paintFurniture(g);
  furnSync();`);

/* ---- 5. layoutChartDom: the boxes leave the pinned layer ---- */
rep(`  /* --- the cartouche --- */
  pinHtml.push('<div class="cl-cart" style="left:' + (dx + (CART.x + 15) * S).toFixed(1) + 'px;top:' +
    (dy + (CART.y + 15) * S).toFixed(1) + 'px;width:' + ((CART.w - 30) * S).toFixed(1) +
    'px;font-size:' + (11 * S).toFixed(2) + 'px">' + cartoucheHtml() + '</div>');

  /* --- the legend --- */
  pinHtml.push('<div class="cl-dirs" style="left:' + (dx + (DIRS.x + 14) * S).toFixed(1) + 'px;top:' +
    (dy + (DIRS.y + 13) * S).toFixed(1) + 'px;width:' + ((DIRS.w - 28) * S).toFixed(1) +
    'px;font-size:' + (11 * S).toFixed(2) + 'px">' + directionsHtml() + '</div>');

  lab.innerHTML = '<div id="clgeo">' + geoHtml.join('') + '</div><div id="clpin">' + pinHtml.join('') + '</div>';
  chart.layoutView = { z: Z, tx: TX, ty: TY, S, dx, dy };

  /* the two live panels keep their own nodes: the readout and the key */
  const ci = $('chartinfo');
  ci.style.left = (dx + (CART.x + 15) * S).toFixed(1) + 'px';
  ci.style.top = (dy + (CART.y + CART.h - 74) * S).toFixed(1) + 'px';
  ci.style.width = ((CART.w - 30) * S).toFixed(1) + 'px';
  ci.style.fontSize = (11.5 * S).toFixed(2) + 'px';
  const fsw = $('fogswitch');
  if (fsw) {
    fsw.style.left = (dx + (CHART_W / 2) * S).toFixed(1) + 'px';
    fsw.style.top = (dy + 25 * S).toFixed(1) + 'px';
    fsw.style.fontSize = (10.5 * S).toFixed(2) + 'px';
  }
  const sg = $('stormglass');
  if (sg) {
    sg.style.left = (dx + (STGL.x + 50) * S).toFixed(1) + 'px';
    sg.style.top = (dy + (STGL.y + 9) * S).toFixed(1) + 'px';
    sg.style.width = ((STGL.w - 62) * S).toFixed(1) + 'px';
    sg.style.fontSize = (10.5 * S).toFixed(2) + 'px';
    updateStormGlass();
  }
  placeChartCat();
  const ck = $('chartkey');
  ck.style.left = (dx + (KEYB.x + 14) * S).toFixed(1) + 'px';
  ck.style.top = (dy + (KEYB.y + 12) * S).toFixed(1) + 'px';
  ck.style.width = ((KEYB.w - 28) * S).toFixed(1) + 'px';
  ck.style.fontSize = (11 * S).toFixed(2) + 'px';
  ck.innerHTML = keyHtml(S);
}`,
`  lab.innerHTML = '<div id="clgeo">' + geoHtml.join('') + '</div><div id="clpin">' + pinHtml.join('') + '</div>';
  chart.layoutView = { z: Z, tx: TX, ty: TY, S, dx, dy };

  const fsw = $('fogswitch');
  if (fsw) {
    fsw.style.left = (dx + (CHART_W / 2) * S).toFixed(1) + 'px';
    fsw.style.top = (dy + 25 * S).toFixed(1) + 'px';
    fsw.style.fontSize = (10.5 * S).toFixed(2) + 'px';
  }
  placeChartCat();
  /* the furniture rides the same glass: collapsed tabs, one box at most */
  furnLayout(S, dx, dy);
}`);

/* ---- 6. the storm-glass re-inks its own box, not the sheet ---- */
rep(`  chartSettle();   /* the liquor itself is engraved on the next settled plate */
}`,
`  if (furn.open === 'glass') furnInkBox('glass');   /* the liquor is engraved in her own box */
}`);

/* ---- 7. keyHtml: the rules ride the row count, not a magic seven ---- */
rep(`  rules.forEach((t, j) => {
    const top = (KEY_ROW_Y - 12 + 7 * KEY_ROW_H + 4 + j * 26) * S;`,
`  rules.forEach((t, j) => {
    const top = (KEY_ROW_Y - 12 + rows.length * KEY_ROW_H + 4 + j * 26) * S;`);

/* ---- 8. Escape folds the open box before it leaves the table ---- */
rep(`    if (e.key === 'Escape') {
      if (ui.mode === 'below') { closeBelow(); e.preventDefault(); return; }`,
`    if (e.key === 'Escape') {
      if (ui.mode === 'below' && furn.open) { furnClose(); e.preventDefault(); return; }
      if (ui.mode === 'below') { closeBelow(); e.preventDefault(); return; }`);

fs.writeFileSync(F, src);
console.log('patched: ' + n + ' replacements');
