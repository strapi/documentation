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
      probe.push({ x: paper.tx, y: paper.ty });
      probe.push({ x: paper.tx + paper.tsize * 8.6, y: paper.sy });
    } else probe.push({ x: bounds.cx, y: bounds.cy });

    var save = { az: cam.az, el: cam.el, dist: cam.dist, tx: cam.tx, ty: cam.ty };
    var hudEl = document.getElementById('hud');
    var BAR = (hudEl ? hudEl.offsetHeight : 100) + 6;
    var d = span * 0.36, tries;
    for (tries = 0; tries < 40; tries++) {
      cam.az = az; cam.el = el; cam.dist = d; cam.tx = tx; cam.ty = ty;
      updateCam();
      var ok = true, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (i = 0; i < probe.length; i++) {
        if (!proj(probe[i].x, probe[i].y, 0)) { ok = false; break; }
        if (px < x0) x0 = px; if (px > x1) x1 = px;
        if (py < y0) y0 = py; if (py > y1) y1 = py;
      }
      /* a hair of bleed left and right is a photograph, not a diagram */
      if (ok && x0 > -W * 0.03 && x1 < W * 1.03 && y0 > H * 0.03 && y1 < H - BAR) break;
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
