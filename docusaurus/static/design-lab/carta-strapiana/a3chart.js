/* ============================================================
   THE TWO GREAT CHAINS - the living chart of Carta Strapiana,
   rebuilt in the image of the winning plate (chart2-arch-c, A3).

   The memory of the two continents, kept as two grand archipelagos.
   There are no continents on this chart and there never will be: the
   world is 288 true islands, one per real documentation page (the
   release notes are struck from this sea), gathered into two sweeping
   arcs - the long CONTENTIAN CHAIN of Strapi CMS bent like a bow, and
   the compact NUBILIAN CRESCENT of Strapi Cloud answering it across the
   Deployment Passage - with four named waters and a five rung ladder:
   I THE PLATE, II THE PROVINCES, III THE LANDMARKS, IV THE SOUNDINGS,
   V THE FIRESIDE.

   This file is loaded AFTER deadreckoning.js and redeclares the chart's
   own functions; a later function declaration in a classic script wins
   for the whole page, so the game calls these and nothing else changed.
   Only `function` declarations and `var` are used here, so nothing sits
   in a temporal dead zone while the game boots.

   EVERY COUNT LETTERED ON THIS SHEET IS COMPUTED FROM THE LIVE WORLD.
   Nothing is copied from the prototype, which still counted 290.
   ============================================================ */
'use strict';

/* ---------------- the register ---------------- */
var A3_PAPER = '#f2e9d3';          // the game's own vellum
var A3_LAND = '#f8f1de';           // the island ground: a hair lighter than the sea
var A3_INK = 'rgba(38,28,17,';     // the game's iron gall
var A3_INK2 = 'rgba(107,90,68,';   // the worn ink: hatching, stipple, tremor detail
var A3_VERM = 'rgba(141,47,34,';   // the one quiet accent (the game's own red)
var A3_WASHES = {
  rose: '172,113,100', ochre: '172,142,80', sage: '117,132,96',
  azure: '110,131,151', violet: '132,118,152'
};
var A3_FONT = '"Iowan Old Style", "Palatino", "Palatino Linotype", Georgia, serif';

/* ---------------- the ladder ---------------- */
var A3_RUNGS = [1, 1.5, 2.6, 4.5, 7.6];
var A3_RUNG_NAMES = ['THE PLATE', 'THE PROVINCES', 'THE LANDMARKS', 'THE SOUNDINGS', 'THE FIRESIDE'];
var A3_ROMAN = ['I', 'II', 'III', 'IV', 'V'];
var a3StepAt = 0;

function a3Rung(z) {
  if (z == null) z = chart.z;
  var b = 0, bd = 1e9;
  for (var i = 0; i < 5; i++) {
    var d = Math.abs(Math.log(z / A3_RUNGS[i]));
    if (d < bd) { bd = d; b = i; }
  }
  return b + 1;
}
function a3RungTarget() { return a3Rung(chart.zt); }
/* the fractional rung, for the ramps that fade one register into the next */
function a3RungF(z) {
  if (z == null) z = chart.z;
  if (z <= A3_RUNGS[0]) return 1;
  if (z >= A3_RUNGS[4]) return 5;
  for (var i = 0; i < 4; i++) {
    if (z <= A3_RUNGS[i + 1]) {
      return i + 1 + Math.log(z / A3_RUNGS[i]) / Math.log(A3_RUNGS[i + 1] / A3_RUNGS[i]);
    }
  }
  return 5;
}
function a3Ramp(f, a, b) { return clamp((f - a) / (b - a), 0, 1); }

