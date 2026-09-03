(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = function () { return RM.matches; };
  var PI = Math.PI, cos = Math.cos, sin = Math.sin, sqrt = Math.sqrt, abs = Math.abs;
  var TAU = PI * 2;

  /* ------------------------------------------------------------ utils */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var attr = esc;
  function nfmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pad3(n) { return ('00' + n).slice(-3); }
  function stripTags(h) {
    return String(h || '').replace(/<[^>]*>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  var SITE_SUFFIX = /\s*[-|]\s*Strapi\s+(Developer\s+)?(Docs|Documentation)\s*$/i;
  function title(p) { return p.title.replace(SITE_SUFFIX, ''); }

  /* deterministic per-slug jitter, so the city is varied but never random */
  function hash32(s) {
    var h = 2166136261, i;
    for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h >>> 0;
  }
  function rnd01(h, k) { var x = (h ^ (k * 2654435761)) >>> 0; x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }

  /* colour */
  function hx(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function lit(c, f) { return [clamp(c[0] * f, 0, 255), clamp(c[1] * f, 0, 255), clamp(c[2] * f, 0, 255)]; }
  function rgbs(c) { return 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')'; }
  function rgbas(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')'; }

  /* Inline <img> inside html fields: local files are served beside us and are
     shown for real; anything remote is named, never fetched. */
  var IMG_RE = /<img\b[^>]*>/gi;
  var SRC_RE = /src\s*=\s*("([^"]*)"|'([^']*)')/i;
  var ALT_RE = /alt\s*=\s*("([^"]*)"|'([^']*)')/i;
  function fixHtml(h) {
    if (!h) return '';
    if (h.indexOf('<img') < 0) return h;
    return h.replace(IMG_RE, function (m) {
      var sm = SRC_RE.exec(m), am = ALT_RE.exec(m);
      var src = sm ? (sm[2] != null ? sm[2] : sm[3]) : '';
      var alt = (am ? (am[2] != null ? am[2] : am[3]) : '') || 'image';
      if (src && src.charAt(0) === '/') {
        return '<img src="' + attr(src) + '" alt="' + attr(alt) + '" loading="lazy" decoding="async" class="ii">';
      }
      return '<span class="imgx">' + esc(alt) + '</span>';
    });
  }
