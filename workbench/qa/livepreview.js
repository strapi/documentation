/* The Design Lab gallery: thumbnails, live status, archives, and back-links.

   Where the worlds are served FROM is qa/worldsource.js, shared with the
   thumbnailer so the two can never disagree about it. Read the story at the
   top of that file: this gallery used to serve a disposable scratchpad, and
   most of its cards ended up showing worlds that could not load. */
const http = require('http'), fs = require('fs'), path = require('path');
const { IMG, THUMBS, readWorld, rev } = require('./worldsource.js');
const PORT = 8787;

const CATALOG = [
  { key: 'longway',       name: 'The Long Way Through',       note: 'the corpus as one walkable trail',       sec: 'main' },
  { key: 'pixelcity',     name: 'Pixel Docs City', note: 'an explorable pixel town, seasons turning',  sec: 'main' },
  { key: 'herbarium',     name: 'The Herbarium',     note: '290 specimens grown from git history',       sec: 'main' },
  { key: 'firstlight',    name: 'FIRST LIGHT',    note: 'first probe in an unmapped system',      sec: 'main' },
  { key: 'cartastrapiana', name: 'Carta Strapiana', note: 'the committee cut: a living engraving you sail', sec: 'main' },
  { key: 'bythedeep',      name: 'By the Deep',     note: 'archived: the cartoon sea that opened the cartoon question', sec: 'archive' },
  { key: 'secreta',        name: 'The Four-Color',      note: 'a Silver Age Docs Code comic - grab one off the rack', sec: 'main' },




  { key: 'goldenshore',   name: 'The Golden Shore', note: 'a walkable coast at golden hour, in the forge', sec: 'main' },
  { key: 'alpenglow',      name: 'Alpenglow', note: 'archived: every page a summit, the climb that opened the cartoon question', sec: 'archive' },
  { key: 'secretb',        name: 'The Kit',      note: 'archived while still on its sprues - the lab narrows to six', sec: 'archive' },
  { key: 'cityx',         name: 'The Diorama',   note: 'archived with honors - it told the truth about 290 pages in one perfect golden minute',            sec: 'archive' },
  { key: 'workingsea',    name: 'The Working Sea',    note: 'b. the Coast of Lights - the coast that taught the portal to tend: fog to the Long Way, moths to the Diorama, 57 packets to FIRST LIGHT', sec: 'archive' },
];
const CHIPPOS = {"cityx":"bl112","pianola":"br56","herbarium":"br","pixelcity":"bl12x304","workingsea":"br","firstlight":"bl12x455c","cartastrapiana":"br","bythedeep":"br","deepwater":"br","secreta":"br","secretb":"br","longway":"br","arcade2":"br","galaxy":"br","lampfall":"br","deadwax":"br","projectionist":"br"};
const byKey = Object.fromEntries(CATALOG.map((c) => [c.key, c]));
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.png':'image/png',
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.gif':'image/gif', '.svg':'image/svg+xml',
  '.webp':'image/webp', '.ico':'image/x-icon', '.txt':'text/plain; charset=utf-8', '.ogg':'audio/ogg', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.m4a':'audio/mp4' };

const RELOAD = `<script>(function(){var k=location.pathname.split('/')[1]||'';var cur=null;
setInterval(function(){fetch('/__rev?k='+k,{cache:'no-store'}).then(function(r){return r.json()})
.then(function(d){if(cur===null){cur=d.rev;return}if(d.rev!==cur){cur=d.rev;location.reload()}})
.catch(function(){})},1500)})();</script>`;

