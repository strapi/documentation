/* ============================================================
   STAGE 2, IDEAS 2 + 3 + 4 - WEATHER AT SEA
   PASSING WEATHER (idea 2): fronts cross the sea on the corpus's own
   calendar - the trailing twelvemonth of real last-edit dates replayed,
   a month a minute. Months where the ink fell thick bring hatched rain;
   the thickest bring squall and, rarely, one engraved fork of lightning
   with a rolled soft thunder. Months with no ink are clearings.
   STORM WATERS (idea 3): the sea state runs with the citations borne
   into the waters she sails - Breaking Changes (57 in) is squall
   country: taller swell, spray, a heavier helm, all bounded so she
   always answers. A STORM-GLASS on the chart table reads the bound-for
   waters before you sail.
   THE TENDING (idea 4): freshly tended waters sparkle; long-untended
   waters carry grey and banks of mist. Freshness is provenance, nothing
   else. Everything eases in and out, never during the title, never over
   the reading, and reduced motion swaps state without any fork.
   ============================================================ */
const WX_MONTH_S = 60;                 /* one corpus month crosses in a minute */
const WX_SNAP = '2026-09-05';          /* the corpus snapshot day (same as ageOfInk) */
const wx = {
  months: [], built: false, mIx: -1, forceIx: null,
  rain: 0, squall: 0, sparkle: 0, mist: 0, grey: 0,
  helm: 0, seaVis: 0, local: 0, lat: 1,
  thunderDone: false, fork: null, forkFrames: 0,
  drops: null, glints: null, glass: null, glassKey: ''
};

function wxInit() {
  if (wx.built) return;
  wx.built = true;
  /* the calendar is the corpus's own: how many pages took their last ink
     in each of the trailing twelve months before the snapshot */
  const counts = new Map();
  for (const I of world.islands) {
    const m = (I.last || '').slice(0, 7);
    if (m) counts.set(m, (counts.get(m) || 0) + 1);
  }
  const list = [];
  let y = 2025, mo = 10;               /* 2025-10 .. 2026-09 */
  for (let i = 0; i < 12; i++) {
    const key = y + '-' + String(mo).padStart(2, '0');
    list.push({ key, n: counts.get(key) || 0 });
    mo++; if (mo > 12) { mo = 1; y++; }
  }
  /* the tending scale is the corpus's own: grey ramps from the oldest
     quartile of the ink to the oldest ink there is */
  const stales = world.islands
    .filter(I => I.last)
    .map(I => (Date.parse(WX_SNAP) - Date.parse(I.last)) / 86400000)
    .sort((a, b) => a - b);
  wx.staleP75 = stales[Math.floor(stales.length * 0.75)] || 90;
  wx.staleMax = Math.max(stales[stales.length - 1] || 365, wx.staleP75 + 30);
  diag.wxStale = { p75: Math.round(wx.staleP75), max: Math.round(wx.staleMax) };
  const ns = list.map(m => m.n).slice().sort((a, b) => a - b);
  const q3 = Math.max(1, ns[Math.floor(ns.length * 0.72)]);
  const q9 = Math.max(2, ns[Math.floor(ns.length * 0.90)]);
  for (const m of list) {
    m.rain = m.n <= 0 ? 0 : clamp(m.n / q3, 0, 1);
    m.squall = m.n >= q9 ? 1 : 0;
  }
  wx.months = list;
  diag.wxCalendar = list.map(m => m.key.slice(2) + ':' + m.n).join(' ');
}

/* idea 3: what the citations raise in a given water */
function wxGlassReading(I) {
  const n = I ? (I.inbound || 0) : 0;
  const s = clamp(n / 57, 0, 1);
  const words =
    n >= 45 ? 'the liquor is troubled and flaked - squall country' :
    n >= 25 ? 'the liquor clouds - a heavy swell runs' :
    n >= 8 ? 'a feather of crystal - a working sea' :
    'the liquor stands clear - fair water';
  return { n, s, words, name: I ? I.title : 'the open sea' };
}

