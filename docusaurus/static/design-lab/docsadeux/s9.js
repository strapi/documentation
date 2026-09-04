/* Cite Right — 290 documentation pages looking for love.
   Every number, name and quote on screen comes from content.json, graph.json,
   communities.json or provenance.json. The only fiction is the premise. */
'use strict';

/* ================= seeded randomness ================= */
const SEED = 'iXL2x8rPVdh0FtwvqPKgsg57vfy7xg9Gul8pTlYuWW2VaGHAJSNc2Ed6TrsXsNP8ogxR3m8lIkqOrTHWvxjp3EKJSEuu9nPj';
function xmur3(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19;}return function(){h=Math.imul(h^(h>>>16),2246822507);h=Math.imul(h^(h>>>13),3266489909);return (h^=h>>>16)>>>0;};}
function sfc32(a,b,c,d){return function(){a>>>=0;b>>>=0;c>>>=0;d>>>=0;let t=(a+b)|0;a=b^b>>>9;b=c+(c<<3)|0;c=(c<<21|c>>>11);d=d+1|0;t=t+d|0;c=c+t|0;return (t>>>0)/4294967296;};}
function rngFor(key){const s=xmur3(SEED+'::'+key);return sfc32(s(),s(),s(),s());}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function shuffled(arr,rng){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

/* ================= tiny dom helpers ================= */
const $=s=>document.querySelector(s);
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function stripTags(html){const t=document.createElement('template');t.innerHTML=html;return (t.content.textContent||'').replace(/\s+/g,' ').trim();}
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}

/* ================= data ================= */
let C,G,PROV,COMM;
let pages,order,nav;
const outbound={},inbound={};          // slug -> Set
const edgeSet=new Set();               // 'a|b'
let mutualPairs=[];                    // [a,b] sorted, a<b
const mutualSet=new Set();
let singles=[];                        // zero-inbound slugs
const navIdx={};                       // slug -> nav section index
const commOf={};                       // slug -> {id, dominant, purity, hub}
const bioCache={}, quoteCache={};
let deckContext='/cms/intro', deckQueue=null, lastRead=null, currentSlug=null;

async function boot(){
  const [c,g,p,cm]=await Promise.all(['content.json','graph.json','provenance.json','communities.json']
    .map(f=>fetch(f).then(r=>r.json())));
  C=c;G=g;PROV=p;COMM=cm;
  pages=C.pages;order=C.order;nav=C.nav;
  for(const [a,b] of G.edges){
    (outbound[a]=outbound[a]||new Set()).add(b);
    (inbound[b]=inbound[b]||new Set()).add(a);
    edgeSet.add(a+'|'+b);
  }
  for(const [a,b] of G.edges){
    if(a<b&&edgeSet.has(b+'|'+a)){mutualPairs.push([a,b]);mutualSet.add(a+'|'+b);}
  }
  singles=order.filter(s=>!inbound[s]||inbound[s].size===0);
  nav.forEach((sec,i)=>{(sec.items||[]).forEach(it=>{if(navIdx[it.slug]===undefined)navIdx[it.slug]=i;});});
  for(const id of Object.keys(COMM)){const cc=COMM[id];for(const m of cc.members||[])commOf[m]={id,dominant:cc.dominant,purity:cc.purity,hub:cc.hub};}
  $('#matchCount').textContent=mutualPairs.length;
  setupSearch();setupKeys();
  window.addEventListener('hashchange',route);
  route();
}

/* ================= page helpers ================= */
function label(slug){const p=pages[slug];if(!p)return slug;return p.sidebarLabel||cleanTitle(p.title)||slug;}
function cleanTitle(t){return String(t||'').replace(/\s*[-|]\s*Strapi.*$/,'').trim()||t;}
function prov(slug){return PROV[slug]||{commits:0,authors:[],topAuthor:'',first:null,last:null,night:0,careDays:0};}
function ageDays(slug){const f=prov(slug).first;if(!f)return null;return Math.max(0,Math.floor((Date.now()-new Date(f+'T12:00:00Z'))/864e5));}
function inCount(s){return inbound[s]?inbound[s].size:0;}
function outCount(s){return outbound[s]?outbound[s].size:0;}
function isMutual(a,b){return edgeSet.has(a+'|'+b)&&edgeSet.has(b+'|'+a);}

function walkBlocks(blocks,fn,state){ // depth-first, document order
  for(const b of blocks||[]){
    if(fn(b,state)===false)return false;
    if(b.blocks&&walkBlocks(b.blocks,fn,state)===false)return false;
    if(b.t==='tabs')for(const tb of b.tabs||[])if(walkBlocks(tb.blocks||[],fn,state)===false)return false;
    if(b.t==='columns')for(const col of b.cols||[])if(walkBlocks(col,fn,state)===false)return false;
    if(b.t==='ul'||b.t==='ol')for(const it of b.items||[])if(typeof it==='object'&&it&&it.blocks)if(walkBlocks(it.blocks,fn,state)===false)return false;
  }
  return true;
}

const LANGNAMES={js:'JavaScript',javascript:'JavaScript',jsx:'JSX',ts:'TypeScript',typescript:'TypeScript',tsx:'TSX',sh:'shell',bash:'shell',shell:'shell',json:'JSON',graphql:'GraphQL',yaml:'YAML',yml:'YAML',sql:'SQL',http:'HTTP',curl:'cURL',py:'Python',docker:'Docker',dockerfile:'Docker',env:'dotenv',plaintext:'plain text',text:'plain text',md:'Markdown',html:'HTML',css:'CSS',nginx:'nginx'};
function codeLangs(slug){
  const langs=new Map();
  walkBlocks(pages[slug].blocks,b=>{
    if(b.t==='code'&&b.lang)langs.set(b.lang,(langs.get(b.lang)||0)+1);
    if(b.t==='endpoint')for(const ct of b.codeTabs||[])if(ct.lang)langs.set(ct.lang,(langs.get(ct.lang)||0)+1);
  });
  const nice=[...langs.entries()].sort((a,b)=>b[1]-a[1]).map(([l])=>LANGNAMES[l.toLowerCase()]||l);
  return [...new Set(nice)];
}
function endpointCount(slug){let n=0;walkBlocks(pages[slug].blocks,b=>{if(b.t==='endpoint')n++;});return n;}
function firstImg(slug){let img=null;walkBlocks(pages[slug].blocks,b=>{if(b.t==='img'&&(b.light||b.dark)){img=b.light||b.dark;return false;}});return img;}
function firstParamName(slug){let n=null;walkBlocks(pages[slug].blocks,b=>{if(b.t==='endpoint'&&b.params&&b.params.length){n=b.params[0].name;return false;}});return n;}

