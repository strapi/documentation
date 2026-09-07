/* Round-2 patcher: applies all edits to firstlight.js, index.html, firstlight.css. */
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..');

function load(f) { return fs.readFileSync(path.join(DIR, f), 'utf8'); }
function saveF(f, s) { fs.writeFileSync(path.join(DIR, f), s); }
function rep(src, from, to, label) {
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error('replacement "' + label + '" matched ' + n + ' times');
  return src.replace(from, to);
}

/* ============================ firstlight.js ============================ */
let js = load('firstlight.js');

/* header comment: the Hall is the second sanctioned saturated reading */
js = rep(js,
  '   No external libraries. Canvas 2D + DOM. Phosphor amber and signal white\n   on near-black; saturated color exists only inside the spectrograph.',
  '   No external libraries. Canvas 2D + DOM. Phosphor amber and signal white\n   on near-black; saturated color exists only inside instrument readings\n   (the spectrograph, and the ochre of the Hall of Hands deep scan).',
  'header comment');

/* state */
js = rep(js,
  "  var completeShown = false;\n",
  "  var completeShown = false;\n" +
  "  var HANDS = [], handsBuilt = false, maxHandPages = 1;\n" +
  "  var pendingWarp = false;\n" +
  "  var announced = Object.create(null);\n" +
  "  var guideStep = 0, guideOn = false;\n",
  'state vars');

/* boot wiring */
js = rep(js, "    initSearch();\n    restore();", "    initSearch();\n    wireExtras();\n    restore();", 'boot wiring');

/* photometer announces itself at boot */
js = rep(js,
  "    if (visited.size === 0) showPrompt();",
  "    if (visited.size === 0) showPrompt();\n" +
  "    announceOnce('photom', 'INSTRUMENT ONLINE · PHOTOMETER (bottom center) — it graphs the locked beacon" + "\\u2019" + "s incoming light · small bumps are citations arriving · a deep notch means an uncited page is crossing in front');",
  'photom announce');

/* deriveHands at end of prepare() */
js = rep(js, "    $('howto-facts').innerHTML =", "    deriveHands();\n\n    $('howto-facts').innerHTML =", 'deriveHands call');

/* survey: triangulation sound + the /cloud/projects/settings invitation */
js = rep(js,
  "      if (tri > 0) logLine('TRIANGULATED · <b>' + tri + '</b> new bod' + (tri === 1 ? 'y' : 'ies') + ' fixed from the transmissions heard at ' + s.desig);",
  "      if (tri > 0) logLine('TRIANGULATED · <b>' + tri + '</b> new bod' + (tri === 1 ? 'y' : 'ies') + ' fixed from the transmissions heard at ' + s.desig);\n" +
  "      if (tri > 0) sndTriangulated(s.dark ? 1.0 : 4.35);\n" +
  "      if (s.slug === '/cloud/projects/settings') logLine('INVITATION · this page has been tended for <b>' + pv.careDays + '</b> days by ' + (pv.authors || []).length + ' hands · the wall remembers all ' + HANDS.length + ' · press <b>H</b> for THE HALL OF HANDS', true);",
  'survey invitation');

/* survey: the guide steps aside once you clearly know how to survey */
js = rep(js,
  "    hidePrompt();\n    updateMeter();",
  "    hidePrompt();\n    if (guideOn && visited.size >= 4) hideGuide();\n    updateMeter();",
  'guide autohide');

/* route: remember the previous lock */
js = rep(js,
  "    var i = byId[r.slug];\n    current = i;\n    document.title = page.title",
  "    var i = byId[r.slug];\n    var prevCur = current;\n    current = i;\n    document.title = page.title",
  'route prevCur');

/* route: lock / warp sounds + the one-per-visit guide */
js = rep(js,
  "    if (REDUCED) { cam.x = cam.tx; cam.y = cam.ty; cam.s = cam.ts; ghost = null; }\n    survey(i);\n    refreshIndexMarks();",
  "    if (REDUCED) { cam.x = cam.tx; cam.y = cam.ty; cam.s = cam.ts; ghost = null; }\n" +
  "    if (pendingWarp) { safeSnd('warp'); pendingWarp = false; }\n" +
  "    else if (prevCur !== i) safeSnd('lock');\n" +
  "    survey(i);\n    refreshIndexMarks();\n    maybeGuide();",
  'route sounds+guide');

