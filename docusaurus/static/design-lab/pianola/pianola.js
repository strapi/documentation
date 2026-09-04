'use strict';
/* ============================================================
   THE PIANOLA
   Three and a half years of the Strapi documentation punched
   onto a player-piano roll. Every number on screen is derived
   at boot from gitlog-docs.txt + content.json + graph.json +
   communities.json + provenance.json. Nothing is hand-typed.
   ============================================================ */

/* ---------- tiny utils ---------- */
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const fmtInt = (n) => n.toLocaleString('en-US');
const MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const MON_FULL = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
function dayNum(dateStr) { // 'YYYY-MM-DD' -> UTC day number
  const y = +dateStr.slice(0, 4), m = +dateStr.slice(5, 7), d = +dateStr.slice(8, 10);
  return Date.UTC(y, m - 1, d) / 86400000;
}
function dateOfDay(day) { return new Date(Math.round(day) * 86400000); }
function fmtDateShort(day) { const d = dateOfDay(day); return String(d.getUTCDate()).padStart(2, '0') + ' ' + MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
function fmtDateLong(dateStr) { const m = +dateStr.slice(5, 7), d = +dateStr.slice(8, 10); return d + ' ' + MON_FULL[m - 1] + ' ' + dateStr.slice(0, 4); }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function stripTags(html) {
  const t = document.createElement('div'); t.innerHTML = html; return (t.textContent || '').replace(/\s+/g, ' ').trim();
}
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- diagnostics (per frame) ---------- */
window.__diag = { frameMs: 0, avgFrameMs: 0, state: 'loading', ring: [] };
function diag(ms, state) {
  const D = window.__diag;
  D.frameMs = ms; D.state = state;
  D.ring.push(ms); if (D.ring.length > 600) D.ring.shift();
  let s = 0; for (let i = 0; i < D.ring.length; i++) s += D.ring[i];
  D.avgFrameMs = s / D.ring.length;
}

/* ---------- global model ---------- */
const M = {
  pages: null, order: null, graph: null, comms: null, prov: null,
  commits: [],            // ascending by time: {hash, author, date, hour, day, files, pages[], night, ghost}
  stats: null,            // derived numbers
  tracks: [],             // trackIndex -> slug
  trackOf: {},            // slug -> trackIndex
  bands: [],              // {name, ink, inkDim, start, count, hub}
  bandOfTrack: [],
  hands: [],              // [{name, commits, voiceable, night, first, last, careDays, firstDay}]
  handIdx: {},            // name -> index into hands
  outboundTracks: {},     // slug -> [trackIndex...]
  firstLine: {},          // slug -> first-line text (lazy)
};

/* ---------- transport ---------- */
const T = {
  t: 0,                 // performance ms
  playing: false,
  speed: 1,             // 1x = 2s per week
  ptr: 0,               // next event index to fire
  epochDay: 0, lastDay: 0, endDay: 0,
  pxPerDay: 8,
  SEC_PER_WEEK: 2,
  nightAmt: 0, nightUntil: -1,
  flareUntil: -1,
  ghostPulseUntil: -1,
  retuned: false,
  creditsShown: false,
  wasPlayingBeforeRead: false,
  lastFrame: 0,
};
function dayAt(t) { return T.epochDay + (t / 1000) * (7 / T.SEC_PER_WEEK); }
function tAtDay(day) { return (day - T.epochDay) * (T.SEC_PER_WEEK / 7) * 1000; }
function nowDay() { return dayAt(T.t); }

/* active visuals */
const pressedUntil = new Float64Array(0); // replaced after layout
let pressed = null;        // Float64Array(nTracks) — wall-clock ms until which key is down
let activeNotes = [];      // {track, born, until, targets[], ink}

/* ============================================================
   BOOT
   ============================================================ */
async function boot() {
  const [content, graph, comms, prov, gitlog] = await Promise.all([
    fetch('content.json').then(r => r.json()),
    fetch('graph.json').then(r => r.json()),
    fetch('communities.json').then(r => r.json()),
    fetch('provenance.json').then(r => r.json()),
    fetch('gitlog-docs.txt').then(r => r.text()),
  ]);
  M.pages = content.pages; M.order = content.order; M.graph = graph; M.comms = comms; M.prov = prov;
  derive(gitlog);
  layoutTracks();
  buildStaticUI();
  buildRoster();
  buildIndex();
  buildProgramme();
  initCanvas();
  wireEvents();
  seekTo(0, { silent: true });
  routeFromHash(true);
  window.__diag.state = REDUCED ? 'calm-idle' : 'idle';
  requestRender();
}

/* ---------- derivation: parse the log, never type a number ---------- */
function derive(gitlogText) {
  const fileToSlug = {};
  for (const [slug, p] of Object.entries(M.pages)) fileToSlug['docusaurus/' + p.file] = slug;

  const commits = [];
  let cur = null;
  for (const raw of gitlogText.split('\n')) {
    const l = raw.trim();
    if (!l) continue;
    if (l.startsWith('C|')) {
      if (cur) commits.push(cur);
      const p = l.split('|');
      cur = { hash: p[1], author: p[2], date: p[3], hour: +p[4], files: [] };
    } else if (cur) cur.files.push(l);
  }
  if (cur) commits.push(cur);
  commits.reverse(); // oldest first

  let maxCommit = null;
  for (const c of commits) {
    const set = new Set();
    for (const f of c.files) { const s = fileToSlug[f]; if (s) set.add(s); }
    c.pages = [...set];
    c.day = dayNum(c.date) + (c.hour + 0.5) / 24;
    c.night = (c.hour >= 22 || c.hour < 6);
    c.ghost = c.pages.length === 0;
    if (!c.ghost && (!maxCommit || c.pages.length > maxCommit.pages.length)) maxCommit = c;
  }
  commits.sort((a, b) => a.day - b.day);
  M.commits = commits;

  const voiceable = commits.filter(c => !c.ghost);
  const ghost = commits.filter(c => c.ghost);
  const nightVoiceable = voiceable.filter(c => c.night);
  const threeAm = nightVoiceable.filter(c => c.hour === 3);

  // hands = distinct authors of voiceable commits (this is exactly the set
  // whose union provenance.json credits across the 290 pages)
  const handSet = new Set(voiceable.map(c => c.author));
  const handMap = new Map();
  for (const c of commits) {
    if (!handSet.has(c.author)) continue;
    let h = handMap.get(c.author);
    if (!h) { h = { name: c.author, commits: 0, voiceable: 0, night: 0, first: c.date, last: c.date, firstDay: c.day }; handMap.set(c.author, h); }
    h.commits++; if (!c.ghost) h.voiceable++; if (c.night) h.night++;
    if (c.date < h.first) h.first = c.date;
    if (c.date > h.last) h.last = c.date;
    if (c.day < h.firstDay) h.firstDay = c.day;
  }
  const hands = [...handMap.values()];
  for (const h of hands) h.careDays = Math.round(dayNum(h.last) - dayNum(h.first));
  hands.sort((a, b) => a.firstDay - b.firstDay); // order of first appearance
  M.hands = hands;
  M.handIdx = {}; hands.forEach((h, i) => { M.handIdx[h.name] = i; });

  const offPressingAuthors = new Set(commits.filter(c => !handSet.has(c.author)).map(c => c.author));
  const offPressingCommits = commits.filter(c => !handSet.has(c.author)).length;

  // longest silence between consecutive recording dates
  const dates = [...new Set(commits.map(c => c.date))].sort();
  let gap = { days: 0, from: dates[0], to: dates[0] };
  for (let i = 1; i < dates.length; i++) {
    const d = dayNum(dates[i]) - dayNum(dates[i - 1]);
    if (d > gap.days) gap = { days: d, from: dates[i - 1], to: dates[i] };
  }

  const firstVoiceable = commits.find(c => !c.ghost);
  const ghostBeforeFirstVoice = commits.filter(c => c.day < firstVoiceable.day).length;
  const retuningHands = new Set([maxCommit.author]).size;

  T.epochDay = Math.floor(commits[0].day);
  T.lastDay = commits[commits.length - 1].day;
  T.endDay = T.lastDay + 21; // three weeks of blank paper run off the spool

  M.stats = {
    total: commits.length,
    voiceable: voiceable.length,
    ghost: ghost.length,
    nightVoiceable: nightVoiceable.length,
    threeAm: threeAm.length,
    threeAmFirst: threeAm.length ? threeAm[0] : null,
    firstNight: nightVoiceable.length ? nightVoiceable[0] : null,
    hands: hands.length,
    pages: Object.keys(M.pages).length,
    inks: M.comms.length,
    firstCommit: commits[0],
    lastCommit: commits[commits.length - 1],
    firstVoiceable, ghostBeforeFirstVoice,
    retuning: maxCommit,
    retuningHands,
    gap,
    offPressingHands: offPressingAuthors.size,
    offPressingCommits,
    totalWeeks: Math.ceil((T.lastDay - T.epochDay) / 7),
    words: Object.values(M.graph.words).reduce((a, b) => a + b, 0),
    edges: M.graph.edges.length,
    maxInbound: Math.max(...Object.values(M.graph.inbound)),
  };
}

/* ---------- tracks: 27 ink bands + unbound + ghost lane ---------- */
function layoutTracks() {
  const inCommunity = new Set();
  M.comms.forEach(c => c.members.forEach(m => inCommunity.add(m)));
  const unbound = Object.keys(M.pages).filter(s => !inCommunity.has(s)).sort();

  let idx = 0;
  const pushBand = (name, members, ink, hub) => {
    const start = idx;
    for (const m of members) { M.tracks[idx] = m; M.trackOf[m] = idx; idx++; }
    M.bands.push({ name, ink, start, count: members.length, hub });
    const b = M.bands.length - 1;
    for (let i = start; i < idx; i++) M.bandOfTrack[i] = b;
  };
  M.comms.forEach((c, i) => pushBand(c.dominant || ('community ' + (i + 1)), c.members, inkFor(i, c.purity), c.hub));
  if (unbound.length) pushBand('unbound', unbound, 'hsl(35 8% 45%)', null);

  pressed = new Float64Array(M.tracks.length);

  // outbound edge targets per slug (as track indices)
  for (const [from, to] of M.graph.edges) {
    if (M.trackOf[from] === undefined || M.trackOf[to] === undefined) continue;
    (M.outboundTracks[from] = M.outboundTracks[from] || []).push(M.trackOf[to]);
  }
}
/* community ink: the only saturated colours anywhere, mixed dusk-adjacent —
   hue walks a dusk wheel (teal dusk -> slate -> heather -> plum -> madder ->
   brick -> umber gold) at a fixed engraving value, so the moving roll reads
   as one engraved object, never a rainbow. Saturation follows the
   community's Louvain purity. */
function inkFor(i, purity) {
  const n = Math.max(1, M.comms.length - 1);
  const t = i / n;
  const hue = (185 + t * 220) % 360;
  const sat = Math.round(26 + 34 * (purity || 0.5));
  return `hsl(${Math.round(hue)} ${sat}% 40%)`;
}
/* night holes in Prussian blue */
const NIGHT_INK = '#16395C';
const NIGHT_INK_HI = '#2F6292';

/* ============================================================
   STATIC UI TEXT (all derived)
   ============================================================ */
function buildStaticUI() {
  const s = M.stats;
  $('pressing-line').textContent =
    `${fmtInt(s.total)} recordings · ${fmtInt(s.voiceable)} voiceable · ${fmtInt(s.ghost)} ghost · ` +
    `${fmtInt(s.pages)} pages · ${fmtInt(s.inks)} inks · ${s.firstCommit.date} → ${s.lastCommit.date}`;
  const perfSec = Math.round((T.endDay - T.epochDay) / 7 * T.SEC_PER_WEEK);
  const perfMin = Math.floor(perfSec / 60), perfRem = String(perfSec % 60).padStart(2, '0');
  $('welcome-sub').innerHTML =
    `${fmtInt(s.total)} recordings from the documentation's own log, punched at their true date and hour.<br>` +
    `<b>Tab</b> opens the index of ${fmtInt(s.pages)} pages · click any key or hole to read a page.<br>` +
    (REDUCED ? 'Reduced motion is on: the roll advances one week per step, on your command.'
             : `The full pressing performs in ${perfMin}:${perfRem} at ${T.SEC_PER_WEEK} seconds per week.`);
  $('night-def').innerHTML =
    `Commits punched between 22:00 and 06:00 — <b>${fmtInt(s.nightVoiceable)}</b> blue holes on this roll` +
    ` (${fmtInt(s.threeAm)} of them at three in the morning). Distinct from the per-page night tally shown on provenance plaques, which counts a page's night edits.`;
  $('ghost-def').innerHTML =
    `<b>${fmtInt(s.ghost)}</b> of the ${fmtInt(s.total)} recordings touch only pages that no longer exist. ` +
    `They run through the machine in the grey lane as pitch-less felt thuds — visible, never voiced.`;
  $('roster-sub').textContent = `${fmtInt(s.hands)} hands`;
  // retuning plate content (revealed when it crosses the bar)
  const r = s.retuning;
  const handWord = s.retuningHands === 1 ? 'one hand' : `${s.retuningHands} hands`;
  $('rt-text').innerHTML = `The Great Retuning<br>one commit · ${fmtInt(r.pages.length)} pages · ${handWord}`;
  $('rt-mono').textContent = `${r.hash.slice(0, 8)} · ${fmtDateLong(r.date)} · ${r.author}`;
  if (REDUCED) $('crank-label').textContent = 'Step week';
  document.title = 'The Pianola — ' + fmtInt(s.total) + ' recordings · ' + fmtInt(s.hands) + ' hands';
}

/* ============================================================
   ROSTER (77 brass plates, order of first appearance)
   ============================================================ */
let plateEls = [], plateCounts = [];
function buildRoster() {
  const roster = $('roster');
  const frag = document.createDocumentFragment();
  M.hands.forEach((h, i) => {
    const el = document.createElement('div');
    el.className = 'plate';
    el.innerHTML = `<span class="p-name" title="${esc(h.name)} · first ${h.first} · last ${h.last}">${esc(h.name)}</span><span class="p-count">0</span>`;
    frag.appendChild(el);
    plateEls[i] = el;
  });
  const off = document.createElement('div');
  off.className = 'plate off-pressing';
  off.innerHTML = `<span class="p-name">…and ${fmtInt(M.stats.offPressingHands)} hands off the pressing</span><span class="p-count" id="off-count">0</span>`;
  frag.appendChild(off);
  roster.appendChild(frag);
  plateCounts = new Array(M.hands.length).fill(0);
}
let offCount = 0, leadIdx = -1;
function rosterReset() {
  plateCounts.fill(0); offCount = 0; leadIdx = -1;
  plateEls.forEach(el => { el.className = 'plate'; el.lastElementChild.textContent = '0'; });
  $('off-count').textContent = '0';
  $('lead-hand').innerHTML = '';
}
function glowClass(n) { return n >= 500 ? 'glow4' : n >= 100 ? 'glow3' : n >= 10 ? 'glow2' : n >= 1 ? 'glow1' : ''; }
function rosterBump(author, flash) {
  const i = M.handIdx[author];
  if (i === undefined) {
    offCount++; $('off-count').textContent = fmtInt(offCount);
    return;
  }
  const n = ++plateCounts[i];
  const el = plateEls[i];
  el.lastElementChild.textContent = fmtInt(n);
  el.className = 'plate ' + glowClass(n) + (flash ? ' hit' : '');
  if (flash && !REDUCED) setTimeout(() => el.classList.remove('hit'), 260);
  if (leadIdx === -1 || n > plateCounts[leadIdx]) {
    if (leadIdx !== i) { leadIdx = i; }
    $('lead-hand').innerHTML = `lead hand — <b>${esc(M.hands[i].name)}</b> · ${fmtInt(n)}`;
  } else if (leadIdx === i) {
    $('lead-hand').innerHTML = `lead hand — <b>${esc(M.hands[i].name)}</b> · ${fmtInt(n)}`;
  }
}
function rosterRebuild(counts, off) {
  plateCounts = counts; offCount = off; leadIdx = -1;
  let best = -1;
  counts.forEach((n, i) => {
    plateEls[i].lastElementChild.textContent = fmtInt(n);
    plateEls[i].className = 'plate ' + glowClass(n);
    if (n > best) { best = n; leadIdx = i; }
  });
  $('off-count').textContent = fmtInt(off);
  $('lead-hand').innerHTML = best > 0 ? `lead hand — <b>${esc(M.hands[leadIdx].name)}</b> · ${fmtInt(best)}` : '';
}

/* ============================================================
   CANVAS
   ============================================================ */
const CV = { el: null, ctx: null, W: 0, H: 0, dpr: 1,
  x0: 14, trackW: 3.5, ghostX: 0, ghostW: 24, paperR: 0,
  keysTop: 0, keysH: 74, barY: 0 };

function initCanvas() {
  CV.el = $('roll-canvas');
  CV.ctx = CV.el.getContext('2d');
  const ro = new ResizeObserver(() => { sizeCanvas(); requestRender(); });
  ro.observe($('stage'));
  sizeCanvas();
}
function sizeCanvas() {
  const st = $('stage');
  CV.W = st.clientWidth; CV.H = st.clientHeight;
  CV.dpr = Math.min(2, window.devicePixelRatio || 1);
  CV.el.width = Math.round(CV.W * CV.dpr);
  CV.el.height = Math.round(CV.H * CV.dpr);
  CV.ctx.setTransform(CV.dpr, 0, 0, CV.dpr, 0, 0);
  const usable = CV.W - CV.x0 - 10 - CV.ghostW - 8;
  CV.trackW = usable / M.tracks.length;
  CV.ghostX = CV.x0 + CV.trackW * M.tracks.length + 8;
  CV.paperR = CV.ghostX + CV.ghostW;
  CV.keysTop = CV.H - CV.keysH;
  CV.barY = CV.keysTop - 14;
}
const trackX = (i) => CV.x0 + i * CV.trackW;
const yOfDay = (day, now) => CV.barY - (day - now) * T.pxPerDay;

/* binary search: first commit index with day >= d */
function firstIdxAtDay(d) {
  let lo = 0, hi = M.commits.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (M.commits[mid].day < d) lo = mid + 1; else hi = mid; }
  return lo;
}

