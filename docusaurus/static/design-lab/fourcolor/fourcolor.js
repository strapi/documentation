/* THE FOUR-COLOR DOCS
   The Strapi documentation as a Silver Age comic line.
   House law: the data IS the story. Every visible fact below is derived from
   content.json, graph.json, communities.json, provenance.json, gitlog-docs.txt. */
(() => {
'use strict';

/* ================= 0. utils ================= */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function el(tag, cls, html){ const n=document.createElement(tag); if(cls)n.className=cls; if(html!=null)n.innerHTML=html; return n; }
function hash32(str){ let h=2166136261>>>0; for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);} return h>>>0; }
function mulberry(seed){ let a=seed>>>0; return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}; }
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
const MONTHS=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const fmtMonth = iso => iso ? MONTHS[+iso.slice(5,7)-1]+' '+iso.slice(0,4) : '';
const fmtNum = n => (+n).toLocaleString('en-US');
const DPR = Math.min(2, window.devicePixelRatio||1);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k,d){ try{ const v=localStorage.getItem('fourcolor.'+k); return v==null?d:JSON.parse(v);}catch(e){return d;} },
  set(k,v){ try{ localStorage.setItem('fourcolor.'+k, JSON.stringify(v)); }catch(e){} }
};
function cvs(w,h,scale){ const c=document.createElement('canvas'); const s=scale||DPR;
  c.width=Math.round(w*s); c.height=Math.round(h*s); c.style.width=w+'px'; c.style.height=h+'px';
  const x=c.getContext('2d'); x.scale(s,s); return c; }
function stripTitle(t){ return String(t||'').replace(/\s*[-|–].*?(Strapi|Documentation).*$/i,'').trim() || t; }
function textOf(html){ const d=el('div','',html); return d.textContent||''; }
function firstSentence(s, max){ s=String(s||'').trim(); const m=s.match(/^.*?[.!?](\s|$)/); let out=m?m[0].trim():s;
  if(out.length>max) out=out.slice(0,max-1).replace(/\s+\S*$/,'')+'…'; return out; }
function bangify(s){ s=s.trim(); if(!s)return s; if(/[.]$/.test(s)) s=s.slice(0,-1)+'!'; else if(!/[!?…]$/.test(s)) s+='!'; return s; }

