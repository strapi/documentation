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
const DOCK_FRAC   = 0.38;

/* living-trail tuning */
const EMAX        = 84;     /* highest crest in px — the most-cited stretch */
const ELEV_BLEND  = 340;    /* border zone where neighbouring elevations meet */
const CAM_K       = 0.6;    /* how much of your own climb the camera absorbs */
const CYCLE_S     = 300;    /* one full day of sky = five minutes */
const DAY_SPEEDS  = [1, 6, 0];
const DAY_SPEED_NAMES = ['1×', '6×', 'PAUSED'];
const DAY_EPS     = 1e-4;   /* weight resolution: below one ink unit, no plates */
const FRONT_DUR   = 4.4;    /* a weather front takes seconds, eased both ways */
const JUMP_DUR    = 0.52, BOUNCE_DUR = 0.62, STUMBLE_DUR = 0.6;
const SEASON_DAYS = [31, 92, 240];   /* spring | summer | autumn | winter */
const SEASON_NAMES = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'];
const BUBBLE_RANGE = 110, BUBBLE_LIFE = 4.6, BUBBLE_PAIR_CD = 75, BUBBLE_GAP = 7;

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

function buildModel(content, graph, communities, provenance) {
  M.totalWords = Object.values(graph.words).reduce((a, b) => a + b, 0);

  M.communities = communities.map((c, i) => ({ ...c, idx: i }));
  communities.forEach((c, i) => c.members.forEach(m => M.commOf.set(m, i)));

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
  for (const slug of content.order) {
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
    for (let i = 1; i < p.gates.length; i++) {
      if (p.gates[i].x - p.gates[i - 1].x < 92) {
        p.gates[i].x = Math.min(p.gates[i - 1].x + 92, p.start + p.len - 40);
      }
    }
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
  return out;
}

const gradeCache = new Map();
function gradedPaletteFor(ci, hollow) {
  if (hollow) return NIGHT_PAL;   /* night hollows ignore the sky — data law */
  const base = paletteFor(ci, false);
  const w = DAY.wts;
  if (w.g >= 0.999) return base;  /* golden hour = the original art, untouched */
  const key = ci + ':' + DAY.sig;
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
  const key = p.comm + ':' + p.season + ':' + DAY.sig;
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
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  visH = H * (1 - DOCK_FRAC);
  horizonY = visH * 0.565;
  groundY = visH * 0.855;
  AVX = W * 0.40;
  needsDraw = true;
}
window.addEventListener('resize', resize);

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
  stumbleT: null,      /* 0..1 while paying a hazard's beat */
  puff: null,          /* {x, t} — the stumble's dust, 3 held frames */
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
  state: 'follow', stateT: 0, shookOn: '', sleepX: null,
  sniffCD: new Map()
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
function nextToast() {
  const txt = toastQ.shift();
  if (!txt) { toastBusy = false; toastEl.hidden = true; return; }
  toastBusy = true;
  toastEl.textContent = txt;
  toastEl.hidden = false;
  setTimeout(nextToast, 2900);
}

/* the field guide's species — counts derived at build, never typed in */
const SPECIES = [
  { id: 'boardwalk', name: 'CODE BOARDWALK', what: 'Planks laid over a stretch of code — every block that carries code gets one, so your boots never touch the brackets.', count: () => M.furnCounts.boardwalk },
  { id: 'picnic', name: 'TABLE PICNIC', what: 'A picnic table wherever the page sets a table — rows and columns served flat, in the open air.', count: () => M.furnCounts.picnic },
  { id: 'cairn', name: 'NOTE CAIRN', what: 'Stacked stones marking a calm admonition: a note, an aside, a prerequisite. Read it or walk on; it asks nothing.', count: () => M.furnCounts.cairn },
  { id: 'warnpost', name: 'WARNING POST', what: 'A low barrier with hard chevrons at every caution, warning and danger. Jump it clean or stumble a beat.', count: () => M.hazTotal },
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
  if (p.comm >= 0 && !PACK.certs['c' + p.comm]) {
    const c = M.communities[p.comm];
    if (c.members.every(m => PACK.visited[m] || !M.bySlug.has(m))) {
      PACK.certs['c' + p.comm] = 1;
      toast('EVERY PAGE OF ' + String(c.dominant || '').toUpperCase() + ' WALKED — CERTIFICATE IN THE PACK (B)');
    }
  }
  if (!PACK.certs.trail && M.pages.every(pp => PACK.visited[pp.slug])) {
    PACK.certs.trail = 1;
    toast('THE WHOLE TRAIL WALKED — CERTIFICATE IN THE PACK (B)');
  }
  queueSave();
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
  const lean = (moving ? 1.6 * h : 0) + (o && o.leanX ? o.leanX * h : 0);
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
  const shY = sy - 46 * h;
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

function label(txt, sx, sy, size, color, align, ls) {
  cx.font = (size || 10) + 'px Georgia, serif';
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
  const sunA = clamp((0.99 - wN) / 0.20, 0, 1);
  if (pal.sun && sunA > 0.004) {
    cx.globalAlpha = sunA;
    const wts = hollow ? { m: 0, d: 0, g: 0, n: 1 } : DAY.wts;
    const fx = wts.m * 0.14 + wts.d * 0.50 + (wts.g + wts.n) * pal.sun.fx;
    const fy = wts.m * 0.62 + wts.d * 0.16 + wts.g * pal.sun.fy + wts.n * 1.55;
    const sxx = W * fx, syy = horizonY * fy;
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
  const mAl = nightRamp(wN);
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
    const dim = clamp((wN - 0.3) / 0.7, 0, 1);
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
    drawConstellation(page.comm, smoothT(clamp((wN - 0.35) / 0.5, 0, 1)));
  }

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
  for (let pi = pi0; pi <= pi1; pi++) drawStretch(pi, pal, dt, wN);

  /* gust layer: soft cream streaks riding the stretch's own wind */
  if (!REDUCED && S.wind > 0.06) drawGusts();

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
  const opts = {
    stride: clamp(1 - eff * 1.5, 0.62, 1.3),                  /* honest gait */
    leanX: clamp(eff * 6, -3, 4.5) * Math.sign(S.vx || S.face),
    pitch: S.stumbleT !== null ? Math.sin(Math.PI * S.stumbleT) * 0.5 * S.face : 0,
    armUp: S.wave > 0 ? (S.wave > 0.45 ? 2 : 1) : 0,
    dress: WALKER,
    face: S.face
  };
  const ay = gYAt(S.x) - airY;
  drawFigure(AVX - 2.6, ay - 1.8, 1, S.x / 26, 'rgba(255,243,224,0.9)', null, moving && !REDUCED, opts);
  drawFigure(AVX, ay, 1, S.x / 26, pal.ink, pal.accent, moving && !REDUCED, opts);

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

  /* grain overlay — the whole scene is printed on stock */
  if (grainPat) {
    cx.globalAlpha = 0.5;
    cx.fillStyle = grainPat;
    cx.fillRect(0, 0, W, visH + 6);
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
    const hgt = Math.min(112, 30 + c.size * 1.35);    /* landmark height = community size */
    const v = c.idx % 5;
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
    } else { /* water tower */
      cx.strokeStyle = ink; cx.lineWidth = 2;
      cx.beginPath(); cx.moveTo(sx - 8, baseY); cx.lineTo(sx - 4, baseY - hgt * 0.7); cx.stroke();
      cx.beginPath(); cx.moveTo(sx + 8, baseY); cx.lineTo(sx + 4, baseY - hgt * 0.7); cx.stroke();
      drawPoly([[sx - 11, baseY - hgt * 0.7], [sx + 11, baseY - hgt * 0.7], [sx + 8, baseY - hgt], [sx - 8, baseY - hgt]], ink);
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
  if (p.overlook) drawLookTable(p, pal);

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
    label(wk.name, sx, gy - 74 * wk.h, wk.isTop ? 9.5 : 8.5, 'rgba(255,243,224,0.88)', 'center', 1);
    if (wk.dates) label('WALKED HERE ' + wk.dates, sx, gy - 74 * wk.h + 11, 7, 'rgba(255,162,107,0.8)', 'center', 0.6);
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
  if (near) {
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
  if (Math.abs(sx - AVX) < 240) {
    label('OVERLOOK', sx, gy - 54, 8, 'rgba(255,243,224,0.85)', 'center', 1.2);
    label(o.landmarks.length ? o.landmarks.length + ' LANDMARKS IN VIEW' : 'ALL SKY — THIS HUB CITES NO PAGES',
      sx, gy - 44, 7, 'rgba(255,162,107,0.8)', 'center', 0.7);
  }
}

/* ---------------- the trail dog ---------------- */
function updateDog(dt) {
  const p = S.page;
  if (REDUCED) {
    /* the calm variant: she simply keeps pace at your side */
    DOG.x = clamp(S.x - 54, 10, M.totalPx - 10);
    DOG.pose = 'stand'; DOG.face = 1;
    return;
  }
  DOG.stateT += dt;
  if (S.sweep) { DOG.x = S.x - 60; DOG.pose = 'run'; DOG.moving = true; DOG.face = S.face; return; }
  if (p.inCount === 0 && DOG.shookOn !== p.slug && DOG.state !== 'shake' && Math.abs(DOG.x - S.x) < 420) {
    DOG.state = 'shake'; DOG.stateT = 0; DOG.shookOn = p.slug;
  }
  if (DOG.state === 'shake') {
    DOG.pose = 'shake'; DOG.moving = false;
    if (DOG.stateT > 1.0) { DOG.state = 'follow'; DOG.stateT = 0; }
    return;
  }
  if (DOG.state === 'sniff') {
    DOG.pose = 'sniff'; DOG.moving = false;
    if (DOG.stateT > 1.8) { DOG.state = 'follow'; DOG.stateT = 0; }
    return;
  }
  const idle = Math.abs(S.vx) < 1 && !S.overlay && S.target == null;
  /* a well-cited door within nose range pulls her — the nose always wins */
  let sniffPull = null;
  if (DOG.sleepX == null) {
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
    tx = sniffPull.x - 14;
    if (Math.abs(DOG.x - tx) < 7) {
      DOG.state = 'sniff'; DOG.stateT = 0;
      DOG.sniffCD.set(sniffPull.x, S.t + 45);
    }
  } else if (idle && S.idleT > 17) {
    if (DOG.sleepX == null) {
      const T = terrainFor(p.idx);
      let bb = null;
      for (const b of T.benches) {
        if (!b.broken && Math.abs(b.x - S.x) < 420 && (!bb || Math.abs(b.x - S.x) < Math.abs(bb.x - S.x))) bb = b;
      }
      DOG.sleepX = bb ? bb.x + 34 : S.x - 44;
    }
    tx = DOG.sleepX;
  } else {
    DOG.sleepX = null;
    tx = idle ? S.x - 44 : S.x + (S.face || 1) * 150;
  }
  const dx = tx - DOG.x;
  const cap = Math.abs(S.vx) > 1 ? Math.abs(S.vx) * 1.6 : 430;
  const sp = clamp(Math.abs(dx) * 2.6, 0, cap);
  if (Math.abs(dx) > 3) {
    DOG.x += Math.sign(dx) * sp * dt;
    DOG.face = Math.sign(dx) || DOG.face;
    DOG.moving = sp > 26;
  } else DOG.moving = false;
  DOG.x = clamp(DOG.x, 10, M.totalPx - 10);
  if (DOG.sleepX != null && Math.abs(DOG.x - DOG.sleepX) < 8) DOG.pose = 'sleep';
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
      cx.font = '9px Georgia, serif'; cx.textAlign = 'center';
      cx.fillText('z', 8, -14);
      cx.globalAlpha = 1; cx.fillStyle = ink;
    }
  } else if (DOG.pose === 'sit') {
    drawPoly([[-8, 0], [-7, -14], [0, -15], [3, 0]], ink);
    cx.beginPath(); cx.moveTo(4, -13); cx.lineTo(6, 0); cx.stroke();
    cx.beginPath(); cx.arc(6, -18, 5.4, 0, 7); cx.fill();
    cx.fillRect(6, -20.5, 9, 4);
    drawPoly([[2, -22], [5, -28], [7, -21]], ink);
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
    cx.fillRect(-11, -16, 22, 8);
    const legs = (DOG.pose === 'run' && !REDUCED) ? [[-8, 4], [8, -4], [0, 0]][frame] : [0, 0];
    cx.beginPath(); cx.moveTo(-8, -9); cx.lineTo(-8 + legs[0] * 0.5, 0); cx.stroke();
    cx.beginPath(); cx.moveTo(8, -9); cx.lineTo(8 + legs[1] * 0.5, 0); cx.stroke();
    cx.beginPath(); cx.moveTo(-11, -14); cx.lineTo(-17, DOG.pose === 'run' ? -22 + (frame === 1 ? 1.5 : 0) : -20); cx.stroke();
    cx.beginPath(); cx.arc(13, -18, 5.2, 0, 7); cx.fill();
    cx.fillRect(13, -19.5, 8, 3.6);
    drawPoly([[9, -22], [11, -28], [14, -21]], ink);
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
  if (near || Math.abs(sx - AVX) < 190) {
    let name = (tp ? tp.label : g.tgt).toUpperCase();
    if (name.length > 26) name = name.slice(0, 25) + '…';
    const dW = wordsAt(tp ? tp.start : 0) - wordsAt(g.x);
    const row = (Math.round(g.x / 92) % 2) * 22;   /* stagger clustered door labels */
    label(name, sx, gy - 96 + row, 8.5, near ? INKS.cream : 'rgba(255,243,224,0.8)', 'center', 1);
    label((dW >= 0 ? fmt(dW) + 'M EAST' : fmt(-dW) + 'M WEST'), sx, gy - 86 + row, 7.5, 'rgba(255,162,107,0.85)', 'center', 0.8);
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
  if (near || Math.abs(sx - AVX) < 200) {
    label('CARD TERRACE · ' + tr.items.length + (tr.items.length === 1 ? ' CHOICE' : ' CHOICES'), sx, gy - 84,
      8.5, near ? INKS.cream : 'rgba(255,243,224,0.8)', 'center', 1.2);
  }
}

/* ---------------- greetings: bubbles, gestures, waves ------------------ */
function bubbleFacts(name, p) {
  const v = p.prov;
  const agg = M.authorAgg.get(name) || { pages: 1, top: 0 };
  const sole = (v.authors || []).length === 1;
  const isTop = v.topAuthor === name;
  const f = [];
  if (sole && v.commits === 1) {
    f.push('I came once, fixed one thing, and walked on.');
    f.push('One visit, one fix; the trail keeps the rest.');
  }
  if (sole && v.commits > 1) {
    f.push(capFirst('all ' + numw(v.commits) + ' commits on this stretch are mine.'));
    f.push('Every one of the ' + numw(v.commits) + ' commits here is mine.');
  }
  if (!sole && v.commits === v.authors.length && v.commits > 1) {
    /* N commits by N authors: provably one apiece */
    f.push(capFirst(numw(v.authors.length)) + ' of us came; each left exactly one commit. Mine is here.');
    f.push('One commit apiece from ' + numw(v.authors.length) + ' walkers, and one of them is mine.');
  } else if (!sole && isTop && v.commits > 1) {
    if (v.authors.length === 2 && v.commits % 2 === 1) {
      /* two hands, odd count: the top hand provably holds the majority */
      f.push('Most of the ' + numw(v.commits) + ' commits on this stretch are mine.');
      f.push('Of the ' + numw(v.commits) + ' commits here, the greater share is mine.');
    } else {
      f.push('Of the ' + numw(v.commits) + ' commits here, the greater share is mine.');
      f.push('No hand has left more commits on this stretch than mine.');
    }
  }
  if (isTop && v.careDays > 0 && (sole || v.commits > v.authors.length)) {
    f.push('I kept this stretch for ' + fmt(v.careDays) + ' days.');
    f.push('This ground has been kept ' + fmt(v.careDays) + ' days; I kept it.');
  }
  if (sole && v.night > 0) {
    f.push('I was here at three in the morning. ' +
      (v.night === 1 ? 'Once.' : v.night === 2 ? 'Twice.' : capFirst(numw(v.night)) + ' times.'));
  }
  if (!sole && v.night > 0) {
    f.push(capFirst(numw(v.night)) + ' of the commits here landed long after midnight.');
  }
  if (!sole && v.first) {
    f.push(capFirst(numw(v.authors.length)) + ' of us have kept this stretch since ' + v.first + '.');
  }
  if (agg.pages > 3) {
    f.push('This is one of ' + fmt(agg.pages) + ' stretches that know my step.');
    f.push('I have walked ' + fmt(agg.pages) + ' stretches of this trail.');
  }
  if (isTop && agg.top >= 5) {
    f.push('I keep ' + fmt(agg.top) + ' stretches of this trail; this one among them.');
  }
  if (!isTop && v.topAuthor && v.topAuthor !== name && v.commits > v.authors.length) {
    f.push('I lent a hand here; ' + v.topAuthor + ' keeps this stretch.');
  }
  if (!f.length && v.first && v.last) {
    f.push('This stretch has carried boots from ' + v.first + ' to ' + v.last + '.');
  }
  return f;
}

function spawnBubble(fw, wN) {
  const facts = bubbleFacts(fw.wk.name, fw.page);
  if (!facts.length) return;
  const r = rngFor('bubble:' + fw.page.slug + ':' + fw.wk.name);
  const text = facts[Math.floor(r() * facts.length) % facts.length];
  const gid = Math.floor(r() * 2);
  const gesture = (wN > 0.5 && r() < 0.5) ? 'lantern' : (gid === 0 ? 'hand' : 'hat');
  S.bubble = { wk: fw.wk, page: fw.page, text, gesture, t0: S.t };
  S.wave = 1;   /* the player waves back */
  PACK.greeted++;
  queueSave();
  bubbleCD.set(fw.page.slug + '|' + fw.wk.name, S.t + BUBBLE_PAIR_CD);
}

function endBubble() {
  if (!S.bubble) return;
  S.bubble = null;
  S.bubbleGapT = S.t + BUBBLE_GAP;
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

function drawBubble(b) {
  if (b.sx === undefined) return;
  /* the words grow from the walker — hard-edged, tail at the speaker */
  const gt = REDUCED ? 1 : clamp((S.t - b.t0) / 0.3, 0, 1);
  const scale = [0.35, 0.6, 0.85, 1][Math.min(3, Math.floor(gt * 4))];
  cx.font = '11.5px Georgia, serif';
  cx.textAlign = 'left';
  const words = b.text.split(' ');
  const lines = [];
  let line = '';
  for (const wd of words) {
    const t = line ? line + ' ' + wd : wd;
    if (cx.measureText(t).width > 280 && line) { lines.push(line); line = wd; }
    else line = t;
  }
  if (line) lines.push(line);
  let bw = 0;
  for (const l of lines) bw = Math.max(bw, cx.measureText(l).width);
  bw += 26;
  const bh = lines.length * 15 + 16;
  const headY = b.gy - 74 * b.h - 22;
  const tipX = b.sx + 2, tipY = headY + 6;
  const bx = clamp(b.sx - bw * 0.35, 8, W - bw - 8);
  const by = tipY - 14 - bh;
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
  cx.font = '11.5px Georgia, serif';
  cx.textAlign = 'left';
  lines.forEach((l, i) => cx.fillText(l, bx + 13, by + 20 + i * 15));
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
  acts.sort((a, b) => a.d - b.d);
  S.enterAct = acts[0] || null;
  let txt = S.enterAct ? S.enterAct.txt : null;
  if (!txt) {
    if (S.nearReg && S.nearTicket) txt = 'R — SIGN THE REGISTER · E — REPORT TRAIL DAMAGE';
    else if (S.nearReg) txt = REGBOOK[p.slug] ? 'R — THE REGISTER · YOUR LINE IS INSIDE' : 'R — SIGN THE TRAIL REGISTER';
    else if (S.nearTicket) txt = 'E — REPORT TRAIL DAMAGE · A RANGER TICKET FOR ' + p.label.toUpperCase();
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
  S.gm = null;
  S.tr = null;
  S.lk = null;
  needsDraw = true;
}
function buildThList(q) {
  const needle = q.trim().toLowerCase();
  thRows = M.pages.filter(p => !needle ||
    p.title.toLowerCase().includes(needle) ||
    p.label.toLowerCase().includes(needle) ||
    p.slug.toLowerCase().includes(needle));
  thSel = 0;
  const frag = document.createDocumentFragment();
  thRows.forEach((p, i) => {
    const li = el('li', i === 0 ? 'sel' : '');
    li.appendChild(el('span', null, esc(p.title)));
    li.appendChild(el('span', 'thmeta', esc((p.product || '').toUpperCase() + ' · AT WORD ' + fmt(p.cumWords))));
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
  g2.font = '10px Georgia, serif'; g2.textAlign = 'center'; g2.fillStyle = INKS.cream;
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
  if (gm) travelTo(gm.to.slug);
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
  'sw-wp': [INKS.violet, INKS.rose, INKS.apricot]
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
      'HAZARDS & SPRINGS — every caution or warning on a page stands low on its stretch: jump it ' +
      '(SPACE) or stumble a beat (' + fmt(M.hazTotal) + ' on the trail). Every tip is a spring that bounces you forward (' +
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
      'THE OVERLOOKS — each hub keeps a bench and an orientation table at its high point: the landmarks ' +
      'are the real pages the hub cites (at most seven), distances in words. Choosing one sweeps you ' +
      'there on an eased scenic curve.'],
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
      'THE TRAIL DOG — she runs ahead, sniffs at doors that ' + fmt(M.sniffMin) + ' or more pages cite, sits ' +
      'beside you while you read, shakes off the mist, and sleeps at a bench if you linger. Under reduced ' +
      'motion she simply keeps pace. Toggle her below or at the trailhead.'],
    ['sw-guide',
      'THE FIELD GUIDE (G) — the first crossing of each species of trail furniture presses a card into the ' +
      'guide: ten species, from code boardwalks to night lanterns, every count the corpus\u2019s own.'],
    ['sw-cert',
      'CERTIFICATES — walk every page of a biome (or the whole trail) and the pack offers a downloadable ' +
      'flat-ink certificate carrying the walk\u2019s real numbers and the day\u2019s date.'],
    ['sw-wp',
      'YOUR WALKER — three silhouettes and four accessories, any mix; the choice dresses the walking ' +
      'sprite everywhere and keeps for the visit. Change it below.']
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
  refreshDogUI();
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
  let sent = false;
  try {
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
  const visitedN = Object.keys(PACK.visited).length;
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
    ? Object.keys(PACK.visited).length + ' OF ' + M.pages.length
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
      g.fillStyle = INK_DARK; g.font = '6.5px Georgia'; g.textAlign = 'center';
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
      g.font = '26px Georgia, serif'; g.textAlign = 'center';
      g.fillText('?', 42, 42);
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
    g.fillStyle = INKS.cream; g.font = '12px Georgia, serif'; g.textAlign = 'center';
    g.fillText('ALL SKY — THIS HUB CITES NO PAGES', wC / 2, hC * 0.4);
    return;
  }
  const baseY = hC * 0.72;
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
    g.font = '9px Georgia, serif';
    g.textAlign = 'center';
    g.fillStyle = sel ? INKS.cream : 'rgba(255,243,224,0.7)';
    let nm = m.tp.label.toUpperCase();
    if (nm.length > 18) nm = nm.slice(0, 17) + '\u2026';
    g.fillText(nm, lx, baseY - hgt2 - 16);
    g.fillStyle = sel ? INKS.apricot : 'rgba(255,162,107,0.7)';
    g.font = '8px Georgia, serif';
    g.fillText(fmt(Math.abs(m.dw)) + (m.dw >= 0 ? ' WORDS EAST' : ' WORDS WEST'), lx, baseY + 14);
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
  S.x = clamp(x, 10, M.totalPx - 10);
  S.target = null; S.vx = 0;
  DOG.x = clamp(S.x - 54, 10, M.totalPx - 10);
  DOG.sleepX = null;
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
function routeTo(slug) { travelTo(slug); }
window.addEventListener('hashchange', () => {
  if (suppressHash) { suppressHash = false; return; }
  const slug = location.hash.slice(1);
  if (M.bySlug.has(slug)) {
    const p = M.bySlug.get(slug);
    teleport(p.start + 6);
  }
});

function syncPage(force) {
  const p = pageAt(S.x);
  if (p !== S.page || force) {
    S.page = p;
    renderDock(p);
    collectPage(p);
    const key = p.comm + ':' + (p.prov.night > 0 ? 'n' : 'd');
    if (key !== S.palKey) {
      const had = S.palKey !== '';
      S.palKey = key;
      /* hold the light we are leaving; the front eases the new one in */
      S.fromSnap = had ? (S.pal || null) : null;
      S.fromWN = S.lastWN == null ? DAY.wts.n : S.lastWN;
      S.pal = paletteFor(p.comm, p.prov.night > 0);
      S.front = REDUCED ? 1 : 0;   /* weather front sweeps on biome change */
    }
    if (!suppressHash) {
      try { history.replaceState(null, '', '#' + p.slug); } catch (e) { }
    }
  }
  updateBlock(S.page, blockIndexAt(S.page, S.x));
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
    if (e.key === 'Escape') closeOverlays();
    else if (e.key === 'ArrowDown') lkMove(1);
    else if (e.key === 'ArrowUp') lkMove(-1);
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
    const a = S.enterAct;
    if (a) {
      if (a.kind === 'terrace') openTerrace(a.nt);
      else if (a.kind === 'gate') openGate(a.g);
      else if (a.kind === 'look') openLook(a.p);
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
    /* jump — never gates reading; reduced motion auto-hops instead */
    if (!REDUCED && S.jumpT === null && S.bounceT === null) S.jumpT = 0;
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
  } else {
    S.x = p.start + p.fracs[ni] * p.len + 4;
  }
  S.x = clamp(S.x, 10, M.totalPx - 10);
  needsDraw = true;
  renderStep();
}

cv.addEventListener('click', (e) => {
  if (S.overlay) return;
  const wx = S.x + (e.clientX - AVX);
  const clamped = clamp(wx, 10, M.totalPx - 10);
  if (REDUCED) { S.x = clamped; needsDraw = true; renderStep(); }
  else S.target = clamped;
});

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
    '<span><b>' + fmt(M.overlooks) + '</b> OVERLOOKS · <b>1</b> TRAIL DOG</span>';
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
  if (REDUCED) return;   /* auto-hop: the calm variant never stumbles */
  const lo = Math.min(prevX, S.x), hi = Math.max(prevX, S.x);
  if (hi - lo < 0.01 && S.bounceT === null) return;
  let airY = 0;
  if (S.jumpT !== null) airY = Math.sin(Math.PI * S.jumpT) * 54;
  if (S.bounceT !== null) airY = Math.sin(Math.PI * S.bounceT) * 78;
  const p0 = pageAt(clamp(lo - 20, 0, M.totalPx - 1)).idx;
  const p1 = pageAt(clamp(hi + 20, 0, M.totalPx - 1)).idx;
  const now = S.t;
  for (let pi = p0; pi <= p1; pi++) {
    const p = M.pages[pi];
    for (const hz of p.hazards) {
      if (hz.x < lo - 14 || hz.x > hi + 14 || hz.cd > now) continue;
      if (airY > 20) { hz.cd = now + 1.5; continue; }   /* cleared clean */
      hz.cd = now + 2.2;
      S.stumbleT = 0;
      S.puff = { x: hz.x, t: 0 };
    }
    if (S.bounceT === null && S.stumbleT === null) {
      for (const sp of p.springs) {
        if (sp.x < lo - 15 || sp.x > hi + 15 || sp.cd > now || airY > 20) continue;
        sp.cd = now + 1.6;
        S.bounceT = 0;
        S.bounceX = sp.x;
        S.jumpT = null;
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
    if (S.jumpT !== null) { S.jumpT += dt / JUMP_DUR; if (S.jumpT >= 1) S.jumpT = null; }
    if (S.bounceT !== null) { S.bounceT += dt / BOUNCE_DUR; if (S.bounceT >= 1) S.bounceT = null; }
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
    const prevX = S.x;
    let nx = S.x + S.vx * dt;
    if (S.bounceT !== null) {
      /* the spring's gift: a joyful arc, a few honest metres forward */
      nx += S.face * 165 * dt * (1 - 0.35 * S.bounceT);
    }
    if (nx !== S.x) {
      const before = wordsAt(S.x);
      S.x = clamp(nx, 10, M.totalPx - 10);
      const dw = Math.abs(wordsAt(S.x) - before);
      S.walkedWords += dw;
      PACK.walked += dw;
      syncPage();
    }
    collideTrail(prevX);
    }
    S.idleT = (Math.abs(S.vx) < 1 && !S.overlay && S.target == null && !S.sweep) ? S.idleT + dt : 0;
    checkGuide();
    if (S.front < 1) S.front = Math.min(1, S.front + dt / FRONT_DUR);

    draw(dt);
    updateHUD();
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
  checkGuide();
  draw(0);
  updateHUD();
  noteFrame(performance.now() - t0, 'reduced-step');
}

/* ---------------- boot ---------------- */
async function boot() {
  const [content, graph, communities, provenance] = await Promise.all([
    fetch('content.json').then(r => r.json()),
    fetch('graph.json').then(r => r.json()),
    fetch('communities.json').then(r => r.json()),
    fetch('provenance.json').then(r => r.json())
  ]);
  buildModel(content, graph, communities, provenance);
  resize();
  makeGrain();
  fillLanding();
  fillKey();
  tickDay(0);

  const slug = location.hash.slice(1);
  if (slug && M.bySlug.has(slug)) {
    landingEl.classList.add('gone');
    teleport(M.bySlug.get(slug).start + 6);
  } else {
    S.overlay = 'landing';
    teleport(12);
  }

  refreshDogUI();

  window.__lw = {
    M, S, DAY, ambientCD, bubbleCD, bubbleFacts, terrainFor,
    PACK, GUIDE, WALKER, DOG, REGBOOK, SPECIES,
    certDataURL(which) { return certCanvas(which).toDataURL('image/png'); },
    markVisited(slugs) { for (const sl of slugs) PACK.visited[sl] = 1; queueSave(); },
    openRegister(slug) { const p2 = slug ? M.bySlug.get(slug) : S.page; if (p2) openRegister(p2); },
    openTicket(slug) { const p2 = slug ? M.bySlug.get(slug) : S.page; if (p2) openTicket(p2); },
    openLook(slug) { const p2 = slug ? M.bySlug.get(slug) : S.page; if (p2 && p2.overlook) openLook(p2); },
    openPack, openGuide, openWalkerPick, sweepTo, toggleDog,
    ticketEditUrl, ticketIssueUrl, unlockSpecies,
    setX(x) { teleport(x); if (REDUCED) renderStep(); },
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
