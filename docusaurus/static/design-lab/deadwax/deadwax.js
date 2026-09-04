/* DEAD WAX — the Strapi documentation pressed to vinyl.
   290 records, 27 bins, 1,231 samples. Every mark on screen carries a real field:
   groove arcs = block word counts · cue stickers = citations · dead-wax etchings = git provenance
   SAMPLED BY n = graph.inbound · pressing year = first commit · runtime = words at 200 wpm
   MONO/STEREO = one hand or many · crackles = commits (optional, behind a gesture).
   Vanilla JS + Canvas 2D + DOM. No libraries. Matte print finish; zero scanlines. */
'use strict';

(async function boot() {

/* ---------------------------------------------------------------- palette */
const PAPER = '#F5EBDB', PAPER2 = '#ECDFC6', PAPER3 = '#E2D2B4';
const INK = '#2A0F3D', INK60 = '#6A5578', INK25 = '#C2B4C6';
const VIOLET = '#4945FF', ROSE = '#FF3D6E', APRICOT = '#FFA45E';
const MONO_STACK = '"SF Mono", Menlo, Consolas, ui-monospace, monospace';
const SERIF_STACK = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
const WPM = 200;

const RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- data */
async function getJSON(u) { const r = await fetch(u); if (!r.ok) throw new Error('fetch ' + u); return r.json(); }
const [CONTENT, GRAPH, COMMUNITIES, PROV] = await Promise.all([
  getJSON('content.json'), getJSON('graph.json'), getJSON('communities.json'), getJSON('provenance.json')
]);

const SLUGS = Object.keys(CONTENT.pages);
const N_PAGES = SLUGS.length;

/* bins: the 27 Louvain communities, plus one honest tray for pages Louvain left unfiled */
const BINS = [];
const slugToBin = new Map();
{
  const covered = new Set();
  for (const id of Object.keys(COMMUNITIES)) {
    const c = COMMUNITIES[id];
    const bin = { id: BINS.length, key: id, name: c.dominant, purity: c.purity, hub: c.hub, members: c.members.slice(), size: c.size, unfiled: false };
    BINS.push(bin);
    c.members.forEach(m => { covered.add(m); if (!slugToBin.has(m)) slugToBin.set(m, bin); });
  }
  const stray = SLUGS.filter(s => !covered.has(s));
  if (stray.length) {
    const bin = { id: BINS.length, key: 'WL', name: 'White labels', purity: null, hub: null, members: stray, size: stray.length, unfiled: true };
    BINS.push(bin);
    stray.forEach(m => slugToBin.set(m, bin));
  }
}
const N_BINS_LOUVAIN = Object.keys(COMMUNITIES).length;

/* collection totals — every figure derived */
const TOTAL_WORDS = SLUGS.reduce((a, s) => a + (GRAPH.words[s] || 0), 0);
const ALL_HANDS = new Set(); SLUGS.forEach(s => (PROV[s] ? PROV[s].authors : []).forEach(a => ALL_HANDS.add(a)));
const N_EDGES = GRAPH.edges.length;
const MAX_CARE = Math.max(...SLUGS.map(s => PROV[s] ? PROV[s].careDays : 0));
const MAX_INBOUND = Math.max(...Object.values(GRAPH.inbound));

/* ---------------------------------------------------------------- utils */
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const TAU = Math.PI * 2;
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function stripTags(h) { return String(h || '').replace(/<[^>]*>/g, ' '); }
function countWords(t) { return t ? t.split(/\s+/).filter(Boolean).length : 0; }
function fmtClock(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') : m + ':' + String(s).padStart(2, '0');
}
function fmtLongMin(minutes) {
  const h = Math.floor(minutes / 60), m = Math.round(minutes % 60);
  return h ? h + ' H ' + String(m).padStart(2, '0') + ' MIN' : m + ' MIN';
}
function hashCode(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(seed) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function initials(name) { return String(name || '?').split(/\s+/).filter(Boolean).map(w => w[0].toUpperCase()).join('.') + '.'; }
function storageGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
function storageSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* private window etc. */ } }
function runtimeSec(slug) { return (GRAPH.words[slug] || 0) / WPM * 60; }
function monoStereo(slug) { const p = PROV[slug]; return (p && p.authors.length > 1) ? 'STEREO' : 'MONO'; }
function pressedYear(slug) { const p = PROV[slug]; return p ? p.first.slice(0, 4) : '—'; }
function inboundOf(slug) { return GRAPH.inbound[slug] || 0; }
function binLabel(bin) { return bin.unfiled ? 'WHITE LABELS' : ('BIN ' + String(bin.id + 1).padStart(2, '0') + ' · ' + bin.name.toUpperCase()); }

/* ---------------------------------------------------------------- page model */
function blockText(b) {
  if (!b) return '';
  switch (b.t) {
    case 'p': case 'tldr': return stripTags(b.html);
    case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': return b.text || '';
    case 'ul': case 'ol': return (b.items || []).map(stripTags).join(' ');
    case 'table': return (b.head || []).concat((b.rows || []).flat()).map(stripTags).join(' ');
    case 'code': return b.code || '';
    case 'admonition': return (b.title || '') + ' ' + (b.blocks || []).map(blockText).join(' ');
    case 'details': return (b.summary || '') + ' ' + (b.blocks || []).map(blockText).join(' ');
    case 'tabs': return (b.tabs || []).map(t => (t.blocks || []).map(blockText).join(' ')).join(' ');
    case 'columns': return (b.cols || []).flat().map(blockText).join(' ');
    case 'cards': return (b.items || []).map(i => (i.title || '') + ' ' + (i.desc || '')).join(' ');
    case 'endpoint': return [b.title, b.description].concat((b.params || []).map(p => (p.name || '') + ' ' + (p.desc || ''))).join(' ');
    case 'img': return b.alt || '';
    case 'badge': return b.label || '';
    default: return '';
  }
}
function hasCode(b) {
  if (!b) return false;
  if (b.t === 'code' || b.t === 'endpoint') return true;
  if (b.t === 'tabs') return (b.tabs || []).some(t => (t.blocks || []).some(hasCode));
  if (b.blocks) return b.blocks.some(hasCode);
  if (b.cols) return b.cols.flat().some(hasCode);
  return false;
}
function grooveStyle(b) {
  if (b.t === 'admonition') {
    if (b.kind === 'caution' || b.kind === 'warning' || b.kind === 'danger') return 'caution';
    return 'fine';
  }
  if (hasCode(b)) return 'code';
  if (b.t === 'tldr') return 'fine';
  return 'plain';
}
function collectLinks(b, out) {
  out = out || [];
  const scan = html => {
    if (!html) return;
    const re = /href="#(\/[^"#]+)(?:#([^"]*))?"/g; let m;
    while ((m = re.exec(html))) out.push({ slug: m[1], anchor: m[2] || null });
  };
  if (!b) return out;
  switch (b.t) {
    case 'p': case 'tldr': scan(b.html); break;
    case 'ul': case 'ol': (b.items || []).forEach(scan); break;
    case 'table': (b.rows || []).flat().forEach(scan); (b.head || []).forEach(scan); break;
    case 'admonition': case 'details': (b.blocks || []).forEach(x => collectLinks(x, out)); break;
    case 'tabs': (b.tabs || []).forEach(t => (t.blocks || []).forEach(x => collectLinks(x, out))); break;
    case 'columns': (b.cols || []).flat().forEach(x => collectLinks(x, out)); break;
    case 'cards': (b.items || []).forEach(i => {
      const m = /^#(\/[^#]+)(?:#(.*))?$/.exec(i.link || '');
      if (m) out.push({ slug: m[1], anchor: m[2] || null });
      scan(i.desc);
    }); break;
    case 'endpoint': scan(b.description); (b.params || []).forEach(p => scan(p.desc)); break;
  }
  return out;
}
function collectIds(b, into, topIndex) {
  if (!b) return;
  if (b.id && !(b.id in into)) into[b.id] = topIndex;
  (b.blocks || []).forEach(x => collectIds(x, into, topIndex));
  (b.tabs || []).forEach(t => (t.blocks || []).forEach(x => collectIds(x, into, topIndex)));
  (b.cols || []).forEach(col => col.forEach(x => collectIds(x, into, topIndex)));
}

const modelCache = new Map();
function modelFor(slug) {
  if (modelCache.has(slug)) return modelCache.get(slug);
  const page = CONTENT.pages[slug];
  if (!page) return null;
  const blocks = page.blocks.map((raw, i) => ({
    raw, i,
    words: Math.max(1, countWords(blockText(raw))),
    style: grooveStyle(raw),
    links: collectLinks(raw).filter(l => CONTENT.pages[l.slug] && l.slug !== slug)
  }));
  const anchors = {};
  page.blocks.forEach((b, i) => collectIds(b, anchors, i));

  /* groove shares: arc length per block proportional to its word count */
  const weights = blocks.map(b => Math.max(6, b.words));
  const wsum = weights.reduce((a, b) => a + b, 0);
  const S = [0];
  for (let i = 0; i < weights.length; i++) S.push(S[i] + weights[i] / wsum);
  S[S.length - 1] = 1;

  /* multi-revolution spiral: revolutions scale with the side's real length */
  const totalWords = GRAPH.words[slug] || wsum;
  const T = clamp(6 + totalWords / 500, 6, 24);
  const TH = T * TAU;
  const R0 = 0.94, R1 = 0.47;
  const K = Math.max(1200, Math.round(T * 220));
  const cum = new Float64Array(K + 1);
  for (let k = 0; k < K; k++) {
    const aMid = (k + 0.5) / K * TH;
    const r = R0 - (R0 - R1) * (aMid / TH);
    cum[k + 1] = cum[k] + r * (TH / K);
  }
  const totalArc = cum[K];
  function alphaOfU(u) {
    const target = clamp(u, 0, 1) * totalArc;
    let lo = 0, hi = K;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < target) lo = mid + 1; else hi = mid; }
    const k = Math.max(1, lo);
    const seg = cum[k] - cum[k - 1] || 1;
    return ((k - 1) + (target - cum[k - 1]) / seg) / K * TH;
  }
  function uOfAlpha(alpha) {
    const x = clamp(alpha / TH, 0, 1) * K;
    const k = Math.floor(x);
    const c0 = cum[Math.min(k, K)], c1 = cum[Math.min(k + 1, K)];
    return (c0 + (c1 - c0) * (x - k)) / totalArc;
  }
  const rOfU = u => R0 - (R0 - R1) * (alphaOfU(u) / TH);
  function blockOfU(u) {
    u = clamp(u, 0, 0.999999);
    let lo = 0, hi = S.length - 2;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (S[mid] <= u) lo = mid; else hi = mid - 1; }
    return lo;
  }

  const cues = blocks.filter(b => b.links.length).map(b => b.i);
  const prov = PROV[slug] || { commits: 0, authors: [], topAuthor: '', first: '', last: '', night: 0, careDays: 0 };

  /* crackle pop positions: exactly one per commit, seeded from the slug */
  const rng = mulberry32(hashCode(slug));
  const popUs = Array.from({ length: prov.commits }, () => rng()).sort((a, b) => a - b);

  const model = {
    slug, page, blocks, S, anchors, cues, prov, totalWords,
    T, TH, R0, R1, alphaOfU, uOfAlpha, rOfU, blockOfU,
    runtime: runtimeSec(slug), inbound: inboundOf(slug),
    bin: slugToBin.get(slug) || null, popUs,
    title: page.title || slug
  };
  modelCache.set(slug, model);
  return model;
}

