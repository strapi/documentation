/* THE COAST OF LIGHTS
   The Strapi documentation as a night coastline of 290 lighthouses.
   Every rhythm on this coast is the documentation's own history. Nothing blinks at random. */
(function () {
'use strict';

/* ============ seeded randomness ============ */
const SEED = '6HJ12zLB1Lh0hghKbMbFZxhhRhcsUPneVxrI6fhz1z4DqEvpkZCmWs0K9vYUpn4D2hiwFaienri6U8U0izzj8prRTMmD6qY5';
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const seedFn = xmur3(SEED);
const rng = mulberry32(seedFn());

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============ state ============ */
let content = null, graph = null, communities = null, prov = null;
let lights = [];            // ordered array of light objects
const bySlug = new Map();   // slug -> light
let sections = [];          // 18 bays/headlands
let coastPts = [];          // fractal coastline [x, y]
let lanePts = [];           // shipping lane polyline
let laneLen = 0, laneCum = [];
let fogBanks = [], ships = [], stars = [];
let outAdj = new Map(), inAdj = new Map(), mutual = new Set();
const relit = new Set();    // dark lights relit this session
let currentSlug = null;
let readerOpen = false;

const CAPE = '/cms/migration/v4-to-v5/breaking-changes';
const HORIZON_Y = 620;      // world y where sky meets sea
const COAST_BASE = 1500;    // mean coastline y
let WORLD_W = 10000, WORLD_H = 2400;
let moonX = 0;

/* camera */
const cam = { x: 0, y: 0, s: 0.55 };
let camAnim = null;
let MIN_S = 0.03, MAX_S = 3;

/* canvas */
const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
let vw = 0, vh = 0, dpr = 1;

/* ============ light characteristics (the honest part) ============ */
/* flash count <- commit count bucket; Fl/Oc <- code density; period <- years in care;
   colour <- product; range <- inbound citations. All stated in the key. */
function deriveChar(slug) {
  const pv = prov[slug] || { commits: 1, careDays: 0, night: 0, authors: [], topAuthor: '', first: '' };
  const inb = graph.inbound[slug] || 0;
  const cm = pv.commits || 1;
  const n = cm <= 2 ? 1 : cm <= 5 ? 2 : cm <= 11 ? 3 : cm <= 24 ? 4 : 5;
  const mode = (graph.code[slug] || 0) >= 12 ? 'Oc' : 'Fl';
  const period = 6 + 2 * Math.min(3, Math.floor((pv.careDays || 0) / 365));
  const color = content.pages[slug].product === 'cloud' ? 'G' : 'W';
  const extinct = !(slug in graph.inbound);
  const range = extinct ? 0 : 3 + Math.round(2 * Math.sqrt(inb));
  return { n, mode, period, color, range, extinct, inb };
}
function charNotation(ch) {
  const grp = ch.n > 1 ? '(' + ch.n + ')' : '';
  let s = ch.mode + grp + ' ' + ch.color + ' ' + ch.period + 's';
  if (!ch.extinct) s += ' ' + ch.range + 'M';
  return s;
}
const NUMWORD = ['zero', 'one', 'two', 'three', 'four', 'five'];
function charPlain(ch) {
  const colour = ch.color === 'G' ? 'green' : 'warm white';
  if (ch.extinct) return 'tower standing, lamp out';
  if (ch.mode === 'Fl') {
    const f = ch.n === 1 ? 'one ' + colour + ' flash' : NUMWORD[ch.n] + ' ' + colour + ' flashes';
    return f + ' every ' + ch.period + ' seconds, seen ' + ch.range + ' miles out';
  }
  const e = ch.n === 1 ? 'eclipsed once' : 'eclipsed ' + NUMWORD[ch.n] + ' times';
  return colour + ' light held steady, ' + e + ' every ' + ch.period + ' seconds, seen ' + ch.range + ' miles out';
}
/* is this lamp lit at time t? follows the real characteristic */
const ON = 0.55, GAP = 0.95;
function litAt(lt, t) {
  const ch = lt.ch;
  if (ch.extinct && !relit.has(lt.slug)) return false;
  const T = (t + lt.phase) % ch.period;
  if (ch.mode === 'Fl') {
    for (let i = 0; i < ch.n; i++) {
      const s = i * (ON + GAP);
      if (T >= s && T < s + ON) return true;
    }
    return false;
  }
  for (let i = 0; i < ch.n; i++) {
    const s = 1.3 + i * (ON + GAP);
    if (T >= s && T < s + ON) return false;
  }
  return true;
}

/* ============ world building ============ */
function monthName(d) {
  const M = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  if (!d) return '';
  const p = d.split('-');
  return M[(+p[1] || 1) - 1] + ' ' + p[0];
}

function buildWorld() {
  /* adjacency + mutual pairs from real edges */
  for (const [a, b] of graph.edges) {
    if (!outAdj.has(a)) outAdj.set(a, []);
    outAdj.get(a).push(b);
    if (!inAdj.has(b)) inAdj.set(b, []);
    inAdj.get(b).push(a);
  }
  const eset = new Set(graph.edges.map(e => e[0] + '|' + e[1]));
  for (const [a, b] of graph.edges) {
    if (a < b && eset.has(b + '|' + a)) { mutual.add(a + '|' + b); }
  }

  /* 18 sections in reading order (contiguous in content.order) */
  const groups = [];
  let cur = null;
  for (const slug of content.order) {
    const p = content.pages[slug];
    const key = p.section + '|' + p.product;
    if (!cur || cur.key !== key) {
      cur = { key, label: p.section, product: p.product, slugs: [] };
      groups.push(cur);
    }
    cur.slugs.push(slug);
  }

  /* coastline: bays and headlands, seeded; the cape section is forced to a headland */
  let x = 500;
  const ctrl = [[0, COAST_BASE]];
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const L = 420 + g.slugs.length * 96;
    const capeHere = g.slugs.includes(CAPE);
    const head = capeHere ? true : rng() < 0.48;
    const amp = 70 + rng() * 150 + (capeHere ? 120 : 0);
    g.x0 = x; g.x1 = x + L;
    g.type = head ? 'head' : 'bay';
    g.name = g.label + (head ? ' Head' : ' Bay');
    /* headland juts seaward (smaller y), bay recedes landward (larger y) */
    const mid = COAST_BASE + (head ? -amp : amp);
    ctrl.push([x + L * (0.3 + rng() * 0.15), COAST_BASE + (head ? -amp * 0.55 : amp * 0.5)]);
    ctrl.push([x + L * 0.55, mid]);
    ctrl.push([x + L * (0.78 + rng() * 0.1), COAST_BASE + (head ? -amp * 0.4 : amp * 0.45)]);
    ctrl.push([x + L, COAST_BASE + (rng() - 0.5) * 50]);
    x += L;
  }
  WORLD_W = x + 500;
  ctrl.push([WORLD_W, COAST_BASE]);
  sections = groups;

  /* midpoint-displacement fractal between control points */
  let pts = ctrl;
  let rough = 46;
  for (let it = 0; it < 5; it++) {
    const nxt = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2 + (rng() * 2 - 1) * rough;
      nxt.push([mx, my], b);
    }
    pts = nxt;
    rough *= 0.52;
  }
  coastPts = pts;

  /* fast coast lookup */
  const cxs = coastPts.map(p => p[0]);
  function coastY(qx) {
    if (qx <= coastPts[0][0]) return coastPts[0][1];
    if (qx >= coastPts[coastPts.length - 1][0]) return coastPts[coastPts.length - 1][1];
    let lo = 0, hi = cxs.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cxs[m] <= qx) lo = m; else hi = m; }
    const a = coastPts[lo], b = coastPts[hi];
    const f = (qx - a[0]) / (b[0] - a[0] || 1);
    return a[1] + (b[1] - a[1]) * f;
  }
  window.__coastY = coastY; // internal reuse
  WORLD_H = COAST_BASE + 900;

  /* place the lights: one per page, along its section's shore */
  let idx = 0;
  for (const g of groups) {
    const span = g.x1 - g.x0;
    const step = span / (g.slugs.length + 1);
    for (let i = 0; i < g.slugs.length; i++) {
      const slug = g.slugs[i];
      const page = content.pages[slug];
      const jitter = (rng() - 0.5) * step * 0.5;
      const lx = g.x0 + step * (i + 1) + jitter;
      const ly = coastY(lx);
      const ch = deriveChar(slug);
      const towerH = 26 + rng() * 16 + Math.min(22, ch.range * 1.1);
      const lt = {
        slug, page, ch,
        x: lx, y: ly, towerH,
        lampX: lx, lampY: ly - towerH,
        phase: rng() * ch.period,      /* seeded phase; the rhythm itself is the data */
        section: g,
        beam: ch.inb >= 25,            /* the four great lights */
        cape: slug === CAPE,
        i: idx++
      };
      lights.push(lt);
      bySlug.set(slug, lt);
    }
  }

  /* the shipping lane: the reading order, threaded offshore past every light */
  const rawLane = [];
  for (const lt of lights) {
    rawLane.push([lt.x + (rng() - 0.5) * 30, lt.y - 110 - rng() * 70]);
  }
  /* smooth with a small moving average */
  lanePts = rawLane.map((p, i) => {
    const a = rawLane[Math.max(0, i - 1)], b = p, c = rawLane[Math.min(rawLane.length - 1, i + 1)];
    return [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3];
  });
  laneCum = [0];
  for (let i = 1; i < lanePts.length; i++) {
    const dx = lanePts[i][0] - lanePts[i - 1][0], dy = lanePts[i][1] - lanePts[i - 1][1];
    laneCum.push(laneCum[i - 1] + Math.hypot(dx, dy));
  }
  laneLen = laneCum[laneCum.length - 1];

  /* moon, fog, ships, stars — all seeded */
  moonX = WORLD_W * (0.22 + rng() * 0.5);
  const nFog = 7;
  for (let i = 0; i < nFog; i++) {
    fogBanks.push({
      x: rng() * WORLD_W, y: COAST_BASE - 180 - rng() * 420,
      rx: 380 + rng() * 620, ry: 70 + rng() * 120,
      v: 3 + rng() * 6, a: 0.05 + rng() * 0.05
    });
  }
  ships.push({ d: laneLen * rng(), v: 14 + rng() * 8 });
  ships.push({ d: laneLen * rng(), v: 10 + rng() * 8 });
  for (let i = 0; i < 260; i++) {
    stars.push({ x: rng(), y: rng() * 0.55, m: 0.35 + rng() * 0.65, tw: rng() * 6.28 });
  }
}

