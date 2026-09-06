/* Wave 8, zoom round, part 2: lettering LOD in view space + the hand on the glass. */
'use strict';
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, 'deadreckoning.js');
let src = fs.readFileSync(F, 'utf8');
let n = 0;

function rep(find, replace) {
  const i = src.indexOf(find);
  if (i < 0) { console.error('ANCHOR ' + (++n) + ' NOT FOUND:\n' + find.slice(0, 140)); process.exit(1); }
  if (src.indexOf(find, i + 1) >= 0) { console.error('ANCHOR ' + (++n) + ' AMBIGUOUS:\n' + find.slice(0, 140)); process.exit(1); }
  src = src.slice(0, i) + replace + src.slice(i + find.length);
  n++;
}

/* ---- R16: layoutChartDom, rewritten in view space ---- */
const A = src.indexOf('function layoutChartDom() {');
const B = src.indexOf('\nfunction cartoucheHtml() {');
if (A < 0 || B < 0 || B <= A) { console.error('layoutChartDom span not found'); process.exit(1); }
const newLayout = `function layoutChartDom() {
  const geo = chart.geo, lab = $('chartlabels'), cv = chart.cv;
  const rect = cv.getBoundingClientRect();
  const host = lab.parentElement.getBoundingClientRect();
  const S = rect.width / CHART_W || 1;
  const dx = rect.left - host.left, dy = rect.top - host.top;
  const Z = chart.z, TX = chart.tx, TY = chart.ty;
  const vx = x => x * Z + TX, vy = y => y * Z + TY;
  const inView = (x, y, m) => x > -m && x < CHART_W + m && y > -m && y < CHART_H + m;
  /* free names keep a reading size: they grow only a little as the hand leans
     in, while the ink beneath them grows with the sheet */
  const zf = Math.pow(Z, 0.24);
  const boxes = [];
  const geoHtml = [], pinHtml = [];
  const hit = b => boxes.some(q => b.x0 < q.x1 && b.x1 > q.x0 && b.y0 < q.y1 && b.y1 > q.y0);
  const put = (arr, cls, text, x, y, w, h, style) => {
    boxes.push({ x0: x - w / 2, x1: x + w / 2, y0: y - h / 2, y1: y + h / 2 });
    arr.push('<div class="' + cls + '" style="left:' + (dx + x * S).toFixed(1) + 'px;top:' +
      (dy + y * S).toFixed(1) + 'px;' + (style || '') + '">' + text + '</div>');
  };
  for (const R of FURN) boxes.push({ x0: R.x - 4, x1: R.x + R.w + 4, y0: R.y - 4, y1: R.y + R.h + 4 });

  /* --- the beasts' banderoles: lettering ON the ink, so it rides the zoom --- */
  for (const B of geo.beasts) {
    const bd = B.band;
    const bx = vx(B.x), by = vy(bd.y);
    if (!inView(bx, by, B.L * Z + 60)) continue;
    const fs = bd.fs * Z, lh = fs * 1.18;
    const inner = bd.lines.map(l => '<span>' + esc(l) + '</span>').join('');
    boxes.push({ x0: bx - bd.w * Z / 2 - 6, x1: bx + bd.w * Z / 2 + 6, y0: by - lh, y1: by + lh });
    geoHtml.push('<div class="cl-beast" style="left:' + (dx + bx * S).toFixed(1) + 'px;top:' +
      (dy + by * S).toFixed(1) + 'px;font-size:' + (fs * S).toFixed(2) + 'px;line-height:' +
      (lh * S).toFixed(2) + 'px">' + inner + '</div>');
    boxes.push({ x0: vx(B.x - B.L * 0.52), x1: vx(B.x + B.L * 0.52), y0: vy(B.y - B.L * 0.42), y1: vy(B.y + B.L * 0.42) });
  }

  /* --- the archipelago names, set across their whole water --- */
  for (const A of geo.lands) {
    if (!A.arch) continue;
    const ax = vx(A.x), ay = vy(A.y);
    if (!inView(ax, ay, 220)) continue;
    const sp = 4.2 * zf, fs = 13.5 * zf;
    const t = A.name.toUpperCase();
    const w = textW(t, fs, '', sp) + 12, h = fs + 8;
    put(geoHtml, 'cl-arch', esc(t), ax, ay, w, h,
      'font-size:' + (fs * S).toFixed(2) + 'px;letter-spacing:' + (sp * S).toFixed(2) + 'px');
  }

  /* --- the lands --- */
  const regions = geo.regions.slice().sort((a2, b2) => b2.n - a2.n);
  for (const G of regions) {
    const prime = !!G.primary;
    const big = G.n >= 14 ? 12 : G.n >= 7 ? 10.6 : G.n >= 4 ? 9.4 : 8.6;
    const fs = (prime ? big : 8.4) * zf;
    const sp = (prime ? 2.5 : 1.6) * zf;
    let nm = G.name;
    if (nm.length > 27) nm = nm.slice(0, 25).replace(/[\\s,;:-]+$/, '') + '\\u2026';
    const t = (nm + (G.suffix ? ' ' + G.suffix : '')).toUpperCase();
    let w = textW(t, fs, '', sp) + 8, h = fs + 6;
    const gx = vx(G.x), gy = vy(G.y);
    if (!inView(gx, gy, 280)) continue;
    const topY = vy(G.bb.miny), botY = vy(G.bb.maxy);
    /* over her own ground if the name will sit there; otherwise directly under
       it, touching, so it can never read as a name adrift on open water */
    const tries = w < G.wide * Z * 1.45
      ? [[gx, gy], [gx, topY - h * 0.9], [gx, botY + h * 0.9]]
      : [[gx, botY + h * 0.85], [gx, topY - h * 0.85], [gx, gy]];
    let ok = false;
    for (const [px, py] of tries) {
      for (const dyy of [0, -h, h, -h * 2, h * 2]) {
        const bx = { x0: px - w / 2, x1: px + w / 2, y0: py + dyy - h / 2, y1: py + dyy + h / 2 };
        if (hit(bx)) continue;
        put(geoHtml, 'cl-land' + (prime ? '' : ' sat'), esc(t), px, py + dyy, w, h,
          'font-size:' + (fs * S).toFixed(2) + 'px;letter-spacing:' + (sp * S).toFixed(2) + 'px');
        ok = true; break;
      }
      if (ok) break;
    }
    if (ok) {
      /* the land already carries this name: her chief page is not lettered twice */
      const owner = prime ? (G.hub || G.chief) : G.chief;
      if (owner) {
        const n2 = t.replace(/ (ROCK|CAY|ISLE)$/, '');
        if (n2 === (owner.sidebarLabel || '').toUpperCase() || n2 === (owner.title || '').toUpperCase()) owner._suppress = true;
      }
    }
  }

  /* --- the places: leaning in, every name the window will hold --- */
  const ranked = geo.places.slice().sort((a, b) => b.mark.score - a.mark.score);
  let lettered = 0;
  for (const I of ranked) {
    if (I._suppress) continue;
    const px0 = vx(I.cx), py0 = vy(I.cy);
    if (!inView(px0, py0, 90)) continue;
    const t = I.sidebarLabel.length > 30 ? I.sidebarLabel.slice(0, 29) + '\\u2026' : I.sidebarLabel;
    const fs = (I.mark.kind === 'anchorage' ? 8.8 : 8.0) * zf;
    const w = textW(t, fs, '', 0.2) + 5, h = fs + 3.4;
    const s = I.mark.sz * Z;
    const tries = [[0, s * 2.3 + 4], [0, -(s * 2.3 + 4)], [w / 2 + s + 3, 0], [-(w / 2 + s + 3), 0]];
    if (Z >= 2.2) tries.push([w / 2 + s + 3, -(h * 0.8)], [-(w / 2 + s + 3), h * 0.8],
      [0, s * 2.3 + 4 + h], [0, -(s * 2.3 + 4 + h)]);
    for (const [ox, oy] of tries) {
      const b = { x0: px0 + ox - w / 2, x1: px0 + ox + w / 2, y0: py0 + oy - h / 2, y1: py0 + oy + h / 2 };
      if (hit(b)) continue;
      put(geoHtml, 'cl-place' + (I.mark.kind === 'anchorage' ? ' chief' : ''), esc(t), px0 + ox, py0 + oy, w, h,
        'font-size:' + (fs * S).toFixed(2) + 'px');
      lettered++;
      break;
    }
  }
  geo.lettered = lettered;

  /* --- the rose's letters ride the rose --- */
  /* no N: on this rose the fleur-de-lys is north, as she is on the old ones */
  for (const [t, a] of [['E', 0], ['S', Math.PI / 2], ['W', Math.PI]]) {
    const r = ROSE.r + 24;
    const rx = vx(ROSE.x + Math.cos(a) * r), ry = vy(ROSE.y + Math.sin(a) * r);
    if (!inView(rx, ry, 60)) continue;
    geoHtml.push('<div class="cl-rose" style="left:' + (dx + rx * S).toFixed(1) +
      'px;top:' + (dy + ry * S).toFixed(1) + 'px;font-size:' + (11 * Z * S).toFixed(2) + 'px">' + t + '</div>');
  }

  /* --- the scale's numerals: pinned with its bar --- */
  const SG = chart.scaleGeom;
  if (SG) {
    for (let i = 0; i <= 4; i++) {
      pinHtml.push('<div class="cl-num" style="left:' + (dx + (SG.x0 + SG.len * i / 4) * S).toFixed(1) +
        'px;top:' + (dy + (SG.y0 - 11) * S).toFixed(1) + 'px;font-size:' + (9 * S).toFixed(2) + 'px">' +
        (+((i * SG.span / 4).toFixed(2))) + '</div>');
    }
    pinHtml.push('<div class="cl-scaption" style="left:' + (dx + (SCAL.x + SCAL.w / 2) * S).toFixed(1) +
      'px;top:' + (dy + (SG.y0 + 20) * S).toFixed(1) + 'px;font-size:' + (10 * S).toFixed(2) + 'px">' +
      'A scale of ' + numToWords(SG.span) + ' nautical miles, by estimation</div>');
  }

  /* --- the cartouche --- */
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
  const ck = $('chartkey');
  ck.style.left = (dx + (KEYB.x + 14) * S).toFixed(1) + 'px';
  ck.style.top = (dy + (KEYB.y + 12) * S).toFixed(1) + 'px';
  ck.style.width = ((KEYB.w - 28) * S).toFixed(1) + 'px';
  ck.style.fontSize = (11 * S).toFixed(2) + 'px';
  ck.innerHTML = keyHtml(S);
}
`;
src = src.slice(0, A) + newLayout + src.slice(B + 1);
n++;

