/* ============================================================================
   APPENDIX PLATE — SPECIMENS GATHERED ABROAD
   The one addition the owner allowed: a single sheet filed after the last
   drawer of the whole collection. Six specimens received in exchange from
   the sister collections of the Design Lab; each one, pressed here, is a
   door. (A seventh, the kit, went back to its maker when the network was
   fixed at the seven highlights; no crossing leads there any more.) Everything in this file is additive: it reads the cabinet's globals
   (parseHash, SPECIALS, attachLens, stampSVG) and touches only the DOM it
   creates itself. If anything here fails, it fails silently and the
   herbarium is exactly what it was.
   ========================================================================== */
(function () {
  'use strict';

  var CROSS_MS = 720;

  function reduced() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }

  /* ------------------------------------------------------ QUICK START FIRST
     On the first visit of a session, and only at the front door (no hash),
     the collection itself opens: the whole tray, with the Quick Start Guide
     sheet at its top wearing a START HERE bookmark ribbon. Every later
     visit opens exactly as it always did. An invitation, never a
     redirection of somebody who asked for a particular sheet. */
  var QS_SLUG = '/cms/quick-start';
  var QS_GESTURE = false;
  (function frontDoor() {
    try {
      var h = location.hash;
      var atDoor = (!h || h === '#' || h === '#/');
      var first = sessionStorage.getItem('herb.qsWelcomed') !== '1';
      if (first) sessionStorage.setItem('herb.qsWelcomed', '1');
      if (atDoor && first) {
        QS_GESTURE = true;
        location.replace('#~all');
      }
    } catch (e) { QS_GESTURE = false; /* no session memory: open as always */ }
  })();

  /* ------------------------------------------------------------ tape helper
     Same linen strips plantSVG lays over its stems: a shadow pass, then the
     strip itself. Coordinates are in each figure's own 100x130 viewBox. */
  function tape(x, y, a, w, h) {
    return '<g transform="translate(' + x + ',' + y + ') rotate(' + a + ')">'
      + '<rect x="' + (-w / 2) + '" y="' + (-h / 2 + 1.1) + '" width="' + w + '" height="' + h + '" fill="#8a7247" opacity="0.16"/>'
      + '<rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" fill="#eee5cf" stroke="#c9bb9a" stroke-width="0.5"/>'
      + '</g>';
  }
  function svgOpen(extra) {
    return '<svg viewBox="0 0 100 130" preserveAspectRatio="xMidYMid meet" aria-hidden="true"' + (extra || '') + '>';
  }

  /* ============================================================ the figures
     Six pressed specimens, each drawn in the hand of its native country. */

  /* 1 · a pixel leaf — crisp square dots, one tile per cell, no antialias */
  function figPixel() {
    var C = { D: '#2c5522', M: '#4f8f35', L: '#79b552', H: '#a7d67f', S: '#3f6a2a' };
    var rows = [
      '.....D.....',
      '....DLD....',
      '...DLMLD...',
      '...DMMMD...',
      '..DLMMMLD..',
      '..DMMHMMD..',
      '.DLMMHMMLD.',
      '..DMMMMMD..',
      '..DLMMMLD..',
      '...DMMMD...',
      '....DMD....',
      '.....S.....',
      '.....S.....'
    ];
    var cell = 6, ox = 17, oy = 14, s = '';
    for (var r = 0; r < rows.length; r++) {
      for (var c = 0; c < rows[r].length; c++) {
        var k = rows[r].charAt(c);
        if (k === '.') continue;
        s += '<rect x="' + (ox + c * cell) + '" y="' + (oy + r * cell) + '" width="' + cell + '" height="' + cell + '" fill="' + C[k] + '"/>';
      }
    }
    /* the pressed shadow, itself in tiles */
    var sh = '';
    for (var r2 = 0; r2 < rows.length; r2++) {
      for (var c2 = 0; c2 < rows[r2].length; c2++) {
        if (rows[r2].charAt(c2) === '.') continue;
        sh += '<rect x="' + (ox + c2 * cell + 2) + '" y="' + (oy + r2 * cell + 3) + '" width="' + cell + '" height="' + cell + '"/>';
      }
    }
    return svgOpen(' shape-rendering="crispEdges"')
      + '<g fill="#4a3a22" opacity="0.09">' + sh + '</g>'
      + s
      + tape(50, 96, -4, 26, 6.5)
      + tape(30, 42, 7, 20, 6)
      + '</svg>';
  }

  /* 2 · sea-heather in iron-gall engraving strokes — nothing but hatched ink */
  function figHeather() {
    var ink = '#43301b';
    var s = svgOpen();
    s += '<g fill="none" stroke="' + ink + '" stroke-linecap="round">';
    /* engraved ground: rows of short strokes, sparser as they rise */
    var gy = [116, 112.6, 109.4];
    for (var g = 0; g < 3; g++) {
      var n = 9 - g * 2;
      for (var i = 0; i < n; i++) {
        var gx = 22 + i * (56 / (n - 1)) + (g % 2) * 2.4;
        s += '<path d="M' + gx + ',' + gy[g] + ' l' + (3.4 - g * 0.5) + ',0" stroke-width="0.55" opacity="' + (0.5 - g * 0.12) + '"/>';
      }
    }
    /* main sprig with two branches */
    s += '<path d="M50,114 C47,94 53,74 49,54 C47,42 51,30 53,20" stroke-width="1.15"/>';
    s += '<path d="M49.4,88 C42,80 38,70 37,58" stroke-width="0.85"/>';
    s += '<path d="M50.6,72 C58,64 62,55 63,44" stroke-width="0.85"/>';
    /* burin shading along the stem: short parallel ticks on the shadowed side */
    for (var t = 0; t < 12; t++) {
      var yy = 108 - t * 7.4;
      var xx = 50.4 - Math.sin(t * 0.55) * 2.4;
      s += '<path d="M' + xx + ',' + yy + ' l2.1,-0.8" stroke-width="0.42" opacity="0.55"/>';
    }
    /* heather bells: little urns hatched inside, in spikes near each tip */
    function bell(x, y, a, sc) {
      return '<g transform="translate(' + x + ',' + y + ') rotate(' + a + ') scale(' + sc + ')">'
        + '<path d="M-1.7,0 C-1.7,-3.6 -0.9,-4.6 0,-4.6 C0.9,-4.6 1.7,-3.6 1.7,0 L1,1.2 L-1,1.2 Z" stroke-width="0.6"/>'
        + '<path d="M-0.9,-3.4 L-0.9,0.4 M0,-4 L0,0.8 M0.9,-3.4 L0.9,0.4" stroke-width="0.3" opacity="0.65"/>'
        + '<path d="M0,1.2 L0,2.6" stroke-width="0.45"/>'
        + '</g>';
    }
    var spikes = [
      [53, 20, [[0, -4, -8, 1], [-2.6, 2, -24, 0.92], [2.8, 3, 16, 0.9], [-1.2, 8, -10, 0.84], [1.8, 12, 8, 0.8]]],
      [37, 58, [[0, -3, -18, 0.9], [-3, 2, -32, 0.82], [2, 4, -4, 0.8]]],
      [63, 44, [[0, -3, 14, 0.9], [3, 2, 30, 0.82], [-2, 4, 2, 0.8]]]
    ];
    for (var sp = 0; sp < spikes.length; sp++) {
      var base = spikes[sp];
      for (var b = 0; b < base[2].length; b++) {
        var bb = base[2][b];
        s += bell(base[0] + bb[0], base[1] + bb[1], bb[2], bb[3]);
      }
    }
    /* tiny scale-leaves, as heather keeps them, cross-hatched */
    for (var L = 0; L < 9; L++) {
      var ly = 104 - L * 5.6, lx = 49.6 - Math.sin(L * 0.55) * 2.2;
      s += '<path d="M' + lx + ',' + ly + ' l-2.6,-1.4 M' + (lx + 0.6) + ',' + (ly - 1) + ' l2.6,-1.2" stroke-width="0.5" opacity="0.8"/>';
    }
    s += '</g>';
    s += tape(50, 100, -3, 24, 6.2) + tape(52, 34, 5, 20, 5.8);
    return s + '</svg>';
  }

  /* 3 · an inked cartoon kelp — the one living specimen; it sways */
  function figKelp() {
    var ink = '#16303a', fill = '#4a9a81', lite = '#6fb69c';
    var s = svgOpen();
    s += '<g class="appdx-kelp-sway">';
    /* pressed shadow */
    s += '<path d="M50,116 C44,96 52,84 46,66 C42,52 50,40 47,26" fill="none" stroke="#4a3a22" stroke-width="7" opacity="0.08" transform="translate(2.4,3)"/>';
    /* central blade, wavy cartoon edges, flat fill + bold outline */
    var blade = 'M50,114 C42,100 54,94 45,80 C38,68 55,62 46,48 C40,38 54,34 49,22'
      + ' C58,26 56,36 62,44 C68,54 56,60 63,72 C69,84 56,90 61,102 C64,110 56,112 50,114 Z';
    s += '<g class="appdx-kelp-sway2">';
    s += '<path d="' + blade + '" fill="' + fill + '" stroke="' + ink + '" stroke-width="2.3" stroke-linejoin="round"/>';
    s += '<path d="M52,104 C48,92 56,86 50,74 C46,64 57,58 51,46" fill="none" stroke="' + lite + '" stroke-width="2.6" stroke-linecap="round"/>';
    s += '<path d="M49,22 C51,18 54,17 57,18" fill="none" stroke="' + ink + '" stroke-width="2.3" stroke-linecap="round"/>';
    s += '</g>';
    /* a side frond, one beat out of phase */
    s += '<g class="appdx-kelp-sway3">'
      + '<path d="M46,92 C36,86 30,76 32,64 C38,68 44,74 46,84 Z" fill="' + fill + '" stroke="' + ink + '" stroke-width="2" stroke-linejoin="round"/>'
      + '</g>';
    s += '</g>';
    /* holdfast: cartoon toes gripping a pebble */
    s += '<path d="M42,116 q3,-6 8,-2 q2,-4 6,-1 q4,-3 6,2 q4,0 3,4 l-24,0 q-2,-2 1,-3 Z" fill="#2e5a4c" stroke="' + ink + '" stroke-width="2" stroke-linejoin="round"/>';
    s += '<ellipse cx="63" cy="119" rx="6" ry="3" fill="#b9a982" stroke="' + ink + '" stroke-width="1.4"/>';
    /* bubbles, plainly comic */
    s += '<g fill="none" stroke="' + ink + '" stroke-width="1.2" opacity="0.85">'
      + '<circle cx="67" cy="40" r="2.6"/><circle cx="71" cy="30" r="1.8"/><circle cx="69" cy="21" r="1.1"/></g>';
    s += tape(48, 108, -5, 26, 6.5);
    return s + '</svg>';
  }

  /* 4 · a riso-flat trailside flower in the Dusk Works palette,
         two inks and an honest misregistration */
  function figRiso() {
    var indigo = '#4c5290', ember = '#de7742';
    var s = svgOpen();
    /* ember pass, printed first and a hair off */
    var petals = '';
    for (var i = 0; i < 6; i++) {
      var a = i * 60;
      petals += '<ellipse cx="0" cy="-13" rx="6.2" ry="10" transform="rotate(' + a + ')"/>';
    }
    s += '<g transform="translate(51.8,42.7)" fill="' + ember + '" fill-opacity="0.9" style="mix-blend-mode:multiply">' + petals + '</g>';
    /* indigo keyplate: stem, leaves, centre, thin petal keylines in true place */
    s += '<g style="mix-blend-mode:multiply">';
    s += '<path d="M50,116 C49,96 51,82 50,58" fill="none" stroke="' + indigo + '" stroke-width="2.6" stroke-opacity="0.92" stroke-linecap="round"/>';
    s += '<path d="M50,96 C41,94 35,88 34,80 C42,80 48,86 50,92 Z" fill="' + indigo + '" fill-opacity="0.92"/>';
    s += '<path d="M50,82 C59,80 65,74 66,66 C58,66 52,72 50,78 Z" fill="' + indigo + '" fill-opacity="0.92"/>';
    var keys = '';
    for (var k = 0; k < 6; k++) keys += '<ellipse cx="0" cy="-13" rx="6.2" ry="10" transform="rotate(' + k * 60 + ')"/>';
    s += '<g transform="translate(50,44)" fill="none" stroke="' + indigo + '" stroke-width="1.15" stroke-opacity="0.9">' + keys + '</g>';
    s += '<circle cx="50" cy="44" r="4.6" fill="' + indigo + '" fill-opacity="0.94"/>';
    s += '<circle cx="50" cy="44" r="1.4" fill="#f4ecdc"/>';
    s += '</g>';
    /* the printer's registration mark, left on the sheet as the Works leave it */
    s += '<g stroke="' + indigo + '" stroke-width="0.5" opacity="0.5" fill="none">'
      + '<circle cx="17" cy="19" r="2.6"/><path d="M17,14.6 V23.4 M12.6,19 H21.4"/></g>';
    s += '<text x="24" y="21" font-family="IBM Plex Mono,monospace" font-size="3" fill="' + indigo + '" opacity="0.55">2-COLOUR · DUSK WORKS</text>';
    s += tape(50, 104, -4, 25, 6.4) + tape(49, 66, 6, 19, 5.6);
    return s + '</svg>';
  }

  /* 5 · a flower that reads, close up, as an antenna diagram,
         collected very far from here */
  function figAntenna() {
    var ink = '#2e3c4c';
    var s = svgOpen();
    s += '<g fill="none" stroke="' + ink + '" stroke-linecap="round">';
    /* ladder feed-line for a stem */
    s += '<path d="M48.6,115 L48.6,52 M51.4,115 L51.4,52" stroke-width="0.8"/>';
    for (var r = 0; r < 8; r++) s += '<path d="M48.6,' + (108 - r * 7.6) + ' L51.4,' + (108 - r * 7.6) + '" stroke-width="0.55"/>';
    /* earth symbol for roots */
    s += '<path d="M42,118.5 H58 M45,121.5 H55 M48,124.5 H52" stroke-width="0.8"/>';
    /* two inductor coils for leaves */
    s += '<path d="M48.6,86 h-3 a2.6,2.6 0 1 0 -5.2,0 a2.6,2.6 0 1 0 -5.2,0 a2.6,2.6 0 1 0 -5.2,0 h-3" stroke-width="0.7"/>';
    s += '<path d="M51.4,72 h3 a2.6,2.6 0 1 1 5.2,0 a2.6,2.6 0 1 1 5.2,0 h3" stroke-width="0.7"/>';
    /* the head: six half-wave elements around a driven node */
    s += '<circle cx="50" cy="37" r="2.7" stroke-width="0.9"/>';
    for (var i = 0; i < 6; i++) {
      var a = -90 + i * 60, rad = a * Math.PI / 180;
      var x1 = 50 + Math.cos(rad) * 4.4, y1 = 37 + Math.sin(rad) * 4.4;
      var x2 = 50 + Math.cos(rad) * 17, y2 = 37 + Math.sin(rad) * 17;
      s += '<path d="M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' L' + x2.toFixed(1) + ',' + y2.toFixed(1) + '" stroke-width="0.85"/>';
      s += '<circle cx="' + x2.toFixed(1) + '" cy="' + y2.toFixed(1) + '" r="1.5" stroke-width="0.6"/>';
      var px = Math.cos(rad + Math.PI / 2) * 2, py = Math.sin(rad + Math.PI / 2) * 2;
      var mx = 50 + Math.cos(rad) * 12, my = 37 + Math.sin(rad) * 12;
      s += '<path d="M' + (mx - px).toFixed(1) + ',' + (my - py).toFixed(1) + ' L' + (mx + px).toFixed(1) + ',' + (my + py).toFixed(1) + '" stroke-width="0.5"/>';
    }
    /* the draughtsman's construction circle */
    s += '<circle cx="50" cy="37" r="19.5" stroke-width="0.4" stroke-dasharray="2 2.4" opacity="0.5"/>';
    /* the sixty-degree note between two elements */
    s += '<path d="M59.5,29.5 A11.4,11.4 0 0 1 61.4,37" stroke-width="0.4" opacity="0.7"/>';
    s += '</g>';
    s += '<text x="63" y="34.6" font-family="IBM Plex Mono,monospace" font-size="3.1" fill="' + ink + '" opacity="0.8">60°</text>';
    s += '<text x="55" y="17.5" font-family="IBM Plex Mono,monospace" font-size="3.4" fill="' + ink + '" opacity="0.85">λ/2</text>';
    s += '<text x="15" y="59" font-family="IBM Plex Mono,monospace" font-size="3" fill="' + ink + '" opacity="0.6">fig. 7 · driven</text>';
    s += '<text x="15" y="63.4" font-family="IBM Plex Mono,monospace" font-size="3" fill="' + ink + '" opacity="0.6">element</text>';
    s += tape(50, 100, -3, 24, 6.2) + tape(50, 57, 4, 18, 5.6);
    return s + '</svg>';
  }

  /* 6 · a four-colour halftone-printed flower — the rosettes wait for the lens */
  function figHalftone() {
    var s = svgOpen();
    s += '<defs>'
      + '<pattern id="apxHtY" width="3.4" height="3.4" patternUnits="userSpaceOnUse"><rect width="3.4" height="3.4" fill="none"/><circle cx="1.7" cy="1.7" r="1.5" fill="#f2c400"/></pattern>'
      + '<pattern id="apxHtM" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(75)"><circle cx="1.6" cy="1.6" r="1.2" fill="#e0347c"/></pattern>'
      + '<pattern id="apxHtC" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(15)"><circle cx="1.6" cy="1.6" r="1.1" fill="#0f9bd7"/></pattern>'
      + '<pattern id="apxHtK" width="3.8" height="3.8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="1.9" cy="1.9" r="0.62" fill="#1c1b1a"/></pattern>'
      + '</defs>';
    function petal(a) {
      return '<path d="M0,-5 C-9,-9 -13,-18 -8,-25 C-4,-30 4,-30 8,-25 C13,-18 9,-9 0,-5 Z" transform="rotate(' + a + ')"/>';
    }
    var head = '<g transform="translate(50,46)">';
    var five = '';
    for (var i = 0; i < 5; i++) five += petal(i * 72);
    head += '<g fill="url(#apxHtM)" style="mix-blend-mode:multiply">' + five + '</g>';
    head += '<g fill="url(#apxHtY)" style="mix-blend-mode:multiply">' + five + '</g>';
    /* shadowed inner petals pick up cyan and black */
    var inner = '';
    for (var j = 0; j < 5; j++) inner += '<path d="M0,-4 C-5,-7 -7,-13 -4,-17 C-1,-20 1,-20 4,-17 C7,-13 5,-7 0,-4 Z" transform="rotate(' + (j * 72 + 36) + ')"/>';
    head += '<g fill="url(#apxHtC)" style="mix-blend-mode:multiply" opacity="0.85">' + inner + '</g>';
    head += '<g fill="url(#apxHtM)" style="mix-blend-mode:multiply">' + inner + '</g>';
    head += '<circle r="5.6" fill="url(#apxHtK)" style="mix-blend-mode:multiply"/>'
      + '<circle r="5.6" fill="url(#apxHtY)" style="mix-blend-mode:multiply"/>';
    head += '</g>';
    s += head;
    /* stem and leaves: cyan under yellow reads green in print */
    var stem = '<path d="M49,114 C48.5,96 50.5,84 50,72" fill="none" stroke-width="3.2" stroke-linecap="round"/>';
    s += '<g style="mix-blend-mode:multiply" stroke="url(#apxHtC)">' + stem + '</g>';
    s += '<g style="mix-blend-mode:multiply" stroke="url(#apxHtY)">' + stem + '</g>';
    var leaf1 = '<path d="M49,98 C40,96 34,90 33,82 C42,83 47,89 49,94 Z"/>';
    var leaf2 = '<path d="M49.6,86 C58,84 64,78 65,70 C56,71 51,77 49.6,82 Z"/>';
    s += '<g fill="url(#apxHtC)" style="mix-blend-mode:multiply">' + leaf1 + leaf2 + '</g>';
    s += '<g fill="url(#apxHtY)" style="mix-blend-mode:multiply">' + leaf1 + leaf2 + '</g>';
    /* the pressman's furniture: registration marks and a folio note */
    s += '<g stroke="#1c1b1a" stroke-width="0.45" opacity="0.55" fill="none">'
      + '<circle cx="14" cy="16" r="2.4"/><path d="M14,12 V20 M10,16 H18"/>'
      + '<circle cx="86" cy="118" r="2.4"/><path d="M86,114 V122 M82,118 H90"/></g>';
    s += '<text x="20" y="124" font-family="IBM Plex Mono,monospace" font-size="3" fill="#1c1b1a" opacity="0.5">pp. 12–13 · 4/4</text>';
    s += tape(49, 104, -4, 24, 6.2);
    return s + '</svg>';
  }

  /* ------------------------------------------------------- collector marks */
  function markSVG(kind) {
    var open = '<svg class="appdx-mkglyph" viewBox="0 0 14 14" aria-hidden="true">';
    if (kind === 'pixel') {
      return open + '<g fill="none" stroke="#2c5522" stroke-width="1.2" shape-rendering="crispEdges">'
        + '<rect x="2" y="2" width="10" height="10"/></g>'
        + '<rect x="5" y="5" width="4" height="4" fill="#2c5522"/></svg>';
    }
    if (kind === 'chart') {
      return open + '<g fill="none" stroke="#43301b" stroke-width="1">'
        + '<circle cx="7" cy="7" r="5.2"/><path d="M7,1.8 L7,4 M7,7 L10.4,3.6 M7,7 L5,9.6"/></g></svg>';
    }
    if (kind === 'deep') {
      return open + '<g fill="none" stroke="#16303a" stroke-width="1.2">'
        + '<circle cx="6" cy="8" r="4"/><circle cx="10.6" cy="4" r="1.6"/></g></svg>';
    }
    if (kind === 'dusk') {
      return open + '<path d="M7,2 L12.4,11.4 L1.6,11.4 Z" fill="none" stroke="#4c5290" stroke-width="1.2"/>'
        + '<path d="M7,6 L9.6,10.4 L4.4,10.4 Z" fill="#de7742"/></svg>';
    }
    if (kind === 'light') {
      return open + '<g fill="none" stroke="#2e3c4c" stroke-width="1">'
        + '<path d="M2,10 A6.4,6.4 0 0 1 12,10"/><path d="M4.4,10 A3.4,3.4 0 0 1 9.6,10"/></g>'
        + '<circle cx="7" cy="10.6" r="1.3" fill="#2e3c4c"/></svg>';
    }
    /* cmyk */
    return open + '<circle cx="5" cy="5" r="2.5" fill="#0f9bd7" opacity="0.85"/>'
      + '<circle cx="9" cy="5" r="2.5" fill="#e0347c" opacity="0.8"/>'
      + '<circle cx="7" cy="8.6" r="2.5" fill="#f2c400" opacity="0.85"/>'
      + '<circle cx="7" cy="6.2" r="1" fill="#1c1b1a"/></svg>';
  }

  /* ============================================================= the six */
  var SPECIMENS = [
    {
      key: 'pixelcity', href: '../pixelcity/', fig: figPixel, mark: 'pixel', rot: -0.6,
      name: 'Folium octobitum',
      note: 'Median planter, Docs Boulevard; grows one tile a season and never antialiases.',
      leg: 'leg. the Parks Dept., P.D. City',
      hint: 'On loan from the tile beds of Pixel Docs City · press the specimen to follow it home.',
      aria: 'Folium octobitum, a pixel leaf on loan from Pixel Docs City. Press to follow it home.'
    },
    {
      key: 'cartastrapiana', href: '../cartastrapiana/', fig: figHeather, mark: 'chart', rot: 0.5,
      name: 'Erica cartographica',
      note: 'Taken on the shoal the chart marks HERE THE DOCS RUN SHALLOW; flowers at low water.',
      leg: 'leg. the Chartmaker’s boat',
      hint: 'On loan from the chart-room of Carta Strapiana · press the specimen to follow it home.',
      aria: 'Erica cartographica, a sprig of sea-heather engraved in iron-gall, on loan from Carta Strapiana. Press to follow it home.'
    },
    {
      key: 'bythedeep', href: '../bythedeep/', fig: figKelp, mark: 'deep', rot: -0.4,
      name: 'Laminaria buffa',
      note: 'Netted below panel three; refused to stop waving, and was pressed as it is.',
      leg: 'leg. the deckhand, B.t.Deep',
      hint: 'On loan from the waters of By the Deep · press the specimen to follow it home.',
      aria: 'Laminaria buffa, an inked cartoon kelp on loan from By the Deep. Press to follow it home.'
    },
    {
      key: 'longway', href: '../longway/', fig: figRiso, mark: 'dusk', rot: 0.6,
      name: 'Viatica crepuscula',
      note: 'Mile 41, west switchback; blooms as the light goes. Two inks, honest misregistration.',
      leg: 'leg. the Dusk Works, Long Way',
      hint: 'On loan from the Dusk Works, far down the Long Way · press the specimen to follow it home.',
      aria: 'Viatica crepuscula, a riso-printed trailside flower on loan from the Long Way. Press to follow it home.'
    },
    {
      key: 'firstlight', href: '../firstlight/', fig: figAntenna, mark: 'light', rot: -0.5,
      name: 'Antennaria sideralis',
      note: 'Collected very far from here, at 1420 MHz; the petals resonate at the hydrogen line.',
      leg: 'leg. the night shift, F.L. array',
      hint: 'On loan from the First Light array · press the specimen to follow it home.',
      aria: 'Antennaria sideralis, a flower that reads as an antenna diagram, on loan from First Light. Press to follow it home.'
    },
    {
      key: 'secreta', href: '../secreta/', fig: figHalftone, mark: 'cmyk', rot: 0.4,
      name: 'Rosa quadrichroma',
      note: 'Taken between pages twelve and thirteen; off register, as all true stories are.',
      leg: 'leg. the colourist · name withheld',
      hint: 'On loan from a printing-house that asks not to be named · press the specimen to follow it home.',
      aria: 'Rosa quadrichroma, a four-colour halftone flower from an unnamed printing-house. Press to follow it home.'
    }
  ];

  /* ============================================================ the sheet */

  function sealSVG() {
    return '<svg viewBox="0 0 120 54" aria-hidden="true">'
      + '<g fill="none" stroke="currentColor">'
      + '<rect x="3" y="3" width="114" height="48" rx="9" stroke-width="2.4"/>'
      + '<rect x="8" y="8" width="104" height="38" rx="6" stroke-width="0.9"/></g>'
      + '<text x="60" y="27" text-anchor="middle" font-family="Courier Prime,monospace" font-size="12.5" letter-spacing="2.2" fill="currentColor">OUT ON LOAN</text>'
      + '<text x="60" y="40" text-anchor="middle" font-family="Courier Prime,monospace" font-size="7.4" letter-spacing="1.7" fill="currentColor">RETURNED TO ORIGIN</text>'
      + '</svg>';
  }

  function specimenHTML(sp) {
    return '<a class="appdx-sp" href="' + sp.href + '" data-w="' + sp.key + '" aria-label="' + sp.aria + '" style="--srot:' + sp.rot + 'deg">'
      + '<span class="appdx-fig">' + sp.fig() + '</span>'
      + '<span class="appdx-lbl">'
      + '<em>' + sp.name + '</em>'
      + '<span class="nt">' + sp.note + '</span>'
      + '<span class="mk">' + markSVG(sp.mark) + '<span>' + sp.leg + '</span></span>'
      + '<span class="appdx-hint" aria-hidden="true">' + sp.hint + '</span>'
      + '</span>'
      + '<span class="appdx-seal" aria-hidden="true">' + sealSVG() + '</span>'
      + '</a>';
  }

  function mainLabelHTML() {
    return '<div class="label appdx-mainlabel" style="--lrot:-0.4deg">'
      + '<h3>Herbarium of the Strapi Documentation</h3>'
      + '<div class="fam">Appendix · Exchange collections</div>'
      + '<div class="bino">Specimens gathered abroad <span class="auth">ex herb. var.</span></div>'
      + '<div class="rule"></div>'
      + '<dl>'
      + '<dt>Coll.</dt><dd>six sister collections, one specimen each</dd>'
      + '<dt>Date</dt><dd>various seasons, exchanged in kind</dd>'
      + '<dt>Loc.</dt><dd>beyond this cabinet, each its own country</dd>'
      + '<dt>Det.</dt><dd>one plate; nothing else was added</dd>'
      + '</dl>'
      + '<div class="rule"></div>'
      + '<div class="foot">Held under the exchange rule. The glass reads a borrowed specimen as it reads any sheet.<br>What is lent may be recalled.</div>'
      + '</div>';
  }

  function sheetHTML() {
    var h = '<section class="appdx" id="appdx" aria-label="Appendix plate: specimens gathered abroad">';
    h += '<div class="appdx-divider" aria-hidden="true"><span></span><b>Appendix</b><span></span></div>';
    h += '<p class="appdx-lede">After the last drawer, one plate more: six specimens received in exchange from the sister collections.</p>';
    h += '<div class="sheet appdx-sheet" id="appdxSheet">';
    h += '<div class="rule-frame"></div>';
    h += '<div class="stamp" style="transform:rotate(-8deg)">' + (typeof stampSVG === 'function' ? stampSVG('apx-seal') : '') + '</div>';
    h += '<div class="acc">ACC. STR‑APP‑I</div>';
    h += '<div class="fieldno">Field no. EXCH‑006 · exchange herbarium · six loans</div>';
    h += '<header class="appdx-head">'
      + '<h2>Specimens gathered abroad</h2>'
      + '<p>Appendix I · six loans from the sister collections</p>'
      + '</header>';
    h += '<div class="appdx-grid">';
    for (var i = 0; i < SPECIMENS.length; i++) h += specimenHTML(SPECIMENS[i]);
    h += '</div>';
    h += mainLabelHTML();
    h += '</div>';
    h += '<div class="appdx-tools" aria-hidden="true">hover the sheet to magnify · the glass reads a loan as it reads any sheet</div>';
    h += '</section>';
    return h;
  }

  /* ============================================================ the styles */
  var CSS = ''
    + '.appdx{margin:4.5rem auto 1rem;max-width:1180px}'
    + '.appdx-divider{display:flex;align-items:center;gap:1rem;max-width:660px;margin:0 auto 1rem}'
    + '.appdx-divider span{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(201,165,94,.4));}'
    + '.appdx-divider span:last-child{background:linear-gradient(90deg,rgba(201,165,94,.4),transparent)}'
    + '.appdx-divider b{font-family:"Courier Prime",monospace;font-weight:400;font-size:.66rem;letter-spacing:.34em;text-transform:uppercase;color:#94815e}'
    + '.appdx-lede{max-width:660px;margin:0 auto 1.4rem;text-align:center;font-family:"EB Garamond",serif;font-style:italic;font-size:.95rem;line-height:1.6;color:#b6a483}'
    + '.appdx-sheet{width:min(660px,100%);margin:0 auto;aspect-ratio:var(--sheet-ratio);container-type:inline-size;position:relative}'
    + '.appdx-head{position:absolute;left:16cqi;right:16cqi;top:5.6cqi;text-align:center}'
    + '.appdx-head h2{margin:0;font-family:"Cormorant Garamond",serif;font-weight:600;font-size:3.1cqi;letter-spacing:.22em;text-transform:uppercase;color:#4a3c28}'
    + '.appdx-head p{margin:.7cqi 0 0;font-family:"Courier Prime",monospace;font-size:1.35cqi;letter-spacing:.16em;color:#8c7a5c}'
    + '.appdx-head::after{content:"";display:block;width:34cqi;height:1px;background:#cfbf9d;margin:1.5cqi auto 0}'
    + '.appdx-grid{position:absolute;left:6.5cqi;right:6.5cqi;top:17.5cqi;bottom:47cqi;display:grid;'
    + 'grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,minmax(0,1fr));gap:3cqi 2cqi}'
    + '.appdx-sp{position:relative;display:flex;flex-direction:column;align-items:center;gap:.7cqi;'
    + 'text-decoration:none;color:inherit;cursor:pointer;min-width:0}'
    + '.appdx-fig{width:100%;height:20.5cqi;display:block;transition:transform .28s var(--ease,ease)}'
    + '.appdx-fig svg{width:100%;height:100%;display:block;overflow:visible}'
    + '.appdx-sp:hover .appdx-fig,.appdx-sp:focus-visible .appdx-fig{transform:translateY(-.4cqi)}'
    + '.appdx-lbl{display:block;position:relative;width:92%;background:linear-gradient(180deg,#fbf6ea,#f2e9d5);border:1px solid #b9a681;'
    + 'padding:.7cqi .95cqi .75cqi;box-shadow:0 .3cqi 1cqi rgba(70,52,26,.22),inset 0 0 0 1px rgba(255,255,255,.6);'
    + 'font-family:"Courier Prime",monospace;font-size:1.16cqi;line-height:1.45;color:#3a3025;transform:rotate(var(--srot,-.4deg))}'
    + '.appdx-lbl em{display:block;font-family:"Cormorant Garamond",serif;font-style:italic;font-size:1.95cqi;line-height:1.12;color:#241c12}'
    + '.appdx-lbl .nt{display:block;margin-top:.35cqi}'
    + '.appdx-lbl .mk{display:flex;align-items:center;gap:.6cqi;margin-top:.5cqi;padding-top:.45cqi;'
    + 'border-top:1px solid #cfbf9d;color:#6b5b3f;font-size:1.06cqi;letter-spacing:.03em}'
    + '.appdx-mkglyph{width:1.9cqi;height:1.9cqi;flex:none;display:block}'
    + '.appdx-hint{position:absolute;left:50%;top:calc(100% + .45cqi);transform:translateX(-50%);'
    + 'width:122%;text-align:center;font-family:"EB Garamond",serif;font-style:italic;font-size:1.42cqi;'
    + 'color:#6d5b3a;opacity:0;transition:opacity .25s;pointer-events:none;z-index:4}'
    + '.appdx-sp:hover .appdx-hint,.appdx-sp:focus-visible .appdx-hint{opacity:1}'
    + '.appdx-sp:focus-visible{outline:1px dotted var(--brass,#c9a55e);outline-offset:4px}'
    + '.appdx-seal{position:absolute;left:50%;top:6cqi;width:21cqi;margin-left:-10.5cqi;opacity:0;'
    + 'pointer-events:none;color:var(--violet-ink,#4c356c);z-index:5}'
    + '.appdx-seal svg{width:100%;height:auto;display:block}'
    + '.appdx-sp.appdx-crossing .appdx-seal{animation:appdxThump .32s cubic-bezier(.2,.9,.3,1.35) forwards}'
    + '.appdx-sp.appdx-crossing .appdx-fig{transform:scale(.985)}'
    + '.appdx-sheet.appdx-lending .appdx-sp:not(.appdx-crossing){transition:opacity .5s;opacity:.5}'
    + '@keyframes appdxThump{0%{opacity:0;transform:scale(1.75) rotate(-2deg)}'
    + '62%{opacity:.95;transform:scale(.94) rotate(-7deg)}100%{opacity:.88;transform:scale(1) rotate(-7deg)}}'
    + '.appdx-mainlabel{position:absolute;left:0;right:0;bottom:6.5cqi;width:54cqi;margin:0 auto}'
    + '.appdx-tools{max-width:660px;margin:.95rem auto 0;text-align:center;font-family:"Courier Prime",monospace;'
    + 'font-size:.72rem;letter-spacing:.13em;text-transform:uppercase;color:#6f5f43}'
    /* the one living specimen, and only while the plate is on the table */
    + '.appdx-kelp-sway,.appdx-kelp-sway2,.appdx-kelp-sway3{transform-box:fill-box}'
    + '.appdx-live .appdx-kelp-sway{transform-origin:50% 100%;animation:appdxSway 5.2s ease-in-out infinite alternate}'
    + '.appdx-live .appdx-kelp-sway2{transform-origin:50% 92%;animation:appdxSway2 4.1s ease-in-out -1.3s infinite alternate}'
    + '.appdx-live .appdx-kelp-sway3{transform-origin:100% 60%;animation:appdxSway3 3.4s ease-in-out -0.7s infinite alternate}'
    + '@keyframes appdxSway{from{transform:rotate(-1.5deg)}to{transform:rotate(1.7deg)}}'
    + '@keyframes appdxSway2{from{transform:skewX(-1.3deg)}to{transform:skewX(1.5deg)}}'
    + '@keyframes appdxSway3{from{transform:rotate(1.6deg)}to{transform:rotate(-1.4deg)}}'
    + '@media (max-width:1080px),(pointer:coarse){.appdx-tools{display:none}}'
    + '@media (max-width:620px){'
    + '.appdx-sheet{aspect-ratio:auto;padding:4cqi 3cqi 3cqi}'
    + '.appdx-head{position:static;margin:11cqi auto 0}'
    + '.appdx-head h2{font-size:4.6cqi}.appdx-head p{font-size:2.4cqi}'
    + '.appdx-grid{position:static;grid-template-columns:1fr 1fr;grid-template-rows:auto;gap:6cqi 3cqi;margin:7cqi 1cqi 4cqi}'
    + '.appdx-fig{height:36cqi}'
    + '.appdx-lbl{font-size:2.2cqi}.appdx-lbl em{font-size:3.4cqi}.appdx-lbl .mk{font-size:2cqi}'
    + '.appdx-mkglyph{width:3.2cqi;height:3.2cqi}'
    + '.appdx-hint{font-size:2.6cqi;width:118%}'
    + '.appdx-seal{width:34cqi;margin-left:-17cqi;top:10cqi}'
    + '.appdx-mainlabel{position:static;width:auto;margin:1rem;transform:none}'
    + '}'
    /* the loan slip: the crossing is confirmed before it plays */
    + '.appdx-veil{position:fixed;inset:0;z-index:220;background:rgba(24,18,8,.52);'
    + 'display:grid;place-items:center;padding:1rem}'
    + '.appdx-slip{width:min(400px,94vw);background:linear-gradient(180deg,#fbf6ea,#f1e7d2);'
    + 'border:1px solid #b9a681;box-shadow:0 18px 50px rgba(0,0,0,.5),inset 0 0 0 1px rgba(255,255,255,.6);'
    + 'padding:1.1rem 1.3rem 1rem;transform:rotate(-1.2deg);text-align:center;'
    + 'font-family:"Courier Prime",monospace;color:#3a3025}'
    + '.appdx-slip-head{font-size:.62rem;letter-spacing:.3em;text-transform:uppercase;'
    + 'color:var(--violet-ink,#4c356c);padding-bottom:.55rem;border-bottom:1px solid #cfbf9d;margin-bottom:.7rem}'
    + '.appdx-slip-name{display:block;font-family:"Cormorant Garamond",serif;font-style:italic;'
    + 'font-weight:600;font-size:1.35rem;line-height:1.15;color:#241c12;margin-bottom:.4rem}'
    + '.appdx-slip-q{margin:0 auto .9rem;max-width:30ch;font-size:.86rem;line-height:1.55}'
    + '.appdx-slip-btns{display:flex;gap:.7rem;justify-content:center}'
    + '.appdx-slip-btn{flex:0 1 9.5rem;border:1px solid #a08a5f;background:linear-gradient(180deg,#f7efdd,#eee2c8);'
    + 'font-family:"Courier Prime",monospace;font-size:.95rem;letter-spacing:.18em;color:#241c12;'
    + 'padding:.5rem .4rem .45rem;cursor:pointer;box-shadow:0 2px 6px rgba(70,52,26,.25)}'
    + '.appdx-slip-btn small{display:block;font-size:.56rem;letter-spacing:.12em;text-transform:uppercase;'
    + 'color:#6b5b3f;margin-top:.2rem}'
    + '.appdx-slip-btn[data-slip="yes"]{border-color:var(--violet-ink,#4c356c);color:var(--violet-ink,#4c356c)}'
    + '.appdx-slip-btn[data-slip="yes"] small{color:var(--violet,#63478a)}'
    + '.appdx-slip-btn:hover{background:linear-gradient(180deg,#fdf7e8,#f3e9d1)}'
    + '.appdx-slip-btn:focus-visible{outline:2px dotted var(--brass,#c9a55e);outline-offset:3px}'
    + '.appdx-slip-keys{margin-top:.75rem;font-size:.56rem;letter-spacing:.26em;color:#94815e}'
    + '@media (prefers-reduced-motion:no-preference){'
    + '.appdx-veil{animation:appdxVeilIn .18s ease-out}'
    + '.appdx-slip{animation:appdxSlipIn .24s cubic-bezier(.2,.9,.3,1.15)}'
    + '}'
    + '@keyframes appdxVeilIn{from{opacity:0}}'
    + '@keyframes appdxSlipIn{from{opacity:0;transform:translateY(-16px) rotate(-3deg)}}'
    /* the START HERE bookmark ribbon, worn once per session by the Quick Start sheet */
    + '.appdx-start .appdx-ribbon{position:absolute;left:8%;top:-5px;width:1.15rem;height:48%;z-index:3;'
    + 'background:linear-gradient(180deg,#93392c,#7c2e23 70%,#6f2920);'
    + 'clip-path:polygon(0 0,100% 0,100% 100%,50% calc(100% - .55rem),0 100%);'
    + 'box-shadow:0 3px 7px rgba(0,0,0,.4),inset 0 0 0 1px rgba(255,255,255,.1);'
    + 'display:flex;justify-content:center;pointer-events:none}'
    + '.appdx-start .appdx-ribbon b{writing-mode:vertical-rl;font-family:"Courier Prime",monospace;'
    + 'font-weight:700;font-size:.54rem;letter-spacing:.3em;text-transform:uppercase;'
    + 'color:#f6eedd;margin-top:.6rem}';

  /* ============================================================ mechanics */

  var FIGS_HTML = null;

  function ensureStyle() {
    if (document.getElementById('appdxStyle')) return;
    var st = document.createElement('style');
    st.id = 'appdxStyle';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function isAllTray() {
    if (typeof parseHash !== 'function' || typeof SPECIALS === 'undefined') return false;
    var route = parseHash();
    if (route.kind !== 'special') return false;
    return (SPECIALS[route.id] ? route.id : 'all') === 'all';
  }

  /* ------------------------------------------------- the loan slip dialog
     Owner's law: activating a crossing first raises an in-idiom confirmation.
     A small slip in the herbarium hand; YES and NO; mouse and keyboard alike
     (Tab focuses, Enter activates the focused control, Y confirms, N or
     Escape keeps the specimen filed). Cancelling returns cleanly to the
     moment before. Reduced motion gets the same slip, unanimated. */
  var SLIP_OPEN = false;

  function slipHTML(name) {
    return '<div class="appdx-veil" id="appdxVeil">'
      + '<div class="appdx-slip" role="dialog" aria-modal="true"'
      + ' aria-labelledby="appdxSlipName" aria-describedby="appdxSlipQ">'
      + '<div class="appdx-slip-head">Loan desk \u00b7 recall of loan</div>'
      + '<em class="appdx-slip-name" id="appdxSlipName">' + name + '</em>'
      + '<p class="appdx-slip-q" id="appdxSlipQ">This specimen returns to its origin \u2013 '
      + 'another world entirely. Follow it?</p>'
      + '<div class="appdx-slip-btns">'
      + '<button type="button" class="appdx-slip-btn" data-slip="yes">YES<small>follow it home</small></button>'
      + '<button type="button" class="appdx-slip-btn" data-slip="no">NO<small>keep it filed</small></button>'
      + '</div>'
      + '<div class="appdx-slip-keys" aria-hidden="true">Y yes \u00b7 N no \u00b7 Esc keeps it filed</div>'
      + '</div></div>';
  }

  function openSlip(name, anchor, onYes) {
    if (SLIP_OPEN) return;
    SLIP_OPEN = true;
    if (typeof hideLens === 'function') { try { hideLens(); } catch (e) { /* no glass, no matter */ } }
    document.body.insertAdjacentHTML('beforeend', slipHTML(name));
    var veil = document.getElementById('appdxVeil');
    var yes = veil.querySelector('[data-slip="yes"]');
    var no = veil.querySelector('[data-slip="no"]');

    function close(confirmed) {
      SLIP_OPEN = false;
      window.removeEventListener('keydown', onKey, true);
      if (veil.parentNode) veil.parentNode.removeChild(veil);
      if (confirmed) { onYes(); return; }
      if (anchor && anchor.focus) { try { anchor.focus(); } catch (e) { /* focus is a courtesy */ } }
    }

    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return; /* browser chords pass through */
      e.stopPropagation();                            /* the cabinet's own keys wait */
      var k = e.key;
      if (k === 'Tab') {
        e.preventDefault();
        (document.activeElement === yes ? no : yes).focus();
      } else if (k === 'Escape' || k === 'n' || k === 'N') {
        e.preventDefault();
        close(false);
      } else if (k === 'y' || k === 'Y') {
        e.preventDefault();
        close(true);
      } else if (k === 'Enter') {
        e.preventDefault();
        if (document.activeElement === no) close(false);
        else if (document.activeElement === yes) close(true);
        else yes.focus();
      }
    }

    veil.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-slip="yes"]')) { close(true); return; }
      if (e.target.closest && e.target.closest('[data-slip="no"]')) { close(false); return; }
      if (e.target === veil) close(false); /* a click on the desk, not the slip */
    });
    window.addEventListener('keydown', onKey, true);
    yes.focus();
  }

  function wireSheet(root) {
    var sheet = root.querySelector('#appdxSheet');
    if (!sheet) return;

    /* the same glass, over the same kind of sheet */
    if (typeof attachLens === 'function') attachLens(sheet);

    /* the kelp lives only while the plate is actually on the table */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].target !== sheet) continue;
          if (entries[i].isIntersecting) sheet.classList.add('appdx-live');
          else sheet.classList.remove('appdx-live');
        }
      }, { rootMargin: '90px 0px' });
      io.observe(sheet);
    } else {
      sheet.classList.add('appdx-live');
    }

    /* crossing: a loan recalled - but the slip is signed first */
    root.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('.appdx-sp') : null;
      if (!a) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; /* the browser knows best */
      e.preventDefault();
      if (sheet.dataset.crossing || SLIP_OPEN) return;
      var href = a.getAttribute('href');
      var sp = null;
      for (var i = 0; i < SPECIMENS.length; i++) {
        if (SPECIMENS[i].key === a.dataset.w) { sp = SPECIMENS[i]; break; }
      }
      openSlip(sp ? sp.name : 'A borrowed specimen', a, function () {
        if (reduced()) { location.href = href; return; } /* signed: cross without the beat */
        sheet.dataset.crossing = '1';
        a.classList.add('appdx-crossing');
        sheet.classList.add('appdx-lending');
        setTimeout(function () { location.href = href; }, CROSS_MS);
      });
    });
  }

  function place() {
    try {
      if (!isAllTray()) return;
      var sc = document.getElementById('scroll');
      if (!sc || sc.querySelector('#appdx')) return;
      /* the tray for ~all must already be on the table (guards the ordering
         where our listener could ever run before the cabinet's own render) */
      if (!sc.querySelector('.tray')) return;
      ensureStyle();
      if (FIGS_HTML === null) FIGS_HTML = sheetHTML();   /* drawn once, filed forever */
      sc.insertAdjacentHTML('beforeend', FIGS_HTML);
      wireSheet(sc.querySelector('#appdx'));
    } catch (err) {
      /* an appendix must never cost the collection anything */
    }
  }

  function quickStartGesture() {
    if (!QS_GESTURE) return;
    QS_GESTURE = false; /* one opening, one gesture */
    try {
      if (!isAllTray()) return;
      var tray = document.querySelector('#scroll .tray');
      if (!tray) return;
      var card = tray.querySelector('.card[data-slug="' + QS_SLUG + '"]');
      if (!card) return;
      ensureStyle();
      if (tray.firstElementChild !== card) tray.insertBefore(card, tray.firstElementChild);
      card.classList.add('appdx-start');
      card.insertAdjacentHTML('beforeend', '<span class="appdx-ribbon"><b>Start here</b></span>');
    } catch (err) {
      /* the invitation must never cost the collection anything */
    }
  }

  (function waitForCabinet(tries) {
    if (window.__HERB_READY__ === true) {
      place();
      quickStartGesture();
      window.addEventListener('hashchange', function () { setTimeout(place, 0); });
      return;
    }
    if (tries > 1500) return; /* the cabinet never opened; add nothing */
    setTimeout(function () { waitForCabinet(tries + 1); }, 40);
  })(0);
})();

/* a browser restoring this page from bfcache after a crossing would keep the
   stale loan flag and leave the specimens inert - reset on restore. The seal
   stays mounted (its classes are lifted instead), so a restored plate can be
   stamped again; any slip left open is taken off the desk. */
window.addEventListener('pageshow',function(e){
  if(!e.persisted)return;
  document.querySelectorAll('[data-crossing]').forEach(function(n){delete n.dataset.crossing;});
  document.querySelectorAll('.appdx-crossing').forEach(function(n){n.classList.remove('appdx-crossing');});
  document.querySelectorAll('.appdx-lending').forEach(function(n){n.classList.remove('appdx-lending');});
  document.querySelectorAll('.appdx-veil').forEach(function(n){n.remove();});
});