function drawFrame(wall) {
  const ctx = CV.ctx, now = nowDay();
  const W = CV.W, H = CV.H;
  ctx.clearRect(0, 0, W, H);

  /* parlour: near-black aubergine */
  ctx.fillStyle = '#17121A';
  ctx.fillRect(0, 0, W, H);

  /* --- roll paper: cream --- */
  const paperTop = 0, paperBot = CV.barY + 8;
  ctx.fillStyle = '#F0E6CE';
  ctx.fillRect(CV.x0 - 6, paperTop, CV.paperR - CV.x0 + 12, paperBot);
  /* band tints + separators — a whisper of ink so the roll stays cream
     and reads as one engraved object */
  for (const b of M.bands) {
    ctx.fillStyle = b.ink;
    ctx.globalAlpha = 0.06;
    ctx.fillRect(trackX(b.start), paperTop, b.count * CV.trackW, paperBot);
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = 'rgba(58,44,30,.26)';
  for (const b of M.bands) ctx.fillRect(trackX(b.start), paperTop, 1, paperBot);
  /* ghost lane */
  ctx.fillStyle = '#DECFAF';
  ctx.fillRect(CV.ghostX, paperTop, CV.ghostW, paperBot);
  ctx.fillStyle = 'rgba(58,44,30,.35)';
  ctx.fillRect(CV.ghostX - 1, paperTop, 1, paperBot);
  ctx.save();
  ctx.translate(CV.ghostX + CV.ghostW / 2 + 3, 20);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = 'rgba(74,58,40,.55)';
  ctx.font = '8px "SF Mono", Menlo, monospace';
  ctx.fillText('GHOSTS — PAGES THAT NO LONGER EXIST', 0, 0);
  ctx.restore();

  /* month ticks */
  const topDay = now + (CV.barY - paperTop) / T.pxPerDay;
  ctx.font = '9px "SF Mono", Menlo, monospace';
  const d0 = dateOfDay(Math.max(T.epochDay - 31, Math.floor(now) - 2));
  let mDate = new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth(), 1));
  while (true) {
    const md = mDate.getTime() / 86400000;
    if (md > topDay + 32) break;
    const y = yOfDay(md, now);
    if (y > -10 && y < paperBot) {
      ctx.fillStyle = 'rgba(58,44,30,.10)';
      ctx.fillRect(CV.x0 - 6, y, CV.paperR - CV.x0 + 12, 1);
      ctx.fillStyle = 'rgba(74,58,40,.5)';
      ctx.fillText(MON[mDate.getUTCMonth()] + ' ' + mDate.getUTCFullYear(), CV.x0, y - 3);
    }
    mDate = new Date(Date.UTC(mDate.getUTCFullYear(), mDate.getUTCMonth() + 1, 1));
  }

  /* leader / run-off engravings */
  const leadY = yOfDay(T.epochDay, now);
  if (leadY < paperBot && leadY > -400) {
    ctx.fillStyle = 'rgba(74,52,32,.6)';
    ctx.font = '600 11px Copperplate, Optima, serif';
    ctx.fillText('THE PRESSING BEGINS — ' + M.stats.firstCommit.date, CV.x0 + 8, Math.min(paperBot - 60, leadY + 26));
  }
  const runY = yOfDay(T.lastDay, now);
  if (runY > -60) {
    ctx.fillStyle = 'rgba(74,52,32,.55)';
    ctx.font = 'italic 12px "Iowan Old Style", Palatino, serif';
    if (runY > 60) ctx.fillText('blank paper — the song is still being written', CV.x0 + 8, runY - 46);
  }

  /* --- holes --- */
  const loD = now - 2, hiD = topDay + 2;
  let i = firstIdxAtDay(loD);
  const slotW = Math.max(2, CV.trackW - 1.3), slotH = 9;
  const rHash = M.stats.retuning.hash;
  for (; i < M.commits.length; i++) {
    const c = M.commits[i];
    if (c.day > hiD) break;
    const y = yOfDay(c.day, now);
    if (c.ghost) {
      /* felt-grey blind punch in the margin lane — pressed, never cut */
      ctx.fillStyle = 'rgba(122,113,100,.85)';
      ctx.fillRect(CV.ghostX + 3, y - slotH / 2, CV.ghostW - 6, slotH);
    } else {
      const isNight = c.night;
      for (const s of c.pages) {
        const tr = M.trackOf[s];
        if (isNight) {
          ctx.fillStyle = y > CV.barY - 90 ? NIGHT_INK_HI : NIGHT_INK;
        } else {
          /* clean die-cut void: the dark of the machine shows through */
          ctx.fillStyle = '#151017';
        }
        ctx.fillRect(trackX(tr) + (CV.trackW - slotW) / 2, y - slotH / 2, slotW, slotH);
      }
      if (isNight && c.pages.length) { // small moon tick in left margin
        ctx.fillStyle = NIGHT_INK_HI;
        ctx.fillRect(CV.x0 - 5, y - 2, 3, 4);
      }
      if (c.hash === rHash) {
        ctx.fillStyle = 'rgba(122,82,32,.9)';
        ctx.font = '600 9px Copperplate, Optima, serif';
        ctx.fillText('THE GREAT RETUNING — ' + fmtInt(c.pages.length) + ' PAGES', CV.x0 + 8, y - 8);
      }
    }
  }

  /* --- harmony strings: brass wire above the keybed --- */
  if (activeNotes.length) {
    ctx.lineWidth = 0.8;
    for (const n of activeNotes) {
      const life = clamp((n.until - wall) / (n.until - n.born), 0, 1);
      if (life <= 0) continue;
      const x1 = trackX(n.track) + CV.trackW / 2;
      ctx.strokeStyle = `rgba(201,165,103,${0.34 * life})`;
      for (const t2 of n.targets) {
        const x2 = trackX(t2) + CV.trackW / 2;
        ctx.beginPath();
        ctx.moveTo(x1, CV.keysTop - 2);
        ctx.quadraticCurveTo((x1 + x2) / 2, CV.keysTop - 40 - Math.min(200, Math.abs(x2 - x1) * 0.25), x2, CV.keysTop - 2);
        ctx.stroke();
      }
    }
  }

  /* --- tracker bar: dark walnut rail, one felt-red hammer line --- */
  ctx.fillStyle = '#241A11';
  ctx.fillRect(CV.x0 - 10, CV.barY - 3, CV.paperR - CV.x0 + 20, 12);
  ctx.fillStyle = 'rgba(239,217,167,.25)'; /* engraved edge highlight */
  ctx.fillRect(CV.x0 - 10, CV.barY - 3, CV.paperR - CV.x0 + 20, 1);
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.fillRect(CV.x0 - 10, CV.barY + 8, CV.paperR - CV.x0 + 20, 1);
  ctx.fillStyle = '#B8423A'; /* the single red element */
  ctx.fillRect(CV.x0 - 10, CV.barY, CV.paperR - CV.x0 + 20, 2);
  /* retuning flare sweep: a brass flash along the bar */
  if (wall < T.flareUntil) {
    const k = 1 - (T.flareUntil - wall) / 1600;
    ctx.fillStyle = `rgba(239,217,167,${0.35 * (1 - Math.abs(k * 2 - 1))})`;
    ctx.fillRect(CV.x0 - 10, CV.barY - 6, (CV.paperR - CV.x0 + 20), 18);
  }
  /* ghost thud pulse under the lane */
  if (wall < T.ghostPulseUntil) {
    const a = (T.ghostPulseUntil - wall) / 420;
    ctx.fillStyle = `rgba(150,140,124,${0.55 * a})`;
    ctx.fillRect(CV.ghostX, CV.barY - 2, CV.ghostW, 6);
  }

  /* --- keys on a walnut keybed --- */
  const kT = CV.keysTop, kH = CV.keysH - 8;
  ctx.fillStyle = '#241A11';
  ctx.fillRect(CV.x0 - 10, kT - 2, CV.paperR - CV.x0 + 20, H - kT + 2);
  for (let tr = 0; tr < M.tracks.length; tr++) {
    const down = pressed[tr] > wall;
    const x = trackX(tr);
    const b = M.bands[M.bandOfTrack[tr]];
    ctx.fillStyle = down ? b.ink : '#EAE0C6';
    ctx.fillRect(x + 0.4, kT + (down ? 3 : 0), CV.trackW - 0.8, kH - (down ? 3 : 0));
    ctx.fillStyle = b.ink;
    ctx.fillRect(x + 0.4, kT + kH, CV.trackW - 0.8, 5);
    if (b.hub === M.tracks[tr]) {
      ctx.fillStyle = '#C9A567'; /* brass tab marks the band's lead track */
      ctx.fillRect(x + 0.4, kT + kH + 5, CV.trackW - 0.8, 3);
    }
  }
  /* keybed shadow line */
  ctx.fillStyle = 'rgba(0,0,0,.4)';
  ctx.fillRect(CV.x0 - 10, kT - 1, CV.paperR - CV.x0 + 20, 1);

  /* --- casework: flat walnut planes, engraved edges, brass spool chucks --- */
  const caseL = CV.x0 - 6, caseR = CV.paperR + 6;
  ctx.fillStyle = '#241A11';
  ctx.fillRect(0, 0, caseL, H);              /* left stile */
  ctx.fillRect(caseR, 0, W - caseR, H);      /* right stile */
  ctx.fillRect(caseL, 0, caseR - caseL, 11); /* top rail over the spool */
  ctx.fillStyle = 'rgba(239,217,167,.16)';   /* edge highlights */
  ctx.fillRect(caseL - 1, 0, 1, H);
  ctx.fillRect(caseR, 0, 1, H);
  ctx.fillRect(caseL, 11, caseR - caseL, 1);
  ctx.fillStyle = 'rgba(0,0,0,.5)';          /* engraved shadow under the rail */
  ctx.fillRect(caseL, 12, caseR - caseL, 1);
  ctx.fillStyle = '#8A6C3C';                 /* spool chucks */
  ctx.fillRect(caseL + 2, 2, 10, 7);
  ctx.fillRect(caseR - 12, 2, 10, 7);
  ctx.fillStyle = '#EFD9A7';
  ctx.fillRect(caseL + 2, 2, 10, 1);
  ctx.fillRect(caseR - 12, 2, 10, 1);

  /* --- night veil: Prussian dusk --- */
  if (T.nightAmt > 0.005) {
    ctx.fillStyle = `rgba(7,17,30,${0.52 * T.nightAmt})`;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = `rgba(22,57,92,${0.22 * T.nightAmt})`;
    ctx.fillRect(CV.x0 - 6, paperTop, CV.paperR - CV.x0 + 12, paperBot);
  }
}