/* lane position at distance d */
function lanePoint(d) {
  d = ((d % laneLen) + laneLen) % laneLen;
  let lo = 0, hi = laneCum.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (laneCum[m] <= d) lo = m; else hi = m; }
  const f = (d - laneCum[lo]) / ((laneCum[hi] - laneCum[lo]) || 1);
  const a = lanePts[lo], b = lanePts[hi];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

/* ============ glow sprites ============ */
const sprites = {}; // key: color + bucket
function glowSprite(colorKey, r) {
  const bucket = Math.max(1, Math.min(8, Math.round(r / 16)));
  const key = colorKey + bucket;
  if (sprites[key]) return sprites[key];
  const R = bucket * 16;
  const c = document.createElement('canvas');
  c.width = c.height = R * 2;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(R, R, 0, R, R, R);
  const cols = colorKey === 'G'
    ? ['rgba(150,255,200,0.95)', 'rgba(80,220,150,0.35)', 'rgba(60,190,130,0)']
    : ['rgba(255,240,200,0.95)', 'rgba(255,205,120,0.32)', 'rgba(255,180,90,0)'];
  grad.addColorStop(0, cols[0]); grad.addColorStop(0.22, cols[1]); grad.addColorStop(1, cols[2]);
  g.fillStyle = grad;
  g.fillRect(0, 0, R * 2, R * 2);
  sprites[key] = { c, R };
  return sprites[key];
}

/* ============ camera ============ */
function resize() {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  vw = window.innerWidth; vh = window.innerHeight;
  canvas.width = Math.round(vw * dpr);
  canvas.height = Math.round(vh * dpr);
  canvas.style.width = vw + 'px';
  canvas.style.height = vh + 'px';
  MIN_S = Math.min(0.5, (vw * 0.96) / WORLD_W);
  needsDraw = true;
}
function clampCam() {
  cam.s = Math.max(MIN_S, Math.min(MAX_S, cam.s));
  const mX = 400, mY = 500;
  cam.x = Math.max(-mX, Math.min(WORLD_W - vw / cam.s + mX, cam.x));
  if (vh / cam.s > WORLD_H + 900) {
    /* zoomed far out: keep the coast composed on the lower third, sky above */
    cam.y = COAST_BASE - (vh * 0.66) / cam.s;
    return;
  }
  const wTop = -mY, wBot = WORLD_H + mY - vh / cam.s;
  cam.y = Math.max(Math.min(cam.y, Math.max(wTop, wBot)), Math.min(wTop, wBot));
}
function worldToScreen(wx, wy) { return [(wx - cam.x) * cam.s, (wy - cam.y) * cam.s]; }
function screenToWorld(sx, sy) { return [sx / cam.s + cam.x, sy / cam.s + cam.y]; }

function flyTo(wx, wy, targetS, dur) {
  const rw = (readerOpen && vw >= 900) ? Math.min(720, vw * 0.62) : 0;
  const cx = (vw - rw) / 2;
  const cy = vh * 0.52;
  const tx = wx - cx / targetS;
  const ty = wy - cy / targetS;
  if (REDUCED || dur === 0) {
    cam.x = tx; cam.y = ty; cam.s = targetS; clampCam(); camAnim = null; needsDraw = true; return;
  }
  camAnim = {
    t0: performance.now(), dur: dur || 900,
    x0: cam.x, y0: cam.y, s0: cam.s, x1: tx, y1: ty, s1: targetS
  };
}
function stepCam(now) {
  if (!camAnim) return;
  const f = Math.min(1, (now - camAnim.t0) / camAnim.dur);
  const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
  /* zoom eases through log space so the sail feels like a glide, not a lurch */
  cam.s = Math.exp(Math.log(camAnim.s0) + (Math.log(camAnim.s1) - Math.log(camAnim.s0)) * e);
  cam.x = camAnim.x0 + (camAnim.x1 - camAnim.x0) * e;
  cam.y = camAnim.y0 + (camAnim.y1 - camAnim.y0) * e;
  if (f >= 1) camAnim = null;
  clampCam();
  needsDraw = true;
}

/* ============ drawing ============ */
let needsDraw = true;
let skyGrad = null, seaGrad = null;