/* ---------------------------------------------------------------- record prerender */
function wrapLines(ctx, text, maxW, maxLines) {
  const words = [];
  for (const w0 of String(text).split(/\s+/).filter(Boolean)) {
    if (ctx.measureText(w0).width <= maxW) { words.push(w0); continue; }
    /* hard-break a word wider than the line ("Internationalization" on a sleeve) */
    let rest = w0;
    while (rest && ctx.measureText(rest).width > maxW) {
      let cut = rest.length - 1;
      while (cut > 1 && ctx.measureText(rest.slice(0, cut) + '-').width > maxW) cut--;
      words.push(rest.slice(0, cut) + '-');
      rest = rest.slice(cut);
    }
    if (rest) words.push(rest);
  }
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width <= maxW || !line) line = t;
    else { lines.push(line); line = w; if (lines.length === maxLines) break; }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && line && lines[maxLines - 1] !== line) {
    let last = lines[maxLines - 1];
    while (last && ctx.measureText(last + '…').width > maxW) last = last.slice(0, -1);
    lines[maxLines - 1] = last + '…';
  }
  return lines;
}
function arcText(ctx, text, r, centerAng, fontPx, fill, alpha) {
  ctx.save();
  ctx.font = fontPx + 'px ' + MONO_STACK;
  ctx.fillStyle = fill; ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const chars = [...String(text)];
  const widths = chars.map(ch => ctx.measureText(ch).width + fontPx * 0.14);
  const total = widths.reduce((a, b) => a + b, 0);
  let ang = centerAng - (total / 2) / r;
  for (let i = 0; i < chars.length; i++) {
    ang += (widths[i] / 2) / r;
    ctx.save();
    ctx.translate(Math.cos(ang) * r, Math.sin(ang) * r);
    ctx.rotate(ang + Math.PI / 2);
    ctx.fillText(chars[i], 0, 0);
    ctx.restore();
    ang += (widths[i] / 2) / r;
  }
  ctx.restore();
}

