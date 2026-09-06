/* r10 patch 4: CLICK IS A VOYAGE, the tooltip at the hand, the portal-confirm
   law on all seven crossings, and QUICK START FIRST with pennant and
   counting-down distance line. */
'use strict';
const fs = require('fs');
const F = 'deadreckoning.js';
let src = fs.readFileSync(F, 'utf8');
let fails = 0;
function rep(a, b) {
  if (src.indexOf(a) < 0) { console.error('NOT FOUND: ' + a.slice(0, 76).replace(/\n/g, '\\n')); fails++; return; }
  src = src.replace(a, b);
}

/* ---------- state ---------- */
rep(
"const story = { leadsman1: false, leadsman2: false, started: false, raised: false, lastDist: null, minDist: null };",
`const story = { leadsman1: false, leadsman2: false, started: false, raised: false, lastDist: null, minDist: null,
  maiden: false, qs: null };

/* THE PASSAGE (owner order): clicking a place on the chart is a short sailed
   passage, not a warp - the chart folds away, sea and sky sweep past, and she
   arrives in those waters with the shore dead ahead. Skippable with any key;
   reduced motion lands at once with a one-line caption. */
const passage = { on: false, closing: false, t: 0, dur: 2, ax: 0, ay: 0, bx: 0, by: 0, isle: null, nm: 0 };`);

/* ---------- update() gates ---------- */
rep(
`  let targetKn = ship.anchored ? 0 : sailBase(ship.sail) * polar * windFactor;
  ship.knots += clamp(targetKn - ship.knots, -dt * 2.2, dt * 1.4);
  if (ship.knots < 0.01 && targetKn === 0) ship.knots = 0;

  const eff = effectiveOrder(t);
  if (REDUCED) {`,
`  if (!passage.on) {
    let targetKn = ship.anchored ? 0 : sailBase(ship.sail) * polar * windFactor;
    ship.knots += clamp(targetKn - ship.knots, -dt * 2.2, dt * 1.4);
    if (ship.knots < 0.01 && targetKn === 0) ship.knots = 0;
  }

  const eff = effectiveOrder(t);
  if (passage.on) {
    /* the passage cons her herself: helm and canvas answer to it alone */
  } else if (REDUCED) {`);
rep(
`  if (!REDUCED && !ship.anchored) {
    const nmPerSec = ship.knots * COMPRESSION / 3600;
    const u = nmPerSec * dt / world.nmPerUnit;
    ship.x += hx * u;
    ship.y += hy * u;
  }`,
`  if (passage.on) {
    passageTick(dt);
  } else if (!REDUCED && !ship.anchored) {
    const nmPerSec = ship.knots * COMPRESSION / 3600;
    const u = nmPerSec * dt / world.nmPerUnit;
    ship.x += hx * u;
    ship.y += hy * u;
  }`);
rep(
`  if (ship.clearOf && distToNm(ship.clearOf) > 0.72) ship.clearOf = null;
  if (!ship.anchored && ship.bound && ship.bound !== ship.clearOf) {`,
`  if (ship.clearOf && distToNm(ship.clearOf) > 0.72) ship.clearOf = null;
  if (!passage.on && !ship.anchored && ship.bound && ship.bound !== ship.clearOf) {`);
rep(
"    if (d2 < clear2 && I !== ship.bound && !REDUCED) {",
"    if (d2 < clear2 && I !== ship.bound && !REDUCED && !passage.on) {");

/* ---------- the maiden story ---------- */
rep(
`  if (!story.started && t > 1) {
    story.started = true;
    caption('Out of Quick Start roads, bound for the Document Service shore.', 4200);
    caption('The wind stands fair, down the citation flow.', 3800);
  }`,
`  if (!story.started && t > 1) {
    story.started = true;
    if (story.maiden) {
      caption('Her maiden call: the Quick Start Guide first, as every new hand raises her first.', 4800);
      caption('The pennant flies on that shore. The wind stands fair, down the citation flow.', 4200);
    } else {
      caption('Out of Quick Start roads, bound for the Document Service shore.', 4200);
      caption('The wind stands fair, down the citation flow.', 3800);
    }
  }`);

