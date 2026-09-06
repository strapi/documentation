// Reading is the game. Canvas text is scenery; this overlay is the reading:
// crisp, untinted, the page's actual blocks as real HTML.

import { provLine, safeStore } from './data.js';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

let OV = null;

export function initOverlay(data, hooks) {
  OV = {
    data, hooks,
    readPages: new Set(safeStore.get('longlight.read', [])),
    tended: new Set(safeStore.get('longlight.tended', [])),
    open: false, logOpen: false,
    reader: document.getElementById('reader'),
    body: document.getElementById('reader-body'),
  };
  document.getElementById('reader-close').addEventListener('click', closeReader);
  document.getElementById('lb-close').addEventListener('click', () => toggleLogbook(false));
  document.getElementById('reader').addEventListener('click', (e) => {
    if (e.target === OV.reader) closeReader();
  });
  return OV;
}

export function getTended() { return OV ? OV.tended : new Set(safeStore.get('longlight.tended', [])); }
export function isReaderOpen() { return OV && (OV.open || OV.logOpen); }
export function readCount() { return OV.readPages.size; }

// ---------- block renderer ----------
function renderBlocks(blocks, depth = 0) {
  if (!blocks) return '';
  let html = '';
  for (const b of blocks) {
    switch (b.t) {
      case 'tldr': html += `<div class="rd-tldr">${b.html}</div>`; break;
      case 'p': html += `<p>${b.html}</p>`; break;
      case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
        html += `<${b.t} id="${esc(b.id || '')}">${esc(b.text)}</${b.t}>`; break;
      case 'ul': case 'ol': {
        html += `<${b.t}>`;
        for (const it of b.items || []) {
          if (typeof it === 'string') html += `<li>${it}</li>`;
          else html += `<li>${it.html || ''}${renderBlocks(it.blocks, depth + 1)}</li>`;
        }
        html += `</${b.t}>`; break;
      }
      case 'code':
        html += `<div class="rd-code"><div class="rd-code-bar"><span>${esc(b.title || b.lang || 'code')}</span><span>${esc(b.lang || '')}</span></div><pre><code>${esc(b.code)}</code></pre></div>`;
        break;
      case 'admonition': {
        const kind = (b.kind || 'note').toLowerCase();
        html += `<div class="rd-adm k-${esc(kind)}"><div class="rd-adm-t">${esc(b.title || kind)}</div>${renderBlocks(b.blocks, depth + 1)}</div>`;
        break;
      }
      case 'details':
        html += `<details${depth === 0 ? '' : ''}><summary>${esc(b.summary || 'Details')}</summary><div class="rd-det-body">${renderBlocks(b.blocks, depth + 1)}</div></details>`;
        break;
      case 'tabs': {
        const id = 'tabs' + Math.random().toString(36).slice(2, 8);
        html += `<div class="rd-tabs" data-tabs="${id}"><div class="rd-tabbar">`;
        (b.tabs || []).forEach((tb, i) => {
          html += `<button type="button" data-tab="${id}:${i}" class="${i === 0 ? 'on' : ''}">${esc(tb.label || tb.value || 'Tab')}</button>`;
        });
        html += `</div>`;
        (b.tabs || []).forEach((tb, i) => {
          html += `<div class="rd-tabpane ${i === 0 ? 'on' : ''}" data-pane="${id}:${i}">${renderBlocks(tb.blocks, depth + 1)}</div>`;
        });
        html += `</div>`; break;
      }
      case 'table': {
        html += '<div class="rd-tablewrap"><table>';
        if (b.head) html += '<thead><tr>' + b.head.map(h => `<th>${h}</th>`).join('') + '</tr></thead>';
        html += '<tbody>' + (b.rows || []).map(r => '<tr>' + r.map(cd => `<td>${cd}</td>`).join('') + '</tr>').join('') + '</tbody>';
        html += '</table></div>'; break;
      }
      case 'img':
        html += `<div class="rd-img">Figure kept in the town archive: ${esc(b.alt || 'illustration')}${b.caption ? ' · ' + esc(b.caption) : ''}</div>`;
        break;
      case 'cards': {
        html += '<div class="rd-cards">';
        for (const cd of b.items || []) {
          const link = cd.link || '';
          html += `<div class="rd-card"><b>${esc(cd.title || '')}</b><span>${esc(cd.desc || '')}</span>${link ? `<div style="margin-top:7px"><a href="${esc(link)}">Walk there</a></div>` : ''}</div>`;
        }
        html += '</div>'; break;
      }
      case 'endpoint': {
        html += `<div class="rd-endpoint"><div class="rd-ep-head">${b.method ? `<span class="rd-ep-m">${esc(b.method)}</span>` : ''}<span>${esc(b.path || b.title || '')}</span></div><div class="rd-ep-body">`;
        if (b.title && b.path) html += `<p><b>${esc(b.title)}</b></p>`;
        if (b.description) html += `<p>${esc(b.description)}</p>`;
        if (b.params && b.params.length) {
          html += `<div class="rd-tablewrap"><table><thead><tr><th>${esc(b.paramTitle || 'Parameters')}</th><th>Type</th><th>Description</th></tr></thead><tbody>`;
          for (const pr of b.params) {
            html += `<tr><td><code>${esc(pr.name || '')}</code></td><td>${esc(pr.type || '')}</td><td>${pr.description || pr.desc || ''}</td></tr>`;
          }
          html += '</tbody></table></div>';
        }
        html += '</div></div>'; break;
      }
      case 'columns':
        html += '<div class="rd-cols">' + (b.cols || []).map(cl => `<div>${renderBlocks(cl, depth + 1)}</div>`).join('') + '</div>';
        break;
      case 'badge':
        html += `<span class="rd-badge">${esc(b.label || b.kind || '')}</span> `;
        break;
      case 'hr': html += '<hr>'; break;
      default: break;
    }
  }
  return html;
}

