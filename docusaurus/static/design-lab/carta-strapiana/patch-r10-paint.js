/* r10 patch 3: the ink - province borders in hachure, dark shores, shoal
   crosses, the three sparse easter eggs, the adapted legend and cartouche,
   and the two mains lettered across their ground. */
'use strict';
const fs = require('fs');
const F = 'deadreckoning.js';
let src = fs.readFileSync(F, 'utf8');
let fails = 0;
function rep(a, b) {
  if (src.indexOf(a) < 0) { console.error('NOT FOUND: ' + a.slice(0, 70).replace(/\n/g, '\\n')); fails++; return; }
  src = src.replace(a, b);
}

/* ---------- 1. borders drawn inside the land clip, under the place marks ---------- */
rep(
`  g.fillStyle = INK + '0.10)';
  for (let i = 0; i < 3400; i++) {
    const x = dr() * CHART_W, y = dr() * CHART_H;
    if (!inVp(x, y, 2)) continue;
    g.fillRect(x, y, 0.8, 0.8);
  }
  for (const I of geo.places) { if (inVp(I.cx, I.cy, 60)) drawPlaceMark(g, I); }`,
`  g.fillStyle = INK + '0.10)';
  for (let i = 0; i < 3400; i++) {
    const x = dr() * CHART_W, y = dr() * CHART_H;
    if (!inVp(x, y, 2)) continue;
    g.fillRect(x, y, 0.8, 0.8);
  }
  /* the province borders, in hachure: a dotted line with cross-ticks, read
     straight out of the ownership field - the graph's own frontier */
  const BP = geo.borders;
  if (BP && BP.length) {
    g.fillStyle = INK + '0.38)';
    for (let b2 = 0; b2 < BP.length; b2 += 4) {
      const x = BP[b2], y = BP[b2 + 1];
      if (!inVp(x, y, 3)) continue;
      if (((b2 >> 2) % 3) === 2) continue;      // a dotted border breathes
      g.fillRect(x - 0.5, y - 0.5, 1.0, 1.0);
    }
    g.strokeStyle = INK + '0.24)'; g.lineWidth = 0.5;
    g.beginPath();
    for (let b2 = 0; b2 < BP.length; b2 += 4) {
      if (((b2 >> 2) % 6) !== 0) continue;
      const x = BP[b2], y = BP[b2 + 1];
      if (!inVp(x, y, 6)) continue;
      let nx = BP[b2 + 2], ny = BP[b2 + 3];
      const m = Math.hypot(nx, ny) || 1; nx /= m; ny /= m;
      g.moveTo(x - nx * 2.8, y - ny * 2.8);
      g.lineTo(x + nx * 2.8, y + ny * 2.8);
    }
    g.stroke();
  }
  for (const I of geo.places) { if (inVp(I.cx, I.cy, 60)) drawPlaceMark(g, I); }`);

/* ---------- 2. dark shores, after the land ink ---------- */
rep(
`  g.save(); g.translate(0.6, 0.7);
  g.strokeStyle = INK + '0.22)'; g.lineWidth = 0.7;
  g.stroke(landPath);
  g.restore();`,
`  g.save(); g.translate(0.6, 0.7);
  g.strokeStyle = INK + '0.22)'; g.lineWidth = 0.7;
  g.stroke(landPath);
  g.restore();
  /* the dark shores: where a page no route reaches keeps the coast, the
     burin presses harder and the shore hatch closes up */
  for (const R of rings) {
    if (!R.dark) continue;
    if (R.bb.maxx < vp.x0 - 14 || R.bb.minx > vp.x1 + 14 ||
        R.bb.maxy < vp.y0 - 14 || R.bb.miny > vp.y1 + 14) continue;
    const p = R.pts, n = p.length, D = R.dark;
    const sign = polyArea(p) > 0 ? -1 : 1;
    g.strokeStyle = INK + '0.88)'; g.lineWidth = 2.2;
    g.beginPath();
    for (let i = 0; i < n; i++) {
      const j2 = (i + 1) % n;
      if (!D[i] || !D[j2]) continue;
      g.moveTo(p[i][0], p[i][1]); g.lineTo(p[j2][0], p[j2][1]);
    }
    g.stroke();
    g.strokeStyle = INK + '0.46)'; g.lineWidth = 0.55;
    g.beginPath();
    for (let i = 0; i < n; i += 2) {
      if (!D[i]) continue;
      const a = p[(i + 1) % n], b = p[(i - 1 + n) % n];
      let tx = a[0] - b[0], ty = a[1] - b[1];
      const m = Math.hypot(tx, ty) || 1;
      const nx = ty / m * sign, ny = -tx / m * sign;
      g.moveTo(p[i][0] + nx * 1.2, p[i][1] + ny * 1.2);
      g.lineTo(p[i][0] + nx * 6.4, p[i][1] + ny * 6.4);
    }
    g.stroke();
  }`);

