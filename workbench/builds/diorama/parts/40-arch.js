
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
        add({ k: 'lamp', x: wl[0], y: wl[1], h: 13 + rnd01(hl, 2) * 3 });
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