const MONO_HUES=[['#c65f3d','#a34a2c'],['#4945ff','#3733d6'],['#5f8a56','#46693f'],['#d9a03f','#a87722'],['#b0625e','#8d4340'],['#6f5bb5','#57458f']];
function monogramHTML(slug,extraCls){
  const rng=rngFor('mono'+slug);
  const [c1,c2]=pick(rng,MONO_HUES);
  const words=label(slug).split(/\s+/).filter(Boolean);
  const init=(words[0]?.[0]||'?')+(words[1]?.[0]||'');
  return '<div class="monogram '+(extraCls||'')+'" style="background:linear-gradient(135deg,'+c1+','+c2+')">'+esc(init.toUpperCase())+'</div>';
}
function faceHTML(slug){
  const img=firstImg(slug);
  if(img)return '<img src="'+esc(img)+'" alt="Profile photo: '+esc(label(slug))+'" loading="lazy">';
  return monogramHTML(slug);
}
function navDistance(a,b){
  const ia=navIdx[a],ib=navIdx[b];
  if(ia===undefined||ib===undefined)return null;
  return Math.abs(ia-ib);
}
function distanceText(ctx,cand){
  const d=navDistance(ctx,cand);
  const ldr=pages[ctx].product!==pages[cand].product?' · long-distance (other product)':'';
  if(d===null)return pages[cand].section;
  if(d===0)return 'same section — you’ve probably met'+ldr;
  return d+' section'+(d>1?'s':'')+' away'+ldr;
}

/* ================= bio generator (every claim = a data field) ================= */
const LOOKING={
 'Content APIs':['Looking for someone who appreciates long walks through query parameters.','Will respond to any request, even malformed ones.'],
 'Configurations':['Looking for someone who reads my .env before judging me.','My boundaries are well documented.'],
 'Features':['Looking for a reader who enables me in production.','Feature-complete, emotionally available.'],
 'Getting Started':['New here? Me too. Let’s start something.','I do first impressions professionally.'],
 'Development':['Looking for someone to extend me, not just override me.','I believe in strong conventions and open customization.'],
 'Plugins development':['Looking for someone to extend me, not just override me.','I play well with the ecosystem.'],
 'TypeScript':['Strongly typed, softly spoken.','I’ll tell you exactly what I expect. It’s all in the types.'],
 'Command Line Interface':['I prefer short commands and long conversations.','Flags optional, commitment appreciated.'],
 'Upgrades':['I’ve been through some breaking changes. Ready to move on.','Growth mindset, literally versioned.'],
 'AI':['Looking for a human in the loop.','I’m told I’m very promptable.'],
 'Deployments':['Ready to ship whenever you are.','Looking for something serverful.'],
 'Projects management':['I’ll keep your projects, you keep my links.','Organized, and looking for the same.'],
 'Account management':['I remember your settings. All of them.','Low maintenance, high availability.'],
 'Advanced configuration':['Complicated, but in a documented way.','My depths are all indexed.'],
 '_default':['Swipe right if you’d cite me.','Looking for a reader who finishes pages.']
};
function bio(slug){
  if(bioCache[slug])return bioCache[slug];
  const p=pages[slug],pv=prov(slug),rng=rngFor('bio'+slug);
  const words=G.words[slug],inb=inCount(slug),out=outCount(slug);
  const langs=codeLangs(slug),eps=endpointCount(slug);
  const lines=[];
  // opener — citation status
  if(inb>=15)lines.push(pick(rng,[inb+' pages can’t stop citing me.',inb+' pages link here. I try to stay humble.']));
  else if(inb>=1)lines.push(pick(rng,['Quietly cited by '+inb+' page'+(inb>1?'s':'')+'.',inb+' page'+(inb>1?'s':'')+' already swiped right on me, bibliographically.']));
  else lines.push(pick(rng,['Zero inbound links, '+words+' words of substance. Their loss.','Nobody cites me yet. I’m '+words+' words of untapped potential.']));
  // traits pool
  const traits=[];
  if(langs.length>=2)traits.push('Fluent in '+langs[0]+' and '+langs[1]+'.');
  else if(langs.length===1)traits.push('Fluent in '+langs[0]+'.');
  if(eps>0)traits.push(eps+' endpoint'+(eps>1?'s':'')+', and I answer all of them.');
  if(pv.night>0)traits.push('More of a night person: '+pv.night+' of my edits happened after 22h.');
  if(pv.careDays>=365)traits.push('Under steady care for '+pv.careDays+' days. I don’t ghost.');
  if(pv.authors.length>=4)traits.push(pv.authors.length+' people have shaped me. '+pv.topAuthor+' knows me best.');
  else if(pv.commits>=10)traits.push(pv.commits+' commits of personal growth.');
  if(out>=10)traits.push('I cite '+out+' other pages. I’m a giver.');
  if(p.tags&&p.tags.length>=2)traits.push('Into '+p.tags[0]+' and '+p.tags[1]+'.');
  if(words>=3000)traits.push(words.toLocaleString('en')+' words. I’m told I over-share.');
  for(const t of shuffled(traits,rng).slice(0,2))lines.push(t);
  // love language — a real param name or tag
  const param=firstParamName(slug);
  if(param&&rng()<0.65)lines.push('My love language is '+param+'.');
  else if(p.tags&&p.tags.length&&rng()<0.5)lines.push('My love language is '+p.tags[p.tags.length-1]+'.');
  // looking for
  lines.push(pick(rng,LOOKING[p.section]||LOOKING._default));
  return bioCache[slug]=lines;
}