const texCache = new Map(); /* key: slug|px */
function recordTexture(model, diamCss) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const px = Math.round(diamCss * dpr);
  const key = model.slug + '|' + px;
  if (texCache.has(key)) return texCache.get(key);
  if (texCache.size > 14) { const first = texCache.keys().next().value; texCache.delete(first); }

  const cv = document.createElement('canvas');
  cv.width = cv.height = px;
  const ctx = cv.getContext('2d');
  const R = px / 2;
  ctx.translate(R, R);

  /* wax */
  ctx.beginPath(); ctx.arc(0, 0, R * 0.998, 0, TAU); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, R * 0.985, 0, TAU); ctx.strokeStyle = PAPER; ctx.globalAlpha = 0.28; ctx.lineWidth = 1; ctx.stroke();
  ctx.globalAlpha = 1;

  /* grooves — one continuous cut, styled per block */
  const { TH, R0, R1, S, blocks, blockOfU, uOfAlpha } = model;
  const steps = Math.max(1400, Math.round(model.T * 240));
  const styleOf = i => blocks[i] ? blocks[i].style : 'plain';
  const strokeFor = st =>
    st === 'code' ? { c: APRICOT, a: 0.85, w: Math.max(1.6, R * 0.010) } :
    st === 'caution' ? { c: ROSE, a: 0.85, w: Math.max(1.3, R * 0.0075) } :
    st === 'fine' ? { c: PAPER, a: 0.13, w: Math.max(0.6, R * 0.0030) } :
    { c: PAPER, a: 0.20, w: Math.max(0.8, R * 0.0045) };
  let curStyle = null, started = false;
  for (let k = 0; k <= steps; k++) {
    const a = k / steps * TH;
    const rr = (R0 - (R0 - R1) * a / TH) * R;
    const st = styleOf(blockOfU(uOfAlpha(a)));
    const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
    if (st !== curStyle) {
      if (started) ctx.stroke();
      const sp = strokeFor(st);
      ctx.beginPath(); ctx.strokeStyle = sp.c; ctx.globalAlpha = sp.a; ctx.lineWidth = sp.w;
      ctx.moveTo(x, y); curStyle = st; started = true;
    } else ctx.lineTo(x, y);
  }
  if (started) ctx.stroke();
  ctx.globalAlpha = 1;

  /* hairlines — wear is honest: one faint line per commit (drawn up to 64) */
  const rng = mulberry32(hashCode(model.slug) ^ 0x9E3779B9);
  const hairs = Math.min(model.prov.commits, 64);
  ctx.strokeStyle = PAPER;
  for (let i = 0; i < hairs; i++) {
    const ang = rng() * TAU, len = 0.06 + rng() * 0.22, rr = (0.5 + rng() * 0.46) * R;
    ctx.globalAlpha = 0.035 + rng() * 0.05;
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(0, 0, rr, ang, ang + len); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  /* rim ticks at block starts (cue blocks get rose ticks + a sticker on the groove) */
  const cueSet = new Set(model.cues);
  for (let i = 0; i < blocks.length; i++) {
    const a = model.alphaOfU(S[i]);
    const isCue = cueSet.has(i);
    ctx.save(); ctx.rotate(a);
    ctx.strokeStyle = isCue ? ROSE : PAPER;
    ctx.globalAlpha = isCue ? 0.95 : 0.5;
    ctx.lineWidth = isCue ? Math.max(1.6, R * 0.008) : 1;
    ctx.beginPath(); ctx.moveTo(R * 0.952, 0); ctx.lineTo(R * 0.988, 0); ctx.stroke();
    ctx.restore();
    if (isCue) {
      const rr = (R0 - (R0 - R1) * a / TH) * R;
      const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
      ctx.beginPath(); ctx.arc(x, y, Math.max(2.2, R * 0.011), 0, TAU); ctx.fillStyle = ROSE; ctx.globalAlpha = 0.95; ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /* dead wax — the run-out groove carries the provenance etching */
  const p = model.prov;
  const hands = p.authors.length;
  const etch1 = (initials(p.topAuthor) + ' · ' + p.commits + ' CUTS · ' + p.first + ' → ' + p.last).toUpperCase();
  const etch2 = (hands + (hands === 1 ? ' HAND · ' : ' HANDS · ') + monoStereo(model.slug) + ' · ' + p.careDays + ' DAYS OF CARE').toUpperCase();
  arcText(ctx, etch1, R * 0.415, -Math.PI / 2, Math.max(7, R * 0.030), PAPER, 0.55);
  arcText(ctx, etch2, R * 0.355, Math.PI / 2, Math.max(6.5, R * 0.026), PAPER, 0.45);

  /* label — violet, flat ink */
  const RL = R * 0.30;
  ctx.beginPath(); ctx.arc(0, 0, RL, 0, TAU); ctx.fillStyle = VIOLET; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, RL, 0, TAU); ctx.strokeStyle = PAPER; ctx.globalAlpha = 0.7; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.globalAlpha = 1;
  /* label text is drawn upright in drawDeck (strobe-lit label: the wax spins —
     grooves, etchings, rim ticks — while the title stays readable) */
  ctx.beginPath(); ctx.arc(0, 0, Math.max(3, R * 0.020), 0, TAU); ctx.fillStyle = PAPER; ctx.fill();

  /* after-hours sticker: night edits are real */
  if (p.night > 0) {
    ctx.save(); ctx.rotate(0.6); ctx.translate(R * 0.38, 0); ctx.rotate(-0.35);
    const w = R * 0.30, h = R * 0.09;
    ctx.fillStyle = ROSE; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = INK; ctx.font = '700 ' + Math.max(5.5, R * 0.030) + 'px ' + MONO_STACK;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('AFTER-HOURS ×' + p.night, 0, 0.5);
    ctx.restore();
  }

  texCache.set(key, cv);
  return cv;
}

/* label text overlay — upright while the wax spins, so the title reads at a glance */
const labelLineCache = new Map(); /* slug|R -> wrapped title lines */
function drawLabelText(ctx, model, R) {
  const RL = R * 0.30;
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = '700 ' + Math.max(9, R * 0.052) + 'px ' + SERIF_STACK;
  const key = model.slug + '|' + Math.round(R);
  let lines = labelLineCache.get(key);
  if (!lines) {
    if (labelLineCache.size > 60) labelLineCache.clear();
    lines = wrapLines(ctx, model.title, RL * 1.72, 2);
    labelLineCache.set(key, lines);
  }
  ctx.fillStyle = PAPER;
  if (R < 150) {
    /* compact pre-cue label (deck B): font floors outgrow the small plate,
       so fewer lines, spaced by the real font size; full facts live on the card */
    const ft = Math.max(9, R * 0.052), fm = Math.max(6, R * 0.030);
    lines.forEach((ln, i) => ctx.fillText(ln, 0, -RL * 0.40 + i * ft * 1.16));
    ctx.font = fm + 'px ' + MONO_STACK;
    ctx.fillText(fmtClock(model.runtime) + ' · ' + monoStereo(model.slug), 0, RL * 0.24);
    ctx.fillStyle = APRICOT;
    ctx.fillText(model.inbound > 0 ? 'SAMPLED BY ' + model.inbound : 'NEVER SAMPLED', 0, RL * 0.48);
  } else {
    lines.forEach((ln, i) => ctx.fillText(ln, 0, -RL * 0.28 + i * R * 0.058));
    ctx.font = Math.max(6.5, R * 0.030) + 'px ' + MONO_STACK;
    ctx.fillText(fmtClock(model.runtime) + ' AT ' + WPM + ' WPM', 0, RL * 0.18);
    ctx.fillText('PRESSED ' + pressedYear(model.slug) + ' · ' + monoStereo(model.slug), 0, RL * 0.38);
    ctx.fillStyle = APRICOT;
    ctx.fillText(model.inbound > 0 ? 'SAMPLED BY ' + model.inbound : 'NEVER SAMPLED', 0, RL * 0.58);
    arcText(ctx, 'STRAPI DOCUMENTATION PRESSING PLANT', RL * 0.86, -Math.PI / 2, Math.max(5.5, R * 0.022), PAPER, 0.7);
  }
  ctx.beginPath(); ctx.arc(0, 0, Math.max(3, R * 0.020), 0, TAU); ctx.fillStyle = PAPER; ctx.fill();
  ctx.restore();
}

/* ---------------------------------------------------------------- decks */
const THETA_S = -50 * Math.PI / 180; /* stylus azimuth in screen space */

function makeDeck(canvas, isMain) {
  return {
    canvas, ctx: canvas.getContext('2d'), isMain,
    css: 0, cx: 0, cy: 0, R: 0,
    model: null, tex: null,
    u: 0, cur: -1, phi: 0, playing: false,
    freeSpin: !isMain, spinRate: TAU / 7,
    braking: false, brakeOmega: 0, lastAlpha: 0,
    cueU: 0
  };
}
const deckA = makeDeck($('deckA'), true);
const deckB = makeDeck($('deckB'), false);

function sizeDecks() {
  const avail = Math.max(640, $('deckview').clientWidth - 20);
  const a = clamp(Math.floor(avail * 0.50), 360, 540);
  const b = clamp(Math.floor(avail * 0.30), 220, 320);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  for (const [deck, s] of [[deckA, a], [deckB, b]]) {
    deck.css = s;
    deck.canvas.style.width = s + 'px'; deck.canvas.style.height = s + 'px';
    deck.canvas.width = Math.round(s * dpr); deck.canvas.height = Math.round(s * dpr);
    deck.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    deck.cx = s * 0.46; deck.cy = s * 0.535; deck.R = s * 0.44;
    if (deck.model) deck.tex = recordTexture(deck.model, deck.R * 2);
  }
  deckDirty = true;
}

function loadDeck(deck, slug, startBlock) {
  const m = modelFor(slug);
  if (!m) return false;
  deck.model = m;
  deck.tex = recordTexture(m, deck.R * 2);
  const u0 = m.S[clamp(startBlock || 0, 0, m.blocks.length - 1)] + 1e-5;
  if (deck.isMain) { deck.u = u0; deck.cur = -1; deck.playing = false; deck.braking = false; }
  else { deck.cueU = u0; deck.phi = RM ? 0 : deck.phi; }
  return true;
}

function drawTonearm(ctx, css, pivot, stylus, lifted, contactColor) {
  const dx = stylus.x - pivot.x, dy = stylus.y - pivot.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  /* counterweight */
  ctx.beginPath(); ctx.arc(pivot.x - ux * css * 0.035, pivot.y - uy * css * 0.035, css * 0.020, 0, TAU);
  ctx.fillStyle = INK; ctx.fill();
  /* pivot base */
  ctx.beginPath(); ctx.arc(pivot.x, pivot.y, css * 0.014, 0, TAU); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.arc(pivot.x, pivot.y, css * 0.024, 0, TAU); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke();
  /* arm */
  ctx.beginPath(); ctx.moveTo(pivot.x, pivot.y); ctx.lineTo(stylus.x, stylus.y);
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(2.5, css * 0.008); ctx.stroke();
  /* headshell */
  ctx.save();
  ctx.translate(stylus.x, stylus.y); ctx.rotate(Math.atan2(dy, dx));
  ctx.fillStyle = INK; ctx.fillRect(-css * 0.030, -css * 0.011, css * 0.036, css * 0.022);
  ctx.restore();
  /* stylus contact */
  ctx.beginPath(); ctx.arc(stylus.x, stylus.y, Math.max(2.4, css * 0.007), 0, TAU);
  if (lifted) { ctx.strokeStyle = contactColor; ctx.lineWidth = 1.6; ctx.stroke(); }
  else { ctx.fillStyle = contactColor; ctx.fill(); }
}

function drawDeck(deck) {
  const { ctx, css } = deck;
  ctx.clearRect(0, 0, css, css);
  /* plinth: bare paper + registration corner marks (press vocabulary, not chrome) */
  ctx.strokeStyle = INK25; ctx.lineWidth = 1;
  const mk = css * 0.018;
  for (const [mx, my] of [[mk * 1.4, mk * 1.4], [css - mk * 1.4, css - mk * 1.4]]) {
    ctx.beginPath(); ctx.moveTo(mx - mk, my); ctx.lineTo(mx + mk, my); ctx.moveTo(mx, my - mk); ctx.lineTo(mx, my + mk); ctx.stroke();
    ctx.beginPath(); ctx.arc(mx, my, mk * 0.55, 0, TAU); ctx.stroke();
  }
  if (!deck.model) {
    /* empty deck: felt slipmat */
    ctx.beginPath(); ctx.arc(deck.cx, deck.cy, deck.R * 0.94, 0, TAU); ctx.fillStyle = PAPER2; ctx.fill();
    ctx.beginPath(); ctx.arc(deck.cx, deck.cy, deck.R * 0.94, 0, TAU); ctx.strokeStyle = INK25; ctx.stroke();
    ctx.beginPath(); ctx.arc(deck.cx, deck.cy, css * 0.008, 0, TAU); ctx.fillStyle = INK; ctx.fill();
    return;
  }
  const m = deck.model;
  const u = deck.isMain ? deck.u : deck.cueU;
  if (deck.isMain && !deck.braking) deck.phi = THETA_S - m.alphaOfU(deck.u);

  ctx.save();
  ctx.translate(deck.cx, deck.cy);
  ctx.rotate(deck.phi);
  ctx.drawImage(deck.tex, -deck.R, -deck.R, deck.R * 2, deck.R * 2);
  ctx.restore();

  /* the label plate reads upright while the wax spins */
  ctx.save();
  ctx.translate(deck.cx, deck.cy);
  drawLabelText(ctx, m, deck.R);
  ctx.restore();

  /* fixed pointer notch at the stylus azimuth */
  ctx.save(); ctx.translate(deck.cx, deck.cy); ctx.rotate(THETA_S);
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(deck.R * 1.005, 0); ctx.lineTo(deck.R * 1.05, 0); ctx.stroke();
  ctx.restore();

  /* tonearm */
  const rr = m.rOfU(u) * deck.R;
  const stylus = { x: deck.cx + Math.cos(THETA_S) * rr, y: deck.cy + Math.sin(THETA_S) * rr };
  const pivot = { x: css * 0.925, y: css * 0.075 };
  drawTonearm(ctx, css, pivot, stylus, !deck.isMain, deck.isMain ? ROSE : VIOLET);
}

/* ---------------------------------------------------------------- reading strip */
const stripBody = $('stripbody');
let suppressScrollUntil = 0;

function renderBlockHTML(b) {
  switch (b.t) {
    case 'tldr': return '<div class="tldr"><span class="tag">TL;DR</span>' + b.html + '</div>';
    case 'p': return '<p>' + b.html + '</p>';
    case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      return '<' + b.t + (b.id ? ' id="' + esc(b.id) + '"' : '') + '>' + esc(b.text) + '</' + b.t + '>';
    case 'img': {
      const src = b.light || b.dark || '';
      return '<figure><img loading="lazy" src="' + esc(src) + '" alt="' + esc(b.alt) + '">' +
        (b.caption ? '<figcaption>' + b.caption + '</figcaption>' : '') + '</figure>';
    }
    case 'ul': return '<ul>' + (b.items || []).map(i => '<li>' + i + '</li>').join('') + '</ul>';
    case 'ol': return '<ol' + (b.start && b.start !== 1 ? ' start="' + b.start + '"' : '') + '>' + (b.items || []).map(i => '<li>' + i + '</li>').join('') + '</ol>';
    case 'table': {
      const al = b.align || [];
      const head = '<tr>' + (b.head || []).map((h, i) => '<th style="text-align:' + (al[i] || 'left') + '">' + h + '</th>').join('') + '</tr>';
      const rows = (b.rows || []).map(r => '<tr>' + r.map((c, i) => '<td style="text-align:' + (al[i] || 'left') + '">' + c + '</td>').join('') + '</tr>').join('');
      return '<div class="twrap"><table><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>';
    }
    case 'admonition': {
      const kind = esc(b.kind || 'note');
      return '<div class="adm k-' + kind + '"><div class="admhead">' + kind + (b.title ? ' — ' + esc(b.title) : '') + '</div>' +
        (b.blocks || []).map(renderBlockHTML).join('') + '</div>';
    }
    case 'tabs': {
      const btns = (b.tabs || []).map((t, i) => '<button class="tabbtn' + (i === 0 ? ' active' : '') + '" data-tab="' + i + '">' + esc(t.label) + '</button>').join('');
      const panes = (b.tabs || []).map((t, i) => '<div class="tabpane' + (i === 0 ? ' active' : '') + '">' + (t.blocks || []).map(renderBlockHTML).join('') + '</div>').join('');
      return '<div class="tabs"><div class="tabbar">' + btns + '</div><div class="tabpanes">' + panes + '</div></div>';
    }
    case 'code':
      return '<div class="codeblk">' + (b.title ? '<div class="codetitle">' + esc(b.title) + '</div>' : '') +
        '<pre><code>' + esc(b.code) + '</code></pre></div>';
    case 'cards':
      return '<div class="cardgrid">' + (b.items || []).map(i =>
        '<a class="card" href="' + esc(i.link || '#') + '"><div class="ct">' + esc(i.icon || '') + ' ' + esc(i.title) + '</div><div class="cd">' + esc(i.desc) + '</div></a>').join('') + '</div>';
    case 'badge': return '<span class="badge">' + esc(b.label) + '</span>';
    case 'details':
      return '<details class="dblk"' + (b.id ? ' id="' + esc(b.id) + '"' : '') + '><summary>' + esc(b.summary || 'Details') + '</summary>' +
        (b.blocks || []).map(renderBlockHTML).join('') + '</details>';
    case 'endpoint': {
      const method = b.method ? esc(b.method) : esc(b.kind || 'API');
      let out = '<div class="endpoint"' + (b.id ? ' id="' + esc(b.id) + '"' : '') + '><div class="ephead"><span class="method">' + method + '</span><code>' + esc(b.path) + '</code></div><div class="epbody">';
      if (b.title) out += '<h4>' + esc(b.title) + '</h4>';
      if (b.description) out += '<p>' + b.description + '</p>';
      if (b.params && b.params.length) {
        out += '<div class="twrap"><table><thead><tr><th>' + esc(b.paramTitle || 'Parameters') + '</th><th>Type</th><th>Description</th></tr></thead><tbody>' +
          b.params.map(p => '<tr><td><code>' + esc(p.name) + '</code>' + (p.required ? ' <b>*</b>' : '') + '</td><td>' + esc(p.type) + '</td><td>' + (p.desc || '') + '</td></tr>').join('') + '</tbody></table></div>';
      }
      return out + '</div></div>';
    }
    case 'columns': return '<div class="cols">' + (b.cols || []).map(col => '<div>' + col.map(renderBlockHTML).join('') + '</div>').join('') + '</div>';
    case 'hr': return '<hr>';
    default: return '';
  }
}

function nextInBin(model) {
  const bin = model.bin;
  if (!bin) return null;
  const i = bin.members.indexOf(model.slug);
  if (i < 0 || bin.members.length < 2) return null;
  return bin.members[(i + 1) % bin.members.length];
}

function renderBinCard(model) {
  const card = $('bincard');
  if (!card) return;
  const bin = model.bin;
  if (!bin || bin.members.length < 2) { card.hidden = true; return; }
  const i = Math.max(0, bin.members.indexOf(model.slug));
  const picks = [];
  for (let k = 1; k < bin.members.length && picks.length < 4; k++) picks.push(bin.members[(i + k) % bin.members.length]);
  $('bincardtag').textContent = 'FILED BESIDE IT IN ' + binLabel(bin) + ' · ' + bin.size + ' RECORDS';
  $('bincardrows').innerHTML = picks.map(s => {
    const t = (CONTENT.pages[s] || {}).title || s;
    const inb = inboundOf(s);
    return '<a class="bcrow" href="#' + esc(s) + '"><span class="bct">' + esc(t) + '</span><span class="bcm">' +
      (inb ? 'SAMPLED ×' + inb : 'NEVER SAMPLED') + ' · ' + fmtClock(runtimeSec(s)) + ' · ' + pressedYear(s) + '</span></a>';
  }).join('');
  card.hidden = false;
}

function renderStrip(model) {
  $('striptitle').textContent = model.title;
  const p = model.prov;
  const chips = [];
  if (model.bin) chips.push('<span class="chip bin" id="binchip" title="Open this bin in the crate wall">' + esc(binLabel(model.bin)) + '</span>');
  chips.push('<span class="chip">' + model.totalWords.toLocaleString('en-US') + ' WORDS · ' + fmtClock(model.runtime) + '</span>');
  chips.push('<span class="chip' + (model.inbound ? ' rose' : '') + '">' + (model.inbound ? 'SAMPLED BY ' + model.inbound : 'NEVER SAMPLED') + '</span>');
  chips.push('<span class="chip">' + monoStereo(model.slug) + ' · ' + p.authors.length + (p.authors.length === 1 ? ' HAND' : ' HANDS') + '</span>');
  chips.push('<span class="chip">PRESSED ' + pressedYear(model.slug) + '</span>');
  if (p.night > 0) chips.push('<span class="chip rose">AFTER-HOURS ×' + p.night + '</span>');
  $('stripmeta').innerHTML = chips.join('');

  const nb = nextInBin(model);
  const endchip = '<div class="endchip">END OF SIDE — ' + model.blocks.length + ' blocks, ' +
    model.totalWords.toLocaleString('en-US') + ' words.' +
    (nb ? ' Next in this bin: <a href="#' + esc(nb) + '">' + esc((CONTENT.pages[nb] || {}).title || nb) + '</a>' : '') + '</div>';

  stripBody.innerHTML = model.blocks.map(b =>
    '<div class="blk t-' + b.raw.t + '" data-i="' + b.i + '">' + renderBlockHTML(b.raw) + '</div>').join('') + endchip;
  stripBody.scrollTop = 0;

  const bc = $('binchip');
  if (bc) bc.addEventListener('click', () => { openCratesAt(model.bin); });

  $('blocktotal').textContent = model.blocks.length;
  $('deadwaxline').textContent = 'DEAD WAX · ' + (p.topAuthor || 'unknown hand') + ' · ' + p.commits + ' cuts · ' +
    p.first + ' → ' + p.last + ' · ' + p.authors.length + (p.authors.length === 1 ? ' hand' : ' hands') +
    (p.night ? ' · after-hours ×' + p.night : '') + ' · ' + p.careDays + ' days of care';
  renderBinCard(model);
  updateCrackleLine();
}

function highlightBlock(i, opts) {
  opts = opts || {};
  const prev = stripBody.querySelector('.blk.current');
  if (prev) prev.classList.remove('current');
  const el = stripBody.querySelector('.blk[data-i="' + i + '"]');
  if (el) {
    el.classList.add('current');
    if (!opts.fromStrip) {
      suppressScrollUntil = performance.now() + 700;
      stripBody.scrollTo({ top: Math.max(0, el.offsetTop - 90), behavior: RM ? 'auto' : 'smooth' });
    }
  }
  $('blocknow').textContent = i + 1;
}

stripBody.addEventListener('scroll', () => {
  if (performance.now() < suppressScrollUntil) return;
  if (!deckA.model) return;
  const kids = stripBody.querySelectorAll('.blk');
  if (!kids.length) return;
  const target = stripBody.scrollTop + 100;
  let lo = 0, hi = kids.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (kids[mid].offsetTop <= target) lo = mid; else hi = mid - 1; }
  const i = +kids[lo].dataset.i;
  if (i !== deckA.cur) setNeedle(deckA.model.S[i] + 1e-5, { fromStrip: true });
});