/* the way back to the gallery, on the left edge of every project */
const CHIPTHEME = {
  longway:      { bg:'#F5EAD8', fg:'#2A0F3D', br:'2px solid #2A0F3D', rad:'2px', sh:'3px 3px 0 #FF3D6E', hbg:'#4945FF', hfg:'#F5EAD8' },
  pixelcity:    { bg:'#F2EDDA', fg:'#1A1B26', br:'2px solid #1A1B26', rad:'0',   sh:'2px 2px 0 rgba(26,27,38,.85)', hbg:'#1A1B26', hfg:'#F2EDDA' },
  herbarium:    { bg:'#241c12', fg:'#e9dcc0', br:'1px solid #c9a55e', rad:'2px', sh:'none', hbg:'#c9a55e', hfg:'#241c12' },
  cityx:        { bg:'#FDFBF6', fg:'#1E3A3A', br:'1px solid #c9c2b4', rad:'3px', sh:'0 1px 3px rgba(40,30,10,.3)', hbg:'#1E3A3A', hfg:'#FDFBF6' },
  firstlight:   { bg:'rgba(5,6,10,.92)', fg:'#FFB347', br:'1px solid #FFB347', rad:'0', sh:'none', hbg:'#FFB347', hfg:'#05060A' },
  workingsea:   { bg:'rgba(6,12,24,.92)', fg:'#e8d9a8', br:'1px solid #4a5a78', rad:'999px', sh:'none', hbg:'#e8d9a8', hfg:'#0a1526' },
  pianola:      { bg:'#1B140D', fg:'#C9A567', br:'1px solid #8A6C3C', rad:'2px', sh:'none', hbg:'#C9A567', hfg:'#1B140D' },
  projectionist:{ bg:'#2A0F3D', fg:'#FFD9A8', br:'1px solid #C9A567', rad:'2px', sh:'none', hbg:'#FFD9A8', hfg:'#2A0F3D' },
  lampfall:     { bg:'#141210', fg:'#D89B4A', br:'1px solid #6b5232', rad:'2px', sh:'none', hbg:'#D89B4A', hfg:'#141210' },
  deadwax:      { bg:'#F0E6CE', fg:'#2A0F3D', br:'2px solid #2A0F3D', rad:'0',   sh:'none', hbg:'#2A0F3D', hfg:'#F0E6CE' },
  arcade2:      { bg:'#2A0F3D', fg:'#FFE9C7', br:'2px solid #FF3D6E', rad:'0',   sh:'none', hbg:'#FF3D6E', hfg:'#2A0F3D' },
  galaxy:       { bg:'#f2e9d5', fg:'#3a2c1a', br:'1px solid #8a7550', rad:'2px', sh:'none', hbg:'#3a2c1a', hfg:'#f2e9d5' },
  cartastrapiana:{ bg:'#EFE6D0', fg:'#2E2318', br:'1px solid #2E2318', rad:'2px', sh:'1px 1px 0 rgba(46,35,24,.25)', hbg:'#2E2318', hfg:'#EFE6D0' },
  deepwater:    { bg:'rgba(10,18,26,.86)', fg:'#dfeaf2', br:'1px solid rgba(200,225,240,.45)', rad:'6px', sh:'0 2px 18px rgba(0,0,0,.5)', hbg:'rgba(225,240,250,.95)', hfg:'#0a121a' },
  secreta:      { bg:'#f6efdc', fg:'#171310', br:'3px solid #171310', rad:'2px', sh:'4px 4px 0 #171310', hbg:'#c8342a', hfg:'#f6efdc' },
  bythedeep:    { bg:'#F3E2B5', fg:'#201612', br:'3px solid #201612', rad:'10px', sh:'2px 2px 0 rgba(32,22,18,.3)', hbg:'#201612', hfg:'#F3E2B5' },
};
const CHIPDEFAULT = { bg:'rgba(12,10,20,.88)', fg:'#efeaf7', br:'1px solid #4945ff', rad:'999px', sh:'0 2px 12px rgba(73,69,255,.45)', hbg:'#4945ff', hfg:'#fff' };

