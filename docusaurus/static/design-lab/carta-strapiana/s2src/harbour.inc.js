/* ============================================================
   STAGE 2, IDEAS 5 + 6 + 7 - THE HARBOUR VERBS
   THE BOTTLE POST (idea 5): write a short note at sea, seal it, toss it
   over the rail - the bottle drifts away on the current and the note goes
   to the docs harbour (the real feedback webhook, the exact seven-key
   contract). When the harbour will not open (CORS ashore), the note is
   kept, the bottle still drifts, and a quiet line says the tide will
   carry it later.
   PACKET RUNS (idea 6): at a harbour you may take a packet addressed
   along a real citation edge toward the destination that cites this
   water most - counted in her own text, not guessed. Deliver it (land
   there by any honest means) and the trade route is inked on your chart
   for good; the strongest corpus lanes carry period route names.
   THE HARBOUR MASTER (idea 7): a dockside slip lists the ships in
   harbour - the real pages citing this one, every one a moored vessel
   with her name and rig; hail one and you board her.
   ============================================================ */

/* ---- the harbour data, raised once from the same graph the sea is ---- */
const hb = { ready: false, commOf: new Map(), laneNames: new Map(), packetCache: new Map() };
function harbourInit() {
  if (hb.ready || !world.communities || !world.graph) return;
  hb.ready = true;
  world.communities.forEach((c, i) => c.members.forEach(m => hb.commOf.set(m, i)));
  const lm = new Map();
  for (const [a, b2] of world.graph.edges) {
    const ca = hb.commOf.get(a), cb2 = hb.commOf.get(b2);
    if (ca == null || cb2 == null || ca === cb2) continue;
    const i = Math.min(ca, cb2), j = Math.max(ca, cb2);
    lm.set(i + '-' + j, (lm.get(i + '-' + j) || 0) + 1);
  }
  const top = [...lm.entries()].sort((x, y2) => y2[1] - x[1]).slice(0, 5);
  const pretty = s => {
    const short = s.split('/').pop();
    return short.length <= 4 ? short.toUpperCase()
      : short.split('-').map(w2 => w2 ? w2[0].toUpperCase() + w2.slice(1) : w2).join(' ');
  };
  for (const [k, total] of top) {
    const ij = k.split('-').map(Number);
    hb.laneNames.set(k, 'the ' + pretty(world.communities[ij[0]].hub) + ' & ' +
      pretty(world.communities[ij[1]].hub) + ' Run');
    void total;
  }
  diag.laneNames = [...hb.laneNames.values()];
}
function routeName(aSlug, bSlug) {
  harbourInit();
  const ca = hb.commOf.get(aSlug), cb2 = hb.commOf.get(bSlug);
  if (ca == null || cb2 == null || ca === cb2) return '';
  return hb.laneNames.get(Math.min(ca, cb2) + '-' + Math.max(ca, cb2)) || '';
}

/* the packet's true address: among the pages citing this water, the one
   whose own text mentions her most - counted, not guessed */
function packetFor(isle) {
  if (!isle || !world.graph || !world.content) return null;
  if (hb.packetCache.has(isle.slug)) return hb.packetCache.get(isle.slug);
  const citers = [];
  for (const [a, b2] of world.graph.edges) if (b2 === isle.slug) citers.push(a);
  let out = null;
  if (citers.length) {
    const re = new RegExp(isle.slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])', 'g');
    let best = null, bestN = -1, bestIn = -1;
    for (const q of citers) {
      const pg = world.content.pages[q];
      const hay = pg ? JSON.stringify(pg.blocks || []) : '';
      const m2 = hay.match(re);
      const cN = m2 ? m2.length : 1;
      const qI = world.bySlug.get(q);
      const qIn = qI ? (qI.inbound || 0) : 0;
      if (cN > bestN || (cN === bestN && qIn > bestIn)) { best = q; bestN = cN; bestIn = qIn; }
    }
    const I2 = world.bySlug.get(best);
    if (I2) out = { to: best, toTitle: I2.title, n: bestN };
  }
  hb.packetCache.set(isle.slug, out);
  return out;
}