function drawScene(tSec, now) {
  stepCam(now);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  /* sky (screen space) */
  if (!skyGrad || skyGrad.h !== vh) {
    const g = ctx.createLinearGradient(0, 0, 0, vh);
    g.addColorStop(0, '#04070f');
    g.addColorStop(0.45, '#081120');
    g.addColorStop(1, '#0a1526');
    skyGrad = { g, h: vh };
  }
  ctx.fillStyle = skyGrad.g;
  ctx.fillRect(0, 0, vw, vh);

  /* stars: fixed to the firmament (infinitely far), twinkle deterministic */
  const horizonS = (HORIZON_Y - cam.y) * cam.s;
  ctx.fillStyle = '#cfe0f2';
  for (const st of stars) {
    const sy = st.y * vh;
    if (sy > horizonS) continue;
    const tw = REDUCED ? 0.75 : 0.55 + 0.45 * Math.sin(tSec * 0.7 + st.tw);
    ctx.globalAlpha = 0.55 * st.m * tw;
    ctx.fillRect(st.x * vw, sy, st.m > 0.8 ? 2 : 1, st.m > 0.8 ? 2 : 1);
  }
  ctx.globalAlpha = 1;

  /* --- world space --- */
  ctx.save();
  ctx.scale(cam.s, cam.s);
  ctx.translate(-cam.x, -cam.y);
  const wx0 = cam.x - 200 / cam.s, wx1 = cam.x + (vw + 200) / cam.s;

  /* sea */
  if (!seaGrad) {
    const g = ctx.createLinearGradient(0, HORIZON_Y, 0, COAST_BASE + 350);
    g.addColorStop(0, '#0d1e33');
    g.addColorStop(0.5, '#0a1828');
    g.addColorStop(1, '#06101d');
    seaGrad = g;
  }
  ctx.fillStyle = seaGrad;
  ctx.fillRect(wx0 - 1000, HORIZON_Y, (wx1 - wx0) + 2000, COAST_BASE + 400 - HORIZON_Y + 600);

  /* moon + moonpath */
  const moonY = HORIZON_Y - 260;
  if (moonX > wx0 - 1200 && moonX < wx1 + 1200) {
    const moonR = Math.max(46, 26 / cam.s);
    ctx.fillStyle = '#e9edf3';
    ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, 6.2832); ctx.fill();
    ctx.fillStyle = 'rgba(233,237,243,0.12)';
    ctx.beginPath(); ctx.arc(moonX, moonY, moonR * 1.7, 0, 6.2832); ctx.fill();
    /* the moonpath: broken shimmer down the swell */
    const cyAtMoon = window.__coastY(moonX);
    ctx.fillStyle = '#b9cbdd';
    const rows = 34;
    for (let i = 0; i < rows; i++) {
      const f = i / rows;
      const y = HORIZON_Y + 14 + f * (cyAtMoon - HORIZON_Y - 40);
      const sway = Math.sin(i * 2.7 + (REDUCED ? 0 : tSec * 0.7)) * (6 + f * 26);
      const wk = Math.max(1, 0.3 / cam.s);
      const w = (10 + f * 90 * (0.6 + 0.4 * Math.sin(i * 1.9 + (REDUCED ? 1 : tSec * 0.9)))) * wk;
      ctx.globalAlpha = Math.min(0.5, (0.09 + 0.15 * (1 - f)) * Math.max(1, 0.25 / cam.s)) * (0.6 + 0.4 * Math.sin(i * 3.3 + (REDUCED ? 2 : tSec * 1.3)));
      ctx.fillRect(moonX + sway - w / 2, y, w, Math.max(2, 3 / cam.s > 6 ? 6 : 3));
    }
    ctx.globalAlpha = 1;
  }

  /* slow rolling swell lines */
  ctx.strokeStyle = 'rgba(160,190,220,0.07)';
  ctx.lineWidth = Math.max(1, 1.4 / cam.s);
  for (let k = 0; k < 4; k++) {
    const baseY = HORIZON_Y + 120 + k * 170;
    ctx.beginPath();
    const stepx = Math.max(30, 26 / cam.s);
    for (let X = wx0; X <= wx1; X += stepx) {
      const Y = baseY + Math.sin(X * 0.004 + (REDUCED ? k : tSec * (0.35 + k * 0.08)) + k * 2.1) * 14;
      if (X === wx0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
    }
    ctx.stroke();
  }

  /* the shipping lane: the reading order, dotted */
  ctx.strokeStyle = 'rgba(150,175,205,0.4)';
  ctx.lineWidth = Math.max(0.8, 1.6 / cam.s);
  ctx.setLineDash([7 / cam.s + 2, 11 / cam.s + 4]);
  ctx.beginPath();
  let started = false;
  for (const p of lanePts) {
    if (p[0] < wx0 - 300 || p[0] > wx1 + 300) { started = false; continue; }
    if (!started) { ctx.moveTo(p[0], p[1]); started = true; } else ctx.lineTo(p[0], p[1]);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  /* land silhouette */
  ctx.fillStyle = '#04070c';
  const landBot = cam.y + (vh + 200) / cam.s;
  ctx.beginPath();
  ctx.moveTo(wx0 - 1000, landBot);
  ctx.lineTo(wx0 - 1000, COAST_BASE);
  for (const p of coastPts) {
    if (p[0] < wx0 - 400 || p[0] > wx1 + 400) continue;
    ctx.lineTo(p[0], p[1]);
  }
  ctx.lineTo(wx1 + 1000, COAST_BASE);
  ctx.lineTo(wx1 + 1000, landBot);
  ctx.closePath();
  ctx.fill();
  /* faint shore edge */
  ctx.strokeStyle = 'rgba(140,170,200,0.22)';
  ctx.lineWidth = Math.max(1, 1.6 / cam.s);
  ctx.beginPath(); started = false;
  for (const p of coastPts) {
    if (p[0] < wx0 - 400 || p[0] > wx1 + 400) { started = false; continue; }
    if (!started) { ctx.moveTo(p[0], p[1]); started = true; } else ctx.lineTo(p[0], p[1]);
  }
  ctx.stroke();

  /* bay & headland names */
  if (cam.s < 0.5) {
    ctx.fillStyle = 'rgba(170,195,222,0.55)';
    ctx.textAlign = 'center';
    const fs = Math.min(150, Math.max(26, 15 / cam.s));
    ctx.font = '300 ' + fs + 'px Fraunces, Georgia, serif';
    for (let gi = 0; gi < sections.length; gi++) {
      const g = sections[gi];
      const mx = (g.x0 + g.x1) / 2;
      if (mx < wx0 - 800 || mx > wx1 + 800) continue;
      /* stagger alternate names onto a second line so far-out views stay legible */
      const row = (gi % 3) * fs * 1.4;
      ctx.fillText(g.name.toUpperCase(), mx, COAST_BASE + 190 + fs + row);
    }
  }

  /* fog banks (beams are drawn after, so they cut through) */
  for (const f of fogBanks) {
    const fx = ((f.x + (REDUCED ? 0 : tSec * f.v)) % (WORLD_W + 2400)) - 1200;
    if (fx + f.rx < wx0 || fx - f.rx > wx1) continue;
    const fg = ctx.createRadialGradient(fx, f.y, 0, fx, f.y, f.rx);
    fg.addColorStop(0, 'rgba(190,205,225,' + f.a + ')');
    fg.addColorStop(1, 'rgba(190,205,225,0)');
    ctx.fillStyle = fg;
    ctx.save();
    ctx.translate(fx, f.y); ctx.scale(1, f.ry / f.rx);
    ctx.beginPath(); ctx.arc(0, 0, f.rx, 0, 6.2832); ctx.fill();
    ctx.restore();
  }

  /* ships on the lane */
  ctx.fillStyle = '#0a1220';
  for (const sh of ships) {
    const d = sh.d + (REDUCED ? 0 : tSec * sh.v);
    const [sx, sy] = lanePoint(d);
    if (sx < wx0 || sx > wx1) continue;
    ctx.fillStyle = '#0d1524';
    ctx.fillRect(sx - 14, sy - 4, 28, 6);
    ctx.fillStyle = '#f5ead0';
    ctx.fillRect(sx - 1.4, sy - 9, 2.8, 2.8);
    ctx.globalAlpha = 0.14;
    ctx.fillRect(sx - 46, sy + 2, 34, 1.6);
    ctx.globalAlpha = 1;
  }

  /* towers */
  const labelOK = cam.s > 0.62;
  for (const lt of lights) {
    if (lt.x < wx0 - 100 || lt.x > wx1 + 100) continue;
    const dark = lt.ch.extinct && !relit.has(lt.slug);
    ctx.strokeStyle = dark ? '#2b3646' : '#374357';
    ctx.lineWidth = Math.max(1.4, 3.4 / Math.max(cam.s, 0.4));
    ctx.beginPath();
    ctx.moveTo(lt.x, lt.y + 3);
    ctx.lineTo(lt.lampX, lt.lampY);
    ctx.stroke();
    /* lamp housing */
    ctx.fillStyle = dark ? '#39465a' : '#57677f';
    const hw = Math.max(1.8, 3.2 / Math.max(cam.s, 0.5));
    ctx.fillRect(lt.lampX - hw, lt.lampY - hw, hw * 2, hw * 2);
    if (labelOK) {
      ctx.textAlign = 'center';
      ctx.font = '300 13px Fraunces, Georgia, serif';
      ctx.fillStyle = dark ? 'rgba(140,155,175,0.75)' : 'rgba(205,220,238,0.85)';
      const nm = lt.page.sidebarLabel || lt.page.title;
      ctx.fillText(nm, lt.x, lt.y + 22);
      if (dark) {
        ctx.font = 'italic 300 11px Fraunces, Georgia, serif';
        ctx.fillStyle = 'rgba(125,140,160,0.7)';
        ctx.fillText('(extinguished)', lt.x, lt.y + 36);
      } else if (cam.s > 1.05) {
        ctx.font = '400 10px "IBM Plex Mono", monospace';
        ctx.fillStyle = lt.ch.color === 'G' ? 'rgba(130,220,175,0.75)' : 'rgba(255,215,150,0.7)';
        ctx.fillText(charNotation(lt.ch), lt.x, lt.y + 36);
      }
    }
  }

  /* beams of the four great lights, sweeping */
  ctx.globalCompositeOperation = 'lighter';
  for (const lt of lights) {
    if (!lt.beam) continue;
    if (lt.x < wx0 - 3000 || lt.x > wx1 + 3000) continue;
    const rot = REDUCED ? lt.phase : ((tSec + lt.phase) / lt.ch.period) * 6.2832;
    const beamLen = 900 + lt.ch.range * 60;
    const nB = lt.cape ? 2 : 1;
    for (let b = 0; b < nB; b++) {
      const a = rot + b * Math.PI;
      ctx.save();
      ctx.translate(lt.lampX, lt.lampY);
      ctx.rotate(a);
      const bg = ctx.createLinearGradient(0, 0, beamLen, 0);
      const col = lt.ch.color === 'G' ? '110,230,170' : '255,215,140';
      bg.addColorStop(0, 'rgba(' + col + ',0.34)');
      bg.addColorStop(1, 'rgba(' + col + ',0)');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(beamLen, -beamLen * 0.07);
      ctx.lineTo(beamLen, beamLen * 0.07);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  /* the lamps themselves: every rhythm real */
  for (const lt of lights) {
    if (lt.x < wx0 - 200 || lt.x > wx1 + 200) continue;
    const on = REDUCED ? !(lt.ch.extinct && !relit.has(lt.slug)) : litAt(lt, tSec);
    if (!on) continue;
    const r = 20 + lt.ch.range * 5.5 + (lt.cape ? 45 : 0);
    const sp = glowSprite(lt.ch.color, r);
    const drawR = Math.max(r, 7.5 / cam.s); /* never vanish, even from far at sea */
    ctx.drawImage(sp.c, lt.lampX - drawR, lt.lampY - drawR, drawR * 2, drawR * 2);
    /* hot core */
    ctx.fillStyle = lt.ch.color === 'G' ? '#d8ffe9' : '#fff4d8';
    const cr = Math.max(1.6, 2.2 / cam.s);
    ctx.beginPath(); ctx.arc(lt.lampX, lt.lampY, Math.min(cr, 6), 0, 6.2832); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';

  /* highlight ring on current light */
  if (currentSlug && bySlug.has(currentSlug)) {
    const lt = bySlug.get(currentSlug);
    ctx.strokeStyle = 'rgba(255,225,160,0.75)';
    ctx.lineWidth = Math.max(1, 2 / cam.s);
    ctx.beginPath();
    ctx.arc(lt.lampX, lt.lampY, 14 / Math.max(cam.s, 0.15), 0, 6.2832);
    ctx.stroke();
  }

  ctx.restore();

  /* compass rose in the chart margin (screen space, only in chart mode) */
  if (!readerOpen && cam.s < 0.5) {
    const cxr = vw - 120, cyr = vh - 130, R = 52;
    ctx.strokeStyle = 'rgba(150,175,205,0.3)';
    ctx.fillStyle = 'rgba(150,175,205,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cxr, cyr, R, 0, 6.2832); ctx.stroke();
    ctx.beginPath(); ctx.arc(cxr, cyr, R * 0.62, 0, 6.2832); ctx.stroke();
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4;
      const long = k % 2 === 0;
      const rr = long ? R : R * 0.62;
      ctx.beginPath();
      ctx.moveTo(cxr + Math.cos(a) * rr, cyr + Math.sin(a) * rr);
      ctx.lineTo(cxr + Math.cos(a + 2.9) * 5, cyr + Math.sin(a + 2.9) * 5);
      ctx.lineTo(cxr + Math.cos(a - 2.9) * 5, cyr + Math.sin(a - 2.9) * 5);
      ctx.closePath(); ctx.fill();
    }
    ctx.font = '300 13px Fraunces, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(190,210,232,0.55)';
    ctx.fillText('N', cxr, cyr - R - 8);
    ctx.font = 'italic 300 11px Fraunces, Georgia, serif';
    ctx.fillStyle = 'rgba(150,175,205,0.45)';
    ctx.fillText('seaward', cxr, cyr - R - 22);
  }
}

/* ============ animation loop ============ */
let rafId = null;
function loop(now) {
  const t = now / 1000;
  drawScene(t, now);
  rafId = requestAnimationFrame(loop);
}
function startLoop() {
  if (REDUCED) { staticDraw(); return; }
  if (!rafId) rafId = requestAnimationFrame(loop);
}
function staticDraw() {
  drawScene(4.2, performance.now());
  needsDraw = false;
}

/* ============ interaction: pan / zoom / hover / click ============ */
const tooltip = document.getElementById('tooltip');
let dragging = false, dragMoved = false, dragStart = null;

function nearestLight(sx, sy) {
  const [wx, wy] = screenToWorld(sx, sy);
  let best = null, bd = Infinity;
  const thr = 22 / cam.s + 10;
  for (const lt of lights) {
    const d = Math.hypot(lt.lampX - wx, lt.lampY - wy);
    const d2 = Math.hypot(lt.x - wx, lt.y - wy);
    const dd = Math.min(d, d2);
    if (dd < bd && dd < thr) { bd = dd; best = lt; }
  }
  return best;
}

canvas.addEventListener('pointerdown', e => {
  dragging = true; dragMoved = false;
  dragStart = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y };
  canvas.classList.add('dragging');
  canvas.setPointerCapture(e.pointerId);
  camAnim = null;
});
canvas.addEventListener('pointermove', e => {
  if (dragging) {
    const dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved = true;
    cam.x = dragStart.cx - dx / cam.s;
    cam.y = dragStart.cy - dy / cam.s;
    clampCam();
    if (REDUCED) staticDraw();
    hideTooltip();
    return;
  }
  const lt = nearestLight(e.clientX, e.clientY);
  if (lt) showTooltip(lt, e.clientX, e.clientY); else hideTooltip();
});
canvas.addEventListener('pointerup', e => {
  dragging = false;
  canvas.classList.remove('dragging');
  if (!dragMoved) {
    const lt = nearestLight(e.clientX, e.clientY);
    if (lt) { location.hash = '#' + lt.slug; }
  }
});
canvas.addEventListener('pointerleave', hideTooltip);
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const f = Math.exp(-e.deltaY * 0.0016);
  const [wx, wy] = screenToWorld(e.clientX, e.clientY);
  cam.s = Math.max(MIN_S, Math.min(MAX_S, cam.s * f));
  cam.x = wx - e.clientX / cam.s;
  cam.y = wy - e.clientY / cam.s;
  clampCam();
  camAnim = null;
  if (REDUCED) staticDraw();
}, { passive: false });

