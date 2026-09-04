/* THE PROJECTIONIST — an all-night picture house for the Strapi documentation.
   Every visible number derives from content.json / graph.json / communities.json /
   provenance.json / gitlog-docs.txt at boot. Nothing is hardcoded. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * storage (always in try/catch)                                       *
   * ------------------------------------------------------------------ */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('proj.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('proj.' + k, JSON.stringify(v)); } catch (e) { /* dark house */ } }
  };

  const REDUCED = (function () {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  })();

  /* ------------------------------------------------------------------ *
   * diag — exposed every frame                                          *
   * ------------------------------------------------------------------ */
  const diag = { frameMs: 0, avgFrameMs: 0, state: 'boot', ring: [] };
  window.__diag = diag;
  let diagSum = 0, diagN = 0;

  /* ------------------------------------------------------------------ *
   * data + derived model                                                *
   * ------------------------------------------------------------------ */
  const D = {};      // raw data files
  const M = {        // derived model
    reels: {},       // slug -> reel model
    outEdges: {},    // slug -> [{to, edgeIdx}]
    shorts: [],      // 27 programme shorts
    unfiled: [],     // pages in no community
    order: [],       // canonical order
    hands: [],       // all archive authors (from provenance)
    gap: null,       // longest silence {days, from, to}
    years: '',       // shooting years from gitlog
    corpusWords: 0, frameTotal: 0, spliceTotal: 0, reelTotal: 0,
    nightTotal: 0, commitsByAuthor: {}
  };

  const S = {        // projector state
    state: 'lobby',  // lobby | title | play | credits | end | intermission | shortcard
    slug: null, frame: 0, elapsed: 0,
    paused: false, speedMode: store.get('speed', 1), // 0.5 | 1 | 2 | 'hold'
    heldLong: false, autoRide: store.get('autoride', false),
    ridden: new Set(store.get('ridden', [])),
    queue: null, queuePos: 0,          // programme queue
    pendingFrame: null,                 // frame index awaiting DOM swap
    lightRender: false,                 // scrub in progress -> light frames
    titleT: 0, credT: 0, credH: 0, interT: 0,
    lastStamp: null, stampT: 0,
    scrub: null, dust: [], dustN: 0,
    suppressHash: false, lastTs: 0, sound: true /* owner: sound on by default; context still starts on first gesture */, audio: null
  };
  if (REDUCED) S.speedMode = 'hold';

  /* ------------------------------------------------------------------ *
   * helpers                                                             *
   * ------------------------------------------------------------------ */
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html !== undefined) n.innerHTML = html; return n; };
  const fmtInt = (n) => n.toLocaleString('en-US');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function fmtRuntime(words) { // 200 wpm, honest
    const sec = Math.round(words / 200 * 60);
    let h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) { // round to nearest minute on the marquee scale
      m = Math.round((sec % 3600) / 60);
      if (m === 60) { h++; m = 0; }
      return h + ' H ' + m + ' M';
    }
    if (m > 0) return m + ' M ' + String(s).padStart(2, '0') + ' S';
    return s + ' S';
  }

  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mulberry(seed) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function stripTags(html) {
    return String(html).replace(/<[^>]*>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&hellip;/g, '…')
      .replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function blockText(b) { // plain text of one block (for search + word counts)
    let out = [];
    (function walk(x) {
      if (!x) return;
      if (Array.isArray(x)) { x.forEach(walk); return; }
      if (typeof x !== 'object') return;
      if (x.html) out.push(stripTags(x.html));
      if (x.text) out.push(stripTags(x.text));
      if (x.code) out.push(String(x.code));
      if (x.title && typeof x.title === 'string') out.push(x.title);
      if (x.summary) out.push(stripTags(x.summary));
      if (x.description) out.push(stripTags(x.description));
      if (x.label) out.push(String(x.label));
      if (x.alt) out.push(String(x.alt));
      if (x.caption) out.push(String(x.caption));
      if (x.path) out.push(String(x.path));
      if (x.desc) out.push(stripTags(x.desc));
      if (x.name) out.push(String(x.name));
      if (x.body) out.push(String(x.body));
      if (x.items) x.items.forEach(it => { if (typeof it === 'string') out.push(stripTags(it)); else walk(it); });
      if (x.head) x.head.forEach(h => out.push(stripTags(h)));
      if (x.rows) x.rows.forEach(r => r.forEach(c => out.push(stripTags(c))));
      if (x.blocks) walk(x.blocks);
      if (x.tabs) walk(x.tabs);
      if (x.cols) x.cols.forEach(walk);
      if (x.params) walk(x.params);
      if (x.codeTabs) walk(x.codeTabs);
      if (x.responses) walk(x.responses);
    })(b);
    return out.join(' ');
  }

  /* ------------------------------------------------------------------ *
   * boot: fetch, derive, build                                          *
   * ------------------------------------------------------------------ */
  Promise.all([
    fetch('content.json').then(r => r.json()),
    fetch('graph.json').then(r => r.json()),
    fetch('communities.json').then(r => r.json()),
    fetch('provenance.json').then(r => r.json()),
    fetch('gitlog-docs.txt').then(r => r.text())
  ]).then(([content, graph, communities, provenance, gitlog]) => {
    D.content = content; D.graph = graph; D.communities = communities;
    D.provenance = provenance; D.gitlog = gitlog;
    buildModel();
    buildStatic();
    bind();
    requestAnimationFrame(tick);
    const h = parseHash(location.hash);
    if (h && D.content.pages[h.slug]) { thread(h.slug, { anchor: h.anchor }); }
    else showLobby();
  }).catch(err => {
    const be = $('bootError'); be.hidden = false;
    be.textContent = 'The projector jammed while loading the archive: ' + err.message;
  });

  function buildModel() {
    const pages = D.content.pages;
    const slugs = Object.keys(pages);
    M.order = D.content.order.filter(s => pages[s]);
    slugs.forEach(s => { if (M.order.indexOf(s) < 0) M.order.push(s); });
    M.reelTotal = slugs.length;

    // corpus words + runtime
    M.corpusWords = 0;
    for (const k in D.graph.words) M.corpusWords += D.graph.words[k];

    // hands (union of provenance authors)
    const hands = new Set();
    M.nightTotal = 0;
    for (const k in D.provenance) { D.provenance[k].authors.forEach(a => hands.add(a)); M.nightTotal += D.provenance[k].night; }
    M.hands = [...hands].sort();

    // gitlog: commits per author, date range, longest silence
    const lines = D.gitlog.split('\n');
    const dates = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('C|')) {
        const p = lines[i].split('|'); // C|hash|author|date|hour
        dates.push(p[3]);
        M.commitsByAuthor[p[2]] = (M.commitsByAuthor[p[2]] || 0) + 1;
      }
    }
    const uniq = [...new Set(dates)].sort();
    M.years = uniq[0].slice(0, 4) + '–' + uniq[uniq.length - 1].slice(0, 4);
    let best = 0, a = null, b = null;
    for (let i = 1; i < uniq.length; i++) {
      const d = Math.round((Date.parse(uniq[i]) - Date.parse(uniq[i - 1])) / 86400000);
      if (d > best) { best = d; a = uniq[i - 1]; b = uniq[i]; }
    }
    M.gap = { days: best, from: a, to: b };

    // outbound edges grouped by source (edgeIdx = position in the join book)
    M.spliceTotal = D.graph.edges.length;
    D.graph.edges.forEach(([from, to], i) => {
      (M.outEdges[from] = M.outEdges[from] || []).push({ to, edgeIdx: i });
    });

    // per-reel model
    M.frameTotal = 0;
    for (const slug of slugs) {
      const pg = pages[slug];
      const prov = D.provenance[slug] || { commits: 0, authors: [], topAuthor: '', first: '', last: '', night: 0, careDays: 0 };
      const words = D.graph.words[slug] || 0;
      const n = pg.blocks.length;
      M.frameTotal += n;

      const raw = pg.blocks.map(b => JSON.stringify(b));
      const text = pg.blocks.map(b => blockText(b));
      const wRaw = text.map(t => Math.max(6, t ? t.split(/\s+/).length : 0));
      const wSum = wRaw.reduce((x, y) => x + y, 0);
      const totalSec = Math.max(words, 1) / 200 * 60;
      const baseSec = wRaw.map(w => Math.max(0.8, w / wSum * totalSec));

      // splices written into this reel, at the block where the href sits
      const splices = [];
      for (const e of (M.outEdges[slug] || [])) {
        let fi = -1, anchor = null;
        const needle = '#' + e.to;
        for (let i = 0; i < n && fi < 0; i++) {
          const s = raw[i]; let pos = 0;
          while (true) {
            const j = s.indexOf(needle, pos);
            if (j < 0) break;
            const after = s[j + needle.length];
            if (after === undefined || !/[A-Za-z0-9\-_./]/.test(after) || after === '#') {
              fi = i;
              if (after === '#') { const m = /^#([A-Za-z0-9\-_]+)/.exec(s.slice(j + needle.length)); if (m) anchor = m[1]; }
              break;
            }
            pos = j + 1;
          }
        }
        splices.push({ to: e.to, edgeIdx: e.edgeIdx, frame: fi < 0 ? 0 : fi, anchor });
      }
      splices.sort((x, y) => x.frame - y.frame);
      const spliceAt = {}; splices.forEach(sp => { (spliceAt[sp.frame] = spliceAt[sp.frame] || []).push(sp); });

      // burnt frames: night edits scattered deterministically across the reel
      const burnt = new Set();
      if (prov.night > 0 && n > 0) {
        const rnd = mulberry(hashStr(slug));
        while (burnt.size < Math.min(prov.night, n)) burnt.add(Math.floor(rnd() * n));
      }

      // gate-hold rules for extreme frames
      const hold = pg.blocks.map((b, i) => {
        const codeLines = (raw[i].match(/\\n/g) || []).length;
        if ((b.t === 'code' || b.t === 'endpoint' || b.t === 'tabs') && codeLines > 22) return true;
        if (b.t === 'table' && b.rows && b.rows.length > 12) return true;
        if (baseSec[i] > 45) return true;
        return false;
      });

      M.reels[slug] = {
        slug, title: pg.title, section: pg.section || '', product: pg.product || '',
        description: pg.description || '', n, words, prov,
        runtime: fmtRuntime(words), text, baseSec, splices, spliceAt,
        burnt, hold,
        inbound: D.graph.inbound[slug] || 0,
        heavy: text.map((t, i) => t.length > 3500 || (raw[i].length > 6000))
      };
    }

    // the 27 shorts — deterministic, loop-free: hub first, then members by inbound desc, slug asc
    M.shorts = D.communities.map((c, i) => {
      const members = c.members.filter(m => pages[m]);
      const rest = members.filter(m => m !== c.hub)
        .sort((x, y) => (D.graph.inbound[y] || 0) - (D.graph.inbound[x] || 0) || (x < y ? -1 : 1));
      const orderS = (pages[c.hub] ? [c.hub] : []).concat(rest);
      const w = orderS.reduce((t, m) => t + (D.graph.words[m] || 0), 0);
      return {
        idx: i, hub: c.hub, dominant: c.dominant, size: c.size, purity: c.purity,
        order: orderS, words: w, runtime: fmtRuntime(w),
        title: pages[c.hub] ? shortTitle(pages[c.hub].title) : c.hub,
        isMigration: /breaking-changes$/.test(c.hub)
      };
    });
    const filed = new Set(); D.communities.forEach(c => c.members.forEach(m => filed.add(m)));
    M.unfiled = slugs.filter(s => !filed.has(s)).sort();

    // dust field for the beam (positions fixed; count varies per reel)
    const rnd = mulberry(20260904);
    for (let i = 0; i < 160; i++) S.dust.push({ u: rnd(), v: rnd(), s: 0.4 + rnd() * 1.2, p: rnd() });
  }

  function shortTitle(t) {
    return t.replace(/\s*[-|–—]\s*Strapi.*$/i, '').replace(/\s*\|\s*Strapi.*$/i, '');
  }

  /* ------------------------------------------------------------------ *
   * static UI: marquee, lobby, overlays                                 *
   * ------------------------------------------------------------------ */
  function buildStatic() {
    $('marqueeText').textContent =
      'NOW SHOWING: THE STRAPI DOCUMENTATION — RUNTIME ' + fmtRuntime(M.corpusWords) +
      ' — A FILM BY ' + M.hands.length + ' HANDS — ' + M.years;

    // lobby
    const lb = $('lobby');
    lb.innerHTML = '';
    const card = el('div', 'lobby-card');
    card.appendChild(el('div', 'lobby-over', 'DUSK WORKS PICTURES PRESENTS'));
    card.appendChild(el('div', 'lobby-title', 'THE PROJECTIONIST'));
    card.appendChild(el('div', 'lobby-sub', 'THE STRAPI DOCUMENTATION, SCREENED WHOLE'));
    card.appendChild(el('div', 'lobby-plate',
      fmtInt(M.reelTotal) + ' REELS · ' + fmtInt(M.frameTotal) + ' FRAMES · ' + fmtInt(M.spliceTotal) + ' SPLICES<br>' +
      'RUNTIME ' + fmtRuntime(M.corpusWords) + ' AT 200 WPM · ' + M.hands.length + ' HANDS · SHOT ' + M.years + '<br>' +
      M.shorts.length + ' SHORTS ON THE PROGRAMME · ' + M.nightTotal + ' BURNT FRAMES · THE ' + M.gap.days + '-DAY SILENCE, STAGED'));
    const acts = el('div', 'lobby-actions');
    const b1 = el('button', 'primary', 'THREAD THE FIRST REEL'); b1.id = 'threadFirst';
    b1.onclick = () => { const s = D.content.pages['/cms/intro'] ? '/cms/intro' : M.order[0]; dimAndThread(s); };
    const b2 = el('button', '', 'TONIGHT’S PROGRAMME'); b2.onclick = () => toggleOverlay('programmeOverlay', true);
    const b3 = el('button', '', 'THE RACK'); b3.onclick = () => toggleOverlay('rackOverlay', true);
    const b4 = el('button', '', 'INDEX'); b4.onclick = () => toggleOverlay('indexOverlay', true);
    acts.append(b1, b2, b3, b4);
    card.appendChild(acts);
    card.appendChild(el('div', 'lobby-pianola', 'The making of these pictures plays nightly at The Pianola.'));
    lb.appendChild(card);

    // rack: shelves by community + unfiled
    const shelves = $('rackShelves'); shelves.innerHTML = '';
    M.shorts.forEach(sh => {
      const s = el('div', 'shelf');
      s.appendChild(el('div', 'shelf-label',
        'SHORT No. ' + (sh.idx + 1) + ' · ' + esc(sh.title.toUpperCase()) + ' · ' + sh.dominant.toUpperCase() +
        ' · ' + sh.size + ' REELS · PURITY ' + sh.purity.toFixed(2)));
      const row = el('div', 'shelf-reels');
      sh.order.forEach(slug => row.appendChild(canisterEl(slug)));
      s.appendChild(row); shelves.appendChild(s);
    });
    if (M.unfiled.length) {
      const s = el('div', 'shelf');
      s.appendChild(el('div', 'shelf-label', 'UNFILED · ' + M.unfiled.length + ' REELS OUTSIDE THE ' + M.shorts.length + ' COMMUNITIES'));
      const row = el('div', 'shelf-reels');
      M.unfiled.forEach(slug => row.appendChild(canisterEl(slug)));
      s.appendChild(row); shelves.appendChild(s);
    }

    // programme grid
    const grid = $('programmeGrid'); grid.innerHTML = '';
    const all = el('div', 'poster screenall');
    all.appendChild(el('div', 'po-num', 'FULL BILL'));
    all.appendChild(el('div', 'po-title', 'SCREEN ALL ' + M.shorts.length + ' SHORTS'));
    all.appendChild(el('div', 'po-meta', 'WITH THE ' + M.gap.days + '-DAY SILENCE BETWEEN SHORTS · ' + fmtRuntime(M.corpusWords)));
    all.onclick = () => playProgramme(null);
    grid.appendChild(all);
    M.shorts.forEach(sh => {
      const p = el('div', 'poster');
      p.appendChild(el('div', 'po-num', 'SHORT No. ' + (sh.idx + 1)));
      p.appendChild(el('div', 'po-title', esc(sh.title)));
      p.appendChild(el('div', 'po-meta', sh.dominant.toUpperCase() + ' · ' + sh.size + ' REELS · PURITY ' + sh.purity.toFixed(2) + ' · ' + sh.runtime));
      if (sh.isMigration) {
        p.appendChild(el('div', 'po-bill', 'OPENS ON BREAKING CHANGES — THE PICTURE EVERY OTHER PICTURE CUTS TO · ' +
          (D.graph.inbound[sh.hub] || 0) + ' INBOUND SPLICES'));
      } else {
        p.appendChild(el('div', 'po-bill', 'OPENS ON ' + esc(shortTitle(D.content.pages[sh.hub].title).toUpperCase()) +
          ' · ' + (D.graph.inbound[sh.hub] || 0) + ' INBOUND SPLICES'));
      }
      p.onclick = () => playProgramme(sh.idx);
      grid.appendChild(p);
    });

    // full-archive credits
    $('creditsAllTitle').textContent = 'FULL-ARCHIVE CREDITS — ' + M.hands.length + ' HANDS, ' + M.years;
    const list = $('creditsAllList'); list.innerHTML = '';
    const reelsBy = {};
    for (const k in D.provenance) D.provenance[k].authors.forEach(a2 => { reelsBy[a2] = (reelsBy[a2] || 0) + 1; });
    M.hands.slice().sort((x, y) => (reelsBy[y] || 0) - (reelsBy[x] || 0) || (x < y ? -1 : 1)).forEach(name => {
      const r = el('div', 'ca-row');
      r.appendChild(el('span', '', esc(name)));
      const c = M.commitsByAuthor[name];
      r.appendChild(el('span', 'ca-meta', (reelsBy[name] || 0) + ' REELS KEPT' + (c ? ' · ' + c + ' COMMITS' : '')));
      list.appendChild(r);
    });

    // plain-title index (all 290, no query)
    renderSearch('');
  }

  function canisterEl(slug) {
    const r = M.reels[slug];
    const c = el('div', 'canister');
    c.appendChild(el('div', 'cn-title', esc(shortTitle(r.title))));
    const burn = r.prov.night > 0 ? ' · <span class="burn">' + r.prov.night + ' BURNT</span>' : '';
    c.appendChild(el('div', 'cn-meta',
      r.runtime + ' · ' + r.n + ' FR · ' + r.prov.careDays + ' D CARE · ' + r.prov.commits + ' REPAIRS' + burn));
    c.onclick = () => { closeOverlays(); thread(slug); };
    return c;
  }

  /* ------------------------------------------------------------------ *
   * search / index                                                      *
   * ------------------------------------------------------------------ */
  function renderSearch(q) {
    const box = $('searchResults'); box.innerHTML = '';
    q = q.trim().toLowerCase();
    const frag = document.createDocumentFragment();
    let count = 0;
    const rows = [];
    if (!q) {
      M.order.slice().sort((a, b2) => (M.reels[a].title < M.reels[b2].title ? -1 : 1)).forEach(slug => rows.push({ slug }));
    } else {
      for (const slug of M.order) {
        const r = M.reels[slug];
        if (r.title.toLowerCase().includes(q) || slug.includes(q)) rows.push({ slug });
      }
      if (q.length >= 3) {
        outer: for (const slug of M.order) {
          const r = M.reels[slug];
          for (let i = 0; i < r.n; i++) {
            const t = r.text[i].toLowerCase();
            const j = t.indexOf(q);
            if (j >= 0) {
              rows.push({ slug, frame: i, snip: r.text[i].slice(Math.max(0, j - 40), j + 60) });
              if (rows.length > 160) break outer;
            }
          }
        }
      }
    }
    for (const row of rows) {
      if (count++ > 400) break; /* all 290 titles fit; frame hits are capped upstream */
      const r = M.reels[row.slug];
      const d = el('div', 'idx-row' + (row.frame !== undefined ? ' idx-frame' : ''));
      if (row.frame !== undefined) {
        d.appendChild(el('span', 'idx-title', '→ frame ' + (row.frame + 1) + ': …' +
          esc(row.snip).replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'i'), '<b>$1</b>') + '…'));
        d.appendChild(el('span', 'idx-meta', esc(shortTitle(r.title))));
      } else {
        d.appendChild(el('span', 'idx-title', esc(shortTitle(r.title))));
        d.appendChild(el('span', 'idx-meta', r.runtime + ' · ' + r.n + ' FRAMES · ' + esc(row.slug)));
      }
      d.onclick = () => { closeOverlays(); thread(row.slug, { frame: row.frame }); };
      frag.appendChild(d);
    }
    if (!rows.length) frag.appendChild(el('div', 'idx-row', '<span class="idx-title">Nothing in the join book under that name.</span>'));
    box.appendChild(frag);
  }

  /* ------------------------------------------------------------------ *
   * routing                                                             *
   * ------------------------------------------------------------------ */
  function parseHash(h) {
    if (!h || h.length < 3 || h[1] !== '/') return null;
    let s = h.slice(1), anchor = null;
    const j = s.indexOf('#');
    if (j >= 0) { anchor = s.slice(j + 1); s = s.slice(0, j); }
    return { slug: s, anchor };
  }
  window.addEventListener('hashchange', () => {
    if (S.suppressHash) { S.suppressHash = false; return; }
    const h = parseHash(location.hash);
    if (h && D.content.pages[h.slug]) thread(h.slug, { anchor: h.anchor });
  });
  function setHash(slug) {
    if (location.hash !== '#' + slug) { S.suppressHash = true; location.hash = '#' + slug; }
  }

  /* ------------------------------------------------------------------ *
   * threading, playback                                                 *
   * ------------------------------------------------------------------ */
  function showLobby() { S.state = 'lobby'; $('lobby').hidden = false; $('lobby').style.display = 'flex'; }
  function hideLobby() { $('lobby').hidden = true; $('lobby').style.display = 'none'; }

  function dimAndThread(slug) { // house lights to apricot embers, then thread
    hideLobby(); S.dimT = REDUCED ? 0 : 1.4;
    thread(slug);
  }

  function thread(slug, opts) {
    opts = opts || {};
    const r = M.reels[slug]; if (!r) return;
    hideLobby(); closeOverlays();
    S.slug = slug; S.frame = 0; S.elapsed = 0; S.heldLong = false; S.paused = false;
    S.startFrame = Math.max(0, Math.min(r.n - 1, opts.frame !== undefined ? opts.frame : anchorFrame(r, opts.anchor)));
    setHash(slug);
    // canister plate (booth side)
    const cp = $('canisterPlate'); cp.hidden = false;
    cp.innerHTML =
      '<div class="cp-title">' + esc(shortTitle(r.title)) + '</div>' +
      '<div class="cp-line">RUNTIME <b>' + r.runtime + '</b> AT 200 WPM · <b>' + r.n + '</b> FRAMES · <b>' + fmtInt(r.words) + '</b> WORDS</div>' +
      '<div class="cp-line">KEPT <b>' + r.prov.careDays + ' DAYS</b> BY <b>' + esc(r.prov.topAuthor || 'UNKNOWN HANDS') + '</b>' +
      (r.prov.authors.length > 1 ? ' + ' + (r.prov.authors.length - 1) + ' OTHERS' : (r.prov.authors.length === 1 ? ' — ONE HAND' : '')) + '</div>' +
      '<div class="cp-line">SHOT <b>' + r.prov.first + '</b> — <b>' + r.prov.last + '</b> · <b>' + r.prov.commits + '</b> REPAIRS ON THE LEADER</div>' +
      '<div class="cp-line' + (r.prov.night ? ' rose' : '') + '">DUST: <b>' + r.prov.careDays + ' DAYS IN CARE</b> · <b>' + r.prov.night + '</b> BURNT FRAMES (NIGHT EDITS)</div>' +
      '<div class="cp-line">SPLICES: <b>' + r.splices.length + ' OUT</b> · <b>' + r.inbound + ' IN</b></div>';
    S.dustN = Math.max(8, Math.min(150, Math.round(r.prov.careDays / 9)));
    showTitleCard(r, opts.fromSplice);
    updatePlaque();
  }

  function anchorFrame(r, anchor) {
    if (!anchor) return 0;
    const pg = D.content.pages[r.slug];
    for (let i = 0; i < pg.blocks.length; i++) {
      const b = pg.blocks[i];
      if (b.id === anchor) return i;
      if (b.blocks || b.tabs || b.cols) { if (JSON.stringify(b).includes('"id":"' + anchor + '"')) return i; }
    }
    return 0;
  }

  function showTitleCard(r, fromSplice) {
    S.state = 'title'; S.titleT = 0;
    hideLayers();
    const tc = $('titleCard'); tc.hidden = false;
    tc.innerHTML = '';
    const bd = el('div', 'tc-border');
    bd.appendChild(el('div', 'tc-over', fromSplice ? 'CUT' : 'DUSK WORKS PICTURES PRESENTS'));
    bd.appendChild(el('div', 'tc-title', esc(shortTitle(r.title))));
    bd.appendChild(el('div', 'tc-line', 'RUNTIME <b>' + r.runtime + '</b> AT 200 WPM · <b>' + r.n + '</b> FRAMES'));
    bd.appendChild(el('div', 'tc-line', 'KEPT <b>' + r.prov.careDays + ' DAYS</b> BY <b>' + esc((r.prov.topAuthor || 'UNKNOWN').toUpperCase()) + '</b>' +
      (r.prov.authors.length === 1 ? ' — ONE HAND' : ' + ' + Math.max(0, r.prov.authors.length - 1) + ' OTHERS')));
    bd.appendChild(el('div', 'tc-line', 'SHOT <b>' + r.prov.first + '</b> – <b>' + r.prov.last + '</b>'));
    if (r.prov.night > 0) bd.appendChild(el('div', 'tc-line rose', r.prov.night + ' BURNT FRAME' + (r.prov.night > 1 ? 'S' : '') + ' — EDITED AT NIGHT'));
    bd.appendChild(el('div', 'tc-hint', (S.speedMode === 'hold' ? 'PRESS → TO OPEN THE GATE' : 'THE GATE OPENS ITSELF · CLICK TO SKIP')));
    tc.appendChild(bd);
    tc.onclick = () => enterPlay();
  }

  function enterPlay() {
    const r = M.reels[S.slug]; if (!r) return;
    hideLayers();
    S.state = 'play';
    gotoFrame(S.startFrame !== undefined ? S.startFrame : 0, true);
    S.startFrame = 0;
  }

  function hideLayers() {
    ['titleCard', 'creditsWrap', 'endCard', 'intermission', 'shortCard'].forEach(id => { $(id).hidden = true; });
  }

  function gotoFrame(i, force) {
    const r = M.reels[S.slug]; if (!r) return;
    i = Math.max(0, Math.min(r.n - 1, i));
    if (!force && i === S.frame && S.pendingFrame === null) return;
    S.frame = i; S.elapsed = 0; S.heldLong = false;
    S.pendingFrame = i;
  }

  const frameCache = new Map();
  function applyPendingFrame() {
    if (S.pendingFrame === null || S.state !== 'play') return;
    const i = S.pendingFrame; S.pendingFrame = null;
    const r = M.reels[S.slug];
    const gate = $('gate');
    gate.innerHTML = '';
    if (S.lightRender && r.heavy[i]) {
      const ph = el('div', 'frame');
      ph.appendChild(el('div', 'fr-kicker', 'FRAME ' + (i + 1) + ' · ' + (D.content.pages[r.slug].blocks[i].t || '').toUpperCase() + ' · SCRUBBING — RELEASE TO DEVELOP'));
      const t = r.text[i];
      ph.appendChild(el('p', '', esc(t.slice(0, 500)) + (t.length > 500 ? '…' : '')));
      gate.appendChild(ph);
    } else {
      const key = r.slug + '|' + i;
      let node = frameCache.get(key);
      if (!node) {
        node = el('div', 'frame');
        const kick = el('div', 'fr-kicker', esc(shortTitle(r.title)) + ' · FRAME ' + (i + 1) + ' / ' + r.n +
          (r.burnt.has(i) ? ' · <span style="color:#d94f6e">BURNT — A NIGHT EDIT SCARRED THIS FRAME</span>' : ''));
        node.appendChild(kick);
        node.appendChild(renderBlock(D.content.pages[r.slug].blocks[i]));
        frameCache.set(key, node);
        if (frameCache.size > 60) frameCache.delete(frameCache.keys().next().value);
      }
      gate.appendChild(node);
    }
    gate.scrollTop = 0;
    // gate-hold on extreme frames
    if (!S.lightRender && (r.hold[i] || gate.scrollHeight > gate.clientHeight * 1.35)) S.heldLong = true;
    updatePlaque();
    if (S.sound) clickSound();
  }

  function updatePlaque() {
    const r = M.reels[S.slug];
    if (!r) { $('plaque').textContent = 'THE PROJECTIONIST'; return; }
    $('plaque').textContent = 'REEL: ' + shortTitle(r.title).toUpperCase() + ' — FRAME ' + (S.frame + 1) + ' / ' + r.n;
  }

  /* -------- splice announcement + riding -------- */
  function upcomingSplice() {
    const r = M.reels[S.slug];
    if (!r || S.state !== 'play') return null;
    for (const sp of r.splices) {
      if (sp.frame >= S.frame && sp.frame <= S.frame + 4) return sp;
    }
    return null;
  }

  function updateChip() {
    const chip = $('spliceChip');
    const sp = upcomingSplice();
    S.announced = sp;
    if (S.heldLong && S.state === 'play') {
      chip.hidden = false; chip.classList.add('held');
      const r = M.reels[S.slug];
      const cut = sp && sp.frame === S.frame
        ? ' · CUT READY — <b>' + esc(shortTitle(M.reels[sp.to] ? M.reels[sp.to].title : sp.to).toUpperCase()) + '</b> — RIDE ⏎' : '';
      chip.innerHTML = '<span class="sc-count">‖</span><span class="sc-text">HELD IN GATE — A LONG FRAME (' +
        fmtInt(Math.round(r.baseSec[S.frame])) + ' S AT 200 WPM)' + cut + '</span><span class="sc-ride">→ TO RELEASE</span>';
      chip.onclick = () => { if (sp && sp.frame === S.frame) rideSplice(sp); else { S.heldLong = false; advance(); } };
      return;
    }
    chip.classList.remove('held');
    if (!sp) { chip.hidden = true; return; }
    const dest = M.reels[sp.to];
    const k = sp.frame - S.frame;
    chip.hidden = false;
    chip.innerHTML =
      '<span class="sc-count">' + (k > 0 ? k : '✂') + '</span>' +
      '<span class="sc-text">' + (k > 0 ? 'CUT AHEAD IN ' + k + ' FRAME' + (k > 1 ? 'S' : '') : 'CUT READY') +
      ' — <b>' + esc(shortTitle(dest ? dest.title : sp.to).toUpperCase()) + '</b> — WRITTEN INTO FRAME ' + (sp.frame + 1) + '</span>' +
      '<span class="sc-ride">RIDE ⏎ · OR LET THE REEL PLAY ON</span>';
    chip.onclick = () => rideSplice(sp);
  }

  function rideSplice(sp) {
    if (!sp) return;
    S.ridden.add(sp.edgeIdx);
    store.set('ridden', [...S.ridden]);
    const stamp = 'SPLICE ' + fmtInt(S.ridden.size) + ' OF ' + fmtInt(M.spliceTotal) + ' — WRITTEN INTO FRAME ' + (sp.frame + 1);
    S.lastStamp = stamp; S.stampT = REDUCED ? 6 : 3.2;
    const brass = $('brass'); brass.hidden = false;
    brass.innerHTML = '<div class="br-head">THE JOIN BOOK</div><div class="br-stamp">' + stamp +
      '<br>No. ' + fmtInt(sp.edgeIdx + 1) + ' IN THE BOOK · ' + fmtInt(S.ridden.size) + ' RIDDEN, ' + fmtInt(M.spliceTotal - S.ridden.size) + ' UNRIDDEN</div>';
    const sb = $('stampBig'); sb.hidden = false; sb.textContent = stamp; sb.style.opacity = 1;
    if (S.sound) spliceSound();
    thread(sp.to, { anchor: sp.anchor, fromSplice: true });
  }

  /* -------- advancing -------- */
  function advance() {
    const r = M.reels[S.slug]; if (!r) return;
    if (S.frame >= r.n - 1) { startCredits(); return; }
    gotoFrame(S.frame + 1);
  }
  function advanceAuto() {
    // reached end of a frame under power: auto-ride only if opted in
    if (S.autoRide && S.announced && S.announced.frame === S.frame) { rideSplice(S.announced); return; }
    advance();
  }

  /* -------- credits + end -------- */
  function startCredits() {
    const r = M.reels[S.slug]; if (!r) return;
    S.state = 'credits'; S.credT = 0;
    hideLayers();
    const wrap = $('creditsWrap'); wrap.hidden = false;
    const roll = $('creditsRoll');
    roll.innerHTML = '';
    roll.appendChild(el('div', 'cr-over', 'END OF REEL'));
    roll.appendChild(el('div', 'cr-title', esc(shortTitle(r.title))));
    (r.prov.authors.length ? r.prov.authors : ['Unknown hands']).forEach(a => {
      roll.appendChild(el('div', 'cr-name', esc(a)));
      roll.appendChild(el('div', 'cr-role', a === r.prov.topAuthor ? 'KEEPER OF THE PRINT' : 'HAND'));
    });
    roll.appendChild(el('div', 'cr-plate',
      r.prov.commits + ' COMMITS · ' + r.prov.careDays + ' DAYS IN CARE · SHOT ' + r.prov.first + ' – ' + r.prov.last));
    roll.style.transform = 'translateY(0px)';
    S.credH = 0; // measured next tick
    if (REDUCED || S.speedMode === 'hold') {
      roll.style.top = '0'; roll.style.position = 'relative'; roll.style.paddingTop = '40px';
      S.credStatic = true;
    } else {
      roll.style.top = '100%'; roll.style.position = 'absolute'; roll.style.paddingTop = '0';
      S.credStatic = false;
    }
    wrap.onclick = () => endCredits();
  }

  function endCredits() {
    if (S.queue) { nextQueue(); return; }
    // solo: end card with next-on-the-order
    S.state = 'end';
    hideLayers();
    const ec = $('endCard'); ec.hidden = false; ec.innerHTML = '';
    const r = M.reels[S.slug];
    const ni = (M.order.indexOf(S.slug) + 1) % M.order.length;
    const next = M.reels[M.order[ni]];
    const bd = el('div', 'tc-border');
    bd.appendChild(el('div', 'tc-over', 'HOUSE LIGHTS'));
    bd.appendChild(el('div', 'tc-title', 'END OF ' + esc(shortTitle(r.title).toUpperCase())));
    bd.appendChild(el('div', 'tc-line', 'NEXT ON THE ORDER: <b>' + esc(shortTitle(next.title).toUpperCase()) + '</b> (' + next.runtime + ') — ⏎ TO THREAD'));
    bd.appendChild(el('div', 'tc-hint', 'TAB INDEX · R RACK · P PROGRAMME'));
    ec.appendChild(bd);
    S.nextSlug = M.order[ni];
    ec.onclick = () => thread(S.nextSlug);
  }

  /* -------- the programme: 27 shorts, deterministic -------- */
  function playProgramme(shortIdx) {
    closeOverlays(); hideLobby();
    const q = [];
    const shorts = shortIdx === null ? M.shorts : [M.shorts[shortIdx]];
    shorts.forEach((sh, j) => {
      if (j > 0) q.push({ t: 'intermission' });
      q.push({ t: 'shortcard', idx: sh.idx });
      sh.order.forEach(slug => q.push({ t: 'reel', slug }));
    });
    S.queue = q; S.queuePos = -1;
    nextQueue();
  }

  function nextQueue() {
    if (!S.queue) return;
    S.queuePos++;
    if (S.queuePos >= S.queue.length) { S.queue = null; endCredits(); return; }
    const it = S.queue[S.queuePos];
    if (it.t === 'reel') { thread(it.slug); return; }
    hideLayers();
    if (it.t === 'shortcard') {
      const sh = M.shorts[it.idx];
      S.state = 'shortcard'; S.titleT = 0;
      const sc = $('shortCard'); sc.hidden = false; sc.innerHTML = '';
      const bd = el('div', 'tc-border');
      bd.appendChild(el('div', 'tc-over', 'SHORT No. ' + (sh.idx + 1) + ' OF ' + M.shorts.length));
      bd.appendChild(el('div', 'tc-title', esc(sh.title.toUpperCase())));
      bd.appendChild(el('div', 'tc-line', sh.dominant.toUpperCase() + ' · <b>' + sh.size + ' REELS</b> · PURITY <b>' + sh.purity.toFixed(2) + '</b> · <b>' + sh.runtime + '</b>'));
      bd.appendChild(el('div', 'tc-line', 'OPENS ON ITS HUB · <b>' + (D.graph.inbound[sh.hub] || 0) + ' INBOUND SPLICES</b>'));
      if (sh.isMigration) bd.appendChild(el('div', 'tc-line rose', 'THE PICTURE EVERY OTHER PICTURE CUTS TO'));
      bd.appendChild(el('div', 'tc-hint', S.speedMode === 'hold' ? '→ TO BEGIN' : 'CLICK TO SKIP'));
      sc.appendChild(bd);
      sc.onclick = () => nextQueue();
      S.slug = null; updatePlaque();
      return;
    }
    if (it.t === 'intermission') {
      S.state = 'intermission'; S.interT = 0;
      const im = $('intermission'); im.hidden = false; im.innerHTML = '';
      im.appendChild(el('div', 'im-line', 'INTERMISSION'));
      im.appendChild(el('div', 'im-big', 'NO FOOTAGE SURVIVES'));
      im.appendChild(el('div', 'im-line', 'THE ARCHIVE WAS SILENT FOR ' + M.gap.days + ' DAYS'));
      im.appendChild(el('div', 'im-line', M.gap.from + ' → ' + M.gap.to + ' — NOT ONE COMMIT'));
      const cv = document.createElement('canvas'); cv.width = 140; cv.height = 140; im.appendChild(cv);
      S.interCanvas = cv;
      if (S.speedMode === 'hold') im.appendChild(el('div', 'im-line', '→ TO GO ON'));
      im.onclick = () => nextQueue();
      S.slug = null; updatePlaque();
      return;
    }
  }

  /* ------------------------------------------------------------------ *
   * block renderer — the frame in the gate is crisp DOM                 *
   * ------------------------------------------------------------------ */
  function renderBlock(b) {
    switch (b.t) {
      case 'p': { const d = el('div', 'fr-p'); d.appendChild(el('p', '', b.html)); return d; }
      case 'tldr': return el('div', 'fr-tldr', b.html);
      case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
        const lv = +b.t[1];
        const d = el('div', 'intertitle lv' + lv);
        d.appendChild(el('div', 'it-level', 'ACT MARK · H' + lv));
        d.appendChild(el('div', 'it-text', esc(b.text || '')));
        return d;
      }
      case 'img': {
        const f = el('figure');
        const img = document.createElement('img');
        img.src = b.light || b.dark || ''; img.alt = b.alt || ''; img.loading = 'eager';
        f.appendChild(img);
        f.appendChild(el('figcaption', '', esc(b.caption || b.alt || '')));
        return f;
      }
      case 'code': {
        const d = el('div', 'codeframe');
        if (b.title || b.lang) d.appendChild(el('div', 'code-title', esc(b.title || b.lang)));
        const pre = el('pre'); const code = el('code'); code.textContent = (b.code || '').replace(/^\n/, '');
        pre.appendChild(code); d.appendChild(pre); return d;
      }
      case 'table': {
        const t = el('table');
        if (b.head && b.head.length) {
          const tr = el('tr'); b.head.forEach(h => tr.appendChild(el('th', '', h)));
          const th = el('thead'); th.appendChild(tr); t.appendChild(th);
        }
        const tb = el('tbody');
        (b.rows || []).forEach(row => { const tr = el('tr'); row.forEach(c => tr.appendChild(el('td', '', c))); tb.appendChild(tr); });
        t.appendChild(tb); return t;
      }
      case 'admonition': {
        const d = el('div', 'admon ' + (b.kind || ''));
        d.appendChild(el('div', 'ad-kind', esc(b.title || b.kind || 'note')));
        (b.blocks || []).forEach(x => d.appendChild(renderBlock(x)));
        return d;
      }
      case 'ul': case 'ol': {
        const l = el(b.t);
        if (b.t === 'ol' && b.start) l.start = b.start;
        (b.items || []).forEach(it => l.appendChild(el('li', '', typeof it === 'string' ? it : esc(JSON.stringify(it)))));
        return l;
      }
      case 'tabs': {
        const d = el('div', 'tabsframe');
        const bar = el('div', 'tab-bar');
        const panes = [];
        (b.tabs || []).forEach((tab, i) => {
          const btn = el('button', i === 0 ? 'on' : '', esc(tab.label || tab.value || ('tab ' + (i + 1))));
          const pane = el('div', 'tab-pane' + (i === 0 ? ' on' : ''));
          (tab.blocks || []).forEach(x => pane.appendChild(renderBlock(x)));
          btn.onclick = (ev) => {
            ev.stopPropagation();
            bar.querySelectorAll('button').forEach(x => x.classList.remove('on'));
            panes.forEach(x => x.classList.remove('on'));
            btn.classList.add('on'); pane.classList.add('on');
          };
          bar.appendChild(btn); panes.push(pane);
        });
        d.appendChild(bar); panes.forEach(p => d.appendChild(p));
        return d;
      }
      case 'cards': {
        const d = el('div', 'cardsframe');
        (b.items || []).forEach(it => {
          const a = el('a', 'card');
          a.href = it.link || '#';
          a.innerHTML = '<div>' + esc(it.icon || '■') + '</div><div class="card-title">' + esc(it.title || '') +
            '</div><div class="card-desc">' + (it.desc || '') + '</div>';
          d.appendChild(a);
        });
        return d;
      }
      case 'badge': return el('div', 'badgeframe', esc(b.label || b.kind || 'badge'));
      case 'details': {
        const d = el('div', 'detailsframe');
        const det = el('details'); det.open = true;
        det.appendChild(el('summary', '', b.summary || 'Details'));
        (b.blocks || []).forEach(x => det.appendChild(renderBlock(x)));
        d.appendChild(det); return d;
      }
      case 'endpoint': {
        const d = el('div', 'endpointframe');
        if (b.title) d.appendChild(el('div', 'ep-title', esc(b.title)));
        const head = el('div', 'ep-head');
        if (b.method) head.appendChild(el('span', 'ep-method', esc(b.method)));
        head.appendChild(el('span', '', esc(b.path || '')));
        d.appendChild(head);
        if (b.description) d.appendChild(el('p', '', b.description));
        if (b.params && b.params.length) {
          const t = el('table');
          const th = el('thead'); const tr0 = el('tr');
          [b.paramTitle || 'Parameter', 'Type', 'Description'].forEach(x => tr0.appendChild(el('th', '', esc(x))));
          th.appendChild(tr0); t.appendChild(th);
          const tb = el('tbody');
          b.params.forEach(p => {
            const tr = el('tr');
            tr.appendChild(el('td', '', '<code>' + esc(p.name) + '</code>' + (p.required ? ' <b>*</b>' : '')));
            tr.appendChild(el('td', '', esc(p.type || '')));
            tr.appendChild(el('td', '', p.desc || ''));
            tb.appendChild(tr);
          });
          t.appendChild(tb); d.appendChild(t);
        }
        (b.codeTabs || []).forEach(ct => {
          const cf = el('div', 'codeframe');
          cf.appendChild(el('div', 'code-title', esc(ct.label || ct.lang || 'code')));
          const pre = el('pre'); const code = el('code'); code.textContent = ct.code || '';
          pre.appendChild(code); cf.appendChild(pre); d.appendChild(cf);
        });
        (b.responses || []).forEach(rp => {
          const cf = el('div', 'codeframe');
          cf.appendChild(el('div', 'code-title', 'RESPONSE ' + esc(String(rp.status || '')) + ' ' + esc(rp.statusText || '')));
          const pre = el('pre'); const code = el('code'); code.textContent = rp.body || '';
          pre.appendChild(code); cf.appendChild(pre); d.appendChild(cf);
        });
        return d;
      }
      case 'columns': {
        const d = el('div', 'columnsframe');
        (b.cols || []).forEach(colBlocks => {
          const c = el('div', 'col');
          (colBlocks || []).forEach(x => c.appendChild(renderBlock(x)));
          d.appendChild(c);
        });
        return d;
      }
      case 'hr': return el('div', 'hrframe', '· · ·');
      default: return el('div', 'fr-p', esc(blockText(b)));
    }
  }

  /* ------------------------------------------------------------------ *
   * gate link clicks = explicit splice rides                            *
   * ------------------------------------------------------------------ */
  $('gate').addEventListener('click', (ev) => {
    const a = ev.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (!href.startsWith('#/')) return; // external: browser handles
    ev.preventDefault();
    const h = parseHash(href);
    if (!h || !D.content.pages[h.slug]) return;
    const r = M.reels[S.slug];
    const sp = r && r.splices.find(x => x.to === h.slug && x.frame === S.frame)
      || (r && r.splices.find(x => x.to === h.slug));
    if (sp) { rideSplice({ to: h.slug, edgeIdx: sp.edgeIdx, frame: S.frame, anchor: h.anchor || sp.anchor }); }
    else thread(h.slug, { anchor: h.anchor });
  });

  /* ------------------------------------------------------------------ *
   * canvases: booth, strip, print condition                             *
   * ------------------------------------------------------------------ */
  const boothCv = $('boothCanvas'), stripCv = $('strip'), printCv = $('printCanvas');
  let bw = 0, bh = 0, sw = 0, sh2 = 0, pw = 0, ph = 0, dpr = 1;
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    [[boothCv, 'bw', 'bh'], [stripCv, 'sw', 'sh2'], [printCv, 'pw', 'ph']].forEach(([cv]) => {
      const r = cv.getBoundingClientRect();
      cv.width = Math.max(2, Math.round(r.width * dpr));
      cv.height = Math.max(2, Math.round(r.height * dpr));
    });
    bw = boothCv.width; bh = boothCv.height;
    sw = stripCv.width; sh2 = stripCv.height;
    pw = printCv.width; ph = printCv.height;
  }
  window.addEventListener('resize', resize);

  function drawBooth(dt, t) {
    const ctx = boothCv.getContext('2d');
    ctx.clearRect(0, 0, bw, bh);
    // booth dark
    const g = ctx.createLinearGradient(0, 0, 0, bh);
    g.addColorStop(0, '#171021'); g.addColorStop(0.6, '#1c1428'); g.addColorStop(1, '#120c1b');
    ctx.fillStyle = g; ctx.fillRect(0, 0, bw, bh);
    // apricot house-light embers along the bottom (dim during projection)
    const ember = S.state === 'lobby' ? 0.35 : (S.dimT > 0 ? 0.1 + 0.25 * (S.dimT / 1.4) : 0.1);
    const eg = ctx.createLinearGradient(0, bh, 0, bh - 140 * dpr);
    eg.addColorStop(0, 'rgba(255,177,133,' + ember + ')'); eg.addColorStop(1, 'rgba(255,177,133,0)');
    ctx.fillStyle = eg; ctx.fillRect(0, bh - 140 * dpr, bw, 140 * dpr);
    if (S.dimT > 0) S.dimT = Math.max(0, S.dimT - dt);
    // the beam: projector port top-right, cutting to the screen (left-center area)
    const px = bw * 0.985, py = bh * 0.02;
    const sx = bw * 0.055, sy1 = bh * 0.12, sy2 = bh * 0.72;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const bg = ctx.createLinearGradient(px, py, sx, (sy1 + sy2) / 2);
    bg.addColorStop(0, 'rgba(244,236,220,0.14)');
    bg.addColorStop(1, 'rgba(244,236,220,0.02)');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy1); ctx.lineTo(sx, sy2); ctx.closePath(); ctx.fill();
    // violet beam edges
    ctx.strokeStyle = 'rgba(143,125,255,0.28)'; ctx.lineWidth = 1.4 * dpr;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy2); ctx.stroke();
    // dust in the beam — count derives from careDays of the threaded reel
    const nD = S.slug ? S.dustN : 20;
    ctx.fillStyle = 'rgba(244,236,220,0.5)';
    for (let i = 0; i < nD; i++) {
      const d = S.dust[i % S.dust.length];
      let u = d.u + (REDUCED ? 0 : (t * 0.008 * d.s) % 1); u -= Math.floor(u);
      const vv = d.v + (REDUCED ? 0 : 0.05 * Math.sin(t * 0.5 * d.s + d.p * 6.28));
      const x = px + (sx - px) * u;
      const yTop = py + (sy1 - py) * u, yBot = py + (sy2 - py) * u;
      const y = yTop + (yBot - yTop) * Math.min(1, Math.max(0, vv));
      const r2 = (0.5 + d.s) * dpr * (0.5 + 0.5 * u);
      ctx.globalAlpha = 0.12 + 0.3 * u;
      ctx.fillRect(x, y, r2, r2);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  const CELL = 46; // strip frame cell width (css px)
  function drawStrip() {
    const ctx = stripCv.getContext('2d');
    ctx.clearRect(0, 0, sw, sh2);
    const c = CELL * dpr, hgt = sh2;
    const midX = sw / 2;
    const fy = hgt * 0.18, fh = hgt * 0.64; // frame band
    // film base
    ctx.fillStyle = '#0d0913'; ctx.fillRect(0, fy - 8 * dpr, sw, fh + 16 * dpr);
    const r = M.reels[S.slug];
    if (!r) { // idle leader
      ctx.fillStyle = 'rgba(244,236,220,0.12)';
      ctx.font = (10 * dpr) + 'px monospace'; ctx.textAlign = 'center';
      ctx.fillText('LEADER — THREAD A REEL', midX, hgt / 2);
      return;
    }
    const frac = S.state === 'play' && !S.heldLong && S.speedMode !== 'hold' && !S.paused
      ? Math.min(1, S.elapsed / r.baseSec[S.frame]) : 0;
    const off = frac * c;
    const first = Math.max(-2, S.frame - Math.ceil(midX / c) - 1);
    const last = Math.min(r.n + 1, S.frame + Math.ceil(midX / c) + 2);
    ctx.textAlign = 'center';
    // film base bands + sprocket holes first, so grease pencil can write over them
    ctx.fillStyle = '#0d0913';
    ctx.fillRect(0, 0, sw, fy - 8 * dpr); ctx.fillRect(0, fy + fh + 8 * dpr, sw, hgt);
    ctx.fillStyle = '#241b33';
    const sp0 = c / 2;
    for (let x = ((midX - S.frame * c - off) % sp0 + sp0) % sp0 - sp0; x < sw; x += sp0) {
      ctx.beginPath(); ctx.roundRect(x, fy - 16 * dpr, 8 * dpr, 8 * dpr, 2 * dpr); ctx.fill();
      ctx.beginPath(); ctx.roundRect(x, fy + fh + 8 * dpr, 8 * dpr, 8 * dpr, 2 * dpr); ctx.fill();
    }
    for (let i = first; i < last; i++) {
      const x = midX + (i - S.frame) * c - off - c / 2;
      if (i < 0 || i >= r.n) {
        // leader before frame 0 carries the repair marks — commits, counted
        ctx.fillStyle = '#231a31'; ctx.fillRect(x + 2 * dpr, fy, c - 4 * dpr, fh);
        if (i === -1) {
          ctx.strokeStyle = 'rgba(207,169,100,0.8)'; ctx.lineWidth = dpr;
          const marks = Math.min(r.prov.commits, 40);
          for (let m2 = 0; m2 < marks; m2++) {
            const mx = x + 4 * dpr + (m2 % 8) * (c - 8 * dpr) / 8;
            const my = fy + 4 * dpr + Math.floor(m2 / 8) * (fh - 8 * dpr) / 5;
            ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + 3 * dpr, my + 4 * dpr); ctx.stroke();
          }
          ctx.fillStyle = '#cfa964'; ctx.font = (7 * dpr) + 'px monospace';
          ctx.fillText(r.prov.commits + ' REPAIRS', x + c / 2, fy + fh + 7 * dpr);
        }
        continue;
      }
      // frame cell — cream film base, tinted by kind
      const b = D.content.pages[r.slug].blocks[i];
      let fill = '#e8dfcc';
      if (b.t === 'code' || b.t === 'endpoint') fill = '#cfc4e8';
      else if (b.t === 'img') fill = '#d9cbb4';
      else if (b.t && b.t[0] === 'h') fill = '#3a2f4d';
      else if (b.t === 'table') fill = '#d4d8c2';
      ctx.fillStyle = fill;
      ctx.fillRect(x + 2 * dpr, fy, c - 4 * dpr, fh);
      if (r.burnt.has(i)) { // burnt frame: rose scar
        ctx.fillStyle = 'rgba(217,79,110,0.85)';
        ctx.beginPath(); ctx.arc(x + c / 2, fy + fh / 2, fh * 0.3, 0, 6.283); ctx.fill();
        ctx.fillStyle = '#2a0d14';
        ctx.beginPath(); ctx.arc(x + c / 2, fy + fh / 2, fh * 0.16, 0, 6.283); ctx.fill();
      }
      if (i === S.frame) { // the gate
        ctx.strokeStyle = '#8f7dff'; ctx.lineWidth = 2.5 * dpr;
        ctx.strokeRect(x + 1 * dpr, fy - 5 * dpr, c - 2 * dpr, fh + 10 * dpr);
      }
      // splice tape at frames where an edge is written
      const sps = r.spliceAt[i];
      if (sps) {
        ctx.fillStyle = '#e84a7f';
        ctx.fillRect(x + c - 7 * dpr, fy - 6 * dpr, 5 * dpr, fh + 12 * dpr);
        ctx.fillStyle = 'rgba(232,74,127,0.5)';
        ctx.fillRect(x + c - 11 * dpr, fy - 2 * dpr, 4 * dpr, fh + 4 * dpr);
        if (i >= S.frame && i <= S.frame + 4) {
          // grease pencil: destination + countdown in frames
          ctx.save();
          ctx.fillStyle = '#ff5f8f';
          ctx.font = 'italic ' + (9 * dpr) + 'px Georgia';
          const destR = M.reels[sps[0].to];
          const label = (destR ? shortTitle(destR.title) : sps[0].to).toUpperCase().slice(0, 26);
          ctx.fillText(label, x + c / 2, fy - 9 * dpr);
          if (i > S.frame) {
            ctx.font = 'bold ' + (12 * dpr) + 'px Georgia';
            ctx.fillText(String(i - S.frame), x + c / 2, fy + fh + 12 * dpr);
          }
          ctx.restore();
        }
      }
    }
  }

  const DARK_STATES = { title: 1, credits: 1, end: 1, shortcard: 1, intermission: 1 };
  function drawPrint(t) { // print condition + the beam cutting booth dust over dark frames
    if (!printCv.width) return;
    const ctx = printCv.getContext('2d');
    ctx.clearRect(0, 0, pw, ph);
    if (DARK_STATES[S.state]) { // house dark: the violet-edged beam is visible in the air
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const bx = pw * 1.02, by = -ph * 0.06; // port over the top-right shoulder
      const ex = pw * 0.0, ey1 = ph * 0.28, ey2 = ph * 0.92;
      const g = ctx.createLinearGradient(bx, by, ex, (ey1 + ey2) / 2);
      g.addColorStop(0, 'rgba(244,236,220,0.10)'); g.addColorStop(1, 'rgba(244,236,220,0.015)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey1); ctx.lineTo(ex, ey2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(143,125,255,0.30)'; ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey2); ctx.stroke();
      const nD = Math.max(20, S.dustN);
      for (let i = 0; i < nD; i++) {
        const d = S.dust[i % S.dust.length];
        let u = d.u + (REDUCED ? 0 : (t * 0.012 * d.s) % 1); u -= Math.floor(u);
        const vv = Math.min(1, Math.max(0, d.v + (REDUCED ? 0 : 0.06 * Math.sin(t * 0.6 * d.s + d.p * 6.28))));
        const x = bx + (ex - bx) * u;
        const yT = by + (ey1 - by) * u, yB = by + (ey2 - by) * u;
        const y = yT + (yB - yT) * vv;
        ctx.globalAlpha = 0.10 + 0.34 * u;
        ctx.fillStyle = 'rgba(244,236,220,0.8)';
        const r2 = (0.5 + d.s) * dpr * (0.4 + 0.6 * u);
        ctx.fillRect(x, y, r2, r2);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    const r = M.reels[S.slug];
    if (!r) return;
    const rnd = mulberry(hashStr(r.slug) ^ (S.frame * 2654435761));
    // scratches: density = careDays
    const nS = Math.min(26, Math.floor(r.prov.careDays / 60));
    ctx.strokeStyle = 'rgba(43,33,54,0.10)';
    for (let i = 0; i < nS; i++) {
      const x = rnd() * pw;
      ctx.lineWidth = (0.4 + rnd()) * dpr;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (rnd() - 0.5) * 14 * dpr, ph); ctx.stroke();
    }
    // edge dust vignette scaled by careDays
    const v = Math.min(0.28, r.prov.careDays / 5000);
    const vg = ctx.createRadialGradient(pw / 2, ph / 2, Math.min(pw, ph) * 0.42, pw / 2, ph / 2, Math.max(pw, ph) * 0.75);
    vg.addColorStop(0, 'rgba(34,26,46,0)'); vg.addColorStop(1, 'rgba(34,26,46,' + (0.10 + v) + ')');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, pw, ph);
    // burnt frame: rose scorch creeping from a corner
    if (S.state === 'play' && r.burnt.has(S.frame)) {
      const corner = [[0, 0], [pw, 0], [0, ph], [pw, ph]][S.frame % 4];
      const bg2 = ctx.createRadialGradient(corner[0], corner[1], 0, corner[0], corner[1], Math.min(pw, ph) * 0.5);
      bg2.addColorStop(0, 'rgba(217,79,110,0.5)');
      bg2.addColorStop(0.35, 'rgba(120,30,45,0.25)');
      bg2.addColorStop(1, 'rgba(217,79,110,0)');
      ctx.fillStyle = bg2; ctx.fillRect(0, 0, pw, ph);
    }
  }

  /* ------------------------------------------------------------------ *
   * the tick — all motion, all measurement                              *
   * ------------------------------------------------------------------ */
  function tick(ts) {
    const t0 = performance.now();
    const dt = Math.min(0.1, S.lastTs ? (ts - S.lastTs) / 1000 : 0.016);
    S.lastTs = ts;
    const spd = S.speedMode === 'hold' ? 0 : S.speedMode;

    if (S.state === 'play' && !S.paused && !S.heldLong && spd > 0 && S.pendingFrame === null && !S.scrub) {
      const r = M.reels[S.slug];
      if (r) {
        S.elapsed += dt * spd;
        if (S.elapsed >= r.baseSec[S.frame]) advanceAuto();
      }
    }
    if (S.state === 'title' || S.state === 'shortcard') {
      if (spd > 0) {
        S.titleT += dt * spd;
        if (S.titleT > 2.6) { if (S.state === 'title') enterPlay(); else nextQueue(); }
      }
    }
    if (S.state === 'credits') {
      const roll = $('creditsRoll');
      if (!S.credStatic) {
        if (!S.credH) S.credH = roll.offsetHeight + $('creditsWrap').offsetHeight;
        S.credT += dt * (spd || 1) * 55;
        roll.style.transform = 'translateY(' + (-S.credT) + 'px)';
        if (S.credT > S.credH) endCredits();
      }
    }
    if (S.state === 'intermission') {
      if (spd > 0) {
        S.interT += dt * spd;
        if (S.interT > 6) nextQueue();
      }
      if (S.interCanvas) { // leader countdown running over black
        const c = S.interCanvas.getContext('2d');
        c.clearRect(0, 0, 140, 140);
        c.strokeStyle = '#d9cfba'; c.lineWidth = 2;
        c.beginPath(); c.arc(70, 70, 60, 0, 6.283); c.stroke();
        c.beginPath(); c.moveTo(70, 70);
        c.arc(70, 70, 60, -1.5708, -1.5708 + (S.interT / 6) * 6.283); c.closePath();
        c.fillStyle = 'rgba(217,207,186,0.25)'; c.fill();
        c.fillStyle = '#f4ecdc'; c.font = '42px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(String(Math.max(0, Math.ceil(6 - S.interT))), 70, 72);
      }
    }
    if (S.stampT > 0) {
      S.stampT -= dt;
      if (S.stampT <= 0) { $('stampBig').hidden = true; }
      else $('stampBig').style.opacity = Math.min(1, S.stampT / 1.2);
    }

    applyPendingFrame();
    updateChip();
    drawBooth(dt, ts / 1000);
    drawStrip();
    drawPrint(ts / 1000);

    const w = performance.now() - t0;
    diag.frameMs = w;
    diagSum += w; diagN++;
    diag.avgFrameMs = diagSum / diagN;
    diag.state = S.state + (S.heldLong ? '+held' : '') + (S.paused ? '+paused' : '');
    diag.ring.push(w); if (diag.ring.length > 1200) diag.ring.shift();
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------ *
   * input                                                               *
   * ------------------------------------------------------------------ */
  function anyOverlayOpen() {
    return ['indexOverlay', 'rackOverlay', 'programmeOverlay', 'creditsAllOverlay'].some(id => !$(id).hidden);
  }
  function closeOverlays() {
    ['indexOverlay', 'rackOverlay', 'programmeOverlay', 'creditsAllOverlay'].forEach(id => { $(id).hidden = true; });
  }
  function toggleOverlay(id, on) {
    const was = !$(id).hidden;
    closeOverlays();
    $(id).hidden = on === undefined ? was : !on;
    if (id === 'indexOverlay' && !$(id).hidden) { $('searchBox').focus(); $('searchBox').select(); }
  }

  function bind() {
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Tab') { ev.preventDefault(); toggleOverlay('indexOverlay'); return; }
      if (ev.key === 'Escape') { closeOverlays(); return; }
      if (ev.target === $('searchBox')) {
        if (ev.key === 'Enter') { const first = $('searchResults').querySelector('.idx-row'); if (first) first.click(); }
        return;
      }
      switch (ev.key) {
        case 'Enter':
          if (S.state === 'play' && S.announced) { rideSplice(S.announced); }
          else if (S.state === 'end' && S.nextSlug) { thread(S.nextSlug); }
          else if (S.state === 'title') enterPlay();
          else if (S.state === 'shortcard' || S.state === 'intermission') nextQueue();
          else if (S.state === 'lobby') { const b = $('threadFirst'); if (b) b.click(); }
          break;
        case ' ':
          ev.preventDefault();
          if (S.state === 'play') S.paused = !S.paused;
          else if (S.state === 'title') enterPlay();
          break;
        case 'ArrowRight':
          if (S.state === 'title') enterPlay();
          else if (S.state === 'shortcard' || S.state === 'intermission') nextQueue();
          else if (S.state === 'credits') endCredits();
          else if (S.state === 'play') { S.heldLong = false; advance(); }
          break;
        case 'ArrowLeft':
          if (S.state === 'play') { S.heldLong = false; gotoFrame(S.frame - 1); }
          break;
        case 'r': case 'R': toggleOverlay('rackOverlay'); break;
        case 'p': case 'P': toggleOverlay('programmeOverlay'); break;
        case '/': ev.preventDefault(); toggleOverlay('indexOverlay', true); break;
      }
    });

    $('searchBox').addEventListener('input', (ev) => renderSearch(ev.target.value));
    document.querySelectorAll('.ov-close').forEach(x => x.addEventListener('click', closeOverlays));
    document.querySelectorAll('.overlay').forEach(ov => ov.addEventListener('click', (ev) => { if (ev.target === ov && ov.id !== 'lobby') closeOverlays(); }));

    $('btnIndex').onclick = () => toggleOverlay('indexOverlay');
    $('btnRack').onclick = () => toggleOverlay('rackOverlay');
    $('btnProg').onclick = () => toggleOverlay('programmeOverlay');
    $('btnCreditsAll').onclick = () => toggleOverlay('creditsAllOverlay');
    $('btnLobby').onclick = () => { S.queue = null; hideLayers(); showLobby(); };

    document.querySelectorAll('.spd').forEach(btn => {
      const v = btn.dataset.spd === 'hold' ? 'hold' : parseFloat(btn.dataset.spd);
      if (String(S.speedMode) === String(v)) { document.querySelectorAll('.spd').forEach(x => x.classList.remove('sel')); btn.classList.add('sel'); }
      btn.onclick = () => {
        S.speedMode = v; store.set('speed', v);
        document.querySelectorAll('.spd').forEach(x => x.classList.remove('sel'));
        btn.classList.add('sel');
      };
    });

    const ar = $('autoRideBtn');
    const arLabel = () => { ar.textContent = 'LET THE PROJECTIONIST CUT — ' + (S.autoRide ? 'ON (auto-ride splices)' : 'OFF'); ar.setAttribute('aria-pressed', String(S.autoRide)); };
    arLabel();
    ar.onclick = () => { S.autoRide = !S.autoRide; store.set('autoride', S.autoRide); arLabel(); };

    const sndLabel = () => { $('soundBtn').textContent = 'SOUND — ' + (S.sound ? 'ON (1 click per frame, 1 thump per splice)' : 'OFF (1 click per frame)'); $('soundBtn').setAttribute('aria-pressed', String(S.sound)); };
    sndLabel();
    /* sound defaults ON: the context is born on the first gesture the browser allows */
    const wakeAudio = () => {
      if (S.sound && !S.audio) { try { S.audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } }
      if (S.audio && S.audio.state === 'suspended') { try { S.audio.resume(); } catch (e) { } }
    };
    document.addEventListener('pointerdown', wakeAudio, { capture: true });
    document.addEventListener('keydown', wakeAudio, { capture: true });
    $('soundBtn').onclick = () => {
      S.sound = !S.sound;
      if (S.sound && !S.audio) { try { S.audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { S.sound = false; } }
      if (S.audio && S.audio.state === 'suspended') { try { S.audio.resume(); } catch (e) { } }
      sndLabel();
    };

    // scrub: drag the strip
    const wrap = $('stripWrap');
    wrap.addEventListener('pointerdown', (ev) => {
      if (!M.reels[S.slug] || (S.state !== 'play' && S.state !== 'end')) return;
      if (S.state === 'end') { hideLayers(); S.state = 'play'; gotoFrame(M.reels[S.slug].n - 1, true); }
      S.scrub = { x0: ev.clientX, f0: S.frame };
      S.lightRender = true;
      wrap.classList.add('grabbing');
      wrap.setPointerCapture(ev.pointerId);
    });
    wrap.addEventListener('pointermove', (ev) => {
      if (!S.scrub) return;
      const df = Math.round((S.scrub.x0 - ev.clientX) / CELL);
      const target = S.scrub.f0 + df;
      if (target !== S.frame) gotoFrame(target);
    });
    const endScrub = (ev) => {
      if (!S.scrub) return;
      S.scrub = null; S.lightRender = false;
      wrap.classList.remove('grabbing');
      gotoFrame(S.frame, true); // full development of the settled frame
    };
    wrap.addEventListener('pointerup', endScrub);
    wrap.addEventListener('pointercancel', endScrub);

    resize();
  }

  /* ------------------------------------------------------------------ *
   * optional sound: every sonic element a countable datum               *
   * ------------------------------------------------------------------ */
  function blip(freq, dur, gain) {
    if (!S.audio) return;
    try {
      const o = S.audio.createOscillator(), g = S.audio.createGain();
      o.frequency.value = freq; o.type = 'triangle';
      g.gain.setValueAtTime(gain, S.audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, S.audio.currentTime + dur);
      o.connect(g); g.connect(S.audio.destination);
      o.start(); o.stop(S.audio.currentTime + dur);
    } catch (e) { }
  }
  function clickSound() { blip(1400, 0.03, 0.02); }   // one click = one frame advanced
  function spliceSound() { blip(180, 0.12, 0.06); blip(90, 0.2, 0.05); } // one thump = one splice ridden

  /* ------------------------------------------------------------------ *
   * test/booth API                                                      *
   * ------------------------------------------------------------------ */
  window.__proj = {
    thread, gotoFrame: (i) => { if (S.state !== 'play') enterPlay(); gotoFrame(i, true); },
    skipCard: () => { if (S.state === 'title') enterPlay(); else if (S.state === 'shortcard' || S.state === 'intermission') nextQueue(); },
    setSpeed: (v) => { S.speedMode = v; },
    ride: () => { if (S.announced) rideSplice(S.announced); },
    playProgramme,
    jumpQueue: (t) => {
      if (!S.queue) return false;
      for (let i = S.queuePos + 1; i < S.queue.length; i++) {
        if (S.queue[i].t === t) { S.queuePos = i - 1; nextQueue(); return true; }
      }
      return false;
    },
    get state() { return S.state; }, get slug() { return S.slug; }, get frame() { return S.frame; },
    get model() { return M; }
  };
})();
