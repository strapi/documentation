'use strict';
const fs=require('fs');
function mulberry32(seed){let a=seed>>>0;return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
const SEED=1898;
function rngFor(tag){let h=SEED;for(let i=0;i<tag.length;i++)h=(Math.imul(h,31)+tag.charCodeAt(i))|0;return mulberry32(h>>>0);}
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
const graph=JSON.parse(fs.readFileSync('graph.json'));
const communities=JSON.parse(fs.readFileSync('communities.json'));
const content=JSON.parse(fs.readFileSync('content.json'));
const of={};communities.forEach((c,i)=>c.members.forEach(m=>{of[m]=i;}));
const laneMap=new Map();let inter=0;
for(const [a,b] of graph.edges){const ca=of[a],cb=of[b];if(ca==null||cb==null)continue;if(ca===cb)continue;inter++;const i=Math.min(ca,cb),j=Math.max(ca,cb);const key=i+'-'+j;let L=laneMap.get(key);if(!L){L={i,j,total:0,ij:0,ji:0};laneMap.set(key,L);}L.total++;if(ca===i)L.ij++;else L.ji++;}
const lanes=[...laneMap.values()];lanes.sort((a,b)=>b.total-a.total);
const n=communities.length;const rnd=rngFor('layout');const pos=[];
for(let k=0;k<n;k++){const ang=k*2.399963+rnd()*0.35;const rad=0.35+0.65*Math.sqrt((k+1)/n);pos.push({x:Math.cos(ang)*rad,y:Math.sin(ang)*rad});}
const REST=0.55;
for(let it=0;it<260;it++){const fx=new Array(n).fill(0),fy=new Array(n).fill(0);
for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){let dx=pos[b].x-pos[a].x,dy=pos[b].y-pos[a].y;let d2=dx*dx+dy*dy+1e-4,d=Math.sqrt(d2);const rep=0.012/d2;fx[a]-=dx/d*rep;fy[a]-=dy/d*rep;fx[b]+=dx/d*rep;fy[b]+=dy/d*rep;}
for(const L of lanes){const a=L.i,b=L.j;let dx=pos[b].x-pos[a].x,dy=pos[b].y-pos[a].y;const d=Math.sqrt(dx*dx+dy*dy)+1e-6;const k=0.012*Math.log(1+L.total)*(d-REST);fx[a]+=dx/d*k;fy[a]+=dy/d*k;fx[b]-=dx/d*k;fy[b]-=dy/d*k;}
const cool=1-it/300;for(let k=0;k<n;k++){pos[k].x+=clamp(fx[k],-0.05,0.05)*cool;pos[k].y+=clamp(fy[k],-0.05,0.05)*cool;}}
let minx=9,maxx=-9,miny=9,maxy=-9;
pos.forEach(p=>{minx=Math.min(minx,p.x);maxx=Math.max(maxx,p.x);miny=Math.min(miny,p.y);maxy=Math.max(maxy,p.y);});
console.log('community layout extent x',minx.toFixed(3),maxx.toFixed(3),'y',miny.toFixed(3),maxy.toFixed(3));
// nearest-neighbour community distances
let nn=[];for(let a=0;a<n;a++){let best=9;for(let b=0;b<n;b++){if(a===b)continue;best=Math.min(best,Math.hypot(pos[a].x-pos[b].x,pos[a].y-pos[b].y));}nn.push(best);}
nn.sort((a,b)=>a-b);
console.log('community NN dist min/med/max',nn[0].toFixed(3),nn[13].toFixed(3),nn[26].toFixed(3));
console.log('nmPerUnit 4.2 -> NN nm', (nn[0]*4.2).toFixed(2), (nn[13]*4.2).toFixed(2), (nn[26]*4.2).toFixed(2));
