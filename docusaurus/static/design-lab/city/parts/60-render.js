
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
  /* the three colourways of each archetype, in the same index order */
  var MVARC = ARCH_ORDER.map(function (a) {
    return MVAR[a].map(function (h) { return hx(h); });
  });
  var VARF = [0.92, 1.0, 1.09];
  /* 0 face top, 1 face bottom, 2 flat, 3 recess, 4 deep recess,
     5 highlight, 6 mid shade, 7 the dark of an opening */
  var MULS = [1.08, 0.86, 0.97, 0.70, 0.55, 1.20, 0.80, 0.34];
  var palCache = {};
  function smoothstep(t) { return t * t * (3 - 2 * t); }

  function faceCol(m, v, tB, hB, part) {
    var key = (((m * 3 + v) * 9 + tB) * 19 + hB) * 8 + part;
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
    var key = 900000 + ((m * 3 + v) * 19 + hB) * 4 + part;
    var s = palCache[key];
    if (s !== undefined) return s;
    var base = m < 7 ? MVARC[m][v] : lit(MBASE[m], VARF[v]);
    var c = mix(mix(base, mix(C.sun, C.skyLo, 0.40), MK[m] * 0.66), C.shadow, 0.07);
    if (part === 0) c = lit(c, 1.10);
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

  /* ==================================================================
     RENDER
     ================================================================== */
  var shC = null, shX = null, SHS = 0.30;
  var skyKey = '', skyGrad = null, gndGrad = null, hazeGrad = null, vigGrad = null;
  var bloom = [];
  var lastFrameMs = 0, frameSamples = [], PROF = null, GSTRIPS = 0, DBG = 0;
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
      g2.addColorStop(0.00, rgbs(mix(C.haze, C.tableHi, 0.55)));
      g2.addColorStop(0.06, rgbs(mix(C.tableHi, C.haze, 0.30)));
      g2.addColorStop(0.26, rgbs(mix(C.tableHi, C.sun, 0.06)));
      g2.addColorStop(0.62, rgbs(mix(C.table, C.tableHi, 0.34)));
      g2.addColorStop(1.00, rgbs(mix(C.table, C.ink, 0.42)));
      gndGrad = g2;

      var hb0 = top - H * 0.11, hb1 = top + H * 0.16;
      var g3 = ctx.createLinearGradient(0, hb0, 0, hb1);
      g3.addColorStop(0, rgbas(C.haze, 0));
      g3.addColorStop(0.42, rgbas(mix(C.haze, C.skyLo, 0.4), 0.52));
      g3.addColorStop(0.52, rgbas(mix(C.haze, C.skyLo, 0.3), 0.42));
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
    var NS = 40, hstep = (H - y0) / NS, i;
    for (i = 0; i < NS; i++) {
      var ya = y0 + i * hstep, yb = ya + hstep + 1, yc = (ya + yb) / 2;
      var den = SE + ((yc - PCY) / FOC) * CE;
      if (den <= 0.0006) continue;
      var d = eye[2] / den;
      if (d < 8 || d > 26000) continue;
      var a2 = (1 - hazeAt(d)) * alphaMul;
      if (a2 < 0.02) continue;
      var kf = FOC / d;
      var A = kf * rgt[0], Bc = -kf * upv[0], Cc = kf * rgt[1], Dc = -kf * upv[1];
      var E = PCX - kf * (eye[0] * rgt[0] + eye[1] * rgt[1]);
      var F2 = PCY + kf * (eye[0] * upv[0] + eye[1] * upv[1] + eye[2] * upv[2]);
      var vv = -(yc - PCY) / FOC;
      var gx = eye[0] + d * (fwd[0] + vv * upv[0]);
      var gy = eye[1] + d * (fwd[1] + vv * upv[1]);
      var span = d * (W / FOC) * 1.1 + d * (hstep / FOC) * 2 + 40;
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
    lg.addColorStop(1, rgbs(mix(C.paper, [255, 255, 255], 0.34)));
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
    var L = paper.lines, i, drawnText = 0, budget = 110, bars = 0;
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
      ctx.globalAlpha = clamp(1 - hazeAt(depthOf(ln.x, ln.y, 0)), 0.15, 1) * (ln.kind === 'h' ? 0.55 : 0.36);
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
      ctx.fillStyle = rgbas(C.print, 0.42);
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
      groundSprite(SPR.glow, q.x, q.y, w2 * 1.7, 0.20 * (1 - hazeAt(dq) * 0.7));
      groundSprite(SPR.glint, q.x + sunGnd[0] * 3, q.y + sunGnd[1] * 3, w2 * 0.5, 0.15 * (1 - hazeAt(dq)));
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
    if (fsz > 8 && fsz < 190) {
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
      /* a flat roof is never clean: gravel, a light well, the parapet return */
      if (lod && pxW > 44 && b.deco && b.deco !== 'plain' && b.hw > 8) {
        ctx.globalAlpha = 0.22;
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
    if (jag) {
      var st = 6, s2;
      if (!pf(0, 0)) return; ctx.moveTo(px, py);
      if (!pf(1, 0)) return; ctx.lineTo(px, py);
      for (s2 = st; s2 >= 0; s2--) {
        var u = s2 / st;
        var wj = 0.62 + rnd01(r.h32 + j * 71, s2) * 0.38;
        if (!pf(u, wj)) return; ctx.lineTo(px, py);
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
        /* the awning over it */
        ctx.beginPath(); fqo(0.34, g1 * 0.90, 0.68, g1 * 0.90, 3.4);
        ctx.fillStyle = faceCol(M_AWN, 1, 6, hB, 0); ctx.fill();
        ctx.beginPath();
        for (i = 0; i < 6; i += 2) fqo(0.34 + 0.34 * i / 6, g1 * 0.90, 0.34 + 0.34 * (i + 1) / 6, g1 * 0.90, 3.4);
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
        ctx.beginPath(); fqo(0.05, g1 * 0.82, 0.30, g1 * 0.82, 3.0);
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
    var bays = bayCount(fw), i, k;
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

    ctx.beginPath();
    for (k = 0; k < nf; k++) for (i = 0; i < bays; i++) {
      fq((i + 0.17) / bays, g1 + k * fs + fs * 0.38, (i + 0.83) / bays, g1 + (k + 1) * fs - fs * 0.10);
    }
    ctx.fillStyle = glassCol(m, v, tB, hB, 0.3);
    ctx.globalAlpha = 0.94; ctx.fill(); ctx.globalAlpha = 1;
    if (flr >= 28 && op.length <= 140) {
      var gp = [];
      for (k = 0; k < nf; k++) for (i = 0; i < bays; i++) {
        gp.push((i + 0.17) / bays, g1 + k * fs + fs * 0.38, (i + 0.83) / bays, g1 + (k + 1) * fs - fs * 0.10);
      }
      panes(gp, 2, 2, faceCol(m, v, tB, hB, 5));
    }

    /* warm light in some of them, and not the same warmth in each */
    if (lite > 0.001 && dot < 0.55) {
      var n2 = 0;
      for (k = 0; k < nf; k++) {
        for (i = 0; i < bays; i++) {
          var q = rnd01(r.h32 + k * 131, i + 11);
          if (q > lite) continue;
          ctx.beginPath();
          fq((i + 0.19) / bays, g1 + k * fs + fs * 0.40, (i + 0.81) / bays, g1 + (k + 1) * fs - fs * 0.12);
          ctx.globalAlpha = 0.55 + rnd01(r.h32 + k * 17, i + 5) * 0.45;
          ctx.fillStyle = litCol(hB); ctx.fill();
          if (++n2 > 130) break;
        }
        if (n2 > 130) break;
      }
      ctx.globalAlpha = 1;
      if (n2 > 5 && hpx > 40) {
        bloom.push([(Q8X[0] + Q8X[6]) / 2, (Q8Y[0] + Q8Y[6]) / 2,
          Math.min(wpx, hpx) * 0.5, 0.14 * (1 - r.hz)]);
      }
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
    var bays = bayCount(fw), i, k;
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

    /* the glass inside them */
    var gl = [];
    for (k = 0; k < nf; k++) for (i = 0; i < bays; i++) {
      gl.push((i + 0.31) / bays, g1 + k * fs + fs * 0.25, (i + 0.69) / bays, g1 + (k + 1) * fs - fs * 0.25);
    }
    ctx.beginPath();
    for (i = 0; i < gl.length; i += 4) fq(gl[i], gl[i + 1], gl[i + 2], gl[i + 3]);
    ctx.fillStyle = glassCol(m, v, tB, hB, 0);
    ctx.fill();
    if (flr >= 30 && gl.length <= 140) panes(gl, 2, 3, faceCol(m, v, tB, hB, 5));

    if (lite > 0.001) {
      var n2 = 0;
      ctx.fillStyle = litCol(hB);
      for (k = 0; k < nf; k++) for (i = 0; i < bays; i++) {
        if (rnd01(r.h32 + k * 97, i + 13) > lite) continue;
        ctx.beginPath();
        fq((i + 0.32) / bays, g1 + k * fs + fs * 0.26, (i + 0.68) / bays, g1 + (k + 1) * fs - fs * 0.26);
        ctx.globalAlpha = 0.5 + rnd01(r.h32 + k * 7, i) * 0.5;
        ctx.fill();
        if (++n2 > 120) break;
      }
      ctx.globalAlpha = 1;
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

    /* the glazing, in small panes */
    ctx.beginPath();
    var pr = 5, pc = 3;
    for (k = 0; k < nf; k++) for (i = 0; i < bays; i++) {
      var a0 = (i + 0.23) / bays, a1 = (i + 0.77) / bays;
      var b0 = g1 + k * fs + fs * 0.17, b1 = g1 + (k + 1) * fs - fs * 0.32;
      for (q = 0; q < pc; q++) for (var s = 0; s < pr; s++) {
        fq(a0 + (a1 - a0) * (q + 0.08) / pc, b0 + (b1 - b0) * (s + 0.08) / pr,
           a0 + (a1 - a0) * (q + 0.92) / pc, b0 + (b1 - b0) * (s + 0.92) / pr);
      }
    }
    ctx.fillStyle = glassCol(m, v, tB, hB, 0);
    ctx.fill();

    if (lite > 0.001) {
      var n2 = 0;
      ctx.fillStyle = litCol(hB);
      for (k = 0; k < nf; k++) for (i = 0; i < bays; i++) {
        if (rnd01(r.h32 + k * 61, i + 31) > lite) continue;
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
      if (!proj(x0, y0, c.z0)) return; var p0x = px, p0y = py;
      if (!proj(x1, y1, c.z0)) return; var p1x = px, p1y = py;
      if (!proj(x1, y1, c.z1)) return; var p2x = px, p2y = py;
      if (!proj(x0, y0, c.z1)) return; var p3x = px, p3y = py;
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
    var i, nb = quality ? 7 : 4;
    var m = dm.m, v = 1;
    var d = depthOf(dm.cx, dm.cy, dm.z0 + dm.h * 0.5);
    if (dm.r * (FOC / d) < 1.2) return;
    /* stacked latitude bands: cheap, and it reads as a real hemisphere */
    for (i = nb - 1; i >= 0; i--) {
      var t0 = i / nb, t1 = (i + 1) / nb;
      var r0 = dm.r * cos(t0 * PI / 2), r1 = dm.r * cos(t1 * PI / 2);
      var z0 = dm.z0 + dm.h * sin(t0 * PI / 2), z1 = dm.z0 + dm.h * sin(t1 * PI / 2);
      var seg = quality ? 14 : 8, q;
      ctx.beginPath();
      for (q = 0; q <= seg; q++) {
        var a = q / seg * TAU;
        if (!proj(dm.cx + cos(a) * r0, dm.cy + sin(a) * r0, z0)) return;
        if (q === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      for (q = seg; q >= 0; q--) {
        var a2 = q / seg * TAU;
        if (!proj(dm.cx + cos(a2) * r1, dm.cy + sin(a2) * r1, z1)) return;
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      if (!proj(dm.cx, dm.cy, z0)) return;
      var mx = px, my = py;
      if (!proj(dm.cx + sunGnd[0] * dm.r, dm.cy + sunGnd[1] * dm.r, z0)) return;
      var gx = px, gy = py;
      var g = ctx.createLinearGradient(gx, gy - (dm.h * pS) * 0.5, mx * 2 - gx, my * 2 - gy);
      g.addColorStop(0, faceCol(m, v, 8, hB, 5));
      g.addColorStop(0.55, faceCol(m, v, 5, hB, 2));
      g.addColorStop(1, faceCol(m, v, 1, hB, 6));
      ctx.fillStyle = g;
      ctx.fill();
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
          if (!proj(wx1, wy1, f.z0 + (f.z1 - f.z0) * (k + 1) / lifts)) continue;
          ctx.moveTo(qx0, qy0); ctx.lineTo(px, py);
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
      var i, t = TNOW * 0.00016;
      for (i = 0; i < 4; i++) {
        var ph = (t + i * 0.25) % 1;
        var rr = R * (0.6 + ph * 2.4);
        if (!proj(p.cx + sunGnd[1] * ph * p.r * 2.2, p.cy - sunGnd[0] * ph * p.r * 2.2, p.z + ph * p.r * 7)) continue;
        ctx.globalAlpha = (1 - ph) * 0.34 * (1 - hz * 0.7);
        ctx.drawImage(SPR.smoke, px - rr, py - rr, rr * 2, rr * 2);
      }
      ctx.globalAlpha = 1;
      return;
    }
    var dsx = sunSX - sx, dsy = sunSY - sy;
    var dl = Math.hypot(dsx, dsy) || 1;
    ctx.globalAlpha = 1 - hz * 0.55;
    ctx.drawImage(SPR.canopy, sx - R, sy - R * 0.90, R * 2, R * 1.80);
    ctx.globalAlpha = (1 - hz * 0.7) * 0.92;
    ctx.drawImage(SPR.canopyLit, sx + (dsx / dl) * R * 0.26 - R * 0.56, sy - R * 0.36 - R * 0.50,
      R * 1.12, R * 1.00);
    ctx.globalAlpha = 1;
    if (hz > 0.14) spriteAt(SPR.haze, sx, sy - R * 0.1, R * 1.02, R * 0.95, hz * 0.9);
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
      if (!proj(a0x, a0y, z0)) return; var q0 = [px, py];
      if (!proj(a1x, a1y, z0)) return; var q1 = [px, py];
      if (!proj(a1x, a1y, z1)) return; var q2 = [px, py];
      if (!proj(a0x, a0y, z1)) return; var q3 = [px, py];
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

  function drawProps() {
    var i, n = props.length, drawn = 0;
    for (i = 0; i < n; i++) {
      var p = props[i];
      var d = depthOf(p.x, p.y, p.z || 4);
      if (d < 12) continue;
      var hz = hazeAt(d);
      if (hz > 0.82) continue;
      var s = FOC / d;
      if (p.k === 'bird') { drawBird(p, s, hz); continue; }
      if (s * 6 < 1.6) continue;
      if (drawn++ > 520) break;
      var hB = Math.round(hz / HZ_MAX * 18); if (hB > 18) hB = 18; if (hB < 0) hB = 0;
      switch (p.k) {
        case 'lamp':  drawLamp(p, s, hz, hB); break;
        case 'bench': drawBench(p, s, hB); break;
        case 'boll':  miniBox(p.x, p.y, 0.55, 0.55, 0, 2.4, 0, M_DARK, hB); break;
        case 'van':   drawVan(p, s, hB); break;
        case 'stall': drawStall(p, s, hB); break;
        case 'tree':  drawPropTree(p, hz); break;
        case 'well':  drawWell(p, hB); break;
        case 'wash':  drawWash(p, s, hB); break;
      }
    }
  }

  function drawLamp(p, s, hz, hB) {
    groundSprite(SPR.warm, p.x, p.y, 9, 0.22 * (1 - hz));
    if (!proj(p.x, p.y, 0)) return; var x0 = px, y0 = py;
    if (!proj(p.x, p.y, p.h)) return; var x1 = px, y1 = py;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
    ctx.strokeStyle = faceCol(M_STEEL, 1, 4, hB, 2);
    ctx.lineWidth = Math.max(0.5, 0.75 * s * 1.4); ctx.lineCap = 'round';
    ctx.stroke();
    var rr = Math.max(1.0, 1.5 * s);
    ctx.beginPath(); ctx.arc(x1, y1 - rr * 0.5, rr, 0, TAU);
    ctx.fillStyle = litCol(hB); ctx.fill();
    if (rr > 1.4) bloom.push([x1, y1 - rr * 0.5, rr * 5, 0.26 * (1 - hz)]);
  }
  function drawBench(p, s, hB) {
    var ca = cos(p.yaw), sa = sin(p.yaw);
    miniBox(p.x, p.y, ca > 0.5 || ca < -0.5 ? 3.4 : 0.9, ca > 0.5 || ca < -0.5 ? 0.9 : 3.4, 1.4, 2.1, p.yaw, M_WOOD, hB);
    miniBox(p.x - sa * 0.8, p.y + ca * 0.8, ca > 0.5 || ca < -0.5 ? 3.4 : 0.35, ca > 0.5 || ca < -0.5 ? 0.35 : 3.4, 2.1, 3.9, p.yaw, M_WOOD, hB);
  }
  function drawVan(p, s, hB) {
    var m = M_VAN0 + (p.hue % 4);
    miniBox(p.x, p.y, 4.6, 2.0, 0.7, 4.4, p.yaw, m, hB);
    miniBox(p.x + cos(p.yaw) * 3.2, p.y + sin(p.yaw) * 3.2, 1.6, 2.0, 4.4, 5.6, p.yaw, m, hB);
    miniBox(p.x, p.y, 4.7, 2.1, 0.0, 0.7, p.yaw, M_DARK, hB);
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
    if (!proj(p.x, p.y, 0)) return; var x0 = px, y0 = py;
    if (!proj(p.x, p.y, p.z)) return;
    var R = p.r * pS;
    if (R < 0.7) return;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(px, py);
    ctx.strokeStyle = rgbas(mix(mix(C.earth, C.shadow, 0.5), C.haze, hz), 0.9);
    ctx.lineWidth = Math.max(0.7, R * 0.16); ctx.stroke();
    var sx = px, sy = py;
    var dsx = sunSX - sx, dsy = sunSY - sy, dl = Math.hypot(dsx, dsy) || 1;
    ctx.globalAlpha = 1 - hz * 0.55;
    ctx.drawImage(SPR.canopy, sx - R, sy - R * 1.15, R * 2, R * 1.9);
    ctx.globalAlpha = (1 - hz * 0.7) * 0.9;
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
      ctx.fillStyle = i % 3 === 0 ? faceCol(M_TRIM, 1, 7, hB, 5)
        : i % 3 === 1 ? faceCol(M_AWN, 1, 6, hB, 0) : faceCol(M_SHUT, 1, 6, hB, 0);
      ctx.fillRect(mxp - ww / 2, myp, ww, hh);
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

  /* ---------------------------------------------------------- labels */
  function drawLabels() {
    var i, shown = 0;
    var picks = [];
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
    ctx.strokeStyle = sel ? rgbs(C.sun) : 'rgba(250,240,220,0.85)';
    ctx.lineWidth = sel ? 2 : 1.4;
    ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x, y + 24); ctx.stroke();
    ctx.fillStyle = sel ? rgbs(C.sun) : 'rgba(250,240,220,0.94)';
    rrect(x - tw / 2, y - 13, tw, 21, 10); ctx.fill();
    ctx.fillStyle = rgbs(C.ink);
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y + 2);
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
    updateCam();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    bloom.length = 0; GSTRIPS = 0; NPART = 0; NFILL = 0; NGRAD = 0;

    var _p = PROF, _t = performance.now(), _m = _p ? function (k) { var n = performance.now(); _p[k] = (_p[k] || 0) + (n - _t); _t = n; } : function () { };
    drawSky(); _m('sky');
    planeStrips(SPR.tablePat, null, 0.75); _m('table');
    drawPaper(); _m('paper');
    drawGroundDetail(); _m('ground');
    drawRoads(); _m('roads');
    drawWater(); _m('water');

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
    var quota = W * H * (dragging ? 0.45 : 1.05), spent = 0, cnt = 0, capN = dragging ? 14 : 30;
    for (i = 0; i < ranked.length; i++) {
      var q = ranked[i];
      q._q = (DBG === 2 ? false : (spent < quota && cnt < capN && q._scr > 16));
      if (q._q) { spent += q._area; cnt++; }
    }
    for (i = 0; i < vis.length; i++) drawBuilding(vis[i], vis[i]._q);
    _m('blds');

    drawProps(); _m('props');

    drawLabels();
    if (cur && rec[cur] && rec[cur].parts) drawMarker(rec[cur], true);
    if (hovered && hovered !== cur && rec[hovered]) drawMarker(rec[hovered], false);

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