/* transit: the dip gets its noise sweep */
js = rep(js,
  "    transitAnim = { t0: performance.now(), di: di, dur: 1800 };\n    dirty = true;",
  "    transitAnim = { t0: performance.now(), di: di, dur: 1800 };\n    safeSnd('transit');\n    dirty = true;",
  'transit sweep');

/* transit landing: thud + first-time plain-English mark explanation */
js = rep(js,
  "    audioThud();\n    save();",
  "    safeSnd('thud');\n" +
  "    announceOnce('transit', 'NEW MARK · a dotted ellipse is a page nothing cites, caught crossing the light of the beacon — click it to make first contact');\n" +
  "    save();",
  'transit land');

/* loop: expose audio state for the harness */
js = rep(js,
  "    D.state = moving ? 'warp'",
  "    D.audioOn = audioOn; D.audioUnlocked = audioUnlocked; D.bedOn = !!bedNodes;\n    D.state = moving ? 'warp'",
  'diag audio');

/* instruments announce themselves once */
js = rep(js,
  "  function renderInstruments(i) {\n    var s = stars[i];",
  "  function renderInstruments(i) {\n    announceOnce('inst', 'INSTRUMENT ONLINE · SURVEY READINGS (left panel) — the locked page" + "\\u2019" + "s citations in and out, topic class, word mass, commit strata, and crew');\n    var s = stars[i];",
  'inst announce');

/* named, self-explaining instrument canvases */
js = rep(js,
  "    o.push('<canvas id=\"scopecv\" width=\"264\" height=\"56\"></canvas>');",
  "    o.push('<canvas id=\"scopecv\" width=\"264\" height=\"56\" data-name=\"EMISSION SCOPE\" data-explain=\"One upward picket per page citing this one, one downward tick per page it links to. Flatline means nothing cites it.\"></canvas>');",
  'scope canvas');
js = rep(js,
  "    o.push('<canvas id=\"speccv\" width=\"264\" height=\"46\"></canvas>');",
  "    o.push('<canvas id=\"speccv\" width=\"264\" height=\"46\" data-name=\"SPECTROGRAPH\" data-explain=\"The one saturated reading: one emission line per member of this page&#39;s citation community; scattered grains measure impurity.\"></canvas>');",
  'spec canvas');
js = rep(js,
  "    var strata = '<div class=\"strata\">';",
  "    var strata = '<div class=\"strata\" data-name=\"CORE SAMPLE\" data-explain=\"One stratum per commit; mint strata are the commits made at night (00:00-06:00 UTC)\">';",
  'strata attrs');
js = rep(js,
  "    o.push('<div class=\"crew\">');",
  "    o.push('<div class=\"crew\" data-name=\"CREW REGISTER\" data-explain=\"Everyone who ever committed to this page, from provenance; the chief surveyor made the most commits\">');",
  'crew attrs');

/* crew register links to the wall */
js = rep(js,
  "    o.push('<div class=\"crew-row\"><span>active</span><span>' + esc(p.first || '—') + ' → ' + esc(p.last || '—') + '</span></div>');\n    o.push('</div>');",
  "    o.push('<div class=\"crew-row\"><span>active</span><span>' + esc(p.first || '—') + ' → ' + esc(p.last || '—') + '</span></div>');\n    o.push('</div>');\n" +
  "    o.push('<button type=\"button\" class=\"crew-wall\" id=\"crewhall\" data-name=\"HALL OF HANDS\" data-explain=\"The deep scan of the human stratum: every documentation author as an ochre stencil\">ALL ' + HANDS.length + ' HANDS · SEE THE WALL <kbd>H</kbd></button>');",
  'crew wall link');
js = rep(js,
  "    var lb = $('listenbtn');\n    if (lb) lb.addEventListener('click', function () { audioCore(i, true); });",
  "    var lb = $('listenbtn');\n    if (lb) lb.addEventListener('click', function () { audioCore(i, true); });\n" +
  "    var chh = $('crewhall');\n    if (chh) chh.addEventListener('click', function () { toggleHands(true); });",
  'crew wall wiring');

/* completion plate sound */
js = rep(js,
  "    $('plate').hidden = false;\n    logLine('SURVEY COMPLETE",
  "    $('plate').hidden = false;\n    safeSnd('plate');\n    logLine('SURVEY COMPLETE",
  'plate sound');

