/* ============================================================
   THE LONG WAY THROUGH
   All 290 pages of the Strapi documentation stitched into one
   continuous dusk trail. Walking right is reading down.
   Vanilla JS + canvas + DOM. Five risograph inks, hard edges.
   Every visible number derives from a real data field.
   ============================================================ */
'use strict';

/* ---------------- inks (the five Dusk Works hexes) ---------------- */
const INKS = {
  aubergine: '#2E1A47',
  violet:    '#4945FF',
  rose:      '#FF4DA0',
  apricot:   '#FFA26B',
  cream:     '#FFF3E0'
};
const INK_DARK = '#1C0F2E'; /* aubergine double-strike */

/* ---------------- tuning ---------------- */
const WORD_PX     = 6;      /* one word of prose = 6px of trail = 1 metre */
const MIN_STRETCH = 520;    /* even a 79-word footbridge is walkable */
const WALK_V      = 340;    /* px/s */
const STRIDE_V    = 980;    /* px/s with Shift */
const GATE_RANGE  = 80;     /* px to stand "at" a gate */
const DOCK_FRAC   = 0.50;   /* round 9: the page gets the bottom half */

/* round 9 — the shape of the window, and the two ways to hold it */
const LAY_SIDE  = 0.55;     /* the trail's share of the width, side by side */
const LAY_MIN_W = 1000;     /* narrower than this and side by side folds back */
const LAY = { mode: lsGet('longway.layout') === 'side' ? 'side' : 'stack', eff: 'stack' };

/* round 9 — the weather clock walks the documentation's own calendar */
const WX_MONTH_S = 16;      /* one real month of the corpus per 16 seconds */
const WX_CLEAR   = 0.45;    /* a month this busy and the sky is clear again */
const OVERCAST_INK = mix(INKS.aubergine, INKS.cream, 0.38);
const WX = {
  months: [], quiet: 0, max: 1, first: '', last: '', idx: 0, mt: 0, state: '',
  grey: 0, wet: 0, wetness: 0, here: 1, rain: 0, k: 0, sig: 0,
  turned: 0, showers: 0, clearings: 0,
  /* MORE WEATHER (wave 3, round 2): four new fronts on the same corpus
     calendar — snow for the quiet winter months, fog for autumn's thin
     ones, a thunderstorm at the deep of a long quiet streak, and a rare
     rainbow when a shower clears under a low sun. All eased, no pops. */
  snow: 0, snowCover: 0, fog: 0, storm: 0,
  flashT: -1e9, boltNext: 0, bolts: 0, stormKey: '',
  stormUntil: 0, thunderAt: 0, dogStartled: false, wetPeak: 0,
  rbA: 0, rbAt: -1e9, rbs: 0,
  snows: 0, fogs: 0, storms: 0
};
/* fog is a bank, not a blindfold: the cap keeps path, hazards, prompts and
   the walker readable through the thickest of it */
const FOG_CAP = 0.34;
const RB_COOLDOWN = 3600;   /* a rainbow never twice in an hour of play */

/* THE SCORE'S METRIC, REDEFINED AGAIN (w5r1, the owner's own numbers made
   law: standing at word 238,022 of 306,253 he expects 77 percent, not 3):
   the music ladder percent is simply WHERE YOU STAND — the walker's
   current word position over the trail's total words, exactly the number
   the WORD x OF y odometer shows, however you got there: walking, gates,
   Tab, search. The end cairn and Land's End read 100 percent. No coverage
   bookkeeping feeds the music any more, and nothing needs persisting
   beyond position. The ground-coverage record below REMAINS as an honest
   tally (probes and the pack still read it) but the score no longer does. */
const COV_SEG = 64;                     /* one ground segment, in px */
const COV = { n: 0, x0: 10, x1: 0, bits: null, covered: 0 };
function covInit() {
  COV.x1 = M.totalPx;
  for (const st of M.waymarks) if (st.kind === 'end') COV.x1 = Math.min(COV.x1, st.x);
  COV.n = Math.max(1, Math.ceil((COV.x1 - COV.x0) / COV_SEG));
  COV.bits = new Uint8Array(COV.n);
  const kept = lsJSON('longway.cov.v1', null);
  if (kept && kept.n > 0 && typeof kept.b === 'string') {
    try {
      const raw = atob(kept.b);
      for (let i = 0; i < kept.n; i++) {
        if (!((raw.charCodeAt(i >> 3) >> (i & 7)) & 1)) continue;
        if (kept.n === COV.n) { COV.bits[i] = 1; continue; }
        /* the corpus changed shape: each kept segment is an INTERVAL of
           trail, so it maps onto the whole run of new segments it spans —
           the walked share survives by proportion, upsampled or down */
        const a0 = Math.min(COV.n - 1, Math.floor(i * COV.n / kept.n));
        const a1 = Math.min(COV.n - 1, Math.max(a0, Math.ceil((i + 1) * COV.n / kept.n) - 1));
        for (let j = a0; j <= a1; j++) COV.bits[j] = 1;
      }
    } catch (e) { /* a torn record starts the count over; it never crashes */ }
  }
  COV.covered = 0;
  for (let i = 0; i < COV.n; i++) COV.covered += COV.bits[i];
}
function covMark(a, b) {
  if (!COV.bits) return;
  const lo = clamp(Math.min(a, b), COV.x0, COV.x1);
  const hi = clamp(Math.max(a, b), COV.x0, COV.x1);
  const i0 = clamp(Math.floor((lo - COV.x0) / COV_SEG), 0, COV.n - 1);
  const i1 = clamp(Math.floor((hi - COV.x0) / COV_SEG), 0, COV.n - 1);
  let grew = false;
  for (let i = i0; i <= i1; i++) {
    if (!COV.bits[i]) { COV.bits[i] = 1; COV.covered++; grew = true; }
  }
  if (grew) queueSave();
}
function covShare() { return COV.n ? COV.covered / COV.n : 0; }
function covB64() {
  if (!COV.bits) return '';
  const bytes = new Uint8Array((COV.n + 7) >> 3);
  for (let i = 0; i < COV.n; i++) if (COV.bits[i]) bytes[i >> 3] |= 1 << (i & 7);
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
  return btoa(out);
}

/* round 9 — standing still, in three eased stages */
const SLEEP_T1 = 30, SLEEP_T2 = 60, SLEEP_T3 = 120;   /* seconds of stillness */
const SLP = {
  stage: 0, t: 0, k: 0, startle: 0, waking: false, onBench: false, seatDX: 0,
  /* w5r1 — SHE SITS ON THE FURNITURE: which seat (its height off the
     ground and the way it faces her) and how far she has walked toward
     it. seatH is the seat top in px above the ground line; seatFace is 0
     for a bench she may face either way and ±1 for a seat that faces its
     table; dxNow eases from 0 to seatDX at walking pace — the step or
     two to the seat — and reduced motion holds it at seatDX. */
  seatH: 20, seatFace: 0, dxNow: 0,
  snoreAt: 0, dogSnoreAt: 0, snores: 0, dogSnores: 0, stages: 0, wakes: 0, rIdle: 0
};
/* SOMETIMES, INSTEAD OF SLEEPING, SHE PLAYS (wave 3, round 2): roughly one
   idle in five or six — never twice in a row — the settle becomes a small
   performance: she sits, takes a kalimba or a tin whistle from the pack,
   and the music-box voice plays a quiet solo in the seed of the stretch
   she sits in. Twenty to thirty seconds, then she puts it away and dozes
   as usual. Any input stops it mid-phrase with one apologetic note. */
const PERF = {
  on: false, t: 0, dur: 0, k: 0, inst: '', seed: '',
  chances: 0, count: 0, last: false, interrupted: 0, force: false,
  putaway: 0
};
const PERF_CHANCE = 1 / 5.5;

/* FURNITURE BREATHES (wave 3, round 2): the placement-spacing law. A
   walker step is the gait's own step — her legs pass each other once
   every π of phase, and phase is x/26, so one step covers π·26 ≈ 82 px
   of trail. Ten of those breathe between interactables wherever the
   stretch has the room; a stretch too short for its own furniture spreads
   the pieces evenly instead, which is the most breath it can hold. The
   reading dock keeps the true block order either way. */
const STEP_PX = Math.PI * 26;                 /* one walker step, measured */
const BREATHE_STEPS = 10;
const BREATHE_PX = Math.round(BREATHE_STEPS * STEP_PX);   /* ≈ 817 px */

/* living-trail tuning */
/* w5r2 — THE MOUNTAINS GROW (owner, on the Breaking Changes summit:
   "c'est pas très haut quand même"): the climb/descent AMPLITUDE is
   tripled, 84 -> 252. The data law is untouched — altitude still follows
   citations, log-scaled against the most-cited page — only the scale of
   the relief changes. Everything that stands on the ground reads gYAt(),
   so furniture, hazards, labels, dock and walker ride the steeper ground
   for free; the camera still absorbs CAM_K of your own climb, and the
   ridge parallax (rShift) scales with it. The gait stays a feel: the
   stride/lean clamps in the walker options already bound tripled slopes. */
const EMAX        = 252;    /* highest crest in px — the most-cited stretch */
const ELEV_BLEND  = 340;    /* border zone where neighbouring elevations meet */
const CAM_K       = 0.6;    /* how much of your own climb the camera absorbs */
const CYCLE_S     = 300;    /* one full day of sky = five minutes */
const DAY_SPEEDS  = [1, 6, 0];
const DAY_SPEED_NAMES = ['1×', '6×', 'PAUSED'];
const DAY_EPS     = 1e-4;   /* weight resolution: below one ink unit, no plates */
const FRONT_DUR   = 4.4;    /* a weather front takes seconds, eased both ways */
const JUMP_DUR    = 0.52, BOUNCE_DUR = 0.62, STUMBLE_DUR = 0.6;
const HZ_EDGE     = 26;        /* the barrier holds you this far from its post */
const HZ_PROMPT_T = 0.5;       /* the beat of being blocked before the sign speaks */
const JUMP_CARRY_V = 190;      /* px/s the space-bar jump carries you over the bar */
const SEASON_DAYS = [31, 92, 240];   /* spring | summer | autumn | winter */
const SEASON_NAMES = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'];
const BUBBLE_RANGE = 110, BUBBLE_LIFE = 4.6, BUBBLE_PAIR_CD = 75, BUBBLE_GAP = 7;
/* THE TYPE GROWS (prepolish5, owner order: the in-game type was a shade
   small). Every canvas and UI text scales by 1.5 — signposts, waymarkers,
   walker names, bubbles, the panels, the HUD — EXCEPT the reading strip:
   the documentation text keeps its reading size. Canvas text takes the
   factor here, in one place, so the label collision plan measures the
   same glyphs it paints. */
const TYPE_SCALE = 1;   // owner: the x1.5 sweep was worse than before - world type back to its original size

/* THE WAYS OFF THE TRAIL, PLACED DEEP (wave 4, round 2 — owner order):
   no crossing of any kind may stand within the first fifteen pages of
   walking, and the village kiosk stands around the twentieth page. */
const PORTAL_MIN_PAGE = 15;        /* first page index a crossing may hold */
const KIOSK_PAGE_LO = 18, KIOSK_PAGE_HI = 25;   /* the kiosk's lawful window */

/* the living-trail wave, round 4 */
const REG_RANGE = 78;          /* px to stand at a register box */
const TICKET_RANGE = 96;       /* px to stand at a signpost's ranger ticket */
const LOOK_RANGE = 90;         /* px to stand at an orientation table */
const MILE_WORDS = 10000;      /* one carved stone per 10,000 words */
const MOON_FULL_DAYS = 7;      /* tended this week = full moon */
const MOON_NEW_DAYS = 240;     /* untended this long = new moon (winter's own edge) */
const GH_EDIT = 'https://github.com/strapi/documentation/edit/main/docusaurus/';
const GH_ISSUE = 'https://github.com/strapi/documentation/issues/new';
const FEEDBACK_URL = 'https://n8n.tools.strapi.team/webhook/docs-feedback';
/* ROUND 11 — THE REGISTER DOES NOT SHOUT AT A WALL.
   The webhook that carries a register line home only answers the published
   origin. Posting to it from a local preview cannot succeed — the browser
   refuses the response before the handler ever sees it — and each attempt
   printed two CORS errors to the console: the only console errors in the
   whole build. So the ink is not sent from a local origin at all. The pen
   still scratches, the line still goes into the box for the visit, and the
   panel still says the ink is drying; nothing about the walk changes, and
   the moment this trail is served from anywhere but a loopback the line
   goes out exactly as it always did. */
const LOCAL_ORIGIN = (() => {
  try {
    const h = location.hostname;
    return location.protocol === 'file:' || h === 'localhost' || h === '127.0.0.1' ||
           h === '::1' || h === '0.0.0.0' || h === '' || /\.local$/.test(h);
  } catch (e) { return true; }
})();
const CAIRN_KINDS = ['note', 'info', 'callout', 'strapi', 'prerequisites'];
const SIL_NAMES = { A: 'A', B: 'B', C: 'C' };
const ACC_LIST = [
  { id: 'crown', label: 'FLOWER CROWN' },
  { id: 'glasses', label: 'GLASSES' },
  { id: 'hat', label: 'HAT' },
  { id: 'scarf', label: 'SCARF' }
];

const REDUCED = (typeof matchMedia === 'function') &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- tiny utils ---------------- */
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rngFor(s) { return mulberry32(hashStr(s)); }
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function lerp(a, b, t) { return a + (b - a) * t; }
function hex2rgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function col2rgb(c) { /* hex or rgb(...) — grading chains flat overprints */
  if (c[0] === '#') return hex2rgb(c);
  const m = c.match(/[\d.]+/g);
  return [+m[0], +m[1], +m[2]];
}
function mix(h1, h2, t) { /* flat overprint of two inks — still a hard colour */
  const a = col2rgb(h1), b = col2rgb(h2);
  return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;
}
const NUM_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'eleven', 'twelve'];
function numw(n) { return n >= 0 && n <= 12 ? NUM_WORDS[n] : fmt(n); }
function capFirst(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
function stripTags(s) { return String(s).replace(/<[^>]*>/g, ' '); }
function countWords(s) {
  const m = stripTags(s).trim().split(/\s+/).filter(Boolean);
  return m.length;
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private window etc. */ } }

/* ---------------- model ---------------- */
const M = {
  pages: [],            /* trail order */
  bySlug: new Map(),
  totalPx: 0,
  totalWords: 0,
  communities: [],
  commOf: new Map(),    /* slug -> community index (or -1) */
  inboundSrc: new Map(),/* target slug -> [source slugs] */
  authorsTotal: 0,
  maxCommits: 1,
  maxCare: 1,
  staged: null,         /* the page where the most ways meet (derived) */
  nightPages: 0,
  lanternsTotal: 0,
  maxIn: 1,             /* most-cited page — crests the highest hill */
  authorAgg: new Map(), /* name -> { pages, top } across the whole trail */
  hazTotal: 0,          /* caution/warning/danger admonitions on the trail */
  sprTotal: 0,          /* tip admonitions — the springs */
  terrTotal: 0,         /* cards blocks — the terraces */
  cardTotal: 0,         /* actual cards served across all terraces */
  maxOut: 1,            /* most outward-linking page — the windiest stretch */
  zeroIn: 0,            /* stretches no page cites — where the mist rests */
  edgeCount: 0,         /* citation doors on the whole trail */
  furnCounts: { boardwalk: 0, picnic: 0, cairn: 0, milepost: 0, frame: 0 },
  waymarks: [],
  mileStones: 0,
  borderStones: 0,
  commEdges: [],        /* per community: its internal citation edges (index pairs) */
  sniffMin: 9e9,        /* inbound count that makes a door worth the dog's nose */
  yipMin: 9e9,          /* …and the rarer door she thinks is worth saying so about */
  overlooks: 0,
  now: Date.now()
};

/* which piece of quiet furniture a top-level block earns (one per block) */
function furnKindOf(b) {
  if (!b || typeof b === 'string') return null;
  if (b.t === 'endpoint') return 'milepost';
  if (b.t === 'admonition') return CAIRN_KINDS.includes(b.kind || 'note') ? 'cairn' : null;
  if (b.t === 'cards') return null;
  const has = (bb, t, d) => {
    if (!bb || typeof bb === 'string' || d > 4) return false;
    if (bb.t === t) return true;
    if (bb.t === 'admonition') return false;
    for (const c of bb.blocks || []) if (has(c, t, d + 1)) return true;
    for (const tb of bb.tabs || []) for (const c of tb.blocks || []) if (has(c, t, d + 1)) return true;
    for (const col of bb.cols || []) for (const c of col) if (has(c, t, d + 1)) return true;
    return false;
  };
  if (has(b, 'code', 0)) return 'boardwalk';
  if (has(b, 'table', 0)) return 'picnic';
  if (has(b, 'img', 0)) return 'frame';
  return null;
}

function blockWords(b) {
  if (b == null) return 0;
  if (typeof b === 'string') return countWords(b);
  let w = 0;
  if (b.html) w += countWords(b.html);
  if (b.text) w += countWords(b.text);
  if (b.code) w += b.code.split(/\s+/).filter(Boolean).length;
  if (b.desc) w += countWords(b.desc);
  if (b.description) w += countWords(b.description);
  if (b.summary) w += countWords(b.summary);
  if (b.title && typeof b.title === 'string') w += countWords(b.title);
  if (Array.isArray(b.head)) for (const c of b.head) w += countWords(c);
  if (Array.isArray(b.rows)) for (const r of b.rows) for (const c of r) w += countWords(c);
  if (Array.isArray(b.items)) for (const it of b.items) w += blockWords(it);
  if (Array.isArray(b.blocks)) for (const c of b.blocks) w += blockWords(c);
  if (Array.isArray(b.tabs)) for (const t of b.tabs) { for (const c of (t.blocks || [])) w += blockWords(c); }
  if (Array.isArray(b.cols)) for (const col of b.cols) for (const c of col) w += blockWords(c);
  if (Array.isArray(b.params)) for (const p of b.params) w += countWords(p.desc || '') + 2;
  return w;
}

/* FURNITURE BREATHES, LABELS NEVER COLLIDE — law (1), the placement half.
   Every piece of interactable furniture a stretch grew (signpost, register,
   gates, terraces, block furniture, the orientation table) is spread along
   the stretch so that at least BREATHE_PX — about ten walker steps — stands
   between any two, whenever the stretch is long enough to hold that. A
   stretch too dense for the full breath spreads its pieces evenly across
   its whole span instead, which is the widest spacing the data allows: the
   pieces are the corpus's own (every gate is a real citation), so none may
   be dropped. Order along the trail is preserved — the reading dock's
   block order is untouched by any of this. */
function spreadFurniture(p) {
  const pieces = [];
  pieces.push({ x: p.signX, set: (v) => { p.signX = v; p.regX = Math.max(p.regX, v); } });
  pieces.push({ x: p.regX, set: (v) => { p.regX = v; } });
  for (const g of p.gates) pieces.push({ x: g.x, set: ((gg) => (v) => { gg.x = v; })(g) });
  for (const tr of p.terraces) pieces.push({ x: tr.x, set: ((tt) => (v) => { tt.x = v; })(tr) });
  for (const f of p.furn) pieces.push({ x: f.x, set: ((ff) => (v) => { ff.x = v; })(f) });
  if (p.overlook) pieces.push({ x: p.overlook.x, set: (v) => { p.overlook.x = v; } });
  const n = pieces.length;
  if (n < 2) return;
  pieces.sort((a, b) => a.x - b.x);
  /* 120-px edge margins double as the cross-border half of the law: two
     pieces on either side of a stretch border keep at least 240 px */
  const lo = p.start + 120, hi = p.start + p.len - 120;
  const room = hi - lo;
  const gap = Math.min(BREATHE_PX, room / (n - 1));
  const xs = pieces.map(q => q.x);
  if (room <= gap * (n - 1) + 1) {
    /* the stretch is exactly as wide as its furniture needs: even spread */
    for (let i = 0; i < n; i++) xs[i] = lo + (room * i) / (n - 1);
  } else {
    /* keep each piece near its own block where possible; push east, then
       relax west, so every neighbouring pair ends at least `gap` apart */
    xs[0] = clamp(xs[0], lo, hi - gap * (n - 1));
    for (let i = 1; i < n; i++) xs[i] = clamp(Math.max(xs[i], xs[i - 1] + gap), lo, hi);
    for (let i = n - 2; i >= 0; i--) xs[i] = Math.min(xs[i], xs[i + 1] - gap);
    for (let i = 0; i < n; i++) xs[i] = clamp(xs[i], lo, hi);
  }
  for (let i = 0; i < n; i++) pieces[i].set(xs[i]);
  p.gates.sort((a, b) => a.x - b.x);
}

function buildModel(content, graph, communities, provenance, trailOrder) {
  /* THE TRAIL WALKS THE SIDEBAR (owner order): trail-order.json is the
     single source of the walking order — the documentation's own sidebar
     order, opening at the Quick Start Guide, CMS then Cloud then the short
     footer annex ending at whats-new, non-sidebar sub-pages riding just
     after their path parent. /cms/intro and the release-notes pages are
     EXCLUDED entirely: not walked, not indexed, not searchable here. Every
     completeness law downstream (the cairn's 100 percent, the index count,
     the sweep) derives from M.pages and so speaks the walked count. */
  M.excluded = new Set((trailOrder && trailOrder.excluded) || []);
  const walkOrder = (trailOrder && Array.isArray(trailOrder.order) && trailOrder.order.length)
    ? trailOrder.order.filter(sl => content.pages[sl])
    : content.order.filter(sl => !M.excluded.has(sl));

  M.communities = communities.map((c, i) => ({ ...c, idx: i }));
  communities.forEach((c, i) => c.members.forEach(m => M.commOf.set(m, i)));

  /* the sea below Land's End keeps the WHOLE documentation — the walked
     pages and the ones the walk retired alike; each light keeps its page's
     real numbers (the archived Working Sea's parting gift). */
  M.sea = content.order.filter(sl => content.pages[sl]).map(sl => ({
    slug: sl,
    words: graph.words[sl] || 30,
    commits: (provenance[sl] && provenance[sl].commits) || 1,
    inC: graph.inbound[sl] | 0,
    comm: M.commOf.has(sl) ? M.commOf.get(sl) : -1
  }));

  const authors = new Set();
  for (const [slug, v] of Object.entries(provenance)) {
    (v.authors || []).forEach(a => {
      authors.add(a);
      if (!M.authorAgg.has(a)) M.authorAgg.set(a, { pages: 0, top: 0 });
      const ag = M.authorAgg.get(a);
      ag.pages++;
      if (v.topAuthor === a) ag.top++;
    });
    if (v.commits > M.maxCommits) M.maxCommits = v.commits;
    if (v.careDays > M.maxCare) M.maxCare = v.careDays;
    if (v.night > 0) { M.nightPages++; M.lanternsTotal += v.night; }
  }
  M.authorsTotal = authors.size;
  for (const s of Object.keys(graph.inbound)) {
    if (graph.inbound[s] > M.maxIn) M.maxIn = graph.inbound[s];
  }
  for (const s of Object.keys(graph.outbound)) {
    if (graph.outbound[s] > M.maxOut) M.maxOut = graph.outbound[s];
  }
  M.edgeCount = graph.edges.length;

  for (const [src, tgt] of graph.edges) {
    if (!M.inboundSrc.has(tgt)) M.inboundSrc.set(tgt, []);
    M.inboundSrc.get(tgt).push(src);
  }

  let x = 0, cw = 0;
  for (const slug of walkOrder) {
    const pg = content.pages[slug];
    if (!pg) continue;
    const words = graph.words[slug] || Math.max(30, blockWords({ blocks: pg.blocks }));
    const len = Math.max(MIN_STRETCH, words * WORD_PX);
    const prov = provenance[slug] || { commits: 1, authors: [], topAuthor: '', first: '', last: '', night: 0, careDays: 0 };
    const comm = M.commOf.has(slug) ? M.commOf.get(slug) : -1;

    /* block boundaries: walking distance through a block matches its share of the prose */
    const weights = pg.blocks.map(b => Math.max(10, blockWords(b)));
    const sum = weights.reduce((a, b) => a + b, 0) || 1;
    const fracs = [0];
    let acc = 0;
    for (const w of weights) { acc += w; fracs.push(acc / sum); }

    const cleanTitle = String(pg.title || slug).replace(/\s*[-\u2013|]\s*Strapi\s+(Developer\s+)?Doc(s|umentation).*$/i, '');
    const inC = (graph.inbound[slug] | 0);

    /* elevation: the more pages cite a stretch, the higher it crests (log) */
    const elev = EMAX * Math.log(1 + inC) / Math.log(1 + M.maxIn);

    /* ground season = the stretch's own freshness (days since last commit) */
    const ageDays = prov.last ? Math.max(0, Math.round((M.now - Date.parse(prov.last)) / 864e5)) : 9999;
    const season = ageDays <= SEASON_DAYS[0] ? 0 : ageDays <= SEASON_DAYS[1] ? 1 :
      ageDays <= SEASON_DAYS[2] ? 2 : 3;

    /* hazards, springs, terraces \u2014 straight from this page's own blocks */
    const hazards = [], springs = [], terraces = [];
    pg.blocks.forEach((b, bi) => {
      if (!b || typeof b === 'string') return;
      const bx = x + clamp((fracs[bi] + fracs[bi + 1]) / 2 * len, 60, len - 60);
      if (b.t === 'admonition') {
        const kind = b.kind || 'note';
        if (kind === 'caution' || kind === 'warning' || kind === 'danger') {
          hazards.push({ x: bx, kind, cd: 0 });
          M.hazTotal++;
        } else if (kind === 'tip') {
          springs.push({ x: bx, cd: 0 });
          M.sprTotal++;
        }
      } else if (b.t === 'cards' && (b.items || []).length) {
        /* keep the stand clear of both signposts; the board leans east */
        terraces.push({ x: x + clamp((fracs[bi] + fracs[bi + 1]) / 2 * len, 240, len - 240), items: b.items, bi });
        M.terrTotal++;
        M.cardTotal += b.items.length;
      }
    });

    /* quiet furniture: each top-level block earns at most one piece */
    const furn = [];
    pg.blocks.forEach((b, bi) => {
      const kind = furnKindOf(b);
      if (!kind) return;
      const fx = x + clamp((fracs[bi] + fracs[bi + 1]) / 2 * len, 200, len - 90);
      furn.push({ x: fx, kind, label: kind === 'milepost' ? String(b.method || 'API').toUpperCase() : '' });
      M.furnCounts[kind]++;
    });

    const page = {
      slug, title: cleanTitle, label: pg.sidebarLabel || cleanTitle,
      file: pg.file || '',
      description: pg.description || '', section: pg.section || '', product: pg.product || '',
      blocks: pg.blocks, fracs,
      words, start: x, len, cumWords: cw,
      comm, prov,
      idx: M.pages.length,
      inCount: inC,
      outCount: (graph.outbound[slug] | 0),
      elev, ageDays, season,
      hazards, springs, terraces, furn,
      stones: [],
      signX: 0, regX: 0,
      overlook: null,
      isHub: false, gates: null /* lazy */
    };
    M.pages.push(page);
    M.bySlug.set(slug, page);
    x += len; cw += words;
  }
  M.totalPx = x;
  M.totalWords = cw;   /* the words of the WALKED trail (287 pages' worth) */

  for (const c of M.communities) {
    const hp = M.bySlug.get(c.hub);
    if (hp) hp.isHub = true;
  }

  /* the staged signature page = the page the most real paths lead to */
  let best = null;
  for (const p of M.pages) if (!best || p.inCount > best.inCount) best = p;
  M.staged = best;

  /* gates: one per real citation edge, standing at the block that cites it */
  for (const [src, tgt] of graph.edges) {
    const sp = M.bySlug.get(src);
    if (!sp || !M.bySlug.get(tgt)) continue;
    if (!sp.gates) sp.gates = [];
    sp.gates.push({ tgt, x: -1 });
  }
  for (const p of M.pages) {
    if (!p.gates) { p.gates = []; continue; }
    const blobs = p.blocks.map(b => JSON.stringify(b));
    for (const g of p.gates) {
      let bi = -1;
      const needle = '#' + g.tgt + '\\"';
      const needle2 = '#' + g.tgt + '"';
      for (let i = 0; i < blobs.length; i++) {
        if (blobs[i].indexOf(needle) >= 0 || blobs[i].indexOf(needle2) >= 0) { bi = i; break; }
      }
      let frac;
      if (bi >= 0) frac = (p.fracs[bi] + p.fracs[bi + 1]) / 2;
      else frac = 0.12 + 0.76 * (hashStr(p.slug + '>' + g.tgt) % 1000) / 1000;
      g.x = p.start + clamp(frac * p.len, 46, p.len - 46);
    }
    p.gates.sort((a, b) => a.x - b.x);
    /* the old 92-px de-twinning is superseded by the spacing law below
       (spreadFurniture), which also fixes the collapse it used to cause
       at the east end of a crowded stretch */
  }

  /* signposts and register boxes: fixed places, no lazy terrain needed */
  M.autumnPages = 0;
  for (const p of M.pages) {
    p.signX = p === M.staged ? p.start + 210 : p.start + 26;
    p.regX = p.signX + 118;
    if (p.inCount === 0) M.zeroIn++;
    if (p.season === 2) M.autumnPages++;
  }

  /* the waymarkers: carved stones at real corpus milestones */
  const xAtWord = (wq) => {
    let lo = 0, hi = M.pages.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (M.pages[mid].cumWords <= wq) lo = mid; else hi = mid - 1;
    }
    const p = M.pages[lo];
    return p.start + clamp((wq - p.cumWords) / p.words, 0, 1) * p.len;
  };
  for (let k = MILE_WORDS; k < M.totalWords; k += MILE_WORDS) {
    M.waymarks.push({ x: xAtWord(k), kind: 'mile', l1: fmt(k), l2: 'WORDS OF TRAIL' });
    M.mileStones++;
  }
  let prevComm = null;
  for (const p of M.pages) {
    if (p.comm !== prevComm) {
      if (p.comm >= 0) {
        const c = M.communities[p.comm];
        M.waymarks.push({
          x: Math.max(8, p.start - 34), kind: 'border',
          l1: 'ENTERING ' + String(c.dominant || '').toUpperCase(),
          l2: 'POP. ' + fmt(c.size) + ' PAGES'
        });
        M.borderStones++;
      }
      prevComm = p.comm;
    }
  }
  const halfWords = Math.floor(M.totalWords / 2);
  M.halfWords = halfWords;
  M.waymarks.push({
    x: xAtWord(M.totalWords / 2), kind: 'half',
    l1: 'THE HALFWAY STONE',
    l2: fmt(halfWords) + ' WORDS BEHIND · ' + fmt(M.totalWords - halfWords) + ' AHEAD'
  });
  M.waymarks.push({
    x: M.totalPx - 52, kind: 'end',
    l1: 'THE END CAIRN',
    l2: fmt(M.pages.length) + ' PAGES · ' + fmt(M.totalWords) + ' WORDS WALKED WHOLE'
  });
  M.waymarks.sort((a, b) => a.x - b.x);
  for (const st of M.waymarks) pageAt(clamp(st.x, 0, M.totalPx - 1)).stones.push(st);

  /* the overlooks: each hub keeps a bench and an orientation table
     naming the real pages it cites, at most seven landmarks a table */
  for (const c of M.communities) {
    const hp = M.bySlug.get(c.hub);
    if (!hp) continue;
    const seen = new Set();
    const lm = [];
    for (const g of hp.gates) {
      if (seen.has(g.tgt)) continue;
      seen.add(g.tgt);
      const tp = M.bySlug.get(g.tgt);
      if (tp) lm.push(tp.slug);
    }
    lm.sort((a, b) => M.bySlug.get(b).inCount - M.bySlug.get(a).inCount);
    hp.overlook = { x: hp.start + hp.len * 0.55, comm: c.idx, landmarks: lm.slice(0, 7) };
    M.overlooks++;
  }

  /* THE OVERLOOKS MUST BE FINDABLE (wave 3, round 2): a carved fingerpost
     OVERLOOK AHEAD stands a couple of screens before each orientation
     table, in the waymarker idiom, clamped inside the hub's own stretch. */
  for (const c of M.communities) {
    const hp = M.bySlug.get(c.hub);
    if (!hp || !hp.overlook) continue;
    hp.overlook.postX = Math.max(hp.start + 120, hp.overlook.x - 2200);
  }

  /* FURNITURE BREATHES: the placement-spacing law, run over every stretch
     once all the pieces stand. Ten walker steps between interactables
     wherever the stretch holds the room; even spread where it cannot. */
  for (const p of M.pages) spreadFurniture(p);

  /* THE RELIEF, AT LAST — RIVERS (wave 3): where a strong cross-community
     citation stream passes, a river crosses the trail at that pair's
     FIRST shared border, and a plank footbridge carries the walker over.
     The water is sized by the stream (how many citations cross between
     the two communities) and the bridge plaque names the strongest
     single crossing — the slug pair — in the waymarker hand. Derived
     from graph.edges, never invented; no mechanic rides on the water. */
  const RIVER_MIN_STREAM = 8;
  const xStream = new Map();
  for (const [rsrc, rtgt] of graph.edges) {
    const sa = M.commOf.has(rsrc) ? M.commOf.get(rsrc) : -1;
    const sb = M.commOf.has(rtgt) ? M.commOf.get(rtgt) : -1;
    if (sa < 0 || sb < 0 || sa === sb) continue;
    if (!M.bySlug.get(rsrc) || !M.bySlug.get(rtgt)) continue;
    const k = Math.min(sa, sb) + ':' + Math.max(sa, sb);
    if (!xStream.has(k)) xStream.set(k, { n: 0, edges: [] });
    const st = xStream.get(k);
    st.n++; st.edges.push([rsrc, rtgt]);
  }
  M.rivers = [];
  for (let ri = 0; ri + 1 < M.pages.length; ri++) {
    const pa = M.pages[ri], pb = M.pages[ri + 1];
    if (pa.comm < 0 || pb.comm < 0 || pa.comm === pb.comm) continue;
    const k = Math.min(pa.comm, pb.comm) + ':' + Math.max(pa.comm, pb.comm);
    const st = xStream.get(k);
    if (!st || st.n < RIVER_MIN_STREAM || st.placed) continue;
    st.placed = true;
    /* the plaque names the crossing the corpus leans on hardest: the
       edge whose target is the most cited (ties broken by slug, so the
       same corpus always carves the same board) */
    let e = st.edges[0];
    for (const cand of st.edges) {
      const cIn = M.bySlug.get(cand[1]).inCount, eIn = M.bySlug.get(e[1]).inCount;
      if (cIn > eIn || (cIn === eIn && (cand[1] < e[1] || (cand[1] === e[1] && cand[0] < e[0])))) e = cand;
    }
    let half = clamp(45 + st.n * 1.7, 50, 100);
    /* the water yields to whatever already stands on its banks — except
       the border stone, which steps up ONTO the bank instead: a waymarker
       belongs at a bridge end, not mid-stream */
    for (const q of [pa, pb]) {
      const xs2 = [q.signX, q.regX];
      for (const g of q.gates) xs2.push(g.x);
      for (const t2 of q.terraces) xs2.push(t2.x);
      for (const f2 of q.furn) xs2.push(f2.x);
      for (const hz of q.hazards) xs2.push(hz.x);
      for (const sp2 of q.springs || []) xs2.push(sp2.x);
      for (const x2 of xs2) {
        const d = Math.abs(x2 - pb.start);
        if (d < half + 26) half = Math.max(42, Math.min(half, d - 26));
      }
    }
    for (const q of [pa, pb]) {
      for (const st2 of q.stones) {
        if (Math.abs(st2.x - pb.start) < half + 14) {
          st2.x = st2.x <= pb.start ? pb.start - half - 18 : pb.start + half + 18;
        }
      }
    }
    M.rivers.push({ x: pb.start, half, n: st.n, a: Math.min(pa.comm, pb.comm),
      b: Math.max(pa.comm, pb.comm), src: e[0], tgt: e[1] });
  }
  /* the stones that stepped aside keep the walk's order */
  M.waymarks.sort((a2, b2) => a2.x - b2.x);
  for (const p2 of M.pages) p2.stones.sort((a2, b2) => a2.x - b2.x);

  /* THE HUBS RISE ON THE HORIZON: silhouette variants dealt in trail
     order, so two neighbouring hubs never share a shape (eight shapes,
     dealt one at a time down the trail), and each hub keeps its own. */
  M.lmVar = new Map();
  M.communities
    .map(c2 => ({ ci: c2.idx, hp: M.bySlug.get(c2.hub) }))
    .filter(o => o.hp)
    .sort((a2, b2) => a2.hp.start - b2.hp.start)
    .forEach((o, i2) => M.lmVar.set(o.ci, i2 % 8));
  /* the fingerpost keeps clear of whatever the spread settled on — and a
     hub too short to hold its own approach lets the post stand on the
     trail BEFORE its border, which is where a fingerpost belongs anyway */
  for (const p of M.pages) {
    if (!p.overlook || p.overlook.postX == null) continue;
    p.overlook.postX = Math.min(p.overlook.postX, p.overlook.x - 320);
    p.overlook.postX = Math.max(p.start + 100, p.overlook.postX);
    if (p.overlook.x - p.overlook.postX < 320) {
      p.overlook.postX = Math.max(40, p.overlook.x - 320);
    }
    /* and clear of the pieces the spread settled: 140 px from any gate,
       terrace, sign, register or furniture on this stretch or the one
       before — a sign nobody can read behind a door helps nobody */
    const prev = p.idx > 0 ? M.pages[p.idx - 1] : null;
    const near = [p.signX, p.regX];
    for (const q of prev ? [p, prev] : [p]) {
      near.push(q.signX, q.regX);
      for (const g of q.gates) near.push(g.x);
      for (const t of q.terraces) near.push(t.x);
      for (const f of q.furn) near.push(f.x);
      for (const hz of q.hazards) near.push(hz.x);
      for (const sp of q.springs || []) near.push(sp.x);
      for (const st of q.stones) near.push(st.x);
    }
    for (const rv of M.rivers) near.push(rv.x);
    const clearAt = (px) => near.every(x2 => Math.abs(x2 - px) >= 140);
    let px = p.overlook.postX, tries = 0;
    while (!clearAt(px) && px > 100 && tries < 60) { px -= 60; tries++; }
    if (clearAt(px) && px >= 40) p.overlook.postX = px;
  }

  /* constellations: each community's internal citation edges, kept by index */
  const memberIdx = M.communities.map(c => new Map(c.members.map((m, i) => [m, i])));
  M.commEdges = M.communities.map(() => []);
  for (const [src, tgt] of graph.edges) {
    const ci = M.commOf.has(src) ? M.commOf.get(src) : -1;
    if (ci < 0 || M.commOf.get(tgt) !== ci) continue;
    const mi = memberIdx[ci];
    if (mi.has(src) && mi.has(tgt)) M.commEdges[ci].push([mi.get(src), mi.get(tgt)]);
  }

  /* what smells important to a dog: the top decile of cited pages */
  const ins = M.pages.map(p => p.inCount).filter(v => v > 0).sort((a, b) => a - b);
  M.sniffMin = ins.length ? ins[Math.floor(ins.length * 0.9)] : 9e9;
  /* …and the handful of doors worth a yip about: the top fiftieth */
  M.yipMin = ins.length ? ins[Math.min(ins.length - 1, Math.floor(ins.length * 0.98))] : 9e9;

  /* past the end cairn, the ground falls away to a shore (round 5) */
  buildLandsEnd();
  buildPortals();   /* the six ways off the trail, placed by the data */
}

function pageAt(x) {
  let lo = 0, hi = M.pages.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (M.pages[mid].start <= x) lo = mid; else hi = mid - 1;
  }
  return M.pages[lo];
}
function wordsAt(x) {
  const p = pageAt(clamp(x, 0, M.totalPx - 1));
  return p.cumWords + p.words * clamp((x - p.start) / p.len, 0, 1);
}
function blockIndexAt(page, x) {
  const f = clamp((x - page.start) / page.len, 0, 0.99999);
  const fr = page.fracs;
  let lo = 0, hi = fr.length - 2;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (fr[mid] <= f) lo = mid; else hi = mid - 1;
  }
  return lo;
}

/* ---------------- biome palettes ---------------- */
const NIGHT_PAL = {
  bands: [
    { c: '#0D0718', h: 0.52 },
    { c: mix('#0D0718', INKS.aubergine, 0.5), h: 0.30 },
    { c: mix(INKS.aubergine, INKS.violet, 0.16), h: 0.18 }
  ],
  sun: { fx: 0.71, fy: 0.30, rr: 21, c: INKS.cream, ring: INKS.violet },
  ridgeFar: mix('#0D0718', INKS.aubergine, 0.75),
  ridgeMid: mix('#0D0718', INKS.aubergine, 0.42),
  ridgeNear: '#0D0718',
  ground: mix('#0A0512', INKS.aubergine, 0.30),
  path: 'rgba(255,243,224,0.30)',
  ink: '#060310',
  accent: INKS.apricot,
  night: true
};

const palCache = new Map();
function paletteFor(ci, isNight) {
  if (isNight) return NIGHT_PAL;
  const key = ci;
  if (palCache.has(key)) return palCache.get(key);
  const r = rngFor('biome:' + ci);
  const dom = ci < 0 ? 1 : (ci % 3); /* 0 violet-deep, 1 rose-hot, 2 apricot-late */
  const V = INKS.violet, R = INKS.rose, A = INKS.apricot, C = INKS.cream, B = INKS.aubergine;
  let bands;
  if (dom === 0) {
    bands = [
      { c: mix(B, V, 0.55 + r() * 0.2), h: 0.30 + r() * 0.08 },
      { c: V, h: 0.22 + r() * 0.08 },
      { c: mix(V, R, 0.55), h: 0.16 },
      { c: R, h: 0.14 },
      { c: mix(R, A, 0.6), h: 0.10 },
      { c: mix(A, C, 0.25), h: 0.08 }
    ];
  } else if (dom === 1) {
    bands = [
      { c: mix(V, B, 0.35 + r() * 0.15), h: 0.24 + r() * 0.06 },
      { c: mix(V, R, 0.45), h: 0.18 },
      { c: R, h: 0.22 + r() * 0.08 },
      { c: mix(R, A, 0.5), h: 0.16 },
      { c: A, h: 0.12 },
      { c: mix(A, C, 0.35), h: 0.08 }
    ];
  } else {
    bands = [
      { c: mix(V, B, 0.2), h: 0.20 },
      { c: mix(V, R, 0.35), h: 0.16 },
      { c: mix(R, A, 0.35), h: 0.18 },
      { c: A, h: 0.24 + r() * 0.06 },
      { c: mix(A, C, 0.4), h: 0.14 },
      { c: mix(C, A, 0.25), h: 0.08 }
    ];
  }
  const pal = {
    bands,
    sun: {
      fx: 0.18 + r() * 0.64,
      fy: 0.30 + r() * 0.42,
      rr: 26 + r() * 26,
      c: dom === 2 ? A : R,
      ring: dom === 2 ? R : A
    },
    ridgeFar: dom === 2 ? mix(B, A, 0.40) : mix(B, dom === 0 ? V : R, 0.52),
    ridgeMid: mix(B, dom === 0 ? V : R, 0.26),
    ridgeNear: mix(B, INK_DARK, 0.45),
    ground: dom === 1 ? mix(B, R, 0.34) : (dom === 2 ? mix(B, A, 0.32) : mix(B, V, 0.30)),
    path: 'rgba(255,243,224,0.55)',
    ink: INK_DARK,
    accent: [R, A, V][dom],
    night: false
  };
  palCache.set(key, pal);
  return pal;
}

/* ---------------- the hour: a slow day graded inside the five inks -------
   Golden hour IS the base art — grading is identity there, so the trail
   the owner approved is one plate of this cycle, not a repaint of it.  */
const DAY = { t: 0.60, speed: 0, sig: '', dialT: -9, dialSig: '', wts: { m: 0, d: 0, g: 1, n: 0 } };
const DAWN_TINT = mix(INKS.cream, INKS.rose, 0.35);      /* pale rose morning */
const DAYLIGHT_TINT = mix(INKS.apricot, INKS.cream, 0.60); /* apricot day */
const NIGHT_TINT = '#0D0718';

function dayWeights(t) {
  /* plateaus joined by eased ramps — smoothstep, like a CSS ease-in-out */
  const seg = (a, b) => { const u = clamp((t - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  let m = 0, d = 0, g = 0, n = 0;
  if (t < 0.10) { m = 1; }
  else if (t < 0.20) { const s = seg(0.10, 0.20); m = 1 - s; d = s; }
  else if (t < 0.44) { d = 1; }
  else if (t < 0.54) { const s = seg(0.44, 0.54); d = 1 - s; g = s; }
  else if (t < 0.70) { g = 1; }
  else if (t < 0.80) { const s = seg(0.70, 0.80); g = 1 - s; n = s; }
  else if (t < 0.94) { n = 1; }
  else { const s = seg(0.94, 1.0); n = 1 - s; m = s; }
  return { m, d, g, n };
}
function nightRamp(wn) {
  /* lamps, lit windows and glows fade up with the dark, never switch */
  const u = clamp((wn - 0.42) / 0.26, 0, 1);
  return u * u * (3 - 2 * u);
}
function palAlphaOf(c) {
  const m = String(c).match(/rgba\([^,]+,[^,]+,[^,]+,([\d.]+)\)/);
  return m ? +m[1] : 1;
}
function skyColAt(p, f) {
  /* the sky colour at fraction f of the horizon, walking p's hard bands */
  const tot = p.bands.reduce((s, x) => s + x.h, 0);
  let acc = 0;
  for (const x of p.bands) { acc += x.h / tot; if (f <= acc + 1e-6) return x.c; }
  return p.bands[p.bands.length - 1].c;
}
function blendPal(a, b, k) {
  /* one biome's light eased into the next — every band edge of both skies
     is kept, so the plates stay hard while their inks glide */
  if (!a || k >= 1) return b;
  if (k <= 0) return a;
  const cuts = new Set([1]);
  const totA = a.bands.reduce((s, x) => s + x.h, 0);
  const totB = b.bands.reduce((s, x) => s + x.h, 0);
  let acc = 0;
  for (const x of a.bands) { acc += x.h / totA; cuts.add(Math.min(1, +acc.toFixed(5))); }
  acc = 0;
  for (const x of b.bands) { acc += x.h / totB; cuts.add(Math.min(1, +acc.toFixed(5))); }
  const edges = [...cuts].sort((p, q) => p - q);
  const bands = [];
  let prev = 0;
  for (const e of edges) {
    if (e - prev < 1e-4) { prev = e; continue; }
    const cen = (prev + e) / 2;
    bands.push({ c: mix(skyColAt(a, cen), skyColAt(b, cen), k), h: e - prev });
    prev = e;
  }
  const sun = (a.sun && b.sun) ? {
    fx: lerp(a.sun.fx, b.sun.fx, k), fy: lerp(a.sun.fy, b.sun.fy, k),
    rr: lerp(a.sun.rr, b.sun.rr, k), ring: mix(a.sun.ring, b.sun.ring, k)
  } : (b.sun || a.sun);
  return {
    bands, sun,
    ridgeFar: mix(a.ridgeFar, b.ridgeFar, k),
    ridgeMid: mix(a.ridgeMid, b.ridgeMid, k),
    ridgeNear: mix(a.ridgeNear, b.ridgeNear, k),
    ground: mix(a.ground, b.ground, k),
    path: 'rgba(255,243,224,' + lerp(palAlphaOf(a.path), palAlphaOf(b.path), k).toFixed(3) + ')',
    ink: mix(a.ink, b.ink, k),
    accent: mix(a.accent, b.accent, k),
    night: b.night
  };
}
function dayPhaseName(w) {
  const best = Math.max(w.m, w.d, w.g, w.n);
  return best === w.g ? 'GOLDEN HOUR' : best === w.d ? 'DAY' : best === w.n ? 'NIGHT' : 'MORNING';
}
function gradeColor(c, w) {
  let out = c;
  if (w.m > 0.001) out = mix(out, DAWN_TINT, 0.45 * w.m);
  if (w.d > 0.001) out = mix(out, DAYLIGHT_TINT, 0.42 * w.d);
  if (w.n > 0.001) out = mix(out, NIGHT_TINT, 0.85 * w.n);
  /* round 9: cloud flattens the light — one more flat overprint, never a
     wash. WX.k already carries how much light there is left to flatten. */
  if (WX.k > 0.001) out = mix(out, OVERCAST_INK, 0.38 * WX.k);
  return out;
}

const gradeCache = new Map();
function gradedPaletteFor(ci, hollow) {
  if (hollow) return NIGHT_PAL;   /* night hollows ignore the sky — data law */
  const base = paletteFor(ci, false);
  const w = DAY.wts;
  /* golden hour under a clear sky is still the original art, exactly */
  if (w.g >= 0.999 && WX.sig === 0) return base;
  const key = ci + ':' + DAY.sig + ':' + WX.sig;
  if (gradeCache.has(key)) return gradeCache.get(key);
  const pal = {
    bands: base.bands.map(b => ({ c: gradeColor(b.c, w), h: b.h })),
    sun: base.sun,
    ridgeFar: gradeColor(base.ridgeFar, w),
    ridgeMid: gradeColor(base.ridgeMid, w),
    ridgeNear: gradeColor(base.ridgeNear, w),
    ground: gradeColor(base.ground, w),
    path: 'rgba(255,243,224,' + (0.55 - 0.25 * w.n).toFixed(3) + ')',
    ink: w.n > 0.001 ? mix(INK_DARK, '#060310', w.n) : base.ink,
    accent: base.accent,
    night: false
  };
  gradeCache.set(key, pal);
  if (gradeCache.size > 240) gradeCache.delete(gradeCache.keys().next().value);
  return pal;
}

/* season-tinted, hour-graded ground colour per stretch */
const SEASON_GROUND = [
  g => mix(g, INKS.rose, 0.16),      /* spring bloom */
  g => mix(g, INKS.violet, 0.14),    /* deep summer — lush double-strike */
  g => mix(g, INKS.apricot, 0.20),   /* autumn */
  g => mix(g, INKS.cream, 0.30)      /* bare winter, frost-pale */
];
const groundColCache = new Map();
function groundColorFor(p) {
  if (p.prov.night > 0) return NIGHT_PAL.ground;
  const key = p.comm + ':' + p.season + ':' + DAY.sig + ':' + WX.sig;
  if (groundColCache.has(key)) return groundColCache.get(key);
  const base = paletteFor(p.comm, false).ground;
  const c = gradeColor(SEASON_GROUND[p.season](base), DAY.wts);
  groundColCache.set(key, c);
  if (groundColCache.size > 240) groundColCache.delete(groundColCache.keys().next().value);
  return c;
}

/* ---------------- elevation: citations raise the ground ---------------- */
let camE = 0;   /* the avatar's own elevation, absorbed by the camera */
function smoothT(t) { return t * t * (3 - 2 * t); }
function elevAt(x) {
  const p = pageAt(clamp(x, 0, M.totalPx - 1));
  let e = p.elev;
  const d0 = x - p.start, d1 = p.start + p.len - x;
  if (d0 < ELEV_BLEND && p.idx > 0) {
    const mid = (M.pages[p.idx - 1].elev + p.elev) / 2;
    e = lerp(mid, e, smoothT(clamp(d0 / ELEV_BLEND, 0, 1)));
  }
  if (d1 < ELEV_BLEND && p.idx < M.pages.length - 1) {
    const mid = (p.elev + M.pages[p.idx + 1].elev) / 2;
    e = lerp(e, mid, smoothT(clamp(1 - d1 / ELEV_BLEND, 0, 1)));
  }
  return e;
}
function gYAt(x) { return groundY + camE * CAM_K - elevAt(x); }

/* wind: the stretch's outbound links lean the grass and raise gusts */
let WIND = 0;

/* ---------------- terrain (chunked per page, LRU) ---------------- */
const FLORA_TYPES = ['pine', 'cypress', 'bush', 'grass', 'reed', 'boulder', 'palm'];
const terrainCache = new Map();
function terrainFor(pi) {
  if (terrainCache.has(pi)) { const t = terrainCache.get(pi); terrainCache.delete(pi); terrainCache.set(pi, t); return t; }
  const p = M.pages[pi];
  const r = rngFor('terrain:' + p.slug);
  const comm = p.comm >= 0 ? M.communities[p.comm] : null;
  const density = comm ? clamp(2 + comm.size / 8, 2, 9) : 2.4;      /* flora density = community size */
  const purity = comm ? comm.purity : 0.5;                           /* purity = visual coherence */
  const primary = FLORA_TYPES[(p.comm < 0 ? 3 : p.comm) % FLORA_TYPES.length];
  const secondary = FLORA_TYPES[((p.comm < 0 ? 3 : p.comm) * 3 + 2) % FLORA_TYPES.length];

  const flora = [];
  const n = Math.round(p.len / 1000 * density);
  for (let i = 0; i < n; i++) {
    flora.push({
      x: p.start + r() * p.len,
      type: r() < purity ? primary : secondary,
      s: 0.6 + r() * 0.9,
      flip: r() < 0.5,
      off: r()
    });
  }

  /* upkeep quality from careDays (max derived from the corpus) */
  const q = clamp(p.prov.careDays / M.maxCare, 0, 1);
  const benches = [];
  const nb = Math.max(p.len > 900 ? 1 : 0, Math.floor(p.len / 2400));
  for (let i = 0; i < nb; i++) {
    benches.push({
      x: p.start + p.len * (i + 0.55) / (nb + 0.4) + (r() - 0.5) * 120,
      tilt: (1 - q) * (r() * 0.22 - 0.05),
      broken: q < 0.32 && r() < 0.6,
      q
    });
  }
  const signX = p === M.staged ? p.start + 210 : p.start + 26;
  const sign = { x: signX, tilt: (1 - q) * (r() * 0.16 - 0.04), cracked: q < 0.4, q };

  /* lanterns: one per night commit on this stretch */
  const lanterns = [];
  for (let i = 0; i < (p.prov.night || 0); i++) {
    lanterns.push({ x: p.start + p.len * (i + 1) / ((p.prov.night || 0) + 1) });
  }

  /* the walkers: this stretch's real authors, with the stretch's real dates */
  const walkers = [];
  const auths = p.prov.authors || [];
  for (let i = 0; i < auths.length; i++) {
    const name = auths[i];
    const wr = rngFor('walker:' + p.slug + ':' + name);
    walkers.push({
      name,
      isTop: name === p.prov.topAuthor,
      x0: p.start + p.len * (0.12 + 0.76 * (i + wr()) / Math.max(1, auths.length)),
      speed: 26 + wr() * 30,
      h: 0.86 + wr() * 0.22,
      phase: wr() * 1000,
      dates: (p.prov.first && p.prov.last) ? `${p.prov.first} → ${p.prov.last}` : ''
    });
  }

  /* foreshadowing: warn before night ground */
  const next = M.pages[pi + 1];
  const nightAhead = next && next.prov.night > 0 ? { x: p.start + p.len - 260 } : null;

  const t = { flora, benches, sign, lanterns, walkers, nightAhead, q };
  terrainCache.set(pi, t);
  if (terrainCache.size > 18) terrainCache.delete(terrainCache.keys().next().value);
  return t;
}

/* ---------------- ridgelines: continuous, faceted, seamless ---------------- */
const RIDGE_LAYERS = [
  { f: 0.10, base: 0.545, amp: 0.115, step: 224, ph: 0.7 },
  { f: 0.30, base: 0.645, amp: 0.075, step: 168, ph: 2.3 },
  { f: 0.58, base: 0.755, amp: 0.050, step: 128, ph: 4.1 }
];
function ridgeY(li, gx) {
  const L = RIDGE_LAYERS[li];
  const a = Math.sin(gx * 0.0052 + L.ph) * 0.52 +
    Math.sin(gx * 0.0147 + L.ph * 2.7) * 0.31 +
    Math.sin(gx * 0.0361 + L.ph * 5.1) * 0.17;
  return visH * L.base - (a * 0.5 + 0.5) * visH * L.amp;
}

/* ---------------- canvas & state ---------------- */
const cv = document.getElementById('world');
const cx = cv.getContext('2d');
let W = 0, H = 0, visH = 0, horizonY = 0, groundY = 0, AVX = 0, DPR = 1;

function resize() {
  /* Round 9: the canvas IS the trail's viewport — the top half of the
     window when stacked, the left 55 % when side by side — so every
     drawn thing is composed for the room it actually has. */
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  const R = applyLayout();
  W = R.w; H = R.h;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  visH = H;
  /* re-composition: the ground keeps its band of foreground (never more
     than 140 px of it, however tall the view), the horizon keeps its
     share of the sky, and the walker keeps his place across the width */
  const foot = clamp(visH * 0.145, 44, 140);
  groundY = Math.round(visH - foot);
  horizonY = Math.round(Math.min(visH * 0.565, groundY - 96));
  AVX = Math.round(W * 0.40);
  /* the DOM band the speaking law reads has just been re-laid out with
     everything else: make it re-measure on the next spoken frame */
  try { bandT = -9; if (speaking) toastDodge(), document.body.classList.add('speaking'); }
  catch (e) { /* not built yet */ }
  needsDraw = true;
}
window.addEventListener('resize', resize);

/* where the sun stands on screen this frame, and how much of it the cloud
   has left. Set by the sky, read by the shore, so the glitter on the water
   is under the sun rather than under a fraction guessed a second time. */
let SUN_SX = -1, SUN_A = 0;

/* grain tile — printed stock, generated once */
let grainPat = null;
function makeGrain() {
  const t = document.createElement('canvas');
  t.width = 224; t.height = 224;
  const g = t.getContext('2d');
  const r = rngFor('grain');
  for (let i = 0; i < 2600; i++) {
    const a = r();
    g.fillStyle = a < 0.5 ? 'rgba(255,243,224,0.5)' : 'rgba(13,7,24,0.55)';
    g.fillRect(r() * 224, r() * 224, 1, 1);
  }
  for (let i = 0; i < 26; i++) {
    g.fillStyle = 'rgba(255,243,224,0.22)';
    g.fillRect(r() * 224, r() * 224, 1 + r() * 4, 1);
  }
  grainPat = cx.createPattern(t, 'repeat');
}

const S = {
  x: 12,               /* avatar world x */
  vx: 0,
  target: null,        /* click-to-walk-to */
  page: null,
  bi: -1,
  t: 0,
  keys: {},
  overlay: null,       /* 'index' | 'gatemap' | 'landing' */
  pal: null, palKey: '',
  front: 0,            /* weather-front progress, 1 = done */
  fromSnap: null,      /* the departed biome's last drawn light */
  fromWN: 0,
  lastWN: 0,
  nearGate: null,
  walkedWords: 0,
  lastWords: 0,
  gm: null,            /* pending gate travel */
  face: 1,             /* last walking direction */
  jumpT: null,         /* 0..1 while airborne from a jump */
  bounceT: null,       /* 0..1 while a spring carries you */
  stumbleT: null,      /* 0..1 while paying a hazard's beat (legacy clock, unused since wave 3) */
  puff: null,          /* {x, t} — landing dust, 3 held frames */
  hzBlock: null,       /* {hz, x, kind, face, since} — held at a hazard's edge */
  hzLean: 0,           /* eased 0..1: how far she leans over the drop */
  jumpCarry: 0,        /* the blocked jump carries you forward over the bar */
  nearFlower: false,   /* standing on a flowered verge (spring stretch) */
  wave: 0,             /* player waving back at a fellow walker */
  bubble: null,        /* the one active speech bubble */
  bubbleGapT: -1,      /* global quiet time between bubbles */
  nearTerrace: null,
  tr: null,            /* open terrace {page, terrace} */
  trSel: 0,
  wind: 0,             /* eased wind strength (outbound links of this stretch) */
  moonK: 1,            /* eased moon phase (freshness of this stretch) */
  nearReg: null,
  nearTicket: null,
  nearLook: null,
  enterAct: null,      /* what ENTER does here: gate | terrace | overlook */
  sweep: null,         /* scenic sweep from an overlook */
  idleT: 0,
  lk: null,            /* open overlook */
  lkSel: 0
};
const bubbleCD = new Map();    /* 'slug|name' -> earliest next greeting (S.t) */
const ambientCD = new Map();   /* walker×walker crossing cooldowns */
let frameWalkers = [];         /* visible walkers this frame, for greetings */
let needsDraw = true;

/* ---------------- diagnostics ---------------- */
window.__diag = { frameMs: 0, avgFrameMs: 0, state: 'boot' };
const frameHist = [];
function noteFrame(ms, state) {
  window.__diag.frameMs = ms;
  frameHist.push(ms);
  if (frameHist.length > 120) frameHist.shift();
  window.__diag.avgFrameMs = frameHist.reduce((a, b) => a + b, 0) / frameHist.length;
  window.__diag.state = state;
}

/* ---------------- the pack, the guide, the register, the walker -------- */
function lsJSON(k, d) {
  const raw = lsGet(k);
  if (!raw) return d;
  try { return JSON.parse(raw); } catch (e) { return d; }
}
const PACK = Object.assign(
  { leaves: {}, hollows: {}, stamps: {}, biomes: {}, visited: {}, certs: {},
    greeted: 0, walked: 0, days: 0 },
  lsJSON('longway.pack.v1', {}));
const GUIDE = Object.assign({ found: {} }, lsJSON('longway.guide.v1', {}));
const WALKER = Object.assign({ sil: 'C', acc: [] }, lsJSON('longway.walker.v1', {}));
WALKER.accSet = new Set(WALKER.acc);
WALKER.stored = !!lsGet('longway.walker.v1');
const REGBOOK = lsJSON('longway.register.v1', {});
const DOG = {
  on: lsGet('longway.dog') !== '0',
  x: 40, face: 1, moving: false, pose: 'stand',
  state: 'follow', stateT: 0, shookOn: '', sleepX: null, restX: null,
  barked: false, yipAt: 0, barkAt: 0,
  found: 0,             /* this investigation earned a yip on the way up */
  foundX: 0, foundTgt: '',   /* the door that earned it, for the w3r2 hold */
  pend: null,           /* …and one the floor landed on, still owed */
  sniffCD: new Map(),
  /* w5r2 — THE WHISTLE: the recall sprint, the answer owed a beat after
     the second note, the held heel on arrival, and the look-up when she
     was at heel all along */
  recall: null, answer: null, heelHold: 0, lookUp: 0
};
let saveTimer = null;
function saveAll() {
  lsSet('longway.pack.v1', JSON.stringify({
    leaves: PACK.leaves, hollows: PACK.hollows, stamps: PACK.stamps,
    biomes: PACK.biomes, visited: PACK.visited, certs: PACK.certs,
    greeted: PACK.greeted, walked: Math.round(PACK.walked), days: PACK.days
  }));
  lsSet('longway.guide.v1', JSON.stringify({ found: GUIDE.found }));
  lsSet('longway.register.v1', JSON.stringify(REGBOOK));
  if (COV.bits) lsSet('longway.cov.v1', JSON.stringify({ n: COV.n, b: covB64() }));
}
function queueSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveAll, 700);
}
window.addEventListener('beforeunload', saveAll);

/* one quiet toast at a time — never a wall */
const toastEl = document.getElementById('toast');
const toastQ = [];
let toastBusy = false;
function toast(txt) {
  if (toastQ.length > 3) return;
  toastQ.push(txt);
  if (!toastBusy) nextToast();
}
/* WHERE THE TOAST BAND SITS, IN THE SCENE'S OWN COORDINATES (prepolish5).
   The toast is a DOM plate and always paints over the canvas, so a speech
   bubble that rose into it lost a line behind it. That was true of the
   build before this round too — old and new measured side by side in
   qa/pp5-typeab.mjs — but the type sweep put it on film, so the words now
   step over the band instead of under it. Measured once when a toast
   appears (and again on a resize), never per frame; #world is fixed at
   0,0, so the viewport rect IS the scene rect. */
function nextToast() {
  const txt = toastQ.shift();
  if (!txt) { toastBusy = false; toastEl.hidden = true; bandT = -9; return; }
  toastBusy = true;
  toastEl.textContent = txt;
  toastEl.hidden = false;
  bandT = -9;               /* the speaking law re-reads the band at once */
  setTimeout(nextToast, 2900);
}

/* the field guide's species — counts derived at build, never typed in */
const SPECIES = [
  { id: 'boardwalk', name: 'CODE BOARDWALK', what: 'Planks laid over a stretch of code — every block that carries code gets one, so your boots never touch the brackets.', count: () => M.furnCounts.boardwalk },
  { id: 'picnic', name: 'TABLE PICNIC', what: 'A picnic table wherever the page sets a table — rows and columns served flat, in the open air.', count: () => M.furnCounts.picnic },
  { id: 'cairn', name: 'NOTE CAIRN', what: 'Stacked stones marking a calm admonition: a note, an aside, a prerequisite. Read it or walk on; it asks nothing.', count: () => M.furnCounts.cairn },
  { id: 'warnpost', name: 'WARNING POST', what: 'A low barrier with hard chevrons at every caution, warning and danger. It holds you at its edge until you jump it clean.', count: () => M.hazTotal },
  { id: 'spring', name: 'TIP SPRING', what: 'A rose spring pad at every tip — step on and it bounces you a few honest metres down the trail.', count: () => M.sprTotal },
  { id: 'milepost', name: 'ENDPOINT MILE-POST', what: 'A short post with the method carved on the cap, one per documented API endpoint on the trail.', count: () => M.furnCounts.milepost },
  { id: 'frame', name: 'IMAGE FRAME', what: 'An easel holding a framed print wherever the page hangs a picture or a screenshot.', count: () => M.furnCounts.frame },
  { id: 'terrace', name: 'CARD TERRACE', what: 'A kiosk with a striped awning wherever a page serves a cards block — step up and order a card.', count: () => M.terrTotal },
  { id: 'door', name: 'CITATION DOOR', what: 'A cream door standing wherever this page cites another. Walk through and it carries you there.', count: () => M.edgeCount },
  { id: 'lantern', name: 'NIGHT LANTERN', what: 'One lantern per commit made long after midnight — they pool warm light on the night-dark ground.', count: () => M.lanternsTotal }
];
function unlockSpecies(id) {
  if (GUIDE.found[id]) return;
  const sp = SPECIES.find(x => x.id === id);
  if (!sp) return;
  GUIDE.found[id] = { at: S.page.slug, word: Math.round(wordsAt(S.x)) };
  toast('FIELD GUIDE — ' + sp.name + ' · ' + fmt(sp.count()) + ' ACROSS THE TRAIL · PRESS G');
  queueSave();
}
function checkGuide() {
  if (S.sweep) return;
  const p = S.page;
  const NEAR = 34;
  for (const f of p.furn) {
    if (GUIDE.found[f.kind]) continue;
    if (Math.abs(f.x - S.x) < NEAR) unlockSpecies(f.kind);
  }
  if (!GUIDE.found.warnpost) for (const hz of p.hazards) if (Math.abs(hz.x - S.x) < NEAR + 16) unlockSpecies('warnpost');
  if (!GUIDE.found.spring) for (const sp of p.springs) if (Math.abs(sp.x - S.x) < NEAR + 16) unlockSpecies('spring');
  if (!GUIDE.found.terrace) for (const tr of p.terraces) if (Math.abs(tr.x - S.x) < NEAR + 26) unlockSpecies('terrace');
  if (!GUIDE.found.door) for (const g of p.gates) if (Math.abs(g.x - S.x) < NEAR + 16) unlockSpecies('door');
  if (!GUIDE.found.lantern && p.prov.night > 0) {
    const T = terrainFor(p.idx);
    for (const ln of T.lanterns) if (Math.abs(ln.x - S.x) < NEAR + 16) unlockSpecies('lantern');
  }
}

/* what the pack picks up when a stretch is entered */
function collectPage(p) {
  if (typeof audCheckComplete === 'function') audCheckComplete();
  if (S.sweep) return;   /* a scenic sweep flies over; only arrival collects */
  if (!PACK.visited[p.slug]) PACK.visited[p.slug] = 1;
  if (p.comm >= 0) PACK.biomes[p.comm] = 1;
  if (p.season === 2 && !PACK.leaves[p.slug]) {
    PACK.leaves[p.slug] = 1;
    toast('A PRESSED LEAF FROM ' + p.label.toUpperCase() + ' — IN THE PACK (B)');
  }
  if (p.prov.night > 0 && !PACK.hollows[p.slug]) {
    PACK.hollows[p.slug] = 1;
    toast('LANTERN LIGHT FROM ' + p.label.toUpperCase() + ' — IN THE PACK (B)');
  }
  if (p.isHub && !PACK.stamps[p.slug]) {
    PACK.stamps[p.slug] = 1;
    toast('HUB STAMP — ' + p.label.toUpperCase() + ' — IN THE PACK (B)');
  }
  if (p.comm >= 0 && !PACK.certs['c' + p.comm] && commComplete(p.comm)) {
    const c = M.communities[p.comm];
    PACK.certs['c' + p.comm] = 1;
    toast('EVERY PAGE OF ' + String(c.dominant || '').toUpperCase() + ' WALKED — CERTIFICATE IN THE PACK (B)');
  }
  /* a finished community is one of the three occasions the recorded theme
     is kept for — offered once, and owed again if it went by behind a mute */
  if (p.comm >= 0 && typeof audCheckComm === 'function') audCheckComm(p.comm);
  if (!PACK.certs.trail && M.pages.every(pp => PACK.visited[pp.slug])) {
    PACK.certs.trail = 1;
    toast('THE WHOLE TRAIL WALKED — CERTIFICATE IN THE PACK (B)');
  }
  queueSave();
  /* a page opened is a share of the corpus read: the score may just have
     earned a voice */
  if (window.__scoreReady) scoreUpdate(true);
}
function commComplete(ci) {
  const c = M.communities[ci];
  return c.members.every(m => PACK.visited[m] || !M.bySlug.has(m));
}
function trailComplete() { return M.pages.every(pp => PACK.visited[pp.slug]); }

/* ---------------- drawing helpers ---------------- */
function w2s(x, f) { return (x - S.x) * (f === undefined ? 1 : f) + AVX; }

function drawPoly(pts, color, regOff) {
  if (regOff) { /* registration misprint: accent pass, nudged */
    cx.fillStyle = regOff;
    cx.globalAlpha = 0.4;
    cx.beginPath();
    cx.moveTo(pts[0][0] + 2.5, pts[0][1] + 1.5);
    for (let i = 1; i < pts.length; i++) cx.lineTo(pts[i][0] + 2.5, pts[i][1] + 1.5);
    cx.closePath(); cx.fill();
    cx.globalAlpha = 1;
  }
  cx.fillStyle = color;
  cx.beginPath();
  cx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) cx.lineTo(pts[i][0], pts[i][1]);
  cx.closePath(); cx.fill();
}

function drawFlora(fl, pal, season) {
  const sx = w2s(fl.x);
  if (sx < -140 || sx > W + 140) return;
  const s = fl.s, gy = gYAt(fl.x) + 2, ink = pal.ink, acc = pal.accent;
  const woody = fl.type === 'pine' || fl.type === 'cypress' || fl.type === 'bush' || fl.type === 'palm';
  if (season === 3 && woody) {
    /* bare winter: the canopy is gone, only trunk and hard branches */
    const h = (fl.type === 'bush' ? 34 : 88) * s;
    cx.strokeStyle = ink; cx.lineCap = 'butt';
    cx.lineWidth = 3.2 * s;
    cx.beginPath(); cx.moveTo(sx, gy); cx.lineTo(sx + 2 * s, gy - h); cx.stroke();
    cx.lineWidth = 1.8 * s;
    cx.beginPath(); cx.moveTo(sx + 0.8 * s, gy - h * 0.55); cx.lineTo(sx - 13 * s, gy - h * 0.78); cx.stroke();
    cx.beginPath(); cx.moveTo(sx + 1.4 * s, gy - h * 0.72); cx.lineTo(sx + 14 * s, gy - h * 0.94); cx.stroke();
    cx.beginPath(); cx.moveTo(sx + 1.8 * s, gy - h * 0.86); cx.lineTo(sx - 8 * s, gy - h);
    cx.stroke();
    /* frost cap on the stump */
    cx.fillStyle = INKS.cream; cx.globalAlpha = 0.5;
    cx.fillRect(sx - 2 * s, gy - h - 2, 6 * s, 2);
    cx.globalAlpha = 1;
    return;
  }
  switch (fl.type) {
    case 'pine': {
      const h = 92 * s, w = 34 * s;
      drawPoly([[sx, gy - h], [sx - w / 2, gy - h * 0.45], [sx - w * 0.3, gy - h * 0.45], [sx - w * 0.62, gy], [sx + w * 0.62, gy], [sx + w * 0.3, gy - h * 0.45], [sx + w / 2, gy - h * 0.45]], ink, acc);
      break;
    }
    case 'cypress': {
      const h = 110 * s, w = 15 * s;
      drawPoly([[sx, gy - h], [sx - w, gy - h * 0.3], [sx - w * 0.5, gy], [sx + w * 0.5, gy], [sx + w, gy - h * 0.3]], ink, acc);
      break;
    }
    case 'bush': {
      const h = 30 * s, w = 42 * s;
      drawPoly([[sx - w / 2, gy], [sx - w * 0.42, gy - h * 0.7], [sx - w * 0.12, gy - h], [sx + w * 0.22, gy - h * 0.85], [sx + w / 2, gy - h * 0.4], [sx + w * 0.4, gy]], ink, acc);
      break;
    }
    case 'grass': {
      cx.strokeStyle = ink; cx.lineWidth = 1.6;
      for (let i = -1; i <= 1; i++) {
        cx.beginPath();
        cx.moveTo(sx + i * 4 * s, gy);
        cx.lineTo(sx + i * 7 * s + WIND * 9 * s, gy - (16 + 8 * Math.abs(i)) * s);
        cx.stroke();
      }
      break;
    }
    case 'reed': {
      cx.strokeStyle = ink; cx.lineWidth = 1.8;
      cx.beginPath(); cx.moveTo(sx, gy); cx.lineTo(sx + WIND * 8 * s, gy - 44 * s); cx.stroke();
      cx.fillStyle = ink;
      cx.fillRect(sx - 2.5 + WIND * 8 * s, gy - 58 * s, 5, 15 * s);
      break;
    }
    case 'boulder': {
      const h = 22 * s, w = 36 * s;
      drawPoly([[sx - w / 2, gy], [sx - w * 0.36, gy - h * 0.8], [sx + w * 0.05, gy - h], [sx + w * 0.44, gy - h * 0.55], [sx + w / 2, gy]], ink, acc);
      break;
    }
    case 'palm': {
      const h = 84 * s;
      cx.strokeStyle = ink; cx.lineWidth = 3.4;
      cx.beginPath(); cx.moveTo(sx, gy); cx.lineTo(sx + 8 * s, gy - h); cx.stroke();
      cx.lineWidth = 2.4;
      for (let i = 0; i < 5; i++) {
        const a = -0.45 - i * 0.5;
        cx.beginPath();
        cx.moveTo(sx + 8 * s, gy - h);
        cx.lineTo(sx + 8 * s + Math.cos(a) * 30 * s, gy - h + Math.sin(a) * 30 * s + 12 * s);
        cx.stroke();
      }
      break;
    }
  }
  /* season dress — punched from the same sheet, only the ink changes */
  if (woody && season !== undefined) {
    const capY = gy - (fl.type === 'bush' ? 30 : fl.type === 'palm' ? 84 : fl.type === 'cypress' ? 110 : 92) * s;
    if (season === 0) {
      /* spring bloom: hard rose blossoms dotted on the canopy */
      cx.fillStyle = INKS.rose;
      const bn = 3 + ((fl.off * 7) | 0) % 3;
      for (let i = 0; i < bn; i++) {
        const a = fl.off * 9 + i * 2.4;
        cx.fillRect(sx + Math.cos(a) * 11 * s, capY + 10 * s + Math.abs(Math.sin(a)) * 22 * s, 3, 3);
      }
    } else if (season === 1) {
      /* deep summer: a lusher violet double-strike on the canopy */
      cx.fillStyle = INKS.violet;
      cx.globalAlpha = 0.30;
      cx.fillRect(sx - 8 * s, capY + 8 * s, 16 * s, 14 * s);
      cx.globalAlpha = 1;
    } else if (season === 2) {
      /* autumn: the canopy turns — apricot overprint */
      cx.fillStyle = INKS.apricot;
      cx.globalAlpha = 0.5;
      cx.fillRect(sx - 9 * s, capY + 4 * s, 18 * s, 12 * s);
      cx.fillRect(sx - 4 * s, capY - 2 * s, 9 * s, 7 * s);
      cx.globalAlpha = 1;
    }
  }
}

function drawFigure(sx, sy, h, phase, ink, accent, moving, opts) {
  /* flat ink silhouette, hard edges; gait from phase.
     opts: stride (slope-shortened), leanX (extra lean), pitch (stumble),
           armUp (0|1|2 — a wave, two held frames) */
  const o = opts || 0;
  const strideMul = o && o.stride !== undefined ? o.stride : 1;
  const leg = moving ? Math.sin(phase) * 0.62 * strideMul : 0.14;
  const arm = moving ? Math.sin(phase + Math.PI) * 0.5 * strideMul : 0.1;
  /* rain on your neck: the shoulders come up and the walk leans into it */
  const hunch = (o && o.hunch) ? clamp(o.hunch, 0, 1) : 0;
  const lean = (moving ? 1.6 * h : 0) + (o && o.leanX ? o.leanX * h : 0) +
    hunch * 2.0 * h * ((o && o.face) || 1);
  if (accent) {
    cx.save(); cx.translate(2.5, 1.5); cx.globalAlpha = 0.45;
    drawFigure(sx, sy, h, phase, accent, null, moving, opts);
    cx.restore(); cx.globalAlpha = 1;
  }
  const pitched = o && o.pitch;
  if (pitched) {
    cx.save();
    cx.translate(sx, sy); cx.rotate(o.pitch); cx.translate(-sx, -sy);
  }
  const hipY = sy - 26 * h;
  const shY = sy - (46 - 3.4 * hunch) * h;
  cx.fillStyle = ink;
  cx.strokeStyle = ink;
  cx.lineCap = 'round';
  /* legs — the stride */
  cx.lineWidth = 4.6 * h;
  cx.beginPath(); cx.moveTo(sx, hipY); cx.lineTo(sx + Math.sin(leg) * 13 * h, sy); cx.stroke();
  cx.beginPath(); cx.moveTo(sx, hipY); cx.lineTo(sx - Math.sin(leg) * 13 * h, sy); cx.stroke();
  /* torso: shoulders over hips, leaning into the walk */
  drawPoly([
    [sx - 7 * h + lean, shY], [sx + 7 * h + lean, shY],
    [sx + 4.6 * h, hipY + 2 * h], [sx - 4.6 * h, hipY + 2 * h]
  ], ink);
  /* arms */
  cx.lineWidth = 3.2 * h;
  if (o && o.armUp) {
    /* one arm thrown up — two hard frames, no tween */
    const ux = o.armUp === 2 ? 7 : 10, uy = o.armUp === 2 ? 21 : 14;
    cx.beginPath(); cx.moveTo(sx + lean, shY + 3 * h); cx.lineTo(sx + lean + ux * h, shY - uy * h); cx.stroke();
  } else {
    cx.beginPath(); cx.moveTo(sx + lean, shY + 3 * h); cx.lineTo(sx + lean + Math.sin(arm) * 10 * h, hipY + 3 * h); cx.stroke();
  }
  cx.beginPath(); cx.moveTo(sx + lean, shY + 3 * h); cx.lineTo(sx + lean - Math.sin(arm) * 10 * h, hipY + 3 * h); cx.stroke();
  /* neck + head */
  cx.fillRect(sx - 1.9 * h + lean, shY - 5.5 * h, 3.8 * h, 6 * h);
  cx.beginPath(); cx.arc(sx + lean * 1.4, shY - 10.5 * h, 5.8 * h, 0, 7); cx.fill();
  /* the chosen walker: silhouette and accessories, punched from the sheet */
  if (o && o.dress) drawDress(sx, sy, h, lean, shY, hipY, ink, o.dress, o.face || 1);
  cx.lineCap = 'butt';
  if (pitched) cx.restore();
}

function drawDress(sx, sy, h, lean, shY, hipY, ink, dress, face) {
  const hx = sx + lean * 1.4, hy = shY - 10.5 * h;
  if (dress.sil === 'A') {
    /* flared skirt over the hips, longer hair behind the head */
    drawPoly([
      [sx - 4.8 * h + lean * 0.4, hipY - 4 * h], [sx + 4.8 * h + lean * 0.4, hipY - 4 * h],
      [sx + 9.4 * h, hipY + 12 * h], [sx - 9.4 * h, hipY + 12 * h]
    ], ink);
    drawPoly([
      [hx - 2 * h, hy - 5 * h], [hx - 7.2 * h, hy + 0.5 * h],
      [hx - 6.2 * h, shY + 4 * h], [hx - 2.2 * h, shY + 0.5 * h]
    ], ink);
  } else if (dress.sil === 'B') {
    /* broader shoulders — a wider plate across the top of the torso */
    drawPoly([
      [sx - 9.4 * h + lean, shY], [sx + 9.4 * h + lean, shY],
      [sx + 6.4 * h + lean * 0.5, shY + 7 * h], [sx - 6.4 * h + lean * 0.5, shY + 7 * h]
    ], ink);
  }
  const acc = dress.accSet || dress.acc;
  if (!acc || !acc.size) return;
  if (acc.has('hat')) {
    cx.fillStyle = ink;
    cx.fillRect(hx - 8.4 * h, hy - 4.8 * h, 16.8 * h, 2 * h);
    cx.fillRect(hx - 4.6 * h, hy - 11.6 * h, 9.2 * h, 7.2 * h);
    cx.fillStyle = INKS.cream;
    cx.fillRect(hx - 4.6 * h, hy - 6.4 * h, 9.2 * h, 1.5 * h);
  }
  if (acc.has('crown')) {
    for (let i = -2; i <= 2; i++) {
      cx.fillStyle = (i % 2 === 0) ? INKS.rose : INKS.apricot;
      cx.fillRect(hx + i * 2.5 * h - 1.1 * h,
        hy - 5.0 * h - (2 - Math.abs(i)) * 1.1 * h - (acc.has('hat') ? 7.2 * h : 0), 2.2 * h, 2.2 * h);
    }
  }
  if (acc.has('glasses')) {
    cx.strokeStyle = INKS.cream; cx.lineWidth = 1.2 * h;
    cx.beginPath(); cx.arc(hx - 2.6 * h, hy - 0.4 * h, 2.1 * h, 0, 7); cx.stroke();
    cx.beginPath(); cx.arc(hx + 2.6 * h, hy - 0.4 * h, 2.1 * h, 0, 7); cx.stroke();
    cx.beginPath(); cx.moveTo(hx - 0.6 * h, hy - 0.4 * h); cx.lineTo(hx + 0.6 * h, hy - 0.4 * h); cx.stroke();
  }
  if (acc.has('scarf')) {
    cx.fillStyle = INKS.rose;
    cx.fillRect(hx - 3.4 * h, shY - 5.4 * h, 6.8 * h, 2.6 * h);
    const wob = (!REDUCED && (Math.floor(S.t * 5) % 2)) ? 1.4 * h : 0;
    drawPoly([
      [hx - 2.6 * h * face, shY - 3.6 * h],
      [hx - (10.5 + WIND * 4) * h * face, shY - 2 * h + wob],
      [hx - (11.5 + WIND * 4) * h * face, shY + 0.8 * h + wob],
      [hx - 2.2 * h * face, shY - 1 * h]
    ], INKS.rose);
  }
}

/* THE READABILITY FLOOR (owner: the world signage and the walker provenance line
   were too small to read). Sizes at or above 10 are untouched; below it the type is
   lifted toward the floor, hardest at the smallest sizes, so nothing else shifts:
   6.2 -> 8.3, 7 -> 8.7, 7.5 -> 8.9, 8.5 -> 9.3, 9.5 -> 9.8, 10 and up unchanged. */
const TYPE_FLOOR = 10, FLOOR_KEEP = 0.45;
function readable(size) {
  const s = size || 10;
  return s >= TYPE_FLOOR ? s : TYPE_FLOOR + (s - TYPE_FLOOR) * FLOOR_KEEP;
}

function label(txt, sx, sy, size, color, align, ls) {
  cx.font = (readable(size) * TYPE_SCALE) + 'px Georgia, serif';
  cx.textAlign = align || 'center';
  try { cx.letterSpacing = (ls === undefined ? 1.5 : ls) + 'px'; } catch (e) { }
  cx.fillStyle = color || INKS.cream;
  cx.fillText(txt, sx, sy);
  try { cx.letterSpacing = '0px'; } catch (e) { }
}

/* ---------------- scene ---------------- */
function draw(dt) {
  const page = S.page;
  const hollow = page.prov.night > 0;
  let pal = gradedPaletteFor(page.comm, hollow);
  let wN = hollow ? 1 : DAY.wts.n;   /* how much night the sky holds here */
  /* biome arrival: the new light fades up over seconds — never a pop */
  if (S.front < 1 && S.fromSnap && !REDUCED) {
    const k = smoothT(clamp(S.front / 0.85, 0, 1));
    pal = blendPal(S.fromSnap, pal, k);
    wN = lerp(S.fromWN, wN, k);
  } else if (S.fromSnap) {
    S.fromSnap = null;
  }
  S.pal = pal;
  S.lastWN = wN;
  camE = elevAt(S.x);
  frameWalkers.length = 0;

  /* wind eases toward this stretch's outbound-link strength */
  const windTgt = Math.log(1 + page.outCount) / Math.log(1 + M.maxOut);
  if (REDUCED) S.wind = windTgt;
  else S.wind += (windTgt - S.wind) * Math.min(1, dt * 1.1);
  WIND = S.wind;

  /* sky — hard bands, no gradients */
  let y = 0;
  const hsum = pal.bands.reduce((a, b) => a + b.h, 0);
  for (const b of pal.bands) {
    const bh = horizonY * (b.h / hsum);
    cx.fillStyle = b.c;
    cx.fillRect(0, Math.floor(y), W, Math.ceil(bh) + 1);
    y += bh;
  }
  /* sun: flat cream disc, rose ring misregistered — riso sun.
     The hour moves it: low rose east at dawn, high at noon, the biome's
     own place at golden hour, then it sinks behind the ridge at dusk. */
  const sunA = clamp((0.99 - wN) / 0.20, 0, 1) * (1 - 0.88 * WX.grey);   /* cloud takes the sun */
  SUN_SX = -1; SUN_A = 0;
  if (pal.sun && sunA > 0.004) {
    cx.globalAlpha = sunA;
    const wts = hollow ? { m: 0, d: 0, g: 0, n: 1 } : DAY.wts;
    const fx = wts.m * 0.14 + wts.d * 0.50 + (wts.g + wts.n) * pal.sun.fx;
    const fy = wts.m * 0.62 + wts.d * 0.16 + wts.g * pal.sun.fy + wts.n * 1.55;
    const sxx = W * fx, syy = horizonY * fy;
    SUN_SX = sxx; SUN_A = sunA;      /* the shore lays its glitter under it */
    cx.fillStyle = pal.sun.ring;
    cx.beginPath(); cx.arc(sxx + 5, syy + 3.5, pal.sun.rr, 0, 7); cx.fill();
    cx.fillStyle = INKS.cream;
    cx.beginPath(); cx.arc(sxx, syy, pal.sun.rr, 0, 7); cx.fill();
    /* hard stepped halo — flat rings, riso overprint */
    cx.fillStyle = INKS.cream;
    cx.globalAlpha = 0.12 * sunA;
    cx.beginPath(); cx.arc(sxx, syy, pal.sun.rr * 1.55, 0, 7); cx.fill();
    cx.globalAlpha = 0.06 * sunA;
    cx.beginPath(); cx.arc(sxx, syy, pal.sun.rr * 2.3, 0, 7); cx.fill();
    cx.globalAlpha = 1;
  }
  /* moon: its phase is this stretch's freshness — full when tended this
     week, thinning as the last commit ages, new past 240 untended days */
  const mAl = nightRamp(wN) * (1 - 0.72 * WX.grey);   /* cloud takes the moon */
  const moonTgt = 1 - clamp((page.ageDays - MOON_FULL_DAYS) / (MOON_NEW_DAYS - MOON_FULL_DAYS), 0, 1);
  if (REDUCED) S.moonK = moonTgt;
  else S.moonK += (moonTgt - S.moonK) * Math.min(1, (dt || 0.016) * 1.6);
  if (mAl > 0.004) {
    const R = 19;
    const mx = W * 0.71, my = horizonY * (0.30 + (1 - mAl) * 0.10);
    cx.globalAlpha = mAl;
    cx.fillStyle = INKS.violet;
    cx.beginPath(); cx.arc(mx + 4, my + 3, R, 0, 7); cx.fill();
    cx.fillStyle = INKS.cream;
    cx.beginPath(); cx.arc(mx, my, R, 0, 7); cx.fill();
    if (S.moonK < 0.985) {
      /* the dark bite: a flat disc of the sky, slid across by freshness */
      cx.save();
      cx.beginPath(); cx.arc(mx, my, R + 0.5, 0, 7); cx.clip();
      cx.fillStyle = skyColAt(pal, clamp(my / horizonY, 0, 1));
      cx.beginPath(); cx.arc(mx - S.moonK * (2 * R + 5), my, R + 2, 0, 7); cx.fill();
      cx.restore();
    }
    cx.globalAlpha = 1;
  }
  /* night: seeded stars, printed like grain — everywhere the sky darkens */
  if (wN > 0.3) {
    cx.fillStyle = INKS.cream;
    const sr = rngFor('stars');
    const dim = clamp((wN - 0.3) / 0.7, 0, 1) * (1 - 0.78 * WX.grey);   /* and the stars */
    for (let i = 0; i < 130; i++) {
      const stx = sr() * 2400, sty = sr() * horizonY * 0.92, tw = sr();
      const px = ((stx - S.x * 0.04) % 2400 + 2400) % 2400 * (W / 2400);
      cx.globalAlpha = (0.25 + tw * 0.5) * dim;
      cx.fillRect(px, sty, tw > 0.85 ? 2 : 1, tw > 0.85 ? 2 : 1);
    }
    cx.globalAlpha = 1;
  }
  /* the constellations overhead are this biome's own citation graph */
  if (wN > 0.35 && page.comm >= 0) {
    drawConstellation(page.comm, smoothT(clamp((wN - 0.35) / 0.5, 0, 1)) * (1 - 0.55 * WX.grey));
  }
  /* one star moves and blinks a rhythm of its own among the citations —
     hover it and it names itself, click it and follow (firstlight) */
  if (wN > 0.35 && page.idx >= PORTAL_MIN_PAGE) {
    const sdim = clamp((wN - 0.35) / 0.5, 0, 1) * (1 - 0.70 * WX.grey);
    if (sdim > 0.08) {
      const u = REDUCED ? 0.5 : (S.t % 300) / 300;   /* a five-minute transit */
      const sfx2 = 0.08 + 0.84 * u;
      const sfy2 = 0.16 + 0.05 * Math.sin(REDUCED ? 1.2 : S.t * 0.11);
      const ssx = sfx2 * W, ssy = sfy2 * horizonY;
      /* the blink: dot dot long — no fixed star keeps that time */
      const bt2 = S.t % 2.6;
      const sOn = REDUCED ? 1 :
        ((bt2 < 0.18 || (bt2 > 0.5 && bt2 < 0.68) || (bt2 > 1.05 && bt2 < 1.95)) ? 1 : 0.15);
      PORTAL.starSX = ssx; PORTAL.starSY = ssy; PORTAL.starOn = sOn * sdim;
      PORTAL.starHover = Math.hypot(PORTAL.mx - ssx, PORTAL.my - ssy) < 26;
      cx.fillStyle = INKS.cream;
      cx.globalAlpha = sdim * (0.35 + 0.65 * sOn);
      cx.fillRect(ssx - 1.4, ssy - 1.4, 2.8, 2.8);
      if (sOn > 0.5 && !REDUCED) {
        cx.globalAlpha = sdim * 0.5;
        cx.fillRect(ssx - 4.5, ssy - 0.5, 9, 1);
        cx.fillRect(ssx - 0.5, ssy - 4.5, 1, 9);
      }
      if (PORTAL.starHover) {
        cx.globalAlpha = 0.85 * sdim;
        cx.strokeStyle = INKS.violet; cx.lineWidth = 1.2;
        cx.strokeRect(ssx - 5.5, ssy - 5.5, 11, 11);
        cx.strokeStyle = INKS.cream;
        cx.strokeRect(ssx - 4.2, ssy - 4.2, 8.4, 8.4);
      }
      cx.globalAlpha = 1;
    } else { PORTAL.starHover = false; PORTAL.starOn = 0; }
  } else { PORTAL.starHover = false; PORTAL.starOn = 0; }

  /* ridges, far to near — faceted polylines in layer space, seamless.
     Your own climb pushes the horizon gently down: parallax follows. */
  const ridgeCols = [pal.ridgeFar, pal.ridgeMid, pal.ridgeNear];
  for (let li = 0; li < 3; li++) {
    const L = RIDGE_LAYERS[li];
    const rShift = camE * CAM_K * (0.22 + 0.16 * li);
    const g0 = Math.floor((S.x * L.f - AVX - L.step) / L.step) * L.step;
    const g1 = S.x * L.f + (W - AVX) + L.step * 2;
    cx.fillStyle = ridgeCols[li];
    cx.beginPath();
    let started = false;
    for (let gx = g0; gx <= g1; gx += L.step) {
      const sx = gx - S.x * L.f + AVX;
      const sy = ridgeY(li, gx) + rShift;
      if (!started) { cx.moveTo(sx, sy); started = true; } else cx.lineTo(sx, sy);
    }
    cx.lineTo(W + 60, visH + 40); cx.lineTo(-60, visH + 40);
    cx.closePath(); cx.fill();

    /* horizon landmarks live on the far ridge */
    if (li === 0) drawLandmarks(L, pal, rShift, wN);
  }

  /* converging inbound paths (drawn in the air, braiding to the gate) */
  drawConverge(pal);

  /* ground: each stretch wears its own season; hard combs blend borders */
  const pi0 = pageAt(clamp(S.x - AVX - 60, 0, M.totalPx - 1)).idx;
  const pi1 = pageAt(clamp(S.x + (W - AVX) + 60, 0, M.totalPx - 1)).idx;
  const view0 = S.x - AVX - 60, view1 = S.x + (W - AVX) + 60;
  for (let pi = pi0; pi <= pi1; pi++) drawGroundFill(pi, view0, view1);
  for (let pi = pi0; pi < pi1; pi++) drawBorderComb(pi);
  drawRivers(view0, view1, wN);
  labelPlanBuild(pi0, pi1);   /* one floating label at approach, measured */
  for (let pi = pi0; pi <= pi1; pi++) drawStretch(pi, pal, dt, wN);

  /* the shower's leavings: a flat sheen on the path and puddles that stay
     after the front has gone and then dry out */
  drawWet(pal);
  drawSnowCover();

  /* past the last stretch: the headland, the cliff, and the lit coast */
  drawLandsEnd(pal, wN);

  /* gust layer: soft cream streaks riding the stretch's own wind */
  if (!REDUCED && S.wind > 0.06 && !S.atLE) drawGusts();

  /* greetings: one bubble at a time, ambient crossings, never a wall */
  updateGreetings(dt, wN);

  /* the trail dog — one small silhouette, never in the way */
  if (DOG.on) { updateDog(dt); drawDog(pal); }

  /* avatar — cream backlight rim so the ink reads on dark ground */
  const moving = Math.abs(S.vx) > 1;
  let airY = 0;
  if (S.jumpT !== null) airY = Math.sin(Math.PI * S.jumpT) * 54;
  if (S.bounceT !== null) airY = Math.sin(Math.PI * S.bounceT) * 78;
  const slope = (elevAt(S.x + 26) - elevAt(S.x - 26)) / 52;   /* + = uphill east */
  const eff = moving ? slope * Math.sign(S.vx) : 0;           /* uphill for me? */
  /* held at a hazard: she leans out over the drop, eased in and out */
  const blockedNow = S.hzBlock !== null && S.jumpT === null && S.bounceT === null;
  if (REDUCED) S.hzLean = blockedNow ? 1 : 0;
  else S.hzLean += ((blockedNow ? 1 : 0) - S.hzLean) * Math.min(1, dt * 6);
  const bl = S.hzLean > 0.01 ? S.hzLean : 0;
  const bf = S.hzBlock ? S.hzBlock.face : S.face;
  /* kneeling to press a flower: the herbarium beat bends her down */
  const kneel = (PORTAL.active && PORTAL.active.key === 'herbarium') ?
    smoothT(clamp(PORTAL.active.t * 2.2, 0, 1)) : 0;
  const opts = {
    stride: clamp(1 - eff * 1.5, 0.62, 1.3),                  /* honest gait */
    leanX: clamp(eff * 6, -3, 4.5) * Math.sign(S.vx || S.face) + bl * 7 * bf,
    pitch: (S.stumbleT !== null ? Math.sin(Math.PI * S.stumbleT) * 0.5 * S.face : 0) +
      bl * 0.30 * bf + kneel * 0.58 * S.face,
    armUp: S.wave > 0 ? (S.wave > 0.45 ? 2 : 1) : 0,
    dress: WALKER,
    face: S.face
  };
  const hK = 1 - 0.16 * kneel;
  const ay = gYAt(S.x) - airY;
  opts.hunch = WX.rain * (moving ? 1 : 0.7);
  if (SLP.startle > 0) opts.armUp = SLP.startle > 0.55 ? 2 : 1;   /* the stretch */
  if ((SLP.stage > 0 || PERF.on || PERF.putaway > 0) && !moving) {
    /* w5r1 — the step or two to the seat: while dxNow is still short of
       the chosen seat she is drawn WALKING toward it, in the ordinary
       walking frames, facing the seat; the settle begins on arrival. */
    const toSeat = SLP.onBench && !REDUCED &&
      Math.abs((SLP.dxNow || 0) - SLP.seatDX) > 1.5;
    if (toSeat) {
      const wx2 = S.x + (SLP.dxNow || 0);
      const wy = gYAt(wx2) - airY;
      opts.face = (SLP.seatDX - (SLP.dxNow || 0)) >= 0 ? 1 : -1;
      drawFigure(AVX + (SLP.dxNow || 0) - 2.6, wy - 1.8, hK, wx2 / 26, 'rgba(255,243,224,0.9)', null, true, opts);
      drawFigure(AVX + (SLP.dxNow || 0), wy, hK, wx2 / 26, pal.ink, pal.accent, true, opts);
    } else {
      /* settled, nodded off, asleep — or sitting with the instrument out.
         Seated on furniture she faces the way the seat faces (a picnic
         seat faces its table), and she is grounded on the seat's own
         stretch of ground, not the spot she idled on. */
      if (SLP.onBench && SLP.seatFace) opts.face = SLP.seatFace;
      const aySeat = SLP.onBench ? gYAt(S.x + SLP.seatDX) - airY : ay;
      if (PERF.on || PERF.putaway > 0) drawPerformer(aySeat, pal, opts);
      else drawSleeper(aySeat, pal, opts);
    }
  } else {
    drawFigure(AVX - 2.6, ay - 1.8, hK, S.x / 26, 'rgba(255,243,224,0.9)', null, moving && !REDUCED, opts);
    drawFigure(AVX, ay, hK, S.x / 26, pal.ink, pal.accent, moving && !REDUCED, opts);
  }

  /* the stumble's puff — three held frames of flat dust */
  if (S.puff && S.puff.t < 1) {
    const f = Math.min(2, Math.floor(S.puff.t * 3));
    const psx = w2s(S.puff.x), pgy = gYAt(S.puff.x);
    cx.fillStyle = INKS.cream;
    cx.globalAlpha = 0.7 - f * 0.22;
    const r = 5 + f * 7;
    cx.fillRect(psx - r, pgy - 4 - f * 3, 6, 4);
    cx.fillRect(psx + r - 5, pgy - 6 - f * 2, 5, 4);
    cx.fillRect(psx - 2, pgy - 9 - f * 4, 5, 3);
    cx.globalAlpha = 1;
  }

  /* the one speech bubble, over everything on the land */
  if (S.bubble) drawBubble(S.bubble);

  /* weather front on biome change: the column fades up over seconds,
     sweeps on an eased curve, and fades out — never a pop */
  if (S.front < 1) {
    const e = smoothT(S.front);
    const env = smoothT(clamp(S.front / 0.30, 0, 1)) *
                smoothT(clamp((1 - S.front) / 0.30, 0, 1));
    if (env > 0.003) {
      cx.globalAlpha = 0.9 * env;
      cx.fillStyle = INKS.aubergine;
      cx.fillRect(W * e, 0, Math.max(60, W * 0.12) * (1 - e * 0.5), visH + 4);
      cx.globalAlpha = 1;
    }
  }

  /* The month being remembered: the paper darkens a stop under cloud and
     another under a shower, and the rain falls in hard riso streaks. None
     of it can reach the reading strip or a prompt — those are DOM, and
     this is the canvas the ground is printed on. */
  drawWxPlate(0.055 * WX.k + 0.13 * WX.rain + 0.10 * WX.storm);
  if (!S.atLE) {
    drawRain(WX.rain);
    if (WX.snow > 0.012) drawSnow(WX.snow);
    if (WX.rbA > 0.01) drawRainbow(WX.rbA);
    if (WX.fog > 0.01) drawFogBank(WX.fog);
    drawBolt();
  }

  /* grain overlay — the whole scene is printed on stock */
  if (grainPat) {
    cx.globalAlpha = 0.5;
    cx.fillStyle = grainPat;
    cx.fillRect(0, 0, W, visH + 6);
    cx.globalAlpha = 1;
  }

  /* a crossing, taken: the ink washes up over the land, one line names
     the way, and then you are elsewhere. Never under reduced motion —
     that walker crosses instantly. */
  if (PORTAL.active) {
    const pk = smoothT(clamp(PORTAL.active.t, 0, 1));
    cx.globalAlpha = 0.94 * pk;
    cx.fillStyle = INKS.aubergine;
    cx.fillRect(0, 0, W, visH + 6);
    cx.globalAlpha = Math.min(1, pk * 1.7);
    label(PORTAL_LINES[PORTAL.active.key] || '', W / 2, visH * 0.46, 12, INKS.cream, 'center', 2);
    cx.globalAlpha = 1;
  }
}

/* ground fill per stretch — a faceted polygon following the elevation */
function drawGroundFill(pi, view0, view1) {
  const p = M.pages[pi];
  const x0 = Math.max(p.start, view0);
  const x1 = Math.min(p.start + p.len, view1);
  if (x1 <= x0) return;
  cx.fillStyle = groundColorFor(p);
  cx.beginPath();
  let first = true;
  for (let x = x0; ; x += 56) {
    if (x > x1) x = x1;
    const sx = w2s(x), sy = gYAt(x) - 6;
    if (first) { cx.moveTo(sx, sy); first = false; } else cx.lineTo(sx, sy);
    if (x >= x1) break;
  }
  cx.lineTo(w2s(x1), H + 4); cx.lineTo(w2s(x0), H + 4);
  cx.closePath(); cx.fill();
}

/* border comb: the two grounds interleave in hard slices — a riso blend */
function drawBorderComb(pi) {
  const a = M.pages[pi], b = M.pages[pi + 1];
  const ca = groundColorFor(a), cb = groundColorFor(b);
  if (ca === cb) return;
  const bx = b.start;
  const sxB = w2s(bx);
  if (sxB < -140 || sxB > W + 140) return;
  const SLICE = 13, N = 8;
  for (let i = 0; i < N; i++) {
    const x0 = bx + (i - N / 2) * SLICE;
    /* left half shows slices of the right ground and vice versa */
    cx.fillStyle = (i % 2 === 0) === (i < N / 2) ? cb : ca;
    const sy = gYAt(x0 + SLICE / 2) - 6;
    cx.fillRect(w2s(x0), sy, SLICE + 0.5, H - sy);
  }
}

/* THE RELIEF, AT LAST — rivers and their footbridges (wave 3). Flat riso
   water bands where the strong cross-community citation streams pass; a
   plank footbridge carries the trail over each one and names the stream:
   the slug pair, in the waymarker hand. Purely additive — the walking,
   the jumping and the music are untouched, and the walker crosses at the
   ground line she always kept, which is the deck of the bridge. */
function shortSlug(sl) {
  const seg = String(sl).split('/').filter(Boolean);
  return seg.length > 2 ? seg.slice(-2).join('/') : String(sl);
}
function drawRivers(view0, view1, wN) {
  if (!M.rivers) return;
  for (const r of M.rivers) {
    const x0 = r.x - r.half, x1 = r.x + r.half;
    if (x1 < view0 || x0 > view1) continue;
    const p2 = pageAt(clamp(r.x, 0, M.totalPx - 1));
    const pal2 = gradedPaletteFor(p2.comm, p2.prov.night > 0);
    const sx0 = w2s(x0), sx1 = w2s(x1);
    const yA = gYAt(x0) - 6, yB = gYAt(x1) - 6;
    const yw = Math.max(yA, yB) + 3;                /* water lies level */
    /* the water: one flat ink, graded by the hour like everything else */
    cx.fillStyle = gradeColor(mix(INKS.violet, INK_DARK, 0.55), DAY.wts);
    cx.fillRect(sx0, yw, sx1 - sx0, H + 4 - yw);
    cx.globalAlpha = 0.55;
    cx.fillStyle = INKS.cream;   /* the surface stripe */
    cx.fillRect(sx0 + 2, yw, sx1 - sx0 - 4, 2);
    cx.globalAlpha = 1;
    cx.fillStyle = INK_DARK;                        /* hard bank strikes */
    cx.fillRect(sx0 - 2, Math.min(yA, yw), 3, H + 4 - Math.min(yA, yw));
    cx.fillRect(sx1 - 1, Math.min(yB, yw), 3, H + 4 - Math.min(yB, yw));
    /* drift: sparse hard cream dashes sliding east — riso, not ripple;
       lanes ride the stream's real size, held still under reduced motion */
    const rr = rngFor('river:' + r.x);
    const lanes = 2 + Math.min(3, Math.round(r.n / 10));
    const t = REDUCED ? 0 : S.t;
    for (let i = 0; i < lanes; i++) {
      const ly = yw + 7 + i * 9 + rr() * 4;
      if (ly > H) break;
      const sp = 12 + rr() * 9, per = 74 + rr() * 40, ph = rr() * per;
      const off = ((t * sp + ph) % per + per) % per;
      cx.globalAlpha = 0.14 + 0.08 * ((i + 1) % 2);
      cx.fillStyle = INKS.cream;
      for (let dx = off - per; dx < r.half * 2; dx += per) {
        const wd = 15 + (i % 3) * 7;
        const a2 = Math.max(sx0 + 2, sx0 + dx), b2 = Math.min(sx1 - 2, sx0 + dx + wd);
        if (b2 > a2) cx.fillRect(a2, ly, b2 - a2, 2);
      }
      cx.globalAlpha = 1;
    }
    const nr = nightRamp(wN);
    if (nr > 0.02) {   /* the moon keeps one still glint on the water */
      cx.globalAlpha = 0.25 * nr;
      cx.fillStyle = INKS.cream;
      cx.fillRect((sx0 + sx1) / 2 - 9, yw + 5, 18, 2);
      cx.globalAlpha = 1;
    }
    drawFootbridge(r, sx0, sx1, yA, yB, yw, pal2);
  }
}
function drawFootbridge(r, sx0, sx1, yA, yB, yw, pal) {
  const dx0 = sx0 - 12, dx1 = sx1 + 12;
  const dy0 = yA - 2, dy1 = yB - 2;
  cx.strokeStyle = INK_DARK; cx.lineWidth = 4;      /* piles in the water */
  for (const f of [0.3, 0.7]) {
    const px = lerp(dx0, dx1, f), py = lerp(dy0, dy1, f);
    cx.beginPath(); cx.moveTo(px, py); cx.lineTo(px, yw + 14); cx.stroke();
  }
  /* a low rail BEHIND her (painted before the walker, like all furniture) */
  cx.lineWidth = 2.5; cx.strokeStyle = pal.ink;
  for (const f of [0.08, 0.5, 0.92]) {
    const px = lerp(dx0, dx1, f), py = lerp(dy0, dy1, f);
    cx.beginPath(); cx.moveTo(px, py - 3); cx.lineTo(px, py - 17); cx.stroke();
  }
  cx.beginPath(); cx.moveTo(dx0, dy0 - 16); cx.lineTo(dx1, dy1 - 16); cx.stroke();
  /* the deck: one plank run, accent registration edge, carved seams */
  cx.lineWidth = 7; cx.strokeStyle = pal.ink;
  cx.beginPath(); cx.moveTo(dx0, dy0); cx.lineTo(dx1, dy1); cx.stroke();
  cx.lineWidth = 2; cx.strokeStyle = pal.accent;
  cx.beginPath(); cx.moveTo(dx0, dy0 - 3.5); cx.lineTo(dx1, dy1 - 3.5); cx.stroke();
  cx.lineWidth = 1; cx.strokeStyle = INK_DARK;
  const nSeam = Math.max(4, Math.round((dx1 - dx0) / 13));
  for (let i = 1; i < nSeam; i++) {
    const f = i / nSeam;
    const px = lerp(dx0, dx1, f), py = lerp(dy0, dy1, f);
    cx.beginPath(); cx.moveTo(px, py - 3); cx.lineTo(px, py + 3); cx.stroke();
  }
  /* the plaque: the stream's slug pair, in the waymarker hand — small,
     carved, and never a floating signboard, so the label law is untouched */
  if (Math.abs(r.x - S.x) < 900) {
    const mx2 = (sx0 + sx1) / 2, my = Math.min(yA, yB) - 30;
    label(shortSlug(r.src) + ' \u21E2 ' + shortSlug(r.tgt), mx2, my, 7.5, INKS.cream, 'center', 1.2);
    label(r.n + ' CITATIONS CROSS THIS WATER', mx2, my + 11, 6.2, 'rgba(255,243,224,0.72)', 'center', 0.8);
  }
}

function drawLandmarks(L, pal, rShift, wN) {
  const range = (AVX / L.f) + 400;
  for (const c of M.communities) {
    const hp = M.bySlug.get(c.hub);
    if (!hp) continue;
    const wx = hp.start + hp.len / 2;
    if (Math.abs(wx - S.x) > range) continue;
    const sx = (wx - S.x) * L.f + AVX;
    if (sx < -160 || sx > W + 160) continue;
    const baseY = ridgeY(0, wx * L.f) + 3 + (rShift || 0);
    /* landmark height = the hub's own inbound citations (log, exactly
       the ground's elevation law), so the horizon and the relief agree */
    const hgt = Math.min(112, 30 + 82 * Math.log(1 + (hp.inCount || 0)) / Math.log(1 + M.maxIn));
    const v = M.lmVar && M.lmVar.has(c.idx) ? M.lmVar.get(c.idx) : c.idx % 8;
    const ink = mix(pal.ridgeFar, INK_DARK, 0.32);
    if (v === 0) { /* watchtower */
      drawPoly([[sx - 7, baseY], [sx - 5, baseY - hgt], [sx + 5, baseY - hgt], [sx + 7, baseY]], ink);
      drawPoly([[sx - 11, baseY - hgt], [sx + 11, baseY - hgt], [sx + 8, baseY - hgt - 12], [sx - 8, baseY - hgt - 12]], ink);
    } else if (v === 1) { /* arch */
      drawPoly([[sx - 14, baseY], [sx - 14, baseY - hgt], [sx - 6, baseY - hgt], [sx - 6, baseY]], ink);
      drawPoly([[sx + 6, baseY], [sx + 6, baseY - hgt], [sx + 14, baseY - hgt], [sx + 14, baseY]], ink);
      drawPoly([[sx - 17, baseY - hgt], [sx + 17, baseY - hgt], [sx + 17, baseY - hgt - 8], [sx - 17, baseY - hgt - 8]], ink);
    } else if (v === 2) { /* spire */
      drawPoly([[sx, baseY - hgt - 16], [sx - 8, baseY], [sx + 8, baseY]], ink);
    } else if (v === 3) { /* twin chimneys */
      drawPoly([[sx - 10, baseY], [sx - 10, baseY - hgt * 0.85], [sx - 3, baseY - hgt * 0.85], [sx - 3, baseY]], ink);
      drawPoly([[sx + 3, baseY], [sx + 3, baseY - hgt], [sx + 10, baseY - hgt], [sx + 10, baseY]], ink);
    } else if (v === 4) { /* water tower */
      cx.strokeStyle = ink; cx.lineWidth = 2;
      cx.beginPath(); cx.moveTo(sx - 8, baseY); cx.lineTo(sx - 4, baseY - hgt * 0.7); cx.stroke();
      cx.beginPath(); cx.moveTo(sx + 8, baseY); cx.lineTo(sx + 4, baseY - hgt * 0.7); cx.stroke();
      drawPoly([[sx - 11, baseY - hgt * 0.7], [sx + 11, baseY - hgt * 0.7], [sx + 8, baseY - hgt], [sx - 8, baseY - hgt]], ink);
    } else if (v === 5) { /* great tree */
      cx.strokeStyle = ink; cx.lineWidth = 3;
      cx.beginPath(); cx.moveTo(sx, baseY); cx.lineTo(sx, baseY - hgt * 0.55); cx.stroke();
      drawPoly([[sx - 16, baseY - hgt * 0.42], [sx + 16, baseY - hgt * 0.42], [sx, baseY - hgt * 0.78]], ink);
      drawPoly([[sx - 11, baseY - hgt * 0.66], [sx + 11, baseY - hgt * 0.66], [sx, baseY - hgt - 4]], ink);
    } else if (v === 6) { /* mast */
      cx.strokeStyle = ink; cx.lineWidth = 2;
      cx.beginPath(); cx.moveTo(sx, baseY); cx.lineTo(sx, baseY - hgt - 8); cx.stroke();
      cx.beginPath(); cx.moveTo(sx - 12, baseY - hgt * 0.72); cx.lineTo(sx + 12, baseY - hgt * 0.72); cx.stroke();
      cx.beginPath(); cx.moveTo(sx - 8, baseY - hgt * 0.9); cx.lineTo(sx + 8, baseY - hgt * 0.9); cx.stroke();
      cx.beginPath(); cx.moveTo(sx - 14, baseY); cx.lineTo(sx, baseY - hgt - 8); cx.lineTo(sx + 14, baseY); cx.stroke();
    } else { /* mill */
      drawPoly([[sx - 9, baseY], [sx - 5, baseY - hgt * 0.8], [sx + 5, baseY - hgt * 0.8], [sx + 9, baseY]], ink);
      cx.strokeStyle = ink; cx.lineWidth = 2.5;
      const hx = sx, hy = baseY - hgt * 0.8;
      for (const a2 of [0.6, 2.17, 3.74, 5.31]) {
        cx.beginPath(); cx.moveTo(hx, hy);
        cx.lineTo(hx + Math.cos(a2) * hgt * 0.32, hy + Math.sin(a2) * hgt * 0.32); cx.stroke();
      }
    }
    const lwA = nightRamp(wN);
    if (lwA > 0.01) { /* one lit window keeps watch on the far structure */
      cx.globalAlpha = lwA;
      cx.fillStyle = INKS.apricot;
      cx.fillRect(sx - 2, baseY - hgt * 0.5, 4, 6);
      cx.globalAlpha = 1;
    }
    if (Math.abs(wx - S.x) < 5200) {
      label(hp.label.toUpperCase().slice(0, 30), sx, baseY - hgt - 22, 9, 'rgba(255,243,224,0.75)');
      label('HUB · ' + c.size + ' PAGES', sx, baseY - hgt - 11, 7.5, 'rgba(255,243,224,0.65)');
    }
  }
}

/* converging citation paths + the staged Migration Pass */
function drawConverge(pal) {
  const idx = M.pages.indexOf(S.page);
  for (let k = 0; k <= 1; k++) {
    const p = M.pages[idx + k];
    if (!p || p.inCount === 0) continue;
    const staged = p === M.staged;
    const approach = staged ? 6400 : 1500;
    const gx = p.start;
    const d = gx - S.x;
    if (d > approach || (!staged && d < -p.len)) continue;
    const sources = M.inboundSrc.get(p.slug) || [];
    const n = staged ? sources.length : Math.min(6, sources.length);
    const prog = clamp(1 - d / approach, 0, 1);
    const vis = staged ? Math.ceil(prog * n) : n;
    const gsx = w2s(gx), gsy = gYAt(gx) - 4;
    cx.save();
    cx.setLineDash([3, 7]);
    cx.lineWidth = staged ? 1.4 : 1.1;
    for (let i = 0; i < vis; i++) {
      const r = rngFor('cvg:' + p.slug + ':' + i);
      const ax = gx - approach * (0.22 + 0.74 * (i / Math.max(1, n - 1)) * (0.4 + 0.6 * r()));
      const ay = lerp(horizonY * 0.78, groundY - 26, r());
      const sx0 = w2s(ax);
      if (sx0 > W + 200 && gsx > W + 200) continue;
      cx.strokeStyle = staged ? 'rgba(255,243,224,' + (0.30 + 0.25 * r()) + ')' : 'rgba(255,243,224,0.20)';
      cx.beginPath();
      const cxx = w2s(gx - (gx - ax) * 0.32), cyy = lerp(ay, gsy, 0.55);
      cx.moveTo(sx0, ay);
      /* sampled curve so the last stretch can braid */
      const SAMP = 22;
      for (let s = 1; s <= SAMP; s++) {
        const t = s / SAMP;
        const bx = (1 - t) * (1 - t) * sx0 + 2 * (1 - t) * t * cxx + t * t * gsx;
        let by = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * cyy + t * t * gsy;
        if (staged && t > 0.72) by += Math.sin(t * 34 + i * 1.9) * 7 * (1 - t) / 0.28;
        cx.lineTo(bx, by);
      }
      cx.stroke();
      /* the newest paths to slide in carry their source slug */
      if (staged && i >= vis - 3 && prog < 1 && sx0 > -100 && sx0 < W + 100) {
        label(sources[i], sx0, ay - 8, 9, 'rgba(255,243,224,0.85)', 'center', 0.8);
      }
    }
    cx.restore();
    /* the carved gate itself */
    if (staged && Math.abs(gsx) < W + 300) drawCarvedGate(gsx, p, pal, sources.length);
  }
}

function drawCarvedGate(gsx, p, pal, ways) {
  const gy = gYAt(p.start);
  const hgt = 150, span = 120;
  drawPoly([[gsx - span / 2 - 12, gy], [gsx - span / 2 - 12, gy - hgt], [gsx - span / 2 + 10, gy - hgt], [gsx - span / 2 + 10, gy]], pal.ink, pal.accent);
  drawPoly([[gsx + span / 2 - 10, gy], [gsx + span / 2 - 10, gy - hgt], [gsx + span / 2 + 12, gy - hgt], [gsx + span / 2 + 12, gy]], pal.ink, pal.accent);
  drawPoly([[gsx - span / 2 - 22, gy - hgt], [gsx + span / 2 + 22, gy - hgt], [gsx + span / 2 + 16, gy - hgt - 34], [gsx - span / 2 - 16, gy - hgt - 34]], pal.ink, pal.accent);
  label(ways + ' WAYS MEET HERE', gsx, gy - hgt - 13, 12.5, INKS.cream, 'center', 2.5);
  label(p.label.toUpperCase(), gsx, gy - hgt + 16, 8.5, 'rgba(255,243,224,0.8)', 'center', 1.5);
}

function drawStretch(pi, basePal, dt, wNsky) {
  const p = M.pages[pi];
  const hollow = p.prov.night > 0;
  const pal = gradedPaletteFor(p.comm, hollow);
  const wN = hollow ? 1 : (wNsky || 0);   /* lamps light when this ground darkens */
  const T = terrainFor(pi);
  const x0 = Math.max(p.start, S.x - AVX - 40);
  const x1 = Math.min(p.start + p.len, S.x + (W - AVX) + 40);
  if (x1 <= x0) return;
  const s0 = w2s(x0), s1 = w2s(x1);

  /* night hollow: the sky above this stretch truly darkens — whatever
     hour the rest of the trail keeps. Pages edited long after midnight. */
  if (hollow && !basePal.night) {
    cx.fillStyle = 'rgba(10,5,18,' + (0.30 + 0.54 * (1 - (wNsky || 0))) + ')';
    cx.fillRect(s0, 0, s1 - s0, H);
  }

  /* path wear from commits (log scale against the most-worn page),
     the line now honestly climbing and dropping with the ground */
  const wear = Math.log(1 + p.prov.commits) / Math.log(1 + M.maxCommits);
  cx.save();
  cx.strokeStyle = basePal.night || hollow ? 'rgba(255,243,224,0.30)'
    : 'rgba(255,243,224,' + (0.52 - 0.22 * nightRamp(wN)).toFixed(3) + ')';
  const wearPath = (dy) => {
    cx.beginPath();
    let first = true;
    for (let x = x0; ; x += 48) {
      if (x > x1) x = x1;
      const sx = w2s(x), sy = gYAt(x) + dy;
      if (first) { cx.moveTo(sx, sy); first = false; } else cx.lineTo(sx, sy);
      if (x >= x1) break;
    }
    cx.stroke();
  };
  if (wear > 0.82) {
    /* stone slabs — trodden to pavement */
    cx.fillStyle = 'rgba(255,243,224,0.30)';
    for (let x = Math.ceil(x0 / 46) * 46; x < x1; x += 46) {
      cx.fillRect(w2s(x), gYAt(x + 17) + 7, 34, 5);
    }
  } else if (wear > 0.62) {
    cx.lineWidth = 2.4; wearPath(7); wearPath(12);
  } else if (wear > 0.42) {
    cx.lineWidth = 2.2; wearPath(9);
  } else if (wear > 0.22) {
    cx.setLineDash([14, 10]); cx.lineWidth = 1.8; wearPath(9);
  } else {
    cx.setLineDash([3, 13]); cx.lineWidth = 1.6; wearPath(9);
  }
  cx.restore();

  /* winter: frost ticks printed on the long-untended ground */
  if (p.season === 3) {
    cx.fillStyle = INKS.cream;
    cx.globalAlpha = 0.45;
    for (let x = Math.ceil(x0 / 84) * 84; x < x1; x += 84) {
      const j = (hashStr(p.slug + ':' + x) % 40) - 20;
      cx.fillRect(w2s(x + j), gYAt(x + j) + 3, 7, 1.6);
      cx.fillRect(w2s(x + j * 0.4 + 30), gYAt(x + j * 0.4 + 30) + 14, 5, 1.4);
    }
    cx.globalAlpha = 1;
  }

  /* lantern pools first (under everything standing) */
  for (const ln of T.lanterns) {
    const sx = w2s(ln.x);
    if (sx < -180 || sx > W + 180) continue;
    const gy = gYAt(ln.x);
    cx.fillStyle = INKS.apricot;
    cx.globalAlpha = 0.10; cx.beginPath(); cx.arc(sx, gy, 120, 0, 7); cx.fill();
    cx.globalAlpha = 0.16; cx.beginPath(); cx.arc(sx, gy, 74, 0, 7); cx.fill();
    cx.globalAlpha = 0.26; cx.beginPath(); cx.arc(sx, gy, 36, 0, 7); cx.fill();
    cx.globalAlpha = 1;
  }

  for (const fl of T.flora) drawFlora(fl, pal, p.season);

  /* the season's drift — capped, culled, and absent under reduced motion */
  if (!REDUCED && (p.season === 2 || p.season === 0)) drawDrift(p, T, x0, x1);

  /* morning mist rests where no page cites this stretch */
  if (p.inCount === 0) drawMist(p, x0, x1);

  /* page signpost, kept in repair by careDays */
  drawSign(T.sign, p, pal, wN);

  for (const b of T.benches) drawBench(b, pal);

  /* quiet furniture: boardwalks, picnics, cairns, mile-posts, frames */
  for (const f of p.furn) drawFurn(f, pal);

  /* carved waymarkers standing on this stretch */
  for (const st of p.stones) drawStone(st, pal);

  /* the trail register box, past the signpost */
  drawRegister(p, pal, wN);

  /* the hub's overlook: bench and orientation table at the high point */
  if (p.overlook) { drawFingerpost(p, pal); drawLookTable(p, pal); }

  /* the ways off the trail, living where the geography puts them */
  if (p.overlook && pi >= PORTAL_MIN_PAGE) drawPixelCity(p, pal, wN);
  if (pi === M.kioskPage) drawKiosk(pal);
  if (p.slug === M.qsSlug) drawStartSign(p.start + 64, pal);

  if (T.nightAhead) drawWarnSign(T.nightAhead.x, 'NIGHT GROUND AHEAD', pal);

  /* hazards & springs — the page's own caution and tip signage, in place */
  for (const hz of p.hazards) drawHazard(hz, pal);
  for (const sp of p.springs) drawSpring(sp, pal);

  /* card terraces — one stand per cards block, serving the real cards */
  for (const tr of p.terraces) drawTerrace(tr, pal, p, wN);

  /* lantern posts + flames */
  for (const ln of T.lanterns) {
    const sx = w2s(ln.x);
    if (sx < -60 || sx > W + 60) continue;
    const gy = gYAt(ln.x);
    cx.strokeStyle = pal.ink; cx.lineWidth = 3;
    cx.beginPath(); cx.moveTo(sx, gy); cx.lineTo(sx, gy - 74); cx.stroke();
    cx.beginPath(); cx.moveTo(sx, gy - 74); cx.lineTo(sx + 14, gy - 70); cx.stroke();
    cx.fillStyle = pal.ink;
    cx.fillRect(sx + 9, gy - 70, 10, 14);
    cx.fillStyle = INKS.apricot;
    cx.fillRect(sx + 11.5, gy - 67, 5, 8);
  }

  /* gates: this stretch's real outbound citations */
  for (const g of p.gates) {
    const sx = w2s(g.x);
    if (sx < -140 || sx > W + 140) continue;
    drawGate(sx, g, pal, wN);
  }

  /* the walkers — the real hands that kept this stretch */
  for (const wk of T.walkers) {
    let wx;
    if (REDUCED) wx = wk.x0;
    else {
      const span = p.len;
      const tw = S.t - (wk.tPause || 0);
      wx = p.start + ((((wk.x0 - p.start) - (tw * wk.speed + wk.phase)) % span) + span) % span;
    }
    const sx = w2s(wx);
    if (sx < -80 || sx > W + 80) continue;
    const gy = gYAt(wx);
    const paused = S.bubble && S.bubble.wk === wk;
    const wkMoving = !REDUCED && !paused;
    const greeting = paused || (wk.greetUntil && wk.greetUntil > S.t);
    const wopts = greeting && !paused ? { armUp: (S.t * 4 | 0) % 2 ? 2 : 1 } : null;
    drawFigure(sx - 2, gy - 1.4, wk.h * 0.94, wx / 24, 'rgba(255,243,224,0.5)', null, wkMoving, wopts);
    drawFigure(sx, gy, wk.h * 0.94, wx / 24, mix(pal.ink, INKS.violet, wk.isTop ? 0.3 : 0.12), null, wkMoving, wopts);
    if (paused) drawGesture(S.bubble, sx, gy, wk, pal);
    label(wk.name, sx, gy - 74 * wk.h, wk.isTop ? 13.5 : 12.5, 'rgba(255,243,224,0.95)', 'center', 1);
    if (wk.dates) label('WALKED HERE ' + wk.dates, sx, gy - 74 * wk.h + 15, 10.5, 'rgba(255,175,120,0.92)', 'center', 0.6);
    frameWalkers.push({ wk, wx, sx, gy, page: p });
  }
}

/* ---------------- round-4 furniture & weathers ---------------- */
const constCache = new Map();
function constellationFor(ci) {
  if (constCache.has(ci)) return constCache.get(ci);
  const c = M.communities[ci];
  const stars = c.members.map((m) => {
    const r = rngFor('star:' + m);
    const pg = M.bySlug.get(m);
    return { slug: m, fx: 0.05 + 0.90 * r(), fy: 0.05 + 0.55 * r(), hub: m === c.hub, w: pg ? pg.inCount : 0 };
  });
  const o = { stars, edges: M.commEdges[ci] || [] };
  constCache.set(ci, o);
  return o;
}
function drawConstellation(ci, a) {
  const K = constellationFor(ci);
  cx.strokeStyle = INKS.cream;
  cx.lineWidth = 1;
  cx.globalAlpha = 0.09 * a;
  cx.beginPath();
  for (const [i, j] of K.edges) {
    const A = K.stars[i], B = K.stars[j];
    if (!A || !B) continue;
    cx.moveTo(A.fx * W, A.fy * horizonY);
    cx.lineTo(B.fx * W, B.fy * horizonY);
  }
  cx.stroke();
  cx.fillStyle = INKS.cream;
  for (const st of K.stars) {
    const sz = st.hub ? 3.6 : st.w > 8 ? 2.5 : 1.8;
    cx.globalAlpha = (st.hub ? 0.95 : 0.5 + Math.min(0.35, st.w * 0.03)) * a;
    cx.fillRect(st.fx * W - sz / 2, st.fy * horizonY - sz / 2, sz, sz);
    if (st.hub) {
      cx.globalAlpha = 0.5 * a;
      cx.strokeStyle = INKS.violet;
      cx.strokeRect(st.fx * W - 4.6, st.fy * horizonY - 4.6, 9.2, 9.2);
      cx.strokeStyle = INKS.cream;
    }
  }
  cx.globalAlpha = 1;
}

function drawGusts() {
  const n = 2 + Math.round(S.wind * 5);
  cx.fillStyle = INKS.cream;
  for (let i = 0; i < n; i++) {
    const r = rngFor('gust:' + i);
    const lane = horizonY * 0.98 + r() * (groundY - horizonY * 0.98) - 8;
    const speed = 120 + S.wind * 300 + i * 23;
    const span = W + 320;
    const xx = ((S.t * speed + r() * 4096) % span) - 160;
    const len = (30 + r() * 40) * (0.5 + S.wind);
    cx.globalAlpha = (0.05 + 0.10 * S.wind) * (0.6 + 0.4 * r());
    cx.fillRect(xx, lane, len, 1.6);
    cx.fillRect(xx + len + 10, lane + 2.6, len * 0.45, 1.4);
  }
  cx.globalAlpha = 1;
}

function drawMist(p, x0, x1) {
  /* flat cream shreds, eased at the stretch edges and by the morning */
  const mBase = 0.55 + 0.45 * DAY.wts.m;
  const EDGE = 240;
  cx.fillStyle = INKS.cream;
  /* three shred bands, low over the ground — the path line stays clear */
  const bands = [[10, 11, 0.24], [27, 8, 0.16], [46, 6, 0.10]];
  for (let xs = Math.floor(x0 / 88) * 88; xs < x1; xs += 88) {
    const cxm = xs + 44;
    const edge = smoothT(clamp(Math.min(cxm - p.start, p.start + p.len - cxm) / EDGE, 0, 1));
    if (edge <= 0.01) continue;
    const gy = gYAt(cxm);
    const hsh = hashStr(p.slug + ':' + xs);
    const jig = (hsh % 10) - 5;
    for (let bi = 0; bi < bands.length; bi++) {
      const dy = bands[bi][0], hh = bands[bi][1], al = bands[bi][2];
      /* shred: every few slices a band breathes out — hard gaps, no wash */
      if (((hsh >> (bi * 3)) & 7) === 0) continue;
      cx.globalAlpha = al * mBase * edge;
      cx.fillRect(w2s(xs) - 2, gy - dy + jig * 0.5 + bi, 94, hh);
    }
  }
  cx.globalAlpha = 1;
}

function drawFurn(f, pal) {
  const sx = w2s(f.x);
  if (sx < -140 || sx > W + 140) return;
  const gy = gYAt(f.x), ink = pal.ink;
  switch (f.kind) {
    case 'boardwalk': {
      cx.fillStyle = 'rgba(255,243,224,0.62)';
      for (let i = -4; i <= 4; i++) cx.fillRect(sx + i * 12 - 4, gy + 3, 9, 5);
      cx.fillStyle = ink;
      cx.fillRect(sx - 52, gy + 2, 104, 1.6);
      cx.fillRect(sx - 52, gy + 8.6, 104, 1.6);
      break;
    }
    case 'picnic': {
      cx.fillStyle = ink;
      cx.fillRect(sx - 19, gy - 24, 38, 4);
      cx.strokeStyle = ink; cx.lineWidth = 2.6;
      cx.beginPath(); cx.moveTo(sx - 12, gy - 20); cx.lineTo(sx - 20, gy); cx.stroke();
      cx.beginPath(); cx.moveTo(sx + 12, gy - 20); cx.lineTo(sx + 20, gy); cx.stroke();
      cx.fillRect(sx - 30, gy - 12, 14, 3.2);
      cx.fillRect(sx + 16, gy - 12, 14, 3.2);
      break;
    }
    case 'cairn': {
      drawPoly([[sx - 13, gy], [sx + 13, gy], [sx + 10, gy - 7], [sx - 10, gy - 7]], ink, pal.accent);
      drawPoly([[sx - 10, gy - 7], [sx + 10, gy - 7], [sx + 7, gy - 13], [sx - 7, gy - 13]], ink);
      drawPoly([[sx - 7, gy - 13], [sx + 7, gy - 13], [sx + 4.4, gy - 18.4], [sx - 4.4, gy - 18.4]], ink);
      cx.fillStyle = INKS.cream;
      cx.fillRect(sx - 2.6, gy - 22, 5.2, 3.6);
      break;
    }
    case 'milepost': {
      cx.strokeStyle = ink; cx.lineWidth = 3.4;
      cx.beginPath(); cx.moveTo(sx, gy); cx.lineTo(sx, gy - 46); cx.stroke();
      cx.fillStyle = INKS.cream;
      cx.fillRect(sx - 14, gy - 58, 28, 13);
      cx.strokeStyle = ink; cx.lineWidth = 1.5;
      cx.strokeRect(sx - 14, gy - 58, 28, 13);
      label(f.label, sx, gy - 48.6, 6.5, INK_DARK, 'center', 0.8);
      break;
    }
    case 'frame': {
      cx.strokeStyle = ink; cx.lineWidth = 2.4;
      cx.beginPath(); cx.moveTo(sx - 10, gy); cx.lineTo(sx, gy - 40); cx.stroke();
      cx.beginPath(); cx.moveTo(sx + 10, gy); cx.lineTo(sx, gy - 40); cx.stroke();
      cx.fillStyle = INKS.cream;
      cx.fillRect(sx - 14, gy - 58, 28, 22);
      cx.strokeStyle = ink; cx.lineWidth = 2;
      cx.strokeRect(sx - 14, gy - 58, 28, 22);
      cx.fillStyle = pal.accent;
      cx.fillRect(sx - 10, gy - 54, 20, 14);
      break;
    }
  }
}

function drawStone(st, pal) {
  const sx = w2s(st.x);
  if (sx < -180 || sx > W + 180) return;
  const gy = gYAt(st.x), ink = pal.ink;
  const near = Math.abs(sx - AVX) < (st.kind === 'border' ? 400 : 560);
  if (st.kind === 'end') {
    drawPoly([[sx - 26, gy], [sx + 26, gy], [sx + 20, gy - 12], [sx - 20, gy - 12]], ink, pal.accent);
    drawPoly([[sx - 20, gy - 12], [sx + 20, gy - 12], [sx + 15, gy - 23], [sx - 15, gy - 23]], ink);
    drawPoly([[sx - 15, gy - 23], [sx + 15, gy - 23], [sx + 10, gy - 33], [sx - 10, gy - 33]], ink);
    drawPoly([[sx - 10, gy - 33], [sx + 10, gy - 33], [sx + 6, gy - 42], [sx - 6, gy - 42]], ink);
    cx.fillStyle = INKS.cream;
    cx.fillRect(sx - 4, gy - 47, 8, 5);
  } else if (st.kind === 'half') {
    drawPoly([[sx - 17, gy], [sx - 14, gy - 40], [sx, gy - 47], [sx + 14, gy - 40], [sx + 17, gy]], ink, pal.accent);
    cx.fillStyle = INKS.cream;
    cx.fillRect(sx - 12, gy - 30, 24, 3);
  } else if (st.kind === 'border') {
    drawPoly([[sx - 15, gy], [sx - 12, gy - 44], [sx + 2, gy - 50], [sx + 13, gy - 41], [sx + 15, gy]], ink, pal.accent);
    cx.fillStyle = INKS.cream; cx.globalAlpha = 0.5;
    cx.fillRect(sx - 8, gy - 38, 16, 2);
    cx.fillRect(sx - 8, gy - 33, 16, 2);
    cx.globalAlpha = 1;
  } else {
    drawPoly([[sx - 13, gy], [sx - 10, gy - 22], [sx, gy - 27], [sx + 10, gy - 21], [sx + 13, gy]], ink, pal.accent);
  }
  if (near && !LBL.stoneHold.has(st)) {
    const top = st.kind === 'mile' ? 40 : 62;
    label(st.l1, sx, gy - top, st.kind === 'mile' ? 8.5 : 9.5, 'rgba(255,243,224,0.9)', 'center', 1.4);
    label(st.l2, sx, gy - top + 11, 7.5, 'rgba(255,162,107,0.85)', 'center', 0.8);
  }
}

function drawRegister(p, pal, wN) {
  const sx = w2s(p.regX);
  if (sx < -80 || sx > W + 80) return;
  const gy = gYAt(p.regX), ink = pal.ink;
  cx.strokeStyle = ink; cx.lineWidth = 3;
  cx.beginPath(); cx.moveTo(sx, gy); cx.lineTo(sx, gy - 30); cx.stroke();
  drawPoly([[sx - 15, gy - 30], [sx + 15, gy - 30], [sx + 15, gy - 48], [sx - 15, gy - 48]], ink, pal.accent);
  drawPoly([[sx - 18, gy - 48], [sx + 18, gy - 48], [sx + 13, gy - 55], [sx - 13, gy - 55]], ink);
  cx.fillStyle = 'rgba(255,243,224,0.85)';
  cx.fillRect(sx - 10, gy - 44, 20, 3);
  if (REGBOOK[p.slug]) {
    cx.fillStyle = INKS.cream;
    cx.fillRect(sx - 6, gy - 53, 12, 5);
    cx.fillStyle = INKS.rose;
    cx.fillRect(sx + 2, gy - 52, 3, 3);
  }
  if (Math.abs(sx - AVX) < 210) {
    label('TRAIL REGISTER', sx, gy - 66, 7.5, 'rgba(255,243,224,0.8)', 'center', 1);
    if (REGBOOK[p.slug]) label('YOUR LINE IS INSIDE', sx, gy - 57.5, 6.5, 'rgba(255,162,107,0.8)', 'center', 0.6);
  }
}

function drawLookTable(p, pal) {
  const o = p.overlook;
  const sx = w2s(o.x);
  if (sx < -120 || sx > W + 120) return;
  const gy = gYAt(o.x), ink = pal.ink;
  /* wave 3, findability: a tall carved pole and an accent pennant give the
     table enough silhouette to be spotted at walking speed */
  cx.strokeStyle = ink; cx.lineWidth = 2.6;
  cx.beginPath(); cx.moveTo(sx - 44, gy); cx.lineTo(sx - 44, gy - 92); cx.stroke();
  drawPoly([[sx - 44, gy - 92], [sx - 16, gy - 85], [sx - 44, gy - 78]], pal.accent);
  cx.fillStyle = ink;
  cx.fillRect(sx - 58, gy - 20, 40, 4.5);
  cx.fillRect(sx - 54, gy - 15, 5, 15);
  cx.fillRect(sx - 27, gy - 15, 5, 15);
  cx.fillRect(sx - 58, gy - 34, 4, 15);
  cx.fillRect(sx - 58, gy - 36, 40, 4);
  drawPoly([[sx + 6, gy], [sx + 26, gy], [sx + 23, gy - 26], [sx + 9, gy - 26]], ink, pal.accent);
  drawPoly([[sx - 2, gy - 26], [sx + 34, gy - 26], [sx + 30, gy - 36], [sx + 2, gy - 33]], INKS.cream);
  cx.strokeStyle = ink; cx.lineWidth = 1.6;
  cx.beginPath(); cx.moveTo(sx - 2, gy - 26); cx.lineTo(sx + 34, gy - 26); cx.stroke();
  cx.lineWidth = 1;
  cx.beginPath(); cx.moveTo(sx + 8, gy - 28.5); cx.lineTo(sx + 22, gy - 33); cx.stroke();
  cx.beginPath(); cx.moveTo(sx + 12, gy - 28); cx.lineTo(sx + 28, gy - 32); cx.stroke();
  const rk = LBL.rank.has(o) ? LBL.rank.get(o) : 2;
  if (rk === 0) {
    label('OVERLOOK', sx, gy - 54, 8, 'rgba(255,243,224,0.85)', 'center', 1.2);
    label(o.landmarks.length ? o.landmarks.length + ' LANDMARKS IN VIEW' : 'ALL SKY — THIS HUB CITES NO PAGES',
      sx, gy - 44, 7, 'rgba(255,162,107,0.8)', 'center', 0.7);
  } else if (rk === 1) {
    label('OVERLOOK', sx, gy - 54, 7, 'rgba(255,243,224,0.38)', 'center', 0.6);
  }
}

/* THE OVERLOOKS MUST BE FINDABLE (wave 3): a carved fingerpost OVERLOOK
   AHEAD stands a couple of screens before each orientation table, in the
   waymarker idiom — a post, a pointing board notched east, carved text. */
function drawFingerpost(p, pal) {
  const o = p.overlook;
  if (o.postX == null) return;
  const sx = w2s(o.postX);
  if (sx < -140 || sx > W + 140) return;
  const gy = gYAt(o.postX), ink = pal.ink;
  cx.strokeStyle = ink; cx.lineWidth = 3.4;
  cx.beginPath(); cx.moveTo(sx, gy); cx.lineTo(sx, gy - 56); cx.stroke();
  drawPoly([[sx - 36, gy - 56], [sx + 30, gy - 56], [sx + 40, gy - 49], [sx + 30, gy - 42], [sx - 36, gy - 42]], ink, pal.accent);
  cx.fillStyle = INKS.cream;
  cx.globalAlpha = 0.9;
  cx.fillRect(sx - 32, gy - 53.5, 58, 9);
  cx.globalAlpha = 1;
  label('OVERLOOK AHEAD', sx - 3, gy - 52, 6.2, INK_DARK, 'center', 0.8);
  if (Math.abs(sx - AVX) < 230) {
    /* under the board, clear of the row the gate labels live on */
    label(fmt(Math.max(1, Math.round(wordsAt(o.x) - wordsAt(o.postX)))) + 'M EAST — THE TABLE AND ITS BENCH',
      sx, gy - 31, 6.5, 'rgba(255,162,107,0.8)', 'center', 0.6);
  }
}

/* ---------------- the trail dog ---------------- */
/* THE WEST WALL. The trail starts at x = 0 and the dog is held inside it,
   so a resting place west of the walker is simply unreachable while she
   stands in the first fifty pixels of the world. Round 10 chose that
   unreachable spot anyway and left the dog running on the spot at the
   trailhead — the DEFAULT first-visit position — beside a walker fast
   asleep: no curl, no sigh, no small snore, and a bark going off next to a
   sleeping woman because the pose it checks was never reached. A resting
   place is now chosen on the side she can actually get to: her own side
   when there is room for it, the walker's other side when the wall is in
   the way, and never outside the world. */
const DOG_WEST = 10;
/* THE OWNER'S CONDITION, IN ONE PLACE (round 12). She has stopped, and you
   have stopped with her: no walking, no click-to-walk under way, no overlay
   over the trail, and the stop has held for a beat rather than being the
   half-second between two strides. Every voice of hers that is not the
   pant reads this before it sounds. */
function stoppedTogether() {
  return S.idleT > 1.2;
}
function dogRest(ax, off) {
  let t = ax - off;
  if (t < DOG_WEST + 2) t = ax + off;      /* the wall is west: take the east */
  return clamp(t, DOG_WEST, M.worldEnd);
}
/* w5r2 — THE WHISTLE (owner: "parfois on perd son chien !"). One key calls
   her home: W has belonged to the jump since round 1, so the first free
   letter took the job — C, named in the Key. A short two-note riso whistle
   from the walker; wherever she is, she gives ONE bark in answer from her
   distance — panned and thinned by how far she is, floored so a genuine
   answer is never dropped, never louder than a bark at heel — then sprints
   back and arrives with a couple of seconds of light happy panting, fading
   as she calms: the one lawful pant, earned by the run. Whistling with her
   already at heel: she just looks up, no bark, no sprint. Dog toggle off =
   the key does nothing; SFX off mutes, never stops; the whistle counts in
   the sound ledger like every other voice; reduced motion teleports her to
   heel with the answer bark only. */
function whistleCall() {
  if (!DOG.on) return;                      /* dog off: the key is dead */
  /* a held or hammered C is one whistle, not a siren: the key auto-repeat
     is dropped at the handler, and this catches the spam-click too. The
     answer bark bypasses her floor by design (an answer is owed), so the
     whistle itself must be the thing that cannot machine-gun. */
  if (S.t < (S.whistleCD || 0)) return;
  S.whistleCD = S.t + 1.3;
  audEv('whistle', S.x);                    /* the walker's own two notes */
  const gap = Math.abs(DOG.x - S.x);
  const att = 1 / (1 + Math.pow(gap / 430, 2));
  const vol = Math.min(6, Math.max(1, 0.16 / Math.max(att, 1e-4)));
  if (REDUCED) {
    if (gap > 120) {
      DOG.x = clamp(S.x - 54, DOG_WEST, M.worldEnd);
      /* the answer, from where she was — unless this is the shore, where
         she is silent by the standing law (she still comes) */
      if (!S.atLE) dogVoiceNow('dogbark', DOG.x, vol);
    }
    needsDraw = true;
    return;
  }
  if (DOG.recall) return;                   /* she is already coming */
  if (gap <= 120) {
    DOG.lookUp = S.t + 1.4;                 /* at heel already: she just looks up */
    return;
  }
  /* AT THE SHORE SHE IS SILENT — the standing law outranks the answer:
     the whistle sounds, she comes, but no bark and no pant break the
     coast's own quiet (the arrival pant checks the same flag). */
  if (!S.atLE) DOG.answer = { at: S.t + 0.55, vol };  /* the bark answers the second note */
  DOG.recall = { t0: S.t };
  DOG.pend = null; DOG.found = 0; DOG.sleepX = null; DOG.restX = null;
  if (DOG.state !== 'follow') { DOG.state = 'follow'; DOG.stateT = 0; }
}
function updateDog(dt) {
  const p = S.page;
  if (REDUCED) {
    /* the calm variant: she simply keeps pace at your side */
    DOG.x = clamp(S.x - 54, DOG_WEST, M.worldEnd);
    DOG.pose = 'stand'; DOG.face = 1;
    return;
  }
  DOG.stateT += dt;
  /* a sweep carries you BOTH: a recall mid-sweep is moot, and its answer
     already sounded — clear them rather than let a gate end in the pant */
  if (S.sweep) { DOG.x = S.x - 60; DOG.pose = 'run'; DOG.moving = true; DOG.face = S.face; DOG.pend = null; DOG.recall = null; return; }
  /* w5r2 — the whistle's answer, owed a beat after the second note */
  if (DOG.answer && S.t >= DOG.answer.at) {
    dogVoiceNow('dogbark', DOG.x, DOG.answer.vol);
    DOG.answer = null;
  }
  /* w5r2 — the recall: she sprints the whole gap home, settles at heel */
  if (DOG.recall) {
    const heel = clamp(S.x - (S.face || 1) * 48, DOG_WEST, M.worldEnd);
    const dxr = heel - DOG.x;
    if (Math.abs(dxr) <= 10 || S.t - DOG.recall.t0 > 30) {
      DOG.recall = null;
      DOG.ran = 0; DOG.gapMax = 0;      /* the sprint earned the pant, not a catch-up bark */
      AUD.cuBarkAt = Math.max(AUD.cuBarkAt || 0, S.t + 8);
      DOG.heelHold = S.t + 3;           /* she settles AT HEEL, not back out front */
      /* light happy panting, fading as she calms — kept off the shore */
      if (!S.atLE) dogVoiceNow('dogpantfade', DOG.x);
      DOG.pose = 'sit'; DOG.moving = false;
    } else {
      const spr = clamp(Math.abs(dxr) * 2.8, 260, 680);   /* a real sprint home */
      DOG.x = clamp(DOG.x + Math.sign(dxr) * spr * dt, DOG_WEST, M.worldEnd);
      DOG.face = Math.sign(dxr) || DOG.face;
      DOG.moving = true; DOG.pose = 'run';
      return;
    }
  }
  /* A SNUFFLE BAD TIMING LANDED ON IS NOT A SNUFFLE SPENT. Two timings can
     say no at the instant her nose reaches a genuine door: the floor (a
     shower made her shake three seconds earlier), and — round 13 — the
     walker's own idle clock, because she outruns you, and at a door you
     stopped at together her nose arrives half a second before your 1.2 s
     of stillness has cleared. Round 12 held the first and silently SPENT
     the second onto the 45 s door cooldown, which is why the verifier
     stood at a well-cited door and heard nothing. Both are now held the
     same way: she keeps her nose down and says it the moment you are both
     properly standing there and the floor is clear. The hold survives only
     while the stop is real — you within 460 px of the door, her still at
     it — and twelve seconds, then she has forgotten about it, as dogs do.
     While you WALK past a door the hold dies with your third stride
     (460 px is under 1.4 s at full stride), so an ordinary walking minute
     still measures zero. */
  if (DOG.pend) {
    const q = DOG.pend;
    if (S.t > q.until || Math.abs(S.x - q.x) > 460 || Math.abs(DOG.x - q.x) > 150) DOG.pend = null;
    else if (stoppedTogether() && S.t >= (AUD.dogFloorAt || 0) && S.t > (AUD.sniffAt || 0)) {
      const tq = M.bySlug.get(q.tgt);
      const kind = (tq && tq.inCount >= M.yipMin) ? 'dogyip' : 'dogsniff';
      if (dogVoice(kind, DOG.x)) {
        AUD.sniffAt = S.t + 90 + Math.random() * 60;
        if (DOG.state !== 'shake') { DOG.state = 'sniff'; DOG.stateT = 0; DOG.found = 0; }
      }
      DOG.pend = null;
    }
  }
  /* wet fur: the mist of an uncited stretch, or the shower a weather front
     brings at a biome border. One shake for each, once per stretch. */
  const wetKey = p.inCount === 0 ? 'mist:' + p.slug
    : (WX.rain > 0.55 ? 'rain:' + WX.showers : '');   /* a real shower, once */
  /* …and seldom, across stretches. Round 10 held her to one shake per wet
     stretch and one per half-minute, and the verifier still counted five in
     five minutes — the most frequent of her six voices, and the one that
     read closest to a tic. A shake is now a minute and a half apart at the
     very least, and up to two and a quarter: two in a long mixed walk, not
     five. The stretch still has to be genuinely wet; she just waits. */
  if (wetKey && DOG.shookOn !== wetKey && DOG.state !== 'shake' &&
      stoppedTogether() && !DOG.moving &&
      S.t > (DOG.shakeAt || 0) && Math.abs(DOG.x - S.x) < 420) {
    DOG.state = 'shake'; DOG.stateT = 0; DOG.shookOn = wetKey;
    DOG.found = 0;                  /* a shake interrupts a sniff: no stale yip */
    DOG.shakeAt = S.t + 90 + Math.random() * 45;
    if (!S.atLE) dogVoice('dogshake', DOG.x);   /* the shore keeps its silence */
  }
  if (DOG.state === 'shake') {
    DOG.pose = 'shake'; DOG.moving = false;
    if (DOG.stateT > 1.0) { DOG.state = 'follow'; DOG.stateT = 0; }
    return;
  }
  if (DOG.state === 'sniff') {
    DOG.pose = 'sniff'; DOG.moving = false;
    if (DOG.stateT > 1.8) {
      DOG.state = 'follow'; DOG.stateT = 0;
      /* one of the few doors in the top fiftieth: her nose comes up and she
         says so. Booked at the start of the sniff, so an investigation is
         ever only one sound — a snuffle OR a yip, never both.
         W3 ROUND 2 — THE STOP IS RE-READ AT THE INSTANT SHE SPEAKS. The
         booking proved you were standing when her nose went down; her nose
         comes up 1.8 s later, and if you have walked on in between, the
         yip must not land mid-stride. It is HELD instead (the round-13
         pend, symmetric at last): given the moment you genuinely stand at
         that door again, forgotten in twelve seconds or three strides. */
      if (DOG.found) {
        DOG.found = 0;
        if (stoppedTogether()) {
          if (dogVoice('dogyip', DOG.x)) AUD.sniffAt = S.t + 90 + Math.random() * 60;
        } else if (DOG.foundTgt) {
          DOG.pend = { x: DOG.foundX ?? DOG.x, tgt: DOG.foundTgt, until: S.t + 12 };
        }
      }
    }
    return;
  }
  const idle = Math.abs(S.vx) < 1 && !S.overlay && S.target == null;
  /* a well-cited door within nose range pulls her — the nose always wins */
  let sniffPull = null;
  /* w5r2: she reads the doors along YOUR passage. Each investigation costs
     her 1.8 s while you walk on ~600 px, and until this round the next
     door near HER — by then half a screen behind you — pulled her again,
     chaining her ever further back (measured 1,100 px and growing on a
     dense stretch). A door is only worth the diversion while she is near
     you, which is also what keeps the passing snuffle within earshot. */
  if (DOG.sleepX == null && Math.abs(DOG.x - S.x) < 320) {
    const dogPage = pageAt(clamp(DOG.x, 0, M.totalPx - 1));
    for (const g of dogPage.gates) {
      const tp = M.bySlug.get(g.tgt);
      if (!tp || tp.inCount < M.sniffMin) continue;
      if ((DOG.sniffCD.get(g.x) || 0) > S.t) continue;
      if (Math.abs(g.x - DOG.x) < 130) { sniffPull = g; break; }
    }
  }
  let tx;
  if (sniffPull) {
    DOG.restX = null;
    tx = sniffPull.x - 14;
    if (Math.abs(DOG.x - tx) < 7) {
      DOG.state = 'sniff'; DOG.stateT = 0;
      DOG.found = 0;
      /* SHE SPEAKS WHEN YOU HAVE BOTH STOPPED (round 12, the owner's rule:
         "en marchant normalement il n'y a pas de raison qu'il fasse du
         bruit"). Her nose still works while you walk — she runs ahead and
         reads the door, exactly as before — but the SOUND belongs to the
         moment you stopped there with her, and even then only once every
         ninety seconds to two and a half minutes, drawn fresh each time.
         The corpus holds 522 doors past sniffMin; at a walking stride she
         met one every few seconds, which is how the snuffle became a tic. */
      const worth = !S.atLE && S.t > (AUD.sniffAt || 0);
      /* A gesture bad timing lands on is not a gesture spent: if what is
         in the way is only the floor (a few seconds) or the fact that you
         have not FINISHED stopping — her nose beats your idle clock to the
         door by half a second whenever you stop at one together — the
         snuffle is HELD (DOG.pend, above) and given the moment you are
         both properly standing there. If her own cadence is what says no,
         she has nothing to add about this door for a while, and nothing
         is held. */
      const ready = stoppedTogether() && S.t >= (AUD.dogFloorAt || 0);
      /* w5r2 — THE SNIFF RETURNS TO THE EAR (owner: "il me semble qu'on
         n'entend plus le chien sniffer aux portes"). Diagnosed before
         touching anything: the investigation still fired on every stroll
         (her nose went down at every qualifying door), but round 12's
         stop-to-speak patch left the VOICE no path at walking pace — it
         demanded a full stop (stoppedTogether) plus the 90-150 s clock,
         and the walking hold above dies within three strides. A visitor
         passing ten gates heard zero, not few. So: the plain snuffle is
         audible IN PASSING again when the walker is close enough to hear
         it (within 480 px — earshot, not the whole valley), on its own
         stroll cadence (6-11 s, drawn fresh each time — never two within
         six seconds, and with the walk between doors that measures a few
         per ten gates at the corpus's own gate spacing, still never the
         round-12 tic on the densest ground), the 45 s per-door
         clock and the 4-9 s floor untouched. The STOP keeps its richer
         law: the yip still belongs to standing at the rare door with her,
         and the stopped snuffle keeps its 90-150 s clock. */
      const passing = !S.atLE && !stoppedTogether() &&
        Math.abs(S.x - sniffPull.x) < 480 && S.t > (AUD.sniffWalkAt || 0);
      if (worth && ready) {
        const tp2 = M.bySlug.get(sniffPull.tgt);
        if (tp2 && tp2.inCount >= M.yipMin) {
          DOG.found = 1;                                      /* voiced on the way up */
          DOG.foundX = sniffPull.x; DOG.foundTgt = sniffPull.tgt;   /* w3r2: the hold needs the door */
        }
        else if (dogVoice('dogsniff', DOG.x)) AUD.sniffAt = S.t + 90 + Math.random() * 60;
      } else if (passing && dogVoice('dogsniff', DOG.x)) {
        AUD.sniffWalkAt = S.t + 6 + Math.random() * 5;
      } else if (worth) {
        DOG.pend = { x: sniffPull.x, tgt: sniffPull.tgt, until: S.t + 12 };
      }
      DOG.sniffCD.set(sniffPull.x, S.t + 45);
      /* the bark no longer belongs to the door: it is rare, it is hers,
         and it is on its own clock (see audioTick) */
    }
  } else if (idle && S.idleT > 17) {
    if (DOG.sleepX == null) {
      const T = terrainFor(p.idx);
      let bb = null;
      for (const b of T.benches) {
        if (!b.broken && Math.abs(b.x - S.x) < 420 && (!bb || Math.abs(b.x - S.x) < Math.abs(bb.x - S.x))) bb = b;
      }
      DOG.sleepX = bb ? clamp(bb.x + 34, DOG_WEST, M.worldEnd) : dogRest(S.x, 44);
    }
    /* once the walker has nodded off, the dog curls up against her,
       wherever she happens to be sitting — no bench is worth the distance */
    tx = SLP.stage >= 2 ? dogRest(S.x + (SLP.seatDX || 0), 40) : DOG.sleepX;
    DOG.restX = tx;               /* where she is actually going to lie down */
  } else {
    DOG.sleepX = null; DOG.restX = null;
    /* w5r2: a couple of seconds after a whistle recall she keeps to heel
       rather than running straight back out front */
    tx = idle ? dogRest(S.x, 44) :
      (S.t < (DOG.heelHold || 0) ? S.x - (S.face || 1) * 48 : S.x + (S.face || 1) * 150);
  }
  const dx = tx - DOG.x;
  const cap = Math.abs(S.vx) > 1 ? Math.abs(S.vx) * 1.6 : 430;
  const sp = clamp(Math.abs(dx) * 2.6, 0, cap);
  if (Math.abs(dx) > 3) {
    DOG.x += Math.sign(dx) * sp * dt;
    DOG.face = Math.sign(dx) || DOG.face;
    DOG.moving = sp > 26;
    if (DOG.moving) {
      DOG.ran = (DOG.ran || 0) + sp * dt;
      /* the widest daylight there ever was between you on this run */
      DOG.gapMax = Math.max(DOG.gapMax || 0, Math.abs(dx));
    }
  } else {
    DOG.moving = false;
    const ran0 = DOG.ran || 0, gap0 = DOG.gapMax || 0;
    /* the truly long run — a gate or a fast travel opened nine hundred
       pixels — still earns the rare pant once you have stopped together */
    if (ran0 > 900 && gap0 > 900) { DOG.caught = 1; DOG.caughtAt = S.t; }
    /* THE CATCH-UP BARK — her signature (the owner refined his silence
       order: she must not be quasi-mute). She fell behind — a door she
       investigated, a gate that carried you — sprinted the gap down, and
       arrives at your side with ONE happy bark. Earned every time, welcome
       every time. Ordinary heel-keeping never opens this much daylight:
       her lead is 150 px and a turn-around swings about 300-360; a door
       she stayed at while you strode on opens 450 and more, which is
       exactly the run that earns the voice. (A gate is different: the
       travel carries you BOTH, so a gate arrival keeps its shipped rare
       pant, not a bark — she never sprinted.) Never at the shore, never
       arriving at a rest spot, never under reduced motion. */
    if (ran0 > 400 && gap0 > 440 && !S.atLE && DOG.on && !REDUCED &&
        DOG.restX == null && Math.abs(DOG.x - S.x) < 260 && S.t > (AUD.cuBarkAt || 0)) {
      AUD.cuBarkAt = S.t + 6 + Math.random() * 4;
      DOG.cuBarks = (DOG.cuBarks || 0) + 1;
      dogVoiceNow('dogbark', DOG.x);
    }
    DOG.ran = 0; DOG.gapMax = 0;
  }
  DOG.x = clamp(DOG.x, DOG_WEST, M.worldEnd);
  /* against where she was actually sent, not against a spot behind a wall */
  if (DOG.restX != null && Math.abs(DOG.x - DOG.restX) < 8) DOG.pose = 'sleep';
  else if (idle && S.idleT > 1.1 && Math.abs(dx) <= 8) DOG.pose = 'sit';
  else DOG.pose = DOG.moving ? 'run' : 'stand';
}

function drawDog(pal) {
  const sx = w2s(DOG.x);
  if (sx < -90 || sx > W + 90) return;
  const gy = gYAt(DOG.x);
  dogSil(sx - 2.2, gy - 1.4, 'rgba(255,243,224,0.55)', null);
  dogSil(sx, gy, pal.ink, INKS.rose);
}
function dogSil(px, py, ink, collar) {
  const frame = REDUCED ? 1 : Math.floor(S.t * 9) % 3;
  cx.save();
  cx.translate(px, py);
  cx.scale(DOG.face || 1, 1);
  if (DOG.pose === 'shake' && !REDUCED) cx.rotate((Math.floor(S.t * 13) % 2 ? 1 : -1) * 0.15);
  cx.fillStyle = ink; cx.strokeStyle = ink;
  cx.lineWidth = 2.6; cx.lineCap = 'round';
  if (DOG.pose === 'sleep') {
    cx.fillRect(-14, -7, 27, 7);
    cx.beginPath(); cx.arc(13, -6, 5, 0, 7); cx.fill();
    cx.fillRect(14, -4, 6, 3);
    cx.beginPath(); cx.moveTo(-14, -5); cx.lineTo(-20, -2); cx.stroke();
    if (collar && !REDUCED && Math.floor(S.t * 1.4) % 2) {
      cx.fillStyle = INKS.cream; cx.globalAlpha = 0.7;
      cx.font = (9 * TYPE_SCALE) + 'px Georgia, serif'; cx.textAlign = 'center';
      cx.fillText('z', 8, -14);
      cx.globalAlpha = 1; cx.fillStyle = ink;
    }
  } else if (DOG.pose === 'sit') {
    /* w5r2: a whistle with her already at heel — she just looks up, the
       head and muzzle raised for a beat, the same flat parts */
    const up = (!REDUCED && (DOG.lookUp || 0) > S.t) ? 3.4 : 0;
    drawPoly([[-8, 0], [-7, -14], [0, -15], [3, 0]], ink);
    cx.beginPath(); cx.moveTo(4, -13); cx.lineTo(6, 0); cx.stroke();
    cx.beginPath(); cx.arc(6, -18 - up, 5.4, 0, 7); cx.fill();
    cx.fillRect(6, -20.5 - up, 9, 4);
    drawPoly([[2, -22 - up], [5, -28 - up], [7, -21 - up]], ink);
    cx.beginPath(); cx.moveTo(-8, -3); cx.lineTo(-15, -8); cx.stroke();
    if (collar) { cx.fillStyle = collar; cx.fillRect(2, -16, 6, 2.2); cx.fillStyle = ink; }
  } else if (DOG.pose === 'sniff') {
    const bob = REDUCED ? 0 : [0, 1.6, 0.8][Math.floor(S.t * 7) % 3];
    cx.fillRect(-11, -13, 22, 8);
    cx.beginPath(); cx.moveTo(-11, -11); cx.lineTo(-17, -18); cx.stroke();
    cx.beginPath(); cx.moveTo(-8, -6); cx.lineTo(-8, 0); cx.stroke();
    cx.beginPath(); cx.moveTo(8, -6); cx.lineTo(8, 0); cx.stroke();
    cx.beginPath(); cx.arc(13, -6 + bob, 4.8, 0, 7); cx.fill();
    cx.fillRect(13, -4 + bob, 7, 3);
    drawPoly([[10, -10 + bob], [12, -15 + bob], [15, -9 + bob]], ink);
    if (collar) { cx.fillStyle = collar; cx.fillRect(9, -9 + bob, 5.5, 2.2); cx.fillStyle = ink; }
    if (collar && !REDUCED && frame === 2) {
      cx.fillStyle = INKS.cream; cx.globalAlpha = 0.6;
      cx.fillRect(20, -2 + bob, 2.5, 2.5); cx.fillRect(24, -5 + bob, 2, 2);
      cx.globalAlpha = 1; cx.fillStyle = ink;
    }
  } else {
    const up = (!REDUCED && (DOG.lookUp || 0) > S.t && DOG.pose !== 'run') ? 3.4 : 0;
    cx.fillRect(-11, -16, 22, 8);
    const legs = (DOG.pose === 'run' && !REDUCED) ? [[-8, 4], [8, -4], [0, 0]][frame] : [0, 0];
    cx.beginPath(); cx.moveTo(-8, -9); cx.lineTo(-8 + legs[0] * 0.5, 0); cx.stroke();
    cx.beginPath(); cx.moveTo(8, -9); cx.lineTo(8 + legs[1] * 0.5, 0); cx.stroke();
    cx.beginPath(); cx.moveTo(-11, -14); cx.lineTo(-17, DOG.pose === 'run' ? -22 + (frame === 1 ? 1.5 : 0) : -20); cx.stroke();
    cx.beginPath(); cx.arc(13, -18 - up, 5.2, 0, 7); cx.fill();
    cx.fillRect(13, -19.5 - up, 8, 3.6);
    drawPoly([[9, -22 - up], [11, -28 - up], [14, -21 - up]], ink);
    if (collar) { cx.fillStyle = collar; cx.fillRect(9, -16.5, 6, 2.4); cx.fillStyle = ink; }
    if (DOG.pose === 'shake' && collar && !REDUCED) {
      cx.fillStyle = INKS.cream; cx.globalAlpha = 0.7;
      cx.fillRect(-16, -24, 2.5, 2.5); cx.fillRect(14, -27, 2.5, 2.5);
      cx.fillRect(-2, -29, 2, 2); cx.fillRect(20, -12, 2, 2);
      cx.globalAlpha = 1; cx.fillStyle = ink;
    }
  }
  cx.lineCap = 'butt';
  cx.restore();
}

/* falling leaves (autumn) and petals (spring) — flat flecks, capped */
function drawDrift(p, T, x0, x1) {
  const n = Math.min(12, 3 + Math.floor(p.len / 900));
  const autumn = p.season === 2;
  cx.fillStyle = autumn ? INKS.apricot : INKS.rose;
  cx.globalAlpha = 0.9;
  for (let i = 0; i < n; i++) {
    const r = rngFor('drift:' + p.slug + ':' + i);
    const bx = p.start + r() * p.len;
    if (bx < x0 - 40 || bx > x1 + 40) continue;
    const spd = autumn ? 0.10 + r() * 0.08 : 0.06 + r() * 0.05;
    const ph = ((S.t * spd + r()) % 1);
    const wx = bx + Math.sin(ph * 6.28 * 2 + i) * 26 + ph * (24 + WIND * 46);
    const sx = w2s(wx);
    if (sx < -20 || sx > W + 20) continue;
    const gy = gYAt(wx);
    const yy = gy - 116 + ph * 112;
    cx.fillRect(sx, yy, autumn ? 3.5 : 2.5, autumn ? 2.5 : 2.5);
  }
  cx.globalAlpha = 1;
}

function drawSign(sg, p, pal, wN) {
  const sx = w2s(sg.x);
  if (sx < -160 || sx > W + 160) return;
  cx.save();
  cx.translate(sx, gYAt(sg.x));
  cx.rotate(sg.tilt);
  cx.strokeStyle = pal.ink; cx.lineWidth = 4;
  cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(0, -86); cx.stroke();
  const wdt = 158, hgt = 52;
  cx.fillStyle = pal.accent; cx.globalAlpha = 0.5;
  cx.fillRect(-wdt / 2 + 3, -86 - hgt + 2, wdt, hgt);
  cx.globalAlpha = 1;
  cx.fillStyle = INKS.cream;
  cx.fillRect(-wdt / 2, -86 - hgt, wdt, hgt);
  cx.strokeStyle = pal.ink; cx.lineWidth = 2;
  cx.strokeRect(-wdt / 2, -86 - hgt, wdt, hgt);
  if (sg.cracked) {
    cx.lineWidth = 1;
    cx.beginPath(); cx.moveTo(-wdt / 2 + 18, -86 - hgt); cx.lineTo(-wdt / 2 + 30, -86 - hgt + hgt * 0.6); cx.stroke();
  }
  /* the ranger maintenance ticket, tacked to the post below the plate */
  cx.save();
  cx.translate(6, -60); cx.rotate(0.05);
  cx.fillStyle = pal.accent; cx.globalAlpha = 0.5;
  cx.fillRect(2, 2, 15, 20);
  cx.globalAlpha = 1;
  cx.fillStyle = INKS.cream;
  cx.fillRect(0, 0, 15, 20);
  cx.strokeStyle = pal.ink; cx.lineWidth = 1.2;
  cx.strokeRect(0, 0, 15, 20);
  cx.fillStyle = INKS.rose;
  cx.fillRect(6, 2.4, 3, 3);
  cx.fillStyle = pal.ink;
  cx.fillRect(2.5, 8, 10, 1.2); cx.fillRect(2.5, 11, 10, 1.2); cx.fillRect(2.5, 14, 7, 1.2);
  cx.restore();
  let name = p.label.toUpperCase();
  if (name.length > 24) name = name.slice(0, 23) + '…';
  label(name, 0, -86 - hgt + 15, 9, INK_DARK, 'center', 1);
  label(fmt(p.words) + ' WORDS · KEPT ' + fmt(p.prov.careDays) + ' DAYS', 0, -86 - hgt + 29, 7.5, '#7a4a20', 'center', 0.6);
  label('TENDED ' + fmt(p.ageDays) + ' DAYS AGO · ' + SEASON_NAMES[p.season], 0, -86 - hgt + 42, 7.5, '#7a4a20', 'center', 0.6);
  const lampA = nightRamp(wN);
  if (lampA > 0.01) {
    /* a small lamp keeps the sign readable through the dark */
    cx.globalAlpha = lampA;
    cx.fillStyle = INKS.apricot;
    cx.fillRect(-3, -94, 6, 6);
    cx.globalAlpha = 0.12 * lampA;
    cx.beginPath(); cx.arc(0, -86 - hgt / 2, 52, 0, 7); cx.fill();
    cx.globalAlpha = 1;
  }
  cx.restore();
}

function drawWarnSign(x, txt, pal) {
  const sx = w2s(x);
  if (sx < -140 || sx > W + 140) return;
  cx.save();
  cx.translate(sx, gYAt(x));
  cx.rotate(-0.06);
  cx.strokeStyle = pal.ink; cx.lineWidth = 3.4;
  cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(0, -64); cx.stroke();
  cx.fillStyle = INK_DARK;
  cx.fillRect(-72, -64 - 24, 144, 24);
  cx.strokeStyle = INKS.apricot; cx.lineWidth = 1.5;
  cx.strokeRect(-72, -64 - 24, 144, 24);
  label(txt, 0, -64 - 8, 8.5, INKS.apricot, 'center', 1.4);
  cx.restore();
}

function drawBench(b, pal) {
  const sx = w2s(b.x);
  if (sx < -80 || sx > W + 80) return;
  cx.save();
  cx.translate(sx, gYAt(b.x));
  cx.rotate(b.tilt);
  cx.fillStyle = pal.ink;
  if (b.broken) {
    cx.fillRect(-26, -20, 24, 4.5);   /* half the seat is gone */
    cx.fillRect(2, -18, 22, 4.5);
  } else {
    cx.fillRect(-26, -20, 52, 4.5);
  }
  cx.fillRect(-22, -15, 5, 15);
  cx.fillRect(17, -15, 5, 15);
  if (!b.broken && b.q > 0.6) { /* well-kept benches keep their backrest */
    cx.fillRect(-26, -34, 4, 15);
    cx.fillRect(-26, -36, 52, 4);
  }
  cx.restore();
}

/* FURNITURE BREATHES, LABELS NEVER COLLIDE — law (2), the label half
   (wave 3). Signboards obey the one-floating-label rule ALREADY at
   approach distance: only the NEAREST interactable paints its full board,
   the next-nearest shows at most a dimmed short title, all others hold
   their paint until you are closer. Two label boxes may never intersect —
   measured here, every frame, before either is allowed to paint. And
   ENTER acts on the same nearest piece the full label names: updateHUD
   sorts the acts by the very distance this plan sorts by. */
const LBL = { rank: new Map(), boxes: [], first: null, approach: 300, stoneHold: new Set() };
const HUB_HINTED = {};
function lblBox(x, topY, text, size) {
  const w = Math.max(30, String(text).length * readable(size) * TYPE_SCALE * 0.62);
  const sx = w2s(x);
  return { x0: sx - w / 2, x1: sx + w / 2, y0: topY - 2, y1: topY + size * TYPE_SCALE + 4 };
}
function labelPlanBuild(pi0, pi1) {
  LBL.rank.clear(); LBL.boxes.length = 0; LBL.first = null;
  const cands = [];
  for (let pi = pi0; pi <= pi1; pi++) {
    const p = M.pages[pi];
    for (const g of p.gates) {
      const tp = M.bySlug.get(g.tgt);
      cands.push({ id: g, x: g.x, kind: 'gate',
        text: (tp ? tp.label : g.tgt).toUpperCase().slice(0, 26), size: 8.5,
        top: gYAt(g.x) - 96 + (Math.round(g.x / 92) % 2) * 22, h2: 11 });
    }
    for (const tr of p.terraces) {
      cands.push({ id: tr, x: tr.x, kind: 'terrace',
        text: 'CARD TERRACE · ' + tr.items.length + ' CHOICES', size: 8.5,
        top: gYAt(tr.x) - 84, h2: 0 });
    }
    if (p.overlook) {
      cands.push({ id: p.overlook, x: p.overlook.x, kind: 'look',
        text: 'OVERLOOK', size: 8, top: gYAt(p.overlook.x) - 54, h2: 10 });
    }
  }
  cands.sort((a, b) => Math.abs(a.x - S.x) - Math.abs(b.x - S.x));
  let first = null;
  for (const c of cands) {
    if (Math.abs(c.x - S.x) > LBL.approach) break;   /* sorted: rest farther */
    if (!first) {
      first = c;
      c.box = lblBox(c.x, c.top, c.text, c.size);
      c.box.y1 += c.h2;                  /* a second line deepens the box */
      LBL.rank.set(c.id, 0);
      LBL.boxes.push(c.box);
      LBL.first = { kind: c.kind, x: c.x };
      continue;
    }
    /* the second voice: a dimmed short title, and only if its box keeps
       clear of the first — measured, never hoped */
    const bx = lblBox(c.x, c.top, String(c.text).slice(0, 16), 7);
    const a = first.box;
    const clear = bx.x1 < a.x0 || bx.x0 > a.x1 || bx.y1 < a.y0 || bx.y0 > a.y1;
    if (clear) { LBL.rank.set(c.id, 1); LBL.boxes.push(bx); }
    break;                                /* all others hold their paint */
  }
  /* third rank (wave 4, round 2 — the river-bank nit): a waymarker's
     carved lines are scenery, but a carve may never overprint a measured
     signboard. Any stone whose text box would cross a held label keeps
     its paint until the walk clears the box. */
  LBL.stoneHold.clear();
  if (LBL.boxes.length) {
    for (let pi = pi0; pi <= pi1; pi++) {
      for (const st of M.pages[pi].stones) {
        const top = st.kind === 'mile' ? 40 : 62;
        const sb = lblBox(st.x, gYAt(st.x) - top, st.l1, st.kind === 'mile' ? 8.5 : 9.5);
        sb.y1 += 11;                       /* the second carved line */
        for (const b of LBL.boxes) {
          if (!(sb.x1 < b.x0 || sb.x0 > b.x1 || sb.y1 < b.y0 || sb.y0 > b.y1)) {
            LBL.stoneHold.add(st);
            break;
          }
        }
      }
    }
  }
}

function drawGate(sx, g, pal, wN) {
  const tp = M.bySlug.get(g.tgt);
  const gy = gYAt(g.x);
  /* door frame by the path */
  drawPoly([[sx - 17, gy], [sx - 17, gy - 62], [sx - 11, gy - 62], [sx - 11, gy]], pal.ink, pal.accent);
  drawPoly([[sx + 11, gy], [sx + 11, gy - 62], [sx + 17, gy - 62], [sx + 17, gy]], pal.ink, pal.accent);
  drawPoly([[sx - 21, gy - 62], [sx + 21, gy - 62], [sx + 21, gy - 70], [sx - 21, gy - 70]], pal.ink, pal.accent);
  /* the door leaf, cream — a page you could step into */
  cx.fillStyle = 'rgba(255,243,224,0.5)';
  cx.fillRect(sx - 11, gy - 62, 22, 62);
  const doorA = nightRamp(wN);
  if (doorA > 0.01) {
    /* at night every door keeps a lit window and spills a little light */
    cx.fillStyle = INKS.apricot;
    cx.globalAlpha = 0.35 * doorA;
    cx.fillRect(sx - 11, gy - 62, 22, 62);
    cx.globalAlpha = 0.10 * doorA;
    cx.beginPath(); cx.arc(sx, gy, 44, 0, 7); cx.fill();
    cx.globalAlpha = 1;
  }
  cx.fillStyle = pal.accent;
  cx.globalAlpha = 0.85 + 0.15 * doorA;
  cx.fillRect(sx - 8, gy - 59, 16, 6);   /* transom light */
  cx.globalAlpha = 1;
  const near = S.nearGate && S.nearGate.g === g;
  const rk = LBL.rank.has(g) ? LBL.rank.get(g) : 2;
  const row = (Math.round(g.x / 92) % 2) * 22;   /* stagger clustered door labels */
  if (rk === 0) {
    let name = (tp ? tp.label : g.tgt).toUpperCase();
    if (name.length > 26) name = name.slice(0, 25) + '…';
    const dW = wordsAt(tp ? tp.start : 0) - wordsAt(g.x);
    label(name, sx, gy - 96 + row, 8.5, near ? INKS.cream : 'rgba(255,243,224,0.8)', 'center', 1);
    label((dW >= 0 ? fmt(dW) + 'M EAST' : fmt(-dW) + 'M WEST'), sx, gy - 86 + row, 7.5, 'rgba(255,162,107,0.85)', 'center', 0.8);
  } else if (rk === 1) {
    /* the next-nearest holds a dimmed short title, nothing more */
    label((tp ? tp.label : g.tgt).toUpperCase().slice(0, 16), sx, gy - 96 + row, 7,
      'rgba(255,243,224,0.38)', 'center', 0.6);
  }
}

/* ---------------- hazards & springs: the admonitions, in place --------- */
function drawHazard(hz, pal) {
  const sx = w2s(hz.x);
  if (sx < -120 || sx > W + 120) return;
  const gy = gYAt(hz.x);
  /* the low barrier you jump: apricot plate, hard ink chevrons */
  cx.fillStyle = INKS.apricot;
  cx.fillRect(sx - 17, gy - 14, 34, 14);
  cx.fillStyle = pal.ink;
  for (let i = 0; i < 3; i++) {
    const bx = sx - 15 + i * 12;
    drawPoly([[bx, gy], [bx + 5, gy - 14], [bx + 10, gy - 14], [bx + 5, gy]], pal.ink);
  }
  cx.strokeStyle = pal.ink; cx.lineWidth = 2;
  cx.strokeRect(sx - 17, gy - 14, 34, 14);
  /* the signage stays beside the mechanic */
  cx.strokeStyle = pal.ink; cx.lineWidth = 2.6;
  cx.beginPath(); cx.moveTo(sx - 30, gy); cx.lineTo(sx - 30, gy - 40); cx.stroke();
  cx.fillStyle = INKS.cream;
  cx.fillRect(sx - 55, gy - 54, 50, 14);
  cx.strokeStyle = pal.ink; cx.lineWidth = 1.5;
  cx.strokeRect(sx - 55, gy - 54, 50, 14);
  label(hz.kind.toUpperCase(), sx - 30, gy - 44, 6.5, INK_DARK, 'center', 0.8);
  if (Math.abs(sx - AVX) < 150 && !REDUCED) {
    label('SPACE — JUMP', sx, gy - 24, 7.5, 'rgba(255,243,224,0.85)', 'center', 1);
  }
}

function drawSpring(sp, pal) {
  const sx = w2s(sp.x);
  if (sx < -120 || sx > W + 120) return;
  const gy = gYAt(sp.x);
  const squash = S.bounceT !== null && Math.abs(sp.x - (S.bounceX || -1e9)) < 60 && S.bounceT < 0.3;
  const hh = squash ? 4 : 9;
  /* the spring pad: rose plate with cream coil lines */
  drawPoly([[sx - 15, gy], [sx + 15, gy], [sx + 10, gy - hh], [sx - 10, gy - hh]], INKS.rose);
  cx.strokeStyle = INKS.cream; cx.lineWidth = 1.6;
  cx.beginPath(); cx.moveTo(sx - 9, gy - hh + 2.5); cx.lineTo(sx + 9, gy - hh + 2.5); cx.stroke();
  if (!squash) { cx.beginPath(); cx.moveTo(sx - 11, gy - 3); cx.lineTo(sx + 11, gy - 3); cx.stroke(); }
  /* the tip signage beside its spring */
  cx.strokeStyle = pal.ink; cx.lineWidth = 2.6;
  cx.beginPath(); cx.moveTo(sx - 26, gy); cx.lineTo(sx - 26, gy - 36); cx.stroke();
  cx.fillStyle = INKS.cream;
  cx.fillRect(sx - 44, gy - 50, 36, 14);
  cx.strokeStyle = pal.ink; cx.lineWidth = 1.5;
  cx.strokeRect(sx - 44, gy - 50, 36, 14);
  label('TIP', sx - 26, gy - 40, 6.5, INK_DARK, 'center', 1);
}

/* ---------------- the card terraces ---------------- */
function drawTerrace(tr, pal, p, wN) {
  const sx = w2s(tr.x);
  if (sx < -160 || sx > W + 160) return;
  const gy = gYAt(tr.x);
  const ink = pal.ink, acc = pal.accent;
  /* counter */
  cx.fillStyle = ink;
  cx.fillRect(sx - 34, gy - 30, 68, 30);
  cx.fillStyle = INKS.cream;
  cx.fillRect(sx - 34, gy - 30, 68, 4);
  const terA = nightRamp(wN);
  if (terA > 0.01) {
    /* the terrace keeps a lit window after dark */
    cx.globalAlpha = terA;
    cx.fillStyle = INKS.apricot;
    cx.fillRect(sx - 26, gy - 22, 14, 12);
    cx.globalAlpha = 0.10 * terA;
    cx.beginPath(); cx.arc(sx, gy, 58, 0, 7); cx.fill();
    cx.globalAlpha = 1;
  }
  /* the server, from the shoulders up behind the counter */
  cx.fillStyle = ink;
  cx.fillRect(sx + 6, gy - 44, 12, 14);
  cx.beginPath(); cx.arc(sx + 12, gy - 49, 5.4, 0, 7); cx.fill();
  cx.fillStyle = INKS.cream;
  cx.fillRect(sx + 6.6, gy - 52, 10.8, 2.2);   /* the cap band */
  /* awning on two posts — hard alternating stripes */
  cx.strokeStyle = ink; cx.lineWidth = 3;
  cx.beginPath(); cx.moveTo(sx - 38, gy); cx.lineTo(sx - 38, gy - 58); cx.stroke();
  cx.beginPath(); cx.moveTo(sx + 38, gy); cx.lineTo(sx + 38, gy - 58); cx.stroke();
  for (let i = 0; i < 7; i++) {
    cx.fillStyle = i % 2 ? acc : INKS.cream;
    cx.fillRect(sx - 42 + i * 12, gy - 68, 12, 10);
  }
  cx.strokeStyle = ink; cx.lineWidth = 2;
  cx.strokeRect(sx - 42, gy - 68, 84, 10);
  /* menu board: the page's real cards */
  const bx = sx + 48, bw = 84, bh = 46;
  cx.strokeStyle = ink; cx.lineWidth = 2.4;
  cx.beginPath(); cx.moveTo(bx + bw / 2, gy); cx.lineTo(bx + bw / 2, gy - 44); cx.stroke();
  cx.fillStyle = acc; cx.globalAlpha = 0.5;
  cx.fillRect(bx + 3, gy - 44 - bh + 2, bw, bh);
  cx.globalAlpha = 1;
  cx.fillStyle = INKS.cream;
  cx.fillRect(bx, gy - 44 - bh, bw, bh);
  cx.strokeStyle = ink; cx.lineWidth = 1.6;
  cx.strokeRect(bx, gy - 44 - bh, bw, bh);
  label('MENU · ' + tr.items.length, bx + bw / 2, gy - 44 - bh + 11, 7, INK_DARK, 'center', 1);
  const shown = Math.min(3, tr.items.length);
  for (let i = 0; i < shown; i++) {
    let t = String(tr.items[i].title || '').toUpperCase();
    if (t.length > 13) t = t.slice(0, 12) + '…';
    label(t, bx + bw / 2, gy - 44 - bh + 21 + i * 8.5, 6, '#4a3350', 'center', 0.4);
  }
  if (tr.items.length > shown) {
    label('+' + (tr.items.length - shown) + ' MORE', bx + bw / 2, gy - 44 - bh + 21 + shown * 8.5, 6, '#7a4a20', 'center', 0.6);
  }
  const near = S.nearTerrace && S.nearTerrace.tr === tr;
  const rk = LBL.rank.has(tr) ? LBL.rank.get(tr) : 2;
  if (rk === 0) {
    label('CARD TERRACE · ' + tr.items.length + (tr.items.length === 1 ? ' CHOICE' : ' CHOICES'), sx, gy - 84,
      8.5, near ? INKS.cream : 'rgba(255,243,224,0.8)', 'center', 1.2);
  } else if (rk === 1) {
    label('CARD TERRACE', sx, gy - 84, 7, 'rgba(255,243,224,0.38)', 'center', 0.6);
  }
}

/* ---------------- greetings: bubbles, gestures, waves ------------------ */
/* THE WALKERS FIND THEIR WORDS (prepolish5, owner order: they always said
   the same thing). Every walker now draws from a pool of AT LEAST SIX
   distinct phrase templates, each one still provably true of the gitlog:
   real commit counts, real dates, real day counts, the other stretches
   this hand has really committed to and is walking toward. The pool is
   rotated globally: the last four template ids are barred, so five
   walkers met in a row never repeat a template. Each entry carries its
   template id for that rotation; bubbleFacts() keeps its old shape (an
   array of the true sentences) for every probe that reads it. */
function bubbleToward(name, p) {
  /* the nearest OTHER stretch this hand has really committed on, east
     first — provenance, not fiction */
  let east = null, west = null;
  for (const q of M.pages) {
    if (q === p || !q.prov || !(q.prov.authors || []).includes(name)) continue;
    if (q.start > p.start) { if (!east || q.start < east.start) east = q; }
    else if (!west || q.start > west.start) west = q;
  }
  return east || west;
}
function bubblePool(name, p) {
  const v = p.prov;
  const agg = M.authorAgg.get(name) || { pages: 1, top: 0 };
  const sole = (v.authors || []).length === 1;
  const isTop = v.topAuthor === name;
  const out = [];
  const F = (id, t) => out.push({ id, text: t });
  /* --- the specific claims, exactly the true ones the trail always made --- */
  if (sole && v.commits === 1) {
    F('sole1', 'I came once, fixed one thing, and walked on.');
    F('sole1', 'One visit, one fix; the trail keeps the rest.');
  }
  if (sole && v.commits > 1) {
    F('allmine', capFirst('all ' + numw(v.commits) + ' commits on this stretch are mine.'));
    F('allmine', 'Every one of the ' + numw(v.commits) + ' commits here is mine.');
  }
  if (!sole && v.commits === v.authors.length && v.commits > 1) {
    /* N commits by N authors: provably one apiece */
    F('apiece', capFirst(numw(v.authors.length)) + ' of us came; each left exactly one commit. Mine is here.');
    F('apiece', 'One commit apiece from ' + numw(v.authors.length) + ' walkers, and one of them is mine.');
  } else if (!sole && isTop && v.commits > 1) {
    if (v.authors.length === 2 && v.commits % 2 === 1) {
      /* two hands, odd count: the top hand provably holds the majority */
      F('share', 'Most of the ' + numw(v.commits) + ' commits on this stretch are mine.');
      F('share', 'Of the ' + numw(v.commits) + ' commits here, the greater share is mine.');
    } else {
      F('share', 'Of the ' + numw(v.commits) + ' commits here, the greater share is mine.');
      F('share', 'No hand has left more commits on this stretch than mine.');
    }
  }
  if (isTop && v.careDays > 0 && (sole || v.commits > v.authors.length)) {
    F('keeper', 'I kept this stretch for ' + fmt(v.careDays) + ' days.');
    F('keeper', 'This ground has been kept ' + fmt(v.careDays) + ' days; I kept it.');
  }
  if (sole && v.night > 0) {
    F('night', 'I was here at three in the morning. ' +
      (v.night === 1 ? 'Once.' : v.night === 2 ? 'Twice.' : capFirst(numw(v.night)) + ' times.'));
  }
  if (!sole && v.night > 0) {
    F('night', capFirst(numw(v.night)) + ' of the commits here landed long after midnight.');
  }
  if (!sole && v.first) {
    F('since', capFirst(numw(v.authors.length)) + ' of us have kept this stretch since ' + v.first + '.');
  }
  if (isTop && agg.top >= 5) {
    F('keep', 'I keep ' + fmt(agg.top) + ' stretches of this trail; this one among them.');
  }
  if (!isTop && v.topAuthor && v.topAuthor !== name && v.commits > v.authors.length) {
    F('lent', 'I lent a hand here; ' + v.topAuthor + ' keeps this stretch.');
  }
  /* --- the universal claims (prepolish5), so no walker is ever down to
     one line: every one still read straight off the provenance --- */
  F('hands', sole
    ? 'No hand but mine has kept this stretch.'
    : capFirst(numw(v.authors.length)) + ' hands have tended this stretch; mine is one of them.');
  if (v.first) F('firsttend', 'This stretch was first tended on ' + v.first + '.');
  if (v.last) F('lasttend', 'This stretch was last tended on ' + v.last + '.');
  if (v.careDays > 0) F('care', 'This ground has stood tended for ' + fmt(v.careDays) + ' days.');
  if (agg.pages > 3) {
    F('pages', 'This is one of ' + fmt(agg.pages) + ' stretches that know my step.');
    F('pages', 'I have walked ' + fmt(agg.pages) + ' stretches of this trail.');
  } else if (agg.pages > 1) {
    F('pages', 'I have walked ' + numw(agg.pages) + ' stretches of this trail.');
  } else {
    F('pages', 'This is the only stretch of this trail that knows my step.');
  }
  const tw = bubbleToward(name, p);
  if (tw) {
    F('toward', 'I am walking on toward ' + tw.title + '; that stretch knows my hand too.');
  } else {
    const nb = M.pages[p.idx + 1] || null, pv = M.pages[p.idx - 1] || null;
    if (nb) F('toward', 'East of here the trail runs on to ' + nb.title + '.');
    else if (pv) F('toward', 'West of here the trail runs back to ' + pv.title + '.');
  }
  if (!out.length && v.first && v.last) {
    F('boots', 'This stretch has carried boots from ' + v.first + ' to ' + v.last + '.');
  }
  return out;
}
/* the old shape, for every probe that reads it: the true sentences alone */
function bubbleFacts(name, p) { return bubblePool(name, p).map(f => f.text); }

/* the global rotation: the last four template ids and the last three
   openers are barred, so a row of meetings never sounds like a loop */
const BUB_ROT = { recent: [], opener: [] };
const BUB_OPENERS_DAY = ['Well met.', 'Ho there.', 'Fair walking.',
  'A good hour for it.', 'You keep a good pace.', 'Fine light today.'];
const BUB_OPENERS_NIGHT = ['Evening, walker.', 'A quiet night for it.',
  'Well met.', 'Ho there.', 'Fair walking.', 'The dark comes gently here.'];

function spawnBubble(fw, wN) {
  const pool = bubblePool(fw.wk.name, fw.page);
  if (!pool.length) return;
  const r = rngFor('bubble:' + fw.page.slug + ':' + fw.wk.name);
  /* rotation: bar the last four template ids, then draw as before */
  let cands = pool.filter(x => !BUB_ROT.recent.includes(x.id));
  if (!cands.length) cands = pool;
  const pick = cands[Math.floor(r() * cands.length) % cands.length];
  BUB_ROT.recent.push(pick.id);
  while (BUB_ROT.recent.length > 4) BUB_ROT.recent.shift();
  const text = pick.text;
  /* the greeting varies too: a short opener, never the same twice
     running, night-aware; it rides the bubble as its own first words
     and is NOT one of the facts */
  const OP = wN > 0.45 ? BUB_OPENERS_NIGHT : BUB_OPENERS_DAY;
  let oc = OP.filter(o => !BUB_ROT.opener.includes(o));
  if (!oc.length) oc = OP;
  const opener = oc[Math.floor(r() * oc.length) % oc.length];
  BUB_ROT.opener.push(opener);
  while (BUB_ROT.opener.length > 3) BUB_ROT.opener.shift();
  const gid = Math.floor(r() * 2);
  const gesture = (wN > 0.5 && r() < 0.5) ? 'lantern' : (gid === 0 ? 'hand' : 'hat');
  S.bubble = { wk: fw.wk, page: fw.page, text, opener, gesture, t0: S.t };
  S.wave = 1;   /* the player waves back */
  audEv('greet', fw.wx);
  PACK.greeted++;
  queueSave();
  bubbleCD.set(fw.page.slug + '|' + fw.wk.name, S.t + BUBBLE_PAIR_CD);
}

function endBubble() {
  if (!S.bubble) return;
  S.bubble = null;
  S.bubbleGapT = S.t + BUBBLE_GAP;
}

/* THE TRAIL DOES NOT TALK OVER SOMEBODY WHO IS SPEAKING (prepolish5).
   Stacked at 900 px the trail canvas is 450 px tall: the HUD owns
   everything down to about 188 and the toast band runs 204 to 241, which
   is exactly the height of a walker's head — there is no room for a
   speech plate between them, and a toast crossed the words. (It did
   before this round too; the grown type only made it common.) So while
   somebody is speaking the toast band steps DOWN, over the open ground,
   and steps back the moment the words are done. Nothing moves when
   nobody is speaking, the plate is the same plate, and how far it steps
   is measured from the room actually there — never a magic number. */
let speaking = false;
function toastDodge() {
  const ht = document.getElementById('hudTrail');
  if (!toastEl || !ht) return;
  document.body.classList.remove('speaking');
  const r = toastEl.getBoundingClientRect();
  const q = ht.getBoundingClientRect();
  const room = (q.height ? q.top : (visH || innerHeight)) - 10 - r.bottom;
  document.documentElement.style.setProperty('--toast-dodge',
    Math.round(clamp(room, 0, 64)) + 'px');
}
function setSpeaking(on) {
  if (on === speaking) return;
  speaking = on;
  if (on) toastDodge();
  document.body.classList.toggle('speaking', on);
  bandT = -9;                       /* the band has moved: re-measure it */
}

function updateGreetings(dt, wN) {
  if (S.bubble) {
    const b = S.bubble;
    if (!REDUCED) b.wk.tPause = (b.wk.tPause || 0) + dt;   /* the walker stops */
    const fw = frameWalkers.find(f => f.wk === b.wk);
    const gone = !fw || Math.abs(fw.wx - S.x) > 340;
    if (gone || S.t - b.t0 > BUBBLE_LIFE) endBubble();
    else { b.sx = fw.sx; b.gy = fw.gy; b.h = fw.wk.h; }
  }
  if (!S.bubble && S.t > S.bubbleGapT && !S.overlay && !S.sweep) {
    let best = null, bd = 1e9;
    for (const fw of frameWalkers) {
      const d = Math.abs(fw.wx - S.x);
      if (d > BUBBLE_RANGE || d >= bd) continue;
      const cd = bubbleCD.get(fw.page.slug + '|' + fw.wk.name);
      if (cd && cd > S.t) continue;
      best = fw; bd = d;
    }
    if (best) {
      spawnBubble(best, wN);
      if (S.bubble) { S.bubble.sx = best.sx; S.bubble.gy = best.gy; S.bubble.h = best.wk.h; }
    }
  }
  setSpeaking(!!S.bubble);
  /* walker-walker crossings greet ambiently — a hand, no words */
  for (let i = 0; i < frameWalkers.length; i++) {
    for (let j = i + 1; j < frameWalkers.length; j++) {
      const A = frameWalkers[i], B = frameWalkers[j];
      if (A.page !== B.page || Math.abs(A.wx - B.wx) > 11) continue;
      const key = A.page.slug + '|' + [A.wk.name, B.wk.name].sort().join('|');
      const cd = ambientCD.get(key);
      if (cd && cd > S.t) continue;
      ambientCD.set(key, S.t + 30);
      A.wk.greetUntil = S.t + 1.1;
      B.wk.greetUntil = S.t + 1.1;
    }
  }
  if (S.wave > 0) S.wave = Math.max(0, S.wave - (REDUCED ? 0.34 : dt / 0.9));
}

function drawGesture(b, sx, gy, wk, pal) {
  /* 2–3 held frames, seeded per walker, no tween — punched poses */
  const f = REDUCED ? 2 : Math.min(2, Math.floor((S.t - b.t0) / 0.24));
  const h = wk.h * 0.94;
  const shY = gy - 46 * h;
  const ink = mix(pal.ink, INKS.violet, wk.isTop ? 0.3 : 0.12);
  cx.strokeStyle = ink; cx.lineWidth = 3.2 * h; cx.lineCap = 'round';
  if (b.gesture === 'hand') {
    const uy = [8, 15, 21][f];
    cx.beginPath(); cx.moveTo(sx, shY + 3 * h); cx.lineTo(sx + 9 * h, shY - uy * h * 0.9); cx.stroke();
  } else if (b.gesture === 'hat') {
    const lift = [0, 7, 10][f];
    cx.beginPath(); cx.moveTo(sx, shY + 3 * h); cx.lineTo(sx + 10 * h, shY - (9 + lift * 0.7) * h); cx.stroke();
    cx.fillStyle = ink;
    const hy = shY - 15 * h - lift;
    drawPoly([[sx + 5 * h, hy], [sx + 17 * h, hy - 2], [sx + 16 * h, hy - 5], [sx + 6 * h, hy - 3]], ink);
  } else { /* the lifted lantern, for night meetings */
    const uy = [2, 8, 12][f];
    cx.beginPath(); cx.moveTo(sx, shY + 3 * h); cx.lineTo(sx + 12 * h, shY - uy * h * 0.6); cx.stroke();
    const lx = sx + 13 * h, ly = shY - uy * h * 0.6 + 3;
    cx.fillStyle = ink;
    cx.fillRect(lx - 3, ly, 7, 10);
    cx.fillStyle = INKS.apricot;
    cx.fillRect(lx - 1.4, ly + 2, 4, 6);
    cx.globalAlpha = 0.14;
    cx.beginPath(); cx.arc(lx, ly + 5, 34, 0, 7); cx.fill();
    cx.globalAlpha = 1;
  }
  cx.lineCap = 'butt';
}

/* the band the DOM paints over the scene: the HUD's two corners, the trail
   bar, and a live toast. Read at most a few times a second, and only while
   somebody is speaking. */
/* var, not let: resize() and the toast queue both poke bandT and they can
   run before this line does */
var bandT = -9, bandBoxes = [];
function bubbleBand() {
  if (S.t - bandT < 0.4) return bandBoxes;
  bandT = S.t;
  bandBoxes = [];
  for (const id of ['hudLeft', 'hudRight', 'hudTrail', 'toast']) {
    const e = document.getElementById(id);
    if (!e || e.hidden) continue;
    const q = e.getBoundingClientRect();
    if (q.width && q.height) bandBoxes.push({ x0: q.left, y0: q.top, x1: q.right, y1: q.bottom });
  }
  return bandBoxes;
}
function bubbleWrap(text, wrap) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const wd of words) {
    const t = line ? line + ' ' + wd : wd;
    if (cx.measureText(t).width > wrap && line) { lines.push(line); line = wd; }
    else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function drawBubble(b) {
  if (b.sx === undefined) return;
  /* the words grow from the walker — hard-edged, tail at the speaker */
  const gt = REDUCED ? 1 : clamp((S.t - b.t0) / 0.3, 0, 1);
  const scale = [0.35, 0.6, 0.85, 1][Math.min(3, Math.floor(gt * 4))];
  cx.font = (14.5 * TYPE_SCALE) + 'px Georgia, serif';
  cx.textAlign = 'left';
  /* the opener rides ahead of the fact as the walker's own greeting */
  const full = (b.opener ? b.opener + ' ' : '') + b.text;
  const lineH = 19 * TYPE_SCALE;
  const headY = b.gy - 74 * b.h - 22;
  const tipX = b.sx + 2, tipY = headY + 6;

  /* THE PLATE FITS THE ROOM IT HAS (prepolish5). The HUD's corners and a
     live toast are DOM and always paint over the canvas; a plate that
     climbed into them lost a line behind them. Grown type made a tall
     plate the common case, so the law is now: the words SPREAD WIDER
     rather than climb. The wrap starts exactly where it always started —
     on a short line, on a roomy window, this loop runs once and the plate
     is the plate it always was — and only widens while the plate would
     still reach into the band above it. */
  let wrap = 350 * TYPE_SCALE;
  let lines = bubbleWrap(full, wrap);
  let bw = 0, bh = 0, bx = 0, by = 0;
  const measure = () => {
    bw = 0;
    for (const l of lines) bw = Math.max(bw, cx.measureText(l).width);
    bw += 26;
    bh = lines.length * lineH + 16;
    bx = clamp(b.sx - bw * 0.35, 8, Math.max(8, W - bw - 8));
    by = tipY - 14 - bh;
  };
  measure();
  const ceilFor = () => {
    let c = 4;
    for (const q of bubbleBand()) {
      if (q.y1 >= tipY) continue;                    /* below the plate */
      if (bx >= q.x1 || q.x0 >= bx + bw) continue;   /* beside it       */
      if (q.y1 + 4 > c) c = q.y1 + 4;
    }
    return c;
  };
  for (let pass = 0; pass < 4; pass++) {
    const ceil = ceilFor();
    if (by >= ceil) break;                           /* it already fits */
    const room = Math.max(lineH + 16, (tipY - 14) - ceil);
    const want = Math.max(1, Math.floor((room - 16) / lineH));
    if (lines.length <= want) break;                 /* cannot do better */
    const cap = Math.max(280 * TYPE_SCALE, W - 60);
    if (wrap >= cap) break;
    wrap = Math.min(cap, wrap * 1.45);
    const nl = bubbleWrap(full, wrap);
    if (nl.length >= lines.length) break;            /* widening bought nothing */
    lines = nl;
    measure();
  }
  /* one last inch: a plate that is already as short as it can be may still
     graze the band by a few pixels. It is allowed to SINK — the 14 px of
     air it normally keeps over the head, and ten more, so at worst it
     rests on the head with a stub of a tail — and only if sinking
     actually clears the band. Where it cannot clear, the plate stays
     exactly where it always stood. */
  {
    const ceil = ceilFor();
    if (by < ceil && by + 24 >= ceil) by = Math.min(ceil, by + 24);
  }
  /* whatever room is left, the plate never climbs off the top of the scene */
  if (by < 4) by = 4;
  /* the plate the frame actually painted, so a probe reads the drawing
     instead of re-deriving it and agreeing with itself (the same service
     LBL.boxes does for the signage) */
  S.bubbleBox = { x0: bx, y0: by, x1: bx + bw, y1: by + bh, lines: lines.length,
    /* where the INK of the words is, as opposed to the plate around it */
    t0: by + 8, t1: by + 8 + lines.length * lineH };
  cx.save();
  cx.translate(tipX, tipY);
  cx.scale(scale, scale);
  cx.translate(-tipX, -tipY);
  /* registration shadow, then the cream plate, then the tail */
  cx.fillStyle = INKS.violet;
  cx.fillRect(bx + 4, by + 4, bw, bh);
  cx.fillStyle = INKS.cream;
  cx.fillRect(bx, by, bw, bh);
  cx.strokeStyle = INK_DARK; cx.lineWidth = 2;
  cx.strokeRect(bx, by, bw, bh);
  drawPoly([[tipX - 9, by + bh - 1], [tipX + 7, by + bh - 1], [tipX, tipY]], INKS.cream);
  cx.strokeStyle = INK_DARK; cx.lineWidth = 1.6;
  cx.beginPath(); cx.moveTo(tipX - 9, by + bh); cx.lineTo(tipX, tipY); cx.lineTo(tipX + 7, by + bh); cx.stroke();
  cx.fillStyle = INK_DARK;
  cx.font = (14.5 * TYPE_SCALE) + 'px Georgia, serif';
  cx.textAlign = 'left';
  lines.forEach((l, i) => cx.fillText(l, bx + 13, by + 8 + 11.5 * TYPE_SCALE + i * lineH));
  cx.restore();
}

/* ---------------- dock (the reading strip) ---------------- */
const dockContent = document.getElementById('dockContent');
const dockScroll = document.getElementById('dockScroll');
const dockTitle = document.getElementById('dockTitle');
const blockchip = document.getElementById('blockchip');
let dockPage = null;
let userScrollT = 0;

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function renderInto(parent, blocks) {
  for (const b of blocks || []) renderBlock(parent, b);
}
function renderBlock(parent, b) {
  if (b == null) return;
  if (typeof b === 'string') { parent.appendChild(el('p', null, b)); return; }
  switch (b.t) {
    case 'tldr': parent.appendChild(el('div', 'tldr', b.html || '')); break;
    case 'p': parent.appendChild(el('p', null, b.html || '')); break;
    case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
      const h = el(b.t, null, esc(b.text || ''));
      if (b.id) h.id = 'a-' + b.id;
      parent.appendChild(h);
      break;
    }
    case 'admonition': {
      const kind = b.kind || 'note';
      const box = el('div', 'adm adm-' + kind);
      box.appendChild(el('div', 'admk', esc(b.title || kind)));
      renderInto(box, b.blocks);
      parent.appendChild(box);
      break;
    }
    case 'code': {
      if (b.title || b.lang) {
        parent.appendChild(el('div', 'codehead', '<span>' + esc(b.title || '') + '</span><span>' + esc((b.lang || '').toUpperCase()) + '</span>'));
      }
      const pre = el('pre', 'codeblk');
      const code = el('code');
      code.textContent = (b.code || '').replace(/^\n/, '');
      pre.appendChild(code);
      parent.appendChild(pre);
      break;
    }
    case 'table': {
      const wrap = el('div', 'tblwrap');
      const tb = el('table');
      if (b.head && b.head.length) {
        const tr = el('tr');
        for (const c of b.head) tr.appendChild(el('th', null, c));
        tb.appendChild(el('thead')).appendChild(tr);
      }
      const body = el('tbody');
      for (const row of b.rows || []) {
        const tr = el('tr');
        for (const c of row) tr.appendChild(el('td', null, c));
        body.appendChild(tr);
      }
      tb.appendChild(body);
      wrap.appendChild(tb);
      parent.appendChild(wrap);
      break;
    }
    case 'tabs': {
      const grp = el('div', 'tabgrp');
      const btns = el('div', 'tabbtns');
      grp.appendChild(btns);
      (b.tabs || []).forEach((t, i) => {
        const btn = el('button', i === 0 ? 'on' : '', esc(t.label || ('Tab ' + (i + 1))));
        btn.type = 'button';
        btn.dataset.ti = i;
        btns.appendChild(btn);
        const pane = el('div', 'tabpane');
        pane.dataset.ti = i;
        if (i !== 0) pane.hidden = true;
        renderInto(pane, t.blocks);
        grp.appendChild(pane);
      });
      parent.appendChild(grp);
      break;
    }
    case 'ul': case 'ol': {
      const list = el(b.t);
      if (b.t === 'ol' && b.start) list.setAttribute('start', b.start);
      for (const it of b.items || []) {
        const li = el('li');
        if (typeof it === 'string') li.innerHTML = it;
        else { if (it.html) li.innerHTML = it.html; renderInto(li, it.blocks); }
        list.appendChild(li);
      }
      parent.appendChild(list);
      break;
    }
    case 'details': {
      const d = el('details');
      d.open = true;
      d.appendChild(el('summary', null, esc(b.summary || 'Details')));
      renderInto(d, b.blocks);
      parent.appendChild(d);
      break;
    }
    case 'cards': {
      const grid = el('div', 'cards');
      for (const c of b.items || []) {
        const a = el('a', 'card', '<b>' + esc(c.title || '') + '</b><span>' + esc(c.desc || '') + '</span>');
        a.href = c.link || '#';
        grid.appendChild(a);
      }
      parent.appendChild(grid);
      break;
    }
    case 'img': {
      const img = el('img');
      img.src = b.light || b.dark || '';
      img.alt = b.alt || '';
      img.loading = 'lazy';
      parent.appendChild(img);
      if (b.caption) parent.appendChild(el('div', 'imgcap', esc(b.caption)));
      break;
    }
    case 'endpoint': {
      const box = el('div', 'endp');
      const head = el('div', 'endphead');
      head.appendChild(el('span', 'method m-' + String(b.method || '').toLowerCase(), esc(b.method || '')));
      head.appendChild(el('code', null, esc(b.path || '')));
      box.appendChild(head);
      const body = el('div', 'endpbody');
      if (b.title) body.appendChild(el('p', null, '<b>' + esc(b.title) + '</b>'));
      if (b.description) body.appendChild(el('p', null, b.description));
      if (b.params && b.params.length) {
        const wrap = el('div', 'tblwrap');
        const tb = el('table');
        const tr = el('tr');
        [(b.paramTitle || 'Parameter'), 'Type', 'Required', 'Description'].forEach(hh => tr.appendChild(el('th', null, esc(hh))));
        tb.appendChild(el('thead')).appendChild(tr);
        const tbody = el('tbody');
        for (const pm of b.params) {
          const r2 = el('tr');
          r2.appendChild(el('td', null, '<code>' + esc(pm.name || '') + '</code>'));
          r2.appendChild(el('td', null, esc(pm.type || '')));
          r2.appendChild(el('td', null, pm.required ? 'yes' : 'no'));
          r2.appendChild(el('td', null, pm.desc || ''));
          tbody.appendChild(r2);
        }
        tb.appendChild(tbody);
        wrap.appendChild(tb);
        body.appendChild(wrap);
      }
      box.appendChild(body);
      parent.appendChild(box);
      break;
    }
    case 'columns': {
      const cols = el('div', 'cols');
      for (const col of b.cols || []) {
        const c = el('div');
        renderInto(c, col);
        cols.appendChild(c);
      }
      parent.appendChild(cols);
      break;
    }
    case 'badge': parent.appendChild(el('span', 'badge', esc(b.label || b.kind || ''))); break;
    case 'hr': parent.appendChild(el('hr')); break;
    default:
      if (b.html) parent.appendChild(el('p', null, b.html));
      break;
  }
}

function renderDock(page) {
  if (dockPage === page) return;
  dockPage = page;
  const frag = document.createDocumentFragment();
  const head = el('div');
  head.appendChild(el('h1', 'pgtitle', esc(page.title)));
  if (page.description) head.appendChild(el('div', 'pgdesc', esc(page.description)));
  frag.appendChild(head);
  page.blocks.forEach((b, i) => {
    const wrap = el('div', 'blk');
    wrap.dataset.bi = i;
    renderBlock(wrap, b);
    frag.appendChild(wrap);
  });
  dockContent.innerHTML = '';
  dockContent.appendChild(frag);
  dockTitle.textContent = (page.product ? page.product.toUpperCase() + ' · ' : '') +
    (page.section ? page.section + ' · ' : '') + page.title;
  S.bi = -1;
  dockScroll.scrollTop = 0;
}

function updateBlock(page, bi) {
  if (bi === S.bi) return;
  S.bi = bi;
  blockchip.textContent = 'BLOCK ' + (bi + 1) + ' / ' + page.blocks.length;
  const prev = dockContent.querySelector('.blk.here');
  if (prev) prev.classList.remove('here');
  const cur = dockContent.querySelector('.blk[data-bi="' + bi + '"]');
  if (cur) {
    cur.classList.add('here');
    if (performance.now() - userScrollT > 2600) {
      const top = cur.offsetTop - dockScroll.clientHeight * 0.28;
      dockScroll.scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' });
    }
  }
}

dockScroll.addEventListener('wheel', () => { userScrollT = performance.now(); }, { passive: true });
dockScroll.addEventListener('touchmove', () => { userScrollT = performance.now(); }, { passive: true });

dockContent.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (a) {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#/')) { e.preventDefault(); routeTo(href.slice(1)); return; }
    if (href.startsWith('#')) {
      e.preventDefault();
      const t = dockContent.querySelector('#a-' + CSS.escape(href.slice(1)));
      if (t) { userScrollT = performance.now(); t.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' }); }
      return;
    }
    return; /* external links keep their targets */
  }
  const btn = e.target.closest('.tabbtns button');
  if (btn) {
    const grp = btn.closest('.tabgrp');
    grp.querySelectorAll('.tabbtns button').forEach(bb => bb.classList.toggle('on', bb === btn));
    grp.querySelectorAll(':scope > .tabpane').forEach(pn => { pn.hidden = pn.dataset.ti !== btn.dataset.ti; });
    return;
  }
  const blk = e.target.closest('.blk');
  if (blk && dockPage) {
    const bi = +blk.dataset.bi;
    const x = dockPage.start + dockPage.fracs[bi] * dockPage.len + 4;
    if (REDUCED) { S.x = x; needsDraw = true; } else S.target = x;
  }
});

/* ---------------- HUD ---------------- */
const hudTitle = document.getElementById('hudTitle');
const hudBiome = document.getElementById('hudBiome');
const odoEl = document.getElementById('odometer');
const doorEl = document.getElementById('nextdoor');
const walkedEl = document.getElementById('walked');
const gatePrompt = document.getElementById('gatePrompt');
const jumpPrompt = document.getElementById('jumpPrompt');
const jpFirst = document.getElementById('jpFirst');
let hzWarned = false;   /* the first hazard of the visit says one line more */
if (jumpPrompt) jumpPrompt.addEventListener('click', () => startJump());
const wxEl = document.getElementById('weather');
const hudCache = {};
function setText(elm, key, txt) {
  if (hudCache[key] === txt) return;
  hudCache[key] = txt;
  elm.textContent = txt;
}

function nextDoorAhead() {
  const idx = M.pages.indexOf(S.page);
  for (let k = 0; k < 24 && idx + k < M.pages.length; k++) {
    const p = M.pages[idx + k];
    for (const g of p.gates) if (g.x > S.x + 8) return g;
  }
  return null;
}

function updateHUD() {
  const p = S.page;
  setText(wxEl, 'wx', wxLabel());   /* the month the sky is remembering */

  /* THE JUMP PROMPT AT HAZARDS (wave 3): held for a beat, then the sign —
     a drawn space-bar key cap, gently pulsing, never over the reading
     strip. The calm walker sees it at once, and it holds still. */
  const jb = S.hzBlock;
  const showJP = jb && !S.overlay && S.jumpT === null &&
    (REDUCED || (S.t - jb.since) >= HZ_PROMPT_T);
  if (showJP) {
    if (jumpPrompt.hidden) {
      jpFirst.hidden = hzWarned;
      hzWarned = true;
      jumpPrompt.hidden = false;
    }
    const jsx = clamp(w2s(jb.x), 130, W - 130);
    const want = Math.round(jsx) + 'px';
    if (hudCache.jp !== want) { jumpPrompt.style.left = want; hudCache.jp = want; }
  } else if (!jumpPrompt.hidden) jumpPrompt.hidden = true;

  if (S.atLE) {
    setText(hudTitle, 't', 'LAND’S END');
    setText(hudBiome, 'b', 'THE SHORE PAST THE END CAIRN · THE WHOLE TRAIL BEHIND YOU · ' +
      fmt(M.sea.length) + ' LIGHTS ON THE WATER, ONE FOR EVERY PAGE');
    setText(odoEl, 'o', 'WORD ' + fmt(M.totalWords) + ' OF ' + fmt(M.totalWords));
    setText(doorEl, 'd', 'NO DOOR HERE — ONLY THE SEA');
    setText(walkedEl, 'w', 'WALKED ' + fmt(S.walkedWords) + 'M THIS SESSION');
    S.nearGate = null; S.nearTerrace = null; S.nearReg = null;
    S.nearTicket = null; S.nearLook = null; S.enterAct = null;
    S.nearFlower = false;
    /* the two sea exits belong to the trail end: the sloop off the point,
       and, far out on the same water, the living ink */
    let leTxt = null;
    if (Math.abs(S.x - (M.worldEnd - 4)) < 30) {
      S.enterAct = { kind: 'portal', key: 'cartastrapiana' };
      leTxt = 'A SLOOP STANDS OFF THE POINT — ENTER TO HAIL HER';
    } else if (Math.abs(S.x - M.leBench) < 42) {
      S.enterAct = { kind: 'portal', key: 'bythedeep' };
      leTxt = 'FAR OUT, THE SEA TURNS TO LIVING INK — ENTER TO PUT OUT FOR IT';
    }
    if (leTxt) {
      if (gatePrompt.hidden || hudCache.gp !== leTxt) {
        gatePrompt.hidden = false; gatePrompt.textContent = leTxt; hudCache.gp = leTxt;
      }
    } else if (!gatePrompt.hidden) gatePrompt.hidden = true;
    return;
  }
  setText(hudTitle, 't', p.title);
  if (p.comm >= 0) {
    const c = M.communities[p.comm];
    const hp = M.bySlug.get(c.hub);
    setText(hudBiome, 'b', 'BIOME ' + (p.comm + 1) + ' OF ' + M.communities.length + ' · ' + c.size + ' PAGES · HUB: ' + (hp ? hp.label.toUpperCase() : c.hub));
  } else {
    setText(hudBiome, 'b', 'OPEN COUNTRY · OUTSIDE THE ' + M.communities.length + ' BIOMES');
  }
  const wNow = wordsAt(S.x);
  setText(odoEl, 'o', 'WORD ' + fmt(wNow) + ' OF ' + fmt(M.totalWords));
  const g = nextDoorAhead();
  if (g) {
    const d = wordsAt(g.x) - wNow;
    setText(doorEl, 'd', 'NEXT DOOR ' + fmt(Math.max(1, d)) + 'M');
  } else setText(doorEl, 'd', 'NO DOOR BETWEEN HERE AND TRAIL END');
  setText(walkedEl, 'w', 'WALKED ' + fmt(S.walkedWords) + 'M THIS SESSION');

  /* nearest gate in reach */
  let near = null;
  for (const g2 of p.gates) {
    const d = Math.abs(g2.x - S.x);
    if (d < GATE_RANGE && (!near || d < near.d)) near = { g: g2, d };
  }
  S.nearGate = near;

  /* nearest terrace in reach — same grammar as the gates */
  let nearT = null;
  for (const tr of p.terraces) {
    const d = Math.abs(tr.x - S.x);
    if (d < GATE_RANGE && (!nearT || d < nearT.d)) nearT = { tr, d, page: p };
  }
  S.nearTerrace = nearT;

  /* register box, ranger ticket, orientation table — quiet furniture */
  S.nearReg = Math.abs(p.regX - S.x) < REG_RANGE ? p : null;
  S.nearTicket = Math.abs(p.signX - S.x) < TICKET_RANGE ? p : null;
  S.nearLook = (p.overlook && Math.abs(p.overlook.x - S.x) < LOOK_RANGE) ? p : null;

  /* ENTER does the nearest thing; one floating label at a time */
  const acts = [];
  if (nearT) {
    acts.push({
      d: nearT.d, kind: 'terrace', nt: nearT,
      txt: 'ENTER — TERRACE MENU · ' + nearT.tr.items.length +
        (nearT.tr.items.length === 1 ? ' CARD FROM THIS PAGE' : ' CARDS FROM THIS PAGE')
    });
  }
  if (near) {
    const tp = M.bySlug.get(near.g.tgt);
    const dw = wordsAt(tp.start) - wNow;
    const dir = dw >= 0 ? 'EAST' : 'WEST';
    acts.push({
      d: near.d, kind: 'gate', g: near.g,
      txt: 'ENTER — GATE TO ' + tp.label.toUpperCase() + ' · CARRIES YOU ' + fmt(Math.abs(dw)) + 'M ' + dir
    });
  }
  if (S.nearLook) {
    const o = p.overlook;
    acts.push({
      d: Math.abs(o.x - S.x), kind: 'look', p,
      txt: 'ENTER — ORIENTATION TABLE · ' + (o.landmarks.length ?
        o.landmarks.length + ' LANDMARKS THIS HUB CITES' : 'ALL SKY, NO LANDMARKS')
    });
  }
  /* the ways off the trail — each living where the geography puts it */
  if (p.overlook && p.idx >= PORTAL_MIN_PAGE && S.lastWN > 0.45) {
    const d = Math.abs(p.overlook.x + 96 - S.x);
    if (d < 46) acts.push({ d, kind: 'portal', key: 'pixelcity',
      txt: 'ENTER — PIXEL CITY GLITTERS IN THE VALLEY · ONE DAY OF WALKING DOWN' });
  }
  if (p.idx === M.kioskPage) {
    const d = Math.abs(M.kioskX - S.x);
    if (d < 46) acts.push({ d, kind: 'portal', key: 'secreta',
      txt: 'ENTER — THE SPINNER RACK TURNS IN THE KIOSK' });
  }
  /* a flowered verge: a spring stretch, blossom overhead, and stillness */
  S.nearFlower = false;
  if (p.season === 0 && p.idx >= PORTAL_MIN_PAGE && Math.abs(S.vx) < 1) {
    const Tf = terrainFor(p.idx);
    for (const fl of Tf.flora) {
      if (Math.abs(fl.x - S.x) < 30 &&
          (fl.type === 'pine' || fl.type === 'cypress' || fl.type === 'bush' || fl.type === 'palm')) {
        S.nearFlower = true;
        break;
      }
    }
  }
  acts.sort((a, b) => a.d - b.d);
  S.enterAct = acts[0] || null;
  let txt = S.enterAct ? S.enterAct.txt : null;
  if (!txt) {
    /* a hover is an aimed gesture: the star answers before the furniture */
    if (PORTAL.starHover && PORTAL.starOn > 0.08)
      txt = 'ONE STAR MOVES AMONG THE CITATIONS — CLICK IT AND FOLLOW';
    else if (S.nearReg && S.nearTicket) txt = 'R — SIGN THE REGISTER · E — REPORT TRAIL DAMAGE';
    else if (S.nearReg) txt = REGBOOK[p.slug] ? 'R — THE REGISTER · YOUR LINE IS INSIDE' : 'R — SIGN THE TRAIL REGISTER';
    else if (S.nearTicket) txt = 'E — REPORT TRAIL DAMAGE · A RANGER TICKET FOR ' + p.label.toUpperCase();
    else if (S.nearFlower) txt = 'H — KNEEL AND PRESS A FLOWER';
  }
  if (txt) {
    if (gatePrompt.hidden || hudCache.gp !== txt) { gatePrompt.hidden = false; gatePrompt.textContent = txt; hudCache.gp = txt; }
  } else if (!gatePrompt.hidden) gatePrompt.hidden = true;
}

/* ---------------- trailhead index (the dissent's law) ---------------- */
const trailhead = document.getElementById('trailhead');
const thSearch = document.getElementById('thSearch');
const thList = document.getElementById('thList');
let thSel = 0, thRows = [];

function openTrailhead() {
  S.overlay = 'index';
  trailhead.hidden = false;
  thSearch.value = '';
  buildThList('');
  thSearch.focus();
}
function closeOverlays() {
  if (S.overlay === 'walker') saveWalker();
  S.overlay = null;
  trailhead.hidden = true;
  document.getElementById('gatemap').hidden = true;
  document.getElementById('terrace').hidden = true;
  document.getElementById('keypanel').hidden = true;
  document.getElementById('register').hidden = true;
  document.getElementById('ticket').hidden = true;
  document.getElementById('packpanel').hidden = true;
  document.getElementById('guidepanel').hidden = true;
  document.getElementById('overlook').hidden = true;
  document.getElementById('walkerpick').hidden = true;
  document.getElementById('portalask').hidden = true;
  S.gm = null;
  S.tr = null;
  S.lk = null;
  needsDraw = true;
}
const LE_ROW = {
  slug: 'lands-end', title: 'Land’s End', label: 'Land’s End', product: 'the shore',
  lands: true
};
function buildThList(q) {
  const needle = q.trim().toLowerCase();
  const hit = (p) => !needle ||
    p.title.toLowerCase().includes(needle) ||
    p.label.toLowerCase().includes(needle) ||
    p.slug.toLowerCase().includes(needle);
  thRows = M.pages.filter(hit);
  /* the trail's ending is a named destination in the index, always second
     from the top when it matches: trailhead → Tab → Enter reaches it */
  if (hit(LE_ROW)) thRows.unshift(LE_ROW);
  thSel = 0;
  const frag = document.createDocumentFragment();
  thRows.forEach((p, i) => {
    const li = el('li', i === 0 ? 'sel' : '');
    li.appendChild(el('span', null, esc(p.title)));
    li.appendChild(el('span', 'thmeta', p.lands
      ? esc('THE SHORE PAST THE END CAIRN · ' + fmt(M.sea.length) + ' LIGHTS')
      : esc((p.product || '').toUpperCase() + ' · AT WORD ' + fmt(p.cumWords))));
    li.dataset.slug = p.slug;
    frag.appendChild(li);
  });
  thList.innerHTML = '';
  thList.appendChild(frag);
}
thSearch.addEventListener('input', () => buildThList(thSearch.value));
thList.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (li) { closeOverlays(); routeTo(li.dataset.slug); }
});
function thMove(d) {
  if (!thRows.length) return;
  const lis = thList.children;
  if (lis[thSel]) lis[thSel].classList.remove('sel');
  thSel = clamp(thSel + d, 0, thRows.length - 1);
  lis[thSel].classList.add('sel');
  lis[thSel].scrollIntoView({ block: 'nearest' });
}
document.getElementById('btnTrailhead').addEventListener('click', () => {
  if (S.overlay === 'index') closeOverlays(); else openTrailhead();
});

/* ---------------- gate map (fast travel with a drawn footpath) ---------------- */
const gatemap = document.getElementById('gatemap');
const gmCanvas = document.getElementById('gmCanvas');
function openGate(g) {
  const tp = M.bySlug.get(g.tgt);
  if (!tp) return;
  audEv('gate', g.x);
  S.overlay = 'gatemap';
  S.gm = { from: S.page, to: tp, gx: g.x };
  gatemap.hidden = false;
  const g2 = gmCanvas.getContext('2d');
  const w = gmCanvas.width, h = gmCanvas.height;
  g2.clearRect(0, 0, w, h);
  g2.fillStyle = INK_DARK; g2.fillRect(0, 0, w, h);
  /* the whole trail as a strip, each page tinted by its biome */
  const mL = 34, mR = 34, ty = h - 52;
  const inkArr = [INKS.violet, INKS.rose, INKS.apricot, INKS.cream];
  for (const p of M.pages) {
    const x0 = mL + (w - mL - mR) * p.start / M.totalPx;
    const ww = Math.max(0.6, (w - mL - mR) * p.len / M.totalPx);
    if (p.comm >= 0) {
      g2.globalAlpha = 0.42 + (p.comm % 3) * 0.18;
      g2.fillStyle = inkArr[p.comm % inkArr.length];
    } else {
      g2.globalAlpha = 0.2;
      g2.fillStyle = INKS.cream;
    }
    g2.fillRect(x0, ty, ww, 9);
  }
  g2.globalAlpha = 1;
  /* footpath arc */
  const x1 = mL + (w - mL - mR) * g.x / M.totalPx;
  const x2 = mL + (w - mL - mR) * tp.start / M.totalPx;
  const peak = ty - 26 - Math.min(86, Math.abs(x2 - x1) * 0.42);
  g2.strokeStyle = INKS.cream;
  g2.setLineDash([3, 6]);
  g2.lineWidth = 1.6;
  g2.beginPath();
  g2.moveTo(x1, ty - 2);
  g2.quadraticCurveTo((x1 + x2) / 2, peak, x2, ty - 2);
  g2.stroke();
  g2.setLineDash([]);
  g2.fillStyle = INKS.rose; g2.beginPath(); g2.arc(x1, ty + 4, 4, 0, 7); g2.fill();
  g2.fillStyle = INKS.apricot; g2.beginPath(); g2.arc(x2, ty + 4, 4, 0, 7); g2.fill();
  g2.font = (10 * TYPE_SCALE) + 'px Georgia, serif'; g2.textAlign = 'center'; g2.fillStyle = INKS.cream;
  if (Math.abs(x2 - x1) < 56) {
    g2.fillText('HERE', x1, ty + 22);
    g2.fillText('THERE', x2, ty + 34);
  } else {
    g2.fillText('HERE', x1, ty + 22);
    g2.fillText('THERE', x2, ty + 22);
  }

  const dw = wordsAt(tp.start) - wordsAt(S.x);
  document.getElementById('gmFrom').innerHTML = 'FROM <b>' + esc(S.page.title) + '</b>';
  document.getElementById('gmTo').innerHTML = 'THROUGH THE DOOR TO <b>' + esc(tp.title) + '</b>';
  document.getElementById('gmDist').textContent =
    'CARRIES YOU ' + fmt(Math.abs(dw)) + 'M ' + (dw >= 0 ? 'EAST' : 'WEST') +
    ' · CITED BY ' + fmt(tp.inCount) + ' PAGES';
}
function confirmGate() {
  const gm = S.gm;
  closeOverlays();
  if (gm) { audEv('gateTravel'); travelTo(gm.to.slug); }
}

/* ---------------- the terrace menu (cards, served in place) ------------ */
const terracePanel = document.getElementById('terrace');
const trList = document.getElementById('trList');
function openTerrace(nt) {
  S.overlay = 'terrace';
  S.tr = nt;
  S.trSel = 0;
  terracePanel.hidden = false;
  document.getElementById('trHead').textContent = 'CARD TERRACE';
  document.getElementById('trPage').textContent =
    'SERVED ON ' + nt.page.title.toUpperCase() + ' · ' + nt.tr.items.length +
    (nt.tr.items.length === 1 ? ' CARD ON THE BOARD' : ' CARDS ON THE BOARD');
  const frag = document.createDocumentFragment();
  nt.tr.items.forEach((it, i) => {
    const li = el('li', i === 0 ? 'sel' : '');
    li.dataset.i = i;
    li.appendChild(el('b', null, esc(it.title || 'Untitled card')));
    if (it.desc) li.appendChild(el('span', 'trdesc', esc(it.desc)));
    let dest = '';
    const link = it.link || '';
    if (link.startsWith('#/')) {
      const tp = M.bySlug.get(link.slice(1));
      if (tp) {
        const dw = wordsAt(tp.start) - wordsAt(S.x);
        dest = '→ ' + tp.label.toUpperCase() + ' · ' + fmt(Math.abs(dw)) + 'M ' + (dw >= 0 ? 'EAST' : 'WEST');
      } else dest = '→ ' + esc(link.slice(1));
    } else if (link) {
      let host = link;
      try { host = new URL(link).hostname; } catch (e) { }
      dest = '→ OUTBOUND · ' + esc(host.toUpperCase());
    }
    if (dest) li.appendChild(el('span', 'trdest', dest));
    frag.appendChild(li);
  });
  trList.innerHTML = '';
  trList.appendChild(frag);
}
function trMove(d) {
  const items = S.tr ? S.tr.tr.items : [];
  if (!items.length) return;
  const lis = trList.children;
  if (lis[S.trSel]) lis[S.trSel].classList.remove('sel');
  S.trSel = clamp(S.trSel + d, 0, items.length - 1);
  lis[S.trSel].classList.add('sel');
  lis[S.trSel].scrollIntoView({ block: 'nearest' });
}
function followCard(i) {
  if (!S.tr) return;
  const it = S.tr.tr.items[i];
  if (!it) return;
  const link = it.link || '';
  closeOverlays();
  if (link.startsWith('#/') && M.bySlug.has(link.slice(1))) {
    travelTo(link.slice(1));
  } else if (/^https?:/i.test(link)) {
    try { window.open(link, '_blank', 'noopener'); } catch (e) { }
  }
}
trList.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (li) followCard(+li.dataset.i);
});

/* ---------------- the key (every ground rule, printed once) ------------ */
const keypanel = document.getElementById('keypanel');
function openKey() {
  closeOverlays();
  S.overlay = 'key';
  keypanel.hidden = false;
}
const KEY_SWATCHES = {
  'sw-season': [INKS.rose, INKS.violet, INKS.apricot, INKS.cream],
  'sw-elev': [INKS.aubergine, INKS.violet],
  'sw-night': ['#0D0718'],
  'sw-hour': [INKS.apricot, INKS.rose],
  'sw-wear': [INKS.cream, INKS.aubergine, INKS.cream, INKS.aubergine],
  'sw-haz': [INKS.apricot, INK_DARK, INKS.apricot, INK_DARK],
  'sw-terr': [INKS.cream, INKS.rose, INKS.cream, INKS.rose],
  'sw-walk': [INKS.violet],
  'sw-stone': [INKS.aubergine, INKS.cream, INKS.aubergine],
  'sw-reg': [INKS.aubergine, INKS.cream],
  'sw-ticket': [INKS.cream, INKS.rose],
  'sw-pack': [INKS.apricot, INKS.aubergine],
  'sw-look': [INKS.cream, INKS.violet, INKS.cream],
  'sw-sky': ['#0D0718', INKS.cream, '#0D0718'],
  'sw-wind': [INKS.cream, INKS.apricot],
  'sw-dog': [INK_DARK, INKS.rose],
  'sw-guide': [INKS.cream, INKS.apricot, INKS.cream],
  'sw-cert': [INKS.rose, INKS.cream],
  'sw-wp': [INKS.violet, INKS.rose, INKS.apricot],
  'sw-le': ['#0D0718', INKS.cream, '#0D0718', INKS.apricot],
  'sw-sfx': [INKS.apricot, INKS.cream, INKS.apricot],
  'sw-mus': [INKS.cream, INKS.rose, INKS.cream],
  'sw-score': [INKS.cream, INKS.apricot, INKS.rose, INKS.violet],
  'sw-wx': [OVERCAST_INK, INKS.cream, OVERCAST_INK, INKS.violet],
  'sw-sleep': [INK_DARK, INKS.cream],
  'sw-lay': [INKS.aubergine, INKS.cream, INKS.aubergine]
};
function fillKey() {
  const rows = [
    ['sw-season',
      'GROUND SEASONS — each stretch wears the season of its own freshness: tended within ' +
      SEASON_DAYS[0] + ' days = spring bloom · within ' + SEASON_DAYS[1] + ' = deep summer · within ' +
      SEASON_DAYS[2] + ' = autumn drift · longer untended = bare winter frost. Seasons change stretch by stretch as you walk.'],
    ['sw-elev',
      'ELEVATION — the more pages cite a stretch, the higher it crests (log of its ' +
      'inbound citations; the most-cited page tops the highest hill, uncited pages cross the flats).'],
    ['sw-night',
      'NIGHT GROUND — the ' + fmt(M.nightPages) + ' stretches edited long after midnight stay night-dark ' +
      'whatever the sky says, one lantern per night commit (' + fmt(M.lanternsTotal) + ' lanterns).'],
    ['sw-hour',
      'THE HOUR — the sky makes a full round in ' + (CYCLE_S / 60) + ' minutes: morning, apricot day, ' +
      'rose golden hour, aubergine night. T or the dial changes its pace; reading never waits for the sun.'],
    ['sw-wear',
      'PATH WEAR — commits wore this ground: dotted track → dashed → solid → double → stone slabs ' +
      '(log scale against the most-worn page).'],
    ['sw-haz',
      'HAZARDS & SPRINGS — every caution or warning on a page stands low on its stretch and HOLDS ' +
      'you at its edge (' + fmt(M.hazTotal) + ' on the trail): lean out, then jump it (SPACE — the sign says so ' +
      'after a beat). Every tip is a spring that bounces you forward (' +
      fmt(M.sprTotal) + '). Reading is never gated.'],
    ['sw-terr',
      'CARD TERRACES — a page that serves a cards block grows a kiosk (' + fmt(M.terrTotal) + ' terraces, ' +
      fmt(M.cardTotal) + ' cards); step up, ENTER, and choose a card to follow its real link.'],
    ['sw-walk',
      'FELLOW WALKERS — the ' + fmt(M.authorsTotal) + ' real authors walk their own stretches; near one, ' +
      'they will tell you — in their commits\' own numbers — why they are on this ground.'],
    ['sw-stone',
      'WAYMARKERS — carved stones stand at every ' + fmt(MILE_WORDS) + 'th word (' + fmt(M.mileStones) +
      ' stones), at each biome border (' + fmt(M.borderStones) + ' crossings, population carved from real counts), ' +
      'at the halfway stone (word ' + fmt(M.halfWords) + '), and the end cairn.'],
    ['sw-reg',
      'THE TRAIL REGISTER — a register box waits past every signpost (R). A signed line posts to the real ' +
      'docs feedback book; when the trail cannot reach it, the ink dries when this trail opens to the ' +
      'public — your words are kept either way, for the visit.'],
    ['sw-ticket',
      'RANGER TICKETS — every signpost carries a maintenance ticket (E): it opens this page\u2019s real edit ' +
      'form on GitHub, or a damage issue prefilled with the page\u2019s title and path.'],
    ['sw-pack',
      'THE PACK (B) — the walk passport: a pressed leaf the first time you cross each of the ' + fmt(M.autumnPages || 0) +
      ' autumn stretches, lantern light from each of the ' + fmt(M.nightPages) + ' night hollows, a stamp at each ' +
      'of the ' + fmt(M.overlooks) + ' hubs, and honest tallies. It keeps for the visit.'],
    ['sw-look',
      'THE OVERLOOKS — hub stretches keep an overlook: stand at the table and press ENTER. A carved ' +
      'OVERLOOK AHEAD fingerpost stands a couple of screens before each table, and entering a hub ' +
      'breathes the hint once. The landmarks are the real pages the hub cites (at most seven), ' +
      'distances in words. Choosing one sweeps you there on an eased scenic curve.'],
    ['sw-sky',
      'THE NIGHT SKY — after dark, the constellation overhead is the citation graph of the biome you walk: ' +
      'its pages as stars, its internal citations as faint lines. The moon is the stretch\u2019s freshness — ' +
      'full when tended within ' + MOON_FULL_DAYS + ' days, thinning as the last commit ages, new past ' +
      fmt(MOON_NEW_DAYS) + ' untended days.'],
    ['sw-wind',
      'WEATHER — the wind of a stretch is its outbound links (the windiest page carries ' + fmt(M.maxOut) +
      '); grass leans and gusts ride it. Morning mist rests on the ' + fmt(M.zeroIn) + ' stretches no page ' +
      'cites — gentle, and never over the path or the prompts.'],
    ['sw-dog',
      'THE TRAIL DOG — she runs ahead, reads doors that ' + fmt(M.sniffMin) + ' or more pages cite, sits ' +
      'beside you while you read, shakes off the mist, and curls up against you if you fall asleep. ' +
      'SHE SPEAKS AT HER MOMENTS: ordinary steady walking carries no pant loop and no trotting noise, ' +
      'but her event voices live. Her signature is THE CATCH-UP BARK — she fell behind, sprinted the ' +
      'gap down, and arrives at your side with one happy bark, earned and welcome every time. Two ' +
      'quick snuffles, plainly hearable, when her nose reaches a well-cited door within your earshot — ' +
      'in passing on an ordinary stroll (never two within six seconds, ten or so apart in practice), so a walk ' +
      'past ten gates hears her a few times; one small yip instead at the rarer doors ' + fmt(M.yipMin) + ' or more pages ' +
      'cite, kept for the moment you stop there with her; an occasional spontaneous bark on the move, unscheduled, maybe once every minute or two ' +
      'of active play; a contented sigh once she has settled by a long read; a shake-off in a real ' +
      'mist or a real shower, and a single startle when a storm first rolls; and the light pant, kept ' +
      'for the rare occasion a gate has opened nine hundred pixels between you and she has run it ' +
      'down. No two of her sounds fall within a few seconds of each other, pitch and timing shift a ' +
      'little every play, and no voice of hers is ever louder than the wind. At the shore she is ' +
      'silent. Under reduced motion she simply keeps pace. Toggle her below or at the trailhead. ' +
      'AND WHEN YOU LOSE HER: C WHISTLES — a short two-note whistle from you, one bark in answer ' +
      'from wherever she is (panned and thinned by her distance), then she sprints home and settles ' +
      'at heel with a couple of seconds of light happy panting that fades as she calms. Whistle with ' +
      'her already at heel and she just looks up. Dog off, the key does nothing; every sound of it ' +
      'obeys the toggles and the gain laws.'],
    ['sw-guide',
      'THE FIELD GUIDE (G) — the first crossing of each species of trail furniture presses a card into the ' +
      'guide: ten species, from code boardwalks to night lanterns, every count the corpus\u2019s own.'],
    ['sw-cert',
      'CERTIFICATES — walk every page of a biome (or the whole trail) and the pack offers a downloadable ' +
      'flat-ink certificate carrying the walk\u2019s real numbers and the day\u2019s date.'],
    ['sw-wp',
      'YOUR WALKER — three silhouettes and four accessories, any mix; the choice dresses the walking ' +
      'sprite everywhere and keeps for the visit. Change it below.'],
    ['sw-le',
      'LAND’S END — the trail does not end at a wall. Past the end cairn the ground falls away to a ' +
      'shore, and the whole documentation lies below as a night coastline: ' + fmt(M.sea.length) +
      ' lights on dark water, one per page, each blinking its own page’s rhythm (length sets the beat, ' +
      'commits the offset, citations the brightness). A bench, the cliff, the lights, silence. It is in ' +
      'the trailhead index, and L at any gate map sails you there.'],
    ['sw-sfx',
      'TRAIL SOUND — bundled public-domain recordings, every one tied to something countable. Walking ' +
      'itself is silent: you make no noise on this ground (the one exception is the whistle you ' +
      'choose to give — C — capped at the gust’s own lawful peak). What sounds is the land — the jump and the ' +
      'landing, the springs, gates, greetings, the register’s pen, a chime at each carved stone, gusts ' +
      'scaled by the derived wind, night crickets, and the dog’s voices — the fog and the mist are ' +
      'silent, on purpose. The wind ' +
      'is weather, not a gale: the wind bed and its gusts are the QUIETEST layer on the trail, under ' +
      'the crickets and under the rain. And the dog is never louder than the wind — no ' +
      'voice of hers passes the peak of a gust. All distance-attenuated and panned by where the thing ' +
      'stands on your screen. Sources, and the arithmetic, in sfx/CREDITS.txt.'],
    ['sw-mus',
      'MUSIC AS WEATHER — never a loop. A small music-box voice, its scale drawn from the biome you ' +
      'walk, its register from the stretch’s freshness and its density from the hour, arrives at ' +
      'moments — golden hour, nightfall, a biome border, an overlook — speaks a few phrases and ' +
      'withdraws to real silence. The tine that closes a phrase is left to ring across the gap after ' +
      'it, so a moment never falls silent inside itself; the silence you hear is the silence BETWEEN ' +
      'moments, and it is most of the walk. One recorded acoustic theme (Kai Engel, “Meekness”, CC BY 4.0) is ' +
      'kept for the three rarest moments: your first arrival at Land’s End, every page of one ' +
      'community walked, and the whole trail walked.'],
    ['sw-score',
      'THE SCORE GROWS WITH THE JOURNEY — the deeper you stand, the richer the moments ' +
      'sound. To a fifth of the trail it is the sparse music box alone, exactly as at the ' +
      'trailhead. From 20 in the hundred the same notes simply come more often. At 30 a bowed ' +
      'string starts to visit: a gentle phrase now and then, half a minute to a minute apart, ' +
      'never continuous. At 50 a low pad joins quietly, the air of the Land’s End ensemble ' +
      'itself, so the climb stays in one family of sound. At 70 the warm counter-melody arrives ' +
      'with its full five voices, and past 90 the whole ensemble, both exactly as they always ' +
      'were. Progress is one honest number: WHERE YOU STAND — the word the odometer shows over ' +
      'the trail’s total, however you got there; walking back west thins the score the ' +
      'same honest way, and the end cairn reads 100. A new voice enters exposed on the next ' +
      'moment, and the HUD names it once. THE SILENCE IS UNCHANGED: layers make a moment ' +
      'thicker, never more frequent — the same triggers (golden hour, nightfall, a biome ' +
      'border, an overlook, a sky clearing), the same real quiet between them, at every rung.'],
    ['sw-wx',
      'THE SKY REMEMBERS THE QUIET MONTHS — the weather walks the documentation’s own calendar, ' +
      'one real month every ' + WX_MONTH_S + ' seconds, from the first commit in the corpus (' +
      wxSpanLabel(0) + ') to the last (' + wxSpanLabel(1) + '). A month nobody tended brings grey ' +
      'and a shower; a busy month clears the sky. ' + fmt(WX.quiet) + ' of the ' + fmt(WX.months.length) +
      ' months are quiet ones. The HUD names the month you are under, and names its cloud by how much ' +
      'of the light it actually takes: HIGH CLOUD, OVERCAST, HEAVY CLOUD. (Winter frost is a different ' +
      'thing: that belongs to the ground beneath you, not to the sky.)'],
    ['sw-snow',
      'SNOW — a quiet winter month on the calendar (December to February, nobody came) snows instead ' +
      'of raining: riso flakes, the ground whitening in over a minute and thawing after; jumping, ' +
      'bouncing and reading untouched.'],
    ['sw-rb',
      'RAINBOW — rare: only as a shower clears under a low sun, a banded riso arc stands a moment ' +
      'and goes gently, never twice in an hour of play.'],
    ['sw-fog',
      'FOG — a thin autumn month (October or November, untended or nearly so) rolls a bank in and ' +
      'holds it, capped so the path, the hazards, the prompts and the walker always read. The fog ' +
      'is silent, and the dock and HUD are never dimmed.'],
    ['sw-storm',
      'THUNDERSTORM — the middle of a long untended streak breaks short and hard: the light drops a ' +
      'stop, a two-frame riso flash, a soft rolled thunder at wind-level gain obeying the toggles, ' +
      'the dog startles once then settles; never during your first minute.'],
    ['sw-sleep',
      'STANDING STILL — after ' + SLEEP_T1 + ' seconds the walker settles; if a bench, a picnic-table ' +
      'seat or the overlook bench is within a step or two she walks to it and sits ON it, and only ' +
      'bare trail sits her on the ground; after ' + SLEEP_T2 + ' she nods off and the dog curls up against her; after ' +
      (SLEEP_T3 / 60) + ' minutes she is properly asleep and snoring. Any key or click wakes her ' +
      'with a stretch and the walk resumes with no penalty. Reading the page keeps her on her feet ' +
      'for the first stage only — after that she dozes beside you, which is the point of her.'],
    ['sw-play',
      'SOMETIMES, INSTEAD OF SLEEPING, SHE PLAYS — roughly one settle in five or six, never twice ' +
      'in a row: she sits, takes a kalimba or a tin whistle from the pack, and plays the music of ' +
      'the very stretch she sits in — a quiet music-box solo, twenty or thirty seconds, the dog ' +
      'settling to listen — then puts it away and dozes as usual. Any key stops her mid-phrase ' +
      'with one small apologetic note. Muting MUSIC mutes the tune, never the playing. Under ' +
      'reduced motion she simply dozes.'],
    ['sw-lay',
      'ROOM TO READ — V, or the LAYOUT chip. STACKED gives the trail the top half of the window and ' +
      'the page the bottom half; SIDE BY SIDE puts the trail on the left (' +
      Math.round(LAY_SIDE * 100) + '%) and the page on the right, full height. Under ' + LAY_MIN_W +
      ' px of width, side by side folds back to stacked. The strip stays locked to the block you ' +
      'stand in either way, and the choice keeps for the visit.']
  ];
  const ul = document.getElementById('keyList');
  ul.innerHTML = '';
  for (const [cls, txt] of rows) {
    const li = el('li');
    const sw = el('span', 'keysw');
    for (const c of KEY_SWATCHES[cls] || [INKS.cream]) {
      const st = el('span');
      st.style.background = c;
      sw.appendChild(st);
    }
    li.appendChild(sw);
    li.appendChild(el('span', null, esc(txt)));
    ul.appendChild(li);
  }
  /* the key's two controls: the dog, and the walker */
  const ctl = el('li');
  const sw2 = el('span', 'keysw');
  [INK_DARK, INKS.rose, INKS.violet].forEach(c => {
    const st = el('span'); st.style.background = c; sw2.appendChild(st);
  });
  ctl.appendChild(sw2);
  const wrap = el('span', 'keyctl');
  const bDog = el('button', 'keybtn'); bDog.type = 'button'; bDog.id = 'keyDog';
  const bWp = el('button', 'keybtn', 'CHOOSE YOUR WALKER'); bWp.type = 'button'; bWp.id = 'keyWalker';
  bDog.addEventListener('click', toggleDog);
  bWp.addEventListener('click', () => openWalkerPick());
  wrap.appendChild(bDog);
  wrap.appendChild(bWp);
  ctl.appendChild(wrap);
  ul.appendChild(ctl);
  /* the two sound layers, independent, side by side (F and M) */
  const ctl2 = el('li');
  const sw3 = el('span', 'keysw');
  [INKS.apricot, INKS.cream, INKS.rose].forEach(c => {
    const st = el('span'); st.style.background = c; sw3.appendChild(st);
  });
  ctl2.appendChild(sw3);
  const wrap2 = el('span', 'keyctl');
  const bSfx = el('button', 'keybtn'); bSfx.type = 'button'; bSfx.id = 'keySfx';
  const bMus = el('button', 'keybtn'); bMus.type = 'button'; bMus.id = 'keyMus';
  bSfx.addEventListener('click', () => { audUnlock(); toggleSfx(); });
  bMus.addEventListener('click', () => { audUnlock(); toggleMusic(); });
  wrap2.appendChild(bSfx);
  wrap2.appendChild(bMus);
  const note = el('span', 'keynote',
    'TWO SEPARATE LAYERS — F AND M. OFF IS A MUTE, NOT A STOP: THE WIND KEEPS BLOWING AND THE ' +
    'MUSIC KEEPS PLAYING BEHIND IT, SO ON AGAIN LANDS YOU INSIDE WHATEVER THE TRAIL HOLDS. ' +
    'BOTH OFF LEAVES THE TRAIL WHOLE. UNDER REDUCED MOTION BOTH START OFF.');
  wrap2.appendChild(note);
  ctl2.appendChild(wrap2);
  ul.appendChild(ctl2);
  /* and the layout, the third thing you may set from here */
  const ctl3 = el('li');
  const sw4 = el('span', 'keysw');
  [INKS.aubergine, INKS.cream, INKS.violet].forEach(c => {
    const st = el('span'); st.style.background = c; sw4.appendChild(st);
  });
  ctl3.appendChild(sw4);
  const wrap3 = el('span', 'keyctl');
  const bLay = el('button', 'keybtn'); bLay.type = 'button'; bLay.id = 'keyLayout';
  bLay.addEventListener('click', () => toggleLayout());
  wrap3.appendChild(bLay);
  wrap3.appendChild(el('span', 'keynote',
    'V SWITCHES IT. THE READING STRIP STAYS LOCKED TO THE BLOCK YOU STAND IN, EITHER WAY.'));
  ctl3.appendChild(wrap3);
  ul.appendChild(ctl3);
  refreshDogUI();
  refreshAudioUI();
  refreshLayoutUI();
}
document.getElementById('btnKey').addEventListener('click', () => {
  if (S.overlay === 'key') closeOverlays(); else openKey();
});

/* ---------------- the trail register (feedback — real) ---------------- */
const regNoteEl = document.getElementById('regNote');
const regSignEl = document.getElementById('regSign');
const regStatusEl = document.getElementById('regStatus');
let regPageRef = null;

function updateRegCount() {
  document.getElementById('regCount').textContent = regNoteEl.value.length + ' / 2000';
  regSignEl.disabled = regNoteEl.value.trim().length === 0;
}
regNoteEl.addEventListener('input', updateRegCount);

function openRegister(pg) {
  closeOverlays();
  audEv('regopen', pg.regX);
  S.overlay = 'register';
  regPageRef = pg;
  document.getElementById('register').hidden = false;
  document.getElementById('regPage').textContent =
    pg.title.toUpperCase() + ' · ' + fmt(pg.words) + ' WORDS · YOUR LINE POSTS TO THE REAL DOCS FEEDBACK BOOK';
  const prior = REGBOOK[pg.slug];
  const pr = document.getElementById('regPrior');
  if (prior) {
    pr.hidden = false;
    pr.innerHTML = '<b>YOUR LINE — SIGNED ' + esc(prior.when) +
      (prior.sent ? ' · THE INK IS DRY' : ' · THE INK IS STILL DRYING') + '</b>' + esc(prior.note);
  } else pr.hidden = true;
  regNoteEl.value = prior && !prior.sent ? prior.note : '';
  updateRegCount();
  regStatusEl.textContent = '\u00a0';
  setTimeout(() => regNoteEl.focus(), 0);
}

async function signRegister() {
  const pg = regPageRef;
  if (!pg) return;
  const note = regNoteEl.value.trim();
  if (!note || note.length > 2000) return;
  regSignEl.disabled = true;
  regStatusEl.textContent = 'SIGNING\u2026';
  audEv('pen');   /* the pen scratches whether or not the ink reaches home */
  let sent = false;
  try {
    if (LOCAL_ORIGIN) throw new Error('local preview: the ink stays in the box');
    const res = await fetch(FEEDBACK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-feedback-source': 'docs-widget' },
      body: JSON.stringify({
        vote: 'up',
        kind: 'element',
        comment: note,
        pagePath: pg.slug,
        pageTitle: pg.title,
        selectionHeading: 'Design Lab - The Long Way Through'
      })
    });
    sent = res.ok;
  } catch (e) { sent = false; }
  /* the line goes into the box for the visit either way; the text is never lost */
  REGBOOK[pg.slug] = { note, when: new Date().toISOString().slice(0, 10), sent };
  queueSave();
  const pr = document.getElementById('regPrior');
  pr.hidden = false;
  pr.innerHTML = '<b>YOUR LINE — SIGNED ' + esc(REGBOOK[pg.slug].when) +
    (sent ? ' · THE INK IS DRY' : ' · THE INK IS STILL DRYING') + '</b>' + esc(note);
  if (sent) {
    regStatusEl.textContent = 'SIGNED — THANK YOU, WALKER.';
    regNoteEl.value = '';
  } else {
    regStatusEl.textContent = 'THE INK WILL DRY WHEN THIS TRAIL OPENS TO THE PUBLIC';
  }
  updateRegCount();
  needsDraw = true;
  if (REDUCED) renderStep();
}
regSignEl.addEventListener('click', signRegister);

/* ---------------- the ranger ticket (contribute — real) ---------------- */
function ticketEditUrl(pg) { return GH_EDIT + pg.file; }
function ticketIssueUrl(pg) {
  return GH_ISSUE + '?title=' + encodeURIComponent('Trail damage: ' + pg.title) +
    '&body=' + encodeURIComponent(
      'Page: ' + pg.slug + '\nSource file: docusaurus/' + pg.file +
      '\n\nDamage observed:\n\n---\nFiled from the Design Lab trail \u201cThe Long Way Through\u201d.');
}
function openTicket(pg) {
  closeOverlays();
  S.overlay = 'ticket';
  document.getElementById('ticket').hidden = false;
  document.getElementById('tkTitle').textContent = pg.title;
  document.getElementById('tkMeta').textContent =
    pg.slug + ' · docusaurus/' + pg.file + ' · TENDED ' + fmt(pg.ageDays) + ' DAYS AGO';
  document.getElementById('tkEdit').href = ticketEditUrl(pg);
  document.getElementById('tkIssue').href = ticketIssueUrl(pg);
}

/* ---------------- the pack (B): the walk passport ---------------- */
function openPack() {
  if (S.overlay === 'pack') { closeOverlays(); return; }
  closeOverlays();
  S.overlay = 'pack';
  document.getElementById('packpanel').hidden = false;
  const visitedN = Object.keys(PACK.visited).filter(sl => M.bySlug.has(sl)).length;
  const cells = [
    [fmt(Math.round(PACK.walked)), 'WORDS WALKED'],
    [fmt(visitedN) + ' / ' + fmt(M.pages.length), 'PAGES READ'],
    [Object.keys(PACK.biomes).length + ' / ' + M.communities.length, 'BIOMES CROSSED'],
    [fmt(PACK.greeted), 'WALKERS GREETED'],
    [Object.keys(PACK.hollows).length + ' / ' + fmt(M.nightPages), 'HOLLOWS LIT'],
    [Object.keys(PACK.leaves).length + ' / ' + fmt(M.autumnPages || 0), 'PRESSED LEAVES'],
    [Object.keys(PACK.stamps).length + ' / ' + M.overlooks, 'HUB STAMPS'],
    [fmt(PACK.days), 'DAYS-NIGHTS CROSSED']
  ];
  const grid = document.getElementById('pkGrid');
  grid.innerHTML = '';
  for (const [v, l] of cells) {
    const c = el('div', 'pkCell');
    c.appendChild(el('b', null, esc(v)));
    c.appendChild(el('span', null, esc(l)));
    grid.appendChild(c);
  }
  const stamps = document.getElementById('pkStamps');
  stamps.innerHTML = '';
  const chip = (cls, txt) => stamps.appendChild(el('span', 'pkStamp ' + cls, esc(txt)));
  chip('score', 'SCORE · ' + SCORE_VOICES[SCORE.tier] + ' OF ' +
    SCORE_VOICES[SCORE_VOICES.length - 1] + ' VOICES · ' +
    SCORE_TIERS[SCORE.tier].name + ' · ' + Math.round(SCORE.p * 100) + '%');
  Object.keys(PACK.stamps).forEach(sl => {
    const hp = M.bySlug.get(sl);
    chip('', 'HUB · ' + (hp ? hp.label.toUpperCase() : sl));
  });
  const leaves = Object.keys(PACK.leaves);
  leaves.slice(0, 8).forEach(sl => {
    const lp = M.bySlug.get(sl);
    chip('leaf', 'LEAF · ' + (lp ? lp.label.toUpperCase() : sl));
  });
  if (leaves.length > 8) chip('leaf', '+' + (leaves.length - 8) + ' MORE LEAVES');
  const hollows = Object.keys(PACK.hollows);
  hollows.slice(0, 8).forEach(sl => {
    const lp = M.bySlug.get(sl);
    chip('lantern', 'LANTERN · ' + (lp ? lp.label.toUpperCase() : sl));
  });
  if (hollows.length > 8) chip('lantern', '+' + (hollows.length - 8) + ' MORE LANTERNS');

  const certs = document.getElementById('pkCerts');
  certs.innerHTML = '';
  certs.appendChild(el('div', 'pkCertHead', 'TRAIL CERTIFICATES'));
  let any = false;
  M.communities.forEach((c, ci) => {
    if (!commComplete(ci)) return;
    any = true;
    const b = el('button', null,
      'CERTIFICATE — ' + esc(String(c.dominant || '').toUpperCase()) + ' · ' + c.size + ' PAGES · DOWNLOAD PNG');
    b.dataset.cert = ci;
    certs.appendChild(b);
  });
  if (trailComplete()) {
    any = true;
    const b = el('button', null, 'CERTIFICATE — THE WHOLE TRAIL · ' + fmt(M.pages.length) + ' PAGES · DOWNLOAD PNG');
    b.dataset.cert = 'trail';
    certs.appendChild(b);
  }
  if (!any) {
    let bi = -1, bv = -1;
    M.communities.forEach((c, ci) => {
      const v = c.members.filter(m => PACK.visited[m]).length;
      if (v < c.members.length && v / c.members.length > bv) { bv = v / c.members.length; bi = ci; }
    });
    const c = bi >= 0 ? M.communities[bi] : null;
    certs.appendChild(el('div', 'pkCertNote', c
      ? 'Walk every page of a biome to earn its certificate. Nearest: ' +
        esc(String(c.dominant || '')) + ' — ' +
        c.members.filter(m => PACK.visited[m]).length + ' of ' + c.size + ' pages walked.'
      : 'Walk every page of a biome to earn its certificate.'));
  }
}
document.getElementById('pkCerts').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b && b.dataset.cert !== undefined) downloadCert(b.dataset.cert === 'trail' ? 'trail' : +b.dataset.cert);
});
document.getElementById('btnPack').addEventListener('click', openPack);

/* ---------------- the trail certificate (flat-ink PNG, 2.5×) ----------- */
function certCanvas(which) {
  const SCALE = 2.5, w = 800, h = 560;
  const c = document.createElement('canvas');
  c.width = w * SCALE; c.height = h * SCALE;
  const g = c.getContext('2d');
  g.scale(SCALE, SCALE);
  const sp = (txt, x, y, size, color, ls, align) => {
    g.font = size + 'px Georgia, serif';
    g.textAlign = align || 'center';
    try { g.letterSpacing = (ls === undefined ? 2 : ls) + 'px'; } catch (e) { }
    g.fillStyle = color;
    g.fillText(txt, x, y);
    try { g.letterSpacing = '0px'; } catch (e) { }
  };
  g.fillStyle = INK_DARK; g.fillRect(0, 0, w, h);
  /* riso double border, misregistered */
  g.strokeStyle = INKS.violet; g.lineWidth = 2.5; g.strokeRect(21, 21, w - 42, h - 42);
  g.strokeStyle = INKS.cream; g.lineWidth = 2.5; g.strokeRect(18, 18, w - 36, h - 36);
  /* scene: ridges, sun, walker and dog */
  const gy = h - 88;
  /* a low riso sun sinking behind the far ridge */
  g.fillStyle = INKS.rose; g.beginPath(); g.arc(w * 0.82 + 4, gy - 78 + 3, 26, 0, 7); g.fill();
  g.fillStyle = INKS.cream; g.beginPath(); g.arc(w * 0.82, gy - 78, 26, 0, 7); g.fill();
  g.fillStyle = mix(INK_DARK, INKS.violet, 0.42);
  g.beginPath(); g.moveTo(24, gy - 52);
  for (let i = 0; i <= 12; i++) g.lineTo(24 + (w - 48) * i / 12, gy - 52 - Math.sin(i * 2.1) * 16 - (i % 3) * 7);
  g.lineTo(w - 24, gy); g.lineTo(24, gy); g.closePath(); g.fill();
  g.fillStyle = mix(INK_DARK, INKS.rose, 0.30);
  g.beginPath(); g.moveTo(24, gy - 24);
  for (let i = 0; i <= 9; i++) g.lineTo(24 + (w - 48) * i / 9, gy - 24 - Math.sin(i * 3.3 + 1) * 11);
  g.lineTo(w - 24, gy); g.lineTo(24, gy); g.closePath(); g.fill();
  g.fillStyle = mix(INK_DARK, INKS.aubergine, 0.6);
  g.fillRect(24, gy, w - 48, 76);
  g.fillStyle = 'rgba(255,243,224,0.5)';
  g.fillRect(24, gy + 26, w - 48, 2);
  /* the walker (simple flat figure) and the dog beside */
  const fx = w * 0.30, fy = gy + 27;
  g.fillStyle = INKS.cream;
  g.fillRect(fx - 1.6, fy - 34, 3.2, 14);
  g.beginPath(); g.arc(fx, fy - 38, 4.6, 0, 7); g.fill();
  g.strokeStyle = INKS.cream; g.lineWidth = 3;
  g.beginPath(); g.moveTo(fx, fy - 21); g.lineTo(fx - 6, fy); g.stroke();
  g.beginPath(); g.moveTo(fx, fy - 21); g.lineTo(fx + 6, fy); g.stroke();
  if (DOG.on) {
    g.fillStyle = INKS.cream;
    g.fillRect(fx - 34, fy - 10, 15, 5.5);
    g.beginPath(); g.arc(fx - 18, fy - 11, 3.6, 0, 7); g.fill();
    g.strokeStyle = INKS.cream; g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(fx - 31, fy - 5); g.lineTo(fx - 31, fy); g.stroke();
    g.beginPath(); g.moveTo(fx - 22, fy - 5); g.lineTo(fx - 22, fy); g.stroke();
    g.beginPath(); g.moveTo(fx - 34, fy - 9); g.lineTo(fx - 38, fy - 14); g.stroke();
  }
  /* the words */
  sp('STRAPI DOCUMENTATION, WALKED WHOLE', w / 2, 64, 10, '#C1226E', 4);
  g.fillStyle = INKS.apricot;
  sp('TRAIL CERTIFICATE', w / 2 + 3, 118 + 2, 46, INKS.apricot, 2);
  sp('TRAIL CERTIFICATE', w / 2, 118, 46, INKS.cream, 2);
  sp('THIS CERTIFIES THAT A WALKER TOOK THE LONG WAY THROUGH', w / 2, 152, 11, 'rgba(255,243,224,0.75)', 2);
  let name, pagesLine;
  if (which === 'trail') {
    name = 'THE WHOLE TRAIL';
    pagesLine = fmt(M.pages.length) + ' PAGES · ' + fmt(M.totalWords) + ' WORDS OF TRAIL';
  } else {
    const c2 = M.communities[which];
    name = String(c2.dominant || '').toUpperCase();
    const hp = M.bySlug.get(c2.hub);
    pagesLine = c2.size + ' PAGES · HUB: ' + (hp ? hp.label.toUpperCase() : c2.hub);
  }
  g.fillStyle = INKS.cream;
  const nw = Math.min(w - 120, Math.max(320, name.length * 22 + 80));
  g.fillRect(w / 2 - nw / 2 + 4, 176 + 4, nw, 54);
  g.fillStyle = INKS.rose;
  g.globalAlpha = 0.45;
  g.fillRect(w / 2 - nw / 2 + 8, 180 + 6, nw, 54);
  g.globalAlpha = 1;
  g.fillStyle = INKS.cream;
  g.fillRect(w / 2 - nw / 2, 176, nw, 54);
  sp(name, w / 2, 210, 26, INK_DARK, 2);
  sp(pagesLine, w / 2, 246, 10.5, INKS.apricot, 2.5);
  const scopeRead = which === 'trail'
    ? Object.keys(PACK.visited).filter(sl => M.bySlug.has(sl)).length + ' OF ' + M.pages.length
    : M.communities[which].members.filter(m => PACK.visited[m]).length + ' OF ' + M.communities[which].size;
  const rows = [
    ['PAGES READ', scopeRead],
    ['WORDS WALKED', fmt(Math.round(PACK.walked))],
    ['FELLOW WALKERS GREETED', fmt(PACK.greeted)],
    ['NIGHT HOLLOWS LIT', fmt(Object.keys(PACK.hollows).length)],
    ['DAYS AND NIGHTS CROSSED', fmt(PACK.days)],
    ['HUB STAMPS IN THE PACK', fmt(Object.keys(PACK.stamps).length)]
  ];
  rows.forEach((r, i) => {
    const col = i % 2, row = (i / 2) | 0;
    const cxx = w / 2 + (col === 0 ? -170 : 170);
    sp(r[0], cxx, 282 + row * 40, 9.5, 'rgba(255,243,224,0.65)', 2.5);
    sp(r[1], cxx, 300 + row * 40, 17, INKS.cream, 1);
  });
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
  sp(today, w / 2, h - 52, 11, INKS.apricot, 3);
  sp('DESIGN LAB — THE LONG WAY THROUGH · EVERY NUMBER IS THE WALK\u2019S OWN', w / 2, h - 32, 8.5, 'rgba(255,243,224,0.55)', 2);
  return c;
}
function downloadCert(which) {
  try {
    const c = certCanvas(which);
    const nm = which === 'trail' ? 'whole-trail'
      : String(M.communities[which].dominant || 'biome').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const a = document.createElement('a');
    a.download = 'the-long-way-through-' + nm + '.png';
    a.href = c.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (e) { /* canvas export can be blocked in odd sandboxes */ }
}

/* ---------------- the field guide (G) ---------------- */
function drawGuideIcon(cv2, id) {
  const g = cv2.getContext('2d');
  const wI = cv2.width, hI = cv2.height, gy = hI - 12;
  g.clearRect(0, 0, wI, hI);
  g.fillStyle = 'rgba(255,243,224,0.35)';
  g.fillRect(6, gy + 4, wI - 12, 1.6);
  const ink = INKS.cream, acc = INKS.rose;
  const poly = (pts, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fill(); };
  const mid = wI / 2;
  g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 2;
  switch (id) {
    case 'boardwalk':
      g.fillStyle = 'rgba(255,243,224,0.8)';
      for (let i = -3; i <= 3; i++) g.fillRect(mid + i * 9 - 3, gy - 3, 6.5, 5);
      g.fillStyle = ink;
      g.fillRect(mid - 31, gy - 4.5, 62, 1.4); g.fillRect(mid - 31, gy + 2.6, 62, 1.4);
      break;
    case 'picnic':
      g.fillRect(mid - 15, gy - 19, 30, 3.4);
      g.beginPath(); g.moveTo(mid - 9, gy - 16); g.lineTo(mid - 16, gy); g.stroke();
      g.beginPath(); g.moveTo(mid + 9, gy - 16); g.lineTo(mid + 16, gy); g.stroke();
      g.fillRect(mid - 24, gy - 9, 11, 2.6); g.fillRect(mid + 13, gy - 9, 11, 2.6);
      break;
    case 'cairn':
      poly([[mid - 11, gy], [mid + 11, gy], [mid + 8, gy - 6], [mid - 8, gy - 6]], ink);
      poly([[mid - 8, gy - 6], [mid + 8, gy - 6], [mid + 6, gy - 11], [mid - 6, gy - 11]], ink);
      poly([[mid - 6, gy - 11], [mid + 6, gy - 11], [mid + 3.6, gy - 15.4], [mid - 3.6, gy - 15.4]], ink);
      g.fillStyle = acc; g.fillRect(mid - 2.2, gy - 18.4, 4.4, 3);
      break;
    case 'warnpost':
      g.fillStyle = INKS.apricot; g.fillRect(mid - 14, gy - 11, 28, 11);
      g.fillStyle = INK_DARK;
      poly([[mid - 12, gy], [mid - 8, gy - 11], [mid - 4, gy - 11], [mid - 8, gy]], INK_DARK);
      poly([[mid, gy], [mid + 4, gy - 11], [mid + 8, gy - 11], [mid + 4, gy]], INK_DARK);
      g.strokeStyle = ink; g.lineWidth = 1.4; g.strokeRect(mid - 14, gy - 11, 28, 11);
      break;
    case 'spring':
      poly([[mid - 12, gy], [mid + 12, gy], [mid + 8, gy - 8], [mid - 8, gy - 8]], acc);
      g.strokeStyle = ink; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(mid - 7, gy - 5.5); g.lineTo(mid + 7, gy - 5.5); g.stroke();
      g.beginPath(); g.moveTo(mid - 9, gy - 2); g.lineTo(mid + 9, gy - 2); g.stroke();
      break;
    case 'milepost':
      g.beginPath(); g.moveTo(mid, gy); g.lineTo(mid, gy - 22); g.stroke();
      g.fillStyle = 'rgba(255,243,224,0.9)'; g.fillRect(mid - 11, gy - 32, 22, 10);
      g.fillStyle = INK_DARK; g.font = (6.5 * TYPE_SCALE) + 'px Georgia'; g.textAlign = 'center';
      g.fillText('API', mid, gy - 24.6);
      break;
    case 'frame':
      g.beginPath(); g.moveTo(mid - 7, gy); g.lineTo(mid, gy - 20); g.stroke();
      g.beginPath(); g.moveTo(mid + 7, gy); g.lineTo(mid, gy - 20); g.stroke();
      g.fillStyle = 'rgba(255,243,224,0.9)'; g.fillRect(mid - 11, gy - 34, 22, 16);
      g.fillStyle = acc; g.fillRect(mid - 8, gy - 31, 16, 10);
      break;
    case 'terrace':
      for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? acc : ink; g.fillRect(mid - 20 + i * 8, gy - 26, 8, 6); }
      g.fillStyle = ink;
      g.fillRect(mid - 21, gy - 20, 2, 20); g.fillRect(mid + 19, gy - 20, 2, 20);
      g.fillRect(mid - 12, gy - 12, 24, 12);
      break;
    case 'door':
      poly([[mid - 9, gy], [mid - 9, gy - 24], [mid - 5, gy - 24], [mid - 5, gy]], ink);
      poly([[mid + 5, gy], [mid + 5, gy - 24], [mid + 9, gy - 24], [mid + 9, gy]], ink);
      g.fillRect(mid - 11, gy - 27, 22, 3.4);
      g.fillStyle = 'rgba(255,243,224,0.55)'; g.fillRect(mid - 5, gy - 24, 10, 24);
      g.fillStyle = acc; g.fillRect(mid - 3.6, gy - 22, 7.2, 3);
      break;
    case 'lantern':
      g.beginPath(); g.moveTo(mid - 4, gy); g.lineTo(mid - 4, gy - 26); g.stroke();
      g.beginPath(); g.moveTo(mid - 4, gy - 26); g.lineTo(mid + 5, gy - 24); g.stroke();
      g.fillRect(mid + 2, gy - 24, 7, 9);
      g.fillStyle = INKS.apricot; g.fillRect(mid + 3.6, gy - 22, 3.8, 5.4);
      break;
  }
}
function openGuide() {
  if (S.overlay === 'guide') { closeOverlays(); return; }
  closeOverlays();
  S.overlay = 'guide';
  document.getElementById('guidepanel').hidden = false;
  const found = Object.keys(GUIDE.found).length;
  document.getElementById('gdSub').textContent =
    found + ' OF ' + SPECIES.length + ' SPECIES CROSSED · EVERY COUNT IS THE CORPUS\u2019S OWN';
  const grid = document.getElementById('gdGrid');
  grid.innerHTML = '';
  for (const spc of SPECIES) {
    const got = GUIDE.found[spc.id];
    const card = el('div', 'gdCard' + (got ? '' : ' locked'));
    const cv2 = document.createElement('canvas');
    cv2.width = 84; cv2.height = 64;
    card.appendChild(cv2);
    const tx = el('div');
    tx.appendChild(el('b', null, esc(got ? spc.name : 'NOT YET CROSSED')));
    tx.appendChild(el('span', 'gdWhat', esc(got ? spc.what : 'Cross one on the trail to press its card into the guide.')));
    if (got) {
      tx.appendChild(el('span', 'gdCount', esc(fmt(spc.count()) + ' ACROSS THE TRAIL')));
      const ap = M.bySlug.get(got.at);
      tx.appendChild(el('span', 'gdFirst', esc('FIRST CROSSED AT WORD ' + fmt(got.word) + (ap ? ' · ON ' + ap.label.toUpperCase() : ''))));
    }
    card.appendChild(tx);
    grid.appendChild(card);
    if (got) drawGuideIcon(cv2, spc.id);
    else {
      const g = cv2.getContext('2d');
      g.fillStyle = 'rgba(255,243,224,0.4)';
      g.font = (26 * TYPE_SCALE) + 'px Georgia, serif'; g.textAlign = 'center';
      g.fillText('?', 42, 48);
    }
  }
}
document.getElementById('btnGuide').addEventListener('click', openGuide);

/* ---------------- the overlook (orientation table) ---------------- */
function lkLandmarks(p) {
  const o = p.overlook;
  const here = wordsAt(o.x);
  return o.landmarks.map(sl => {
    const tp = M.bySlug.get(sl);
    const dw = wordsAt(tp.start) - here;
    return { slug: sl, tp, dw };
  }).sort((a, b) => a.dw - b.dw);
}
function lkDraw() {
  if (!S.lk) return;
  const { p, marks } = S.lk;
  const g = document.getElementById('lkCanvas').getContext('2d');
  const wC = 720, hC = 240;
  g.clearRect(0, 0, wC, hC);
  const pal = paletteFor(p.comm, false);
  /* the biome's own dusk bands, flat */
  let yy = 0;
  const hsum = pal.bands.reduce((a2, b2) => a2 + b2.h, 0);
  for (const b of pal.bands) {
    const bh = hC * 0.72 * (b.h / hsum);
    g.fillStyle = b.c;
    g.fillRect(0, Math.floor(yy), wC, Math.ceil(bh) + 1);
    yy += bh;
  }
  g.fillStyle = pal.ridgeNear;
  g.fillRect(0, hC * 0.72, wC, hC * 0.28);
  g.fillStyle = pal.ridgeMid;
  g.beginPath(); g.moveTo(0, hC * 0.72);
  for (let i = 0; i <= 16; i++) g.lineTo(wC * i / 16, hC * 0.72 - 10 - Math.sin(i * 1.8 + p.idx) * 9);
  g.lineTo(wC, hC * 0.72); g.closePath(); g.fill();
  if (!marks.length) {
    g.fillStyle = INKS.cream; g.font = (12 * TYPE_SCALE) + 'px Georgia, serif'; g.textAlign = 'center';
    g.fillText('ALL SKY — THIS HUB CITES NO PAGES', wC / 2, hC * 0.4);
    return;
  }
  const baseY = hC * 0.72;
  /* every label box the table paints, so a probe reads the drawing rather
     than re-deriving it (the service LBL.boxes does for the trail signage) */
  S.lkBoxes = [];
  marks.forEach((m, i) => {
    const lx = wC * (0.5 + (i + 0.5 - marks.length / 2) / Math.max(4, marks.length) * 0.92);
    const hgt2 = 26 + Math.min(54, m.tp.inCount * 2.2);
    const sel = i === S.lkSel;
    const ink = sel ? INKS.apricot : mix(pal.ridgeFar, INK_DARK, 0.25);
    const v = (m.tp.comm < 0 ? 3 : m.tp.comm) % 5;
    const poly = (pts) => { g.fillStyle = ink; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let j = 1; j < pts.length; j++) g.lineTo(pts[j][0], pts[j][1]); g.closePath(); g.fill(); };
    if (v === 0) {
      poly([[lx - 6, baseY], [lx - 4, baseY - hgt2], [lx + 4, baseY - hgt2], [lx + 6, baseY]]);
      poly([[lx - 9, baseY - hgt2], [lx + 9, baseY - hgt2], [lx + 6, baseY - hgt2 - 9], [lx - 6, baseY - hgt2 - 9]]);
    } else if (v === 1) {
      poly([[lx - 10, baseY], [lx - 10, baseY - hgt2], [lx - 4, baseY - hgt2], [lx - 4, baseY]]);
      poly([[lx + 4, baseY], [lx + 4, baseY - hgt2], [lx + 10, baseY - hgt2], [lx + 10, baseY]]);
      poly([[lx - 13, baseY - hgt2], [lx + 13, baseY - hgt2], [lx + 13, baseY - hgt2 - 6], [lx - 13, baseY - hgt2 - 6]]);
    } else if (v === 2) {
      poly([[lx, baseY - hgt2 - 12], [lx - 7, baseY], [lx + 7, baseY]]);
    } else if (v === 3) {
      poly([[lx - 8, baseY], [lx - 8, baseY - hgt2 * 0.85], [lx - 2, baseY - hgt2 * 0.85], [lx - 2, baseY]]);
      poly([[lx + 2, baseY], [lx + 2, baseY - hgt2], [lx + 8, baseY - hgt2], [lx + 8, baseY]]);
    } else {
      poly([[lx - 9, baseY - hgt2 * 0.7], [lx + 9, baseY - hgt2 * 0.7], [lx + 6, baseY - hgt2], [lx - 6, baseY - hgt2]]);
      g.strokeStyle = ink; g.lineWidth = 2;
      g.beginPath(); g.moveTo(lx - 6, baseY); g.lineTo(lx - 3, baseY - hgt2 * 0.7); g.stroke();
      g.beginPath(); g.moveTo(lx + 6, baseY); g.lineTo(lx + 3, baseY - hgt2 * 0.7); g.stroke();
    }
    g.font = (9 * TYPE_SCALE) + 'px Georgia, serif';
    g.textAlign = 'center';
    g.fillStyle = sel ? INKS.cream : 'rgba(255,243,224,0.7)';
    let nm = m.tp.label.toUpperCase();
    if (nm.length > 18) nm = nm.slice(0, 17) + '\u2026';
    /* THE NAMES HANG ON TWO FIXED ROWS, NOT ON THE PEAKS (prepolish5).
       Hanging each name off its own summit looked right at the old size,
       but the peaks differ by thirty pixels of height (they are the real
       inbound-citation counts) and grown type made neighbours on the two
       parity rows touch anyway. Two rows above the tallest lantern the
       table can raise, and each name shortened until a same-row neighbour
       cannot be reached, is a law rather than a hope. */
    const nameTop = baseY - (26 + 54) - 16;
    const slot = wC * (0.92 / Math.max(4, marks.length)) * 2 - 8;
    while (nm.length > 6 && g.measureText(nm).width > slot) nm = nm.slice(0, nm.length - 2) + '\u2026';
    const nmW = g.measureText(nm).width;
    const nmX = clamp(lx, nmW / 2 + 4, wC - nmW / 2 - 4);
    const nmY = nameTop - (i % 2) * 18;
    g.fillText(nm, nmX, nmY);
    S.lkBoxes.push({ x0: nmX - nmW / 2, x1: nmX + nmW / 2, y0: nmY - 9 * TYPE_SCALE, y1: nmY + 3, t: nm });
    g.fillStyle = sel ? INKS.apricot : 'rgba(255,162,107,0.7)';
    g.font = (8 * TYPE_SCALE) + 'px Georgia, serif';
    const dt = fmt(Math.abs(m.dw)) + (m.dw >= 0 ? ' WORDS EAST' : ' WORDS WEST');
    const dtW = g.measureText(dt).width;
    const dtX = clamp(lx, dtW / 2 + 4, wC - dtW / 2 - 4);
    const dtY = baseY + 16 + (i % 2) * 15;
    g.fillText(dt, dtX, dtY);
    S.lkBoxes.push({ x0: dtX - dtW / 2, x1: dtX + dtW / 2, y0: dtY - 8 * TYPE_SCALE, y1: dtY + 3, t: dt });
  });
}
function openLook(p) {
  closeOverlays();
  S.overlay = 'overlook';
  const marks = lkLandmarks(p);
  S.lk = { p, marks };
  S.lkSel = 0;
  document.getElementById('overlook').hidden = false;
  const c = p.comm >= 0 ? M.communities[p.comm] : null;
  document.getElementById('lkSub').textContent = c
    ? String(c.dominant || '').toUpperCase() + ' · THE ' + (marks.length ? marks.length : 'ZERO') +
      ' LANDMARKS ARE THE REAL PAGES THIS HUB CITES · DISTANCES IN WORDS OF TRAIL'
    : 'OPEN COUNTRY';
  const ul = document.getElementById('lkList');
  ul.innerHTML = '';
  marks.forEach((m, i) => {
    const li = el('li', i === 0 ? 'sel' : '');
    li.dataset.i = i;
    /* every landmark on this table is a real page of the corpus; round 11
       says so in the DOM as well as in the model, so it can be checked from
       outside rather than taken on the word of the renderer */
    li.dataset.slug = m.slug;
    li.appendChild(el('span', null, esc(m.tp.title)));
    li.appendChild(el('span', 'lkDist',
      esc(fmt(Math.abs(m.dw)) + (m.dw >= 0 ? ' WORDS EAST' : ' WORDS WEST') + ' · CITED BY ' + fmt(m.tp.inCount) + ' PAGES')));
    ul.appendChild(li);
  });
  lkDraw();
}
function lkMove(d) {
  if (!S.lk || !S.lk.marks.length) return;
  const lis = document.getElementById('lkList').children;
  if (lis[S.lkSel]) lis[S.lkSel].classList.remove('sel');
  S.lkSel = clamp(S.lkSel + d, 0, S.lk.marks.length - 1);
  lis[S.lkSel].classList.add('sel');
  lis[S.lkSel].scrollIntoView({ block: 'nearest' });
  lkDraw();
}
function lkGo(i) {
  if (!S.lk) return;
  const m = S.lk.marks[i];
  closeOverlays();
  if (m) sweepTo(m.slug);
}
document.getElementById('lkList').addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (li) lkGo(+li.dataset.i);
});

function sweepTo(slug) {
  const p = M.bySlug.get(slug);
  if (!p) return;
  if (REDUCED) { teleport(p.start + 6); renderStep(); return; }
  S.sweep = {
    from: S.x, to: p.start + 6, t: 0,
    dur: clamp(Math.abs(p.start + 6 - S.x) / 9000, 1.2, 2.6)
  };
  S.target = null; S.vx = 0;
}

/* ---------------- choose your walker ---------------- */
function drawWalkerPreview(cv2, sil, accSet) {
  const g = cv2.getContext('2d');
  g.clearRect(0, 0, cv2.width, cv2.height);
  g.fillStyle = 'rgba(255,243,224,0.25)';
  g.fillRect(14, 130, cv2.width - 28, 2);
  const h = 2.0, sx = cv2.width / 2, sy = 129;
  const hipY = sy - 26 * h, shY = sy - 46 * h;
  const hx = sx, hy = shY - 10.5 * h;
  const ink = INKS.cream;
  const poly = (pts, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fill(); };
  /* rose registration shadow */
  g.save(); g.translate(2.5, 1.5); g.globalAlpha = 0.4;
  g.fillStyle = INKS.rose;
  g.fillRect(sx - 7 * h, shY, 14 * h, 26 * h);
  g.beginPath(); g.arc(hx, hy, 5.8 * h, 0, 7); g.fill();
  g.restore(); g.globalAlpha = 1;
  g.strokeStyle = ink; g.lineCap = 'round';
  g.lineWidth = 4.6 * h;
  g.beginPath(); g.moveTo(sx, hipY); g.lineTo(sx + 4 * h, sy); g.stroke();
  g.beginPath(); g.moveTo(sx, hipY); g.lineTo(sx - 4 * h, sy); g.stroke();
  poly([[sx - 7 * h, shY], [sx + 7 * h, shY], [sx + 4.6 * h, hipY + 2 * h], [sx - 4.6 * h, hipY + 2 * h]], ink);
  g.lineWidth = 3.2 * h;
  g.beginPath(); g.moveTo(sx, shY + 3 * h); g.lineTo(sx + 3 * h, hipY + 3 * h); g.stroke();
  g.beginPath(); g.moveTo(sx, shY + 3 * h); g.lineTo(sx - 3 * h, hipY + 3 * h); g.stroke();
  g.fillStyle = ink;
  g.fillRect(sx - 1.9 * h, shY - 5.5 * h, 3.8 * h, 6 * h);
  g.beginPath(); g.arc(hx, hy, 5.8 * h, 0, 7); g.fill();
  if (sil === 'A') {
    poly([[sx - 4.8 * h, hipY - 4 * h], [sx + 4.8 * h, hipY - 4 * h], [sx + 9.4 * h, hipY + 12 * h], [sx - 9.4 * h, hipY + 12 * h]], ink);
    poly([[hx - 2 * h, hy - 5 * h], [hx - 7.2 * h, hy + 0.5 * h], [hx - 6.2 * h, shY + 4 * h], [hx - 2.2 * h, shY + 0.5 * h]], ink);
  } else if (sil === 'B') {
    poly([[sx - 9.4 * h, shY], [sx + 9.4 * h, shY], [sx + 6.4 * h, shY + 7 * h], [sx - 6.4 * h, shY + 7 * h]], ink);
  }
  if (accSet.has('hat')) {
    g.fillStyle = ink;
    g.fillRect(hx - 8.4 * h, hy - 4.8 * h, 16.8 * h, 2 * h);
    g.fillRect(hx - 4.6 * h, hy - 11.6 * h, 9.2 * h, 7.2 * h);
    g.fillStyle = INK_DARK;
    g.fillRect(hx - 4.6 * h, hy - 6.4 * h, 9.2 * h, 1.5 * h);
  }
  if (accSet.has('crown')) {
    for (let i = -2; i <= 2; i++) {
      g.fillStyle = (i % 2 === 0) ? INKS.rose : INKS.apricot;
      g.fillRect(hx + i * 2.5 * h - 1.1 * h, hy - 5 * h - (2 - Math.abs(i)) * 1.1 * h - (accSet.has('hat') ? 7.2 * h : 0), 2.2 * h, 2.2 * h);
    }
  }
  if (accSet.has('glasses')) {
    g.strokeStyle = INK_DARK; g.lineWidth = 1.2 * h;
    g.beginPath(); g.arc(hx - 2.6 * h, hy - 0.4 * h, 2.1 * h, 0, 7); g.stroke();
    g.beginPath(); g.arc(hx + 2.6 * h, hy - 0.4 * h, 2.1 * h, 0, 7); g.stroke();
    g.beginPath(); g.moveTo(hx - 0.6 * h, hy - 0.4 * h); g.lineTo(hx + 0.6 * h, hy - 0.4 * h); g.stroke();
  }
  if (accSet.has('scarf')) {
    g.fillStyle = INKS.rose;
    g.fillRect(hx - 3.4 * h, shY - 5.4 * h, 6.8 * h, 2.6 * h);
    poly([[hx - 2.6 * h, shY - 3.6 * h], [hx - 10.5 * h, shY - 2 * h], [hx - 11.5 * h, shY + 0.8 * h], [hx - 2.2 * h, shY - 1 * h]], INKS.rose);
  }
}
function saveWalker() {
  WALKER.acc = [...WALKER.accSet];
  lsSet('longway.walker.v1', JSON.stringify({ sil: WALKER.sil, acc: WALKER.acc }));
  needsDraw = true;
}
function refreshWalkerUI() {
  const row = document.getElementById('wpRow');
  [...row.children].forEach(btn => btn.classList.toggle('sel', btn.dataset.sil === WALKER.sil));
  [...row.children].forEach(btn => drawWalkerPreview(btn.firstChild, btn.dataset.sil, btn.dataset.sil === WALKER.sil ? WALKER.accSet : new Set()));
  const accWrap = document.getElementById('wpAcc');
  [...accWrap.children].forEach(btn => btn.classList.toggle('on', WALKER.accSet.has(btn.dataset.acc)));
}
function setWalkerSil(sil) { WALKER.sil = sil; refreshWalkerUI(); saveWalker(); }
function toggleWalkerAcc(id) {
  if (WALKER.accSet.has(id)) WALKER.accSet.delete(id); else WALKER.accSet.add(id);
  refreshWalkerUI(); saveWalker();
}
function openWalkerPick() {
  closeOverlays();
  S.overlay = 'walker';
  document.getElementById('walkerpick').hidden = false;
  const row = document.getElementById('wpRow');
  if (!row.children.length) {
    for (const sil of ['A', 'B', 'C']) {
      const btn = el('button', 'wpFig');
      btn.type = 'button';
      btn.dataset.sil = sil;
      const cv2 = document.createElement('canvas');
      cv2.width = 110; cv2.height = 150;
      btn.appendChild(cv2);
      btn.addEventListener('click', () => setWalkerSil(sil));
      row.appendChild(btn);
    }
    const accWrap = document.getElementById('wpAcc');
    ACC_LIST.forEach((a, i) => {
      const btn = el('button', null, (i + 4) + ' — ' + a.label);
      btn.type = 'button';
      btn.dataset.acc = a.id;
      btn.addEventListener('click', () => toggleWalkerAcc(a.id));
      accWrap.appendChild(btn);
    });
  }
  refreshWalkerUI();
}

/* ---------------- the dog toggle ---------------- */
function refreshDogUI() {
  const t = 'TRAIL DOG — ' + (DOG.on ? 'ON' : 'OFF');
  const a = document.getElementById('ldDog');
  const b = document.getElementById('keyDog');
  if (a) { a.textContent = t; a.classList.toggle('off', !DOG.on); }
  if (b) { b.textContent = t; b.classList.toggle('off', !DOG.on); }
}
function toggleDog() {
  DOG.on = !DOG.on;
  lsSet('longway.dog', DOG.on ? '1' : '0');
  refreshDogUI();
  needsDraw = true;
  if (REDUCED) renderStep();
}
document.getElementById('ldDog').addEventListener('click', (e) => { e.stopPropagation(); toggleDog(); });
document.getElementById('ldWalker').addEventListener('click', (e) => {
  e.stopPropagation();
  dismissLanding();
  openWalkerPick();
});

/* ---------------- routing & travel ---------------- */
const wipeEl = document.getElementById('wipe');
let suppressHash = false;
function teleport(x) {
  const from = S.x;
  S.x = clamp(x, 10, M.worldEnd);
  S.target = null; S.vx = 0;
  /* a door, a fast travel or the index has carried you both a long way in
     one step: she arrives with you and gets her breath back on the other
     side. Walking beside you never does this, which is the point — the
     owner's order is that ordinary walking makes no dog sound at all. */
  if (Math.abs(S.x - from) > 1200) DOG.caught = 1;
  DOG.x = clamp(S.x - 54, DOG_WEST, M.worldEnd);
  DOG.sleepX = null; DOG.restX = null;
  needsDraw = true;
  syncPage(true);
}
function travelTo(slug) {
  const p = M.bySlug.get(slug);
  if (!p) return;
  const go = () => {
    teleport(p.start + 6);
    suppressHash = true;
    location.hash = '#' + slug;
  };
  if (REDUCED) { go(); return; }
  wipeEl.hidden = false;
  wipeEl.style.transformOrigin = 'left center';
  const a1 = wipeEl.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 170, easing: 'steps(6)', fill: 'forwards' });
  a1.onfinish = () => {
    go();
    wipeEl.style.transformOrigin = 'right center';
    const a2 = wipeEl.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 200, easing: 'steps(6)', fill: 'forwards' });
    a2.onfinish = () => { wipeEl.hidden = true; };
  };
}
function routeTo(slug) {
  if (slug === 'lands-end') { travelToLE(); return; }
  travelTo(slug);
}
window.addEventListener('hashchange', () => {
  if (suppressHash) { suppressHash = false; return; }
  const slug = location.hash.slice(1);
  if (slug === 'lands-end') { travelToLE(true); return; }
  if (M.bySlug.has(slug)) {
    const p = M.bySlug.get(slug);
    teleport(p.start + 6);
  }
});

function syncPage(force) {
  const atLE = S.x >= M.totalPx - 2;
  const p = pageAt(clamp(S.x, 0, M.totalPx - 1));
  if (p !== S.page || force) {
    S.page = p;
    if (!atLE) renderDock(p);
    collectPage(p);
    /* wave 3: entering a hub stretch breathes the overlook hint, once */
    if (p.overlook && !HUB_HINTED[p.slug]) {
      HUB_HINTED[p.slug] = 1;
      toast('THIS HUB KEEPS AN OVERLOOK — STAND AT THE TABLE AND PRESS ENTER');
    }
    const key = p.comm + ':' + (p.prov.night > 0 ? 'n' : 'd');
    if (key !== S.palKey) {
      const had = S.palKey !== '';
      S.palKey = key;
      /* hold the light we are leaving; the front eases the new one in */
      S.fromSnap = had ? (S.pal || null) : null;
      S.fromWN = S.lastWN == null ? DAY.wts.n : S.lastWN;
      S.pal = paletteFor(p.comm, p.prov.night > 0);
      S.front = REDUCED ? 1 : 0;   /* weather front sweeps on biome change */
      if (had) audMoment('border');   /* a biome border is a moment */
    }
    if (!suppressHash && !atLE) {
      try { history.replaceState(null, '', '#' + p.slug); } catch (e) { }
    }
  }
  if (atLE !== !!S.atLE) {
    S.atLE = atLE;
    if (atLE) {
      renderLEDock();
      audLEArrive();
      if (!suppressHash) { try { history.replaceState(null, '', '#lands-end'); } catch (e) { } }
    } else {
      renderDock(S.page);
      if (!suppressHash) { try { history.replaceState(null, '', '#' + S.page.slug); } catch (e) { } }
    }
    needsDraw = true;
  }
  if (!S.atLE) updateBlock(S.page, blockIndexAt(S.page, S.x));
}

/* ---------------- input ---------------- */
window.addEventListener('keydown', (e) => {
  if (S.overlay === 'landing') { dismissLanding(); e.preventDefault(); return; }
  if (S.overlay === 'register') {
    /* a form: typing stays typing; only ESC leaves */
    if (e.key === 'Escape') { closeOverlays(); e.preventDefault(); }
    return;
  }
  if (S.overlay === 'ticket') {
    if (e.key === 'Escape' || e.key.toLowerCase() === 'e') { closeOverlays(); e.preventDefault(); }
    return;
  }
  if (S.overlay === 'pack') {
    if (e.key === 'Escape' || e.key.toLowerCase() === 'b') { closeOverlays(); e.preventDefault(); }
    return;
  }
  if (S.overlay === 'guide') {
    if (e.key === 'Escape' || e.key.toLowerCase() === 'g') { closeOverlays(); e.preventDefault(); }
    return;
  }
  if (S.overlay === 'overlook') {
    /* w5r2 — THE OVERLOOK STEERS BOTH WAYS (owner, with screenshot): the
       panorama draws its landmarks west-to-east, LEFT TO RIGHT (lkLandmarks
       sorts by dw and lkDraw lays them out in that order), so the picture
       invites horizontal arrows. Left = the previous landmark in that
       west-to-east order, right = the next; all four arrows move the ONE
       selection, synced between the highlighted pillar and the list row
       (lkMove repaints both). The header hint now reads all four. */
    if (e.key === 'Escape') closeOverlays();
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') lkMove(1);
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') lkMove(-1);
    else if (e.key === 'Enter') lkGo(S.lkSel);
    e.preventDefault();
    return;
  }
  if (S.overlay === 'walker') {
    const k2 = e.key;
    if (k2 === 'Escape' || k2 === 'Enter') closeOverlays();
    else if (k2 === '1') setWalkerSil('A');
    else if (k2 === '2') setWalkerSil('B');
    else if (k2 === '3') setWalkerSil('C');
    else if (k2 >= '4' && k2 <= '7') toggleWalkerAcc(ACC_LIST[+k2 - 4].id);
    e.preventDefault();
    return;
  }
  if (S.overlay === 'portalask') {
    const kk = e.key.toLowerCase();
    if (kk === 'y') portalYes();
    else if (kk === 'n' || e.key === 'Escape') portalNo();
    else if (e.key === 'Enter') {
      const f = document.activeElement;
      if (f === paYes || f === paNo) f.click();
    } else if (e.key === 'Tab') {
      /* the notice keeps focus between its two carved answers */
      (document.activeElement === paYes ? paNo : paYes).focus();
    }
    e.preventDefault();
    return;
  }
  if (e.key === 'Tab') {
    e.preventDefault();
    if (S.overlay === 'index') closeOverlays(); else openTrailhead();
    return;
  }
  if (S.overlay === 'index') {
    if (e.key === 'Escape') { closeOverlays(); e.preventDefault(); }
    else if (e.key === 'ArrowDown') { thMove(1); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { thMove(-1); e.preventDefault(); }
    else if (e.key === 'Enter') {
      const p = thRows[thSel];
      if (p) { closeOverlays(); routeTo(p.slug); }
      e.preventDefault();
    }
    return;
  }
  if (S.overlay === 'gatemap') {
    if (e.key === 'Escape') closeOverlays();
    else if (e.key === 'Enter') confirmGate();
    e.preventDefault();
    return;
  }
  if (S.overlay === 'terrace') {
    if (e.key === 'Escape') closeOverlays();
    else if (e.key === 'ArrowDown') trMove(1);
    else if (e.key === 'ArrowUp') trMove(-1);
    else if (e.key === 'Enter') followCard(S.trSel);
    e.preventDefault();
    return;
  }
  if (S.overlay === 'key') {
    if (e.key === 'Escape' || e.key.toLowerCase() === 'k') closeOverlays();
    e.preventDefault();
    return;
  }
  const k = e.key.toLowerCase();
  if (k === 'enter') {
    /* preventDefault: portalAsk moves focus to a button DURING this
       keydown, and the browser's default Enter action would click it —
       the notice must never answer the keypress that raised it */
    e.preventDefault();
    const a = S.enterAct;
    if (a) {
      if (a.kind === 'terrace') openTerrace(a.nt);
      else if (a.kind === 'gate') openGate(a.g);
      else if (a.kind === 'look') openLook(a.p);
      else if (a.kind === 'portal') portalAsk(a.key);
    }
    return;
  }
  if (k === 'r') { if (S.nearReg) openRegister(S.nearReg); e.preventDefault(); return; }
  if (k === 'e') { if (S.nearTicket) openTicket(S.nearTicket); e.preventDefault(); return; }
  if (k === 'b') { openPack(); e.preventDefault(); return; }
  if (k === 'g') { openGuide(); e.preventDefault(); return; }
  if (k === 'k') { openKey(); e.preventDefault(); return; }
  if (k === 't') { cycleDaySpeed(); e.preventDefault(); return; }
  if (k === ' ' || k === 'arrowup' || k === 'w') {
    /* jump — never gates reading; a blocked calm walker crosses instantly */
    startJump();
    e.preventDefault();
    return;
  }
  if (k === 'h') {
    /* the flowered verge: kneel and press a flower (one quiet prompt) */
    if (S.nearFlower && !PORTAL.active) portalAsk('herbarium');
    e.preventDefault();
    return;
  }
  if (k === 'c') {
    /* w5r2 — THE WHISTLE: C calls the dog home (W has been the jump since
       round 1, so the first free letter took the job — the Key names it) */
    if (!e.repeat) whistleCall();
    e.preventDefault();
    return;
  }
  if (REDUCED) {
    /* calm variant: discrete step-through, block by block */
    if (k === 'arrowright' || k === 'd') { stepBlock(1); e.preventDefault(); }
    else if (k === 'arrowleft' || k === 'a') { stepBlock(-1); e.preventDefault(); }
    return;
  }
  if (['arrowleft', 'arrowright', 'a', 'd', 's', 'arrowdown', 'shift'].includes(k)) {
    S.keys[k] = true;
    if (k !== 'shift') S.target = null;
    e.preventDefault();
  }
});
window.addEventListener('keyup', (e) => {
  S.keys[e.key.toLowerCase()] = false;
});
window.addEventListener('blur', () => { S.keys = {}; });

function stepBlock(dir) {
  const p = S.page;
  const cur = S.x;
  if (S.atLE) {
    /* the shore has no blocks: west steps back onto the last stretch */
    if (dir < 0) S.x = p.start + p.fracs[p.blocks.length - 1] * p.len + 4;
    needsDraw = true;
    renderStep();
    return;
  }
  const bi = blockIndexAt(p, S.x);
  let ni = bi + dir;
  if (ni < 0) {
    const idx = M.pages.indexOf(p);
    if (idx > 0) {
      const pp = M.pages[idx - 1];
      S.x = pp.start + pp.fracs[pp.blocks.length - 1] * pp.len + 4;
    }
  } else if (ni >= p.blocks.length) {
    const idx = M.pages.indexOf(p);
    if (idx < M.pages.length - 1) S.x = M.pages[idx + 1].start + 4;
    else S.x = M.leView;   /* past the last block waits the shore */
  } else {
    S.x = p.start + p.fracs[ni] * p.len + 4;
  }
  S.x = clamp(S.x, 10, M.worldEnd);
  /* the hold, in calm terms: a hazard between the two blocks stops the
     step at its edge, the prompt shows at once, SPACE crosses instantly */
  const hz = hzBetween(cur, S.x);
  if (hz) holdAt(hz, S.x >= cur ? 1 : -1);
  else if (S.hzBlock) S.hzBlock = null;
  covMark(cur, S.x);   /* a block step is contiguous ground, walked calmly */
  needsDraw = true;
  renderStep();
}

cv.addEventListener('click', (e) => {
  if (S.overlay) return;
  /* the moving star answers a click before the ground does */
  if (PORTAL.starHover && PORTAL.starOn > 0.08 && !PORTAL.active) {
    portalAsk('firstlight');
    return;
  }
  const wx = S.x + (e.clientX - AVX);
  const clamped = clamp(wx, 10, M.worldEnd);
  if (REDUCED) {
    /* the calm walk also honors the hold: a hazard on the way stops it */
    const cur0 = S.x;
    const hz = hzBetween(S.x, clamped);
    if (hz) holdAt(hz, clamped >= S.x ? 1 : -1);
    else S.x = clamped;
    covMark(cur0, S.x);   /* the calm walk covers its ground too */
    needsDraw = true;
    renderStep();
  } else S.target = clamped;
});
cv.addEventListener('pointermove', (e) => {
  PORTAL.mx = e.clientX;
  PORTAL.my = e.clientY;
});

/* ---- the jump, and the hold it answers (wave 3) ---- */
function startJump() {
  if (REDUCED) {
    /* calm variant: the blocked step crosses instantly — no arc, no sound */
    if (S.hzBlock) {
      const b = S.hzBlock;
      b.hz.cd = S.t + 2.5;
      S.hzBlock = null;
      const cur0 = S.x;
      S.x = clamp(b.x + b.face * (HZ_EDGE + 8), 10, M.worldEnd);
      covMark(cur0, S.x);
      needsDraw = true;
      renderStep();
    }
    return;
  }
  if (S.jumpT !== null || S.bounceT !== null) return;
  if (S.hzBlock) { S.jumpCarry = S.hzBlock.face; S.hzBlock = null; }
  S.jumpT = 0;
  audEv('jump', S.x);
}

/* first uncleared hazard strictly between a and b, walking a -> b */
function hzBetween(a, b) {
  const lo = Math.min(a, b) + 2, hi = Math.max(a, b);
  const p0 = pageAt(clamp(lo, 0, M.totalPx - 1)).idx;
  const p1 = pageAt(clamp(hi, 0, M.totalPx - 1)).idx;
  let best = null;
  for (let pi = p0; pi <= p1; pi++) {
    for (const hz of M.pages[pi].hazards) {
      if (hz.x <= lo || hz.x > hi || hz.cd > S.t) continue;
      if (!best ||
          (b >= a ? hz.x < best.x : hz.x > best.x)) best = hz;
    }
  }
  return best;
}
function holdAt(hz, face) {
  S.x = hz.x - face * (HZ_EDGE - 2);
  S.hzBlock = { hz, x: hz.x, kind: hz.kind, face, since: S.t };
}

/* ---------------- landing ---------------- */
const landingEl = document.getElementById('landing');
function fillLanding() {
  document.getElementById('ldStats').innerHTML =
    '<span><b>' + fmt(M.pages.length) + '</b> PAGES</span>' +
    '<span><b>' + fmt(M.totalWords) + '</b> WORDS OF TRAIL</span>' +
    '<span><b>' + fmt(M.communities.length) + '</b> BIOMES</span>' +
    '<span><b>' + fmt(M.authorsTotal) + '</b> FELLOW WALKERS</span>' +
    '<span><b>' + fmt(M.lanternsTotal) + '</b> LANTERNS IN ' + fmt(M.nightPages) + ' NIGHT HOLLOWS</span>' +
    '<span><b>' + fmt(M.hazTotal) + '</b> HAZARDS · <b>' + fmt(M.sprTotal) + '</b> SPRINGS · <b>' +
    fmt(M.terrTotal) + '</b> TERRACES</span>' +
    '<span><b>' + fmt(M.waymarks.length) + '</b> WAYMARKED STONES</span>' +
    '<span><b>' + fmt(M.overlooks) + '</b> OVERLOOKS · <b>1</b> TRAIL DOG</span>' +
    '<span><b>LAND’S END</b> — <b>' + fmt(M.sea.length) + '</b> LIGHTS ON DARK WATER</span>';
}
function dismissLanding() {
  if (S.overlay !== 'landing') return;
  landingEl.classList.add('gone');
  S.overlay = null;
  lsSet('longway.seen', '1');
  needsDraw = true;
  /* first arrival: choose your walker — one keypress skips to silhouette C */
  if (!WALKER.stored && !WALKER.pickShown) {
    WALKER.pickShown = true;
    openWalkerPick();
  }
}
landingEl.addEventListener('click', dismissLanding);

/* ---------------- the hour dial ---------------- */
const dialCv = document.getElementById('dialCv');
const dialLabel = document.getElementById('dialLabel');
function cycleDaySpeed() {
  if (REDUCED) {
    /* held frames: T steps the hour plate by plate, nothing glides */
    const stops = [0.05, 0.32, 0.60, 0.87];
    const cur = stops.findIndex(s => Math.abs(s - DAY.t) < 0.01);
    if ((cur + 1) % stops.length === 0 && cur >= 0) { PACK.days++; queueSave(); }
    DAY.t = stops[(cur + 1) % stops.length];
    tickDay(0);
    renderStep();
    return;
  }
  DAY.speed = (DAY.speed + 1) % DAY_SPEEDS.length;
  drawDial(true);
}
function tickDay(dt) {
  if (!REDUCED) {
    const t0 = DAY.t;
    DAY.t = (DAY.t + dt * DAY_SPEEDS[DAY.speed] / CYCLE_S) % 1;
    if (DAY.t < t0 && DAY_SPEEDS[DAY.speed] > 0) { PACK.days++; queueSave(); }
  }
  /* the sky grades from the continuous hour — no plates, no ticks */
  const w = dayWeights(DAY.t);
  const sig = (Math.round(w.m / DAY_EPS) + ',' + Math.round(w.d / DAY_EPS) + ',' +
               Math.round(w.g / DAY_EPS) + ',' + Math.round(w.n / DAY_EPS));
  if (sig !== DAY.sig) { DAY.sig = sig; DAY.wts = w; }
  /* the dial hand rides the rim at sub-pixel cadence */
  if (sig !== DAY.dialSig || Math.abs(DAY.t - DAY.dialT) > 0.002) {
    DAY.dialSig = sig; DAY.dialT = DAY.t;
    drawDial();
  }
}
function drawDial(force) {
  if (!dialCv) return;
  const g = dialCv.getContext('2d');
  const R = 19, cxx = 20, cyy = 20;
  g.clearRect(0, 0, 40, 40);
  g.fillStyle = INK_DARK;
  g.beginPath(); g.arc(cxx, cyy, R, 0, 7); g.fill();
  g.strokeStyle = INKS.cream; g.lineWidth = 2;
  g.beginPath(); g.arc(cxx, cyy, R - 1, 0, 7); g.stroke();
  const w = DAY.wts;
  if (w.n > 0.5) {
    /* flat moon: cream disc, ink bite */
    g.fillStyle = INKS.cream;
    g.beginPath(); g.arc(cxx, cyy, 6.5, 0, 7); g.fill();
    g.fillStyle = INK_DARK;
    g.beginPath(); g.arc(cxx + 3.4, cyy - 1.6, 5.2, 0, 7); g.fill();
  } else {
    g.fillStyle = w.g > 0.5 ? INKS.rose : w.m > 0.5 ? mix(INKS.cream, INKS.rose, 0.4) : INKS.apricot;
    g.beginPath(); g.arc(cxx, cyy, 6.5, 0, 7); g.fill();
    g.fillStyle = INKS.cream;
    g.beginPath(); g.arc(cxx - 1.4, cyy - 1.2, 4.6, 0, 7); g.fill();
  }
  /* the hour hand: a hard dot riding the rim */
  const a = DAY.t * Math.PI * 2 - Math.PI / 2;
  g.fillStyle = INKS.apricot;
  g.fillRect(cxx + Math.cos(a) * (R - 5) - 2, cyy + Math.sin(a) * (R - 5) - 2, 4, 4);
  if (dialLabel) {
    const name = dayPhaseName(DAY.wts);
    const sp = REDUCED ? 'HELD' : DAY_SPEED_NAMES[DAY.speed];
    const txt = name + ' · ' + sp;
    if (dialLabel.textContent !== txt) dialLabel.textContent = txt;
  }
}
document.getElementById('btnDial').addEventListener('click', cycleDaySpeed);

/* ---------------- collisions: hazards jumped, springs sprung ----------- */
function collideTrail(prevX) {
  if (REDUCED) return;   /* the calm variant holds in stepBlock instead */
  let airY = 0;
  if (S.jumpT !== null) airY = Math.sin(Math.PI * S.jumpT) * 54;
  if (S.bounceT !== null) airY = Math.sin(Math.PI * S.bounceT) * 78;
  /* an active hold keeps her at the barrier's edge while she is grounded
     and pressing into it — no creep, no jitter, just held */
  if (S.hzBlock && airY <= 20) {
    const b = S.hzBlock;
    const gap = (b.x - S.x) * b.face;
    if (gap > 0 && gap < HZ_EDGE) S.x = b.x - b.face * HZ_EDGE;
  }
  const lo = Math.min(prevX, S.x), hi = Math.max(prevX, S.x);
  if (hi - lo < 0.01 && S.bounceT === null) return;
  const p0 = pageAt(clamp(lo - 20, 0, M.totalPx - 1)).idx;
  const p1 = pageAt(clamp(hi + 20, 0, M.totalPx - 1)).idx;
  const now = S.t;
  for (let pi = p0; pi <= p1; pi++) {
    const p = M.pages[pi];
    for (const hz of p.hazards) {
      if (hz.x < lo - 14 || hz.x > hi + 14 || hz.cd > now) continue;
      if (airY > 20) { hz.cd = now + 1.5; continue; }   /* cleared clean */
      /* THE HOLD (wave 3, owner order): the barrier does not let you walk
         through. You are held at its edge, leaning over the drop, until
         you jump it — the sign says so after a beat of being blocked. */
      const bdir = S.x >= prevX ? 1 : -1;
      S.x = hz.x - bdir * HZ_EDGE;
      if (!S.hzBlock || S.hzBlock.hz !== hz) {
        S.hzBlock = { hz, x: hz.x, kind: hz.kind, face: bdir, since: now };
        audEv('blocked', hz.x);          /* one soft bump per hold */
      }
    }
    if (S.bounceT === null && S.stumbleT === null) {
      for (const sp of p.springs) {
        if (sp.x < lo - 15 || sp.x > hi + 15 || sp.cd > now || airY > 20) continue;
        sp.cd = now + 1.6;
        S.bounceT = 0;
        S.bounceX = sp.x;
        S.jumpT = null;
        audEv('spring', sp.x);
      }
    }
  }
}

/* ---------------- main loop ---------------- */
let lastT = 0;
function frame(now) {
  const t0 = performance.now();
  const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016);
  lastT = now;
  S.t += dt;

  if (!S.overlay || S.overlay === 'index' || S.overlay === 'gatemap' ||
      S.overlay === 'terrace' || S.overlay === 'key') {
    tickDay(dt);

    /* airborne / stumble clocks — flat arcs, hard landings */
    if (S.jumpT !== null) { S.jumpT += dt / JUMP_DUR; if (S.jumpT >= 1) { S.jumpT = null; S.jumpCarry = 0; audEv('land', S.x); } }
    if (S.bounceT !== null) { S.bounceT += dt / BOUNCE_DUR; if (S.bounceT >= 1) { S.bounceT = null; audEv('land', S.x, 0.7); } }
    if (S.stumbleT !== null) { S.stumbleT += dt / STUMBLE_DUR; if (S.stumbleT >= 1) S.stumbleT = null; }
    if (S.puff && S.puff.t < 1) S.puff.t += dt / 0.4;

    /* the scenic sweep from an overlook rides its own eased curve */
    if (S.sweep) {
      S.sweep.t += dt / S.sweep.dur;
      const k = smoothT(clamp(S.sweep.t, 0, 1));
      S.x = lerp(S.sweep.from, S.sweep.to, k);
      S.face = S.sweep.to >= S.sweep.from ? 1 : -1;
      S.vx = 0;
      syncPage();
      if (S.sweep.t >= 1) {
        const to = S.sweep.to;
        S.sweep = null;
        teleport(to);
        suppressHash = true;
        location.hash = '#' + S.page.slug;
      }
    } else {
    /* movement */
    let dir = 0;
    if (!S.overlay) {
      if (S.keys['arrowleft'] || S.keys['a']) dir -= 1;
      if (S.keys['arrowright'] || S.keys['d']) dir += 1;
    }
    const stumbling = S.stumbleT !== null;
    const spd = (S.keys['shift'] ? STRIDE_V : WALK_V) * (stumbling ? 0.25 : 1);
    if (dir !== 0) {
      S.vx = dir * spd;
      S.face = dir;
    } else if (S.target != null) {
      const d = S.target - S.x;
      if (Math.abs(d) < 6) { S.target = null; S.vx = 0; }
      else { S.vx = clamp(d * 3, -spd, spd); S.face = d >= 0 ? 1 : -1; }
    } else {
      S.vx = 0;
    }
    /* THE RELIEF IS FELT: climbing slows her a touch and descending
       quickens her — a feel, never a mechanic (jump and bounce keep
       their own arcs, and reduced motion keeps a perfectly even pace) */
    if (!REDUCED && S.vx !== 0 && S.jumpT === null && S.bounceT === null) {
      const gs = (elevAt(S.x + 30) - elevAt(S.x - 30)) / 60;
      S.vx *= clamp(1 - gs * Math.sign(S.vx) * 0.55, 0.90, 1.08);
    }
    const prevX = S.x;
    let nx = S.x + S.vx * dt;
    if (S.bounceT !== null) {
      /* the spring's gift: a joyful arc, a few honest metres forward */
      nx += S.face * 165 * dt * (1 - 0.35 * S.bounceT);
    }
    if (S.jumpT !== null && S.jumpCarry) {
      /* the blocked jump is a jump FORWARD, over the obstacle */
      nx += S.jumpCarry * JUMP_CARRY_V * dt * (1 - 0.30 * S.jumpT);
    }
    if (nx !== S.x) {
      const before = wordsAt(S.x);
      S.x = clamp(nx, 10, M.worldEnd);
      const dw = Math.abs(wordsAt(S.x) - before);
      S.walkedWords += dw;
      PACK.walked += dw;
      covMark(prevX, S.x);   /* ground covered on foot, and only on foot */
      syncPage();
    }
    collideTrail(prevX);
    /* the hold lets go when you leave it: a jump, a spring, walking away —
       or drifting off to sleep beside it (the sign does not nag a sleeper) */
    if (S.hzBlock && (S.bounceT !== null || SLP.stage > 0 ||
        Math.abs(S.hzBlock.x - S.x) > HZ_EDGE + 34)) S.hzBlock = null;
    }
    /* a portal beat, once begun, carries you across */
    if (PORTAL.active && !PORTAL.active.gone) {
      PORTAL.active.t += dt / PORTAL.active.dur;
      if (PORTAL.active.t >= 1) {
        PORTAL.active.gone = true;
        PORTAL.navigate('../' + PORTAL.active.key + '/');
      }
    }
    S.idleT = (Math.abs(S.vx) < 1 && !S.overlay && S.target == null && !S.sweep) ? S.idleT + dt : 0;
    tickWeather(dt);
    tickSleep(dt);
    checkGuide();
    if (S.front < 1) S.front = Math.min(1, S.front + dt / FRONT_DUR);

    draw(dt);
    updateHUD();
    audioTick(dt);
  }

  const ms = performance.now() - t0;
  noteFrame(ms, S.overlay || (Math.abs(S.vx) > 1 ? 'walking' : 'idle'));
  requestAnimationFrame(frame);
}

/* reduced-motion: render on demand only, time steps discretely */
function renderStep() {
  const t0 = performance.now();
  S.t += 0.5;   /* held frames: the clock steps when you do */
  syncPage();
  tickWeather(0.5);   /* the calm sky steps with you; the stages are held */
  checkGuide();
  draw(0);
  updateHUD();
  audioTick(0.4);
  noteFrame(performance.now() - t0, 'reduced-step');
}

/* ---------------- boot ---------------- */
async function boot() {
  const [content, graph, communities, provenance, trailOrder] = await Promise.all([
    fetch('content.json').then(r => r.json()),
    fetch('graph.json').then(r => r.json()),
    fetch('communities.json').then(r => r.json()),
    fetch('provenance.json').then(r => r.json()),
    /* THE TRAIL WALKS THE SIDEBAR: the ready-made walking order (287 slugs) */
    fetch('trail-order.json').then(r => (r.ok ? r.json() : null)).catch(() => null)
  ]);
  buildModel(content, graph, communities, provenance, trailOrder);
  buildWeather();          /* the real calendar, before the first frame */
  covInit();               /* the ground already walked, before the first step */
  resize();
  makeGrain();
  fillLanding();
  fillKey();
  tickDay(0);

  const slug = location.hash.slice(1);
  if (slug === 'lands-end') {
    landingEl.classList.add('gone');
    teleport(M.leView);
  } else if (slug && M.bySlug.has(slug)) {
    landingEl.classList.add('gone');
    teleport(M.bySlug.get(slug).start + 6);
  } else {
    S.overlay = 'landing';
    /* QUICK START FIRST: the walk opens at the Quick Start Guide's gate */
    const qp = M.bySlug.get(M.qsSlug);
    teleport(qp ? qp.start + 6 : 12);
  }

  refreshDogUI();
  refreshLayoutUI();
  /* now the corpus exists, the walk's share of it can be read for real */
  if (window.__scoreReady) scoreUpdate(false);

  window.__lw = {
    M, S, DAY, ambientCD, bubbleCD, bubbleFacts, terrainFor, LBL, lblBox,
    PACK, GUIDE, WALKER, DOG, REGBOOK, SPECIES,
    certDataURL(which) { return certCanvas(which).toDataURL('image/png'); },
    markVisited(slugs) { for (const sl of slugs) PACK.visited[sl] = 1; queueSave(); },
    openRegister(slug) { const p2 = slug ? M.bySlug.get(slug) : S.page; if (p2) openRegister(p2); },
    openTicket(slug) { const p2 = slug ? M.bySlug.get(slug) : S.page; if (p2) openTicket(p2); },
    openLook(slug) { const p2 = slug ? M.bySlug.get(slug) : S.page; if (p2 && p2.overlook) openLook(p2); },
    openPack, openGuide, openWalkerPick, sweepTo, toggleDog, whistleCall,
    AUD, MUS, WX, SLP, LAY,
    setLayout, toggleLayout, wxLabel, wakeWalker, buildWeather,
    landsEnd(instant) { travelToLE(instant !== false); },
    ticketEditUrl, ticketIssueUrl, unlockSpecies,
    setX(x) { teleport(x); if (REDUCED) renderStep(); },
    /* the frame's own geometry, so a probe can sample the drawing where the
       drawing actually is rather than at a fraction guessed from outside */
    geom() {
      return { W, H, visH, horizonY, groundY, AVX, sunSX: SUN_SX, sunA: SUN_A,
        cliffSX: w2s(M.leCliff), benchSX: w2s(M.leBench) };
    },
    goto(s) { const p = M.bySlug.get(s); if (p) { teleport(p.start + 6); if (REDUCED) renderStep(); } },
    setHour(t) { DAY.t = ((t % 1) + 1) % 1; DAY.sig = ''; DAY.dialSig = ''; DAY.dialT = -9; tickDay(0); needsDraw = true; if (REDUCED) renderStep(); },
    daySpeed(i) { DAY.speed = clamp(i | 0, 0, DAY_SPEEDS.length - 1); },
    elevAt, gYAt,
    meet(slug) {
      /* stand the player beside the first walker of a stretch (QA helper) */
      const p = slug ? M.bySlug.get(slug) : S.page;
      if (!p) return false;
      const T = terrainFor(p.idx);
      if (!T.walkers.length) return false;
      const wk = T.walkers[0];
      const tw = S.t - (wk.tPause || 0);
      const span = p.len;
      const wx = REDUCED ? wk.x0 :
        p.start + ((((wk.x0 - p.start) - (tw * wk.speed + wk.phase)) % span) + span) % span;
      S.bubble = null;
      S.bubble = null;
      bubbleCD.clear();
      S.bubbleGapT = -1;
      teleport(clamp(wx - 60, 10, M.totalPx - 10));
      if (REDUCED) renderStep();
      return true;
    }
  };

  if (REDUCED) {
    renderStep();
    window.__diag.state = 'reduced-ready';
  } else {
    requestAnimationFrame((t) => { lastT = t; requestAnimationFrame(frame); });
  }
}

boot().catch(err => {
  console.error(err);
  document.body.insertAdjacentHTML('beforeend',
    '<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#1C0F2E;color:#FFF3E0;font-family:Georgia,serif;z-index:99">The trail data could not be loaded. Serve this folder over HTTP and try again.</div>');
});

/* ==================================================================== */
/* ROUND 5 — LAND'S END, AND THE SOUND OF THE TRAIL                      */
/* Two independent layers: SFX (bundled CC0 recordings, see              */
/* sfx/CREDITS.txt) and MUSIC (a live music-box voice + one credited     */
/* recorded theme, see music/CREDITS.txt). Music is weather: it arrives  */
/* at moments — golden hour, an overlook, a biome border, nightfall —    */
/* and withdraws to true silence. Land's End is the shore past the end   */
/* cairn: the whole documentation as a night coastline of 290 lights,    */
/* each blinking a rhythm derived from its own page's numbers.           */
/* ==================================================================== */

/* ---------------- Land's End: the model ---------------- */
const LE_HEAD = 1150;   /* walkable headland past the end cairn, in px */
const LE_COAST = 2300;  /* how far the lit coastline recedes east      */

function buildLandsEnd() {
  M.leStart = M.totalPx;
  M.leCliff = M.totalPx + LE_HEAD;   /* here the ground falls away      */
  M.leBench = M.leCliff - 150;       /* the bench, back from the brink  */
  M.leView = M.leCliff - 60;         /* where you stand to see it whole */
  M.worldEnd = M.leCliff - 26;       /* the brink itself, and no further*/
  const lightInks = [INKS.cream, INKS.apricot, INKS.rose, mix(INKS.cream, INKS.rose, 0.5)];
  M.leLights = M.sea.map((p, i) => {
    const u = M.sea.length > 1 ? i / (M.sea.length - 1) : 0;
    /* the shore curves in and out of bays; each page keeps its own place
       along it, west to east, in the order the trail was walked */
    const dep = clamp(0.20 + 0.62 * (0.5 + 0.5 * Math.sin(u * 6.1 + 0.7)) +
                      0.14 * Math.sin(u * 23.3), 0.05, 0.97);
    return {
      u, dep,
      per: 1.6 + (p.words % 97) / 97 * 3.6,        /* rhythm from its length     */
      ph: (p.commits % 16) / 16,                   /* offset from its commits    */
      b: 0.34 + 0.66 * Math.log(1 + p.inC) / Math.log(1 + M.maxIn),
      ink: p.comm >= 0 ? lightInks[p.comm % lightInks.length] : mix(INKS.cream, INKS.violet, 0.4),
      big: p.inC >= M.sniffMin
    };
  });
}

function travelToLE(instant) {
  const go = () => {
    teleport(M.leView);
    suppressHash = true;
    location.hash = '#lands-end';
    if (REDUCED) renderStep();
  };
  if (REDUCED || instant) { go(); return; }
  wipeEl.hidden = false;
  wipeEl.style.transformOrigin = 'left center';
  const a1 = wipeEl.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 170, easing: 'steps(6)', fill: 'forwards' });
  a1.onfinish = () => {
    go();
    wipeEl.style.transformOrigin = 'right center';
    const a2 = wipeEl.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 200, easing: 'steps(6)', fill: 'forwards' });
    a2.onfinish = () => { wipeEl.hidden = true; };
  };
}

function renderLEDock() {
  document.getElementById('dockTitle').textContent = 'LAND’S END';
  const chip = document.getElementById('blockchip');
  chip.textContent = fmt(M.sea.length) + ' LIGHTS BELOW';
  dockContent.innerHTML =
    '<h1>Land’s End</h1>' +
    '<p>The trail does not stop at a wall. Past the end cairn the ground falls away to a shore, ' +
    'and the whole documentation lies below as a night coastline on dark water: <b>' +
    fmt(M.sea.length) + ' lights, one for every page</b>' +
    (M.sea.length > M.pages.length
      ? ' — ' + fmt(M.sea.length - M.pages.length) +
        ' of them belonging to pages the walk itself passes by; the sea keeps the whole documentation all the same.</p>'
      : '.</p>') +
    '<p>Every light keeps its own page’s time — its length sets the rhythm of the blink, its commits ' +
    'set the offset, its citations set the brightness. Nothing down there is invented.</p>' +
    '<p><em>The sea this trail was walking toward — a parting gift from the archived Working Sea.</em></p>' +
    '<p>A bench. The cliff. The lights. Silence. Walk west when you are ready to return.</p>';
  dockScroll.scrollTop = 0;
}

/* the shore, drawn in the trail's own idiom: flat inks, hard facets.
   You stand at the brink and the whole documentation lies below as a night
   coastline: 290 lights on dark water, each keeping its own page's time. */
function drawLandsEnd(pal, wN) {
  if (S.x + (W - AVX) + 80 <= M.totalPx) return;
  const gy = gYAt(M.totalPx - 1);
  const cliffSX = w2s(M.leCliff);
  if (cliffSX > W + 40) { drawHeadland(gy, cliffSX, pal); return; }
  const seaTop = horizonY;                        /* the far water horizon */
  const yNear = visH - 22;
  const water = mix('#0D0718', INKS.violet, 0.13);
  const sx0 = Math.max(cliffSX, -40);
  const sw = W + 60 - sx0, sh = visH - seaTop;

  /* The sea is night water at every hour — that is the whole point of the
     vista, and the lights need the dark. But the band where it meets the sky
     used to stay pitch dark under a lit sunset ridge, so the shore read as a
     panel pasted below the land. Now the far water and a strip of shore haze
     take the hour's own ink, in the same flat steps: four hard bands, never a
     gradient. At night all three terms fall to zero and the sea is exactly
     the sea of round 7. */
  const lit = clamp(DAY.wts.m * 0.55 + DAY.wts.d * 0.90 + DAY.wts.g * 0.72, 0, 1);
  const skyInk = mix(mix(DAWN_TINT, DAYLIGHT_TINT, DAY.wts.d), INKS.apricot, DAY.wts.g * 0.62);
  const hazeH = sh * 0.055;
  cx.fillStyle = mix(water, skyInk, 0.34 * lit);
  cx.fillRect(sx0, seaTop, sw, sh * 0.44);
  cx.fillStyle = mix(water, '#000000', 0.34 * (1 - 0.18 * lit));
  cx.fillRect(sx0, seaTop + sh * 0.44, sw, sh * 0.34);
  cx.fillStyle = mix(water, '#000000', 0.62 * (1 - 0.10 * lit));
  cx.fillRect(sx0, seaTop + sh * 0.78, sw, sh * 0.22 + 8);
  /* the shore haze: the one band that carries the hour onto the water */
  if (lit > 0.004) {
    cx.fillStyle = mix(water, skyInk, 0.68 * lit);
    cx.fillRect(sx0, seaTop + 1.6, sw, hazeH);
  }
  /* THE GLITTER (round 12). The sea kept its night ink through golden hour,
     which the verifier called almost-intentional and was right to: this
     water has to stay dark or the 290 lights have nothing to be lit against.
     So the hour does not wash it — it strikes it. A low sun on water, drawn
     the way this build draws a gust, is a short stack of HARD HORIZONTAL
     BARS in the sky's own ink, widest near the horizon and shorter as they
     come toward you, and gone by nightfall. The first cut of this was a
     three-step wedge and it printed as a pale panel over the water: a
     rectangle the eye read as interface, not as light. */
  if (lit > 0.05 && SUN_A > 0.05 && SUN_SX > sx0 + 24) {
    const pathX = clamp(SUN_SX, sx0 + 30, W - 24);   /* under the sun itself */
    const bars = 7;
    for (let i = 0; i < bars; i++) {
      const f = i / (bars - 1);
      const y = seaTop + sh * (0.075 + f * 0.60);
      const halfW = sw * (0.075 - 0.055 * f) * (0.55 + 0.45 * Math.abs(Math.sin(i * 2.1 + 1.1)));
      const th = Math.max(1.4, sh * (0.016 - 0.008 * f));
      cx.fillStyle = mix(water, skyInk, (0.78 - 0.34 * f) * lit * (0.45 + 0.55 * SUN_A));
      cx.fillRect(Math.max(sx0, pathX - halfW), y, Math.min(sw, halfW * 2), th);
    }
  }
  /* the horizon's own hard line */
  cx.fillStyle = mix(mix(INKS.cream, INKS.violet, 0.42), skyInk, 0.45 * lit);
  cx.fillRect(sx0, seaTop, sw, 1.6);

  /* the coastline of lights — one per page, blinking its own numbers */
  if (M.leLights) {
    const span = Math.max(240, W + 34 - (cliffSX + 26));
    const px = (lt) => cliffSX + 26 + lt.u * span * (0.52 + 0.48 * (1 - lt.dep));
    const py = (lt) => seaTop + 7 + (1 - lt.dep) * (yNear - seaTop - 7);
    /* the shore itself: one hard line joining every page, west to east */
    cx.strokeStyle = mix(water, INKS.cream, 0.22);
    cx.lineWidth = 1.2;
    cx.globalAlpha = 0.55;
    cx.beginPath();
    for (let i = 0; i < M.leLights.length; i++) {
      const lt = M.leLights[i];
      const x = px(lt), y = py(lt) + 1.5;
      if (i === 0) cx.moveTo(x, y); else cx.lineTo(x, y);
    }
    cx.stroke();
    cx.globalAlpha = 1;
    for (let i = 0; i < M.leLights.length; i++) {
      const lt = M.leLights[i];
      /* far lights crowd toward the vanishing point; near ones spread out */
      const sx = px(lt);
      if (sx < cliffSX + 8 || sx > W + 20) continue;
      const sy = py(lt);
      let a;
      if (REDUCED) a = lt.b;                              /* calm: steady lights */
      else {
        const ph = ((S.t / lt.per) + lt.ph) % 1;
        const k = smoothT(clamp(ph / 0.10, 0, 1)) * (1 - smoothT(clamp((ph - 0.5) / 0.12, 0, 1)));
        a = lt.b * (0.34 + 0.66 * k);
      }
      if (a < 0.03) continue;
      const sz = (lt.big ? 2.8 : 2.0) * (0.62 + 0.55 * (1 - lt.dep));
      cx.globalAlpha = a;
      cx.fillStyle = lt.ink;
      cx.fillRect(sx - sz / 2, sy - sz / 2, sz, sz);
      /* the still water holds each light once, flat and offset */
      cx.globalAlpha = a * 0.24;
      cx.fillRect(sx - sz / 2, sy + sz + 1.5, sz, Math.max(1, sz * 0.8));
      cx.globalAlpha = 1;
    }
  }

  /* a sloop of engraved ink stands off the point — hail her and she will
     carry you to CARTA STRAPIANA. She rides the swell; the calm sea holds
     her still. */
  {
    const bob = REDUCED ? 0 : Math.sin(S.t * 0.9) * 1.6;
    const bx = cliffSX + 214, by = seaTop + sh * 0.30 + bob;
    if (bx > -60 && bx < W + 60) {
      const hullInk = mix('#0D0718', INKS.violet, 0.5);
      drawPoly([[bx - 26, by], [bx + 26, by], [bx + 17, by + 9], [bx - 16, by + 9]], hullInk);
      cx.strokeStyle = mix(INKS.cream, INKS.violet, 0.3);
      cx.lineWidth = 1.2;
      cx.strokeRect(bx - 26, by, 52, 0.1);   /* the gunwale's engraved line */
      cx.beginPath(); cx.moveTo(bx + 2, by); cx.lineTo(bx + 2, by - 34); cx.stroke();
      /* gaff main and jib, cut flat from cream */
      cx.globalAlpha = 0.92;
      drawPoly([[bx + 4, by - 32], [bx + 4, by - 4], [bx + 25, by - 8]], INKS.cream);
      cx.globalAlpha = 0.72;
      drawPoly([[bx - 1, by - 29], [bx - 1, by - 5], [bx - 19, by - 7]], INKS.cream);
      cx.globalAlpha = 1;
      /* two engraved hatch lines on the main */
      cx.strokeStyle = INKS.violet; cx.lineWidth = 0.8; cx.globalAlpha = 0.6;
      cx.beginPath(); cx.moveTo(bx + 7, by - 24); cx.lineTo(bx + 18, by - 11); cx.stroke();
      cx.beginPath(); cx.moveTo(bx + 6, by - 17); cx.lineTo(bx + 14, by - 9); cx.stroke();
      cx.globalAlpha = 1;
      /* the masthead lantern, patient */
      cx.fillStyle = INKS.apricot;
      cx.globalAlpha = REDUCED ? 0.8 : 0.45 + 0.45 * (0.5 + 0.5 * Math.sin(S.t * 1.7));
      cx.fillRect(bx + 1, by - 37, 2.4, 2.4);
      cx.globalAlpha = 1;
    }
    /* and far out on the same water, the sea turns to living cartoon ink —
       three hard swirls that never quite settle (bythedeep) */
    const ix = Math.min(W - 110, cliffSX + sw * 0.80), iy = seaTop + sh * 0.14;
    if (ix > cliffSX + 90 && ix > -40) {
      cx.lineWidth = 1.6;
      for (let sw2 = 0; sw2 < 3; sw2++) {
        const ph = REDUCED ? sw2 * 2.1 : S.t * (0.55 + sw2 * 0.2) + sw2 * 2.1;
        const rr = 5 + sw2 * 4 + (REDUCED ? 0 : Math.sin(ph * 0.7) * 1.5);
        cx.strokeStyle = sw2 === 1 ? INKS.violet : INKS.cream;
        cx.globalAlpha = 0.5 - sw2 * 0.09;
        cx.beginPath();
        cx.arc(ix + sw2 * 9 - 9, iy + (sw2 % 2) * 3, rr, ph % 6.28, (ph % 6.28) + 4.4);
        cx.stroke();
      }
      /* a few flicked ink drops */
      cx.fillStyle = INKS.cream;
      cx.globalAlpha = 0.55;
      const dph = REDUCED ? 0 : Math.floor(S.t * 2) % 3;
      cx.fillRect(ix - 16 + dph * 3, iy - 9, 1.6, 1.6);
      cx.fillRect(ix + 14 - dph * 2, iy - 6 + dph, 1.6, 1.6);
      cx.globalAlpha = 1;
    }
  }

  drawHeadland(gy, cliffSX, pal);
}

/* the last of the land: bare ground to the brink, then a faceted face */
function drawHeadland(gy, cliffSX, pal) {
  const headX0 = Math.max(w2s(M.totalPx - 4), -80);
  const hx1 = Math.min(cliffSX, W + 80);
  if (headX0 > W + 80) return;
  const ground = gradeColor(mix(INKS.aubergine, INKS.violet, 0.22), DAY.wts);
  /* rose registration underlay — the riso plate slips at the brink */
  cx.globalAlpha = 0.34;
  cx.fillStyle = INKS.rose;
  cx.fillRect(headX0 + 2.5, gy + 1.5, Math.max(0, hx1 - headX0), visH - gy + 8);
  cx.globalAlpha = 1;
  cx.fillStyle = ground;
  cx.beginPath();
  cx.moveTo(headX0, gy);
  cx.lineTo(hx1, gy);
  if (cliffSX < W + 80) {
    cx.lineTo(cliffSX + 16, gy + (visH - gy) * 0.34);
    cx.lineTo(cliffSX - 9, gy + (visH - gy) * 0.66);
    cx.lineTo(cliffSX + 7, visH + 10);
  } else cx.lineTo(hx1, visH + 10);
  cx.lineTo(headX0, visH + 10);
  cx.closePath(); cx.fill();
  cx.fillStyle = mix(ground, INKS.cream, 0.16);
  cx.fillRect(headX0, gy, Math.max(0, hx1 - headX0), 2.5);

  /* THE LIT EDGE (round 12). Land and water met at a bare vertical seam,
     and at golden hour the sky above it was lit while the join was not — the
     one edge on the trail that did not know what hour it was. A headland at
     that hour catches the light down its seaward facets, so the facets get
     the sky's own ink as a hard keyline: no gradient, no glow, just the
     plate that catches the sun printed one step brighter. Zero at night. */
  const edgeLit = clamp(DAY.wts.m * 0.55 + DAY.wts.d * 0.90 + DAY.wts.g * 0.72, 0, 1);
  if (cliffSX < W + 80 && edgeLit > 0.05) {
    const eInk = mix(mix(DAWN_TINT, DAYLIGHT_TINT, DAY.wts.d), INKS.apricot, DAY.wts.g * 0.62);
    cx.save();
    cx.strokeStyle = mix(ground, eInk, 0.55 * edgeLit);
    cx.lineWidth = 2.2;
    cx.lineJoin = 'miter';
    cx.beginPath();
    cx.moveTo(hx1, gy);
    cx.lineTo(cliffSX + 16, gy + (visH - gy) * 0.34);
    cx.lineTo(cliffSX - 9, gy + (visH - gy) * 0.66);
    cx.lineTo(cliffSX + 7, visH + 10);
    cx.stroke();
    /* and the brink itself, where the ground stops: one bright step */
    cx.fillStyle = mix(ground, eInk, 0.72 * edgeLit);
    cx.fillRect(Math.max(headX0, hx1 - 26), gy, Math.min(26, Math.max(0, hx1 - headX0)), 2.5);
    cx.restore();
  }

  /* the bench, kept in perfect repair — someone still comes here.
     A cream backlight rim, as the walker has, so ink reads on dark ground */
  const leBench = { x: M.leBench, tilt: 0, broken: false, q: 1 };
  drawBench(leBench, { ink: 'rgba(255,243,224,0.75)' });
  cx.save(); cx.translate(-2.4, -1.6);
  drawBench(leBench, pal);
  cx.restore();

  /* the plaque, and the caption the archive asked for */
  const bsx = w2s(M.leBench);
  if (bsx > -300 && bsx < W + 300) {
    label('LAND’S END', bsx, gy - 132, 16, INKS.cream, 'center', 0.34);
    label('THE SEA THIS TRAIL WAS WALKING TOWARD', bsx, gy - 112, 8.5,
      mix(INKS.cream, INKS.apricot, 0.5), 'center', 0.3);
    label(fmt(M.sea.length) + ' LIGHTS — ONE FOR EVERY PAGE, EACH ' +
      (REDUCED ? 'HOLDING' : 'BLINKING') + ' ITS OWN NUMBERS',
      bsx, gy - 98, 7.5, 'rgba(255,243,224,0.70)', 'center', 0.24);
    label('A PARTING GIFT FROM THE ARCHIVED WORKING SEA', bsx, gy - 86, 7,
      'rgba(255,243,224,0.48)', 'center', 0.24);
  }
}

/* ==================================================================== */
/* THE WAYS OFF THE TRAIL (wave 3) — six crossings, each discovered      */
/* (the picnic-table crossing is gone by owner order: the Kit left the    */
/* mains — no trace of that crossing may remain)                          */
/* where the geography puts it, never a menu. Approaching or hovering    */
/* shows one hint line; activating plays a short in-fiction beat, then   */
/* the trail hands you to the sibling at ../KEY/. Reduced motion         */
/* crosses instantly. Zero cost while an egg is off-screen.              */
/* ==================================================================== */
const PORTAL = {
  active: null,                /* {key, t, dur, gone} while a beat plays */
  seen: {},                    /* key -> times taken this visit */
  mx: -9e9, my: -9e9,          /* last pointer position on the canvas */
  starHover: false, starSX: -1, starSY: -1, starOn: 0,
  navigate(url) { location.href = url; }   /* probes may stub this */
};
const PORTAL_DUR = { herbarium: 1.5, cartastrapiana: 1.4, bythedeep: 1.4 };
const PORTAL_LINES = {
  pixelcity: 'DOWN THE SWITCHBACKS — A DAY’S WALK TO THE CITY OF PIXELS',
  cartastrapiana: 'SHE ANSWERS THE HAIL — COMING ABOUT FOR THE POINT',
  bythedeep: 'YOU PUT OUT FOR THE LIVING INK',
  firstlight: 'THE MOVING STAR LEADS OFF THE CHART',
  herbarium: 'PRESSED FLAT — A FLOWER FOR THE HERBARIUM',
  secreta: 'THE RACK SPINS — ONE COMIC SLIDES FREE'
};
/* THE PORTAL CONFIRM (owner's lab law): every way off the trail asks
   before it takes you. The carved notice names where the crossing leads;
   YES and NO are mouse-clickable and Tab-focusable, Y confirms, N or
   Escape stays, Enter chooses the focused control. Never window.confirm. */
const PORTAL_ASK = {
  pixelcity: 'DOWN THE SWITCHBACKS TO THE CITY OF PIXELS',
  cartastrapiana: 'ABOARD THE SLOOP STANDING OFF THE POINT',
  bythedeep: 'OUT TO THE LIVING INK, FAR ON THE WATER',
  firstlight: 'AFTER THE MOVING STAR, OFF THE CHART',
  herbarium: 'INTO THE PRESSED PAGES OF THE HERBARIUM',
  secreta: 'INTO THE COMIC ON THE SPINNER RACK'
};
const paEl = document.getElementById('portalask');
const paLine = document.getElementById('paLine');
const paYes = document.getElementById('paYes');
const paNo = document.getElementById('paNo');
const PA = { key: null };
function portalAsk(key) {
  if (PORTAL.active || S.overlay === 'portalask') return;
  closeOverlays();
  PA.key = key;
  paLine.textContent = PORTAL_ASK[key] || key.toUpperCase();
  paEl.hidden = false;
  S.overlay = 'portalask';
  S.target = null; S.keys = {};
  try { paYes.focus(); } catch (e) { }
  needsDraw = true;
  if (REDUCED) renderStep();
}
function portalYes() { const k = PA.key; PA.key = null; closeOverlays(); if (k) portalGo(k); }
function portalNo() {
  /* cancelling returns the walker cleanly to the trail: nothing moved */
  PA.key = null;
  closeOverlays();
  try { if (document.activeElement) document.activeElement.blur(); } catch (e) { }
}
paYes.addEventListener('click', portalYes);
paNo.addEventListener('click', portalNo);
function portalGo(key) {
  if (PORTAL.active) return;
  PORTAL.seen[key] = (PORTAL.seen[key] || 0) + 1;
  if (REDUCED) { PORTAL.navigate('../' + key + '/'); return; }
  PORTAL.active = { key, t: 0, dur: PORTAL_DUR[key] || 1.15, gone: false };
  audEv('portal', S.x);
}
function buildPortals() {
  /* THE KIOSK, PLACED DEEP (owner order — he met it ten steps in and
     laughed): the kiosk stands around the twentieth page, at a natural
     village stop — among pages 18-25 the stretch that set the most
     picnic tables wins (a green with tables is a village stop if
     anything on this trail is), ties going to the page nearest the
     twentieth. On that stretch the kiosk takes the middle of the widest
     gap the spread furniture left, so the ten-step law keeps its breath
     on both sides. Derived from the corpus, never pinned to a slug. */
  const kLo = Math.min(KIOSK_PAGE_LO, M.pages.length - 1);
  const kHi = Math.min(KIOSK_PAGE_HI, M.pages.length - 1);
  let kBest = null;
  for (let ki = kLo; ki <= kHi; ki++) {
    const kp = M.pages[ki];
    const picnics = kp.furn.filter(f => f.kind === 'picnic').length;
    const score = (picnics > 0 ? 1000 : 0) - Math.abs(ki - 20);
    if (!kBest || score > kBest.score) kBest = { ki, kp, score };
  }
  const vp = kBest.kp;
  const kxs = [vp.signX, vp.regX];
  for (const g of vp.gates || []) kxs.push(g.x);
  for (const t2 of vp.terraces) kxs.push(t2.x);
  for (const f2 of vp.furn) kxs.push(f2.x);
  for (const hz of vp.hazards) kxs.push(hz.x);
  for (const sp2 of vp.springs || []) kxs.push(sp2.x);
  if (vp.overlook) kxs.push(vp.overlook.x);
  const eLo = vp.start + 140, eHi = vp.start + vp.len - 140;
  kxs.sort((a, b) => a - b);
  let gA = eLo, gB = eLo, kPrev = eLo;
  for (const x2 of kxs.concat([eHi])) {
    const cxx = clamp(x2, eLo, eHi);
    if (cxx - kPrev > gB - gA) { gA = kPrev; gB = cxx; }
    if (cxx > kPrev) kPrev = cxx;
  }
  M.kioskPage = kBest.ki;
  M.kioskX = (gA + gB) / 2;
  /* QUICK START FIRST (owner's lab law): the walk begins at the Quick
     Start Guide stretch — found by its own title, never hardcoded */
  let qs = null;
  for (const p of M.pages) {
    if (/quick[\s-]?start/i.test(p.label || p.slug)) { qs = p; break; }
  }
  M.qsSlug = qs ? qs.slug : M.pages[0].slug;
}

/* pixel city lights glitter in the valley below a night overlook */
function drawPixelCity(p, pal, wN) {
  const o = p.overlook;
  const nk = clamp((wN - 0.45) / 0.30, 0, 1);
  if (nk <= 0.01) return;
  const sgx = w2s(o.x + 96);
  if (sgx < -220 || sgx > W + 220) return;
  const gy = gYAt(o.x + 96);
  /* the valley: a grid-town of far pixels, each keeping its own time */
  const r = rngFor('pixelcity:' + p.slug);
  const y0 = horizonY + (gy - horizonY) * 0.26;
  for (let i = 0; i < 44; i++) {
    const px = sgx - 40 + r() * 190;
    const py = y0 + r() * 24 - 6;
    const cc = r();
    const rate = 1.1 + r() * 2.2;
    const a = REDUCED ? 0.7 :
      (Math.sin(S.t * rate + i * 2.7) > 0.25 ? 0.9 : 0.28);
    cx.globalAlpha = nk * a * 0.8;
    cx.fillStyle = cc < 0.5 ? INKS.cream : (cc < 0.8 ? INKS.apricot : INKS.rose);
    cx.fillRect(px, py, 1.6, 1.6);
  }
  cx.globalAlpha = 1;
  /* the small sign that names the way down */
  cx.strokeStyle = pal.ink; cx.lineWidth = 2.4;
  cx.beginPath(); cx.moveTo(sgx, gy); cx.lineTo(sgx, gy - 42); cx.stroke();
  cx.fillStyle = INKS.cream; cx.globalAlpha = 0.55 + 0.45 * nk;
  cx.fillRect(sgx - 34, gy - 58, 68, 16);
  cx.strokeStyle = pal.ink; cx.lineWidth = 1.5;
  cx.strokeRect(sgx - 34, gy - 58, 68, 16);
  cx.globalAlpha = 1;
  label('PIXEL CITY', sgx, gy - 47, 7, INK_DARK, 'center', 0.9);
  if (Math.abs(sgx - AVX) < 200) {
    label('ONE DAY OF WALKING DOWN', sgx, gy - 64, 6.5,
      'rgba(255,243,224,' + (0.5 + 0.4 * nk).toFixed(2) + ')', 'center', 0.6);
  }
}

/* the village kiosk at its village stop, deep in the walk, with its
   comics spinner rack (owner order: around the twentieth page) */
function drawKiosk(pal) {
  const kx = M.kioskX, sx = w2s(kx);
  if (sx < -160 || sx > W + 160) return;
  const gy = gYAt(kx), ink = pal.ink;
  /* the hut: two posts, a counter, a striped awning */
  cx.fillStyle = ink;
  cx.fillRect(sx - 30, gy - 46, 4, 46);
  cx.fillRect(sx + 8, gy - 46, 4, 46);
  cx.fillRect(sx - 34, gy - 22, 50, 4);      /* the counter */
  for (let i = 0; i < 4; i++) {
    cx.fillStyle = i % 2 ? INKS.rose : INKS.cream;
    cx.fillRect(sx - 38 + i * 15, gy - 54, 15, 7);
  }
  cx.strokeStyle = ink; cx.lineWidth = 1.5;
  cx.strokeRect(sx - 38, gy - 54, 60, 7);
  label('KIOSK', sx - 9, gy - 30, 6.5, 'rgba(255,243,224,0.8)', 'center', 0.8);
  /* the spinner rack: three comics turning slowly on a pole */
  const rx = sx + 34;
  cx.fillStyle = ink;
  cx.fillRect(rx - 1.5, gy - 44, 3, 44);
  const covers = [INKS.rose, INKS.apricot, INKS.violet];
  for (let t = 0; t < 3; t++) {
    const wSpin = REDUCED ? 9 : Math.abs(Math.cos(S.t * 0.8 + t * 1.1)) * 11 + 1.5;
    const cy = gy - 40 + t * 12;
    cx.fillStyle = covers[t];
    cx.fillRect(rx - wSpin, cy, wSpin * 2, 9);
    cx.strokeStyle = INKS.cream; cx.lineWidth = 1;
    cx.strokeRect(rx - wSpin, cy, wSpin * 2, 9);
  }
}

/* QUICK START FIRST — a small carved sign where the whole walk begins */
function drawStartSign(x, pal) {
  const sx = w2s(x);
  if (sx < -140 || sx > W + 140) return;
  const gy = gYAt(x);
  cx.save();
  cx.translate(sx, gy);
  /* the post, then a cream plate over its riso rose under-offset —
     kept low so the border stone's own caption keeps the air above it */
  cx.strokeStyle = pal.ink; cx.lineWidth = 3.4;
  cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(0, -24); cx.stroke();
  cx.fillStyle = INKS.rose;
  cx.fillRect(-44 + 2.5, -44 + 1.5, 88, 22);
  cx.fillStyle = INKS.cream;
  cx.fillRect(-44, -44, 88, 22);
  cx.strokeStyle = pal.ink; cx.lineWidth = 2;
  cx.strokeRect(-44, -44, 88, 22);
  /* carved, not printed: dark letters pressed into the plate */
  label('START HERE', 0, -29.5, 9, INK_DARK, 'center', 2);
  /* a small notch pointing east — the way the reading runs */
  cx.fillStyle = pal.ink;
  cx.beginPath(); cx.moveTo(44, -37); cx.lineTo(52, -33); cx.lineTo(44, -29); cx.closePath(); cx.fill();
  cx.restore();
}

/* ---------------- the audio engine: two honest layers ---------------- */
/* Walking is silent, by the owner's order: no footstep recording is bundled,
   and none is played. The trail's own sounds are all that speak. */
const SFX_VARIANTS = {
  jump: 1, land: 1, spring: 1, gate_open: 1, gate_travel: 1,
  greet: 1, register_open: 1, pen: 1, waymarker: 1, gust: 1,
  wind_bed: 1, crickets: 1,
  /* round 9: rain on the path during a shower, and the small snore of a
     walker who fell asleep standing still (the dog borrows that one, a
     fifth higher and quieter) */
  rain: 1, snore: 1,
  /* THE DOG, RECAST (round 7). The old three samples were rejected by the
     owner; these six are a fresh CC0 set, auditioned before wiring, all
     small and friendly — not one growl, not one big dog, not one animal in
     distress. Every voice is a countable event of its own. */
  dog_sniff: 1, dog_pant: 2, dog_yip: 1, dog_sigh: 1, dog_shake: 1, dog_bark: 1
};

/* ROUND 11 — THE WIND IS THE QUIETEST THING ON THE TRAIL.
   The owner's order was "divise par 3 le volume des bruits de vent", and
   round 10 obeyed it on the bed but left the GUST the loudest ambient
   voice of the whole build: 0.246 (file) x 0.16 (top gain) = 0.0394 of full
   scale, over the crickets at 0.0230 and the rain at 0.0259. Weather that
   shouts over the weather. The gust is trimmed by
   a further 0.48 here, to 0.0189 — a hair under the wind bed's own 0.0202,
   so the two halves of the wind are now the two quietest layers there are.

   And the dog follows the wind down, because the law is that she is never
   louder than it. The ceiling is the gust, whose peak is 0.0189, and every
   dog voice is normalised to a 0.355 peak — so no dog gain may pass
   0.0189 / 0.355 = 0.0533. Each of the six is set at half again what round
   10 played (which was already half of what the mix first reached for),
   and then clamped to that ceiling anyway. Measured, not promised: see
   qa/r11-levels.mjs, which walks every buffer and asserts the order. */
const DOG_PEAK = 0.355;
const GUST_FILE = 0.246;              /* gust.ogg, as the browser decodes it */
const GUST_TRIM = 0.48;               /* round 11: the wind stops shouting   */
const GUST_PEAK = GUST_FILE * (0.0333 + 0.1267) * GUST_TRIM;   /* 0.01890 */
const DOG_CEIL = GUST_PEAK / DOG_PEAK;                         /* 0.05325 */
const DOG_GAIN = {
  /* w5r2 — the sniff rides its lawful step up: 0.050 -> the ceiling the
     wind law sets (DOG_CEIL = gust peak / dog file peak, 0.0533), clamped
     below anyway. Still a soft nose, never a snort — the sample is the
     same gentle double-snuffle, it merely stops hiding under the bed. */
  sniff: 0.0533,  /* a soft double-sniff at a gate      */
  pant:  0.043,   /* rare: she has RUN a long gap down   */
  yip:   0.045,   /* one small yip: she found something */
  sigh:  0.038,   /* contented, sitting by the reader   */
  shake: 0.050,   /* a shake-off in mist or in rain     */
  bark:  0.048    /* rare, and gentle                   */
};
function dogGain(voice, v) { return v * Math.min(DOG_GAIN[voice], DOG_CEIL); }
/* EVERY DOG VOICE IS BOOKED THROUGH HERE, so that "never twice in a row"
   and "seldom" are facts the code keeps rather than hopes. Round 12 adds
   the floor: whatever the event, she does not speak twice inside the same
   half-minute or so, and the gap is drawn fresh every time so it never
   feels scheduled. A booking refused is a booking dropped — when in doubt
   she stays quiet, and the caller learns so from the return value. */
/* 4–9 s, and deliberately small. The floor is not where her rarity lives —
   that is stoppedTogether() and the five per-voice clocks (snuffle 90-150 s,
   sigh 75-140 s, shake 90-135 s, pant 110-200 s, bark 170-300 s). All this
   does is stop two of them landing on the same instant, which is a
   coincidence rather than a tic. A long floor here would have one genuine
   event gagging another a few seconds later, which is worse. */
const DOG_FLOOR_MIN = 4, DOG_FLOOR_SPAN = 5;
/* her signature is never refused: the catch-up bark bypasses the floor
   (it is earned, and welcome every time) but still SETS it, so no other
   voice can land on the same instant */
function dogVoiceNow(kind, wx, vol) {
  AUD.dogFloorAt = S.t + DOG_FLOOR_MIN + Math.random() * DOG_FLOOR_SPAN;
  AUD.lastDog = kind; audEv(kind, wx, vol);
  if (AUD.dogTrace.length < 200) {
    AUD.dogTrace.push({ kind: kind + '!', t: +S.t.toFixed(1), idle: +S.idleT.toFixed(2),
      vx: +Math.abs(S.vx).toFixed(1), x: Math.round(S.x), pose: DOG.pose });
  }
  return true;
}
function dogVoice(kind, wx) {
  if (S.t < (AUD.dogFloorAt || 0)) return false;
  AUD.dogFloorAt = S.t + DOG_FLOOR_MIN + Math.random() * DOG_FLOOR_SPAN;
  AUD.lastDog = kind; audEv(kind, wx);
  /* every voice of hers, with the moment that earned it: the walker's idle
     clock and speed at the instant she spoke. Any count of the dog can be
     traced back to whether you were standing still when she did. */
  if (AUD.dogTrace.length < 200) {
    AUD.dogTrace.push({ kind, t: +S.t.toFixed(1), idle: +S.idleT.toFixed(2),
      vx: +Math.abs(S.vx).toFixed(1), x: Math.round(S.x), pose: DOG.pose });
  }
  return true;
}

/* The snore answers to the same ceiling as the dog: snore.ogg peaks at
   0.325, so nothing above 0.0394 / 0.325 = 0.121 may pass. Set at half
   what the mix first reached for, and clamped anyway. Rain is weather:
   at its loudest it reaches 0.13 x 0.186 = 0.0242 of full scale, under
   the loudest gust, and it dies with the front that brought it. (Round 10
   rebuilt rain.ogg and snore.ogg from named CC0 pages so every file in
   sfx/ has a credit; the measured peaks are 0.186 and 0.326.) */
const SNORE_PEAK = 0.325;
const SNORE_CEIL = GUST_PEAK / SNORE_PEAK;             /* round 11: 0.05815 */
const SNORE_GAIN = Math.min(0.0525, SNORE_CEIL);
const DOGSNORE_GAIN = Math.min(0.0340, SNORE_CEIL);
const RAIN_BED_MAX = 0.13;

/* a toggle is a fade on one layer's gain, never a stop: ~0.6 s back in,
   a shorter ease out, and then a true zero */
const AUD_FADE_IN = 0.60, AUD_FADE_OUT = 0.38;

const AUD = {
  ctx: null, master: null,
  sfx: { gain: null, an: null, on: false },
  mus: { gain: null, an: null, on: false },
  buf: new Map(), loadStarted: false, decoded: 0, decodeFail: [],
  unlocked: false,
  px: null,
  beds: null, gustAt: 0, pantAt: 0, sighAt: 0, barkCD: 0, barkAt: 0, lastDog: '',
  dogFloorAt: 0, sniffAt: 0,      /* round 12: the floor under all her voices */
  sniffWalkAt: 0,                 /* w5r2: the passing snuffle's own stroll clock */
  dogTrace: [],                   /* …and the receipt for every one she gives */
  evCount: {}, playCount: {}, log: [],
  themePlayed: {
    le: lsGet('longway.theme.le') === '1',
    comm: lsGet('longway.theme.comm') === '1',
    complete: lsGet('longway.theme.complete') === '1'
  },
  pendingTheme: null, themeSrc: null
};
/* defaults: both ON — except under reduced motion, where both are OFF
   unless this visitor explicitly turned them on before */
AUD.sfx.on = REDUCED ? lsGet('longway.sfx') === '1' : lsGet('longway.sfx') !== '0';
AUD.mus.on = REDUCED ? lsGet('longway.mus') === '1' : lsGet('longway.mus') !== '0';

function audUnlock() {
  if (!AUD.unlocked) {
    AUD.unlocked = true;
    if (AUD.sfx.on || AUD.mus.on) audEnsureCtx();
  }
  if (AUD.ctx && AUD.ctx.state === 'suspended') AUD.ctx.resume().catch(() => {});
}
window.addEventListener('pointerdown', audUnlock, { capture: true });
window.addEventListener('keydown', audUnlock, { capture: true });

function audEnsureCtx() {
  if (AUD.ctx || !AUD.unlocked) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const c = new AC();
  AUD.ctx = c;
  AUD.master = c.createGain(); AUD.master.gain.value = 0.9;
  AUD.master.connect(c.destination);
  for (const which of ['sfx', 'mus']) {
    const L = AUD[which];
    L.gain = c.createGain();
    L.gain.gain.value = L.on ? 1 : 0;
    L.an = c.createAnalyser(); L.an.fftSize = 2048;
    L.gain.connect(L.an); L.an.connect(AUD.master);
  }
  if (c.state === 'suspended') c.resume().catch(() => {});
  audLoadAll();
  musBuild();
  audBedsBuild();
  if (AUD.pendingTheme) { const w = AUD.pendingTheme; AUD.pendingTheme = null; audTheme(w); }
}

function audLoadAll() {
  if (AUD.loadStarted || !AUD.ctx) return;
  AUD.loadStarted = true;
  const names = [];
  for (const base of Object.keys(SFX_VARIANTS)) {
    const n = SFX_VARIANTS[base];
    if (n === 1) names.push(base);
    else for (let i = 0; i < n; i++) names.push(base + '_' + i);
  }
  for (const nm of names) {
    fetch('sfx/' + nm + '.ogg')
      .then(r => { if (!r.ok) throw new Error('http ' + r.status); return r.arrayBuffer(); })
      .then(ab => AUD.ctx.decodeAudioData(ab))
      .then(b => { AUD.buf.set(nm, b); AUD.decoded++; })
      .catch(e => { AUD.decodeFail.push(nm + ': ' + e.message); });
  }
}

function audVariant(base) {
  const n = SFX_VARIANTS[base] || 1;
  if (n === 1) return AUD.buf.get(base) || null;
  const i = Math.floor(Math.random() * n);
  return AUD.buf.get(base + '_' + i) || AUD.buf.get(base + '_0') || null;
}

function audPlayBuf(b, vol, rate, pan, layer, delaySec) {
  const L = AUD[layer || 'sfx'];
  if (!AUD.ctx || !b || !L.gain) return null;
  const c = AUD.ctx;
  const src = c.createBufferSource(); src.buffer = b;
  src.playbackRate.value = rate || 1;
  const g = c.createGain(); g.gain.value = vol;
  src.connect(g);
  if (c.createStereoPanner) {
    const pn = c.createStereoPanner(); pn.pan.value = clamp(pan || 0, -1, 1);
    g.connect(pn); pn.connect(L.gain);
  } else g.connect(L.gain);
  src.start(c.currentTime + (delaySec || 0));
  return src;
}

/* a two-second bed of rolled noise for the thunder — generated once,
   normalised to a unit peak so its gain IS its peak; nothing external */
function audNoiseBuf() {
  if (AUD.noise || !AUD.ctx) return AUD.noise || null;
  const c = AUD.ctx, nS = Math.floor(c.sampleRate * 2);
  const b = c.createBuffer(1, nS, c.sampleRate);
  const d = b.getChannelData(0);
  let last = 0, mx = 0;
  for (let i = 0; i < nS; i++) {
    last = (last + (Math.random() * 2 - 1) * 0.02) * 0.998;
    d[i] = last;
    const a = Math.abs(last); if (a > mx) mx = a;
  }
  if (mx > 0) for (let i = 0; i < nS; i++) d[i] /= mx;
  AUD.noise = b;
  return b;
}

/* every sound maps to a countable event; the count survives even muted */
function audEv(kind, wx, vol) {
  AUD.evCount[kind] = (AUD.evCount[kind] || 0) + 1;
  if (AUD.log.length < 600) AUD.log.push(kind + '@' + Math.round(S.t * 10) / 10);
  /* MUTE, NEVER STOP: an event that happens while SFX is off still plays —
     into a layer gain that is riding at zero. Nothing is skipped, nothing
     is destroyed, and turning the layer back on lands you inside the sound
     that is already in the air. */
  if (!AUD.ctx) return;
  const sx = wx == null ? AVX : w2s(wx);
  const dpx = Math.abs(sx - AVX);
  const att = 1 / (1 + Math.pow(dpx / 430, 2));           /* distance falls away */
  const pan = clamp((sx - AVX) / (W * 0.55), -1, 1) * 0.8; /* panned by screen   */
  const v = (vol == null ? 1 : vol) * att;
  AUD.lastMix = { kind, dpx: Math.round(dpx), att: +att.toFixed(4), pan: +pan.toFixed(3), v: +v.toFixed(4) };
  if (v < 0.02) return;
  const jit = 0.94 + Math.random() * 0.12;
  let played = true;
  switch (kind) {
    case 'jump': audPlayBuf(audVariant('jump'), v * 0.32, jit, pan); break;
    case 'land': audPlayBuf(audVariant('land'), v * 0.30, 1.02 * jit, pan); break;
    /* prepolish5, owner order: the jump-with-tip sound (the spring bounce,
       both its parts) drops forty percent. Only this and the door below
       moved; every other effect keeps its gain. */
    case 'spring':
      audPlayBuf(audVariant('spring'), v * 0.42 * 0.6, 1.38, pan);
      audPlayBuf(audVariant('jump'), v * 0.18 * 0.6, 0.88, pan, 'sfx', 0.05);
      break;
    case 'stumble': audPlayBuf(audVariant('land'), v * 0.36, 0.8, pan); break;
    /* the hold: one soft bump as the barrier takes her weight — quieter
       than a landing, felt more than heard */
    case 'blocked': audPlayBuf(audVariant('land'), v * 0.16, 0.72, pan); break;
    /* a crossing taken: a small two-note departure, stone then glass */
    case 'portal':
      audPlayBuf(audVariant('waymarker'), v * 0.30, 1.18, 0);
      audPlayBuf(audVariant('greet'), v * 0.22, 0.9, 0, 'sfx', 0.16);
      break;
    /* ONE THIRD of the gain the gate used to open at — the owner listened
       and heard a door slamming beside him; this is a latch lifting a few
       steps away. The travel through it keeps the same restraint. */
    /* prepolish5, owner order: the door softens another three tenths on
       top of the third above — the latch is now a room further off. */
    case 'gate': audPlayBuf(audVariant('gate_open'), v * (0.5 / 3) * 0.7, jit, pan); break;
    case 'gateTravel': audPlayBuf(audVariant('gate_travel'), v * (0.45 / 3), 1, 0); break;
    case 'greet': audPlayBuf(audVariant('greet'), v * 0.5, 0.96 + Math.random() * 0.08, pan); break;
    case 'regopen': audPlayBuf(audVariant('register_open'), v * 0.5, 1, pan); break;
    case 'pen':
      audPlayBuf(audVariant('pen'), v * 0.55, 0.92, 0);
      audPlayBuf(audVariant('pen'), v * 0.4, 1.06, 0, 'sfx', 0.22);
      break;
    case 'stone': audPlayBuf(audVariant('waymarker'), v * 0.38, 0.95 + Math.random() * 0.1, pan); break;
    case 'gust': audPlayBuf(audVariant('gust'), v * GUST_TRIM, 0.85 + Math.random() * 0.3, pan); break;
    /* a soft rolled thunder, at wind-level gain by law: filtered noise,
       eased in and out, through the SFX layer so the toggle rules it */
    case 'thunder': {
      if (!audNoiseBuf()) { played = false; break; }
      const cth = AUD.ctx, tth = cth.currentTime;
      const srcT = cth.createBufferSource(); srcT.buffer = AUD.noise; srcT.loop = true;
      const lpT = cth.createBiquadFilter(); lpT.type = 'lowpass'; lpT.Q.value = 0.5;
      lpT.frequency.setValueAtTime(120, tth);
      lpT.frequency.linearRampToValueAtTime(300, tth + 0.45);
      lpT.frequency.linearRampToValueAtTime(60, tth + 2.6);
      const gT = cth.createGain();
      /* prepolish5, owner order: the thunder was nearly inaudible under
         the wind bed — its gain rises two and a half times. The distance
         attenuation (in v), the flash-to-rumble delay and the envelope
         shape are exactly as they were; nothing else in the storm mix
         moves. */
      const pkT = GUST_PEAK * 2.5 * v;
      gT.gain.setValueAtTime(0.0001, tth);
      gT.gain.linearRampToValueAtTime(Math.max(0.0002, pkT), tth + 0.35);
      gT.gain.linearRampToValueAtTime(Math.max(0.0001, pkT * 0.4), tth + 1.3);
      gT.gain.linearRampToValueAtTime(0.0001, tth + 2.8);
      srcT.connect(lpT); lpT.connect(gT);
      if (cth.createStereoPanner) {
        const pnT = cth.createStereoPanner(); pnT.pan.value = pan;
        gT.connect(pnT); pnT.connect(AUD.sfx.gain);
      } else gT.connect(AUD.sfx.gain);
      srcT.start(tth); srcT.stop(tth + 3.0);
      break;
    }
    /* --- the dog, recast: six voices, all of them gentle --- */
    case 'dogsniff': {                       /* two quick snuffles at a door */
      const r0 = 0.93 + Math.random() * 0.15;
      audPlayBuf(audVariant('dog_sniff'), dogGain('sniff', v), r0, pan);
      audPlayBuf(audVariant('dog_sniff'), dogGain('sniff', v) * 0.76,
        r0 * (1.02 + Math.random() * 0.10), pan, 'sfx', 0.100 + Math.random() * 0.085);
      break;
    }
    case 'dogpant':
      audPlayBuf(audVariant('dog_pant'), dogGain('pant', v), 0.93 + Math.random() * 0.15, pan); break;
    /* w5r2 — the recall's arrival: light happy panting for a couple of
       seconds, fading as she calms. Same pant samples, same pant gain law
       (under the dog ceiling), each echo softer than the last. */
    case 'dogpantfade': {
      const rP = 0.97 + Math.random() * 0.10;
      audPlayBuf(audVariant('dog_pant'), dogGain('pant', v), rP, pan);
      audPlayBuf(audVariant('dog_pant'), dogGain('pant', v) * 0.55, rP * 1.03, pan, 'sfx', 1.05);
      audPlayBuf(audVariant('dog_pant'), dogGain('pant', v) * 0.30, rP * 1.06, pan, 'sfx', 2.05);
      break;
    }
    /* w5r2 — the walker's own two-note riso whistle (C): synthesized in
       place like the thunder, so no new file enters the bank; it peaks at
       the gust's lawful peak — the wind law caps the walker exactly as it
       caps her dog. Counted and logged like every voice. */
    case 'whistle': {
      const cW = AUD.ctx, tW = cW.currentTime;
      const noteW = (f0, f1, at, dur) => {
        const o = cW.createOscillator(); o.type = 'triangle';
        o.frequency.setValueAtTime(f0, tW + at);
        o.frequency.linearRampToValueAtTime(f1, tW + at + dur);
        const gWh = cW.createGain();
        const pkW = Math.max(0.0002, GUST_PEAK * 0.98 * v);
        gWh.gain.setValueAtTime(0.0001, tW + at);
        gWh.gain.linearRampToValueAtTime(pkW, tW + at + 0.035);
        gWh.gain.setValueAtTime(pkW, tW + at + Math.max(0.05, dur - 0.06));
        gWh.gain.linearRampToValueAtTime(0.0001, tW + at + dur);
        o.connect(gWh); gWh.connect(AUD.sfx.gain);
        o.start(tW + at); o.stop(tW + at + dur + 0.03);
      };
      noteW(1180, 1320, 0, 0.17);           /* the short note…       */
      noteW(1470, 1650, 0.21, 0.26);        /* …then the rising call */
      break;
    }
    case 'dogyip':
      audPlayBuf(audVariant('dog_yip'), dogGain('yip', v), 0.95 + Math.random() * 0.17, pan); break;
    case 'dogsigh':
      audPlayBuf(audVariant('dog_sigh'), dogGain('sigh', v), 0.90 + Math.random() * 0.14, pan); break;
    case 'dogshake':
      audPlayBuf(audVariant('dog_shake'), dogGain('shake', v), 0.92 + Math.random() * 0.16, pan); break;
    case 'dogbark':
      audPlayBuf(audVariant('dog_bark'), dogGain('bark', v), 0.96 + Math.random() * 0.11, pan); break;
    /* --- the sleeper, and the smaller sleeper beside her --- */
    case 'snore':
      audPlayBuf(audVariant('snore'), v * SNORE_GAIN, 0.94 + Math.random() * 0.13, pan); break;
    case 'dogsnore':
      audPlayBuf(audVariant('snore'), v * DOGSNORE_GAIN, 1.42 + Math.random() * 0.17, pan); break;
    default: played = false;
  }
  if (played) AUD.playCount[kind] = (AUD.playCount[kind] || 0) + 1;
}

/* --- the ambient beds: wind, crickets, rain. THE FOG FALLS SILENT
   (wave 3, owner order): the mist's hush voice is gone entirely — no
   recurring breath, no blowing loop, in mist or fog, place-bound or
   weather-front. hush.ogg left the bank and the credits. Fog and mist
   are purely visual now; the wind bed alone may whisper, at its lawful
   third of the gain first reached for. --- */
function audBedsBuild() {
  if (!AUD.ctx || AUD.beds) return;
  const mk = () => {
    const g = AUD.ctx.createGain(); g.gain.value = 0;
    g.connect(AUD.sfx.gain);
    return { g, src: null, nextAt: 0, fadeAt: 0, target: 0 };
  };
  AUD.beds = { wind: mk(), crickets: mk(), rain: mk() };
}
/* How long a buffer actually SOUNDS. A file that ends in digital silence
   would open a hole in the bed once a cycle — round 8 found wind_bed.ogg
   running 7.9 s of nothing into every 22 s — so every bed is scheduled and
   looped against this length and never against buf.duration. The files are
   trimmed as well; this is the belt behind that brace. */
const BED_XFADE = 1.0;          /* the grain fade baked into wind_bed.ogg */
function audAudible(buf) {
  if (buf.__lwAud !== undefined) return buf.__lwAud;
  let out = buf.duration;
  try {
    const ch = buf.getChannelData(0);
    let last = -1;
    for (let i = ch.length - 1; i >= 0; i--) { if (Math.abs(ch[i]) > 1e-4) { last = i; break; } }
    if (last >= 0) {
      const d = (last + 1) / buf.sampleRate;
      out = (buf.duration - d < 0.05) ? buf.duration : Math.max(0.5, d);
    }
  } catch (e) { /* keep the whole file */ }
  try { buf.__lwAud = out; } catch (e) { /* fine, we recompute */ }
  return out;
}
function audBedLoop(bed, name, loop) {
  /* (re)start a bed's source when its buffer arrives; loopable files loop
     natively over their audible length, the wind rides scheduled grains
     whose baked equal-power fades crossfade one into the next */
  if (!AUD.beds) return;
  const B = AUD.beds[bed];
  const buf = AUD.buf.get(name);
  if (!buf) return;
  const c = AUD.ctx;
  const dur = audAudible(buf);
  if (loop) {
    if (B.src) return;
    const s = c.createBufferSource(); s.buffer = buf; s.loop = true;
    s.loopStart = 0; s.loopEnd = dur;         /* never loop through dead air */
    s.connect(B.g); s.start();
    B.src = s;
  } else {
    if (c.currentTime + 2.2 < B.nextAt) return;
    const s = c.createBufferSource(); s.buffer = buf;
    /* a hair of detune per grain, so the bed's own period never lines up
       with itself twice — weather, not a tape loop */
    const rate = 0.97 + Math.random() * 0.06;
    s.playbackRate.value = rate;
    s.connect(B.g);
    const at = Math.max(B.fadeAt || 0, c.currentTime);
    s.start(at);
    const len = dur / rate;
    B.nextAt = at + len;                       /* where this grain ends    */
    B.fadeAt = at + len - BED_XFADE / rate;    /* where its fade begins    */
  }
}
function audBedTarget(bed, t) {
  const B = AUD.beds && AUD.beds[bed];
  if (!B) return;
  if (Math.abs((B.target || 0) - t) < 0.005) return;
  B.target = t;
  B.g.gain.setTargetAtTime(t, AUD.ctx.currentTime, 0.5);   /* always eased */
}

/* ==================================================================== */
/* ROUND 10 — THE SCORE GROWS WITH THE JOURNEY                          */
/*                                                                       */
/* Owner order, after hearing the full ensemble at the trail end: the    */
/* music GAINS LAYERS as the walk progresses, so the further you have    */
/* read the richer the moments sound — one voice early, an ensemble by   */
/* the end.                                                              */
/*                                                                       */
/* Progress (w5r1, owner redefinition): WHERE YOU STAND — the walker's   */
/* current word position over the trail's total words, the exact number  */
/* the WORD x OF y odometer shows, however you got there. A jump moves   */
/* the ladder immediately, both ways; the end cairn reads 100 percent.   */
/*                                                                       */
/* THE SILENCE DOCTRINE IS UNCHANGED. Layers make a moment THICKER, not  */
/* more frequent: the same four triggers, the same cooldowns, the same   */
/* three phrases, the same swell envelope and the same true silence      */
/* between weathers. Everything a new voice does happens inside a moment */
/* that would have happened anyway, and every voice sings through the    */
/* same MUS.swell gate, so a moment ends exactly when it always ended.   */
/* ==================================================================== */
/* THE LADDER, REBUILT BETWEEN THE SACRED ENDS (prepolish5, owner order:
   he loves the sparse opening notes and the two top characters; the old
   middle rungs arrived too abruptly). The box he loves is untouched to a
   fifth of the trail. From there the SAME notes simply come more often
   (no new instrument). At three tenths a bowed string starts to visit —
   a gentle phrase now and then, on a thirty-to-sixty-second cadence of
   its own, never continuous. At the half the low pad joins quietly; it
   is the air of the Land's End ensemble itself, so the climb stays in
   one family of sound. The 78 and 100 percent characters stand on top
   exactly as they were: COUNTER-MELODY renders the full old five-voice
   law, FULL ENSEMBLE the old six. */
const SCORE_TIERS = [
  { at: 0.00, name: 'MUSIC BOX',      line: 'the music box, alone' },
  { at: 0.20, name: 'BUSIER BOX',     line: 'the same notes, oftener' },
  { at: 0.30, name: 'A BOWED STRING', line: 'a bowed string, now and then' },
  { at: 0.50, name: 'LOW PAD',        line: 'a low sustained pad' },
  { at: 0.70, name: 'COUNTER-MELODY', line: 'a warm counter-melody' },
  { at: 0.90, name: 'FULL ENSEMBLE',  line: 'the full ensemble' }
];
/* how many voices actually sound at each rung — the HUD reads this, so it
   never claims a voice the moment does not carry. The two top rungs keep
   their old counts (5 at 78 percent, 6 at the end). */
const SCORE_VOICES = [1, 1, 2, 3, 5, 6];
/* THICKER, NEVER LOUDER. Each voice that joins trims the whole ensemble a
   little, so the score gains body without gaining volume: the peak of a
   moment at the ensemble sits inside the peak of a moment at the music box.
   Measured, not guessed — see qa/r10-levels.mjs. The two top rungs keep
   their old trims exactly. */
const SCORE_TRIM = [1.00, 0.98, 0.97, 0.96, 0.95, 0.93];

const SCORE = {
  tier: 0, p: 0, words: 0, pages: 0,
  /* the highest rung this visitor has ever reached, so a voice debuts once
     and only once, even across a true reload */
  reached: clamp(parseInt(lsGet('longway.score.tier') || '0', 10) || 0, 0, SCORE_TIERS.length - 1),
  debut: -1,            /* a voice waiting to enter exposed on the next moment */
  named: '', namedT: -1e9,
  lastVoices: [], lastMoment: null, acct: null, unlocks: 0, debuts: 0, checkIn: 0
};

function scoreProgress() {
  /* REDEFINED (w5r1, binding): the score reads WHERE YOU STAND — the
     walker's current word position over the trail's total words, exactly
     the number the WORD x OF y odometer shows, however you got there:
     walking, gates, Tab, search. A gate landing deep in the trail wakes
     the richer ensemble at the next musical moment; walking back west
     thins it again the same honest way. The end cairn and Land's End
     read 100 percent, PERIOD. The words and the pages stay as honest
     tallies for the pack; the music ignores them. */
  const words = clamp(PACK.walked / Math.max(1, M.totalWords), 0, 1);
  const pages = clamp(Object.keys(PACK.visited).filter(sl => M.bySlug.has(sl)).length / Math.max(1, M.pages.length), 0, 1);
  const p = S.atLE ? 1 : clamp(wordsAt(S.x) / Math.max(1, M.totalWords), 0, 1);
  return { words, pages, p };
}
function scoreTierFor(p) {
  let t = 0;
  for (let i = 0; i < SCORE_TIERS.length; i++) if (p >= SCORE_TIERS[i].at) t = i;
  return t;
}
/* one quiet line when a rung is first reached, and a voice queued to enter
   slightly exposed on the very next moment */
function scoreUpdate(announce) {
  /* THE SHARES ARE OF A REAL CORPUS OR THEY ARE NOTHING. boot() fetches
     the four data files asynchronously, so this can be reached with an
     empty model; dividing by an empty trail would read every pack as a
     finished walk and hand a returning visitor the whole ensemble at the
     trailhead. Until the pages are in, the score holds. */
  if (!M.pages.length || !M.totalWords) return SCORE.tier;
  const g = scoreProgress();
  SCORE.words = g.words; SCORE.pages = g.pages; SCORE.p = g.p;
  const t = scoreTierFor(g.p);
  if (t > SCORE.reached) {
    /* a deep gate landing can cross several rungs in one step: every rung
       is marked reached and the TOP one is queued to debut, but the line
       is spoken once, for where you now stand */
    const gained = t - SCORE.reached;
    for (let i = SCORE.reached + 1; i <= t; i++) {
      SCORE.reached = i;
      SCORE.debut = i;
      SCORE.unlocks++;
      lsSet('longway.score.tier', String(i));
    }
    if (announce !== false) {
      toast('THE SCORE GAINS ' + (gained > 1 ? 'VOICES' : 'A VOICE') + ' — ' +
        SCORE_TIERS[t].name + ' · ' + Math.round(g.p * 100) + '% ALONG THE TRAIL');
    }
  }
  SCORE.tier = t;
  refreshScoreUI();
  return SCORE.tier;
}
function scoreLabel() {
  const n = SCORE_VOICES[SCORE.tier];
  if (S.t - SCORE.namedT < 9 && SCORE.named) return 'SCORE · A NEW VOICE — ' + SCORE.named;
  return 'SCORE · ' + SCORE_TIERS[SCORE.tier].name + ' · ' + n + (n === 1 ? ' VOICE' : ' VOICES') +
    ' · ' + Math.round(SCORE.p * 100) + '%';
}
const scoreEl = document.getElementById('score');
function refreshScoreUI() { if (scoreEl) setText(scoreEl, 'sc', scoreLabel()); }

/* ---------------- music as weather ---------------- */
const MUS = {
  busIn: null, busPad: null, swell: null, built: false,
  lastG: null, lastN: null,
  cd: new Map(), quietUntil: 0, phraseEnd: 0,
  lookAt: new Map(), noteSeed: 1,
  stringNext: 0        /* prepolish5: the visiting string's own cadence */
};
const MUS_SCALES = [[0, 2, 4, 7, 9], [0, 2, 5, 7, 9], [0, 3, 5, 7, 10]];
const MUS_MOMENT_CD = { golden: 120, night: 120, border: 45, overlook: 60 };
/* how long a moment takes to withdraw — one number, so the closing tine and
   the silence that follows are always measured against the same fall */
const MUS_FALL = 5;
/* and how long it speaks before it withdraws: a moment that has not said
   this much in two phrases speaks a third. Not a length imposed on the
   music — the phrases are drawn exactly as they always were — but a floor
   under how much of one the trail gets before the silence returns.
   Nineteen made a third phrase near-certain and put the duty at 50.4 %;
   sixteen was the point at which about half the moments had said enough in
   two. Retuned by ear for the sidebar order (wave 4): the new walking
   order re-seeded the rung stretches thinner — sparser phrases said only
   ~33 % at sixteen — so eighteen re-centres the gate at the high thirties
   while the true silences stay above sixty percent of every window. */
const MUS_SAY = 18;

function musBuild() {
  if (MUS.built || !AUD.ctx) return;
  MUS.built = true;
  const c = AUD.ctx;
  MUS.busIn = c.createGain(); MUS.busIn.gain.value = 1;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; lp.Q.value = 0.4;
  MUS.swell = c.createGain(); MUS.swell.gain.value = 0;
  MUS.busIn.connect(lp);
  const dry = c.createGain(); dry.gain.value = 0.8;
  lp.connect(dry); dry.connect(MUS.swell);
  const delay = c.createDelay(2.0); delay.delayTime.value = 0.46;
  const fb = c.createGain(); fb.gain.value = 0.30;
  const fbLp = c.createBiquadFilter(); fbLp.type = 'lowpass'; fbLp.frequency.value = 1500;
  const wet = c.createGain(); wet.gain.value = 0.34;
  lp.connect(delay); delay.connect(fbLp); fbLp.connect(fb); fb.connect(delay);
  delay.connect(wet); wet.connect(MUS.swell);
  /* round 10: the sustained voices want the room but not the echo — their
     own soft lowpass, straight into the same swell, so that a pad or a
     bowed string ends at exactly the instant the moment ends */
  MUS.busPad = c.createGain(); MUS.busPad.gain.value = 1;
  const padLp = c.createBiquadFilter(); padLp.type = 'lowpass';
  padLp.frequency.value = 1500; padLp.Q.value = 0.3;
  MUS.busPad.connect(padLp); padLp.connect(MUS.swell);
  MUS.swell.connect(AUD.mus.gain);
}

function musMidiHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

/* one struck tine: fundamental + octave shimmer + a high inharmonic ping,
   all soft attack and long natural decay — a small instrument, not a synth.
   `ring` (round 11) lets one tine be left to ring far past its written
   length without changing how hard it was struck: same attack, same
   partials, same peak, a longer decay. It is what a music box's home tine
   actually does when nothing damps it. */
function musNote(freq, when, vel, dur, ring) {
  const c = AUD.ctx;
  const mk = (f, v, d) => {
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), when + 0.007);
    g.gain.exponentialRampToValueAtTime(0.0001, when + d);
    o.connect(g); g.connect(MUS.busIn);
    o.start(when); o.stop(when + d + 0.1);
  };
  mk(freq, vel, ring || dur);
  mk(freq * 2.004, vel * 0.32, dur * 0.4);
  mk(freq * 5.9871, vel * 0.10, dur * 0.13);
}

/* what the land gives the instrument: scale from the community, register
   from the stretch's freshness, density from the hour */
function musPalette() {
  const p = S.page;
  const c = p && p.comm >= 0 ? M.communities[p.comm] : null;
  const h = hashStr('scale:' + (c ? String(c.dominant) : 'open-country'));
  const scale = MUS_SCALES[h % MUS_SCALES.length];
  const root = 50 + ((h >> 4) % 8);
  const reg = p ? [12, 7, 0, -5][p.season] : 0;
  const w = DAY.wts;
  const density = clamp(0.5 + w.d * 0.45 + w.m * 0.2 + w.g * 0.1 - w.n * 0.22, 0.22, 1);
  return { scale, root: root + reg, density };
}

/* The tune is drawn first and drawn identically at every rung of the score:
   the same seed, the same little stepwise walk, the same gaps. Only then is
   it handed to musRender, which dresses it with whatever the walk has
   earned. A visitor at the music box hears exactly the phrase this trail has
   always played. */
function musPhrase(t0, quiet, opt) {
  const pal = musPalette();
  const r = mulberry32((MUS.noteSeed = (MUS.noteSeed * 1103515245 + 12345) >>> 0));
  /* prepolish5, the second rung of the rebuilt ladder: from a fifth of the
     trail THE SAME NOTES SIMPLY COME MORE OFTEN — the walk gains two steps
     and the gaps tighten, the instrument, the velocities and the stepwise
     law untouched. The lift lives on the middle rungs only (1 to 3): at
     the sacred ends — the sparse box of the opening and the 78 and 100
     percent characters — the phrase is drawn exactly as it always was. */
  const tl = (opt && opt.tier != null) ? opt.tier : SCORE.tier;
  const oftener = tl >= 1 && tl <= 3;
  const nNotes = 3 + Math.floor(pal.density * 4 + r() * 2) + (oftener ? 2 : 0);
  let deg = [0, 2, 4][Math.floor(r() * 3)];
  let t = t0;
  const notes = [];
  for (let i = 0; i < nNotes; i++) {
    const oct = Math.floor(deg / pal.scale.length);
    const st = pal.scale[((deg % pal.scale.length) + pal.scale.length) % pal.scale.length];
    const midi = pal.root + 12 * oct + st + 12;
    const vel = (0.045 + r() * 0.035) * (quiet ? 0.6 : 1);
    const dur = 1.5 + r() * 0.9 + (i === nNotes - 1 ? 1.1 : 0);
    notes.push({ midi, t, vel, dur, deg });
    /* mostly stepwise, the little walk of a music box */
    const roll = r();
    deg += roll < 0.55 ? (r() < 0.5 ? 1 : -1) : roll < 0.8 ? (r() < 0.5 ? 2 : -2) : 0;
    deg = clamp(deg, -2, pal.scale.length * 2 + 1);
    if (i === nNotes - 2) deg = r() < 0.6 ? 0 : 3;       /* settle toward home */
    const gap = lerp(1.35, 0.5, pal.density) * (0.75 + r() * 0.55) * (oftener ? 0.72 : 1);
    t += gap;
  }
  const end = t + 1.6;
  /* ROUND 11 — THE TINE THAT CLOSES A PHRASE IS LEFT TO RING.
     The gate of a moment was open 40-46 % of a five-minute walk and only
     25.6 % of it actually sounded: the gaps BETWEEN the phrases of one
     moment, and the five seconds the moment takes to withdraw, fell to a
     true zero at the music box, where nothing sustains. So the last tine of
     a phrase — the one the little walk already settles home on — is struck
     exactly as hard as before and simply not damped: it rings across the
     gap that follows it, and the last one rings out under the whole
     withdrawal. The silence between MOMENTS is untouched, and it is still
     the swell, not the tine, that decides when a moment is over. */
  if (notes.length) notes[notes.length - 1].ring = (opt && opt.hold) || 9;
  musRender(notes, pal, t0, end, quiet, r, opt || {});
  return end;
}


/* --- the voices that join, one rung at a time --- */
/* Every one of them is a small acoustic thing: soft attack, natural decay,
   nothing that reads as a synth demo. They all sing into the same two buses
   and through the same swell, so the moment's shape is untouched. */

/* a sparse piano — a struck string with a slower hammer than the tine and a
   decay that outlives it */
function musPiano(freq, when, vel, dur) {
  const c = AUD.ctx;
  const mk = (f, v, d, type) => {
    const o = c.createOscillator(); o.type = type || 'sine'; o.frequency.value = f;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), when + 0.019);
    g.gain.exponentialRampToValueAtTime(0.0001, when + d);
    o.connect(g); g.connect(MUS.busIn);
    o.start(when); o.stop(when + d + 0.1);
  };
  mk(freq, vel, dur);
  mk(freq * 2.0012, vel * 0.44, dur * 0.72);
  mk(freq * 3.0055, vel * 0.17, dur * 0.34);
  mk(freq * 4.021, vel * 0.06, dur * 0.17, 'triangle');
}

/* a low sustained pad — two detuned pairs breathing under a slow filter */
function musPad(rootHz, when, dur, vel) {
  const c = AUD.ctx;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(vel, when + dur * 0.40);      /* breathes in  */
  g.gain.setValueAtTime(vel, when + dur * 0.58);
  g.gain.linearRampToValueAtTime(0.0001, when + dur);          /* breathes out */
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.7;
  lp.frequency.setValueAtTime(300, when);
  lp.frequency.linearRampToValueAtTime(780, when + dur * 0.5);
  lp.frequency.linearRampToValueAtTime(290, when + dur);
  g.connect(lp); lp.connect(MUS.busPad);
  const parts = [[1, -4, 'triangle', 0.50], [1, 5, 'triangle', 0.46],
                 [1.5, -3, 'sine', 0.28], [2, 2, 'sine', 0.20]];
  for (const [mul, det, type, v] of parts) {
    const o = c.createOscillator(); o.type = type;
    o.frequency.value = rootHz * mul; o.detune.value = det;
    const vg = c.createGain(); vg.gain.value = v;
    o.connect(vg); vg.connect(g);
    o.start(when); o.stop(when + dur + 0.2);
  }
}

/* strings — a small consort, bowed in slowly, the faintest vibrato */
function musStrings(rootHz, when, dur, vel, vibHz) {
  const c = AUD.ctx;
  const g = c.createGain();
  const hold = Math.max(2.3, dur - 2.8);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(vel, when + 2.0);             /* bowed, never struck */
  g.gain.setValueAtTime(vel, when + hold);
  g.gain.linearRampToValueAtTime(0.0001, when + dur);
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1180; lp.Q.value = 0.5;
  g.connect(lp); lp.connect(MUS.busPad);
  const vib = c.createOscillator(); vib.type = 'sine';
  vib.frequency.value = vibHz || 4.9;
  const vibG = c.createGain(); vibG.gain.value = 4.5;          /* cents, barely there */
  vib.connect(vibG);
  vib.start(when); vib.stop(when + dur + 0.2);
  for (const [mul, det, v] of [[1, -6, 0.46], [1.5, 4, 0.30], [2, -2, 0.20]]) {
    const o = c.createOscillator(); o.type = 'sawtooth';
    o.frequency.value = rootHz * mul; o.detune.value = det;
    vibG.connect(o.detune);
    const og = c.createGain(); og.gain.value = v;
    o.connect(og); og.connect(g);
    o.start(when); o.stop(when + dur + 0.2);
  }
}

/* a warm counter-melody — a second line under the tune, moving against it */
function musCounterNote(freq, when, vel, dur) {
  const c = AUD.ctx;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(vel, when + 0.24);            /* warm, not struck */
  g.gain.setValueAtTime(vel, when + dur * 0.55);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1050; lp.Q.value = 0.4;
  g.connect(lp); lp.connect(MUS.busIn);
  const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = freq;
  o.connect(g); o.start(when); o.stop(when + dur + 0.1);
  const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2.0018;
  const g2 = c.createGain(); g2.gain.value = 0.30;
  o2.connect(g2); g2.connect(g); o2.start(when); o2.stop(when + dur + 0.1);
}

/* the ensemble's floor — one low bell struck under a phrase's first note */
function musBell(freq, when, vel) {
  const c = AUD.ctx;
  for (const [m, v, d] of [[1, vel, 9], [2.0, vel * 0.30, 5], [2.76, vel * 0.12, 3.2], [5.43, vel * 0.05, 1.6]]) {
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq * m;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), when + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, when + d);
    o.connect(g); g.connect(MUS.busIn);
    o.start(when); o.stop(when + d + 0.1);
  }
}

/* One phrase, rendered through whatever the walk has earned. The melody is
   drawn first and identically at every rung — the extra voices dress it,
   they never rewrite it. `only` is a debut: that voice alone, a little
   exposed, so the ear catches the newcomer. */
/* what a scheduled note costs in energy: amplitude squared times the time
   it sounds for. Booked per voice so a moment can be read as a bill. */
function musBook(voice, vel, dur) {
  if (SCORE.acct) SCORE.acct[voice] += vel * vel * dur;
}
function musRender(notes, pal, t0, end, quiet, r, opt) {
  const tier = opt.tier == null ? SCORE.tier : opt.tier;
  /* THE REBUILT LADDER'S GATES (prepolish5). Voice indices are unchanged
     (1 piano, 2 pad, 3 strings, 4 counter, 5 bell); only the rung at which
     each may sound moved. The bowed string is the first stranger (rung 2),
     the pad follows at the half (rung 3), and the piano now belongs to the
     top characters: rungs 4 and 5 render exactly the old five- and
     six-voice laws, so 78 and 100 percent sound as they always did. */
  const avail = (i) =>
    i === 1 ? tier >= 4 :
    i === 2 ? tier >= 3 :
    i === 3 ? tier >= 2 :
    i === 4 ? tier >= 4 :
    tier >= 5;
  /* a voice can only step forward if the score has actually earned it: an
     out-of-range debut falls back to the whole ensemble rather than
     rendering a phrase with nothing in it */
  let only = opt.only == null ? -1 : opt.only;
  if (only > 0 && !avail(only)) only = -1;
  const trim = SCORE_TRIM[clamp(tier, 0, SCORE_TRIM.length - 1)];
  const q = quiet ? 0.7 : 1;
  const span = Math.max(4, end - t0);
  const boost = only >= 0 ? 1.5 : 1;                 /* the newcomer, exposed */
  /* WHERE THE AIR COMES FROM. A pad that ran under every phrase would
     close the gaps the music box leaves and turn a moment into a wash.
     The sustained voices live in the OPENING phrase instead: a moment
     swells open under a pad and a bowed fifth, and then the struck
     voices carry it and it falls, always, into a music box and silence.
     Placing them by index instead — pad on the first two phrases,
     strings on the middle one — looked right until the probe pointed out
     that a moment speaks two phrases as often as three, and in a
     two-phrase moment the middle one IS the last one. A debut always
     sounds, wherever it lands. */
  const ph = opt.i || 0;
  const has = (i) => avail(i) && (only < 0 || only === i);
  const voices = [];

  const closer = notes.length ? notes[notes.length - 1] : null;
  /* 0 — the music box, the voice the trail starts with */
  if (only < 0 || only === 0) {
    voices.push('box');
    for (const n of notes) {
      if (n === closer && n.ring) continue;      /* the closing tine takes it */
      musNote(musMidiHz(n.midi), n.t, n.vel * trim, n.dur);
      musBook('box', n.vel * trim, n.dur);
    }
  }
  /* the closing tine sounds whoever is speaking — it is the instrument's own
     resonance, not a rung of the ladder, so it never joins `voices` and a
     debut still stands alone in its phrase. On a debut it is struck softer
     still, so the newcomer keeps the light. */
  if (closer && closer.ring) {
    const cv = closer.vel * trim * (only >= 0 ? 0.78 : 1);
    musNote(musMidiHz(closer.midi), closer.t, cv, closer.dur, closer.ring);
    musBook('box', cv, closer.ring);
  }
  /* 1 — a sparse piano: one note in three, on a line of its own — two scale
     steps under the tune, an octave down — and struck in the GAP the tine
     leaves rather than on top of it. It used to double the tine at the
     octave, which put its second partial a fraction of a hertz from that
     tine's fundamental: the two beat against each other and the bench
     measured a moment getting QUIETER as a voice joined it. Answering,
     rather than doubling, is both honest physics and better music. */
  if (has(1)) {
    voices.push('piano');
    for (let i = 0; i < notes.length; i++) {
      if (i % 3 !== 1 && i !== notes.length - 1) continue;
      const n = notes[i];
      const gap = (i + 1 < notes.length ? notes[i + 1].t - n.t : n.dur);
      const at = n.t + clamp(gap * (0.42 + r() * 0.12), 0.28, 1.5);
      /* two scale steps under the tune, an octave down: a line of its own */
      const d = n.deg - 2;
      const oc = Math.floor(d / pal.scale.length);
      const sd = pal.scale[((d % pal.scale.length) + pal.scale.length) % pal.scale.length];
      musPiano(musMidiHz(pal.root + 12 * oc + sd), at,
        n.vel * 0.55 * trim * q * boost, n.dur * 1.8);
      musBook('piano', n.vel * 0.55 * trim * q * boost, n.dur * 1.8);
    }
  }
  /* 2 — a low pad, under the opening phrases only */
  if (has(2) && (only === 2 || ph === 0)) {
    voices.push('pad');
    /* the pad may start a breath before the phrase, but never before now.
       It runs about the length of the phrase it opens and is gone before
       the next one begins, so the gap between phrases stays a gap. */
    const padAt = Math.max(AUD.ctx.currentTime + 0.02, t0 - 0.4);
    const padDur = span * 0.85 + 1.6;
    musPad(musMidiHz(pal.root - 12), padAt, padDur, 0.041 * trim * q * boost);
    musBook('pad', 0.041 * trim * q * boost, padDur);
  }
  /* 3 — strings, a bowed fifth through the opening phrase. On the middle
     rungs (prepolish5) the string only VISITS: a gentle phrase now and
     then, on a thirty-to-sixty-second cadence of its own, never
     continuous — the silence windows and the moment shape are untouched,
     because the visit still lives inside a moment that was going to
     happen anyway. At the top characters (rungs 4 and 5) it keeps its
     old law: the opening phrase of every moment. A debut always sounds
     and stamps the cadence. */
  if (has(3) && (only === 3 || ph === 0)) {
    const visiting = tier < 4;
    if (!visiting || only === 3 || S.t >= (MUS.stringNext || 0)) {
      voices.push('strings');
      const strDur = Math.max(6.0, span * 0.64 + 1.0);
      musStrings(musMidiHz(pal.root - 5), t0 + 0.8, strDur, 0.052 * trim * q * boost, 4.5 + r() * 0.8);
      musBook('strings', 0.052 * trim * q * boost, strDur);
      if (visiting) MUS.stringNext = S.t + 30 + Math.random() * 30;
    }
  }
  /* 4 — the counter-melody, the tune's contour turned upside down */
  if (has(4)) {
    voices.push('counter');
    const base = notes.length ? notes[0].deg : 0;
    let ct = t0 + 1.1;
    for (let i = 0; i < notes.length; i += 2) {
      const inv = base - (notes[i].deg - base);
      const oct = Math.floor(inv / pal.scale.length);
      const st = pal.scale[((inv % pal.scale.length) + pal.scale.length) % pal.scale.length];
      const dur = 2.6 + r() * 1.5;
      musCounterNote(musMidiHz(pal.root + 12 * oct + st), ct, 0.040 * trim * q * boost, dur);
      musBook('counter', 0.040 * trim * q * boost, dur);
      ct += dur * 0.78;
      if (ct > end) break;
    }
  }
  /* 5 — the whole ensemble, with a low bell for a floor */
  if (has(5)) {
    voices.push('bell');
    /* struck a beat into the phrase, not on its first note: two transients
       landing together is the one thing that can push the ensemble's peak
       above the music box's */
    musBell(musMidiHz(pal.root - 12), t0 + 0.9, 0.030 * trim * q * boost);
    musBook('bell', 0.030 * trim * q * boost, 9);
  }
  SCORE.lastVoices = voices;
  /* what each phrase of the current moment actually used, in order — the
     verifier reads it to see the debut standing alone in the first one */
  if (SCORE.lastMoment) SCORE.lastMoment.push(voices.slice());
  return voices;
}

/* a moment: the voice rises, speaks two or three short phrases, withdraws */
function audMoment(kind) {
  AUD.moments = AUD.moments || {};
  AUD.moments[kind] = (AUD.moments[kind] || 0) + 1;
  const cd = MUS.cd.get(kind) || 0;
  if (S.t < cd) return;
  /* MUTE, NEVER STOP: the score does not care whether you are listening.
     A moment behind a muted layer still rises, still speaks its phrases and
     still withdraws — turning MUSIC back on drops you into the middle of it,
     and if the score holds silence right then, the next trigger sounds. */
  if (!AUD.ctx || !MUS.built || AUD.themeSrc) return;
  const c = AUD.ctx;
  if (c.currentTime < MUS.quietUntil) return;             /* one weather at a time */
  /* ROUND 11 — A MOMENT THAT CANNOT BE SPOKEN DOES NOT SPEND ITS TURN.
     The cooldown used to be stamped above these two guards, so a golden
     hour arriving while the trail was already singing burned its two whole
     minutes without a note. Over a scripted five-minute walk, thirty-two
     triggers bought four moments and the score sat through stretches of
     thirty, fifty and seventy seconds with something to say and nothing
     allowed to say it — the gate open barely a third of the walk, which is
     how a build that sounded for every instant its gate was open could
     still miss the floor. The stamp belongs where a moment actually
     begins. It is paired with the longer silence below: a quiet that no
     longer eats a trigger can afford to be a real quiet again. */
  MUS.cd.set(kind, S.t + (MUS_MOMENT_CD[kind] || 60));
  const t0 = c.currentTime + 0.35;
  MUS.swell.gain.cancelScheduledValues(c.currentTime);
  /* the gate opens WITH the first tine, not a third of a second before it:
     round 11 found the swell rising into an empty room, which is a small
     hole at the head of every moment and, worse, a gate that claims to be
     open while nothing has been struck */
  MUS.swell.gain.setValueAtTime(Math.max(0.0001, MUS.swell.gain.value), c.currentTime);
  MUS.swell.gain.setValueAtTime(Math.max(0.0001, MUS.swell.gain.value), t0);
  MUS.swell.gain.linearRampToValueAtTime(1, t0 + 1.4);    /* it rises… */
  /* THE SCORE GROWS WITH THE JOURNEY. The same three phrases, the same
     envelope, the same silence after — only the number of voices inside
     them changes. A voice earned since the last moment takes that first
     phrase alone and a little exposed, so the ear catches the newcomer;
     it costs the moment nothing, because it replaces the phrase rather
     than adding one. */
  let debut = SCORE.debut;
  if (debut > SCORE.tier) { SCORE.debut = -1; debut = -1; }   /* never a silent phrase */
  SCORE.lastMoment = [];
  SCORE.acct = { box: 0, piano: 0, pad: 0, strings: 0, counter: 0, bell: 0 };
  /* ROUND 11 — the gaps are drawn BEFORE the phrases, because the tine that
     closes a phrase has to be told how far to ring: exactly across the gap
     that follows it, with a few seconds of margin, and for the last phrase
     across the whole withdrawal. Same gaps, same phrases, same envelope,
     same silence after — only the instrument now sustains through its own
     moment instead of dropping out of it. */
  const gapA = 2.5 + Math.random() * 2.5;
  const gapB = 3 + Math.random() * 2;
  /* the margins are generous on purpose: a tine that rings a second or two
     longer than it strictly needs to costs nothing — the swell is what ends
     a moment, and every oscillator has stopped before the next one may
     start (quietUntil is at least MUS_FALL + 8 s past the last phrase). A
     tine that rings a second too SHORT opens a hole, which is the whole
     bug. Measured at every rung by qa/r11-moment.mjs. */
  const holdLast = MUS_FALL + 9;
  /* which VOICE a rung introduces (prepolish5): rung 1 is the box itself
     going oftener, so its debut phrase is the busier box alone; rung 2
     brings the string (voice 3), rung 3 the pad (voice 2), rung 4 the
     counter, rung 5 the bell. */
  const DEBUT_VOICE = [0, 0, 3, 2, 4, 5];
  let t = musPhrase(t0, false, debut > 0
    ? { only: DEBUT_VOICE[debut], i: 0, hold: gapA + 7 }
    : { i: 0, hold: gapA + 7 });
  if (debut > 0) {
    SCORE.debut = -1; SCORE.debuts++;
    SCORE.named = SCORE_TIERS[debut].name; SCORE.namedT = S.t;
    refreshScoreUI();
  }
  /* the second phrase always gets the long ring: it covers the gap to a
     third phrase and the whole withdrawal equally well, so the moment does
     not have to decide its own length before it has spoken */
  t = musPhrase(t + gapA, false, { i: 1, hold: holdLast });
  /* A MOMENT SPEAKS UNTIL IT HAS SAID ENOUGH — two phrases or three, as it
     always was, but the coin is no longer blind. The number of notes in a
     phrase is drawn from the hour, so two phrases can run twelve seconds or
     nineteen; tossing for a third on top of that put five-minute walks at
     39.9 % and 52.7 % of the same gate. The third phrase now answers the
     two before it: if they were brief, the moment has more to say. Same
     phrases, same gaps, same envelope — only the moment's LENGTH is steady
     now, and with it the duty cycle. */
  if (t - t0 < MUS_SAY) t = musPhrase(t + gapB, true, { i: 2, hold: holdLast });
  MUS.swell.gain.setValueAtTime(1, t);
  MUS.swell.gain.linearRampToValueAtTime(0.0001, t + MUS_FALL);  /* …and withdraws */
  MUS.phraseEnd = t + MUS_FALL;
  /* THE SILENCE IS PART OF THE PARTITION, AND IT IS LONG AGAIN.
     Round 8 cut this from 19-37 s to 8-18 s because a long quiet ate four
     triggers in five — but that was only true while a refused trigger
     burned its cooldown. It no longer does (see above), so a long quiet now
     DELAYS the next moment instead of cancelling it, and the score can
     afford twenty-two to thirty-six seconds of genuine nothing between
     weathers. Which is the whole doctrine: a moment of about twenty-five
     seconds, then half a minute of trail. (Nineteen to thirty-one here;
     the wait for the next trigger to arrive adds several more on any real
     walk, and the measured silences between moments run 23-47 s.) */
  MUS.quietUntil = t + MUS_FALL + 19 + Math.random() * 12;
  AUD.playCount['moment:' + kind] = (AUD.playCount['moment:' + kind] || 0) + 1;
}

/* the recorded theme — kept for the three rarest moments only */
function audTheme(which) {
  if (AUD.themePlayed[which]) return;
  if (!AUD.ctx) { AUD.pendingTheme = which; return; }
  /* MUTE, NEVER STOP: it plays behind a muted layer like everything else, so
     unmuting lands you inside it. But a gift this rare is only *spent* once
     it has actually been heard — if the whole theme goes by in silence the
     moment is still owed, and the trail will offer it again. */
  AUD.themePlayed[which] = true;
  AUD.themeWhich = which;
  AUD.themeHeard = AUD.mus.on;
  if (AUD.themeHeard) lsSet('longway.theme.' + which, '1');
  AUD.evCount['theme:' + which] = (AUD.evCount['theme:' + which] || 0) + 1;
  /* the stage is cleared for it, whichever of the three occasions called:
     any music-box phrase still in the air is eased away and the generative
     voice stays out until the theme has run its length */
  if (AUD.ctx && MUS.swell) {
    const t0 = AUD.ctx.currentTime;
    MUS.swell.gain.cancelScheduledValues(t0);
    MUS.swell.gain.setValueAtTime(MUS.swell.gain.value, t0);
    MUS.swell.gain.linearRampToValueAtTime(0.0001, t0 + 2.5);
    MUS.quietUntil = Math.max(MUS.quietUntil, t0 + 172);
  }
  fetch('music/theme.ogg')
    .then(r => { if (!r.ok) throw new Error('http ' + r.status); return r.arrayBuffer(); })
    .then(ab => AUD.ctx.decodeAudioData(ab))
    .then(b => {
      const c = AUD.ctx;
      const src = c.createBufferSource(); src.buffer = b;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.linearRampToValueAtTime(0.62, c.currentTime + 2.5);
      src.connect(g); g.connect(AUD.mus.gain);
      src.start();
      AUD.themeSrc = src;
      AUD.playCount['theme:' + which] = (AUD.playCount['theme:' + which] || 0) + 1;
      src.onended = () => {
        if (AUD.themeSrc === src) AUD.themeSrc = null;
        /* it went by behind a mute: the moment is owed, not spent */
        if (!AUD.themeHeard) {
          AUD.themePlayed[which] = false;
          lsSet('longway.theme.' + which, '');
        }
      };
    })
    .catch(e => { AUD.decodeFail.push('theme: ' + e.message); });
}

function audLEArrive() {
  audEv('leArrive');
  /* the shore takes the stage alone: any music-box phrase in the air is
     eased away first, and the voice stays quiet while the theme plays */
  if (AUD.ctx && MUS.swell) {
    const t = AUD.ctx.currentTime;
    MUS.swell.gain.cancelScheduledValues(t);
    MUS.swell.gain.setValueAtTime(MUS.swell.gain.value, t);
    MUS.swell.gain.linearRampToValueAtTime(0.0001, t + 2.5);
    MUS.quietUntil = t + 200;
  }
  if (!AUD.themePlayed.le) audTheme('le');
}
function audCheckComplete() {
  if (AUD.themePlayed.complete) return;
  if (trailComplete()) { audEv('trailComplete'); audTheme('complete'); }
}
/* the second of the three rarest moments: every page of one community
   walked. The certificate goes in the pack and the theme answers it once. */
function audCheckComm(ci) {
  if (AUD.themePlayed.comm || ci < 0) return;
  if (commComplete(ci)) { audEv('commComplete'); audTheme('comm'); }
}

/* ---------------- the two toggles ---------------- */
/* MUTE, NEVER STOP. A toggle rides its own layer's gain and touches nothing
   else: the context is never suspended, no timer is cancelled, no node is
   torn down, no source is stopped. Behind a muted layer the programme keeps
   running — the wind keeps blowing, the moments keep rising, the phrases
   keep being scheduled, the theme keeps playing — so turning it back on
   lands you inside whatever the trail holds at that instant, eased in over
   AUD_FADE_IN and never cut in. */
function setAudioLayer(which, on) {
  const L = AUD[which];
  L.on = on;
  lsSet(which === 'sfx' ? 'longway.sfx' : 'longway.mus', on ? '1' : '0');
  if (on && AUD.unlocked) audEnsureCtx();
  if (AUD.ctx && L.gain) {
    const t = AUD.ctx.currentTime;
    const g = L.gain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    if (on) g.linearRampToValueAtTime(1, t + AUD_FADE_IN);
    else {
      g.linearRampToValueAtTime(0, t + AUD_FADE_OUT);      /* eased down… */
      g.setValueAtTime(0, t + AUD_FADE_OUT);               /* …to a true zero */
    }
  }
  refreshAudioUI();
  if (REDUCED) renderStep();
}
function toggleSfx() { setAudioLayer('sfx', !AUD.sfx.on); }
function toggleMusic() { setAudioLayer('mus', !AUD.mus.on); }
function refreshAudioUI() {
  const pairs = [
    ['btnSfx', 'SFX · ' + (AUD.sfx.on ? 'ON' : 'OFF'), !AUD.sfx.on],
    ['btnMusic', 'MUSIC · ' + (AUD.mus.on ? 'ON' : 'OFF'), !AUD.mus.on],
    ['keySfx', 'TRAIL SOUND — ' + (AUD.sfx.on ? 'ON' : 'OFF'), !AUD.sfx.on],
    ['keyMus', 'MUSIC — ' + (AUD.mus.on ? 'ON' : 'OFF'), !AUD.mus.on]
  ];
  for (const [id, txt, off] of pairs) {
    const b = document.getElementById(id);
    if (b) { b.textContent = txt; b.classList.toggle('off', off); }
  }
}
document.getElementById('btnSfx').addEventListener('click', () => { audUnlock(); toggleSfx(); });
document.getElementById('btnMusic').addEventListener('click', () => { audUnlock(); toggleMusic(); });

/* ---------------- the per-frame breath of the sound ---------------- */
function audioTick(dt) {
  if (AUD.px == null) AUD.px = S.x;

  /* how much of the corpus this walk has actually covered — the one thing
     that decides how many voices a moment may use. Read about once a
     second; nothing else in the frame touches it. */
  if (window.__scoreReady) {
    SCORE.checkIn -= dt;
    if (SCORE.checkIn <= 0) { SCORE.checkIn = 1; scoreUpdate(true); }
  }

  /* the recorded theme is spent the first instant it is genuinely audible */
  if (AUD.themeSrc && AUD.mus.on && !AUD.themeHeard) {
    AUD.themeHeard = true;
    lsSet('longway.theme.' + AUD.themeWhich, '1');
  }

  /* Walking itself makes no sound: the trail is walked in silence, and what
     you hear is the land — the wind on this stretch, a stone you pass, a
     greeting, the dog. (Owner's order; no footstep sample is bundled.) */

  /* waymarker stones chime as you pass them */
  if (Math.abs(S.x - AUD.px) > 0.01 && S.x < M.totalPx) {
    const lo = Math.min(AUD.px, S.x), hi = Math.max(AUD.px, S.x);
    const p0 = pageAt(clamp(lo, 0, M.totalPx - 1)), p1 = pageAt(clamp(hi, 0, M.totalPx - 1));
    const scan = p0 === p1 ? [p0] : [p0, p1];
    for (const pp of scan) {
      for (const st of pp.stones) {
        if (st.x <= lo || st.x > hi) continue;
        if ((st.sndCD || 0) > S.t) continue;
        st.sndCD = S.t + 30;
        audEv('stone', st.x, st.kind === 'mile' ? 0.8 : 1);
      }
    }
  }
  AUD.px = S.x;

  /* THE DOG IS MOSTLY SILENT (owner's order). Ordinary walking makes no
     dog sound at all: no pant loop, no trotting noise, no snuffle at every
     door she passes. Round 12 put the rule where it belongs — her voice
     waits for the stop. She speaks only at genuine events, only once you
     have halted and she has halted with you (stoppedTogether(), the pant
     alone excepted), never twice inside the floor below, and rarely even
     then — and never at the shore, which keeps its silence. */
  if (!REDUCED && !S.atLE && DOG.on) {
    if (AUD.barkAt === 0) AUD.barkAt = S.t + 65 + Math.random() * 75;
    /* a contented sigh, but only once she has genuinely settled beside a
       long read, and then seldom */
    if ((DOG.pose === 'sit' || DOG.pose === 'sleep') && S.idleT > 25 &&
        Math.abs(DOG.x - S.x) < 170 && S.t > AUD.sighAt) {
      AUD.sighAt = S.t + 75 + Math.random() * 65;
      dogVoice('dogsigh', DOG.x);
    }
    /* the light happy pant, kept for the rare occasion she has actually
       run: a long gap closed at speed, and not again for two minutes.
       Round 12 took away its exemption from the stop. The gap that earns it
       is opened by a door, a fast travel or the index — and after one of
       those you are standing where you landed, which is exactly when she
       arrives puffing. Holding an arrow key through a teleport is not that
       moment, and it was the last thing in the build that made a noise while
       the legs were moving. She also only pants about a run she has just
       had: twelve seconds after it, the breath is her own business. */
    if (DOG.caught && S.t - (DOG.caughtAt || 0) > 12) DOG.caught = 0;
    if (DOG.caught && stoppedTogether() && S.t > AUD.pantAt) {
      DOG.caught = 0;
      AUD.pantAt = S.t + 110 + Math.random() * 90;
      dogVoice('dogpant', DOG.x);
    }
    /* AND THE SPONTANEOUS BARK ON THE MOVE (the owner refined his earlier
       silence order — she must not be quasi-mute): unscheduled, roughly
       once every minute or two of ACTIVE play, on its own randomised
       clock. Active play means you are walking or only just stopped —
       a long read or a sleeper never collects barks. Ordinary steady
       walking still carries no pant loop and no trotting noise; this is
       a voice, not a soundtrack. */
    if (S.t > AUD.barkAt && DOG.pose !== 'sleep' && SLP.stage < 2 &&
        DOG.state === 'follow' &&
        (Math.abs(S.vx) > 1 || S.idleT < 10) && Math.abs(DOG.x - S.x) < 520) {
      /* a bark the courtesy floor refuses does not spend the clock —
         it retries in a few seconds; only a bark that SOUNDED spaces
         the next one by its minute or two */
      if (dogVoice('dogbark', DOG.x)) AUD.barkAt = S.t + 65 + Math.random() * 75;
      else AUD.barkAt = S.t + 4 + Math.random() * 4;
    } else if (AUD.barkAt > 0 && S.t > AUD.barkAt + 6 &&
               (Math.abs(S.vx) > 1 || S.idleT < 10)) {
      /* the clock ripened while she was busy elsewhere (mid-sniff, or
         trailing a stride) — the voice is not lost: it slides a few
         seconds at a time and lands when she is next at your side.
         Only ACTIVE play keeps the clock warm; a sleeper or a long
         read still never collects barks. */
      AUD.barkAt = S.t + 3 + Math.random() * 4;
    }
  }

  if (!AUD.ctx) return;
  const wN = S.lastWN == null ? DAY.wts.n : S.lastWN;

  /* discrete gusts ride the derived wind */
  if (!REDUCED && S.wind > 0.12 && !S.atLE && S.t > AUD.gustAt) {
    AUD.gustAt = S.t + lerp(9.5, 3.4, S.wind) * (0.7 + Math.random() * 0.6);
    audEv('gust', S.x + (Math.random() - 0.35) * 520, 0.0333 + 0.1267 * S.wind);
  }

  /* beds: wind under everything, crickets after dark, rain when a front is
     over you — and at Land's End they all bow out: the shore keeps its
     silence. THE FOG FALLS SILENT: mist and fog carry no voice at all. */
  if (AUD.beds) {
    const atLE = !!S.atLE;
    /* MUTE, NEVER STOP: what the beds do is decided by the land, never by
       the toggle. The wind keeps blowing behind a muted layer — only the
       layer's own gain is at zero — so turning SFX back on puts you inside
       the weather that was already there.
       One third of the gain the mix first reached for: the wind is weather. */
    audBedTarget('wind', atLE ? 0.0167 : 0.10 * Math.pow(S.wind, 1.2));
    audBedTarget('crickets', nightRamp(wN) * (atLE ? 0.035 : 0.20));
    /* rain on the path, gentle, and fading with the front that brought it */
    audBedTarget('rain', RAIN_BED_MAX * WX.rain);
    if ((AUD.beds.wind.target || 0) > 0.004) audBedLoop('wind', 'wind_bed', false);
    if ((AUD.beds.crickets.target || 0) > 0.004) audBedLoop('crickets', 'crickets', true);
    if ((AUD.beds.rain.target || 0) > 0.004) audBedLoop('rain', 'rain', false);
  }

  /* music as weather: golden hour and nightfall are moments */
  const g = DAY.wts.g, n = DAY.wts.n;
  if (MUS.lastG != null && g > 0.5 && MUS.lastG <= 0.5) audMoment('golden');
  if (MUS.lastN != null && n > 0.5 && MUS.lastN <= 0.5) audMoment('night');
  MUS.lastG = g; MUS.lastN = n;

  /* arriving at an overlook's table is a moment too */
  const p = S.page;
  if (p && p.overlook && !S.atLE && Math.abs(p.overlook.x - S.x) < LOOK_RANGE) {
    const at = MUS.lookAt.get(p.slug) || 0;
    if (S.t > at) { MUS.lookAt.set(p.slug, S.t + 300); audMoment('overlook'); }
  }
}

/* per-layer RMS from the analysers — the verifier's ear */
function audRMS() {
  const out = {};
  for (const which of ['sfx', 'mus']) {
    const L = AUD[which];
    if (!L.an) { out[which] = 0; continue; }
    const a = new Float32Array(L.an.fftSize);
    L.an.getFloatTimeDomainData(a);
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * a[i];
    out[which] = Math.sqrt(s / a.length);
  }
  return out;
}

window.__aud = {
  get state() {
    return {
      unlocked: AUD.unlocked, ctx: !!AUD.ctx,
      ctxState: AUD.ctx ? AUD.ctx.state : 'none',
      sfxOn: AUD.sfx.on, musOn: AUD.mus.on,
      decoded: AUD.decoded, decodeFail: AUD.decodeFail.slice(),
      ev: Object.assign({}, AUD.evCount),
      played: Object.assign({}, AUD.playCount),
      moments: Object.assign({}, AUD.moments || {}),
      themePlayed: Object.assign({}, AUD.themePlayed),
      themeActive: !!AUD.themeSrc,
      themeHeard: !!AUD.themeHeard,
      sfxGain: AUD.sfx.gain ? AUD.sfx.gain.gain.value : null,
      musGain: AUD.mus.gain ? AUD.mus.gain.gain.value : null,
      bedTargets: AUD.beds ? {
        wind: AUD.beds.wind.target || 0,
        crickets: AUD.beds.crickets.target || 0,
        rain: AUD.beds.rain.target || 0
      } : null,
      dogCeil: DOG_CEIL, dogGain: Object.assign({}, DOG_GAIN),
      swell: MUS.swell ? MUS.swell.gain.value : 0,
      quietUntil: MUS.quietUntil, phraseEnd: MUS.phraseEnd,
      ctxTime: AUD.ctx ? AUD.ctx.currentTime : 0,
      lastMix: AUD.lastMix || null,
      dogTrace: AUD.dogTrace.slice(),
      dogFloorAt: AUD.dogFloorAt, sniffAt: AUD.sniffAt, barkAt: AUD.barkAt,
      log: AUD.log.slice(-40)
    };
  },
  /* THE MIX, AS ARITHMETIC (round 11). Every voice's loudest possible peak
     at your feet: the decoded file's own peak times the largest gain the
     build ever plays it at. Nothing here is a constant retyped for a test —
     it reads the same numbers the mix reads, so a probe cannot agree with a
     comment while disagreeing with the sound. qa/r11-levels.mjs asserts the
     order: the wind is the quietest thing on the trail, and no voice of the
     dog passes a gust. */
  get levels() {
    const pk = (n) => {
      const b = AUD.buf.get(n);
      if (!b) return null;
      const ch = b.getChannelData(0);
      let m = 0;
      for (let i = 0; i < ch.length; i++) { const v = Math.abs(ch[i]); if (v > m) m = v; }
      return m;
    };
    const L = {};
    const put = (label, name, gain) => { const p = pk(name); if (p != null) L[label] = +(p * gain).toFixed(5); };
    /* the beds, at the loudest target audioTick can ever hand them */
    put('wind bed', 'wind_bed', 0.10);
    put('gust', 'gust', (0.0333 + 0.1267) * GUST_TRIM);
    put('crickets', 'crickets', 0.20);
    put('rain', 'rain', RAIN_BED_MAX);
    /* the dog, each voice at its own clamped gain */
    for (const k of Object.keys(DOG_GAIN)) {
      put('dog ' + k, 'dog_' + k + (SFX_VARIANTS['dog_' + k] > 1 ? '_0' : ''), Math.min(DOG_GAIN[k], DOG_CEIL));
    }
    put('snore', 'snore', SNORE_GAIN);
    put('dog snore', 'snore', DOGSNORE_GAIN);
    /* the events of the trail furniture */
    put('jump', 'jump', 0.32); put('land', 'land', 0.30);
    put('spring', 'spring', 0.42 * 0.6);                 /* prepolish5: -40 % */
    put('gate', 'gate_open', (0.5 / 3) * 0.7);           /* prepolish5: -30 % */
    put('gate travel', 'gate_travel', 0.45 / 3);
    put('greeting', 'greet', 0.5); put('register', 'register_open', 0.5);
    put('pen', 'pen', 0.55); put('waymarker', 'waymarker', 0.38);
    return L;
  },
  rms: audRMS,
  ev: audEv,
  unlock: audUnlock,
  setLayer: setAudioLayer,
  moment: audMoment,
  theme: audTheme,
  resetThemes() {
    AUD.themePlayed.le = false; AUD.themePlayed.comm = false; AUD.themePlayed.complete = false;
    lsSet('longway.theme.le', ''); lsSet('longway.theme.comm', ''); lsSet('longway.theme.complete', '');
  },
  checkComm: (ci) => audCheckComm(ci)
};

/* the second keyboard: F and M toggle the layers; L in a gate map sails
   to Land's End. Never while typing into a field. */
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (S.overlay === 'gatemap' && k === 'l') {
    closeOverlays();
    audEv('gateTravel');
    travelToLE();
    e.preventDefault();
    return;
  }
  if (S.overlay && S.overlay !== 'key') return;   /* typing stays typing */
  if (k === 'f') { toggleSfx(); e.preventDefault(); }
  else if (k === 'm') { toggleMusic(); e.preventDefault(); }
});

refreshAudioUI();
/* the score model is complete: collectPage and audioTick may read it now */
window.__scoreReady = 1;
scoreUpdate(false);

/* ==================================================================== */
/* ROUND 9 — WEATHER THAT PASSES, A WALKER WHO SLEEPS, ROOM TO READ      */
/*                                                                       */
/* Three owner orders, all of them data-true and all of them eased:      */
/*  (1) THE SKY REMEMBERS THE QUIET MONTHS. The weather clock walks the  */
/*      documentation's own calendar — every month from the first commit */
/*      in the corpus to the last — and the months nobody tended bring   */
/*      grey and rain while the busy months clear the sky. Place-bound   */
/*      winter frost is untouched: that belongs to the ground, not the   */
/*      sky.                                                             */
/*  (2) STAND STILL AND THE WALKER SLEEPS. She settles, she nods off     */
/*      with the dog curled beside her, and then she snores — three      */
/*      eased stages announced by nothing but the drawing.               */
/*  (3) ROOM TO READ. The trail and the page share the window half and   */
/*      half, or side by side; the choice keeps for the visit.           */
/* ==================================================================== */

/* ---------------- the layout: two ways to hold the window ------------ */
function layoutIsSide() { return LAY.mode === 'side' && window.innerWidth >= LAY_MIN_W; }

/* the one place that decides the shape of the window, and the only one
   that writes the CSS custom properties the chrome is positioned by */
function applyLayout() {
  const side = layoutIsSide();
  const changed = LAY.eff !== (side ? 'side' : 'stack');
  LAY.eff = side ? 'side' : 'stack';
  document.body.classList.toggle('lay-side', side);
  const w = window.innerWidth, h = window.innerHeight;
  const tw = side ? Math.round(w * LAY_SIDE) : w;
  const dh = side ? 0 : Math.round(h * DOCK_FRAC);
  const root = document.documentElement.style;
  root.setProperty('--trail-w', tw + 'px');
  root.setProperty('--dock-h', dh + 'px');
  /* ROUND 11 — how tall the HUD actually is, right now, at this width and
     in this layout. The transient toast is placed under it rather than at a
     flat 76 px: at 1440 stacked that flat number clipped the PACK chip,
     under about 1000 px it ran across PACK, GUIDE and SFX, and side by side
     — where the whole HUD is squeezed into the trail's half — it landed on
     the hour dial, which is exactly where the layout toast appears. Read
     after --trail-w is written, because the width is what makes the HUD
     wrap. */
  const hudEl = document.getElementById('hud');
  if (hudEl) {
    const hh = Math.round(hudEl.getBoundingClientRect().height);
    if (hh > 0) root.setProperty('--hud-h', hh + 'px');
  }
  if (changed) refreshLayoutUI();
  return { w: tw, h: h - dh };
}

function setLayout(mode) {
  LAY.mode = mode === 'side' ? 'side' : 'stack';
  lsSet('longway.layout', LAY.mode);
  resize();
  refreshLayoutUI();
  /* the strip stays locked to the block you stand in, in both layouts:
     the dock has a new height, so the block is re-centred in it */
  if (dockPage && !S.atLE) {
    const bi = S.bi < 0 ? 0 : S.bi;
    S.bi = -1;
    userScrollT = -1e9;
    updateBlock(dockPage, bi);
  }
  needsDraw = true;
  if (REDUCED) renderStep();
}
function toggleLayout() {
  setLayout(LAY.mode === 'side' ? 'stack' : 'side');
  toast(LAY.eff === 'side'
    ? 'SIDE BY SIDE — TRAIL LEFT, PAGE RIGHT'
    : (LAY.mode === 'side'
      ? 'THE WINDOW IS TOO NARROW FOR SIDE BY SIDE — STACKED'
      : 'STACKED — TRAIL ABOVE, PAGE BELOW'));
}
function refreshLayoutUI() {
  const side = LAY.eff === 'side';
  const b = document.getElementById('btnLayout');
  if (b) b.textContent = 'LAYOUT · ' + (side ? 'SIDE' : 'STACK');
  const k = document.getElementById('keyLayout');
  if (k) k.textContent = 'READING LAYOUT — ' + (side ? 'SIDE BY SIDE' : 'STACKED') +
    (LAY.mode === 'side' && !side ? ' (WINDOW TOO NARROW)' : '');
}

/* ---------------- the weather clock: the corpus's own calendar ------- */
const MONTH_NAMES = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

function buildWeather() {
  /* Every month between the first commit in the corpus and the last. A
     month's MARKS are how many pages were opened or last touched in it —
     580 real dates read out of provenance.json, none of them invented.
     A month with no marks is a month the documentation went untended. */
  const marks = new Map();
  let lo = null, hi = null;
  for (const p of M.pages) {
    for (const d of [p.prov.first, p.prov.last]) {
      if (!d || d.length < 7) continue;
      const key = d.slice(0, 7);
      marks.set(key, (marks.get(key) || 0) + 1);
      if (lo === null || key < lo) lo = key;
      if (hi === null || key > hi) hi = key;
    }
  }
  WX.months = [];
  if (lo === null) { WX.months.push({ key: '', y: 0, m: 1, marks: 1, a: 1, grey: 0, wet: 0, state: 'clear' }); WX.quiet = 0; return; }
  const y0 = +lo.slice(0, 4), m0 = +lo.slice(5, 7);
  const y1 = +hi.slice(0, 4), m1 = +hi.slice(5, 7);
  const n = (y1 - y0) * 12 + (m1 - m0) + 1;
  let max = 1;
  for (const v of marks.values()) if (v > max) max = v;
  WX.max = max;
  for (let i = 0; i < n; i++) {
    const y = y0 + Math.floor((m0 - 1 + i) / 12), m = (m0 - 1 + i) % 12 + 1;
    const key = y + '-' + (m < 10 ? '0' : '') + m;
    const c = marks.get(key) || 0;
    const a = c ? Math.log(1 + c) / Math.log(1 + max) : 0;
    WX.months.push({
      key, y, m, marks: c, a,
      grey: c === 0 ? 1 : clamp(1 - a / WX_CLEAR, 0, 1),
      wet: c === 0 ? 1 : 0,
      state: c === 0 ? 'shower' : (a < WX_CLEAR ? 'overcast' : 'clear')
    });
  }
  /* MORE WEATHER (wave 3) — four new fronts, every one read off the same
     real calendar. The rules, stated once: a QUIET WINTER month (December
     to February, nobody came) SNOWS instead of raining; a THIN AUTUMN
     month (October or November, untended or well under the clear bar)
     rolls a FOG bank in; the middle of every quiet streak of three months
     or longer breaks as a short THUNDERSTORM (a non-snow month of the
     streak, when it has one); and a RAINBOW is not a month at all — it is
     the moment a shower clears under a low sun, and it is rare. */
  for (const mm of WX.months) {
    if (mm.marks === 0 && (mm.m === 12 || mm.m <= 2)) {
      mm.state = 'snow'; mm.wet = 0; mm.grey = 0.72;
    } else if ((mm.m === 10 || mm.m === 11) && (mm.marks === 0 || mm.a < WX_CLEAR * 0.55)) {
      mm.state = 'fog'; mm.wet = 0; mm.grey = Math.max(mm.grey, 0.55);
    }
  }
  for (let i = 0; i < WX.months.length;) {
    if (WX.months[i].marks !== 0) { i++; continue; }
    let j = i;
    while (j < WX.months.length && WX.months[j].marks === 0) j++;
    if (j - i >= 3) {
      let pick = null;
      const mid = (i + j - 1) >> 1;
      for (let st2 = 0; st2 < j - i; st2++) {
        const cand = WX.months[i + (((mid - i) + st2) % (j - i))];
        if (cand.state !== 'snow') { pick = cand; break; }
      }
      if (pick) { pick.state = 'storm'; pick.wet = 1; pick.grey = 1; }
    }
    i = j;
  }
  WX.quiet = WX.months.filter(mm => mm.marks === 0).length;
  WX.first = WX.months[0].key; WX.last = WX.months[n - 1].key;
  WX.idx = 0;
  WX.state = WX.months[0].state;
  /* start the sky where the month already is — no opening lurch */
  WX.grey = WX.months[0].grey; WX.wet = WX.months[0].wet;
  WX.wetness = WX.wet;
}
function wxMonth() { return WX.months[WX.idx] || WX.months[0] || { key: '', m: 1, y: 0, marks: 0, state: 'clear' }; }
function wxSpanLabel(which) {
  const k = which ? WX.last : WX.first;
  if (!k) return '';
  return MONTH_NAMES[+k.slice(5, 7) - 1] + ' ' + k.slice(0, 4);
}
function wxLabel() {
  const mm = wxMonth();
  /* the label answers the sky you can actually see. A month a hair under
     the clear threshold really is cloud, but it is HIGH cloud: calling it
     OVERCAST while the light stays open read as a lie (round 12). Three
     honest names across the one state, cut at the grey the sky is drawn
     with, not at a second invented number. */
  const what = mm.state === 'shower' ? 'A SHOWER'
    : mm.state === 'snow' ? 'SNOW'
    : mm.state === 'fog' ? 'A FOG BANK'
    : mm.state === 'storm' ? 'A THUNDERSTORM'
    : (mm.state === 'overcast'
        ? (mm.grey < 0.22 ? 'HIGH CLOUD' : (mm.grey < 0.62 ? 'OVERCAST' : 'HEAVY CLOUD'))
        : 'CLEAR');
  const who = mm.marks
    ? fmt(mm.marks) + (mm.marks === 1 ? ' PAGE TOUCHED' : ' PAGES TOUCHED')
    : 'NOBODY CAME';
  return 'SKY: ' + MONTH_NAMES[mm.m - 1] + ' ' + mm.y + ' · ' + who + ' · ' + what;
}

function tickWeather(dt) {
  if (!WX.months.length) return;
  WX.mt += dt;
  const per = REDUCED ? WX_MONTH_S / 8 : WX_MONTH_S;   /* calm: the clock steps when you do */
  while (WX.mt >= per) {
    WX.mt -= per;
    WX.idx = (WX.idx + 1) % WX.months.length;
    WX.turned++;
    const st = wxMonth().state;
    if (st !== WX.state) {
      /* the colour coming back is one of the moments the music answers */
      if (st === 'clear') { WX.clearings++; audMoment('clearing'); }
      if (st === 'shower') WX.showers++;
      if (st === 'snow') WX.snows++;
      if (st === 'fog') WX.fogs++;
      WX.state = st;
    }
  }
  const mm = wxMonth();
  const ease = (tc) => Math.min(1, (dt || 0) / tc);
  /* the thunderstorm is short: it breaks at the head of its month, rolls a
     few bolts, and is spent — and never during the first minute of a
     visit, which keeps its calm (the storm month then reads as cloud) */
  const stormMonth = mm.state === 'storm' && !REDUCED;
  if (stormMonth && WX.stormKey !== mm.key + ':' + WX.turned) {
    WX.stormKey = mm.key + ':' + WX.turned;
    if (S.t > 60) {
      WX.storms++;
      WX.stormUntil = S.t + 6.5 + Math.random() * 3;
      WX.boltNext = S.t + 1.2 + Math.random() * 2;
      WX.dogStartled = false;
    } else WX.stormUntil = 0;
  }
  const tSnow = mm.state === 'snow' ? 1 : 0;
  const tFog = mm.state === 'fog' ? 1 : 0;
  /* the storm rides its own short WINDOW, not the month that armed it —
     the month only ever opens the window (and a probe may open it too) */
  const tStorm = (!REDUCED && S.t < WX.stormUntil) ? 1 : 0;
  if (REDUCED) {
    WX.grey = mm.grey; WX.wet = mm.wet;
    WX.here = S.atLE ? 0 : 1; WX.wetness = WX.wet;
    /* calm: the new fronts cross as held frames — no flash, no arc */
    WX.snow = tSnow; WX.snowCover = tSnow * (S.atLE ? 0 : 1);
    WX.fog = tFog; WX.storm = 0; WX.rbA = 0;
    WX.wetPeak = 0;
  } else {
    WX.grey += (mm.grey - WX.grey) * ease(3.4);         /* fronts take seconds */
    /* ONE SKY AT A TIME (prepolish5). Diagnosed real, not a misread: these
       two easings used to run independently, and on the calendar's own
       2024-02 snow to 2024-03 shower handover both draw guards held for
       ~15 s — flakes and drops in one frame (qa/pp5-skydiag.mjs). The law
       now: the incoming precipitation holds its target at ZERO until the
       outgoing one has fully left the 0.012 draw floor, so a front hands
       over through a beat of clear air, with the same eased ramps on both
       sides. The floor is snapped to a true zero once crossed, because an
       exponential tail alone takes eleven seconds to clear it. */
    const clearGap = S.t < (WX.clearBeat || 0);
    /* the incoming type waits for a TRUE zero (the snap below provides
       one), then for the clear beat — not merely for the draw floor, or
       it would start rising inside the last half-inch of the old front */
    const wetTgt = (WX.snow > 0 || clearGap) ? 0 : mm.wet;
    const snowTgt = (WX.wet > 0 || clearGap) ? 0 : tSnow;
    WX.wet += (wetTgt - WX.wet) * ease(2.6);
    if (wetTgt === 0 && WX.wet > 0 && WX.wet < 0.010) {
      WX.wet = 0;
      /* the moment a type leaves, the sky holds a true clear beat before
         the next one may bow in — the handover reads as weather, not as
         a swap */
      WX.clearBeat = S.t + 2.5;
    }
    WX.here += ((S.atLE ? 0 : 1) - WX.here) * ease(0.9);
    const wetNow = WX.wet * WX.here;
    /* the path soaks in about ten seconds and takes half a minute to dry */
    WX.wetness += wetNow > 0.5 ? (1 - WX.wetness) * ease(9) : -WX.wetness * ease(32);
    WX.wetness = clamp(WX.wetness, 0, 1);
    WX.snow += (snowTgt - WX.snow) * ease(3.8);
    if (snowTgt === 0 && WX.snow > 0 && WX.snow < 0.010) {
      WX.snow = 0;
      WX.clearBeat = S.t + 2.5;
    }
    WX.fog += (tFog - WX.fog) * ease(4.6);
    WX.storm += (tStorm - WX.storm) * ease(tStorm ? 1.6 : 3.2);
    /* the ground whitens in over a minute, and thaws after */
    WX.snowCover += ((WX.snow * WX.here > 0.55 ? 1 : 0) - WX.snowCover) *
      ease(WX.snow * WX.here > 0.55 ? 55 : 75);
    WX.snowCover = clamp(WX.snowCover, 0, 1);
    /* bolts, while the storm is hot; the flash inks two frames, the roll
       follows it half a second to a second and a half later */
    if (WX.storm > 0.5 && S.t < WX.stormUntil && S.t > WX.boltNext && !S.atLE) {
      WX.boltNext = S.t + 3.5 + Math.random() * 4.5;
      WX.flashT = S.t; WX.bolts++;
      WX.thunderAt = S.t + 0.5 + Math.random() * 1.1;
      needsDraw = true;
    }
    if (WX.thunderAt && S.t > WX.thunderAt) {
      WX.thunderAt = 0;
      audEv('thunder', S.x + (Math.random() - 0.5) * 700);
      /* the dog startles once a storm, then settles */
      if (!WX.dogStartled && DOG.on && !S.atLE && Math.abs(DOG.x - S.x) < 560) {
        WX.dogStartled = true;
        DOG.state = 'shake'; DOG.stateT = 0;
        /* a startled dog yelps NOW — the courtesy floor yields to thunder,
           though the yip still sets it so nothing else lands on top */
        dogVoiceNow('dogyip', DOG.x);
      }
    }
    /* the rainbow: only as a shower clears under a low sun, and rare —
       never twice in an hour of play. The wet PEAK since the last clearing
       is what remembers the shower: an eased fall crosses the threshold in
       small steps, so a tick-to-tick comparison would never see it. Each
       clearing spends its one chance, rainbow or not. */
    if (WX.wet >= (WX.wetPeak || 0)) WX.wetPeak = WX.wet;
    const lowSun = (DAY.wts.g || 0) > 0.30;
    if ((WX.wetPeak || 0) > 0.5 && WX.wet < 0.35) {
      if (lowSun && S.t - WX.rbAt > RB_COOLDOWN && !S.atLE) {
        WX.rbAt = S.t; WX.rbs++;
      }
      WX.wetPeak = 0;
    }
    const rbAge = S.t - WX.rbAt;
    WX.rbA += (((rbAge > 0 && rbAge < 16) ? 1 : 0) - WX.rbA) * ease(2.6);
  }
  WX.rain = WX.wet * WX.here;
  /* overcast flattens the LIGHT — at night there is little light to
     flatten; a storm takes one more stop on its own */
  WX.k = clamp(WX.grey * (0.30 + 0.70 * (1 - DAY.wts.n)) + 0.30 * WX.storm, 0, 1);
  const sig = Math.round(WX.k * 12) + Math.round(WX.snow * 7) * 100 +
    Math.round(WX.fog * 7) * 1000 + Math.round(WX.rbA * 7) * 10000 +
    Math.round(WX.snowCover * 9) * 100000;
  if (sig !== WX.sig) { WX.sig = sig; needsDraw = true; }
}

/* hard-edged riso rain: two lanes of flat streaks, each with its rose
   registration lane behind it, slanted by the stretch's own wind */
function drawRain(a) {
  if (a <= 0.012) return;
  const slant = 0.16 + 0.40 * S.wind;
  /* the count follows the room the rain has to fall in, so a tall
     side-by-side column and a wide stacked one hold the same weather */
  const area = (W * visH) / (1440 * 450);
  for (let li = 0; li < 2; li++) {
    const n = Math.round((li === 0 ? 56 : 34) * clamp(area, 0.5, 2.4));
    const sp = li === 0 ? 1180 : 1680;
    const len = li === 0 ? 30 : 46;
    const lw = li === 0 ? 1.6 : 2.3;
    const al = li === 0 ? 0.27 : 0.18;
    for (let pass = 0; pass < 2; pass++) {
      const ox = pass === 0 ? 2.5 : 0, oy = pass === 0 ? 1.5 : 0;
      cx.strokeStyle = pass === 0 ? INKS.rose : INKS.cream;
      cx.globalAlpha = (pass === 0 ? al * 0.5 : al) * a;
      cx.lineWidth = lw;
      cx.beginPath();
      const r = rngFor('rain:' + li);
      const span = visH + 320;
      for (let i = 0; i < n; i++) {
        const px = r() * (W + 320) - 160;
        const fall = (S.t * sp + r() * span) % span;
        const y = fall - 160;
        const x = px - fall * slant * 0.30;
        cx.moveTo(x + ox, y + oy);
        cx.lineTo(x + ox - len * slant, y + oy + len);
      }
      cx.stroke();
    }
  }
  cx.globalAlpha = 1;
}

/* riso snow: two lanes of short flat flakes, drifting slower than the
   rain, swaying on the stretch's own wind */
function drawSnow(a) {
  if (a <= 0.012) return;
  const area = (W * visH) / (1440 * 450);
  for (let li = 0; li < 2; li++) {
    const nFl = Math.round((li === 0 ? 44 : 26) * clamp(area, 0.5, 2.4));
    const sp = li === 0 ? 150 : 96;
    const sz = li === 0 ? 3.0 : 4.2;
    /* a 3-px dot needs more ink than a 40-px streak: the rain reads at
       0.27, the flakes only at half again that against the grain */
    const al = li === 0 ? 0.58 : 0.42;
    for (let pass = 0; pass < 2; pass++) {
      cx.fillStyle = pass === 0 ? INKS.rose : INKS.cream;
      cx.globalAlpha = (pass === 0 ? al * 0.4 : al) * a;
      const ox = pass === 0 ? 1.8 : 0, oy = pass === 0 ? 1.2 : 0;
      const r = rngFor('snow:' + li);
      const span = visH + 260;
      for (let i = 0; i < nFl; i++) {
        const px = r() * (W + 260) - 130;
        const fall = (S.t * sp + r() * span) % span;
        const sway = Math.sin(S.t * 0.9 + i * 2.1) * (8 + 10 * S.wind);
        cx.fillRect(px + sway + ox, fall - 130 + oy, sz, sz);
      }
    }
  }
  cx.globalAlpha = 1;
}
/* the ground whitens in over a minute and thaws after — a hard-edged cap
   of white laid along the path, never a gradient. Jump, bounce and the
   reading are untouched; the winter frost of long-untended stretches is a
   different thing and stays place-bound as it was. */
function drawSnowCover() {
  const c = WX.snowCover * (S.atLE ? 0 : 1);
  if (c <= 0.02) return;
  cx.fillStyle = INKS.cream;
  for (let sx = -20; sx < W + 20; sx += 24) {
    const wx = S.x + (sx - AVX);
    if (wx < 0 || wx > M.totalPx) continue;
    const h1 = hashStr('snowcap:' + Math.round(wx / 24));
    cx.globalAlpha = 0.62 * c;
    cx.fillRect(sx, gYAt(wx) - 2.6, 20, 2.6 + (h1 & 1));
    if ((h1 & 7) < 3) {
      cx.globalAlpha = 0.38 * c;
      cx.fillRect(sx + 4, gYAt(wx) - 5.2, 12, 2);
    }
  }
  cx.globalAlpha = 1;
}
/* a fog bank rolls in and holds — but the law is LEGIBILITY: the alpha is
   capped (FOG_CAP) so the path, the hazards, the prompts and the walker
   always read; the reading dock and the HUD are DOM and never dimmed */
function drawFogBank(a) {
  const al = FOG_CAP * a;
  if (al <= 0.01) return;
  cx.fillStyle = mix(INKS.cream, OVERCAST_INK, 0.35);
  for (let i = 0; i < 4; i++) {
    const y = visH * (0.22 + 0.19 * i);
    const hgt = visH * 0.11;
    const drift = ((S.t * (6 + i * 3) + i * 240) % (W + 480)) - 240;
    cx.globalAlpha = al * (0.75 - i * 0.1);
    cx.fillRect(-240 + drift * 0.2, y, W + 480, hgt);
    cx.globalAlpha = al * 0.5;
    cx.fillRect(drift - 160, y + hgt * 0.25, 320 + i * 90, hgt * 0.5);
  }
  cx.globalAlpha = 1;
}
/* the flash inks the sky for two frames; reduced motion never sees it */
function drawBolt() {
  if (REDUCED) return;
  const age = S.t - WX.flashT;
  if (age < 0 || age > 0.10) return;
  const first = age < 0.05;
  cx.globalAlpha = first ? 0.30 : 0.16;
  cx.fillStyle = INKS.cream;
  cx.fillRect(0, 0, W, horizonY);
  const r = rngFor('bolt:' + WX.bolts);
  let bx = W * (0.25 + r() * 0.5), by = 6;
  cx.strokeStyle = first ? INKS.cream : INKS.apricot;
  cx.globalAlpha = first ? 0.95 : 0.5;
  cx.lineWidth = first ? 3 : 2;
  cx.beginPath(); cx.moveTo(bx, by);
  while (by < horizonY - 8) {
    bx += (r() - 0.48) * 46; by += 14 + r() * 22;
    cx.lineTo(bx, by);
  }
  cx.stroke();
  cx.globalAlpha = 1;
}
/* a banded riso arc as a shower clears under a low sun — one moment of
   delight, gone gently, never twice in an hour */
function drawRainbow(a) {
  if (a <= 0.01) return;
  const cxr = W * 0.62, cyr = visH * 1.06, r0 = Math.min(W, visH * 2) * 0.52;
  const bands = [INKS.rose, INKS.apricot, INKS.cream];
  cx.save();
  cx.beginPath(); cx.rect(0, 0, W, visH); cx.clip();
  for (let i = 0; i < bands.length; i++) {
    cx.strokeStyle = bands[i];
    /* flat and confident — a riso arc, not a watermark */
    cx.globalAlpha = 0.52 * a * (1 - i * 0.10);
    cx.lineWidth = 9;
    cx.beginPath();
    cx.arc(cxr, cyr, r0 - i * 10, Math.PI * 1.02, Math.PI * 1.98);
    cx.stroke();
  }
  cx.restore();
  cx.globalAlpha = 1;
}

/* the paper darkens a stop under cloud, and another under a shower */
function drawWxPlate(a) {
  if (a <= 0.004) return;
  cx.globalAlpha = a;
  cx.fillStyle = INK_DARK;
  cx.fillRect(0, 0, W, visH + 6);
  cx.globalAlpha = 1;
}

/* wet ground: a flat sheen on the path and puddles that stay behind the
   shower and dry out afterwards — both hard-edged, neither a gradient */
function drawWet(pal) {
  const wet = WX.wetness * WX.here;
  if (wet <= 0.02 || S.atLE) return;
  cx.globalAlpha = 0.20 * wet;
  cx.fillStyle = INKS.cream;
  for (let sx = -20; sx < W + 20; sx += 26) {
    const wx = S.x + (sx - AVX);
    if (wx < 0 || wx > M.totalPx) continue;
    if ((hashStr('sheen:' + Math.round(wx / 26)) & 3) === 0) continue;
    cx.fillRect(sx, gYAt(wx) - 2.4, 17, 1.8);
  }
  const step = 340;
  const first = Math.floor((S.x - AVX - step) / step) * step;
  for (let wx = first; wx < S.x + (W - AVX) + step; wx += step) {
    if (wx < 0 || wx > M.totalPx) continue;
    const h1 = hashStr('pud:' + wx);
    if ((h1 & 7) > 4) continue;                   /* not every place puddles */
    const px = wx + ((h1 >>> 4) % 220) - 110;
    const sx = w2s(px);
    if (sx < -90 || sx > W + 90) continue;
    const wdt = 26 + ((h1 >>> 9) % 44);
    const gy = gYAt(px);
    /* a puddle holds the sky, the way the sea does at Land's End: the
       low band of this hour's own sky, laid flat on the path */
    cx.globalAlpha = 0.62 * wet;
    cx.fillStyle = mix(skyColAt(pal, 0.88), INKS.cream, 0.10);
    cx.fillRect(sx - wdt / 2, gy - 3.4, wdt, 4.6);
    cx.globalAlpha = 0.55 * wet;
    cx.fillStyle = INKS.cream;
    cx.fillRect(sx - wdt / 2 + 3, gy - 4.0, wdt - 6, 1.2);
    if (WX.rain > 0.5) {
      /* rings, two held frames — the rain still falling into the puddle */
      const f = Math.floor((S.t * 2.2 + (h1 % 9) * 0.31) % 2);
      cx.globalAlpha = 0.42 * WX.rain * wet;
      const rw = 6 + f * 6;
      cx.fillRect(sx - rw / 2, gy - 4.6, rw, 1);
    }
  }
  cx.globalAlpha = 1;
}

/* ---------------- the walker falls asleep ---------------- */
function wakeWalker() {
  if (PERF.on) endPerform(true);   /* any input stops the tune mid-phrase */
  if (SLP.stage > 0 && !SLP.waking) { SLP.startle = 1; SLP.waking = true; SLP.wakes++; }
  SLP.stage = 0; SLP.t = 0; SLP.rIdle = 0;
  SLP.dogSnoreAt = 0;
  S.idleT = 0;                 /* she is properly awake: the clock restarts */
  if (REDUCED && SLP.startle > 0) { needsDraw = true; renderStep(); }
}

/* w5r1 — SHE SITS ON THE FURNITURE (owner, with screenshot: idling beside
   a picnic table she sat on the ground). Everything sittable within a step
   or two now counts: the trail benches (seat top 20 px up), the two seats
   of every picnic table (12 px up, facing the table), the overlook bench
   beside each orientation table (20 px up, facing it), and the Land's End
   bench as before. The nearest seat wins; the ground-sit remains only when
   nothing sittable is near. */
function chooseSeat() {
  SLP.onBench = false; SLP.seatDX = 0; SLP.seatH = 20; SLP.seatFace = 0;
  SLP.dxNow = 0;
  if (S.atLE) {
    /* the shore keeps one bench, in perfect repair, back from the brink */
    const d = M.leBench - S.x;
    if (Math.abs(d) < 110) { SLP.seatDX = clamp(d, -90, 90); SLP.onBench = true; }
    if (REDUCED) SLP.dxNow = SLP.seatDX;
    return;
  }
  if (!S.page) return;
  const T = terrainFor(S.page.idx);
  let best = null;
  const consider = (x, h, face) => {
    const d = x - S.x;
    if (Math.abs(d) < 74 && (best === null || Math.abs(d) < Math.abs(best.d)))
      best = { d, h, face };
  };
  for (const b of T.benches) {
    if (b.broken) continue;
    consider(b.x, 20, 0);
  }
  /* the picnic tables: a seat plank each side of the table (drawFurn draws
     them 16..30 px out, seat top 12 px up); she takes the near one and
     faces the table */
  for (const f of S.page.furn) {
    if (f.kind !== 'picnic') continue;
    consider(f.x - 23, 12, 1);
    consider(f.x + 23, 12, -1);
  }
  /* the overlook keeps a bench beside the orientation table (drawLookTable
     puts its seat 58..18 px west of the table, top 20 px up) */
  if (S.page.overlook) consider(S.page.overlook.x - 38, 20, 1);
  if (best !== null) {
    SLP.seatDX = best.d; SLP.onBench = true;
    SLP.seatH = best.h; SLP.seatFace = best.face;
    if (REDUCED) SLP.dxNow = best.d;   /* held poses: no walk, already there */
  }
}

function sleepStageNow() {
  const idle = S.idleT;
  /* a page open and being read counts as activity — but only against the
     first stage. She may still doze beside you while you read; that is
     the point of her. */
  const reading = (performance.now() - userScrollT) < 4200;
  if (idle > SLEEP_T3) return 3;
  if (idle > SLEEP_T2) return 2;
  if (idle > SLEEP_T1 && !reading) return 1;
  return 0;
}

function tickSleep(dt) {
  if (SLP.startle > 0) {
    SLP.startle = Math.max(0, SLP.startle - dt / 0.55);
    if (SLP.startle === 0) SLP.waking = false;
  }
  const busy = !!S.overlay || !!S.sweep || Math.abs(S.vx) > 1 || S.target != null ||
    S.jumpT !== null || S.bounceT !== null || S.stumbleT !== null;
  if (busy) { if (SLP.stage > 0) wakeWalker(); return; }
  let st = sleepStageNow();
  if (PERF.on) st = Math.min(st, 1);        /* the doze waits for the tune */
  if (st !== SLP.stage) {
    if (st === 0) wakeWalker();
    else {
      const fromStanding = SLP.stage === 0;
      SLP.stage = st; SLP.t = 0; SLP.stages++;
      /* w5r1 — the seat is chosen on ANY settle from standing, not only a
         stage-1 entry: reading the page holds stage 1 off, so a reader
         can pass 60 s of stillness and settle straight into stage 2 — and
         she used to sit on the ground beside a perfectly good seat */
      if (fromStanding) chooseSeat();
      if (st === 1) {
        /* SOMETIMES, INSTEAD OF SLEEPING, SHE PLAYS: roughly one settle in
           five or six, never twice in a row, never under reduced motion */
        PERF.chances++;
        const plays = !REDUCED && (PERF.force || (!PERF.last && Math.random() < PERF_CHANCE));
        PERF.force = false;
        PERF.last = plays;
        if (plays) beginPerform();
      }
      if (st === 3) SLP.snoreAt = S.t + 2.4;
    }
  }
  if (PERF.on) {
    PERF.t += dt;
    PERF.k = clamp(PERF.t / 1.2, 0, 1);
    if (PERF.t >= PERF.dur) endPerform(false);
  }
  if (PERF.putaway > 0) PERF.putaway = Math.max(0, PERF.putaway - dt / 0.9);
  if (SLP.stage > 0) {
    /* w5r1 — the step or two to the seat comes first: dxNow walks toward
       the chosen seat at strolling pace, and the settle pose holds off
       until she is standing at it. The ground-sit (no seat) never walks. */
    const away = SLP.seatDX - (SLP.dxNow || 0);
    if (SLP.onBench && !REDUCED && Math.abs(away) > 1.5) {
      SLP.dxNow = (SLP.dxNow || 0) + clamp(away, -64 * dt, 64 * dt);
      SLP.t = 0; SLP.k = 0;
    } else {
      SLP.dxNow = SLP.seatDX;
      SLP.t += dt;
      SLP.k = clamp(SLP.t / 1.5, 0, 1);     /* each stage eases into itself */
    }
  } else SLP.k = 0;
  /* the snore: small, spaced, never comic-loud, and never under calm */
  if (SLP.stage >= 3 && !REDUCED) {
    if (S.t > SLP.snoreAt) {
      SLP.snoreAt = S.t + 4.4 + Math.random() * 3.8;
      SLP.snores++;
      audEv('snore', S.x);
      /* and once in a while the dog answers with a smaller one */
      if (DOG.on && !S.atLE && DOG.pose === 'sleep' && SLP.snores % 3 === 0) {
        SLP.dogSnoreAt = S.t + 1.4 + Math.random() * 0.8;
      }
    }
    if (SLP.dogSnoreAt && S.t > SLP.dogSnoreAt) {
      SLP.dogSnoreAt = 0;
      SLP.dogSnores++;
      audEv('dogsnore', DOG.x);
    }
  }
}

/* SOMETIMES, INSTEAD OF SLEEPING, SHE PLAYS (wave 3). She sits, takes a
   small instrument from the pack — a kalimba or a tin whistle, chosen by
   the stretch — and the generative music-box voice performs a quiet solo
   in the seed of exactly where she sits, for twenty or thirty seconds,
   the dog settling to listen. Then she puts it away and dozes as usual.
   Any input stops the tune mid-phrase with one small apologetic note and
   stands her up. The tune respects the MUSIC toggle the way everything
   does — muted, she still plays; the animation is the point — and the
   duty-cycle ledger counts it as a moment. Reduced motion never performs. */
function beginPerform() {
  PERF.on = true; PERF.t = 0; PERF.k = 0;
  PERF.dur = 20 + Math.random() * 10;       /* twenty or thirty seconds */
  const p = S.page;
  PERF.seed = p ? p.slug : '';
  PERF.inst = (hashStr('inst:' + PERF.seed) & 1) ? 'whistle' : 'kalimba';
  PERF.count++;
  audPerform(PERF.dur);
}
function endPerform(interrupted) {
  if (!PERF.on) return;
  PERF.on = false;
  PERF.putaway = 1;                          /* she puts it away, eased */
  if (interrupted) {
    PERF.interrupted++;
    if (AUD.ctx && MUS.built && !AUD.themeSrc) {
      const c = AUD.ctx;
      /* the tune stops mid-phrase; one small apologetic note closes it */
      MUS.swell.gain.cancelScheduledValues(c.currentTime);
      MUS.swell.gain.setValueAtTime(Math.max(0.0001, MUS.swell.gain.value), c.currentTime);
      MUS.swell.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.9);
      try {
        const pal = musPalette();
        musNote(musMidiHz(pal.root + 24), c.currentTime + 0.06, 0.035, 1.6);
      } catch (e) { }
      MUS.quietUntil = c.currentTime + 8 + Math.random() * 6;
      MUS.phraseEnd = c.currentTime + 0.9;
    }
  }
}
/* the solo: quiet phrases from the music box ALONE, whatever the score has
   earned — what she plays IS the music of where she sits */
function audPerform(dur) {
  AUD.moments = AUD.moments || {};
  AUD.moments.perform = (AUD.moments.perform || 0) + 1;
  if (!AUD.ctx || !MUS.built || AUD.themeSrc) return;
  const c = AUD.ctx;
  const t0 = c.currentTime + 0.6;
  MUS.swell.gain.cancelScheduledValues(c.currentTime);
  MUS.swell.gain.setValueAtTime(Math.max(0.0001, MUS.swell.gain.value), c.currentTime);
  MUS.swell.gain.setValueAtTime(Math.max(0.0001, MUS.swell.gain.value), t0);
  MUS.swell.gain.linearRampToValueAtTime(1, t0 + 1.3);
  let t = t0;
  while (t < t0 + dur - 7) {
    const gap = 2.2 + Math.random() * 2.6;
    t = musPhrase(t, true, { tier: 0, i: 0, hold: gap + 6 }) + gap;
  }
  MUS.swell.gain.setValueAtTime(1, t);
  MUS.swell.gain.linearRampToValueAtTime(0.0001, t + MUS_FALL);
  MUS.phraseEnd = t + MUS_FALL;
  MUS.quietUntil = t + MUS_FALL + 19 + Math.random() * 12;
  AUD.playCount['moment:perform'] = (AUD.playCount['moment:perform'] || 0) + 1;
}
/* 3-4 authored frames in the flat idiom: the seated walker, the small
   instrument, a plucking hand, one breathing note glyph over her */
function drawPerformer(ay, pal, opts) {
  const dx = (SLP.dxNow == null ? SLP.seatDX : SLP.dxNow) || 0;
  drawSeated(AVX + dx - 2.6, ay - 1.8, 1, 'rgba(255,243,224,0.9)', null, opts);
  drawSeated(AVX + dx, ay, 1, pal.ink, pal.accent, opts, true);
  const k = PERF.on ? PERF.k : PERF.putaway;
  if (k <= 0.02) return;
  const face = (opts && opts.face) || 1;
  const sx = AVX + dx + 10 * face, sy = ay - 16;
  const fr = PERF.on ? [0, 1, 2, 1][Math.floor(S.t * 2.4) % 4] : 0;
  cx.globalAlpha = clamp(k, 0, 1);
  if (PERF.inst === 'kalimba') {
    cx.fillStyle = INKS.cream;
    cx.fillRect(sx - 6, sy + 2, 12, 8);
    cx.strokeStyle = pal.ink; cx.lineWidth = 1;
    cx.strokeRect(sx - 6, sy + 2, 12, 8);
    cx.fillStyle = pal.ink;
    for (let i = 0; i < 4; i++) cx.fillRect(sx - 4 + i * 2.4, sy + 3, 1, 4 - (i === fr ? 1.4 : 0));
    cx.fillRect(sx - 5 + fr * 3.2, sy - 1.5 - (fr === 1 ? 1.2 : 0), 3, 3);
  } else {
    cx.strokeStyle = INKS.cream; cx.lineWidth = 2.6;
    cx.beginPath(); cx.moveTo(sx - 2 * face, sy - 8); cx.lineTo(sx + 12 * face, sy - 2); cx.stroke();
    cx.fillStyle = pal.ink;
    cx.fillRect(sx + (3 + fr * 2.6) * face - 1.5, sy - 6.5 + fr * 0.9, 3, 3);
  }
  if (PERF.on) {
    const nk = (S.t % 3.4) / 3.4;
    if (nk < 0.6) {
      cx.globalAlpha = 0.75 * Math.sin(Math.PI * (nk / 0.6)) * k;
      cx.fillStyle = INKS.apricot;
      const nx2 = sx + 6 * face, ny2 = sy - 22 - nk * 10;
      cx.fillRect(nx2, ny2, 3, 3);
      cx.fillRect(nx2 + 2.4, ny2 - 6, 1.2, 8);
    }
  }
  cx.globalAlpha = 1;
}

/* she is drawn, not announced: the whole state of her is in the pose */
function drawSleeper(ay, pal, opts) {
  const dx = (SLP.dxNow == null ? SLP.seatDX : SLP.dxNow) || 0;
  drawSeated(AVX + dx - 2.6, ay - 1.8, 1, 'rgba(255,243,224,0.9)', null, opts);
  drawSeated(AVX + dx, ay, 1, pal.ink, pal.accent, opts, true);
  if (SLP.stage >= 3) drawZzz((SLP.hxNow || AVX + dx) + 9, (SLP.hyNow || ay - 40) - 13);
}

function drawSeated(sx, sy, h, ink, accent, opts, keyline) {
  if (accent) {
    cx.save(); cx.translate(2.5, 1.5); cx.globalAlpha = 0.45;
    drawSeated(sx, sy, h, accent, null, opts);
    cx.restore(); cx.globalAlpha = 1;
  }
  const face = (opts && opts.face) || 1;
  const st = SLP.stage;
  /* how far under she has gone — eased inside each stage, never a snap */
  const droopT = st >= 3 ? 1 : (st === 2 ? 0.58 : 0.08);
  const droopP = st >= 3 ? 0.58 : (st === 2 ? 0.08 : 0);
  const droop = lerp(droopP, droopT, SLP.k);
  /* and past the nodding-off she goes all the way down: the body turns
     from a sitting axis to a lying one, which is the only silhouette
     that reads as sleep at thirty pixels tall */
  const lie = smoothT(clamp((droop - 0.62) / 0.38, 0, 1));
  const bench = !!SLP.onBench;
  /* the surface she is on: the seat's own height — a trail or overlook
     bench 20 px up, a picnic-table seat 12 px up, the ground itself 0 */
  const floor = sy - (bench ? (SLP.seatH == null ? 20 : SLP.seatH) : 0) * h;
  const hipY = lerp(floor - (bench ? -1 : 7) * h, floor - 4.4 * h, lie);

  /* the body axis: hips to shoulders, sitting up or laid out */
  const shSitX = sx + droop * 7.6 * h * face, shSitY = hipY - (21 - 1.6 * droop) * h;
  const shLieX = sx - 15 * h * face, shLieY = floor - 5.4 * h;
  const shX = lerp(shSitX, shLieX, lie), shY = lerp(shSitY, shLieY, lie);
  let ax = shX - sx, ay2 = shY - hipY;
  const alen = Math.hypot(ax, ay2) || 1;
  const ux = ax / alen, uy = ay2 / alen;        /* along the body */
  const nx = -uy, ny = ux;                      /* across it */

  /* the knees stay bent the whole way down */
  const kneeX = lerp(sx + (bench ? 9.5 : 12.6) * h * face, sx + 12 * h * face, lie);
  const kneeY = lerp(bench ? hipY + 2 * h : floor - 21 * h, floor - 9.5 * h, lie);
  const footX = lerp(sx + (bench ? 12 : 15.5) * h * face, sx + 19.5 * h * face, lie);
  const footY = lerp(floor, floor - 2.4 * h, lie);

  cx.fillStyle = ink; cx.strokeStyle = ink; cx.lineCap = 'round';

  /* the far leg, a hair behind */
  cx.lineWidth = 4.2 * h;
  cx.beginPath();
  cx.moveTo(sx - 1.4 * h * face, hipY + 0.6 * h);
  cx.lineTo(kneeX - 3.2 * h * face, kneeY + 2.4 * h);
  cx.lineTo(footX - 3.6 * h * face, footY + 0.6 * h);
  cx.stroke();

  /* torso: a flat quad across the body axis, whatever angle it holds */
  const wHip = 4.9 * h, wSh = 4.5 * h;
  drawPoly([
    [sx + nx * wHip, hipY + ny * wHip], [sx - nx * wHip, hipY - ny * wHip],
    [shX - nx * wSh, shY - ny * wSh], [shX + nx * wSh, shY + ny * wSh]
  ], ink);

  /* the near leg, over the torso: the line that says "sitting", then
     "curled up" */
  cx.lineWidth = 4.6 * h;
  cx.beginPath();
  cx.moveTo(sx + 1.2 * h * face, hipY + 0.4 * h);
  cx.lineTo(kneeX, kneeY);
  cx.lineTo(footX, footY);
  cx.stroke();

  /* one arm props her up, lets go, and ends tucked under her head */
  cx.lineWidth = 3.0 * h;
  const prop = 1 - droop;
  const ex = lerp(lerp(sx + 6.5 * h * face, sx - 8.5 * h * face, prop), sx - 9 * h * face, lie);
  const ey = lerp(lerp(hipY + 3.5 * h, floor - 1 * h, prop), floor - 2.6 * h, lie);
  cx.beginPath(); cx.moveTo(shX, shY + 3 * h * (1 - lie)); cx.lineTo(ex, ey); cx.stroke();
  if (droop < 0.78) {
    /* the near arm holds the knee until she is properly under, and then
       lets go — the notch between knee and chest is the tell */
    cx.globalAlpha = clamp((0.78 - droop) / 0.2, 0, 1);
    cx.beginPath();
    cx.moveTo(shX, shY + 3.6 * h);
    cx.lineTo(kneeX + 1.2 * h * face, kneeY + 3.6 * h);
    cx.stroke();
    cx.globalAlpha = 1;
  }

  /* neck and head, carried along the same axis */
  const headD = (10.4 - 3.4 * droop * (1 - lie) + 3.2 * lie) * h;
  const hx = shX + ux * headD + (1 - lie) * droop * 2.0 * h * face;
  const hy = shY + uy * headD;
  cx.lineWidth = 3.6 * h;
  cx.beginPath(); cx.moveTo(shX, shY); cx.lineTo(hx, hy); cx.stroke();
  cx.beginPath(); cx.arc(hx, hy, 5.6 * h, 0, 7); cx.fill();
  SLP.hxNow = hx; SLP.hyNow = hy;      /* the Zzz rises from her actual head */

  /* THE SHOULDER LINE (round 12). Laid out flat, the torso, the near arm,
     the tucked head and the curled legs are one ink and one mass: at 1x she
     read as a dark blob while the dog beside her read clean. The riso
     answer is a knocked-out keyline — a plate left unprinted — so two hard
     cream cuts, one across the shoulder and one across the hip, break the
     silhouette into the three masses the eye needs. Flat, no gradient, and
     they come in with the lying-down itself so nothing pops. */
  if (keyline && lie > 0.22) {
    const kA = smoothT(clamp((lie - 0.22) / 0.34, 0, 1));
    cx.save();
    cx.strokeStyle = INKS.cream;
    cx.lineCap = 'butt';
    /* the cream backlight already rims her UP-LEFT edges, so a cut laid on
       the axis simply lands on light that is there. These sit a step DOWN
       and RIGHT of it, on the side the rim never reaches, and they cross the
       whole silhouette: the neck, and the hip. */
    cx.globalAlpha = kA * 0.88;
    cx.lineWidth = 1.8 * h;
    cx.beginPath();
    const oX = 1.6 * h;                    /* clear of the rim, inside the ink */
    cx.moveTo(shX + nx * wSh * 0.76 + oX, shY + ny * wSh * 0.76);
    cx.lineTo(shX - nx * wSh * 0.76 + oX, shY - ny * wSh * 0.76);
    cx.moveTo(sx + nx * wHip * 0.72 + oX, hipY + ny * wHip * 0.72);
    cx.lineTo(sx - nx * wHip * 0.72 + oX, hipY - ny * wHip * 0.72);
    cx.stroke();
    /* and the near thigh, cut away from the torso it lies across */
    cx.globalAlpha = kA * 0.6;
    cx.lineWidth = 1.3 * h;
    cx.beginPath();
    cx.moveTo(sx + 2.4 * h * face + nx * 2.2 * h, hipY + 0.4 * h + ny * 2.2 * h);
    cx.lineTo(kneeX * 0.72 + sx * 0.28 + nx * 2.2 * h, kneeY * 0.72 + hipY * 0.28 + ny * 2.2 * h);
    cx.stroke();
    cx.restore();
    cx.globalAlpha = 1;
  }

  if (opts && opts.dress) drawDress(sx, sy, h, (shX - sx), shY, hipY, ink, opts.dress, face);
  cx.lineCap = 'butt';
}

/* a small flat Zzz, two held frames — no tween, no easing curve on paper */
function drawZzz(sx, sy) {
  const f = REDUCED ? 0 : Math.floor(S.t * 1.1) % 3;
  for (let i = 0; i < 3; i++) {
    const s = 6.5 + i * 3.6;
    cx.globalAlpha = [0.9, 0.6, 0.3][(i + f) % 3];
    cx.fillStyle = INKS.cream;
    const x = sx + i * 8.5 + f * 1.5, y = sy - i * 12 - f * 2.5;
    cx.fillRect(x, y, s, 1.8);
    cx.fillRect(x, y + s - 1.8, s, 1.8);
    cx.save();
    cx.translate(x + s, y);
    cx.rotate(Math.PI * 0.75);
    cx.fillRect(0, 0, s * 1.4, 1.8);
    cx.restore();
  }
  cx.globalAlpha = 1;
}

/* ---------------- waking, and the second keyboard ---------------- */
/* Any input at all wakes her. Scrolling the reading strip does not: that
   is reading, and reading is exactly when she is allowed to doze. */
window.addEventListener('keydown', () => { wakeWalker(); }, { capture: true });
window.addEventListener('pointerdown', () => { wakeWalker(); }, { capture: true });

/* A mouse click must not leave a chip armed. The browser keeps focus on a
   clicked button and re-fires it on the next overlay-less Enter — so the
   LAYOUT chip clicked once made every later gate Enter flip the layout back
   (the owner's stacked-again bug), and the sound chips re-toggled silently
   the same way. After any pointer press the focus goes back to the trail;
   Tab-and-Enter keyboard travel is untouched, because a keyboard never
   raises pointerup. */
window.addEventListener('pointerup', (e) => {
  const t = e.target;
  const b = t && t.closest ? t.closest('button') : null;
  if (b) b.blur();
}, { capture: true });

window.addEventListener('keydown', (e) => {
  if (S.overlay && S.overlay !== 'key') return;      /* typing stays typing */
  if (e.key.toLowerCase() === 'v') { toggleLayout(); e.preventDefault(); }
});
const btnLayoutEl = document.getElementById('btnLayout');
if (btnLayoutEl) btnLayoutEl.addEventListener('click', () => toggleLayout());
window.addEventListener('resize', () => { refreshLayoutUI(); });

/* the calm variant keeps the stages as held frames: a one-second tick that
   draws nothing at all unless a stage boundary is actually crossed, and
   never makes a sound */
if (REDUCED) {
  setInterval(() => {
    if (S.overlay) { SLP.rIdle = 0; if (SLP.stage) { SLP.stage = 0; needsDraw = true; renderStep(); } return; }
    SLP.rIdle += 1;
    S.idleT = SLP.rIdle;
    const st = SLP.rIdle > SLEEP_T3 ? 3 : (SLP.rIdle > SLEEP_T2 ? 2 : (SLP.rIdle > SLEEP_T1 ? 1 : 0));
    if (st !== SLP.stage) {
      const fromStanding = SLP.stage === 0;
      SLP.stage = st; SLP.k = 1; SLP.stages++;
      /* held poses: any settle from standing picks its seat, and reduced
         motion sits her straight onto it (chooseSeat pins dxNow) */
      if (fromStanding && st > 0) chooseSeat();
      needsDraw = true;
      renderStep();
    }
  }, 1000);
}

/* ---------------- what the verifier may ask ---------------- */
window.__wx = {
  get state() {
    const mm = wxMonth();
    return {
      months: WX.months.length, quiet: WX.quiet, max: WX.max,
      first: WX.first, last: WX.last,
      idx: WX.idx, month: mm.key, marks: mm.marks, monthState: mm.state,
      grey: +WX.grey.toFixed(4), wet: +WX.wet.toFixed(4),
      wetness: +WX.wetness.toFixed(4), rain: +WX.rain.toFixed(4),
      k: +WX.k.toFixed(4), sig: WX.sig,
      turned: WX.turned, showers: WX.showers, clearings: WX.clearings,
      snow: +WX.snow.toFixed(4), snowCover: +WX.snowCover.toFixed(4),
      fog: +WX.fog.toFixed(4), storm: +WX.storm.toFixed(4),
      rbA: +WX.rbA.toFixed(4), rbAt: +WX.rbAt.toFixed(1),
      bolts: WX.bolts, flashT: +WX.flashT.toFixed(2),
      stormUntil: +WX.stormUntil.toFixed(1),
      snows: WX.snows, fogs: WX.fogs, storms: WX.storms, rbs: WX.rbs,
      fogCap: FOG_CAP,
      label: wxLabel()
    };
  },
  setMonth(i) {
    WX.idx = ((i | 0) % WX.months.length + WX.months.length) % WX.months.length;
    WX.mt = 0; WX.state = wxMonth().state;
    tickWeather(0.016);
    needsDraw = true; if (REDUCED) renderStep();
    return wxMonth().key;
  },
  settle(secs) {                 /* run the eases forward without a walk */
    const n = Math.max(1, Math.round((secs || 6) / 0.05));
    const keep = WX.mt;
    for (let i = 0; i < n; i++) { WX.mt = keep; tickWeather(0.05); }
    WX.mt = keep;
    needsDraw = true; if (REDUCED) renderStep();
    return this.state;
  },
  monthTable() { return WX.months.map(m => [m.key, m.marks, m.state]); },
  /* a probe may break the storm now — the visit is old enough by fiat */
  storm() {
    WX.stormKey = 'probe:' + WX.turned + ':' + Math.random();
    WX.storms++;
    WX.stormUntil = S.t + 7;
    WX.boltNext = S.t + 0.4;
    WX.dogStartled = false;
    return WX.stormUntil;
  },
  /* …or hang the arc for a screenshot; the natural path is the transition */
  rainbow() { WX.rbAt = S.t; WX.rbs++; return WX.rbAt; }
};
window.__lbl = {
  get state() {
    return {
      approach: LBL.approach,
      first: LBL.first ? Object.assign({}, LBL.first) : null,
      boxes: LBL.boxes.map(b => ({ x0: +b.x0.toFixed(1), x1: +b.x1.toFixed(1),
        y0: +b.y0.toFixed(1), y1: +b.y1.toFixed(1) })),
      ranks: LBL.rank.size
    };
  }
};
window.__slp = {
  get state() {
    return {
      stage: SLP.stage, k: +SLP.k.toFixed(3), onBench: SLP.onBench,
      seatDX: Math.round(SLP.seatDX || 0), dxNow: Math.round(SLP.dxNow || 0),
      seatH: SLP.seatH, seatFace: SLP.seatFace,
      startle: +SLP.startle.toFixed(3),
      snores: SLP.snores, dogSnores: SLP.dogSnores, stages: SLP.stages,
      wakes: SLP.wakes, idleT: +S.idleT.toFixed(2), rIdle: SLP.rIdle
    };
  },
  idle(sec) { S.idleT = sec; SLP.rIdle = sec; return S.idleT; },
  wake: wakeWalker
};
window.__perf = {
  get state() {
    return { on: PERF.on, t: +PERF.t.toFixed(2), dur: +PERF.dur.toFixed(1),
      inst: PERF.inst, seed: PERF.seed, chances: PERF.chances, count: PERF.count,
      last: PERF.last, interrupted: PERF.interrupted,
      putaway: +PERF.putaway.toFixed(2), chance: PERF_CHANCE };
  },
  force() { PERF.force = true; return true; }
};
window.__score = {
  get state() {
    return {
      tier: SCORE.tier, name: SCORE_TIERS[SCORE.tier].name, reached: SCORE.reached,
      p: +SCORE.p.toFixed(4), words: +SCORE.words.toFixed(4), pages: +SCORE.pages.toFixed(4),
      covered: COV.covered, segs: COV.n, segPx: COV_SEG, x1: Math.round(COV.x1),
      walked: Math.round(PACK.walked), opened: Object.keys(PACK.visited).length,
      totalWords: M.totalWords, totalPages: M.pages.length,
      debut: SCORE.debut, debuts: SCORE.debuts, unlocks: SCORE.unlocks,
      voices: SCORE.lastVoices.slice(), moment: (SCORE.lastMoment || []).map(v => v.slice()),
      acct: SCORE.acct ? Object.assign({}, SCORE.acct) : null,
      energy: SCORE.acct ? +Object.values(SCORE.acct).reduce((a, b) => a + b, 0).toFixed(8) : 0,
      trim: SCORE_TRIM[SCORE.tier],
      tiers: SCORE_TIERS.map(t => [t.at, t.name]), label: scoreLabel()
    };
  },
  /* a probe may buy progress the honest way (w5r1): STAND THERE — the
     walker is teleported to the x whose word position reads p of the
     trail, exactly the one number the redefined rule reads */
  set(p) {
    const want = clamp(p, 0, 1);
    const w = want * M.totalWords;
    let pg = M.pages[M.pages.length - 1];
    for (const q of M.pages) if (q.cumWords <= w) pg = q; else break;
    const x = pg.start + pg.len * clamp((w - pg.cumWords) / Math.max(1, pg.words), 0, 1);
    teleport(clamp(x, 10, M.worldEnd));
    return scoreUpdate(true);
  },
  update: scoreUpdate,
  clearDebut() { SCORE.debut = -1; return SCORE.debut; },
  /* start the walk over the way a first-time visitor starts it: no words
     on the odometer, no pages in the pack, and no memory of a voice */
  fresh() {
    PACK.walked = 0; PACK.visited = {};
    if (COV.bits) { COV.bits.fill(0); COV.covered = 0; }
    lsSet('longway.cov.v1', '');
    SCORE.reached = 0; SCORE.unlocks = 0; SCORE.debuts = 0; SCORE.debut = -1;
    SCORE.lastMoment = null; SCORE.lastVoices = [];
    lsSet('longway.score.tier', '0');
    return scoreUpdate(false);
  }
};
window.__lay = {
  get state() { return { mode: LAY.mode, eff: LAY.eff, W, H, visH, horizonY, groundY, AVX, dockH: document.getElementById('dock').getBoundingClientRect() }; },
  set: setLayout,
  toggle: toggleLayout
};
window.__hz = {
  get state() {
    const b = S.hzBlock;
    return {
      blocked: !!b,
      x: b ? Math.round(b.x) : null, kind: b ? b.kind : null,
      face: b ? b.face : 0, heldFor: b ? +(S.t - b.since).toFixed(2) : 0,
      lean: +S.hzLean.toFixed(3), carry: S.jumpCarry,
      promptVisible: !jumpPrompt.hidden,
      firstLineVisible: !jumpPrompt.hidden && !jpFirst.hidden,
      warned: hzWarned,
      promptLeft: jumpPrompt.style.left || ''
    };
  },
  resetWarned() { hzWarned = false; return hzWarned; }
};
window.__portal = {
  get state() {
    return {
      active: PORTAL.active ? PORTAL.active.key : null,
      t: PORTAL.active ? +PORTAL.active.t.toFixed(3) : 0,
      gone: PORTAL.active ? !!PORTAL.active.gone : false,
      seen: Object.assign({}, PORTAL.seen),
      star: { sx: +PORTAL.starSX.toFixed(1), sy: +PORTAL.starSY.toFixed(1),
              on: +PORTAL.starOn.toFixed(3), hover: PORTAL.starHover },
      near: S.enterAct && S.enterAct.kind === 'portal' ? S.enterAct.key : null,
      nearFlower: S.nearFlower,
      hint: gatePrompt.hidden ? '' : gatePrompt.textContent,
      spots: {
        kioskX: Math.round(M.kioskX),
        kioskPage: M.kioskPage,
        minPage: PORTAL_MIN_PAGE,
        sloopX: Math.round(M.worldEnd - 4),
        inkX: Math.round(M.leBench)
      },
      ask: S.overlay === 'portalask' ? PA.key : null,
      lines: PORTAL_LINES
    };
  },
  go: portalGo,
  hoverStar() { PORTAL.mx = PORTAL.starSX; PORTAL.my = PORTAL.starSY; },
  setNav(fn) { PORTAL.navigate = fn; },
  clear() { PORTAL.active = null; }
};