function showTooltip(lt, x, y) {
  const ch = lt.ch;
  const dark = ch.extinct && !relit.has(lt.slug);
  const pv = prov[lt.slug];
  const cls = dark ? 'dark' : (ch.color === 'G' ? 'green' : '');
  let keeper = '';
  if (pv && pv.topAuthor) {
    keeper = 'Kept by ' + pv.topAuthor + ' since ' + monthName(pv.first) + ' · ' + pv.commits +
      (pv.commits === 1 ? ' visit' : ' visits');
  }
  tooltip.innerHTML =
    '<div class="tt-name">' + escapeHtml(lt.page.sidebarLabel || lt.page.title) + '</div>' +
    '<div class="tt-char ' + cls + '">' + charNotation(ch) + (ch.extinct ? ' (extinguished)' : '') + '</div>' +
    '<div class="tt-plain">' + charPlain(ch) + (ch.extinct && relit.has(lt.slug) ? ' — relit for your watch' : '') + '</div>' +
    (keeper ? '<div class="tt-keeper">' + escapeHtml(keeper) + '</div>' : '') +
    '<div class="tt-go">click to sail to this light</div>';
  tooltip.hidden = false;
  const tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
  let tx = x + 16, ty = y + 16;
  if (tx + tw > vw - 8) tx = x - tw - 12;
  if (ty + th > vh - 8) ty = y - th - 12;
  tooltip.style.left = tx + 'px';
  tooltip.style.top = ty + 'px';
  canvas.style.cursor = 'pointer';
}
function hideTooltip() {
  tooltip.hidden = true;
  if (!dragging) canvas.style.cursor = 'grab';
}