const BACKCHIP = (key) => {
  const t = CHIPTHEME[key] || CHIPDEFAULT;
  return `<a href="/" id="__labback" title="Back to the Strapi Docs Design Lab" aria-label="Back to the Strapi Docs Design Lab gallery">\u2190 BACK TO STRAPI DOCS DESIGN LAB</a>
<style>
#__labback{position:fixed;right:14px;bottom:14px;z-index:2147483000;
font:700 11px/1 ui-monospace,monospace;letter-spacing:.16em;white-space:nowrap;padding:9px 13px;
background:${t.bg};color:${t.fg};text-decoration:none;border:${t.br};border-radius:${t.rad};
box-shadow:${t.sh};opacity:.92;transition:opacity .15s,background .15s,color .15s}
#__labback:hover,#__labback:focus-visible{opacity:1;background:${t.hbg};color:${t.hfg}}
body.gv-on #__labback{display:none!important}
</style>
<script>(function(){
  /* the chip finds its own free corner: designs keep growing new controls, so
     placement is measured at runtime instead of guessed per project */
  var a=document.getElementById('__labback');if(!a)return;
  /* per-project docks: some hosts have a chrome bar the chip belongs in (owner:
     on FIRST LIGHT, put it between the search and the SOUND button) */
  var DOCKS={
    longway:function(a){
      var bc=document.getElementById('blockchip');
      var host=bc&&bc.parentNode ? bc.parentNode : document.getElementById('hudRight');
      if(!host)return false;
      a.style.position='static';a.style.opacity='1';a.style.margin='0 0 0 .55rem';
      a.style.verticalAlign='middle';
      a.textContent='\u2190 DESIGN LAB';
      a.title='Back to the Strapi Docs Design Lab';
      if(bc&&bc.nextSibling) host.insertBefore(a,bc.nextSibling); else host.appendChild(a);
      return true;
    },
    pixelcity:function(a){
      var key=document.getElementById('btn-key');
      if(!key||!key.parentNode)return false;
      a.style.position='static';a.style.opacity='1';a.style.margin='0 0 0 .4rem';
      a.className=(key.className||'')+' __labchip';
      a.textContent='\u2190 DESIGN LAB';
      a.title='Back to the Strapi Docs Design Lab';
      key.parentNode.insertBefore(a,key.nextSibling);
      return true;
    },
    herbarium:function(a){
      var nav=document.querySelector('#topbar .tb-nav');
      if(!nav)return false;
      a.style.position='static';a.style.opacity='1';a.style.margin='0 0 0 .5rem';
      a.textContent='\u2190 DESIGN LAB';
      a.title='Back to the Strapi Docs Design Lab';
      nav.appendChild(a);
      return true;
    },
    firstlight:function(a){
      var snd=document.getElementById('audiobtn');
      if(!snd||!snd.parentNode)return false;
      a.style.position='static';a.style.opacity='1';
      a.style.margin='0 10px 0 0';a.style.order='';
      a.textContent='\u2190 DESIGN LAB';
      a.title='Back to the Strapi Docs Design Lab';
      snd.parentNode.insertBefore(a,snd);
      return true;
    }
  };
    var dockKey=(location.pathname.split('/')[1]||'');
  if(DOCKS[dockKey]){
    var tryDock=function(){if(!document.getElementById('__labback'))return;if(DOCKS[dockKey](a))a._docked=true;};
    tryDock(); if(!a._docked){setTimeout(tryDock,800);setTimeout(tryDock,2500);}
  }
  var SPOTS=[['right','bottom',14,14],['left','bottom',14,14],['right','bottom',14,64],
             ['left','bottom',14,64],['right','top',14,64],['left','top',14,64],
             ['right','bottom',14,120],['left','bottom',14,120]];
  function busy(r){
    /* obstacles are not only controls: a chart key or a caption is content too */
    var els=document.querySelectorAll('button,.btn,a,[role=button],input,select,textarea,p,li,td,th,h1,h2,h3,h4,figcaption,label,dt,dd,strong,em,span,div');
    for(var i=0;i<els.length;i++){var e=els[i];if(e===a||a.contains(e))continue;
      if(e.children&&e.children.length>2)continue;
      var txt=(e.textContent||'').trim();
      if(e.tagName==='DIV'&&!txt)continue;
      var c=e.getBoundingClientRect();
      if(c.width<8||c.height<8||c.width>innerWidth*0.9)continue;
      var cs=getComputedStyle(e); if(cs.visibility==='hidden'||cs.opacity==='0')continue;
      if(!(c.left>r.right+6||c.right<r.left-6||c.top>r.bottom+6||c.bottom<r.top-6))return true;}
    return false;
  }
  function place(){
    if(a._docked)return;
    for(var i=0;i<SPOTS.length;i++){
      var s=SPOTS[i];
      a.style.left=s[0]==='left'?s[2]+'px':'auto';
      a.style.right=s[0]==='right'?s[2]+'px':'auto';
      a.style.top=s[1]==='top'?s[3]+'px':'auto';
      a.style.bottom=s[1]==='bottom'?s[3]+'px':'auto';
      var r=a.getBoundingClientRect();
      if(!busy(r))return;
    }
  }
  place();
  setTimeout(place,1200); setTimeout(place,4000);
  /* panels open and close under it: re-place when the page's own DOM shifts */
  try{
    var mo=new MutationObserver(function(){clearTimeout(a._m);a._m=setTimeout(place,120)});
    mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','style']});
  }catch(e){}
  addEventListener('resize',function(){clearTimeout(a._t);a._t=setTimeout(place,180)});
})();</scr`+`ipt>`;
};

