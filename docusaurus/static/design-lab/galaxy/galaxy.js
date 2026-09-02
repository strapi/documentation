/* =============================================================
   Strapi Documentation — night sky
   290 pages as stars, 1231 real citations as lines.
   No external libraries.
   ============================================================= */
(function () {
  'use strict';

  /* ---------------- small utilities ---------------- */

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function attr(s) { return esc(s); }
  // image files are not bundled with this prototype: inline <img> becomes a readable chip,
  // which also keeps the page from firing 404s for assets that only exist on the live site
  var IMG_RE = /<img\b[^>]*>/gi;
  function unimg(h) {
    if (h == null) return '';
    h = String(h);
    return h;   /* assets resolve from the site root; keep the real <img> */
    /* eslint-disable no-unreachable */
    // eslint-disable-next-line
    return h.replace(IMG_RE, function (tag) {
      var a = tag.match(/alt\s*=\s*"([^"]*)"/i) || tag.match(/alt\s*=\s*'([^']*)'/i);
      var sr = tag.match(/src\s*=\s*"([^"]*)"/i) || tag.match(/src\s*=\s*'([^']*)'/i);
      var alt = a ? a[1] : '', src = sr ? sr[1] : '';
      var name = alt || src.split('/').pop() || 'image';
      return '<span class="inline-img" title="' + attr(src) + '">' + esc(name) + '</span>';
    });
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function stripTags(h) {
    return String(h || '').replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ').trim();
  }
  function $(id) { return document.getElementById(id); }

  /* ---------------- state ---------------- */

  var bundle = null, graph = null;
  var stars = [];              // {slug,x,y,r,m,sec,secIdx,orphan,label,vx,vy,sx,sy,phase}
  var byId = Object.create(null);
  var edges = [];              // {a,b} indices
  var adjOut = Object.create(null), adjIn = Object.create(null);
  var sections = [];           // {key,label,product,angle,color,rgb}
  var searchDocs = [];
  var current = null;          // star index of open page
  var hovered = -1;
  var matched = null;          // Set of indices or null
  var laidOut = false;

  var cam = { x: 0, y: 0, s: 0.26, tx: 0, ty: 0, ts: 0.26 };
  var canvas, ctx, DPR = 1, W = 0, H = 0;
  var glowSprites = [];
  var introT = 0, introRunning = false;

  /* ---------------- boot ---------------- */

  var t0 = performance.now();
  Promise.all([
    fetch('content.json').then(function (r) { return r.json(); }),
    fetch('graph.json').then(function (r) { return r.json(); })
  ]).then(function (res) {
    bundle = res[0]; graph = res[1];
    document.documentElement.removeAttribute('data-boot');
    prepare();
    buildDrawer();
    route();                       // first readable content as early as possible
    window.addEventListener('hashchange', route);
    requestAnimationFrame(function () {
      layout();
      initCanvas();
      wireSky();
      laidOut = true;
      if (REDUCED) { focusCurrent(true); }
      else {
        fitAll(true);
        introRunning = true; introT = performance.now();
        setTimeout(function () { focusCurrent(false); }, 1500);
      }
      loop();
    });
  }).catch(function (e) {
    var p = $('page');
    if (p) p.innerHTML = '<h1 class="title">Unable to load the documentation</h1><p>' + esc(e && e.message) + '</p>';
  });

  /* ---------------- data preparation ---------------- */

  function prepare() {
    $('brandver').textContent = bundle.version || '';

    // section order comes from nav, so constellations follow the real sidebar
    var seen = Object.create(null), i;
    bundle.nav.forEach(function (s) {
      var key = s.product + '|' + s.label;
      if (seen[key] === undefined) {
        seen[key] = sections.length;
        sections.push({ key: key, label: s.label, product: s.product, idx: sections.length });
      }
    });
    var N = sections.length;
    sections.forEach(function (s, k) {
      s.angle = (k / N) * Math.PI * 2 + 0.35;
      // cold palette: cms leans cyan-blue, cloud leans violet
      var base = s.product === 'cloud' ? 258 : 196;
      var spread = s.product === 'cloud' ? 26 : 52;
      var within = 0, count = 0;
      sections.forEach(function (o, j) { if (o.product === s.product) { if (j < k) within++; count++; } });
      var hue = base + (count > 1 ? (within / (count - 1)) * spread : 0);
      s.hue = hue;
      s.rgb = hsl2rgb(hue, 0.72, 0.72);
      s.color = 'rgb(' + s.rgb.join(',') + ')';
    });

    bundle.order.forEach(function (slug) {
      var p = bundle.pages[slug];
      if (!p) return;
      var key = p.product + '|' + p.section;
      var sIdx = seen[key] !== undefined ? seen[key] : 0;
      var m = graph.inbound[slug] || 0;
      var st = {
        slug: slug, page: p, m: m, out: graph.outbound[slug] || 0,
        words: graph.words[slug] || 0, code: graph.code[slug] || 0,
        secIdx: sIdx, orphan: m === 0,
        x: 0, y: 0, vx: 0, vy: 0, sx: 0, sy: 0, r: 0,
        label: p.sidebarLabel || p.title
      };
      st.r = st.orphan ? 1.35 : 1.5 + Math.sqrt(m) * 1.45;
      byId[slug] = stars.length;
      stars.push(st);
    });

    graph.edges.forEach(function (e) {
      var a = byId[e[0]], b = byId[e[1]];
      if (a === undefined || b === undefined || a === b) return;
      edges.push([a, b]);
      (adjOut[a] || (adjOut[a] = [])).push(b);
      (adjIn[b] || (adjIn[b] = [])).push(a);
    });

    $('l-pages').textContent = stars.length;
    $('l-edges').textContent = edges.length;
    $('l-orph').textContent = stars.filter(function (s) { return s.orphan; }).length;
    $('l-sec').textContent = sections.length;

    // search index
    stars.forEach(function (st, i) {
      var p = st.page;
      var head = p.headings.map(function (h) { return h.text; }).join(' ');
      var body = blockText(p.blocks, []).join(' ');
      searchDocs.push({
        i: i,
        title: p.title || '',
        low: (p.title + ' ' + (p.sidebarLabel || '') + ' ' + (p.description || '') + ' ' +
              (p.tags || []).join(' ') + ' ' + p.section + ' ' + st.slug).toLowerCase(),
        headLow: head.toLowerCase(),
        body: body.slice(0, 9000),
        bodyLow: body.slice(0, 9000).toLowerCase()
      });
    });
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
        case 'columns': b.cols.forEach(function (c) { blockText(c, out); }); break;
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

  function hsl2rgb(h, s, l) {
    h = (h % 360) / 360;
    var r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
      var f = function (t) {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      r = f(h + 1 / 3); g = f(h); b = f(h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  /* ---------------- force directed layout (seeded, run once) ---------------- */

  function layout() {
    var rnd = mulberry32(20260902);
    var cited = [], orphans = [];
    stars.forEach(function (s, i) { (s.orphan ? orphans : cited).push(i); });

    var ANCHOR_R = 1250;
    sections.forEach(function (s) {
      s.ax = Math.cos(s.angle) * ANCHOR_R;
      s.ay = Math.sin(s.angle) * ANCHOR_R;
    });

    cited.forEach(function (i) {
      var s = stars[i], sec = sections[s.secIdx];
      var a = rnd() * Math.PI * 2, rr = 40 + rnd() * 190;
      s.x = sec.ax + Math.cos(a) * rr;
      s.y = sec.ay + Math.sin(a) * rr;
      s.vx = 0; s.vy = 0;
      s.mass = 1 + Math.sqrt(s.m) * 0.55;
    });

    var citedEdges = edges.filter(function (e) { return !stars[e[0]].orphan && !stars[e[1]].orphan; });
    var ITER = 460;
    var REP = 2200, SPRING = 0.013, IDEAL = 92, ANCH = 0.030, DAMP = 0.82;

    for (var it = 0; it < ITER; it++) {
      var alpha = 1 - it / ITER;
      var n = cited.length, a, b, i, j, dx, dy, d2, d, f;
      // repulsion, O(n^2) over 240 nodes
      for (i = 0; i < n; i++) {
        a = stars[cited[i]];
        for (j = i + 1; j < n; j++) {
          b = stars[cited[j]];
          dx = a.x - b.x; dy = a.y - b.y;
          d2 = dx * dx + dy * dy;
          if (d2 < 1e-4) { dx = (rnd() - 0.5); dy = (rnd() - 0.5); d2 = 0.25; }
          if (d2 > 400000) continue;
          d = Math.sqrt(d2);
          f = (REP * a.mass * b.mass * (a.secIdx === b.secIdx ? 1 : 1.7)) / d2;
          if (f > 40) f = 40;
          dx /= d; dy /= d;
          a.vx += dx * f; a.vy += dy * f;
          b.vx -= dx * f; b.vy -= dy * f;
        }
      }
      // springs on the real citation edges
      for (i = 0; i < citedEdges.length; i++) {
        a = stars[citedEdges[i][0]]; b = stars[citedEdges[i][1]];
        dx = b.x - a.x; dy = b.y - a.y;
        d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        f = (d - IDEAL) * SPRING * (a.secIdx === b.secIdx ? 1 : 0.20);
        dx = dx / d * f; dy = dy / d * f;
        a.vx += dx * b.mass / (a.mass + b.mass) * 2;
        a.vy += dy * b.mass / (a.mass + b.mass) * 2;
        b.vx -= dx * a.mass / (a.mass + b.mass) * 2;
        b.vy -= dy * a.mass / (a.mass + b.mass) * 2;
      }
      // constellation cohesion
      for (i = 0; i < n; i++) {
        a = stars[cited[i]];
        var sec = sections[a.secIdx];
        a.vx += (sec.ax - a.x) * ANCH;
        a.vy += (sec.ay - a.y) * ANCH;
      }
      // integrate
      for (i = 0; i < n; i++) {
        a = stars[cited[i]];
        a.vx *= DAMP; a.vy *= DAMP;
        var sp = Math.sqrt(a.vx * a.vx + a.vy * a.vy), cap = 26 * (0.25 + alpha);
        if (sp > cap) { a.vx = a.vx / sp * cap; a.vy = a.vy / sp * cap; }
        a.x += a.vx; a.y += a.vy;
      }
    }

    // centre and normalise
    var cx = 0, cy = 0;
    cited.forEach(function (i) { cx += stars[i].x; cy += stars[i].y; });
    cx /= cited.length; cy /= cited.length;
    var maxR = 1;
    cited.forEach(function (i) {
      stars[i].x -= cx; stars[i].y -= cy;
      maxR = Math.max(maxR, Math.hypot(stars[i].x, stars[i].y));
    });
    var k = 900 / maxR;
    cited.forEach(function (i) { stars[i].x *= k; stars[i].y *= k; });

    // uncited pages drift at the rim, grouped by their section's direction
    orphans.sort(function (a, b) {
      return stars[a].secIdx - stars[b].secIdx || (stars[a].slug < stars[b].slug ? -1 : 1);
    });
    var perSec = Object.create(null);
    orphans.forEach(function (i) { (perSec[stars[i].secIdx] || (perSec[stars[i].secIdx] = [])).push(i); });
    Object.keys(perSec).forEach(function (key) {
      var list = perSec[key], sec = sections[key];
      var spread = Math.min(0.85, 0.16 + list.length * 0.055);
      list.forEach(function (idx, n) {
        var t = list.length === 1 ? 0 : (n / (list.length - 1) - 0.5) * 2;
        var ang = sec.angle + t * spread + (mulberry32(idx * 977 + 13)() - 0.5) * 0.05;
        var rad = 985 + mulberry32(idx * 131 + 7)() * 145;
        var s = stars[idx];
        s.x = Math.cos(ang) * rad; s.y = Math.sin(ang) * rad;
      });
    });

    // the sky is stretched to the shape of a screen so it fills the frame
    stars.forEach(function (st) { st.x *= 1.3; });

    // start positions for the intro, and twinkle phases
    stars.forEach(function (s, i) {
      var r1 = mulberry32(i * 7919 + 3);
      s.phase = r1() * Math.PI * 2;
      s.tw = 0.55 + r1() * 0.85;
      var a = r1() * Math.PI * 2, rr = 1500 + r1() * 2200;
      s.ix = Math.cos(a) * rr; s.iy = Math.sin(a) * rr;
    });

    sections.forEach(function (sec) {
      var sx = 0, sy = 0, k = 0;
      stars.forEach(function (st) { if (st.secIdx === sec.idx && !st.orphan) { sx += st.x; sy += st.y; k++; } });
      if (k) { sec.cx = sx / k; sec.cy = sy / k; sec.count = k; } else { sec.cx = null; }
    });

    buildPickGrid();
  }

  /* pick grid */
  var grid = null, GRID = 90, gminx = 0, gminy = 0, gcols = 0, growsN = 0;
  function buildPickGrid() {
    var minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    stars.forEach(function (s) {
      minx = Math.min(minx, s.x); miny = Math.min(miny, s.y);
      maxx = Math.max(maxx, s.x); maxy = Math.max(maxy, s.y);
    });
    gminx = minx - 10; gminy = miny - 10;
    gcols = Math.ceil((maxx - gminx + 20) / GRID) + 1;
    growsN = Math.ceil((maxy - gminy + 20) / GRID) + 1;
    grid = new Array(gcols * growsN);
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
      if (r < 0 || r >= growsN) continue;
      for (var c = c0; c <= c1; c++) {
        if (c < 0 || c >= gcols) continue;
        var cell = grid[r * gcols + c]; if (!cell) continue;
        for (var i = 0; i < cell.length; i++) {
          var s = stars[cell[i]];
          var d = Math.hypot(s.x - wx, s.y - wy);
          var hit = Math.max(s.r + 4, tol * 0.6);
          if (d < hit && d < bestD) { bestD = d; best = cell[i]; }
        }
      }
    }
    return best;
  }

  /* ---------------- canvas ---------------- */

  function initCanvas() {
    canvas = $('sky');
    ctx = canvas.getContext('2d', { alpha: false });
    resize();
    window.addEventListener('resize', function () { resize(); draw(); });
    // glow sprites, one per constellation plus one warm
    glowSprites = sections.map(function (s) { return makeGlow(s.rgb); });
    warmGlow = makeGlow([255, 177, 90]);
  }
  var warmGlow = null;

  function makeGlow(rgb) {
    var size = 96, c = document.createElement('canvas');
    c.width = c.height = size;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.95)');
    grd.addColorStop(0.18, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.42)');
    grd.addColorStop(0.45, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.11)');
    grd.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
    g.fillStyle = grd; g.fillRect(0, 0, size, size);
    return c;
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  }

  function viewCX() {
    var readerOpen = !document.body.classList.contains('skymode');
    if (readerOpen && W > 900) {
      var rw = Math.min(760, W * 0.58);
      return (W - rw) / 2;
    }
    return W / 2;
  }
  function w2s(x, y) {
    return [(x - cam.x) * cam.s + viewCX(), (y - cam.y) * cam.s + H / 2];
  }
  function s2w(x, y) {
    return [(x - viewCX()) / cam.s + cam.x, (y - H / 2) / cam.s + cam.y];
  }

  function focusCurrent(instant) {
    if (current == null || !stars[current]) return;
    var s = stars[current];
    cam.tx = s.x; cam.ty = s.y;
    cam.ts = clamp(Math.max(cam.ts, 0.62), 0.5, 1.5);
    if (instant || REDUCED) { cam.x = cam.tx; cam.y = cam.ty; cam.s = cam.ts; }
  }

  function fitAll(instant) {
    // centred on the layout origin, sized so the cited core and the uncited rim both fit
    var xs = stars.map(function (s) { return Math.abs(s.x); }).sort(function (a, b) { return a - b; });
    var ys = stars.map(function (s) { return Math.abs(s.y); }).sort(function (a, b) { return a - b; });
    var Rx = xs[Math.floor(xs.length * 0.97)] * 1.04, Ry = ys[Math.floor(ys.length * 0.97)] * 1.04;
    cam.tx = 0; cam.ty = 0;
    var availW = (document.body.classList.contains('skymode') || W <= 900) ? W : W - Math.min(760, W * 0.58);
    cam.ts = clamp(Math.min(availW / (2 * Rx + 80), H / (2 * Ry + 60)), 0.08, 2);
    if (instant || REDUCED) { cam.x = cam.tx; cam.y = cam.ty; cam.s = cam.ts; }
    dirty = true;
  }

  var lastFrame = 0;
  function loop(ts) {
    requestAnimationFrame(loop);
    if (!laidOut) return;
    // ease camera
    var e = REDUCED ? 1 : 0.12;
    cam.x += (cam.tx - cam.x) * e;
    cam.y += (cam.ty - cam.y) * e;
    cam.s += (cam.ts - cam.s) * e;
    if (REDUCED && ts - lastFrame < 200 && !dirty) return;
    lastFrame = ts || 0;
    draw(ts || 0);
    dirty = false;
  }
  var dirty = true;

  function draw(now) {
    if (!ctx) return;
    now = now || performance.now();
    var intro = 1;
    if (introRunning) {
      var p = (now - introT) / 1400;
      if (p >= 1) { p = 1; introRunning = false; }
      intro = 1 - Math.pow(1 - p, 3);
    }

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = '#03050a';
    ctx.fillRect(0, 0, W, H);

    // faint galactic haze
    var cxp = viewCX(), cyp = H / 2;
    var hz = ctx.createRadialGradient(cxp, cyp, 0, cxp, cyp, Math.max(W, H) * 0.75);
    hz.addColorStop(0, 'rgba(32,58,104,0.34)');
    hz.addColorStop(0.45, 'rgba(18,30,58,0.18)');
    hz.addColorStop(1, 'rgba(3,5,10,0)');
    ctx.fillStyle = hz; ctx.fillRect(0, 0, W, H);

    // project
    var i, s, n = stars.length;
    for (i = 0; i < n; i++) {
      s = stars[i];
      var x = intro < 1 ? s.ix + (s.x - s.ix) * intro : s.x;
      var y = intro < 1 ? s.iy + (s.y - s.iy) * intro : s.y;
      var p2 = w2s(x, y);
      s.sx = p2[0]; s.sy = p2[1];
    }

    var lit = Object.create(null);
    var anchor = hovered >= 0 ? hovered : current;
    if (anchor != null && anchor >= 0) {
      lit[anchor] = 2;
      (adjOut[anchor] || []).forEach(function (j) { lit[j] = lit[j] || 1; });
      (adjIn[anchor] || []).forEach(function (j) { lit[j] = lit[j] || 1; });
    }

    var searching = matched !== null;
    var margin = 80;

    /* --- edges --- */
    ctx.lineWidth = Math.max(0.35, 0.5 * Math.min(cam.s, 1.6));
    var dimPath = new Path2D(), litPath = new Path2D();
    for (i = 0; i < edges.length; i++) {
      var a = stars[edges[i][0]], b = stars[edges[i][1]];
      if ((a.sx < -margin && b.sx < -margin) || (a.sx > W + margin && b.sx > W + margin) ||
          (a.sy < -margin && b.sy < -margin) || (a.sy > H + margin && b.sy > H + margin)) continue;
      var isLit = anchor != null && anchor >= 0 && (edges[i][0] === anchor || edges[i][1] === anchor);
      var path = isLit ? litPath : dimPath;
      if (searching && !isLit && !(matched.has(edges[i][0]) && matched.has(edges[i][1]))) continue;
      path.moveTo(a.sx, a.sy); path.lineTo(b.sx, b.sy);
    }
    ctx.strokeStyle = searching ? 'rgba(110,150,210,0.07)' : 'rgba(126,174,238,0.14)';
    ctx.stroke(dimPath);
    if (anchor != null && anchor >= 0) {
      ctx.lineWidth = Math.max(0.7, 0.9 * Math.min(cam.s, 1.8));
      ctx.strokeStyle = 'rgba(255,177,90,0.42)';
      ctx.stroke(litPath);
    }

    /* --- glows --- */
    ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < n; i++) {
      s = stars[i];
      if (s.sx < -60 || s.sx > W + 60 || s.sy < -60 || s.sy > H + 60) continue;
      var strength = s.orphan ? 0.22 : Math.min(1, 0.22 + s.m / 26);
      if (searching) strength *= matched.has(i) ? 1.25 : 0.12;
      if (i === current) strength = Math.max(strength, 1.15);
      else if (lit[i]) strength = Math.max(strength, 0.75);
      if (strength < 0.1) continue;
      var tw = REDUCED ? 1 : 1 + Math.sin(now / 900 * s.tw + s.phase) * 0.16;
      var size = (10 + s.r * 6.5) * cam.s * (i === current ? 2.1 : 1) * tw;
      if (size < 4) size = 4;
      if (size > 420) size = 420;
      ctx.globalAlpha = clamp(strength * 0.85, 0, 1) * intro;
      var sprite = (i === current) ? warmGlow : glowSprites[s.secIdx];
      ctx.drawImage(sprite, s.sx - size / 2, s.sy - size / 2, size, size);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    /* --- cores --- */
    for (i = 0; i < n; i++) {
      s = stars[i];
      if (s.sx < -20 || s.sx > W + 20 || s.sy < -20 || s.sy > H + 20) continue;
      var rr = Math.max(0.7, s.r * cam.s * (i === current ? 1.45 : 1));
      var alpha = s.orphan ? 0.7 : 0.9;
      if (searching) alpha *= matched.has(i) ? 1.15 : 0.14;
      if (lit[i]) alpha = 1;
      ctx.globalAlpha = clamp(alpha, 0, 1) * intro;
      ctx.fillStyle = i === current ? '#ffd9a8' : (lit[i] ? '#eaf4ff' : coreColor(s));
      ctx.beginPath(); ctx.arc(s.sx, s.sy, rr, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // current star ring
    if (current != null && current >= 0 && stars[current]) {
      s = stars[current];
      var pulse = REDUCED ? 1 : 1 + Math.sin(now / 520) * 0.12;
      ctx.strokeStyle = 'rgba(255,177,90,0.75)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(s.sx, s.sy, Math.max(9, s.r * cam.s * 2.4) * pulse, 0, 6.2832); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,177,90,0.22)';
      ctx.beginPath(); ctx.arc(s.sx, s.sy, Math.max(16, s.r * cam.s * 4.1) * pulse, 0, 6.2832); ctx.stroke();
    }

    /* --- constellation names --- */
    var reserved = [];
    if (cam.s < 1.5) {
      var cfade = clamp((1.5 - cam.s) / 0.7, 0, 1) * (searching ? 0.35 : 1);
      ctx.textAlign = 'center';
      var secOrder = sections.slice().sort(function (a, b) { return (b.count || 0) - (a.count || 0); });
      for (i = 0; i < secOrder.length; i++) {
        var sc = secOrder[i];
        if (sc.cx == null) continue;
        var cp = w2s(sc.cx, sc.cy);
        if (cp[0] < -140 || cp[0] > W + 140 || cp[1] < -40 || cp[1] > H + 40) continue;
        var fsz = clamp(11 + cam.s * 7, 11, 19);
        ctx.font = '600 ' + fsz.toFixed(1) + 'px "IBM Plex Mono", monospace';
        var lw = ctx.measureText(sc.label.toUpperCase().split('').join('\u2009')).width;
        var box = [cp[0] - lw / 2 - 8, cp[1] - fsz - 8, lw + 16, fsz + 30];
        var clash = false;
        for (var z = 0; z < reserved.length; z++) {
          var rb = reserved[z];
          if (box[0] < rb[0] + rb[2] && box[0] + box[2] > rb[0] && box[1] < rb[1] + rb[3] && box[1] + box[3] > rb[1]) { clash = true; break; }
        }
        if (clash) continue;
        reserved.push(box);
        ctx.globalAlpha = 0.5 * cfade * intro;
        ctx.fillStyle = 'rgb(' + sc.rgb.join(',') + ')';
        ctx.fillText(sc.label.toUpperCase().split('').join('\u2009'), cp[0], cp[1] - 6);
        ctx.globalAlpha = 0.32 * cfade * intro;
        ctx.font = '400 10px "IBM Plex Mono", monospace';
        ctx.fillStyle = 'rgba(190,208,232,0.9)';
        ctx.fillText(sc.product + ' · ' + sc.count + ' page' + (sc.count === 1 ? '' : 's'), cp[0], cp[1] + 10);
      }
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }

    /* --- labels --- */
    ctx.font = '500 11px "IBM Plex Mono", monospace';
    ctx.textBaseline = 'middle';
    var placed = reserved.map(function (b) { return [b[0], b[1], b[2]]; });
    function labelFits(x, y, w) {
      for (var q = 0; q < placed.length; q++) {
        var p = placed[q];
        if (x < p[0] + p[2] + 6 && x + w + 6 > p[0] && y < p[1] + 26 && y + 26 > p[1]) return false;
      }
      placed.push([x, y, w]); return true;
    }
    var order = [];
    for (i = 0; i < n; i++) {
      s = stars[i];
      if (s.sx < 0 || s.sx > W || s.sy < 0 || s.sy > H) continue;
      var prio = -1;
      if (i === current) prio = 100;
      else if (i === hovered) prio = 99;
      else if (lit[i]) prio = 50 + s.m;
      else if (searching) prio = matched.has(i) ? 30 + s.m : -1;
      else if (!s.orphan && (s.m >= 12 || (cam.s > 0.85 && s.m >= 5) || (cam.s > 1.6 && s.m >= 2) || cam.s > 2.6)) prio = s.m;
      if (prio >= 0) order.push([prio, i]);
    }
    order.sort(function (a, b) { return b[0] - a[0]; });
    for (var q = 0; q < order.length && q < 90; q++) {
      i = order[q][1]; s = stars[i];
      var txt = s.label;
      if (txt.length > 34) txt = txt.slice(0, 33) + '…';
      var w = ctx.measureText(txt).width;
      var lx = s.sx + Math.max(6, s.r * cam.s) + 6, ly = s.sy;
      if (lx + w > W - 8) lx = s.sx - w - Math.max(6, s.r * cam.s) - 6;
      if (!labelFits(lx, ly - 6, w)) continue;
      ctx.globalAlpha = intro;
      ctx.fillStyle = 'rgba(3,5,10,0.62)';
      ctx.fillRect(lx - 3, ly - 7.5, w + 6, 15);
      ctx.fillStyle = i === current ? '#ffd9a8' : (lit[i] || i === hovered ? '#eaf4ff' : 'rgba(200,216,238,0.82)');
      ctx.fillText(txt, lx, ly);
    }
    ctx.globalAlpha = 1;
  }

  function coreColor(s) {
    var rgb = sections[s.secIdx].rgb;
    var mix = s.orphan ? 0.15 : Math.min(0.75, 0.2 + s.m / 40);
    var r = Math.round(rgb[0] + (255 - rgb[0]) * mix);
    var g = Math.round(rgb[1] + (255 - rgb[1]) * mix);
    var b = Math.round(rgb[2] + (255 - rgb[2]) * mix);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  /* ---------------- sky interaction ---------------- */

  function wireSky() {
    var dragging = false, moved = false, lx = 0, ly = 0;

    canvas.addEventListener('pointerdown', function (e) {
      dragging = true; moved = false; lx = e.clientX; ly = e.clientY;
      canvas.classList.add('dragging');
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', function (e) {
      if (dragging) {
        var dx = e.clientX - lx, dy = e.clientY - ly;
        if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        cam.x -= dx / cam.s; cam.y -= dy / cam.s;
        cam.tx = cam.x; cam.ty = cam.y;
        lx = e.clientX; ly = e.clientY;
        dirty = true;
        hideTip();
        return;
      }
      var wp = s2w(e.clientX, e.clientY);
      var hit = pick(wp[0], wp[1], 14 / cam.s);
      if (hit !== hovered) {
        hovered = hit; dirty = true;
        if (hit >= 0) showTip(stars[hit], e.clientX, e.clientY); else hideTip();
        canvas.style.cursor = hit >= 0 ? 'pointer' : (dragging ? 'grabbing' : 'grab');
      } else if (hit >= 0) { moveTip(e.clientX, e.clientY); }
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false; canvas.classList.remove('dragging');
      if (!moved) {
        var wp = s2w(e.clientX, e.clientY);
        var hit = pick(wp[0], wp[1], 14 / cam.s);
        if (hit >= 0) { location.hash = '#' + stars[hit].slug; document.body.classList.remove('skymode'); syncSkyBtn(); }
      }
    }
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', function () { dragging = false; canvas.classList.remove('dragging'); });
    canvas.addEventListener('pointerleave', function () { hovered = -1; hideTip(); dirty = true; });

    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      var before = s2w(e.clientX, e.clientY);
      var f = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0016));
      cam.ts = clamp(cam.s * f, 0.14, 7);
      cam.s = cam.ts;
      var after = s2w(e.clientX, e.clientY);
      cam.x += before[0] - after[0]; cam.y += before[1] - after[1];
      cam.tx = cam.x; cam.ty = cam.y;
      dirty = true;
    }, { passive: false });

    $('skybtn').addEventListener('click', function () {
      var on = !document.body.classList.contains('skymode');
      document.body.classList.toggle('skymode', on);
      syncSkyBtn();
      if (on) fitAll(false); else focusCurrent(false);
      dirty = true;
    });
  }
  function syncSkyBtn() {
    var on = document.body.classList.contains('skymode');
    $('skybtn').setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  var tipEl;
  function showTip(s, x, y) {
    tipEl = tipEl || $('tooltip');
    var sec = sections[s.secIdx];
    tipEl.innerHTML = '<b>' + esc(s.page.title) + '</b>' +
      '<span class="sec">' + esc(sec.product.toUpperCase() + ' · ' + sec.label) + '</span>' +
      '<span>' + s.m + ' citation' + (s.m === 1 ? '' : 's') + ' in · ' + s.out + ' out · ' +
      s.words.toLocaleString('en-US') + ' words</span>';
    tipEl.hidden = false;
    moveTip(x, y);
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

  /* ---------------- navigation drawer ---------------- */

  function buildDrawer() {
    var html = [], lastProd = null;
    var secKeyIdx = Object.create(null);
    sections.forEach(function (s, i) { secKeyIdx[s.key] = i; });

    bundle.nav.forEach(function (sec) {
      if (sec.product !== lastProd) {
        html.push('<div class="nav-prod">' + esc(sec.product === 'cms' ? 'Strapi CMS' : 'Strapi Cloud') + '</div>');
        lastProd = sec.product;
      }
      var si = secKeyIdx[sec.product + '|' + sec.label];
      var col = si !== undefined ? sections[si].color : '#79cfff';
      html.push('<div class="nav-sec"><span class="dot" style="background:' + col + '"></span>' + esc(sec.label) + '</div>');
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
    $('drawer').addEventListener('click', function (e) {
      if (e.target.closest('a')) toggleDrawer(false);
    });
  }
  function navLink(item, sub) {
    return '<a class="nav-a' + (sub ? ' sub' : '') + '" data-slug="' + attr(item.slug) + '" href="#' +
      attr(item.slug) + '">' + esc(item.label) + '</a>';
  }
  function toggleDrawer(force) {
    var d = $('drawer');
    var open = force === undefined ? !d.classList.contains('open') : force;
    d.classList.toggle('open', open);
    $('scrim').hidden = !open;
    $('navbtn').setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      var cur = d.querySelector('.nav-a.cur');
      if (cur) cur.scrollIntoView({ block: 'center' });
    }
  }

  /* ---------------- routing ---------------- */

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
    document.body.classList.remove('skymode'); syncSkyBtn();
    $('reader').scrollTop = 0;
    scrollToAnchor(r.anchor);
    markNav(r.slug);
    if (laidOut) { focusCurrent(false); dirty = true; }
    closeResults();
  }
  function scrollToAnchor(a) {
    if (!a) return;
    var el = document.getElementById(a);
    if (el) requestAnimationFrame(function () { el.scrollIntoView({ block: 'start', behavior: REDUCED ? 'auto' : 'smooth' }); });
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
      ' is not part of this documentation set.</p><p>' +
      '<a href="#/cms/intro">Strapi CMS documentation</a> · <a href="#/cloud/intro">Strapi Cloud documentation</a></p>';
  }

  /* ---------------- reading view ---------------- */

  var uid = 0;

  function renderPage(p) {
    var st = stars[byId[p.slug]];
    var sec = sections[st.secIdx];
    var out = [];

    out.push('<div class="crumb"><span class="prod">' + esc(sec.product === 'cms' ? 'Strapi CMS' : 'Strapi Cloud') +
      '</span><span class="sep">/</span><span>' + esc(p.section) + '</span></div>');
    out.push('<h1 class="title">' + esc(p.title) + '</h1>');
    if (p.description) out.push('<p class="lede">' + esc(p.description) + '</p>');

    out.push('<div class="meta">' +
      chip(st.m, 'citation' + (st.m === 1 ? '' : 's') + ' in', st.m >= 12) +
      chip(st.out, 'links out', false) +
      chip(st.words.toLocaleString('en-US'), 'words', false) +
      chip(st.code, 'code block' + (st.code === 1 ? '' : 's'), false) +
      '</div>');

    if (p.tags && p.tags.length) {
      out.push('<div class="tags">' + p.tags.map(function (t) {
        return '<span class="tag">' + esc(t) + '</span>';
      }).join('') + '</div>');
    }

    var toc = p.headings.filter(function (h) { return h.level === 2 || h.level === 3; });
    if (toc.length > 2) {
      out.push('<nav class="toc" aria-label="On this page"><span class="k">On this page</span><ol>' +
        toc.map(function (h) {
          return '<li class="lv' + h.level + '"><a href="#' + attr(p.slug) + '#' + attr(h.id) + '">' + esc(h.text) + '</a></li>';
        }).join('') + '</ol></nav>');
    }

    out.push(blocksHTML(p.blocks));
    out.push(footer(p, st));

    $('page').innerHTML = out.join('');
  }

  function chip(v, label, hot) {
    return '<span class="chip' + (hot ? ' hot' : '') + '"><b>' + esc(v) + '</b> ' + esc(label) + '</span>';
  }

  function footer(p, st) {
    var i = bundle.order.indexOf(p.slug);
    var prev = i > 0 ? bundle.pages[bundle.order[i - 1]] : null;
    var next = i >= 0 && i < bundle.order.length - 1 ? bundle.pages[bundle.order[i + 1]] : null;
    var o = ['<div class="pfoot">'];

    var ins = (adjIn[byId[p.slug]] || []).slice().sort(function (a, b) { return stars[b].m - stars[a].m; });
    var outs = (adjOut[byId[p.slug]] || []).slice().sort(function (a, b) { return stars[b].m - stars[a].m; });

    if (ins.length) {
      o.push('<h2>Cited by ' + ins.length + ' page' + (ins.length === 1 ? '' : 's') + '</h2><div class="linklist">');
      ins.forEach(function (j) {
        o.push('<a href="#' + attr(stars[j].slug) + '"><span>' + esc(stars[j].page.title) +
          '</span><span class="mag">' + stars[j].m + '</span></a>');
      });
      o.push('</div>');
    } else {
      o.push('<h2>Uncited</h2><p>No other page in this documentation links here. It sits at the rim of the sky.</p>');
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
    o.push(prev ? '<a class="pn prev" href="#' + attr(prev.slug) + '"><span class="k">Previous</span>' + esc(prev.title) + '</a>'
                : '<span class="pn empty"></span>');
    o.push(next ? '<a class="pn next" href="#' + attr(next.slug) + '"><span class="k">Next</span>' + esc(next.title) + '</a>'
                : '<span class="pn empty"></span>');
    o.push('</div></div>');
    return o.join('');
  }

  /* ---- blocks ---- */

  function blocksHTML(blocks) {
    if (!blocks || !blocks.length) return '';
    var o = [];
    for (var i = 0; i < blocks.length; i++) o.push(blockHTML(blocks[i]));
    return o.join('');
  }

  function blockHTML(b) {
    if (!b || !b.t) return '';
    switch (b.t) {
      case 'p': return '<p>' + unimg(b.html) + '</p>';
      case 'tldr': return '<div class="tldr"><span class="k">In short</span>' + unimg(b.html) + '</div>';
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
    var open = '<' + tag + (tag === 'ol' && b.start && b.start !== 1 ? ' start="' + attr(b.start) + '"' : '') + '>';
    var o = [open];
    b.items.forEach(function (it) {
      if (typeof it === 'string') o.push('<li>' + unimg(it) + '</li>');
      else o.push('<li>' + unimg(it.html || '') + blocksHTML(it.blocks) + '</li>');
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
    var title = b.title || meta[1];
    return '<div class="adm adm-' + attr(k) + '"><div class="adm-h"><span class="adm-i" aria-hidden="true">' +
      meta[0] + '</span>' + esc(title) + '</div>' + blocksHTML(b.blocks) + '</div>';
  }

  function tableHTML(b) {
    var align = b.align || [];
    var o = ['<div class="tablewrap"><table><thead><tr>'];
    b.head.forEach(function (h, i) {
      o.push('<th' + (align[i] && align[i] !== 'left' ? ' style="text-align:' + attr(align[i]) + '"' : '') + '>' + unimg(h) + '</th>');
    });
    o.push('</tr></thead><tbody>');
    b.rows.forEach(function (row) {
      o.push('<tr>');
      row.forEach(function (cell, i) {
        o.push('<td' + (align[i] && align[i] !== 'left' ? ' style="text-align:' + attr(align[i]) + '"' : '') + '>' + unimg(cell) + '</td>');
      });
      o.push('</tr>');
    });
    o.push('</tbody></table></div>');
    return o.join('');
  }

  function tabsHTML(b) {
    var id = 'tabs' + (++uid);
    var group = b.groupId || id;
    var o = ['<div class="tabs" data-group="' + attr(group) + '"><div class="tablist" role="tablist">'];
    b.tabs.forEach(function (t, i) {
      o.push('<button class="tabbtn" role="tab" type="button" data-i="' + i + '" data-val="' +
        attr(t.value || t.label) + '" aria-selected="' + (i === 0) + '" id="' + id + '-t' + i + '">' +
        esc(t.label) + '</button>');
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
    return '<details' + (b.id ? ' id="' + attr(b.id) + '"' : '') + '><summary>' +
      unimg(b.summary || 'Details') +
      '</summary><div class="details-body">' + blocksHTML(b.blocks) + '</div></details>';
  }

  function imgHTML(b) {
    // srcs are root absolute, so they resolve wherever the site is served from
    var src = b.light || b.dark || '';
    if (!src) {
      return '<figure class="figure"><div class="fig-k">Figure</div>' +
        '<p class="fig-alt">' + esc(b.alt || 'Screenshot') + '</p></figure>';
    }
    return '<figure class="figure figure--real">' +
      '<img src="' + attr(src) + '" alt="' + attr(b.alt || '') + '" loading="lazy" decoding="async">' +
      (b.caption ? '<figcaption>' + unimg(b.caption) + '</figcaption>' : '') +
      '</figure>';
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
    if (b.description) o.push('<p class="pdesc">' + unimg(b.description) + '</p>');
    if (b.params && b.params.length) {
      o.push('<div class="ep-sub">' + esc(b.paramTitle || 'Parameters') + '</div>');
      o.push('<div class="tablewrap"><table class="ptable"><tbody>');
      b.params.forEach(function (p) {
        o.push('<tr><td class="pname">' + esc(p.name) + '</td><td class="ptype">' + esc(p.type || '') + '</td>' +
          '<td class="' + (p.required ? 'preq' : 'popt') + '">' + (p.required ? 'required' : 'optional') + '</td>' +
          '<td>' + unimg(p.desc || '') + '</td></tr>');
      });
      o.push('</tbody></table></div>');
    }
    if (b.codeTabs && b.codeTabs.length) {
      o.push('<div class="ep-sub">Request</div>');
      o.push(tabsHTML({
        t: 'tabs', groupId: '',
        tabs: b.codeTabs.map(function (c) {
          return { label: c.label, value: c.label, blocks: [{ t: 'code', lang: c.lang, title: '', code: c.code }] };
        })
      }));
    }
    if (b.responses && b.responses.length) {
      o.push('<div class="ep-sub">Response</div>');
      b.responses.forEach(function (r) {
        var cls = 'resp-' + String(r.status || '2')[0];
        o.push('<div class="resp-head"><span class="resp-code ' + cls + '">' + esc(r.status || '') + ' ' +
          esc(r.statusText || '') + '</span>' + (r.time ? '<span class="resp-meta">' + esc(r.time) + '</span>' : '') + '</div>');
        o.push(codeHTML({ t: 'code', lang: r.lang || 'json', title: '', code: r.body || '' }));
      });
    }
    o.push('</div></div>');
    return o.join('');
  }

  /* ---- code with light tokenising ---- */

  var HASH_LANGS = { bash: 1, sh: 1, shell: 1, zsh: 1, console: 1, yaml: 1, yml: 1, python: 1, py: 1, toml: 1, ini: 1, env: 1, dockerfile: 1, graphql: 1, gql: 1, ruby: 1, rb: 1, perl: 1, r: 1 };
  var KEYWORDS = ('const let var function return async await import from export default class new extends ' +
    'if else for while do switch case break continue try catch finally throw typeof instanceof this super ' +
    'module require true false null undefined void delete yield interface type enum implements public private ' +
    'protected readonly static as namespace declare def end elif and or not in of is with lambda print').split(' ');
  var KW = Object.create(null);
  KEYWORDS.forEach(function (k) { KW[k] = 1; });

  function tokenise(line, lang, state) {
    var hash = !!HASH_LANGS[lang];
    var out = [], i = 0, n = line.length, buf = '';
    function flushWord() {
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
      if (!hash && c === '/' && line[i + 1] === '/') { flushWord(); out.push('<span class="tk-c">' + esc(line.slice(i)) + '</span>'); i = n; break; }
      if (!hash && c === '/' && line[i + 1] === '*') {
        flushWord();
        var e = line.indexOf('*/', i + 2);
        if (e === -1) { out.push('<span class="tk-c">' + esc(line.slice(i)) + '</span>'); state.block = true; i = n; break; }
        out.push('<span class="tk-c">' + esc(line.slice(i, e + 2)) + '</span>'); i = e + 2; continue;
      }
      if (hash && c === '#') { flushWord(); out.push('<span class="tk-c">' + esc(line.slice(i)) + '</span>'); i = n; break; }
      if (c === '"' || c === "'" || c === '`') {
        flushWord();
        var j = i + 1;
        while (j < n) { if (line[j] === '\\') j += 2; else if (line[j] === c) { j++; break; } else j++; }
        out.push('<span class="tk-s">' + esc(line.slice(i, j)) + '</span>'); i = j; continue;
      }
      if (/[A-Za-z0-9_$.]/.test(c)) { buf += c; i++; continue; }
      flushWord();
      out.push(esc(c));
      i++;
    }
    flushWord();
    return { html: out.join(''), state: state };
  }

  function codeHTML(b) {
    var lang = (b.lang || '').toLowerCase();
    var raw = String(b.code == null ? '' : b.code).replace(/^\n+/, '').replace(/\s+$/, '');
    var lines = raw.split('\n');
    var state = { block: false }, hl = false, nextHl = false, o = [];
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

  /* ---------------- tab switching ---------------- */

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.tabbtn');
    if (!btn) return;
    var wrap = btn.closest('.tabs');
    var val = btn.getAttribute('data-val');
    var group = wrap.getAttribute('data-group');
    var targets = group ? document.querySelectorAll('.tabs[data-group="' + group.replace(/"/g, '') + '"]') : [wrap];
    Array.prototype.forEach.call(targets, function (w) {
      var btns = w.querySelectorAll('.tabbtn'), idx = -1;
      Array.prototype.forEach.call(btns, function (bb, i) {
        if (bb.getAttribute('data-val') === val) idx = i;
      });
      if (idx === -1 && w !== wrap) return;
      if (idx === -1) idx = +btn.getAttribute('data-i');
      Array.prototype.forEach.call(btns, function (bb, i) { bb.setAttribute('aria-selected', i === idx ? 'true' : 'false'); });
      Array.prototype.forEach.call(w.querySelectorAll('.tabpanel'), function (pp, i) { pp.hidden = i !== idx; });
    });
  });

  /* ---------------- search: the telescope ---------------- */

  var qEl, resEl, searchTimer = null;

  function initSearch() {
    qEl = $('q'); resEl = $('results');
    qEl.addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(runSearch, 90);
    });
    qEl.addEventListener('focus', function () { if (qEl.value.trim()) runSearch(); });
    qEl.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { qEl.value = ''; runSearch(); qEl.blur(); }
      if (e.key === 'Enter') {
        var first = resEl.querySelector('.res');
        if (first) { location.hash = first.getAttribute('href'); qEl.blur(); }
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== qEl && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); qEl.focus(); qEl.select();
      } else if (e.key === 'Escape') {
        if ($('drawer').classList.contains('open')) toggleDrawer(false);
        else if (!resEl.hidden) closeResults();
      }
    });
    document.addEventListener('click', function (e) {
      if (!resEl.hidden && !e.target.closest('#results') && !e.target.closest('.search')) closeResults();
    });
  }

  function runSearch() {
    var q = qEl.value.trim().toLowerCase();
    if (q.length < 2) {
      matched = null; closeResults(); dirty = true; return;
    }
    var terms = q.split(/\s+/).filter(Boolean);
    var hits = [];
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

    var o = ['<div class="res-head">' + hits.length + ' page' + (hits.length === 1 ? '' : 's') +
      ' of ' + stars.length + ' match “' + esc(qEl.value.trim()) + '”</div>'];
    hits.slice(0, 24).forEach(function (h) {
      var d = searchDocs[h[1]], st = stars[d.i];
      o.push('<a class="res" href="#' + attr(st.slug) + '"><b>' + esc(d.title) + '</b><span>' +
        esc(st.page.section) + ' · ' + esc(st.slug) + ' · ' + st.m + ' cited</span>' +
        snippet(d, terms) + '</a>');
    });
    if (!hits.length) o.push('<div class="res-head">Nothing in the sky matches.</div>');
    resEl.innerHTML = o.join('');
    resEl.hidden = false;
  }

  function snippet(d, terms) {
    var pos = -1, term = '';
    for (var i = 0; i < terms.length && pos < 0; i++) { pos = d.bodyLow.indexOf(terms[i]); term = terms[i]; }
    if (pos < 0) return '';
    var start = Math.max(0, pos - 55), end = Math.min(d.body.length, pos + 95);
    var txt = (start > 0 ? '…' : '') + d.body.slice(start, end) + (end < d.body.length ? '…' : '');
    var esced = esc(txt);
    var re = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return '<span>' + esced.replace(re, '<mark>$1</mark>') + '</span>';
  }

  function closeResults() { if (resEl) resEl.hidden = true; }

  initSearch();
})();
