/* Wave 8, zoom round: the chart becomes really zoomable (owner order).
   Anchored replacements; refuses to run if any anchor is missing or doubled. */
'use strict';
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, 'deadreckoning.js');
let src = fs.readFileSync(F, 'utf8');
let n = 0;

function rep(find, replace) {
  const i = src.indexOf(find);
  if (i < 0) { console.error('ANCHOR ' + (++n) + ' NOT FOUND:\n' + find.slice(0, 120)); process.exit(1); }
  if (src.indexOf(find, i + 1) >= 0) { console.error('ANCHOR ' + (++n) + ' AMBIGUOUS:\n' + find.slice(0, 120)); process.exit(1); }
  src = src.slice(0, i) + replace + src.slice(i + find.length);
  n++;
}

/* R1: view state on the chart */
rep(`const chart = {
  cv: null, g: null, W: CHART_W, H: CHART_H, k: 1, ox: 0, oy: 0,
  hover: null, marks: [], geo: null, sheet: null, dpr: 1, ready: false, dbl: false
};`,
`const chart = {
  cv: null, g: null, W: CHART_W, H: CHART_H, k: 1, ox: 0, oy: 0,
  hover: null, marks: [], geo: null, sheet: null, dpr: 1, ready: false, dbl: false,
  /* the reading glass over the sheet (owner order: the chart must be zoomable):
     sheet px -> canvas px is  v = p * z + t  */
  z: 1, tx: 0, ty: 0,
  zt: 1, txt: 0, tyt: 0,
  anim: 0, panned: false, gesturing: false,
  zoomCv: null, zoomKey: '', crispT: 0, layoutView: null
};
const CHART_ZMIN = 1, CHART_ZMAX = 9;`);

/* R2: view helpers after chartFit */
rep(`function chartFit() {
  const B = world.bounds, pad = 74;
  const sx = (CHART_W - pad * 2) / (B.maxx - B.minx);
  const sy = (CHART_H - pad * 2) / (B.maxy - B.miny);
  chart.k = Math.min(sx, sy);
  chart.ox = CHART_W / 2 - (B.minx + B.maxx) / 2 * chart.k;
  chart.oy = CHART_H / 2 - (B.miny + B.maxy) / 2 * chart.k;
}`,
`function chartFit() {
  const B = world.bounds, pad = 74;
  const sx = (CHART_W - pad * 2) / (B.maxx - B.minx);
  const sy = (CHART_H - pad * 2) / (B.maxy - B.miny);
  chart.k = Math.min(sx, sy);
  chart.ox = CHART_W / 2 - (B.minx + B.maxx) / 2 * chart.k;
  chart.oy = CHART_H / 2 - (B.miny + B.maxy) / 2 * chart.k;
}

/* ---- the view, clamped so the sheet always fills the glass ---- */
function chartClampView() {
  chart.z = clamp(chart.z, CHART_ZMIN, CHART_ZMAX);
  chart.tx = clamp(chart.tx, CHART_W * (1 - chart.z), 0);
  chart.ty = clamp(chart.ty, CHART_H * (1 - chart.z), 0);
}
function chartClampTargets() {
  chart.zt = clamp(chart.zt, CHART_ZMIN, CHART_ZMAX);
  chart.txt = clamp(chart.txt, CHART_W * (1 - chart.zt), 0);
  chart.tyt = clamp(chart.tyt, CHART_H * (1 - chart.zt), 0);
}
/* zoom the TARGET view about a canvas-space point, so the ground under the
   hand stays under the hand */
function chartZoomAbout(cx, cy, zNew) {
  zNew = clamp(zNew, CHART_ZMIN, CHART_ZMAX);
  const sx = (cx - chart.txt) / chart.zt, sy = (cy - chart.tyt) / chart.zt;
  chart.zt = zNew;
  chart.txt = cx - sx * zNew;
  chart.tyt = cy - sy * zNew;
  chartClampTargets();
}
function chartViewIdent() {
  return chart.z < 1.0005 && Math.abs(chart.tx) < 0.05 && Math.abs(chart.ty) < 0.05;
}`);

