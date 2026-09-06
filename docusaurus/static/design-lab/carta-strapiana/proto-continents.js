/* Prototype: two-continent province packing, to tune constants before it goes
   into the build. Mirrors the intended in-page algorithm exactly. */
'use strict';
const c = require('./content.json'), g = require('./graph.json'), comms = require('./communities.json');
const NM = 16.0; // nmPerUnit
function mulberry32(seed){let a=seed>>>0;return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function rngFor(tag){let h=1898;for(let i=0;i<tag.length;i++)h=(Math.imul(h,31)+tag.charCodeAt(i))|0;return mulberry32(h>>>0);}
const of={};comms.forEach((cm,i)=>cm.members.forEach(m=>of[m]=i));
/* provinces: a community's pages of one product make one province */
const provinces=[];
comms.forEach((cm,ci)=>{
  const by={cms:[],cloud:[]};
  for(const m of cm.members){const p=c.pages[m];if(!p)continue;(by[p.product]||(by[p.product]=[])).push(m);}
  for(const prod of ['cms','cloud']){
    const mem=by[prod]; if(!mem||!mem.length) continue;
    const hasHub=mem.indexOf(cm.hub)>=0;
    let hub=hasHub?cm.hub:mem.slice().sort((a,b)=>(g.inbound[b]||0)-(g.inbound[a]||0))[0];
    provinces.push({comm:ci,product:prod,members:mem,hub,primary:hasHub,size:mem.length});
  }
});
/* lane weight between communities */
const laneW={};
for(const [a,b] of g.edges){const ca=of[a],cb=of[b];if(ca==null||cb==null||ca===cb)continue;const k=Math.min(ca,cb)+'-'+Math.max(ca,cb);laneW[k]=(laneW[k]||0)+1;}
const SPACING_NM=1.05;
const archScaleNm=n=>n<=1?0:0.58*SPACING_NM*Math.sqrt(n)+0.30;
const MARGIN_NM=0.85;
for(const P of provinces) P.r=(archScaleNm(P.size)+MARGIN_NM)/NM;
function affinity(A,B){
  if(A.comm===B.comm) return 40; // same community split across... only across continents; unused inside one
  const k=Math.min(A.comm,B.comm)+'-'+Math.max(A.comm,B.comm);
  return laneW[k]||0;
}
function pack(list,tag){
  const rnd=rngFor('pack:'+tag);
  const L=list.slice().sort((a,b)=>b.size-a.size||a.comm-b.comm);
  const placed=[];
  for(const P of L){
    if(!placed.length){P.x=0;P.y=0;placed.push(P);continue;}
    /* anchor: the placed province this one cites hardest; fallback the biggest */
    let anchor=placed[0],aw=-1;
    for(const Q of placed){const w=affinity(P,Q);if(w>aw){aw=w;anchor=Q;}}
    let best=null,bc=1e18;
    for(let s=0;s<64;s++){
      const th=s/64*Math.PI*2+rnd()*0.001;
      for(const f of [1.0,1.12,1.28,1.5]){
        const d=(P.r+anchor.r)*f;
        const x=anchor.x+Math.cos(th)*d, y=anchor.y+Math.sin(th)*d;
        let ok=true;
        for(const Q of placed){const dd=Math.hypot(Q.x-x,Q.y-y);if(dd<(Q.r+P.r)*0.96){ok=false;break;}}
        if(!ok)continue;
        /* compact: near mass centre, and near the anchor */
        const cost=Math.hypot(x,y)*1.0+Math.hypot(x-anchor.x,y-anchor.y)*0.4;
        if(cost<bc){bc=cost;best=[x,y];}
        break; // first non-overlapping f for this angle
      }
    }
    if(!best){P.x=(rnd()-0.5);P.y=(rnd()-0.5);} else {P.x=best[0];P.y=best[1];}
    placed.push(P);
  }
  /* relax: pull to centre, keep separation */
  for(let it=0;it<160;it++){
    for(const P of L){const m=Math.hypot(P.x,P.y)||1;const pull=Math.min(0.004,m*0.02);P.x-=P.x/m*pull;P.y-=P.y/m*pull;}
    for(let a=0;a<L.length;a++)for(let b=a+1;b<L.length;b++){
      const A=L[a],B=L[b];let dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy);
      const need=(A.r+B.r)*0.97;
      if(d<need){if(d<1e-9){dx=1e-6;dy=0;d=1e-6;}const push=(need-d)/d*0.5;A.x-=dx*push;A.y-=dy*push;B.x+=dx*push;B.y+=dy*push;}
    }
  }
  return L;
}
const cmsP=provinces.filter(p=>p.product==='cms');
const cloudP=provinces.filter(p=>p.product==='cloud');
pack(cmsP,'cms'); pack(cloudP,'cloud');
function hullR(list){let r=0;for(const P of list)r=Math.max(r,Math.hypot(P.x,P.y)+P.r);return r;}
const Rc=hullR(cmsP), Rl=hullR(cloudP);
const GAP_NM=11.5;
/* CMS west of centre, Cloud to the east-north-east */
const cx=-(Rl+GAP_NM/NM)*0.45, cy=0.0;
const lx=cx+Rc+GAP_NM/NM+Rl, ly=-(Rc*0.36);
for(const P of cmsP){P.x+=cx;P.y+=cy;}
for(const P of cloudP){P.x+=lx;P.y+=ly;}
console.log('CMS provinces',cmsP.length,'hull r nm',(Rc*NM).toFixed(1));
console.log('Cloud provinces',cloudP.length,'hull r nm',(Rl*NM).toFixed(1));
/* min gap between continents' province rims */
let minGap=1e9;
for(const A of cmsP)for(const B of cloudP){minGap=Math.min(minGap,(Math.hypot(A.x-B.x,A.y-B.y)-A.r-B.r)*NM);}
console.log('sea gap between continents nm',minGap.toFixed(2));
/* extent incl orphan rim */
let minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;
for(const P of provinces){minx=Math.min(minx,P.x-P.r);maxx=Math.max(maxx,P.x+P.r);miny=Math.min(miny,P.y-P.r);maxy=Math.max(maxy,P.y+P.r);}
console.log('extent nm',((maxx-minx)*NM).toFixed(1),'x',((maxy-miny)*NM).toFixed(1));
/* neighbour gaps within CMS: how far apart do provinces sit (rim to rim)? */
const gaps=[];
for(let a=0;a<cmsP.length;a++){let best=1e9;for(let b=0;b<cmsP.length;b++){if(a===b)continue;const A=cmsP[a],B=cmsP[b];best=Math.min(best,(Math.hypot(A.x-B.x,A.y-B.y)-A.r-B.r)*NM);}gaps.push(best);}
gaps.sort((x,y)=>x-y);
console.log('CMS nearest rim gaps nm: min',gaps[0].toFixed(2),'median',gaps[Math.floor(gaps.length/2)].toFixed(2),'max',gaps[gaps.length-1].toFixed(2));
console.log(JSON.stringify(provinces.map(P=>({c:P.comm,p:P.product,n:P.size,x:+(P.x*NM).toFixed(1),y:+(P.y*NM).toFixed(1),r:+(P.r*NM).toFixed(1),hub:P.hub})),null,0).slice(0,1200));
