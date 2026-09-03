/* ============================================================================
   HERBARIUM OF THE STRAPI DOCUMENTATION
   290 documentation pages, pressed and mounted as botanical specimens.
   Every measurement on every sheet is read from content.json, graph.json,
   communities.json and provenance.json. Nothing here is invented.

   String Seed of Thought
   B4VT4cdhzGZ30hUasvm7SbNTfMtUFPoa8Uf3TCCGCh7nu1XwOE0x4N4nnbADdmAKIcI29mmvFPdtwiwrCVlSVpzZUQ5BBt6i
   digit-sum 67 · vowels 16 · the run "nnbADdmAKIcI" is a phyllotaxis stutter
   ============================================================================ */
'use strict';

/* ---------------------------------------------------------------- 0. seed */

var SEED = 'B4VT4cdhzGZ30hUasvm7SbNTfMtUFPoa8Uf3TCCGCh7nu1XwOE0x4N4nnbADdmAKIcI29mmvFPdtwiwrCVlSVpzZUQ5BBt6i';
var DIGIT_SUM = 67;
var VOWELS = 16;

/* the divergence angle of the collection: the golden angle, nudged by the seed */
var PHYLLO = 137.5 + (DIGIT_SUM % 7) / 10;          /* 137.9 degrees */
/* the stutter: where the run reads uppercase, a node skips its turn */
var STUTTER_RUN = 'nnbADdmAKIcI';
var STUTTER_MASK = STUTTER_RUN.split('').map(function (c) { return c >= 'A' && c <= 'Z' ? 1 : 0; });
var STUTTER_DEG = VOWELS + DIGIT_SUM / 10;          /* 22.7 degrees */
/* the hand-coloured plate misregistration: wash printed a hair off the ink */
var MISREG = { x: (DIGIT_SUM % 5) * 0.42 + 0.6, y: -(VOWELS % 4) * 0.34 - 0.5 };
var STAMP_ROT = -(DIGIT_SUM / 10);                  /* -6.7 degrees */

function fnv(s) {
  var h = 0x811c9dc5 >>> 0;
  for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rngFor(key) { return mulberry32(fnv(SEED + '::' + key)); }

/* seeded shuffle, used to hand out washes and leaf morphologies to families */
function seededShuffle(arr, key) {
  var r = rngFor(key), a = arr.slice(), i, j, t;
  for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

/* ------------------------------------------------------- 1. small helpers */

var $ = function (s, r) { return (r || document).querySelector(s); };
function prefersStill() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function attr(s) { return esc(s); }
function n2(v) { return v.toFixed(2); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function norm(v, lo, hi) { return clamp((v - lo) / (hi - lo), 0, 1); }

var DAYNAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var SMALL = ['no','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve'];
function weekday(iso){ return DAYNAMES[new Date(iso + 'T12:00:00Z').getUTCDay()]; }
function cap(n){ return n <= 12 ? SMALL[n] : String(n); }
var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
function prettyDate(iso) {
  if (!iso) return '';
  var p = iso.split('-');
  return parseInt(p[2], 10) + ' ' + MONTHS[parseInt(p[1], 10) - 1] + ' ' + p[0];
}
function shortDate(iso) {
  if (!iso) return '';
  var p = iso.split('-');
  return p[2] + '.' + p[1] + '.' + p[0];
}
function days(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 86400000); }
function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }

/* ------------------------------------------------------- 2. the state box */

var D = { content: null, graph: null, com: null, prov: null };
var IDX = {
  pages: [],          /* in filing order */
  bySlug: {},
  inbound: {},        /* slug -> [slug] */
  outbound: {},
  community: {},      /* slug -> community index */
  drawers: [],
  drawerById: {},
  accession: {},      /* slug -> filing number */
  hands: [],          /* [name, pagesTended] sorted */
  totals: {}
};
var SPEC = new Map();  /* slug -> grown specimen, memoised */
var state = { route: null, slug: null, ctx: null, ctxList: [], filter: null, q: '' };

/* ============================================================================
   3. LATIN — a binomial for every sheet, derived from its own slug
   ========================================================================== */

var GENUS_SUFFIX = ['a', 'ia', 'um', 'us', 'ella', 'opsis', 'anthus', 'carpa', 'ora', 'ina'];
var EPITHET_SUFFIX = ['ensis', 'oides', 'ifolia', 'ata', 'osa', 'ina', 'icum', 'ella', 'flora', 'fera', 'estris', 'ulata'];
var LATIN_FIX = {
  api: 'Apium', rest: 'Restia', cms: 'Cemesa', cloud: 'Nubila', graphql: 'Graphila',
  intro: 'Prooemium', features: 'Facultas', configurations: 'Ordinatio', migration: 'Migratio',
  plugins: 'Plicula', typescript: 'Scriptura', upgrades: 'Ascensio', admin: 'Administra'
};

function latinise(word, suffixes, r) {
  var base = String(word || 'planta').replace(/[^a-z0-9]+/gi, ' ').trim().split(' ')
    .map(function (w) { return w.replace(/[^a-z]/gi, ''); }).filter(Boolean).join('');
  if (!base) base = 'planta';
  base = base.toLowerCase();
  /* trim a trailing vowel so the ending grafts cleanly, the way a botanist would */
  var stem = base.replace(/(a|e|i|o|u|y)+$/, '');
  if (stem.length < 3) stem = base;
  if (stem.length > 11) stem = stem.slice(0, 11);
  var pick = Math.floor(r() * suffixes.length);
  for (var k = 0; k < suffixes.length; k++) {
    var suf = suffixes[(pick + k) % suffixes.length];
    var st = stem;
    if (st.slice(-1) === suf.charAt(0)) st = st.slice(0, -1);
    var word = st + suf;
    if (!/(.{2,3})\1/.test(word)) return word;      /* no stuttered syllable at the graft */
  }
  return stem + suffixes[pick];
}
function initials(name) {
  if (!name) return '';
  var parts = String(name).split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 3).replace(/^./, function (c) { return c.toUpperCase(); }) + '.';
  return parts.map(function (p) { return p.charAt(0).toUpperCase(); }).join('.') + '.';
}
function binomialFor(slug) {
  var r = rngFor('latin' + slug);
  var seg = slug.split('/').filter(Boolean);
  var last = seg[seg.length - 1] || 'planta';
  var parent = seg.length > 1 ? seg[seg.length - 2] : seg[0];
  var genus;
  if (LATIN_FIX[parent]) genus = LATIN_FIX[parent];
  else {
    genus = latinise(parent, GENUS_SUFFIX, r);
    genus = genus.charAt(0).toUpperCase() + genus.slice(1);
  }
  var species = latinise(last, EPITHET_SUFFIX, r);
  if (species === genus.toLowerCase()) species = species + 'lis';
  return { genus: genus, species: species, full: genus + ' ' + species };
}

/* ============================================================================
   4. THE PALETTES — handed out to the 18 families by the seed
   ========================================================================== */

var WASHES = [
  { n: 'sap green', ink: '#3d4a26', wash: '#7d9a52' },
  { n: 'terre verte', ink: '#39452f', wash: '#849a72' },
  { n: 'olive', ink: '#474526', wash: '#9a9a4e' },
  { n: 'moss', ink: '#2f3f2a', wash: '#6d8a5b' },
  { n: 'sea green', ink: '#2f4340', wash: '#6f9a8c' },
  { n: 'laurel', ink: '#28402c', wash: '#5c8460' },
  { n: 'ochre', ink: '#5a4520', wash: '#bd9a49' },
  { n: 'burnt sienna', ink: '#583020', wash: '#b0714a' },
  { n: 'raw umber', ink: '#4a3a24', wash: '#9a7a4e' },
  { n: 'madder', ink: '#57231f', wash: '#b05a52' },
  { n: 'old rose', ink: '#553038', wash: '#b8828b' },
  { n: 'lavender', ink: '#3f3550', wash: '#9a8cbd' },
  { n: 'indigo', ink: '#24334a', wash: '#5f7aa0' },
  { n: 'slate blue', ink: '#2f3d49', wash: '#7a90a6' },
  { n: 'verdigris', ink: '#22403f', wash: '#589090' },
  { n: 'plum', ink: '#3f2a3d', wash: '#8a6488' },
  { n: 'bronze', ink: '#4a3d1e', wash: '#a08a45' },
  { n: 'celadon', ink: '#3a4432', wash: '#a2b78c' }
];

/* 18 leaf morphologies, in the language of a botanical key */
var MORPHS = [
  { n: 'ovate', w: 0.34, skew: 0.78, tip: 0.72, lobe: 0.10, lobes: 1, comp: 0, serr: 0.5, veins: 4 },
  { n: 'lanceolate', w: 0.19, skew: 0.92, tip: 0.95, lobe: 0.04, lobes: 1, comp: 0, serr: 0.3, veins: 5 },
  { n: 'cordate', w: 0.42, skew: 0.66, tip: 0.80, lobe: 0.48, lobes: 1, comp: 0, serr: 0.4, veins: 4 },
  { n: 'obovate', w: 0.33, skew: 1.32, tip: 0.66, lobe: 0.02, lobes: 1, comp: 0, serr: 0.2, veins: 3 },
  { n: 'elliptic', w: 0.30, skew: 1.00, tip: 0.62, lobe: 0.05, lobes: 1, comp: 0, serr: 0.35, veins: 4 },
  { n: 'linear', w: 0.09, skew: 1.00, tip: 0.32, lobe: 0.00, lobes: 1, comp: 0, serr: 0.0, veins: 1 },
  { n: 'reniform', w: 0.52, skew: 1.05, tip: 0.42, lobe: 0.55, lobes: 1, comp: 0, serr: 0.6, veins: 3 },
  { n: 'spatulate', w: 0.26, skew: 1.75, tip: 0.55, lobe: 0.00, lobes: 1, comp: 0, serr: 0.1, veins: 2 },
  { n: 'palmate', w: 0.21, skew: 0.86, tip: 0.85, lobe: 0.06, lobes: 3, comp: 0, serr: 0.55, veins: 3 },
  { n: 'pinnate', w: 0.16, skew: 0.90, tip: 0.80, lobe: 0.02, lobes: 1, comp: 5, serr: 0.3, veins: 2 },
  { n: 'acicular', w: 0.055, skew: 1.00, tip: 0.28, lobe: 0.00, lobes: 1, comp: 0, serr: 0.0, veins: 0 },
  { n: 'sagittate', w: 0.27, skew: 0.62, tip: 0.92, lobe: 0.62, lobes: 1, comp: 0, serr: 0.15, veins: 3 },
  { n: 'orbicular', w: 0.62, skew: 1.00, tip: 0.48, lobe: 0.18, lobes: 1, comp: 0, serr: 0.7, veins: 5 },
  { n: 'rhombic', w: 0.31, skew: 1.00, tip: 1.10, lobe: 0.00, lobes: 1, comp: 0, serr: 0.2, veins: 3 },
  { n: 'oblanceolate', w: 0.17, skew: 1.55, tip: 0.78, lobe: 0.00, lobes: 1, comp: 0, serr: 0.25, veins: 3 },
  { n: 'falcate', w: 0.15, skew: 0.95, tip: 0.90, lobe: 0.02, lobes: 1, comp: 0, serr: 0.1, veins: 3 },
  { n: 'peltate', w: 0.58, skew: 1.00, tip: 0.50, lobe: 0.00, lobes: 1, comp: 0, serr: 0.45, veins: 6 },
  { n: 'deltoid', w: 0.40, skew: 0.50, tip: 1.30, lobe: 0.20, lobes: 1, comp: 0, serr: 0.4, veins: 3 }
];

var FAMILY_STYLE = {};   /* "product|section" -> {wash, morph} */

function buildFamilyStyles(families) {
  var w = seededShuffle(WASHES, 'washes-of-the-cabinet');
  var m = seededShuffle(MORPHS, 'morphologies-of-the-cabinet');
  var hb = seededShuffle(HABITS, 'habits-of-the-cabinet');
  families.forEach(function (f, i) {
    FAMILY_STYLE[f] = { wash: w[i % w.length], morph: m[i % m.length], habit: hb[i % hb.length] };
  });
}

/* Flower colours: one per measured link-community. The hue walks the golden angle
   through the arcs a flower actually occupies — rose to amber, and lilac to violet —
   so a bloom is never mistaken for foliage. */
var BLOOM_ARCS = [[336, 372], [18, 52], [252, 306]];
function communityColour(i) {
  var base = (fnv(SEED + '::bloom') % 1000) / 1000;
  var t = (base + i * 0.6180339887498949) % 1;
  var span = BLOOM_ARCS.reduce(function (a, arc) { return a + (arc[1] - arc[0]); }, 0);
  var u = t * span, arc = BLOOM_ARCS[0];
  for (var k = 0; k < BLOOM_ARCS.length; k++) {
    var wdt = BLOOM_ARCS[k][1] - BLOOM_ARCS[k][0];
    if (u <= wdt) { arc = BLOOM_ARCS[k]; break; }
    u -= wdt;
  }
  var h = (arc[0] + u) % 360;
  var sa = 46 + ((i * 7) % 5) * 6;
  var l = 56 + ((i * 5) % 4) * 5;
  return {
    fill: 'hsl(' + h.toFixed(1) + ',' + sa + '%,' + l + '%)',
    ink: 'hsl(' + h.toFixed(1) + ',' + (sa + 10) + '%,' + (l - 30) + '%)',
    eye: 'hsl(' + ((h + 32) % 360).toFixed(1) + ',62%,' + (l - 18) + '%)'
  };
}