/* ---------------- the draughtsman's tools, lifted from the plate ---------------- */
function a3Resample(pts, step, closed) {
  var out = [], n = pts.length, last = closed ? n : n - 1, carry = 0;
  for (var i = 0; i < last; i++) {
    var a = pts[i], b = pts[(i + 1) % n];
    var dx = b[0] - a[0], dy = b[1] - a[1];
    var len = Math.hypot(dx, dy);
    if (len < 1e-6) continue;
    var d = carry;
    while (d < len) { var t = d / len; out.push([a[0] + dx * t, a[1] + dy * t]); d += step; }
    carry = d - len;
  }
  if (!closed) out.push(pts[n - 1].slice());
  return out.length >= 3 ? out : pts;
}
/* the storyteller's tremor: every point displaced by fixed seed noise */
function a3Tremble(pts, seed, amp, wl) {
  var r1 = mulberry32(seed >>> 0), r2 = mulberry32((seed ^ 0x9e37) >>> 0);
  var ph1 = r1() * TAU, ph2 = r2() * TAU;
  var f1 = 1 / wl, f2 = 2.7 / wl;
  var n = pts.length, out = new Array(n), acc = 0;
  for (var i = 0; i < n; i++) {
    var p = pts[i];
    if (i > 0) acc += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
    var prev = pts[(i - 1 + n) % n], next = pts[(i + 1) % n];
    var nx = next[1] - prev[1], ny = -(next[0] - prev[0]);
    var l = Math.hypot(nx, ny) || 1;
    nx /= l; ny /= l;
    var d = amp * (Math.sin(acc * f1 * TAU + ph1) * 0.62 + Math.sin(acc * f2 * TAU + ph2) * 0.38);
    out[i] = [p[0] + nx * d, p[1] + ny * d];
  }
  return out;
}
function a3Smooth(poly, iters) {
  var pts = poly;
  for (var k = 0; k < (iters || 1); k++) {
    var n = pts.length, out = [];
    for (var i = 0; i < n; i++) {
      var a = pts[i], b = pts[(i + 1) % n];
      out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      out.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    pts = out;
  }
  return pts;
}
function a3Offset(poly, d) {
  var n = poly.length, out = new Array(n), ar = 0;
  for (var i = 0; i < n; i++) { var a = poly[i], b = poly[(i + 1) % n]; ar += a[0] * b[1] - b[0] * a[1]; }
  var sign = ar > 0 ? 1 : -1;
  for (var j = 0; j < n; j++) {
    var prev = poly[(j - 1 + n) % n], next = poly[(j + 1) % n];
    var nx = (next[1] - prev[1]) * sign, ny = -(next[0] - prev[0]) * sign;
    var l = Math.hypot(nx, ny) || 1;
    out[j] = [poly[j][0] + (nx / l) * d, poly[j][1] + (ny / l) * d];
  }
  return out;
}
function a3Catmull(pts, seg) {
  var out = [], n = pts.length;
  if (n < 2) return pts.slice();
  for (var i = 0; i < n - 1; i++) {
    var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    for (var j = 0; j < seg; j++) {
      var t = j / seg, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
      ]);
    }
  }
  out.push(pts[n - 1].slice());
  return out;
}
function a3Hull(points) {
  var pts = points.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
  var cross = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); };
  var lower = [], i;
  for (i = 0; i < pts.length; i++) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pts[i]) <= 0) lower.pop();
    lower.push(pts[i]);
  }
  var upper = [];
  for (i = pts.length - 1; i >= 0; i--) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pts[i]) <= 0) upper.pop();
    upper.push(pts[i]);
  }
  lower.pop(); upper.pop();
  return lower.concat(upper);
}
function a3Path(pts, closed) {
  var p = new Path2D();
  p.moveTo(pts[0][0], pts[0][1]);
  for (var i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
  if (closed) p.closePath();
  return p;
}
function a3SmoothPath(poly) {
  var p = new Path2D(), n = poly.length;
  p.moveTo((poly[0][0] + poly[n - 1][0]) / 2, (poly[0][1] + poly[n - 1][1]) / 2);
  for (var i = 0; i < n; i++) {
    var a = poly[i], b = poly[(i + 1) % n];
    p.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  }
  p.closePath();
  return p;
}
function a3Hash(s) {
  var h = 2166136261;
  for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/* ============================================================
   THE WORLD: two archipelago spines, sixteen island groups honestly
   derived from the official taxonomy, 288 true islands laid
   deterministically. No continents anywhere.
   ============================================================ */
var A3 = {
  built: false, islands: [], bySlug: null, groups: [], chains: null, seas: null,
  capes: [], ferry: null, ferryStrands: [], trail: [], migIsles: [],
  intraWays: [], lanes: [], crossEdges: 0, rocks: [], swell: [], stipple: [],
  decor: [], census: null, warp: null, dist: null, spines: null
};

/* the arc order is the reading order of the sidebar: sailing the chain
   tip to horn is reading the documentation front to back */
var A3_CHAIN_GROUPS = [
  { sec: 'Getting Started', name: 'The Landfall Isles', fam: 'harbor', wash: 'azure' },
  { sec: 'Features', name: 'The Hearth Isles', fam: 'settlement', wash: 'rose' },
  { sec: 'AI', name: 'The Three Watchers', fam: 'startower', wash: 'violet', offshore: true },
  { sec: 'Content APIs', name: 'The Beacon Skerries', fam: 'lighthouse', wash: 'ochre' },
  { sec: 'Configurations', name: 'The Windward Banks', fam: 'windmill', wash: 'sage' },
  { sec: 'Development', name: 'The Forge Isles', fam: 'forge', wash: 'rose' },
  { sec: 'TypeScript', name: 'The Rune Stones', fam: 'stone', wash: 'violet', singleRow: true },
  { sec: 'Command Line Interface', name: 'The Signal Rock', fam: 'signal', wash: 'azure', singleRow: true },
  { sec: 'Plugins development', name: 'The Shipwright Isles', fam: 'shipyard', wash: 'azure' },
  { sec: 'Upgrades', name: 'The Broken Highlands', fam: 'cairn', wash: 'ochre' }
];
var A3_CRESC_GROUPS = [
  { sec: 'Getting Started', name: 'The Landing Roads', fam: 'harbor', wash: 'sage' },
  { sec: 'Deployments', name: 'The Dock Isles', fam: 'dockyard', wash: 'azure' },
  { sec: 'Projects management', name: 'The Keep Holms', fam: 'keep', wash: 'rose' },
  { sec: 'Advanced configuration', name: 'The High Mills', fam: 'highmill', wash: 'ochre' },
  { sec: 'Account management', name: 'The Toll Holms', fam: 'tollhouse', wash: 'violet' },
  { sec: 'Command Line Interface', name: 'The Lone Pennant', fam: 'signal', wash: 'sage' }
];

/* the plate's own control points, rescaled from 1800x1020 to this 1400x810
   vellum and opened out a little so the two arcs fill the sheet */
function a3Ctrl(list) {
  var CX = 700, CY = 408, EX = 1.10, EY = 1.20;
  return list.map(function (p) {
    var x = p[0] * (1400 / 1800), y = p[1] * (810 / 1020);
    return [CX + (x - CX) * EX, CY + (y - CY) * EY];
  });
}

function a3BuildSpine(ctrl, seaPoint) {
  var pts = a3Catmull(ctrl, 24), samples = [], s = 0, i;
  for (i = 0; i < pts.length; i++) {
    if (i > 0) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    samples.push({ x: pts[i][0], y: pts[i][1], s: s });
  }
  var len = s;
  for (i = 0; i < samples.length; i++) {
    var a = samples[Math.max(0, i - 1)], b = samples[Math.min(samples.length - 1, i + 1)];
    var tx = b.x - a.x, ty = b.y - a.y;
    var l = Math.hypot(tx, ty) || 1;
    tx /= l; ty /= l;
    var nx = -ty, ny = tx;
    if ((seaPoint.x - samples[i].x) * nx + (seaPoint.y - samples[i].y) * ny < 0) { nx = -nx; ny = -ny; }
    samples[i].tx = tx; samples[i].ty = ty; samples[i].nx = nx; samples[i].ny = ny;
  }
  return {
    samples: samples, len: len,
    at: function (q) {
      q = clamp(q, 0, len);
      var lo = 0, hi = samples.length - 1;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (samples[mid].s < q) lo = mid + 1; else hi = mid; }
      return samples[Math.max(0, lo)];
    }
  };
}

function a3Build() {
  if (A3.built) return A3;
  var t0 = performance.now();
  var SEA = { x: 700, y: 373 * 1.0 };
  var chainSpine = a3BuildSpine(a3Ctrl([[368, 300], [310, 470], [420, 650], [700, 752], [1040, 748], [1310, 645], [1462, 472], [1484, 340]]),
    { x: 700, y: 380 });
  var crescSpine = a3BuildSpine(a3Ctrl([[648, 302], [850, 258], [1050, 264], [1188, 312]]),
    { x: 700, y: 520 });
  A3.spines = { chain: chainSpine, crescent: crescSpine };
  void SEA;

  /* --------- the 288 islands, one per real page --------- */
  var isles = world.islands.slice().sort(function (a, b) { return a.slug < b.slug ? -1 : 1; });
  var maxW = 1, i, o, I;
  for (i = 0; i < isles.length; i++) maxW = Math.max(maxW, isles[i].words);
  A3.islands = isles.map(function (I2, k) {
    var r = Math.max(3.9, 1.24 * Math.pow(Math.max(60, I2.words), 0.25));
    var rank = I2.inbound >= 20 ? 'capital' : I2.inbound >= 8 ? 'town' : I2.inbound >= 3 ? 'village' : 'hamlet';
    I2.a3 = {
      idx: k, r: r, rank: rank, x: 0, y: 0, lean: 0, group: null,
      spineIsle: false, pinned: false, seated: false,
      sub: (world.taxonomy[I2.slug] || {}).sub || null
    };
    return I2;
  });
  A3.bySlug = world.bySlug;

  /* --------- the sixteen groups, from the official taxonomy alone --------- */
  A3.groups = [];
  function collect(defs, product, spine, chainKey) {
    for (var d = 0; d < defs.length; d++) {
      var def = defs[d];
      var members = A3.islands.filter(function (q) { return q.product === product && q.section === def.sec; });
      if (!members.length) continue;
      members.sort(function (a, b) { return a.slug < b.slug ? -1 : 1; });
      var spineIsle = members.slice().sort(function (a, b) {
        return b.inbound - a.inbound || b.words - a.words || (a.slug < b.slug ? -1 : 1);
      })[0];
      spineIsle.a3.spineIsle = true;
      var g = {
        id: A3.groups.length, sec: def.sec, name: def.name, fam: def.fam, wash: def.wash,
        offshore: !!def.offshore, singleRow: !!def.singleRow,
        product: product, chain: chainKey, spine: spine,
        members: members, count: members.length, spineIsle: spineIsle
      };
      for (var m = 0; m < members.length; m++) members[m].a3.group = g;
      A3.groups.push(g);
    }
  }
  collect(A3_CHAIN_GROUPS, 'cms', chainSpine, 'chain');
  collect(A3_CRESC_GROUPS, 'cloud', crescSpine, 'crescent');
  /* the taxonomy is total over this corpus: nothing may fall off the chart */
  var orphan = A3.islands.filter(function (q) { return !q.a3.group; });
  if (orphan.length) {
    var g0 = A3.groups[0];
    for (i = 0; i < orphan.length; i++) { orphan[i].a3.group = g0; g0.members.push(orphan[i]); g0.count++; }
  }

  /* the ninth seat: each chain's most cited page is capital of her chain */
  for (var ck = 0; ck < 2; ck++) {
    var key = ck ? 'cloud' : 'cms';
    var seat = A3.islands.filter(function (q) { return q.product === key; })
      .sort(function (a, b) { return b.inbound - a.inbound; })[0];
    if (seat) seat.a3.seated = true;
  }

  /* --------- the spans along the arcs --------- */
  function layoutArc(spine, gs, gapS, pad) {
    var weights = gs.map(function (g) {
      if (g.offshore) { g.rows = 1; return 0; }
      var w = 0;
      for (var k = 0; k < g.members.length; k++) w += 2 * g.members[k].a3.r + 5;
      var rows = g.singleRow ? 1 : g.count <= 6 ? 1 : g.count <= 16 ? 2 : g.count <= 34 ? 3 : 4;
      g.rows = rows;
      return (w / rows) * 1.16;
    });
    var band = 0;
    for (var q = 0; q < weights.length; q++) if (weights[q] > 0) band++;
    var totalW = weights.reduce(function (a, b) { return a + b; }, 0) || 1;
    var usable = spine.len - 2 * pad - Math.max(0, band - 1) * gapS;
    var s = pad;
    gs.forEach(function (g, k) {
      if (g.offshore) return;
      var span = weights[k] / totalW * usable;
      g.s0 = s; g.s1 = s + span; g.mid = s + span / 2;
      s += span + gapS;
    });
    gs.forEach(function (g, k) {
      if (!g.offshore) return;
      var prev = gs[k - 1] || gs[k + 1];
      g.mid = prev.s1 - 16; g.s0 = g.mid - 26; g.s1 = g.mid + 26;
    });
  }
  layoutArc(chainSpine, A3.groups.filter(function (g) { return g.chain === 'chain'; }), 24, 26);
  layoutArc(crescSpine, A3.groups.filter(function (g) { return g.chain === 'crescent'; }), 17, 18);

  /* --------- the placement --------- */
  var ROWS = { 1: [0], 2: [10, -10], 3: [0, 19, -19], 4: [9, -9, 28, -28] };
  for (var gi = 0; gi < A3.groups.length; gi++) {
    var g = A3.groups[gi];
    var spine = g.spine, jr = mulberry32(1000 + g.id * 17);
    if (g.offshore) {
      var aOff = spine.at(g.mid);
      var bx = aOff.x + aOff.nx * 92, by = aOff.y + aOff.ny * 92;
      var offs = [[0, 0], [30, 16], [9, 35]];
      g.members.forEach(function (q, k) { q.a3.x = bx + offs[k % 3][0]; q.a3.y = by + offs[k % 3][1]; });
      continue;
    }
    var rs = g.members.map(function (q) { return q.a3.r; }).sort(function (a, b) { return a - b; });
    var medR = rs[g.members.length >> 1];
    var rowScale = Math.max(1, (2 * medR + 5) / 20);
    var offsets = ROWS[g.rows].map(function (v) { return v * rowScale; });
    var cursors = offsets.map(function () { return g.s0; });
    var spineHalf = g.spineIsle.a3.r + 6;
    var am = spine.at(g.mid);
    g.spineIsle.a3.x = am.x; g.spineIsle.a3.y = am.y; g.spineIsle.a3.pinned = true;
    for (var mi = 0; mi < g.members.length; mi++) {
      o = g.members[mi];
      if (o === g.spineIsle) continue;
      var row = 0;
      for (var k2 = 1; k2 < cursors.length; k2++) if (cursors[k2] < cursors[row]) row = k2;
      var sPos = cursors[row] + o.a3.r;
      if (Math.abs(offsets[row]) < g.spineIsle.a3.r + o.a3.r * 0.7) {
        if (sPos + o.a3.r > g.mid - spineHalf && sPos - o.a3.r < g.mid + spineHalf) sPos = g.mid + spineHalf + o.a3.r;
      }
      cursors[row] = sPos + o.a3.r + 4;
      var ap = spine.at(Math.min(sPos, g.s1));
      var lat = offsets[row] + (jr() - 0.5) * 6;
      o.a3.x = ap.x + ap.nx * lat;
      o.a3.y = ap.y + ap.ny * lat;
    }
  }

  /* --------- the relaxation: no two islands touch --------- */
  (function relax() {
    var SEP = 4.6, cs = 42;
    for (var it = 0; it < 110; it++) {
      var moved = 0, grid = new Map(), n = A3.islands.length, a, b;
      for (a = 0; a < n; a++) {
        var oo = A3.islands[a].a3;
        var kk = (((oo.x / cs) | 0) * 4096) + ((oo.y / cs) | 0);
        if (!grid.has(kk)) grid.set(kk, []);
        grid.get(kk).push(A3.islands[a]);
      }
      for (a = 0; a < n; a++) {
        var O = A3.islands[a].a3;
        var cx0 = (O.x / cs) | 0, cy0 = (O.y / cs) | 0;
        for (var gx = cx0 - 1; gx <= cx0 + 1; gx++) for (var gy = cy0 - 1; gy <= cy0 + 1; gy++) {
          var cell = grid.get(gx * 4096 + gy);
          if (!cell) continue;
          for (var c = 0; c < cell.length; c++) {
            var Q = cell[c].a3;
            if (Q.idx <= O.idx) continue;
            var dx = Q.x - O.x, dy = Q.y - O.y, d = Math.hypot(dx, dy);
            var need = O.r + Q.r + SEP;
            if (d >= need) continue;
            if (d < 0.01) { dx = 1; dy = 0; d = 1; }
            var push = (need - d) / 2, ux = dx / d, uy = dy / d;
            if (!O.pinned) { O.x -= ux * push * (Q.pinned ? 2 : 1); O.y -= uy * push * (Q.pinned ? 2 : 1); }
            if (!Q.pinned) { Q.x += ux * push * (O.pinned ? 2 : 1); Q.y += uy * push * (O.pinned ? 2 : 1); }
            moved++;
          }
        }
      }
      for (a = 0; a < n; a++) {
        var P = A3.islands[a].a3;
        P.x = clamp(P.x, 118 + P.r, 1288 - P.r);
        P.y = clamp(P.y, 96 + P.r, 714 - P.r);
      }
      if (!moved) break;
    }
  })();

  /* --------- the coast of each island: three harmonics on a leaning ellipse --------- */
  for (i = 0; i < A3.islands.length; i++) {
    o = A3.islands[i].a3;
    var seed = a3Hash(A3.islands[i].slug);
    var rr = mulberry32(seed);
    var nH = 24, shape = [];
    var a0 = rr() * TAU, a1 = rr() * TAU, a2 = rr() * TAU;
    var k2h = 0.16 + rr() * 0.11, k3 = 0.10 + rr() * 0.10, k5 = 0.045 + rr() * 0.055;
    for (var h = 0; h < nH; h++) {
      var ah = (h / nH) * TAU;
      shape.push(1 + k2h * Math.sin(ah * 2 + a0) + k3 * Math.sin(ah * 3 + a1) +
        k5 * Math.sin(ah * 5 + a2) + (rr() - 0.5) * 0.11);
    }
    var mx = 0;
    for (h = 0; h < nH; h++) mx = Math.max(mx, shape[h]);
    if (mx > 1.4) for (h = 0; h < nH; h++) shape[h] *= 1.4 / mx;
    o.shape = shape; o.seed = seed;
    var elong = 1 + rr() * 0.34;
    o.ax = Math.sqrt(0.94 * elong);
    o.ay = Math.sqrt(0.94 / elong);
    /* the lean follows the arc under the storyteller's hand */
    if (o.group && !o.group.offshore) {
      var sp = o.group.spine, best = null, bd = 1e9;
      for (var si = 0; si < sp.samples.length; si += 3) {
        var ss = sp.samples[si];
        var dd = (ss.x - o.x) * (ss.x - o.x) + (ss.y - o.y) * (ss.y - o.y);
        if (dd < bd) { bd = dd; best = ss; }
      }
      var th = Math.atan2(best.ty, best.tx);
      if (th > Math.PI / 2) th -= Math.PI;
      if (th < -Math.PI / 2) th += Math.PI;
      o.lean = clamp(th, -0.42, 0.42) * 0.82 + (rr() - 0.5) * 0.1;
    } else o.lean = (rr() - 0.5) * 0.12;
    o.shapeRot = o.lean + (rr() - 0.5) * 0.9;
  }

  /* --------- the paths, both hands --------- */
  for (i = 0; i < A3.islands.length; i++) {
    o = A3.islands[i].a3;
    var poly = a3BlobPoly(o, 26);
    o.poly = poly;
    o.pathEng = a3SmoothPath(poly);
    o.ringsEng = [2.4, 5.2].map(function (dd2) { return a3SmoothPath(a3Offset(poly, dd2)); });
    var mr = mulberry32(o.seed ^ 0xAB), ma = mr() * TAU;
    o.washPath = a3SmoothPath(poly.map(function (p) { return [p[0] + Math.cos(ma) * 1.4, p[1] + Math.sin(ma) * 1.1]; }));
    var dense = a3Resample(a3Smooth(poly, 2), 2.4, true);
    var trem = a3Tremble(dense, o.seed ^ 0x51, Math.min(1.25, o.r * 0.09), 8.5);
    o.pathTolk = a3Path(trem, true);
    o.trembled = trem;
    o.ringTolk = a3Path(a3Tremble(a3Resample(a3Offset(a3Smooth(poly, 1), 3.1), 3, true), o.seed ^ 0x52, 0.95, 10.5), true);
  }

  a3BuildTerrain();
  a3BuildGroupWaters();
  a3BuildWays();
  a3BuildDecor();
  a3BuildSeas();
  a3BuildCensus();

  A3.built = true;
  A3.buildMs = +(performance.now() - t0).toFixed(1);
  return A3;
}

/* the single source of truth for a coast: terrain, rivers and mouths all read it */
function a3ShapeAt(o, a) {
  var m = o.shape.length;
  var fi = ((a % TAU + TAU) % TAU) / TAU * m;
  var i0 = Math.floor(fi) % m, i1 = (i0 + 1) % m, t = fi - Math.floor(fi);
  return o.shape[i0] * (1 - t) + o.shape[i1] * t;
}
function a3ShapePoint(o, a, u) {
  var sh = a3ShapeAt(o, a) * (u === undefined ? 1 : u);
  var ex = Math.cos(a) * o.r * sh * o.ax;
  var ey = Math.sin(a) * o.r * sh * o.ay;
  var c = Math.cos(o.shapeRot), s = Math.sin(o.shapeRot);
  return [o.x + ex * c - ey * s, o.y + ex * s + ey * c];
}
function a3BlobPoly(o, n) {
  var pts = [];
  for (var k = 0; k < n; k++) pts.push(a3ShapePoint(o, (k / n) * TAU, 1));
  return pts;
}

var A3_BREAKING = '/cms/migration/v4-to-v5/breaking-changes';

/* ---------------- the ground: mountains, forests, rivers ---------------- */
function a3BuildTerrain() {
  for (var i = 0; i < A3.islands.length; i++) {
    var I = A3.islands[i], o = I.a3;
    o.terr = []; o.river = null;
    var rr = mulberry32(o.seed ^ 0x77E);
    var sec = I.section;
    var items = [];
    var sample = function (uMin, uMax) {
      for (var t = 0; t < 24; t++) {
        var a = rr() * TAU, u = uMin + rr() * (uMax - uMin);
        var p = a3ShapePoint(o, a, u * 0.94);
        var d = Math.hypot(p[0] - o.x, p[1] - o.y);
        if (d < o.r * 0.42 && Math.abs(p[1] - o.y) < o.r * 0.35) continue;
        return p;
      }
      return null;
    };
    var area = Math.PI * o.r * o.r;
    var nM = 0, nT = 0, nH = 0;
    if (sec === 'Upgrades') { nM = Math.max(1, Math.round(o.r / 3.0)); nT = o.r >= 7.5 ? 1 : 0; }
    else if (sec === 'Features') { nT = Math.max(3, Math.round(area / 34)); nH = o.r >= 8.5 ? 1 : 0; }
    else if (o.spineIsle) { nT = Math.max(2, Math.round(area / 52)); nM = o.r >= 8.5 ? 1 : 0; nH = 1; }
    else if (o.r >= 6.2) { nT = Math.max(1, Math.round(area / 76)); nH = o.r >= 8.2 ? 1 : 0; }
    var tall = I.slug === A3_BREAKING;
    if (tall) nM = 4;
    var k, p2;
    for (k = 0; k < nM; k++) {
      p2 = sample(0.08, 0.45);
      if (!p2) continue;
      items.push({ type: tall ? 'tallMountain' : 'mountain', v: (o.seed + k) % 3, x: p2[0], y: p2[1],
        w: tall ? clamp(o.r * 1.35, 9, 17) : clamp(o.r * 0.8, 5, 12) });
    }
    for (k = 0; k < nT; k++) {
      p2 = sample(0.12, 0.68);
      if (!p2) continue;
      items.push({ type: rr() < 0.22 ? 'pine' : 'tree', v: (o.seed + k) % 3, x: p2[0], y: p2[1],
        w: clamp(o.r * 0.44, 2.8, 5.0) });
    }
    for (k = 0; k < nH; k++) {
      p2 = sample(0.3, 0.7);
      if (!p2) continue;
      items.push({ type: 'hill', v: (o.seed + k) % 3, x: p2[0], y: p2[1], w: clamp(o.r * 0.55, 4, 8) });
    }
    items.sort(function (a, b) { return a.y - b.y; });
    o.terr = items;

    /* the river: it falls from the high ground and reaches the sea at a marsh
       mouth; its run answers the page's word count */
    if (I.words >= 1400 || tall) {
      var aim = rr() * TAU;
      var mouth = a3ShapePoint(o, aim, 0.985);
      var springU = clamp(0.34 + I.words / 6000, 0.34, 0.78);
      var src = a3ShapePoint(o, aim + Math.PI, springU);
      var ux = mouth[0] - src[0], uy = mouth[1] - src[1];
      var ul = Math.hypot(ux, uy) || 1;
      var px = -uy / ul, py = ux / ul, sw = (rr() - 0.5) * 2;
      var pts = a3Catmull([
        src,
        [src[0] + ux * 0.3 + px * o.r * 0.20 * sw, src[1] + uy * 0.3 + py * o.r * 0.20 * sw],
        [src[0] + ux * 0.62 - px * o.r * 0.22 * sw, src[1] + uy * 0.62 - py * o.r * 0.22 * sw],
        [src[0] + ux * 0.86 + px * o.r * 0.08 * sw, src[1] + uy * 0.86 + py * o.r * 0.08 * sw],
        mouth], 12);
      o.river = { pts: a3Tremble(pts, o.seed ^ 0x9, 0.5, 6.5), mouth: mouth, dirA: aim,
        mig: tall, wide: o.r >= 8.6 };
    }
  }
}

/* ---------------- the group waters: dotted limits and washes ---------------- */
function a3BuildGroupWaters() {
  for (var gi = 0; gi < A3.groups.length; gi++) {
    var g = A3.groups[gi], pts = [], i, k, a, o;
    for (i = 0; i < g.members.length; i++) {
      o = g.members[i].a3;
      for (k = 0; k < 8; k++) {
        a = (k / 8) * TAU;
        pts.push([o.x + Math.cos(a) * (o.r + 13), o.y + Math.sin(a) * (o.r + 13)]);
      }
    }
    var hull = a3Hull(pts);
    g.limit = a3Smooth(hull, 2);
    var mr = mulberry32(3000 + g.id), ma = mr() * TAU, mo = 2 + mr() * 2;
    g.washPoly = g.limit.map(function (p) { return [p[0] + Math.cos(ma) * mo, p[1] + Math.sin(ma) * mo]; });
    /* the lockup anchor: lettered across the band, the way province names are */
    var at = g.spine.at(g.mid);
    var sx = 0, sy = 0, n2 = 0, ext = 0;
    for (i = 0; i < g.members.length; i++) { o = g.members[i].a3; sx += o.x; sy += o.y; n2++; }
    var cx = sx / n2, cy = sy / n2;
    for (i = 0; i < g.members.length; i++) {
      o = g.members[i].a3;
      var d = Math.hypot(o.x - cx, o.y - cy) + o.r;
      if (d > ext) ext = d;
    }
    var rot = (function () {
      var th = Math.atan2(at.ty, at.tx);
      if (th > Math.PI / 2) th -= Math.PI;
      if (th < -Math.PI / 2) th += Math.PI;
      return clamp(th, -0.5, 0.5);
    })();
    if (g.offshore) {
      g.anchor = { x: cx + 5, y: cy - ext - 13, rot: 0 };
      g.lead = [cx, cy - ext];
    } else if (g.chain === 'crescent') {
      var kth = A3.groups.filter(function (q) { return q.chain === 'crescent'; }).indexOf(g);
      var bandMax = 0;
      for (var q2 = 0; q2 < A3.groups.length; q2++) {
        if (A3.groups[q2].chain !== 'crescent') continue;
        for (var m2 = 0; m2 < A3.groups[q2].members.length; m2++) {
          var oo = A3.groups[q2].members[m2].a3;
          bandMax = Math.max(bandMax, oo.y + oo.r);
        }
      }
      g.anchor = { x: cx + (kth % 2) * 9, y: bandMax + 14 + (kth % 2) * 24, rot: 0 };
      g.lead = [cx, cy + ext * 0.5];
    } else if (g.count <= 6) {
      g.anchor = { x: cx - at.nx * (ext + 18), y: cy - at.ny * (ext + 18), rot: rot * 0.6 };
      g.lead = [cx - at.nx * ext * 0.55, cy - at.ny * ext * 0.55];
    } else {
      g.anchor = { x: cx, y: cy, rot: rot };
    }
    g.cx = cx; g.cy = cy; g.ext = ext;
  }

  /* the official sub reaches, lettered as capes beside their own skerries */
  A3.capes = [];
  var subNames = { 'REST API': 'The Rest Cape', 'Document Service API': 'The Document Cape' };
  Object.keys(subNames).forEach(function (sub) {
    var list = A3.islands.filter(function (q) { return q.a3.sub === sub; });
    if (!list.length) return;
    var sx = 0, sy = 0;
    list.forEach(function (q) { sx += q.a3.x; sy += q.a3.y; });
    var cx = sx / list.length, cy = sy / list.length;
    var g = list[0].a3.group, at = g.spine.at(g.mid);
    A3.capes.push({ name: subNames[sub], official: sub, count: list.length,
      x: cx - at.nx * 52, y: cy - at.ny * 52, rot: list[0].a3.lean * 0.7 });
  });
}

/* ---------------- the ways: every one a real citation ---------------- */
function a3BuildWays() {
  var edges = world.graph.edges, cross = 0, intraByGroup = new Map(), scored = [];
  for (var e = 0; e < edges.length; e++) {
    var A = world.bySlug.get(edges[e][0]), B = world.bySlug.get(edges[e][1]);
    if (!A || !B || !A.a3 || !B.a3) continue;
    var w = A.inbound + B.inbound;
    scored.push([A, B, w]);
    if (A.product !== B.product) cross++;
    else if (A.a3.group && A.a3.group === B.a3.group) {
      var id = A.a3.group.id;
      if (!intraByGroup.has(id)) intraByGroup.set(id, []);
      intraByGroup.get(id).push([A, B, w]);
    }
  }
  A3.crossEdges = cross;
  A3.intraWays = [];
  intraByGroup.forEach(function (list) {
    list.sort(function (p, q) { return q[2] - p[2]; });
    for (var k = 0; k < Math.min(4, list.length); k++) A3.intraWays.push([list[k][0], list[k][1]]);
  });
  scored.sort(function (p, q) { return q[2] - p[2]; });
  A3.lanes = scored.slice(0, 140).map(function (x) { return [x[0], x[1]]; });

  /* the ferry across the Deployment Passage, bundled from the true crossings */
  var landfall = A3.groups.filter(function (g) { return g.chain === 'chain' && g.sec === 'Getting Started'; })[0];
  var landing = A3.groups.filter(function (g) { return g.chain === 'crescent' && g.sec === 'Getting Started'; })[0];
  if (landfall && landing) {
    var fa = null, fb = null, fd = 1e9;
    landfall.members.forEach(function (a) {
      landing.members.forEach(function (b) {
        var d = Math.hypot(a.a3.x - b.a3.x, a.a3.y - b.a3.y);
        if (d < fd) { fd = d; fa = a; fb = b; }
      });
    });
    var mxp = (fa.a3.x + fb.a3.x) / 2, dip = Math.min(fa.a3.y, fb.a3.y) - 30;
    A3.ferry = a3Catmull([[fa.a3.x, fa.a3.y], [mxp - 40, dip + 6], [mxp + 40, dip], [fb.a3.x, fb.a3.y]], 14);
    A3.ferryEnds = [fa, fb];
    A3.ferryStrands = [-2.4, 0, 2.4].map(function (off) {
      return A3.ferry.map(function (p, i) {
        var tt = i / (A3.ferry.length - 1);
        var a = A3.ferry[Math.max(0, i - 1)], b = A3.ferry[Math.min(A3.ferry.length - 1, i + 1)];
        var nx = -(b[1] - a[1]), ny = b[0] - a[0];
        var l = Math.hypot(nx, ny) || 1, k2 = off * Math.sin(Math.PI * tt);
        return [p[0] + nx / l * k2, p[1] + ny / l * k2];
      });
    });
  }
  /* the Migration Trail, threading the true v4 to v5 pages */
  var mig = A3.islands.filter(function (q) { return q.slug.indexOf('/cms/migration/v4-to-v5/') === 0; })
    .sort(function (a, b) { return b.inbound - a.inbound || (a.slug < b.slug ? -1 : 1); }).slice(0, 6);
  if (mig.length >= 2) {
    /* walk them nearest to nearest so the trail does not cross itself */
    var order = [mig[0]], rest = mig.slice(1);
    while (rest.length) {
      var last = order[order.length - 1], bi = 0, bd2 = 1e9;
      for (var r = 0; r < rest.length; r++) {
        var d2 = Math.hypot(rest[r].a3.x - last.a3.x, rest[r].a3.y - last.a3.y);
        if (d2 < bd2) { bd2 = d2; bi = r; }
      }
      order.push(rest.splice(bi, 1)[0]);
    }
    A3.migIsles = order;
    A3.trail = a3Catmull(order.map(function (q) { return [q.a3.x, q.a3.y]; }), 12);
  } else { A3.migIsles = []; A3.trail = []; }
}

/* ---------------- decor, clearly decor beside the real places ---------------- */
function a3BuildDecor() {
  A3.rocks = [];
  var rr = mulberry32(9119), guard = 0;
  while (A3.rocks.length < 22 && guard++ < 900) {
    var x = 90 + rr() * 1220, y = 60 + rr() * 690, clear = true;
    for (var i = 0; i < A3.islands.length; i++) {
      var o = A3.islands[i].a3;
      if ((o.x - x) * (o.x - x) + (o.y - y) * (o.y - y) < (o.r + 46) * (o.r + 46)) { clear = false; break; }
    }
    if (clear && Math.hypot(x - ROSE.x, y - ROSE.y) < ROSE.r + 40) clear = false;
    if (clear) A3.rocks.push({ x: x, y: y, kind: rr() < 0.5 ? 'rock' : 'breaker', seed: (rr() * 1e9) | 0 });
  }
  /* the storyteller's swell: the open sea of the deep rungs is drawn paper */
  A3.swell = [];
  var sr = mulberry32(0x5EA5), step = 21;
  for (var gx = 0; gx < 1400; gx += step) {
    for (var gy = 0; gy < 810; gy += step) {
      var sx = gx + sr() * step, sy = gy + sr() * step;
      var near = a3NearestCoast(sx, sy);
      if (near < 8) continue;
      var closeness = clamp(1 - (near - 8) / 130, 0.18, 1);
      if (sr() > 0.28 + closeness * 0.34) continue;
      A3.swell.push({ x: sx, y: sy, a: (sr() - 0.5) * 0.5, w: 5 + sr() * 4.6 });
    }
  }
  /* the engraver's coast stipple */
  A3.stipple = [];
  for (var k = 0; k < A3.islands.length; k++) {
    var oo = A3.islands[k].a3, r2 = mulberry32(oo.seed ^ 77);
    var n = Math.max(6, Math.round(oo.r * 1.3));
    for (var q = 0; q < n; q++) {
      var a = r2() * TAU, rad = oo.r * (1.34 + r2() * 0.5);
      A3.stipple.push([oo.x + Math.cos(a) * rad, oo.y + Math.sin(a) * rad, 0.25 + r2() * 0.5]);
    }
  }
}
function a3NearestCoast(x, y) {
  var best = 1e9;
  for (var i = 0; i < A3.islands.length; i++) {
    var o = A3.islands[i].a3;
    var d = Math.hypot(o.x - x, o.y - y) - o.r;
    if (d < best) best = d;
  }
  return best;
}

/* ---------------- the four named waters and the strait ---------------- */
function a3OpenSeat(x0, y0, x1, y1, prefer) {
  var best = null, bs = -1;
  for (var x = x0; x <= x1; x += 12) {
    for (var y = y0; y <= y1; y += 12) {
      var d = a3NearestCoast(x, y);
      if (d <= 0) continue;
      var s = d - (prefer ? Math.hypot(x - prefer[0], y - prefer[1]) * 0.22 : 0);
      if (s > bs) { bs = s; best = [x, y]; }
    }
  }
  return best || [(x0 + x1) / 2, (y0 + y1) / 2];
}
function a3BuildSeas() {
  var chain = A3.spines.chain, cresc = A3.spines.crescent;
  var cm = chain.at(chain.len * 0.5), rm = cresc.at(cresc.len * 0.5);
  var pubY = (cm.y + rm.y) / 2;
  var pub = a3OpenSeat(520, Math.min(rm.y + 70, pubY - 60), 900, pubY + 20, [700, pubY - 40]);
  var open = a3OpenSeat(220, 690, 900, 780, [470, 745]);
  var bayAnchor = chain.at(chain.len * 0.08);
  var bay = a3OpenSeat(bayAnchor.x - 10, bayAnchor.y - 60, bayAnchor.x + 190, bayAnchor.y + 130,
    [bayAnchor.x + 90, bayAnchor.y + 20]);
  var deep = a3OpenSeat(950, 540, 1290, 740, [1120, 660]);
  var pass = A3.ferry
    ? [A3.ferry[Math.floor(A3.ferry.length * 0.5)][0], A3.ferry[Math.floor(A3.ferry.length * 0.5)][1] - 20]
    : [430, 250];
  A3.seas = {
    publishing: { name: 'The Publishing Sea', x: pub[0], y: pub[1], arc: 620, size: 15.5 },
    openMain: { name: 'The Open Main', x: open[0], y: open[1], arc: -640, size: 19 },
    bay: { name: 'The Bay of Beginnings', x: bay[0], y: bay[1], arc: 0, size: 10 },
    deep: { name: 'The Unreached Deep', x: deep[0], y: deep[1], arc: 0, size: 10 },
    passage: { name: 'The Deployment Passage', x: pass[0], y: pass[1], arc: 0, size: 9.6 }
  };
  A3.chains = {
    chain: { key: 'chain', name: 'THE CONTENTIAN CHAIN', official: 'Strapi CMS',
      x: 700, y: 0, arc: -620, size: 20 },
    crescent: { key: 'crescent', name: 'THE NUBILIAN CRESCENT', official: 'Strapi Cloud',
      x: 700, y: 0, arc: 620, size: 15 }
  };
  /* the chain lockups sit on their own open water, inside the bow and above the crescent */
  var chainSeat = a3OpenSeat(430, pubY + 40, 1000, pubY + 150, [700, pubY + 90]);
  A3.chains.chain.x = chainSeat[0]; A3.chains.chain.y = chainSeat[1];
  var top = 1e9;
  A3.groups.forEach(function (g) {
    if (g.chain !== 'crescent') return;
    g.members.forEach(function (m) { top = Math.min(top, m.a3.y - m.a3.r); });
  });
  A3.chains.crescent.x = 700;
  A3.chains.crescent.y = Math.max(72, top - 34);
}

/* ---------------- the census: every number lettered on this sheet ---------------- */
function a3BuildCensus() {
  var isl = A3.islands, i, I;
  var fams = {}, ranks = { capital: 0, town: 0, village: 0, hamlet: 0 };
  var byChain = { cms: 0, cloud: 0 };
  var code = 0, code10 = 0, longread = 0, unreached = 0;
  var landmark = 0, cited = 0, seated = 0;
  for (i = 0; i < isl.length; i++) {
    I = isl[i];
    byChain[I.product]++;
    ranks[I.a3.rank]++;
    if (I.a3.seated) seated++;
    if (I.code > 0) code++;
    if (I.code >= 10) code10++;
    if (I.words >= 2000) longread++;
    if (I.inbound === 0) unreached++;
    if (a3IsLandmark(I)) landmark++;
    if (a3IsCited(I)) cited++;
    var f = I.a3.group ? I.a3.group.fam : 'harbor';
    var key = f + '|' + I.section;
    fams[key] = (fams[key] || 0) + 1;
  }
  A3.census = {
    islands: isl.length,
    chains: { chain: byChain.cms, crescent: byChain.cloud },
    groups: A3.groups.map(function (g) { return { name: g.name, section: g.sec, product: g.product, count: g.count }; }),
    ranks: ranks, seated: seated,
    thresholds: { capital: 20, town: 8, village: 3, hamlet: 0 },
    marks: { code: code, smoke: code10, scroll: longread },
    edges: world.graph.edges.length, crossEdges: A3.crossEdges,
    unreached: unreached, landmarkTier: landmark, citedTier: cited,
    families: fams, migration: A3.migIsles.length,
    capitals: A3.islands.filter(function (q) { return q.a3.rank === 'capital'; })
      .map(function (q) { return [q.sidebarLabel, q.inbound]; })
      .sort(function (a, b) { return b[1] - a[1]; })
  };
}
function a3IsLandmark(I) { return I.product === 'cms' ? I.inbound >= 14 : I.inbound >= 4; }
function a3IsCited(I) { return I.product === 'cms' ? I.inbound >= 6 : I.inbound >= 2; }

/* ============================================================
   THE WARP: the chart is an archipelago, the sea is still the sea.

   The ship, her track, her soundings, her routes and the whole fog of
   voyages are drawn in WORLD coordinates through chartProject. So the
   archipelago layout is not a replacement for those positions: it is a
   warp. Each island's displacement from its plain sheet position to its
   seat on the chain is smeared over the sheet as a Gaussian weighted
   displacement field, baked once onto a grid. chartProject samples it;
   chartUnproject inverts it by Newton steps. Everything the game already
   draws in world coordinates therefore follows the islands onto the chains.
   ============================================================ */
function a3BuildWarp() {
  var B = world.bounds;
  var padx = (B.maxx - B.minx) * 0.16 + 1e-6, pady = (B.maxy - B.miny) * 0.16 + 1e-6;
  var x0 = B.minx - padx, y0 = B.miny - pady, x1 = B.maxx + padx, y1 = B.maxy + pady;
  var GX = 121, GY = 81;
  var cps = [], i, I, o;
  var mdx = 0, mdy = 0;
  for (i = 0; i < A3.islands.length; i++) {
    I = A3.islands[i]; o = I.a3;
    var bx = chart.ox + I.pos.x * chart.k, by = chart.oy + I.pos.y * chart.k;
    cps.push({ x: I.pos.x, y: I.pos.y, dx: o.x - bx, dy: o.y - by });
    mdx += o.x - bx; mdy += o.y - by;
  }
  mdx /= cps.length; mdy /= cps.length;
  /* the smear: wide enough that the field is smooth, narrow enough that a
     ship over an island lands on that island */
  var sigma = Math.max((x1 - x0), (y1 - y0)) / 15;
  var inv2s2 = 1 / (2 * sigma * sigma);
  var gx = new Float32Array(GX * GY), gy = new Float32Array(GX * GY);
  for (var j = 0; j < GY; j++) {
    var wy = y0 + (y1 - y0) * (j / (GY - 1));
    for (var ii = 0; ii < GX; ii++) {
      var wx = x0 + (x1 - x0) * (ii / (GX - 1));
      var sw = 0.06, sdx = mdx * 0.06, sdy = mdy * 0.06;
      for (var c = 0; c < cps.length; c++) {
        var p = cps[c];
        var ddx = p.x - wx, ddy = p.y - wy;
        var w = Math.exp(-(ddx * ddx + ddy * ddy) * inv2s2);
        sw += w; sdx += w * p.dx; sdy += w * p.dy;
      }
      var k = j * GX + ii;
      gx[k] = chart.ox + wx * chart.k + sdx / sw;
      gy[k] = chart.oy + wy * chart.k + sdy / sw;
    }
  }
  A3.warp = { GX: GX, GY: GY, x0: x0, y0: y0, x1: x1, y1: y1, gx: gx, gy: gy };
}

function chartProject(x, y) {
  var W = A3.warp;
  if (!W) return [chart.ox + x * chart.k, chart.oy + y * chart.k];
  var fx = (x - W.x0) / (W.x1 - W.x0) * (W.GX - 1);
  var fy = (y - W.y0) / (W.y1 - W.y0) * (W.GY - 1);
  fx = clamp(fx, 0, W.GX - 1.0001); fy = clamp(fy, 0, W.GY - 1.0001);
  var i0 = fx | 0, j0 = fy | 0, tx = fx - i0, ty = fy - j0;
  var a = j0 * W.GX + i0, b = a + W.GX;
  var px = (W.gx[a] * (1 - tx) + W.gx[a + 1] * tx) * (1 - ty) + (W.gx[b] * (1 - tx) + W.gx[b + 1] * tx) * ty;
  var py = (W.gy[a] * (1 - tx) + W.gy[a + 1] * tx) * (1 - ty) + (W.gy[b] * (1 - tx) + W.gy[b + 1] * tx) * ty;
  return [px, py];
}
function chartUnproject(sx, sy) {
  var x = (sx - chart.ox) / chart.k, y = (sy - chart.oy) / chart.k;
  for (var i = 0; i < 14; i++) {
    var p = chartProject(x, y);
    var ex = sx - p[0], ey = sy - p[1];
    if (Math.abs(ex) < 0.25 && Math.abs(ey) < 0.25) break;
    x += ex / chart.k * 0.72; y += ey / chart.k * 0.72;
  }
  return [x, y];
}

/* the chart fit: the plain scale the warp is measured against, and the seats
   of the two instruments that live in the sheet's own ink */
function chartFit() {
  var B = world.bounds, pad = 74;
  var sx = (CHART_W - pad * 2) / (B.maxx - B.minx);
  var sy = (CHART_H - pad * 2) / (B.maxy - B.miny);
  chart.k = Math.min(sx, sy);
  chart.ox = CHART_W / 2 - (B.minx + B.maxx) / 2 * chart.k;
  chart.oy = CHART_H / 2 - (B.miny + B.maxy) / 2 * chart.k;
  /* the rose stands in the middle of the Publishing Sea, as she does on the
     plate: an instrument laid on the water the bow half encloses */
  ROSE.x = 700; ROSE.y = 432; ROSE.r = 54;
  ROSE_RECT.x = ROSE.x - ROSE.r - 26; ROSE_RECT.y = ROSE.y - ROSE.r - 30;
  ROSE_RECT.w = (ROSE.r + 26) * 2; ROSE_RECT.h = ROSE.r * 2 + 62;
}

/* ============================================================
   THE DRAWN THINGS: fourteen symbol families at four ranks, the marks of
   substance, and the terrain in the storyteller's hand. Lifted from the
   winning plate's glyph book, inked in the game's own iron gall.
   ============================================================ */
var A3G = (function () {
  var SPR = 3;
  var GINK = 'rgba(38,28,17,0.96)';
  function sprite(w, h, seed, draw) {
    var c = document.createElement('canvas');
    c.width = Math.max(2, Math.ceil(w * SPR));
    c.height = Math.max(2, Math.ceil(h * SPR));
    var g = c.getContext('2d');
    g.scale(SPR, SPR);
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = GINK; g.fillStyle = GINK;
    draw(g, mulberry32(seed >>> 0));
    c._w = w; c._h = h;
    return c;
  }
  function wl(g, r, x1, y1, x2, y2, w) {
    g.lineWidth = Math.max(0.7, w);
    var mx = (x1 + x2) / 2 + (r() - 0.5) * 0.9, my = (y1 + y2) / 2 + (r() - 0.5) * 0.9;
    g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mx, my, x2, y2); g.stroke();
  }
  function wa(g, r, x, y, rad, a0, a1, w) {
    g.lineWidth = Math.max(0.7, w);
    g.beginPath(); g.arc(x + (r() - 0.5) * 0.5, y + (r() - 0.5) * 0.5, rad, a0, a1); g.stroke();
  }
  function wp(g, r, pts, w, close, fill) {
    g.lineWidth = Math.max(0.7, w);
    g.beginPath();
    g.moveTo(pts[0][0] + (r() - 0.5) * 0.6, pts[0][1] + (r() - 0.5) * 0.6);
    for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0] + (r() - 0.5) * 0.7, pts[i][1] + (r() - 0.5) * 0.7);
    if (close) g.closePath();
    if (fill) { g.save(); g.globalAlpha *= 0.14; g.fill(); g.restore(); }
    g.stroke();
  }
  var FAM = {
    harbor: function (g, r, s) {
      var c = s / 2, gd = s * 0.68;
      wl(g, r, c - s * 0.42, gd, c + s * 0.42, gd, s * 0.055);
      for (var i = -1; i <= 1; i++) wl(g, r, c + i * s * 0.26, gd, c + i * s * 0.26, gd + s * 0.09, s * 0.045);
      var top = s * 0.10;
      wa(g, r, c, top + s * 0.055, s * 0.05, 0, TAU, s * 0.045);
      wl(g, r, c, top + s * 0.11, c, gd - s * 0.10, s * 0.05);
      wl(g, r, c - s * 0.14, top + s * 0.22, c + s * 0.14, top + s * 0.22, s * 0.045);
      wa(g, r, c, gd - s * 0.26, s * 0.19, 0.45, Math.PI - 0.45, s * 0.05);
    },
    settlement: function (g, r, s) {
      var c = s / 2, gd = s * 0.70;
      wa(g, r, c, gd + s * 0.55, s * 0.72, -2.28, -0.86, s * 0.05);
      var hs = [[c - s * 0.20, s * 0.24, s * 0.20], [c + s * 0.10, s * 0.20, s * 0.16]];
      for (var i = 0; i < hs.length; i++) {
        var hx = hs[i][0], hw = hs[i][1], hh = hs[i][2];
        wp(g, r, [[hx - hw / 2, gd], [hx - hw / 2, gd - hh], [hx, gd - hh - hw * 0.42], [hx + hw / 2, gd - hh], [hx + hw / 2, gd]], s * 0.045, false, false);
      }
      wl(g, r, c + s * 0.30, gd, c + s * 0.30, gd - s * 0.44, s * 0.04);
      wp(g, r, [[c + s * 0.30, gd - s * 0.44], [c + s * 0.44, gd - s * 0.395], [c + s * 0.30, gd - s * 0.35]], s * 0.035, true, true);
    },
    lighthouse: function (g, r, s) {
      var c = s / 2, gd = s * 0.74, top = s * 0.14;
      wp(g, r, [[c - s * 0.15, gd], [c - s * 0.085, top + s * 0.09], [c + s * 0.085, top + s * 0.09], [c + s * 0.15, gd]], s * 0.05, false, false);
      wl(g, r, c - s * 0.12, gd - s * 0.19, c + s * 0.12, gd - s * 0.19, s * 0.04);
      wp(g, r, [[c - s * 0.085, top + s * 0.09], [c - s * 0.085, top - s * 0.02], [c + s * 0.085, top - s * 0.02], [c + s * 0.085, top + s * 0.09]], s * 0.04, true, false);
      g.save(); g.beginPath(); g.arc(c, top + s * 0.035, s * 0.028, 0, TAU); g.fill(); g.restore();
      for (var sg = -1; sg <= 1; sg += 2) for (var i = 0; i < 3; i++) {
        var a = (-0.32 + i * 0.32), x0 = c + sg * s * 0.13, y0 = top + s * 0.03;
        wl(g, r, x0, y0 + a * s * 0.10, x0 + sg * s * 0.22, y0 + a * s * 0.22, s * 0.028);
      }
      wl(g, r, c - s * 0.26, gd + s * 0.02, c + s * 0.26, gd + s * 0.02, s * 0.035);
    },
    windmill: function (g, r, s) {
      var c = s / 2, gd = s * 0.72, hub = s * 0.30;
      wp(g, r, [[c - s * 0.14, gd], [c - s * 0.085, hub + s * 0.06], [c + s * 0.085, hub + s * 0.06], [c + s * 0.14, gd]], s * 0.05, false, false);
      wa(g, r, c, hub + s * 0.06, s * 0.088, Math.PI, 0, s * 0.04);
      for (var i = 0; i < 4; i++) {
        var a = i * Math.PI / 2 + 0.6;
        wl(g, r, c, hub, c + Math.cos(a) * s * 0.30, hub + Math.sin(a) * s * 0.30, s * 0.038);
      }
      wl(g, r, c - s * 0.028, gd, c - s * 0.028, gd - s * 0.10, s * 0.032);
    },
    highmill: function (g, r, s) {
      var c = s / 2, gd = s * 0.74;
      wa(g, r, c, gd + s * 0.30, s * 0.42, -2.5, -0.64, s * 0.045);
      var mg = gd - s * 0.06, hub = s * 0.26;
      wp(g, r, [[c - s * 0.10, mg], [c - s * 0.065, hub + s * 0.10], [c + s * 0.065, hub + s * 0.10], [c + s * 0.10, mg]], s * 0.042, false, false);
      wa(g, r, c, hub + s * 0.10, s * 0.07, Math.PI, 0, s * 0.035);
      for (var i = 0; i < 4; i++) {
        var a = i * Math.PI / 2 + 0.35;
        wl(g, r, c, hub + s * 0.04, c + Math.cos(a) * s * 0.24, hub + s * 0.04 + Math.sin(a) * s * 0.24, s * 0.032);
      }
    },
    forge: function (g, r, s) {
      var c = s / 2, gd = s * 0.70;
      wp(g, r, [[c - s * 0.26, gd - s * 0.16], [c + s * 0.20, gd - s * 0.16], [c + s * 0.30, gd - s * 0.22], [c + s * 0.30, gd - s * 0.13], [c + s * 0.12, gd - s * 0.07], [c + s * 0.10, gd], [c - s * 0.16, gd], [c - s * 0.16, gd - s * 0.08]], s * 0.045, true, true);
      wl(g, r, c - s * 0.02, gd - s * 0.24, c + s * 0.20, gd - s * 0.46, s * 0.04);
      wp(g, r, [[c + s * 0.13, gd - s * 0.52], [c + s * 0.28, gd - s * 0.42]], s * 0.10, false, false);
      g.save(); g.beginPath(); g.arc(c - s * 0.12, gd - s * 0.30, s * 0.02, 0, TAU); g.fill();
      g.beginPath(); g.arc(c - s * 0.20, gd - s * 0.36, s * 0.016, 0, TAU); g.fill(); g.restore();
    },
    shipyard: function (g, r, s) {
      var c = s / 2, gd = s * 0.70;
      wa(g, r, c - s * 0.06, gd - s * 0.30, s * 0.30, 0.35, Math.PI - 0.35, s * 0.05);
      for (var i = -1; i <= 1; i++) wl(g, r, c - s * 0.06 + i * s * 0.13, gd - s * 0.02, c - s * 0.06 + i * s * 0.15, gd - s * 0.26, s * 0.03);
      wl(g, r, c + s * 0.30, gd + s * 0.02, c + s * 0.30, gd - s * 0.48, s * 0.045);
      wl(g, r, c + s * 0.30, gd - s * 0.48, c + s * 0.04, gd - s * 0.34, s * 0.04);
      wl(g, r, c + s * 0.12, gd - s * 0.385, c + s * 0.12, gd - s * 0.22, s * 0.028);
      wa(g, r, c + s * 0.12, gd - s * 0.20, s * 0.03, -0.5, Math.PI + 0.5, s * 0.028);
    },
    cairn: function (g, r, s) {
      var c = s / 2, gd = s * 0.70;
      wp(g, r, [[c - s * 0.46, gd], [c - s * 0.28, gd - s * 0.34], [c - s * 0.13, gd]], s * 0.045, false, false);
      wp(g, r, [[c + s * 0.13, gd], [c + s * 0.30, gd - s * 0.40], [c + s * 0.46, gd]], s * 0.045, false, false);
      for (var i = 0; i < 3; i++) wl(g, r, c + s * (0.30 + i * 0.045), gd - s * (0.30 - i * 0.09), c + s * (0.38 + i * 0.035), gd - s * (0.24 - i * 0.075), s * 0.025);
      wa(g, r, c, gd - s * 0.045, s * 0.085, Math.PI, 0, s * 0.04);
      wa(g, r, c, gd - s * 0.115, s * 0.06, Math.PI, 0, s * 0.038);
      wa(g, r, c, gd - s * 0.165, s * 0.035, Math.PI, 0, s * 0.036);
      wl(g, r, c - s * 0.10, gd, c + s * 0.10, gd, s * 0.038);
    },
    stone: function (g, r, s) {
      var c = s / 2, gd = s * 0.72;
      wp(g, r, [[c - s * 0.11, gd], [c - s * 0.13, gd - s * 0.30], [c - s * 0.05, gd - s * 0.46], [c + s * 0.09, gd - s * 0.44], [c + s * 0.13, gd - s * 0.12], [c + s * 0.10, gd]], s * 0.045, true, true);
      for (var i = 0; i < 3; i++) wl(g, r, c - s * 0.05, gd - s * (0.34 - i * 0.09), c + s * 0.05, gd - s * (0.35 - i * 0.09), s * 0.024);
      wl(g, r, c - s * 0.24, gd + s * 0.01, c - s * 0.15, gd - s * 0.02, s * 0.026);
      wl(g, r, c + s * 0.15, gd + s * 0.01, c + s * 0.24, gd - s * 0.02, s * 0.026);
    },
    startower: function (g, r, s) {
      var c = s / 2, gd = s * 0.74;
      wp(g, r, [[c - s * 0.10, gd], [c - s * 0.075, gd - s * 0.34], [c + s * 0.075, gd - s * 0.34], [c + s * 0.10, gd]], s * 0.045, false, false);
      wa(g, r, c, gd - s * 0.34, s * 0.085, Math.PI, 0, s * 0.04);
      var sy = gd - s * 0.56;
      wl(g, r, c, sy - s * 0.10, c, sy + s * 0.10, s * 0.03);
      wl(g, r, c - s * 0.10, sy, c + s * 0.10, sy, s * 0.03);
      wl(g, r, c - s * 0.05, sy - s * 0.05, c + s * 0.05, sy + s * 0.05, s * 0.02);
      wl(g, r, c + s * 0.05, sy - s * 0.05, c - s * 0.05, sy + s * 0.05, s * 0.02);
      wl(g, r, c - s * 0.02, gd - s * 0.10, c + s * 0.02, gd - s * 0.10, s * 0.03);
    },
    signal: function (g, r, s) {
      var c = s / 2, gd = s * 0.72;
      wa(g, r, c, gd + s * 0.16, s * 0.20, -2.6, -0.55, s * 0.04);
      wl(g, r, c, gd, c, gd - s * 0.52, s * 0.045);
      wp(g, r, [[c, gd - s * 0.52], [c + s * 0.22, gd - s * 0.455], [c, gd - s * 0.39]], s * 0.032, true, true);
      wp(g, r, [[c, gd - s * 0.34], [c - s * 0.18, gd - s * 0.29], [c, gd - s * 0.24]], s * 0.032, true, false);
    },
    keep: function (g, r, s) {
      var c = s / 2, gd = s * 0.72;
      wp(g, r, [[c - s * 0.16, gd], [c - s * 0.16, gd - s * 0.40], [c + s * 0.16, gd - s * 0.40], [c + s * 0.16, gd]], s * 0.05, false, false);
      for (var i = 0; i < 3; i++) wp(g, r, [[c - s * 0.16 + i * s * 0.12, gd - s * 0.40], [c - s * 0.16 + i * s * 0.12, gd - s * 0.47], [c - s * 0.08 + i * s * 0.12, gd - s * 0.47], [c - s * 0.08 + i * s * 0.12, gd - s * 0.40]], s * 0.032, false, false);
      wl(g, r, c, gd, c, gd - s * 0.12, s * 0.035);
      wl(g, r, c + s * 0.16, gd - s * 0.47, c + s * 0.16, gd - s * 0.58, s * 0.03);
      wp(g, r, [[c + s * 0.16, gd - s * 0.58], [c + s * 0.28, gd - s * 0.545], [c + s * 0.16, gd - s * 0.51]], s * 0.028, true, true);
    },
    dockyard: function (g, r, s) {
      var c = s / 2, gd = s * 0.62;
      wl(g, r, c - s * 0.40, gd - s * 0.06, c + s * 0.30, gd - s * 0.06, s * 0.045);
      for (var i = 0; i < 4; i++) wl(g, r, c - s * 0.32 + i * s * 0.18, gd - s * 0.06, c - s * 0.32 + i * s * 0.18, gd + s * 0.10, s * 0.038);
      wp(g, r, [[c - s * 0.26, gd + s * 0.10], [c - s * 0.18, gd + s * 0.22], [c + s * 0.16, gd + s * 0.22], [c + s * 0.26, gd + s * 0.10]], s * 0.04, false, false);
      wl(g, r, c, gd + s * 0.10, c, gd - s * 0.18, s * 0.035);
      wl(g, r, c + s * 0.28, gd + s * 0.18, c + s * 0.40, gd + s * 0.18, s * 0.025);
    },
    tollhouse: function (g, r, s) {
      var c = s / 2, gd = s * 0.70;
      var hx = c - s * 0.12, hw = s * 0.26, hh = s * 0.22;
      wp(g, r, [[hx - hw / 2, gd], [hx - hw / 2, gd - hh], [hx, gd - hh - hw * 0.45], [hx + hw / 2, gd - hh], [hx + hw / 2, gd]], s * 0.045, false, false);
      wl(g, r, hx - s * 0.02, gd, hx - s * 0.02, gd - s * 0.10, s * 0.03);
      wl(g, r, c + s * 0.06, gd, c + s * 0.06, gd - s * 0.16, s * 0.04);
      wl(g, r, c + s * 0.06, gd - s * 0.16, c + s * 0.44, gd - s * 0.26, s * 0.04);
      for (var i = 1; i < 4; i++) wl(g, r, c + s * 0.06 + i * s * 0.09, gd - s * 0.16 - i * s * 0.023, c + s * 0.06 + i * s * 0.09 + s * 0.02, gd - s * 0.20 - i * s * 0.023, s * 0.022);
    }
  };
  function tiny(g, r, s, family) {
    var c = s / 2, gd = s * 0.68;
    switch (family) {
      case 'harbor': wa(g, r, c, gd - s * 0.26, s * 0.16, 0.5, Math.PI - 0.5, s * 0.06); wl(g, r, c, gd - s * 0.46, c, gd - s * 0.18, s * 0.06); break;
      case 'lighthouse': wp(g, r, [[c - s * 0.10, gd], [c - s * 0.05, s * 0.18], [c + s * 0.05, s * 0.18], [c + s * 0.10, gd]], s * 0.06, false, false); wl(g, r, c - s * 0.14, gd, c + s * 0.14, gd, s * 0.04); break;
      case 'windmill': case 'highmill': wl(g, r, c, gd, c, gd - s * 0.30, s * 0.06); wl(g, r, c - s * 0.16, gd - s * 0.46, c + s * 0.16, gd - s * 0.14, s * 0.05); wl(g, r, c + s * 0.16, gd - s * 0.46, c - s * 0.16, gd - s * 0.14, s * 0.05); break;
      case 'cairn': wa(g, r, c, gd, s * 0.12, Math.PI, 0, s * 0.055); wa(g, r, c, gd - s * 0.12, s * 0.07, Math.PI, 0, s * 0.05); break;
      case 'stone': wp(g, r, [[c - s * 0.08, gd], [c - s * 0.07, gd - s * 0.36], [c + s * 0.07, gd - s * 0.38], [c + s * 0.08, gd]], s * 0.055, true, true); break;
      case 'forge': wp(g, r, [[c - s * 0.18, gd - s * 0.14], [c + s * 0.18, gd - s * 0.14], [c + s * 0.08, gd], [c - s * 0.08, gd]], s * 0.05, true, true); break;
      case 'signal': wl(g, r, c, gd, c, gd - s * 0.40, s * 0.055); wp(g, r, [[c, gd - s * 0.40], [c + s * 0.16, gd - s * 0.34], [c, gd - s * 0.28]], s * 0.04, true, true); break;
      default: wp(g, r, [[c - s * 0.14, gd], [c - s * 0.14, gd - s * 0.16], [c, gd - s * 0.30], [c + s * 0.14, gd - s * 0.16], [c + s * 0.14, gd]], s * 0.055, false, false);
    }
  }
  var TIER = { capital: 25, town: 18.5, village: 14, hamlet: 11 };
  var cache = new Map();
  function symbol(family, rank) {
    var key = family + '|' + rank;
    if (cache.has(key)) return cache.get(key);
    var s = TIER[rank];
    var spr = sprite(s * 1.6, s * 1.6, a3Hash(key) & 0x7fffffff, function (g, r) {
      g.translate(s * 0.3, s * 0.3);
      g.globalAlpha = rank === 'hamlet' ? 0.85 : 0.96;
      if (rank === 'hamlet') tiny(g, r, s, family);
      else (FAM[family] || FAM.harbor)(g, r, s);
    });
    cache.set(key, spr);
    return spr;
  }

  var markCode = sprite(12, 12, 771, function (g, r) {
    g.globalAlpha = 0.85;
    wl(g, r, 2.2, 9.6, 9.4, 2.6, 1.0);
    wl(g, r, 7.6, 1.6, 10.4, 4.4, 2.0);
    wl(g, r, 2.4, 2.6, 9.6, 9.6, 1.0);
    wa(g, r, 2.5, 2.3, 1.3, Math.PI * 0.6, Math.PI * 1.6, 0.9);
  });
  var markScroll = sprite(12, 12, 772, function (g, r) {
    g.globalAlpha = 0.85;
    wl(g, r, 3.4, 3.0, 3.4, 9.4, 1.0);
    wl(g, r, 8.8, 3.0, 8.8, 9.4, 1.0);
    wl(g, r, 3.4, 3.0, 8.8, 3.0, 1.0);
    wl(g, r, 3.4, 9.4, 8.8, 9.4, 1.0);
    wa(g, r, 3.4, 3.6, 1.1, Math.PI * 0.5, Math.PI * 1.5, 0.9);
    wa(g, r, 8.8, 8.8, 1.1, -Math.PI * 0.5, Math.PI * 0.5, 0.9);
    wl(g, r, 4.6, 5.2, 7.6, 5.2, 0.7);
    wl(g, r, 4.6, 7.0, 7.6, 7.0, 0.7);
  });
  function smokeSprite(st) {
    return sprite(16, 22, 773 + st, function (g) {
      g.globalAlpha = 0.42 + st * 0.12;
      g.lineWidth = 0.9 + st * 0.25;
      g.beginPath();
      g.moveTo(8, 20);
      g.bezierCurveTo(5, 15, 11, 13, 8, 9);
      g.bezierCurveTo(5.6, 6, 10.4, 5, 9, 2);
      g.stroke();
      if (st >= 2) { g.beginPath(); g.moveTo(11, 18); g.bezierCurveTo(9, 15, 13, 13, 11.4, 10); g.stroke(); }
    });
  }
  var smokes = [smokeSprite(0), smokeSprite(1), smokeSprite(2)];

  return { symbol: symbol, TIER: TIER, markCode: markCode, markScroll: markScroll,
    smokes: smokes, wl: wl, wa: wa, wp: wp };
})();