stripBody.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#/"]');
  if (a) {
    e.preventDefault();
    const m = /^#(\/[^#]+)(?:#(.*))?$/.exec(a.getAttribute('href'));
    if (m && CONTENT.pages[m[1]]) performCut({ slug: m[1], anchor: m[2] || null }, 'link');
    return;
  }
  const tb = e.target.closest('.tabbtn');
  if (tb) {
    const tabs = tb.closest('.tabs');
    const idx = +tb.dataset.tab;
    tabs.querySelectorAll(':scope > .tabbar > .tabbtn').forEach((b, i) => b.classList.toggle('active', i === idx));
    tabs.querySelectorAll(':scope > .tabpanes > .tabpane').forEach((p, i) => p.classList.toggle('active', i === idx));
    return;
  }
  const blk = e.target.closest('.blk');
  if (blk && deckA.model && !window.getSelection().toString()) {
    setNeedle(deckA.model.S[+blk.dataset.i] + 1e-5, {});
  }
});

/* ---------------------------------------------------------------- transport & needle */
let deckDirty = true;
let endOfSide = false;

function setNeedle(u, opts) {
  opts = opts || {};
  const m = deckA.model;
  if (!m) return;
  const prevU = deckA.u;
  deckA.u = clamp(u, 0, 0.999999);
  const bi = m.blockOfU(deckA.u);
  $('timereadout').textContent = fmtClock(deckA.u * m.runtime) + ' / ' + fmtClock(m.runtime);
  if (bi !== deckA.cur) {
    deckA.cur = bi;
    highlightBlock(bi, opts);
    updatePrecue();
    if (curEntry) { curEntry.maxBlock = Math.max(curEntry.maxBlock, bi); }
  }
  maybeCrackle(prevU, deckA.u);
  deckDirty = true;
}

function setPlaying(on) {
  deckA.playing = on && !!deckA.model;
  $('btn-play').textContent = deckA.playing ? 'PAUSE' : 'PLAY';
  if (deckA.playing) { endOfSide = false; rmNextStep = 0; }
  deckDirty = true;
}
$('btn-play').addEventListener('click', () => setPlaying(!deckA.playing));

/* deck A pointer: drop the needle anywhere, or drag the arm to scrub */
let scrubbing = false;
function deckAPointerU(e) {
  const rect = deckA.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left - deckA.cx, y = e.clientY - rect.top - deckA.cy;
  const d = Math.hypot(x, y);
  const m = deckA.model;
  const rUnit = clamp(d / deckA.R, m.R1, m.R0);
  const alpha = m.TH * (m.R0 - rUnit) / (m.R0 - m.R1);
  return m.uOfAlpha(alpha);
}
deckA.canvas.addEventListener('pointerdown', e => {
  if (!deckA.model) return;
  const rect = deckA.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left - deckA.cx, y = e.clientY - rect.top - deckA.cy;
  const d = Math.hypot(x, y);
  if (d < deckA.R * (deckA.model.R1 - 0.06) || d > deckA.R * 1.06) return;
  scrubbing = true;
  deckA.canvas.setPointerCapture(e.pointerId);
  setNeedle(deckAPointerU(e), {});
});
deckA.canvas.addEventListener('pointermove', e => { if (scrubbing) setNeedle(deckAPointerU(e), {}); });
deckA.canvas.addEventListener('pointerup', e => { scrubbing = false; try { deckA.canvas.releasePointerCapture(e.pointerId); } catch (err) {} });
deckA.canvas.addEventListener('pointercancel', () => { scrubbing = false; });

/* ---------------------------------------------------------------- pre-cue (deck B) */
let armed = null; /* {block, slug, anchor} */
const nextup = $('nextup');
const crossfader = $('crossfader');

function lookahead(m) { return Math.max(0.05, 1.5 / m.blocks.length); }