/* ============================================================================
   5. THE GROWTH — every plant is grown from its own page's history
   --------------------------------------------------------------------------
   age (first commit) .... woodiness, height
   careDays .............. growth rings on the trunk, root depth
   commits ............... branching order and density
   words ................. leaf mass
   code blocks ........... seed pods
   inbound citations ..... flowers
   night edits ........... moon-pale flowers
   authors ............... roots
   section ............... leaf morphology and wash (the family)
   community ............. flower colour
   ========================================================================== */

var W = 300, H = 424;                 /* sheet units: 11.5 x 16.5 inches */
var CLOSE = '2026-09-02';             /* the day the collection was closed */

function smooth(pts) {
  if (pts.length < 2) return '';
  var d = 'M' + n2(pts[0][0]) + ',' + n2(pts[0][1]);
  for (var i = 1; i < pts.length - 1; i++) {
    var mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += 'Q' + n2(pts[i][0]) + ',' + n2(pts[i][1]) + ' ' + n2(mx) + ',' + n2(my);
  }
  var L = pts[pts.length - 1];
  d += 'L' + n2(L[0]) + ',' + n2(L[1]);
  return d;
}

/* one lamina, sampled from the morphology's silhouette function */
function lamina(x, y, ang, len, m, samples, serrate, r) {
  var ca = Math.cos(ang), sa = Math.sin(ang);
  var halfW = len * m.w;
  var left = [], right = [], i, t, wt, px, py, off;
  for (i = 0; i <= samples; i++) {
    t = i / samples;
    wt = Math.pow(Math.sin(Math.PI * Math.pow(t, m.skew)), m.tip) * halfW;
    wt += m.lobe * halfW * Math.exp(-9 * t);
    if (serrate && m.serr > 0 && i > 0 && i < samples) {
      wt += Math.sin(t * Math.PI * 7) * halfW * 0.10 * m.serr;
    }
    px = x + ca * len * t; py = y + sa * len * t;
    off = [-sa * wt, ca * wt];
    left.push([px + off[0], py + off[1]]);
    right.push([px - off[0], py - off[1]]);
  }
  right.reverse();
  var d = smooth(left) + smooth(right).replace(/^M/, 'L') + 'Z';
  return { d: d, tip: [x + ca * len, y + sa * len], mid: [x + ca * len * 0.5, y + sa * len * 0.5] };
}

function leafInkFor(x, y, ang, len, m, detail, r) {
  var out = { fill: '', ink: '' };
  var i, k;
  if (m.comp) {                 /* a compound, pinnate leaf: leaflets on a rachis */
    var ca = Math.cos(ang), sa = Math.sin(ang);
    out.ink += 'M' + n2(x) + ',' + n2(y) + 'L' + n2(x + ca * len) + ',' + n2(y + sa * len);
    for (i = 1; i <= m.comp; i++) {
      var t = i / (m.comp + 0.6);
      var bx = x + ca * len * t, by = y + sa * len * t;
      var ll = len * 0.34 * (1 - t * 0.42);
      for (k = -1; k <= 1; k += 2) {
        var la = ang + k * 0.85;
        var lf = lamina(bx, by, la, ll, { w: 0.3, skew: 0.9, tip: 0.8, lobe: 0.02, serr: m.serr }, detail.samples, detail.serr, r);
        out.fill += lf.d; out.ink += lf.d;
      }
    }
    return out;
  }
  var lobes = m.lobes;
  for (i = 0; i < lobes; i++) {
    var a = ang + (i - (lobes - 1) / 2) * 0.62;
    var l = len * (i === (lobes - 1) / 2 ? 1 : 0.78);
    var lf = lamina(x, y, a, l, m, detail.samples, detail.serr, r);
    out.fill += lf.d; out.ink += lf.d;
    /* midrib and secondary venation */
    if (detail.veins && m.veins > 0 && len > 9) {
      out.ink += 'M' + n2(x) + ',' + n2(y) + 'L' + n2(lf.tip[0]) + ',' + n2(lf.tip[1]);
      var ca2 = Math.cos(a), sa2 = Math.sin(a);
      for (k = 1; k <= m.veins; k++) {
        var vt = k / (m.veins + 1);
        var vx = x + ca2 * l * vt, vy = y + sa2 * l * vt;
        var vw = Math.pow(Math.sin(Math.PI * Math.pow(vt, m.skew)), m.tip) * l * m.w * 0.86;
        for (var s = -1; s <= 1; s += 2) {
          var ex = vx - sa2 * vw * s + ca2 * l * 0.10;
          var ey = vy + ca2 * vw * s + sa2 * l * 0.10;
          out.ink += 'M' + n2(vx) + ',' + n2(vy) + 'Q' + n2((vx + ex) / 2 + ca2 * 2) + ',' + n2((vy + ey) / 2 + sa2 * 2) + ' ' + n2(ex) + ',' + n2(ey);
        }
      }
    }
  }
  return out;
}

/* five inflorescences, chosen by the page's measured link-community */
function flowerAt(x, y, size, kind, r) {
  var o = { fill: '', ink: '' }, i, a, px, py;
  if (kind === 0) {                                   /* rosette, 5 petals */
    for (i = 0; i < 5; i++) {
      a = (i / 5) * Math.PI * 2 + r() * 0.2;
      var lf = lamina(x, y, a, size, { w: 0.46, skew: 1.0, tip: 0.62, lobe: 0, serr: 0 }, 6, false, r);
      o.fill += lf.d; o.ink += lf.d;
    }
    o.ink += 'M' + n2(x - size * 0.16) + ',' + n2(y) + 'a' + n2(size * 0.16) + ',' + n2(size * 0.16) + ' 0 1,0 ' + n2(size * 0.32) + ',0'
      + 'a' + n2(size * 0.16) + ',' + n2(size * 0.16) + ' 0 1,0 ' + n2(-size * 0.32) + ',0';
  } else if (kind === 1) {                            /* composite, ray florets */
    for (i = 0; i < 13; i++) {
      a = (i / 13) * Math.PI * 2;
      var l2 = lamina(x + Math.cos(a) * size * 0.24, y + Math.sin(a) * size * 0.24, a, size * 0.8, { w: 0.22, skew: 1.0, tip: 0.55, lobe: 0, serr: 0 }, 5, false, r);
      o.fill += l2.d; o.ink += l2.d;
    }
    o.ink += 'M' + n2(x - size * 0.26) + ',' + n2(y) + 'a' + n2(size * 0.26) + ',' + n2(size * 0.26) + ' 0 1,0 ' + n2(size * 0.52) + ',0'
      + 'a' + n2(size * 0.26) + ',' + n2(size * 0.26) + ' 0 1,0 ' + n2(-size * 0.52) + ',0';
  } else if (kind === 2) {                            /* umbel */
    for (i = 0; i < 7; i++) {
      a = -Math.PI / 2 + (i - 3) * 0.36;
      px = x + Math.cos(a) * size * 1.05; py = y + Math.sin(a) * size * 1.05;
      o.ink += 'M' + n2(x) + ',' + n2(y) + 'Q' + n2((x + px) / 2) + ',' + n2((y + py) / 2 - size * 0.2) + ' ' + n2(px) + ',' + n2(py);
      o.fill += 'M' + n2(px - size * 0.2) + ',' + n2(py) + 'a' + n2(size * 0.2) + ',' + n2(size * 0.2) + ' 0 1,0 ' + n2(size * 0.4) + ',0'
        + 'a' + n2(size * 0.2) + ',' + n2(size * 0.2) + ' 0 1,0 ' + n2(-size * 0.4) + ',0';
    }
    o.ink += o.fill;
  } else if (kind === 3) {                            /* campanulate, a bell */
    var wdt = size * 0.62, ht = size * 1.15;
    o.fill += 'M' + n2(x - wdt * 0.34) + ',' + n2(y - ht * 0.5)
      + 'C' + n2(x - wdt) + ',' + n2(y + ht * 0.2) + ' ' + n2(x - wdt * 0.9) + ',' + n2(y + ht * 0.5) + ' ' + n2(x) + ',' + n2(y + ht * 0.52)
      + 'C' + n2(x + wdt * 0.9) + ',' + n2(y + ht * 0.5) + ' ' + n2(x + wdt) + ',' + n2(y + ht * 0.2) + ' ' + n2(x + wdt * 0.34) + ',' + n2(y - ht * 0.5) + 'Z';
    o.ink += o.fill;
    for (i = -1; i <= 1; i++) {
      o.ink += 'M' + n2(x + i * wdt * 0.3) + ',' + n2(y - ht * 0.3) + 'L' + n2(x + i * wdt * 0.62) + ',' + n2(y + ht * 0.42);
    }
  } else {                                            /* spike */
    for (i = 0; i < 6; i++) {
      var yy = y + (i - 2.5) * size * 0.42;
      var side = i % 2 ? 1 : -1;
      var l3 = lamina(x, yy, side > 0 ? -0.5 : Math.PI + 0.5, size * 0.66, { w: 0.4, skew: 1, tip: 0.6, lobe: 0, serr: 0 }, 5, false, r);
      o.fill += l3.d; o.ink += l3.d;
    }
    o.ink += 'M' + n2(x) + ',' + n2(y - size * 1.25) + 'L' + n2(x) + ',' + n2(y + size * 1.25);
  }
  return o;
}

/* a seed pod: one per code example, up to the plate's capacity */
function podAt(x, y, ang, size, r) {
  var ca = Math.cos(ang), sa = Math.sin(ang);
  var tx = x + ca * size * 1.5, ty = y + sa * size * 1.5;
  var w = size * 0.44;
  var d = 'M' + n2(x) + ',' + n2(y)
    + 'Q' + n2(x + ca * size * 0.7 - sa * w) + ',' + n2(y + sa * size * 0.7 + ca * w) + ' ' + n2(tx) + ',' + n2(ty)
    + 'Q' + n2(x + ca * size * 0.7 + sa * w) + ',' + n2(y + sa * size * 0.7 - ca * w) + ' ' + n2(x) + ',' + n2(y) + 'Z';
  var ink = d + 'M' + n2(x) + ',' + n2(y) + 'L' + n2(tx) + ',' + n2(ty);
  return { fill: d, ink: ink };
}

/* six habits of growth. A family shares its habit, the way real taxa do. */
var HABITS = [
  { n: 'erect', stems: 1, base: 90, spread: 0.70, decay: 0.72, sinu: 0.18, scape: 0 },
  { n: 'spreading', stems: 1, base: 90, spread: 1.22, decay: 0.76, sinu: 0.30, scape: 0 },
  { n: 'decumbent', stems: 1, base: 56, spread: 0.94, decay: 0.74, sinu: 0.44, scape: 0 },
  { n: 'caespitose', stems: 4, base: 90, spread: 0.88, decay: 0.68, sinu: 0.34, scape: 0 },
  { n: 'scandent', stems: 1, base: 80, spread: 0.52, decay: 0.90, sinu: 0.78, scape: 0 },
  { n: 'rosulate', stems: 1, base: 90, spread: 1.42, decay: 0.56, sinu: 0.14, scape: 1 }
];

