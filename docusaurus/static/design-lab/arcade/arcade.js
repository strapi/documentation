/* ==========================================================================
   DUSK WORKS — the Strapi documentation as a real 2D pixel platformer.

   THE ONE IDEA: the character is the reading cursor.
   Horizontal position IS position in the document. The page is laid out
   left to right in block order; the block you are standing in is the block
   the docked reading strip renders. Walking right is scrolling down.
   Links are doors, standing at the x of the block where the link is written,
   labelled with the link's own anchor text. Walking through one follows it.

   Five colours, no sixth. Everything is drawn into an integer-resolution
   back buffer and blitted with smoothing off.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- palette */
  var AUB = '#2A0F3D';   // deep aubergine  — terrain, silhouettes, type
  var VIO = '#4945FF';   // Strapi violet   — doors, the head, far distance
  var ROSE = '#FF3D6E';  // hot rose        — hazards, the cursor, warnings
  var JADE = '#3FE0C8';  // electric jade   — decking, code, safe states
  var BONE = '#FFE9C7';  // bone            — light, low sky, type

  var HOME = '/cms/intro';
  var STORE = 'strapi-duskworks-v2';

  /* ---------------------------------------------------------------- world */
  var TS = 8;            // tile size in logical pixels
  var WALLH = 7;         // tiles of dark corridor wall above the terrain
  var LEVEL_H = 48;      // tiles
  var BASE_GY = 34;      // default ground row

  var GRAV = 780, FALL_MAX = 340;
  var RUN_MAX = 150, RUN_ACC = 1100, GND_FRICTION = 1200, SPRINT = 1.95;
  var AIR_ACC = 560, AIR_DRAG = 200;
  var JUMP_V = 238, JUMP_CUT = 90;
  var COYOTE = 0.10, BUFFER = 0.12;
  var SPRING_V = 372;
  var STEP = 1 / 120, MAXSTEPS = 8;

  /* ---------------------------------------------------------------- state */
  var B = null, G = null, COM = null;
  var OUT = {}, IN_ = {}, TITLE = {}, ORDIDX = {};

  var visited = new Set();     // pages entered
  var finished = new Set();    // pages walked end to end
  var taken = {};              // slug -> Set of collected code-block indices
  var trail = [];              // slugs, most recent last

  var slug = null, page = null, L = null;
  var reduced = false, still = false, running = false;
  var arrivedFrom = null;      // {slug, label} for the return door
  var firstRun = true;

  /* ---------------------------------------------------------------- utils */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function attr(s) { return esc(s); }
  function num(n) { return (n || 0).toLocaleString('en-US'); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function stripTags(s) { return String(s || '').replace(/<[^>]*>/g, ' '); }
  function decode(s) {
    return String(s || '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
  }
  function plain(h) { return decode(stripTags(h)).replace(/\s+/g, ' ').trim(); }
  function cut(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function mul32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function seedOf(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (!d) return;
      if (Array.isArray(d.v)) d.v.forEach(function (s) { visited.add(s); });
      if (Array.isArray(d.f)) d.f.forEach(function (s) { finished.add(s); });
      if (Array.isArray(d.tr)) trail = d.tr.slice(-8);
      if (d.tk) Object.keys(d.tk).forEach(function (k) { taken[k] = new Set(d.tk[k]); });
      if (d.fr === false) firstRun = false;
    } catch (e) { /* blocked storage: run stateless */ }
  }
  var saveT = 0;
  function save() {
    if (saveT) return;
    saveT = setTimeout(function () {
      saveT = 0;
      try {
        var tk = {};
        Object.keys(taken).forEach(function (k) { if (taken[k].size) tk[k] = Array.from(taken[k]); });
        localStorage.setItem(STORE, JSON.stringify({
          v: Array.from(visited), f: Array.from(finished), tr: trail.slice(-8), tk: tk, fr: firstRun
        }));
      } catch (e) { /* ignore */ }
    }, 500);
  }

  /* ==========================================================================
     PIXEL FONT — 3x5, drawn into cached label bitmaps so a frame never
     costs more than a handful of drawImage calls.
     ========================================================================== */
  var FONT = {
    A: '.#.,#.#,###,#.#,#.#', B: '##.,#.#,##.,#.#,##.', C: '.##,#..,#..,#..,.##',
    D: '##.,#.#,#.#,#.#,##.', E: '###,#..,##.,#..,###', F: '###,#..,##.,#..,#..',
    G: '.##,#..,#.#,#.#,.##', H: '#.#,#.#,###,#.#,#.#', I: '###,.#.,.#.,.#.,###',
    J: '..#,..#,..#,#.#,.#.', K: '#.#,#.#,##.,#.#,#.#', L: '#..,#..,#..,#..,###',
    M: '#.#,###,###,#.#,#.#', N: '#.#,##.,###,.##,#.#', O: '.#.,#.#,#.#,#.#,.#.',
    P: '##.,#.#,##.,#..,#..', Q: '.#.,#.#,#.#,###,.##', R: '##.,#.#,##.,#.#,#.#',
    S: '.##,#..,.#.,..#,##.', T: '###,.#.,.#.,.#.,.#.', U: '#.#,#.#,#.#,#.#,.#.',
    V: '#.#,#.#,#.#,#.#,.#.', W: '#.#,#.#,###,###,#.#', X: '#.#,#.#,.#.,#.#,#.#',
    Y: '#.#,#.#,.#.,.#.,.#.', Z: '###,..#,.#.,#..,###',
    0: '###,#.#,#.#,#.#,###', 1: '.#.,##.,.#.,.#.,###', 2: '##.,..#,.#.,#..,###',
    3: '###,..#,.##,..#,###', 4: '#.#,#.#,###,..#,..#', 5: '###,#..,###,..#,###',
    6: '###,#..,###,#.#,###', 7: '###,..#,.#.,.#.,.#.', 8: '###,#.#,###,#.#,###',
    9: '###,#.#,###,..#,###',
    ' ': '...,...,...,...,...', '-': '...,...,###,...,...', '.': '...,...,...,...,.#.',
    ',': '...,...,...,.#.,#..', '/': '..#,..#,.#.,#..,#..', ':': '...,.#.,...,.#.,...',
    "'": '.#.,.#.,...,...,...', '"': '#.#,#.#,...,...,...', '&': '.#.,#.#,.#.,#.#,.##',
    '+': '...,.#.,###,.#.,...', '!': '.#.,.#.,.#.,...,.#.', '?': '##.,..#,.#.,...,.#.',
    '(': '..#,.#.,.#.,.#.,..#', ')': '#..,.#.,.#.,.#.,#..', '[': '.##,.#.,.#.,.#.,.##',
    ']': '##.,.#.,.#.,.#.,##.', '{': '..#,.#.,##.,.#.,..#', '}': '#..,.#.,.##,.#.,#..',
    '#': '#.#,###,#.#,###,#.#', '%': '#.#,..#,.#.,#..,#.#', '_': '...,...,...,...,###',
    '*': '#.#,.#.,#.#,...,...', '=': '...,###,...,###,...', '>': '#..,.#.,..#,.#.,#..',
    '<': '..#,.#.,#..,.#.,..#', '@': '###,#.#,###,#..,.##', '$': '.##,##.,.##,##.,.#.',
    ';': '...,.#.,...,.#.,#..', '~': '...,.##,###,##.,...', '|': '.#.,.#.,.#.,.#.,.#.',
    '→': '...,..#,###,..#,...', '←': '...,#..,###,#..,...', '…': '...,...,...,...,#.#',
    '↑': '.#.,###,.#.,.#.,.#.', '↓': '.#.,.#.,.#.,###,.#.', '✓': '...,..#,..#,#.#,.#.',
    '§': '.##,.#.,.#.,.#.,##.', '·': '...,...,.#.,...,...', '›': '#..,.#.,..#,.#.,#..'
  };
  function glyph(ch) { return FONT[ch] || FONT['-']; }
  function textW(s) { return String(s).length * 4 - 1; }

  var LC = Object.create(null), LCn = 0;
  function label(text, color) {
    var key = color + '|' + text;
    var c = LC[key];
    if (c) return c;
    var s = String(text).toUpperCase();
    var w = Math.max(1, textW(s)), h = 5;
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    var x = cv.getContext('2d');
    x.fillStyle = color;
    for (var i = 0; i < s.length; i++) {
      var rows = glyph(s[i]).split(',');
      for (var r = 0; r < 5; r++) {
        var row = rows[r];
        for (var cc = 0; cc < 3; cc++) if (row[cc] === '#') x.fillRect(i * 4 + cc, r, 1, 1);
      }
    }
    if (LCn > 1200) { LC = Object.create(null); LCn = 0; }
    LC[key] = cv; LCn++;
    return cv;
  }

  /* ==========================================================================
     BLOCK RENDERER — the reading side. Real content, every kind.
     The html fields arrive already escaped; they are never escaped again.
     ========================================================================== */
  var LANGMAP = {
    js: 'js', javascript: 'js', jsx: 'js', ts: 'js', typescript: 'js', tsx: 'js',
    json: 'json', bash: 'sh', sh: 'sh', shell: 'sh', env: 'sh', dockerfile: 'sh',
    yaml: 'yml', yml: 'yml', http: 'http', graphql: 'gql', html: 'xml',
    diff: 'diff', text: null, txt: null
  };
  var RXC = {};
  function rxFor(fam) {
    if (fam in RXC) return RXC[fam];
    var kw = {
      js: 'await|async|break|case|catch|class|const|continue|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|static|super|switch|this|throw|try|typeof|var|void|while|yield|null|true|false|undefined|interface|type|enum|implements|public|private|protected|readonly|as|declare|namespace|module|require|satisfies',
      json: 'true|false|null',
      sh: 'if|then|else|fi|for|while|do|done|export|cd|echo|sudo|npm|npx|yarn|pnpm|docker|curl|git|set|source|function|return|case|esac',
      yml: 'true|false|null|on|off|yes|no',
      http: 'GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|Authorization|Content-Type|Accept|Bearer',
      gql: 'query|mutation|subscription|fragment|on|type|input|enum|interface|schema|scalar|true|false|null',
      xml: 'true|false|null', diff: 'true|false'
    }[fam] || '';
    var hash = (fam === 'sh' || fam === 'yml' || fam === 'gql');
    var slash = (fam === 'js' || fam === 'json' || fam === 'http' || fam === 'xml');
    var cmt = [];
    if (slash) cmt.push('\\/\\/[^\\n]*', '\\/\\*[\\s\\S]*?\\*\\/');
    if (hash) cmt.push('#[^\\n]*');
    if (fam === 'xml') cmt.push('<!--[\\s\\S]*?-->');
    var src = '(' + (cmt.length ? cmt.join('|') : '(?!)') + ')'
      + '|("(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'|`(?:\\\\.|[^`\\\\])*`)'
      + '|\\b(\\d+(?:\\.\\d+)?)\\b'
      + (kw ? '|\\b(' + kw + ')\\b' : '|((?!))')
      + '|(@[A-Za-z][\\w-]*|\\$[A-Za-z_][\\w]*)';
    var rx = null;
    try { rx = new RegExp(src, 'g'); } catch (e) { rx = null; }
    RXC[fam] = rx;
    return rx;
  }
  function highlight(code, lang) {
    var fam = LANGMAP[String(lang || '').toLowerCase()];
    if (fam === undefined) fam = 'js';
    if (!fam) return esc(code);
    var rx = rxFor(fam);
    if (!rx) return esc(code);
    var out = [], last = 0, m;
    rx.lastIndex = 0;
    while ((m = rx.exec(code)) !== null) {
      if (m[0] === '') { rx.lastIndex++; continue; }
      if (m.index > last) out.push(esc(code.slice(last, m.index)));
      var cls = m[1] ? 'tok-c' : m[2] ? 'tok-s' : m[3] ? 'tok-n' : m[4] ? 'tok-k' : 'tok-a';
      out.push('<span class="' + cls + '">' + esc(m[0]) + '</span>');
      last = rx.lastIndex;
    }
    out.push(esc(code.slice(last)));
    return out.join('');
  }

  var uid = 0;
  var RS = null;   // reveal state for the block currently in the strip

  function renderBlocks(bs) {
    var out = [];
    for (var i = 0; i < (bs || []).length; i++) out.push(renderBlock(bs[i]));
    return out.join('');
  }
  function renderItems(items, ordered, cursor) {
    var out = [];
    for (var i = 0; i < (items || []).length; i++) {
      var it = items[i];
      var cls = (cursor != null && cursor === i) ? ' class="row-cursor"' : '';
      if (typeof it === 'string') out.push('<li' + cls + '>' + it + '</li>');
      else if (it && typeof it === 'object') out.push('<li' + cls + '>' + (it.html || '') + (it.blocks ? renderBlocks(it.blocks) : '') + '</li>');
    }
    var tag = ordered ? 'ol' : 'ul';
    return '<' + tag + '>' + out.join('') + '</' + tag + '>';
  }
  function codeBlock(code, lang, title) {
    var head = '<div class="code-h">' + (title ? '<span>' + esc(title) + '</span>' : '<span></span>')
      + '<span class="lang">' + esc(String(lang || 'text').toUpperCase()) + '</span>'
      + '<button class="copybtn" type="button" data-copy>COPY</button></div>';
    return '<div class="codeblock">' + head + '<pre><code>' + highlight(code || '', lang) + '</code></pre></div>';
  }
  function renderBlock(b) {
    if (!b || !b.t) return '';
    switch (b.t) {
      case 'p': return '<p>' + (b.html || '') + '</p>';
      case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
        return '<' + b.t + (b.id ? ' id="' + attr(b.id) + '"' : '') + '>' + esc(b.text || '') + '</' + b.t + '>';
      case 'hr': return '<hr>';
      case 'tldr': return '<div class="tldr"><p>' + (b.html || '') + '</p></div>';
      case 'ul': return renderItems(b.items, false, RS && RS.item);
      case 'ol': return renderItems(b.items, true, RS && RS.item);
      case 'code': return codeBlock(b.code, b.lang, b.title);
      case 'admonition': {
        var k = String(b.kind || 'note').toLowerCase();
        return '<aside class="adm adm-' + esc(k) + '"><div class="adm-h"><span class="adm-k">' + esc(k.toUpperCase()) + '</span>'
          + (b.title ? '<span class="adm-t">' + esc(b.title) + '</span>' : '') + '</div>'
          + '<div class="adm-b">' + renderBlocks(b.blocks) + '</div></aside>';
      }
      case 'details': {
        var open = RS && RS.open ? ' open' : '';
        return '<details class="fold"' + open + (b.id ? ' id="' + attr(b.id) + '"' : '') + '><summary><span>'
          + (b.summary || 'Details') + '</span></summary><div class="fold-b">' + renderBlocks(b.blocks) + '</div></details>';
      }
      case 'table': {
        var al = b.align || [];
        var cur = RS && RS.row;
        var h = (b.head || []).map(function (c, i) {
          return '<th' + (al[i] ? ' style="text-align:' + esc(al[i]) + '"' : '') + '>' + (c || '') + '</th>';
        }).join('');
        var rows = (b.rows || []).map(function (r, ri) {
          return '<tr' + (cur === ri ? ' class="row-cursor"' : '') + '>' + r.map(function (c, i) {
            return '<td' + (al[i] ? ' style="text-align:' + esc(al[i]) + '"' : '') + '>' + (c || '') + '</td>';
          }).join('') + '</tr>';
        }).join('');
        return '<div class="tablewrap"><table>' + (h ? '<thead><tr>' + h + '</tr></thead>' : '') + '<tbody>' + rows + '</tbody></table></div>';
      }
      case 'tabs': {
        var gid = 'tg' + (++uid);
        var sel = clamp((RS && RS.tab) | 0, 0, Math.max(0, (b.tabs || []).length - 1));
        var strip = (b.tabs || []).map(function (t, i) {
          return '<button type="button" role="tab" data-tab="' + i + '" aria-selected="' + (i === sel) + '">'
            + esc(t.label || t.value || ('TAB ' + (i + 1))) + '</button>';
        }).join('');
        var panels = (b.tabs || []).map(function (t, i) {
          return '<div class="tabs-panel" role="tabpanel" data-panel="' + i + '"' + (i === sel ? '' : ' hidden') + '>'
            + renderBlocks(t.blocks) + '</div>';
        }).join('');
        return '<div class="tabs" id="' + gid + '"><div class="tabs-strip" role="tablist">' + strip + '</div>' + panels + '</div>';
      }
      case 'img': {
        var src = b.light || b.dark || '';
        return '<figure class="figure">'
          + (src ? '<img src="' + attr(src) + '" alt="' + attr(b.alt || '') + '" loading="lazy" decoding="async">' : '')
          + '<figcaption>' + (b.caption ? b.caption : esc(b.alt || 'Screenshot'))
          + '<span class="shotpath">' + esc(src) + '</span></figcaption></figure>';
      }
      case 'cards': {
        var items = (b.items || []).map(function (c) {
          return '<a class="card" href="' + attr(c.link || '#') + '"><b>' + (c.title || '') + '</b><span>' + (c.desc || '') + '</span></a>';
        }).join('');
        return '<div class="cards">' + items + '</div>';
      }
      case 'badge':
        return '<p class="blockbadge"><span class="badge badge--' + esc(b.kind || 'version') + '"'
          + (b.tooltip ? ' title="' + attr(b.tooltip) + '"' : '') + '>' + esc(b.label || b.kind || '') + '</span></p>';
      case 'columns':
        return '<div class="cols">' + (b.cols || []).map(function (c) { return '<div>' + renderBlocks(c) + '</div>'; }).join('') + '</div>';
      case 'endpoint': return renderEndpoint(b);
      default: return '';
    }
  }
  function renderEndpoint(b) {
    var out = ['<section class="endpoint"' + (b.id ? ' id="' + attr(b.id) + '"' : '') + '><div class="ep-h">'];
    if (b.method) out.push('<span class="ep-m ' + esc(String(b.method).toLowerCase()) + '">' + esc(b.method) + '</span>');
    if (b.path) out.push('<span class="ep-p">' + esc(b.path) + '</span>');
    out.push('<span class="ep-t">' + esc(b.title || (String(b.kind || 'call').toUpperCase() + ' REQUEST')) + '</span>');
    out.push('</div><div class="ep-b">');
    if (b.description) out.push('<p>' + b.description + '</p>');
    if (b.params && b.params.length) {
      out.push('<p class="ep-sub">' + esc(b.paramTitle || 'PARAMETERS') + '</p><ul class="ep-params">');
      b.params.forEach(function (p) {
        out.push('<li><span class="pn">' + esc(p.name || '') + '</span>'
          + (p.type ? '<span class="pt">' + esc(p.type) + '</span>' : '')
          + (p.required ? '<span class="rq">REQUIRED</span>' : '')
          + (p.desc ? '<span class="pd">' + p.desc + '</span>' : '') + '</li>');
      });
      out.push('</ul>');
    }
    if (b.codeTabs && b.codeTabs.length) {
      out.push('<p class="ep-sub">REQUEST</p>');
      out.push(renderBlock({
        t: 'tabs', tabs: b.codeTabs.map(function (c) {
          return { label: c.label, blocks: [{ t: 'code', lang: c.lang, code: c.code, title: '' }] };
        })
      }));
    }
    if (b.responses && b.responses.length) {
      out.push('<p class="ep-sub">RESPONSE</p><div class="ep-res">');
      b.responses.forEach(function (r) {
        out.push('<div class="ep-res-h"><span class="ep-status' + (Number(r.status) >= 400 ? ' err' : '') + '">'
          + esc(String(r.status || '')) + '</span><span class="st">' + esc(r.statusText || '') + '</span>'
          + (r.time ? '<span class="st">' + esc(r.time) + '</span>' : '') + '</div>');
        out.push(codeBlock(r.body || '', r.lang || 'json', ''));
      });
      out.push('</div>');
    }
    out.push('</div></section>');
    return out.join('');
  }

  /* ==========================================================================
     THE PAGE, READ AS A MAP
     Two derived facts per block: a short arcade label, and the internal
     links written inside it, in the order they occur.
     ========================================================================== */
  var KINDNAME = {
    p: 'PARAGRAPH', h2: 'SECTION', h3: 'SUBSECTION', h4: 'HEADING', h5: 'HEADING', h6: 'HEADING',
    ul: 'LIST', ol: 'STEPS', code: 'CODE', table: 'TABLE', tabs: 'TABS', details: 'FOLD',
    admonition: 'CALLOUT', img: 'SCREENSHOT', endpoint: 'ENDPOINT', cards: 'CARDS',
    badge: 'BADGE', tldr: 'TL;DR', columns: 'COLUMNS', hr: 'BREAK'
  };

  function blockLabel(b) {
    switch (b.t) {
      case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': return cut(b.text || 'SECTION', 30);
      case 'code': return 'CODE · ' + String(b.lang || 'TEXT').toUpperCase();
      case 'table': return 'TABLE · ' + (b.rows || []).length + ' ROWS';
      case 'tabs': return 'TABS · ' + (b.tabs || []).length;
      case 'details': return cut(plain(b.summary) || 'FOLD', 28);
      case 'admonition': return String(b.kind || 'note').toUpperCase() + (b.title ? ' · ' + cut(plain(b.title), 22) : '');
      case 'img': return cut(plain(b.alt) || 'SCREENSHOT', 30);
      case 'endpoint': return (b.method ? b.method + ' ' : '') + cut(b.path || b.title || 'CALL', 30);
      case 'cards': return 'CARDS · ' + (b.items || []).length;
      case 'badge': return 'BADGE · ' + cut(b.label || b.kind || '', 20);
      case 'tldr': return 'TL;DR';
      case 'columns': return 'COLUMNS';
      case 'hr': return 'BREAK';
      case 'ul': return 'LIST · ' + (b.items || []).length;
      case 'ol': return 'STEPS · ' + (b.items || []).length;
      default: return cut(plain(b.html) || KINDNAME[b.t] || b.t.toUpperCase(), 26);
    }
  }

  /* every html-bearing surface of a block, in reading order */
  function blockHtmlParts(b, acc) {
    if (!b || !b.t) return acc;
    if (b.html) acc.push(b.html);
    if (b.t === 'ul' || b.t === 'ol') {
      (b.items || []).forEach(function (it) {
        if (typeof it === 'string') acc.push(it);
        else if (it) { if (it.html) acc.push(it.html); (it.blocks || []).forEach(function (s) { blockHtmlParts(s, acc); }); }
      });
    }
    if (b.t === 'table') {
      (b.head || []).forEach(function (c) { acc.push(c); });
      (b.rows || []).forEach(function (r) { r.forEach(function (c) { acc.push(c); }); });
    }
    if (b.t === 'cards') {
      (b.items || []).forEach(function (c) {
        if (c && c.link) acc.push('<a href="' + c.link + '">' + (c.title || c.link) + '</a>');
        if (c && c.desc) acc.push(c.desc);
      });
    }
    if (b.t === 'details') { if (b.summary) acc.push(b.summary); }
    if (b.t === 'img') { if (b.caption) acc.push(b.caption); }
    if (b.t === 'endpoint') {
      if (b.description) acc.push(b.description);
      (b.params || []).forEach(function (p) { if (p && p.desc) acc.push(p.desc); });
    }
    (b.blocks || []).forEach(function (s) { blockHtmlParts(s, acc); });
    if (b.t === 'tabs') (b.tabs || []).forEach(function (t) { (t.blocks || []).forEach(function (s) { blockHtmlParts(s, acc); }); });
    if (b.t === 'columns') (b.cols || []).forEach(function (c) { (c || []).forEach(function (s) { blockHtmlParts(s, acc); }); });
    return acc;
  }

  var LINKRX = /<a\b[^>]*href="#(\/[^"#]*)(?:#[^"]*)?"[^>]*>([\s\S]*?)<\/a>/gi;

  /* the links written inside one block, in the order they are written */
  function linksIn(b) {
    var parts = blockHtmlParts(b, []);
    var seen = Object.create(null), out = [], m;
    var src = parts.join('\n');
    LINKRX.lastIndex = 0;
    while ((m = LINKRX.exec(src)) !== null) {
      var to = m[1];
      if (!B.pages[to]) continue;
      if (seen[to]) continue;
      seen[to] = 1;
      var text = plain(m[2]) || (TITLE[to] || to);
      out.push({ to: to, text: text });
    }
    return out;
  }

  function blockText(b) { return plain(blockHtmlParts(b, []).join(' ')); }

  /* ==========================================================================
     LEVEL BUILDER — the page laid out left to right in block order.
     Block i owns the tile range [x0, x1). Standing anywhere in that range
     means you are reading block i. That is the whole mechanic.
     ========================================================================== */
  var PAD_L = 7, PAD_R = 12;

  function spanFor(b) {
    switch (b.t) {
      case 'h2': return 13;
      case 'h3': return 11;
      case 'h4': case 'h5': case 'h6': return 10;
      case 'hr': return 7;
      case 'p': return clamp(9 + Math.round(plain(b.html).length / 90), 9, 26);
      case 'tldr': return 14;
      case 'ul': case 'ol': return 8 + 4 * Math.min((b.items || []).length, 8);
      case 'code': return clamp(14 + Math.round(String(b.code || '').split('\n').length / 2), 14, 30);
      case 'admonition': return 14;
      case 'table': return 12 + 3 * Math.min((b.rows || []).length, 8);
      case 'tabs': return 10 + 7 * Math.min((b.tabs || []).length, 5);
      case 'details': return 16;
      case 'endpoint': return 24;
      case 'img': return 22;
      case 'cards': return 10;
      case 'badge': return 10;
      case 'columns': return 24;
      default: return 10;
    }
  }

  var HAZKIND = { caution: 1, danger: 1, warning: 1 };

  function buildLevel(sl) {
    var p = B.pages[sl];
    var blocks = p.blocks || [];
    var lv = {
      slug: sl, seed: seedOf(sl),
      ground: [], solid: new Set(), oneway: new Set(), hazard: new Set(),
      ents: [], segs: [], doors: [], W: 0,
      pickTotal: 0
    };
    function K(tx, ty) { return tx * 64 + ty; }
    var col = 0;
    function fill(n, y) { for (var i = 0; i < n; i++) { lv.ground[col] = y; col++; } }
    function oneWay(x0, w, y) { if (y < 3) return; for (var i = 0; i < w; i++) lv.oneway.add(K(x0 + i, y)); }
    function wall(x0, w, y0, y1) { for (var i = 0; i < w; i++) for (var j = y0; j <= y1; j++) if (j >= 0) lv.solid.add(K(x0 + i, j)); }
    function haz(x0, w, y) { for (var i = 0; i < w; i++) lv.hazard.add(K(x0 + i, y)); }
    function E(o) { lv.ents.push(o); return o; }

    var gy = BASE_GY;
    fill(PAD_L, gy);

    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      var links = linksIn(b);
      var nd = Math.min(links.length, 6);

      /* terraces: a section heading lifts the ground, so the shape of the
         page is visible from a distance and h2 reads as a new plateau */
      var want = gy;
      if (b.t === 'h2') want = BASE_GY - 5;
      else if (b.t === 'h3') want = BASE_GY - 3;
      else if (b.t === 'h4' || b.t === 'h5' || b.t === 'h6') want = BASE_GY - 2;
      else if (b.t === 'hr') want = BASE_GY;
      if (want !== gy) {
        var dir = want > gy ? 1 : -1;
        while (gy !== want) { gy += dir; fill(2, gy); }   // one-tile stairs: walkable
      }

      var span = spanFor(b) + 6 * nd;
      var x0 = col;
      fill(span, gy);
      var x1 = col;
      var mainEnd = x1 - 6 * nd;
      var cx = (x0 + mainEnd) >> 1;
      var seg = { i: i, t: b.t, x0: x0, x1: x1, gy: gy, label: blockLabel(b), nd: nd };
      lv.segs.push(seg);

      /* ---- the object IS the block ---------------------------------- */
      switch (b.t) {
        case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
          E({ t: 'gate', x: cx * TS, y: (gy - 9) * TS, w: 6 * TS, h: 9 * TS, bi: i, lv: +b.t[1], text: b.text || '' });
          break;

        case 'code': {
          var cw = clamp(mainEnd - x0 - 5, 4, 18);
          wall(x0 + 2, 1, gy - 1, gy - 1);
          wall(x0 + 3, cw, gy - 2, gy - 1);
          wall(x0 + 3 + cw, 1, gy - 1, gy - 1);
          lv.pickTotal++;
          E({ t: 'code', x: (x0 + 3) * TS, y: (gy - 2) * TS - 14, w: cw * TS, h: 14, bi: i, lang: String(b.lang || 'text'), act: 'stand' });
          break;
        }
        case 'table': {
          var nr = Math.min((b.rows || []).length, 8);
          for (var r = 0; r < nr; r++) {
            var rx = x0 + 2 + r * 3, ry = gy - 3 - r * 2;
            oneWay(rx, 3, ry);
            E({ t: 'rung', x: rx * TS, y: ry * TS - 14, w: 3 * TS, h: 14, bi: i, row: r, act: 'stand' });
          }
          break;
        }
        case 'tabs': {
          var nt = Math.min((b.tabs || []).length, 5);
          for (var k = 0; k < nt; k++) {
            var px2 = x0 + 2 + k * 7, py2 = gy - 1 - k;
            wall(px2, 5, py2, gy - 1);
            E({ t: 'pylon', x: px2 * TS, y: py2 * TS - 14, w: 5 * TS, h: 14, bi: i, tab: k, text: (b.tabs[k].label || ('TAB ' + (k + 1))), act: 'stand' });
          }
          break;
        }
        case 'ul': case 'ol': {
          var ni = Math.min((b.items || []).length, 8);
          for (var s = 0; s < ni; s++) {
            var sx = x0 + 2 + s * 4, sy = gy - 1 - (s % 3);
            wall(sx, 3, sy, gy - 1);
            E({ t: 'stone', x: sx * TS, y: sy * TS - 14, w: 3 * TS, h: 14, bi: i, item: s, ord: b.t === 'ol', act: 'stand' });
          }
          break;
        }
        case 'admonition': {
          var kd = String(b.kind || 'note').toLowerCase();
          if (HAZKIND[kd]) {
            haz(cx - 1, 3, gy - 1);
            E({ t: 'hazsign', x: (cx - 1) * TS, y: (gy - 1) * TS, w: 3 * TS, h: TS, bi: i, kind: kd, deco: true });
          } else {
            E({ t: 'spring', x: cx * TS, y: (gy - 1) * TS, w: 2 * TS, h: TS, bi: i, kind: kd, act: 'stand' });
          }
          break;
        }
        case 'details':
          E({ t: 'chamber', x: (x0 + 3) * TS, y: (gy - 5) * TS, w: 3 * TS, h: 5 * TS, bi: i, act: 'press', text: cut(plain(b.summary) || 'FOLD', 30) });
          break;

        case 'endpoint':
          wall(cx - 3, 7, gy - 2, gy - 1);
          E({ t: 'term', x: (cx - 3) * TS, y: (gy - 2) * TS - 16, w: 7 * TS, h: 16, bi: i, act: 'press', text: (b.method ? b.method + ' ' : '') + cut(b.path || b.title || 'CALL', 26) });
          break;

        case 'img':
          lv.pickTotal++;
          wall(cx - 5, 11, gy - 10, gy - 5);
          wall(cx - 4, 9, gy - 1, gy - 1);
          E({ t: 'shot', x: (cx - 4) * TS, y: (gy - 1) * TS - 14, w: 9 * TS, h: 14, bi: i, act: 'stand', text: cut(plain(b.alt) || 'SCREENSHOT', 26) });
          break;

        case 'badge':
          E({ t: 'sigil', x: cx * TS, y: (gy - 4) * TS, w: 2 * TS, h: 2 * TS, bi: i, act: 'touch', text: cut(b.label || b.kind || 'BADGE', 22) });
          break;

        case 'columns':
          oneWay(x0 + 3, Math.max(4, mainEnd - x0 - 6), gy - 3);
          E({ t: 'stele', x: (x0 + 1) * TS, y: (gy - 4) * TS, w: TS, h: 4 * TS, bi: i, text: seg.label });
          break;

        case 'hr':
          E({ t: 'obelisk', x: cx * TS, y: (gy - 6) * TS, w: 2 * TS, h: 6 * TS, bi: i });
          break;

        default:
          E({ t: 'stele', x: (x0 + 1) * TS, y: (gy - 4) * TS, w: TS, h: 4 * TS, bi: i, text: seg.label });
      }

      /* ---- doors: one per link, in the order the links are written ---- */
      for (var d = 0; d < nd; d++) {
        var dx = mainEnd + 1 + d * 6;
        var door = {
          t: 'door', kind: 'link', x: dx * TS, y: (gy - 5) * TS, w: 3 * TS, h: 5 * TS,
          bi: i, to: links[d].to, text: links[d].text, act: 'press'
        };
        E(door); lv.doors.push(door);
      }
    }

    /* ---- the tail: a return door where you arrived, and the next page --- */
    fill(PAD_R, gy);
    lv.W = col;

    if (arrivedFrom && B.pages[arrivedFrom.slug]) {
      var back = {
        t: 'door', kind: 'back', x: 2 * TS, y: (BASE_GY - 5) * TS, w: 3 * TS, h: 5 * TS,
        bi: 0, to: arrivedFrom.slug, text: 'BACK · ' + cut(TITLE[arrivedFrom.slug] || arrivedFrom.slug, 26), act: 'press'
      };
      lv.ents.push(back); lv.doors.push(back);
    }
    var nx = nextInOrder(sl);
    if (nx) {
      var fwd = {
        t: 'door', kind: 'next', x: (lv.W - 8) * TS, y: (gy - 5) * TS, w: 3 * TS, h: 5 * TS,
        bi: Math.max(0, blocks.length - 1), to: nx, text: 'NEXT PAGE · ' + cut(TITLE[nx] || nx, 24), act: 'press'
      };
      lv.ents.push(fwd); lv.doors.push(fwd);
    }

    /* ---- indexes: tile column -> block, and per-column draw lists ------ */
    var segAt = new Int32Array(lv.W);
    var cur = 0;
    for (var t2 = 0; t2 < lv.W; t2++) segAt[t2] = -1;
    for (var s2 = 0; s2 < lv.segs.length; s2++) {
      var sg = lv.segs[s2];
      for (var t3 = sg.x0; t3 < sg.x1 && t3 < lv.W; t3++) segAt[t3] = s2;
    }
    for (var t4 = 0; t4 < lv.W; t4++) { if (segAt[t4] < 0) segAt[t4] = cur; else cur = segAt[t4]; }
    lv.segAt = segAt;

    lv.colSolid = []; lv.colOne = []; lv.colHaz = [];
    function spread(set, target) {
      set.forEach(function (k) {
        var tx = Math.floor(k / 64), ty = k - tx * 64;
        (target[tx] || (target[tx] = [])).push(ty);
      });
    }
    spread(lv.solid, lv.colSolid); spread(lv.oneway, lv.colOne); spread(lv.hazard, lv.colHaz);

    lv.BK = 32 * TS;
    lv.buckets = [];
    lv.ents.forEach(function (e) {
      var b0 = Math.max(0, Math.floor((e.x - 40) / lv.BK)), b1 = Math.floor((e.x + e.w + 40) / lv.BK);
      for (var q = b0; q <= b1; q++) (lv.buckets[q] || (lv.buckets[q] = [])).push(e);
    });

    lv.startX = 4 * TS;
    lv.startY = (lv.ground[4] - 2) * TS;
    return lv;
  }

  function prevInOrder(s) { var i = ORDIDX[s]; return i > 0 ? B.order[i - 1] : null; }
  function nextInOrder(s) { var i = ORDIDX[s]; return (i >= 0 && i < B.order.length - 1) ? B.order[i + 1] : null; }

  /* ==========================================================================
     RENDERER — one integer-resolution back buffer, blitted with smoothing off.
     Zoom is chosen so the running figure is 48–64 device pixels tall.
     ========================================================================== */
  var dcv, dctx, buf, bx, VW = 360, VH = 200, SC = 4;
  var camX = 0, camY = 0;   // float, physics
  var RX = 0, RY = 0;       // integer, rendering (no subpixel = no anti-aliasing)

  function sizeScreen() {
    dcv = $('screen');
    if (!dcv) return;
    var r = dcv.parentElement.getBoundingClientRect();
    var cw = Math.max(320, Math.floor(r.width)), ch = Math.max(180, Math.floor(r.height));
    /* target ~360 logical px across: at SC 4 the 14px body reads 56px tall */
    /* the 14px body must land between 48 and 64 device pixels, so the zoom
       is capped at 4x: 14 * 4 = 56. Only a stage too small to hold the
       corridor drops to 3x. */
    SC = clamp(Math.round(Math.min(cw / 270, ch / 115)), 3, 4);
    VW = Math.floor(cw / SC); VH = Math.floor(ch / SC);
    dcv.width = VW * SC; dcv.height = VH * SC;
    dcv.style.width = (VW * SC) + 'px'; dcv.style.height = (VH * SC) + 'px';
    dctx = dcv.getContext('2d');
    dctx.imageSmoothingEnabled = false;
    if (!buf) buf = document.createElement('canvas');
    SKY = null;
    buf.width = VW; buf.height = VH;
    bx = buf.getContext('2d');
    bx.imageSmoothingEnabled = false;
    if (L) makeBackdrops(L);
  }

  /* --- sky: a two colour dithered ramp, rose at altitude to bone at the
     horizon. Bayer 4x4, no intermediate tone anywhere. --- */
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  var SKY = null, SKYKEY = '';
  function makeSky() {
    if (SKY && SKYKEY === VW + 'x' + VH) return SKY;
    var c = document.createElement('canvas');
    c.width = VW; c.height = VH;
    var g2 = c.getContext('2d');
    var im = g2.createImageData(VW, VH);
    var d = im.data;
    var A = [0x2A, 0x0F, 0x3D], Ro = [0xFF, 0x3D, 0x6E], Bo = [0xFF, 0xE9, 0xC7];
    for (var y = 0; y < VH; y++) {
      var t = y / Math.max(1, VH - 1);
      for (var x = 0; x < VW; x++) {
        var th = (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
        var col;
        if (t < 0.09) { col = ((t / 0.09) > th) ? Ro : A; }
        else if (t < 0.20) { col = Ro; }
        else if (t < 0.31) {
          var v = (t - 0.20) / 0.11; v = v * v * (3 - 2 * v);
          col = (v > th) ? Bo : Ro;
        } else { col = Bo; }
        var o = (y * VW + x) * 4;
        d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
      }
    }
    g2.putImageData(im, 0, 0);
    var cxp = Math.floor(VW * 0.76), cyp = Math.floor(VH * 0.145), rr = Math.max(9, Math.floor(VH * 0.095));
    g2.fillStyle = BONE;
    for (var yy = -rr; yy <= rr; yy++) {
      var hw = Math.floor(Math.sqrt(rr * rr - yy * yy));
      g2.fillRect(cxp - hw, cyp + yy, hw * 2, 1);
    }
    g2.fillStyle = ROSE;
    for (var k = 0; k < 6; k++) {
      var byy = cyp - Math.floor(rr * 0.1) + k * 3;
      g2.fillRect(cxp - rr - 2, byy, rr * 2 + 4, 1 + Math.floor(k / 3));
    }
    g2.fillStyle = JADE;
    g2.fillRect(0, Math.floor(VH * 0.312), VW, 1);
    SKY = c; SKYKEY = VW + 'x' + VH;
    return c;
  }

  function makeStrip(seed, color, opts) {
    var rnd = mul32(seed);
    var w = 512, h = opts.h;
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g2 = c.getContext('2d');
    var x = 0;
    while (x < w) {
      var bw = opts.min + Math.floor(rnd() * (opts.max - opts.min));
      var bh = Math.floor(h * (opts.lo + rnd() * (opts.hi - opts.lo)));
      var top = h - bh;
      g2.fillStyle = color;
      g2.fillRect(x, top, bw, bh);
      var f = rnd();
      if (f < 0.30) g2.fillRect(x + Math.floor(bw / 3), top - 11 - Math.floor(rnd() * 10), 3, 14);
      else if (f < 0.52) { g2.fillRect(x + 2, top - 5, bw - 4, 5); g2.fillRect(x + Math.floor(bw / 2) - 1, top - 13, 2, 9); }
      else if (f < 0.70) { g2.fillRect(x, top - 3, bw, 3); g2.fillRect(x + 1, top - 10, 2, 7); g2.fillRect(x + bw - 3, top - 10, 2, 7); }
      if (opts.crown) {
        g2.fillStyle = opts.crown;
        for (var cy = top; cy < top + 7 && cy < h; cy++) {
          for (var cx2 = x; cx2 < x + bw; cx2++) {
            if (BAYER[((cy - top) & 3) * 4 + (cx2 & 3)] / 16 > 0.45 + (cy - top) / 9) g2.fillRect(cx2, cy, 1, 1);
          }
        }
      }
      if (opts.win) {
        g2.globalCompositeOperation = 'destination-out';
        g2.fillStyle = AUB;   // destination-out: the value is ignored, the hole is the point
        for (var wy = top + 6; wy < h - 5; wy += 7) {
          for (var wx = x + 3; wx < x + bw - 4; wx += 6) if (rnd() < 0.5) g2.fillRect(wx, wy, 2, 3);
        }
        g2.globalCompositeOperation = 'source-over';
      }
      x += bw + (opts.gap ? Math.floor(rnd() * opts.gap) : 0);
    }
    return c;
  }

  function makeBackdrops(lv) {
    makeSky();
    var fh = Math.max(22, Math.round(VH * 0.20)), mh = Math.max(26, Math.round(VH * 0.26));
    lv.far = makeStrip(lv.seed ^ 0x9E37, VIO, { h: fh, min: 10, max: 30, lo: 0.42, hi: 0.98, gap: 6, win: true });
    lv.mid = makeStrip(lv.seed ^ 0x1234, AUB, { h: mh, min: 16, max: 44, lo: 0.44, hi: 0.98, gap: 5, win: true, crown: VIO });
  }

  function tileStrip(img, offset, top) {
    if (!img) return;
    var w = img.width;
    var o = ((-offset % w) + w) % w;
    for (var sx = -o; sx < VW; sx += w) bx.drawImage(img, Math.floor(sx), Math.floor(top));
  }

  /* ==========================================================================
     THE CHARACTER — headless CMS, literally: the Strapi mark floats above
     the shoulders on a jade tether, lags on the run, overshoots on landing.
     ========================================================================== */
  var P = {
    x: 0, y: 0, w: 8, h: 14, vx: 0, vy: 0,
    face: 1, onGround: false, coyote: 0, buffer: 0, jumping: false,
    phase: 0, anim: 'idle', animT: 0, squash: 0, dropT: 0,
    hx: 0, hy: 0, hvx: 0, hvy: 0, tilt: 0, hurt: 0
  };

  var HEAD = [
    '.VVVVVVVV.',
    'VVVVVVVVVV',
    'VVAAABBBVV',
    'VVAABBBBVV',
    'VVABBBBBVV',
    'VVBBBBBBVV',
    'VVBBBBBAVV',
    'VVBBBAAAVV',
    'VVVVVVVVVV',
    '.VVVVVVVV.'
  ];
  function drawHead(hx, hy, tilt) {
    for (var r = 0; r < 10; r++) {
      var sh = Math.round(tilt * (r - 4.5) * 0.42);
      var row = HEAD[r];
      var run = null, runS = 0;
      for (var c = 0; c <= 10; c++) {
        var ch = c < 10 ? row[c] : '.';
        var col = ch === 'V' ? VIO : ch === 'A' ? AUB : ch === 'B' ? BONE : null;
        if (col !== run) {
          if (run) { bx.fillStyle = run; bx.fillRect(hx + runS + sh, hy + r, c - runS, 1); }
          run = col; runS = c;
        }
      }
    }
  }

  function limb(x0, y0, x1, y1, color, thick) {
    bx.fillStyle = color;
    var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    var err = dx - dy, n = 0, cx = x0, cy = y0;
    while (n++ < 48) {
      bx.fillRect(cx, cy, thick, thick);
      if (cx === x1 && cy === y1) break;
      var e2 = err * 2;
      if (e2 > -dy) { err -= dy; cx += sx; }
      if (e2 < dx) { err += dx; cy += sy; }
    }
  }

  function drawPlayer() {
    var sx = Math.round(P.x) - RX, sy = Math.round(P.y) - RY;
    var f = P.face, ph = P.phase;
    var bob = 0, lean = 0;
    var thA = 0, thB = 0, shA = 0, shB = 0, arA = 0, arB = 0;
    var body = P.hurt > 0 && (Math.floor(P.hurt * 24) & 1) ? ROSE : BONE;

    if (P.anim === 'run') {
      var th = ph * Math.PI * 2;
      thA = Math.sin(th) * 1.0; thB = Math.sin(th + Math.PI) * 1.0;
      shA = thA * 0.3 - Math.max(0, Math.sin(th + 1.3)) * 1.0;
      shB = thB * 0.3 - Math.max(0, Math.sin(th + Math.PI + 1.3)) * 1.0;
      arA = Math.sin(th + Math.PI) * 0.9; arB = Math.sin(th) * 0.9;
      bob = -Math.abs(Math.sin(th * 2));
      lean = f;
    } else if (P.anim === 'jump') {
      thA = 1.0; thB = 0.25; shA = -1.2; shB = -0.35; arA = -1.7; arB = -1.2; lean = f;
    } else if (P.anim === 'fall') {
      thA = 0.5; thB = -0.55; shA = -0.45; shB = 0.25; arA = -1.0; arB = 1.1; lean = f;
    } else {
      bob = Math.sin(ph * Math.PI * 2) < -0.35 ? 1 : 0;
      thA = 0.14; thB = -0.14; arA = 0.14; arB = -0.14;
    }

    var sq = Math.round(P.squash);
    var cx = sx + 4, top = sy + Math.round(bob) + sq;
    var torsoH = 7 - sq;
    var hipY = top + torsoH;

    function leg(t, k, side) {
      var hx0 = cx + side * 2, hy0 = hipY;
      var kx = Math.round(hx0 + Math.sin(t) * 4 * f), ky = Math.round(hy0 + Math.cos(t) * 4);
      var fx = Math.round(kx + Math.sin(t + k) * 3 * f), fy = Math.round(ky + Math.cos(t + k) * 3);
      limb(hx0, hy0, kx, ky, body, 2);
      limb(kx, ky, fx, fy, body, 2);
      bx.fillStyle = AUB; bx.fillRect(kx, ky, 1, 1);
      bx.fillStyle = body; bx.fillRect(f > 0 ? fx : fx - 1, fy + 2, 3, 1);
    }
    function arm(a, side) {
      var ax = cx + side * 3, ay = top + 2;
      var ex = Math.round(ax + Math.sin(a) * 5 * f), ey = Math.round(ay + Math.cos(a) * 5);
      limb(ax, ay, ex, ey, body, 2);
      bx.fillStyle = AUB; bx.fillRect(ex, ey, 2, 1);
    }

    leg(thB, shB, -1);
    arm(arB, -1);

    bx.fillStyle = body;
    bx.fillRect(cx - 4 + lean, top, 8, torsoH);
    bx.fillRect(cx - 5 + lean, top + 1, 10, torsoH - 3);
    bx.fillStyle = AUB;
    bx.fillRect(cx - 1 + lean, top + 2, 2, torsoH - 3);
    bx.fillRect(cx - 5 + lean, top + torsoH - 2, 3, 1);
    bx.fillRect(cx + 3 + lean, top + torsoH - 2, 2, 1);

    leg(thA, shA, 1);
    arm(arA, 1);

    bx.fillStyle = AUB;
    bx.fillRect(cx - 1 + lean, top - 1, 3, 1);
    bx.fillStyle = JADE;
    bx.fillRect(cx + lean, top - 1, 1, 1);

    var hpx = Math.round(P.hx) - RX, hpy = Math.round(P.hy) - RY;
    var nx0 = cx + lean, ny0 = top - 2, nx1 = hpx + 5, ny1 = hpy + 10;
    var steps = Math.max(1, Math.abs(ny0 - ny1));
    bx.fillStyle = JADE;
    for (var s2 = 0; s2 <= steps; s2 += 2) {
      var t2 = s2 / steps;
      bx.fillRect(Math.round(nx0 + (nx1 - nx0) * t2), Math.round(ny0 + (ny1 - ny0) * t2), 1, 1);
    }
    drawHead(hpx, hpy, P.tilt);
  }

  /* ==========================================================================
     SIGNAGE — every plate goes through one queue so two signs never overlap
     and truncate each other. Placed left to right, pushed up on collision.
     ========================================================================== */
  var PQ = [];
  function queuePlate(text, tx, ty, fg, bgc, anchor, prio) {
    if (!text) return;
    var img = label(cut(String(text), 32), fg);
    var w = img.width + 6, h = 9;
    var x0 = anchor === 'center' ? Math.round(tx - w / 2) : Math.round(tx);
    if (x0 + w < -12 || x0 > VW + 12) return;
    PQ.push({ img: img, x: x0, y: Math.round(ty), w: w, h: h, bg: bgc,
      ax: Math.round(tx), ay: Math.round(ty) + h, prio: prio || 0 });
  }
  /* one pass over every sign on screen: a sign is pushed up until it clears
     the ones already placed, and then tethered back to the object it names,
     so nothing overlaps and nothing floats free. */
  function flushPlates() {
    PQ.sort(function (a, b) { return (b.prio - a.prio) || (a.x - b.x); });
    var placed = [];
    for (var i = 0; i < PQ.length; i++) {
      var p = PQ[i], guard = 0;
      for (;;) {
        var hit = false;
        for (var j = 0; j < placed.length; j++) {
          var q = placed[j];
          if (p.x < q.x + q.w + 3 && p.x + p.w + 3 > q.x && Math.abs(p.y - q.y) < 11) { hit = true; break; }
        }
        if (!hit || guard++ > 9) break;
        p.y -= 12;
      }
      placed.push(p);
      if (p.ay - (p.y + p.h) > 3) {
        bx.fillStyle = p.bg;
        var lx = clamp(p.ax, p.x + 1, p.x + p.w - 2);
        for (var ly = p.y + p.h; ly < p.ay; ly += 2) bx.fillRect(lx, ly, 1, 1);
      }
      bx.fillStyle = p.bg;
      bx.fillRect(p.x, p.y, p.w, p.h);
      bx.drawImage(p.img, p.x + 3, p.y + 2);
    }
    PQ.length = 0;
  }

  /* ==========================================================================
     ENTITY DRAWING — each object is a piece of the page, drawn as itself.
     ========================================================================== */
  function isTaken(bi) { var s = taken[slug]; return !!(s && s.has(bi)); }

  function drawEnt(e, t) {
    var x = Math.round(e.x) - RX, y = Math.round(e.y) - RY;
    if (x + e.w < -60 || x > VW + 60) return;
    var read = e.bi <= (L.maxBlock == null ? -1 : L.maxBlock);
    var here = e.bi === L.cur;

    switch (e.t) {
      case 'door': {
        var lit = here || e.kind !== 'link';
        var bh = e.h, bw = e.w;
        var frame = e.kind === 'back' ? ROSE : VIO;
        /* threshold: a bone mat on the floor, so the door reads as standing
           on the ground and not painted on the back wall */
        bx.fillStyle = BONE; bx.fillRect(x - 3, y + bh - 2, bw + 6, 2);
        bx.fillStyle = AUB; bx.fillRect(x - 3, y + bh, bw + 6, 1);
        /* jamb + lintel */
        bx.fillStyle = BONE; bx.fillRect(x - 2, y - 2, bw + 4, bh);
        bx.fillStyle = frame; bx.fillRect(x, y, bw, bh - 2);
        /* the opening: jade, the one colour nothing in the background uses
           as a field, so a door is never mistaken for a building */
        var pulse = lit ? Math.round((Math.sin(t * 3.2 + e.x * 0.05) + 1) * 1.2) : 0;
        bx.fillStyle = JADE;
        bx.fillRect(x + 3, y + 5, bw - 6, bh - 8);
        bx.fillStyle = AUB;
        for (var sc = y + 6 + pulse; sc < y + bh - 4; sc += 4) bx.fillRect(x + 3, sc, bw - 6, 1);
        /* a chevron in the opening: which way this door takes you */
        var dirn = e.kind === 'back' ? -1 : 1;
        var mxq = x + bw / 2 - dirn * 2, myq = y + Math.round(bh * 0.52);
        bx.fillStyle = AUB;
        for (var q = 0; q < 5; q++) bx.fillRect(mxq + dirn * q, myq - 4 + q, 2, 2), bx.fillRect(mxq + dirn * q, myq + 4 - q, 2, 2);
        /* a bone tick above already-visited destinations */
        if (visited.has(e.to)) { bx.fillStyle = BONE; bx.fillRect(x + bw - 6, y + 2, 4, 2); }
        queuePlate(e.text, x + bw / 2, y - 14, e.kind === 'back' ? AUB : BONE,
          e.kind === 'back' ? ROSE : VIO, 'center', here ? 3 : 2);
        break;
      }
      case 'code': {
        bx.fillStyle = JADE;
        bx.fillRect(x, y + 12, e.w, 2);
        if (isTaken(e.bi)) { bx.fillStyle = BONE; bx.fillRect(x, y + 14, e.w, 1); }
        /* code rules floating over the deck: this slab is a listing */
        bx.fillStyle = JADE;
        bx.fillRect(x + 3, y + 2, Math.min(20, e.w - 8), 1);
        bx.fillRect(x + 7, y + 6, Math.min(14, e.w - 14), 1);
        queuePlate((isTaken(e.bi) ? '✓ ' : '') + e.lang.toUpperCase() + ' CODE', x + e.w / 2, y - 6, AUB, JADE, 'center', here ? 3 : 1);
        break;
      }
      case 'rung': {
        bx.fillStyle = read ? JADE : BONE;
        bx.fillRect(x, y + 12, e.w, 2);
        bx.fillStyle = AUB; bx.fillRect(x, y + 14, e.w, 1);
        bx.fillStyle = VIO; bx.fillRect(x + e.w - 2, y + 14, 2, 16);
        if (here) queuePlate('ROW ' + (e.row + 1), x + e.w / 2, y - 2, AUB, BONE, 'center', 2);
        break;
      }
      case 'pylon': {
        bx.fillStyle = (L.rev && L.rev.tab === e.tab && here) ? JADE : BONE;
        bx.fillRect(x, y + 12, e.w, 2);
        queuePlate(e.text, x + e.w / 2, y - 2, AUB, (L.rev && L.rev.tab === e.tab && here) ? JADE : BONE, 'center', here ? 2 : 0);
        break;
      }
      case 'stone': {
        bx.fillStyle = (here && L.rev && L.rev.item === e.item) ? JADE : BONE;
        bx.fillRect(x, y + 12, e.w, 2);
        if (here) queuePlate((e.ord ? 'STEP ' : 'ITEM ') + (e.item + 1), x + e.w / 2, y - 4, AUB, BONE, 'center', 2);
        break;
      }
      case 'spring': {
        var comp = e.t0 && (t - e.t0) < 0.2 ? 3 : 0;
        bx.fillStyle = JADE;
        bx.fillRect(x, y + comp, e.w, 3);
        bx.fillStyle = AUB;
        bx.fillRect(x + 1, y + 3 + comp, e.w - 2, 5 - comp);
        bx.fillStyle = JADE;
        bx.fillRect(x + 2, y + 4 + comp, e.w - 4, 1);
        queuePlate(e.kind.toUpperCase() + ' ↑', x + e.w / 2, y - 12, AUB, JADE, 'center', here ? 3 : 1);
        break;
      }
      case 'hazsign': {
        bx.fillStyle = ROSE;
        for (var h2 = 0; h2 < e.w; h2 += 8) {
          bx.fillRect(x + h2, y + 4, 8, 4);
          bx.fillRect(x + h2 + 1, y + 1, 2, 3);
          bx.fillRect(x + h2 + 5, y + 1, 2, 3);
        }
        bx.fillStyle = AUB; bx.fillRect(x, y + 7, e.w, 1);
        queuePlate(e.kind.toUpperCase() + ' — KNOCKS BACK', x + e.w / 2, y - 22, AUB, ROSE, 'center', here ? 3 : 1);
        break;
      }
      case 'chamber': {
        var open = here && L.rev && L.rev.open;
        bx.fillStyle = AUB; bx.fillRect(x - 2, y - 2, e.w + 4, e.h + 2);
        bx.fillStyle = ROSE; bx.fillRect(x, y, e.w, e.h);
        bx.fillStyle = BONE; bx.fillRect(x, y, e.w, 2);
        bx.fillStyle = open ? BONE : AUB;
        bx.fillRect(x + 2, y + 5, e.w - 4, e.h - 6);
        if (open) { bx.fillStyle = JADE; bx.fillRect(x + 3, y + 7, e.w - 6, 1); bx.fillRect(x + 3, y + 10, e.w - 8, 1); }
        queuePlate((open ? 'OPEN · ' : 'FOLD · ') + e.text, x + e.w / 2, y - 12, AUB, ROSE, 'center', here ? 3 : 1);
        break;
      }
      case 'term': {
        bx.fillStyle = AUB; bx.fillRect(x, y, e.w, 16);
        bx.fillStyle = BONE; bx.fillRect(x, y, e.w, 1);
        bx.fillStyle = (here && L.rev && L.rev.term) ? JADE : VIO;
        bx.fillRect(x + 2, y + 3, e.w - 4, 10);
        bx.fillStyle = AUB;
        for (var sl2 = y + 4; sl2 < y + 13; sl2 += 3) bx.fillRect(x + 3, sl2, e.w - 6, 1);
        bx.fillStyle = ROSE; bx.fillRect(x + e.w - 5, y + 4, 2, 2);
        queuePlate(e.text, x + e.w / 2, y - 12, BONE, VIO, 'center', here ? 3 : 1);
        break;
      }
      case 'shot': {
        /* the billboard body sits in the solid layer; here we draw its face */
        var bwx = 11 * TS, bxx = x + e.w / 2 - bwx / 2, byy = y - 7 * TS + 6;
        bx.fillStyle = BONE; bx.fillRect(bxx, byy, bwx, 6 * TS);
        bx.fillStyle = VIO; bx.fillRect(bxx + 2, byy + 2, bwx - 4, 6 * TS - 4);
        bx.fillStyle = BONE;
        bx.fillRect(bxx + 5, byy + 6, bwx - 10, 3);
        bx.fillRect(bxx + 5, byy + 12, Math.floor((bwx - 10) * 0.6), 3);
        bx.fillStyle = JADE; bx.fillRect(bxx + 5, byy + 18, Math.floor((bwx - 10) * 0.8), 3);
        bx.fillStyle = ROSE; bx.fillRect(bxx + 5, byy + 24, Math.floor((bwx - 10) * 0.35), 3);
        bx.fillStyle = AUB; bx.fillRect(bxx + bwx / 2 - 2, byy + 6 * TS, 4, 2 * TS);
        bx.fillStyle = isTaken(e.bi) ? JADE : BONE; bx.fillRect(x, y + 12, e.w, 2);
        queuePlate('SCREENSHOT · ' + e.text, x + e.w / 2, y - 6, BONE, VIO, 'center', here ? 3 : 1);
        break;
      }
      case 'sigil': {
        var fl = Math.round(Math.sin(t * 3 + e.x) * 2);
        bx.fillStyle = ROSE; bx.fillRect(x + 2, y + fl, e.w - 4, e.h - 4);
        bx.fillStyle = BONE; bx.fillRect(x + 4, y + 2 + fl, e.w - 8, e.h - 8);
        queuePlate(e.text, x + e.w / 2, y - 10 + fl, AUB, ROSE, 'center', here ? 2 : 0);
        break;
      }
      case 'gate': {
        var gw = e.w, gh = e.h;
        var gx = x - gw / 2;
        bx.fillStyle = VIO;
        bx.fillRect(gx, y, 3, gh);
        bx.fillRect(gx + gw - 3, y, 3, gh);
        bx.fillRect(gx, y, gw, 4);
        bx.fillStyle = BONE;
        bx.fillRect(gx, y, gw, 1);
        bx.fillRect(gx, y + 4, gw, 1);
        bx.fillStyle = e.lv === 2 ? JADE : ROSE;
        bx.fillRect(gx + 3, y + 6, gw - 6, 2);
        queuePlate((e.lv === 2 ? '§ ' : '') + e.text, x, y - 12, e.lv === 2 ? BONE : AUB, e.lv === 2 ? VIO : BONE, 'center', here ? 3 : 1);
        break;
      }
      case 'obelisk': {
        bx.fillStyle = AUB; bx.fillRect(x, y, e.w, e.h);
        bx.fillStyle = VIO; bx.fillRect(x, y + 2, e.w, 2);
        bx.fillStyle = BONE; bx.fillRect(x, y, e.w, 1);
        break;
      }
      case 'stele': {
        bx.fillStyle = read ? JADE : VIO;
        bx.fillRect(x, y, 2, e.h);
        bx.fillStyle = BONE; bx.fillRect(x - 1, y, 4, 2);
        queuePlate(e.text, x + 4, y - 10, AUB, BONE, 'left', here ? 2 : 0);
        break;
      }
    }
  }

  /* ==========================================================================
     FRAME
     ========================================================================== */
  var focusEnt = null, tSec = 0;

  function visibleEnts() {
    if (!L.buckets) return L.ents;
    var b0 = Math.max(0, Math.floor((RX - 200) / L.BK));
    var b1 = Math.floor((RX + VW + 200) / L.BK);
    var out = [];
    for (var q = b0; q <= b1; q++) {
      var arr = L.buckets[q];
      if (!arr) continue;
      for (var i = 0; i < arr.length; i++) if (out.indexOf(arr[i]) < 0) out.push(arr[i]);
    }
    return out;
  }

  function nextUnvisitedDoor() {
    if (!L) return null;
    var best = null;
    for (var i = 0; i < L.doors.length; i++) {
      var d = L.doors[i];
      if (d.kind !== 'link') continue;
      if (visited.has(d.to)) continue;
      if (d.x + d.w < P.x) continue;
      if (!best || d.x < best.x) best = d;
    }
    if (!best) for (var j = 0; j < L.doors.length; j++) { var e = L.doors[j]; if (e.kind === 'link' && e.x > P.x) { best = e; break; } }
    return best;
  }

  function draw() {
    if (!L || !bx) return;
    RX = Math.round(camX); RY = Math.round(camY);

    if (SKY) bx.drawImage(SKY, 0, 0);
    else { bx.fillStyle = ROSE; bx.fillRect(0, 0, VW, VH); }

    /* horizontal parallax is strong, vertical parallax is near unity: the
       skyline stays welded to the terrain line instead of sliding off it */
    var HW = (BASE_GY - WALLH + 1) * TS;
    var fy = HW + 3 - RY * 0.93, my = HW + 6 - RY * 0.96;
    tileStrip(L.far, Math.floor(RX * 0.10), Math.round(fy) - L.far.height);
    tileStrip(L.mid, Math.floor(RX * 0.26), Math.round(my) - L.mid.height);

    var x0 = Math.floor(RX / TS) - 1, x1 = Math.floor((RX + VW) / TS) + 1;
    var i, j, colr, sxp, topY;

    /* the corridor wall: aubergine, WALLH tiles above the terrain, tracing
       it. The play field is always a dark band, so a bone character and a
       bone sign can never fall on the bone sky and disappear. */
    for (i = x0; i <= x1; i++) {
      if (i < 0 || i >= L.W) continue;
      var wt = (L.ground[i] - WALLH) * TS - RY;
      var wb = L.ground[i] * TS - RY;
      if (wb < 0 || wt > VH) continue;
      sxp = i * TS - RX;
      bx.fillStyle = AUB; bx.fillRect(sxp, wt, TS, wb - wt);
      bx.fillStyle = VIO; bx.fillRect(sxp, wt + 1, TS, 1);
      bx.fillStyle = BONE; bx.fillRect(sxp, wt, TS, 1);
      if ((i & 3) === 0) { bx.fillStyle = VIO; bx.fillRect(sxp + 2, wt + 16, 4, 3); bx.fillRect(sxp + 2, wt + 40, 4, 3); }
      if ((i & 15) === 7) { bx.fillStyle = ROSE; bx.fillRect(sxp + 3, wt + 8, 2, 2); }
    }

    /* ---- terrain: aubergine silhouette, bone rim light on every walkable
       surface. The rim is the contract: if it has a bone edge you can stand
       on it, if it does not it is scenery. */
    bx.fillStyle = AUB;
    for (i = x0; i <= x1; i++) {
      if (i < 0 || i >= L.W) continue;
      topY = L.ground[i] * TS - RY;
      if (topY > VH) continue;
      bx.fillRect(i * TS - RX, topY, TS, VH - topY + 8);
    }
    for (i = x0; i <= x1; i++) {
      if (i < 0 || i >= L.W) continue;
      var g2t = L.ground[i];
      topY = g2t * TS - RY;
      if (topY > VH) continue;
      sxp = i * TS - RX;
      var lt = (i > 0) ? L.ground[i - 1] : -1;
      var rt2 = (i < L.W - 1) ? L.ground[i + 1] : -1;

      bx.fillStyle = VIO;
      bx.fillRect(sxp, topY + 4, TS, 1);
      if ((i & 7) === 0) bx.fillRect(sxp + 3, topY + 9, 2, 26);
      bx.fillStyle = ROSE;
      bx.fillRect(sxp, topY + 14, TS, 2);
      bx.fillStyle = BONE;
      bx.fillRect(sxp, topY, TS, 2);
      if (lt >= 0 && lt > g2t) bx.fillRect(sxp, topY, 1, (lt - g2t) * TS);
      if (rt2 >= 0 && rt2 > g2t) bx.fillRect(sxp + TS - 1, topY, 1, (rt2 - g2t) * TS);
    }

    /* ---- the reading ruler: the current block's span is painted on the
       ground, and every block boundary gets a tick. Position = paragraph. */
    var sg = L.segs[L.cur];
    for (i = x0; i <= x1; i++) {
      if (i < 0 || i >= L.W) continue;
      var si = L.segAt[i];
      var isBound = (i > 0 && L.segAt[i - 1] !== si);
      topY = L.ground[i] * TS - RY;
      if (isBound) { bx.fillStyle = VIO; bx.fillRect(i * TS - RX, topY - 4, 1, 4); }
      if (sg && i >= sg.x0 && i < sg.x1) {
        bx.fillStyle = ROSE;
        bx.fillRect(i * TS - RX, topY - 2, TS, 2);
      } else if (si < L.cur) {
        bx.fillStyle = JADE;
        bx.fillRect(i * TS - RX, topY - 1, TS, 1);
      }
    }

    /* ---- solid blocks (billboard bodies, terminals) */
    bx.fillStyle = AUB;
    for (i = x0; i <= x1; i++) {
      colr = L.colSolid[i];
      if (!colr) continue;
      sxp = i * TS - RX;
      for (j = 0; j < colr.length; j++) bx.fillRect(sxp, colr[j] * TS - RY, TS, TS);
    }
    /* their edges, so a slab reads as an object and not as more back wall:
       bone on top where you can stand, violet down the exposed sides */
    for (i = x0; i <= x1; i++) {
      colr = L.colSolid[i];
      if (!colr) continue;
      sxp = i * TS - RX;
      for (j = 0; j < colr.length; j++) {
        var ty2 = colr[j], key = i * 64 + ty2;
        var above = L.solid.has(key - 1) || (L.ground[i] != null && ty2 - 1 >= L.ground[i]);
        var leftS = L.solid.has(key - 64) || (L.ground[i - 1] != null && ty2 >= L.ground[i - 1]);
        var rightS = L.solid.has(key + 64) || (L.ground[i + 1] != null && ty2 >= L.ground[i + 1]);
        var yy = ty2 * TS - RY;
        if (!leftS) { bx.fillStyle = VIO; bx.fillRect(sxp, yy, 1, TS); }
        if (!rightS) { bx.fillStyle = VIO; bx.fillRect(sxp + TS - 1, yy, 1, TS); }
        if (!above) { bx.fillStyle = BONE; bx.fillRect(sxp, yy, TS, 2); }
      }
    }

    /* ---- one-way decking: jade lip on an aubergine shadow */
    for (i = x0; i <= x1; i++) {
      colr = L.colOne[i];
      if (!colr) continue;
      sxp = i * TS - RX;
      for (j = 0; j < colr.length; j++) {
        topY = colr[j] * TS - RY;
        bx.fillStyle = JADE; bx.fillRect(sxp, topY, TS, 2);
        bx.fillStyle = AUB; bx.fillRect(sxp, topY + 2, TS, 1);
      }
    }

    /* ---- hazards */
    bx.fillStyle = ROSE;
    for (i = x0; i <= x1; i++) {
      colr = L.colHaz[i];
      if (!colr) continue;
      sxp = i * TS - RX;
      for (j = 0; j < colr.length; j++) {
        topY = colr[j] * TS - RY;
        bx.fillRect(sxp, topY + 3, TS, 5);
        bx.fillRect(sxp + 1, topY, 2, 3);
        bx.fillRect(sxp + 5, topY, 2, 3);
      }
    }

    var ve = visibleEnts();
    for (i = 0; i < ve.length; i++) drawEnt(ve[i], tSec);

    drawPlayer();

    /* ---- the pointer to the next unvisited door */
    var nd = nextUnvisitedDoor();
    if (nd) {
      var mx = clamp(Math.round(nd.x + nd.w / 2) - RX, 8, VW - 9);
      var bobv = Math.round(Math.sin(tSec * 5) * 2);
      var my2 = 12 + bobv;
      bx.fillStyle = ROSE;
      for (var a = 0; a < 6; a++) bx.fillRect(mx - a, my2 + a, 1 + a * 2, 1);
      bx.fillStyle = BONE; bx.fillRect(mx - 1, my2 - 4, 3, 4);
      var far = Math.round((nd.x - P.x) / TS);
      if (Math.abs(far) > 6) queuePlate('NEXT DOOR ' + (far > 0 ? '→ ' : '← ') + Math.abs(far) + 'M', mx, my2 + 8, AUB, ROSE, 'center', 4);
    }

    /* ---- the contextual prompt, floating on the object itself */
    if (focusEnt) {
      var fx = Math.round(focusEnt.x + focusEnt.w / 2) - RX;
      var fyq = Math.round(focusEnt.y) - RY - 24;
      queuePlate(promptFor(focusEnt), fx, fyq, AUB, JADE, 'center', 5);
      bx.fillStyle = JADE;
      bx.fillRect(fx - 1, fyq + 10, 3, 4);
    }

    flushPlates();

    dctx.drawImage(buf, 0, 0, VW, VH, 0, 0, VW * SC, VH * SC);
  }

  /* ==========================================================================
     PHYSICS
     ========================================================================== */
  var keys = Object.create(null);
  var jumpEdge = false;
  function down(c) { return !!keys[c]; }
  function K(tx, ty) { return tx * 64 + ty; }

  function solidAt(tx, ty) {
    if (tx < 0 || tx >= L.W) return true;
    if (ty < 0 || ty >= LEVEL_H) return false;
    var gt = L.ground[tx];
    if (gt >= 0 && ty >= gt) return true;
    return L.solid.has(K(tx, ty));
  }
  function overlapSolid(pxx, pyy) {
    var x0 = Math.floor(pxx / TS), x1 = Math.floor((pxx + P.w - 1) / TS);
    var y0 = Math.floor(pyy / TS), y1 = Math.floor((pyy + P.h - 1) / TS);
    for (var a = x0; a <= x1; a++) for (var b = y0; b <= y1; b++) if (solidAt(a, b)) return true;
    return false;
  }
  function onewayAt(tx, ty) { return L.oneway.has(K(tx, ty)); }
  function hazardAt(tx, ty) { return L.hazard.has(K(tx, ty)); }

  function step(dt) {
    var left = down('ArrowLeft') || down('KeyA') || down('KeyQ');
    var right = down('ArrowRight') || down('KeyD');
    var wantJump = down('Space') || down('KeyW') || down('ArrowUp');
    var wantDown = down('ArrowDown') || down('KeyS');

    var ax = (right ? 1 : 0) - (left ? 1 : 0);
    if (P.hurt > 0) { P.hurt -= dt; if (P.hurt > 0.25) ax = 0; }
    if (ax) P.face = ax;

    var acc = P.onGround ? RUN_ACC : AIR_ACC;
    var top = RUN_MAX * ((down('ShiftLeft') || down('ShiftRight')) ? SPRINT : 1);
    if (ax) {
      P.vx += ax * acc * (down('ShiftLeft') || down('ShiftRight') ? 1.7 : 1) * dt;
      P.vx = clamp(P.vx, -top, top);
    } else {
      var fr = (P.onGround ? GND_FRICTION : AIR_DRAG) * dt;
      if (P.vx > fr) P.vx -= fr; else if (P.vx < -fr) P.vx += fr; else P.vx = 0;
    }

    P.coyote = P.onGround ? COYOTE : Math.max(0, P.coyote - dt);
    if (jumpEdge) { P.buffer = BUFFER; jumpEdge = false; }
    else P.buffer = Math.max(0, P.buffer - dt);

    if (P.buffer > 0 && P.coyote > 0) {
      P.vy = -JUMP_V; P.onGround = false; P.jumping = true;
      P.buffer = 0; P.coyote = 0;
      P.hvy -= 40;
      if (wantDown) P.dropT = 0.18;
    }
    if (P.jumping && !wantJump && P.vy < -JUMP_CUT) { P.vy = -JUMP_CUT; P.jumping = false; }
    if (P.vy >= 0) P.jumping = false;

    P.vy += GRAV * dt;
    if (P.vy > FALL_MAX) P.vy = FALL_MAX;
    if (P.dropT > 0) P.dropT -= dt;

    /* ---- X axis, with a one tile step assist so rolling ground is a
       pleasure to run over instead of a wall to jump */
    var prevBottom = P.y + P.h;
    var nx = P.x + P.vx * dt;
    if (overlapSolid(nx, P.y)) {
      if ((P.onGround || P.coyote > 0) && !overlapSolid(nx, P.y - TS) && !overlapSolid(P.x, P.y - TS)) {
        P.y -= TS; P.x = nx;
      } else if (P.vx > 0) {
        P.x = Math.floor((nx + P.w) / TS) * TS - P.w; P.vx = 0;
      } else {
        P.x = Math.floor(nx / TS) * TS + TS; P.vx = 0;
      }
    } else P.x = nx;
    if (P.x < 0) { P.x = 0; P.vx = 0; }
    if (P.x > L.W * TS - P.w) { P.x = L.W * TS - P.w; P.vx = 0; }

    /* ---- Y axis */
    var wasGround = P.onGround;
    var impact = P.vy;
    P.onGround = false;
    P.y += P.vy * dt;
    var tx0 = Math.floor(P.x / TS), tx1 = Math.floor((P.x + P.w - 1) / TS);
    if (P.vy > 0) {
      var by = Math.floor((P.y + P.h) / TS);
      for (var t3 = tx0; t3 <= tx1; t3++) {
        var hit = solidAt(t3, by);
        if (!hit && P.dropT <= 0 && onewayAt(t3, by) && prevBottom <= by * TS + 1) hit = true;
        if (hit) { P.y = by * TS - P.h; P.vy = 0; P.onGround = true; break; }
      }
    } else if (P.vy < 0) {
      var uy = Math.floor(P.y / TS);
      for (var t4 = tx0; t4 <= tx1; t4++) if (solidAt(t4, uy)) { P.y = (uy + 1) * TS; P.vy = 0; break; }
    }

    if (P.onGround && !wasGround) {
      P.squash = Math.min(3, Math.abs(impact) / 110);
      P.hvy += Math.min(170, Math.abs(impact) * 0.6);
      P.anim = 'land';
    }
    P.squash = Math.max(0, P.squash - dt * 14);

    if (P.y > LEVEL_H * TS + 60) { P.x = clamp(P.x, 0, (L.W - 2) * TS); P.y = (L.ground[clamp(Math.floor(P.x / TS), 0, L.W - 1)] - 3) * TS; P.vy = 0; }

    /* ---- the document's own warnings have consequences: a caution shoves
       you back the way you came instead of killing you. */
    if (P.hurt <= 0) {
      var hx0 = Math.floor((P.x + 1) / TS), hx1 = Math.floor((P.x + P.w - 2) / TS);
      var hy0 = Math.floor((P.y + 2) / TS), hy1 = Math.floor((P.y + P.h - 1) / TS);
      for (var a2 = hx0; a2 <= hx1 && P.hurt <= 0; a2++) {
        for (var b2 = hy0; b2 <= hy1; b2++) {
          if (hazardAt(a2, b2)) {
            P.hurt = 0.55;
            P.vx = -P.face * 210; P.vy = -170; P.onGround = false;
            knocks++;
            var kb = page.blocks[L.segAt[clamp(Math.floor(P.x / TS), 0, L.W - 1)] ] ;
            toast('KNOCKED BACK BY A ' + String((kb && kb.kind) || 'CAUTION').toUpperCase(), true);
            break;
          }
        }
      }
    }

    if (!P.onGround) P.anim = P.vy < 0 ? 'jump' : 'fall';
    else if (Math.abs(P.vx) > 8) P.anim = 'run';
    else if (P.anim !== 'land' || P.squash <= 0) P.anim = 'idle';
    var rate = P.anim === 'run' ? Math.abs(P.vx) / 26 : 0.7;
    P.phase = (P.phase + rate * dt) % 1;

    /* ---- the detached head, spring damped */
    var tgx = P.x - 1 - P.vx * 0.05;
    var tgy = P.y - 17 - (P.onGround ? 0 : clamp(P.vy * 0.014, -2, 4));
    var kSpring = 260, kDamp = 22;
    P.hvx += (tgx - P.hx) * kSpring * dt;
    P.hvy += (tgy - P.hy) * kSpring * dt;
    P.hvx -= P.hvx * kDamp * dt;
    P.hvy -= P.hvy * kDamp * dt;
    P.hx += P.hvx * dt;
    P.hy += P.hvy * dt;
    P.tilt = clamp((P.x - 1 - P.hx) * 0.5, -2.6, 2.6);

    interact(dt);
    updateCursor();
    updateCamera(dt);
  }

  function updateCamera(dt) {
    var maxX = Math.max(0, L.W * TS - VW), maxY = Math.max(0, LEVEL_H * TS - VH);
    /* a centred dead zone: the cursor stays in the middle of the screen so
       what is left of it is what you have read and what is right is what
       you have not. Never pinned to an edge. */
    var focusX = P.x + P.w / 2;
    var focusY = P.y + P.h / 2 - 10;
    var dzx = Math.max(20, VW * 0.06), dzy = Math.max(14, VH * 0.11);

    var ccx = camX + VW / 2;
    if (focusX < ccx - dzx) ccx = focusX + dzx;
    else if (focusX > ccx + dzx) ccx = focusX - dzx;

    var ccy = camY + VH * 0.56;
    if (focusY < ccy - dzy) ccy = focusY + dzy;
    else if (focusY > ccy + dzy) ccy = focusY - dzy;

    var wantX = clamp(ccx - VW / 2, 0, maxX);
    var wantY = clamp(ccy - VH * 0.56, 0, maxY);
    if (dt < 0) { camX = wantX; camY = wantY; return; }
    camX += (wantX - camX) * (1 - Math.exp(-9 * dt));
    camY += (wantY - camY) * (1 - Math.exp(-6 * dt));
    camX = clamp(camX, 0, maxX);
    camY = clamp(camY, 0, maxY);
  }

  function overlaps(e, pad) {
    pad = pad || 0;
    return P.x < e.x + e.w + pad && P.x + P.w > e.x - pad && P.y < e.y + e.h + pad && P.y + P.h > e.y - pad;
  }
  function nearEnts() {
    if (!L.buckets) return L.ents;
    var b = Math.floor(P.x / L.BK);
    var out = [];
    for (var q = b - 1; q <= b + 1; q++) { var a = L.buckets[q]; if (a) for (var i = 0; i < a.length; i++) if (out.indexOf(a[i]) < 0) out.push(a[i]); }
    return out;
  }

  var knocks = 0;

  function promptFor(e) {
    switch (e.t) {
      case 'door': return 'E · ' + (e.kind === 'back' ? 'GO BACK' : e.kind === 'next' ? 'NEXT PAGE' : 'FOLLOW LINK');
      case 'chamber': return (L.rev && L.rev.open) ? 'E · CLOSE THE FOLD' : 'E · OPEN THE FOLD';
      case 'term': return (L.rev && L.rev.term) ? 'E · HIDE THE RESPONSE' : 'E · RUN THE REQUEST';
      case 'code': return isTaken(e.bi) ? 'CODE TAKEN' : 'STAND ON IT TO TAKE THE CODE';
      case 'rung': return 'ROW ' + (e.row + 1) + ' — CLIMB FOR THE NEXT';
      case 'stone': return (e.ord ? 'STEP ' : 'ITEM ') + (e.item + 1);
      case 'pylon': return 'TAB · ' + cut(e.text, 22);
      case 'shot': return 'SCREENSHOT SHOWN BELOW';
      case 'spring': return String(e.kind).toUpperCase() + ' — SPRINGS YOU UP';
      case 'sigil': return 'BADGE · ' + cut(e.text, 20);
      default: return '';
    }
  }

  function interact(dt) {
    var arr = nearEnts();
    var best = null, bestD = 1e9;
    for (var i = 0; i < arr.length; i++) {
      var e = arr[i];
      if (e.deco) continue;
      var on = overlaps(e, e.act === 'press' ? 10 : 2);
      if (!on) continue;

      if (e.act === 'stand') {
        var standing = P.onGround && (P.y + P.h) <= e.y + e.h + 6 && (P.y + P.h) >= e.y - 2;
        if (e.t === 'code' && standing) {
          if (!isTaken(e.bi)) {
            (taken[slug] || (taken[slug] = new Set())).add(e.bi);
            toast('CODE TAKEN · ' + e.lang.toUpperCase());
            save(); updateHud();
          }
        } else if (e.t === 'rung' && standing) {
          if (!L.rev || L.rev.row !== e.row) { L.rev = L.rev || {}; L.rev.row = e.row; renderStrip(true); }
        } else if (e.t === 'stone' && standing) {
          if (!L.rev || L.rev.item !== e.item) { L.rev = L.rev || {}; L.rev.item = e.item; renderStrip(true); }
        } else if (e.t === 'pylon' && standing) {
          if (!L.rev || L.rev.tab !== e.tab) { L.rev = L.rev || {}; L.rev.tab = e.tab; renderStrip(true); }
        } else if (e.t === 'spring' && P.vy >= 0 && (P.y + P.h) >= e.y - 4 && (P.y + P.h) <= e.y + e.h + 4
            && (!e.t0 || tSec - e.t0 > 0.45)) {
          P.vy = -SPRING_V; P.onGround = false; P.hvy -= 80; e.t0 = tSec;
          toast(String(e.kind).toUpperCase() + ' GIVES YOU A LIFT');
        } else if (e.t === 'shot' && standing) {
          if (!isTaken(e.bi)) { (taken[slug] || (taken[slug] = new Set())).add(e.bi); save(); }
        }
      }

      var cx = P.x + P.w / 2, ex = e.x + e.w / 2;
      var d = Math.abs(cx - ex);
      if (promptFor(e) && d < bestD) { bestD = d; best = e; }
    }
    focusEnt = best;
  }

  function doInteract() {
    if (!focusEnt) return;
    var e = focusEnt;
    if (e.t === 'door') { enterDoor(e); return; }
    if (e.t === 'chamber') { L.rev = L.rev || {}; L.rev.open = !L.rev.open; renderStrip(true); toast(L.rev.open ? 'FOLD OPENED' : 'FOLD CLOSED'); return; }
    if (e.t === 'term') { L.rev = L.rev || {}; L.rev.term = !L.rev.term; renderStrip(true); toast(L.rev.term ? 'REQUEST SENT · RESPONSE SHOWN' : 'RESPONSE HIDDEN'); return; }
  }

  function enterDoor(e) {
    if (e.kind === 'back') { arrivedFrom = null; navigate(e.to, null); return; }
    navigate(e.to, { slug: slug, label: TITLE[slug] || slug });
  }

  /* ==========================================================================
     THE READING STRIP — docked, always visible, and it is the answer to
     "what is the character for". It renders the block you are standing in.
     ========================================================================== */
  function crumbFor(idx) {
    var bs = page.blocks || [];
    var h2 = '', h3 = '';
    for (var i = 0; i <= idx && i < bs.length; i++) {
      var t = bs[i].t;
      if (t === 'h2') { h2 = bs[i].text || ''; h3 = ''; }
      else if (t === 'h3') h3 = bs[i].text || '';
    }
    return [page.title, h2, h3].filter(Boolean).join('  ›  ');
  }

  function stripBlock(b) {
    /* the endpoint terminal withholds the response until you run it */
    if (b.t === 'endpoint' && !(L.rev && L.rev.term)) {
      var c = {}; for (var k in b) c[k] = b[k];
      c.responses = [];
      return c;
    }
    return b;
  }

  var lastStripKey = '';
  function renderStrip(force) {
    if (!page || !L) return;
    var bs = page.blocks || [];
    var i = clamp(L.cur, 0, Math.max(0, bs.length - 1));
    var b = bs[i];
    var rev = L.rev || {};
    var key = i + '|' + (rev.row | 0) + '|' + (rev.item | 0) + '|' + (rev.tab | 0) + '|' + (rev.open ? 1 : 0) + '|' + (rev.term ? 1 : 0);
    if (!force && key === lastStripKey) return;
    lastStripKey = key;

    $('sb-idx').textContent = 'BLOCK ' + (i + 1) + ' / ' + bs.length;
    $('sb-kind').textContent = b ? (KINDNAME[b.t] || String(b.t).toUpperCase()) : '—';
    $('sb-crumb').textContent = crumbFor(i);

    /* the doors written in this block, as chips, so the page is fully
       navigable without playing */
    var chips = [];
    for (var d = 0; d < L.doors.length; d++) {
      var dr = L.doors[d];
      if (dr.kind === 'link' && dr.bi === i) chips.push(dr);
    }
    for (var d2 = 0; d2 < L.doors.length && chips.length < 6; d2++) {
      if (L.doors[d2].kind !== 'link') chips.push(L.doors[d2]);
    }
    var sd = $('sb-doors');
    sd.innerHTML = chips.slice(0, 6).map(function (dr, n) {
      return '<button type="button" data-door="' + n + '">' + esc(cut(dr.text, 30)) + '</button>';
    }).join('');
    sd._doors = chips.slice(0, 6);

    RS = rev;
    var html = b ? renderBlock(stripBlock(b)) : '';
    if (b && b.t === 'hr') html = '<hr><p class="ep-sub">SECTION BREAK</p>';
    if (b && b.t === 'endpoint' && !rev.term) html += '<p class="ep-sub">PRESS E AT THE TERMINAL TO RUN THIS REQUEST AND SEE THE RESPONSE.</p>';
    if (b && b.t === 'details' && !rev.open) html += '<p class="ep-sub">PRESS E AT THE FOLD DOOR TO OPEN THE SIDE CHAMBER.</p>';
    if (b && b.t === 'details' && rev.open) html = '<div class="chamber"><p class="chamber-h">SIDE CHAMBER · OPENED</p>' + html + '</div>';
    RS = null;

    $('strip-doc').innerHTML = html;
    $('strip-body').scrollTop = 0;
  }

  /* the cursor: where the character stands is where you are in the page */
  function updateCursor() {
    var tile = clamp(Math.floor((P.x + P.w / 2) / TS), 0, L.W - 1);
    var si = L.segAt[tile];
    if (si !== L.cur) {
      L.cur = si;
      L.rev = {};
      renderStrip();
      if (si > L.maxBlock) {
        L.maxBlock = si;
        if (si >= L.segs.length - 1 && L.segs.length > 1 && !finished.has(slug)) {
          finished.add(slug); save();
          toast('PAGE WALKED END TO END');
        }
      }
      updateHud();
    }
  }

  function updateHud() {
    if (!L || !page) return;
    var n = (page.blocks || []).length;
    $('hp-cur').textContent = String(Math.min(n, L.cur + 1));
    $('hp-tot').textContent = String(n);
    var frac = n > 1 ? (L.maxBlock) / (n - 1) : 1;
    var cf = n > 1 ? L.cur / (n - 1) : 1;
    $('hp-fill').style.width = Math.round(clamp(frac, 0, 1) * 100) + '%';
    $('hp-head').style.left = 'calc(' + Math.round(clamp(cf, 0, 1) * 100) + '% - 1px)';
    var fin = finished.has(slug);
    $('hud-progress').classList.toggle('done', fin);
    $('hud-progress').firstElementChild.textContent = fin ? '✓ WALKED END TO END' : 'READ THROUGH';
    $('g-doors').textContent = String(L.doors.filter(function (d) { return d.kind === 'link'; }).length);
    $('g-code').textContent = (taken[slug] ? taken[slug].size : 0) + '/' + L.pickTotal;
    $('g-pages').textContent = visited.size + '/' + B.order.length;
  }

  function renderTrail() {
    var el = $('trail');
    if (!el) return;
    if (trail.length < 2) { el.innerHTML = ''; return; }
    var last = trail.slice(-5);
    el.innerHTML = '<span class="trail-lab">TRAIL</span>' + last.map(function (s) {
      return '<button type="button" data-goto="' + attr(s) + '">' + esc(cut(TITLE[s] || s, 24)) + '</button>';
    }).join('');
  }

  var toastT = 0;
  function toast(t, bad) {
    var el = $('toast');
    if (!el) return;
    el.textContent = String(t).toUpperCase();
    el.className = 'toast' + (bad ? ' bad' : '');
    el.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(function () { el.hidden = true; }, 2200);
  }

  /* ==========================================================================
     WHOLE PAGE OVERLAY — the secondary path, for anyone who just wants to
     read the thing.
     ========================================================================== */
  function pageArticle(p) {
    var out = [];
    out.push('<div class="doc-head">');
    out.push('<p class="doc-kicker">' + esc((p.product || '').toUpperCase()) + ' &nbsp;/&nbsp; ' + esc(p.section || '') + '</p>');
    out.push('<h1>' + esc(p.title) + '</h1>');
    if (p.description) out.push('<p class="lede">' + esc(p.description) + '</p>');
    if (p.tags && p.tags.length) out.push('<ul class="tagrow">' + p.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>');
    out.push('</div>');
    var bs = p.blocks || [];
    RS = { open: true, term: true };
    for (var i = 0; i < bs.length; i++) {
      out.push('<div class="blk" id="blk-' + i + '">' + renderBlock(bs[i]) + '</div>');
    }
    RS = null;
    var o = OUT[p.slug] || [], n = IN_[p.slug] || [];
    if (o.length) {
      out.push('<h2 id="doors-out">Doors out of this level</h2>');
      out.push('<p>This page cites ' + o.length + ' other page' + (o.length === 1 ? '' : 's') + '. In the level each one is a door, standing at the point in the prose where the link is written.</p>');
      out.push('<div class="cards">' + o.map(function (s) {
        var q = B.pages[s];
        return '<a class="card" href="#' + attr(s) + '"><b>' + esc(q ? q.title : s) + '</b><span>'
          + esc(q && q.description ? q.description : s) + '</span></a>';
      }).join('') + '</div>');
    }
    if (n.length) {
      out.push('<h2 id="doors-in">Levels that lead here</h2>');
      out.push('<ul>' + n.map(function (s) {
        var q = B.pages[s];
        return '<li><a href="#' + attr(s) + '">' + esc(q ? q.title : s) + '</a></li>';
      }).join('') + '</ul>');
    }
    return out.join('');
  }

  var codexDirty = true;
  function ensureCodex() {
    if (!codexDirty) return;
    codexDirty = false;
    renderCodex(page);
  }
  function renderCodex(p) {
    $('doc').innerHTML = pageArticle(p);
    $('codex-crumb').textContent = (p.product || '').toUpperCase() + ' / ' + (p.section || '') + ' / ' + p.title;
    var hs = p.headings || [];
    $('toc').innerHTML = hs.length
      ? hs.map(function (h) { return '<a href="#" class="lv' + h.level + '" data-anchor="' + attr(h.id) + '">' + esc(h.text) + '</a>'; }).join('')
      : '<p class="none">No headings on this page.</p>';
    function citeList(id, arr) {
      $(id).innerHTML = arr.length ? arr.map(function (s) {
        var q = B.pages[s];
        return '<a href="#' + attr(s) + '">' + esc(q ? q.title : s) + '<span>' + esc(q ? q.section : '') + '</span></a>';
      }).join('') : '<p class="none">None.</p>';
    }
    citeList('cites-out', OUT[p.slug] || []);
    citeList('cites-in', IN_[p.slug] || []);
    var pv = prevInOrder(p.slug), nx = nextInOrder(p.slug);
    $('pager').innerHTML =
      (pv ? '<a class="prev" href="#' + attr(pv) + '"><span>&larr; PREVIOUS LEVEL</span><b>' + esc(TITLE[pv]) + '</b></a>' : '')
      + (nx ? '<a class="next" href="#' + attr(nx) + '"><span>NEXT LEVEL &rarr;</span><b>' + esc(TITLE[nx]) + '</b></a>' : '');
    $('colophon').innerHTML =
      '<span>' + esc(p.file || p.slug) + '</span>'
      + '<span>' + num(G.words[p.slug] || 0) + ' WORDS</span>'
      + '<span>' + (G.code[p.slug] || 0) + ' CODE BLOCKS</span>'
      + '<span>' + (p.blocks || []).length + ' BLOCKS = ' + (L ? L.W : 0) + ' TILES OF LEVEL</span>';
  }

  function openCodex(anchor) {
    ensureCodex();
    var c = $('codex');
    c.classList.add('open');
    c.setAttribute('aria-hidden', 'false');
    var m = $('codex-main');
    if (anchor) {
      var t = document.getElementById(anchor);
      m.scrollTop = t ? Math.max(0, t.offsetTop - 24) : 0;
    } else {
      var cb = document.getElementById('blk-' + L.cur);
      m.scrollTop = cb ? Math.max(0, cb.offsetTop - 24) : 0;
    }
    var cl = $('codex-close'); if (cl) cl.focus();
  }
  function closeCodex() {
    var c = $('codex');
    c.classList.remove('open');
    c.setAttribute('aria-hidden', 'true');
    var s = $('screen'); if (s) s.focus();
  }
  function codexOpen() { return $('codex').classList.contains('open'); }

  /* ==========================================================================
     INDEX DRAWER + SEARCH
     ========================================================================== */
  var indexBuilt = false;
  function buildIndex() {
    if (indexBuilt) return;
    indexBuilt = true;
    var seen = Object.create(null);
    var html = [];
    B.nav.forEach(function (sec) {
      var links = [];
      (function walk(items) {
        (items || []).forEach(function (it) {
          if (it.slug && B.pages[it.slug] && !seen[it.slug]) {
            seen[it.slug] = 1;
            links.push('<a href="#' + attr(it.slug) + '" data-slug="' + attr(it.slug) + '">' + esc(it.label || TITLE[it.slug]) + '</a>');
          }
          if (it.items) walk(it.items);
        });
      })(sec.items);
      if (links.length) {
        html.push('<section class="index-sec"><h3>' + esc(sec.product.toUpperCase() + ' · ' + sec.label)
          + ' (' + links.length + ')</h3>' + links.join('') + '</section>');
      }
    });
    var rest = B.order.filter(function (s) { return !seen[s]; });
    if (rest.length) {
      html.push('<section class="index-sec"><h3>UNFILED (' + rest.length + ')</h3>'
        + rest.map(function (s) { return '<a href="#' + attr(s) + '" data-slug="' + attr(s) + '">' + esc(TITLE[s]) + '</a>'; }).join('')
        + '</section>');
    }
    $('index-body').innerHTML = html.join('');
  }
  function markIndex() {
    if (!indexBuilt) return;
    var as = $('index-body').querySelectorAll('a[data-slug]');
    for (var i = 0; i < as.length; i++) {
      var s = as[i].getAttribute('data-slug');
      as[i].className = (s === slug ? 'here ' : '') + (finished.has(s) ? 'seen' : visited.has(s) ? 'seen' : '');
    }
  }
  var SIDX = null;
  function searchIndex() {
    if (SIDX) return SIDX;
    SIDX = B.order.map(function (s) {
      var p = B.pages[s];
      return { s: s, t: p.title, d: p.description || '', sec: p.section || '', k: (p.title + ' ' + (p.description || '') + ' ' + s + ' ' + (p.tags || []).join(' ')).toLowerCase() };
    });
    return SIDX;
  }
  function runSearch(q) {
    var box = $('searchres');
    q = String(q || '').trim().toLowerCase();
    if (q.length < 2) { box.hidden = true; box.innerHTML = ''; return; }
    var idx = searchIndex(), hits = [];
    for (var i = 0; i < idx.length && hits.length < 40; i++) {
      var r = idx[i];
      var pos = r.k.indexOf(q);
      if (pos >= 0) hits.push({ r: r, score: (r.t.toLowerCase().indexOf(q) === 0 ? 0 : 1) + pos / 1000 });
    }
    hits.sort(function (a, b) { return a.score - b.score; });
    box.innerHTML = hits.length
      ? hits.slice(0, 24).map(function (h) {
        return '<a href="#' + attr(h.r.s) + '"><b>' + esc(h.r.t) + '</b><span>' + esc(h.r.sec) + ' · '
          + num(G.words[h.r.s] || 0) + ' WORDS · ' + ((OUT[h.r.s] || []).length) + ' DOORS OUT</span></a>';
      }).join('')
      : '<p>NO MATCH</p>';
    box.hidden = false;
  }

  /* ==========================================================================
     ROUTING — the hash is the page, always.
     ========================================================================== */
  function parseHash() {
    var h = decodeURIComponent(String(location.hash || '').replace(/^#/, ''));
    if (!h || h === '/') return HOME;
    h = h.split('#')[0];
    if (h.charAt(0) !== '/') h = '/' + h;
    return h;
  }
  function navigate(s, from) {
    if (!B.pages[s]) return;
    pendingFrom = from || null;
    if (parseHash() === s) { route(); return; }
    location.hash = '#' + s;
  }
  var pendingFrom = null;

  function route() {
    var s = parseHash();
    if (!B.pages[s]) s = HOME;
    arrivedFrom = pendingFrom; pendingFrom = null;
    loadLevel(s);
  }

  function loadLevel(s) {
    slug = s;
    page = B.pages[s];
    document.title = page.title + ' — Dusk Works · Strapi Docs';
    visited.add(s);
    if (trail[trail.length - 1] !== s) { trail.push(s); if (trail.length > 8) trail.shift(); }
    save();

    L = buildLevel(s);
    L.cur = 0; L.maxBlock = 0; L.rev = {};
    makeBackdrops(L);

    P.x = L.startX; P.y = L.startY;
    P.vx = P.vy = 0; P.onGround = false; P.face = 1; P.hurt = 0;
    P.hx = P.x - 1; P.hy = P.y - 17; P.hvx = P.hvy = 0;
    camX = 0; camY = 0;
    updateCamera(-1);

    $('hud-title').textContent = page.title;
    $('hud-sec').textContent = ((page.product || '') + ' · ' + (page.section || '')).toUpperCase()
      + ' · ' + (page.blocks || []).length + ' BLOCKS · ' + num(G.words[s] || 0) + ' WORDS';

    lastStripKey = '';
    renderStrip(true);
    updateHud();
    renderTrail();
    codexDirty = true;
    markIndex();
    if (still) cursorTo(0);
    draw();
  }

  /* ==========================================================================
     STILL READING MODE — reduced motion, or anyone who does not want to
     play. The cursor steps block by block; everything else is identical.
     ========================================================================== */
  function cursorTo(idx) {
    if (!L) return;
    idx = clamp(idx, 0, L.segs.length - 1);
    var sg = L.segs[idx];
    var tx = clamp((sg.x0 + sg.x1) >> 1, 0, L.W - 1);
    P.x = tx * TS; P.y = (L.ground[tx] * TS) - P.h;
    P.vx = P.vy = 0; P.onGround = true; P.anim = 'idle';
    P.hx = P.x - 1; P.hy = P.y - 17; P.hvx = P.hvy = 0;
    L.cur = idx;
    L.rev = {};
    if (idx > L.maxBlock) L.maxBlock = idx;
    updateCamera(-1);
    /* after a jump, focus the object that IS this block before any door in
       it: pressing E should read the block, never teleport you by surprise */
    focusEnt = null;
    var arr = nearEnts(), cand = [];
    for (var i = 0; i < arr.length; i++) {
      var en = arr[i];
      if (en.bi === idx && !en.deco && promptFor(en)) cand.push(en);
    }
    cand.sort(function (m, n) { return (m.t === 'door' ? 1 : 0) - (n.t === 'door' ? 1 : 0); });
    focusEnt = cand[0] || null;
    renderStrip(true);
    updateHud();
    draw();
  }
  function setStill(on) {
    still = !!on;
    $('btn-still').setAttribute('aria-pressed', still ? 'true' : 'false');
    $('btn-still').firstChild.nodeValue = still ? 'PLAY ' : 'STILL ';
    if (still) { running = false; cursorTo(L ? L.cur : 0); }
    else { startLoop(); }
  }

  /* ==========================================================================
     LOOP — fixed timestep accumulator.
     ========================================================================== */
  var acc = 0, last = 0, rafId = 0;
  function frame(now) {
    rafId = requestAnimationFrame(frame);
    if (!running || still) return;
    if (!last) last = now;
    var dt = (now - last) / 1000; last = now;
    if (dt > 0.25) dt = 0.25;
    acc += dt; tSec = now / 1000;
    var n = 0;
    while (acc >= STEP && n < MAXSTEPS) { step(STEP); acc -= STEP; n++; }
    if (n === MAXSTEPS) acc = 0;
    draw();
  }
  function startLoop() {
    running = true; last = 0; acc = 0;
    if (!rafId) rafId = requestAnimationFrame(frame);
  }

  /* ==========================================================================
     WIRING
     ========================================================================== */
  var MOVEKEYS = { ArrowLeft: 1, ArrowRight: 1, KeyA: 1, KeyD: 1, KeyQ: 1, ArrowUp: 1, ArrowDown: 1, KeyW: 1, KeyS: 1, Space: 1 };

  function dismissFirstRun() {
    if (!firstRun) return;
    firstRun = false;
    var f = $('firstrun'); if (f) f.hidden = true;
    save();
  }

  function wire() {
    window.addEventListener('resize', function () { sizeScreen(); if (still) draw(); });

    document.addEventListener('keydown', function (ev) {
      var tag = (ev.target && ev.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (ev.key === 'Escape') { ev.target.blur(); $('searchres').hidden = true; }
        return;
      }
      var c = ev.code;
      if (MOVEKEYS[c]) {
        ev.preventDefault();
        dismissFirstRun();
        if (still) {
          if (c === 'ArrowRight' || c === 'KeyD') cursorTo(L.cur + 1);
          else if (c === 'ArrowLeft' || c === 'KeyA' || c === 'KeyQ') cursorTo(L.cur - 1);
          return;
        }
        if (!keys[c] && (c === 'Space' || c === 'KeyW' || c === 'ArrowUp')) jumpEdge = true;
        keys[c] = true;
        return;
      }
      if (c === 'KeyE' || c === 'Enter') { ev.preventDefault(); dismissFirstRun(); doInteract(); return; }
      if (c === 'KeyR') { ev.preventDefault(); codexOpen() ? closeCodex() : openCodex(null); return; }
      if (c === 'KeyM') { ev.preventDefault(); setStill(!still); return; }
      if (c === 'Tab' && !codexOpen() && !$('index').classList.contains('open')) {
        ev.preventDefault();
        var ix = $('index');
        buildIndex(); markIndex();
        var on = ix.classList.toggle('open');
        ix.setAttribute('aria-hidden', on ? 'false' : 'true');
        return;
      }
      if (c === 'Escape') {
        if (codexOpen()) closeCodex();
        var ix2 = $('index');
        if (ix2.classList.contains('open')) { ix2.classList.remove('open'); ix2.setAttribute('aria-hidden', 'true'); }
        return;
      }
      if (c === 'Period' || c === 'Comma') {
        ev.preventDefault();
        var dir = c === 'Period' ? 1 : -1;
        var bs = page.blocks || [], j = L.cur + dir, found = -1;
        while (j > 0 && j < bs.length) { if (bs[j].t === 'h2' || bs[j].t === 'h3') { found = j; break; } j += dir; }
        if (found < 0) found = dir > 0 ? bs.length - 1 : 0;
        cursorTo(found);
        toast('SECTION · ' + cut(plain(bs[found] && bs[found].text) || 'START', 34));
        return;
      }
      if (c === 'BracketLeft') { ev.preventDefault(); var pv = prevInOrder(slug); if (pv) navigate(pv, null); }
      if (c === 'BracketRight') { ev.preventDefault(); var nx = nextInOrder(slug); if (nx) navigate(nx, null); }
    });

    document.addEventListener('keyup', function (ev) { keys[ev.code] = false; });
    window.addEventListener('blur', function () { keys = Object.create(null); });

    window.addEventListener('hashchange', route);

    $('btn-read').addEventListener('click', function () { codexOpen() ? closeCodex() : openCodex(null); });
    $('btn-still').addEventListener('click', function () { setStill(!still); });
    $('btn-index').addEventListener('click', function () {
      buildIndex(); markIndex();
      var ix = $('index'); var on = ix.classList.toggle('open');
      ix.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    $('codex-close').addEventListener('click', closeCodex);
    $('index-close').addEventListener('click', function () {
      var ix = $('index'); ix.classList.remove('open'); ix.setAttribute('aria-hidden', 'true');
    });
    $('search').addEventListener('input', function (e) { runSearch(e.target.value); });

    $('firstrun').addEventListener('click', dismissFirstRun);

    $('sb-doors').addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-door]');
      if (!b) return;
      var arr = $('sb-doors')._doors || [];
      var d = arr[+b.getAttribute('data-door')];
      if (d) enterDoor(d);
    });

    $('trail').addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-goto]');
      if (b) navigate(b.getAttribute('data-goto'), null);
    });

    /* tabs, copy buttons and internal links inside any rendered document */
    document.addEventListener('click', function (ev) {
      var tb = ev.target.closest && ev.target.closest('.tabs-strip button');
      if (tb) {
        var host = tb.closest('.tabs');
        var idx = tb.getAttribute('data-tab');
        host.querySelectorAll('.tabs-strip button').forEach(function (x) { x.setAttribute('aria-selected', x === tb ? 'true' : 'false'); });
        host.querySelectorAll('.tabs-panel').forEach(function (x) { x.hidden = x.getAttribute('data-panel') !== idx; });
        return;
      }
      var cp = ev.target.closest && ev.target.closest('[data-copy]');
      if (cp) {
        var pre = cp.closest('.codeblock').querySelector('code');
        try { navigator.clipboard.writeText(pre.textContent); cp.textContent = 'COPIED'; setTimeout(function () { cp.textContent = 'COPY'; }, 1200); }
        catch (e) { cp.textContent = 'SELECT IT'; }
        return;
      }
      var an = ev.target.closest && ev.target.closest('[data-anchor]');
      if (an) { ev.preventDefault(); openCodex(an.getAttribute('data-anchor')); return; }
      var a = ev.target.closest && ev.target.closest('a[href^="#/"]');
      if (a) {
        var to = a.getAttribute('href').slice(1).split('#')[0];
        if (B.pages[to]) {
          ev.preventDefault();
          if (codexOpen()) closeCodex();
          var ix3 = $('index');
          if (ix3.classList.contains('open')) { ix3.classList.remove('open'); ix3.setAttribute('aria-hidden', 'true'); }
          $('searchres').hidden = true;
          navigate(to, { slug: slug, label: TITLE[slug] || slug });
        }
      }
    });

    var cv = $('screen');
    cv.addEventListener('pointerdown', function () { cv.focus(); dismissFirstRun(); });
  }

  /* ==========================================================================
     BOOT
     ========================================================================== */
  function bootLine(t) { var e = $('boot-line'); if (e) e.textContent = t; }

  function init(content, graph, com) {
    B = content; G = graph; COM = com;
    B.order.forEach(function (s, i) { ORDIDX[s] = i; });
    Object.keys(B.pages).forEach(function (s) { TITLE[s] = B.pages[s].title; });
    (G.edges || []).forEach(function (e) {
      (OUT[e[0]] || (OUT[e[0]] = [])).push(e[1]);
      (IN_[e[1]] || (IN_[e[1]] = [])).push(e[0]);
    });

    reduced = false;
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }
    still = reduced;

    load();
    $('boot').hidden = true;
    $('shell').hidden = false;
    $('firstrun').hidden = !firstRun;
    $('btn-still').setAttribute('aria-pressed', still ? 'true' : 'false');
    if (still) $('btn-still').firstChild.nodeValue = 'PLAY ';

    sizeScreen();
    wire();
    route();
    if (!still) startLoop();
    $('screen').focus();

    /* a small, honest debug surface: the harness drives the real game */
    window.__arcade = {
      ready: true,
      get slug() { return slug; },
      get blockIndex() { return L ? L.cur : -1; },
      get blockCount() { return page ? (page.blocks || []).length : 0; },
      get maxBlock() { return L ? L.maxBlock : -1; },
      get playerX() { return P.x; },
      get tiles() { return L ? L.W : 0; },
      get doors() { return L ? L.doors.map(function (d) { return { kind: d.kind, to: d.to, text: d.text, tile: Math.round(d.x / TS), block: d.bi }; }) : []; },
      get still() { return still; },
      stripText: function () { return ($('strip-doc').textContent || '').replace(/\s+/g, ' ').trim(); },
      overlayText: function () { ensureCodex(); return ($('doc').textContent || '').replace(/\s+/g, ' ').trim(); },
      kinds: function () { return L ? L.ents.map(function (e) { return e.t; }) : []; },
      jump: function (i) { cursorTo(i); },
      get prompt() { return focusEnt ? promptFor(focusEnt) : ''; },
      get scale() { return SC; },
      get figurePx() { return { body: P.h * SC, whole: 31 * SC, viewport: [VW, VH] }; },
      go: function (s) { navigate(s, null); }
    };
  }

  function fail(msg) {
    bootLine(String(msg).toUpperCase());
    var b = $('boot'); if (b) b.hidden = false;
  }

  bootLine('LOADING CORPUS');
  Promise.all([
    fetch('content.json').then(function (r) { if (!r.ok) throw new Error('content ' + r.status); return r.json(); }),
    fetch('graph.json').then(function (r) { if (!r.ok) throw new Error('graph ' + r.status); return r.json(); }),
    fetch('communities.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
  ]).then(function (a) {
    bootLine('BUILDING LEVEL');
    init(a[0], a[1], a[2]);
  }).catch(function (e) {
    fail('COULD NOT LOAD: ' + (e && e.message ? e.message : e));
  });

})();