function wxTick(dt) {
  if (!wx.built) wxInit();
  const live = env.t > 7.5;            /* never during the six-second title */
  const n = wx.months.length;
  const ix = wx.forceIx != null ? wx.forceIx : Math.floor(env.t / WX_MONTH_S) % n;
  if (ix !== wx.mIx) { wx.mIx = ix; wx.thunderDone = false; }
  const M = wx.months[ix];
  const b = ship.bound || world.island;
  wx.local = b ? clamp((b.inbound || 0) / 57, 0, 1) : 0;
  const gate = clamp((wx.local - 0.8) / 0.2, 0, 1);   /* true squall country only */
  const rainT = live ? M.rain : 0;
  const squallT = live ? M.squall : 0;
  let spT = 0, gT = 0;
  if (live && b && b.last) {
    const stale = (Date.parse(WX_SNAP) - Date.parse(b.last)) / 86400000;
    if (stale < 60) spT = 1 - stale / 60;
    gT = clamp((stale - wx.staleP75) / (wx.staleMax - wx.staleP75), 0, 1);
  }
  const k = REDUCED ? 1 : 1 - Math.exp(-dt / 4.2);
  wx.rain += (rainT - wx.rain) * k;
  wx.squall += (squallT - wx.squall) * k;
  wx.sparkle += (spT - wx.sparkle) * k;
  wx.mist += (gT - wx.mist) * k;
  wx.grey = wx.mist;
  /* the helm goes heavy only where the sea truly rises - and stays bounded */
  const helmT = clamp(gate * (0.62 + 0.38 * wx.squall) + 0.30 * wx.squall, 0, 1);
  wx.helm += (helmT - wx.helm) * k;
  const visT = clamp(gate * 0.7 + wx.squall * 0.5 + wx.rain * 0.22, 0, 1);
  wx.seaVis += (visT - wx.seaVis) * k;
  /* the wind's lateral hand slants the rain, the same hand the streaks read */
  const wind = windAtShip();
  const hb2 = ship.bearing * Math.PI / 180;
  const wmm = Math.hypot(wind.x, wind.y) || 1;
  wx.lat = (wind.x * Math.cos(hb2) + wind.y * Math.sin(hb2)) / wmm;
  /* THUNDER: rare, one fork, never in the first minute, never reduced */
  if (M.squall && live && !wx.thunderDone && !REDUCED && env.t > 60 && wx.squall > 0.5) {
    const off = 8 + (M.n * 7) % 40;
    if ((env.t % WX_MONTH_S) >= off) wxBolt(M.key);
  }
  diag.wx = {
    month: M.key, ink: M.n,
    rain: +wx.rain.toFixed(3), squall: +wx.squall.toFixed(3),
    sparkle: +wx.sparkle.toFixed(3), mist: +wx.mist.toFixed(3),
    helm: +wx.helm.toFixed(3), seaVis: +wx.seaVis.toFixed(3),
    local: +wx.local.toFixed(3)
  };
}

function wxBolt(seed) {
  wx.thunderDone = true;
  wx.fork = mkFork(seed || 'now');
  wx.forkFrames = 2;
  setTimeout(() => { try { sound.thunder(); } catch (e) { /* the sky alone */ } }, 800);
  diag.thunderAtT = Math.round(env.t);
}

function mkFork(seed) {
  const rnd = rngFor('fork:' + seed);
  let x = 250 + rnd() * (W - 500), y = 36 + rnd() * 44;
  const pts = [[x, y]], branches = [];
  while (y < HORIZON - 26) {
    x += (rnd() - 0.5) * 88;
    y += 28 + rnd() * 40;
    pts.push([x, y]);
    if (rnd() < 0.34 && branches.length < 2) {
      let bx = x, by = y;
      const b = [[bx, by]];
      const m2 = 2 + Math.floor(rnd() * 2);
      for (let j = 0; j < m2; j++) {
        bx += (rnd() - 0.5) * 110; by += 22 + rnd() * 30;
        b.push([bx, by]);
      }
      branches.push(b);
    }
  }
  return { pts, branches };
}

