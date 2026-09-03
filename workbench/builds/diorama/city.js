/* Strapi Documentation — the city, built as a model.

   A torn page of the documentation lies on a table. On it, a terracotta and
   cream model city has been built: 290 buildings, one per page, each one
   composed rather than extruded — a ground floor with its own shopfront and
   doorway, a middle with real window bays, sills, balconies and string
   courses, and a crown that is a cornice, a pantile roof with chimneys, a
   copper dome on a drum, or a campanile with a belfry and a clock.

   Nothing on the model is invented. Districts are the 27 measured link
   communities. A building's archetype is read from the blocks the page
   actually contains. Its height and majesty come from its word count and from
   how many pages cite it. Lit windows count code blocks. The river is
   bundle.order. The streets are real citations. The empty plots are the 50
   pages nothing cites. */
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

  /* ---------------------------------------------------------- palette
     The reference is a terracotta and cream model city at golden hour: warm
     clay, burnt sienna, ochre, cream stucco, sage shutters, weathered copper.
     The light is amber, the shadows are violet, and blue-grey is allowed only
     where there is actually glass. */
  var C = {
    sun:     hx('#FFC98A'),
    glow:    hx('#FF9A63'),
    skyLo:   hx('#FFD4A4'),
    skyMid:  hx('#D9A48F'),
    skyHi:   hx('#7A6A93'),
    haze:    hx('#F0CBA0'),
    shadow:  hx('#6B4C77'),
    table:   hx('#33241E'),
    tableHi: hx('#5A4034'),
    paper:   hx('#F4E6C9'),
    paperLo: hx('#DCC49B'),
    print:   hx('#8B7659'),
    earth:   hx('#C7A97F'),
    earthHi: hx('#E3C79A'),
    water:   hx('#3F8F84'),
    jade:    hx('#5E7C45'),
    jadeHi:  hx('#9AAE5E'),
    lit:     hx('#FFCE86'),
    copper:  hx('#6FA894'),
    clay:    hx('#B85B38'),
    clayHi:  hx('#D97C4C'),
    ink:     hx('#2A1D16')
  };

  /* Materials, keyed by archetype. base is the body colour, k is how greedily
     the surface takes the low key light, roof is the colour of its pantiles or
     its parapet, trim is the stone the sills, lintels and cornices are cut
     from. */
  var ARCH = {
    tower:    { name: 'Tower',      what: 'code and endpoints', mat: 'cream stucco and glass',
                base: '#E4CBA4', k: 0.46, roof: '#9A8468', trim: '#F3E3C2', glass: 1, chip: '#E4CBA4' },
    workshop: { name: 'Workshop',   what: 'step by step',       mat: 'burnt sienna brick',
                base: '#AE5433', k: 0.44, roof: '#B85B38', trim: '#E2C79E', glass: 0, chip: '#AE5433' },
    records:  { name: 'Records',    what: 'tables and config',  mat: 'warm grey stone',
                base: '#BFA684', k: 0.42, roof: '#8E7A62', trim: '#EBDCBB', glass: 0, chip: '#BFA684' },
    civic:    { name: 'Monument',   what: 'cited concepts',     mat: 'limestone and copper',
                base: '#EFDCB6', k: 0.50, roof: '#6FA894', trim: '#FBF1D8', glass: 0, chip: '#EFDCB6' },
    scaffold: { name: 'Scaffolded', what: 'migration pages',    mat: 'ochre behind a frame',
                base: '#CE8B41', k: 0.46, roof: '#A9702F', trim: '#EBD3A4', glass: 0, chip: '#CE8B41' },
    shed:     { name: 'Shed',       what: 'short stubs',        mat: 'terracotta and tin',
                base: '#C1613C', k: 0.44, roof: '#93624A', trim: '#E0C49B', glass: 0, chip: '#C1613C' },
    garden:   { name: 'Planted',    what: 'prose, no code',     mat: 'olive canopy',
                base: '#6E8A4E', k: 0.46, roof: '#5E7C45', trim: '#C9BE94', glass: 0, chip: '#6E8A4E' }
  };
  var ARCH_ORDER = ['tower', 'workshop', 'records', 'civic', 'scaffold', 'garden', 'shed'];

  /* Three colourways per archetype, chosen by a hash of the slug, so a
     quarter is a warm patchwork of clay, ochre and cream rather than one
     repeated swatch. */
  var MVAR = {
    tower:    ['#E4CBA4', '#D3A876', '#C98A63'],
    workshop: ['#AE5433', '#9A4732', '#BE6A42'],
    records:  ['#C3A882', '#CBAA75', '#B29A7E'],
    civic:    ['#EFDCB6', '#E8D0A2', '#F4E5C8'],
    scaffold: ['#CE8B41', '#BE7A38', '#DA9E58'],
    shed:     ['#C1613C', '#AC5337', '#CE7A4C'],
    garden:   ['#6E8A4E', '#647F49', '#7C9757']
  };

  /* extra materials the composer reaches for, past the seven archetypes */
  var MX = [
    { base: '#E4CBA4', k: 0.46 },   /* 0..6 are the archetypes, filled below   */
    null, null, null, null, null, null,
    { base: '#5B5348', k: 0.24 },   /* 7  structural steel                     */
    { base: '#B85B38', k: 0.52 },   /* 8  clay pantile                         */
    { base: '#F3E3C2', k: 0.54 },   /* 9  cut stone trim                       */
    { base: '#6FA894', k: 0.44 },   /* 10 weathered copper                     */
    { base: '#7C8B5E', k: 0.40 },   /* 11 sage shutters and joinery            */
    { base: '#8FA3B4', k: 0.30 },   /* 12 glass                                */
    { base: '#9A7C55', k: 0.34 },   /* 13 timber, planks, hoardings            */
    { base: '#C3462F', k: 0.48 },   /* 14 awning red                           */
    { base: '#453E42', k: 0.26 },   /* 15 tarmac, dark tin                     */
    { base: '#D8C49A', k: 0.44 },   /* 16 pale render                          */
    null, null, null, null,         /* 17-20 the paint on a parked van         */
    null, null, null,               /* 21-23 the stripes of a market canopy    */
    { base: '#A44C2E', k: 0.52 },   /* 24 pantile, weathered darker            */
    { base: '#C96C3E', k: 0.52 },   /* 25 pantile, freshly laid                */
    { base: '#8A7A5E', k: 0.36 }    /* 26 weathered canvas tarpaulin           */
  ];
  var M_STEEL = 7, M_TILE = 8, M_TRIM = 9, M_COPPER = 10, M_SHUT = 11,
      M_GLASS = 12, M_WOOD = 13, M_AWN = 14, M_DARK = 15, M_RENDER = 16,
      M_TARP = 26;
  var M_TILES = [8, 24, 25];

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
  var props = [], paper = null, tools = [];
  var PROV = null;                /* per-page git history, for the night moths */
  var folk = [];                  /* the living layer: everything that moves */
  var lampOf = {};                /* the kerb lamp in front of each page */
  var WINDV = 0;                  /* one wind over the whole model, -1..1 */
  var LT = 0;                     /* life time: frozen to one pose under reduced motion */

  var P = 30;                 /* lot pitch, world units */
  var GAP = 4;                /* the sliver between neighbours on one block */
  var SW = 9;                 /* the street between superblocks */
  var STOREY = 9.2;           /* one floor */
  var GFH = 14.5;             /* the ground floor is always taller */

  var docEl, worldEl, sideEl, rbodyEl, tipEl, cv, ctx;

  /* ------------------------------------------------------------- boot */
  function boot() {
    docEl = $('#doc'); worldEl = $('#world'); sideEl = $('#side'); rbodyEl = $('#rbody');
    tipEl = $('#tip'); cv = $('#city'); ctx = cv.getContext('2d', { alpha: false });

    Promise.all([
      fetch('content.json').then(function (r) { return r.json(); }),
      fetch('graph.json').then(function (r) { return r.json(); }),
      fetch('communities.json').then(function (r) { return r.json(); }),
      fetch('provenance.json').then(function (r) { return r.json(); })['catch'](function () { return null; })
    ]).then(function (res) {
      B = res[0]; G = res[1]; COM = res[2]; PROV = res[3];
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
        bakeProps();
        bakeLife();
        bakePaper();
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
    /* the reading order can double back on itself; a river must not. Any
       place the course crosses itself, the loop between the two crossings is
       cut out, then the course is relaxed once more so the splice is smooth. */
    function segX(a, b, c2, e2) {
      var d1 = (b.x - a.x) * (c2.y - a.y) - (b.y - a.y) * (c2.x - a.x);
      var d5 = (b.x - a.x) * (e2.y - a.y) - (b.y - a.y) * (e2.x - a.x);
      var d3 = (e2.x - c2.x) * (a.y - c2.y) - (e2.y - c2.y) * (a.x - c2.x);
      var d4 = (e2.x - c2.x) * (b.y - c2.y) - (e2.y - c2.y) * (b.x - c2.x);
      return ((d1 > 0) !== (d5 > 0)) && ((d3 > 0) !== (d4 > 0));
    }
    var cutg = 0, cut = true;
    while (cut && cutg++ < 24 && way.length > 3) {
      cut = false;
      for (var ii = 0; ii < way.length - 3 && !cut; ii++) {
        for (var jj = ii + 2; jj < way.length - 1; jj++) {
          if (segX(way[ii], way[ii + 1], way[jj], way[jj + 1])) {
            way.splice(ii + 1, jj - ii);
            cut = true; break;
          }
        }
      }
    }
    for (it = 0; it < 30; it++) {
      for (k = 0; k < way.length; k++) {
        for (q = 0; q < dists.length; q++) {
          var d6 = dists[q];
          var dx6 = way[k].x - d6.x, dy6 = way[k].y - d6.y, dd6 = sqrt(dx6 * dx6 + dy6 * dy6) || 1;
          var need6 = d6.r + 18;
          if (dd6 < need6) { way[k].x += dx6 / dd6 * (need6 - dd6) * 0.5; way[k].y += dy6 / dd6 * (need6 - dd6) * 0.5; }
        }
      }
      for (m = 1; m < way.length - 1; m++) {
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
      /* the source narrows to a trickle over a long reach, so the upstream
         end fades out instead of stopping in a rounded blob */
      var tpA = n / (L * 0.18), tpB = (L - 1 - n) / (L * 0.08);
      var tp = Math.min(tpA < 1 ? tpA : 1, tpB < 1 ? tpB : 1);
      tp = tp * tp * (3 - 2 * tp);
      var w = (13 + 27 * (river.pts[n].t || 0)) * (0.015 + 0.985 * tp);
      left.push([river.pts[n].x + nx * w, river.pts[n].y + ny * w]);
      right.push([river.pts[n].x - nx * w, river.pts[n].y - ny * w]);
    }
    river.qL = left.slice();                     /* the quays, one per bank */
    river.qR = right.slice();
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
     ARCHITECTURE — every building is composed, never extruded.

     compose() returns a list of primitives in lot-local coordinates. A
     primitive is a box, a gabled roof, a hipped spire, a cylinder, a dome, a
     strut or a planting. Facade treatment travels with the box as `deco`, and
     the renderer draws the ground floor, the fenestration and the crown from
     it. bakeCity() then rotates the whole list into world space, once.
     ================================================================== */

  function floorsOf(r) {
    var base = [1, 2, 4, 6, 9, 12][r.tier];
    if (r.tier >= 5) base = 12 + Math.round((r.inb - 25) / 9);
    var wf = 0.72 + 0.58 * Math.min(1, r.words / 2600);
    /* a deterministic storey of jitter, so two equal pages are not twins */
    var jit = ((r.h32 >>> 7) % 3) - 1;
    return Math.max(1, Math.round(base * wf) + jit);
  }
  function heightOf(r) {
    if (r.derelict) return GFH * (0.55 + Math.min(r.words, 1800) / 2600);
    return GFH + floorsOf(r) * STOREY;
  }
  /* how many of the windows carry a warm light: the page's code blocks */
  function litOf(r) { return clamp(r.code / 14, 0, 0.7); }

  /* which side faces the plaza — the entrance, the awning and the sign go
     there, so a quarter reads as a quarter and not as a warehouse estate */
  function frontOf(lot) {
    var dx = -lot.x, dy = -lot.y;
    var l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    var best = 0, bs = -9, j;
    var N = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    for (j = 0; j < 4; j++) {
      var s = N[j][0] * dx + N[j][1] * dy;
      if (s > bs) { bs = s; best = j; }
    }
    return best;
  }

  function compose(r, lot) {
    var w = lot.sw * P - GAP, d = lot.sd * P - GAP;
    var h = heightOf(r), a = r.arch, V = [], fr = frontOf(lot);
    var rn = function (k) { return rnd01(r.h32, k); };
    var mi = MATIX[a];
    var lf = litOf(r);
    var big = Math.min(w, d);

    if (r.derelict) return composeDerelict(r, lot, w, d, h, mi, fr, rn);
    if (a === 'garden')  return composeGarden(r, lot, w, d, mi, fr, rn);
    if (a === 'shed')    return composeShed(r, lot, w, d, h, mi, fr, rn, lf);
    if (a === 'workshop')return composeWorkshop(r, lot, w, d, h, mi, fr, rn, lf);
    if (a === 'records') return composeRecords(r, lot, w, d, h, mi, fr, rn, lf);
    if (a === 'civic')   return composeCivic(r, lot, w, d, h, mi, fr, rn, lf);
    if (a === 'scaffold')return composeScaffold(r, lot, w, d, h, mi, fr, rn, lf);
    return composeTower(r, lot, w, d, h, mi, fr, rn, lf);
  }

  /* ---------------------------------------------------------- helpers */
  function box(V, x, y, w, d, z0, z1, m, o) {
    var b = { k: 'b', x: x, y: y, w: w, d: d, z0: z0, z1: z1, m: m };
    if (o) for (var q in o) b[q] = o[q];
    V.push(b); return b;
  }
  function slab(V, x, y, w, d, z0, z1, m) {
    V.push({ k: 'b', x: x, y: y, w: w, d: d, z0: z0, z1: z1, m: m, deco: 'plain' });
  }
  function gable(V, x, y, w, d, z0, ze, zr, ax, m) {
    V.push({ k: 'g', x: x, y: y, w: w, d: d, z0: z0, ze: ze, zr: zr, ax: ax, m: m });
  }
  function pyr(V, x, y, w, d, z0, z1, m) { V.push({ k: 'p', x: x, y: y, w: w, d: d, z0: z0, z1: z1, m: m }); }
  function cyl(V, x, y, rr, z0, z1, m, o) {
    var c = { k: 'c', x: x, y: y, r: rr, z0: z0, z1: z1, m: m };
    if (o) for (var q in o) c[q] = o[q];
    V.push(c);
  }
  function dome(V, x, y, rr, z0, hh, m) { V.push({ k: 'd', x: x, y: y, r: rr, z0: z0, h: hh, m: m }); }
  function strut(V, x0, y0, z0, x1, y1, z1, ww, m) {
    V.push({ k: 'm', x0: x0, y0: y0, z0: z0, x1: x1, y1: y1, z1: z1, w: ww, m: m });
  }
  function plant(V, x, y, z, rr, kind) { V.push({ k: 't', x: x, y: y, z: z, r: rr, kind: kind }); }

  /* the outward direction of face index j, in lot-local space */
  var FN = [[0, -1], [1, 0], [0, 1], [-1, 0]];

  /* the clutter every modern roof carries: a lift overrun, a plant room, a
     water tank on legs, an aerial or two */
  function roofClutter(V, x, y, w, d, z, rn, k0) {
    var hw = w / 2, hd = d / 2;
    box(V, x - hw * 0.42, y - hd * 0.30, w * 0.24, d * 0.26, z, z + 7.5, M_RENDER, { deco: 'plain' });
    box(V, x + hw * 0.34, y + hd * 0.26, w * 0.28, d * 0.22, z, z + 4.6, M_DARK, { deco: 'vent' });
    var tr = Math.min(w, d) * 0.10 + 1.4;
    var tx = x + hw * 0.10, ty = y - hd * 0.40;
    var lz = z + 3.4;
    strut(V, tx - tr, ty - tr, z, tx - tr, ty - tr, lz, 0.7, M_STEEL);
    strut(V, tx + tr, ty - tr, z, tx + tr, ty - tr, lz, 0.7, M_STEEL);
    strut(V, tx - tr, ty + tr, z, tx - tr, ty + tr, lz, 0.7, M_STEEL);
    strut(V, tx + tr, ty + tr, z, tx + tr, ty + tr, lz, 0.7, M_STEEL);
    cyl(V, tx, ty, tr, lz, lz + tr * 1.7, M_STEEL);
    var ax = x - hw * 0.20 + rn(k0) * w * 0.2;
    strut(V, ax, y + hd * 0.5, z, ax, y + hd * 0.5, z + 11 + rn(k0 + 1) * 7, 0.35, M_STEEL);
    strut(V, ax - 2.2, y + hd * 0.5, z + 9, ax + 2.2, y + hd * 0.5, z + 9, 0.3, M_STEEL);
    /* half of these roofs also keep a garden in planters */
    if (rn(k0 + 2) > 0.55) {
      box(V, x - hw * 0.36, y + hd * 0.36, w * 0.20, d * 0.14, z, z + 1.5, M_WOOD, { deco: 'plain' });
      plant(V, x - hw * 0.36, y + hd * 0.36, z + 3.2, Math.min(w, d) * 0.12 + 1.4, 'tree');
    }
  }

  /* a chimney stack, with a cap and its smoke */
  function chimney(V, x, y, ww, z0, z1, m, smoke) {
    box(V, x, y, ww, ww, z0, z1, m, { deco: 'brick' });
    slab(V, x, y, ww + 1.6, ww + 1.6, z1, z1 + 1.5, M_TRIM);
    if (smoke) plant(V, x, y, z1 + 6, ww * 1.5, 'smoke');
  }

  /* ------------------------------------------------------------ tower
     code and endpoints: a modern block, cream stucco with a glazed shopfront,
     window bays with balconies, a parapet, and a roof full of machinery */
  function composeTower(r, lot, w, d, h, mi, fr, rn, lf) {
    var V = [], t = r.tier;
    /* A page only a handful of others cite is not an office block; it is a
       house on a street. It gets a pantile roof, sills, shutters and a
       chimney, and that is what makes the model terracotta rather than
       corporate. Majesty, and only majesty, buys you a tower. */
    if (t <= 2) return composeTownhouse(r, lot, w, d, h, mi, fr, rn, lf);
    slab(V, 0, 0, w + 3.4, d + 3.4, 0, 1.8, M_TRIM);            /* the step */
    var shaft = box(V, 0, 0, w, d, 1.8, h, mi, {
      deco: 'curtain', gf: 'shop', front: fr, lit: lf, floors: floorsOf(r),
      bal: t >= 2 ? 1 : 0, glass: 1
    });
    var top = h;
    slab(V, 0, 0, w + 2.2, d + 2.2, h, h + 2.4, M_TRIM);        /* cornice   */
    if (t >= 3) {
      var w2 = w * 0.64, d2 = d * 0.64, h2 = h * 0.34;
      box(V, 0, 0, w2, d2, h + 2.4, h + 2.4 + h2, mi, {
        deco: 'curtain', lit: lf, glass: 1, floors: Math.max(1, Math.round(h2 / STOREY))
      });
      slab(V, 0, 0, w2 + 2, d2 + 2, h + 2.4 + h2, h + 4.6 + h2, M_TRIM);
      top = h + 4.6 + h2;
      if (t >= 4) {
        var w3 = w * 0.36, d3 = d * 0.36, h3 = h * 0.26;
        box(V, 0, 0, w3, d3, top, top + h3, mi, {
          deco: 'curtain', lit: lf, glass: 1, floors: Math.max(1, Math.round(h3 / STOREY))
        });
        slab(V, 0, 0, w3 + 1.6, d3 + 1.6, top + h3, top + h3 + 1.8, M_TRIM);
        top = top + h3 + 1.8;
        strut(V, 0, 0, top, 0, 0, top + h * 0.22, 0.6, M_STEEL);
        strut(V, -2.4, 0, top + h * 0.13, 2.4, 0, top + h * 0.13, 0.45, M_STEEL);
      }
    }
    roofClutter(V, 0, 0, (t >= 4 ? w * 0.36 : t >= 3 ? w * 0.64 : w) * 0.96,
      (t >= 4 ? d * 0.36 : t >= 3 ? d * 0.64 : d) * 0.96, top, rn, 3);
    /* a canopy over the entrance, and a lamp either side of the door */
    var n = FN[fr], hw = fr === 1 || fr === 3 ? w / 2 : d / 2;
    var ex = n[0] * (fr === 1 || fr === 3 ? w / 2 : 0), ey = n[1] * (fr === 0 || fr === 2 ? d / 2 : 0);
    slab(V, ex + n[0] * 2.4, ey + n[1] * 2.4, n[0] ? 5.2 : w * 0.44, n[1] ? 5.2 : d * 0.44,
      GFH - 2.6, GFH - 1.4, M_DARK);
    return V;
  }


  /* ------------------------------------------------------- townhouse */
  function composeTownhouse(r, lot, w, d, h, mi, fr, rn, lf) {
    var V = [], nf = Math.max(1, Math.round((h - GFH) / STOREY));
    var bh = GFH + nf * STOREY;
    var gfk = rn(2) > 0.45 ? 'shop' : 'arch';
    slab(V, 0, 0, w + 2.6, d + 2.6, 0, 1.7, M_TRIM);
    box(V, 0, 0, w, d, 1.7, bh, mi, {
      deco: 'stone', gf: gfk, front: fr, lit: lf,
      floors: nf, shut: 1, course: nf >= 3 ? 1 : 0, bal: nf >= 2 ? 1 : 0,
      quoin: rn(3) > 0.55 ? 1 : 0
    });
    /* a hanging sign on a bracket, beside the shop door */
    if (gfk === 'shop' && rn(12) > 0.42) {
      var sn = FN[fr], su = Math.min(6.5, (sn[0] ? d : w) * 0.28);
      var sxp = sn[0] * (w / 2 + 0.2) + (sn[1] ? su : 0);
      var syp = sn[1] * (d / 2 + 0.2) + (sn[0] ? su : 0);
      var sxe = sn[0] * (w / 2 + 3.2) + (sn[1] ? su : 0);
      var sye = sn[1] * (d / 2 + 3.2) + (sn[0] ? su : 0);
      strut(V, sxp, syp, GFH + 1.0, sxe, sye, GFH + 1.0, 0.35, M_STEEL);
      box(V, (sxp + sxe) / 2 + sn[0] * 0.4, (syp + sye) / 2 + sn[1] * 0.4,
        sn[0] ? 2.4 : 0.5, sn[0] ? 0.5 : 2.4, GFH - 2.2, GFH + 0.8, M_AWN, { deco: 'plain' });
    }
    slab(V, 0, 0, w + 3.2, d + 3.2, bh, bh + 1.7, M_TRIM);       /* eaves */
    /* a square house takes its ridge from a hash, so a terrace of equals
       does not repeat one roofline */
    var ax = abs(w - d) < 1.5 ? ((r.h32 >>> 3) & 1) : (w >= d ? 0 : 1);
    var rise = Math.max(5.5, Math.min(w, d) * 0.30);
    gable(V, 0, 0, w + 4.6, d + 4.6, bh + 1.7, 0, rise, ax, M_TILE);
    var cw = Math.max(2.4, Math.min(w, d) * 0.10);
    chimney(V, w * 0.30, d * 0.26, cw, bh, bh + rise + 4 + rn(6) * 5, mi, rn(7) > 0.62 ? 1 : 0);
    if (rn(8) > 0.55) {
      chimney(V, -w * 0.32, -d * 0.20, cw * 0.85, bh, bh + rise + 3 + rn(9) * 4, mi, 0);
    }
    /* a roof dormer on the street side, on the deeper houses */
    if (Math.min(w, d) > 20 && rn(10) > 0.5) {
      var n = FN[fr];
      box(V, n[0] * w * 0.18, n[1] * d * 0.18, 5.6, 5.6, bh + 1.7, bh + 1.7 + rise * 0.52, M_RENDER,
        { deco: 'plain' });
      gable(V, n[0] * w * 0.18, n[1] * d * 0.18, 6.8, 6.8, bh + 1.7 + rise * 0.52, 0, 2.2, ax, M_TILE);
    }
    return V;
  }

  /* --------------------------------------------------------- workshop
     step by step: brick, tall factory glazing between pilasters, a clay
     pantile roof with deep eaves and a ridge, a stack with smoke over it */
  function composeWorkshop(r, lot, w, d, h, mi, fr, rn, lf) {
    var V = [], bh = Math.max(GFH + STOREY, h * 0.70);
    slab(V, 0, 0, w + 2.6, d + 2.6, 0, 2.0, M_TRIM);
    box(V, 0, 0, w, d, 2.0, bh, mi, {
      deco: 'factory', gf: 'load', front: fr, lit: lf,
      floors: Math.max(1, Math.round((bh - GFH) / (STOREY * 1.35))), quoin: 1
    });
    slab(V, 0, 0, w + 2.4, d + 2.4, bh, bh + 1.9, M_TRIM);       /* eaves band */
    var ax = w >= d ? 0 : 1;
    var rise = Math.max(7, Math.min(w, d) * 0.34);
    gable(V, 0, 0, w + 4.4, d + 4.4, bh + 1.9, 0, rise, ax, M_TILE);
    /* a second, lower range at the back: workshops sprawl */
    if (w > 30) {
      var sw = w * 0.40, sd = d * 0.34;
      var sx = -w * 0.24, sy = d * 0.30;
      box(V, sx, sy, sw, sd, 2.0, bh * 0.52, mi, { deco: 'factory', lit: lf * 0.6, floors: 1 });
      gable(V, sx, sy, sw + 2.6, sd + 2.6, bh * 0.52, 0, rise * 0.55, 0, M_TILE);
    }
    var cw = Math.max(3.4, Math.min(w, d) * 0.13);
    chimney(V, w * 0.36, -d * 0.34, cw, 2.0, bh + rise + 8 + rn(5) * 9, mi, 1);
    /* the yard: a crate, a barrel, a lamp */
    var n = FN[fr];
    box(V, n[0] * (w / 2 + 5), n[1] * (d / 2 + 5), 4.4, 3.6, 0, 3.4, M_WOOD, { deco: 'plain' });
    cyl(V, n[0] * (w / 2 + 5) + (n[1] ? 6 : 0), n[1] * (d / 2 + 5) + (n[0] ? 6 : 0), 1.5, 0, 3.6, M_AWN);
    /* the trade sign, hanging from a bracket beside the loading door */
    var su2 = Math.min(7, (n[0] ? d : w) * 0.30);
    strut(V, n[0] * (w / 2 + 0.2) + (n[1] ? su2 : 0), n[1] * (d / 2 + 0.2) + (n[0] ? su2 : 0), GFH + 1.6,
             n[0] * (w / 2 + 3.4) + (n[1] ? su2 : 0), n[1] * (d / 2 + 3.4) + (n[0] ? su2 : 0), GFH + 1.6, 0.4, M_STEEL);
    box(V, n[0] * (w / 2 + 1.9) + (n[1] ? su2 : 0), n[1] * (d / 2 + 1.9) + (n[0] ? su2 : 0),
      n[0] ? 2.6 : 0.5, n[0] ? 0.5 : 2.6, GFH - 1.8, GFH + 1.3, M_SHUT, { deco: 'plain' });
    return V;
  }

  /* ---------------------------------------------------------- records
     tables and config: a stone archive. Rusticated base, string courses,
     sills and lintels, corner quoins, a heavy oversailing cornice and a
     balustrade with urns. */
  function composeRecords(r, lot, w, d, h, mi, fr, rn, lf) {
    var V = [];
    slab(V, 0, 0, w + 5.2, d + 5.2, 0, 2.4, M_TRIM);
    box(V, 0, 0, w + 2.2, d + 2.2, 2.4, 9.6, mi, { deco: 'rustic' });   /* base */
    box(V, 0, 0, w, d, 9.6, 9.6 + h, mi, {
      deco: 'stone', gf: 'arch', front: fr, lit: lf, floors: floorsOf(r),
      quoin: 1, shut: 1, course: 1, bal: r.tier >= 3 ? 1 : 0
    });
    var cz = 9.6 + h;
    slab(V, 0, 0, w + 4.6, d + 4.6, cz, cz + 3.4, M_TRIM);              /* cornice */
    box(V, 0, 0, w + 2.4, d + 2.4, cz + 3.4, cz + 8.4, M_TRIM, { deco: 'balus' });
    /* urns, one at each corner of the parapet */
    if (r.tier >= 3) {
      var ux = (w + 2.4) / 2 - 2.2, uy = (d + 2.4) / 2 - 2.2, s, q;
      for (s = -1; s <= 1; s += 2) for (q = -1; q <= 1; q += 2) {
        cyl(V, ux * s, uy * q, 1.7, cz + 8.4, cz + 12.2, M_TRIM);
      }
    }
    if (r.tier >= 4) {
      var lw = w * 0.44, ld = d * 0.44;
      box(V, 0, 0, lw, ld, cz + 8.4, cz + 8.4 + h * 0.22, mi, { deco: 'stone', floors: 2, lit: lf });
      slab(V, 0, 0, lw + 2.4, ld + 2.4, cz + 8.4 + h * 0.22, cz + 11.4 + h * 0.22, M_TRIM);
      pyr(V, 0, 0, lw + 2.4, ld + 2.4, cz + 11.4 + h * 0.22, cz + 11.4 + h * 0.22 + lw * 0.5, M_COPPER);
    } else {
      /* half of the flat archive roofs carry furniture: a tank on legs, a
         plant box, a stack with smoke, or a roof garden in planters */
      var rz = cz + 8.4;
      if (rn(15) > 0.5) {
        box(V, w * 0.20, -d * 0.16, Math.min(6, w * 0.24), Math.min(5, d * 0.22), rz, rz + 3.6, M_DARK, { deco: 'vent' });
        var tr2 = Math.min(w, d) * 0.11 + 1.2, tx2 = -w * 0.22, ty2 = d * 0.18, lz2 = rz + 3.0;
        strut(V, tx2 - tr2, ty2 - tr2, rz, tx2 - tr2, ty2 - tr2, lz2, 0.6, M_STEEL);
        strut(V, tx2 + tr2, ty2 - tr2, rz, tx2 + tr2, ty2 - tr2, lz2, 0.6, M_STEEL);
        strut(V, tx2 - tr2, ty2 + tr2, rz, tx2 - tr2, ty2 + tr2, lz2, 0.6, M_STEEL);
        strut(V, tx2 + tr2, ty2 + tr2, rz, tx2 + tr2, ty2 + tr2, lz2, 0.6, M_STEEL);
        cyl(V, tx2, ty2, tr2, lz2, lz2 + tr2 * 1.6, M_STEEL);
      }
      if (rn(16) > 0.55) chimney(V, -w * 0.30, -d * 0.28, 2.6, cz, rz + 5.5 + rn(17) * 3, mi, rn(18) > 0.5 ? 1 : 0);
      if (rn(19) > 0.6) {
        box(V, w * 0.16, d * 0.22, 5.4, 2.4, rz, rz + 1.6, M_WOOD, { deco: 'plain' });
        plant(V, w * 0.16, d * 0.22, rz + 3.4, Math.min(w, d) * 0.14 + 1.6, 'tree');
      }
    }
    return V;
  }

  /* ------------------------------------------------------------ civic
     what monuments get. The hub of a big quarter becomes a campanile with a
     belfry, a clock and a spire; everything else a domed hall with a portico,
     a pediment, a drum and a lantern. */
  function composeCivic(r, lot, w, d, h, mi, fr, rn, lf) {
    var isHub = r.dist && r.dist.hub === r.slug && r.tier >= 4;
    return isHub ? composeCampanile(r, lot, w, d, h, mi, fr, rn, lf)
                 : composeHall(r, lot, w, d, h, mi, fr, rn, lf);
  }

  function composeCampanile(r, lot, w, d, h, mi, fr, rn, lf) {
    var V = [], s = Math.min(w, d) * 0.56;
    slab(V, 0, 0, w * 0.86, d * 0.86, 0, 3.0, M_TRIM);
    slab(V, 0, 0, w * 0.72, d * 0.72, 3.0, 5.4, M_TRIM);
    var sh = h * 1.15;
    box(V, 0, 0, s, s, 5.4, 5.4 + sh, mi, {
      deco: 'slit', gf: 'arch', front: fr, lit: lf, quoin: 1, clock: fr,
      floors: Math.max(4, Math.round(sh / (STOREY * 1.6)))
    });
    var bz = 5.4 + sh;
    slab(V, 0, 0, s + 3.2, s + 3.2, bz, bz + 2.4, M_TRIM);
    box(V, 0, 0, s + 1.2, s + 1.2, bz + 2.4, bz + 2.4 + s * 0.78, M_TRIM, { deco: 'belfry' });
    var tz = bz + 2.4 + s * 0.78;
    slab(V, 0, 0, s + 4.4, s + 4.4, tz, tz + 2.2, M_TRIM);
    pyr(V, 0, 0, s + 2.4, s + 2.4, tz + 2.2, tz + 2.2 + s * 1.25, M_COPPER);
    var fz = tz + 2.2 + s * 1.25;
    strut(V, 0, 0, fz, 0, 0, fz + 9, 0.4, M_STEEL);
    box(V, 3.2, 0, 6.2, 0.5, fz + 4.4, fz + 8.2, M_AWN, { deco: 'flag' });
    return V;
  }

  function composeHall(r, lot, w, d, h, mi, fr, rn, lf) {
    var V = [], n = FN[fr];
    var bw = w * 0.80, bd = d * 0.80;
    /* stylobate: three steps */
    slab(V, 0, 0, w + 3.4, d + 3.4, 0, 1.7, M_TRIM);
    slab(V, 0, 0, w + 1.2, d + 1.2, 1.7, 3.4, M_TRIM);
    slab(V, 0, 0, w - 0.8, d - 0.8, 3.4, 5.1, M_TRIM);
    var bh = Math.max(GFH + STOREY, h * 0.62);
    box(V, 0, 0, bw, bd, 5.1, 5.1 + bh, mi, {
      deco: 'stone', gf: 'arch', front: fr, lit: lf, quoin: 1, course: 1,
      floors: Math.max(2, Math.round(bh / (STOREY * 1.3)))
    });
    var cz = 5.1 + bh;
    slab(V, 0, 0, bw + 3.4, bd + 3.4, cz, cz + 3.0, M_TRIM);
    /* the portico: six columns, an entablature and a pediment */
    var along = n[1] ? bw : bd, px0 = -along / 2 + along / 12;
    var offx = n[0] * (bw / 2 + 4.6), offy = n[1] * (bd / 2 + 4.6);
    var i, nc = 6;
    for (i = 0; i < nc; i++) {
      var tt = i / (nc - 1) - 0.5;
      var cxp = offx + (n[1] ? tt * along * 0.86 : 0);
      var cyp = offy + (n[0] ? tt * along * 0.86 : 0);
      cyl(V, cxp, cyp, 1.85, 5.1, 5.1 + bh * 0.80, M_TRIM, { flute: 1 });
      cyl(V, cxp, cyp, 2.35, 5.1 + bh * 0.80, 5.1 + bh * 0.86, M_TRIM);
    }
    var pw = n[1] ? along * 1.02 : 9.6, pd = n[0] ? along * 1.02 : 9.6;
    slab(V, offx, offy, pw, pd, 5.1 + bh * 0.86, 5.1 + bh * 0.98, M_TRIM);
    gable(V, offx, offy, pw, pd, 5.1 + bh * 0.98, 0, Math.min(pw, pd) * 0.72, n[1] ? 0 : 1, M_TRIM);
    /* the drum, the dome, the lantern. The drum cornice is turned round,
       never square: a square slab seen corner-on reads as a saucer
       slicing through the dome. */
    var dr = Math.min(bw, bd) * 0.34;
    cyl(V, 0, 0, dr, cz + 3.0, cz + 3.0 + dr * 0.95, mi, { pilaster: 1, lit: lf });
    cyl(V, 0, 0, dr * 1.12, cz + 3.0 + dr * 0.95, cz + 4.4 + dr * 0.95, M_TRIM);
    var dz = cz + 4.4 + dr * 0.95;
    dome(V, 0, 0, dr * 1.06, dz, dr * 1.22, M_COPPER);
    cyl(V, 0, 0, dr * 0.28, dz + dr * 1.18, dz + dr * 1.62, M_TRIM, { flute: 1 });
    dome(V, 0, 0, dr * 0.30, dz + dr * 1.62, dr * 0.34, M_COPPER);
    strut(V, 0, 0, dz + dr * 1.94, 0, 0, dz + dr * 2.24, 0.35, M_TRIM);
    return V;
  }

  /* -------------------------------------------------------- scaffold
     migration pages: half a building and half a frame. Finished storeys at
     the bottom, an open cage above, netting on one face, hoardings at street
     level, and a crane over the tallest of them. */
  function composeScaffold(r, lot, w, d, h, mi, fr, rn, lf) {
    var V = [], mh = Math.max(GFH + STOREY, h * 0.52);
    slab(V, 0, 0, w + 2.6, d + 2.6, 0, 1.8, M_TRIM);
    box(V, 0, 0, w, d, 1.8, mh, mi, {
      deco: 'stone', gf: 'hoard', front: fr, lit: lf * 0.5, board: 1,
      floors: Math.max(1, Math.round((mh - GFH) / STOREY))
    });
    /* the cage: standards, ledgers, planks */
    V.push({ k: 'f', x: 0, y: 0, w: w + 3.6, d: d + 3.6, z0: mh, z1: h + 4, m: M_STEEL,
      lifts: Math.max(2, Math.round((h + 4 - mh) / 8)) });
    /* the unfinished slabs inside the cage, and the mess of a working site
       on each: pallet stacks, plank piles, one draped tarpaulin */
    var lifts = Math.max(1, Math.round((h + 4 - mh) / 9)), i, topZ = mh;
    for (i = 1; i <= lifts; i++) {
      var z = mh + (h + 4 - mh) * (i / (lifts + 1));
      slab(V, 0, 0, w * 0.94, d * 0.94, z, z + 1.3, M_RENDER);
      var zt = z + 1.3; topZ = zt;
      if (rn(20 + i) > 0.42) {
        var qx = (rn(21 + i) - 0.5) * w * 0.56, qy = (rn(22 + i) - 0.5) * d * 0.56;
        box(V, qx, qy, 4.6, 3.6, zt, zt + 0.8, M_WOOD, { deco: 'plain' });
        box(V, qx + 0.3, qy - 0.2, 4.2, 3.2, zt + 0.8, zt + 1.7, M_WOOD, { deco: 'plain' });
      }
      if (rn(30 + i) > 0.5) {
        box(V, (rn(31 + i) - 0.5) * w * 0.5, (rn(32 + i) - 0.5) * d * 0.5,
          Math.min(9, w * 0.36), 2.2, zt, zt + 1.0, M_WOOD, { deco: 'plain' });
      }
    }
    /* the tarpaulin, lashed over a corner of the top deck */
    box(V, -w * 0.22, d * 0.18, w * 0.26, d * 0.22, topZ, topZ + 1.1, M_TARP, { deco: 'plain' });
    /* the ladder up the front face, ground to the finished storeys */
    var lfn = FN[fr], ldir = [-lfn[1], lfn[0]];
    var lox = lfn[0] * (w / 2 + 2.4) + ldir[0] * 6, loy = lfn[1] * (d / 2 + 2.4) + ldir[1] * 6;
    strut(V, lox - ldir[0] * 0.9, loy - ldir[1] * 0.9, 0, lox - ldir[0] * 0.9, loy - ldir[1] * 0.9, mh + 2.5, 0.3, M_WOOD);
    strut(V, lox + ldir[0] * 0.9, loy + ldir[1] * 0.9, 0, lox + ldir[0] * 0.9, loy + ldir[1] * 0.9, mh + 2.5, 0.3, M_WOOD);
    var rz2;
    for (rz2 = 2.4; rz2 < mh + 1.6; rz2 += 3.1) {
      strut(V, lox - ldir[0] * 0.9, loy - ldir[1] * 0.9, rz2, lox + ldir[0] * 0.9, loy + ldir[1] * 0.9, rz2, 0.22, M_WOOD);
    }
    /* netting over the face that catches the light */
    V.push({ k: 'n', x: 0, y: 0, w: w + 3.6, d: d + 3.6, z0: mh, z1: h + 3, m: M_DARK, front: (fr + 1) & 3 });
    if (r.tier >= 3) {
      var cx = w / 2 + 6, cy = -d / 2 - 6, ch = h + 34 + rn(7) * 16;
      strut(V, cx - 2, cy - 2, 0, cx - 2, cy - 2, ch, 0.75, M_STEEL);
      strut(V, cx + 2, cy - 2, 0, cx + 2, cy - 2, ch, 0.75, M_STEEL);
      strut(V, cx - 2, cy + 2, 0, cx - 2, cy + 2, ch, 0.75, M_STEEL);
      strut(V, cx + 2, cy + 2, 0, cx + 2, cy + 2, ch, 0.75, M_STEEL);
      var lz;
      for (lz = 7; lz < ch - 4; lz += 7) {
        strut(V, cx - 2, cy - 2, lz, cx + 2, cy + 2, lz + 7, 0.34, M_STEEL);
        strut(V, cx - 2, cy - 2, lz, cx + 2, cy - 2, lz, 0.34, M_STEEL);
      }
      /* the jib overhangs the site by a few lots, never a whole district */
      var jl = Math.min(w * 0.9 + 16, 44);
      strut(V, cx, cy, ch, cx - jl, cy + jl * 0.35, ch + 2, 0.85, M_AWN);
      strut(V, cx, cy, ch, cx + 14, cy - 5, ch + 1, 0.75, M_AWN);
      box(V, cx + 15, cy - 5.4, 5, 4, ch - 2.6, ch + 1.6, M_DARK, { deco: 'plain' });
      strut(V, cx, cy, ch + 9, cx - jl * 0.9, cy + jl * 0.32, ch + 2, 0.28, M_STEEL);
      strut(V, cx - jl * 0.62, cy + jl * 0.22, ch + 1.5, cx - jl * 0.62, cy + jl * 0.22, mh + 6, 0.22, M_STEEL);
      box(V, cx - jl * 0.62, cy + jl * 0.22, 3.4, 2.6, mh + 2.4, mh + 6, M_STEEL, { deco: 'plain' });
      strut(V, cx, cy, ch + 9, cx, cy, ch + 11.5, 0.5, M_STEEL);
    }
    return V;
  }

  /* -------------------------------------------------------------- shed
     short stubs: one storey of terracotta under corrugated tin, a lean-to, a
     stovepipe, a crate outside the door */
  function composeShed(r, lot, w, d, h, mi, fr, rn, lf) {
    var V = [], sw = w * 0.74, sd = d * 0.72;
    var bh = Math.max(GFH * 0.92, h * 0.78);
    slab(V, 0, 0, sw + 2.2, sd + 2.2, 0, 1.4, M_TRIM);
    box(V, 0, 0, sw, sd, 1.4, bh, mi, { deco: 'plank', gf: 'door', front: fr, lit: lf, floors: 1 });
    var ax = abs(sw - sd) < 1.5 ? ((r.h32 >>> 3) & 1) : (sw >= sd ? 0 : 1);
    gable(V, 0, 0, sw + 3.4, sd + 3.4, bh, 0, Math.min(sw, sd) * 0.30, ax, M_DARK);
    /* a lean-to against the shaded flank */
    var lo = (fr + 2) & 3, n = FN[lo];
    var lw = n[0] ? sw * 0.34 : sw * 0.5, ld = n[1] ? sd * 0.34 : sd * 0.5;
    box(V, n[0] * (sw / 2 + lw / 2 - 0.5), n[1] * (sd / 2 + ld / 2 - 0.5), lw, ld, 1.4, bh * 0.58,
      M_WOOD, { deco: 'plank', floors: 1 });
    gable(V, n[0] * (sw / 2 + lw / 2 - 0.5), n[1] * (sd / 2 + ld / 2 - 0.5), lw + 1.6, ld + 1.6,
      bh * 0.58, 0, 2.6, ax, M_DARK);
    cyl(V, sw * 0.30, -sd * 0.28, 0.85, bh, bh + Math.min(sw, sd) * 0.52 + 5, M_DARK);
    plant(V, sw * 0.30, -sd * 0.28, bh + Math.min(sw, sd) * 0.52 + 8, 3.4, 'smoke');
    var f = FN[fr];
    box(V, f[0] * (sw / 2 + 4), f[1] * (sd / 2 + 4), 3.2, 2.6, 0, 2.6, M_WOOD, { deco: 'plain' });
    return V;
  }

  /* ------------------------------------------------------------ garden
     prose with no code at all: the plot is planted. Trees with real trunks
     and layered canopies, a low wall, a bench and a gravel path. */
  function composeGarden(r, lot, w, d, mi, fr, rn) {
    var V = [], n = clamp(3 + Math.round(r.words / 420), 3, 8), i;
    slab(V, 0, 0, w + 1.4, d + 1.4, 0, 1.5, M_TRIM);
    /* low boundary wall, open at the front */
    var j;
    for (j = 0; j < 4; j++) {
      if (j === fr) continue;
      var f = FN[j];
      slab(V, f[0] * w / 2, f[1] * d / 2, f[0] ? 1.6 : w, f[1] ? 1.6 : d, 1.5, 4.6, M_TRIM);
    }
    var span = Math.min(w, d);
    for (i = 0; i < n; i++) {
      var ang = i * 2.399963 + rn(i) * 0.9;
      var rad = span * 0.32 * sqrt((i + 0.5) / n);
      var tx = cos(ang) * rad, ty = sin(ang) * rad;
      var cr = span * (0.30 - 0.021 * i) * (0.85 + rn(i + 40) * 0.4) *
        (0.80 + 0.5 * Math.min(1, r.words / 1600));
      var th = cr * 1.15 + 5;
      cyl(V, tx, ty, Math.max(0.7, cr * 0.10), 1.5, th * 0.52, M_WOOD);
      plant(V, tx, ty, th, cr, 'tree');
    }
    /* a bench, facing the plaza */
    var fn = FN[fr];
    slab(V, fn[0] * w * 0.22, fn[1] * d * 0.22, fn[0] ? 1.6 : 7.5, fn[1] ? 1.6 : 7.5, 1.5, 3.4, M_WOOD);
    slab(V, fn[0] * w * 0.22 - fn[0] * 1.4, fn[1] * d * 0.22 - fn[1] * 1.4,
      fn[0] ? 0.7 : 7.5, fn[1] ? 0.7 : 7.5, 3.4, 5.6, M_WOOD);
    return V;
  }

  /* --------------------------------------------------------- derelict
     the 50 pages nothing cites: a plot that was never built out. Two broken
     walls, exposed joists, weeds and a site fence with a notice on it. */
  function composeDerelict(r, lot, w, d, h, mi, fr, rn) {
    var V = [], ww = Math.min(w, 9 + rn(11) * 8), dd = Math.min(d, 9 + rn(12) * 8);
    var ox = (rn(13) - 0.5) * (w - ww) * 0.7, oy = (rn(14) - 0.5) * (d - dd) * 0.7;
    slab(V, ox, oy, ww + 1.6, dd + 1.6, 0, 1.2, M_TRIM);
    /* two standing walls, broken at the top */
    box(V, ox - ww / 2 + 0.9, oy, 2.2, dd, 1.2, h * 1.35, mi, { deco: 'ruin', jag: 1 });
    box(V, ox, oy - dd / 2 + 0.9, ww, 2.2, 1.2, h * 1.00, mi, { deco: 'ruin', jag: 1 });
    box(V, ox + ww / 2 - 1.1, oy + dd * 0.22, 2.2, dd * 0.45, 1.2, h * 0.72, mi, { deco: 'ruin', jag: 1 });
    /* the floor that is left, and its joists */
    slab(V, ox, oy, ww, dd, 1.2, 2.0, M_RENDER);
    var i;
    for (i = -1; i <= 1; i++) slab(V, ox, oy + i * dd * 0.3, ww * 0.9, 0.7, 2.0, 2.8, M_WOOD);
    /* the site fence */
    var j;
    for (j = 0; j < 4; j++) {
      if (j === fr || j === ((fr + 2) & 3)) continue;   /* two sides only */
      V.push({ k: 'n', x: 0, y: 0, w: w, d: d, z0: 0, z1: 4.2, m: M_WOOD, front: j, fence: 1 });
    }
    box(V, FN[fr][0] * w * 0.32, FN[fr][1] * d * 0.32, 4.6, 0.5, 2.4, 6.0, M_TRIM, { deco: 'notice' });
    plant(V, ox + ww * 0.5, oy + dd * 0.4, 3.4, 3.0, 'weed');
    plant(V, ox - ww * 0.55, oy - dd * 0.2, 2.8, 2.4, 'weed');
    return V;
  }

  /* ==================================================================
     BAKE — lot-local parts become world-space parts, once.
     ================================================================== */
  var blds = [], scrub = [];
  var MATIX = {}; ARCH_ORDER.forEach(function (a, i) { MATIX[a] = i; });
  ARCH_ORDER.forEach(function (a, i) { MX[i] = { base: ARCH[a].base, k: ARCH[a].k }; });

  function bakeCity() {
    blds = [];
    dists.forEach(function (dd) {
      var ca = dd.ca, sa = dd.sa, yaw = dd.rot * PI / 180;
      dd.lots.forEach(function (lot) {
        var r = rec[lot.slug];
        var V = compose(r, lot), parts = [], top = 0, solid = 0;
        var toW = function (lx, ly) {
          var ax = lot.x + lx, ay = lot.y + ly;
          return [dd.x + ax * ca - ay * sa, dd.y + ax * sa + ay * ca];
        };
        V.forEach(function (v) {
          var p = { k: v.k, m: v.m, z0: v.z0 };
          var q;
          if (v.k === 'm') {
            var a0 = toW(v.x0, v.y0), a1 = toW(v.x1, v.y1);
            p.ax = a0[0]; p.ay = a0[1]; p.az = v.z0;
            p.bx = a1[0]; p.by = a1[1]; p.bz = v.z1;
            p.w = v.w; p.cx = (a0[0] + a1[0]) / 2; p.cy = (a0[1] + a1[1]) / 2;
            p.zc = (v.z0 + v.z1) / 2;
            top = Math.max(top, v.z1);
          } else if (v.k === 't') {
            var c0 = toW(v.x, v.y);
            p.cx = c0[0]; p.cy = c0[1]; p.z = v.z; p.r = v.r; p.kind = v.kind;
            p.zc = v.z;
            top = Math.max(top, v.z + v.r);
            if (v.kind === 'tree') solid = Math.max(solid, v.z);
          } else {
            var c1 = toW(v.x, v.y);
            p.cx = c1[0]; p.cy = c1[1]; p.yaw = yaw;
            p.z1 = v.z1 != null ? v.z1 : (v.z0 + (v.h || 0));
            p.zc = (v.z0 + p.z1) / 2;
            if (v.k === 'c' || v.k === 'd') { p.r = v.r; if (v.h != null) p.h = v.h; }
            else { p.hw = v.w / 2; p.hd = v.d / 2; }
            if (v.k === 'g') { p.ze = v.ze; p.zr = v.zr; p.gax = v.ax; p.z1 = v.z0 + v.zr; p.zc = v.z0 + v.zr * 0.5; }
            if (v.k === 'd') p.z1 = v.z0 + v.h;
            for (q in v) {
              if (q === 'k' || q === 'x' || q === 'y' || q === 'w' || q === 'd' ||
                  q === 'z0' || q === 'z1' || q === 'm' || q === 'r' || q === 'h' || q === 'ax') continue;
              if (p[q] === undefined) p[q] = v[q];
            }
            top = Math.max(top, p.z1);
            if (v.k === 'b' || v.k === 'c' || v.k === 'd' || v.k === 'g' || v.k === 'p') {
              solid = Math.max(solid, p.z1);
            }
          }
          /* how essential this piece is, so distance can drop the fine work */
          if (p.k === 'm') p.lvl = 2;
          else if (p.k === 't') p.lvl = v.kind === 'tree' ? 0 : 2;
          else if (p.k === 'c') p.lvl = v.r > 3 ? 1 : 2;
          else if (p.k === 'f' || p.k === 'n') p.lvl = 1;
          else if (p.k === 'b') {
            /* trim is trim: a cornice, a sill band or a chimney is not part of
               the silhouette, so distance is allowed to drop it */
            var thin = (p.z1 - v.z0) < 4.2 && v.z0 > 3;
            p.lvl = thin ? 1 : ((p.hw + p.hd) > 11 ? 0 : 1);
          }
          else p.lvl = 0;
          parts.push(p);
        });
        parts.sort(function (a, b) { return a.zc - b.zc; });
        var lw = lot.sw * P - GAP, ld = lot.sd * P - GAP;
        blds.push(r);
        r.parts = parts;
        r.boxes = parts;                 /* the reader's "is it built" check */
        r.wx = lot.wx; r.wy = lot.wy;
        r.hw = lw / 2; r.hd = ld / 2; r.yaw = yaw;
        r.topz = top; r.solidz = solid || top;
        r.matIx = MATIX[r.arch];
        r.varIx = (r.h32 % 6);
        r.hit = [];
      });
    });

    /* the grid extents of each quarter, for the painted street network */
    dists.forEach(function (dd) {
      var gx0 = 1e9, gy0 = 1e9, gx1 = -1e9, gy1 = -1e9;
      dd.lots.forEach(function (l) {
        if (l.cx < gx0) gx0 = l.cx; if (l.cx + l.sw - 1 > gx1) gx1 = l.cx + l.sw - 1;
        if (l.cy < gy0) gy0 = l.cy; if (l.cy + l.sd - 1 > gy1) gy1 = l.cy + l.sd - 1;
      });
      dd.gx0 = gx0; dd.gx1 = gx1; dd.gy0 = gy0; dd.gy1 = gy1;
    });

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
            r: 8 + rnd01(hsd, 2) * 13, z: 7 + rnd01(hsd, 3) * 9
          });
        }
      }
    }
  }

  /* ==================================================================
     LIFE — the small inhabited things. Lamps with a warm pool under them,
     market stalls on the plazas, benches, bollards, parked vans, street
     trees, washing strung between close blocks, birds over the quarter.
     Baked once, in world space, drawn by screen size.
     ================================================================== */
  function bakeProps() {
    props = [];
    var add = function (o) { props.push(o); };
    dists.forEach(function (dd, di) {
      var ca = dd.ca, sa = dd.sa;
      var toW = function (lx, ly) { return [dd.x + lx * ca - ly * sa, dd.y + lx * sa + ly * ca]; };
      var hd = hash32('d' + di);

      /* the plaza, where there is one: a market. Stalls with striped
         canopies, a well, and a ring of street trees around it. */
      var i, hasPlaza = dd.plaza && dd.plaza.r >= 1;
      var stalls = hasPlaza ? 3 + Math.round(rnd01(hd, 1) * 3) : 0;
      for (i = 0; i < stalls; i++) {
        var a = (i / stalls) * TAU + rnd01(hd, i + 2) * 0.5;
        var rr = P * (0.7 + rnd01(hd, i + 9) * 0.5);
        var w0 = toW(cos(a) * rr, sin(a) * rr);
        add({ k: 'stall', x: w0[0], y: w0[1], yaw: dd.rot * PI / 180 + a, s: 5.4 + rnd01(hd, i + 20) * 2.2,
              hue: Math.floor(rnd01(hd, i + 30) * 3) });
      }
      if (hasPlaza) {
        for (i = 0; i < 6; i++) {
          var a2 = (i / 6) * TAU + 0.4;
          var w1 = toW(cos(a2) * P * 1.62, sin(a2) * P * 1.62);
          add({ k: 'tree', x: w1[0], y: w1[1], r: 4.8 + rnd01(hd, i + 40) * 1.8, z: 11 + rnd01(hd, i + 50) * 3.5 });
        }
        add({ k: 'well', x: dd.x, y: dd.y, r: 4.6 });
        /* market-goers crossing the square */
        for (i = 0; i < 5; i++) {
          if (rnd01(hd, i + 60) > 0.8) continue;
          var a3 = rnd01(hd, i + 66) * TAU, r3 = P * (0.3 + rnd01(hd, i + 72) * 1.1);
          var w2p = toW(cos(a3) * r3, sin(a3) * r3);
          add({ k: 'ped', x: w2p[0], y: w2p[1], hue: Math.floor(rnd01(hd, i + 80) * 5),
                yaw: rnd01(hd, i + 84) * TAU });
        }
      }

      /* street furniture around every lot that fronts a street */
      dd.lots.forEach(function (lot, li) {
        var r = rec[lot.slug];
        var hl = r.h32;
        var fr = frontOf(lot), f = FN[fr];
        var w = lot.sw * P - GAP, d = lot.sd * P - GAP;
        var offx = f[0] * (w / 2 + 5.5), offy = f[1] * (d / 2 + 5.5);
        var side = (f[0] ? 1 : 0);
        /* a lamp at the kerb, always: it is what makes a street a street */
        var lx = offx + (side ? 0 : (rnd01(hl, 1) - 0.5) * w * 0.6);
        var ly = offy + (side ? (rnd01(hl, 1) - 0.5) * d * 0.6 : 0);
        var wl = toW(lot.x + lx, lot.y + ly);
        var lampP = { k: 'lamp', x: wl[0], y: wl[1], h: 13 + rnd01(hl, 2) * 3 };
        add(lampP);
        lampOf[lot.slug] = lampP;
        if (rnd01(hl, 3) > 0.55) {
          var b0 = toW(lot.x + lx + (side ? 0 : 8), lot.y + ly + (side ? 8 : 0));
          add({ k: 'bench', x: b0[0], y: b0[1], yaw: dd.rot * PI / 180 + (side ? PI / 2 : 0) });
        }
        if (rnd01(hl, 4) > 0.72 && !r.derelict) {
          var v0 = toW(lot.x + offx * 1.25 + (side ? 0 : 11), lot.y + offy * 1.25 + (side ? 11 : 0));
          add({ k: 'van', x: v0[0], y: v0[1], yaw: dd.rot * PI / 180 + (side ? PI / 2 : 0),
                hue: Math.floor(rnd01(hl, 5) * 4) });
        }
        if (rnd01(hl, 6) > 0.62) {
          var t0 = toW(lot.x + offx * 1.05 - (side ? 0 : 12), lot.y + offy * 1.05 - (side ? 12 : 0));
          add({ k: 'tree', x: t0[0], y: t0[1], r: 4.0 + rnd01(hl, 7) * 1.7, z: 9.5 + rnd01(hl, 8) * 3.5 });
        }
        var bi;
        for (bi = -1; bi <= 1; bi += 2) {
          if (rnd01(hl, 9 + bi) < 0.5) continue;
          var q0 = toW(lot.x + offx * 0.92 + (side ? 0 : bi * w * 0.34), lot.y + offy * 0.92 + (side ? bi * d * 0.34 : 0));
          add({ k: 'boll', x: q0[0], y: q0[1] });
        }
        /* people on the pavement: a knot of two or three near the front */
        if (!r.derelict && rnd01(hl, 12) > 0.42) {
          var np2 = 1 + (rnd01(hl, 13) > 0.6 ? 1 : 0), pi;
          for (pi = 0; pi <= np2; pi++) {
            var pu = (rnd01(hl, 14 + pi) - 0.5) * (side ? d : w) * 0.8;
            var pv = 6 + rnd01(hl, 18 + pi) * 5.5;
            var pw2 = toW(lot.x + (side ? f[0] * (w / 2 + pv) : pu),
                          lot.y + (side ? pu : f[1] * (d / 2 + pv)));
            add({ k: 'ped', x: pw2[0], y: pw2[1], hue: Math.floor(rnd01(hl, 22 + pi) * 5),
                  yaw: rnd01(hl, 26 + pi) * TAU });
          }
        }
        /* cafe furniture outside the workshops: a table and two stools */
        if (r.arch === 'workshop' && rnd01(hl, 33) > 0.55) {
          var cw2 = toW(lot.x + offx * 1.1 + (side ? 0 : -9), lot.y + offy * 1.1 + (side ? -9 : 0));
          add({ k: 'cafe', x: cw2[0], y: cw2[1], yaw: dd.rot * PI / 180 });
        }
      });

      /* washing strung between blocks that stand close together */
      var ls = dd.lots, j, k;
      for (j = 0; j < ls.length; j++) {
        for (k = j + 1; k < ls.length; k++) {
          var A = ls[j], Bl = ls[k];
          var ra = rec[A.slug], rb = rec[Bl.slug];
          if (ra.derelict || rb.derelict || ra.arch === 'garden' || rb.arch === 'garden') continue;
          var dx = Bl.x - A.x, dy = Bl.y - A.y, dl = Math.hypot(dx, dy);
          if (dl < P * 0.9 || dl > P * 1.9) continue;
          if (rnd01(hash32(A.slug + Bl.slug), 1) > 0.34) continue;
          var za = Math.min(ra.solidz, rb.solidz) * 0.62 + 6;
          if (za < 12) continue;
          var pa = toW(A.x + dx * 0.30, A.y + dy * 0.30);
          var pb = toW(A.x + dx * 0.70, A.y + dy * 0.70);
          add({ k: 'wash', ax: pa[0], ay: pa[1], bx: pb[0], by: pb[1], z: za,
                n: 4 + Math.floor(rnd01(hash32(A.slug + Bl.slug), 2) * 4),
                seed: hash32(A.slug + Bl.slug) });
          break;
        }
      }
    });
    /* a few birds, high over the middle of the model */
    var bi2;
    for (bi2 = 0; bi2 < 14; bi2++) {
      var hb = hash32('bird' + bi2);
      var ang = rnd01(hb, 1) * TAU, rad = bounds.r * (0.15 + rnd01(hb, 2) * 0.6);
      props.push({ k: 'bird', x: bounds.cx + cos(ang) * rad, y: bounds.cy + sin(ang) * rad,
        z: 120 + rnd01(hb, 3) * 190, s: 3.4 + rnd01(hb, 4) * 3, ph: rnd01(hb, 5) * TAU });
    }
    /* gulls low over the river, and one rowboat drifting on it */
    if (river.pts.length) {
      var gi;
      for (gi = 0; gi < 10; gi++) {
        var hg = hash32('gull' + gi);
        var rp = river.pts[Math.floor(rnd01(hg, 1) * (river.pts.length - 1))];
        props.push({ k: 'bird', x: rp.x + (rnd01(hg, 2) - 0.5) * 44, y: rp.y + (rnd01(hg, 3) - 0.5) * 44,
          z: 16 + rnd01(hg, 4) * 42, s: 2.0 + rnd01(hg, 5) * 1.5, ph: rnd01(hg, 6) * TAU });
      }
      var bmid = river.pts[river.pts.length >> 1];
      var bnext = river.pts[(river.pts.length >> 1) + 1] || bmid;
      props.push({ k: 'boat', x: bmid.x, y: bmid.y,
        yaw: Math.atan2(bnext.y - bmid.y, bnext.x - bmid.x) });
    }
  }

  /* ==================================================================
     SPRITES — every soft thing is a baked radial sprite, blitted through
     an affine transform. No per-frame blur anywhere.
     ================================================================== */
  var SPR = {};
  function blobSprite(col, a0, pow) {
    var S = 128, c = document.createElement('canvas');
    c.width = S; c.height = S;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    for (var i = 0; i <= 10; i++) {
      var t = i / 10;
      grd.addColorStop(t, rgbas(col, (a0 * Math.pow(1 - t, pow || 2)).toFixed(4)));
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
  /* a seamless patch of surface, painted once, laid on the plane in true
     perspective. Two of them: the cream of the paper, the dark of the table. */
  function planeTile(baseC, warmC, coolC, amp, tooth, plank) {
    var S = 512, c = document.createElement('canvas');
    c.width = S; c.height = S;
    var g = c.getContext('2d'), i, o, j, k;
    g.fillStyle = rgbs(baseC); g.fillRect(0, 0, S, S);
    if (plank) {
      /* the table is boards, not a void: four planks per tile, each with a
         dark seam, a lit arris beside it and its own slight cast */
      var bw = S / 4;
      for (i = 0; i < 4; i++) {
        var bx = i * bw;
        g.fillStyle = rgbas(i % 2 ? warmC : coolC, 0.07);
        g.fillRect(bx, 0, bw, S);
        g.fillStyle = rgbas(hx('#150D09'), 0.62);
        g.fillRect(bx, 0, 2.4, S);
        g.fillStyle = rgbas(warmC, 0.20);
        g.fillRect(bx + 2.4, 0, 2.6, S);
      }
      /* long grain streaks running with the boards */
      var seed0 = 313;
      function rg() { seed0 = (seed0 * 1103515245 + 12345) & 0x7fffffff; return ((seed0 >> 9) & 0xffff) / 65536; }
      for (i = 0; i < 46; i++) {
        var gx = rg() * S, gl = 40 + rg() * 200, gy = rg() * S;
        g.fillStyle = rgbas(rg() > 0.5 ? warmC : hx('#150D09'), 0.05 + rg() * 0.07);
        g.fillRect(gx, gy, 1 + rg() * 1.6, gl);
        if (gy + gl > S) g.fillRect(gx, gy - S, 1.4, gl);
      }
    }
    var octs = [{ n: 16, r: 170, a: 0.40 * amp }, { n: 56, r: 66, a: 0.30 * amp }, { n: 190, r: 22, a: 0.22 * amp }];
    var seed = 7;
    function rf() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return ((seed >> 9) & 0xffff) / 65536; }
    for (o = 0; o < octs.length; o++) {
      var oc = octs[o];
      for (i = 0; i < oc.n; i++) {
        var x = rf() * S, y = rf() * S, rr = oc.r * (0.55 + rf() * 0.95);
        var up = rf() > 0.47;
        var grd = g.createRadialGradient(0, 0, 0, 0, 0, rr);
        grd.addColorStop(0, rgbas(up ? warmC : coolC, oc.a));
        grd.addColorStop(0.55, rgbas(up ? warmC : coolC, oc.a * 0.42));
        grd.addColorStop(1, rgbas(up ? warmC : coolC, 0));
        g.fillStyle = grd;
        for (j = -1; j <= 1; j++) for (k = -1; k <= 1; k++) {
          if (x + j * S < -rr || x + j * S > S + rr || y + k * S < -rr || y + k * S > S + rr) continue;
          g.save(); g.translate(x + j * S, y + k * S);
          g.fillRect(-rr, -rr, rr * 2, rr * 2);
          g.restore();
        }
      }
    }
    var im = g.getImageData(0, 0, S, S), dt = im.data;
    for (i = 0; i < S * S; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var n = (((seed >> 13) & 63) - 32) * tooth;
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
    grd.addColorStop(0.74, rgbas(col, 0.99));
    grd.addColorStop(0.88, rgbas(col, 0.78));
    grd.addColorStop(0.97, rgbas(col, 0.16));
    grd.addColorStop(1, rgbas(col, 0));
    g.fillStyle = grd; g.fillRect(0, 0, S, S);
    /* a broken edge, so a canopy is foliage and not a ball */
    g.globalCompositeOperation = 'destination-out';
    var i, seed = 31;
    function rf() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return ((seed >> 9) & 0xffff) / 65536; }
    for (i = 0; i < 42; i++) {
      var a = rf() * TAU, rr = S * (0.40 + rf() * 0.12);
      var s2 = S * (0.045 + rf() * 0.06);
      var gg = g.createRadialGradient(S / 2 + cos(a) * rr, S / 2 + sin(a) * rr, 0,
        S / 2 + cos(a) * rr, S / 2 + sin(a) * rr, s2);
      gg.addColorStop(0, 'rgba(0,0,0,0.85)'); gg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gg;
      g.fillRect(S / 2 + cos(a) * rr - s2, S / 2 + sin(a) * rr - s2, s2 * 2, s2 * 2);
    }
    g.globalCompositeOperation = 'source-over';
    return c;
  }
  function smokeSprite() {
    var S = 128, c = document.createElement('canvas');
    c.width = S; c.height = S;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    grd.addColorStop(0, 'rgba(255,244,228,0.55)');
    grd.addColorStop(0.45, 'rgba(246,225,200,0.30)');
    grd.addColorStop(1, 'rgba(240,215,190,0)');
    g.fillStyle = grd; g.fillRect(0, 0, S, S);
    return c;
  }

  function bakeSprites() {
    SPR.shadow    = blobSprite(C.shadow, 0.95, 1.6);
    SPR.ao        = blobSprite(mix(C.shadow, C.ink, 0.45), 0.95, 2.6);
    SPR.canopy    = leafSprite(mix(C.jade, C.shadow, 0.24));
    SPR.canopyLit = leafSprite(mix(C.jadeHi, C.sun, 0.34));
    SPR.grove     = blobSprite(mix(C.jade, C.earth, 0.36), 0.9, 1.6);
    SPR.haze      = blobSprite(C.haze, 0.98, 1.3);
    SPR.glow      = blobSprite(C.glow, 0.60, 2.1);
    SPR.glint     = blobSprite(mix(C.lit, [255, 255, 255], 0.38), 0.85, 2.4);
    SPR.warm      = blobSprite(C.lit, 0.85, 2.2);
    SPR.paving    = blobSprite(mix(C.earthHi, C.sun, 0.24), 0.55, 1.5);
    SPR.smoke     = smokeSprite();
    SPR.grain     = grainTile();
    SPR.grainPat  = ctx.createPattern(SPR.grain, 'repeat');

    SPR.paperTile = planeTile(C.paper, mix(C.paper, [255, 255, 255], 0.5),
      mix(C.paperLo, C.print, 0.25), 0.7, 0.28);
    SPR.tableTile = planeTile(C.table, C.tableHi, hx('#1B120E'), 1.0, 0.5, 1);
    SPR.paperPat = ctx.createPattern(SPR.paperTile, 'repeat');
    SPR.paperPat2 = ctx.createPattern(SPR.paperTile, 'repeat');
    SPR.tablePat = ctx.createPattern(SPR.tableTile, 'repeat');
    try {
      if (window.DOMMatrix && SPR.paperPat.setTransform) {
        SPR.paperPat.setTransform(new DOMMatrix().scaleSelf(0.62));
        SPR.paperPat2.setTransform(new DOMMatrix().rotateSelf(41).scaleSelf(0.14));
        SPR.tablePat.setTransform(new DOMMatrix().scaleSelf(1.05));
      }
    } catch (e) { }
  }

  /* ==================================================================
     THE PAGE — the model stands on a torn sheet of the documentation.
     The sheet carries real body text and real headings, set in the same
     reading order as the docs; the city is built on top of them. Its edge
     is deckled, it curls, and it throws a shadow onto the table.
     ================================================================== */
  function bakePaper() {
    /* The sheet is cut around what was actually built, not around the circle
       the quarters happen to sit in, so the city fills its page. */
    var bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9, q;
    for (q = 0; q < blds.length; q++) {
      var bb = blds[q];
      if (bb.wx - bb.hw < bx0) bx0 = bb.wx - bb.hw;
      if (bb.wx + bb.hw > bx1) bx1 = bb.wx + bb.hw;
      if (bb.wy - bb.hd < by0) by0 = bb.wy - bb.hd;
      if (bb.wy + bb.hd > by1) by1 = bb.wy + bb.hd;
    }
    if (bx0 > bx1) { bx0 = bounds.cx - bounds.r; bx1 = bounds.cx + bounds.r; by0 = bounds.cy - bounds.r; by1 = bounds.cy + bounds.r; }
    var r = Math.max(bx1 - bx0, by1 - by0) / 2, mx = r * 0.26;
    var x0 = bx0 - mx * 0.62, x1 = bx1 + mx * 0.62;
    var y0 = by0 - mx * 1.85, y1 = by1 + mx * 0.55;
    var W0 = x1 - x0, H0 = y1 - y0;

    /* the deckle: a torn edge, coarse waves under a fine tooth, with two
       corners torn deeper than the rest */
    var edge = [], N = 128, i;
    var per = 2 * (W0 + H0);
    for (i = 0; i < N * 4; i++) {
      var t = i / (N * 4), s = t * per, ex, ey, nx, ny;
      if (s < W0) { ex = x0 + s; ey = y0; nx = 0; ny = -1; }
      else if (s < W0 + H0) { ex = x1; ey = y0 + (s - W0); nx = 1; ny = 0; }
      else if (s < 2 * W0 + H0) { ex = x1 - (s - W0 - H0); ey = y1; nx = 0; ny = 1; }
      else { ex = x0; ey = y1 - (s - 2 * W0 - H0); nx = -1; ny = 0; }
      var h = hash32('deckle' + i);
      var wob = sin(t * TAU * 7.3) * 0.5 + sin(t * TAU * 19.1) * 0.28 + sin(t * TAU * 41.7) * 0.14;
      var amp = r * 0.030;
      var d = wob * amp + (rnd01(h, 1) - 0.5) * amp * 0.9;
      /* deeper tears at two corners */
      var c1 = Math.exp(-Math.pow((t - 0.13) / 0.05, 2)) + Math.exp(-Math.pow((t - 0.66) / 0.06, 2));
      d -= c1 * r * 0.075;
      edge.push({ x: ex + nx * d, y: ey + ny * d, nx: nx, ny: ny, t: t });
    }
    /* how far each point of the edge lifts off the table */
    for (i = 0; i < edge.length; i++) {
      var e = edge[i], tt = e.t;
      var corner = Math.max(
        Math.exp(-Math.pow((tt - 0.00) / 0.055, 2)), Math.exp(-Math.pow((tt - 1.00) / 0.055, 2)),
        Math.exp(-Math.pow((tt - 0.25) / 0.055, 2)), Math.exp(-Math.pow((tt - 0.50) / 0.055, 2)),
        Math.exp(-Math.pow((tt - 0.75) / 0.055, 2)));
      e.lift = 1.4 + corner * r * 0.055 + (0.5 + 0.5 * sin(tt * TAU * 5.1)) * r * 0.006;
      e.out = 2.0 + corner * r * 0.020;
    }

    /* the print. Real text, in reading order, wrapped into two columns like a
       documentation page, at a size that is legible when you lean in. */
    var lines = [], stream = [], si = 0;
    var take = 90;
    for (i = 0; i < order.length && stream.length < 5200; i++) {
      var p = pages[order[i]];
      stream.push({ k: 'h', s: title(p).toUpperCase() });
      if (p.description) pushWrapped(stream, p.description, 74);
      var bi, got = 0;
      for (bi = 0; bi < p.blocks.length && got < 5; bi++) {
        var b = p.blocks[bi];
        if (b.t === 'p') { pushWrapped(stream, stripTags(b.html), 74); got++; }
        else if (b.t === 'h2' || b.t === 'h3') { stream.push({ k: 's', s: b.text }); got++; }
      }
      stream.push({ k: 'b' });
      if (--take <= 0) break;
    }

    /* The sheet is read the way a sheet on a table is read: the viewer stands
       on the near side, so the top of the page is the far edge and successive
       lines march toward the viewer. The near margin is left bare for the
       name. */
    var marg = mx * 0.30;
    var colGap = W0 * 0.045;
    var colW = (W0 - marg * 2 - colGap) / 2;
    var lead = 6.4, bodySize = 4.0, headSize = 6.6, subSize = 4.9;
    var top = y1 - marg * 1.15;
    var botLimit = y0 + mx * 1.30;
    var col, cy2, guard = 0;
    for (col = 0; col < 2; col++) {
      cy2 = top;
      var cx0 = x0 + marg + col * (colW + colGap);
      while (cy2 > botLimit && si < stream.length && guard++ < 4000) {
        var it = stream[si++];
        if (it.k === 'b') { cy2 -= lead * 0.7; continue; }
        if (it.k === 'h') {
          cy2 -= lead * 0.9;
          lines.push({ x: cx0, y: cy2, s: it.s, size: headSize, kind: 'h', w: colW });
          cy2 -= lead * 1.5;
          lines.push({ x: cx0, y: cy2 + lead * 0.55, s: '', size: 0, kind: 'rule', w: colW });
        } else if (it.k === 's') {
          cy2 -= lead * 0.6;
          lines.push({ x: cx0, y: cy2, s: it.s, size: subSize, kind: 's', w: colW });
          cy2 -= lead * 1.15;
        } else {
          lines.push({ x: cx0, y: cy2, s: it.s, size: bodySize, kind: 'p', w: colW });
          cy2 -= lead;
        }
      }
    }

    paper = {
      x0: x0, y0: y0, x1: x1, y1: y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2,
      edge: edge, lines: lines,
      title: 'Strapi Documentation',
      sub: order.length + ' pages · ' + nfmt(G.edges.length) + ' citations · ' +
        COM.length + ' measured districts · v' + B.version,
      tx: x0 + marg, ty: y0 + mx * 0.60, tsize: mx * 0.50,
      sx: x0 + marg + 2, sy: y0 + mx * 0.30, ssize: mx * 0.105
    };

    /* the model-maker's tools, laid on the table beside the torn edge: an
       oversized pencil in the near foreground and a ruler along the far
       side. They lie flat on the table, so they are drawn right after the
       sheet, never through the depth-sorted prop stream: a long flat stick
       sorted by its midpoint would land on top of a district at grazing
       angles. */
    tools = [
      { k: 'pencil', x: paper.cx - W0 * 0.24, y: y0 - mx * 0.34,
        yaw: 0.12, len: W0 * 0.155 },
      { k: 'ruler', x: x1 + mx * 0.80, y: paper.cy - H0 * 0.06,
        yaw: PI / 2 + 0.07, len: H0 * 0.17 },
      /* the rest of the maker's bench: a craft knife by the near edge, a
         paint pot with its brush laid across a rag, an eraser, and the
         curled shavings the pencil left behind */
      { k: 'knife', x: paper.cx + W0 * 0.235, y: y0 - mx * 0.50,
        yaw: -0.34, len: W0 * 0.075 },
      { k: 'pot', x: x0 - mx * 1.25, y: paper.cy + H0 * 0.22,
        yaw: 0.6, len: W0 * 0.052 },
      { k: 'eraser', x: x0 - mx * 1.05, y: y0 + H0 * 0.13,
        yaw: 0.42, len: W0 * 0.045 },
      { k: 'shavings', x: paper.cx - W0 * 0.16 + W0 * 0.10, y: y0 - mx * 0.36,
        yaw: 0.9, len: W0 * 0.05 }];
  }
  function pushWrapped(out, text, n) {
    var words = String(text || '').split(/\s+/), line = '', i;
    for (i = 0; i < words.length; i++) {
      if (!words[i]) continue;
      if (line.length + words[i].length + 1 > n) { out.push({ k: 'p', s: line }); line = words[i]; }
      else line = line ? line + ' ' + words[i] : words[i];
      if (out.length > 6000) return;
    }
    if (line) out.push({ k: 'p', s: line });
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
    if (paper && typeof fitHome === 'function') fitHome();
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
    HZF = 1 - 0.55 * clamp((cam.el - 0.32) / 0.38, 0, 1);
    PCX = W / 2;
    /* Where the look-at point sits in frame. Down low this is a street
       photograph and the subject rides low under a lot of sky; from above it
       is a diorama on a table and the sheet wants the middle of the frame. */
    var hi = clamp((cam.el - 0.30) / 0.18, 0, 1);
    PCY = H * (0.36 + 0.16 * hi) + FOC * (se / ce) * 0.72 * (1 - hi);
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
  var HZ_NEAR = 210, HZ_FAR = 2500, HZ_MAX = 0.70, HZF = 1;
  function hazeAt(d) {
    var t = (d - HZ_NEAR) / (HZ_FAR - HZ_NEAR);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    /* HZF: down among the streets the haze is the golden-hour air; looking
       down from above, this is a model on a table an arm's length away, and
       a tabletop does not fog. The factor is set from camera elevation. */
    return Math.pow(t, 1.45) * HZ_MAX * HZF;
  }

  /* ---------------------------------------------------- face palette */
  var M_VAN0 = 17, M_STALL0 = 21;
  [ '#8C4A32', '#4A6B54', '#B08240', '#5A5364' ].forEach(function (h, i) {
    MX[M_VAN0 + i] = { base: h, k: 0.40 };
  });
  [ '#C3462F', '#3F7F86', '#D89A3C' ].forEach(function (h, i) {
    MX[M_STALL0 + i] = { base: h, k: 0.50 };
  });
  var MBASE = MX.map(function (m) { return hx(m.base); });
  var MK = MX.map(function (m) { return m.k; });
  /* six colourways of each archetype: the three swatches, plus a sunned, a
     shaded and a lightened cut of them, so neighbours never match exactly */
  var MVARC = ARCH_ORDER.map(function (a) {
    var v3 = MVAR[a].map(function (h) { return hx(h); });
    return [v3[0], v3[1], v3[2],
      mix(v3[0], C.sun, 0.10), mix(v3[1], C.shadow, 0.07), lit(v3[2], 1.06)];
  });
  var VARF = [0.92, 1.0, 1.09, 0.96, 1.04, 0.88];
  /* 0 face top, 1 face bottom, 2 flat, 3 recess, 4 deep recess,
     5 highlight, 6 mid shade, 7 the dark of an opening */
  var MULS = [1.08, 0.86, 0.97, 0.70, 0.55, 1.20, 0.80, 0.34];
  var palCache = {};
  function smoothstep(t) { return t * t * (3 - 2 * t); }

  function faceCol(m, v, tB, hB, part) {
    var key = (((m * 6 + v) * 9 + tB) * 19 + hB) * 8 + part;
    var s = palCache[key];
    if (s !== undefined) return s;
    var base = m < 7 ? MVARC[m][v] : lit(MBASE[m], VARF[v]);
    var k = MK[m];
    /* Shade in a warm city is warm. The old face went straight to violet and
       every wall in it read grey; here the shade is the body colour taken
       down and only tinted violet, with a little bounced sun put back. */
    var sunC = lit(mix(base, C.sun, k), 1.12);
    var shC2 = mix(mix(lit(base, 0.60), C.shadow, 0.17), C.sun, 0.11);
    var t = smoothstep(tB / 8);
    var f = mix(shC2, sunC, t);
    var c = lit(f, MULS[part]);
    if (part >= 3 && part <= 4) c = mix(c, C.shadow, 0.16);
    if (part === 7) c = mix(lit(base, 0.30), C.shadow, 0.24);
    c = mix(c, C.haze, (hB / 18) * HZ_MAX);
    s = rgbs(c);
    palCache[key] = s;
    return s;
  }
  function roofCol(m, v, hB, part) {
    var key = 900000 + ((m * 6 + v) * 19 + hB) * 4 + part;
    var s = palCache[key];
    if (s !== undefined) return s;
    var base = m < 7 ? MVARC[m][v] : lit(MBASE[m], VARF[v]);
    /* the sun is nearly at the horizon: a flat roof catches sky, not sun,
       so it keeps most of its own colour instead of washing to cream */
    var c = mix(mix(base, mix(C.sun, C.skyLo, 0.40), MK[m] * 0.47), C.shadow, 0.07);
    if (part === 0) c = lit(c, 1.03);
    else if (part === 1) c = lit(c, 0.82);
    else if (part === 3) c = lit(mix(c, C.shadow, 0.22), 0.72);
    c = mix(c, C.haze, (hB / 18) * HZ_MAX);
    s = rgbs(c);
    palCache[key] = s;
    return s;
  }
  function litCol(hB) {
    var key = 800000 + hB;
    var s = palCache[key];
    if (s !== undefined) return s;
    s = rgbs(mix(C.lit, C.haze, (hB / 18) * HZ_MAX * 0.6));
    palCache[key] = s; return s;
  }
  /* a window with nobody home: violet dusk behind the glass, never navy.
     A breath of the sun's glow is mixed in so an unlit pane sits in the warm
     scene instead of punching a cold hole in the facade. */
  function darkGlassCol(hB) {
    var key = 810000 + hB;
    var s = palCache[key];
    if (s !== undefined) return s;
    s = rgbs(mix(mix(mix(lit(C.shadow, 0.60), C.water, 0.10), C.glow, 0.10),
      C.haze, (hB / 18) * HZ_MAX));
    palCache[key] = s; return s;
  }
  /* the specular flash a sun-facing pane throws back */
  function glintPaneCol(hB) {
    var key = 820000 + hB;
    var s = palCache[key];
    if (s !== undefined) return s;
    s = rgbs(mix(mix(C.lit, [255, 255, 255], 0.55), C.haze, (hB / 18) * HZ_MAX * 0.5));
    palCache[key] = s; return s;
  }

  /* ==================================================================
     RENDER
     ================================================================== */
  var shC = null, shX = null, SHS = 0.30;
  var skyKey = '', skyGrad = null, gndGrad = null, hazeGrad = null, vigGrad = null;
  var bloom = [];
  var lastFrameMs = 0, frameSamples = [], PROF = null, GSTRIPS = 0, DBG = 0, FRAMEN = 0;
  var NPART = 0, NFILL = 0, NGRAD = 0;
  var TNOW = 0;

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
      g.addColorStop(0.36, rgbs(mix(C.skyHi, C.skyMid, 0.72)));
      g.addColorStop(0.66, rgbs(mix(C.skyMid, C.haze, 0.66)));
      g.addColorStop(0.86, rgbs(mix(C.haze, C.skyLo, 0.74)));
      g.addColorStop(1.00, rgbs(mix(C.skyLo, C.sun, 0.30)));
      skyGrad = g;

      /* below the horizon is not more city: it is the table the page lies on */
      var g2 = ctx.createLinearGradient(0, top, 0, H);
      g2.addColorStop(0.00, rgbs(mix(C.haze, C.tableHi, 0.40)));
      g2.addColorStop(0.12, rgbs(mix(C.tableHi, C.haze, 0.44)));
      g2.addColorStop(0.32, rgbs(mix(C.tableHi, C.sun, 0.06)));
      g2.addColorStop(0.62, rgbs(mix(C.table, C.tableHi, 0.34)));
      g2.addColorStop(1.00, rgbs(mix(C.table, C.ink, 0.42)));
      gndGrad = g2;

      var hb0 = top - H * 0.11, hb1 = top + H * 0.16;
      var g3 = ctx.createLinearGradient(0, hb0, 0, hb1);
      g3.addColorStop(0, rgbas(C.haze, 0));
      g3.addColorStop(0.30, rgbas(mix(C.haze, C.skyLo, 0.40), 0.30));
      g3.addColorStop(0.50, rgbas(mix(C.haze, C.skyLo, 0.36), 0.48));
      g3.addColorStop(0.72, rgbas(mix(C.haze, C.skyLo, 0.32), 0.26));
      g3.addColorStop(1, rgbas(C.haze, 0));
      hazeGrad = g3;

      var g4 = ctx.createRadialGradient(W * 0.5, H * 0.44, Math.min(W, H) * 0.26, W * 0.5, H * 0.48, Math.max(W, H) * 0.80);
      g4.addColorStop(0, rgbas(C.ink, 0));
      g4.addColorStop(1, rgbas(C.ink, 0.28));
      vigGrad = g4;

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
        x.globalAlpha = 0.85;
        x.drawImage(SPR.glow, sunSX - m2 * 0.58, sunSY - m2 * 0.46, m2 * 1.16, m2 * 0.92);
        x.globalAlpha = 1;
        x.drawImage(SPR.glint, sunSX - H * 0.08, sunSY - H * 0.08, H * 0.16, H * 0.16);
        x.globalCompositeOperation = 'source-over';
      }
      x.fillStyle = hazeGrad; x.fillRect(0, 0, W, H);
    }
    ctx.drawImage(skyC, 0, 0);
  }

  function spriteAt(spr, x, y, rx, ry, a) {
    if (rx < 0.4 || ry < 0.4) return;
    ctx.globalAlpha = a;
    ctx.drawImage(spr, x - rx, y - ry, rx * 2, ry * 2);
    ctx.globalAlpha = 1;
  }
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

  /* the ground plane, textured in true perspective: on a horizontal plane a
     screen scanline is a line of constant depth, so one affine transform per
     horizontal strip is exact, and forty strips make the seam invisible */
  function planeStrips(pat, pat2, alphaMul) {
    if (!pat || CE <= 0.0001) return;
    var y0 = Math.max(0, Math.floor(HORY) + 2);
    if (y0 >= H) return;
    /* strips packed toward the horizon, where depth (and so the haze) moves
       fastest between scanlines: uniform strips step visibly there */
    var NS = 88, spanY = H - y0, i;
    for (i = 0; i < NS; i++) {
      var ya = y0 + spanY * Math.pow(i / NS, 1.35);
      var yb = y0 + spanY * Math.pow((i + 1) / NS, 1.35) + 1;
      var yc = (ya + yb) / 2;
      var den = SE + ((yc - PCY) / FOC) * CE;
      if (den <= 0.0006) continue;
      var d = eye[2] / den;
      if (d < 8 || d > 26000) continue;
      var a2 = (1 - hazeAt(d)) * alphaMul;
      /* the pattern dissolves with distance: at long range the strip seams
         beat against the plank tile and the table reads as scanlines */
      if (d > 2400) a2 *= clamp(1 - (d - 2400) / 2400, 0, 1);
      if (a2 < 0.02) continue;
      var kf = FOC / d;
      var A = kf * rgt[0], Bc = -kf * upv[0], Cc = kf * rgt[1], Dc = -kf * upv[1];
      var E = PCX - kf * (eye[0] * rgt[0] + eye[1] * rgt[1]);
      var F2 = PCY + kf * (eye[0] * upv[0] + eye[1] * upv[1] + eye[2] * upv[2]);
      var vv = -(yc - PCY) / FOC;
      var gx = eye[0] + d * (fwd[0] + vv * upv[0]);
      var gy = eye[1] + d * (fwd[1] + vv * upv[1]);
      var span = d * (W / FOC) * 1.1 + d * ((yb - ya) / FOC) * 2 + 40;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, ya, W, yb - ya); ctx.clip();
      ctx.setTransform(DPR * A, DPR * Bc, DPR * Cc, DPR * Dc, DPR * E, DPR * F2);
      ctx.globalAlpha = a2;
      ctx.fillStyle = pat;
      ctx.fillRect(gx - span, gy - span, span * 2, span * 2);
      if (pat2 && d < 2600) {
        ctx.globalAlpha = a2 * 0.5;
        ctx.fillStyle = pat2;
        ctx.fillRect(gx - span, gy - span, span * 2, span * 2);
      }
      ctx.restore();
      GSTRIPS++;
    }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalAlpha = 1;
  }

  /* ------------------------------------------------------- the page */
  /* The sheet is bigger than the frame as soon as you come down among the
     buildings, so its outline has to be clipped against the camera's near
     plane before it is projected. Without this the page simply vanishes the
     moment one of its corners passes behind you. */
  var CLIPD = 12;
  var polyX = [], polyY = [];
  function clipRing(pts, ox, oy, zf) {
    polyX.length = 0; polyY.length = 0;
    var n = pts.length, i;
    var pxw = 0, pyw = 0, pd = 0, first = true, fx = 0, fy = 0, fz = 0, fd = 0;
    for (i = 0; i <= n; i++) {
      var q = pts[i % n];
      var cx2 = q.x + (ox ? ox * q.nx : 0) - (zf ? sunGnd[0] * zf : 0);
      var cy2 = q.y + (ox ? oy * q.ny : 0) - (zf ? sunGnd[1] * zf : 0);
      var d = (cx2 - eye[0]) * fwd[0] + (cy2 - eye[1]) * fwd[1] + (0 - eye[2]) * fwd[2];
      if (first) { pxw = cx2; pyw = cy2; pd = d; fx = cx2; fy = cy2; fd = d; first = false; if (d >= CLIPD) push2(cx2, cy2); continue; }
      if (d >= CLIPD) {
        if (pd < CLIPD) { var t = (CLIPD - pd) / (d - pd); push2(pxw + (cx2 - pxw) * t, pyw + (cy2 - pyw) * t); }
        push2(cx2, cy2);
      } else if (pd >= CLIPD) {
        var t2 = (CLIPD - pd) / (d - pd);
        push2(pxw + (cx2 - pxw) * t2, pyw + (cy2 - pyw) * t2);
      }
      pxw = cx2; pyw = cy2; pd = d;
    }
    return polyX.length;
  }
  function push2(wx, wy) {
    if (!proj(wx, wy, 0)) return;
    polyX.push(px); polyY.push(py);
  }
  function ringPath(n) {
    ctx.beginPath();
    ctx.moveTo(polyX[0], polyY[0]);
    for (var i = 1; i < n; i++) ctx.lineTo(polyX[i], polyY[i]);
    ctx.closePath();
  }

  var edgeSX = null, edgeSY = null, edgeOK = false;
  function projectEdge() {
    var e = paper.edge, n = e.length, i;
    if (!edgeSX || edgeSX.length !== n) { edgeSX = new Float64Array(n); edgeSY = new Float64Array(n); }
    edgeOK = true;
    for (i = 0; i < n; i++) {
      if (!proj(e[i].x, e[i].y, 0)) { edgeOK = false; return; }
      edgeSX[i] = px; edgeSY[i] = py;
    }
  }

  function paperFill() {
    var pg = ctx.createLinearGradient(0, Math.max(0, HORY), 0, H);
    pg.addColorStop(0, rgbs(mix(C.paper, C.haze, 0.42)));
    pg.addColorStop(0.45, rgbs(mix(C.paper, C.haze, 0.14)));
    pg.addColorStop(1, rgbs(mix(C.paper, [255, 255, 255], 0.10)));
    ctx.fillStyle = pg;
    ctx.fillRect(0, 0, W, H);
    planeStrips(SPR.paperPat, SPR.paperPat2, 0.55);
    drawPrint();
  }

  function drawPaper() {
    if (!paper) return;
    var i, n = paper.edge.length;

    /* the shadow the sheet throws on the table */
    var ns = clipRing(paper.edge, 2.5, 2.5, 10);
    if (ns >= 3) {
      ringPath(ns);
      ctx.fillStyle = rgbas(mix(C.ink, C.shadow, 0.34), 0.50);
      ctx.fill();
    }

    /* the sheet: opaque, so the table never shows through it, then its fibre
       laid on in true perspective, then the print */
    var np = clipRing(paper.edge, 0, 0, 0);
    if (np < 3) return;
    ctx.save();
    ringPath(np);
    ctx.clip();
    paperFill();
    ctx.restore();

    /* the curl: a lip along the torn edge, lifted clear of the table. Only
       drawn when the whole edge is in front of the camera. */
    projectEdge();
    if (!edgeOK) return;
    ctx.beginPath();
    var started = false, okL = true;
    for (i = 0; i <= n; i++) {
      var q = paper.edge[i % n];
      if (!proj(q.x + q.nx * q.out, q.y + q.ny * q.out, q.lift)) { okL = false; break; }
      if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
    }
    if (okL) for (i = n; i >= 0; i--) { ctx.lineTo(edgeSX[i % n], edgeSY[i % n]); }
    if (!okL) return;
    ctx.closePath();
    var lg = ctx.createLinearGradient(0, Math.max(0, HORY), 0, H);
    lg.addColorStop(0, rgbs(mix(C.paper, C.haze, 0.40)));
    lg.addColorStop(1, rgbs(mix(C.paper, [255, 255, 255], 0.16)));
    ctx.fillStyle = lg;
    ctx.fill();
    ctx.strokeStyle = rgbas(mix(C.paperLo, C.shadow, 0.34), 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /* the print: real documentation, in reading order, wrapped into two
     columns. From across the room it is the grain of a printed page; lean in
     and it is the actual text of the docs, with the city standing on it. */
  function drawPrint() {
    if (!paper || !paper.lines.length) return;
    var L = paper.lines, i, drawnText = 0, budget = 150, bars = 0;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.beginPath();
    for (i = 0; i < L.length; i++) {
      var ln = L[i];
      if (!proj(ln.x, ln.y, 0)) continue;
      var sx = px, sy = py, sc = pS;
      if (sx < -300 || sx > W + 300 || sy < HORY - 20 || sy > H + 60) continue;
      /* the frame of this line, taken at the line itself so the perspective
         is right wherever on the sheet it falls */
      if (!proj(ln.x + 60, ln.y, 0)) continue;
      var uX = (px - sx) / 60, uY = (py - sy) / 60;
      /* the page reads with its top toward the far edge, so canvas-down is
         world -y and the type is not mirrored */
      if (!proj(ln.x, ln.y - 60, 0)) continue;
      var vX = (px - sx) / 60, vY = (py - sy) / 60;
      var hpx = (ln.size || 3) * sc;
      if (hpx < 4.4 || drawnText > budget) {
        var wpx = ln.kind === 'rule' ? ln.w : Math.min(ln.w, ln.s.length * ln.size * 0.47);
        var th = (ln.kind === 'h' ? 1.9 : ln.kind === 'rule' ? 0.7 : 1.15);
        var ex = sx + uX * wpx, ey = sy + uY * wpx;
        if (abs(ex - sx) + abs(ey - sy) < 0.6) continue;
        ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
        ctx.lineTo(ex - vX * th, ey - vY * th); ctx.lineTo(sx - vX * th, sy - vY * th);
        ctx.closePath();
        bars++;
        continue;
      }
      if (ln.kind === 'rule') continue;
      drawnText++;
      ctx.save();
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.transform(uX, uY, vX, vY, sx, sy);
      var k = ln.size / 100;
      ctx.scale(k, k);
      ctx.globalAlpha = clamp(1 - hazeAt(depthOf(ln.x, ln.y, 0)), 0.15, 1) * (ln.kind === 'h' ? 0.62 : 0.40);
      ctx.fillStyle = rgbs(ln.kind === 'h' ? mix(C.print, C.ink, 0.5) : C.print);
      ctx.font = (ln.kind === 'h' ? '600 100px "Source Serif 4", Georgia, serif'
        : ln.kind === 's' ? '600 100px "Archivo Narrow", Arial, sans-serif'
        : '100px "Source Serif 4", Georgia, serif');
      ctx.fillText(ln.s, 0, 0);
      ctx.restore();
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.globalAlpha = 1;
    }
    if (bars) {
      ctx.fillStyle = rgbas(C.print, 0.50);
      ctx.fill();
    }

    /* the name of the city, set on the page it is printed on */
    drawPaperType(paper.title, paper.tx, paper.ty, paper.tsize,
      '600 100px "Source Serif 4", Georgia, serif', rgbas(mix(C.ink, C.print, 0.28), 0.88));
    drawPaperType(paper.sub, paper.sx, paper.sy, paper.ssize,
      '500 100px "Archivo Narrow", Arial, sans-serif', rgbas(C.print, 0.82));
  }

  /* type laid on the page, glyph by glyph, so the perspective is real */
  var typeM = null;
  function drawPaperType(str, wx, wy, size, font, col) {
    if (!typeM) { typeM = document.createElement('canvas').getContext('2d'); }
    typeM.font = font;
    var adv = 0, i, n = str.length;
    var scale = size / 100;
    for (i = 0; i < n; i++) {
      var ch = str.charAt(i);
      var wch = typeM.measureText(ch).width * scale;
      if (ch !== ' ') {
        if (proj(wx + adv, wy, 0)) {
          var ox = px, oy = py, sc = pS;
          if (size * sc > 2.4 && ox > -400 && ox < W + 400 && oy > HORY - 200 && oy < H + 200) {
            if (proj(wx + adv + 100, wy, 0)) {
              var uX = (px - ox) / 100, uY = (py - oy) / 100;
              if (proj(wx + adv, wy - 100, 0)) {
                var vX = (px - ox) / 100, vY = (py - oy) / 100;
                ctx.save();
                ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
                ctx.transform(uX, uY, vX, vY, ox, oy);
                ctx.scale(scale, scale);
                ctx.fillStyle = col;
                ctx.font = font;
                ctx.fillText(ch, 0, 0);
                ctx.restore();
                ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
              }
            }
          }
        }
      }
      adv += wch;
    }
  }

  function drawGroundDetail() {
    var i;
    for (i = 0; i < dists.length; i++) {
      var q = dists[i];
      var dq = depthOf(q.x, q.y, 0);
      if (dq < 20) continue;
      groundSprite(SPR.paving, q.x, q.y, q.r * 1.02, 0.30 * (1 - hazeAt(dq)));
    }
  }

  /* ------------------------------------------------- the street plan
     Each quarter carries its own paved network on the ground: the streets
     between its superblocks, kerb lines when you come down among them, zebra
     crossings at the junctions, and a tiled plaza around the monument. All
     of it is gated by the quarter's size on screen, so the establishing shot
     pays for none of the fine work. */
  var SG4 = new Float64Array(8);
  function sgQuad(d, lx0, ly0, lx1, ly1) {
    var xs = [lx0, lx1, lx1, lx0], ys = [ly0, ly0, ly1, ly1], i;
    for (i = 0; i < 4; i++) {
      var wx = d.x + xs[i] * d.ca - ys[i] * d.sa;
      var wy = d.y + xs[i] * d.sa + ys[i] * d.ca;
      if (!proj(wx, wy, 0)) return false;
      SG4[i * 2] = px; SG4[i * 2 + 1] = py;
    }
    ctx.beginPath();
    ctx.moveTo(SG4[0], SG4[1]); ctx.lineTo(SG4[2], SG4[3]);
    ctx.lineTo(SG4[4], SG4[5]); ctx.lineTo(SG4[6], SG4[7]);
    ctx.closePath();
    return true;
  }
  function sgLine(d, x0, y0, x1, y1) {
    var wx0 = d.x + x0 * d.ca - y0 * d.sa, wy0 = d.y + x0 * d.sa + y0 * d.ca;
    var wx1 = d.x + x1 * d.ca - y1 * d.sa, wy1 = d.y + x1 * d.sa + y1 * d.ca;
    if (!proj(wx0, wy0, 0)) return false;
    var sx = px, sy = py;
    if (!proj(wx1, wy1, 0)) return false;
    ctx.moveTo(sx, sy); ctx.lineTo(px, py);
    return true;
  }
  function drawDistrictGround() {
    var i, k, j;
    for (i = 0; i < dists.length; i++) {
      var d = dists[i];
      if (d.gx0 === undefined) continue;
      var dq = depthOf(d.x, d.y, 0);
      if (dq < 20) continue;
      var scr = d.r * (FOC / dq);
      if (scr < 46) continue;
      var hz = hazeAt(dq);
      if (hz > 0.86) continue;
      var av = clamp((scr - 46) / 80, 0, 1);
      var pave = rgbas(mix(mix(C.paperLo, C.print, 0.72), C.haze, hz), 0.40 + 0.32 * av);
      var kerbC = rgbas(mix(mix(C.paper, C.sun, 0.30), C.haze, hz), 0.85);
      var lx0 = gpos(d.gx0) - P * 0.35, lx1 = gpos(d.gx1 + 1) + P * 0.35;
      var ly0 = gpos(d.gy0) - P * 0.35, ly1 = gpos(d.gy1 + 1) + P * 0.35;
      /* the plate first: the whole built block is made ground, not paper */
      ctx.fillStyle = rgbas(mix(mix(C.earthHi, C.paperLo, 0.5), C.haze, hz),
        (0.30 + 0.16 * av) * (1 - hz * 0.7));
      if (sgQuad(d, lx0 - 4, ly0 - 4, lx1 + 4, ly1 + 4)) ctx.fill();
      /* the street strips, on every 4th grid line both ways */
      var vx = [], vy = [];
      for (k = Math.ceil(d.gx0 / 4); k * 4 <= d.gx1 + 1; k++) {
        var sx0 = gpos(4 * k) - SW;
        if (sx0 >= lx0 - SW && sx0 <= lx1) vx.push(sx0);
      }
      for (k = Math.ceil(d.gy0 / 4); k * 4 <= d.gy1 + 1; k++) {
        var sy0 = gpos(4 * k) - SW;
        if (sy0 >= ly0 - SW && sy0 <= ly1) vy.push(sy0);
      }
      ctx.fillStyle = pave;
      for (k = 0; k < vx.length; k++) if (sgQuad(d, vx[k], ly0, vx[k] + SW, ly1)) ctx.fill();
      for (k = 0; k < vy.length; k++) if (sgQuad(d, lx0, vy[k], lx1, vy[k] + SW)) ctx.fill();
      /* down at eye level the plate is slabs, not one pour: a sparse joint
         grid, too faint to read from anywhere but the pavement */
      if (scr > 700) {
        ctx.beginPath();
        var jstep = P / 2, jt;
        for (jt = lx0 + jstep; jt < lx1; jt += jstep) sgLine(d, jt, ly0, jt, ly1);
        for (jt = ly0 + jstep; jt < ly1; jt += jstep) sgLine(d, lx0, jt, lx1, jt);
        ctx.strokeStyle = rgbas(mix(C.print, C.haze, hz), 0.11);
        ctx.lineWidth = Math.max(0.4, 0.35 * (FOC / dq));
        ctx.stroke();
      }
      /* kerb lines along both edges of each street */
      if (scr > 170) {
        ctx.beginPath();
        for (k = 0; k < vx.length; k++) {
          sgLine(d, vx[k], ly0, vx[k], ly1);
          sgLine(d, vx[k] + SW, ly0, vx[k] + SW, ly1);
        }
        for (k = 0; k < vy.length; k++) {
          sgLine(d, lx0, vy[k], lx1, vy[k]);
          sgLine(d, lx0, vy[k] + SW, lx1, vy[k] + SW);
        }
        ctx.strokeStyle = kerbC;
        ctx.lineWidth = Math.max(0.5, 0.65 * (FOC / dq));
        ctx.stroke();
      }
      /* zebra crossings at the junctions */
      if (scr > 420) {
        ctx.fillStyle = rgbas(mix(C.paper, [255, 255, 255], 0.4), 0.8);
        for (k = 0; k < vx.length; k++) for (j = 0; j < vy.length; j++) {
          var zx = vx[k], zy = vy[j], b2;
          for (b2 = 0; b2 < 4; b2++) {
            if (sgQuad(d, zx + 0.9 + b2 * (SW - 1.8) / 4, zy - 5.2,
                          zx + 0.9 + (b2 + 0.55) * (SW - 1.8) / 4, zy - 1.6)) ctx.fill();
          }
        }
      }
      /* manhole covers where the streets cross, once you are down among them */
      if (scr > 560 && vx.length && vy.length) {
        ctx.fillStyle = rgbas(mix(mix(C.print, C.ink, 0.3), C.haze, hz), 0.5);
        for (k = 0; k < vx.length; k++) for (j = 0; j < vy.length; j++) {
          var mhx = vx[k] + SW * 0.5 + ((k * 7 + j * 3) % 3 - 1) * 1.6;
          var mhy = vy[j] + SW * 0.5 + ((k * 5 + j * 11) % 3 - 1) * 1.6;
          var wxm = d.x + mhx * d.ca - mhy * d.sa, wym = d.y + mhx * d.sa + mhy * d.ca;
          if (!proj(wxm, wym, 0.1)) continue;
          var rm = 1.15 * pS;
          if (rm < 1.6) continue;
          ctx.beginPath();
          ctx.ellipse(px, py, rm, rm * Math.max(0.22, SE), 0, 0, TAU);
          ctx.fill();
        }
      }
      /* the plaza is paved and tiled, never bare */
      if (d.plaza && d.plaza.r >= 1 && scr > 90) {
        var pr = d.plaza.r;
        var px0 = gpos(-pr) - 2, px1 = gpos(pr) + P + 2;
        ctx.fillStyle = rgbas(mix(mix(C.earthHi, C.sun, 0.16), C.haze, hz), 0.34);
        if (sgQuad(d, px0, px0, px1, px1)) ctx.fill();
        if (scr > 240) {
          ctx.beginPath();
          var step = P / 2, t2;
          for (t2 = px0 + step; t2 < px1; t2 += step) {
            sgLine(d, t2, px0, t2, px1);
            sgLine(d, px0, t2, px1, t2);
          }
          ctx.strokeStyle = rgbas(mix(C.print, C.haze, hz), 0.22);
          ctx.lineWidth = Math.max(0.4, 0.4 * (FOC / dq));
          ctx.stroke();
        }
      }
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
    for (i = 0; i < highways.length; i++) {
      var hw = highways[i];
      if (hw.w < 2) continue;
      var a = hw.a, b = hw.b;
      var d = depthOf((a.x + b.x) / 2, (a.y + b.y) / 2, 0);
      if (d < 20) continue;
      var hz = hazeAt(d);
      strokeWorldLine([[a.x, a.y], [b.x, b.y]],
        3 + Math.min(hw.w, 26) * 0.6,
        rgbs(mix(mix(C.earthHi, C.sun, 0.20), C.haze, hz)),
        (0.16 + Math.min(hw.w, 30) * 0.011) * (1 - hz * 0.8));
    }
    var laneN = 0;
    for (i = 0; i < lanes.length; i++) {
      var ln = lanes[i];
      var dd = depthOf(ln.d.x, ln.d.y, 0);
      if (dd < 20) continue;
      if (ln.d.r * (FOC / dd) < 70) continue;
      if (++laneN > 240) break;
      var h2 = hazeAt(dd);
      strokeWorldLine(ln.pts, 4.4 + Math.min(ln.w, 6) * 0.9,
        rgbs(mix(mix(C.earthHi, C.sun, 0.38), C.haze, h2)), 0.42 * (1 - h2 * 0.8));
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
    ctx.fillStyle = rgbas(mix(mix(C.water, C.shadow, 0.42), C.haze, hz), 0.55);
    ctx.fill();
    ctx.fillStyle = rgbs(mix(C.water, C.haze, hz));
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    for (i = 4; i < river.pts.length; i += 5) {
      var q = river.pts[i];
      var dq = depthOf(q.x, q.y, 0);
      if (dq < 20) continue;
      var w2 = 15 + 26 * (q.t || 0);
      /* the sparkle breathes: each bend catches the sun in its own phase */
      var tw = 0.72 + 0.28 * sin(TNOW * 0.0016 + i * 1.7);
      groundSprite(SPR.glow, q.x, q.y, w2 * 1.7, 0.20 * (1 - hazeAt(dq) * 0.7));
      groundSprite(SPR.glint, q.x + sunGnd[0] * 3, q.y + sunGnd[1] * 3, w2 * 0.5,
        0.15 * tw * (1 - hazeAt(dq)));
    }
    ctx.globalCompositeOperation = 'source-over';
    /* low quay walls along both banks */
    if (river.qL && d0 < 2600) {
      var qc = rgbs(mix(mix(C.paperLo, C.sun, 0.20), C.haze, hz));
      strokeWorldLine(river.qL, 1.5, qc, 0.42 * (1 - hz));
      strokeWorldLine(river.qR, 1.5, qc, 0.42 * (1 - hz));
    }
    drawBridges();
  }

  /* two arched footbridges, where the reading order crosses its own river */
  function drawBridges() {
    if (!river.way || river.way.length < 3) return;
    var picks = [Math.floor(river.way.length * 0.30), Math.floor(river.way.length * 0.68)];
    var b, i;
    for (b = 0; b < picks.length; b++) {
      var wpt = river.way[picks[b]];
      if (!wpt) continue;
      var dq = depthOf(wpt.x, wpt.y, 0);
      if (dq < 30) continue;
      var hz2 = hazeAt(dq);
      if (hz2 > 0.8) continue;
      var wp0 = river.way[Math.max(0, picks[b] - 1)], wp1 = river.way[Math.min(river.way.length - 1, picks[b] + 1)];
      var tx = wp1.x - wp0.x, ty = wp1.y - wp0.y, tl = sqrt(tx * tx + ty * ty) || 1;
      var nx = -ty / tl, ny = tx / tl;
      var span = (13 + 27 * (wpt.t || 0)) + 13;
      if (span * (FOC / dq) < 14) continue;
      var rise = span * 0.16, SEG = 8, sxp = 0, syp = 0, ok = true;
      ctx.beginPath();
      for (i = 0; i <= SEG; i++) {
        var u = i / SEG * 2 - 1;
        if (!proj(wpt.x + nx * u * span, wpt.y + ny * u * span, 1.6 + (1 - u * u) * rise)) { ok = false; break; }
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      if (!ok) continue;
      ctx.strokeStyle = rgbs(mix(mix(C.earthHi, C.sun, 0.14), C.haze, hz2));
      ctx.lineWidth = Math.max(1.1, 2.6 * (FOC / dq));
      ctx.lineCap = 'round';
      ctx.stroke();
      /* the parapet, a thinner line lifted above the deck */
      ctx.beginPath();
      ok = true;
      for (i = 0; i <= SEG; i++) {
        var u2 = i / SEG * 2 - 1;
        if (!proj(wpt.x + nx * u2 * span, wpt.y + ny * u2 * span, 3.6 + (1 - u2 * u2) * rise)) { ok = false; break; }
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      if (!ok) continue;
      ctx.strokeStyle = rgbas(mix(C.print, C.haze, hz2), 0.7);
      ctx.lineWidth = Math.max(0.5, 0.7 * (FOC / dq));
      ctx.stroke();
    }
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
      var L = r.solidz / SHADOW_SLOPE;
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
      shX.globalAlpha = 0.58 * (1 - r.hz);
      shX.fill();
    }
    shX.globalAlpha = 1;
    ctx.globalAlpha = 0.62;
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

  /* ==================================================================
     THE BUILDINGS. Each one is a list of primitives; each primitive knows
     how it is finished. This is where the detail lives, and it is drawn in
     world space so it survives any amount of zooming in.
     ================================================================== */
  var FNL = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  var CXS = [-1, 1, 1, -1], CYS = [-1, -1, 1, 1];
  var Q8X = new Float64Array(8), Q8Y = new Float64Array(8);

  /* the working face frame */
  var Fo = { ox: 0, oy: 0, oz: 0, ux: 0, uy: 0, hz: 0, nx: 0, ny: 0, fw: 0 };
  function pf(u, w) { return proj(Fo.ox + Fo.ux * u, Fo.oy + Fo.uy * u, Fo.oz + Fo.hz * w); }
  /* a point pushed out of the face plane, for balconies, sills and awnings */
  function pfo(u, w, out) {
    return proj(Fo.ox + Fo.ux * u + Fo.nx * out, Fo.oy + Fo.uy * u + Fo.ny * out, Fo.oz + Fo.hz * w);
  }
  function fq(u0, w0, u1, w1) {
    if (!pf(u0, w0)) return; ctx.moveTo(px, py);
    if (!pf(u1, w0)) return; ctx.lineTo(px, py);
    if (!pf(u1, w1)) return; ctx.lineTo(px, py);
    if (!pf(u0, w1)) return; ctx.lineTo(px, py);
    ctx.closePath();
  }
  function fqo(u0, w0, u1, w1, out) {
    if (!pfo(u0, w0, out)) return; ctx.moveTo(px, py);
    if (!pfo(u1, w0, out)) return; ctx.lineTo(px, py);
    if (!pfo(u1, w1, out)) return; ctx.lineTo(px, py);
    if (!pfo(u0, w1, out)) return; ctx.lineTo(px, py);
    ctx.closePath();
  }
  /* an awning: a canvas sloping from the wall down to its outer rail. The
     old quad kept both edges at one height and had no area at all, so every
     awning in the city was invisible. */
  function fqa(u0, wTop, u1, wBot, out) {
    if (!pfo(u0, wTop, 0.2)) return; ctx.moveTo(px, py);
    if (!pfo(u1, wTop, 0.2)) return; ctx.lineTo(px, py);
    if (!pfo(u1, wBot, out)) return; ctx.lineTo(px, py);
    if (!pfo(u0, wBot, out)) return; ctx.lineTo(px, py);
    ctx.closePath();
  }

  function drawBuilding(r, quality) {
    var parts = r.parts, i, hz = r.hz;
    var hB = Math.round(hz / HZ_MAX * 18); if (hB > 18) hB = 18; if (hB < 0) hB = 0;
    var foot = Math.max(r.hw, r.hd);
    var scr = r.topz * (FOC / r._d);
    var maxLvl = scr > 210 ? 2 : scr > 74 ? 1 : 0;
    if (!quality && maxLvl > 1) maxLvl = 1;

    /* the ground takes the building. A big soft blit is expensive, so it is
       only worth it where the contact actually reads. */
    var fsz = foot * (FOC / r._d);
    if (fsz > 2.6 && fsz < 420) {
      groundSprite(SPR.ao, r.wx, r.wy, foot * 1.5, 0.30 * (1 - hz));
      if (fsz < 120) {
        groundSprite(SPR.shadow, r.wx - sunGnd[0] * foot * 0.5, r.wy - sunGnd[1] * foot * 0.5,
          foot * 1.15, 0.24 * (1 - hz));
      }
    }
    if (r.arch === 'garden' && fsz < 220) groundSprite(SPR.grove, r.wx, r.wy, foot * 1.25, 0.40 * (1 - hz));

    /* far to near within the building, so its own parts stack correctly */
    for (i = 0; i < parts.length; i++) parts[i]._d = depthOf(parts[i].cx, parts[i].cy, parts[i].zc);
    var ord = r._ord || (r._ord = parts.slice());
    ord.sort(function (a, b) { return b._d - a._d; });

    for (i = 0; i < ord.length; i++) {
      var p = ord[i];
      if (p.lvl > maxLvl) continue;
      if (DBG === 3 && p.k !== 'b') continue;
      NPART++;
      switch (p.k) {
        case 'b': drawBox(r, p, hB, quality, maxLvl); break;
        case 'g': drawGable(r, p, hB, quality); break;
        case 'p': drawPyr(r, p, hB, quality); break;
        case 'c': drawCyl(r, p, hB, quality); break;
        case 'd': drawDome(r, p, hB, quality); break;
        case 'm': drawStrut(r, p, hB); break;
        case 'f': drawFrame(r, p, hB, quality); break;
        case 'n': drawNet(r, p, hB); break;
        case 't': drawPlant(r, p, hz, quality); break;
      }
    }
  }

  /* --------------------------------------------------------- the box */
  function drawBox(r, b, hB, quality, maxLvl) {
    var ca = cos(b.yaw), sa = sin(b.yaw), j, k;
    var okA = true;
    for (j = 0; j < 4; j++) {
      var lx = CXS[j] * b.hw, ly = CYS[j] * b.hd;
      var wx = b.cx + lx * ca - ly * sa, wy = b.cy + lx * sa + ly * ca;
      if (!proj(wx, wy, b.z0)) { okA = false; break; }
      Q8X[j] = px; Q8Y[j] = py;
      if (!proj(wx, wy, b.z1)) { okA = false; break; }
      Q8X[j + 4] = px; Q8Y[j + 4] = py;
    }
    if (!okA) return;
    var minx = Math.min(Q8X[0], Q8X[1], Q8X[2], Q8X[3], Q8X[4], Q8X[5], Q8X[6], Q8X[7]);
    var maxx = Math.max(Q8X[0], Q8X[1], Q8X[2], Q8X[3], Q8X[4], Q8X[5], Q8X[6], Q8X[7]);
    var miny = Math.min(Q8Y[4], Q8Y[5], Q8Y[6], Q8Y[7]);
    var maxy = Math.max(Q8Y[0], Q8Y[1], Q8Y[2], Q8Y[3]);
    if (maxx < -30 || minx > W + 30 || maxy < -30 || miny > H + 30) return;
    var pxH = maxy - miny, pxW = maxx - minx;
    if (pxH < 2 || pxW < 1.6) return;
    var m = (b.m === undefined ? r.matIx : b.m), v = r.varIx;
    if (m >= 7) v = 1;
    var ex = eye[0] - b.cx, ey = eye[1] - b.cy;
    var lod = quality && pxH > 22 && pxW > 10;

    for (j = 0; j < 4; j++) {
      var nlx = FNL[j][0], nly = FNL[j][1];
      var nx = nlx * ca - nly * sa, ny = nlx * sa + nly * ca;
      var ext = (j === 0 || j === 2) ? b.hd : b.hw;
      if (nx * ex + ny * ey <= ext * 0.999) continue;
      var i0 = j, i1 = (j + 1) & 3;
      var dot = nx * sunGnd[0] + ny * sunGnd[1];
      var tB = Math.round(clamp((dot + 0.30) / 1.30, 0, 1) * 8);
      /* the frame this face's decoration is drawn in */
      var ax = b.cx + CXS[i0] * b.hw * ca - CYS[i0] * b.hd * sa;
      var ay = b.cy + CXS[i0] * b.hw * sa + CYS[i0] * b.hd * ca;
      var bx = b.cx + CXS[i1] * b.hw * ca - CYS[i1] * b.hd * sa;
      var by = b.cy + CXS[i1] * b.hw * sa + CYS[i1] * b.hd * ca;
      Fo.ox = ax; Fo.oy = ay; Fo.oz = b.z0;
      Fo.ux = bx - ax; Fo.uy = by - ay; Fo.hz = b.z1 - b.z0;
      Fo.nx = nx; Fo.ny = ny;
      Fo.fw = Math.hypot(Fo.ux, Fo.uy);
      NFILL++;
      drawFace(r, b, m, v, tB, hB, lod, j, i0, i1, dot, maxLvl);
    }
    /* the top */
    if (eye[2] > b.z1) {
      ctx.beginPath();
      ctx.moveTo(Q8X[4], Q8Y[4]); ctx.lineTo(Q8X[5], Q8Y[5]);
      ctx.lineTo(Q8X[6], Q8Y[6]); ctx.lineTo(Q8X[7], Q8Y[7]);
      ctx.closePath();
      NFILL++;
      if (lod && pxW > 24) {
        NGRAD++;
        var g = ctx.createLinearGradient(Q8X[4], Q8Y[4], Q8X[6], Q8Y[6]);
        g.addColorStop(0, roofCol(m, v, hB, 0));
        g.addColorStop(1, roofCol(m, v, hB, 1));
        ctx.fillStyle = g;
      } else ctx.fillStyle = roofCol(m, v, hB, 2);
      ctx.fill();
      if (r.hit.length < 16 && pxW > 2.2) {
        r.hit.push([Q8X[4], Q8Y[4], Q8X[5], Q8Y[5], Q8X[6], Q8Y[6], Q8X[7], Q8Y[7]]);
      }
      /* the parapet return: an inset seam on every sizeable flat top, with
         or without the quality budget, so no roof ever reads as raw fill */
      if (pxW > 26 && b.hw > 6 && (b.z1 - b.z0) > 6) {
        ctx.beginPath();
        var pw2 = 0.90;
        ctx.moveTo(Q8X[4] + (Q8X[6] - Q8X[4]) * (0.5 - pw2 / 2), Q8Y[4] + (Q8Y[6] - Q8Y[4]) * (0.5 - pw2 / 2));
        ctx.lineTo(Q8X[5] + (Q8X[7] - Q8X[5]) * (0.5 - pw2 / 2), Q8Y[5] + (Q8Y[7] - Q8Y[5]) * (0.5 - pw2 / 2));
        ctx.lineTo(Q8X[6] + (Q8X[4] - Q8X[6]) * (0.5 - pw2 / 2), Q8Y[6] + (Q8Y[4] - Q8Y[6]) * (0.5 - pw2 / 2));
        ctx.lineTo(Q8X[7] + (Q8X[5] - Q8X[7]) * (0.5 - pw2 / 2), Q8Y[7] + (Q8Y[5] - Q8Y[7]) * (0.5 - pw2 / 2));
        ctx.closePath();
        ctx.strokeStyle = roofCol(m, v, hB, 3);
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = Math.max(0.6, pxW * 0.012);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      /* a flat roof is never clean: gravel, a light well, the parapet return */
      if (lod && pxW > 30 && b.deco && b.deco !== 'plain' && b.hw > 8) {
        ctx.globalAlpha = 0.30;
        ctx.fillStyle = roofCol(m, v, hB, 3);
        ctx.beginPath();
        var iw = 0.80;
        ctx.moveTo(Q8X[4] + (Q8X[6] - Q8X[4]) * (0.5 - iw / 2), Q8Y[4] + (Q8Y[6] - Q8Y[4]) * (0.5 - iw / 2));
        ctx.lineTo(Q8X[5] + (Q8X[7] - Q8X[5]) * (0.5 - iw / 2), Q8Y[5] + (Q8Y[7] - Q8Y[5]) * (0.5 - iw / 2));
        ctx.lineTo(Q8X[6] + (Q8X[4] - Q8X[6]) * (0.5 - iw / 2), Q8Y[6] + (Q8Y[4] - Q8Y[6]) * (0.5 - iw / 2));
        ctx.lineTo(Q8X[7] + (Q8X[5] - Q8X[7]) * (0.5 - iw / 2), Q8Y[7] + (Q8Y[5] - Q8Y[7]) * (0.5 - iw / 2));
        ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  /* ------------------------------------------------------- the facade */
  function drawFace(r, b, m, v, tB, hB, lod, j, i0, i1, dot, maxLvl) {
    var ax = Q8X[i0], ay = Q8Y[i0], bx = Q8X[i1], by = Q8Y[i1];
    var cx2 = Q8X[i1 + 4], cy2 = Q8Y[i1 + 4], dx2 = Q8X[i0 + 4], dy2 = Q8Y[i0 + 4];
    var deco = b.deco || 'plain';
    var jag = b.jag && deco === 'ruin';

    ctx.beginPath();
    var jagX = null, jagY = null;
    if (jag) {
      var st = 6, s2;
      jagX = []; jagY = [];
      if (!pf(0, 0)) return; ctx.moveTo(px, py);
      if (!pf(1, 0)) return; ctx.lineTo(px, py);
      for (s2 = st; s2 >= 0; s2--) {
        var u = s2 / st;
        var wj = 0.62 + rnd01(r.h32 + j * 71, s2) * 0.38;
        if (!pf(u, wj)) return; ctx.lineTo(px, py);
        jagX.push(px); jagY.push(py);
      }
      ctx.closePath();
    } else {
      ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx2, cy2); ctx.lineTo(dx2, dy2);
      ctx.closePath();
    }
    var topMy = (cy2 + dy2) / 2, botMy = (ay + by) / 2;
    var topMx = (cx2 + dx2) / 2, botMx = (ax + bx) / 2;
    var hpx = abs(botMy - topMy), wpx = Math.hypot(bx - ax, by - ay);
    if (lod && hpx > 16) {
      var g = ctx.createLinearGradient(topMx, topMy, botMx, botMy);
      g.addColorStop(0, faceCol(m, v, tB, hB, 0));
      g.addColorStop(0.62, faceCol(m, v, tB, hB, 2));
      g.addColorStop(1, faceCol(m, v, tB, hB, b.z0 < 4 ? 6 : 1));
      ctx.fillStyle = g;
    } else ctx.fillStyle = faceCol(m, v, tB, hB, 2);
    ctx.fill();
    /* the broken lip of a ruined wall: a darker seam of snapped brick along
       the torn top, so the wall reads as masonry and not a paper cutout */
    if (jagX && jagX.length > 2 && hpx > 24) {
      ctx.beginPath();
      ctx.moveTo(jagX[0], jagY[0]);
      for (var jj2 = 1; jj2 < jagX.length; jj2++) ctx.lineTo(jagX[jj2], jagY[jj2]);
      ctx.strokeStyle = faceCol(m, v, Math.max(0, tB - 4), hB, 1);
      ctx.lineWidth = Math.max(1, hpx * 0.030);
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    if (r.hit.length < 16 && wpx > 2.2 && hpx > 2.2) r.hit.push([ax, ay, bx, by, cx2, cy2, dx2, dy2]);

    if (!lod || hpx < 12 || wpx < 6 || deco === 'plain') return;
    var fh = Fo.hz, fw = Fo.fw;
    var lite = b.lit || 0;
    var isFront = (b.front === j);

    switch (deco) {
      case 'curtain': facadeCurtain(r, b, m, v, tB, hB, fw, fh, wpx, hpx, isFront, lite, dot, maxLvl); break;
      case 'stone':   facadeStone(r, b, m, v, tB, hB, fw, fh, wpx, hpx, isFront, lite, dot, maxLvl, j); break;
      case 'slit':    facadeSlit(r, b, m, v, tB, hB, fw, fh, wpx, hpx, isFront, lite, j); break;
      case 'factory': facadeFactory(r, b, m, v, tB, hB, fw, fh, wpx, hpx, isFront, lite, maxLvl); break;
      case 'plank':   facadePlank(r, b, m, v, tB, hB, fw, fh, wpx, hpx, isFront, lite); break;
      case 'rustic':  facadeRustic(r, b, m, v, tB, hB, fw, fh, hpx); break;
      case 'brick':   facadeRustic(r, b, m, v, tB, hB, fw, fh, hpx); break;
      case 'balus':   facadeBalus(r, b, m, v, tB, hB, fw, fh, wpx); break;
      case 'belfry':  facadeBelfry(r, b, m, v, tB, hB, fw, fh, wpx, hpx); break;
      case 'ruin':    facadeRuin(r, b, m, v, tB, hB, fw, fh, wpx, hpx); break;
      case 'vent':    facadeVent(r, b, m, v, tB, hB, fw, fh, hpx); break;
      case 'notice':  facadeNotice(r, b, m, v, tB, hB, wpx, hpx); break;
      case 'flag':    facadeFlag(r, b, m, v, tB, hB); break;
    }
    if (b.clock === j && hpx > 40) drawClock(r, b, hB, fw, fh);
  }


  /* A window is a hole in a wall: the jamb the sun crosses catches light, the
     other one is in shade, and there is a head shadow under the lintel. These
     three strips are what stop a facade reading as printed squares. */
  function reveals(m, v, tB, hB, rects, dsun) {
    var i, R;
    /* shaded jamb and head */
    ctx.beginPath();
    for (i = 0; i < rects.length; i += 4) {
      var u0 = rects[i], w0 = rects[i + 1], u1 = rects[i + 2], w1 = rects[i + 3];
      var t = (u1 - u0) * 0.16, h = (w1 - w0) * 0.13;
      if (dsun >= 0) fq(u0, w0, u0 + t, w1); else fq(u1 - t, w0, u1, w1);
      fq(u0, w1 - h, u1, w1);
    }
    ctx.fillStyle = faceCol(m, v, tB, hB, 7);
    ctx.globalAlpha = 0.55; ctx.fill(); ctx.globalAlpha = 1;
    /* the sunlit jamb and the sill lip */
    ctx.beginPath();
    for (i = 0; i < rects.length; i += 4) {
      var a0 = rects[i], b0 = rects[i + 1], a1 = rects[i + 2], b1 = rects[i + 3];
      var t2 = (a1 - a0) * 0.13, h2 = (b1 - b0) * 0.10;
      if (dsun >= 0) fq(a1 - t2, b0, a1, b1); else fq(a0, b0, a0 + t2, b1);
      fq(a0, b0, a1, b0 + h2);
    }
    ctx.fillStyle = faceCol(m, v, Math.min(8, tB + 3), hB, 5);
    ctx.globalAlpha = 0.7; ctx.fill(); ctx.globalAlpha = 1;
  }
  /* glazing bars: a pane is never one sheet */
  function panes(rects, cols, rows, col) {
    var i, q;
    ctx.beginPath();
    for (i = 0; i < rects.length; i += 4) {
      var u0 = rects[i], w0 = rects[i + 1], u1 = rects[i + 2], w1 = rects[i + 3];
      for (q = 1; q < cols; q++) {
        var uu = u0 + (u1 - u0) * q / cols;
        fq(uu - (u1 - u0) * 0.014, w0, uu + (u1 - u0) * 0.014, w1);
      }
      for (q = 1; q < rows; q++) {
        var ww = w0 + (w1 - w0) * q / rows;
        fq(u0, ww - (w1 - w0) * 0.020, u1, ww + (w1 - w0) * 0.020);
      }
    }
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.7; ctx.fill(); ctx.globalAlpha = 1;
  }

  function bayCount(fw) { return clamp(Math.round(fw / 7.4), 1, 14); }
  /* every building sets its own fenestration rhythm from its hash */
  function bayJit(r, fw) { return clamp(bayCount(fw) + (((r.h32 >>> 9) % 3) - 1), 1, 14); }
  function fillRects(rects, col, alpha) {
    if (!rects.length) return;
    var i;
    ctx.beginPath();
    for (i = 0; i < rects.length; i += 4) fq(rects[i], rects[i + 1], rects[i + 2], rects[i + 3]);
    ctx.fillStyle = col;
    ctx.globalAlpha = alpha; ctx.fill(); ctx.globalAlpha = 1;
  }

  /* ground floors, one per family. Always a taller storey, always different
     from what stands on it. */
  function groundFloor(r, b, m, v, tB, hB, fw, fh, kind, isFront, hpx) {
    var g0 = 0, g1 = Math.min(GFH, fh * 0.62) / fh;
    if (g1 <= 0.02) return 0;
    var i;
    /* the shopfront band, recessed and glazed */
    if (kind === 'shop') {
      ctx.beginPath(); fq(0.04, g0 + 0.012, 0.96, g1 * 0.86); ctx.fillStyle = faceCol(m, v, tB, hB, 4); ctx.fill();
      var panes = Math.max(2, Math.round(fw / 5.2));
      ctx.beginPath();
      for (i = 0; i < panes; i++) {
        var u0 = 0.04 + (0.92) * (i + 0.10) / panes, u1 = 0.04 + (0.92) * (i + 0.90) / panes;
        fq(u0, g0 + 0.03, u1, g1 * 0.80);
      }
      ctx.fillStyle = glassCol(m, v, tB, hB, 0.30); ctx.fill();
      /* the doorway, on the side that faces the plaza */
      if (isFront) {
        ctx.beginPath(); fq(0.44, g0, 0.58, g1 * 0.94); ctx.fillStyle = faceCol(m, v, tB, hB, 7); ctx.fill();
        ctx.beginPath(); fq(0.455, g0 + 0.004, 0.565, g1 * 0.90); ctx.fillStyle = faceCol(M_WOOD, 1, tB, hB, 6); ctx.fill();
        /* the awning over it, breathing on the shared wind */
        var awTop = g1 * 0.86, awBot = awTop - 2.4 / fh;
        var awOut = 3.4 + WINDV * 0.55;
        ctx.beginPath(); fqa(0.34, awTop, 0.68, awBot, awOut);
        ctx.fillStyle = faceCol(M_AWN, 1, 6, hB, 0); ctx.fill();
        ctx.beginPath();
        for (i = 0; i < 6; i += 2) fqa(0.34 + 0.34 * i / 6, awTop, 0.34 + 0.34 * (i + 1) / 6, awBot, awOut);
        ctx.fillStyle = faceCol(M_TRIM, 1, 6, hB, 0); ctx.fill();
        /* and the fascia sign above */
        ctx.beginPath(); fq(0.10, g1 * 0.88, 0.90, g1 * 0.99);
        ctx.fillStyle = faceCol(M_DARK, 1, tB, hB, 2); ctx.fill();
      }
    } else if (kind === 'arch') {
      /* an arched doorway with a stone surround and steps */
      var mid = 0.5, hwid = Math.min(0.20, 5.5 / fw);
      ctx.beginPath(); fq(mid - hwid - 0.02, g0, mid + hwid + 0.02, g1 * 0.92);
      ctx.fillStyle = faceCol(M_TRIM, 1, tB, hB, 5); ctx.fill();
      ctx.beginPath(); fq(mid - hwid, g0, mid + hwid, g1 * 0.74);
      ctx.fillStyle = faceCol(m, v, tB, hB, 7); ctx.fill();
      ctx.beginPath();
      for (i = 0; i < 4; i++) {
        var t2 = (i + 1) / 5, sh = hwid * sqrt(1 - t2 * t2 * 0.92);
        fq(mid - sh, g1 * (0.74 + 0.18 * t2 * 0.9), mid + sh, g1 * (0.74 + 0.18 * (t2 + 0.25)));
      }
      ctx.fillStyle = faceCol(m, v, tB, hB, 7); ctx.fill();
      if (isFront) {
        ctx.beginPath(); fq(mid - hwid * 0.82, g0, mid + hwid * 0.82, g1 * 0.62);
        ctx.fillStyle = faceCol(M_WOOD, 1, tB, hB, 6); ctx.fill();
      }
      /* small windows either side */
      var nb = bayCount(fw);
      ctx.beginPath();
      for (i = 0; i < nb; i++) {
        var uc = (i + 0.5) / nb;
        if (abs(uc - mid) < hwid + 0.05) continue;
        fq(uc - 0.028, g1 * 0.30, uc + 0.028, g1 * 0.72);
      }
      ctx.fillStyle = faceCol(m, v, tB, hB, 4); ctx.fill();
    } else if (kind === 'load') {
      /* a loading door big enough for a cart, with a lintel and a sign */
      var lw = Math.min(0.42, 12 / fw);
      ctx.beginPath(); fq(0.5 - lw, g0, 0.5 + lw, g1 * 0.80);
      ctx.fillStyle = faceCol(m, v, tB, hB, 7); ctx.fill();
      ctx.beginPath();
      for (i = 0; i < 4; i++) {
        var t3 = (i + 1) / 5, sh2 = lw * sqrt(1 - t3 * t3 * 0.92);
        fq(0.5 - sh2, g1 * (0.80 + 0.16 * t3 * 0.9), 0.5 + sh2, g1 * (0.80 + 0.16 * (t3 + 0.25)));
      }
      ctx.fillStyle = faceCol(m, v, tB, hB, 7); ctx.fill();
      ctx.beginPath();
      for (i = 0; i < 7; i++) fq(0.5 - lw + 2 * lw * i / 7 + 0.004, g0, 0.5 - lw + 2 * lw * (i + 0.55) / 7, g1 * 0.78);
      ctx.fillStyle = faceCol(M_WOOD, 1, tB, hB, 6); ctx.fill();
      if (isFront) {
        ctx.beginPath(); fq(0.08, g1 * 0.86, 0.92, g1 * 0.99);
        ctx.fillStyle = faceCol(M_TRIM, 1, tB, hB, 2); ctx.fill();
        ctx.beginPath(); fqa(0.05, g1 * 0.80, 0.30, g1 * 0.80 - 2.0 / fh, 3.0 + WINDV * 0.45);
        ctx.fillStyle = faceCol(M_AWN, 1, 6, hB, 0); ctx.fill();
      }
    } else if (kind === 'hoard') {
      /* a site hoarding with posters pasted on it */
      ctx.beginPath(); fqo(0, 0, 1, g1 * 0.72, 1.6);
      ctx.fillStyle = faceCol(M_WOOD, 1, tB, hB, 2); ctx.fill();
      ctx.beginPath();
      var pn = Math.max(2, Math.round(fw / 8));
      for (i = 0; i < pn; i++) {
        if (rnd01(r.h32, i + 60) < 0.45) continue;
        fqo((i + 0.16) / pn, g1 * 0.16, (i + 0.84) / pn, g1 * 0.56, 1.75);
      }
      ctx.fillStyle = faceCol(M_AWN, 1, 6, hB, 2); ctx.fill();
    } else if (kind === 'door') {
      ctx.beginPath(); fq(0.40, g0, 0.60, g1 * 0.86);
      ctx.fillStyle = faceCol(M_WOOD, 1, tB, hB, 6); ctx.fill();
      ctx.beginPath(); fq(0.42, g0 + 0.02, 0.58, g1 * 0.82);
      ctx.fillStyle = faceCol(M_WOOD, 1, tB, hB, 3); ctx.fill();
      if (isFront) {
        ctx.beginPath(); fqo(0.30, g1 * 0.88, 0.70, g1 * 0.88, 2.6);
        ctx.fillStyle = faceCol(M_DARK, 1, 6, hB, 0); ctx.fill();
      }
    }
    /* the step, running the width of the frontage */
    ctx.beginPath(); fqo(0.02, 0.0, 0.98, 0.008, 1.5);
    ctx.fillStyle = faceCol(M_TRIM, 1, tB, hB, 5); ctx.fill();
    return g1;
  }

  function glassCol(m, v, tB, hB, k) {
    /* the only blue-grey anywhere: it is actual glass, and it is holding a
       reflection of a peach sky, so it never goes navy */
    var key = 700000 + (tB * 19 + hB);
    var s = palCache[key];
    if (s !== undefined) return s;
    var g = mix(hx('#93A9B8'), C.skyLo, 0.30 + 0.26 * (tB / 8));
    g = lit(g, 0.84 + 0.30 * (tB / 8));
    g = mix(g, C.haze, (hB / 18) * HZ_MAX);
    s = rgbs(g); palCache[key] = s; return s;
  }

  /* modern block: shopfront, spandrels, ribbon glazing, balconies */
  function facadeCurtain(r, b, m, v, tB, hB, fw, fh, wpx, hpx, isFront, lite, dot, maxLvl) {
    var g1 = b.gf ? groundFloor(r, b, m, v, tB, hB, fw, fh, b.gf, isFront, hpx) : 0;
    var nf = Math.max(1, Math.round((fh - g1 * fh) / STOREY));
    if (nf > 40) nf = 40;
    var bays = bayJit(r, fw), i, k;
    var fs = (1 - g1) / nf, flr = fs * hpx;
    if (flr < 5) return;

    /* the spandrel band at every floor line */
    ctx.beginPath();
    for (k = 0; k < nf; k++) fq(0.02, g1 + k * fs, 0.98, g1 + k * fs + fs * 0.30);
    ctx.fillStyle = faceCol(m, v, tB, hB, 6); ctx.fill();

    /* the openings, cut back into the wall */
    var op = [];
    for (k = 0; k < nf; k++) for (i = 0; i < bays; i++) {
      op.push((i + 0.12) / bays, g1 + k * fs + fs * 0.34, (i + 0.88) / bays, g1 + (k + 1) * fs - fs * 0.06);
    }
    ctx.beginPath();
    for (i = 0; i < op.length; i += 4) fq(op[i], op[i + 1], op[i + 2], op[i + 3]);
    ctx.fillStyle = faceCol(m, v, tB, hB, 4); ctx.fill();
    if (flr >= 15 && op.length <= 220) reveals(m, v, tB, hB, op, dot);

    /* every pane carries a state: a fifth or so warm-lit at this hour, some
       dark, the rest holding the peach sky — and on the sun side a scatter
       of them flash the low sun straight back */
    var liteEff = Math.max(lite, 0.10);
    var wl = [], dl = [], sl = [], gl2 = [];
    for (k = 0; k < nf; k++) for (i = 0; i < bays; i++) {
      var u0 = (i + 0.17) / bays, u1 = (i + 0.83) / bays;
      var w0 = g1 + k * fs + fs * 0.38, w1 = g1 + (k + 1) * fs - fs * 0.10;
      var q = rnd01(r.h32 + k * 131, i + 11);
      if (q < liteEff && dot < 0.55) wl.push(u0, w0, u1, w1);
      else if (q < liteEff + 0.15) dl.push(u0, w0, u1, w1);
      else {
        sl.push(u0, w0, u1, w1);
        if (dot > 0.30 && rnd01(r.h32 + k * 29, i + 41) < 0.22) gl2.push(u0, w0, u1, w1);
      }
    }
    fillRects(sl, glassCol(m, v, tB, hB, 0.3), 0.94);
    fillRects(dl, darkGlassCol(hB), 0.92);
    fillRects(wl, litCol(hB), 0.88);
    fillRects(gl2, glintPaneCol(hB), 0.55);
    if (flr >= 28 && sl.length <= 140) panes(sl, 2, 2, faceCol(m, v, tB, hB, 5));

    /* a projecting sill under every opening, and a lintel bar, up close */
    if (maxLvl >= 2 && flr >= 16 && op.length <= 180) {
      ctx.beginPath();
      for (k = 0; k < nf; k++) for (i = 0; i < bays; i++) {
        fqo((i + 0.10) / bays, g1 + k * fs + fs * 0.335, (i + 0.90) / bays, g1 + k * fs + fs * 0.375, 0.8);
      }
      ctx.fillStyle = faceCol(M_TRIM, 1, tB, hB, 5); ctx.fill();
      ctx.beginPath();
      for (k = 0; k < nf; k++) fq(0.02, g1 + (k + 1) * fs - fs * 0.075, 0.98, g1 + (k + 1) * fs - fs * 0.045);
      ctx.fillStyle = faceCol(m, v, tB, hB, 5);
      ctx.globalAlpha = 0.6; ctx.fill(); ctx.globalAlpha = 1;
    }

    if (wl.length > 20 && hpx > 40) {
      bloom.push([(Q8X[0] + Q8X[6]) / 2, (Q8Y[0] + Q8Y[6]) / 2,
        Math.min(wpx, hpx) * 0.5, 0.14 * (1 - r.hz)]);
    }

    /* mullions */
    if (maxLvl >= 2 && wpx > 60) {
      ctx.beginPath();
      for (i = 1; i < bays; i++) fq(i / bays - 0.004, g1, i / bays + 0.004, 1);
      ctx.fillStyle = faceCol(m, v, tB, hB, 5); ctx.fill();
    }

    /* balconies, on alternate floors, with real railings */
    if (b.bal && maxLvl >= 2 && hpx > 90) {
      var out = 2.6;
      for (k = 1; k < nf; k += 2) {
        for (i = 0; i < bays; i++) {
          if (rnd01(r.h32 + k * 53, i + 3) > 0.42) continue;
          var u0 = (i + 0.06) / bays, u1 = (i + 0.94) / bays;
          var wz = g1 + k * fs + fs * 0.32;
          ctx.beginPath(); fqo(u0, wz, u1, wz, out);
          ctx.fillStyle = faceCol(M_TRIM, 1, tB, hB, 0); ctx.fill();
          ctx.beginPath(); fqo(u0, wz, u1, wz + fs * 0.30, out);
          ctx.fillStyle = faceCol(M_STEEL, 1, tB, hB, 2);
          ctx.globalAlpha = 0.55; ctx.fill(); ctx.globalAlpha = 1;
          ctx.beginPath(); fqo(u0, wz + fs * 0.28, u1, wz + fs * 0.32, out);
          ctx.fillStyle = faceCol(M_STEEL, 1, tB, hB, 5); ctx.fill();
        }
      }
    }
  }

  /* stone: sills, lintels, string courses, quoins, shutters */
  function facadeStone(r, b, m, v, tB, hB, fw, fh, wpx, hpx, isFront, lite, dot, maxLvl, j) {
    var g1 = b.gf ? groundFloor(r, b, m, v, tB, hB, fw, fh, b.gf, isFront, hpx) : 0;
    var nf = Math.max(1, b.floors || Math.round((fh - g1 * fh) / STOREY));
    if (nf > 30) nf = 30;
    var bays = bayJit(r, fw), i, k;
    var fs = (1 - g1) / nf, flr = fs * hpx;
    if (flr < 5) return;
    var wq = Math.min(0.40 / bays, 0.06);

    /* the openings, cut back into the wall */
    var op = [];
    for (k = 0; k < nf; k++) for (i = 0; i < bays; i++) {
      op.push((i + 0.28) / bays, g1 + k * fs + fs * 0.22, (i + 0.72) / bays, g1 + (k + 1) * fs - fs * 0.22);
    }
    ctx.beginPath();
    for (i = 0; i < op.length; i += 4) fq(op[i], op[i + 1], op[i + 2], op[i + 3]);
    ctx.fillStyle = faceCol(m, v, tB, hB, 4); ctx.fill();
    if (flr >= 15 && op.length <= 220) reveals(m, v, tB, hB, op, dot);

    /* the glass inside them, each pane in its own state: warm-lit, dark,
       or holding the sky, with a sun-side glint on a few */
    var liteEff = Math.max(lite, 0.10);
    var wl = [], dl = [], gl = [], gl2 = [];
    for (k = 0; k < nf; k++) for (i = 0; i < bays; i++) {
      var u0 = (i + 0.31) / bays, u1 = (i + 0.69) / bays;
      var w0 = g1 + k * fs + fs * 0.25, w1 = g1 + (k + 1) * fs - fs * 0.25;
      var q = rnd01(r.h32 + k * 97, i + 13);
      if (q < liteEff && dot < 0.55) wl.push(u0, w0, u1, w1);
      else if (q < liteEff + 0.15) dl.push(u0, w0, u1, w1);
      else {
        gl.push(u0, w0, u1, w1);
        if (dot > 0.30 && rnd01(r.h32 + k * 23, i + 47) < 0.20) gl2.push(u0, w0, u1, w1);
      }
    }
    fillRects(gl, glassCol(m, v, tB, hB, 0), 1);
    fillRects(dl, darkGlassCol(hB), 0.9);
    fillRects(wl, litCol(hB), 0.85);
    fillRects(gl2, glintPaneCol(hB), 0.5);
    if (flr >= 30 && gl.length <= 140) panes(gl, 2, 3, faceCol(m, v, tB, hB, 5));
    if (wl.length > 12 && hpx > 50) {
      bloom.push([(Q8X[0] + Q8X[6]) / 2, (Q8Y[0] + Q8Y[6]) / 2,
        Math.min(wpx, hpx) * 0.45, 0.10 * (1 - r.hz)]);
    }

    /* sills below and lintels above, cut from the pale trim stone */
    ctx.beginPath();
    for (k = 0; k < nf; k++) for (i = 0; i < bays; i++) {
      fqo((i + 0.22) / bays, g1 + k * fs + fs * 0.18, (i + 0.78) / bays, g1 + k * fs + fs * 0.235, 0.9);
      fq((i + 0.24) / bays, g1 + (k + 1) * fs - fs * 0.245, (i + 0.76) / bays, g1 + (k + 1) * fs - fs * 0.185);
    }
    ctx.fillStyle = faceCol(M_TRIM, 1, tB, hB, 5); ctx.fill();

    /* shutters, folded back against the wall */
    if (b.shut && maxLvl >= 2 && wpx > 52 && flr >= 12) {
      ctx.beginPath();
      for (k = 0; k < nf; k++) for (i = 0; i < bays; i++) {
        if (rnd01(r.h32 + k * 41, i + 21) > 0.55) continue;
        fqo((i + 0.16) / bays, g1 + k * fs + fs * 0.24, (i + 0.27) / bays, g1 + (k + 1) * fs - fs * 0.24, 0.5);
        fqo((i + 0.73) / bays, g1 + k * fs + fs * 0.24, (i + 0.84) / bays, g1 + (k + 1) * fs - fs * 0.24, 0.5);
      }
      ctx.fillStyle = faceCol(M_SHUT, 1, tB, hB, 2); ctx.fill();
    }

    /* the string course between floors */
    if (b.course) {
      ctx.beginPath();
      for (k = 1; k < nf; k++) fqo(0, g1 + k * fs - fs * 0.055, 1, g1 + k * fs - fs * 0.005, 0.8);
      ctx.fillStyle = faceCol(M_TRIM, 1, tB, hB, 0); ctx.fill();
    }

    /* corner quoins, alternating long and short */
    if (b.quoin && maxLvl >= 1 && hpx > 70) {
      ctx.beginPath();
      var nq = clamp(Math.round(fh / 5.2), 3, 28);
      for (k = 0; k < nq; k++) {
        var w0 = k / nq, w1 = (k + 0.94) / nq;
        var ww = (k % 2) ? wq * 0.62 : wq;
        fqo(0, w0, ww, w1, 0.55);
        fqo(1 - ww, w0, 1, w1, 0.55);
      }
      ctx.fillStyle = faceCol(M_TRIM, 1, tB, hB, 5); ctx.fill();
    }

    /* balconies with a stone balustrade on the piano nobile */
    if (b.bal && maxLvl >= 2 && hpx > 80) {
      var kb = 0;
      for (i = 0; i < bays; i++) {
        if (rnd01(r.h32, i + 77) > 0.45) continue;
        var u0 = (i + 0.10) / bays, u1 = (i + 0.90) / bays;
        var wz = g1 + fs * 0.16;
        ctx.beginPath(); fqo(u0, wz, u1, wz, 2.4);
        ctx.fillStyle = faceCol(M_TRIM, 1, tB, hB, 0); ctx.fill();
        ctx.beginPath();
        var pn = 6, q;
        for (q = 0; q < pn; q++) fqo(u0 + (u1 - u0) * (q + 0.25) / pn, wz, u0 + (u1 - u0) * (q + 0.75) / pn, wz + fs * 0.20, 2.4);
        ctx.fillStyle = faceCol(M_TRIM, 1, tB, hB, 2); ctx.fill();
        ctx.beginPath(); fqo(u0, wz + fs * 0.19, u1, wz + fs * 0.23, 2.4);
        ctx.fillStyle = faceCol(M_TRIM, 1, tB, hB, 5); ctx.fill();
        if (++kb > 3) break;
      }
    }
  }

  /* the campanile shaft: tall slit openings, and a clock near the top */
  function facadeSlit(r, b, m, v, tB, hB, fw, fh, wpx, hpx, isFront, lite, j) {
    var g1 = b.gf ? groundFloor(r, b, m, v, tB, hB, fw, fh, b.gf, isFront, hpx) : 0;
    var nf = Math.max(2, b.floors || 5), k;
    var fs = (1 - g1) / nf;
    ctx.beginPath();
    for (k = 0; k < nf; k++) {
      fq(0.42, g1 + k * fs + fs * 0.24, 0.58, g1 + (k + 1) * fs - fs * 0.30);
    }
    ctx.fillStyle = faceCol(m, v, tB, hB, 7); ctx.fill();
    ctx.beginPath();
    for (k = 0; k < nf; k++) fqo(0.38, g1 + k * fs + fs * 0.20, 0.62, g1 + k * fs + fs * 0.25, 0.8);
    ctx.fillStyle = faceCol(M_TRIM, 1, tB, hB, 5); ctx.fill();
    if (b.quoin && hpx > 40) {
      var nq = clamp(Math.round(fh / 5.6), 4, 30), wq = Math.min(0.10, 3 / fw);
      ctx.beginPath();
      for (k = 0; k < nq; k++) {
        var w0 = k / nq, w1 = (k + 0.94) / nq;
        var ww = (k % 2) ? wq * 0.6 : wq;
        fqo(0, w0, ww, w1, 0.5); fqo(1 - ww, w0, 1, w1, 0.5);
      }
      ctx.fillStyle = faceCol(M_TRIM, 1, tB, hB, 0); ctx.fill();
    }
  }

  function drawClock(r, b, hB, fw, fh) {
    var cu = 0.5, cw = Math.min(0.34, 6.4 / fw), cz = 0.845;
    var ch = cw * fw / fh;
    ctx.beginPath(); fqo(cu - cw, cz - ch, cu + cw, cz + ch, 0.7);
    ctx.fillStyle = faceCol(M_TRIM, 1, 7, hB, 5); ctx.fill();
    if (!pfo(cu, cz, 0.9)) return;
    var mx = px, my = py;
    if (!pfo(cu + cw * 0.72, cz, 0.9)) return;
    var rr = Math.hypot(px - mx, py - my);
    if (rr < 2.2) return;
    ctx.beginPath(); ctx.arc(mx, my, rr, 0, TAU);
    ctx.fillStyle = rgbs(mix(C.paper, C.haze, (hB / 18) * HZ_MAX)); ctx.fill();
    ctx.strokeStyle = rgbas(C.ink, 0.55); ctx.lineWidth = Math.max(0.6, rr * 0.09); ctx.stroke();
    if (rr > 5) {
      var i;
      ctx.beginPath();
      for (i = 0; i < 12; i++) {
        var a = i / 12 * TAU;
        ctx.moveTo(mx + cos(a) * rr * 0.78, my + sin(a) * rr * 0.78);
        ctx.lineTo(mx + cos(a) * rr * 0.94, my + sin(a) * rr * 0.94);
      }
      ctx.lineWidth = Math.max(0.5, rr * 0.06); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mx, my); ctx.lineTo(mx + cos(-1.05) * rr * 0.52, my + sin(-1.05) * rr * 0.52);
      ctx.moveTo(mx, my); ctx.lineTo(mx + cos(1.9) * rr * 0.78, my + sin(1.9) * rr * 0.78);
      ctx.lineWidth = Math.max(0.7, rr * 0.10);
      ctx.strokeStyle = rgbas(C.ink, 0.8); ctx.stroke();
    }
  }

  /* brick industrial: pilasters between bays, tall multi-pane glazing */
  function facadeFactory(r, b, m, v, tB, hB, fw, fh, wpx, hpx, isFront, lite, maxLvl) {
    var g1 = b.gf ? groundFloor(r, b, m, v, tB, hB, fw, fh, b.gf, isFront, hpx) : 0;
    var nf = Math.max(1, b.floors || 1), i, k, q;
    var fs = (1 - g1) / nf, flr = fs * hpx;
    if (flr < 6) return;
    var bays = clamp(Math.round(fw / 9.5), 1, 10);

    /* the openings */
    ctx.beginPath();
    for (k = 0; k < nf; k++) for (i = 0; i < bays; i++) {
      fq((i + 0.20) / bays, g1 + k * fs + fs * 0.14, (i + 0.80) / bays, g1 + (k + 1) * fs - fs * 0.30);
      var t2, u0 = (i + 0.20) / bays, u1 = (i + 0.80) / bays, uc = (u0 + u1) / 2, hwd = (u1 - u0) / 2;
      for (t2 = 0; t2 < 4; t2++) {
        var tt = (t2 + 1) / 5, sh = hwd * sqrt(1 - tt * tt * 0.9);
        fq(uc - sh, g1 + (k + 1) * fs - fs * (0.30 - 0.16 * tt * 0.9),
           uc + sh, g1 + (k + 1) * fs - fs * (0.30 - 0.16 * (tt + 0.25)));
      }
    }
    ctx.fillStyle = faceCol(m, v, tB, hB, 4); ctx.fill();

    /* the glazing, in small panes; a few whole bays stand dark, and the
       sun-facing ones flash back at this hour */
    var pr = 5, pc = 3, skyG = [], drkG = [];
    for (k = 0; k < nf; k++) for (i = 0; i < bays; i++) {
      var a0 = (i + 0.23) / bays, a1 = (i + 0.77) / bays;
      var b0 = g1 + k * fs + fs * 0.17, b1 = g1 + (k + 1) * fs - fs * 0.32;
      var bucket = rnd01(r.h32 + k * 61, i + 131) < 0.15 ? drkG : skyG;
      for (q = 0; q < pc; q++) for (var s = 0; s < pr; s++) {
        bucket.push(a0 + (a1 - a0) * (q + 0.08) / pc, b0 + (b1 - b0) * (s + 0.08) / pr,
           a0 + (a1 - a0) * (q + 0.92) / pc, b0 + (b1 - b0) * (s + 0.92) / pr);
      }
    }
    fillRects(skyG, glassCol(m, v, tB, hB, 0), 1);
    fillRects(drkG, darkGlassCol(hB), 0.9);

    var lite2 = Math.max(lite, 0.08);
    if (lite2 > 0.001) {
      var n2 = 0;
      ctx.fillStyle = litCol(hB);
      for (k = 0; k < nf; k++) for (i = 0; i < bays; i++) {
        if (rnd01(r.h32 + k * 61, i + 31) > lite2) continue;
        var c0 = (i + 0.23) / bays, c1 = (i + 0.77) / bays;
        var d0 = g1 + k * fs + fs * 0.17, d1 = g1 + (k + 1) * fs - fs * 0.32;
        ctx.beginPath();
        for (q = 0; q < pc; q++) for (var s2 = 0; s2 < pr; s2++) {
          if (rnd01(r.h32 + k * 13 + i, q * 7 + s2) > 0.7) continue;
          fq(c0 + (c1 - c0) * (q + 0.08) / pc, d0 + (d1 - d0) * (s2 + 0.08) / pr,
             c0 + (c1 - c0) * (q + 0.92) / pc, d0 + (d1 - d0) * (s2 + 0.92) / pr);
        }
        ctx.globalAlpha = 0.55 + rnd01(r.h32 + k, i) * 0.45;
        ctx.fill();
        if (++n2 > 40) break;
      }
      ctx.globalAlpha = 1;
    }

    /* brick pilasters standing proud between the bays */
    ctx.beginPath();
    for (i = 0; i <= bays; i++) {
      var uu = i / bays, hwp = Math.min(0.055, 1.9 / fw);
      fqo(clamp(uu - hwp, 0, 1), g1 * 0.2, clamp(uu + hwp, 0, 1), 1, 0.9);
    }
    ctx.fillStyle = faceCol(m, v, tB, hB, 5); ctx.fill();
    /* the sill course under the glazing */
    ctx.beginPath();
    for (k = 0; k < nf; k++) fqo(0, g1 + k * fs + fs * 0.09, 1, g1 + k * fs + fs * 0.14, 0.7);
    ctx.fillStyle = faceCol(M_TRIM, 1, tB, hB, 0); ctx.fill();
    /* brick courses, once you are close enough for them to be bricks */
    if (maxLvl >= 2 && hpx > 220) {
      ctx.beginPath();
      var nc = clamp(Math.round(fh / 2.6), 4, 80);
      for (k = 1; k < nc; k++) fq(0, k / nc, 1, k / nc + 0.0012);
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = faceCol(m, v, tB, hB, 3); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function facadePlank(r, b, m, v, tB, hB, fw, fh, wpx, hpx, isFront, lite) {
    var g1 = b.gf ? groundFloor(r, b, m, v, tB, hB, fw, fh, b.gf, isFront, hpx) : 0;
    var n = clamp(Math.round(fw / 2.2), 3, 26), i;
    ctx.beginPath();
    for (i = 1; i < n; i++) fq(i / n - 0.004, 0, i / n + 0.004, 1);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = faceCol(m, v, tB, hB, 3); ctx.fill();
    ctx.globalAlpha = 1;
    if (!isFront) {
      ctx.beginPath(); fq(0.58, 0.34, 0.80, 0.70);
      ctx.fillStyle = faceCol(m, v, tB, hB, 4); ctx.fill();
      ctx.beginPath(); fq(0.60, 0.36, 0.78, 0.68);
      ctx.fillStyle = lite > 0.02 ? litCol(hB) : glassCol(m, v, tB, hB, 0);
      ctx.fill();
      ctx.beginPath(); fq(0.685, 0.36, 0.695, 0.68); fq(0.60, 0.51, 0.78, 0.52);
      ctx.fillStyle = faceCol(M_SHUT, 1, tB, hB, 2); ctx.fill();
    }
    ctx.beginPath(); fqo(0, 0.97, 1, 1.0, 0.9);
    ctx.fillStyle = faceCol(M_TRIM, 1, tB, hB, 5); ctx.fill();
  }

  function facadeRustic(r, b, m, v, tB, hB, fw, fh, hpx) {
    var n = clamp(Math.round(fh / 3.0), 2, 24), i;
    if (hpx / n < 2.4) return;
    ctx.beginPath();
    for (i = 1; i < n; i++) fq(0, i / n - 0.008, 1, i / n + 0.008);
    ctx.globalAlpha = 0.34;
    ctx.fillStyle = faceCol(m, v, tB, hB, 3); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    for (i = 1; i < n; i++) fq(0, i / n - 0.024, 1, i / n - 0.008);
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = faceCol(m, v, tB, hB, 5); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function facadeBalus(r, b, m, v, tB, hB, fw, fh, wpx) {
    var n = clamp(Math.round(fw / 2.3), 3, 30), i;
    ctx.beginPath();
    for (i = 0; i < n; i++) fq((i + 0.26) / n, 0.10, (i + 0.74) / n, 0.80);
    ctx.fillStyle = faceCol(m, v, tB, hB, 5); ctx.fill();
    ctx.beginPath(); fq(0, 0, 1, 0.12); fq(0, 0.78, 1, 1);
    ctx.fillStyle = faceCol(m, v, tB, hB, 0); ctx.fill();
    ctx.beginPath();
    for (i = 0; i < n; i++) fq((i + 0.78) / n, 0.12, (i + 1.22) / n, 0.78);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = faceCol(m, v, tB, hB, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function facadeBelfry(r, b, m, v, tB, hB, fw, fh, wpx, hpx) {
    var n = 2, i;
    ctx.beginPath();
    for (i = 0; i < n; i++) {
      var u0 = (i + 0.16) / n, u1 = (i + 0.84) / n, uc = (u0 + u1) / 2, hwd = (u1 - u0) / 2;
      fq(u0, 0.06, u1, 0.62);
      var t2;
      for (t2 = 0; t2 < 4; t2++) {
        var tt = (t2 + 1) / 5, sh = hwd * sqrt(1 - tt * tt * 0.9);
        fq(uc - sh, 0.62 + 0.26 * tt * 0.9, uc + sh, 0.62 + 0.26 * (tt + 0.25));
      }
    }
    ctx.fillStyle = faceCol(m, v, tB, hB, 7); ctx.fill();
    /* the bell, hanging in the near opening */
    if (hpx > 34) {
      ctx.beginPath(); fq(0.20, 0.40, 0.30, 0.58);
      ctx.fillStyle = faceCol(M_COPPER, 1, tB, hB, 0); ctx.fill();
    }
    ctx.beginPath(); fqo(0, 0.90, 1, 1, 0.6);
    ctx.fillStyle = faceCol(m, v, tB, hB, 5); ctx.fill();
  }

  function facadeRuin(r, b, m, v, tB, hB, fw, fh, wpx, hpx) {
    var i, n = clamp(Math.round(fw / 8), 1, 4);
    ctx.beginPath();
    for (i = 0; i < n; i++) {
      if (rnd01(r.h32, i + 90) < 0.35) continue;
      fq((i + 0.28) / n, 0.22, (i + 0.68) / n, 0.58);
    }
    ctx.fillStyle = faceCol(m, v, tB, hB, 7); ctx.fill();
    ctx.beginPath();
    for (i = 0; i < 5; i++) {
      var w0 = 0.12 + i * 0.16;
      fq(0, w0, 1, w0 + 0.006);
    }
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = faceCol(m, v, tB, hB, 3); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function facadeVent(r, b, m, v, tB, hB, fw, fh, hpx) {
    var n = clamp(Math.round(fh / 1.3), 2, 10), i;
    ctx.beginPath();
    for (i = 0; i < n; i++) fq(0.08, (i + 0.2) / n, 0.92, (i + 0.7) / n);
    ctx.fillStyle = faceCol(m, v, tB, hB, 3); ctx.fill();
  }

  function facadeNotice(r, b, m, v, tB, hB, wpx, hpx) {
    ctx.beginPath(); fq(0.08, 0.12, 0.92, 0.88);
    ctx.fillStyle = rgbs(mix(C.paper, C.haze, (hB / 18) * HZ_MAX)); ctx.fill();
    if (hpx < 12) return;
    var i;
    ctx.beginPath();
    for (i = 0; i < 4; i++) fq(0.16, 0.24 + i * 0.16, 0.84 - (i === 3 ? 0.3 : 0), 0.28 + i * 0.16);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = rgbs(C.print); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function facadeFlag(r, b, m, v, tB, hB) {
    ctx.beginPath(); fq(0, 0.36, 1, 0.68);
    ctx.fillStyle = faceCol(M_TRIM, 1, 8, hB, 5); ctx.fill();
  }

  /* --------------------------------------------------- pitched roofs */
  function drawGable(r, g, hB, quality) {
    var ca = cos(g.yaw), sa = sin(g.yaw);
    var hw = g.hw, hd = g.hd, z0 = g.z0 + (g.ze || 0), zr = g.z0 + g.zr;
    var m = g.m === undefined ? M_TILE : g.m, v = r.varIx;
    if (m === M_TILE) m = M_TILES[r.h32 % 3];
    var ax = g.gax;
    var pts = [], i;
    var L = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
    for (i = 0; i < 4; i++) {
      var wx = g.cx + L[i][0] * ca - L[i][1] * sa, wy = g.cy + L[i][0] * sa + L[i][1] * ca;
      if (!proj(wx, wy, z0)) return;
      pts.push([px, py]);
    }
    /* the ridge */
    var r0, r1;
    if (ax === 0) { r0 = [-hw, 0]; r1 = [hw, 0]; } else { r0 = [0, -hd]; r1 = [0, hd]; }
    var rw0 = g.cx + r0[0] * ca - r0[1] * sa, rw1 = g.cy + r0[0] * sa + r0[1] * ca;
    if (!proj(rw0, rw1, zr)) return; var R0 = [px, py];
    var rw2 = g.cx + r1[0] * ca - r1[1] * sa, rw3 = g.cy + r1[0] * sa + r1[1] * ca;
    if (!proj(rw2, rw3, zr)) return; var R1 = [px, py];

    var slopes, gables;
    if (ax === 0) {
      slopes = [[0, 1, R1, R0], [2, 3, R0, R1]];
      gables = [[1, 2, R1], [3, 0, R0]];
    } else {
      slopes = [[1, 2, R1, R0], [3, 0, R0, R1]];
      gables = [[0, 1, R0], [2, 3, R1]];
    }
    var eyeL = [(eye[0] - g.cx) * ca + (eye[1] - g.cy) * sa, -(eye[0] - g.cx) * sa + (eye[1] - g.cy) * ca];
    var s, k;
    for (s = 0; s < 2; s++) {
      var sl = slopes[s];
      var a = pts[sl[0]], b = pts[sl[1]];
      /* which way this slope faces on the ground */
      var mid0 = [(L[sl[0]][0] + L[sl[1]][0]) / 2, (L[sl[0]][1] + L[sl[1]][1]) / 2];
      var nl = ax === 0 ? [0, mid0[1] > 0 ? 1 : -1] : [mid0[0] > 0 ? 1 : -1, 0];
      var nw = [nl[0] * ca - nl[1] * sa, nl[0] * sa + nl[1] * ca];
      var facing = nl[0] * eyeL[0] + nl[1] * eyeL[1] > 0;
      var above = eye[2] > (z0 + zr) / 2;
      if (!facing && !above) continue;
      var dot = nw[0] * sunGnd[0] + nw[1] * sunGnd[1];
      var tB = Math.round(clamp((dot * 0.55 + 0.62), 0, 1) * 8);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
      ctx.lineTo(sl[2][0], sl[2][1]); ctx.lineTo(sl[3][0], sl[3][1]);
      ctx.closePath();
      var wpx = Math.hypot(b[0] - a[0], b[1] - a[1]);
      var hpx = Math.hypot(sl[3][0] - a[0], sl[3][1] - a[1]);
      if (quality && wpx > 22) {
        var lg = ctx.createLinearGradient(a[0], a[1], sl[3][0], sl[3][1]);
        lg.addColorStop(0, faceCol(m, v, tB, hB, 1));
        lg.addColorStop(1, faceCol(m, v, tB, hB, 0));
        ctx.fillStyle = lg;
      } else ctx.fillStyle = faceCol(m, v, tB, hB, 2);
      ctx.fill();
      if (r.hit.length < 16 && wpx > 3) r.hit.push([a[0], a[1], b[0], b[1], sl[2][0], sl[2][1], sl[3][0], sl[3][1]]);
      /* the pantile courses, running with the eaves */
      if (quality && hpx > 12 && wpx > 26) {
        var nc = clamp(Math.round(hpx / 5), 2, 14);
        ctx.beginPath();
        for (k = 1; k < nc; k++) {
          var t = k / nc;
          ctx.moveTo(a[0] + (sl[3][0] - a[0]) * t, a[1] + (sl[3][1] - a[1]) * t);
          ctx.lineTo(b[0] + (sl[2][0] - b[0]) * t, b[1] + (sl[2][1] - b[1]) * t);
        }
        ctx.strokeStyle = rgbas(mix(C.shadow, C.haze, hB / 18), 0.22);
        ctx.lineWidth = Math.max(0.6, hpx / nc * 0.18);
        ctx.stroke();
      }
    }
    /* the gable ends */
    for (s = 0; s < 2; s++) {
      var ge = gables[s];
      var A = pts[ge[0]], Bp = pts[ge[1]], Ap = ge[2];
      var mid1 = [(L[ge[0]][0] + L[ge[1]][0]) / 2, (L[ge[0]][1] + L[ge[1]][1]) / 2];
      var nl2 = ax === 0 ? [mid1[0] > 0 ? 1 : -1, 0] : [0, mid1[1] > 0 ? 1 : -1];
      if (nl2[0] * eyeL[0] + nl2[1] * eyeL[1] <= 0) continue;
      var nw2 = [nl2[0] * ca - nl2[1] * sa, nl2[0] * sa + nl2[1] * ca];
      var dot2 = nw2[0] * sunGnd[0] + nw2[1] * sunGnd[1];
      var tB2 = Math.round(clamp((dot2 + 0.30) / 1.30, 0, 1) * 8);
      ctx.beginPath();
      ctx.moveTo(A[0], A[1]); ctx.lineTo(Bp[0], Bp[1]); ctx.lineTo(Ap[0], Ap[1]);
      ctx.closePath();
      ctx.fillStyle = faceCol(r.matIx, v, tB2, hB, 2);
      ctx.fill();
    }
    /* the ridge itself */
    ctx.beginPath(); ctx.moveTo(R0[0], R0[1]); ctx.lineTo(R1[0], R1[1]);
    ctx.strokeStyle = faceCol(m, v, 8, hB, 5);
    ctx.lineWidth = Math.max(0.8, Math.hypot(R1[0] - R0[0], R1[1] - R0[1]) * 0.014);
    ctx.stroke();
  }

  function drawPyr(r, p, hB, quality) {
    var ca = cos(p.yaw), sa = sin(p.yaw), i;
    var L = [[-p.hw, -p.hd], [p.hw, -p.hd], [p.hw, p.hd], [-p.hw, p.hd]];
    var pts = [];
    for (i = 0; i < 4; i++) {
      var wx = p.cx + L[i][0] * ca - L[i][1] * sa, wy = p.cy + L[i][0] * sa + L[i][1] * ca;
      if (!proj(wx, wy, p.z0)) return;
      pts.push([px, py]);
    }
    if (!proj(p.cx, p.cy, p.z1)) return;
    var A = [px, py];
    var m = p.m, v = 1;
    var eyeL = [(eye[0] - p.cx) * ca + (eye[1] - p.cy) * sa, -(eye[0] - p.cx) * sa + (eye[1] - p.cy) * ca];
    for (i = 0; i < 4; i++) {
      var a = pts[i], b = pts[(i + 1) & 3];
      var nl = FNL[i];
      if (nl[0] * eyeL[0] + nl[1] * eyeL[1] <= 0 && eye[2] < p.z1) continue;
      var nw = [nl[0] * ca - nl[1] * sa, nl[0] * sa + nl[1] * ca];
      var dot = nw[0] * sunGnd[0] + nw[1] * sunGnd[1];
      var tB = Math.round(clamp((dot * 0.6 + 0.62), 0, 1) * 8);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(A[0], A[1]);
      ctx.closePath();
      ctx.fillStyle = faceCol(m, v, tB, hB, 2);
      ctx.fill();
      if (quality) {
        ctx.strokeStyle = rgbas(mix(C.shadow, C.haze, hB / 18), 0.28);
        ctx.lineWidth = 0.8; ctx.stroke();
      }
    }
  }

  /* ------------------------------------------------------ cylinders */
  var CYN = 10, CYC = null;
  function drawCyl(r, c, hB, quality) {
    if (!CYC) { CYC = []; for (var q = 0; q < CYN; q++) CYC.push([cos(q / CYN * TAU), sin(q / CYN * TAU)]); }
    var m = c.m, v = 1, i;
    var d = depthOf(c.cx, c.cy, c.zc);
    if (c.r * (FOC / d) < 0.7) return;
    var ex = eye[0] - c.cx, ey = eye[1] - c.cy;
    var el = Math.hypot(ex, ey) || 1; ex /= el; ey /= el;
    for (i = 0; i < CYN; i++) {
      var a0 = CYC[i], a1 = CYC[(i + 1) % CYN];
      var nx = (a0[0] + a1[0]) / 2, ny = (a0[1] + a1[1]) / 2;
      var nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      if (nx * ex + ny * ey <= 0.02) continue;
      var x0 = c.cx + a0[0] * c.r, y0 = c.cy + a0[1] * c.r;
      var x1 = c.cx + a1[0] * c.r, y1 = c.cy + a1[1] * c.r;
      if (!proj(x0, y0, c.z0)) continue; var p0x = px, p0y = py;
      if (!proj(x1, y1, c.z0)) continue; var p1x = px, p1y = py;
      if (!proj(x1, y1, c.z1)) continue; var p2x = px, p2y = py;
      if (!proj(x0, y0, c.z1)) continue; var p3x = px, p3y = py;
      var dot = nx * sunGnd[0] + ny * sunGnd[1];
      var tB = Math.round(clamp((dot + 0.30) / 1.30, 0, 1) * 8);
      ctx.beginPath();
      ctx.moveTo(p0x, p0y); ctx.lineTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.lineTo(p3x, p3y);
      ctx.closePath();
      ctx.fillStyle = faceCol(m, v, tB, hB, 2);
      ctx.fill();
    }
    /* the cap */
    if (eye[2] > c.z1) {
      ctx.beginPath();
      for (i = 0; i < CYN; i++) {
        if (!proj(c.cx + CYC[i][0] * c.r, c.cy + CYC[i][1] * c.r, c.z1)) return;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = roofCol(m, v, hB, 0);
      ctx.fill();
    }
  }

  /* ---------------------------------------------------------- domes */
  function drawDome(r, dm, hB, quality) {
    var m = dm.m, v = 1;
    var d = depthOf(dm.cx, dm.cy, dm.z0 + dm.h * 0.5);
    if (dm.r * (FOC / d) < 1.2) return;
    /* A true quad mesh with backface culling. The old stacked-ellipse bands
       looked right from above, but seen from the street each ring showed its
       underside as a saucer around the dome and the wall leaked through in
       stripes between the bands. */
    var nb = quality ? 7 : 4;
    var seg = quality ? 16 : 10;
    var j, q;
    for (j = 0; j < nb; j++) {
      var t0 = j / nb * PI / 2, t1 = (j + 1) / nb * PI / 2;
      var r0 = dm.r * cos(t0), r1 = dm.r * cos(t1);
      var z0 = dm.z0 + dm.h * sin(t0), z1 = dm.z0 + dm.h * sin(t1);
      var ctm = cos((t0 + t1) / 2), stm = sin((t0 + t1) / 2);
      for (q = 0; q < seg; q++) {
        var a0 = q / seg * TAU, a1 = (q + 1) / seg * TAU, am = (a0 + a1) / 2;
        /* the outward normal at the middle of this quad */
        var nx = cos(am) * ctm, ny = sin(am) * ctm, nz = stm;
        /* backface: from the surface point toward the eye */
        var sxw = dm.cx + nx * dm.r, syw = dm.cy + ny * dm.r;
        var szw = dm.z0 + dm.h * stm;
        if (nx * (eye[0] - sxw) + ny * (eye[1] - syw) + nz * (eye[2] - szw) <= 0) continue;
        var c0 = cos(a0), s0 = sin(a0), c1 = cos(a1), s1 = sin(a1);
        if (!proj(dm.cx + c0 * r0, dm.cy + s0 * r0, z0)) continue; var q0x = px, q0y = py;
        if (!proj(dm.cx + c1 * r0, dm.cy + s1 * r0, z0)) continue; var q1x = px, q1y = py;
        if (!proj(dm.cx + c1 * r1, dm.cy + s1 * r1, z1)) continue; var q2x = px, q2y = py;
        if (!proj(dm.cx + c0 * r1, dm.cy + s0 * r1, z1)) continue; var q3x = px, q3y = py;
        ctx.beginPath();
        ctx.moveTo(q0x, q0y); ctx.lineTo(q1x, q1y); ctx.lineTo(q2x, q2y); ctx.lineTo(q3x, q3y);
        ctx.closePath();
        var dot = nx * sunGnd[0] + ny * sunGnd[1];
        var tB = Math.round(clamp((dot * 0.5 + 0.42 + nz * 0.34), 0, 1) * 8);
        var col = faceCol(m, v, tB, hB, nz > 0.80 ? 0 : 2);
        ctx.fillStyle = col;
        ctx.fill();
        /* a hairline stroke of the same paint hides the antialiased seams */
        ctx.strokeStyle = col;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
    /* meridian ribs */
    if (quality && dm.r * (FOC / d) > 14) {
      var k;
      ctx.beginPath();
      for (k = 0; k < 10; k++) {
        var a3 = k / 10 * TAU, s;
        for (s = 0; s <= 6; s++) {
          var tt = s / 6 * PI / 2;
          if (!proj(dm.cx + cos(a3) * dm.r * cos(tt), dm.cy + sin(a3) * dm.r * cos(tt), dm.z0 + dm.h * sin(tt))) return;
          if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
      }
      ctx.strokeStyle = rgbas(mix(C.shadow, C.haze, hB / 18), 0.26);
      ctx.lineWidth = 0.9; ctx.stroke();
    }
  }

  /* ------------------------------------- struts, cages, netting, life */
  function drawStrut(r, s, hB) {
    if (!proj(s.ax, s.ay, s.az)) return;
    var x0 = px, y0 = py, d0 = pz;
    if (!proj(s.bx, s.by, s.bz)) return;
    var x1 = px, y1 = py;
    var lw = s.w * (FOC / Math.max(20, d0)) * 2;
    if (lw < 0.35) lw = 0.35;
    if (Math.hypot(x1 - x0, y1 - y0) < 0.6 && lw < 0.6) return;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
    ctx.strokeStyle = faceCol(s.m === undefined ? M_STEEL : s.m, 1, 5, hB, 2);
    ctx.lineWidth = lw; ctx.lineCap = 'round';
    ctx.stroke();
  }

  function drawFrame(r, f, hB, quality) {
    var ca = cos(f.yaw), sa = sin(f.yaw), i, k;
    var lifts = f.lifts || 3;
    var d = depthOf(f.cx, f.cy, f.zc);
    var scr = (f.z1 - f.z0) * (FOC / d);
    if (scr < 6) return;
    var cols = clamp(Math.round(f.hw * 2 / 9), 2, 6);
    var col = faceCol(M_STEEL, 1, 5, hB, 2);
    ctx.strokeStyle = col;
    ctx.lineWidth = Math.max(0.5, 1.1 * (FOC / d) * 0.7);
    ctx.beginPath();
    var j;
    for (j = 0; j < 4; j++) {
      var A = [CXS[j] * f.hw, CYS[j] * f.hd], Bp = [CXS[(j + 1) & 3] * f.hw, CYS[(j + 1) & 3] * f.hd];
      for (i = 0; i <= cols; i++) {
        var t = i / cols;
        var lx = A[0] + (Bp[0] - A[0]) * t, ly = A[1] + (Bp[1] - A[1]) * t;
        var wx = f.cx + lx * ca - ly * sa, wy = f.cy + lx * sa + ly * ca;
        if (!proj(wx, wy, f.z0)) continue; var sx = px, sy = py;
        if (!proj(wx, wy, f.z1)) continue;
        ctx.moveTo(sx, sy); ctx.lineTo(px, py);
      }
      for (k = 0; k <= lifts; k++) {
        var z = f.z0 + (f.z1 - f.z0) * k / lifts;
        var wx0 = f.cx + A[0] * ca - A[1] * sa, wy0 = f.cy + A[0] * sa + A[1] * ca;
        var wx1 = f.cx + Bp[0] * ca - Bp[1] * sa, wy1 = f.cy + Bp[0] * sa + Bp[1] * ca;
        if (!proj(wx0, wy0, z)) continue; var qx0 = px, qy0 = py;
        if (!proj(wx1, wy1, z)) continue;
        ctx.moveTo(qx0, qy0); ctx.lineTo(px, py);
        if (k < lifts && quality) {
          /* the cross-bracing: a diagonal each way per lift, so the cage
             reads as tied scaffold and not as a bare grid */
          var zn = f.z0 + (f.z1 - f.z0) * (k + 1) / lifts;
          if (!proj(wx1, wy1, zn)) continue;
          ctx.moveTo(qx0, qy0); ctx.lineTo(px, py);
          if (!proj(wx0, wy0, zn)) continue;
          ctx.moveTo(px, py);
          if (!proj(wx1, wy1, z)) continue;
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();
    /* the planks on each lift */
    if (quality && scr > 40) {
      for (k = 1; k <= lifts; k++) {
        var z2 = f.z0 + (f.z1 - f.z0) * k / lifts;
        ctx.beginPath();
        var ok = true;
        for (j = 0; j < 4; j++) {
          var Lp = [CXS[j] * f.hw, CYS[j] * f.hd];
          var wx2 = f.cx + Lp[0] * ca - Lp[1] * sa, wy2 = f.cy + Lp[0] * sa + Lp[1] * ca;
          if (!proj(wx2, wy2, z2)) { ok = false; break; }
          if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        if (!ok) continue;
        ctx.closePath();
        ctx.strokeStyle = faceCol(M_WOOD, 1, 6, hB, 0);
        ctx.lineWidth = Math.max(0.7, 1.6 * (FOC / d) * 0.7);
        ctx.stroke();
      }
      ctx.strokeStyle = col;
    }
  }

  function drawNet(r, nn, hB) {
    var ca = cos(nn.yaw), sa = sin(nn.yaw), j = nn.front & 3;
    var i0 = j, i1 = (j + 1) & 3;
    var ax = nn.cx + CXS[i0] * nn.hw * ca - CYS[i0] * nn.hd * sa;
    var ay = nn.cy + CXS[i0] * nn.hw * sa + CYS[i0] * nn.hd * ca;
    var bx = nn.cx + CXS[i1] * nn.hw * ca - CYS[i1] * nn.hd * sa;
    var by = nn.cy + CXS[i1] * nn.hw * sa + CYS[i1] * nn.hd * ca;
    var nlx = FNL[j][0], nly = FNL[j][1];
    var nx = nlx * ca - nly * sa, ny = nlx * sa + nly * ca;
    if (nx * (eye[0] - nn.cx) + ny * (eye[1] - nn.cy) <= 0) return;
    if (!proj(ax, ay, nn.z0)) return; var p0 = [px, py];
    if (!proj(bx, by, nn.z0)) return; var p1 = [px, py];
    if (!proj(bx, by, nn.z1)) return; var p2 = [px, py];
    if (!proj(ax, ay, nn.z1)) return; var p3 = [px, py];
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.lineTo(p3[0], p3[1]);
    ctx.closePath();
    if (nn.fence) {
      ctx.fillStyle = faceCol(M_WOOD, 1, 5, hB, 2);
      ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
      var k, n = 8;
      ctx.beginPath();
      for (k = 1; k < n; k++) {
        var t = k / n;
        ctx.moveTo(p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t);
        ctx.lineTo(p3[0] + (p2[0] - p3[0]) * t, p3[1] + (p2[1] - p3[1]) * t);
      }
      ctx.strokeStyle = faceCol(M_WOOD, 1, 2, hB, 3);
      ctx.lineWidth = 0.8; ctx.stroke();
    } else {
      ctx.fillStyle = faceCol(M_DARK, 1, 5, hB, 2);
      ctx.globalAlpha = 0.34; ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = faceCol(M_DARK, 1, 6, hB, 5);
      ctx.lineWidth = 0.8; ctx.stroke();
    }
  }

  function drawPlant(r, p, hz, quality) {
    if (!proj(p.cx, p.cy, p.z)) return;
    var sx = px, sy = py, s = pS;
    var R = p.r * s;
    if (R < 0.7) return;
    if (R > 220) R = 220;
    if (p.kind === 'smoke') {
      /* the plume leans with the shared wind: it rises straighter in a lull
         and streams out flatter in a gust, like every other soft thing */
      var i, t = LT * 0.00016;
      var lean = (0.9 + 1.5 * WINDV) * p.r;
      for (i = 0; i < 4; i++) {
        var ph = (t + i * 0.25) % 1;
        var rr = R * (0.6 + ph * 2.4);
        if (!proj(p.cx + sunGnd[1] * ph * lean, p.cy - sunGnd[0] * ph * lean,
                  p.z + ph * p.r * (7 - 1.6 * WINDV))) continue;
        ctx.globalAlpha = (1 - ph) * 0.34 * (1 - hz * 0.7);
        ctx.drawImage(SPR.smoke, px - rr, py - rr, rr * 2, rr * 2);
      }
      ctx.globalAlpha = 1;
      return;
    }
    var dsx = sunSX - sx, dsy = sunSY - sy;
    var dl = Math.hypot(dsx, dsy) || 1;
    /* deep in the haze a canopy fades at the pace of the walls around it,
       so a far quarter never reads as orphan trees on bare paper */
    var fade = hz > 0.55 ? clamp(1 - (hz - 0.55) / 0.32, 0, 1) : 1;
    if (fade < 0.04) return;
    ctx.globalAlpha = (1 - hz * 0.55) * fade;
    ctx.drawImage(SPR.canopy, sx - R, sy - R * 0.90, R * 2, R * 1.80);
    /* a big close canopy is three masses, not one blurred ball */
    if (R > 64) {
      ctx.globalAlpha = (1 - hz * 0.55) * fade * 0.9;
      ctx.drawImage(SPR.canopy, sx - R * 0.42 - R * 0.62, sy - R * 0.30 - R * 0.55, R * 1.24, R * 1.10);
      ctx.drawImage(SPR.canopy, sx + R * 0.38 - R * 0.55, sy - R * 0.16 - R * 0.50, R * 1.10, R * 1.00);
    }
    ctx.globalAlpha = (1 - hz * 0.7) * 0.92 * fade;
    ctx.drawImage(SPR.canopyLit, sx + (dsx / dl) * R * 0.26 - R * 0.56, sy - R * 0.36 - R * 0.50,
      R * 1.12, R * 1.00);
    ctx.globalAlpha = 1;
    if (hz > 0.14) spriteAt(SPR.haze, sx, sy - R * 0.1, R * 1.02, R * 0.95, hz * 0.9 * fade);
  }

  function drawScrub() {
    var i, drawn = 0;
    for (i = 0; i < scrub.length; i++) {
      if (drawn > 90) break;
      var s = scrub[i];
      var d = depthOf(s.x, s.y, s.z);
      if (d < 20) continue;
      var hz = hazeAt(d);
      if (hz > 0.82) continue;
      var fade = hz > 0.55 ? clamp(1 - (hz - 0.55) / 0.32, 0, 1) : 1;
      if (!proj(s.x, s.y, s.z)) continue;
      var R = s.r * pS;
      if (R < 0.7) continue;
      if (R > 130) R = 130;
      drawn++;
      ctx.globalAlpha = (1 - hz * 0.6) * 0.9 * fade;
      ctx.drawImage(SPR.canopy, px - R, py - R * 0.8, R * 2, R * 1.6);
      ctx.globalAlpha = (1 - hz * 0.75) * 0.75 * fade;
      ctx.drawImage(SPR.canopyLit, px - R * 0.5, py - R * 0.85, R * 1.0, R * 0.85);
      ctx.globalAlpha = 1;
      if (hz > 0.14) spriteAt(SPR.haze, px, py, R * 1.05, R * 0.9, hz * 0.85 * fade);
    }
  }

  /* ==================================================================
     THE SMALL INHABITED THINGS
     ================================================================== */
  function wpoly(pts, z, col) {
    var i;
    ctx.beginPath();
    for (i = 0; i < pts.length; i++) {
      if (!proj(pts[i][0], pts[i][1], pts[i][2] === undefined ? z : pts[i][2])) return false;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
    return true;
  }
  /* a small upright box in world space, drawn with two faces */
  function miniBox(x, y, hw, hd, z0, z1, yaw, m, hB) {
    var ca = cos(yaw), sa = sin(yaw), j;
    var ex = eye[0] - x, ey = eye[1] - y;
    for (j = 0; j < 4; j++) {
      var nlx = FNL[j][0], nly = FNL[j][1];
      var nx = nlx * ca - nly * sa, ny = nlx * sa + nly * ca;
      var ext = (j === 0 || j === 2) ? hd : hw;
      if (nx * ex + ny * ey <= ext * 0.999) continue;
      var i0 = j, i1 = (j + 1) & 3;
      var a0x = x + CXS[i0] * hw * ca - CYS[i0] * hd * sa, a0y = y + CXS[i0] * hw * sa + CYS[i0] * hd * ca;
      var a1x = x + CXS[i1] * hw * ca - CYS[i1] * hd * sa, a1y = y + CXS[i1] * hw * sa + CYS[i1] * hd * ca;
      var dot = nx * sunGnd[0] + ny * sunGnd[1];
      var tB = Math.round(clamp((dot + 0.30) / 1.30, 0, 1) * 8);
      /* a face the near plane cuts is skipped on its own; the rest of the
         box still draws, so a long prop never breaks apart mid-shaft */
      if (!proj(a0x, a0y, z0)) continue; var q0 = [px, py];
      if (!proj(a1x, a1y, z0)) continue; var q1 = [px, py];
      if (!proj(a1x, a1y, z1)) continue; var q2 = [px, py];
      if (!proj(a0x, a0y, z1)) continue; var q3 = [px, py];
      ctx.beginPath();
      ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.lineTo(q2[0], q2[1]); ctx.lineTo(q3[0], q3[1]);
      ctx.closePath();
      ctx.fillStyle = faceCol(m, 1, tB, hB, 2); ctx.fill();
    }
    if (eye[2] > z1) {
      ctx.beginPath();
      for (j = 0; j < 4; j++) {
        var lx = CXS[j] * hw, ly = CYS[j] * hd;
        if (!proj(x + lx * ca - ly * sa, y + lx * sa + ly * ca, z1)) return;
        if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = roofCol(m, 1, hB, 0); ctx.fill();
    }
  }

  /* Props are gathered with their depth each frame and drawn interleaved
     with the buildings, far to near, so a lamp behind a house stays behind
     the house and a market square never paints over the wall in front. */
  var propsVis = [];
  function gatherProps() {
    propsVis.length = 0;
    var i, n = props.length, taken = 0;
    for (i = 0; i < n; i++) {
      var p = props[i];
      /* a washing line has no centre of its own: it is measured at midspan */
      var pcx = p.x != null ? p.x : (p.ax + p.bx) / 2;
      var pcy = p.y != null ? p.y : (p.ay + p.by) / 2;
      var d = depthOf(pcx, pcy, p.z || 4);
      if (!(d >= 12)) continue;
      var hz = hazeAt(d);
      if (hz > 0.82) continue;
      if (p.k !== 'bird' && (FOC / d) * 6 < 1.6) continue;
      /* no bake-order starvation: the living layer is appended after the
         street furniture, so a hard cap here would silently drop it. The
         size and haze gates above are the real cull; this is a safety. */
      if (taken++ > 1800) break;
      p._d = d; p._hz = hz;
      propsVis.push(p);
    }
    propsVis.sort(function (a, b) { return b._d - a._d; });
  }
  /* every standing prop takes the ground with a small contact shadow:
     without it a van, a stall or a person floats over the pavement */
  function propAO(p, r, hz) {
    groundSprite(SPR.ao, p.x, p.y, r, 0.30 * (1 - hz));
  }
  function drawProp(p) {
    var d = p._d, hz = p._hz, s = FOC / d;
    if (p.k === 'bird') { drawBird(p, s, hz); return; }
    var hB = Math.round(hz / HZ_MAX * 18); if (hB > 18) hB = 18; if (hB < 0) hB = 0;
    switch (p.k) {
        case 'lamp':  drawLamp(p, s, hz, hB); break;
        case 'bench': propAO(p, 4.2, hz); drawBench(p, s, hB); break;
        case 'boll':  propAO(p, 1.3, hz); miniBox(p.x, p.y, 0.55, 0.55, 0, 2.4, 0, M_DARK, hB); break;
        case 'van':   propAO(p, 6.4, hz); drawVan(p, s, hB); break;
        case 'stall': propAO(p, p.s * 0.85, hz); drawStall(p, s, hB); break;
        case 'tree':  drawPropTree(p, hz); break;
        case 'well':  drawWell(p, hB); break;
        case 'wash':  drawWash(p, s, hB); break;
        case 'ped':   propAO(p, 1.5, hz); drawPed(p, s, hB); break;
        case 'cafe':  propAO(p, 3.6, hz); drawCafe(p, s, hB); break;
        case 'boat':  drawBoat(p, s, hB); break;
        case 'walker': drawWalker(p, s, hB); break;
        case 'dvan':  drawDvan(p, s, hB); break;
        case 'pig':   drawPig(p, s, hB); break;
        case 'cat':   drawCat(p, s, hB); break;
        case 'gard':  drawGard(p, s, hB); break;
        case 'moth':  drawMoth(p, s, hB); break;
    }
  }

  /* a person is three stacked boxes: legs in shade, a coat, a head */
  function drawPed(p, s, hB) {
    if (s * 3.4 < 2.0) return;
    var m = M_VAN0 + (p.hue % 4);
    if (p.hue === 4) m = M_AWN;
    miniBox(p.x, p.y, 0.5, 0.42, 0, 1.6, p.yaw, M_DARK, hB);
    miniBox(p.x, p.y, 0.72, 0.55, 1.6, 3.6, p.yaw, m, hB);
    miniBox(p.x, p.y, 0.36, 0.34, 3.6, 4.6, p.yaw, M_TRIM, hB);
  }
  /* a cafe table with two stools, out on the pavement */
  function drawCafe(p, s, hB) {
    if (s * 3.4 < 2.0) return;
    miniBox(p.x, p.y, 0.22, 0.22, 0, 2.6, p.yaw, M_STEEL, hB);
    miniBox(p.x, p.y, 1.5, 1.5, 2.6, 3.1, p.yaw, M_TRIM, hB);
    miniBox(p.x + cos(p.yaw) * 2.8, p.y + sin(p.yaw) * 2.8, 0.7, 0.7, 0, 1.7, p.yaw, M_WOOD, hB);
    miniBox(p.x - cos(p.yaw) * 2.8, p.y - sin(p.yaw) * 2.8, 0.7, 0.7, 0, 1.7, p.yaw, M_WOOD, hB);
  }
  /* the rowboat, riding low on the reading order */
  function drawBoat(p, s, hB) {
    miniBox(p.x, p.y, 3.6, 1.4, 0.3, 1.8, p.yaw, M_WOOD, hB);
    miniBox(p.x, p.y, 2.7, 0.9, 1.0, 1.8, p.yaw, M_DARK, hB);
    miniBox(p.x + cos(p.yaw) * 0.6, p.y + sin(p.yaw) * 0.6, 0.4, 0.4, 1.8, 3.2, p.yaw, M_SHUT, hB);
  }
  /* The model-maker's tools lie flat on the table, drawn right after the
     sheet so they can never land on top of a district. Each takes the
     table with a run of soft contact shadows along its length. */
  function drawTools() {
    var i, j;
    for (i = 0; i < tools.length; i++) {
      var t = tools[i];
      var d = depthOf(t.x, t.y, 2);
      if (d < 16) continue;
      var hz = hazeAt(d);
      if (hz > 0.85) continue;
      var hB = Math.round(hz / HZ_MAX * 18); if (hB > 18) hB = 18; if (hB < 0) hB = 0;
      var ca = cos(t.yaw), sa = sin(t.yaw);
      for (j = -2; j <= 2; j++) {
        groundSprite(SPR.ao, t.x + ca * t.len * j * 0.4, t.y + sa * t.len * j * 0.4,
          t.len * 0.30, 0.22 * (1 - hz));
      }
      if (t.k === 'pencil') drawPencil(t, hB);
      else if (t.k === 'ruler') drawRuler(t, hB);
      else if (t.k === 'knife') drawKnife(t, hB);
      else if (t.k === 'pot') drawPot(t, hB);
      else if (t.k === 'eraser') drawEraser(t, hB);
      else if (t.k === 'shavings') drawShavings(t, hB);
    }
  }
  /* the craft knife: a steel blade run out of a dark segmented handle */
  function drawKnife(p, hB) {
    var ca = cos(p.yaw), sa = sin(p.yaw), L = p.len;
    miniBox(p.x - ca * L * 0.30, p.y - sa * L * 0.30, L * 0.72, L * 0.085, 0, L * 0.075, p.yaw, M_DARK, hB);
    miniBox(p.x + ca * L * 0.72, p.y + sa * L * 0.72, L * 0.34, L * 0.055, 0, L * 0.045, p.yaw, M_TRIM, hB);
    miniBox(p.x + ca * L * 1.10, p.y + sa * L * 1.10, L * 0.09, L * 0.035, 0, L * 0.035, p.yaw, M_STEEL, hB);
  }
  /* the paint pot, its lid beside it, the brush laid down still wet */
  function drawPot(p, hB) {
    var ca = cos(p.yaw), sa = sin(p.yaw), L = p.len;
    var q;
    /* the pot is round: twelve short faces stand in for the turn */
    for (q = 0; q < 6; q++) {
      var a = p.yaw + q * PI / 6;
      miniBox(p.x, p.y, L * 0.34, L * 0.34, 0, L * 0.42, a, M_STALL0 + 1, hB);
    }
    miniBox(p.x, p.y, L * 0.24, L * 0.24, L * 0.42, L * 0.46, p.yaw, M_COPPER, hB);
    /* the lid, dropped beside it */
    miniBox(p.x - ca * L * 0.9, p.y - sa * L * 0.9, L * 0.30, L * 0.30, 0, L * 0.06, p.yaw + 0.5, M_TRIM, hB);
    /* the brush: handle, ferrule, a tipped head resting off the rag */
    var bx0 = p.x + ca * L * 1.1, by0 = p.y + sa * L * 1.1, by = p.yaw + 0.9;
    miniBox(bx0, by0, L * 0.42, L * 0.05, 0, L * 0.05, by, M_WOOD, hB);
    miniBox(bx0 + cos(by) * L * 0.5, by0 + sin(by) * L * 0.5, L * 0.10, L * 0.05, 0, L * 0.05, by, M_STEEL, hB);
    miniBox(bx0 + cos(by) * L * 0.66, by0 + sin(by) * L * 0.66, L * 0.12, L * 0.055, 0, L * 0.055, by, M_STALL0 + 1, hB);
  }
  function drawEraser(p, hB) {
    miniBox(p.x, p.y, p.len * 0.52, p.len * 0.26, 0, p.len * 0.16, p.yaw, M_AWN, hB);
    miniBox(p.x + cos(p.yaw) * p.len * 0.3, p.y + sin(p.yaw) * p.len * 0.3,
      p.len * 0.22, p.len * 0.26, 0, p.len * 0.165, p.yaw, M_TRIM, hB);
  }
  /* pencil shavings: a few small curls scattered where the point was cut */
  function drawShavings(p, hB) {
    var i;
    for (i = 0; i < 5; i++) {
      var h = hash32('shave' + i);
      var a = rnd01(h, 1) * TAU, rr = p.len * (0.2 + rnd01(h, 2) * 1.4);
      var sx2 = p.x + cos(a) * rr, sy2 = p.y + sin(a) * rr;
      miniBox(sx2, sy2, p.len * (0.10 + rnd01(h, 3) * 0.08), p.len * 0.05,
        0, p.len * (0.04 + rnd01(h, 4) * 0.05), rnd01(h, 5) * TAU, M_WOOD, hB);
      miniBox(sx2 + p.len * 0.05, sy2, p.len * 0.05, p.len * 0.04,
        0, p.len * 0.05, rnd01(h, 6) * TAU, M_STALL0 + 2, hB);
    }
  }
  /* the model-maker's pencil, lying just off the torn edge */
  function drawPencil(p, hB) {
    var ca = cos(p.yaw), sa = sin(p.yaw), L = p.len;
    /* the shaft in short lengths, so the near plane can only ever take the
       piece that is actually out of frame, never snap the whole shaft */
    var SEGS = 6, si2;
    for (si2 = 0; si2 < SEGS; si2++) {
      var c0 = -1 + 2 * (si2 + 0.5) / SEGS;
      miniBox(p.x + ca * L * c0, p.y + sa * L * c0, L / SEGS + 0.3, L * 0.032, 0, L * 0.055, p.yaw, M_STALL0 + 2, hB);
    }
    miniBox(p.x + ca * L * 1.075, p.y + sa * L * 1.075, L * 0.085, L * 0.028, 0, L * 0.048, p.yaw, M_WOOD, hB);
    miniBox(p.x + ca * L * 1.175, p.y + sa * L * 1.175, L * 0.022, L * 0.016, 0, L * 0.030, p.yaw, M_DARK, hB);
    miniBox(p.x - ca * L * 1.035, p.y - sa * L * 1.035, L * 0.045, L * 0.030, 0, L * 0.052, p.yaw, M_AWN, hB);
  }
  /* the ruler along the far edge of the sheet */
  function drawRuler(p, hB) {
    var L = p.len;
    miniBox(p.x, p.y, L, L * 0.075, 0, L * 0.014, p.yaw, M_TRIM, hB);
    miniBox(p.x - sin(p.yaw) * L * 0.055, p.y + cos(p.yaw) * L * 0.055, L, L * 0.016, L * 0.013, L * 0.020, p.yaw, M_WOOD, hB);
  }

  function drawLamp(p, s, hz, hB) {
    groundSprite(SPR.warm, p.x, p.y, 9, 0.22 * (1 - hz));
    if (!proj(p.x, p.y, 0)) return; var x0 = px, y0 = py;
    if (!proj(p.x, p.y, p.h)) return; var x1 = px, y1 = py;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
    ctx.strokeStyle = faceCol(M_STEEL, 1, 4, hB, 2);
    ctx.lineWidth = Math.max(0.5, Math.min(0.75 * s * 1.4, 7)); ctx.lineCap = 'round';
    ctx.stroke();
    /* the globe is a small glass lantern: its screen size is capped, or a
       near lamp swells into a paper sun that dwarfs the street */
    var rr = clamp(1.5 * s, 1.0, 9);
    ctx.beginPath(); ctx.arc(x1, y1 - rr * 0.5, rr, 0, TAU);
    ctx.fillStyle = litCol(hB); ctx.fill();
    /* the halo goes down with the lamp, not at the end of the frame, so a
       wall in front of the lamp also stands in front of its glow */
    if (rr > 1.4) {
      ctx.globalCompositeOperation = 'lighter';
      spriteAt(SPR.glint, x1, y1 - rr * 0.5, Math.min(rr * 5, 42), Math.min(rr * 5, 42), 0.26 * (1 - hz));
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  function drawBench(p, s, hB) {
    var ca = cos(p.yaw), sa = sin(p.yaw);
    miniBox(p.x, p.y, ca > 0.5 || ca < -0.5 ? 3.4 : 0.9, ca > 0.5 || ca < -0.5 ? 0.9 : 3.4, 1.4, 2.1, p.yaw, M_WOOD, hB);
    miniBox(p.x - sa * 0.8, p.y + ca * 0.8, ca > 0.5 || ca < -0.5 ? 3.4 : 0.35, ca > 0.5 || ca < -0.5 ? 0.35 : 3.4, 2.1, 3.9, p.yaw, M_WOOD, hB);
  }
  function drawVan(p, s, hB) {
    var m = M_VAN0 + (p.hue % 4);
    var ca = cos(p.yaw), sa = sin(p.yaw);
    miniBox(p.x, p.y, 4.6, 2.0, 0.7, 4.4, p.yaw, m, hB);
    miniBox(p.x + ca * 3.2, p.y + sa * 3.2, 1.6, 2.0, 4.4, 5.6, p.yaw, m, hB);
    miniBox(p.x, p.y, 4.7, 2.1, 0.0, 0.7, p.yaw, M_DARK, hB);
    /* close enough to be a vehicle, not a crate: windscreen and wheels */
    if (s * 4.6 > 26) {
      miniBox(p.x + ca * 4.55, p.y + sa * 4.55, 0.35, 1.7, 4.5, 5.5, p.yaw, M_GLASS, hB);
      var wi;
      for (wi = -1; wi <= 1; wi += 2) {
        miniBox(p.x + ca * 3.0 - sa * wi * 2.05, p.y + sa * 3.0 + ca * wi * 2.05, 0.85, 0.28, 0, 1.5, p.yaw, M_DARK, hB);
        miniBox(p.x - ca * 3.0 - sa * wi * 2.05, p.y - sa * 3.0 + ca * wi * 2.05, 0.85, 0.28, 0, 1.5, p.yaw, M_DARK, hB);
      }
    }
  }
  function drawStall(p, s, hB) {
    var q, m = M_STALL0 + (p.hue % 3);
    miniBox(p.x, p.y, p.s * 0.5, p.s * 0.35, 0, 3.2, p.yaw, M_WOOD, hB);
    var ca = cos(p.yaw), sa = sin(p.yaw);
    for (q = 0; q < 4; q++) {
      var lx = (q < 2 ? -1 : 1) * p.s * 0.48, ly = (q % 2 ? -1 : 1) * p.s * 0.33;
      var wx = p.x + lx * ca - ly * sa, wy = p.y + lx * sa + ly * ca;
      if (!proj(wx, wy, 0)) continue; var a0 = [px, py];
      if (!proj(wx, wy, 5.4)) continue;
      ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(px, py);
      ctx.strokeStyle = faceCol(M_WOOD, 1, 4, hB, 2);
      ctx.lineWidth = Math.max(0.4, 0.5 * s * 1.4); ctx.stroke();
    }
    /* the striped canopy */
    var stripes = 6, k;
    for (k = 0; k < stripes; k++) {
      var t0 = k / stripes - 0.5, t1 = (k + 1) / stripes - 0.5;
      var pts = [], e;
      var corners = [[t0 * p.s * 1.1, -p.s * 0.42], [t1 * p.s * 1.1, -p.s * 0.42],
                     [t1 * p.s * 1.1, p.s * 0.42], [t0 * p.s * 1.1, p.s * 0.42]];
      ctx.beginPath();
      var ok = true;
      for (e = 0; e < 4; e++) {
        var cxl = corners[e][0], cyl = corners[e][1];
        var wx2 = p.x + cxl * ca - cyl * sa, wy2 = p.y + cxl * sa + cyl * ca;
        if (!proj(wx2, wy2, 5.4 + (e === 1 || e === 2 ? 0 : 0.8))) { ok = false; break; }
        if (e === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      if (!ok) continue;
      ctx.closePath();
      ctx.fillStyle = k % 2 ? faceCol(M_TRIM, 1, 7, hB, 0) : faceCol(m, 1, 7, hB, 0);
      ctx.fill();
    }
  }
  function drawPropTree(p, hz) {
    var fade = hz > 0.55 ? clamp(1 - (hz - 0.55) / 0.32, 0, 1) : 1;
    if (fade < 0.04) return;
    /* the tree takes the ground: a street tree without its shadow floats */
    groundSprite(SPR.ao, p.x, p.y, p.r * 1.35, 0.26 * (1 - hz) * fade);
    groundSprite(SPR.shadow, p.x - sunGnd[0] * p.r * 0.8, p.y - sunGnd[1] * p.r * 0.8,
      p.r * 1.1, 0.20 * (1 - hz) * fade);
    if (!proj(p.x, p.y, 0)) return; var x0 = px, y0 = py;
    if (!proj(p.x, p.y, p.z)) return;
    var R = p.r * pS;
    if (R < 0.7) return;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(px, py);
    ctx.strokeStyle = rgbas(mix(mix(C.earth, C.ink, 0.45), C.haze, hz), 0.9 * fade);
    ctx.lineWidth = Math.max(0.7, R * 0.16); ctx.stroke();
    var sx = px, sy = py;
    var dsx = sunSX - sx, dsy = sunSY - sy, dl = Math.hypot(dsx, dsy) || 1;
    ctx.globalAlpha = (1 - hz * 0.55) * fade;
    ctx.drawImage(SPR.canopy, sx - R, sy - R * 1.15, R * 2, R * 1.9);
    if (R > 64) {
      ctx.globalAlpha = (1 - hz * 0.55) * fade * 0.9;
      ctx.drawImage(SPR.canopy, sx - R * 0.44 - R * 0.60, sy - R * 0.72 - R * 0.52, R * 1.2, R * 1.05);
      ctx.drawImage(SPR.canopy, sx + R * 0.40 - R * 0.52, sy - R * 0.52 - R * 0.48, R * 1.04, R * 0.95);
    }
    ctx.globalAlpha = (1 - hz * 0.7) * 0.9 * fade;
    ctx.drawImage(SPR.canopyLit, sx + (dsx / dl) * R * 0.28 - R * 0.55, sy - R * 0.66 - R * 0.48, R * 1.1, R * 0.96);
    ctx.globalAlpha = 1;
  }
  function drawWell(p, hB) {
    var q;
    ctx.beginPath();
    for (q = 0; q <= 12; q++) {
      var a = q / 12 * TAU;
      if (!proj(p.x + cos(a) * p.r, p.y + sin(a) * p.r, 2.4)) return;
      if (q === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = faceCol(M_TRIM, 1, 6, hB, 0); ctx.fill();
    ctx.strokeStyle = faceCol(M_TRIM, 1, 2, hB, 6); ctx.lineWidth = 1; ctx.stroke();
  }
  function drawWash(p, s, hB) {
    var n = p.n, i;
    if (!proj(p.ax, p.ay, p.z)) return; var x0 = px, y0 = py;
    if (!proj(p.bx, p.by, p.z)) return; var x1 = px, y1 = py;
    var sag = Math.hypot(x1 - x0, y1 - y0) * 0.06;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag, x1, y1);
    ctx.strokeStyle = rgbas(mix(C.ink, C.haze, 0.4), 0.6);
    ctx.lineWidth = Math.max(0.4, 0.5 * s * 1.4);
    ctx.stroke();
    if (s * 3 < 1.2) return;
    for (i = 0; i < n; i++) {
      var t = (i + 0.7) / (n + 0.4);
      var mxp = x0 + (x1 - x0) * t, myp = y0 + (y1 - y0) * t + sag * 2 * t * (1 - t) * 2;
      var ww = Math.max(1.2, 2.2 * s), hh = Math.max(1.6, 3.4 * s);
      /* the wind takes the hems: each garment blows through the shared
         phase, staggered along the line so the wave travels down it */
      var sway = (WINDV * 0.8 + 0.2 * sin(LT * 0.0021 + p.seed % 7 + i * 1.3)) * hh * 0.55;
      ctx.fillStyle = i % 3 === 0 ? faceCol(M_TRIM, 1, 7, hB, 5)
        : i % 3 === 1 ? faceCol(M_AWN, 1, 6, hB, 0) : faceCol(M_SHUT, 1, 6, hB, 0);
      ctx.beginPath();
      ctx.moveTo(mxp - ww / 2, myp);
      ctx.lineTo(mxp + ww / 2, myp);
      ctx.lineTo(mxp + ww / 2 + sway, myp + hh);
      ctx.lineTo(mxp - ww / 2 + sway * 0.85, myp + hh);
      ctx.closePath();
      ctx.fill();
    }
  }
  function drawBird(p, s, hz) {
    var t = TNOW * 0.00008 + p.ph;
    var x = p.x + cos(t) * 60, y = p.y + sin(t * 1.3) * 60;
    if (!proj(x, y, p.z)) return;
    var w = p.s * s * 3;
    if (w < 1.2 || w > 40) return;
    var fl = sin(TNOW * 0.004 + p.ph) * 0.5 + 0.5;
    ctx.beginPath();
    ctx.moveTo(px - w, py + w * 0.2 * fl);
    ctx.lineTo(px, py - w * 0.30);
    ctx.lineTo(px + w, py + w * 0.2 * fl);
    ctx.strokeStyle = rgbas(mix(C.ink, C.haze, hz * 0.7), 0.55 * (1 - hz));
    ctx.lineWidth = Math.max(0.7, w * 0.18);
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  /* ==================================================================
     THE LIVING LAYER — one coherent system of inhabitants, moved by one
     clock and one wind. Every agent is a prop: it enters the same
     depth-sorted stream as everything else, so a walker behind a wall is
     painted behind the wall. Nothing teleports: walkers pace their lane
     and turn at its ends, vans fade out at the depot and fade back in,
     everything else moves on a closed loop. Under prefers-reduced-motion
     the clock is pinned, and the whole layer holds one posed tableau.
     ================================================================== */
  function polyBake(pts) {
    var cum = [0], i, L = 0;
    for (i = 1; i < pts.length; i++) {
      L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      cum.push(L);
    }
    return { pts: pts, cum: cum, len: L };
  }
  var polyPos = [0, 0, 0];
  function polyAt(pb, d) {
    var pts = pb.pts, cum = pb.cum, i;
    if (d <= 0) d = 0.001;
    if (d >= pb.len) d = pb.len - 0.001;
    for (i = 1; i < cum.length; i++) if (cum[i] >= d) break;
    var t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
    polyPos[0] = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t;
    polyPos[1] = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t;
    polyPos[2] = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
    return polyPos;
  }

  function bakeLife() {
    folk = [];
    var put = function (o) { folk.push(o); props.push(o); };
    var i, j;

    /* Pedestrians pace the citation lanes of their quarter. How many walk a
       quarter is its measured standing: the citations its pages receive. */
    dists.forEach(function (dd, di) {
      var dlanes = [];
      for (j = 0; j < lanes.length; j++) {
        if (lanes[j].d === dd && lanes[j].pts.length > 1) dlanes.push(lanes[j]);
      }
      if (!dlanes.length) return;
      var inb = 0;
      dd.members.forEach(function (m) { inb += (G.inbound[m] || 0); });
      var n = clamp(Math.round(inb / 16), 1, 12);
      for (i = 0; i < n; i++) {
        var h = hash32('walk' + di + '-' + i);
        var lane = dlanes[Math.floor(rnd01(h, 1) * dlanes.length) % dlanes.length];
        if (!lane._pb) lane._pb = polyBake(lane.pts);
        /* a lane runs door to door, from inside one lot to inside the other;
           the walker turns at the doorways, not in the living rooms */
        var inset = Math.min(13, lane._pb.len * 0.22);
        var span = lane._pb.len - inset * 2;
        if (span < 10) continue;
        put({ k: 'walker', x: 0, y: 0, yaw: 0, gait: 0,
          pb: lane._pb, u0: inset, span: span, off: rnd01(h, 2) * span * 2,
          sp: 3.2 + rnd01(h, 3) * 1.9,
          hue: Math.floor(rnd01(h, 4) * 5), ph: rnd01(h, 5) * TAU });
      }
    });

    /* Delivery vans travel the strong citation streets between quarters:
       one van per inter-district edge carrying six or more citations. */
    for (i = 0; i < highways.length; i++) {
      var hw = highways[i];
      if (hw.w < 6) continue;
      var h2 = hash32('van' + hw.a.i + ':' + hw.b.i);
      var rev = rnd01(h2, 1) > 0.5;
      var A = rev ? hw.b : hw.a, Bv = rev ? hw.a : hw.b;
      var dx = Bv.x - A.x, dy = Bv.y - A.y, L = Math.hypot(dx, dy) || 1;
      /* keep to the right of the drawn road, like traffic */
      var nx = -dy / L, ny = dx / L;
      put({ k: 'dvan', x: A.x, y: A.y, yaw: 0, alpha: 0,
        ax: A.x + nx * 2.6, ay: A.y + ny * 2.6, ux: dx / L, uy: dy / L, len: L,
        sp: 11 + rnd01(h2, 2) * 5, off: rnd01(h2, 3) * (L + 90),
        hue: Math.floor(rnd01(h2, 4) * 4) });
    }

    /* Pigeons work the monument plazas. */
    dists.forEach(function (dd, di) {
      if (!dd.plaza || dd.plaza.r < 1) return;
      var h3 = hash32('pig' + di);
      var n2 = 3 + Math.floor(rnd01(h3, 1) * 3);
      for (i = 0; i < n2; i++) {
        put({ k: 'pig', x: dd.x, y: dd.y, yaw: 0,
          ax: dd.x + (rnd01(h3, i * 3 + 2) - 0.5) * P * 1.7,
          ay: dd.y + (rnd01(h3, i * 3 + 3) - 0.5) * P * 1.7,
          rx: 4 + rnd01(h3, i * 3 + 4) * 7, ry: 4 + rnd01(h3, i * 5 + 5) * 7,
          w1: 0.10 + rnd01(h3, i * 7 + 6) * 0.12, w2: 0.07 + rnd01(h3, i * 7 + 7) * 0.11,
          ph: rnd01(h3, i * 7 + 8) * TAU });
      }
    });

    /* One cat wanders the derelict lots: a closed round through the empty
       plots that stand nearest one another, walked slowly, forever. */
    var dls = [];
    for (i = 0; i < blds.length; i++) if (blds[i].derelict) dls.push(blds[i]);
    if (dls.length > 2) {
      var seed = dls[hash32('cat') % dls.length];
      var tour = [seed], used = {}; used[seed.slug] = 1;
      var curL = seed;
      for (j = 0; j < 6; j++) {
        var best = null, bd = 1e9;
        for (i = 0; i < dls.length; i++) {
          var c2 = dls[i];
          if (used[c2.slug]) continue;
          var dd2 = (c2.wx - curL.wx) * (c2.wx - curL.wx) + (c2.wy - curL.wy) * (c2.wy - curL.wy);
          if (dd2 < bd) { bd = dd2; best = c2; }
        }
        if (!best || bd > 260 * 260) break;
        tour.push(best); used[best.slug] = 1; curL = best;
      }
      if (tour.length >= 2) {
        var way2 = tour.map(function (r2) { return { x: r2.wx, y: r2.wy }; });
        way2.push({ x: seed.wx, y: seed.wy });
        var sm = catmull(way2, 6).map(function (q2) { return [q2.x, q2.y]; });
        put({ k: 'cat', x: seed.wx, y: seed.wy, yaw: 0,
          pb: polyBake(sm), sp: 2.1, ph: 0.8 });
      }
    }

    /* Gardeners kneel in the planted blocks, working the beds. */
    var gard = 0;
    for (i = 0; i < blds.length; i++) {
      var r3 = blds[i];
      if (r3.arch !== 'garden' || r3.derelict) continue;
      var h4 = r3.h32;
      if (rnd01(h4, 91) < 0.42 || gard >= 34) continue;
      gard++;
      /* kneel at the edge of the bed, on the path, working inward: a figure
         inside the lot would be painted over by its own planting */
      var gj = h4 % 4;
      var gox = FNL[gj][0] * (r3.hw + 2.3), goy = FNL[gj][1] * (r3.hd + 2.3);
      var gca = cos(r3.yaw), gsa = sin(r3.yaw);
      var gx = r3.wx + gox * gca - goy * gsa, gy = r3.wy + gox * gsa + goy * gca;
      put({ k: 'gard', x: gx, y: gy,
        yaw: Math.atan2(r3.wy - gy, r3.wx - gx), m: M_VAN0 + (h4 % 4), ph: rnd01(h4, 94) * TAU });
    }

    /* The night shift: every commit made between midnight and six in the
       morning left a moth at that page's lamp. 15 night edits on 12 pages. */
    if (PROV) {
      Object.keys(PROV).forEach(function (s) {
        var nn = PROV[s] && PROV[s].night;
        var lamp = lampOf[s];
        if (!nn || !lamp) return;
        for (i = 0; i < nn && i < 5; i++) {
          var h5 = hash32('moth' + s + i);
          put({ k: 'moth', x: lamp.x, y: lamp.y, z: lamp.h - 0.6,
            sp: 0.9 + rnd01(h5, 1) * 0.7, ph: rnd01(h5, 2) * TAU, ph2: rnd01(h5, 3) * TAU });
        }
      });
    }
  }

  function stepLife() {
    LT = reduced() ? 60000 : TNOW;
    WINDV = sin(LT * 0.00047) * 0.65 + sin(LT * 0.00131 + 2.1) * 0.35;
    var t = LT / 1000, i;
    for (i = 0; i < folk.length; i++) {
      var f = folk[i];
      if (f.k === 'walker') {
        var per = f.span * 2;
        var dd = (t * f.sp + f.off) % per;
        var fwdW = dd < f.span;
        var q = polyAt(f.pb, f.u0 + (fwdW ? dd : per - dd));
        f.x = q[0]; f.y = q[1];
        f.yaw = fwdW ? q[2] : q[2] + PI;
        f.gait = t * f.sp * 1.9 + f.ph;
      } else if (f.k === 'dvan') {
        var per2 = f.len + 90;                      /* the pause at the depot */
        var d2 = (t * f.sp + f.off) % per2;
        if (d2 > f.len) { f.alpha = 0; continue; }
        f.alpha = clamp(Math.min(d2 / 14, (f.len - d2) / 14), 0, 1);
        f.x = f.ax + f.ux * d2; f.y = f.ay + f.uy * d2;
        f.yaw = Math.atan2(f.uy, f.ux);
      } else if (f.k === 'pig') {
        var a1 = f.w1 * t * TAU + f.ph, a2 = f.w2 * t * TAU + f.ph * 1.7;
        f.x = f.ax + cos(a1) * f.rx; f.y = f.ay + sin(a2) * f.ry;
        f.yaw = Math.atan2(cos(a2) * f.w2 * f.ry, -sin(a1) * f.w1 * f.rx);
      } else if (f.k === 'cat') {
        var d3 = (t * f.sp) % f.pb.len;
        var q2 = polyAt(f.pb, d3);
        f.x = q2[0]; f.y = q2[1]; f.yaw = q2[2];
      }
    }
  }

  /* a walker is the parked pedestrian given a stride: two legs in
     counterphase, a slight bob in the coat, facing where it is going */
  function drawWalker(p, s, hB) {
    if (s * 3.4 < 2.0) return;
    propAO(p, 1.4, p._hz);
    var m = M_VAN0 + (p.hue % 4);
    if (p.hue === 4) m = M_AWN;
    var g = sin(p.gait);
    var ca = cos(p.yaw), sa = sin(p.yaw);
    if (s * 3.4 > 7) {
      miniBox(p.x + ca * g * 0.40, p.y + sa * g * 0.40, 0.26, 0.28, 0, 1.65, p.yaw, M_DARK, hB);
      miniBox(p.x - ca * g * 0.40, p.y - sa * g * 0.40, 0.26, 0.28, 0, 1.65, p.yaw, M_DARK, hB);
    } else {
      miniBox(p.x, p.y, 0.5, 0.42, 0, 1.6, p.yaw, M_DARK, hB);
    }
    var bob = 0.12 * abs(g);
    miniBox(p.x, p.y, 0.72, 0.55, 1.6 + bob, 3.6 + bob, p.yaw, m, hB);
    miniBox(p.x, p.y, 0.36, 0.34, 3.6 + bob, 4.6 + bob, p.yaw, M_TRIM, hB);
  }
  /* a delivery van out on the citation street, fading in at one depot and
     out at the other so it never pops */
  function drawDvan(p, s, hB) {
    if (p.alpha <= 0.02 || s * 4.6 < 2.2) return;
    ctx.globalAlpha = p.alpha;
    groundSprite(SPR.ao, p.x, p.y, 6.4, 0.30 * (1 - p._hz) * p.alpha);
    drawVan(p, s, hB);
    ctx.globalAlpha = 1;
  }
  /* a pigeon: a grey-blue crumb that walks its own wandering line and
     pecks between steps */
  function drawPig(p, s, hB) {
    if (s * 3.4 < 1.5) return;
    var peck = Math.max(0, sin(LT * 0.0052 + p.ph));
    miniBox(p.x, p.y, 0.34, 0.24, 0.08, 0.52, p.yaw, M_GLASS, hB);
    if (s * 3.4 > 4.2) {
      var ca = cos(p.yaw), sa = sin(p.yaw);
      var hz2 = 0.50 - peck * 0.30;
      miniBox(p.x + ca * 0.32, p.y + sa * 0.32, 0.13, 0.12, hz2, hz2 + 0.22, p.yaw, M_GLASS, hB);
    }
  }
  /* the cat: long, low, tail up, on its slow round of the empty plots */
  function drawCat(p, s, hB) {
    if (s * 3.4 < 2.2) return;
    propAO(p, 1.1, p._hz);
    var ca = cos(p.yaw), sa = sin(p.yaw);
    miniBox(p.x, p.y, 1.02, 0.32, 0.26, 0.84, p.yaw, M_DARK, hB);
    miniBox(p.x + ca * 0.94, p.y + sa * 0.94, 0.29, 0.29, 0.60, 1.16, p.yaw, M_DARK, hB);
    var sw = sin(LT * 0.003 + p.ph) * 0.35 + WINDV * 0.10;
    var tx0 = p.x - ca * 0.95, ty0 = p.y - sa * 0.95;
    if (!proj(tx0, ty0, 0.75)) return;
    var x0 = px, y0 = py;
    if (!proj(tx0 - ca * 0.35 - sa * sw, ty0 - sa * 0.35 + ca * sw, 1.85)) return;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(px, py);
    ctx.strokeStyle = faceCol(M_DARK, 1, 3, hB, 2);
    ctx.lineWidth = Math.max(0.4, 0.12 * s); ctx.lineCap = 'round'; ctx.stroke();
  }
  /* a gardener kneels over the bed, torso rocking with the work, one arm
     down in the planting */
  function drawGard(p, s, hB) {
    if (s * 3.4 < 2.2) return;
    propAO(p, 1.7, p._hz);
    var bob = sin(LT * 0.0021 + p.ph);
    var lean = 0.30 + 0.16 * bob;
    var ca = cos(p.yaw), sa = sin(p.yaw);
    miniBox(p.x, p.y, 0.62, 0.50, 0, 0.85, p.yaw, M_DARK, hB);
    miniBox(p.x + ca * lean, p.y + sa * lean, 0.60, 0.48, 0.85, 2.35, p.yaw, p.m, hB);
    miniBox(p.x + ca * (lean + 0.22), p.y + sa * (lean + 0.22), 0.30, 0.30, 2.35, 3.05, p.yaw, M_TRIM, hB);
    miniBox(p.x + ca * (lean + 0.22), p.y + sa * (lean + 0.22), 0.52, 0.52, 3.05, 3.24, p.yaw, M_STALL0 + 2, hB);
    if (s * 3.4 > 6) {
      var hx0 = p.x + ca * (lean + 0.50), hy0 = p.y + sa * (lean + 0.50);
      if (!proj(hx0, hy0, 2.0)) return;
      var x0 = px, y0 = py;
      if (!proj(hx0 + ca * (0.55 + 0.18 * bob), hy0 + sa * (0.55 + 0.18 * bob), 0.25)) return;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(px, py);
      ctx.strokeStyle = faceCol(p.m, 1, 4, hB, 2);
      ctx.lineWidth = Math.max(0.5, 0.22 * s); ctx.lineCap = 'round'; ctx.stroke();
    }
  }
  /* a moth: a pale flicker on a restless orbit around its lamp */
  function drawMoth(p, s, hB) {
    if (s * 2.2 < 1.0) return;
    var t = LT * 0.001 * p.sp + p.ph;
    var rr = 1.7 + 0.8 * sin(t * 1.9 + p.ph2);
    var wx = p.x + cos(t * 2.7) * rr, wy = p.y + sin(t * 2.7) * rr;
    var wz = p.z + sin(t * 3.4 + p.ph2) * 0.9;
    if (!proj(wx, wy, wz)) return;
    var w = clamp(0.62 * pS, 0.9, 4.6);
    var fl = 0.35 + 0.65 * abs(sin(LT * 0.03 + p.ph));
    ctx.globalAlpha = 0.85 * (1 - p._hz);
    ctx.fillStyle = 'rgba(255,240,210,0.92)';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - w, py - w * fl); ctx.lineTo(px - w * 0.3, py); ctx.closePath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + w, py - w * fl); ctx.lineTo(px + w * 0.3, py); ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /* ---------------------------------------------------------- labels */
  function rectsHit(a, b) {
    return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  }
  function drawLabels(avoid) {
    var i, j, shown = 0;
    var picks = [], placed = [];
    for (j = 0; j < (avoid ? avoid.length : 0); j++) placed.push(avoid[j]);
    for (i = 0; i < dists.length; i++) {
      var d = dists[i];
      var dd = depthOf(d.x, d.y, 0);
      if (dd < 60) continue;
      var scr = d.r * (FOC / dd);
      if (scr < 90 || scr > 760) continue;
      if (!proj(d.x, d.y, 26)) continue;
      if (px < 60 || px > W - 60 || py < HORY + 6 || py > H - 30) continue;
      picks.push({ d: d, x: px, y: py, dd: dd, scr: scr });
    }
    picks.sort(function (a, b) { return b.scr - a.scr; });
    ctx.textAlign = 'center';
    ctx.font = '600 11px "Archivo Narrow", Arial Narrow, sans-serif';
    for (i = 0; i < picks.length && shown < 5; i++) {
      var q = picks[i];
      var name = q.d.name.length > 30 ? q.d.name.slice(0, 29) + '…' : q.d.name;
      var tw = ctx.measureText(name).width + 18;
      /* the pill's real footprint decides collisions, with breathing room,
         so two long names never sit shingled over one another */
      var rect = { x0: q.x - tw / 2 - 8, y0: q.y - 13, x1: q.x + tw / 2 + 8, y1: q.y + 13 };
      var ok = true;
      for (j = 0; j < placed.length; j++) if (rectsHit(rect, placed[j])) { ok = false; break; }
      if (!ok) continue;
      placed.push(rect); shown++;
      var a = clamp(1 - hazeAt(q.dd) * 0.9, 0.45, 1);
      ctx.globalAlpha = a * 0.84;
      ctx.fillStyle = 'rgba(250,240,220,0.92)';
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

  /* Where the marker pill would sit, or null when it should not be shown:
     the building is off frame, too small in the frame to be the subject, or
     walled off behind something nearer. Solved before the labels are laid,
     so a district label never shingles under the pill. */
  function markerRect(r, sel) {
    if (!r || r.wx === undefined || r._vstamp !== FRAMEN) return null;
    if (r._scr < 18) return null;
    if (!proj(r.wx, r.wy, r.solidz)) return null;
    var ax2 = px, ay2 = py;
    if (ax2 < -80 || ax2 > W + 80 || ay2 < -60 || ay2 > H + 60) return null;
    /* what actually stands at the anchor: if a nearer building painted over
       it, the subject is hidden and a pill would float on a stranger's wall */
    var under = pick(ax2, Math.min(H - 2, ay2 + 2));
    if (under && under !== r.slug) {
      var o = rec[under];
      if (o && o._vstamp === FRAMEN && o._d < r._d * 0.985) return null;
    }
    var name = title(r.p);
    if (name.length > 34) name = name.slice(0, 33) + '…';
    ctx.font = '700 12.5px "Archivo", Arial, sans-serif';
    var tw = ctx.measureText(name).width + 22;
    var x = clamp(ax2, tw / 2 + 8, W - tw / 2 - 8);
    var yc2 = clamp(ay2 - 27, 17, H - 24);
    return { x0: x - tw / 2, y0: yc2 - 10.5, x1: x + tw / 2, y1: yc2 + 10.5,
             x: x, y: yc2, tw: tw, ax: ax2, ay: ay2, name: name, sel: sel };
  }
  function drawMarker(mr) {
    if (!mr) return;
    ctx.strokeStyle = mr.sel ? rgbs(C.sun) : 'rgba(250,240,220,0.85)';
    ctx.lineWidth = mr.sel ? 2 : 1.4;
    ctx.beginPath(); ctx.moveTo(mr.x, mr.y + 10); ctx.lineTo(mr.ax, mr.ay); ctx.stroke();
    ctx.fillStyle = mr.sel ? rgbs(C.sun) : 'rgba(250,240,220,0.94)';
    ctx.font = '700 12.5px "Archivo", Arial, sans-serif';
    rrect(mr.x - mr.tw / 2, mr.y - 10.5, mr.tw, 21, 10); ctx.fill();
    ctx.fillStyle = rgbs(C.ink);
    ctx.textAlign = 'center';
    ctx.fillText(mr.name, mr.x, mr.y + 4);
    ctx.textAlign = 'left';
  }

  /* --------------------------------------------- coarse occlusion grid */
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
    var mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    var iw = (x1 - x0) * 0.15, ih = (y1 - y0) * 0.28;
    return { x0: x0, y0: y0, x1: x1, y1: y1, ix0: mx - iw, iy0: my - ih, ix1: mx + iw, iy1: my + ih };
  }

  /* ---------------------------------------------------------- frame */
  var vis = [];
  function render() {
    var t0 = performance.now();
    TNOW = t0;
    FRAMEN++;
    stepLife();
    updateCam();
    /* a tooltip is anchored to a screen point: once the camera has moved
       from where it was raised, what stands under the cursor is re-read,
       and the tip is re-anchored to it or dismissed, never left frozen */
    if (hovered && hovCam &&
        (abs(cam.az - hovCam.az) > 0.004 || abs(cam.el - hovCam.el) > 0.004 ||
         abs(cam.dist - hovCam.dist) > hovCam.dist * 0.012 ||
         abs(cam.tx - hovCam.tx) > 3 || abs(cam.ty - hovCam.ty) > 3)) {
      var reSlug = (lastHx != null && !dragging) ? pick(lastHx, lastHy) : null;
      if (reSlug === hovered) snapHovCam();
      else setHover(reSlug);
    }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    bloom.length = 0; GSTRIPS = 0; NPART = 0; NFILL = 0; NGRAD = 0;

    var _p = PROF, _t = performance.now(), _m = _p ? function (k) { var n = performance.now(); _p[k] = (_p[k] || 0) + (n - _t); _t = n; } : function () { };
    drawSky(); _m('sky');
    planeStrips(SPR.tablePat, null, 0.75); _m('table');
    drawPaper(); _m('paper');
    /* the work lamp: a warm pool centred on the page, falling off onto the
       table, so the establishing shot reads as a lit workbench */
    if (paper) {
      ctx.globalCompositeOperation = 'lighter';
      groundSprite(SPR.warm, paper.cx, paper.cy, (paper.x1 - paper.x0) * 0.85, 0.10, W * W * 6);
      ctx.globalCompositeOperation = 'source-over';
    }
    drawTools();
    drawGroundDetail(); _m('ground');
    drawRoads(); _m('roads');
    drawWater(); _m('water');
    drawDistrictGround(); _m('sgrid');

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
      r._d = d; r.hz = hazeAt(d); r._scr = scr;
      r._area = Math.min(W * H, (Math.max(r.hw, r.hd) * 2 * (FOC / d)) * Math.max(6, r.topz * (FOC / d)));
      vis.push(r);
    }
    vis.sort(function (a, b) { return b._d - a._d; });
    if (vis.length > 180) vis.splice(0, vis.length - 180);

    occReset();
    var keep = [];
    for (i = vis.length - 1; i >= 0; i--) {
      var rv = vis[i];
      var sil = silhouette(rv);
      if (!sil) continue;
      rv._sil = sil;
      if (occCovered(sil.x0 - 2, sil.y0 - 2, sil.x1 + 2, sil.y1 + 2)) continue;
      rv._keep = 1;
      rv._vstamp = FRAMEN;
      keep.push(rv);
      if (rv.arch !== 'garden' && !rv.derelict &&
          (sil.ix1 - sil.ix0) > OCCS && (sil.iy1 - sil.iy0) > OCCS) {
        occMark(sil.ix0, sil.iy0, sil.ix1, sil.iy1);
      }
    }
    keep.reverse();
    vis = keep;
    _m('sort');

    castShadows(vis); _m('shadows');
    drawScrub(); _m('scrub');

    /* The detail budget goes to whatever is biggest in the frame, not to
       whatever is nearest: a tall tower two blocks back fills more of the
       picture than the shed at your feet, and it is the one that has to be
       built rather than left blank. The budget is spent in screen area, so a
       frame full of giants costs the same as a frame full of cottages. */
    var ranked = vis.slice().sort(function (a, b) { return b._scr - a._scr; });
    /* generous when the camera rests: the old 1.05 quota left the landmark
       tower of a mid-zoom shot as a blank slab while small near buildings
       spent the budget. Measured headroom allows it. */
    var quota = W * H * (dragging ? 0.45 : 2.0), spent = 0, cnt = 0, capN = dragging ? 14 : 44;
    for (i = 0; i < ranked.length; i++) {
      var q = ranked[i];
      q._q = (DBG === 2 ? false : (spent < quota && cnt < capN && q._scr > 16));
      if (q._q) { spent += q._area; cnt++; }
    }
    /* buildings and props interleave by the near face of each building,
       so whatever stands behind a wall is painted before the wall */
    gatherProps();
    var pvi = 0;
    for (i = 0; i < vis.length; i++) {
      var rb2 = vis[i];
      /* the exact near bound of the building's volume along the view axis:
         nothing with a depth beyond it can stand in front of any part of the
         building, so everything beyond it is painted first. The old fudge
         (0.9 of the widest half-extent) under-reached at glancing angles and
         let plaza props paint on top of the wall that hides them. */
      var caB = cos(rb2.yaw), saB = sin(rb2.yaw);
      var fu = abs(fwd[0] * caB + fwd[1] * saB), fv = abs(fwd[1] * caB - fwd[0] * saB);
      var dnear = rb2._d - rb2.hw * fu - rb2.hd * fv - Math.max(0, SE * rb2.topz * 0.6) - 2;
      while (pvi < propsVis.length && propsVis[pvi]._d > dnear) drawProp(propsVis[pvi++]);
      drawBuilding(rb2, rb2._q);
    }
    while (pvi < propsVis.length) drawProp(propsVis[pvi++]);
    _m('blds'); _m('props');

    var mrCur = (cur && rec[cur] && rec[cur].parts) ? markerRect(rec[cur], true) : null;
    var mrHov = (hovered && hovered !== cur && rec[hovered]) ? markerRect(rec[hovered], false) : null;
    var avoid = [];
    if (mrCur) avoid.push(mrCur);
    if (mrHov) avoid.push(mrHov);
    drawLabels(avoid);
    drawMarker(mrCur);
    drawMarker(mrHov);

    if (bloom.length) {
      ctx.globalCompositeOperation = 'lighter';
      for (i = 0; i < bloom.length; i++) {
        var bl = bloom[i];
        if (!bl[2]) continue;
        spriteAt(SPR.glint, bl[0], bl[1], bl[2], bl[2], bl[3]);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    if (sunAhead) {
      ctx.globalCompositeOperation = 'lighter';
      spriteAt(SPR.glow, sunSX, sunSY, Math.max(W, H) * 0.34, Math.max(W, H) * 0.28, 0.13);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.fillStyle = vigGrad; ctx.fillRect(0, 0, W, H);
    if (SPR.grainPat) {
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.09;
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

  /* The establishing shot: the whole model on its torn page, seen from the
     side the name is printed on, so a reader arriving cold sees at once what
     this is — a city built on a page of the documentation. The distance is
     solved rather than guessed, and re-solved whenever the frame changes
     shape, so widening the view actually shows more model. */
  function fitHome() {
    var el = 0.58, az = -PI / 2 + 0.26;
    var tx = bounds.cx, ty = bounds.cy;
    var span = bounds.r * 3;
    if (paper) {
      tx = (paper.x0 + paper.x1) / 2; ty = (paper.y0 + paper.y1) / 2;
      span = Math.max(paper.x1 - paper.x0, paper.y1 - paper.y0);
    }
    var probe = [], i;
    if (paper) {
      for (i = 0; i < paper.edge.length; i += 8) probe.push(paper.edge[i]);
      /* the printed name must stay clear of the HUD; the deckle may tuck
         behind it, the way a photograph lets the foreground bleed */
      probe.push({ x: paper.tx, y: paper.ty, strict: 1 });
      probe.push({ x: paper.tx + paper.tsize * 8.6, y: paper.sy, strict: 1 });
    } else probe.push({ x: bounds.cx, y: bounds.cy });

    var save = { az: cam.az, el: cam.el, dist: cam.dist, tx: cam.tx, ty: cam.ty };
    var hudEl = document.getElementById('hud');
    var BAR = (hudEl ? hudEl.offsetHeight : 100) + 6;
    var d = span * 0.36, tries;
    for (tries = 0; tries < 40; tries++) {
      cam.az = az; cam.el = el; cam.dist = d; cam.tx = tx; cam.ty = ty;
      updateCam();
      var ok = true, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, ys = -1e9;
      for (i = 0; i < probe.length; i++) {
        if (!proj(probe[i].x, probe[i].y, 0)) { ok = false; break; }
        if (px < x0) x0 = px; if (px > x1) x1 = px;
        if (py < y0) y0 = py;
        if (probe[i].strict) { if (py > ys) ys = py; }
        else if (py > y1) y1 = py;
      }
      /* a real bleed left and right is a photograph, not a diagram: the
         sheet fills the frame, the table is a border and not a subject */
      if (ok && x0 > -W * 0.085 && x1 < W * 1.085 && y0 > H * 0.012 &&
          ys < H - BAR - 14 && y1 < H + BAR * 0.9) break;
      d *= 1.06;
      if (d > span * 14) break;
    }
    HOME = { az: az, el: el, dist: d, tx: tx, ty: ty };
    cam.az = save.az; cam.el = save.el; cam.dist = save.dist; cam.tx = save.tx; cam.ty = save.ty;
    updateCam();
  }
  function homeShot() {
    fitHome();
    cam.az = camT.az = HOME.az; cam.el = camT.el = HOME.el;
    cam.dist = camT.dist = HOME.dist; cam.tx = camT.tx = HOME.tx; cam.ty = camT.ty = HOME.ty;
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
    /* Nothing took the click exactly. Rather than swallow it, fall back to
       the nearest silhouette the pointer is inside: a building too small to
       have painted a hit quad is still a building you meant to click. */
    var best = null, bestD = 1e9;
    for (i = vis.length - 1; i >= 0; i--) {
      var q = vis[i], s = q._sil;
      if (!s) continue;
      if (x < s.x0 - 3 || x > s.x1 + 3 || y < s.y0 - 3 || y > s.y1 + 3) continue;
      if (q._d < bestD) { bestD = q._d; best = q.slug; }
    }
    return best;
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
      var nm = d.name.length > 17 ? d.name.slice(0, 16) + '…' : d.name;
      return '<button data-d="' + d.i + '" title="Fly to ' + attr(d.name) + '">' + esc(nm) + '</button>';
    }).join('') + '<button data-d="' + (dists[dists.length - 1].orphan ? dists.length - 1 : 0) + '" title="Fly to the unlinked ground">Unlinked</button>';
    $('#notebtns').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var d = dists[+b.getAttribute('data-d')];
      flyTo(d.x, d.y, clamp(d.r * 1.9, 380, 1000), null, 0.235);
      touch();
    });

    var orph = dists[dists.length - 1].orphan ? dists[dists.length - 1].members.length : 0;
    $('#stats').innerHTML =
      '<span><b>' + order.length + '</b> pages</span><span><b>' + nfmt(G.edges.length) + '</b> citations</span>' +
      '<span><b>' + COM.length + '</b> districts</span>' +
      (orph ? '<span><b>' + orph + '</b> unfiled</span>' : '') +
      '<span>golden hour</span>';
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
    $('#cHome').onclick = function () { fitHome(); flyTo(HOME.tx, HOME.ty, HOME.dist, HOME.az, HOME.el, 1250); touch(); };

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

  var lastHx = null, lastHy = null;
  function hoverAt(e) {
    var r = cv.getBoundingClientRect();
    lastHx = e.clientX - r.left; lastHy = e.clientY - r.top;
    setHover(pick(lastHx, lastHy), e);
  }
  var hovCam = null;
  function snapHovCam() {
    hovCam = { az: cam.az, el: cam.el, dist: cam.dist, tx: cam.tx, ty: cam.ty };
  }
  function setHover(slug, e) {
    if (hovered === slug) { if (slug && e) { placeTip(e); snapHovCam(); } return; }
    hovered = slug;
    if (!slug) { hovCam = null; tipEl.classList.remove('on'); if (reduced()) paintNow(); return; }
    var r = rec[slug];
    $('.tt', tipEl).textContent = title(r.p);
    $('.tm', tipEl).textContent = ARCH[r.arch].name + ' · ' + ARCH[r.arch].mat + ' · ' +
      r.inb + ' in, ' + r.outb + ' out';
    tipEl.classList.add('on');
    snapHovCam();
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
    /* whatever was hovered belongs to the view being left behind */
    setHover(null);
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

  /* the sun-side azimuth whose sight line to the lot is least walled off
     by the neighbours: the camera must never park behind another building */
  function clearAz(r, dd2, el2) {
    var base = SUN_AZ + (rnd01(r.h32, 9) > 0.5 ? 0.72 : -0.72) + (rnd01(r.h32, 21) - 0.5) * 0.30;
    var cands = [base, base + 0.55, base - 0.55, base + 1.1, base - 1.1, base + 1.8, base - 1.8, base + PI];
    var ce2 = cos(el2), ez = dd2 * sin(el2);
    var sz0 = r.solidz * 0.5;
    var best = base, bestPen = Infinity, i, j, k2;
    /* judged from the far stand AND from close in, so zooming down the same
       ray never runs the camera into a neighbour that only blocks up close */
    var stands = [dd2, Math.min(150, dd2)];
    for (i = 0; i < cands.length; i++) {
      var az = cands[i];
      var pen = i * 30;                      /* all else equal, keep the sun side */
      for (k2 = 0; k2 < stands.length; k2++) {
        var ds = stands[k2];
        var ex2 = r.wx + cos(az) * ds * ce2, ey2 = r.wy + sin(az) * ds * ce2;
        var vx = ex2 - r.wx, vy = ey2 - r.wy, vl2 = vx * vx + vy * vy;
        var ezs = ds * sin(el2);
        for (j = 0; j < blds.length; j++) {
          var b = blds[j];
          if (b === r || b.wx === undefined) continue;
          var u = ((b.wx - r.wx) * vx + (b.wy - r.wy) * vy) / vl2;
          if (u < 0.03 || u > 0.98) continue;
          var qx = r.wx + vx * u - b.wx, qy = r.wy + vy * u - b.wy;
          /* not a thin ray but the middle of the frame: a neighbour a little
             off axis still walls off the picture when it is near the eye */
          var rad = Math.max(b.hw, b.hd) + 5 + u * ds * 0.22;
          var lat = sqrt(qx * qx + qy * qy);
          if (lat > rad) continue;
          var sightZ = sz0 + (ezs - sz0) * u;
          if (b.solidz + 2 < sightZ) continue;
          pen += (rad - lat) * (b.solidz - sightZ + 8);
        }
      }
      if (pen < bestPen) { bestPen = pen; best = az; }
      if (pen <= i * 30 + 0.001) break;      /* this line of sight is clear */
    }
    return best;
  }
  function locate(force) {
    var r = rec[cur];
    if (!r || !r.boxes) return;
    /* stand outside the lot and look back across the city, so the page is in
       the foreground and its neighbours fill the frame behind it; among the
       candidate stands, take the one nothing taller is standing in front of */
    var dd2 = clamp(r.solidz * 2.1 + 72, 165, 720);
    var el2 = 0.30;
    var az = clearAz(r, dd2, el2);
    /* a whisper off centre: a photograph, not a passport picture, but the
       building must stay the subject at every distance of the zoom ladder */
    var tx2 = r.wx - cos(az) * dd2 * 0.06, ty2 = r.wy - sin(az) * dd2 * 0.06;
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
    propAt: function (x, y) {
      var best = null, bd = 1e9, i;
      for (i = 0; i < propsVis.length; i++) {
        var p = propsVis[i];
        if (!proj(p.x, p.y, p.z || 4)) continue;
        var dd = (px - x) * (px - x) + (py - y) * (py - y);
        if (dd < bd) { bd = dd; best = { k: p.k, d: Math.round(p._d), sx: Math.round(px), sy: Math.round(py) }; }
      }
      return best;
    },
    bldAt: function (x, y) {
      var s2 = pick(x, y);
      if (!s2) return null;
      var r = rec[s2];
      return { slug: s2, d: Math.round(r._d || 0), solidz: Math.round(r.solidz), hw: Math.round(Math.max(r.hw, r.hd)) };
    },
    strips: function () { return GSTRIPS; },
    counts: function () { return { parts: NPART, faces: NFILL, grads: NGRAD, vis: vis.length }; },
    life: function () {
      var by = {}, i;
      for (i = 0; i < folk.length; i++) by[folk[i].k] = (by[folk[i].k] || 0) + 1;
      return { n: folk.length, by: by, wind: +WINDV.toFixed(3) };
    },
    propTotal: function () { return props.length; },
    projOf: function (x, y, z) {
      if (!proj(x, y, z || 0)) return null;
      return { x: Math.round(px), y: Math.round(py), s: +pS.toFixed(2) };
    },
    lifeSpots: function () {
      var out = {}, i;
      for (i = 0; i < folk.length; i++) {
        var f = folk[i];
        if (out[f.k]) continue;
        if (f.k === 'dvan' && f.alpha < 0.5) continue;
        out[f.k] = { k: f.k, x: +f.x.toFixed(1), y: +f.y.toFixed(1) };
      }
      return out;
    },
    moths: function () {
      var out = [], i;
      for (i = 0; i < folk.length; i++) {
        if (folk[i].k === 'moth') out.push([+folk[i].x.toFixed(1), +folk[i].y.toFixed(1), +folk[i].z.toFixed(1)]);
      }
      return out;
    },
    dbg: function (v) { DBG = v; paintNow(); },
    tile: function () { return SPR.paperTile ? SPR.paperTile.toDataURL() : null; },
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
      fitHome();
      if (!HOME) return null;
      fly = null;
      cam.az = camT.az = HOME.az; cam.el = camT.el = HOME.el;
      cam.dist = camT.dist = HOME.dist; cam.tx = camT.tx = HOME.tx; cam.ty = camT.ty = HOME.ty;
      paintNow();
      return HOME;
    },
    bounds: function () { return { cx: bounds.cx, cy: bounds.cy, r: bounds.r }; },
    at: function (slug) {
      var r = rec[slug];
      if (!r) return null;
      return { slug: slug, wx: r.wx, wy: r.wy, arch: r.arch, tier: r.tier, topz: r.topz, dist: r.dist ? r.dist.name : '' };
    },
    samples2: function () {
      var out = {}, i;
      for (i = 0; i < blds.length; i++) {
        var r = blds[i];
        var key = r.derelict ? 'derelict' : (r.arch === 'civic' && r.dist && r.dist.hub === r.slug && r.tier >= 4) ? 'campanile' : r.arch;
        if (!out[key] || r.tier > out[key].tier) out[key] = { slug: r.slug, tier: r.tier, topz: Math.round(r.topz) };
      }
      return out;
    },
    probe: function () {
      var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, i;
      for (i = 0; i < blds.length; i++) {
        var r = blds[i];
        if (r.wx - r.hw < x0) x0 = r.wx - r.hw; if (r.wx + r.hw > x1) x1 = r.wx + r.hw;
        if (r.wy - r.hd < y0) y0 = r.wy - r.hd; if (r.wy + r.hd > y1) y1 = r.wy + r.hd;
      }
      var area = 0;
      for (i = 0; i < blds.length; i++) area += blds[i].hw * blds[i].hd * 4;
      return {
        bounds: bounds, bldBox: [x0, y0, x1, y1],
        span: [x1 - x0, y1 - y0], footprintArea: Math.round(area),
        boxArea: Math.round((x1 - x0) * (y1 - y0)),
        fill: +(area / ((x1 - x0) * (y1 - y0))).toFixed(3),
        paper: paper ? [paper.x0, paper.y0, paper.x1, paper.y1] : null,
        dists: dists.map(function (d) { return [d.name.slice(0, 18), Math.round(d.x), Math.round(d.y), Math.round(d.r), d.size]; })
      };
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
