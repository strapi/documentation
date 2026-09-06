const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname;
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json',
 '.txt':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg',
 '.svg':'image/svg+xml','.gif':'image/gif','.webp':'image/webp','.ico':'image/x-icon',
 '.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.woff2':'font/woff2'};
http.createServer((req,res)=>{
  let u=decodeURIComponent(req.url.split('?')[0]);
  if(u==='/')u='/index.html';
  if(u==='/images/plates/index.json'){
    /* the art slot's folder listing: every plate image + the manifest */
    fs.readdir(path.join(root,'images','plates'),(err,files)=>{
      res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-cache'});
      res.end(JSON.stringify(err?[]:files.filter(f=>/\.(png|jpe?g|json)$/i.test(f))));
    });
    return;
  }
  const f=path.join(root,u);
  if(!f.startsWith(root)){res.writeHead(403);res.end();return;}
  fs.readFile(f,(err,data)=>{
    if(err){res.writeHead(404);res.end('not found');return;}
    res.writeHead(200,{'Content-Type':MIME[path.extname(f).toLowerCase()]||'application/octet-stream',
      'Cache-Control':'no-cache'});
    res.end(data);
  });
}).listen(process.env.PORT||8471,'127.0.0.1',()=>console.log('four-color on port '+(process.env.PORT||8471)+''));