/* perf instrumentation */
const __fc = window.__fc = { frames:[], long:[], boot:performance.now(), model:null };
try{ new PerformanceObserver(list=>{ for(const e of list.getEntries()) __fc.long.push({t:e.startTime,d:e.duration}); }).observe({entryTypes:['longtask']}); }catch(e){}
let frameRec=0;
function recordFrames(ms){ const end=performance.now()+ms; if(frameRec>end)return; frameRec=end;
  let last=performance.now();
  const step=t=>{ __fc.frames.push(t-last); last=t; if(t<frameRec) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/* ================= 1. state ================= */
let CAST=null; /* the drawn-cast module, wired at boot */
const S = {
  D:null, M:null,
  sound: store.get('sound', true),
  rescued: new Set(store.get('rescued', [])),
  pull: new Set(store.get('pull', [])),
  letters: store.get('letters', []),
  toldTurn: store.get('toldTurn', false),
  view:'rack', book:null, finderMode:null, seriesOpen:null,
  paintQ:[], painting:false, pgCache:new Map(),
};

/* ================= 2. data & model ================= */
async function loadData(){
  const [content, graph, communities, provenance, gitlog] = await Promise.all([
    fetch('content.json').then(r=>r.json()),
    fetch('graph.json').then(r=>r.json()),
    fetch('communities.json').then(r=>r.json()),
    fetch('provenance.json').then(r=>r.json()),
    fetch('gitlog-docs.txt').then(r=>r.text()),
  ]);
  S.D = {content, graph, communities, provenance, gitlog};
}

function buildModel(){
  const {content, graph, communities, provenance, gitlog} = S.D;
  const M = S.M = __fc.model = {};
  M.pages = content.pages; M.order = content.order;

  /* --- graph lists --- */
  M.out = {}; M.inb = {};
  for(const [a,b] of graph.edges){ (M.out[a]=M.out[a]||[]).push(b); (M.inb[b]=M.inb[b]||[]).push(a); }
  M.inCount = s => (graph.inbound[s]||0);
  M.words = graph.words; M.code = graph.code;

  /* --- gitlog: per-page author shares, studio ledger, gone hands --- */
  const fileToSlug={}; for(const id of M.order) fileToSlug['docusaurus/'+M.pages[id].file]=id;
  const perPage={}, ledger={}, byMonth={};
  let commits=0, minDate='9999', maxDate='0000';
  let cur=null;
  for(const line of gitlog.split('\n')){
    if(line.startsWith('C|')){
      const p=line.split('|'); cur={a:p[2], d:p[3], h:+p[4]};
      commits++; if(cur.d<minDate)minDate=cur.d; if(cur.d>maxDate)maxDate=cur.d;
      const L=ledger[cur.a]=ledger[cur.a]||{commits:0,pages:new Set(),first:cur.d,last:cur.d,night:0};
      L.commits++; if(cur.d<L.first)L.first=cur.d; if(cur.d>L.last)L.last=cur.d;
      if(cur.h>=0&&cur.h<6) L.night++;
      const mo=cur.d.slice(0,7); byMonth[mo]=(byMonth[mo]||0)+1;
    } else if(line.trim() && cur){
      const slug=fileToSlug[line.trim()];
      if(slug){ const pp=perPage[slug]=perPage[slug]||{}; pp[cur.a]=(pp[cur.a]||0)+1; ledger[cur.a].pages.add(slug); }
    }
  }
  M.commits=commits; M.epoch=minDate; M.lastPress=maxDate; M.ledger=ledger;
  M.credits={}; for(const s of M.order){
    M.credits[s]=Object.entries(perPage[s]||{}).sort((a,b)=>b[1]-a[1]);
    if(!M.credits[s].length && provenance[s]) M.credits[s]=provenance[s].authors.map(a=>[a,1]);
  }
  const living=new Set(); for(const s of M.order)(provenance[s]?provenance[s].authors:[]).forEach(a=>living.add(a));
  M.livingHands=living;
  M.goneHands=Object.keys(ledger).filter(a=>!living.has(a))
    .map(a=>({name:a,commits:ledger[a].commits,last:ledger[a].last}))
    .sort((a,b)=>b.commits-a.commits);
  M.allHandsCount=Object.keys(ledger).length;
  M.busiest=Object.entries(byMonth).sort((a,b)=>b[1]-a[1])[0];
  M.prov=provenance;

  const epochY=+M.epoch.slice(0,4), epochMo=+M.epoch.slice(5,7);
  M.monthsSince = iso => (+iso.slice(0,4)-epochY)*12 + (+iso.slice(5,7)-epochMo);

  /* --- series (27 communities + the SHOWCASE tryout book) --- */
  const usedNouns=new Set();
  function tighten(label){
    let s=String(label||'').replace(/\(.*?\)/g,'').trim();
    const cut=s.search(/\s(?:for|in)\s/i); if(cut>0 && cut>=8) s=s.slice(0,cut);
    return s.trim();
  }
  function nounFor(hubSlug){
    const pg=M.pages[hubSlug];
    let n = tighten(pg? pg.sidebarLabel : hubSlug.split('/').pop());
    if(usedNouns.has(n.toUpperCase()) && pg) n = tighten(stripTitle(pg.title));
    let up=n.toUpperCase(); let k=2;
    while(usedNouns.has(up)){ up = n.toUpperCase()+' '+('II III IV V'.split(' ')[k-2]||k); k++; }
    usedNouns.add(up); return up;
  }
  const KICKERS=['TALES OF','SHOWCASE PRESENTS','THE SENSATIONAL','STRANGE ADVENTURES OF',
    'ALL-NEW','THE MIGHTY','MYSTERY OF','OUR FIGHTING','THE DARING','HOUSE OF',
    "WORLD'S FINEST",'ADVENTURES OF','SECRET ORIGINS OF','THE BRAVE AND THE BOLD'];
  const clustered=new Set();
  M.series=[];
  const commIds=Object.keys(communities);
  for(const cid of commIds){
    const c=communities[cid];
    const members=M.order.filter(s=>c.members.includes(s));
    members.forEach(m=>clustered.add(m));
    M.series.push(mkSeries(+cid, members, c.hub, nounFor(c.hub)));
  }
  const orphans=M.order.filter(s=>!clustered.has(s));
  if(orphans.length){
    usedNouns.add('DOCS SHOWCASE');
    M.series.push(mkSeries(commIds.length, orphans, orphans[0], 'DOCS SHOWCASE', true));
  }
  function mkSeries(idx, members, hub, noun, tryout){
    const rng=mulberry(hash32('series'+idx+noun));
    let first='9999', last='0000', words=0, cms=0; const hands=new Set();
    for(const s of members){ const pv=provenance[s]; if(!pv)continue;
      if(pv.first<first)first=pv.first; if(pv.last>last)last=pv.last;
      cms+=pv.commits; pv.authors.forEach(a=>hands.add(a)); words+=graph.words[s]||0; }
    const shareTop={}; for(const s of members) for(const [a,n] of (M.credits[s]||[])) shareTop[a]=(shareTop[a]||0)+n;
    const editor=Object.entries(shareTop).sort((a,b)=>b[1]-a[1])[0];
    return { idx, noun, hub, members, tryout:!!tryout,
      kicker: tryout ? 'TRYOUT TALES FROM' : KICKERS[Math.floor(rng()*KICKERS.length)],
      combo: COMBOS[idx % COMBOS.length],
      first, last, words, commits:cms, hands, editor: editor?editor[0]:'the bullpen',
      rng: hash32('c'+idx) };
  }
  const firsts=M.series.map(t=>t.first).sort();
  const medianFirst=firsts[Math.floor(firsts.length/2)];
  for(const t of M.series) t.style = t.first<=medianFirst ? 'schnapp' : 'saladino';

  /* --- per-story issue metadata --- */
  M.issue={};
  for(const t of M.series){
    t.members.forEach((slug,i)=>{
      const pv=provenance[slug]||{first:M.epoch,last:M.epoch,commits:0,night:0,careDays:0,authors:[]};
      const yearOff=clamp(+pv.last.slice(0,4)-epochY,0,5);
      M.issue[slug]={ series:t, iis:i, no:M.monthsSince(pv.last)+1,
        date:pv.last, price:[12,15,20,25,30,35][yearOff],
        uncited: !(graph.inbound[slug]>0), inb:graph.inbound[slug]||0 };
    });
  }
  M.uncited = M.order.filter(s=>M.issue[s].uncited);

  /* --- studio superlatives (all derived) --- */
  let marathon=null, freshest=null, veteran=null, hubMax=null;
  for(const s of M.order){ const pv=provenance[s]; if(!pv)continue;
    if(!marathon||pv.careDays>M.prov[marathon].careDays) marathon=s;
    if(!freshest||pv.last>M.prov[freshest].last) freshest=s;
    if(!hubMax||(graph.inbound[s]||0)>(graph.inbound[hubMax]||0)) hubMax=s;
  }
  let nightOwl=null; for(const [a,L] of Object.entries(ledger)) if(!nightOwl||L.night>ledger[nightOwl].night) nightOwl=a;
  for(const a of M.livingHands){ const L=ledger[a]; if(L&&(!veteran||L.first<ledger[veteran].first)) veteran=a; }
  M.superla={marathon,freshest,veteran,hubMax,nightOwl};

  /* --- search index --- */
  M.index=[];
  for(const slug of M.order){
    const p=M.pages[slug], iss=M.issue[slug];
    M.index.push({slug, h:null, label:p.sidebarLabel||stripTitle(p.title),
      text:(p.sidebarLabel+' '+stripTitle(p.title)+' '+(p.tags||[]).join(' ')+' '+(p.description||'')).toLowerCase(),
      series:iss.series, sub:p.section||''});
    for(const h of p.headings||[]) M.index.push({slug, h:h.id, label:p.sidebarLabel||'',
      text:h.text.toLowerCase(), series:iss.series, sub:h.text});
  }
}

/* ================= 3. the print shop ================= */
const INK={C:'#0e9ad6',M:'#e0417f',Y:'#eec81a',K:'#262015'};
const CHAN_VEC={C:[4,1],M:[1,4],Y:[1,0],K:[1,1]};
const CHAN_S={C:2.05,M:2.05,Y:8.4,K:6.0};
/* 28 hero colours from the period tint book: [ [channel,tint], ... ] */
const COMBOS=[
  [['Y',1],['M',1]],            // engine red
  [['C',1],['M',.5]],           // ultramarine
  [['C',1],['Y',1]],            // emerald
  [['Y',1],['M',.5]],           // orange
  [['M',1],['C',.5]],           // violet
  [['C',1]],                    // process cyan
  [['M',1],['Y',.25]],          // rose red
  [['Y',1],['C',.25]],          // acid gold
  [['C',.5],['Y',1]],           // spring green
  [['M',1],['Y',.5],['K',.25]], // crimson
  [['C',1],['M',1]],            // indigo
  [['C',.5],['M',.25]],         // steel blue
  [['Y',1],['M',.25]],          // golden
  [['C',.25],['Y',.5]],         // celadon
  [['M',.5],['Y',1]],           // vermilion tint
  [['C',.5],['M',.5]],          // dusk purple
  [['Y',.5],['K',.25]],         // olive drab
  [['C',1],['Y',.5]],           // teal
  [['M',.5]],                   // pink
  [['C',.25],['M',1],['Y',.25]],// magenta punch
  [['Y',1],['M',.75||.5]],      // tangerine
  [['C',.75||.5],['Y',.25]],    // ice blue
  [['M',.25],['Y',1]],          // daffodil
  [['C',1],['M',.25]],          // sky
  [['M',1],['Y',1],['K',.25]],  // oxblood
  [['C',.5],['Y',.5]],          // sea green
  [['M',.75||.5],['Y',.5]],     // coral
  [['C',.25],['K',.5]],         // gunmetal
];
function comboRGB(recipe){
  let r=252,g=246,b=228;
  for(const [ch,t] of recipe){
    if(ch==='C'){ r*=(1-.88*t); g*=(1-.30*t); b*=(1-.06*t); }
    if(ch==='M'){ r*=(1-.10*t); g*=(1-.80*t); b*=(1-.42*t); }
    if(ch==='Y'){ r*=(1-.03*t); g*=(1-.12*t); b*=(1-.86*t); }
    if(ch==='K'){ r*=(1-.82*t); g*=(1-.82*t); b*=(1-.80*t); }
  }
  return `rgb(${r|0},${g|0},${b|0})`;
}
const tileCache={};
function screenTile(ch, tint, scale){
  const key=ch+tint+'@'+scale;
  if(tileCache[key]) return tileCache[key];
  const [ux,uy]=CHAN_VEC[ch]; const s=CHAN_S[ch]*(ch==='Y'||ch==='K'?1:1);
  const T=(ux*ux+uy*uy)*s;
  const c=document.createElement('canvas');
  c.width=c.height=Math.max(2,Math.round(T*scale));
  const x=c.getContext('2d'); x.scale(scale,scale);
  const A=(ux*ux+uy*uy)*s*s;
  const r=Math.sqrt(Math.max(0.02,tint)*A/Math.PI);
  x.fillStyle=INK[ch];
  const n=Math.ceil(T/s)+2;
  for(let i=-n;i<=n;i++) for(let j=-n;j<=n;j++){
    let px=(i*ux-j*uy)*s, py=(i*uy+j*ux)*s;
    px=((px%T)+T)%T; py=((py%T)+T)%T;
    for(const dx of [0,-T,T]) for(const dy of [0,-T,T]){
      const X=px+dx, Y=py+dy;
      if(X>-r&&X<T+r&&Y>-r&&Y<T+r){ x.beginPath(); x.arc(X,Y,r,0,7); x.fill(); }
    }
  }
  tileCache[key]=c; return c;
}
const tileURLCache={};
function tileURL(ch,tint){ const k=ch+tint;
  if(!tileURLCache[k]) tileURLCache[k]=screenTile(ch,tint,2).toDataURL();
  return tileURLCache[k]; }
function screenBG(node, recipe, tint){
  const imgs=[], sizes=[];
  for(const [ch] of recipe){
    const [ux,uy]=CHAN_VEC[ch]; const T=(ux*ux+uy*uy)*CHAN_S[ch];
    imgs.push(`url(${tileURL(ch, tint||0.12)})`);
    sizes.push(T+'px '+T+'px');
  }
  node.style.backgroundImage=imgs.join(',');
  node.style.backgroundSize=sizes.join(',');
}
function fillScreened(ctx, path, recipe, drift, scale){
  for(let i=0;i<recipe.length;i++){
    const [ch,t]=recipe[i];
    const dx=drift?drift[ch][0]:0, dy=drift?drift[ch][1]:0;
    ctx.save(); ctx.translate(dx,dy);
    ctx.globalCompositeOperation='multiply';
    if(t>=1){ ctx.fillStyle=INK[ch]; ctx.fill(path); }
    else{
      const pat=ctx.createPattern(screenTile(ch,t,scale||2),'repeat');
      pat.setTransform && pat.setTransform(new DOMMatrix().scale(1/(scale||2)));
      ctx.fillStyle=pat; ctx.fill(path);
    }
    ctx.restore();
  }
  ctx.globalCompositeOperation='source-over';
}
function mkDrift(rng, amt){
  const a=amt==null?1.1:amt;
  return { C:[(rng()*2-1)*a,(rng()*2-1)*a], M:[(rng()*2-1)*a,(rng()*2-1)*a],
           Y:[(rng()*2-1)*a*.6,(rng()*2-1)*a*.6], K:[0,0] };
}

let PAPER_URL=null, DOTS_URL=null;
function makePaper(){
  const c=document.createElement('canvas'); c.width=c.height=280;
  const x=c.getContext('2d');
  x.fillStyle='#ecdfc0'; x.fillRect(0,0,280,280);
  const rng=mulberry(20221102);
  for(let i=0;i<900;i++){ const v=rng();
    x.fillStyle=v<0.75?`rgba(112,88,48,${0.02+rng()*0.05})`:`rgba(255,252,240,${0.03+rng()*0.05})`;
    const w=1+rng()*1.8; x.fillRect(rng()*280,rng()*280,w,w*(0.5+rng()));
  }
  for(let i=0;i<26;i++){ x.strokeStyle=`rgba(120,95,55,${0.025+rng()*0.03})`;
    x.lineWidth=.6+rng(); x.beginPath();
    const y=rng()*280; x.moveTo(-5,y); x.bezierCurveTo(90,y+rng()*8-4,190,y+rng()*8-4,285,y+rng()*6-3); x.stroke();
  }
  PAPER_URL=`url(${c.toDataURL()})`;
  DOTS_URL=`url(${tileURL('K',0.25)})`;
}
function paperFill(ctx,w,h,rng){
  ctx.fillStyle='#ecdfc0'; ctx.fillRect(0,0,w,h);
  const r=rng||mulberry(7); ctx.save();
  for(let i=0;i<w*h/900;i++){ const v=r();
    ctx.fillStyle=v<0.75?`rgba(112,88,48,${0.02+r()*0.05})`:`rgba(255,252,240,${0.03+r()*0.05})`;
    const s=1+r()*1.7; ctx.fillRect(r()*w,r()*h,s,s*(0.5+r()));
  }
  ctx.restore();
}

/* rough panel borders (four hands, no stamped repeats) */
function makeRoughBorders(){
  let css='';
  for(let v=0;v<4;v++){
    const c=document.createElement('canvas'); c.width=c.height=128;
    const x=c.getContext('2d'); const rng=mulberry(900+v*77);
    x.strokeStyle='#231c12'; x.lineWidth=5; x.lineJoin='round'; x.lineCap='round';
    const wob=()=> (rng()*2-1)*2.2;
    x.beginPath();
    const P=[[8,8],[64,6+wob()],[120,8],[122,64+wob()],[120,120],[64,122+wob()],[8,120],[6,64+wob()]];
    x.moveTo(P[0][0]+wob(),P[0][1]+wob());
    for(let i=1;i<=8;i++){ const p=P[i%8]; const q=P[(i-1)%8];
      x.quadraticCurveTo((p[0]+q[0])/2+wob(),(p[1]+q[1])/2+wob(),p[0]+(i===8?0:wob()*.5),p[1]+(i===8?0:wob()*.5)); }
    x.closePath(); x.stroke();
    css+=`.panel.rough.r${v}{border-image-source:url(${c.toDataURL()});}\n`;
  }
  const st=document.createElement('style');
  st.textContent=css+
    `.cpage,.pageslot,.leaf .face{background-image:${PAPER_URL};}\n`+
    `.imgpanel .imgdots{background-image:url(${tileURL('K',0.09)});background-size:6px 6px;opacity:.32;}\n`;
  document.head.appendChild(st);
}

/* seals: the Docs Code Authority stamp & the DC bullet */
let STAMP=null, BULLET=null;
function makeSeals(){
  { const w=74,h=100,c=cvs(w,h,2); const x=c.getContext('2d');
    x.fillStyle='#f6efdd'; x.strokeStyle='#231c12'; x.lineWidth=3;
    rr(x,2,2,w-4,h-4,4); x.fill(); x.stroke();
    x.lineWidth=1.2; rr(x,6,6,w-12,h-12,2); x.stroke();
    x.fillStyle='#231c12'; x.textAlign='center';
    x.font='600 8.6px Oswald,"Arial Narrow",sans-serif';
    x.fillText('APPROVED',w/2,20); x.fillText('BY THE',w/2,31);
    x.font='600 16px Oswald,"Arial Narrow",sans-serif';
    x.fillText('DOCS',w/2,49); x.fillText('CODE',w/2,65);
    x.font='600 8.2px Oswald,"Arial Narrow",sans-serif';
    x.fillText('AUTHORITY',w/2,82);
    x.strokeStyle='#231c12'; x.lineWidth=1;
    x.beginPath(); x.moveTo(12,71); x.lineTo(w-12,71); x.stroke();
    STAMP=c; }
  { const d=84,c=cvs(d,d,2); const x=c.getContext('2d');
    x.beginPath(); x.arc(d/2,d/2,d/2-2,0,7); x.fillStyle='#f6efdd'; x.fill();
    x.lineWidth=3; x.strokeStyle='#231c12'; x.stroke();
    x.beginPath(); x.arc(d/2,d/2,d/2-11,0,7); x.lineWidth=1.4; x.stroke();
    x.fillStyle='#231c12'; x.textAlign='center';
    x.font='600 31px Oswald,"Arial Narrow",sans-serif'; x.fillText('DC',d/2,d/2+11);
    x.font='600 6.2px Oswald,"Arial Narrow",sans-serif';
    arcText(x,'THE FOUR-COLOR DOCS',d/2,d/2,d/2-6.4,-Math.PI*0.82,Math.PI*-0.18);
    arcText(x,'EST. '+fmtMonth(S.M.epoch),d/2,d/2,d/2-6.4,Math.PI*0.72,Math.PI*0.28,true);
    BULLET=c; }
}
function rr(x,a,b,w,h,r){ x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r); x.arcTo(a+w,b+h,a,b+h,r); x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath(); }
function arcText(x,txt,cx,cy,r,a0,a1,flip){
  const n=txt.length; if(n<2)return;
  for(let i=0;i<n;i++){ const a=a0+(a1-a0)*i/(n-1);
    x.save(); x.translate(cx+Math.cos(a)*r, cy+Math.sin(a)*r);
    x.rotate(a+(flip?-Math.PI/2:Math.PI/2)); x.fillText(txt[i],0,0); x.restore(); }
}

/* ================= 4. the letterer ================= */
function drawLettering(ctx, text, o){
  /* o: x,y (baseline center), w max width, size, color, style, arc, telescope, seed, outline */
  const rng=mulberry(o.seed||1);
  const sal=o.style==='saladino';
  const words=String(text).toUpperCase();
  let size=o.size;
  /* the two hands of the line: Schnapp-era logos set in stately squared
     gothic (Oswald), Saladino-era in the wilder display cut (Bangers) */
  const fam=sal?'400 %px Bangers,Impact,"Arial Narrow",sans-serif'
              :'600 %px Oswald,Impact,"Arial Narrow",sans-serif';
  ctx.font=fam.replace('%',size);
  const track=(sal?0.045:0.075)*size;
  const meas=t=>{ let w=0; for(const ch of t) w+=ctx.measureText(ch).width+track; return w-track; };
  let tw=meas(words);
  if(tw>o.w){ size=size*o.w/tw; ctx.font=fam.replace('%',size); tw=meas(words); }
  const arcAmt=(o.arc==null?0.10:o.arc);
  const tele=o.telescope==null?(sal?4:3):o.telescope;
  let x=o.x-tw/2;
  const chars=[];
  for(const ch of words){
    const cw=ctx.measureText(ch).width;
    const tx=(x+cw/2-(o.x-tw/2))/Math.max(1,tw);
    const dy=-arcAmt*size*2.6*4*tx*(1-tx);
    const rot=arcAmt*1.4*(0.5-tx)* -1 + (sal?(rng()*2-1)*0.05:(rng()*2-1)*0.014);
    const jy=sal?(rng()*2-1)*size*0.045:(rng()*2-1)*size*0.012;
    chars.push({ch,cx:x+cw/2,dy:dy+jy,rot,scale:sal?(0.96+rng()*0.1):1});
    x+=cw+track;
  }
  const draw=(fill,ox,oy,strokeW)=>{
    for(const c of chars){
      ctx.save(); ctx.translate(c.cx+ox, o.y+c.dy+oy);
      ctx.rotate(c.rot); if(sal) ctx.transform(1,0,-0.13,1,0,0);
      ctx.scale(c.scale,c.scale);
      ctx.textAlign='center';
      if(strokeW){ ctx.lineWidth=strokeW; ctx.lineJoin='round'; ctx.strokeStyle=fill; ctx.strokeText(c.ch,0,0); }
      else { ctx.fillStyle=fill; ctx.fillText(c.ch,0,0); }
      ctx.restore();
    }
  };
  const tdx=sal?size*0.034:size*0.045, tdy=sal?size*0.042:size*0.055;
  for(let i=tele;i>=1;i--) draw(o.teleColor||'rgba(35,28,18,0.92)', tdx*i, tdy*i, size*0.16);
  for(let i=tele;i>=1;i--) draw(o.teleFill||'#3f3524', tdx*i, tdy*i);
  draw('#231c12',0,0,size*(o.outline||(sal?0.12:0.17)));
  draw(o.color,0,0);
  if(o.shine!==false){
    ctx.save(); ctx.globalAlpha=0.85;
    for(const c of chars){
      ctx.save(); ctx.translate(c.cx, o.y+c.dy); ctx.rotate(c.rot); if(sal)ctx.transform(1,0,-0.13,1,0,0);
      ctx.scale(c.scale,c.scale); ctx.textAlign='center';
      ctx.fillStyle=o.shineColor||'rgba(255,255,255,0.34)';
      ctx.save(); ctx.beginPath(); ctx.rect(-size, -size*1.1, size*2, size*0.42); ctx.clip();
      ctx.fillText(c.ch,0,0); ctx.restore(); ctx.restore();
    }
    ctx.restore();
  }
  return size;
}
function fitLogoLines(noun){
  const wds=noun.split(/\s+/);
  if(wds.length<2 || noun.length<=13) return [noun];
  if(noun.length<=26 && wds.length>=2){
    let best=null;
    for(let i=1;i<wds.length;i++){
      const a=wds.slice(0,i).join(' '), b=wds.slice(i).join(' ');
      const d=Math.abs(a.length-b.length);
      if(!best||d<best.d) best={d,a,b};
    }
    return [best.a,best.b];
  }
  const third=Math.ceil(wds.length/3);
  return [wds.slice(0,third).join(' '),wds.slice(third,third*2).join(' '),wds.slice(third*2).join(' ')].filter(Boolean);
}

/* burst path (spiky balloon / impact star) */
function burstPath(cx,cy,rx,ry,spikes,rng,depth){
  const p=new Path2D(); const d=depth==null?0.32:depth;
  for(let i=0;i<spikes*2;i++){
    const a=Math.PI*i/spikes + (rng?(rng()*2-1)*0.06:0);
    const rad=(i%2===0)?1:(1-d-(rng?rng()*0.12:0));
    const X=cx+Math.cos(a)*rx*rad, Y=cy+Math.sin(a)*ry*rad;
    i===0?p.moveTo(X,Y):p.lineTo(X,Y);
  }
  p.closePath(); return p;
}

/* ================= 5. covers ================= */
function coverArch(slug){
  const M=S.M; const inb=M.inCount(slug);
  const words=M.words[slug]||1, code=M.code[slug]||0;
  if(inb>=10) return 'cosmic';
  if(code/words>0.55) return 'tech';
  if(words<420 && code===0) return 'romance';
  return 'action';
}
/* does this story harbor a villain? (a caution/warning/danger admonition) */
const dangerCache=new Map();
function pageDanger(slug){
  if(dangerCache.has(slug)) return dangerCache.get(slug);
  let found=null;
  const walk=bs=>{ for(const b of bs||[]){
    if(found) return;
    if(b.t==='admonition'&&/^(caution|warning|danger)$/.test(b.kind||'')){
      found=(b.title||'')+' '+(b.blocks||[]).map(k=>k.html||'').join(' ').slice(0,300); return; }
    if(b.blocks) walk(b.blocks);
    if(b.tabs) for(const t of b.tabs) walk(t.blocks);
    if(b.cols) for(const c of b.cols) walk(c);
    if(b.items) for(const i of b.items) if(i&&i.blocks) walk(i.blocks);
  }};
  walk((S.M.pages[slug]||{}).blocks);
  dangerCache.set(slug,found);
  return found;
}
function paintCover(canvas, slug, W, Hc, mode){
  const M=S.M, iss=M.issue[slug], t=iss.series, pg=M.pages[slug];
  const x=canvas.getContext('2d');
  const seed=hash32('cover'+slug); const rng=mulberry(seed);
  const drift=mkDrift(rng, mode==='mini'?0.7:1.2);
  const u=W/100;
  paperFill(x,W,Hc,mulberry(seed^7));
  const arch=coverArch(slug);
  const hero=t.combo;
  const heroRGB=comboRGB(hero);
  const danger=pageDanger(slug);
  const cc=CAST?CAST.coverComp(slug,arch,!!danger):null;

  /* ---- art region ---- */
  const artY=Hc*0.235, artH=Hc*0.625;
  x.save(); x.beginPath(); x.rect(u*2.4,artY,W-u*4.8,artH); x.clip();
  const artR={x:u*2.4,y:artY,w:W-u*4.8,h:artH};
  /* where the star will stand: background linework keeps out of it */
  let keep=null;
  if(cc){
    const c2=cc.comp;
    if(c2==='charge') keep={x:artR.x+artR.w*(danger?0.0:0.06),y:artR.y+artR.h*0.10,w:artR.w*0.70,h:artR.h*0.90};
    else if(c2==='menace') keep={x:artR.x,y:artR.y+artR.h*0.36,w:artR.w*0.58,h:artR.h*0.64};
    else if(c2==='duo') keep={x:artR.x,y:artR.y+artR.h*0.16,w:artR.w,h:artR.h*0.84};
    else if(c2==='quiet') keep={x:artR.x+artR.w*0.10,y:artR.y+artR.h*0.22,w:artR.w*0.80,h:artR.h*0.78};
  }
  paintArt(x,rng,cc?cc.bg:arch,t,artR,drift,slug,keep);
  /* the star of the book, staged eight different ways across a run */
  if(CAST) CAST.coverFigures(x,t,artR,arch,rng,drift,slug,danger,cc);
  x.restore();
  x.strokeStyle='#231c12'; x.lineWidth=Math.max(1.6,u*0.55);
  x.strokeRect(u*2.4,artY,W-u*4.8,artH);

  /* ---- go-go checks band ---- */
  const chk=Hc*0.042; const n=16; const cw=W/n, ch2=chk/2;
  for(let r2=0;r2<2;r2++) for(let i=0;i<n;i++){
    if((i+r2)%2===0){ const p=new Path2D(); p.rect(i*cw,r2*ch2,cw+0.4,ch2+0.4); fillScreened(x,p,hero,drift,2); }
  }
  x.fillStyle='#231c12'; x.fillRect(0,chk,W,Math.max(1,u*0.4));

  /* ---- masthead ---- */
  const bulD=u*17;
  x.drawImage(BULLET, u*2.4, chk+u*1.6, bulD, bulD);
  /* issue box */
  x.font=`600 ${u*6.6}px Oswald,"Arial Narrow",sans-serif`; x.textAlign='left'; x.fillStyle='#231c12';
  x.fillText('#'+iss.no, u*21.5, chk+u*8.6);
  x.font=`600 ${u*3.6}px Oswald,"Arial Narrow",sans-serif`;
  x.fillText(iss.price+'¢', u*21.5, chk+u*13.4);
  x.fillText(mode==='mini'?(MONTHS[+iss.date.slice(5,7)-1]+' '+iss.date.slice(2,4)):fmtMonth(iss.date), u*21.5, chk+u*17.6);
  /* the stamp */
  const stw=u*13.4;
  x.drawImage(STAMP, W-u*2.4-stw, chk+u*1.4, stw, stw*100/74);
  /* kicker */
  x.font=`600 ${u*3.9}px Oswald,"Arial Narrow",sans-serif`; x.textAlign='center';
  x.fillStyle='#231c12';
  x.fillText(t.kicker, W*0.5, chk+u*4.6);
  /* series logo */
  const lines=fitLogoLines(t.noun);
  const logoY0=chk+u*10.5;
  let ly=logoY0;
  const lh=(Hc*0.235-logoY0-u*1)/lines.length;
  lines.forEach((ln,i)=>{
    drawLettering(x, ln, { x:W*0.5+ (i%2?u*1.2:-u*0.6), y:ly+lh*0.72, w:W*(lines.length>1?0.68:0.62),
      size:Math.min(lh*0.98,u*(lines.length>1?11.5:14.5)), color:heroRGB,
      style:t.style, seed:seed+i, arc: i===0?0.13:0.02, telescope: mode==='mini'?2:3 });
    ly+=lh;
  });

  /* ---- story banner (this issue) ---- */
  const st=stripTitle(pg.sidebarLabel||pg.title).toUpperCase();
  const bannY=artY+artH;
  x.save(); x.translate(W/2,bannY+ (Hc-bannY)/2); x.rotate(-0.012);
  const bw=W*0.92, bh=(Hc-bannY)*0.74;
  x.fillStyle='#f6efdd'; x.strokeStyle='#231c12'; x.lineWidth=u*0.7;
  x.fillRect(-bw/2,-bh/2,bw,bh); x.strokeRect(-bw/2,-bh/2,bw,bh);
  x.fillStyle='#8f1d12'; x.font=`600 ${u*3.4}px Oswald,"Arial Narrow",sans-serif`; x.textAlign='center';
  x.fillText('THIS ISSUE:',0,-bh/2+u*4.4);
  x.fillStyle='#231c12';
  let stSize=u*5.6; x.font=`400 ${stSize}px Bangers,Impact,sans-serif`;
  if(x.measureText(st).width>bw*0.92){ stSize*=bw*0.92/x.measureText(st).width; x.font=`400 ${stSize}px Bangers,Impact,sans-serif`; }
  x.fillText(st,0,bh/2-u*2.6);
  x.restore();

  /* teaser blurb burst (issue mode only) */
  if(mode!=='mini'){
    const tz=bangify(firstSentence(pg.description||textOf((pg.blocks.find(b=>b.t==='tldr')||{}).html||''),95)).toUpperCase();
    if(tz && tz.length>4){
      const words=tz.split(' '); const linesB=[]; let cur='';
      for(const w of words){ if((cur+' '+w).trim().length>20){ linesB.push(cur.trim()); cur=w; } else cur+=' '+w; }
      if(cur.trim()) linesB.push(cur.trim());
      const bl=linesB.slice(0,3);
      /* a cut sentence says so honestly */
      if(linesB.length>3) bl[2]=bl[2].replace(/[ .,;:!—-]*$/,'')+'…';
      /* corner pick: never dead-center on the figure — left for the comps
         whose star holds the right side, right for the rest, split for duo */
      const cmp=cc?cc.comp:'charge';
      const bxf=(cmp==='facecrop'||cmp==='cosmicburst'||cmp==='gallery')?0.27
               :(cmp==='duo')?0.5:0.73;
      /* measured fit: the longest line must sit INSIDE the burst's inner
         edge — grow the burst a little, then shrink the lettering */
      let fs2=u*3.6;
      x.font=`400 ${fs2}px "Patrick Hand","Segoe Print",cursive`;
      let maxW=Math.max(...bl.map(L=>x.measureText(L).width));
      const brx=Math.max(W*0.20, Math.min(W*0.255, (maxW/2)/0.58));
      if(maxW/2 > brx*0.58){
        fs2*=(brx*0.58)/(maxW/2);
        x.font=`400 ${fs2}px "Patrick Hand","Segoe Print",cursive`;
      }
      const lh2=fs2*1.16;
      const bry=fs2*1.2+bl.length*lh2*0.5+u*1.2;
      /* sit the whole burst ABOVE the STARRING plate: no collisions, ever */
      const bx=W*bxf, by=artY+artH-u*8.8-bry;
      const bp=burstPath(bx,by,brx,bry,11,rng,0.22);
      x.save();
      x.fillStyle='#f6efdd'; x.fill(bp);
      x.strokeStyle='#231c12'; x.lineWidth=u*0.65; x.stroke(bp);
      x.fillStyle='#231c12'; x.textAlign='center';
      bl.forEach((L,i)=>x.fillText(L,bx,by-(bl.length-1)*lh2*0.5+i*lh2+fs2*0.32));
      x.restore();
    }
  }

  /* corner flag for the never-reprinted */
  if(iss.uncited){
    x.save(); x.translate(u*2.4,artY); x.rotate(-0.06);
    x.fillStyle='#c22a1c'; x.fillRect(-u*1,u*1.5,u*34,u*5.4);
    x.strokeStyle='#231c12'; x.lineWidth=u*0.5; x.strokeRect(-u*1,u*1.5,u*34,u*5.4);
    x.fillStyle='#fff'; x.font=`600 ${u*3.3}px Oswald,"Arial Narrow",sans-serif`; x.textAlign='center';
    x.fillText('NEVER REPRINTED — 1 OF '+S.M.uncited.length, u*16, u*5.3);
    x.restore();
  }
  /* trim edge */
  x.strokeStyle='rgba(35,28,18,.65)'; x.lineWidth=1; x.strokeRect(0.5,0.5,W-1,Hc-1);
}
function paintArt(x,rng,arch,t,R,drift,slug,keep){
  const hero=t.combo, u=R.w/100;
  const heroSolid=comboRGB(hero);
  const dim=r=>r.map(([c,tt])=>[c,clamp(tt*0.5,0.25,0.5)]);
  const alt=COMBOS[(t.idx+9)%COMBOS.length];
  if(arch==='cosmic'){
    /* deep space in the series' own ink */
    const bg=new Path2D(); bg.rect(R.x,R.y,R.w,R.h);
    fillScreened(x,bg,[[hero[0][0],1],['K',.5]],drift,2);
    /* paper stars */
    x.fillStyle='#f0e6cb';
    for(let i=0;i<60;i++){ const s=.6+rng()*1.7; x.fillRect(R.x+rng()*R.w,R.y+rng()*R.h,s,s); }
    for(let i=0;i<4;i++) { x.save(); x.fillStyle='#f0e6cb'; sparkle(x,R.x+rng()*R.w,R.y+rng()*R.h*0.5,u*(1.6+rng()*1.6)); x.restore(); }
    /* the cosmic burst, off-center by seed */
    const cx=R.x+R.w*(0.34+rng()*0.32), cy=R.y+R.h*(0.34+rng()*0.2);
    const rays=clamp(t.members.length,10,30);
    for(let i=0;i<rays;i++){
      const a=Math.PI*2*i/rays+rng()*0.06;
      const wr=0.035+rng()*0.03;
      const p=new Path2D();
      p.moveTo(cx,cy);
      p.lineTo(cx+Math.cos(a-wr)*R.w*0.95, cy+Math.sin(a-wr)*R.w*0.95);
      p.lineTo(cx+Math.cos(a+wr)*R.w*0.95, cy+Math.sin(a+wr)*R.w*0.95);
      p.closePath();
      if(i%3===0){ x.fillStyle='rgba(238,220,175,0.92)'; x.fill(p); }
      else if(i%3===1) fillScreened(x,p,[['Y',.5]],drift,2);
    }
    /* Kirby crackle: black mass ring with paper bubbles punched out */
    const inb=S.M.inCount(slug);
    const ring=R.w*(0.21+clamp(inb,0,40)*0.0012);
    x.fillStyle='#231c12';
    const lumps=34;
    x.beginPath();
    for(let i=0;i<=lumps;i++){
      const a=Math.PI*2*i/lumps;
      const rr0=ring*(0.82+rng()*0.42);
      const bx=cx+Math.cos(a)*rr0, by=cy+Math.sin(a)*rr0*0.92;
      i===0?x.moveTo(bx,by):x.quadraticCurveTo(
        cx+Math.cos(a-Math.PI/lumps)*rr0*1.16, cy+Math.sin(a-Math.PI/lumps)*rr0*1.1, bx,by);
    }
    x.closePath();
    const inner=ring*0.62;
    x.moveTo(cx+inner,cy);
    x.arc(cx,cy,inner,0,Math.PI*2,true);
    x.fill('evenodd');
    /* paper bubbles inside the black */
    x.fillStyle='#ecdfc0';
    const bubbles=clamp(inb*2,14,44);
    for(let i=0;i<bubbles;i++){
      const a=rng()*Math.PI*2, rr0=ring*(0.70+rng()*0.38);
      const bx=cx+Math.cos(a)*rr0, by=cy+Math.sin(a)*rr0*0.92;
      x.beginPath(); x.arc(bx,by,u*(0.6+rng()*1.3),0,7); x.fill();
    }
    /* burning core */
    const core=burstPath(cx,cy,inner*0.86,inner*0.86,11,rng,0.34);
    fillScreened(x,core,[['Y',1]],drift,2);
    x.strokeStyle='#231c12'; x.lineWidth=u*0.7; x.stroke(core);
    const core2=burstPath(cx,cy,inner*0.5,inner*0.5,9,rng,0.3);
    x.fillStyle='#f4ead0'; x.fill(core2);
  }
  else if(arch==='tech'){
    const bg=new Path2D(); bg.rect(R.x,R.y,R.w,R.h);
    fillScreened(x,bg,dim(alt),drift,2);
    /* machine blocks */
    for(let i=0;i<5;i++){
      const bw=R.w*(0.16+rng()*0.24), bh=R.h*(0.18+rng()*0.36);
      const bx0=R.x+rng()*(R.w-bw), by0=R.y+R.h*0.12+rng()*(R.h*0.75-bh);
      const p=new Path2D(); p.rect(bx0,by0,bw,bh);
      fillScreened(x,p,i%2?hero:[['K',.25]],drift,2);
      x.strokeStyle='#231c12'; x.lineWidth=u*0.7; x.stroke(p);
      x.fillStyle='#231c12';
      for(let rv=0;rv<Math.floor(bw/(u*6));rv++) { x.beginPath(); x.arc(bx0+u*3+rv*u*6, by0+u*3, u*0.8,0,7); x.fill(); }
    }
    /* perspective rules */
    x.strokeStyle='rgba(35,28,18,.8)'; x.lineWidth=u*0.45;
    const vy=R.y+R.h*0.5;
    for(let i=0;i<9;i++){ x.beginPath(); x.moveTo(R.x, vy+(i-4)*R.h*0.16); x.lineTo(R.x+R.w, vy+(i-4)*R.h*0.30); x.stroke(); }
    /* the bolt */
    const bx0=R.x+R.w*(0.25+rng()*0.45);
    const bolt=new Path2D();
    bolt.moveTo(bx0,R.y); bolt.lineTo(bx0-u*9,R.y+R.h*0.5); bolt.lineTo(bx0+u*1,R.y+R.h*0.48);
    bolt.lineTo(bx0-u*7,R.y+R.h*0.95); bolt.lineTo(bx0+u*8,R.y+R.h*0.42); bolt.lineTo(bx0-u*1,R.y+R.h*0.44);
    bolt.lineTo(bx0+u*8,R.y); bolt.closePath();
    fillScreened(x,bolt,[['Y',1]],drift,2);
    x.strokeStyle='#231c12'; x.lineWidth=u*0.7; x.stroke(bolt);
  }
  else if(arch==='romance'){
    const bg=new Path2D(); bg.rect(R.x,R.y,R.w,R.h);
    fillScreened(x,bg,[[hero[0][0],.25]],drift,2);
    const p1=new Path2D(); p1.arc(R.x+R.w*0.32,R.y+R.h*0.4,R.w*0.30,0,7);
    fillScreened(x,p1,dim(hero),drift,2);
    x.strokeStyle='#231c12'; x.lineWidth=u*0.6; x.stroke(p1);
    const p2=new Path2D(); p2.arc(R.x+R.w*0.72,R.y+R.h*0.62,R.w*0.24,0,7);
    fillScreened(x,p2,[['Y',.5]],drift,2); x.stroke(p2);
    /* quiet arcs */
    x.lineWidth=u*1.1;
    for(let i=0;i<4;i++){
      x.strokeStyle=i%2?'#231c12':heroSolid;
      x.beginPath(); x.arc(R.x+R.w*0.5, R.y+R.h*1.25, R.w*(0.55+i*0.09), Math.PI*1.15, Math.PI*1.85); x.stroke();
    }
    x.fillStyle='#231c12';
    for(let i=0;i<3;i++){ const sx=R.x+R.w*(0.14+i*0.34), sy=R.y+R.h*(0.14+rng()*0.1);
      sparkle(x,sx,sy,u*(2+rng()*1.6)); }
  }
  else { /* action */
    const cx=R.x+(rng()<0.5?0:R.w), cy=R.y;
    const wedges=clamp(8+Math.floor(t.members.length/2),8,20);
    for(let i=0;i<wedges;i++){
      const a0=Math.PI*(0.5*i/wedges)+ (cx>R.x?Math.PI*0.5:0);
      const p=new Path2D();
      p.moveTo(cx,cy);
      p.lineTo(cx+Math.cos(a0)*R.w*1.7, cy+Math.sin(a0)*R.w*1.7);
      p.lineTo(cx+Math.cos(a0+Math.PI*0.5/wedges)*R.w*1.7, cy+Math.sin(a0+Math.PI*0.5/wedges)*R.w*1.7);
      p.closePath();
      if(i%2===0) fillScreened(x,p,dim(hero),drift,2);
    }
    /* charging silhouette — the great inked swoosh */
    const sw=new Path2D();
    const yb=R.y+R.h*0.72;
    sw.moveTo(R.x, yb);
    sw.bezierCurveTo(R.x+R.w*0.3, yb-R.h*(0.28+rng()*0.2), R.x+R.w*0.55, yb+R.h*0.1, R.x+R.w, yb-R.h*0.34);
    sw.lineTo(R.x+R.w, yb+R.h*0.05);
    sw.bezierCurveTo(R.x+R.w*0.6, yb+R.h*0.22, R.x+R.w*0.3, yb-R.h*0.02, R.x, yb+R.h*0.16);
    sw.closePath();
    x.fillStyle='#231c12'; x.fill(sw);
    const p2=new Path2D();
    p2.moveTo(R.x,yb+R.h*0.1);
    p2.bezierCurveTo(R.x+R.w*0.35,yb-R.h*0.02,R.x+R.w*0.6,yb+R.h*0.24,R.x+R.w,yb+R.h*0.02);
    p2.lineTo(R.x+R.w,R.y+R.h); p2.lineTo(R.x,R.y+R.h); p2.closePath();
    fillScreened(x,p2,hero,drift,2);
    const imp=burstPath(R.x+R.w*(0.62+rng()*0.2),R.y+R.h*0.34,u*11,u*11,8,rng,0.42);
    fillScreened(x,imp,[['Y',1]],drift,2);
    x.strokeStyle='#231c12'; x.lineWidth=u*0.7; x.stroke(imp);
    /* speed lines — clipped OUT of the star's ground so they never
       read as scribbles across a cowl or cape */
    x.save();
    if(keep){ x.beginPath(); x.rect(R.x,R.y,R.w,R.h);
      x.rect(keep.x,keep.y,keep.w,keep.h); x.clip('evenodd'); }
    x.strokeStyle='#231c12'; x.lineWidth=u*0.5;
    for(let i=0;i<7;i++){ const yy=R.y+R.h*(0.12+i*0.09)+rng()*u;
      x.beginPath(); x.moveTo(R.x+R.w*(0.05+rng()*0.2),yy); x.lineTo(R.x+R.w*(0.65+rng()*0.3),yy+u*2); x.stroke(); }
    x.restore();
  }
}
function sparkle(x,cx,cy,r){
  x.beginPath();
  x.moveTo(cx,cy-r); x.quadraticCurveTo(cx,cy,cx+r,cy); x.quadraticCurveTo(cx,cy,cx,cy+r);
  x.quadraticCurveTo(cx,cy,cx-r,cy); x.quadraticCurveTo(cx,cy,cx,cy-r); x.fill();
}

/* paint queue — never a long task */
function queuePaint(canvas, slug, w, h, mode){
  S.paintQ.push({canvas,slug,w,h,mode});
  if(!S.painting){ S.painting=true; requestAnimationFrame(paintTick); }
}
function paintTick(){
  const t0=performance.now();
  while(S.paintQ.length && performance.now()-t0<8){
    const j=S.paintQ.shift();
    paintCover(j.canvas, j.slug, j.w, j.h, j.mode);
  }
  if(S.paintQ.length) requestAnimationFrame(paintTick); else S.painting=false;
}

/* ================= 6. block renderer ================= */
function renderBlocks(blocks, out){
  out=out||[];
  for(const b of blocks||[]) { const n=renderBlock(b); if(n) out.push(n); }
  return out;
}
function renderBlock(b){
  switch(b.t){
    case 'p': return el('div','narr','<p>'+b.html+'</p>');
    case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
      const cls=b.t==='h2'?'chapter':(b.t==='h3'?'chapter sub':'chapter subsub');
      const n=el('div','panel '+cls); n.dataset.hid=b.id||'';
      n.appendChild(el('div','ch-txt',esc(b.text)));
      return n;
    }
    case 'ul': case 'ol': return listDOM(b);
    case 'table': return tableDOM(b);
    case 'code': return codeDOM(b);
    case 'img': return imgDOM(b);
    case 'admonition': return admonitionDOM(b);
    case 'details': return detailsDOM(b);
    case 'tabs': return tabsDOM(b);
    case 'endpoint': return endpointDOM(b);
    case 'cards': return cardsDOM(b);
    case 'columns': {
      const n=el('div','twocol');
      for(const col of b.cols){ const c=el('div'); renderBlocks(col).forEach(k=>c.appendChild(k)); n.appendChild(c); }
      return n;
    }
    case 'hr': return el('div','scenebreak','✶ ✶ ✶');
    case 'badge': return el('div','', `<span class="chip" title="${esc(b.tooltip||'')}">${esc(b.label||b.kind)}</span>`);
    case 'tldr': return null;
    default: return null;
  }
}
function listDOM(b){
  const n=el(b.t==='ol'?'ol':'ul');
  if(b.t==='ol'&&b.start&&b.start!==1) n.start=b.start;
  for(const it of b.items){
    const li=el('li');
    if(typeof it==='string') li.innerHTML=it;
    else { li.innerHTML=it.html||''; renderBlocks(it.blocks).forEach(k=>{k.style.marginTop='6px'; li.appendChild(k);}); }
    n.appendChild(li);
  }
  return n;
}
function tableDOM(b){
  const wrap=el('div','panel rough r1 tablepanel');
  const sc=el('div','tp-scroll');
  const t=el('table','cx');
  if(b.head&&b.head.length){ const tr=el('tr'); b.head.forEach(h=>tr.appendChild(el('th','',h))); t.appendChild(tr); }
  for(const row of b.rows||[]){ const tr=el('tr'); row.forEach(c=>tr.appendChild(el('td','',c))); t.appendChild(tr); }
  sc.appendChild(t); wrap.appendChild(sc); return wrap;
}
function codeDOM(b){
  const n=el('div','panel tech');
  const head=el('div','tech-head');
  head.appendChild(el('span','tt', esc(b.title||'TECHNICAL PANEL')));
  const right=el('span');
  const copy=el('button','copychip','CLIP');
  copy.addEventListener('click',()=>{ try{navigator.clipboard.writeText(b.code);}catch(e){} toast('CLIPPED TO YOUR BOARD!'); SFX.tick(); });
  right.appendChild(copy);
  right.appendChild(el('span','lang-chip', esc((b.lang||'txt').toUpperCase())));
  right.style.display='inline-flex'; right.style.gap='6px'; right.style.alignItems='center';
  head.appendChild(right);
  n.appendChild(head);
  const pre=el('pre'); pre.textContent=b.code.replace(/^\n/,''); n.appendChild(pre);
  /* the type stays clean on its paper — the panel frame carries the period */
  return n;
}
function imgDOM(b){
  /* the screenshot is EVIDENCE: bit-clean pixels in a pasted-photo frame.
     No screen, no tint, no filter ever touches the image itself. */
  const n=el('div','panel imgpanel');
  n.dataset.viz=1;
  const src=b.light||b.dark||'';
  const ph=el('div','photo '+(hash32(src)%2?'tilt-l':'tilt-r'));
  const img=new Image(); img.loading='lazy'; img.decoding='async';
  img.src=src; img.alt=b.alt||'';
  ph.appendChild(img);
  for(const k of ['tl','tr','bl','br']) ph.appendChild(el('span','corner '+k));
  ph.appendChild(el('span','ev-flag','UNRETOUCHED PHOTO'));
  n.appendChild(ph);
  if(b.caption||b.alt) n.appendChild(el('div','imgcap',esc(b.caption||b.alt)));
  n.style.cursor='zoom-in';
  n.addEventListener('click',()=>openLightbox(src,b.caption||b.alt||''));
  return n;
}
function openLightbox(src,cap){
  const lb=$('#lightbox'); lb.hidden=false; lb.innerHTML='';
  const ph=el('div','lb-photo');
  const img=new Image(); img.src=src; img.alt=cap;
  ph.appendChild(img);
  lb.appendChild(ph);
  if(cap) lb.appendChild(el('div','lb-cap',esc(cap)));
  lb.appendChild(el('div','lb-hint','CLICK OR PRESS ESC TO PUT THE PHOTO BACK'));
  lb.addEventListener('click',closeLightbox,{once:true});
}
function closeLightbox(){ const lb=$('#lightbox'); lb.hidden=true; lb.innerHTML=''; }
const AD_META={
  tip:      ['TIP','✶'], note:['NOTE','✱'], info:['INFO','i'], strapi:['FROM THE PUBLISHER','DC'],
  callout:  ['CALLOUT','☞'], prerequisites:['ROLL CALL','✓'],
  caution:  ['CAUTION',''], warning:['WARNING',''], danger:['DANGER','']
};
function admonitionDOM(b){
  const kind=b.kind||'note';
  if(kind==='caution'||kind==='warning'||kind==='danger'){
    /* a VILLAIN PANEL: the menace drawn, the hero calling it by name,
       and the admonition's full text crisp beneath the scene */
    const plain=(b.title||'')+' '+(b.blocks||[]).map(k=>k.html||'').join(' ');
    if(CAST&&S.renderSeries){
      return CAST.villainNode({ series:S.renderSeries, kind, title:b.title||kind,
        blocks:renderBlocks(b.blocks), text:plain, seed:hash32('vil'+plain.slice(0,60)) });
    }
    const n=el('div','panel burst'+(kind==='danger'?' danger':''));
    n.style.border='none'; n.style.background='transparent';
    const c=cvs(10,10,1); c.className='burst-bg'; n.appendChild(c);
    const inwrap=el('div','burst-in');
    inwrap.appendChild(el('div','burst-head', esc((b.title||kind).toUpperCase())+'!'));
    renderBlocks(b.blocks).forEach(k=>inwrap.appendChild(k));
    n.appendChild(inwrap);
    n.dataset.burst=kind;
    return n;
  }
  if(kind==='tip'&&CAST&&S.renderSeries){
    /* tips are spoken by the cast — short ones in a real balloon */
    const inner=(b.blocks||[]).filter(k=>k.t==='p');
    const rest=(b.blocks||[]).filter(k=>k.t!=='p');
    const plain=textOf(inner.map(k=>k.html).join(' '));
    if(inner.length&&plain.length>8&&plain.length<=330&&!rest.length){
      return CAST.sceneNode({ series:S.renderSeries, speaker:'hero',
        mode:'speech', html:inner.map(k=>k.html).join('<br>'), plain,
        seed:hash32('tip'+plain.slice(0,50)) });
    }
  }
  if(kind==='prerequisites'){
    const n=el('div','panel rough r2 rollcall');
    n.appendChild(el('div','rc-head','ROLL CALL — BEFORE THIS TALE BEGINS'));
    renderBlocks(b.blocks).forEach(k=>n.appendChild(k));
    return n;
  }
  const n=el('div','ed-note');
  const meta=AD_META[kind]||AD_META.note;
  /* the badge is a drawn portrait: PAGE the copy kid delivers the notes */
  if(CAST&&S.renderSeries&&kind!=='strapi'){
    const badge=el('span','ed-badge');
    const c=cvs(26,26,2); badge.appendChild(c);
    CAST.drawPortrait(c.getContext('2d'),'sidekick',S.renderSeries,26,26);
    n.appendChild(badge);
  } else n.appendChild(el('span','ed-badge', meta[1]||'✱'));
  if(b.title||kind!=='note') n.appendChild(el('div','ed-title', esc(b.title||meta[0])));
  renderBlocks(b.blocks).forEach(k=>n.appendChild(k));
  n.appendChild(el('span','ed-sig',kind==='strapi'?'— THE PUBLISHER':'— PAGE, COPY DESK'));
  return n;
}
function stripTags(t){ return String(t||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(); }
function detailsDOM(b){
  const d=el('details','panel dossier'); d.open=true;
  const s=el('summary');
  s.appendChild(el('span','d-tick','✓'));
  s.appendChild(el('span','', esc(stripTags(b.summary)||'FILE')));
  d.appendChild(s);
  const body=el('div','d-body');
  renderBlocks(b.blocks).forEach(k=>body.appendChild(k));
  d.appendChild(body);
  s.addEventListener('click',()=>SFX.tick());
  return d;
}
function tabsDOM(b){
  const n=el('div','panel folder');
  const row=el('div','tabs-row');
  const body=el('div','folder-body');
  const panes=[];
  (b.tabs||[]).forEach((tb,i)=>{
    const btn=el('button','tabbtn'+(i===0?' act':''), esc(tb.label||tb.value||('TAB '+(i+1))));
    const pane=el('div','pane'+(i===0?' act':''));
    renderBlocks(tb.blocks).forEach(k=>pane.appendChild(k));
    btn.addEventListener('click',()=>{
      row.querySelectorAll('.tabbtn').forEach(x=>x.classList.remove('act'));
      panes.forEach(p=>p.classList.remove('act'));
      btn.classList.add('act'); pane.classList.add('act'); SFX.tick();
    });
    row.appendChild(btn); body.appendChild(pane); panes.push(pane);
  });
  n.appendChild(row); n.appendChild(body);
  return n;
}
function endpointDOM(b){
  const n=el('div','panel endp');
  const head=el('div','ep-head');
  head.appendChild(el('span','ep-method '+esc(b.method||''), esc(b.method||'')));
  head.appendChild(el('span','ep-path', esc(b.path||'')));
  n.appendChild(head);
  const body=el('div','ep-body');
  if(b.title) body.appendChild(el('div','ep-title', esc(b.title)));
  if(b.description) body.appendChild(el('div','ep-desc', b.description));
  if(b.params&&b.params.length){
    body.appendChild(tableDOM({head:[b.paramTitle||'Parameter','Type','Notes'],
      rows:b.params.map(p=>[`<code>${esc(p.name)}</code>${p.required?' <b>*</b>':''}`, esc(p.type||''), p.desc||''])}));
  }
  if(b.codeTabs&&b.codeTabs.length){
    body.appendChild(tabsDOM({tabs:b.codeTabs.map(ct=>({label:ct.label,blocks:[{t:'code',lang:ct.lang,title:'',code:ct.code}]}))}));
  }
  for(const r of b.responses||[]){
    const dd=detailsDOM({summary:`RESPONSE ${r.status} ${r.statusText||''}`,
      blocks:[{t:'code',lang:r.lang||'json',title:'',code:r.body||''}]});
    dd.querySelectorAll('pre').forEach(pr=>pr.style.maxHeight='150px');
    body.appendChild(dd);
  }
  n.appendChild(body);
  return n;
}
function cardsDOM(b){
  const n=el('div','panel adgrid');
  n.style.border='none'; n.style.background='transparent'; n.style.padding='0';
  for(const it of b.items||[]){
    const c=el('div','ad-card');
    c.appendChild(el('div','ad-t', esc(it.title||'')));
    if(it.desc) c.appendChild(el('div','ad-d', esc(it.desc)));
    if(it.link) c.addEventListener('click',()=>{ location.hash=it.link.startsWith('#')?it.link.slice(1):it.link; });
    n.appendChild(c);
  }
  return n;
}

/* the director: prose becomes narration, dialogue and drawn sequences.
   Voices with restraint — the narrator carries most text, the hero speaks
   the short punchy sentences, PAGE asks the questions, villains take the
   cautions, and procedures become one drawn panel per step. */
function panelize(slug){
  const M=S.M, pg=M.pages[slug];
  S.renderSeries=M.issue[slug]?M.issue[slug].series:null;
  const series=S.renderSeries;
  const rng=mulberry(hash32('rhythm'+slug));
  const panels=[];
  let chapter=0, firstNarr=true, sinceBl=0, bdCount=0;
  const isHub = series && series.hub===slug;
  const bdBudget = isHub ? 99 : 2;
  const FLAGS=['MEANWHILE...','LATER...','SOON...','ELSEWHERE...','AT THAT MOMENT...','BUT THEN...'];
  const blocks=pg.blocks.filter(b=>b.t!=='tldr');
  let i=0;
  const push=(meta)=>{
    const n=meta.node;
    const hasBl=(n.dataset&&n.dataset.bl)||(n.querySelector&&n.querySelector('[data-bl]'));
    if(hasBl) sinceBl=0; else sinceBl++;
    panels.push(meta);
  };
  const pushNarr=(ps)=>{
    const n=el('div','panel rough r'+(panels.length%4)+' narr'+(firstNarr?' lede':''));
    firstNarr=false;
    for(const p of ps) n.insertAdjacentHTML('beforeend','<p>'+p.html+'</p>');
    push({node:n,kind:'narr'});
    return n;
  };
  while(i<blocks.length){
    const b=blocks[i];
    if(b.t==='p'){
      const run=[]; while(i<blocks.length&&blocks[i].t==='p'){ run.push(blocks[i]); i++; }
      let j=0;
      while(j<run.length){
        const a=run[j], b2=run[j+1];
        const aLen=(a.html||'').length;
        const plainA=textOf(a.html||'').trim();
        /* the balloon audition: a short whole paragraph gets spoken —
           questions by PAGE, statements by the hero */
        const isQ=/\?\s*$/.test(plainA);
        if(CAST&&series&&!firstNarr&&plainA.length>=24&&plainA.length<=210&&
           (sinceBl>=5||isQ||rng()<0.26)){
          push({node:CAST.sceneNode({ series, speaker:isQ?'sidekick':'hero',
            mode:(!isQ&&plainA.length<120&&rng()<0.16)?'thought':'speech',
            html:a.html, plain:plainA,
            seed:(hash32(slug)+i*131+j*17)>>>0 }), kind:'scene'});
          j++; continue;
        }
        if(b2 && aLen<340 && (b2.html||'').length<340 && rng()<0.42 && !firstNarr){
          const row=el('div','panel-row');
          const p1=el('div','panel rough r'+((panels.length)%4)+' narr'); p1.innerHTML='<p>'+a.html+'</p>';
          const p2=el('div','panel rough r'+((panels.length+2)%4)+' narr'); p2.innerHTML='<p>'+b2.html+'</p>';
          row.appendChild(p1); row.appendChild(p2);
          push({node:row,kind:'row'});
          j+=2;
        } else {
          const grab=[a]; let take=aLen;
          while(grab.length<3 && run[j+grab.length] && take<650){ take+=(run[j+grab.length].html||'').length; if(take<900) grab.push(run[j+grab.length]); else break; }
          pushNarr(grab); j+=grab.length;
        }
      }
      continue;
    }
    if(b.t==='h2'){
      chapter++;
      const n=renderBlock(b);
      const flag = chapter===1 ? 'OUR STORY BEGINS...' : FLAGS[Math.floor(rng()*FLAGS.length)];
      const f=el('span','caption-flag',esc(flag));
      n.appendChild(f);
      n.style.marginTop='14px';
      push({node:n,kind:'chapter',keepNext:true,hid:b.id});
      i++; continue;
    }
    if(b.t==='ol'&&CAST&&series&&bdCount<bdBudget&&
       b.items.length>=2&&b.items.length<=9&&
       b.items.reduce((s2,it)=>s2+textOf(typeof it==='string'?it:(it.html||'')).length,0)/b.items.length<300){
      /* a true BD sequence: the hero performs every step */
      bdCount++;
      CAST.stepSeq(series, b.items, hash32('seq'+slug+i), renderBlocks).forEach(r=>push(r));
      i++; continue;
    }
    const node=renderBlock(b);
    if(node){
      const kind=b.t;
      const meta={node,kind};
      if(/^h[3-6]$/.test(b.t)){ meta.keepNext=true; meta.hid=b.id; }
      push(meta);
    }
    i++;
  }
  return panels;
}

/* ================= 7. paginator ================= */
const PAGE_W=575, PAGE_H=820, CONTENT_W=PAGE_W-52, BUDGET=PAGE_H-24-30-14;
function paginate(slug){
  if(S.pgCache.has(slug)) return S.pgCache.get(slug);
  const t0=performance.now();
  const panels=panelize(slug);
  /* THE VOCABULARY LAW: every issue speaks at least six panel dialects
     beyond its cover and splash — an establishing shot, a dialogue
     two-shot, an object close-up, a panorama, a silent beat, and one
     pure onomatopoeia moment — spread through the book in that order. */
  if(CAST&&S.M.issue[slug]){
    const ser=S.M.issue[slug].series;
    const vocabRun=['establish','twoshot','closeup','panorama','silent','ono'];
    const N0=panels.length;
    for(let k=vocabRun.length-1;k>=0;k--){
      const idx=Math.min(1+Math.floor(k*Math.max(N0-1,0)/5), N0);
      const node=CAST.spotNode(ser, slug, (hash32('vocab'+slug)+k*331)>>>0, null, {type:vocabRun[k]});
      panels.splice(idx,0,{node,kind:'spot'});
    }
  }
  const meas=$('#measurer');
  meas.innerHTML='';
  const holder=el('div','cpage-content'); holder.style.width=CONTENT_W+'px';
  meas.appendChild(holder);
  panels.forEach(p=>holder.appendChild(p.node));
  /* stabilize folders (tabs) to their tallest pane */
  [...meas.querySelectorAll('.folder')].reverse().forEach(f=>{
    const panes=[...f.querySelectorAll(':scope > .folder-body > .pane')];
    let mx=0;
    panes.forEach(p=>{ p.classList.add('act'); mx=Math.max(mx,p.offsetHeight); p.classList.remove('act'); });
    if(panes[0]) panes[0].classList.add('act');
    const body=f.querySelector(':scope > .folder-body');
    if(body) body.style.minHeight=(mx+2)+'px';
  });
  /* burst backgrounds need measured size */
  const heights=panels.map(p=>p.node.offsetHeight);
  const GAP=12;
  const pages=[]; const anchors={};
  let cur=[]; const curH=[]; let adSeq=0;
  /* THE CADENCE LAW: a reader who only turns pages must never cross
     four pages without a drawn picture, nor a spread without a balloon.
     The paginator counts, and posts a spot illustration when the prose
     runs too quiet. */
  let sinceVizP=0, sinceBlP=0, spotSeq=0;
  const hasSel=(arr,attr)=>arr.some(n=>(n.dataset&&n.dataset[attr])||(n.querySelector&&n.querySelector('[data-'+attr.toLowerCase()+']')));
  const usedOf=()=>{ let u=0; curH.forEach((h2,k)=>u+=h2+(k?GAP:0)); return u; };
  const padGap=()=>{ /* plug a big hole with a quarter-page house ad, comics-style */
    const leftover=BUDGET-usedOf();
    if(cur.length&&leftover>168){
      const last=cur[cur.length-1];
      if(!(last.classList&&last.classList.contains('chapter'))){
        const adH=Math.min(leftover-GAP-6,236);
        const ad=fillerAd(slug,adSeq++,adH);
        if(ad){ cur.push(ad); curH.push(adH); }
      }
    }
  };
  const flush=()=>{ if(cur.length){ padGap();
    sinceVizP = hasSel(cur,'viz') ? 0 : sinceVizP+1;
    sinceBlP  = hasSel(cur,'bl')  ? 0 : sinceBlP+1;
    pages.push(cur); cur=[]; curH.length=0; } };
  /* posts a spot illustration at the top of a fresh page when the counters
     say the reader has gone too long without a picture or a voice */
  const maybeSpot=(i)=>{
    if(!CAST||!S.M.issue[slug]||cur.length) return;
    const rightPage=((pages.length+2)%2===0); /* this page completes a spread */
    if(sinceVizP>=2||sinceBlP>=2||(sinceBlP>=1&&rightPage)){
      let nextH=null;
      for(let k=i;k<panels.length&&k<i+14;k++) if(panels[k].kind==='chapter'){
        const cht=panels[k].node.querySelector('.ch-txt'); nextH=cht&&cht.textContent; break; }
      const needBl=sinceBlP>=2||(sinceBlP>=1&&rightPage);
      const spot=CAST.spotNode(S.M.issue[slug].series, slug,
        (hash32('spot'+slug)+spotSeq*97)>>>0, nextH, {needBl, seq:spotSeq});
      spotSeq++;
      cur.push(spot); curH.push(parseInt(spot.style.height)||176);
      sinceVizP=0; sinceBlP=0; /* flush detection confirms, this pre-clears */
    }
  };
  for(let i=0;i<panels.length;i++){
    const p=panels[i]; let h=heights[i];
    const elastic=h>BUDGET; /* over-tall panels scroll, so their height can flex */
    if(elastic){ p.node.style.overflowY='auto'; p.node.classList.add('tallcap'); }
    if(elastic){
      let rem=BUDGET-usedOf()-(cur.length?GAP:0);
      if(rem<340){ flush(); maybeSpot(i); rem=BUDGET-usedOf()-(cur.length?GAP:0); }
      if(rem<340){ flush(); rem=BUDGET; } /* the spot claimed too much — own page */
      p.node.style.maxHeight=(rem-4)+'px'; h=rem-2;
    }
    else if(usedOf()+(cur.length?GAP:0)+h>BUDGET){
      /* never leave a chapter stranded at the foot of the page */
      let orphan=null, orphanH=0;
      if(cur.length&&cur[cur.length-1].classList&&cur[cur.length-1].classList.contains('chapter')){
        orphan=cur.pop(); orphanH=curH.pop();
      }
      flush();
      maybeSpot(i);
      if(orphan){ cur.push(orphan); curH.push(orphanH); }
      if(usedOf()+(cur.length?GAP:0)+h>BUDGET) flush(); /* spot+orphan crowded it out */
    }
    else if(p.keepNext&&cur.length){
      const nh=heights[i+1]!=null?Math.min(heights[i+1],120):0;
      if(usedOf()+GAP+h+GAP+nh>BUDGET){ flush(); maybeSpot(i); }
    }
    if(p.hid!=null) anchors[p.hid]=pages.length;
    cur.push(p.node); curH.push(h);
  }
  if(cur.length) pages.push(cur);
  meas.innerHTML='';
  const res={pages,anchors,ms:performance.now()-t0};
  S.pgCache.set(slug,res);
  if(S.pgCache.size>16){ const k=S.pgCache.keys().next().value; S.pgCache.delete(k); }
  return res;
}
function paintBursts(root){
  root.querySelectorAll('.burst').forEach(b=>{
    const c=b.querySelector('.burst-bg'); if(!c||c.dataset.done)return;
    const w=b.offsetWidth+12, h=b.offsetHeight+12;
    if(!w||!h) return;
    c.width=w*DPR; c.height=h*DPR; c.style.width=w+'px'; c.style.height=h+'px';
    const x=c.getContext('2d'); x.scale(DPR,DPR);
    const rng=mulberry(hash32(b.textContent.slice(0,40)));
    const danger=b.dataset.burst==='danger';
    const p=burstPath(w/2,h/2,w/2-4,h/2-4,Math.max(10,Math.floor(w/26)),rng,0.10);
    x.fillStyle=danger?'#f3d9c2':'#f8ecc9'; x.fill(p);
    fillScreened(x,p,danger?[['M',.25],['Y',.25]]:[['Y',.25]],null,2);
    x.strokeStyle='#231c12'; x.lineWidth=2.6; x.lineJoin='miter'; x.stroke(p);
    c.dataset.done=1;
  });
}

/* period quarter-page house ads that plug pagination gaps — every ad a real story */
function fillerAd(slug,i,hpx){
  const M=S.M;
  const cands=[];
  for(const o of (M.out[slug]||[])) if(M.issue[o]&&o!==slug) cands.push(o);
  const t=M.issue[slug].series;
  for(const m of t.members) if(m!==slug&&!cands.includes(m)) cands.push(m);
  if(M.superla.hubMax!==slug&&!cands.includes(M.superla.hubMax)) cands.push(M.superla.hubMax);
  if(!cands.length) return null;
  const s2=cands[i%cands.length];
  const iss2=M.issue[s2], p2=M.pages[s2];
  const rng=mulberry(hash32('ad'+slug+i));
  const CRIES=['DON\'T MISS','ALL-NEW','STILL ONLY '+iss2.price+'¢','ON STANDS NOW','A DOCS CODE HIT','COLLECTOR\'S ITEM'];
  const n=el('div','panel houseAd');
  n.style.height=hpx+'px';
  n.innerHTML=`<div class="ha-cry">${CRIES[Math.floor(rng()*CRIES.length)]}!</div>
    <div class="ha-title">${esc(iss2.series.noun)} <span>#${iss2.no}</span></div>
    <div class="ha-line">“${esc(p2.sidebarLabel||'')}” — ${fmtNum(M.words[s2]||0)} words of pure documentation${iss2.inb?', cited by '+iss2.inb+' tales':''}!</div>
    <div class="ha-foot">${fmtMonth(iss2.date)} · from the ${esc(iss2.series.noun)} title</div>`;
  screenBG(n,[[iss2.series.combo[0][0],1]],0.06);
  n.addEventListener('click',()=>openIssue(s2));
  return n;
}

/* ================= 8. the issue book ================= */
function issueBook(slug){
  const M=S.M, iss=M.issue[slug], t=iss.series, pg=M.pages[slug], pv=M.prov[slug];
  const pgn=paginate(slug);
  const chapters=(pg.headings||[]).filter(h=>h.level===2&&pgn.anchors[h.id]!=null)
    .map(h=>({text:h.text,id:h.id,page:pgn.anchors[h.id]+2}));
  const pages=[];
  pages.push({kind:'cover',slug});
  pages.push({kind:'splash',slug});
  pgn.pages.forEach((nodes,i)=>pages.push({kind:'content',slug,nodes,idx:i}));
  /* the back of the book: an interstitial crossing ad, the bulletins,
     the letters column, the also-on-stands page, and the full-page
     back-cover ad — two different portals per issue, never mid-story */
  const adA=hash32('sib'+slug)%6;
  const adB=(adA+1+hash32('sib2'+slug)%5)%6;
  pages.push({kind:'sibad',slug,ad:adA});
  pages.push({kind:'bulletins',slug});
  pages.push({kind:'letters',slug});
  pages.push({kind:'stands',slug});
  pages.push({kind:'backad',slug,ad:adB});
  return {slug,iss,series:t,pg,pv,pages,anchors:pgn.anchors,chapters,built:new Array(pages.length).fill(null)};
}
function buildBookPage(book,i){
  if(book.built[i]) return book.built[i];
  const d=book.pages[i];
  let page;
  if(d.kind==='cover'){
    page=el('div','cpage'); page.style.padding='0';
    const c=cvs(PAGE_W,PAGE_H); paintCover(c,d.slug,PAGE_W,PAGE_H,'issue');
    page.appendChild(c);
  }
  else if(d.kind==='splash') page=splashPage(book);
  else if(d.kind==='content'){
    page=el('div','cpage');
    page.appendChild(el('div','runhead',
      `<span>${esc(book.series.noun)} #${book.iss.no}</span><span>${esc(book.pg.sidebarLabel||'')}</span>`));
    const cc=el('div','cpage-content');
    d.nodes.forEach(n=>cc.appendChild(n));
    page.appendChild(cc);
    page.appendChild(el('div','folio','PAGE '+(d.idx+2)));
    page.classList.add((d.idx%2===0)?'right-page':'left-page');
  }
  else if(d.kind==='bulletins') page=bulletinsPage(book);
  else if(d.kind==='letters') page=lettersPage(book);
  else if(d.kind==='stands') page=backCoverPage(book);
  else if(d.kind==='sibad'||d.kind==='backad') page=CAST.sibAdPage(d.ad,{W:PAGE_W,H:PAGE_H});
  page.style.width=PAGE_W+'px'; page.style.height=PAGE_H+'px';
  book.built[i]=page;
  return page;
}
function splashPage(book){
  const {pg,pv,iss,series:t,slug}=book;
  const M=S.M;
  const page=el('div','cpage');
  const sp=el('div','splash');
  sp.appendChild(el('div','sp-kicker', esc(`${t.kicker} ${t.noun} — ISSUE #${iss.no}`)));
  /* the drawn story logo */
  const logoC=cvs(CONTENT_W,100);
  { const x=logoC.getContext('2d');
    const title=stripTitle(pg.sidebarLabel||pg.title).toUpperCase();
    const lines=fitLogoLines(title);
    const lh=92/lines.length;
    lines.forEach((ln,i)=>{
      drawLettering(x,ln,{x:CONTENT_W/2,y:lh*(i+0.80),w:CONTENT_W*0.94,
        size:Math.min(lh*0.88,48),color:comboRGB(t.combo),style:t.style,
        seed:hash32('splash'+slug)+i,arc:i===0?0.09:0.02,telescope:3});
    });
  }
  logoC.className='sp-logo';
  sp.appendChild(logoC);
  /* the hero opens the tale, speaking its real first line */
  const tl=pg.blocks.find(b=>b.t==='tldr');
  const teaserTxt=(tl?textOf(tl.html):'')||pg.description||stripTitle(pg.title);
  if(CAST){
    sp.appendChild(CAST.splashScene(t, slug, teaserTxt, iss.inb, pg.file));
    if(iss.inb>=10) sp.appendChild(el('div','sp-teaser',
      `<div class="tz-head">A COSMIC EVENT — CITED BY ${iss.inb} OTHER TALES!</div>`));
  } else {
    const teaser=el('div','sp-teaser');
    teaser.appendChild(el('div','tz-head', iss.inb>=10 ?
      `A COSMIC EVENT — CITED BY ${iss.inb} OTHER TALES!` : 'IN THIS ISSUE'));
    teaser.appendChild(el('div','tldr', tl?tl.html:esc(pg.description||'')));
    sp.appendChild(teaser);
  }
  /* credits box — the real hands, by commit share */
  const credits=M.credits[slug]||[];
  const cb=el('div','credits');
  cb.appendChild(el('div','cr-head',
    `<span>THE BULLPEN OF RECORD</span><span>${pv?pv.commits:0} PRINTINGS</span>`));
  const roles1=['STORY, ART & LETTERS'];
  const roles2=['SCRIPT & PENCILS','INKS & LETTERS'];
  const roles3=['SCRIPT','PENCILS & INKS','LETTERS'];
  const roles4=['SCRIPT','PENCILS','INKS','LETTERS'];
  const roles5=['SCRIPT','PENCILS','INKS','LETTERS','COLORS'];
  const roles=[null,roles1,roles2,roles3,roles4,roles5][clamp(credits.length,1,5)]||roles5;
  credits.slice(0,5).forEach(([name,ncom],k)=>{
    cb.appendChild(el('div','cr-row',
      `<span class="cr-role">${roles[k]||'ASSISTS'}</span><span class="cr-name">${esc(name)} <small>(${ncom} commit${ncom>1?'s':''})</small></span>`));
  });
  if(credits.length>5) cb.appendChild(el('div','cr-row',
    `<span class="cr-role">AND</span><span class="cr-name">${credits.length-5} more hands <small>(see Bullpen Bulletins)</small></span>`));
  if(t.editor) cb.appendChild(el('div','cr-row',
    `<span class="cr-role">TITLE EDITOR</span><span class="cr-name">${esc(t.editor)}</span>`));
  /* credits + contents ride side by side under the big art, period style */
  const boxes=el('div','sp-boxes');
  boxes.appendChild(cb);
  sp.appendChild(boxes);
  /* the night shift */
  if(pv && pv.night>0){
    sp.appendChild(el('div','nightshift',
      `<span class="moon">☾</span><span><b>THE NIGHT SHIFT:</b> ${pv.night} page session${pv.night>1?'s':''} of this story ${pv.night>1?'were':'was'} inked between midnight and dawn.</span>`));
  }
  /* chapters — the issue's own contents caption */
  if(book.chapters&&book.chapters.length>1){
    const toc=el('div','credits sp-toc');
    toc.appendChild(el('div','cr-head','<span>IN THIS ISSUE</span><span>PG.</span>'));
    book.chapters.slice(0,6).forEach(c=>{
      const row=el('div','cr-row sp-toc-row',
        `<span class="toc-t">${esc(c.text)}</span><span class="cr-name">${c.page}</span>`);
      row.addEventListener('click',()=>{ bookView.show(Math.ceil(c.page/2)); SFX.turn(); });
      toc.appendChild(row);
    });
    boxes.appendChild(toc);
  }
  /* indicia */
  const careY=pv?Math.floor(pv.careDays/365):0;
  sp.appendChild(el('div','sp-indicia',
    `${esc(t.noun)} No. ${iss.no}, ${fmtMonth(iss.date)}. ${esc(stripTitle(pg.title))}. `+
    `Published from <b>${esc(pg.file)}</b> by DOCS CODE PUBLICATIONS. First printing ${fmtMonth(pv?pv.first:'')}, `+
    `${pv?pv.commits:0} printings by ${(M.credits[slug]||[]).length} hand${(M.credits[slug]||[]).length>1?'s':''}, `+
    `${pv?fmtNum(pv.careDays):0} days on the stands${careY>=1?' ('+careY+'+ years)':''}. `+
    `${fmtNum(M.words[slug]||0)} words this issue. A DOCS CODE PUBLICATION. `+
    `Any resemblance to undocumented behavior is purely accidental.`));
  page.appendChild(sp);
  page.appendChild(el('div','folio','PAGE 1'));
  page.classList.add('left-page');
  return page;
}
function bulletinsPage(book){
  const M=S.M, {slug,pv}=book;
  const page=el('div','cpage bullpen-page');
  const rng=mulberry(hash32('bb'+slug));
  page.appendChild(el('h2','bp-mast','BULLPEN BULLETINS'));
  page.appendChild(el('div','bp-rule'));
  const facts=[];
  const sup=M.superla;
  const provOf=s=>M.prov[s]||{};
  facts.push(`<b class="bp-lead">THE LINE!</b> ${M.order.length} stories in ${M.series.length} titles, set by ${fmtNum(M.commits)} press runs since ${fmtMonth(M.epoch)} — with ${M.livingHands.size} hands on today's pages and ${M.allHandsCount} in the ledger all-time.`);
  facts.push(`<b class="bp-lead">MARATHON WATCH!</b> "${esc(M.pages[sup.marathon].sidebarLabel)}" has now been on the stands ${fmtNum(provOf(sup.marathon).careDays)} days — the longest-tended tale in the line.`);
  facts.push(`<b class="bp-lead">FRESH INK!</b> The presses last ran on ${fmtMonth(provOf(sup.freshest).last)} for "${esc(M.pages[sup.freshest].sidebarLabel)}" — still warm.`);
  facts.push(`<b class="bp-lead">BUSY MONTH DEPT.</b> ${fmtMonth(M.busiest[0]+'-01')} saw ${M.busiest[1]} press runs — the studio record.`);
  facts.push(`<b class="bp-lead">NIGHT OWL AWARD!</b> ${esc(sup.nightOwl)} has inked ${M.ledger[sup.nightOwl].night} sessions between midnight and dawn.`);
  facts.push(`<b class="bp-lead">CROSSOVER KING!</b> "${esc(M.pages[sup.hubMax].sidebarLabel)}" is cited by ${M.inCount(sup.hubMax)} other tales — the most-seen story in the line.`);
  facts.push(`<b class="bp-lead">STILL AT THE BOARD!</b> ${esc(sup.veteran)} first signed the ledger on ${fmtMonth(M.ledger[sup.veteran].first)} and is still drawing pages today.`);
  const picked=[]; const pool=facts.slice();
  while(picked.length<6&&pool.length) picked.push(pool.splice(Math.floor(rng()*pool.length),1)[0]);
  const colwrap=el('div','bp-cols');
  picked.forEach(f=>colwrap.appendChild(el('div','bp-item',f)));
  page.appendChild(colwrap);
  page.appendChild(el('div','bp-rule'));
  page.appendChild(el('div','bp-item','<b class="bp-lead">THIS ISSUE\'S BULLPEN</b>'));
  const roster=el('div','roster');
  (M.credits[slug]||[]).forEach(([name,n])=>{
    const L=M.ledger[name];
    roster.appendChild(el('div','',
      `<span class="r-name">${esc(name)}</span> <span class="r-n">— ${n} printing${n>1?'s':''} of this tale; `+
      `${L?L.commits:n} in the line since ${L?fmtMonth(L.first):'?'}${L&&L.night?'; '+L.night+' after midnight':''}</span>`));
  });
  page.appendChild(roster);
  /* the studio at work — one drawing board per credited hand,
     the lamp burning yellow when this tale knew the night shift */
  if(CAST){
    const nDesks=clamp((M.credits[slug]||[]).length,1,6);
    const night=!!(pv&&pv.night>0);
    const sc=cvs(CONTENT_W-8,150);
    CAST.studioRow(sc.getContext('2d'), CONTENT_W-8, 150, nDesks, night, hash32('studio'+slug));
    sc.className='bp-studio';
    page.appendChild(sc);
    page.appendChild(el('div','bp-caption',
      night?`THE STUDIO, AS THE LEDGER RECORDS IT — ${pv.night} SESSION${pv.night>1?'S':''} OF THIS TALE INKED PAST MIDNIGHT.`
           :'THE STUDIO, AS THE LEDGER RECORDS IT — ONE BOARD PER CREDITED HAND.'));
  }
  page.appendChild(el('div','bp-rule'));
  page.appendChild(el('div','bp-item',
    `<b class="bp-lead">GONE BUT NOT FORGOTTEN.</b> ${M.goneHands.length} hands in the old ledgers worked pages that have since left print. `+
    `The bullpen door poster on the rack carries the full roll.`));
  page.appendChild(el('div','folio','BULLPEN PAGE'));
  return page;
}
function lettersPage(book){
  const page=el('div','cpage letters-page');
  page.appendChild(el('h2','bp-mast','LETTERS TO THE FOUR-COLOR'));
  page.appendChild(el('div','bp-rule'));
  const list=el('div');
  const paint=()=>{
    list.innerHTML='';
    const ls=S.letters.slice(-3).reverse();
    if(!ls.length) list.appendChild(el('div','bp-item','<b class="bp-lead">THIS COLUMN AWAITS ITS FIRST LETTER!</b> The visitor who writes below sees their words typeset in every issue of the run — the press remembers.'));
    for(const L of ls){
      const d=el('div','lt-letter');
      d.appendChild(el('div','', esc(L.text)));
      d.appendChild(el('div','lt-sig', `— ${esc(L.name||'A READER')}, reading ${esc(L.issue)} · ${esc(L.date)}`));
      list.appendChild(d);
    }
  };
  paint();
  page.appendChild(list);
  const ta=el('textarea'); ta.placeholder='Dear Bullpen…  (your letter is kept on this newsstand only — in your browser)';
  ta.addEventListener('keydown',e=>e.stopPropagation());
  page.appendChild(ta);
  const row=el('div','lt-form-row');
  const nameIn=el('input'); nameIn.placeholder='Signed (your name)';
  nameIn.addEventListener('keydown',e=>e.stopPropagation());
  const btn=el('button','btn-print','PRINT IT!');
  btn.addEventListener('click',()=>{
    const text=ta.value.trim(); if(!text){ toast('THE PAGE IS BLANK, TRUE BELIEVER!'); return; }
    S.letters.push({text:text.slice(0,600), name:nameIn.value.trim().slice(0,60),
      issue:`${book.series.noun} #${book.iss.no}`, date:new Date().toISOString().slice(0,10)});
    store.set('letters',S.letters);
    ta.value=''; paint(); SFX.print(); toast('YOUR LETTER GOES TO PRESS!');
  });
  row.appendChild(nameIn); row.appendChild(btn);
  page.appendChild(row);
  page.appendChild(el('div','bp-item',`<br>Address all mail to: THE FOUR-COLOR DOCS, c/o the Docs Code Studio. ${S.M.livingHands.size} hands read every letter.`));
  /* the mail bag, and a quarter-page ad for a real crossover issue */
  if(CAST){
    const mc=cvs(CONTENT_W-8,120);
    CAST.mailStack(mc.getContext('2d'), CONTENT_W-8, 120, hash32('mail'+book.slug));
    mc.className='bp-studio';
    page.appendChild(mc);
  }
  const ad=fillerAd(book.slug, 2, 176);
  if(ad){ ad.style.marginTop='10px'; page.appendChild(ad); }
  page.appendChild(el('div','folio','LETTERS PAGE'));
  return page;
}
function backCoverPage(book){
  const M=S.M, {slug,series:t}=book;
  const page=el('div','cpage');
  const bc=el('div','backcover');
  bc.appendChild(el('div','bc-banner','ALSO FROM DOCS CODE — ON STANDS NOW!'));
  const picks=[];
  const nextIssue=t.members[(book.iss.iis+1)%t.members.length];
  if(nextIssue!==slug) picks.push(nextIssue);
  for(const cand of (M.out[slug]||[])){ if(picks.length>=3)break; if(cand!==slug&&!picks.includes(cand)&&M.issue[cand]) picks.push(cand); }
  for(const cand of (M.inb[slug]||[])){ if(picks.length>=3)break; if(cand!==slug&&!picks.includes(cand)&&M.issue[cand]) picks.push(cand); }
  for(const cand of [M.superla.hubMax,t.hub]){ if(picks.length>=3)break; if(cand&&cand!==slug&&!picks.includes(cand)&&M.issue[cand]) picks.push(cand); }
  const grid=el('div','bc-grid');
  picks.slice(0,3).forEach(s2=>{
    const card=el('div','issue-card');
    const c=cvs(150,225,DPR); queuePaint(c,s2,150,225,'mini');
    card.appendChild(c);
    const iss2=M.issue[s2];
    card.appendChild(el('div','ic-cap',`<b>${esc(iss2.series.noun)} #${iss2.no}</b>${esc(M.pages[s2].sidebarLabel||'')}`));
    card.addEventListener('click',()=>openIssue(s2));
    grid.appendChild(card);
  });
  bc.appendChild(grid);
  bc.appendChild(el('div','bc-banner','YOUR '+esc(t.noun)+' COLLECTION — '+t.members.length+' ISSUES'));
  const chk=el('div','bc-checklist');
  t.members.forEach(s2=>{
    const got=S.pull.has(s2);
    chk.appendChild(el('div',got?'done':'', `${got?'☑':'☐'} #${M.issue[s2].no} — ${esc(M.pages[s2].sidebarLabel||'')}`));
  });
  bc.appendChild(chk);
  bc.appendChild(el('div','sp-indicia',
    `A DOCS CODE PUBLICATION. The ${esc(t.noun)} title: ${t.members.length} stories, ${fmtNum(t.words)} words, `+
    `${t.commits} printings by ${t.hands.size} hands, ${fmtMonth(t.first)}–${fmtMonth(t.last)}. Edited by ${esc(t.editor)}.`));
  page.appendChild(bc);
  return page;
}

/* crossover strip appended into the story flow */
function xoverPanel(slug){
  const M=S.M;
  const outs=(M.out[slug]||[]).filter(s=>M.issue[s]);
  const n=el('div','panel rough r3 xover');
  n.appendChild(el('div','xo-head', outs.length?'CONTINUED IN…':'THE END — BUT THE PRESSES NEVER SLEEP'));
  outs.slice(0,4).forEach(s2=>{
    const iss2=M.issue[s2];
    const b=el('button','xo-ad',
      `<span class="xa-onstands">ON STANDS NOW!</span>SEE <span class="xa-series">${esc(iss2.series.noun)} #${iss2.no}</span> — “${esc(M.pages[s2].sidebarLabel||'')}”`);
    b.addEventListener('click',()=>openIssue(s2));
    n.appendChild(b);
  });
  if(outs.length>4) n.appendChild(el('div','', `<small>…and ${outs.length-4} more crossovers from this tale — see the checklist (<b>i</b>).</small>`));
  const inb=M.inCount(slug);
  n.appendChild(el('div','',`<small>${inb?('This tale is cited by '+inb+' other stor'+(inb>1?'ies':'y')+'.'):'No other tale cites this one — a true back-issue gem.'}</small>`));
  return n;
}

/* ---- the physical book & the turn ---- */
const bookView={
  root:null, slots:{}, leaf:null, busy:false,
  init(){
    const bv=$('#bookview'); bv.innerHTML='';
    const chrome=el('div','book-chrome');
    const back=el('button','btn-tab','← THE RACK');
    back.addEventListener('click',goRack);
    chrome.appendChild(back);
    const right=el('div','chrome-right');
    const ser=el('button','btn-tab','THIS TITLE');
    ser.addEventListener('click',()=>{ if(S.book) openSeries(S.book.series.idx); });
    right.appendChild(ser);
    chrome.appendChild(right);
    bv.appendChild(chrome);
    const stage=el('div','book-stage');
    const book=el('div','book');
    const slotL=el('div','pageslot'); const slotR=el('div','pageslot');
    [slotL,slotR].forEach(sl=>{ sl.style.width=PAGE_W+'px'; sl.style.height=PAGE_H+'px'; });
    const leaf=el('div','leaf');
    leaf.appendChild(el('div','face front'));
    leaf.appendChild(el('div','face back'));
    const spine=el('div','spine');
    const edgeR=el('div','stackedge-r'); const edgeL=el('div','stackedge-l');
    book.appendChild(slotL); book.appendChild(slotR); book.appendChild(spine);
    book.appendChild(edgeL); book.appendChild(edgeR); book.appendChild(leaf);
    stage.appendChild(book);
    bv.appendChild(stage);
    bv.appendChild(el('div','book-hints',
      'turn: <kbd>→</kbd>/<kbd>space</kbd>/click right page · back: <kbd>←</kbd> · title: <kbd>esc</kbd> · checklist: <kbd>i</kbd> · search: <kbd>/</kbd>'));
    this.root=bv; this.slots={L:slotL,R:slotR}; this.leaf=leaf;
    this.edges={L:edgeL,R:edgeR};
    book.addEventListener('click',e=>{
      if(e.target.closest('a,button,summary,textarea,input,pre,.tp-scroll'))return;
      const r=book.getBoundingClientRect();
      if(e.clientX>r.left+r.width/2) this.next(); else this.prev();
    });
  },
  spread:0,
  maxSpread(){ return Math.floor(S.book.pages.length/2); },
  show(spread, instant){
    const b=S.book; if(!b)return;
    this.spread=clamp(spread,0,this.maxSpread());
    this.mount('L',2*this.spread-1);
    this.mount('R',2*this.spread);
    this.leaf.classList.remove('show','turning');
    this.updateEdges();
    requestAnimationFrame(()=>{ paintBursts(this.slots.L); paintBursts(this.slots.R);
      if(CAST){ CAST.paintScenes(this.slots.L); CAST.paintScenes(this.slots.R); } });
  },
  mount(side,idx){
    const slot=this.slots[side];
    slot.innerHTML='';
    if(idx<0||idx>=S.book.pages.length){ slot.classList.add('empty'); return; }
    slot.classList.remove('empty');
    slot.appendChild(buildBookPage(S.book,idx));
  },
  updateEdges(){
    const total=S.book.pages.length;
    const left=clamp(2*this.spread-1,0,total), right=total-left-2;
    this.edges.L.style.width=clamp(left*0.8,0,14)+'px';
    this.edges.R.style.width=clamp(right*0.8,0,14)+'px';
    this.edges.L.style.display=left>0?'block':'none';
    this.edges.R.style.display=right>0?'block':'none';
  },
  next(){ this.turn(1); },
  prev(){ this.turn(-1); },
  turn(dir){
    const b=S.book; if(!b)return;
    const target=this.spread+dir;
    if(target<0||target>this.maxSpread())return;
    if(REDUCED){ this.show(target); SFX.turn(); markRead(); return; }
    if(this.busy){ this.finishNow(); }
    this.busy=true;
    recordFrames(750);
    const leaf=this.leaf;
    const front=leaf.querySelector('.front'), back=leaf.querySelector('.back');
    front.innerHTML=''; back.innerHTML='';
    if(dir>0){
      const pFront=2*this.spread, pBack=2*this.spread+1;
      if(pFront>=0&&pFront<b.pages.length) front.appendChild(buildBookPage(b,pFront));
      if(pBack<b.pages.length) back.appendChild(buildBookPage(b,pBack));
      this.mount('R',2*target);
      leaf.style.transition='none'; leaf.style.transform='rotateY(0deg)';
      leaf.classList.add('show','turning');
      void leaf.offsetWidth;
      leaf.style.transition=''; leaf.style.transform='rotateY(-178deg)';
      requestAnimationFrame(()=>{ paintBursts(leaf); if(CAST)CAST.paintScenes(leaf);
        paintBursts(this.slots.R); if(CAST)CAST.paintScenes(this.slots.R); });
    } else {
      const pBack=2*this.spread-1, pFront=2*target;
      if(pBack>=0&&pBack<b.pages.length) back.appendChild(buildBookPage(b,pBack));
      if(pFront>=0&&pFront<b.pages.length) front.appendChild(buildBookPage(b,pFront));
      this.mount('L',2*target-1);
      leaf.style.transition='none'; leaf.style.transform='rotateY(-178deg)';
      leaf.classList.add('show','turning');
      void leaf.offsetWidth;
      leaf.style.transition=''; leaf.style.transform='rotateY(0deg)';
      requestAnimationFrame(()=>{ paintBursts(leaf); if(CAST)CAST.paintScenes(leaf);
        paintBursts(this.slots.L); if(CAST)CAST.paintScenes(this.slots.L); });
    }
    SFX.turn();
    this.pending=target;
    const done=()=>{ if(!this.busy)return; this.finishNow(); };
    this._doneHandler=done;
    leaf.addEventListener('transitionend',done,{once:true});
    this._failsafe=setTimeout(done,720);
  },
  finishNow(){
    if(!this.busy)return;
    clearTimeout(this._failsafe);
    this.busy=false;
    this.show(this.pending);
    markRead();
  }
};
function markRead(){
  const b=S.book; if(!b)return;
  if(!S.pull.has(b.slug)){
    S.pull.add(b.slug); store.set('pull',[...S.pull]);
    if(b.iss.uncited && !S.rescued.has(b.slug)){
      S.rescued.add(b.slug); store.set('rescued',[...S.rescued]);
      toast('RESCUED FROM THE BIN — '+S.rescued.size+' OF '+S.M.uncited.length+' TAKEN HOME!');
      SFX.rescue();
    }
  }
}

function openIssue(slug, opts){
  const M=S.M;
  if(!M.issue[slug]){ toast('THAT ISSUE IS NOT IN THE RACKS!'); return; }
  closeFinder();
  const book=issueBook(slug);
  /* the crossover strip joins the story flow as its final content panel */
  const lastContent=book.pages.map(p=>p.kind).lastIndexOf('content');
  if(lastContent>0){
    const xp=xoverPanel(slug);
    const finale=[xp];
    if(CAST){ /* the hero signs off — the sign-off line is the graph's own count */
      const outs=(M.out[slug]||[]).filter(s=>M.issue[s]).length;
      const line=outs
        ? 'AND THIS TALE CONTINUES IN '+outs+' OTHER '+(outs>1?'STORIES':'STORY')+' — ON STANDS NOW!'
        : 'NO OTHER TALE CITES THIS ONE — YOU JUST RESCUED A TRUE BACK-ISSUE GEM!';
      finale.unshift(CAST.sceneNode({ series:book.series, speaker:'hero', mode:'speech',
        html:esc(line), plain:line, seed:hash32('fin'+slug), pose:'lift' }));
    }
    book.pages.splice(lastContent+1,0,{kind:'content',slug,nodes:finale,idx:book.pages[lastContent].idx+1});
  }
  S.book=book;
  /* the era of the letterer travels with the title */
  $('#bookview').dataset.era=book.series.style;
  showView('bookview');
  const anchor=opts&&opts.heading!=null?book.anchors[opts.heading]:null;
  let spread=0;
  if(anchor!=null){ const pageIdx=2+anchor; spread=Math.ceil(pageIdx/2); }
  else if(opts&&opts.atSplash) spread=1;
  bookView.show(spread,true);
  SFX.open();
  markReadSoon();
  if(!S.toldTurn){ S.toldTurn=true; store.set('toldTurn',true);
    setTimeout(()=>toast('TURN THE PAGE — press → or click the right-hand page'),450); }
  location.hash='#/read'+slug+(opts&&opts.heading?('@'+opts.heading):'');
}
let readTimer=null;
function markReadSoon(){ clearTimeout(readTimer); readTimer=setTimeout(markRead,4000); }

/* ================= 9. rack & series ================= */
function renderRack(){
  const M=S.M;
  const rack=$('#rack');
  rack.innerHTML='';
  const inner=el('div','rack-inner');

  /* masthead */
  const mh=el('div','masthead');
  const logo=cvs(600,132);
  { const x=logo.getContext('2d');
    x.drawImage(BULLET,4,34,64,64);
    drawLettering(x,'THE FOUR-COLOR',{x:340,y:56,w:470,size:42,color:'#e9c81f',style:'saladino',seed:11,arc:0.06,telescope:3,teleFill:'#5a1410',teleColor:'rgba(0,0,0,.9)'});
    drawLettering(x,'DOCS',{x:340,y:122,w:240,size:50,color:'#c22a1c',style:'saladino',seed:12,arc:0.03,telescope:3,teleFill:'#3d0f0b',teleColor:'rgba(0,0,0,.9)'});
  }
  mh.appendChild(logo);
  const side=el('div','mast-side');
  side.appendChild(el('div','mast-stats',
    `${M.order.length} STORIES · ${M.series.length} TITLES · ${M.allHandsCount} HANDS SINCE ${fmtMonth(M.epoch)} · ${fmtNum(M.commits)} PRESS RUNS`));
  side.appendChild(el('div','mast-hint','GRAB A COMIC OFF THE RACK — <b>CLICK ANY COVER!</b>'));
  side.appendChild(el('div','mast-keys','<kbd>/</kbd> search any story · <kbd>i</kbd> the plain checklist · <kbd>s</kbd> sound'));
  mh.appendChild(side);
  const stampImg=el('div');
  const sc=document.createElement('canvas'); sc.width=STAMP.width; sc.height=STAMP.height;
  sc.getContext('2d').drawImage(STAMP,0,0);
  sc.style.width='58px'; sc.style.height='78px'; sc.style.transform='rotate(2deg)';
  stampImg.appendChild(sc);
  mh.appendChild(stampImg);
  inner.appendChild(mh);

  /* THE BANNER SPOT — the Quick Start Guide leads the whole stand */
  const qsSlug=M.order.find(s2=>/quick-start$/.test(s2));
  if(qsSlug&&M.issue[qsSlug]){
    const qb=el('div','qs-banner'); qb.tabIndex=0;
    qb.setAttribute('role','button');
    qb.setAttribute('aria-label','Start here: the Quick Start Guide issue');
    const cwrap=el('div','qs-coverwrap');
    const c=cvs(190,285,DPR);
    queuePaint(c,qsSlug,190,285,'mini');
    cwrap.appendChild(c);
    qb.appendChild(cwrap);
    const txt=el('div','qs-copy');
    const flash=el('div','qs-flash');
    const fc2=cvs(210,110);
    { const x=fc2.getContext('2d');
      const rng=mulberry(hash32('startburst'));
      const p=burstPath(105,55,96,48,13,rng,0.30);
      fillScreened(x,p,[['Y',1]],null,2);
      x.strokeStyle='#231c12'; x.lineWidth=3; x.lineJoin='miter'; x.stroke(p);
      drawLettering(x,'START',{x:105,y:47,w:150,size:30,color:'#c22a1c',style:'saladino',seed:3,arc:0.10,telescope:2});
      drawLettering(x,'HERE!',{x:105,y:82,w:130,size:30,color:'#c22a1c',style:'saladino',seed:4,arc:-0.06,telescope:2});
    }
    flash.appendChild(fc2);
    txt.appendChild(flash);
    const iss=M.issue[qsSlug];
    txt.appendChild(el('div','qs-kick','NEW AROUND THIS NEWSSTAND?'));
    txt.appendChild(el('div','qs-title',esc(stripTitle(M.pages[qsSlug].sidebarLabel||M.pages[qsSlug].title)).toUpperCase()+' <span>#'+iss.no+'</span>'));
    txt.appendChild(el('div','qs-line',
      'The first comic to grab off the rack \u2014 the whole origin story in one issue: '+
      'a project born, content shaped, the works deployed. '+fmtNum(M.words[qsSlug]||0)+' words, every one true.'));
    txt.appendChild(el('div','qs-cta','GRAB THIS ISSUE FIRST \u2192'));
    qb.appendChild(txt);
    const go=()=>openIssue(qsSlug);
    qb.addEventListener('click',go);
    qb.addEventListener('keydown',e=>{if(e.key==='Enter')go();});
    inner.appendChild(qb);
  }

  /* shelves */
  const sorted=[...M.series].sort((a,b)=>b.members.length-a.members.length);
  const groups=[
    ['THE BIG BOOKS — ANNUALS & 80-PAGE GIANTS', sorted.filter(t=>t.members.length>=17)],
    ['THE MONTHLY TITLES', sorted.filter(t=>t.members.length>=5&&t.members.length<17)],
    ['ONE-SHOTS & SPECIALS', sorted.filter(t=>t.members.length<5)],
  ];
  for(const [label,list] of groups){
    if(!list.length)continue;
    const shelf=el('div','shelf');
    shelf.appendChild(el('div','shelf-label',esc(label)));
    for(let i=0;i<list.length;i+=7){
      const row=el('div','shelf-row');
      list.slice(i,i+7).forEach(t=>{
        const pk=el('div','pocket'); pk.tabIndex=0;
        const c=cvs(170,255,DPR);
        queuePaint(c,t.hub,170,255,'mini');
        pk.appendChild(c);
        pk.appendChild(el('div','pocket-tag',`${esc(t.noun)} · ${t.members.length} ISSUE${t.members.length>1?'S':''}`));
        const go=()=>openSeries(t.idx);
        pk.addEventListener('click',go);
        pk.addEventListener('keydown',e=>{if(e.key==='Enter')go();});
        row.appendChild(pk);
      });
      shelf.appendChild(row);
    }
    inner.appendChild(shelf);
  }

  /* the back-issue bin */
  const binw=el('div','binwrap'); binw.id='bin';
  const bh=el('div','bin-head');
  bh.appendChild(el('div','bin-title','BACK ISSUE BIN'));
  bh.appendChild(el('div','bin-sub',
    `${M.uncited.length} stories no other tale cites — never reprinted. Reading one rescues it; the bin remembers. `+
    `<b>${S.rescued.size} of ${M.uncited.length} taken home so far.</b>`));
  binw.appendChild(bh);
  const box=el('div','longbox');
  const scroll=el('div','bin-scroll');
  const binSorted=[...M.uncited].sort((a,b)=>(M.prov[a].last<M.prov[b].last?-1:1));
  let lastYear='';
  for(const s of binSorted){
    const y=M.prov[s].last.slice(0,4);
    if(y!==lastYear){ lastYear=y; scroll.appendChild(el('div','bin-divider',esc(y))); }
    const it=el('div','bin-item'); it.tabIndex=0; it.dataset.slug=s;
    const c=cvs(118,177,DPR); queuePaint(c,s,118,177,'mini');
    it.appendChild(c);
    if(S.rescued.has(s)) it.appendChild(el('div','rescued','RESCUED'));
    it.title=M.pages[s].sidebarLabel+' — never reprinted';
    const go=()=>openIssue(s,{atSplash:true});
    it.addEventListener('click',go);
    it.addEventListener('keydown',e=>{if(e.key==='Enter')go();});
    scroll.appendChild(it);
  }
  box.appendChild(scroll);
  binw.appendChild(box);
  inner.appendChild(binw);

  /* bullpen poster + indicia */
  const extras=el('div','rack-extras');
  const poster=el('div','poster');
  poster.appendChild(el('h3','', 'MEET THE <span>BULLPEN</span>!'));
  poster.appendChild(el('p','',
    `${M.livingHands.size} hands on today's pages · ${M.goneHands.length} in the old ledgers whose stories left print · `+
    `night-shift honor roll · the studio record book. Step inside →`));
  poster.addEventListener('click',()=>openBullpen());
  extras.appendChild(poster);
  inner.appendChild(extras);

  inner.appendChild(el('div','rack-indicia',
    `THE FOUR-COLOR DOCS — a newsstand of ${M.order.length} stories in ${M.series.length} titles. `+
    `Set from the living archive: ${fmtNum(M.commits)} press runs by ${M.allHandsCount} hands, ${fmtMonth(M.epoch)} to ${fmtMonth(M.lastPress)}. `+
    `Every number, name, date, price and cover on this stand is derived from the archive — nothing invented. `+
    `A DOCS CODE PUBLICATION.`));
  rack.appendChild(inner);
}

function openSeries(idx){
  const M=S.M; const t=M.series.find(x=>x.idx===idx); if(!t)return;
  S.seriesOpen=idx;
  const v=$('#series'); v.innerHTML='';
  const inner=el('div','series-inner');
  const bar=el('div','backbar');
  const back=el('button','btn-tab','← THE RACK');
  back.addEventListener('click',goRack);
  bar.appendChild(back);
  inner.appendChild(bar);

  const head=el('div','series-head');
  const logo=cvs(760,118);
  { const x=logo.getContext('2d');
    x.font='600 15px Oswald,"Arial Narrow",sans-serif'; x.fillStyle='#3a3020'; x.textAlign='center';
    x.fillText(t.kicker,380,20);
    const lines=fitLogoLines(t.noun);
    const lh=88/lines.length;
    lines.forEach((ln,i)=>drawLettering(x,ln,{x:380,y:28+lh*(i+0.75),w:690,size:Math.min(lh*0.92,56),
      color:comboRGB(t.combo),style:t.style,seed:hash32('serlogo'+idx)+i,arc:i===0?0.08:0.02,telescope:4}));
  }
  head.appendChild(logo);
  const hubPg=M.pages[t.hub];
  head.appendChild(el('div','series-meta',
    `<span><b>${t.members.length}</b> issues</span><span><b>${t.hands.size}</b> hands</span>`+
    `<span><b>${fmtNum(t.words)}</b> words</span><span><b>${t.commits}</b> printings</span>`+
    `<span>${fmtMonth(t.first)} – ${fmtMonth(t.last)}</span><span>edited by <b>${esc(t.editor)}</b></span>`+
    `<span>lettering after ${t.style==='schnapp'?'Schnapp':'Saladino'}</span>`));
  if(hubPg&&hubPg.description) head.appendChild(el('div','series-blurb',esc(hubPg.description)));
  inner.appendChild(head);

  inner.appendChild(el('div','checklist-label','COLLECTOR\'S CHECKLIST — ALL '+t.members.length+' ISSUES'));
  const grid=el('div','issue-grid');
  t.members.forEach(s=>{
    const iss=M.issue[s];
    const card=el('div','issue-card'); card.tabIndex=0;
    const c=cvs(186,279,DPR); queuePaint(c,s,186,279,'mini');
    card.appendChild(c);
    if(iss.uncited) card.appendChild(el('div','never','NEVER REPRINTED'));
    card.appendChild(el('div','ic-cap',
      `<b>#${iss.no} · ${fmtMonth(iss.date)}${S.pull.has(s)?' ✓':''}</b>${esc(M.pages[s].sidebarLabel||'')}`));
    const go=()=>openIssue(s);
    card.addEventListener('click',go);
    card.addEventListener('keydown',e=>{if(e.key==='Enter')go();});
    grid.appendChild(card);
  });
  inner.appendChild(grid);
  v.appendChild(inner);
  showView('series');
  v.scrollTop=0;
  location.hash='#/title/'+idx;
}

function openBullpen(){
  const M=S.M; S.seriesOpen='bullpen';
  const v=$('#series'); v.innerHTML='';
  const inner=el('div','series-inner');
  const bar=el('div','backbar');
  const back=el('button','btn-tab','← THE RACK'); back.addEventListener('click',goRack);
  bar.appendChild(back); inner.appendChild(bar);
  const head=el('div','series-head');
  const logo=cvs(760,96);
  { const x=logo.getContext('2d');
    drawLettering(x,'THE BULLPEN',{x:380,y:66,w:660,size:54,color:'#e9c81f',style:'saladino',seed:99,arc:0.08,telescope:4}); }
  head.appendChild(logo);
  head.appendChild(el('div','series-meta',
    `<span><b>${M.livingHands.size}</b> hands on today's pages</span><span><b>${M.allHandsCount}</b> all-time</span>`+
    `<span><b>${fmtNum(M.commits)}</b> press runs</span><span>${fmtMonth(M.epoch)} – ${fmtMonth(M.lastPress)}</span>`));
  inner.appendChild(head);

  /* the living roster */
  inner.appendChild(el('div','checklist-label','TODAY\'S BULLPEN — '+M.livingHands.size+' HANDS, AS SIGNED IN THE LEDGER'));
  const card=el('div','series-head');
  const roster=el('div','roster'); roster.style.columns='3';
  const living=[...M.livingHands].map(a=>({a,L:M.ledger[a]})).filter(x=>x.L)
    .sort((x,y)=>y.L.commits-x.L.commits);
  for(const {a,L} of living){
    roster.appendChild(el('div','',
      `<span class="r-name">${esc(a)}</span> <span class="r-n">— ${L.commits} run${L.commits>1?'s':''}, ${L.pages.size} stor${L.pages.size>1?'ies':'y'}, since ${fmtMonth(L.first)}${L.night?', ☾'+L.night:''}</span>`));
  }
  card.appendChild(roster);
  card.appendChild(el('div','series-blurb','☾ n — sessions inked between midnight and dawn.'));
  inner.appendChild(card);

  /* night shift honor roll */
  const nights=M.order.filter(s=>M.prov[s]&&M.prov[s].night>0)
    .sort((a,b)=>M.prov[b].night-M.prov[a].night);
  inner.appendChild(el('div','checklist-label','THE NIGHT SHIFT — STORIES INKED PAST MIDNIGHT'));
  const nsCard=el('div','series-head');
  const nsList=el('div','roster'); nsList.style.columns='2';
  nights.forEach(s=>{
    nsList.appendChild(el('div','',
      `<span class="r-name">${esc(M.pages[s].sidebarLabel)}</span> <span class="r-n">— ${M.prov[s].night} late session${M.prov[s].night>1?'s':''} (${esc(M.issue[s].series.noun)} #${M.issue[s].no})</span>`));
  });
  nsCard.appendChild(nsList);
  inner.appendChild(nsCard);

  /* gone but not forgotten */
  inner.appendChild(el('div','checklist-label','GONE BUT NOT FORGOTTEN — '+M.goneHands.length+' HANDS OF PAGES NO LONGER IN PRINT'));
  const goneCard=el('div','series-head');
  const gl=el('div','roster'); gl.style.columns='3';
  M.goneHands.forEach(g=>{
    gl.appendChild(el('div','',`<span class="r-name">${esc(g.name)}</span> <span class="r-n">— ${g.commits} run${g.commits>1?'s':''}, last ${fmtMonth(g.last)}</span>`));
  });
  goneCard.appendChild(gl);
  goneCard.appendChild(el('div','series-blurb',
    'Their pages left the stands, but the ledger keeps every name. The line is '+
    `${M.order.length} stories today because ${M.allHandsCount} hands set type since ${fmtMonth(M.epoch)}.`));
  inner.appendChild(goneCard);

  v.appendChild(inner);
  showView('series');
  v.scrollTop=0;
  location.hash='#/bullpen';
}

/* ================= 10. finder ================= */
function openFinder(mode, seedChar){
  S.finderMode=mode;
  const f=$('#finder'); f.hidden=false; f.innerHTML='';
  const card=el('div','finder-card');
  const head=el('div','finder-head');
  head.appendChild(el('div','f-logo', mode==='index'?'THE CHECKLIST':'STORY FINDER'));
  const input=el('input'); input.type='text';
  input.placeholder= mode==='index' ? 'all 290 stories — type to narrow' : 'find any story or chapter…';
  if(seedChar) input.value=seedChar;
  head.appendChild(input);
  card.appendChild(head);
  const list=el('div','finder-list');
  card.appendChild(list);
  card.appendChild(el('div','finder-foot',
    `<span><kbd>↑↓</kbd> choose · <kbd>enter</kbd> open · <kbd>esc</kbd> close</span><span id="fcount"></span>`));
  f.appendChild(card);
  let sel=0, rows=[];
  const run=()=>{
    const q=input.value.trim().toLowerCase();
    let res;
    if(!q){
      res = S.M.order.map(slug=>({slug,h:null}));
    } else {
      const scored=[];
      for(const e of S.M.index){
        const ix=e.text.indexOf(q);
        if(ix<0)continue;
        let score=(ix===0?4:(e.text[ix-1]===' '?3:1)) + (e.h?0:2.2) - ix*0.002;
        scored.push({e,score});
      }
      scored.sort((a,b)=>b.score-a.score);
      const seen=new Set(); res=[];
      for(const {e} of scored){
        const k=e.slug+'|'+(e.h||'');
        if(seen.has(k))continue; seen.add(k);
        res.push(e); if(res.length>=(S.finderMode==='index'?400:14))break;
      }
    }
    list.innerHTML=''; rows=[]; sel=0;
    const frag=document.createDocumentFragment();
    res.slice(0,400).forEach((e,i)=>{
      const iss=S.M.issue[e.slug], p=S.M.pages[e.slug];
      const row=el('div','f-row'+(i===0?' sel':''));
      row.appendChild(el('span','f-issue',`${esc(iss.series.noun)} #${iss.no}`));
      row.appendChild(el('span','f-title', esc(p.sidebarLabel||stripTitle(p.title))));
      row.appendChild(el('span','f-sub', e.h?('§ '+esc(e.sub)):esc(p.section||'')));
      row.addEventListener('click',()=>choose(e));
      frag.appendChild(row); rows.push({row,e});
    });
    list.appendChild(frag);
    $('#fcount').textContent = q ? rows.length+' found' : S.M.order.length+' stories on the stand';
    if(q) SFX.tick();
  };
  const choose=e=>{ closeFinder(); openIssue(e.slug, e.h?{heading:e.h}:{atSplash:true}); };
  input.addEventListener('input',run);
  input.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){ e.preventDefault(); if(rows.length){ rows[sel].row.classList.remove('sel'); sel=(sel+1)%rows.length; rows[sel].row.classList.add('sel'); rows[sel].row.scrollIntoView({block:'nearest'});} }
    else if(e.key==='ArrowUp'){ e.preventDefault(); if(rows.length){ rows[sel].row.classList.remove('sel'); sel=(sel-1+rows.length)%rows.length; rows[sel].row.classList.add('sel'); rows[sel].row.scrollIntoView({block:'nearest'});} }
    else if(e.key==='Enter'){ if(rows[sel]) choose(rows[sel].e); }
    else if(e.key==='Escape'){ closeFinder(); }
    e.stopPropagation();
  });
  f.addEventListener('click',e=>{ if(e.target===f) closeFinder(); });
  run();
  input.focus();
  if(seedChar) input.setSelectionRange(input.value.length,input.value.length);
}
function closeFinder(){ const f=$('#finder'); f.hidden=true; f.innerHTML=''; S.finderMode=null; }

