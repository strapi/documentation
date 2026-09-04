/* =========================================================================
   LAMPFALL — the Strapi documentation as one continuous lamplit cave.
   290 chambers (pages), 1,231 passages (citation edges), one lamp: yours.
   Every visible number derives from content.json / graph.json /
   communities.json / provenance.json. Nothing is invented.
   ========================================================================= */
'use strict';

/* ---------------- tiny utils ---------------- */
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;

/* deterministic per-string randomness (layout must be stable across loads) */
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function slugifyHeading(html) {
  const txt = String(html || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, 'and')
    .replace(/&[a-z#0-9]+;/gi, ' ');
  return txt.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/* localStorage, always wrapped */
const store = {
  get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* cave keeps no grudge */ } }
};

/* ---------------- data ---------------- */
const D = { content: null, graph: null, communities: null, provenance: null };
/* per-chamber merged record, keyed by slug */
const C = new Map();
const DER = {           /* everything derived, printed nowhere but from here */
  entrance: '/cms/quick-start',
  bands: [],            /* count per BFS level */
  sealed: [],           /* unreachable slugs */
  levelOf: {},          /* slug -> level (undefined = sealed) */
  uncited: new Set(),   /* no inbound citations: draft-flicker chambers */
  totalPages: 0, totalEdges: 0, totalWords: 0, totalCode: 0,
  totalCommits: 0, totalNight: 0, hands: 0,
  hall: null,           /* oldest series' widest chamber (derived) */
  hallSeries: '', hallSeriesFirst: '',
  authorSpan: {},       /* author -> {first,last,chambers} across the cave */
  maxCareDays: 1, maxInbound: 1, maxWords: 1, maxCommits: 1
};

/* 27 galleries -> 27 mineral palettes (community id order). Names are real
   cave minerals; the ASSIGNMENT is data (communities.json id), the paint is
   costume. Vein-mixing alpha = 1 - purity (a real field). */
const MINERALS = [
  ['Calcite', '#d8c9a3'], ['Ochre', '#c98a3d'], ['Malachite', '#4e8f6b'],
  ['Hematite', '#9c4a38'], ['Gypsum', '#cfc4b2'], ['Aragonite', '#c2a678'],
  ['Flowstone', '#b3906a'], ['Moonmilk', '#ded6c4'], ['Siderite', '#8a6a4f'],
  ['Limonite', '#b98c46'], ['Dolomite', '#b0a48e'], ['Serpentine', '#6e8f63'],
  ['Cinnabar', '#b24f3c'], ['Fluorite', '#7f9c8d'], ['Jasper', '#a55a41'],
  ['Travertine', '#c7b391'], ['Umber', '#7d5a3a'], ['Sienna', '#a9714b'],
  ['Chalcedony', '#9fb0a4'], ['Selenite', '#d9d2c9'], ['Marl', '#948b74'],
  ['Tufa', '#c0b6a0'], ['Onyx', '#5d574f'], ['Pyrite', '#b0913f'],
  ['Galena', '#7a7d85'], ['Quartz', '#cdbfae'], ['Rhodochrosite', '#b06a62']
];
const UNCLASSIFIED = ['Country rock', '#8c8272'];

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function shade(hex, f) {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${clamp(r * f | 0, 0, 255)},${clamp(g * f | 0, 0, 255)},${clamp(b * f | 0, 0, 255)})`;
}
function rgba(hex, a) { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }
/* vein color: rotate the mineral toward its neighbouring gallery in id order */
function veinColorFor(cid) {
  const alt = MINERALS[(cid + 9) % MINERALS.length];
  return alt[1];
}

/* ---------------- derivations ---------------- */
function derive() {
  const pages = D.content.pages;
  const g = D.graph, prov = D.provenance, comm = D.communities;
  const slugs = Object.keys(pages);
  DER.totalPages = slugs.length;
  DER.totalEdges = g.edges.length;

  /* community membership */
  const communityOf = {};
  for (const [cid, cc] of Object.entries(comm))
    for (const m of cc.members) communityOf[m] = +cid;

  /* undirected BFS from the entrance over the 1,231 citation edges */
  const adj = new Map(); slugs.forEach(s => adj.set(s, []));
  for (const [a, b] of g.edges) {
    if (adj.has(a) && adj.has(b)) { adj.get(a).push(b); adj.get(b).push(a); }
  }
  for (const s of slugs) adj.set(s, [...new Set(adj.get(s))]);
  const depth = { [DER.entrance]: 0 };
  let q = [DER.entrance];
  while (q.length) {
    const nx = [];
    for (const u of q) for (const v of adj.get(u))
      if (!(v in depth)) { depth[v] = depth[u] + 1; nx.push(v); }
    q = nx;
  }
  const bandCount = {};
  for (const s of slugs) {
    if (s in depth) bandCount[depth[s]] = (bandCount[depth[s]] || 0) + 1;
    else DER.sealed.push(s);
  }
  const maxLevel = Math.max(...Object.keys(bandCount).map(Number));
  DER.bands = []; for (let l = 0; l <= maxLevel; l++) DER.bands.push(bandCount[l] || 0);
  DER.levelOf = depth;
  DER.sealed.sort();

  /* per-author span across the whole cave (page git dates attributed to
     every listed author of that page — the only per-author signal we have) */
  for (const [s, v] of Object.entries(prov)) {
    DER.totalCommits += v.commits; DER.totalNight += v.night;
    for (const a of v.authors) {
      const rec = DER.authorSpan[a] || (DER.authorSpan[a] = { first: v.first, last: v.last, chambers: 0 });
      if (v.first < rec.first) rec.first = v.first;
      if (v.last > rec.last) rec.last = v.last;
      rec.chambers++;
    }
  }
  DER.hands = Object.keys(DER.authorSpan).length;

  /* the Hall of Hands: oldest series (min provenance.first per top segment),
     then that series' widest chamber (max graph.words) */
  const seriesFirst = {};
  for (const [s, v] of Object.entries(prov)) {
    const seg = s.split('/')[1] || 'root';
    if (!(seg in seriesFirst) || v.first < seriesFirst[seg]) seriesFirst[seg] = v.first;
  }
  const oldest = Object.entries(seriesFirst).sort((a, b) => a[1] < b[1] ? -1 : 1)[0];
  DER.hallSeries = oldest[0]; DER.hallSeriesFirst = oldest[1];
  let widest = null;
  for (const s of slugs) if (s.split('/')[1] === DER.hallSeries) {
    const w = g.words[s] || 0;
    if (!widest || w > widest[1]) widest = [s, w];
  }
  DER.hall = widest[0];

  /* chamber records */
  for (const s of slugs) {
    const pg = pages[s];
    const words = g.words[s] || 0, inbound = g.inbound[s] || 0;
    const outbound = g.outbound[s] || 0, code = g.code[s] || 0;
    const pv = prov[s] || { commits: 0, authors: [], topAuthor: '', first: '', last: '', night: 0, careDays: 0 };
    const cid = communityOf[s];
    const mineral = (cid === undefined) ? UNCLASSIFIED : MINERALS[cid % MINERALS.length];
    const purity = (cid === undefined) ? 1 : D.communities[cid].purity;
    if (inbound === 0) DER.uncited.add(s);
    DER.totalWords += words; DER.totalCode += code;
    DER.maxCareDays = Math.max(DER.maxCareDays, pv.careDays);
    DER.maxInbound = Math.max(DER.maxInbound, inbound);
    DER.maxWords = Math.max(DER.maxWords, words);
    DER.maxCommits = Math.max(DER.maxCommits, pv.commits);
    C.set(s, {
      slug: s, title: pg.title || s, label: pg.sidebarLabel || pg.title || s,
      section: pg.section || '', product: pg.product || '', tags: pg.tags || [],
      words, inbound, outbound, code, prov: pv,
      cid, mineral: mineral[0], color: mineral[1], purity,
      vein: (cid === undefined) ? null : veinColorFor(cid),
      level: depth[s], sealed: !(s in depth),
      neighbors: adj.get(s),
      x: 0, y: 0, rx: 40, vh: 40, fl: 20, seed: hashStr(s),
      path: null, mouths: []
    });
  }
}

/* ---------------- layout: the cave in extended elevation ----------------
   Vertical truth: y-band = BFS citation depth. Within a band, chambers
   cluster by gallery (community). Floors from words, vaults from inbound. */
const WORLD = { w: 0, h: 0, bandY: [], sealedBox: null };
function buildLayout() {
  const TARGET_W = 8600, GAP = 84, ROW_PITCH = 620, BAND_PITCH = 1780, Y0 = 640;
  const byLevel = new Map();
  for (const c of C.values()) {
    const key = c.sealed ? 'sealed' : c.level;
    if (!byLevel.has(key)) byLevel.set(key, []);
    byLevel.get(key).push(c);
  }
  const levels = [...byLevel.keys()].filter(k => k !== 'sealed').sort((a, b) => a - b);
  for (const lv of levels) {
    const arr = byLevel.get(lv);
    arr.sort((a, b) => (a.cid ?? 99) - (b.cid ?? 99) || (a.slug < b.slug ? -1 : 1));
    /* size chambers */
    for (const c of arr) {
      c.rx = clamp(26 + Math.sqrt(c.words) * 1.55, 34, 168);
      c.vh = clamp(40 + c.inbound * 4.0, 44, 272);
      c.fl = 14 + c.rx * 0.17;
    }
    /* flow into sub-rows */
    const rows = [[]]; let x = 0;
    for (const c of arr) {
      const w = c.rx * 2 + GAP;
      if (x + w > TARGET_W && rows[rows.length - 1].length) { rows.push([]); x = 0; }
      rows[rows.length - 1].push(c); x += w;
    }
    const yBase = Y0 + lv * BAND_PITCH;
    WORLD.bandY[lv] = yBase;
    rows.forEach((row, ri) => {
      const rowW = row.reduce((s, c) => s + c.rx * 2 + GAP, -GAP);
      let cx = (TARGET_W - rowW) / 2;
      /* serpentine: odd rows run right-to-left so galleries wind */
      if (ri % 2 === 1) row.reverse();
      for (const c of row) {
        const rnd = mulberry(c.seed);
        c.x = cx + c.rx;
        c.y = yBase + ri * ROW_PITCH + (rnd() - 0.5) * 130;
        cx += c.rx * 2 + GAP;
      }
    });
    WORLD.h = Math.max(WORLD.h, yBase + (rows.length - 1) * ROW_PITCH + 500);
  }
  WORLD.w = TARGET_W;
  /* sealed pockets: an alcove beyond the east wall, no passages reach it */
  const sealedArr = (byLevel.get('sealed') || []).sort((a, b) => a.slug < b.slug ? -1 : 1);
  const sx = TARGET_W + 1500, sy = Y0 + 1.6 * BAND_PITCH;
  sealedArr.forEach((c, i) => {
    c.rx = clamp(26 + Math.sqrt(c.words) * 1.55, 34, 168);
    c.vh = clamp(40 + c.inbound * 4.0, 44, 272);
    c.fl = 14 + c.rx * 0.17;
    c.x = sx; c.y = sy + i * 640;
  });
  if (sealedArr.length) {
    WORLD.sealedBox = {
      x: sx - 320, y: sy - 420,
      w: 640, h: sealedArr.length * 640 + 380
    };
    WORLD.w = Math.max(WORLD.w, sx + 500);
    WORLD.h = Math.max(WORLD.h, sy + sealedArr.length * 640 + 200);
  }
  /* organic blob outline per chamber (Path2D, world-local coordinates) */
  for (const c of C.values()) c.path = blobPath(c);
}

function blobPath(c) {
  const rnd = mulberry(c.seed ^ 0x9e3779b9);
  const p = new Path2D();
  const N = 16, pts = [];
  /* dome: from right floor edge over the vault to left floor edge */
  for (let i = 0; i <= N; i++) {
    const a = Math.PI * (i / N);
    const wob = 1 + (rnd() - 0.5) * 0.22;
    pts.push([Math.cos(a) * c.rx * wob, -Math.pow(Math.sin(a), 0.85) * c.vh * (1 + (rnd() - 0.5) * 0.16)]);
  }
  /* floor: left to right, gently pooled */
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    pts.push([lerp(-c.rx, c.rx, t) * (1 + (rnd() - 0.5) * 0.06), c.fl * (0.75 + Math.sin(t * Math.PI) * 0.5 + (rnd() - 0.5) * 0.2)]);
  }
  /* smooth closed catmull-rom -> bezier */
  const n = pts.length;
  p.moveTo((pts[0][0] + pts[n - 1][0]) / 2, (pts[0][1] + pts[n - 1][1]) / 2);
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    p.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  }
  p.closePath();
  return p;
}

/* ---------------- state ---------------- */
const S = {
  view: 'cave',              /* 'cave' | 'survey' */
  cur: null,                 /* current chamber slug */
  visited: new Set(),        /* personally surveyed */
  charted: false,            /* full survey inked onto the sheet */
  wormsFound: new Set(),     /* slugs whose glowworms bloomed for us */
  lampOut: false,
  calm: false, calmForced: false,
  sound: false,
  travel: null,              /* {pts,t0,dur,queue:[]} */
  cam: { x: 0, y: 0 }, camT: { x: 0, y: 0 }, zoom: 1, zoomT: 1,
  surv: { x: 0, y: 0, k: 0.14, drag: null },
  rings: [],                 /* echo rings {x,y,r,v,a} */
  drips: [],                 /* falling drops {x,y,vy,floor} */
  lastDrip: 0, lastMouthPulse: 0,
  handsShownAt: 0,           /* hall fade-up start */
  flick: 0, flickT: 0,
  introDone: false,
  dirty: true,
  sheetOpen: true,
  journalOpen: false,
  routeGlow: []              /* recently auto-inked route, for a brief flash */
};

function persist() {
  store.set('lampfall.v1', {
    visited: [...S.visited], worms: [...S.wormsFound],
    charted: S.charted, calm: S.calmForced ? S.calm : null
  });
}
function restore() {
  const v = store.get('lampfall.v1');
  if (!v) return;
  (v.visited || []).forEach(s => C.has(s) && S.visited.add(s));
  (v.worms || []).forEach(s => C.has(s) && S.wormsFound.add(s));
  S.charted = !!v.charted;
  if (v.calm === true || v.calm === false) { S.calm = v.calm; S.calmForced = true; }
}

/* ---------------- canvas & camera ---------------- */
const cv = $('cave'), ctx = cv.getContext('2d');
let VW = 0, VH = 0, DPR = 1;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  VW = window.innerWidth; VH = window.innerHeight;
  cv.width = VW * DPR; cv.height = VH * DPR;
  cv.style.width = VW + 'px'; cv.style.height = VH + 'px';
  S.dirty = true;
}
window.addEventListener('resize', resize);

function worldToScreen(x, y) {
  return [(x - S.cam.x) * S.zoom + VW / 2, (y - S.cam.y) * S.zoom + VH / 2];
}
function survToScreen(x, y) {
  return [(x - S.surv.x) * S.surv.k + VW / 2, (y - S.surv.y) * S.surv.k + VH / 2];
}
function screenToSurv(px, py) {
  return [(px - VW / 2) / S.surv.k + S.surv.x, (py - VH / 2) / S.surv.k + S.surv.y];
}

/* pre-rendered grain tile */
let grainPat = null;
function makeGrain() {
  const t = document.createElement('canvas'); t.width = t.height = 160;
  const g = t.getContext('2d'), im = g.createImageData(160, 160);
  const rnd = mulberry(1234567);
  for (let i = 0; i < im.data.length; i += 4) {
    const v = 90 + rnd() * 130;
    im.data[i] = v; im.data[i + 1] = v * 0.96; im.data[i + 2] = v * 0.88;
    im.data[i + 3] = 14;
  }
  g.putImageData(im, 0, 0);
  grainPat = ctx.createPattern(t, 'repeat');
}

/* ---------------- world-anchored DOM labels ---------------- */
const labelHost = $('labels');
const labelPool = new Map();
function label(key, cls, html) {
  let el = labelPool.get(key);
  if (!el) {
    el = document.createElement('div');
    el.className = 'wl ' + cls;
    labelHost.appendChild(el);
    labelPool.set(key, el);
  }
  if (el._html !== html) { el.innerHTML = html; el._html = html; }
  el._used = true;
  return el;
}
function placeLabel(el, px, py, centered, above) {
  el.style.transform = `translate(${px | 0}px,${py | 0}px)` +
    (centered ? (above ? ' translate(-50%,-100%)' : ' translateX(-50%)') : '');
  el.style.opacity = el._op != null ? el._op : 1;
}
function beginLabels() { for (const el of labelPool.values()) el._used = false; }
function endLabels() {
  for (const [k, el] of labelPool) if (!el._used) { el.remove(); labelPool.delete(k); }
}

/* ---------------- captions ---------------- */
let capTimer = 0;
function caption(text, ms) {
  const el = $('caption');
  el.textContent = text; el.hidden = false; el.style.opacity = 1;
  clearTimeout(capTimer);
  capTimer = setTimeout(() => { el.style.opacity = 0; setTimeout(() => { el.hidden = true; }, 700); }, ms || 4200);
}

/* ---------------- HUD ---------------- */
function refreshHUD() {
  $('hud-surveyed').textContent = `Surveyed ${S.visited.size} of ${DER.totalPages}`;
  const c = C.get(S.cur);
  if (c) {
    const lv = c.sealed ? 'sealed pocket' : 'level −' + c.level;
    $('hud-level').textContent = `${lv} · ${c.mineral} gallery`;
  }
}

/* =========================================================================
   EXPEDITION JOURNAL — the page itself, crisp DOM on survey paper
   ========================================================================= */
function renderBlocks(blocks, poolCounter) {
  let h = '';
  for (const b of (blocks || [])) h += renderBlock(b, poolCounter);
  return h;
}
function liHtml(i, pc) {
  if (i == null) return '';
  if (typeof i === 'string') return i;
  return (i.html || '') + renderBlocks(i.blocks, pc);
}
function renderBlock(b, pc) {
  switch (b.t) {
    case 'tldr': return `<div class="b-tldr">${b.html}</div>`;
    case 'p': return `<p>${b.html}</p>`;
    case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
      const id = b.id || slugifyHeading(b.text || b.html || '');
      const inner = b.text != null ? esc(b.text) : (b.html || '');
      return `<${b.t} id="${esc(id)}">${inner}</${b.t}>`;
    }
    case 'img': {
      const src = b.light || b.dark || '';
      return `<figure><img loading="lazy" src="${esc(src)}" alt="${esc(b.alt)}">` +
        (b.caption ? `<figcaption>${b.caption}</figcaption>` : '') + `</figure>`;
    }
    case 'ul': return `<ul>${(b.items || []).map(i => `<li>${liHtml(i, pc)}</li>`).join('')}</ul>`;
    case 'ol': return `<ol${b.start && b.start !== 1 ? ` start="${+b.start}"` : ''}>${(b.items || []).map(i => `<li>${liHtml(i, pc)}</li>`).join('')}</ol>`;
    case 'table': {
      const head = (b.head || []).length ? `<thead><tr>${b.head.map(x => `<th>${x}</th>`).join('')}</tr></thead>` : '';
      const rows = (b.rows || []).map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('');
      return `<div style="overflow-x:auto"><table>${head}<tbody>${rows}</tbody></table></div>`;
    }
    case 'code': {
      pc.n++;
      const t = b.title || b.lang || 'code';
      return `<div class="codeblock"><div class="code-t">${esc(t)}<span class="pool">crystal pool ${pc.n}</span></div><pre><code>${esc(b.code)}</code></pre></div>`;
    }
    case 'admonition': {
      const kind = (b.kind || 'note').toLowerCase();
      return `<div class="adm adm-${esc(kind)}"><div class="adm-t">${esc(b.title || kind)}</div>${renderBlocks(b.blocks, pc)}</div>`;
    }
    case 'tabs': {
      const gid = esc(b.groupId || '');
      const btns = (b.tabs || []).map((t, i) =>
        `<button class="tab-btn${i === 0 ? ' on' : ''}" data-val="${esc(t.value || i)}">${esc(t.label || t.value || ('tab ' + (i + 1)))}</button>`).join('');
      const panes = (b.tabs || []).map((t, i) =>
        `<div class="tab-pane${i === 0 ? ' on' : ''}" data-val="${esc(t.value || i)}">${renderBlocks(t.blocks, pc)}</div>`).join('');
      return `<div class="tabs" data-group="${gid}"><div class="tab-row">${btns}</div>${panes}</div>`;
    }
    case 'details':
      return `<details${b.id ? ` id="${esc(b.id)}"` : ''}><summary>${b.summary || 'Details'}</summary>${renderBlocks(b.blocks, pc)}</details>`;
    case 'cards':
      return `<div class="cards">${(b.items || []).map(it =>
        `<a href="${esc(it.link || '#')}"><div class="c-t">${esc(it.icon || '')} ${esc(it.title || '')}</div><div class="c-d">${esc(it.desc || '')}</div></a>`).join('')}</div>`;
    case 'columns':
      return `<div class="cols">${(b.cols || []).map(col => `<div>${renderBlocks(col, pc)}</div>`).join('')}</div>`;
    case 'endpoint': {
      const params = (b.params || []).length
        ? `<div style="overflow-x:auto"><table><thead><tr><th>${esc(b.paramTitle || 'Parameters')}</th><th>Type</th><th>Description</th></tr></thead><tbody>` +
          b.params.map(p => `<tr><td><code>${esc(p.name)}</code>${p.required ? ' <em>(required)</em>' : ''}</td><td>${esc(p.type || '')}</td><td>${p.desc || ''}</td></tr>`).join('') +
          `</tbody></table></div>` : '';
      const codeTabs = (b.codeTabs || []).map(ct2 =>
        `<div class="codeblock"><div class="code-t">${esc(ct2.label || ct2.lang || 'request')}</div><pre><code>${esc(ct2.code)}</code></pre></div>`).join('');
      const resps = (b.responses || []).map(r =>
        `<div class="codeblock"><div class="code-t">Response ${esc(String(r.status || ''))} ${esc(r.statusText || '')}</div><pre><code>${esc(r.body)}</code></pre></div>`).join('');
      return `<div class="endpoint"${b.id ? ` id="${esc(b.id)}"` : ''}><div class="ep-head">${b.method ? `<span class="m">${esc(b.method)}</span>` : ''}<span>${esc(b.path || '')}</span></div><div class="ep-body">${b.title ? `<p><b>${esc(b.title)}</b></p>` : ''}${b.description ? `<p>${b.description}</p>` : ''}${params}${codeTabs}${resps}</div></div>`;
    }
    case 'badge': return `<span class="badge">${esc(b.label || b.kind || 'badge')}</span> `;
    case 'hr': return '<hr>';
    default: return '';
  }
}

function openJournal(slug) {
  const c = C.get(slug); if (!c) return;
  const pg = D.content.pages[slug];
  const pc = { n: 0, total: c.code };
  const lv = c.sealed ? 'sealed pocket — reachable only by resurvey' : `level −${c.level} of the cave`;
  const purity = c.purity < 1 ? ` · veins ${(100 - c.purity * 100).toFixed(0)}%` : ' · pure seam';
  const meta =
    `<div class="j-meta">` +
    `<b>${esc(lv)}</b> · ${c.mineral} gallery${purity}<br>` +
    `floor <b>${c.words.toLocaleString('en-US')}</b> words · vault <b>${c.inbound}</b> inbound echo${c.inbound === 1 ? '' : 'es'} · ` +
    `<b>${c.outbound}</b> passages out · <b>${c.code}</b> crystal pool${c.code === 1 ? '' : 's'}<br>` +
    `dripstone <b>${c.prov.careDays.toLocaleString('en-US')}</b> days of care · drip cadence <b>${c.prov.commits}</b> commit${c.prov.commits === 1 ? '' : 's'} · ` +
    `<b>${c.prov.authors.length}</b> hand${c.prov.authors.length === 1 ? '' : 's'} · ` +
    `${c.prov.night > 0 ? `<b>${c.prov.night}</b> glowworm${c.prov.night === 1 ? '' : 's'} (commits after midnight)` : 'no midnight commits'}<br>` +
    `kept ${esc(c.prov.first)} → ${esc(c.prov.last)}` +
    `</div>` +
    (c.prov.topAuthor ? `<div class="j-plaque">kept above all by ${esc(c.prov.topAuthor)}</div>` : '');
  const crumb = [c.product ? c.product.toUpperCase() : '', c.section].filter(Boolean).join(' · ');
  $('journal-crumb').textContent = crumb || 'the cave';
  $('journal-body').innerHTML =
    `<h1>${esc(pg.title || c.label)}</h1>` + meta + renderBlocks(pg.blocks, pc);
  $('journal').hidden = false;
  $('journal-scroll').scrollTop = 0;
  S.journalOpen = true;
  document.body.dataset.journal = 'open';
  S.dirty = true;
}
function closeJournal() { $('journal').hidden = true; S.journalOpen = false; document.body.dataset.journal = 'closed'; S.dirty = true; }

/* journal interaction: tabs + link routing (crisp anchors, no hash damage) */
$('journal-body').addEventListener('click', (e) => {
  const tb = e.target.closest('.tab-btn');
  if (tb) {
    const grp = tb.closest('.tabs');
    const val = tb.dataset.val, gid = grp.dataset.group;
    const apply = (g) => {
      let hit = false;
      g.querySelectorAll(':scope > .tab-row > .tab-btn').forEach(b => { if (b.dataset.val === val) hit = true; });
      if (!hit) return;
      g.querySelectorAll(':scope > .tab-row > .tab-btn').forEach(b => b.classList.toggle('on', b.dataset.val === val));
      g.querySelectorAll(':scope > .tab-pane').forEach(p => p.classList.toggle('on', p.dataset.val === val));
    };
    if (gid) document.querySelectorAll(`.tabs[data-group="${CSS.escape(gid)}"]`).forEach(apply);
    else apply(grp);
    return;
  }
  const a = e.target.closest('a'); if (!a) return;
  const href = a.getAttribute('href') || '';
  if (href.startsWith('#/')) {
    e.preventDefault();
    const m = href.match(/^#(\/[^#]+)(?:#(.+))?$/);
    if (m) goTo(m[1], { anchor: m[2] || null, via: 'link' });
  } else if (href.startsWith('#')) {
    e.preventDefault();
    const el = document.getElementById(href.slice(1));
    if (el) el.scrollIntoView({ behavior: S.calm ? 'auto' : 'smooth', block: 'start' });
  }
});
$('journal-close').addEventListener('click', closeJournal);

/* =========================================================================
   INDEX — the plain-title index, one keystroke away. Search auto-inks.
   ========================================================================= */
let indexRows = [];   /* {el, slug, text} */
function buildIndex() {
  const list = $('index-list');
  const inNav = new Set();
  let h = '';
  const row = (slug, lbl) => {
    const c = C.get(slug); if (!c) return '';
    inNav.add(slug);
    const mark = S.visited.has(slug) ? '✓' : '·';
    return `<div class="ix-row${c.sealed ? ' sealed' : ''}" data-slug="${esc(slug)}">` +
      `<span class="ix-t"><span class="ix-mark">${mark}</span> ${esc(lbl || c.label)}</span>` +
      `<span class="ix-slug">${esc(slug)}</span></div>`;
  };
  const walkItems = (items) => {
    let s = '';
    for (const it of (items || [])) {
      if (it.slug) s += row(it.slug, it.label);
      if (it.items) s += walkItems(it.items);
    }
    return s;
  };
  for (const sec of (D.content.nav || [])) {
    const body = walkItems(sec.items);
    if (body) h += `<div class="ix-sec">${esc(sec.label)}${sec.product ? ' — ' + esc(sec.product) : ''}</div>` + body;
  }
  const off = [...C.keys()].filter(s => !inNav.has(s)).sort();
  if (off.length) {
    h += `<div class="ix-sec">Off the charted routes</div>`;
    for (const s of off) h += row(s, C.get(s).label);
  }
  list.innerHTML = h;
  indexRows = [...list.querySelectorAll('.ix-row')].map(el => {
    const c = C.get(el.dataset.slug);
    return { el, slug: el.dataset.slug, text: (c.label + ' ' + c.title + ' ' + c.slug + ' ' + c.tags.join(' ')).toLowerCase() };
  });
}
function filterIndex(q) {
  q = q.trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  let first = null;
  for (const r of indexRows) {
    const ok = !words.length || words.every(w => r.text.includes(w));
    r.el.style.display = ok ? '' : 'none';
    r.el.classList.remove('hot');
    if (ok && !first) first = r;
  }
  document.querySelectorAll('#index-list .ix-sec').forEach(sec => {
    let sib = sec.nextElementSibling, any = false;
    while (sib && !sib.classList.contains('ix-sec')) {
      if (sib.style.display !== 'none') { any = true; break; }
      sib = sib.nextElementSibling;
    }
    sec.style.display = any ? '' : 'none';
  });
  if (first && words.length) first.el.classList.add('hot');
  return first;
}
function openIndex() {
  buildIndex();
  $('index').hidden = false;
  const inp = $('index-search');
  inp.value = ''; filterIndex('');
  setTimeout(() => inp.focus(), 0);
}
function closeIndex() { $('index').hidden = true; cv.focus?.(); }
$('index').addEventListener('click', (e) => {
  if (e.target === $('index')) return closeIndex();
  const r = e.target.closest('.ix-row');
  if (r) { closeIndex(); goTo(r.dataset.slug, { via: 'search' }); }
});
$('index-search').addEventListener('input', (e) => filterIndex(e.target.value));
$('index-search').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const first = filterIndex(e.target.value) || indexRows.find(r => r.el.style.display !== 'none');
    if (first) { closeIndex(); goTo(first.slug, { via: 'search' }); }
    e.stopPropagation();
  } else if (e.key === 'Escape') { closeIndex(); e.stopPropagation(); }
});

/* =========================================================================
   MOVEMENT — walking passages, resurveying by search, auto-inked routes
   ========================================================================= */
function bfsPath(from, to) {
  if (from === to) return [from];
  const prev = new Map([[from, null]]);
  let q = [from];
  while (q.length) {
    const nx = [];
    for (const u of q) for (const v of C.get(u).neighbors) {
      if (!prev.has(v)) {
        prev.set(v, u);
        if (v === to) {
          const path = [v]; let p = u;
          while (p) { path.unshift(p); p = prev.get(p); }
          return path;
        }
        nx.push(v);
      }
    }
    q = nx;
  }
  return null;
}

function markVisited(slug) {
  if (!S.visited.has(slug)) {
    S.visited.add(slug);
    persist(); refreshHUD(); drawSheet();
  }
}

function frameZoomFor(c) {
  const zh = VH * 0.52 / ((c.vh + c.fl) * 1.3 + 150);
  const zw = VW * 0.52 / (c.rx * 2 + 260);
  return clamp(Math.min(zh, zw), 0.8, 1.55);
}
function arrive(c, opts) {
  S.cur = c.slug;
  S.zoomT = frameZoomFor(c);
  S.lampOut = false; $('nightcap').hidden = true;
  markVisited(c.slug);
  refreshHUD();
  /* echo: one ring per inbound citation, capped visually, counted honestly */
  spawnEcho(c);
  S.drips.length = 0; S.lastDrip = performance.now();
  if (c.slug === DER.hall) {
    S.handsShownAt = performance.now();
    const n = c.prov.authors.length;
    caption(`${numWord(n)} hands kept this room. The stone remembers all of them.`, 6000);
  } else if (c.sealed) {
    caption('A sealed pocket, resurveyed through the archive. No passage leads here.', 5000);
  } else if (DER.uncited.has(c.slug)) {
    caption('No page cites this chamber. You are its first surveyed reader.', 5000);
  }
  S.draftNear = c.neighbors.some(n2 => DER.uncited.has(n2) && !S.visited.has(n2));
  if (!opts || opts.openJournal !== false) {
    openJournal(c.slug);
    if (opts && opts.anchor) {
      requestAnimationFrame(() => {
        const el = document.getElementById(opts.anchor);
        if (el) el.scrollIntoView({ block: 'start' });
      });
    }
  }
  if (history.replaceState) history.replaceState(null, '', '#' + c.slug);
  drawSheet();
  audioArrive(c);
  S.dirty = true;
}
function numWord(n) {
  const w = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];
  return w[n] || String(n);
}

function goTo(slug, opts) {
  opts = opts || {};
  const c = C.get(slug); if (!c) return;
  if (S.view === 'survey' && opts.via !== 'boot') setView('cave');
  const from = S.cur;
  if (!from || from === slug) {
    S.cam.x = S.camT.x = c.x; S.cam.y = S.camT.y = c.y - c.vh * 0.35;
    arrive(c, opts); S.zoom = S.zoomT; return;
  }
  const fromC = C.get(from);
  const instant = opts.via === 'search' || opts.via === 'hash' || opts.via === 'link' || opts.via === 'boot';
  const isNeighbor = fromC.neighbors.includes(slug);
  if (isNeighbor && !S.calm && !instant) { startTravel([from, slug], opts); return; }
  /* resurvey: shortest passage route, auto-inked so reading is never gated */
  const path = bfsPath(from, slug);
  if (path) {
    path.forEach(markVisited);
    S.routeGlow = path.map(s => C.get(s)); S.routeGlowT = performance.now();
    if (!S.calm && !instant && path.length <= 5) { startTravel(path, opts); return; }
    if (opts.via === 'search' && path.length > 1) caption(`Resurveyed: ${path.length - 1} passage${path.length === 2 ? '' : 's'} inked to the sheet.`, 3600);
  } else if (opts.via !== 'boot') {
    caption('No passage reaches this pocket. The archive route is inked instead.', 4200);
  }
  /* teleport (calm mode, long routes, sealed pockets) */
  S.cam.x = S.camT.x = c.x; S.cam.y = S.camT.y = c.y - c.vh * 0.35;
  arrive(c, opts);
}

function startTravel(path, opts) {
  const pts = path.map(s => { const c = C.get(s); return [c.x, c.y - c.fl * 0.4]; });
  S.travel = { path, pts, seg: 0, t: 0, opts: opts || {}, dur: 0 };
  segDur();
  closeJournal();
  S.dirty = true;
}
function segDur() {
  const t = S.travel;
  const [ax, ay] = t.pts[t.seg], [bx, by] = t.pts[t.seg + 1];
  const d = Math.hypot(bx - ax, by - ay);
  t.dur = clamp(d * 0.36, 420, 1250) * (t.pts.length > 2 ? 0.55 : 1);
}
function stepTravel(dt) {
  const t = S.travel; if (!t) return;
  t.t += dt;
  const k = Math.min(1, t.t / t.dur);
  const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const [ax, ay] = t.pts[t.seg], [bx, by] = t.pts[t.seg + 1];
  /* slight passage sag between chambers */
  const mx = (ax + bx) / 2, my = (ay + by) / 2 + Math.hypot(bx - ax, by - ay) * 0.08;
  const q = (p0, p1, p2, u) => lerp(lerp(p0, p1, u), lerp(p1, p2, u), u);
  S.camT.x = q(ax, mx, bx, e); S.camT.y = q(ay, my, by, e) - 120;
  markVisited(t.path[t.seg]);
  if (k >= 1) {
    t.seg++;
    if (t.seg >= t.pts.length - 1) {
      const dest = C.get(t.path[t.path.length - 1]);
      S.travel = null;
      arrive(dest, t.opts);
    } else { t.t = 0; segDur(); }
  }
}

function spawnEcho(c) {
  const n = Math.min(c.inbound, 14);
  for (let i = 0; i < n; i++) {
    S.rings.push({ x: c.x, y: c.y - c.vh * 0.35, r: 10, v: 85 + i * 6, a: 0.5, maxR: 320, delay: i * 110, born: performance.now() });
  }
}

/* ---------------- router ---------------- */
function onHash() {
  const m = location.hash.match(/^#(\/[^#]+)(?:#(.+))?$/);
  if (!m) return;
  const slug = m[1];
  if (C.has(slug) && slug !== S.cur) goTo(slug, { anchor: m[2] || null, via: 'hash' });
  else if (C.has(slug) && m[2]) {
    const el = document.getElementById(m[2]);
    if (el) el.scrollIntoView({ block: 'start' });
  }
}
window.addEventListener('hashchange', onHash);

/* =========================================================================
   THE CAVE — mineral dark, one lamp, fog of war that never gates access
   ========================================================================= */
let handPath = null;
function makeHandPath() {
  const p = new Path2D();
  /* palm */
  p.ellipse(0, 6, 9.5, 11, 0, 0, TAU);
  /* thumb + four fingers as capsules */
  const F = [[-11, 2, -16, 10, 3.6], [-6.5, -14, -8, -4, 3.2], [-2, -18, -2.5, -5, 3.4], [2.6, -19, 2.5, -5, 3.4], [7.5, -15, 7, -4, 3.1]];
  for (const [x1, y1, x2, y2, r] of F) {
    p.moveTo(x1 + r, y1);
    p.arc(x1, y1, r, 0, TAU);
    p.arc(x2, y2, r, 0, TAU);
    const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
    p.moveTo(x1 + Math.cos(a) * r, y1 + Math.sin(a) * r);
    p.lineTo(x2 + Math.cos(a) * r, y2 + Math.sin(a) * r);
    p.lineTo(x2 - Math.cos(a) * r, y2 - Math.sin(a) * r);
    p.lineTo(x1 - Math.cos(a) * r, y1 - Math.sin(a) * r);
    p.closePath();
  }
  return p;
}

/* hall roster: authors of the hall chamber, oldest span first (lowest) */
let hallRoster = null;
function getHallRoster() {
  if (hallRoster) return hallRoster;
  const c = C.get(DER.hall);
  hallRoster = c.prov.authors.map(a => ({
    name: a,
    first: (DER.authorSpan[a] || {}).first || c.prov.first,
    last: (DER.authorSpan[a] || {}).last || c.prov.last,
    chambers: (DER.authorSpan[a] || {}).chambers || 1
  })).sort((x, y) => x.first < y.first ? -1 : x.first > y.first ? 1 : (y.chambers - x.chambers) || (x.name < y.name ? -1 : 1));
  return hallRoster;
}

function crystalsFor(c) {
  if (c._crystals) return c._crystals;
  const rnd = mulberry(c.seed ^ 0x51ed);
  const n = Math.min(c.code, 60);
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push([lerp(-c.rx * 0.8, c.rx * 0.8, rnd()), c.fl * (0.3 + rnd() * 0.5), 1.6 + rnd() * 2.4]);
  }
  return (c._crystals = arr);
}
function veinsFor(c) {
  if (c._veins || c.purity >= 1) return c._veins || [];
  const rnd = mulberry(c.seed ^ 0xabcd);
  const n = 2 + ((c.seed >>> 4) % 3);
  const vv = [];
  for (let i = 0; i < n; i++) {
    const x0 = lerp(-c.rx * 0.7, c.rx * 0.7, rnd());
    const pts = [[x0, c.fl * 0.5]];
    let x = x0, y = c.fl * 0.5;
    const steps = 4 + (rnd() * 3 | 0);
    for (let s = 0; s < steps; s++) {
      x += (rnd() - 0.5) * c.rx * 0.5;
      y -= (c.vh + c.fl) / steps * (0.6 + rnd() * 0.5);
      pts.push([x, y]);
    }
    vv.push(pts);
  }
  return (c._veins = vv);
}

function lampPos() {
  return { x: S.camT.x, y: S.camT.y + 120 };
}

let MOUTH_HITS = [];   /* screen-space clickables rebuilt each cave frame */

function drawCave(now, dt) {
  const lamp = lampPos();
  const cur = C.get(S.cur);
  const lampGlobal = S.lampOut ? 0.06 : 1;

  /* backdrop */
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#07080a';
  ctx.fillRect(0, 0, VW, VH);

  /* flicker: stronger when a draft blows from an uncharted mouth */
  if (!S.calm && !S.lampOut) {
    S.flickT += dt;
    if (S.flickT > 46) {
      S.flickT = 0;
      const amp = S.draftNear ? 0.16 : 0.05;
      S.flick = lerp(S.flick, (Math.random() - 0.5) * amp, 0.5);
    }
  } else S.flick = 0;
  const lampR = 1080 * (1 + S.flick);

  const bright = (c) => {
    let base = 0;
    if (c.slug === S.cur) base = 1;
    else if (S.visited.has(c.slug)) base = 0.42;
    else return 0;
    const d = Math.hypot(c.x - lamp.x, c.y - c.vh * 0.4 - lamp.y);
    return base * clamp(1.45 - d / lampR, 0.10, 1) * lampGlobal;
  };

  /* world space */
  const Z = S.zoom;
  ctx.setTransform(DPR * Z, 0, 0, DPR * Z, DPR * (VW / 2 - S.cam.x * Z), DPR * (VH / 2 - S.cam.y * Z));
  const vx0 = S.cam.x - VW / (2 * Z) - 340, vx1 = S.cam.x + VW / (2 * Z) + 340;
  const vy0 = S.cam.y - VH / (2 * Z) - 360, vy1 = S.cam.y + VH / (2 * Z) + 360;
  const inView = (c) => c.x + c.rx > vx0 && c.x - c.rx < vx1 && c.y + c.fl > vy0 && c.y - c.vh < vy1;

  /* passages: only between surveyed rooms; lamp proximity lights them */
  ctx.lineCap = 'round';
  for (const [a, b] of D.graph.edges) {
    const ca = C.get(a), cb = C.get(b);
    if (!ca || !cb) continue;
    if (!(S.visited.has(a) && S.visited.has(b))) continue;
    if (!inView(ca) && !inView(cb)) continue;
    const mx = (ca.x + cb.x) / 2, my = (ca.y + cb.y) / 2;
    const prox = clamp(1.3 - Math.hypot(mx - lamp.x, my - lamp.y) / (lampR * 1.35), 0.05, 1) * lampGlobal;
    ctx.strokeStyle = `rgba(140,110,70,${0.30 * prox})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(ca.x, ca.y - ca.fl * 0.1);
    ctx.quadraticCurveTo(mx, my + Math.hypot(cb.x - ca.x, cb.y - ca.y) * 0.07, cb.x, cb.y - cb.fl * 0.1);
    ctx.stroke();
  }
  /* freshly inked resurvey route: brief warm flash */
  if (S.routeGlow.length > 1) {
    const age = (now - S.routeGlowT) / 4200;
    if (age < 1) {
      ctx.strokeStyle = `rgba(232,196,120,${0.5 * (1 - age) * lampGlobal})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      S.routeGlow.forEach((c, i) => i ? ctx.lineTo(c.x, c.y) : ctx.moveTo(c.x, c.y));
      ctx.stroke();
    } else S.routeGlow = [];
  }

  beginLabels();
  MOUTH_HITS = [];

  /* chambers */
  for (const c of C.values()) {
    if (!inView(c)) continue;
    const b = bright(c);
    if (b <= 0.02) continue;
    ctx.save();
    ctx.translate(c.x, c.y);
    /* mineral wash */
    ctx.fillStyle = rgba(c.color, 0.34 * b);
    ctx.fill(c.path);
    /* wall rim */
    ctx.strokeStyle = rgba(c.color, 0.9 * b);
    ctx.lineWidth = 2.2;
    ctx.stroke(c.path);
    ctx.strokeStyle = rgba(c.color, 0.16 * b);
    ctx.lineWidth = 10;
    ctx.stroke(c.path);
    /* floor */
    ctx.strokeStyle = `rgba(30,24,16,${0.8 * b})`;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-c.rx * 0.96, c.fl * 0.55); ctx.quadraticCurveTo(0, c.fl * 1.05, c.rx * 0.96, c.fl * 0.55); ctx.stroke();
    /* veins where the seam is impure (alpha = 1 - purity, a real field) */
    if (c.purity < 1 && b > 0.15) {
      ctx.strokeStyle = rgba(c.vein, (1 - c.purity) * 0.85 * b);
      ctx.lineWidth = 1.6;
      for (const v of veinsFor(c)) {
        ctx.beginPath();
        v.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
        ctx.stroke();
      }
    }
    /* dripstone: length is careDays; a column = three years of tending */
    if (c.prov.careDays > 0 && b > 0.12) {
      const rnd0 = mulberry(c.seed ^ 0x77);
      const dx = (rnd0() - 0.5) * c.rx * 0.5;
      const L = Math.max(10, (c.vh + c.fl * 0.4) * 0.86 * (c.prov.careDays / DER.maxCareDays));
      const topY = -c.vh * 0.92;
      const isColumn = c.prov.careDays >= 1095;
      ctx.fillStyle = `rgba(216,201,163,${0.55 * b})`;
      ctx.beginPath();
      if (isColumn) {
        ctx.moveTo(dx - 9, topY); ctx.quadraticCurveTo(dx - 3.2, (topY + c.fl) / 2, dx - 7, c.fl * 0.8);
        ctx.lineTo(dx + 7, c.fl * 0.8); ctx.quadraticCurveTo(dx + 3.2, (topY + c.fl) / 2, dx + 9, topY);
      } else {
        ctx.moveTo(dx - 7, topY); ctx.quadraticCurveTo(dx - 1.6, topY + L * 0.7, dx, topY + L);
        ctx.quadraticCurveTo(dx + 1.6, topY + L * 0.7, dx + 7, topY);
        /* its answering stalagmite */
        ctx.moveTo(dx - 6, c.fl * 0.8); ctx.quadraticCurveTo(dx, c.fl * 0.8 - L * 0.45, dx + 6, c.fl * 0.8);
      }
      ctx.closePath(); ctx.fill();
    }
    /* crystal pools: one glint per code block */
    if (c.code > 0 && b > 0.2) {
      ctx.strokeStyle = `rgba(160,232,202,${0.8 * b})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (const [gx, gy, gs] of crystalsFor(c)) {
        ctx.moveTo(gx - gs, gy); ctx.lineTo(gx + gs, gy);
        ctx.moveTo(gx, gy - gs); ctx.lineTo(gx, gy + gs);
      }
      ctx.stroke();
    }
    ctx.restore();

    /* daylight shaft at the entrance */
    if (c.slug === DER.entrance && b > 0.1) {
      const grad = ctx.createLinearGradient(c.x, c.y - c.vh - 460, c.x, c.y);
      grad.addColorStop(0, `rgba(224,232,238,${0.11 * b * lampGlobal})`);
      grad.addColorStop(1, 'rgba(224,232,238,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(c.x - 16, c.y - c.vh - 460); ctx.lineTo(c.x + 34, c.y - c.vh - 460);
      ctx.lineTo(c.x + c.rx * 0.34, c.y); ctx.lineTo(c.x - c.rx * 0.34, c.y);
      ctx.fill();
    }

    /* name for surveyed rooms under lamplight */
    if (c.slug !== S.cur && b > 0.14) {
      const [px, py] = worldToScreen(c.x, c.y + c.fl + 12);
      const el = label('nm:' + c.slug, 'wl-name', esc(c.label));
      el._op = clamp(b * 1.4, 0, 0.95);
      placeLabel(el, px, py, true);
    }
  }

  /* sealed pocket boundary, visible only once resurveyed into view */
  if (WORLD.sealedBox) {
    const sb = WORLD.sealedBox;
    if (sb.x < vx1 && sb.x + sb.w > vx0 && sb.y < vy1 && sb.y + sb.h > vy0) {
      ctx.setLineDash([14, 10]);
      ctx.strokeStyle = `rgba(150,90,60,${0.5 * lampGlobal})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(sb.x, sb.y, sb.w, sb.h);
      ctx.setLineDash([]);
      const [px, py] = worldToScreen(sb.x + sb.w / 2, sb.y + 26);
      placeLabel(label('sealedbox', 'wl-mouth', 'SEALED POCKETS — no passage has ever cited a way in'), px, py, true);
    }
  }

  if (cur) drawCurrentChamber(cur, now, dt, lampGlobal);

  /* echo rings */
  ctx.lineWidth = 1.6;
  for (let i = S.rings.length - 1; i >= 0; i--) {
    const r = S.rings[i];
    if (now - r.born < r.delay) continue;
    if (!S.calm) { r.r += r.v * dt / 1000; r.a *= Math.pow(0.975, dt / 16); }
    else { r.r += r.v * 0.06; r.a *= 0.9; }
    if (r.a < 0.02 || r.r > (r.maxR || 300)) { S.rings.splice(i, 1); continue; }
    ctx.strokeStyle = `rgba(226,199,138,${r.a * lampGlobal})`;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, TAU); ctx.stroke();
  }

  /* ---- screen-space light and matter ---- */
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const [lx, ly] = worldToScreen(lamp.x, lamp.y);
  if (!S.lampOut) {
    const g = ctx.createRadialGradient(lx, ly, 10, lx, ly, VH * 0.82 * (1 + S.flick));
    g.addColorStop(0, 'rgba(244,200,119,0.26)');
    g.addColorStop(0.35, 'rgba(214,160,80,0.10)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VW, VH);
    const g2 = ctx.createRadialGradient(lx, ly, 2, lx, ly, 150 * (1 + S.flick * 2));
    g2.addColorStop(0, 'rgba(255,222,150,0.16)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, VW, VH);
  }
  /* vignette */
  const vg = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.32, VW / 2, VH / 2, VH * 0.95);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, S.lampOut ? 'rgba(0,0,0,0.88)' : 'rgba(0,0,0,0.62)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, VW, VH);
  /* grain */
  if (grainPat) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = grainPat;
    ctx.fillRect(0, 0, VW, VH);
    ctx.globalAlpha = 1;
  }
  endLabels();
}

function drawCurrentChamber(c, now, dt, lampGlobal) {
  /* mouths of every passage out of this room, spread along the walls */
  const cy0 = (c.fl - c.vh) / 2, ery = (c.vh + c.fl) / 2;
  if (!c._mouthAng || c._mouthAng.n !== c.neighbors.length) {
    const des = c.neighbors.map(nSlug => {
      const nb = C.get(nSlug);
      return [nSlug, Math.atan2(nb.y - c.y, nb.x - c.x)];
    }).sort((a, b2) => a[1] - b2[1]);
    let sx = 0, sy = 0;
    for (const [, a] of des) { sx += Math.cos(a); sy += Math.sin(a); }
    const mean = Math.atan2(sy, sx);
    const range = des.length > 1 ? des[des.length - 1][1] - des[0][1] : 0;
    const spread = Math.min(TAU * 0.92, Math.max(range, des.length * 0.34));
    const map = {};
    des.forEach(([slug], i) => {
      map[slug] = des.length === 1 ? mean : mean - spread / 2 + spread * (i / (des.length - 1));
    });
    c._mouthAng = { n: c.neighbors.length, map };
  }
  let mi = 0;
  for (const nSlug of c.neighbors) {
    const nb = C.get(nSlug);
    const ang = c._mouthAng.map[nSlug];
    const wallX = c.x + Math.cos(ang) * c.rx * 0.99;
    const wallY = c.y + cy0 + Math.sin(ang) * ery * 0.95;
    const mR = clamp(9 + Math.sqrt(nb.words) * 0.14, 10, 22);
    const mx = c.x + Math.cos(ang) * (c.rx + 34);
    const my = c.y + cy0 + Math.sin(ang) * (ery + 30);
    mi++;
    /* stub of passage from the wall to the mouth */
    ctx.strokeStyle = `rgba(120,95,60,${0.55 * lampGlobal})`;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(wallX, wallY); ctx.lineTo(mx, my); ctx.stroke();
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(ang + Math.PI / 2);
    const mg = ctx.createRadialGradient(0, 0, 1, 0, 0, mR + 8);
    mg.addColorStop(0, `rgba(0,0,0,${0.95 * lampGlobal})`);
    mg.addColorStop(0.75, `rgba(0,0,0,${0.5 * lampGlobal})`);
    mg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = mg;
    ctx.beginPath(); ctx.ellipse(0, 0, mR, mR * 1.35, 0, 0, TAU); ctx.fill();
    /* faint full rim, then a lit arch on the side facing the lamp */
    ctx.strokeStyle = `rgba(190,158,104,${0.28 * lampGlobal})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(0, 0, mR, mR * 1.35, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = `rgba(205,170,112,${0.85 * lampGlobal})`;
    ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.ellipse(0, 0, mR, mR * 1.35, 0, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    ctx.restore();

    const visitedN = S.visited.has(nSlug);
    const isDraft = DER.uncited.has(nSlug) && !visitedN;
    const below = Math.sin(ang) >= 0;
    const off = (26 + (mi % 4) * 13) * (below ? 1 : -1) - (below ? 0 : 12);
    const [px, py] = worldToScreen(mx, my + off);
    const txt = visitedN
      ? esc(nb.label)
      : `<span class="q">?</span> · echo ×${nb.inbound}` + (isDraft ? ' · <span class="q">a draft breathes</span>' : '');
    const el = label('mo:' + nSlug, 'wl-mouth', txt);
    el._op = S.lampOut ? 0.15 : 0.9;
    placeLabel(el, px, py, true);
    MOUTH_HITS.push({ slug: nSlug, px: px, py: py - off, r: 34 });

    /* the unseen room answers: rings at its mouth, cadence from inbound */
    if (!visitedN && !S.calm && !S.lampOut) {
      const period = clamp(3400 - nb.inbound * 46, 700, 3400);
      if (!el._nextPulse || now > el._nextPulse) {
        el._nextPulse = now + period;
        S.rings.push({ x: mx, y: my, r: 4, v: 46, a: 0.3, maxR: 90, delay: 0, born: now });
      }
    }
  }

  /* the room's name, spoken once above its vault */
  {
    const isHall = c.slug === DER.hall;
    const [tx, ty] = worldToScreen(c.x, c.y - c.vh - (isHall ? 118 : 44));
    const el = label('curname', 'wl-curname', esc(c.label));
    el._op = S.lampOut ? 0.1 : 0.95;
    placeLabel(el, tx, ty, true);
  }
  /* plaque: every chamber names its keeper (salvaged from The Hollows) */
  const [qx, qy] = worldToScreen(c.x, c.y + c.fl + (c.slug === DER.hall ? 34 : 40));
  if (c.prov.topAuthor) {
    const el = label('plaque', 'wl-plaque',
      `kept by ${esc(c.prov.topAuthor)} · ${c.prov.commits} commit${c.prov.commits === 1 ? '' : 's'} · ${esc(c.prov.first)} → ${esc(c.prov.last)}`);
    el._op = S.lampOut ? 0.12 : 1;
    placeLabel(el, qx, qy, true);
  }

  /* drips at true commit cadence */
  const rnd0 = mulberry(c.seed ^ 0x77);
  const dx = c.x + (rnd0() - 0.5) * c.rx * 0.5;
  const L = Math.max(10, (c.vh + c.fl * 0.4) * 0.86 * (c.prov.careDays / DER.maxCareDays));
  const tipY = c.prov.careDays >= 1095 ? c.y - c.vh * 0.35 : c.y - c.vh * 0.92 + L;
  if (c.prov.commits > 0 && !S.calm) {
    const period = clamp(60000 / c.prov.commits, 380, 15000);
    if (now - S.lastDrip > period) {
      S.lastDrip = now;
      S.drips.push({ x: dx, y: tipY, vy: 0, floor: c.y + c.fl * 0.72 });
      audioDrip();
    }
    for (let i = S.drips.length - 1; i >= 0; i--) {
      const d = S.drips[i];
      d.vy += 0.0011 * dt * 16; d.y += d.vy * dt;
      if (d.y >= d.floor) {
        S.drips.splice(i, 1);
        S.rings.push({ x: d.x, y: d.floor, r: 2, v: 40, a: 0.4, maxR: 70, delay: 0, born: now });
        continue;
      }
      ctx.fillStyle = `rgba(200,220,230,${0.75 * lampGlobal})`;
      ctx.beginPath(); ctx.ellipse(d.x, d.y, 1.6, 3.4, 0, 0, TAU); ctx.fill();
    }
  } else if (c.prov.commits > 0) {
    ctx.fillStyle = `rgba(200,220,230,${0.6 * lampGlobal})`;
    ctx.beginPath(); ctx.ellipse(dx, tipY + 5, 1.8, 3.6, 0, 0, TAU); ctx.fill();
  }

  /* glowworms: night edits bloom blue-green when the lamp dies */
  if (S.lampOut) {
    const n = c.prov.night;
    if (n > 0) {
      const rnd = mulberry(c.seed ^ 0xbeef);
      for (let i = 0; i < n; i++) {
        const wx = c.x + (rnd() - 0.5) * c.rx * 1.3;
        const wy = c.y - c.vh * (0.45 + rnd() * 0.45);
        const tw = S.calm ? 1 : 0.72 + 0.28 * Math.sin(now / 640 + i * 2.1);
        const g = ctx.createRadialGradient(wx, wy, 0.5, wx, wy, 26);
        g.addColorStop(0, `rgba(125,245,207,${0.85 * tw})`);
        g.addColorStop(0.25, `rgba(90,220,190,${0.28 * tw})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(wx, wy, 26, 0, TAU); ctx.fill();
      }
    }
  }

  /* THE HALL OF HANDS */
  if (c.slug === DER.hall) drawHall(c, now);
}

function drawHall(c, now) {
  if (!handPath) handPath = makeHandPath();
  const roster = getHallRoster();
  const n = roster.length;
  /* two friezes: the older half low along the floor, the newer half higher */
  const perRow = Math.ceil(n / 2);
  const rows = [roster.slice(0, perRow), roster.slice(perRow)];
  const t0 = S.handsShownAt || now;
  roster.forEach((h, idx) => {
    const ri = idx < perRow ? 0 : 1, ci = ri === 0 ? idx : idx - perRow;
    const rowLen = rows[ri].length;
    const rnd = mulberry(hashStr(h.name) ^ c.seed);
    const rowY = ri === 0 ? -c.vh * 0.10 : -c.vh * 0.52;
    const wy = c.y + rowY + (rnd() - 0.5) * 12;
    const t = clamp(-rowY / c.vh, 0, 0.95);
    const xmax = c.rx * Math.sqrt(1 - t * t) * 0.9;
    const wx = c.x + lerp(-xmax, xmax, rowLen === 1 ? 0.5 : ci / (rowLen - 1)) + (rnd() - 0.5) * 12;
    const fade = S.calm ? 1 : clamp((now - t0) / 480 - idx * 0.75, 0, 1);
    if (fade <= 0) return;
    const dim = S.lampOut ? 0.12 : 1;
    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate((rnd() - 0.5) * 0.5);
    const sc = 0.92 + rnd() * 0.22;
    ctx.scale(sc, sc);
    /* ochre spray */
    const sp = ctx.createRadialGradient(0, 0, 3, 0, 0, 30);
    sp.addColorStop(0, `rgba(201,138,61,${0.66 * fade * dim})`);
    sp.addColorStop(0.75, `rgba(178,110,48,${0.30 * fade * dim})`);
    sp.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sp;
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.fill();
    /* the hand itself: bare stone left by the maker's palm */
    ctx.fillStyle = `rgba(24,19,13,${0.88 * fade * dim})`;
    ctx.fill(handPath);
    ctx.restore();
    /* labels live in calm bands clear of the stencils: below the floor for
       the old frieze, above the vault for the young one */
    const above = ri === 1;
    const slot = ci % 3;
    const ly = above ? c.y - c.vh - 10 - slot * 24 : c.y + c.fl + 66 + slot * 24;
    const [px, py] = worldToScreen(wx, ly);
    const el = label('hand:' + h.name, 'wl-hand',
      `${esc(h.name)}<small>${esc(h.first)} → ${esc(h.last)} · ${h.chambers} chamber${h.chambers === 1 ? '' : 's'}</small>`);
    el._op = fade * (S.lampOut ? 0.15 : 1);
    placeLabel(el, px, py, true, above);
  });
}

/* =========================================================================
   SURVEY VIEW — the whole cave, fully lit, in club-drafting ink on paper.
   Always one keystroke away. Geometry gates atmosphere, never access.
   ========================================================================= */
function fitSurvey() {
  const k = Math.min(VW / (WORLD.w + 900), VH / (WORLD.h + 700)) * 0.98;
  S.surv.k = k;
  S.surv.x = WORLD.w / 2 + 200;
  S.surv.y = WORLD.h / 2;
}
function drawSurvey(now) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  /* toned paper, stained edges — wholly unlike a sea at night */
  const pg = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.2, VW / 2, VH / 2, VH * 1.05);
  pg.addColorStop(0, '#ecdfc2');
  pg.addColorStop(0.8, '#e3d2ac');
  pg.addColorStop(1, '#d3bd8f');
  ctx.fillStyle = pg;
  ctx.fillRect(0, 0, VW, VH);
  if (grainPat) { ctx.globalAlpha = 0.35; ctx.fillStyle = grainPat; ctx.fillRect(0, 0, VW, VH); ctx.globalAlpha = 1; }

  const k = S.surv.k;
  ctx.setTransform(DPR * k, 0, 0, DPR * k, DPR * (VW / 2 - S.surv.x * k), DPR * (VH / 2 - S.surv.y * k));

  /* depth band rules + counts: the derivation, printed on the sheet */
  ctx.strokeStyle = 'rgba(90,66,32,0.25)';
  ctx.fillStyle = 'rgba(70,50,25,0.75)';
  ctx.lineWidth = 1 / k;
  ctx.font = `${13 / k}px Georgia, serif`;
  DER.bands.forEach((count, lv) => {
    const y = WORLD.bandY[lv];
    ctx.beginPath(); ctx.moveTo(-700, y - 320); ctx.lineTo(WORLD.w + 240, y - 320); ctx.stroke();
    ctx.fillText(`level −${lv} — ${count} chamber${count === 1 ? '' : 's'}`, -680, y - 300);
  });

  /* all 1,231 passages in fine ink */
  ctx.strokeStyle = 'rgba(90,60,25,0.20)';
  ctx.lineWidth = 1.0 / k;
  ctx.beginPath();
  for (const [a, b] of D.graph.edges) {
    const ca = C.get(a), cb = C.get(b);
    if (!ca || !cb) continue;
    ctx.moveTo(ca.x, ca.y - ca.fl * 0.1);
    ctx.lineTo(cb.x, cb.y - cb.fl * 0.1);
  }
  ctx.stroke();

  /* every chamber, outlined; surveyed rooms carry your ink */
  const showNames = k > 0.34;
  const sx0 = S.surv.x - VW / (2 * k) - 240, sx1 = S.surv.x + VW / (2 * k) + 240;
  const sy0 = S.surv.y - VH / (2 * k) - 240, sy1 = S.surv.y + VH / (2 * k) + 240;
  for (const c of C.values()) {
    if (c.x < sx0 || c.x > sx1 || c.y < sy0 || c.y > sy1) continue;
    const mine = S.visited.has(c.slug);
    ctx.save();
    ctx.translate(c.x, c.y);
    if (mine) { ctx.fillStyle = 'rgba(120,84,36,0.16)'; ctx.fill(c.path); }
    else if (S.charted) { ctx.fillStyle = 'rgba(120,84,36,0.05)'; ctx.fill(c.path); }
    ctx.strokeStyle = mine ? 'rgba(61,43,26,0.95)' : 'rgba(85,62,34,0.45)';
    ctx.lineWidth = (mine ? 2.4 : 1.3) / k;
    ctx.stroke(c.path);
    if (c.slug === S.cur) {
      ctx.strokeStyle = 'rgba(160,90,20,0.9)';
      ctx.lineWidth = 2 / k;
      ctx.beginPath(); ctx.arc(0, -c.vh * 0.3, c.rx + 26, 0, TAU); ctx.stroke();
    }
    ctx.restore();
    if (showNames) {
      ctx.fillStyle = mine ? 'rgba(50,35,18,0.95)' : 'rgba(80,58,30,0.62)';
      ctx.font = `${11.5 / k}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText(c.label.length > 34 ? c.label.slice(0, 33) + '…' : c.label, c.x, c.y + c.fl + 16 / k);
      ctx.textAlign = 'left';
    }
  }
  /* sealed pockets called out on the sheet */
  if (WORLD.sealedBox) {
    const sb = WORLD.sealedBox;
    ctx.setLineDash([10 / k, 8 / k]);
    ctx.strokeStyle = 'rgba(140,60,30,0.8)';
    ctx.lineWidth = 1.6 / k;
    ctx.strokeRect(sb.x, sb.y, sb.w, sb.h);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(140,60,30,0.9)';
    ctx.font = `italic ${13 / k}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText('SEALED POCKETS', sb.x + sb.w / 2, sb.y - 34 / k);
    ctx.fillText('resurvey (search) only', sb.x + sb.w / 2, sb.y - 16 / k);
    ctx.textAlign = 'left';
  }

  /* cartouche, drafted into the bottom-left corner of the sheet */
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = 'rgba(61,43,26,0.95)';
  ctx.font = '600 16px Georgia, serif';
  ctx.fillText('SURVEY OF THE STRAPI DOCUMENTATION CAVE', 22, VH - 92);
  ctx.font = 'italic 12.5px Georgia, serif';
  ctx.fillStyle = 'rgba(80,58,30,0.9)';
  ctx.fillText(`${DER.totalPages} chambers · ${DER.totalEdges} passages · entrance at ${DER.entrance}`, 22, VH - 74);
  ctx.fillText(`depth bands by citation from the entrance: ${DER.bands.join(' / ')} — ${DER.sealed.length} sealed pockets`, 22, VH - 58);
  ctx.fillText(`floor ${DER.totalWords.toLocaleString('en-US')} words · ${DER.hands} hands · ${DER.totalCommits.toLocaleString('en-US')} drips of care`, 22, VH - 42);
  ctx.fillText('click any chamber to go there · drag to pan · wheel to zoom · S returns to the dark', 22, VH - 26);
}

function surveyHit(px, py) {
  const [wx, wy] = screenToSurv(px, py);
  let best = null, bd = 1e9;
  for (const c of C.values()) {
    const d = Math.hypot(c.x - wx, (c.y - c.vh * 0.3) - wy);
    if (d < c.rx + 90 && d < bd) { bd = d; best = c; }
  }
  return best;
}

/* =========================================================================
   THE SURVEY SHEET — sepia paper, your ink only, persisted
   ========================================================================= */
const sheetCv = $('sheet-canvas'), sheetCtx = sheetCv.getContext('2d');
function drawSheet() {
  const w = 336, h = 248;
  const g = sheetCtx;
  const sdpr = Math.min(window.devicePixelRatio || 1, 2);
  if (sheetCv.width !== w * sdpr) { sheetCv.width = w * sdpr; sheetCv.height = h * sdpr; }
  g.setTransform(sdpr, 0, 0, sdpr, 0, 0);
  g.clearRect(0, 0, w, h);
  /* plan margin rules */
  g.strokeStyle = 'rgba(70,50,25,0.5)';
  g.lineWidth = 0.8;
  g.strokeRect(6, 6, w - 12, h - 44);
  g.fillStyle = 'rgba(61,43,26,0.95)';
  g.font = '600 10px Georgia, serif';
  g.fillText('LAMPFALL SURVEY — extended elevation', 12, 18);
  if (!WORLD.bbox) {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const c of C.values()) {
      x0 = Math.min(x0, c.x - c.rx); x1 = Math.max(x1, c.x + c.rx);
      y0 = Math.min(y0, c.y - c.vh); y1 = Math.max(y1, c.y + c.fl);
    }
    WORLD.bbox = { x0, x1, y0, y1 };
  }
  const bb = WORLD.bbox;
  const k = Math.min((w - 44) / (bb.x1 - bb.x0), (h - 96) / (bb.y1 - bb.y0));
  const ox = 22 - bb.x0 * k + ((w - 44) - (bb.x1 - bb.x0) * k) / 2;
  const oy = 28 - bb.y0 * k + ((h - 96) - (bb.y1 - bb.y0) * k) / 2;
  /* passages between rooms I have walked */
  g.strokeStyle = 'rgba(90,60,25,0.5)';
  g.lineWidth = 0.5;
  g.beginPath();
  for (const [a, b] of D.graph.edges) {
    if (!(S.visited.has(a) && S.visited.has(b)) && !S.charted) continue;
    const ca = C.get(a), cb = C.get(b);
    g.moveTo(ox + ca.x * k, oy + ca.y * k);
    g.lineTo(ox + cb.x * k, oy + cb.y * k);
  }
  g.stroke();
  /* chamber marks: bold ink = surveyed by me, faint = club archive */
  for (const c of C.values()) {
    const mine = S.visited.has(c.slug);
    if (!mine && !S.charted) continue;
    g.strokeStyle = mine ? 'rgba(50,34,16,0.95)' : 'rgba(80,58,30,0.4)';
    g.lineWidth = mine ? 1.1 : 0.6;
    const rx = Math.max(1.4, c.rx * k * 1.5), ry = Math.max(1, (c.vh + c.fl) * k * 0.8);
    g.beginPath();
    g.ellipse(ox + c.x * k, oy + c.y * k, rx, ry, 0, 0, TAU);
    g.stroke();
  }
  /* the lamp, now */
  const cur = C.get(S.cur);
  if (cur) {
    g.fillStyle = 'rgba(170,100,20,0.95)';
    g.beginPath(); g.arc(ox + cur.x * k, oy + cur.y * k, 2.6, 0, TAU); g.fill();
  }
  /* band ticks on the margin */
  g.fillStyle = 'rgba(80,58,30,0.85)';
  g.font = '8.5px Georgia, serif';
  DER.bands.forEach((count, lv) => {
    const y = oy + WORLD.bandY[lv] * k;
    g.fillText(`−${lv}`, 9, y + 3);
  });
  /* the derivation, printed on the sheet (the law of the cave) */
  g.font = 'italic 9.5px Georgia, serif';
  g.fillStyle = 'rgba(61,43,26,0.9)';
  g.fillText(`bands by citation-depth from ${DER.entrance}:`, 12, h - 30);
  g.fillText(`${DER.bands.map((n, i) => n).join(' / ')} chambers · ${DER.sealed.length} sealed pockets beyond all passages`, 12, h - 18);
  g.fillText(`${DER.totalEdges} passages · ${DER.totalWords.toLocaleString('en-US')} words of floor`, 12, h - 6);

  /* text lines below the plan */
  const worms = [...S.wormsFound].reduce((s, sl) => s + (C.get(sl)?.prov.night || 0), 0);
  const lines = $('sheet-lines');
  const traversed = [...Array(DER.bands.length).keys()].every(lv =>
    [...S.visited].some(s => C.get(s) && C.get(s).level === lv));
  let quote = '';
  const cur2 = C.get(S.cur);
  if (cur2 && cur2.slug === DER.hall)
    quote = `<div class="sh-quote">${numWord(cur2.prov.authors.length)} hands kept this room. The stone remembers all of them.</div>`;
  lines.innerHTML =
    `<div class="sh-title">Surveyed ${S.visited.size} of ${DER.totalPages}</div>` +
    `<div>Glowworms found: ${worms} of ${DER.totalNight} · kill the lamp where night edits sleep</div>` +
    (S.charted ? `<div>Full survey inked from the club archive.</div>` :
      traversed ? `<div>All ${DER.bands.length} depth bands traversed — the club will trade you its archive.</div>` :
        `<div>Reach every depth band to unlock the full survey.</div>`) +
    quote;
  const fb = $('btn-fullsurvey');
  fb.hidden = !(traversed && !S.charted);
}

/* =========================================================================
   KILL THE LAMP — the beat salvaged from The Hollows
   ========================================================================= */
function killLamp() {
  const c = C.get(S.cur); if (!c) return;
  S.lampOut = !S.lampOut;
  const cap = $('nightcap');
  if (S.lampOut) {
    const n = c.prov.night;
    if (n > 0) {
      cap.innerHTML = n === 1
        ? 'a commit made long after midnight'
        : `a commit made long after midnight — ${n} of them glow here`;
      if (!S.wormsFound.has(c.slug)) {
        S.wormsFound.add(c.slug);
        persist(); drawSheet();
      }
    } else {
      cap.textContent = 'the dark is total — no commit here was ever made after midnight';
    }
    cap.hidden = false;
  } else cap.hidden = true;
  $('btn-lamp').textContent = S.lampOut ? 'Relight' : 'Kill the lamp';
  const kbd = document.createElement('kbd'); kbd.textContent = 'L';
  $('btn-lamp').appendChild(kbd);
  S.dirty = true;
}

function setView(v) {
  if (S.view === v) return;
  S.view = v;
  document.body.dataset.view = v;
  if (v === 'survey') { fitSurvey(); closeJournal(); beginLabels(); endLabels(); }
  else { const t = document.getElementById('survey-tip'); if (t) t.remove(); }
  $('btn-survey').setAttribute('aria-pressed', v === 'survey');
  S.dirty = true;
}

/* =========================================================================
   OPTIONAL AUDIO — silent by default, behind a gesture; every sound is a
   countable datum: a drip is a commit, an arrival echo is an inbound citation
   ========================================================================= */
let AC = null;
function ensureAudio() {
  if (AC) return AC;
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; }
  return AC;
}
function blip(freq, t0, dur, gain, type) {
  if (!AC) return;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type || 'sine'; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(AC.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
function audioDrip() {
  if (!S.sound || !AC) return;
  const t = AC.currentTime;
  blip(2100 + Math.random() * 500, t, 0.05, 0.05, 'sine');
  blip(700 + Math.random() * 120, t + 0.012, 0.16, 0.03, 'sine');
}
function audioArrive(c) {
  if (!S.sound || !AC) return;
  const t = AC.currentTime;
  const n = Math.min(c.inbound, 9);
  for (let i = 0; i < n; i++)
    blip(340 - i * 16, t + 0.1 + i * 0.13, 0.3, 0.02 * Math.pow(0.82, i), 'triangle');
}

/* =========================================================================
   INPUT
   ========================================================================= */
function arrowTravel(dx, dy) {
  const c = C.get(S.cur); if (!c || S.travel) return;
  let best = null, bs = 0.25;
  for (const nSlug of c.neighbors) {
    const nb = C.get(nSlug);
    const vx = nb.x - c.x, vy = nb.y - c.y;
    const L = Math.hypot(vx, vy) || 1;
    const dot = (vx / L) * dx + (vy / L) * dy;
    if (dot > bs) { bs = dot; best = nSlug; }
  }
  if (best) goTo(best, { via: 'walk' });
}

window.addEventListener('keydown', (e) => {
  dismissIntro();
  const typing = document.activeElement && document.activeElement.tagName === 'INPUT';
  if (e.key === 'Tab') {
    e.preventDefault();
    if ($('index').hidden) openIndex(); else closeIndex();
    return;
  }
  if (typing) return;
  switch (e.key) {
    case 's': case 'S': setView(S.view === 'cave' ? 'survey' : 'cave'); break;
    case 'l': case 'L': killLamp(); break;
    case 'p': case 'P': S.sheetOpen = !S.sheetOpen; $('sheet').hidden = !S.sheetOpen; if (S.sheetOpen) drawSheet(); break;
    case 'r': case 'R': if (S.journalOpen) closeJournal(); else if (S.cur) openJournal(S.cur); break;
    case 'Escape':
      if (!$('index').hidden) closeIndex();
      else if (S.journalOpen) closeJournal();
      else if (S.view === 'survey') setView('cave');
      break;
    case 'ArrowLeft': e.preventDefault(); if (S.view === 'cave') arrowTravel(-1, 0); break;
    case 'ArrowRight': e.preventDefault(); if (S.view === 'cave') arrowTravel(1, 0); break;
    case 'ArrowUp': e.preventDefault(); if (S.view === 'cave') arrowTravel(0, -1); break;
    case 'ArrowDown': e.preventDefault(); if (S.view === 'cave') arrowTravel(0, 1); break;
  }
});

cv.addEventListener('click', (e) => {
  dismissIntro();
  if (S.view === 'survey') {
    if (S.surv.moved) { S.surv.moved = false; return; }
    const hit = surveyHit(e.clientX, e.clientY);
    if (hit) goTo(hit.slug, { via: 'search' });
    return;
  }
  /* passage mouths first */
  for (const m of MOUTH_HITS) {
    if (Math.hypot(e.clientX - m.px, e.clientY - m.py) < m.r) { goTo(m.slug, { via: 'walk' }); return; }
  }
  /* then rooms under lamplight */
  const wx = (e.clientX - VW / 2) / S.zoom + S.cam.x, wy = (e.clientY - VH / 2) / S.zoom + S.cam.y;
  const cur = C.get(S.cur);
  if (cur && Math.abs(wx - cur.x) < cur.rx && wy > cur.y - cur.vh && wy < cur.y + cur.fl * 1.6) {
    openJournal(cur.slug); return;
  }
  for (const c of C.values()) {
    if (!S.visited.has(c.slug) || c.slug === S.cur) continue;
    if (Math.abs(wx - c.x) < c.rx && wy > c.y - c.vh && wy < c.y + c.fl * 1.6) {
      goTo(c.slug, { via: 'walk' }); return;
    }
  }
});

/* survey pan / zoom */
cv.addEventListener('mousedown', (e) => {
  if (S.view !== 'survey') return;
  S.surv.drag = { x: e.clientX, y: e.clientY, sx: S.surv.x, sy: S.surv.y };
  S.surv.moved = false;
});
window.addEventListener('mousemove', (e) => {
  const d = S.surv.drag; if (!d || S.view !== 'survey') return;
  const dx = e.clientX - d.x, dy = e.clientY - d.y;
  if (Math.abs(dx) + Math.abs(dy) > 4) S.surv.moved = true;
  S.surv.x = d.sx - dx / S.surv.k;
  S.surv.y = d.sy - dy / S.surv.k;
  S.dirty = true;
});
window.addEventListener('mouseup', () => { S.surv.drag = null; });
let tipEl = null;
cv.addEventListener('mousemove', (e) => {
  if (S.view !== 'survey' || S.surv.drag) { if (tipEl) { tipEl.remove(); tipEl = null; } return; }
  const hit = surveyHit(e.clientX, e.clientY);
  if (!hit) { if (tipEl) { tipEl.remove(); tipEl = null; } return; }
  if (!tipEl) { tipEl = document.createElement('div'); tipEl.id = 'survey-tip'; document.body.appendChild(tipEl); }
  const mark = S.visited.has(hit.slug) ? 'surveyed' : (hit.sealed ? 'sealed pocket' : 'uncharted');
  tipEl.innerHTML = esc(hit.label) + ' <small>· ' + esc(hit.slug) + ' · ' + mark + '</small>';
  tipEl.style.left = Math.min(e.clientX + 14, VW - 340) + 'px';
  tipEl.style.top = (e.clientY + 16) + 'px';
});
cv.addEventListener('wheel', (e) => {
  if (S.view !== 'survey') return;
  e.preventDefault();
  const f = Math.exp(-e.deltaY * 0.0012);
  const [wx, wy] = screenToSurv(e.clientX, e.clientY);
  S.surv.k = clamp(S.surv.k * f, 0.05, 2.4);
  S.surv.x = wx - (e.clientX - VW / 2) / S.surv.k;
  S.surv.y = wy - (e.clientY - VH / 2) / S.surv.k;
  S.dirty = true;
}, { passive: false });

/* buttons */
$('btn-index').addEventListener('click', () => { dismissIntro(); if ($('index').hidden) openIndex(); else closeIndex(); });
$('btn-survey').addEventListener('click', () => { dismissIntro(); setView(S.view === 'cave' ? 'survey' : 'cave'); });
$('btn-sheet').addEventListener('click', () => { S.sheetOpen = !S.sheetOpen; $('sheet').hidden = !S.sheetOpen; if (S.sheetOpen) drawSheet(); });
$('btn-lamp').addEventListener('click', () => { dismissIntro(); killLamp(); });
$('btn-read').addEventListener('click', () => { if (S.journalOpen) closeJournal(); else if (S.cur) openJournal(S.cur); });
$('btn-sound').addEventListener('click', () => {
  S.sound = !S.sound;
  if (S.sound) { ensureAudio(); if (AC && AC.state === 'suspended') AC.resume(); }
  $('btn-sound').textContent = 'Sound: ' + (S.sound ? 'on' : 'off');
  $('btn-sound').setAttribute('aria-pressed', String(S.sound));
});
$('btn-calm').addEventListener('click', () => {
  S.calm = !S.calm; S.calmForced = true; persist();
  $('btn-calm').textContent = 'Calm: ' + (S.calm ? 'on' : 'off');
  $('btn-calm').setAttribute('aria-pressed', String(S.calm));
  S.dirty = true;
});
$('btn-fullsurvey').addEventListener('click', () => {
  S.charted = true; persist(); drawSheet(); S.dirty = true;
  caption('The club archive is yours: every chamber faintly inked. Your own survey stays bold.', 5200);
});
function dismissIntro() {
  if (S.introDone) return;
  S.introDone = true;
  $('intro').classList.add('gone');
  setTimeout(() => { $('intro').remove(); }, 900);
}
$('intro-go').addEventListener('click', dismissIntro);

/* =========================================================================
   MAIN LOOP + DIAGNOSTICS
   ========================================================================= */
window.__diag = { frameMs: 0, avgFrameMs: 0, state: 'boot' };
const diagBuf = new Float32Array(120); let diagI = 0, diagN = 0;
let lastT = performance.now();

function frame(now) {
  const t0 = performance.now();
  const dt = Math.min(50, now - lastT); lastT = now;

  if (S.travel) stepTravel(dt);
  /* lamp-bearer's easing walk */
  const ease = 1 - Math.pow(0.0016, dt / 1000);
  const zt = S.travel ? 0.92 : S.zoomT;
  S.zoom = lerp(S.zoom, zt, ease * 0.8);
  const readOff = (S.journalOpen && S.view === 'cave' && !S.travel) ? VW * 0.22 / S.zoom : 0;
  S.cam.x = lerp(S.cam.x, S.camT.x + readOff, ease);
  S.cam.y = lerp(S.cam.y, S.camT.y, ease);
  const camMoving = Math.abs(S.cam.x - (S.camT.x + readOff)) + Math.abs(S.cam.y - S.camT.y) > 0.4
    || Math.abs(S.zoom - zt) > 0.002;

  const ambient = S.view === 'cave' && !S.calm;
  const needDraw = S.dirty || ambient || camMoving || S.travel || S.rings.length > 0;
  if (needDraw) {
    if (S.view === 'cave') drawCave(now, dt);
    else drawSurvey(now);
    S.dirty = false;
  }

  const work = performance.now() - t0;
  diagBuf[diagI] = work; diagI = (diagI + 1) % 120; diagN = Math.min(diagN + 1, 120);
  let sum = 0; for (let i = 0; i < diagN; i++) sum += diagBuf[i];
  window.__diag.frameMs = work;
  window.__diag.avgFrameMs = sum / diagN;
  window.__diag.state = S.view + (S.lampOut ? '+dark' : '') + (S.travel ? '+travel' : '') + (S.calm ? '+calm' : '');
  if (window.__collect) (window.__samples = window.__samples || []).push(work);
  requestAnimationFrame(frame);
}

/* =========================================================================
   BOOT
   ========================================================================= */
async function boot() {
  const [content, graph, communities, provenance] = await Promise.all(
    ['content.json', 'graph.json', 'communities.json', 'provenance.json']
      .map(f => fetch(f).then(r => r.json()))
  );
  D.content = content; D.graph = graph; D.communities = communities; D.provenance = provenance;
  derive();
  buildLayout();
  restore();
  if (!S.calmForced && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) S.calm = true;
  $('btn-calm').textContent = 'Calm: ' + (S.calm ? 'on' : 'off');
  $('btn-calm').setAttribute('aria-pressed', String(S.calm));
  document.body.dataset.view = 'cave';
  resize();
  makeGrain();
  const np = $('n-pages'), ne = $('n-edges');
  if (np) np.textContent = DER.totalPages.toLocaleString('en-US');
  if (ne) ne.textContent = DER.totalEdges.toLocaleString('en-US');
  $('sheet').hidden = !S.sheetOpen;

  const m = location.hash.match(/^#(\/[^#]+)(?:#(.+))?$/);
  const deepLink = m && C.has(m[1]);
  if (deepLink) {
    dismissIntro();
    goTo(m[1], { via: 'boot', anchor: m[2] || null });
  } else {
    goTo(DER.entrance, { via: 'boot', openJournal: false });
    const thr = C.get(DER.entrance).neighbors.length;
    caption(`The entrance. ${numWord(thr)} passages drop into the dark below this threshold.`, 6000);
  }
  refreshHUD();
  drawSheet();
  requestAnimationFrame((t) => { lastT = t; frame(t); });
}
boot().catch(err => {
  document.body.innerHTML = '<pre style="color:#d88;padding:40px;font-family:monospace">Lampfall failed to load its survey data: ' + esc(err && err.message) + '</pre>';
});