/* ---- R17: hover, click, and the glass's own gestures ---- */
rep(`  cv.addEventListener('mousemove', e => {
    const m = chartPick(e.clientX, e.clientY);`,
`  cv.addEventListener('mousemove', e => {
    if (chart.gesturing) return;
    const m = chartPick(e.clientX, e.clientY);`);

rep(`  cv.addEventListener('click', e => {
    const m = chartPick(e.clientX, e.clientY);
    if (!m) return;`,
`  cv.addEventListener('click', e => {
    if (chart.panned) { chart.panned = false; return; }
    const m = chartPick(e.clientX, e.clientY);
    if (!m) return;`);

rep(`  cv.addEventListener('dblclick', e => {
    const m = chartPick(e.clientX, e.clientY);
    chart.dbl = true;
    if (m) warpTo(m.isle.slug, 'packet');
  });`,
`  cv.addEventListener('dblclick', e => {
    const m = chartPick(e.clientX, e.clientY);
    chart.dbl = true;
    if (m) warpTo(m.isle.slug, 'packet');
  });

  /* --- the reading glass: wheel and pinch zoom about the hand, drag to pan --- */
  cv.addEventListener('wheel', e => {
    if (ui.tab !== 'chart') return;
    e.preventDefault();
    const r = cv.getBoundingClientRect();
    const cx = (e.clientX - r.left) * CHART_W / r.width;
    const cy = (e.clientY - r.top) * CHART_H / r.height;
    let d = e.deltaY;
    if (e.deltaMode === 1) d *= 33; else if (e.deltaMode === 2) d *= 400;
    chartZoomAbout(cx, cy, chart.zt * Math.exp(-d * 0.0021));
    kickChartAnim();
  }, { passive: false });

  const cptrs = new Map();
  let cpan = null, cpinch = null;
  cv.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    cptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    if (cptrs.size === 1) { chart.panned = false; cpan = { x: e.clientX, y: e.clientY, moved: 0 }; cpinch = null; }
    else if (cptrs.size === 2) {
      const [a, b] = [...cptrs.values()];
      cpinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: chart.zt };
      cpan = null;
    }
  });
  cv.addEventListener('pointermove', e => {
    const p = cptrs.get(e.pointerId);
    if (!p) return;
    const r = cv.getBoundingClientRect();
    const kx = CHART_W / r.width, ky = CHART_H / r.height;
    if (cptrs.size === 1 && cpan) {
      const mdx = e.clientX - cpan.x, mdy = e.clientY - cpan.y;
      cpan.moved += Math.abs(mdx) + Math.abs(mdy);
      cpan.x = e.clientX; cpan.y = e.clientY;
      if (cpan.moved > 5) { chart.panned = true; chart.gesturing = true; cv.classList.add('panning'); }
      if (chart.gesturing) {
        chart.txt += mdx * kx; chart.tyt += mdy * ky;
        chartClampTargets();
        chartSnapToTarget();
        drawChartCanvas();
        syncLabelTransform();
      }
    }
    p.x = e.clientX; p.y = e.clientY;
    if (cptrs.size === 2 && cpinch) {
      chart.gesturing = true;
      const [a, b] = [...cptrs.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const mx = ((a.x + b.x) / 2 - r.left) * kx, my = ((a.y + b.y) / 2 - r.top) * ky;
      chartZoomAbout(mx, my, cpinch.z * d / cpinch.d);
      chartSnapToTarget();
      drawChartCanvas();
      syncLabelTransform();
    }
  });
  const cptrEnd = e => {
    if (!cptrs.has(e.pointerId)) return;
    cptrs.delete(e.pointerId);
    if (cptrs.size === 0) {
      cpinch = null; cpan = null;
      cv.classList.remove('panning');
      if (chart.gesturing) { chart.gesturing = false; chartSettle(); }
    } else if (cptrs.size === 1) {
      cpinch = null;
      const [a] = [...cptrs.values()];
      cpan = { x: a.x, y: a.y, moved: 99 };
    }
  };
  cv.addEventListener('pointerup', cptrEnd);
  cv.addEventListener('pointercancel', cptrEnd);`);