/* zoom buttons */
document.getElementById('btn-zoomin').addEventListener('click', () => {
  const [wx, wy] = screenToWorld(vw / 2, vh / 2);
  cam.s = Math.min(MAX_S, cam.s * 1.45);
  cam.x = wx - vw / 2 / cam.s; cam.y = wy - vh / 2 / cam.s;
  clampCam(); if (REDUCED) staticDraw();
});
document.getElementById('btn-zoomout').addEventListener('click', () => {
  const [wx, wy] = screenToWorld(vw / 2, vh / 2);
  cam.s = Math.max(MIN_S, cam.s / 1.45);
  cam.x = wx - vw / 2 / cam.s; cam.y = wy - vh / 2 / cam.s;
  clampCam(); if (REDUCED) staticDraw();
});
document.getElementById('btn-fitall').addEventListener('click', () => {
  closeReaderPanel();
  flyTo(WORLD_W / 2, COAST_BASE - 350, MIN_S, 1100);
  if (REDUCED) staticDraw();
});

/* ============ HTML escaping (for OUR strings only; data html is pre-escaped) ============ */
function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ============ block renderer ============ */
const ADM_META = {
  note: ['◦', 'Note'], tip: ['☼', 'Tip'], info: ['ℹ', 'Info'],
  caution: ['△', 'Caution'], warning: ['△', 'Warning'], danger: ['✕', 'Danger'],
  strapi: ['✴', 'Strapi'], prerequisites: ['☑', 'Prerequisites'], callout: ['❖', 'Callout']
};

function renderBlocks(blocks, parent) {
  if (!Array.isArray(blocks)) return;
  for (const b of blocks) renderBlock(b, parent);
}