/* ---------- 3. water rocks: shoal crosses where nothing cites her ---------- */
rep(
`  for (const I of geo.rocks) {
    if (!inVp(I.cx, I.cy, 6)) continue;
    g.fillStyle = INK + '0.8)';
    g.beginPath(); g.arc(I.cx, I.cy, 1.6, 0, TAU); g.fill();
  }`,
`  for (const I of geo.rocks) {
    if (!inVp(I.cx, I.cy, 12)) continue;
    if (I.inbound === 0) {
      /* shoal water: the period mark for a danger no lead has sounded */
      g.strokeStyle = INK + '0.82)'; g.lineWidth = 0.95;
      g.beginPath();
      for (const [ox, oy] of [[0, 0], [-4.6, 2.6], [4.4, 2.2]]) {
        const x = I.cx + ox, y = I.cy + oy;
        g.moveTo(x - 2.1, y - 2.1); g.lineTo(x + 2.1, y + 2.1);
        g.moveTo(x + 2.1, y - 2.1); g.lineTo(x - 2.1, y + 2.1);
      }
      g.stroke();
      g.strokeStyle = INK + '0.38)'; g.lineWidth = 0.55;
      g.beginPath();
      g.arc(I.cx, I.cy + 4.6, 6.4, 0.35, Math.PI - 0.35);
      g.stroke();
    } else {
      g.fillStyle = INK + '0.8)';
      g.beginPath(); g.arc(I.cx, I.cy, 1.6, 0, TAU); g.fill();
    }
  }`);

/* ---------- 4. the three easter eggs, after the beasts ---------- */
rep(
`  /* --- the deep, and what lives in it --- */
  for (const B of geo.beasts) {
    if (!inVp(B.x, B.y, B.L * 1.5)) continue;
    drawBeast(g, B);
    if (B.band) {
      const h = B.band.lines.length > 1 ? B.band.fs * 2.5 : B.band.fs * 1.85;
      drawBanderole(g, B.x, B.band.y, B.band.w, h);
    }
  }`,
`  /* --- the deep, and what lives in it --- */
  for (const B of geo.beasts) {
    if (!inVp(B.x, B.y, B.L * 1.5)) continue;
    drawBeast(g, B);
    if (B.band) {
      const h = B.band.lines.length > 1 ? B.band.fs * 2.5 : B.band.fs * 1.85;
      drawBanderole(g, B.x, B.band.y, B.band.w, h);
    }
  }
  for (const D of geo.decor || []) {
    if (!inVp(D.x, D.y, 40)) continue;
    drawChartDecor(g, D);
  }`);

