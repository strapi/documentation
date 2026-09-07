  /* a negative stencil: ochre pigment blown over the hand, cave-wall style.
     Two passes — a loose cloud, then dense pigment hugging the hand's
     contour — and the hand itself carved back out to bare wall. */
  function drawHandStencil(cv, h) {
    var g = cv.getContext('2d');
    var Wc = cv.width, Hc = cv.height;
    var rnd = mulberry32(hashStr(h.name));
    var scale = 0.8 + 0.38 * Math.sqrt(h.pages / maxHandPages);
    var flip = rnd() < 0.5 ? -1 : 1;
    var rot = (rnd() - 0.5) * 0.3;
    var cx = Wc / 2 + (rnd() - 0.5) * 8, cy = Hc / 2 + 8;
    var cosr = Math.cos(rot), sinr = Math.sin(rot);
    function toCanvas(hx, hy) {
      var x = hx * flip * scale, y = hy * scale;
      return [cx + x * cosr - y * sinr, cy + x * sinr + y * cosr];
    }
    function dot(x, y, alpha) {
      var p = rnd();
      g.fillStyle = 'rgba(' + (p < 0.6 ? '196,110,42' : p < 0.85 ? '169,82,31' : '224,142,64') + ',' + alpha.toFixed(3) + ')';
      var sz = rnd() < 0.62 ? 1 : rnd() < 0.85 ? 2 : 3;
      g.fillRect(x, y, sz, sz);
    }
    /* the skeleton, in hand space (y up the fingers) */
    var splay = 0.9 + rnd() * 0.5;
    var tips = [[-11, -30, 5.6], [-3.7, -36, 6], [3.7, -33, 5.6], [11, -24, 5]];
    var segs = [];
    for (var f = 0; f < 4; f++) {
      segs.push([tips[f][0] * 0.9, 2, tips[f][0] * (1.15 + splay * 0.35), tips[f][1], tips[f][2] / 2]);
    }
    segs.push([-9, 17, -26.5, 1, 3.5]);   /* thumb */
    segs.push([0, 30, 0, 52, 9]);         /* wrist */

    /* pass 1: the loose cloud, seeded by pages touched */
    var R = 48 * scale + 11;
    var dots = Math.min(2400, 700 + h.pages * 7);
    for (var k = 0; k < dots; k++) {
      var a = rnd() * Math.PI * 2, rr;
      if (rnd() < 0.8) rr = R * (0.18 + 0.82 * Math.sqrt(rnd()));
      else rr = R * (1 + rnd() * 0.45);
      var fade = rr > R ? 0.4 : 1;
      dot(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 1.08, (0.08 + rnd() * 0.22) * fade);
    }
    /* pass 2: pigment hugging the contour — the breath aimed at the hand */
    for (var si = 0; si < segs.length; si++) {
      var sgm = segs[si];
      var dx = sgm[2] - sgm[0], dy = sgm[3] - sgm[1];
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / len, ny = dx / len;
      var n = Math.round(len * 9);
      for (k = 0; k < n; k++) {
        var t = rnd(), side = rnd() < 0.5 ? -1 : 1;
        var off = sgm[4] + 1 + Math.pow(rnd(), 0.8) * 8.5;
        var hx = sgm[0] + dx * t + nx * side * off;
        var hy = sgm[1] + dy * t + ny * side * off;
        var p2 = toCanvas(hx, hy);
        dot(p2[0], p2[1], 0.14 + rnd() * 0.3);
      }
    }
    /* palm halo */
    for (k = 0; k < 340; k++) {
      var pa = rnd() * Math.PI * 2;
      var pr = 1.05 + Math.pow(rnd(), 0.8) * 0.55;
      var p3 = toCanvas(Math.cos(pa) * 13.5 * pr, 15 + Math.sin(pa) * 18 * pr);
      dot(p3[0], p3[1], 0.13 + rnd() * 0.28);
    }
    /* carve the hand back to bare wall */
    g.save();
    g.translate(cx, cy);
    g.rotate(rot);
    g.scale(flip * scale, scale);
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = '#000'; g.strokeStyle = '#000'; g.lineCap = 'round';
    g.beginPath(); g.ellipse(0, 15, 13.5, 18, 0, 0, 6.2832); g.fill();
    g.fillRect(-9, 28, 18, 24);
    for (f = 0; f < 4; f++) {
      g.lineWidth = tips[f][2];
      g.beginPath();
      g.moveTo(tips[f][0] * 0.9, 2);
      g.lineTo(tips[f][0] * (1.15 + splay * 0.35), tips[f][1]);
      g.stroke();
    }
    g.lineWidth = 7;
    g.beginPath(); g.moveTo(-9, 17); g.lineTo(-26.5, 1); g.stroke();
    g.restore();
  }
