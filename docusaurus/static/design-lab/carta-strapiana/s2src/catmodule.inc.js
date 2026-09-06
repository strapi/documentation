/* ---------------- IDEA 11: the ship cat, made SOMEONE (S3, owner order:
   "on peut faire quoi avec ?") ----------------
   She has a real engraved silhouette now - ears with their notches, a tail
   that speaks, authored postures - and a life: she walks the rail between
   stations, sits, stretches, turns an ear, blinks slow. Her data behaviour
   shows: she settles on the chart over the waters you visit most, sits by
   the log while you write, and stares toward monster waters before they
   raise. ONE interaction: petting - click her, or press P when she is near.
   She arches into it, a soft synthesized purr runs under the gain laws
   (never louder than the water), and the thank-you is a slow blink. Pet
   her enough times in a visit and she follows you to whichever station
   you open. Reduced motion: held poses, instant, purr intact. */
const cat = {
  deck: REDUCED ? 'sit' : 'below',   /* below | walk | sit | stretch | stare */
  u: REDUCED ? 0.55 : 0, side: 1,
  nextWalk: REDUCED ? 0 : 16 + (SEED % 14),
  stateT: 0, frame: 0, ft: 0,
  stareAt: null, beasts: null, home: null, seat: null,
  pets: 0, follows: false, archUntil: 0, blinkUntil: 0,
  chartFrame: 0, hit: null
};
const CAT_FOLLOW_AT = 3;
/* the pet timers run on the wall clock: env.t holds still below deck */
const catNow = () => performance.now() / 1000;
function catBeasts() {
  if (cat.beasts) return cat.beasts;
  /* the same three fiercest the chart raises, derived the same way */
  const un = world.uncited.slice();
  const byWords = un.slice().sort((a, b2) => b2.words - a.words);
  const byOut = un.slice().sort((a, b2) => b2.outbound - a.outbound);
  const f = [byWords[0]];
  if (byOut[0] && f.indexOf(byOut[0]) < 0) f.push(byOut[0]);
  for (const I of byWords) { if (f.length >= 3) break; if (f.indexOf(I) < 0) f.push(I); }
  cat.beasts = f.filter(Boolean);
  return cat.beasts;
}
function catDiag() {
  return { deck: cat.deck, u: +cat.u.toFixed(3), side: cat.side,
    stare: cat.stareAt && cat.stareAt.slug, home: cat.home, seat: cat.seat,
    pets: cat.pets, follows: cat.follows,
    arch: catNow() < cat.archUntil, beasts: catBeasts().map(b => b.slug) };
}
/* ---- the one interaction: petting ---- */
function petCat(where) {
  if (catNow() < cat.archUntil - 0.3) return;   /* she is already leaning in */
  cat.pets++;
  cat.archUntil = catNow() + 2.2;
  cat.blinkUntil = catNow() + 4.6;              /* the slow-blink thank-you */
  sound.purr();
  if (!cat.follows && cat.pets >= CAT_FOLLOW_AT) {
    cat.follows = true;
    captionNow('She has made up her mind: where you go on this ship, she goes.', 4600);
  } else if (cat.pets === 1) {
    captionNow('She arches into your hand, and a purr runs under the deck like rigging under load.', 4200);
  }
  diag.cat = catDiag();
  dirty = true;
  if (ui.mode === 'below' && ui.tab === 'chart') drawChartCat();
  drawDeskCat();
  if (REDUCED) {
    /* held poses, instant: the arch stands, then folds back on the beat */
    setTimeout(() => { dirty = true; if (ui.mode === 'below' && ui.tab === 'chart') drawChartCat(); drawDeskCat(); }, 2300);
  }
  return where || true;
}
function catTick(dt) {
  if (REDUCED) {
    /* becalmed: she sits the rail in a held pose; only the beasts move her eyes */
    let nb = null;
    for (const B of catBeasts()) {
      const d = distToNm(B);
      if (d < 8.8 && d > VIS_NM - 0.5) { nb = B; break; }
    }
    cat.deck = nb ? 'stare' : 'sit';
    cat.stareAt = nb;
    if (nb) { const brg = angDiff(bearingTo(nb), ship.bearing); cat.side = brg >= 0 ? 1 : -1; }
    return;
  }
  cat.ft += dt;
  if (cat.ft > 0.42) { cat.ft = 0; cat.frame = (cat.frame + 1) % 12; }
  cat.stateT += dt;
  /* monster waters near but not yet raised: she comes up to stare */
  let nearBeast = null;
  for (const B of catBeasts()) {
    const d = distToNm(B);
    if (d < 8.8 && d > VIS_NM - 0.5) { nearBeast = B; break; }
  }
  if (nearBeast) {
    if (cat.deck !== 'stare') { cat.deck = 'stare'; cat.stateT = 0; }
    cat.stareAt = nearBeast;
    const brg = angDiff(bearingTo(nearBeast), ship.bearing);
    cat.side = brg >= 0 ? 1 : -1;
    if (cat.u < 0.3 || cat.u > 0.85) cat.u = 0.62;
    return;
  }
  if (cat.deck === 'stare') { cat.deck = 'sit'; cat.stareAt = null; cat.stateT = 0; }
  switch (cat.deck) {
    case 'below':
      if (env.t > cat.nextWalk && ui.mode === 'deck' && !passage.on) {
        cat.deck = 'walk'; cat.stateT = 0;
        cat.u = 0.04; cat.side = (Math.floor(env.t) % 2) ? 1 : -1;
      }
      break;
    case 'walk':
      cat.u += dt / 26;                /* the rail walked in an unhurried half minute */
      if (cat.u >= 0.9) {
        /* the bow reached: she goes below awhile, sooner back if she is yours */
        cat.deck = 'below';
        cat.nextWalk = env.t + (cat.follows ? 8 : 40) + (SEED % 20);
      } else if (cat.stateT > 6 && cat.u > 0.25 && cat.u < 0.8 && (cat.frame % 12) === 7 && Math.random() < 0.30) {
        cat.deck = 'sit'; cat.stateT = 0;   /* she pauses at a station */
      }
      break;
    case 'sit':
      if (cat.stateT > 7 && Math.random() < dt * 0.10) { cat.deck = 'stretch'; cat.stateT = 0; }
      else if (cat.stateT > 14 && Math.random() < dt * 0.18) { cat.deck = 'walk'; cat.stateT = 0; }
      break;
    case 'stretch':
      if (cat.stateT > 2.4) { cat.deck = 'sit'; cat.stateT = 0; }
      break;
  }
}
/* ---- the engraved cat: authored postures, ears and tail that read ----
   Every pose faces +x and stands on y = 0; the ink is one silhouette with
   a paper rim so she never melts into the ground she sits on. */