/* ============================================================
   TRANSPORT & EVENTS
   ============================================================ */
function fireEvent(c, live, wall) {
  if (c.ghost) {
    T.ghostPulseUntil = wall + 420;
    if (live) Snd.thud();
  } else {
    const isRetuning = c.hash === M.stats.retuning.hash;
    const noteCap = isRetuning ? c.pages.length : 12;
    let played = 0;
    for (const s of c.pages) {
      const tr = M.trackOf[s];
      const words = M.graph.words[s] || 0;
      const sus = 400 + 2600 * Math.min(1, words / 8000);
      pressed[tr] = wall + (isRetuning ? 2600 : sus);
      if (activeNotes.length < 80) {
        activeNotes.push({ track: tr, born: wall, until: wall + Math.min(1800, sus), targets: (M.outboundTracks[s] || []) });
      }
      if (live && !isRetuning && played < noteCap) {
        const inb = M.graph.inbound[s] || 0;
        const vel = 0.25 + 0.75 * Math.sqrt(inb / M.stats.maxInbound);
        Snd.note(tr, vel, sus / 1000, (M.graph.code[s] || 0) >= 10, played * 0.014);
        played++;
      }
    }
    if (isRetuning) {
      if (!T.retuned) engraveRetuningPlate(true);
      T.retuned = true;
      T.flareUntil = wall + 1600;
      if (live) Snd.tutti();
    }
    if (c.night) T.nightUntil = wall + 5200;
  }
  rosterBump(c.author, live);
}
function engraveRetuningPlate(animate) {
  const p = $('retuning-plate');
  p.classList.add('shown');
  if (animate && !REDUCED) { p.classList.add('engraving'); setTimeout(() => p.classList.remove('engraving'), 2600); }
}