/* R3: bake wrapper + paintSheetGeo head */
rep(`function bakeChartSheet(geo) {
  const dpr = chart.dpr;
  const c = document.createElement('canvas');
  c.width = Math.round(CHART_W * dpr); c.height = Math.round(CHART_H * dpr);
  const g = c.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.lineJoin = 'round'; g.lineCap = 'round';

  const vell = tornSheetPath(g);`,
`function bakeChartSheet(geo) {
  const dpr = chart.dpr;
  const c = document.createElement('canvas');
  c.width = Math.round(CHART_W * dpr); c.height = Math.round(CHART_H * dpr);
  const g = c.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.lineJoin = 'round'; g.lineCap = 'round';
  paintSheetGeo(g, geo, { x0: -80, y0: -80, x1: CHART_W + 80, y1: CHART_H + 80 }, true);
  chart.sheet = c;
}

/* everything that is ink on the vellum, in sheet coordinates. \`vp\` is the
   visible window in sheet coordinates and culls only the DRAWING: every seeded
   stream is consumed in full on every run, so the ink never swims between one
   zoom stop and the next. \`base\` marks the whole-sheet bake, where the sea is
   kept clear under the four table instruments. */
function paintSheetGeo(g, geo, vp, base) {
  const inVp = (x, y, m) => x > vp.x0 - m && x < vp.x1 + m && y > vp.y0 - m && y < vp.y1 + m;

  const vell = tornSheetPath(g);`);

/* R4: stipple, gates consumed unconditionally, draw culled */
rep(`  const sr = rngFor('stipple');
  g.fillStyle = INK + '0.20)';
  for (let y = 20; y < CHART_H - 18; y += 7.5) {
    for (let x = 20; x < CHART_W - 18; x += 7.5) {
      const px = x + (sr() - 0.5) * 6, py = y + (sr() - 0.5) * 6;
      const f = fieldAt(px, py);
      if (f > 0.55 || inFurn(px, py)) continue;
      if (sr() > 0.22 + 0.62 * Math.min(1, f / 0.55)) continue;
      g.fillRect(px, py, 0.85, 0.85);
    }
  }`,
`  const sr = rngFor('stipple');
  g.fillStyle = INK + '0.20)';
  for (let y = 20; y < CHART_H - 18; y += 7.5) {
    for (let x = 20; x < CHART_W - 18; x += 7.5) {
      const px = x + (sr() - 0.5) * 6, py = y + (sr() - 0.5) * 6;
      const gate = sr();
      const f = fieldAt(px, py);
      if (f > 0.55) continue;
      if (gate > 0.22 + 0.62 * Math.min(1, f / 0.55)) continue;
      if (base && inFurn(px, py)) continue;
      if (!inVp(px, py, 4)) continue;
      g.fillRect(px, py, 0.85, 0.85);
    }
  }`);

/* R5: waves, same discipline */
rep(`      const px = x + (wr() - 0.5) * 19, py = y + (wr() - 0.5) * 15;
      const f = fieldAt(px, py);
      if (f > 0.30 || inFurn(px, py)) continue;
      if (wr() < 0.34) continue;
      const a = swell(px, py) * 0.42;
      const ca = Math.cos(a), sa = Math.sin(a);
      const rows = f > 0.05 || wr() < 0.42 ? 2 : 1;
      const l = 4.5 + wr() * 6.5;
      for (let r = 0; r < rows; r++) {
        const oy = (r - (rows - 1) / 2) * 3.4;
        const ox = -sa * oy, oyy = ca * oy;
        const bx = px + ox, by = py + oyy;
        const h = 1.7 + wr() * 0.7;`,
`      const px = x + (wr() - 0.5) * 19, py = y + (wr() - 0.5) * 15;
      const gate = wr(), rowGate = wr();
      const l = 4.5 + wr() * 6.5;
      const h1 = 1.7 + wr() * 0.7, h2 = 1.7 + wr() * 0.7;
      const f = fieldAt(px, py);
      if (f > 0.30 || gate < 0.34) continue;
      if (base && inFurn(px, py)) continue;
      if (!inVp(px, py, 18)) continue;
      const a = swell(px, py) * 0.42;
      const ca = Math.cos(a), sa = Math.sin(a);
      const rows = f > 0.05 || rowGate < 0.42 ? 2 : 1;
      for (let r = 0; r < rows; r++) {
        const oy = (r - (rows - 1) / 2) * 3.4;
        const ox = -sa * oy, oyy = ca * oy;
        const bx = px + ox, by = py + oyy;
        const h = r === 0 ? h1 : h2;`);

/* R6: coastal hatching culled by ring bbox */
rep(`  for (const R of rings) {
    if (R.area < 40) continue;
    const p = R.pts, n = p.length;`,
`  for (const R of rings) {
    if (R.area < 40) continue;
    if (!R.bb) R.bb = polyBBox(R.pts);
    if (R.bb.maxx < vp.x0 - 14 || R.bb.minx > vp.x1 + 14 ||
        R.bb.maxy < vp.y0 - 14 || R.bb.miny > vp.y1 + 14) continue;
    const p = R.pts, n = p.length;`);

