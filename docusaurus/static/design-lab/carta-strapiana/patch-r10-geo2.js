'use strict';
const fs = require('fs');
const F = 'deadreckoning.js';
let src = fs.readFileSync(F, 'utf8');
let fails = 0;
function rep(a, b) {
  if (src.indexOf(a) < 0) { console.error('NOT FOUND: ' + a.slice(0, 70).replace(/\n/g, '\\n')); fails++; return; }
  src = src.replace(a, b);
}

/* a) small landlocked ponds are filled in: a continent keeps her ground.
      (a great inland sea stays: only the pond-sized holes go) */
rep(
`    rings.push({ pts: p, area: a, bb: polyBBox(p), places: [], dark: null });
  }
  geo.rings = rings;`,
`    rings.push({ pts: p, area: a, bb: polyBBox(p), places: [], dark: null });
  }
  /* ponds: a hole inside a land ring, holding no place and smaller than a
     roadstead, is the marching artifact of two provinces almost touching -
     the ground closes over it. True inland seas (large holes) remain. */
  for (let i = rings.length - 1; i >= 0; i--) {
    const R = rings[i];
    if (R.area >= 2600) continue;
    let inside = false;
    for (const Q of rings) {
      if (Q === R || Q.area <= R.area) continue;
      if (pointInPoly(R.pts[0][0], R.pts[0][1], Q.pts, Q.bb)) { inside = true; break; }
    }
    if (inside) rings.splice(i, 1);
  }
  geo.rings = rings;`);

/* b) province names letter from the cartographer's short hand, and a lone
      page on a lesser shore keeps only her own label */
rep(
`      name: Pv.primary ? world.archipelagos[Pv.comm].name
        : ((world.content.pages[Pv.hub] || {}).title || Pv.hub),`,
`      name: (world.content.pages[Pv.hub] || {}).sidebarLabel ||
        (world.content.pages[Pv.hub] || {}).title || Pv.hub,`);
rep(
`    list.sort((a2, b2) => b2.n - a2.n);
    list[0].name = PROV[c].name;
    list[0].primary = !!PROV[c].primary;`,
`    list.sort((a2, b2) => b2.n - a2.n);
    if (list[0].n >= 2 || PROV[c].primary) {
      list[0].name = PROV[c].name;
      list[0].primary = !!PROV[c].primary;
    }`);

/* c) the duplicate-name suppression compares the whole name, not the cut */
rep(
`    if (ok) {
      /* the land already carries this name: her chief page is not lettered twice */
      const owner = prime ? (G.hub || G.chief) : G.chief;
      if (owner) {
        const n2 = t.replace(/ (ROCK|CAY|ISLE)$/, '');
        if (n2 === (owner.sidebarLabel || '').toUpperCase() || n2 === (owner.title || '').toUpperCase()) owner._suppress = true;
      }
    }`,
`    if (ok) {
      /* the land already carries this name: her chief page is not lettered twice */
      const owner = prime ? (G.hub || G.chief) : G.chief;
      if (owner) {
        const full = (G.name || '').toUpperCase();
        if (full === (owner.sidebarLabel || '').toUpperCase() ||
            full === (owner.title || '').toUpperCase()) owner._suppress = true;
      }
    }`);

/* d) the mains' letters dodge the furniture and the rose */
rep(
`  for (const K of geo.conts) {
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
  }`,
`  for (const K of geo.conts) {
    const kx = vx(K.x), ky = vy(K.y);
    if (!inView(kx, ky, 460)) continue;
    const fs = (K.key === 'cms' ? 20 : 14.5) * zf;
    const sp = (K.key === 'cms' ? 14 : 8.5) * zf;
    const w = textW(K.name, fs, '', sp) + 10, h = fs + 8;
    let px2 = kx, py2 = ky - h * 0.4;
    for (const [ox2, oy2] of [[0, 0], [0, -h * 1.4], [0, h * 1.4], [-w * 0.14, -h * 2.6], [-w * 0.14, h * 2.6], [0, 0]]) {
      const b2 = { x0: kx + ox2 - w / 2, x1: kx + ox2 + w / 2, y0: ky - h * 0.4 + oy2 - h / 2, y1: ky - h * 0.4 + oy2 + h / 2 };
      if (hit(b2)) continue;
      px2 = kx + ox2; py2 = ky - h * 0.4 + oy2;
      break;
    }
    put(geoHtml, 'cl-cont', esc(K.name), px2, py2, w, h,
      'font-size:' + (fs * S).toFixed(2) + 'px;letter-spacing:' + (sp * S).toFixed(2) + 'px');
    const fs2 = 8.6 * zf;
    const w2 = textW(K.sub, fs2, 'italic', 1) + 8;
    if (!hit({ x0: px2 - w2 / 2, x1: px2 + w2 / 2, y0: py2 + h * 0.95 - (fs2 + 4) / 2, y1: py2 + h * 0.95 + (fs2 + 4) / 2 }))
      put(geoHtml, 'cl-contsub', esc(K.sub), px2, py2 + h * 0.95, w2, fs2 + 4,
        'font-size:' + (fs2 * S).toFixed(2) + 'px;letter-spacing:' + (1 * S).toFixed(2) + 'px');
  }`);

fs.writeFileSync(F, src);
console.log(fails ? 'FAILED ' + fails : 'patched clean');