function wxDrops() {
  if (wx.drops) return wx.drops;
  const rnd = rngFor('wxrain');
  wx.drops = [];
  for (let i = 0; i < 110; i++) wx.drops.push({
    x: rnd() * (W + 300) - 150, y: rnd() * (H + 60),
    l: 11 + rnd() * 15, sp: 300 + rnd() * 260, far: i % 3 === 0
  });
  return wx.drops;
}
function wxGlints() {
  if (wx.glints) return wx.glints;
  const rnd = rngFor('wxglint');
  wx.glints = [];
  for (let i = 0; i < 16; i++) wx.glints.push({
    x: 90 + rnd() * (W - 180), y: HORIZON + 34 + rnd() * 190,
    f: rnd() * 0.9, ph: rnd()
  });
  return wx.glints;
}

/* over the sea, under the frontispiece: the tending made visible */
function drawWeather(sim, worldDY) {
  const m = wx.mist;
  if (m > 0.015) {
    /* banks of mist on long-untended water, the fog's own billow hand laid flat */
    ctx.save();
    ctx.fillStyle = '#efe6cd';
    for (let i = 0; i < 3; i++) {
      const dy2 = REDUCED ? 0 : Math.sin(env.t * 0.11 + i * 2.1) * 6;
      const dx2 = REDUCED ? 0 : Math.sin(env.t * 0.05 + i) * 60;
      ctx.globalAlpha = 0.15 * m * (1 - i * 0.18);
      ctx.beginPath();
      ctx.ellipse(W * (0.24 + 0.26 * i) + dx2, HORIZON + worldDY + 26 + i * 46 + dy2,
        330 + i * 90, 15 + i * 7, 0, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 0.20 * m;
    ctx.strokeStyle = 'rgba(96,80,58,0.8)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 2; i++) {
      const y = HORIZON + worldDY + 30 + i * 46;
      ctx.beginPath();
      for (let x2 = 120 * i; x2 < W; x2 += 96) ctx.arc(x2 + 46, y, 26, Math.PI * 1.06, Math.PI * 1.94);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  const sp = wx.sparkle;
  if (sp > 0.02) {
    /* fresh ink sparkles: paper-bright glints riding the swell */
    ctx.save();
    ctx.fillStyle = '#faf3df';
    for (const d of wxGlints()) {
      const tw = REDUCED ? 0.6 : 0.5 + 0.5 * Math.sin(env.t * (1.3 + d.f) + d.ph * 6.3);
      ctx.globalAlpha = sp * 0.55 * tw;
      ctx.fillRect(d.x - 1.2, d.y + worldDY, 2.6, 1.1);
      ctx.globalAlpha = sp * 0.28 * tw;
      ctx.fillRect(d.x - 3.6, d.y + worldDY + 0.2, 7.4, 0.5);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

/* in front of the deck, behind the spyglass: the front itself */
function drawRainFront(sim) {
  const r = wx.rain, sq = wx.squall;
  /* the wash: rain darkens the plate a stop, the squall two more */
  const dark = 0.055 * r + 0.115 * sq;
  if (dark > 0.004) {
    ctx.fillStyle = 'rgba(36,38,50,' + dark.toFixed(3) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  if (wx.forkFrames > 0 && !REDUCED) { drawFork(); wx.forkFrames--; }
  if (r < 0.02) return;
  /* hatched rain, angling with the wind's lateral hand */
  const dir = wx.lat >= 0 ? 1 : -1;
  const slant = dir * (7 + 8 * sq);
  ctx.save();
  ctx.strokeStyle = 'rgba(38,30,20,1)';
  ctx.lineCap = 'round';
  for (const d of wxDrops()) {
    const fall = REDUCED ? 0 : env.t * d.sp;
    const y = ((d.y + fall) % (H + 60)) - 30;
    const x = ((d.x + (REDUCED ? 0 : fall * 0.14 * dir) % (W + 300)) + W + 300) % (W + 300) - 150;
    ctx.globalAlpha = r * (d.far ? 0.10 : 0.17);
    ctx.lineWidth = d.far ? 0.7 : 1.0;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + slant * (d.l / 16), y + d.l * (d.far ? 0.8 : 1.25));
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawFork() {
  const F = wx.fork;
  if (!F) return;
  ctx.save();
  /* the flash: the sky whitens one breath */
  ctx.fillStyle = 'rgba(248,242,226,0.20)';
  ctx.fillRect(0, 0, W, HORIZON + 12);
  const run = (w2, c2) => {
    ctx.strokeStyle = c2; ctx.lineWidth = w2;
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(F.pts[0][0], F.pts[0][1]);
    for (const p of F.pts) ctx.lineTo(p[0], p[1]);
    for (const b of F.branches) {
      ctx.moveTo(b[0][0], b[0][1]);
      for (const p of b) ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();
  };
  run(3.2, 'rgba(250,245,230,0.92)');
  run(1.15, 'rgba(46,36,24,0.85)');
  ctx.restore();
}

/* ---- THE STORM-GLASS on the chart table (idea 3) ---- */
function updateStormGlass() {
  const el = $('stormglass');
  if (!el) return;
  const I = chart.hover || ship.bound || world.island;
  const r = wxGlassReading(I);
  wx.glass = r;
  const key = r.name + '|' + r.n;
  if (key === wx.glassKey) return;
  wx.glassKey = key;
  el.innerHTML =
    '<div class="sg-h">THE STORM-GLASS</div>' +
    '<div class="sg-line">' + (chart.hover ? 'over ' : 'bound for ') + '<b>' + esc(r.name) + '</b>: ' + r.words + '</div>' +
    '<div class="sg-sub">' + (r.n ? r.n + (r.n === 1 ? ' citation borne in' : ' citations borne in') + ' - the sea off her runs with them'
      : 'no citation reaches her - a still water') + '</div>';
  chartSettle();   /* the liquor itself is engraved on the next settled plate */
}
function drawStormGlass(g, B) {
  drawPanel(g, B, !chartViewIdent());
  const r = wx.glass || wxGlassReading(ship.bound || world.island);
  const x = B.x + 27, cy = B.y + B.h / 2;
  g.save();
  g.lineJoin = 'round'; g.lineCap = 'round';
  /* the sealed vial */
  const vw = 13, vh = 48, vx = x - vw / 2, vy = cy - vh / 2;
  g.strokeStyle = INK + '0.85)'; g.lineWidth = 1.15;
  g.strokeRect(vx, vy, vw, vh);
  g.beginPath(); g.moveTo(vx - 3, vy); g.lineTo(vx + vw + 3, vy); g.stroke();
  g.beginPath(); g.moveTo(vx + 2, vy - 3.5); g.lineTo(vx + vw - 2, vy - 3.5); g.stroke();
  /* the liquor stands with the trouble of the bound-for water */
  const lvl = 0.34 + 0.46 * r.s;
  const ly = vy + vh * (1 - lvl);
  g.fillStyle = 'rgba(118,130,118,0.28)';
  g.fillRect(vx + 1, ly, vw - 2, vh - (ly - vy) - 1);
  g.strokeStyle = INK + '0.62)'; g.lineWidth = 0.8;
  if (r.s > 0.72) {
    /* troubled and flaked */
    g.beginPath();
    for (let i = 0; i <= 6; i++) g.lineTo(vx + 1 + (vw - 2) * i / 6, ly + ((i % 2) ? -1.9 : 1.9));
    g.stroke();
    g.fillStyle = INK + '0.5)';
    const rr = rngFor('sgflake');
    for (let i = 0; i < 7; i++) g.fillRect(vx + 2 + rr() * (vw - 5.5), ly + 3 + rr() * (vh * lvl - 8), 1.7, 0.9);
  } else {
    g.beginPath(); g.moveTo(vx + 1, ly); g.lineTo(vx + vw - 1, ly); g.stroke();
    if (r.s > 0.42) {
      /* the liquor clouds */
      g.strokeStyle = INK + '0.34)'; g.lineWidth = 0.6;
      g.beginPath();
      g.arc(vx + vw / 2, ly + 9, 3.4, 0, TAU);
      g.arc(vx + vw / 2 - 2.6, ly + 13, 2.5, 0, TAU);
      g.stroke();
    } else if (r.s > 0.14) {
      /* a feather of crystal on the wall */
      g.strokeStyle = INK + '0.55)'; g.lineWidth = 0.7;
      g.beginPath();
      g.moveTo(vx + 2.5, ly + 6); g.lineTo(vx + 5.5, ly + 12);
      g.moveTo(vx + 4, ly + 8); g.lineTo(vx + 2.8, ly + 12.5);
      g.stroke();
    }
  }
  g.restore();
}
