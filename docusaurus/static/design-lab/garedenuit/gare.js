/* ================== LA GARE DE NUIT ==================
   The Strapi documentation as a night sleeper-train station.
   All facts on screen are measured from content.json, graph.json,
   provenance.json — nothing invented. */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var app = document.getElementById("app");
  var D = { content: null, graph: null, prov: null, comm: null };
  var META = {};          // slug -> derived departure data
  var PLATFORMS = [];     // 18 nav groups -> voies
  var ORDER = [];
  var SEARCH_INDEX = [];
  var HANDS = 0;          // distinct real authors
  var NIGHT_SLUGS = [];   // pages with night edits (provenance.night > 0)
  var SIDING = {};        // slug -> true when no page cites it
  var LATE = {};          // slug -> true when last touch > 365 days ago
  var tabChoice = {};     // groupId -> value

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
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function resolveImg(p) { return p && p.charAt(0) === "/" ? p.slice(1) : p; }
  function stripTitle(t) {
    return String(t || "").replace(/\s*[-|·]\s*Strapi.*$/i, "").trim() || t;
  }

  /* ---------------- data + derivations ---------------- */
  function deriveAll() {
    var c = D.content, g = D.graph, prov = D.prov;
    ORDER = c.order;

    // 18 platforms = nav groups
    c.nav.forEach(function (grp, i) {
      var slugs = [];
      (function collect(items) {
        items.forEach(function (it) {
          if (it.slug) slugs.push(it.slug);
          if (it.items) collect(it.items);
        });
      })(grp.items || []);
      PLATFORMS.push({ num: i + 1, label: grp.label, product: grp.product, slugs: slugs });
    });

    var authors = {};
    var now = Date.now();
    Object.keys(prov).forEach(function (s) {
      (prov[s].authors || []).forEach(function (a) { authors[a] = 1; });
      if (prov[s].night > 0) NIGHT_SLUGS.push(s);
      if (now - new Date(prov[s].last + "T00:00:00").getTime() > 365 * 864e5) LATE[s] = true;
    });
    HANDS = Object.keys(authors).length;

    ORDER.forEach(function (s) {
      if (!g.inbound[s]) SIDING[s] = true;
    });

    // per-page departure meta
    ORDER.forEach(function (slug, idx) {
      var page = c.pages[slug];
      var pv = prov[slug] || {};
      var voie = 0;
      for (var i = 0; i < PLATFORMS.length; i++) {
        if (PLATFORMS[i].slugs.indexOf(slug) !== -1) { voie = i + 1; break; }
      }
      // departure time: deterministic from the first-commit date
      var days = Math.round(new Date((pv.first || "2024-01-01") + "T00:00:00Z").getTime() / 864e5);
      // the first-commit date fixes the half-hour slot; carriages that entered
      // service the same day fan out inside it (stable per-slug offset)
      var m = ((days * 137) % 559) - (((days * 137) % 559) % 30) + (hashCode(slug) % 30);
      var t = (20 * 60 + 31 + m) % 1440;
      var time = pad2(Math.floor(t / 60)) + ":" + pad2(t % 60);
      var train = String(1000 + (hashCode(slug) % 9000));
      var remark = LATE[slug] ? "RETARDÉ"
        : (pv.night > 0 ? "TRAIN DE NUIT" : (SIDING[slug] ? "VOIE DE GARAGE" : ""));
      META[slug] = {
        idx: idx, voie: voie, time: time, train: train, remark: remark,
        night: pv.night > 0, siding: !!SIDING[slug], late: !!LATE[slug],
        words: (D.graph.words[slug] || 0), inb: (D.graph.inbound[slug] || 0),
        out: (D.graph.outbound[slug] || 0), prov: pv,
        label: page.sidebarLabel || stripTitle(page.title)
      };
    });

    // search index
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

  /* ---------------- split-flap engine ---------------- */
  var FLAPSEQ = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ÉÈÊÀÇ:-&'()./·";
  var flapQueue = [];
  var flapRunning = false;

  function flapText(str, len) {
    var s = (str || "").toUpperCase();
    if (s.length > len) s = s.slice(0, len - 1) + "·";
    while (s.length < len) s += " ";
    return s;
  }
  function buildGroup(cls, text) {
    var html = '<span class="bgroup ' + cls + '">';
    for (var i = 0; i < text.length; i++) {
      html += '<span class="cell"><span class="ch">' + esc(text[i]) + "</span></span>";
    }
    return html + "</span>";
  }
  function animateRow(row) {
    if (REDUCED || row.dataset.done) return;
    row.dataset.done = "1";
    var cells = row.querySelectorAll(".cell .ch");
    var active = [];
    cells.forEach(function (ch, i) {
      var target = ch.textContent;
      if (target === " " || target === "") return;
      var steps = 2 + ((hashCode(row.dataset.slug || "x") + i) % 3);
      var seq = [];
      var ti = FLAPSEQ.indexOf(target);
      for (var k = steps; k > 0; k--) {
        seq.push(ti >= 0 ? FLAPSEQ[(ti - k + FLAPSEQ.length * 2) % FLAPSEQ.length] : target);
      }
      seq.push(target);
      active.push({ ch: ch, seq: seq, i: 0, next: performance.now() + i * 9 });
      ch.textContent = " ";
    });
    if (active.length) { flapQueue.push(active); runFlaps(); }
  }
  function runFlaps() {
    if (flapRunning) return;
    flapRunning = true;
    function frame(t) {
      var busy = false;
      for (var q = 0; q < flapQueue.length; q++) {
        var list = flapQueue[q];
        for (var j = 0; j < list.length; j++) {
          var u = list[j];
          if (u.i >= u.seq.length) continue;
          busy = true;
          if (t >= u.next) {
            u.ch.textContent = u.seq[u.i++];
            u.next = t + 52 + (j % 4) * 6;
            if (u.ch.animate) {
              u.ch.animate(
                [{ transform: "rotateX(0)" }, { transform: "rotateX(-86deg)", offset: 0.49 },
                 { transform: "rotateX(86deg)", offset: 0.51 }, { transform: "rotateX(0)" }],
                { duration: 64 });
            }
          }
        }
      }
      if (busy) requestAnimationFrame(frame);
      else { flapQueue = []; flapRunning = false; }
    }
    requestAnimationFrame(frame);
  }

  /* ---------------- views ---------------- */
  function setActiveNav(route) {
    document.querySelectorAll(".topnav a").forEach(function (a) {
      a.classList.toggle("active", a.dataset.route === route);
    });
  }

  function grandeLigneSVG() {
    var step = 7, r = 2.6, x0 = 14, y = 26;
    var w = x0 * 2 + (ORDER.length - 1) * step;
    var s = '<svg width="' + w + '" height="52" viewBox="0 0 ' + w + ' 52" role="img" aria-label="La grande ligne : les 290 pages dans l’ordre de lecture">';
    s += '<line x1="' + x0 + '" y1="' + y + '" x2="' + (w - x0) + '" y2="' + y + '" stroke="#3a486b" stroke-width="2"/>';
    var lastVoie = -1;
    ORDER.forEach(function (slug, i) {
      var m = META[slug];
      var x = x0 + i * step;
      var col = m.night ? "#cfe0ff" : (m.siding ? "#5d5a4c" : (m.voie <= 10 ? "#f2a944" : "#7fa2c0"));
      if (m.voie !== lastVoie) {
        lastVoie = m.voie;
        s += '<line x1="' + x + '" y1="14" x2="' + x + '" y2="38" stroke="#26304a" stroke-width="1"/>';
        var segLen = 0;
        for (var k = i; k < ORDER.length && META[ORDER[k]].voie === m.voie; k++) segLen++;
        if (segLen >= 4) s += '<text class="ligne-cap" x="' + (x + 3) + '" y="49">V' + m.voie + "</text>";
      }
      s += '<a href="#' + esc(slug) + '"><circle class="ligne-dot" cx="' + x + '" cy="' + y + '" r="' + r +
        '" fill="' + col + '" stroke="#0c1220" stroke-width="1"><title>' + esc(m.label) + "</title></circle></a>";
    });
    return s + "</svg>";
  }

  function viewHall() {
    setActiveNav("gare");
    document.title = "La Gare de Nuit · Tableau des départs";
    var lateCount = Object.keys(LATE).length;
    var html = '<h2 class="hall-title">La grande ligne · ordre de lecture</h2>' +
      '<div class="ligne-wrap">' + grandeLigneSVG() + "</div>" +
      '<div class="board-cabinet">' +
      '<div class="pigeon" aria-hidden="true"><svg viewBox="0 0 26 22"><path d="M4 20c2-1 4-2 5-4 1 1 3 1 4 0 2 1 5 0 6-2 1-2 0-4-1-5 1-1 2-1 3-1-1-1-2-1-3-1-1-2-3-3-5-2-2 1-3 3-3 5 0 3-2 6-6 8z" fill="#1d2536"/><circle cx="16.6" cy="7.2" r=".8" fill="#0a0d15"/></svg></div>' +
      '<div class="lampflicker" aria-hidden="true"></div>' +
      '<div class="board-glow" aria-hidden="true"></div>' +
      '<div class="board-top"><span class="board-name">DÉPARTS · GRANDES LIGNES</span>' +
      '<span class="board-note">' + ORDER.length + " départs · " + PLATFORMS.length + " voies · aucun train supprimé</span></div>" +
      '<div class="board-scroll"><div class="board-head">' +
      '<span class="g-time">Heure</span><span class="g-dest">Destination</span>' +
      '<span class="g-voie">Voie</span><span class="g-train">Train</span><span class="g-rem">Remarques</span>' +
      "</div><div id=\"board-rows\"></div></div>" +
      '<div class="board-foot"><span>' + (lateCount === 0
        ? "aucun retard signalé ce soir"
        : lateCount + " train(s) retardé(s) — plus d’un an sans retouche") + "</span>" +
      '<span class="quote">« ' + esc(D.content.pages["/cms/quick-start"].description) +
      ' » — Quick Start Guide</span></div>' +
      "</div>";
    app.innerHTML = html;

    // rows
    var frag = document.createDocumentFragment();
    ORDER.forEach(function (slug) {
      var m = META[slug];
      var row = document.createElement("div");
      row.className = "brow" + (m.night ? " is-night" : "") + (m.siding ? " is-siding" : "");
      row.dataset.slug = slug;
      row.setAttribute("role", "link");
      row.setAttribute("tabindex", "0");
      row.setAttribute("aria-label", m.label + ", voie " + m.voie + ", départ " + m.time);
      row.title = m.label + " — voie " + m.voie;
      row.innerHTML =
        buildGroup("g-time", flapText(m.time, 5)) +
        buildGroup("g-dest", flapText(m.label, 32)) +
        buildGroup("g-voie", flapText(String(m.voie), 2)) +
        buildGroup("g-train", flapText(m.train, 4)) +
        '<span class="' + (m.late ? "rem-late " : "") + 'g-remwrap">' +
        buildGroup("g-rem", flapText(m.remark, 14)) + "</span>";
      frag.appendChild(row);
    });
    var holder = document.getElementById("board-rows");
    holder.appendChild(frag);

    if (!REDUCED && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { animateRow(en.target); io.unobserve(en.target); }
        });
      }, { root: app.querySelector(".board-scroll"), rootMargin: "60px" });
      holder.querySelectorAll(".brow").forEach(function (r) { io.observe(r); });
    }
  }

  function carriageWidth(words) {
    return Math.max(84, Math.min(330, Math.round(words / 30) + 60));
  }
  function isNightNow() {
    var h = new Date().getHours();
    return h >= 21 || h < 6;
  }

  function viewQuais(focusVoie) {
    setActiveNav("quais");
    document.title = "La Gare de Nuit · Les quais";
    var lit = isNightNow();
    var html = '<h2 class="hall-title">Les quais · ' + PLATFORMS.length + " voies sous les lampes au sodium</h2>";
    PLATFORMS.forEach(function (pf) {
      html += '<section class="quai" id="quai-' + pf.num + '">' +
        '<div class="quai-head"><span class="voie-badge">Voie ' + pf.num + "</span>" +
        '<span class="quai-label">' + esc(pf.label) + "</span>" +
        '<span class="quai-meta">' + pf.slugs.length + " voiture(s) · " + esc(pf.product) + "</span></div>" +
        '<div class="quai-scene"><div class="train">';
      pf.slugs.forEach(function (slug) {
        var m = META[slug];
        if (!m) return;
        var cls = "carriage" + (m.night ? " night-mark" + (lit ? " night-lit" : "") : "") + (m.siding ? " siding" : "");
        html += '<button class="' + cls + '" style="width:' + carriageWidth(m.words) + 'px" data-slug="' + esc(slug) +
          '" title="' + esc(m.label) + " · " + m.words + " mots · conducteur " + esc(m.prov.topAuthor || "?") + '">' +
          '<span class="car-label">' + esc(m.label) + "</span></button>";
      });
      html += "</div></div></section>";
    });
    // the siding
    var sidingSlugs = ORDER.filter(function (s) { return META[s].siding; });
    html += '<section class="quai" id="quai-garage">' +
      '<div class="quai-head"><span class="voie-badge">Voie de garage</span>' +
      '<span class="quai-label">Les voitures que personne ne cite</span>' +
      '<span class="quai-meta">' + sidingSlugs.length + " voiture(s), lumières éteintes, toujours visitables</span></div>" +
      '<div class="chef-de-gare"><div class="chef-lamp" aria-hidden="true"></div>' +
      "<p>Le chef de gare laisse une lampe allumée pour elles : " + sidingSlugs.length +
      " pages sans aucune citation entrante (graphe des " + D.graph.edges.length + " citations). Aucune n’est supprimée.</p></div>" +
      '<div class="quai-scene"><div class="train">';
    sidingSlugs.forEach(function (slug) {
      var m = META[slug];
      html += '<button class="carriage siding" style="width:' + carriageWidth(m.words) + 'px" data-slug="' + esc(slug) +
        '" title="' + esc(m.label) + '"><span class="car-label">' + esc(m.label) + "</span></button>";
    });
    html += "</div></div></section>";
    app.innerHTML = html;
    if (focusVoie) {
      var el = document.getElementById("quai-" + focusVoie);
      if (el) el.scrollIntoView();
    }
  }

  /* ---------------- block renderer ---------------- */
  var ADM = {
    tip: ["✦", "Astuce"], note: ["✎", "Note"], info: ["ℹ", "Info"],
    caution: ["⚠", "Prudence"], warning: ["⚠", "Attention"], danger: ["⛔", "Danger"],
    strapi: ["✴", "Strapi"], prerequisites: ["☑", "Prérequis"], callout: ["➤", "Callout"]
  };

  function renderCode(b) {
    var lines = String(b.code || "").replace(/^\n+/, "").split("\n");
    var out = [], hl = false;
    lines.forEach(function (ln) {
      if (/^\s*(\/\/|#|<!--|\/\*|\{\/\*)?\s*highlight-start/.test(ln)) { hl = true; return; }
      if (/^\s*(\/\/|#|<!--|\/\*|\{\/\*)?\s*highlight-end/.test(ln)) { hl = false; return; }
      var next = /^\s*(\/\/|#|<!--|\/\*|\{\/\*)?\s*highlight-next-line/.test(ln);
      if (next) { out.push({ t: null, mark: "next" }); return; }
      out.push({ t: ln, hl: hl });
    });
    var htmlLines = [];
    for (var i = 0; i < out.length; i++) {
      if (out[i].mark === "next") { if (out[i + 1]) out[i + 1].hl = true; continue; }
      htmlLines.push(out[i].hl ? '<span class="hl">' + esc(out[i].t) + "</span>" : esc(out[i].t));
    }
    var head = "";
    if (b.title || b.lang) {
      head = '<div class="codetitle"><span>' + esc(b.title || "") + '</span><span class="lang">' + esc(b.lang || "") + "</span></div>";
    }
    return '<div class="codeblock">' + head + "<pre><code>" + htmlLines.join("\n") + "</code></pre></div>";
  }

  function renderItems(items) {
    return (items || []).map(function (it) {
      if (typeof it === "string") return "<li>" + it + "</li>";
      return "<li>" + (it.html || "") + renderBlocks(it.blocks || []) + "</li>";
    }).join("");
  }

  var tabsUid = 0;
  function renderTabs(b) {
    var gid = b.groupId || "";
    var uid = "tabs-" + (++tabsUid);
    var chosen = 0;
    if (gid && tabChoice[gid] != null) {
      b.tabs.forEach(function (tb, i) { if (tb.value === tabChoice[gid]) chosen = i; });
    }
    var bar = "", panels = "";
    b.tabs.forEach(function (tb, i) {
      var sel = i === chosen;
      bar += '<button class="tab-btn" role="tab" aria-selected="' + sel + '" data-uid="' + uid +
        '" data-idx="' + i + '" data-value="' + esc(tb.value || "") + '">' + esc(tb.label || tb.value || ("Onglet " + (i + 1))) + "</button>";
      panels += '<div class="tab-panel" role="tabpanel" data-uid="' + uid + '" data-idx="' + i + '"' + (sel ? "" : " hidden") + ">" +
        renderBlocks(tb.blocks || []) + "</div>";
    });
    return '<div class="tabs" data-group="' + esc(gid) + '" data-uid="' + uid + '"><div class="tab-bar" role="tablist">' + bar + "</div>" + panels + "</div>";
  }

  function renderEndpoint(b) {
    var h = '<article class="endpoint ep-' + esc(b.kind || "http") + '"' + (b.id ? ' id="' + esc(b.id) + '"' : "") + ">";
    h += '<div class="ep-head">';
    if (b.method) h += '<span class="ep-method ep-' + esc(b.method) + '">' + esc(b.method) + "</span>";
    else if (b.kind === "js") h += '<span class="ep-method ep-generic">JS</span>';
    else if (b.kind === "call") h += '<span class="ep-method ep-generic">CALL</span>';
    if (b.path) h += '<span class="ep-path">' + esc(b.path) + "</span>";
    if (b.title) h += '<span class="ep-title">' + esc(b.title) + "</span>";
    h += "</div>";
    h += '<div class="ep-body">';
    if (b.description) h += '<p class="ep-desc">' + b.description + "</p>";
    if (b.params && b.params.length) {
      h += '<div class="ep-params"><h4>' + esc(b.paramTitle || "Paramètres") + "</h4>" +
        '<div class="tablewrap"><table><thead><tr><th>Nom</th><th>Type</th><th>Description</th></tr></thead><tbody>';
      b.params.forEach(function (p) {
        h += "<tr><td><code>" + esc(p.name) + "</code>" + (p.required ? ' <span class="ep-req">requis</span>' : "") +
          "</td><td><code>" + esc(p.type || "") + "</code></td><td>" + (p.desc || "") + "</td></tr>";
      });
      h += "</tbody></table></div></div>";
    }
    if (b.codeTabs && b.codeTabs.length) {
      if (b.codeTabs.length === 1) {
        h += renderCode({ code: b.codeTabs[0].code, lang: b.codeTabs[0].lang, title: b.codeTabs[0].label });
      } else {
        h += renderTabs({
          groupId: "",
          tabs: b.codeTabs.map(function (ct) {
            return { label: ct.label, value: ct.label, blocks: [{ t: "code", code: ct.code, lang: ct.lang, title: "" }] };
          })
        });
      }
    }
    (b.responses || []).forEach(function (r) {
      var err = r.status >= 400;
      h += '<div class="ep-resp"><div class="ep-resp-head"><span class="ep-status' + (err ? " err" : "") + '">' +
        esc(String(r.status)) + "</span><span>" + esc(r.statusText || "") + "</span></div>" +
        renderCode({ code: r.body, lang: r.lang || "json", title: "" }) + "</div>";
    });
    h += "</div></article>";
    return h;
  }

  function renderBlock(b) {
    if (!b || typeof b !== "object") return "";
    switch (b.t) {
      case "tldr":
        return '<aside class="tldr"><span class="tldr-tag">En deux mots</span>' + (b.html || "") + "</aside>";
      case "p": return "<p>" + (b.html || "") + "</p>";
      case "h2": case "h3": case "h4": case "h5": case "h6":
        return "<" + b.t + (b.id ? ' id="' + esc(b.id) + '"' : "") + ">" + esc(b.text || "") + "</" + b.t + ">";
      case "img": {
        var src = resolveImg(b.light || b.dark || "");
        if (!src) return "";
        return '<figure class="fig"><img loading="lazy" src="' + esc(src) + '" alt="' + esc(b.alt || "") + '">' +
          (b.caption ? "<figcaption>" + b.caption + "</figcaption>" : "") + "</figure>";
      }
      case "ul":
        return "<ul" + (b.loose ? ' class="loose"' : "") + ">" + renderItems(b.items) + "</ul>";
      case "ol":
        return "<ol" + (b.start && b.start !== 1 ? ' start="' + (+b.start || 1) + '"' : "") + ">" + renderItems(b.items) + "</ol>";
      case "table": {
        var al = b.align || [];
        var h = '<div class="tablewrap"><table>';
        if (b.head && b.head.length) {
          h += "<thead><tr>" + b.head.map(function (c, i) {
            return "<th" + (al[i] && al[i] !== "left" ? ' data-al="' + esc(al[i]) + '"' : "") + ">" + c + "</th>";
          }).join("") + "</tr></thead>";
        }
        h += "<tbody>" + (b.rows || []).map(function (row) {
          return "<tr>" + row.map(function (c, i) {
            return "<td" + (al[i] && al[i] !== "left" ? ' data-al="' + esc(al[i]) + '"' : "") + ">" + c + "</td>";
          }).join("") + "</tr>";
        }).join("") + "</tbody></table></div>";
        return h;
      }
      case "admonition": {
        var meta = ADM[b.kind] || ["✦", b.kind];
        return '<aside class="adm adm-' + esc(b.kind) + '"><div class="adm-head"><span aria-hidden="true">' +
          meta[0] + "</span>" + esc(b.title || meta[1]) + "</div>" + renderBlocks(b.blocks || []) + "</aside>";
      }
      case "tabs": return renderTabs(b);
      case "code": return renderCode(b);
      case "cards":
        return '<div class="cardgrid">' + (b.items || []).map(function (c) {
          return '<a class="card" href="' + esc(c.link || "#") + '"><span class="c-icon">' + esc(c.icon || "") +
            '</span><div class="c-title">' + esc(c.title || "") + '</div><div class="c-desc">' + (c.desc || "") + "</div></a>";
        }).join("") + "</div>";
      case "badge":
        return '<span class="badge badge-' + esc(b.kind || "version") + '"' +
          (b.tooltip ? ' title="' + esc(b.tooltip) + '"' : "") + ">" + esc(b.label || "") + "</span>";
      case "details":
        return "<details" + (b.id ? ' id="' + esc(b.id) + '"' : "") + "><summary>" + (b.summary || "Détails") +
          "</summary>" + renderBlocks(b.blocks || []) + "</details>";
      case "endpoint": return renderEndpoint(b);
      case "columns":
        return '<div class="cols">' + (b.cols || []).map(function (col) {
          return '<div class="col">' + renderBlocks(col) + "</div>";
        }).join("") + "</div>";
      case "hr": return "<hr>";
      default: return "";
    }
  }
  function renderBlocks(blocks) {
    return (blocks || []).map(renderBlock).join("");
  }

  /* ---------------- reading view (the compartment) ---------------- */
  function viewPage(slug, anchor) {
    var page = D.content.pages[slug];
    var m = META[slug];
    setActiveNav("");
    document.title = m.label + " · La Gare de Nuit";

    var prevSlug = m.idx > 0 ? ORDER[m.idx - 1] : null;
    var nextSlug = m.idx < ORDER.length - 1 ? ORDER[m.idx + 1] : null;
    var pv = m.prov;
    var crew = (pv.authors || []).filter(function (a) { return a !== pv.topAuthor; });

    var kicker = '<div class="dest-kicker">' +
      '<span class="k-voie">Voie ' + m.voie + "</span>" +
      "<span>Train " + m.train + "</span><span>Départ " + m.time + "</span>" +
      "<span>" + esc(page.section) + "</span>" +
      (m.night ? "<span>☾ train de nuit</span>" : "") +
      (m.siding ? "<span>voie de garage</span>" : "") +
      (m.late ? "<span>retardé</span>" : "") +
      "</div>";

    var plaque = '<div class="plaque"><h3>Voiture ' + m.train + "</h3>" +
      '<div class="cond">Conducteur · ' + esc(pv.topAuthor || "inconnu") + "</div>" +
      (crew.length ? '<div class="crew">Équipage : ' + esc(crew.join(", ")) + "</div>" : "") +
      "<dl>" +
      "<dt>En service depuis</dt><dd>" + esc(pv.first || "?") + "</dd>" +
      "<dt>Dernier entretien</dt><dd>" + esc(pv.last || "?") + "</dd>" +
      "<dt>Arrêts d’entretien</dt><dd>" + (pv.commits || 0) + " commits</dd>" +
      "<dt>Longueur</dt><dd>" + m.words + " mots</dd>" +
      "<dt>Correspondances</dt><dd>" + m.inb + " entrantes · " + m.out + " sortantes</dd>" +
      (m.night ? "<dt>Éditions de nuit</dt><dd>" + pv.night + "</dd>" : "") +
      "</dl></div>";

    var navHtml = '<nav class="voiture-nav">' +
      (prevSlug ? '<a href="#' + esc(prevSlug) + '"><span class="vn-label">◀ voiture précédente</span>' +
        esc(META[prevSlug].label) + "</a>" : "<span></span>") +
      (nextSlug ? '<a href="#' + esc(nextSlug) + '" style="text-align:right"><span class="vn-label">voiture suivante ▶</span>' +
        esc(META[nextSlug].label) + "</a>" : "<span></span>") + "</nav>";

    app.innerHTML =
      '<div class="compartment">' +
      '<div class="comp-rail">' +
      '<div class="train-window" aria-hidden="true"><div class="passing"></div><div class="reflet"></div></div>' +
      plaque +
      '<div class="comp-links">' +
      '<a href="#/gare">■ Tableau des départs</a>' +
      '<a href="#/quai/' + m.voie + '">■ Voie ' + m.voie + " · " + esc(page.section) + "</a>" +
      '<a href="#/legende">■ Légende</a>' +
      '<span style="color:#6f7891">Grande ligne : voiture ' + (m.idx + 1) + "/" + ORDER.length + "</span>" +
      "</div></div>" +
      '<article class="paper"><header class="dest-head">' + kicker +
      "<h1>" + esc(stripTitle(page.title)) + "</h1>" +
      (page.description ? '<p class="dest-desc">' + esc(page.description) + "</p>" : "") +
      "</header>" +
      renderBlocks(page.blocks) +
      navHtml +
      "</article></div>";

    if (anchor) {
      var el = document.getElementById(anchor);
      if (el) el.scrollIntoView();
      else window.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }

  /* ---------------- legend ---------------- */
  function viewLegende() {
    setActiveNav("legende");
    document.title = "La Gare de Nuit · Légende";
    var nSiding = Object.keys(SIDING).length;
    var nLate = Object.keys(LATE).length;
    app.innerHTML = '<div class="legend">' +
      "<h1>LÉGENDE, EN MOTS SIMPLES</h1>" +
      "<p>Cette gare est la documentation de Strapi. Chaque page est un train de nuit. Rien ici n’est inventé : tout est mesuré dans le contenu réel des " + ORDER.length + " pages, leur historique git et le graphe de leurs liens.</p>" +
      "<h2>L’heure de départ</h2><p>Calculée une fois pour toutes à partir de la date du premier commit de la page : cette date fixe le créneau d’une demi-heure, et les voitures entrées en service le même jour s’y répartissent. Elle ne changera plus.</p>" +
      "<h2>La destination</h2><p>Le titre de la page. Cliquez une ligne du tableau (ou une porte de voiture) pour monter à bord et lire la page entière.</p>" +
      "<h2>La voie</h2><p>La section de la documentation. Il y a " + PLATFORMS.length + " voies, une par section du sommaire.</p>" +
      "<h2>Le numéro de train</h2><p>Dérivé de l’adresse de la page, stable pour toujours.</p>" +
      "<h2>« Retardé »</h2><p>Une page sans retouche depuis plus d’un an. Ce soir : " + nLate + ". Aucun train n’est jamais « supprimé » : cette gare est gentille, les " + ORDER.length + " destinations restent desservies.</p>" +
      "<h2>Le train de nuit</h2><p>" + NIGHT_SLUGS.length + " pages ont réellement été modifiées en pleine nuit (d’après l’horodatage des commits). Ce sont les seules voitures dont les fenêtres s’allument après 21 h, heure de votre horloge.</p>" +
      "<h2>La voie de garage</h2><p>" + nSiding + " pages qu’aucune autre page ne cite (graphe de " + D.graph.edges.length + " citations). Lumières éteintes, mais toujours visitables ; le chef de gare leur laisse une lampe.</p>" +
      "<h2>La longueur des voitures</h2><p>Proportionnelle au nombre de mots de la page (de " +
      Math.min.apply(null, ORDER.map(function (s) { return META[s].words; })) + " à " +
      Math.max.apply(null, ORDER.map(function (s) { return META[s].words; })) + " mots).</p>" +
      "<h2>Le conducteur et l’équipage</h2><p>Sur la plaque de chaque voiture : l’auteur principal réel de la page, l’équipage complet, et « en service depuis » la date du premier commit. " + HANDS + " mains ont entretenu cette gare.</p>" +
      "<h2>La grande ligne</h2><p>Le schéma au-dessus du tableau suit l’ordre de lecture officiel de la documentation ; « voiture précédente / suivante » au bas de chaque page le suit aussi.</p>" +
      '<p class="src">Sources : contenu des pages (content.json), graphe des citations (graph.json), historique git réel — auteurs, dates, éditions nocturnes (provenance.json).</p>' +
      "</div>";
  }

  function viewLost(slug) {
    setActiveNav("");
    document.title = "Voie sans issue · La Gare de Nuit";
    app.innerHTML = '<div class="lost"><h1>VOIE SANS ISSUE</h1>' +
      "<p>Aucun train ne dessert « " + esc(slug) + " » cette nuit.</p>" +
      '<p><a href="#/gare">Retourner au tableau des départs</a></p></div>';
  }

  /* ---------------- router ---------------- */
  function route() {
    var h = location.hash || "";
    if (!h || h === "#" || h === "#/") { location.replace("#/cms/intro"); return; }
    if (h.charAt(1) !== "/") { return; } // plain in-page anchor, leave alone
    var rest = h.slice(1);
    var anchor = "";
    var ix = rest.indexOf("#");
    if (ix !== -1) { anchor = rest.slice(ix + 1); rest = rest.slice(0, ix); }

    if (rest === "/gare") return viewHall();
    if (rest === "/quais") return viewQuais(null);
    var mq = rest.match(/^\/quai\/(\d+|garage)$/);
    if (mq) return viewQuais(mq[1]);
    if (rest === "/legende") return viewLegende();
    if (D.content.pages[rest]) return viewPage(rest, anchor);
    return viewLost(rest);
  }

  /* ---------------- global interactions ---------------- */
  document.addEventListener("click", function (e) {
    // board rows and carriages
    var row = e.target.closest && e.target.closest(".brow, .carriage");
    if (row && row.dataset.slug) { location.hash = "#" + row.dataset.slug; return; }
    // tabs
    var btn = e.target.closest && e.target.closest(".tab-btn");
    if (btn) {
      var uid = btn.dataset.uid, idx = btn.dataset.idx;
      var tabsEl = btn.closest(".tabs");
      var gid = tabsEl.dataset.group;
      var val = btn.dataset.value;
      function activate(container, index) {
        container.querySelectorAll('.tab-btn[data-uid="' + container.dataset.uid + '"]').forEach(function (bb) {
          bb.setAttribute("aria-selected", bb.dataset.idx === String(index));
        });
        container.querySelectorAll('.tab-panel[data-uid="' + container.dataset.uid + '"]').forEach(function (pp) {
          if (pp.dataset.idx === String(index)) pp.removeAttribute("hidden");
          else pp.setAttribute("hidden", "");
        });
      }
      activate(tabsEl, idx);
      if (gid) {
        tabChoice[gid] = val;
        document.querySelectorAll('.tabs[data-group="' + gid + '"]').forEach(function (other) {
          if (other === tabsEl) return;
          var match = other.querySelector('.tab-btn[data-value="' + val + '"]');
          if (match) activate(other, match.dataset.idx);
        });
      }
      return;
    }
    // in-page anchors (href="#some-id", not "#/route")
    var a = e.target.closest && e.target.closest("a[href]");
    if (a) {
      var href = a.getAttribute("href");
      if (href && href.charAt(0) === "#" && href.charAt(1) !== "/") {
        e.preventDefault();
        var el = document.getElementById(href.slice(1));
        if (el) el.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
      }
    }
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("brow")) {
      e.preventDefault();
      location.hash = "#" + e.target.dataset.slug;
    }
  });

  /* ---------------- search ---------------- */
  function initSearch() {
    var input = document.getElementById("search");
    var box = document.getElementById("search-results");
    var sel = -1, current = [];
    function hide() { box.hidden = true; sel = -1; }
    function show() { box.hidden = false; }
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
        box.innerHTML = '<div class="sr-empty">Aucune destination à ce nom cette nuit.</div>';
      } else {
        box.innerHTML = current.map(function (slug, i) {
          var m = META[slug];
          return '<button class="sr-item' + (i === sel ? " sel" : "") + '" data-slug="' + esc(slug) + '">' +
            '<span class="sr-dest">' + esc(m.label) + "</span>" +
            '<span class="sr-meta">Voie ' + m.voie + " · départ " + m.time + " · " +
            esc(D.content.pages[slug].section) + "</span></button>";
        }).join("");
      }
      show();
    }
    input.addEventListener("input", function () { sel = -1; run(input.value); });
    input.addEventListener("focus", function () { if (input.value.trim()) run(input.value); });
    input.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, current.length - 1); run(input.value); markSel(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); run(input.value); markSel(); }
      else if (e.key === "Enter") {
        e.preventDefault();
        var target = current[sel >= 0 ? sel : 0];
        if (target) { location.hash = "#" + target; hide(); input.blur(); }
      } else if (e.key === "Escape") { hide(); }
    });
    function markSel() {
      box.querySelectorAll(".sr-item").forEach(function (b, i) { b.classList.toggle("sel", i === sel); });
    }
    box.addEventListener("mousedown", function (e) {
      var b = e.target.closest(".sr-item");
      if (b) { e.preventDefault(); location.hash = "#" + b.dataset.slug; hide(); input.blur(); }
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".searchbox")) hide();
    });
  }

  /* ---------------- clock ---------------- */
  function initClock() {
    var ticks = document.getElementById("clock-ticks");
    var parts = [];
    for (var i = 0; i < 12; i++) {
      var a = i * Math.PI / 6;
      var x1 = 30 + Math.sin(a) * 24, y1 = 30 - Math.cos(a) * 24;
      var x2 = 30 + Math.sin(a) * 27, y2 = 30 - Math.cos(a) * 27;
      parts.push('<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>');
    }
    ticks.innerHTML = parts.join("");
    var hh = document.getElementById("hand-h");
    var mm = document.getElementById("hand-m");
    var digits = document.getElementById("clock-digits");
    function tick() {
      var d = new Date();
      var ha = (d.getHours() % 12 + d.getMinutes() / 60) * 30;
      var ma = d.getMinutes() * 6;
      hh.setAttribute("transform", "rotate(" + ha + " 30 30)");
      mm.setAttribute("transform", "rotate(" + ma + " 30 30)");
      digits.textContent = pad2(d.getHours()) + ":" + pad2(d.getMinutes());
    }
    tick();
    setInterval(tick, 10000);
  }

  /* ---------------- footer facts ---------------- */
  function initFooter() {
    var f = document.getElementById("foot-facts");
    f.innerHTML = ORDER.length + " départs · " + PLATFORMS.length + " voies · " +
      HANDS + " mains ont entretenu cette gare · " + NIGHT_SLUGS.length +
      " voitures s’allument la nuit · " + Object.keys(SIDING).length +
      " voitures sur la voie de garage, aucune supprimée — chiffres relevés dans l’historique git et le graphe des " +
      D.graph.edges.length + " citations de la documentation Strapi.";
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
    initClock();
    initFooter();
    window.addEventListener("hashchange", route);
    route();
  }).catch(function (err) {
    app.innerHTML = '<div class="lost"><h1>PANNE DE COURANT</h1><p>' + esc(err && err.message) + "</p></div>";
  });
})();