/* replace the whole audio section */
const A0 = '  /* --------------------------------------------------------------- audio */';
const A1 = '  /* -------------------------------------------------- sky interaction */';
const i0 = js.indexOf(A0), i1 = js.indexOf(A1);
if (i0 < 0 || i1 < 0 || i1 <= i0) throw new Error('audio section markers not found');
js = js.slice(0, i0) + fs.readFileSync(path.join(__dirname, 'audio.part.js'), 'utf8') + js.slice(i1);

/* wireChrome: full chart sound + announce */
js = rep(js,
  "      if (fullChart) {\n        logLine('FULL CHART · all <b>' + stars.length + '</b> bodies and <b>' + edges.length + '</b> transmissions revealed · your own chart holds ' + chartN);\n        fitVisible(false);\n      } else {",
  "      if (fullChart) {\n        logLine('FULL CHART · all <b>' + stars.length + '</b> bodies and <b>' + edges.length + '</b> transmissions revealed · your own chart holds ' + chartN);\n        safeSnd('chart');\n        announceOnce('fullchart', 'NEW VIEW · FULL CHART shows every page and every link at once · your own measurements keep a small underline tick · switching back loses nothing');\n        fitVisible(false);\n      } else {",
  'fullchart handler');

/* wireChrome: almanac sound + announce */
js = rep(js,
  "      if (almanac) logLine('ALMANAC OVERLAY · ' + sections.length + ' sections as catalogued · <b>' + DRIFT_N + '</b> bodies off ephemeris');\n      dirty = true;",
  "      if (almanac) {\n        logLine('ALMANAC OVERLAY · ' + sections.length + ' sections as catalogued · <b>' + DRIFT_N + '</b> bodies off ephemeris');\n        safeSnd('almanac');\n        announceOnce('almanac', 'NEW OVERLAY · the ALMANAC draws where the sidebar files each page (dotted) against where its citations put it · dashed vectors flag the ' + DRIFT_N + ' disagreements');\n      }\n      dirty = true;",
  'almanac handler');

/* wireChrome: dark adapt announce */
js = rep(js,
  "      if (darkAdapt) logLine('DARK ADAPTATION · instruments dimmed · <b>' + NIGHT_EDITS + '</b> night edits on ' + NIGHT_PAGES + ' pages bloom blue-green');\n      dirty = true;",
  "      if (darkAdapt) {\n        logLine('DARK ADAPTATION · instruments dimmed · <b>' + NIGHT_EDITS + '</b> night edits on ' + NIGHT_PAGES + ' pages bloom blue-green');\n        announceOnce('darkadapt', 'NEW VIEW · DARK ADAPT dims the chrome so the ' + NIGHT_EDITS + ' commits made between midnight and 06:00 glow blue-green on their pages');\n      }\n      dirty = true;",
  'darkadapt handler');

/* wireChrome: the sound control */
js = rep(js,
  "    $('audiobtn').addEventListener('click', function () {\n" +
  "      audioOn = !audioOn;\n" +
  "      if (audioOn && !ensureAC()) audioOn = false;\n" +
  "      if (audioOn && AC && AC.state === 'suspended') AC.resume();\n" +
  "      $('audiobtn').textContent = audioOn ? 'SOUND ON' : 'SOUND OFF';\n" +
  "      $('audiobtn').setAttribute('aria-pressed', audioOn ? 'true' : 'false');\n" +
  "      if (audioOn) logLine('AUDIO · each ping is one commit · night commits ring one octave lower');\n" +
  "      if (current != null) renderInstruments(current);\n" +
  "    });",
  "    $('audiobtn').addEventListener('click', function () {\n" +
  "      audioOn = !audioOn;\n" +
  "      $('audiobtn').textContent = audioOn ? 'SOUND ON' : 'SOUND OFF';\n" +
  "      $('audiobtn').setAttribute('aria-pressed', audioOn ? 'true' : 'false');\n" +
  "      if (audioOn) {\n" +
  "        if (audioUnlocked && rack) {\n" +
  "          startBed();\n" +
  "          if (!$('hands').hidden && !hallNodes) { try { hallNodes = buildHallPad(rack, AC.currentTime + 0.02); } catch (e) { hallNodes = null; } }\n" +
  "        }\n" +
  "        logLine('SOUND ON · every sound is a measurement · pings are commits, night commits one octave lower');\n" +
  "      } else {\n" +
  "        stopBed();\n" +
  "        if (hallNodes) { releaseNodes(hallNodes, 0.4); hallNodes = null; }\n" +
  "        logLine('SOUND OFF · silenced for this visit');\n" +
  "      }\n" +
  "      if (current != null) renderInstruments(current);\n" +
  "    });",
  'audiobtn handler');

