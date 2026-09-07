/* Dev server for round 8: serves the s7 herbarium at / and answers the seven
   sibling paths with in-memory stubs so a crossing can be walked end to end.
   Nothing is written outside s7. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const DIR = __dirname;
const PORT = 8991;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.gif': 'image/gif', '.woff2': 'font/woff2',
  '.ico': 'image/x-icon', '.webp': 'image/webp'
};
const SIBS = {
  pixelcity: 'PIXEL DOCS CITY', longway: 'THE LONG WAY', herbarium: 'THE HERBARIUM',
  firstlight: 'FIRST LIGHT', cartastrapiana: 'CARTA STRAPIANA', bythedeep: 'BY THE DEEP',
  secreta: 'THE COMIC (SECRET A)', secretb: 'THE KIT (SECRET B)'
};
function stub(name) {
  return '<!doctype html><meta charset="utf-8"><title>' + name + '</title>'
    + '<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#101418;color:#e8e2d2;font-family:Georgia,serif">'
    + '<div style="text-align:center"><p style="letter-spacing:.4em;font-size:12px;opacity:.6">SISTER PROJECT · LOCAL STUB</p>'
    + '<h1 style="font-weight:400;letter-spacing:.12em">' + name + '</h1>'
    + '<p style="opacity:.7">You arrived through the Herbarium appendix plate.<br>In production this URL serves the real project.</p></div>';
}
http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const m = u.match(/^\/([a-z]+)\/?$/);
  if (m && SIBS[m[1]]) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(stub(SIBS[m[1]]));
    return;
  }
  let p = path.normalize(path.join(DIR, u === '/' ? 'index.html' : u));
  if (!p.startsWith(DIR)) { res.writeHead(403); res.end(); return; }
  fs.readFile(p, (err, buf) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(PORT, '127.0.0.1', () => console.log('serving s7 on http://127.0.0.1:' + PORT + '/'));