function updatePrecue() {
  const m = deckA.model;
  if (!m) return;
  const cur = Math.max(0, deckA.cur);
  let cueBlock = -1;
  if (m.blocks[cur] && m.blocks[cur].links.length) cueBlock = cur;
  else {
    for (const ci of m.cues) {
      if (ci > cur && m.S[ci] - deckA.u <= lookahead(m)) { cueBlock = ci; break; }
      if (ci > cur) break;
    }
  }
  if (cueBlock < 0) {
    if (armed) { armed = null; disarmDeckB(m, cur); }
    else if (!nextup.dataset.state || nextup.dataset.state !== 'idle' + cur) disarmDeckB(m, cur);
    return;
  }
  const link = m.blocks[cueBlock].links[0];
  if (armed && armed.block === cueBlock && armed.slug === link.slug && armed.anchor === link.anchor) return;
  armed = { block: cueBlock, slug: link.slug, anchor: link.anchor };

  const tm = modelFor(link.slug);
  let anchorBlock = 0, cueName = 'start of side';
  if (link.anchor && tm.anchors[link.anchor] != null) {
    anchorBlock = tm.anchors[link.anchor];
    const ab = tm.blocks[anchorBlock].raw;
    cueName = ab.text ? '“' + ab.text + '”' : 'block ' + (anchorBlock + 1) + ' / ' + tm.blocks.length;
  }
  loadDeck(deckB, link.slug, anchorBlock);
  nextup.dataset.state = 'armed';
  nextup.className = 'armed';
  nextup.innerHTML =
    '<div class="nu-tag">DECK B — PRE-CUED</div>' +
    '<div class="nu-title">' + esc(tm.title) + '</div>' +
    '<div class="nu-cue">CUED TO ' + esc(cueName.toUpperCase()) + '</div>' +
    '<div class="nu-facts">' +
      (tm.inbound ? '<span class="rose">SAMPLED BY ' + tm.inbound + '</span> · ' : 'NEVER SAMPLED · ') +
      fmtClock(tm.runtime) + ' · PRESSED ' + pressedYear(tm.slug) + ' · ' + monoStereo(tm.slug) +
      ' (' + tm.prov.authors.length + (tm.prov.authors.length === 1 ? ' HAND)' : ' HANDS)') +
    '</div>' +
    '<button id="btn-cut">CUT TO DECK B → <kbd>X</kbd></button>';
  $('btn-cut').addEventListener('click', () => performCut(armed, 'cut'));
  crossfader.classList.add('armed');
  deckDirty = true;
}

function disarmDeckB(m, cur) {
  deckB.model = null; deckB.tex = null;
  crossfader.classList.remove('armed');
  nextup.className = 'idle';
  let msg;
  if (!m.cues.length) msg = 'This side samples no other record.';
  else {
    const next = m.cues.find(ci => ci > cur);
    if (next != null) {
      const link = m.blocks[next].links[0];
      const t = (CONTENT.pages[link.slug] || {}).title || link.slug;
      msg = 'Next cue at block ' + (next + 1) + ' of ' + m.blocks.length + ' — “' + esc(t) + '”. Deck B racks it as the needle approaches.';
    } else msg = 'No more cues on this side. ' + m.cues.length + ' citation' + (m.cues.length === 1 ? '' : 's') + ' behind the needle.';
  }
  nextup.dataset.state = 'idle' + cur;
  nextup.innerHTML = '<div class="nu-tag">DECK B</div><div class="nu-body">' + msg + '</div>';
  deckDirty = true;
}

/* ---------------------------------------------------------------- crossfader cut */
let transitioning = false;
let pendingVia = null;
const faderHandle = $('faderhandle');
function faderTo(side) { faderHandle.style.left = side === 'B' ? 'calc(100% - 18px)' : '0px'; }

function performCut(target, via) {
  if (!target || transitioning) return;
  if (!CONTENT.pages[target.slug]) return;
  transitioning = true;
  pendingVia = via || 'cut';
  faderTo('B');
  if (!RM) {
    deckA.braking = true;
    deckA.brakeOmega = deckA.playing && deckA.model ? -TAU / Math.max(2, deckA.model.runtime / deckA.model.T) * 6 : -1.4;
    stripBody.classList.add('smear');
  }
  window.setTimeout(() => {
    const h = '#' + target.slug + (target.anchor ? '#' + target.anchor : '');
    if (location.hash === h) route(); else location.hash = h;
  }, RM ? 30 : 300);
}
crossfader.addEventListener('click', () => { if (armed) performCut(armed, 'cut'); });
deckB.canvas.addEventListener('click', () => { if (armed) performCut(armed, 'cut'); });

/* ---------------------------------------------------------------- crackle (optional, gesture-gated) */
const audio = { on: false, ctx: null };
const btnSound = $('btn-sound');
function enableSound() {
  if (!audio.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audio.ctx = new AC();
  }
  audio.ctx.resume && audio.ctx.resume();
  audio.on = true;
  btnSound.textContent = 'SOUND ON'; btnSound.classList.add('on');
  storageSet('deadwax.sound', 'on');
  updateCrackleLine();
}
function disableSound() {
  audio.on = false;
  btnSound.textContent = 'SOUND OFF'; btnSound.classList.remove('on');
  storageSet('deadwax.sound', 'off');
  updateCrackleLine();
}
btnSound.addEventListener('click', () => (audio.on ? disableSound() : enableSound()));
function updateCrackleLine() {
  const el = $('crackleline');
  if (audio.on && deckA.model) {
    el.hidden = false;
    el.textContent = '♪ ' + deckA.model.prov.commits + ' crackles pressed into this side — one per commit';
  } else el.hidden = true;
}
function pop() {
  if (!audio.on || !audio.ctx) return;
  const ctx = audio.ctx;
  const dur = 0.02 + Math.random() * 0.02;
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800 + Math.random() * 3800; bp.Q.value = 0.8;
  const g = ctx.createGain(); g.gain.value = 0.04 + Math.random() * 0.14;
  src.connect(bp); bp.connect(g); g.connect(ctx.destination);
  src.start();
}
function maybeCrackle(prevU, u) {
  if (!audio.on || !deckA.model) return;
  const delta = u - prevU;
  if (delta <= 0 || delta > 0.02) return; /* only while riding the groove */
  let fired = 0;
  for (const pu of deckA.model.popUs) {
    if (pu > prevU && pu <= u) { pop(); if (++fired >= 3) break; }
    if (pu > u) break;
  }
}

/* ---------------------------------------------------------------- setlist */
const setlist = [];
let curEntry = null;
function setlistTouch() { if (curEntry) { const now = performance.now(); curEntry.ms += now - curEntry.t0; curEntry.t0 = now; } }
function setlistAdd(slug, via) {
  setlistTouch();
  if (curEntry && curEntry.slug === slug) return;
  const m = modelFor(slug);
  curEntry = {
    slug, title: m.title, bin: m.bin ? binLabel(m.bin) : '—',
    via: via || 'needle', t0: performance.now(), ms: 0,
    maxBlock: Math.max(0, deckA.cur), N: m.blocks.length, words: m.totalWords
  };
  setlist.push(curEntry);
  renderChalk();
}
function setlistStats() {
  setlistTouch();
  const bins = new Set(setlist.map(e => e.bin));
  const totalMs = setlist.reduce((a, e) => a + e.ms, 0);
  const wordsUnderNeedle = setlist.reduce((a, e) => {
    const mdl = modelFor(e.slug);
    return a + Math.round(e.words * (mdl ? mdl.S[Math.min(e.maxBlock + 1, e.N)] : 0));
  }, 0);
  return { records: setlist.length, bins: bins.size, totalMs, wordsUnderNeedle };
}
function renderSetlist() {
  setlistTouch();
  const body = $('setlistbody');
  if (!setlist.length) { body.innerHTML = '<div class="slrow"><div class="d">Nothing played yet. Drop the needle on a record.</div></div>'; }
  else body.innerHTML = setlist.map((e, i) =>
    '<div class="slrow"><span class="n">' + String(i + 1).padStart(2, '0') + '</span><span class="t">' + esc(e.title) + '</span>' +
    '<div class="d">' + esc(e.bin) + ' · <span class="via">' + (e.via === 'cut' ? 'CROSSFADED IN' : e.via === 'link' ? 'CUT VIA LINK' : 'NEEDLE DROP') + '</span> · ' +
    fmtClock(e.ms / 1000) + ' · reached block ' + (e.maxBlock + 1) + '/' + e.N + '</div></div>').join('');
  const s = setlistStats();
  $('setlistsummary').innerHTML = '<b>' + s.records + '</b> record' + (s.records === 1 ? '' : 's') + ' · <b>' + s.bins + '</b> bin' + (s.bins === 1 ? '' : 's') +
    ' · <b>' + fmtClock(s.totalMs / 1000) + '</b> on the decks · ~<b>' + s.wordsUnderNeedle.toLocaleString('en-US') + '</b> words under the needle';
}
function renderChalk() {
  setlistTouch();
  const lines = $('chalklines');
  if (!lines) return;
  if (!setlist.length) { lines.innerHTML = '<div class="cl more">Blank slate. Every record you play chalks a line here.</div>'; return; }
  const MAXL = 5;
  const shown = setlist.slice(-MAXL);
  const hiddenCount = setlist.length - shown.length;
  let html = hiddenCount > 0 ? '<div class="cl more">… ' + hiddenCount + ' earlier cut' + (hiddenCount === 1 ? '' : 's') + '</div>' : '';
  html += shown.map(e => {
    const i = setlist.indexOf(e);
    return '<div class="cl"><span class="cn">' + String(i + 1).padStart(2, '0') + '</span><span class="ct">' + esc(e.title) + '</span>' +
      '<span class="cb">' + esc(e.bin.replace(/ · .*$/, '')) + '</span><span class="cm">' + fmtClock(e.ms / 1000) + '</span></div>';
  }).join('');
  const s = setlistStats();
  html += '<div class="cl tot"><span class="ct">' + s.records + (s.records === 1 ? ' RECORD · ' : ' RECORDS · ') + s.bins + (s.bins === 1 ? ' BIN' : ' BINS') + '</span><span class="cm">' + fmtClock(s.totalMs / 1000) + '</span></div>';
  lines.innerHTML = html;
}
window.setInterval(() => { if (view === 'deck' && !document.hidden) renderChalk(); }, 4000);
$('chalkboard').addEventListener('click', () => { $('setlistpanel').hidden = false; renderSetlist(); });