/* ---------- render: pennant + passage sweep ---------- */
rep(
`  /* the world (draws its own paper + wash ground) */
  drawWorld(sim, worldDY, null);
  diag.lod = islandStage(sim.dist);`,
`  /* the world (draws its own paper + wash ground) */
  drawWorld(sim, worldDY, null);
  diag.lod = islandStage(sim.dist);
  if (story.maiden && story.qs && ui.mode === 'deck') drawMaidenPennant(worldDY);
  if (passage.on && !REDUCED) drawPassageSweep();`);

/* ---------- new functions, before updateLandfallPlate ---------- */
rep(
"/* the landfall plate on deck: crisp DOM, never painted into the canvas */",
`/* QUICK START FIRST (owner law): on a cold load the first landfall is the
   Quick Start Guide - her shore flies a pennant, and a counting-down distance
   line stands until the maiden landfall is made. */
function drawMaidenPennant(worldDY) {
  const qs = story.qs;
  const dist = distToNm(qs);
  if (dist > VIS_NM * 1.25) return;
  const az = angDiff(bearingTo(qs), ship.bearing);
  if (Math.abs(az) > FOV / 2 + 6) return;
  const g = ctx, t = env.t;
  const x = W / 2 + az * PXDEG;
  const yBase = HORIZON + worldDY + 2;
  const wpx = islandScreenW(dist, qs.mag);
  const h = clamp(wpx * 0.30 + 30, 46, 168);
  const top = yBase - h;
  const fl = clamp(wpx * 0.09 + 16, 20, 60);
  const wob = REDUCED ? 0 : Math.sin(t * 3.1) * fl * 0.09;
  g.save();
  g.globalAlpha = clamp((VIS_NM * 1.25 - dist) / 1.1, 0.35, 1);
  g.strokeStyle = 'rgba(32,23,13,0.92)';
  g.lineWidth = Math.max(1.1, wpx * 0.0035);
  g.beginPath(); g.moveTo(x, yBase); g.lineTo(x, top); g.stroke();
  g.fillStyle = 'rgba(141,47,34,0.88)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(x, top);
  g.quadraticCurveTo(x + fl * 0.55, top + 2 + wob * 0.4, x + fl, top + 4 + wob);
  g.lineTo(x + fl * 0.62, top + 8 + wob * 0.5);
  g.lineTo(x + fl, top + 13 + wob);
  g.quadraticCurveTo(x + fl * 0.5, top + 15 + wob * 0.4, x, top + 13);
  g.closePath(); g.fill(); g.stroke();
  g.restore();
}

function updateFirstBound() {
  const el = document.getElementById('firstbound');
  if (!el) return;
  if (story.maiden && story.qs && visit.charted.has(story.qs.slug)) {
    story.maiden = false;
    captionNow('Maiden landfall made. The sea is yours now: C opens the chart table.', 5200);
  }
  if (!story.maiden || !story.qs || ui.mode !== 'deck') { if (!el.hidden) el.hidden = true; return; }
  const d = distToNm(story.qs);
  const txt = 'MAIDEN LANDFALL \\u00b7 THE QUICK START GUIDE \\u00b7 ' +
    (d >= 9.95 ? String(Math.round(d)) : d.toFixed(2)) + ' nm' +
    (ship.knots > 0.25 ? ', closing' : ' \\u00b7 F makes sail');
  if (el.textContent !== txt) el.textContent = txt;
  if (el.hidden) el.hidden = false;
}

/* ---- the passage itself ---- */
function passageTo(isle) {
  if (!isle || passage.on || passage.closing) return;
  firstOrder('sail');
  passage.isle = isle;
  passage.nm = distToNm(isle);
  if (ui.slug) { $('anchorage').hidden = true; ui.slug = null; }
  if (ship.anchored) { ship.anchored = false; ship.atAnchorOff = null; }
  if (REDUCED) {
    closeBelow();
    ui.mode = 'deck';
    landAfterPassage(true);
    return;
  }
  passage.closing = true;
  const below = $('below');
  below.classList.add('passing');
  setTimeout(() => {
    below.classList.remove('passing');
    passage.closing = false;
    closeBelow();
    ui.mode = 'deck';
    beginPassage();
  }, 430);
}
function beginPassage() {
  const isle = passage.isle;
  if (!isle) return;
  const d = approachDirFor(isle);
  const u = 0.55 / world.nmPerUnit;
  passage.ax = ship.x; passage.ay = ship.y;
  passage.bx = isle.pos.x - d.x * u;
  passage.by = isle.pos.y - d.y * u;
  passage.dur = clamp(1.4 + passage.nm * 0.022, 1.5, 2.4);
  passage.t = 0;
  passage.on = true;
  diag.passage = { to: isle.slug, nm: +passage.nm.toFixed(2), dur: +passage.dur.toFixed(2) };
  setBound(isle, true);
  ship.sail = 'travel';
  captionNow('Passage: ' + (Math.round(passage.nm * 10) / 10) + ' nm to ' + isle.title +
    '. Any key lands you there.', 2800);
  dirty = true;
}
function passageTick(dt) {
  passage.t += dt;
  const T = clamp(passage.t / passage.dur, 0, 1);
  const s = T * T * (3 - 2 * T);
  ship.x = lerp(passage.ax, passage.bx, s);
  ship.y = lerp(passage.ay, passage.by, s);
  const brg = norm360(Math.atan2(passage.bx - ship.x, passage.by - ship.y) * 180 / Math.PI);
  if (T < 0.999) { ship.bearing = ship.orderedBearing = brg; }
  ship.omega = 0;
  /* the way she carries, for the spray and the chant: a bell of speed */
  ship.knots = 8 + 26 * (4 * s * (1 - s));
  if (T >= 1) endPassage(false);
}
function endPassage(skipped) {
  if (!passage.on) return;
  passage.on = false;
  landAfterPassage(false, skipped);
}
function landAfterPassage(reduced, skipped) {
  const isle = passage.isle;
  passage.isle = null;
  if (!isle) return;
  placeShipAtDistance(0.55, isle);
  ship.sail = 'half';
  ship.knots = 4.6;
  visit.track.push({ x: ship.x, y: ship.y });
  logPacket(isle, 'passage');
  if (reduced) {
    captionNow('Passage made - ' + (Math.round(passage.nm * 10) / 10) + ' nm.', 5200);
  } else {
    captionNow('Passage made - ' + (Math.round(passage.nm * 10) / 10) + ' nm. ' +
      isle.title + ' lies dead ahead.', 5200);
  }
  diag.passage = { landed: isle.slug, nm: +passage.nm.toFixed(2), skipped: !!skipped };
  dirty = true;
}
function drawPassageSweep() {
  const T = clamp(passage.t / passage.dur, 0, 1);
  const v = Math.sin(T * Math.PI);
  if (v <= 0.03) return;
  const g = ctx;
  const rr = rngFor('sweep:' + Math.floor(env.t * 14));
  g.save();
  /* the sky streams past */
  g.globalAlpha = 0.22 * v;
  g.strokeStyle = 'rgba(64,50,32,0.85)';
  g.lineWidth = 1.3;
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const y = 36 + rr() * (HORIZON - 80);
    const x0 = rr() * (W + 200) - 100, len = (90 + rr() * 260) * v;
    g.moveTo(x0, y); g.lineTo(x0 - len, y + len * 0.04);
  }
  g.stroke();
  /* and the sea throws spray */
  g.globalAlpha = 0.45 * v;
  g.fillStyle = 'rgba(241,231,208,0.9)';
  for (let i = 0; i < 24; i++) {
    const x = W / 2 + (rr() - 0.5) * 760;
    const y = HORIZON + 110 + rr() * 320;
    g.fillRect(x, y, 2 + rr() * 2.5, 1 + rr() * 2);
  }
  g.restore();
}

/* ---- THE PORTAL CONFIRM (owner law): every crossing asks, in the fiction ---- */
const portal = { open: false, key: null, beat: '', ms: 0, denyT: {} };
const PORTAL_Q = {
  pixelcity: 'The boat stands ready under the glittering quay. Go ashore?',
  bythedeep: 'The water ahead is ink, and the hatching waits to close over her. Sail in?',
  longway: 'The path takes the cliff in long, easy zigzags. Follow it ashore?',
  firstlight: 'That is no star, and she is answering. Answer her back?',
  herbarium: 'The pressed sprig slipped from the log for a reason. Follow it?',
  secreta: 'The cork will give if you draw it. Draw the cork?',
  secretb: 'The lid will come away with a bar. Break the crate open?'
};
function portalAsk(key, beat, ms) {
  if (portal.open) return;
  if (portal.denyT[key] != null && env.t - portal.denyT[key] < 45) return;
  portal.open = true; portal.key = key; portal.beat = beat; portal.ms = ms;
  diag.portal = { open: true, key };
  const el = $('portal');
  el.querySelector('.po-q').textContent = PORTAL_Q[key] || 'Cross over?';
  el.hidden = false;
  requestAnimationFrame(() => {
    el.classList.add('shown');
    const y = document.getElementById('po-yes');
    if (y) y.focus();
  });
}
function portalAnswer(yes) {
  if (!portal.open) return;
  const key = portal.key, beat = portal.beat, ms = portal.ms;
  portal.open = false;
  const el = $('portal');
  el.classList.remove('shown');
  el.hidden = true;
  diag.portal = { open: false, key: null, last: key, answered: yes ? 'yes' : 'no' };
  if (yes) {
    reallyCross(key, beat, ms);
  } else {
    portal.denyT[key] = env.t;
    eggs.crossing = null;
    diag.crossing = null;
    captionNow('She stands off. The sea keeps what it keeps.', 3400);
  }
}
function portalKeydown(e) {
  if (!portal.open) return false;
  const k = e.key;
  if (k === 'Enter') {
    const no = document.activeElement && document.activeElement.id === 'po-no';
    portalAnswer(!no);
    e.preventDefault(); return true;
  }
  if (k === 'y' || k === 'Y') { portalAnswer(true); e.preventDefault(); return true; }
  if (k === 'n' || k === 'N' || k === 'Escape') { portalAnswer(false); e.preventDefault(); return true; }
  if (k === 'Tab') return true;      // the two buttons trade the focus natively
  e.preventDefault();
  return true;                       // the plate holds the keyboard
}

/* the landfall plate on deck: crisp DOM, never painted into the canvas */`);