/* wireChrome: keys — Tab guard, H for the wall, ? for the annotations */
js = rep(js,
  "    document.addEventListener('keydown', function (e) {\n" +
  "      var tag = document.activeElement ? document.activeElement.tagName : '';\n" +
  "      var inField = /^(INPUT|TEXTAREA|SELECT)$/.test(tag);\n" +
  "      if (e.key === 'Tab' && !inField && $('howto').hidden && $('plate').hidden) {\n" +
  "        e.preventDefault();\n" +
  "        toggleIndex();\n" +
  "      }\n" +
  "    });",
  "    document.addEventListener('keydown', function (e) {\n" +
  "      var tag = document.activeElement ? document.activeElement.tagName : '';\n" +
  "      var inField = /^(INPUT|TEXTAREA|SELECT)$/.test(tag);\n" +
  "      if (e.metaKey || e.ctrlKey || e.altKey) return;\n" +
  "      if (e.key === 'Tab' && !inField && $('howto').hidden && $('plate').hidden && $('hands').hidden && $('annotate').hidden) {\n" +
  "        e.preventDefault();\n" +
  "        toggleIndex();\n" +
  "      } else if ((e.key === 'h' || e.key === 'H') && !inField) {\n" +
  "        toggleHands();\n" +
  "      } else if (e.key === '?' && !inField) {\n" +
  "        e.preventDefault();\n" +
  "        toggleAnnotate();\n" +
  "      }\n" +
  "    });",
  'keydown handler');

/* search: Enter is a warp */
js = rep(js,
  "      if (e.key === 'Enter') {\n        var first = resEl.querySelector('.res');\n        if (first) { location.hash = first.getAttribute('href'); qEl.blur(); }\n      }",
  "      if (e.key === 'Enter') {\n        var first = resEl.querySelector('.res');\n        if (first) { pendingWarp = true; location.hash = first.getAttribute('href'); qEl.blur(); }\n      }",
  'search enter warp');

/* search: clicking a result is a warp too */
js = rep(js,
  "    document.addEventListener('click', function (e) {\n      if (resEl && !resEl.hidden && !e.target.closest('#results') && !e.target.closest('.search')) closeResults();\n    });",
  "    document.addEventListener('click', function (e) {\n      if (resEl && !resEl.hidden && !e.target.closest('#results') && !e.target.closest('.search')) closeResults();\n    });\n" +
  "    resEl.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a.res')) pendingWarp = true; });",
  'result click warp');

/* Escape closes everything, in sight order */
js = rep(js,
  "      } else if (e.key === 'Escape') {\n" +
  "        if (!$('howto').hidden) { $('howto').hidden = true; }\n" +
  "        else if (resEl && !resEl.hidden) closeResults();\n" +
  "        else if (!$('ixpanel').hidden) toggleIndex(false);\n" +
  "        else if (!$('plaque').hidden) $('plaque').hidden = true;\n" +
  "      }",
  "      } else if (e.key === 'Escape') {\n" +
  "        if (!$('annotate').hidden) toggleAnnotate(false);\n" +
  "        else if (!$('howto').hidden) { $('howto').hidden = true; }\n" +
  "        else if (!$('hands').hidden) toggleHands(false);\n" +
  "        else if (guideOn) hideGuide();\n" +
  "        else if (resEl && !resEl.hidden) closeResults();\n" +
  "        else if (!$('ixpanel').hidden) toggleIndex(false);\n" +
  "        else if (!$('plaque').hidden) $('plaque').hidden = true;\n" +
  "        else if (!$('plate').hidden) $('plate').hidden = true;\n" +
  "      }",
  'escape chain');

/* ? opens the annotations instead of the briefing (briefing lives inside it) */
js = rep(js,
  "    $('helpbtn').addEventListener('click', function () {\n      $('howto').hidden = !$('howto').hidden;\n    });",
  "    $('helpbtn').addEventListener('click', function () { toggleAnnotate(); });",
  'helpbtn');

/* insert the round-2 subsystems before the IIFE closes */
const CLOSE = '\n})();';
const ci = js.lastIndexOf(CLOSE);
if (ci < 0) throw new Error('IIFE close not found');
js = js.slice(0, ci) + '\n' + fs.readFileSync(path.join(__dirname, 'extras.part.js'), 'utf8') + js.slice(ci);

