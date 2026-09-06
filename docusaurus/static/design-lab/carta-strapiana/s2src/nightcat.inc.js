/* ============================================================
   STAGE 2, IDEAS 8 + 9 + 10 + 11 - THE LOG ILLUSTRATED, THE FIGUREHEAD,
   THE NIGHT PASSAGE, AND THE SHIP CAT
   THE ILLUSTRATED LOG (8): each first landfall engraves a small sketch
   of that island - drawn from her true baked geometry, the same plates
   the horizon shows - beside the entry; the whole log exports as a
   high-resolution PNG journal in the engraved hand.
   THE FIGUREHEAD SPEAKS (9): rarely, crossing new waters, she offers the
   true first sentence of that page on a banderole; never during reading,
   never twice for the same waters in a visit.
   NIGHT PASSAGE (10): at dusk the heavily cited capes burn lighthouses
   (one per twelve citations, the rule in the key), the citation
   constellation of the current waters hangs overhead, and a star can be
   steered by: click one and the course is laid.
   THE SHIP CAT (11): she naps on the chart table near the waters you
   visit most, walks the rail now and then, and stares toward monster
   waters before they raise. She never blocks a hand; reduced motion
   keeps her asleep.
   ============================================================ */

/* ---------------- IDEA 8: the illustrated log ---------------- */
function drawLogSketch(cv2) {
  const I = world.bySlug.get(cv2.dataset.slug);
  if (!I) return;
  const sp = getSprite(I, 1, true);
  if (!sp) return;
  const g = cv2.getContext('2d');
  const w2 = cv2.width, h2 = cv2.height;
  g.clearRect(0, 0, w2, h2);
  /* the vignette: her true plate, small, over a stroke of sea */
  const asp = sp.c.width / sp.c.height;
  let dw = w2 - 14, dh = dw / asp;
  if (dh > h2 - 18) { dh = h2 - 18; dw = dh * asp; }
  const dx2 = (w2 - dw) / 2, dy2 = h2 - 12 - dh;
  g.imageSmoothingEnabled = true;
  try { g.imageSmoothingQuality = 'high'; } catch (e) { /* older glass */ }
  g.drawImage(sp.c, dx2, dy2, dw, dh);
  /* the waterline and a few sea dashes, in the sketching hand */
  g.strokeStyle = 'rgba(58,44,28,0.75)';
  g.lineWidth = 0.9;
  g.beginPath();
  g.moveTo(6, h2 - 11); g.lineTo(w2 - 6, h2 - 11);
  g.stroke();
  g.lineWidth = 0.6;
  g.strokeStyle = 'rgba(58,44,28,0.45)';
  g.beginPath();
  const rnd = rngFor('sketchsea:' + I.slug);
  for (let i = 0; i < 5; i++) {
    const x = 8 + rnd() * (w2 - 30), y = h2 - 8 + rnd() * 4;
    g.moveTo(x, y); g.lineTo(x + 7 + rnd() * 9, y);
  }
  g.stroke();
}
function wireLogSketches(p) {
  p.querySelectorAll('canvas.lg-sk').forEach(drawLogSketch);
  const ex = p.querySelector('#logexport');
  if (ex) ex.addEventListener('click', () => exportJournal(true));
}
/* the journal, engraved at high resolution and handed to the visitor */
function exportJournal(download) {
  const X = 2.5, JW = 1080;
  const rows = visit.log;
  const firstIdx = new Set();
  {
    const seen2 = new Set();
    rows.forEach((r, i) => {
      if (!r.mark && r.slug && !seen2.has(r.slug)) { seen2.add(r.slug); firstIdx.add(i); }
    });
  }
  let JH = 236;
  rows.forEach((r, i) => { JH += r.mark ? 46 : (firstIdx.has(i) ? 108 : 64); });
  JH += 90;
  const c = document.createElement('canvas');
  c.width = Math.round(JW * X); c.height = Math.round(JH * X);
  const g = c.getContext('2d');
  g.scale(X, X);
  /* the paper */
  g.fillStyle = PAPER;
  g.fillRect(0, 0, JW, JH);
  const rndP = rngFor('journalpaper');
  g.fillStyle = 'rgba(120,96,58,0.05)';
  for (let i = 0; i < 260; i++) {
    g.fillRect(rndP() * JW, rndP() * JH, 1.5 + rndP() * 3, 0.8 + rndP() * 1.6);
  }
  g.strokeStyle = INK + '0.6)'; g.lineWidth = 1.4;
  g.strokeRect(18, 18, JW - 36, JH - 36);
  g.strokeStyle = INK + '0.3)'; g.lineWidth = 0.7;
  g.strokeRect(24, 24, JW - 48, JH - 48);
  const SER = '"Iowan Old Style", Palatino, Georgia, serif';
  g.fillStyle = INK + '0.92)';
  g.textAlign = 'center';
  g.font = '600 30px ' + SER;
  g.fillText('T H E   C A P T A I N ’ S   L O G', JW / 2, 76);
  g.font = 'italic 15px ' + SER;
  g.fillStyle = INK + '0.7)';
  g.fillText('Carta Strapiana · a chart of the Strapi documentation, sailed', JW / 2, 102);
  g.fillText(new Date().toDateString() + ' · ' + rows.length +
    (rows.length === 1 ? ' entry' : ' entries') + ', kept noon to noon' +
    (visit.hand ? ' · the watch signed: ' + visit.hand : ''), JW / 2, 124);
  g.strokeStyle = RED + '0.6)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(JW / 2 - 120, 140); g.lineTo(JW / 2 + 120, 140); g.stroke();
  /* the entries */
  let y = 176;
  g.textAlign = 'left';
  const wrap = (txt, x, yy, wmax, lh, font, col) => {
    g.font = font; g.fillStyle = col;
    const words = String(txt).split(/\s+/);
    let line = '', n2 = 0;
    for (const w3 of words) {
      const t2 = line ? line + ' ' + w3 : w3;
      if (g.measureText(t2).width > wmax && line) {
        g.fillText(line, x, yy + n2 * lh); n2++; line = w3;
      } else line = t2;
    }
    if (line) { g.fillText(line, x, yy + n2 * lh); n2++; }
    return n2 * lh;
  };
  rows.forEach((r, i) => {
    g.fillStyle = INK + '0.85)';
    g.font = '600 13px ' + SER;
    g.fillText('H ' + r.h, 44, y);
    if (r.mark) {
      wrap(r.text, 92, y, JW - 160, 17, 'italic 14px ' + SER, INK + '0.85)');
      if (r.remark) wrap('“' + r.remark + '”', 112, y + 20, JW - 200, 16, 'italic 13px ' + SER, RED + '0.8)');
      y += 46;
    } else {
      const isFirst = firstIdx.has(i);
      wrap('Made ' + r.title + ' · ' + commas(r.f) + ' fathoms · ' + r.courses + ' · ' + r.winds,
        92, y, JW - (isFirst ? 300 : 160), 17, '14px ' + SER, INK + '0.88)');
      if (r.remark) wrap('“' + r.remark + '”', 112, y + 36, JW - 300, 16, 'italic 13px ' + SER, RED + '0.8)');
      if (isFirst) {
        /* the first landfall carries her engraved sketch */
        const I2 = world.bySlug.get(r.slug);
        const sp = I2 ? getSprite(I2, 1, true) : null;
        if (sp) {
          const bw = 168, bh = 86, bx = JW - 92 - bw, by = y - 14;
          g.strokeStyle = INK + '0.4)'; g.lineWidth = 0.8;
          g.strokeRect(bx, by, bw, bh);
          const asp = sp.c.width / sp.c.height;
          let dw = bw - 16, dh = dw / asp;
          if (dh > bh - 20) { dh = bh - 20; dw = dh * asp; }
          g.drawImage(sp.c, bx + (bw - dw) / 2, by + bh - 12 - dh, dw, dh);
          g.strokeStyle = 'rgba(58,44,28,0.7)'; g.lineWidth = 0.8;
          g.beginPath(); g.moveTo(bx + 8, by + bh - 10); g.lineTo(bx + bw - 8, by + bh - 10); g.stroke();
          g.font = 'italic 10px ' + SER;
          g.fillStyle = INK + '0.6)';
          g.textAlign = 'center';
          g.fillText('first landfall', bx + bw / 2, by + bh + 12);
          g.textAlign = 'left';
        }
        y += 108;
      } else y += 64;
    }
  });
  g.font = 'italic 12px ' + SER;
  g.fillStyle = INK + '0.55)';
  g.textAlign = 'center';
  g.fillText('every figure in this journal is the corpus’s own · nothing is scored', JW / 2, JH - 40);
  diag.journal = { w: c.width, h: c.height, entries: rows.length, sketches: firstIdx.size };
  const url = c.toDataURL('image/png');
  if (download) {
    const a = document.createElement('a');
    a.download = 'carta-strapiana-log.png';
    a.href = url;
    a.click();
  }
  return url;
}