/* ---------- crossTo asks first ---------- */
rep(
`/* the beat, then the crossing. Reduced motion crosses instantly. */
function crossTo(key, beat, ms) {
  if (eggs.crossing) return;
  eggs.crossing = key;
  diag.crossing = key;
  try { visit.save(); } catch (e) {}
  captionNow(beat, 30000);
  const go = () => { window.location.href = '../' + key + '/'; };
  if (REDUCED) { go(); return; }
  setTimeout(go, ms == null ? 1600 : ms);
}`,
`/* the portal law: every crossing asks first, in the fiction - YES or NO,
   mouse or Tab or Y/N or Enter/Escape. The beat plays only on YES. */
function crossTo(key, beat, ms) {
  if (eggs.crossing || portal.open) return;
  portalAsk(key, beat, ms);
}
function reallyCross(key, beat, ms) {
  if (eggs.crossing) return;
  eggs.crossing = key;
  diag.crossing = key;
  try { visit.save(); } catch (e) {}
  captionNow(beat, 30000);
  const go = () => { window.location.href = '../' + key + '/'; };
  if (REDUCED) { go(); return; }
  setTimeout(go, ms == null ? 1600 : ms);
}`);

/* ---------- keydown hooks ---------- */
rep(
`  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && typing(e)) {`,
`  window.addEventListener('keydown', e => {
    if (portalKeydown(e)) return;
    if (passage.on && !typing(e)) { endPassage(true); e.preventDefault(); return; }
    if (e.key === 'Escape' && typing(e)) {`);