saveF('firstlight.js', js);

/* ============================ index.html ============================== */
let html = load('index.html');

html = rep(html,
  '<a class="brand" href="#/" title="Return to the sweep">',
  '<a class="brand" href="#/" data-name="FIRST LIGHT" data-explain="Return to the open sweep. Your chart keeps everything you have measured.">',
  'brand');
html = rep(html,
  '<div class="chartmeter" id="chartmeter" title="Bodies charted, of the whole corpus">',
  '<div class="chartmeter" id="chartmeter" tabindex="0" data-name="THE CHART" data-explain="How many of the 290 pages you have fixed on your chart by surveying.">',
  'chartmeter');
html = rep(html,
  '<button id="fullbtn" class="btn" aria-pressed="false" title="Reveal the complete labeled chart instantly">FULL CHART</button>',
  '<button id="fullbtn" class="btn" aria-pressed="false" data-name="FULL CHART" data-explain="Reveals every page and every link at once. Your own measured chart stays brighter, and nothing is lost.">FULL CHART</button>',
  'fullbtn');
html = rep(html,
  '<button id="almbtn" class="btn" aria-pressed="false" title="Overlay the onboard almanac: the old engraved atlas, with its ephemeris errors">ALMANAC</button>',
  '<button id="almbtn" class="btn" aria-pressed="false" data-name="ALMANAC" data-explain="Overlays the old atlas: where each page is filed, versus where its citations put it. 86 disagree.">ALMANAC</button>',
  'almbtn');
html = rep(html,
  '<button id="darkbtn" class="btn" aria-pressed="false" title="Dim your instruments. Night work blooms.">DARK ADAPT</button>',
  '<button id="darkbtn" class="btn" aria-pressed="false" data-name="DARK ADAPT" data-explain="Dims the instruments so the commits made at night glow blue-green.">DARK ADAPT</button>',
  'darkbtn');
html = rep(html,
  '<button id="ixbtn" class="btn" aria-pressed="false" title="Plain-title index of every page (Tab)">INDEX <kbd>Tab</kbd></button>',
  '<button id="ixbtn" class="btn" aria-pressed="false" data-name="INDEX" data-explain="A plain-title catalog of all 290 pages; charted ones are marked. Key: Tab.">INDEX <kbd>Tab</kbd></button>\n' +
  '  <button id="handsbtn" class="btn" aria-pressed="false" data-name="HALL OF HANDS" data-explain="The deep scan of the human stratum: all 77 people who ever committed to these pages, as ochre hand stencils. Key: H.">HANDS <kbd>H</kbd></button>',
  'ixbtn + handsbtn');
html = rep(html,
  '    <input id="q" type="search" placeholder="Search 290 pages…" autocomplete="off" spellcheck="false">',
  '    <input id="q" type="search" placeholder="Search 290 pages…" autocomplete="off" spellcheck="false" data-name="THE SEARCH" data-explain="Instant search across all 290 pages; the chart leans toward the strongest return while you type. Key: /.">',
  'search input');
html = rep(html,
  '<button id="audiobtn" class="btn right" aria-pressed="false" title="Optional: hear each body\'s commit history as pings. Silent by default.">SOUND OFF</button>',
  '<button id="audiobtn" class="btn right" aria-pressed="true" data-name="SOUND" data-explain="On by default. Every sound is a measurement: pings are commits, a falling sweep is a transit, the low thump is first contact. Click to silence for this visit.">SOUND ON</button>',
  'audiobtn');
html = rep(html,
  '<button id="helpbtn" class="btn" title="Mission briefing" aria-label="Mission briefing">?</button>',
  '<button id="helpbtn" class="btn" aria-label="What am I looking at" data-name="WHAT AM I LOOKING AT" data-explain="Annotates every element on screen with a plain-English callout. The full mission briefing lives inside. Key: ?.">?</button>',
  'helpbtn');
html = rep(html,
  '<span class="clock" id="clock" title="Mission elapsed time">T+0:00</span>',
  '<span class="clock" id="clock" tabindex="0" data-name="MISSION CLOCK" data-explain="Elapsed time since your survey began.">T+0:00</span>',
  'clock');