function drawCatPose(g, pose, frame) {
  g.lineJoin = 'round'; g.lineCap = 'round';
  const ink = 'rgba(40,30,18,0.94)';
  const rim = 'rgba(244,236,216,0.50)';
  const eye = 'rgba(238,226,198,0.92)';
  g.fillStyle = ink;
  const earR = (cx, cy, a) => {          /* one ear: a notched triangle */
    g.save(); g.translate(cx, cy); g.rotate(a || 0);
    g.beginPath();
    g.moveTo(-2.0, 0.6); g.lineTo(-0.6, -4.6); g.lineTo(2.2, 0.2);
    g.closePath(); g.fill();
    g.restore();
  };
  if (pose === 'curl') {
    /* asleep in a ring, tail wrapped to her nose; f1 flicks the tail tip,
       f2 lifts the head a breath, ears up */
    g.strokeStyle = rim; g.lineWidth = 1.4;
    g.beginPath(); g.ellipse(0, 0, 13.5, 9.6, 0, 0, TAU); g.stroke();
    g.beginPath(); g.ellipse(0, 0, 13.5, 9.6, 0, 0, TAU); g.fill();
    g.fillStyle = PAPER;
    g.beginPath(); g.ellipse(1.5, 1.6, 6.2, 4.0, 0, 0, TAU); g.fill();
    g.fillStyle = ink;
    if (frame === 2) {
      g.beginPath(); g.ellipse(8.6, -8.4, 4.6, 4.0, -0.3, 0, TAU); g.fill();
      earR(6.4, -11.6, -0.35); earR(11.2, -11.9, 0.30);
    } else {
      g.beginPath(); g.ellipse(7.8, -3.4, 5.0, 4.2, -0.5, 0, TAU); g.fill();
      earR(5.4, -6.9, -0.45); earR(10.2, -7.6, 0.25);
    }
    g.strokeStyle = ink; g.lineWidth = 3.1;
    g.beginPath();
    g.moveTo(-12.5, 3.5);
    if (frame === 1) g.quadraticCurveTo(-17, 6, -16.5, -3.5);
    else g.quadraticCurveTo(-18, 7, -10, 8.6);
    g.stroke();
  } else if (pose === 'walk') {
    const step = frame % 2 ? 1 : -1;
    const glide = frame === 2;
    /* body low and long, head carried forward */
    g.strokeStyle = rim; g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(-11.5, -6.4);
    g.bezierCurveTo(-9, -11.2, 3, -11.8, 8.5, -8.6);
    g.bezierCurveTo(9.6, -10.6, 10.6, -12.2, 12.2, -13.4);
    g.lineTo(11.6, -4.8);
    g.lineTo(-10.4, -4.8);
    g.closePath(); g.stroke(); g.fill();
    /* the head, a clear wedge with both ears notched against the sky */
    g.beginPath(); g.ellipse(13.2, -12.6, 4.2, 3.7, -0.18, 0, TAU); g.fill();
    earR(11.4, -15.5, -0.42); earR(15.6, -15.4, 0.34);
    /* the eye, a cream slit riding the head */
    if (!glide) { g.fillStyle = eye; g.fillRect(14.2, -13.4, 1.9, 0.9); g.fillStyle = ink; }
    /* four legs: two strides and a gathered glide */
    g.strokeStyle = ink; g.lineWidth = 2.0;
    g.beginPath();
    if (glide) {
      g.moveTo(9.4, -5); g.lineTo(9.8, 0.2);
      g.moveTo(6.4, -5); g.lineTo(6.0, 0.2);
      g.moveTo(-4.4, -5); g.lineTo(-4.0, 0.2);
      g.moveTo(-8.0, -5); g.lineTo(-8.4, 0.2);
    } else {
      g.moveTo(9.6, -5); g.lineTo(10.6 + step * 2.4, 0.2);
      g.moveTo(6.2, -5); g.lineTo(5.2 - step * 2.4, 0.2);
      g.moveTo(-4.2, -5); g.lineTo(-3.2 + step * 2.2, 0.2);
      g.moveTo(-8.2, -5); g.lineTo(-9.2 - step * 2.2, 0.2);
    }
    g.stroke();
    /* the tail rides high, swaying with the step */
    g.lineWidth = 2.6;
    g.beginPath();
    g.moveTo(-11.4, -7);
    g.quadraticCurveTo(-16.5 - step * 1.6, -13.5, -14.5 + step * 1.8, -20);
    g.stroke();
  } else if (pose === 'arch') {
    /* the pet answered: feet planted, back arched high, tail a hook.
       f1 leans deeper into the hand. */
    const deep = frame % 2 ? 2.2 : 0;
    g.strokeStyle = rim; g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(-7.6, -4.4);
    g.bezierCurveTo(-6.5, -13 - deep, 2.5, -16.5 - deep, 6.2, -11.5);
    g.bezierCurveTo(7.6, -9.6, 8.4, -8.2, 8.8, -6.6);
    g.lineTo(8.2, -4.2);
    g.closePath(); g.stroke(); g.fill();
    /* the head lowered into the stroke, ears eased back */
    g.beginPath(); g.ellipse(8.8, -8.0, 3.9, 3.4, 0.22, 0, TAU); g.fill();
    earR(7.0, -10.6, -0.85); earR(11.0, -10.2, 0.75);
    /* the slow blink lives here: her eye is shut while she arches */
    g.strokeStyle = ink; g.lineWidth = 2.0;
    g.beginPath();
    g.moveTo(-6.4, -4.6); g.lineTo(-6.6, 0.2);
    g.moveTo(-3.8, -4.6); g.lineTo(-3.6, 0.2);
    g.moveTo(5.6, -4.6); g.lineTo(5.4, 0.2);
    g.moveTo(7.8, -4.6); g.lineTo(8.0, 0.2);
    g.stroke();
    g.lineWidth = 2.7;
    g.beginPath();
    g.moveTo(-7.5, -5.5);
    g.quadraticCurveTo(-12.5, -12, -10.5, -19 - deep);
    g.stroke();
  } else if (pose === 'stretch') {
    /* the long bow: forepaws thrown out, rump high, tail up */
    const deep = frame % 2 ? 1.4 : 0;
    g.strokeStyle = rim; g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(12.8, -1.2);
    g.bezierCurveTo(8, -4.8, 4.5, -5.6, 1.5, -6.4);
    g.bezierCurveTo(-2.5, -7.6, -6.5, -11.8 - deep, -8.5, -11.6 - deep);
    g.lineTo(-9.6, -4.2);
    g.lineTo(-4.5, 0);
    g.lineTo(11.8, 0);
    g.closePath(); g.stroke(); g.fill();
    /* head low along the outstretched forelegs */
    g.beginPath(); g.ellipse(9.8, -4.4, 3.7, 3.2, 0.3, 0, TAU); g.fill();
    earR(8.2, -7.0, -0.5); earR(12.0, -6.6, 0.45);
    g.strokeStyle = ink; g.lineWidth = 2.0;
    g.beginPath();
    g.moveTo(-7.4, -4.6); g.lineTo(-7.8, 0.2);
    g.moveTo(-5.2, -4.6); g.lineTo(-5.0, 0.2);
    g.stroke();
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(-8.8, -11 - deep);
    g.quadraticCurveTo(-11.5, -16 - deep, -14.5, -17.5 - deep);
    g.stroke();
  } else {
    /* sit (and stare): upright, tail wrapped over the forepaws.
       frames - 0 settled; 1 an ear turns; 2 the slow blink; 3 the tail
       tip lifts. 'stare' carries her head higher, out to the sea. */
    const stare = pose === 'stare';
    const blink = frame === 2;
    const earTurn = frame === 1;
    const flick = frame === 3;
    const hx = stare ? 7.0 : 6.2, hy = stare ? -19.6 : -17.6;
    g.strokeStyle = rim; g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(-9.8, 0);
    g.bezierCurveTo(-11.5, -7.5, -8.5, -12.5, -4.5, -13.6);
    g.bezierCurveTo(-1.5, -14.4, 1.8, -14.2, 3.6, -12.8);
    g.lineTo(hx - 1.4, hy + 3.6);
    g.lineTo(hx + 3.4, hy + 4.4);
    g.bezierCurveTo(6.8, -7.5, 7.2, -3.4, 6.8, 0);
    g.closePath(); g.stroke(); g.fill();
    /* the head, carried on a real neck */
    g.beginPath(); g.ellipse(hx, hy, 4.5, 4.0, -0.12, 0, TAU); g.fill();
    earR(hx - 2.2, hy - 3.0, earTurn ? -1.15 : -0.40);
    earR(hx + 2.6, hy - 2.9, 0.32);
    /* the eye: a cream slit, gone in the slow blink */
    if (!blink) {
      g.fillStyle = eye;
      g.fillRect(hx + 1.2, hy - 0.8, stare ? 2.4 : 2.0, 1.0);
      g.fillStyle = ink;
    }
    /* forelegs, straight and prim */
    g.strokeStyle = ink; g.lineWidth = 2.1;
    g.beginPath();
    g.moveTo(3.4, -6.5); g.lineTo(3.6, 0);
    g.moveTo(5.6, -6.0); g.lineTo(5.8, 0);
    g.stroke();
    /* the tail, wrapped round to the forepaws; the flick lifts her tip */
    g.lineWidth = 2.8;
    g.beginPath();
    g.moveTo(-9.6, -1.5);
    if (flick) g.quadraticCurveTo(-13.5, 2.5, -14.5, -4.5);
    else g.quadraticCurveTo(-12, 3.5, 1.5, 2.6);
    g.stroke();
  }
}
/* which pose the moment asks of her, wherever she is drawn */
function catPoseNow(base) {
  if (catNow() < cat.archUntil) return 'arch';
  if (catNow() < cat.blinkUntil && (base === 'sit' || base === 'stare' || base === 'curl')) return base + ':blink';
  return base;
}
function catFrameFor(pose) {
  if (REDUCED) return 0;
  const raw = ui.mode === 'deck' ? cat.frame : cat.chartFrame;
  if (pose === 'walk') return raw % 3;
  if (pose === 'arch' || pose === 'stretch') return raw % 2;
  /* sitting: mostly settled, an ear turn or a tail flick now and then,
     the slow blink on its own long beat */
  const f = raw % 12;
  return f === 4 ? 1 : f === 9 ? 3 : f === 6 ? 2 : 0;
}
function drawCatAt(g, base) {
  let pose = catPoseNow(base), frame;
  if (pose.endsWith(':blink')) { pose = pose.slice(0, -6); frame = 2; }
  else frame = catFrameFor(pose);
  drawCatPose(g, pose, frame);
}
function drawDeckCat(g, t, sim) {
  if (cat.deck === 'below' || ui.mode !== 'deck') { cat.hit = null; return; }
  const [rx, ry] = railPoint(cat.side, cat.u);
  g.save();
  g.translate(rx, ry - 2);
  const away = 0.62 + 0.38 * cat.u;            /* smaller toward the bow */
  const s = 2.6 * away;
  /* she faces the bow when walking, the open sea when she sits or stares */
  g.scale(cat.side > 0 ? -s : s, s);
  const base = cat.deck === 'walk' ? 'walk' : cat.deck === 'stretch' ? 'stretch'
    : cat.deck === 'stare' ? 'stare' : 'sit';
  drawCatAt(g, base);
  g.restore();
  cat.hit = { x: rx, y: ry - 2 - 12 * s, r: 24 * s + 12 };
  void t; void sim;
}
/* ---- the chart-table cat: she settles over the waters you visit most ---- */
function catHomeIsle() {
  const counts = new Map();
  for (const r of visit.log) if (r.slug) counts.set(r.slug, (counts.get(r.slug) || 0) + 1);
  let best = null, bn = 0;
  for (const [s2, n2] of counts) if (n2 > bn) { bn = n2; best = s2; }
  return best ? world.bySlug.get(best) : (ship.bound || world.island);
}
function drawChartCat() {
  const el = $('chartcat');
  if (!el) return;
  const g = el.getContext('2d');
  g.setTransform(2.3, 0, 0, 2.3, 0, 0);
  g.clearRect(0, 0, 64, 50);
  g.save();
  g.translate(32, 30);
  /* her small shadow on the vellum */
  g.fillStyle = 'rgba(38,28,17,0.14)';
  g.beginPath(); g.ellipse(0.5, 7.5, 15, 4.4, 0, 0, TAU); g.fill();
  drawCatAt(g, 'curl');
  g.restore();
}
function placeChartCat() {
  const el = $('chartcat');
  if (!el || !chart.layoutView) return;
  const I = catHomeIsle();
  cat.home = I ? I.slug : null;
  if (!I) { el.style.display = 'none'; return; }
  const L = chart.layoutView;
  const p = chartProject(I.pos.x, I.pos.y);
  const x = clamp((p[0] * L.z + L.tx) * L.S + L.dx + 26 * L.S, 60, 1400 * L.S + L.dx - 60);
  const y = clamp((p[1] * L.z + L.ty) * L.S + L.dy - 20 * L.S, 46, 810 * L.S + L.dy - 40);
  el.style.display = 'block';
  el.style.left = x.toFixed(1) + 'px';
  el.style.top = y.toFixed(1) + 'px';
  drawChartCat();
  diag.chartCat = { near: cat.home, x: Math.round(x), y: Math.round(y) };
}
/* ---- the desk cat: by the log while you write, and at your side at every
   station once she has adopted you ---- */
