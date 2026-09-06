/* r10 patch 2: THE CHART OF TWO CONTINENTS.
   buildChartGeo rebuilt: provinces knit into continents, interior borders in
   hachure, the fifty uncited pages as dark shores and shoal crosses with only
   the three fiercest left as beasts, and three sparse easter eggs. */
'use strict';
const fs = require('fs');
const F = 'deadreckoning.js';
let src = fs.readFileSync(F, 'utf8');
let fails = 0;
function splice(startAnchor, endAnchor, replacement, keepEnd) {
  const i = src.indexOf(startAnchor);
  if (i < 0) { console.error('START NOT FOUND: ' + startAnchor.slice(0, 60)); fails++; return; }
  const j = src.indexOf(endAnchor, i + startAnchor.length);
  if (j < 0) { console.error('END NOT FOUND: ' + endAnchor.slice(0, 60)); fails++; return; }
  src = src.slice(0, i) + replacement + (keepEnd ? endAnchor : '') + src.slice(j + endAnchor.length);
}

const NEWGEO = `function buildChartGeo() {
  if (chart.geo) return chart.geo;
  const t0 = performance.now();
  chartFit();
  const P = (x, y) => [chart.ox + x * chart.k, chart.oy + y * chart.k];
  const geo = { lands: [], rings: [], places: [], beasts: [], rocks: [], lanes: [],
    borders: null, conts: [], decor: [], t: 0 };

  /* --- the three fiercest of the fifty (owner order): the two of greatest
     bulk, and the one with the most arms. Everything else the deep once held
     is now told on the ground itself: dark shores and shoal crosses. --- */
  const un = world.uncited.slice();
  const byWords = un.slice().sort((a, b) => b.words - a.words);
  const byOut = un.slice().sort((a, b) => b.outbound - a.outbound);
  const fierce = [byWords[0]];
  if (byOut[0] && fierce.indexOf(byOut[0]) < 0) fierce.push(byOut[0]);
  for (const I of byWords) { if (fierce.length >= 3) break; if (fierce.indexOf(I) < 0) fierce.push(I); }
  fierce[0]._beastKind = 'cete';                       // her bulk earned the water
  if (fierce[1]) fierce[1]._beastKind = 'kraken';      // her arms did
  if (fierce[2]) fierce[2]._beastKind = 'serpent';     // the next-heaviest coils
  const beastSet = new Set(fierce.map(i => i.slug));
  const places = [], beastIsles = fierce;
  for (const I of world.islands) if (!beastSet.has(I.slug)) places.push(I);

  /* --- how untended is untended: the corpus's own last-touched dates --- */
  const days = s => { const d = Date.parse(s + 'T00:00:00Z'); return isNaN(d) ? 0 : d / 86400000; };
  let newest = 0;
  for (const I of world.islands) newest = Math.max(newest, days(I.last));
  const stale = world.islands.map(I => newest - days(I.last)).sort((a, b) => a - b);
  const STALE_CUT = stale[Math.floor(stale.length * 0.80)] || 400;
  const inb = world.islands.map(i => i.inbound).sort((a, b) => a - b);
  const INB_FORT = Math.max(6, inb[Math.floor(inb.length * 0.90)]);

  /* --- the character of each coast, from the province that keeps it --- */
  const minSepPx = 0.95 / world.nmPerUnit * chart.k;
  const contPx = {};
  for (const key of ['cms', 'cloud']) {
    const K = world.continents[key];
    const p = P(K.x, K.y);
    contPx[key] = { x: p[0], y: p[1], r: K.r * chart.k, n: K.n, provinces: K.provinces };
  }
  const PROV = world.provinces.map((Pv, pi) => {
    const p = P(Pv.x, Pv.y);
    const C = world.communities[Pv.comm];
    const rnd = rngFor('coast:' + pi + ':' + Pv.hub);
    const K = contPx[Pv.product];
    let ox = p[0] - K.x, oy = p[1] - K.y;
    const om = Math.hypot(ox, oy);
    if (om < 1e-6) { ox = 0; oy = -1; } else { ox /= om; oy /= om; }
    return {
      i: pi, comm: Pv.comm, product: Pv.product, x: p[0], y: p[1],
      name: Pv.primary ? world.archipelagos[Pv.comm].name
        : ((world.content.pages[Pv.hub] || {}).title || Pv.hub),
      size: Pv.size, purity: C.purity, hub: Pv.hub, members: Pv.members,
      primary: Pv.primary,
      rpx: (Pv.rmax || Pv.r) * chart.k,
      centDist: om,
      outTh: Math.atan2(oy, ox),
      /* a community of one mind keeps a smooth shore; a mixed one a ragged */
      rug: 0.42 + 1.45 * (1 - C.purity),
      m1: 3 + (Pv.size % 5), ph1: rnd() * TAU,
      m2: 7 + (Pv.size % 6), ph2: rnd() * TAU,
      coastal: false, extW: 0, rnd
    };
  });
  /* who holds open coast: a province is coastal when no sister province of
     her own continent stands beyond her on her own bearing */
  for (const A of PROV) {
    let outer = true;
    for (const B of PROV) {
      if (B === A || B.product !== A.product) continue;
      const th = Math.atan2(B.y - contPx[A.product].y, B.x - contPx[A.product].x);
      if (Math.abs(angWrap(th - A.outTh)) < 0.62 && B.centDist > A.centDist + B.rpx * 0.5) { outer = false; break; }
    }
    A.coastal = outer;
  }
  /* the weight of the world that pulls at each province: her external lanes */
  for (const L of world.lanes) {
    if (!L.w) continue;
    for (const A of PROV) if (A.primary && (A.comm === L.i || A.comm === L.j)) A.extW += L.total;
  }

  /* ============ the land field ============ */
  const CELL = 2;
  const gw = Math.floor(CHART_W / CELL) + 1, gh = Math.floor(CHART_H / CELL) + 1;
  const Fld = new Float32Array(gw * gh);
  const OWN = new Int16Array(gw * gh); OWN.fill(-1);
  const BEST = new Float32Array(gw * gh);
  const BLOB = minSepPx * 2.46;
  const AMP = 1.95;

  function splat(px, py, rad, amp, prov) {
    const i0 = Math.max(0, Math.floor((px - rad) / CELL)), i1 = Math.min(gw - 1, Math.ceil((px + rad) / CELL));
    const j0 = Math.max(0, Math.floor((py - rad) / CELL)), j1 = Math.min(gh - 1, Math.ceil((py + rad) / CELL));
    const inv = 1 / (rad * rad);
    for (let j = j0; j <= j1; j++) {
      const dy = j * CELL - py, row = j * gw;
      for (let i = i0; i <= i1; i++) {
        const dx = i * CELL - px;
        const d2 = (dx * dx + dy * dy) * inv;
        if (d2 >= 1) continue;
        const u = 1 - d2, c = amp * u * u;
        const k = row + i;
        Fld[k] += c;
        if (prov >= 0 && c > BEST[k]) { BEST[k] = c; OWN[k] = prov; }
      }
    }
  }

  for (const I of places) {
    const p = P(I.pos.x, I.pos.y);
    I.cx = p[0]; I.cy = p[1];
    /* a page's ground is its word count: the Document Service island is 1.00.
       On a continent every province is full ground; only the pages the data
       isolates keep the lean footing of an offshore isle. */
    const rad = BLOB * (0.78 + 0.62 * (I.mag - 0.44) / 1.41) * (I.prov < 0 ? 0.52 : 0.98);
    I.landRad = rad;
    splat(p[0], p[1], rad, AMP, I.prov >= 0 ? I.prov : -1);
  }
  /* the three beasts keep their true anchorage in mind, for the hand and the tooltip */
  for (const I of beastIsles) { const p = P(I.pos.x, I.pos.y); I.cx = null; I.cy = null; I.truePx = p; }

  /* ============ the knit: one continent is ONE ground ============
     Provinces are stitched along the citation graph itself: a spanning tree
     of the strongest ties gets an isthmus of ground per edge, wide where the
     tie is heavy, a bare neck where the graph thins. */
  const bridges = [];
  for (const key of ['cms', 'cloud']) {
    const list = PROV.filter(A => A.product === key);
    if (list.length < 2) continue;
    const inTree = new Set([list[0].i]);
    const affOf = (A, B) => {
      const L2 = world.lanes.find(L => (L.i === A.comm && L.j === B.comm) || (L.i === B.comm && L.j === A.comm));
      return L2 ? L2.total : 0;
    };
    while (inTree.size < list.length) {
      let best = null, bc = 1e18;
      for (const A of list) {
        if (!inTree.has(A.i)) continue;
        for (const B of list) {
          if (inTree.has(B.i)) continue;
          const aff = affOf(A, B);
          const cost = Math.hypot(A.x - B.x, A.y - B.y) / (1 + Math.log(1 + aff) * 0.9);
          if (cost < bc) { bc = cost; best = [A, B, aff]; }
        }
      }
      if (!best) break;
      inTree.add(best[1].i);
      bridges.push(best);
    }
  }
  for (const [A, B, aff] of bridges) {
    /* the isthmus runs between the two nearest pages of the two provinces */
    let pa = null, pb = null, bd = 1e18;
    for (const ma of A.members) {
      const Ia = world.bySlug.get(ma);
      if (!Ia || Ia.cx == null) continue;
      for (const mb of B.members) {
        const Ib = world.bySlug.get(mb);
        if (!Ib || Ib.cx == null) continue;
        const d = (Ia.cx - Ib.cx) * (Ia.cx - Ib.cx) + (Ia.cy - Ib.cy) * (Ia.cy - Ib.cy);
        if (d < bd) { bd = d; pa = Ia; pb = Ib; }
      }
    }
    if (!pa || !pb) continue;
    const d = Math.sqrt(bd);
    const w = BLOB * (0.40 + 0.30 * Math.min(1, aff / 26));
    const nseg = Math.max(2, Math.ceil(d / (BLOB * 0.45)));
    for (let s = 1; s < nseg; s++) {
      const t = s / nseg;
      splat(pa.cx + (pb.cx - pa.cx) * t, pa.cy + (pb.cy - pa.cy) * t, w, AMP * 0.9,
        t < 0.5 ? A.i : B.i);
    }
  }

  /* capes and bays, on the open coast only, reaching for the sea */
  for (const A of PROV) {
    if (!A.coastal || A.size < 3) continue;
    const R = Math.max(A.rpx, minSepPx * 1.2);
    /* the cape: the province's reach into the world, on her seaward bearing */
    const reachW = Math.min(1, A.extW / 120);
    const nCapes = A.size >= 14 ? 2 : 1;
    for (let cpi = 0; cpi < nCapes; cpi++) {
      const th = A.outTh + (cpi === 0 ? (A.rnd() - 0.5) * 0.7 : (A.rnd() < 0.5 ? -1 : 1) * (0.8 + A.rnd() * 0.5));
      const spit = reachW > 0.45 && cpi === 0;
      const reach = spit ? R * 0.55 + 30 : R * 0.34 + 18;
      const nseg = spit ? 6 : 4;
      for (let s = 1; s <= nseg; s++) {
        const t = s / nseg;
        const d = R * 0.74 + reach * t;
        const w = (spit ? BLOB * 0.44 * (1.05 - t * 0.62) : BLOB * (0.80 - t * 0.44));
        splat(A.x + Math.cos(th) * d, A.y + Math.sin(th) * d, w, AMP * 0.94, A.i);
      }
    }
    /* the bay: where her own members leave the seaward ring thin, the sea gets in */
    const bins = new Array(18).fill(0);
    for (const m of A.members) {
      const I = world.bySlug.get(m);
      if (!I || I.cx == null) continue;
      const th = Math.atan2(I.cy - A.y, I.cx - A.x);
      const r = Math.hypot(I.cx - A.x, I.cy - A.y);
      bins[Math.floor((angWrap(th) + Math.PI) / TAU * 18) % 18] += r / (R + 1);
    }
    let bayBin = -1, bayV = 1e9;
    for (let b = 0; b < 18; b++) {
      const th = b / 18 * TAU - Math.PI + TAU / 36;
      if (Math.abs(angWrap(th - A.outTh)) > 1.35) continue;
      if (bins[b] < bayV) { bayV = bins[b]; bayBin = b; }
    }
    if (bayBin >= 0 && A.size >= 6) {
      const th = (bayBin + 0.5) / 18 * TAU - Math.PI;
      splat(A.x + Math.cos(th) * R * 0.94, A.y + Math.sin(th) * R * 0.94,
        BLOB * (1.0 + 0.45 * A.rnd()), -AMP * 0.62, -1);
    }
  }

  /* ============ the crag: a few pixels of hand on the coastal band ============ */
  const n1 = makeNoise('crag1', 34), n2 = makeNoise('crag2', 16), n3 = makeNoise('crag3', 7);
  for (let j = 0; j < gh; j++) {
    const row = j * gw, y = j * CELL;
    for (let i = 0; i < gw; i++) {
      const k = row + i, f = Fld[k];
      if (f < 0.22 || f > 2.3) continue;
      const w = Math.min(1, (f - 0.22) / 0.35) * Math.max(0, 1 - Math.max(0, f - 1.05) / 1.1);
      if (w <= 0.01) continue;
      const x = i * CELL;
      const c = OWN[k];
      const A = c >= 0 ? PROV[c] : null;
      let d = (n1(x, y) * 0.60 + n2(x, y) * 0.44 + n3(x, y) * 0.34) * (A ? A.rug : 0.7);
      if (A) {
        const th = Math.atan2(y - A.y, x - A.x);
        d += 0.21 * Math.sin(A.m1 * th + A.ph1) + 0.13 * Math.sin(A.m2 * th + A.ph2);
      }
      Fld[k] = f + d * w;
    }
  }

  /* ============ the coastlines ============ */
  const raw = marchLand(Fld, gw, gh, 1.0, CELL);
  const rings = [];
  for (let r of raw) {
    if (r.length < 10) continue;
    let p = decimate(r, 4.4, true);
    if (p.length < 5) continue;
    p = chaikin(p, 2);
    p = decimate(p, 2.4, true);
    const a = Math.abs(polyArea(p));
    if (a < 26) continue;
    /* the hand: a slow wobble along the coast, baked in so fill and ink agree */
    const rnd = rngFor('hand:' + Math.round(p[0][0]) + ':' + Math.round(p[0][1]));
    const ph = rnd() * TAU;
    for (let i = 0; i < p.length; i++) {
      const q = p[i], nx = p[(i + 1) % p.length], pv = p[(i - 1 + p.length) % p.length];
      let tx = nx[0] - pv[0], ty = nx[1] - pv[1];
      const m = Math.hypot(tx, ty) || 1;
      const o = 0.62 * Math.sin(i * 0.44 + ph) + 0.30 * Math.sin(i * 1.31 + ph * 2);
      p[i] = [q[0] + (-ty / m) * o, q[1] + (tx / m) * o];
    }
    rings.push({ pts: p, area: a, bb: polyBBox(p), places: [], dark: null });
  }
  geo.rings = rings;

  /* which land is which: the places a ring holds name it */
  for (const I of places) {
    let host = null;
    for (const R of rings) {
      if (!pointInPoly(I.cx, I.cy, R.pts, R.bb)) continue;
      if (!host || R.area < host.area) host = R;     // the smallest ring holding it
    }
    if (host) { host.places.push(I); I.ring = host; }
    else { geo.rocks.push(I); }
  }
  /* Naming. A land is not always one province and a province is not always
     one land: on a continent many provinces share the one coast, and a loose
     province may leave a crumb offshore. So the sheet letters GROUPS - a
     province's places on one ring. The largest group of a province carries
     her name (the community's own name on her primary shore, her chief page
     on a lesser one); her offshore crumbs are lettered from their own
     principal page, Isle or Cay or Rock by their size. */
  for (const R of rings) {
    if (!R.places.length) { R.kind = 'rock'; continue; }
    R.kind = 'land';
    const c = polyCentroid(R.pts);
    R.cx = c[0]; R.cy = c[1];
  }
  const groups = [];
  for (const R of rings) {
    if (!R.places.length) continue;
    const by = new Map();
    for (const I of R.places) {
      const c = I.prov >= 0 ? I.prov : (I.nearProv != null ? I.nearProv : -1);
      let l = by.get(c); if (!l) by.set(c, l = []); l.push(I);
    }
    for (const [c, list] of by) {
      if (c < 0) continue;
      let sx = 0, sy = 0;
      for (const I of list) { sx += I.cx; sy += I.cy; }
      groups.push({ prov: c, comm: PROV[c].comm, ring: R, places: list, n: list.length, x: sx / list.length, y: sy / list.length });
    }
  }
  const byProv2 = new Map();
  for (const G of groups) { let l = byProv2.get(G.prov); if (!l) byProv2.set(G.prov, l = []); l.push(G); }
  geo.regions = [];
  for (const [c, list] of byProv2) {
    list.sort((a2, b2) => b2.n - a2.n);
    list[0].name = PROV[c].name;
    list[0].primary = !!PROV[c].primary;
    for (let n = 1; n < list.length; n++) {
      const G = list[n];
      if (G.n < 2) continue;                       // one page alone keeps only its own name
      G.chief = G.places.slice().sort((p, q) =>
        (q.inbound * 4 + q.words / 300) - (p.inbound * 4 + p.words / 300))[0];
      G.name = G.chief.sidebarLabel;
      G.satellite = true;
      G.suffix = G.ring.area < 420 ? 'Rock' : (G.ring.area < 1800 ? 'Cay' : 'Isle');
    }
    for (const G of list) if (G.name) geo.regions.push(G);
  }
  /* the hub of a province's chief ground is the place her name is anchored to */
  for (const G of geo.regions) {
    G.hub = G.places.find(I => I.slug === PROV[G.prov].hub) || null;
    G.chief = G.chief || G.places.slice().sort((p, q) =>
      (q.inbound * 4 + q.words / 300) - (p.inbound * 4 + p.words / 300))[0];
    const bb = polyBBox(G.places.map(I => [I.cx, I.cy]));
    G.bb = bb;
    G.wide = Math.max(26, bb.maxx - bb.minx);
  }

  geo.PROV = PROV;
  geo.groups = groups;

  /* the two continents, lettered wide across their own ground */
  for (const key of ['cms', 'cloud']) {
    let sx = 0, sy = 0, sn = 0;
    for (const I of places) {
      if (I.product !== key || I.prov < 0) continue;
      sx += I.cx; sy += I.cy; sn++;
    }
    if (!sn) continue;
    geo.conts.push({
      key, name: key === 'cms' ? 'THE CMS MAIN' : 'THE CLOUD MAIN',
      sub: sn + ' charted places',
      x: sx / sn, y: sy / sn, n: sn
    });
  }

  /* ============ the borders: province against province, in hachure ============
     Where two provinces' ground meets, the sheet takes a period border: a
     dotted line with cross-ticks, extracted from the ownership field itself. */
  const bpts = [];
  for (let j = 1; j < gh - 1; j++) {
    const row = j * gw;
    for (let i = 1; i < gw - 1; i++) {
      const k = row + i;
      if (Fld[k] < 1.0) continue;
      const o = OWN[k];
      if (o < 0) continue;
      /* the point sits on a border when a land neighbour answers to another
         province; the tick runs toward that neighbour */
      let nx = 0, ny = 0, hit = 0;
      const kR = k + 1, kD = k + gw;
      if (Fld[kR] >= 1.0 && OWN[kR] >= 0 && OWN[kR] !== o) { nx += 1; hit = 1; }
      if (Fld[kD] >= 1.0 && OWN[kD] >= 0 && OWN[kD] !== o) { ny += 1; hit = 1; }
      if (!hit) continue;
      bpts.push(i * CELL, j * CELL, nx, ny);
    }
  }
  geo.borders = new Float32Array(bpts);

  /* ============ the dark shores: the coast the fifty keep ============ */
  const darkP = places.filter(I => I.inbound === 0 && I.ring);
  for (const R of rings) {
    const mine = darkP.filter(I => I.ring === R);
    if (!mine.length) continue;
    const dark = new Uint8Array(R.pts.length);
    let any = false;
    for (let i = 0; i < R.pts.length; i++) {
      const p = R.pts[i];
      for (const I of mine) {
        const rr = I.landRad * 1.18;
        const dx = p[0] - I.cx, dy = p[1] - I.cy;
        if (dx * dx + dy * dy < rr * rr) { dark[i] = 1; any = true; break; }
      }
    }
    if (any) R.dark = dark;
  }

  /* ============ the places: what each page is, on the ground ============ */
  for (const I of places) {
    const rnd = rngFor('place:' + I.slug);
    const A = I.prov >= 0 ? PROV[I.prov] : null;
    const isHub = A && A.hub === I.slug;
    const staleDays = newest - days(I.last);
    const sz = 3.1 + 4.4 * (I.mag - 0.44) / 1.41;
    let kind;
    if (I.inbound === 0) kind = 'shoal';
    else if (isHub) kind = 'anchorage';
    else if (I.inbound >= INB_FORT) kind = 'fort';
    else if (I.authors.length >= 4) kind = 'town';
    else if (I.code >= 14) kind = 'quarry';
    else if (I.words <= 260) kind = 'well';
    else kind = 'cove';
    geo.places.push(I);
    I.mark = {
      kind, sz,
      hill: I.words >= 1550 ? clamp(I.nH2 || 1, 1, 3) : 0,
      hillH: 5.0 + 7.6 * Math.min(1, (I.words - 1550) / 4200),
      marsh: staleDays >= STALE_CUT && I.words < 900 && kind !== 'shoal',
      houses: clamp(I.authors.length - 2, 2, 5),
      spin: rnd() * TAU,
      score: I.inbound * 4 + I.words / 320 + (isHub ? 60 : 0) + (kind === 'fort' ? 14 : 0)
    };
  }

  /* ============ the deep, and what lives in it ============ */
  layoutBeasts(geo, beastIsles, Fld, gw, gh, CELL);

  /* ============ the sailing routes: the citation flow between lands ============ */
  const lanes = world.lanes.filter(L => L.w > 0).sort((a, b) => b.w - a.w).slice(0, 18);
  const primOf = c2 => PROV.find(A => A.comm === c2 && A.primary);
  for (const L of lanes) {
    const A = primOf(L.i), B = primOf(L.j);
    if (!A || !B) continue;
    geo.lanes.push({ ax: A.x, ay: A.y, bx: B.x, by: B.y, w: L.w, net: L.net });
  }
  /* the straits: a community split over both mains keeps a packet running
     between her two shores - counted from her own cross-product citations */
  const straitW = new Map();
  for (const [a, b] of world.graph.edges) {
    const Ia = world.bySlug.get(a), Ib = world.bySlug.get(b);
    if (!Ia || !Ib || Ia.comm < 0 || Ia.comm !== Ib.comm || Ia.product === Ib.product) continue;
    straitW.set(Ia.comm, (straitW.get(Ia.comm) || 0) + 1);
  }
  let packet = null;
  for (const [c2, w] of straitW) {
    const A = PROV.find(A2 => A2.comm === c2 && A2.product === 'cms');
    const B = PROV.find(B2 => B2.comm === c2 && B2.product === 'cloud');
    if (!A || !B) continue;
    const lane = { ax: A.x, ay: A.y, bx: B.x, by: B.y, w: w * 2.2, net: 0, strait: true };
    geo.lanes.push(lane);
    if (!packet || w > packet.w) packet = { lane, w, comm: c2 };
  }

  /* ============ three easter eggs, placed with restraint ============
     - a tiny packet ship on the strongest strait between the mains
     - a spout on the horizon, at the deepest surveyed water
     - one serpent tail between the waves, in the second-deepest water */
  const deep = geo._deepCands || [];
  const fieldAt2 = (x, y) => {
    const i = Math.min(gw - 1, Math.max(0, Math.round(x / CELL)));
    const j = Math.min(gh - 1, Math.max(0, Math.round(y / CELL)));
    return Fld[j * gw + i];
  };
  if (packet) {
    const L = packet.lane;
    let mx = (L.ax + L.bx) / 2, my = (L.ay + L.by) / 2;
    /* she rides the lane where the lane rides open water */
    for (let t = 0.5, s2 = 0; s2 < 9 && fieldAt2(mx, my) > 0.45; s2++) {
      t += (s2 % 2 ? 1 : -1) * 0.07 * (s2 + 1);
      mx = L.ax + (L.bx - L.ax) * t; my = L.ay + (L.by - L.ay) * t;
    }
    geo.decor.push({ kind: 'ship', x: mx, y: my - 4 });
  }
  const farFrom = (x, y, list, d) => list.every(q => Math.hypot(q.x - x, q.y - y) > d);
  const avoid = geo.beasts.map(B => ({ x: B.x, y: B.y })).concat(geo.decor);
  let spout = null, tail = null;
  for (const c2 of deep) {
    if (!spout && farFrom(c2.x, c2.y, avoid, 150)) { spout = c2; avoid.push(c2); continue; }
    if (spout && !tail && farFrom(c2.x, c2.y, avoid, 220)) { tail = c2; break; }
  }
  if (spout) geo.decor.push({ kind: 'spout', x: spout.x, y: spout.y });
  if (tail) geo.decor.push({ kind: 'tail', x: tail.x, y: tail.y });

  /* what the pointer can take hold of: every one of the 290 */
  chart.marks.length = 0;
  for (const I of geo.places) chart.marks.push({ isle: I, x: I.cx, y: I.cy, r: Math.max(6.5, I.mark.sz * 1.9) });
  for (const B of geo.beasts) chart.marks.push({ isle: B.isle, x: B.x, y: B.y, r: B.L * 0.36, beast: B });

  geo.field = Fld; geo.gw = gw; geo.gh = gh; geo.cell = CELL;
  geo.stats = { newest, STALE_CUT, INB_FORT, nPlace: places.length, nBeast: beastIsles.length,
    nBorderPts: geo.borders.length / 4, bridges: bridges.length,
    landRings: rings.filter(r => r.places.length).length, rocks: geo.rocks.length };
  geo.t = performance.now() - t0;
  chart.geo = geo;
  return geo;
}
`;