/* ---------- 5. the decor vignettes + the shoal place mark ---------- */
rep(
`function drawPlaceMark(g, I) {`,
`/* three sparse marks in the open water: a packet on the strait, a spout on
   the horizon of the deepest water, one tail between the waves. Small, inked
   in the register of the sheet, never repeated. */
function drawChartDecor(g, D) {
  g.save();
  g.translate(D.x, D.y);
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (D.kind === 'ship') {
    g.strokeStyle = INK + '0.80)'; g.fillStyle = 'rgba(240,231,208,0.85)'; g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(-9, 2.5); g.quadraticCurveTo(0, 7.5, 9, 2.5);
    g.lineTo(7.2, 0.4); g.lineTo(-7.2, 0.4); g.closePath();
    g.fill(); g.stroke();
    g.beginPath();
    g.moveTo(-2.8, 0.4); g.lineTo(-2.8, -10.5);
    g.moveTo(3.4, 0.4); g.lineTo(3.4, -7.6);
    g.stroke();
    g.fillStyle = 'rgba(244,236,217,0.92)';
    g.beginPath(); g.moveTo(-2.2, -9.8); g.quadraticCurveTo(4.2, -7.0, 2.4, -1.6); g.lineTo(-2.2, -1.6); g.closePath();
    g.fill(); g.stroke();
    g.beginPath(); g.moveTo(3.9, -7.0); g.quadraticCurveTo(8.0, -4.6, 6.4, -0.8); g.lineTo(3.9, -0.8); g.closePath();
    g.fill(); g.stroke();
    g.strokeStyle = INK + '0.34)'; g.lineWidth = 0.55;
    g.beginPath();
    g.moveTo(-14, 5.2); g.quadraticCurveTo(-10, 4.0, -6, 5.2);
    g.moveTo(8, 5.6); g.quadraticCurveTo(12, 4.4, 15, 5.6);
    g.stroke();
  } else if (D.kind === 'spout') {
    g.strokeStyle = INK + '0.62)'; g.lineWidth = 0.9;
    g.beginPath(); g.moveTo(-7.5, 3.5); g.quadraticCurveTo(0, -1.5, 7.5, 3.5); g.stroke();
    g.lineWidth = 0.6; g.strokeStyle = INK + '0.55)';
    g.beginPath();
    g.moveTo(-1.5, 0.4); g.quadraticCurveTo(-3.4, -5.5, -6.0, -7.6);
    g.moveTo(-0.6, 0.0); g.quadraticCurveTo(-0.6, -6.5, -1.4, -9.4);
    g.moveTo(0.6, 0.2); g.quadraticCurveTo(2.4, -5.8, 5.2, -8.2);
    g.stroke();
    g.fillStyle = INK + '0.42)';
    for (const [px2, py2] of [[-6.8, -9.0], [-0.8, -11.0], [6.0, -9.8]]) {
      g.beginPath(); g.arc(px2, py2, 0.7, 0, TAU); g.fill();
    }
  } else if (D.kind === 'tail') {
    g.strokeStyle = INK + '0.72)'; g.fillStyle = 'rgba(240,231,208,0.7)'; g.lineWidth = 0.85;
    g.beginPath();
    g.moveTo(-6.5, 3.0);
    g.bezierCurveTo(-3.5, -4.5, 2.5, -7.5, 5.5, -3.5);
    g.bezierCurveTo(7.2, -1.2, 6.2, 0.8, 4.6, 1.6);
    g.bezierCurveTo(5.8, -1.4, 3.8, -4.4, 1.2, -3.0);
    g.bezierCurveTo(-1.8, -1.4, -3.2, 1.4, -3.8, 3.2);
    g.closePath(); g.fill(); g.stroke();
    /* the fluke, thrown clear */
    g.beginPath();
    g.moveTo(4.6, 1.6);
    g.quadraticCurveTo(8.6, 0.4, 10.4, -2.6);
    g.quadraticCurveTo(9.2, 0.8, 10.0, 3.4);
    g.quadraticCurveTo(7.2, 2.6, 4.6, 1.6);
    g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = INK + '0.34)'; g.lineWidth = 0.55;
    g.beginPath();
    g.moveTo(-11, 4.6); g.quadraticCurveTo(-8, 3.4, -5, 4.6);
    g.moveTo(6, 5.0); g.quadraticCurveTo(9, 3.8, 12, 5.0);
    g.stroke();
  }
  g.restore();
}

function drawPlaceMark(g, I) {`);

