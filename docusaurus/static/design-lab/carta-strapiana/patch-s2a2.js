/* STAGE 2 tranche A refinement: crisp fog at zoom stops + persist under way */
'use strict';
const fs = require('fs');
function edit(f, reps) {
  let s = fs.readFileSync(f, 'utf8'), n = 0;
  for (const [oldS, newS, tag] of reps) {
    const i = s.indexOf(oldS);
    if (i < 0) throw new Error('NOT FOUND [' + tag + '] in ' + f);
    if (s.indexOf(oldS, i + 1) >= 0) throw new Error('NOT UNIQUE [' + tag + '] in ' + f);
    s = s.slice(0, i) + newS + s.slice(i + oldS.length);
    n++;
  }
  fs.writeFileSync(f, s);
  console.log(f, n, 'edits');
}

const OLD_STAMPS = `/* ---- the engraved cloud stamps: woodcut billows, baked once ---- */
function bakeFogStamps() {
  if (fog.stamps) return;
  fog.stamps = [];
  for (let v = 0; v < 3; v++) {
    const rnd = rngFor('fogpuff:' + v);
    const c = fogCanvas(84, 56), g = c.getContext('2d');
    g.lineJoin = 'round'; g.lineCap = 'round';
    const cx = 42, cy = 34;
    /* the bank: a row of stacked billow arcs with a curled end, the same
       key the sky's woodcut clouds are cut to */
    g.fillStyle = 'rgba(240,231,210,0.96)';
    g.strokeStyle = INK + '0.52)';
    g.lineWidth = 1.05;
    g.beginPath();
    g.moveTo(cx - 34, cy + 10);
    let x = cx - 34;
    const lobes = 3 + Math.floor(rnd() * 2);
    for (let i = 0; i < lobes; i++) {
      const w = 14 + rnd() * 12, h = 9 + rnd() * 9;
      g.arc(x + w / 2, cy + 10 - h * 0.24, w / 2, Math.PI, 0, false);
      x += w;
    }
    g.lineTo(x, cy + 10);
    g.closePath();
    g.fill(); g.stroke();
    /* the curled end and the base line */
    g.beginPath();
    g.arc(x - 3, cy + 6, 4 + rnd() * 2, -0.6, Math.PI * 1.1);
    g.stroke();
    g.strokeStyle = INK + '0.30)';
    g.lineWidth = 0.6;
    for (let i = 0; i < 4; i++) {
      const yy = cy + 10 - 2 - i * 2.6, span = 26 - i * 5;
      g.beginPath(); g.moveTo(cx - span, yy); g.lineTo(cx + span * (0.7 + rnd() * 0.3), yy);
      g.stroke();
    }
    fog.stamps.push(c);
  }
}`;