function update(dtMs, wall) {
  if (T.playing) T.t += dtMs * T.speed;
  const n = nowDay();
  while (T.ptr < M.commits.length && M.commits[T.ptr].day <= n) {
    fireEvent(M.commits[T.ptr], T.playing && Snd.enabled, wall);
    T.ptr++;
  }
  /* night easing */
  const target = wall < T.nightUntil ? 1 : 0;
  const k = REDUCED ? 1 : Math.min(1, dtMs / 600);
  T.nightAmt += (target - T.nightAmt) * k;
  /* prune notes */
  if (activeNotes.length) activeNotes = activeNotes.filter(nn => nn.until > wall);
  /* end of the spool */
  if (T.playing && n >= T.endDay) {
    T.playing = false;
    setCrank();
    if (!T.creditsShown) showCredits();
  }
  updateOdometer(n);
}

let odoLast = '';
function updateOdometer(n) {
  const week = clamp(Math.floor((n - T.epochDay) / 7) + 1, 1, M.stats.totalWeeks);
  const txt = fmtDateShort(Math.min(n, T.endDay));
  if (txt !== odoLast) { $('odo-date').textContent = txt; odoLast = txt; }
  $('odo-sub').textContent = `week ${week} / ${M.stats.totalWeeks} · hole ${fmtInt(Math.min(T.ptr, M.stats.total))} / ${fmtInt(M.stats.total)}`;
  if (!scrubbing) $('scrub').value = Math.round(10000 * (n - T.epochDay) / (T.endDay - T.epochDay));
}

function seekTo(tMs, opts) {
  opts = opts || {};
  T.t = clamp(tMs, 0, tAtDay(T.endDay));
  const n = nowDay();
  T.ptr = firstIdxAtDay(n + 1e-9);
  /* rebuild roster counts silently */
  const counts = new Array(M.hands.length).fill(0);
  let off = 0;
  for (let i = 0; i < T.ptr; i++) {
    const a = M.commits[i].author;
    const hi = M.handIdx[a];
    if (hi === undefined) off++; else counts[hi]++;
  }
  rosterRebuild(counts, off);
  pressed.fill(0);
  activeNotes = [];
  T.nightUntil = -1; T.nightAmt = 0; T.flareUntil = -1; T.ghostPulseUntil = -1;
  T.retuned = M.stats.retuning.day <= n;
  if (T.retuned) engraveRetuningPlate(false);
  else $('retuning-plate').classList.remove('shown');
  T.creditsShown = n >= T.endDay - 0.01 ? T.creditsShown : false;
  updateOdometer(n);
  if (!opts.silent) requestRender();
}

/* ---------- main loop ---------- */
let rafPending = false;
function requestRender() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(frame);
}
function frame(ts) {
  rafPending = false;
  const busy0 = performance.now();
  const dt = T.lastFrame ? Math.min(100, ts - T.lastFrame) : 16;
  T.lastFrame = ts;
  update(dt, busy0);
  drawFrame(busy0);
  const busy = performance.now() - busy0;
  diag(busy, currentState());
  if (creditsRolling) rollCredits(dt);
  const animating = T.playing || activeNotes.length > 0 || T.nightAmt > 0.005 ||
    busy0 < T.flareUntil || busy0 < T.ghostPulseUntil || creditsRolling;
  if (!REDUCED && animating) requestRender();
  else if (!REDUCED && !document.hidden) requestRender(); // parlour idles calmly; cheap flat frame
}
function currentState() {
  if ($('credits-overlay').classList.contains('open')) return 'credits';
  if ($('reading-overlay').classList.contains('open')) return 'reading';
  if (T.playing) return 'performing';
  return REDUCED ? 'calm-paused' : 'paused';
}

/* ============================================================
   AUDIO — optional felt piano. Silent by default; the voice
   toggle is the user gesture that wakes WebAudio. Pool of 32.
   Every sonic element maps to a countable datum:
   pitch = track (page position in its ink band), velocity =
   graph.inbound, sustain = graph.words, clack = graph.code,
   thud = ghost commit, tutti = the Great Retuning chord.
   ============================================================ */