/* R7: interior dunes, places, rocks culled */
rep(`  const dr = rngFor('dunes');
  g.fillStyle = INK + '0.10)';
  for (let i = 0; i < 3400; i++) {
    const x = dr() * CHART_W, y = dr() * CHART_H;
    g.fillRect(x, y, 0.8, 0.8);
  }
  for (const I of geo.places) drawPlaceMark(g, I);
  g.restore();
  for (const I of geo.rocks) {
    g.fillStyle = INK + '0.8)';
    g.beginPath(); g.arc(I.cx, I.cy, 1.6, 0, TAU); g.fill();
  }`,
`  const dr = rngFor('dunes');
  g.fillStyle = INK + '0.10)';
  for (let i = 0; i < 3400; i++) {
    const x = dr() * CHART_W, y = dr() * CHART_H;
    if (!inVp(x, y, 2)) continue;
    g.fillRect(x, y, 0.8, 0.8);
  }
  for (const I of geo.places) { if (inVp(I.cx, I.cy, 60)) drawPlaceMark(g, I); }
  g.restore();
  for (const I of geo.rocks) {
    if (!inVp(I.cx, I.cy, 6)) continue;
    g.fillStyle = INK + '0.8)';
    g.beginPath(); g.arc(I.cx, I.cy, 1.6, 0, TAU); g.fill();
  }`);

/* R8: beasts culled */
rep(`  for (const B of geo.beasts) {
    drawBeast(g, B);
    if (B.band) {`,
`  for (const B of geo.beasts) {
    if (!inVp(B.x, B.y, B.L * 1.5)) continue;
    drawBeast(g, B);
    if (B.band) {`);

/* R9: furniture leaves the bake; paintFurniture + crispChartRender arrive */
rep(`  drawRose(g, ROSE.x, ROSE.y, ROSE.r);
  drawCartouche(g, CART);
  drawPanel(g, KEYB);
  drawPanel(g, DIRS);
  drawKeyGlyphs(g, KEYB);
  drawScaleBar(g, SCAL);
  g.restore();

  /* the torn edge itself, inked and browned */
  g.save();
  g.beginPath(); pathThrough(g, vell, true);
  g.strokeStyle = 'rgba(112,80,40,0.42)'; g.lineWidth = 2.2; g.stroke();
  g.strokeStyle = 'rgba(70,48,22,0.30)'; g.lineWidth = 0.8; g.stroke();
  g.restore();

  chart.sheet = c;
}`,
`  drawRose(g, ROSE.x, ROSE.y, ROSE.r);
  g.restore();

  /* the torn edge itself, inked and browned */
  g.save();
  g.beginPath(); pathThrough(g, vell, true);
  g.strokeStyle = 'rgba(112,80,40,0.42)'; g.lineWidth = 2.2; g.stroke();
  g.strokeStyle = 'rgba(70,48,22,0.30)'; g.lineWidth = 0.8; g.stroke();
  g.restore();
}

/* the four table instruments stay pinned to the glass while the sheet moves
   beneath them: the readout, the key, the directions and the scale are the
   utility path, and the utility path does not zoom away */
function paintFurniture(g) {
  const solid = !chartViewIdent();
  drawCartouche(g, CART);
  drawPanel(g, KEYB, solid);
  drawPanel(g, DIRS, solid);
  drawKeyGlyphs(g, KEYB);
  drawScaleBar(g, SCAL);
}

/* the crisp re-engraving of the visible window at the settled view: a gesture
   rides on a cheap blit of the baked sheet, and this replaces it */
function crispChartRender() {
  if (!chart.geo || chartViewIdent()) { chart.zoomKey = ''; return; }
  const dpr = chart.dpr;
  if (!chart.zoomCv) {
    chart.zoomCv = document.createElement('canvas');
    chart.zoomCv.width = Math.round(CHART_W * dpr);
    chart.zoomCv.height = Math.round(CHART_H * dpr);
  }
  const g = chart.zoomCv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, CHART_W, CHART_H);
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.save();
  g.translate(chart.tx, chart.ty);
  g.scale(chart.z, chart.z);
  const vp = {
    x0: -chart.tx / chart.z, y0: -chart.ty / chart.z,
    x1: (CHART_W - chart.tx) / chart.z, y1: (CHART_H - chart.ty) / chart.z
  };
  paintSheetGeo(g, chart.geo, vp, false);
  g.restore();
  chart.zoomKey = chart.z.toFixed(4) + ',' + chart.tx.toFixed(1) + ',' + chart.ty.toFixed(1);
}`);