const NEW_STAMPS = `/* ---- the engraved cloud banks: one geometry, two hands.
   The billows are laid down once as numbers; the bitmap stamps blit cheap
   through gestures and the lift, and the settled zoom redraws the very
   same banks as vectors so a magnified fog stays engraving, not pixels. ---- */
function mkPuffSpecs() {
  if (fog.specs) return;
  fog.specs = [];
  for (let v = 0; v < 3; v++) {
    const rnd = rngFor('fogpuff:' + v);
    const sp = { lobes: [], curlR: 0, fracs: [] };
    const n = 3 + Math.floor(rnd() * 2);
    for (let i = 0; i < n; i++) sp.lobes.push([14 + rnd() * 12, 9 + rnd() * 9]);
    sp.curlR = 4 + rnd() * 2;
    for (let i = 0; i < 4; i++) sp.fracs.push(0.7 + rnd() * 0.3);
    fog.specs.push(sp);
  }
}
function paintPuffShape(g, sp) {
  const cx = 42, cy = 34;
  /* the bank: a row of stacked billow arcs with a curled end, the same
     key the sky's woodcut clouds are cut to */
  g.fillStyle = 'rgba(240,231,210,0.96)';
  g.strokeStyle = INK + '0.52)';
  g.lineWidth = 1.05;
  g.beginPath();
  g.moveTo(cx - 34, cy + 10);
  let x = cx - 34;
  for (const wh of sp.lobes) {
    g.arc(x + wh[0] / 2, cy + 10 - wh[1] * 0.24, wh[0] / 2, Math.PI, 0, false);
    x += wh[0];
  }
  g.lineTo(x, cy + 10);
  g.closePath();
  g.fill(); g.stroke();
  /* the curled end and the base lines */
  g.beginPath();
  g.arc(x - 3, cy + 6, sp.curlR, -0.6, Math.PI * 1.1);
  g.stroke();
  g.strokeStyle = INK + '0.30)';
  g.lineWidth = 0.6;
  for (let i = 0; i < 4; i++) {
    const yy = cy + 10 - 2 - i * 2.6, span = 26 - i * 5;
    g.beginPath(); g.moveTo(cx - span, yy); g.lineTo(cx + span * sp.fracs[i], yy);
    g.stroke();
  }
}
function bakeFogStamps() {
  if (fog.stamps) return;
  mkPuffSpecs();
  fog.stamps = [];
  for (let v = 0; v < 3; v++) {
    const c = fogCanvas(84, 56), g = c.getContext('2d');
    g.lineJoin = 'round'; g.lineCap = 'round';
    paintPuffShape(g, fog.specs[v]);
    fog.stamps.push(c);
  }
}
function drawPuffVec(g, P, a) {
  g.save();
  g.translate(P.x, P.y);
  g.scale(P.s * 0.5, P.s * 0.5);
  g.translate(-42, -28);
  g.globalAlpha = a * (0.72 + 0.22 * P.ph);
  paintPuffShape(g, fog.specs[P.v]);
  g.restore();
}
function fogHole() {
  if (!fog.holeCv) {
    fog.holeCv = fogCanvas(64, 64);
    const hg = fog.holeCv.getContext('2d');
    const rg = hg.createRadialGradient(32, 32, 4, 32, 32, 32);
    rg.addColorStop(0, 'rgba(0,0,0,1)');
    rg.addColorStop(0.62, 'rgba(0,0,0,0.9)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    hg.fillStyle = rg; hg.fillRect(0, 0, 64, 64);
  }
  return fog.holeCv;
}`;

const OLD_HOLE = `    const hole = fogCanvas(64, 64);
    {
      const hg = hole.getContext('2d');
      const rg = hg.createRadialGradient(32, 32, 4, 32, 32, 32);
      rg.addColorStop(0, 'rgba(0,0,0,1)');
      rg.addColorStop(0.62, 'rgba(0,0,0,0.9)');
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      hg.fillStyle = rg; hg.fillRect(0, 0, 64, 64);
    }
    g.globalCompositeOperation = 'destination-out';`;
const NEW_HOLE = `    const hole = fogHole();
    g.globalCompositeOperation = 'destination-out';`;

const OLD_DRAWFOG = `function drawFog(g) {
  if (!world.ready || !chart.geo || !fogVisibleNow()) return;
  if (!fog.ready) fogInitGrid();
  if (fog.dirty) rebuildFog();
  if (!fog.washCv) return;
  g.save();`;