$('btn-setlist').addEventListener('click', () => { const p = $('setlistpanel'); p.hidden = !p.hidden; if (!p.hidden) renderSetlist(); });
$('btn-setlist-close').addEventListener('click', () => { $('setlistpanel').hidden = true; });

function printSetlist() {
  setlistTouch();
  const s = setlistStats();
  const d = new Date();
  const rows = setlist.map((e, i) =>
    '<tr><td class="num">' + String(i + 1).padStart(2, '0') + '</td><td>' + esc(e.title) + '</td><td>' + esc(e.bin) + '</td>' +
    '<td class="num">' + (e.via === 'cut' ? 'CROSSFADE' : e.via === 'link' ? 'LINK CUT' : 'NEEDLE') + '</td>' +
    '<td class="num">' + fmtClock(e.ms / 1000) + '</td><td class="num">' + (e.maxBlock + 1) + '/' + e.N + '</td></tr>').join('');
  $('printsheet').innerHTML =
    '<div class="ph"><span><span class="reg">&#9678;</span> DEAD WAX — SESSION SETLIST</span><span>' + d.toISOString().slice(0, 10) + '</span></div>' +
    '<div class="psub">ONE READING SESSION THROUGH THE STRAPI DOCUMENTATION PRESSING · ' + N_PAGES + ' RECORDS IN THE COLLECTION · ' + ALL_HANDS.size + ' HANDS CUT THEM</div>' +
    '<table><thead><tr><th class="num">#</th><th>RECORD</th><th>BIN</th><th class="num">VIA</th><th class="num">TIME</th><th class="num">BLOCKS</th></tr></thead><tbody>' +
    (rows || '<tr><td colspan="6">No records played this session.</td></tr>') + '</tbody></table>' +
    '<div class="psum">' + s.records + (s.records === 1 ? ' RECORD · ' : ' RECORDS · ') + s.bins + (s.bins === 1 ? ' BIN · ' : ' BINS · ') + fmtClock(s.totalMs / 1000) + ' ON THE DECKS · ~' +
    s.wordsUnderNeedle.toLocaleString('en-US') + ' WORDS UNDER THE NEEDLE (AT ' + WPM + ' WPM THAT IS ' + fmtClock(s.wordsUnderNeedle / WPM * 60) + ' OF PROSE)</div>' +
    '<div class="pinks"><span style="background:#F5EBDB"></span><span style="background:#2A0F3D"></span><span style="background:#4945FF"></span><span style="background:#FF3D6E"></span><span style="background:#FFA45E"></span></div>' +
    '<div class="pfoot">FIVE FLAT INKS · PAPER F5EBDB / AUBERGINE 2A0F3D / VIOLET 4945FF / ROSE FF3D6E / APRICOT FFA45E · PRINTED FROM DEAD WAX</div>';
  try { window.print(); } catch (e) { /* headless */ }
}
$('btn-print').addEventListener('click', printSetlist);
$('btn-print2').addEventListener('click', printSetlist);

/* ---------------------------------------------------------------- crate wall */
const crateCanvas = $('cratecanvas');
const crateCtx = crateCanvas.getContext('2d');
let crateDirty = true, crateScroll = 0, crateMaxScroll = 0;
let crateLayoutData = null; /* {bins:[{y,h,header, hubRect, rects:[...]}], totalH} */
let visibleRects = [];
let hoverSlug = null;
let searchMatchSet = null; /* Set of slugs or null */

const SLEEVE = 116, SGAP = 12, FACEOUT = 240, CPAD = 26;

/* sleeve sprite atlas */
const ATLAS_CELL = 160, HUB_CELL = 320;
const atlasCols = 17;
const atlas = document.createElement('canvas');
atlas.width = atlasCols * ATLAS_CELL;
atlas.height = Math.ceil(N_PAGES / atlasCols) * ATLAS_CELL;
const atlasCtx = atlas.getContext('2d');
const atlasPos = new Map();
let atlasBuilt = 0;

const hubAtlas = document.createElement('canvas');
const hubSlugs = BINS.filter(b => b.hub).map(b => b.hub);
hubAtlas.width = 7 * HUB_CELL; hubAtlas.height = Math.ceil(hubSlugs.length / 7) * HUB_CELL;
const hubCtx = hubAtlas.getContext('2d');
const hubPos = new Map();
let hubBuilt = 0;

function productOf(slug) { return slug.startsWith('/cms') ? 'cms' : slug.startsWith('/cloud') ? 'cloud' : 'other'; }

function drawSleeve(ctx, x, y, cell, slug) {
  const page = CONTENT.pages[slug];
  const p = PROV[slug] || { careDays: 0, night: 0, authors: [] };
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, cell, cell);
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1.5, cell * 0.012);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, cell - ctx.lineWidth, cell - ctx.lineWidth);
  /* product band: violet = CMS, rose = Cloud, apricot = other — a real field */
  const prod = productOf(slug);
  ctx.fillStyle = prod === 'cms' ? VIOLET : prod === 'cloud' ? ROSE : APRICOT;
  ctx.fillRect(0, 0, cell, cell * 0.05);
  /* ring wear from careDays: the longer a record was passed around, the deeper the ring */
  const wear = MAX_CARE ? (p.careDays / MAX_CARE) : 0;
  if (wear > 0.04) {
    ctx.beginPath(); ctx.arc(cell / 2, cell / 2, cell * 0.36, 0, TAU);
    ctx.strokeStyle = INK; ctx.globalAlpha = 0.05 + wear * 0.22; ctx.lineWidth = cell * 0.085; ctx.stroke();
    ctx.globalAlpha = 1;
  }
  /* title */
  ctx.fillStyle = INK;
  ctx.font = '700 ' + Math.round(cell * 0.105) + 'px ' + SERIF_STACK;
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  const lines = wrapLines(ctx, page.title, cell - cell * 0.16, 3);
  lines.forEach((ln, i) => ctx.fillText(ln, cell * 0.08, cell * 0.24 + i * cell * 0.125));
  /* bottom facts */
  ctx.font = '700 ' + Math.round(cell * 0.068) + 'px ' + MONO_STACK;
  const inb = inboundOf(slug);
  if (inb > 0) { ctx.fillStyle = VIOLET; ctx.fillText('SAMPLED ×' + inb, cell * 0.08, cell - cell * 0.185); }
  ctx.fillStyle = INK60;
  ctx.fillText(monoStereo(slug) + ' · ' + fmtClock(runtimeSec(slug)), cell * 0.08, cell - cell * 0.075);
  ctx.textAlign = 'right';
  ctx.fillText(pressedYear(slug), cell - cell * 0.08, cell - cell * 0.185);
  ctx.textAlign = 'left';
  /* after-hours corner: rose triangle, one per record that has night edits */
  if (p.night > 0) {
    ctx.beginPath(); ctx.moveTo(cell, cell * 0.05); ctx.lineTo(cell, cell * 0.23); ctx.lineTo(cell - cell * 0.18, cell * 0.05); ctx.closePath();
    ctx.fillStyle = ROSE; ctx.fill();
  }
  ctx.restore();
}

function buildAtlasChunk() {
  const CH = 24;
  let n = 0;
  while (atlasBuilt < N_PAGES && n < CH) {
    const slug = SLUGS[atlasBuilt];
    const col = atlasBuilt % atlasCols, row = Math.floor(atlasBuilt / atlasCols);
    drawSleeve(atlasCtx, col * ATLAS_CELL, row * ATLAS_CELL, ATLAS_CELL, slug);
    atlasPos.set(slug, { x: col * ATLAS_CELL, y: row * ATLAS_CELL });
    atlasBuilt++; n++;
  }
  while (hubBuilt < hubSlugs.length && n < CH * 2) {
    const slug = hubSlugs[hubBuilt];
    const col = hubBuilt % 7, row = Math.floor(hubBuilt / 7);
    drawSleeve(hubCtx, col * HUB_CELL, row * HUB_CELL, HUB_CELL, slug);
    hubPos.set(slug, { x: col * HUB_CELL, y: row * HUB_CELL });
    hubBuilt++; n++;
  }
  crateDirty = true;
  if (atlasBuilt < N_PAGES || hubBuilt < hubSlugs.length) window.setTimeout(buildAtlasChunk, 0);
}
buildAtlasChunk();

function crateLayout() {
  const W = crateCanvas.clientWidth || $('crateview').clientWidth;
  let y = 20;
  const binsOut = [];
  for (const bin of BINS) {
    const headerH = 44;
    const hub = bin.hub;
    const gridMembers = bin.members.filter(m => m !== hub);
    const gridX = CPAD + (hub ? FACEOUT + 24 : 0);
    const cols = Math.max(1, Math.floor((W - gridX - CPAD + SGAP) / (SLEEVE + SGAP)));
    const rows = Math.ceil(gridMembers.length / cols);
    const contentH = Math.max(hub ? FACEOUT + 22 : 0, rows * (SLEEVE + SGAP));
    const rects = [];
    let hubRect = null;
    if (hub) hubRect = { slug: hub, x: CPAD, y: y + headerH + 10, w: FACEOUT, h: FACEOUT, big: true, bin };
    gridMembers.forEach((m, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      rects.push({ slug: m, x: gridX + c * (SLEEVE + SGAP), y: y + headerH + 10 + r * (SLEEVE + SGAP), w: SLEEVE, h: SLEEVE, big: false, bin });
    });
    binsOut.push({ bin, y, headerH, contentH, hubRect, rects });
    y += headerH + 10 + contentH + 34;
  }
  crateLayoutData = { bins: binsOut, totalH: y + 30, W };
  crateMaxScroll = Math.max(0, y + 30 - crateCanvas.clientHeight);
  crateScroll = clamp(crateScroll, 0, crateMaxScroll);
}

function sizeCrates() {
  const el = $('crateview');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  crateCanvas.width = Math.round(el.clientWidth * dpr);
  crateCanvas.height = Math.round(el.clientHeight * dpr);
  crateCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  crateLayout();
  crateDirty = true;
}