/* ---------- portal buttons + chart tooltip / click law ---------- */
rep(
`  const cv = $('chart');
  cv.addEventListener('mousemove', e => {
    if (chart.gesturing) return;
    const m = chartPick(e.clientX, e.clientY);
    const isle = m ? m.isle : null;
    if (isle !== chart.hover) { chart.hover = isle; showChartInfo(isle); }
  });
  cv.addEventListener('mouseleave', () => { chart.hover = null; showChartInfo(null); });
  cv.addEventListener('click', e => {
    if (chart.panned) { chart.panned = false; return; }
    const m = chartPick(e.clientX, e.clientY);
    if (!m) return;
    if (e.detail > 1) return;   // the dblclick handler takes it
    setTimeout(() => {
      if (chart.dbl) { chart.dbl = false; return; }
      shapeCourse(m.isle);
    }, 210);
  });
  cv.addEventListener('dblclick', e => {
    const m = chartPick(e.clientX, e.clientY);
    chart.dbl = true;
    if (m) warpTo(m.isle.slug, 'packet');
  });`,
`  $('po-yes').addEventListener('click', () => portalAnswer(true));
  $('po-no').addEventListener('click', () => portalAnswer(false));

  const cv = $('chart');
  cv.addEventListener('mousemove', e => {
    if (chart.gesturing) { hideChartTip(); return; }
    const m = chartPick(e.clientX, e.clientY);
    if (m !== chart.hoverMark) {
      chart.hoverMark = m;
      chart.hover = m ? m.isle : null;
      if (m) fillChartTip(m); else hideChartTip();
      cv.classList.toggle('overmark', !!m);
    }
    if (m) placeChartTip(e.clientX, e.clientY);
  });
  cv.addEventListener('mouseleave', () => { chart.hover = null; chart.hoverMark = null; hideChartTip(); });
  cv.addEventListener('click', e => {
    if (chart.panned) { chart.panned = false; return; }
    const m = chartPick(e.clientX, e.clientY);
    if (!m) return;
    if (e.shiftKey) { hideChartTip(); shapeCourse(m.isle); return; }
    hideChartTip();
    passageTo(m.isle);
  });
  cv.addEventListener('dblclick', e => { e.preventDefault(); });

  /* keyboard hands get the same tooltip on the lettered names */
  const labHost = $('chartlabels');
  labHost.addEventListener('focusin', e => {
    const el2 = e.target.closest('[data-slug]');
    if (!el2) return;
    const isle = world.bySlug.get(el2.dataset.slug);
    if (!isle) return;
    let m = null;
    for (const mm of chart.marks) if (mm.isle === isle) { m = mm; break; }
    chart.hover = isle; chart.hoverMark = m;
    fillChartTip(m || { isle });
    const tip = $('charttip');
    const r = el2.getBoundingClientRect(), host = tip.parentElement.getBoundingClientRect();
    tip.style.left = Math.max(4, Math.min(r.right - host.left + 8, host.width - tip.offsetWidth - 8)) + 'px';
    tip.style.top = Math.max(4, Math.min(r.top - host.top - 4, host.height - tip.offsetHeight - 8)) + 'px';
  });
  labHost.addEventListener('focusout', () => { chart.hoverMark = null; hideChartTip(); });
  labHost.addEventListener('keydown', e => {
    const el2 = e.target.closest('[data-slug]');
    if (!el2) return;
    if (e.key === 'Enter' || e.key === ' ') {
      const isle = world.bySlug.get(el2.dataset.slug);
      if (isle) { hideChartTip(); if (e.shiftKey) shapeCourse(isle); else passageTo(isle); }
      e.preventDefault();
    }
  });`);