/* ---------------- the distance to the nearest coast, gridded once ---------------- */
function a3BuildDist() {
  var CELL = 6, GW = Math.ceil(1400 / CELL) + 1, GH = Math.ceil(810 / CELL) + 1;
  var F = new Float32Array(GW * GH);
  F.fill(1e9);
  var cs = 48, grid = new Map(), i, o;
  for (i = 0; i < A3.islands.length; i++) {
    o = A3.islands[i].a3;
    for (var gx = ((o.x - o.r - cs) / cs) | 0; gx <= ((o.x + o.r + cs) / cs) | 0; gx++) {
      for (var gy = ((o.y - o.r - cs) / cs) | 0; gy <= ((o.y + o.r + cs) / cs) | 0; gy++) {
        var k = gx * 4096 + gy;
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push(o);
      }
    }
  }
  for (var j = 0; j < GH; j++) {
    var y = j * CELL;
    for (var ii = 0; ii < GW; ii++) {
      var x = ii * CELL, best = 1e9;
      var cell = grid.get((((x / cs) | 0) * 4096) + ((y / cs) | 0));
      if (cell) {
        for (var c = 0; c < cell.length; c++) {
          var d = Math.hypot(cell[c].x - x, cell[c].y - y) - cell[c].r;
          if (d < best) best = d;
        }
      } else best = cs;
      F[j * GW + ii] = best;
    }
  }
  A3.dist = { CELL: CELL, GW: GW, GH: GH, F: F };
}
function a3DistAt(x, y) {
  var D = A3.dist;
  if (!D) return a3NearestCoast(x, y);
  var fx = clamp(x / D.CELL, 0, D.GW - 1.001), fy = clamp(y / D.CELL, 0, D.GH - 1.001);
  var i0 = fx | 0, j0 = fy | 0, tx = fx - i0, ty = fy - j0;
  var a = j0 * D.GW + i0, b = a + D.GW;
  return (D.F[a] * (1 - tx) + D.F[a + 1] * tx) * (1 - ty) + (D.F[b] * (1 - tx) + D.F[b + 1] * tx) * ty;
}