html = rep(html,
  '<div id="photom" aria-label="Photometer" hidden>',
  '<div id="photom" aria-label="Photometer" hidden data-name="PHOTOMETER" data-explain="The locked beacon\'s incoming light, six seconds at a time. Bumps are citations arriving; a deep notch is a transit.">',
  'photom attrs');
html = rep(html,
  '<div id="log" aria-label="Mission log" aria-live="polite"></div>',
  '<div id="log-tag" data-name="MISSION LOG" data-explain="Every event of the survey, written as it happens. Newest at the bottom.">MISSION LOG</div>\n<div id="log" aria-label="Mission log" aria-live="polite"></div>',
  'log tag');
html = rep(html,
  '<aside id="inst" hidden aria-label="Instrument suite">',
  '<aside id="inst" hidden aria-label="Instrument suite" data-name="SURVEY READINGS" data-explain="Measurements of the locked page: citations, spectral class, word mass, commit strata, crew.">',
  'inst attrs');

/* briefing gains the round-2 instruments */
html = rep(html,
  '      <li><b>FULL CHART</b> reveals the complete labeled chart at any moment. No progress is lost;\n        your personal chart keeps only what you have actually measured.</li>',
  '      <li><b>FULL CHART</b> reveals the complete labeled chart at any moment. No progress is lost;\n        your personal chart keeps only what you have actually measured.</li>\n' +
  '      <li><b>Meet the hands.</b> Press <kbd>H</kbd> for the Hall of Hands: all 77 people who ever\n        committed to these pages, as ochre stencils, oldest lowest. Press <kbd>?</kbd> and every\n        element on screen explains itself. Sound is on by default — every sound is a measurement —\n        and the SOUND control silences it.</li>',
  'howto li');

/* the three overlays */
html = rep(html,
  '<noscript>',
  `<div id="hands" hidden>
  <div class="hh-box" role="dialog" aria-modal="true" aria-label="The Hall of Hands">
    <div class="hh-head">
      <div>
        <div class="hh-k">DEEP SCAN · HUMAN STRATUM</div>
        <div class="hh-t">THE HALL OF HANDS</div>
        <div class="hh-s" id="hh-sub"></div>
      </div>
      <button id="hh-close" class="xbtn" aria-label="Close" data-name="CLOSE" data-explain="Close the wall and return to the sweep. Key: Esc.">×</button>
    </div>
    <div class="hh-wall" id="hh-wall"></div>
    <div class="hh-foot">The stone remembers all of them.</div>
  </div>
</div>

<div id="annotate" hidden aria-label="What am I looking at">
  <div id="an-lines"></div>
  <div id="an-items"></div>
  <div class="an-bar">
    <span class="an-title">WHAT AM I LOOKING AT</span>
    <button id="an-brief" class="howto-btn ghost" type="button">OPEN MISSION BRIEFING</button>
    <button id="an-close" class="howto-btn" type="button">CLOSE · ESC</button>
  </div>
</div>

<div id="guide" hidden role="dialog" aria-label="Quick guide">
  <div class="gd-k"><span>FIRST LOCK CONFIRMED · QUICK GUIDE</span><span id="gd-step">STEP 1/3</span></div>
  <div class="gd-body" id="gd-body"></div>
  <div class="gd-row">
    <button id="gd-skip" class="howto-btn ghost" type="button">SKIP</button>
    <button id="gd-next" class="howto-btn" type="button">NEXT →</button>
  </div>
</div>

<noscript>`,
  'overlays');

saveF('index.html', html);

/* ============================ firstlight.css =========================== */
let css = load('firstlight.css');
css = rep(css,
  '   One-pixel instrument lines. Saturated color lives only in the spectrograph.',
  '   One-pixel instrument lines. Saturated color lives only inside instrument\n   readings: the spectrograph, and the ochre of the Hall of Hands deep scan.',
  'css header');
