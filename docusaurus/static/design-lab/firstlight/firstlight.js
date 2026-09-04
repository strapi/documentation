/* =============================================================================
   FIRST LIGHT
   You are the first probe in an unmapped system. The Strapi documentation:
   290 bodies, 1231 transmissions. Nothing is drawn until it is measured.

   Every number, rhythm and size on screen derives from a real field in
   content.json, graph.json, communities.json or provenance.json.
   No external libraries. Canvas 2D + DOM. Phosphor amber and signal white
   on near-black; saturated color exists only inside the spectrograph.
   ============================================================================= */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DAY = 86400000;

  /* ------------------------------------------------------------ utilities */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function attr(s) { return esc(s); }
  function keep(h) { return h == null ? '' : String(h); } /* html fields arrive already safe */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function $(id) { return document.getElementById(id); }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function stripTags(h) {
    return String(h || '').replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ').trim();
  }
  function pad3(n) { return String(n).length >= 3 ? String(n) : ('00' + n).slice(-3); }
  function pad2(n) { return String(n).length >= 2 ? String(n) : ('0' + n).slice(-2); }
  function fmtN(n) { return Number(n || 0).toLocaleString('en-US'); }

  /* ------------------------------------------------------------ palette */
  var AMBER = [255, 176, 0];
  var AMBER_HI = [255, 210, 122];
  var WHITE = [237, 242, 240];
  var MINT = [90, 255, 200];
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

  /* ------------------------------------------------------------- state */

  var bundle = null, graph = null, comms = null, prov = null;
  var stars = [], byId = Object.create(null);
  var edges = [], adjIn = Object.create(null), adjOut = Object.create(null);
  var edgesOf = [];               /* per star: incident edge indices */
  var mutualEdge = null;          /* Uint8Array: this edge has a reverse twin */
  var inked = null;               /* Uint8Array per edge: permanently on the chart */
  var sections = [], clusters = [];
  var searchDocs = [];
  var URS1 = -1;                  /* index of the navigation pulsar */
  var EPOCH = 0;                  /* max provenance.last across the corpus */
  var ALL_AUTHORS = [];           /* the hands, union of provenance.authors */
  var TOTAL_WORDS = 0, DRIFT_N = 0, DARK_N = 0, FRESH_N = 0, NIGHT_EDITS = 0, NIGHT_PAGES = 0;

  var visited = new Set();        /* stars actually surveyed (opened) */
  var chartN = 0;                 /* stars with st===2 */
  var current = null, hovered = -1, matched = null;
  var laidOut = false, filedReady = false, dirty = true;
  var fullChart = false, almanac = false, darkAdapt = false;
  var completeShown = false;

  var ghost = null;               /* {x,y,label} pencil-ghosted destination */
  var transitAnim = null;         /* {t0, di} a body crossing the beacon's light */
  var transitTimer = 0;
  var BOOT_T = performance.now();

  var cam = { x: 0, y: 0, s: 0.85, tx: 0, ty: 0, ts: 0.85 };
  var canvas, ctx, DPR = 1, W = 0, H = 0;
  var scopeCv = null, specCv = null, photCv = null;

  window.__diag = { frameMs: 0, avgFrameMs: 0, state: 'boot' };

  /* --------------------------------------------------------------- boot */

  Promise.all([
    fetch('content.json').then(function (r) { return r.json(); }),
    fetch('graph.json').then(function (r) { return r.json(); }),
    fetch('communities.json').then(function (r) { return r.json(); }),
    fetch('provenance.json').then(function (r) { return r.json(); })
  ]).then(function (res) {
    bundle = res[0]; graph = res[1]; comms = res[2]; prov = res[3];
    prepare();
    buildIndexPanel();
    computeLayout(clusters, 'cited', 71130244);   /* measured positions first: the probe needs them now */
    stars.forEach(function (s) { s.x = s.pos.cited[0]; s.y = s.pos.cited[1]; });
    buildPickGrid();
    initCanvas();
    wireSky();
    wireChrome();
    initSearch();
    restore();
    laidOut = true;
    bootCamera();
    route();
    $('photom').hidden = false;
    document.documentElement.removeAttribute('data-boot');
    window.addEventListener('hashchange', route);
    loop();
    logLine('FIRST LIGHT · <b>' + stars.length + '</b> bodies predicted by the almanac · <b>1</b> contact', true);
    logLine('LOCK <b>' + stars[URS1].desig + '</b> ' + esc(stars[URS1].slug) + ' · <b>' + stars[URS1].m + '</b> inbound pulse trains · strongest emitter in system', true);
    if (visited.size === 0) showPrompt();
    /* the old atlas is computed while you listen; it is only consulted, never shown first */
    setTimeout(function () {
      computeLayout(sections, 'filed', 20260902);
      stars.forEach(function (s) { s.x = s.pos.cited[0]; s.y = s.pos.cited[1]; });
      buildPickGrid();
      filedReady = true;
      dirty = true;
    }, REDUCED ? 60 : 2600);
    /* transits are seeded early: the first dip comes even if you only listen */
    setTimeout(maybeTransit, REDUCED ? 1500 : 6500);
    transitTimer = setInterval(maybeTransit, 9500);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { dirty = true; });
  }).catch(function (e) {
    var p = $('page');
    $('reader').hidden = false;
    if (p) p.innerHTML = '<h1 class="title">Instrument failure</h1><p>' + esc(e && e.message) + '</p>';
  });

  /* -------------------------------------------------------- preparation */

  function prepare() {
    var seen = Object.create(null);
    bundle.nav.forEach(function (s) {
      var key = s.product + '|' + s.label;
      if (seen[key] === undefined) {
        seen[key] = sections.length;
        sections.push({ kind: 'section', idx: sections.length, key: key, label: s.label,
          product: s.product, members: [] });
      }
    });

    EPOCH = 0;
    Object.keys(prov).forEach(function (k) {
      var t = Date.parse(prov[k].last || 0);
      if (t > EPOCH) EPOCH = t;
    });

    var authorSet = Object.create(null);

    bundle.order.forEach(function (slug) {
      var p = bundle.pages[slug];
      if (!p) return;
      var key = p.product + '|' + p.section;
      var m = graph.inbound[slug] || 0;
      var pv = prov[slug] || { commits: 0, authors: [], topAuthor: '', first: '', last: '', night: 0, careDays: 0 };
      (pv.authors || []).forEach(function (a) { authorSet[a] = 1; });
      var freshDays = pv.last ? Math.round((EPOCH - Date.parse(pv.last)) / DAY) : 9999;
      var st = {
        slug: slug, page: p, m: m,
        out: graph.outbound[slug] || 0,
        words: graph.words[slug] || 0,
        code: graph.code[slug] || 0,
        secIdx: seen[key] !== undefined ? seen[key] : 0,
        comIdx: -1, drift: false,
        dark: m === 0,
        prov: pv, freshDays: freshDays, fresh: freshDays <= 30,
        st: 0,                      /* 0 unknown · 1 detected · 2 charted */
        pos: { filed: [0, 0], cited: [0, 0] },
        x: 0, y: 0, vx: 0, vy: 0, sx: 0, sy: 0,
        label: p.sidebarLabel || p.title, desig: ''
      };
      st.r = st.dark ? 2.1 : 2.0 + Math.sqrt(m) * 1.85;
      byId[slug] = stars.length;
      sections[st.secIdx].members.push(stars.length);
      stars.push(st);
      TOTAL_WORDS += st.words;
      if (st.dark) DARK_N++;
      if (st.fresh) FRESH_N++;
      NIGHT_EDITS += pv.night || 0;
      if ((pv.night || 0) > 0) NIGHT_PAGES++;
    });

    ALL_AUTHORS = Object.keys(authorSet).sort(function (a, b) {
      return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
    });

    edgesOf = stars.map(function () { return []; });
    graph.edges.forEach(function (e) {
      var a = byId[e[0]], b = byId[e[1]];
      if (a === undefined || b === undefined || a === b) return;
      var k = edges.length;
      edges.push([a, b]);
      edgesOf[a].push(k); edgesOf[b].push(k);
      (adjOut[a] || (adjOut[a] = [])).push(b);
      (adjIn[b] || (adjIn[b] = [])).push(a);
    });
    inked = new Uint8Array(edges.length);
    mutualEdge = new Uint8Array(edges.length);
    var eset = Object.create(null);
    edges.forEach(function (e, k) { eset[e[0] + '|' + e[1]] = k; });
    edges.forEach(function (e, k) { if (eset[e[1] + '|' + e[0]] !== undefined) mutualEdge[k] = 1; });

    comms.forEach(function (c, i) {
      var cl = { kind: 'cluster', idx: i, label: '', members: [],
        hub: c.hub, purity: c.purity, dominant: c.dominant, size: c.size };
      c.members.forEach(function (slug) {
        var j = byId[slug];
        if (j === undefined) return;
        stars[j].comIdx = i;
        cl.members.push(j);
        if (stars[j].page.section !== c.dominant) { stars[j].drift = true; DRIFT_N++; }
      });
      var hub = byId[c.hub] !== undefined ? stars[byId[c.hub]] : null;
      cl.label = hub ? (hub.page.sidebarLabel || hub.page.title) : c.dominant;
      clusters.push(cl);
    });
    var loose = { kind: 'cluster', idx: clusters.length, label: 'Unclassified', members: [],
      hub: null, purity: null, dominant: null, size: 0, loose: true };
    stars.forEach(function (s, i) { if (s.comIdx === -1) { s.comIdx = loose.idx; loose.members.push(i); } });
    loose.size = loose.members.length;
    clusters.push(loose);

    /* designations: luminous bodies ranked by measured emission, dark bodies by estimated mass */
    var lum = [], dark = [];
    stars.forEach(function (s, i) { (s.dark ? dark : lum).push(i); });
    lum.sort(function (a, b) { return stars[b].m - stars[a].m || (stars[a].slug < stars[b].slug ? -1 : 1); });
    dark.sort(function (a, b) { return stars[b].words - stars[a].words || (stars[a].slug < stars[b].slug ? -1 : 1); });
    lum.forEach(function (i, k) { stars[i].desig = 'URS-' + pad3(k + 1); });
    dark.forEach(function (i, k) { stars[i].desig = 'URS-DARK-' + pad2(k + 1); });
    URS1 = lum[0];

    $('cm-total').textContent = stars.length;
    $('ix-count').textContent = stars.length;

    stars.forEach(function (st, i) {
      var p = st.page;
      var head = p.headings.map(function (h) { return h.text; }).join(' ');
      var body = blockText(p.blocks, []).join(' ').slice(0, 9000);
      searchDocs.push({
        i: i, title: p.title || '',
        low: (p.title + ' ' + (p.sidebarLabel || '') + ' ' + (p.description || '') + ' ' +
              (p.tags || []).join(' ') + ' ' + p.section + ' ' + st.slug).toLowerCase(),
        headLow: head.toLowerCase(), body: body, bodyLow: body.toLowerCase()
      });
    });

    $('howto-facts').innerHTML =
      'MEASURED, NEVER GUESSED · ' + stars.length + ' bodies · ' + edges.length +
      ' transmissions · ' + DARK_N + ' silent bodies · ' + DRIFT_N + ' ephemeris errors · ' +
      FRESH_N + ' fresh signals (&le;30 days) · ' + NIGHT_EDITS + ' night edits on ' + NIGHT_PAGES +
      ' pages · ' + ALL_AUTHORS.length + ' hands · ' + fmtN(TOTAL_WORDS) + ' words of system mass';
  }

  function blockText(blocks, out) {
    if (!blocks) return out;
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i]; if (!b || !b.t) continue;
      switch (b.t) {
        case 'p': case 'tldr': out.push(stripTags(b.html)); break;
        case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': out.push(b.text); break;
        case 'ul': case 'ol':
          b.items.forEach(function (it) {
            if (typeof it === 'string') out.push(stripTags(it));
            else { out.push(stripTags(it.html)); blockText(it.blocks, out); }
          });
          break;
        case 'code': out.push(b.code); break;
        case 'table':
          out.push(b.head.map(stripTags).join(' '));
          b.rows.forEach(function (r) { out.push(r.map(stripTags).join(' ')); });
          break;
        case 'admonition': case 'details': out.push(b.title || b.summary || ''); blockText(b.blocks, out); break;
        case 'tabs': b.tabs.forEach(function (t) { out.push(t.label); blockText(t.blocks, out); }); break;
        case 'columns': b.cols.forEach(function (c) { blockText(Array.isArray(c) ? c : (c.blocks || []), out); }); break;
        case 'cards': b.items.forEach(function (c) { out.push(stripTags(c.title) + ' ' + stripTags(c.desc)); }); break;
        case 'img': out.push(b.alt || ''); out.push(stripTags(b.caption)); break;
        case 'badge': out.push(b.label || ''); break;
        case 'endpoint':
          out.push((b.method || '') + ' ' + (b.path || '') + ' ' + (b.title || '') + ' ' + stripTags(b.description));
          (b.params || []).forEach(function (p) { out.push(p.name + ' ' + stripTags(p.desc)); });
          (b.codeTabs || []).forEach(function (c) { out.push(c.code); });
          break;
      }
    }
    return out;
  }

  /* ------------------------------------------------ the frozen layouts */
  /* Unchanged layout mathematics from the engraved atlas: the sky itself
     did not move; only what we can see of it did. */

  function computeLayout(groups, key, seed) {
    var rnd = mulberry32(seed);

    groups.forEach(function (g) {
      g.rad = 30 + Math.sqrt(Math.max(1, g.members.length)) * 31;
    });
    var sorted = groups.slice().sort(function (a, b) { return b.members.length - a.members.length; });
    sorted.forEach(function (g, i) {
      var a = i * 2.399963229728653, rr = 118 * Math.sqrt(i);
      g.ax = Math.cos(a) * rr; g.ay = Math.sin(a) * rr;
    });
    for (var it = 0; it < 900; it++) {
      for (var i = 0; i < groups.length; i++) {
        for (var j = i + 1; j < groups.length; j++) {
          var A = groups[i], B = groups[j];
          var dx = B.ax - A.ax, dy = B.ay - A.ay;
          var d = Math.sqrt(dx * dx + dy * dy) || 0.001;
          var want = A.rad + B.rad + 8;
          if (d < want) {
            var push = (want - d) / d * 0.5;
            A.ax -= dx * push; A.ay -= dy * push;
            B.ax += dx * push; B.ay += dy * push;
          }
        }
      }
      for (i = 0; i < groups.length; i++) { groups[i].ax *= 0.9975; groups[i].ay *= 0.9975; }
    }

    var of = Object.create(null);
    groups.forEach(function (g) { g.members.forEach(function (m) { of[m] = g; }); });
    var live = [];
    stars.forEach(function (s, i) {
      var g = of[i]; if (!g) return;
      if (s.dark) return;
      var a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * g.rad * 0.72;
      s.x = g.ax + Math.cos(a) * rr; s.y = g.ay + Math.sin(a) * rr;
      s.vx = 0; s.vy = 0; s.mass = 1 + Math.sqrt(s.m) * 0.5;
      live.push(i);
    });

    var liveEdges = edges.filter(function (e) { return !stars[e[0]].dark && !stars[e[1]].dark; });
    var ITER = 330, REP = 2100, SPRING = 0.014, IDEAL = 78, DAMP = 0.82;
    for (it = 0; it < ITER; it++) {
      var alpha = 1 - it / ITER, n = live.length, a, b, dx, dy, d2, d, f;
      for (i = 0; i < n; i++) {
        a = stars[live[i]];
        for (j = i + 1; j < n; j++) {
          b = stars[live[j]];
          dx = a.x - b.x; dy = a.y - b.y;
          d2 = dx * dx + dy * dy;
          if (d2 < 1e-4) { dx = rnd() - 0.5; dy = rnd() - 0.5; d2 = 0.25; }
          if (d2 > 260000) continue;
          d = Math.sqrt(d2);
          f = (REP * a.mass * b.mass * (of[live[i]] === of[live[j]] ? 1 : 1.9)) / d2;
          if (f > 42) f = 42;
          dx /= d; dy /= d;
          a.vx += dx * f; a.vy += dy * f;
          b.vx -= dx * f; b.vy -= dy * f;
        }
      }
      for (i = 0; i < liveEdges.length; i++) {
        a = stars[liveEdges[i][0]]; b = stars[liveEdges[i][1]];
        var same = of[liveEdges[i][0]] === of[liveEdges[i][1]];
        dx = b.x - a.x; dy = b.y - a.y;
        d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        f = (d - IDEAL) * SPRING * (same ? 1 : 0.13);
        dx = dx / d * f; dy = dy / d * f;
        a.vx += dx * b.mass / (a.mass + b.mass) * 2;
        a.vy += dy * b.mass / (a.mass + b.mass) * 2;
        b.vx -= dx * a.mass / (a.mass + b.mass) * 2;
        b.vy -= dy * a.mass / (a.mass + b.mass) * 2;
      }
      for (i = 0; i < n; i++) {
        a = stars[live[i]];
        var g = of[live[i]];
        var gx = a.x - g.ax, gy = a.y - g.ay;
        var gd = Math.sqrt(gx * gx + gy * gy);
        var pull = 0.034 + (gd > g.rad ? 0.09 : 0);
        a.vx -= gx * pull; a.vy -= gy * pull;
      }
      for (i = 0; i < n; i++) {
        a = stars[live[i]];
        a.vx *= DAMP; a.vy *= DAMP;
        var sp = Math.hypot(a.vx, a.vy), cap = 26 * (0.25 + alpha);
        if (sp > cap) { a.vx = a.vx / sp * cap; a.vy = a.vy / sp * cap; }
        a.x += a.vx; a.y += a.vy;
      }
    }

    /* silent bodies ride at the margin of their group, outward */
    groups.forEach(function (g) {
      var cited = g.members.filter(function (m) { return !stars[m].dark; });
      var cx = 0, cy = 0;
      if (cited.length) {
        cited.forEach(function (m) { cx += stars[m].x; cy += stars[m].y; });
        cx /= cited.length; cy /= cited.length;
      } else { cx = g.ax; cy = g.ay; }
      var rr = 40;
      cited.forEach(function (m) { rr = Math.max(rr, Math.hypot(stars[m].x - cx, stars[m].y - cy)); });
      var outward = Math.atan2(cy, cx);
      var un = g.members.filter(function (m) { return stars[m].dark; });
      un.sort(function (a, b) { return stars[a].slug < stars[b].slug ? -1 : 1; });
      var span = Math.min(Math.PI * 1.5, 0.5 + un.length * 0.19);
      un.forEach(function (m, k) {
        var t = un.length === 1 ? 0 : (k / (un.length - 1) - 0.5) * 2;
        var ang = outward + t * span / 2;
        var rad = rr + 30 + (k % 2) * 15;
        stars[m].x = cx + Math.cos(ang) * rad;
        stars[m].y = cy + Math.sin(ang) * rad;
      });
    });

    var minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    stars.forEach(function (s) {
      minx = Math.min(minx, s.x); maxx = Math.max(maxx, s.x);
      miny = Math.min(miny, s.y); maxy = Math.max(maxy, s.y);
    });
    var ox = (minx + maxx) / 2, oy = (miny + maxy) / 2;
    var Rx = Math.max(1, (maxx - minx) / 2), Ry = Math.max(1, (maxy - miny) / 2);
    var k = 980 / Math.max(Rx, Ry * 1.45);
    stars.forEach(function (s) {
      s.x = (s.x - ox) * k * 1.32; s.y = (s.y - oy) * k;
      s.pos[key][0] = s.x; s.pos[key][1] = s.y;
    });
    groups.forEach(function (g) {
      g.px = g.px || {};
      var cx = 0, cy = 0;
      g.members.forEach(function (m) { cx += stars[m].x; cy += stars[m].y; });
      if (g.members.length) { cx /= g.members.length; cy /= g.members.length; }
      g.px[key] = [cx, cy];
    });
  }

  /* --------------------------------------------------------- pick grid */

  var grid = null, GRID = 90, gminx = 0, gminy = 0, gcols = 0, grows = 0;
  function buildPickGrid() {
    var minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    stars.forEach(function (s) {
      minx = Math.min(minx, s.x); miny = Math.min(miny, s.y);
      maxx = Math.max(maxx, s.x); maxy = Math.max(maxy, s.y);
    });
    gminx = minx - 10; gminy = miny - 10;
    gcols = Math.ceil((maxx - gminx + 20) / GRID) + 1;
    grows = Math.ceil((maxy - gminy + 20) / GRID) + 1;
    grid = new Array(gcols * grows);
    stars.forEach(function (s, i) {
      var c = Math.floor((s.x - gminx) / GRID), r = Math.floor((s.y - gminy) / GRID);
      var k = r * gcols + c;
      (grid[k] || (grid[k] = [])).push(i);
    });
  }
  function pickable(i) {
    var s = stars[i];
    if (fullChart) return true;
    if (s.st > 0) return true;
    if (darkAdapt && (s.prov.night || 0) > 0) return true;
    return false;
  }
  function pick(wx, wy, tol) {
    if (!grid) return -1;
    var c0 = Math.floor((wx - gminx - tol) / GRID), c1 = Math.floor((wx - gminx + tol) / GRID);
    var r0 = Math.floor((wy - gminy - tol) / GRID), r1 = Math.floor((wy - gminy + tol) / GRID);
    var best = -1, bestD = Infinity;
    for (var r = r0; r <= r1; r++) {
      if (r < 0 || r >= grows) continue;
      for (var c = c0; c <= c1; c++) {
        if (c < 0 || c >= gcols) continue;
        var cell = grid[r * gcols + c]; if (!cell) continue;
        for (var i = 0; i < cell.length; i++) {
          if (!pickable(cell[i])) continue;
          var s = stars[cell[i]];
          var d = Math.hypot(s.x - wx, s.y - wy);
          var hit = Math.max(s.r + 6, tol * 0.6);
          if (s.dark && s.st === 1) hit = Math.max(hit, 22);
          if (d < hit && d < bestD) { bestD = d; best = cell[i]; }
        }
      }
    }
    return best;
  }

  /* ------------------------------------------------------------- canvas */

  function initCanvas() {
    canvas = $('sky');
    ctx = canvas.getContext('2d', { alpha: false });
    scopeCv = null; specCv = null;
    photCv = $('photcv');
    resize();
    window.addEventListener('resize', function () { resize(); dirty = true; });
  }
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  }
  function readerOpen() { return current != null && W > 900; }
  function readerW() { return Math.min(720, W * 0.52); }
  function viewCX() {
    var right = readerOpen() ? readerW() : 0;
    return (W - right) / 2;
  }
  function availW() {
    var right = readerOpen() ? readerW() : 0;
    return Math.max(220, W - right);
  }
  function w2s(x, y) { return [(x - cam.x) * cam.s + viewCX(), (y - cam.y) * cam.s + H / 2]; }
  function s2w(x, y) { return [(x - viewCX()) / cam.s + cam.x, (y - H / 2) / cam.s + cam.y]; }

  function bootCamera() {
    if (chartN > 1) { fitVisible(true); return; }
    var s = stars[URS1];
    cam.x = cam.tx = s.pos.cited[0]; cam.y = cam.ty = s.pos.cited[1];
    cam.s = cam.ts = 0.9;
  }
  function fitVisible(instant) {
    var minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity, any = false;
    stars.forEach(function (s) {
      if (!fullChart && s.st === 0) return;
      any = true;
      minx = Math.min(minx, s.pos.cited[0]); maxx = Math.max(maxx, s.pos.cited[0]);
      miny = Math.min(miny, s.pos.cited[1]); maxy = Math.max(maxy, s.pos.cited[1]);
    });
    if (!any) { bootCamera(); return; }
    cam.tx = (minx + maxx) / 2; cam.ty = (miny + maxy) / 2;
    cam.ts = clamp(Math.min(availW() / (maxx - minx + 220), (H - 130) / (maxy - miny + 190)), 0.05, 1.6);
    if (instant || REDUCED) { cam.x = cam.tx; cam.y = cam.ty; cam.s = cam.ts; }
    dirty = true;
  }
  function ensureVisible() {
    if (current == null || !stars[current]) return;
    var s = stars[current], p = w2s(s.x, s.y);
    var R = (readerOpen() ? W - readerW() : W) - 30;
    if (p[0] > 30 && p[0] < R && p[1] > 70 && p[1] < H - 60) return;
    cam.tx = s.x; cam.ty = s.y;
    if (cam.ts < 0.5) cam.ts = 0.7;
    if (REDUCED) { cam.x = cam.tx; cam.y = cam.ty; cam.s = cam.ts; }
    dirty = true;
  }

  /* -------------------------------------------------------- persistence */

  var SAVE_KEY = 'firstlight.survey.v1';
  var saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        var c = [], d = [], v = [];
        stars.forEach(function (s) {
          if (s.st === 2) c.push(s.slug);
          else if (s.st === 1) d.push(s.slug);
        });
        visited.forEach(function (i) { v.push(stars[i].slug); });
        localStorage.setItem(SAVE_KEY, JSON.stringify({ c: c, d: d, v: v, done: completeShown }));
      } catch (e) { /* private window: the chart lives only for this session */ }
    }, 350);
  }
  function restore() {
    var data = null;
    try { data = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { data = null; }
    if (data) {
      (data.c || []).forEach(function (slug) { var i = byId[slug]; if (i !== undefined) { stars[i].st = 2; } });
      (data.d || []).forEach(function (slug) { var i = byId[slug]; if (i !== undefined && stars[i].st < 1) stars[i].st = 1; });
      (data.v || []).forEach(function (slug) { var i = byId[slug]; if (i !== undefined) visited.add(i); });
      completeShown = !!data.done;
    }
    /* URS-001 transmits from the first second, always */
    if (stars[URS1].st < 2) stars[URS1].st = 2;
    chartN = 0;
    stars.forEach(function (s) { if (s.st === 2) chartN++; });
    inkRecompute();
    updateMeter();
    if (visited.size > 0) {
      logLine('CHART RESTORED · <b>' + chartN + '</b>/' + stars.length + ' bodies on file · ' + visited.size + ' surveys logged', true);
    }
  }
  function resetSurvey() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    location.hash = '';
    location.reload();
  }

  /* ---------------------------------------------------------- discovery */

  function inkRecompute() {
    for (var k = 0; k < edges.length; k++) {
      var a = edges[k][0], b = edges[k][1];
      inked[k] = (stars[a].st === 2 && stars[b].st === 2 && (visited.has(a) || visited.has(b))) ? 1 : 0;
    }
  }

  function neighborsOf(i) {
    var out = [], seen = Object.create(null);
    (adjIn[i] || []).forEach(function (j) { if (!seen[j]) { seen[j] = 1; out.push(j); } });
    (adjOut[i] || []).forEach(function (j) { if (!seen[j]) { seen[j] = 1; out.push(j); } });
    return out;
  }

  /* opening a page IS the survey: reading expands the navigable system */
  function survey(i) {
    var s = stars[i];
    var newly = [];
    var firstVisit = !visited.has(i);
    if (s.st < 2) { s.st = 2; chartN++; newly.push(i); }
    visited.add(i);

    var nbrs = neighborsOf(i);
    nbrs.forEach(function (n) {
      if (!stars[n].dark && stars[n].st < 2) { stars[n].st = 2; chartN++; newly.push(n); }
    });
    /* faint echoes one ring further: detected, not yet charted */
    newly.forEach(function (n) {
      neighborsOf(n).forEach(function (q) {
        if (stars[q].st === 0 && !stars[q].dark) stars[q].st = 1;
      });
    });
    inkRecompute();

    if (firstVisit) {
      var pv = s.prov;
      logLine('SURVEY <b>' + s.desig + '</b> ' + esc(s.slug) +
        ' · <b>' + fmtN(s.words) + '</b> words · <b>' + s.m + '</b> in / <b>' + s.out + '</b> out' +
        ' · ' + pv.commits + ' commits · ' + (pv.authors || []).length + ' hands · ' + pv.careDays + ' days of care', true);
      if (s.fresh) logLine('SIGNAL FRESH · last transmission ' + s.freshDays + ' day' + (s.freshDays === 1 ? '' : 's') + ' before survey epoch');
      var tri = newly.length - (newly[0] === i ? 1 : 0);
      if (tri > 0) logLine('TRIANGULATED · <b>' + tri + '</b> new bod' + (tri === 1 ? 'y' : 'ies') + ' fixed from the transmissions heard at ' + s.desig);
      if (s.dark) {
        logLine('FIRST CONTACT · <b>' + s.desig + '</b> · 0 inbound citations · original surveyor ' + esc(pv.topAuthor || 'unknown'), true);
        showPlaque(i);
        audioContact();
      } else {
        audioCore(i);
      }
      /* a fresh survey is also when the photometer catches the next transit */
      setTimeout(maybeTransit, REDUCED ? 200 : 1400);
    }

    hidePrompt();
    updateMeter();
    renderInstruments(i);
    save();
    checkComplete();
    dirty = true;
  }

  /* -------------------------------------------------------- transits */

  function darkPool() {
    var out = [];
    stars.forEach(function (s, i) { if (s.dark && s.st === 0) out.push(i); });
    return out;
  }
  function beaconIdx() { return current != null ? current : URS1; }

  function maybeTransit() {
    if (transitAnim) return;
    if (document.hidden) return;
    var pool = darkPool();
    if (!pool.length) return;
    var b = stars[beaconIdx()];
    pool.sort(function (p, q) {
      return Math.hypot(stars[p].x - b.x, stars[p].y - b.y) - Math.hypot(stars[q].x - b.x, stars[q].y - b.y);
    });
    var di = pool[0];
    if (REDUCED) { transitLand(di); return; }
    transitAnim = { t0: performance.now(), di: di, dur: 1800 };
    dirty = true;
  }
  function transitLand(di) {
    var s = stars[di];
    if (s.st !== 0) { dirty = true; return; } /* already contacted while the dip was in flight */
    s.st = 1;
    var b = stars[beaconIdx()];
    logLine('TRANSIT EVENT · non-emitting body crossed the line of sight to <b>' + b.desig +
      '</b> · no citation signature · est. mass ~' + fmtN(s.words) + ' words · designation <b>' + s.desig + '</b>', true);
    audioThud();
    save();
    dirty = true;
  }

  /* ------------------------------------------------------------- loop */

  var lastTick = 0, needPhot = true;
  function loop(ts) {
    requestAnimationFrame(loop);
    if (!laidOut) return;
    ts = ts || performance.now();
    var t0 = performance.now();

    if (transitAnim && ts - transitAnim.t0 >= transitAnim.dur) {
      var di = transitAnim.di;
      transitAnim = null;
      transitLand(di);
    }

    var e = REDUCED ? 1 : 0.13;
    var dx = cam.tx - cam.x, dy = cam.ty - cam.y, ds = cam.ts - cam.s;
    var moving = Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2 || Math.abs(ds) > 0.0004;
    if (moving) { cam.x += dx * e; cam.y += dy * e; cam.s += ds * e; dirty = true; }

    /* the transmission itself: pulses ride the rays every frame */
    if (!REDUCED) dirty = true;

    if (dirty) {
      draw(ts);
      dirty = false;
    }
    if (!REDUCED || needPhot) { drawPhotometer(ts); drawScope(ts); needPhot = false; }

    if (ts - lastTick > 980) { lastTick = ts; tickClock(); }

    var ft = performance.now() - t0;
    var D = window.__diag;
    D.frameMs = ft;
    D.avgFrameMs = D.avgFrameMs ? D.avgFrameMs * 0.95 + ft * 0.05 : ft;
    D.state = moving ? 'warp'
      : fullChart ? 'fullchart'
      : almanac ? 'almanac'
      : darkAdapt ? 'darkadapt'
      : current != null ? 'survey' : 'listening';
  }

  function tickClock() {
    var t = Math.floor((performance.now() - BOOT_T) / 1000);
    $('clock').textContent = 'T+' + Math.floor(t / 60) + ':' + pad2(t % 60);
  }

  /* ------------------------------------------------------------ drawing */

  function draw(now) {
    if (!ctx) return;
    var i, s, n = stars.length;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = '#060809';
    ctx.fillRect(0, 0, W, H);

    var dimAll = darkAdapt ? 0.22 : 1;

    for (i = 0; i < n; i++) {
      s = stars[i];
      var p = w2s(s.x, s.y);
      s.sx = p[0]; s.sy = p[1];
    }

    graticule(dimAll);
    if (almanac && filedReady) drawAlmanac(now, dimAll);
    drawEdges(now, dimAll);
    drawPulseTrains(now, dimAll);
    drawBodies(now, dimAll);
    if (darkAdapt) drawNightBloom(now);
    drawGhost(now);
    drawReticle(now);
    drawLabels(dimAll);
    if (transitAnim) drawTransitFlash(now);
  }

  /* the ruling of an instrument, not a nebula: hairline rings and spokes */
  function graticule(dim) {
    ctx.save();
    ctx.strokeStyle = rgba(AMBER, 0.05 * dim);
    ctx.lineWidth = 1;
    var rings = [340, 680, 1020, 1360];
    for (var r = 0; r < rings.length; r++) {
      var a0 = w2s(-rings[r] * 1.32, -rings[r]);
      var a1 = w2s(rings[r] * 1.32, rings[r]);
      var w = (a1[0] - a0[0]) / 2, h = (a1[1] - a0[1]) / 2;
      if (w < 6 || h < 6) continue;
      ctx.beginPath();
      ctx.ellipse((a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2, w, h, 0, 0, 6.2832);
      ctx.stroke();
    }
    var c = w2s(0, 0);
    ctx.strokeStyle = rgba(AMBER, 0.035 * dim);
    for (var k = 0; k < 12; k++) {
      var t = k / 12 * Math.PI * 2;
      var e2 = w2s(Math.cos(t) * 1500 * 1.32, Math.sin(t) * 1500);
      ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(e2[0], e2[1]); ctx.stroke();
    }
    ctx.restore();
  }

  /* the onboard almanac: where the catalog compiled back home says
     every body should be. 86 of them are not there. */
  function drawAlmanac(now, dim) {
    ctx.save();
    var i, s, n = stars.length;
    ctx.strokeStyle = rgba(AMBER, 0.26 * dim);
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    for (i = 0; i < n; i++) {
      s = stars[i];
      var g = w2s(s.pos.filed[0], s.pos.filed[1]);
      if (g[0] < -30 || g[0] > W + 30 || g[1] < -30 || g[1] > H + 30) continue;
      ctx.beginPath();
      ctx.arc(g[0], g[1], Math.max(2, 3 * cam.s), 0, 6.2832);
      ctx.stroke();
    }
    /* residual vectors: prediction against measurement, flagged in the open */
    ctx.strokeStyle = rgba(AMBER_HI, 0.4 * dim);
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    for (i = 0; i < n; i++) {
      s = stars[i];
      if (!s.drift) continue;
      var a = w2s(s.pos.filed[0], s.pos.filed[1]);
      var b = w2s(s.pos.cited[0], s.pos.cited[1]);
      if ((a[0] < -60 && b[0] < -60) || (a[0] > W + 60 && b[0] > W + 60)) continue;
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    /* the 18 sections of the old catalog, named in engraved caps */
    ctx.font = '500 12px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = rgba(AMBER, 0.5 * dim);
    for (i = 0; i < sections.length; i++) {
      var gS = sections[i];
      if (!gS.px || !gS.px.filed) continue;
      var c = w2s(gS.px.filed[0], gS.px.filed[1]);
      if (c[0] < -120 || c[0] > W + 120 || c[1] < -40 || c[1] > H + 40) continue;
      ctx.fillText(gS.label.toUpperCase().split('').join(' ') + ' · ' + gS.members.length, c[0], c[1]);
    }
    /* ephemeris error tags near the worst residuals, when zoomed in */
    if (cam.s > 0.55) {
      ctx.font = '500 8.5px "IBM Plex Mono", monospace';
      ctx.fillStyle = rgba(AMBER_HI, 0.6 * dim);
      var shown = 0;
      for (i = 0; i < n && shown < 42; i++) {
        s = stars[i];
        if (!s.drift) continue;
        var gp = w2s(s.pos.filed[0], s.pos.filed[1]);
        if (gp[0] < 10 || gp[0] > W - 60 || gp[1] < 60 || gp[1] > H - 10) continue;
        ctx.fillText('EPH ERR', gp[0] + 7, gp[1] - 5);
        shown++;
      }
    }
    ctx.textAlign = 'left';
    ctx.restore();
  }

  function drawEdges(now, dim) {
    var margin = 90;
    var anchor = hovered >= 0 && stars[hovered].st > 0 ? hovered : current;
    var dimP = new Path2D(), hotP = new Path2D(), binP = new Path2D();
    var anyDim = false, anyHot = false, anyBin = false;
    for (var k = 0; k < edges.length; k++) {
      var vis = fullChart || inked[k];
      if (!vis) continue;
      var a = stars[edges[k][0]], b = stars[edges[k][1]];
      if ((a.sx < -margin && b.sx < -margin) || (a.sx > W + margin && b.sx > W + margin) ||
          (a.sy < -margin && b.sy < -margin) || (a.sy > H + margin && b.sy > H + margin)) continue;
      var isHot = anchor != null && (edges[k][0] === anchor || edges[k][1] === anchor);
      if (isHot) { hotP.moveTo(a.sx, a.sy); hotP.lineTo(b.sx, b.sy); anyHot = true; }
      else if (mutualEdge[k] && inked[k]) { binP.moveTo(a.sx, a.sy); binP.lineTo(b.sx, b.sy); anyBin = true; }
      else { dimP.moveTo(a.sx, a.sy); dimP.lineTo(b.sx, b.sy); anyDim = true; }
    }
    ctx.lineWidth = 1;
    if (anyDim) {
      ctx.strokeStyle = rgba(AMBER, (fullChart ? 0.10 : 0.16) * dim);
      ctx.stroke(dimP);
    }
    if (anyBin) { /* co-orbiting binaries: mutual citations read a shade warmer */
      ctx.strokeStyle = rgba(AMBER_HI, 0.30 * dim);
      ctx.stroke(binP);
    }
    if (anyHot) {
      ctx.strokeStyle = rgba(WHITE, 0.42 * dim);
      ctx.stroke(hotP);
    }
  }

  /* the beacon's pulse trains: one train per real inbound citation.
     Sources not yet charted arrive as bearings out of the dark. */
  function drawPulseTrains(now, dim) {
    var b = beaconIdx();
    if (b == null || stars[b].st < 2) return;
    var srcs = adjIn[b] || [];
    if (!srcs.length) return;
    var B = stars[b];
    var period = 2600;
    ctx.save();
    ctx.lineWidth = 1;
    for (var k = 0; k < srcs.length; k++) {
      var S = stars[srcs[k]];
      var known = S.st >= 2;
      var dx = B.x - S.x, dy = B.y - S.y;
      var d = Math.hypot(dx, dy) || 1;
      var rayLen = known ? d : Math.min(260, d * 0.85);
      var sx = B.x - dx / d * rayLen, sy = B.y - dy / d * rayLen;
      var p0 = w2s(sx, sy), p1 = w2s(B.x, B.y);
      ctx.strokeStyle = known ? rgba(AMBER, 0.10 * dim) : rgba(WHITE, 0.07 * dim);
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
      if (!REDUCED) {
        var phase = ((srcs[k] * 2654435761 >>> 0) % 1000) / 1000;
        var t = ((now / period) + phase) % 1;
        var bx = p0[0] + (p1[0] - p0[0]) * t, by = p0[1] + (p1[1] - p0[1]) * t;
        ctx.fillStyle = rgba(WHITE, (0.25 + 0.65 * t) * dim);
        ctx.fillRect(bx - 1, by - 1, 2.4, 2.4);
      } else {
        /* calm variant: a fixed mark one third along each bearing */
        var mx = p0[0] + (p1[0] - p0[0]) * 0.67, my = p0[1] + (p1[1] - p0[1]) * 0.67;
        ctx.fillStyle = rgba(WHITE, 0.4 * dim);
        ctx.fillRect(mx - 1, my - 1, 2, 2);
      }
    }
    /* the beacon breathes at its own pulse count, not on a designer's whim:
       ring radius steps once per train arrival cycle */
    if (!REDUCED) {
      var rt = (now % period) / period;
      var rr = Math.max(10, B.r * cam.s * 2) + rt * 26;
      ctx.strokeStyle = rgba(AMBER, (1 - rt) * 0.35 * dim);
      ctx.beginPath(); ctx.arc(B.sx, B.sy, rr, 0, 6.2832); ctx.stroke();
    }
    ctx.restore();
  }

  function drawBodies(now, dim) {
    var n = stars.length, i, s;
    var tw = now / 120;
    for (i = 0; i < n; i++) {
      s = stars[i];
      if (s.sx < -30 || s.sx > W + 30 || s.sy < -30 || s.sy > H + 30) continue;
      var known = s.st === 2 || fullChart;
      var detected = s.st === 1;
      if (!known && !detected) continue;

      var on = 1;
      if (matched) on = matched.has(i) ? 1 : 0.14;
      if (fullChart && s.st < 2) on *= 0.55;   /* the full chart shows all; your own chart reads brighter */
      on *= dim;

      var rr = Math.max(1, s.r * cam.s);

      if (detected && !known) {
        if (s.dark) drawTransitEllipse(i, now, on);
        else {
          /* a faint contact: heard, not yet resolved */
          ctx.strokeStyle = rgba(WHITE, 0.35 * on);
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(s.sx, s.sy, 2.2, 0, 6.2832); ctx.stroke();
        }
        continue;
      }

      if (s.dark) {
        /* charted dark body: an open circle. Nothing cites it; it is on
           your chart because you went there. */
        ctx.strokeStyle = rgba(WHITE, 0.8 * on);
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.arc(s.sx, s.sy, Math.max(2.4, rr * 1.4), 0, 6.2832); ctx.stroke();
        ctx.setLineDash([]);
        continue;
      }

      var col = i === current ? WHITE : AMBER;
      var alpha = 0.95;
      if (s.fresh && !REDUCED) alpha = 0.66 + 0.32 * Math.sin(tw + i * 1.7); /* fresh signal flickers */

      if (s.m >= 4) {
        ctx.globalAlpha = clamp(on * alpha, 0, 1);
        ctx.fillStyle = rgba(col, 1);
        ctx.beginPath(); ctx.arc(s.sx, s.sy, rr, 0, 6.2832); ctx.fill();
        if (s.m >= 15 && cam.s > 0.12) {
          ctx.strokeStyle = rgba(col, 0.5);
          ctx.lineWidth = 1;
          var ray = rr * 2.4;
          ctx.beginPath();
          ctx.moveTo(s.sx - ray, s.sy); ctx.lineTo(s.sx + ray, s.sy);
          ctx.moveTo(s.sx, s.sy - ray); ctx.lineTo(s.sx, s.sy + ray);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = clamp(on * alpha, 0, 1);
        ctx.strokeStyle = rgba(col, 0.95);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(s.sx, s.sy, Math.max(1.5, rr), 0, 6.2832); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      /* the fresh tick: edited within 30 days of the survey epoch */
      if (s.fresh && cam.s > 0.3) {
        ctx.strokeStyle = rgba(MINT, 0.75 * on);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.sx + rr + 3, s.sy - rr - 3); ctx.lineTo(s.sx + rr + 7, s.sy - rr - 7);
        ctx.stroke();
      }
      /* your own measurements, marked on the full chart */
      if (fullChart && s.st === 2) {
        ctx.strokeStyle = rgba(AMBER, 0.7 * dim);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.sx - 3, s.sy + rr + 4); ctx.lineTo(s.sx + 3, s.sy + rr + 4);
        ctx.stroke();
      }
    }
  }

  function drawTransitEllipse(i, now, on) {
    var s = stars[i];
    var wob = REDUCED ? 1 : 1 + 0.07 * Math.sin(now / 700 + i);
    var ang = ((i * 2654435761 >>> 0) % 628) / 100;
    ctx.save();
    ctx.strokeStyle = rgba(WHITE, 0.55 * on);
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.ellipse(s.sx, s.sy, 17 * wob, 10 * wob, ang, 0, 6.2832);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = rgba(WHITE, 0.5 * on);
    ctx.fillRect(s.sx - 1, s.sy - 1, 2, 2);
    if (cam.s > 0.4) {
      ctx.font = '500 8.5px "IBM Plex Mono", monospace';
      ctx.fillStyle = rgba(WHITE, 0.55 * on);
      ctx.fillText('UNRESOLVED', s.sx + 20, s.sy - 8);
    }
    ctx.restore();
  }

  /* the fifteen night edits bloom cold blue-green when your eyes adjust */
  function drawNightBloom(now) {
    var pulse = REDUCED ? 1 : 0.82 + 0.18 * Math.sin(now / 900);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var nn = s.prov.night || 0;
      if (!nn) continue;
      if (s.sx < -60 || s.sx > W + 60 || s.sy < -60 || s.sy > H + 60) continue;
      var R = (7 + nn * 5) * pulse;
      ctx.fillStyle = rgba(MINT, 0.10);
      ctx.beginPath(); ctx.arc(s.sx, s.sy, R * 2.2, 0, 6.2832); ctx.fill();
      ctx.fillStyle = rgba(MINT, 0.20);
      ctx.beginPath(); ctx.arc(s.sx, s.sy, R * 1.3, 0, 6.2832); ctx.fill();
      ctx.fillStyle = rgba(MINT, 0.9);
      ctx.beginPath(); ctx.arc(s.sx, s.sy, 2.2, 0, 6.2832); ctx.fill();
      if (cam.s > 0.35) {
        ctx.font = '500 8.5px "IBM Plex Mono", monospace';
        ctx.fillStyle = rgba(MINT, 0.8);
        ctx.fillText(nn + ' NIGHT EDIT' + (nn === 1 ? '' : 'S'), s.sx + R * 1.4 + 4, s.sy + 3);
      }
    }
  }

  /* the pencil ghost: where the search or the warp is taking you */
  function drawGhost(now) {
    if (!ghost) return;
    var p = w2s(ghost.x, ghost.y);
    var sp = REDUCED ? 0 : (now % 1400) / 1400;
    ctx.save();
    ctx.strokeStyle = rgba(WHITE, 0.5);
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -sp * 8;
    ctx.beginPath(); ctx.arc(p[0], p[1], 14, 0, 6.2832); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(p[0] - 22, p[1]); ctx.lineTo(p[0] - 16, p[1]);
    ctx.moveTo(p[0] + 16, p[1]); ctx.lineTo(p[0] + 22, p[1]);
    ctx.moveTo(p[0], p[1] - 22); ctx.lineTo(p[0], p[1] - 16);
    ctx.moveTo(p[0], p[1] + 16); ctx.lineTo(p[0], p[1] + 22);
    ctx.stroke();
    if (ghost.label) {
      ctx.font = '500 9.5px "IBM Plex Mono", monospace';
      ctx.fillStyle = rgba(WHITE, 0.6);
      ctx.fillText(ghost.label, p[0] + 20, p[1] - 18);
    }
    ctx.restore();
    /* the ghost dissolves once the probe has arrived */
    if (Math.hypot(cam.x - cam.tx, cam.y - cam.ty) < 4 && !ghost.hold) ghost = null;
  }

  function drawReticle(now) {
    if (current == null || !stars[current]) return;
    var s = stars[current];
    var R = Math.max(12, s.r * cam.s * 3);
    ctx.strokeStyle = rgba(WHITE, 0.9);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(s.sx, s.sy, R, 0, 6.2832); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s.sx - R - 7, s.sy); ctx.lineTo(s.sx - R - 2, s.sy);
    ctx.moveTo(s.sx + R + 2, s.sy); ctx.lineTo(s.sx + R + 7, s.sy);
    ctx.moveTo(s.sx, s.sy - R - 7); ctx.lineTo(s.sx, s.sy - R - 2);
    ctx.moveTo(s.sx, s.sy + R + 2); ctx.lineTo(s.sx, s.sy + R + 7);
    ctx.stroke();
  }

  function drawLabels(dim) {
    ctx.font = '500 10.5px "IBM Plex Mono", monospace';
    ctx.textBaseline = 'middle';
    var placed = [];
    function fits(x, y, w) {
      for (var q = 0; q < placed.length; q++) {
        var p = placed[q];
        if (x < p[0] + p[2] + 5 && x + w + 5 > p[0] && y < p[1] + p[3] && y + 15 > p[1]) return false;
      }
      placed.push([x, y, w, 15]); return true;
    }
    var order = [], i, s;
    for (i = 0; i < stars.length; i++) {
      s = stars[i];
      if (s.st < 2 && !fullChart) continue;
      if (s.sx < 4 || s.sx > W - 4 || s.sy < 60 || s.sy > H - 8) continue;
      var prio = -1;
      if (i === current) prio = 1000;
      else if (i === hovered) prio = 999;
      else if (matched) prio = matched.has(i) ? 300 + s.m : -1;
      else if (i === URS1) prio = 500;
      else if (s.m >= 11 || (cam.s > 0.55 && s.m >= 6) || (cam.s > 1.1 && s.m >= 2) || cam.s > 2.0) prio = s.m + (s.dark ? 0.5 : 0);
      else if (s.dark && s.st === 2 && cam.s > 0.7) prio = 1;
      if (prio >= 0) order.push([prio, i]);
    }
    order.sort(function (a, b) { return b[0] - a[0]; });
    var cap = fullChart ? 240 : 90;
    for (var q = 0; q < order.length && q < cap; q++) {
      i = order[q][1]; s = stars[i];
      var txt = s.label.length > 32 ? s.label.slice(0, 31) + '…' : s.label;
      var w = ctx.measureText(txt).width;
      var off = Math.max(6, s.r * cam.s) + 7;
      var lx = s.sx + off, ly = s.sy;
      if (lx + w > W - 6) lx = s.sx - w - off;
      if (!fits(lx, ly - 7, w)) continue;
      var a = (i === current || i === hovered) ? 0.95 : (s.st === 2 ? 0.72 : 0.4);
      ctx.fillStyle = i === current ? rgba(WHITE, 0.95) : rgba(AMBER_HI, a * dim);
      ctx.fillText(txt, lx, ly);
    }
    ctx.textBaseline = 'alphabetic';
  }

  function drawTransitFlash(now) {
    /* while the photometer dips, a thin occlusion bar crosses the beacon */
    var b = stars[beaconIdx()];
    var k = clamp((now - transitAnim.t0) / transitAnim.dur, 0, 1);
    var R = Math.max(14, b.r * cam.s * 3.4);
    var x = b.sx - R + 2 * R * k;
    ctx.strokeStyle = rgba(WHITE, 0.5 * Math.sin(k * Math.PI));
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, b.sy - R); ctx.lineTo(x, b.sy + R);
    ctx.stroke();
  }

  /* ------------------------------------------------- HUD: photometer ---- */

  function drawPhotometer(now) {
    if (!photCv) return;
    var g = photCv.getContext('2d');
    var PW = photCv.width, PH = photCv.height;
    g.fillStyle = '#04090A';
    g.fillRect(0, 0, PW, PH);
    var b = beaconIdx();
    if (b == null) return;
    var B = stars[b];
    $('ph-target').textContent = B.desig + ' · ' + B.m + ' TRAINS';
    var base = PH * 0.42;
    g.strokeStyle = rgba(AMBER, 0.9);
    g.lineWidth = 1;
    g.beginPath();
    var period = 2600;
    var window_ = 6000; /* six seconds of light on screen */
    var trains = adjIn[b] || [];
    for (var x = 0; x < PW; x++) {
      var tAt = now - (PW - x) * (window_ / PW);
      var v = 0;
      /* each inbound citation is one train; its pulse phase is fixed by identity */
      for (var k = 0; k < trains.length; k++) {
        var phase = ((trains[k] * 2654435761 >>> 0) % 1000) / 1000;
        var tt = ((tAt / period) + phase) % 1;
        if (tt < 0.03) v += 1;
      }
      var y = base - Math.min(v, 6) * 2.6;
      /* the transit dip: a clean notch while a dark body crosses */
      if (transitAnim) {
        var kk = (tAt - transitAnim.t0) / transitAnim.dur;
        if (kk > 0 && kk < 1) y += Math.sin(kk * Math.PI) * PH * 0.30;
      }
      if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
    /* graduation ticks */
    g.strokeStyle = rgba(WHITE, 0.14);
    g.beginPath();
    for (var gx = 0; gx < PW; gx += PW / 12) { g.moveTo(gx, PH - 5); g.lineTo(gx, PH); }
    g.stroke();
  }

  /* --------------------------------------------- HUD: instrument suite -- */

  function renderInstruments(i) {
    var s = stars[i];
    var p = s.prov;
    var cl = clusters[s.comIdx];
    var maxWords = 0;
    for (var k = 0; k < stars.length; k++) if (stars[k].words > maxWords) maxWords = stars[k].words;
    var o = [];
    o.push('<div class="in-desig">' + esc(s.desig) + (s.drift ? ' · EPHEMERIS ERROR' : '') + '</div>');
    o.push('<div class="in-title">' + esc(s.page.title) + '</div>');

    o.push('<div class="in-k">EMISSION <b>' + s.m + ' IN / ' + s.out + ' OUT</b></div>');
    o.push('<canvas id="scopecv" width="264" height="56"></canvas>');

    o.push('<div class="in-k">SPECTRUM <b>' + (cl.loose ? 'UNCLASSIFIED' : 'CLASS C' + pad2(s.comIdx + 1)) + '</b></div>');
    o.push('<canvas id="speccv" width="264" height="46"></canvas>');
    o.push('<div class="in-row"><span>' + (cl.loose
      ? 'no citation community claimed this body'
      : 'purity <b>' + cl.purity.toFixed(2) + '</b> · ' + cl.members.length + ' members · hub ' + esc(cl.label)) + '</span></div>');

    o.push('<div class="in-k">EST. MASS <b>' + fmtN(s.words) + ' WORDS</b></div>');
    o.push('<div class="in-bar"><i style="width:' + Math.max(1, Math.round(s.words / maxWords * 100)) + '%"></i></div>');
    o.push('<div class="in-row"><span>' + s.code + ' code block' + (s.code === 1 ? '' : 's') + '</span><span>heaviest in system: ' + fmtN(maxWords) + '</span></div>');

    o.push('<div class="in-k">SIGNAL</div>');
    o.push('<div class="in-row"><span>last transmission</span><b>' + (p.last || 'unknown') + '</b></div>');
    o.push('<div class="in-row"><span>' + s.freshDays + ' day' + (s.freshDays === 1 ? '' : 's') + ' before survey epoch</span>' +
      (s.fresh ? '<span class="fresh">FRESH</span>' : '') + '</div>');

    o.push('<div class="in-k">CORE SAMPLE <b>' + p.commits + ' STRATA</b></div>');
    var layers = Math.min(p.commits, 64);
    var nightLayers = Math.min(p.night || 0, layers);
    var strata = '<div class="strata">';
    for (var L = 0; L < layers; L++) {
      var h = 30 + ((L * 2654435761 >>> 0) % 70);
      strata += '<i' + (L >= layers - nightLayers ? ' class="n"' : '') + ' style="height:' + h + '%"></i>';
    }
    strata += '</div>';
    o.push(strata);
    o.push('<div class="in-row"><span>first ' + esc(p.first || '—') + '</span><span>last ' + esc(p.last || '—') + '</span></div>');
    o.push('<div class="in-row"><span>days of care</span><b>' + p.careDays + '</b></div>');
    if (p.night) o.push('<div class="in-row"><span class="fresh">' + p.night + ' commit' + (p.night === 1 ? '' : 's') + ' made at night</span></div>');

    o.push('<div class="in-k">CREW REGISTER <b>' + (p.authors || []).length + ' HAND' + ((p.authors || []).length === 1 ? '' : 'S') + '</b></div>');
    o.push('<div class="crew">');
    (p.authors || []).forEach(function (a) {
      o.push('<div class="crew-row"><b>' + esc(a) + '</b>' +
        (a === p.topAuthor ? '<span class="ca">CHIEF SURVEYOR</span>' : '') + '</div>');
    });
    o.push('<div class="crew-row"><span>active</span><span>' + esc(p.first || '—') + ' → ' + esc(p.last || '—') + '</span></div>');
    o.push('</div>');

    if (audioOn) o.push('<button class="btn in-listen" id="listenbtn">PLAY CORE SAMPLE · ' + p.commits + ' PINGS / 4 S</button>');

    $('inst-inner').innerHTML = o.join('');
    $('inst').hidden = false;
    scopeCv = $('scopecv');
    specCv = $('speccv');
    drawScope(performance.now());
    drawSpectrograph(i);
    var lb = $('listenbtn');
    if (lb) lb.addEventListener('click', function () { audioCore(i, true); });
    needPhot = true;
  }

  function drawScope(now) {
    if (!scopeCv || current == null) return;
    var s = stars[current];
    var g = scopeCv.getContext('2d');
    var PW = scopeCv.width, PH = scopeCv.height;
    g.fillStyle = '#04090A';
    g.fillRect(0, 0, PW, PH);
    var base = PH * 0.55;
    g.strokeStyle = rgba(WHITE, 0.16);
    g.beginPath(); g.moveTo(0, base); g.lineTo(PW, base); g.stroke();
    /* inbound trains: one upward spike per page that cites this body */
    var mIn = s.m;
    g.strokeStyle = rgba(AMBER, 0.95);
    g.beginPath();
    var pad = 8;
    for (var k = 0; k < mIn; k++) {
      var x = mIn === 1 ? PW / 2 : pad + k * (PW - 2 * pad) / (mIn - 1);
      g.moveTo(x, base); g.lineTo(x, base - PH * 0.42);
    }
    g.stroke();
    /* outbound corridors: one downward tick per page it links to */
    g.strokeStyle = rgba(WHITE, 0.5);
    g.beginPath();
    for (k = 0; k < s.out; k++) {
      var x2 = s.out === 1 ? PW / 2 : pad + k * (PW - 2 * pad) / Math.max(1, s.out - 1);
      g.moveTo(x2, base); g.lineTo(x2, base + PH * 0.24);
    }
    g.stroke();
    if (mIn === 0) {
      g.font = '500 9px "IBM Plex Mono", monospace';
      g.fillStyle = rgba(WHITE, 0.55);
      g.fillText('FLATLINE · NO INBOUND CITATIONS', 10, base - 10);
    }
    /* the sweep */
    if (!REDUCED) {
      var sx = ((now % 2600) / 2600) * PW;
      g.strokeStyle = rgba(WHITE, 0.35);
      g.beginPath(); g.moveTo(sx, 2); g.lineTo(sx, PH - 2); g.stroke();
    }
  }

  /* the one saturated place: 27 communities as 27 spectral classes.
     Emission lines are deterministic per class; noise floor is impurity. */
  function drawSpectrograph(i) {
    if (!specCv) return;
    var s = stars[i];
    var cl = clusters[s.comIdx];
    var g = specCv.getContext('2d');
    var PW = specCv.width, PH = specCv.height;
    g.fillStyle = '#04090A';
    g.fillRect(0, 0, PW, PH);
    if (cl.loose) {
      g.font = '500 9px "IBM Plex Mono", monospace';
      g.fillStyle = rgba(WHITE, 0.5);
      g.fillText('NO CLASS · CONTINUUM ONLY', 10, PH / 2 + 3);
      g.strokeStyle = rgba(WHITE, 0.2);
      g.beginPath(); g.moveTo(0, PH * 0.8); g.lineTo(PW, PH * 0.8); g.stroke();
      return;
    }
    var hue = Math.round(s.comIdx / clusters.length * 360);
    var purity = cl.purity != null ? cl.purity : 0.5;
    var rnd = mulberry32(7919 * (s.comIdx + 1));
    var lines = Math.min(cl.members.length, 40); /* one emission line per member, capped by the slit */
    for (var k = 0; k < lines; k++) {
      var x = Math.floor(rnd() * PW);
      var strong = k < 5;
      g.strokeStyle = 'hsla(' + hue + ',88%,' + (strong ? 62 : 48) + '%,' + (strong ? 0.95 : 0.55) + ')';
      g.lineWidth = strong ? 2 : 1;
      g.beginPath(); g.moveTo(x, 3); g.lineTo(x, PH - 3); g.stroke();
    }
    /* impurity smears the spectrum: scattered white grains, counted from (1 - purity) */
    var noise = Math.round((1 - purity) * 90);
    g.fillStyle = rgba(WHITE, 0.5);
    for (k = 0; k < noise; k++) {
      g.fillRect(rnd() * PW, rnd() * PH, 1, 1);
    }
    g.lineWidth = 1;
  }

  /* ----------------------------------------------------------- mission log */

  var logN = 0;
  function logLine(html, ev) {
    var el = $('log');
    var t = Math.floor((performance.now() - BOOT_T) / 1000);
    var div = document.createElement('div');
    div.className = 'll' + (ev ? ' ev' : '');
    div.innerHTML = '<span class="t">T+' + Math.floor(t / 60) + ':' + pad2(t % 60) + '</span> ' + html;
    el.appendChild(div);
    logN++;
    while (el.children.length > 40) el.removeChild(el.firstChild);
  }

  function updateMeter() {
    $('cm-n').textContent = pad3(chartN);
    $('cm-fill').style.width = (chartN / stars.length * 100) + '%';
  }

  function showPrompt() {
    var s = stars[URS1];
    $('prompt-sub').textContent = s.m + ' PULSE TRAINS ARRIVING AT ' + s.desig + ' · CLICK THE BEACON · OR PRESS / TO SEARCH';
    $('prompt').hidden = false;
  }
  function hidePrompt() { $('prompt').hidden = true; }

  /* ------------------------------------------------------ plaque + plate */

  var plaqueTimer = null;
  function showPlaque(i) {
    var s = stars[i], p = s.prov;
    $('pq-title').textContent = s.page.title;
    $('pq-line1').innerHTML = esc(s.desig) + ' · ' + esc(s.slug) + '<br>est. mass <b>' + fmtN(s.words) +
      '</b> words · <b>0</b> inbound citations · ' + p.commits + ' commits · ' + p.careDays + ' days of care';
    $('pq-line2').innerHTML = 'ORIGINAL SURVEYOR · <b>' + esc(p.topAuthor || 'unknown') + '</b>' +
      ((p.authors || []).length > 1 ? ' · with ' + ((p.authors || []).length - 1) + ' other hand' + ((p.authors || []).length > 2 ? 's' : '') : '');
    $('plaque').hidden = false;
    clearTimeout(plaqueTimer);
    plaqueTimer = setTimeout(function () { $('plaque').hidden = true; }, REDUCED ? 6000 : 5200);
  }

  function checkComplete() {
    if (chartN < stars.length || completeShown) return;
    completeShown = true;
    $('cp-big').textContent = chartN + '/' + stars.length;
    $('cp-sub').innerHTML = '<b>' + fmtN(edges.length) + '</b> transmissions charted · <b>' +
      fmtN(TOTAL_WORDS) + '</b> words of system mass · <b>' + DARK_N + '</b> silent bodies logged by transit';
    $('cp-hands').textContent = 'AFTER ' + ALL_AUTHORS.length + ' HANDS';
    $('cp-names').innerHTML = ALL_AUTHORS.map(function (a) { return '<span>' + esc(a) + '</span>'; }).join('');
    $('plate').hidden = false;
    logLine('SURVEY COMPLETE · <b>' + chartN + '/' + stars.length + '</b> · after ' + ALL_AUTHORS.length + ' hands', true);
    save();
  }

  /* --------------------------------------------------------------- audio */
  /* Optional garnish. Silent by default; nothing depends on it.
     Every ping is one commit; night commits ring one octave lower. */

  var AC = null, audioOn = false;
  function ensureAC() {
    if (AC) return true;
    try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; }
    return !!AC;
  }
  function ping(freq, when, vol) {
    if (!AC) return;
    var o = AC.createOscillator(), g = AC.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.16);
    o.connect(g); g.connect(AC.destination);
    o.start(when); o.stop(when + 0.2);
  }
  function audioCore(i, force) {
    if (!audioOn || !AC) return;
    var p = stars[i].prov;
    var n = Math.max(1, p.commits);
    var shown = Math.min(n, 64);
    var nightShown = Math.min(p.night || 0, shown);
    var t0 = AC.currentTime + 0.05;
    for (var k = 0; k < shown; k++) {
      var frac = shown <= 1 ? 0 : k / (shown - 1);
      var isNight = k >= shown - nightShown;
      ping(isNight ? 330 : 660, t0 + frac * 4, 0.05);
    }
  }
  function audioThud() { if (audioOn && AC) ping(110, AC.currentTime + 0.02, 0.09); }
  function audioContact() {
    if (!audioOn || !AC) return;
    ping(523, AC.currentTime + 0.02, 0.07);
    ping(660, AC.currentTime + 0.3, 0.07);
  }

  /* -------------------------------------------------- sky interaction */

  var tipEl = null;
  function showTip(s, x, y) {
    tipEl = tipEl || $('tooltip');
    var body;
    if (s.dark && s.st < 2) {
      body = '<b>UNRESOLVED BODY</b><span class="dg">' + esc(s.desig) + '</span>' +
        '<span>no citation signature · est. mass ~' + fmtN(s.words) + ' words</span>' +
        '<span class="dr">intercept to make first contact</span>';
    } else if (s.st < 2 && !fullChart && !(darkAdapt && s.prov.night)) {
      body = '<b>FAINT CONTACT</b><span>heard in another body\'s transmissions · not yet resolved</span>';
    } else {
      var cl = clusters[s.comIdx];
      body = '<b>' + esc(s.page.title) + '</b><span class="dg">' + esc(s.desig) + '</span>' +
        '<span>' + s.m + ' in / ' + s.out + ' out · ' + fmtN(s.words) + ' words</span>' +
        '<span>' + (cl.loose ? 'unclassified' : 'class C' + pad2(s.comIdx + 1) + ' · purity ' + cl.purity.toFixed(2)) + '</span>' +
        (s.fresh ? '<span class="nt">fresh · edited ' + s.freshDays + ' d before epoch</span>' : '') +
        (s.drift ? '<span class="dr">ephemeris error · filed ' + esc(s.page.section) + '</span>' : '') +
        ((darkAdapt && s.prov.night) ? '<span class="nt">' + s.prov.night + ' night edit' + (s.prov.night === 1 ? '' : 's') + '</span>' : '');
    }
    tipEl.innerHTML = body;
    tipEl.hidden = false; moveTip(x, y);
  }
  function moveTip(x, y) {
    if (!tipEl || tipEl.hidden) return;
    var r = tipEl.getBoundingClientRect();
    var nx = x + 16, ny = y + 14;
    if (nx + r.width > window.innerWidth - 8) nx = x - r.width - 16;
    if (ny + r.height > window.innerHeight - 8) ny = y - r.height - 14;
    tipEl.style.left = Math.max(6, nx) + 'px';
    tipEl.style.top = Math.max(6, ny) + 'px';
  }
  function hideTip() { if (tipEl) tipEl.hidden = true; }

  function wireSky() {
    var dragging = false, moved = false, lx = 0, ly = 0;
    canvas.addEventListener('pointerdown', function (e) {
      dragging = true; moved = false; lx = e.clientX; ly = e.clientY;
      canvas.classList.add('dragging');
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    canvas.addEventListener('pointermove', function (e) {
      if (dragging) {
        var dx = e.clientX - lx, dy = e.clientY - ly;
        if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        cam.x -= dx / cam.s; cam.y -= dy / cam.s;
        cam.tx = cam.x; cam.ty = cam.y;
        lx = e.clientX; ly = e.clientY;
        dirty = true; hideTip();
        return;
      }
      var wp = s2w(e.clientX, e.clientY);
      var hit = pick(wp[0], wp[1], 15 / cam.s);
      if (hit !== hovered) {
        hovered = hit; dirty = true;
        if (hit >= 0) showTip(stars[hit], e.clientX, e.clientY);
        else hideTip();
      } else if (hit >= 0) moveTip(e.clientX, e.clientY);
      canvas.style.cursor = hit >= 0 ? 'pointer' : 'grab';
    });
    canvas.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false; canvas.classList.remove('dragging');
      if (moved) return;
      var wp = s2w(e.clientX, e.clientY);
      var hit = pick(wp[0], wp[1], 15 / cam.s);
      if (hit >= 0) {
        var s = stars[hit];
        if (s.st === 1 && !s.dark) {
          /* resolving a faint contact is a small act of attention */
          location.hash = '#' + s.slug;
          return;
        }
        location.hash = '#' + s.slug;
      }
    });
    canvas.addEventListener('pointercancel', function () { dragging = false; canvas.classList.remove('dragging'); });
    canvas.addEventListener('pointerleave', function () { hovered = -1; hideTip(); dirty = true; });
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      var before = s2w(e.clientX, e.clientY);
      var f = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0016));
      cam.s = clamp(cam.s * f, 0.06, 8); cam.ts = cam.s;
      var after = s2w(e.clientX, e.clientY);
      cam.x += before[0] - after[0]; cam.y += before[1] - after[1];
      cam.tx = cam.x; cam.ty = cam.y;
      dirty = true;
    }, { passive: false });
  }

  function wireChrome() {
    $('fullbtn').addEventListener('click', function () {
      fullChart = !fullChart;
      $('fullbtn').setAttribute('aria-pressed', fullChart ? 'true' : 'false');
      if (fullChart) {
        logLine('FULL CHART · all <b>' + stars.length + '</b> bodies and <b>' + edges.length + '</b> transmissions revealed · your own chart holds ' + chartN);
        fitVisible(false);
      } else {
        logLine('FULL CHART OFF · back to what you have measured: <b>' + chartN + '</b>/' + stars.length);
      }
      dirty = true;
    });
    $('almbtn').addEventListener('click', function () {
      if (!filedReady) {
        computeLayout(sections, 'filed', 20260902);
        stars.forEach(function (s) { s.x = s.pos.cited[0]; s.y = s.pos.cited[1]; });
        buildPickGrid();
        filedReady = true;
      }
      almanac = !almanac;
      $('almbtn').setAttribute('aria-pressed', almanac ? 'true' : 'false');
      if (almanac) logLine('ALMANAC OVERLAY · ' + sections.length + ' sections as catalogued · <b>' + DRIFT_N + '</b> bodies off ephemeris');
      dirty = true;
    });
    $('darkbtn').addEventListener('click', function () {
      darkAdapt = !darkAdapt;
      $('darkbtn').setAttribute('aria-pressed', darkAdapt ? 'true' : 'false');
      document.body.classList.toggle('darkadapt', darkAdapt);
      if (darkAdapt) logLine('DARK ADAPTATION · instruments dimmed · <b>' + NIGHT_EDITS + '</b> night edits on ' + NIGHT_PAGES + ' pages bloom blue-green');
      dirty = true;
    });
    $('ixbtn').addEventListener('click', function () { toggleIndex(); });
    $('ix-close').addEventListener('click', function () { toggleIndex(false); });
    $('audiobtn').addEventListener('click', function () {
      audioOn = !audioOn;
      if (audioOn && !ensureAC()) audioOn = false;
      if (audioOn && AC && AC.state === 'suspended') AC.resume();
      $('audiobtn').textContent = audioOn ? 'SOUND ON' : 'SOUND OFF';
      $('audiobtn').setAttribute('aria-pressed', audioOn ? 'true' : 'false');
      if (audioOn) logLine('AUDIO · each ping is one commit · night commits ring one octave lower');
      if (current != null) renderInstruments(current);
    });
    $('rd-close').addEventListener('click', function () { location.hash = '#/'; });
    $('cp-close').addEventListener('click', function () { $('plate').hidden = true; });
    $('plaque').addEventListener('click', function () { $('plaque').hidden = true; });
    $('resetbtn').addEventListener('click', resetSurvey);

    $('ixpanel').addEventListener('click', function (e) {
      var a = e.target.closest('a[data-slug]');
      if (a) { toggleIndex(false); }
    });

    document.addEventListener('keydown', function (e) {
      var tag = document.activeElement ? document.activeElement.tagName : '';
      var inField = /^(INPUT|TEXTAREA|SELECT)$/.test(tag);
      if (e.key === 'Tab' && !inField && $('howto').hidden && $('plate').hidden) {
        e.preventDefault();
        toggleIndex();
      }
    });
  }

  /* ---------------------------------------------------- the index panel */
  /* Plain titles, every page, one keystroke away. */

  function buildIndexPanel() {
    var o = [], lastProd = null, lastSec = null;
    bundle.order.forEach(function (slug) {
      var p = bundle.pages[slug];
      if (!p) return;
      if (p.product !== lastProd) {
        o.push('<div class="ix-prod">' + (p.product === 'cms' ? 'STRAPI CMS' : 'STRAPI CLOUD') + '</div>');
        lastProd = p.product; lastSec = null;
      }
      if (p.section !== lastSec) {
        o.push('<div class="ix-sec">' + esc(p.section) + '</div>');
        lastSec = p.section;
      }
      var i = byId[slug];
      o.push('<a class="ix-a" data-slug="' + attr(slug) + '" data-i="' + i + '" href="#' + attr(slug) + '">' +
        '<span class="st">○</span><span>' + esc(p.title) + '</span>' +
        '<span class="dg">' + esc(stars[i].desig) + '</span></a>');
    });
    $('ix-inner').innerHTML = o.join('');
  }
  function refreshIndexMarks() {
    var rows = $('ix-inner').querySelectorAll('a.ix-a');
    for (var k = 0; k < rows.length; k++) {
      var i = +rows[k].getAttribute('data-i');
      var charted = stars[i].st === 2;
      rows[k].classList.toggle('charted', charted);
      rows[k].firstChild.textContent = charted ? '●' : '○';
      rows[k].classList.toggle('cur', i === current);
    }
  }
  function toggleIndex(force) {
    var el = $('ixpanel');
    var open = force === undefined ? el.hidden : force;
    el.hidden = !open;
    $('ixbtn').setAttribute('aria-pressed', open ? 'true' : 'false');
    if (open) {
      refreshIndexMarks();
      var cur = el.querySelector('a.cur');
      if (cur) cur.scrollIntoView({ block: 'center' });
    }
  }

  /* ---------------------------------------------------------- routing */

  function parseHash() {
    var h = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!h || h === '/') return { slug: null, anchor: '' };
    var i = h.indexOf('#');
    var slug = i >= 0 ? h.slice(0, i) : h;
    var anchor = i >= 0 ? h.slice(i + 1) : '';
    slug = slug.replace(/\/+$/, '');
    if (!slug) return { slug: null, anchor: '' };
    return { slug: slug, anchor: anchor };
  }
  var lastSlug = null;
  function route() {
    var r = parseHash();
    if (r.slug === lastSlug) { scrollToAnchor(r.anchor); return; }
    lastSlug = r.slug;
    if (!r.slug) {
      /* back to the sweep */
      current = null;
      $('reader').hidden = true;
      $('inst').hidden = true;
      document.title = 'FIRST LIGHT · Strapi Documentation';
      closeResults();
      dirty = true;
      return;
    }
    var page = bundle.pages[r.slug];
    if (!page) { renderMissing(r.slug); return; }
    var i = byId[r.slug];
    current = i;
    document.title = page.title + ' · FIRST LIGHT';
    /* content first, always: the telemetry theatre happens around it */
    renderPage(page);
    $('reader').hidden = false;
    $('reader').scrollTop = 0;
    $('photom').hidden = false;
    scrollToAnchor(r.anchor);
    closeResults();
    /* then the probe moves */
    var s = stars[i];
    ghost = { x: s.pos.cited[0], y: s.pos.cited[1], label: s.desig };
    cam.tx = s.pos.cited[0]; cam.ty = s.pos.cited[1];
    if (cam.ts < 0.55) cam.ts = 0.8;
    if (REDUCED) { cam.x = cam.tx; cam.y = cam.ty; cam.s = cam.ts; ghost = null; }
    survey(i);
    refreshIndexMarks();
    dirty = true;
  }
  function scrollToAnchor(a) {
    if (!a) return;
    var el = document.getElementById(a);
    if (el) requestAnimationFrame(function () {
      el.scrollIntoView({ block: 'start', behavior: REDUCED ? 'auto' : 'smooth' });
    });
  }
  function renderMissing(slug) {
    current = null;
    document.title = 'No signal · FIRST LIGHT';
    $('reader').hidden = false;
    $('page').innerHTML = '<h1 class="title">No signal</h1><p class="lede">' + esc(slug) +
      ' is not a body in this system.</p><p><a href="#/cms/intro">Strapi CMS</a> · ' +
      '<a href="#/cloud/intro">Strapi Cloud</a></p>';
  }

  /* ------------------------------------------------------ reading sheet */

  var uid = 0;

  function renderPage(p) {
    var si = byId[p.slug], st = stars[si];
    var sec = sections[st.secIdx], cl = clusters[st.comIdx];
    var pv = st.prov;
    var o = [];

    o.push('<div class="crumb"><span class="dg">' + esc(st.desig) + '</span>' +
      '<span>' + esc(sec.product === 'cms' ? 'STRAPI CMS' : 'STRAPI CLOUD') + '</span>' +
      '<span>' + esc(p.section) + '</span>' +
      '<span>' + (cl.loose ? 'UNCLASSIFIED' : 'CLASS C' + pad2(st.comIdx + 1)) + '</span></div>');
    o.push('<h1 class="title">' + esc(p.title) + '</h1>');
    if (p.description) o.push('<p class="lede">' + esc(p.description) + '</p>');

    o.push('<div class="meta">' +
      chip(st.m, 'pulse trains in', st.m >= 12) +
      chip(st.out, 'corridors out', false) +
      chip(fmtN(st.words), 'words of mass', false) +
      chip(st.code, 'code block' + (st.code === 1 ? '' : 's'), false) +
      (st.fresh ? '<span class="chip fresh">FRESH · ' + st.freshDays + 'd</span>' : '') +
      '</div>');

    if (st.dark) {
      o.push('<div class="fc-plaque"><div class="k">FIRST CONTACT</div>' +
        '<div class="l">No page in this documentation cites this one. You are the first to log this page.<br>' +
        'ORIGINAL SURVEYOR · <b>' + esc(pv.topAuthor || 'unknown') + '</b> · first worked ' + esc(pv.first || '—') +
        ' · last worked ' + esc(pv.last || '—') + '</div></div>');
    }

    if (st.drift && !cl.loose) {
      o.push('<p class="lede" style="font-size:.8rem;font-family:var(--f-mono);color:var(--amber-hi)">EPHEMERIS ERROR · the almanac files this body under “' +
        esc(p.section) + '”, but its citations orbit with the ' + esc(cl.dominant || '') + ' community (purity ' +
        (cl.purity != null ? cl.purity.toFixed(2) : '—') + ').</p>');
    }

    var toc = p.headings.filter(function (h) { return h.level === 2 || h.level === 3; });
    if (toc.length > 2) {
      o.push('<nav class="toc" aria-label="On this page"><span class="k">SURVEY SECTIONS</span><ol>' +
        toc.map(function (h) {
          return '<li class="lv' + h.level + '"><a href="#' + attr(p.slug) + '#' + attr(h.id) + '">' + esc(h.text) + '</a></li>';
        }).join('') + '</ol></nav>');
    }

    o.push(blocksHTML(p.blocks));
    o.push(footer(p, st));
    $('page').innerHTML = o.join('');
  }

  function chip(v, label, hot) {
    return '<span class="chip' + (hot ? ' hot' : '') + '"><b>' + esc(v) + '</b> ' + esc(label) + '</span>';
  }

  function footer(p, st) {
    var i = bundle.order.indexOf(p.slug);
    var prev = i > 0 ? bundle.pages[bundle.order[i - 1]] : null;
    var next = i >= 0 && i < bundle.order.length - 1 ? bundle.pages[bundle.order[i + 1]] : null;
    var o = ['<div class="pfoot">'];
    var me = byId[p.slug];
    var ins = (adjIn[me] || []).slice().sort(function (a, b) { return stars[b].m - stars[a].m; });
    var outs = (adjOut[me] || []).slice().sort(function (a, b) { return stars[b].m - stars[a].m; });

    if (ins.length) {
      o.push('<h2>INBOUND · CITED BY ' + ins.length + ' BOD' + (ins.length === 1 ? 'Y' : 'IES') + '</h2><div class="linklist">');
      ins.forEach(function (j) {
        o.push('<a href="#' + attr(stars[j].slug) + '"><span>' + esc(stars[j].page.title) +
          '</span><span class="mag">' + stars[j].desig + ' · ' + stars[j].m + ' in</span></a>');
      });
      o.push('</div>');
    } else {
      o.push('<h2>INBOUND · SILENT</h2><p>No transmissions arrive here. Nothing in the corpus cites this page; on your chart it exists only because you came.</p>');
    }
    if (outs.length) {
      o.push('<h2>TRANSFER CORRIDORS · ' + outs.length + ' OPEN</h2><div class="linklist">');
      outs.forEach(function (j) {
        o.push('<a href="#' + attr(stars[j].slug) + '"><span>' + esc(stars[j].page.title) +
          '</span><span class="mag">' + stars[j].desig + '</span></a>');
      });
      o.push('</div>');
    }
    o.push('<div class="prevnext">');
    o.push(prev ? '<a class="pn prev" href="#' + attr(prev.slug) + '"><span class="k">PREV IN CATALOG</span>' + esc(prev.title) + '</a>' : '<span class="pn empty"></span>');
    o.push(next ? '<a class="pn next" href="#' + attr(next.slug) + '"><span class="k">NEXT IN CATALOG</span>' + esc(next.title) + '</a>' : '<span class="pn empty"></span>');
    o.push('</div></div>');
    return o.join('');
  }

  /* ------------------------------------------------------------ blocks */

  function blocksHTML(blocks) {
    if (!blocks || !blocks.length) return '';
    var o = [];
    for (var i = 0; i < blocks.length; i++) o.push(blockHTML(blocks[i]));
    return o.join('');
  }
  function blockHTML(b) {
    if (!b || !b.t) return '';
    switch (b.t) {
      case 'p': return '<p>' + keep(b.html) + '</p>';
      case 'tldr': return '<div class="tldr"><span class="k">IN SHORT</span>' + keep(b.html) + '</div>';
      case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
        return '<' + b.t + ' id="' + attr(b.id || '') + '">' + esc(b.text) +
          (b.id ? '<a class="hanchor" href="#' + attr(lastSlug || '') + '#' + attr(b.id) + '" aria-label="Link to this section">#</a>' : '') +
          '</' + b.t + '>';
      case 'hr': return '<hr>';
      case 'ul': case 'ol': return listHTML(b);
      case 'code': return codeHTML(b);
      case 'admonition': return admonitionHTML(b);
      case 'table': return tableHTML(b);
      case 'tabs': return tabsHTML(b);
      case 'details': return detailsHTML(b);
      case 'img': return imgHTML(b);
      case 'endpoint': return endpointHTML(b);
      case 'cards': return cardsHTML(b);
      case 'badge': return badgeHTML(b);
      case 'columns': return columnsHTML(b);
      default: return '';
    }
  }
  function listHTML(b) {
    var tag = b.t;
    var o = ['<' + tag + (tag === 'ol' && b.start && b.start !== 1 ? ' start="' + attr(b.start) + '"' : '') + '>'];
    (b.items || []).forEach(function (it) {
      if (typeof it === 'string') o.push('<li>' + keep(it) + '</li>');
      else o.push('<li>' + keep(it.html || '') + blocksHTML(it.blocks) + '</li>');
    });
    o.push('</' + tag + '>');
    return o.join('');
  }
  var ADM = {
    note: ['◆', 'Note'], tip: ['✦', 'Tip'], info: ['●', 'Info'],
    caution: ['▲', 'Caution'], warning: ['▲', 'Warning'], danger: ['✖', 'Danger'],
    strapi: ['✧', 'Strapi'], prerequisites: ['☑', 'Prerequisites'], callout: ['❯', 'Callout']
  };
  function admonitionHTML(b) {
    var k = ADM[b.kind] ? b.kind : 'note';
    var meta = ADM[k];
    return '<div class="adm adm-' + attr(k) + '"><div class="adm-h"><span class="adm-i" aria-hidden="true">' +
      meta[0] + '</span>' + esc(b.title || meta[1]) + '</div>' + blocksHTML(b.blocks) + '</div>';
  }
  function tableHTML(b) {
    var align = b.align || [];
    var o = ['<div class="tablewrap"><table><thead><tr>'];
    (b.head || []).forEach(function (h, i) {
      o.push('<th' + (align[i] && align[i] !== 'left' ? ' style="text-align:' + attr(align[i]) + '"' : '') + '>' + keep(h) + '</th>');
    });
    o.push('</tr></thead><tbody>');
    (b.rows || []).forEach(function (row) {
      o.push('<tr>');
      row.forEach(function (cell, i) {
        o.push('<td' + (align[i] && align[i] !== 'left' ? ' style="text-align:' + attr(align[i]) + '"' : '') + '>' + keep(cell) + '</td>');
      });
      o.push('</tr>');
    });
    o.push('</tbody></table></div>');
    return o.join('');
  }
  function tabsHTML(b) {
    var id = 'tabs' + (++uid), group = b.groupId || id;
    var o = ['<div class="tabs" data-group="' + attr(group) + '"><div class="tablist" role="tablist">'];
    b.tabs.forEach(function (t, i) {
      o.push('<button class="tabbtn" role="tab" type="button" data-i="' + i + '" data-val="' +
        attr(t.value || t.label) + '" aria-selected="' + (i === 0) + '" id="' + id + '-t' + i + '">' + esc(t.label) + '</button>');
    });
    o.push('</div>');
    b.tabs.forEach(function (t, i) {
      o.push('<div class="tabpanel" role="tabpanel" data-i="' + i + '" aria-labelledby="' + id + '-t' + i + '"' +
        (i === 0 ? '' : ' hidden') + '>' + blocksHTML(t.blocks) + '</div>');
    });
    o.push('</div>');
    return o.join('');
  }
  function detailsHTML(b) {
    return '<details' + (b.id ? ' id="' + attr(b.id) + '"' : '') + '><summary>' + keep(b.summary || 'Details') +
      '</summary><div class="details-body">' + blocksHTML(b.blocks) + '</div></details>';
  }
  function imgHTML(b) {
    var src = b.light || b.dark || '';
    if (!src) {
      return '<figure class="figure"><div class="fig-k">CAPTURED FRAME</div><p class="fig-alt">' +
        esc(b.alt || 'Screenshot') + '</p></figure>';
    }
    return '<figure class="figure figure--real"><img src="' + attr(src) + '" alt="' + attr(b.alt || '') +
      '" loading="lazy" decoding="async">' + (b.caption ? '<figcaption>' + keep(b.caption) + '</figcaption>' : '') + '</figure>';
  }
  function badgeHTML(b) {
    return '<span class="badge badge-' + attr(b.kind) + '"' + (b.tooltip ? ' title="' + attr(b.tooltip) + '"' : '') +
      '>' + esc(b.label) + '</span>';
  }
  function cardsHTML(b) {
    return '<div class="cards">' + b.items.map(function (c) {
      var href = c.link || '#';
      var ext = /^https?:/.test(href);
      return '<a class="acard" href="' + attr(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' +
        (c.icon ? '<span class="ic" aria-hidden="true">' + esc(c.icon) + '</span>' : '') +
        '<span class="ct">' + esc(c.title || '') + '</span>' +
        (c.desc ? '<span class="cd">' + esc(c.desc) + '</span>' : '') + '</a>';
    }).join('') + '</div>';
  }
  function columnsHTML(b) {
    return '<div class="columns">' + b.cols.map(function (col) {
      return '<div>' + blocksHTML(Array.isArray(col) ? col : (col.blocks || [])) + '</div>';
    }).join('') + '</div>';
  }
  function endpointHTML(b) {
    var kind = b.kind || 'http';
    var m = (b.method || (kind === 'js' ? 'JS' : 'CALL')).toUpperCase();
    var o = ['<div class="endpoint">'];
    o.push('<div class="ep-head"><span class="ep-m ' + attr(m) + '">' + esc(m) + '</span>' +
      '<span class="ep-path">' + esc(b.path || '') + '</span>' +
      (b.title ? '<span class="ep-title">' + esc(b.title) + '</span>' : '') + '</div>');
    o.push('<div class="ep-body">');
    if (b.description) o.push('<p class="pdesc">' + keep(b.description) + '</p>');
    if (b.params && b.params.length) {
      o.push('<div class="ep-sub">' + esc(b.paramTitle || 'Parameters') + '</div>');
      o.push('<div class="tablewrap"><table class="ptable"><tbody>');
      b.params.forEach(function (p) {
        o.push('<tr><td class="pname">' + esc(p.name) + '</td><td class="ptype">' + esc(p.type || '') + '</td>' +
          '<td class="' + (p.required ? 'preq' : 'popt') + '">' + (p.required ? 'required' : 'optional') + '</td>' +
          '<td>' + keep(p.desc || '') + '</td></tr>');
      });
      o.push('</tbody></table></div>');
    }
    if (b.codeTabs && b.codeTabs.length) {
      o.push('<div class="ep-sub">Request</div>');
      o.push(tabsHTML({ t: 'tabs', groupId: '', tabs: b.codeTabs.map(function (c) {
        return { label: c.label, value: c.label, blocks: [{ t: 'code', lang: c.lang, title: '', code: c.code }] };
      }) }));
    }
    if (b.responses && b.responses.length) {
      o.push('<div class="ep-sub">Response</div>');
      b.responses.forEach(function (r) {
        o.push('<div class="resp-head"><span class="resp-code resp-' + String(r.status || '2')[0] + '">' +
          esc(r.status || '') + ' ' + esc(r.statusText || '') + '</span>' +
          (r.time ? '<span class="resp-meta">' + esc(r.time) + '</span>' : '') + '</div>');
        o.push(codeHTML({ t: 'code', lang: r.lang || 'json', title: '', code: r.body || '' }));
      });
    }
    o.push('</div></div>');
    return o.join('');
  }

  /* ------------------------------------------------- code, lightly set */

  var HASH_LANGS = { bash: 1, sh: 1, shell: 1, zsh: 1, console: 1, yaml: 1, yml: 1, python: 1, py: 1, toml: 1, ini: 1, env: 1, dockerfile: 1, graphql: 1, gql: 1, ruby: 1, rb: 1, perl: 1, r: 1 };
  var KW = Object.create(null);
  ('const let var function return async await import from export default class new extends if else for while do ' +
   'switch case break continue try catch finally throw typeof instanceof this super module require true false null ' +
   'undefined void delete yield interface type enum implements public private protected readonly static as namespace ' +
   'declare def end elif and or not in of is with lambda print').split(' ').forEach(function (k) { KW[k] = 1; });

  function tokenise(line, lang, state) {
    var hash = !!HASH_LANGS[lang], out = [], i = 0, n = line.length, buf = '';
    function flush() {
      if (!buf) return;
      var cls = KW[buf] ? 'tk-k' : (/^\d+(\.\d+)?$/.test(buf) ? 'tk-n' : '');
      out.push(cls ? '<span class="' + cls + '">' + esc(buf) + '</span>' : esc(buf));
      buf = '';
    }
    if (state.block) {
      var end = line.indexOf('*/');
      if (end === -1) return { html: '<span class="tk-c">' + esc(line) + '</span>', state: state };
      out.push('<span class="tk-c">' + esc(line.slice(0, end + 2)) + '</span>');
      i = end + 2; state.block = false;
    }
    while (i < n) {
      var c = line[i];
      if (!hash && c === '/' && line[i + 1] === '/') { flush(); out.push('<span class="tk-c">' + esc(line.slice(i)) + '</span>'); i = n; break; }
      if (!hash && c === '/' && line[i + 1] === '*') {
        flush();
        var e = line.indexOf('*/', i + 2);
        if (e === -1) { out.push('<span class="tk-c">' + esc(line.slice(i)) + '</span>'); state.block = true; i = n; break; }
        out.push('<span class="tk-c">' + esc(line.slice(i, e + 2)) + '</span>'); i = e + 2; continue;
      }
      if (hash && c === '#') { flush(); out.push('<span class="tk-c">' + esc(line.slice(i)) + '</span>'); i = n; break; }
      if (c === '"' || c === "'" || c === '`') {
        flush();
        var j = i + 1;
        while (j < n) { if (line[j] === '\\') j += 2; else if (line[j] === c) { j++; break; } else j++; }
        out.push('<span class="tk-s">' + esc(line.slice(i, j)) + '</span>'); i = j; continue;
      }
      if (/[A-Za-z0-9_$.]/.test(c)) { buf += c; i++; continue; }
      flush(); out.push(esc(c)); i++;
    }
    flush();
    return { html: out.join(''), state: state };
  }
  function codeHTML(b) {
    var lang = (b.lang || '').toLowerCase();
    var raw = String(b.code == null ? '' : b.code).replace(/^\n+/, '').replace(/\s+$/, '');
    var lines = raw.split('\n'), state = { block: false }, hl = false, nextHl = false, o = [];
    for (var i = 0; i < lines.length; i++) {
      var L = lines[i];
      if (/highlight-start/.test(L)) { hl = true; continue; }
      if (/highlight-end/.test(L)) { hl = false; continue; }
      if (/highlight-next-line/.test(L)) { nextHl = true; continue; }
      var r = tokenise(L, lang, state); state = r.state;
      var on = hl || nextHl; nextHl = false;
      o.push('<span class="cline' + (on ? ' hl' : '') + '">' + (r.html || '&nbsp;') + '</span>');
    }
    var head = '';
    if (lang || b.title) {
      head = '<div class="cb-head">' + (lang ? '<span class="cb-lang">' + esc(lang) + '</span>' : '') +
        (b.title ? '<span class="cb-title">' + esc(b.title) + '</span>' : '') + '</div>';
    }
    return '<figure class="codeblock">' + head + '<pre><code>' + o.join('\n') + '</code></pre></figure>';
  }

  /* ------------------------------------------------------- tab groups */

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.tabbtn');
    if (!btn) return;
    var wrap = btn.closest('.tabs'), val = btn.getAttribute('data-val'), group = wrap.getAttribute('data-group');
    var targets = group ? document.querySelectorAll('.tabs[data-group="' + group.replace(/"/g, '') + '"]') : [wrap];
    Array.prototype.forEach.call(targets, function (w) {
      var btns = w.querySelectorAll('.tabbtn'), idx = -1;
      Array.prototype.forEach.call(btns, function (bb, i) { if (bb.getAttribute('data-val') === val) idx = i; });
      if (idx === -1 && w !== wrap) return;
      if (idx === -1) idx = +btn.getAttribute('data-i');
      Array.prototype.forEach.call(btns, function (bb, i) { bb.setAttribute('aria-selected', i === idx ? 'true' : 'false'); });
      Array.prototype.forEach.call(w.querySelectorAll('.tabpanel'), function (pp, i) { pp.hidden = i !== idx; });
    });
  });

  /* --------------------------------------------------------- the search */
  /* Typing warps the probe; the destination is pencil-ghosted; the page
     itself opens the instant you choose it. Theatre never gates content. */

  var qEl, resEl, searchTimer = null;
  function initSearch() {
    qEl = $('q'); resEl = $('results');
    qEl.addEventListener('input', function () { clearTimeout(searchTimer); searchTimer = setTimeout(runSearch, 80); });
    qEl.addEventListener('focus', function () { if (qEl.value.trim()) runSearch(); });
    qEl.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { qEl.value = ''; runSearch(); qEl.blur(); }
      if (e.key === 'Enter') {
        var first = resEl.querySelector('.res');
        if (first) { location.hash = first.getAttribute('href'); qEl.blur(); }
      }
    });
    document.addEventListener('keydown', function (e) {
      var tag = document.activeElement ? document.activeElement.tagName : '';
      if (e.key === '/' && document.activeElement !== qEl && !/^(INPUT|TEXTAREA)$/.test(tag)) {
        e.preventDefault(); qEl.focus(); qEl.select();
      } else if (e.key === 'Escape') {
        if (!$('howto').hidden) { $('howto').hidden = true; }
        else if (resEl && !resEl.hidden) closeResults();
        else if (!$('ixpanel').hidden) toggleIndex(false);
        else if (!$('plaque').hidden) $('plaque').hidden = true;
      }
    });
    document.addEventListener('click', function (e) {
      if (resEl && !resEl.hidden && !e.target.closest('#results') && !e.target.closest('.search')) closeResults();
    });
    $('helpbtn').addEventListener('click', function () {
      $('howto').hidden = !$('howto').hidden;
    });
    $('howto-go').addEventListener('click', function () { $('howto').hidden = true; });
    $('howto').addEventListener('click', function (e) { if (e.target === $('howto')) $('howto').hidden = true; });
  }
  function runSearch() {
    var q = qEl.value.trim().toLowerCase();
    if (q.length < 2) { matched = null; ghost = null; closeResults(); dirty = true; return; }
    var terms = q.split(/\s+/).filter(Boolean), hits = [];
    for (var i = 0; i < searchDocs.length; i++) {
      var d = searchDocs[i], score = 0, ok = true;
      for (var t = 0; t < terms.length; t++) {
        var term = terms[t], s = 0;
        if (d.low.indexOf(term) >= 0) s += 40;
        if (d.title.toLowerCase().indexOf(term) >= 0) s += 60;
        if (d.headLow.indexOf(term) >= 0) s += 25;
        if (d.bodyLow.indexOf(term) >= 0) s += 8;
        if (s === 0) { ok = false; break; }
        score += s;
      }
      if (ok) hits.push([score + Math.min(stars[d.i].m, 30) * 0.8, i]);
    }
    hits.sort(function (a, b) { return b[0] - a[0]; });
    matched = new Set(hits.map(function (h) { return searchDocs[h[1]].i; }));
    /* the antenna swings: the probe leans toward the strongest return */
    if (hits.length) {
      var top = stars[searchDocs[hits[0][1]].i];
      ghost = { x: top.pos.cited[0], y: top.pos.cited[1], label: top.desig, hold: true };
      cam.tx = cam.x + (top.pos.cited[0] - cam.x) * 0.35;
      cam.ty = cam.y + (top.pos.cited[1] - cam.y) * 0.35;
    } else { ghost = null; }
    dirty = true;
    var o = ['<div class="res-head">' + hits.length + ' OF ' + stars.length + ' BODIES RETURN “' + esc(qEl.value.trim()) + '”</div>'];
    hits.slice(0, 24).forEach(function (h) {
      var d = searchDocs[h[1]], st = stars[d.i];
      o.push('<a class="res" href="#' + attr(st.slug) + '"><b>' + esc(d.title) + '</b><span>' +
        esc(st.desig) + ' · ' + esc(st.page.section) + ' · ' + st.m + ' in · ' +
        (st.st === 2 ? 'charted' : st.dark ? 'silent body' : 'uncharted') + '</span>' + snippet(d, terms) + '</a>');
    });
    if (!hits.length) o.push('<div class="res-head">NO RETURNS. THE SYSTEM IS QUIET ON THIS FREQUENCY.</div>');
    resEl.innerHTML = o.join('');
    resEl.hidden = false;
  }
  function snippet(d, terms) {
    var pos = -1, term = '';
    for (var i = 0; i < terms.length && pos < 0; i++) { pos = d.bodyLow.indexOf(terms[i]); term = terms[i]; }
    if (pos < 0) return '';
    var start = Math.max(0, pos - 55), end = Math.min(d.body.length, pos + 95);
    var txt = (start > 0 ? '…' : '') + d.body.slice(start, end) + (end < d.body.length ? '…' : '');
    var re = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return '<span>' + esc(txt).replace(re, '<mark>$1</mark>') + '</span>';
  }
  function closeResults() {
    if (resEl) resEl.hidden = true;
    if (matched) { matched = null; dirty = true; }
    if (ghost && ghost.hold) { ghost = null; dirty = true; }
  }

})();