// ---------- reader ----------
export function openReader(slug) {
  const { content, taxonomy, provenance } = OV.data;
  const page = content.pages[slug];
  if (!page) return false;
  const tax = taxonomy[slug];
  document.getElementById('reader-crumb').innerHTML =
    `<b>${esc(tax ? (tax.product === 'cms' ? 'CMS' : 'Cloud') : '')}</b> · ${esc(tax ? tax.section : '')}${tax && tax.sub ? ' · ' + esc(tax.sub) : ''}`;
  document.getElementById('reader-title').textContent = page.title;
  document.getElementById('reader-prov').textContent = provLine(provenance[slug]);
  // inline figures in the source HTML stay in the archive: neutralize them
  // BEFORE the browser can request anything
  const html = renderBlocks(page.blocks).replace(/<img\b[^>]*>/gi, (tag) => {
    const alt = (tag.match(/alt="([^"]*)"/i) || [])[1] || '';
    return `<span class="rd-img" style="display:block">Figure kept in the town archive${alt ? ': ' + esc(alt) : ''}</span>`;
  });
  OV.body.innerHTML = html;
  wireReaderBody();
  OV.reader.hidden = false;
  OV.reader.scrollTop = 0;
  OV.open = true;
  const isNew = !OV.readPages.has(slug);
  OV.readPages.add(slug);
  safeStore.set('longlight.read', [...OV.readPages]);
  if (OV.hooks.onRead) OV.hooks.onRead(slug, isNew);
  return true;
}

function wireReaderBody() {
  OV.body.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [id, i] = btn.dataset.tab.split(':');
      OV.body.querySelectorAll(`[data-tab^="${id}:"]`).forEach(b => b.classList.remove('on'));
      OV.body.querySelectorAll(`[data-pane^="${id}:"]`).forEach(p => p.classList.remove('on'));
      btn.classList.add('on');
      const pane = OV.body.querySelector(`[data-pane="${id}:${i}"]`);
      if (pane) pane.classList.add('on');
    });
  });
  OV.body.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#/')) {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const slug = href.slice(1);
        if (OV.data.content.pages[slug]) openReader(slug);
      });
    } else if (/^https?:/i.test(href)) {
      a.classList.add('rd-ext');
      a.title = 'An outside road. The coast keeps to itself.';
      a.addEventListener('click', e => e.preventDefault());
    } else {
      a.addEventListener('click', e => e.preventDefault());
    }
  });
}

export function closeReader() {
  if (!OV.open) return;
  OV.reader.hidden = true;
  OV.open = false;
  if (OV.hooks.onClose) OV.hooks.onClose();
}

// ---------- tending ----------
export function tend(slug) {
  if (OV.tended.has(slug)) return false;
  OV.tended.add(slug);
  safeStore.set('longlight.tended', [...OV.tended]);
  return true;
}

// ---------- logbook ----------
export function toggleLogbook(force) {
  const el = document.getElementById('logbook');
  OV.logOpen = force !== undefined ? force : el.hidden;
  el.hidden = !OV.logOpen;
  if (OV.logOpen) renderLogbook();
  return OV.logOpen;
}