function renderBlock(b, parent) {
  if (!b || !b.t) return;
  switch (b.t) {
    case 'p': {
      const el = document.createElement('p');
      el.innerHTML = b.html || '';
      parent.appendChild(el);
      break;
    }
    case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
      const el = document.createElement(b.t);
      if (b.id) el.id = b.id;
      el.innerHTML = b.text || '';
      parent.appendChild(el);
      break;
    }
    case 'tldr': {
      const el = document.createElement('div');
      el.className = 'tldr';
      el.innerHTML = '<span class="tldr-label">In short</span>' + (b.html || '');
      parent.appendChild(el);
      break;
    }
    case 'ul': case 'ol': {
      const el = document.createElement(b.t);
      if (b.t === 'ol' && b.start && b.start !== 1) el.start = b.start;
      for (const it of (b.items || [])) {
        const li = document.createElement('li');
        if (typeof it === 'string') li.innerHTML = it;
        else if (it && typeof it === 'object') {
          if (it.html) { const sp = document.createElement('div'); sp.innerHTML = it.html; li.appendChild(sp); }
          if (it.blocks) renderBlocks(it.blocks, li);
        }
        el.appendChild(li);
      }
      parent.appendChild(el);
      break;
    }
    case 'code': {
      const box = document.createElement('div');
      box.className = 'codebox';
      if (b.title) {
        const t = document.createElement('div');
        t.className = 'codetitle'; t.textContent = b.title;
        box.appendChild(t);
      }
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = (b.code || '').replace(/^\n/, '');
      pre.appendChild(code); box.appendChild(pre);
      parent.appendChild(box);
      break;
    }
    case 'admonition': {
      const meta = ADM_META[b.kind] || ['◦', b.kind || 'Note'];
      const el = document.createElement('div');
      el.className = 'adm adm-' + (b.kind || 'note');
      const ti = document.createElement('div');
      ti.className = 'adm-title';
      ti.innerHTML = '<span class="adm-ico">' + meta[0] + '</span><span>' + (b.title ? b.title : meta[1]) + '</span>';
      el.appendChild(ti);
      renderBlocks(b.blocks, el);
      parent.appendChild(el);
      break;
    }
    case 'table': {
      const wrap = document.createElement('div');
      wrap.className = 'tablewrap';
      const tb = document.createElement('table');
      const align = b.align || [];
      if (b.head && b.head.length) {
        const tr = document.createElement('tr');
        b.head.forEach((h, i) => {
          const th = document.createElement('th');
          th.innerHTML = h;
          if (align[i] && align[i] !== 'left') th.style.textAlign = align[i];
          tr.appendChild(th);
        });
        const thead = document.createElement('thead');
        thead.appendChild(tr); tb.appendChild(thead);
      }
      const tbody = document.createElement('tbody');
      for (const row of (b.rows || [])) {
        const tr = document.createElement('tr');
        row.forEach((c, i) => {
          const td = document.createElement('td');
          td.innerHTML = c;
          if (align[i] && align[i] !== 'left') td.style.textAlign = align[i];
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      }
      tb.appendChild(tbody);
      wrap.appendChild(tb);
      parent.appendChild(wrap);
      break;
    }
    case 'tabs': {
      const el = document.createElement('div');
      el.className = 'tabs';
      const bar = document.createElement('div');
      bar.className = 'tabbar'; bar.setAttribute('role', 'tablist');
      const panes = document.createElement('div');
      panes.className = 'tabpanes';
      const btns = [], pv = [];
      (b.tabs || []).forEach((tab, i) => {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.setAttribute('role', 'tab');
        btn.textContent = tab.label || tab.value || ('Tab ' + (i + 1));
        btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        const pane = document.createElement('div');
        pane.className = 'tabpane';
        if (i !== 0) pane.hidden = true;
        renderBlocks(tab.blocks, pane);
        btn.addEventListener('click', () => {
          btns.forEach((bb, j) => { bb.setAttribute('aria-selected', j === i ? 'true' : 'false'); pv[j].hidden = j !== i; });
        });
        btns.push(btn); pv.push(pane);
        bar.appendChild(btn); panes.appendChild(pane);
      });
      el.appendChild(bar); el.appendChild(panes);
      parent.appendChild(el);
      break;
    }
    case 'details': {
      const el = document.createElement('details');
      if (b.id) el.id = b.id;
      const sum = document.createElement('summary');
      sum.innerHTML = b.summary || 'Details';
      el.appendChild(sum);
      const body = document.createElement('div');
      body.className = 'details-body';
      renderBlocks(b.blocks, body);
      el.appendChild(body);
      parent.appendChild(el);
      break;
    }
    case 'img': {
      const fig = document.createElement('figure');
      const img = document.createElement('img');
      img.src = b.light || b.dark || '';
      img.alt = b.alt || '';
      img.loading = 'lazy';
      fig.appendChild(img);
      if (b.caption) {
        const cap = document.createElement('figcaption');
        cap.innerHTML = b.caption;
        fig.appendChild(cap);
      }
      parent.appendChild(fig);
      break;
    }
    case 'cards': {
      const el = document.createElement('div');
      el.className = 'cards';
      for (const c of (b.items || [])) {
        const a = document.createElement('a');
        a.className = 'card';
        a.href = c.link || '#';
        a.innerHTML = '<div class="card-title">' + (c.title || '') + '</div>' +
          (c.desc ? '<div class="card-desc">' + c.desc + '</div>' : '');
        el.appendChild(a);
      }
      parent.appendChild(el);
      break;
    }
    case 'badge': {
      const el = document.createElement('span');
      el.className = 'badgechip ' + (b.kind || '');
      el.textContent = b.label || b.kind || '';
      if (b.tooltip) el.title = b.tooltip;
      parent.appendChild(el);
      break;
    }
    case 'columns': {
      const el = document.createElement('div');
      el.className = 'cols';
      for (const col of (b.cols || [])) {
        const cd = document.createElement('div');
        cd.className = 'col';
        renderBlocks(col, cd);
        el.appendChild(cd);
      }
      parent.appendChild(el);
      break;
    }
    case 'hr': {
      parent.appendChild(document.createElement('hr'));
      break;
    }
    case 'endpoint': {
      renderEndpoint(b, parent);
      break;
    }
    default: {
      /* unknown block: render any html it carries rather than lose content */
      if (b.html) {
        const el = document.createElement('div');
        el.innerHTML = b.html;
        parent.appendChild(el);
      }
    }
  }
}

function renderEndpoint(b, parent) {
  const el = document.createElement('div');
  el.className = 'endpoint ep-' + b.kind;
  const head = document.createElement('div');
  head.className = 'ep-head';
  let sig = '';
  if (b.kind === 'http' && b.method) {
    sig = '<span class="ep-method ' + escapeHtml(b.method) + '">' + escapeHtml(b.method) + '</span>' +
      '<span class="ep-sig">' + escapeHtml(b.path || '') + '</span>';
  } else if (b.path) {
    sig = '<span class="ep-sig">' + escapeHtml(b.path) + '</span>';
  }
  head.innerHTML = sig + (b.title ? '<div class="ep-title">' + escapeHtml(b.title) + '</div>' : '');
  el.appendChild(head);
  const body = document.createElement('div');
  body.className = 'ep-body';
  if (b.description) {
    const d = document.createElement('div');
    d.className = 'ep-desc'; d.innerHTML = b.description;
    body.appendChild(d);
  }
  if (b.params && b.params.length) {
    const pt = document.createElement('div');
    pt.className = 'ep-params-title'; pt.textContent = b.paramTitle || 'Parameters';
    body.appendChild(pt);
    const wrap = document.createElement('div');
    wrap.className = 'tablewrap';
    const tb = document.createElement('table');
    tb.innerHTML = '<thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead>';
    const tbody = document.createElement('tbody');
    for (const p of b.params) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td><code>' + escapeHtml(p.name) + '</code>' + (p.required ? ' <em>required</em>' : '') + '</td>' +
        '<td><code>' + escapeHtml(p.type || '') + '</code></td>' +
        '<td>' + (p.desc || '') + '</td>';
      tbody.appendChild(tr);
    }
    tb.appendChild(tbody); wrap.appendChild(tb); body.appendChild(wrap);
  }
  if (b.codeTabs && b.codeTabs.length) {
    renderBlock({
      t: 'tabs', groupId: '',
      tabs: b.codeTabs.map(ct => ({ label: ct.label || ct.lang, blocks: [{ t: 'code', lang: ct.lang, title: '', code: ct.code }] }))
    }, body);
  }
  if (b.responses && b.responses.length) {
    for (const r of b.responses) {
      const lab = document.createElement('div');
      const ok = r.status < 400;
      lab.innerHTML = '<span class="ep-status ' + (ok ? 'ok' : 'err') + '">' + escapeHtml(String(r.status)) + '</span>' +
        '<span class="ep-resp-label">' + escapeHtml(r.statusText || '') + '</span>';
      body.appendChild(lab);
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = r.body || '';
      pre.appendChild(code);
      body.appendChild(pre);
    }
  }
  el.appendChild(body);
  parent.appendChild(el);
}

/* ============ the lamp room (reader) ============ */
const reader = document.getElementById('reader');
const readerHead = document.getElementById('reader-head');
const readerBay = document.getElementById('reader-bay');
const plaque = document.getElementById('plaque');
const readerContent = document.getElementById('reader-content');
const horizonEl = document.getElementById('horizon');
const readerScroll = document.getElementById('reader-scroll');

