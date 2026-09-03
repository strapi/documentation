/* ================== THE NIGHT RADIO ==================
   The Strapi documentation as a shortwave receiver at night.
   290 stations in reading order, signal strength = inbound citations,
   operators and dates from real git history. Nothing invented. */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var D = { content: null, graph: null, prov: null, comm: null };
  var ORDER = [];
  var META = {};
  var BANDS = [];          // nav groups (18)
  var SEGMENTS = [];       // contiguous runs of one band along the dial
  var IN_LIST = {}, OUT_LIST = {};
  var SEARCH_INDEX = [];
  var HANDS = 0, NIGHT_COUNT = 0, UNLISTED = [];
  var MAX_INB = 1;
  var F_LO = 5.9, F_HI = 26.1;

  /* dial state */
  var pos = 0;             // fractional station index
  var vel = 0;             // stations per ms
  var dragging = false;
  var lockedIdx = -1;      // station the receiver is locked on
  var currentSlug = null;  // page currently rendered in the programme
  var scrollNext = false;
  var visited = {};

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
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function stripTitle(t) {
    return String(t || "").replace(/\s*[-|·]\s*Strapi.*$/i, "").trim() || String(t || "");
  }
  function resolveImg(p) { return p && p.charAt(0) === "/" ? p.slice(1) : p; }
  function freqOf(idx) { return F_LO + (idx / Math.max(1, ORDER.length - 1)) * (F_HI - F_LO); }
  function fmtFreq(idx) { return freqOf(idx).toFixed(2) + " MHz"; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* ---------------- derivations ---------------- */
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
      BANDS.push({
        num: i + 1,
        label: grp.label + (grp.product === "cloud" ? " (Cloud)" : ""),
        product: grp.product, slugs: slugs
      });
    });

    g.edges.forEach(function (e) {
      (OUT_LIST[e[0]] = OUT_LIST[e[0]] || []).push(e[1]);
      (IN_LIST[e[1]] = IN_LIST[e[1]] || []).push(e[0]);
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
      var band = null;
      for (var i = 0; i < BANDS.length; i++) {
        if (BANDS[i].slugs.indexOf(slug) !== -1) { band = BANDS[i]; break; }
      }
      var inb = IN_LIST[slug] ? IN_LIST[slug].length : 0;
      if (inb > MAX_INB) MAX_INB = inb;
      META[slug] = {
        idx: idx, band: band,
        label: page.sidebarLabel || stripTitle(page.title),
        inb: inb, out: OUT_LIST[slug] ? OUT_LIST[slug].length : 0,
        words: g.words[slug] || 0, code: g.code[slug] || 0,
        night: (pv.night || 0) > 0, unlisted: inb === 0,
        prov: pv
      };
      if (inb === 0) UNLISTED.push(slug);
    });

    // contiguous band segments along the dial
    var cur = null;
    ORDER.forEach(function (slug, idx) {
      var b = META[slug].band;
      if (!cur || cur.band !== b) { cur = { band: b, from: idx, to: idx }; SEGMENTS.push(cur); }
      else cur.to = idx;
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

  /* ================== CANVASES ================== */
  var dial = null, dctx = null, spec = null, sctx = null;
  var DPR = 1;

  function sizeCanvases() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    var dw = dial.clientWidth, dh = 196;
    dial.width = Math.round(dw * DPR); dial.height = Math.round(dh * DPR);
    dctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var sw = spec.clientWidth, sh = 46;
    spec.width = Math.round(sw * DPR); spec.height = Math.round(sh * DPR);
    sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  var PPS = 56; // pixels per station on the glass

  function drawDial() {
    var W = dial.clientWidth, H = 196;
    var g = dctx;
    g.clearRect(0, 0, W, H);

    // backlit glass
    var grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1d130b");
    grad.addColorStop(0.45, "#241811");
    grad.addColorStop(1, "#170f08");
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    var lamp = g.createRadialGradient(W / 2, H * 0.62, 10, W / 2, H * 0.62, W * 0.55);
    lamp.addColorStop(0, "rgba(255,178,84,0.12)");
    lamp.addColorStop(1, "rgba(255,178,84,0)");
    g.fillStyle = lamp;
    g.fillRect(0, 0, W, H);

    var cx = W / 2;
    var baseY = 128;

    // band segments printed on the glass
    g.textBaseline = "alphabetic";
    SEGMENTS.forEach(function (seg) {
      var x1 = cx + (seg.from - 0.5 - pos) * PPS;
      var x2 = cx + (seg.to + 0.5 - pos) * PPS;
      if (x2 < -40 || x1 > W + 40) return;
      g.fillStyle = "rgba(255,178,84,0.05)";
      g.fillRect(x1, 20, x2 - x1, H - 40);
      g.strokeStyle = "rgba(255,178,84,0.18)";
      g.beginPath(); g.moveTo(x1, 20); g.lineTo(x1, H - 20); g.stroke();
      var label = "BAND " + seg.band.num + " · " + seg.band.label.toUpperCase();
      g.font = "600 10px Jura, 'Trebuchet MS', sans-serif";
      var tw = g.measureText(label).width;
      if (x2 - x1 > tw + 18) {
        g.fillStyle = "rgba(255,207,138,0.55)";
        g.fillText(label, Math.max(x1 + 9, Math.min(cx - tw / 2, x2 - tw - 9)), 33);
      }
    });

    // frequency rule
    g.strokeStyle = "rgba(200,179,145,0.35)";
    g.beginPath(); g.moveTo(0, baseY); g.lineTo(W, baseY); g.stroke();

    var first = Math.max(0, Math.floor(pos - (cx / PPS) - 1));
    var last = Math.min(ORDER.length - 1, Math.ceil(pos + (cx / PPS) + 1));
    var nearest = clamp(Math.round(pos), 0, ORDER.length - 1);

    for (var i = first; i <= last; i++) {
      var slug = ORDER[i];
      var m = META[slug];
      var x = cx + (i - pos) * PPS;
      var frac = Math.sqrt(m.inb / MAX_INB);
      var h = m.unlisted ? 10 : 16 + 64 * frac;
      var col;
      if (m.unlisted) col = "rgba(150,128,95,0.5)";
      else if (m.night) col = "rgba(174,196,245,0.85)";
      else col = "rgba(255,178,84," + (0.45 + 0.5 * frac) + ")";
      g.strokeStyle = col;
      g.lineWidth = m.inb >= 20 ? 2.5 : 1.4;
      g.beginPath(); g.moveTo(x, baseY); g.lineTo(x, baseY - h); g.stroke();
      g.lineWidth = 1;

      // frequency printed under major carriers
      if (i % 10 === 0) {
        g.font = "600 8.5px Jura, 'Trebuchet MS', sans-serif";
        g.fillStyle = "rgba(150,128,95,0.8)";
        var ft = freqOf(i).toFixed(1);
        g.fillText(ft, x - g.measureText(ft).width / 2, baseY + 14);
      }

      // station names resolve out of the static as the needle approaches
      var dist = Math.abs(i - pos);
      if (dist < 2.6) {
        var clarity = clamp(1 - dist / 2.6, 0, 1);
        var name = m.label.toUpperCase();
        g.font = (i === nearest ? "700 " : "600 ") + "10.5px Jura, 'Trebuchet MS', sans-serif";
        var nw = g.measureText(name).width;
        var ny = baseY + 32 + (i % 2) * 13;
        if (REDUCED || clarity > 0.92) {
          g.fillStyle = "rgba(242,230,207," + (0.25 + 0.75 * clarity) + ")";
          g.fillText(name, x - nw / 2, ny);
        } else {
          // scrambled by static: per-character jitter shrinking with clarity
          var amp = (1 - clarity) * 3.2;
          var sx = x - nw / 2;
          g.fillStyle = "rgba(242,230,207," + (0.18 + 0.72 * clarity) + ")";
          for (var ci = 0; ci < name.length; ci++) {
            var ch = name[ci];
            var jseed = hashCode(slug + ci + Math.floor(pos * 23));
            var jx = ((jseed % 7) - 3) * amp * 0.4;
            var jy = (((jseed >> 3) % 7) - 3) * amp * 0.5;
            g.fillText(ch, sx + jx, ny + jy);
            sx += g.measureText(ch).width;
          }
        }
        if (m.unlisted && clarity > 0.5) {
          g.font = "600 8px Jura, 'Trebuchet MS', sans-serif";
          g.fillStyle = "rgba(139,233,154," + (0.6 * clarity) + ")";
          var ut = "UNLISTED";
          g.fillText(ut, x - g.measureText(ut).width / 2, ny + 12);
        }
      }
    }

    // needle
    g.strokeStyle = "rgba(224,83,58,0.95)";
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(cx, 12); g.lineTo(cx, H - 12); g.stroke();
    g.lineWidth = 6;
    g.strokeStyle = "rgba(224,83,58,0.12)";
    g.beginPath(); g.moveTo(cx, 12); g.lineTo(cx, H - 12); g.stroke();
    g.lineWidth = 1;
  }

  function drawSpectrum() {
    var W = spec.clientWidth, H = 46;
    sctx.clearRect(0, 0, W, H);
    var padX = 8;
    var span = W - padX * 2;
    for (var i = 0; i < ORDER.length; i++) {
      var m = META[ORDER[i]];
      var x = padX + (i / (ORDER.length - 1)) * span;
      var h = 4 + Math.sqrt(m.inb / MAX_INB) * 34;
      if (m.unlisted) h = 3;
      sctx.strokeStyle = i === lockedIdx ? "rgba(255,207,138,1)"
        : (m.unlisted ? "rgba(150,128,95,0.55)" : "rgba(255,178,84,0.5)");
      sctx.lineWidth = i === lockedIdx ? 2.2 : 1;
      sctx.beginPath();
      sctx.moveTo(x, H - 5);
      sctx.lineTo(x, H - 5 - h);
      sctx.stroke();
    }
    if (lockedIdx >= 0) {
      var mx = padX + (lockedIdx / (ORDER.length - 1)) * span;
      sctx.fillStyle = "rgba(255,207,138,0.95)";
      sctx.beginPath();
      sctx.moveTo(mx - 4, 2); sctx.lineTo(mx + 4, 2); sctx.lineTo(mx, 9);
      sctx.closePath(); sctx.fill();
    }
    sctx.lineWidth = 1;
  }

  /* ================== METERS ================== */
  function buildVuTicks() {
    var g = document.getElementById("vu-ticks");
    var parts = [];
    for (var t = 0; t <= 4; t++) {
      var a = (-55 + 27.5 * t) * Math.PI / 180;
      var x1 = 100 + Math.sin(a) * 74, y1 = 100 - Math.cos(a) * 74;
      var x2 = 100 + Math.sin(a) * 82, y2 = 100 - Math.cos(a) * 82;
      parts.push('<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) +
        '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>');
    }
    var aL = -55 * Math.PI / 180, aR = 55 * Math.PI / 180;
    parts.push('<text x="' + (100 + Math.sin(aL) * 62 - 3).toFixed(1) + '" y="' +
      (100 - Math.cos(aL) * 62 + 3).toFixed(1) + '">0</text>');
    parts.push('<text x="' + (100 + Math.sin(aR) * 62 - 6).toFixed(1) + '" y="' +
      (100 - Math.cos(aR) * 62 + 3).toFixed(1) + '">' + MAX_INB + "</text>");
    g.innerHTML = parts.join("");
  }

  function setVu(value, label) {
    var frac = clamp(value / MAX_INB, 0, 1);
    var ang = -55 + 110 * frac;
    document.getElementById("vu-needle-g").style.transform = "rotate(" + ang.toFixed(1) + "deg)";
    document.getElementById("vu-read").innerHTML = label;
  }

  function setEye(clarity) {
    // shadow wedge narrows as tuning sharpens
    var spread = (150 - 138 * clamp(clarity, 0, 1)) * Math.PI / 180;
    var a1 = -Math.PI / 2 - spread / 2, a2 = -Math.PI / 2 + spread / 2;
    var r = 19, cx = 22, cy = 22;
    var x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
    var x2 = cx + Math.cos(a2) * r, y2 = cy + Math.sin(a2) * r;
    document.getElementById("eye-shadow").setAttribute("d",
      "M" + cx + " " + cy + " L" + x1.toFixed(2) + " " + y1.toFixed(2) +
      " A" + r + " " + r + " 0 " + (spread > Math.PI ? 1 : 0) + " 1 " +
      x2.toFixed(2) + " " + y2.toFixed(2) + " Z");
  }

  function updateSeekUI() {
    var nearest = clamp(Math.round(pos), 0, ORDER.length - 1);
    var slug = ORDER[nearest];
    var m = META[slug];
    var dist = Math.abs(nearest - pos);
    var clarity = clamp(1 - dist / 0.5, 0, 1);
    var lamp = document.getElementById("lock-lamp");
    var locked = lockedIdx === nearest && dist < 0.02;
    lamp.classList.toggle("locked", locked);
    document.getElementById("lock-text").textContent = locked ? "LOCK" : "SEEK";
    document.getElementById("readout-band").textContent =
      m.band ? "BAND " + m.band.num + " · " + m.band.label.toUpperCase() : "—";
    var nameEl = document.getElementById("readout-name");
    nameEl.textContent = m.label;
    nameEl.style.opacity = String(0.35 + 0.65 * clarity);
    document.getElementById("readout-meta").textContent =
      "STATION " + (nearest + 1) + "/" + ORDER.length + " · " + fmtFreq(nearest).toUpperCase() +
      " · SIGNAL " + m.inb;
    if (!locked) {
      setVu(m.inb * clarity, Math.round(m.inb * clarity) + " · SEEKING");
      setEye(clarity * 0.6);
    }
  }

  /* ================== LOG BOOK + SESSION LOG ================== */
  function renderLogcard(slug) {
    var m = META[slug], pv = m.prov;
    var ops = (pv.authors || []);
    var html =
      '<div class="lc-callsign">LOG BOOK · STATION ' + (m.idx + 1) + " OF " + ORDER.length +
      " · " + fmtFreq(m.idx).toUpperCase() + "</div>" +
      '<div class="lc-title">' + esc(m.label) + "</div>" +
      '<div class="lc-line lc-ops"><b>Operators</b> ' + (ops.length ? esc(ops.join(", ")) : "none on record") +
      (pv.topAuthor ? " · <b>chief operator</b> " + esc(pv.topAuthor) : "") + "</div>" +
      '<div class="lc-line"><b>First broadcast</b> ' + esc(pv.first || "?") +
      " · <b>Last transmission</b> " + esc(pv.last || "?") + "</div>" +
      '<div class="lc-line"><b>On the air</b> ' + num(pv.careDays || 0) + " days · <b>Log entries</b> " +
      (pv.commits || 0) + " commits</div>" +
      '<div class="lc-line"><b>Signal</b> ' + m.inb + " inbound · <b>reaches</b> " + m.out +
      " station" + (m.out === 1 ? "" : "s") + " · <b>" + num(m.words) + "</b> words</div>";
    if (m.night) {
      html += '<span class="lc-night">☾ HEARD ONLY AFTER 22:00 · ' + pv.night +
        " night edit" + (pv.night === 1 ? "" : "s") + " in the log</span> ";
    }
    if (m.unlisted) {
      html += '<span class="lc-silent">UNLISTED FREQUENCY · STILL BROADCASTING</span>';
    }
    document.getElementById("logcard").innerHTML = html;
  }

  function logSession(slug) {
    var list = document.getElementById("slog-list");
    var empty = list.querySelector(".slog-empty");
    if (empty) empty.parentNode ? list.innerHTML = "" : null;
    var m = META[slug];
    var d = new Date();
    var li = document.createElement("li");
    li.innerHTML = '<span class="slog-time">' + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) +
      '</span> <span class="slog-name">' + esc(m.label) + "</span>" +
      (m.unlisted && !visited[slug] ? ' <span class="slog-note">first listener in a while</span>' : "");
    visited[slug] = true;
    list.insertBefore(li, list.firstChild);
    while (list.children.length > 40) list.removeChild(list.lastChild);
  }

  /* ================== BLOCK RENDERER ================== */
  var ADM = {
    tip: "TIP", note: "NOTE", info: "INFORMATION", caution: "CAUTION",
    warning: "WARNING", danger: "DANGER", strapi: "FROM THE STRAPI DESK",
    prerequisites: "BEFORE YOU START", callout: "BULLETIN"
  };
  var tabsUid = 0;
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
    return '<div class="codeblock"><div class="code-head"><span>' + esc(b.title || "transcript") +
      '</span><span class="code-lang">' + esc(b.lang || "") + "</span></div><pre><code>" +
      htmlLines.join("\n") + "</code></pre></div>";
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
    var uid = "tabs-" + (++tabsUid);
    var chosen = 0;
    if (gid && tabChoice[gid] != null) {
      b.tabs.forEach(function (tb, i) { if (tb.value === tabChoice[gid]) chosen = i; });
    }
    var bar = "", panels = "";
    b.tabs.forEach(function (tb, i) {
      var sel = i === chosen;
      bar += '<button type="button" role="tab" aria-selected="' + sel + '" data-uid="' + uid +
        '" data-idx="' + i + '" data-value="' + esc(tb.value || "") + '">' +
        esc(tb.label || tb.value || ("Channel " + (i + 1))) + "</button>";
      panels += '<div class="tab-pane" role="tabpanel" data-uid="' + uid + '" data-idx="' + i + '"' +
        (sel ? "" : " hidden") + '><div class="blocks">' + renderBlocks(tb.blocks || []) + "</div></div>";
    });
    return '<div class="tabs" data-group="' + esc(gid) + '" data-uid="' + uid +
      '"><div class="tab-bar" role="tablist">' + bar + "</div>" + panels + "</div>";
  }

  function renderEndpoint(b) {
    var chip = b.method ? "m-" + b.method : (b.kind === "js" ? "m-SVC" : "m-XCH");
    var chipTxt = b.method || (b.kind === "js" ? "SVC" : "XCH");
    var h = '<article class="endpoint"' + (b.id ? ' id="' + esc(b.id) + '"' : "") + ">";
    h += '<div class="ep-head"><span class="ep-chip ' + esc(chip) + '">' + esc(chipTxt) + "</span>";
    if (b.path) h += '<span class="ep-path">' + esc(b.path) + "</span>";
    h += "</div>";
    h += '<div class="ep-body">';
    if (b.title) h += '<h4 class="ep-title">' + esc(b.title) + "</h4>";
    if (b.description) h += '<div class="ep-desc">' + b.description + "</div>";
    if (b.params && b.params.length) {
      h += '<p class="ep-params-title">' + esc((b.paramTitle || "Parameters").toUpperCase()) + "</p>" +
        '<div class="tscroll"><table><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>';
      b.params.forEach(function (p) {
        h += "<tr><td><code>" + esc(p.name) + "</code> " +
          (p.required ? '<span class="ep-req">REQUIRED</span>' : '<span class="ep-opt">optional</span>') +
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
            return { label: ct.label, value: ct.label, blocks: [{ t: "code", code: ct.code, lang: ct.lang, title: ct.label }] };
          })
        });
      }
    }
    (b.responses || []).forEach(function (r) {
      var err = r.status >= 400;
      h += '<div class="resp-head"><span class="resp-status' + (err ? " err" : "") + '">' +
        esc(String(r.status)) + "</span><span>" + esc(r.statusText || "") + "</span></div>" +
        renderCode({ code: r.body, lang: r.lang || "json", title: "response" });
    });
    h += "</div></article>";
    return h;
  }

  function renderBlock(b) {
    if (!b || typeof b !== "object") return "";
    switch (b.t) {
      case "tldr":
        return '<aside class="tldr"><span class="tldr-tag">IN SHORT</span>' + (b.html || "") + "</aside>";
      case "p": return "<p>" + (b.html || "") + "</p>";
      case "h2": case "h3": case "h4": case "h5": case "h6":
        return "<" + b.t + (b.id ? ' id="' + esc(b.id) + '"' : "") + ">" + esc(b.text || "") + "</" + b.t + ">";
      case "img": {
        var src = resolveImg(b.light || b.dark || "");
        if (!src) return "";
        return '<figure class="shot"><img loading="lazy" src="' + esc(src) + '" alt="' + esc(b.alt || "") + '">' +
          (b.caption ? "<figcaption>" + b.caption + "</figcaption>" : "") + "</figure>";
      }
      case "ul": return "<ul>" + renderItems(b.items) + "</ul>";
      case "ol":
        return "<ol" + (b.start && b.start !== 1 ? ' start="' + (+b.start || 1) + '"' : "") + ">" +
          renderItems(b.items) + "</ol>";
      case "table": {
        var al = b.align || [];
        function alc(i) {
          return al[i] === "center" ? ' class="al-center"' : (al[i] === "right" ? ' class="al-right"' : "");
        }
        var h = '<div class="tscroll"><table>';
        if (b.head && b.head.length) {
          h += "<thead><tr>" + b.head.map(function (c, i) { return "<th" + alc(i) + ">" + c + "</th>"; }).join("") +
            "</tr></thead>";
        }
        h += "<tbody>" + (b.rows || []).map(function (row) {
          return "<tr>" + row.map(function (c, i) { return "<td" + alc(i) + ">" + c + "</td>"; }).join("") + "</tr>";
        }).join("") + "</tbody></table></div>";
        return h;
      }
      case "admonition": {
        var name = ADM[b.kind] || String(b.kind || "NOTE").toUpperCase();
        var custom = b.title && b.title.toLowerCase() !== String(b.kind).toLowerCase();
        return '<aside class="adm adm-' + esc(b.kind) + '"><span class="adm-tag">' + esc(name) +
          (custom ? " · " + esc(b.title) : "") + '</span><div class="blocks">' +
          renderBlocks(b.blocks || []) + "</div></aside>";
      }
      case "tabs": return renderTabs(b);
      case "code": return renderCode(b);
      case "cards":
        return '<div class="cards">' + (b.items || []).map(function (c) {
          return '<a class="card" href="' + esc(c.link || "#" + ORDER[0]) + '">' +
            (c.icon ? '<span class="card-icon">' + esc(c.icon) + "</span>" : "") +
            '<div class="card-title">' + esc(c.title || "") + '</div><div class="card-desc">' +
            (c.desc || "") + "</div></a>";
        }).join("") + "</div>";
      case "badge":
        return '<span class="badge b-' + esc(b.kind || "version") + '"' +
          (b.tooltip ? ' title="' + esc(b.tooltip) + '"' : "") + ">" + esc(b.label || "") + "</span>";
      case "details":
        return '<details class="fold"' + (b.id ? ' id="' + esc(b.id) + '"' : "") + "><summary>" +
          (b.summary || "More") + '</summary><div class="fold-body"><div class="blocks">' +
          renderBlocks(b.blocks || []) + "</div></div></details>";
      case "endpoint": return renderEndpoint(b);
      case "columns":
        return '<div class="cols" style="grid-template-columns:repeat(' + (b.cols || []).length + ',1fr)">' +
          (b.cols || []).map(function (col) {
            return '<div><div class="blocks">' + renderBlocks(col) + "</div></div>";
          }).join("") + "</div>";
      case "hr": return "<hr>";
      default: return "";
    }
  }
  function renderBlocks(blocks) { return (blocks || []).map(renderBlock).join(""); }

  /* ================== THE PROGRAMME ================== */
  function renderProgramme(slug) {
    var page = D.content.pages[slug];
    var m = META[slug], pv = m.prov;
    tabsUid = 0;
    var prevSlug = m.idx > 0 ? ORDER[m.idx - 1] : null;
    var nextSlug = m.idx < ORDER.length - 1 ? ORDER[m.idx + 1] : null;

    var chips =
      '<span class="stat-chip">' + num(m.words) + " WORDS</span>" +
      '<span class="stat-chip">' + m.inb + " INBOUND · " + m.out + " OUTBOUND</span>" +
      '<span class="stat-chip">' + m.code + " CODE BLOCK" + (m.code === 1 ? "" : "S") + "</span>" +
      '<span class="stat-chip">' + (pv.authors || []).length + " OPERATOR" +
      ((pv.authors || []).length === 1 ? "" : "S") + "</span>" +
      '<span class="stat-chip">ON AIR ' + num(pv.careDays || 0) + " DAYS</span>" +
      (m.night ? '<span class="stat-chip">☾ NIGHT SHIFT · ' + pv.night + " EDIT" +
        (pv.night === 1 ? "" : "S") + " AFTER 22:00</span>" : "") +
      (m.unlisted ? '<span class="stat-chip">UNLISTED · NO INBOUND CITATION</span>' : "");

    document.getElementById("prog").innerHTML =
      '<div class="prog-band"><span>' +
      (m.band ? "BAND " + m.band.num + " · " + esc(m.band.label.toUpperCase()) : "") +
      "</span><span>STATION " + (m.idx + 1) + " OF " + ORDER.length + " · " +
      fmtFreq(m.idx).toUpperCase() + "</span></div>" +
      '<h1 class="prog-title">' + esc(stripTitle(page.title)) + "</h1>" +
      (page.description ? '<p class="prog-desc">' + esc(page.description) + "</p>" : "") +
      '<div class="prog-stats">' + chips + "</div>" +
      '<nav class="prog-nav">' +
      (prevSlug ? '<button type="button" class="tune-btn" data-slug="' + esc(prevSlug) + '">◀ ' +
        esc(META[prevSlug].label) + "</button>" : '<button type="button" class="tune-btn" disabled>◀ START OF THE DIAL</button>') +
      (nextSlug ? '<button type="button" class="tune-btn" data-slug="' + esc(nextSlug) + '">' +
        esc(META[nextSlug].label) + " ▶</button>" : '<button type="button" class="tune-btn" disabled>END OF THE DIAL ▶</button>') +
      "</nav>" +
      '<hr class="prog-rule">' +
      '<div class="blocks">' + renderBlocks(page.blocks) + "</div>";
  }

  /* ================== TUNING ================== */
  var rafId = null, lastT = 0;

  function requestLoop() {
    if (rafId == null) {
      lastT = performance.now();
      rafId = requestAnimationFrame(step);
    }
  }

  function step(t) {
    rafId = null;
    var dt = Math.min(50, t - lastT);
    lastT = t;
    var busy = false;
    if (!dragging) {
      if (Math.abs(vel) > 0.00035) {
        pos += vel * dt;
        vel *= Math.pow(0.996, dt);
        if (pos < -0.4) { pos = -0.4; vel = 0; }
        if (pos > ORDER.length - 0.6) { pos = ORDER.length - 0.6; vel = 0; }
        busy = true;
      } else {
        vel = 0;
        var target = clamp(Math.round(pos), 0, ORDER.length - 1);
        var d = target - pos;
        if (Math.abs(d) > 0.002) {
          pos += d * Math.min(1, dt * 0.011);
          busy = true;
        } else {
          pos = target;
          if (lockedIdx !== target) lockOn(target);
        }
      }
    } else busy = true;
    drawDial();
    updateSeekUI();
    audioUpdate();
    if (busy) requestLoop();
  }

  function lockOn(idx) {
    lockedIdx = idx;
    var slug = ORDER[idx];
    updateSeekUI();
    setVu(META[slug].inb, META[slug].inb + " INBOUND CITATION" + (META[slug].inb === 1 ? "" : "S"));
    setEye(1);
    drawSpectrum();
    if (currentSlug !== slug) {
      location.hash = "#" + slug;   // route() renders the programme
    }
  }

  function tuneTo(idx, instant) {
    idx = clamp(idx, 0, ORDER.length - 1);
    if (instant || REDUCED) {
      pos = idx; vel = 0;
      drawDial();
      if (lockedIdx !== idx) {
        lockedIdx = idx;
        setVu(META[ORDER[idx]].inb, META[ORDER[idx]].inb + " INBOUND CITATION" +
          (META[ORDER[idx]].inb === 1 ? "" : "S"));
        setEye(1);
        drawSpectrum();
        if (currentSlug !== ORDER[idx]) location.hash = "#" + ORDER[idx];
      }
      updateSeekUI();
    } else {
      lockedIdx = -1;
      var dist = idx - pos;
      vel = dist * 0.004; // glide toward it; friction and the detent finish the job
      if (Math.abs(dist) > 12) { pos = idx - (dist > 0 ? 12 : -12); vel = dist > 0 ? 0.02 : -0.02; }
      requestLoop();
    }
  }

  /* ---------------- dial input ---------------- */
  function initDial() {
    var lx = 0, lt = 0, lastDx = 0;
    dial.addEventListener("pointerdown", function (e) {
      dragging = true; lx = e.clientX; lt = performance.now(); lastDx = 0;
      vel = 0; lockedIdx = -1;
      dial.classList.add("dragging");
      try { dial.setPointerCapture(e.pointerId); } catch (err) { /* ok */ }
      requestLoop();
    });
    dial.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lx;
      lx = e.clientX;
      var now = performance.now();
      var dt = Math.max(8, now - lt);
      lt = now;
      pos = clamp(pos - dx / PPS, -0.4, ORDER.length - 0.6);
      lastDx = -dx / PPS / dt;
      requestLoop();
    });
    function release() {
      if (!dragging) return;
      dragging = false;
      dial.classList.remove("dragging");
      vel = REDUCED ? 0 : clamp(lastDx, -0.08, 0.08);
      if (REDUCED) { pos = clamp(Math.round(pos), 0, ORDER.length - 1); }
      requestLoop();
    }
    dial.addEventListener("pointerup", release);
    dial.addEventListener("pointercancel", release);

    dial.addEventListener("wheel", function (e) {
      e.preventDefault();
      lockedIdx = -1;
      if (REDUCED) {
        pos = clamp(Math.round(pos) + (e.deltaY > 0 ? 1 : -1), 0, ORDER.length - 1);
      } else {
        vel += (e.deltaY > 0 ? 1 : -1) * 0.006;
      }
      requestLoop();
    }, { passive: false });

    spec.addEventListener("click", function (e) {
      var r = spec.getBoundingClientRect();
      var frac = clamp((e.clientX - r.left - 8) / (r.width - 16), 0, 1);
      scrollNext = false;
      tuneTo(Math.round(frac * (ORDER.length - 1)), REDUCED);
      requestLoop();
    });

    document.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        var base = clamp(Math.round(pos), 0, ORDER.length - 1);
        tuneTo(base + (e.key === "ArrowRight" ? 1 : -1), true);
      } else if (e.key === "/") {
        e.preventDefault();
        openFinder();
      }
    });
  }

  /* ================== AUDIO (off by default) ================== */
  var audio = { on: false, ctx: null, noiseGain: null, osc: null, oscGain: null, ready: false };

  function ensureAudio() {
    if (audio.ready || audio.failed) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      var ctx = new AC();
      var len = ctx.sampleRate * 2;
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      var src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      var band = ctx.createBiquadFilter();
      band.type = "bandpass"; band.frequency.value = 1900; band.Q.value = 0.6;
      var nGain = ctx.createGain(); nGain.gain.value = 0;
      src.connect(band); band.connect(nGain); nGain.connect(ctx.destination);
      src.start();
      var osc = ctx.createOscillator();
      osc.type = "sine"; osc.frequency.value = 900;
      var oGain = ctx.createGain(); oGain.gain.value = 0;
      osc.connect(oGain); oGain.connect(ctx.destination);
      osc.start();
      audio.ctx = ctx; audio.noiseGain = nGain; audio.osc = osc; audio.oscGain = oGain;
      audio.ready = true;
    } catch (e) { audio.failed = true; }
  }

  function audioUpdate() {
    if (!audio.on || !audio.ready) return;
    try {
      var det = Math.abs(pos - Math.round(pos));
      var moving = dragging || Math.abs(vel) > 0.001;
      audio.noiseGain.gain.setTargetAtTime(
        0.006 + Math.min(0.05, det * 0.1) + (moving ? 0.012 : 0), audio.ctx.currentTime, 0.08);
      audio.osc.frequency.setTargetAtTime(500 + det * 2400 + Math.abs(vel) * 30000,
        audio.ctx.currentTime, 0.05);
      audio.oscGain.gain.setTargetAtTime(moving ? 0.008 : 0, audio.ctx.currentTime, 0.12);
    } catch (e) { /* keep silent */ }
  }

  function initAudioToggle() {
    var btn = document.getElementById("btn-audio");
    btn.addEventListener("click", function () {
      audio.on = !audio.on;
      if (audio.on) {
        ensureAudio();
        if (audio.failed) { audio.on = false; return; }
        if (audio.ctx && audio.ctx.state === "suspended") audio.ctx.resume();
      } else if (audio.ready) {
        try {
          audio.noiseGain.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.05);
          audio.oscGain.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.05);
        } catch (e) { /* already silent */ }
      }
      btn.setAttribute("aria-pressed", String(audio.on));
      btn.innerHTML = '<span class="spk-lamp" aria-hidden="true"></span> SPEAKER ' + (audio.on ? "ON" : "OFF");
    });
  }

  /* ================== OVERLAYS ================== */
  function overlay(id) { return document.getElementById(id); }
  function closeAll() {
    ["drawer", "finder", "keymodal"].forEach(function (id) { overlay(id).hidden = true; });
    overlay("scrim").hidden = true;
  }
  function openOverlay(id) {
    closeAll();
    overlay(id).hidden = false;
    overlay("scrim").hidden = false;
  }

  function buildBandPlan() {
    var html = "";
    BANDS.forEach(function (b) {
      var listed = b.slugs.filter(function (s) { return META[s] && !META[s].unlisted; });
      var unl = b.slugs.length - listed.length;
      html += '<details class="bp-section"' + (b.num === 1 ? " open" : "") + "><summary>" +
        '<span class="bp-code">BAND ' + b.num + "</span>" + esc(b.label.toUpperCase()) +
        " · " + listed.length + " printed" + (unl ? " · " + unl + " unlisted" : "") + "</summary>" +
        '<ul class="bp-list">';
      listed.forEach(function (s) {
        var m = META[s];
        html += '<li><a href="#' + esc(s) + '"' + (m.night ? ' class="bp-silent"' : "") + "><span>" +
          esc(m.label) + (m.night ? " ☾" : "") + '</span><span class="bp-sig">' +
          m.inb + " in · " + fmtFreq(m.idx) + "</span></a></li>";
      });
      html += "</ul></details>";
    });
    html += '<p class="bp-unlisted-note">' + UNLISTED.length + " frequencies on this dial are not printed " +
      "on the plan: no station cites them in the " + num(D.graph.edges.length) + "-citation ledger. " +
      "They are still broadcasting, every one of them. Sweep the dial or use the STATION FINDER; " +
      "the log book stamps them UNLISTED when you find one.</p>";
    document.getElementById("drawer-body").innerHTML = html;
  }

  function buildKey() {
    document.getElementById("key-body").innerHTML =
      "<p>This receiver is the real <b>Strapi documentation</b> (docs.strapi.io), dressed as a shortwave radio. " +
      "Every number on the set is measured from the documentation bundle and its git history. Nothing is invented.</p>" +
      "<h3>THE STATIONS</h3><p>" + ORDER.length + " stations, one per documentation page, placed on the dial " +
      "in the official reading order. The printed frequency is the station's position on that dial, nothing more. " +
      "Lock onto a station and the full page renders below, every word of it.</p>" +
      "<h3>THE BANDS</h3><p>The " + BANDS.length + " bands printed on the glass are the " + BANDS.length +
      " sections of the documentation sidebar.</p>" +
      "<h3>SIGNAL STRENGTH</h3><p>The height of a carrier line, and the VU needle, show how many other pages " +
      "cite that page: from 0 to " + MAX_INB + ", out of " + num(D.graph.edges.length) +
      " real citations. Hubs boom in; whispers need exact tuning.</p>" +
      "<h3>THE LOG BOOK</h3><p>Operators are the real people in the page's git history (" + HANDS +
      " across the whole service). First broadcast and last transmission are the page's first and latest commits; " +
      "“on the air” counts the days between them.</p>" +
      "<h3>THE NIGHT SHIFT</h3><p>" + NIGHT_COUNT + " pages carry commits time-stamped after 22:00. " +
      "The log book stamps them “heard only after 22:00”. A little poetry; the timestamps are real.</p>" +
      "<h3>UNLISTED FREQUENCIES</h3><p>" + UNLISTED.length + " pages receive no citation from any other page. " +
      "The printed band plan skips them, but they are still on the air, and the session log greets you as " +
      "“first listener in a while” when you tune one in.</p>" +
      "<h3>THE SPEAKER</h3><p>Off by default. Everything works silent; the switch only adds static and a " +
      "tuning whistle.</p>";
  }

  function initOverlays() {
    document.getElementById("btn-bandplan").addEventListener("click", function () { openOverlay("drawer"); });
    document.getElementById("btn-finder").addEventListener("click", openFinder);
    document.getElementById("btn-key").addEventListener("click", function () { openOverlay("keymodal"); });
    document.getElementById("key-link").addEventListener("click", function () { openOverlay("keymodal"); });
    document.getElementById("drawer-close").addEventListener("click", closeAll);
    document.getElementById("finder-close").addEventListener("click", closeAll);
    document.getElementById("key-close").addEventListener("click", closeAll);
    overlay("scrim").addEventListener("click", closeAll);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });
    document.getElementById("drawer-body").addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a[href]")) { scrollNext = false; closeAll(); }
    });
  }

  /* ---------------- finder ---------------- */
  var finderSel = -1, finderCurrent = [];
  function openFinder() {
    openOverlay("finder");
    var input = document.getElementById("finder-input");
    input.value = "";
    document.getElementById("finder-results").innerHTML =
      '<div class="fr-none">Type to search all ' + ORDER.length + " stations: names, tags, headings.</div>";
    input.focus();
  }
  function initFinder() {
    var input = document.getElementById("finder-input");
    var box = document.getElementById("finder-results");
    function run(q) {
      q = q.trim().toLowerCase();
      finderSel = -1;
      if (!q) {
        box.innerHTML = '<div class="fr-none">Type to search all ' + ORDER.length + " stations.</div>";
        return;
      }
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
      finderCurrent = scored.slice(0, 14).map(function (x) { return x[1]; });
      if (!finderCurrent.length) {
        box.innerHTML = '<div class="fr-none">Dead air. No station answers to that.</div>';
        return;
      }
      box.innerHTML = finderCurrent.map(function (slug, i) {
        var m = META[slug];
        return '<button type="button" class="fr-item' + (i === finderSel ? " sel" : "") +
          '" data-slug="' + esc(slug) + '"><div class="fr-title">' + esc(m.label) + "</div>" +
          '<div class="fr-sub">' + (m.band ? "BAND " + m.band.num + " · " + esc(m.band.label.toUpperCase()) : "") +
          " · " + fmtFreq(m.idx).toUpperCase() + " · SIGNAL " + m.inb +
          (m.unlisted ? " · UNLISTED" : "") + "</div></button>";
      }).join("");
    }
    input.addEventListener("input", function () { run(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); finderSel = Math.min(finderSel + 1, finderCurrent.length - 1); mark(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); finderSel = Math.max(finderSel - 1, 0); mark(); }
      else if (e.key === "Enter") {
        e.preventDefault();
        var slug = finderCurrent[finderSel >= 0 ? finderSel : 0];
        if (slug) { scrollNext = false; closeAll(); location.hash = "#" + slug; }
      }
    });
    function mark() {
      box.querySelectorAll(".fr-item").forEach(function (b, i) { b.classList.toggle("sel", i === finderSel); });
    }
    box.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest(".fr-item");
      if (b) { scrollNext = false; closeAll(); location.hash = "#" + b.dataset.slug; }
    });
  }

  /* ================== ROUTER ================== */
  function route() {
    var h = location.hash || "";
    if (!h || h === "#" || h === "#/") { location.replace("#" + ORDER[0]); return; }
    if (h.charAt(1) !== "/") return; // plain in-page anchor
    var rest = decodeURIComponent(h.slice(1));
    var anchor = "", ix = rest.indexOf("#");
    if (ix !== -1) { anchor = rest.slice(ix + 1); rest = rest.slice(0, ix); }

    var page = D.content.pages[rest];
    if (!page) {
      currentSlug = null;
      document.title = "Dead air · The Night Radio";
      document.getElementById("prog").innerHTML =
        '<div class="deadair"><div class="da-big">DEAD AIR</div>' +
        "<p>Nothing broadcasts at “" + esc(rest) + "”. All " + ORDER.length +
        ' stations are on the dial above, or in the <button type="button" class="linklike" id="da-finder">station finder</button>.</p></div>';
      var daf = document.getElementById("da-finder");
      if (daf) daf.addEventListener("click", openFinder);
      return;
    }

    var m = META[rest];
    var already = currentSlug === rest;
    currentSlug = rest;
    document.title = m.label + " · The Night Radio";

    // move the needle: content renders immediately, the needle glides if allowed
    if (lockedIdx !== m.idx) {
      var far = Math.abs(pos - m.idx) > 0.75;
      tuneTo(m.idx, REDUCED || !far ? true : false);
      if (lockedIdx !== m.idx) { pos = m.idx; vel = 0; lockedIdx = m.idx; drawDial(); updateSeekUI(); setEye(1); drawSpectrum(); }
      setVu(m.inb, m.inb + " INBOUND CITATION" + (m.inb === 1 ? "" : "S"));
    }
    if (!already) {
      renderLogcard(rest);
      renderProgramme(rest);
      logSession(rest);
    }
    if (anchor) {
      var t = document.getElementById(anchor);
      if (t) { t.scrollIntoView(); return; }
    }
    if (scrollNext) {
      scrollNext = false;
      var pw = document.querySelector(".programme-wrap");
      if (pw) pw.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
    }
  }

  /* ---------------- global interactions ---------------- */
  document.addEventListener("click", function (e) {
    var tune = e.target.closest && e.target.closest(".tune-btn[data-slug]");
    if (tune) { scrollNext = true; location.hash = "#" + tune.dataset.slug; return; }
    var btn = e.target.closest && e.target.closest(".tab-bar button");
    if (btn) {
      var tabsEl = btn.closest(".tabs");
      var gid = tabsEl.dataset.group, val = btn.dataset.value;
      function activate(container, index) {
        container.querySelectorAll('.tab-bar button[data-uid="' + container.dataset.uid + '"]').forEach(function (bb) {
          bb.setAttribute("aria-selected", bb.dataset.idx === String(index));
        });
        container.querySelectorAll('.tab-pane[data-uid="' + container.dataset.uid + '"]').forEach(function (pp) {
          if (pp.dataset.idx === String(index)) pp.removeAttribute("hidden");
          else pp.setAttribute("hidden", "");
        });
      }
      activate(tabsEl, btn.dataset.idx);
      if (gid) {
        tabChoice[gid] = val;
        document.querySelectorAll('.tabs[data-group="' + gid + '"]').forEach(function (other) {
          if (other === tabsEl) return;
          var match = other.querySelector('.tab-bar button[data-value="' + val + '"]');
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
      } else if (href && href.charAt(0) === "#" && href.charAt(1) === "/") {
        scrollNext = true;
      }
    }
  });

  /* ---------------- boot ---------------- */
  Promise.all([
    fetch("content.json").then(function (r) { return r.json(); }),
    fetch("graph.json").then(function (r) { return r.json(); }),
    fetch("provenance.json").then(function (r) { return r.json(); }),
    fetch("communities.json").then(function (r) { return r.json(); })
  ]).then(function (res) {
    D.content = res[0]; D.graph = res[1]; D.prov = res[2]; D.comm = res[3];
    deriveAll();
    dial = document.getElementById("dial");
    dctx = dial.getContext("2d");
    spec = document.getElementById("spectrum");
    sctx = spec.getContext("2d");
    sizeCanvases();
    buildVuTicks();
    buildBandPlan();
    buildKey();
    initDial();
    initAudioToggle();
    initOverlays();
    initFinder();
    document.getElementById("slog-list").innerHTML =
      '<li class="slog-empty">The log opens blank. Tune something in.</li>';
    window.addEventListener("resize", function () { sizeCanvases(); drawDial(); drawSpectrum(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { drawDial(); drawSpectrum(); });
    }
    window.addEventListener("hashchange", route);
    route();
    drawDial();
    drawSpectrum();
    updateSeekUI();
  }).catch(function (err) {
    document.getElementById("prog").innerHTML =
      '<div class="deadair"><div class="da-big">POWER FAILURE</div><p>' +
      esc(String(err && err.message || err)) + "</p></div>";
  });
})();