/* wheel + pan hide the tooltip so it never smears under a gesture */
rep(
`  cv.addEventListener('wheel', e => {
    if (ui.tab !== 'chart') return;
    e.preventDefault();`,
`  cv.addEventListener('wheel', e => {
    if (ui.tab !== 'chart') return;
    e.preventDefault();
    hideChartTip();
    chart.hoverMark = null;`);
rep(
"      if (cpan.moved > 5) { chart.panned = true; chart.gesturing = true; cv.classList.add('panning'); }",
"      if (cpan.moved > 5) { chart.panned = true; chart.gesturing = true; cv.classList.add('panning'); hideChartTip(); chart.hoverMark = null; }");

/* ---------- the tooltip builders, next to showChartInfo ---------- */
rep(
"function showChartInfo() {",
`/* THE TOOLTIP AT THE HAND (owner order): the name in the cartographic hand,
   the bearing and distance from the ship in period terms, and one honest
   datum line. It follows the hover and never sits under the cursor. */
function fillChartTip(m) {
  const tip = $('charttip');
  if (!tip) return;
  const isle = m.isle;
  const brg = bearingTo(isle), nm = distToNm(isle);
  const coord = compassPoint(brg) + ' \\u00b7 ' + (nm >= 9.95 ? String(Math.round(nm)) : nm.toFixed(1)) + ' nm';
  let kindLine;
  if (m.beast) kindLine = 'sea beast \\u00b7 her true water lies with her page';
  else if (isle.mark && isle.mark.kind === 'shoal') kindLine = 'shoal water \\u00b7 no route reaches her';
  else {
    const A = isle.prov >= 0 && chart.geo && chart.geo.PROV ? chart.geo.PROV[isle.prov] : null;
    kindLine = A ? 'of the ' + esc(A.name) + ' province' : 'off soundings';
  }
  tip.innerHTML =
    '<div class="ct-name">' + esc(isle.title) + '</div>' +
    '<div class="ct-kind">' + kindLine + '</div>' +
    '<div class="ct-coord"><b>' + coord + '</b> from the ship</div>' +
    '<div class="ct-datum">' + commas(isle.words) + ' words \\u00b7 ' +
      (isle.inbound ? isle.inbound + (isle.inbound === 1 ? ' citation in' : ' citations in') : 'no citation in') +
      (visit.charted.has(isle.slug) ? ' \\u00b7 read this visit' : '') + '</div>';
  tip.hidden = false;
}
function placeChartTip(cx, cy) {
  const tip = $('charttip');
  if (!tip || tip.hidden) return;
  const host = tip.parentElement.getBoundingClientRect();
  let x = cx - host.left + 16, y = cy - host.top + 18;
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  if (x + tw > host.width - 8) x = cx - host.left - tw - 16;
  if (y + th > host.height - 8) y = cy - host.top - th - 16;
  tip.style.left = x.toFixed(0) + 'px';
  tip.style.top = y.toFixed(0) + 'px';
}
function hideChartTip() {
  const tip = $('charttip');
  if (tip && !tip.hidden) tip.hidden = true;
  if (chart.cv) chart.cv.classList.remove('overmark');
}

function showChartInfo() {`);