const NEW_DRAWFOG = `function fogZoomKeyNow() {
  return chart.z.toFixed(4) + ',' + chart.tx.toFixed(1) + ',' + chart.ty.toFixed(1) +
    ',' + fog.seen.size + ',' + fog.mode;
}
/* the settled zoom redraws the fog as vectors, the way the sheet itself is
   redrawn crisp: a magnified bank stays an engraving */
function crispFogRender() {
  if (!fog.ready || !chart.geo || fog.anim) return;
  if (fog.mode !== 'known' || chartViewIdent()) { fog.zoomKey = ''; return; }
  if (fog.dirty) rebuildFog();
  const key = fogZoomKeyNow();
  if (fog.zoomKey === key && fog.zoomCv) return;
  const dpr = Math.min(chart.dpr || 1, 2);
  if (!fog.zoomCv) fog.zoomCv = fogCanvas(CHART_W * dpr, CHART_H * dpr);
  const g = fog.zoomCv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, CHART_W, CHART_H);
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.save();
  g.translate(chart.tx, chart.ty);
  g.scale(chart.z, chart.z);
  g.beginPath(); pathThrough(g, fogVellumPts(), true); g.clip();
  /* the wash, magnified as an engraving magnifies */
  g.fillStyle = 'rgba(238,229,207,0.86)';
  g.fillRect(0, 0, CHART_W, CHART_H);
  g.strokeStyle = INK + '0.045)';
  g.lineWidth = 0.7;
  g.beginPath();
  for (let x = -CHART_H; x < CHART_W; x += 11) {
    g.moveTo(x, 0); g.lineTo(x + CHART_H, CHART_H);
  }
  g.stroke();
  const hole = fogHole();
  g.globalCompositeOperation = 'destination-out';
  const cellPx = fog.cu * chart.k;
  const hr = Math.max(7, cellPx * 1.65);
  for (const k of fog.seen) {
    const gy = Math.floor(k / fog.cols), gx = k - gy * fog.cols;
    const wx = fog.gx0 + (gx + 0.5) * fog.cu, wy = fog.gy0 + (gy + 0.5) * fog.cu;
    const p = chartProject(wx, wy);
    g.drawImage(hole, p[0] - hr, p[1] - hr, hr * 2, hr * 2);
  }
  g.globalCompositeOperation = 'source-over';
  g.font = 'italic 15px "Iowan Old Style", Palatino, Georgia, serif';
  g.fillStyle = INK + '0.42)';
  g.textAlign = 'center';
  for (const key2 of ['cms', 'cloud']) {
    const K = world.continents[key2];
    let anySeen = false;
    for (const I of world.islands) {
      if (I.product === key2 && isleSeen(I)) { anySeen = true; break; }
    }
    if (anySeen) continue;
    const p = chartProject(K.x, K.y);
    g.fillText('by report only', p[0], p[1] + 34);
  }
  /* the banks themselves, cut fresh as vectors at this magnification */
  for (const P of fog.puffs) drawPuffVec(g, P, 1);
  g.restore();
  fog.zoomKey = key;
}
function drawFog(g) {
  if (!world.ready || !chart.geo || !fogVisibleNow()) return;
  if (!fog.ready) fogInitGrid();
  if (fog.dirty) rebuildFog();
  if (!fog.washCv) return;
  /* at rest on a magnified view, the settled crisp plate stands in whole */
  if (!fog.anim && !chartViewIdent() && fog.zoomCv && fog.zoomKey === fogZoomKeyNow()) {
    g.drawImage(fog.zoomCv, 0, 0, CHART_W, CHART_H);
    return;
  }
  g.save();`;

for (const f of ['deadreckoning.js', 's2src/fog.inc.js']) {
  edit(f, [
    [`washCv: null, puffCv: null, puffs: [], stamps: null,`,
     `washCv: null, puffCv: null, puffs: [], stamps: null,
  zoomCv: null, zoomKey: '', specs: null, holeCv: null,`, 'fog-fields'],
    [OLD_STAMPS, NEW_STAMPS, 'stamps'],
    [OLD_HOLE, NEW_HOLE, 'hole'],
    [OLD_DRAWFOG, NEW_DRAWFOG, 'drawfog-crisp']
  ]);
}

/* main file only: the settle hook and the persist under way */
edit('deadreckoning.js', [
  [`    crispChartRender();
    drawChartCanvas();`,
   `    crispChartRender();
    crispFogRender();
    drawChartCanvas();`, 'settle-hook'],
  [`  fogSee(ship.x, ship.y, FOG_SEE_NM);
  const last = visit.track[visit.track.length - 1];`,
   `  fogSee(ship.x, ship.y, FOG_SEE_NM);
  fogPersist();
  const last = visit.track[visit.track.length - 1];`, 'track-persist']
]);
console.log('ok');