function packetHTML(isle) {
  if (!world.graph) return '';
  if (ui.justDelivered && ui.justDelivered.to === isle.slug) {
    const jd = ui.justDelivered;
    return '<div class="ss-block pk-block"><h4>The packet run</h4><div class="pk-line">' +
      'Delivered: the packet from <b>' + esc(jd.fromTitle) + '</b> is in her hands. ' +
      'The route is inked on your chart for good' +
      (jd.name ? ' &mdash; she joins <i>' + esc(jd.name) + '</i>.' : '.') + '</div></div>';
  }
  if (visit.packet) {
    const T = world.bySlug.get(visit.packet.to);
    return '<div class="ss-block pk-block"><h4>The packet run</h4><div class="pk-line">' +
      'The packet for <b>' + esc(T ? T.title : visit.packet.to) + '</b> waits in the hold. ' +
      'Land there &mdash; by sail, by chart, by any citation &mdash; and she is delivered.</div></div>';
  }
  const p = packetFor(isle);
  if (!p) return '';
  return '<div class="ss-block pk-block"><h4>The packet run</h4><div class="pk-line">' +
    'A packet lies here addressed to <b>' + esc(p.toTitle) + '</b> &mdash; of every page that cites ' +
    'this water, the one that names her most (' + p.n + (p.n === 1 ? ' mention' : ' mentions') +
    ' in her own text).</div>' +
    '<button class="act" type="button" data-act="packet">Take the packet aboard</button></div>';
}

function packetDelivery(isle) {
  ui.justDelivered = null;
  const held = visit.packet;
  if (!held || held.to !== isle.slug) return;
  const from = world.bySlug.get(held.from);
  const name = routeName(held.from, held.to);
  visit.routes.push({ a: held.from, b: held.to, t: Date.now() });
  visit.packet = null;
  ui.justDelivered = { from: held.from, to: held.to,
    fromTitle: from ? from.title : held.from, name };
  logMark('Delivered the packet ' + (from ? from.title : held.from) + ' → ' + isle.title +
    (name ? ' — ' + name + ' is inked on the chart.' : ' — the route is inked on the chart.'));
  diag.routesRun = visit.routes.length;
  visit.save();
}

/* the routes YOU have run, inked for good over the sheet */
function drawRoutes(g, VV) {
  if (!visit.routes.length) return;
  g.save();
  const seen2 = new Set();
  for (const R of visit.routes) {
    const key = R.a + '>' + R.b;
    if (seen2.has(key)) continue;
    seen2.add(key);
    const A = world.bySlug.get(R.a), B2 = world.bySlug.get(R.b);
    if (!A || !B2) continue;
    const pa = VV(chartProject(A.pos.x, A.pos.y)), pb = VV(chartProject(B2.pos.x, B2.pos.y));
    const mx = (pa[0] + pb[0]) / 2, my = (pa[1] + pb[1]) / 2;
    const dx2 = pb[0] - pa[0], dy2 = pb[1] - pa[1];
    const dd = Math.hypot(dx2, dy2) || 1;
    const nx = -dy2 / dd, ny = dx2 / dd;
    const bow = Math.min(34, dd * 0.14);
    const cx2 = mx + nx * bow, cy2 = my + ny * bow;
    g.strokeStyle = GRN + '0.72)';
    g.lineWidth = 1.25;
    g.setLineDash([7, 3.2]);
    g.beginPath();
    g.moveTo(pa[0], pa[1]);
    g.quadraticCurveTo(cx2, cy2, pb[0], pb[1]);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = GRN + '0.85)';
    g.beginPath(); g.arc(pa[0], pa[1], 2.1, 0, TAU); g.fill();
    const ang = Math.atan2(pb[1] - cy2, pb[0] - cx2);
    g.beginPath();
    g.moveTo(pb[0], pb[1]);
    g.lineTo(pb[0] - Math.cos(ang - 0.42) * 7.5, pb[1] - Math.sin(ang - 0.42) * 7.5);
    g.lineTo(pb[0] - Math.cos(ang + 0.42) * 7.5, pb[1] - Math.sin(ang + 0.42) * 7.5);
    g.closePath(); g.fill();
    const nm = routeName(R.a, R.b);
    if (nm && (chart.z >= 1.6 || dd > 300)) {
      g.save();
      g.translate((mx + cx2) / 2, (my + cy2) / 2);
      let rot = Math.atan2(dy2, dx2);
      if (rot > Math.PI / 2) rot -= Math.PI;
      if (rot < -Math.PI / 2) rot += Math.PI;
      g.rotate(rot);
      g.font = 'italic 10.5px "Iowan Old Style", Palatino, Georgia, serif';
      g.fillStyle = GRN + '0.92)';
      g.textAlign = 'center';
      g.fillText(nm, 0, -4);
      g.restore();
    }
  }
  g.restore();
}