/* ================= 11. sound (all synthesized — see CREDITS.txt) ================= */
const SFX={
  ctx:null, master:null,
  ensure(){
    if(this.ctx)return true;
    try{
      this.ctx=new (window.AudioContext||window.webkitAudioContext)();
      this.master=this.ctx.createGain(); this.master.gain.value=0.5;
      this.master.connect(this.ctx.destination);
    }catch(e){ return false; }
    return true;
  },
  noise(dur,f0,f1,gain,delay){
    if(!S.sound||!this.ensure())return;
    const c=this.ctx, t=c.currentTime+(delay||0);
    const len=Math.floor(c.sampleRate*dur);
    const buf=c.createBuffer(1,len,c.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-i/len);
    const src=c.createBufferSource(); src.buffer=buf;
    const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=0.8;
    bp.frequency.setValueAtTime(f0,t); bp.frequency.exponentialRampToValueAtTime(f1,t+dur);
    const g=c.createGain();
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(gain,t+dur*0.2);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    src.connect(bp); bp.connect(g); g.connect(this.master);
    src.start(t); src.stop(t+dur+0.02);
  },
  tone(freq,dur,gain,type,delay){
    if(!S.sound||!this.ensure())return;
    const c=this.ctx, t=c.currentTime+(delay||0);
    const o=c.createOscillator(); o.type=type||'triangle'; o.frequency.value=freq;
    const g=c.createGain();
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(gain,t+0.015);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t+dur+0.02);
  },
  turn(){ this.noise(0.16,1400,320,0.10); this.noise(0.09,700,240,0.07,0.12); },
  open(){ this.noise(0.24,900,220,0.12); this.tone(96,0.16,0.05,'sine',0.16); },
  tick(){ this.tone(1900,0.03,0.028,'square'); },
  rescue(){ this.tone(523,0.14,0.05); this.tone(784,0.22,0.05,'triangle',0.12); },
  print(){ this.tone(240,0.04,0.06,'square'); this.tone(180,0.05,0.05,'square',0.07); this.noise(0.1,2000,900,0.03,0.12); },
};