/* entering from the gallery resets the project to its opening scene */
const FRESH = '<script>(function(){try{if(/[?&]fresh=1/.test(location.search)){'
  + 'try{localStorage.clear()}catch(e){}try{sessionStorage.clear()}catch(e){}'
  + 'try{if(indexedDB&&indexedDB.databases){indexedDB.databases().then(function(a){a.forEach(function(d){try{indexedDB.deleteDatabase(d.name)}catch(e){}})})}}catch(e){}'
  + 'history.replaceState(null,"",location.pathname)}}catch(e){}})();</'+'scr'+'ipt>';

const HOLD = (key) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${key} is being written…</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><style>
:root{color-scheme:dark}
body{margin:0;height:100vh;display:grid;place-items:center;background:#14121c;color:#efeaf7;
 font:15px/1.6 ui-monospace,monospace;text-align:center}
.b{max-width:38ch}
h1{font-size:19px;letter-spacing:.16em;text-transform:uppercase;margin:0 0 14px;color:#8f7dff}
.d{display:inline-block;width:7px;height:7px;background:#8f7dff;margin:0 3px;animation:p 1.1s infinite alternate}
.d:nth-child(2){animation-delay:.18s}.d:nth-child(3){animation-delay:.36s}
@keyframes p{from{opacity:.15}to{opacity:1}}
p{color:#9a92ad}
</style></head><body><div class="b"><h1>${key}</h1>
<p>The agent has not written index.html yet.<br>This page reloads by itself the moment it does.</p>
<div><span class="d"></span><span class="d"></span><span class="d"></span></div>
</div>${RELOAD}${BACKCHIP(key)}</body></html>`;

function card(c) {
  const r = rev(c.key);
  const hasThumb = fs.existsSync(path.join(THUMBS, c.key + '.png'));
  const t = r.ready ? new Date(r.rev) : null;
  const stamp = t ? String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0') : '';
  const building = !r.ready || r.rev > Date.now() - 15 * 60 * 1000;
  const status = !r.ready ? 'being built · waiting for first files'
    : (building ? 'being built · updated ' + stamp + ' · ' + r.src : 'live · ' + r.files + ' files · ' + r.src);
  const media = hasThumb
    ? `<img src="/thumbs/${c.key}.png?r=${r.rev}" alt="" loading="lazy">`
    : `<div class="ph"><span class="d"></span><span class="d"></span><span class="d"></span></div>`;
  return `<a class="card" href="/${c.key}/?fresh=1">
    <figure>${media}${building ? '<span class="badge">BUILDING</span>' : ''}</figure>
    <b>${c.name}</b><i>${c.note}</i><span>${status}</span></a>`;
}

const LAB_MARK_FILE = '/Users/piwi/code/documentation-wt-design-lab/workbench/favicons/chosen/design-lab.svg';
const LAB_MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges" role="img" aria-label="The Design Lab, the overprint">
  <rect width="32" height="32" fill="#ecdfc0"/>
  <!-- three passes of one page, out of register; where all three land it goes solid -->
  <g style="isolation:isolate">
    <rect x="3"  y="3"  width="18" height="18" fill="#0e9ad6" style="mix-blend-mode:multiply"/>
    <rect x="11" y="6"  width="18" height="18" fill="#e0417f" style="mix-blend-mode:multiply"/>
    <rect x="7"  y="11" width="18" height="18" fill="#e9c81f" style="mix-blend-mode:multiply"/>
  </g>
</svg>
`;

const INDEX = () => {
  const main = CATALOG.filter((c) => c.sec === 'main').map(card).join('');
  const arch = CATALOG.filter((c) => c.sec === 'archive').map(card).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>The Strapi Docs Design Lab</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta name="viewport" content="width=device-width,initial-scale=1"><style>
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;background:#100e17;color:#efeaf7;
 font:15px/1.55 ui-monospace,SFMono-Regular,monospace;padding:52px 28px 80px}
.w{max-width:1200px;margin:0 auto}
h1{font-size:13px;letter-spacing:.3em;text-transform:uppercase;color:#8f7dff;margin:0 0 6px}
.sub{color:#9a92ad;font-size:12.5px;margin:0 0 34px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
@media(max-width:980px){.grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.grid{grid-template-columns:1fr}}
.card{display:block;text-decoration:none;color:inherit;border:1px solid #2e2a40;background:#161322;
 transition:border-color .15s, transform .15s}
.card:hover{border-color:#4945ff;transform:translateY(-2px)}
.card figure{margin:0;aspect-ratio:16/10;overflow:hidden;position:relative;background:#0b0a12}
.card img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
.ph{width:100%;height:100%;display:grid;place-items:center;align-content:center;gap:0;grid-auto-flow:column}
.ph .d{display:inline-block;width:7px;height:7px;background:#4b4468;margin:0 4px;animation:p 1.1s infinite alternate}
.ph .d:nth-child(2){animation-delay:.18s}.ph .d:nth-child(3){animation-delay:.36s}
@keyframes p{from{opacity:.15}to{opacity:1}}
.badge{position:absolute;top:10px;right:10px;font-size:9px;letter-spacing:.18em;padding:4px 7px;
 background:rgba(73,69,255,.85);color:#fff;border-radius:2px}
.card b{display:block;font-size:16.5px;letter-spacing:.03em;padding:13px 15px 2px;font-weight:600}
.card i{display:block;font-style:normal;color:#9a92ad;font-size:12px;padding:0 15px}
.card span{display:block;color:#645d80;font-size:11px;padding:7px 15px 14px;letter-spacing:.06em}
details{margin-top:44px;border-top:1px solid #2e2a40;padding-top:18px}
summary{cursor:pointer;color:#9a92ad;font-size:12px;letter-spacing:.22em;text-transform:uppercase;list-style:none}
summary::before{content:'▸  '}details[open] summary::before{content:'▾  '}
summary:hover{color:#efeaf7}
details .grid{margin-top:20px}
details .card{opacity:.72}details .card:hover{opacity:1}
</style></head><body><div class="w">
<h1>The Strapi Docs Design Lab</h1>
<p class="sub">the Strapi documentation, re-imagined · thumbnails refresh as the agents work</p>
<div class="grid">${main}</div>
<details><summary>Archives - developed, not retained</summary><div class="grid">${arch}</div></details>
</div><script>setTimeout(function(){location.reload()},180000)</script></body></html>`;
};

http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  if (u === '/' || u === '/index.html') {
    r.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    return r.end(INDEX());
  }
  { const m = u.match(/^\/([A-Za-z0-9-]+)$/);   // bare /key -> /key/ so relative assets resolve
    if (m && byKey[m[1]]) {
      const qs = q.url.includes('?') ? q.url.slice(q.url.indexOf('?')) : '';
      r.writeHead(301, { location: '/' + m[1] + '/' + qs });
      return r.end();
    } }
  if (u === '/gpucheck') {
    r.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    return r.end('<!doctype html><meta charset="utf-8"><title>GPU check</title><link rel="icon" href="/favicon.svg" type="image/svg+xml">'
      + '<body style="background:#0d0a07;color:#f0e4d2;font:15px/1.7 ui-monospace,monospace;padding:40px;max-width:860px;margin:0 auto">'
      + '<h1 style="color:#f4b942;font-size:18px;letter-spacing:.2em">THE LAB GPU CHECK</h1><pre id="o" style="white-space:pre-wrap"></pre>'
      + '<script>(async function(){var o=document.getElementById("o");function w(t){o.textContent+=t+String.fromCharCode(10)}'
      + 'w("UA: "+navigator.userAgent);w("");'
      + 'var combos=[["webgl2",{}],["webgl2",{failIfMajorPerformanceCaveat:false,powerPreference:"default"}],["webgl",{}],["experimental-webgl",{}]];'
      + 'var got=null;for(var i=0;i<combos.length;i++){var c=document.createElement("canvas");var ctx=null,err="";'
      + 'try{ctx=c.getContext(combos[i][0],combos[i][1])}catch(e){err=String(e)}'
      + 'w((ctx?"OK   ":"FAIL ")+combos[i][0]+" "+JSON.stringify(combos[i][1])+(err?"  err: "+err:""));if(ctx&&!got)got=ctx}'
      + 'w("");if(got){var d=got.getExtension("WEBGL_debug_renderer_info");'
      + 'w("GL_RENDERER: "+(d?got.getParameter(d.UNMASKED_RENDERER_WEBGL):got.getParameter(got.RENDERER)));'
      + 'w("GL_VENDOR:   "+(d?got.getParameter(d.UNMASKED_VENDOR_WEBGL):got.getParameter(got.VENDOR)));}'
      + 'else{w("No WebGL context of any kind. This browser profile has GPU rendering off or wedged.");}'
      + 'w("");if(navigator.gpu){try{var a=await navigator.gpu.requestAdapter();'
      + 'w(a?("WebGPU adapter: OK ("+((a.info&&(a.info.description||a.info.vendor))||"info hidden")+")"):"WebGPU adapter: null (refused)")}'
      + 'catch(e){w("WebGPU: threw "+e)}}else{w("WebGPU: navigator.gpu absent")}'
      + 'w("");w("Verdict:");'
      + 'w(got?"WebGL lives here - The Long Light should rise in THIS browser.":"Fix in THIS browser: settings > system > graphics acceleration ON + full relaunch; also check the browser was not launched with --disable-gpu (chrome://version, Command Line).")'
      + '})();</'+'script>');
  }
  /* (2026-09-08) THE LAB'S OWN MARK. The overprint Pierre chose: three press
     passes of one page, out of register, going almost black where all three
     land. Read off the workbench so the drawing has one source of truth, and
     falling back to the copy baked in below if that branch is not checked out. */
  if (u === '/favicon.svg') {
    r.writeHead(200, { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'no-store' });
    return fs.readFile(LAB_MARK_FILE, 'utf8', (e, d) => r.end(e ? LAB_MARK : d));
  }
  if (u === '/__rev') {
    const k = new URL(q.url, 'http://x').searchParams.get('k');
    r.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    return r.end(JSON.stringify(rev(k)));
  }
  if (u.startsWith('/thumbs/')) {
    const f = path.join(THUMBS, path.basename(u));
    return fs.readFile(f, (e, d) => {
      if (e) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'no-store' });
      r.end(d);
    });
  }
  if (u.startsWith('/img/')) {
    const f = path.join(IMG, u.slice(5));
    return fs.readFile(f, (e, d) => {
      if (e) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
      r.end(d);
    });
  }
  const seg = u.split('/').filter(Boolean);
  const key = seg[0];
  if (!byKey[key]) { r.writeHead(404); return r.end('unknown build'); }
  const rest = seg.slice(1).join('/') || 'index.html';
  const f = rest;                       /* only its extension is read below */
  readWorld(key, rest, (e, d) => {
    if (e) {
      if (rest === 'index.html') {
        r.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        return r.end(HOLD(key));
      }
      r.writeHead(404); return r.end();
    }
    const ext = path.extname(f);
    let body = d;
    /* THE RECORDER IS SERVED UNTOUCHED. Every other page gets the live-reload
       script injected below, which reloads whenever that world's files change.
       On FIRST LIGHT's hand-calibration recorder that would throw away an
       unsaved clip in the middle of a take, and those takes cost the owner 70
       seconds of performing gestures on cue. */
    const noInject = /(^|\/)record\.html$/.test(rest);
    if (ext === '.html' && !noInject) {
      /* skip when native: a build that carries its own __labback keeps it */
      const rawhtml = d.toString('utf8');
      let html = rawhtml.includes('__labback')
        ? rawhtml.replace(/<\/body>/i, RELOAD + '</body>')
        : rawhtml.replace(/<\/body>/i, RELOAD + BACKCHIP(key) + '</body>');
      if (/<head[^>]*>/i.test(html)) html = html.replace(/<head[^>]*>/i, (m) => m + FRESH);
      else html = FRESH + html;
      body = Buffer.from(html, 'utf8');
    }
    r.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': 'no-store' });
    r.end(body);
  });
}).listen(PORT, () => console.log('design lab gallery on http://localhost:' + PORT + '/'));