/* ---------- labels become keyboard stations ---------- */
rep(
`  const put = (arr, cls, text, x, y, w, h, style) => {
    boxes.push({ x0: x - w / 2, x1: x + w / 2, y0: y - h / 2, y1: y + h / 2 });
    arr.push('<div class="' + cls + '" style="left:' + (dx + x * S).toFixed(1) + 'px;top:' +
      (dy + y * S).toFixed(1) + 'px;' + (style || '') + '">' + text + '</div>');
  };`,
`  const put = (arr, cls, text, x, y, w, h, style, attrs) => {
    boxes.push({ x0: x - w / 2, x1: x + w / 2, y0: y - h / 2, y1: y + h / 2 });
    arr.push('<div class="' + cls + '" ' + (attrs || '') + 'style="left:' + (dx + x * S).toFixed(1) + 'px;top:' +
      (dy + y * S).toFixed(1) + 'px;' + (style || '') + '">' + text + '</div>');
  };`);
rep(
`      put(geoHtml, 'cl-place' + (I.mark.kind === 'anchorage' ? ' chief' : ''), esc(t), px0 + ox, py0 + oy, w, h,
        'font-size:' + (fs * S).toFixed(2) + 'px');`,
`      put(geoHtml, 'cl-place' + (I.mark.kind === 'anchorage' ? ' chief' : ''), esc(t), px0 + ox, py0 + oy, w, h,
        'font-size:' + (fs * S).toFixed(2) + 'px',
        'tabindex="0" role="link" data-slug="' + esc(I.slug) + '" ');`);
