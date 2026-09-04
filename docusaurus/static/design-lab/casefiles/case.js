/* ================== THE CASE FILES ==================
   The Strapi documentation as a film-noir detective agency.
   Every number on screen is measured from content.json, graph.json,
   communities.json and provenance.json. Nothing is invented.
   The trench coat is decorative. The facts are not. */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var D = { content: null, graph: null, prov: null, comm: null };
  var ORDER = [];
  var PRECINCTS = [];      // 18 nav groups, in nav order
  var META = {};           // slug -> measured facts
  var IN_LIST = {};        // slug -> slugs that cite it (from the 1231 real edges)
  var OUT_LIST = {};       // slug -> slugs it cites
  var COMM_OF = {};        // slug -> community record
  var SEARCH_INDEX = [];
  var COLD = [];           // uncited slugs, reading order
  var NIGHT_COUNT = 0;
  var HANDS = 0;
  var boardBuilt = false;

  /* ---------------- utilities ---------------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function hashCode(s) {
    var h = 5381, i;
    for (i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h;
  }
  function num(n) { return Number(n || 0).toLocaleString("en-US"); }
  function stripTitle(t) {
    return String(t || "").replace(/\s*[-|·]\s*Strapi.*$/i, "").trim() || String(t || "");
  }
  function resolveImg(p) { return p && p.charAt(0) === "/" ? p.slice(1) : p; }
  function caseNo(slug) { return "No. " + (10000 + hashCode(slug) % 90000); }
  function exLetter(i) {
    var A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return i < 26 ? A[i] : A[Math.floor(i / 26) - 1] + A[i % 26];
  }
  function daysSince(iso) {
    return Math.floor((Date.now() - new Date(iso + "T00:00:00Z").getTime()) / 864e5);
  }

  /* ---------------- derivations (all measured) ---------------- */
  function deriveAll() {
    var c = D.content, g = D.graph, prov = D.prov;
    ORDER = c.order;

    c.nav.forEach(function (grp, i) {
      var slugs = [];
      (function collect(items) {
        items.forEach(function (it) {
          if (it.slug) slugs.push(it.slug);
          if (it.items) collect(it.items);
        });
      })(grp.items || []);
      PRECINCTS.push({
        num: i + 1,
        label: grp.label + (grp.product === "cloud" ? " · Cloud" : ""),
        product: grp.product, slugs: slugs
      });
    });

    g.edges.forEach(function (e) {
      (OUT_LIST[e[0]] = OUT_LIST[e[0]] || []).push(e[1]);
      (IN_LIST[e[1]] = IN_LIST[e[1]] || []).push(e[0]);
    });

    Object.keys(D.comm).forEach(function (k) {
      var cm = D.comm[k];
      (cm.members || []).forEach(function (s) { COMM_OF[s] = cm; });
    });

    var authors = {};
    Object.keys(prov).forEach(function (s) {
      (prov[s].authors || []).forEach(function (a) { authors[a] = 1; });
      if (prov[s].night > 0) NIGHT_COUNT++;
    });
    HANDS = Object.keys(authors).length;

    ORDER.forEach(function (slug, idx) {
      var page = c.pages[slug];
      var pv = prov[slug] || {};
      var precinct = null;
      for (var i = 0; i < PRECINCTS.length; i++) {
        if (PRECINCTS[i].slugs.indexOf(slug) !== -1) { precinct = PRECINCTS[i]; break; }
      }
      var exhibits = 0, photos = 0;
      (function walk(bl) {
        (bl || []).forEach(function (b) {
          if (!b || typeof b !== "object") return;
          if (b.t === "code") exhibits++;
          if (b.t === "img") photos++;
          if (b.t === "endpoint") {
            exhibits += (b.codeTabs || []).length + (b.responses || []).length;
          }
          if (b.blocks) walk(b.blocks);
          if (b.tabs) b.tabs.forEach(function (t) { walk(t.blocks); });
          if (b.cols) b.cols.forEach(walk);
          if (b.t === "ul" || b.t === "ol") {
            (b.items || []).forEach(function (it) {
              if (it && typeof it === "object" && it.blocks) walk(it.blocks);
            });
          }
        });
      })(page.blocks);

      var inb = IN_LIST[slug] ? IN_LIST[slug].length : 0;
      var stale = pv.last ? daysSince(pv.last) > 365 : false;
      META[slug] = {
        idx: idx,
        label: page.sidebarLabel || stripTitle(page.title),
        no: caseNo(slug),
        precinct: precinct,
        words: g.words[slug] || 0,
        exhibits: exhibits,
        photos: photos,
        inb: inb,
        out: OUT_LIST[slug] ? OUT_LIST[slug].length : 0,
        cold: inb === 0,
        night: (pv.night || 0) > 0,
        stale: stale,
        prov: pv
      };
      if (inb === 0) COLD.push(slug);
    });

    ORDER.forEach(function (slug) {
      var p = c.pages[slug];
      SEARCH_INDEX.push({
        slug: slug,
        label: (p.sidebarLabel || "").toLowerCase(),
        title: (p.title || "").toLowerCase(),
        desc: (p.description || "").toLowerCase(),
        tags: (p.tags || []).join(" ").toLowerCase(),
        heads: (p.headings || []).map(function (h) { return h.text; }).join(" ").toLowerCase(),
        section: (p.section || "").toLowerCase()
      });
    });
  }

  /* ================== THE BOARD ================== */
  var world = null, stage = null, canvas = null, ctx = null;
  var PIN = {};            // slug -> {x, y, tilt} world coords (top-left of card)
  var WORLD_W = 0, WORLD_H = 0;
  var view = { x: 0, y: 0, k: 1 };
  var hoverSlug = null;
  var NEIGH = {};          // slug -> {slug:1} for quick dim tests

  function layoutBoard() {
    var CELL_W = 150, CELL_H = 118, PAD = 28, LABEL_H = 34, GAP = 96, MAX_ROW = 4400;
    var x = 48, y = 70, rowH = 0;
    PRECINCTS.forEach(function (pf) {
      var n = pf.slugs.length;
      var cols = Math.max(3, Math.min(14, Math.ceil(Math.sqrt(n * 2.1))));
      var rows = Math.ceil(n / cols);
      var w = cols * CELL_W + PAD * 2;
      var h = rows * CELL_H + PAD * 2 + LABEL_H;
      if (x + w > MAX_ROW && x > 48) { x = 48; y += rowH + GAP; rowH = 0; }
      pf.box = { x: x, y: y, w: w, h: h, cols: cols };
      pf.slugs.forEach(function (slug, i) {
        var col = i % cols, row = Math.floor(i / cols);
        var hh = hashCode(slug);
        PIN[slug] = {
          x: pf.box.x + PAD + col * CELL_W + ((hh % 17) - 8),
          y: pf.box.y + LABEL_H + PAD + row * CELL_H + ((hh >> 5) % 13) - 6,
          tilt: (((hh >> 9) % 64) / 10 - 3.2)
        };
      });
      x += w + GAP;
      rowH = Math.max(rowH, h);
      WORLD_W = Math.max(WORLD_W, pf.box.x + w + 48);
    });
    WORLD_H = y + rowH + 90;

    ORDER.forEach(function (slug) {
      var m = {};
      (IN_LIST[slug] || []).forEach(function (s) { m[s] = 1; });
      (OUT_LIST[slug] || []).forEach(function (s) { m[s] = 1; });
      NEIGH[slug] = m;
    });
  }

  function buildBoard() {
    if (boardBuilt) return;
    boardBuilt = true;
    stage = document.getElementById("board-stage");
    world = document.getElementById("board-world");
    canvas = document.getElementById("string-canvas");
    ctx = canvas.getContext("2d");
    layoutBoard();

    var html = "";
    PRECINCTS.forEach(function (pf) {
      html += '<div class="precinct" style="left:' + pf.box.x + "px;top:" + pf.box.y +
        "px;width:" + pf.box.w + "px;height:" + pf.box.h + 'px">' +
        '<span class="precinct-label">PRECINCT ' + pf.num + " · " + esc(pf.label.toUpperCase()) +
        "<small>" + pf.slugs.length + " files</small></span></div>";
    });
    ORDER.forEach(function (slug) {
      var m = META[slug], p = PIN[slug];
      var tag = m.cold ? '<span class="pin-tag cold">COLD</span>'
        : (m.night ? '<span class="pin-tag night">NIGHT</span>'
          : (m.inb >= 20 ? '<span class="pin-tag hot">HOT</span>' : ""));
      html += '<a class="pin" data-slug="' + esc(slug) + '" href="#' + esc(slug) +
        '" style="left:' + p.x + "px;top:" + p.y + "px;--tilt:" + p.tilt.toFixed(1) + 'deg"' +
        ' aria-label="' + esc(m.label) + ", case " + esc(m.no) + '">' + tag +
        '<span class="pin-no">CASE ' + esc(m.no) + "</span>" +
        '<span class="pin-title">' + esc(m.label) + "</span></a>";
    });
    world.innerHTML = html;
    world.style.width = WORLD_W + "px";
    world.style.height = WORLD_H + "px";

    initBoardInput();
    fitBoard();
    setCaption(defaultCaption());
  }

  function defaultCaption() {
    return '<span class="cap-lede">THE WALL.</span> ' + ORDER.length +
      " files pinned, " + num(D.graph.edges.length) + " lengths of red string, " +
      PRECINCTS.length + " precincts. " + COLD.length +
      " files sit in the cold drawer. Drag to pan, scroll to zoom, click a pin to open the file.";
  }
  function setCaption(html) {
    document.getElementById("caption-bar").innerHTML = html;
  }

  function fitBoard() {
    var sw = stage.clientWidth, sh = stage.clientHeight;
    if (!sw || !sh) return;
    var k = Math.min(sw / WORLD_W, sh / WORLD_H) * 0.96;
    view.k = Math.max(0.08, k);
    view.x = (sw - WORLD_W * view.k) / 2;
    view.y = (sh - WORLD_H * view.k) / 2;
    applyView();
  }

  function applyView() {
    world.style.transform = "translate(" + view.x + "px," + view.y + "px) scale(" + view.k + ")";
    drawStrings();
  }

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = stage.clientWidth, h = stage.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function anchorOf(slug) {
    var p = PIN[slug];
    return [p.x + 64, p.y + 9]; // the pushpin, top centre of the card
  }

  function drawStrings() {
    if (!ctx) return;
    var w = stage.clientWidth, h = stage.clientHeight;
    ctx.clearRect(0, 0, w, h);
    var k = view.k, vx = view.x, vy = view.y;
    var margin = 220;
    var lit = hoverSlug;
    var base = lit ? "rgba(150,38,32,0.07)" : "rgba(176,44,38,0.34)";
    ctx.lineWidth = Math.max(0.75, 0.95 * k);
    ctx.strokeStyle = base;
    var litEdges = [];
    for (var i = 0; i < D.graph.edges.length; i++) {
      var e = D.graph.edges[i];
      var a = PIN[e[0]], b = PIN[e[1]];
      if (!a || !b) continue;
      if (lit && (e[0] === lit || e[1] === lit)) { litEdges.push(e); continue; }
      strokeString(e, vx, vy, k, w, h, margin);
    }
    if (litEdges.length) {
      ctx.strokeStyle = "rgba(226,72,60,0.95)";
      ctx.lineWidth = Math.max(1.3, 1.7 * k);
      for (var j = 0; j < litEdges.length; j++) {
        strokeString(litEdges[j], vx, vy, k, w, h, margin + 3000);
      }
    }
  }

  function strokeString(e, vx, vy, k, w, h, margin) {
    var a = anchorOf(e[0]), b = anchorOf(e[1]);
    var x1 = a[0] * k + vx, y1 = a[1] * k + vy;
    var x2 = b[0] * k + vx, y2 = b[1] * k + vy;
    if ((x1 < -margin && x2 < -margin) || (x1 > w + margin && x2 > w + margin) ||
        (y1 < -margin && y2 < -margin) || (y1 > h + margin && y2 > h + margin)) return;
    var dx = x2 - x1, dy = y2 - y1;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var sag = Math.min(60 * k, dist * 0.09) + 4 * k;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + sag, x2, y2);
    ctx.stroke();
  }

  function initBoardInput() {
    var dragging = false, captured = false, moved = 0, lx = 0, ly = 0;
    stage.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      dragging = true; captured = false; moved = 0; lx = e.clientX; ly = e.clientY;
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lx, dy = e.clientY - ly;
      moved += Math.abs(dx) + Math.abs(dy);
      lx = e.clientX; ly = e.clientY;
      /* capture only once it is clearly a drag, so plain clicks
         still reach the pins (capture retargets the click event) */
      if (!captured && moved > 6) {
        captured = true;
        stage.classList.add("grabbing");
        try { stage.setPointerCapture(e.pointerId); } catch (err) { /* stale pointer id */ }
      }
      view.x += dx; view.y += dy;
      applyView();
    });
    function up(e) {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("grabbing");
    }
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    // a real drag must not open a file on release
    stage.addEventListener("click", function (e) {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; }
    }, true);

    stage.addEventListener("wheel", function (e) {
      e.preventDefault();
      var f = Math.exp(-e.deltaY * 0.0016);
      var nk = Math.min(1.6, Math.max(0.08, view.k * f));
      var r = stage.getBoundingClientRect();
      var mx = e.clientX - r.left, my = e.clientY - r.top;
      view.x = mx - (mx - view.x) * (nk / view.k);
      view.y = my - (my - view.y) * (nk / view.k);
      view.k = nk;
      applyView();
    }, { passive: false });

    function hoverOn(slug) {
      hoverSlug = slug;
      var neigh = NEIGH[slug] || {};
      world.querySelectorAll(".pin").forEach(function (el) {
        var s = el.dataset.slug;
        el.classList.toggle("lit", s === slug);
        el.classList.toggle("dim", s !== slug && !neigh[s]);
      });
      var m = META[slug];
      setCaption('<span class="cap-lede">CASE ' + esc(m.no) + " · " + esc(m.label.toUpperCase()) +
        ".</span> Opened " + esc(m.prov.first || "?") + ", last seen " + esc(m.prov.last || "?") +
        ". " + m.inb + " red string" + (m.inb === 1 ? "" : "s") + " lead in, " + m.out +
        " lead out. " + num(m.words) + " words on file, " + m.exhibits + " exhibit" +
        (m.exhibits === 1 ? "" : "s") + "." +
        (m.cold ? " Nobody cites this one. Cold case." : ""));
      drawStrings();
    }
    function hoverOff() {
      hoverSlug = null;
      world.querySelectorAll(".pin.lit, .pin.dim").forEach(function (el) {
        el.classList.remove("lit", "dim");
      });
      setCaption(defaultCaption());
      drawStrings();
    }
    world.addEventListener("mouseover", function (e) {
      var pin = e.target.closest && e.target.closest(".pin");
      if (pin) hoverOn(pin.dataset.slug);
    });
    world.addEventListener("mouseout", function (e) {
      var pin = e.target.closest && e.target.closest(".pin");
      if (pin && !(e.relatedTarget && pin.contains(e.relatedTarget))) hoverOff();
    });
    world.addEventListener("focusin", function (e) {
      var pin = e.target.closest && e.target.closest(".pin");
      if (pin) hoverOn(pin.dataset.slug);
    });
    world.addEventListener("focusout", hoverOff);

    window.addEventListener("resize", function () {
      if (!document.getElementById("board-view").hidden) {
        sizeCanvas(); drawStrings();
      }
    });
  }

  /* ================== BLOCK RENDERER (typewriter flavour) ================== */
  var ADM = {
    tip: "TIP", note: "NOTE", info: "INFORMATION", caution: "CAUTION",
    warning: "WARNING", danger: "DANGER", strapi: "FROM HEADQUARTERS",
    prerequisites: "BEFORE YOU START", callout: "MEMO"
  };
  var exCount = 0, phCount = 0, tabsUid = 0;
  var tabChoice = {};

  function renderCode(b) {
    var lines = String(b.code || "").replace(/^\n+/, "").split("\n");
    var out = [], hl = false;
    lines.forEach(function (ln) {
      if (/^\s*(\/\/|#|<!--|\/\*|\{\/\*)?\s*highlight-start/.test(ln)) { hl = true; return; }
      if (/^\s*(\/\/|#|<!--|\/\*|\{\/\*)?\s*highlight-end/.test(ln)) { hl = false; return; }
      if (/^\s*(\/\/|#|<!--|\/\*|\{\/\*)?\s*highlight-next-line/.test(ln)) { out.push({ mark: "next" }); return; }
      out.push({ t: ln, hl: hl });
    });
    var htmlLines = [];
    for (var i = 0; i < out.length; i++) {
      if (out[i].mark === "next") { if (out[i + 1]) out[i + 1].hl = true; continue; }
      htmlLines.push(out[i].hl ? '<span class="hl">' + esc(out[i].t) + "</span>" : esc(out[i].t));
    }
    var label = "EXHIBIT " + exLetter(exCount++);
    return '<figure class="exhibit"><figcaption class="exhibit-head">' +
      '<span class="ex-label">' + label + "</span>" +
      (b.title ? '<span class="ex-file">' + esc(b.title) + "</span>" : "") +
      (b.lang ? '<span class="ex-lang">' + esc(b.lang) + "</span>" : "") +
      "</figcaption><pre><code>" + htmlLines.join("\n") + "</code></pre></figure>";
  }

  function renderItems(items) {
    return (items || []).map(function (it) {
      if (typeof it === "string") return "<li>" + it + "</li>";
      return "<li>" + (it.html || "") +
        (it.blocks && it.blocks.length ? '<div class="li-blocks">' + renderBlocks(it.blocks) + "</div>" : "") +
        "</li>";
    }).join("");
  }

  function renderTabs(b) {
    var gid = b.groupId || "";
    var uid = "dossier-" + (++tabsUid);
    var chosen = 0;
    if (gid && tabChoice[gid] != null) {
      b.tabs.forEach(function (tb, i) { if (tb.value === tabChoice[gid]) chosen = i; });
    }
    var bar = "", panels = "";
    b.tabs.forEach(function (tb, i) {
      var sel = i === chosen;
      bar += '<button class="dossier-tab" type="button" role="tab" aria-selected="' + sel +
        '" data-uid="' + uid + '" data-idx="' + i + '" data-value="' + esc(tb.value || "") + '">' +
        esc(tb.label || tb.value || ("Tab " + (i + 1))) + "</button>";
      panels += '<div class="dossier-panel" role="tabpanel" data-uid="' + uid + '" data-idx="' + i + '"' +
        (sel ? "" : " hidden") + ">" + renderBlocks(tb.blocks || []) + "</div>";
    });
    return '<div class="dossier" data-group="' + esc(gid) + '" data-uid="' + uid +
      '"><div class="dossier-tabs" role="tablist">' + bar + "</div>" + panels + "</div>";
  }

  function renderEndpoint(b) {
    var mCls = b.method ? b.method.toLowerCase() : (b.kind === "js" ? "js" : "call");
    var mTxt = b.method || (b.kind === "js" ? "JS" : "CALL");
    var h = '<article class="rap"' + (b.id ? ' id="' + esc(b.id) + '"' : "") + ">";
    h += '<div class="rap-head"><span class="rap-method ' + esc(mCls) + '">' + esc(mTxt) + "</span>";
    if (b.path) h += '<span class="rap-path">' + esc(b.path) + "</span>";
    if (b.title) h += '<span class="rap-title">' + esc(b.title) + "</span>";
    h += "</div>";
    h += '<div class="rap-body">';
    if (b.description) h += "<p>" + b.description + "</p>";
    if (b.params && b.params.length) {
      h += '<p class="rap-params-title">' + esc((b.paramTitle || "PARTICULARS").toUpperCase()) + "</p>" +
        '<div class="scrollwrap"><table><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>';
      b.params.forEach(function (p) {
        h += "<tr><td><code>" + esc(p.name) + "</code>" +
          (p.required ? ' <span class="req">REQUIRED</span>' : "") +
          "</td><td><code>" + esc(p.type || "") + "</code></td><td>" + (p.desc || "") + "</td></tr>";
      });
      h += "</tbody></table></div>";
    }
    if (b.codeTabs && b.codeTabs.length) {
      if (b.codeTabs.length === 1) {
        h += renderCode({ code: b.codeTabs[0].code, lang: b.codeTabs[0].lang, title: b.codeTabs[0].label });
      } else {
        h += renderTabs({
          groupId: "",
          tabs: b.codeTabs.map(function (ct) {
            return { label: ct.label, value: ct.label, blocks: [{ t: "code", code: ct.code, lang: ct.lang }] };
          })
        });
      }
    }
    (b.responses || []).forEach(function (r) {
      var err = r.status >= 400;
      h += '<div class="rap-resp-head"><span class="rap-status' + (err ? " err" : "") + '">' +
        esc(String(r.status)) + "</span><span>" + esc(r.statusText || "") + "</span></div>" +
        renderCode({ code: r.body, lang: r.lang || "json" });
    });
    h += "</div></article>";
    return h;
  }

  function renderBlock(b) {
    if (!b || typeof b !== "object") return "";
    switch (b.t) {
      case "tldr":
        return '<aside class="tldr">' + (b.html || "") + "</aside>";
      case "p": return "<p>" + (b.html || "") + "</p>";
      case "h2": case "h3": case "h4": case "h5": case "h6":
        return "<" + b.t + (b.id ? ' id="' + esc(b.id) + '"' : "") + ">" + esc(b.text || "") + "</" + b.t + ">";
      case "img": {
        var src = resolveImg(b.light || b.dark || "");
        if (!src) return "";
        var n = ++phCount;
        return '<div class="photo-wrap"><figure class="photo" style="--ph-tilt:' +
          (((hashCode(src) % 40) / 10 - 2)).toFixed(1) + 'deg">' +
          '<img loading="lazy" src="' + esc(src) + '" alt="' + esc(b.alt || "") + '">' +
          "<figcaption>" + (b.caption || ("Photograph " + n + " · " + esc(b.alt || "from the file"))) +
          "</figcaption></figure></div>";
      }
      case "ul": return "<ul>" + renderItems(b.items) + "</ul>";
      case "ol":
        return "<ol" + (b.start && b.start !== 1 ? ' start="' + (+b.start || 1) + '"' : "") + ">" +
          renderItems(b.items) + "</ol>";
      case "table": {
        var h = '<div class="scrollwrap"><table>';
        if (b.head && b.head.length) {
          h += "<thead><tr>" + b.head.map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr></thead>";
        }
        h += "<tbody>" + (b.rows || []).map(function (row) {
          return "<tr>" + row.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>";
        }).join("") + "</tbody></table></div>";
        return h;
      }
      case "admonition": {
        var name = ADM[b.kind] || String(b.kind || "NOTE").toUpperCase();
        return '<aside class="admo admo-' + esc(b.kind) + '"><p class="admo-head">' + esc(name) +
          (b.title && b.title.toLowerCase() !== String(b.kind).toLowerCase()
            ? '<span class="admo-custom">' + esc(b.title) + "</span>" : "") +
          "</p>" + renderBlocks(b.blocks || []) + "</aside>";
      }
      case "tabs": return renderTabs(b);
      case "code": return renderCode(b);
      case "cards":
        return '<div class="leads">' + (b.items || []).map(function (c) {
          return '<a class="lead-card" href="' + esc(c.link || "#/board") + '">' +
            (c.icon ? '<span class="lead-icon">' + esc(c.icon) + "</span>" : "") +
            "<h4>" + esc(c.title || "") + "</h4><p>" + (c.desc || "") + "</p></a>";
        }).join("") + "</div>";
      case "badge":
        return '<span class="tag-badge"' + (b.tooltip ? ' title="' + esc(b.tooltip) + '"' : "") + ">" +
          esc(b.label || "") + "</span>";
      case "details":
        return '<details class="sealed"' + (b.id ? ' id="' + esc(b.id) + '"' : "") + "><summary>" +
          (b.summary || "Sealed envelope") + '</summary><div class="sealed-body">' +
          renderBlocks(b.blocks || []) + "</div></details>";
      case "endpoint": return renderEndpoint(b);
      case "columns":
        return '<div class="two-col">' + (b.cols || []).map(function (col) {
          return "<div>" + renderBlocks(col) + "</div>";
        }).join("") + "</div>";
      case "hr": return "<hr>";
      default: return "";
    }
  }
  function renderBlocks(blocks) { return (blocks || []).map(renderBlock).join(""); }

  /* ================== THE CASE FILE (reading view) ================== */
  function monologue(slug) {
    var m = META[slug], pv = m.prov;
    var lines = [];
    lines.push("The file hit my desk on " + (pv.first || "an unrecorded date") + ". " +
      (pv.commits || 0) + (pv.commits === 1 ? " entry" : " entries") +
      " in the log since, the last one dated " + (pv.last || "unknown") + ".");
    if (m.stale) lines.push("Over a year without a touch. The trail's gone cold, but the file still reads clean.");
    var wits = (pv.authors || []).length;
    lines.push(wits + (wits === 1 ? " witness" : " witnesses") + " signed the pages" +
      (pv.topAuthor ? ", " + pv.topAuthor + " more than anyone" : "") + ".");
    lines.push(num(m.words) + " words on record, " + m.exhibits + " exhibit" +
      (m.exhibits === 1 ? "" : "s") + ", " + m.photos + " photograph" +
      (m.photos === 1 ? "" : "s") + " pinned to the folder.");
    if (m.cold) {
      lines.push("No file in this office points at it. Nobody's asked about this one in a while. Somebody should.");
    } else {
      lines.push(m.inb + (m.inb === 1 ? " file points" : " files point") + " at this one; it points back at " +
        m.out + ".");
    }
    var cm = COMM_OF[slug];
    if (cm && cm.size > 1) {
      var hubLabel = META[cm.hub] ? META[cm.hub].label : cm.hub;
      var pct = Math.round(cm.purity * 100);
      lines.push("It runs with the " + hubLabel + " outfit: " + cm.size + " members, " +
        (pct < 60 ? "only " : "") + pct +
        " percent of them live where the files say they do (" + cm.dominant + ").");
    }
    return '<div class="monologue">' + lines.map(function (l) {
      return '<span class="type-line">' + esc(l) + "</span>";
    }).join(" ") + "</div>";
  }

  function viewCase(slug, anchor) {
    var page = D.content.pages[slug];
    var m = META[slug], pv = m.prov;
    showSection("case-view");
    setActiveNav(slug === "/cms/intro" ? "intro" : "");
    document.title = "CASE " + m.no + " · " + m.label + " · The Case Files";

    exCount = 0; phCount = 0; tabsUid = 0;

    var stamp = m.cold ? '<span class="stamp blue">COLD CASE</span>'
      : (m.night ? '<span class="stamp plum">NIGHT SHIFT</span>'
        : (m.stale ? '<span class="stamp">GONE COLD</span>' : ""));

    var lastSeen = esc(pv.last || "?") + (m.stale ? ' <span class="meta-cold">· trail’s gone cold</span>' : "");
    var witnesses = (pv.authors || []).map(esc).join(", ") || "none on record";
    var meta =
      "<div><dt>CASE</dt><dd>" + esc(m.no) + "</dd></div>" +
      "<div><dt>OPENED</dt><dd>" + esc(pv.first || "?") + "</dd></div>" +
      "<div><dt>LAST SEEN</dt><dd>" + lastSeen + "</dd></div>" +
      "<div><dt>PRECINCT</dt><dd>" + (m.precinct ? esc(m.precinct.label) : "?") + "</dd></div>" +
      "<div><dt>WITNESSES</dt><dd>" + witnesses + "</dd></div>" +
      "<div><dt>EVIDENCE</dt><dd>" + num(m.words) + " words · " + m.exhibits +
      " exhibit" + (m.exhibits === 1 ? "" : "s") + " · " + m.photos + " photo" +
      (m.photos === 1 ? "" : "s") + "</dd></div>" +
      "<div><dt>STRINGS</dt><dd>" + m.inb + " in · " + m.out + " out</dd></div>" +
      "<div><dt>DOSSIER</dt><dd>" + esc(page.file || slug) + "</dd></div>";

    var outs = (OUT_LIST[slug] || []).slice().sort(function (a, b) { return META[a].idx - META[b].idx; });
    var ins = (IN_LIST[slug] || []).slice().sort(function (a, b) { return META[a].idx - META[b].idx; });
    function assocList(list) {
      return '<ul class="assoc-list">' + list.map(function (s) {
        return '<li><a href="#' + esc(s) + '">' + esc(META[s].label) + "</a></li>";
      }).join("") + "</ul>";
    }
    var assoc = '<section class="associates"><h3>KNOWN ASSOCIATES</h3>';
    if (outs.length) {
      assoc += '<p class="outfit-line">This file names ' + outs.length + " other" +
        (outs.length === 1 ? " file" : " files") + ". Follow the string:</p>" + assocList(outs);
    } else {
      assoc += '<p class="assoc-none">This file names nobody. It keeps its own counsel.</p>';
    }
    if (ins.length) {
      assoc += "<h3>THEY POINT BACK</h3><p class=\"outfit-line\">" + ins.length +
        (ins.length === 1 ? " file mentions" : " files mention") + " this one:</p>" + assocList(ins);
    } else {
      assoc += "<h3>THEY POINT BACK</h3><p class=\"assoc-none\">Nobody's asked about this one in a while. Somebody should.</p>";
    }
    assoc += "</section>";

    var prevSlug = m.idx > 0 ? ORDER[m.idx - 1] : null;
    var nextSlug = m.idx < ORDER.length - 1 ? ORDER[m.idx + 1] : null;
    var nav = '<nav class="case-nav">' +
      (prevSlug ? '<a href="#' + esc(prevSlug) + '"><span class="nav-dir">◀</span>CASE ' +
        esc(META[prevSlug].no) + " · " + esc(META[prevSlug].label) + "</a>" : "<span></span>") +
      (nextSlug ? '<a href="#' + esc(nextSlug) + '">CASE ' + esc(META[nextSlug].no) + " · " +
        esc(META[nextSlug].label) + '<span class="nav-dir">▶</span></a>' : "<span></span>") + "</nav>";

    var el = document.getElementById("case-view");
    el.innerHTML =
      '<div class="desk-tools"><a href="#/board">■ THE BOARD</a><span class="crumb-sep">/</span>' +
      "<span>" + (m.precinct ? "PRECINCT " + m.precinct.num + " · " + esc(m.precinct.label.toUpperCase()) : "") +
      '</span><span class="crumb-sep">/</span><span>FILE ' + (m.idx + 1) + " OF " + ORDER.length + "</span>" +
      (m.cold ? '<span class="crumb-sep">/</span><a href="#/cold-cases">FROM THE COLD DRAWER</a>' : "") +
      "</div>" +
      '<div class="desk">' +
      '<span class="folder-tab">' + (m.precinct ? "PRECINCT " + m.precinct.num + " · " +
        esc(m.precinct.label.toUpperCase()) : "UNFILED") + "</span>" +
      '<div class="folder">' +
      '<header class="case-card">' + stamp +
      '<p class="case-kicker">STRAPI DOCUMENTATION DETECTIVE AGENCY · CASE ' + esc(m.no) + "</p>" +
      '<h1 class="case-title">' + esc(stripTitle(page.title)) + "</h1>" +
      '<dl class="case-meta">' + meta + "</dl>" +
      "</header>" +
      monologue(slug) +
      '<article class="typed-pages">' +
      (page.description && !(page.blocks || []).some(function (b) { return b && b.t === "tldr"; })
        ? '<aside class="tldr">' + esc(page.description) + "</aside>" : "") +
      renderBlocks(page.blocks) +
      "</article>" + assoc +
      "</div>" + nav + "</div>";

    if (anchor) {
      var t = document.getElementById(anchor);
      if (t) { t.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
  }

  /* ================== THE COLD DRAWER ================== */
  function viewCold() {
    showSection("cold-view");
    setActiveNav("cold");
    document.title = "The Cold Case Drawer · The Case Files";
    var el = document.getElementById("cold-view");
    var html = '<div class="cabinet"><h1>THE COLD CASE DRAWER</h1>' +
      '<p class="cab-lede">' + COLD.length + " of the " + ORDER.length +
      " files on our wall have no red string leading in: not one of the " +
      num(D.graph.edges.length) + " citations in the ledger points their way. " +
      "Nobody's asked about them in a while. Somebody should. Every one is complete, " +
      "readable, and still on the wall.</p>" +
      '<div class="drawer"><span class="drawer-label">STAMPED · COLD CASE · ' +
      COLD.length + " FILES</span>" +
      '<div class="cold-grid">';
    COLD.forEach(function (slug) {
      var m = META[slug];
      html += '<a class="cold-file" href="#' + esc(slug) + '">' +
        '<span class="cf-stamp' + (m.night ? " night" : "") + '">' + (m.night ? "NIGHT" : "COLD") + "</span>" +
        '<span class="cf-no">CASE ' + esc(m.no) + "</span>" +
        '<span class="cf-title">' + esc(m.label) + "</span>" +
        '<span class="cf-meta">last seen ' + esc(m.prov.last || "?") + " · " +
        num(m.words) + " words</span></a>";
    });
    html += "</div>" +
      '<p class="drawer-note">The drawer stays unlocked and the lamp stays on. ' +
      "Open any file: the pages are all there, typed and filed, waiting for a reader.</p>" +
      "</div></div>";
    el.innerHTML = html;
    window.scrollTo(0, 0);
  }

  function viewLost(slug) {
    showSection("case-view");
    setActiveNav("");
    document.title = "No such file · The Case Files";
    document.getElementById("case-view").innerHTML =
      '<div class="notfound"><p>I went through every drawer in the office. There is no file at ' +
      "“" + esc(slug) + "”.</p>" +
      '<p><a href="#/board">Back to the board</a>, where all ' + ORDER.length + " real cases are pinned.</p></div>";
  }

  /* ================== chrome ================== */
  function showSection(id) {
    ["board-view", "case-view", "cold-view"].forEach(function (s) {
      document.getElementById(s).hidden = s !== id;
    });
    if (id === "board-view") {
      buildBoard();
      sizeCanvas();
      drawStrings();
    }
  }

  function setActiveNav(key) {
    document.querySelectorAll("#topnav a").forEach(function (a) {
      a.classList.toggle("active", a.dataset.nav === key);
    });
  }

  function viewBoard() {
    setActiveNav("board");
    document.title = "The Case Files · The Board";
    showSection("board-view");
  }

  /* ---------------- router ---------------- */
  function route() {
    var h = location.hash || "";
    if (!h || h === "#" || h === "#/") { location.replace("#/board"); return; }
    if (h.charAt(1) !== "/") return; // in-page anchor
    var rest = decodeURIComponent(h.slice(1));
    var anchor = "", ix = rest.indexOf("#");
    if (ix !== -1) { anchor = rest.slice(ix + 1); rest = rest.slice(0, ix); }
    if (rest === "/board") return viewBoard();
    if (rest === "/cold-cases") return viewCold();
    if (D.content.pages[rest]) return viewCase(rest, anchor);
    return viewLost(rest);
  }

  /* ---------------- global interactions ---------------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".dossier-tab");
    if (btn) {
      var tabsEl = btn.closest(".dossier");
      var gid = tabsEl.dataset.group, val = btn.dataset.value;
      function activate(container, index) {
        container.querySelectorAll('.dossier-tab[data-uid="' + container.dataset.uid + '"]').forEach(function (bb) {
          bb.setAttribute("aria-selected", bb.dataset.idx === String(index));
        });
        container.querySelectorAll('.dossier-panel[data-uid="' + container.dataset.uid + '"]').forEach(function (pp) {
          if (pp.dataset.idx === String(index)) pp.removeAttribute("hidden");
          else pp.setAttribute("hidden", "");
        });
      }
      activate(tabsEl, btn.dataset.idx);
      if (gid) {
        tabChoice[gid] = val;
        document.querySelectorAll('.dossier[data-group="' + gid + '"]').forEach(function (other) {
          if (other === tabsEl) return;
          var match = other.querySelector('.dossier-tab[data-value="' + val + '"]');
          if (match) activate(other, match.dataset.idx);
        });
      }
      return;
    }
    var a = e.target.closest && e.target.closest("a[href]");
    if (a) {
      var href = a.getAttribute("href");
      if (href && href.charAt(0) === "#" && href.charAt(1) !== "/") {
        e.preventDefault();
        var t = document.getElementById(href.slice(1));
        if (t) t.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
      }
    }
  });

  /* ---------------- search ---------------- */
  function initSearch() {
    var input = document.getElementById("search");
    var box = document.getElementById("search-results");
    var sel = -1, current = [];
    function hide() { box.hidden = true; sel = -1; }
    function run(q) {
      q = q.trim().toLowerCase();
      if (!q) { hide(); return; }
      var scored = [];
      for (var i = 0; i < SEARCH_INDEX.length; i++) {
        var it = SEARCH_INDEX[i], sc = 0;
        if (it.label.indexOf(q) !== -1) sc += 6;
        if (it.title.indexOf(q) !== -1) sc += 4;
        if (it.desc.indexOf(q) !== -1) sc += 3;
        if (it.heads.indexOf(q) !== -1) sc += 2;
        if (it.tags.indexOf(q) !== -1) sc += 2;
        if (it.section.indexOf(q) !== -1) sc += 1;
        if (sc) scored.push([sc, it.slug]);
      }
      scored.sort(function (a, b) { return b[0] - a[0]; });
      current = scored.slice(0, 12).map(function (x) { return x[1]; });
      if (!current.length) {
        box.innerHTML = '<div class="sr-none">Not a file in the office by that name. Try another angle.</div>';
      } else {
        box.innerHTML = current.map(function (slug, i) {
          var m = META[slug];
          return '<button class="sr-item' + (i === sel ? " sel" : "") + '" type="button" data-slug="' + esc(slug) + '">' +
            '<span class="sr-no">' + esc(m.no) + "</span>" + esc(m.label) +
            '<span class="sr-sec">' + (m.precinct ? "Precinct " + m.precinct.num + " · " + esc(m.precinct.label) : "") +
            " · " + num(m.words) + " words</span></button>";
        }).join("");
      }
      box.hidden = false;
    }
    input.addEventListener("input", function () { sel = -1; run(input.value); });
    input.addEventListener("focus", function () { if (input.value.trim()) run(input.value); });
    input.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, current.length - 1); mark(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); mark(); }
      else if (e.key === "Enter") {
        e.preventDefault();
        var target = current[sel >= 0 ? sel : 0];
        if (target) { location.hash = "#" + target; hide(); input.blur(); }
      } else if (e.key === "Escape") hide();
    });
    function mark() {
      box.querySelectorAll(".sr-item").forEach(function (b, i) { b.classList.toggle("sel", i === sel); });
    }
    box.addEventListener("mousedown", function (e) {
      var b = e.target.closest(".sr-item");
      if (b) { e.preventDefault(); location.hash = "#" + b.dataset.slug; hide(); input.blur(); }
    });
    document.addEventListener("click", function (e) {
      if (!(e.target.closest && e.target.closest("#searchbox"))) hide();
    });
  }

  /* ---------------- plain words key ---------------- */
  function initKey() {
    var overlay = document.getElementById("key-overlay");
    var btn = document.getElementById("key-btn");
    var close = document.getElementById("key-close");
    btn.addEventListener("click", function () { overlay.hidden = false; close.focus(); });
    close.addEventListener("click", function () { overlay.hidden = true; btn.focus(); });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.hidden = true; });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hidden) { overlay.hidden = true; btn.focus(); }
    });
  }

  /* ---------------- boot ---------------- */
  Promise.all([
    fetch("content.json").then(function (r) { return r.json(); }),
    fetch("graph.json").then(function (r) { return r.json(); }),
    fetch("provenance.json").then(function (r) { return r.json(); }),
    fetch("communities.json").then(function (r) { return r.json(); })
  ]).then(function (res) {
    D.content = res[0]; D.graph = res[1]; D.prov = res[2]; D.comm = res[3];
    deriveAll();
    initSearch();
    initKey();
    var intro = document.querySelector('#topnav a[data-nav="intro"]');
    if (intro && D.content.pages["/cms/intro"]) {
      intro.textContent = "Case " + META["/cms/intro"].no;
    }
    window.addEventListener("hashchange", route);
    route();
    document.getElementById("boot").classList.add("gone");
  }).catch(function (err) {
    document.querySelector("#boot .boot-type").textContent =
      "The office is dark tonight: " + String(err && err.message || err);
  });
})();