/* ---- THE HARBOUR MASTER'S SLIP ---- */
function rigOf(I) {
  return I.words >= 3600 ? 'a ship of the line, ' + commas(I.words) + ' words'
    : I.words >= 2000 ? 'a barque of ' + commas(I.words) + ' words'
    : I.words >= 900 ? 'a brig of ' + commas(I.words) + ' words'
    : 'a sloop of ' + commas(I.words) + ' words';
}
function harbourMasterHTML(isle) {
  if (!world.graph) return '';
  const ships = [];
  for (const [a, b2] of world.graph.edges) if (b2 === isle.slug) ships.push(a);
  let out = '<div class="ss-block hm-block"><h4>The harbour master&rsquo;s slip</h4>';
  if (!ships.length) {
    return out + '<div class="hm-none">No ship rides in this harbour: no page cites her.</div></div>';
  }
  ships.sort((a, b2) => {
    const A = world.bySlug.get(a), B3 = world.bySlug.get(b2);
    return ((B3 && B3.words) || 0) - ((A && A.words) || 0);
  });
  out += '<div class="hm-line">' + ships.length + (ships.length === 1 ? ' ship rides' : ' ships ride') +
    ' in harbour &mdash; every page that cites this one. Hail her and you board her.</div>' +
    '<ul class="plain hm-list">';
  for (const s of ships) {
    const T = world.bySlug.get(s);
    out += '<li><a href="#' + esc(s) + '" data-hail="1">' + esc(T ? T.title : s) + '</a>' +
      (T ? ' <span class="hm-rig">' + rigOf(T) + '</span>' : '') + '</li>';
  }
  return out + '</ul></div>';
}

/* ============================================================
   THE BOTTLE POST
   ============================================================ */
const bottlePost = { drift: [], hinted: false, posting: false };
const BOTTLE_URL = 'https://n8n.tools.strapi.team/webhook/docs-feedback';