function growSpecimen(slug, level) {
  var page = IDX.bySlug[slug];
  var pr = D.prov[slug] || { commits: 1, authors: [], topAuthor: '', first: CLOSE, last: CLOSE, night: 0, careDays: 0 };
  var words = D.graph.words[slug] || 0;
  var codes = D.graph.code[slug] || 0;
  var inb = D.graph.inbound[slug] || 0;
  var fam = page.product + '|' + page.section;
  var sty = FAMILY_STYLE[fam] || { wash: WASHES[0], morph: MORPHS[0], habit: HABITS[0] };
  var com = IDX.community[slug] == null ? 0 : IDX.community[slug];
  var bloomCol = communityColour(com);
  var r = rngFor('grow' + slug);
  /* a family shares its habit; an individual still varies within it */
  var hb0 = sty.habit;
  var hb = {
    n: hb0.n, stems: hb0.stems, scape: hb0.scape,
    base: hb0.base + (r() - 0.5) * 16,
    spread: hb0.spread * (0.80 + r() * 0.44),
    decay: clamp(hb0.decay * (0.92 + r() * 0.17), 0.5, 0.94),
    sinu: hb0.sinu * (0.7 + r() * 0.7)
  };

  var detail = level === 'full'
    ? { samples: 9, veins: true, serr: true, maxLeaf: 108, maxFlower: 57, maxPod: 24, maxRoot: 28 }
    : { samples: 5, veins: false, serr: false, maxLeaf: 40, maxFlower: 24, maxPod: 12, maxRoot: 14 };

  /* --- what this page's own history decides --- */
  var age = days(pr.first, CLOSE);
  var woody = norm(age, 0, 1280);
  var care = norm(pr.careDays, 0, 1238);
  var branchy = norm(Math.log(pr.commits + 1) / Math.log(90), 0, 1);
  var mass = norm(Math.log(words + 1) / Math.log(10829), 0.45, 1);
  var winter = inb === 0;
  var hands = Math.max(1, pr.authors.length);

  var bb = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
  function mark(x, y, pad) {
    pad = pad || 0;
    if (x - pad < bb.x0) bb.x0 = x - pad;
    if (y - pad < bb.y0) bb.y0 = y - pad;
    if (x + pad > bb.x1) bb.x1 = x + pad;
    if (y + pad > bb.y1) bb.y1 = y + pad;
  }

  var baseX = 0, baseY = 0;
  var height = lerp(120, 300, 0.34 * woody + 0.44 * care + 0.22 * mass);
  var trunkW = lerp(1.1, 5.2, woody * 0.66 + care * 0.34);
  var maxDepth = 1 + Math.round(lerp(1.2, 4.5, branchy));

  var stems = ['', '', '', ''];
  var nodes = [], tips = [], tapeSpots = [];
  var rings = '';

  function segment(x0, y0, ang, len, thick, depth) {
    var bow = (r() - 0.5) * (0.30 + hb.sinu) * (1 + depth * 0.25);
    var mx = x0 + Math.cos(ang - bow) * len * 0.5;
    var my = y0 - Math.sin(ang - bow) * len * 0.5;
    var x1 = x0 + Math.cos(ang) * len;
    var y1 = y0 - Math.sin(ang) * len;
    var bucket = thick > trunkW * 0.7 ? 0 : thick > trunkW * 0.42 ? 1 : thick > trunkW * 0.22 ? 2 : 3;
    stems[bucket] += 'M' + n2(x0) + ',' + n2(y0) + 'Q' + n2(mx) + ',' + n2(my) + ' ' + n2(x1) + ',' + n2(y1);
    mark(x0, y0, thick); mark(mx, my, thick); mark(x1, y1, thick);
    tapeSpots.push({ x: (x0 + x1) / 2, y: (y0 + y1) / 2, a: ang, b: bucket });
    return [x1, y1];
  }

  function branch(x, y, ang, len, thick, depth, order) {
    var parts = depth === 0 ? 3 : 2;
    var px = x, py = y, i, e;
    for (i = 0; i < parts; i++) {
      var a = ang + (r() - 0.5) * (0.10 + hb.sinu * 0.30);
      e = segment(px, py, a, len / parts, thick * (1 - i * 0.1), depth);
      nodes.push({ x: e[0], y: e[1], ang: a, depth: depth });
      px = e[0]; py = e[1];
    }
    tips.push({ x: px, y: py, ang: ang, depth: depth });
    if (depth >= maxDepth || len < 9) return order;
    var kids = r() < 0.18 + branchy * 0.26 ? 3 : 2;
    for (i = 0; i < kids; i++) {
      order++;
      /* the golden angle, projected onto the pressed plane, with the seed's stutter */
      var turn = (order * PHYLLO) % 360;
      if (STUTTER_MASK[order % STUTTER_MASK.length]) turn = (turn + STUTTER_DEG) % 360;
      var lateral = Math.cos(turn * Math.PI / 180);
      var spread = lerp(0.26, 0.92, Math.abs(lateral)) * (lateral >= 0 ? 1 : -1) * hb.spread;
      var press = 1 + depth * 0.20;            /* pressing splays the higher orders */
      var childAng = ang + spread * press * (i === 0 && kids === 2 ? 0.5 : 1);
      childAng = clamp(childAng, -0.45, Math.PI + 0.45);
      var childLen = len * hb.decay * lerp(0.9, 1.12, care) * (0.84 + r() * 0.3);
      order = branch(px, py, childAng, childLen, thick * 0.62, depth + 1, order);
    }
    return order;
  }

  var nStems = hb.stems === 1 ? 1 : 2 + Math.floor(r() * (hb.stems - 1));
  var ord = 1;
  for (var si = 0; si < nStems; si++) {
    var sx = baseX + (si - (nStems - 1) / 2) * 5;
    var a0 = (hb.base + (r() - 0.5) * 7 + (si - (nStems - 1) / 2) * 13) * Math.PI / 180;
    ord = branch(sx, baseY, a0, (height / 2.3) / (nStems > 1 ? 1.25 : 1), trunkW / (nStems > 1 ? 1.5 : 1), 0, ord);
  }

  /* a naked scape carrying the flowers, for the rosette-forming families */
  var scapeTop = null;
  if (hb.scape) {
    var sl = height * 0.9;
    var sxx = baseX + (r() - 0.5) * 8, syy = baseY - sl;
    stems[1] += 'M' + n2(baseX) + ',' + n2(baseY) + 'Q' + n2(baseX + (r() - 0.5) * 22) + ',' + n2(baseY - sl * 0.55) + ' ' + n2(sxx) + ',' + n2(syy);
    mark(sxx, syy, 4); mark(baseX, baseY, 4);
    scapeTop = { x: sxx, y: syy, ang: Math.PI / 2, depth: 0 };
  }

  /* growth rings: one scar for each ~170 days of tending */
  var ringN = Math.min(7, Math.floor(pr.careDays / 170));
  for (var g = 0; g < ringN; g++) {
    var gy = baseY - 5 - g * 6.5;
    var gw = trunkW * (0.95 - g * 0.06);
    rings += 'M' + n2(baseX - gw) + ',' + n2(gy) + 'q' + n2(gw) + ',' + n2(2.0) + ' ' + n2(gw * 2) + ',0';
  }

  /* ---- roots: one primary for each hand that ever touched the page ---- */
  var rootD = '';
  var rootN = Math.min(detail.maxRoot, hands);
  var rootDepth = lerp(26, 96, care);
  for (var ri = 0; ri < rootN; ri++) {
    var ra = -Math.PI / 2 + (rootN > 1 ? (ri / (rootN - 1) - 0.5) * 1.7 : 0) + (r() - 0.5) * 0.24;
    var rl = rootDepth * (0.5 + r() * 0.75) * (ri === 0 ? 1.3 : 1);
    var rx = baseX + Math.cos(ra) * rl * 0.62, ry = baseY - Math.sin(ra) * rl;
    rootD += 'M' + n2(baseX) + ',' + n2(baseY)
      + 'Q' + n2(baseX + Math.cos(ra) * rl * 0.24) + ',' + n2(baseY - Math.sin(ra) * rl * 0.5) + ' ' + n2(rx) + ',' + n2(ry);
    mark(rx, ry, 2);
    var fib = 2 + Math.round(r() * 2);
    for (var fj = 0; fj < fib; fj++) {
      var ft = 0.4 + fj * 0.19;
      var fx = baseX + (rx - baseX) * ft, fy = baseY + (ry - baseY) * ft;
      var fa = ra + (r() - 0.5) * 1.6;
      var ex2 = fx + Math.cos(fa) * rl * 0.22, ey2 = fy - Math.sin(fa) * rl * 0.22;
      rootD += 'M' + n2(fx) + ',' + n2(fy) + 'L' + n2(ex2) + ',' + n2(ey2);
      mark(ex2, ey2, 1);
    }
  }

  /* ---- leaves: mass from the word count, shape and wash from the family ---- */
  var leafFill = '', leafFill2 = '', leafInk = '', budInk = '';
  var pool = nodes.slice(1);
  if (!pool.length) pool = nodes;
  if (hb.scape) pool = pool.filter(function (nd) { return nd.y > baseY - height * 0.42; }) || pool;
  if (!pool.length) pool = nodes;
  var leafN = winter
    ? Math.min(4, Math.max(1, Math.round(mass * 4)))
    : Math.min(detail.maxLeaf, Math.max(4, Math.round(lerp(7, 104, mass))));
  var step = Math.max(1, pool.length / Math.max(1, leafN));
  var leafBase = lerp(13, 34, mass) * (hb.scape ? 1.35 : 1);
  for (var li = 0; li < leafN; li++) {
    var nd = pool[Math.floor(li * step) % pool.length];
    if (!nd) break;
    var side = li % 2 ? 1 : -1;
    var la = nd.ang + side * lerp(0.5, 1.2, r());
    var ll = leafBase * (0.48 + r() * 0.9) * (1 - nd.depth * 0.075);
    var lf = leafInkFor(nd.x, nd.y, -la, ll, sty.morph, detail, r);
    if (li % 3 === 1) leafFill2 += lf.fill; else leafFill += lf.fill;
    leafInk += lf.ink;
    mark(nd.x + Math.cos(-la) * ll, nd.y + Math.sin(-la) * ll, ll * sty.morph.w * 1.3 + 2);
    mark(nd.x, nd.y, 2);
  }
  if (winter) {
    for (var bi = 0; bi < Math.min(24, pool.length); bi++) {
      var bd = pool[Math.floor(bi * Math.max(1, pool.length / 24)) % pool.length];
      var bs = 1.6 + r() * 1.2;
      budInk += 'M' + n2(bd.x) + ',' + n2(bd.y) + 'q' + n2(bs) + ',' + n2(-bs * 2) + ' ' + n2(bs * 2) + ',0Z';
    }
  }

  /* ---- flowers: one for every page in the collection that cites this one ---- */
  var flFill = '', flInk = '', flEye = '', moonFill = '', moonInk = '';
  var bloomN = Math.min(detail.maxFlower, inb);
  var host = scapeTop ? [scapeTop] : tips.slice().sort(function (a, b) { return a.y - b.y; });
  if (!host.length) host = nodes.length ? nodes : [{ x: 0, y: 0, ang: 1.57, depth: 0 }];
  var kind = com % 5;
  var scatter = scapeTop ? 15 : 13;
  for (var bi2 = 0; bi2 < bloomN; bi2++) {
    var h0 = host[bi2 % host.length];
    var fx2 = h0.x + (r() - 0.5) * scatter, fy2 = h0.y + (r() - 0.5) * scatter - (scapeTop ? r() * 10 : 0);
    var fsz = lerp(3.4, 6.2, r()) * (1 + norm(inb, 0, 57) * 0.3);
    var fw = flowerAt(fx2, fy2, fsz, kind, r);
    flFill += fw.fill; flInk += fw.ink;
    var ez = fsz * 0.2;
    flEye += 'M' + n2(fx2 - ez) + ',' + n2(fy2) + 'a' + n2(ez) + ',' + n2(ez) + ' 0 1,0 ' + n2(ez * 2) + ',0a' + n2(ez) + ',' + n2(ez) + ' 0 1,0 ' + n2(-ez * 2) + ',0';
    mark(fx2, fy2, fsz * 1.5);
  }
  /* ---- moon-pale flowers: one for every edit made between 22h and 6h ---- */
  for (var mi = 0; mi < pr.night; mi++) {
    var m0 = host[(mi * 3 + 1) % host.length];
    var mx2 = m0.x + (r() - 0.5) * 18, my2 = m0.y - 5 - r() * 12;
    var mw = flowerAt(mx2, my2, 5.0, 0, r);
    moonFill += mw.fill; moonInk += mw.ink;
    mark(mx2, my2, 8);
  }

  /* ---- seed pods: one for every code example ---- */
  var podFill = '', podInk = '';
  var podN = Math.min(detail.maxPod, codes);
  var lp = nodes.filter(function (nd2) { return nd2.y > baseY - height * 0.62; });
  if (!lp.length) lp = nodes.length ? nodes : [{ x: 0, y: 0, ang: 1.57 }];
  for (var pi = 0; pi < podN; pi++) {
    var pd = lp[(pi * 5 + 2) % lp.length];
    var pw = podAt(pd.x, pd.y, pd.ang + (r() - 0.5) * 1.2 - Math.PI / 2, 3.8 + r() * 2, r);
    podFill += pw.fill; podInk += pw.ink;
    mark(pd.x, pd.y, 9);
  }

  /* ---- press the plant onto the sheet: fit, but keep the age in the scale ---- */
  var AX0 = 20, AX1 = 276, AY0 = 24, AY1 = 392;
  var availW = AX1 - AX0, availH = AY1 - AY0;
  var bw = Math.max(6, bb.x1 - bb.x0), bh = Math.max(6, bb.y1 - bb.y0);
  var hf = lerp(0.50, 1.0, 0.36 * woody + 0.40 * care + 0.24 * mass);
  var k = Math.min((availH * hf) / bh, availW / bw);
  var cx = AX0 + availW * (hb.scape ? 0.46 : 0.42);
  var tx = cx - (bb.x0 + bw / 2) * k;
  var ty = AY0 + (availH - bh * k) * 0.62 - bb.y0 * k;
  /* keep it inside the frame whatever the silhouette does */
  if (tx + bb.x0 * k < AX0) tx = AX0 - bb.x0 * k;
  if (tx + bb.x1 * k > AX1) tx = AX1 - bb.x1 * k;
  if (ty + bb.y0 * k < AY0) ty = AY0 - bb.y0 * k;

  /* mounting tape, in sheet coordinates, laid across the woody parts */
  var tapes = [];
  /* strips are laid the length of the specimen, thickest at the foot, as a mounter does */
  var spots = tapeSpots.filter(function (sp) { return sp.b <= 2; });
  var upper = tapeSpots.filter(function (sp) { return sp.b === 3; });
  if (upper.length) spots = spots.concat(upper.filter(function (sp, i) { return i % 3 === 0; }));
  spots.sort(function (a, b) { return a.y - b.y; });
  var want = Math.min(6, Math.max(3, Math.round(3 + branchy * 3)));
  var used = {};
  for (var ti = 0; ti < want && spots.length; ti++) {
    var si2 = Math.floor(ti * (spots.length - 1) / Math.max(1, want - 1));
    if (used[si2]) continue;
    used[si2] = 1;
    var sp2 = spots[si2];
    tapes.push({
      x: tx + sp2.x * k, y: ty + sp2.y * k,
      a: -sp2.a * 180 / Math.PI + 90 + (r() - 0.5) * 18,
      w: (sp2.b === 0 ? 24 : 18) + r() * 11, h: (sp2.b === 0 ? 6.2 : 5.0) + r() * 1.3
    });
  }

  return {
    slug: slug, w: W, h: H,
    stems: stems, rings: rings, roots: rootD,
    leafFill: leafFill, leafFill2: leafFill2, leafInk: leafInk, budInk: budInk,
    flFill: flFill, flInk: flInk, flEye: flEye, moonFill: moonFill, moonInk: moonInk,
    podFill: podFill, podInk: podInk, tapes: tapes,
    fit: 'translate(' + n2(tx) + ',' + n2(ty) + ') scale(' + k.toFixed(4) + ')',
    scale: k,
    trunkW: trunkW, winter: winter, wash: sty.wash, morph: sty.morph, habit: hb0, bloom: bloomCol,
    stats: { age: age, words: words, codes: codes, inb: inb, night: pr.night, hands: hands, care: pr.careDays, commits: pr.commits }
  };
}