/* ---------------- the terrain, drawn by the hand and not by a stamp ---------------- */
function a3TerrMountain(g, it, lw, tall) {
  var w = it.w, r = mulberry32((500 + it.v * 7 + Math.round(it.x)) >>> 0);
  var nP = 1 + (it.v % 3);
  var centers = nP === 1 ? [0.5] : nP === 2 ? [-0.16, 0.18] : [-0.26, 0.02, 0.28];
  g.lineWidth = Math.max(lw * 0.85, 0.35);
  for (var i = 0; i < nP; i++) {
    var cx = it.x + w * (centers[i] + (r() - 0.5) * 0.05);
    var hw = w * (0.24 + r() * 0.10) * (nP === 1 ? 1.6 : 1);
    var hh = w * (0.30 + r() * 0.16) * (i === Math.floor(nP / 2) ? 1.25 : 1) * (tall ? 1.65 : 1);
    var base = it.y + (i % 2) * w * 0.02;
    var apx = cx + (r() - 0.5) * w * 0.04, apy = base - hh;
    g.beginPath();
    g.moveTo(cx - hw, base);
    g.quadraticCurveTo(cx - hw * 0.4, base - hh * 0.62, apx, apy);
    g.quadraticCurveTo(cx + hw * 0.45, base - hh * 0.55, cx + hw, base);
    g.stroke();
    g.lineWidth = Math.max(lw * 0.5, 0.28);
    g.beginPath();
    for (var k = 1; k <= 4; k++) {
      var t = k / 5;
      var tx = apx + (cx + hw - apx) * t * 0.55;
      var ty = apy + (base - apy) * t * 0.5;
      g.moveTo(tx, ty);
      g.lineTo(tx + hw * 0.22, Math.min(base - 0.4, ty + hh * 0.32));
    }
    g.stroke();
    g.lineWidth = Math.max(lw * 0.85, 0.35);
  }
}
function a3TerrTree(g, it, lw) {
  var w = it.w, r = mulberry32((510 + it.v * 11 + Math.round(it.x * 3)) >>> 0);
  var two = it.v % 2 === 0;
  var trees = two ? [[-w * 0.22, 1], [w * 0.28, 0.72]] : [[0, 1]];
  for (var t = 0; t < trees.length; t++) {
    var c = it.x + trees[t][0], k = trees[t][1], gd = it.y;
    g.lineWidth = Math.max(lw * 0.7, 0.3);
    g.beginPath(); g.moveTo(c, gd); g.lineTo(c, gd - w * 0.34 * k); g.stroke();
    var cy = gd - w * 0.60 * k, cr = w * 0.30 * k;
    g.lineWidth = Math.max(lw * 0.62, 0.3);
    g.beginPath();
    for (var i = 0; i <= 7; i++) {
      var a = -Math.PI * 0.5 + i / 7 * TAU;
      var rr = cr * (1 + (r() - 0.5) * 0.22);
      var x = c + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.9;
      if (i === 0) g.moveTo(x, y);
      else g.quadraticCurveTo(c + Math.cos(a - 0.4) * rr * 1.22, cy + Math.sin(a - 0.4) * rr * 1.14, x, y);
    }
    g.closePath(); g.stroke();
  }
}
function a3TerrPine(g, it, lw) {
  var w = it.w * 1.05, c = it.x, gd = it.y;
  g.lineWidth = Math.max(lw * 0.7, 0.3);
  g.beginPath(); g.moveTo(c, gd); g.lineTo(c, gd - w * 0.22); g.stroke();
  g.lineWidth = Math.max(lw * 0.62, 0.3);
  for (var i = 0; i < 3; i++) {
    var y = gd - w * 0.22 - i * w * 0.28, hw = w * (0.44 - i * 0.11);
    g.beginPath();
    g.moveTo(c - hw, y); g.lineTo(c, y - w * 0.36); g.lineTo(c + hw, y);
    g.stroke();
  }
}
function a3TerrHill(g, it, lw) {
  var w = it.w;
  g.lineWidth = Math.max(lw * 0.6, 0.3);
  g.beginPath(); g.arc(it.x, it.y + w * 0.30, w * 0.52, -2.55, -0.59); g.stroke();
  g.lineWidth = Math.max(lw * 0.42, 0.25);
  g.beginPath();
  g.moveTo(it.x + w * 0.10, it.y - w * 0.10); g.lineTo(it.x + w * 0.18, it.y - w * 0.02);
  g.moveTo(it.x + w * 0.16, it.y - w * 0.13); g.lineTo(it.x + w * 0.26, it.y - w * 0.03);
  g.stroke();
}
function a3DrawTerrain(g, o, lw, alpha) {
  g.save();
  g.globalAlpha = alpha;
  g.strokeStyle = A3_INK + '0.86)';
  for (var i = 0; i < o.terr.length; i++) {
    var it = o.terr[i];
    if (it.type === 'mountain') a3TerrMountain(g, it, lw, false);
    else if (it.type === 'tallMountain') a3TerrMountain(g, it, lw, true);
    else if (it.type === 'tree') a3TerrTree(g, it, lw);
    else if (it.type === 'pine') a3TerrPine(g, it, lw);
    else if (it.type === 'hill') { g.strokeStyle = A3_INK + '0.62)'; a3TerrHill(g, it, lw); g.strokeStyle = A3_INK + '0.86)'; }
  }
  g.restore();
}
function a3DrawRockMark(g, rk, lw) {
  var w = rk.kind === 'rock' ? 9 : 13, r = mulberry32(rk.seed >>> 0);
  g.lineWidth = Math.max(lw * 0.6, 0.3);
  if (rk.kind === 'rock') {
    g.beginPath();
    g.moveTo(rk.x - w * 0.36, rk.y + w * 0.16);
    g.lineTo(rk.x - w * 0.20, rk.y - w * 0.14);
    g.lineTo(rk.x + w * 0.02, rk.y + w * 0.04);
    g.lineTo(rk.x + w * 0.18, rk.y - w * 0.18);
    g.lineTo(rk.x + w * 0.38, rk.y + w * 0.16);
    g.stroke();
  } else {
    for (var i = 0; i < 3; i++) {
      var rr = w * (0.16 - i * 0.035);
      g.beginPath();
      g.arc(rk.x - w * 0.2 + i * w * 0.28, rk.y + (r() - 0.5) * 1.2, rr, Math.PI, Math.PI * 1.74);
      g.stroke();
    }
  }
}
function a3DrawStoneRing(g, x, y, w, lw) {
  var r = mulberry32(555);
  g.lineWidth = Math.max(lw * 0.55, 0.3);
  for (var i = 0; i < 7; i++) {
    var a = (i / 7) * TAU + 0.4;
    var px = x + Math.cos(a) * w * 0.34, py = y + Math.sin(a) * w * 0.17;
    var hh = w * (0.09 + r() * 0.04);
    g.beginPath();
    g.moveTo(px - w * 0.025, py); g.lineTo(px - w * 0.02, py - hh);
    g.lineTo(px + w * 0.02, py - hh); g.lineTo(px + w * 0.025, py);
    g.stroke();
  }
}

/* ---------------- the flourishes, clearly decor beside the real places ---------------- */
function a3Serpent(g, x, y, len, lw) {
  g.save();
  g.strokeStyle = A3_INK + '0.82)';
  g.lineWidth = lw;
  var n = 60, spine = [], i;
  for (i = 0; i <= n; i++) {
    var t = i / n;
    spine.push([x + t * len, y + Math.sin(t * Math.PI * 2.6 + 0.4) * 9 * (1 - t * 0.25), 3.4 * (1 - t) + 0.7]);
  }
  for (var side = -1; side <= 1; side += 2) {
    g.beginPath();
    for (i = 0; i <= n; i++) {
      var s = spine[i], p = spine[Math.max(0, i - 1)];
      var dx = s[0] - p[0], dy = s[1] - p[1], dl = Math.hypot(dx, dy) || 1;
      var ox = (-dy / dl) * s[2] * side, oy = (dx / dl) * s[2] * side;
      if (i === 0) g.moveTo(s[0] + ox, s[1] + oy); else g.lineTo(s[0] + ox, s[1] + oy);
    }
    g.stroke();
  }
  g.strokeStyle = A3_INK2 + '0.55)';
  g.lineWidth = lw * 0.5;
  g.beginPath();
  for (i = 4; i < n - 2; i += 3) { var q = spine[i]; g.moveTo(q[0], q[1] + q[2] * 0.9); g.lineTo(q[0] - 1.6, q[1] - q[2] * 0.9); }
  g.stroke();
  g.strokeStyle = A3_INK + '0.82)';
  g.lineWidth = lw * 0.8;
  g.beginPath();
  for (i = 8; i < n - 6; i += 8) { var w2 = spine[i]; g.moveTo(w2[0], w2[1] - w2[2]); g.quadraticCurveTo(w2[0] - 3, w2[1] - w2[2] - 5, w2[0] - 6, w2[1] - w2[2] - 2); }
  g.stroke();
  var hx = x, hy = spine[0][1];
  g.lineWidth = lw;
  g.beginPath();
  g.moveTo(hx, hy - 3);
  g.quadraticCurveTo(hx - 9, hy - 6.5, hx - 13, hy - 2.5);
  g.lineTo(hx - 19, hy + 1.5);
  g.moveTo(hx - 13, hy - 2.5); g.lineTo(hx - 18, hy - 5);
  g.moveTo(hx, hy + 3); g.quadraticCurveTo(hx - 8, hy + 5, hx - 13, hy + 2.5);
  g.moveTo(hx - 19, hy - 0.5); g.lineTo(hx - 25, hy - 1.5);
  g.moveTo(hx - 25, hy - 1.5); g.lineTo(hx - 27, hy - 3.5);
  g.moveTo(hx - 25, hy - 1.5); g.lineTo(hx - 28, hy - 0.5);
  g.stroke();
  g.fillStyle = A3_INK + '0.9)';
  g.beginPath(); g.arc(hx - 9, hy - 3.4, lw, 0, TAU); g.fill();
  var te = spine[n];
  g.beginPath();
  g.moveTo(te[0], te[1]);
  g.quadraticCurveTo(te[0] + 9, te[1] - 4, te[0] + 8, te[1] - 10);
  g.quadraticCurveTo(te[0] + 6.5, te[1] - 14.5, te[0] + 3, te[1] - 13);
  g.moveTo(te[0] + 3, te[1] - 13); g.lineTo(te[0] - 1, te[1] - 16.5);
  g.moveTo(te[0] + 3, te[1] - 13); g.lineTo(te[0] + 5.5, te[1] - 17);
  g.stroke();
  g.restore();
}
function a3Whale(g, x, y, lw) {
  g.save();
  g.translate(x, y);
  g.strokeStyle = A3_INK + '0.82)';
  g.lineWidth = lw;
  g.beginPath();
  g.moveTo(-26, 4);
  g.quadraticCurveTo(-18, -9, 2, -8);
  g.quadraticCurveTo(20, -7, 26, 2);
  g.quadraticCurveTo(14, 8, -6, 7);
  g.quadraticCurveTo(-20, 7, -26, 4);
  g.closePath(); g.stroke();
  g.beginPath();
  g.moveTo(26, 2); g.quadraticCurveTo(33, -1, 34, -8);
  g.moveTo(34, -8); g.quadraticCurveTo(35, -2, 40, 0);
  g.stroke();
  g.strokeStyle = A3_INK2 + '0.6)';
  g.lineWidth = lw * 0.55;
  g.beginPath();
  for (var i = 0; i < 4; i++) { g.moveTo(-22 + i * 3, 5 - i * 2.4); g.lineTo(-15 + i * 3, 6 - i * 2.4); }
  g.stroke();
  g.strokeStyle = A3_INK + '0.82)';
  g.lineWidth = lw;
  g.beginPath();
  g.moveTo(-14, -8); g.quadraticCurveTo(-15, -13, -13, -16);
  g.moveTo(-14, -8); g.quadraticCurveTo(-12, -13, -10, -15);
  g.stroke();
  g.fillStyle = A3_INK + '0.9)';
  g.beginPath(); g.arc(-18, -2, lw * 0.9, 0, TAU); g.fill();
  g.restore();
}
function a3Galleon(g, x, y, sc, rot, lw) {
  g.save();
  g.translate(x, y);
  if (rot) g.rotate(rot);
  g.scale(sc, sc);
  g.strokeStyle = A3_INK + '0.86)';
  g.lineWidth = lw / sc;
  g.beginPath();
  g.moveTo(-46, 0);
  g.quadraticCurveTo(-40, 14, -20, 16);
  g.lineTo(30, 16);
  g.quadraticCurveTo(50, 13, 54, -4);
  g.lineTo(44, -2); g.lineTo(-38, -2);
  g.closePath(); g.stroke();
  g.beginPath();
  g.moveTo(44, -2); g.lineTo(46, -12); g.lineTo(30, -12); g.lineTo(28, -2);
  g.stroke();
  g.strokeStyle = A3_INK2 + '0.6)';
  g.lineWidth = lw * 0.55 / sc;
  g.beginPath();
  for (var i = -4; i < 5; i++) { g.moveTo(i * 8 - 4, 14); g.lineTo(i * 8, 0); }
  g.stroke();
  g.strokeStyle = A3_INK + '0.86)';
  g.lineWidth = lw / sc;
  var masts = [[-24, -2, 34, 15], [4, -2, 44, 19], [30, -12, 26, 11]];
  for (var m = 0; m < masts.length; m++) {
    var mx = masts[m][0], my = masts[m][1], mh = masts[m][2], sw = masts[m][3];
    g.beginPath(); g.moveTo(mx, my); g.lineTo(mx, my - mh); g.stroke();
    g.beginPath();
    g.moveTo(mx - 2, my - mh + 3);
    g.quadraticCurveTo(mx - sw, my - mh / 2 + 1, mx - 2, my - 5);
    g.moveTo(mx - 2, my - mh + 3);
    g.lineTo(mx + 2, my - mh + 3);
    g.quadraticCurveTo(mx - sw + 5, my - mh / 2 + 1, mx + 2, my - 5);
    g.lineTo(mx - 2, my - 5);
    g.stroke();
    g.beginPath();
    g.moveTo(mx, my - mh); g.lineTo(mx - 8, my - mh - 3); g.lineTo(mx, my - mh - 5);
    g.stroke();
  }
  g.beginPath(); g.moveTo(-44, -1); g.lineTo(-60, -10); g.stroke();
  g.restore();
}

