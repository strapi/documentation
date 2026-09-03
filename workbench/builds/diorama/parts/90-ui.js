
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