splice("function buildChartGeo() {", "\nfunction polyCentroid", NEWGEO, true);

/* ---------- layoutBeasts: three great beasts, and the deep-water survey kept for the eggs ---------- */
const NEWBEASTS = `function layoutBeasts(geo, isles, F, gw, gh, CELL) {
  if (!isles.length) return;
  const wmin = Math.min(...isles.map(I => I.words)), wmax = Math.max(...isles.map(I => I.words));
  const list = isles.map(I => {
    const rnd = rngFor('beast:' + I.slug);
    const t = (I.words - wmin) / Math.max(1, wmax - wmin);
    /* three, and only three: each takes grand water, cut large */
    const L = 96 + 58 * Math.pow(t, 0.70);
    return {
      isle: I, kind: I._beastKind || 'serpent', L, rnd,
      coils: clamp(Math.round(I.commits * 0.8) + 2, 3, 9),
      arms: clamp(I.outbound + 4, 5, 11),
      eyes: clamp(1 + I.night, 1, 4),
      night: I.night, spines: clamp(I.nH2, 1, 6),
      scales: clamp(Math.round(I.code / 2) + 2, 2, 9),
      fins: clamp(I.authors.length, 1, 4),
      hands: I.authors.length,
      name: shortName(I),
      asp: clamp(1.22 - 0.055 * (I.nH2 || 1) + (rnd() - 0.5) * 0.20, 0.78, 1.28),
      R: 0, x: 0, y: 0, flip: 1
    };
  }).sort((a, b) => b.L - a.L);
  const reach = { cete: 0.50, kraken: 0.52, serpent: 0.42, hornfish: 0.42 };
  for (const B of list) B.R = B.L * reach[B.kind] + 12;

  /* ---- the water: everything the land and the furniture do not hold ---- */
  const GC = 7;
  const cw = Math.ceil(CHART_W / GC), ch = Math.ceil(CHART_H / GC);
  const DT = new Float32Array(cw * ch);
  const BIG = 1e6;
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
    const x = i * GC + GC / 2, y = j * GC + GC / 2;
    const fi = Math.min(gw - 1, Math.round(x / CELL)), fj = Math.min(gh - 1, Math.round(y / CELL));
    let solid = F[fj * gw + fi] >= 0.80;
    if (!solid) for (const R of FURN) {
      if (x > R.x - 12 && x < R.x + R.w + 12 && y > R.y - 12 && y < R.y + R.h + 12) { solid = true; break; }
    }
    if (!solid && (x < 34 || x > CHART_W - 34 || y < 30 || y > CHART_H - 30)) solid = true;
    DT[j * cw + i] = solid ? 0 : BIG;
  }
  const d1 = GC, d2 = GC * 1.4142;
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
    const k = j * cw + i; let v = DT[k];
    if (j > 0) { v = Math.min(v, DT[k - cw] + d1); if (i > 0) v = Math.min(v, DT[k - cw - 1] + d2); if (i < cw - 1) v = Math.min(v, DT[k - cw + 1] + d2); }
    if (i > 0) v = Math.min(v, DT[k - 1] + d1);
    DT[k] = v;
  }
  for (let j = ch - 1; j >= 0; j--) for (let i = cw - 1; i >= 0; i--) {
    const k = j * cw + i; let v = DT[k];
    if (j < ch - 1) { v = Math.min(v, DT[k + cw] + d1); if (i > 0) v = Math.min(v, DT[k + cw - 1] + d2); if (i < cw - 1) v = Math.min(v, DT[k + cw + 1] + d2); }
    if (i < cw - 1) v = Math.min(v, DT[k + 1] + d1);
    DT[k] = v;
  }

  const cand = [];
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
    const d = DT[j * cw + i];
    if (d >= 21 && d < BIG) cand.push({ x: i * GC + GC / 2, y: j * GC + GC / 2, d });
  }
  /* the deepest water, kept for the sparse marks that live out there */
  geo._deepCands = cand.slice().sort((a, b) => b.d - a.d).slice(0, 260);

  const placed = [];
  const CX = CHART_W / 2, CY = CHART_H / 2;
  /* each beast wants the water off her own true anchorage: the reader who
     finds her looks toward the shore she haunts */
  for (const B of list) {
    const p = B.isle.truePx || chartProject(B.isle.pos.x, B.isle.pos.y);
    B.wantTh = Math.atan2(p[1] - CY, p[0] - CX);
  }
  for (const B of list) {
    const want = [CX + Math.cos(B.wantTh) * 640, CY + Math.sin(B.wantTh) * 380];
    let best = null, bc = 1e18;
    for (const c of cand) {
      if (c.d < Math.max(27, B.R * 0.92)) continue;
      let ok = true;
      for (const q of placed) {
        const need = (q.R + B.R) * 1.05;
        if ((q.x - c.x) * (q.x - c.x) + (q.y - c.y) * (q.y - c.y) < need * need) { ok = false; break; }
      }
      if (!ok) continue;
      const dx = c.x - want[0], dy = c.y - want[1];
      const cost = Math.hypot(dx, dy) - Math.min(c.d, B.R * 1.6) * 2.1;
      if (cost < bc) { bc = cost; best = c; }
    }
    if (!best) {
      B.L *= 0.78; B.R = B.L * reach[B.kind] + 9;
      for (const c of cand) {
        if (c.d < Math.max(22, B.R * 0.78)) continue;
        let ok = true;
        for (const q of placed) {
          const need = (q.R + B.R) * 0.80;
          if ((q.x - c.x) * (q.x - c.x) + (q.y - c.y) * (q.y - c.y) < need * need) { ok = false; break; }
        }
        if (!ok) continue;
        const cost = Math.hypot(c.x - want[0], c.y - want[1]);
        if (cost < bc) { bc = cost; best = c; }
      }
    }
    if (!best) { B.dropped = true; continue; }
    B.x = best.x; B.y = best.y;
    B.flip = (best.x < CX ? 1 : -1) * (B.rnd() < 0.26 ? -1 : 1);
    B.rot = (B.rnd() - 0.5) * 0.34;
    placed.push(B);
    geo.beasts.push(B);
  }
}
`;
splice("function layoutBeasts(geo, isles, F, gw, gh, CELL) {",
  "\n/* a beast's name, cut to a cartographer's hand */", NEWBEASTS, true);

fs.writeFileSync(F, src);
console.log(fails ? 'FAILED ' + fails : 'patched clean');