const Snd = {
  ctx: null, master: null, noiseBuf: null, tuttiBuf: null,
  voices: [], enabled: false,
  freqOf(track) {
    const t = track / Math.max(1, M.tracks.length - 1);
    let midi = 30 + 62 * t;
    const PENTA = [0, 2, 4, 7, 9];
    const oct = Math.floor(midi / 12), r = midi % 12;
    let best = PENTA[0], bd = 99;
    for (const p of PENTA) { const d = Math.abs(p - r); if (d < bd) { bd = d; best = p; } }
    midi = oct * 12 + best;
    return 440 * Math.pow(2, (midi - 69) / 12);
  },
  async enable() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.45;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.renderTutti();
    }
    try { await this.ctx.resume(); } catch (e) {}
    this.enabled = true;
  },
  disable() { this.enabled = false; if (this.ctx) { try { this.ctx.suspend(); } catch (e) {} } },
  steal() {
    while (this.voices.length >= 32) {
      const v = this.voices.shift();
      try {
        const t = this.ctx.currentTime;
        v.g.gain.cancelScheduledValues(t);
        v.g.gain.setTargetAtTime(0, t, 0.015);
        v.o1.stop(t + 0.09); v.o2.stop(t + 0.09);
      } catch (e) {}
    }
  },
  note(track, vel, sustainS, clack, delayS) {
    if (!this.enabled || !this.ctx) return;
    this.steal();
    const ctx = this.ctx, t = ctx.currentTime + (delayS || 0);
    const f = this.freqOf(track);
    const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2.001;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600 + 2200 * vel; lp.Q.value = 0.4;
    const g = ctx.createGain(); g.gain.value = 0;
    const g2 = ctx.createGain(); g2.gain.value = 0.28; // second partial felt-damped
    o1.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(this.master);
    const peak = 0.30 * vel;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.008);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * 0.3), t + 0.18);
    g.gain.setTargetAtTime(0, t + Math.max(0.18, sustainS * 0.55), 0.22);
    o1.start(t); o2.start(t);
    const stopAt = t + sustainS + 1.2;
    o1.stop(stopAt); o2.stop(stopAt);
    /* felt hammer: soft noise tick */
    const ns = ctx.createBufferSource(); ns.buffer = this.noiseBuf;
    const nf = ctx.createBiquadFilter(); nf.type = clack ? 'highpass' : 'lowpass';
    nf.frequency.value = clack ? 3400 : 900;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(clack ? 0.05 : 0.03, t);
    ng.gain.exponentialRampToValueAtTime(0.0002, t + (clack ? 0.03 : 0.05));
    ns.connect(nf); nf.connect(ng); ng.connect(this.master);
    ns.start(t); ns.stop(t + 0.08);
    const v = { o1, o2, g };
    this.voices.push(v);
    setTimeout(() => { const ix = this.voices.indexOf(v); if (ix >= 0) this.voices.splice(ix, 1); }, (sustainS + 1.3 + (delayS || 0)) * 1000);
  },
  thud() {
    if (!this.enabled || !this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const ns = ctx.createBufferSource(); ns.buffer = this.noiseBuf;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 130;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0002, t + 0.16);
    ns.connect(lp); lp.connect(g); g.connect(this.master);
    ns.start(t); ns.stop(t + 0.2);
  },
  /* The Retuning tutti: ONE pre-mixed swell rendered offline from the actual
     chord (up to 24 of its tracks sampled evenly) — never live oscillators. */
  renderTutti() {
    try {
      const sr = 44100, dur = 3.2;
      const oc = new OfflineAudioContext(2, Math.ceil(sr * dur), sr);
      const master = oc.createGain(); master.gain.value = 0.9; master.connect(oc.destination);
      const tracks = M.stats.retuning.pages.map(s => M.trackOf[s]).sort((a, b) => a - b);
      const n = Math.min(24, tracks.length);
      for (let i = 0; i < n; i++) {
        const tr = tracks[Math.floor(i * (tracks.length - 1) / Math.max(1, n - 1))];
        const f = this.freqOf(tr);
        const o = oc.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const g = oc.createGain();
        const t0 = 0.02 + i * 0.028;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.09 * (1 - i / (n * 1.6)), t0 + 0.35);
        g.gain.setTargetAtTime(0, 1.6, 0.5);
        o.connect(g); g.connect(master);
        o.start(t0); o.stop(dur);
      }
      oc.startRendering().then(buf => { this.tuttiBuf = buf; }).catch(() => {});
    } catch (e) {}
  },
  tutti() {
    if (!this.enabled || !this.ctx || !this.tuttiBuf) return;
    const s = this.ctx.createBufferSource();
    s.buffer = this.tuttiBuf;
    s.connect(this.master);
    s.start();
  },
};

/* ============================================================
   POINTER: tooltips + click-to-read
   ============================================================ */
let hoverInfo = null;
function eventAtPointer(mx, my) {
  const now = nowDay();
  if (my > CV.barY + 8 || my < 0) return null;
  const dayAtY = now + (CV.barY - my) / T.pxPerDay;
  const lo = firstIdxAtDay(dayAtY - 1.2), hi = firstIdxAtDay(dayAtY + 1.2);
  const inGhost = mx >= CV.ghostX && mx <= CV.ghostX + CV.ghostW;
  const tr = Math.floor((mx - CV.x0) / CV.trackW);
  let best = null, bestD = 1e9;
  for (let i = lo; i < hi && i < M.commits.length; i++) {
    const c = M.commits[i];
    const dy = Math.abs(yOfDay(c.day, now) - my);
    if (dy > 8) continue;
    if (c.ghost && inGhost) { if (dy < bestD) { bestD = dy; best = { c, slug: null }; } }
    else if (!c.ghost && tr >= 0 && tr < M.tracks.length) {
      const slug = M.tracks[tr];
      if (c.pages.includes(slug) && dy < bestD) { bestD = dy; best = { c, slug }; }
    }
  }
  return best;
}
function keyAtPointer(mx, my) {
  if (my < CV.keysTop || my > CV.H) return null;
  const tr = Math.floor((mx - CV.x0) / CV.trackW);
  if (tr < 0 || tr >= M.tracks.length) return null;
  return tr;
}
function showTip(html, cx, cy) {
  const tip = $('tip');
  tip.innerHTML = html;
  tip.style.display = 'block';
  const st = $('stage').getBoundingClientRect();
  let x = cx + 16, y = cy + 14;
  if (x + 330 > st.width) x = cx - 330;
  if (y + 120 > st.height) y = cy - 110;
  tip.style.left = Math.max(4, x) + 'px';
  tip.style.top = Math.max(4, y) + 'px';
}
function hideTip() { $('tip').style.display = 'none'; }

function onCanvasMove(e) {
  const r = CV.el.getBoundingClientRect();
  const mx = e.clientX - r.left, my = e.clientY - r.top;
  const hit = eventAtPointer(mx, my);
  if (hit) {
    const c = hit.c;
    const hh = String(c.hour).padStart(2, '0') + ':00';
    if (c.ghost) {
      showTip(`<div class="t-title">Ghost hole</div>
        <div class="t-mono">${esc(c.hash.slice(0, 10))}</div>
        <div>${esc(c.author)} · <span class="t-mono">${c.date} · ${hh}</span>${c.night ? ' <span class="t-night">· night</span>' : ''}</div>
        <div class="t-dim">${c.files.length} file${c.files.length > 1 ? 's' : ''}, all to pages that no longer exist — a felt thud, never voiced.</div>`, mx, my);
    } else {
      const p = M.pages[hit.slug];
      showTip(`<div class="t-title">${esc(p.title)}</div>
        <div class="t-mono">${esc(c.hash.slice(0, 10))}</div>
        <div>${esc(c.author)} · <span class="t-mono">${c.date} · ${hh}</span>${c.night ? ' <span class="t-night">· night hole (22:00–06:00)</span>' : ''}</div>
        <div class="t-dim">${c.pages.length > 1 ? 'a chord across ' + c.pages.length + ' pages · ' : ''}click to read the page</div>`, mx, my);
    }
    CV.el.style.cursor = c.ghost ? 'help' : 'pointer';
    hoverInfo = hit;
    return;
  }
  const tr = keyAtPointer(mx, my);
  if (tr !== null) {
    const slug = M.tracks[tr];
    const p = M.pages[slug], pv = M.prov[slug], b = M.bands[M.bandOfTrack[tr]];
    showTip(`<div class="t-title">${esc(p.title)}</div>
      <div class="t-dim">engraved: ${esc(pv ? pv.topAuthor : '—')} · ink: ${esc(b.name)}${b.hub === slug ? ' · lead track' : ''}</div>
      <div class="t-dim">${fmtInt(M.graph.words[slug] || 0)} words · cited ${fmtInt(M.graph.inbound[slug] || 0)}× · ${pv ? fmtInt(pv.commits) + ' commits' : ''}</div>
      <div class="t-dim">click to open the Reading Roll</div>`, mx, my);
    CV.el.style.cursor = 'pointer';
    hoverInfo = { key: tr };
    return;
  }
  hoverInfo = null;
  CV.el.style.cursor = 'default';
  hideTip();
}
function onCanvasClick() {
  if (!hoverInfo) return;
  if (hoverInfo.key !== undefined) { openPage(M.tracks[hoverInfo.key]); return; }
  if (hoverInfo.slug) { openPage(hoverInfo.slug); return; }
  const c = hoverInfo.c;
  toast(`ghost hole ${c.hash.slice(0, 8)} · ${esc(c.author)} · ${c.date} ${String(c.hour).padStart(2, '0')}:00 — its pages are off the pressing`);
}

let toastTimer = 0;
function toast(html) {
  const el = $('toast');
  el.innerHTML = html;
  el.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.style.display = 'none'; }, 3200);
}

/* ============================================================
   THE READING ROLL
   ============================================================ */
const readStack = [];
let currentSlug = null;