function openPage(slug, sail) {
  const page = content.pages[slug];
  currentSlug = slug;
  readerOpen = true;
  reader.hidden = false;
  document.body.classList.add('reading');

  if (!page) {
    readerBay.textContent = '';
    readerHead.innerHTML = '<div class="light-name">No light stands here</div>';
    plaque.innerHTML = '';
    readerContent.innerHTML = '<p class="notfound">The chart shows no tower at <code>' + escapeHtml(slug) +
      '</code>. Open the chart index and pick a true light.</p>';
    horizonEl.innerHTML = '';
    document.title = 'No light here · The Coast of Lights';
    return;
  }

  const lt = bySlug.get(slug);
  const ch = lt.ch;
  const pv = prov[slug];

  /* relight a dark tower for this session's watch */
  if (ch.extinct) relit.add(slug);

  /* header */
  readerBay.textContent = lt.section.name + ' · ' + (page.product === 'cloud' ? 'Cloud waters' : 'CMS waters');
  const chipCls = ch.extinct ? 'dark' : (ch.color === 'G' ? 'green' : '');
  readerHead.innerHTML =
    '<div class="light-name">' + escapeHtml(page.sidebarLabel || page.title) + '</div>' +
    '<div class="light-char"><span class="charchip ' + chipCls + '">' + charNotation(ch) +
      (ch.extinct ? ' — relit for your watch' : '') + '</span></div>' +
    '<div class="light-plain">' + charPlain(ch) + (ch.extinct ? '; it burns again while you read' : '') + '</div>' +
    (page.description ? '<div class="light-desc">' + escapeHtml(page.description) + '</div>' : '');

  /* keepers' plaque, every word from provenance */
  if (pv) {
    const others = (pv.authors || []).filter(a => a !== pv.topAuthor);
    plaque.innerHTML =
      '<div class="plaque-title">Keepers&rsquo; plaque</div>' +
      '<div class="plaque-main">Kept by ' + escapeHtml(pv.topAuthor) + ' since ' + monthName(pv.first) +
      '. ' + pv.commits + (pv.commits === 1 ? ' visit' : ' visits') + '. ' +
      pv.night + (pv.night === 1 ? ' night watch' : ' night watches') + '.</div>' +
      '<div class="plaque-side">' + pv.careDays + ' days in care, last tended ' + monthName(pv.last) + '.' +
      (others.length ? ' Also tended by ' + others.map(escapeHtml).join(', ').replace(/\.$/, '') + '.' : '') + '</div>';
  } else {
    plaque.innerHTML = '';
  }

  /* the page itself */
  readerContent.innerHTML = '';
  renderBlocks(page.blocks, readerContent);

  /* horizon: the lights visible from this gallery = pages this one cites */
  const outs = outAdj.get(slug) || [];
  let hz = '<div class="horizon-title">Lights visible from this gallery</div>';
  if (outs.length === 0) {
    hz += '<div class="horizon-empty">Dark water in every direction: this page cites no other.</div>';
  } else {
    hz += '<ul class="horizon-lights">';
    for (const o of outs) {
      const op = content.pages[o];
      if (!op) continue;
      const olt = bySlug.get(o);
      const isMut = mutual.has(slug < o ? slug + '|' + o : o + '|' + slug);
      const dotCls = olt.ch.extinct && !relit.has(o) ? 'x' : (olt.ch.color === 'G' ? 'g' : 'w');
      hz += '<li><a href="#' + o + '"><span class="lampdot ' + dotCls + '"></span>' +
        escapeHtml(op.sidebarLabel || op.title) +
        (isMut ? ' <span class="mut" title="These two lights cite each other">&harr;</span>' : '') + '</a></li>';
    }
    hz += '</ul>';
  }
  horizonEl.innerHTML = hz;

  readerScroll.scrollTop = 0;
  document.title = page.title;

  /* sail there */
  if (sail && lt) flyTo(lt.lampX, lt.lampY, Math.max(cam.s, 0.85), 950);
  if (REDUCED) staticDraw();
  refreshIndexCurrent();
}

function closeReaderPanel() {
  readerOpen = false;
  reader.hidden = true;
  document.body.classList.remove('reading');
}
document.getElementById('reader-close').addEventListener('click', closeReaderPanel);

/* in-page anchors (#fragment) inside the reader must scroll, not route */
reader.addEventListener('click', e => {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (href.startsWith('#') && !href.startsWith('#/')) {
    e.preventDefault();
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView(REDUCED ? {} : { behavior: 'smooth' });
  }
});

/* ============ routing ============ */
function slugFromHash() {
  const h = location.hash;
  if (!h || h === '#' || h === '#/') return '/cms/intro';
  if (h.startsWith('#/')) return h.slice(1);
  return null; /* an in-page anchor bubbled to the location bar; ignore */
}
function route(sail) {
  const slug = slugFromHash();
  if (slug === null) return;
  openPage(slug, sail !== false);
}
window.addEventListener('hashchange', () => route(true));

/* ============ drawer: chart index / key / keepers ============ */
const drawer = document.getElementById('drawer');
const drawerTitle = document.getElementById('drawer-title');
const drawerBody = document.getElementById('drawer-body');
let drawerMode = null;

function toggleDrawer(mode) {
  if (drawerMode === mode && !drawer.hidden) { drawer.hidden = true; drawerMode = null; syncNavPressed(); return; }
  drawerMode = mode;
  drawer.hidden = false;
  if (mode === 'index') buildIndex();
  if (mode === 'key') buildKey();
  if (mode === 'keepers') buildKeepers();
  syncNavPressed();
}
function syncNavPressed() {
  document.getElementById('btn-index').setAttribute('aria-pressed', String(drawerMode === 'index' && !drawer.hidden));
  document.getElementById('btn-key').setAttribute('aria-pressed', String(drawerMode === 'key' && !drawer.hidden));
  document.getElementById('btn-keepers').setAttribute('aria-pressed', String(drawerMode === 'keepers' && !drawer.hidden));
}
document.getElementById('btn-index').addEventListener('click', () => toggleDrawer('index'));
document.getElementById('btn-key').addEventListener('click', () => toggleDrawer('key'));
document.getElementById('btn-keepers').addEventListener('click', () => toggleDrawer('keepers'));
drawer.addEventListener('click', e => {
  if (e.target.matches('[data-close]')) { drawer.hidden = true; drawerMode = null; syncNavPressed(); }
  const a = e.target.closest('a[data-slug]');
  if (a && window.innerWidth < 900) { drawer.hidden = true; drawerMode = null; syncNavPressed(); }
});

function buildIndex(filter) {
  drawerTitle.textContent = 'Chart index';
  const f = (filter || '').trim().toLowerCase();
  let html = '<input id="search" type="search" placeholder="Search the coast (title, tag, route)&hellip;" value="' + escapeHtml(filter || '') + '">';
  let any = false;
  for (const g of sections) {
    const rows = [];
    for (const slug of g.slugs) {
      const p = content.pages[slug];
      if (f) {
        const hay = (p.title + ' ' + (p.sidebarLabel || '') + ' ' + slug + ' ' + (p.tags || []).join(' ')).toLowerCase();
        if (!hay.includes(f)) continue;
      }
      const lt = bySlug.get(slug);
      const dark = lt.ch.extinct && !relit.has(slug);
      const dot = dark ? 'x' : (lt.ch.color === 'G' ? 'g' : 'w');
      rows.push('<li><a data-slug href="#' + slug + '" class="' + (slug === currentSlug ? 'current' : '') + '">' +
        '<span class="lampdot ' + dot + '"></span><span>' + escapeHtml(p.sidebarLabel || p.title) + '</span>' +
        '<span class="idx-char">' + (lt.ch.extinct ? '<span class="idx-ext">ext.</span>' : charNotation(lt.ch)) + '</span></a></li>');
    }
    if (!rows.length) continue;
    any = true;
    html += '<div class="idx-section"><div class="idx-bay">' + escapeHtml(g.name) +
      ' <span class="bay-kind">· ' + (g.product === 'cloud' ? 'Cloud' : 'CMS') + ' · ' + rows.length +
      (rows.length === 1 ? ' light' : ' lights') + '</span></div><ul class="idx-list">' + rows.join('') + '</ul></div>';
  }
  if (!any) html += '<p class="idx-none">No light answers that call.</p>';
  drawerBody.innerHTML = html;
  const inp = document.getElementById('search');
  inp.addEventListener('input', () => {
    const v = inp.value;
    clearTimeout(inp._t);
    inp._t = setTimeout(() => {
      const pos = inp.selectionStart;
      buildIndex(v);
      const ni = document.getElementById('search');
      ni.focus(); ni.setSelectionRange(pos, pos);
    }, 140);
  });
  if (f) inp.focus();
}
function refreshIndexCurrent() {
  if (drawerMode === 'index' && !drawer.hidden) {
    const cur = drawerBody.querySelector('a.current');
    if (cur) cur.classList.remove('current');
    const nw = drawerBody.querySelector('a[href="#' + (CSS && CSS.escape ? CSS.escape(currentSlug || '') : currentSlug) + '"]');
    if (nw) nw.classList.add('current');
  }
}