/* ============================================================
   THE SURVEY, DERIVED ONCE
   ============================================================ */
function buildChartGeo() {
  if (chart.geo) return chart.geo;
  var t0 = performance.now();
  chartFit();
  a3Build();
  a3BuildWarp();
  var i, I;
  for (i = 0; i < A3.islands.length; i++) {
    I = A3.islands[i];
    I.cx = I.a3.x; I.cy = I.a3.y;
  }
  var geo = {
    isles: A3.islands, places: A3.islands, rings: [], beasts: [], rocks: [],
    regions: [], conts: [], lands: [], lanes: [], decor: [], t: 0
  };

  /* the crossings to the other worlds keep their marks, where a sailor would
     see them: the strange isle at the chart edge, the lamplit coast beyond the
     last surveyed water, the flotsam where the bottle rides. (2026-09-07: the
     stain of darker water is off this sheet with the crossing it carried.) */
  if (typeof eggs !== 'undefined' && eggs.ready) {
    var p;
    if (eggs.city) {
      p = chartProject(eggs.city.x, eggs.city.y);
      geo.decor.push({ kind: 'eggisle', x: clamp(p[0], 34, CHART_W - 34), y: clamp(p[1], 34, CHART_H - 34), r: 20 });
    }
    if (eggs.shore) {
      p = chartProject(eggs.shore.x, eggs.shore.y);
      geo.decor.push({ kind: 'lampcoast', x: clamp(p[0], 70, CHART_W - 70), y: clamp(p[1], 54, CHART_H - 54), r: 26 });
    }
    if (eggs.bottle) {
      p = chartProject(eggs.bottle.x, eggs.bottle.y);
      geo.decor.push({ kind: 'flotsam', x: p[0], y: p[1], r: 16 });
    }
  }
  /* the flourishes: clearly decor, and still ground no tab may sit on */
  var farFrom = function (x, y, d) {
    for (var q = 0; q < geo.decor.length; q++) {
      if (Math.hypot(geo.decor[q].x - x, geo.decor[q].y - y) < d) return false;
    }
    return a3DistAt(x, y) > 34;
  };
  geo.decor.push({ kind: 'serpent', x: 258, y: 48, r: 78, len: 128 });
  geo.decor.push({ kind: 'whale', x: 176, y: 764, r: 46 });
  var spout = null, tail = null, sx2, sy2;
  for (sx2 = 900; sx2 <= 1300 && !spout; sx2 += 30) for (sy2 = 120; sy2 <= 300; sy2 += 30) {
    if (farFrom(sx2, sy2, 150)) { spout = [sx2, sy2]; break; }
  }
  if (spout) geo.decor.push({ kind: 'spout', x: spout[0], y: spout[1], r: 22 });
  for (sx2 = 330; sx2 <= 620 && !tail; sx2 += 30) for (sy2 = 640; sy2 <= 760; sy2 += 30) {
    if (farFrom(sx2, sy2, 160)) { tail = [sx2, sy2]; break; }
  }
  if (tail) geo.decor.push({ kind: 'tail', x: tail[0], y: tail[1], r: 22 });
  A3.decor = geo.decor;

  /* what the pointer can take hold of: every one of the 288 */
  chart.marks.length = 0;
  for (i = 0; i < A3.islands.length; i++) {
    I = A3.islands[i];
    chart.marks.push({ isle: I, x: I.cx, y: I.cy, r: Math.max(6.5, I.a3.r * 1.5) });
  }

  geo.stats = {
    islands: A3.islands.length, groups: A3.groups.length,
    chain: A3.census.chains.chain, crescent: A3.census.chains.crescent,
    edges: A3.census.edges, crossEdges: A3.census.crossEdges,
    ranks: A3.census.ranks, marks: A3.census.marks,
    unreached: A3.census.unreached, buildMs: A3.buildMs
  };
  geo.t = performance.now() - t0;
  chart.geo = geo;
  diag.a3 = { census: A3.census, rung: a3Rung(), rungName: A3_RUNG_NAMES[a3Rung() - 1],
    rungs: A3_RUNGS, buildMs: A3.buildMs, geoMs: +geo.t.toFixed(1) };
  return geo;
}

/* no banderoles: the deep of this chart carries flourishes, not pages */
function measureBands() {}

/* ============================================================
   THE SHEET, PAINTED: detail strictly by rung
   ============================================================ */
function paintSheetGeo(g, geo, vp, base) {
  var Zs = base ? 1 : chart.z;
  var LW = 1 / Zs;
  var f = base ? 1 : a3RungF();
  var i, k, o, I, p;
  var inVp = function (x, y, m) { return x > vp.x0 - m && x < vp.x1 + m && y > vp.y0 - m && y < vp.y1 + m; };

  var aProv = a3Ramp(f, 1.5, 1.95);
  var aRed = a3Ramp(f, 1.55, 2.0);
  var aEng = 1 - a3Ramp(f, 3.05, 3.75);
  var aTolk = a3Ramp(f, 3.05, 3.75);
  var aSym3 = a3Ramp(f, 2.5, 2.95);
  var aSymAll = a3Ramp(f, 3.5, 3.95);
  var aSpineTer = a3Ramp(f, 2.5, 2.95);
  var aWays4 = a3Ramp(f, 3.55, 3.95);
  var aFire = a3Ramp(f, 4.5, 4.95);

  var vell = tornSheetPath(g);
  g.save();
  g.translate(4, 6);
  g.fillStyle = 'rgba(72,56,34,0.20)';
  g.beginPath(); pathThrough(g, vell, true); g.fill();
  g.restore();

  g.save();
  g.beginPath(); pathThrough(g, vell, true); g.clip();

  /* --- the vellum --- */
  g.fillStyle = A3_PAPER;
  g.fillRect(0, 0, CHART_W, CHART_H);
  if (bake.paper) { g.globalAlpha = 0.78; g.drawImage(bake.paper, 0, 0, CHART_W, CHART_H); g.globalAlpha = 1; }
  var vr = rngFor('age');
  for (i = 0; i < 34; i++) {
    var ax = vr() * CHART_W, ay = vr() * CHART_H, ar = 40 + vr() * 200;
    var gr = g.createRadialGradient(ax, ay, 0, ax, ay, ar);
    gr.addColorStop(0, 'rgba(168,140,90,0.055)');
    gr.addColorStop(1, 'rgba(168,140,90,0)');
    g.fillStyle = gr; g.fillRect(ax - ar, ay - ar, ar * 2, ar * 2);
  }

  /* --- the rhumb network, radiating from the rose --- */
  var RH = 34;
  for (i = 0; i < RH; i++) {
    var a = i * TAU / RH - Math.PI / 2;
    var cls = i % 4 === 0 ? 0 : (i % 4 === 2 ? 1 : 2);
    g.strokeStyle = cls === 0 ? A3_INK + '0.12)' : cls === 1 ? GRN + '0.10)' : RED + '0.09)';
    g.lineWidth = (cls === 0 ? 0.7 : 0.5) * LW;
    g.beginPath();
    g.moveTo(ROSE.x, ROSE.y);
    g.lineTo(ROSE.x + Math.cos(a) * 2100, ROSE.y + Math.sin(a) * 2100);
    g.stroke();
  }
  g.strokeStyle = A3_INK + '0.09)'; g.lineWidth = 0.6 * LW;
  for (k = 0; k < 2; k++) { g.beginPath(); g.arc(ROSE.x, ROSE.y, k ? 470 : 230, 0, TAU); g.stroke(); }

  /* --- the sea: stipple and wave hatching, thicker close inshore --- */
  var inFurn = function (x, y) {
    for (var q = 0; q < FURN.length; q++) {
      var R = FURN[q];
      if (x > R.x - 8 && x < R.x + R.w + 8 && y > R.y - 8 && y < R.y + R.h + 8) return true;
    }
    return false;
  };
  var seaA = 0.30 + 0.70 * aEng;
  var sr = rngFor('stipple');
  g.fillStyle = A3_INK + (0.20 * seaA).toFixed(3) + ')';
  for (var sy = 20; sy < CHART_H - 18; sy += 7.5) {
    for (var sx = 20; sx < CHART_W - 18; sx += 7.5) {
      var px = sx + (sr() - 0.5) * 6, py = sy + (sr() - 0.5) * 6;
      var gate = sr();
      var d0 = a3DistAt(px, py);
      if (d0 < 5) continue;
      if (gate > 0.20 + 0.52 * clamp(1 - d0 / 90, 0, 1)) continue;
      if (base && inFurn(px, py)) continue;
      if (!inVp(px, py, 4)) continue;
      g.fillRect(px, py, 0.85 * LW, 0.85 * LW);
    }
  }
  if (aEng > 0.02) {
    var swellN = makeNoise('swell', 230);
    var wr = rngFor('waves');
    g.strokeStyle = A3_INK + (0.26 * aEng).toFixed(3) + ')';
    g.lineWidth = 0.5 * LW;
    g.beginPath();
    for (var wy = 24; wy < CHART_H - 20; wy += 19) {
      for (var wx = 24; wx < CHART_W - 20; wx += 25) {
        var qx = wx + (wr() - 0.5) * 19, qy = wy + (wr() - 0.5) * 15;
        var g1 = wr(), g2 = wr();
        var l = 4.5 + wr() * 6.5;
        var h1 = 1.7 + wr() * 0.7, h2 = 1.7 + wr() * 0.7;
        var dd = a3DistAt(qx, qy);
        if (dd < 12 || g1 < 0.34) continue;
        if (base && inFurn(qx, qy)) continue;
        if (!inVp(qx, qy, 18)) continue;
        var an = swellN(qx, qy) * 0.42;
        var ca = Math.cos(an), sa = Math.sin(an);
        var rows = dd < 60 || g2 < 0.42 ? 2 : 1;
        for (var rw = 0; rw < rows; rw++) {
          var oy = (rw - (rows - 1) / 2) * 3.4;
          var bx = qx + (-sa * oy), by = qy + ca * oy;
          var hh = rw === 0 ? h1 : h2;
          g.moveTo(bx - ca * l, by - sa * l);
          g.quadraticCurveTo(bx - ca * l * 0.5 + sa * hh, by - sa * l * 0.5 - ca * hh, bx, by);
          g.quadraticCurveTo(bx + ca * l * 0.5 - sa * hh, by + sa * l * 0.5 + ca * hh, bx + ca * l, by + sa * l);
        }
      }
    }
    g.stroke();
  }

  /* --- the group waters: muted washes and dotted sea limits (rung II) --- */
  var aSeaWash = aProv * (1 - a3Ramp(f, 2.95, 3.8));
  if (aSeaWash > 0.02) {
    var dim = f > 2.75 ? 0.66 : 1;
    for (i = 0; i < A3.groups.length; i++) {
      var G = A3.groups[i];
      g.fillStyle = 'rgba(' + A3_WASHES[G.wash] + ',' + (0.11 * aSeaWash * dim).toFixed(3) + ')';
      g.beginPath();
      g.moveTo(G.washPoly[0][0], G.washPoly[0][1]);
      for (k = 1; k < G.washPoly.length; k++) g.lineTo(G.washPoly[k][0], G.washPoly[k][1]);
      g.closePath(); g.fill();
      g.strokeStyle = A3_INK2 + (0.55 * aSeaWash * dim).toFixed(3) + ')';
      g.lineWidth = 0.7 * LW;
      g.setLineDash([1.4 * LW, 3.8 * LW]);
      g.beginPath();
      g.moveTo(G.limit[0][0], G.limit[0][1]);
      for (k = 1; k < G.limit.length; k++) g.lineTo(G.limit[k][0], G.limit[k][1]);
      g.closePath(); g.stroke();
      g.setLineDash([]);
    }
  }

  /* --- the sailing lanes of the citation graph (the Fireside) --- */
  if (aFire > 0.02) {
    g.strokeStyle = A3_INK2 + (0.34 * aFire).toFixed(3) + ')';
    g.lineWidth = 0.6 * LW;
    g.setLineDash([1.4 * LW, 3.6 * LW]);
    for (i = 0; i < A3.lanes.length; i++) {
      var La = A3.lanes[i][0].a3, Lb = A3.lanes[i][1].a3;
      if (!inVp(La.x, La.y, 300) && !inVp(Lb.x, Lb.y, 300)) continue;
      var mx2 = (La.x + Lb.x) / 2, my2 = (La.y + Lb.y) / 2;
      var dx2 = Lb.x - La.x, dy2 = Lb.y - La.y, dl2 = Math.hypot(dx2, dy2) || 1;
      g.beginPath();
      g.moveTo(La.x, La.y);
      g.quadraticCurveTo(mx2 - dy2 / dl2 * dl2 * 0.08, my2 + dx2 / dl2 * dl2 * 0.08, Lb.x, Lb.y);
      g.stroke();
    }
    g.setLineDash([]);
  }
  /* --- the ways within a group (the Soundings) --- */
  if (aWays4 > 0.02) {
    g.strokeStyle = A3_INK + (0.5 * aWays4).toFixed(3) + ')';
    g.lineWidth = 0.75 * LW;
    g.setLineDash([3.4 * LW, 2.8 * LW]);
    for (i = 0; i < A3.intraWays.length; i++) {
      var Wa = A3.intraWays[i][0].a3, Wb = A3.intraWays[i][1].a3;
      if (!inVp(Wa.x, Wa.y, 200) && !inVp(Wb.x, Wb.y, 200)) continue;
      var mx3 = (Wa.x + Wb.x) / 2, my3 = (Wa.y + Wb.y) / 2;
      var dx3 = Wb.x - Wa.x, dy3 = Wb.y - Wa.y, dl3 = Math.hypot(dx3, dy3) || 1;
      g.beginPath();
      g.moveTo(Wa.x, Wa.y);
      g.quadraticCurveTo(mx3 - dy3 / dl3 * dl3 * 0.1, my3 + dx3 / dl3 * dl3 * 0.1, Wb.x, Wb.y);
      g.stroke();
    }
    g.setLineDash([]);
  }

  /* --- the two red ways --- */
  if (aRed > 0.02 && A3.ferry) {
    g.strokeStyle = RED + (0.72 * aRed).toFixed(3) + ')';
    g.lineWidth = 0.95 * LW;
    g.setLineDash([4.8 * LW, 3.2 * LW]);
    for (i = 0; i < A3.ferryStrands.length; i++) {
      var st = A3.ferryStrands[i];
      g.beginPath(); g.moveTo(st[0][0], st[0][1]);
      for (k = 1; k < st.length; k++) g.lineTo(st[k][0], st[k][1]);
      g.stroke();
    }
    g.setLineDash([]);
    if (A3.trail.length) {
      g.strokeStyle = RED + (0.82 * aRed).toFixed(3) + ')';
      g.lineWidth = 1.4 * LW;
      g.setLineDash([3.8 * LW, 3 * LW]);
      g.beginPath(); g.moveTo(A3.trail[0][0], A3.trail[0][1]);
      for (k = 1; k < A3.trail.length; k++) g.lineTo(A3.trail[k][0], A3.trail[k][1]);
      g.stroke();
      g.setLineDash([]);
    }
  }

  /* --- the coast stipple: the engraver's water --- */
  if (aEng > 0.02) {
    g.fillStyle = A3_INK2 + (0.5 * aEng).toFixed(3) + ')';
    var dsz = 1.3 * LW;
    for (i = 0; i < A3.stipple.length; i++) {
      var sp2 = A3.stipple[i];
      if (!inVp(sp2[0], sp2[1], 10)) continue;
      g.globalAlpha = sp2[2];
      g.fillRect(sp2[0], sp2[1], dsz, dsz);
    }
    g.globalAlpha = 1;
  }

  /* ---------------- the 288 true islands ---------------- */
  var spineBump = 1 + 0.30 * (1 - a3Ramp(f, 1.05, 1.9));
  for (i = 0; i < A3.islands.length; i++) {
    I = A3.islands[i]; o = I.a3;
    if (!inVp(o.x, o.y, o.r + 60)) continue;
    var bump = o.spineIsle ? spineBump : 1;
    g.save();
    if (bump !== 1) { g.translate(o.x, o.y); g.scale(bump, bump); g.translate(-o.x, -o.y); }
    var wash = 'rgba(' + A3_WASHES[o.group.wash] + ',0.12)';
    if (aEng > 0.02) {
      g.globalAlpha = aEng;
      if (o.r * Zs > 4) {
        g.strokeStyle = A3_INK2 + '0.9)';
        g.lineWidth = 0.5 * LW;
        g.globalAlpha = aEng * 0.40; g.stroke(o.ringsEng[0]);
        g.globalAlpha = aEng * 0.22; g.stroke(o.ringsEng[1]);
      }
      g.globalAlpha = aEng;
      g.fillStyle = A3_LAND; g.fill(o.pathEng);
      g.fillStyle = wash; g.fill(o.washPath);
      g.strokeStyle = A3_INK + '0.94)';
      g.lineWidth = (o.spineIsle ? 1.7 : 1.35) * LW;
      g.stroke(o.pathEng);
    }
    if (aTolk > 0.02) {
      g.globalAlpha = aTolk * 0.55;
      g.strokeStyle = A3_INK2 + '0.9)';
      g.lineWidth = 0.6 * LW;
      g.stroke(o.ringTolk);
      g.globalAlpha = aTolk;
      g.fillStyle = A3_LAND; g.fill(o.pathTolk);
      g.fillStyle = wash; g.fill(o.pathTolk);
      g.strokeStyle = A3_INK + '0.94)';
      g.lineWidth = 1.5 * LW;
      g.lineJoin = 'round';
      g.stroke(o.pathTolk);
    }
    /* the terrain in the storyteller's hand, clipped to the coast */
    var terA = o.spineIsle ? Math.max(aTolk, aSpineTer * 0.85) : aTolk;
    if (terA > 0.03 && o.terr.length) {
      g.save();
      g.clip(aTolk > 0.02 ? o.pathTolk : o.pathEng);
      a3DrawTerrain(g, o, LW, terA);
      g.restore();
    }
    /* the river, running from the heights to the coast */
    if (aTolk > 0.02 && o.river) {
      var rv = o.river;
      g.save();
      g.clip(o.pathTolk);
      g.strokeStyle = rv.mig ? RED + '0.78)' : A3_INK + '0.70)';
      g.globalAlpha = aTolk;
      var n = rv.pts.length;
      var grow = Math.min(1, Zs / 3.2);
      var wAt = function (ix) { return lerp(0.7, rv.wide ? 4.0 : 2.6, Math.pow(ix / (n - 1), 0.75)) * grow; };
      if (wAt(n - 1) >= 2.4) {
        var left = [], right = [];
        for (k = 0; k < n; k++) {
          var pa = rv.pts[Math.max(0, k - 1)], pb = rv.pts[Math.min(n - 1, k + 1)];
          var nx = -(pb[1] - pa[1]), ny = pb[0] - pa[0];
          var nl = Math.hypot(nx, ny) || 1, hw2 = wAt(k) / 2 * LW;
          nx = nx / nl * hw2; ny = ny / nl * hw2;
          left.push([rv.pts[k][0] + nx, rv.pts[k][1] + ny]);
          right.push([rv.pts[k][0] - nx, rv.pts[k][1] - ny]);
        }
        g.lineWidth = 0.85 * LW;
        for (var bnk = 0; bnk < 2; bnk++) {
          var bank = bnk ? right : left;
          g.beginPath(); g.moveTo(bank[0][0], bank[0][1]);
          for (k = 1; k < bank.length; k++) g.lineTo(bank[k][0], bank[k][1]);
          g.stroke();
        }
      } else {
        for (k = 1; k < n; k++) {
          g.lineWidth = wAt(k) * 0.62 * LW;
          g.beginPath(); g.moveTo(rv.pts[k - 1][0], rv.pts[k - 1][1]); g.lineTo(rv.pts[k][0], rv.pts[k][1]);
          g.stroke();
        }
      }
      g.restore();
      /* marsh ticks at the mouth, in the shallows */
      var cA = Math.cos(rv.dirA), sA = Math.sin(rv.dirA);
      g.lineWidth = 0.6 * LW;
      g.globalAlpha = aTolk * 0.55;
      g.strokeStyle = A3_INK2 + '0.9)';
      for (k = -1; k <= 1; k++) {
        var bx2 = rv.mouth[0] + cA * 2.2 + -sA * k * 2.4;
        var by2 = rv.mouth[1] + sA * 2.2 + cA * k * 2.4;
        g.beginPath(); g.moveTo(bx2 - 1.3, by2); g.lineTo(bx2 + 1.3, by2); g.stroke();
      }
    }
    g.globalAlpha = 1;
    g.restore();
  }

  /* --- the storyteller's swell, and the decor of the open water --- */
  if (aTolk > 0.02) {
    g.strokeStyle = A3_INK2 + (0.36 * aTolk).toFixed(3) + ')';
    g.lineWidth = 0.62 * LW;
    g.lineCap = 'round';
    g.beginPath();
    for (i = 0; i < A3.swell.length; i++) {
      var sw2 = A3.swell[i];
      if (!inVp(sw2.x, sw2.y, 14)) continue;
      var cs2 = Math.cos(sw2.a), ss2 = Math.sin(sw2.a);
      for (k = 0; k < 2; k++) {
        var oy2 = k ? 3.0 : 0, ox2 = k ? sw2.w * 0.26 : 0, ww = sw2.w * (k ? 0.72 : 1);
        var x02 = sw2.x + ox2, y02 = sw2.y + oy2;
        g.moveTo(x02 - cs2 * ww / 2, y02 - ss2 * ww / 2);
        g.quadraticCurveTo(x02 - cs2 * ww * 0.1 - ss2 * 1.2, y02 - ss2 * ww * 0.1 + cs2 * 1.2, x02 + cs2 * ww * 0.06, y02 + ss2 * ww * 0.06);
        g.quadraticCurveTo(x02 + cs2 * ww * 0.28 + ss2 * 1.2, y02 + ss2 * ww * 0.28 - cs2 * 1.2, x02 + cs2 * ww / 2, y02 + ss2 * ww / 2);
      }
    }
    g.stroke();
    g.strokeStyle = A3_INK + (0.7 * aTolk).toFixed(3) + ')';
    for (i = 0; i < A3.rocks.length; i++) {
      if (!inVp(A3.rocks[i].x, A3.rocks[i].y, 24)) continue;
      a3DrawRockMark(g, A3.rocks[i], LW);
    }
    /* the ring of standing stones on the Rune Stones, clearly decor */
    var ts = A3.groups.filter(function (q) { return q.sec === 'TypeScript' && q.product === 'cms'; })[0];
    if (ts && inVp(ts.spineIsle.a3.x, ts.spineIsle.a3.y, 60)) {
      g.strokeStyle = A3_INK + (0.8 * aTolk).toFixed(3) + ')';
      a3DrawStoneRing(g, ts.spineIsle.a3.x + ts.spineIsle.a3.r + 16, ts.spineIsle.a3.y - 6, 22, LW);
    }
  }

  /* --- the galleon on the ferry route --- */
  if (aRed > 0.02 && A3.ferry) {
    var gi = Math.floor(A3.ferry.length * 0.52);
    var mid = A3.ferry[gi], nxt = A3.ferry[Math.min(A3.ferry.length - 1, gi + 1)];
    var rot2 = clamp(Math.atan2(nxt[1] - mid[1], nxt[0] - mid[0]), -0.35, 0.35);
    var gsc = 0.26 * clamp(Math.pow(1.5 / Zs, 0.5), 0.42, 1.1);
    g.globalAlpha = aRed * 0.95;
    a3Galleon(g, mid[0], mid[1] - 9, gsc, rot2, LW);
    g.globalAlpha = 1;
  }

  /* ---------------- the symbols, the rings and the marks ---------------- */
  if (aSym3 > 0.02 || aSymAll > 0.02) {
    for (i = 0; i < A3.islands.length; i++) {
      I = A3.islands[i]; o = I.a3;
      var lm = a3IsLandmark(I);
      var symA = lm ? Math.max(aSym3, aSymAll) : aSymAll;
      if (symA < 0.02) continue;
      if (!inVp(o.x, o.y, o.r + 30)) continue;
      var rank = o.seated ? 'capital' : o.rank;
      var spr = A3G.symbol(o.group.fam, rank);
      var mult = (0.62 + 0.16 * a3Ramp(f, 3.2, 5)) * LW;
      var wpx = spr._w * mult, hpx = spr._h * mult;
      g.globalAlpha = symA;
      g.drawImage(spr, o.x - wpx / 2, o.y - hpx * 0.60, wpx, hpx);
      if (o.rank === 'capital' || o.seated) {
        g.strokeStyle = RED + '0.9)';
        g.lineWidth = 1.2 * LW;
        g.globalAlpha = symA * 0.9;
        g.beginPath(); g.arc(o.x, o.y, wpx * 0.62, 0, TAU); g.stroke();
        if (o.seated) { g.beginPath(); g.arc(o.x, o.y, wpx * 0.62 + 3 * LW, 0, TAU); g.stroke(); }
      }
      /* the marks of substance, and the soundings beside the great isles */
      if (aFire > 0.02) {
        var rpx = o.r;
        var mxx = o.x + rpx * 0.55 + 4 * LW, myy = o.y + rpx * 0.5 + 4 * LW;
        var ms = 11 * LW;
        g.globalAlpha = aFire * 0.9;
        if (I.code > 0) { g.drawImage(A3G.markCode, mxx, myy, ms, ms); mxx += ms * 1.1; }
        if (I.words >= 2000) g.drawImage(A3G.markScroll, mxx, myy, ms, ms);
        if (I.code >= 10) {
          var sm = I.code >= 35 ? A3G.smokes[2] : I.code >= 20 ? A3G.smokes[1] : A3G.smokes[0];
          g.drawImage(sm, o.x + wpx * 0.12, o.y - hpx * 0.60 - 14 * LW, ms, ms * 1.36);
        }
      }
      if (aWays4 > 0.02 && I.words >= 1200) {
        /* the soundings: a dot scale in the water, one dot to the thousand words */
        g.fillStyle = A3_INK2 + (0.8 * aWays4).toFixed(3) + ')';
        var nd = clamp(1 + Math.floor(I.words / 1000), 2, 7);
        for (k = 0; k < nd; k++) {
          g.beginPath();
          g.arc(o.x + o.r + (5 + k * 4.2) * LW, o.y + o.r * 0.28, 1.0 * LW, 0, TAU);
          g.fill();
        }
      }
      g.globalAlpha = 1;
    }
  }

  /* --- the crossings and the flourishes --- */
  for (i = 0; i < geo.decor.length; i++) {
    var D = geo.decor[i];
    if (!inVp(D.x, D.y, (D.r || 24) + 30)) continue;
    if (D.kind === 'serpent') { a3Serpent(g, D.x, D.y, D.len || 128, LW); continue; }
    if (D.kind === 'whale') { a3Whale(g, D.x, D.y, LW); continue; }
    g.save();
    g.lineWidth = LW;
    drawChartDecor(g, D);
    g.restore();
  }

  /* --- the singed edge --- */
  var er = rngFor('scorch');
  var seats = [[1382, 470], [700, 20], [900, 796], [22, 300]];
  for (var s3 = 0; s3 < seats.length; s3++) {
    for (i = 0; i < 20; i++) {
      var ea = er() * TAU, erad = er() * 88;
      var ex = seats[s3][0] + Math.cos(ea) * erad * 1.6, ey = seats[s3][1] + Math.sin(ea) * erad * 0.75;
      var err = 9 + er() * 32;
      var eg = g.createRadialGradient(ex, ey, 0, ex, ey, err);
      eg.addColorStop(0, 'rgba(96,60,24,' + (0.05 + er() * 0.11).toFixed(3) + ')');
      eg.addColorStop(1, 'rgba(96,60,24,0)');
      g.fillStyle = eg; g.fillRect(ex - err, ey - err, err * 2, err * 2);
      for (k = 0; k < 9; k++) {
        var ga = er() * TAU, gd2 = er() * err * 0.8;
        g.fillStyle = 'rgba(70,42,16,' + (0.04 + er() * 0.09).toFixed(3) + ')';
        g.fillRect(ex + Math.cos(ga) * gd2, ey + Math.sin(ga) * gd2 * 0.8, 0.5 + er() * 1.1, 0.4 + er() * 0.9);
      }
    }
  }

  drawRose(g, ROSE.x, ROSE.y, ROSE.r);
  g.restore();

  g.save();
  g.beginPath(); pathThrough(g, vell, true);
  g.strokeStyle = 'rgba(112,80,40,0.42)'; g.lineWidth = 2.2 * LW; g.stroke();
  g.strokeStyle = 'rgba(70,48,22,0.30)'; g.lineWidth = 0.8 * LW; g.stroke();
  g.restore();
}