function bottleWaters() {
  return ship.atAnchorOff || ship.bound || world.island;
}
function bottleOpen() {
  if (ui.mode !== 'deck' || portal.open) return;
  const el = $('bottleplate');
  if (!el || !el.hidden) return;
  const I = bottleWaters();
  el.querySelector('.bp-line').textContent =
    'These waters: ' + I.title + '. The note sails with their name on it.';
  el.hidden = false;
  const ta = $('bottletext');
  ta.value = '';
  setTimeout(() => ta.focus(), 30);
}
function bottleClose() {
  const el = $('bottleplate');
  if (!el || el.hidden) return;
  el.hidden = true;
  const ta = $('bottletext');
  if (ta) ta.blur();
}
function bottlePayload(comment, I) {
  /* THE SEVEN-KEY CONTRACT, byte for byte, in this order */
  return {
    vote: 'up',
    kind: 'element',
    comment: comment,
    pagePath: I.slug,
    pageTitle: I.title,
    selectionHeading: 'Design Lab - Carta Strapiana',
    channel: 'design-lab'
  };
}
function bottleToss() {
  const ta = $('bottletext');
  const comment = (ta.value || '').trim();
  if (!comment) { ta.focus(); return; }
  const I = bottleWaters();
  const payload = bottlePayload(comment, I);
  bottleClose();
  /* the bottle goes over the rail whatever the harbour says */
  if (!REDUCED) {
    bottlePost.drift.push({
      t: 0, life: 8.5,
      x: 640 + Math.random() * 120, y: 560,
      dir: (wx.lat >= 0 ? 1 : -1), ph: Math.random() * TAU
    });
  }
  diag.lastBottle = { url: BOTTLE_URL, header: 'docs-widget', payload };
  const body = JSON.stringify(payload);
  fetch(BOTTLE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-feedback-source': 'docs-widget' },
    body
  }).then(r => {
    if (!r.ok) throw new Error('harbour closed: ' + r.status);
    diag.bottleResult = 'sent';
    caption('The bottle rides the current, her note aboard, bound for the harbour.', 4600);
    logMark('A bottle away on the current for ' + I.title + ' — the note is in the harbour’s hands.');
    visit.save();
  }).catch(() => {
    diag.bottleResult = 'held';
    visit.bottles.push({ t: Date.now(), payload });
    caption('The tide holds her note; it will carry when the harbour opens.', 4600);
    logMark('Sealed a bottle for ' + I.title + ' — the tide holds the note until the harbour opens.');
    visit.save();
  });
}
function bottleInit() {
  const toss = $('bp-toss'), keep = $('bp-keep'), plate = $('bottleplate');
  if (!plate) return;
  toss.addEventListener('click', bottleToss);
  keep.addEventListener('click', bottleClose);
  plate.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); bottleClose(); }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); bottleToss(); }
  });
}
function bottleTick(dt) {
  for (let i = bottlePost.drift.length - 1; i >= 0; i--) {
    const b = bottlePost.drift[i];
    b.t += dt;
    if (b.t >= b.life) bottlePost.drift.splice(i, 1);
  }
  /* one quiet telling, once under way, never during the title */
  if (!bottlePost.hinted && env.t > 42 && ship.knots > 2 && ui.mode === 'deck' && !REDUCED) {
    bottlePost.hinted = true;
    caption('A bottle and a blank note stand by the rail. B writes to the harbour.', 5200);
  }
}
function drawBottles(sim, worldDY) {
  if (!bottlePost.drift.length) return;
  for (const b of bottlePost.drift) {
    const p = clamp(b.t / b.life, 0, 1);
    const e = 1 - Math.pow(1 - p, 2);
    const x = b.x + b.dir * e * 260 + Math.sin(env.t * 1.1 + b.ph) * 4 * (1 - e);
    const y = 560 - e * 128 + worldDY + Math.sin(env.t * 1.7 + b.ph) * 2.2 * (1 - e * 0.7);
    const s = 1 - e * 0.72;
    const a = p > 0.82 ? (1 - p) / 0.18 : 1;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(x, y);
    ctx.rotate(Math.sin(env.t * 1.3 + b.ph) * 0.18 * (1 - e) + b.dir * 0.12);
    ctx.scale(s, s);
    ctx.strokeStyle = 'rgba(46,36,24,0.85)';
    ctx.fillStyle = 'rgba(240,231,210,0.92)';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(-9, -3.2);
    ctx.lineTo(4, -3.2);
    ctx.quadraticCurveTo(8.5, -3.2, 8.5, 0);
    ctx.quadraticCurveTo(8.5, 3.2, 4, 3.2);
    ctx.lineTo(-9, 3.2);
    ctx.quadraticCurveTo(-12.5, 3.2, -12.5, 0);
    ctx.quadraticCurveTo(-12.5, -3.2, -9, -3.2);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8.5, -1.5); ctx.lineTo(12.5, -1.5); ctx.lineTo(12.5, 1.5); ctx.lineTo(8.5, 1.5);
    ctx.stroke();
    ctx.strokeRect(12.5, -1.9, 2.4, 3.8);
    /* the note within */
    ctx.strokeStyle = 'rgba(141,47,34,0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-7.5, 0.4); ctx.lineTo(1.5, 0.4); ctx.stroke();
    /* her small wake */
    ctx.strokeStyle = 'rgba(241,231,208,0.8)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-16, 4.6); ctx.quadraticCurveTo(-10, 6.4, -2, 5.2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