css += `
/* ================== round 2: hands · annotate · guide · explain ========= */

/* hover/focus explainer: name + one plain sentence for every control */
#explain{position:fixed;z-index:110;pointer-events:none;max-width:290px;background:var(--bg-2);border:var(--rule);padding:7px 10px 8px;font-family:var(--f-mono);font-size:.64rem;line-height:1.6;color:var(--white-dim)}
#explain b{display:block;color:var(--amber);font-size:.6rem;letter-spacing:.22em;margin-bottom:2px}
#explain span{display:block}

#log-tag{position:fixed;z-index:24;left:10px;bottom:188px;font-family:var(--f-cond);font-size:.6rem;letter-spacing:.3em;color:var(--white-faint);cursor:default;transition:opacity .5s}
html[data-boot="1"] #log-tag{opacity:0}
body.darkadapt #log-tag{opacity:.32}

/* -------------------------------------------------- the Hall of Hands -- */
#hands{position:fixed;z-index:87;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(4,6,7,.72)}
#hands[hidden]{display:none}
.hh-box{width:min(1100px,95vw);height:min(860px,92vh);display:flex;flex-direction:column;background:#0B0907;border:1px solid var(--amber-dim);outline:1px solid rgba(255,176,0,.16);outline-offset:4px}
.hh-head{display:flex;justify-content:space-between;align-items:flex-start;padding:14px 18px 10px;border-bottom:1px solid rgba(255,176,0,.2)}
.hh-k{font-family:var(--f-mono);font-size:.6rem;letter-spacing:.3em;color:var(--amber-dim)}
.hh-t{font-family:var(--f-cond);font-weight:600;font-size:1.5rem;letter-spacing:.24em;color:var(--amber)}
.hh-s{font-family:var(--f-mono);font-size:.6rem;letter-spacing:.06em;color:var(--white-faint);margin-top:3px}
.hh-wall{flex:1;overflow:auto;scrollbar-width:thin;display:flex;flex-wrap:wrap;align-content:flex-start;gap:8px 4px;padding:18px 16px}
.hh-tile{width:128px;text-align:center}
.hh-tile canvas{display:block;width:128px;height:118px;margin:0 auto}
.hh-name{font-family:var(--f-mono);font-size:.6rem;color:var(--white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hh-dates{font-family:var(--f-mono);font-size:.54rem;color:var(--amber-dim);letter-spacing:.04em}
.hh-meta{font-family:var(--f-mono);font-size:.54rem;color:var(--white-faint)}
.hh-foot{font-family:var(--f-cond);font-size:.88rem;letter-spacing:.34em;color:rgba(224,142,64,.9);text-align:center;padding:12px;border-top:1px solid rgba(255,176,0,.2)}

/* ------------------------------------------- WHAT AM I LOOKING AT ------ */
#annotate{position:fixed;z-index:95;inset:0;background:rgba(4,6,7,.78)}
#annotate[hidden]{display:none}
#an-lines{position:absolute;inset:0}
#an-lines svg{display:block;width:100%;height:100%}
#an-items{position:absolute;inset:0;pointer-events:none}
.an-c{position:absolute;width:240px;background:var(--bg-2);border:var(--rule);padding:7px 10px 8px;font-family:var(--f-mono);font-size:.62rem;line-height:1.6;color:var(--white-dim)}
.an-c b{display:block;color:var(--amber);font-size:.6rem;letter-spacing:.24em;margin-bottom:2px}
.an-bar{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);display:flex;gap:12px;align-items:center;background:var(--bg-2);border:var(--rule);padding:8px 14px}
.an-title{font-family:var(--f-cond);font-size:.8rem;letter-spacing:.3em;color:var(--amber)}

/* -------------------------------------------------- three-step guide --- */
#guide{position:fixed;z-index:55;left:50%;bottom:118px;transform:translateX(-50%);width:min(480px,92vw);background:rgba(8,10,12,.96);border:1px solid var(--amber-dim);padding:10px 14px 12px}
#guide[hidden]{display:none}
.gd-k{font-family:var(--f-mono);font-size:.58rem;letter-spacing:.24em;color:var(--amber-dim);display:flex;justify-content:space-between}
.gd-body{font-size:.84rem;color:rgba(237,242,240,.88);margin:.45rem 0 .6rem;line-height:1.55}
.gd-body b{display:block;font-family:var(--f-cond);letter-spacing:.2em;font-size:.78rem;color:var(--amber-hi);margin-bottom:2px}
.gd-row{display:flex;justify-content:flex-end;gap:8px}
.gd-row .howto-btn{padding:4px 12px;font-size:.72rem}

/* the crew register's door to the wall */
.crew-wall{display:block;width:100%;margin-top:7px;font-family:var(--f-mono);font-size:.6rem;letter-spacing:.1em;color:var(--amber-hi);background:transparent;border:1px dashed rgba(255,176,0,.4);padding:4px 6px;cursor:pointer}
.crew-wall:hover{border-style:solid;color:var(--amber)}
`;
saveF('firstlight.css', css);

console.log('PATCH OK');