function drawCrates() {
  const W = crateCanvas.clientWidth, H = crateCanvas.clientHeight;
  const ctx = crateCtx;
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  if (!crateLayoutData) return;
  visibleRects = [];
  const top = crateScroll, bot = crateScroll + H;
  for (const L of crateLayoutData.bins) {
    const binBottom = L.y + L.headerH + 10 + L.contentH;
    if (binBottom < top - 40 || L.y > bot + 40) continue;
    const sy = L.y - crateScroll;
    /* header: flat aubergine band */
    ctx.fillStyle = INK; ctx.fillRect(CPAD, sy, W - CPAD * 2, L.headerH - 12);
    ctx.fillStyle = PAPER; ctx.font = '700 12px ' + MONO_STACK; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const b = L.bin;
    const label = b.unfiled
      ? 'WHITE LABELS — ' + b.size + ' SINGLES THE COMMUNITY DETECTION LEFT UNFILED'
      : 'BIN ' + String(b.id + 1).padStart(2, '0') + ' — ' + b.name.toUpperCase() + ' · ' + b.size + ' RECORDS · PURITY ' + Math.round(b.purity * 100) + '%';
    ctx.fillText(label, CPAD + 12, sy + (L.headerH - 12) / 2 + 1);
    if (b.hub) {
      ctx.textAlign = 'right'; ctx.fillStyle = APRICOT;
      ctx.fillText('FACE OUT: MOST-WIRED RECORD IN THE BIN', W - CPAD - 12, sy + (L.headerH - 12) / 2 + 1);
      ctx.textAlign = 'left';
    }
    /* sleeves */
    const all = L.hubRect ? [L.hubRect].concat(L.rects) : L.rects;
    for (const r of all) {
      const ry = r.y - crateScroll;
      if (ry + r.h < -20 || ry > H + 20) continue;
      visibleRects.push(r);
      const dim = searchMatchSet && !searchMatchSet.has(r.slug);
      ctx.globalAlpha = dim ? 0.15 : 1;
      const src = r.big ? hubPos.get(r.slug) : atlasPos.get(r.slug);
      if (src) {
        const cell = r.big ? HUB_CELL : ATLAS_CELL;
        ctx.drawImage(r.big ? hubAtlas : atlas, src.x, src.y, cell, cell, r.x, ry, r.w, r.h);
      } else { ctx.fillStyle = PAPER3; ctx.fillRect(r.x, ry, r.w, r.h); }
      if (r.big) { ctx.strokeStyle = VIOLET; ctx.lineWidth = 3; ctx.strokeRect(r.x + 1.5, ry + 1.5, r.w - 3, r.h - 3); }
      if (hoverSlug === r.slug && !dim) { ctx.strokeStyle = ROSE; ctx.lineWidth = 3; ctx.strokeRect(r.x + 1.5, ry + 1.5, r.w - 3, r.h - 3); }
      ctx.globalAlpha = 1;
    }
  }
}

function crateHit(e) {
  const rect = crateCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top + crateScroll;
  for (const r of visibleRects) if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r;
  return null;
}
crateCanvas.addEventListener('wheel', e => {
  e.preventDefault();
  crateScroll = clamp(crateScroll + e.deltaY, 0, crateMaxScroll);
  crateDirty = true;
}, { passive: false });
crateCanvas.addEventListener('pointermove', e => {
  const hit = crateHit(e);
  const tip = $('cratetip');
  if (hit) {
    if (hoverSlug !== hit.slug) { hoverSlug = hit.slug; crateDirty = true; }
    const p = PROV[hit.slug] || { authors: [], night: 0, commits: 0 };
    tip.hidden = false;
    tip.innerHTML = '<b>' + esc(CONTENT.pages[hit.slug].title) + '</b><br>' +
      fmtClock(runtimeSec(hit.slug)) + ' AT ' + WPM + ' WPM · ' + monoStereo(hit.slug) + ' (' + p.authors.length + (p.authors.length === 1 ? ' HAND)' : ' HANDS)') + '<br>' +
      (inboundOf(hit.slug) ? '<span class="r">SAMPLED BY ' + inboundOf(hit.slug) + '</span> · ' : 'NEVER SAMPLED · ') +
      p.commits + ' CUTS · PRESSED ' + pressedYear(hit.slug) +
      (p.night ? '<br><span class="r">AFTER-HOURS ×' + p.night + '</span>' : '');
    const vw = $('crateview').getBoundingClientRect();
    tip.style.left = Math.min(e.clientX - vw.left + 16, vw.width - 280) + 'px';
    tip.style.top = Math.min(e.clientY - vw.top + 14, vw.height - 120) + 'px';
    crateCanvas.style.cursor = 'pointer';
  } else {
    if (hoverSlug) { hoverSlug = null; crateDirty = true; }
    tip.hidden = true;
    crateCanvas.style.cursor = 'default';
  }
});
crateCanvas.addEventListener('pointerleave', () => { hoverSlug = null; $('cratetip').hidden = true; crateDirty = true; });
crateCanvas.addEventListener('click', e => {
  const hit = crateHit(e);
  if (hit) location.hash = '#' + hit.slug;
});

function openCratesAt(bin) {
  location.hash = '#/crates';
  if (bin && crateLayoutData) {
    const L = crateLayoutData.bins.find(x => x.bin === bin);
    if (L) crateScroll = clamp(L.y - 60, 0, crateMaxScroll);
    crateDirty = true;
  }
}

/* ---------------------------------------------------------------- search + index */
const searchIndex = SLUGS.map(s => ({
  slug: s,
  title: CONTENT.pages[s].title || s,
  lower: (CONTENT.pages[s].title || s).toLowerCase(),
  slower: s.toLowerCase()
}));
function searchQuery(q) {
  q = q.trim().toLowerCase();
  if (!q) return [];
  const out = [];
  for (const it of searchIndex) {
    let score = 0;
    if (it.lower.startsWith(q)) score = 4;
    else if (it.lower.includes(' ' + q)) score = 3;
    else if (it.lower.includes(q)) score = 2;
    else if (it.slower.includes(q)) score = 1;
    if (score) out.push({ it, score });
  }
  out.sort((a, b) => b.score - a.score || a.it.title.length - b.it.title.length);
  return out.map(o => o.it);
}

/* groove index: lowercased body text per record, built in idle slices so a
   search that misses every title can still find the words in the wax */
const bodyIndex = new Map();
let bodyBuildI = 0;
function buildBodySlice() {
  const t0 = performance.now();
  while (bodyBuildI < SLUGS.length && performance.now() - t0 < 8) {
    const s = SLUGS[bodyBuildI++];
    bodyIndex.set(s, (CONTENT.pages[s].blocks || []).map(blockText).join(' ').replace(/\s+/g, ' ').toLowerCase());
  }
  if (bodyBuildI < SLUGS.length) idleSchedule(buildBodySlice);
}
function idleSchedule(fn) {
  if (window.requestIdleCallback) window.requestIdleCallback(fn, { timeout: 2500 });
  else window.setTimeout(fn, 150);
}
idleSchedule(buildBodySlice);
function ensureBodyIndex() {
  while (bodyBuildI < SLUGS.length) {
    const s = SLUGS[bodyBuildI++];
    bodyIndex.set(s, (CONTENT.pages[s].blocks || []).map(blockText).join(' ').replace(/\s+/g, ' ').toLowerCase());
  }
}
function bodySearch(q, limit, excl) {
  ensureBodyIndex();
  const out = [];
  for (const s of SLUGS) {
    if (excl.has(s)) continue;
    const body = bodyIndex.get(s) || '';
    const at = body.indexOf(q);
    if (at < 0) continue;
    let count = 0, j = at;
    while (j !== -1 && count < 99) { count++; j = body.indexOf(q, j + q.length); }
    const a = Math.max(0, at - 30);
    out.push({
      slug: s, title: CONTENT.pages[s].title || s, kind: 'body', count,
      ex: (a > 0 ? '…' : '') + body.slice(a, at + q.length + 48) + '…'
    });
  }
  out.sort((x, y) => y.count - x.count);
  return out.slice(0, limit);
}
function fullSearch(qRaw) {
  const q = qRaw.trim().toLowerCase();
  if (!q) return [];
  let hits = searchQuery(qRaw).slice(0, 12).map(h => ({ slug: h.slug, title: h.title, kind: 'title' }));
  if (q.length >= 3 && hits.length < 12) {
    hits = hits.concat(bodySearch(q, Math.min(6, 12 - hits.length), new Set(hits.map(h => h.slug))));
  }
  return hits;
}

const searchInput = $('search');
const searchResults = $('searchresults');
let searchSel = 0, lastHits = [];
function renderSearchResults(hits, q) {
  if (!q) { searchResults.hidden = true; return; }
  searchResults.hidden = false;
  if (!hits.length) {
    searchResults.innerHTML = '<div class="nohit">Not in any title or groove. Tab opens the full catalogue.</div>';
    return;
  }
  searchResults.innerHTML = hits.map((h, i) =>
    '<a class="hit' + (i === searchSel ? ' sel' : '') + '" href="#' + esc(h.slug) + '">' + esc(h.title) +
    (h.kind === 'body' ? '<span class="ingroove">IN THE GROOVES ×' + h.count + '</span><span class="ex">' + esc(h.ex) + '</span>' : '') +
    '<span class="slug">' + esc(h.slug) + '</span></a>').join('');
}
searchInput.addEventListener('input', () => {
  searchSel = 0;
  const q = searchInput.value;
  lastHits = fullSearch(q);
  renderSearchResults(lastHits, q.trim());
  searchMatchSet = q.trim() ? new Set(lastHits.map(h => h.slug)) : null;
  crateDirty = true;
});
searchInput.addEventListener('keydown', e => {
  const q = searchInput.value.trim();
  if (e.key === 'ArrowDown') { searchSel = Math.min(searchSel + 1, Math.max(0, lastHits.length - 1)); renderSearchResults(lastHits, q); e.preventDefault(); }
  else if (e.key === 'ArrowUp') { searchSel = Math.max(searchSel - 1, 0); renderSearchResults(lastHits, q); e.preventDefault(); }
  else if (e.key === 'Enter') {
    const pick = lastHits[searchSel] || lastHits[0];
    if (pick) { location.hash = '#' + pick.slug; searchResults.hidden = true; searchInput.blur(); searchInput.value = ''; searchMatchSet = null; lastHits = []; crateDirty = true; }
  } else if (e.key === 'Escape') { searchResults.hidden = true; searchInput.blur(); }
});
document.addEventListener('click', e => { if (!e.target.closest('#searchwrap')) searchResults.hidden = true; });