rep(
`    default: {
      g.fillStyle = INK + '0.82)';
      g.beginPath(); g.arc(x, y, s * 0.34, 0, TAU); g.fill();
      g.strokeStyle = INK + '0.42)'; g.lineWidth = 0.5;
      g.beginPath(); g.arc(x, y, s * 0.72, -0.9, 2.0); g.stroke();
    }`,
`    case 'shoal': {
      /* the cross of an unsounded danger, at the page's own door */
      g.strokeStyle = INK + '0.90)'; g.lineWidth = 1.1;
      const r2 = s * 0.66;
      g.beginPath();
      g.moveTo(x - r2, y - r2); g.lineTo(x + r2, y + r2);
      g.moveTo(x + r2, y - r2); g.lineTo(x - r2, y + r2);
      g.stroke();
      g.strokeStyle = INK + '0.40)'; g.lineWidth = 0.5;
      g.beginPath(); g.arc(x, y, r2 + 2.2, 0.3, Math.PI - 0.3); g.stroke();
      break;
    }
    default: {
      g.fillStyle = INK + '0.82)';
      g.beginPath(); g.arc(x, y, s * 0.34, 0, TAU); g.fill();
      g.strokeStyle = INK + '0.42)'; g.lineWidth = 0.5;
      g.beginPath(); g.arc(x, y, s * 0.72, -0.9, 2.0); g.stroke();
    }`);

/* ---------- 6. legend rows + glyphs ---------- */
rep("const KEY_ROW_Y = 108, KEY_ROW_H = 16;", "const KEY_ROW_Y = 96, KEY_ROW_H = 16;");
rep(
`  const rows = ['anchorage', 'fort', 'town', 'hill', 'marsh', 'x'];`,
`  const rows = ['anchorage', 'fort', 'town', 'hill', 'shoal', 'dark', 'x'];`);
rep(
`    if (k === 'x') {
      g.strokeStyle = RED + '0.88)'; g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x - 4, y - 4); g.lineTo(x + 4, y + 4);
      g.moveTo(x + 4, y - 4); g.lineTo(x - 4, y + 4);
      g.stroke();
      return;
    }`,
`    if (k === 'x') {
      g.strokeStyle = RED + '0.88)'; g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x - 4, y - 4); g.lineTo(x + 4, y + 4);
      g.moveTo(x + 4, y - 4); g.lineTo(x - 4, y + 4);
      g.stroke();
      return;
    }
    if (k === 'shoal') {
      g.strokeStyle = INK + '0.90)'; g.lineWidth = 1.1;
      g.beginPath();
      g.moveTo(x - 3, y - 3); g.lineTo(x + 3, y + 3);
      g.moveTo(x + 3, y - 3); g.lineTo(x - 3, y + 3);
      g.stroke();
      g.strokeStyle = INK + '0.40)'; g.lineWidth = 0.5;
      g.beginPath(); g.arc(x, y, 5.4, 0.3, Math.PI - 0.3); g.stroke();
      return;
    }
    if (k === 'dark') {
      g.strokeStyle = INK + '0.88)'; g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(x - 6, y + 1); g.quadraticCurveTo(x, y - 2.5, x + 6, y + 1); g.stroke();
      g.strokeStyle = INK + '0.46)'; g.lineWidth = 0.55;
      g.beginPath();
      for (let q = -2; q <= 2; q++) {
        g.moveTo(x + q * 2.6, y + 0.4 - Math.abs(q) * 0.4);
        g.lineTo(x + q * 2.6 + 1.2, y + 4.6);
      }
      g.stroke();
      return;
    }`);

