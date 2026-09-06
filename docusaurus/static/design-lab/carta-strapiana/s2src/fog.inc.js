/* ============================================================
   STAGE 2, IDEA 1 - YOUR CHART IS DRAWN BY YOUR VOYAGES
   The chart opens as THE KNOWN CHART: only the waters this visit has
   actually sailed are firmly inked; everything else lies under banks of
   engraved cloud, pale rumor beneath ("by report only"). The soundings the
   leadsman actually took are numbered along the track. A switch on the
   sheet lifts the fog - THE FULL CHART - the banks rolling off downwind,
   eased and directional; switching back rolls them home. Reduced motion
   swaps at once. Everything persists for the visit through the same store
   the log uses. Every hole in the fog is a place the keel truly went.
   ============================================================ */
const FOG_SEE_NM = 1.35;         /* the horizon a deck credibly surveys */
function fogCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; }         /* the horizon a deck credibly surveys */
const fog = {
  mode: store.get('fogmode', 'known') === 'full' ? 'full' : 'known',
  cellNm: 0.55,
  seen: new Set(store.get('seen', [])),
  cols: 0, rows: 0, gx0: 0, gy0: 0, cu: 0,
  ready: false, dirty: true, seenDirty: false,
  washCv: null, puffCv: null, puffs: [], stamps: null,
  zoomCv: null, zoomKey: '', specs: null, holeCv: null,
  anim: false, animT0: 0, animDur: 1600, animDir: 1, animRaf: 0,
  vell: null
};

function fogInitGrid() {
  if (fog.ready || !world.bounds) return;
  const B = world.bounds, mgn = 2.4 / world.nmPerUnit;
  fog.cu = fog.cellNm / world.nmPerUnit;
  fog.gx0 = B.minx - mgn; fog.gy0 = B.miny - mgn;
  fog.cols = Math.max(8, Math.ceil((B.maxx - B.minx + mgn * 2) / fog.cu));
  fog.rows = Math.max(8, Math.ceil((B.maxy - B.miny + mgn * 2) / fog.cu));
  fog.ready = true;
  diag.fogGrid = { cols: fog.cols, rows: fog.rows, cellNm: fog.cellNm };
}
function fogIdx(gx, gy) { return gy * fog.cols + gx; }
function fogSeenAt(x, y) {
  if (!fog.ready) return true;
  const gx = Math.floor((x - fog.gx0) / fog.cu), gy = Math.floor((y - fog.gy0) / fog.cu);
  if (gx < 0 || gy < 0 || gx >= fog.cols || gy >= fog.rows) return false;
  return fog.seen.has(fogIdx(gx, gy));
}
/* the keel surveys a disk of water around herself */
function fogSee(x, y, rNm) {
  if (!fog.ready) return;
  const r = (rNm || FOG_SEE_NM) / world.nmPerUnit;
  const g0x = Math.max(0, Math.floor((x - r - fog.gx0) / fog.cu));
  const g1x = Math.min(fog.cols - 1, Math.floor((x + r - fog.gx0) / fog.cu));
  const g0y = Math.max(0, Math.floor((y - r - fog.gy0) / fog.cu));
  const g1y = Math.min(fog.rows - 1, Math.floor((y + r - fog.gy0) / fog.cu));
  let grew = false;
  for (let gy = g0y; gy <= g1y; gy++) for (let gx = g0x; gx <= g1x; gx++) {
    const cx = fog.gx0 + (gx + 0.5) * fog.cu, cy = fog.gy0 + (gy + 0.5) * fog.cu;
    if ((cx - x) * (cx - x) + (cy - y) * (cy - y) > r * r) continue;
    const k = fogIdx(gx, gy);
    if (!fog.seen.has(k)) { fog.seen.add(k); grew = true; }
  }
  if (grew) { fog.dirty = true; fog.seenDirty = true; diag.fogSeen = fog.seen.size; }
}
/* a passage is sailed water: the corridor of the crossing is surveyed too */
function fogSeePath(ax, ay, bx, by, rNm) {
  const d = Math.hypot(bx - ax, by - ay);
  const step = (rNm || 0.8) / world.nmPerUnit * 0.9;
  const n = Math.max(1, Math.ceil(d / step));
  for (let i = 0; i <= n; i++) fogSee(lerp(ax, bx, i / n), lerp(ay, by, i / n), rNm || 0.8);
}
function fogPersist() {
  if (!fog.seenDirty) return;
  fog.seenDirty = false;
  store.set('seen', [...fog.seen]);
  store.set('fogmode', fog.mode);
}
function isleSeen(I) { return visit.charted.has(I.slug) || fogSeenAt(I.pos.x, I.pos.y); }
function fogHides(I) {
  /* the waters you are BOUND FOR are pricked on the chart by your own
     sailing orders: the maiden Quick Start above all - QUICK START FIRST
     must hold on every path, fog or no fog */
  if (I === ship.bound || (story.maiden && story.qs && I === story.qs)) return false;
  return fog.mode === 'known' && !fog.anim && !isleSeen(I);
}
function fogRumorAt(sx, sy) {
  if (fog.mode !== 'known') return false;
  return !fogSeenAt((sx - chart.ox) / chart.k, (sy - chart.oy) / chart.k);
}
function fogSeenCount() {
  let n = 0;
  for (const I of world.islands) if (isleSeen(I)) n++;
  return n;
}