rep(
`    geoHtml.push('<div class="cl-beast" style="left:' + (dx + bx * S).toFixed(1) + 'px;top:' +
      (dy + by * S).toFixed(1) + 'px;font-size:' + (fs * S).toFixed(2) + 'px;line-height:' +
      (lh * S).toFixed(2) + 'px">' + inner + '</div>');`,
`    geoHtml.push('<div class="cl-beast" tabindex="0" role="link" data-slug="' + esc(B.isle.slug) +
      '" style="left:' + (dx + bx * S).toFixed(1) + 'px;top:' +
      (dy + by * S).toFixed(1) + 'px;font-size:' + (fs * S).toFixed(2) + 'px;line-height:' +
      (lh * S).toFixed(2) + 'px">' + inner + '</div>');`);

/* ---------- boot: maiden bound ---------- */
rep(
`  placeShipAtDistance(parseFloat(params.get('dist')) || 2.7);`,
`  /* QUICK START FIRST (owner law): a cold load bears for the Quick Start
     Guide; a stated ?dist / ?open / ?below order, or a visit that has already
     charted her, stands as before. */
  const qsIsle = world.bySlug.get('/cms/quick-start');
  story.qs = qsIsle || null;
  story.maiden = !!qsIsle && !params.get('dist') && !params.get('open') && !params.get('below') &&
    !visit.charted.has(qsIsle.slug);
  placeShipAtDistance(parseFloat(params.get('dist')) || 2.7, story.maiden ? qsIsle : undefined);`);

/* ---------- frame hooks ---------- */
rep(
`  const sim = update(dt);
  render(sim);
  updateLandfallPlate(sim);
  trackTick(dt, sim);`,
`  const sim = update(dt);
  render(sim);
  updateLandfallPlate(sim);
  updateFirstBound();
  trackTick(dt, sim);`);
rep(
`    render(sim);
    updateLandfallPlate(sim);
    dirty = false;
  }
  setTimeout(becalmFrame, 120);`,
`    render(sim);
    updateLandfallPlate(sim);
    updateFirstBound();
    dirty = false;
  }
  setTimeout(becalmFrame, 120);`);

/* ---------- the log knows a passage ---------- */
rep(
"    courses: why === 'citation' ? 'followed a citation' : 'carried by the packet',",
"    courses: why === 'citation' ? 'followed a citation' : why === 'passage' ? 'made the passage under sail' : 'carried by the packet',");

/* ---------- helm hooks ---------- */
rep(
"  below(tab) { openBelow(tab || 'chart'); },",
`  below(tab) { openBelow(tab || 'chart'); },
  passage(slug) { const i = world.bySlug.get(slug); if (!i) return false; passageTo(i); return true; },
  passageState() { return { on: passage.on, closing: passage.closing, t: +passage.t.toFixed(2),
    dur: +passage.dur.toFixed(2), nm: +passage.nm.toFixed(2), isle: passage.isle ? passage.isle.slug : null }; },
  skipPassage() { endPassage(true); },
  portalState() { return { open: portal.open, key: portal.key, deny: Object.keys(portal.denyT) }; },
  answerPortal(y) { portalAnswer(!!y); },
  maiden() { return { maiden: story.maiden, qs: story.qs ? story.qs.slug : null,
    nm: story.qs ? +distToNm(story.qs).toFixed(2) : null }; },`);

fs.writeFileSync(F, src);
console.log(fails ? 'FAILED ' + fails : 'patched clean');