function specimen(slug, level) {
  var k = slug + '|' + level;
  if (!SPEC.has(k)) SPEC.set(k, growSpecimen(slug, level));
  return SPEC.get(k);
}

/* ------------------------------------------------ the plate, drawn in SVG */

function plantSVG(sp, cls) {
  var ink = sp.wash.ink, wash = sp.wash.wash;
  var woodInk = sp.winter ? '#6b5335' : '#4a3b25';
  var sw = 1 / sp.scale;                       /* strokes stay hairline-fine at any scale */
  var s = '<svg class="' + (cls || 'plant') + '" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">';
  s += '<g transform="' + sp.fit + '">';
  /* the pressed shadow, where the plant lies against the paper */
  s += '<g transform="translate(' + n2(2.6 * sw) + ',' + n2(3.4 * sw) + ')" opacity="0.09" fill="#4a3a22" stroke="none">'
    + '<path d="' + (sp.leafFill + sp.leafFill2 + sp.flFill || 'M0,0') + '"/></g>';
  s += '<path d="' + (sp.roots || 'M0,0') + '" fill="none" stroke="' + woodInk + '" stroke-width="' + n2(0.85 * sw) + '" stroke-linecap="round" opacity="0.7"/>';
  /* the wash, printed a hair off register, as on a hand-coloured plate */
  if (sp.leafFill || sp.leafFill2) {
    s += '<g transform="translate(' + n2(MISREG.x * sw) + ',' + n2(MISREG.y * sw) + ')">';
    if (sp.leafFill) s += '<path d="' + sp.leafFill + '" fill="' + wash + '" opacity="' + (sp.winter ? 0.18 : 0.46) + '" stroke="none"/>';
    if (sp.leafFill2) s += '<path d="' + sp.leafFill2 + '" fill="' + wash + '" opacity="' + (sp.winter ? 0.12 : 0.28) + '" stroke="none"/>';
    s += '</g>';
  }
  var wdt = [sp.trunkW, sp.trunkW * 0.58, sp.trunkW * 0.34, sp.trunkW * 0.19];
  for (var i = 0; i < 4; i++) {
    if (!sp.stems[i]) continue;
    s += '<path d="' + sp.stems[i] + '" fill="none" stroke="' + woodInk + '" stroke-width="' + n2(Math.max(0.5 * sw, wdt[i])) + '" stroke-linecap="round"/>';
  }
  if (sp.rings) s += '<path d="' + sp.rings + '" fill="none" stroke="' + woodInk + '" stroke-width="' + n2(0.6 * sw) + '" opacity="0.55"/>';
  if (sp.leafInk) s += '<path d="' + sp.leafInk + '" fill="none" stroke="' + ink + '" stroke-width="' + n2(0.62 * sw) + '" stroke-linejoin="round" opacity="0.9"/>';
  if (sp.budInk) s += '<path d="' + sp.budInk + '" fill="' + woodInk + '" stroke="none" opacity="0.82"/>';
  if (sp.podFill) {
    s += '<path d="' + sp.podFill + '" fill="#b08a3a" opacity="0.36" stroke="none" transform="translate(' + n2(MISREG.x * sw * .6) + ',' + n2(MISREG.y * sw * .6) + ')"/>';
    s += '<path d="' + sp.podInk + '" fill="none" stroke="#6a5220" stroke-width="' + n2(0.55 * sw) + '"/>';
  }
  if (sp.flFill) {
    s += '<g transform="translate(' + n2(-MISREG.x * sw * .8) + ',' + n2(-MISREG.y * sw * .8) + ')" opacity="0.72">'
      + '<path d="' + sp.flFill + '" fill="' + sp.bloom.fill + '" stroke="none"/></g>';
    s += '<path d="' + sp.flInk + '" fill="none" stroke="' + sp.bloom.ink + '" stroke-width="' + n2(0.5 * sw) + '" opacity="0.9"/>';
    if (sp.flEye) s += '<path d="' + sp.flEye + '" fill="' + sp.bloom.eye + '" stroke="none" opacity="0.85"/>';
  }
  if (sp.moonFill) {
    s += '<path d="' + sp.moonFill + '" fill="#f1ecf7" opacity="0.9" stroke="none"/>';
    s += '<path d="' + sp.moonInk + '" fill="none" stroke="#7d6ba0" stroke-width="' + n2(0.55 * sw) + '" opacity="0.95"/>';
  }
  s += '</g>';
  /* the linen mounting strips, laid over the specimen in sheet coordinates */
  sp.tapes.forEach(function (t) {
    s += '<g transform="translate(' + n2(t.x) + ',' + n2(t.y) + ') rotate(' + n2(t.a) + ')">'
      + '<rect x="' + n2(-t.w / 2) + '" y="' + n2(-t.h / 2 + 1.1) + '" width="' + n2(t.w) + '" height="' + n2(t.h) + '" fill="#8a7247" opacity="0.16"/>'
      + '<rect x="' + n2(-t.w / 2) + '" y="' + n2(-t.h / 2) + '" width="' + n2(t.w) + '" height="' + n2(t.h) + '" fill="#eee5cf" stroke="#c9bb9a" stroke-width="0.3"/>'
      + '</g>';
  });
  s += '</svg>';
  return s;
}

/* ============================================================================
   6. THE FURNITURE OF A HERBARIUM SHEET
   ========================================================================== */

function stampSVG(id) {
  var t = 'STRAPI DOCUMENTATION HERB. · ';
  return '<svg viewBox="0 0 120 120">'
    + '<defs><path id="' + id + '" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs>'
    + '<circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" stroke-width="2.4"/>'
    + '<circle cx="60" cy="60" r="47" fill="none" stroke="currentColor" stroke-width="0.9"/>'
    + '<circle cx="60" cy="60" r="30" fill="none" stroke="currentColor" stroke-width="0.9"/>'
    + '<text font-family="Courier Prime, monospace" font-size="9.4" letter-spacing="2.1" fill="currentColor">'
    + '<textPath href="#' + id + '" startOffset="0">' + t + t + '</textPath></text>'
    + '<path d="M60 44 L63.2 53.6 L73.4 53.6 L65.1 59.6 L68.3 69.3 L60 63.3 L51.7 69.3 L54.9 59.6 L46.6 53.6 L56.8 53.6 Z" fill="currentColor" opacity="0.85"/>'
    + '<text x="60" y="82" text-anchor="middle" font-family="Courier Prime, monospace" font-size="7.6" letter-spacing="1.4" fill="currentColor">2023–2026</text>'
    + '</svg>';
}

function labelHTML(slug, opts) {
  var p = IDX.bySlug[slug], pr = D.prov[slug];
  var b = binomialFor(slug);
  var inb = D.graph.inbound[slug] || 0, outb = D.graph.outbound[slug] || 0;
  var words = D.graph.words[slug] || 0, codes = D.graph.code[slug] || 0;
  var acc = IDX.accession[slug];
  var r = rngFor('label' + slug);
  var rot = (r() - 0.5) * 1.5;
  var h = '<div class="label" style="--lrot:' + n2(rot) + 'deg">';
  h += '<h3>Herbarium of the Strapi Documentation</h3>';
  h += '<div class="fam">' + esc(p.section) + ' · ' + esc(p.product.toUpperCase()) + '</div>';
  h += '<div class="bino">' + esc(b.genus) + ' ' + esc(b.species) + ' <span class="auth">' + esc(initials(pr.topAuthor)) + '</span></div>';
  h += '<div class="rule"></div>';
  h += '<dl>';
  h += '<dt>Coll.</dt><dd>' + esc(pr.topAuthor) + '</dd>';
  h += '<dt>Date</dt><dd>' + esc(prettyDate(pr.first)) + '</dd>';
  h += '<dt>Loc.</dt><dd>' + esc(p.file) + '</dd>';
  h += '<dt>Det.</dt><dd>' + plural(pr.commits, 'determination') + ', last ' + esc(shortDate(pr.last)) + '</dd>';
  h += '</dl>';
  h += '<div class="rule"></div>';
  h += '<div class="foot">Tended ' + plural(pr.careDays, 'day') + ' by ' + plural(pr.authors.length, 'hand') + '.<br>'
    + 'Cit. ' + inb + ' in / ' + outb + ' out · ' + words + ' words · ' + plural(codes, 'code example')
    + (pr.night ? '<br><span class="night">Nocturnal: ' + plural(pr.night, 'edit') + ' between 22h and 6h.</span>' : '')
    + '</div>';
  h += '</div>';
  return h;
}

/* Annotation slips: a revising botanist pastes them in the space above the
   original label, never over it. They are stacked, newest nearest the label. */
function slipsHTML(slug) {
  var pr = D.prov[slug];
  var out = '';
  var rest = pr.authors.slice(1);
  if (pr.night) {
    out += '<div class="slip" style="transform:rotate(.5deg)"><span class="hd">Collected after dark</span>'
      + '<b>' + plural(pr.night, 'edit') + '</b> made between 22h and 6h.</div>';
  }
  if (rest.length) {
    out += '<div class="slip"><span class="hd">Subsequent determinations</span>'
      + esc(rest.slice(0, 5).join(', ')) + (rest.length > 5 ? ' <b>and ' + (rest.length - 5) + ' more</b>' : '')
      + '</div>';
  }
  return out;
}
function cornerSlipHTML(slug) {
  var pr = D.prov[slug];
  if (pr.careDays < 900) return '';
  return '<div class="slip corner-slip"><span class="hd">Long tending</span>'
    + '<b>' + pr.careDays + ' days</b> between the first and the last touch of this sheet.</div>';
}

/* ============================================================================
   7. THE RECTO — a mounted specimen, full sheet
   ========================================================================== */

function rectoHTML(slug) {
  var p = IDX.bySlug[slug], pr = D.prov[slug];
  var sp = specimen(slug, 'full');
  var acc = IDX.accession[slug];
  var h = '<div class="sheet recto" id="recto" data-slug="' + attr(slug) + '" role="img" aria-label="Pressed specimen sheet for ' + attr(p.title) + '">';
  h += '<div class="plate">' + plantSVG(sp, 'plant') + '</div>';
  h += '<div class="rule-frame"></div>';
  h += '<div class="stamp" style="transform:rotate(' + n2(STAMP_ROT) + 'deg)">' + stampSVG('sp-' + acc) + '</div>';
  h += '<div class="acc">ACC. ' + esc(acc) + '</div>';
  h += '<div class="fieldno">Field no. ' + esc(p.product.toUpperCase()) + '‑' + esc(String(pr.commits).padStart(3, '0')) + ' · ' + esc(sp.habit.n) + ' · ' + esc(sp.morph.n) + ' · ' + esc(sp.wash.n) + '</div>';
  h += cornerSlipHTML(slug);
  h += '<div class="label-stack">' + labelHTML(slug) + slipsHTML(slug) + '</div>';
  h += '<div class="recto-hint"><span>Click the sheet to turn it over and read</span></div>';
  h += '</div>';
  return h;
}

/* --------------------------------------------------- the tray thumbnails */

function cardHTML(slug, i) {
  var p = IDX.bySlug[slug], pr = D.prov[slug];
  var b = binomialFor(slug);
  var inb = D.graph.inbound[slug] || 0;
  return '<button class="card" data-slug="' + attr(slug) + '" data-i="' + i + '">'
    + '<span class="mini" data-mini="' + attr(slug) + '">'
    + '<span class="mframe"></span>'
    + '<span class="mring"></span>'
    + '<span class="mlabel"><i>' + esc(b.genus) + ' ' + esc(b.species) + '</i><u></u><s style="--w:88%"></s><s style="--w:58%"></s></span>'
    + '</span>'
    + '<span class="cap"><span class="t">' + esc(p.sidebarLabel || p.title) + '</span>'
    + '<span class="m">' + esc(pr.first.slice(0, 4)) + ' · ' + pr.commits + ' det. · ' + (inb ? inb + ' cit.' : 'winter twig') + '</span></span>'
    + '</button>';
}

function mountMini(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  var slug = el.dataset.mini;
  el.insertAdjacentHTML('afterbegin', plantSVG(specimen(slug, 'thumb'), 'plant'));
}

/* Mounting a specimen costs a millisecond or two. Never spend more than a few
   of them in one frame, so leafing through a full drawer stays smooth. */
var miniObserver = null, mountQueue = [], mounting = false;
function pumpQueue() {
  var t0 = performance.now();
  while (mountQueue.length && performance.now() - t0 < 5.5) mountMini(mountQueue.shift());
  if (mountQueue.length) requestAnimationFrame(pumpQueue);
  else mounting = false;
}
function enqueueMini(el) {
  mountQueue.push(el);
  if (!mounting) { mounting = true; requestAnimationFrame(pumpQueue); }
}
function observeMinis(root) {
  if (!('IntersectionObserver' in window)) {
    $$('[data-mini]', root).forEach(mountMini); return;
  }
  if (!miniObserver) {
    miniObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { enqueueMini(e.target); miniObserver.unobserve(e.target); }
      });
    }, { rootMargin: '340px 0px' });
  }
  mountQueue.length = 0;
  $$('[data-mini]', root).forEach(function (el) { miniObserver.observe(el); });
}

/* ============================================================================
   8. THE VERSO — the naturalist's notes, on the back of the sheet
   ========================================================================== */

