/* Strapi Documentation — the city at golden hour.

   Painted on a 2D canvas as a painter would paint it: per-face shading, a low
   amber key light, long violet shadows, and atmospheric perspective that lifts
   every distant thing toward the haze.

   The measurements underneath are unchanged and none of them are invented:
   districts are the Louvain link communities, a building's archetype is read
   from the blocks the page actually contains, its majesty from how many pages
   cite it, the river is bundle.order, the streets are the citations. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = function () { return RM.matches; };
  var PI = Math.PI, cos = Math.cos, sin = Math.sin, sqrt = Math.sqrt, abs = Math.abs;
  var TAU = PI * 2;

  /* ------------------------------------------------------------ utils */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var attr = esc;
  function nfmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pad3(n) { return ('00' + n).slice(-3); }
  function stripTags(h) {
    return String(h || '').replace(/<[^>]*>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  var SITE_SUFFIX = /\s*[-|]\s*Strapi\s+(Developer\s+)?(Docs|Documentation)\s*$/i;
  function title(p) { return p.title.replace(SITE_SUFFIX, ''); }

  /* deterministic per-slug jitter, so the city is varied but never random */
  function hash32(s) {
    var h = 2166136261, i;
    for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h >>> 0;
  }
  function rnd01(h, k) { var x = (h ^ (k * 2654435761)) >>> 0; x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }

  /* colour */
  function hx(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function lit(c, f) { return [clamp(c[0] * f, 0, 255), clamp(c[1] * f, 0, 255), clamp(c[2] * f, 0, 255)]; }
  function rgbs(c) { return 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')'; }
  function rgbas(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')'; }

  /* Inline <img> inside html fields: local files are served beside us and are
     shown for real; anything remote is named, never fetched. */
  var IMG_RE = /<img\b[^>]*>/gi;
  var SRC_RE = /src\s*=\s*("([^"]*)"|'([^']*)')/i;
  var ALT_RE = /alt\s*=\s*("([^"]*)"|'([^']*)')/i;
  function fixHtml(h) {
    if (!h) return '';
    if (h.indexOf('<img') < 0) return h;
    return h.replace(IMG_RE, function (m) {
      var sm = SRC_RE.exec(m), am = ALT_RE.exec(m);
      var src = sm ? (sm[2] != null ? sm[2] : sm[3]) : '';
      var alt = (am ? (am[2] != null ? am[2] : am[3]) : '') || 'image';
      if (src && src.charAt(0) === '/') {
        return '<img src="' + attr(src) + '" alt="' + attr(alt) + '" loading="lazy" decoding="async" class="ii">';
      }
      return '<span class="imgx">' + esc(alt) + '</span>';
    });
  }

  /* ---------------------------------------------------------- palette */
  var C = {
    sun:    hx('#FFB25A'),
    glow:   hx('#FF7E6B'),
    skyLo:  hx('#F2A66B'),
    skyHi:  hx('#14464F'),
    haze:   hx('#C9A38A'),
    shadow: hx('#2A2E63'),
    earth:  hx('#6B5B4E'),
    earthHi:hx('#8A7461'),
    water:  hx('#1E7F86'),
    jade:   hx('#2F6B4A'),
    jadeHi: hx('#63A56F'),
    lit:    hx('#FFD9A0'),
    unlit:  hx('#3B4A6B'),
    ink:    hx('#17131F')
  };

  /* Materials, keyed by archetype. A tinted material, not a poster:
     base is the body colour, k is how greedily the surface takes the key
     light, win says the facade carries glass. */
  var ARCH = {
    tower:    { name: 'Tower',      what: 'code and endpoints',   mat: 'glass and steel',  base: '#22415F', k: 0.50, win: 1, gl: 1, chip: '#5D7FA6' },
    workshop: { name: 'Workshop',   what: 'step by step',         mat: 'brick',            base: '#A33422', k: 0.42, win: 0, gl: 0, chip: '#C0523A' },
    records:  { name: 'Records',    what: 'tables and config',    mat: 'concrete',         base: '#907C6E', k: 0.40, win: 0, gl: 0, chip: '#B39A8B' },
    civic:    { name: 'Monument',   what: 'cited concepts',       mat: 'bone stone',       base: '#E0C79E', k: 0.48, win: 0, gl: 0, chip: '#EBD6B2' },
    scaffold: { name: 'Scaffolded', what: 'migration pages',      mat: 'rusted frame',     base: '#B4531F', k: 0.46, win: 0, gl: 0, chip: '#CE7440' },
    shed:     { name: 'Shed',       what: 'short stubs',          mat: 'rusted metal',     base: '#87462F', k: 0.44, win: 0, gl: 0, chip: '#A45E42' },
    garden:   { name: 'Planted',    what: 'prose, no code',       mat: 'jade canopy',      base: '#2F6B4A', k: 0.46, win: 0, gl: 0, chip: '#3E8A5E' }
  };
  var ARCH_ORDER = ['tower', 'workshop', 'records', 'civic', 'scaffold', 'garden', 'shed'];

  /* ------------------------------------------------------------ state */
  var B = null, G = null, COM = null;
  var pages = {}, order = [], orderIx = {};
  var adjOut = {}, adjIn = {};
  var rec = {};
  var dists = [];
  var navFlat = [];
  var cur = null;
  var searchIdx = [], searchReady = false;
  var river = { pts: [], bridges: [], poly: null };
  var lanes = [], highways = [];
  var bounds = { cx: 0, cy: 0, r: 800 };

  var P = 30;                 /* lot pitch, world units */
  var GAP = 7;
  var VS = 1.85;              /* vertical exaggeration, so towers read as mass */

  var docEl, worldEl, sideEl, rbodyEl, tipEl, cv, ctx;

  /* ------------------------------------------------------------- boot */
  function boot() {
    docEl = $('#doc'); worldEl = $('#world'); sideEl = $('#side'); rbodyEl = $('#rbody');
    tipEl = $('#tip'); cv = $('#city'); ctx = cv.getContext('2d', { alpha: false });

    Promise.all([
      fetch('content.json').then(function (r) { return r.json(); }),
      fetch('graph.json').then(function (r) { return r.json(); }),
      fetch('communities.json').then(function (r) { return r.json(); })
    ]).then(function (res) {
      B = res[0]; G = res[1]; COM = res[2];
      pages = B.pages; order = B.order;
      order.forEach(function (s, i) { orderIx[s] = i; });
      $('#ver').textContent = B.version;

      buildAdj();
      classify();
      layout();

      buildNav();
      wire();
      route();                       /* reader first: content on screen fast */
      document.body.classList.remove('booting');

      requestAnimationFrame(function () {
        bakeSprites();
        bakeCity();
        bakeGround();
        resize();
        homeShot();
        buildHud();
        startLoop();
        if (cur) locate(false);
        idle(buildSearchIndex);
      });
    })['catch'](function (e) {
      document.body.classList.remove('booting');
      docEl.innerHTML = '<h1>The survey could not be loaded</h1><p>' + esc(String(e && e.message || e)) + '</p>';
    });
  }
  function idle(fn) {
    if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 1400 });
    else setTimeout(fn, 260);
  }

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

  /* ----------------------------------------------------------- layout */
  function buildable(cx, cy) { return (cx % 4 !== 0) && (cy % 4 !== 0); }

  function localLayout(d) {
    /* Superblocks of 3x3 lots separated by street lines on every 4th grid line.
       A plaza is held open at the centre; the hub fronts it from the north.
       Members are placed outward in order of how often they are cited, so
       majesty falls away toward the edge of the quarter. */
    var occ = {}, i;
    for (i = -1; i <= 1; i++) for (var j = -1; j <= 1; j++) occ[i + ',' + j] = 'plaza';
    d.plaza = { cx: 0, cy: 0, r: 1 };

    var cand = [], R = Math.max(6, Math.ceil(sqrt(d.members.length) * 2.4) + 4);
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
        var hx2 = -Math.floor((sw - 1) / 2), hy = -1 - sd;
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
      var lx = (anchor.cx + sw / 2) * P, ly = (anchor.cy + sd / 2) * P;
      var lot = { slug: slug, cx: anchor.cx, cy: anchor.cy, sw: sw, sd: sd, x: lx, y: ly, d: d };
      d.lots.push(lot); r.lot = lot;
    });

    var rad = 0;
    d.lots.forEach(function (l) {
      rad = Math.max(rad, sqrt(l.x * l.x + l.y * l.y) + Math.max(l.sw, l.sd) * P * 0.7);
    });
    d.r = Math.max(rad, 3 * P) + 14;
  }
  function fits(cx, cy, sw, sd, occ) {
    for (var a = 0; a < sw; a++) for (var b = 0; b < sd; b++) {
      if (!buildable(cx + a, cy + b)) return false;
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
      var a = i * 2.399963, rr = 118 * sqrt(i);
      d.x = cos(a) * rr; d.y = sin(a) * rr * 0.82;
    });
    var GAPD = 30, it, k2;
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
      var sx = Math.round(((A.cx + Bo.cx) / 2) / 4) * 4;
      var sy = Math.round(((A.cy + Bo.cy) / 2) / 4) * 4;
      var loc = [[A.x, A.y], [sx * P, A.y], [sx * P, sy * P], [Bo.x, sy * P], [Bo.x, Bo.y]];
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

  /* ==================================================================
     GEOMETRY — baked once. Every box below is in absolute world units,
     so a camera move never recomputes a single vertex.
     ================================================================== */
  function heightOf(r) {
    var base = [14, 25, 42, 66, 96, 116][r.tier];
    if (r.tier >= 5) base = 116 + (r.inb - 25) * 1.5;
    if (r.derelict) return (7 + Math.min(r.words, 1700) / 62) * VS;
    var wf = 0.74 + 0.52 * Math.min(1, r.words / 2600);
    return base * wf * VS;
  }

  /* lot-local massing, unchanged in spirit: majesty steps up with citations */
  function volumes(r, lot) {
    var w = lot.sw * P - GAP, d = lot.sd * P - GAP;
    var h = heightOf(r), t = r.tier, V = [];
    var a = r.arch;
    if (r.derelict) {
      var jw = 9 + rnd01(r.h32, 11) * 8, jd = 9 + rnd01(r.h32, 12) * 8;
      V.push({ x: (rnd01(r.h32, 13) - 0.5) * 6, y: (rnd01(r.h32, 14) - 0.5) * 6,
        w: Math.min(w, jw), d: Math.min(d, jd), z: 0, h: h, cls: 'body' });
      return V;
    }
    if (a === 'garden') {
      V.push({ x: 0, y: 0, w: w - 4, d: d - 4, z: 0, h: 2.6, cls: 'plinth' });
      return V;
    }
    if (a === 'tower') {
      V.push({ x: 0, y: 0, w: w, d: d, z: 0, h: h, cls: 'body' });
      if (t >= 3) V.push({ x: 0, y: 0, w: w * 0.62, d: d * 0.62, z: h, h: h * 0.34, cls: 'body' });
      if (t >= 4) V.push({ x: 0, y: 0, w: w * 0.34, d: d * 0.34, z: h * 1.34, h: h * 0.30, cls: 'body' });
      if (t >= 2) V.push({ x: 0, y: 0, w: 4.5, d: 4.5, z: h * (t >= 4 ? 1.64 : t >= 3 ? 1.34 : 1), h: h * 0.20, cls: 'mast' });
      return V;
    }
    if (a === 'workshop') {
      var bh = h * 0.66;
      V.push({ x: 0, y: 0, w: w, d: d, z: 0, h: bh, cls: 'body' });
      V.push({ x: 0, y: -d * 0.16, w: w * 0.88, d: d * 0.44, z: bh, h: h * 0.34, cls: 'body' });
      V.push({ x: w * 0.32, y: d * 0.28, w: 5, d: 5, z: bh, h: h * 0.55, cls: 'mast' });
      return V;
    }
    if (a === 'records') {
      V.push({ x: 0, y: 0, w: w + 4, d: d + 4, z: 0, h: 4, cls: 'corn' });
      V.push({ x: 0, y: 0, w: w, d: d, z: 5, h: h, cls: 'body' });
      V.push({ x: 0, y: 0, w: w + 4, d: d + 4, z: 4 + h, h: 5, cls: 'corn' });
      if (t >= 4) V.push({ x: 0, y: 0, w: w * 0.5, d: d * 0.5, z: 9 + h, h: h * 0.22, cls: 'body' });
      return V;
    }
    if (a === 'civic') {
      V.push({ x: 0, y: 0, w: w + 5, d: d + 5, z: 0, h: 6, cls: 'corn' });
      V.push({ x: 0, y: 0, w: w * 0.82, d: d * 0.82, z: 6, h: h, cls: 'body' });
      var s2 = Math.min(w, d) * 0.5;
      V.push({ x: 0, y: 0, w: s2, d: s2, z: 6 + h, h: h * 0.34, rot: 45, cls: 'body' });
      if (t >= 4) V.push({ x: 0, y: 0, w: 5, d: 5, z: 6 + h * 1.34, h: h * 0.26, cls: 'mast' });
      return V;
    }
    if (a === 'scaffold') {
      var mh = h * 0.8;
      V.push({ x: 0, y: 0, w: w, d: d, z: 0, h: mh, cls: 'body' });
      if (t >= 2) V.push({ x: 0, y: 0, w: w + 4, d: d + 4, z: mh, h: h * 0.20, cls: 'open' });
      else V.push({ x: 0, y: 0, w: w * 0.7, d: d * 0.7, z: mh, h: h * 0.14, cls: 'body' });
      if (t >= 4) {
        var cz = h * 1.1;
        V.push({ x: w * 0.42, y: d * 0.42, w: 5, d: 5, z: 0, h: cz + 34, cls: 'mast' });
        V.push({ x: w * 0.42 - w * 0.55, y: d * 0.42, w: w * 1.1, d: 4.5, z: cz + 28, h: 4.5, cls: 'mast' });
      }
      return V;
    }
    V.push({ x: 0, y: 0, w: w, d: d, z: 0, h: h, cls: 'body' });
    V.push({ x: w * 0.36, y: 0, w: w * 0.4, d: d * 0.7, z: 0, h: h * 0.6, cls: 'body' });
    return V;
  }

  var blds = [], scrub = [];
  var MATIX = {}; ARCH_ORDER.forEach(function (a, i) { MATIX[a] = i; });

  function bakeCity() {
    blds = [];
    dists.forEach(function (d) {
      d.lots.forEach(function (lot) {
        var r = rec[lot.slug];
        var V = volumes(r, lot);
        var ca = d.ca, sa = d.sa, yaw = d.rot * PI / 180;
        var boxes = [], top = 0, solid = 0;
        V.forEach(function (v) {
          var lx = lot.x + v.x, ly = lot.y + v.y;
          var wx = d.x + lx * ca - ly * sa, wy = d.y + lx * sa + ly * ca;
          boxes.push({
            cx: wx, cy: wy, hw: v.w / 2, hd: v.d / 2,
            yaw: yaw + (v.rot ? v.rot * PI / 180 : 0),
            z0: v.z, z1: v.z + v.h, cls: v.cls || 'body'
          });
          top = Math.max(top, v.z + v.h);
          if (!v.cls || v.cls === 'body' || v.cls === 'corn') solid = Math.max(solid, v.z + v.h);
        });
        var canopies = null;
        if (r.arch === 'garden') {
          canopies = [];
          var n = clamp(3 + Math.round(r.words / 460), 3, 7);
          var span = Math.min(lot.sw, lot.sd) * P - GAP;
          for (var i = 0; i < n; i++) {
            var ang = i * 2.399963 + rnd01(r.h32, i) * 0.9;
            var rad = span * 0.34 * sqrt((i + 0.5) / n);
            var lx2 = lot.x + cos(ang) * rad, ly2 = lot.y + sin(ang) * rad;
            var cr = span * (0.34 - 0.028 * i) * (0.85 + rnd01(r.h32, i + 40) * 0.4)
              * (0.8 + 0.5 * Math.min(1, r.words / 1600));
            var ch = cr * 1.02 + 5;
            canopies.push({
              x: d.x + lx2 * ca - ly2 * sa, y: d.y + lx2 * sa + ly2 * ca,
              z: ch, r: cr * 0.86
            });
            top = Math.max(top, ch + cr * 0.7);
            solid = Math.max(solid, ch);
          }
        }
        var lw = lot.sw * P - GAP, ld = lot.sd * P - GAP;
        blds.push(r);
        r.boxes = boxes;
        r.canopies = canopies;
        r.wx = lot.wx; r.wy = lot.wy;
        r.hw = lw / 2; r.hd = ld / 2; r.yaw = yaw;
        r.topz = top;
        r.solidz = solid || top;
        r.matIx = MATIX[r.arch];
        r.varIx = (r.h32 % 3);
        r.hit = [];
      });
    });

    /* riverbank scrub: soft planting that follows the water, no claim attached */
    scrub = [];
    if (river.pts.length) {
      for (var i = 3; i < river.pts.length - 3; i += 4) {
        var p0 = river.pts[i - 1], p1 = river.pts[i + 1], q = river.pts[i];
        var tx = p1.x - p0.x, ty = p1.y - p0.y, tl = sqrt(tx * tx + ty * ty) || 1;
        var nx = -ty / tl, ny = tx / tl;
        var wq = 15 + 26 * (q.t || 0);
        for (var s = -1; s <= 1; s += 2) {
          var hsd = hash32('scrub' + i + s);
          var off = wq + 8 + rnd01(hsd, 1) * 26;
          scrub.push({
            x: q.x + nx * s * off, y: q.y + ny * s * off,
            r: 9 + rnd01(hsd, 2) * 14, z: 7 + rnd01(hsd, 3) * 9
          });
        }
      }
    }
  }

  /* ==================================================================
     SPRITES — every soft thing in the scene is a baked radial sprite,
     blitted through an affine transform. No per-frame blur anywhere.
     ================================================================== */
  var SPR = {};
  function blobSprite(col, a0, pow) {
    var S = 128, c = document.createElement('canvas');
    c.width = S; c.height = S;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    for (var i = 0; i <= 10; i++) {
      var t = i / 10;
      var a = a0 * Math.pow(1 - t, pow || 2);
      grd.addColorStop(t, rgbas(col, a.toFixed(4)));
    }
    g.fillStyle = grd; g.fillRect(0, 0, S, S);
    return c;
  }
  function grainTile() {
    var S = 180, c = document.createElement('canvas');
    c.width = S; c.height = S;
    var g = c.getContext('2d'), im = g.createImageData(S, S), dt = im.data, i;
    var seed = 99;
    for (i = 0; i < S * S; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var v = 118 + ((seed >> 12) % 74);
      dt[i * 4] = v; dt[i * 4 + 1] = v; dt[i * 4 + 2] = v; dt[i * 4 + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    return c;
  }
  /* a seamless patch of ground, painted once, then laid on the plane in
     true perspective. This is what stops the earth reading as a fill. */
  function groundTile() {
    var S = 512, c = document.createElement('canvas');
    c.width = S; c.height = S;
    var g = c.getContext('2d'), i, o, j, k;
    var warm = mix(C.earthHi, C.sun, 0.42), cool = mix(mix(C.earth, C.shadow, 0.42), C.ink, 0.10);
    g.fillStyle = rgbas(mix(C.earthHi, C.sun, 0.10), 0.55);
    g.fillRect(0, 0, S, S);
    var octs = [{ n: 18, r: 165, a: 0.46 }, { n: 60, r: 70, a: 0.34 }, { n: 210, r: 25, a: 0.24 }];
    var seed = 7;
    function rf() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return ((seed >> 9) & 0xffff) / 65536; }
    for (o = 0; o < octs.length; o++) {
      var oc = octs[o];
      for (i = 0; i < oc.n; i++) {
        var x = rf() * S, y = rf() * S, rr = oc.r * (0.55 + rf() * 0.95);
        var up = rf() > 0.47;
        var grd = g.createRadialGradient(0, 0, 0, 0, 0, rr);
        grd.addColorStop(0, rgbas(up ? warm : cool, oc.a));
        grd.addColorStop(0.55, rgbas(up ? warm : cool, oc.a * 0.42));
        grd.addColorStop(1, rgbas(up ? warm : cool, 0));
        g.fillStyle = grd;
        for (j = -1; j <= 1; j++) for (k = -1; k <= 1; k++) {
          if (x + j * S < -rr || x + j * S > S + rr || y + k * S < -rr || y + k * S > S + rr) continue;
          g.save(); g.translate(x + j * S, y + k * S);
          g.fillRect(-rr, -rr, rr * 2, rr * 2);
          g.restore();
        }
      }
    }
    /* fine tooth, so the near ground has grit */
    var im = g.getImageData(0, 0, S, S), dt = im.data;
    for (i = 0; i < S * S; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var n = ((seed >> 13) & 47) - 24;
      dt[i * 4] = clamp(dt[i * 4] + n, 0, 255);
      dt[i * 4 + 1] = clamp(dt[i * 4 + 1] + n, 0, 255);
      dt[i * 4 + 2] = clamp(dt[i * 4 + 2] + n, 0, 255);

    }
    g.putImageData(im, 0, 0);
    return c;
  }

  function leafSprite(col) {
    var S = 128, c = document.createElement('canvas');
    c.width = S; c.height = S;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    grd.addColorStop(0, rgbas(col, 1));
    grd.addColorStop(0.62, rgbas(col, 0.97));
    grd.addColorStop(0.82, rgbas(col, 0.62));
    grd.addColorStop(0.94, rgbas(col, 0.20));
    grd.addColorStop(1, rgbas(col, 0));
    g.fillStyle = grd; g.fillRect(0, 0, S, S);
    return c;
  }

  function bakeSprites() {
    SPR.mottleHi = blobSprite(C.earthHi, 0.85, 1.7);
    SPR.mottleLo = blobSprite(mix(C.earth, C.shadow, 0.35), 0.85, 1.7);
    SPR.shadow   = blobSprite(C.shadow, 0.95, 1.6);
    SPR.ao       = blobSprite(mix(C.shadow, C.ink, 0.4), 0.95, 2.6);
    SPR.canopy   = leafSprite(mix(C.jade, C.shadow, 0.26));
    SPR.canopyLit= leafSprite(mix(C.jadeHi, C.sun, 0.30));
    SPR.grove    = blobSprite(mix(C.jade, C.earth, 0.34), 0.9, 1.6);
    SPR.haze     = blobSprite(C.haze, 0.98, 1.3);
    SPR.glow     = blobSprite(C.glow, 0.60, 2.1);
    SPR.glint    = blobSprite(mix(C.lit, [255, 255, 255], 0.35), 0.85, 2.4);
    SPR.paving   = blobSprite(mix(C.earthHi, C.sun, 0.22), 0.55, 1.5);
    SPR.grain    = grainTile();
    SPR.grainPat = ctx.createPattern(SPR.grain, 'repeat');
    SPR.gtile = groundTile();
    SPR.gpat = ctx.createPattern(SPR.gtile, 'repeat');
    SPR.gpat2 = ctx.createPattern(SPR.gtile, 'repeat');
    try {
      if (window.DOMMatrix && SPR.gpat.setTransform) {
        SPR.gpat.setTransform(new DOMMatrix().scaleSelf(0.44));
        SPR.gpat2.setTransform(new DOMMatrix().rotateSelf(37).scaleSelf(0.132));
      }
    } catch (e) { }
  }

  /* ground mottling: large-scale, world-space, so it moves with the ground */
  var mottle = [];
  function bakeGround() {
    mottle = [];
    var R = bounds.r * 2.8, step = R / 14;
    for (var gx = -R; gx <= R; gx += step) {
      for (var gy = -R; gy <= R; gy += step) {
        var h = hash32('m' + Math.round(gx) + '_' + Math.round(gy));
        var jx = (rnd01(h, 1) - 0.5) * step * 1.5, jy = (rnd01(h, 2) - 0.5) * step * 1.5;
        var x = bounds.cx + gx + jx, y = bounds.cy + gy + jy;
        var d0 = sqrt((x - bounds.cx) * (x - bounds.cx) + (y - bounds.cy) * (y - bounds.cy));
        if (d0 > R * 1.15) continue;
        mottle.push({
          x: x, y: y,
          r: step * (0.50 + rnd01(h, 3) * 1.05),
          hi: rnd01(h, 4) > 0.46,
          a: 0.07 + rnd01(h, 5) * 0.16
        });
      }
    }
  }

  /* ==================================================================
     CAMERA — a real pinhole, orbiting low. Everything eases.
     ================================================================== */
  var SUN_AZ = 0.62, SUN_EL = 0.115;                /* radians */
  var sunDir = [cos(SUN_AZ) * cos(SUN_EL), sin(SUN_AZ) * cos(SUN_EL), sin(SUN_EL)];
  var sunGnd = [cos(SUN_AZ), sin(SUN_AZ)];
  var SHADOW_SLOPE = 0.34;                          /* graded, not astronomical */

  var cam = { az: 0.7, el: 0.227, dist: 900, tx: 0, ty: 0, fov: 0.78 };
  var camT = { az: 0.7, el: 0.227, dist: 900, tx: 0, ty: 0 };
  var HOME = null;
  var fly = null;
  var W = 0, H = 0, DPR = 1, FOC = 1, PCX = 0, PCY = 0, HORY = 0;
  var eye = [0, 0, 0], fwd = [0, 0, 0], rgt = [0, 0, 0], upv = [0, 0, 0];
  var sunSX = 0, sunSY = 0, sunAhead = false, SE = 0, CE = 1;

  function resize() {
    var r = worldEl.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 1.4);
    W = Math.max(2, Math.round(r.width)); H = Math.max(2, Math.round(r.height));
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    skyKey = '';
  }

  function updateCam() {
    var ca = cos(cam.az), sa = sin(cam.az), ce = cos(cam.el), se = sin(cam.el);
    SE = se; CE = ce;
    eye[0] = cam.tx + cam.dist * ce * ca;
    eye[1] = cam.ty + cam.dist * ce * sa;
    eye[2] = cam.dist * se;
    fwd[0] = -ce * ca; fwd[1] = -ce * sa; fwd[2] = -se;
    rgt[0] = -sa; rgt[1] = ca; rgt[2] = 0;
    upv[0] = -ca * se; upv[1] = -sa * se; upv[2] = ce;
    FOC = (H / 2) / Math.tan(cam.fov / 2);
    HZ_NEAR = cam.dist * 0.22;
    HZ_FAR = clamp(cam.dist * 3.1, 900, 12000);
    PCX = W / 2;
    PCY = H * 0.36 + FOC * (se / ce) * 0.72;
    HORY = PCY - FOC * (se / ce);
    var vz = sunDir[0] * fwd[0] + sunDir[1] * fwd[1] + sunDir[2] * fwd[2];
    sunAhead = vz > 0.02;
    if (sunAhead) {
      var vx = sunDir[0] * rgt[0] + sunDir[1] * rgt[1];
      var vy = sunDir[0] * upv[0] + sunDir[1] * upv[1] + sunDir[2] * upv[2];
      sunSX = PCX + FOC * vx / vz; sunSY = PCY - FOC * vy / vz;
    } else { sunSX = -9999; sunSY = HORY; }
  }

  var px = 0, py = 0, pz = 0, pS = 0;
  function proj(x, y, z) {
    var dx = x - eye[0], dy = y - eye[1], dz = z - eye[2];
    pz = dx * fwd[0] + dy * fwd[1] + dz * fwd[2];
    if (pz < 6) return false;
    pS = FOC / pz;
    px = PCX + (dx * rgt[0] + dy * rgt[1]) * pS;
    py = PCY - (dx * upv[0] + dy * upv[1] + dz * upv[2]) * pS;
    return true;
  }
  function depthOf(x, y, z) {
    return (x - eye[0]) * fwd[0] + (y - eye[1]) * fwd[1] + (z - eye[2]) * fwd[2];
  }

  /* haze: the single effect that turns a diagram into a photograph */
  /* The haze is keyed to how far back the camera stands, the way a long lens
     compresses it: pulling out never dissolves the survey into fog. */
  var HZ_NEAR = 180, HZ_FAR = 2500, HZ_MAX = 0.88;
  function hazeAt(d) {
    var t = (d - HZ_NEAR) / (HZ_FAR - HZ_NEAR);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return Math.pow(t, 1.45) * HZ_MAX;
  }

  /* ---------------------------------------------------- face palette */
  var MBASE = ARCH_ORDER.map(function (a) { return hx(ARCH[a].base); });
  var MK = ARCH_ORDER.map(function (a) { return ARCH[a].k; });
  var MGL = ARCH_ORDER.map(function (a) { return ARCH[a].gl ? 1 : 0; });
  /* 7: structural steel, for masts, jibs and rigging */
  MBASE.push(hx('#413A4C')); MK.push(0.26); MGL.push(0);
  var M_STEEL = 7;
  var VARF = [0.90, 1.0, 1.11];
  var palCache = {};
  function smoothstep(t) { return t * t * (3 - 2 * t); }

  function faceCol(m, v, tB, hB, part) {
    var key = (((m * 3 + v) * 9 + tB) * 19 + hB) * 3 + part;
    var s = palCache[key];
    if (s !== undefined) return s;
    var base = lit(MBASE[m], VARF[v]);
    var k = MK[m], gl = MGL[m];
    var sunC = lit(mix(base, C.sun, k), 1.14);
    var shC = mix(mix(base, C.shadow, 0.54), C.earthHi, 0.12);
    if (gl) { sunC = lit(mix(sunC, C.glow, 0.11), 1.05); shC = mix(shC, C.skyHi, 0.26); }
    var t = smoothstep(tB / 8);
    var f = mix(shC, sunC, t);
    var c;
    if (part === 0) c = gl ? mix(lit(f, 1.10), C.skyLo, 0.14) : lit(f, 1.10);
    else if (part === 1) c = mix(lit(f, 0.82), C.shadow, 0.14);
    else c = f;
    c = mix(c, C.haze, (hB / 18) * HZ_MAX);
    s = rgbs(c);
    palCache[key] = s;
    return s;
  }
  function roofCol(m, v, hB, part) {
    var key = 900000 + ((m * 3 + v) * 19 + hB) * 3 + part;
    var s = palCache[key];
    if (s !== undefined) return s;
    var base = lit(MBASE[m], VARF[v]);
    var k = MK[m];
    /* a low sun only grazes a roof: warm, but never the brightest thing */
    var c = mix(mix(base, mix(C.sun, C.skyLo, 0.45), k * 0.46), C.shadow, 0.14);
    if (part === 0) c = lit(c, 1.05);
    else if (part === 1) c = lit(c, 0.89);
    c = mix(c, C.haze, (hB / 18) * HZ_MAX);
    s = rgbs(c);
    palCache[key] = s;
    return s;
  }

  /* ==================================================================
     RENDER
     ================================================================== */
  var shC = null, shX = null, SHS = 0.30;
  var skyKey = '', skyGrad = null, gndGrad = null, hazeGrad = null, vigGrad = null;
  var bloom = [];
  var lastFrameMs = 0, frameSamples = [], PROF = null, GSTRIPS = 0, DBG = 0;

  function ensureShadow() {
    var w = Math.max(2, Math.round(W * SHS)), h = Math.max(2, Math.round(H * SHS));
    if (!shC) { shC = document.createElement('canvas'); shX = shC.getContext('2d'); }
    if (shC.width !== w || shC.height !== h) { shC.width = w; shC.height = h; }
  }

  var skyC = null, skyX = null;
  function drawSky() {
    var key = Math.round(HORY / 5) + '|' + Math.round(sunSX / 9) + '|' + Math.round(sunSY / 9) + '|' + W + 'x' + H;
    if (key !== skyKey) {
      skyKey = key;
      var top = Math.min(HORY, H);
      var g = ctx.createLinearGradient(0, Math.min(-H * 0.35, top - H * 0.9), 0, top);
      g.addColorStop(0.00, rgbs(C.skyHi));
      g.addColorStop(0.34, rgbs(mix(C.skyHi, [58, 96, 100], 0.75)));
      g.addColorStop(0.62, rgbs(mix([58, 96, 100], C.haze, 0.62)));
      g.addColorStop(0.84, rgbs(mix(C.haze, C.skyLo, 0.72)));
      g.addColorStop(1.00, rgbs(mix(C.skyLo, C.sun, 0.28)));
      skyGrad = g;

      var g2 = ctx.createLinearGradient(0, top, 0, H);
      g2.addColorStop(0.00, rgbs(mix(C.haze, C.skyLo, 0.48)));
      g2.addColorStop(0.035, rgbs(mix(C.haze, C.earthHi, 0.50)));
      g2.addColorStop(0.11, rgbs(mix(C.earthHi, C.haze, 0.34)));
      g2.addColorStop(0.30, rgbs(mix(C.earthHi, C.sun, 0.12)));
      g2.addColorStop(0.62, rgbs(mix(C.earth, C.sun, 0.09)));
      g2.addColorStop(1.00, rgbs(mix(mix(C.earth, C.shadow, 0.26), C.ink, 0.14)));
      gndGrad = g2;

      var hb0 = top - H * 0.11, hb1 = top + H * 0.16;
      var g3 = ctx.createLinearGradient(0, hb0, 0, hb1);
      g3.addColorStop(0, rgbas(C.haze, 0));
      g3.addColorStop(0.42, rgbas(mix(C.haze, C.skyLo, 0.4), 0.52));
      g3.addColorStop(0.52, rgbas(mix(C.haze, C.skyLo, 0.3), 0.46));
      g3.addColorStop(1, rgbas(C.haze, 0));
      hazeGrad = g3;

      var g4 = ctx.createRadialGradient(W * 0.5, H * 0.42, Math.min(W, H) * 0.24, W * 0.5, H * 0.46, Math.max(W, H) * 0.78);
      g4.addColorStop(0, rgbas(C.shadow, 0));
      g4.addColorStop(1, rgbas(C.shadow, 0.44));
      vigGrad = g4;

      /* the whole backdrop — gradient sky, horizon haze, sun bloom, ground
         wash — is composed once into a layer and blitted while it holds */
      if (!skyC) { skyC = document.createElement('canvas'); skyX = skyC.getContext('2d', { alpha: false }); }
      if (skyC.width !== W || skyC.height !== H) { skyC.width = W; skyC.height = H; }
      var x = skyX;
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
      x.fillStyle = skyGrad; x.fillRect(0, 0, W, Math.max(0, Math.min(HORY, H)));
      if (HORY < H) { x.fillStyle = gndGrad; x.fillRect(0, Math.max(0, HORY), W, H - Math.max(0, HORY)); }
      if (HORY <= 0) { x.fillStyle = gndGrad; x.fillRect(0, 0, W, H); }
      if (sunAhead && sunSX > -W && sunSX < W * 2) {
        var m2 = Math.max(W, H);
        x.globalCompositeOperation = 'lighter';
        x.globalAlpha = 0.9;
        x.drawImage(SPR.glow, sunSX - m2 * 0.58, sunSY - m2 * 0.46, m2 * 1.16, m2 * 0.92);
        x.globalAlpha = 1;
        x.drawImage(SPR.glint, sunSX - H * 0.085, sunSY - H * 0.085, H * 0.17, H * 0.17);
        x.globalCompositeOperation = 'source-over';
      }
      x.fillStyle = hazeGrad; x.fillRect(0, 0, W, H);
    }
    ctx.drawImage(skyC, 0, 0);
  }

  /* blit a sprite as an axis-aligned ellipse */
  function spriteAt(spr, x, y, rx, ry, a) {
    if (rx < 0.4 || ry < 0.4) return;
    ctx.globalAlpha = a;
    ctx.drawImage(spr, x - rx, y - ry, rx * 2, ry * 2);
    ctx.globalAlpha = 1;
  }
  /* blit a sprite as a ground-plane ellipse, perspective correct */
  function groundSprite(spr, wx, wy, r, a, cap) {
    if (!proj(wx, wy, 0)) return;
    var ox = px, oy = py;
    if (ox < -W || ox > W * 2 || oy < HORY - 40 || oy > H + H) return;
    if (!proj(wx + r, wy, 0)) return; var ux = px - ox, uy = py - oy;
    if (!proj(wx, wy + r, 0)) return; var vx = px - ox, vy = py - oy;
    var area = abs(ux * vy - uy * vx);
    if (area < 0.8) return;
    if (cap && area > cap) return;
    ctx.globalAlpha = a;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.transform(ux, uy, vx, vy, ox, oy);
    ctx.drawImage(spr, -1, -1, 2, 2);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalAlpha = 1;
  }

  function drawGroundDetail() {
    var i;
    /* The ground plane, textured in true perspective. On a horizontal plane a
       screen scanline is a line of constant depth, so one affine transform per
       horizontal strip is exact; forty strips make the seam invisible. */
    if (SPR.gpat && CE > 0.0001) {
      var y0 = Math.max(0, Math.floor(HORY) + 3);
      if (y0 < H) {
        var NS = 40, hstep = (H - y0) / NS;
        for (i = 0; i < NS; i++) {
          var ya = y0 + i * hstep, yb = ya + hstep + 1;
          var yc = (ya + yb) / 2;
          var den = SE + ((yc - PCY) / FOC) * CE;
          if (den <= 0.0006) continue;
          var d = eye[2] / den;
          if (d < 8 || d > 26000) continue;
          var a2 = (1 - hazeAt(d)) * 0.92;
          if (a2 < 0.02) continue;
          var kf = FOC / d;
          var A = kf * rgt[0], Bc = -kf * upv[0], Cc = kf * rgt[1], Dc = -kf * upv[1];
          var E = PCX - kf * (eye[0] * rgt[0] + eye[1] * rgt[1]);
          var F = PCY + kf * (eye[0] * upv[0] + eye[1] * upv[1] + eye[2] * upv[2]);
          /* the patch of ground this strip actually shows */
          var vv = -(yc - PCY) / FOC;
          var gx = eye[0] + d * (fwd[0] + vv * upv[0]);
          var gy = eye[1] + d * (fwd[1] + vv * upv[1]);
          var span = d * (W / FOC) * 1.1 + d * (hstep / FOC) * 2 + 40;
          ctx.save();
          ctx.beginPath(); ctx.rect(0, ya, W, yb - ya); ctx.clip();
          ctx.setTransform(DPR * A, DPR * Bc, DPR * Cc, DPR * Dc, DPR * E, DPR * F);
          ctx.globalAlpha = a2;
          ctx.fillStyle = DBG === 1 ? '#FF0000' : SPR.gpat;
          ctx.fillRect(gx - span, gy - span, span * 2, span * 2);
          /* a second, finer pass at another scale and angle, so the tiling
             never announces itself and the near ground keeps its grit */
          if (SPR.gpat2 && d < 2200) {
            ctx.globalAlpha = a2 * 0.55;
            ctx.fillStyle = SPR.gpat2;
            ctx.fillRect(gx - span, gy - span, span * 2, span * 2);
          }
          ctx.restore();
          GSTRIPS++;
        }
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.globalAlpha = 1;
      }
    }
    /* each quarter keeps a swept clearing around its plaza */
    for (i = 0; i < dists.length; i++) {
      var q = dists[i];
      var dq = depthOf(q.x, q.y, 0);
      if (dq < 20) continue;
      groundSprite(SPR.paving, q.x, q.y, q.r * 1.05, 0.26 * (1 - hazeAt(dq)));
    }
  }

  function strokeWorldLine(pts, wWorld, col, alpha) {
    var n = pts.length, i, first = true, anyOn = false;
    var mid = pts[n >> 1];
    var d = depthOf(mid[0], mid[1], 0);
    if (d < 20) return;
    var lw = wWorld * (FOC / d);
    if (lw < 0.35) return;
    ctx.beginPath();
    for (i = 0; i < n; i++) {
      if (!proj(pts[i][0], pts[i][1], 0)) { first = true; continue; }
      if (px < -900 || px > W + 900 || py > H + 900) { /* keep, may re-enter */ }
      anyOn = true;
      if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
    }
    if (!anyOn) return;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = col;
    ctx.globalAlpha = alpha * 0.5; ctx.lineWidth = lw * 2.1; ctx.stroke();
    ctx.globalAlpha = alpha; ctx.lineWidth = lw; ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawRoads() {
    var i;
    /* highways: the citations that cross a district boundary */
    for (i = 0; i < highways.length; i++) {
      var hw = highways[i];
      if (hw.w < 2) continue;
      var a = hw.a, b = hw.b;
      var d = depthOf((a.x + b.x) / 2, (a.y + b.y) / 2, 0);
      if (d < 20) continue;
      var hz = hazeAt(d);
      strokeWorldLine([[a.x, a.y], [b.x, b.y]],
        3 + Math.min(hw.w, 26) * 0.6,
        rgbs(mix(mix(C.earthHi, C.sun, 0.18), C.haze, hz)),
        (0.16 + Math.min(hw.w, 30) * 0.011) * (1 - hz * 0.8));
    }
    /* lanes: the citations inside a district */
    var laneN = 0;
    for (i = 0; i < lanes.length; i++) {
      var ln = lanes[i];
      var dd = depthOf(ln.d.x, ln.d.y, 0);
      if (dd < 20) continue;
      if (ln.d.r * (FOC / dd) < 70) continue;
      if (++laneN > 240) break;
      var h2 = hazeAt(dd);
      strokeWorldLine(ln.pts, 4.4 + Math.min(ln.w, 6) * 0.9,
        rgbs(mix(mix(C.earthHi, C.sun, 0.34), C.haze, h2)), 0.40 * (1 - h2 * 0.8));
    }
  }

  function drawWater() {
    if (!river.poly || !river.poly.length) return;
    var pts = river.poly, i, n = pts.length, on = 0;
    var d0 = depthOf(river.pts[river.pts.length >> 1].x, river.pts[river.pts.length >> 1].y, 0);
    if (d0 < 10) d0 = 10;
    var hz = hazeAt(d0);
    ctx.beginPath();
    for (i = 0; i < n; i++) {
      if (!proj(pts[i][0], pts[i][1], 0)) continue;
      if (on === 0) { ctx.moveTo(px, py); on = 1; } else ctx.lineTo(px, py);
    }
    if (!on) return;
    ctx.closePath();
    /* soft bank: a wide dark halo under a brighter core */
    ctx.fillStyle = rgbas(mix(mix(C.water, C.shadow, 0.4), C.haze, hz), 0.55);
    ctx.fill();
    ctx.fillStyle = rgbs(mix(C.water, C.haze, hz));
    ctx.fill();
    /* the sun lies on the water */
    ctx.globalCompositeOperation = 'lighter';
    for (i = 4; i < river.pts.length; i += 5) {
      var q = river.pts[i];
      var dq = depthOf(q.x, q.y, 0);
      if (dq < 20) continue;
      var w2 = 15 + 26 * (q.t || 0);
      groundSprite(SPR.glow, q.x, q.y, w2 * 1.7, 0.22 * (1 - hazeAt(dq) * 0.7));
      groundSprite(SPR.glint, q.x + sunGnd[0] * 3, q.y + sunGnd[1] * 3, w2 * 0.5, 0.16 * (1 - hazeAt(dq)));
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /* -------------------------------------------------------- shadows */
  var hull8x = new Float64Array(8), hull8y = new Float64Array(8), hullIx = new Int32Array(8);
  function castShadows(list) {
    ensureShadow();
    var s = SHS;
    shX.setTransform(1, 0, 0, 1, 0, 0);
    shX.clearRect(0, 0, shC.width, shC.height);
    shX.fillStyle = 'rgba(0,0,0,0.86)';
    var i, j;
    for (i = 0; i < list.length; i++) {
      var r = list[i];
      if (r.hz > 0.72 || Math.max(r.hw, r.hd) * (FOC / r._d) < 7) continue;
      var L = r.topz / SHADOW_SLOPE;
      if (L > 420) L = 420;
      var ox = -sunGnd[0] * L, oy = -sunGnd[1] * L;
      var ca = cos(r.yaw), sa = sin(r.yaw);
      var n = 0, okAll = true;
      for (j = 0; j < 4; j++) {
        var lx = (j === 0 || j === 3) ? -r.hw : r.hw;
        var ly = (j < 2) ? -r.hd : r.hd;
        var wx = r.wx + lx * ca - ly * sa, wy = r.wy + lx * sa + ly * ca;
        if (!proj(wx, wy, 0)) { okAll = false; break; }
        hull8x[n] = px * s; hull8y[n] = py * s; n++;
        if (!proj(wx + ox, wy + oy, 0)) { okAll = false; break; }
        hull8x[n] = px * s; hull8y[n] = py * s; n++;
      }
      if (!okAll || n < 6) continue;
      var m = convexHull(n);
      if (m < 3) continue;
      shX.beginPath();
      shX.moveTo(hull8x[hullIx[0]], hull8y[hullIx[0]]);
      for (j = 1; j < m; j++) shX.lineTo(hull8x[hullIx[j]], hull8y[hullIx[j]]);
      shX.closePath();
      shX.globalAlpha = 0.62 * (1 - r.hz);
      shX.fill();
    }
    shX.globalAlpha = 1;
    ctx.globalAlpha = 0.70;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(shC, 0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }
  var hsort = [0, 1, 2, 3, 4, 5, 6, 7];
  function convexHull(n) {
    var i, k = 0;
    hsort.length = 0;
    for (i = 0; i < n; i++) hsort.push(i);
    hsort.sort(function (a, b) { return hull8x[a] - hull8x[b] || hull8y[a] - hull8y[b]; });
    var tmp = new Int32Array(2 * n + 1);
    for (i = 0; i < n; i++) {
      var p = hsort[i];
      while (k >= 2 && cross3(tmp[k - 2], tmp[k - 1], p) <= 0) k--;
      tmp[k++] = p;
    }
    var lower = k + 1;
    for (i = n - 2; i >= 0; i--) {
      var q = hsort[i];
      while (k >= lower && cross3(tmp[k - 2], tmp[k - 1], q) <= 0) k--;
      tmp[k++] = q;
    }
    k--;
    for (i = 0; i < k && i < 8; i++) hullIx[i] = tmp[i];
    return Math.min(k, 8);
  }
  function cross3(a, b, c) {
    return (hull8x[b] - hull8x[a]) * (hull8y[c] - hull8y[a]) - (hull8y[b] - hull8y[a]) * (hull8x[c] - hull8x[a]);
  }

  /* ------------------------------------------------------- buildings */
  var qx = new Float64Array(8), qy = new Float64Array(8);
  var NORM = [[1, 0], [0, 1], [-1, 0], [0, -1]];

  function drawBuilding(r, quality) {
    var i, j;
    var hz = r.hz, hB = Math.round(hz / HZ_MAX * 18);
    if (hB > 18) hB = 18; if (hB < 0) hB = 0;
    var m = r.matIx, v = r.varIx;

    /* the ground takes the building: ambient occlusion, then contact */
    var foot = Math.max(r.hw, r.hd);
    if (foot * (FOC / r._d) > 9) {
      groundSprite(SPR.ao, r.wx, r.wy, foot * 1.55, 0.32 * (1 - hz));
      groundSprite(SPR.shadow, r.wx - sunGnd[0] * foot * 0.5, r.wy - sunGnd[1] * foot * 0.5,
        foot * 1.2, 0.28 * (1 - hz));
    }

    if (r.canopies) {
      /* planted ground reads green from across the map */
      groundSprite(SPR.grove, r.wx, r.wy, foot * 1.3, 0.42 * (1 - hz));
      drawCanopies(r, hz);
      return;
    }

    var boxes = r.boxes;
    if (boxes.length > 1) {
      for (i = 0; i < boxes.length; i++) boxes[i]._d = depthOf(boxes[i].cx, boxes[i].cy, (boxes[i].z0 + boxes[i].z1) / 2);
      boxes = boxes.slice().sort(function (a, b) { return b._d - a._d; });
    }

    for (i = 0; i < boxes.length; i++) {
      var b = boxes[i];
      var ca = cos(b.yaw), sa = sin(b.yaw);
      var ex = eye[0] - b.cx, ey = eye[1] - b.cy;
      /* the four corners, once */
      var cxs = [ -b.hw, b.hw, b.hw, -b.hw ], cys = [ -b.hd, -b.hd, b.hd, b.hd ];
      var okA = true;
      for (j = 0; j < 4; j++) {
        var wx = b.cx + cxs[j] * ca - cys[j] * sa, wy = b.cy + cxs[j] * sa + cys[j] * ca;
        if (!proj(wx, wy, b.z0)) { okA = false; break; }
        qx[j] = px; qy[j] = py;
        if (!proj(wx, wy, b.z1)) { okA = false; break; }
        qx[j + 4] = px; qy[j + 4] = py;
      }
      if (!okA) continue;
      var minx = Math.min(qx[0], qx[1], qx[2], qx[3], qx[4], qx[5], qx[6], qx[7]);
      var maxx = Math.max(qx[0], qx[1], qx[2], qx[3], qx[4], qx[5], qx[6], qx[7]);
      var miny = Math.min(qy[4], qy[5], qy[6], qy[7]);
      var maxy = Math.max(qy[0], qy[1], qy[2], qy[3]);
      if (maxx < -30 || minx > W + 30 || maxy < -30 || miny > H + 30) continue;
      var pxH = maxy - miny, pxW = maxx - minx;
      var lod = quality && pxH > 34 && pxW > 12;

      var open = b.cls === 'open';
      var mm = m, vv = v;
      if (b.cls === 'mast') { mm = M_STEEL; vv = 1; }
      else if (b.cls === 'corn') { vv = 0; }

      /* the two faces the sun and the camera agree on */
      for (j = 0; j < 4; j++) {
        var nx = NORM[j][0] * ca - NORM[j][1] * sa;
        var ny = NORM[j][0] * sa + NORM[j][1] * ca;
        var ext = (j === 0 || j === 2) ? b.hw : b.hd;
        if (nx * ex + ny * ey <= ext * 0.999) continue;
        var i0 = j, i1 = (j + 1) & 3;
        var dot = nx * sunGnd[0] + ny * sunGnd[1];
        var tB = Math.round(clamp((dot + 0.30) / 1.30, 0, 1) * 8);
        drawFace(qx[i0], qy[i0], qx[i1], qy[i1], qx[i1 + 4], qy[i1 + 4], qx[i0 + 4], qy[i0 + 4],
          mm, vv, tB, hB, lod, open, r, b, dot);
      }
      /* the arris: the vertical corner where the lit and shaded faces meet */
      if (lod) {
        for (j = 0; j < 4; j++) {
          var nx2 = NORM[j][0] * ca - NORM[j][1] * sa, ny2 = NORM[j][0] * sa + NORM[j][1] * ca;
          var ex2 = (j === 0 || j === 2) ? b.hw : b.hd;
          if (nx2 * ex + ny2 * ey <= ex2 * 0.999) continue;
          var k3 = (j + 1) & 3;
          var nx3 = NORM[k3][0] * ca - NORM[k3][1] * sa, ny3 = NORM[k3][0] * sa + NORM[k3][1] * ca;
          var ex3 = (k3 === 0 || k3 === 2) ? b.hw : b.hd;
          if (nx3 * ex + ny3 * ey <= ex3 * 0.999) continue;
          ctx.strokeStyle = rgbas(mix(C.shadow, C.haze, hz), 0.30);
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(qx[k3], qy[k3]); ctx.lineTo(qx[k3 + 4], qy[k3 + 4]); ctx.stroke();
        }
      }

      /* the roof, if we are above it */
      if (eye[2] > b.z1) {
        ctx.beginPath();
        ctx.moveTo(qx[4], qy[4]);
        ctx.lineTo(qx[5], qy[5]); ctx.lineTo(qx[6], qy[6]); ctx.lineTo(qx[7], qy[7]);
        ctx.closePath();
        if (lod && pxW > 26) {
          var g = ctx.createLinearGradient(qx[4], qy[4], qx[6], qy[6]);
          g.addColorStop(0, roofCol(mm, vv, hB, 0));
          g.addColorStop(1, roofCol(mm, vv, hB, 1));
          ctx.fillStyle = g;
        } else ctx.fillStyle = roofCol(mm, vv, hB, 2);
        if (open) {
          ctx.globalAlpha = 0.20; ctx.fill();
          ctx.globalAlpha = 0.8; ctx.strokeStyle = roofCol(mm, vv, hB, 1); ctx.lineWidth = 1.3; ctx.stroke();
          ctx.globalAlpha = 1;
        } else ctx.fill();
        if (r.hit && pxW > 3) r.hit.push([qx[4], qy[4], qx[5], qy[5], qx[6], qy[6], qx[7], qy[7]]);
      }
    }
  }

  function drawFace(ax, ay, bx, by, cx2, cy2, dx2, dy2, m, v, tB, hB, lod, open, r, b, dot) {
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx2, cy2); ctx.lineTo(dx2, dy2);
    ctx.closePath();
    var topMy = (cy2 + dy2) / 2, botMy = (ay + by) / 2;
    var topMx = (cx2 + dx2) / 2, botMx = (ax + bx) / 2;
    var hpx = abs(botMy - topMy);
    if (lod && hpx > 20) {
      var g = ctx.createLinearGradient(topMx, topMy, botMx, botMy);
      g.addColorStop(0, faceCol(m, v, tB, hB, 0));
      g.addColorStop(1, faceCol(m, v, tB, hB, 1));
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = faceCol(m, v, tB, hB, 2);
    }
    if (open) {
      ctx.globalAlpha = 0.14; ctx.fill();
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = faceCol(m, v, tB, hB, 1);
      ctx.lineWidth = Math.max(1, Math.min(2.4, hpx / 26));
      ctx.stroke();
      /* two rails and a diagonal brace: this is scaffolding, not glass */
      if (hpx > 14) {
        ctx.beginPath();
        for (var q2 = 1; q2 <= 2; q2++) {
          var tq = q2 / 3;
          ctx.moveTo(ax + (dx2 - ax) * tq, ay + (dy2 - ay) * tq);
          ctx.lineTo(bx + (cx2 - bx) * tq, by + (cy2 - by) * tq);
        }
        ctx.moveTo(ax, ay); ctx.lineTo(cx2, cy2);
        ctx.globalAlpha = 0.55; ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.globalAlpha = 1;
      return;
    }
    ctx.fill();
    if (r.hit) r.hit.push([ax, ay, bx, by, cx2, cy2, dx2, dy2]);

    if (!lod || hpx < 42) return;

    /* floor lines and glass, drawn on the face's own bilinear frame */
    var wpx = Math.hypot(bx - ax, by - ay);
    var rows = clamp(Math.round((b.z1 - b.z0) / 11), 2, 30);
    var i, t, e = 0.30 / rows;
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = rgbas(mix(C.shadow, C.ink, 0.3), 1);
    ctx.beginPath();
    for (i = 1; i < rows; i++) {
      t = i / rows;
      var l0x = ax + (dx2 - ax) * t, l0y = ay + (dy2 - ay) * t;
      var l1x = bx + (cx2 - bx) * t, l1y = by + (cy2 - by) * t;
      var t2 = t + e;
      var m0x = ax + (dx2 - ax) * t2, m0y = ay + (dy2 - ay) * t2;
      var m1x = bx + (cx2 - bx) * t2, m1y = by + (cy2 - by) * t2;
      ctx.moveTo(l0x, l0y); ctx.lineTo(l1x, l1y); ctx.lineTo(m1x, m1y); ctx.lineTo(m0x, m0y);
    }
    ctx.fill();
    ctx.globalAlpha = 1;

    var A = ARCH[ARCH_ORDER[m]];
    if (!A || !A.win) return;
    if (wpx < 22 || hpx < 60) return;

    /* lit windows read against the shaded faces; the sunlit glass glints */
    if (dot < 0.35) {
      var cols = clamp(Math.round(wpx / 13), 2, 9);
      ctx.fillStyle = rgbs(mix(C.lit, C.haze, (hB / 18) * HZ_MAX * 0.7));
      ctx.beginPath();
      var lite = 0;
      for (i = 1; i < rows; i++) {
        for (var jj = 0; jj < cols; jj++) {
          if (rnd01(r.h32 + i * 31, jj + 7) > 0.33) continue;
          var u0 = (jj + 0.22) / cols, u1 = (jj + 0.78) / cols;
          var w0 = 1 - (i + 0.72) / rows, w1 = 1 - (i + 0.18) / rows;
          quadPt(ax, ay, bx, by, cx2, cy2, dx2, dy2, u0, w0); ctx.moveTo(qpx, qpy);
          quadPt(ax, ay, bx, by, cx2, cy2, dx2, dy2, u1, w0); ctx.lineTo(qpx, qpy);
          quadPt(ax, ay, bx, by, cx2, cy2, dx2, dy2, u1, w1); ctx.lineTo(qpx, qpy);
          quadPt(ax, ay, bx, by, cx2, cy2, dx2, dy2, u0, w1); ctx.lineTo(qpx, qpy);
          lite++;
          if (lite > 150) break;
        }
        if (lite > 150) break;
      }
      ctx.globalAlpha = 0.88;
      ctx.fill();
      ctx.globalAlpha = 1;
      if (lite > 6) bloom.push([(ax + cx2) / 2, (ay + cy2) / 2, Math.min(wpx, hpx) * 0.55, 0.16 * (1 - r.hz)]);
    } else if (dot > 0.5 && hpx > 70) {
      bloom.push([(ax + cx2) / 2, (ay + cy2) / 2, Math.min(wpx * 1.2, hpx * 0.45), 0.30 * (1 - r.hz)]);
    }
  }
  var qpx = 0, qpy = 0;
  function quadPt(ax, ay, bx, by, cx2, cy2, dx2, dy2, u, w) {
    /* w = 0 at the base edge, 1 at the top edge */
    var b0x = ax + (bx - ax) * u, b0y = ay + (by - ay) * u;
    var t0x = dx2 + (cx2 - dx2) * u, t0y = dy2 + (cy2 - dy2) * u;
    qpx = b0x + (t0x - b0x) * w; qpy = b0y + (t0y - b0y) * w;
  }

  function drawCanopies(r, hz) {
    var cs = r.canopies, i;
    for (i = 0; i < cs.length; i++) {
      var c = cs[i];
      if (!proj(c.x, c.y, c.z)) continue;
      var sx = px, sy = py, s = pS;
      var R = c.r * s;
      if (R < 0.8) continue;
      if (R > 190) R = 190;
      var dsx = sunSX - sx, dsy = sunSY - sy;
      var dl = Math.hypot(dsx, dsy) || 1;
      if (R > 5) {
        ctx.strokeStyle = rgbas(mix(mix(C.earth, C.shadow, 0.5), C.haze, hz), 0.8);
        ctx.lineWidth = Math.max(1, R * 0.13);
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy + R * 1.0); ctx.stroke();
      }
      ctx.globalAlpha = 1 - hz * 0.55;
      ctx.drawImage(SPR.canopy, sx - R, sy - R * 0.86, R * 2, R * 1.72);
      ctx.globalAlpha = (1 - hz * 0.7) * 0.92;
      ctx.drawImage(SPR.canopyLit,
        sx + (dsx / dl) * R * 0.26 - R * 0.56,
        sy - R * 0.34 - R * 0.50, R * 1.12, R * 1.00);
      ctx.globalAlpha = 1;
      if (hz > 0.14) spriteAt(SPR.haze, sx, sy - R * 0.1, R * 1.02, R * 0.95, hz * 0.9);
    }
  }

  function drawScrub() {
    var i, drawn = 0;
    for (i = 0; i < scrub.length; i++) {
      if (drawn > 90) break;
      var s = scrub[i];
      var d = depthOf(s.x, s.y, s.z);
      if (d < 20) continue;
      var hz = hazeAt(d);
      if (hz > 0.9) continue;
      if (!proj(s.x, s.y, s.z)) continue;
      var R = s.r * pS;
      if (R < 0.7) continue;
      if (R > 130) R = 130;
      drawn++;
      ctx.globalAlpha = (1 - hz * 0.6) * 0.9;
      ctx.drawImage(SPR.canopy, px - R, py - R * 0.8, R * 2, R * 1.6);
      ctx.globalAlpha = (1 - hz * 0.75) * 0.75;
      ctx.drawImage(SPR.canopyLit, px - R * 0.5, py - R * 0.85, R * 1.0, R * 0.85);
      ctx.globalAlpha = 1;
      if (hz > 0.14) spriteAt(SPR.haze, px, py, R * 1.05, R * 0.9, hz * 0.85);
    }
  }

  /* ---------------------------------------------------------- labels */
  function drawLabels() {
    var i, shown = 0;
    var picks = [];
    for (i = 0; i < dists.length; i++) {
      var d = dists[i];
      var dd = depthOf(d.x, d.y, 0);
      if (dd < 60) continue;
      var scr = d.r * (FOC / dd);
      if (scr < 90) continue;
      if (!proj(d.x, d.y, 26)) continue;
      if (px < 60 || px > W - 60 || py < HORY + 6 || py > H - 30) continue;
      picks.push({ d: d, x: px, y: py, dd: dd, scr: scr });
    }
    picks.sort(function (a, b) { return b.scr - a.scr; });
    ctx.textAlign = 'center';
    for (i = 0; i < picks.length && shown < 5; i++) {
      var q = picks[i], ok = true;
      for (var j = 0; j < i; j++) {
        if (picks[j].used && abs(picks[j].x - q.x) < 150 && abs(picks[j].y - q.y) < 30) { ok = false; break; }
      }
      if (!ok) continue;
      q.used = 1; shown++;
      var name = q.d.name.length > 30 ? q.d.name.slice(0, 29) + '…' : q.d.name;
      ctx.font = '600 11px "Archivo Narrow", Arial Narrow, sans-serif';
      var tw = ctx.measureText(name).width + 18;
      var a = clamp(1 - hazeAt(q.dd) * 0.9, 0.45, 1);
      ctx.globalAlpha = a * 0.82;
      ctx.fillStyle = 'rgba(248,240,227,0.90)';
      rrect(q.x - tw / 2, q.y - 9, tw, 18, 9); ctx.fill();
      ctx.globalAlpha = a;
      ctx.fillStyle = rgbs(C.ink);
      ctx.fillText(name, q.x, q.y + 4);
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = 'left';
  }
  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawMarker(r, sel) {
    if (!r || r.wx === undefined) return;
    if (!proj(r.wx, r.wy, r.solidz + 16)) return;
    var x = px, y = py;
    if (x < -80 || x > W + 80 || y < -60 || y > H + 60) return;
    var name = title(r.p);
    if (name.length > 34) name = name.slice(0, 33) + '…';
    ctx.font = '700 12.5px "Archivo", Arial, sans-serif';
    var tw = ctx.measureText(name).width + 22;
    x = clamp(x, tw / 2 + 8, W - tw / 2 - 8);
    ctx.strokeStyle = sel ? rgbs(C.sun) : 'rgba(248,240,227,0.85)';
    ctx.lineWidth = sel ? 2 : 1.4;
    ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x, y + 24); ctx.stroke();
    ctx.fillStyle = sel ? rgbs(C.sun) : 'rgba(248,240,227,0.94)';
    rrect(x - tw / 2, y - 13, tw, 21, 10); ctx.fill();
    ctx.fillStyle = rgbs(C.ink);
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y + 2);
    ctx.textAlign = 'left';
  }

  /* --------------------------------------------- coarse occlusion grid
     A near tower hides whatever stands behind it. One conservative pass,
     front to back, decides who is worth painting at all. */
  var OCCS = 16, OCCW = 0, OCCH = 0, occ = null, occStamp = 0;
  function occReset() {
    var w = Math.ceil(W / OCCS) + 1, h = Math.ceil(H / OCCS) + 1;
    if (!occ || OCCW !== w || OCCH !== h) { OCCW = w; OCCH = h; occ = new Int32Array(w * h); occStamp = 0; }
    occStamp++;
  }
  function occCovered(x0, y0, x1, y1) {
    var a = Math.floor(x0 / OCCS), b2 = Math.floor(y0 / OCCS);
    var c = Math.floor(x1 / OCCS), d = Math.floor(y1 / OCCS);
    if (a < 0) a = 0; if (b2 < 0) b2 = 0;
    if (c >= OCCW) c = OCCW - 1; if (d >= OCCH) d = OCCH - 1;
    if (c < a || d < b2) return true;
    for (var j = b2; j <= d; j++) {
      var row = j * OCCW;
      for (var i = a; i <= c; i++) if (occ[row + i] !== occStamp) return false;
    }
    return true;
  }
  function occMark(x0, y0, x1, y1) {
    var a = Math.ceil(x0 / OCCS), b2 = Math.ceil(y0 / OCCS);
    var c = Math.floor(x1 / OCCS) - 1, d = Math.floor(y1 / OCCS) - 1;
    if (a < 0) a = 0; if (b2 < 0) b2 = 0;
    if (c >= OCCW) c = OCCW - 1; if (d >= OCCH) d = OCCH - 1;
    for (var j = b2; j <= d; j++) {
      var row = j * OCCW;
      for (var i = a; i <= c; i++) occ[row + i] = occStamp;
    }
  }
  var bbx = new Float64Array(16), bby = new Float64Array(16);
  function silhouette(r) {
    /* screen bbox of the main mass, and a rectangle certainly inside it */
    var ca = cos(r.yaw), sa = sin(r.yaw), j, n = 0, ok = true;
    for (j = 0; j < 4; j++) {
      var lx = (j === 0 || j === 3) ? -r.hw : r.hw;
      var ly = (j < 2) ? -r.hd : r.hd;
      var wx = r.wx + lx * ca - ly * sa, wy = r.wy + lx * sa + ly * ca;
      if (!proj(wx, wy, 0)) { ok = false; break; }
      bbx[n] = px; bby[n] = py; n++;
      if (!proj(wx, wy, r.solidz)) { ok = false; break; }
      bbx[n] = px; bby[n] = py; n++;
    }
    if (!ok) return null;
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (j = 0; j < n; j++) {
      if (bbx[j] < x0) x0 = bbx[j]; if (bbx[j] > x1) x1 = bbx[j];
      if (bby[j] < y0) y0 = bby[j]; if (bby[j] > y1) y1 = bby[j];
    }
    /* the inner third of the mass is opaque whatever the yaw */
    var mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    var iw = (x1 - x0) * 0.17, ih = (y1 - y0) * 0.32;
    return { x0: x0, y0: y0, x1: x1, y1: y1, ix0: mx - iw, iy0: my - ih, ix1: mx + iw, iy1: my + ih };
  }

  /* ---------------------------------------------------------- frame */
  var vis = [];
  function render() {
    var t0 = performance.now();
    updateCam();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    bloom.length = 0; GSTRIPS = 0;

    var _p = PROF, _t = performance.now(), _m = _p ? function (k) { var n = performance.now(); _p[k] = (_p[k] || 0) + (n - _t); _t = n; } : function () { };
    drawSky(); _m('sky');
    drawGroundDetail(); _m('ground');
    drawRoads(); _m('roads');
    drawWater(); _m('water');

    /* gather what is in front of us, sort far to near */
    vis = [];
    var i, n = blds.length;
    for (i = 0; i < n; i++) {
      var r = blds[i];
      r.hit.length = 0;
      var d = depthOf(r.wx, r.wy, r.topz * 0.4);
      if (d < 14) continue;
      var scr = (Math.max(r.hw, r.hd) * 2 + r.topz) * (FOC / d);
      if (scr < 2.6) continue;
      if (!proj(r.wx, r.wy, r.topz * 0.5)) continue;
      var pad = scr + 60;
      if (px < -pad || px > W + pad || py < -pad || py > H + pad) continue;
      r._d = d; r.hz = hazeAt(d);
      vis.push(r);
    }
    vis.sort(function (a, b) { return b._d - a._d; });
    if (vis.length > 230) vis.splice(0, vis.length - 230);

    /* front to back: throw away everything a nearer mass already hides */
    occReset();
    var keep = [];
    for (i = vis.length - 1; i >= 0; i--) {
      var rv = vis[i];
      var sil = silhouette(rv);
      if (!sil) continue;
      if (occCovered(sil.x0 - 2, sil.y0 - 2, sil.x1 + 2, sil.y1 + 2)) continue;
      keep.push(rv);
      if (!rv.canopies && (sil.ix1 - sil.ix0) > OCCS && (sil.iy1 - sil.iy0) > OCCS) {
        occMark(sil.ix0, sil.iy0, sil.ix1, sil.iy1);
      }
    }
    keep.reverse();
    vis = keep;

    _m('sort');
    castShadows(vis); _m('shadows');
    drawScrub(); _m('scrub');

    /* a detail budget: only the buildings that actually read get glass,
       floor lines and per-face gradients */
    var budget = dragging ? 14 : 42, ranked = vis.slice().sort(function (a, b) { return a._d - b._d; });
    for (i = 0; i < ranked.length; i++) ranked[i]._q = i < budget;
    for (i = 0; i < vis.length; i++) drawBuilding(vis[i], vis[i]._q);
    _m('blds');

    drawLabels();
    if (cur && rec[cur] && rec[cur].boxes) drawMarker(rec[cur], true);
    if (hovered && hovered !== cur && rec[hovered]) drawMarker(rec[hovered], false);

    /* bloom: only the brightest pixels bleed */
    if (bloom.length) {
      ctx.globalCompositeOperation = 'lighter';
      for (i = 0; i < bloom.length; i++) {
        var bl = bloom[i];
        spriteAt(SPR.glint, bl[0], bl[1], bl[2], bl[2], bl[3]);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    /* the grade: haze wash toward the sun, vignette, then grain */
    if (sunAhead) {
      ctx.globalCompositeOperation = 'lighter';
      spriteAt(SPR.glow, sunSX, sunSY, Math.max(W, H) * 0.34, Math.max(W, H) * 0.28, 0.15);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.fillStyle = vigGrad; ctx.fillRect(0, 0, W, H);
    if (SPR.grainPat) {
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.10;
      ctx.fillStyle = SPR.grainPat;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
    _m('grade');
    lastFrameMs = performance.now() - t0;
    if (frameSamples.length < 400) frameSamples.push(lastFrameMs);
  }

  /* ------------------------------------------------------ camera run */
  var running = false, lastT = 0, lastAct = 0, needs = true;
  function startLoop() {
    lastAct = performance.now();
    if (reduced()) { updateCam(); render(); return; }
    running = true; lastT = performance.now();
    requestAnimationFrame(loop);
  }
  function loop(now) {
    if (!running) return;
    var dt = Math.min(64, now - lastT); lastT = now;
    stepCam(now, dt);
    render();
    requestAnimationFrame(loop);
  }
  function stepCam(now, dt) {
    if (fly) {
      var t = clamp((now - fly.t0) / fly.dur, 0, 1);
      var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      cam.az = fly.a0.az + (fly.a1.az - fly.a0.az) * e;
      cam.el = fly.a0.el + (fly.a1.el - fly.a0.el) * e;
      cam.dist = fly.a0.dist + (fly.a1.dist - fly.a0.dist) * e;
      cam.tx = fly.a0.tx + (fly.a1.tx - fly.a0.tx) * e;
      cam.ty = fly.a0.ty + (fly.a1.ty - fly.a0.ty) * e;
      camT.az = cam.az; camT.el = cam.el; camT.dist = cam.dist; camT.tx = cam.tx; camT.ty = cam.ty;
      if (t >= 1) fly = null;
      return;
    }
    /* the scene breathes when nobody is touching it */
    if (now - lastAct > 3200) {
      var k = (now - lastAct - 3200) / 2600;
      var amp = clamp(k, 0, 1);
      camT.az += 0.000035 * dt * amp;
      camT.el = camT.el + (0.222 + 0.016 * sin(now / 7400) - camT.el) * 0.004 * amp;
    }
    var f = 1 - Math.pow(0.0016, dt / 1000);
    cam.az += (camT.az - cam.az) * f;
    cam.el += (camT.el - cam.el) * f;
    cam.dist += (camT.dist - cam.dist) * f;
    cam.tx += (camT.tx - cam.tx) * f;
    cam.ty += (camT.ty - cam.ty) * f;
  }
  function paintNow() { updateCam(); render(); }
  function touch() { lastAct = performance.now(); if (reduced()) paintNow(); }

  /* the establishing shot: low, close, with mass in the foreground */
  function homeShot() {
    var big = dists.slice().sort(function (a, b) { return b.size - a.size; })[0];
    var tx = (big.x * 0.55 + bounds.cx * 0.45), ty = (big.y * 0.55 + bounds.cy * 0.45);
    var el = 0.285, dist = clamp(bounds.r * 0.64, 640, 1150);
    /* Choose the bearing like a location scout: mass close enough to feel,
       more mass behind it, both sides of the frame carrying something, and
       the sun low and near the edge of the shot. */
    var bestA = 0.7, bestS = -1, a, i;
    for (a = 0; a < TAU; a += TAU / 72) {
      var ex = tx + dist * cos(el) * cos(a), ey = ty + dist * cos(el) * sin(a);
      var fx = (tx - ex), fy = (ty - ey), fl = Math.hypot(fx, fy) || 1; fx /= fl; fy /= fl;
      var near = 0, mid = 0, L = 0, R = 0;
      for (i = 0; i < blds.length; i++) {
        var r = blds[i];
        var vx = r.wx - ex, vy = r.wy - ey;
        var d = vx * fx + vy * fy;
        if (d < 100 || d > 2400) continue;
        var lat = -vx * fy + vy * fx;
        if (abs(lat) > d * 0.58) continue;
        var m = r.topz / (1 + abs(lat) / 340);
        if (d < 620) { near += m; if (lat < 0) L += m; else R += m; }
        else if (d < 1700) mid += m * 0.55;
      }
      if (near < 1 || mid < 1) continue;
      var bal = (L + R) > 0 ? Math.min(L, R) / Math.max(L, R) : 0;
      var fdot = -cos(a - SUN_AZ);
      var lw = Math.exp(-Math.pow((fdot - 0.80) / 0.34, 2));
      var s = sqrt(near) * sqrt(mid) * (0.50 + 0.50 * bal) * (0.62 + 0.76 * lw);
      if (s > bestS) { bestS = s; bestA = a; }
    }
    HOME = { az: bestA, el: el, dist: dist, tx: tx, ty: ty };
    cam.az = camT.az = bestA; cam.el = camT.el = el;
    cam.dist = camT.dist = dist; cam.tx = camT.tx = tx; cam.ty = camT.ty = ty;
    updateCam();
  }

  function flyTo(tx, ty, dist, az, el, dur) {
    if (reduced()) {
      camT.tx = cam.tx = tx; camT.ty = cam.ty = ty; camT.dist = cam.dist = dist;
      if (az != null) camT.az = cam.az = az;
      if (el != null) camT.el = cam.el = el;
      paintNow(); return;
    }
    var a1 = { tx: tx, ty: ty, dist: dist, az: az == null ? cam.az : az, el: el == null ? cam.el : el };
    /* take the short way round */
    while (a1.az - cam.az > PI) a1.az -= TAU;
    while (a1.az - cam.az < -PI) a1.az += TAU;
    fly = { t0: performance.now(), dur: dur || 1150, a0: { az: cam.az, el: cam.el, dist: cam.dist, tx: cam.tx, ty: cam.ty }, a1: a1 };
    lastAct = performance.now() + (dur || 1150);
  }

  /* ==================================================================
     PICKING — the quads painted this frame are the hit test.
     ================================================================== */
  function inQuad(q, x, y) {
    var s = 0, i, j;
    for (i = 0, j = 3; i < 4; j = i++) {
      var xi = q[i * 2], yi = q[i * 2 + 1], xj = q[j * 2], yj = q[j * 2 + 1];
      var c = (xj - xi) * (y - yi) - (yj - yi) * (x - xi);
      if (c > 0) s++; else if (c < 0) s--;
    }
    return s === 4 || s === -4;
  }
  function pick(x, y) {
    var i, j;
    for (i = vis.length - 1; i >= 0; i--) {
      var r = vis[i], hs = r.hit;
      for (j = 0; j < hs.length; j++) if (inQuad(hs[j], x, y)) return r.slug;
    }
    return null;
  }

  /* -------------------------------------------------------------- hud */
  function buildHud() {
    var counts = {};
    Object.keys(rec).forEach(function (s) { counts[rec[s].arch] = (counts[rec[s].arch] || 0) + 1; });
    $('#keylist').innerHTML = ARCH_ORDER.map(function (a) {
      return '<li><b style="background:' + ARCH[a].chip + '"></b>' + ARCH[a].name +
        ' <u>' + (counts[a] || 0) + '</u></li>';
    }).join('') + '<li><b style="background:#1E7F86"></b>River <u>order</u></li>' +
      '<li><b style="background:#8A7461;border-style:dashed"></b>Derelict <u>' +
      Object.keys(rec).filter(function (s) { return rec[s].derelict; }).length + '</u></li>';

    var mixed = dists.filter(function (d) { return !d.orphan && d.purity < 0.55 && d.size >= 8; })
      .sort(function (a, b) { return a.purity - b.purity; });
    var nt = 'Purity is how far a link community agrees with how the docs are filed. ';
    if (mixed.length) {
      nt += 'The <b>' + esc(mixed[0].name) + '</b> quarter is ' + mixed[0].purity.toFixed(2) +
        ' pure over ' + mixed[0].size + ' pages';
      if (mixed[1]) nt += ', the <b>' + esc(mixed[1].name) + '</b> quarter ' + mixed[1].purity.toFixed(2) +
        ' over ' + mixed[1].size;
      nt += '. Those pages cite each other constantly but live in different filed sections. They are laid out skewed off the city grid.';
    }
    $('#notetext').innerHTML = nt;
    $('#notebtns').innerHTML = mixed.slice(0, 2).map(function (d) {
      return '<button data-d="' + d.i + '">Fly to ' + esc(d.name) + '</button>';
    }).join('') + '<button data-d="' + (dists[dists.length - 1].orphan ? dists.length - 1 : 0) + '">Unlinked ground</button>';
    $('#notebtns').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var d = dists[+b.getAttribute('data-d')];
      flyTo(d.x, d.y, clamp(d.r * 1.9, 380, 1000), null, 0.235);
      touch();
    });

    $('#stats').innerHTML =
      '<span><b>290</b> pages</span><span><b>' + nfmt(G.edges.length) + '</b> citations</span>' +
      '<span><b>' + dists.length + '</b> districts</span><span>golden hour</span>';
  }

  /* ------------------------------------------------------------- wire */
  var dragging = false, hovered = null;
  function wire() {
    var moved = 0, lx = 0, ly = 0, pid = null, downSlug = null;

    worldEl.addEventListener('pointerdown', function (e) {
      if (e.target.closest('#hud') || e.target.closest('#tools')) return;
      dragging = true; moved = 0; lx = e.clientX; ly = e.clientY; pid = e.pointerId;
      var r = cv.getBoundingClientRect();
      downSlug = pick(e.clientX - r.left, e.clientY - r.top);
      fly = null;
      worldEl.classList.add('drag');
      touch();
      try { worldEl.setPointerCapture(pid); } catch (err) { }
    });
    worldEl.addEventListener('pointermove', function (e) {
      if (!dragging) { hoverAt(e); return; }
      var dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY; moved += abs(dx) + abs(dy);
      camT.az -= dx * 0.0045;
      camT.el = clamp(camT.el - dy * 0.0022, 0.055, 0.62);
      touch();
    });
    var up = function () {
      if (!dragging) return;
      dragging = false; worldEl.classList.remove('drag');
      try { worldEl.releasePointerCapture(pid); } catch (err) { }
      if (moved < 7 && downSlug) location.hash = '#' + downSlug;
      downSlug = null;
      touch();
    };
    worldEl.addEventListener('pointerup', up);
    worldEl.addEventListener('pointercancel', function () { dragging = false; worldEl.classList.remove('drag'); });
    worldEl.addEventListener('pointerleave', function () { setHover(null); });
    worldEl.addEventListener('wheel', function (e) {
      e.preventDefault();
      fly = null;
      camT.dist = clamp(camT.dist * (e.deltaY > 0 ? 1.13 : 0.885), 120, Math.max(1700, bounds.r * 1.75));
      touch();
    }, { passive: false });

    $('#cIn').onclick = function () { fly = null; camT.dist = clamp(camT.dist * 0.72, 120, 4000); touch(); };
    $('#cOut').onclick = function () { fly = null; camT.dist = clamp(camT.dist * 1.38, 120, Math.max(1700, bounds.r * 1.75)); touch(); };
    $('#cRotL').onclick = function () { fly = null; camT.az -= 0.55; touch(); };
    $('#cRotR').onclick = function () { fly = null; camT.az += 0.55; touch(); };
    $('#cHome').onclick = function () { if (HOME) flyTo(HOME.tx, HOME.ty, HOME.dist, HOME.az, HOME.el, 1250); touch(); };

    $('#btnIndex').onclick = function () {
      var on = sideEl.hasAttribute('hidden');
      if (on) sideEl.removeAttribute('hidden'); else sideEl.setAttribute('hidden', '');
      this.setAttribute('aria-pressed', on ? 'true' : 'false');
    };
    $('#btnWide').onclick = function () {
      var on = !document.body.classList.contains('wide');
      document.body.classList.toggle('wide', on);
      this.setAttribute('aria-pressed', on ? 'true' : 'false');
      this.textContent = on ? 'Show the page' : 'Widen the view';
      requestAnimationFrame(function () { resize(); touch(); if (reduced()) paintNow(); });
    };
    $('#btnPrev').onclick = function () { step(-1); };
    $('#btnNext').onclick = function () { step(1); };
    $('#btnLocate').onclick = function () { locate(true); };

    window.addEventListener('hashchange', route);
    var rt = null;
    window.addEventListener('resize', function () {
      if (rt) clearTimeout(rt);
      rt = setTimeout(function () { resize(); if (reduced()) paintNow(); }, 90);
    });

    docEl.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return;
      if (href.slice(0, 2) === '#/') return;
      e.preventDefault();
      gotoAnchor(href.slice(1));
    });
    docEl.addEventListener('click', function (e) {
      var t = e.target.closest('.tb'); if (!t) return;
      selectTab(t.getAttribute('data-g'), t.getAttribute('data-v'));
    });
    sideEl.addEventListener('click', function (e) {
      if (e.target.closest('a') && window.innerWidth < 1040) {
        sideEl.setAttribute('hidden', ''); $('#btnIndex').setAttribute('aria-pressed', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); $('#q').focus(); $('#q').select();
      } else if (e.key === 'Escape') {
        closeResults();
        if (!sideEl.hasAttribute('hidden')) { sideEl.setAttribute('hidden', ''); $('#btnIndex').setAttribute('aria-pressed', 'false'); }
      }
    });
    RM.addEventListener ? RM.addEventListener('change', function () {
      if (reduced()) { running = false; paintNow(); } else if (!running) startLoop();
    }) : null;
    wireSearch();
  }

  function step(dir) {
    var i = orderIx[cur];
    if (i === undefined) return;
    var n = clamp(i + dir, 0, order.length - 1);
    if (n !== i) location.hash = '#' + order[n];
  }

  function hoverAt(e) {
    var r = cv.getBoundingClientRect();
    setHover(pick(e.clientX - r.left, e.clientY - r.top), e);
  }
  function setHover(slug, e) {
    if (hovered === slug) { if (slug && e) placeTip(e); return; }
    hovered = slug;
    if (!slug) { tipEl.classList.remove('on'); if (reduced()) paintNow(); return; }
    var r = rec[slug];
    $('.tt', tipEl).textContent = title(r.p);
    $('.tm', tipEl).textContent = ARCH[r.arch].name + ' · ' + ARCH[r.arch].mat + ' · ' +
      r.inb + ' in, ' + r.outb + ' out';
    tipEl.classList.add('on');
    if (e) placeTip(e);
    if (reduced()) paintNow();
  }
  function placeTip(e) {
    var vp = worldEl.getBoundingClientRect();
    tipEl.style.left = clamp(e.clientX - vp.left, 100, vp.width - 100) + 'px';
    tipEl.style.top = (e.clientY - vp.top) + 'px';
  }

  /* -------------------------------------------------------------- nav */
  function buildNav() {
    var h = [], done = {};
    B.nav.forEach(function (sec) {
      h.push('<h5 class="' + (sec.product === 'cloud' ? 'cloud' : 'cms') + '">' +
        esc(sec.product === 'cloud' ? 'Cloud · ' : 'CMS · ') + esc(sec.label) + '</h5>');
      (function walk(items, depth) {
        items.forEach(function (it) {
          if (it.slug && pages[it.slug]) {
            done[it.slug] = 1;
            navFlat.push(it.slug);
            h.push('<a class="d' + depth + '" href="#' + attr(it.slug) + '" data-s="' + attr(it.slug) + '">' +
              esc(it.label || title(pages[it.slug])) + '</a>');
          }
          if (it.items) walk(it.items, Math.min(depth + 1, 3));
        });
      })(sec.items, 1);
    });
    var rest = order.filter(function (s) { return !done[s]; });
    if (rest.length) {
      h.push('<h5>Also in the corpus · ' + rest.length + '</h5>');
      rest.forEach(function (s) {
        navFlat.push(s);
        h.push('<a class="d1" href="#' + attr(s) + '" data-s="' + attr(s) + '">' + esc(title(pages[s])) + '</a>');
      });
    }
    sideEl.innerHTML = h.join('');
  }

  /* ----------------------------------------------------------- search */
  function collectText(bs, out, depth) {
    if (!bs || depth > 6) return;
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      switch (b.t) {
        case 'p': case 'tldr': out.push(stripTags(b.html)); break;
        case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': out.push(b.text); break;
        case 'ul': case 'ol':
          b.items.forEach(function (it) {
            if (typeof it === 'string') out.push(stripTags(it));
            else { out.push(stripTags(it.html || '')); collectText(it.blocks, out, depth + 1); }
          });
          break;
        case 'code': out.push(b.title || ''); break;
        case 'admonition': out.push(b.title || ''); collectText(b.blocks, out, depth + 1); break;
        case 'details': out.push(stripTags(b.summary)); collectText(b.blocks, out, depth + 1); break;
        case 'table':
          out.push(b.head.map(stripTags).join(' '));
          b.rows.forEach(function (r) { out.push(r.map(stripTags).join(' ')); });
          break;
        case 'tabs': b.tabs.forEach(function (t) { out.push(t.label); collectText(t.blocks, out, depth + 1); }); break;
        case 'columns': b.cols.forEach(function (c) { collectText(Array.isArray(c) ? c : c.blocks, out, depth + 1); }); break;
        case 'cards': b.items.forEach(function (c) { out.push(c.title + ' ' + (c.desc || '')); }); break;
        case 'endpoint':
          out.push([b.method, b.path, b.title, stripTags(b.description || '')].join(' '));
          (b.params || []).forEach(function (p) { out.push(p.name + ' ' + stripTags(p.desc || '')); });
          break;
      }
    }
  }
  function buildSearchIndex() {
    var i = 0;
    var next = window.requestIdleCallback ? function (f) { requestIdleCallback(f, { timeout: 900 }); } : function (f) { setTimeout(f, 1); };
    (function slice() {
      var t0 = performance.now();
      while (i < order.length && performance.now() - t0 < 22) {
        var s = order[i++], p = pages[s], out = [];
        collectText(p.blocks, out, 0);
        searchIdx.push({
          s: s, t: title(p), sec: p.section, prod: p.product,
          hay: (title(p) + '  ' + (p.description || '') + '  ' + (p.tags || []).join(' ') + '  ' +
            (p.headings || []).map(function (h) { return h.text; }).join(' ') + '  ' + s).toLowerCase(),
          body: out.join('  ')
        });
      }
      if (i < order.length) next(slice); else searchReady = true;
    })();
  }
  function search(v) {
    var terms = v.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 1; });
    if (!terms.length) return [];
    var out = [];
    for (var i = 0; i < searchIdx.length; i++) {
      var e = searchIdx[i], sc = 0, ok = true;
      for (var j = 0; j < terms.length; j++) {
        var t = terms[j];
        var a = e.hay.indexOf(t), b = a < 0 ? e.body.toLowerCase().indexOf(t) : -1;
        if (a < 0 && b < 0) { ok = false; break; }
        if (a >= 0) sc += 40 + (e.t.toLowerCase().indexOf(t) === 0 ? 40 : 0) - Math.min(a, 30);
        else sc += 8;
      }
      if (!ok) continue;
      sc += Math.min(20, (G.inbound[e.s] || 0));
      out.push({ s: e.s, t: e.t, sec: e.sec, prod: e.prod, body: e.body, score: sc });
    }
    out.sort(function (a, b) { return b.score - a.score; });
    out = out.slice(0, 30);
    out.forEach(function (h) { h.snip = snippet(h.body, terms); });
    return out;
  }
  function snippet(body, terms) {
    var lb = body.toLowerCase(), at = -1, i;
    for (i = 0; i < terms.length; i++) { at = lb.indexOf(terms[i]); if (at >= 0) break; }
    if (at < 0) return body.slice(0, 130);
    var s = Math.max(0, at - 48);
    return (s ? '…' : '') + body.slice(s, s + 148) + '…';
  }
  function hlmark(text, v) {
    var terms = v.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 1; });
    var h = esc(text);
    terms.forEach(function (t) {
      h = h.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
    });
    return h;
  }
  function wireSearch() {
    var q = $('#q'), res = $('#results'), sel = -1;
    function run() {
      var v = q.value.trim();
      if (v.length < 2) { closeResults(); return; }
      if (!searchReady && !searchIdx.length) { res.innerHTML = '<div class="none">Indexing…</div>'; res.classList.add('on'); return; }
      var rows = search(v); sel = -1;
      if (!rows.length) { res.innerHTML = '<div class="none">Nothing found for “' + esc(v) + '”</div>'; }
      else {
        res.innerHTML = rows.map(function (h) {
          return '<a href="#' + attr(h.s) + '"><span class="rt">' + hlmark(h.t, v) + '</span>' +
            '<span class="rp">' + esc(h.prod === 'cloud' ? 'Cloud' : 'CMS') + ' · ' + esc(h.sec) + '</span>' +
            '<span class="rs">' + hlmark(h.snip, v) + '</span></a>';
        }).join('');
      }
      res.classList.add('on'); q.setAttribute('aria-expanded', 'true');
    }
    q.addEventListener('input', run);
    q.addEventListener('focus', function () { if (q.value.trim().length >= 2) run(); });
    q.addEventListener('keydown', function (e) {
      var as = res.querySelectorAll('a');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!as.length) return;
        e.preventDefault();
        if (sel >= 0) as[sel].classList.remove('on');
        sel = clamp(sel + (e.key === 'ArrowDown' ? 1 : -1), 0, as.length - 1);
        as[sel].classList.add('on'); as[sel].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        if (sel >= 0 && as[sel]) { location.hash = as[sel].getAttribute('href'); closeResults(); q.blur(); }
        else if (as.length) { location.hash = as[0].getAttribute('href'); closeResults(); q.blur(); }
      } else if (e.key === 'Escape') { closeResults(); q.blur(); }
    });
    res.addEventListener('click', function () { closeResults(); });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#searchwrap')) closeResults();
    });
  }
  function closeResults() {
    var res = $('#results');
    res.classList.remove('on'); res.innerHTML = '';
    $('#q').setAttribute('aria-expanded', 'false');
  }

  /* ------------------------------------------------------------ route */
  function route() {
    var h = location.hash || '';
    var slug = h.charAt(0) === '#' ? h.slice(1) : h;
    if (!slug || slug === '/') {
      slug = pages['/cms/intro'] ? '/cms/intro' : order[0];
      try { history.replaceState(null, '', '#' + slug); } catch (err) { }
    }
    if (!pages[slug]) {
      var alt = slug.replace(/\/+$/, '');
      if (pages[alt]) slug = alt;
    }
    if (!pages[slug]) {
      cur = null;
      document.title = 'Not found - Strapi Documentation';
      docEl.innerHTML = '<h1>No such page</h1><p class="lede">Nothing in this survey is filed under <code>' +
        esc(slug) + '</code>.</p><p><a href="#/cms/intro">Return to the introduction</a>.</p>';
      rbodyEl.scrollTop = 0;
      return;
    }
    openPage(slug);
  }

  function openPage(slug) {
    var same = cur === slug;
    cur = slug;
    renderPage(slug);
    markNav(slug);
    if (!same) rbodyEl.scrollTop = 0;
    if (!document.body.classList.contains('booting')) locate(false);
  }

  function locate(force) {
    var r = rec[cur];
    if (!r || !r.boxes) return;
    /* stand outside the lot and look back across the city, so the page is in
       the foreground and its neighbours fill the frame behind it */
    var ux = r.wx - bounds.cx, uy = r.wy - bounds.cy;
    var ul = Math.hypot(ux, uy) || 1;
    var az = Math.atan2(uy / ul, ux / ul) + (rnd01(r.h32, 9) - 0.5) * 1.1;
    /* stand a block away, at the height of a low drone, so the page looms and
       its quarter fills the frame behind it */
    var dd2 = clamp(Math.max(150, r.solidz * 1.35), 165, 460);
    var el2 = 0.315;
    /* nudge the target off centre and a little into the air: a photograph,
       not a passport picture */
    var tx2 = r.wx - cos(az) * dd2 * 0.16, ty2 = r.wy - sin(az) * dd2 * 0.16;
    if (force) { flyTo(tx2, ty2, dd2, az, el2, 1250); touch(); return; }
    if (fly) return;
    var d = depthOf(r.wx, r.wy, r.solidz * 0.5);
    var on = d > 20 && proj(r.wx, r.wy, r.solidz * 0.5) &&
      px > W * 0.08 && px < W * 0.92 && py > HORY + 10 && py < H - 20 && d < 900;
    if (!on) flyTo(tx2, ty2, dd2, az, el2, 1150);
    if (reduced()) paintNow();
  }

  function markNav(slug) {
    var on = sideEl.querySelector('a.on');
    if (on) on.classList.remove('on');
    var a = sideEl.querySelector('a[data-s="' + (window.CSS && CSS.escape ? CSS.escape(slug) : slug) + '"]');
    if (a) { a.classList.add('on'); }
  }
  function gotoAnchor(id) {
    var el = null;
    try { el = docEl.querySelector('#' + (window.CSS && CSS.escape ? CSS.escape(id) : id)); } catch (e) { }
    if (!el) return;
    var d = el.closest('details'); if (d && !d.open) d.open = true;
    rbodyEl.scrollTop = el.offsetTop - 8;
  }
  function selectTab(gid, val) {
    var groups = docEl.querySelectorAll('.tabs[data-g="' + gid + '"]'), i, j;
    for (i = 0; i < groups.length; i++) {
      var bts = groups[i].querySelectorAll('.tb'), pans = groups[i].querySelectorAll('.tp'), hit = -1;
      for (j = 0; j < bts.length; j++) if (bts[j].getAttribute('data-v') === val) hit = j;
      if (hit < 0) continue;
      for (j = 0; j < bts.length; j++) bts[j].setAttribute('aria-selected', j === hit ? 'true' : 'false');
      for (j = 0; j < pans.length; j++) pans[j].hidden = (j !== hit);
    }
  }

  /* ------------------------------------------------------------- page */
  function renderPage(slug) {
    var p = pages[slug], r = rec[slug];
    document.title = title(p) + ' - Strapi Documentation';
    $('#sheetno').textContent = pad3((orderIx[slug] || 0) + 1);

    var A = ARCH[r.arch];
    document.documentElement.style.setProperty('--sp', A.chip);
    document.documentElement.style.setProperty('--spt', r.arch === 'civic' || r.arch === 'records' ? '#17131F' : '#F8F0E3');
    $('#spinetext').textContent = A.name.toUpperCase() + '  ·  ' + (r.dist ? r.dist.name : '');

    var h = [];
    h.push('<h1>' + esc(title(p)) + '</h1>');
    if (p.description) h.push('<p class="lede">' + esc(p.description) + '</p>');

    h.push('<div class="meta">');
    h.push('<span class="chip arch">' + esc(A.name) + ' · ' + esc(A.mat) + '</span>');
    h.push('<span class="chip"><b>' + nfmt(r.words) + '</b> words</span>');
    h.push('<span class="chip"><b>' + r.code + '</b> code block' + (r.code === 1 ? '' : 's') + '</span>');
    h.push('<span class="chip"><b>' + r.inb + '</b> page' + (r.inb === 1 ? '' : 's') + ' cite this</span>');
    h.push('<span class="chip"><b>' + r.outb + '</b> link' + (r.outb === 1 ? '' : 's') + ' out</span>');
    (p.tags || []).forEach(function (t) { h.push('<span class="chip tag">' + esc(t) + '</span>'); });
    h.push('</div>');

    var hs = (p.headings || []).filter(function (x) { return x.level >= 2 && x.level <= 4; });
    if (hs.length > 2) {
      h.push('<details class="toc" open><summary>On this page · ' + hs.length + ' sections</summary><ol>');
      hs.forEach(function (x) {
        h.push('<li class="d' + x.level + '"><a href="#' + attr(x.id) + '">' + esc(x.text) + '</a></li>');
      });
      h.push('</ol></details>');
    }

    h.push(blocks(p.blocks, 0));

    var to = (adjOut[slug] || []).filter(function (s) { return pages[s]; });
    var from = (adjIn[slug] || []).filter(function (s) { return pages[s]; });
    if (to.length || from.length) {
      h.push('<div class="links"><h3>Streets off this lot</h3>');
      if (to.length) {
        h.push('<p class="n">' + to.length + ' page' + (to.length === 1 ? '' : 's') + ' this one links to</p><ul>');
        to.forEach(function (s) { h.push('<li><a href="#' + attr(s) + '">' + esc(title(pages[s])) + '</a></li>'); });
        h.push('</ul>');
      }
      if (from.length) {
        h.push('<p class="n">' + from.length + ' page' + (from.length === 1 ? '' : 's') + ' citing this one</p><ul>');
        from.forEach(function (s) { h.push('<li><a href="#' + attr(s) + '">' + esc(title(pages[s])) + '</a></li>'); });
        h.push('</ul>');
      }
      h.push('</div>');
    }

    var i = orderIx[slug];
    var prev = i > 0 ? order[i - 1] : null, next = i < order.length - 1 ? order[i + 1] : null;
    h.push('<nav class="pn2" aria-label="Reading order">');
    h.push(prev ? '<a href="#' + attr(prev) + '"><div class="k">Upstream</div><div class="v">' + esc(title(pages[prev])) + '</div></a>' : '<span class="sp"></span>');
    h.push(next ? '<a class="nx" href="#' + attr(next) + '"><div class="k">Downstream</div><div class="v">' + esc(title(pages[next])) + '</div></a>' : '<span class="sp"></span>');
    h.push('</nav>');

    docEl.innerHTML = h.join('');
    $('#crumb').innerHTML = '<b>' + esc(p.product === 'cloud' ? 'Cloud' : 'CMS') + '</b><i>/</i>' + esc(p.section) +
      (r.dist ? '<i>/</i>' + esc(r.dist.name) + ' quarter' : '');
  }

  /* ----------------------------------------------------------- blocks */
  function blocks(bs, depth) {
    if (!bs || !bs.length) return '';
    var out = [];
    for (var i = 0; i < bs.length; i++) out.push(block(bs[i], depth));
    return out.join('');
  }
  var tabUid = 0;
  var ADM_LABEL = {
    note: 'Note', tip: 'Tip', info: 'Info', caution: 'Caution', warning: 'Warning',
    danger: 'Danger', prerequisites: 'Prerequisites', strapi: 'Strapi', callout: 'Callout'
  };
  function alStyle(a) {
    if (a === 'center') return ' style="text-align:center"';
    if (a === 'right') return ' style="text-align:right"';
    return '';
  }
  function block(b, depth) {
    if (!b || !b.t) return '';
    switch (b.t) {
      case 'p': return '<p>' + fixHtml(b.html) + '</p>';
      case 'tldr': return '<div class="tldr"><div class="at">In short</div><p>' + fixHtml(b.html) + '</p></div>';
      case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
        return '<' + b.t + ' id="' + attr(b.id) + '">' + esc(b.text) +
          '<a class="ha" href="#' + attr(b.id) + '" aria-label="Link to this section">#</a></' + b.t + '>';
      case 'hr': return '<hr>';
      case 'ul': case 'ol': {
        var st = (b.t === 'ol' && b.start && b.start !== 1) ? ' start="' + Number(b.start) + '"' : '';
        var li = b.items.map(function (it) {
          if (typeof it === 'string') return '<li>' + fixHtml(it) + '</li>';
          return '<li>' + fixHtml(it.html || '') + (it.blocks ? blocks(it.blocks, depth + 1) : '') + '</li>';
        }).join('');
        return '<' + b.t + st + '>' + li + '</' + b.t + '>';
      }
      case 'code': return codeBlock(b.code, b.lang, b.title);
      case 'admonition': {
        var kind = (b.kind || 'note').toLowerCase();
        var label = (b.title && String(b.title).trim()) ? b.title : (ADM_LABEL[kind] || kind);
        return '<div class="adm adm-' + attr(kind) + '" role="note">' +
          '<p class="at">' + esc(label) + '</p>' + blocks(b.blocks, depth + 1) + '</div>';
      }
      case 'details':
        return '<details class="det"' + (b.id ? ' id="' + attr(b.id) + '"' : '') + '><summary>' +
          fixHtml(b.summary || 'Details') + '</summary><div class="dc">' + blocks(b.blocks, depth + 1) + '</div></details>';
      case 'table': {
        var al = b.align || [];
        var head = '<tr>' + b.head.map(function (c, j) { return '<th' + alStyle(al[j]) + '>' + fixHtml(c) + '</th>'; }).join('') + '</tr>';
        var body = b.rows.map(function (row) {
          return '<tr>' + row.map(function (c, j) { return '<td' + alStyle(al[j]) + '>' + fixHtml(c) + '</td>'; }).join('') + '</tr>';
        }).join('');
        return '<div class="tw"><table><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
      }
      case 'tabs': {
        var gid = b.groupId || ('g' + (++tabUid));
        var bts = [], pans = [];
        b.tabs.forEach(function (t, j) {
          var v = t.value || t.label;
          bts.push('<button class="tb" type="button" role="tab" data-g="' + attr(gid) + '" data-v="' + attr(v) +
            '" aria-selected="' + (j === 0 ? 'true' : 'false') + '">' + esc(t.label) + '</button>');
          pans.push('<div class="tp" role="tabpanel"' + (j === 0 ? '' : ' hidden') + '>' + blocks(t.blocks, depth + 1) + '</div>');
        });
        return '<div class="tabs" data-g="' + attr(gid) + '"><div class="tl" role="tablist">' +
          bts.join('') + '</div>' + pans.join('') + '</div>';
      }
      case 'img': {
        var src = b.light || b.dark || '';
        var cap = b.caption ? '<figcaption>' + fixHtml(b.caption) + '</figcaption>' : '';
        if (!src) return '';
        return '<figure class="fig"><span class="mat"><img src="' + attr(src) + '" alt="' + attr(b.alt || '') +
          '" loading="lazy" decoding="async"></span>' + cap + '</figure>';
      }
      case 'cards':
        return '<div class="cards">' + b.items.map(function (c) {
          var ext = /^https?:/.test(c.link || '');
          return '<a class="card" href="' + attr(c.link || '#/') + '"' +
            (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
            '<span class="ct2">' + esc(c.title) + '</span>' +
            (c.desc ? '<span class="cd">' + esc(c.desc) + '</span>' : '') + '</a>';
        }).join('') + '</div>';
      case 'badge':
        return '<p><span class="badge badge-' + attr((b.kind || 'plain').toLowerCase()) + '"' +
          (b.tooltip ? ' title="' + attr(b.tooltip) + '"' : '') + '>' + esc(b.label) + '</span></p>';
      case 'columns':
        return '<div class="cols">' + b.cols.map(function (c) {
          return '<div>' + blocks(Array.isArray(c) ? c : (c.blocks || []), depth + 1) + '</div>';
        }).join('') + '</div>';
      case 'endpoint': return endpoint(b, depth);
      default:
        return b.html ? '<p>' + fixHtml(b.html) + '</p>' : (b.text ? '<p>' + esc(b.text) + '</p>' : '');
    }
  }

  function endpoint(b) {
    var m = (b.method || '').toUpperCase() || (b.kind === 'js' ? 'JS' : 'CALL');
    var h = ['<div class="ep"' + (b.id ? ' id="' + attr(b.id) + '"' : '') + '>'];
    h.push('<div class="eh"><span class="m m-' + attr(m) + '">' + esc(m) + '</span>' +
      '<span class="pth">' + esc(b.path || b.title || '') + '</span>' +
      (b.title && b.path ? '<span class="et">' + esc(b.title) + '</span>' : '') + '</div>');
    h.push('<div class="eb">');
    if (b.description) h.push('<p>' + fixHtml(b.description) + '</p>');
    if (b.params && b.params.length) {
      h.push('<p class="es">' + esc(b.paramTitle || 'Parameters') + '</p>');
      h.push('<div class="tw"><table><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>');
      b.params.forEach(function (p) {
        h.push('<tr><td><span class="pn">' + esc(p.name) + '</span>' +
          (p.required ? ' <span class="req">required</span>' : '') + '</td>' +
          '<td><span class="pt">' + esc(p.type || '') + '</span></td>' +
          '<td>' + fixHtml(p.desc || '') + '</td></tr>');
      });
      h.push('</tbody></table></div>');
    }
    if (b.codeTabs && b.codeTabs.length) {
      h.push('<p class="es">Request</p>');
      var gid = 'ep' + (++tabUid), bts = [], pans = [];
      b.codeTabs.forEach(function (t, j) {
        bts.push('<button class="tb" type="button" role="tab" data-g="' + gid + '" data-v="' + attr(t.label) +
          '" aria-selected="' + (j === 0 ? 'true' : 'false') + '">' + esc(t.label) + '</button>');
        pans.push('<div class="tp" role="tabpanel"' + (j === 0 ? '' : ' hidden') + '>' + codeBlock(t.code, t.lang, '') + '</div>');
      });
      h.push('<div class="tabs" data-g="' + gid + '"><div class="tl" role="tablist">' + bts.join('') + '</div>' + pans.join('') + '</div>');
    }
    if (b.responses && b.responses.length) {
      h.push('<p class="es">Response</p>');
      b.responses.forEach(function (r) {
        var bad = Number(r.status) >= 400;
        h.push('<p><span class="st' + (bad ? ' err' : '') + '"><span class="dot"></span>' +
          esc(String(r.status == null ? '' : r.status)) + ' ' + esc(r.statusText || '') +
          (r.time ? ' · ' + esc(r.time) : '') + '</span></p>');
        var body = r.body || '';
        if (!/^\s*[[{"]/.test(body) && /<[a-zA-Z]/.test(body)) h.push('<p>' + fixHtml(body) + '</p>');
        else h.push(codeBlock(body, r.lang || 'json', ''));
      });
    }
    h.push('</div></div>');
    return h.join('');
  }

  /* ------------------------------------------------------------- code */
  var KW = /^(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|import|export|from|default|async|await|new|class|extends|implements|try|catch|finally|throw|typeof|instanceof|interface|type|enum|public|private|protected|readonly|declare|namespace|as|of|in|null|true|false|undefined|this|super|yield|void|delete|module|require|package|def|end|fn|use|pub|match|query|mutation|fragment|schema|FROM|RUN|COPY|CMD|ENV|WORKDIR|EXPOSE)$/;
  var HASHLANG = /^(bash|sh|shell|zsh|yaml|yml|env|dockerfile|txt|text|python|py|ruby|rb|toml|ini|conf)$/;
  var SLASHLANG = /^(js|jsx|ts|tsx|javascript|typescript|json|json5|c|cpp|java|go|rust|php|scss|css|graphql|http|diff)$/;

  function codeBlock(src, lang, ttl) {
    src = String(src == null ? '' : src);
    lang = (lang || '').toLowerCase();
    var head = '';
    if (ttl || lang) {
      head = '<div class="ct">' + (ttl ? esc(ttl) : '') + (lang ? '<span class="cl">' + esc(lang) + '</span>' : '') + '</div>';
    }
    return '<div class="cw">' + head + '<pre><code>' + highlight(src, lang) + '</code></pre></div>';
  }
  function highlight(src, lang) {
    var parts = [], i = 0, n = src.length, buf = '';
    var slash = SLASHLANG.test(lang), hashc = HASHLANG.test(lang);
    function flush() { if (buf) { parts.push(esc(buf)); buf = ''; } }
    function push(cls, txt) { parts.push('<span class="' + cls + '">' + esc(txt) + '</span>'); }
    while (i < n) {
      var c = src.charAt(i), c2 = src.charAt(i + 1), e;
      if (slash && c === '/' && c2 === '/') { flush(); e = src.indexOf('\n', i); if (e < 0) e = n; push('tok-c', src.slice(i, e)); i = e; continue; }
      if (slash && c === '/' && c2 === '*') { flush(); e = src.indexOf('*/', i + 2); e = e < 0 ? n : e + 2; push('tok-c', src.slice(i, e)); i = e; continue; }
      if (hashc && c === '#') { flush(); e = src.indexOf('\n', i); if (e < 0) e = n; push('tok-c', src.slice(i, e)); i = e; continue; }
      if (c === '"' || c === "'" || c === '`') {
        flush();
        var q = c, j = i + 1;
        while (j < n) {
          var ch = src.charAt(j);
          if (ch === '\\') { j += 2; continue; }
          if (ch === q) { j++; break; }
          if (ch === '\n' && q !== '`') break;
          j++;
        }
        push('tok-s', src.slice(i, j)); i = j; continue;
      }
      if (c >= '0' && c <= '9' && !/[A-Za-z0-9_$]/.test(src.charAt(i - 1) || ' ')) {
        flush();
        var k = i;
        while (k < n && /[0-9a-fx._]/i.test(src.charAt(k))) k++;
        push('tok-n', src.slice(i, k)); i = k; continue;
      }
      if (/[A-Za-z_$]/.test(c)) {
        var k2 = i;
        while (k2 < n && /[A-Za-z0-9_$]/.test(src.charAt(k2))) k2++;
        var word = src.slice(i, k2);
        if (KW.test(word)) { flush(); push('tok-k', word); }
        else if (src.charAt(k2) === '(') { flush(); push('tok-p', word); }
        else buf += word;
        i = k2; continue;
      }
      buf += c; i++;
      if (buf.length > 4000) flush();
    }
    flush();
    return parts.join('');
  }

  /* a small hatch for the harness: frame timing, nothing else */
  window.__city = {
    frame: function () { return lastFrameMs; },
    samples: function () { return frameSamples.slice(); },
    reset: function () { frameSamples.length = 0; },
    count: function () { return blds.length; },
    visible: function () { return vis.length; },
    pickAt: function (x, y) { return pick(x, y); },
    strips: function () { return GSTRIPS; },
    dbg: function (v) { DBG = v; paintNow(); },
    tile: function () { return SPR.gtile ? SPR.gtile.toDataURL() : null; },
    paint: function () { paintNow(); return lastFrameMs; },
    cam: function () { return { az: cam.az, el: cam.el, dist: cam.dist, tx: cam.tx, ty: cam.ty }; },
    setCam: function (o) {
      fly = null;
      if (o.az != null) cam.az = camT.az = o.az;
      if (o.el != null) cam.el = camT.el = o.el;
      if (o.dist != null) cam.dist = camT.dist = o.dist;
      if (o.tx != null) cam.tx = camT.tx = o.tx;
      if (o.ty != null) cam.ty = camT.ty = o.ty;
      paintNow();
    },
    still: function () { running = false; },
    prof: function (n) {
      PROF = {}; running = false;
      for (var i = 0; i < (n || 20); i++) paintNow();
      var o = PROF, k; PROF = null;
      for (k in o) o[k] = +(o[k] / (n || 20)).toFixed(2);
      o.total = +(lastFrameMs).toFixed(2);
      return o;
    },
    home: function () {
      if (!HOME) return null;
      fly = null;
      cam.az = camT.az = HOME.az; cam.el = camT.el = HOME.el;
      cam.dist = camT.dist = HOME.dist; cam.tx = camT.tx = HOME.tx; cam.ty = camT.ty = HOME.ty;
      paintNow();
      return HOME;
    },
    bounds: function () { return { cx: bounds.cx, cy: bounds.cy, r: bounds.r }; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
