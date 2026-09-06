/* ALPENGLOW, reader.js
   The summit book: pure document surface, white and ink, zero texture.
   Renders every block kind in the corpus as crisp native DOM. */

'use strict';

const Reader = (() => {

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  const ADM_LABELS = {
    tip: 'Tip', note: 'Note', info: 'Info', caution: 'Caution', warning: 'Warning',
    danger: 'Danger', strapi: 'Strapi', prerequisites: 'Prerequisites', callout: 'Callout',
  };

  function renderBlocks(blocks, mount) {
    for (const b of blocks || []) mount.appendChild(renderBlock(b));
  }

  function renderBlock(b) {
    switch (b.t) {
      case 'tldr': return el('div', 'tldr', b.html);
      case 'p': return el('p', null, b.html);
      case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
        const h = el(b.t, null, b.text);
        if (b.id) {
          h.id = b.id;
          const a = el('a', 'hanchor', '#');
          a.href = '#' + b.id;
          h.appendChild(a);
        }
        return h;
      }
      case 'ul': {
        const u = el('ul');
        if (b.loose) u.classList.add('loose');
        for (const it of b.items) u.appendChild(el('li', null, it));
        return u;
      }
      case 'ol': {
        const o = el('ol');
        if (b.start && b.start !== 1) o.start = b.start;
        for (const it of b.items) o.appendChild(el('li', null, it));
        return o;
      }
      case 'hr': return el('hr');
      case 'table': return renderTable(b);
      case 'admonition': return renderAdm(b);
      case 'code': return renderCode(b);
      case 'tabs': return renderTabs(b);
      case 'cards': return renderCards(b);
      case 'badge': return el('span', 'badgepill', b.label || b.kind);
      case 'details': return renderDetails(b);
      case 'endpoint': return renderEndpoint(b);
      case 'columns': return renderColumns(b);
      case 'img': return renderImg(b);
      default: return el('div', null, '');
    }
  }

  function renderTable(b) {
    const wrap = el('div', 'tbl-wrap');
    const t = el('table');
    if (b.head && b.head.length) {
      const tr = el('tr');
      b.head.forEach((h, i) => {
        const th = el('th', null, h);
        if (b.align && b.align[i] && b.align[i] !== 'left') th.style.textAlign = b.align[i];
        tr.appendChild(th);
      });
      t.appendChild(el('thead')).appendChild(tr);
    }
    const tb = el('tbody');
    for (const row of b.rows || []) {
      const tr = el('tr');
      row.forEach((c, i) => {
        const td = el('td', null, c);
        if (b.align && b.align[i] && b.align[i] !== 'left') td.style.textAlign = b.align[i];
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    }
    t.appendChild(tb);
    wrap.appendChild(t);
    return wrap;
  }

  function renderAdm(b) {
    const kind = ADM_LABELS[b.kind] ? b.kind : 'callout';
    const d = el('div', 'adm adm-' + kind);
    d.appendChild(el('div', 'adm-label', b.title || ADM_LABELS[kind]));
    renderBlocks(b.blocks, d);
    return d;
  }

  /* strip docusaurus highlight markers, keep the highlighted ranges */
  function parseHighlights(code) {
    const out = [], hl = new Set();
    let inHl = false, next = false;
    for (const line of code.replace(/^\n+/, '').split('\n')) {
      const t = line.trim();
      if (/highlight-start/.test(t)) { inHl = true; continue; }
      if (/highlight-end/.test(t)) { inHl = false; continue; }
      if (/highlight-next-line/.test(t)) { next = true; continue; }
      if (inHl || next) hl.add(out.length);
      next = false;
      out.push(line);
    }
    return { lines: out, hl };
  }

  function renderCode(b) {
    const { lines, hl } = parseHighlights(b.code || '');
    const box = el('div', 'codeblock');
    const head = el('div', 'cb-head');
    if (b.title) head.appendChild(el('span', 'cb-title', b.title));
    head.appendChild(el('span', 'cb-lang', b.lang || ''));
    const copy = el('button', 'cb-copy', 'Copy');
    copy.addEventListener('click', () => {
      try { navigator.clipboard.writeText(lines.join('\n')); copy.textContent = 'Copied'; setTimeout(() => copy.textContent = 'Copy', 1400); } catch (e) {}
    });
    head.appendChild(copy);
    box.appendChild(head);
    const pre = el('pre');
    const codeEl = el('code');
    lines.forEach((ln, i) => {
      const span = document.createElement('span');
      if (hl.has(i)) span.className = 'hl';
      span.textContent = ln + '\n';
      codeEl.appendChild(span);
    });
    pre.appendChild(codeEl);
    box.appendChild(pre);
    return box;
  }

  function renderTabs(b, preselect) {
    const box = el('div', 'tabs');
    const bar = el('div', 'tabs-bar');
    bar.setAttribute('role', 'tablist');
    const panels = [];
    b.tabs.forEach((tab, i) => {
      const btn = el('button', null, tab.label);
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === (preselect || 0) ? 'true' : 'false');
      const panel = el('div', 'tabs-panel');
      panel.setAttribute('role', 'tabpanel');
      if (i !== (preselect || 0)) panel.hidden = true;
      renderBlocks(tab.blocks, panel);
      panels.push(panel);
      btn.addEventListener('click', () => {
        bar.querySelectorAll('button').forEach(x => x.setAttribute('aria-selected', 'false'));
        btn.setAttribute('aria-selected', 'true');
        panels.forEach(p => p.hidden = true);
        panel.hidden = false;
      });
      bar.appendChild(btn);
    });
    box.appendChild(bar);
    panels.forEach(p => box.appendChild(p));
    return box;
  }

  function renderCards(b) {
    const g = el('div', 'cardsgrid');
    for (const c of b.items || []) {
      const a = el('a', 'doccard');
      a.href = c.link || '#';
      a.appendChild(el('div', 'ci', c.icon || ''));
      a.appendChild(el('div', 'ct', c.title || ''));
      if (c.desc) a.appendChild(el('div', 'cd', c.desc));
      g.appendChild(a);
    }
    return g;
  }

  function renderDetails(b) {
    const d = el('details');
    if (b.id) d.id = b.id;
    d.appendChild(el('summary', null, b.summary || 'Details'));
    const body = el('div');
    renderBlocks(b.blocks, body);
    d.appendChild(body);
    return d;
  }

  function renderEndpoint(b) {
    const box = el('div', 'endpoint');
    if (b.id) box.id = b.id;
    const head = el('div', 'ep-head');
    if (b.method) head.appendChild(el('span', 'ep-method ' + b.method, b.method));
    if (b.path) head.appendChild(el('span', 'ep-path', b.path));
    if (b.title) head.appendChild(el('span', 'ep-title', b.title));
    box.appendChild(head);
    if (b.description) box.appendChild(el('div', 'ep-desc', b.description));
    if (b.params && b.params.length) {
      const pw = el('div', 'ep-params');
      pw.appendChild(el('h5', null, b.paramTitle || 'Parameters'));
      pw.appendChild(renderTable({
        head: ['Name', 'Type', 'Description'],
        rows: b.params.map(p => [
          '<code>' + p.name + '</code>' + (p.required ? ' <em>required</em>' : ''),
          p.type || '', p.desc || '',
        ]),
      }));
      box.appendChild(pw);
    }
    if (b.codeTabs && b.codeTabs.length) {
      box.appendChild(renderTabs({
        tabs: b.codeTabs.map(ct => ({
          label: ct.label || ct.lang, value: ct.label,
          blocks: [{ t: 'code', lang: ct.lang, title: '', code: ct.code }],
        })),
      }));
    }
    for (const r of b.responses || []) {
      const rw = el('div', 'ep-params');
      rw.appendChild(el('h5', null, 'Response ' + (r.status || '') + ' ' + (r.statusText || '')));
      rw.appendChild(renderCode({ lang: r.lang || '', title: '', code: r.body || '' }));
      box.appendChild(rw);
    }
    return box;
  }

  function renderColumns(b) {
    const g = el('div', 'cols');
    for (const col of b.cols || []) {
      const c = el('div', 'col');
      renderBlocks(col, c);
      g.appendChild(c);
    }
    return g;
  }

  function renderImg(b) {
    const f = el('figure');
    const img = document.createElement('img');
    img.src = b.light || b.dark || '';
    img.alt = b.alt || '';
    img.loading = 'lazy';
    f.appendChild(img);
    if (b.caption) f.appendChild(el('figcaption', null, b.caption));
    return f;
  }

  /* ---- public: fill the book panel with a page ---- */
  function fill(slug) {
    const pg = Model.pages[slug];
    document.getElementById('book-title').textContent = titleOf(slug);
    document.getElementById('book-prov').innerHTML = provLine(slug);
    const mount = document.getElementById('book-content');
    mount.innerHTML = '';
    renderBlocks(pg.blocks, mount);
    document.getElementById('btn-report').href = editUrlOf(slug);
  }

  return { fill, renderBlocks };
})();