/* ---- R18: the zoom keys ---- */
rep(`    if (ui.mode === 'below' && e.key >= '1' && e.key <= '5') {
      showTab(['chart', 'index', 'log', 'register', 'colophon'][+e.key - 1]);
      e.preventDefault(); return;
    }`,
`    if (ui.mode === 'below' && e.key >= '1' && e.key <= '5') {
      showTab(['chart', 'index', 'log', 'register', 'colophon'][+e.key - 1]);
      e.preventDefault(); return;
    }
    if (ui.mode === 'below' && ui.tab === 'chart' &&
        (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '_' || e.key === '0')) {
      chartKeyZoom(e.key);
      e.preventDefault(); return;
    }`);

rep(`    } else if (e.key === 'Escape') { $('searchdrop').hidden = true; s.blur(); e.preventDefault(); }
  });`,
`    } else if (e.key === 'Escape') { $('searchdrop').hidden = true; s.blur(); e.preventDefault(); }
    else if (!s.value && ui.mode === 'below' && ui.tab === 'chart' &&
      (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '_')) {
      /* an empty search box passes the zoom keys through to the glass */
      chartKeyZoom(e.key); e.preventDefault();
    }
  });`);

fs.writeFileSync(F, src);
console.log('patch part 2 applied: ' + n + ' replacements');