/* ================= citation forensics ================= */
function citeSpot(from,to){ // where does `from` link to `to`?
  const re=new RegExp('#'+to.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=["#])');
  let para=0,lastHead=null,hit=null;
  walkBlocks(pages[from].blocks,b=>{
    if(/^h[2-6]$/.test(b.t))lastHead=b.text;
    if(b.t==='p'){para++;if(re.test(b.html)){hit={para,heading:lastHead};return false;}}
    const hay=(b.t==='ul'||b.t==='ol')?(b.items||[]).map(i=>typeof i==='string'?i:(i.html||'')).join(' ')
      :b.t==='table'?(b.rows||[]).flat().join(' ')
      :b.t==='cards'?(b.items||[]).map(i=>i.link||'').join(' ')
      :(b.html||b.description||b.desc||'');
    if(hay&&re.test(hay)){hit={para:null,heading:lastHead};return false;}
  });
  return hit;
}
function citePhrase(spot,pron){
  if(!spot)return pron+' somewhere between the lines';
  if(spot.para)return pron+' in paragraph '+spot.para+(spot.heading?' (under “'+esc(spot.heading)+'”)':'');
  if(spot.heading)return pron+' under “'+esc(spot.heading)+'”';
  return pron+' right at the top of the page';
}
function bfsDistance(a,b,maxD){ // undirected citation hops
  if(a===b)return 0;
  const seen=new Set([a]);let frontier=[a],d=0;
  while(frontier.length&&d<maxD){
    d++;const next=[];
    for(const s of frontier){
      const nbrs=new Set([...(outbound[s]||[]),...(inbound[s]||[])]);
      for(const n of nbrs){if(n===b)return d;if(!seen.has(n)){seen.add(n);next.push(n);}}
    }
    frontier=next;
  }
  return null;
}

/* ================= verbatim quotes for chat ================= */
function quotes(slug){
  if(quoteCache[slug])return quoteCache[slug];
  const out=[];const seen=new Set();
  walkBlocks(pages[slug].blocks,b=>{
    let texts=[];
    if(b.t==='p')texts=[stripTags(b.html)];
    else if(b.t==='ul'||b.t==='ol')texts=(b.items||[]).map(i=>stripTags(typeof i==='string'?i:(i.html||'')));
    for(const t of texts){
      for(const s of t.split(/(?<=[.!?])\s+/)){
        const q=s.trim();
        if(q.length>=25&&q.length<=140&&!seen.has(q)&&/[.!?]$/.test(q)){seen.add(q);out.push(q);}
      }
    }
    if(out.length>60)return false;
  });
  return quoteCache[slug]=out;
}

/* ================= block renderers ================= */
function renderBlocks(blocks,ctx){
  const frag=document.createDocumentFragment();
  for(const b of blocks||[])frag.appendChild(renderBlock(b,ctx));
  return frag;
}
let tabUid=0;
function renderBlock(b,ctx){
  switch(b.t){
    case 'p':return el('p',null,b.html);
    case 'h2':case 'h3':case 'h4':case 'h5':case 'h6':{
      const h=el(b.t,null,esc(b.text));
      if(b.id){h.id=b.id;const a=el('a','anchor','¶');a.href='#'+ctx.slug+'#'+b.id;a.setAttribute('aria-label','Link to this section');h.appendChild(a);}
      return h;
    }
    case 'ul':case 'ol':{
      const l=document.createElement(b.t);
      if(b.t==='ol'&&b.start&&b.start!==1)l.start=b.start;
      for(const it of b.items||[]){
        const li=document.createElement('li');
        if(typeof it==='string')li.innerHTML=it;
        else{li.innerHTML=it.html||'';if(it.blocks)li.appendChild(renderBlocks(it.blocks,ctx));}
        l.appendChild(li);
      }
      return l;
    }
    case 'code':return codeBlock(b.lang,b.title,b.code);
    case 'admonition':{
      const kind=(b.kind||'note').toLowerCase();
      const box=el('aside','admon '+kind);
      const icons={note:'✎',tip:'★',info:'ℹ',caution:'⚠',warning:'⚠',danger:'⛔',prerequisites:'☑',strapi:'✿',callout:'☛',growth:'✤',enterprise:'✦',version:'❈','cloud-business':'☁'};
      const t=b.title||kind.charAt(0).toUpperCase()+kind.slice(1).replace(/-/g,' ');
      box.appendChild(el('div','atitle','<span aria-hidden="true">'+(icons[kind]||'✎')+'</span> '+esc(t)));
      box.appendChild(renderBlocks(b.blocks,ctx));
      return box;
    }
    case 'table':{
      const wrap=el('div','tablewrap');
      const tb=document.createElement('table');
      const al=b.align||[];
      if(b.head&&b.head.length){
        const tr=document.createElement('tr');
        b.head.forEach((h,i)=>{const th=el('th',null,h);if(al[i]&&al[i]!=='left')th.style.textAlign=al[i];tr.appendChild(th);});
        tb.appendChild(el('thead')).appendChild(tr);
      }
      const body=tb.appendChild(el('tbody'));
      for(const row of b.rows||[]){
        const tr=document.createElement('tr');
        row.forEach((c,i)=>{const td=el('td',null,c);if(al[i]&&al[i]!=='left')td.style.textAlign=al[i];tr.appendChild(td);});
        body.appendChild(tr);
      }
      wrap.appendChild(tb);return wrap;
    }
    case 'tabs':{
      const id='dt'+(++tabUid);
      const box=el('div','dtabs');
      const bar=el('div','tabbar');bar.setAttribute('role','tablist');
      const panels=[];
      (b.tabs||[]).forEach((tab,i)=>{
        const btn=el('button',null,esc(tab.label||tab.value||('Tab '+(i+1))));
        btn.setAttribute('role','tab');btn.id=id+'b'+i;
        btn.setAttribute('aria-selected',i===0?'true':'false');
        const panel=el('div','tabpanel');panel.setAttribute('role','tabpanel');
        panel.appendChild(renderBlocks(tab.blocks,ctx));
        if(i>0)panel.hidden=true;
        btn.addEventListener('click',()=>{
          bar.querySelectorAll('button').forEach(x=>x.setAttribute('aria-selected','false'));
          panels.forEach(p=>p.hidden=true);
          btn.setAttribute('aria-selected','true');panel.hidden=false;
        });
        bar.appendChild(btn);panels.push(panel);
      });
      box.appendChild(bar);panels.forEach(p=>box.appendChild(p));
      return box;
    }
    case 'details':{
      const d=el('details','doc-details');d.open=true;
      if(b.id)d.id=b.id;
      /* the summary is authored HTML from content.json (inline code, icons,
         entities): render it, don't escape it into visible markup */
      d.appendChild(el('summary',null,b.summary||'Details'));
      const body=el('div','dbody');body.appendChild(renderBlocks(b.blocks,ctx));
      d.appendChild(body);return d;
    }
    case 'img':{
      const f=el('figure','docimg');
      const img=document.createElement('img');
      img.src=b.light||b.dark;img.alt=b.alt||'';img.loading='lazy';
      img.addEventListener('error',()=>{f.remove();});
      f.appendChild(img);
      if(b.caption)f.appendChild(el('figcaption',null,b.caption));
      return f;
    }
    case 'endpoint':return endpointBlock(b,ctx);
    case 'cards':{
      const g=el('div','cardsgrid');
      for(const it of b.items||[]){
        const a=document.createElement('a');a.href=it.link||'#';
        a.innerHTML='<div class="ct">'+esc(it.title)+'</div><div class="cd">'+esc(it.desc||'')+'</div>';
        g.appendChild(a);
      }
      return g;
    }
    case 'badge':{
      const kind=(b.kind||'').toLowerCase();
      const s=el('span','badge badge--'+kind,esc(b.label||b.kind||'badge'));
      if(b.tooltip)s.title=b.tooltip;
      const wrap=el('p');wrap.appendChild(s);return wrap;
    }
    case 'tldr':return el('div','tldr','<span class="tag">TL;DR</span>'+(b.html||''));
    case 'columns':{
      const g=el('div','colgrid');
      g.style.setProperty('--ncols',String((b.cols||[]).length||2));
      for(const col of b.cols||[]){const c=el('div');c.appendChild(renderBlocks(col,ctx));g.appendChild(c);}
      return g;
    }
    case 'hr':return el('hr');
    default:return el('div',null,b.html||'');
  }
}
function codeBlock(lang,title,code){
  const box=el('div','codeblock');
  box.appendChild(el('div','codetitle','<span>'+esc(title||'')+'</span><span class="lang">'+esc(lang||'')+'</span>'));
  const pre=el('pre');const c=el('code');c.textContent=code||'';pre.appendChild(c);box.appendChild(pre);
  return box;
}
function endpointBlock(b,ctx){
  const box=el('div','endpoint');
  if(b.id)box.id=b.id;
  const head=el('div','ephead');
  if(b.title)head.appendChild(el('div','eptitle',esc(b.title)));
  if(b.method||b.path){
    const sig=el('div','sig');
    if(b.method)sig.appendChild(el('span','method '+esc(b.method),esc(b.method)));
    if(b.path)sig.appendChild(el('code','path',esc(b.path)));
    head.appendChild(sig);
  }
  if(b.description)head.appendChild(el('p','epdesc',b.description));
  box.appendChild(head);
  if(b.params&&b.params.length){
    const sec=el('div','epsec');
    sec.appendChild(el('h5',null,esc(b.paramTitle||'Parameters')));
    const wrap=el('div','tablewrap');const tb=el('table');
    tb.innerHTML='<thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead>';
    const body=el('tbody');
    for(const p of b.params){
      const tr=el('tr');
      tr.innerHTML='<td><code>'+esc(p.name)+'</code>'+(p.required?' <span class="req">required</span>':'')+'</td>'
        +'<td><code>'+esc(p.type||'')+'</code></td><td>'+(p.desc||'')+'</td>';
      body.appendChild(tr);
    }
    tb.appendChild(body);wrap.appendChild(tb);sec.appendChild(wrap);box.appendChild(sec);
  }
  if(b.codeTabs&&b.codeTabs.length){
    const sec=el('div','epsec');sec.appendChild(el('h5',null,'Example request'));
    sec.appendChild(renderBlock({t:'tabs',tabs:b.codeTabs.map(ct=>({label:ct.label||ct.lang,blocks:[{t:'code',lang:ct.lang,title:'',code:ct.code}]}))},ctx));
    box.appendChild(sec);
  }
  if(b.responses&&b.responses.length){
    const sec=el('div','epsec');
    for(const r of b.responses){
      const h=el('h5');h.innerHTML='<span class="status">'+esc(r.status||'')+'</span>'+esc(r.statusText||'Response');
      sec.appendChild(h);
      sec.appendChild(codeBlock(r.lang||'json','',r.body||''));
    }
    box.appendChild(sec);
  }
  return box;
}

/* ================= router ================= */
function route(){
  closeOverlay();
  const raw=(location.hash||'#').slice(1);
  const view=$('#view');
  if(!raw){renderRead('/cms/intro');return;}
  if(raw==='deck'){renderDeck();setTab('deck');document.title='Tonight · Cite Right';return;}
  if(raw==='matches'){renderMatches();setTab('matches');document.title='Matches · Cite Right';return;}
  if(raw==='singles'){renderSingles();setTab('singles');document.title='Singles · Cite Right';return;}
  if(raw==='browse'){renderBrowse();setTab('browse');document.title='Browse · Cite Right';return;}
  const hashPos=raw.indexOf('#',1);
  const slug=hashPos>0?raw.slice(0,hashPos):raw;
  const anchor=hashPos>0?raw.slice(hashPos+1):null;
  if(pages[slug]){
    if(slug===currentSlug&&anchor){scrollToAnchor(anchor);return;}
    renderRead(slug,anchor);
  }else{
    setTab(null);document.title='Not found · Cite Right';
    view.innerHTML='<div class="wrap"><div class="pagehead"><h1>No profile at <em>'+esc(slug)+'</em></h1><p class="lead">They may have moved on. Try <a href="#browse">browsing all 290 profiles</a>.</p></div></div>';
  }
}
function setTab(name){
  document.querySelectorAll('#tabs a').forEach(a=>a.classList.toggle('active',a.dataset.tab===name));
}
function scrollToAnchor(id){
  const t=document.getElementById(id);
  if(t)t.scrollIntoView({behavior:REDUCED?'auto':'smooth',block:'start'});
}

/* ================= READ view ================= */
function renderRead(slug,anchor){
  const p=pages[slug];currentSlug=slug;lastRead=slug;
  setTab(null);
  document.title=label(slug)+' · Cite Right';
  const view=$('#view');view.innerHTML='';
  const grid=el('div','readgrid');

  // profile rail
  const card=el('aside','profilecard');
  const img=firstImg(slug);
  card.innerHTML='<div class="photo">'+(img?'<img src="'+esc(img)+'" alt="Profile photo: '+esc(label(slug))+'" loading="lazy">':monogramHTML(slug))+'</div>';
  const body=el('div','body');
  const age=ageDays(slug);
  body.innerHTML='<h2>'+esc(label(slug))+(age!=null?' <span class="age">'+age+' days</span>':'')+'</h2>'
    +'<div class="meta">'+esc(p.section)+' · '+esc(p.product.toUpperCase())+'</div>'
    +'<div class="bio">'+bio(slug).slice(0,2).map(esc).join(' ')+'</div>'
    +'<div class="statline">'
    +'<span><b>'+inCount(slug)+'</b>cited by</span>'
    +'<span><b>'+outCount(slug)+'</b>cites</span>'
    +'<span><b>'+(G.words[slug]||0).toLocaleString('en')+'</b>words</span>'
    +'<span><b>'+prov(slug).commits+'</b>commits</span>'
    +'</div>';
  const actions=el('div','actions');
  const swipeBtn=el('button','btn terra','Swipe as this page');
  swipeBtn.addEventListener('click',()=>{deckContext=slug;deckQueue=null;location.hash='#deck';});
  const profBtn=el('button','btn ghost','Full profile & compatibility');
  profBtn.addEventListener('click',()=>openProfile(slug));
  actions.appendChild(swipeBtn);actions.appendChild(profBtn);
  body.appendChild(actions);
  card.appendChild(body);
  grid.appendChild(card);

  // article
  const art=el('article','doc');
  art.appendChild(el('h1',null,esc(cleanTitle(p.title)||label(slug))));
  if(p.description)art.appendChild(el('p','desc',esc(p.description)));
  art.appendChild(renderBlocks(p.blocks,{slug}));
  // prev / next
  const idx=order.indexOf(slug);
  const pn=el('nav','prevnext');
  if(idx>0){const s=order[idx-1];pn.innerHTML+='<a class="prev" href="#'+esc(s)+'"><div class="dir">← Previous</div><div class="pn-title">'+esc(label(s))+'</div></a>';}
  if(idx<order.length-1&&idx>=0){const s=order[idx+1];pn.innerHTML+='<a class="next" href="#'+esc(s)+'"><div class="dir">Next →</div><div class="pn-title">'+esc(label(s))+'</div></a>';}
  const artCol=el('div');artCol.appendChild(art);artCol.appendChild(pn);
  grid.appendChild(artCol);
  view.appendChild(grid);
  view.appendChild(el('div','footnote','Every fact on this profile comes from the documentation’s own content, link graph and six years of git history.'));
  if(anchor)requestAnimationFrame(()=>scrollToAnchor(anchor));
  else window.scrollTo(0,0);
}

/* ================= DECK ================= */
function buildDeck(){
  const ctx=deckContext;
  const rng=rngFor('deck'+ctx);
  const conn=[],rest=[];
  for(const s of order){
    if(s===ctx)continue;
    if(edgeSet.has(ctx+'|'+s)||edgeSet.has(s+'|'+ctx))conn.push(s);else rest.push(s);
  }
  deckQueue=shuffled(conn,rng).concat(shuffled(rest,rng));
}
function renderDeck(){
  currentSlug=null;
  if(!deckQueue)buildDeck();
  const view=$('#view');view.innerHTML='';
  const wrap=el('div','deckwrap');

  if(!store('s9hint')){
    const hint=el('div','hintbar','<span>❤︎</span><span><b>How this works:</b> every card is a real documentation page. Swipe right if you’d cite it. If it already cites the page you’re swiping as, that’s a <b>match</b> — 231 pairs of pages here genuinely cite each other.</span>');
    const x=el('button',null,'×');x.setAttribute('aria-label','Dismiss');
    x.addEventListener('click',()=>{store('s9hint','1');hint.remove();});
    hint.appendChild(x);wrap.appendChild(hint);
  }

  const asLine=el('div','as-line');
  asLine.append('Swiping as ');
  const sel=document.createElement('select');
  sel.setAttribute('aria-label','Choose which page you are swiping as');
  let curNav=null;let og=null;
  for(const s of order){
    const ni=navIdx[s];
    if(ni!==curNav){curNav=ni;og=document.createElement('optgroup');og.label=(nav[ni]?nav[ni].label+' ('+(nav[ni].product||'')+')':'Other');sel.appendChild(og);}
    const o=document.createElement('option');o.value=s;o.textContent=label(s);
    if(s===deckContext)o.selected=true;
    (og||sel).appendChild(o);
  }
  sel.addEventListener('change',()=>{deckContext=sel.value;deckQueue=null;renderDeck();});
  asLine.appendChild(sel);
  asLine.append(' · cited by '+inCount(deckContext)+', cites '+outCount(deckContext));
  wrap.appendChild(asLine);

  const stage=el('div','deckstage');stage.id='deckstage';
  wrap.appendChild(stage);

  const btns=el('div','deckbtns');
  const bNope=el('button','rbtn nope','✕');bNope.setAttribute('aria-label','Pass');
  const bInfo=el('button','rbtn info','i');bInfo.setAttribute('aria-label','Full profile');
  const bLike=el('button','rbtn like','❤︎');bLike.setAttribute('aria-label','Cite-worthy');
  bNope.addEventListener('click',()=>swipeTop(-1));
  bLike.addEventListener('click',()=>swipeTop(1));
  bInfo.addEventListener('click',()=>{const s=deckQueue&&deckQueue[0];if(s)openProfile(s);});
  btns.append(bNope,bInfo,bLike);
  wrap.appendChild(btns);
  wrap.appendChild(el('p','deckhelp','Drag the card, or press <kbd>←</kbd> to pass and <kbd>→</kbd> to cite. Tap a card to read the page behind it.'));
  view.appendChild(wrap);
  paintStack();
  window.scrollTo(0,0);
}
function deckCard(slug,ctx){
  const card=el('div','pcard');
  card.dataset.slug=slug;
  const age=ageDays(slug);
  const b=bio(slug);
  card.innerHTML=
    '<div class="photo">'+faceHTML(slug)
    +'<div class="stamp like">CITE</div><div class="stamp nope">PASS</div></div>'
    +'<div class="body">'
    +'<h2>'+esc(label(slug))+(age!=null?', <span class="age">'+age+' days</span>':'')+'</h2>'
    +'<div class="meta">'+esc(distanceText(ctx,slug))+' · cited by '+inCount(slug)+' · '+(G.words[slug]||0).toLocaleString('en')+' words</div>'
    +'<div class="bio">'+b.map(esc).join(' ')+'</div>'
    +'<div class="chips">'
    +(pages[slug].tags||[]).slice(0,3).map(t=>'<span class="chip">'+esc(t)+'</span>').join('')
    +codeLangs(slug).slice(0,2).map(l=>'<span class="chip violet">'+esc(l)+'</span>').join('')
    +'</div></div>';
  return card;
}
function paintStack(){
  const stage=$('#deckstage');if(!stage)return;
  stage.innerHTML='';
  if(!deckQueue||!deckQueue.length){
    stage.appendChild(el('div','deckempty','You’ve seen all 289 other pages. That’s dedication. Change who you’re swiping as, or go say hi to your <a href="#matches">matches</a>.'));
    return;
  }
  const ctx=deckContext;
  for(let i=Math.min(2,deckQueue.length-1);i>=0;i--){
    const card=deckCard(deckQueue[i],ctx);
    if(i===1)card.classList.add('under1');
    if(i===2)card.classList.add('under2');
    stage.appendChild(card);
    if(i===0)attachDrag(card);
  }
}
function attachDrag(card){
  let sx=0,sy=0,dx=0,dy=0,dragging=false,moved=false;
  const onMove=e=>{
    if(!dragging)return;
    dx=e.clientX-sx;dy=e.clientY-sy;
    if(Math.abs(dx)>6||Math.abs(dy)>6)moved=true;
    card.style.transform='translate('+dx+'px,'+(dy*0.25)+'px) rotate('+(dx/16)+'deg)';
    card.querySelector('.stamp.like').style.opacity=Math.max(0,Math.min(1,dx/90));
    card.querySelector('.stamp.nope').style.opacity=Math.max(0,Math.min(1,-dx/90));
  };
  const onUp=()=>{
    if(!dragging)return;dragging=false;
    card.classList.remove('dragging');
    document.removeEventListener('pointermove',onMove);
    document.removeEventListener('pointerup',onUp);
    if(Math.abs(dx)>110){commitSwipe(card,dx>0?1:-1,dy);}
    else{
      card.classList.add('settle');
      card.style.transform='';
      card.querySelectorAll('.stamp').forEach(s=>s.style.opacity=0);
      setTimeout(()=>card.classList.remove('settle'),400);
      if(!moved){const s=card.dataset.slug;location.hash='#'+s;}
    }
    dx=dy=0;
  };
  card.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    dragging=true;moved=false;sx=e.clientX;sy=e.clientY;
    card.classList.add('dragging');
    document.addEventListener('pointermove',onMove);
    document.addEventListener('pointerup',onUp);
  });
}
function swipeTop(dir){
  const stage=$('#deckstage');if(!stage)return;
  const card=stage.querySelector('.pcard:not(.under1):not(.under2)');
  if(!card)return;
  commitSwipe(card,dir,0);
}
function commitSwipe(card,dir,dy){
  const slug=card.dataset.slug;
  const finish=()=>{
    deckQueue.shift();
    paintStack();
    judge(slug,dir);
  };
  if(REDUCED){finish();return;}
  card.classList.add('fly');
  card.style.transform='translate('+(dir*640)+'px,'+((dy||0)*0.25-40)+'px) rotate('+(dir*24)+'deg)';
  card.style.opacity='0';
  const st=card.querySelector(dir>0?'.stamp.like':'.stamp.nope');if(st)st.style.opacity=1;
  setTimeout(finish,300);
}
function judge(slug,dir){
  if(dir<0)return;
  const ctx=deckContext;
  const iCite=edgeSet.has(ctx+'|'+slug),theyCite=edgeSet.has(slug+'|'+ctx);
  if(iCite&&theyCite){openMatch(ctx,slug);return;}
  if(theyCite)toast('Plot twist: '+label(slug)+' already cites you — you never cite them back. Awkward.');
  else if(iCite)toast('They don’t cite you back (yet).');
  else toast('No citations between you two. Every great love starts somewhere.');
}