/* ---------- 7. legend text ---------- */
rep(
`  const rows = [
    'the chief page of a land',
    'a fort: many pages cite her',
    'a settlement: many hands',
    'hachures: a long page',
    'marsh: untended a long while',
    'read on this visit (' + visit.charted.size + ')'
  ];
  let h = '<div class="ck-h">HERE BE DRAGONS</div>' +
    '<div class="ck-lede">Fifty places no route yet reaches. Each beast is one of them, drawn ' +
    'from her own numbers: bulk from words, arms from the pages she reaches out to, coils from her ' +
    'commits, eyes from her night work.</div>';`,
`  const rows = [
    'the chief page of a province',
    'a fort: many pages cite her',
    'a settlement: many hands',
    'hachures: a long page',
    'shoal cross: no route reaches her',
    'dark shore: an unreached coast',
    'read on this visit (' + visit.charted.size + ')'
  ];
  let h = '<div class="ck-h">HERE BE DRAGONS</div>' +
    '<div class="ck-lede">Fifty places no route yet reaches: their coasts are inked dark and ' +
    'their waters carry the cross. The three fiercest swim the open sea as beasts, each drawn ' +
    'from her own numbers - bulk from words, arms from the pages she reaches for.</div>';`);

/* ---------- 8. cartouche total line ---------- */
rep(
`    '<div class="cc-tot"><b>' + world.islands.length + '</b> places &middot; <b>' +
    geo.rings.filter(r => r.places && r.places.length).length + '</b> lands and isles &middot; <b>' +
    commas(g.edges.length) + '</b> citations<br><b>' + Math.round(world.extentNm) +
    '</b> nautical miles from shore to shore &middot; <b>' + world.uncited.length +
    '</b> unreached</div>';`,
`    '<div class="cc-tot"><b>2</b> continents &middot; <b>' + world.provinces.length +
    '</b> provinces &middot; <b>' + world.islands.length + '</b> places &middot; <b>' +
    commas(g.edges.length) + '</b> citations<br><b>' + Math.round(world.extentNm) +
    '</b> nautical miles from shore to shore &middot; <b>' + world.uncited.length +
    '</b> unreached</div>';`);

/* ---------- 9. sailing directions: the two mains first ---------- */
rep(
`function directionsHtml() {
  const A = world.archipelagos.slice().sort((a, b) => b.size - a.size).slice(0, 5);
  const line = (a, b) => {
    const brg = norm360(Math.atan2(b.x - a.x, -(b.y - a.y)) * 180 / Math.PI);
    const nm = Math.hypot(b.x - a.x, b.y - a.y) * world.nmPerUnit;
    return '<li>From <i>' + esc(a.name) + '</i>, the <i>' + esc(b.name) + '</i> shore bears <b>' +
      compassPoint(brg) + '</b>, ' + numToWords(Math.max(1, Math.round(nm))) + ' miles.</li>';
  };
  let h = '<div class="cd-h">SAILING DIRECTIONS</div><ul>';
  for (let i = 0; i < 3; i++) h += line(A[i], A[i + 1]);
  h += '<li>The wind is the citation itself: it blows out of the pages that cite, into the pages cited.</li>';
  h += '</ul>';
  return h;
}`,
`function directionsHtml() {
  const A = world.archipelagos.slice().sort((a, b) => b.size - a.size).slice(0, 3);
  const line = (a, b, an, bn) => {
    const brg = norm360(Math.atan2(b.x - a.x, -(b.y - a.y)) * 180 / Math.PI);
    const nm = Math.hypot(b.x - a.x, b.y - a.y) * world.nmPerUnit;
    return '<li>From ' + an + ', ' + bn + ' bears <b>' +
      compassPoint(brg) + '</b>, ' + numToWords(Math.max(1, Math.round(nm))) + ' miles.</li>';
  };
  const K = world.continents;
  let h = '<div class="cd-h">SAILING DIRECTIONS</div><ul>';
  h += line(K.cms, K.cloud, 'the <i>CMS Main</i>', 'the <i>Cloud Main</i>') ;
  h += line(A[0], A[1], '<i>' + esc(A[0].name) + '</i>', 'the <i>' + esc(A[1].name) + '</i> province');
  h += line(A[1], A[2], '<i>' + esc(A[1].name) + '</i>', 'the <i>' + esc(A[2].name) + '</i> province');
  h += '<li>The wind is the citation itself: it blows out of the pages that cite, into the pages cited.</li>';
  h += '</ul>';
  return h;
}`);