function buildKey() {
  drawerTitle.textContent = 'The key';
  const nExt = lights.filter(l => l.ch.extinct).length;
  const nMut = mutual.size;
  const nKeepers = new Set(Object.values(prov).flatMap(p => p.authors || [])).size;
  const nNight = Object.values(prov).reduce((s, p) => s + (p.night || 0), 0);
  const capeCh = bySlug.get(CAPE) ? charNotation(bySlug.get(CAPE).ch) : '';
  drawerBody.innerHTML =
    '<div class="key-motto">Every rhythm you see is this documentation&rsquo;s own history. Nothing blinks at random.</div>' +
    '<div class="key-block"><h3>How each light earns its characteristic</h3>' +
    'Sailors read a lighthouse by its light characteristic &mdash; <span class="mono">Fl(3) W 12s 9M</span> means ' +
    '<em>three white flashes, every 12 seconds, seen 9 miles out</em>. Here, every part of that code is measured, not chosen:</div>' +
    '<div class="key-block"><h3>Flashes in a group</h3>How often the page has been worked on. ' +
    '1&ndash;2 commits &rarr; <span class="mono">Fl</span>, 3&ndash;5 &rarr; <span class="mono">Fl(2)</span>, ' +
    '6&ndash;11 &rarr; <span class="mono">Fl(3)</span>, 12&ndash;24 &rarr; <span class="mono">Fl(4)</span>, ' +
    '25 or more &rarr; <span class="mono">Fl(5)</span>.</div>' +
    '<div class="key-block"><h3>Flashing or occulting</h3>A page carrying 12 or more code blocks shows an ' +
    '<span class="mono">Oc</span> (occulting) light &mdash; more light than dark &mdash; because a page dense with ' +
    'working code holds its lamp longer than its silence.</div>' +
    '<div class="key-block"><h3>Period</h3>Years in care (first commit to last): each full year adds 2 seconds to a base of 6. ' +
    'The oldest pages breathe slowest, <span class="mono">12s</span>.</div>' +
    '<div class="key-block"><h3>Colour</h3>CMS pages burn <span class="mono">W</span> warm white; Cloud pages burn ' +
    '<span class="mono green">G</span> green, as real channel markers differ.</div>' +
    '<div class="key-block"><h3>Range</h3>How far a light carries = how often other pages cite it: ' +
    '<span class="mono">3 + 2&radic;(inbound citations)</span> nautical miles, and the glow you see grows with it. ' +
    'The great cape light, <em>Breaking changes</em> (' + escapeHtml(capeCh) + ', 57 citations), is visible from everywhere on this coast. ' +
    'The four lights cited 25 times or more sweep true rotating beams.</div>' +
    '<div class="key-block"><h3>Dark lights</h3>' + nExt + ' towers stand with their lamps out &mdash; pages no other page cites &mdash; ' +
    'marked <em>(extinguished)</em> on the chart. Visit one and it burns again for your whole watch.</div>' +
    '<div class="key-block"><h3>The coast itself</h3>The 18 bays and headlands are the documentation&rsquo;s 18 chart sections, ' +
    'laid along one continuous coastline. The dotted shipping lane threads every light in reading order, the way a coastal ' +
    'passage plan does. The fractal shore, the headlands&rsquo; placement, the swell&rsquo;s phase, the fog banks&rsquo; drift and ' +
    'each lamp&rsquo;s phase offset are drawn from one fixed seed; the rhythms themselves are the data.</div>' +
    '<div class="key-block"><h3>This coast in numbers</h3><ul class="key-counts">' +
    '<li><span class="n">' + lights.length + '</span> lighthouses, one per page</li>' +
    '<li><span class="n">' + sections.length + '</span> bays and headlands</li>' +
    '<li><span class="n">' + graph.edges.length + '</span> sightlines between lights (citations)</li>' +
    '<li><span class="n">' + nMut + '</span> pairs of lights that answer each other (mutual citations, marked &harr;)</li>' +
    '<li><span class="n">' + nExt + '</span> extinguished lamps</li>' +
    '<li><span class="n">' + nKeepers + '</span> keepers on the roll of honour</li>' +
    '<li><span class="n">' + nNight + '</span> night watches stood (edits between midnight and 6 a.m.)</li>' +
    '</ul></div>';
}

function buildKeepers() {
  drawerTitle.textContent = 'Roll of honour';
  const tends = new Map(), keeps = new Map();
  for (const slug of Object.keys(prov)) {
    const p = prov[slug];
    for (const a of (p.authors || [])) tends.set(a, (tends.get(a) || 0) + 1);
    if (p.topAuthor) keeps.set(p.topAuthor, (keeps.get(p.topAuthor) || 0) + 1);
  }
  const names = [...tends.keys()].sort((a, b) => (tends.get(b) - tends.get(a)) || a.localeCompare(b));
  let html = '<p class="roll-intro">The ' + names.length + ' keepers of this coast, and the lights each has tended, ' +
    'from six years of the documentation&rsquo;s history. Every name is real.</p><ul class="roll">';
  for (const n of names) {
    const t = tends.get(n), k = keeps.get(n) || 0;
    html += '<li><span class="keeper-name">' + escapeHtml(n) + '</span><span class="keeper-n">' +
      t + (t === 1 ? ' light' : ' lights') + (k ? ' · principal keeper of ' + k : '') + '</span></li>';
  }
  html += '</ul>';
  drawerBody.innerHTML = html;
}

/* intro */
document.getElementById('intro-close').addEventListener('click', () => {
  document.getElementById('intro').remove();
});

/* ============ boot ============ */
Promise.all([
  fetch('content.json').then(r => r.json()),
  fetch('graph.json').then(r => r.json()),
  fetch('communities.json').then(r => r.json()),
  fetch('provenance.json').then(r => r.json())
]).then(([c, g, cm, pv]) => {
  content = c; graph = g; communities = cm; prov = pv;
  buildWorld();
  resize();
  /* first view: a stretch of coast around the first light, lamps already blinking */
  const first = bySlug.get(slugFromHash() || '/cms/intro') || lights[0];
  cam.s = 0.5;
  cam.x = first.x - (vw * 0.35) / cam.s;
  cam.y = first.y - (vh * 0.55) / cam.s;
  clampCam();
  startLoop();
  route(false);
  window.addEventListener('resize', () => { resize(); clampCam(); if (REDUCED) staticDraw(); });
}).catch(err => {
  document.body.insertAdjacentHTML('beforeend',
    '<p style="position:fixed;inset:auto 16px 16px;color:#f0c4b4;font-family:serif">The chart could not be loaded: ' +
    escapeHtml(err && err.message) + '</p>');
});

})();
