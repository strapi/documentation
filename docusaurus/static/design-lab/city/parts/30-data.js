  function buildAdj() {
    var seen = {};
    G.edges.forEach(function (e) {
      var k = e[0] + ' ' + e[1];
      if (seen[k]) return; seen[k] = 1;
      (adjOut[e[0]] || (adjOut[e[0]] = [])).push(e[1]);
      (adjIn[e[1]] || (adjIn[e[1]] = [])).push(e[0]);
    });
  }

  /* --------------------------------------------------------- classify
     Archetype is read from the blocks a page actually contains. Tier is read
     from how many other pages cite it. Neither is hashed or invented. */
  function blockCensus(p) {
    var c = { code: 0, endpoint: 0, table: 0, ol: 0, ul: 0, img: 0, adm: 0, tabs: 0, h: 0 };
    (function walk(bs) {
      if (!bs) return;
      for (var i = 0; i < bs.length; i++) {
        var b = bs[i];
        if (b.t === 'code') c.code++;
        else if (b.t === 'endpoint') c.endpoint++;
        else if (b.t === 'table') c.table++;
        else if (b.t === 'ol') { c.ol++; walkItems(b.items); }
        else if (b.t === 'ul') { c.ul++; walkItems(b.items); }
        else if (b.t === 'img') c.img++;
        else if (b.t === 'admonition') { c.adm++; walk(b.blocks); }
        else if (b.t === 'details') walk(b.blocks);
        else if (b.t === 'tabs') { c.tabs++; for (var j = 0; j < b.tabs.length; j++) walk(b.tabs[j].blocks); }
        else if (b.t === 'columns') { for (var m = 0; m < b.cols.length; m++) walk(Array.isArray(b.cols[m]) ? b.cols[m] : b.cols[m].blocks); }
        else if (b.t.charAt(0) === 'h') c.h++;
      }
      function walkItems(items) {
        for (var q = 0; q < items.length; q++) if (items[q] && items[q].blocks) walk(items[q].blocks);
      }
    })(p.blocks);
    return c;
  }

  function archetypeOf(slug, p, c, inb, code, words) {
    if (slug.indexOf('/migration/') >= 0 || slug.indexOf('/upgrades') >= 0 || p.section === 'Upgrades') return 'scaffold';
    if (c.endpoint > 0) return 'tower';
    if (c.ol >= 2) return 'workshop';
    if (c.table >= 2 && c.table * 2 >= code) return 'records';
    if (code >= 4) return 'tower';
    if (code === 0 && inb >= 5) return 'civic';
    if (code === 0) return 'garden';
    if (words < 700) return 'shed';
    return 'tower';
  }
  function tierOf(inb) { return inb === 0 ? 0 : inb <= 2 ? 1 : inb <= 5 ? 2 : inb <= 11 ? 3 : inb <= 24 ? 4 : 5; }

  function classify() {
    Object.keys(pages).forEach(function (s) {
      var p = pages[s];
      var c = blockCensus(p);
      var inb = G.inbound[s] || 0, outb = G.outbound[s] || 0;
      var code = G.code[s] || 0, words = G.words[s] || 0;
      rec[s] = {
        slug: s, p: p, cen: c, inb: inb, outb: outb, code: code, words: words,
        arch: archetypeOf(s, p, c, inb, code, words),
        tier: tierOf(inb),
        derelict: inb === 0,
        h32: hash32(s)
      };
    });
  }

  /* ----------------------------------------------------------- layout
     The quarter is a grid of lots at pitch P, gathered into superblocks of
     four, with a street inserted between superblocks rather than a whole row
     of lots given up to it. That is what makes the model densely built: the
     ground between the buildings is street width, not block width. */
  function gpos(c) { return c * P + Math.floor(c / 4) * SW; }
  function sblk(c) { return Math.floor(c / 4); }
  function buildable() { return true; }

  function localLayout(d) {
    /* Superblocks of 3x3 lots separated by street lines on every 4th grid line.
       A plaza is held open at the centre; the hub fronts it from the north.
       Members are placed outward in order of how often they are cited, so
       majesty falls away toward the edge of the quarter. */
    /* Only a quarter with enough pages to justify one keeps a plaza open at
       its centre; a three-page community is a courtyard, not a piazza. */
    var occ = {}, i, pr = d.members.length >= 14 ? 1 : 0;
    for (i = -pr; i <= pr; i++) for (var j = -pr; j <= pr; j++) occ[i + ',' + j] = 'plaza';
    d.plaza = { cx: 0, cy: 0, r: pr };

    var cand = [], R = Math.max(6, Math.ceil(sqrt(d.members.length) * 1.35) + 5);
    for (var x = -R; x <= R; x++) for (var y = -R; y <= R; y++) {
      if (!buildable(x, y)) continue;
      cand.push({ cx: x, cy: y, dd: x * x + y * y + (Math.atan2(y, x) + PI) * 1e-4 });
    }
    cand.sort(function (a, b) { return a.dd - b.dd; });

    var ms = d.members.slice().sort(function (a, b) {
      var ra = rec[a], rb = rec[b];
      if (rb.inb !== ra.inb) return rb.inb - ra.inb;
      if (rb.words !== ra.words) return rb.words - ra.words;
      return a < b ? -1 : 1;
    });
    var hubIx = ms.indexOf(d.hub);
    if (hubIx > 0) { ms.splice(hubIx, 1); ms.unshift(d.hub); }

    d.lots = [];
    var ci = 0;
    ms.forEach(function (slug, idx) {
      var r = rec[slug];
      var sz = r.derelict ? 1 : r.tier >= 5 ? 3 : r.tier >= 4 ? 2 : 1;
      var sw = sz, sd = sz >= 3 ? 3 : sz;
      if (!r.derelict && (r.tier === 2 || r.tier === 3)) { sw = 2; sd = 1; }
      var anchor = null, k;
      if (idx === 0) {
        var hx2 = -Math.floor((sw - 1) / 2), hy = -pr - sd;
        if (fits(hx2, hy, sw, sd, occ)) anchor = { cx: hx2, cy: hy };
      }
      if (!anchor) {
        for (k = ci; k < cand.length; k++) {
          if (fits(cand[k].cx, cand[k].cy, sw, sd, occ)) { anchor = cand[k]; break; }
        }
      }
      if (!anchor) anchor = { cx: R + 2 + idx, cy: R + 2 };
      for (var a = 0; a < sw; a++) for (var b = 0; b < sd; b++) occ[(anchor.cx + a) + ',' + (anchor.cy + b)] = slug;
      while (ci < cand.length && occ[cand[ci].cx + ',' + cand[ci].cy]) ci++;
      var lx = gpos(anchor.cx) + sw * P / 2, ly = gpos(anchor.cy) + sd * P / 2;
      var lot = { slug: slug, cx: anchor.cx, cy: anchor.cy, sw: sw, sd: sd, x: lx, y: ly, d: d };
      d.lots.push(lot); r.lot = lot;
    });

    var rad = 0;
    d.lots.forEach(function (l) {
      rad = Math.max(rad, sqrt(l.x * l.x + l.y * l.y) + Math.max(l.sw, l.sd) * P * 0.7);
    });
    d.r = Math.max(rad, 1.3 * P) + 7;
  }
  function fits(cx, cy, sw, sd, occ) {
    /* a big building takes a whole superblock: it never straddles a street */
    if (sblk(cx) !== sblk(cx + sw - 1) || sblk(cy) !== sblk(cy + sd - 1)) return false;
    for (var a = 0; a < sw; a++) for (var b = 0; b < sd; b++) {
      if (occ[(cx + a) + ',' + (cy + b)]) return false;
    }
    return true;
  }

  function layout() {
    var memberOf = {};
    COM.forEach(function (c, i) { c.members.forEach(function (m) { if (pages[m]) memberOf[m] = i; }); });

    dists = COM.map(function (c, i) {
      var hub = pages[c.hub] ? c.hub : c.members[0];
      return {
        i: i, size: c.size, purity: c.purity, dominant: c.dominant, hub: hub,
        members: c.members.filter(function (m) { return pages[m]; }),
        name: title(pages[hub]).toUpperCase(), orphan: false
      };
    });
    var loose = Object.keys(pages).filter(function (s) { return memberOf[s] === undefined; }).sort();
    if (loose.length) {
      dists.push({
        i: dists.length, size: loose.length, purity: 0, dominant: 'unfiled',
        hub: loose[0], members: loose, name: 'UNLINKED GROUND', orphan: true
      });
      loose.forEach(function (s) { memberOf[s] = dists.length - 1; });
    }
    dists.forEach(function (d) { d.members.forEach(function (m) { rec[m].dist = d; }); });

    /* purity decides the morphology of the quarter: a pure quarter is laid out
       square to the compass, a mixed one is skewed off the city grid. */
    dists.forEach(function (d, i) {
      var sgn = (i % 2) ? 1 : -1;
      d.rot = d.orphan ? sgn * 7 : d.purity >= 0.8 ? 0 : d.purity >= 0.55 ? sgn * 6 : sgn * 14;
      d.mixed = !d.orphan && d.purity < 0.55;
      localLayout(d);
    });

    var W = {};
    G.edges.forEach(function (e) {
      var a = memberOf[e[0]], b = memberOf[e[1]];
      if (a === undefined || b === undefined || a === b) return;
      var k = Math.min(a, b) + ':' + Math.max(a, b);
      W[k] = (W[k] || 0) + 1;
    });
    var pairs = Object.keys(W).map(function (k) {
      var t = k.split(':'); return { a: +t[0], b: +t[1], w: W[k] };
    });

    var byBig = dists.slice().sort(function (a, b) { return b.size - a.size; });
    byBig.forEach(function (d, i) {
      var a = i * 2.399963, rr = 104 * sqrt(i);
      d.x = cos(a) * rr; d.y = sin(a) * rr * 0.82;
    });
    var GAPD = 13, it, k2;
    for (it = 0; it < 620; it++) {
      for (k2 = 0; k2 < pairs.length; k2++) {
        var pr = pairs[k2], A = dists[pr.a], Bd = dists[pr.b];
        var dx = Bd.x - A.x, dy = Bd.y - A.y, dd = sqrt(dx * dx + dy * dy) || 1;
        var target = A.r + Bd.r + GAPD;
        if (dd > target) {
          var f = Math.min(0.010 * pr.w * (dd - target), 5);
          A.x += dx / dd * f; A.y += dy / dd * f; Bd.x -= dx / dd * f; Bd.y -= dy / dd * f;
        }
      }
      for (var a1 = 0; a1 < dists.length; a1++) for (var b1 = a1 + 1; b1 < dists.length; b1++) {
        var Da = dists[a1], Db = dists[b1];
        var ex = Db.x - Da.x, ey = Db.y - Da.y, ed = sqrt(ex * ex + ey * ey) || 1;
        var need = Da.r + Db.r + GAPD;
        if (ed < need) {
          var push = (need - ed) / 2;
          Da.x -= ex / ed * push; Da.y -= ey / ed * push;
          Db.x += ex / ed * push; Db.y += ey / ed * push;
        }
      }
      for (var g = 0; g < dists.length; g++) { dists[g].x *= 0.9985; dists[g].y *= 0.9985; }
    }
    var orph = dists[dists.length - 1];
    if (orph.orphan) {
      var far = 0;
      dists.forEach(function (d) { if (!d.orphan) far = Math.max(far, sqrt(d.x * d.x + d.y * d.y) + d.r); });
      var ang = 2.55;
      orph.x = cos(ang) * (far + orph.r + 30); orph.y = sin(ang) * (far + orph.r + 30) * 0.8;
    }
    dists.forEach(function (d) { d.x = Math.round(d.x / 13) * 13; d.y = Math.round(d.y / 13) * 13; });

    dists.forEach(function (d) {
      var a = d.rot * PI / 180, ca = cos(a), sa = sin(a);
      d.ca = ca; d.sa = sa;
      d.lots.forEach(function (l) {
        l.wx = d.x + l.x * ca - l.y * sa;
        l.wy = d.y + l.x * sa + l.y * ca;
      });
    });

    buildStreets(memberOf, pairs);
    buildRiver(memberOf);

    var minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
    dists.forEach(function (d) {
      minx = Math.min(minx, d.x - d.r); maxx = Math.max(maxx, d.x + d.r);
      miny = Math.min(miny, d.y - d.r); maxy = Math.max(maxy, d.y + d.r);
    });
    bounds.cx = (minx + maxx) / 2; bounds.cy = (miny + maxy) / 2;
    bounds.r = Math.max(maxx - minx, maxy - miny) / 2;
  }

  function buildStreets(memberOf, pairs) {
    highways = pairs.map(function (pr) {
      return { a: dists[pr.a], b: dists[pr.b], w: pr.w };
    }).sort(function (x, y) { return x.w - y.w; });

    var seen = {};
    lanes = [];
    G.edges.forEach(function (e) {
      var ra = rec[e[0]], rb = rec[e[1]];
      if (!ra || !rb || !ra.lot || !rb.lot || ra.dist !== rb.dist) return;
      var k = e[0] < e[1] ? e[0] + '|' + e[1] : e[1] + '|' + e[0];
      if (seen[k]) { seen[k].w++; return; }
      var A = ra.lot, Bo = rb.lot, d = ra.dist;
      var sx = gpos(Math.round(((A.cx + Bo.cx) / 2) / 4) * 4) - SW / 2;
      var sy = gpos(Math.round(((A.cy + Bo.cy) / 2) / 4) * 4) - SW / 2;
      var loc = [[A.x, A.y], [sx, A.y], [sx, sy], [Bo.x, sy], [Bo.x, Bo.y]];
      var wpts = loc.map(function (q) {
        return [d.x + q[0] * d.ca - q[1] * d.sa, d.y + q[0] * d.sa + q[1] * d.ca];
      });
      var lane = { d: d, w: 1, pts: wpts };
      seen[k] = lane; lanes.push(lane);
    });
  }

  function buildRiver(memberOf) {
    /* the reading order, as water. Its course follows the sequence in which
       bundle.order first enters each district; it widens downstream. */
    var first = [], seenD = {};
    for (var i = 0; i < order.length; i++) {
      var di = memberOf[order[i]];
      if (di === undefined || seenD[di]) continue;
      seenD[di] = 1; first.push(dists[di]);
    }
    var way = [];
    for (var j = 0; j < first.length - 1; j++) {
      var A = first[j], Bd = first[j + 1];
      var mx = (A.x + Bd.x) / 2, my = (A.y + Bd.y) / 2;
      way.push({ x: mx, y: my, t: (j + 1) / first.length, a: A, b: Bd });
    }
    for (var it = 0; it < 90; it++) {
      for (var k = 0; k < way.length; k++) {
        for (var q = 0; q < dists.length; q++) {
          var d = dists[q];
          var dx = way[k].x - d.x, dy = way[k].y - d.y, dd = sqrt(dx * dx + dy * dy) || 1;
          var need = d.r + 18;
          if (dd < need) { way[k].x += dx / dd * (need - dd) * 0.5; way[k].y += dy / dd * (need - dd) * 0.5; }
        }
      }
      for (var m = 1; m < way.length - 1; m++) {
        way[m].x = way[m].x * 0.86 + (way[m - 1].x + way[m + 1].x) * 0.07;
        way[m].y = way[m].y * 0.86 + (way[m - 1].y + way[m + 1].y) * 0.07;
      }
    }
    river.way = way;
    river.pts = catmull(way, 12);
    river.bridges = way.map(function (w) { return { x: w.x, y: w.y, t: w.t }; });

    /* a banked polygon, widening downstream */
    var L = river.pts.length, left = [], right = [];
    for (var n = 0; n < L; n++) {
      var p0 = river.pts[Math.max(0, n - 1)], p1 = river.pts[Math.min(L - 1, n + 1)];
      var tx = p1.x - p0.x, ty = p1.y - p0.y, tl = sqrt(tx * tx + ty * ty) || 1;
      var nx = -ty / tl, ny = tx / tl;
      var tp = Math.min(n, L - 1 - n) / (L * 0.10);
      if (tp > 1) tp = 1;
      tp = tp * tp * (3 - 2 * tp);
      var w = (13 + 27 * (river.pts[n].t || 0)) * (0.06 + 0.94 * tp);
      left.push([river.pts[n].x + nx * w, river.pts[n].y + ny * w]);
      right.push([river.pts[n].x - nx * w, river.pts[n].y - ny * w]);
    }
    river.poly = left.concat(right.reverse());
  }

  function catmull(pts, seg) {
    if (pts.length < 2) return pts.map(function (p) { return { x: p.x, y: p.y, t: p.t || 0 }; });
    var out = [], i, j;
    for (i = 0; i < pts.length - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (j = 0; j < seg; j++) {
        var t = j / seg, t2 = t * t, t3 = t2 * t;
        out.push({
          x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
          t: (p1.t || 0) + ((p2.t || 0) - (p1.t || 0)) * t
        });
      }
    }
    var last = pts[pts.length - 1];
    out.push({ x: last.x, y: last.y, t: last.t || 1 });
    return out;
  }