function catSeatSync() {
  const el = $('deskcat');
  if (!el) return;
  const bp = $('bottleplate');
  const writing = bp && !bp.hidden;
  let seat = null, x = 0, y = 0, face = -1;
  if (writing) {
    const r = document.querySelector('#bottleplate .bp-plate').getBoundingClientRect();
    seat = 'bottle'; x = r.right - 66; y = r.top - 54; face = 1;
  } else if (ui.mode === 'below' && ui.tab === 'log') {
    const r = $('pane-log').getBoundingClientRect();
    seat = 'log'; x = r.right - 132; y = r.bottom - 66;
  } else if (cat.follows && ui.mode === 'below' && ui.tab !== 'chart') {
    const r = $('below').getBoundingClientRect();
    seat = 'station'; x = r.right - 128; y = r.bottom - 66;
  } else if (cat.follows && ui.mode === 'anchor') {
    const r = $('anchorage').getBoundingClientRect();
    seat = 'reading'; x = r.right - 120; y = r.bottom - 64;
  }
  if (!seat) {
    if (cat.seat) { cat.seat = null; el.style.display = 'none'; diag.cat = catDiag(); }
    return;
  }
  cat.seat = seat;
  el.style.display = 'block';
  el.style.left = x.toFixed(0) + 'px';
  el.style.top = y.toFixed(0) + 'px';
  el.style.zIndex = writing ? 70 : 30;
  cat.deskFace = face;
  drawDeskCat();
  diag.cat = catDiag();
}
function drawDeskCat() {
  const el = $('deskcat');
  if (!el || el.style.display === 'none' || !cat.seat) return;
  const g = el.getContext('2d');
  g.setTransform(2.3, 0, 0, 2.3, 0, 0);
  g.clearRect(0, 0, 52, 40);
  g.save();
  g.translate(26, 36);
  g.fillStyle = 'rgba(38,28,17,0.12)';
  g.beginPath(); g.ellipse(0, 1.5, 14, 3.6, 0, 0, TAU); g.fill();
  if ((cat.deskFace || -1) > 0) g.scale(-1, 1);
  drawCatAt(g, cat.seat === 'reading' ? 'curl' : 'sit');
  g.restore();
}
function chartCatBeat() {
  /* her long idle beat: the ear, the tail, the rare slow blink */
  if (!REDUCED) {
    cat.chartFrame = (cat.chartFrame + 1) % 12;
    if (ui.mode === 'below' && ui.tab === 'chart') drawChartCat();
    if (cat.seat) drawDeskCat();
  }
  catSeatSync();
}