/* ---------------- IDEA 9: the figurehead speaks ---------------- */
const fh = { spoken: new Set(store.get('spoken', [])), lastAt: -1e9, upTil: 0 };
function firstSentenceOf(I) {
  const pg = world.content.pages[I.slug];
  if (!pg || !pg.blocks) return '';
  let fall = '';
  for (const b of pg.blocks) {
    if (b.t !== 'p' && b.t !== 'tldr') continue;
    const txt = String(b.html || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ').replace(/&#39;/g, '’').replace(/&quot;/g, '"')
      .replace(/\*/g, '')
      .replace(/\s+/g, ' ').trim();
    if (txt.length < 12) continue;
    if (b.t === 'tldr') { if (!fall) fall = txt; continue; }
    const m2 = txt.match(/^.{12,220}?[.!?](?=\s|$)/);
    return (m2 ? m2[0] : txt.slice(0, 200)).trim();
  }
  const m3 = fall.match(/^.{12,220}?[.!?](?=\s|$)/);
  return fall ? (m3 ? m3[0] : fall.slice(0, 200)).trim() : '';
}
function fhTick() {
  const el = $('figurehead');
  if (!el) return;
  if (fh.upTil && env.t > fh.upTil) { el.classList.remove('shown'); fh.upTil = 0; }
  if (ui.mode !== 'deck' || passage.on || lens.t > 0.15 || portal.open) return;
  if (env.t < 14 || env.t - fh.lastAt < 75) return;
  const I = ship.bound;
  if (!I || ship.anchored) return;
  const d = distToNm(I);
  if (d > 2.3) return;
  if (visit.charted.has(I.slug) || fh.spoken.has(I.slug)) return;
  const line = firstSentenceOf(I);
  if (!line) { fh.spoken.add(I.slug); return; }
  fh.spoken.add(I.slug);
  store.set('spoken', [...fh.spoken].slice(-80));
  fh.lastAt = env.t;
  fh.upTil = env.t + 7.5;
  el.querySelector('.fh-line').textContent = '“' + line + '”';
  el.querySelector('.fh-who').textContent = 'the figurehead speaks · her page’s own first words';
  el.classList.add('shown');
  diag.fhSpoke = I.slug;
}

/* ---------------- IDEA 10: the night passage ---------------- */
/* lighthouses: one per twelve citations, burning from any distance at dusk */
function drawLighthouses(isle, cxScreen, yBase, wpx, s, dist, stage) {
  const mix = env.hourMix;
  if (mix < 0.5 || (isle.inbound || 0) < 12) return;
  const nL = Math.min(4, Math.floor(isle.inbound / 12));
  const F = formOf(isle);
  const rnd = rngFor('lighthouse:' + isle.slug);
  const left = cxScreen - wpx / 2;
  const a = clamp((6.4 - dist) / 3.4, 0, 1) * clamp((mix - 0.5) / 0.5, 0, 1);
  if (a <= 0.02) return;
  for (let i = 0; i < nL; i++) {
    const fx = F.x0 + (0.14 + 0.72 * (i + 0.5) / nL + (rnd() - 0.5) * 0.08) * (F.x1 - F.x0);
    const ex = left + (fx - F.x0) / (F.x1 - F.x0) * wpx;
    const ey = yBase - (F.BASE - F.elev(fx)) * s - 2;
    const th = clamp(26 * s * 46, 5, 15);           /* tower height on screen */
    ctx.save();
    ctx.globalAlpha = a;
    /* the tower, a dark daymark */
    ctx.fillStyle = 'rgba(40,30,18,0.85)';
    ctx.beginPath();
    ctx.moveTo(ex - th * 0.16, ey);
    ctx.lineTo(ex - th * 0.10, ey - th);
    ctx.lineTo(ex + th * 0.10, ey - th);
    ctx.lineTo(ex + th * 0.16, ey);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(ex - th * 0.16, ey - th - th * 0.14, th * 0.32, th * 0.14);
    /* the lamp and her slow beam */
    const ly = ey - th - th * 0.07;
    ctx.fillStyle = 'rgba(246,214,140,0.95)';
    ctx.beginPath(); ctx.arc(ex, ly, Math.max(1.2, th * 0.10), 0, TAU); ctx.fill();
    const sweep = REDUCED ? (i * 1.1) : env.t * 0.5 + i * 2.1;
    const bl = th * 3.2;
    for (const dir of [-1, 1]) {
      const angB = Math.PI + Math.sin(sweep) * 0.5 + (dir > 0 ? 0 : Math.PI);
      ctx.globalAlpha = a * 0.16;
      ctx.fillStyle = 'rgba(246,222,160,0.9)';
      ctx.beginPath();
      ctx.moveTo(ex, ly);
      ctx.lineTo(ex + Math.cos(angB - 0.05) * bl, ly + Math.sin(angB - 0.05) * bl * 0.22);
      ctx.lineTo(ex + Math.cos(angB + 0.05) * bl, ly + Math.sin(angB + 0.05) * bl * 0.22);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
/* the constellation of the current waters, hung overhead and steerable */
const nightSky = { for: '', stars: [], hits: [], hover: -1 };
function buildConstellation() {
  const I = ship.bound || world.island;
  if (!I || nightSky.for === I.slug) return;
  nightSky.for = I.slug;
  nightSky.stars = [];
  const rel = new Map();
  for (const [a, b2] of world.graph.edges) {
    if (b2 === I.slug) rel.set(a, (rel.get(a) || 0) + 1);
    if (a === I.slug) rel.set(b2, (rel.get(b2) || 0) + 1);
  }
  const list = [...rel.keys()].map(s2 => world.bySlug.get(s2)).filter(Boolean)
    .sort((x, y3) => (y3.inbound || 0) - (x.inbound || 0)).slice(0, 12);
  if (!list.length) return;
  let mx = 0.001;
  for (const T of list) {
    mx = Math.max(mx, Math.abs(T.pos.x - I.pos.x), Math.abs(T.pos.y - I.pos.y));
  }
  const rnd = rngFor('sky:' + I.slug);
  const kx = 480 / mx, ky = 132 / mx;
  for (const T of list) {
    nightSky.stars.push({
      isle: T,
      x: clamp(720 + (T.pos.x - I.pos.x) * kx + (rnd() - 0.5) * 26, 96, W - 96),
      y: clamp(128 + (T.pos.y - I.pos.y) * ky + (rnd() - 0.5) * 20, 44, HORIZON - 128),
      r: 2.1 + Math.min(2.4, (T.inbound || 0) * 0.05),
      ph: rnd() * TAU
    });
  }
  diag.constellation = { of: I.slug, stars: nightSky.stars.length };
}
function drawConstellation(map) {
  const mix = env.hourMix;
  nightSky.hits = [];
  if (mix < 0.55 || ui.mode !== 'deck') return;
  buildConstellation();
  if (!nightSky.stars.length) return;
  const a0 = (mix - 0.55) / 0.45;
  const k = map ? map.k : 1, ox = map ? map.ox : 0, oy = map ? map.oy : 0;
  const zx = 720 * k + ox, zy = 74 * k + oy;
  ctx.save();
  /* the figure: faint rhumbs from the zenith - the current waters - to her kin */
  ctx.strokeStyle = 'rgba(246,238,218,0.8)';
  ctx.lineWidth = 0.55 * k;
  ctx.globalAlpha = a0 * 0.16;
  ctx.beginPath();
  for (const s2 of nightSky.stars) {
    ctx.moveTo(zx, zy);
    ctx.lineTo(s2.x * k + ox, s2.y * k + oy);
  }
  ctx.stroke();
  /* the zenith star: the waters herself */
  ctx.globalAlpha = a0 * 0.95;
  ctx.fillStyle = 'rgba(246,238,218,1)';
  const drawStar4 = (x, y, r) => {
    ctx.beginPath();
    ctx.moveTo(x, y - r * 2.1);
    ctx.quadraticCurveTo(x + r * 0.35, y - r * 0.35, x + r * 2.1, y);
    ctx.quadraticCurveTo(x + r * 0.35, y + r * 0.35, x, y + r * 2.1);
    ctx.quadraticCurveTo(x - r * 0.35, y + r * 0.35, x - r * 2.1, y);
    ctx.quadraticCurveTo(x - r * 0.35, y - r * 0.35, x, y - r * 2.1);
    ctx.closePath();
    ctx.fill();
  };
  drawStar4(zx, zy, 2.6 * k);
  for (let i2 = 0; i2 < nightSky.stars.length; i2++) {
    const s2 = nightSky.stars[i2];
    const tw = REDUCED ? 0.8 : 0.62 + 0.38 * Math.sin(env.t * 1.4 + s2.ph);
    const x = s2.x * k + ox, y = s2.y * k + oy;
    ctx.globalAlpha = a0 * tw;
    drawStar4(x, y, s2.r * k * (nightSky.hover === i2 ? 1.5 : 1));
    nightSky.hits.push({ i: i2, x: s2.x, y: s2.y, r: 14 });
    if (nightSky.hover === i2) {
      ctx.globalAlpha = a0;
      ctx.font = 'italic ' + (12.5 * k).toFixed(1) + 'px "Iowan Old Style", Palatino, Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(s2.isle.title, x, y + 22 * k);
      ctx.font = 'italic ' + (10.5 * k).toFixed(1) + 'px "Iowan Old Style", Palatino, Georgia, serif';
      ctx.globalAlpha = a0 * 0.75;
      ctx.fillText('click to lay a course · ' + compassPoint(bearingTo(s2.isle)) + ' · ' +
        (Math.round(distToNm(s2.isle) * 10) / 10) + ' nm', x, y + (22 + 15) * k);
      ctx.textAlign = 'left';
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}
function starPick(mx, my) {
  if (env.hourMix < 0.55 || !nightSky.hits.length) return null;
  for (const hh of nightSky.hits) {
    if (Math.hypot(mx - hh.x, my - hh.y) < hh.r) return hh;
  }
  return null;
}
function steerByStar(hit) {
  const s2 = nightSky.stars[hit.i];
  if (!s2) return;
  const I = s2.isle;
  setBound(I, true);
  const delta = angDiff(bearingTo(I), effectiveOrder(env.t));
  giveOrder(delta);
  captionNow('A course laid by her star: ' + I.title + ', ' + compassPoint(bearingTo(I)) + ', ' +
    (Math.round(distToNm(I) * 10) / 10) + ' nm.', 5200);
  diag.steeredByStar = I.slug;
}

/* ---------------- IDEA 11: the ship cat ---------------- */
const cat = {
  deck: 'below',        /* below | walk | stare */
  u: 0, side: 1, nextWalk: 70 + (SEED % 40), frame: 0, ft: 0,
  stareAt: null, beasts: null, chartEl: null, chartFrame: 0, chartTimer: 0,
  home: null
};
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
function catTick(dt) {
  if (REDUCED) return;                 /* reduced motion keeps her asleep below */
  cat.ft += dt;
  if (cat.ft > 0.42) { cat.ft = 0; cat.frame = (cat.frame + 1) % 3; }
  /* monster waters near but not yet raised: she comes up to stare */
  let nearBeast = null;
  for (const B of catBeasts()) {
    const d = distToNm(B);
    if (d < 8.8 && d > VIS_NM - 0.5) { nearBeast = B; break; }
  }
  if (nearBeast) {
    cat.deck = 'stare';
    cat.stareAt = nearBeast;
    const brg = angDiff(bearingTo(nearBeast), ship.bearing);
    cat.side = brg >= 0 ? 1 : -1;
    cat.u = 0.62;
    return;
  }
  if (cat.deck === 'stare') { cat.deck = 'below'; cat.stareAt = null; cat.nextWalk = env.t + 24; }
  if (cat.deck === 'below' && env.t > cat.nextWalk && ui.mode === 'deck' && !passage.on) {
    cat.deck = 'walk';
    cat.u = 0.04;
    cat.side = (Math.floor(env.t) % 2) ? 1 : -1;
  }
  if (cat.deck === 'walk') {
    cat.u += dt / 26;                  /* a rail walked in an unhurried half minute */
    if (cat.u >= 0.9) { cat.deck = 'below'; cat.nextWalk = env.t + 150 + (SEED % 60); }
  }
}
/* the engraved cat: authored poses, three frames per behaviour */
function drawCatPose(g, pose, frame) {
  g.lineJoin = 'round'; g.lineCap = 'round';
  const ink = 'rgba(40,30,18,0.94)';
  g.fillStyle = ink;
  if (pose === 'curl') {
    /* asleep in a curl: body ring, tucked head; f1 lifts the tail tip,
       f2 raises the head a breath */
    g.beginPath();
    g.ellipse(0, 0, 13.5, 9.6, 0, 0, TAU);
    g.fill();
    g.fillStyle = PAPER;
    g.beginPath();
    g.ellipse(1.5, 1.6, 6.4, 4.2, 0, 0, TAU);
    g.fill();
    g.fillStyle = ink;
    /* the head, tucked or lifted */
    if (frame === 2) {
      g.beginPath();
      g.ellipse(8.6, -8.4, 4.6, 4.0, -0.3, 0, TAU); g.fill();
      g.beginPath();
      g.moveTo(6.2, -11.6); g.lineTo(5.4, -15.2); g.lineTo(8.4, -13.2);
      g.moveTo(10.4, -12.2); g.lineTo(11.8, -15.4); g.lineTo(12.8, -11.6);
      g.fill();
    } else {
      g.beginPath();
      g.ellipse(7.8, -3.4, 5.0, 4.2, -0.5, 0, TAU); g.fill();
      g.beginPath();
      g.moveTo(5.2, -6.8); g.lineTo(4.2, -10.2); g.lineTo(7.4, -8.4);
      g.moveTo(9.6, -8.0); g.lineTo(11.4, -10.8); g.lineTo(12.0, -7.2);
      g.fill();
    }
    /* the tail wrap; the flick frame lifts her tip */
    g.strokeStyle = ink; g.lineWidth = 3.1;
    g.beginPath();
    g.moveTo(-12.5, 3.5);
    if (frame === 1) g.quadraticCurveTo(-17, 6, -16.5, -3.5);
    else g.quadraticCurveTo(-18, 7, -10, 8.6);
    g.stroke();
  } else if (pose === 'walk') {
    const step = frame % 2 ? 1 : -1;
    /* the body and head, one clear silhouette */
    g.beginPath();
    g.moveTo(-11.5, -6.2);
    g.bezierCurveTo(-9, -10.8, 3, -11.4, 8.5, -8.2);
    g.lineTo(10.2, -11);
    g.bezierCurveTo(10.8, -13.6, 12, -14.8, 13.6, -14.8);
    g.lineTo(14.0, -18.4); g.lineTo(16.0, -15.2);
    g.lineTo(17.8, -17.6); g.lineTo(18.4, -14.4);
    g.bezierCurveTo(19.6, -12.9, 19.3, -10.6, 17.6, -9.6);
    g.bezierCurveTo(16, -8.6, 14, -8.4, 12.8, -8.8);
    g.bezierCurveTo(12.4, -6.6, 12, -5.4, 11.6, -4.6);
    g.lineTo(-10.4, -4.6);
    g.closePath();
    g.fill();
    /* four legs: two strides and a gathered glide - three authored frames */
    g.strokeStyle = ink; g.lineWidth = 2.0; g.lineCap = 'round';
    g.beginPath();
    if (frame === 2) {
      g.moveTo(9.4, -5); g.lineTo(9.8, 0.2);
      g.moveTo(6.4, -5); g.lineTo(6.0, 0.2);
      g.moveTo(-4.4, -5); g.lineTo(-4.0, 0.2);
      g.moveTo(-8.0, -5); g.lineTo(-8.4, 0.2);
    } else {
      g.moveTo(9.6, -5); g.lineTo(10.6 + step * 2.2, 0.2);
      g.moveTo(6.2, -5); g.lineTo(5.2 - step * 2.2, 0.2);
      g.moveTo(-4.2, -5); g.lineTo(-3.2 + step * 2.0, 0.2);
      g.moveTo(-8.2, -5); g.lineTo(-9.2 - step * 2.0, 0.2);
    }
    g.stroke();
    /* the tail rides high, swaying with the step */
    g.lineWidth = 2.6;
    g.beginPath();
    g.moveTo(-11.4, -7);
    g.quadraticCurveTo(-16.5 - step * 1.4, -13, -14.5 + step * 1.6, -19.5);
    g.stroke();
  } else {
    /* sit-and-stare, out over the rail; f1 tilts the head, f2 sways the tail */
    const tilt = frame === 1 ? 0.12 : 0;
    g.save();
    g.beginPath();
    g.moveTo(-8.5, 0);
    g.bezierCurveTo(-10.5, -8.5, -5.5, -13.5, -1.5, -13.8);
    g.bezierCurveTo(0.5, -14, 1.6, -13, 2.6, -11);
    g.lineTo(3.4, -15);
    g.rotate(tilt);
    g.bezierCurveTo(3.6, -17.4, 4.8, -18.6, 6.4, -18.6);
    g.lineTo(6.9, -21.4); g.lineTo(8.6, -19);
    g.lineTo(10.3, -20.8); g.lineTo(10.8, -18.2);
    g.bezierCurveTo(11.9, -17, 11.9, -15, 10.6, -14.1);
    g.rotate(-tilt);
    g.bezierCurveTo(9.4, -13.2, 7.6, -13.2, 6.6, -13.7);
    g.bezierCurveTo(7.4, -8.6, 7.8, -4.2, 7.4, 0);
    g.closePath();
    g.fill();
    g.strokeStyle = ink; g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(7.2, -0.5);
    if (frame === 2) g.quadraticCurveTo(13.5, -2.5, 13.8, -8);
    else g.quadraticCurveTo(13, -1, 13.6, -4.6);
    g.stroke();
    g.restore();
  }
}
function drawDeckCat(g, t, sim) {
  if (REDUCED || cat.deck === 'below' || ui.mode !== 'deck') return;
  const [rx, ry] = railPoint(cat.side, cat.u);
  g.save();
  g.translate(rx, ry - 2);
  const away = 0.62 + 0.38 * cat.u;     /* smaller toward the bow */
  const s = 2.05 * away;
  if (cat.deck === 'walk') {
    g.scale(cat.side > 0 ? -s : s, s);  /* she walks toward the bow */
    drawCatPose(g, 'walk', cat.frame);
  } else {
    g.scale(cat.side > 0 ? -s : s, s);  /* she faces the sea she watches */
    drawCatPose(g, 'stare', cat.frame);
  }
  g.restore();
}
/* the chart-table cat: she settles near the waters you visit most */
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
  g.setTransform(2, 0, 0, 2, 0, 0);
  g.clearRect(0, 0, 60, 46);
  g.save();
  g.translate(30, 27);
  /* her small shadow on the vellum */
  g.fillStyle = 'rgba(38,28,17,0.14)';
  g.beginPath(); g.ellipse(0.5, 7.5, 15, 4.4, 0, 0, TAU); g.fill();
  drawCatPose(g, 'curl', REDUCED ? 0 : cat.chartFrame);
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
function chartCatBeat() {
  /* her tail flicks now and then; a rare frame lifts her head */
  if (REDUCED) return;
  cat.chartFrame = cat.chartFrame === 0 ? (Math.random() < 0.25 ? 2 : 1) : 0;
  if (ui.mode === 'below' && ui.tab === 'chart') drawChartCat();
}