/* ---------------- the land mask: no tab may sit on any of this ---------------- */
function furnMask(geo) {
  var mc = document.createElement('canvas');
  mc.width = CHART_W; mc.height = CHART_H;
  var g = mc.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#000';
  var i;
  for (i = 0; i < A3.islands.length; i++) {
    var o = A3.islands[i].a3;
    g.beginPath(); g.arc(o.x, o.y, o.r * 1.45 + 4, 0, TAU); g.fill();
  }
  for (i = 0; i < chart.marks.length; i++) {
    var m = chart.marks[i];
    g.beginPath(); g.arc(m.x, m.y, (m.r || 7) + 4, 0, TAU); g.fill();
  }
  /* the group waters keep their dotted limits and their lockups */
  for (i = 0; i < A3.groups.length; i++) {
    var G = A3.groups[i];
    g.beginPath(); pathThrough(g, G.limit, true); g.fill();
    g.fillRect(G.anchor.x - 96, G.anchor.y - 22, 192, 46);
  }
  /* the ways, the seas' own names, the flourishes and the crossings */
  if (A3.ferry) {
    g.lineWidth = 16; g.strokeStyle = '#000'; g.lineJoin = 'round'; g.lineCap = 'round';
    g.beginPath(); g.moveTo(A3.ferry[0][0], A3.ferry[0][1]);
    for (i = 1; i < A3.ferry.length; i++) g.lineTo(A3.ferry[i][0], A3.ferry[i][1]);
    g.stroke();
  }
  if (A3.trail.length) {
    g.lineWidth = 14; g.beginPath(); g.moveTo(A3.trail[0][0], A3.trail[0][1]);
    for (i = 1; i < A3.trail.length; i++) g.lineTo(A3.trail[i][0], A3.trail[i][1]);
    g.stroke();
  }
  var S = A3.seas;
  Object.keys(S).forEach(function (kk) {
    var s = S[kk];
    g.fillRect(s.x - 130, s.y - 22, 260, 44);
  });
  Object.keys(A3.chains).forEach(function (kk) {
    var c = A3.chains[kk];
    g.fillRect(c.x - 240, c.y - 30, 480, 62);
  });
  for (i = 0; i < (geo.decor || []).length; i++) {
    var D = geo.decor[i];
    var rr = D.kind === 'serpent' ? 0 : (D.r || 18);
    if (D.kind === 'serpent') g.fillRect(D.x - 34, D.y - 26, (D.len || 128) + 52, 52);
    else { g.beginPath(); g.arc(D.x, D.y, rr + 6, 0, TAU); g.fill(); }
  }
  g.fillRect(ROSE_RECT.x, ROSE_RECT.y, ROSE_RECT.w, ROSE_RECT.h);
  return g;
}

/* ============================================================
   THE LADDER: five rungs on the reading glass the game already has
   ============================================================ */
function a3GoRung(target, anchor) {
  target = clamp(Math.round(target), 1, 5);
  var z = A3_RUNGS[target - 1];
  var ax = anchor ? anchor[0] : CHART_W / 2, ay = anchor ? anchor[1] : CHART_H / 2;
  var sx = (ax - chart.txt) / chart.zt, sy = (ay - chart.tyt) / chart.zt;
  chart.zt = z;
  chart.txt = ax - sx * z;
  chart.tyt = ay - sy * z;
  chartClampTargets();
  a3SyncLadder();
  kickChartAnim();
}
function chartZoomAbout(cx, cy, zNew) {
  var dir = zNew > chart.zt * 1.0005 ? 1 : (zNew < chart.zt * 0.9995 ? -1 : 0);
  if (!dir) return;
  var now = performance.now();
  if (now - a3StepAt < 260) return;
  a3StepAt = now;
  a3GoRung(a3Rung(chart.zt) + dir, [cx, cy]);
}
function chartKeyZoom(k) {
  if (k === '0') { a3GoRung(1); return; }
  a3GoRung(a3Rung(chart.zt) + ((k === '-' || k === '_') ? -1 : 1));
}
function a3SyncLadder() {
  var el = $('ladder');
  if (!el) return;
  var r = a3RungTarget();
  el.querySelector('.ld-name').textContent = A3_RUNG_NAMES[r - 1];
  var notches = el.querySelectorAll('.ld-n');
  for (var i = 0; i < notches.length; i++) notches[i].classList.toggle('on', i === r - 1);
  var mi = $('ld-minus'), pl = $('ld-plus');
  if (mi) mi.disabled = r <= 1;
  if (pl) pl.disabled = r >= 5;
  el.setAttribute('aria-valuenow', String(r));
  diag.a3Rung = { rung: r, name: A3_RUNG_NAMES[r - 1], z: +chart.zt.toFixed(3) };
}
function a3WireLadder() {
  var el = $('ladder');
  if (!el || el._wired) return;
  el._wired = true;
  var mi = $('ld-minus'), pl = $('ld-plus');
  if (mi) mi.addEventListener('click', function (e) { e.stopPropagation(); a3GoRung(a3RungTarget() - 1); });
  if (pl) pl.addEventListener('click', function (e) { e.stopPropagation(); a3GoRung(a3RungTarget() + 1); });
  var ns = el.querySelectorAll('.ld-n');
  for (var i = 0; i < ns.length; i++) {
    (function (k) {
      ns[k].addEventListener('click', function (e) { e.stopPropagation(); a3GoRung(k + 1); });
      ns[k].addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); a3GoRung(k + 1); }
      });
    })(i);
  }
}
function a3LayoutLadder(S, dx, dy) {
  var el = $('ladder');
  if (!el) return;
  var d = A3.ladderDock || { x: CHART_W - 214, y: CHART_H - 84 };
  el.style.display = 'block';
  el.style.left = (dx + d.x * S).toFixed(1) + 'px';
  el.style.top = (dy + d.y * S).toFixed(1) + 'px';
  el.style.transform = 'scale(' + S.toFixed(4) + ')';
  a3WireLadder();
  a3SyncLadder();
}

/* ---------------- the docks, proven against the real land mask ---------------- */
function furnComputeDocks() {
  var geo = chart.geo;
  if (!geo) return;
  var mg = furnMask(geo);
  var taken = [ROSE_RECT, { x: CHART_W / 2 - 120, y: 6, w: 240, h: 38 }];
  var hitTaken = function (r) {
    return taken.some(function (q) {
      return r.x < q.x + q.w + 8 && r.x + r.w + 8 > q.x && r.y < q.y + q.h + 8 && r.y + r.h + 8 > q.y;
    });
  };
  /* the wanderer's ladder: a pinned instrument, low and to the east */
  var LD = { w: 208, h: 76 };
  var placedL = false, step;
  for (step = 0; step < 60 && !placedL; step++) {
    var offL = (step % 2 ? -1 : 1) * Math.ceil(step / 2) * 18;
    var rl = { x: CHART_W - LD.w - 26, y: clamp(CHART_H - LD.h - 26 + offL, 30, CHART_H - LD.h - 22), w: LD.w, h: LD.h };
    if (hitTaken(rl) || !furnRectClear(mg, rl)) continue;
    A3.ladderDock = rl; taken.push(rl); placedL = true;
  }
  if (!placedL) {
    A3.ladderDock = { x: CHART_W - LD.w - 26, y: CHART_H - LD.h - 26, w: LD.w, h: LD.h };
    taken.push(A3.ladderDock);
  }
  /* the scale bar: small and low, proven over water like the rest */
  var placedS = false;
  for (step = 0; step < 46 && !placedS; step++) {
    var off = (step % 2 ? -1 : 1) * Math.ceil(step / 2) * 22;
    var r = { x: clamp(500 + off, 30, CHART_W - SCAL.w - 30), y: SCAL.y - 14, w: SCAL.w, h: SCAL.h + 16 };
    if (!hitTaken(r) && furnRectClear(mg, r)) { SCAL.x = r.x; taken.push(r); placedS = true; }
  }
  if (!placedS) taken.push({ x: SCAL.x, y: SCAL.y - 14, w: SCAL.w, h: SCAL.h + 16 });

  var docks = {};
  var ids = Object.keys(FURNSPEC);
  for (var q = 0; q < ids.length; q++) {
    var id = ids[q], sp = FURNSPEC[id], tz = furnTabSize(id), seat = null;
    for (step = 0; step < 70 && !seat; step++) {
      var off2 = (step % 2 ? -1 : 1) * Math.ceil(step / 2) * 15;
      var rr;
      if (sp.edge === 'w') rr = { x: 5, y: sp.at + off2, w: tz.w, h: tz.h };
      else if (sp.edge === 'e') rr = { x: CHART_W - tz.w - 5, y: sp.at + off2, w: tz.w, h: tz.h };
      else if (sp.edge === 's') rr = { x: sp.at + off2 - tz.w / 2, y: CHART_H - tz.h - 5, w: tz.w, h: tz.h };
      else rr = { x: 10 + Math.max(0, off2), y: CHART_H - tz.h - 6, w: tz.w, h: tz.h };
      rr.x = clamp(rr.x, 4, CHART_W - tz.w - 4);
      rr.y = clamp(rr.y, 4, CHART_H - tz.h - 4);
      if (hitTaken(rr)) continue;
      if (furnRectClear(mg, rr)) seat = rr;
    }
    if (!seat) {
      seat = sp.edge === 'e'
        ? { x: CHART_W - tz.w - 5, y: sp.at, w: tz.w, h: tz.h }
        : { x: 5, y: sp.edge === 'w' ? sp.at : CHART_H - tz.h - 5, w: tz.w, h: tz.h };
    }
    seat.clear = furnRectClear(mg, seat);
    docks[id] = seat;
    taken.push(seat);
  }
  furn.docks = docks;
  FURN.length = 0;
  for (var t = 0; t < taken.length; t++) FURN.push(taken[t]);
  diag.furn = {
    docks: docks, faded: furn.faded, open: furn.open,
    scale: { x: SCAL.x, y: SCAL.y, w: SCAL.w, h: SCAL.h },
    ladder: A3.ladderDock,
    collapsed: Object.keys(docks).map(function (id2) { return Object.assign({ id: id2 }, docks[id2]); })
  };
}

/* ============================================================
   THE LETTERING: every word on this sheet is DOM, and stays crisp.
   The hand-lettered wobble is spent where the count is small: the chain
   lockups, the group lockups, the seas and the flourish lines.
   ============================================================ */
function a3HandSpans(text, seed, amp, rot) {
  var r = mulberry32(seed >>> 0), out = '';
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    if (ch === ' ') { out += '<span style="display:inline-block;width:0.34em"></span>'; continue; }
    var dy = ((r() - 0.5) * 2 * amp).toFixed(3);
    var rr = ((r() - 0.5) * 2 * rot).toFixed(3);
    out += '<span style="display:inline-block;transform:translateY(' + dy + 'em) rotate(' + rr + 'rad)">' + esc(ch) + '</span>';
  }
  return out;
}
/* text laid on a shallow arc: Rem is the radius in em, negative arches down */
function a3ArcSpans(text, Rem, seed, wob) {
  var n = text.length, out = '', adv = 0.62;
  var r = mulberry32((seed || 3) >>> 0);
  for (var i = 0; i < n; i++) {
    var ch = text[i];
    var x = (i - (n - 1) / 2) * adv;
    var th = Rem ? x / Rem : 0;
    var dy = Rem ? Rem * (1 - Math.cos(th)) : 0;
    var w = wob ? (r() - 0.5) * 2 * wob : 0;
    if (ch === ' ') { out += '<span style="display:inline-block;width:0.34em"></span>'; continue; }
    out += '<span style="display:inline-block;transform:translateY(' + (dy + w).toFixed(3) +
      'em) rotate(' + th.toFixed(4) + 'rad)">' + esc(ch) + '</span>';
  }
  return out;
}

