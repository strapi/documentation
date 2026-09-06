/* ALPENGLOW, model.js
   Loads the five data files and derives the world model.
   Every visible fact in the game traces back to a field read here. */

'use strict';

const Model = {
  ready: null,
  pages: null, order: null, nav: null,
  graph: null, prov: null, tax: null,
  massifs: [], massifOf: {},
  out: {}, inb: {},
  uncited: [], nightPages: [],
  firstAscent: null,
  NOW: Date.now(),
};

/* Alpine grades from the published quantile formula:
   density = code blocks (graph.json code) + table count (content.json blocks),
   cuts 0 / 1 / 4 / 7 / 17 / 28 (legend in the Almanac). */
const GRADE_CUTS = [0, 1, 4, 7, 17, 28];
const GRADE_NAMES = ['F', 'PD', 'AD', 'D', 'TD', 'ED'];

/* --- deterministic seeded rng (same page, same wobble, forever) --- */
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rngFor(key) { return mulberry32(xmur3('alpenglow:' + key)()); }

function loadModel() {
  if (Model.ready) return Model.ready;
  Model.ready = Promise.all(
    ['content.json', 'graph.json', 'provenance.json', 'taxonomy.json']
      .map(f => fetch(f).then(r => r.json()))
  ).then(([content, graph, prov, tax]) => {
    Model.pages = content.pages;
    Model.order = content.order;
    Model.nav = content.nav;
    Model.graph = graph;
    Model.prov = prov;
    Model.tax = tax;

    // 16 massifs: product + section ONLY (taxonomy law), in content.json order
    const byKey = {};
    for (const slug of content.order) {
      const t = tax[slug];
      if (!t) continue;
      const key = t.product + '|' + t.section;
      let m = byKey[key];
      if (!m) {
        m = { key, product: t.product, section: t.section, slugs: [] };
        byKey[key] = m;
        Model.massifs.push(m);
      }
      m.slugs.push(slug);
      Model.massifOf[slug] = m;
    }
    Model.massifs.forEach(m => {
      m.label = m.product.toUpperCase() + ' · ' + m.section.toUpperCase();
      m.count = m.slugs.length;
    });

    // rope network (1,231 edges)
    for (const [s, t] of graph.edges) {
      (Model.out[s] = Model.out[s] || []).push(t);
      (Model.inb[t] = Model.inb[t] || []).push(s);
    }

    // the 50 open problems: inbound 0
    Model.uncited = content.order.filter(s => !(graph.inbound[s] > 0));

    // the 12 night ascents
    Model.nightPages = Object.entries(prov)
      .filter(([, v]) => v.night > 0)
      .map(([slug, v]) => ({ slug, night: v.night }))
      .sort((a, b) => b.night - a.night);

    // first ascent of the range
    let first = null;
    for (const [slug, v] of Object.entries(prov)) {
      if (!first || v.first < first.date) first = { slug, date: v.first };
    }
    Model.firstAscent = first;

    return Model;
  });
  return Model.ready;
}

/* ------- derived facts, one accessor per mapping ledger row ------- */

function heightOf(slug) { return Model.graph.words[slug] || 0; }

function tableCount(blocks) {
  let n = 0;
  (function walk(bs) {
    for (const b of bs || []) {
      if (b.t === 'table') n++;
      if (b.blocks) walk(b.blocks);
      if (b.tabs) b.tabs.forEach(t => walk(t.blocks));
      if (b.cols) b.cols.forEach(walk);
    }
  })(blocks);
  return n;
}

function densityOf(slug) {
  return (Model.graph.code[slug] || 0) + tableCount(Model.pages[slug].blocks);
}

function gradeOf(slug) {
  const d = densityOf(slug);
  let g = 0;
  for (let i = 0; i < GRADE_CUTS.length; i++) if (d >= GRADE_CUTS[i]) g = i;
  return GRADE_NAMES[g];
}

function daysSince(iso) { return (Model.NOW - new Date(iso + 'T12:00:00Z').getTime()) / 864e5; }

function freshState(slug) {
  const p = Model.prov[slug];
  if (!p) return 'normal';
  const d = daysSince(p.last);
  if (d <= 90) return 'alpenglow';
  if (d > 730) return 'frost';
  return 'normal';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return d + ' ' + MONTHS[m - 1] + ' ' + y;
}

/* the exact provenance line, verbatim fields */
function provLine(slug) {
  const p = Model.prov[slug];
  if (!p) return '';
  return 'Route opened <b>' + fmtDate(p.first) + '</b> by <b>' + p.topAuthor + '</b>'
    + ' · ' + p.commits + ' ascent' + (p.commits === 1 ? '' : 's')
    + ' · ' + p.authors.length + ' signature' + (p.authors.length === 1 ? '' : 's')
    + ' · last signed <b>' + fmtDate(p.last) + '</b>'
    + ' · maintained ' + p.careDays + ' days';
}

function pitchesOf(slug) {
  const pg = Model.pages[slug];
  const h2s = pg.headings.filter(h => h.level === 2);
  if (h2s.length === 0) {
    return [{ name: pg.title, id: '', crux: densityOf(slug) > 0, boulder: true }];
  }
  // crux pitch: the h2 span contains code blocks
  const pitches = [];
  let hi = -1, cur = null;
  const spans = [];
  for (const b of pg.blocks) {
    if (b.t === 'h2') { cur = { id: b.id, code: 0 }; spans.push(cur); }
    else if (cur && (b.t === 'code' || (b.t === 'tabs' && JSON.stringify(b).indexOf('"code"') !== -1))) cur.code++;
  }
  for (const h of h2s) {
    const span = spans.find(s => s.id === h.id);
    pitches.push({ name: h.text, id: h.id, crux: !!(span && span.code > 0), boulder: false });
  }
  return pitches;
}

function titleOf(slug) {
  const pg = Model.pages[slug];
  return (pg.sidebarLabel || pg.title || slug).replace(/ - Strapi.*$/, '');
}

/* GitHub edit URL: the real repair tool behind "Report worn rope" */
function editUrlOf(slug) {
  const pg = Model.pages[slug];
  return 'https://github.com/strapi/documentation/edit/main/docusaurus/' + pg.file;
}

/* the distant fresh summit for the arrival vista: the most recently
   signed page in the corpus (ties broken alphabetically) */
function mostRecentlySigned() {
  let best = null;
  for (const [slug, v] of Object.entries(Model.prov)) {
    if (!best || v.last > best.last || (v.last === best.last && slug < best.slug)) {
      best = { slug, last: v.last };
    }
  }
  return best.slug;
}