/* ================= 12. toast, views, router, keys ================= */
let toastTimer=null;
function toast(msg){
  const t=$('#toast'); t.textContent=msg; t.hidden=false;
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>{t.hidden=true;},2600);
}
function showView(id){
  for(const v of ['rack','series','bookview']) $('#'+v).hidden=(v!==id);
  S.view=id;
}
function goRack(){ showView('rack'); location.hash='#/rack'; refreshBinStickers(); }
function refreshBinStickers(){
  document.querySelectorAll('#bin .bin-item').forEach(it=>{
    if(S.rescued.has(it.dataset.slug) && !it.querySelector('.rescued'))
      it.appendChild(el('div','rescued','RESCUED'));
  });
  const sub=document.querySelector('.bin-sub');
  if(sub) sub.innerHTML=`${S.M.uncited.length} stories no other tale cites — never reprinted. Reading one rescues it; the bin remembers. `+
    `<b>${S.rescued.size} of ${S.M.uncited.length} taken home so far.</b>`;
}
function route(){
  const h=decodeURIComponent(location.hash||'');
  if(!S.M)return;
  if(h.startsWith('#/read/')){
    const rest=h.slice(6);
    const at=rest.indexOf('@');
    const slug=at>=0?rest.slice(0,at):rest;
    const heading=at>=0?rest.slice(at+1):null;
    if(S.book&&S.book.slug===slug&&S.view==='bookview')return;
    if(S.M.issue[slug]) openIssue(slug,heading?{heading}:{});
    return;
  }
  if(h.startsWith('#/cms/')||h.startsWith('#/cloud/')||h.startsWith('#/whats-new')||h.startsWith('#/release-notes')){
    /* deep links straight from story text: #/cms/x/y#anchor */
    const body=h.slice(1);
    const hashAt=body.indexOf('#');
    const slug=hashAt>=0?body.slice(0,hashAt):body;
    const anchor=hashAt>=0?body.slice(hashAt+1):null;
    if(S.M.issue[slug]) openIssue(slug, anchor?{heading:anchor}:{atSplash:true});
    else toast('THAT TALE IS NOT ON THIS STAND');
    return;
  }
  if(h.startsWith('#/title/')){ const i=+h.slice(8);
    if(!isNaN(i)&&!(S.view==='series'&&S.seriesOpen===i)) openSeries(i); return; }
  if(h==='#/bullpen'){ if(!(S.view==='series'&&S.seriesOpen==='bullpen')) openBullpen(); return; }
  if(h==='#/bin'){ showView('rack'); const b=$('#bin'); if(b)b.scrollIntoView(); return; }
  showView('rack');
}
function initKeys(){
  document.addEventListener('keydown',e=>{
    if(e.target.matches('input,textarea'))return;
    if(!$('#lightbox').hidden){ if(e.key==='Escape'||e.key===' ')closeLightbox(); return; }
    if(!$('#finder').hidden){ if(e.key==='Escape')closeFinder(); return; }
    if(e.key==='/'){ e.preventDefault(); openFinder('search'); return; }
    if(e.key==='i'||e.key==='I'){ e.preventDefault(); openFinder('index'); return; }
    if(e.key==='s'||e.key==='S'){ toggleSound(); return; }
    if(S.view==='bookview'){
      if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){ e.preventDefault(); bookView.next(); }
      else if(e.key==='ArrowLeft'||e.key==='PageUp'){ e.preventDefault(); bookView.prev(); }
      else if(e.key==='Home'){ bookView.show(0); }
      else if(e.key==='Escape'){ openSeries(S.book.series.idx); }
    } else if(S.view==='series'){
      if(e.key==='Escape') goRack();
    } else {
      if(/^[a-z0-9]$/i.test(e.key)&&!e.metaKey&&!e.ctrlKey&&!e.altKey){ openFinder('search',e.key); }
    }
  });
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#/"]');
    if(a){ e.preventDefault(); a.dataset.xover=1; location.hash=a.getAttribute('href').slice(1); }
  });
  window.addEventListener('hashchange',route);
}
function toggleSound(){
  S.sound=!S.sound; store.set('sound',S.sound);
  $('#sfx-toggle').textContent='SOUND: '+(S.sound?'ON':'OFF');
  toast(S.sound?'SOUND EFFECTS ON!':'SILENT RUNNING.');
  if(S.sound)SFX.tick();
}