function layoutChartDom() {
  var geo = chart.geo, lab = $('chartlabels'), cv = chart.cv;
  if (!geo || !cv) return;
  var rect = cv.getBoundingClientRect();
  var host = lab.parentElement.getBoundingClientRect();
  var S = rect.width / CHART_W || 1;
  var dx = rect.left - host.left, dy = rect.top - host.top;
  var Z = chart.z, TX = chart.tx, TY = chart.ty;
  var vx = function (x) { return x * Z + TX; };
  var vy = function (y) { return y * Z + TY; };
  var inView = function (x, y, m) { return x > -m && x < CHART_W + m && y > -m && y < CHART_H + m; };
  var f = a3RungF(), rung = a3Rung();
  var zf = Math.pow(Z, 0.24);
  var boxes = [], geoHtml = [], pinHtml = [], i, k;
  var hit = function (b) {
    for (var q = 0; q < boxes.length; q++) {
      var c = boxes[q];
      if (b.x0 < c.x1 && b.x1 > c.x0 && b.y0 < c.y1 && b.y1 > c.y0) return true;
    }
    return false;
  };
  var shm = 21;
  var shX0 = vx(shm), shX1 = vx(CHART_W - shm), shY0 = vy(shm), shY1 = vy(CHART_H - shm);
  var onSheet = function (b) { return b.x0 >= shX0 && b.x1 <= shX1 && b.y0 >= shY0 && b.y1 <= shY1; };
  var seat = function (x, y, w, h) {
    return {
      x: shX1 - shX0 > w ? clamp(x, shX0 + w / 2, shX1 - w / 2) : x,
      y: shY1 - shY0 > h ? clamp(y, shY0 + h / 2, shY1 - h / 2) : y
    };
  };
  var put = function (arr, cls, html, x, y, w, h, style, attrs) {
    boxes.push({ x0: x - w / 2, x1: x + w / 2, y0: y - h / 2, y1: y + h / 2 });
    arr.push('<div class="' + cls + '" ' + (attrs || '') + 'style="left:' + (dx + x * S).toFixed(1) +
      'px;top:' + (dy + y * S).toFixed(1) + 'px;' + (style || '') + '">' + html + '</div>');
  };
  for (i = 0; i < FURN.length; i++) {
    boxes.push({ x0: FURN[i].x - 4, x1: FURN[i].x + FURN[i].w + 4, y0: FURN[i].y - 4, y1: FURN[i].y + FURN[i].h + 4 });
  }
  /* the rose and her letters claim their ground first */
  var roseLetters = [];
  {
    var rr0 = (ROSE.r + 10) * Z;
    boxes.push({ x0: vx(ROSE.x) - rr0, x1: vx(ROSE.x) + rr0, y0: vy(ROSE.y) - rr0, y1: vy(ROSE.y) + rr0 });
    var pts = [['E', 0], ['S', Math.PI / 2], ['W', Math.PI]];
    for (i = 0; i < pts.length; i++) {
      var rrad = ROSE.r + 24;
      var rx = vx(ROSE.x + Math.cos(pts[i][1]) * rrad), ry = vy(ROSE.y + Math.sin(pts[i][1]) * rrad);
      if (!inView(rx, ry, 60)) continue;
      var lw2 = 11 * Z * 1.1, lh2 = 11 * Z * 1.2;
      boxes.push({ x0: rx - lw2 / 2 - 3, x1: rx + lw2 / 2 + 3, y0: ry - lh2 / 2 - 3, y1: ry + lh2 / 2 + 3 });
      roseLetters.push([pts[i][0], rx, ry]);
    }
  }

  /* ---- the two chain lockups: invented name over official name and true count ---- */
  var aChain = 1 - a3Ramp(f, 2.1, 2.8);
  if (aChain > 0.02) {
    var chainKeys = ['chain', 'crescent'];
    for (i = 0; i < chainKeys.length; i++) {
      var C = A3.chains[chainKeys[i]];
      var prod = chainKeys[i] === 'chain' ? 'cms' : 'cloud';
      var count = A3.census.chains[chainKeys[i]];
      var rumor = fog.mode === 'known' && !fog.anim &&
        !world.islands.some(function (q) { return q.product === prod && isleSeen(q); });
      var cx = vx(C.x), cy = vy(C.y);
      if (!inView(cx, cy, 460)) continue;
      var fs = C.size * Math.pow(Z, 0.26);
      var sp = fs * 0.30;
      var w = textW(C.name, fs, '600 ', sp) + sp + 20, h = fs + 12;
      var st = seat(cx, cy, w, h);
      put(geoHtml, 'cl-chain' + (rumor ? ' rumor' : ''),
        a3ArcSpans(C.name, chainKeys[i] === 'chain' ? 28 : -30, 11, 0.012),
        st.x, st.y, w, h,
        'font-size:' + (fs * S).toFixed(2) + 'px;letter-spacing:' + (sp * S).toFixed(2) + 'px');
      var fs2 = fs * 0.42;
      var subT = '· ' + C.official.toUpperCase() + ' · ' + count + ' ISLES ·';
      var w2 = textW(subT, fs2, '', fs2 * 0.22) + 10;
      put(geoHtml, 'cl-chainsub' + (rumor ? ' rumor' : ''), esc(subT),
        st.x, st.y + h * 0.78, w2, fs2 + 6,
        'font-size:' + (fs2 * S).toFixed(2) + 'px;letter-spacing:' + (fs2 * 0.22 * S).toFixed(2) + 'px');
    }
  }

  /* ---- the four named waters and the strait ---- */
  var seaKeys = ['openMain', 'publishing', 'bay', 'deep', 'passage'];
  for (i = 0; i < seaKeys.length; i++) {
    var SS = A3.seas[seaKeys[i]];
    if (seaKeys[i] === 'passage' && f < 1.2) continue;
    if (seaKeys[i] === 'deep' && f < 2.4) continue;
    var sx3 = vx(SS.x), sy3 = vy(SS.y);
    if (!inView(sx3, sy3, 260)) continue;
    var sfs = clamp(SS.size * Math.pow(Z, 0.34), SS.size, SS.size * 1.9);
    var ssp = sfs * 0.24;
    var sw3 = textW(SS.name, sfs, 'italic ', ssp) + ssp + 12, sh3 = sfs + 8;
    var sst = seat(sx3, sy3, sw3, sh3);
    var arc = SS.arc ? (seaKeys[i] === 'openMain' ? -34 : 34) : 0;
    put(geoHtml, 'cl-sea', a3ArcSpans(SS.name, arc, 17, 0.014), sst.x, sst.y, sw3, sh3,
      'font-size:' + (sfs * S).toFixed(2) + 'px;letter-spacing:' + (ssp * S).toFixed(2) + 'px');
    if (seaKeys[i] === 'deep') {
      var dsub = A3.census.unreached + ' pages no route reaches';
      var dw = textW(dsub, sfs * 0.62, 'italic ', 0.4) + 8;
      put(geoHtml, 'cl-flour', esc(dsub), sst.x, sst.y + sh3 * 0.95, dw, sfs * 0.62 + 5,
        'font-size:' + (sfs * 0.62 * S).toFixed(2) + 'px');
    }
    if (seaKeys[i] === 'passage' && f >= 1.75) {
      var fsub = 'the ferry of ' + A3.census.crossEdges + ' true crossings';
      var fw = textW(fsub, sfs * 0.66, 'italic ', 0.4) + 8;
      put(geoHtml, 'cl-ferry', esc(fsub), sst.x, sst.y + sh3 * 0.95, fw, sfs * 0.66 + 5,
        'font-size:' + (sfs * 0.66 * S).toFixed(2) + 'px');
    }
  }

  /* ---- the sixteen group lockups: invented name, official section, true count ---- */
  var aProv = a3Ramp(f, 1.5, 1.95);
  if (aProv > 0.02) {
    var deepDim = f > 4.5 ? 0.66 : f > 3.5 ? 0.78 : f > 2.75 ? 0.88 : 1;
    var gs = A3.groups.slice().sort(function (a, b) { return b.count - a.count; });
    for (i = 0; i < gs.length; i++) {
      var G = gs[i];
      var gRumor = fog.mode === 'known' && !fog.anim && G.members.every(function (q) { return !isleSeen(q); });
      var gx = vx(G.anchor.x), gy = vy(G.anchor.y);
      if (!inView(gx, gy, 320)) continue;
      var gfs = clamp(11 * Math.pow(Z / 1.5, 0.30), 10.5, 18) * (G.count >= 26 ? 1.12 : G.count <= 3 ? 0.9 : 1);
      var gsp = gfs * 0.17;
      var gname = G.name.toUpperCase();
      var gw = textW(gname, gfs, '', gsp) + gsp + 12, gh = gfs + 8;
      var subT2 = G.sec + ' · ' + G.count + (G.count === 1 ? ' page' : ' pages');
      var sfs2 = gfs * 0.66;
      var gw2 = textW(subT2, sfs2, 'italic ', 0.5) + 10;
      var boxW = Math.max(gw, gw2), boxH = gh + sfs2 + 8;
      var placed = false;
      for (var t = 0; t < 8 && !placed; t++) {
        var ddy = [0, -boxH, boxH, -boxH * 1.8, boxH * 1.8, -boxH * 2.6, boxH * 2.6, boxH * 3.4][t];
        var stg = seat(gx, gy + ddy, boxW, boxH);
        var bb = { x0: stg.x - boxW / 2, x1: stg.x + boxW / 2, y0: stg.y - boxH / 2, y1: stg.y + boxH / 2 };
        if (hit(bb) && t < 7) continue;
        boxes.push(bb);
        var rotG = (rung >= 4 ? G.anchor.rot * 0.7 : G.anchor.rot * 0.5);
        geoHtml.push('<div class="cl-grp' + (gRumor ? ' rumor' : '') + '" style="left:' +
          (dx + stg.x * S).toFixed(1) + 'px;top:' + (dy + (stg.y - boxH / 2 + gh / 2) * S).toFixed(1) +
          'px;font-size:' + (gfs * S).toFixed(2) + 'px;letter-spacing:' + (gsp * S).toFixed(2) +
          'px;opacity:' + deepDim.toFixed(2) + ';transform:translate(-50%,-50%) rotate(' + rotG.toFixed(3) + 'rad)">' +
          a3HandSpans(gname, 40 + G.id, 0.026, 0.02) + '</div>');
        geoHtml.push('<div class="cl-grpsub' + (gRumor ? ' rumor' : '') + '" style="left:' +
          (dx + stg.x * S).toFixed(1) + 'px;top:' + (dy + (stg.y - boxH / 2 + gh + sfs2 * 0.62) * S).toFixed(1) +
          'px;font-size:' + (sfs2 * S).toFixed(2) + 'px;opacity:' + deepDim.toFixed(2) + '">' + esc(subT2) + '</div>');
        placed = true;
      }
    }
  }

  /* ---- the capes: the official sub reaches, lettered beside their skerries ---- */
  if (f >= 3.35) {
    for (i = 0; i < A3.capes.length; i++) {
      var CP = A3.capes[i];
      var cpx = vx(CP.x), cpy = vy(CP.y);
      if (!inView(cpx, cpy, 120)) continue;
      var cfs = 10 * zf;
      var cw = textW(CP.name.toUpperCase(), cfs, '', cfs * 0.12) + 10, ch2 = cfs + 6;
      var cst = seat(cpx, cpy, cw, ch2);
      var cbb = { x0: cst.x - cw / 2, x1: cst.x + cw / 2, y0: cst.y - ch2 / 2, y1: cst.y + ch2 / 2 };
      if (hit(cbb)) continue;
      put(geoHtml, 'cl-cape', esc(CP.name.toUpperCase()), cst.x, cst.y, cw, ch2,
        'font-size:' + (cfs * S).toFixed(2) + 'px;letter-spacing:' + (cfs * 0.12 * S).toFixed(2) + 'px');
      var csub = CP.official + ' · ' + CP.count + ' pages';
      var cw3 = textW(csub, cfs * 0.8, 'italic ', 0.4) + 8;
      put(geoHtml, 'cl-capesub', esc(csub), cst.x, cst.y + ch2 * 0.9, cw3, cfs * 0.8 + 4,
        'font-size:' + (cfs * 0.8 * S).toFixed(2) + 'px');
    }
  }

  /* ---- the flourish lines, clearly decor beside the real places ---- */
  if (f >= 3.5) {
    var bI = world.bySlug.get(A3_BREAKING);
    if (bI && bI.a3) {
      var bx3 = vx(bI.a3.x + 6), by3 = vy(bI.a3.y - bI.a3.r) - 26 * zf;
      if (inView(bx3, by3, 80)) {
        var bt = 'Here be breaking changes';
        var bw = textW(bt, 9.6 * zf, 'italic ', 0.6) + 8;
        var bst = seat(bx3, by3, bw, 9.6 * zf + 5);
        if (!hit({ x0: bst.x - bw / 2, x1: bst.x + bw / 2, y0: bst.y - 8, y1: bst.y + 8 })) {
          put(geoHtml, 'cl-flour', a3HandSpans(bt, 313, 0.05, 0.035), bst.x, bst.y, bw, 9.6 * zf + 5,
            'font-size:' + (9.6 * zf * S).toFixed(2) + 'px');
        }
      }
    }
    if (A3.trail.length) {
      var tm = A3.trail[Math.floor(A3.trail.length * 0.4)];
      var tn = A3.trail[Math.min(A3.trail.length - 1, Math.floor(A3.trail.length * 0.4) + 2)];
      var trot = Math.atan2(tn[1] - tm[1], tn[0] - tm[0]);
      if (trot > Math.PI / 2) trot -= Math.PI;
      if (trot < -Math.PI / 2) trot += Math.PI;
      var tx3 = vx(tm[0]), ty3 = vy(tm[1]) - 12 * zf;
      if (inView(tx3, ty3, 80)) {
        var tt2 = 'the Migration Trail';
        var tw2 = textW(tt2, 9.4 * zf, 'italic ', 0.5) + 8;
        var tst = seat(tx3, ty3, tw2, 9.4 * zf + 5);
        boxes.push({ x0: tst.x - tw2 / 2, x1: tst.x + tw2 / 2, y0: tst.y - 8, y1: tst.y + 8 });
        geoHtml.push('<div class="cl-mig" style="left:' + (dx + tst.x * S).toFixed(1) + 'px;top:' +
          (dy + tst.y * S).toFixed(1) + 'px;font-size:' + (9.4 * zf * S).toFixed(2) +
          'px;transform:translate(-50%,-50%) rotate(' + clamp(trot, -0.5, 0.5).toFixed(3) + 'rad)">' +
          a3HandSpans(tt2, 414, 0.05, 0.03) + '</div>');
      }
    }
  }

  /* ---- the islands: every name the rung will hold ---- */
  var lettered = 0;
  if (rung >= 3) {
    var sel = A3.islands.filter(rung === 3 ? a3IsLandmark : rung === 4 ? a3IsCited : function () { return true; });
    var RW = { capital: 4, town: 3, village: 2, hamlet: 1 };
    sel.sort(function (a, b) {
      return RW[b.a3.rank] - RW[a.a3.rank] || b.inbound - a.inbound || b.words - a.words;
    });
    for (i = 0; i < sel.length; i++) {
      var I2 = sel[i], o2 = I2.a3;
      if (fogHides(I2)) continue;
      var ix = vx(o2.x), iy = vy(o2.y);
      if (!inView(ix, iy, 110)) continue;
      var cap = o2.rank === 'capital' || o2.seated;
      var cls2 = cap ? 'cl-isle cap' : o2.rank === 'town' ? 'cl-isle town' :
        o2.rank === 'village' ? 'cl-isle vil' : 'cl-isle ham';
      var ifs = (cap ? 12.2 : o2.rank === 'town' ? 10.3 : o2.rank === 'village' ? 9.3 : 8.6) * zf;
      var txt = cap ? I2.sidebarLabel.toUpperCase() : I2.sidebarLabel;
      if (txt.length > 30) { ifs *= Math.max(0.8, Math.sqrt(30 / txt.length)); }
      var isp = cap ? ifs * 0.10 : 0.2;
      var iw = textW(txt, ifs, cap ? '' : (o2.rank === 'hamlet' ? 'italic ' : ''), isp) + isp + 6;
      var ih = ifs + 4;
      var rotI = rung >= 4 ? (cap ? o2.lean * 0.5 : o2.lean) : 0;
      var ca2 = Math.abs(Math.cos(rotI)), sa2 = Math.abs(Math.sin(rotI));
      var aw = iw * ca2 + ih * sa2, ah = iw * sa2 + ih * ca2;
      var rp = o2.r * Z;
      var tries = [[0, rp + ah / 2 + 3], [0, -(rp + ah / 2 + 3)],
        [rp + aw / 2 + 4, 0], [-(rp + aw / 2 + 4), 0],
        [rp * 0.8 + aw / 2, -(rp * 0.7 + ah * 0.5)], [-(rp * 0.8 + aw / 2), rp * 0.7 + ah * 0.5],
        [0, rp + ah * 1.6], [0, -(rp + ah * 1.6)]];
      var done = false;
      for (k = 0; k < tries.length && !done; k++) {
        var bx4 = ix + tries[k][0], by4 = iy + tries[k][1];
        var b4 = { x0: bx4 - aw / 2, x1: bx4 + aw / 2, y0: by4 - ah / 2, y1: by4 + ah / 2 };
        if (!onSheet(b4)) continue;
        if (hit(b4)) continue;
        boxes.push(b4);
        geoHtml.push('<div class="' + cls2 + '" tabindex="0" role="link" data-slug="' + esc(I2.slug) +
          '" style="left:' + (dx + bx4 * S).toFixed(1) + 'px;top:' + (dy + by4 * S).toFixed(1) +
          'px;font-size:' + (ifs * S).toFixed(2) + 'px;letter-spacing:' + (isp * S).toFixed(2) +
          'px;transform:translate(-50%,-50%) rotate(' + rotI.toFixed(3) + 'rad)">' + esc(txt) + '</div>');
        lettered++;
        done = true;
      }
    }
  }
  geo.lettered = lettered;

  /* ---- the rose's letters, and the scale's numerals ---- */
  for (i = 0; i < roseLetters.length; i++) {
    geoHtml.push('<div class="cl-rose" style="left:' + (dx + roseLetters[i][1] * S).toFixed(1) +
      'px;top:' + (dy + roseLetters[i][2] * S).toFixed(1) + 'px;font-size:' +
      (11 * Z * S).toFixed(2) + 'px">' + roseLetters[i][0] + '</div>');
  }
  var SG = chart.scaleGeom;
  if (SG) {
    for (i = 0; i <= 4; i++) {
      pinHtml.push('<div class="cl-num" style="left:' + (dx + (SG.x0 + SG.len * i / 4) * S).toFixed(1) +
        'px;top:' + (dy + (SG.y0 - 11) * S).toFixed(1) + 'px;font-size:' + (9 * S).toFixed(2) + 'px">' +
        (+((i * SG.span / 4).toFixed(2))) + '</div>');
    }
    pinHtml.push('<div class="cl-scaption" style="left:' + (dx + (SCAL.x + SCAL.w / 2) * S).toFixed(1) +
      'px;top:' + (dy + (SG.y0 + 20) * S).toFixed(1) + 'px;font-size:' + (10 * S).toFixed(2) + 'px">' +
      'A scale of ' + numToWords(SG.span) + (SG.span === 1 ? ' nautical mile' : ' nautical miles') + ', by estimation</div>');
  }

  lab.innerHTML = '<div id="clgeo">' + geoHtml.join('') + '</div><div id="clpin">' + pinHtml.join('') + '</div>';
  chart.layoutView = { z: Z, tx: TX, ty: TY, S: S, dx: dx, dy: dy };

  var fsw = $('fogswitch');
  if (fsw) {
    fsw.style.left = (dx + (CHART_W / 2) * S).toFixed(1) + 'px';
    fsw.style.top = (dy + 25 * S).toFixed(1) + 'px';
    fsw.style.fontSize = (10.5 * S).toFixed(2) + 'px';
  }
  placeChartCat();
  furnLayout(S, dx, dy);
  a3LayoutLadder(S, dx, dy);
}

/* ============================================================
   THE CARTOUCHE, THE LEGEND AND THE DIRECTIONS: real counts only
   ============================================================ */
function a3LegendRows() {
  if (A3._legend) return A3._legend;
  var byFam = new Map();
  for (var i = 0; i < A3.groups.length; i++) {
    var g = A3.groups[i];
    var e = byFam.get(g.fam);
    if (!e) { e = { fam: g.fam, secs: [], count: 0 }; byFam.set(g.fam, e); }
    if (e.secs.indexOf(g.sec) < 0) e.secs.push(g.sec);
    e.count += g.count;
  }
  var rows = [];
  byFam.forEach(function (e) { rows.push(e); });
  rows.sort(function (a, b) { return b.count - a.count; });
  var SHORT = {
    'Plugins development': 'Plugins devt.', 'Command Line Interface': 'Command Line',
    'Projects management': 'Projects mgmt.', 'Advanced configuration': 'Advanced config.',
    'Account management': 'Account mgmt.'
  };
  for (var k = 0; k < rows.length; k++) {
    rows[k].label = rows[k].secs.map(function (s) { return SHORT[s] || s; }).join(' / ');
  }
  A3._legend = rows;
  return rows;
}
var A3_LG = { y0: 66, rh: 15.6, colW: 171, x0: 16 };

function drawKeyGlyphs(g, B) {
  var rows = a3LegendRows();
  var perCol = Math.ceil(rows.length / 2);
  for (var i = 0; i < rows.length; i++) {
    var col = Math.floor(i / perCol), row = i % perCol;
    var rx = B.x + A3_LG.x0 + col * A3_LG.colW;
    var ry = B.y + A3_LG.y0 + row * A3_LG.rh;
    var spr = A3G.symbol(rows[i].fam, 'village');
    g.drawImage(spr, rx, ry - 11, spr._w * 0.60, spr._h * 0.60);
  }
  /* the four ranks, with the single vermilion accent on the capitals */
  var yy = B.y + A3_LG.y0 + perCol * A3_LG.rh + 26;
  var RK = [['capital', 4.6], ['town', 3.4], ['village', 2.5], ['hamlet', 1.7]];
  for (var k = 0; k < RK.length; k++) {
    g.save();
    g.translate(B.x + 26, yy + k * 15 - 3.5);
    g.strokeStyle = RK[k][0] === 'capital' ? RED + '0.92)' : INK + '0.82)';
    g.lineWidth = 1;
    g.beginPath(); g.arc(0, 0, RK[k][1], 0, TAU); g.stroke();
    if (RK[k][0] === 'capital') { g.beginPath(); g.arc(0, 0, 6.6, 0, TAU); g.stroke(); }
    g.restore();
  }
  /* the marks of substance */
  var my = yy + RK.length * 15 + 26;
  var ms = [A3G.markCode, A3G.smokes[2], A3G.markScroll];
  for (var m = 0; m < ms.length; m++) {
    g.drawImage(ms[m], B.x + 20, my + m * 14.5 - 9, ms[m]._w * 0.9, ms[m]._h * 0.9);
  }
}

