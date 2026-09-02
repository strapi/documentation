/* Strapi Documentation — City
   The corpus rendered as a night city: districts = nav sections,
   buildings = pages, height = words, lit windows = code blocks,
   roads = the citation graph. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = function () { return RM.matches; };

  /* ---------------------------------------------------------- utils */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function attr(s) { return esc(s); }
  function nfmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hash32(s) {
    var h = 2166136261, i;
    for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h >>> 0;
  }
  // The html fields carry inline <img src="/img/...">. Those only resolve when the
  // bundle is served from the documentation site root; anywhere else they 404.
  var IMG_HOST = 'https://docs.strapi.io';
  var IMG_RE = /<img\b[^>]*>/gi;
  var ALT_RE = /alt\s*=\s*("([^"]*)"|'([^']*)')/i;
  function fixHtml(h) {
    if (!h) return '';
    if (h.indexOf('<img') < 0) return h;
    return h.replace(IMG_RE, function (m) {
      var a = ALT_RE.exec(m);
      var alt = (a ? (a[2] != null ? a[2] : a[3]) : '') || 'image';
      var sm = /src\s*=\s*("([^"]*)"|'([^']*)')/i.exec(m);
      var srcv = sm ? (sm[2] != null ? sm[2] : sm[3]) : '';
      if (srcv && srcv.charAt(0) === '/') {
        return '<a class="iimg" href="' + esc(IMG_HOST + srcv) + '" target="_blank" rel="noopener noreferrer">' + esc(alt) + '</a>';
      }
      return '<span class="iimg">' + esc(alt) + '</span>';
    });
  }
  // One page in the corpus carries the site name inside its own title tag.
  var SITE_SUFFIX = /\s*[-|]\s*Strapi\s+(Developer\s+)?(Docs|Documentation)\s*$/i;
  function title(p) { return p.title.replace(SITE_SUFFIX, ''); }
  function stripTags(h) {
    return String(h || '').replace(/<[^>]*>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  /* ---------------------------------------------------------- state */
  var B = null, G = null;
  var adjOut = {}, adjIn = {};
  var byId = {};
  var districts = [];
  var order = [], orderIx = {};
  var navFlat = [];
  var cur = null;
  var searchIdx = [], searchReady = false;

  var HOME = { az: -34, pitch: 69, k: 0.74, tx: -200, ty: -30 };
  var cam = { az: HOME.az, pitch: HOME.pitch, k: HOME.k, tx: HOME.tx, ty: HOME.ty };
  var camAnim = null;

  var WORLD_W = 2680, WORLD_H = 1960;
  var GS = 1.0;
  var BASE_SCALE = 0.71;

  var sceneEl, camEl, plateEl, groundC, glowC, tipEl, selEl, docEl, readerEl, sideEl;

  /* ---------------------------------------------------------- boot */
  function boot() {
    sceneEl = $('#scene'); camEl = $('#cam'); plateEl = $('#plate');
    groundC = $('#ground'); glowC = $('#glow'); tipEl = $('#tip'); selEl = $('#seltip');
    docEl = $('#doc'); readerEl = $('#reader'); sideEl = $('#side');

    Promise.all([
      fetch('content.json').then(function (r) { return r.json(); }),
      fetch('graph.json').then(function (r) { return r.json(); })
    ]).then(function (res) {
      B = res[0]; G = res[1];
      order = B.order.slice();
      order.forEach(function (s, i) { orderIx[s] = i; });
      buildGraph();
      layout();
      buildCity();
      buildNav();
      wire();
      $('#ver').textContent = B.version || '';
      $('#boot').hidden = true;
      applyCam();
      route();
      var t = new Promise(function (r) { setTimeout(r, 1200); });
      Promise.race([document.fonts ? document.fonts.ready : t, t]).then(function () {
        drawGround(); drawGlow();
      });
      idle(buildSearchIndex);
    })['catch'](function (e) {
      $('#boot').innerHTML = '<div style="text-align:center"><div class="bt">Unavailable</div>' +
        '<div class="bs">' + esc(e && e.message ? e.message : String(e)) + '</div></div>';
    });
  }
  function idle(fn) {
    if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 2500 });
    else setTimeout(fn, 400);
  }
  /* ---------------------------------------------------------- graph */
  function buildGraph() {
    G.edges.forEach(function (e) {
      var a = e[0], b = e[1];
      if (!B.pages[a] || !B.pages[b] || a === b) return;
      (adjOut[a] || (adjOut[a] = [])).push(b);
      (adjIn[b] || (adjIn[b] = [])).push(a);
    });
    Object.keys(adjOut).forEach(function (k) { adjOut[k] = uniq(adjOut[k]); });
    Object.keys(adjIn).forEach(function (k) { adjIn[k] = uniq(adjIn[k]); });
  }
  function uniq(a) {
    var seen = {}, out = [], i;
    for (i = 0; i < a.length; i++) if (!seen[a[i]]) { seen[a[i]] = 1; out.push(a[i]); }
    return out;
  }

  /* ---------------------------------------------------------- layout */
  function squarify(items, x, y, w, h) {
    var out = [], total = 0, i;
    items = items.slice().sort(function (a, b) { return b.area - a.area; });
    for (i = 0; i < items.length; i++) total += items[i].area;
    var scale = (w * h) / (total || 1);
    items.forEach(function (it) { it.a = it.area * scale; });

    var rx = x, ry = y, rw = w, rh = h, row = [];
    function worst(r, len) {
      if (!r.length) return Infinity;
      var s = 0, mx = -Infinity, mn = Infinity, j;
      for (j = 0; j < r.length; j++) { s += r[j].a; if (r[j].a > mx) mx = r[j].a; if (r[j].a < mn) mn = r[j].a; }
      return Math.max((len * len * mx) / (s * s), (s * s) / (len * len * mn));
    }
    function place(r) {
      var s = 0, j, horiz = rw >= rh;
      for (j = 0; j < r.length; j++) s += r[j].a;
      if (horiz) {
        var rowH = s / rw, cx = rx;
        for (j = 0; j < r.length; j++) {
          var cw = r[j].a / rowH;
          out.push({ key: r[j].key, x: cx, y: ry, w: cw, h: rowH });
          cx += cw;
        }
        ry += rowH; rh -= rowH;
      } else {
        var rowW = s / rh, cy = ry;
        for (j = 0; j < r.length; j++) {
          var ch = r[j].a / rowW;
          out.push({ key: r[j].key, x: rx, y: cy, w: rowW, h: ch });
          cy += ch;
        }
        rx += rowW; rw -= rowW;
      }
    }
    i = 0;
    while (i < items.length) {
      var len = Math.min(rw, rh);
      var cand = row.concat([items[i]]);
      if (!row.length || worst(cand, len) <= worst(row, len)) { row = cand; i++; }
      else { place(row); row = []; }
    }
    if (row.length) place(row);
    return out;
  }

  function layout() {
    var dmap = {}, dlist = [];
    navFlat = [];
    B.nav.forEach(function (sec) {
      var key = sec.product + ' ' + sec.label;
      var d = dmap[key];
      if (!d) { d = dmap[key] = { key: key, label: sec.label, product: sec.product, slugs: [] }; dlist.push(d); }
      (function walk(items, depth) {
        items.forEach(function (it) {
          if (it.slug && B.pages[it.slug] && !byId[it.slug]) {
            byId[it.slug] = { slug: it.slug, d: d };
            d.slugs.push(it.slug);
            navFlat.push({ slug: it.slug, label: it.label, depth: depth, d: d });
          } else if (it.slug) {
            navFlat.push({ slug: it.slug, label: it.label, depth: depth, d: d });
          } else {
            navFlat.push({ slug: null, label: it.label, depth: depth, d: d });
          }
          if (it.items) walk(it.items, depth + 1);
        });
      })(sec.items, 1);
    });
    order.forEach(function (s) {
      if (byId[s]) return;
      var p = B.pages[s], key = p.product + ' ' + p.section, d = dmap[key];
      if (!d) { d = dmap[key] = { key: key, label: p.section, product: p.product, slugs: [] }; dlist.push(d); }
      byId[s] = { slug: s, d: d };
      d.slugs.push(s);
    });

    districts = dlist.filter(function (d) { return d.slugs.length; });

    var cms = districts.filter(function (d) { return d.product !== 'cloud'; });
    var cloud = districts.filter(function (d) { return d.product === 'cloud'; });
    var nC = cms.reduce(function (a, d) { return a + Math.max(3, d.slugs.length); }, 0);
    var nL = cloud.reduce(function (a, d) { return a + Math.max(3, d.slugs.length); }, 0);
    var gap = 76;
    var x0 = -WORLD_W / 2, y0 = -WORLD_H / 2;
    var frac = nC / (nC + nL || 1);
    var wC = (WORLD_W - gap) * clamp(frac, 0.62, 0.86);
    var wL = WORLD_W - gap - wC;

    var rects = squarify(cms.map(function (d) { return { key: d.key, area: Math.max(3, d.slugs.length) }; }), x0, y0, wC, WORLD_H);
    if (cloud.length) {
      var hL = clamp((nL / nC) * (wC * WORLD_H) / wL, 240, WORLD_H);
      rects = rects.concat(squarify(cloud.map(function (d) { return { key: d.key, area: Math.max(3, d.slugs.length) }; }),
        x0 + wC + gap, y0 + (WORLD_H - hL) / 2, wL, hL));
    }
    rects.forEach(function (r) {
      var d = dmap[r.key];
      d.x = r.x; d.y = r.y; d.w = r.w; d.h = r.h;
    });

    var wMin = Math.sqrt(79), wMax = Math.sqrt(10828);
    districts.forEach(function (d) {
      var pad = 22, band = Math.min(58, d.h * 0.16);
      var ix = d.x + pad, iy = d.y + pad + band;
      var iw = Math.max(40, d.w - pad * 2), ih = Math.max(40, d.h - pad * 2 - band * 2);
      d.band = band;
      var n = d.slugs.length;
      var cols = clamp(Math.round(Math.sqrt(n * iw / ih)) || 1, 1, n);
      var rows = Math.ceil(n / cols);
      var cw = iw / cols, ch = ih / rows;
      d.inner = { x: ix, y: iy, w: iw, h: ih, cw: cw, ch: ch, cols: cols, rows: rows };
      d.slugs.forEach(function (s, i) {
        var r = byId[s];
        var c = i % cols, rr2 = Math.floor(i / cols);
        r.x = ix + c * cw + cw / 2;
        r.y = iy + rr2 * ch + ch / 2;
        var words = G.words[s] || 79;
        var code = G.code[s] || 0;
        var inb = G.inbound[s] || 0;
        var t = (Math.sqrt(words) - wMin) / (wMax - wMin);
        r.h = Math.round(18 + 372 * clamp(t, 0, 1));
        var base = Math.min(cw, ch);
        var imp = Math.min(1, inb / 24);
        r.fw = Math.round(clamp(base * 0.62 * (1 + 0.5 * imp), 11, Math.min(54, base * 0.88)));
        r.fd = r.fw;
        r.words = words; r.code = code; r.inb = inb;
        r.lit = code ? 0.18 + 0.82 * Math.pow(Math.log(1 + code) / Math.log(46), 0.9) : 0;
        r.tex = texIndex(r.lit, hash32(s));
      });
    });
  }

  /* ------------------------------------------------- window textures */
  var TEX_LEVELS = 8, TEX_SEEDS = 4;
  function texIndex(lit, h) {
    var lv = clamp(Math.round(lit * (TEX_LEVELS - 1)), 0, TEX_LEVELS - 1);
    return lv * TEX_SEEDS + (h % TEX_SEEDS);
  }
  function makeTextures() {
    var CELL = 7, N = 4, SS = 5;
    var css = [], lv, sd;
    for (lv = 0; lv < TEX_LEVELS; lv++) {
      for (sd = 0; sd < TEX_SEEDS; sd++) {
        var ratio = 0.02 + 0.86 * (lv / (TEX_LEVELS - 1));
        var cv = document.createElement('canvas');
        cv.width = cv.height = CELL * N * SS;
        var g = cv.getContext('2d');
        var seed = (lv * 977 + sd * 7919 + 13) >>> 0;
        var rnd = function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
        var x, y;
        for (y = 0; y < N; y++) {
          for (x = 0; x < N; x++) {
            var on = rnd() < ratio;
            var w = (CELL - 2.6) * SS, hh = (CELL - 3.0) * SS;
            var px = (x * CELL + 1.3) * SS, py = (y * CELL + 1.6) * SS;
            if (on) {
              var cool = rnd() < 0.17;
              var a = 0.55 + rnd() * 0.45;
              g.fillStyle = cool ? 'rgba(120,190,255,.20)' : 'rgba(255,150,60,.20)';
              g.fillRect(px - SS, py - SS, w + 2 * SS, hh + 2 * SS);
              g.fillStyle = cool ? 'rgba(178,222,255,' + a.toFixed(2) + ')'
                                 : 'rgba(255,206,138,' + a.toFixed(2) + ')';
              g.fillRect(px, py, w, hh);
            } else {
              g.fillStyle = 'rgba(150,180,225,.055)';
              g.fillRect(px, py, w, hh);
            }
          }
        }
        css.push('.t' + (lv * TEX_SEEDS + sd) + '{--tex:url(' + cv.toDataURL('image/png') + ')}');
      }
    }
    css.push('.f{background-size:' + (CELL * N) + 'px ' + (CELL * N) + 'px,' + (CELL * N) + 'px ' + (CELL * N) + 'px,auto}');
    var st = document.createElement('style');
    st.textContent = css.join('\n');
    document.head.appendChild(st);
  }

  /* ---------------------------------------------------------- city */
  function makeSky() {
    var W = 1600, H = 900, cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var g = cv.getContext('2d'), seed = 20260902 >>> 0;
    var rnd = function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    var i, x, y, rad, a;
    for (i = 0; i < 520; i++) {
      x = rnd() * W; y = Math.pow(rnd(), 1.7) * H * 0.82;
      rad = 0.4 + Math.pow(rnd(), 3) * 1.7;
      a = (0.18 + rnd() * 0.72) * (1 - y / (H * 1.15));
      g.fillStyle = rnd() < 0.12 ? 'rgba(190,215,255,' + a.toFixed(2) + ')' : 'rgba(255,246,228,' + a.toFixed(2) + ')';
      g.beginPath(); g.arc(x, y, rad, 0, 6.2832); g.fill();
    }
    var sky = document.getElementById('sky');
    if (sky) sky.style.backgroundImage = 'url(' + cv.toDataURL('image/png') + ')';
  }

  function buildCity() {
    makeSky();
    makeTextures();
    var html = [], i, s, r;
    for (i = 0; i < order.length; i++) {
      s = order[i]; r = byId[s];
      if (!r) continue;
      html.push('<div class="b t' + r.tex + (r.h > 260 ? ' tall' : '') + '" data-s="' + attr(s) +
        '" style="left:' + Math.round(r.x) + 'px;top:' + Math.round(r.y) + 'px;--w:' + r.fw +
        'px;--d:' + r.fd + 'px;--h:' + r.h + 'px">' +
        '<i class="f fn"></i><i class="f fs"></i><i class="f fe"></i><i class="f fw"></i><b class="rf"></b></div>');
    }
    var frag = document.createElement('div');
    frag.innerHTML = html.join('');
    while (frag.firstChild) camEl.appendChild(frag.firstChild);
    var nodes = camEl.querySelectorAll('.b'), j;
    for (j = 0; j < nodes.length; j++) byId[nodes[j].getAttribute('data-s')].el = nodes[j];

    groundC.width = Math.round(WORLD_W * GS); groundC.height = Math.round(WORLD_H * GS);
    glowC.width = groundC.width; glowC.height = groundC.height;
    [groundC, glowC].forEach(function (c) {
      c.style.width = WORLD_W + 'px'; c.style.height = WORLD_H + 'px';
      c.style.left = (-WORLD_W / 2) + 'px'; c.style.top = (-WORLD_H / 2) + 'px';
    });
    glowC.style.transform = 'translateZ(0.6px)';
    drawGround();
  }

  function W2C(v) { return v * GS; }
  function CX(x) { return (x + WORLD_W / 2) * GS; }
  function CY(y) { return (y + WORLD_H / 2) * GS; }

  function drawGround() {
    var g = groundC.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, groundC.width, groundC.height);
    g.fillStyle = '#04060c';
    g.fillRect(0, 0, groundC.width, groundC.height);

    districts.forEach(function (d) {
      var x = CX(d.x) + 5, y = CY(d.y) + 5, w = W2C(d.w) - 10, h = W2C(d.h) - 10;
      var grad = g.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, d.product === 'cloud' ? 'rgba(16,26,46,.96)' : 'rgba(13,19,33,.96)');
      grad.addColorStop(1, 'rgba(7,10,18,.96)');
      g.fillStyle = grad;
      rr(g, x, y, w, h, 14 * GS); g.fill();
      g.strokeStyle = d.product === 'cloud' ? 'rgba(127,216,255,.22)' : 'rgba(143,131,255,.18)';
      g.lineWidth = 1.6 * GS;
      rr(g, x, y, w, h, 14 * GS); g.stroke();

      var inn = d.inner, c, k;
      g.save(); g.beginPath(); rr(g, x, y, w, h, 14 * GS); g.clip();
      g.strokeStyle = 'rgba(130,160,215,.038)'; g.lineWidth = 1 * GS;
      for (c = 0; c <= inn.cols; c++) {
        var gx = CX(inn.x + c * inn.cw);
        g.beginPath(); g.moveTo(gx, CY(inn.y - 14)); g.lineTo(gx, CY(inn.y + inn.h + 14)); g.stroke();
      }
      for (k = 0; k <= inn.rows; k++) {
        var gy = CY(inn.y + k * inn.ch);
        g.beginPath(); g.moveTo(CX(inn.x - 14), gy); g.lineTo(CX(inn.x + inn.w + 14), gy); g.stroke();
      }
      // plazas at both ends carry the district name
      g.fillStyle = 'rgba(90,120,180,.05)';
      var bh = W2C(d.band || 30);
      g.fillRect(x + 8, y + 6, w - 16, bh);
      g.fillRect(x + 8, y + h - bh - 6, w - 16, bh);
      g.restore();
    });

    g.globalCompositeOperation = 'lighter';
    g.lineCap = 'round'; g.lineJoin = 'round';
    var e, a, b, ra, rb, inter;
    for (e = 0; e < G.edges.length; e++) {
      a = G.edges[e][0]; b = G.edges[e][1];
      ra = byId[a]; rb = byId[b];
      if (!ra || !rb || ra === rb) continue;
      inter = ra.d !== rb.d;
      g.strokeStyle = inter ? 'rgba(110,175,255,.075)' : 'rgba(255,172,84,.07)';
      g.lineWidth = (inter ? 2.6 : 1.7) * GS;
      strokeRoute(g, ra, rb);
    }
    for (e = 0; e < G.edges.length; e++) {
      a = G.edges[e][0]; b = G.edges[e][1];
      ra = byId[a]; rb = byId[b];
      if (!ra || !rb || ra.d === rb.d) continue;
      g.strokeStyle = 'rgba(200,230,255,.055)';
      g.lineWidth = 0.9 * GS;
      strokeRoute(g, ra, rb);
    }

    order.forEach(function (s) {
      var r = byId[s]; if (!r) return;
      var rad = (r.fw * 2.1 + 14) * GS;
      var cx = CX(r.x), cy = CY(r.y);
      var rg = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
      var al = 0.03 + 0.34 * r.lit;
      rg.addColorStop(0, 'rgba(255,196,124,' + al.toFixed(3) + ')');
      rg.addColorStop(1, 'rgba(255,180,90,0)');
      g.fillStyle = rg;
      g.beginPath(); g.arc(cx, cy, rad, 0, 6.2832); g.fill();
    });
    g.globalCompositeOperation = 'source-over';
  }

  function strokeRoute(g, a, b) {
    var ax = CX(a.x), ay = CY(a.y), bx = CX(b.x), by = CY(b.y);
    var mid = (hash32(a.slug + b.slug) & 1) === 0;
    g.beginPath();
    g.moveTo(ax, ay);
    if (mid) { g.lineTo((ax + bx) / 2, ay); g.lineTo((ax + bx) / 2, by); }
    else { g.lineTo(ax, (ay + by) / 2); g.lineTo(bx, (ay + by) / 2); }
    g.lineTo(bx, by);
    g.stroke();
  }

  function drawGlow() {
    var g = glowC.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, glowC.width, glowC.height);

    if (cur && byId[cur]) {
      var r0 = byId[cur];
      var ns = (adjOut[cur] || []).concat(adjIn[cur] || []);
      g.globalCompositeOperation = 'lighter';
      g.lineCap = 'round'; g.lineJoin = 'round';
      ns.forEach(function (s) {
        var r = byId[s]; if (!r) return;
        g.strokeStyle = 'rgba(255,196,120,.45)';
        g.lineWidth = 3.4 * GS;
        strokeRoute(g, r0, r);
        g.strokeStyle = 'rgba(255,246,224,.6)';
        g.lineWidth = 1.1 * GS;
        strokeRoute(g, r0, r);
      });
      g.strokeStyle = 'rgba(170,158,255,.9)';
      g.lineWidth = 2.6 * GS;
      g.beginPath(); g.arc(CX(r0.x), CY(r0.y), (r0.fw * 1.5 + 12) * GS, 0, 6.2832); g.stroke();
      g.globalCompositeOperation = 'source-over';
    }

    var az = ((cam.az % 360) + 360) % 360;
    var flip = az > 90 && az < 270;
    districts.forEach(function (d) {
      var size = clamp(Math.min(d.w * 0.115, d.h * 0.34, 52), 12, 52);
      var edge = Math.max(size * 0.85, (d.band || 30) * 0.55);
      var x = CX(d.x + d.w / 2);
      var y = flip ? CY(d.y + edge) : CY(d.y + d.h - edge);
      var room = d.h > size * 2.4;
      g.save();
      g.translate(x, y);
      if (flip) g.rotate(Math.PI);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      if ('letterSpacing' in g) g.letterSpacing = (size * 0.16 * GS).toFixed(1) + 'px';
      g.font = '700 ' + Math.round(size * GS) + 'px "Barlow Condensed", sans-serif';
      g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = 14 * GS;
      g.fillStyle = d.product === 'cloud' ? 'rgba(170,224,255,.85)' : 'rgba(222,229,248,.78)';
      g.fillText(d.label.toUpperCase(), 0, 0);
      if (room) {
        if ('letterSpacing' in g) g.letterSpacing = (size * 0.12 * GS).toFixed(1) + 'px';
        g.font = '500 ' + Math.round(Math.max(9, size * 0.38) * GS) + 'px "IBM Plex Sans", sans-serif';
        g.fillStyle = 'rgba(255,190,110,.8)';
        g.fillText(d.product.toUpperCase() + '  \u00b7  ' + d.slugs.length + (d.slugs.length === 1 ? ' PAGE' : ' PAGES'),
          0, size * 0.9 * GS);
      }
      g.shadowBlur = 0;
      g.restore();
    });
  }

  function rr(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  /* ---------------------------------------------------------- camera */
  function applyCam() {
    var sx = document.body.classList.contains('reading') ? -readerW() / 2 : 0;
    var t = 'translate3d(' + sx.toFixed(1) + 'px,0,-900px) scale3d(' + cam.k.toFixed(4) + ',' + cam.k.toFixed(4) + ',' + cam.k.toFixed(4) + ') ' +
      'rotateX(' + cam.pitch.toFixed(2) + 'deg) rotateZ(' + cam.az.toFixed(2) + 'deg) ' +
      'translate3d(' + (-cam.tx).toFixed(1) + 'px,' + (-cam.ty).toFixed(1) + 'px,0)';
    camEl.style.transform = t;
    plateEl.style.transform = t;
    tipEl.style.setProperty('--az', cam.az.toFixed(2));
    tipEl.style.setProperty('--pitch', cam.pitch.toFixed(2));
    selEl.style.setProperty('--az', cam.az.toFixed(2));
    selEl.style.setProperty('--pitch', cam.pitch.toFixed(2));
    var a = ((cam.az % 360) + 360) % 360;
    var q = String(Math.floor(a / 90) % 4);
    if (q !== lastQ) { camEl.setAttribute('data-q', q); lastQ = q; }
    cull(sx);
  }
  var lastQ = null;

  /* Only the buildings the camera can actually see are left in the render tree.
     With 290 boxes on screen the cost is linear in what stays visible. */
  var PERSP = 2200;
  function cull(sx) {
    if (!order.length) return;
    var a = cam.az * Math.PI / 180, p = cam.pitch * Math.PI / 180;
    var ca = Math.cos(a), sa = Math.sin(a), cp = Math.cos(p), sp = Math.sin(p);
    var k = cam.k;
    var ox = window.innerWidth / 2 + sx, oy = window.innerHeight * 0.52;
    var mx = 260, myTop = 340 * k + 220, myBot = 260;
    var i, r, X, Y, u, v, zz, sc2, px, py, vis;
    for (i = 0; i < order.length; i++) {
      r = byId[order[i]];
      if (!r || !r.el) continue;
      X = r.x - cam.tx; Y = r.y - cam.ty;
      u = X * ca - Y * sa; v = X * sa + Y * ca;
      zz = k * v * sp - 900;
      if (zz > PERSP - 120) { vis = false; }
      else {
        sc2 = PERSP / (PERSP - zz);
        px = ox + k * u * sc2; py = oy + k * v * cp * sc2;
        vis = px > -mx && px < window.innerWidth + mx && py > -myTop && py < window.innerHeight + myBot;
      }
      if (vis !== r.vis) { r.vis = vis; r.el.style.display = vis ? '' : 'none'; }
    }
  }
  function readerW() {
    if (!document.body.classList.contains('reading')) return 0;
    if (window.innerWidth < 820) return 0;
    return readerEl.getBoundingClientRect().width;
  }
  var glowTimer = null;
  function scheduleGlow() {
    if (glowTimer) clearTimeout(glowTimer);
    glowTimer = setTimeout(function () { glowTimer = null; drawGlow(); }, 170);
  }
  function flyTo(x, y, k, pitch) {
    var from = { pitch: cam.pitch, k: cam.k, tx: cam.tx, ty: cam.ty };
    var to = { pitch: pitch == null ? cam.pitch : pitch, k: k, tx: x, ty: y };
    if (camAnim) { cancelAnimationFrame(camAnim); camAnim = null; }
    if (reduced()) {
      cam.k = to.k; cam.pitch = to.pitch; cam.tx = to.tx; cam.ty = to.ty;
      applyCam(); scheduleGlow(); return;
    }
    var t0 = performance.now(), dur = 900;
    var step2 = function (now) {
      var p = clamp((now - t0) / dur, 0, 1);
      var e = 1 - Math.pow(1 - p, 3);
      cam.pitch = from.pitch + (to.pitch - from.pitch) * e;
      cam.k = from.k + (to.k - from.k) * e;
      cam.tx = from.tx + (to.tx - from.tx) * e;
      cam.ty = from.ty + (to.ty - from.ty) * e;
      applyCam();
      if (p < 1) camAnim = requestAnimationFrame(step2); else { camAnim = null; scheduleGlow(); }
    };
    camAnim = requestAnimationFrame(step2);
  }

  /* ---------------------------------------------------------- input */
  function wire() {
    var down = null, moved = 0, pointers = {}, pinch0 = null;

    sceneEl.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.button !== 1) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var keys = Object.keys(pointers);
      if (keys.length === 2) {
        var p1 = pointers[keys[0]], p2 = pointers[keys[1]];
        pinch0 = { d: Math.max(1, Math.hypot(p1.x - p2.x, p1.y - p2.y)), k: cam.k };
        down = null; return;
      }
      down = { x: e.clientX, y: e.clientY, pan: e.shiftKey || e.button === 1, az: cam.az, pitch: cam.pitch, tx: cam.tx, ty: cam.ty };
      moved = 0;
      sceneEl.classList.add('drag'); glowC.style.visibility = 'hidden';
      try { sceneEl.setPointerCapture(e.pointerId); } catch (err) {}
    });

    sceneEl.addEventListener('pointermove', function (e) {
      if (pointers[e.pointerId]) { pointers[e.pointerId].x = e.clientX; pointers[e.pointerId].y = e.clientY; }
      if (pinch0) {
        var keys = Object.keys(pointers);
        if (keys.length === 2) {
          var p1 = pointers[keys[0]], p2 = pointers[keys[1]];
          cam.k = clamp(pinch0.k * (Math.hypot(p1.x - p2.x, p1.y - p2.y) / pinch0.d), 0.2, 2.8);
          applyCam();
        }
        return;
      }
      if (!down) { hoverAt(e); return; }
      var dx = e.clientX - down.x, dy = e.clientY - down.y;
      moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
      if (down.pan) {
        var s = cam.k * BASE_SCALE;
        var pc = Math.max(0.2, Math.cos(cam.pitch * Math.PI / 180));
        var wx = dx / s, wy = (dy / s) / pc;
        var a = -cam.az * Math.PI / 180;
        cam.tx = down.tx - (wx * Math.cos(a) - wy * Math.sin(a));
        cam.ty = down.ty - (wx * Math.sin(a) + wy * Math.cos(a));
      } else {
        cam.az = down.az + dx * 0.3;
        cam.pitch = clamp(down.pitch - dy * 0.22, 14, 80);
      }
      applyCam();
    });

    var up = function (e) {
      delete pointers[e.pointerId];
      if (Object.keys(pointers).length < 2) pinch0 = null;
      sceneEl.classList.remove('drag'); glowC.style.visibility = '';
      if (down && moved < 6) pick(e);
      if (down) scheduleGlow();
      down = null;
    };
    sceneEl.addEventListener('pointerup', up);
    sceneEl.addEventListener('pointercancel', up);
    sceneEl.addEventListener('pointerleave', function () { setHover(null); });

    sceneEl.addEventListener('wheel', function (e) {
      e.preventDefault();
      cam.k = clamp(cam.k * Math.exp(-e.deltaY * 0.0014), 0.2, 2.8);
      applyCam();
    }, { passive: false });

    $('#cIn').onclick = function () { cam.k = clamp(cam.k * 1.35, 0.2, 2.8); applyCam(); };
    $('#cOut').onclick = function () { cam.k = clamp(cam.k / 1.35, 0.2, 2.8); applyCam(); };
    $('#cRot').onclick = function () { cam.az += 45; applyCam(); scheduleGlow(); };
    $('#cHome').onclick = function () { cam.az = HOME.az; flyTo(HOME.tx, HOME.ty, HOME.k, HOME.pitch); applyCam(); };

    $('#btnIndex').onclick = function () {
      var on = sideEl.classList.toggle('on');
      this.setAttribute('aria-pressed', on ? 'true' : 'false');
    };
    $('#btnCity').onclick = function () { location.hash = '#/'; };
    $('#btnClose').onclick = function () { location.hash = '#/'; };
    $('#btnPrev').onclick = function () { step(-1); };
    $('#btnNext').onclick = function () { step(1); };

    window.addEventListener('hashchange', route);
    window.addEventListener('resize', function () { applyCam(); });

    docEl.addEventListener('click', function (e) {
      var t = e.target;
      var tb = t.closest ? t.closest('.tb') : null;
      if (tb) { selectTab(tb.getAttribute('data-g'), tb.getAttribute('data-v')); return; }
      var a = t.closest ? t.closest('a') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) === '#' && href.charAt(1) !== '/') {
        e.preventDefault();
        gotoAnchor(href.slice(1));
      }
    });
    sideEl.addEventListener('click', function () {
      if (window.innerWidth < 820) { sideEl.classList.remove('on'); $('#btnIndex').setAttribute('aria-pressed', 'false'); }
    });

    wireSearch();

    document.addEventListener('keydown', function (e) {
      var q = $('#q');
      if (e.key === '/' && document.activeElement !== q) { e.preventDefault(); q.focus(); q.select(); }
      else if (e.key === 'Escape') {
        if ($('#results').classList.contains('on')) { closeResults(); q.blur(); }
        else if (sideEl.classList.contains('on')) { sideEl.classList.remove('on'); $('#btnIndex').setAttribute('aria-pressed', 'false'); }
        else if (document.body.classList.contains('reading')) location.hash = '#/';
      } else if (e.altKey && e.key === 'ArrowLeft') { step(-1); }
      else if (e.altKey && e.key === 'ArrowRight') { step(1); }
    });
  }

  function step(dir) {
    var i = (cur != null && orderIx[cur] != null) ? orderIx[cur] : (dir > 0 ? -1 : order.length);
    var j = clamp(i + dir, 0, order.length - 1);
    location.hash = '#' + order[j];
  }

  function pick(e) {
    var el = document.elementFromPoint(e.clientX, e.clientY);
    var b = el && el.closest ? el.closest('.b') : null;
    if (!b) return;
    location.hash = '#' + b.getAttribute('data-s');
  }

  var hoverSlug = null;
  function hoverAt(e) {
    var el = document.elementFromPoint(e.clientX, e.clientY);
    var b = el && el.closest ? el.closest('.b') : null;
    setHover(b ? b.getAttribute('data-s') : null);
  }
  function setHover(s) {
    if (s === hoverSlug) return;
    if (hoverSlug && byId[hoverSlug] && byId[hoverSlug].el) byId[hoverSlug].el.classList.remove('hov');
    hoverSlug = s;
    var d = $('#dhud');
    if (!s || !byId[s]) { tipEl.classList.remove('on'); d.innerHTML = ''; return; }
    var r = byId[s], p = B.pages[s];
    if (r.el) r.el.classList.add('hov');
    tipEl.style.left = Math.round(r.x) + 'px';
    tipEl.style.top = Math.round(r.y) + 'px';
    tipEl.style.setProperty('--th', (r.h + 6) + 'px');
    $('.tt', tipEl).textContent = title(p);
    $('.tm', tipEl).innerHTML = '<b>' + nfmt(r.words) + '</b> words &nbsp; <b>' + r.code +
      '</b> code &nbsp; <b>' + r.inb + '</b> inbound';
    tipEl.classList.add('on');
    d.innerHTML = esc(r.d.label) + '<small>' + esc(p.product.toUpperCase()) + ' &nbsp;/&nbsp; ' + esc(title(p)) + '</small>';
  }

  /* ---------------------------------------------------------- nav */
  function buildNav() {
    var html = [], lastProd = null, lastSec = null, seen = {};
    navFlat.forEach(function (n) {
      if (n.d.product !== lastProd) {
        html.push('<div class="prod">' + esc(n.d.product === 'cloud' ? 'Strapi Cloud' : 'Strapi CMS') + '</div>');
        lastProd = n.d.product; lastSec = null;
      }
      if (n.d.label !== lastSec) { html.push('<h2>' + esc(n.d.label) + '</h2>'); lastSec = n.d.label; }
      if (!n.slug) { html.push('<div class="grp">' + esc(n.label) + '</div>'); return; }
      if (seen[n.slug]) return;
      seen[n.slug] = 1;
      html.push('<a href="#' + attr(n.slug) + '" data-s="' + attr(n.slug) + '" class="lv' +
        Math.min(3, n.depth) + '">' + esc(n.label) + '</a>');
    });
    sideEl.innerHTML = html.join('');
  }

  /* ---------------------------------------------------------- search */
  function buildSearchIndex() {
    var i = 0;
    var next = window.requestIdleCallback ? function (f) { requestIdleCallback(f, { timeout: 800 }); }
                                          : function (f) { setTimeout(f, 1); };
    function slice() {
      var end = Math.min(i + 24, order.length);
      for (; i < end; i++) {
        var s = order[i], p = B.pages[s];
        var txt = [];
        collectText(p.blocks, txt, 0);
        var body = txt.join(' ');
        searchIdx.push({
          slug: s, title: title(p), sec: p.section, prod: p.product,
          hay: (p.title + '  ' + s + '  ' + (p.description || '') + '  ' +
            (p.headings || []).map(function (h) { return h.text; }).join('  ') + '  ' +
            body).toLowerCase().slice(0, 9000),
          body: body.slice(0, 4000)
        });
      }
      if (i < order.length) next(slice); else searchReady = true;
    }
    slice();
  }
  function collectText(bs, out, depth) {
    if (!bs || depth > 6) return;
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i]; if (!b) continue;
      switch (b.t) {
        case 'p': case 'tldr': out.push(stripTags(b.html)); break;
        case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': out.push(b.text); break;
        case 'ul': case 'ol':
          b.items.forEach(function (it) {
            if (typeof it === 'string') out.push(stripTags(it));
            else { out.push(stripTags(it.html)); collectText(it.blocks, out, depth + 1); }
          });
          break;
        case 'table':
          out.push(b.head.map(stripTags).join(' '));
          b.rows.forEach(function (r) { out.push(r.map(stripTags).join(' ')); });
          break;
        case 'code': out.push(b.code.slice(0, 400)); break;
        case 'admonition': out.push(b.title || ''); collectText(b.blocks, out, depth + 1); break;
        case 'details': out.push(stripTags(b.summary)); collectText(b.blocks, out, depth + 1); break;
        case 'tabs': b.tabs.forEach(function (t) { out.push(t.label); collectText(t.blocks, out, depth + 1); }); break;
        case 'columns': b.cols.forEach(function (c) { collectText(Array.isArray(c) ? c : c.blocks, out, depth + 1); }); break;
        case 'cards': b.items.forEach(function (c) { out.push(c.title + ' ' + c.desc); }); break;
        case 'endpoint':
          out.push(b.method + ' ' + b.path + ' ' + b.title + ' ' + stripTags(b.description));
          (b.params || []).forEach(function (p) { out.push(p.name + ' ' + stripTags(p.desc)); });
          break;
        case 'img': out.push(b.alt + ' ' + stripTags(b.caption)); break;
        case 'badge': out.push(b.label); break;
      }
    }
  }

  function wireSearch() {
    var q = $('#q'), res = $('#results'), curIx = -1, rows = [];
    function run() {
      var v = q.value.trim();
      if (v.length < 2) { closeResults(); return; }
      rows = search(v);
      curIx = -1;
      if (!rows.length) {
        res.innerHTML = '<div class="none">Nothing matches ' + esc(v) +
          (searchReady ? '.' : ' yet. The index is still loading.') + '</div>';
      } else {
        res.innerHTML = rows.map(function (h, i) {
          return '<a class="rrow" role="option" href="#' + attr(h.slug) + '" data-i="' + i + '">' +
            '<div class="rs">' + esc(h.prod) + ' &middot; ' + esc(h.sec) + '</div>' +
            '<div class="rt">' + hlmark(h.title, v) + '</div>' +
            (h.snip ? '<div class="rx">' + h.snip + '</div>' : '') + '</a>';
        }).join('');
      }
      res.classList.add('on'); q.setAttribute('aria-expanded', 'true');
    }
    q.addEventListener('input', run);
    q.addEventListener('focus', function () { if (q.value.trim().length >= 2) run(); });
    q.addEventListener('keydown', function (e) {
      var opts = res.querySelectorAll('.rrow'), i;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!opts.length) return;
        e.preventDefault();
        curIx = clamp(curIx + (e.key === 'ArrowDown' ? 1 : -1), 0, opts.length - 1);
        for (i = 0; i < opts.length; i++) opts[i].classList.toggle('cur', i === curIx);
        opts[curIx].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        var pickIx = curIx >= 0 ? curIx : 0;
        if (rows[pickIx]) { location.hash = '#' + rows[pickIx].slug; closeResults(); q.blur(); }
      }
    });
    res.addEventListener('click', function () { closeResults(); });
    document.addEventListener('click', function (e) {
      if (!$('#searchwrap').contains(e.target)) closeResults();
    });
  }
  function closeResults() {
    $('#results').classList.remove('on');
    $('#q').setAttribute('aria-expanded', 'false');
  }
  function search(v) {
    var terms = v.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 6);
    var out = [], i, j;
    for (i = 0; i < searchIdx.length; i++) {
      var it = searchIdx[i], sc = 0, ok = true;
      var tl = it.title.toLowerCase();
      for (j = 0; j < terms.length; j++) {
        var t = terms[j];
        var pos = it.hay.indexOf(t);
        if (pos < 0) { ok = false; break; }
        sc += 1;
        if (tl.indexOf(t) >= 0) sc += 8;
        if (tl.indexOf(t) === 0) sc += 6;
        if (it.slug.toLowerCase().indexOf(t) >= 0) sc += 3;
        if (pos < 400) sc += 1;
      }
      if (!ok) continue;
      sc += Math.min(6, (G.inbound[it.slug] || 0) / 6);
      out.push({ slug: it.slug, title: it.title, sec: it.sec, prod: it.prod, score: sc, body: it.body });
    }
    out.sort(function (a, b) { return b.score - a.score; });
    out = out.slice(0, 14);
    out.forEach(function (h) { h.snip = snippet(h.body, terms); });
    return out;
  }
  function snippet(body, terms) {
    if (!body) return '';
    var lb = body.toLowerCase(), at = -1, i;
    for (i = 0; i < terms.length; i++) { at = lb.indexOf(terms[i]); if (at >= 0) break; }
    if (at < 0) return '';
    var s = Math.max(0, at - 60), e = Math.min(body.length, at + 130);
    return hlmark((s > 0 ? '...' : '') + body.slice(s, e) + (e < body.length ? '...' : ''), terms.join(' '));
  }
  function hlmark(text, v) {
    var terms = v.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 1; });
    var out = esc(text);
    terms.forEach(function (t) {
      var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return out;
  }

  /* ---------------------------------------------------------- routing */
  function route() {
    var raw = location.hash.replace(/^#/, '');
    var anchor = '';
    var hi = raw.indexOf('#');
    if (hi >= 0) { anchor = raw.slice(hi + 1); raw = raw.slice(0, hi); }
    try { raw = decodeURIComponent(raw); } catch (e) {}

    if (raw === '') { location.replace(location.pathname + location.search + '#/cms/intro'); return; }
    if (raw === '/') { showCity(); return; }
    if (raw.charAt(0) !== '/') raw = '/' + raw;
    openPage(raw, anchor);
  }

  function showCity() {
    cur = null;
    document.body.classList.remove('reading');
    camEl.classList.remove('focus');
    clearMarks();
    document.title = 'Strapi Documentation';
    markNav(null);
    drawGlow();
    cam.az = HOME.az;
    flyTo(HOME.tx, HOME.ty, HOME.k, HOME.pitch);
  }

  function clearMarks() {
    selEl.classList.remove('on');
    var n = camEl.querySelectorAll('.b.sel,.b.near'), i;
    for (i = 0; i < n.length; i++) { n[i].classList.remove('sel'); n[i].classList.remove('near'); }
  }

  function openPage(slug, anchor) {
    var p = B.pages[slug];
    document.body.classList.add('reading');
    if (!p) {
      cur = null;
      camEl.classList.remove('focus');
      clearMarks();
      document.title = 'Not found - Strapi Documentation';
      docEl.innerHTML = '<div class="notfound"><h1>No page at ' + esc(slug) + '</h1>' +
        '<p>Use the index or the search field to find your way.</p></div>';
      $('#crumb').textContent = 'Not found';
      applyCam(); drawGlow();
      return;
    }
    cur = slug;
    renderPage(slug, false);
    markCity(slug);
    markNav(slug);
    applyCam();
    var r = byId[slug];
    if (r) flyTo(r.x, r.y, 1.45, 62);
    $('#rbody').scrollTop = 0;
    drawGlow();
    if (anchor) setTimeout(function () { gotoAnchor(anchor); }, 40);
  }

  function markCity(slug) {
    clearMarks();
    var r = byId[slug];
    camEl.classList.add('focus');
    if (r && r.el) r.el.classList.add('sel');
    if (r) {
      selEl.style.left = Math.round(r.x) + 'px';
      selEl.style.top = Math.round(r.y) + 'px';
      selEl.style.setProperty('--th', (r.h + 10) + 'px');
      $('.tt', selEl).textContent = title(B.pages[slug]);
      $('.tm', selEl).innerHTML = esc(r.d.label) + ' &nbsp;/&nbsp; ' + nfmt(r.words) + ' words &nbsp;/&nbsp; ' + r.code + ' code';
      selEl.classList.add('on');
    } else { selEl.classList.remove('on'); }
    var ns = (adjOut[slug] || []).concat(adjIn[slug] || []);
    ns.forEach(function (s) { var q = byId[s]; if (q && q.el) q.el.classList.add('near'); });
  }
  function markNav(slug) {
    var a = sideEl.querySelectorAll('a.cur'), i;
    for (i = 0; i < a.length; i++) a[i].classList.remove('cur');
    if (!slug) return;
    var t = sideEl.querySelectorAll('a[data-s="' + slug.replace(/"/g, '') + '"]');
    for (i = 0; i < t.length; i++) t[i].classList.add('cur');
    if (t[0] && sideEl.classList.contains('on')) t[0].scrollIntoView({ block: 'nearest' });
  }
  function gotoAnchor(id) {
    if (!id) return;
    var el = null;
    try { el = docEl.querySelector('[id="' + id.replace(/"/g, '') + '"]'); } catch (e) {}
    if (!el) return;
    var d = el.closest ? el.closest('details') : null;
    if (d) d.open = true;
    if (el.tagName === 'DETAILS') el.open = true;
    var host = $('#rbody');
    host.scrollTop += el.getBoundingClientRect().top - host.getBoundingClientRect().top - 12;
  }
  function selectTab(gid, val) {
    var groups = docEl.querySelectorAll('.tabs[data-g="' + gid.replace(/"/g, '') + '"]'), i, j;
    for (i = 0; i < groups.length; i++) {
      var bts = groups[i].querySelectorAll('.tb'), pans = groups[i].querySelectorAll('.tp'), hit = -1;
      for (j = 0; j < bts.length; j++) if (bts[j].getAttribute('data-v') === val) hit = j;
      if (hit < 0) continue;
      for (j = 0; j < bts.length; j++) bts[j].setAttribute('aria-selected', j === hit ? 'true' : 'false');
      for (j = 0; j < pans.length; j++) pans[j].hidden = (j !== hit);
    }
  }

  /* ---------------------------------------------------------- page */
  function renderPage(slug, keepScroll) {
    var p = B.pages[slug], r = byId[slug];
    var top = keepScroll ? $('#rbody').scrollTop : 0;
    document.title = title(p) + ' - Strapi Documentation';

    var words = G.words[slug] || 0, code = G.code[slug] || 0;
    var inb = G.inbound[slug] || 0, outb = G.outbound[slug] || 0;

    var h = [];
    h.push('<h1>' + esc(title(p)) + '</h1>');
    if (p.description) h.push('<p class="lede">' + esc(p.description) + '</p>');
    h.push('<div class="meta">');
    h.push('<span class="chip"><b>' + nfmt(words) + '</b> words</span>');
    h.push('<span class="chip"><b>' + code + '</b> code block' + (code === 1 ? '' : 's') + '</span>');
    h.push('<span class="chip"><b>' + inb + '</b> page' + (inb === 1 ? '' : 's') + ' link here</span>');
    h.push('<span class="chip"><b>' + outb + '</b> link' + (outb === 1 ? '' : 's') + ' out</span>');
    (p.tags || []).forEach(function (t) { h.push('<span class="chip tag">' + esc(t) + '</span>'); });
    h.push('</div>');

    var hs = (p.headings || []).filter(function (x) { return x.level >= 2 && x.level <= 4; });
    if (hs.length > 2) {
      h.push('<details class="toc" open><summary>On this page - ' + hs.length + ' sections</summary><ol>');
      hs.forEach(function (x) {
        h.push('<li class="d' + x.level + '"><a href="#' + attr(x.id) + '">' + esc(x.text) + '</a></li>');
      });
      h.push('</ol></details>');
    }

    h.push(blocks(p.blocks, 0));

    var to = (adjOut[slug] || []).filter(function (s) { return B.pages[s]; });
    var from = (adjIn[slug] || []).filter(function (s) { return B.pages[s]; });
    if (to.length || from.length) {
      h.push('<div class="links"><h3>Streets from this building</h3>');
      if (to.length) {
        h.push('<p class="n">' + to.length + ' page' + (to.length === 1 ? '' : 's') + ' this one links to</p><ul>');
        to.forEach(function (s) { h.push('<li><a href="#' + attr(s) + '">' + esc(title(B.pages[s])) + '</a></li>'); });
        h.push('</ul>');
      }
      if (from.length) {
        h.push('<p class="n">' + from.length + ' page' + (from.length === 1 ? '' : 's') + ' linking here</p><ul>');
        from.forEach(function (s) { h.push('<li><a href="#' + attr(s) + '">' + esc(title(B.pages[s])) + '</a></li>'); });
        h.push('</ul>');
      }
      h.push('</div>');
    }

    var i = orderIx[slug];
    var prev = i > 0 ? order[i - 1] : null, next = i < order.length - 1 ? order[i + 1] : null;
    h.push('<nav class="pn2" aria-label="Page navigation">');
    h.push(prev ? '<a href="#' + attr(prev) + '"><div class="k">Previous</div><div class="v">' + esc(title(B.pages[prev])) + '</div></a>' : '<span class="sp"></span>');
    h.push(next ? '<a class="nx" href="#' + attr(next) + '"><div class="k">Next</div><div class="v">' + esc(title(B.pages[next])) + '</div></a>' : '<span class="sp"></span>');
    h.push('</nav>');

    docEl.innerHTML = h.join('');
    $('#crumb').innerHTML = '<b>' + esc(p.product === 'cloud' ? 'Cloud' : 'CMS') + '</b> / ' + esc(p.section) +
      (r ? ' / ' + nfmt(r.words) + ' words' : '');
    if (keepScroll) $('#rbody').scrollTop = top;
  }

  /* ---------------------------------------------------------- blocks */
  function blocks(bs, depth) {
    if (!bs || !bs.length) return '';
    var out = [], i;
    for (i = 0; i < bs.length; i++) out.push(block(bs[i], depth));
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
        var label = (b.title && b.title.trim()) ? b.title : (ADM_LABEL[kind] || kind);
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
        // The bundle only carries root-absolute paths, so the file is on the
        // documentation host. Link to it there rather than request a 404 here.
        return '<figure class="fig"><a class="imgph" href="' + attr(IMG_HOST + src) +
          '" target="_blank" rel="noopener noreferrer">' +
          '<span class="ii" aria-hidden="true">&#9634;</span><span>' +
          '<span class="il">' + esc(b.alt || 'Screenshot') + '</span>' +
          '<span class="ip">' + esc(src) + '</span></span></a>' + cap + '</figure>';
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
        return '<p><span class="badge"' + (b.tooltip ? ' title="' + attr(b.tooltip) + '"' : '') + '>' +
          esc(b.label) + '</span></p>';
      case 'columns':
        return '<div class="cols">' + b.cols.map(function (c) {
          return '<div>' + blocks(Array.isArray(c) ? c : (c.blocks || []), depth + 1) + '</div>';
        }).join('') + '</div>';
      case 'endpoint': return endpoint(b, depth);
      default:
        return b.html ? '<p>' + fixHtml(b.html) + '</p>' : (b.text ? '<p>' + esc(b.text) + '</p>' : '');
    }
  }

  function endpoint(b, depth) {
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
        pans.push('<div class="tp" role="tabpanel"' + (j === 0 ? '' : ' hidden') + '>' +
          codeBlock(t.code, t.lang, '') + '</div>');
      });
      h.push('<div class="tabs" data-g="' + gid + '"><div class="tl" role="tablist">' +
        bts.join('') + '</div>' + pans.join('') + '</div>');
    }
    if (b.responses && b.responses.length) {
      h.push('<p class="es">Response</p>');
      b.responses.forEach(function (r) {
        var bad = Number(r.status) >= 400;
        h.push('<p><span class="st' + (bad ? ' err' : '') + '"><span class="dot"></span>' +
          esc(String(r.status == null ? '' : r.status)) + ' ' + esc(r.statusText || '') +
          (r.time ? ' - ' + esc(r.time) : '') + '</span></p>');
        var body = r.body || '';
        var looksJson = /^\s*[[{"]/.test(body);
        if (!looksJson && /<[a-zA-Z]/.test(body)) h.push('<p>' + fixHtml(body) + '</p>');
        else h.push(codeBlock(body, r.lang || 'json', ''));
      });
    }
    h.push('</div></div>');
    return h.join('');
  }

  /* ---------------------------------------------------- code + syntax */
  var KW = /^(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|import|export|from|default|async|await|new|class|extends|implements|try|catch|finally|throw|typeof|instanceof|interface|type|enum|public|private|protected|readonly|declare|namespace|as|of|in|null|true|false|undefined|this|super|yield|void|delete|module|require|package|def|end|fn|use|pub|match|query|mutation|fragment|schema|FROM|RUN|COPY|CMD|ENV|WORKDIR|EXPOSE)$/;
  var HASHLANG = /^(bash|sh|shell|zsh|yaml|yml|env|dockerfile|txt|text|python|py|ruby|rb|toml|ini|conf|graphql)$/;
  var SLASHLANG = /^(js|jsx|ts|tsx|javascript|typescript|json|json5|c|cpp|java|go|rust|php|scss|css|graphql|http|diff)$/;

  function codeBlock(src, lang, title) {
    src = String(src == null ? '' : src);
    lang = (lang || '').toLowerCase();
    var head = '';
    if (title || lang) {
      head = '<div class="ct">' + (title ? esc(title) : '') +
        (lang ? '<span class="cl">' + esc(lang) + '</span>' : '') + '</div>';
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
      if (slash && c === '/' && c2 === '/') {
        flush(); e = src.indexOf('\n', i); if (e < 0) e = n;
        push('tok-c', src.slice(i, e)); i = e; continue;
      }
      if (slash && c === '/' && c2 === '*') {
        flush(); e = src.indexOf('*/', i + 2); e = e < 0 ? n : e + 2;
        push('tok-c', src.slice(i, e)); i = e; continue;
      }
      if (hashc && c === '#') {
        flush(); e = src.indexOf('\n', i); if (e < 0) e = n;
        push('tok-c', src.slice(i, e)); i = e; continue;
      }
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

  /* ---------------------------------------------------------- go */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