var ICONS = {
  'gear-six': '⚙', 'faders': '≡', 'layout': '▤', 'copy': '⧉', 'eye': '◉',
  'x': '✕', 'x-circle': '⊗', 'plus': '+', 'plus-circle': '⊕', 'check': '✓',
  'check-circle': '✓', 'magnifying-glass': '⌕', 'arrow-square-out': '↗',
  'arrow-clockwise': '↻', 'clock-counter-clockwise': '↺', 'arrow-fat-right': '→',
  'arrow-right': '→', 'arrow-left': '←', 'house': '⌂', 'code': '‹›',
  'info': 'ⓘ', 'sparkle': '✦', 'magic-wand': '✦', 'feather': '✒',
  'pencil-simple': '✎', 'pencil': '✎', 'dots-three-outline': '⋯',
  'dots-three': '⋯', 'dots-six-vertical': '⠿', 'trash': '⌦', 'trash-simple': '⌦',
  'credit-card': '▭', 'images': '▣', 'image': '▣', 'stack': '▤',
  'paper-plane-tilt': '➤', 'list-plus': '≣', 'map-trifold': '▦', 'browsers': '▤',
  'link': '⚭', 'crop': '⌗', 'map-pin': '⚑', 'shopping-cart': '⛁',
  'invoice': '⌸', 'markdown-logo': 'M↓', 'download-simple': '⤓', 'upload-simple': '⤒',
  'floppy-disk': '▣', 'lock': '⚿', 'question': '?', 'warning': '⚠', 'globe': '⊕',
  'user': '☺', 'users': '☺', 'folder': '▱', 'file': '▯', 'play': '▶',
  'caret-down': '▾', 'caret-right': '▸', 'caret-up': '▴', 'seal-check': '✓',
  'sign-out': '↪', 'bell': '⍾', 'palette': '◑', 'database': '⛃', 'terminal': '>_'
};

/* fill in the icon glyphs inside an already-safe HTML string */
function withIcons(html) {
  return String(html).replace(/<span class="icon" data-icon="([a-z0-9-]+)"([^>]*)><\/span>/g,
    function (m, name, rest) {
      var g = ICONS[name] || '▪';
      return '<span class="icon" data-icon="' + name + '"' + rest + '>' + g + '</span>';
    });
}

/* --------------------------------------------------------- code rendering */

var KEYWORDS = /\b(const|let|var|function|return|if|else|for|while|await|async|import|export|from|default|new|class|extends|try|catch|finally|throw|typeof|instanceof|this|super|null|undefined|true|false|interface|type|enum|public|private|readonly|as|in|of|do|switch|case|break|continue|yield|void|delete|module|require|declare|namespace|implements|satisfies)\b/;