function keyHtml(S) {
  var C = A3.census, rows = a3LegendRows();
  var perCol = Math.ceil(rows.length / 2);
  var h = '<div class="ck-h">THE LEGEND</div>' +
    '<div class="ck-lede">Every mark is one real page. Island size is its word count, its symbol its ' +
    'official section, its rank the citations that reach it.</div>';
  for (var i = 0; i < rows.length; i++) {
    var col = Math.floor(i / perCol), row = i % perCol;
    var left = (A3_LG.x0 + 20 + col * A3_LG.colW) * S;
    var top = (A3_LG.y0 - 12 + row * A3_LG.rh) * S;
    h += '<div class="ck-row" style="left:' + left.toFixed(1) + 'px;top:' + top.toFixed(1) +
      'px;width:' + ((A3_LG.colW - 22) * S).toFixed(1) + 'px;height:' + (A3_LG.rh * S).toFixed(1) +
      'px;line-height:' + (A3_LG.rh * S).toFixed(1) + 'px">' + esc(rows[i].label) + ', ' + rows[i].count + '</div>';
  }
  var yy = A3_LG.y0 + perCol * A3_LG.rh + 12;
  h += '<div class="ck-sub" style="top:' + (yy * S).toFixed(1) + 'px">Rank is citation, inbound of ' +
    commas(C.edges) + ' true edges</div>';
  var RK = [
    ['Capital, 20 or more cited', C.ranks.capital + ', and ' + C.seated + ' seated'],
    ['Town, 8 to 19', C.ranks.town],
    ['Village, 3 to 7', C.ranks.village],
    ['Hamlet, 0 to 2', C.ranks.hamlet]
  ];
  for (var k = 0; k < RK.length; k++) {
    h += '<div class="ck-row" style="left:' + (40 * S).toFixed(1) + 'px;top:' +
      ((yy + 14 + k * 15 - 11) * S).toFixed(1) + 'px;width:' + (300 * S).toFixed(1) +
      'px;height:' + (15 * S).toFixed(1) + 'px;line-height:' + (15 * S).toFixed(1) + 'px">' +
      RK[k][0] + ':  ' + RK[k][1] + '</div>';
  }
  var my = yy + 14 + RK.length * 15 + 12;
  h += '<div class="ck-sub" style="top:' + (my * S).toFixed(1) + 'px">Marks of substance</div>';
  var MK = [
    'code aboard: ' + C.marks.code + ' pages',
    'forge smoke, 10 or more blocks: ' + C.marks.smoke,
    'long read, 2000 or more words: ' + C.marks.scroll
  ];
  for (var m = 0; m < MK.length; m++) {
    h += '<div class="ck-row" style="left:' + (40 * S).toFixed(1) + 'px;top:' +
      ((my + 14 + m * 14.5 - 11) * S).toFixed(1) + 'px;width:' + (300 * S).toFixed(1) +
      'px;height:' + (14.5 * S).toFixed(1) + 'px;line-height:' + (14.5 * S).toFixed(1) + 'px">' + MK[m] + '</div>';
  }
  h += '<div class="ck-rule" style="top:' + ((my + 14 + MK.length * 14.5 + 4) * S).toFixed(1) + 'px">' +
    'the ladder unfurls the sheet: <b>I</b> the two chains and their seas &middot; <b>II</b> the sixteen ' +
    'island groups &middot; <b>III</b> ' + C.landmarkTier + ' landmarks named &middot; <b>IV</b> the ' +
    'storyteller&rsquo;s hand, the terrain and the soundings, ' + C.citedTier + ' named &middot; ' +
    '<b>V</b> all ' + C.islands + ' named</div>';
  return h;
}

function cartoucheHtml() {
  var C = A3.census;
  return '<div class="cc-title">THE TWO GREAT CHAINS</div>' +
    '<div class="cc-sub">A wanderer&rsquo;s chart of the scattered dominions<br>of Strapi CMS and Strapi Cloud</div>' +
    '<div class="cc-rule"></div>' +
    '<div class="cc-tot"><b>' + C.chains.chain + '</b> isles of the Contentian Chain &middot; <b>' +
    C.chains.crescent + '</b> of the Nubilian Crescent<br><b>' + C.groups.length +
    '</b> island groups &middot; <b>' + C.islands + '</b> true pages &middot; <b>' +
    commas(C.edges) + '</b> citations<br><b>' + C.crossEdges +
    '</b> crossings of the Deployment Passage &middot; <b>' + C.unreached + '</b> unreached</div>';
}

function directionsHtml() {
  var C = A3.census;
  var big = A3.groups.slice().sort(function (a, b) { return b.count - a.count; });
  var h = '<div class="cd-h">SAILING DIRECTIONS</div><ul>';
  h += '<li>The chart is two archipelagos and no continent: the <i>Contentian Chain</i> bends like a bow ' +
    'about the Publishing Sea, and the <i>Nubilian Crescent</i> answers it across the Deployment Passage.</li>';
  h += '<li>The ferry of the Passage is bundled from <b>' + C.crossEdges +
    '</b> true crossings between the two products.</li>';
  h += '<li>Largest ground of all: the <i>' + esc(big[0].name) + '</i>, ' + esc(big[0].sec) +
    ', <b>' + big[0].count + '</b> pages; then the <i>' + esc(big[1].name) + '</i>, <b>' + big[1].count + '</b>.</li>';
  h += '<li>The wind is the citation itself: it blows out of the pages that cite, into the pages cited.</li>';
  h += '<li>The ladder: the wheel steps one rung, the brass plaque holds the minus and the plus, ' +
    'and the keys <b>+</b> and <b>&minus;</b> answer the same.</li>';
  h += '</ul>';
  var home = world.bySlug.get(world.island.slug);
  if (home && typeof eggs !== 'undefined' && eggs.ready) {
    var brgFrom = function (o, E) { return compassPoint(norm360(Math.atan2(E.x - o.pos.x, -(E.y - o.pos.y)) * 180 / Math.PI)); };
    var nmFrom = function (o, E) { return Math.hypot(E.x - o.pos.x, E.y - o.pos.y) * world.nmPerUnit; };
    var distWords = function (nm) {
      return nm < 0.38 ? 'a quarter-mile' : nm < 0.75 ? 'a half-mile' : nm < 1.5 ? 'a mile' :
        numToWords(Math.round(nm)) + ' miles';
    };
    var R = [];
    if (eggs.bottle) R.push('Flotsam bobs ' + distWords(nmFrom(home, eggs.bottle)) + ' <b>' +
      brgFrom(home, eggs.bottle) + '</b> of the home anchorage - some say it carries a printed page.');
    if (eggs.shore) R.push('<b>' + brgFrom(home, eggs.shore) + '</b> of the home water lies a coast the sun is said never to come off, lit terrace by terrace at the hour we would be shortening sail.');
    if (eggs.city) R.push('Far to the <b>' + brgFrom(home, eggs.city) + '</b> lies an isle no chart of ours will name.');
    if (eggs.pathIsle) R.push('From the anchorage at the <i>' + esc(eggs.pathIsle.title) + '</i> a path climbs the cliff.');
    R.push('On clear nights one star does not keep station - watch it through the glass.');
    R.push('Keepers of the log report a pressed flower that was never theirs.');
    h += '<div class="cd-h cd-rum-h">RUMORS OF OTHER WATERS</div><ul class="cd-rum">';
    for (var i = 0; i < R.length; i++) h += '<li>' + R[i] + '</li>';
    h += '</ul>';
  }
  return h;
}

function showChartInfo() {
  var box = $('chartinfo');
  if (!box) return;
  var C = A3.census;
  box.querySelector('.ci-name').textContent = 'The two great chains';
  box.querySelector('.ci-line').textContent = fog.mode === 'known'
    ? 'THE KNOWN CHART: drawn by your own voyages - ' + fogSeenCount() + ' of ' + C.islands +
      ' waters surveyed; the rest lie under the fog, by report only.'
    : 'Two archipelagos, ' + C.groups.length + ' island groups, all ' + C.islands +
      ' pages on the one sheet. Hover any island for her name and bearing.';
  box.querySelector('.ci-act').textContent =
    'Click an island to make the passage · Shift-click to shape a course.';
}

function fillChartTip(m) {
  var tip = $('charttip');
  if (!tip) return;
  updateStormGlass();
  var isle = m.isle, o = isle.a3;
  var brg = bearingTo(isle), nm = distToNm(isle);
  var coord = compassPoint(brg) + ' · ' + (nm >= 9.95 ? String(Math.round(nm)) : nm.toFixed(1)) + ' nm';
  var kindLine;
  if (!o || !o.group) kindLine = 'off soundings';
  else {
    var rank = o.seated ? 'seated capital of her chain' : o.rank;
    kindLine = (o.spineIsle ? 'the spine isle of ' : 'of ') + o.group.name +
      ' · ' + o.group.sec + ' · ' + rank;
  }
  tip.innerHTML =
    '<div class="ct-name">' + esc(isle.title) + '</div>' +
    '<div class="ct-kind">' + esc(kindLine) + '</div>' +
    '<div class="ct-coord"><b>' + coord + '</b> from the ship</div>' +
    '<div class="ct-datum">' + commas(isle.words) + ' words · ' +
      (isle.inbound ? isle.inbound + (isle.inbound === 1 ? ' citation in' : ' citations in') : 'no citation in') +
      (visit.charted.has(isle.slug) ? ' · read this visit' : '') + '</div>';
  tip.hidden = false;
}

/* ============================================================
   THE VISIT, THE ROUTES, THE CAT: all of them follow the warp
   ============================================================ */
function drawChartVisit(g) {
  var Z = chart.z, TXv = chart.tx, TYv = chart.ty;
  var VV = function (p) { return [p[0] * Z + TXv, p[1] * Z + TYv]; };
  drawSoundings(g);
  drawRoutes(g, VV);
  var i, p;
  if (visit.track.length > 1) {
    g.strokeStyle = RED + '0.72)';
    g.lineWidth = 1.4;
    g.setLineDash([4, 3.5]);
    g.beginPath();
    var started = false;
    for (i = 0; i < visit.track.length; i++) {
      var t = visit.track[i];
      p = VV(chartProject(t.x, t.y));
      if (!started) { g.moveTo(p[0], p[1]); started = true; } else g.lineTo(p[0], p[1]);
    }
    g.stroke();
    g.setLineDash([]);
  }
  /* an X at every island already read */
  g.strokeStyle = RED + '0.88)'; g.lineWidth = 1.5;
  visit.charted.forEach(function (slug) {
    var I = world.bySlug.get(slug);
    if (!I) return;
    var x, y;
    if (I.cx != null) { x = I.cx; y = I.cy; }
    else { var q = chartProject(I.pos.x, I.pos.y); x = q[0]; y = q[1]; }
    x = x * Z + TXv; y = y * Z + TYv;
    var r = 4.2;
    g.beginPath();
    g.moveTo(x - r, y - r); g.lineTo(x + r, y + r);
    g.moveTo(x + r, y - r); g.lineTo(x - r, y + r);
    g.stroke();
  });
  /* the ship, where she swims, with her heading */
  var sp = VV(chartProject(ship.x, ship.y));
  g.save();
  g.translate(sp[0], sp[1]);
  g.fillStyle = 'rgba(243,234,212,0.80)';
  g.beginPath(); g.ellipse(0, 0, 13, 11, 0, 0, TAU); g.fill();
  g.rotate((ship.bearing + 90) * Math.PI / 180);
  g.strokeStyle = RED + '0.95)';
  g.fillStyle = 'rgba(248,241,224,0.95)';
  g.lineWidth = 1.15;
  g.beginPath();
  g.moveTo(-5.4, 3.2);
  g.quadraticCurveTo(0, 8.6, 5.4, 3.2);
  g.lineTo(4.2, 0.6); g.lineTo(-4.2, 0.6);
  g.closePath(); g.fill(); g.stroke();
  g.beginPath();
  g.moveTo(-1.6, 0.6); g.lineTo(-1.6, -8.2);
  g.moveTo(2.2, 0.6); g.lineTo(2.2, -5.6);
  g.moveTo(-4.4, 2.0); g.lineTo(-9.2, -0.6);
  g.stroke();
  g.fillStyle = RED + '0.42)';
  g.beginPath();
  g.moveTo(-1.2, -7.6); g.quadraticCurveTo(4.6, -5.2, 3.0, -1.2); g.lineTo(-1.2, -1.2);
  g.closePath(); g.fill(); g.stroke();
  g.beginPath();
  g.moveTo(2.6, -5.2); g.quadraticCurveTo(6.6, -3.4, 5.4, -0.4); g.lineTo(2.6, -0.4);
  g.closePath(); g.fill(); g.stroke();
  g.restore();
}

function a3Seat(I) {
  if (I && I.cx != null) return [I.cx, I.cy];
  return chartProject(I.pos.x, I.pos.y);
}
function drawRoutes(g, VV) {
  if (!visit.routes.length) return;
  g.save();
  var seen2 = new Set();
  for (var r = 0; r < visit.routes.length; r++) {
    var R = visit.routes[r];
    var key = R.a + '>' + R.b;
    if (seen2.has(key)) continue;
    seen2.add(key);
    var A = world.bySlug.get(R.a), B2 = world.bySlug.get(R.b);
    if (!A || !B2) continue;
    var pa = VV(a3Seat(A)), pb = VV(a3Seat(B2));
    var mx = (pa[0] + pb[0]) / 2, my = (pa[1] + pb[1]) / 2;
    var dx2 = pb[0] - pa[0], dy2 = pb[1] - pa[1];
    var dd = Math.hypot(dx2, dy2) || 1;
    var nx = -dy2 / dd, ny = dx2 / dd;
    var bow = Math.min(34, dd * 0.14);
    var cx2 = mx + nx * bow, cy2 = my + ny * bow;
    g.strokeStyle = GRN + '0.72)';
    g.lineWidth = 1.25;
    g.setLineDash([7, 3.2]);
    g.beginPath();
    g.moveTo(pa[0], pa[1]);
    g.quadraticCurveTo(cx2, cy2, pb[0], pb[1]);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = GRN + '0.85)';
    g.beginPath(); g.arc(pa[0], pa[1], 2.1, 0, TAU); g.fill();
    var ang = Math.atan2(pb[1] - cy2, pb[0] - cx2);
    g.beginPath();
    g.moveTo(pb[0], pb[1]);
    g.lineTo(pb[0] - Math.cos(ang - 0.42) * 7.5, pb[1] - Math.sin(ang - 0.42) * 7.5);
    g.lineTo(pb[0] - Math.cos(ang + 0.42) * 7.5, pb[1] - Math.sin(ang + 0.42) * 7.5);
    g.closePath(); g.fill();
    var nm = routeName(R.a, R.b);
    if (nm && (chart.z >= 1.6 || dd > 300)) {
      g.save();
      g.translate((mx + cx2) / 2, (my + cy2) / 2);
      var rot = Math.atan2(dy2, dx2);
      if (rot > Math.PI / 2) rot -= Math.PI;
      if (rot < -Math.PI / 2) rot += Math.PI;
      g.rotate(rot);
      g.font = 'italic 10.5px ' + A3_FONT;
      g.fillStyle = GRN + '0.92)';
      g.textAlign = 'center';
      g.fillText(nm, 0, -4);
      g.restore();
    }
  }
  g.restore();
}

function placeChartCat() {
  var el = $('chartcat');
  if (!el || !chart.layoutView) return;
  var I = catHomeIsle();
  cat.home = I ? I.slug : null;
  if (!I) { el.style.display = 'none'; return; }
  var L = chart.layoutView;
  var p = a3Seat(I);
  var x = clamp((p[0] * L.z + L.tx) * L.S + L.dx + 26 * L.S, 60, 1400 * L.S + L.dx - 60);
  var y = clamp((p[1] * L.z + L.ty) * L.S + L.dy - 20 * L.S, 46, 810 * L.S + L.dy - 40);
  el.style.display = 'block';
  el.style.left = x.toFixed(1) + 'px';
  el.style.top = y.toFixed(1) + 'px';
  drawChartCat();
  diag.chartCat = { near: cat.home, x: Math.round(x), y: Math.round(y) };
}

/* ---------------- the fog, over the warped ground ---------------- */
function fogRumorAt(sx, sy) {
  if (fog.mode !== 'known') return false;
  var w = chartUnproject(sx, sy);
  return !fogSeenAt(w[0], w[1]);
}
function a3ChainSeat(key) {
  var C = A3.chains[key === 'cms' ? 'chain' : 'crescent'];
  return [C.x, C.y];
}
function rebuildFog() {
  if (!fog.ready || !chart.geo) return;
  fog.dirty = false;
  bakeFogStamps();
  var dpr = Math.min(chart.dpr || 1, 2);
  if (!fog.washCv) fog.washCv = fogCanvas(CHART_W * dpr, CHART_H * dpr);
  {
    var g = fog.washCv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, CHART_W, CHART_H);
    g.save();
    g.beginPath(); pathThrough(g, fogVellumPts(), true); g.clip();
    g.fillStyle = 'rgba(238,229,207,0.86)';
    g.fillRect(0, 0, CHART_W, CHART_H);
    g.strokeStyle = INK + '0.045)';
    g.lineWidth = 0.7;
    g.beginPath();
    for (var x = -CHART_H; x < CHART_W; x += 11) { g.moveTo(x, 0); g.lineTo(x + CHART_H, CHART_H); }
    g.stroke();
    var hole = fogHole();
    g.globalCompositeOperation = 'destination-out';
    var cellPx = fog.cu * chart.k;
    var hr = Math.max(7, cellPx * 1.65);
    fog.seen.forEach(function (k) {
      var gy = Math.floor(k / fog.cols), gx = k - gy * fog.cols;
      var wx = fog.gx0 + (gx + 0.5) * fog.cu, wy = fog.gy0 + (gy + 0.5) * fog.cu;
      var p = chartProject(wx, wy);
      if (p[0] < -40 || p[0] > CHART_W + 40 || p[1] < -40 || p[1] > CHART_H + 40) return;
      g.drawImage(hole, p[0] - hr, p[1] - hr, hr * 2, hr * 2);
    });
    g.globalCompositeOperation = 'source-over';
    g.font = 'italic 15px ' + A3_FONT;
    g.fillStyle = INK + '0.42)';
    g.textAlign = 'center';
    ['cms', 'cloud'].forEach(function (key) {
      var anySeen = world.islands.some(function (I) { return I.product === key && isleSeen(I); });
      if (anySeen) return;
      var s = a3ChainSeat(key);
      g.fillText('by report only', s[0], s[1] + 34);
    });
    g.restore();
  }
  /* the banks: engraved cloud over the unknown, each with its own wind */
  fog.puffs = [];
  var step = 27;
  var rnd = rngFor('fogfield');
  for (var sy = 24; sy < CHART_H - 18; sy += step) {
    for (var sx = 24; sx < CHART_W - 18; sx += step) {
      var jx = sx + (rnd() - 0.5) * 14, jy = sy + (rnd() - 0.5) * 12;
      var onFurn = false;
      for (var q = 0; q < FURN.length; q++) {
        var R = FURN[q];
        if (jx > R.x - 8 && jx < R.x + R.w + 8 && jy > R.y - 8 && jy < R.y + R.h + 8) { onFurn = true; break; }
      }
      if (onFurn) continue;
      var w2 = chartUnproject(jx, jy);
      if (fogSeenAt(w2[0], w2[1])) continue;
      var wnd = windAtUnits(w2[0], w2[1]);
      var wm = Math.hypot(wnd.x, wnd.y) || 1;
      fog.puffs.push({ x: jx, y: jy, s: 0.55 + rnd() * 0.75, v: Math.floor(rnd() * 3),
        wx: wnd.x / wm, wy: wnd.y / wm, ph: rnd() });
    }
  }
  var dmin = 1e9, dmax = -1e9, P;
  for (var i2 = 0; i2 < fog.puffs.length; i2++) {
    P = fog.puffs[i2];
    P.dd = P.x * P.wx + P.y * P.wy;
    if (P.dd < dmin) dmin = P.dd;
    if (P.dd > dmax) dmax = P.dd;
  }
  var span = Math.max(1, dmax - dmin);
  for (var i3 = 0; i3 < fog.puffs.length; i3++) fog.puffs[i3].dd = 1 - (fog.puffs[i3].dd - dmin) / span;
  if (!fog.puffCv) fog.puffCv = fogCanvas(CHART_W * dpr, CHART_H * dpr);
  {
    var g2 = fog.puffCv.getContext('2d');
    g2.setTransform(dpr, 0, 0, dpr, 0, 0);
    g2.clearRect(0, 0, CHART_W, CHART_H);
    g2.save();
    g2.beginPath(); pathThrough(g2, fogVellumPts(), true); g2.clip();
    for (var i4 = 0; i4 < fog.puffs.length; i4++) fogStampPuff(g2, fog.puffs[i4], 1);
    g2.restore();
  }
  diag.fogPuffs = fog.puffs.length;
}
