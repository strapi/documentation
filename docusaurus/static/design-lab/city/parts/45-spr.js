
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
  function planeTile(baseC, warmC, coolC, amp, tooth) {
    var S = 512, c = document.createElement('canvas');
    c.width = S; c.height = S;
    var g = c.getContext('2d'), i, o, j, k;
    g.fillStyle = rgbs(baseC); g.fillRect(0, 0, S, S);
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
    SPR.tableTile = planeTile(C.table, C.tableHi, hx('#1B120E'), 1.0, 0.5);
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