function renderLogbook() {
  const { sections, taxonomy, stats } = OV.data;
  const reduced = OV.hooks.isReduced && OV.hooks.isReduced();
  const readBySection = {};
  for (const slug of OV.readPages) {
    const t = taxonomy[slug];
    if (!t) continue;
    const key = t.product + '|' + t.section;
    readBySection[key] = (readBySection[key] || 0) + 1;
  }
  let rows = '';
  for (const s of sections) {
    const read = readBySection[s.key] || 0;
    rows += `<tr><td>${esc(s.product === 'cms' ? 'CMS' : 'Cloud')}</td><td>${esc(s.name)}</td>
      <td class="lb-count ${read > 0 ? 'lb-done' : ''}">${read} / ${s.count}</td>
      ${reduced ? `<td><button type="button" class="lb-go" data-district="${esc(s.key)}">Walk there</button></td>` : ''}</tr>`;
  }
  document.getElementById('lb-body').innerHTML =
    `<table><thead><tr><th>Coast</th><th>District</th><th class="lb-count">Pages read</th>${reduced ? '<th></th>' : ''}</tr></thead><tbody>${rows}</tbody></table>`;
  const kh = OV.hooks.keeperHour && OV.hooks.keeperHour();
  document.getElementById('lb-foot').innerHTML =
    `${OV.tended.size} ${OV.tended.size === 1 ? 'lantern' : 'lanterns'} tended by your hand · the record holds ${stats.totalCommits.toLocaleString('en-US')} acts of care by ${stats.keeperCount} keepers since ${stats.firstDate}<br>` +
    `${stats.pageCount} pages stand on this coast · ${stats.edgeCount.toLocaleString('en-US')} footpaths worn between them · ${stats.zeroInbound} unmarked crofts off trail<br>` +
    (kh ? `<span class="keeper-hour">The keeper's hour. The sun sits two degrees lower and the Golden Shore is turning.</span>`
        : `Read the Quick Start Guide and one page in five districts to bring the keeper's hour.`);
  document.getElementById('lb-body').querySelectorAll('.lb-go').forEach(btn => {
    btn.addEventListener('click', () => {
      if (OV.hooks.onTeleport) OV.hooks.onTeleport(btn.dataset.district);
      toggleLogbook(false);
    });
  });
}

// ---------- keeper's hour condition, from real reading ----------
export function keeperHourEarned() {
  if (!OV.readPages.has('/cms/quick-start')) return false;
  const seen = new Set();
  for (const slug of OV.readPages) {
    const t = OV.data.taxonomy[slug];
    if (t) seen.add(t.product + '|' + t.section);
  }
  return seen.size >= 5;
}

// ---------- HUD ----------
export function showToast(text, ms = 3200) {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.hidden = false;
  el.classList.add('on');
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.classList.remove('on'); }, ms);
}

export function updateLabel(target, distance, tendProgress) {
  const el = document.getElementById('label');
  if (!target) { el.hidden = true; return; }
  el.hidden = false;
  el.classList.toggle('far', distance > 9);
  document.getElementById('label-title').textContent = target.page.title;
  const prov = target.prov;
  let meta = target.tax ? `${target.tax.product === 'cms' ? 'CMS' : 'Cloud'} · ${target.tax.section}` : '';
  if (prov) meta += ` · ${provLine(prov)}`;
  if (target.night > 0) meta += ` · tended after midnight ${target.night} ${target.night === 1 ? 'time' : 'times'}`;
  document.getElementById('label-meta').textContent = meta;
  const tended = OV.tended.has(target.slug);
  document.getElementById('label-hint').textContent =
    distance <= 9 ? (tended ? 'E to read · this flame knows your hand' : 'E to read · hold F to tend the lantern') : '';
  const ring = document.getElementById('tend-ring');
  if (tendProgress > 0) {
    ring.hidden = false;
    document.getElementById('tend-fill').style.width = (tendProgress * 100).toFixed(0) + '%';
  } else ring.hidden = true;
}

// ---------- compass ----------
export function drawCompass(camYaw, tendedStations, quickStart, camPos) {
  const cv = document.getElementById('compass');
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = 'rgba(255,236,206,0.28)';
  ctx.fillRect(cv.width * 0.18, 5, cv.width * 0.64, 1);
  const center = cv.width / 2;
  const span = Math.PI * 0.9; // visible arc
  const dirs = [['N', 0], ['E', -Math.PI / 2], ['S', Math.PI], ['W', Math.PI / 2]];
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const [nm, ang] of dirs) {
    let d = ang - camYaw;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    if (Math.abs(d) < span / 2) {
      const x = center + (d / (span / 2)) * (cv.width / 2 - 20);
      ctx.fillStyle = 'rgba(255,236,206,0.6)';
      ctx.font = '500 11px "Avenir Next", system-ui, sans-serif';
      ctx.fillText(nm, x, 15);
    }
  }
  const marks = [...tendedStations];
  if (quickStart) marks.push(quickStart);
  for (const st of marks) {
    const bearing = Math.atan2(-(st.x - camPos.x), -(st.z - camPos.z));
    let d = bearing - camYaw;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    if (Math.abs(d) < span / 2) {
      const x = center + (d / (span / 2)) * (cv.width / 2 - 20);
      ctx.fillStyle = st === quickStart ? '#7B79FF' : '#ffb35e';
      ctx.beginPath(); ctx.arc(x, 23, 2.6, 0, 6.3); ctx.fill();
    }
  }
}