/* ---------- 10. the two mains lettered on the sheet ---------- */
rep(
`  /* --- the archipelago names, set across their whole water --- */`,
`  /* --- the two mains, lettered wide across their own ground --- */
  for (const K of geo.conts) {
    const kx = vx(K.x), ky = vy(K.y);
    if (!inView(kx, ky, 460)) continue;
    const fs = (K.key === 'cms' ? 20 : 14.5) * zf;
    const sp = (K.key === 'cms' ? 14 : 8.5) * zf;
    const w = textW(K.name, fs, '', sp) + 10, h = fs + 8;
    put(geoHtml, 'cl-cont', esc(K.name), kx, ky - h * 0.4, w, h,
      'font-size:' + (fs * S).toFixed(2) + 'px;letter-spacing:' + (sp * S).toFixed(2) + 'px');
    const fs2 = 8.6 * zf;
    const w2 = textW(K.sub, fs2, 'italic', 1) + 8;
    put(geoHtml, 'cl-contsub', esc(K.sub), kx, ky - h * 0.4 + h * 0.95, w2, fs2 + 4,
      'font-size:' + (fs2 * S).toFixed(2) + 'px;letter-spacing:' + (1 * S).toFixed(2) + 'px');
  }

  /* --- the archipelago names, set across their whole water --- */`);

/* ---------- 11. the cartouche keeps only the chart identity ---------- */
rep(
`function showChartInfo(isle) {
  const box = $('chartinfo');
  if (!box) return;
  if (!isle) {
    box.querySelector('.ci-name').textContent = 'The surveyed sea';
    box.querySelector('.ci-line').textContent =
      'Hover any place or any beast. Every one of the ' + world.islands.length + ' is on this sheet.';
    box.querySelector('.ci-act').textContent = 'Click to shape a course · double-click to be carried there · 2 for the plain index.';
    return;
  }
  const arch = isle.comm >= 0 ? world.archipelagos[isle.comm] : null;
  box.querySelector('.ci-name').textContent = isle.title;
  const bits = [commas(isle.words) + ' words', isle.nH2 + (isle.nH2 === 1 ? ' headland' : ' headlands')];
  bits.push(isle.inbound ? isle.inbound + (isle.inbound === 1 ? ' riding light' : ' riding lights') : 'no route reaches her');
  bits.push(arch ? 'of ' + arch.name : 'off soundings');
  bits.push(isle.authors.length === 1 ? 'kept alone by ' + isle.authors[0] : isle.authors.length + ' hands');
  box.querySelector('.ci-line').textContent = bits.join(' · ');
  box.querySelector('.ci-act').textContent =
    (visit.charted.has(isle.slug) ? 'Read this visit. ' : '') +
    'Click to shape a course · double-click to be carried there.';
}`,
`function showChartInfo() {
  /* the cartouche keeps only the chart's identity (owner order): the naming
     of places moved onto the sheet itself, in the tooltip at the hand */
  const box = $('chartinfo');
  if (!box) return;
  box.querySelector('.ci-name').textContent = 'The surveyed sea';
  box.querySelector('.ci-line').textContent =
    'Two mains, ' + world.provinces.length + ' provinces, all ' + world.islands.length +
    ' pages on the one sheet. Hover any place for her name and bearing.';
  box.querySelector('.ci-act').textContent =
    'Click a place to make the passage there \\u00b7 Shift-click to shape a course and sail it yourself.';
}`);

fs.writeFileSync(F, src);
console.log(fails ? 'FAILED ' + fails : 'patched clean');
