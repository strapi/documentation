/* ALPENGLOW, main.js
   Boot, the sacred utility path (search / Index / hash deep links),
   the title-card tour, the summit book lifecycle, the honest Almanac,
   the 1930s synthesized orchestra, and planche states. */

'use strict';

(function () {

  const $ = id => document.getElementById(id);
  const G = Game.G;
  let currentBook = null;      // slug open in the reading panel
  let audio = null;
  let soundOn = true;
  const PLANCHE = new URLSearchParams(location.search).get('planche');
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- persistence (localStorage, try/catch everywhere) ---------- */
  function loadSet(key) {
    try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); }
    catch (e) { return new Set(); }
  }
  function saveSet(key, set) {
    try { localStorage.setItem(key, JSON.stringify([...set])); } catch (e) {}
  }
  function loadFlag(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function saveFlag(key, v) { try { localStorage.setItem(key, v); } catch (e) {} }

  /* ---------- boot ---------- */
  loadModel().then(() => {
    World.init($('world'), $('film'));

    if (!PLANCHE) {
      G.signedSet = loadSet('alp.signed');
      G.tendedSet = loadSet('alp.tended');
    } else {
      G.tendedSet = new Set();
    }
    soundOn = loadFlag('alp.sound') !== 'off';
    $('btn-sound').setAttribute('aria-pressed', String(soundOn));
    $('btn-sound').title = 'Sound (' + (soundOn ? 'on' : 'off') + ')';

    Game.init({
      onHud: updateHud,
      onLedge: onLedge,
      onSummit: onSummit,
      onRoute: onRoute,
      onRappelStart: (t, label) => caption('Rappelling the fixed rope to ' + label + '...', 2200),
      onRappelCut: (t, label) => caption('You rappel the fixed rope to ' + label + '.', 2600),
      onRappelEnd: () => {},
      onBreather: () => { caption('Grip spent. A breather at the piton.', 2000); playSound('slip'); },
      onSound: playSound,
      onIdle: onIdle,
      onYodel: onYodel,
    });

    World.onEvent = onWorldEvent;

    buildIndexPanel();
    buildAlmanac();
    wireUi();

    // first paint is already playable: on the wall, no intro toll (QUICK START FIRST)
    const hashTarget = parseHash();
    if (PLANCHE) return Promise.resolve(setupPlanche(+PLANCHE)).then(() => { window.__plancheReady = true; });
    Game.startRoute('/cms/quick-start', { snap: true });

    const seenCards = loadFlag('alp.cards') === 'seen';
    if (!seenCards && !hashTarget) {
      showTitleCards();
    } else {
      caption('Hold to reach. Release in the <span class="green">green</span>.', 0);
    }
    if (hashTarget) openBook(hashTarget.slug, { anchor: hashTarget.anchor });
    window.__plancheReady = true;
  });

  /* ---------- the title-card tour (3 cards, skippable, iris) ---------- */
  let cardIdx = 0;
  function showTitleCards() {
    const tc = $('titlecards');
    cardIdx = 0;
    tc.hidden = false;
    const cards = [...tc.querySelectorAll('.tcard')];
    cards.forEach((c, i) => { c.hidden = i !== 0; c.classList.remove('iris-in', 'iris-out'); });
    if (!REDUCED) cards[0].classList.add('iris-in');
  }
  function advanceCard() {
    const tc = $('titlecards');
    const cards = [...tc.querySelectorAll('.tcard')];
    const cur = cards[cardIdx];
    if (cardIdx >= cards.length - 1) return endCards();
    const next = cards[cardIdx + 1];
    cardIdx++;
    if (REDUCED) { cur.hidden = true; next.hidden = false; return; }
    cur.classList.remove('iris-in');
    cur.classList.add('iris-out');
    setTimeout(() => {
      cur.hidden = true; cur.classList.remove('iris-out');
      next.hidden = false;
      next.classList.add('iris-in');
    }, 480);
  }
  function endCards() {
    const tc = $('titlecards');
    saveFlag('alp.cards', 'seen');
    const cur = tc.querySelectorAll('.tcard')[cardIdx];
    const done = () => {
      tc.hidden = true;
      caption('Hold to reach. Release in the <span class="green">green</span>.', 0);
    };
    if (REDUCED || !cur) { done(); return; }
    cur.classList.remove('iris-in');
    cur.classList.add('iris-out');
    setTimeout(done, 500);
  }
  window.__skipCards = endCards;

  /* ---------- HUD ---------- */
  function updateHud() {
    const sc = G.scene; if (!sc) return;
    $('gripmeter').hidden = G.mode === 'summit' || G.mode === 'rappel';
    $('gripmeter').querySelector('.fill').style.height = Math.round(G.grip) + '%';
    $('gripmeter').querySelector('.gv').textContent = Math.round(G.grip);

    // the one card: route topo
    const tc = $('topocard');
    tc.hidden = G.mode === 'rappel' || G.mode === 'summit' || (PLANCHE === '3');
    tc.querySelector('.tc-route').textContent = titleOf(sc.slug);
    tc.querySelector('.tc-facts').textContent =
      heightOf(sc.slug).toLocaleString('en-US') + ' m · ' + sc.grade + ' · ' +
      (sc.pitches[0].boulder ? 'boulder' : sc.pitches.length + ' pitch' + (sc.pitches.length > 1 ? 'es' : ''));
    const p = sc.pitches[Math.min(G.pitchIdx, sc.pitches.length - 1)];
    tc.querySelector('.tc-pitch').innerHTML = G.mode === 'summit'
      ? '<span class="belay"></span><span class="pn">Summit.</span> The book is in the box.'
      : sc.pitches[0].boulder
      ? '<span class="belay"></span>One scramble, twenty seconds.'
      : '<span class="belay"></span><span class="pn">Pitch ' + (G.pitchIdx + 1) + ':</span> ' + p.name +
        (p.crux ? ' <em>(crux)</em>' : '');
    $('btn-peek').hidden = !(G.mode === 'ledge' || G.mode === 'summit');

    $('trailsign').hidden = G.mode === 'rappel' || G.mode === 'summit' || (PLANCHE === '3');
    $('trailsign').textContent = sc.massif.label + ', ' + sc.massif.count + ' summits';

    $('ascentlog').innerHTML = G.signedSet.size + ' / 290';
    $('ropes').hidden = !(G.mode === 'summit' && document.getElementById('book').hidden);
  }

  function caption(html, ms) {
    const c = $('caption');
    c.innerHTML = html; c.hidden = false;
    clearTimeout(c._t);
    if (ms) c._t = setTimeout(() => { c.hidden = true; }, ms);
  }

  function onRoute(slug) {
    updateHud();
    $('ropes').hidden = true;
    if (!PLANCHE) {
      const fs = freshState(slug);
      if (fs === 'frost') caption('Frost on the rope. No one has signed this book in over two years.', 3400);
    }
  }

  function onLedge(ledge, silent) {
    updateHud();
    if (!silent) caption('Belay ledge, piton set. <b>' + ledge.name + '</b>', 2600);
    playSound('ledge');
  }

  function onSummit(slug, opts) {
    updateHud();
    buildRopeChips(slug);
    setTimeout(() => openBook(slug, { summit: true }), G.reduced ? 0 : 1500);
  }

  /* climber personality: whistling while idle, yodel visuals */
  function onIdle() {
    playSound('whistle');
    const p = World.climberScreen(G);
    World.emitNotes(p.x, p.y - 66, 2);
  }
  function onYodel() {
    const p = World.climberScreen(G);
    World.emitNotes(p.x - 8, p.y - 62, 3, true);
    if (!G.reduced) setTimeout(() => {
      // the echo returns, smaller, from the far ridge
      World.emitNotes(World.W * 0.22, World.H * 0.3, 2);
    }, 700);
  }
  function onWorldEvent(kind) {
    if (kind === 'gag:marmot') playSound('marmot');
    else if (kind.indexOf('gagnote:') === 0) playSound('chime', +kind.slice(8));
  }

  /* ---------- the summit book ---------- */
  function openBook(slug, opts) {
    opts = opts || {};
    currentBook = slug;
    Reader.fill(slug);
    $('book').hidden = false;
    G.dimWorld = true;
    playSound('page');
    duck(true);

    const signed = G.signedSet.has(slug);
    const atSummit = G.scene && G.scene.slug === slug && G.mode === 'summit';
    const sign = $('btn-sign');
    sign.classList.toggle('signed', signed);
    sign.textContent = signed ? '✓ Signed' : (atSummit ? 'Sign the book' : 'Climb or hike to sign');
    sign.disabled = signed;
    sign.onclick = () => {
      if (signed) return;
      if (atSummit) {
        G.signedSet.add(slug);
        if (!PLANCHE) saveSet('alp.signed', G.signedSet);
        G.signedHere = true;
        sign.classList.add('signed'); sign.textContent = '✓ Signed'; sign.disabled = true;
        updateHud();
        playSound('sign');
        if (Model.uncited.includes(slug)) caption('First Traverse. An open problem, topped out.', 3200);
        else caption('Signed. Your stone joins the cairn: ' + G.signedSet.size + ' / 290.', 2600);
      } else {
        closeBook();
        World.irisCut(() => {
          Game.startRoute(slug, { snap: true });
          caption('At the foot of ' + titleOf(slug) + '. Hold to reach.', 3000);
        });
      }
    };

    // the care act: frost arms re-coil
    const rec = $('btn-recoil');
    const isFrost = freshState(slug) === 'frost';
    rec.hidden = !isFrost || !atSummit;
    if (!rec.hidden) {
      rec.textContent = (G.tendedSet && G.tendedSet.has(slug)) ? '✓ Tended by a reader' : 'Re-coil the rope';
      rec.onclick = () => {
        G.tendedSet.add(slug);
        if (!PLANCHE) saveSet('alp.tended', G.tendedSet);
        rec.textContent = '✓ Tended by a reader';
        caption('Route tended. Worn rope? The Guides’ Bureau takes reports.', 3200);
      };
    }
    $('btn-report').href = editUrlOf(slug);

    if (opts.anchor) {
      const el = document.getElementById(opts.anchor);
      if (el) el.scrollIntoView({ block: 'start' });
    } else {
      $('book-scroll').scrollTop = 0;
    }
    if (location.hash !== '#/' + slug.replace(/^\//, '') && !opts.noHash) {
      history.replaceState(null, '', '#' + slug + (opts.anchor ? '@' + opts.anchor : ''));
    }
  }

  function closeBook() {
    $('book').hidden = true;
    G.dimWorld = false;
    G.tautRope = null;
    $('fakecursor').hidden = true;
    currentBook = null;
    duck(false);
    history.replaceState(null, '', location.pathname + location.search);
    updateHud();
  }

  /* internal links: reading never waits; the world quietly follows */
  $('book-content').addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#/')) {
      e.preventDefault();
      const rest = href.slice(2);
      const slug = '/' + rest.split(/[@#]/)[0];
      const anchor = (rest.match(/[@#](.+)$/) || [])[1];
      if (Model.pages[slug]) {
        openBook(slug, { anchor });
        // behind the panel, the world irises to stand where you read
        if (G.scene && G.scene.slug !== slug) {
          World.irisCut(() => {
            Game.startRoute(slug, { snap: true });
            G.mode = 'summit'; G.pitchIdx = Model.pages[slug].headings.filter(h => h.level === 2).length;
            G.holdIdx = G.scene.holds.length - 1; G.dimWorld = true;
            buildRopeChips(slug);
          });
        }
      }
    } else if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.getElementById(href.slice(1));
      if (el) el.scrollIntoView({ behavior: G.reduced ? 'auto' : 'smooth', block: 'start' });
    }
  });
  $('book-content').addEventListener('mouseover', e => {
    const a = e.target.closest('a[href^="#/"]');
    if (a) {
      const slug = '/' + a.getAttribute('href').slice(2).split(/[@#]/)[0];
      if (Model.pages[slug]) G.tautRope = titleOf(slug);
    }
  });
  $('book-content').addEventListener('mouseout', e => {
    if (e.target.closest('a[href^="#/"]') && !PLANCHE) G.tautRope = null;
  });

  /* ---------- fixed ropes (the descent is the citation graph) ---------- */
  function buildRopeChips(slug) {
    const list = $('ropes').querySelector('.ropes-list');
    list.innerHTML = '';
    const outs = Model.out[slug] || [];
    if (!outs.length) {
      list.innerHTML = '<div style="font-size:12px;opacity:.6">No fixed ropes lead on from here. Walk down by the Index.</div>';
      return;
    }
    outs.slice(0, 8).forEach(t => {
      const b = document.createElement('button');
      b.className = 'rope-chip';
      b.innerHTML = titleOf(t) + ' <span class="rm">' + heightOf(t).toLocaleString('en-US') + ' m</span>';
      b.onclick = () => { closeBook(); Game.rappelTo(t); };
      b.onmouseenter = () => { G.tautRope = titleOf(t); };
      b.onmouseleave = () => { if (!PLANCHE) G.tautRope = null; };
      list.appendChild(b);
    });
  }

  /* ---------- search (instant, over 290 titles/descriptions/tags) ---------- */
  let searchSel = -1;
  function doSearch(q) {
    const res = $('searchresults');
    q = q.trim().toLowerCase();
    if (!q) { res.hidden = true; return; }
    const hits = [];
    for (const slug of Model.order) {
      const pg = Model.pages[slug];
      const hay = (pg.title + ' ' + (pg.description || '') + ' ' + (pg.tags || []).join(' ')).toLowerCase();
      if (hay.includes(q)) {
        hits.push(slug);
        if (hits.length >= 12) break;
      }
    }
    res.innerHTML = '';
    hits.forEach((slug, i) => {
      const m = Model.massifOf[slug];
      const b = document.createElement('button');
      b.className = 'sr-item' + (i === 0 ? ' sel' : '');
      b.innerHTML = '<div class="t">' + titleOf(slug) + '</div><div class="m">' + m.label + ' · ' +
        heightOf(slug).toLocaleString('en-US') + ' m · ' + gradeOf(slug) + '</div>';
      b.onclick = () => { res.hidden = true; $('search').value = ''; openBook(slug, {}); };
      res.appendChild(b);
    });
    searchSel = hits.length ? 0 : -1;
    res.hidden = hits.length === 0;
  }

  /* ---------- Index gazetteer (product + section only, the law) ---------- */
  function buildIndexPanel() {
    const body = $('indexbody');
    body.innerHTML = '';
    for (const m of Model.massifs) {
      const d = document.createElement('div');
      d.className = 'ix-massif';
      d.innerHTML = '<h3>' + m.label + ', ' + m.count + ' summit' + (m.count > 1 ? 's' : '') + '</h3>';
      for (const slug of m.slugs) {
        const a = document.createElement('a');
        a.href = '#' + slug;
        a.className = freshState(slug) === 'alpenglow' ? 'fresh' : (freshState(slug) === 'frost' ? 'frost' : '');
        a.innerHTML = '<span>' + titleOf(slug) + '</span><span class="im">' +
          heightOf(slug).toLocaleString('en-US') + ' m · ' + gradeOf(slug) + '</span>';
        a.onclick = e => { e.preventDefault(); $('indexpanel').hidden = true; openBook(slug, {}); };
        d.appendChild(a);
      }
      body.appendChild(d);
    }
  }

  /* ---------- the Almanac: every rule, present tense, no secrets ---------- */
  function buildAlmanac() {
    const fa = Model.firstAscent;
    const nightRows = Model.nightPages.map(n =>
      '<div>' + titleOf(n.slug) + ': ' + n.night + ' night ascent' + (n.night > 1 ? 's' : '') + '</div>').join('');
    const openRows = Model.uncited.map(s => '<div>' + titleOf(s) + '</div>').join('');
    $('almanacbody').innerHTML =
      '<p>The Bureau’s ledger of every ascent logged since the range opened. ' +
      'First ascent: <b>' + fmtDate(fa.date) + '</b> (' + titleOf(fa.slug) + '). ' +
      '<b>77 guides</b> have opened and maintained <b>290 routes</b> joined by <b>1,231 fixed ropes</b>.</p>' +

      '<h3>How the range works</h3>' +
      '<ul style="padding-left:20px">' +
      '<li>Every summit is one real documentation page. Its height in meters is the page’s exact word count.</li>' +
      '<li>A route’s pitches are the page’s real second-level headings, in order, with their true names.</li>' +
      '<li>Hold to reach: the free hand swings on a pendulum (1.2 s period, 28 degree green window). On crux pitches, the ones whose section holds code, the window narrows to 16 degrees at 0.9 s.</li>' +
      '<li>A slip sags you back one hold, never past the last piton. There is no death and no fail screen.</li>' +
      '<li>Grip drains while you hold and refills at ledges. An empty bag means a breather at the piton, nothing worse.</li>' +
      '<li>Any route can be hiked instead: an automatic walk-up, no timing, no badges withheld except the climb itself.</li>' +
      '<li>Every rope you can rappel is one real citation between two pages. No rope exists that the corpus did not write.</li>' +
      '<li>Search and the Index open any page instantly. Climbing is never in the way of reading.</li>' +
      '</ul>' +

      '<h3>Route grades, the published formula</h3>' +
      '<p>density = code blocks + tables on the route. Grade by corpus quantile cuts:</p>' +
      '<table><tr><th>Grade</th><th>F</th><th>PD</th><th>AD</th><th>D</th><th>TD</th><th>ED</th></tr>' +
      '<tr><td>density ≥</td><td>0</td><td>1</td><td>4</td><td>7</td><td>17</td><td>28</td></tr></table>' +

      '<h3>The living world</h3>' +
      '<p>The ranges wear five painted moods, assigned by their official section: ' +
      'Getting Started climbs in meadow light; Features and AI climb among pines; ' +
      'Content APIs, Configurations, Development, TypeScript, the CLI and Plugins development climb granite crags; ' +
      'Upgrades climbs glacier ice; every Cloud section climbs above the cloud line. ' +
      'The mood is paint only: groupings, counts and signs always speak product and section.</p>' +
      '<p>A day passes in about four and a half minutes: dawn, day, golden hour, dusk, night. ' +
      'Weather rotates between clear air, a puffing breeze, snow and fog, easing from one to the next. ' +
      'The tallest neighbor peak dozes. The sun blinks. Clouds puff. ' +
      'A small repertory of gags (a bird tipping its hat, a whistling marmot, a shimmying pine, a blooming flower, ' +
      'a rock that opens one eye, ringing icicles, a butterfly, a puffing cloud, a passing balloon, a chewing goat, ' +
      'a snail in a top hat) rotates through the scene, never the same gag twice at once. ' +
      'The camera keeps the climber close and breathes with the climb, easing wider at belays, summits and open books. ' +
      'All of it is decoration; none of it is data.</p>' +

      '<h3>The 12 night ascents (by headlamp)</h3><div class="cols2">' + nightRows + '</div>' +
      '<h3>The 50 open problems, faces no fixed rope has reached</h3><div class="cols2">' + openRows + '</div>' +

      '<h3>Light</h3><p>Alpenglow touches summits signed within 90 days. Frost rimes ropes unsigned past two years: ' +
      're-coil them, and report worn ropes to the Guides’ Bureau.</p>' +

      '<h3>Sound of the era</h3><p>Every sound is synthesized in the page in a quiet 1930s vocabulary: ' +
      'muted brass, slide whistle, xylophone, pizzicato, and one yodel with a real echo. No recorded samples. ' +
      'Sound stays gentle, ducks to a murmur while the summit book is open, and the toggle in the top bar silences it entirely. ' +
      'Nothing in the game needs audio.</p>' +

      '<h3>Your marks</h3><p>Signatures, tended routes and your cairn stones live in this browser’s storage only. ' +
      'They are always drawn in your rope-red and never counterfeit a fact from the corpus.</p>' +

      '<h3>Reduced motion</h3><p>With reduced motion set, the pendulum becomes a no-timing reach, rappels become captioned cuts, ' +
      'the camera holds one mid-close framing, gags and weather hold still, and the film grain stops boiling. Every page, signature and badge stays reachable.</p>' +

      '<p style="margin-top:18px"><button class="replay">Replay the title cards</button></p>';

    $('almanacbody').querySelector('button.replay').onclick = () => {
      $('almanac').hidden = true;
      showTitleCards();
    };
  }

  /* ---------- SOUND: the 1930s orchestra, synthesized, gentle ---------- */
  function ensureAudio() {
    if (audio) return audio;
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const master = ac.createGain(); master.gain.value = 0.16;
      const duckG = ac.createGain(); duckG.gain.value = 1;
      duckG.connect(master); master.connect(ac.destination);
      // the mountain echo bus (for the yodel)
      const delay = ac.createDelay(1.2); delay.delayTime.value = 0.27;
      const fb = ac.createGain(); fb.gain.value = 0.34;
      const wet = ac.createGain(); wet.gain.value = 0.4;
      delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(duckG);
      audio = { ac, master, duck: duckG, echo: delay };
    } catch (e) { audio = null; }
    return audio;
  }
  function duck(on) {
    if (!audio) return;
    try { audio.duck.gain.setTargetAtTime(on ? 0.22 : 1, audio.ac.currentTime, 0.25); } catch (e) {}
  }
  /* voices */
  function vXylo(f, when, vel, toEcho) {
    const { ac, duck: bus, echo } = audio;
    const t0 = when || ac.currentTime;
    const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = f;
    o2.type = 'sine'; o2.frequency.value = f * 4.1;
    const g2 = ac.createGain(); g2.gain.value = 0.18;
    g.gain.setValueAtTime((vel || 0.4), t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.32);
    o.connect(g); o2.connect(g2); g2.connect(g);
    g.connect(bus);
    if (toEcho) g.connect(echo);
    o.start(t0); o2.start(t0); o.stop(t0 + 0.35); o2.stop(t0 + 0.35);
  }
  function vSlide(f0, f1, dur, vel, when) {
    const { ac, duck: bus } = audio;
    const t0 = when || ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t0 + dur);
    // gentle vibrato, the slide-whistle wobble
    const lfo = ac.createOscillator(), lg = ac.createGain();
    lfo.frequency.value = 7; lg.gain.value = f0 * 0.012;
    lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vel || 0.22, t0 + 0.05);
    g.gain.setValueAtTime(vel || 0.22, t0 + dur - 0.08);
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(bus);
    o.start(t0); lfo.start(t0); o.stop(t0 + dur + 0.05); lfo.stop(t0 + dur + 0.05);
  }
  function vBrass(f, dur, vel, when) {
    const { ac, duck: bus } = audio;
    const t0 = when || ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain(), bp = ac.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = f;
    bp.type = 'bandpass'; bp.Q.value = 3.2;
    bp.frequency.setValueAtTime(f * 1.4, t0);
    bp.frequency.linearRampToValueAtTime(f * 3.4, t0 + dur * 0.55);   // the wah opens
    bp.frequency.linearRampToValueAtTime(f * 1.8, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vel || 0.16, t0 + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(bp); bp.connect(g); g.connect(bus);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function vPizz(f, when, vel) {
    const { ac, duck: bus } = audio;
    const t0 = when || ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = f;
    lp.type = 'lowpass'; lp.frequency.value = f * 3;
    g.gain.setValueAtTime(vel || 0.3, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.14);
    o.connect(lp); lp.connect(g); g.connect(bus);
    o.start(t0); o.stop(t0 + 0.16);
  }
  function vWhistle(seq, when) {
    const { ac, duck: bus } = audio;
    let t0 = when || ac.currentTime;
    for (const [f, d] of seq) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(f, t0);
      o.frequency.linearRampToValueAtTime(f * 1.02, t0 + d);
      const lfo = ac.createOscillator(), lg = ac.createGain();
      lfo.frequency.value = 6; lg.gain.value = f * 0.01;
      lfo.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.12, t0 + 0.03);
      g.gain.linearRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(bus);
      o.start(t0); lfo.start(t0); o.stop(t0 + d + 0.02); lfo.stop(t0 + d + 0.02);
      t0 += d + 0.03;
    }
  }
  const YODEL = [[392, .14], [659, .16], [523, .12], [659, .16], [784, .3], [659, .12], [523, .2]];
  function vYodel() {
    const { ac, duck: bus, echo } = audio;
    let t0 = ac.currentTime + 0.05;
    for (const [f, d] of YODEL) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f * 0.98, t0);
      o.frequency.exponentialRampToValueAtTime(f, t0 + 0.04);  // little scoops between chest and head voice
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.2, t0 + 0.03);
      g.gain.linearRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(bus); g.connect(echo);
      o.start(t0); o.stop(t0 + d + 0.02);
      t0 += d;
    }
  }
  function vPage() {
    const { ac, duck: bus } = audio;
    const len = Math.floor(ac.sampleRate * 0.22);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ac.createBufferSource(); s.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1600;
    const g = ac.createGain(); g.gain.value = 0.18;
    s.connect(f); f.connect(g); g.connect(bus); s.start();
  }

  const XSCALE = [523, 587, 659, 784, 880, 1047];
  function playSound(kind, arg) {
    if (!soundOn) return;
    if (!ensureAudio()) return;
    try {
      if (audio.ac.state === 'suspended') audio.ac.resume();
      switch (kind) {
        case 'latch': vXylo(XSCALE[(arg || 0) % 6], 0, 0.4); break;
        case 'slip': vSlide(820, 300, 0.4, 0.16); break;
        case 'ledge': vBrass(196, 0.5, 0.15); vBrass(262, 0.42, 0.12, audio.ac.currentTime + 0.16); break;
        case 'yodel': vYodel(); break;
        case 'rappel': vSlide(1150, 330, 1.5, 0.14); break;
        case 'page': vPage(); break;
        case 'sign': vPizz(392); vPizz(523, audio.ac.currentTime + 0.09); vPizz(659, audio.ac.currentTime + 0.18); break;
        case 'step': vPizz(180 + Math.random() * 60, 0, 0.14); break;
        case 'whistle': vWhistle([[880, .16], [1108, .2], [988, .28]]); break;
        case 'marmot': vWhistle([[1320, .1], [1580, .14]]); break;
        case 'chime': vXylo(XSCALE[(arg || 0) % 6] * 1.5, 0, 0.16); break;
      }
    } catch (e) {}
  }

  /* ---------- UI wiring ---------- */
  function wireUi() {
    $('search').addEventListener('input', e => doSearch(e.target.value));
    $('search').addEventListener('keydown', e => {
      const res = $('searchresults');
      const items = [...res.querySelectorAll('.sr-item')];
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        searchSel = Math.max(0, Math.min(items.length - 1, searchSel + (e.key === 'ArrowDown' ? 1 : -1)));
        items.forEach((it, i) => it.classList.toggle('sel', i === searchSel));
      } else if (e.key === 'Enter' && items[searchSel]) {
        items[searchSel].click();
      } else if (e.key === 'Escape') {
        res.hidden = true; e.target.blur();
      }
    });
    $('btn-index').onclick = () => { $('indexpanel').hidden = !$('indexpanel').hidden; $('almanac').hidden = true; };
    $('btn-almanac').onclick = () => { $('almanac').hidden = !$('almanac').hidden; $('indexpanel').hidden = true; };
    document.querySelectorAll('.op-close').forEach(b => b.onclick = () => b.parentElement.hidden = true);
    $('book-close').onclick = closeBook;
    $('btn-peek').onclick = () => {
      const sc = G.scene;
      const L = sc.ledges[Math.max(0, G.pitchIdx - 1)];
      openBook(sc.slug, { anchor: L ? L.id : null });
    };
    $('btn-hike').onclick = () => { Game.hike(); caption('Hiking up. A slow walk, no badges.', 2200); };
    $('btn-sound').onclick = function () {
      soundOn = !soundOn;
      saveFlag('alp.sound', soundOn ? 'on' : 'off');
      if (soundOn) { ensureAudio(); if (audio) audio.ac.resume(); }
      this.setAttribute('aria-pressed', String(soundOn));
      this.title = 'Sound (' + (soundOn ? 'on' : 'off') + ')';
    };

    // title-card controls
    document.querySelectorAll('.tcard-next').forEach(b => b.onclick = advanceCard);
    document.querySelectorAll('.tcard-skip').forEach(b => b.onclick = endCards);

    window.addEventListener('keydown', e => {
      const inField = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
      if (inField) return;
      if (!$('titlecards').hidden) {
        if (e.key === 'Escape') endCards();
        else if (e.key === 'Enter' || e.key === 'ArrowRight') advanceCard();
        return;
      }
      if (e.key === '/') { e.preventDefault(); $('search').focus(); }
      else if (e.key === 'i' || e.key === 'I') $('btn-index').click();
      else if (e.key === 'm' || e.key === 'M') $('btn-index').click();
      else if (e.key === 'r' || e.key === 'R') {
        const first = $('ropes').querySelector('.rope-chip');
        if (first && G.mode === 'summit') first.click();
      } else if (e.key === 'Escape') {
        if (!$('book').hidden) closeBook();
        $('indexpanel').hidden = true; $('almanac').hidden = true;
        $('searchresults').hidden = true;
      }
    });

    window.addEventListener('hashchange', () => {
      const t = parseHash();
      if (t) openBook(t.slug, { anchor: t.anchor, noHash: true });
    });

    // audio may only start on a gesture; resume quietly on the first one
    const firstGesture = () => {
      if (soundOn && ensureAudio()) { try { audio.ac.resume(); } catch (e) {} }
      window.removeEventListener('pointerdown', firstGesture);
      window.removeEventListener('keydown', firstGesture);
    };
    window.addEventListener('pointerdown', firstGesture);
    window.addEventListener('keydown', firstGesture);
  }

  function parseHash() {
    const h = decodeURIComponent(location.hash || '');
    if (!h.startsWith('#/')) return null;
    const [path, anchor] = h.slice(1).split('@');
    return Model.pages[path] ? { slug: path, anchor } : null;
  }

  /* =================================================================
     PLANCHES: deterministic states for the committed shots
     ================================================================= */
  function seededProgress(n) {
    const set = new Set();
    const rnd = rngFor('planche-progress');
    const pool = [...Model.order];
    while (set.size < n && pool.length) {
      const i = Math.floor(rnd() * pool.length);
      set.add(pool.splice(i, 1)[0]);
    }
    return set;
  }

  function setupPlanche(n) {
    document.body.classList.add('planche');
    if (n === 1) {
      /* THE ARRIVAL: first paint, playable instant */
      G.signedSet = new Set();
      Game.startRoute('/cms/quick-start', { snap: true, grip: 92 });
      World.forceWeather('breeze');
      const bird = World.forceGag('bird');
      if (bird) { bird.t = 3.2; bird.dir = 1; bird.y = 150; }
      const end0 = Game.pitchEndIdx(0);
      G.holdIdx = Math.max(0, end0 - 3);
      G.holding = true;
      G.reach = 1;
      G.sweep = (G.window / 2) * 0.92;
      caption('Hold to reach. Release in the <span class="green">green</span>.', 0);
      updateHud();
      World.camY = Math.max(0, G.scene.holds[G.holdIdx].y - World.H * 0.44);
      G.snapCamera = true;
      requestAnimationFrame(() => requestAnimationFrame(() => Game.freeze(700)));
    }

    if (n === 2) {
      /* THE SUMMIT BOOK: reading a real page in the world */
      G.signedSet = seededProgress(87);
      const slug = '/cms/features/media-library';
      Game.startRoute(slug, { snap: true });
      G.pitchIdx = G.scene.pitches.length - 1;
      G.holdIdx = G.scene.holds.length - 1;
      G.mode = 'summit';
      G.signedHere = G.signedSet.has(slug);
      buildRopeChips(slug);
      openBook(slug, { summit: true, noHash: true });
      G.dimWorld = true;
      G.tautRope = titleOf('/cms/api/rest/upload');
      updateHud();
      World.camY = Math.max(0, G.scene.summitY + 200 - World.H);
      G.snapCamera = true;
      return new Promise(res => setTimeout(() => { planche2Scroll(); res(); }, 900));
    }

    if (n === 3) {
      /* THE COL OF FIFTY-SEVEN ROPES: dusk spectacle */
      G.signedSet = seededProgress(124);
      document.body.classList.add('night');
      const slug = '/cms/migration/v4-to-v5/breaking-changes';
      Game.startRoute(slug, { snap: true });
      World.setTheme('dusk');
      World.forceWeather('clear');
      G.pitchIdx = G.scene.pitches.length - 1;
      G.holdIdx = G.scene.holds.length - 1;
      G.mode = 'rappel';
      const target = '/cms/migration/v4-to-v5/breaking-changes/entity-service-deprecated';
      const c = World.rappelCurve(G.scene, G);
      G.rappel = { curve: c, s: 0.45, label: titleOf(target), target, wy: 0, dur: 1e9 };
      G.showLogStrip = true;
      $('caption').hidden = true;
      $('gripmeter').hidden = true;
      $('topocard').hidden = true;
      $('trailsign').hidden = true;
      $('ropes').hidden = true;
      updateHud();
      $('topocard').hidden = true; $('trailsign').hidden = true; $('gripmeter').hidden = true;
      World.camY = Math.max(0, G.scene.summitY - World.H * 0.58);
      G.snapCamera = true;
      requestAnimationFrame(() => requestAnimationFrame(() => Game.freeze(400)));
    }
  }

  /* planche 2: scroll the book to a stretch that shows an open tab control,
     a tip admonition, a code block with Copy, a real screenshot, a table edge */
  function planche2Scroll() {
    const sc = $('book-scroll');
    const content = $('book-content');
    const yOf = el => el.getBoundingClientRect().top + sc.scrollTop - sc.getBoundingClientRect().top;
    const tabs = [...content.querySelectorAll('.tabs')];
    const tables = [...content.querySelectorAll('.tbl-wrap')];
    const figs = [...content.querySelectorAll('figure')];
    const adms = [...content.querySelectorAll('.adm')];
    let best = null;
    for (const t of tabs) {
      const y = yOf(t);
      const tblAbove = tables.some(e => { const v = yOf(e); return v < y && v > y - 560; });
      const admBelow = adms.some(e => { const v = yOf(e); return v > y && v < y + 640; });
      const figBelow = figs.some(e => { const v = yOf(e); return v > y && v < y + 1050; });
      if (tblAbove && admBelow && figBelow) { best = t; break; }
    }
    const target = best || tabs[0];
    if (target) sc.scrollTop = Math.max(0, yOf(target) - 197);
    setTimeout(() => {
      const links = [...content.querySelectorAll('a[href^="#/"]')];
      const scRect = sc.getBoundingClientRect();
      const vis = links.find(a => {
        const r = a.getBoundingClientRect();
        return r.top > scRect.top + 90 && r.bottom < scRect.bottom - 120 && r.width > 0;
      });
      if (vis) {
        vis.classList.add('hoverlit');
        const r = vis.getBoundingClientRect();
        const fc = $('fakecursor');
        fc.style.left = (r.left + r.width * 0.6) + 'px';
        fc.style.top = (r.top + r.height * 0.55) + 'px';
        fc.hidden = false;
        const slug = '/' + vis.getAttribute('href').slice(2).split('@')[0];
        if (Model.pages[slug]) G.tautRope = titleOf(slug);
      }
      requestAnimationFrame(() => requestAnimationFrame(() => Game.freeze(400)));
    }, 250);
  }

  window.__planche = PLANCHE;
  window.__setPanelScroll = px => { $('book-scroll').scrollTop = px; };

})();