function tokenizeLine(line, lang, st) {
  var out = '', i = 0, m;
  var isMarkupish = /^(html|xml|md|markdown|mdx|jsx|tsx)$/.test(lang || '');
  while (i < line.length) {
    if (st.block) {
      var end = line.indexOf('*/', i);
      if (end === -1) { out += '<span class="tk-c">' + esc(line.slice(i)) + '</span>'; i = line.length; }
      else { out += '<span class="tk-c">' + esc(line.slice(i, end + 2)) + '</span>'; i = end + 2; st.block = false; }
      continue;
    }
    var rest = line.slice(i);
    if (rest.slice(0, 2) === '/*') { st.block = true; continue; }
    if (rest.slice(0, 2) === '//' || (/^(bash|sh|shell|yaml|yml|toml|ini|python|py|dockerfile)$/.test(lang || '') && rest.charAt(0) === '#')) {
      out += '<span class="tk-c">' + esc(rest) + '</span>'; break;
    }
    if (rest.slice(0, 4) === '&lt;!--') { out += '<span class="tk-c">' + esc(rest) + '</span>'; break; }
    var ch = rest.charAt(0);
    if (ch === '"' || ch === "'" || ch === '`') {
      m = rest.match(new RegExp('^' + ch + '(?:\\\\.|[^' + ch + '\\\\])*' + ch + '?'));
      if (m) { out += '<span class="tk-s">' + esc(m[0]) + '</span>'; i += m[0].length; continue; }
    }
    m = rest.match(/^-?\d+(\.\d+)?/);
    if (m && !/[A-Za-z_$]/.test(line.charAt(i - 1) || '')) {
      out += '<span class="tk-n">' + esc(m[0]) + '</span>'; i += m[0].length; continue;
    }
    m = rest.match(/^[A-Za-z_$@][\w$.-]*/);
    if (m) {
      var w = m[0], cls = '';
      if (KEYWORDS.test(w)) cls = 'tk-k';
      else if (line.charAt(i + w.length) === '(') cls = 'tk-f';
      else if (isMarkupish && line.charAt(i - 1) === '<') cls = 'tk-f';
      else if (/^(json|graphql|yaml|yml)$/.test(lang || '') && /^["']?[\w.-]+["']?$/.test(w) && /^\s*$/.test(line.slice(0, i))) cls = 'tk-a';
      out += cls ? '<span class="' + cls + '">' + esc(w) + '</span>' : esc(w);
      i += w.length; continue;
    }
    m = rest.match(/^[{}()[\]<>;:,.=+\-*/%!&|?~^]+/);
    if (m) { out += '<span class="tk-p">' + esc(m[0]) + '</span>'; i += m[0].length; continue; }
    out += esc(ch); i += 1;
  }
  return out;
}

function renderCode(b) {
  var raw = String(b.code == null ? '' : b.code).replace(/^\n+/, '').replace(/\s+$/, '');
  var lines = raw.split('\n');
  var hl = {}, keep = [], pending = 0, region = false, k;
  for (k = 0; k < lines.length; k++) {
    var L = lines[k];
    var t = L.trim().replace(/^(\/\/|#|\/\*|\{\/\*|&lt;!--|<!--)\s*/, '').replace(/\s*(\*\/|\*\/\}|--&gt;|-->)$/, '').trim();
    if (t === 'highlight-start') { region = true; continue; }
    if (t === 'highlight-end') { region = false; continue; }
    if (t === 'highlight-next-line') { pending = 1; continue; }
    if (region || pending) { hl[keep.length] = 1; if (pending) pending--; }
    keep.push(L);
  }
  var st = { block: false };
  var body = keep.map(function (L, idx) {
    return '<span class="ln' + (hl[idx] ? ' hl' : '') + '">' + (tokenizeLine(L, b.lang, st) || '&nbsp;') + '</span>';
  }).join('\n');
  var head = '';
  if (b.title || b.lang) {
    head = '<div class="fname">' + (b.title ? '<span>' + esc(b.title) + '</span>' : '<span></span>')
      + (b.lang ? '<span class="lang">' + esc(b.lang) + '</span>' : '') + '</div>';
  }
  return '<div class="code">' + head + '<pre><code>' + body + '</code></pre></div>';
}

/* ------------------------------------------------------- block rendering */

var ADM_GLYPH = {
  note: '✎', tip: '☘', caution: '⚠', warning: '⚠', danger: '☠',
  info: 'ⓘ', prerequisites: '⚑', strapi: '✦', callout: '☛'
};
var ADM_NAME = {
  note: 'Note', tip: 'Tip', caution: 'Caution', warning: 'Warning', danger: 'Danger',
  info: 'Info', prerequisites: 'Prerequisites', strapi: 'Strapi', callout: 'Callout'
};

function renderBlocks(blocks) {
  var out = '', i;
  for (i = 0; i < (blocks || []).length; i++) out += renderBlock(blocks[i]);
  return out;
}

function renderBlock(b) {
  if (!b || !b.t) return '';
  switch (b.t) {
    case 'p':
      return '<p>' + withIcons(b.html) + '</p>';
    case 'tldr':
      return '<div class="tldr"><div class="h">Diagnosis</div><p>' + withIcons(b.html) + '</p></div>';
    case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      return '<' + b.t + ' id="' + attr(b.id || '') + '">' + esc(b.text) + '</' + b.t + '>';
    case 'hr':
      return '<div class="bot-rule" role="separator"></div>';
    case 'ul': case 'ol': {
      var tag = b.t;
      var s = '<' + tag + (b.start && b.start !== 1 ? ' start="' + esc(b.start) + '"' : '') + '>';
      (b.items || []).forEach(function (it) {
        if (typeof it === 'string') s += '<li>' + withIcons(it) + '</li>';
        else s += '<li>' + withIcons(it.html || '') + renderBlocks(it.blocks) + '</li>';
      });
      return s + '</' + tag + '>';
    }
    case 'code':
      return renderCode(b);
    case 'admonition': {
      var kind = b.kind || 'note';
      var title = b.title || ADM_NAME[kind] || kind;
      return '<div class="adm adm-' + esc(kind) + '" role="note">'
        + '<div class="h"><span class="g" aria-hidden="true">' + (ADM_GLYPH[kind] || '❧') + '</span>' + esc(title) + '</div>'
        + renderBlocks(b.blocks) + '</div>';
    }
    case 'table': {
      var al = b.align || [];
      var cls = function (i) { return al[i] === 'center' ? ' class="ac"' : al[i] === 'right' ? ' class="ar"' : ''; };
      var t = '<div class="tw"><table><thead><tr>';
      (b.head || []).forEach(function (h, i) { t += '<th' + cls(i) + '>' + withIcons(h) + '</th>'; });
      t += '</tr></thead><tbody>';
      (b.rows || []).forEach(function (row) {
        t += '<tr>';
        row.forEach(function (c, i) { t += '<td' + cls(i) + '>' + withIcons(c) + '</td>'; });
        t += '</tr>';
      });
      return t + '</tbody></table></div>';
    }
    case 'tabs': {
      var gid = b.groupId || 'g';
      var uid = 'tb' + (renderBlock.uid = (renderBlock.uid || 0) + 1);
      var bar = '', panes = '';
      (b.tabs || []).forEach(function (tb, i) {
        bar += '<button role="tab" id="' + uid + '-t' + i + '" aria-selected="' + (i === 0) + '" aria-controls="' + uid + '-p' + i + '"'
          + ' data-group="' + attr(gid) + '" data-value="' + attr(tb.value || tb.label) + '" data-i="' + i + '">' + esc(tb.label) + '</button>';
        panes += '<div class="pane" role="tabpanel" id="' + uid + '-p' + i + '" aria-labelledby="' + uid + '-t' + i + '"'
          + (i === 0 ? '' : ' hidden') + '>' + renderBlocks(tb.blocks) + '</div>';
      });
      return '<div class="tabs" data-group="' + attr(gid) + '"><div class="bar" role="tablist">' + bar + '</div>' + panes + '</div>';
    }
    case 'details':
      return '<details class="det" id="' + attr(b.id || '') + '"><summary>' + withIcons(b.summary || 'More') + '</summary>'
        + '<div class="body">' + renderBlocks(b.blocks) + '</div></details>';
    case 'img': {
      var src = String(b.light || b.dark || '').replace(/^\//, '');
      if (!src) return '';
      return '<figure class="plate-fig"><div class="frame"><img src="' + attr(src) + '" alt="' + attr(b.alt || '') + '" loading="lazy" decoding="async"></div>'
        + '<figcaption><b>Plate</b><span>' + esc(b.caption || b.alt || '') + '</span></figcaption></figure>';
    }
    case 'cards': {
      var c = '<div class="cards">';
      (b.items || []).forEach(function (it) {
        c += '<a class="xcard" href="' + attr(it.link || '#') + '">'
          + (it.icon ? '<span class="ic" aria-hidden="true">' + esc(it.icon) + '</span>' : '')
          + '<span class="t">' + esc(it.title || '') + '</span>'
          + '<span class="d">' + esc(it.desc || '') + '</span></a>';
      });
      return c + '</div>';
    }
    case 'badge':
      return '<span class="bdg bdg-' + esc(b.kind || 'version') + '"' + (b.tooltip ? ' title="' + attr(b.tooltip) + '"' : '') + '>' + esc(b.label) + '</span>';
    case 'columns': {
      var cc = '<div class="cols">';
      (b.cols || []).forEach(function (col) { cc += '<div>' + renderBlocks(col) + '</div>'; });
      return cc + '</div>';
    }
    case 'endpoint':
      return renderEndpoint(b);
    default:
      return '';
  }
}

function renderEndpoint(b) {
  var h = '<div class="ep">';
  var hasHead = b.method || b.path || b.title || b.description;
  if (hasHead) {
    h += '<div class="ephead">';
    if (b.method || b.path) {
      h += '<div class="sig">'
        + (b.method ? '<span class="m m-' + esc(b.method) + '">' + esc(b.method) + '</span>' : '')
        + (b.path ? '<span>' + esc(b.path) + '</span>' : '') + '</div>';
    }
    if (b.title) h += '<div class="eptitle">' + esc(b.title) + '</div>';
    if (b.description) h += '<p class="epdesc">' + withIcons(b.description) + '</p>';
    h += '</div>';
  }
  if (b.params && b.params.length) {
    h += '<div class="sec"><h4>' + esc(b.paramTitle || 'Parameters') + '</h4><div class="paramwrap"><table class="params"><tbody>';
    b.params.forEach(function (p) {
      h += '<tr><td class="pn">' + esc(p.name) + (p.required ? ' <span class="req">req.</span>' : '') + '</td>'
        + '<td class="pt">' + esc(p.type || '') + '</td>'
        + '<td>' + withIcons(p.desc || '') + '</td></tr>';
    });
    h += '</tbody></table></div></div>';
  }
  if (b.codeTabs && b.codeTabs.length) {
    h += '<div class="sec"><h4>Request</h4>'
      + renderBlock({ t: 'tabs', groupId: 'ep-' + (b.id || 'x'), tabs: b.codeTabs.map(function (c) {
        return { label: c.label || c.lang || 'Request', value: c.label || c.lang, blocks: [{ t: 'code', lang: c.lang, title: '', code: c.code }] };
      }) }) + '</div>';
  }
  if (b.responses && b.responses.length) {
    h += '<div class="sec"><h4>Response</h4>';
    b.responses.forEach(function (r) {
      var bad = r.status >= 400;
      h += '<div class="status' + (bad ? ' bad' : '') + '"><span class="dot"></span>' + esc(r.status) + ' ' + esc(r.statusText || '')
        + (r.time ? ' · ' + esc(r.time) : '') + '</div>';
      h += renderCode({ lang: r.lang || 'json', title: '', code: r.body || '' });
    });
    h += '</div>';
  }
  return h + '</div>';
}

/* ------------------------------------------------------ provenance prose */

function provenanceHTML(slug) {
  var pr = D.prov[slug], p = IDX.bySlug[slug];
  var inb = IDX.inbound[slug] || [], outb = IDX.outbound[slug] || [];
  var b = binomialFor(slug);
  var born = new Date(pr.first);
  var season = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'][born.getMonth()];
  var others = pr.authors.slice(1);

  var story = 'This sheet was collected on a <b>' + weekday(pr.first) + '</b>, the ' + esc(prettyDate(pr.first))
    + ', in the ' + season + ' of ' + pr.first.slice(0, 4) + ', by <b>' + esc(pr.topAuthor) + '</b>. ';
  if (pr.careDays > 0) {
    story += 'It was tended for <b>' + plural(pr.careDays, 'day') + '</b>, and last touched on <b>'
      + esc(prettyDate(pr.last)) + '</b>. ';
  } else {
    story += 'It was collected and set down the same day, and has not been touched since. ';
  }
  story += 'Across those years it took <b>' + plural(pr.commits, 'determination') + '</b> from <b>'
    + plural(pr.authors.length, 'hand') + '</b>';
  story += others.length ? ' — after ' + esc(pr.topAuthor) + ', ' + esc(others.slice(0, 4).join(', '))
    + (others.length > 4 ? ' and ' + (others.length - 4) + ' more' : '') + '. ' : '. ';
  if (pr.night === 1) {
    story += '<span class="moon">One of those edits was made between 22h and 6h; the plate carries a single moon-pale flower for it.</span> ';
  } else if (pr.night > 1) {
    story += '<span class="moon">' + cap(pr.night) + ' of those edits were made between 22h and 6h; the plate carries a moon-pale flower for each.</span> ';
  }
  if (!inb.length) {
    story += 'Nothing in the collection links here yet, so the specimen is pressed as a bare winter twig — catalogued all the same.';
  } else {
    story += cap(inb.length) + ' other ' + (inb.length === 1 ? 'sheet' : 'sheets') + ' in this cabinet '
      + (inb.length === 1 ? 'points' : 'point') + ' here, and the plate flowers once for each.';
  }

  var words = D.graph.words[slug] || 0, codes = D.graph.code[slug] || 0;
  var sp = specimen(slug, 'thumb');

  var h = '<section class="prov"><h2>Provenance</h2>';
  h += '<p class="prov-story">' + story + '</p>';
  h += '<dl class="prov-grid">';
  h += '<div><dt>Collected</dt><dd>' + esc(shortDate(pr.first)) + '<small>first commit</small></dd></div>';
  h += '<div><dt>Last determination</dt><dd>' + esc(shortDate(pr.last)) + '<small>most recent touch</small></dd></div>';
  h += '<div><dt>Tended</dt><dd>' + pr.careDays + '<small>days of care</small></dd></div>';
  h += '<div><dt>Determinations</dt><dd>' + pr.commits + '<small>commits</small></dd></div>';
  h += '<div><dt>Hands</dt><dd>' + pr.authors.length + '<small>named authors</small></dd></div>';
  h += '<div><dt>Night edits</dt><dd>' + pr.night + '<small>between 22h and 6h</small></dd></div>';
  h += '<div><dt>Leaf mass</dt><dd>' + words + '<small>words</small></dd></div>';
  h += '<div><dt>Seed pods</dt><dd>' + codes + '<small>code examples</small></dd></div>';
  h += '<div><dt>In bloom</dt><dd>' + (D.graph.inbound[slug] || 0) + '<small>sheets cite this one</small></dd></div>';
  h += '</dl>';
  h += '<p class="prov-hands">Every hand that touched this sheet, in order of contribution: '
    + pr.authors.map(function (a, i) { return i === 0 ? '<b>' + esc(a) + '</b>' : esc(a); }).join(', ') + '.</p>';

  h += '<div class="xrefs">';
  h += '<div><h3>Cited by — ' + inb.length + '</h3>';
  h += inb.length
    ? '<ul>' + inb.slice(0, 24).map(function (s) {
      return '<li><a href="#' + attr(s) + '">' + esc((IDX.bySlug[s] || {}).title || s) + '</a></li>';
    }).join('') + (inb.length > 24 ? '<li class="none">and ' + (inb.length - 24) + ' more</li>' : '') + '</ul>'
    : '<p class="none">No sheet in the collection points here. A winter twig.</p>';
  h += '</div>';
  h += '<div><h3>Points to — ' + outb.length + '</h3>';
  h += outb.length
    ? '<ul>' + outb.slice(0, 24).map(function (s) {
      return '<li><a href="#' + attr(s) + '">' + esc((IDX.bySlug[s] || {}).title || s) + '</a></li>';
    }).join('') + (outb.length > 24 ? '<li class="none">and ' + (outb.length - 24) + ' more</li>' : '') + '</ul>'
    : '<p class="none">This sheet points nowhere else.</p>';
  h += '</div></div>';
  h += '</section>';
  return h;
}

/* the marginal index, the way a naturalist rules the outer margin of the page */
function marginIndex(p) {
  var hs = (p.headings || []).filter(function (x) { return x.level <= 3 && x.id; });
  if (hs.length < 2) return '<aside class="margin-idx" aria-hidden="true"></aside>';
  return '<aside class="margin-idx"><nav aria-label="Sections of this sheet">'
    + '<h2>In this sheet</h2><ol>'
    + hs.slice(0, 26).map(function (x) {
      return '<li class="l' + x.level + '"><a href="#' + attr(x.id) + '">' + esc(x.text) + '</a></li>';
    }).join('')
    + '</ol></nav></aside>';
}

function versoHTML(slug) {
  var p = IDX.bySlug[slug], pr = D.prov[slug];
  var b = binomialFor(slug);
  var sp = specimen(slug, 'thumb');
  var acc = IDX.accession[slug];

  var h = '<article class="sheet verso" id="verso">';
  h += '<div class="verso-head">';
  h += '<div class="vh-txt">';
  h += '<p class="vh-fam">' + esc(p.section) + ' · ' + esc(p.product.toUpperCase()) + ' · Acc. ' + esc(acc) + '</p>';
  h += '<h1 class="vh-bino">' + esc(b.genus) + ' ' + esc(b.species) + ' <span class="auth">' + esc(initials(pr.topAuthor)) + '</span></h1>';
  h += '<h2 class="vh-title">' + esc(p.title) + '</h2>';
  if (p.description) h += '<p class="vh-desc">' + esc(p.description) + '</p>';
  if (p.tags && p.tags.length) {
    h += '<div class="vh-tags">' + p.tags.slice(0, 8).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>';
  }
  h += '</div>';
  h += '<button class="vignette" data-flip="' + attr(slug) + '" title="Turn the sheet over to the specimen">'
    + '<span class="vin">' + plantSVG(sp, 'plant') + '</span>'
    + '<figcaption><u>Recto · see the specimen</u></figcaption></button>';
  h += '</div>';

  h += '<div class="verso-body">';
  h += '<div class="notes">' + renderBlocks(p.blocks) + '</div>';
  h += marginIndex(p);
  h += '</div>';
  h += provenanceHTML(slug);
  h += '</article>';
  return h;
}

/* ============================================================================
   9. THE CABINET — drawers, trays, plaque, key
   ========================================================================== */

function drawerFor(slug) {
  var p = IDX.bySlug[slug];
  return p.product + '|' + p.section;
}

function buildIndex() {
  var c = D.content, g = D.graph;
  IDX.pages = c.order.map(function (s) { return c.pages[s]; }).filter(Boolean);
  IDX.bySlug = c.pages;
  c.order.forEach(function (s, i) { IDX.accession[s] = 'STR-' + String(i + 1).padStart(4, '0'); });

  g.edges.forEach(function (e) {
    (IDX.outbound[e[0]] = IDX.outbound[e[0]] || []).push(e[1]);
    (IDX.inbound[e[1]] = IDX.inbound[e[1]] || []).push(e[0]);
  });

  D.com.forEach(function (cm, i) {
    (cm.members || []).forEach(function (s) { IDX.community[s] = i; });
  });

  /* the 18 drawers, in the order the cabinet is filed */
  var seen = {}, order = [];
  c.nav.forEach(function (nv) {
    var id = nv.product + '|' + nv.label;
    if (!seen[id]) { seen[id] = { id: id, product: nv.product, label: nv.label, slugs: [] }; order.push(seen[id]); }
    nv.items.forEach(function (it) {
      if (c.pages[it.slug] && seen[id].slugs.indexOf(it.slug) === -1) seen[id].slugs.push(it.slug);
    });
  });
  c.order.forEach(function (s) {
    var id = drawerFor(s);
    if (!seen[id]) { seen[id] = { id: id, product: c.pages[s].product, label: c.pages[s].section, slugs: [] }; order.push(seen[id]); }
    if (seen[id].slugs.indexOf(s) === -1) seen[id].slugs.push(s);
  });
  /* a slug may be filed in a nav drawer that is not its own section: keep it in its section drawer only */
  order.forEach(function (d) {
    d.slugs = d.slugs.filter(function (s) { return drawerFor(s) === d.id; });
  });
  IDX.drawers = order.filter(function (d) { return d.slugs.length; });
  IDX.drawers.forEach(function (d) { IDX.drawerById[d.id] = d; });

  buildFamilyStyles(IDX.drawers.map(function (d) { return d.id; }));

  /* the gardeners: every hand, counted honestly */
  var tended = {}, principal = {};
  Object.keys(D.prov).forEach(function (s) {
    var pr = D.prov[s];
    pr.authors.forEach(function (a) { tended[a] = (tended[a] || 0) + 1; });
    principal[pr.topAuthor] = (principal[pr.topAuthor] || 0) + 1;
  });
  IDX.hands = Object.keys(tended).map(function (a) {
    return { name: a, tended: tended[a], principal: principal[a] || 0 };
  }).sort(function (a, b) { return b.tended - a.tended || a.name.localeCompare(b.name); });

  var slugs = Object.keys(D.prov);
  var cares = slugs.map(function (s) { return D.prov[s].careDays; }).sort(function (a, b) { return a - b; });
  IDX.totals = {
    sheets: c.order.length,
    hands: IDX.hands.length,
    nights: slugs.reduce(function (a, s) { return a + D.prov[s].night; }, 0),
    nightSheets: slugs.filter(function (s) { return D.prov[s].night > 0; }).length,
    maxCare: Math.max.apply(null, cares),
    medCare: cares[Math.floor(cares.length / 2)],
    first: slugs.map(function (s) { return D.prov[s].first; }).sort()[0],
    last: slugs.map(function (s) { return D.prov[s].last; }).sort().slice(-1)[0],
    citations: g.edges.length,
    winter: c.order.filter(function (s) { return !(g.inbound[s] > 0); }).length,
    bloom: c.order.filter(function (s) { return (g.inbound[s] || 0) >= 10; }).length,
    communities: D.com.length,
    commits: slugs.reduce(function (a, s) { return a + D.prov[s].commits; }, 0),
    eldest: c.order.filter(function (s) { return D.prov[s] && D.prov[s].first < '2024-01-01'; }).length
  };
}

/* -------------------------------------------------------- special drawers */

function specialList(kind) {
  var order = D.content.order;
  if (kind === 'all') return order.slice();
  if (kind === 'bloom') {
    return order.filter(function (s) { return (D.graph.inbound[s] || 0) >= 10; })
      .sort(function (a, b) { return (D.graph.inbound[b] || 0) - (D.graph.inbound[a] || 0); });
  }
  if (kind === 'winter') return order.filter(function (s) { return !(D.graph.inbound[s] > 0); });
  if (kind === 'night') {
    return order.filter(function (s) { return D.prov[s] && D.prov[s].night > 0; })
      .sort(function (a, b) { return D.prov[b].night - D.prov[a].night; });
  }
  if (kind === 'eldest') {
    return order.filter(function (s) { return D.prov[s] && D.prov[s].first < '2024-01-01'; })
      .sort(function (a, b) { return D.prov[a].first.localeCompare(D.prov[b].first); });
  }
  if (kind === 'tended') {
    return order.slice().sort(function (a, b) { return (D.prov[b] ? D.prov[b].careDays : 0) - (D.prov[a] ? D.prov[a].careDays : 0); }).slice(0, 60);
  }
  return order.slice();
}

var SPECIALS = {
  all: { title: 'The whole collection', sub: 'every sheet in the cabinet, in filing order' },
  bloom: { title: 'In full bloom', sub: 'sheets cited ten times or more by the rest of the collection' },
  winter: { title: 'Winter twigs', sub: 'nothing links here yet, and they are catalogued all the same' },
  night: { title: 'The night garden', sub: 'sheets carrying moon-pale flowers, one for each edit made between 22h and 6h' },
  eldest: { title: 'The eldest', sub: 'collected before 2024, in the first seasons of these documents' },
  tended: { title: 'The longest tended', sub: 'the sixty sheets with the most days between their first and last touch' }
};

/* --------------------------------------------------------------- the rail */

function renderRail() {
  var t = IDX.totals;
  $('#railSub').innerHTML = t.sheets + ' sheets · ' + t.hands + ' hands<br>'
    + prettyDate(t.first).replace(/^\d+ /, '') + ' — ' + prettyDate(t.last).replace(/^\d+ /, '');

  var h = '';
  h += '<div class="drawer-group"><h2>Special drawers</h2>';
  ['all', 'bloom', 'winter', 'night', 'eldest', 'tended'].forEach(function (k) {
    h += '<button class="drawer special" data-special="' + k + '"><span class="pull"></span>'
      + esc(SPECIALS[k].title) + '<span class="n">' + specialList(k).length + '</span></button>';
  });
  h += '</div>';

  ['cms', 'cloud'].forEach(function (prod) {
    var ds = IDX.drawers.filter(function (d) { return d.product === prod; });
    if (!ds.length) return;
    var n = ds.reduce(function (a, d) { return a + d.slugs.length; }, 0);
    h += '<div class="drawer-group"><h2>' + (prod === 'cms' ? 'CMS cabinet' : 'Cloud cabinet') + ' · ' + n + '</h2>';
    ds.forEach(function (d) {
      h += '<button class="drawer" data-drawer="' + attr(d.id) + '"><span class="pull"></span>'
        + esc(d.label) + '<span class="n">' + d.slugs.length + '</span></button>';
    });
    h += '</div>';
  });
  $('#drawers').innerHTML = h;

  renderPlaque(false);
}

var plaqueOpen = false;
function renderPlaque(open) {
  plaqueOpen = open;
  var list = open ? IDX.hands : IDX.hands.slice(0, 10);
  $('#hands').innerHTML = list.map(function (g) {
    return '<li><span class="nm">' + esc(g.name) + '</span><span class="dots"></span><span class="ct">' + g.tended + '</span></li>';
  }).join('');
  $('#plaqueMore').textContent = open
    ? 'Show the first ten only'
    : 'and ' + (IDX.hands.length - 10) + ' more hands. ' + IDX.hands.length + ' in all.';
}

/* -------------------------------------------------------------- the tray */

function renderTray(title, sub, list, note) {
  state.ctxList = list;
  var dense = list.length > 90;
  var h = '<div class="tray-head"><div>'
    + '<h2>' + title + '</h2>'
    + '<p>' + esc(sub) + '</p></div>'
    + '<div class="chips">'
    + '<span class="chip" role="note">' + list.length + ' sheets</span>'
    + '</div></div>';
  if (note) h += '<div class="tray-note"><p>' + note + '</p></div>';
  if (state.ctx && state.ctx.kind === 'special' && state.ctx.id === 'all') h += glancePlate();
  if (!list.length) {
    h += '<p class="empty">No sheet in this drawer matches. <em>Try another word.</em></p>';
  } else {
    h += '<div class="tray' + (dense ? ' dense' : '') + '">' + list.map(cardHTML).join('') + '</div>';
  }
  var sc = $('#scroll');
  sc.innerHTML = h;
  sc.scrollTop = 0;
  window.scrollTo(0, 0);
  observeMinis(sc);
}

/* the collection, engraved. Every figure comes out of provenance.json. */
function glancePlate() {
  var t = IDX.totals;
  var rows = [
    [t.sheets, 'sheets', 'one for every page'],
    [t.hands, 'hands', 'people who tended them'],
    [t.commits, 'determinations', 'commits, all told'],
    [t.maxCare, 'days', 'the longest a sheet was tended'],
    [t.medCare, 'days', 'the median sheet'],
    [t.nights, 'night edits', 'made between 22h and 6h'],
    [t.citations, 'citations', 'sheets pointing at sheets'],
    [t.winter, 'winter twigs', 'nothing links to them yet']
  ];
  return '<div class="glance"><h3>The collection, in the figures it keeps of itself</h3><dl>'
    + rows.map(function (r) {
      return '<div><dd>' + r[0] + '</dd><dt>' + esc(r[1]) + '</dt><small>' + esc(r[2]) + '</small></div>';
    }).join('')
    + '</dl><p class="glance-foot">Collected between ' + prettyDate(t.first) + ' and ' + prettyDate(t.last)
    + '. Read from six years of git history, one page at a time.</p></div>';
}

/* ------------------------------------------------------- key to the plates */

function keyGlyph(kind) {
  var r = rngFor('key' + kind);
  var s = '<svg viewBox="0 0 40 40" aria-hidden="true">';
  if (kind === 'wood') {
    s += '<path d="M20 38 L20 6" stroke="#4a3b25" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
      + '<path d="M20 22 L10 12 M20 16 L30 8" stroke="#4a3b25" stroke-width="2" fill="none" stroke-linecap="round"/>'
      + '<path d="M14 34 q6 2 12 0 M14 29 q6 2 12 0" stroke="#4a3b25" stroke-width="0.8" fill="none"/>';
  } else if (kind === 'leaf') {
    var lf = lamina(6, 30, -0.75, 30, MORPHS[0], 9, true, r);
    s += '<path d="' + lf.d + '" fill="#7d9a52" opacity="0.42" transform="translate(1.2,-0.9)"/>'
      + '<path d="' + lf.d + '" fill="none" stroke="#3d4a26" stroke-width="0.9"/>'
      + '<path d="M6 30 L' + n2(lf.tip[0]) + ' ' + n2(lf.tip[1]) + '" stroke="#3d4a26" stroke-width="0.8" fill="none"/>';
  } else if (kind === 'flower') {
    var fw = flowerAt(20, 20, 9, 0, r);
    s += '<path d="' + fw.fill + '" fill="hsl(342,42%,56%)" opacity="0.55" transform="translate(-1,0.8)"/>'
      + '<path d="' + fw.ink + '" fill="none" stroke="hsl(342,54%,32%)" stroke-width="0.8"/>';
  } else if (kind === 'moon') {
    var mw = flowerAt(20, 20, 9, 0, r);
    s += '<path d="' + mw.fill + '" fill="#efeaf6"/>'
      + '<path d="' + mw.ink + '" fill="none" stroke="#7d6ba0" stroke-width="0.9"/>';
  } else if (kind === 'pod') {
    var p1 = podAt(20, 30, -Math.PI / 2 - 0.2, 8, r), p2 = podAt(14, 32, -Math.PI / 2 + 0.5, 6, r);
    s += '<path d="' + p1.fill + p2.fill + '" fill="#b08a3a" opacity="0.4"/>'
      + '<path d="' + p1.ink + p2.ink + '" fill="none" stroke="#6a5220" stroke-width="0.85"/>';
  } else if (kind === 'root') {
    s += '<path d="M20 4 L20 16" stroke="#4a3b25" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
      + '<path d="M20 16 Q14 24 8 34 M20 16 Q20 26 19 36 M20 16 Q26 24 32 33 M12 26 l-4 3 M22 26 l4 4 M17 28 l-3 4"'
      + ' stroke="#4a3b25" stroke-width="0.9" fill="none" stroke-linecap="round"/>';
  } else if (kind === 'twig') {
    s += '<path d="M20 38 L20 8 M20 24 L11 15 M20 18 L29 11 M20 30 L13 25" stroke="#6a5334" stroke-width="1.5" fill="none" stroke-linecap="round"/>'
      + '<path d="M11 15 q1.6 -3 3.2 0Z M29 11 q1.6 -3 3.2 0Z M20 8 q1.6 -3 3.2 0Z" fill="#6a5334"/>';
  } else if (kind === 'branch') {
    s += '<path d="M20 38 L20 20 M20 26 L10 16 M20 20 L30 10 M10 16 L4 10 M10 16 L6 20 M30 10 L36 6 M30 10 L34 14"'
      + ' stroke="#4a3b25" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
  }
  return s + '</svg>';
}

function renderKeycard() {
  var t = IDX.totals;
  var h = '<button class="keyclose" id="keyClose" aria-label="Close the key">✕</button>';
  h += '<h2>Key to the plates</h2>';
  h += '<p class="lead">Every sheet is one documentation page. The plant on it was grown from that page’s own history — nothing here is decoration.</p>';
  h += '<ul class="keylist">';
  h += '<li>' + keyGlyph('wood') + '<span><b>Tall and woody</b> — the page is old. Height and thickness come from the date of its first commit.</span></li>';
  h += '<li>' + keyGlyph('branch') + '<span><b>Many branches</b> — the page has been revised often. One order of branching per handful of commits.</span></li>';
  h += '<li>' + keyGlyph('leaf') + '<span><b>Heavy foliage</b> — a long page. Leaf mass follows the word count, ' + t.sheets + ' pages between 79 and 10,828 words.</span></li>';
  h += '<li>' + keyGlyph('flower') + '<span><b>Flowers</b> — one for every other page that cites this one. ' + t.citations + ' citations in the collection.</span></li>';
  h += '<li>' + keyGlyph('moon') + '<span><b>Moon-pale flowers</b> — one for each edit made between 22h and 6h. There are ' + t.nights + ' in the whole cabinet.</span></li>';
  h += '<li>' + keyGlyph('pod') + '<span><b>Seed pods</b> — one for each code example on the page.</span></li>';
  h += '<li>' + keyGlyph('root') + '<span><b>Roots</b> — one for every person who ever edited the page. The deeper the roots, the longer it was tended.</span></li>';
  h += '<li>' + keyGlyph('twig') + '<span><b>A bare winter twig</b> — nothing links to this page yet. ' + t.winter + ' of the ' + t.sheets + ' sheets are pressed this way, still catalogued with care.</span></li>';
  h += '</ul>';
  h += '<p class="keyfoot">Leaf shape and watercolour wash are given by the <b>family</b>, that is the section the page is filed under. Flower colour comes from the <b>' + t.communities + ' measured link-communities</b>, so pages that link to each other bloom the same colour. '
    + 'Click a sheet to read the page on its verso; click the specimen again to turn back. '
    + '<b>←</b> and <b>→</b> leaf through the drawer.</p>';
  $('#keycard').innerHTML = h;
  $('#keyClose').addEventListener('click', function () { toggleKey(false); });
}
function toggleKey(on) {
  var kc = $('#keycard');
  if (on == null) on = kc.hidden;
  kc.hidden = !on;
  $('#btnKey').setAttribute('aria-expanded', String(on));
}

/* ============================================================================
   10. ROUTING
   ========================================================================== */

function parseHash() {
  var h = location.hash.replace(/^#/, '');
  if (!h || h === '/') return { kind: 'page', slug: '/cms/intro' };
  if (h.charAt(0) === '~') {
    var rest = h.slice(1);
    if (rest.slice(0, 2) === 's/') return { kind: 'recto', slug: '/' + rest.slice(2).replace(/^\//, '') };
    if (rest.slice(0, 2) === 'd/') return { kind: 'drawer', id: decodeURIComponent(rest.slice(2)) };
    if (rest.slice(0, 2) === 'q/') return { kind: 'search', q: decodeURIComponent(rest.slice(2)) };
    return { kind: 'special', id: rest || 'all' };
  }
  return { kind: 'page', slug: h.charAt(0) === '/' ? h : '/' + h };
}

function contextFor(slug) {
  if (state.ctx && state.ctxList.length && state.ctxList.indexOf(slug) !== -1) return;
  var d = IDX.drawerById[drawerFor(slug)];
  state.ctx = d ? { kind: 'drawer', id: d.id, label: d.label } : { kind: 'special', id: 'all', label: 'The whole collection' };
  state.ctxList = d ? d.slugs.slice() : D.content.order.slice();
}

function render() {
  var route = parseHash();
  state.route = route;
  var sc = $('#scroll');

  if (route.kind === 'page' || route.kind === 'recto') {
    var slug = route.slug;
    if (!IDX.bySlug[slug]) {
      var alt = D.content.order.filter(function (s) { return s.toLowerCase() === slug.toLowerCase(); })[0];
      if (alt) slug = alt;
    }
    if (!IDX.bySlug[slug]) {
      sc.innerHTML = '<p class="empty">No sheet is filed under <em>' + esc(route.slug) + '</em>. '
        + '<br><a href="#~all" style="color:var(--brass)">Open the whole collection</a>.</p>';
      document.title = 'Not in this cabinet · Herbarium of the Strapi Documentation';
      updateTopbar(null);
      return;
    }
    state.slug = slug;
    contextFor(slug);
    var p = IDX.bySlug[slug], b = binomialFor(slug);
    sc.innerHTML = neighbourStrip(slug);
    sc.insertAdjacentHTML('beforeend', route.kind === 'recto' ? rectoHTML(slug) : versoHTML(slug));
    document.title = b.full + ' · ' + p.title + ' · Herbarium of the Strapi Documentation';
    window.scrollTo(0, 0);
    observeMinis(sc);
    restoreTabs(sc);
    updateTopbar(slug);
    if (route.kind === 'recto') attachLens($('#recto'));
    return;
  }

  if (route.kind === 'drawer') {
    var d = IDX.drawerById[route.id];
    if (!d) { location.hash = '#~all'; return; }
    state.ctx = { kind: 'drawer', id: d.id, label: d.label };
    var famStyle = FAMILY_STYLE[d.id];
    var note = 'Filed as the family <em>' + esc(d.label) + '</em> of the ' + esc(d.product.toUpperCase())
      + ' cabinet. Every specimen in this drawer is <em>' + esc(famStyle.habit.n) + '</em> in habit, carries <em>' + esc(famStyle.morph.n)
      + '</em> leaves and is washed in <em>' + esc(famStyle.wash.n) + '</em>. A family shares its habit, the way real taxa do.';
    renderTray('<em>' + esc(d.label) + '</em>', d.product.toUpperCase() + ' cabinet · ' + d.slugs.length + ' sheets', d.slugs, note);
    document.title = d.label + ' · Herbarium of the Strapi Documentation';
    updateTopbar(null);
    return;
  }

  if (route.kind === 'search') {
    var list = searchList(route.q);
    state.ctx = { kind: 'search', id: route.q, label: 'Search' };
    renderTray('Sheets matching <em>' + esc(route.q) + '</em>', list.length + ' of ' + IDX.totals.sheets + ' sheets pulled from the cabinet', list,
      'Titles, descriptions, tags, file paths and collectors are all searched.');
    document.title = 'Search: ' + route.q + ' · Herbarium of the Strapi Documentation';
    var q = $('#q'); if (q.value !== route.q) q.value = route.q;
    updateTopbar(null);
    return;
  }

  /* special drawers */
  var kind = SPECIALS[route.id] ? route.id : 'all';
  var sl = specialList(kind);
  state.ctx = { kind: 'special', id: kind, label: SPECIALS[kind].title };
  var t = IDX.totals, note = '';
  if (kind === 'all') {
    note = 'Six years of documentation, pressed. The oldest sheet was collected on <em>' + prettyDate(t.first)
      + '</em>; the newest touch is <em>' + prettyDate(t.last) + '</em>. A median sheet was tended for <em>'
      + t.medCare + ' days</em>, and one was tended for <em>' + t.maxCare + ' days</em>. Seventy-seven people did the tending, '
      + 'and fifteen times somebody did it between 22h and 6h.';
  } else if (kind === 'night') {
    note = t.nights + ' edits in the whole history of these documents were made between 22h and 6h, spread across '
      + t.nightSheets + ' sheets. Each one is a moon-pale flower on its plate.';
  } else if (kind === 'winter') {
    note = 'Nothing in the collection links to these ' + t.winter + ' pages. They are pressed leafless, as a botanist presses a specimen collected out of season — and filed with exactly the same care as the rest.';
  } else if (kind === 'bloom') {
    note = t.bloom + ' sheets are cited ten times or more. The most visited, <em>breaking changes</em>, flowers 57 times.';
  } else if (kind === 'eldest') {
    note = 'These ' + t.eldest + ' sheets were collected before 2024. The first of all, on <em>' + prettyDate(t.first) + '</em>.';
  } else if (kind === 'tended') {
    note = 'Days between a page’s first and last touch. The longest is <em>' + t.maxCare + ' days</em>; the median across the whole cabinet is <em>' + t.medCare + '</em>.';
  }
  renderTray(esc(SPECIALS[kind].title), SPECIALS[kind].sub, sl, note);
  document.title = SPECIALS[kind].title + ' · Herbarium of the Strapi Documentation';
  updateTopbar(null);
}

function neighbourStrip(slug) {
  var list = state.ctxList.length ? state.ctxList : D.content.order;
  var i = list.indexOf(slug);
  if (i === -1) return '';
  var from = Math.max(0, Math.min(i - 4, list.length - 9));
  var win = list.slice(from, from + 9);
  return '<div class="strip" aria-label="Neighbouring sheets in this drawer">' + win.map(function (s) {
    var p = IDX.bySlug[s];
    return '<button data-slug="' + attr(s) + '" title="' + attr(p.title) + '"' + (s === slug ? ' aria-current="true"' : '') + '>'
      + '<span class="mini" data-mini="' + attr(s) + '" style="position:absolute;inset:0"></span></button>';
  }).join('') + '</div>';
}

function updateTopbar(slug) {
  var d = state.ctx;
  $('#btnDrawerLabel').textContent = d ? d.label : 'Cabinet';
  var mid = $('#tbMid');
  if (slug) {
    var list = state.ctxList.length ? state.ctxList : D.content.order;
    var i = list.indexOf(slug);
    var p = IDX.bySlug[slug];
    mid.innerHTML = 'Sheet <b>' + (i + 1) + '</b> of <b>' + list.length + '</b> in ' + esc(d ? d.label : '') +
      ' · <b>' + esc(IDX.accession[slug]) + '</b> · ' + esc(p.file);
    $('#btnPrev').disabled = i <= 0;
    $('#btnNext').disabled = i === -1 || i >= list.length - 1;
  } else {
    mid.innerHTML = IDX.totals.sheets + ' sheets · ' + IDX.totals.hands + ' hands · '
      + IDX.totals.commits + ' determinations · ' + IDX.totals.nights + ' night edits';
    $('#btnPrev').disabled = true;
    $('#btnNext').disabled = true;
  }
}

function step(dir) {
  if (!state.slug) return;
  var list = state.ctxList.length ? state.ctxList : D.content.order;
  var i = list.indexOf(state.slug);
  if (i === -1) return;
  var j = i + dir;
  if (j < 0 || j >= list.length) return;
  location.hash = '#' + list[j];
}

function searchList(q) {
  var s = String(q || '').trim().toLowerCase();
  if (!s) return D.content.order.slice();
  var terms = s.split(/\s+/);
  return D.content.order.filter(function (slug) {
    var p = IDX.bySlug[slug], pr = D.prov[slug] || { authors: [], topAuthor: '' };
    var hay = (p.title + ' ' + p.sidebarLabel + ' ' + p.description + ' ' + slug + ' ' + p.file + ' '
      + p.section + ' ' + (p.tags || []).join(' ') + ' ' + pr.authors.join(' ') + ' '
      + binomialFor(slug).full).toLowerCase();
    return terms.every(function (t) { return hay.indexOf(t) !== -1; });
  });
}

/* ============================================================================
   11. INTERACTION
   ========================================================================== */

function restoreTabs(root) {
  var pref = {};
  try { pref = JSON.parse(localStorage.getItem('herb.tabs') || '{}'); } catch (e) { pref = {}; }
  $$('.tabs', root).forEach(function (tabs) {
    var g = tabs.dataset.group;
    if (!pref[g]) return;
    var btn = $$('.bar button', tabs).filter(function (b) { return b.dataset.value === pref[g]; })[0];
    if (btn) selectTab(btn, false);
  });
}
function selectTab(btn, persist) {
  var tabs = btn.closest('.tabs');
  var i = btn.dataset.i;
  $$('.bar button', tabs).forEach(function (b) { b.setAttribute('aria-selected', String(b === btn)); });
  $$('.pane', tabs).forEach(function (p, k) { p.hidden = String(k) !== String(i); });
  if (persist) {
    var g = tabs.dataset.group;
    $$('.tabs[data-group="' + CSS.escape(g) + '"]').forEach(function (other) {
      if (other === tabs) return;
      var m = $$('.bar button', other).filter(function (b) { return b.dataset.value === btn.dataset.value; })[0];
      if (m) selectTab(m, false);
    });
    try {
      var pref = JSON.parse(localStorage.getItem('herb.tabs') || '{}');
      pref[g] = btn.dataset.value;
      localStorage.setItem('herb.tabs', JSON.stringify(pref));
    } catch (e) { /* a private window: no memory, no harm */ }
  }
}

/* the magnifier */
var lensEl, lensOn = false;
function attachLens(el) {
  if (!el || !lensEl) return;
  if (window.matchMedia('(max-width:1080px)').matches || window.matchMedia('(pointer:coarse)').matches) return;
  var slug = el.dataset.slug;
  var Z = 2.45;
  var svg = plantSVG(specimen(slug, 'full'), 'plant');
  el.addEventListener('pointerenter', function () {
    var r = el.getBoundingClientRect();
    lensEl.innerHTML = '<div class="li" style="width:' + (r.width * Z) + 'px;height:' + (r.height * Z) + 'px">' + svg + '</div>';
    var s = $('.li svg', lensEl);
    if (s) { s.style.width = (r.width * Z) + 'px'; s.style.height = (r.height * Z) + 'px'; }
    lensEl.hidden = false; lensOn = true;
  });
  el.addEventListener('pointerleave', function () { lensEl.hidden = true; lensOn = false; });
  el.addEventListener('pointermove', function (e) {
    if (!lensOn) return;
    var r = el.getBoundingClientRect();
    var x = e.clientX - r.left, y = e.clientY - r.top;
    var half = lensEl.offsetWidth / 2;
    lensEl.style.left = (e.clientX - half) + 'px';
    lensEl.style.top = (e.clientY - half) + 'px';
    var li = $('.li', lensEl);
    if (li) li.style.transform = 'translate(' + (half - x * Z) + 'px,' + (half - y * Z) + 'px)';
  });
}

function wire() {
  lensEl = $('#lens');

  document.addEventListener('click', function (e) {
    var t = e.target;
    var mi = t.closest ? t.closest('.margin-idx a') : null;
    if (mi) {
      e.preventDefault();
      var id = mi.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: prefersStill() ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    var card = t.closest ? t.closest('.card, .strip button') : null;
    if (card && card.dataset.slug) { location.hash = '#' + card.dataset.slug; return; }
    var flip = t.closest ? t.closest('[data-flip]') : null;
    if (flip) { location.hash = '#~s' + flip.dataset.flip; return; }
    var recto = t.closest ? t.closest('#recto') : null;
    if (recto) { location.hash = '#' + recto.dataset.slug; return; }
    var dr = t.closest ? t.closest('[data-drawer]') : null;
    if (dr) { location.hash = '#~d/' + encodeURIComponent(dr.dataset.drawer); return; }
    var sp = t.closest ? t.closest('[data-special]') : null;
    if (sp) { location.hash = '#~' + sp.dataset.special; return; }
    var tab = t.closest ? t.closest('.tabs .bar button') : null;
    if (tab) { selectTab(tab, true); return; }
  });

  $('#plaqueMore').addEventListener('click', function () { renderPlaque(!plaqueOpen); });
  $('#btnKey').addEventListener('click', function () { toggleKey(); });
  $('#btnPrev').addEventListener('click', function () { step(-1); });
  $('#btnNext').addEventListener('click', function () { step(1); });
  $('#btnDrawer').addEventListener('click', function () {
    var d = state.ctx;
    if (!d) { location.hash = '#~all'; return; }
    location.hash = d.kind === 'drawer' ? '#~d/' + encodeURIComponent(d.id)
      : d.kind === 'search' ? '#~q/' + encodeURIComponent(d.id) : '#~' + d.id;
  });

  var qt = null;
  $('#q').addEventListener('input', function (e) {
    clearTimeout(qt);
    var v = e.target.value;
    qt = setTimeout(function () {
      location.hash = v.trim() ? '#~q/' + encodeURIComponent(v.trim()) : '#~all';
    }, 190);
  });

  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape') { e.target.blur(); }
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowLeft') { step(-1); }
    else if (e.key === 'ArrowRight') { step(1); }
    else if (e.key === 'Escape') { toggleKey(false); }
    else if (e.key === '?') { toggleKey(); }
    else if (e.key === '/') { e.preventDefault(); $('#q').focus(); }
  });

  window.addEventListener('hashchange', render);
}

/* highlight the open drawer in the rail after every render */
function markRail() {
  var d = state.ctx;
  $$('#drawers .drawer').forEach(function (b) {
    var on = d && ((b.dataset.drawer && b.dataset.drawer === d.id) || (b.dataset.special && b.dataset.special === d.id));
    if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
  });
}

/* ============================================================================
   12. PAPER — the grain, painted once
   ========================================================================== */

function makeGrain(size, alpha, warm) {
  var c = document.createElement('canvas');
  c.width = c.height = size;
  var g = c.getContext('2d');
  var img = g.createImageData(size, size);
  var r = rngFor('grain' + size + alpha);
  for (var i = 0; i < img.data.length; i += 4) {
    var v = r();
    var n = 128 + (v - 0.5) * 255;
    img.data[i] = clamp(n + warm * 14, 0, 255);
    img.data[i + 1] = clamp(n + warm * 6, 0, 255);
    img.data[i + 2] = clamp(n - warm * 8, 0, 255);
    img.data[i + 3] = alpha;
  }
  g.putImageData(img, 0, 0);
  /* a few long fibres, the way rag paper looks under a lens */
  g.strokeStyle = 'rgba(120,96,60,0.16)';
  g.lineWidth = 1;
  for (var k = 0; k < size / 3; k++) {
    var x = r() * size, y = r() * size, a = r() * Math.PI * 2, l = 3 + r() * 14;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  return 'url(' + c.toDataURL('image/png') + ')';
}

/* ============================================================================
   13. BOOT
   ========================================================================== */

function boot() {
  var t0 = performance.now();
  Promise.all(['content.json', 'graph.json', 'communities.json', 'provenance.json'].map(function (f) {
    return fetch(f).then(function (r) {
      if (!r.ok) throw new Error(f + ' ' + r.status);
      return r.json();
    });
  })).then(function (res) {
    D.content = res[0]; D.graph = res[1]; D.com = res[2]; D.prov = res[3];
    try {
      document.documentElement.style.setProperty('--grain', makeGrain(128, 16, 1));
      document.documentElement.style.setProperty('--grain-paper', makeGrain(160, 22, 1.5));
    } catch (e) { /* no canvas: the paper is simply smoother */ }
    buildIndex();
    renderRail();
    renderKeycard();
    wire();
    render();
    markRail();
    window.addEventListener('hashchange', markRail);
    $('#app').hidden = false;
    var b = $('#boot');
    b.classList.add('gone');
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 520);
    window.__HERB_READY__ = true;
    window.__HERB_BOOT_MS__ = Math.round(performance.now() - t0);
  }).catch(function (err) {
    var b = $('#boot');
    if (b) b.innerHTML = '<p class="boot-t">The cabinet is locked</p><p class="boot-s">' + esc(err.message) + '</p>';
    throw err;
  });
}

/* the harness pokes at these */
window.__HERB__ = {
  spec: function (s) { return specimen(s, 'full'); },
  index: IDX,
  totals: function () { return IDX.totals; }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