/* ================= 13. boot ================= */
async function boot(){
  try{
    /* the type must be in the case before the presses roll — canvas
       lettering measures real glyphs, so wait (briefly) for the faces */
    const want=['400 20px Bangers','600 20px Oswald','500 20px Oswald',
      '400 20px "Patrick Hand"','400 20px "Gochi Hand"',
      '400 14px "PT Serif"','700 14px "PT Serif"','400 14px "Courier Prime"'];
    await Promise.race([
      Promise.allSettled(want.map(f=>document.fonts.load(f))),
      new Promise(r=>setTimeout(r,3200))
    ]).catch(()=>{});
    await loadData();
    buildModel();
    /* wire the drawn cast */
    if(window.FC_CAST) CAST=window.FC_CAST({el,esc,cvs,DPR,mulberry,hash32,clamp,
      comboRGB,fillScreened,screenTile,INK,COMBOS,burstPath,drawLettering,
      textOf,firstSentence,bangify,S,CONTENT_W,renderBlocks});
    makePaper();
    makeRoughBorders();
    makeSeals();
    if(REDUCED) document.body.classList.add('rm');
    /* one global sound toggle */
    const st=el('button','btn-tab','SOUND: '+(S.sound?'ON':'OFF'));
    st.id='sfx-toggle';
    st.style.cssText='position:fixed;top:14px;right:18px;z-index:40;';
    st.addEventListener('click',toggleSound);
    document.body.appendChild(st);
    renderRack();
    bookView.init();
    initKeys();
    $('#app').hidden=false;
    $('#boot').remove();
    route();
    __fc.ready=performance.now();
    __fc.api={openIssue,openSeries,openFinder,paginate,bookView,S,CAST,paintCover};
  }catch(err){
    const b=$('#boot .boot-line'); if(b){ b.textContent='PRESS JAM! '+err.message; b.style.animation='none'; }
    console.error(err);
    throw err;
  }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
else boot();
})();
