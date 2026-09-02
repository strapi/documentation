/* ============================================================
   STRAPI DOCS — ARCADE
   Every page is a room. The citation graph is the corridors.
   ============================================================ */
(function () {
  'use strict';

  var HOME = '/cms/intro';
  var STORE = 'strapi-arcade-v1';
  var HAZARD_PREFIX = '/cms/migration/v4-to-v5/breaking-changes';
  var QUEST_SLUG = '/cms/quick-start';

  var B = null;          // content bundle
  var G = null;          // graph
  var ZONES = [];        // {label, product, key, slugs[], x,y,w,h, cols}
  var ROOM = {};         // slug -> {x,y,zone,i}
  var ZONE_OF = {};      // slug -> zone index
  var NEI = {};          // slug -> [slugs] (undirected citation adjacency)
  var TOTAL = { words: 0, code: 0, pages: 0 };
  var visited = new Set();
  var steps = new Set();
  var current = null;
  var searchIndex = null;
  var motion = true;
  var reduced = false;
  var worldView = false;

  var WORLD_W = 0, WORLD_H = 0;
  var RW = 5, RH = 3, GX = 7, GY = 5, ZPAD = 2, ZHEAD = 6, GUT = 5, MAXROW = 200;

  /* ---------------- utils ---------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function attr(s) { return esc(s); }
  function num(n) { return (n || 0).toLocaleString('en-US'); }
  function $(id) { return document.getElementById(id); }
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function stripTags(s) { return String(s || '').replace(/<[^>]*>/g, ' '); }
  function plain(h) { return decode(stripTags(h)).replace(/\s+/g, ' ').trim(); }
  function decode(s) {
    return String(s || '')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORE);
      if (!raw) return;
      var d = JSON.parse(raw);
      if (d && Array.isArray(d.v)) d.v.forEach(function (s) { visited.add(s); });
      if (d && Array.isArray(d.s)) d.s.forEach(function (s) { steps.add(s); });
      if (d && typeof d.m === 'boolean') motion = d.m;
    } catch (e) { /* private mode, blocked storage: run stateless */ }
  }
  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({
        v: Array.from(visited), s: Array.from(steps), m: motion
      }));
    } catch (e) { /* ignore */ }
  }

  /* Inline <img> tags in prose point at root-absolute paths or remote avatars.
     They are turned into text tokens so nothing off-origin is requested. */
  function inl(h) {
    h = String(h == null ? '' : h);
    if (h.indexOf('<img') === -1) return h;
    return h.replace(/<img\b[^>]*>/gi, function (tag) {
      var a = /alt\s*=\s*"([^"]*)"/i.exec(tag);
      var src = /src\s*=\s*"([^"]*)"/i.exec(tag);
      var label = (a && a[1]) ? a[1] : 'image';
      return '<span class="inlineimg"' + (src ? ' title="' + attr(src[1]) + '"' : '') + '>'
        + esc(label) + '</span>';
    });
  }

  /* ---------------- syntax highlight ---------------- */
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
      js: 'await|async|break|case|catch|class|const|continue|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|static|super|switch|this|throw|try|typeof|var|void|while|yield|null|true|false|undefined|interface|type|enum|implements|public|private|protected|readonly|as|declare|namespace|module|require|satisfies|any|string|number|boolean',
      json: 'true|false|null',
      sh: 'if|then|else|fi|for|while|do|done|export|cd|echo|sudo|npm|npx|yarn|pnpm|docker|curl|git|set|source|function|return|case|esac',
      yml: 'true|false|null|on|off|yes|no',
      http: 'GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|Authorization|Content-Type|Accept|Bearer',
      gql: 'query|mutation|subscription|fragment|on|type|input|enum|interface|schema|scalar|true|false|null',
      xml: 'true|false|null',
      diff: 'true|false'
    }[fam] || '';
    var hash = (fam === 'sh' || fam === 'yml' || fam === 'gql');
    var slash = (fam === 'js' || fam === 'json' || fam === 'http' || fam === 'xml');
    var cmt = [];
    if (slash) cmt.push('\\/\\/[^\\n]*', '\\/\\*[\\s\\S]*?\\*\\/');
    if (hash) cmt.push('(?<![\\w\\/:])#[^\\n]*');
    if (fam === 'xml') cmt.push('<!--[\\s\\S]*?-->');
    var src = '(' + (cmt.length ? cmt.join('|') : '(?!)') + ')'
      + '|("(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'|`(?:\\\\.|[^`\\\\])*`)'
      + '|\\b(\\d+(?:\\.\\d+)?)\\b'
      + (kw ? '|\\b(' + kw + ')\\b' : '|((?!))')
      + '|(@[A-Za-z][\\w-]*|\\$[A-Za-z_][\\w]*)';
    var rx = null;
    try { rx = new RegExp(src, 'g'); }
    catch (e) {
      try { rx = new RegExp(src.replace('(?<![\\w\\/:])', ''), 'g'); } catch (e2) { rx = null; }
    }
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

  /* ---------------- block renderer ---------------- */
  var uid = 0;

  function renderBlocks(blocks) {
    var out = [];
    for (var i = 0; i < (blocks || []).length; i++) out.push(renderBlock(blocks[i]));
    return out.join('');
  }

  function renderItems(items, ordered) {
    var out = [];
    for (var i = 0; i < (items || []).length; i++) {
      var it = items[i];
      if (typeof it === 'string') out.push('<li>' + inl(it) + '</li>');
      else if (it && typeof it === 'object') {
        out.push('<li>' + inl(it.html) + (it.blocks ? renderBlocks(it.blocks) : '') + '</li>');
      }
    }
    return '<' + (ordered ? 'ol' : 'ul') + '>' + out.join('') + '</' + (ordered ? 'ol' : 'ul') + '>';
  }

  function codeBlock(code, lang, title) {
    var head = '';
    if (title || lang) {
      head = '<div class="code-h">' + (title ? '<span>' + esc(title) + '</span>' : '')
        + '<span class="lang">' + esc(String(lang || 'text').toUpperCase()) + '</span>'
        + '<button class="copybtn" type="button" data-copy>COPY</button></div>';
    }
    return '<div class="codeblock">' + head
      + '<pre><code>' + highlight(code || '', lang) + '</code></pre></div>';
  }

  function renderBlock(b) {
    if (!b || !b.t) return '';
    switch (b.t) {
      case 'p': return '<p>' + inl(b.html) + '</p>';
      case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
        return '<' + b.t + (b.id ? ' id="' + attr(b.id) + '"' : '') + '>' + esc(b.text || '') + '</' + b.t + '>';
      case 'hr': return '<hr>';
      case 'tldr': return '<div class="tldr"><p>' + inl(b.html) + '</p></div>';
      case 'ul': return renderItems(b.items, false);
      case 'ol': return renderItems(b.items, true);
      case 'code': return codeBlock(b.code, b.lang, b.title);
      case 'admonition': {
        var k = String(b.kind || 'note').toLowerCase();
        return '<aside class="adm adm-' + esc(k) + '">'
          + '<div class="adm-h"><span class="adm-k">' + esc(k.toUpperCase()) + '</span>'
          + (b.title ? '<span class="adm-t">' + esc(b.title) + '</span>' : '') + '</div>'
          + '<div class="adm-b">' + renderBlocks(b.blocks) + '</div></aside>';
      }
      case 'details': {
        return '<details class="fold"' + (b.id ? ' id="' + attr(b.id) + '"' : '') + '>'
          + '<summary><span>' + inl(b.summary || 'Details') + '</span></summary>'
          + '<div class="fold-b">' + renderBlocks(b.blocks) + '</div></details>';
      }
      case 'table': {
        var al = b.align || [];
        var h = (b.head || []).map(function (c, i) {
          return '<th' + (al[i] ? ' style="text-align:' + esc(al[i]) + '"' : '') + '>' + inl(c) + '</th>';
        }).join('');
        var rows = (b.rows || []).map(function (r) {
          return '<tr>' + r.map(function (c, i) {
            return '<td' + (al[i] ? ' style="text-align:' + esc(al[i]) + '"' : '') + '>' + inl(c) + '</td>';
          }).join('') + '</tr>';
        }).join('');
        return '<div class="tablewrap"><table>'
          + (h ? '<thead><tr>' + h + '</tr></thead>' : '') + '<tbody>' + rows + '</tbody></table></div>';
      }
      case 'tabs': {
        var gid = 'tg' + (++uid);
        var strip = (b.tabs || []).map(function (t, i) {
          return '<button type="button" role="tab" data-tab="' + i + '" aria-selected="' + (i === 0) + '">'
            + esc(t.label || t.value || ('TAB ' + (i + 1))) + '</button>';
        }).join('');
        var panels = (b.tabs || []).map(function (t, i) {
          return '<div class="tabs-panel" role="tabpanel" data-panel="' + i + '"'
            + (i === 0 ? '' : ' hidden') + '>' + renderBlocks(t.blocks) + '</div>';
        }).join('');
        return '<div class="tabs" id="' + gid + '"><div class="tabs-strip" role="tablist">' + strip + '</div>' + panels + '</div>';
      }
      case 'img': {
        // Image srcs are root-absolute (/img/...). They only resolve when this
        // bundle is served from the documentation site root, so the plate is the
        // default and the bitmap is fetched only on request.
        var src = b.light || b.dark || '';
        return '<figure class="figure">'
          + '<div class="missing" data-shot="' + attr(src) + '" data-shotalt="' + attr(b.alt || '') + '">'
          + '<b>SCREENSHOT</b><span>' + esc(b.alt || 'Untitled image') + '</span>'
          + '<p class="shotpath"><code>' + esc(src) + '</code></p>'
          + (src ? '<button class="copybtn" type="button" data-loadshot>LOAD IMAGE</button>' : '')
          + '</div>'
          + (b.caption ? '<figcaption>' + inl(b.caption) + '</figcaption>' : '')
          + '</figure>';
      }
      case 'cards': {
        var items = (b.items || []).map(function (c) {
          var href = c.link || '#';
          return '<a class="card" href="' + attr(href) + '"><b>' + inl(c.title) + '</b>'
            + '<span>' + inl(c.desc) + '</span></a>';
        }).join('');
        return '<div class="cards">' + items + '</div>';
      }
      case 'badge': {
        return '<p class="blockbadge"><span class="badge badge--' + esc(b.kind || 'version') + '"'
          + (b.tooltip ? ' title="' + attr(b.tooltip) + '"' : '') + '>' + esc(b.label || b.kind || '') + '</span></p>';
      }
      case 'columns': {
        var cols = (b.cols || []).map(function (c) { return '<div>' + renderBlocks(c) + '</div>'; }).join('');
        return '<div class="cols">' + cols + '</div>';
      }
      case 'endpoint': return renderEndpoint(b);
      default: return '';
    }
  }

  function renderEndpoint(b) {
    var out = ['<section class="endpoint"' + (b.id ? ' id="' + attr(b.id) + '"' : '') + '>'];
    out.push('<div class="ep-h">');
    if (b.method) out.push('<span class="ep-m ' + esc(String(b.method).toLowerCase()) + '">' + esc(b.method) + '</span>');
    if (b.path) out.push('<span class="ep-p">' + esc(b.path) + '</span>');
    if (b.title) out.push('<span class="ep-t">' + esc(b.title) + '</span>');
    if (!b.method && !b.path && !b.title) out.push('<span class="ep-t">REQUEST</span>');
    out.push('</div><div class="ep-b">');
    if (b.description) out.push('<p>' + inl(b.description) + '</p>');
    if (b.params && b.params.length) {
      out.push('<p class="ep-sub">' + esc(b.paramTitle || 'PARAMETERS') + '</p><ul class="ep-params">');
      b.params.forEach(function (p) {
        out.push('<li><span class="pn">' + esc(p.name || '') + '</span>'
          + (p.type ? '<span class="pt">' + esc(p.type) + '</span>' : '')
          + (p.required ? '<span class="rq">REQUIRED</span>' : '')
          + (p.desc ? '<span class="pd">' + inl(p.desc) + '</span>' : '') + '</li>');
      });
      out.push('</ul>');
    }
    if (b.codeTabs && b.codeTabs.length) {
      out.push(renderBlock({
        t: 'tabs', tabs: b.codeTabs.map(function (c) {
          return { label: c.label, blocks: [{ t: 'code', lang: c.lang, code: c.code, title: '' }] };
        })
      }));
    }
    if (b.responses && b.responses.length) {
      out.push('<div class="ep-res">');
      b.responses.forEach(function (r) {
        var errc = (Number(r.status) >= 400) ? ' err' : '';
        out.push('<div class="ep-res-h"><span class="ep-status' + errc + '">' + esc(String(r.status || '')) + '</span>'
          + '<span style="color:var(--dim)">' + esc(r.statusText || '') + '</span>'
          + (r.time ? '<span style="color:var(--faint)">' + esc(r.time) + '</span>' : '') + '</div>');
        out.push(codeBlock(r.body || '', r.lang || 'json', ''));
      });
      out.push('</div>');
    }
    out.push('</div></section>');
    return out.join('');
  }

  /* ---------------- world layout ---------------- */
  function buildWorld() {
    var i;
    B.nav.forEach(function (sec, si) {
      var slugs = [];
      (function walk(items) {
        for (var k = 0; k < (items || []).length; k++) {
          var it = items[k];
          if (it.slug && !(it.slug in ZONE_OF)) { ZONE_OF[it.slug] = si; slugs.push(it.slug); }
          if (it.items) walk(it.items);
        }
      })(sec.items);
      ZONES.push({ label: sec.label, product: sec.product, slugs: slugs, idx: si });
    });
    // orphan safety
    B.order.forEach(function (s) {
      if (!(s in ZONE_OF)) { ZONE_OF[s] = ZONES.length - 1; ZONES[ZONES.length - 1].slugs.push(s); }
    });

    ZONES.forEach(function (z) {
      z.slugs.sort();
      var n = z.slugs.length;
      z.cols = Math.max(1, Math.ceil(Math.sqrt(n * 3.4)));
      z.rows = Math.ceil(n / z.cols);
      z.w = z.cols * GX - (GX - RW) + ZPAD * 2;
      z.h = z.rows * GY - (GY - RH) + ZPAD * 2 + ZHEAD;
      z.w = Math.max(z.w, 24);
    });

    // shelf pack
    var x = 0, y = 0, shelfH = 0, maxW = 0;
    ZONES.forEach(function (z) {
      if (x > 0 && x + z.w > MAXROW) { x = 0; y += shelfH + GUT; shelfH = 0; }
      z.x = x; z.y = y;
      x += z.w + GUT;
      if (z.h > shelfH) shelfH = z.h;
      if (x > maxW) maxW = x;
    });
    WORLD_W = maxW - GUT + 2;
    WORLD_H = y + shelfH + 2;

    ZONES.forEach(function (z) {
      z.slugs.forEach(function (s, k) {
        var c = k % z.cols, r = Math.floor(k / z.cols);
        ROOM[s] = {
          x: z.x + ZPAD + c * GX,
          y: z.y + ZPAD + ZHEAD + r * GY,
          zone: z.idx
        };
      });
    });

    // undirected citation adjacency
    G.edges.forEach(function (e) {
      var a = e[0], b = e[1];
      if (!(a in ROOM) || !(b in ROOM)) return;
      (NEI[a] || (NEI[a] = [])).push(b);
      (NEI[b] || (NEI[b] = [])).push(a);
    });
    Object.keys(NEI).forEach(function (k) {
      NEI[k] = Array.from(new Set(NEI[k])).filter(function (s) { return s !== k; });
    });

    B.order.forEach(function (s) {
      TOTAL.words += (G.words[s] || 0);
      TOTAL.code += (G.code[s] || 0);
      TOTAL.pages++;
    });
  }

  function isHazard(s) { return s.indexOf(HAZARD_PREFIX) === 0; }

  /* fog: 3 cleared (visited) | 2 sighted (cited by a visited room) | 1 mapped (zone entered) | 0 dark */
  var fogCache = null;
  function fog() {
    if (fogCache) return fogCache;
    var f = {};
    var zoneSeen = {};
    visited.forEach(function (s) {
      f[s] = 3;
      zoneSeen[ZONE_OF[s]] = 1;
      (NEI[s] || []).forEach(function (n) { if ((f[n] || 0) < 2) f[n] = 2; });
    });
    B.order.forEach(function (s) {
      if (!f[s] && zoneSeen[ZONE_OF[s]]) f[s] = 1;
      if (!f[s]) f[s] = 0;
    });
    fogCache = f;
    return f;
  }

  /* ---------------- 3x5 pixel font ---------------- */
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
    '/': '..#,..#,.#.,#..,#..', ':': '...,.#.,...,.#.,...', "'": '.#.,.#.,...,...,...',
    '&': '.#.,#.#,.#.,#.#,.##', '+': '...,.#.,###,.#.,...', '!': '.#.,.#.,.#.,...,.#.'
  };
  var GCACHE = {};
  function glyph(ch) {
    if (GCACHE[ch]) return GCACHE[ch];
    var g = FONT[ch] || FONT['-'];
    var rows = g.split(',');
    GCACHE[ch] = rows;
    return rows;
  }
  function textW(s) { return s.length * 4 - 1; }
  function drawText(ctx, s, x, y, color) {
    ctx.fillStyle = color;
    s = String(s).toUpperCase();
    for (var i = 0; i < s.length; i++) {
      var rows = glyph(s[i]);
      for (var r = 0; r < 5; r++) {
        var row = rows[r];
        for (var c = 0; c < 3; c++) if (row[c] === '#') ctx.fillRect(x + i * 4 + c, y + r, 1, 1);
      }
    }
  }

  /* ---------------- map ---------------- */
  var cv, ctx, VW = 100, VH = 90, SC = 4, camX = 0, camY = 0, tick = 0, rafId = 0;

  function sizeMap() {
    var frame = cv.parentElement;
    var avail = Math.max(180, frame.clientWidth);
    var targetH = window.innerHeight < 780 ? 258 : 336;
    if (worldView) targetH = window.innerHeight < 780 ? 300 : 360;
    if (worldView) {
      SC = Math.max(1, Math.min(Math.floor(avail / WORLD_W), Math.floor(targetH / WORLD_H)));
      VW = Math.min(WORLD_W, Math.floor(avail / SC));
      VH = Math.min(WORLD_H, Math.floor(targetH / SC));
    } else {
      SC = 3;
      VW = Math.max(40, Math.floor(avail / SC));
      VH = Math.max(40, Math.floor(targetH / SC));
    }
    cv.width = VW; cv.height = VH;
    cv.style.width = (VW * SC) + 'px';
    cv.style.height = (VH * SC) + 'px';
    cv.style.margin = '0 auto';
    ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    centerCam(true);
  }

  function centerCam() {
    var r = current && ROOM[current];
    if (worldView || WORLD_W <= VW) camX = Math.round((WORLD_W - VW) / 2);
    else if (r) camX = Math.max(0, Math.min(WORLD_W - VW, Math.round(r.x + RW / 2 - VW / 2)));
    if (worldView || WORLD_H <= VH) camY = Math.round((WORLD_H - VH) / 2);
    else if (r) camY = Math.max(0, Math.min(WORLD_H - VH, Math.round(r.y + RH / 2 - VH / 2)));
  }

  function drawMap() {
    if (!ctx) return;
    var f = fog();
    ctx.fillStyle = '#030c07';
    ctx.fillRect(0, 0, VW, VH);

    // faint grid
    ctx.fillStyle = '#061109';
    for (var gx = -(camX % 20); gx < VW; gx += 20) ctx.fillRect(gx, 0, 1, VH);
    for (var gy = -(camY % 20); gy < VH; gy += 20) ctx.fillRect(0, gy, VW, 1);

    var ox = -camX, oy = -camY;

    // zone frames + labels
    ZONES.forEach(function (z) {
      var any = false;
      for (var i = 0; i < z.slugs.length; i++) { if (f[z.slugs[i]] > 0) { any = true; break; } }
      if (!any) return;
      var zx = z.x + ox, zy = z.y + oy;
      if (zx > VW || zy > VH || zx + z.w < 0 || zy + z.h < 0) return;
      ctx.fillStyle = z.product === 'cloud' ? '#0a2027' : '#0a1a12';
      ctx.fillRect(zx, zy, z.w, z.h);
      ctx.fillStyle = z.product === 'cloud' ? '#164450' : '#16382a';
      // dashed frame
      for (var x = 0; x < z.w; x += 2) { ctx.fillRect(zx + x, zy, 1, 1); ctx.fillRect(zx + x, zy + z.h - 1, 1, 1); }
      for (var y = 0; y < z.h; y += 2) { ctx.fillRect(zx, zy + y, 1, 1); ctx.fillRect(zx + z.w - 1, zy + y, 1, 1); }
      var lbl = z.label.toUpperCase();
      while (textW(lbl) > z.w - 6 && lbl.length > 3) lbl = lbl.slice(0, -1);
      drawText(ctx, lbl, zx + 3, zy + 2, z.product === 'cloud' ? '#4e9db0' : '#3f7d61');
    });

    // corridors (citation edges) — drawn once a room is cleared
    ctx.fillStyle = '#164a33';
    for (var e = 0; e < G.edges.length; e++) {
      var a = G.edges[e][0], b = G.edges[e][1];
      var ra = ROOM[a], rb = ROOM[b];
      if (!ra || !rb) continue;
      var fa = f[a] || 0, fb = f[b] || 0;
      if (fa < 2 || fb < 2) continue;
      if (fa < 3 && fb < 3) continue;
      var live = (a === current || b === current);
      ctx.fillStyle = live ? '#4fd694' : '#103826';
      corridor(ra.x + (RW >> 1) + ox, ra.y + (RH >> 1) + oy, rb.x + (RW >> 1) + ox, rb.y + (RH >> 1) + oy, live);
    }

    // rooms
    B.order.forEach(function (s) {
      var r = ROOM[s], st = f[s] || 0;
      if (!r || st === 0) return;
      var x = r.x + ox, y = r.y + oy;
      if (x > VW || y > VH || x + RW < 0 || y + RH < 0) return;
      var hz = isHazard(s);
      var fill, line, core = null;
      if (st === 3) { fill = hz ? '#4a1a15' : '#17583a'; line = hz ? '#ff7a68' : '#5ee89b'; core = hz ? '#ff9d8e' : '#8df2b8'; }
      else if (st === 2) { fill = hz ? '#2a0f0c' : '#0c2418'; line = hz ? '#9c4036' : '#2f9c69'; core = hz ? '#5e211b' : '#1d6b47'; }
      else { fill = '#081611'; line = hz ? '#4d211c' : '#163527'; }
      ctx.fillStyle = fill; ctx.fillRect(x, y, RW, RH);
      ctx.fillStyle = line;
      ctx.fillRect(x, y, RW, 1); ctx.fillRect(x, y + RH - 1, RW, 1);
      ctx.fillRect(x, y, 1, RH); ctx.fillRect(x + RW - 1, y, 1, RH);
      var hub = (G.inbound[s] || 0) >= 20;
      if (core) {
        ctx.fillStyle = (hub && st === 3) ? '#f6b73f' : core;
        ctx.fillRect(x + 1, y + 1, RW - 2, RH - 2);
      } else if (hub) {
        ctx.fillStyle = '#4a3a14';
        ctx.fillRect(x + 1, y + 1, RW - 2, RH - 2);
      }
    });

    // player
    var pr = current && ROOM[current];
    if (pr) {
      var px = pr.x + ox, py = pr.y + oy;
      var blink = (!motion || reduced) ? 1 : (Math.floor(tick / 30) % 2);
      ctx.fillStyle = '#f6b73f';
      ctx.fillRect(px - 1, py - 1, 2, 1); ctx.fillRect(px - 1, py - 1, 1, 2);
      ctx.fillRect(px + RW - 1, py - 1, 2, 1); ctx.fillRect(px + RW, py - 1, 1, 2);
      ctx.fillRect(px - 1, py + RH, 2, 1); ctx.fillRect(px - 1, py + RH - 1, 1, 2);
      ctx.fillRect(px + RW - 1, py + RH, 2, 1); ctx.fillRect(px + RW, py + RH - 1, 1, 2);
      if (blink) {
        ctx.fillStyle = '#ffe6a8';
        ctx.fillRect(px + 2, py + 1, 3, 3);
        ctx.fillStyle = '#f6b73f';
        ctx.fillRect(px + 3, py + 2, 1, 1);
      }
    }

    // vignette edges
    ctx.fillStyle = 'rgba(3,12,7,0.55)';
    ctx.fillRect(0, 0, VW, 1); ctx.fillRect(0, VH - 1, VW, 1);
  }

  function corridor(x1, y1, x2, y2, solid) {
    var i;
    var step = solid ? 1 : 3;
    var mx = x2;
    if (x1 < x2) { for (i = x1; i <= mx; i += step) ctx.fillRect(i, y1, 1, 1); }
    else { for (i = x1; i >= mx; i -= step) ctx.fillRect(i, y1, 1, 1); }
    if (y1 < y2) { for (i = y1; i <= y2; i += step) ctx.fillRect(mx, i, 1, 1); }
    else { for (i = y1; i >= y2; i -= step) ctx.fillRect(mx, i, 1, 1); }
  }

  function loop() {
    tick++;
    if (tick % 6 === 0) drawMap();
    rafId = requestAnimationFrame(loop);
  }
  function startLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    drawMap();
    if (motion && !reduced) rafId = requestAnimationFrame(loop);
  }

  /* ---------------- movement ---------------- */
  var DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  function move(dir) {
    if (!current || !ROOM[current]) return;
    var d = DIRS[dir], f = fog();
    var cx = ROOM[current].x + RW / 2, cy = ROOM[current].y + RH / 2;
    var zone = ZONE_OF[current];
    var nei = {};
    (NEI[current] || []).forEach(function (n) { nei[n] = 1; });
    var best = null, bestScore = Infinity, bestAny = null, bestAnyScore = Infinity;
    B.order.forEach(function (s) {
      if (s === current) return;
      var r = ROOM[s];
      var dx = (r.x + RW / 2) - cx, dy = (r.y + RH / 2) - cy;
      var along = dx * d[0] + dy * d[1];
      if (along <= 0) return;
      var perp = Math.abs(dx * d[1] - dy * d[0]);
      if (perp > along * 1.15 + 4) return;
      var score = along + perp * 2.6;
      // corridors first, then the same zone, then anything in that direction
      if (nei[s]) score *= 0.45;
      else if (ZONE_OF[s] === zone) score *= 0.8;
      if (score < bestAnyScore) { bestAnyScore = score; bestAny = s; }
      if ((f[s] || 0) >= 1 && score < bestScore) { bestScore = score; best = s; }
    });
    var target = best || bestAny;
    if (target) go(target);
  }

  /* ---------------- routing ---------------- */
  function parseHash() {
    var h = location.hash || '';
    if (h.charAt(0) === '#') h = h.slice(1);
    if (!h || h === '/') return { slug: HOME, anchor: '' };
    var i = h.indexOf('#');
    var slug = i === -1 ? h : h.slice(0, i);
    var anchor = i === -1 ? '' : h.slice(i + 1);
    slug = slug.replace(/\/+$/, '');
    if (slug && slug.charAt(0) !== '/') slug = '/' + slug;
    return { slug: slug || HOME, anchor: anchor };
  }

  function go(slug, anchor) {
    var h = '#' + slug + (anchor ? '#' + anchor : '');
    if (location.hash === h) { route(); return; }
    location.hash = h;
  }

  var pending = 0;
  function route() {
    var p = parseHash();
    var page = B.pages[p.slug];
    if (!page) {
      var alt = B.pages[p.slug + '/'] || null;
      if (!alt) { renderMissing(p.slug); return; }
      page = alt;
    }
    current = page.slug;
    if (!visited.has(page.slug)) { visited.add(page.slug); fogCache = null; save(); }
    document.title = page.title + ' — Strapi Docs Arcade';
    renderPage(page, p.anchor);
    updateMeters();
    updateTree();
    renderRoomCard(page);
    renderQuest();
    centerCam();
    drawMap();
  }

  function renderMissing(slug) {
    current = null;
    document.title = 'Room not found — Strapi Docs Arcade';
    $('doc').innerHTML = '<div class="doc-head"><h1 class="doc-title">NO SUCH ROOM</h1>'
      + '<p class="doc-desc">Nothing is mapped at <code>' + esc(slug) + '</code>. '
      + 'The corpus holds ' + TOTAL.pages + ' rooms; use the index on the left or the search field above to find one.</p></div>'
      + '<p>Return to <a href="#' + HOME + '">' + esc(B.pages[HOME] ? B.pages[HOME].title : HOME) + '</a>.</p>';
    $('pager').innerHTML = '';
    $('roomcard').innerHTML = '';
    drawMap();
  }

  /* ---------------- page render ---------------- */
  function renderPage(page, anchor) {
    var slug = page.slug;
    var w = G.words[slug] || 0, cb = G.code[slug] || 0;
    var inb = G.inbound[slug] || 0, outb = G.outbound[slug] || 0;
    var zone = ZONES[ZONE_OF[slug]];

    var head = ['<header class="doc-head">'];
    head.push('<p class="eyebrow">');
    head.push('<span class="ey-prod' + (page.product === 'cloud' ? ' cloud' : '') + '">' + esc(page.product || 'cms') + '</span>');
    head.push('<span>' + esc(zone ? zone.label : (page.section || '')) + '</span>');
    if (page.tags && page.tags.length) {
      page.tags.slice(0, 3).forEach(function (t) { head.push('<span>' + esc(t) + '</span>'); });
    }
    head.push('</p>');
    head.push('<h1 class="doc-title">' + esc(page.title) + '</h1>');
    if (page.description) head.push('<p class="doc-desc">' + esc(page.description) + '</p>');
    head.push('<dl class="doc-stats">'
      + '<div><dt>WORDS</dt><dd>' + num(w) + '</dd></div>'
      + '<div><dt>CODE BLOCKS</dt><dd>' + num(cb) + '</dd></div>'
      + '<div><dt>CITED BY</dt><dd>' + num(inb) + '</dd></div>'
      + '<div><dt>EXITS</dt><dd>' + num(outb) + '</dd></div>'
      + '<div><dt>HEADINGS</dt><dd>' + num((page.headings || []).length) + '</dd></div>'
      + '</dl>');
    head.push('</header>');

    if (isHazard(slug)) {
      head.push('<div class="hazard"><b>HAZARD ZONE — V4 TO V5 BREAKING CHANGE</b>'
        + 'This room documents a change that breaks existing v4 code. '
        + '56 rooms in the corpus carry this marker.</div>');
    }

    var body = renderBlocks(page.blocks);
    $('doc').innerHTML = head.join('') + body;

    // pager from bundle.order
    var i = B.order.indexOf(slug);
    var prev = i > 0 ? B.order[i - 1] : null;
    var next = i >= 0 && i < B.order.length - 1 ? B.order[i + 1] : null;
    var pg = [];
    if (prev) pg.push('<a href="#' + attr(prev) + '" class="pv"><small>◀ PREVIOUS</small><b>' + esc(B.pages[prev].title) + '</b></a>');
    if (next) pg.push('<a href="#' + attr(next) + '" class="nx"><small>NEXT ▶</small><b>' + esc(B.pages[next].title) + '</b></a>');
    $('pager').innerHTML = pg.join('');

    var cx = $('codex');
    if (anchor) {
      var t = document.getElementById(anchor);
      if (t) {
        var d = t.closest('details'); if (d) d.open = true;
        t.scrollIntoView({ block: 'start', behavior: 'auto' });
        return;
      }
    }
    cx.scrollTop = 0;
  }

  /* ---------------- HUD ---------------- */
  function updateMeters() {
    var w = 0, c = 0, z = {};
    visited.forEach(function (s) {
      w += (G.words[s] || 0); c += (G.code[s] || 0);
      if (s in ZONE_OF) z[ZONE_OF[s]] = 1;
    });
    var zc = Object.keys(z).length;
    set('m-rooms', num(visited.size), '/' + TOTAL.pages, visited.size / TOTAL.pages);
    set('m-words', num(w), '/' + num(TOTAL.words), TOTAL.words ? w / TOTAL.words : 0);
    set('m-code', num(c), '/' + num(TOTAL.code), TOTAL.code ? c / TOTAL.code : 0);
    set('m-zones', String(zc), '/' + ZONES.length, zc / ZONES.length);
  }
  function set(id, a, b, frac) {
    var n = $(id);
    n.querySelector('b').textContent = a;
    n.querySelector('i').textContent = b;
    n.querySelector('.bar>span').style.width = Math.round(Math.max(0, Math.min(1, frac)) * 100) + '%';
  }

  /* ---------------- tree ---------------- */
  var treeBuilt = false;
  function buildTree() {
    var root = $('tree');
    var html = [];
    ZONES.forEach(function (z, zi) {
      var sec = B.nav[zi];
      html.push('<details class="tree-sec" data-product="' + esc(z.product) + '" data-zone="' + zi + '">');
      html.push('<summary><span class="caret">▸</span>' + esc(z.label)
        + '<span class="pcount">' + z.slugs.length + '</span></summary>');
      treeSeen = {};
      html.push('<ul class="tree-list">' + navItems(sec.items) + '</ul>');
      html.push('</details>');
    });
    root.innerHTML = html.join('');
    root.addEventListener('toggle', function (e) {
      var s = e.target.querySelector('summary .caret');
      if (s) s.textContent = e.target.open ? '▾' : '▸';
    }, true);
    treeBuilt = true;
  }
  var treeSeen = null;
  function navItems(items) {
    var out = [];
    (items || []).forEach(function (it) {
      if (it.slug && treeSeen) {
        if (treeSeen[it.slug]) { if (it.items) out.push('<li><ul class="tree-list">' + navItems(it.items) + '</ul></li>'); return; }
        treeSeen[it.slug] = 1;
      }
      if (it.slug) {
        out.push('<li><a class="tree-link" data-slug="' + attr(it.slug) + '" href="#' + attr(it.slug) + '">'
          + esc(it.label || (B.pages[it.slug] ? B.pages[it.slug].sidebarLabel : it.slug))
          + (isHazard(it.slug) ? ' <span class="hz">!</span>' : '') + '</a>');
      } else {
        out.push('<li><span class="tree-link" style="color:var(--faint)">' + esc(it.label || '') + '</span>');
      }
      if (it.items) out.push('<ul class="tree-list">' + navItems(it.items) + '</ul>');
      out.push('</li>');
    });
    return out.join('');
  }
  function updateTree() {
    if (!treeBuilt) buildTree();
    var links = $('tree').querySelectorAll('.tree-link[data-slug]');
    for (var i = 0; i < links.length; i++) {
      var s = links[i].getAttribute('data-slug');
      links[i].classList.toggle('visited', visited.has(s));
      var cur = s === current;
      links[i].classList.toggle('current', cur);
      if (cur) {
        var d = links[i].closest('details');
        if (d && !d.open) { d.open = true; }
        var host = $('rail-left');
        var top = links[i].offsetTop;
        if (top < host.scrollTop || top > host.scrollTop + host.clientHeight - 40) {
          host.scrollTop = Math.max(0, top - host.clientHeight / 2);
        }
      }
    }
  }

  /* ---------------- room card ---------------- */
  function renderRoomCard(page) {
    var slug = page.slug;
    var f = fog();
    var nb = (NEI[slug] || []).slice().sort(function (a, b) {
      return (G.inbound[b] || 0) - (G.inbound[a] || 0);
    });
    var out = [];
    out.push('<p class="rc-h">ROOM ' + (B.order.indexOf(slug) + 1) + ' / ' + TOTAL.pages + '</p>');
    out.push('<h2 class="rc-title">' + esc(page.title) + '</h2>');
    out.push('<p class="rc-path">' + esc(slug) + '</p>');
    out.push('<dl class="rc-grid">'
      + '<div><dt>WORDS</dt><dd>' + num(G.words[slug] || 0) + '</dd></div>'
      + '<div><dt>CODE</dt><dd>' + num(G.code[slug] || 0) + '</dd></div>'
      + '<div><dt>CITED BY</dt><dd>' + num(G.inbound[slug] || 0) + '</dd></div>'
      + '<div><dt>EXITS</dt><dd>' + num(G.outbound[slug] || 0) + '</dd></div>'
      + '</dl>');
    out.push('<p class="rc-sub">CORRIDORS · ' + nb.length + '</p>');
    if (!nb.length) {
      out.push('<p class="rc-none">This room has no citation corridors. Reach it from the index, search, or the ordered walk below.</p>');
    } else {
      out.push('<ul class="rc-list">');
      nb.slice(0, 24).forEach(function (s) {
        var pg = B.pages[s];
        if (!pg) return;
        out.push('<li><a href="#' + attr(s) + '">'
          + (visited.has(s) ? '<span style="color:var(--green)">·</span>' : '<span style="color:var(--faint)">·</span>')
          + '<span>' + esc(pg.title) + '</span>'
          + '<span class="n">' + (G.inbound[s] || 0) + '</span></a></li>');
      });
      if (nb.length > 24) out.push('<li><span class="rc-none">+ ' + (nb.length - 24) + ' more</span></li>');
      out.push('</ul>');
    }
    var hs = (page.headings || []).filter(function (h) { return h.level === 2; });
    if (hs.length) {
      out.push('<p class="rc-sub">SECTIONS · ' + hs.length + '</p><ul class="rc-list">');
      hs.slice(0, 20).forEach(function (h) {
        out.push('<li><a href="#' + attr(slug) + '#' + attr(h.id) + '"><span>' + esc(h.text) + '</span></a></li>');
      });
      out.push('</ul>');
    }
    $('roomcard').innerHTML = out.join('');
  }

  /* ---------------- quest ---------------- */
  var QUEST = null;
  function buildQuest() {
    var p = B.pages[QUEST_SLUG];
    if (!p) return;
    var parts = [], cur = null;
    p.blocks.forEach(function (b) {
      if (b.t === 'h2') { cur = { title: b.text, id: b.id, steps: [] }; parts.push(cur); }
      else if (b.t === 'details' && cur) cur.steps.push({ id: b.id, label: plain(b.summary) });
    });
    QUEST = { slug: QUEST_SLUG, title: p.title, parts: parts.filter(function (x) { return x.steps.length; }) };
  }
  function questTotal() {
    var n = 0; QUEST.parts.forEach(function (p) { n += p.steps.length; }); return n;
  }
  function renderQuest() {
    if (!QUEST) return;
    var total = questTotal();
    var done = 0;
    QUEST.parts.forEach(function (p) { p.steps.forEach(function (s) { if (steps.has(s.id)) done++; }); });
    var onQuest = current === QUEST.slug;
    var out = [];
    out.push('<div class="quest-head"><span class="quest-title">QUEST · QUICK START</span>'
      + '<span class="quest-count">' + done + '/' + total + '</span></div>');
    out.push('<div class="quest-bar"><span style="width:' + (total ? Math.round(done / total * 100) : 0) + '%"></span></div>');
    if (onQuest) {
      out.push('<ul class="quest-parts">');
      QUEST.parts.forEach(function (p) {
        out.push('<li class="quest-part"><b>' + esc(p.title) + '</b>');
        p.steps.forEach(function (s) {
          out.push('<button type="button" class="quest-step' + (steps.has(s.id) ? ' done' : '') + '" data-step="' + attr(s.id) + '">'
            + '<span class="tick"></span><span>' + esc(s.label) + '</span></button>');
        });
        out.push('</li>');
      });
      out.push('</ul>');
    } else {
      out.push('<button class="quest-open" type="button" data-goquest>OPEN THE QUEST CHAIN</button>');
    }
    $('quest').innerHTML = out.join('');
  }

  /* ---------------- search ---------------- */
  function pageText(p) {
    var buf = [];
    (function walk(bs) {
      (bs || []).forEach(function (b) {
        if (!b || !b.t) return;
        if (b.html) buf.push(stripTags(b.html));
        if (b.text) buf.push(b.text);
        if (b.summary) buf.push(b.summary);
        if (b.title && b.t !== 'code') buf.push(b.title);
        if (b.description) buf.push(stripTags(b.description));
        if (b.t === 'table') {
          (b.head || []).forEach(function (h) { buf.push(stripTags(h)); });
          (b.rows || []).forEach(function (r) { r.forEach(function (c) { buf.push(stripTags(c)); }); });
        }
        if (b.t === 'cards') (b.items || []).forEach(function (c) { buf.push(stripTags(c.title) + ' ' + stripTags(c.desc)); });
        if (b.t === 'endpoint') {
          buf.push(b.path || ''); buf.push(b.method || '');
          (b.params || []).forEach(function (x) { buf.push(x.name + ' ' + stripTags(x.desc)); });
        }
        if (b.items) b.items.forEach(function (it) {
          if (typeof it === 'string') buf.push(stripTags(it));
          else if (it) { buf.push(stripTags(it.html)); if (it.blocks) walk(it.blocks); }
        });
        if (b.blocks) walk(b.blocks);
        if (b.tabs) b.tabs.forEach(function (t) { walk(t.blocks); });
        if (b.cols) b.cols.forEach(function (c) { walk(c); });
      });
    })(p.blocks);
    return decode(buf.join(' ')).replace(/\s+/g, ' ');
  }

  function buildIndex() {
    if (searchIndex) return searchIndex;
    searchIndex = B.order.map(function (s) {
      var p = B.pages[s];
      var body = pageText(p);
      return {
        slug: s,
        title: p.title,
        tl: p.title.toLowerCase(),
        sec: (ZONES[ZONE_OF[s]] || {}).label || p.section || '',
        heads: (p.headings || []).map(function (h) { return h.text; }).join(' · '),
        hl: (p.headings || []).map(function (h) { return h.text; }).join(' · ').toLowerCase(),
        desc: p.description || '',
        body: body,
        bl: body.toLowerCase()
      };
    });
    return searchIndex;
  }

  function runSearch(q) {
    var box = $('searchresults');
    q = q.trim();
    if (q.length < 2) { box.hidden = true; box.innerHTML = ''; return; }
    var idx = buildIndex();
    var ql = q.toLowerCase();
    var hits = [];
    for (var i = 0; i < idx.length; i++) {
      var e = idx[i], score = 0, where = '';
      var ti = e.tl.indexOf(ql);
      if (ti === 0) score += 240; else if (ti > 0) score += 150;
      var hi = e.hl.indexOf(ql);
      if (hi >= 0) { score += 60; where = 'heading'; }
      var bi = e.bl.indexOf(ql);
      if (bi >= 0) { score += 20; if (!where) where = 'body'; }
      if (!score) continue;
      score += Math.min(30, (G.inbound[e.slug] || 0));
      hits.push({ e: e, score: score, bi: bi });
      if (hits.length > 900) break;
    }
    hits.sort(function (a, b) { return b.score - a.score; });
    hits = hits.slice(0, 40);
    if (!hits.length) {
      box.innerHTML = '<p class="sr-empty">No room matches “' + esc(q) + '”.</p>';
      box.hidden = false; return;
    }
    var out = hits.map(function (h, i) {
      var snip = '';
      if (h.bi >= 0) {
        var st = Math.max(0, h.bi - 60);
        var raw = h.e.body.slice(st, h.bi + q.length + 90);
        snip = (st > 0 ? '…' : '') + esc(raw) + '…';
        var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
        snip = snip.replace(re, '<mark>$1</mark>');
      } else if (h.e.desc) snip = esc(h.e.desc.slice(0, 150));
      return '<a class="sr-item' + (i === 0 ? ' on' : '') + '" href="#' + attr(h.e.slug) + '" data-sr="' + i + '">'
        + '<span class="sr-t">' + esc(h.e.title) + '</span>'
        + '<span class="sr-p">' + esc(h.e.sec) + ' · ' + esc(h.e.slug) + ' · ' + num(G.words[h.e.slug] || 0) + ' WORDS</span>'
        + (snip ? '<span class="sr-x">' + snip + '</span>' : '') + '</a>';
    }).join('');
    box.innerHTML = out;
    box.hidden = false;
  }

  /* ---------------- events ---------------- */
  function wire() {
    window.addEventListener('hashchange', route);

    // delegated clicks in the document body
    document.addEventListener('click', function (ev) {
      var t = ev.target;

      var copy = t.closest && t.closest('[data-copy]');
      if (copy) {
        var pre = copy.closest('.codeblock').querySelector('code');
        try { navigator.clipboard.writeText(pre.textContent); copy.textContent = 'COPIED'; setTimeout(function () { copy.textContent = 'COPY'; }, 1200); }
        catch (e) { copy.textContent = 'SELECT'; }
        return;
      }
      var tab = t.closest && t.closest('.tabs-strip button');
      if (tab) {
        var wrap = tab.closest('.tabs');
        var n = tab.getAttribute('data-tab');
        wrap.querySelectorAll('.tabs-strip button').forEach(function (b) { b.setAttribute('aria-selected', b === tab); });
        wrap.querySelectorAll('.tabs-panel').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== n; });
        return;
      }
      var qs = t.closest && t.closest('[data-step]');
      if (qs) {
        var id = qs.getAttribute('data-step');
        if (steps.has(id)) steps.delete(id); else steps.add(id);
        save(); renderQuest();
        var d = document.getElementById(id);
        if (d && !steps.has(id)) { /* keep */ } else if (d) { d.open = true; d.scrollIntoView({ block: 'start' }); }
        return;
      }
      if (t.closest && t.closest('[data-goquest]')) { go(QUEST.slug); return; }

      var a = t.closest && t.closest('a[href]');
      if (a) {
        var href = a.getAttribute('href');
        if (href && href.charAt(0) === '#' && href.charAt(1) !== '/') {
          // in-page anchor
          ev.preventDefault();
          var el2 = document.getElementById(href.slice(1));
          if (el2) {
            var dd = el2.closest('details'); if (dd) dd.open = true;
            el2.scrollIntoView({ block: 'start' });
          }
          return;
        }
        if (href && href.charAt(0) === '#') {
          closeOverlays();
        }
      }
    });

    // A screenshot plate loads its bitmap only when asked; if the path does not
    // resolve, the plate comes back rather than leaving a broken frame.
    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest && ev.target.closest('[data-loadshot]');
      if (!btn) return;
      var plate = btn.closest('.missing');
      var src = plate.getAttribute('data-shot');
      var alt = plate.getAttribute('data-shotalt') || '';
      var img = new Image();
      btn.textContent = 'LOADING';
      img.onload = function () {
        img.className = 'shot'; img.alt = alt;
        plate.replaceWith(img);
      };
      img.onerror = function () { btn.textContent = 'NOT AT THIS ORIGIN'; btn.disabled = true; };
      img.src = src;
    });

    // map interaction
    cv.addEventListener('click', function (ev) {
      var r = cv.getBoundingClientRect();
      var vx = Math.floor((ev.clientX - r.left) / (r.width / VW)) + camX;
      var vy = Math.floor((ev.clientY - r.top) / (r.height / VH)) + camY;
      var hit = null, bd = 1e9;
      B.order.forEach(function (s) {
        var q = ROOM[s];
        var dx = vx - (q.x + RW / 2), dy = vy - (q.y + RH / 2);
        var d2 = dx * dx + dy * dy;
        if (d2 < bd) { bd = d2; hit = s; }
      });
      if (hit && bd < 90) go(hit);
    });
    cv.addEventListener('mousedown', function () { cv.focus(); });

    // keyboard
    document.addEventListener('keydown', function (ev) {
      var tag = (ev.target.tagName || '').toLowerCase();
      var inField = tag === 'input' || tag === 'textarea' || ev.target.isContentEditable;

      if (inField && ev.target.id === 'search') {
        if (ev.key === 'Escape') { ev.target.blur(); $('searchresults').hidden = true; }
        if (ev.key === 'Enter') {
          var first = $('searchresults').querySelector('.sr-item.on') || $('searchresults').querySelector('.sr-item');
          if (first) { ev.preventDefault(); location.hash = first.getAttribute('href'); ev.target.blur(); $('searchresults').hidden = true; }
        }
        if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
          var items = Array.prototype.slice.call($('searchresults').querySelectorAll('.sr-item'));
          if (items.length) {
            ev.preventDefault();
            var ci = items.findIndex(function (n) { return n.classList.contains('on'); });
            items.forEach(function (n) { n.classList.remove('on'); });
            var ni = Math.max(0, Math.min(items.length - 1, ci + (ev.key === 'ArrowDown' ? 1 : -1)));
            items[ni].classList.add('on');
            items[ni].scrollIntoView({ block: 'nearest' });
          }
        }
        return;
      }
      if (inField) return;

      if (ev.key === '/') { ev.preventDefault(); $('search').focus(); $('search').select(); return; }
      if (ev.key === 'Escape') { closeOverlays(); return; }

      var k = ev.key.toLowerCase();
      var mapFocused = document.activeElement === cv;
      var arrow = { arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right' };
      var wasd = { w: 'up', s: 'down', a: 'left', d: 'right' };

      if (wasd[k] && !ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); move(wasd[k]); return; }
      if (arrow[k] && mapFocused) { ev.preventDefault(); move(arrow[k]); return; }
      if (k === 'm') { worldView = !worldView; sizeMap(); drawMap(); return; }
      if (k === '[' || k === ',') { step(-1); return; }
      if (k === ']' || k === '.') { step(1); return; }
    });

    function step(dir) {
      if (!current) return;
      var i = B.order.indexOf(current);
      var j = i + dir;
      if (j >= 0 && j < B.order.length) go(B.order[j]);
    }

    var sTimer = 0;
    $('search').addEventListener('input', function (e) {
      clearTimeout(sTimer);
      var v = e.target.value;
      sTimer = setTimeout(function () { runSearch(v); }, 110);
    });
    $('search').addEventListener('focus', function () { buildIndex(); });
    document.addEventListener('click', function (ev) {
      if (!ev.target.closest('.searchwrap') && !ev.target.closest('.searchresults')) $('searchresults').hidden = true;
    });

    $('btn-motion').addEventListener('click', function () {
      motion = !motion; save(); applyMotion();
    });
    $('btn-nav').addEventListener('click', function () {
      var r = $('rail-left'); r.classList.toggle('open');
      this.setAttribute('aria-expanded', r.classList.contains('open'));
    });
    $('btn-map').addEventListener('click', function () {
      var r = $('rail-right'); r.classList.toggle('open');
      this.setAttribute('aria-expanded', r.classList.contains('open'));
      sizeMap(); drawMap();
    });

    var rt = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(function () { sizeMap(); drawMap(); }, 120);
    });

    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.addEventListener) mq.addEventListener('change', function () { reduced = mq.matches; applyMotion(); });
  }

  function closeOverlays() {
    $('rail-left').classList.remove('open');
    $('rail-right').classList.remove('open');
    $('btn-nav').setAttribute('aria-expanded', 'false');
    $('btn-map').setAttribute('aria-expanded', 'false');
    $('searchresults').hidden = true;
  }

  function applyMotion() {
    var on = motion && !reduced;
    document.body.classList.toggle('motion', on);
    $('btn-motion').setAttribute('aria-pressed', String(motion));
    $('btn-motion').textContent = motion ? 'MOTION' : 'STILL';
    startLoop();
  }

  /* ---------------- boot ---------------- */
  function fail(msg) {
    var b = $('boot-line');
    if (b) b.textContent = msg;
  }

  Promise.all([
    fetch('content.json').then(function (r) { return r.json(); }),
    fetch('graph.json').then(function (r) { return r.json(); })
  ]).then(function (res) {
    B = res[0]; G = res[1];
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    load();
    buildWorld();
    buildQuest();

    $('brand-ver').textContent = B.version;
    $('colo-ver').textContent = B.version;
    $('m-zones').querySelector('i').textContent = '/' + ZONES.length;

    $('boot').remove();
    $('shell').hidden = false;

    cv = $('map');
    sizeMap();
    buildTree();
    wire();
    applyMotion();
    route();

    // build the search index once the first page is on screen
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 400); };
    idle(function () { buildIndex(); });
  }).catch(function (e) {
    fail('FAILED TO LOAD CORPUS: ' + e.message);
    if (window.console) console.warn('arcade: load failure', e);
  });

})();