/* R10: drawPanel gains solidity when the sheet moves beneath it */
rep(`function drawPanel(g, B) {
  g.fillStyle = 'rgba(245,238,220,0.86)';`,
`function drawPanel(g, B, solid) {
  g.fillStyle = solid ? 'rgba(245,238,220,0.97)' : 'rgba(245,238,220,0.86)';`);

/* R11: the scale re-letters itself at every stop */
rep(`  g.fillStyle = 'rgba(244,236,216,0.72)';
  g.fillRect(B.x + 4, B.y - 2, B.w - 8, B.h + 4);`,
`  g.fillStyle = chartViewIdent() ? 'rgba(244,236,216,0.72)' : 'rgba(244,236,216,0.95)';
  g.fillRect(B.x + 4, B.y - 2, B.w - 8, B.h + 4);`);
rep(`  const nmPerPx = world.nmPerUnit / chart.k;
  const span = 20;                                   // twenty nautical miles
  const len = span / nmPerPx;`,
`  const nmPerPx = world.nmPerUnit / (chart.k * chart.z);
  /* the widest round span the box will hold: lean in and the scale re-letters */
  let span = 1;
  for (const s of [40, 20, 12, 8, 4, 2, 1]) { if (s / nmPerPx <= B.w - 40) { span = s; break; } }
  const len = span / nmPerPx;`);

/* R12: a beast is cut from the same block every time */
rep(`function drawBeast(g, B) {
  const L = B.L, T = (u, v) => [B.x + B.flip * u * L, B.y + v * L];`,
`function drawBeast(g, B) {
  /* reseed her drawing hand per call: the same beast is cut from the same
     block every time the sheet is re-engraved at a new zoom */
  B.rnd = rngFor('bod:' + B.isle.slug);
  const L = B.L, T = (u, v) => [B.x + B.flip * u * L, B.y + v * L];`);

/* R13: the visit rides the view */
rep(`function drawChartVisit(g) {
  if (visit.track.length > 1) {`,
`function drawChartVisit(g) {
  const Z = chart.z, TXv = chart.tx, TYv = chart.ty;
  const VV = p => [p[0] * Z + TXv, p[1] * Z + TYv];
  if (visit.track.length > 1) {`);
rep(`      const p = chartProject(t.x, t.y);
      if (!started) { g.moveTo(p[0], p[1]); started = true; } else g.lineTo(p[0], p[1]);`,
`      const p = VV(chartProject(t.x, t.y));
      if (!started) { g.moveTo(p[0], p[1]); started = true; } else g.lineTo(p[0], p[1]);`);
rep(`      if (B) { x = B.x; y = B.y; } else { const p = chartProject(I.pos.x, I.pos.y); x = p[0]; y = p[1]; }
    }
    const r = 4.2;`,
`      if (B) { x = B.x; y = B.y; } else { const p = chartProject(I.pos.x, I.pos.y); x = p[0]; y = p[1]; }
    }
    x = x * Z + TXv; y = y * Z + TYv;
    const r = 4.2;`);
rep(`  const sp = chartProject(ship.x, ship.y);
  g.save();
  g.translate(sp[0], sp[1]);`,
`  const sp = VV(chartProject(ship.x, ship.y));
  g.save();
  g.translate(sp[0], sp[1]);`);

