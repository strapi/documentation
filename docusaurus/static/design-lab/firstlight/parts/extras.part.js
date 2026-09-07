
  /* ------------------------------------------------- announcements ----- */
  /* New instruments introduce themselves once, in plain English. */

  function announceOnce(key, html) {
    if (announced[key]) return;
    announced[key] = 1;
    logLine(html, true);
  }

  /* ------------------------------------------------ THE HALL OF HANDS -- */
  /* The probe's deep scan of the system's human stratum: the 77 real
     hands (union of provenance.authors) as ochre stencils on a dark wall.
     Stencil size = pages touched; row = first-active date, oldest lowest;
     left/right, tilt and splay are seeded from the name itself. */

  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function deriveHands() {
    var map = Object.create(null);
    stars.forEach(function (s) {
      var pv = s.prov;
      (pv.authors || []).forEach(function (a) {
        var h = map[a] || (map[a] = { name: a, first: Infinity, last: -Infinity, pages: 0, chief: 0 });
        h.pages++;
        var f = Date.parse(pv.first || ''), l = Date.parse(pv.last || '');
        if (isFinite(f) && f < h.first) h.first = f;
        if (isFinite(l) && l > h.last) h.last = l;
        if (pv.topAuthor === a) h.chief++;
      });
    });
    HANDS = Object.keys(map).map(function (k) { return map[k]; });
    HANDS.forEach(function (h) { if (!isFinite(h.first)) { h.first = EPOCH; h.last = EPOCH; } });
    /* newest strata read first; the oldest hands settle to the lowest row */
    HANDS.sort(function (a, b) { return b.first - a.first || (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1); });
    maxHandPages = 1;
    HANDS.forEach(function (h) { if (h.pages > maxHandPages) maxHandPages = h.pages; });
  }

  function ym(t) { var d = new Date(t); return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1); }

  /* a negative stencil: ochre pigment blown around the hand, cave-wall style */
  function drawHandStencil(cv, h) {
    var g = cv.getContext('2d');
    var Wc = cv.width, Hc = cv.height;
    var rnd = mulberry32(hashStr(h.name));
    var scale = 0.62 + 0.52 * Math.sqrt(h.pages / maxHandPages);
    var flip = rnd() < 0.5 ? -1 : 1;
    var rot = (rnd() - 0.5) * 0.3;
    var cx = Wc / 2 + (rnd() - 0.5) * 8, cy = Hc / 2 + 8;
    var R = 46 * scale + 9;
    var dots = Math.min(2600, 380 + h.pages * 10);
    for (var k = 0; k < dots; k++) {
      var a = rnd() * Math.PI * 2, rr = Math.pow(rnd(), 0.55) * R;
      var x = cx + Math.cos(a) * rr * 1.02, y = cy + Math.sin(a) * rr * 1.14;
      var p = rnd();
      g.fillStyle = 'rgba(' + (p < 0.6 ? '196,110,42' : p < 0.85 ? '169,82,31' : '224,142,64') + ',' + (0.05 + rnd() * 0.24).toFixed(3) + ')';
      g.fillRect(x, y, rnd() < 0.8 ? 1 : 2, rnd() < 0.8 ? 1 : 2);
    }
    /* carve the hand out of the pigment */
    g.save();
    g.translate(cx, cy);
    g.rotate(rot);
    g.scale(flip * scale, scale);
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = '#000'; g.strokeStyle = '#000'; g.lineCap = 'round';
    g.beginPath(); g.ellipse(0, 16, 15.5, 20, 0, 0, 6.2832); g.fill();
    g.fillRect(-10.5, 30, 21, 18);                       /* wrist */
    var splay = (rnd() - 0.5) * 0.14;
    var tips = [[-11, -32, 16], [-3.6, -38, 8.6], [3.6, -35.5, 8.6], [10.8, -26, 7.4]];
    for (var f = 0; f < 4; f++) {
      var bx = tips[f][0], ty = tips[f][1];
      var tx = bx * 1.45 + splay * 26 * (f - 1.5);
      g.lineWidth = f === 0 ? 8.6 : f === 3 ? 7.4 : 8.6;
      g.beginPath(); g.moveTo(bx, 0); g.lineTo(tx, ty); g.stroke();
    }
    g.lineWidth = 9.4;
    g.beginPath(); g.moveTo(-11, 19); g.lineTo(-29, 1); g.stroke();
    g.restore();
  }

  function buildHandsWall() {
    if (handsBuilt) return;
    handsBuilt = true;
    var wall = $('hh-wall');
    var frag = document.createDocumentFragment();
    HANDS.forEach(function (h) {
      var tile = document.createElement('div');
      tile.className = 'hh-tile';
      tile.setAttribute('data-name', h.name);
      tile.setAttribute('data-explain', 'Active ' + ym(h.first) + ' to ' + ym(h.last) + ' · touched ' +
        h.pages + ' of ' + stars.length + ' pages' + (h.chief ? ' · chief surveyor on ' + h.chief : ''));
      var cv = document.createElement('canvas');
      cv.width = 128; cv.height = 118;
      drawHandStencil(cv, h);
      tile.appendChild(cv);
      var nm = document.createElement('div'); nm.className = 'hh-name'; nm.textContent = h.name;
      var dt = document.createElement('div'); dt.className = 'hh-dates'; dt.textContent = ym(h.first) + ' → ' + ym(h.last);
      var mt = document.createElement('div'); mt.className = 'hh-meta';
      mt.textContent = h.pages + (h.pages === 1 ? ' page' : ' pages') + (h.chief ? ' · chief on ' + h.chief : '');
      tile.appendChild(nm); tile.appendChild(dt); tile.appendChild(mt);
      frag.appendChild(tile);
    });
    wall.appendChild(frag);
    var oldest = HANDS.length ? HANDS[HANDS.length - 1] : null;
    $('hh-sub').textContent = 'ALL ' + HANDS.length + ' HANDS · UNION OF EVERY COMMIT AUTHOR ACROSS ' +
      stars.length + ' PAGES · STENCIL SIZE = PAGES TOUCHED · OLDEST HANDS LOWEST' +
      (oldest ? ' (SINCE ' + ym(oldest.first) + ')' : '');
  }

  function toggleHands(force) {
    var el = $('hands');
    var open = force === undefined ? el.hidden : force;
    if (open === !el.hidden) return;
    if (open) {
      buildHandsWall();
      el.hidden = false;
      $('handsbtn').setAttribute('aria-pressed', 'true');
      var wall = $('hh-wall');
      wall.scrollTop = wall.scrollHeight;   /* the scan reads the oldest stratum first */
      announceOnce('hall', 'THE HALL OF HANDS · all <b>' + HANDS.length + '</b> people who ever committed to these pages, as ochre stencils · stencil size = pages touched · oldest hands lowest · key H');
      if (audioOn && rack && !hallNodes) { try { hallNodes = buildHallPad(rack, AC.currentTime + 0.02); } catch (e) { hallNodes = null; } }
    } else {
      el.hidden = true;
      $('handsbtn').setAttribute('aria-pressed', 'false');
      if (hallNodes) { releaseNodes(hallNodes, 1.6); hallNodes = null; }
    }
  }

  /* --------------------------------------- name + one-liner on hover --- */
  /* Anything carrying data-explain introduces itself on hover or focus. */

  var exEl = null;
  function initExplain() {
    exEl = document.createElement('div');
    exEl.id = 'explain';
    exEl.hidden = true;
    document.body.appendChild(exEl);
    function target(e) { return e.target && e.target.closest ? e.target.closest('[data-explain]') : null; }
    function show(t) {
      var name = t.getAttribute('data-name') || (t.textContent || '').trim().slice(0, 26);
      exEl.innerHTML = '<b>' + esc(name) + '</b><span>' + esc(t.getAttribute('data-explain')) + '</span>';
      exEl.hidden = false;
      var r = t.getBoundingClientRect(), er = exEl.getBoundingClientRect();
      var x = clamp(r.left + r.width / 2 - er.width / 2, 6, W - er.width - 6);
      var y = r.bottom + 8;
      if (y + er.height > H - 6) y = r.top - er.height - 8;
      exEl.style.left = x + 'px';
      exEl.style.top = Math.max(6, y) + 'px';
    }
    document.addEventListener('mouseover', function (e) {
      var t = target(e);
      if (t) show(t); else if (!exEl.hidden) exEl.hidden = true;
    });
    document.addEventListener('focusin', function (e) { var t = target(e); if (t) show(t); });
    document.addEventListener('focusout', function () { exEl.hidden = true; });
  }

  /* ------------------------------------- WHAT AM I LOOKING AT (key ?) -- */
  /* An annotated overlay: one callout per on-screen element, a line to
     each. Rebuilt at open and on resize; Escape closes; gates nothing. */

  function anRect(id) {
    var el = $(id);
    if (!el || el.hidden) return null;
    var r = el.getBoundingClientRect();
    return (r.width || r.height) ? r : null;
  }

  function buildAnnotate() {
    var items = [];
    function add(name, text, tx, ty, bx, by) {
      items.push({ n: name, t: text, tx: tx, ty: ty, bx: clamp(bx, 8, W - 248), by: clamp(by, 54, H - 200) });
    }
    var b = stars[beaconIdx()];
    var px = clamp(b.sx || W / 2, 160, W - 430);
    var py = clamp(b.sy || H / 2, 330, H - 290);
    add('THE WATERFALL', 'Each faint ray into the bright body is a real page citing it; each traveling dot is one citation arriving. ' + b.m + ' pages cite the current beacon, ' + b.desig + '.', px, py, px + 70, py - 140);
    add('THE LOCK', current != null
      ? 'The white reticle marks the locked page. Opening a page locks it, and every instrument on screen reads that page.'
      : 'Click any lit body to lock on: a white reticle will mark it and every instrument will read that page.', px, py, px + 70, py + 36);
    var r = anRect('photom');
    if (r) add('PHOTOMETER', 'The locked beacon’s incoming light, six seconds at a time. Bumps are citations arriving; a deep notch means an uncited page is crossing in front.', r.left + r.width / 2, r.top + 8, r.left + r.width / 2 - 270, r.top - 132);
    r = anRect('log');
    if (r) add('MISSION LOG', 'Every event of the survey, written as it happens: locks, surveys, transits, first contacts, new instruments. Newest at the bottom.', r.left + 150, r.top + r.height - 34, r.left + 34, r.top - 132);
    r = anRect('inst');
    if (r) add('SURVEY READINGS', 'The locked page’s measurements: citations in and out, spectral class, word mass, commit strata, and the crew who wrote it.', r.right - 10, r.top + 130, r.right + 30, r.top + 240);
    r = anRect('chartmeter');
    if (r) add('THE CHART', stars.length + ' pages exist; the counter is how many you have fixed by surveying. FULL CHART reveals all of them at once without losing your own chart.', r.left + r.width / 2, r.bottom - 6, r.left + r.width / 2 - 60, 66);
    r = anRect('almbtn');
    if (r) add('THE ALMANAC', 'The old engraved atlas: dotted ghosts where each page is filed, dashed vectors to where its citations actually put it. ' + DRIFT_N + ' bodies disagree.', r.left + r.width / 2, r.bottom - 6, r.left + r.width / 2 - 118, 176);
    r = anRect('handsbtn');
    if (r) add('THE HANDS', 'The Hall of Hands: all ' + HANDS.length + ' people who ever committed to these pages, as ochre stencils, oldest lowest. Key: H.', r.left + r.width / 2, r.bottom - 6, r.left + r.width / 2 - 100, 66);
    r = anRect('audiobtn');
    if (r) add('THE SOUND', 'On by default. Every sound is a measurement: pings are commits, a falling sweep is a transit, the low thump is first contact. SOUND silences it.', r.left + r.width / 2, r.bottom - 6, r.left + r.width / 2 - 20, 66);
    r = anRect('q');
    if (r) add('THE SEARCH', 'Instant search across all ' + stars.length + ' pages; the chart leans toward the strongest return while you type. Key: /.', r.left + r.width / 2, r.bottom - 4, r.left + r.width / 2 - 200, 176);

    var svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">'];
    var html = [];
    items.forEach(function (it) {
      svg.push('<line x1="' + it.tx.toFixed(1) + '" y1="' + it.ty.toFixed(1) + '" x2="' + (it.bx + 120) + '" y2="' + (it.by + 34) + '" stroke="rgba(237,242,240,.4)" stroke-width="1"/>');
      svg.push('<circle cx="' + it.tx.toFixed(1) + '" cy="' + it.ty.toFixed(1) + '" r="3.5" fill="none" stroke="rgba(255,176,0,.9)" stroke-width="1"/>');
      html.push('<div class="an-c" style="left:' + it.bx + 'px;top:' + it.by + 'px"><b>' + esc(it.n) + '</b>' + esc(it.t) + '</div>');
    });
    svg.push('</svg>');
    $('an-lines').innerHTML = svg.join('');
    $('an-items').innerHTML = html.join('');
  }

  function toggleAnnotate(force) {
    var el = $('annotate');
    var open = force === undefined ? el.hidden : force;
    if (open === !el.hidden) return;
    if (open) {
      buildAnnotate();
      el.hidden = false;
      announceOnce('annotate', 'WHAT AM I LOOKING AT · press <b>?</b> anytime · every element on screen explained in place · hovering any control also explains it');
    } else {
      el.hidden = true;
    }
  }

  /* ------------------------------------------- the three-step guide ---- */
  /* Shown once per visit, right after the first lock-on. Skippable,
     non-modal, never gates content; it steps aside on Escape and
     dismisses itself once you have surveyed a few bodies. */

  var GUIDE_KEY = 'firstlight.guide.v1';
  var GUIDE_STEPS = [
    ['LOCK ON & SURVEY', 'Click any lit body to lock on and open its page. Opening the page IS the survey: the instruments on the left read the locked page, and the log narrates every measurement.'],
    ['HOW THE MAP GROWS', 'Each survey fixes the page and every page it exchanges citations with. Faint rings are contacts heard one ring further out. Dotted ellipses are silent pages caught in transit — click one for first contact.'],
    ['FULL CHART, SEARCH & HELP', 'FULL CHART (top bar) reveals all 290 pages anytime; your own chart is kept. Press / to search, Tab for the plain catalog, H for the Hall of Hands, ? to have the whole screen explained.']
  ];
  function maybeGuide() {
    if (guideOn) return;
    var seen = false;
    try { seen = sessionStorage.getItem(GUIDE_KEY) === '1'; } catch (e) {}
    if (seen) return;
    try { sessionStorage.setItem(GUIDE_KEY, '1'); } catch (e) {}
    guideOn = true;
    guideStep = 0;
    renderGuideStep();
    $('guide').hidden = false;
  }
  function renderGuideStep() {
    $('gd-step').textContent = 'STEP ' + (guideStep + 1) + '/' + GUIDE_STEPS.length;
    $('gd-body').innerHTML = '<b>' + GUIDE_STEPS[guideStep][0] + '</b>' + GUIDE_STEPS[guideStep][1];
    $('gd-next').textContent = guideStep === GUIDE_STEPS.length - 1 ? 'GOT IT' : 'NEXT →';
  }
  function hideGuide() {
    guideOn = false;
    $('guide').hidden = true;
  }

  /* ------------------------------------------------- round-2 wiring ---- */

  function wireExtras() {
    initExplain();
    $('handsbtn').addEventListener('click', function () { toggleHands(); });
    $('hh-close').addEventListener('click', function () { toggleHands(false); });
    $('hands').addEventListener('click', function (e) { if (e.target === $('hands')) toggleHands(false); });
    $('an-close').addEventListener('click', function () { toggleAnnotate(false); });
    $('an-brief').addEventListener('click', function () { toggleAnnotate(false); $('howto').hidden = false; });
    $('annotate').addEventListener('click', function (e) {
      if (e.target === $('annotate') || e.target.id === 'an-lines' || (e.target.tagName || '').toLowerCase() === 'svg') toggleAnnotate(false);
    });
    $('gd-next').addEventListener('click', function () {
      if (guideStep >= GUIDE_STEPS.length - 1) hideGuide();
      else { guideStep++; renderGuideStep(); }
    });
    $('gd-skip').addEventListener('click', hideGuide);
    window.addEventListener('resize', function () { if (!$('annotate').hidden) buildAnnotate(); });
  }