function firstLineOf(slug) {
  if (M.firstLine[slug] !== undefined) return M.firstLine[slug];
  const p = M.pages[slug];
  let out = '';
  if (p) {
    for (const b of p.blocks || []) {
      if ((b.t === 'tldr' || b.t === 'p') && b.html) { out = stripTags(b.html); if (out) break; }
    }
    if (!out) out = p.description || '';
  }
  out = out.length > 170 ? out.slice(0, 167) + '…' : out;
  M.firstLine[slug] = out;
  return out;
}

function rewriteHref(h) {
  if (!h) return h;
  if (h.startsWith('#/')) return h;
  if (h.startsWith('/') && M.pages[h.split('#')[0]]) return '#' + h;
  return h;
}
function renderBlocks(blocks) {
  let out = '';
  for (const b of blocks || []) out += renderBlock(b);
  return out;
}
function renderBlock(b) {
  switch (b.t) {
    case 'tldr': return `<div class="tldr-block"><span class="tl-k">TL;DR</span>${b.html}</div>`;
    case 'p': return `<p>${b.html}</p>`;
    case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      return `<${b.t} id="${esc(b.id || '')}">${esc(b.text || '')}</${b.t}>`;
    case 'hr': return '<hr>';
    case 'badge': return `<span class="badge-chip" title="${esc(b.tooltip || '')}">${esc(b.label || b.kind || '')}</span>`;
    case 'img': {
      const src = b.light || b.dark || '';
      return `<img src="${esc(src)}" alt="${esc(b.alt || '')}" loading="lazy">` +
        (b.caption ? `<div class="img-cap">${esc(b.caption)}</div>` : '');
    }
    case 'code': {
      const code = (b.code || '').split('\n').filter(l => !/highlight-(start|end|next-line)/.test(l)).join('\n');
      return (b.title ? `<div class="code-title">${esc(b.title)}</div>` : '') +
        `<pre><code>${esc(code)}</code></pre>`;
    }
    case 'ul': return `<ul>${(b.items || []).map(i => `<li>${i}</li>`).join('')}</ul>`;
    case 'ol': return `<ol${b.start && b.start !== 1 ? ` start="${+b.start}"` : ''}>${(b.items || []).map(i => `<li>${i}</li>`).join('')}</ol>`;
    case 'table': {
      const head = (b.head || []).map(h => `<th>${h}</th>`).join('');
      const rows = (b.rows || []).map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
      return `<div class="tbl-wrap"><table>${head ? `<thead><tr>${head}</tr></thead>` : ''}<tbody>${rows}</tbody></table></div>`;
    }
    case 'admonition': {
      const kind = (b.kind || 'note').toLowerCase();
      return `<div class="admo ${esc(kind)}"><div class="admo-kind">${esc(b.title || kind)}</div>${renderBlocks(b.blocks)}</div>`;
    }
    case 'details':
      return `<details class="dtl"${b.id ? ` id="${esc(b.id)}"` : ''}><summary>${esc(b.summary || 'Details')}</summary>${renderBlocks(b.blocks)}</details>`;
    case 'tabs': {
      const id = 'tb' + Math.random().toString(36).slice(2, 8);
      const heads = (b.tabs || []).map((t, i) =>
        `<button role="tab" aria-selected="${i === 0}" data-tabs="${id}" data-i="${i}">${esc(t.label || t.value || ('tab ' + (i + 1)))}</button>`).join('');
      const panels = (b.tabs || []).map((t, i) =>
        `<div class="tabs-panel" data-tabspanel="${id}" data-i="${i}"${i === 0 ? '' : ' hidden'}>${renderBlocks(t.blocks)}</div>`).join('');
      return `<div class="tabs-block"><div class="tabs-head">${heads}</div>${panels}</div>`;
    }
    case 'cards':
      return `<div class="cards-grid">${(b.items || []).map(it =>
        `<a class="card-item" href="${esc(rewriteHref(it.link || '#'))}">
           <div class="ci-t">${it.icon ? esc(it.icon) + ' ' : ''}${esc(it.title || '')}</div>
           <div class="ci-d">${esc(it.desc || '')}</div></a>`).join('')}</div>`;
    case 'endpoint': {
      const params = (b.params || []).length
        ? `<div class="tbl-wrap"><table><thead><tr><th>${esc(b.paramTitle || 'Parameters')}</th><th>Type</th><th>Description</th></tr></thead><tbody>` +
          b.params.map(p => `<tr><td><code>${esc(p.name)}</code>${p.required ? ' *' : ''}</td><td><code>${esc(p.type || '')}</code></td><td>${p.desc || ''}</td></tr>`).join('') +
          '</tbody></table></div>'
        : '';
      return `<div class="endpoint-block"${b.id ? ` id="${esc(b.id)}"` : ''}>
        <div class="endpoint-head">${b.method ? `<span class="em">${esc(b.method)}</span>` : ''}<span class="ep">${esc(b.path || b.title || '')}</span></div>
        <div class="endpoint-body">${b.title && b.path ? `<b>${esc(b.title)}</b> — ` : ''}${b.description ? esc(b.description) : ''}${params}${renderBlocks(b.blocks)}</div></div>`;
    }
    case 'columns':
      return `<div class="cols-block">${(b.cols || []).map(c => `<div>${renderBlocks(c)}</div>`).join('')}</div>`;
    default:
      if (b.html) return `<div>${b.html}</div>`;
      return '';
  }
}

