/* Independent fidelity check: how much of the real corpus survived conversion?
   Does not trust the converter or its auditors. usage: node fidelity.js <bundle.json> */
const fs = require('fs'), path = require('path');
const DOCS = '/Users/piwi/code/documentation/docusaurus/docs';
const bundle = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.mdx?$/.test(e.name)) out.push(p);
  }
  return out;
}
/* the visible words of a source file: no frontmatter, no imports, no JSX tags, no code fences */
function sourceWords(raw) {
  let s = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  s = s.replace(/^import\s+.*$/gm, '');
  s = s.replace(/```[\s\S]*?```/g, ' ');          // code counted separately
  s = s.replace(/<[^>]+>/g, ' ');                  // JSX and html tags
  s = s.replace(/\{[^{}]*\}/g, ' ');               // jsx expressions
  s = s.replace(/[#>*_`|:\-]+/g, ' ');
  return s.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w) && w.length > 1);
}
function blockWords(blocks, acc = []) {
  for (const b of blocks || []) {
    if (!b || typeof b !== 'object') continue;
    const strs = [];
    if (b.html) strs.push(b.html);
    if (b.text) strs.push(b.text);
    if (b.summary) strs.push(b.summary);
    if (b.title) strs.push(b.title);
    if (b.description) strs.push(b.description);
    if (b.caption) strs.push(b.caption);
    if (Array.isArray(b.items)) for (const i of b.items) strs.push(typeof i === 'string' ? i : JSON.stringify(i));
    if (Array.isArray(b.head)) strs.push(b.head.join(' '));
    if (Array.isArray(b.rows)) for (const r of b.rows) strs.push(r.join(' '));
    if (Array.isArray(b.params)) for (const p of b.params) strs.push([p.name, p.desc].join(' '));
    for (const s of strs) {
      const t = String(s).replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
      acc.push(...t.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w) && w.length > 1));
    }
    if (Array.isArray(b.blocks)) blockWords(b.blocks, acc);
    if (Array.isArray(b.tabs)) for (const t of b.tabs) blockWords(t.blocks, acc);
    if (Array.isArray(b.cols)) for (const c of b.cols) blockWords(c, acc);
  }
  return acc;
}
function codeChars(blocks, acc = { n: 0 }) {
  for (const b of blocks || []) {
    if (!b || typeof b !== 'object') continue;
    if (b.t === 'code' && b.code) acc.n += b.code.length;
    if (Array.isArray(b.blocks)) codeChars(b.blocks, acc);
    if (Array.isArray(b.tabs)) for (const t of b.tabs) codeChars(t.blocks, acc);
    if (Array.isArray(b.cols)) for (const c of b.cols) codeChars(c, acc);
    if (Array.isArray(b.codeTabs)) for (const t of b.codeTabs) acc.n += (t.code || '').length;
  }
  return acc.n;
}

const files = walk(DOCS).filter((f) => !f.includes('/snippets/'));
const byFile = new Map();
for (const [slug, p] of Object.entries(bundle.pages)) {
  if (p.file) byFile.set(path.basename(p.file), slug);
}
let missing = [], lossy = [], noCode = [], totalSrc = 0, totalOut = 0;
for (const f of files) {
  const raw = fs.readFileSync(f, 'utf8');
  const sw = sourceWords(raw);
  const rel = path.relative('/Users/piwi/code/documentation/docusaurus', f);
  let page = Object.values(bundle.pages).find((p) => p.file && (p.file === rel || p.file.endsWith(path.relative(DOCS, f))));
  if (!page) { missing.push(rel); continue; }
  const bw = blockWords(page.blocks);
  totalSrc += sw.length; totalOut += bw.length;
  const ratio = sw.length ? bw.length / sw.length : 1;
  if (sw.length > 60 && ratio < 0.9) lossy.push({ file: rel, src: sw.length, out: bw.length, keep: +(ratio * 100).toFixed(1) });
  const srcFences = (raw.match(/```/g) || []).length / 2;
  if (srcFences >= 1 && codeChars(page.blocks) === 0) noCode.push(rel);
}
lossy.sort((a, b) => a.keep - b.keep);
console.log(JSON.stringify({
  sourceFiles: files.length,
  bundlePages: Object.keys(bundle.pages).length,
  missingFromBundle: missing.length,
  missingSample: missing.slice(0, 25),
  overallWordRetention: totalSrc ? +((totalOut / totalSrc) * 100).toFixed(1) + '%' : 'n/a',
  pagesLosingOver10pct: lossy.length,
  worstPages: lossy.slice(0, 20),
  pagesWithCodeInSourceButNoneInBundle: noCode.length,
  noCodeSample: noCode.slice(0, 15),
}, null, 2));
