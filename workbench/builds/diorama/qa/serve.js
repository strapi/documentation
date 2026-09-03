/* Tiny static server for the diorama QA loop.
   usage: node qa/serve.js [port]   (serves the build dir it lives beside) */
const path = require('path');
const http = require('http');
const fs = require('fs');
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.gif': 'image/gif', '.webp': 'image/webp'
};
const dir = path.join(__dirname, '..');
const port = Number(process.argv[2] || 8971);
http.createServer((req, rep) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(dir, p === '/' ? '/index.html' : p);
  if (!f.startsWith(dir)) { rep.writeHead(403); rep.end('no'); return; }
  fs.readFile(f, (e, d) => {
    if (e) { rep.writeHead(404); rep.end('nf'); return; }
    rep.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    rep.end(d);
  });
}).listen(port, '127.0.0.1', () => console.log('serving on ' + port));