/* ---- the engraved cloud banks: one geometry, two hands.
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
}

function fogVellumPts() {
  if (!fog.vell) fog.vell = tornSheetPath(null);
  return fog.vell;
}

/* ---- the fog layers, rebuilt only when the seen water grows ---- */
function rebuildFog() {
  if (!fog.ready || !chart.geo) return;
  fog.dirty = false;
  bakeFogStamps();
  const dpr = Math.min(chart.dpr || 1, 2);
  /* THE WASH: pale rumor over everything unsurveyed, holes where the keel went */
  if (!fog.washCv) fog.washCv = fogCanvas(CHART_W * dpr, CHART_H * dpr);
  {
    const g = fog.washCv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, CHART_W, CHART_H);
    g.save();
    g.beginPath(); pathThrough(g, fogVellumPts(), true); g.clip();
    g.fillStyle = 'rgba(238,229,207,0.86)';
    g.fillRect(0, 0, CHART_W, CHART_H);
    /* a light unknown-water hatch, the draughtsman's "no survey here" */
    g.strokeStyle = INK + '0.045)';
    g.lineWidth = 0.7;
    g.beginPath();
    for (let x = -CHART_H; x < CHART_W; x += 11) {
      g.moveTo(x, 0); g.lineTo(x + CHART_H, CHART_H);
    }
    g.stroke();
    /* the holes: every surveyed cell is cut out with a soft edge */
    const hole = fogHole();
    g.globalCompositeOperation = 'destination-out';
    const cellPx = fog.cu * chart.k;
    const hr = Math.max(7, cellPx * 1.65);
    for (const k of fog.seen) {
      const gy = Math.floor(k / fog.cols), gx = k - gy * fog.cols;
      const wx = fog.gx0 + (gx + 0.5) * fog.cu, wy = fog.gy0 + (gy + 0.5) * fog.cu;
      const p = chartProject(wx, wy);
      if (p[0] < -40 || p[0] > CHART_W + 40 || p[1] < -40 || p[1] > CHART_H + 40) continue;
      g.drawImage(hole, p[0] - hr, p[1] - hr, hr * 2, hr * 2);
    }
    g.globalCompositeOperation = 'source-over';
    /* the honest words on the unsurveyed mains */
    g.font = 'italic 15px "Iowan Old Style", Palatino, Georgia, serif';
    g.fillStyle = INK + '0.42)';
    g.textAlign = 'center';
    for (const key of ['cms', 'cloud']) {
      const K = world.continents[key];
      let anySeen = false;
      for (const I of world.islands) {
        if (I.product === key && isleSeen(I)) { anySeen = true; break; }
      }
      if (anySeen) continue;
      const p = chartProject(K.x, K.y);
      g.fillText('by report only', p[0], p[1] + 34);
    }
    g.restore();
  }
  /* THE BANKS: engraved cloud over the unknown, each with its own wind */
  fog.puffs = [];
  const step = 27;
  const rnd = rngFor('fogfield');
  for (let sy = 24; sy < CHART_H - 18; sy += step) {
    for (let sx = 24; sx < CHART_W - 18; sx += step) {
      const jx = sx + (rnd() - 0.5) * 14, jy = sy + (rnd() - 0.5) * 12;
      /* the four table instruments stay clear: they sit ON the sheet */
      let onFurn = false;
      for (const R of FURN) {
        if (jx > R.x - 8 && jx < R.x + R.w + 8 && jy > R.y - 8 && jy < R.y + R.h + 8) { onFurn = true; break; }
      }
      if (onFurn) continue;
      const wx = (jx - chart.ox) / chart.k, wy = (jy - chart.oy) / chart.k;
      if (fogSeenAt(wx, wy)) continue;
      const w = windAtUnits(wx, wy);
      const wm = Math.hypot(w.x, w.y) || 1;
      fog.puffs.push({
        x: jx, y: jy,
        s: 0.55 + rnd() * 0.75,
        v: Math.floor(rnd() * 3),
        wx: w.x / wm, wy: w.y / wm,
        ph: rnd()
      });
    }
  }
  /* the directional stagger: banks nearest the wind's own exit go first */
  let dmin = 1e9, dmax = -1e9;
  for (const P of fog.puffs) {
    P.dd = P.x * P.wx + P.y * P.wy;
    if (P.dd < dmin) dmin = P.dd;
    if (P.dd > dmax) dmax = P.dd;
  }
  const span = Math.max(1, dmax - dmin);
  for (const P of fog.puffs) P.dd = 1 - (P.dd - dmin) / span;
  /* the static bank plate, so a gesture frame blits two canvases and no more */
  if (!fog.puffCv) fog.puffCv = fogCanvas(CHART_W * dpr, CHART_H * dpr);
  {
    const g = fog.puffCv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, CHART_W, CHART_H);
    g.save();
    g.beginPath(); pathThrough(g, fogVellumPts(), true); g.clip();
    for (const P of fog.puffs) fogStampPuff(g, P, 1);
    g.restore();
  }
  diag.fogPuffs = fog.puffs.length;
}
function fogStampPuff(g, P, a) {
  const st = fog.stamps[P.v];
  const w = st.width / 2 * P.s, h = st.height / 2 * P.s;
  g.globalAlpha = a * (0.72 + 0.22 * P.ph);
  g.drawImage(st, P.x - w / 2, P.y - h / 2, w, h);
  g.globalAlpha = 1;
}

