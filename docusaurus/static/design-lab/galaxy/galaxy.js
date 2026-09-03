/* =============================================================================
   URANOMETRIA STRAPIENSIS
   The Strapi documentation engraved as a celestial atlas on warm rag paper.

   Two skies, one toggle:
     "as filed"  groups the 290 pages by the 18 sections of the real sidebar
     "as cited"  groups them by 27 Louvain communities measured on the citations
   Every number on screen comes from content.json, graph.json, communities.json.
   No external libraries. Canvas 2D only.
   ============================================================================= */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ utilities */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function attr(s) { return esc(s); }
  function keep(h) { return h == null ? '' : String(h); }  /* html fields arrive already safe */
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
  function spaced(s) { return String(s).toUpperCase().split('').join(' '); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* --------------------------------------------------------- the palette */
  /* Every colour on the plate is one of these. Nothing else is used.       */
  var INK = [27, 26, 58];
  var INK_SOFT = [74, 71, 112];
  var PAPER = [244, 239, 226];
  var PAPER_DEEP = [233, 223, 201];
  var CHROMA = [
    { name: 'vermilion',   rgb: [228, 87, 46],  ink: '#A8371A' },
    { name: 'viridian',    rgb: [17, 138, 126], ink: '#0C6B61' },
    { name: 'ochre',       rgb: [224, 165, 38], ink: '#8A5F08' },
    { name: 'ultramarine', rgb: [55, 51, 168],  ink: '#3733A8' },
    { name: 'magenta',     rgb: [192, 40, 126], ink: '#C0287E' }
  ];
  var MAGENTA = [192, 40, 126];
  var OCHRE = [224, 165, 38];
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

  /* ------------------------------------------------------------- state */

  var bundle = null, graph = null, comms = null;
  var stars = [], byId = Object.create(null);
  var edges = [], adjIn = Object.create(null), adjOut = Object.create(null);
  var sections = [];              /* the 18 filed constellations */
  var clusters = [];              /* the 27 measured communities (+ the unattached) */
  var tagIndex = Object.create(null);
  var tagNames = [];
  var searchDocs = [];

  var MODE = 'filed';             /* 'filed' | 'cited' */
  var morph = { on: false, t0: 0, from: 'filed', to: 'filed', k: 1 };
  var driftOnly = false;
  var activeTag = null;
  var current = null, hovered = -1, matched = null;
  var laidOut = false, dirty = true;

  var cam = { x: 0, y: 0, s: 0.3, tx: 0, ty: 0, ts: 0.3 };
  var canvas, ctx, DPR = 1, W = 0, H = 0;
  var labelBoxes = [];            /* clickable constellation cartouches on the plate */
  var plateCX = 0, plateCY = 0;   /* the centre of the engraved field */
  var hoverLabel = -1;

  /* --------------------------------------------------------------- boot */

  Promise.all([
    fetch('content.json').then(function (r) { return r.json(); }),
    fetch('graph.json').then(function (r) { return r.json(); }),
    fetch('communities.json').then(function (r) { return r.json(); })
  ]).then(function (res) {
    bundle = res[0]; graph = res[1]; comms = res[2];
    prepare();
    buildGroups();
    buildDrawer();
    route();
    document.documentElement.removeAttribute('data-boot');
    window.addEventListener('hashchange', route);
    requestAnimationFrame(function () {
      computeLayout(sections, 'filed', 20260902);
      computeLayout(clusters, 'cited', 71130244);
      applyPositions(1);
      initCanvas();
      wireSky();
      wireChrome();
      laidOut = true;
      fitAll(true);
      loop();
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { dirty = true; });
      }
    });
  }).catch(function (e) {
    var p = $('page');
    if (p) p.innerHTML = '<h1 class="title">Unable to load the documentation</h1><p>' + esc(e && e.message) + '</p>';
  });

  /* -------------------------------------------------------- preparation */

  function prepare() {
    $('brandver').textContent = bundle.version || '';

    var seen = Object.create(null);
    bundle.nav.forEach(function (s) {
      var key = s.product + '|' + s.label;
      if (seen[key] === undefined) {
        seen[key] = sections.length;
        sections.push({
          kind: 'section', idx: sections.length, key: key, label: s.label,
          product: s.product, sub: s.product === 'cms' ? 'Strapi CMS' : 'Strapi Cloud',
          members: []
        });
      }
    });

    bundle.order.forEach(function (slug) {
      var p = bundle.pages[slug];
      if (!p) return;
      var key = p.product + '|' + p.section;
      var m = graph.inbound[slug] || 0;
      var st = {
        slug: slug, page: p, m: m,
        out: graph.outbound[slug] || 0,
        words: graph.words[slug] || 0,
        code: graph.code[slug] || 0,
        secIdx: seen[key] !== undefined ? seen[key] : 0,
        comIdx: -1, drift: false, orphan: m === 0,
        pos: { filed: [0, 0], cited: [0, 0] },
        x: 0, y: 0, vx: 0, vy: 0, sx: 0, sy: 0,
        label: p.sidebarLabel || p.title
      };
      st.r = st.orphan ? 1.5 : 2.0 + Math.sqrt(m) * 1.85;
      byId[slug] = stars.length;
      sections[st.secIdx].members.push(stars.length);
      stars.push(st);
    });

    graph.edges.forEach(function (e) {
      var a = byId[e[0]], b = byId[e[1]];
      if (a === undefined || b === undefined || a === b) return;
      edges.push([a, b]);
      (adjOut[a] || (adjOut[a] = [])).push(b);
      (adjIn[b] || (adjIn[b] = [])).push(a);
    });

    /* the measured communities, in the order they were detected */
    comms.forEach(function (c, i) {
      var cl = {
        kind: 'cluster', idx: i, label: '', sub: '', members: [],
        hub: c.hub, purity: c.purity, dominant: c.dominant, size: c.size, drifters: 0
      };
      c.members.forEach(function (slug) {
        var j = byId[slug];
        if (j === undefined) return;
        stars[j].comIdx = i;
        cl.members.push(j);
        if (stars[j].page.section !== c.dominant) { stars[j].drift = true; cl.drifters++; }
      });
      var hubStar = byId[c.hub] !== undefined ? stars[byId[c.hub]] : null;
      cl.label = hubStar ? (hubStar.page.sidebarLabel || hubStar.page.title) : c.dominant;
      cl.sub = c.members.length + ' pages · mostly filed under ' + c.dominant;
      clusters.push(cl);
    });

    /* the 11 pages no community claimed */
    var loose = { kind: 'cluster', idx: clusters.length, label: 'Unattached', sub: '',
      members: [], hub: null, purity: null, dominant: null, size: 0, drifters: 0, loose: true };
    stars.forEach(function (st, i) {
      if (st.comIdx === -1) { st.comIdx = loose.idx; loose.members.push(i); }
    });
    loose.size = loose.members.length;
    loose.sub = loose.size + ' pages the citation graph never grouped';
    clusters.push(loose);

    /* every drifting page, counted, never guessed */
    var driftN = stars.filter(function (s) { return s.drift; }).length;
    $('driftn').textContent = driftN;
    DRIFT_TOTAL = driftN;

    /* tags: a third, orthogonal way through the corpus */
    stars.forEach(function (st, i) {
      (st.page.tags || []).forEach(function (t) {
        (tagIndex[t] || (tagIndex[t] = [])).push(i);
      });
    });
    tagNames = Object.keys(tagIndex).sort(function (a, b) {
      return tagIndex[b].length - tagIndex[a].length || (a < b ? -1 : 1);
    });

    $('l-pages').textContent = stars.length;
    $('l-edges').textContent = edges.length;
    $('l-groups').textContent = sections.length;
    $('l-orph').textContent = stars.filter(function (s) { return s.orphan; }).length;

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
  }
  var DRIFT_TOTAL = 0;

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

  /* --------------------------------------------- groups: colour + labels */

  function buildGroups() {
    sections.forEach(function (s) {
      s.size = s.members.length;
      s.label = s.label;
      s.sub = s.sub + ' · ' + s.size + ' pages';
    });
    colourise(sections);
    colourise(clusters);
  }

  /* five washes, laid out so that neighbours never share one */
  function colourise(groups) {
    var of = Object.create(null);
    groups.forEach(function (g) { g.members.forEach(function (i) { of[i] = g.idx; }); });
    var adj = groups.map(function () { return Object.create(null); });
    edges.forEach(function (e) {
      var a = of[e[0]], b = of[e[1]];
      if (a === undefined || b === undefined || a === b) return;
      adj[a][b] = (adj[a][b] || 0) + 1;
      adj[b][a] = (adj[b][a] || 0) + 1;
    });
    var order = groups.slice().sort(function (a, b) { return b.members.length - a.members.length; });
    order.forEach(function (g) {
      var taken = Object.create(null);
      Object.keys(adj[g.idx]).forEach(function (k) {
        if (adj[g.idx][k] >= 2) {
          var o = groups[k];
          if (o && o.ci !== undefined) taken[o.ci] = (taken[o.ci] || 0) + adj[g.idx][k];
        }
      });
      var best = 0, bestScore = Infinity;
      for (var c = 0; c < CHROMA.length; c++) {
        var s = (taken[c] || 0) * 100 + countUsed(groups, c);
        if (s < bestScore) { bestScore = s; best = c; }
      }
      g.ci = best;
      g.rgb = CHROMA[best].rgb;
      g.inkc = CHROMA[best].ink;
    });
  }
  function countUsed(groups, c) {
    var n = 0;
    for (var i = 0; i < groups.length; i++) if (groups[i].ci === c) n++;
    return n;
  }

  /* ------------------------------------------------ the frozen layouts */

  function computeLayout(groups, key, seed) {
    var rnd = mulberry32(seed);

    /* 1. pack the group anchors: area follows page count */
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

    /* 2. seed the cited pages inside their anchor disc */
    var of = Object.create(null);
    groups.forEach(function (g) { g.members.forEach(function (m) { of[m] = g; }); });
    var live = [];
    stars.forEach(function (s, i) {
      var g = of[i]; if (!g) return;
      if (s.orphan) return;
      var a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * g.rad * 0.72;
      s.x = g.ax + Math.cos(a) * rr; s.y = g.ay + Math.sin(a) * rr;
      s.vx = 0; s.vy = 0; s.mass = 1 + Math.sqrt(s.m) * 0.5;
      live.push(i);
    });

    /* 3. a seeded force pass on the real citation edges */
    var liveEdges = edges.filter(function (e) { return !stars[e[0]].orphan && !stars[e[1]].orphan; });
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

    /* 4. the uncited pages sit at the margin of their own group, outward */
    groups.forEach(function (g) {
      var cited = g.members.filter(function (m) { return !stars[m].orphan; });
      var cx = 0, cy = 0;
      if (cited.length) {
        cited.forEach(function (m) { cx += stars[m].x; cy += stars[m].y; });
        cx /= cited.length; cy /= cited.length;
      } else { cx = g.ax; cy = g.ay; }
      var rr = 40;
      cited.forEach(function (m) { rr = Math.max(rr, Math.hypot(stars[m].x - cx, stars[m].y - cy)); });
      g.cx = cx; g.cy = cy; g.coreR = rr;
      var outward = Math.atan2(cy, cx);
      var un = g.members.filter(function (m) { return stars[m].orphan; });
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

    /* 5. normalise both skies to the same extent so the toggle reads as a
          rearrangement of the plate, not as a change of scale */
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
      g.hull = g.hull || {};
      g.hull[key] = hullOf(g.members, key);
    });
  }

  /* Andrew's monotone chain, then pushed outward so neighbouring washes
     touch and overprint */
  function hullOf(members, key) {
    var pts = members.map(function (m) { return [stars[m].pos[key][0], stars[m].pos[key][1]]; });
    if (!pts.length) return [];
    var cx = 0, cy = 0;
    pts.forEach(function (p) { cx += p[0]; cy += p[1]; });
    cx /= pts.length; cy /= pts.length;
    if (pts.length < 3) {
      var out = [], R = 46;
      for (var a = 0; a < 12; a++) {
        var t = a / 12 * Math.PI * 2;
        var far = 0;
        pts.forEach(function (p) { far = Math.max(far, Math.hypot(p[0] - cx, p[1] - cy)); });
        out.push([cx + Math.cos(t) * (far + R), cy + Math.sin(t) * (far + R)]);
      }
      return out;
    }
    var s = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    function cross(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lower = [], i;
    for (i = 0; i < s.length; i++) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], s[i]) <= 0) lower.pop();
      lower.push(s[i]);
    }
    var upper = [];
    for (i = s.length - 1; i >= 0; i--) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], s[i]) <= 0) upper.pop();
      upper.push(s[i]);
    }
    lower.pop(); upper.pop();
    var h = lower.concat(upper);
    var PAD = 58;
    return h.map(function (p) {
      var dx = p[0] - cx, dy = p[1] - cy, d = Math.hypot(dx, dy) || 1;
      return [p[0] + dx / d * PAD, p[1] + dy / d * PAD];
    });
  }

  function applyPositions(k) {
    var from = morph.from, to = morph.to;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = s.pos[from], b = s.pos[to];
      s.x = a[0] + (b[0] - a[0]) * k;
      s.y = a[1] + (b[1] - a[1]) * k;
    }
    if (k >= 1) buildPickGrid();
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
          var s = stars[cell[i]];
          var d = Math.hypot(s.x - wx, s.y - wy);
          var hit = Math.max(s.r + 5, tol * 0.6);
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
    resize();
    window.addEventListener('resize', function () { resize(); dirty = true; });
  }
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  }
  function readerOpen() { return !document.body.classList.contains('skymode') && W > 900; }
  function readerW() { return Math.min(720, W * 0.52); }
  function indexOpen() { return !$('index').hidden && W > 900; }
  function viewCX() {
    var left = indexOpen() ? Math.min(348, W * 0.9) : 0;
    var right = readerOpen() ? readerW() : 0;
    return left + (W - left - right) / 2;
  }
  function availW() {
    var left = indexOpen() ? Math.min(348, W * 0.9) : 0;
    var right = readerOpen() ? readerW() : 0;
    return Math.max(220, W - left - right);
  }
  function w2s(x, y) { return [(x - cam.x) * cam.s + viewCX(), (y - cam.y) * cam.s + H / 2]; }
  function s2w(x, y) { return [(x - viewCX()) / cam.s + cam.x, (y - H / 2) / cam.s + cam.y]; }

  function fitAll(instant) {
    var minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    stars.forEach(function (s) {
      minx = Math.min(minx, s.pos.filed[0], s.pos.cited[0]);
      maxx = Math.max(maxx, s.pos.filed[0], s.pos.cited[0]);
      miny = Math.min(miny, s.pos.filed[1], s.pos.cited[1]);
      maxy = Math.max(maxy, s.pos.filed[1], s.pos.cited[1]);
    });
    plateCX = (minx + maxx) / 2; plateCY = (miny + maxy) / 2;
    cam.tx = plateCX; cam.ty = plateCY;
    cam.ts = clamp(Math.min(availW() / (maxx - minx + 190), (H - 110) / (maxy - miny + 170)), 0.05, 2);
    if (instant || REDUCED) { cam.x = cam.tx; cam.y = cam.ty; cam.s = cam.ts; }
    dirty = true;
  }
  function frameGroup(g) {
    if (!laidOut || !g || !g.members.length) return;
    var key = MODE, minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    g.members.forEach(function (m) {
      var p = stars[m].pos[key];
      minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]);
      miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]);
    });
    cam.tx = (minx + maxx) / 2; cam.ty = (miny + maxy) / 2;
    cam.ts = clamp(Math.min(availW() / (maxx - minx + 320), (H - 150) / (maxy - miny + 260)), 0.06, 2.2);
    if (REDUCED) { cam.x = cam.tx; cam.y = cam.ty; cam.s = cam.ts; }
    dirty = true;
  }

  function ensureVisible() {
    if (current == null || !stars[current]) return;
    var s = stars[current], p = w2s(s.x, s.y);
    var L = indexOpen() ? Math.min(348, W * 0.9) + 30 : 30;
    var R = (readerOpen() ? W - readerW() : W) - 30;
    if (p[0] > L && p[0] < R && p[1] > 70 && p[1] < H - 60) return;
    cam.tx = s.x; cam.ty = s.y;
    if (REDUCED) { cam.x = cam.tx; cam.y = cam.ty; }
    dirty = true;
  }

  var lastFrame = 0;
  function loop(ts) {
    requestAnimationFrame(loop);
    if (!laidOut) return;
    ts = ts || performance.now();

    if (morph.on) {
      var k = clamp((ts - morph.t0) / (REDUCED ? 1 : 900), 0, 1);
      morph.k = easeInOut(k);
      applyPositions(morph.k);
      if (k >= 1) { morph.on = false; morph.from = morph.to; applyPositions(1); }
      dirty = true;
    }
    var e = REDUCED ? 1 : 0.13;
    var dx = cam.tx - cam.x, dy = cam.ty - cam.y, ds = cam.ts - cam.s;
    if (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2 || Math.abs(ds) > 0.0004) {
      cam.x += dx * e; cam.y += dy * e; cam.s += ds * e; dirty = true;
    }
    if (!REDUCED && ts - lastFrame > 90) dirty = true;   /* the faint breathing of the plate */
    if (!dirty) return;
    lastFrame = ts;
    draw(ts);
    dirty = false;
  }

  /* ----------------------------------------------------------- drawing */

  function activeGroups() { return MODE === 'filed' ? sections : clusters; }
  function groupOf(s) { return MODE === 'filed' ? sections[s.secIdx] : clusters[s.comIdx]; }

  function draw(now) {
    if (!ctx) return;
    var i, s, n = stars.length;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    /* the paper, with the vignette pressed into its edges */
    ctx.fillStyle = '#F4EFE2';
    ctx.fillRect(0, 0, W, H);
    var cxp = viewCX(), cyp = H / 2, rad = Math.max(W, H) * 0.78;
    var vg = ctx.createRadialGradient(cxp, cyp, rad * 0.30, cxp, cyp, rad);
    vg.addColorStop(0, 'rgba(233,223,201,0)');
    vg.addColorStop(0.62, 'rgba(233,223,201,0.55)');
    vg.addColorStop(1, 'rgba(226,214,187,0.95)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

    /* projection */
    for (i = 0; i < n; i++) {
      s = stars[i];
      var p = w2s(s.x, s.y);
      s.sx = p[0]; s.sy = p[1];
    }

    graticule();

    var groups = activeGroups();
    var key = MODE;

    /* --- the washes. multiply, so that where two hulls meet they overprint */
    if (morph.on) {
      drawHulls(morph.from === 'filed' ? sections : clusters, morph.from, 1 - morph.k);
      drawHulls(morph.to === 'filed' ? sections : clusters, morph.to, morph.k);
    } else {
      drawHulls(groups, key, 1);
    }

    /* --- citation lines: indigo hairlines, the engraver's finest tool */
    var anchor = hovered >= 0 ? hovered : current;
    var lit = Object.create(null);
    if (anchor != null && anchor >= 0) {
      lit[anchor] = 2;
      (adjOut[anchor] || []).forEach(function (j) { lit[j] = lit[j] || 1; });
      (adjIn[anchor] || []).forEach(function (j) { lit[j] = lit[j] || 1; });
    }
    var tagSet = activeTag ? tagIndex[activeTag] : null;
    var tagHas = Object.create(null);
    if (tagSet) tagSet.forEach(function (j) { tagHas[j] = 1; });

    var margin = 90, dim = new Path2D(), hot = new Path2D();
    for (i = 0; i < edges.length; i++) {
      var a = stars[edges[i][0]], b = stars[edges[i][1]];
      if ((a.sx < -margin && b.sx < -margin) || (a.sx > W + margin && b.sx > W + margin) ||
          (a.sy < -margin && b.sy < -margin) || (a.sy > H + margin && b.sy > H + margin)) continue;
      var isHot = anchor != null && anchor >= 0 && (edges[i][0] === anchor || edges[i][1] === anchor);
      var path = isHot ? hot : dim;
      path.moveTo(a.sx, a.sy); path.lineTo(b.sx, b.sy);
    }
    ctx.lineWidth = Math.max(0.32, 0.42 * Math.min(cam.s, 1.8));
    ctx.strokeStyle = rgba(INK, (matched || driftOnly || activeTag) ? 0.055 : 0.115);
    ctx.stroke(dim);
    if (anchor != null && anchor >= 0) {
      ctx.lineWidth = Math.max(0.7, 0.85 * Math.min(cam.s, 1.8));
      ctx.strokeStyle = rgba([168, 55, 26], 0.46);
      ctx.stroke(hot);
    }

    /* --- a tag lights its pages as a wash cutting across both groupings */
    if (tagSet) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = rgba(OCHRE, 0.30);
      for (i = 0; i < tagSet.length; i++) {
        s = stars[tagSet[i]];
        if (s.sx < -60 || s.sx > W + 60 || s.sy < -60 || s.sy > H + 60) continue;
        ctx.beginPath();
        ctx.arc(s.sx, s.sy, Math.max(7, 15 * cam.s), 0, 6.2832);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    /* --- the stars themselves */
    for (i = 0; i < n; i++) {
      s = stars[i];
      if (s.sx < -24 || s.sx > W + 24 || s.sy < -24 || s.sy > H + 24) continue;
      var on = 1;
      if (matched) on = matched.has(i) ? 1 : 0.13;
      else if (driftOnly) on = s.drift ? 1 : 0.11;
      else if (tagSet) on = tagHas[i] ? 1 : 0.16;
      if (lit[i]) on = 1;
      if (i === current) on = 1;

      var rr = Math.max(0.9, s.r * cam.s);
      var drifter = s.drift && (MODE === 'cited' || driftOnly || on === 1);
      var col = drifter ? MAGENTA : INK;

      /* the engraver leaves a little paper around every star */
      if (rr > 1.6) {
        ctx.globalAlpha = clamp(on, 0, 1) * 0.9;
        ctx.fillStyle = '#F4EFE2';
        ctx.beginPath(); ctx.arc(s.sx, s.sy, rr + 1.8, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = clamp(on, 0, 1);

      if (s.m >= 4) {
        ctx.fillStyle = rgba(col, 1);
        ctx.beginPath(); ctx.arc(s.sx, s.sy, rr, 0, 6.2832); ctx.fill();
        if (s.m >= 15 && cam.s > 0.12) {
          /* the brightest magnitudes are engraved with rays */
          ctx.strokeStyle = rgba(col, 0.55);
          ctx.lineWidth = Math.max(0.5, rr * 0.16);
          var ray = rr * 2.5;
          ctx.beginPath();
          ctx.moveTo(s.sx - ray, s.sy); ctx.lineTo(s.sx + ray, s.sy);
          ctx.moveTo(s.sx, s.sy - ray); ctx.lineTo(s.sx, s.sy + ray);
          ctx.stroke();
        }
      } else if (s.m >= 1) {
        ctx.strokeStyle = rgba(col, 0.95);
        ctx.lineWidth = Math.max(0.7, rr * 0.42);
        ctx.beginPath(); ctx.arc(s.sx, s.sy, Math.max(1.4, rr), 0, 6.2832); ctx.stroke();
      } else {
        ctx.strokeStyle = rgba(drifter ? MAGENTA : INK_SOFT, 0.8);
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(s.sx, s.sy, Math.max(1.5, rr * 0.95), 0, 6.2832); ctx.stroke();
      }
      if (tagSet && tagHas[i]) {
        ctx.strokeStyle = rgba([138, 95, 8], 0.85);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(s.sx, s.sy, rr + 4.5, 0, 6.2832); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    /* --- the page you are reading, marked the way an atlas marks a subject */
    if (current != null && current >= 0 && stars[current]) {
      s = stars[current];
      var R = Math.max(11, s.r * cam.s * 3.1);
      ctx.strokeStyle = rgba([168, 55, 26], 0.9);
      ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.arc(s.sx, s.sy, R, 0, 6.2832); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s.sx - R - 7, s.sy); ctx.lineTo(s.sx - R - 2, s.sy);
      ctx.moveTo(s.sx + R + 2, s.sy); ctx.lineTo(s.sx + R + 7, s.sy);
      ctx.moveTo(s.sx, s.sy - R - 7); ctx.lineTo(s.sx, s.sy - R - 2);
      ctx.moveTo(s.sx, s.sy + R + 2); ctx.lineTo(s.sx, s.sy + R + 7);
      ctx.stroke();
    }

    drawGroupLabels(morph.on ? (morph.to === 'filed' ? sections : clusters) : groups,
                    morph.on ? morph.to : key, morph.on ? morph.k : 1);
    drawStarLabels(lit, tagHas, tagSet);
    drawGraduations();
  }

  /* a celestial graticule, drawn the way a plate is ruled before engraving */
  function graticule() {
    var gx = plateCX, gy = plateCY;
    ctx.save();
    ctx.strokeStyle = rgba(INK, 0.055);
    ctx.lineWidth = 0.6;
    var rings = [340, 680, 1020, 1360];
    for (var r = 0; r < rings.length; r++) {
      var a0 = w2s(gx - rings[r] * 1.32, gy - rings[r]);
      var a1 = w2s(gx + rings[r] * 1.32, gy + rings[r]);
      var w = (a1[0] - a0[0]) / 2, h = (a1[1] - a0[1]) / 2;
      if (w < 6 || h < 6) continue;
      if (a0[0] > W && a1[0] > W) continue;
      ctx.beginPath();
      ctx.ellipse((a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2, w, h, 0, 0, 6.2832);
      ctx.stroke();
    }
    var c = w2s(gx, gy);
    for (var k = 0; k < 12; k++) {
      var t = k / 12 * Math.PI * 2;
      var e = w2s(gx + Math.cos(t) * 1500 * 1.32, gy + Math.sin(t) * 1500);
      ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(e[0], e[1]); ctx.stroke();
    }
    ctx.restore();
  }

  function drawHulls(groups, key, alpha) {
    if (alpha <= 0.01) return;
    var g, i;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    for (i = 0; i < groups.length; i++) {
      g = groups[i];
      var pts = morph.on ? hullOfLive(g) : g.hull[key];
      if (!pts || pts.length < 3) continue;
      var dimmed = 1;
      if (driftOnly) dimmed = 0.45;
      if (matched || activeTag) dimmed = 0.5;
      ctx.fillStyle = rgba(g.rgb, 0.175 * alpha * dimmed);
      pathHull(pts);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    for (i = 0; i < groups.length; i++) {
      g = groups[i];
      var pts2 = morph.on ? hullOfLive(g) : g.hull[key];
      if (!pts2 || pts2.length < 3) continue;
      var low = g.purity != null && g.purity < 0.5;
      ctx.setLineDash(g.loose ? [4, 4] : (low ? [9, 4] : []));
      ctx.lineWidth = low ? 1.3 : 0.9;
      ctx.strokeStyle = rgba(g.rgb, (low ? 0.75 : 0.5) * alpha);
      pathHull(pts2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }
  function hullOfLive(g) {
    if (!g.members.length) return null;
    var pts = g.members.map(function (m) { return [stars[m].x, stars[m].y]; });
    return hullFromPoints(pts);
  }
  function hullFromPoints(pts) {
    var cx = 0, cy = 0;
    pts.forEach(function (p) { cx += p[0]; cy += p[1]; });
    cx /= pts.length; cy /= pts.length;
    if (pts.length < 3) return null;
    var s = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    function cross(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lower = [], i;
    for (i = 0; i < s.length; i++) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], s[i]) <= 0) lower.pop();
      lower.push(s[i]);
    }
    var upper = [];
    for (i = s.length - 1; i >= 0; i--) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], s[i]) <= 0) upper.pop();
      upper.push(s[i]);
    }
    lower.pop(); upper.pop();
    var h = lower.concat(upper);
    if (h.length < 3) return null;
    return h.map(function (p) {
      var dx = p[0] - cx, dy = p[1] - cy, d = Math.hypot(dx, dy) || 1;
      return [p[0] + dx / d * 58, p[1] + dy / d * 58];
    });
  }
  function pathHull(pts) {
    var n = pts.length, i, p0 = w2s(pts[0][0], pts[0][1]), prev = p0;
    var m0 = w2s((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
    ctx.beginPath();
    ctx.moveTo(m0[0], m0[1]);
    for (i = 0; i < n; i++) {
      var cur = w2s(pts[i][0], pts[i][1]);
      var nx = pts[(i + 1) % n];
      var mid = w2s((pts[i][0] + nx[0]) / 2, (pts[i][1] + nx[1]) / 2);
      ctx.quadraticCurveTo(cur[0], cur[1], mid[0], mid[1]);
    }
    ctx.closePath();
  }

  /* constellation cartouches: engraved caps, an ink rule, the colour beneath */
  function drawGroupLabels(groups, key, alpha) {
    labelBoxes = [];
    if (cam.s > 2.4 || alpha < 0.35) return;
    var fade = clamp((2.4 - cam.s) / 0.8, 0, 1) * (matched ? 0.4 : 1) * alpha;
    if (fade <= 0.05) return;
    var order = groups.slice().sort(function (a, b) { return b.members.length - a.members.length; });
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    for (var i = 0; i < order.length; i++) {
      var g = order[i];
      if (!g.members.length) continue;
      var cx = 0, cy = 0, top = Infinity;
      for (var k = 0; k < g.members.length; k++) {
        var st = stars[g.members[k]];
        cx += st.sx; cy += st.sy;
        if (st.sy < top) top = st.sy;
      }
      cx /= g.members.length; cy /= g.members.length;
      if (cx < -180 || cx > W + 180 || top < -80 || top > H + 40) continue;
      var y = top - 26;
      if (y < 74) y = Math.min(cy, H - 40);

      var name = g.label;
      var fs = clamp(10.5 + cam.s * 5.5, 10.5, 16);
      ctx.font = '600 ' + fs.toFixed(1) + 'px "EB Garamond", Georgia, serif';
      var txt = spaced(name.length > 26 ? name.slice(0, 25) + '…' : name);
      var tw = ctx.measureText(txt).width;
      var box = [cx - tw / 2 - 10, y - fs - 8, tw + 20, fs + 34];
      var clash = false;
      for (var z = 0; z < labelBoxes.length; z++) {
        var rb = labelBoxes[z].box;
        if (box[0] < rb[0] + rb[2] && box[0] + box[2] > rb[0] && box[1] < rb[1] + rb[3] && box[1] + box[3] > rb[1]) { clash = true; break; }
      }
      if (clash) continue;

      var hoverThis = hoverLabel === g.kind + g.idx;
      ctx.globalAlpha = fade * (hoverThis ? 1 : 0.94);
      ctx.fillStyle = 'rgba(244,239,226,0.72)';
      ctx.fillRect(box[0] + 4, box[1] + 2, box[2] - 8, fs + 6);
      ctx.fillStyle = 'rgb(27,26,58)';
      ctx.fillText(txt, cx, y);

      /* the colour of the wash, stated plainly under the name */
      ctx.fillStyle = rgba(g.rgb, hoverThis ? 0.95 : 0.75);
      ctx.fillRect(cx - tw / 2, y + 4, tw, 3);

      ctx.globalAlpha = fade * 0.85;
      ctx.font = '500 9.5px "IBM Plex Mono", monospace';
      ctx.fillStyle = 'rgb(74,71,112)';
      var sub;
      if (g.kind === 'section') sub = g.product.toUpperCase() + ' · ' + g.members.length + ' PAGES';
      else if (g.loose) sub = g.members.length + ' PAGES · NO CLUSTER';
      else sub = g.members.length + ' PAGES · PURITY ' + g.purity.toFixed(2);
      ctx.fillText(sub, cx, y + 18);

      if (g.kind === 'cluster' && g.purity != null && g.purity < 0.5) {
        ctx.fillStyle = rgba(MAGENTA, 0.95);
        ctx.beginPath();
        ctx.arc(cx - tw / 2 - 8, y - fs * 0.32, 3, 0, 6.2832);
        ctx.fill();
      }
      labelBoxes.push({ box: box, g: g });
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = 'left';
  }

  function drawStarLabels(lit, tagHas, tagSet) {
    ctx.font = '500 10.5px "IBM Plex Mono", monospace';
    ctx.textBaseline = 'middle';
    var placed = labelBoxes.map(function (b) { return b.box; });
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
      if (s.sx < 4 || s.sx > W - 4 || s.sy < 66 || s.sy > H - 8) continue;
      var prio = -1;
      if (i === current) prio = 1000;
      else if (i === hovered) prio = 999;
      else if (matched) prio = matched.has(i) ? 300 + s.m : -1;
      else if (driftOnly) prio = s.drift ? 300 + s.m : -1;
      else if (tagSet) prio = tagHas[i] ? 300 + s.m : -1;
      else if (lit[i]) prio = 200 + s.m;
      else if (s.m >= 11 || (cam.s > 0.55 && s.m >= 6) || (cam.s > 1.1 && s.m >= 2) || cam.s > 2.2) prio = s.m;
      if (prio >= 0) order.push([prio, i]);
    }
    order.sort(function (a, b) { return b[0] - a[0]; });
    for (var q = 0; q < order.length && q < 84; q++) {
      i = order[q][1]; s = stars[i];
      var txt = s.label.length > 32 ? s.label.slice(0, 31) + '…' : s.label;
      var w = ctx.measureText(txt).width;
      var off = Math.max(6, s.r * cam.s) + 6;
      var lx = s.sx + off, ly = s.sy;
      if (lx + w > W - 6) lx = s.sx - w - off;
      if (!fits(lx, ly - 7, w)) continue;
      ctx.fillStyle = 'rgba(244,239,226,0.80)';
      ctx.fillRect(lx - 2.5, ly - 7, w + 5, 14);
      ctx.fillStyle = (i === current) ? '#A8371A' : (s.drift && (MODE === 'cited' || driftOnly) ? '#C0287E' : '#1B1A3A');
      ctx.fillText(txt, lx, ly);
    }
  }

  /* the graduated border of an engraved plate, ruled in world coordinates */
  function drawGraduations() {
    var step = 200;
    while (step * cam.s < 46) step *= 2;
    while (step * cam.s > 220) step /= 2;
    ctx.strokeStyle = rgba(INK, 0.4);
    ctx.fillStyle = rgba(INK_SOFT, 0.85);
    ctx.font = '400 8px "IBM Plex Mono", monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.lineWidth = 1;
    var w0 = s2w(16, 16), w1 = s2w(W - 16, H - 16);
    var x0 = Math.ceil(w0[0] / step) * step;
    ctx.beginPath();
    for (var x = x0; x < w1[0]; x += step) {
      var p = w2s(x, 0);
      if (p[0] < 20 || p[0] > W - 20) continue;
      var major = Math.round(x / step) % 5 === 0;
      ctx.moveTo(p[0], 17); ctx.lineTo(p[0], 17 + (major ? 8 : 4));
      ctx.moveTo(p[0], H - 17); ctx.lineTo(p[0], H - 17 - (major ? 8 : 4));
    }
    var y0 = Math.ceil(w0[1] / step) * step;
    for (var y = y0; y < w1[1]; y += step) {
      var q = w2s(0, y);
      if (q[1] < 20 || q[1] > H - 20) continue;
      var maj = Math.round(y / step) % 5 === 0;
      ctx.moveTo(17, q[1]); ctx.lineTo(17 + (maj ? 8 : 4), q[1]);
      ctx.moveTo(W - 17, q[1]); ctx.lineTo(W - 17 - (maj ? 8 : 4), q[1]);
    }
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  /* -------------------------------------------------- sky interaction */

  function labelAt(x, y) {
    for (var i = 0; i < labelBoxes.length; i++) {
      var b = labelBoxes[i].box;
      if (x >= b[0] && x <= b[0] + b[2] && y >= b[1] && y <= b[1] + b[3]) return labelBoxes[i].g;
    }
    return null;
  }

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
      var hit = morph.on ? -1 : pick(wp[0], wp[1], 15 / cam.s);
      var lab = hit < 0 ? labelAt(e.clientX, e.clientY) : null;
      var labKey = lab ? lab.kind + lab.idx : -1;
      if (hit !== hovered || labKey !== hoverLabel) {
        hovered = hit; hoverLabel = labKey; dirty = true;
        if (hit >= 0) showTip(stars[hit], e.clientX, e.clientY);
        else if (lab) showGroupTip(lab, e.clientX, e.clientY);
        else hideTip();
      } else if (hit >= 0 || lab) moveTip(e.clientX, e.clientY);
      canvas.style.cursor = (hit >= 0 || lab) ? 'pointer' : 'grab';
    });
    canvas.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false; canvas.classList.remove('dragging');
      if (moved) return;
      var wp = s2w(e.clientX, e.clientY);
      var hit = morph.on ? -1 : pick(wp[0], wp[1], 15 / cam.s);
      if (hit >= 0) { location.hash = '#' + stars[hit].slug; return; }
      var lab = labelAt(e.clientX, e.clientY);
      if (lab) openGroup(lab);
    });
    canvas.addEventListener('pointercancel', function () { dragging = false; canvas.classList.remove('dragging'); });
    canvas.addEventListener('pointerleave', function () { hovered = -1; hoverLabel = -1; hideTip(); dirty = true; });
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
    $('sw-filed').addEventListener('click', function () { setMode('filed'); });
    $('sw-cited').addEventListener('click', function () { setMode('cited'); });

    $('driftbtn').addEventListener('click', function () {
      driftOnly = !driftOnly;
      $('driftbtn').setAttribute('aria-pressed', driftOnly ? 'true' : 'false');
      if (driftOnly) { activeTag = null; syncTags(); openDrifters(); }
      else if (indexKind === 'drifters') closeIndex();
      dirty = true;
    });

    $('skybtn').addEventListener('click', function () {
      var on = !document.body.classList.contains('skymode');
      document.body.classList.toggle('skymode', on);
      $('skybtn').setAttribute('aria-pressed', on ? 'true' : 'false');
      fitAll(false);
    });

    $('index-close').addEventListener('click', closeIndex);

    $('index').addEventListener('click', function (e) {
      var a = e.target.closest('a[data-slug]');
      if (a) { location.hash = '#' + a.getAttribute('data-slug'); }
    });

    /* tags in the reading panel are controls */
    $('page').addEventListener('click', function (e) {
      var t = e.target.closest('button.tag');
      if (!t) return;
      var name = t.getAttribute('data-tag');
      if (activeTag === name) { activeTag = null; closeIndex(); }
      else { activeTag = name; driftOnly = false; $('driftbtn').setAttribute('aria-pressed', 'false'); openTag(name); }
      syncTags(); dirty = true;
    });

    window.addEventListener('resize', function () { dirty = true; });
  }

  function setMode(m) {
    if (m === MODE) return;
    MODE = m;
    $('sw-filed').classList.toggle('is-on', m === 'filed');
    $('sw-cited').classList.toggle('is-on', m === 'cited');
    $('sw-filed').setAttribute('aria-pressed', m === 'filed' ? 'true' : 'false');
    $('sw-cited').setAttribute('aria-pressed', m === 'cited' ? 'true' : 'false');
    $('l-groups').textContent = m === 'filed' ? sections.length : clusters.length;
    $('l-groupw').textContent = m === 'filed' ? 'constellations' : 'communities';
    $('cart-mode').innerHTML = m === 'filed'
      ? 'Tabula&nbsp;I · the pages as they are filed'
      : 'Tabula&nbsp;II · the pages as they cite one another';
    var ck = $('cart-key');
    if (ck) ck.hidden = m !== 'cited';
    morph.from = morph.on ? morph.from : (m === 'filed' ? 'cited' : 'filed');
    morph.to = m;
    morph.t0 = performance.now();
    morph.on = true;
    if (REDUCED) { morph.k = 1; applyPositions(1); morph.on = false; morph.from = m; }
    dirty = true;
  }

  var tipEl;
  function showTip(s, x, y) {
    tipEl = tipEl || $('tooltip');
    var g = groupOf(s);
    var extra = '';
    if (s.drift) {
      var cl = clusters[s.comIdx];
      extra = '<span class="dr">drifts · filed under ' + esc(s.page.section) +
        ', cites with ' + esc(cl.dominant || 'no cluster') + '</span>';
    }
    tipEl.innerHTML = '<b>' + esc(s.page.title) + '</b>' +
      '<span class="sec">' + esc((MODE === 'filed' ? s.page.product.toUpperCase() + ' · ' + s.page.section : g.label)) + '</span>' +
      '<span>' + s.m + ' cited in · ' + s.out + ' out · ' + s.words.toLocaleString('en-US') + ' words · ' +
      s.code + ' code</span>' + extra +
      '<span class="hbar" style="background:' + rgba(g.rgb, 0.75) + '"></span>';
    tipEl.hidden = false; moveTip(x, y);
  }
  function showGroupTip(g, x, y) {
    tipEl = tipEl || $('tooltip');
    var body;
    if (g.kind === 'section') {
      body = '<span>' + g.members.length + ' pages filed here in the sidebar</span>';
    } else if (g.loose) {
      body = '<span>' + g.members.length + ' pages the citation graph never grouped</span>';
    } else {
      body = '<span>' + g.members.length + ' pages · hub ' + esc(g.hub) + '</span>' +
        '<span>purity ' + g.purity.toFixed(2) + ' · ' + g.drifters + ' of them filed elsewhere</span>';
    }
    tipEl.innerHTML = '<b>' + esc(g.label) + '</b>' +
      '<span class="sec">' + (g.kind === 'section' ? 'Constellation as filed' : 'Community as cited') + '</span>' +
      body + '<span class="hbar" style="background:' + rgba(g.rgb, 0.75) + '"></span>';
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

  /* ------------------------------------------------------- index panel */

  var indexKind = null;
  function closeIndex() {
    $('index').hidden = true; indexKind = null;
    document.body.classList.remove('idx-open');
    if (driftOnly) { driftOnly = false; $('driftbtn').setAttribute('aria-pressed', 'false'); }
    if (activeTag) { activeTag = null; syncTags(); }
    dirty = true;
    if (laidOut) fitAll(false);
  }
  function openIndex(html, kind) {
    $('index-inner').innerHTML = html;
    $('index').hidden = false;
    document.body.classList.add('idx-open');
    $('index').scrollTop = 0;
    indexKind = kind;
    dirty = true;
  }
  function starRow(i, showDrift) {
    var s = stars[i];
    return '<a href="#' + attr(s.slug) + '" data-slug="' + attr(s.slug) + '"' +
      (showDrift && s.drift ? ' class="drift"' : '') + '>' +
      '<span>' + esc(s.page.title) + '<span class="s">' + esc(s.page.section) + '</span></span>' +
      '<span class="m">' + s.m + '</span></a>';
  }
  function openGroup(g) {
    var o = [];
    var members = g.members.slice().sort(function (a, b) { return stars[b].m - stars[a].m; });
    if (g.kind === 'section') {
      o.push('<div class="ix-k">Constellation · as filed</div>');
      o.push('<div class="ix-t">' + esc(g.label) + '</div>');
      o.push('<div class="ix-sw" style="background:' + rgba(g.rgb, 0.55) + '"></div>');
      var dr = members.filter(function (i) { return stars[i].drift; }).length;
      o.push('<div class="ix-facts"><div>pages <b>' + members.length + '</b></div>' +
        '<div>product <b>' + esc(g.product) + '</b></div>' +
        '<div>uncited <b>' + members.filter(function (i) { return stars[i].orphan; }).length + '</b></div>' +
        '<div>drifting <b>' + dr + '</b></div></div>');
      o.push('<p class="ix-note">This is where the sidebar puts these pages. Switch the sky to <em>as cited</em> to see where their citations put them instead.</p>');
    } else if (g.loose) {
      o.push('<div class="ix-k">Outside every community</div>');
      o.push('<div class="ix-t">Unattached</div>');
      o.push('<div class="ix-sw" style="background:' + rgba(g.rgb, 0.55) + '"></div>');
      o.push('<div class="ix-facts"><div>pages <b>' + members.length + '</b></div>' +
        '<div>communities <b>0</b></div></div>');
      o.push('<p class="ix-note">Louvain detection over the citation graph never pulled these pages into a community of three or more.</p>');
    } else {
      o.push('<div class="ix-k">Community · as cited</div>');
      o.push('<div class="ix-t">' + esc(g.label) + '</div>');
      o.push('<div class="ix-sw" style="background:' + rgba(g.rgb, 0.55) + '"></div>');
      o.push('<div class="ix-facts"><div>pages <b>' + members.length + '</b></div>' +
        '<div>purity <b>' + g.purity.toFixed(2) + '</b></div>' +
        '<div>mostly filed <b>' + esc(g.dominant) + '</b></div>' +
        '<div>drifting <b>' + g.drifters + '</b></div></div>');
      if (g.purity < 0.5) {
        o.push('<p class="ix-note warn">These ' + members.length + ' pages cite each other constantly, yet only ' +
          Math.round(g.purity * 100) + '% of them are filed under ' + esc(g.dominant) +
          '. That mismatch is an editorial finding, not a rendering artefact.</p>');
      } else {
        o.push('<p class="ix-note">' + Math.round(g.purity * 100) + '% of this community is filed under ' +
          esc(g.dominant) + '. Hub: ' + esc(g.hub) + '</p>');
      }
    }
    o.push('<div class="ix-sub">Members, brightest first</div><div class="ix-list">');
    members.forEach(function (i) { o.push(starRow(i, true)); });
    o.push('</div>');
    openIndex(o.join(''), 'group');
    setTimeout(function () { frameGroup(g); }, 20);
  }
  function openDrifters() {
    var list = [];
    stars.forEach(function (s, i) { if (s.drift) list.push(i); });
    list.sort(function (a, b) { return stars[b].m - stars[a].m; });
    var o = ['<div class="ix-k">The disagreement</div>',
      '<div class="ix-t">' + list.length + ' drifting pages</div>',
      '<div class="ix-sw" style="background:' + rgba(MAGENTA, 0.55) + '"></div>',
      '<p class="ix-note">A page drifts when the community its citations put it in is dominated by a different section from the one it is filed under. Counted across all 27 measured communities.</p>',
      '<div class="ix-list">'];
    list.forEach(function (i) {
      var s = stars[i], cl = clusters[s.comIdx];
      o.push('<a class="drift" href="#' + attr(s.slug) + '" data-slug="' + attr(s.slug) + '">' +
        '<span>' + esc(s.page.title) + '<span class="s">' + esc(s.page.section) + ' → ' +
        esc(cl && cl.dominant ? cl.dominant : 'none') + '</span></span>' +
        '<span class="m">' + s.m + '</span></a>');
    });
    o.push('</div>');
    openIndex(o.join(''), 'drifters');
    setTimeout(function () { fitAll(false); }, 20);
  }
  function openTag(name) {
    var list = tagIndex[name].slice().sort(function (a, b) { return stars[b].m - stars[a].m; });
    var secs = Object.create(null), coms = Object.create(null);
    list.forEach(function (i) {
      secs[stars[i].page.section] = (secs[stars[i].page.section] || 0) + 1;
      coms[stars[i].comIdx] = 1;
    });
    var o = ['<div class="ix-k">Tag · a third way through</div>',
      '<div class="ix-t">' + esc(name) + '</div>',
      '<div class="ix-sw" style="background:' + rgba(OCHRE, 0.7) + '"></div>',
      '<div class="ix-facts"><div>pages <b>' + list.length + '</b></div>' +
      '<div>filed sections <b>' + Object.keys(secs).length + '</b></div>' +
      '<div>communities <b>' + Object.keys(coms).length + '</b></div>' +
      '<div>of 290 <b>' + Math.round(list.length / stars.length * 100) + '%</b></div></div>',
      '<p class="ix-note">Frontmatter tags cut across both skies. These pages are washed in ochre wherever they sit.</p>',
      '<div class="ix-list">'];
    list.forEach(function (i) { o.push(starRow(i, true)); });
    o.push('</div>');
    openIndex(o.join(''), 'tag');
    setTimeout(function () { fitAll(false); }, 20);
  }
  function syncTags() {
    var all = $('page').querySelectorAll('button.tag');
    for (var i = 0; i < all.length; i++) {
      all[i].classList.toggle('on', all[i].getAttribute('data-tag') === activeTag);
    }
  }

  /* ---------------------------------------------------------- drawer */

  function buildDrawer() {
    var html = [], lastProd = null;
    var idx = Object.create(null);
    sections.forEach(function (s, i) { idx[s.key] = i; });
    bundle.nav.forEach(function (sec) {
      if (sec.product !== lastProd) {
        html.push('<div class="nav-prod">' + esc(sec.product === 'cms' ? 'Strapi CMS' : 'Strapi Cloud') + '</div>');
        lastProd = sec.product;
      }
      var si = idx[sec.product + '|' + sec.label];
      var col = si !== undefined && sections[si].rgb ? rgba(sections[si].rgb, 0.6) : 'transparent';
      html.push('<div class="nav-sec"><span class="dot" data-sec="' + si + '" style="background:' + col + '"></span>' + esc(sec.label) + '</div>');
      sec.items.forEach(function (item) {
        if (item.slug) html.push(navLink(item, false));
        else if (item.items) {
          html.push('<div class="nav-grp">' + esc(item.label) + '</div>');
          item.items.forEach(function (sub) { if (sub.slug) html.push(navLink(sub, true)); });
        }
      });
    });
    $('drawer-inner').innerHTML = html.join('');
    $('navbtn').addEventListener('click', function () { toggleDrawer(); });
    $('scrim').addEventListener('click', function () { toggleDrawer(false); });
    $('drawer').addEventListener('click', function (e) { if (e.target.closest('a')) toggleDrawer(false); });
  }
  function navLink(item, sub) {
    return '<a class="nav-a' + (sub ? ' sub' : '') + '" data-slug="' + attr(item.slug) +
      '" href="#' + attr(item.slug) + '">' + esc(item.label) + '</a>';
  }
  function toggleDrawer(force) {
    var d = $('drawer');
    var open = force === undefined ? !d.classList.contains('open') : force;
    d.classList.toggle('open', open);
    $('scrim').hidden = !open;
    $('navbtn').setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { var cur = d.querySelector('.nav-a.cur'); if (cur) cur.scrollIntoView({ block: 'center' }); }
  }

  /* ---------------------------------------------------------- routing */

  function parseHash() {
    var h = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!h || h === '/') return { slug: '/cms/intro', anchor: '' };
    var i = h.indexOf('#');
    var slug = i >= 0 ? h.slice(0, i) : h;
    var anchor = i >= 0 ? h.slice(i + 1) : '';
    slug = slug.replace(/\/+$/, '');
    if (!slug) slug = '/cms/intro';
    return { slug: slug, anchor: anchor };
  }
  var lastSlug = null;
  function route() {
    var r = parseHash();
    if (r.slug === lastSlug) { scrollToAnchor(r.anchor); return; }
    lastSlug = r.slug;
    var page = bundle.pages[r.slug];
    if (!page) { renderMissing(r.slug); return; }
    current = byId[r.slug];
    document.title = page.title + ' · Strapi Documentation';
    renderPage(page);
    syncTags();
    if (document.body.classList.contains('skymode')) {
      document.body.classList.remove('skymode');
      $('skybtn').setAttribute('aria-pressed', 'false');
      if (laidOut) fitAll(false);
    }
    $('reader').scrollTop = 0;
    scrollToAnchor(r.anchor);
    markNav(r.slug);
    if (laidOut) { ensureVisible(); dirty = true; }
    closeResults();
  }
  function scrollToAnchor(a) {
    if (!a) return;
    var el = document.getElementById(a);
    if (el) requestAnimationFrame(function () {
      el.scrollIntoView({ block: 'start', behavior: REDUCED ? 'auto' : 'smooth' });
    });
  }
  function markNav(slug) {
    var prev = document.querySelector('.nav-a.cur');
    if (prev) prev.classList.remove('cur');
    var el = document.querySelector('.nav-a[data-slug="' + slug.replace(/"/g, '') + '"]');
    if (el) el.classList.add('cur');
  }
  function renderMissing(slug) {
    current = null;
    document.title = 'Not found · Strapi Documentation';
    $('page').innerHTML = '<h1 class="title">No such page</h1><p class="lede">' + esc(slug) +
      ' is not part of this documentation set.</p><p><a href="#/cms/intro">Strapi CMS documentation</a> · ' +
      '<a href="#/cloud/intro">Strapi Cloud documentation</a></p>';
  }

  /* ------------------------------------------------------ reading sheet */

  var uid = 0;

  function renderPage(p) {
    var si = byId[p.slug], st = stars[si];
    var sec = sections[st.secIdx], cl = clusters[st.comIdx];
    var o = [];

    o.push('<div class="crumb"><span class="prod">' + esc(sec.product === 'cms' ? 'Strapi CMS' : 'Strapi Cloud') +
      '</span><span class="sep">/</span><span>' + esc(p.section) + '</span></div>');
    o.push('<h1 class="title">' + esc(p.title) + '</h1>');
    if (p.description) o.push('<p class="lede">' + esc(p.description) + '</p>');

    o.push('<div class="meta">' +
      chip(st.m, 'cited by', st.m >= 12) +
      chip(st.out, 'links out', false) +
      chip(st.words.toLocaleString('en-US'), 'words', false) +
      chip(st.code, 'code block' + (st.code === 1 ? '' : 's'), false) +
      '</div>');

    /* where the two skies put this page */
    o.push('<div class="clusterbar">' +
      '<button type="button" data-open="section" data-i="' + st.secIdx + '">' +
        '<span class="k">Filed under</span><span class="v">' + esc(sec.label) + '</span>' +
        '<span class="sw" style="background:' + rgba(sec.rgb || [27, 26, 58], 0.6) + '"></span></button>' +
      '<button type="button" data-open="cluster" data-i="' + st.comIdx + '">' +
        '<span class="k">Cites with</span><span class="v">' +
          esc(cl.loose ? 'no community' : (cl.hub === p.slug ? 'the cluster it anchors' : cl.label)) + '</span>' +
        '<span class="sw" style="background:' + rgba(cl.rgb || [27, 26, 58], 0.6) + '"></span></button>' +
      '</div>');

    if (st.drift) {
      o.push('<p class="driftflag">This page <b>drifts</b>. It is filed under ' + esc(p.section) +
        ', but its citations put it in a community of ' + cl.members.length +
        ' pages mostly filed under <b>' + esc(cl.dominant) + '</b> (purity ' + cl.purity.toFixed(2) + ').</p>');
    }

    if (p.tags && p.tags.length) {
      o.push('<div class="tags"><span class="tagk">Tags</span>' + p.tags.map(function (t) {
        var n = (tagIndex[t] || []).length;
        return '<button type="button" class="tag' + (activeTag === t ? ' on' : '') + '" data-tag="' + attr(t) +
          '">' + esc(t) + '<span class="n">' + n + '</span></button>';
      }).join('') + '</div>');
    }

    var toc = p.headings.filter(function (h) { return h.level === 2 || h.level === 3; });
    if (toc.length > 2) {
      o.push('<nav class="toc" aria-label="On this page"><span class="k">On this page</span><ol>' +
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
      o.push('<h2>Cited by ' + ins.length + ' page' + (ins.length === 1 ? '' : 's') + '</h2><div class="linklist">');
      ins.forEach(function (j) {
        o.push('<a href="#' + attr(stars[j].slug) + '"><span>' + esc(stars[j].page.title) +
          '</span><span class="mag">' + stars[j].m + '</span></a>');
      });
      o.push('</div>');
    } else {
      o.push('<h2>Uncited</h2><p>No other page in this documentation links here. On the plate it sits at the margin of its constellation, drawn as an open circle.</p>');
    }
    if (outs.length) {
      o.push('<h2>Links to ' + outs.length + ' page' + (outs.length === 1 ? '' : 's') + '</h2><div class="linklist">');
      outs.forEach(function (j) {
        o.push('<a href="#' + attr(stars[j].slug) + '"><span>' + esc(stars[j].page.title) +
          '</span><span class="mag">' + stars[j].m + '</span></a>');
      });
      o.push('</div>');
    }
    o.push('<div class="prevnext">');
    o.push(prev ? '<a class="pn prev" href="#' + attr(prev.slug) + '"><span class="k">Previous</span>' + esc(prev.title) + '</a>' : '<span class="pn empty"></span>');
    o.push(next ? '<a class="pn next" href="#' + attr(next.slug) + '"><span class="k">Next</span>' + esc(next.title) + '</a>' : '<span class="pn empty"></span>');
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
      case 'tldr': return '<div class="tldr"><span class="k">In short</span>' + keep(b.html) + '</div>';
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
      return '<figure class="figure"><div class="fig-k">Figure</div><p class="fig-alt">' +
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

  /* the two buttons in the page header open the matching sheet in the index */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.clusterbar button');
    if (!b || !laidOut) return;
    var kind = b.getAttribute('data-open'), i = +b.getAttribute('data-i');
    if (kind === 'section') { setMode('filed'); openGroup(sections[i]); }
    else { setMode('cited'); openGroup(clusters[i]); }
  });

  /* --------------------------------------------------------- the search */

  var qEl, resEl, searchTimer = null;
  function initSearch() {
    qEl = $('q'); resEl = $('results');
    qEl.addEventListener('input', function () { clearTimeout(searchTimer); searchTimer = setTimeout(runSearch, 90); });
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
        if ($('drawer').classList.contains('open')) toggleDrawer(false);
        else if (resEl && !resEl.hidden) closeResults();
        else if (!$('index').hidden) closeIndex();
      }
    });
    document.addEventListener('click', function (e) {
      if (resEl && !resEl.hidden && !e.target.closest('#results') && !e.target.closest('.search')) closeResults();
    });
  }
  function runSearch() {
    var q = qEl.value.trim().toLowerCase();
    if (q.length < 2) { matched = null; closeResults(); dirty = true; return; }
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
    dirty = true;
    var o = ['<div class="res-head">' + hits.length + ' of ' + stars.length + ' pages match “' + esc(qEl.value.trim()) + '”</div>'];
    hits.slice(0, 24).forEach(function (h) {
      var d = searchDocs[h[1]], st = stars[d.i];
      o.push('<a class="res" href="#' + attr(st.slug) + '"><b>' + esc(d.title) + '</b><span>' +
        esc(st.page.section) + ' · ' + esc(st.slug) + ' · cited ' + st.m + '</span>' + snippet(d, terms) + '</a>');
    });
    if (!hits.length) o.push('<div class="res-head">Nothing on the plate matches.</div>');
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
  }

  initSearch();

  /* ---------------------------------------------- how to read this plate */
  (function () {
    var KEY = 'uranometria.howto.v1';
    var box = document.getElementById('howto');
    var go = document.getElementById('howto-go');
    var help = document.getElementById('helpbtn');
    if (!box) return;
    function open() { box.hidden = false; if (go) go.focus(); }
    function shut() {
      box.hidden = true;
      try { localStorage.setItem(KEY, '1'); } catch (e) { /* private window */ }
    }
    var seen = false;
    try { seen = localStorage.getItem(KEY) === '1'; } catch (e) { seen = false; }
    if (!seen) setTimeout(open, 420);
    if (go) go.addEventListener('click', shut);
    if (help) help.addEventListener('click', function () { box.hidden ? open() : shut(); });
    box.addEventListener('click', function (e) { if (e.target === box) shut(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !box.hidden) shut();
    });
  })();

})();