/* ================= MATCH overlay + confetti ================= */
function openMatch(a,b){
  clearTimeout(toastT);$('#toast').classList.remove('show');
  const spotA=citeSpot(a,b),spotB=citeSpot(b,a);
  const sheet=openOverlay();
  sheet.innerHTML=
    '<h2 class="matchtitle">It’s a match!</h2>'
    +'<div class="matchsub">A mutual citation. The realest kind of love in a link graph.</div>'
    +'<div class="matchfaces"><div class="face">'+faceHTML(a)+'</div><div class="face">'+faceHTML(b)+'</div></div>'
    +'<div style="font-family:var(--serif);font-weight:700">'+esc(label(a))+' <span style="color:var(--terra);font-style:italic">&amp;</span> '+esc(label(b))+'</div>'
    +'<div class="matchwhy"><b>Why it’s real:</b> you cite them '+citePhrase(spotA,'')+', and they cite you '+citePhrase(spotB,'')+'. It’s in the documentation.</div>'
    +'<div class="btnrow"></div>';
  const row=sheet.querySelector('.btnrow');
  const chatB=el('button','btn primary','Send a message');
  chatB.addEventListener('click',()=>openChat(a,b));
  const readB=el('a','btn ghost','Read their page');readB.href='#'+b;
  const keepB=el('button','btn ghost','Keep swiping');
  keepB.addEventListener('click',closeOverlay);
  row.append(chatB,readB,keepB);
  confetti(a+'|'+b);
}
function confetti(key){
  if(REDUCED)return;
  const cv=$('#confetti');const ctx2=cv.getContext('2d');
  cv.width=innerWidth;cv.height=innerHeight;
  const rng=rngFor('confetti'+key);
  const colors=['#4945ff','#c65f3d','#d9a03f','#e8a3a0','#fff3dd','#5f8a56'];
  const parts=[];
  for(let i=0;i<130;i++){
    const side=i%2?0:1;
    parts.push({
      x:side?cv.width+10:-10,y:cv.height*0.75-rng()*80,
      vx:(side?-1:1)*(4+rng()*7),vy:-(7+rng()*7),
      g:0.22+rng()*0.1,w:5+rng()*7,h:3+rng()*5,
      c:pick(rng,colors),r:rng()*Math.PI,vr:(rng()-0.5)*0.3
    });
  }
  const t0=performance.now();
  function frame(t){
    ctx2.clearRect(0,0,cv.width,cv.height);
    if(t-t0>2600){ctx2.clearRect(0,0,cv.width,cv.height);return;}
    for(const p of parts){
      p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.vx*=0.992;p.r+=p.vr;
      ctx2.save();ctx2.translate(p.x,p.y);ctx2.rotate(p.r);
      ctx2.fillStyle=p.c;ctx2.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx2.restore();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ================= CHAT ================= */
function openChat(a,b){
  const sheet=openOverlay('chatsheet');
  const rng=rngFor('chat'+a+'|'+b);
  const qa=shuffled(quotes(a),rng).slice(0,3);
  const qb=shuffled(quotes(b),rng).slice(0,3);
  let html='<div class="chathead">'
    +'<div class="face">'+faceHTML(a)+'</div><div class="face">'+faceHTML(b)+'</div>'
    +'<div><h3>'+esc(label(a))+' &amp; '+esc(label(b))+'</h3>'
    +'<div class="sub">Matched on a mutual citation · every line below is a verbatim quote from their pages</div></div></div>'
    +'<div class="chatsys">You cited each other. Say something.</div>';
  const n=Math.max(qa.length,qb.length);
  for(let i=0;i<n;i++){
    if(qa[i])html+='<div class="msg right"><div class="bubble">'+esc(qa[i])+'</div><div class="who">'+esc(label(a))+'</div></div>';
    if(qb[i])html+='<div class="msg left"><div class="bubble">'+esc(qb[i])+'</div><div class="who">'+esc(label(b))+'</div></div>';
  }
  html+='<div class="chatfoot"><a class="btn ghost" href="#'+esc(a)+'">Read '+esc(label(a))+'</a><a class="btn ghost" href="#'+esc(b)+'">Read '+esc(label(b))+'</a></div>';
  sheet.innerHTML=html;
}

/* ================= PROFILE DETAIL / COMPATIBILITY ================= */
function openProfile(slug){
  const other=(currentSlug&&currentSlug!==slug)?currentSlug:(deckContext!==slug?deckContext:lastRead&&lastRead!==slug?lastRead:null);
  const sheet=openOverlay('chatsheet');
  const p=pages[slug],pv=prov(slug),age=ageDays(slug);
  let html='<div class="chathead"><div class="face">'+faceHTML(slug)+'</div>'
    +'<div><h3>'+esc(label(slug))+(age!=null?' · '+age+' days':'')+'</h3>'
    +'<div class="sub">'+esc(p.section)+' · '+esc(p.product.toUpperCase())+' · first commit '+esc(pv.first||'?')+'</div></div></div>';
  html+='<p style="font-size:.95rem">'+bio(slug).map(esc).join(' ')+'</p>';
  html+='<div class="compatgrid">';
  html+=compatRow('✍','Written by <b>'+pv.authors.map(esc).join(', ')+'</b> over '+pv.commits+' commits. '+esc(pv.topAuthor)+' committed most.');
  const cc=commOf[slug];
  if(cc)html+=compatRow('●','Runs with the <b>“'+esc(cc.dominant)+'”</b> crowd (link community of '+(COMM[cc.id].size)+' pages, purity '+Math.round(cc.purity*100)+'%).');
  if(other&&pages[other]){
    html+='<div style="font-weight:700;margin-top:.4rem">Compatibility with '+esc(label(other))+'</div>';
    const shared=(p.tags||[]).filter(t=>(pages[other].tags||[]).includes(t));
    if(shared.length)html+=compatRow('❤︎','Shared interests: <b>'+shared.map(esc).join(', ')+'</b>.');
    else html+=compatRow('☁','No shared tags. Opposites attract, allegedly.');
    const co=commOf[other];
    if(cc&&co&&cc.id===co.id)html+=compatRow('⌂','Same corner of the café: both in the “'+esc(cc.dominant)+'” community.');
    const d=bfsDistance(slug,other,6);
    html+=compatRow('⇄',d===null?'More than 6 citations apart. A slow burn.':d===1?'<b>Directly linked.</b> One citation apart.':'<b>'+d+' citations apart</b> in the link graph.');
    const sa=pv.authors.filter(x=>prov(other).authors.includes(x));
    if(sa.length)html+=compatRow('☺','You both know <b>'+sa.map(esc).join(', ')+'</b>.');
    if(isMutual(slug,other))html+=compatRow('★','<b>You already cite each other.</b> This is a match waiting to be swiped.');
  }
  html+='</div>';
  html+='<div class="btnrow"><a class="btn primary" href="#'+esc(slug)+'">Read their page</a></div>';
  sheet.innerHTML=html;
}
function compatRow(ico,html){return '<div class="compatrow"><span class="ico" aria-hidden="true">'+ico+'</span><span>'+html+'</span></div>';}

/* ================= MATCHES view ================= */
function renderMatches(){
  currentSlug=null;
  const view=$('#view');view.innerHTML='';
  view.innerHTML='<div class="pagehead"><h1>'+mutualPairs.length+' matches, <em>zero small talk</em></h1>'
    +'<p class="lead">Each pair below genuinely cites the other — measured straight from the link graph. Open one to see them chat in verbatim quotes from their own pages.</p></div>';
  const wrap=el('div','wrap');const grid=el('div','grid');
  const rng=rngFor('matchorder');
  for(const [a,b] of shuffled(mutualPairs,rng)){
    const shared=(pages[a].tags||[]).filter(t=>(pages[b].tags||[]).includes(t)).length;
    const ca=commOf[a],cb=commOf[b];
    const sub=(ca&&cb&&ca.id===cb.id?'same “'+ca.dominant+'” community':'cross-community')
      +(shared?' · '+shared+' shared tag'+(shared>1?'s':''):'');
    const row=el('button','mrow');
    row.innerHTML='<div class="faces"><div class="face">'+faceHTML(a)+'</div><div class="face">'+faceHTML(b)+'</div></div>'
      +'<div><div class="names">'+esc(label(a))+' <span class="x">&amp;</span> '+esc(label(b))+'</div>'
      +'<div class="sub">'+esc(sub)+'</div></div>';
    row.addEventListener('click',()=>openChat(a,b));
    grid.appendChild(row);
  }
  wrap.appendChild(grid);view.appendChild(wrap);
  window.scrollTo(0,0);
}

/* ================= SINGLES view ================= */
function renderSingles(){
  currentSlug=null;
  const view=$('#view');view.innerHTML='';
  view.innerHTML='<div class="pagehead"><h1>In their DMs: <em>nobody. Yet.</em></h1>'
    +'<p class="lead">'+singles.length+' pages that no other page links to. Great content, zero inbound citations. Be their first: the ★ button copies a ready-made link suggestion.</p></div>';
  const wrap=el('div','wrap');const grid=el('div','grid');
  const rng=rngFor('singlesorder');
  for(const s of shuffled(singles,rng)){
    const p=pages[s];
    const card=el('div','scard');
    const age=ageDays(s);
    card.innerHTML='<h3><a href="#'+esc(s)+'">'+esc(label(s))+'</a></h3>'
      +'<div class="sub">'+esc(p.section)+' · '+(age!=null?age+' days old · ':'')+(G.words[s]||0).toLocaleString('en')+' words · tended by '+esc(prov(s).topAuthor)+'</div>'
      +'<div class="bio">'+esc(bio(s)[0])+'</div>'
      +'<div class="actions"></div>';
    const act=card.querySelector('.actions');
    const superB=el('button','btn small gold','★ Super-like');
    superB.title='Copy a link suggestion for this page';
    superB.addEventListener('click',()=>superLike(s));
    const readB=el('a','btn small ghost','Read');readB.href='#'+s;
    act.append(superB,readB);
    grid.appendChild(card);
  }
  wrap.appendChild(grid);view.appendChild(wrap);
  window.scrollTo(0,0);
}
function bestMatchmaker(slug){ // a well-cited page in the same section, else the page it cites most naturally
  const sec=pages[slug].section,prod=pages[slug].product;
  let best=null,bestIn=-1;
  for(const s of order){
    if(s===slug||pages[s].section!==sec||pages[s].product!==prod)continue;
    if(inCount(s)>bestIn){bestIn=inCount(s);best=s;}
  }
  if(best)return best;
  const outs=[...(outbound[slug]||[])];
  return outs[0]||'/cms/intro';
}
function superLike(slug){
  const src=bestMatchmaker(slug);
  const snippet='Link suggestion: add a link to "'+label(slug)+'" ('+slug+') from "'+label(src)+'" ('+src+'). It currently has zero inbound links and '+(G.words[slug]||0)+' words waiting to be discovered.';
  const done=()=>toast('Copied! Go play matchmaker: suggest the link from “'+label(src)+'”.');
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(snippet).then(done,()=>fallbackCopy(snippet,done));
  }else fallbackCopy(snippet,done);
}
function fallbackCopy(text,done){
  const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';
  document.body.appendChild(ta);ta.select();
  try{document.execCommand('copy');done();}catch(e){toast('Copy failed — but the thought counts.');}
  ta.remove();
}

/* ================= BROWSE view ================= */
function renderBrowse(){
  currentSlug=null;
  const view=$('#view');view.innerHTML='';
  view.innerHTML='<div class="pagehead"><h1>All 290 profiles, <em>no algorithm</em></h1>'
    +'<p class="lead">The whole documentation, arranged by section. The number is how many pages cite each one.</p></div>';
  const wrap=el('div','wrap');
  nav.forEach(sec=>{
    if(!sec.items||!sec.items.length)return;
    const box=el('section','browse-section');
    box.appendChild(el('h2',null,esc(sec.label)+' <span class="count">'+esc((sec.product||'').toUpperCase())+' · '+sec.items.length+' pages</span>'));
    const ul=el('ul','blist');
    for(const it of sec.items){
      if(!pages[it.slug])continue;
      const inb=inCount(it.slug);
      const li=el('li');
      li.innerHTML='<a href="#'+esc(it.slug)+'"><span>'+esc(it.label||label(it.slug))+'</span><span class="in'+(inb>=15?' hot':'')+'">'+(inb?'❤ '+inb:'♡')+'</span></a>';
      ul.appendChild(li);
    }
    box.appendChild(ul);wrap.appendChild(box);
  });
  view.appendChild(wrap);
  window.scrollTo(0,0);
}

/* ================= overlay / toast ================= */
function openOverlay(extraCls){
  closeOverlay();
  const root=$('#overlayRoot');
  const ov=el('div','overlay');
  ov.addEventListener('click',e=>{if(e.target===ov)closeOverlay();});
  const sheet=el('div','sheet'+(extraCls?' '+extraCls:''));
  const close=el('button','close','×');close.setAttribute('aria-label','Close');
  close.addEventListener('click',closeOverlay);
  ov.appendChild(sheet);
  root.appendChild(ov);
  // close button added after content is set, so keep it outside innerHTML flows:
  const obs=new MutationObserver(()=>{if(!sheet.querySelector('.close'))sheet.appendChild(close);});
  obs.observe(sheet,{childList:true});
  sheet.appendChild(close);
  return sheet;
}
function closeOverlay(){$('#overlayRoot').innerHTML='';}
let toastT=null;
function toast(msg){
  const t=$('#toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),3400);
}

/* ================= search ================= */
function setupSearch(){
  const input=$('#search'),res=$('#searchResults');
  let selIdx=-1,items=[];
  function hide(){res.hidden=true;selIdx=-1;}
  function show(list){
    items=list;
    if(!list.length){res.innerHTML='<div class="none">No profile matches. They’re not on the app.</div>';res.hidden=false;return;}
    res.innerHTML=list.map((s,i)=>'<a href="#'+esc(s)+'" data-i="'+i+'"><div class="sr-title">'+esc(label(s))+'</div><div class="sr-sec">'+esc(pages[s].section)+' · cited by '+inCount(s)+'</div></a>').join('');
    res.hidden=false;
  }
  input.addEventListener('input',()=>{
    const q=input.value.trim().toLowerCase();
    if(q.length<2){hide();return;}
    const hits=order.filter(s=>{
      const p=pages[s];
      return label(s).toLowerCase().includes(q)||s.includes(q)
        ||(p.description||'').toLowerCase().includes(q)
        ||(p.tags||[]).some(t=>t.toLowerCase().includes(q));
    }).slice(0,12);
    show(hits);
  });
  input.addEventListener('keydown',e=>{
    if(res.hidden)return;
    if(e.key==='ArrowDown'){selIdx=Math.min(items.length-1,selIdx+1);}
    else if(e.key==='ArrowUp'){selIdx=Math.max(0,selIdx-1);}
    else if(e.key==='Enter'){if(items[selIdx>=0?selIdx:0]){location.hash='#'+items[selIdx>=0?selIdx:0];hide();input.blur();}return;}
    else if(e.key==='Escape'){hide();return;}
    else return;
    e.preventDefault();
    res.querySelectorAll('a').forEach((a,i)=>a.classList.toggle('sel',i===selIdx));
  });
  input.addEventListener('blur',()=>setTimeout(hide,180));
}

/* ================= keyboard swiping ================= */
function setupKeys(){
  document.addEventListener('keydown',e=>{
    if(e.target.matches('input,select,textarea'))return;
    if($('#overlayRoot').children.length){if(e.key==='Escape')closeOverlay();return;}
    if(!$('#deckstage'))return;
    if(e.key==='ArrowLeft'){e.preventDefault();swipeTop(-1);}
    else if(e.key==='ArrowRight'){e.preventDefault();swipeTop(1);}
  });
}

boot().catch(err=>{
  $('#view').innerHTML='<div class="wrap"><p>Could not load the data files: '+esc(err.message)+'</p></div>';
});