function renderPage(slug, anchor) {
  const p = M.pages[slug], pv = M.prov[slug];
  const paper = $('reading-paper');
  let html = `<h1 class="page-title">${esc(p.title)}</h1>`;
  if (p.description) html += `<div class="page-desc">${esc(p.description)}</div>`;
  if (pv) {
    html += `<div class="prov-plaque">
      <span><b>${fmtInt(pv.commits)}</b> commits</span>
      <span><b>${fmtInt(pv.authors.length)}</b> hand${pv.authors.length > 1 ? 's' : ''}</span>
      <span>first <b class="pp-d">${pv.first}</b></span>
      <span>last <b class="pp-d">${pv.last}</b></span>
      <span><b>${fmtInt(pv.careDays)}</b> care-days</span>
      <span><b>${fmtInt(pv.night)}</b> night edits</span>
      <span class="pp-authors">hands: ${pv.authors.map(esc).join(', ')} — engraved for ${esc(pv.topAuthor)}</span>
    </div>`;
  }
  html += renderBlocks(p.blocks);
  paper.innerHTML = html;
  /* mark citation hairlines */
  paper.querySelectorAll('a[href^="#/"]').forEach(a => {
    const dest = a.getAttribute('href').slice(1).split('#')[0];
    if (M.pages[dest]) { a.classList.add('x-cite'); a.dataset.cite = dest; }
  });
  /* external links in new tab */
  paper.querySelectorAll('a[href^="http"]').forEach(a => { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
  $('reading-title').textContent = p.title + '  ·  ' + slug;
  $('reading-back').style.visibility = readStack.length ? 'visible' : 'hidden';
  const sc = $('reading-scroll');
  sc.scrollTop = 0;
  if (anchor) {
    const el = paper.querySelector('#' + CSS.escape(anchor));
    if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' in Element.prototype ? 'auto' : 'auto' });
  }
}

function openPage(slug, anchor, opts) {
  opts = opts || {};
  if (!M.pages[slug]) { toast('no page at ' + esc(slug)); return; }
  const ov = $('reading-overlay');
  const wasOpen = ov.classList.contains('open');
  if (!wasOpen) {
    T.wasPlayingBeforeRead = T.playing;
    T.playing = false; setCrank();
  } else if (currentSlug && currentSlug !== slug && !opts.fromStack) {
    readStack.push(currentSlug);
  }
  currentSlug = slug;
  closeOverlay('index-overlay'); closeOverlay('programme-overlay');
  ov.classList.add('open');
  ov.style.display = 'flex';
  renderPage(slug, anchor);
  const want = '#/' + slug.replace(/^\//, '') + (anchor ? '#' + anchor : '');
  if (location.hash !== want && !opts.fromRoute) {
    suppressRoute = true;
    location.hash = want.slice(1);
    setTimeout(() => { suppressRoute = false; }, 0);
  }
  window.__diag.state = 'reading';
  requestRender();
}
function closeReading() {
  const ov = $('reading-overlay');
  if (!ov.classList.contains('open')) return;
  ov.classList.remove('open');
  ov.style.display = '';
  readStack.length = 0;
  currentSlug = null;
  hideCue();
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  if (T.wasPlayingBeforeRead && !REDUCED) { T.playing = true; setCrank(); }
  requestRender();
}

/* citation pre-cue: destination title + first line BEFORE you follow */
function showCue(a) {
  const dest = a.dataset.cite;
  if (!dest || !M.pages[dest]) return;
  const cc = $('cue-card');
  cc.innerHTML = `<div class="cc-t">${esc(M.pages[dest].title)}</div>
    <div class="cc-l">${esc(firstLineOf(dest))}</div>
    <div class="cc-hint">${esc(dest)} · click to follow</div>`;
  cc.style.display = 'block';
  const r = a.getBoundingClientRect();
  let x = r.left, y = r.bottom + 8;
  if (x + 370 > innerWidth) x = innerWidth - 375;
  if (y + 130 > innerHeight) y = r.top - cc.offsetHeight - 8;
  cc.style.left = Math.max(6, x) + 'px';
  cc.style.top = Math.max(6, y) + 'px';
}
function hideCue() { $('cue-card').style.display = 'none'; }

/* ============================================================
   TAB INDEX — plain titles, one keystroke, at any moment
   ============================================================ */
let idxRows = [], idxSel = 0, idxFiltered = [];
function buildIndex() {
  const list = $('index-list');
  const frag = document.createDocumentFragment();
  const slugs = (M.order || Object.keys(M.pages)).filter(s => M.pages[s]);
  for (const s of Object.keys(M.pages)) if (!slugs.includes(s)) slugs.push(s);
  slugs.forEach((slug) => {
    const p = M.pages[slug];
    const tr = M.trackOf[slug];
    const ink = tr !== undefined ? M.bands[M.bandOfTrack[tr]].ink : '#666';
    const btn = document.createElement('button');
    btn.className = 'idx-row';
    btn.dataset.slug = slug;
    btn.dataset.text = (p.title + ' ' + (p.sidebarLabel || '') + ' ' + slug).toLowerCase();
    btn.innerHTML = `<span class="ink" style="background:${ink}"></span><span class="ttl">${esc(p.title)}</span><span class="slg">${esc(slug)}</span>`;
    btn.addEventListener('click', () => { openPage(slug); });
    frag.appendChild(btn);
    idxRows.push(btn);
  });
  list.appendChild(frag);
  idxFiltered = idxRows.slice();
  $('index-count').textContent = fmtInt(idxRows.length) + ' pages';
}
function filterIndex(q) {
  q = q.trim().toLowerCase();
  idxFiltered = [];
  for (const r of idxRows) {
    const hit = !q || r.dataset.text.includes(q);
    r.style.display = hit ? '' : 'none';
    if (hit) idxFiltered.push(r);
  }
  idxSel = 0;
  updateIdxSel();
  $('index-count').textContent = fmtInt(idxFiltered.length) + ' / ' + fmtInt(idxRows.length) + ' pages';
}
function updateIdxSel() {
  idxRows.forEach(r => r.classList.remove('sel'));
  if (idxFiltered[idxSel]) {
    idxFiltered[idxSel].classList.add('sel');
    idxFiltered[idxSel].scrollIntoView({ block: 'nearest' });
  }
}
function toggleIndex(force) {
  const ov = $('index-overlay');
  const open = ov.classList.contains('open');
  const want = force !== undefined ? force : !open;
  if (want) {
    ov.classList.add('open');
    $('index-q').value = '';
    filterIndex('');
    setTimeout(() => $('index-q').focus(), 0);
  } else {
    ov.classList.remove('open');
  }
}
function closeOverlay(id) { $(id).classList.remove('open'); }

/* ============================================================
   PROGRAMME CARD — the set-list, every cue derived
   ============================================================ */
function buildProgramme() {
  const s = M.stats;
  $('prog-sub').textContent =
    `${s.firstCommit.date} → ${s.lastCommit.date} · ${fmtInt(s.totalWeeks)} weeks pressed at ${T.SEC_PER_WEEK} s per week · ` +
    `${fmtInt(s.words)} words · ${fmtInt(s.edges)} citations`;
  const mv = [];
  mv.push({
    n: 'I', t: 'Ghost overture', day: T.epochDay,
    d: `${fmtInt(s.ghostBeforeFirstVoice)} recordings before the first voice — every one to pages that no longer exist. The machine plays felt thuds from ${s.firstCommit.date}.`,
  });
  mv.push({
    n: 'II', t: 'First voice', day: s.firstVoiceable.day - 4,
    d: `${s.firstVoiceable.date} · ${s.firstVoiceable.author} punches ${fmtInt(s.firstVoiceable.pages.length)} pages still on the instrument — the oldest living note is ${s.firstVoiceable.pages[0]}.`,
  });
  mv.push({
    n: 'III', t: 'The long rest', day: dayNum(s.gap.from) - 7,
    d: `${fmtInt(s.gap.days)} silent days, ${s.gap.from} → ${s.gap.to}. The paper runs visibly blank — the longest fermata on the roll.`,
  });
  mv.push({
    n: 'IV', t: 'The Great Retuning', day: s.retuning.day - 4,
    d: `${s.retuning.date} · one commit (${s.retuning.hash.slice(0, 8)}) pierces ${fmtInt(s.retuning.pages.length)} living pages at once — ${s.retuningHands === 1 ? 'one hand' : s.retuningHands + ' hands'}: ${s.retuning.author}. The widest chord the instrument can play.`,
  });
  if (s.firstNight) mv.push({
    n: 'V', t: 'Night watch', day: s.firstNight.day - 4,
    d: `${fmtInt(s.nightVoiceable)} blue holes — night on this roll: commits punched between 22:00 and 06:00. ${fmtInt(s.threeAm)} of them fall at 03:00.`,
  });
  mv.push({
    n: 'VI', t: 'Run-off', day: T.lastDay - 14,
    d: `The last hole is dated ${s.lastCommit.date}; then the paper simply runs off the spool, blank ahead. The song is still being written.`,
  });
  $('prog-movements').innerHTML = mv.map((m, i) =>
    `<div class="mv"><span class="mv-n">${m.n}</span>
      <span class="mv-t"><b>${esc(m.t)}</b><span class="d">${m.d}</span></span>
      <button class="cue" data-day="${m.day}">Cue</button></div>`).join('');
  $('prog-note1').innerHTML = `<b>Ghost holes</b> are commits to pages that no longer exist — ${fmtInt(s.ghost)} of the ${fmtInt(s.total)} recordings. They stay on the pressing as pitch-less felt thuds in the grey lane, so the roll runs epoch-honest from ${s.firstCommit.date}.`;
  $('prog-note2').innerHTML = `<b>Night on this roll</b>: commits punched between 22:00 and 06:00 (${fmtInt(s.nightVoiceable)} voiceable blue holes). The provenance plaques inside the Reading Roll count a different night — per-page night edits.`;
  $('prog-note3').innerHTML = `Voicing: pitch is the key's position in its ink band; loudness is how often the page is cited (${fmtInt(s.maxInbound)}× at most); sustain is its word count; ghost thuds carry no pitch at all. ${fmtInt(s.offPressingCommits)} recordings by ${fmtInt(s.offPressingHands)} further hands touch only vanished pages.`;
  $('prog-movements').addEventListener('click', (e) => {
    const b = e.target.closest('.cue');
    if (!b) return;
    seekTo(tAtDay(+b.dataset.day));
    closeOverlay('programme-overlay');
    if (!REDUCED) { T.playing = true; setCrank(); dismissWelcome(); }
    requestRender();
  });
}

/* ============================================================
   CREDITS — after the last hole runs off the spool
   ============================================================ */
let creditsRolling = false, creditsY = 0;
function showCredits() {
  T.creditsShown = true;
  const s = M.stats;
  const inner = $('credits-inner');
  let html = `<h3>The hands</h3>
    <div class="cr-def">${fmtInt(s.hands)} hands · commits counted from this roll's log · care-days span a hand's first to last recording</div>`;
  for (const h of M.hands) {
    html += `<div class="cr-row"><span class="cr-name">${esc(h.name)}</span>
      <span class="cr-stat">${fmtInt(h.commits)} commit${h.commits > 1 ? 's' : ''} · ${fmtInt(h.careDays)} care-day${h.careDays === 1 ? '' : 's'}</span></div>`;
  }
  html += `<div class="cr-end">…and ${fmtInt(s.offPressingHands)} more hands whose ${fmtInt(s.offPressingCommits)} recordings touch only pages that no longer exist.<br><br>
    The last hole is dated ${s.lastCommit.date}. The paper runs off the spool, blank ahead.<br>The song is still being written.
    <span class="engraved">— the pressing of ${fmtInt(s.total)} recordings, ${s.firstCommit.date} → ${s.lastCommit.date} —</span></div>
    <p style="margin-bottom:80px"><button class="mast-btn" id="roll-again">Roll again from the leader</button></p>`;
  inner.innerHTML = html;
  const ov = $('credits-overlay');
  ov.classList.add('open');
  if (REDUCED) { ov.classList.add('static'); creditsRolling = false; }
  else { ov.classList.remove('static'); creditsY = -($('credits-scroll').clientHeight) * 0.9; creditsRolling = true; }
  inner.style.top = REDUCED ? '' : (-creditsY) + 'px';
  $('roll-again').addEventListener('click', () => {
    hideCredits();
    seekTo(0);
    if (!REDUCED) { T.playing = true; setCrank(); }
  });
  window.__diag.state = 'credits';
  requestRender();
}
function rollCredits(dt) {
  creditsY += dt * 0.028;
  const inner = $('credits-inner');
  const max = inner.offsetHeight + 40 - $('credits-scroll').clientHeight;
  if (creditsY > max) { creditsY = max; creditsRolling = false; }
  inner.style.top = (-creditsY) + 'px';
}
function hideCredits() {
  $('credits-overlay').classList.remove('open');
  creditsRolling = false;
  requestRender();
}

/* ============================================================
   ROUTING  (#/slug and #/slug#anchor)
   ============================================================ */
let suppressRoute = false;
function routeFromHash(initial) {
  if (suppressRoute) return;
  const h = decodeURIComponent(location.hash || '');
  if (h.startsWith('#/')) {
    const rest = h.slice(1); // '/cms/x' or '/cms/x#anchor'
    const parts = rest.split('#');
    const slug = parts[0], anchor = parts[1] || null;
    if (M.pages[slug]) { openPage(slug, anchor, { fromRoute: true }); return; }
  }
  if (!initial) closeReading();
}

/* ============================================================
   CONTROLS
   ============================================================ */
function setCrank() {
  const c = $('crank');
  if (REDUCED) { c.classList.remove('turning'); $('crank-label').textContent = 'Step week'; return; }
  c.classList.toggle('turning', T.playing);
  $('crank-label').textContent = T.playing ? 'Playing' : (T.t > 0 ? 'Resume' : 'Wind');
}
function dismissWelcome() {
  const w = $('welcome-plate');
  if (w && !w.classList.contains('gone')) { w.classList.add('gone'); setTimeout(() => w.remove(), 900); }
}
let scrubbing = false;

function wireEvents() {
  $('crank').addEventListener('click', () => {
    dismissWelcome();
    if (REDUCED) { // calm variant: one week per step, rendered on demand
      T.t = Math.min(T.t + T.SEC_PER_WEEK * 1000, tAtDay(T.endDay));
      const wall = performance.now();
      const n = nowDay();
      let fired = 0;
      while (T.ptr < M.commits.length && M.commits[T.ptr].day <= n) { fireEvent(M.commits[T.ptr], Snd.enabled && fired < 6, wall); T.ptr++; fired++; }
      if (n >= T.endDay && !T.creditsShown) showCredits();
      updateOdometer(n);
      requestRender();
      return;
    }
    T.playing = !T.playing;
    setCrank();
    requestRender();
  });
  $('btn-speed').addEventListener('click', (e) => {
    T.speed = T.speed === 1 ? 2 : 1;
    e.currentTarget.setAttribute('aria-pressed', T.speed === 2 ? 'true' : 'false');
    lsSet('pianola-speed', String(T.speed));
  });
  const savedSpeed = lsGet('pianola-speed');
  if (savedSpeed === '2') { T.speed = 2; $('btn-speed').setAttribute('aria-pressed', 'true'); }

  $('scrub').addEventListener('input', (e) => {
    scrubbing = true;
    const frac = +e.target.value / 10000;
    seekTo(tAtDay(T.epochDay + frac * (T.endDay - T.epochDay)));
    dismissWelcome();
    scrubbing = false;
  });

  /* the voice is armed by default; the context is born on the first gesture */
  let voiceArmed = true;
  const voiceLabel = () => {
    const b = $('btn-voice');
    b.textContent = voiceArmed ? (Snd.enabled ? 'Voice: sounding' : 'Voice: armed') : 'Voice: silent';
    b.setAttribute('aria-pressed', String(voiceArmed));
  };
  const wakeVoice = async () => {
    if (!voiceArmed || Snd.enabled) return;
    await Snd.enable();
    voiceLabel();
    toast('felt piano awake — pitch is the page\'s key, loudness its citations, sustain its words');
  };
  document.addEventListener('pointerdown', wakeVoice, { capture: true });
  document.addEventListener('keydown', wakeVoice, { capture: true });
  voiceLabel();

  $('btn-voice').addEventListener('click', async () => {
    voiceArmed = !voiceArmed;
    if (voiceArmed) { await Snd.enable(); }
    else if (Snd.enabled) { Snd.disable(); }
    voiceLabel();
  });

  $('btn-index').addEventListener('click', () => toggleIndex());
  $('index-close').addEventListener('click', () => toggleIndex(false));
  $('btn-programme').addEventListener('click', () => { $('programme-overlay').classList.add('open'); });
  $('programme-close').addEventListener('click', () => closeOverlay('programme-overlay'));
  $('reading-close').addEventListener('click', closeReading);
  $('reading-back').addEventListener('click', () => {
    const prev = readStack.pop();
    if (prev) openPage(prev, null, { fromStack: true });
  });
  $('credits-close').addEventListener('click', hideCredits);

  $('index-q').addEventListener('input', (e) => filterIndex(e.target.value));
  $('index-q').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && idxFiltered[idxSel]) { openPage(idxFiltered[idxSel].dataset.slug); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); idxSel = Math.min(idxSel + 1, idxFiltered.length - 1); updateIdxSel(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); idxSel = Math.max(idxSel - 1, 0); updateIdxSel(); }
  });

  /* overlay backdrop click closes */
  $('index-overlay').addEventListener('click', (e) => { if (e.target.id === 'index-overlay') toggleIndex(false); });
  $('programme-overlay').addEventListener('click', (e) => { if (e.target.id === 'programme-overlay') closeOverlay('programme-overlay'); });

  /* reading paper delegation: internal links + tabs + cue cards */
  const paper = $('reading-paper');
  paper.addEventListener('click', (e) => {
    const tb = e.target.closest('button[data-tabs]');
    if (tb) {
      const id = tb.dataset.tabs, i = tb.dataset.i;
      paper.querySelectorAll(`button[data-tabs="${id}"]`).forEach(b => b.setAttribute('aria-selected', b.dataset.i === i ? 'true' : 'false'));
      paper.querySelectorAll(`[data-tabspanel="${id}"]`).forEach(p => { p.hidden = p.dataset.i !== i; });
      return;
    }
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#/')) {
      e.preventDefault();
      hideCue();
      const parts = href.slice(1).split('#');
      openPage(parts[0], parts[1] || null);
    } else if (href.startsWith('#')) {
      e.preventDefault();
      const el = paper.querySelector('#' + CSS.escape(href.slice(1)));
      if (el) el.scrollIntoView({ block: 'start' });
    }
  });
  paper.addEventListener('mouseover', (e) => { const a = e.target.closest('a.x-cite'); if (a) showCue(a); });
  paper.addEventListener('mouseout', (e) => { if (e.target.closest('a.x-cite')) hideCue(); });
  paper.addEventListener('focusin', (e) => { const a = e.target.closest('a.x-cite'); if (a) showCue(a); });
  paper.addEventListener('focusout', () => hideCue());

  /* canvas */
  CV.el.addEventListener('mousemove', onCanvasMove);
  CV.el.addEventListener('mouseleave', () => { hideTip(); hoverInfo = null; });
  CV.el.addEventListener('click', onCanvasClick);

  /* keyboard */
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      toggleIndex();
      return;
    }
    if (e.key === 'Escape') {
      if ($('credits-overlay').classList.contains('open')) { hideCredits(); return; }
      if ($('index-overlay').classList.contains('open')) { toggleIndex(false); return; }
      if ($('programme-overlay').classList.contains('open')) { closeOverlay('programme-overlay'); return; }
      if ($('reading-overlay').classList.contains('open')) { closeReading(); return; }
      return;
    }
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === ' ') { e.preventDefault(); $('crank').click(); }
    else if (e.key === 'ArrowRight') { seekTo(T.t + T.SEC_PER_WEEK * 1000); }
    else if (e.key === 'ArrowLeft') { seekTo(T.t - T.SEC_PER_WEEK * 1000); }
    else if (e.key === '1') { T.speed = 1; $('btn-speed').setAttribute('aria-pressed', 'false'); }
    else if (e.key === '2') { T.speed = 2; $('btn-speed').setAttribute('aria-pressed', 'true'); }
    else if (e.key.toLowerCase() === 'm') { $('btn-voice').click(); }
  });

  window.addEventListener('hashchange', () => routeFromHash(false));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) requestRender(); });
}

/* ============================================================
   QA / headless hooks — deterministic transport clock
   ============================================================ */
window.__pianola = {
  step(ms) { // advance the deterministic clock without wall time
    const wall = performance.now();
    T.t += ms;
    const n = nowDay();
    while (T.ptr < M.commits.length && M.commits[T.ptr].day <= n) { fireEvent(M.commits[T.ptr], false, wall); T.ptr++; }
    updateOdometer(n);
    drawFrame(wall);
  },
  seekDay(d) { seekTo(tAtDay(d)); },
  play() { T.playing = true; setCrank(); dismissWelcome(); requestRender(); },
  pause() { T.playing = false; setCrank(); },
  stats() { return M.stats; },
  state() { return { t: T.t, day: nowDay(), ptr: T.ptr, playing: T.playing, retuned: T.retuned }; },
};

boot().catch(err => {
  console.error(err);
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:20px;color:#EDE3CB;font:14px monospace;z-index:999';
  el.textContent = 'The pressing failed to load: ' + err.message;
  document.body.appendChild(el);
});