/* ---- the fog on the glass: cheap at rest, alive under the switch ---- */
function fogVisibleNow() { return fog.mode === 'known' || fog.anim; }
function easeFog(t) { return t * t * (3 - 2 * t); }
function fogZoomKeyNow() {
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
  g.save();
  g.translate(chart.tx, chart.ty);
  g.scale(chart.z, chart.z);
  let p;   /* 0 = the fog at home, 1 = lifted clean off */
  if (fog.anim) {
    const t = clamp((performance.now() - fog.animT0) / fog.animDur, 0, 1);
    p = fog.animDir > 0 ? easeFog(t) : 1 - easeFog(t);
  } else p = fog.mode === 'known' ? 0 : 1;
  if (p < 0.999) {
    g.globalAlpha = 1 - p;
    g.drawImage(fog.washCv, 0, 0, CHART_W, CHART_H);
    g.globalAlpha = 1;
  }
  if (!fog.anim) {
    if (p < 0.5) g.drawImage(fog.puffCv, 0, 0, CHART_W, CHART_H);
  } else {
    /* the reveal itself: every bank rolls off downwind, staggered so the
       lift crosses the sheet the way a clearing crosses a real sea */
    g.beginPath(); pathThrough(g, fogVellumPts(), true); g.clip();
    for (const P of fog.puffs) {
      const pp = clamp(p * 1.45 - P.dd * 0.45, 0, 1);
      if (pp >= 0.999) continue;
      const e = easeFog(pp);
      const run = e * (120 + 130 * P.ph);
      const sx = P.x, sy = P.y;
      P.x = sx + P.wx * run; P.y = sy + P.wy * run + e * e * 8;
      fogStampPuff(g, P, 1 - e);
      P.x = sx; P.y = sy;
    }
  }
  g.restore();
}