/* R14: drawChart splits into full draw + canvas-only + the glass machinery */
rep(`  const t0 = performance.now();
  const geo = buildChartGeo();
  if (!chart.sheet) { measureBands(geo); bakeChartSheet(geo); }
  const g = chart.g, dpr = chart.dpr;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, CHART_W, CHART_H);
  g.drawImage(chart.sheet, 0, 0, CHART_W, CHART_H);
  g.lineJoin = 'round'; g.lineCap = 'round';
  drawChartVisit(g);
  layoutChartDom();
  showChartInfo(chart.hover);
  chart.ready = true;
  diag.chartMs = +(performance.now() - t0).toFixed(1);
}`,
`  const t0 = performance.now();
  const geo = buildChartGeo();
  if (!chart.sheet) { measureBands(geo); bakeChartSheet(geo); }
  drawChartCanvas();
  layoutChartDom();
  showChartInfo(chart.hover);
  chart.ready = true;
  diag.chartMs = +(performance.now() - t0).toFixed(1);
}

/* the canvas alone: what a gesture frame is allowed to cost */
function drawChartCanvas() {
  if (!chart.g || !chart.sheet) return;
  const g = chart.g, dpr = chart.dpr;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, CHART_W, CHART_H);
  if (chartViewIdent()) {
    g.drawImage(chart.sheet, 0, 0, CHART_W, CHART_H);
  } else {
    const key = chart.z.toFixed(4) + ',' + chart.tx.toFixed(1) + ',' + chart.ty.toFixed(1);
    if (chart.zoomCv && chart.zoomKey === key) {
      g.drawImage(chart.zoomCv, 0, 0, CHART_W, CHART_H);
    } else {
      g.save();
      g.imageSmoothingEnabled = true;
      try { g.imageSmoothingQuality = 'high'; } catch (err) {}
      g.translate(chart.tx, chart.ty);
      g.scale(chart.z, chart.z);
      g.drawImage(chart.sheet, 0, 0, CHART_W, CHART_H);
      g.restore();
    }
  }
  g.lineJoin = 'round'; g.lineCap = 'round';
  drawChartVisit(g);
  paintFurniture(g);
  diag.chartView = { z: +chart.z.toFixed(3), tx: Math.round(chart.tx), ty: Math.round(chart.ty) };
}

/* eased approach to the target view; reduced motion arrives at once */
function chartAnimTick() {
  chart.anim = 0;
  if (ui.mode !== 'below' || ui.tab !== 'chart') { chartSnapToTarget(); return; }
  const ease = REDUCED ? 1 : 0.30;
  chart.z = lerp(chart.z, chart.zt, ease);
  chart.tx = lerp(chart.tx, chart.txt, ease);
  chart.ty = lerp(chart.ty, chart.tyt, ease);
  const done = Math.abs(chart.z - chart.zt) < 0.0015 &&
    Math.abs(chart.tx - chart.txt) < 0.3 && Math.abs(chart.ty - chart.tyt) < 0.3;
  if (done) chartSnapToTarget();
  chartClampView();
  drawChartCanvas();
  syncLabelTransform();
  if (!done) chart.anim = requestAnimationFrame(chartAnimTick);
  else chartSettle();
}
function chartSnapToTarget() {
  chart.z = chart.zt; chart.tx = chart.txt; chart.ty = chart.tyt;
  chartClampView();
}
function kickChartAnim() {
  if (REDUCED) {
    chartSnapToTarget();
    drawChartCanvas();
    syncLabelTransform();
    chartSettle();
    return;
  }
  if (!chart.anim) chart.anim = requestAnimationFrame(chartAnimTick);
}
/* the settled view: re-engrave the window crisp and re-set the lettering */
function chartSettle() {
  clearTimeout(chart.crispT);
  chart.crispT = setTimeout(() => {
    if (ui.mode !== 'below' || ui.tab !== 'chart' || !chart.cv) return;
    crispChartRender();
    drawChartCanvas();
    layoutChartDom();
    showChartInfo(chart.hover);
  }, REDUCED ? 0 : 110);
}
/* between full layouts, the lettering rides the gesture on one transform */
function syncLabelTransform() {
  const el = document.getElementById('clgeo'), L = chart.layoutView;
  if (!el || !L) return;
  const s = chart.z / L.z;
  const ttx = L.dx + chart.tx * L.S - s * (L.dx + L.tx * L.S);
  const tty = L.dy + chart.ty * L.S - s * (L.dy + L.ty * L.S);
  el.style.transform = 'translate(' + ttx.toFixed(2) + 'px,' + tty.toFixed(2) + 'px) scale(' + s.toFixed(4) + ')';
}
/* +/- steps, 0 home: the keys zoom about the centre of the glass */
function chartKeyZoom(k) {
  if (k === '0') { chart.zt = 1; chart.txt = 0; chart.tyt = 0; }
  else {
    const f = (k === '-' || k === '_') ? 1 / 1.7 : 1.7;
    chartZoomAbout(CHART_W / 2, CHART_H / 2, chart.zt * f);
  }
  kickChartAnim();
}`);

/* R15: picking goes through the glass */
rep(`  const x = (evx - r.left) * CHART_W / r.width, y = (evy - r.top) * CHART_H / r.height;`,
`  const x = ((evx - r.left) * CHART_W / r.width - chart.tx) / chart.z;
  const y = ((evy - r.top) * CHART_H / r.height - chart.ty) / chart.z;`);

fs.writeFileSync(F, src);
console.log('patch part 1 applied: ' + n + ' replacements');