/* plain-title index, one keystroke away */
const indexOverlay = $('indexoverlay');
const indexFilter = $('indexfilter');
let indexBuilt = false;
function buildIndex() {
  if (indexBuilt) return;
  indexBuilt = true;
  const groups = new Map();
  for (const slug of CONTENT.order) {
    const p = CONTENT.pages[slug];
    if (!p) continue;
    const key = (p.product ? p.product.toUpperCase() : 'DOCS') + (p.section ? ' — ' + p.section.toUpperCase() : '');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(slug);
  }
  const seen = new Set();
  let html = '';
  for (const [key, slugs] of groups) {
    html += '<div class="grp"><div class="grph">' + esc(key) + '</div>';
    for (const s of slugs) { seen.add(s); html += '<a href="#' + esc(s) + '" data-t="' + esc((CONTENT.pages[s].title || '').toLowerCase()) + '">' + esc(CONTENT.pages[s].title) + '</a>'; }
    html += '</div>';
  }
  const rest = SLUGS.filter(s => !seen.has(s));
  if (rest.length) {
    html += '<div class="grp"><div class="grph">UNLISTED</div>' + rest.map(s =>
      '<a href="#' + esc(s) + '" data-t="' + esc((CONTENT.pages[s].title || '').toLowerCase()) + '">' + esc(CONTENT.pages[s].title) + '</a>').join('') + '</div>';
  }
  $('indexlist').innerHTML = html;
}
function toggleIndex(force) {
  const show = force != null ? force : indexOverlay.hidden;
  if (show) { buildIndex(); indexOverlay.hidden = false; indexFilter.value = ''; filterIndex(''); indexFilter.focus(); }
  else { indexOverlay.hidden = true; }
}
function filterIndex(q) {
  q = q.trim().toLowerCase();
  $('indexlist').querySelectorAll('a').forEach(a => a.classList.toggle('dim', !!q && !a.dataset.t.includes(q)));
}
indexFilter.addEventListener('input', () => filterIndex(indexFilter.value));
indexFilter.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const first = $('indexlist').querySelector('a:not(.dim)');
    if (first) { toggleIndex(false); location.hash = first.getAttribute('href'); }
  }
});
$('indexlist').addEventListener('click', e => { if (e.target.closest('a')) toggleIndex(false); });
$('btn-index').addEventListener('click', () => toggleIndex());
$('btn-crates').addEventListener('click', () => { location.hash = '#/crates'; });

/* ---------------------------------------------------------------- keyboard */
document.addEventListener('keydown', e => {
  if (e.key === 'Tab') { e.preventDefault(); toggleIndex(); return; }
  if (e.key === 'Escape') {
    if (!indexOverlay.hidden) { toggleIndex(false); return; }
    if (!$('setlistpanel').hidden) { $('setlistpanel').hidden = true; return; }
    searchResults.hidden = true;
    return;
  }
  const typing = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
  if (typing) return;
  if (e.key === ' ' && e.target && e.target.tagName === 'BUTTON') return;
  if (e.key === '/') { e.preventDefault(); searchInput.focus(); searchInput.select(); return; }
  if (view !== 'deck' || !deckA.model) return;
  if (e.key === ' ') { e.preventDefault(); setPlaying(!deckA.playing); }
  else if (e.key === 'x' || e.key === 'X') { if (armed) performCut(armed, 'cut'); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); const m = deckA.model; setNeedle(m.S[clamp(deckA.cur + 1, 0, m.blocks.length - 1)] + 1e-5, {}); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); const m = deckA.model; setNeedle(m.S[clamp(deckA.cur - 1, 0, m.blocks.length - 1)] + 1e-5, {}); }
});

/* ---------------------------------------------------------------- router */
let view = 'crates';
function showView(v) {
  view = v;
  $('crateview').hidden = v !== 'crates';
  $('deckview').hidden = v !== 'deck';
  $('strip').hidden = v !== 'deck';
  if (v === 'crates') { sizeCrates(); crateDirty = true; }
  else deckDirty = true;
}
function parseHash() {
  const h = location.hash || '';
  if (!h.startsWith('#/')) return { view: 'crates' };
  const rest = h.slice(1);
  if (rest === '/' || rest === '/crates') return { view: 'crates' };
  const j = rest.indexOf('#');
  const slug = j < 0 ? rest : rest.slice(0, j);
  const anchor = j < 0 ? null : rest.slice(j + 1);
  if (!CONTENT.pages[slug]) return { view: 'crates' };
  return { view: 'deck', slug, anchor };
}
function route() {
  const r = parseHash();
  if (r.view === 'crates') { showView('crates'); transitioning = false; pendingVia = null; stripBody.classList.remove('smear'); return; }
  const m = modelFor(r.slug);
  const anchorBlock = r.anchor && m.anchors[r.anchor] != null ? m.anchors[r.anchor] : 0;
  const samePage = deckA.model && deckA.model.slug === r.slug;
  showView('deck');
  if (!samePage) {
    const wasPlaying = deckA.playing;
    loadDeck(deckA, r.slug, anchorBlock);
    renderStrip(m);
    stripBody.classList.remove('smear');
    if (!RM) { void stripBody.offsetWidth; stripBody.classList.add('slam'); window.setTimeout(() => stripBody.classList.remove('slam'), 220); }
    armed = null;
    const via = pendingVia; pendingVia = null;
    setNeedle(m.S[anchorBlock] + 1e-5, {});
    updatePrecue();
    setlistAdd(r.slug, via);
    setPlaying(wasPlaying || (!RM && via === 'cut'));
    const bc = $('binchip');
    if (bc && !RM) { bc.classList.add('flash'); window.setTimeout(() => bc.classList.remove('flash'), 700); }
  } else if (r.anchor != null) {
    setNeedle(m.S[anchorBlock] + 1e-5, {});
  }
  window.setTimeout(() => { faderTo('A'); crossfader.classList.toggle('armed', !!armed); }, 140);
  transitioning = false;
  deckA.braking = false;
  updateCrackleLine();
}
window.addEventListener('hashchange', route);

/* ---------------------------------------------------------------- plaque */
{
  const mins = TOTAL_WORDS / WPM;
  $('plaque').innerHTML =
    '<div class="pl">' + N_PAGES + ' RECORDS · ' + TOTAL_WORDS.toLocaleString('en-US') + ' WORDS · ' + fmtLongMin(mins) + ' AT ' + WPM + ' WPM</div>' +
    '<div class="pl">' + ALL_HANDS.size + ' HANDS · ' + N_EDGES.toLocaleString('en-US') + ' SAMPLES · ' + N_BINS_LOUVAIN + ' BINS</div>';
}

/* ---------------------------------------------------------------- main loop + diag */
let lastTs = 0, avgFrame = 0, rmNextStep = 0;
window.__diag = { frameMs: 0, avgFrameMs: 0, state: 'boot' };

function frame(ts) {
  const t0 = performance.now();
  const dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0;
  lastTs = ts;

  if (view === 'deck' && deckA.model) {
    const m = deckA.model;
    if (deckA.braking) {
      deckA.phi += deckA.brakeOmega * dt * (1 + 0.4 * Math.sin(ts * 0.045));
      deckA.brakeOmega *= Math.exp(-dt / 0.09);
      deckDirty = true;
    } else if (deckA.playing && !scrubbing) {
      if (!RM) {
        const nu = deckA.u + dt / m.runtime;
        if (nu >= 1) { setNeedle(0.999999, {}); setPlaying(false); endOfSide = true; }
        else setNeedle(nu, {});
        deckDirty = true;
      } else {
        if (!rmNextStep) rmNextStep = ts + Math.max(1500, (m.blocks[deckA.cur] ? m.blocks[deckA.cur].words : 30) / WPM * 60000);
        if (ts >= rmNextStep) {
          const ni = deckA.cur + 1;
          if (ni >= m.blocks.length) { setPlaying(false); endOfSide = true; }
          else {
            setNeedle(m.S[ni] + 1e-5, {});
            rmNextStep = ts + Math.max(1500, m.blocks[ni].words / WPM * 60000);
          }
        }
      }
    }
    if (!RM && deckB.model) { deckB.phi += deckB.spinRate * dt; deckDirty = true; }
    if (!RM || deckDirty) { drawDeck(deckA); drawDeck(deckB); deckDirty = false; }
  } else if (view === 'crates') {
    if (crateDirty) { drawCrates(); crateDirty = false; }
  }

  const cost = performance.now() - t0;
  avgFrame = avgFrame * 0.95 + cost * 0.05;
  window.__diag = {
    frameMs: cost,
    avgFrameMs: avgFrame,
    state: view + '|' + (deckA.model ? deckA.model.slug : '') + '|b' + (deckA.cur + 1) + '/' + (deckA.model ? deckA.model.blocks.length : 0) +
      '|' + (deckA.playing ? 'playing' : 'stopped') + (armed ? '|armed' : '') + (audio.on ? '|sound' : '')
  };
  window.requestAnimationFrame(frame);
}

/* ---------------------------------------------------------------- init */
if (RM) $('rmchip').hidden = false;
window.addEventListener('resize', () => { sizeDecks(); sizeCrates(); if (deckA.model) deckDirty = true; });
sizeDecks();
sizeCrates();
if (storageGet('deadwax.sound') === 'on') {
  /* sound stays off until a gesture; first click anywhere re-arms the saved preference */
  const rearm = () => { enableSound(); document.removeEventListener('pointerdown', rearm); };
  document.addEventListener('pointerdown', rearm, { once: true });
}
route();
window.requestAnimationFrame(frame);

/* debug/handles for verification */
window.__deadwax = { modelFor, deckA, deckB, performCut, setNeedle, BINS, setlist, wrapLines, SERIF_STACK };

})().catch(err => {
  console.error(err);
  const d = document.createElement('div');
  d.style.cssText = 'padding:40px;font-family:monospace;color:#2A0F3D';
  d.textContent = 'DEAD WAX failed to boot: ' + err.message;
  document.body.appendChild(d);
});