function fogSetMode(mode, animate) {
  mode = mode === 'full' ? 'full' : 'known';
  if (mode === fog.mode && !fog.anim) { fogSyncSwitch(); return; }
  if (fog.dirty) rebuildFog();
  fog.mode = mode;
  store.set('fogmode', fog.mode);
  diag.fogMode = fog.mode;
  fogSyncSwitch();
  const instant = REDUCED || animate === false;
  cancelAnimationFrame(fog.animRaf);
  if (instant) {
    fog.anim = false;
    drawChartCanvas();
    layoutChartDom();
    showChartInfo(chart.hover);
    return;
  }
  fog.anim = true;
  fog.animT0 = performance.now();
  fog.animDir = mode === 'full' ? 1 : -1;
  const tick = () => {
    if (!fog.anim) return;
    const done = performance.now() - fog.animT0 >= fog.animDur;
    drawChartCanvas();
    if (done) {
      fog.anim = false;
      drawChartCanvas();
      layoutChartDom();
      showChartInfo(chart.hover);
      return;
    }
    fog.animRaf = requestAnimationFrame(tick);
  };
  fog.animRaf = requestAnimationFrame(tick);
}
function fogSyncSwitch() {
  const el = $('fogswitch');
  if (!el) return;
  el.classList.toggle('full', fog.mode === 'full');
  el.setAttribute('aria-checked', fog.mode === 'full' ? 'true' : 'false');
}
function fogDiag() {
  return { mode: fog.mode, anim: fog.anim, seenCells: fog.seen.size,
    seenIsles: fogSeenCount(), puffs: fog.puffs.length,
    soundings: visit.soundings.length };
}

/* ---- the soundings the leadsman actually took, numbered on the sheet ---- */
function s2Sounding(f) {
  const S = visit.soundings;
  const last = S[S.length - 1];
  if (last && Math.hypot(last.x - ship.x, last.y - ship.y) * world.nmPerUnit < 0.15) return;
  S.push({ x: ship.x, y: ship.y, f });
  if (S.length > 240) S.splice(0, S.length - 240);
  visit.save();
}
function drawSoundings(g) {
  if (fog.mode !== 'known' || !visit.soundings.length) return;
  const Z = chart.z, TXv = chart.tx, TYv = chart.ty;
  g.save();
  g.font = 'italic ' + (8.5 * Math.pow(Z, 0.3)).toFixed(1) + 'px "Iowan Old Style", Palatino, Georgia, serif';
  g.fillStyle = INK + '0.74)';
  g.textAlign = 'left';
  const seen = new Set();
  for (const s of visit.soundings) {
    const p = chartProject(s.x, s.y);
    const x = p[0] * Z + TXv, y = p[1] * Z + TYv;
    if (x < 8 || x > CHART_W - 8 || y < 8 || y > CHART_H - 8) continue;
    const key = Math.round(x / 14) + ',' + Math.round(y / 12);
    if (seen.has(key)) continue;   /* two casts in the same water print once */
    seen.add(key);
    g.save();
    /* the numeral sits beside the cast, as a leadsman's figure does,
       never under the ship's own mark */
    g.translate(x + 10, y - 9);
    g.rotate(-0.10 + ((s.f % 7) - 3) * 0.02);
    g.fillText(String(s.f), 0, 3);
    g.restore();
  }
  g.restore();
}
